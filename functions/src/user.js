"use strict";
exports.__esModule = true;
var User = /** @class */ (function () {
    function User() {
        this.access_token = '';
        this.refresh_token = '';
        this.updateDate = new Date();
        this.playlistResizeWidth = '';
        this.playlistIsInTextForm = 'true';
        this.topTracksIsInTextForm = 'true';
        this.playerVolume = '0.4';
        this.topTracksTerm = 'short_term';
        this.topArtistsTerm = 'short_term';
        this.currPlaylistId = '';
        this.id = '';
        this.username = '';
    }
    return User;
}());
exports["default"] = User;
