import { promiseHandler, config } from "../../config.js";
import Profile from "../../components/profile.js";
import { getPlaylistTracksFromDatas } from "../../components/playlist.js";
import {
  checkIfHasTokens,
  onSuccessfulTokenCall,
  generateLogin,
} from "../../manage-tokens.js";

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
      let tracksArr = [];
      let tracksData = res.data.items.map((item) => item.track);

      getPlaylistTracksFromDatas(tracksData, res.data.items, tracksArr);
      displaySavedTracks(tracksArr);
    });
  }
  function displaySavedTracks(tracksArr) {
    let likedTracksUl = document.getElementById(config.CSS.IDs.likedTracks);
    tracksArr.forEach((track) => {
      likedTracksUl.append(track.getPlaylistTrackHtml());
    });
    console.log(tracksArr);
  }
  return { getSavedTracks };
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
    })
  );

  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener();
  });
})();
