export const Component = () => {
  Vue.component("add-to-playlist", {
    template: "#add-to-playlist",
    data: function () {
      return {
        playlistSorted: [],
        searchQuery: "",
        focused: "",
        app: this.$root,
      };
    },
    props: {
      playlists: {
        type: Array,
        required: true,
      },
    },
    mounted() {
      this.search();
      this.$refs.searchInput.focus();
      this.$refs.searchInput.addEventListener("keydown", (e) => {
        if (e.keyCode == 13) {
          if (this.focused != "") {
            this.addToPlaylist(this.focused);
          }
        }
      });
    },
    methods: {
      addToPlaylist(id) {
        app.addSelectedToPlaylist(id);
      },
      search() {
        this.focused = "";
        if (this.searchQuery == "") {
          this.playlistSorted = this.playlists;
        } else {
          this.playlistSorted = this.playlists.filter((playlist) => {
            return playlist.attributes.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1;
          });
          if (this.playlistSorted.length == 1) {
            this.focused = this.playlistSorted[0].id;
          }
        }
      },
    },
  });
  return (
    <div id="add-to-playlist">
      <template>
        <div
          className="modal-fullscreen modal-generic"
          clickself="app.resetState()"
          contextmenuself="app.resetState()">
          <div className="modal-window">
            <div className="modal-header">
              <div className="modal-title">{app.getLz("action.addToLibrary")}</div>
              <button
                className="close-btn"
                click="app.resetState()"
                aria-label="app.getLz('action.close')"></button>
            </div>
            <div className="modal-content">
              <button
                className="playlist-item"
                className="{ focused: playlist.id == focused }"
                click="addToPlaylist(playlist.id)"
                style="width:100%;"
                v-for="playlist in playlistSorted"
                v-if="playlist.attributes.canEdit && playlist.type != 'library-playlist-folders'">
                <div className="icon">{import("../svg/playlist.svg")}</div>
                <div className="name">{playlist.attributes.name}</div>
              </button>
            </div>
            <div className="modal-search">
              <div
                className="search-input-container"
                style="width:100%;margin: 16px 0;">
                <div className="search-input--icon"></div>
                <input
                  type="search"
                  ref="searchInput"
                  style="width:100%;"
                  spellcheck="false"
                  placeholder="app.getLz('term.search') + '...'"
                  v-model="searchQuery"
                  input="search()"
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
