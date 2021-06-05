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
const config = {
  CSS: {
    IDs: {
      playlists: "playlists",
      tracks: "tracks",
      playlistPrefix: "playlist-",
      trackPrefix: "track-",
      loginButton: "spotify-login",
      spotifyContainer: "spotify-container",
      infoContainer: "info-container",
      allowAccessHeader: "allow-access-header",
      songList: "song-list",
      expandedPlaylistPrefix: "expanded-playlist-",
    },
    CLASSES: {
      playlist: "playlist",
      track: "track",
      infoLoadingSpinners: "info-loading-spinner",
      appear: "appear",
      hide: "hidden",
      selected: "selected",
    },
    ATTRIBUTES: {
      dataClassToAnimate: "data-class-to-animate",
    },
  },
  URLs: {
    auth: `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      "%20"
    )}&response_type=code&show_dialog=true`,
    getHasTokens: "/tokens/has-tokens",
    getTokensPrefix: "/tokens/get-tokens?code=",
    getTopArtists: "/spotify/get-top-artists?time_range=medium_term",
    getTopTracks: "/spotify/get-top-tracks?time_range=medium_term",
    getPlaylists: "/spotify/get-playlists",
  },
};

class Track {
  constructor(name, images) {
    this.name = name;
    this.images = images;
  }

  getTrackHtml(idx) {
    let url = "";
    let id = `${config.CSS.IDs.trackPrefix}${idx}`;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;
    }

