import { animationControl, promiseHandler } from './config'
import { checkIfHasTokens, getTokens, onSuccessfulTokenCall } from './manage-tokens'

function generateCustomLoginButton () {

}

(function () {
  promiseHandler<boolean>(checkIfHasTokens(), (hasToken) => {
    if (!hasToken) {
      promiseHandler<boolean>(getTokens(), (obtainedToken) => {
        onSuccessfulTokenCall(obtainedToken, () => {}, () => {
          console.log('no token')
        }, false)
      })
    } else {
      onSuccessfulTokenCall(true)
    }
  })
})()

window.onload = function () {
  document.body.className += 'loaded'
  animationControl.addClassOnInterval('.feature-area', 'appear', 200)
}
