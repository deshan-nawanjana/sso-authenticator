const discord = {}

discord.login = (res, env) => {
  // get endpoint
  const endpoint = "https://discord.com/api/oauth2/authorize"
  // get params
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    scope: "identify email"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

discord.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://discord.com/api/oauth2/token"
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
          client: "discord",
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }
        })
      } else {
        // return error
        resolve({
          client: "discord",
          error: {
            code: data.code,
            message: data.message
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "discord",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

discord.user = (req, res) => {
  fetch("https://discord.com/api/users/@me", {
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
        client: "discord",
        data: {
          id: data.id,
          name: data.global_name,
          email: data.email
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "discord",
        error: {
          code: data.code,
          message: data.message
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "discord",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = discord
