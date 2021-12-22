import axios from 'axios'
import { animationControl, config, promiseHandler } from './config'
import { checkIfHasTokens, getTokens, onSuccessfulTokenCall } from './manage-tokens'

const HALF_HOUR = 1.8e6 /* 30 min in ms */

// if the user stays on the same page for 30 min refresh the token.
// only refresh on home page as the web player will refresh token on other pages.
const startRefreshInterval = () => {
  console.log('start interval refresh')
  setInterval(() => {
    promiseHandler(axios.put(config.URLs.putRefreshAccessToken))
    console.log('refresh async')
  }, HALF_HOUR)
}
function generateCustomLoginButton () {
  // Create anchor element.
  const a = document.createElement('a')
  a.href = config.URLs.auth
  a.classList.add(config.CSS.CLASSES.glow)

  // Create the text node for anchor element.
  const link = document.createTextNode('Login To Spotify')

  // Append the text node to anchor element.
  a.appendChild(link)

  // clear current tokens when clicked
  a.addEventListener('click', () => {
    a?.parentNode?.removeChild(a)
  })
  const parentEl = document.getElementById(config.CSS.IDs.homeHeader)

  // Append the anchor element to the parent.
  parentEl?.appendChild(a)
}

(function () {
  promiseHandler<boolean>(checkIfHasTokens(), (hasToken) => {
    if (!hasToken) {
      promiseHandler<boolean>(getTokens(), (obtainedToken) => {
        onSuccessfulTokenCall(obtainedToken, () => {
          startRefreshInterval()
        }, () => {
          generateCustomLoginButton()
        }, false)
      })
    } else {
      startRefreshInterval()
      onSuccessfulTokenCall(true)
    }
  })
})()

window.onload = function () {
  document.body.className += 'loaded'
  animationControl.addClassOnInterval('.feature-area', 'appear', 200)
}
