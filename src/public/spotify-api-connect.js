const authEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";

var authCode = null;

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "434f5e9f442a4e4586e089a33f65c857";
const redirectUri = "http://localhost:3000";
const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];

// Authentification url as shown in https://developer.spotify.com/documentation/general/guides/authorization-guide/#:~:text=A%20token%20that%20can%20be,access%20token%20will%20be%20returned.
// underneath the code flow image's, first table. Where it states 'A typical request is the GET request of the /authorize endpoint, followed by the query:'
const authURL = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
  "%20"
)}&response_type=code&show_dialog=true`;

const tokenURL = `${tokenEndpoint}?grant_type=authorization_code&code=${authCode}&redirect_uri=${redirectUri}`;

function createSpotifyLoginButton() {
  // Create anchor element.
  var a = document.createElement("a");
  // Create the text node for anchor element.
  var link = document.createTextNode("Login To Spotify");
  // Append the text node to anchor element.
  a.appendChild(link);
  // Set the title.
  a.title = "Login To Spotify";
  a.id = "spotify-login";
  // Set the href property.
  a.href = authURL;
  // Append the anchor element to the body.
  document.getElementById("spotify-container").appendChild(a);
}
createSpotifyLoginButton();

function checkForCode() {
  // create a parameter searcher in the URL after '?' which holds the requests body parameters
  const urlParams = new URLSearchParams(window.location.search);

  // Get the code from the parameter called 'code' in the url which
  // hopefully came back from the spotify GET request otherwise it is null
  authCode = urlParams.get("code");

  console.log(authCode);

  // because the code has been obtained we want to change the url
  // so it doesn't have the code without refreshing the page
  window.history.pushState(null, null, "/");
}

if (authCode == null) {
  checkForCode();
}