    return `
            <div class="${config.CSS.CLASSES.track}" id="${id}">
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

    // the id of the playlist card element
    this.playlistElementId = "";
  }

  getPlaylistHtml(idx) {
    let url = "";
    let id = `${config.CSS.IDs.playlistPrefix}${idx}`;

    this.playlistElementId = id;

    if (this.images.length > 0) {
      let img = this.images[0];
      url = img.url;

      return `
            <div class="${config.CSS.CLASSES.playlist}" id="${id}">
              <img src="${url}"></img>
              <h4>${this.name}</h4>
            </div>
        `;
    }
  }

  getTracks() {
    return ["song 1", "song 2", "song 3"];
  }
}

function createSpotifyLoginButton() {
  // Create anchor element.
  let a = document.createElement("a");
  // Create the text node for anchor element.
  let link = document.createTextNode("Login To Spotify");
  // Append the text node to anchor element.
  a.appendChild(link);
  // Set the title.
  a.title = "Login To Spotify";
  a.id = config.CSS.IDs.loginButton;

  // Set the href property.
  a.href = config.URLs.auth;
  // Append the anchor element to the body.
  document.getElementById(config.CSS.IDs.spotifyContainer).appendChild(a);
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
  let hasToken = await axiosGetReq(config.URLs.getHasTokens)
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
  let authCode = urlParams.get("code");

  if (authCode) {
    // axios itself is promise based so we do not need to wrap it in a custom promise
    await axiosGetReq(`${config.URLs.getTokensPrefix}${authCode}`)
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

const informationRetrieval = (function () {
  let numOfExpandedPlaylists = 0;
  const MAX_NUM_SELECTED_PLAYLISTS = 2;
  const playlistsContainer = document.getElementById(config.CSS.IDs.playlists);
  const tracksContainer = document.getElementById(config.CSS.IDs.tracks);
  const playlistObjs = [];
  const topTrackObjs = [];

  function showExpandedPlaylist(tracks) {
    numOfExpandedPlaylists += 1;
    const parentUl = document.getElementById(
      `${config.CSS.IDs.expandedPlaylistPrefix}${numOfExpandedPlaylists}`
    );

    // overwrite the previous songlist with the current one
    const htmlString = `
            <ul id="${config.CSS.IDs.songList}">
            ${tracks
              .map((track, idx) => {
                return `
              <li class="song">
                <h4>${track}</h4>
              </li>
              `;
              })
              .join("")}
            </ul>`;

    parentUl.innerHTML = htmlString;

    let transitionInterval = setInterval(() => {
      let id = `${config.CSS.IDs.expandedPlaylistPrefix}${numOfExpandedPlaylists}`;
      let expandedPlaylist = document.getElementById(id);
      expandedPlaylist.classList.add(config.CSS.CLASSES.appear);
      clearInterval(transitionInterval);
    }, 100);
  }
  function addOnPlaylistClick() {
    function onPlaylistElementClick(playlistEl) {
      // get corrosponding playlist object using the elements id
      let playlistObj = playlistObjs.find(
        (x) => x.playlistElementId === playlistEl.id
      );

      if (playlistEl.classList.contains(config.CSS.CLASSES.selected)) {
        playlistEl.classList.remove(config.CSS.CLASSES.selected);
        return;
        // hide the expanded element
      }
      if (numOfExpandedPlaylists < MAX_NUM_SELECTED_PLAYLISTS) {
        // on click add the selected class onto the element which runs a transition
        playlistEl.classList.add(config.CSS.CLASSES.selected);

        showExpandedPlaylist(playlistObj.getTracks());
      }
    }

    let playlists = document.querySelectorAll(
      "." + config.CSS.CLASSES.playlist
    );

    playlists.forEach((playlistEl) => {
      playlistEl.addEventListener("click", () =>
        onPlaylistElementClick(playlistEl)
      );
    });
  }
  function displayPlaylists() {
    const htmlString = playlistObjs
      .map((playlist, idx) => {
        return playlist.getPlaylistHtml(idx);
      })
      .join("");
    playlistsContainer.innerHTML = htmlString;
    addOnPlaylistClick();
  }
  function displayTracks(tracks) {
    const htmlString = tracks
      .map((track, idx) => {
        return track.getTrackHtml(idx);
      })
      .join("");
    tracksContainer.innerHTML = htmlString;
  }
  /* Obtains information from web api and displays them.*/
  async function getInformation() {
    let topArtistsReq = axiosGetReq(config.URLs.getTopArtists);
    let topTracksReq = axiosGetReq(config.URLs.getTopTracks);
    let playListsReq = axiosGetReq(config.URLs.getPlaylists);

    // promise.all runs each promise in parallel before returning their values once theyre all done.
    // promise.all will also stop function execution if a error is thrown in any of the promises.

    // promise.settleAll will not throw error however it will store the state of each request. (rejected state is equivalent to a thrown error)
    let data = await Promise.all([topArtistsReq, topTracksReq, playListsReq]);
    console.log(data);

    // remove the info loading spinners as info has been loaded
    let infoSpinners = document.querySelectorAll(
      "." + config.CSS.CLASSES.infoLoadingSpinners
    );
    infoSpinners.forEach((spinner) => {
      spinner.parentNode.removeChild(spinner);
    });

    const playlistDatas = data[2];
    const topTrackDatas = data[1];
    playlistDatas.forEach((data) => {
      playlistObjs.push(new Playlist(data.name, data.images, data.id));
    });
    topTrackDatas.forEach((data) => {
      topTrackObjs.push(new Track(data.name, data.album.images));
    });

    displayPlaylists();
    displayTracks(topTrackObjs);
  }
  return {
    getInformation: getInformation,
  };
})();

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

const animationControl = (function () {
  const animateOptions = {
    // the entire element should be visible before the observer counts it as intersecting
    threshold: 1,
    // how far down the screen the element needs to be before the observer counts it as intersecting
    rootMargin: "0px 0px -150px 0px",
  };
  const appearOnScrollObserver = new IntersectionObserver(function (
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
        entry.target.getAttribute(config.CSS.ATTRIBUTES.dataClassToAnimate),
        config.CSS.CLASSES.appear,
        animationInterval
      );
      appearOnScroll.unobserve(entry.target);
    });
  },
  animateOptions);
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
    let elements = document.getElementsByClassName(className);
    let idx = 0;

    // in intervals play their initial animations
    let interval = setInterval(function () {
      if (idx === elements.length) {
        clearInterval(interval);
        return;
      }
      let element = elements[idx];

      // add the class to the elements classes in order to run the transition
      element.classList.add(classToTransitionToo);
      idx += 1;
    }, animationInterval);
  }
  function addAnimateOnScroll() {
    const playlistsArea = document.getElementById("playlists-header");
    const tracksArea = document.getElementById("top-tracks-header");

    appearOnScrollObserver.observe(playlistsArea);
    appearOnScrollObserver.observe(tracksArea);
  }
  return {
    addAnimateOnScroll: addAnimateOnScroll,
    intervalElementsTransitions,
  };
})();

// intersection observer is a nice way to find whether an element is in the viewport
// in this case once we know it's in the viewport we also animate elements relating to a given class name

obtainTokens().then((hasToken) => {
  const infoContainer = document.getElementById(config.CSS.IDs.infoContainer);
  const allowAccessHeader = document.getElementById(
    config.CSS.IDs.allowAccessHeader
  );
  if (hasToken) {
    console.log("render certain things");

    // if there is a token remove the allow access header from DOM
    allowAccessHeader.parentNode.removeChild(allowAccessHeader);
    infoContainer.style.display = "block";

    // render and get information
    informationRetrieval
      .getInformation()
      .then(() => {
        // Run .then() when information has been obtained and innerhtml has been changed
        animationControl.addAnimateOnScroll();
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
