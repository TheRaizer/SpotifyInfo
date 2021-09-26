
class User {
  access_token: string = '';
  refresh_token: string = '';
  updateDate: Date = new Date();
  playlistResizeWidth: string = '';
  playlistIsInTextForm: string = 'false';
  playerVolume: string = '0.4';
  topTracksTerm: string = 'short_term';
  topArtistsTerm: string = 'short_term';
  currPlaylistId: string = '';
}

export default User
