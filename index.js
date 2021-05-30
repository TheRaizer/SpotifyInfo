const playlistsElement = document.getElementById("playlists");

const displayPlaylists = (playlists) => {
  const htmlString = playlists
    .map((playlist) => {
      return `
            <div class="playlist">
                <h3>${playlist.name}</h3>
                <img src="${playlist.img}"></img>
            </div>
        `;
    })
    .join("");
  playlistsElement.innerHTML = htmlString;
};

const list = [
  { name: "Playlist 1", img: "img" },
  { name: "Playlist 2", img: "img" },
  { name: "Playlist 3", img: "img" },
  { name: "Playlist 4", img: "img" },
  { name: "Playlist 5", img: "img" },
  { name: "Playlist 6", img: "img" },
  { name: "Playlist 7", img: "img" },
  { name: "Playlist 8", img: "img" },
];

window.onload = function () {
  displayPlaylists(list);
};
