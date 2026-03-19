import { useEffect } from "react";
import MediaItemArtwork from "./mediaitem-artwork.jsx";
import { Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const MiniView = ({ time, lyrics, richlyrics, image }: { time?: number; lyrics?: object[]; richlyrics?: object[]; image?: string }) => {
  const { t } = useTranslation();
  const app = this.$root;
  const tabMode = "";

  function beforeMount() {
    window.addEventListener("keyup", onEscapeKeyUp);
  }
  function beforeDestroy() {
    window.removeEventListener("keyup", onEscapeKeyUp);
  }
  function mounted() {
    app.pinMiniPlayer(true);
  }
  function onEscapeKeyUp(event) {
    if (event.which === 27) {
      app.miniPlayer(false);
      console.log("js");
    }
  }
  useEffect(() => {
    beforeMount();
    mounted();
    return beforeDestroy;
  }, []);
  return (
    <div id={"mini-view"}>
      <div
        className={"mini-view"}
        tabIndex={0}>
        <div className={"background"} />
        {!app.cfg.visual.miniplayer_top_toggle && (
          <div
            className={"player-pin"}
            title={"Pin to Top"}
            onClick={() => app.pinMiniPlayer()}>
            <svg
              xmlns={"http://www.w3.org/2000/svg"}
              viewBox={"0 0 28 28"}
              fill={"none"}
              className={"feather feather-pin"}>
              <path
                d={
                  "M7.05664 16.3613C7.05664 17.1523 7.59277 17.6797 8.42773 17.6797H13.1299V21.8369C13.1299 23.0762 13.7539 24.3242 14 24.3242C14.2373 24.3242 14.8613 23.0762 14.8613 21.8369V17.6797H19.5635C20.3984 17.6797 20.9346 17.1523 20.9346 16.3613C20.9346 14.4717 19.4316 12.5293 16.9531 11.6152L16.6631 7.52832C17.9727 6.78125 19.0098 5.96387 19.4668 5.38379C19.7041 5.06738 19.8271 4.75098 19.8271 4.46973C19.8271 3.88965 19.3789 3.45898 18.7197 3.45898H9.27148C8.6123 3.45898 8.16406 3.88965 8.16406 4.46973C8.16406 4.75098 8.28711 5.06738 8.52441 5.38379C8.98145 5.96387 10.0186 6.78125 11.3281 7.52832L11.0469 11.6152C8.55957 12.5293 7.05664 14.4717 7.05664 16.3613Z"
                }
                fill={"#ff2654"}
              />
            </svg>
          </div>
        )}
        {app.cfg.visual.miniplayer_top_toggle && (
          <div
            className={"player-pin"}
            title={"Unpin to Top"}
            onClick={() => app.pinMiniPlayer(false)}>
            <svg
              xmlns={"http://www.w3.org/2000/svg"}
              viewBox={"0 0 28 28"}
              fill={"none"}
              className={"feather feather-pin-slashed"}>
              <path
                d={
                  "M9.271 3.459c-.659 0-1.107.43-1.107 1.01 0 .282.114.59.352.897.448.59 1.494 1.415 2.777 2.162l-.07 1.02 8.99 8.991c.458-.202.722-.615.722-1.178 0-1.89-1.503-3.832-3.947-4.746l-.29-4.087c1.275-.747 2.312-1.555 2.76-2.144.246-.308.37-.633.37-.914 0-.58-.45-1.011-1.108-1.011H9.27ZM5.15 6.061l16.076 16.057c.272.281.73.273.993 0a.703.703 0 0 0 0-.984L6.15 5.076a.716.716 0 0 0-1.002 0 .711.711 0 0 0 0 .985Zm1.908 10.3c0 .791.536 1.319 1.37 1.319h4.703v4.157c0 1.24.624 2.487.861 2.487.246 0 .87-1.248.87-2.487V17.81h.413l-5.537-5.545c-1.678 1.002-2.68 2.557-2.68 4.095Z"
                }
                fill={"#ff2654"}
              />
            </svg>
          </div>
        )}
        <div
          className={"player-exit"}
          title={"Close"}
          onClick={() => app.miniPlayer(false)}>
          <svg
            fill={"#323232e3"}
            width={"21"}
            height={"21"}
            viewBox={"0 0 21 21"}
            aria-role={"presentation"}
            focusable={false}
            xmlns={"http://www.w3.org/2000/svg"}>
            <defs>
              <radialGradient
                gradientUnits={"userSpaceOnUse"}
                cx={10.5}
                cy={10.5}
                r={10.5}
                id={"gradient-0"}>
                <stop
                  offset={"0"}
                  style={{ stopColor: "rgba(168, 163, 163, 1)" }}
                />
                <stop
                  offset={"1"}
                  style={{ stopColor: "rgba(118, 111, 111, 1)" }}
                />
              </radialGradient>
            </defs>
            <path
              d={
                "M10.5 21C4.724 21 0 16.275 0 10.5S4.724 0 10.5 0 21 4.725 21 10.5 16.276 21 10.5 21zm-3.543-5.967a.96.96 0 00.693-.295l2.837-2.842 2.85 2.842c.167.167.41.295.693.295.552 0 1.001-.461 1.001-1.012 0-.281-.115-.512-.295-.704L11.899 10.5l2.85-2.855a.875.875 0 00.295-.68c0-.55-.45-.998-1.001-.998a.871.871 0 00-.668.295l-2.888 2.855-2.862-2.843a.891.891 0 00-.668-.281.99.99 0 00-1.001.986c0 .269.116.512.295.678L9.088 10.5l-2.837 2.843a.926.926 0 00-.295.678c0 .551.45 1.012 1.001 1.012z"
              }
              fillRule={"nonzero"}
              style={{ strokeMiterlimit: 11, vectorEffect: "non-scaling-stroke", strokeWidth: "31px", fill: "url(#gradient-0)" }}
            />
          </svg>
        </div>
        <Col className={"artwork-col"}>
          <div
            className={"artwork"}
            onClick={() => app.miniPlayer(false)}>
            <MediaItemArtwork
              imagesize={"600"}
              url={image ?? ""}
            />
          </div>
          <div className={"controls-parents"}>
            {app.mkReady() && (
              <div
                className={"app-playback-controls"}
                onMouseOver={() => {
                  app.chrome.progresshover = true;
                }}
                onMouseLeave={() => {
                  app.chrome.progresshover = false;
                }}
                onContextMenu={app.nowPlayingContextMenu}>
                <div className={"playback-info"}>
                  <div className={"song-name"}>{app.mk.nowPlayingItem["attributes"]["name"]}</div>
                  <div
                    style={{
                      display: "inline-block",
                      "-webkit-box-orient": "horizontal",
                      whiteSpace: "nowrap",
                      marginTop: "0.25vh",
                      overflow: "hidden",
                      marginBottom: "5px",
                    }}>
                    <div
                      className={"item-navigate song-artist"}
                      style={{ display: "inline-block" }}
                      onClick={() => app.getNowPlayingItemDetailed(`artist`)}>
                      {app.mk.nowPlayingItem["attributes"]["artistName"]}
                    </div>
                    <div
                      className={"song-artist item-navigate"}
                      style={{ display: "inline-block" }}
                      onClick={() => app.getNowPlayingItemDetailed("album")}>
                      {app.mk.nowPlayingItem["attributes"]["albumName"] ? " — " + app.mk.nowPlayingItem["attributes"]["albumName"] : ""}
                    </div>
                  </div>

                  <div className={"song-progress"}>
                    <div
                      className={"song-duration"}
                      style={{
                        justifyContent: "space-between",
                        height: "1px",
                        marginBottom: "1px",
                        display: app.chrome.progresshover ? "flex" : "none",
                      }}>
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
                      <OverlayTrigger overlay={<Tooltip id={"enable-shuffle"}>{t("term.enableShuffle")}</Tooltip>}>
                        <button
                          className={classNames("playback-button--small shuffle", { disabled: $root.isDisabled() })}
                          onClick={() => ($root.mk.shuffleMode = 1)}
                        />
                      </OverlayTrigger>
                    ) : (
                      <OverlayTrigger overlay={<Tooltip id={"disable-shuffle"}>{t("term.disableShuffle")}</Tooltip>}>
                        <button
                          className={classNames("playback-button--small shuffle active", { disabled: $root.isDisabled() })}
                          onClick={() => ($root.mk.shuffleMode = 0)}
                        />
                      </OverlayTrigger>
                    )}
                  </div>
                  <div className={"app-chrome-item display--large"}>
                    <OverlayTrigger overlay={<Tooltip id={"previous"}>{t("term.previous")}</Tooltip>}>
                      <button
                        className={classNames("playback-button previous", { disabled: $root.isPrevDisabled() })}
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
                        className={classNames("playback-button next", { disabled: $root.isNextDisabled() })}
                        onClick={() => $root.skipToNextItem()}
                      />
                    </OverlayTrigger>
                  </div>
                  <div className={"app-chrome-item display--large"}>
                    {$root.mk.repeatMode === 0 ? (
                      <OverlayTrigger overlay={<Tooltip id={"repeat"}>{t("term.enableRepeatOne")}</Tooltip>}>
                        <button
                          className={classNames("playback-button--small repeat", { disabled: $root.isDisabled() })}
                          onClick={() => ($root.mk.repeatMode = 1)}
                        />
                      </OverlayTrigger>
                    ) : null}
                  </div>
                </div>
                <div className={"app-chrome-item volume display--large"}>
                  <div className={"input-container"}>
                    <button
                      className={classNames("volume-button--small volume", { active: app.cfg.audio.volume === 0 })}
                      onClick={() => app.muteButtonPressed()}
                    />
                    {typeof app.mk.volume !== "undefined" && (
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
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Col>
      </div>
      {/* <div className="row fs-row">{(tabMode !== '') && <div className="col right-col" ><div className="fs-info">
              <div>Name</div>
              <div>Name</div>
              <div>Name</div>
          </div>{(tabMode === 'lyrics') && <div className="lyrics-col" >
              <LyricsView yoffset="120" time="time" lyrics="lyrics"
              richlyrics="richlyrics" />
          </div>}{(tabMode === 'queue') && <div className="queue-col" >{(tabMode === 'queue') && <Queue  ref="queue"  />}</div>}</div>}</div>  */}
      {/* <div className="tab-toggles">
      <div className="lyrics" className="{active: tabMode === 'lyrics'}" onClick={() =>tabMode = (tabMode === 'lyrics') ? '' : 'lyrics'} />
      <div className="queue"  className="{active: tabMode === 'queue'}" onClick={() =>tabMode =  (tabMode === 'queue') ? '' :'queue'} />
  </div>   */}
    </div>
  );
};

export default MiniView;
