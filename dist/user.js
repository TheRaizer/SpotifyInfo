"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor() {
        this.access_token = '';
        this.refresh_token = '';
        this.updateDate = new Date();
        this.playlistResizeWidth = '';
        this.playlistIsInTextForm = 'false';
        this.playerVolume = '0.4';
        this.currentPlayingTrack = { title: '', uri: '', position: '' };
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map