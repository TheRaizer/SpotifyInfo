import Track from "./components/track.js";
import Playlist from "./components/playlist.js";
import { config } from "./config.js";

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
    axios.post(config.URLs.postClearTokens).catch((err) => console.error(err));
    window.location.href = config.URLs.auth;
  });

  // Append the anchor element to the body.
  document.getElementById(config.CSS.IDs.spotifyContainer).appendChild(div);
}

async function obtainTokens() {
  // await promise resolve that returns whether the session has tokens.
  // because token is stored in session we need to reassign 'hasToken' to the client so we do not need to run this method again on refresh
  let hasToken = await axios
    .get(config.URLs.getHasTokens)
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
  let authCode = urlParams.get("code");

  if (authCode) {
    await axios
      .get(`${config.URLs.getTokensPrefix}${authCode}`)
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

  function loadPlaylistTracksToHtmlString(playlistObj, useHtmlString) {
    // asynchronously load the tracks and replace the html once it loads
    playlistObj
      .getTracks()
      .then((tracks) => {
        console.log("loaded tracks");
        // overwrite the previous songlist with the current one
        const htmlString = `
            <ul id="${config.CSS.IDs.trackList}">
            ${tracks
              .map((track) => {
                return track.getPlaylistTrackHtml();
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
            <ul id="${config.CSS.IDs.trackList}">
            <img class="songs-loading-spinner" src="200pxLoadingSpinner.svg" />
            </ul>`;

    EXPANDED_PLAYLIST.innerHTML = htmlString;
    EXPANDED_PLAYLIST.classList.add(config.CSS.CLASSES.appear);

    loadPlaylistTracksToHtmlString(playlistObj, (loadedHtmlString) => {
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
  function displayPlaylists(playlistObjs) {
    const htmlString = playlistObjs
      .map((playlistObj, idx) => {
        return playlistObj.getPlaylistHtml(idx);
      })
      .join("");
    playlistsContainer.innerHTML = htmlString;
    addOnPlaylistClick();
  }
  function displayTracks(trackObjs) {
    const htmlString = trackObjs
      .map((trackObj, idx) => {
        return trackObj.getTrackCardHtml(idx);
      })
      .join("");
    tracksContainer.innerHTML = htmlString;
  }
  /* Obtains information from web api and displays them.*/
  async function getInformation() {
    // axios get requests return a promise
    let topArtistsReq = axios.get(config.URLs.getTopArtists);
    let topTracksReq = axios.get(config.URLs.getTopTracks);
    let playListsReq = axios.get(config.URLs.getPlaylists);

    // promise.all runs each promise in parallel before returning their values once theyre all done.
    // promise.all will also stop function execution if a error is thrown in any of the promises.

    // promise.settleAll will not throw error however it will store the state of each request. (rejected state is equivalent to a thrown error)
    let responses = await Promise.all([
      topArtistsReq,
      topTracksReq,
      playListsReq,
    ]);
    console.log(responses);

    // remove the info loading spinners as info has been loaded
    let infoSpinners = document.querySelectorAll(
      "." + config.CSS.CLASSES.infoLoadingSpinners
    );
    infoSpinners.forEach((spinner) => {
      spinner.parentNode.removeChild(spinner);
    });

    const playlistDatas = responses[2].data;
    const topTrackDatas = responses[1].data;
    playlistDatas.forEach((data) => {
      playlistObjs.push(new Playlist(data.name, data.images, data.id));
    });
    topTrackDatas.forEach((data) => {
      topTrackObjs.push(
        new Track(data.name, data.album.images, data.duration_ms)
      );
    });

    displayPlaylists(playlistObjs);
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
    let getTokensSpinner = document.getElementById(
      config.CSS.IDs.getTokenLoadingSpinner
    );

    // remove token spinner because by this line we have obtained the token
    getTokensSpinner.parentNode.removeChild(getTokensSpinner);

    const infoContainer = document.getElementById(config.CSS.IDs.infoContainer);
    const allowAccessHeader = document.getElementById(
      config.CSS.IDs.allowAccessHeader
    );
    if (hasToken) {
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
