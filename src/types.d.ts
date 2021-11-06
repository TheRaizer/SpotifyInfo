
export type SpotifyImg = {
  url: string
}

export type FeaturesData = {
  [key: string]: string
  danceability: string
  acousticness: string
  instrumentalness: string
  valence: string
  energy: string
}

export type PlaylistTrackData = {
  track: unknown
  added_at: string | number | Date
}

export type PlaylistData = {
  name: string
  images: Array<SpotifyImg>
  id: string
}

export type ExternalUrls = {
  spotify: string
}
export interface IArtistTrackData {
  name: string
  external_urls: ExternalUrls
}

export type Followers = {
  total: string
}

export type ProfileData = {
  display_name: string
  country: string
  email: string
  images: Array<SpotifyImg>
  followers: Followers
  external_urls: ExternalUrls
}

export type ArtistData = {
  id: string
  name: string
  genres: Array<string>
  followers: Followers
  external_urls: ExternalUrls
  images: Array<SpotifyImg>
}

export type AlbumData = {
  name: string
  images: Array<SpotifyImg>
  release_date: string
  external_urls: ExternalUrls
}

export type TrackData = {
  name: string
  duration_ms: number
  uri: string
  linked_from?: { uri: string }
  popularity: string
  id: string
  album: AlbumData
  external_urls: ExternalUrls
  artists: Array<unknown>
  idx: number
}

/**
 * selEl must have a unique id as play and pause elements are compared by element id.
 */
export interface IPlayable {
  selEl: Element
  uri: string
  imageUrl: string
  title: string
  artistsHtml: string
  onPlaying: Function
  onStopped: Function
}

export interface IPromiseHandlerReturn<T> {
  res: null | T
  err: null | unknown
}
