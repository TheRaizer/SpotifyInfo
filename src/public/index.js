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
    getPlaylistTracks: "/spotify/get-playlist-tracks?playlist_id=",
    postClearTokens: "/tokens/clear-tokens",
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

    // the number corrosponding to this playlist's expanded element
    this.expandedPlaylistNum = -1;
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

  async getTracks() {
    let tracks = await axiosGetReq(config.URLs.getPlaylistTracks + this.id);
    return tracks;
  }
}

function createSpotifyLoginButton(changeAccount = false) {
  // Create anchor element.
  let div = document.createElement("div");
  // Create the text node for anchor element.
  let link = document.createTextNode(
    changeAccount ? "Change Account" : "Login To Spotify"
  );
  // Append the text node to anchor element.
  div.appendChild(link);
  div.id = config.CSS.IDs.loginButton;

  // clear current tokens when clicked
  div.addEventListener("click", () => {
    axios.post(config.URLs.postClearTokens);
    window.location.href = config.URLs.auth;
  });

  // Append the anchor element to the body.
  document.getElementById(config.CSS.IDs.spotifyContainer).appendChild(div);
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
  // true means it is hidden, false means its showing
  const HIDDEN_STATE = true;
  const SHOWING_STATE = false;
  var expandedPlaylistStates = { 1: HIDDEN_STATE, 2: HIDDEN_STATE };
  const playlistsContainer = document.getElementById(config.CSS.IDs.playlists);
  const tracksContainer = document.getElementById(config.CSS.IDs.tracks);
  const playlistObjs = [];
  const topTrackObjs = [];

  function loadTracksToHtmlString(playlistObj, useHtmlString) {
    // asynchronously load the tracks and replace the html once it loads
    playlistObj
      .getTracks()
      .then((tracks) => {
        console.log("loaded tracks");
        // overwrite the previous songlist with the current one
        const htmlString = `
            <ul id="${config.CSS.IDs.songList}">
            ${tracks
              .map((track) => {
                return `
              <li class="song">
                <h4>${track.name}</h4>
              </li>
              `;
              })
              .join("")}
            </ul>`;

        useHtmlString(htmlString);
      })
      .catch((err) => {
        console.log("Error when getting tracks");
        console.error(err);
      });
  }
  function showExpandedPlaylist(playlistObj, playlistNum) {
    const EXPANDED_PLAYLIST_ID = `${config.CSS.IDs.expandedPlaylistPrefix}${playlistNum}`;
    const EXPANDED_PLAYLIST = document.getElementById(EXPANDED_PLAYLIST_ID);

    // initially show the playlist with the loading spinner
    const htmlString = `
            <ul id="${config.CSS.IDs.songList}">
            <img class="songs-loading-spinner" src="200pxLoadingSpinner.svg" />
            </ul>`;

    EXPANDED_PLAYLIST.innerHTML = htmlString;
    EXPANDED_PLAYLIST.classList.add(config.CSS.CLASSES.appear);

    loadTracksToHtmlString(playlistObj, (loadedHtmlString) => {
      EXPANDED_PLAYLIST.innerHTML = loadedHtmlString;
    });
    console.log("synchronously after running load tracks");
  }
  function findFirstHiddenExpandedPlaylist() {
    let state = false;
    let expandedPlaylistNum = -1;

    for (let key in expandedPlaylistStates) {
      state = expandedPlaylistStates[key];
      if (state) {
        expandedPlaylistNum = parseInt(key);
        break;
      }
    }

    return { state, expandedPlaylistNum };
  }
  function unselectPlaylist(playlistEl, playlistObj) {
    playlistEl.classList.remove(config.CSS.CLASSES.selected);

    let expandedPlaylistEl = document.getElementById(
      `${config.CSS.IDs.expandedPlaylistPrefix}${playlistObj.expandedPlaylistNum}`
    );
    expandedPlaylistEl.classList.remove(config.CSS.CLASSES.appear);
    expandedPlaylistStates[playlistObj.expandedPlaylistNum] = HIDDEN_STATE;
    playlistObj.expandedPlaylistNum = -1;
  }
  function selectPlaylist(playlistEl, playlistObj) {
    expandedPlaylistStates[playlistObj.expandedPlaylistNum] = SHOWING_STATE;
    // on click add the selected class onto the element which runs a transition
    playlistEl.classList.add(config.CSS.CLASSES.selected);
    showExpandedPlaylist(playlistObj, playlistObj.expandedPlaylistNum);
  }
  function addOnPlaylistClick() {
    function onPlaylistElementClick(playlistEl) {
      // get corrosponding playlist object using the elements id
      let playlistObj = playlistObjs.find(
        (x) => x.playlistElementId === playlistEl.id
      );

      // if the element is selected already the unselect it and hide its expanded playlist
      if (playlistEl.classList.contains(config.CSS.CLASSES.selected)) {
        unselectPlaylist(playlistEl, playlistObj);
        return;
      }

      const { state, expandedPlaylistNum } = findFirstHiddenExpandedPlaylist();

      if (state == HIDDEN_STATE) {
        playlistObj.expandedPlaylistNum = expandedPlaylistNum;
        selectPlaylist(playlistEl, playlistObj);
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

obtainTokens()
  .then((hasToken) => {
    const infoContainer = document.getElementById(config.CSS.IDs.infoContainer);
    const allowAccessHeader = document.getElementById(
      config.CSS.IDs.allowAccessHeader
    );
    if (hasToken) {
      console.log("render certain things");

      // if there is a token remove the allow access header from DOM
      allowAccessHeader.parentNode.removeChild(allowAccessHeader);
      createSpotifyLoginButton(true);
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
  })
  .catch((err) => console.error(err));
