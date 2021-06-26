import { config, promiseHandler } from "./config.js";

const HALF_HOUR = 1.8e6; /* ms */

export async function checkIfHasTokens() {
  // if the user stays on the same page for 30 sec refresh the token.
  function startRefreshInterval() {
    console.log("start interval refresh");
    setInterval(() => {
      promiseHandler(axios.post(config.URLs.postRefreshAccessToken));
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

  // because the code has been obtained we want to change the url
  // so it doesn't have the code without refreshing the page
  window.history.pushState(null, null, "/");
  return hasToken;
}