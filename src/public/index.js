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

const PLAYLISTS = [];
const TOP_TRACKS = [];

class Track {
  constructor(name, images) {
    this.name = name;
    this.images = images;
  }

  getTrackHtml(idx) {
    var url = "";
    var id = `track-${idx}`;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;
    }

    return `
            <div class="track" id="${id}">
              <img src="${url}"></img>
              <h4>${this.name}</h4>
            </div>
        `;
  }
}

class Playlist {
  constructor(name, images, id) {
    this.images = images;
    this.name = name;
    this.id = id;
  }

  getPlaylistHtml(idx) {
    var url = "";
    var id = `playlist-${idx}`;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;

      return `
            <div class="playlist" id="${id}">
              <img src="${url}"></img>
              <h4>${this.name}</h4>
            </div>
        `;
    }
  }

  getTracks() {}
}

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
  var hasToken = await axiosGetReq("/tokens/has-tokens")
    .then((hasToken) => {
      return hasToken;
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
    await axiosGetReq(`/tokens/get-tokens?code=${authCode}`)
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

/* Functions that show or hide an element by adding the corrosponding
class to their class list. This means they keep their current css attributes,
however transition to and gain the attributes corrosponding to the added class.

@param {HTML} element - The html element whose class will be modified
 */
const hideElement = (element) => {
  element.classList.add("hidden");
};
const showElement = (element) => {
  element.classList.remove("hidden");
};

var numOfExpandedPlaylists = 0;
const MAX_NUM_EXPANDED_PLAYLISTS = 2;

const addExpandedPlaylist = (songs) => {
  numOfExpandedPlaylists += 1;
  const parentUl = document.getElementById("expanded-playlists-container");

  const htmlString = `
          <div class="expanded-playlist" id="expanded-playlist-${numOfExpandedPlaylists}">
            <ul id="song-list">${songs
              .map((song, idx) => {
                return `
              <li class="song">
                <h4>Song ${idx}</h4>
              </li>
              `;
              })
              .join("")}
            </ul>
          </div>`;

  parentUl.innerHTML += htmlString;

  let transitionInterval = setInterval(() => {
    let expandedPlaylist = document.getElementById(
      `expanded-playlist-${numOfExpandedPlaylists}`
    );
    expandedPlaylist.classList.add("appear");
    clearInterval(transitionInterval);
  }, 100);
};

const playlistsContainer = document.getElementById("playlists");
const tracksContainer = document.getElementById("tracks");

const addOnPlaylistClick = () => {
  var playlistCards = document.querySelectorAll(".playlist");

  playlistCards.forEach((card) => {
    card.addEventListener("click", () => {
      // you can only expand 3 playlists
      if (numOfExpandedPlaylists < MAX_NUM_EXPANDED_PLAYLISTS) {
        // on click add the selected class onto the element which runs a transition
        card.classList.add("selected");

        addExpandedPlaylist(["song 1", "song 2", "song 3"]);
      } else {
        // tell them u can only open 3 playlists or smthn
      }
    });
  });
};

const displayPlaylists = () => {
  const htmlString = PLAYLISTS.map((playlist, idx) => {
    return playlist.getPlaylistHtml(idx);
  }).join("");
  playlistsContainer.innerHTML = htmlString;
  addOnPlaylistClick();
};

const displayTracks = (tracks) => {
  const htmlString = tracks
    .map((track, idx) => {
      return track.getTrackHtml(idx);
    })
    .join("");
  tracksContainer.innerHTML = htmlString;
};

/* Obtains information from web api and displays them.*/
async function getInformation() {
  var topArtistsReq = axiosGetReq(
    "/spotify/get-top-artists?time_range=medium_term"
  );
  var topTracksReq = axiosGetReq(
    "/spotify/get-top-tracks?time_range=medium_term"
  );
  var playListsReq = axiosGetReq("/spotify/get-playlists");

  // promise.all runs each promise in parallel before returning their values once theyre all done.
  // promise.all will also stop function execution if a error is thrown in any of the promises.

  // promise.settleAll will not throw error however it will store the state of each request. (rejected state is equivalent to a thrown error)
  let data = await Promise.all([topArtistsReq, topTracksReq, playListsReq]);
  console.log(data);

  // remove the info loading spinners as info has been loaded
  let infoSpinners = document.querySelectorAll(".info-loading-spinner");
  infoSpinners.forEach((spinner) => {
    spinner.parentNode.removeChild(spinner);
  });

  const playlistDatas = data[2];
  const topTrackDatas = data[1];
  playlistDatas.forEach((data) => {
    PLAYLISTS.push(new Playlist(data.name, data.images, data.id));
  });
  topTrackDatas.forEach((data) => {
    TOP_TRACKS.push(new Track(data.name, data.album.images));
  });

  displayPlaylists();
  displayTracks(TOP_TRACKS);
}

// create custom promise
async function stall(stallTime = 3000) {
  await new Promise((resolve) => setTimeout(resolve, stallTime));
}

// TEST CODE
console.log("Start long task");
stall().then(() => {
  console.log("Finished long task");
});
console.log("do other stuff:");

const infoContainer = document.getElementById("info-container");
const allowAccessHeader = document.getElementById("allow-access-header");

const animateOptions = {
  // the entire element should be visible before the observer counts it as intersecting
  threshold: 1,
  // how far down the screen the element needs to be before the observer counts it as intersecting
  rootMargin: "0px 0px -150px 0px",
};

/*Adds a class to each element causing a transition to the changed css attributes
of the added class while still retaining unchanged attributes from original class.

This is done on set intervals.

@param {string} className - The class that all the transitioning elements contain
@param {string} classToTransitionToo - The class that all the transitioning elements will add
@param {number} animationInterval - The interval to wait between animation of elements
 */
function intervalElementsTransitions(
  className,
  classToTransitionToo,
  animationInterval
) {
  var elements = document.getElementsByClassName(className);
  var idx = 0;

  // in intervals play their initial animations
  var interval = setInterval(function () {
    if (idx === elements.length) {
      clearInterval(interval);
      return;
    }
    var element = elements[idx];

    // add the class to the elements classes in order to run the transition
    element.classList.add(classToTransitionToo);
    idx += 1;
  }, animationInterval);
}

// intersection observer is a nice way to find whether an element is in the viewport
// in this case once we know it's in the viewport we also animate elements relating to a given class name
const animateOnScroll = new IntersectionObserver(function (
  entries,
  appearOnScroll
) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const animationInterval = 25;

    // observable element that causes animation on scroll should contain a 'data-class-to-animate' attribute
    intervalElementsTransitions(
      entry.target.getAttribute("data-class-to-animate"),
      "appear",
      animationInterval
    );
    appearOnScroll.unobserve(entry.target);
  });
},
animateOptions);

obtainTokens().then((hasToken) => {
  if (hasToken) {
    console.log("render certain things");

    // if there is a token remove the allow access header from DOM
    allowAccessHeader.parentNode.removeChild(allowAccessHeader);
    infoContainer.style.display = "block";

    // render and get information
    getInformation()
      .then(() => {
        // Run .then() when information has been obtained and innerhtml has been changed
        const playlistsArea = document.getElementById("playlists-header");
        const tracksArea = document.getElementById("top-tracks-header");

        animateOnScroll.observe(playlistsArea);
        animateOnScroll.observe(tracksArea);
      })
      .catch((err) => {
        console.log("Problem when getting information");
        console.error(err);
      });
  } else {
    // if there is no token show the allow access header and hide the info
    allowAccessHeader.style.display = "block";
    infoContainer.style.display = "none";
  }
});
