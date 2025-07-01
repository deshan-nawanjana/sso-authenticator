const jwt = require('jsonwebtoken')

const apple = {}

apple.login = (res, env) => {
  // get endpoint
  const endpoint = "https://appleid.apple.com/auth/authorize"
  // get params
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    response_mode: "query"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

apple.token = (req, env) => {
  // generate a token using auth key
  const token = jwt.sign({
    iss: env.team_id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (86400 * 180),
    aud: 'https://appleid.apple.com',
    sub: env.client_id,
  }, env.auth_key, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: env.key_id,
    }
  })
  // return promise
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://appleid.apple.com/auth/token"
    // get params
    const query = new URLSearchParams({
      code: req.query.code,
      client_id: env.client_id,
      client_secret: token,
      redirect_uri: env.redirect_uri,
      grant_type: "authorization_code"
    })
    // request token by code
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: query.toString()
    }).then(async resp => {
      // parse response
      const data = await resp.json()
      // check response
      if (resp.status === 200) {
        // return tokens
        resolve({
          client: "apple",
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            id_token: data.id_token
          }
        })
      } else {
        // return error
        resolve({
          client: "apple",
          error: {
            code: data.error,
            message: data.error_description
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "apple",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

apple.user = (req, res) => {
  // decode id token payload
  const data = jwt.decode(req.query.id_token)
  // check data
  if (data) {
    // return user details
    res.status(200).json({
      client: "apple",
      data: {
        id: data.sub,
        name: null,
        email: data.email
      }
    })
  } else {
    // return error
    res.status(400).json({
      client: "apple",
      error: {
        code: 400,
        message: "Invalid id_token"
      }
    })
  }
}

module.exports = apple
