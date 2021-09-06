import { Router } from 'express'
import { tokenCtrl } from '../controllers/token-controller'
const router = Router()

// whether the session has tokens
router.get('/has-tokens', tokenCtrl.hasTokens)

router.put('/refresh-token', tokenCtrl.refreshTokens)

router.put('/clear-tokens', tokenCtrl.clearTokens)

// expecting /retrieve_tokens?code=XXXX
router.get('/obtain-tokens', tokenCtrl.obtainTokens)

router.get('/get-access-token', tokenCtrl.getAccessToken)

export { router }
