import { useEffect } from "react";
import classNames from "classnames";
import Queue from "./queue.jsx";
import LyricsView from "./lyrics-view.jsx";
import MediaItemArtwork from "./mediaitem-artwork.jsx";
import SidebarLibraryItem from "../../main/components/sidebar-library-item.jsx";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import AppContentArea from "./app-content-area.js";
import { useTranslation } from "react-i18next";

const FullscreenView = ({
  time,
  lyrics,
  richlyrics,
  image,
}: {
  time?: number;
  lyrics?: string[];
  richlyrics?: string[];
  image?: string;
}) => {
  const { t } = useTranslation();
  const app = this.$root;
  let tabMode = "lyrics";
  const enableCatalog = false;
  let video = null;
  const immersiveEnabled = app.cfg.advanced.experiments.includes("immersive-preview");
  async function mounted() {
    if (app.mk.nowPlayingItem._container.type === "albums") {
      try {
        const result = (
          await app.mk.api.v3.music(
            `/v1/catalog/${app.mk.storefrontId}/${app.mk.nowPlayingItem._container.type}/${app.mk.nowPlayingItem._container.id}`,
            {
              fields: "editorialArtwork,editorialVideo",
            },
          )
        ).data.data[0].attributes?.editorialVideo?.motionDetailSquare?.video;
        if (result) {
          video = result;
        } else {
          video = null;
        }
      } catch (e) {
        console.log(e);
        video = null;
        // e = null;
      }
    } else if (app.mk.nowPlayingItem._container.type === "library-albums") {
      try {
        const result = (
          await app.mk.api.v3.music(`/v1/me/library/albums/${app.mk.nowPlayingItem._container.id}/catalog`, {
            fields: "editorialArtwork,editorialVideo",
          })
        ).data.data[0].attributes?.editorialVideo?.motionDetailSquare?.video;
        if (result) {
          video = result;
        } else {
          video = null;
        }
      } catch (e) {
        console.log(e);
        video = null;
        // e = null;
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
                name={t("home.title")}
                svg-icon={"./assets/feather/home.svg"}
                svg-icon-name={"home"}
                page={"home"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={t("term.listenNow")}
                svg-icon={"./assets/feather/play-circle.svg"}
                svg-icon-name={"listenNow"}
                page={"listen_now"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={t("term.browse")}
                svg-icon={"./assets/feather/globe.svg"}
                svg-icon-name={"browse"}
                page={"browse"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={t("term.radio")}
                svg-icon={"./assets/feather/radio.svg"}
                svg-icon-name={"radio"}
                page={"radio"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = 'catalog'"}
                name={t("term.library")}
                svg-icon={"./assets/feather/radio.svg"}
                svg-icon-name={"library"}
                page={"library"}
              />
              <SidebarLibraryItem
                clicknative={"tabMode = ''"}
                name={t("term.nowPlaying")}
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
                      <div
                        style={{
                          display: "inline-block",
                          "-webkit-box-orient": "horizontal",
                          whiteSpace: "nowrap",
                          marginTop: "0.25vh",
                          overflow: "hidden",
                        }}>
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
                          <OverlayTrigger overlay={<Tooltip id={"shuffle"}>{t("term.enableShuffle")}</Tooltip>}>
                            <button
                              className={classNames("playback-button--small", "shuffle", { disabled: isDisabled() })}
                              onClick={() => ($root.mk.shuffleMode = 1)}
                            />
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger overlay={<Tooltip id={"disable-shuffle"}>{t("term.disableShuffle")}</Tooltip>}>
                            <button
                              className={classNames("playback-button--small", "shuffle", "active", { disabled: isDisabled() })}
                              onClick={() => ($root.mk.shuffleMode = 0)}
                            />
                          </OverlayTrigger>
                        )}
                      </div>
                      <div className={"app-chrome-item display--large"}>
                        <OverlayTrigger overlay={<Tooltip id={"previous"}>{t("term.previous")}</Tooltip>}>
                          <button
                            className={classNames("playback-button", "previous", { disabled: isPrevDisabled() })}
                            onClick={() => $root.prevButton()}
                          />
                        </OverlayTrigger>
                      </div>
                      <div className={"app-chrome-item display--large"}>
                        {$root.mk.isPlaying && $root.mk.nowPlayingItem.attributes.playParams.kind === "radioStation" ? (
                          <OverlayTrigger overlay={<Tooltip id={"stop"}>{t("term.stop")}</Tooltip>}>
                            <button
                              className={"playback-button stop"}
                              onClick={() => $root.mk.stop()}
                            />
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger overlay={<Tooltip id={"play"}>{t("term.play")}</Tooltip>}>
                            <button
                              className={"playback-button play"}
                              onClick={() => $root.mk.play()}
                            />
                          </OverlayTrigger>
                        )}
                      </div>
                      <div className={"app-chrome-item display--large"}>
                        <OverlayTrigger overlay={<Tooltip id={"next"}>{t("term.next")}</Tooltip>}>
                          <button
                            className={classNames("playback-button", "next", { disabled: isNextDisabled() })}
                            onClick={() => $root.skipToNextItem()}
                          />
                        </OverlayTrigger>
                      </div>
                      <div className={"app-chrome-item display--large"}>
                        {$root.mk.repeatMode === 0 ? (
                          <OverlayTrigger overlay={<Tooltip id={"repeat"}>{t("term.enableRepeatOne")}</Tooltip>}>
                            <button
                              className={classNames("playback-button--small", "repeat", { disabled: isDisabled() })}
                              onClick={() => ($root.mk.repeatMode = 1)}
                            />
                          </OverlayTrigger>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className={"app-chrome-item volume display--large"}>
                    <div className={"input-container"}>
                      <OverlayTrigger overlay={<Tooltip id={"mute"}>{app.cfg.audio.muted ? t("term.unmute") : t("term.mute")}</Tooltip>}>
                        <button
                          className={classNames("volume-button--small volume", { active: app.cfg.audio.volume === 0 })}
                          onClick={() => app.muteButtonPressed()}
                        />
                      </OverlayTrigger>
                      {typeof app.mk.volume !== "undefined" && (
                        <OverlayTrigger overlay={<Tooltip id={"slider"}>{$root.formatVolumeTooltip()}</Tooltip>}>
                          <input
                            type={"range"}
                            className={"slider"}
                            onWheel={app.volumeWheel}
                            step={app.cfg.audio.volumeStep}
                            min={"0"}
                            max={app.cfg.audio.maxVolume}
                            v-model={app.mk.volume}
                            onChange={() => app.checkMuteChange()}
                          />
                        </OverlayTrigger>
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
