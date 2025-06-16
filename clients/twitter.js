const crypto = require('crypto');

const twitter = {}

twitter.login = (res, env) => {
  // get endpoint
  const endpoint = "https://x.com/i/oauth2/authorize"
  // generate challenge
  const challenge = crypto.randomBytes(32).toString('base64url')
  // get params
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    scope: "users.email users.read tweet.read offline.access",
    code_challenge: challenge,
    code_challenge_method: "plain",
    state: "state"
  })
  // store challenge on cookies
  res.setHeader('Set-Cookie', `twitter_challenge=${challenge}; Path=/; HttpOnly`);
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

twitter.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://api.x.com/2/oauth2/token"
    // get challenge from cookies
    const challenge = (req.headers.cookie.split(/ |;/g).find(item => (
      item.startsWith("twitter_challenge=")
    )) || "=").split("=")[1]
    // get params
    const query = new URLSearchParams({
      code: req.query.code,
      client_id: env.client_id,
      client_secret: env.client_secret,
      redirect_uri: env.redirect_uri,
      grant_type: "authorization_code",
      code_verifier: challenge
    })
    // create basic token
    const token = Buffer.from(`${env.client_id}:${env.client_secret}`).toString('base64')
    // request token by code
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + token,
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
          client: "twitter",
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }
        })
      } else {
        // return error
        resolve({
          client: "twitter",
          error: {
            code: data.error,
            message: data.error_description
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "twitter",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

twitter.user = (req, res) => {
  fetch("https://api.twitter.com/2/users/me", {
    headers: {
      "Authorization": req.headers.authorization
    }
  }).then(async resp => {
    // parse response
    const data = await resp.json()
    // check response
    if (resp.status === 200) {
      // return tokens
      res.status(200).json({
        client: "twitter",
        data: {
          id: data.data.id,
          name: data.data.name,
          email: null
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "twitter",
        error: {
          code: data.status,
          message: data.detail
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "twitter",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = twitter
