const getCurrentlyPlaying = (token) => {
  axios.get("https://api.spotify.com/v1/me/player");
  // Make a call using the token
  axios({
    method: "get",
    url: "https://api.spotify.com/v1/me/player",
    headers: { Authorization: "Bearer " + token },
  }).then(function (response) {
    this.setState({
      item: response.item,
      is_playing: response.is_playing,
      progress_ms: response.progress_ms,
    });
  });
};
