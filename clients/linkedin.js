const linkedin = {}

linkedin.login = (res, env) => {
  // get endpoint
  const endpoint = "https://www.linkedin.com/oauth/v2/authorization"
  // get params
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    scope: "openid profile email",
    state: "state"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

linkedin.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://www.linkedin.com/oauth/v2/accessToken"
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
          client: "linkedin",
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }
        })
      } else {
        // return error
        resolve({
          client: "linkedin",
          error: {
            code: data.error,
            message: data.error_description
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "linkedin",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

linkedin.user = (req, res) => {
  fetch("https://api.linkedin.com/v2/userinfo", {
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
        client: "linkedin",
        data: {
          id: data.sub,
          name: data.name,
          email: data.email
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "linkedin",
        error: {
          code: data.code,
          message: data.message
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "linkedin",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = linkedin
