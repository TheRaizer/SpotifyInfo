import { promiseHandler, config } from "../../config.js";
import Profile from "../../components/profile.js";
import { getPlaylistTracksFromDatas } from "../../components/playlist.js";
import {
  checkIfHasTokens,
  onSuccessfulTokenCall,
  generateLogin,
} from "../../manage-tokens.js";
import { generateArtistsFromData } from "../../components/artist.js";
import CardActionsHandler from "../../card-actions.js";

function displayProfile(profile) {
  const displayName = document
    .getElementById(config.CSS.IDs.profileHeader)
    .getElementsByTagName("h1")[0];
  const followerCount = document
    .getElementById(config.CSS.IDs.profileHeader)
    .getElementsByTagName("h4")[0];
  const profileImage = document
    .getElementById(config.CSS.IDs.profileHeader)
    .getElementsByTagName("img")[0];

  displayName.textContent = profile.displayName;
  followerCount.textContent = profile.followers + " followers";
  profileImage.src =
    profile.profileImgUrl == ""
      ? "/images/profile-user.png"
      : profile.profileImgUrl;
}

async function retrieveProfile() {
  function onSuccesful(res) {
    const data = res.data;
    let profile = new Profile(
      data.display_name,
      data.country,
      data.email,
      data.images,
      data.followers.total,
      data.external_urls.spotify
    );

    displayProfile(profile);
  }

  // get profile data from api
  await promiseHandler(
    axios.get(config.URLs.getCurrentUserProfile),
    onSuccesful,
    (err) => {
      // throw error that will be passed down to the promise handler that ran retrieveProfile().
      throw new Error(err);
    }
  );
}

const addEventListeners = (function () {
  /** Adds the click event listener that clears session data and returns user back to home page.
   *
   */
  function addClearDataListener() {
    const clearDataEl = document.getElementById(config.CSS.IDs.clearData);
    clearDataEl.href = config.URLs.siteUrl;

    function onClick() {
      axios.put(config.URLs.putClearSession);
    }

    clearDataEl.addEventListener("click", onClick);
  }
  return { addClearDataListener };
})();

const savedTracksActions = (function () {
  function getSavedTracks() {
    promiseHandler(axios.get(config.URLs.getCurrentUserSavedTracks), (res) => {
      // if we retrieved the tracks succesfully, then display them
      let tracksArr = [];
      let tracksData = res.data.items.map((item) => item.track);

      getPlaylistTracksFromDatas(tracksData, res.data.items, tracksArr);
      displaySavedTracks(tracksArr);
    });
  }
  function displaySavedTracks(tracksArr) {
    const likedTracksUl = document.getElementById(config.CSS.IDs.likedTracks);
    tracksArr.forEach((track) => {
      likedTracksUl.append(track.getPlaylistTrackHtml());
    });
  }
  return { getSavedTracks };
})();

const followedArtistActions = (function () {
  const cardActionsHandler = new CardActionsHandler(50);

  function getFollowedArtists() {
    promiseHandler(axios.get(config.URLs.getFollowedArtists), (res) => {
      // if we retrieved the artists succesfully, then display them
      var artistArr = [];
      generateArtistsFromData(res.data.artists.items, artistArr);
      displayFollowedArtists(artistArr);
    });
  }
  function displayFollowedArtists(followedArtists) {
    const cardGrid = document.getElementById(config.CSS.IDs.followedArtists);

    // display the cards
    let i = 0;
    followedArtists.forEach((artist) => {
      cardGrid.append(artist.getArtistCardHtml(i, true));
      i++;
    });

    let artistCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.artist)
    );

    // add event listeners to the cards
    cardActionsHandler.addAllEventListeners(
      artistCards,
      followedArtists,
      null,
      true,
      false
    );
  }

  return { getFollowedArtists };
})();

(function () {
  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken, () => {
      // get user profile
      promiseHandler(
        retrieveProfile(),
        () => {
          generateLogin({
            classesToAdd: ["glow"],
            parentEl: document.getElementById("account-btns"),
          });
        },
        () => console.log("Problem when getting information")
      );

      savedTracksActions.getSavedTracks();
      followedArtistActions.getFollowedArtists();
    })
  );

  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener();
  });
})();
