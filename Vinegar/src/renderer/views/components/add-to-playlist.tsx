import plus from "../svg/plus.svg";
export const addToPlay = ({playlists}: {playlists: string[]}) => {
  let playlistSorted = [];
  let searchQuery = "";
  let focused = "";
  const app = this.$root;
  const relateItems = [this.$root.selectedMediaItems[0].id];
  this.$refs.searchInput.focus();
  this.$refs.searchInput.addEventListener('keydown', (e) => {
    if (e.keyCode == 13) {
      if (focused != "") {
        addToPlaylist(focused)
      }
    }
  });


  const playlistSelect = (playlist) => {
    if (playlist.type !== "library-playlist-folders") {
      addToPlaylist(playlist.id)
    }
  };
  const addToPlaylist = (id) => {
    app.addSelectedToPlaylist(id)
  };
  const search = () => {
    focused = ""
    if (searchQuery === "") {
      playlistSorted = playlists
    } else {
      playlistSorted = playlists.filter(playlist => {
        return playlist.attributes.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1
      })
      if (playlistSorted.length == 1) {
        focused = playlistSorted[0].id
      }
    }
  };

  return <div className="modal-fullscreen addtoplaylist-panel" onClick={app.resetState()} contextmenuSelf="app.resetState()">
    <div className="modal-window">
      <div className="modal-header">
          <div className="modal-title">{app.getLz('action.addToPlaylist')}</div>
          <button className="close-btn" onClick={app.resetState} aria-label={app.getLz('action.close')}></button>
      </div>
      <div className="modal-content">
        <button className="playlist-item" onClick={app.addSelectedToNewPlaylist()} style={{width:'100%'}}>
          <div className="icon"><plus /></div>
          <div className="name">{app.getLz('action.createPlaylist')}</div>
        </button>
        <sidebar-playlist playlist-select={playlistSelect} relate-media-items="relateItems" v-for="item in $root.getPlaylistFolderChildren('p.playlistsroot')" v-bind:key="item.id" item="item" />
      </div>
      <div className="modal-search">
        <div className="search-input-container" style={{width:'100%', margin: '16px 0',}}>
            <div className="search-input--icon"></div>
            <input type="search" ref="searchInput" style={{width:'100%'}} spellcheck="false" placeholder={app.getLz('term.search') + '...'} v-model="searchQuery" input={search()} className="search-input" />
        </div>
      </div>
    </div>
    </div>;
}

