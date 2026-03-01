export const Component = () => {
  Vue.component("fullscreen-view", {
    template: "#fullscreen-view",
    props: {
      time: {
        type: Number,
        required: false,
      },
      lyrics: {
        type: Array,
        required: false,
      },
      richlyrics: {
        type: Array,
        required: false,
      },
      image: {
        type: String,
        required: false,
      },
    },
    data: function () {
      return {
        app: this.$root,
        tabMode: "lyrics",
        video: null,
        immersiveEnabled: app.cfg.advanced.experiments.includes("immersive-preview"),
      };
    },
    async mounted() {
      if (app.mk.nowPlayingItem._container.type == "albums") {
        try {
          const result = (
            await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/${app.mk.nowPlayingItem._container.type}/${app.mk.nowPlayingItem._container.id}`, {
              fields: "editorialArtwork,editorialVideo",
            })
          ).data.data[0].attributes?.editorialVideo?.motionDetailSquare?.video;
          if (result) {
            this.video = result;
          } else {
            this.video = null;
          }
        } catch (e) {
          this.video = null;
          e = null;
        }
      } else if (app.mk.nowPlayingItem._container.type == "library-albums") {
        try {
          const result = (await app.mk.api.v3.music(`/v1/me/library/albums/${app.mk.nowPlayingItem._container.id}/catalog`, { fields: "editorialArtwork,editorialVideo" })).data.data[0].attributes?.editorialVideo?.motionDetailSquare?.video;
          if (result) {
            this.video = result;
          } else {
            this.video = null;
          }
        } catch (e) {
          e = null;
          this.video = null;
        }
      }
    },
    beforeMount() {
      window.addEventListener("keyup", this.onEscapeKeyUp);
    },
    beforeDestroy() {
      window.removeEventListener("keyup", this.onEscapeKeyUp);
    },
    methods: {
      onEscapeKeyUp(event) {
        if (event.which === 27) {
          app.fullscreen(false);
          console.log("js");
        }
      },
    },
  });
  return (
    <div id="fullscreen-view">
      <div
        className="fullscreen-view"
        tabindex="0">
        <div className="background">
          <div className="bgArtworkMaterial">
            <div className="bg-artwork-container">
              <img
                v-if="(app.cfg.visual.bg_artwork_rotation && app.animateBackground)"
                className="bg-artwork a"
                src="(image ?? '').replace('{w}','30').replace('{h}','30')"
              />
              <img
                v-if="(app.cfg.visual.bg_artwork_rotation && app.animateBackground)"
                className="bg-artwork b"
                src="(image ?? '').replace('{w}','30').replace('{h}','30')"
              />
              <img
                v-if="!(app.cfg.visual.bg_artwork_rotation && app.animateBackground)"
                className="bg-artwork no-animation"
                src="(image ?? '').replace('{w}','30').replace('{h}','30')"
              />
            </div>
          </div>
        </div>
        <div
          className="fs-header"
          v-if="immersiveEnabled">
          <div className="top-nav-group">
            <sidebar-library-item
              clicknative="tabMode = 'catalog'"
              name="$root.getLz('home.title')"
              svg-icon="./assets/feather/home.svg"
              svg-icon-name="home"
              page="home"></sidebar-library-item>
            <sidebar-library-item
              clicknative="tabMode = 'catalog'"
              name="$root.getLz('term.listenNow')"
              svg-icon="./assets/feather/play-circle.svg"
              svg-icon-name="listenNow"
              page="listen_now"></sidebar-library-item>
            <sidebar-library-item
              clicknative="tabMode = 'catalog'"
              name="$root.getLz('term.browse')"
              svg-icon="./assets/feather/globe.svg"
              svg-icon-name="browse"
              page="browse"></sidebar-library-item>
            <sidebar-library-item
              clicknative="tabMode = 'catalog'"
              name="$root.getLz('term.radio')"
              svg-icon="./assets/feather/radio.svg"
              svg-icon-name="radio"
              page="radio"></sidebar-library-item>
            <sidebar-library-item
              clicknative="tabMode = 'catalog'"
              name="$root.getLz('term.library')"
              svg-icon="./assets/feather/radio.svg"
              svg-icon-name="library"
              page="library"></sidebar-library-item>
            <sidebar-library-item
              clicknative="tabMode = ''"
              name="$root.getLz('term.nowPlaying')"
              svg-icon="./assets/play.svg"
              svg-icon-name="nowPlaying"
              page="nowPlaying"></sidebar-library-item>
            <sidebar-library-item
              clicknative="tabMode = 'catalog'"
              name=""
              svg-icon="./assets/search.svg"
              svg-icon-name="search"
              page="search"></sidebar-library-item>
          </div>
        </div>
        <div
          className="row fs-row"
          v-if="tabMode != 'catalog'">
          <div className="col artwork-col">
            <div
              className="artwork"
              className="$root.mk.isPlaying && 'playing'"
              click="app.fullscreen(false)">
              <mediaitem-artwork
                size="600"
                video="video"
                videoPriority="true"
                url="(image ?? '').replace('{w}','600').replace('{h}','600')"></mediaitem-artwork>
            </div>
            <div
              className="controls-parents"
              v-if="app.mkReady()">
              <div
                className="app-playback-controls"
                mouseover="app.chrome.progresshover = true"
                mouseleave="app.chrome.progresshover = false"
                contextmenu="app.nowPlayingContextMenu">
                <div className="playback-info">
                  <div className="song-name">{app.mk.nowPlayingItem["attributes"]["name"]}</div>
                  <div style={{ display: "inline-block", "-webkit-box-orient": "horizontal", whiteSpace: "nowrap", marginTop: "0.25vh", overflow: "hidden" }}>
                    <div
                      className="item-navigate song-artist"
                      style={{ display: "inline-block" }}
                      click="app.getNowPlasssyingItemDetailed(`artist`) && app.fullscreen(false)">
                      {app.mk.nowPlayingItem["attributes"]["artistName"]}
                    </div>
                    <div
                      className="song-artist"
                      style={{ display: "inline-block" }}>
                      {app.mk.nowPlayingItem["attributes"]["albumName"] ? " — " : ""}
                    </div>
                    <div
                      className="song-artist item-navigate"
                      style={{ display: "inline-block" }}
                      click="app.getNowPlayingItemDetailed('album') && app.fullscreen(false)">
                      {app.mk.nowPlayingItem["attributes"]["albumName"] ? app.mk.nowPlayingItem["attributes"]["albumName"] : ""}
                    </div>
                  </div>
                  <div className="song-progress">
                    <div
                      className="song-duration"
                      style={{ justifyContent: "space-between", height: "1px", display: app.chrome.progresshover ? "flex" : "none" }}>
                      <p style={{ width: "auto" }}>{app.convertTime(app.getSongProgress())}</p>
                      <p style={{ width: "auto" }}>{app.convertTime(app.mk.currentPlaybackDuration)}</p>
                    </div>
                    <input
                      type="range"
                      step="0.01"
                      min="0"
                      style={app.progressBarStyle()}
                      input="app.playerLCD.desiredDuration = $event.target.value;app.playerLCD.userInteraction = true"
                      mouseup="app.mk.seekToTime($event.target.value);app.playerLCD.desiredDuration = 0;app.playerLCD.userInteraction = false"
                      max="app.mk.currentPlaybackDuration"
                      value="app.getSongProgress()"
                    />
                  </div>
                </div>
                <div className="control-buttons">
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button--small shuffle"
                      v-if="$root.mk.shuffleMode == 0"
                      className="$root.isDisabled() && 'disabled'"
                      click="$root.mk.shuffleMode = 1"
                      title="$root.getLz('term.enableShuffle')"
                      v-b-tooltiphover></button>
                    <button
                      className="playback-button--small shuffle active"
                      v-else
                      className="$root.isDisabled() && 'disabled'"
                      click="$root.mk.shuffleMode = 0"
                      title="$root.getLz('term.disableShuffle')"
                      v-b-tooltiphover></button>
                  </div>
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button previous"
                      click="$root.prevButton()"
                      className="$root.isPrevDisabled() && 'disabled'"
                      title="$root.getLz('term.previous')"
                      v-b-tooltiphover></button>
                  </div>
                  <div className="app-chrome-item display--large">
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
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button next"
                      click="$root.skipToNextItem()"
                      className="$root.isNextDisabled() && 'disabled'"
                      title="$root.getLz('term.next')"
                      v-b-tooltiphover></button>
                  </div>
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button--small repeat"
                      v-if="$root.mk.repeatMode == 0"
                      className="$root.isDisabled() && 'disabled'"
                      click="$root.mk.repeatMode = 1"
                      title="$root.getLz('term.enableRepeatOne')"
                      v-b-tooltiphover></button>
                    <button
                      className="playback-button--small repeat repeatOne"
                      click="mk.repeatMode = 2"
                      className="$root.isDisabled() && 'disabled'"
                      v-else-if="$root.mk.repeatMode == 1"
                      title="$root.getLz('term.disableRepeatOne')"
                      v-b-tooltiphover></button>
                    <button
                      className="playback-button--small repeat active"
                      click="$root.mk.repeatMode = 0"
                      className="$root.isDisabled() && 'disabled'"
                      v-else-if="$root.mk.repeatMode == 2"
                      title="$root.getLz('term.disableRepeat')"
                      v-b-tooltiphover></button>
                  </div>
                </div>
              </div>
              <div className="app-chrome-item volume display--large">
                <div className="input-container">
                  <button
                    className="volume-button--small volume"
                    click="app.muteButtonPressed()"
                    className="{'active': app.cfg.audio.volume == 0}"
                    title="app.cfg.audio.muted ? $root.getLz('term.unmute') : $root.getLz('term.mute')"
                    v-b-tooltiphover></button>
                  <input
                    type="range"
                    className="slider"
                    wheel="app.volumeWheel"
                    step="app.cfg.audio.volumeStep"
                    min="0"
                    max="app.cfg.audio.maxVolume"
                    v-model="app.mk.volume"
                    v-if="typeof app.mk.volume != 'undefined'"
                    change="app.checkMuteChange()"
                    v-b-tooltiphover
                    title="$root.formatVolumeTooltip()"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="col right-col"
            v-if="tabMode !== ''">
            <div
              className="lyrics-col"
              v-if="tabMode == 'lyrics'">
              <lyrics-view
                yoffset="120"
                time="time"
                lyrics="lyrics"
                richlyrics="richlyrics"></lyrics-view>
            </div>
            <div
              className="queue-col"
              v-else>
              <cider-queue ref="queue"></cider-queue>
            </div>
          </div>
        </div>
        <div
          className="app-content-container"
          v-else>
          <app-content-area></app-content-area>
        </div>
        <div className="tab-toggles">
          <div
            className="lyrics"
            className="{active: tabMode == 'lyrics'}"
            click="tabMode = (tabMode == 'lyrics') ? '' : 'lyrics'"></div>
          <div
            className="queue"
            className="{active: tabMode == 'queue'}"
            click="tabMode =  (tabMode == 'queue') ? '' :'queue'"></div>
          <div
            className="queue"
            className="{active: tabMode == 'catalog'}"
            v-if="false"
            click="tabMode =  (tabMode == 'catalog') ? '' :'catalog'"></div>
        </div>
      </div>
    </div>
  );
};
