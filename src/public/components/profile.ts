import { getValidImage } from '../config'
import { SpotifyImg } from '../types'
export default class Profile {
  displayName: string;
  country: string;
  email: string;
  profileImgUrl: string;
  followers: string;
  externalURL: string;

  constructor (displayName: string, country: string, email: string, images: Array<SpotifyImg>, followers: string, externalURL: string) {
    this.displayName = displayName
    this.country = country
    this.email = email
    this.profileImgUrl = getValidImage(images)
    this.followers = followers
    this.externalURL = externalURL
  }
}
