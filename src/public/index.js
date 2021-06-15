import Track from "./components/track.js";
import Playlist from "./components/playlist.js";
import { config } from "./config.js";

const expandedPlaylistMods = document.getElementById(
  config.CSS.IDs.expandedPlaylistMods
);
// add on change event listener to the order selection element of the mods expanded playlist
const playlistOrder = expandedPlaylistMods.getElementsByClassName(
  config.CSS.CLASSES.playlistOrder
)[0];
const trackListUl = expandedPlaylistMods.getElementsByTagName("ul")[0];
const playlistSearchInput = expandedPlaylistMods.getElementsByClassName(
  config.CSS.CLASSES.playlistSearch
)[0];

function createSpotifyLoginButton(changeAccount = false) {
  // Create anchor element.
  let btn = document.createElement("button");
  // Create the text node for anchor element.
  let link = document.createTextNode(
    changeAccount ? "Change Account" : "Login To Spotify"
  );
  // Append the text node to anchor element.
  btn.appendChild(link);
  btn.classList.add(config.CSS.CLASSES.glow);

  // clear current tokens when clicked
  btn.addEventListener("click", () => {
    axios.post(config.URLs.postClearTokens).catch((err) => console.error(err));
    window.location.href = config.URLs.auth;
  });

  // Append the anchor element to the body.
  document.getElementById(config.CSS.IDs.spotifyContainer).appendChild(btn);
}

async function promiseHandler(
  promise,
  onSuccesful = (res) => {},
  onFailure = (res) => {}
) {
  try {
    const res = await promise;
    onSuccesful(res);
    return { res: res, err: null };
  } catch (err) {
    console.error(err);
    onFailure(err);
    return { res: null, err: err };
  }
}

async function obtainTokens() {
  let hasToken = false;
  // await promise resolve that returns whether the session has tokens.
  // because token is stored in session we need to reassign 'hasToken' to the client so we do not need to run this method again on refresh
  await promiseHandler(
    axios.get(config.URLs.getHasTokens),
    (res) => (hasToken = res.data)
  );

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
    await promiseHandler(
      axios.get(`${config.URLs.getTokensPrefix}${authCode}`),

      // if the request was succesful we have recieved a token
      () => (hasToken = true)
    );
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

// order of items should never change
var expandablePlaylistTracks = [];

const informationRetrieval = (function () {
  const playlistsContainer = document.getElementById(
    config.CSS.IDs.playlistCardsContainer
  );
  const tracksContainer = document.getElementById(
    config.CSS.IDs.trackCardsContainer
  );
  const modsSection = document.getElementById(config.CSS.IDs.playlistMods);
  const playlistTitleh2 = expandedPlaylistMods.getElementsByTagName("h2")[0];
  const playlistObjs = [];
  const topTrackObjs = [];
  var currSelPlaylistEl = null;
  var currSelPlaylist = { playlist: null, loadedTracks: false };

  function loadPlaylistTracksToHtmlString(playlistObj, htmlStringCallback) {
    playlistSearchInput.value = "";
    playlistSearchInput.classList.add(config.CSS.CLASSES.hide);
    playlistOrder.classList.add(config.CSS.CLASSES.hide);
    // synchronously assign the currently selected playlist to be this playlist
    currSelPlaylist.playlist = playlistObj;
    // it hasn't loaded its tracks
    currSelPlaylist.loadedTracks = false;

    // asynchronously load the tracks and replace the html once it loads
    playlistObj
      .getTracks()
      .then((tracks) => {
        // because .then() can run when currently selected playlist has already changed we need this if statement.
        // if the tracks have been loaded but they aren't from the currently selected playlist return.
        if (playlistObj !== currSelPlaylist.playlist) {
          return;
        }
        // if they're the same object but its already been loaded then dont load it again.
        else if (currSelPlaylist.loadedTracks) {
          return;
        }
        expandablePlaylistTracks = tracks;
        // overwrite the previous songlist with the current one
        const htmlString = `
            ${tracks
              .map((track) => {
                return track.getPlaylistTrackHtml();
              })
              .join("")}`;
        htmlStringCallback(htmlString);

        currSelPlaylist.loadedTracks = true;
      })
      .catch((err) => {
        console.log("Error when getting tracks");
        console.error(err);
      });
  }

  function whenTracksLoading() {
    // hide these while loading tracks
    playlistSearchInput.classList.add(config.CSS.CLASSES.hide);
    playlistOrder.classList.add(config.CSS.CLASSES.hide);
  }

  function onTracksLoadingDone() {
    // show them once tracks have loaded
    playlistSearchInput.classList.remove(config.CSS.CLASSES.hide);
    playlistOrder.classList.remove(config.CSS.CLASSES.hide);
  }

  function showExpandedPlaylist(playlistObj) {
    playlistTitleh2.textContent = playlistObj.name;

    // initially show the playlist with the loading spinner
    const htmlString = `
            <li>
              <img src="200pxLoadingSpinner.svg" />
            </li>`;

    trackListUl.innerHTML = htmlString;
    expandedPlaylistMods.classList.add(config.CSS.CLASSES.appear);
    modsSection.classList.add(config.CSS.CLASSES.appear);
    whenTracksLoading();
    loadPlaylistTracksToHtmlString(playlistObj, (loadedHtmlString) => {
      trackListUl.innerHTML = loadedHtmlString;
      sortTracksToOrder();
      onTracksLoadingDone();
    });
  }
  function selectPlaylist(playlistEl, playlistObj) {
    // on click add the selected class onto the element which runs a transition
    playlistEl.classList.add(config.CSS.CLASSES.selected);
    showExpandedPlaylist(playlistObj);
  }
  function addOnPlaylistClick() {
    function onPlaylistElementClick(playlistEl) {
      if (currSelPlaylistEl === playlistEl) {
        return;
      }
      // get corrosponding playlist object using the elements id
      let playlistObj = playlistObjs.find(
        (x) => x.playlistElementId === playlistEl.id
      );
      // if there is an existing playlist selected, unselect it
      if (currSelPlaylistEl) {
        currSelPlaylistEl.classList.remove(config.CSS.CLASSES.selected);
      }

      // make the currently selected playlist this playlist and select it.
      currSelPlaylistEl = playlistEl;
      selectPlaylist(currSelPlaylistEl, playlistObj);
    }

    let playlists = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.playlist)
    );

    playlists.forEach((playlistEl) => {
      playlistEl.addEventListener("click", () =>
        onPlaylistElementClick(playlistEl)
      );
    });
  }
  function displayPlaylistCards(playlistObjs) {
    const htmlString = playlistObjs
      .map((playlistObj, idx) => {
        return playlistObj.getPlaylistCardHtml(idx);
      })
      .join("");
    playlistsContainer.innerHTML = htmlString;
    addOnPlaylistClick();
  }
  function displayTrackCards(trackObjs) {
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
    let topArtistsReq = promiseHandler(axios.get(config.URLs.getTopArtists));
    let topTracksReq = promiseHandler(axios.get(config.URLs.getTopTracks));
    let playListsReq = promiseHandler(axios.get(config.URLs.getPlaylists));

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
    let infoSpinners = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.infoLoadingSpinners)
    );
    infoSpinners.forEach((spinner) => {
      spinner.parentNode.removeChild(spinner);
    });

    const playlistDatas = responses[2].res.data;
    const topTrackDatas = responses[1].res.data;
    playlistDatas.forEach((data) => {
      playlistObjs.push(new Playlist(data.name, data.images, data.id));
    });
    topTrackDatas.forEach((data) => {
      topTrackObjs.push(
        new Track(data.name, data.album.images, data.uri, data.duration_ms)
      );
    });

    displayPlaylistCards(playlistObjs);
    displayTrackCards(topTrackObjs);
  }
  return {
    getInformation,
    currSelPlaylist,
  };
})();

