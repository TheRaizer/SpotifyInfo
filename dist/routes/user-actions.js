"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user-controller");
const router = (0, express_1.Router)();
exports.router = router;
router.put('/put-playlist-resize-data', user_controller_1.userCtrl.putPlaylistResizeData);
router.get('/get-playlist-resize-data', user_controller_1.userCtrl.getPlaylistResizeData);
router.put('/put-playlist-text-form-data', user_controller_1.userCtrl.putPlaylistTextFormData);
router.get('/get-playlist-text-form-data', user_controller_1.userCtrl.getPlaylistTextFormData);
router.put('/put-player-volume', user_controller_1.userCtrl.putPlayerVolumeData);
router.get('/get-player-volume', user_controller_1.userCtrl.getPlayerVolumeData);
router.put('/put-top-tracks-term', user_controller_1.userCtrl.putTopTracksTerm);
router.get('/get-top-tracks-term', user_controller_1.userCtrl.getTopTracksTerm);
router.put('/put-top-artists-term', user_controller_1.userCtrl.putTopArtistsTerm);
router.get('/get-top-artists-term', user_controller_1.userCtrl.getTopArtistsTerm);
router.put('/put-current-playlist-id', user_controller_1.userCtrl.putCurrPlaylistId);
router.get('/get-current-playlist-id', user_controller_1.userCtrl.getCurrPlaylistId);
//# sourceMappingURL=user-actions.js.map