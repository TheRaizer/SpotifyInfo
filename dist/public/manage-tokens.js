const exports = {};

("use strict");
const __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSuccessfulTokenCall =
  exports.generateLogin =
  exports.getTokens =
  exports.checkIfHasTokens =
    void 0;
const config_js_1 = require("./config.js");
const HALF_HOUR = 1.8e6; /* 30 min in ms */
function checkIfHasTokens() {
  return __awaiter(this, void 0, void 0, function* () {
    // if the user stays on the same page for 30 min refresh the token.
    function startRefreshInterval() {
      console.log("start interval refresh");
      setInterval(() => {
        (0, config_js_1.promiseHandler)(
          axios.put(config_js_1.config.URLs.putRefreshAccessToken)
        );
        console.log("refresh async");
      }, HALF_HOUR);
    }
    let hasToken = false;
    // await promise resolve that returns whether the session has tokens.
    // because token is stored in session we need to reassign 'hasToken' to the client so we do not need to run this method again on refresh
    yield (0,
    config_js_1.promiseHandler)(axios.get(config_js_1.config.URLs.getHasTokens), (res) => (hasToken = res.data));
    if (hasToken) {
      startRefreshInterval();
    }
    return hasToken;
  });
}
exports.checkIfHasTokens = checkIfHasTokens;
function getTokens(onNoToken) {
  return __awaiter(this, void 0, void 0, function* () {
    let hasToken = false;
    // create a parameter searcher in the URL after '?' which holds the requests body parameters
    const urlParams = new URLSearchParams(window.location.search);
    // Get the code from the parameter called 'code' in the url which
    // hopefully came back from the spotify GET request otherwise it is null
    let authCode = urlParams.get("code");
    if (authCode) {
      yield (0, config_js_1.promiseHandler)(
        axios.get(
          `${config_js_1.config.URLs.getObtainTokensPrefix}${authCode}`
        ),
        // if the request was succesful we have recieved a token
        () => (hasToken = true)
      );
      authCode = "";
    } else {
      onNoToken();
    }
    window.history.pushState(null, null, "/");
    return hasToken;
  });
}
exports.getTokens = getTokens;
/** Generate a login/change account link. Defaults to appending it onto the nav bar.
 *
 * @param {Array<String>} classesToAdd - the classes to add onto the link.
 * @param {Boolean} changeAccount - Whether the link should be for changing account, or for logging in. (defaults to true)
 * @param {HTMLElement} parentEl - the parent element to append the link onto. (defaults to navbar)
 */
function generateLogin({
  classesToAdd = ["right"],
  changeAccount = true,
  parentEl = document
    .getElementsByClassName("topnav")[0]
    .getElementsByClassName("right")[0]
    .getElementsByClassName("dropdown-content")[0],
} = {}) {
  // Create anchor element.
  const a = document.createElement("a");
  a.href = config_js_1.config.URLs.auth;
  // Create the text node for anchor element.
  const link = document.createTextNode(
    changeAccount ? "Change Account" : "Login To Spotify"
  );
  // Append the text node to anchor element.
  a.appendChild(link);
  for (let i = 0; i < classesToAdd.length; i++) {
    const classToAdd = classesToAdd[i];
    a.classList.add(classToAdd);
  }
  // clear current tokens when clicked
  a.addEventListener("click", () => {
    axios
      .put(config_js_1.config.URLs.putClearTokens)
      .catch((err) => console.error(err));
  });
  // Append the anchor element to the parent.
  parentEl.appendChild(a);
}
exports.generateLogin = generateLogin;
function onSuccessfulTokenCall(
  hasToken,
  hasTokenCallback = () => {},
  noTokenCallBack = () => {}
) {
  const getTokensSpinner = document.getElementById(
    config_js_1.config.CSS.IDs.getTokenLoadingSpinner
  );
  // remove token spinner because by this line we have obtained the token
  getTokensSpinner.parentNode.removeChild(getTokensSpinner);
  const infoContainer = document.getElementById(
    config_js_1.config.CSS.IDs.infoContainer
  );
  if (hasToken) {
    // generate the nav login
    generateLogin();
    infoContainer.style.display = "block";
    hasTokenCallback();
  } else {
    // if there is no token redirect to allow access page
    window.location.href = config_js_1.config.URLs.siteUrl;
    noTokenCallBack();
  }
}
exports.onSuccessfulTokenCall = onSuccessfulTokenCall;
