class User {
  access_token: string = '';
  refresh_token: string = '';
  updateDate: Date = new Date();
  playlistResizeWidth: string = '';
  playlistIsInTextForm: string = 'false';
  playerVolume: string = '0.4';
  currentPlayingTrack: { title: string; uri: string; position: string } = { title: '', uri: '', position: '' }
}

export default User
