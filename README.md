# 🔐 SSO Authenticator

A lightweight and extensible Single Sign-On (SSO) authentication service built with Node.js and Express, supporting multiple OAuth 2.0 providers including Google, Facebook, Twitter, LinkedIn, Yahoo, GitHub, GitLab, Discord, Spotify, Dropbox, TikTok, and Apple.

### ✨ Features

- OAuth 2.0 login via major social platforms
- Built with Node.js + Express for fast, modular setup
- Secure token handling and user profile retrieval
- Scalable and developer-friendly codebase

### 🔗 Supported OAuth Providers

| Provider Name | Provider ID | Official Docs Link                                                                                              |
|---------------|-------------|-----------------------------------------------------------------------------------------------------------------|
| Google        | `google`    | [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)           |
| Facebook      | `facebook`  | [Facebook OAuth Docs](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/)         |
| Twitter       | `twitter`   | [Twitter OAuth Docs](https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/user-access-token)      |
| LinkedIn      | `linkedin`  | [LinkedIn OAuth Docs](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow) |
| Yahoo         | `yahoo`     | [Yahoo OAuth Docs](https://developer.yahoo.com/sign-in-with-yahoo/)                                             |
| GitHub        | `github`    | [GitHub OAuth Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)       |
| GitLab        | `gitlab`    | [GitLab OAuth Docs](https://docs.gitlab.com/api/oauth2/)                                                        |
| Discord       | `discord`   | [Discord OAuth Docs](https://discord.com/developers/docs/topics/oauth2)                                         |
| Spotify       | `spotify`   | [Spotify OAuth Docs](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)                   |
| Dropbox       | `dropbox`   | [Dropbox OAuth Docs](https://developers.dropbox.com/oauth-guide)                                                |
| TikTok        | `tiktok`    | [TikTok OAuth Docs](https://developers.tiktok.com/doc/login-kit-web/)                                           |
| Apple         | `apple`     | [Apple OAuth Docs](https://developer.apple.com/documentation/signinwithapplerestapi)                            |

## ⚙️ `config.json` Configuration Guide

The [config.json](./config.json) file located in the root directory is used to configure OAuth credentials and domain security settings for all supported SSO providers in your application.

```json
{
  "origin": "https://yourapp.com/",
  "clients": [
    {
      "id": "google",
      "env": {
        "client_id": "GOOGLE_CLIENT_ID",
        "client_secret": "GOOGLE_CLIENT_SECRET",
        "redirect_uri": "https://yourapp.com/api/sso/callback/google"
      }
    }
  ]
}
```

#### `origin`

- The fully qualified domain of your hosted frontend app (e.g., `https://example.com/`)
- This is used by the `/api/sso/callback/:id` endpoint to validate and allow `postMessage` callbacks only from this origin
- ⚠️ Must exactly match the frontend domain (including protocol `https://`)

#### `clients`

`id`
- The identifier for the provider (e.g., `google`, `github`, `linkedin`)

`env.client_id`
- The Client ID obtained from the provider's developer console
- Required to initiate the OAuth login process

`env.client_secret`
- The Client Secret from the same developer console
- Used to exchange the authorization code for an access token

`env.redirect_uri`
- The exact redirect URI that the OAuth provider should call after user login
- ⚠️ Must be registered in the provider’s developer dashboard (under allowed/callback URLs)

## 🌐 API References

### Login Redirect API

```
GET /api/sso/client/:id
```

Initiates OAuth login for the given provider by opening a popup window.

- `:id` — OAuth provider ID (e.g. `google`, `github`, etc.)

**Frontend Usage Example:**

```js
// Open the login window
window.open(`/api/sso/client/google`, '_blank', 'width=500,height=600');

// Listen for login callback
window.addEventListener("message", async event => {
  const data = event.data;
  if (!data || !data.client) return;

  console.log(data.client); // e.g., "google"
  console.log(data.data.access_token); // use as needed
  console.log(data.data.refresh_token); // if available
});
```

### Auth Code Callback API

```
GET /api/sso/callback/:id?code=AUTH_CODE
```

Handles the provider's OAuth redirect with `code` and returns tokens to the parent or opener window via `postMessage`.

- `:id` — OAuth provider ID (e.g. `google`, `github`, etc.)
- `code` — Authorization code from provider

Automatically posts a message back to the parent window like:

```json
{
  "client": "google",
  "data": {
    "access_token": "ACCESS_TOKEN",
    "refresh_token": "REFRESH_TOKEN"
  }
}
```

### User Info API

```
GET /api/sso/user/:id
  Authorization: Bearer ACCESS_TOKEN
```

Returns authenticated user info such as ID, name, and email.

- `:id` — OAuth provider ID (e.g. `google`, `github`, etc.)

Sample Response:

```json
{
  "client": "google",
  "data": {
    "id": "USER_ID",
    "name": "USER_NAME",
    "email": "USER_EMAIL"
  }
}
```

### Developed by Deshan Nawanjana

[Deshan.lk](https://deshan.lk/)
&ensp;|&ensp;
[DNJS](https://dnjs.lk/)
&ensp;|&ensp;
[LinkedIn](https://www.linkedin.com/in/deshan-nawanjana/)
&ensp;|&ensp;
[GitHub](https://github.com/deshan-nawanjana)
&ensp;|&ensp;
[YouTube](https://www.youtube.com/@deshan-nawanjana)
&ensp;|&ensp;
[Blogger](https://dn-w.blogspot.com/)
&ensp;|&ensp;
[Facebook](https://www.fb.com/mr.dnjs)
&ensp;|&ensp;
[Gmail](mailto:deshan.uok@gmail.com)
