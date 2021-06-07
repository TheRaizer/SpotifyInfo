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
  const playlistsContainer = document.getElementById(config.CSS.IDs.playlists);
  const tracksContainer = document.getElementById(config.CSS.IDs.tracks);
  const playlistObjs = [];
  const topTrackObjs = [];
  var currSelectedPlaylistEl = null;

  function loadPlaylistTracksToHtmlString(playlistObj, useHtmlString) {
    // asynchronously load the tracks and replace the html once it loads
    playlistObj
      .getTracks()
      .then((tracks) => {
        console.log("loaded tracks");
        // overwrite the previous songlist with the current one
        const htmlString = `
            ${tracks
              .map((track) => {
                return track.getPlaylistTrackHtml();
              })
              .join("")}`;

        useHtmlString(htmlString);
      })
      .catch((err) => {
        console.log("Error when getting tracks");
        console.error(err);
      });
  }
  function showExpandedPlaylist(playlistObj) {
    const expandedPlaylistMods = document.getElementById(
      config.CSS.IDs.expandedPlaylistMods
    );
    const trackList = expandedPlaylistMods.getElementsByTagName("ul")[0];
    const playlistTitle = expandedPlaylistMods.getElementsByTagName("h2")[0];
    playlistTitle.textContent = playlistObj.name;

    // initially show the playlist with the loading spinner
    const htmlString = `
            <li>
              <img src="200pxLoadingSpinner.svg" />
            </li>`;

    trackList.innerHTML = htmlString;
    expandedPlaylistMods.classList.add(config.CSS.CLASSES.appear);

    loadPlaylistTracksToHtmlString(playlistObj, (loadedHtmlString) => {
      trackList.innerHTML = loadedHtmlString;
    });
    console.log("synchronously after running load tracks");
  }
  function unselectPlaylist(playlistEl) {
    playlistEl.classList.remove(config.CSS.CLASSES.selected);

    let expandedPlaylistEl = document.getElementById(
      config.CSS.IDs.expandedPlaylistMods
    );
    expandedPlaylistEl.classList.remove(config.CSS.CLASSES.appear);
  }
  function selectPlaylist(playlistEl, playlistObj) {
    // on click add the selected class onto the element which runs a transition
    playlistEl.classList.add(config.CSS.CLASSES.selected);
    showExpandedPlaylist(playlistObj);
  }
  function addOnPlaylistClick() {
    function onPlaylistElementClick(playlistEl) {
      // get corrosponding playlist object using the elements id
      let playlistObj = playlistObjs.find(
        (x) => x.playlistElementId === playlistEl.id
      );

      // if the element is selected already then unselect it and hide its expanded playlist
      if (playlistEl.classList.contains(config.CSS.CLASSES.selected)) {
        unselectPlaylist(playlistEl);
      } else {
        // if there is an existing playlist selected unselect it
        if (currSelectedPlaylistEl) {
          unselectPlaylist(currSelectedPlaylistEl);
        }

        // make the currently selected playlist this playlist and select it.
        currSelectedPlaylistEl = playlistEl;
        selectPlaylist(currSelectedPlaylistEl, playlistObj);
      }
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
    let infoSpinners = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.infoLoadingSpinners)
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

    displayPlaylistCards(playlistObjs);
    displayTrackCards(topTrackObjs);
  }
  return {
    getInformation: getInformation,
  };
})();

function searchUl(ul, input) {
  let tracksLi = ul.getElementsByTagName("li");
  let filter = input.value.toUpperCase();

  for (let i = 0; i < tracksLi.length; i++) {
    let trackNameh4 = tracksLi[i].getElementsByTagName("h4")[0];
    let nameTxt = trackNameh4.textContent || trackNameh4.innerText;
    if (nameTxt.toUpperCase().indexOf(filter) > -1) {
      tracksLi[i].style.display = "grid";
    } else {
      tracksLi[i].style.display = "none";
    }
  }
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

document
  .getElementById(config.CSS.IDs.expandedPlaylistMods)
  .getElementsByClassName(config.CSS.CLASSES.playlistSearch)[0]
  .addEventListener("keyup", () => {
    const expandedPlaylistMods = document.getElementById(
      config.CSS.IDs.expandedPlaylistMods
    );
    const trackList = expandedPlaylistMods.getElementsByTagName("ul")[0];
    const playlistSearchInput = expandedPlaylistMods.getElementsByClassName(
      config.CSS.CLASSES.playlistSearch
    )[0];
    searchUl(trackList, playlistSearchInput);
  });
