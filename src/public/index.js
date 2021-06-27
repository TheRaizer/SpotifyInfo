import { config } from "./config.js";
import {
  checkIfHasTokens,
  getTokens,
  generateNavLogin,
} from "./manage-tokens.js";

async function obtainTokens() {
  let hasToken = await checkIfHasTokens();
  if (hasToken) {
    generateNavLogin(true);
    return;
  }

  hasToken = await getTokens(() => {
    // create spotify button if no auth code was found in the url
    generateNavLogin(false);
  });
  console.log("get tokens");
  return hasToken;
}

(function () {
  obtainTokens()
    .then((hasToken) => {
      let getTokensSpinner = document.getElementById(
        config.CSS.IDs.getTokenLoadingSpinner
      );

      // remove token spinner because by this line we have obtained the token
      getTokensSpinner.parentNode.removeChild(getTokensSpinner);
      if (hasToken) {
        generateNavLogin(true);
      }
    })
    .catch((err) => console.error(err));
})();
