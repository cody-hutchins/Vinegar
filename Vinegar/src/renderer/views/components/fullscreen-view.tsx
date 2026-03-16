import { useEffect } from "react";
import classNames from "classnames";
import Queue from "./queue.jsx";
import LyricsView from "./lyrics-view.jsx";
import MediaItemArtwork from "./mediaitem-artwork.jsx";
import SidebarLibraryItem from "../../main/components/sidebar-library-item.jsx";
import { Col, Row } from "react-bootstrap";
import AppContentArea from "./app-content-area.js";

const FullscreenView = ({ time, lyrics, richlyrics, image }: { time?: number; lyrics?: string[]; richlyrics?: string[]; image?: string }) => {
  const app = this.$root;
  let tabMode = "lyrics";
  const enableCatalog = false;
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
    <div id={"fullscreen-view"}>
      <div
        className={"fullscreen-view"}
        tabIndex={0}>
        <div className={"background"}>
          <div className={"bgArtworkMaterial"}>
            <div className={"bg-artwork-container"}>
              {app.cfg.visual.bg_artwork_rotation && app.animateBackground && (
                <img
                  className={"bg-artwork a"}
                  src={(image ?? "").replace("{w}", "30").replace("{h}", "30")}
                />
              )}
              {app.cfg.visual.bg_artwork_rotation && app.animateBackground && (
                <img
                  className={"bg-artwork b"}
                  src={(image ?? "").replace("{w}", "30").replace("{h}", "30")}
                />
              )}
              {!(app.cfg.visual.bg_artwork_rotation && app.animateBackground) && (
                <img
                  className={"bg-artwork no-animation"}
                  src={(image ?? "").replace("{w}", "30").replace("{h}", "30")}
                />
              )}
            </div>
          </div>
        </div>
        {immersiveEnabled ? (
          <div className={"fs-header"}>
            <div className={"top-nav-group"}>
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={$root.getLz("home.title")}
                svg-icon={"./assets/feather/home.svg"}
                svg-icon-name={"home"}
                page={"home"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={$root.getLz("term.listenNow")}
                svg-icon={"./assets/feather/play-circle.svg"}
                svg-icon-name={"listenNow"}
                page={"listen_now"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={$root.getLz("term.browse")}
                svg-icon={"./assets/feather/globe.svg"}
                svg-icon-name={"browse"}
                page={"browse"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={$root.getLz("term.radio")}
                svg-icon={"./assets/feather/radio.svg"}
                svg-icon-name={"radio"}
                page={"radio"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={$root.getLz("term.library")}
                svg-icon={"./assets/feather/radio.svg"}
                svg-icon-name={"library"}
                page={"library"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = ''"}
                name={$root.getLz("term.nowPlaying")}
                svg-icon={"./assets/play.svg"}
                svg-icon-name={"nowPlaying"}
                page={"nowPlaying"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={""}
                svg-icon={"./assets/search.svg"}
                svg-icon-name={"search"}
                page={"search"}
              />
            </div>
          </div>
        ) : tabMode !== "catalog" ? (
          <Row className={"fs-row"}>
            <Col className={"artwork-col"}>
              <div
                className={classNames("artwork", { playing: $root.mk.isPlaying })}
                onClick={() => app.fullscreen(false)}>
                <MediaItemArtwork
                  size={"600"}
                  video={"video"}
                  videoPriority={true}
                  url={(image ?? "").replace("{w}", "600").replace("{h}", "600")}
                />
              </div>
              {app.mkReady() && (
                <div className={"controls-parents"}>
                  <div
                    className={"app-playback-controls"}
                    onMouseOver={() => {
                      app.chrome.progresshover = true;
                    }}
                    onMouseLeave={() => {
                      app.chrome.progresshover = false;
                    }}
                    contextMenu={app.nowPlayingContextMenu}>
                    <div className={"playback-info"}>
                      <div className={"song-name"}>{app.mk.nowPlayingItem["attributes"]["name"]}</div>
                      <div style={{ display: "inline-block", "-webkit-box-orient": "horizontal", whiteSpace: "nowrap", marginTop: "0.25vh", overflow: "hidden" }}>
                        <div
                          className={"item-navigate song-artist"}
                          style={{ display: "inline-block" }}
                          onClick={() => app.getNowPlasssyingItemDetailed(`artist`) && app.fullscreen(false)}>
                          {app.mk.nowPlayingItem["attributes"]["artistName"]}
                        </div>
                        <div
                          className={"song-artist"}
                          style={{ display: "inline-block" }}>
                          {app.mk.nowPlayingItem["attributes"]["albumName"] ? " — " : ""}
                        </div>
                        <div
                          className={"song-artist item-navigate"}
                          style={{ display: "inline-block" }}
                          onClick={() => app.getNowPlayingItemDetailed("album") && app.fullscreen(false)}>
                          {app.mk.nowPlayingItem["attributes"]["albumName"] ? app.mk.nowPlayingItem["attributes"]["albumName"] : ""}
                        </div>
                      </div>
                      <div className={"song-progress"}>
                        <div
                          className={"song-duration"}
                          style={{ justifyContent: "space-between", height: "1px", display: app.chrome.progresshover ? "flex" : "none" }}>
                          <p style={{ width: "auto" }}>{app.convertTime(app.getSongProgress())}</p>
                          <p style={{ width: "auto" }}>{app.convertTime(app.mk.currentPlaybackDuration)}</p>
                        </div>
                        <input
                          type={"range"}
                          step={0.01}
                          min={"0"}
                          style={app.progressBarStyle()}
                          onInput={() => {
                            app.playerLCD.desiredDuration = $event.target.value;
                            app.playerLCD.userInteraction = true;
                          }}
                          onMouseUp={() => {
                            app.mk.seekToTime($event.target.value);
                            app.playerLCD.desiredDuration = 0;
                            app.playerLCD.userInteraction = false;
                          }}
                          max={app.mk.currentPlaybackDuration}
                          value={app.getSongProgress()}
                        />
                      </div>
                    </div>
                    <div className={"control-buttons"}>
                      <div className={"app-chrome-item display--large"}>
                        {$root.mk.shuffleMode === 0 ? (
                          <button
                            className={classNames("playback-button--small", "shuffle", { disabled: isDisabled() })}
                            onClick={() => ($root.mk.shuffleMode = 1)}
                            title={$root.getLz("term.enableShuffle")}
                            v-b-tooltiphover
                          />
                        ) : (
                          <button
                            className={classNames("playback-button--small", "shuffle", "active", { disabled: isDisabled() })}
                            onClick={() => ($root.mk.shuffleMode = 0)}
                            title={$root.getLz("term.disableShuffle")}
                            v-b-tooltiphover
                          />
                        )}
                      </div>
                      <div className={"app-chrome-item display--large"}>
                        <button
                          className={classNames("playback-button", "previous", { disabled: isPrevDisabled() })}
                          onClick={() => $root.prevButton()}
                          title={$root.getLz("term.previous")}
                          v-b-tooltiphover
                        />
                      </div>
                      <div className={"app-chrome-item display--large"}>
                        {$root.mk.isPlaying && $root.mk.nowPlayingItem.attributes.playParams.kind === "radioStation" ? (
                          <button
                            className={"playback-button stop"}
                            onClick={() => $root.mk.stop()}
                            title={$root.getLz("term.stop")}
                            v-b-tooltiphover
                          />
                        ) : (
                          <button
                            className={"playback-button play"}
                            onClick={() => $root.mk.play()}
                            title={$root.getLz("term.play")}
                            v-b-tooltiphover
                          />
                        )}
                      </div>
                      <div className={"app-chrome-item display--large"}>
                        <button
                          className={classNames("playback-button", "next", { disabled: isNextDisabled() })}
                          onClick={() => $root.skipToNextItem()}
                          title={$root.getLz("term.next")}
                          v-b-tooltiphover
                        />
                      </div>
                      <div className={"app-chrome-item display--large"}>
                        {$root.mk.repeatMode === 0 ? (
                          <button
                            className={classNames("playback-button--small", "repeat", { disabled: isDisabled() })}
                            onClick={() => ($root.mk.repeatMode = 1)}
                            title={$root.getLz("term.enableRepeatOne")}
                            v-b-tooltiphover
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className={"app-chrome-item volume display--large"}>
                    <div className={"input-container"}>
                      <button
                        className={classNames("volume-button--small volume", { active: app.cfg.audio.volume === 0 })}
                        onClick={() => app.muteButtonPressed()}
                        title={app.cfg.audio.muted ? $root.getLz("term.unmute") : $root.getLz("term.mute")}
                        v-b-tooltiphover
                      />
                      {typeof app.mk.volume !== "undefined" && (
                        <input
                          type={"range"}
                          className={"slider"}
                          wheel={app.volumeWheel}
                          step={app.cfg.audio.volumeStep}
                          min={"0"}
                          max={app.cfg.audio.maxVolume}
                          v-model={app.mk.volume}
                          onChange={() => app.checkMuteChange()}
                          v-b-tooltiphover
                          title={$root.formatVolumeTooltip()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Col>
            {tabMode !== "" && (
              <Col className={"right-col"}>
                {tabMode === "lyrics" ? (
                  <div className={"lyrics-col"}>
                    <LyricsView
                      yoffset={"120"}
                      time={time}
                      lyrics={lyrics}
                      richlyrics={richlyrics}
                    />
                  </div>
                ) : (
                  <div className={"queue-col"}>
                    <Queue ref={"queue"} />
                  </div>
                )}
              </Col>
            )}
          </Row>
        ) : (
          <div className={"app-content-container"}>
            <AppContentArea />
          </div>
        )}
        <div className={"tab-toggles"}>
          <div
            className={classNames("lyrics", { active: tabMode === "lyrics" })}
            onClick={() => (tabMode = tabMode === "lyrics" ? "" : "lyrics")}
          />
          <div
            className={classNames("queue", { active: tabMode === "queue" })}
            onClick={() => (tabMode = tabMode === "queue" ? "" : "queue")}
          />
          {enableCatalog && (
            <div
              className={classNames("queue", { active: tabMode === "catalog" })}
              onClick={() => {
                tabMode = tabMode === "catalog" ? "" : "catalog";
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FullscreenView;
