const tiktok = {}

tiktok.login = (res, env) => {
  // get endpoint
  const endpoint = "https://www.tiktok.com/v2/auth/authorize"
  // get query
  const query = new URLSearchParams({
    client_key: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    scope: "user.info.basic"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

tiktok.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://open.tiktokapis.com/v2/oauth/token/"
    // get params
    const query = new URLSearchParams({
      code: req.query.code,
      client_key: env.client_id,
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
          client: "tiktok",
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }
        })
      } else {
        // return error
        resolve({
          client: "tiktok",
          error: {
            code: data.error,
            message: data.error_description
          }
        })
      }
    }).catch((err) => {
      // return error
      resolve({
        client: "tiktok",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

tiktok.user = (req, res) => {
  fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", {
    headers: {
      "Authorization": req.headers.authorization
    }
  }).then(async resp => {
    // parse response
    const data = await resp.json()
    // check response
    if (data.data.user) {
      // return tokens
      res.status(200).json({
        client: "tiktok",
        data: {
          id: data.data.user.open_id,
          name: data.data.user.display_name,
          email: null
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "tiktok",
        error: {
          code: data.error.code,
          message: data.error.message
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "tiktok",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = tiktok
