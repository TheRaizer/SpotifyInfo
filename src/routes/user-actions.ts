import { Router } from 'express'
import { userCtrl } from '../controllers/user-controller'
const router = Router()

router.put('/put-playlist-resize-data', userCtrl.putPlaylistResizeData)
router.get('/get-playlist-resize-data', userCtrl.getPlaylistResizeData)

router.put('/put-playlist-text-form-data', userCtrl.putPlaylistTextFormData)
router.get('/get-playlist-text-form-data', userCtrl.getPlaylistTextFormData)

router.put('/put-player-volume', userCtrl.putPlayerVolumeData)
router.get('/get-player-volume', userCtrl.getPlayerVolumeData)

router.put('/put-top-tracks-term', userCtrl.putTopTracksTerm)
router.get('/get-top-tracks-term', userCtrl.getTopTracksTerm)

router.put('/put-top-artists-term', userCtrl.putTopArtistsTerm)
router.get('/get-top-artists-term', userCtrl.getTopArtistsTerm)

router.put('/put-current-playlist-id', userCtrl.putCurrPlaylistId)
router.get('/get-current-playlist-id', userCtrl.getCurrPlaylistId)

export { router }
