import { SpotifyImg } from './types'

class User {
  access_token: string = '';
  refresh_token: string = '';
  updateDate: Date = new Date();
  playlistResizeWidth: string = '';
  playlistIsInTextForm: string = 'true';
  topTracksIsInTextForm: string = 'true'
  playerVolume: string = '0.4';
  topTracksTerm: string = 'short_term';
  topArtistsTerm: string = 'short_term';
  currPlaylist: { name: string; images: Array<SpotifyImg>; id: string } = { name: '', images: [], id: '' }
  id: string = '';
  username: string = '';
}

export default User
