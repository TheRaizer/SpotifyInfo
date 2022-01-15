"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class Profile {
    constructor(displayName, country, email, images, followers, externalURL) {
        this.displayName = displayName;
        this.country = country;
        this.email = email;
        this.profileImgUrl = (0, config_1.getValidImage)(images);
        this.followers = followers;
        this.externalURL = externalURL;
    }
}
exports.default = Profile;
//# sourceMappingURL=profile.js.map