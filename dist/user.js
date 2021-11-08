"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor() {
        this.access_token = '';
        this.refresh_token = '';
        this.updateDate = new Date();
        this.playlistResizeWidth = '';
        this.playlistIsInTextForm = 'true';
        this.playerVolume = '0.4';
        this.topTracksTerm = 'short_term';
        this.topArtistsTerm = 'short_term';
        this.currPlaylistId = '';
        this.id = '';
        this.username = '';
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map