import { getValidImage } from "../config.js";

export default class Profile {
  constructor(displayName, country, email, images, followers, externalURL) {
    this.displayName = displayName;
    this.country = country;
    this.email = email;
    this.profileImgUrl = getValidImage(images);
    this.followers = followers;
    this.externalURL = externalURL;
  }
}
