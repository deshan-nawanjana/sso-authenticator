const github = {}

github.login = (res, env) => {
  // get endpoint
  const endpoint = "https://github.com/login/oauth/authorize"
  // get query
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    scope: "user:email"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

github.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://github.com/login/oauth/access_token"
    // get payload
    const payload = {
      code: req.query.code,
      client_id: env.client_id,
      client_secret: env.client_secret,
      redirect_uri: env.redirect_uri
    }
    // request token by code
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(async resp => {
      // parse response
      const data = await resp.json()
      // check response
      if (resp.status === 200) {
        // return tokens
        resolve({
          client: "github",
          data: {
            access_token: data.access_token
          }
        })
      } else {
        // return error
        resolve({
          client: "github",
          error: {
            code: data.error,
            message: data.error_description
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "github",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

github.user = (req, res) => {
  fetch("https://api.github.com/user", {
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
        client: "github",
        data: {
          id: data.id,
          name: data.name,
          email: data.email
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "github",
        error: {
          code: data.status,
          message: data.message
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "github",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = github
