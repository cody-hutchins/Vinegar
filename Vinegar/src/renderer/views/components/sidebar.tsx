export const Component = () => {
  Vue.component("cider-app-sidebar", {
    template: "#cider-app-sidebar",
    methods: {
      switchArtworkDisplayLayout: function () {
        switch (app.cfg.visual.artworkDisplayLayout) {
          case "default":
            app.cfg.visual.artworkDisplayLayout = "sidebar";
            break;
          case "sidebar":
            app.cfg.visual.artworkDisplayLayout = "default";
            break;
          default:
            app.cfg.visual.artworkDisplayLayout = "default";
            break;
        }
      },
    },
  });
  return (
    <div id="cider-app-sidebar">
      <div id="app-sidebar">
        <template v-if="$root.getThemeDirective('windowLayout') != 'twopanel'">
          <div className="app-sidebar-header">
            <div className="search-input-container">
              <div className="search-input--icon"></div>
              <input
                type="search"
                spellcheck="false"
                click="$root.appRoute('search');$root.search.showHints = true"
                focus="$root.search.showHints = true"
                blur="$root.setTimeout(()=>{if($root.hintscontext != true){$root.search.showHints = false} }, 300)"
                v-on:keyupenter="$root.searchQuery($root.search.hints[$root.search.cursor]?.content ?? $root.search.hints[$root.search.cursor]?.searchTerm ?? $root.search.term);$root.search.showHints = false;$root.search.showSearchView = true;$root.search.cursor = -1"
                v-on:keyup="$root.searchCursor"
                change="$root.appRoute('search');"
                input="$root.getSearchHints()"
                placeholder="$root.getLz('term.search') + '...'"
                v-model="$root.search.term"
                ref="searchInput"
                className="search-input"
              />

              <div
                className="search-hints-container"
                v-if="$root.search.showHints && $root.search.hints.length != 0">
                <div className="search-hints">
                  <button
                    className="search-hint text-overflow-elipsis"
                    v-for="(hint, index) in $root.search.hints.filter((a) => {return a.content == null})"
                    className="{active: ($root.search.cursor == index)}"
                    click="$root.search.term = hint.searchTerm;$root.search.showHints = false;$root.searchQuery(hint.searchTerm);$root.search.cursor = -1">
                    {hint.displayTerm}
                  </button>
                  <template v-for="(item, position) in $root.search.hints.filter((a) => {return a.content != null})">
                    <mediaitem-smarthints
                      item="item.content"
                      position="position">
                      {" "}
                    </mediaitem-smarthints>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div
          className="app-sidebar-content"
          scrollaxis="y">
          {/* AM Navigation  */}
          <div
            v-show="$root.getThemeDirective('windowLayout') != 'twopanel'"
            className="sidebarCatalogSection">
            <div
              className="app-sidebar-header-text"
              click="$root.cfg.general.sidebarCollapsed.cider = !$root.cfg.general.sidebarCollapsed.cider"
              className="{collapsed: $root.cfg.general.sidebarCollapsed.cider}">
              {$root.getLz("app.name")}
            </div>
            <template v-if="!$root.cfg.general.sidebarCollapsed.cider">
              <sidebar-library-item
                name="$root.getLz('home.title')"
                svg-icon="./assets/feather/home.svg"
                svg-icon-name="home"
                page="home"></sidebar-library-item>
            </template>

            <div
              className="app-sidebar-header-text"
              click="$root.cfg.general.sidebarCollapsed.applemusic = !$root.cfg.general.sidebarCollapsed.applemusic"
              className="{collapsed: $root.cfg.general.sidebarCollapsed.applemusic}">
              {$root.getLz("term.appleMusic")}
            </div>
            <template v-if="!$root.cfg.general.sidebarCollapsed.applemusic">
              <sidebar-library-item
                name="$root.getLz('term.listenNow')"
                svg-icon="./assets/feather/play-circle.svg"
                svg-icon-name="listenNow"
                page="listen_now"></sidebar-library-item>
              <sidebar-library-item
                name="$root.getLz('term.browse')"
                svg-icon="./assets/feather/globe.svg"
                svg-icon-name="browse"
                page="browse"></sidebar-library-item>
              <sidebar-library-item
                name="$root.getLz('term.radio')"
                svg-icon="./assets/feather/radio.svg"
                svg-icon-name="radio"
                page="radio"></sidebar-library-item>
            </template>
          </div>

          <div
            className="app-sidebar-header-text"
            click="$root.cfg.general.sidebarCollapsed.library = !$root.cfg.general.sidebarCollapsed.library"
            className="{collapsed: $root.cfg.general.sidebarCollapsed.library}">
            {$root.getLz("term.library")}
          </div>
          <template v-if="!$root.cfg.general.sidebarCollapsed.library">
            <sidebar-library-item
              name="$root.getLz('term.recentlyAdded')"
              svg-icon="./assets/feather/plus-circle.svg"
              svg-icon-name="recentlyAdded"
              v-if="$root.cfg.general.sidebarItems.recentlyAdded"
              page="library-recentlyadded"></sidebar-library-item>
            <sidebar-library-item
              name="$root.getLz('term.songs')"
              svg-icon="./assets/feather/music.svg"
              svg-icon-name="songs"
              v-if="$root.cfg.general.sidebarItems.songs"
              page="library-songs"></sidebar-library-item>
            <sidebar-library-item
              name="$root.getLz('term.albums')"
              svg-icon="./assets/feather/disc.svg"
              svg-icon-name="albums"
              v-if="$root.cfg.general.sidebarItems.albums"
              page="library-albums"></sidebar-library-item>
            <sidebar-library-item
              name="$root.getLz('term.artists')"
              svg-icon="./assets/feather/user.svg"
              svg-icon-name="artists"
              v-if="$root.cfg.general.sidebarItems.artists"
              page="library-artists"></sidebar-library-item>
            <sidebar-library-item
              name="$root.getLz('term.videos')"
              svg-icon="./assets/feather/video.svg"
              svg-icon-name="videos"
              v-if="$root.cfg.general.sidebarItems.videos"
              page="library-videos"></sidebar-library-item>
            <sidebar-library-item
              name="$root.getLz('term.podcasts')"
              svg-icon="./assets/feather/mic.svg"
              svg-icon-name="podcasts"
              v-if="$root.cfg.general.sidebarItems.podcasts"
              page="podcasts"></sidebar-library-item>
          </template>
          {/* <template v-if="$root.cfg.libraryPrefs.localPaths.length != 0">
                <div className="app-sidebar-header-text"
                     click="$root.cfg.general.sidebarCollapsed.localLibrary = !$root.cfg.general.sidebarCollapsed.localLibrary"
                     className="{collapsed: $root.cfg.general.sidebarCollapsed.localLibrary}">
                    Local Library
                </div>
                <template v-if="!$root.cfg.general.sidebarCollapsed.localLibrary">
                    <sidebar-playlist item="{attributes: { name:'Songs'} , id:'ciderlocal'}"></sidebar-playlist>
                </template>
            </template>  */}
          <template v-if="$root.getPlaylistFolderChildren('p.applemusic').length != 0">
            <div
              className="app-sidebar-header-text"
              click="$root.cfg.general.sidebarCollapsed.amplaylists = !$root.cfg.general.sidebarCollapsed.amplaylists"
              contextmenu="$root.playlistHeaderContextMenu"
              className="{collapsed: $root.cfg.general.sidebarCollapsed.amplaylists}">
              {$root.getLz("term.appleMusic")}
              {$root.getLz("term.playlists")}
            </div>
            <template v-if="!$root.cfg.general.sidebarCollapsed.amplaylists">
              <sidebar-playlist
                v-for="item in $root.getPlaylistFolderChildren('p.applemusic')"
                v-bind:key="item.id"
                item="item"></sidebar-playlist>
            </template>
          </template>
          <div
            className="app-sidebar-header-text"
            click="$root.cfg.general.sidebarCollapsed.playlists = !$root.cfg.general.sidebarCollapsed.playlists"
            contextmenu="$root.playlistHeaderContextMenu"
            className="{collapsed: $root.cfg.general.sidebarCollapsed.playlists}">
            {$root.getLz("term.playlists")}
          </div>
          <template v-if="!$root.cfg.general.sidebarCollapsed.playlists">
            <button
              className="app-sidebar-item"
              click="$root.playlistHeaderContextMenu">
              <svg-icon url="./assets/feather/plus.svg"></svg-icon>
              <div className="sidebar-item-text">{$root.getLz("action.createNew")}</div>
            </button>
            <sidebar-playlist
              v-for="item in $root.getPlaylistFolderChildren('p.playlistsroot')"
              v-bind:key="item.id"
              madeforyou
              item="item"></sidebar-playlist>
          </template>
          <div
            v-if="$root.cfg.visual.artworkDisplayLayout == 'sidebar'"
            clickstop="switchArtworkDisplayLayout()"
            className="artwork"
            id="artworkLCD"
            style={{ position: "sticky", bottom: "0px" }}>
            <mediaitem-artwork url="$root.currentArtUrl"></mediaitem-artwork>
          </div>
        </div>
        <div className="app-sidebar-footer display--small app-sidebar-footer--controls">
          <div
            className="app-playback-controls"
            contextmenu="$root.nowPlayingContextMenu">
            <div className="control-buttons">
              <div className="app-chrome-item">
                <button
                  className="playback-button--small shuffle"
                  v-if="$root.mk.shuffleMode == 0"
                  click="$root.mk.shuffleMode = 1"
                  title="$root.getLz('term.enableShuffle')"
                  className="$root.isDisabled() && 'disabled'"
                  v-b-tooltiphoverrighttop></button>
                <button
                  className="playback-button--small shuffle active"
                  v-else
                  click="$root.mk.shuffleMode = 0"
                  title="$root.getLz('term.disableShuffle')"
                  className="$root.isDisabled() && 'disabled'"
                  v-b-tooltiphoverrighttop></button>
              </div>
              <div className="app-chrome-item">
                <button
                  className="playback-button previous"
                  click="$root.prevButton()"
                  className="$root.isPrevDisabled() && 'disabled'"
                  title="$root.getLz('term.previous')"
                  v-b-tooltiphover></button>
              </div>
              <div className="app-chrome-item">
                <button
                  className="playback-button stop"
                  click="$root.mk.stop()"
                  v-if="$root.mk.isPlaying && $root.mk.nowPlayingItem.attributes.playParams.kind == 'radioStation'"
                  title="$root.getLz('term.stop')"
                  v-b-tooltiphover></button>
                <button
                  className="playback-button pause"
                  click="$root.mk.pause()"
                  v-else-if="$root.mk.isPlaying"
                  title="$root.getLz('term.pause')"
                  v-b-tooltiphover></button>
                <button
                  className="playback-button play"
                  click="$root.mk.play()"
                  v-else
                  title="$root.getLz('term.play')"
                  v-b-tooltiphover></button>
              </div>
              <div className="app-chrome-item">
                <button
                  className="playback-button next"
                  click="$root.skipToNextItem()"
                  title="$root.getLz('term.next')"
                  className="$root.isNextDisabled() && 'disabled'"
                  v-b-tooltiphover></button>
              </div>
              <div className="app-chrome-item">
                <button
                  className="playback-button--small repeat"
                  v-if="$root.mk.repeatMode == 0"
                  click="$root.mk.repeatMode = 1"
                  className="$root.isDisabled() && 'disabled'"
                  title="$root.getLz('term.enableRepeatOne')"
                  v-b-tooltiphover></button>
                <button
                  className="playback-button--small repeat repeatOne"
                  click="$root.mk.repeatMode = 2"
                  v-else-if="$root.mk.repeatMode == 1"
                  title="$root.getLz('term.disableRepeatOne')"
                  className="$root.isDisabled() && 'disabled'"
                  v-b-tooltiphover></button>
                <button
                  className="playback-button--small repeat active"
                  click="$root.mk.repeatMode = 0"
                  v-else-if="$root.mk.repeatMode == 2"
                  title="$root.getLz('term.disableRepeat')"
                  className="$root.isDisabled() && 'disabled'"
                  v-b-tooltiphover></button>
              </div>
            </div>
            <div className="app-chrome-item volume">
              <div className="input-container">
                <button
                  className="volume-button--small volume"
                  click="$root.muteButtonPressed()"
                  className="{'active': $root.cfg.audio.volume == 0}"
                  title="$root.cfg.audio.muted ? $root.getLz('term.unmute') : $root.getLz('term.mute')"
                  v-b-tooltiphover></button>
                <input
                  type="range"
                  className=""
                  wheel="$root.volumeWheel"
                  step="$root.cfg.audio.volumeStep"
                  min="0"
                  max="$root.cfg.audio.maxVolume"
                  v-model="$root.mk.volume"
                  v-if="typeof $root.mk.volume != 'undefined'"
                  change="$root.checkMuteChange()"
                  v-b-tooltiphover
                  title="$root.formatVolumeTooltip()"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="app-sidebar-notification backgroundNotification"
          v-if="$root.library.backgroundNotification.show">
          <div className="message">
            {$root.library.backgroundNotification.message} ({$root.library.backgroundNotification.progress} / {$root.library.backgroundNotification.total})
          </div>
        </div>
      </div>
    </div>
  );
};
