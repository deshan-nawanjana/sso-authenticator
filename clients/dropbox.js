const dropbox = {}

dropbox.login = (res, env) => {
  // get endpoint
  const endpoint = "https://www.dropbox.com/oauth2/authorize"
  // get params
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    scope: 'openid email profile',
    token_access_type: "offline"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

dropbox.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://api.dropboxapi.com/oauth2/token"
    // get params
    const query = new URLSearchParams({
      code: req.query.code,
      client_id: env.client_id,
      client_secret: env.client_secret,
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
          client: "dropbox",
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }
        })
      } else {
        // return error
        resolve({
          client: "dropbox",
          error: {
            code: data.error,
            message: data.error_description
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "dropbox",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

dropbox.user = (req, res) => {
  fetch("https://api.dropboxapi.com/2/openid/userinfo", {
    method: "POST",
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
        client: "dropbox",
        data: {
          id: data.sub,
          name: `${data.given_name} ${data.family_name}`,
          email: data.email
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "dropbox",
        error: {
          code: data.error[".tag"],
          message: null
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "dropbox",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = dropbox
