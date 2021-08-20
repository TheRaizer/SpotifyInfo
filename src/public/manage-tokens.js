import { config, promiseHandler } from "./config.js";

const HALF_HOUR = 1.8e6; /* 30 min in ms */

export async function checkIfHasTokens() {
  // if the user stays on the same page for 30 sec refresh the token.
  function startRefreshInterval() {
    console.log("start interval refresh");
    setInterval(() => {
      promiseHandler(axios.put(config.URLs.putRefreshAccessToken));
      console.log("refresh async");
    }, HALF_HOUR);
  }
  let hasToken = false;
  // await promise resolve that returns whether the session has tokens.
  // because token is stored in session we need to reassign 'hasToken' to the client so we do not need to run this method again on refresh
  await promiseHandler(
    axios.get(config.URLs.getHasTokens),
    (res) => (hasToken = res.data)
  );

  if (hasToken) {
    startRefreshInterval();
  }
  return hasToken;
}
export async function getTokens(onNoToken) {
  let hasToken = false;
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
    onNoToken();
  }

  window.history.pushState(null, null, "/");
  return hasToken;
}

/** Generate a login/change account link. Defaults to appending it onto the nav bar.
 *
 * @param {Array<String>} classesToAdd - the classes to add onto the link.
 * @param {Boolean} changeAccount - Whether the link should be for changing account, or for logging in. (defaults to true)
 * @param {HTMLElement} parentEl - the parent element to append the link onto. (defaults to navbar)
 */
export function generateLogin({
  classesToAdd = ["right"],
  changeAccount = true,
  parentEl = document
    .getElementsByClassName("topnav")[0]
    .getElementsByClassName("right")[0]
    .getElementsByClassName("dropdown-content")[0],
} = {}) {
  // Create anchor element.
  let a = document.createElement("a");
  a.href = config.URLs.auth;

  // Create the text node for anchor element.
  let link = document.createTextNode(
    changeAccount ? "Change Account" : "Login To Spotify"
  );

  // Append the text node to anchor element.
  a.appendChild(link);
  for (let i = 0; i < classesToAdd.length; i++) {
    let classToAdd = classesToAdd[i];
    a.classList.add(classToAdd);
  }

  // clear current tokens when clicked
  a.addEventListener("click", () => {
    axios.put(config.URLs.putClearTokens).catch((err) => console.error(err));
  });

  // Append the anchor element to the parent.
  parentEl.appendChild(a);
}
export function onSuccessfulTokenCall(
  hasToken,
  hasTokenCallback = () => {},
  noTokenCallBack = () => {}
) {
  let getTokensSpinner = document.getElementById(
    config.CSS.IDs.getTokenLoadingSpinner
  );

  // remove token spinner because by this line we have obtained the token
  getTokensSpinner.parentNode.removeChild(getTokensSpinner);

  const infoContainer = document.getElementById(config.CSS.IDs.infoContainer);
  if (hasToken) {
    // generate the nav login
    generateLogin();
    infoContainer.style.display = "block";
    hasTokenCallback();
  } else {
    // if there is no token redirect to allow access page
    window.location.href = config.URLs.siteUrl;
    noTokenCallBack();
  }
}
