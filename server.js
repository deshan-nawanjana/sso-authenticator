// import modules
const express = require("express")
const https = require("https")
const fs = require("fs")

// import clients
const google = require("./clients/google")
const facebook = require("./clients/facebook")
const twitter = require("./clients/twitter")
const linkedin = require("./clients/linkedin")
const yahoo = require("./clients/yahoo")
const github = require("./clients/github")
const gitlab = require("./clients/gitlab")
const discord = require("./clients/discord")
const spotify = require("./clients/spotify")
const dropbox = require("./clients/dropbox")

// authentication clients
const clients = { google, facebook, twitter, linkedin, yahoo, github, gitlab, discord, spotify, dropbox }

// load server config
const config = JSON.parse(fs.readFileSync("config.json"))

// create message script
const message = `
<script>
  (window.opener || window.parent).postMessage(JSON, "${config.origin}")
  window.close()
</script>
`

// create express app
const app = express()

// serve static directory
app.use(express.static("public"))

// enable json payload
app.use(express.json())

// endpoint to request sso clients
app.get("/api/sso/client/:id", (req, res) => {
  // find client by id
  const client = config.clients.find(item => item.id === req.params.id)
  // return if no client
  if (!client) { return res.status(400).json({ error: "Invalid client" }) }
  // request login
  clients[client.id].login(res, client.env)
})

// endpoint to request auth token
app.get("/api/sso/callback/:id", async (req, res) => {
  // find client by id
  const client = config.clients.find(item => item.id === req.params.id)
  // return if no client
  if (!client) { return res.status(400).json({ error: "Invalid client" }) }
  // request tokens
  const data = await clients[client.id].token(req, client.env)
  // return callback message script
  res.status(200).send(`
    <script>
      const target = window.opener || window.parent
      target.postMessage(${JSON.stringify(data)}, "${config.origin}")
      window.close()
    </script>
  `)
})

// endpoint to request user details
app.get("/api/sso/user/:id", (req, res) => {
  // find client by id
  const client = config.clients.find(item => item.id === req.params.id)
  // return if no client
  if (!client) { return res.status(400).json({ error: "Invalid client" }) }
  // request login
  clients[client.id].user(req, res)
})

// start server
https.createServer({
  key: fs.readFileSync('https/localhost-key.pem'),
  cert: fs.readFileSync('https/localhost.pem')
}, app).listen(443, () => {
  console.log("Server is running on https://localhost")
})
