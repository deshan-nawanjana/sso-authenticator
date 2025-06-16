// method to login
const login = id => {
  // open sso auth endpoint
  window.open(
    "/api/sso/client/" + id,
    "sso",
    "width=500,height=600,resizable=no,scrollbars=yes"
  )
}

// method to logout
const logout = () => {
  // set as loading
  document.body.setAttribute("data-loading", "")
  // clear sso local details
  localStorage.removeItem("sso-details")
  // switch to login buttons
  document.body.setAttribute("data-section", "login")
  // stop loading
  setTimeout(() => {
    document.body.removeAttribute("data-loading")
  }, 500)
}

// method to fetch user
const fetchUser = async () => {
  // set as loading
  document.body.setAttribute("data-loading", "")
  // get sso details from storage
  const data = JSON.parse(localStorage.getItem("sso-details"))
  // fetch user details
  const user = await fetch("/api/sso/user/" + data.client, {
    headers: { Authorization: "Bearer " + data.data.access_token }
  }).then(resp => resp.json())
  // check response
  if (user.data) {
    // set user details
    document.querySelector("#user-client").className = "icon-" + data.client
    document.querySelector("#user-id").innerHTML = user.data.id || "N/A"
    document.querySelector("#user-name").innerHTML = user.data.name || "N/A"
    document.querySelector("#user-email").innerHTML = user.data.email || "N/A"
    // switch to user details
    document.body.setAttribute("data-section", "user")
  } else {
    // clear sso details
    localStorage.removeItem("sso-details")
    // switch to login buttons
    document.body.setAttribute("data-section", "login")
  }
  // stop loading
  document.body.removeAttribute("data-loading")
}

// login callback listener
window.addEventListener("message", async event => {
  // get event data
  const data = event.data
  // return if no data
  if (!data) { return }
  // return if no client
  if (!data.client) { return }
  // return if error
  if (data.error) { return }
  // store sso details
  localStorage.setItem("sso-details", JSON.stringify(data))
  // fetch user details
  fetchUser()
})

// window load listener
window.addEventListener("load", () => {
  // check for sso details in storage
  if ("sso-details" in localStorage) {
    // load user details
    fetchUser()
  } else {
    // show login buttons
    document.body.setAttribute("data-section", "login")
  }
})
