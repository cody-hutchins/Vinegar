export const ChromeTop = () => (
  <div
    className="app-chrome"
    style={{ display: chrome.topChromeVisible ? "" : "none" }}>
    <div className="app-chrome--left">
      <div
        className="app-chrome-item full-height"
        v-if="chrome.windowControlPosition == 'left' && !chrome.nativeControls">
        <div className="window-controls-macos">
          <div
            className="close"
            click="ipcRenderer.send('close')"></div>
          <div
            className="minimize"
            click="ipcRenderer.send('minimize')"></div>
          <div
            className="minmax restore"
            v-if="chrome.maximized"
            click="ipcRenderer.send('maximize')"></div>
          <div
            className="minmax"
            v-else
            click="ipcRenderer.send('maximize')"></div>
        </div>
      </div>
      <div
        className="app-chrome-item full-height"
        v-else>
        <button
          className="app-mainmenu"
          blur="mainMenuVisibility(false)"
          click="mainMenuVisibility(true)"
          contextmenu="mainMenuVisibility(true)"
          className="{active: chrome.menuOpened}"
          aria-label="$root.getLz('term.quickNav')"></button>
      </div>
      <template v-if="getThemeDirective('appNavigation') != 'seperate'">
        <div
          className="vdiv"
          v-if="getThemeDirective('windowLayout') == 'twopanel'"></div>
        <div className="app-chrome-item">
          <button
            className="playback-button navigation"
            click="navigateBack()"
            title="$root.getLz('term.navigateBack')"
            v-b-tooltiphover>
            <svg-icon url="./views/svg/chevron-left.svg"></svg-icon>
          </button>
        </div>
        <div className="app-chrome-item">
          <button
            className="playback-button navigation"
            click="navigateForward()"
            title="$root.getLz('term.navigateForward')"
            v-b-tooltiphover>
            <svg-icon url="./views/svg/chevron-right.svg"></svg-icon>
          </button>
        </div>
        <div
          className="app-chrome-item"
          v-if="getThemeDirective('windowLayout') == 'twopanel'">
          <button
            className="playback-button collapseLibrary"
            v-b-tooltiphover
            title="chrome.sidebarCollapsed ? getLz('action.showLibrary') : getLz('action.hideLibrary')"
            click="chrome.sidebarCollapsed = !chrome.sidebarCollapsed">
            <transition name="fade">
              <span v-if="chrome.sidebarCollapsed"></span>
            </transition>
            <transition name="fade">
              <span v-if="!chrome.sidebarCollapsed"></span>
            </transition>
          </button>
        </div>
        <div
          className="vdiv display--large"
          v-if="getThemeDirective('windowLayout') != 'twopanel'"></div>
      </template>
      <template v-if="getThemeDirective('windowLayout') != 'twopanel'">
        <div className="app-chrome-item playback-control-buttons">
          <div className="app-chrome-item display--large">
            <button
              className="playback-button--small shuffle"
              v-if="mk.shuffleMode == 0"
              className="isDisabled() && 'disabled'"
              click="mk.shuffleMode = 1"
              title="$root.getLz('term.enableShuffle')"
              v-b-tooltiphover></button>
            <button
              className="playback-button--small shuffle active"
              v-else
              className="isDisabled() && 'disabled'"
              click="mk.shuffleMode = 0"
              title="$root.getLz('term.disableShuffle')"
              v-b-tooltiphover></button>
          </div>
          <div className="app-chrome-item display--large">
            <button
              className="playback-button previous"
              click="prevButton()"
              className="isPrevDisabled() && 'disabled'"
              title="$root.getLz('term.previous')"
              v-b-tooltiphover></button>
          </div>
          <div className="app-chrome-item display--large">
            <button
              className="playback-button stop"
              click="mk.stop()"
              v-if="mk.isPlaying && mk.nowPlayingItem.attributes.playParams.kind == 'radioStation'"
              title="$root.getLz('term.stop')"
              v-b-tooltiphover></button>
            <button
              className="playback-button pause"
              click="mk.pause()"
              v-else-if="mk.isPlaying"
              title="$root.getLz('term.pause')"
              v-b-tooltiphover></button>
            <button
              className="playback-button play"
              click="mk.play()"
              v-else
              title="$root.getLz('term.play')"
              v-b-tooltiphover></button>
          </div>
          <div className="app-chrome-item display--large">
            <button
              className="playback-button next"
              click="skipToNextItem()"
              className="isNextDisabled() && 'disabled'"
              title="$root.getLz('term.next')"
              v-b-tooltiphover></button>
          </div>
          <div className="app-chrome-item display--large">
            <button
              className="playback-button--small repeat"
              className="mk.repeatMode == 1 ? 'repeatOne' : mk.repeatMode == 2 ? 'active' : ''"
              className="isDisabled() && 'disabled'"
              click="repeatIncrement()"
              title="$root.lz.repeat[mk.repeatMode]"
              v-b-tooltiphover></button>
          </div>
        </div>
      </template>
    </div>
    <div className="app-chrome--center">
      <div
        className="app-chrome-item playback-controls"
        v-if="getThemeDirective('windowLayout') != 'twopanel'">
        <template v-if="mkReady()">
          <div
            className="app-playback-controls"
            mouseover="chrome.progresshover = true"
            mouseleave="chrome.progresshover = false"
            contextmenu="nowPlayingContextMenu">
            <div
              className="artwork"
              id="artworkLCD">
              <mediaitem-artwork url="currentArtUrl"></mediaitem-artwork>
            </div>
            <b-popover
              custom-className="mediainfo-popover"
              target="artworkLCD"
              triggers="hover"
              placement="bottom">
              <div className="content">
                <div className="shadow-artwork">
                  <mediaitem-artwork url="currentArtUrl"></mediaitem-artwork>
                </div>
                <div className="popover-artwork">
                  <mediaitem-artwork
                    size="210"
                    url="currentArtUrl"></mediaitem-artwork>
                </div>
                <div className="song-name">{mk.nowPlayingItem["attributes"]["name"]}</div>
                <div
                  className="song-artist"
                  click="getNowPlayingItemDetailed(`artist`)">
                  {mk.nowPlayingItem["attributes"]["artistName"]}
                </div>
                <div
                  className="song-album"
                  click="getNowPlayingItemDetailed(`album`)">
                  {mk.nowPlayingItem["attributes"]["albumName"] ? mk.nowPlayingItem["attributes"]["albumName"] : ""}
                </div>
                <hr />
                <div
                  className="btn-group"
                  style={{ width: "100%" }}>
                  <button
                    className="md-btn md-btn-small"
                    style={{ width: "100%" }}
                    click="drawer.open = false; miniPlayer(true)">
                    {$root.getLz("term.miniplayer")}
                  </button>
                  <button
                    className="md-btn md-btn-small"
                    style={{ width: "100%" }}
                    click="drawer.open = false; fullscreen(true)">
                    {$root.getLz("term.fullscreenView")}
                  </button>
                </div>
              </div>
            </b-popover>
            <div className="playback-info">
              <div className="chrome-icon-container">
                <div
                  className="audio-type private-icon"
                  v-if="cfg.general.privateEnabled === true"
                  title="$root.getLz('term.privateSession')"
                  v-b-tooltiphover></div>
                <div
                  className="audio-type spatial-icon"
                  v-if="cfg.audio.maikiwiAudio.spatial === true"
                  title="$root.getLz('settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization') + ' (' + getProfileLz('CTS', cfg.audio.maikiwiAudio.spatialProfile) + ')'"
                  v-b-tooltiphover></div>
                <div
                  className="audio-type lossless-icon"
                  v-if="(mk.nowPlayingItem?.localFilesMetadata?.lossless ?? false) === true"
                  title="mk.nowPlayingItem?.localFilesMetadata?.bitDepth +'-bit / '+ mk.nowPlayingItem?.localFilesMetadata?.sampleRate/1000 + ' kHz ' + mk.nowPlayingItem.localFilesMetadata.container"
                  v-b-tooltiphover></div>
                <div
                  className="audio-type ppe-icon"
                  v-if="mk.nowPlayingItem.localFilesMetadata == null && cfg.audio.maikiwiAudio.ciderPPE === true"
                  title="$root.getLz('settings.option.audio.enableAdvancedFunctionality.ciderPPE')"
                  v-b-tooltiphover></div>
                <svg
                  className="audio-type live-icon"
                  v-if="mk.nowPlayingItem?.attributes?.isLive === true"
                  title="$root.getLz('term.live')"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--keyColor)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  v-b-tooltiphover>
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                  <line
                    x1="12"
                    y1="20"
                    x2="12.01"
                    y2="20"></line>
                </svg>
              </div>
              <div className="info-rect">
                <div
                  className="song-name"
                  className="[isElementOverflowing('#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-name') ? 'marquee' : '']">
                  {mk.nowPlayingItem["attributes"]["name"]}
                  <div
                    className="explicit-icon"
                    v-if="mk.nowPlayingItem['attributes']['contentRating'] == 'explicit'"
                    style={{ display: "inline-block" }}></div>
                </div>
                <div className="song-artist-album">
                  <div
                    className="song-artist-album-content"
                    className="[isElementOverflowing('#app-main > .app-chrome .app-chrome-item > .app-playback-controls > div >.song-artist-album > .song-artist-album-content') ? 'marquee' : '']"
                    style={{ display: "inline-block", "-webkit-box-orient": "horizontal", whiteSpace: "nowrap" }}>
                    <div
                      className="item-navigate song-artist"
                      style={{ display: "inline-block" }}
                      click="getNowPlayingItemDetailed(`artist`)">
                      {mk.nowPlayingItem["attributes"]["artistName"]}
                    </div>
                    <div
                      className="song-artist item-navigate"
                      style={{ display: "inline-block" }}
                      click="getNowPlayingItemDetailed('album')"
                      v-if="mk.nowPlayingItem['attributes']['albumName'] != ''">
                      <div
                        className="separator"
                        style={{ display: "inline-block" }}>
                        {"—"}
                      </div>
                      {mk.nowPlayingItem["attributes"]["albumName"] ? mk.nowPlayingItem["attributes"]["albumName"] : ""}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="song-progress"
                v-if="mk.nowPlayingItem?.attributes?.isLive !== true">
                <div
                  className="song-duration"
                  style={{ justifyContent: "space-between", height: "1px", display: hrome.progresshover ? "flex" : "none" }}>
                  <p style={{ width: "auto" }}>{convertTime(getSongProgress())}</p>
                  <p style={{ width: "auto" }}>{convertTime(mk.currentPlaybackDuration)}</p>
                </div>

                <input
                  type="range"
                  step="0.01"
                  min="0"
                  style={progressBarStyle()}
                  input="playerLCD.desiredDuration = $event.target.value;playerLCD.userInteraction = true"
                  mouseup="mk.seekToTime($event.target.value);setTimeout(()=>{playerLCD.desiredDuration = 0;playerLCD.userInteraction = false}, 1000);"
                  touchend="mk.seekToTime($event.target.value);setTimeout(()=>{playerLCD.desiredDuration = 0;playerLCD.userInteraction = false}, 1000);"
                  max="mk.currentPlaybackDuration"
                  value="getSongProgress()"
                />
              </div>
            </div>
            <template v-if="mk.nowPlayingItem['attributes']['playParams']">
              <div className="actions">
                <button
                  className="lcdMenu"
                  click="nowPlayingContextMenu"
                  title="$root.getLz('term.more')"
                  v-b-tooltiphover>
                  <div className="svg-icon"></div>
                </button>
              </div>
            </template>
          </div>
        </template>
        <template v-else>
          <div className="app-playback-controls">
            <div
              className="artwork"
              id="artworkLCD"
              style={{ pointerEvents: "none" }}>
              <mediaitem-artwork url="currentArtUrl"></mediaitem-artwork>
            </div>
            <div className="playback-info">
              <div className="info-rect"></div>
            </div>
          </div>
        </template>
      </div>
      <div
        className="app-chrome-item"
        v-else>
        <div className="top-nav-group">
          <sidebar-library-item
            name="$root.getLz('home.title')"
            svg-icon="./assets/feather/home.svg"
            svg-icon-name="home"
            page="home"></sidebar-library-item>
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
        </div>
      </div>
    </div>
    <div className="app-chrome--right">
      <template v-if="getThemeDirective('windowLayout') != 'twopanel'">
        <div className="app-chrome-item volume display--large">
          <button
            className="volume-button--small volume"
            click="muteButtonPressed()"
            className="{'active': this.cfg.audio.volume == 0}"
            title="cfg.audio.muted ? $root.getLz('term.unmute') : $root.getLz('term.mute')"
            v-b-tooltiphover></button>
          <input
            type="range"
            wheel="volumeWheel"
            step="cfg.audio.volumeStep"
            min="0"
            max="cfg.audio.maxVolume"
            v-model="mk.volume"
            v-if="typeof mk.volume != 'undefined'"
            change="checkMuteChange()"
            v-b-tooltiphover
            title="formatVolumeTooltip()"
          />
        </div>
        <div className="app-chrome-item generic">
          <button
            className="playback-button--small cast"
            title="$root.getLz('term.cast')"
            click="modals.castMenu = true"
            v-b-tooltiphover></button>
        </div>
        <div className="app-chrome-item generic">
          <button
            className="playback-button--small queue"
            title="$root.getLz('term.queue')"
            v-b-tooltiphover
            className="{'active': drawer.panel == 'queue'}"
            click="invokeDrawer('queue')"></button>
        </div>
        <div className="app-chrome-item generic">
          <template v-if="lyrics && lyrics != [] && lyrics.length > 0">
            <button
              className="playback-button--small lyrics"
              title="$root.getLz('term.lyrics')"
              v-b-tooltiphover
              className="{'active': drawer.panel == 'lyrics'}"
              click="invokeDrawer('lyrics')"></button>
          </template>
          <template v-else>
            <button
              className="playback-button--small lyrics"
              style={{ opacity: 0.3, pointerEvents: "none" }}></button>
          </template>
        </div>
      </template>
      <template v-else>
        <div className="app-chrome-item search">
          <div className="search-input-container">
            <div className="search-input--icon"></div>
            <input
              type="search"
              spellcheck="false"
              click="$root.appRoute('search');search.showHints = true"
              focus="search.showHints = true"
              blur="setTimeout(()=>{if(hintscontext != true){search.showHints = false} }, 300)"
              v-on:keyupenter="searchQuery(search.hints[search.cursor]?.content ?? search.hints[search.cursor]?.searchTerm ?? search.term);search.showHints = false;search.showSearchView = true;search.cursor = -1"
              change="$root.appRoute('search');"
              v-on:keyup="searchCursor"
              input="getSearchHints()"
              placeholder="$root.getLz('term.search') + '...'"
              v-model="search.term"
              ref="searchInput"
              className="search-input"
            />

            <div
              className="search-hints-container"
              v-if="search.showHints && search.hints.length != 0"
              style={{ right: "-13px", left: "unset", paddingTop: 0 }}>
              <div className="search-hints">
                <button
                  className="search-hint text-overflow-elipsis"
                  className="{active: (search.cursor == index)}"
                  v-for="(hint, index) in search.hints.filter((a) => {return a.content == null})"
                  click="search.term = hint.searchTerm;search.showHints = false;searchQuery(hint.searchTerm);search.cursor = -1">
                  {hint.displayTerm}
                </button>
                <template v-for="(item, position) in search.hints.filter((a) => {return a.content != null})">
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
        className="app-chrome-item full-height"
        id="window-controls-container"
        v-if="chrome.windowControlPosition == 'right' && !chrome.nativeControls">
        <div className="window-controls">
          <div
            className="minimize"
            click="ipcRenderer.send('minimize')"></div>
          <div
            className="minmax restore"
            v-if="chrome.maximized"
            click="ipcRenderer.send('maximize')"></div>
          <div
            className="minmax"
            v-else
            click="ipcRenderer.send('maximize')"></div>
          <div
            className="close"
            click="ipcRenderer.send('close')"></div>
        </div>
      </div>
      <div
        className="app-chrome-item full-height"
        v-else-if="platform != 'darwin' && !chrome.nativeControls">
        <button
          className="app-mainmenu"
          blur="mainMenuVisibility(false)"
          click="mainMenuVisibility(true)"
          contextmenu="mainMenuVisibility(true)"
          className="{active: chrome.menuOpened}"></button>
      </div>
    </div>
  </div>
);
