const authEndpoint = "https://accounts.spotify.com/authorize";

// Replace with your app's client ID, redirect URI and desired scopes
const redirectUri = "http://localhost:3000";
const clientId = "434f5e9f442a4e4586e089a33f65c857";

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

  // Authentification url as shown in https://developer.spotify.com/documentation/general/guides/authorization-guide/#:~:text=A%20token%20that%20can%20be,access%20token%20will%20be%20returned.
  // underneath the code flow image's, first table. Where it states 'A typical request is the GET request of the /authorize endpoint, followed by the query:'
  let authURL = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    "%20"
  )}&response_type=code&show_dialog=true`;

  // Set the href property.
  a.href = authURL;
  // Append the anchor element to the body.
  document.getElementById("spotify-container").appendChild(a);
}

// custom promise to handle axios get requests
const axiosGetReq = (url) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

async function obtainTokens() {
  // await promise resolve that returns whether the session has tokens.
  // because token is stored in session we need to reassign 'hasToken' to the client so we do not need to run this method again on refresh
  var hasToken = await axios
    .get(`/tokens/has_tokens`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
    });

  if (hasToken) {
    console.log("has token");
    return hasToken;
  }

  console.log("get tokens");
  // create a parameter searcher in the URL after '?' which holds the requests body parameters
  const urlParams = new URLSearchParams(window.location.search);

  // Get the code from the parameter called 'code' in the url which
  // hopefully came back from the spotify GET request otherwise it is null
  var authCode = urlParams.get("code");

  if (authCode) {
    // axios itself is promise based so we do not need to wrap it in a custom promise
    await axios
      .get(`/tokens/get_tokens?code=${authCode}`)
      // if the request was succesful we have recieved a token
      .then(() => (hasToken = true))
      .catch((err) => {
        console.error(err);
      });
    authCode = "";
  } else {
    // create spotify button if no auth code was found in the url
    createSpotifyLoginButton();
  }

  // because the code has been obtained we want to change the url
  // so it doesn't have the code without refreshing the page
  window.history.pushState(null, null, "/");
  return hasToken;
}

const playlistsElement = document.getElementById("playlists");

// the index of the 60x60 img stored in playlist.images list
const sixtyBysixtyImgIdx = 2;

const displayPlaylists = (playlists) => {
  const htmlString = playlists
    .map((playlist) => {
      imgList = playlist.images;

      var url = "";

      // if the img list obtained from api has a 60x60 img
      if (imgList.length > sixtyBysixtyImgIdx) {
        // get the images url
        let img = imgList[sixtyBysixtyImgIdx];
        url = img.url;
      }

      return `
            <div class="playlist">
                <h3>${playlist.name}</h3>
                <img src="${url}"></img>
            </div>
        `;
    })
    .join("");
  playlistsElement.innerHTML = htmlString;
};

async function getInformation() {
  var currentlyPlayingReq = axiosGetReq("/spotify/get_currently_playing");
  var playListsReq = axiosGetReq("/spotify/get_playlists");

  // promise.all runs each promise in parallel before returning their values once theyre all done.
  // promise.settleAll will not throw error however it will store the state of each request. (rejected state is equivalent to a thrown error)
  let data = await Promise.all([currentlyPlayingReq, playListsReq]);
  console.log(data[1]);
  displayPlaylists(data[1]);
}

// create custom promise
async function stall(stallTime = 3000) {
  await new Promise((resolve) => setTimeout(resolve, stallTime));
}

console.log("Start long task");
stall().then(() => {
  console.log("Finished long task");
});
console.log("do other stuff:");

obtainTokens().then((hasToken) => {
  if (hasToken) {
    console.log("render certain things");
    // render certain things
    getInformation().catch((err) => console.error(err));
  }
});
