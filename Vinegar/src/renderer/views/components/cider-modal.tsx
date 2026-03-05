import { useEffect } from "react";

const CiderModal = ({ playlists }: { playlists: object[] }) => {
  const playlistSorted = [];
  const searchQuery = "";
  const focused = "";
  const app = this.$root;
  function mounted() {
    search();
    $refs.searchInput.focus();
    $refs.searchInput.addEventListener("keydown", (e) => {
      if (e.keyCode === 13) {
        if (focused !== "") {
          addToPlaylist(focused);
        }
      }
    });
  }
  useEffect(() => {
    mounted();
  }, []);
  const addToPlaylist = (id) => {
    app.addSelectedToPlaylist(id);
  };
  const search = () => {
    focused = "";
    if (searchQuery === "") {
      playlistSorted = playlists;
    } else {
      playlistSorted = playlists.filter((playlist) => {
        return playlist.attributes.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;
      });
      if (playlistSorted.length === 1) {
        focused = playlistSorted[0].id;
      }
    }
  };
  return (
    <div id="add-to-playlist">
      <template>
        <div
          className="modal-fullscreen modal-generic"
          clickself={app.resetState()}
          contextmenuself={app.resetState()}>
          <div className="modal-window">
            <div className="modal-header">
              <div className="modal-title">{app.getLz("action.addToLibrary")}</div>
              <button
                className="close-btn"
                onClick={() => app.resetState()}
                aria-label={app.getLz("action.close")}
              />
            </div>
            <div className="modal-content">
              {playlist.attributes.canEdit && playlist.type !== "library-playlist-folders"&& playlistSorted.map((playlist) => <button
                className="playlist-item"
                className="{ focused: playlist.id === focused }"
                onClick={() => addToPlaylist(playlist.id)}
                style={{ width: "100%" }}>
                <div className="icon">{import("../svg/playlist.svg")}</div>
                <div className="name">{playlist.attributes.name}</div>
              </button>)}
            </div>
            <div className="modal-search">
              <div
                className="search-input-container"
                style={{ width: "100%", margin: "16px 0" }}>
                <div className="search-input--icon" />
                <input
                  type="search"
                  ref="searchInput"
                  style={{ width: "100%" }}
                  spellCheck="false"
                  placeholder={app.getLz("term.search") + "..."}
                  v-model={searchQuery}
                  input={search()}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  );
};

export default CiderModal;
