const facebook = {}

facebook.login = (res, env) => {
  // get login endpoint
  const endpoint = "https://www.facebook.com/v19.0/dialog/oauth"
  // get query params
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    scope: "email,public_profile"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

facebook.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://graph.facebook.com/v18.0/oauth/access_token"
    // get query params
    const query = new URLSearchParams({
      code: req.query.code,
      client_id: env.client_id,
      client_secret: env.client_secret,
      redirect_uri: env.redirect_uri
    })
    // request token by code
    fetch(`${endpoint}?${query.toString()}`).then(async resp => {
      // parse response
      const data = await resp.json()
      // check response
      if (resp.status === 200) {
        // return tokens
        resolve({
          client: "facebook",
          data: {
            access_token: data.access_token
          }
        })
      } else {
        // return error
        resolve({
          client: "facebook",
          error: {
            code: data.error.code,
            message: data.error.message
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "facebook",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

facebook.user = (req, res) => {
  fetch("https://graph.facebook.com/v19.0/me?fields=id,name,email", {
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
        client: "facebook",
        data: {
          id: data.id,
          name: data.name,
          email: data.email
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "facebook",
        error: {
          code: data.error.code,
          message: data.error.message
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "facebook",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = facebook
