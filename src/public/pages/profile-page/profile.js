import { config, promiseHandler } from "../../config.js";
import { checkIfHasTokens, generateNavLogin } from "../../manage-tokens.js";

(function () {
  function onSuccessfulTokenCall(hasToken) {
    let getTokensSpinner = document.getElementById(
      config.CSS.IDs.getTokenLoadingSpinner
    );

    // remove token spinner because by this line we have obtained the token
    getTokensSpinner.parentNode.removeChild(getTokensSpinner);

    const infoContainer = document.getElementById(config.CSS.IDs.infoContainer);
    if (hasToken) {
      generateNavLogin();
      infoContainer.style.display = "block";
    } else {
      // if there is no token redirect to allow access page
      window.location.href = "http://localhost:3000/";
    }
  }

  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken)
  );
  // Object.entries(addEventListeners).forEach(([, addEventListener]) => {
  //   addEventListener();
  // });
})();
