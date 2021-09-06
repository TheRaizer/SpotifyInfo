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
const config_js_1 = require("./config.js");
const manage_tokens_js_1 = require("./manage-tokens.js");
function createSpotifyLoginButton(changeAccount = false) {
  // Create anchor element.
  const btn = document.createElement("button");
  btn.style.width = "100px";
  btn.style.height = "50px";
  // Create the text node for anchor element.
  const link = document.createTextNode(
    changeAccount ? "Change Account" : "Login To Spotify"
  );
  // Append the text node to anchor element.
  btn.appendChild(link);
  btn.classList.add(config_js_1.config.CSS.CLASSES.glow);
  // clear current tokens when clicked
  btn.addEventListener("click", () => {
    axios
      .post(config_js_1.config.URLs.postClearTokens)
      .catch((err) => console.error(err));
    window.location.href = config_js_1.config.URLs.auth;
  });
  // Append the anchor element to the body.
  document
    .getElementById(config_js_1.config.CSS.IDs.infoContainer)
    .appendChild(btn);
}
function obtainTokens() {
  return __awaiter(this, void 0, void 0, function* () {
    let hasToken = yield (0, manage_tokens_js_1.checkIfHasTokens)();
    if (hasToken) {
      (0, manage_tokens_js_1.generateLogin)();
      return;
    }
    hasToken = yield (0, manage_tokens_js_1.getTokens)(() => {
      // create spotify button if no auth code was found in the url
      (0, manage_tokens_js_1.generateLogin)({ changeAccount: false });
      createSpotifyLoginButton();
    });
    console.log("get tokens");
    return hasToken;
  });
}
(function () {
  obtainTokens()
    .then((hasToken) => {
      const getTokensSpinner = document.getElementById(
        config_js_1.config.CSS.IDs.getTokenLoadingSpinner
      );
      // remove token spinner because by this line we have obtained the token
      getTokensSpinner.parentNode.removeChild(getTokensSpinner);
      if (hasToken) {
        (0, manage_tokens_js_1.generateLogin)();
      }
    })
    .catch((err) => console.error(err));
})();
