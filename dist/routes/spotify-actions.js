"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const spotify_controller_1 = require("../controllers/spotify-controller");
const router = (0, express_1.Router)();
exports.router = router;
router.get('/get-top-artists', spotify_controller_1.spotifyCtrl.getTopArtists);
router.get('/get-top-tracks', spotify_controller_1.spotifyCtrl.getTopTracks);
router.get('/get-playlists', spotify_controller_1.spotifyCtrl.getPlaylists);
router.get('/get-playlist-tracks', spotify_controller_1.spotifyCtrl.getPlaylistTracks);
router.get('/get-tracks-features', spotify_controller_1.spotifyCtrl.getTrackFeatures);
router.delete('/delete-playlist-items', spotify_controller_1.spotifyCtrl.deletePlaylistItems);
router.post('/post-playlist-items', spotify_controller_1.spotifyCtrl.postPlaylistItems);
router.get('/get-artist-top-tracks', spotify_controller_1.spotifyCtrl.getArtistTopTracks);
router.get('/get-current-user-profile', spotify_controller_1.spotifyCtrl.getCurrentUserProfile);
router.get('/get-current-user-saved-tracks', spotify_controller_1.spotifyCtrl.getCurrentUserSavedTracks);
router.get('/get-followed-artists', spotify_controller_1.spotifyCtrl.getFollowedArtists);
router.put('/play-track', spotify_controller_1.spotifyCtrl.putPlayTrack);
router.post('/post-playlist', spotify_controller_1.spotifyCtrl.postCreatePlaylist);
router.post('/post-items-to-playlist', spotify_controller_1.spotifyCtrl.postItemsToPlaylist);
//# sourceMappingURL=spotify-actions.js.map