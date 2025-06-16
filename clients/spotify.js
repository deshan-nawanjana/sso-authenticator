const spotify = {}

spotify.login = (res, env) => {
  // get endpoint
  const endpoint = "https://accounts.spotify.com/authorize"
  // get params
  const query = new URLSearchParams({
    client_id: env.client_id,
    redirect_uri: env.redirect_uri,
    response_type: "code",
    scope: "user-read-private user-read-email"
  })
  // redirect to login
  res.redirect(`${endpoint}?${query.toString()}`)
}

spotify.token = (req, env) => {
  return new Promise(resolve => {
    // get endpoint
    const endpoint = "https://accounts.spotify.com/api/token"
    // get params
    const query = new URLSearchParams({
      code: req.query.code,
      redirect_uri: env.redirect_uri,
      grant_type: "authorization_code"
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
          client: "spotify",
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }
        })
      } else {
        // return error
        resolve({
          client: "spotify",
          error: {
            code: data.error,
            message: null
          }
        })
      }
    }).catch(() => {
      // return error
      resolve({
        client: "spotify",
        error: {
          code: 500,
          message: "Internal server error"
        }
      })
    })
  })
}

spotify.user = (req, res) => {
  fetch("https://api.spotify.com/v1/me", {
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
        client: "spotify",
        data: {
          id: data.id,
          name: data.display_name,
          email: data.email
        }
      })
    } else {
      // return error
      res.status(200).json({
        client: "spotify",
        error: {
          code: data.error.status,
          message: data.error.message
        }
      })
    }
  }).catch(() => {
    // return error
    res.status(500).json({
      client: "spotify",
      error: {
        code: 500,
        message: "Internal server error"
      }
    })
  })
}

module.exports = spotify
