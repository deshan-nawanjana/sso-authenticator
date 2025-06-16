const gitlab = {}

gitlab.login = (res, env) => {
  // get endpoint
  const endpoint = "https://gitlab.com/oauth/authorize"
  // get query
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    scope: "read_user"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

gitlab.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://gitlab.com/oauth/token"
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
          client: "gitlab",
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }
        })
      } else {
        // return error
        resolve({
          client: "gitlab",
          error: {
            code: data.error,
            message: data.error_description
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "gitlab",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

gitlab.user = (req, res) => {
  fetch("https://gitlab.com/api/v4/user", {
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
        client: "gitlab",
        data: {
          id: data.id,
          name: data.name,
          email: data.email
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "gitlab",
        error: {
          code: null,
          message: data.message
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "gitlab",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = gitlab
