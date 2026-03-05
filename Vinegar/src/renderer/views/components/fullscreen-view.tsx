import { useEffect } from "react";
import Queue from "./queue.jsx";
import LyricsView from "./lyrics-view.jsx";
import MediaItemArtwork from "./mediaitem-artwork.jsx";

const FullscreenView = ({ time, lyrics, richlyrics, image }: { time?: number; lyrics?: string[]; richlyrics?: string[]; image?: string }) => {
  const app = this.$root;
  const tabMode = "lyrics";
  let video = null;
  const immersiveEnabled = app.cfg.advanced.experiments.includes("immersive-preview");
  async function mounted() {
    if (app.mk.nowPlayingItem._container.type === "albums") {
      try {
        const result = (
          await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/${app.mk.nowPlayingItem._container.type}/${app.mk.nowPlayingItem._container.id}`, {
            fields: "editorialArtwork,editorialVideo",
          })
        ).data.data[0].attributes?.editorialVideo?.motionDetailSquare?.video;
        if (result) {
          video = result;
        } else {
          video = null;
        }
      } catch (e) {
        video = null;
        e = null;
      }
    } else if (app.mk.nowPlayingItem._container.type === "library-albums") {
      try {
        const result = (await app.mk.api.v3.music(`/v1/me/library/albums/${app.mk.nowPlayingItem._container.id}/catalog`, { fields: "editorialArtwork,editorialVideo" })).data.data[0].attributes?.editorialVideo?.motionDetailSquare?.video;
        if (result) {
          video = result;
        } else {
          video = null;
        }
      } catch (e) {
        e = null;
        video = null;
      }
    }
  }
  function beforeMount() {
    window.addEventListener("keyup", onEscapeKeyUp);
  }
  function beforeDestroy() {
    window.removeEventListener("keyup", onEscapeKeyUp);
  }
  const onEscapeKeyUp = (event) => {
    if (event.which === 27) {
      app.fullscreen(false);
      console.log("js");
    }
  };

  useEffect(() => {
    beforeMount();
    mounted();
    return beforeDestroy;
  }, []);
  return (
    <div id="fullscreen-view">
      <div
        className="fullscreen-view"
        tabindex="0">
        <div className="background">
          <div className="bgArtworkMaterial">
            <div className="bg-artwork-container">
              <img
                v-if={(app.cfg.visual.bg_artwork_rotation && app.animateBackground)}
                className="bg-artwork a"
                src={(image ?? "").replace("{w}", "30").replace("{h}", "30")}
              />
              <img
                v-if={(app.cfg.visual.bg_artwork_rotation && app.animateBackground)}
                className="bg-artwork b"
                src={(image ?? "").replace("{w}", "30").replace("{h}", "30")}
              />
              <img
                v-if={!(app.cfg.visual.bg_artwork_rotation && app.animateBackground)}
                className="bg-artwork no-animation"
                src={(image ?? "").replace("{w}", "30").replace("{h}", "30")}
              />
            </div>
          </div>
        </div>
        <div
          className="fs-header"
          v-if={immersiveEnabled}>
          <div className="top-nav-group">
            <SidebarLibraryItem
              clicknative="tabMode = 'catalog'"
              name={$root.getLz('home.title')}
              svg-icon="./assets/feather/home.svg"
              svg-icon-name="home"
              page="home"
            />
            <SidebarLibraryItem
              clicknative="tabMode = 'catalog'"
              name={$root.getLz('term.listenNow')}
              svg-icon="./assets/feather/play-circle.svg"
              svg-icon-name="listenNow"
              page="listen_now"
            />
            <SidebarLibraryItem
              clicknative="tabMode = 'catalog'"
              name={$root.getLz('term.browse')}
              svg-icon="./assets/feather/globe.svg"
              svg-icon-name="browse"
              page="browse"
            />
            <SidebarLibraryItem
              clicknative="tabMode = 'catalog'"
              name={$root.getLz('term.radio')}
              svg-icon="./assets/feather/radio.svg"
              svg-icon-name="radio"
              page="radio"
            />
            <SidebarLibraryItem
              clicknative="tabMode = 'catalog'"
              name={$root.getLz('term.library')}
              svg-icon="./assets/feather/radio.svg"
              svg-icon-name="library"
              page="library"
            />
            <SidebarLibraryItem
              clicknative="tabMode = ''"
              name={$root.getLz('term.nowPlaying')}
              svg-icon="./assets/play.svg"
              svg-icon-name="nowPlaying"
              page="nowPlaying"
            />
            <SidebarLibraryItem
              clicknative="tabMode = 'catalog'"
              name=""
              svg-icon="./assets/search.svg"
              svg-icon-name="search"
              page="search"
            />
          </div>
        </div>
        <div
          className="row fs-row"
          v-if={tabMode !== 'catalog'}>
          <div className="col artwork-col">
            <div
              className="artwork"
              className={$root.mk.isPlaying && 'playing'}
              onClick={() => app.fullscreen(false)}>
              <MediaItemArtwork
                size="600"
                video="video"
                videoPriority="true"
                url={(image ?? '').replace('{w}','600').replace('{h}','600')}
              />
            </div>
            <div
              className="controls-parents"
              v-if={app.mkReady()}>
              <div
                className="app-playback-controls"
                onMouseOver={() => {app.chrome.progresshover = true}}
                onMouseLeave={() => {app.chrome.progresshover = false}}
                contextmenu={app.nowPlayingContextMenu}>
                <div className="playback-info">
                  <div className="song-name">{app.mk.nowPlayingItem["attributes"]["name"]}</div>
                  <div style={{ display: "inline-block", "-webkit-box-orient": "horizontal", whiteSpace: "nowrap", marginTop: "0.25vh", overflow: "hidden" }}>
                    <div
                      className="item-navigate song-artist"
                      style={{ display: "inline-block" }}
                      onClick={() => app.getNowPlasssyingItemDetailed(`artist`) && app.fullscreen(false)}>
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
                      onClick={() => app.getNowPlayingItemDetailed("album") && app.fullscreen(false)}>
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
                      step={0.01}
                      min="0"
                      style={app.progressBarStyle()}
                      onInput={() => {app.playerLCD.desiredDuration = $event.target.value;app.playerLCD.userInteraction = true}}
                      onMouseUp={() => {app.mk.seekToTime($event.target.value);app.playerLCD.desiredDuration = 0;app.playerLCD.userInteraction = false}}
                      max={app.mk.currentPlaybackDuration}
                      value={app.getSongProgress()}
                    />
                  </div>
                </div>
                <div className="control-buttons">
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button--small shuffle"
                      v-if={$root.mk.shuffleMode === 0}
                      className={$root.isDisabled() && 'disabled'}
                      onClick={() => ($root.mk.shuffleMode = 1)}
                      title={$root.getLz('term.enableShuffle')}
                      v-b-tooltiphover
                    />
                    <button
                      className="playback-button--small shuffle active"
                      v-else
                      className={$root.isDisabled() && 'disabled'}
                      onClick={() => ($root.mk.shuffleMode = 0)}
                      title={$root.getLz('term.disableShuffle')}
                      v-b-tooltiphover
                    />
                  </div>
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button previous"
                      onClick={() => $root.prevButton()}
                      className={$root.isPrevDisabled() && 'disabled'}
                      title={$root.getLz('term.previous')}
                      v-b-tooltiphover
                    />
                  </div>
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button stop"
                      onClick={() => $root.mk.stop()}
                      v-if={$root.mk.isPlaying && $root.mk.nowPlayingItem.attributes.playParams.kind === 'radioStation'}
                      title={$root.getLz('term.stop')}
                      v-b-tooltiphover
                    />
                    <button
                      className="playback-button pause"
                      onClick={() => $root.mk.pause()}
                      v-else-if={$root.mk.isPlaying}
                      title={$root.getLz('term.pause')}
                      v-b-tooltiphover
                    />
                    <button
                      className="playback-button play"
                      onClick={() => $root.mk.play()}
                      v-else
                      title={$root.getLz('term.play')}
                      v-b-tooltiphover
                    />
                  </div>
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button next"
                      onClick={() => $root.skipToNextItem()}
                      className={$root.isNextDisabled() && 'disabled'}
                      title={$root.getLz('term.next')}
                      v-b-tooltiphover
                    />
                  </div>
                  <div className="app-chrome-item display--large">
                    <button
                      className="playback-button--small repeat"
                      v-if={$root.mk.repeatMode === 0}
                      className={$root.isDisabled() && 'disabled'}
                      onClick={() => ($root.mk.repeatMode = 1)}
                      title={$root.getLz('term.enableRepeatOne')}
                      v-b-tooltiphover
                    />
                    <button
                      className="playback-button--small repeat repeatOne"
                      onClick={() => (mk.repeatMode = 2)}
                      className={$root.isDisabled() && 'disabled'}
                      v-else-if={$root.mk.repeatMode === 1}
                      title={$root.getLz('term.disableRepeatOne')}
                      v-b-tooltiphover
                    />
                    <button
                      className="playback-button--small repeat active"
                      onClick={() => ($root.mk.repeatMode = 0)}
                      className={$root.isDisabled() && 'disabled'}
                      v-else-if={$root.mk.repeatMode === 2}
                      title={$root.getLz('term.disableRepeat')}
                      v-b-tooltiphover
                    />
                  </div>
                </div>
              </div>
              <div className="app-chrome-item volume display--large">
                <div className="input-container">
                  <button
                    className="volume-button--small volume"
                    onClick={() => app.muteButtonPressed()}
                    className="{'active': app.cfg.audio.volume === 0}"
                    title={app.cfg.audio.muted ? $root.getLz('term.unmute') : $root.getLz('term.mute')}
                    v-b-tooltiphover
                  />
                  <input
                    type="range"
                    className="slider"
                    wheel={app.volumeWheel}
                    step={app.cfg.audio.volumeStep}
                    min="0"
                    max={app.cfg.audio.maxVolume}
                    v-model={app.mk.volume}
                    v-if={typeof app.mk.volume !== 'undefined'}
                    onChange={() => app.checkMuteChange()}
                    v-b-tooltiphover
                    title={$root.formatVolumeTooltip()}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="col right-col"
            v-if={tabMode !== ''}>
            <div
              className="lyrics-col"
              v-if={tabMode === 'lyrics'}>
              <LyricsView
                yoffset="120"
                time={time}
                lyrics={lyrics}
                richlyrics={richlyrics}
              />
            </div>
            <div
              className="queue-col"
              v-else>
              <Queue ref="queue" />
            </div>
          </div>
        </div>
        <div
          className="app-content-container"
          v-else>
          <app-content-area />
        </div>
        <div className="tab-toggles">
          <div
            className="lyrics"
            className="{active: tabMode === 'lyrics'}"
            onClick={() => (tabMode = tabMode === "lyrics" ? "" : "lyrics")}
          />
          <div
            className="queue"
            className="{active: tabMode === 'queue'}"
            onClick={() => (tabMode = tabMode === "queue" ? "" : "queue")}
          />
          <div
            className="queue"
            className="{active: tabMode === 'catalog'}"
            v-if={false}
            onClick={() => {tabMode = tabMode === "catalog" ? "" : "catalog"}}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenView;
