import { Col, OverlayTrigger, Popover, Row, Tooltip } from "react-bootstrap";
import { useChromeStore } from "../../store/chrome.js";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

export const ChromeBottom = () => {
  const chrome = useChromeStore((state) => state.chrome);
  const { t } = useTranslation();
  return (
    getThemeDirective("windowLayout") === "twopanel" && (
      <div
        className={"app-chrome chrome-bottom"}
        style={{ display: chrome.topChromeVisible ? "" : "none" }}>
        <div className={"app-chrome--left"}>
          <div className={"app-chrome-item playback-controls"}>
            {mkReady() ? (
              <div
                className={"app-playback-controls"}
                onMouseOver={() => {
                  chrome.progresshover = true;
                }}
                onMouseLeave={() => {
                  chrome.progresshover = false;
                }}
                onContextMenu={nowPlayingContextMenu}>
                {cfg.visual.artworkDisplayLayout === "default" && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      switchArtworkDisplayLayout();
                    }}
                    className={"artwork"}
                    id={"artworkLCD"}>
                    <MediaItemArtwork url={$root.currentArtUrl} />
                    <Popover
                      custom-className={"mediainfo-popover"}
                      target={"artworkLCD"}
                      triggers={"hover"}
                      placement={"right"}>
                      <div className={"content"}>
                        <div className={"shadow-artwork"}>
                          <MediaItemArtwork url={currentArtUrl} />
                        </div>
                        <div className={"popover-artwork"}>
                          <MediaItemArtwork url={currentArtUrl} />
                        </div>
                        <div className={"song-name"}>{mk.nowPlayingItem["attributes"]["name"]}</div>
                        <div
                          className={"song-artist"}
                          onClick={() => getNowPlayingItemDetailed(`artist`)}>
                          {mk.nowPlayingItem["attributes"]["artistName"]}
                        </div>
                        <div
                          className={"song-album"}
                          onClick={() => getNowPlayingItemDetailed(`album`)}>
                          {mk.nowPlayingItem["attributes"]["albumName"] ? mk.nowPlayingItem["attributes"]["albumName"] : ""}
                        </div>
                        <hr />
                        <div
                          className={"btn-group"}
                          style={{ width: "100%" }}>
                          <button
                            className={"md-btn md-btn-small"}
                            style={{ width: "100%" }}
                            onClick={() => {
                              drawer.open = false;
                              miniPlayer(true);
                            }}>
                            {t("term.miniplayer")}
                          </button>
                          <button
                            className={"md-btn md-btn-small"}
                            style={{ width: "100%" }}
                            onClick={() => {
                              drawer.open = false;
                              fullscreen(true);
                            }}>
                            {t("term.fullscreenView")}
                          </button>
                        </div>
                      </div>
                    </Popover>
                  </div>
                )}
                <div className={"playback-info"}>
                  <div className={"song-name" + isElementOverflowing("#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-name") ? "marquee" : ""}>
                    {mk.nowPlayingItem["attributes"]["name"]}
                    {mk.nowPlayingItem["attributes"]["contentRating"] === "explicit" && (
                      <div
                        className={"explicit-icon"}
                        style={{ display: "inline-block" }}
                      />
                    )}
                  </div>
                  <div
                    className={"song-artist"}
                    onClick={() => getNowPlayingItemDetailed(`artist`)}>
                    {mk.nowPlayingItem["attributes"]["artistName"]}
                  </div>
                  {mk.nowPlayingItem["attributes"]["albumName"] && (
                    <div
                      className={"song-album"}
                      onClick={() => getNowPlayingItemDetailed("album")}>
                      {mk.nowPlayingItem["attributes"]["albumName"] ? mk.nowPlayingItem["attributes"]["albumName"] : ""}
                    </div>
                  )}
                  <div className={"chrome-icon-container"}>
                    {cfg.general.privateEnabled && <div className={"audio-type private-icon"} />}
                    {cfg.audio.maikiwiAudio.spatial && (
                      <OverlayTrigger overlay={<Tooltip id={"spatial-icon"}>{t("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization") + " (" + getProfileLz("CTS", cfg.audio.maikiwiAudio.spatialProfile) + ")"}</Tooltip>}>
                        <div className={"audio-type spatial-icon"} />
                      </OverlayTrigger>
                    )}
                    {(mk.nowPlayingItem?.localFilesMetadata?.lossless ?? false) && (
                      <OverlayTrigger overlay={<Tooltip id={"lossless-icon"}>{mk.nowPlayingItem?.localFilesMetadata?.bitDepth + "-bit / " + mk.nowPlayingItem?.localFilesMetadata?.sampleRate / 1000 + " kHz " + mk.nowPlayingItem.localFilesMetadata.container}</Tooltip>}>
                        <div className={"audio-type lossless-icon"} />
                      </OverlayTrigger>
                    )}
                    {mk.nowPlayingItem.localFilesMetadata === null && cfg.audio.maikiwiAudio.ciderPPE && (
                      <OverlayTrigger overlay={<Tooltip id={"ppe-icon"}>{t("settings.option.audio.enableAdvancedFunctionality.ciderPPE")}</Tooltip>}>
                        <div className={"audio-type ppe-icon"} />
                      </OverlayTrigger>
                    )}
                    {mk.nowPlayingItem?.attributes?.isLive && (
                      <OverlayTrigger overlay={<Tooltip id={"live-icon"}>{t("term.live")}</Tooltip>}>
                        <svg
                          className={"audio-type live-icon"}
                          xmlns={"http://www.w3.org/2000/svg"}
                          width={"24"}
                          height={"24"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"var(--keyColor)"}
                          strokeWidth={"2"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}>
                          <path d={"M5 12.55a11 11 0 0 1 14.08 0"} />
                          <path d={"M1.42 9a16 16 0 0 1 21.16 0"} />
                          <path d={"M8.53 16.11a6 6 0 0 1 6.95 0"} />
                          <line
                            x1={"12"}
                            y1={"20"}
                            x2={12.01}
                            y2={"20"}
                          />
                        </svg>
                      </OverlayTrigger>
                    )}
                  </div>
                </div>
                {mk.nowPlayingItem["attributes"]["playParams"] && (
                  <div className={"actions"}>
                    <OverlayTrigger overlay={<Tooltip id={"lcdMenu-icon"}>{t("term.more")}</Tooltip>}>
                      <button
                        className={"lcdMenu"}
                        onClick={nowPlayingContextMenu}>
                        <div className={"svg-icon"} />
                      </button>
                    </OverlayTrigger>
                  </div>
                )}
              </div>
            ) : (
              <div className={"app-playback-controls"}>
                {cfg.visual.artworkDisplayLayout === "default" && (
                  <div
                    className={"artwork"}
                    id={"artworkLCD"}
                    style={{ pointerEvents: "none" }}>
                    <MediaItemArtwork url={currentArtUrl} />
                  </div>
                )}
                <div className={"playback-info"}>
                  <div className={"song-name"} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={"app-chrome--center"}>
          <div className={"app-chrome-playback-duration-bottom"}>
            {mkReady() && !mk.nowPlayingItem?.attributes?.isLive && (
              <Row>
                <Col sm={"auto"}>{convertTime(getSongProgress())}</Col>
                <Col>
                  <input
                    type={"range"}
                    step={0.01}
                    min={"0"}
                    style={progressBarStyle()}
                    onInput={() => {
                      playerLCD.desiredDuration = $event.target.value;
                      playerLCD.userInteraction = true;
                    }}
                    onMouseUp={() => {
                      mk.seekToTime($event.target.value);
                      setTimeout(() => {
                        playerLCD.desiredDuration = 0;
                        playerLCD.userInteraction = false;
                      }, 1000);
                    }}
                    onTouchEnd={() => {
                      mk.seekToTime($event.target.value);
                      setTimeout(() => {
                        playerLCD.desiredDuration = 0;
                        playerLCD.userInteraction = false;
                      }, 1000);
                    }}
                    max={mk.currentPlaybackDuration}
                    value={getSongProgress()}
                  />
                </Col>
                {!mk.nowPlayingItem?.isLiveRadioStation ? <Col sm={"auto"}>{convertTime(mk.currentPlaybackDuration)}</Col> : <Col sm={"auto"}>{getLz("term.live")}</Col>}
              </Row>
            )}
          </div>
          <div className={"app-chrome-playback-controls"}>
            <div className={"app-chrome-item"}>
              {mk.shuffleMode === 0 ? (
                <OverlayTrigger overlay={<Tooltip id={"enable-shuffle"}>{t("term.enableShuffle")}</Tooltip>}>
                  <button
                    className={classNames("playback-button--small", "shuffle", { disabled: isDisabled() })}
                    onClick={() => {
                      mk.shuffleMode = 1;
                    }}
                  />
                </OverlayTrigger>
              ) : (
                <OverlayTrigger overlay={<Tooltip id={"disable-shuffle"}>{t("term.disableShuffle")}</Tooltip>}>
                  <button
                    className={classNames("playback-button--small", "shuffle", "active", { disabled: isDisabled() })}
                    onClick={() => (mk.shuffleMode = 0)}
                  />
                </OverlayTrigger>
              )}
            </div>
            <div className={"app-chrome-item"}>
              <OverlayTrigger overlay={<Tooltip id={"previous"}>{t("term.previous")}</Tooltip>}>
                <button
                  className={classNames("playback-button", "previous", { disabled: isPrevDisabled() })}
                  onClick={prevButton}
                />
              </OverlayTrigger>
            </div>
            <div className={"app-chrome-item"}>
              {mk.isPlaying && mk.nowPlayingItem.attributes.playParams.kind === "radioStation" ? (
                <OverlayTrigger overlay={<Tooltip id={"stop"}>{t("term.stop")}</Tooltip>}>
                  <button
                    className={"playback-button stop"}
                    onClick={mk.stop}
                  />
                </OverlayTrigger>
              ) : (
                <OverlayTrigger overlay={<Tooltip id={"play"}>{t("term.play")}</Tooltip>}>
                  <button
                    className={"playback-button play"}
                    onClick={mk.play}
                  />
                </OverlayTrigger>
              )}
            </div>
            <div className={"app-chrome-item"}>
              <OverlayTrigger overlay={<Tooltip id={"next"}>{t("term.next")}</Tooltip>}>
                <button
                  className={classNames("playback-button", "next", { disabled: isNextDisabled() })}
                  onClick={skipToNextItem}
                />
              </OverlayTrigger>
            </div>
            <div className={"app-chrome-item"}>
              <OverlayTrigger overlay={<Tooltip id={"repeat"}>{$root.lz.repeat[mk.repeatMode]}</Tooltip>}>
                <button
                  className={classNames("playback-button--small", "repeat", { repeatOne: mk.repeatMode === 1 }, { active: mk.repeatMode === 2 }, { disabled: isDisabled() })}
                  onClick={repeatIncrement}
                />
              </OverlayTrigger>
            </div>
          </div>
        </div>
        <div className={"app-chrome--right"}>
          <div className={"app-chrome-item volume"}>
            <OverlayTrigger overlay={<Tooltip id={"volume"}>{cfg.audio.muted ? t("term.unmute") : t("term.mute")}</Tooltip>}>
              <button
                className={"volume-button--small volume " + (cfg.audio.volume === 0 ? "active" : "")}
                onClick={muteButtonPressed}
              />
            </OverlayTrigger>
            {typeof mk.volume !== "undefined" && (
              <OverlayTrigger overlay={<Tooltip id={"volume"}>{formatVolumeTooltip()}</Tooltip>}>
                <input
                  type={"range"}
                  onWheel={volumeWheel}
                  step={cfg.audio.volumeStep}
                  min={"0"}
                  max={cfg.audio.maxVolume}
                  v-model={mk.volume}
                  onChange={() => checkMuteChange()}
                />
              </OverlayTrigger>
            )}
          </div>
          <div className={"app-chrome-item generic"}>
            <OverlayTrigger overlay={<Tooltip id={"cast"}>{t("term.cast")}</Tooltip>}>
              <button
                className={"playback-button--small cast"}
                onClick={() => {
                  modals.castMenu = true;
                }}
              />
            </OverlayTrigger>
          </div>
          <div className={"app-chrome-item generic"}>
            <OverlayTrigger overlay={<Tooltip id={"queue"}>{t("term.queue")}</Tooltip>}>
              <button
                className={"playback-button--small queue " + (drawer.panel === "queue" ? "active" : "")}
                onClick={() => invokeDrawer("queue")}
              />
            </OverlayTrigger>
          </div>
          <div className={"app-chrome-item generic"}>
            {lyrics && lyrics !== [] && lyrics.length > 0 ? (
              <OverlayTrigger overlay={<Tooltip id={"lyrics"}>{t("term.lyrics")}</Tooltip>}>
                <button
                  className={"playback-button--small lyrics " + (drawer.panel === "lyrics" ? "active" : "")}
                  onClick={() => invokeDrawer("lyrics")}
                />
              </OverlayTrigger>
            ) : (
              <button
                className={"playback-button--small lyrics"}
                style={{ opacity: 0.3, pointerEvents: "none" }}
              />
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default ChromeBottom;
