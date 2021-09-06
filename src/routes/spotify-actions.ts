import { Router } from 'express'
import { spotifyCtrl } from '../controllers/spotify-controller'
const router = Router()

router.get('/get-top-artists', spotifyCtrl.getTopArtists)
router.get('/get-top-tracks', spotifyCtrl.getTopTracks)
router.get('/get-playlists', spotifyCtrl.getPlaylists)
router.get('/get-playlist-tracks', spotifyCtrl.getPlaylistTracks)
router.get('/get-tracks-features', spotifyCtrl.getTrackFeatures)
router.delete('/delete-playlist-items', spotifyCtrl.deletePlaylistItems)
router.post('/post-playlist-items', spotifyCtrl.postPlaylistItems)

router.put('/put-playlist-resize-data', spotifyCtrl.putPlaylistResizeData)
router.get('/get-playlist-resize-data', spotifyCtrl.getPlaylistResizeData)
router.put('/put-playlist-text-form-data', spotifyCtrl.putPlaylistTextFormData)
router.get('/get-playlist-text-form-data', spotifyCtrl.getPlaylistTextFormData)

router.get('/get-artist-top-tracks', spotifyCtrl.getArtistTopTracks)
router.get('/get-current-user-profile', spotifyCtrl.getCurrentUserProfile)
router.get(
  '/get-current-user-saved-tracks',
  spotifyCtrl.getCurrentUserSavedTracks
)
router.get('/get-followed-artists', spotifyCtrl.getFollowedArtists)
router.put('/play-track', spotifyCtrl.putPlayTrack)

export { router }
