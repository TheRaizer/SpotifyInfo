import { promiseHandler } from './config'
import { checkIfHasTokens, getTokens, onSuccessfulTokenCall } from './manage-tokens'

(function () {
  promiseHandler<boolean>(checkIfHasTokens(), (hasToken) => {
    if (!hasToken) {
      promiseHandler<boolean>(getTokens(), (obtainedToken) => {
        onSuccessfulTokenCall(obtainedToken, () => {}, () => {}, false)
      })
    } else {
      onSuccessfulTokenCall(true)
    }
  })
})()
