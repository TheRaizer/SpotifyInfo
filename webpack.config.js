const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    "public/playlists": "./src/public/pages/playlists-page/playlists.ts",
    "public/top-tracks": "./src/public/pages/top-tracks-page/top-tracks.ts",
    "public/top-artists": "./src/public/pages/top-artists-page/top-artists.ts",
    "public/profile": "./src/public/pages/profile-page/profile.ts",
    "public/index": "./src/public/index.ts",
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  // externals: {
  //   spotify-web-playback-sdk: "onSpotifyWebPlaybackSDKReady",
  // },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-bundle.js",
  },
};
