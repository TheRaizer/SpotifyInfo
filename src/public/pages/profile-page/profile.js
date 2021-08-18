import { promiseHandler } from "../../config.js";
import {
  checkIfHasTokens,
  onSuccessfulTokenCall,
} from "../../manage-tokens.js";

(function () {
  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken)
  );
  // Object.entries(addEventListeners).forEach(([, addEventListener]) => {
  //   addEventListener();
  // });
})();
