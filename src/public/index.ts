import { config } from './config'
import { checkIfHasTokens, getTokens, generateLogin } from './manage-tokens'
import axios from 'axios'

function createSpotifyLoginButton (changeAccount = false) {
  // Create anchor element.
  const btn = document.createElement('button')
  btn.style.width = '100px'
  btn.style.height = '50px'

  // Create the text node for anchor element.
  const link = document.createTextNode(
    changeAccount ? 'Change Account' : 'Login To Spotify'
  )
  // Append the text node to anchor element.
  btn.appendChild(link)
  btn.classList.add(config.CSS.CLASSES.glow)

  // clear current tokens when clicked
  btn.addEventListener('click', () => {
    axios.post(config.URLs.putClearTokens).catch((err) => console.error(err))
    window.location.href = config.URLs.auth
  })

  // Append the anchor element to the body.
  document.getElementById(config.CSS.IDs.infoContainer)?.appendChild(btn)
}

async function obtainTokens () {
  let hasToken = await checkIfHasTokens()
  if (hasToken) {
    generateLogin()
    return
  }

  hasToken = await getTokens(() => {
    // create spotify button if no auth code was found in the url
    generateLogin({ changeAccount: false })
    createSpotifyLoginButton()
  })
  console.log('get tokens')
  return hasToken
}

(function () {
  obtainTokens()
    .then((hasToken) => {
      const getTokensSpinner = document.getElementById(
        config.CSS.IDs.getTokenLoadingSpinner
      )

      // remove token spinner because by this line we have obtained the token
      getTokensSpinner?.parentNode?.removeChild(getTokensSpinner)
      if (hasToken) {
        generateLogin()
      }
    })
    .catch((err) => console.error(err))
})()