function searchUl(ul, input, stdDisplay = "grid") {
  let tracksLi = ul.getElementsByTagName("li");
  let filter = input.value.toUpperCase();

  for (let i = 0; i < tracksLi.length; i++) {
    let name = tracksLi[i].getElementsByClassName(config.CSS.CLASSES.name)[0];
    let nameTxt = name.textContent || name.innerText;
    if (nameTxt.toUpperCase().indexOf(filter) > -1) {
      tracksLi[i].style.display = stdDisplay;
    } else {
      tracksLi[i].style.display = "none";
    }
  }
}

function orderTracksByName(tracks) {
  // shallow copy just so we dont modify the original order
  let tracksCopy = [...tracks];
  tracksCopy.sort(function (a, b) {
    a = new DOMParser().parseFromString(a.getPlaylistTrackHtml(), "text/html");
    b = new DOMParser().parseFromString(b.getPlaylistTrackHtml(), "text/html");
    let nameA = a.getElementsByClassName(config.CSS.CLASSES.name)[0];
    let nameATxt = nameA.textContent || nameA.innerText;

    let nameB = b.getElementsByClassName(config.CSS.CLASSES.name)[0];
    let nameBTxt = nameB.textContent || nameB.innerText;

    // -1 precedes, 1 suceeds, 0 is equal
    return nameATxt.toUpperCase() === nameBTxt.toUpperCase()
      ? 0
      : nameATxt.toUpperCase() < nameBTxt.toUpperCase()
      ? -1
      : 1;
  });
  return tracksCopy;
}

