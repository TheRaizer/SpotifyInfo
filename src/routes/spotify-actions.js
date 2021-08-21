import { Router } from "express";
export const router = Router();
import spotifyCtrl from "../controllers/spotify-controller.js";

router.get("/get-top-artists", spotifyCtrl.getTopArtists);
router.get("/get-top-tracks", spotifyCtrl.getTopTracks);
router.get("/get-playlists", spotifyCtrl.getPlaylists);
router.get("/get-playlist-tracks", spotifyCtrl.getPlaylistTracks);
router.get("/get-tracks-features", spotifyCtrl.getTrackFeatures);
router.delete("/delete-playlist-items", spotifyCtrl.deletePlaylistItems);
router.post("/post-playlist-items", spotifyCtrl.postPlaylistItems);
router.put("/put-session-data", spotifyCtrl.putSessionData);
router.get("/get-session-data", spotifyCtrl.getSessionData);
router.get("/get-artist-top-tracks", spotifyCtrl.getArtistTopTracks);
router.get("/get-current-user-profile", spotifyCtrl.getCurrentUserProfile);
router.get(
  "/get-current-user-saved-tracks",
  spotifyCtrl.getCurrentUserSavedTracks
);
