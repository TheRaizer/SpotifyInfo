import { config, promiseHandler, throwExpression } from './config'
import axios from 'axios'
import { displayUsername } from './user-data'

export async function checkIfHasTokens (): Promise<boolean> {
  let hasToken = false
  // await promise resolve that returns whether the session has tokens.
  await promiseHandler(
    axios.get(config.URLs.getHasTokens),
    (res) => {
      hasToken = res.data
    }
  )

  return hasToken
}

export async function getTokens () {
  let hasToken = false
  // create a parameter searcher in the URL after '?' which holds the requests body parameters
  const urlParams = new URLSearchParams(window.location.search)

  // Get the code from the parameter called 'code' in the url which
  // hopefully came back from the spotify GET request otherwise it is null
  let authCode = urlParams.get('code')

  if (authCode) {
    // obtain tokens
    await promiseHandler(
      axios.get(config.URLs.getObtainTokensPrefix(authCode)),

      // if the request was succesful we have recieved a token
      () => {
        hasToken = true
      }
    )
    authCode = ''

    // get user info from spotify
    await promiseHandler(axios.get(config.URLs.getCurrentUserProfile))
  }

  window.history.pushState(null, '', '/')
  return hasToken
}

/** Generate a login/change account link. Defaults to appending it onto the nav bar.
 *
 * @param {Array<String>} classesToAdd - the classes to add onto the link.
 * @param {Boolean} changeAccount - Whether the link should be for changing account, or for logging in. (defaults to true)
 * @param {HTMLElement} parentEl - the parent element to append the link onto. (defaults to navbar)
 */
export function generateLogin ({
  classesToAdd = ['right'],
  changeAccount = true,
  parentEl = document
    .getElementsByClassName('topnav')[0]
    .getElementsByClassName('right')[0]
    .getElementsByClassName('dropdown-content')[0]
} = {}) {
  // Create anchor element.
  const a = document.createElement('a')
  a.href = config.URLs.auth

  // Create the text node for anchor element.
  const link = document.createTextNode(
    changeAccount ? 'Change Account' : 'Login To Spotify'
  )

  // Append the text node to anchor element.
  a.appendChild(link)
  for (let i = 0; i < classesToAdd.length; i++) {
    const classToAdd = classesToAdd[i]
    a.classList.add(classToAdd)
  }

  // clear current tokens when clicked
  a.addEventListener('click', () => {
    axios.put(config.URLs.putClearTokens).catch((err) => console.error(err))
  })

  // Append the anchor element to the parent.
  parentEl.appendChild(a)
}
export function onSuccessfulTokenCall (
  hasToken: boolean,
  hasTokenCallback = () => { },
  noTokenCallBack = () => { },
  redirectHome = true
) {
  const getTokensSpinner = document.getElementById(
    config.CSS.IDs.getTokenLoadingSpinner
  )

  // remove token spinner because by this line we have obtained the token
  getTokensSpinner?.parentNode?.removeChild(getTokensSpinner)

  const infoContainer = document.getElementById(config.CSS.IDs.infoContainer)

  // generate the nav login
  generateLogin({ changeAccount: hasToken, parentEl: document.getElementById(config.CSS.IDs.topNavMobile) ?? throwExpression('No top nav mobile element found') })
  generateLogin({ changeAccount: hasToken })
  if (hasToken) {
    if (infoContainer == null) {
      throw new Error('Info container Element does not exist')
    }
    infoContainer.style.display = 'block'
    displayUsername()
    console.log('display username')
    hasTokenCallback()
  } else {
    // if there is no token redirect to allow access page
    if (redirectHome) { window.location.href = config.URLs.siteUrl }
    noTokenCallBack()
  }
}