function orderTracksByDateAdded(tracks) {
  // shallow copy just so we dont modify the original order
  let tracksCopy = [...tracks];
  tracksCopy.sort(function (a, b) {
    // -1 'a' precedes 'b', 1 'a' suceeds 'b', 0 is 'a' equal 'b'
    return a.dateAddedToPlaylist === b.dateAddedToPlaylist
      ? 0
      : a.dateAddedToPlaylist < b.dateAddedToPlaylist
      ? -1
      : 1;
  });
  return tracksCopy;
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
        entry.target.getAttribute(config.CSS.ATTRIBUTES.elementsToAnimate),
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
    elementsToAnimate,
    classToTransitionToo,
    animationInterval
  ) {
    let attributes = elementsToAnimate.split(",");
    attributes.forEach((attr) => {
      let elements = document.querySelectorAll(attr);
      let idx = 0;
      // in intervals play their initial animations
      let interval = setInterval(() => {
        if (idx === elements.length) {
          clearInterval(interval);
          return;
        }
        let element = elements[idx];
        // add the class to the elements classes in order to run the transition
        element.classList.add(classToTransitionToo);
        idx += 1;
      }, animationInterval);
    });
  }
  function addAnimateOnScroll() {
    const playlistsArea = document.getElementById("playlists-header");
    const tracksArea = document.getElementById("top-tracks-header");

    appearOnScrollObserver.observe(playlistsArea);
    appearOnScrollObserver.observe(tracksArea);
  }
  return {
    addAnimateOnScroll,
    intervalElementsTransitions,
  };
})();

function sortTracksToOrder() {
  if (playlistOrder.value == "custom-order") {
    rerenderPlaylistTracks(expandablePlaylistTracks, trackListUl);
  } else if (playlistOrder.value == "name") {
    let tracks = orderTracksByName(expandablePlaylistTracks);
    rerenderPlaylistTracks(tracks, trackListUl);
  } else if (playlistOrder.value == "date-added") {
    let tracks = orderTracksByDateAdded(expandablePlaylistTracks);
    rerenderPlaylistTracks(tracks, trackListUl);
  }
}

function rerenderPlaylistTracks(tracks, trackListUl) {
  const htmlString = `
            ${tracks
              .map((track) => {
                return track.getPlaylistTrackHtml();
              })
              .join("")}`;
  trackListUl.innerHTML = htmlString;
}

const addEventListeners = (function () {
  function addExpandedPlaylistModsSearchbarEvent() {
    // add key up event to the mods expanded playlist's search bar element
    expandedPlaylistMods
      .getElementsByClassName(config.CSS.CLASSES.playlistSearch)[0]
      .addEventListener("keyup", () => {
        searchUl(trackListUl, playlistSearchInput);
      });
  }

  function addExpandedPlaylistModsOrderEvent() {
    // add on change event listener to the order selection element of the mods expanded playlist
    const playlistOrder = expandedPlaylistMods.getElementsByClassName(
      config.CSS.CLASSES.playlistOrder
    )[0];
    playlistOrder.addEventListener("change", () => {
      sortTracksToOrder();
    });
  }

  function addDeleteRecentlyAddedEvent() {
    const numToRemoveInput = document
      .getElementById("remove-early-added")
      .getElementsByTagName("input")[0];

    const removeBtn = document
      .getElementById("remove-early-added")
      .getElementsByTagName("button")[0];

    removeBtn.addEventListener("click", () => {
      if (numToRemoveInput.value > expandablePlaylistTracks.length) {
        console.log("cant remove this many");
        // the user is trying to delete more songs then there are available, you may want to allow this
        return;
      }
      let orderedTracks = orderTracksByDateAdded(expandablePlaylistTracks);
      let tracksToRemove = orderedTracks.slice(0, numToRemoveInput.value);

      // remove songs contained in tracksToRemove from expandablePlaylistTracks
      expandablePlaylistTracks = expandablePlaylistTracks.filter(
        (track) => !tracksToRemove.includes(track)
      );
      sortTracksToOrder(expandablePlaylistTracks);

      promiseHandler(
        axios.delete(
          config.URLs.deletePlaylistTracks +
            informationRetrieval.currSelPlaylist.playlist.id,
          {
            data: { tracks: tracksToRemove },
          }
        )
      );
    });
  }

  return {
    addExpandedPlaylistModsSearchbarEvent,
    addExpandedPlaylistModsOrderEvent,
    addDeleteRecentlyAddedEvent,
  };
})();
(function () {
  obtainTokens()
    .then((hasToken) => {
      let getTokensSpinner = document.getElementById(
        config.CSS.IDs.getTokenLoadingSpinner
      );

      // remove token spinner because by this line we have obtained the token
      getTokensSpinner.parentNode.removeChild(getTokensSpinner);

      const infoContainer = document.getElementById(
        config.CSS.IDs.infoContainer
      );
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

  addEventListeners.addExpandedPlaylistModsSearchbarEvent();
  addEventListeners.addExpandedPlaylistModsOrderEvent();
  addEventListeners.addDeleteRecentlyAddedEvent();
})();
