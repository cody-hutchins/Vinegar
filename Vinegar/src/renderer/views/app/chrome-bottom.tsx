import { Col, Popover, Row } from "react-bootstrap";
import { useChromeStore } from "../../store/chrome.js";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";

export const ChromeBottom = () => {
  const chrome = useChromeStore((state) => state.chrome);

  return (
    <>
      {getThemeDirective("windowLayout") === "twopanel" && (
        <div
          className={"app-chrome chrome-bottom"}
          style={{ display: chrome.topChromeVisible ? "" : "none" }}>
          <div className={"app-chrome--left"}>
            <div className={"app-chrome-item playback-controls"}>
              {mkReady() ? (
                <template>
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
                                {$root.getLz("term.miniplayer")}
                              </button>
                              <button
                                className={"md-btn md-btn-small"}
                                style={{ width: "100%" }}
                                onClick={() => {
                                  drawer.open = false;
                                  fullscreen(true);
                                }}>
                                {$root.getLz("term.fullscreenView")}
                              </button>
                            </div>
                          </div>
                        </Popover>
                      </div>
                    )}
                    <div className={"playback-info"}>
                      <div
                        className={"song-name"}
                        className={"[isElementOverflowing('#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-name') ? 'marquee' : '']"}>
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
                        {cfg.general.privateEnabled === true && <div className={"audio-type private-icon"} />}
                        {cfg.audio.maikiwiAudio.spatial === true && (
                          <div
                            className={"audio-type spatial-icon"}
                            title={$root.getLz("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization") + " (" + getProfileLz("CTS", cfg.audio.maikiwiAudio.spatialProfile) + ")"}
                            v-b-tooltiphover
                          />
                        )}
                        {(mk.nowPlayingItem?.localFilesMetadata?.lossless ?? false) === true && (
                          <div
                            className={"audio-type lossless-icon"}
                            title={mk.nowPlayingItem?.localFilesMetadata?.bitDepth + "-bit / " + mk.nowPlayingItem?.localFilesMetadata?.sampleRate / 1000 + " kHz " + mk.nowPlayingItem.localFilesMetadata.container}
                            v-b-tooltiphover
                          />
                        )}
                        {mk.nowPlayingItem.localFilesMetadata === null && cfg.audio.maikiwiAudio.ciderPPE === true && (
                          <div
                            className={"audio-type ppe-icon"}
                            title={$root.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPE")}
                            v-b-tooltiphover
                          />
                        )}
                        {mk.nowPlayingItem?.attributes?.isLive === true && (
                          <svg
                            className={"audio-type live-icon"}
                            title={$root.getLz("term.live")}
                            xmlns={"http://www.w3.org/2000/svg"}
                            width={"24"}
                            height={"24"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"var(--keyColor)"}
                            strokeWidth={"2"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            v-b-tooltiphover>
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
                        )}
                      </div>
                    </div>
                    {mk.nowPlayingItem["attributes"]["playParams"] && (
                      <template>
                        <div className={"actions"}>
                          <button
                            className={"lcdMenu"}
                            onClick={nowPlayingContextMenu}
                            title={$root.getLz("term.more")}
                            v-b-tooltiphover>
                            <div className={"svg-icon"} />
                          </button>
                        </div>
                      </template>
                    )}
                  </div>
                </template>
              ) : (
                <template>
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
                </template>
              )}
            </div>
          </div>
          <div className={"app-chrome--center"}>
            <div className={"app-chrome-playback-duration-bottom"}>
              {mkReady() && mk.nowPlayingItem?.attributes?.isLive !== true && (
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
                  <button
                    className={"playback-button--small shuffle"}
                    className={isDisabled() && "disabled"}
                    onClick={() => {
                      mk.shuffleMode = 1;
                    }}
                    title={$root.getLz("term.enableShuffle")}
                    v-b-tooltiphover
                  />
                ) : (
                  <button
                    className={"playback-button--small shuffle active"}
                    className={isDisabled() && "disabled"}
                    onClick={() => (mk.shuffleMode = 0)}
                    title={$root.getLz("term.disableShuffle")}
                    v-b-tooltiphover
                  />
                )}
              </div>
              <div className={"app-chrome-item"}>
                <button
                  className={"playback-button previous"}
                  onClick={prevButton}
                  className={isPrevDisabled() && "disabled"}
                  title={$root.getLz("term.previous")}
                  v-b-tooltiphover
                />
              </div>
              <div className={"app-chrome-item"}>
                {mk.isPlaying && mk.nowPlayingItem.attributes.playParams.kind === "radioStation" ? (
                  <button
                    className={"playback-button stop"}
                    onClick={mk.stop}
                    title={$root.getLz("term.stop")}
                    v-b-tooltiphover
                  />
                ) : (
                  <button
                    className={"playback-button play"}
                    onClick={mk.play}
                    title={$root.getLz("term.play")}
                    v-b-tooltiphover
                  />
                )}
              </div>
              <div className={"app-chrome-item"}>
                <button
                  className={"playback-button next"}
                  onClick={skipToNextItem}
                  className={isNextDisabled() && "disabled"}
                  title={$root.getLz("term.next")}
                  v-b-tooltiphover
                />
              </div>
              <div className={"app-chrome-item"}>
                <button
                  className={"playback-button--small repeat"}
                  className={mk.repeatMode === 1 ? "repeatOne" : mk.repeatMode === 2 ? "active" : ""}
                  className={isDisabled() && "disabled"}
                  onClick={repeatIncrement}
                  title={$root.lz.repeat[mk.repeatMode]}
                  v-b-tooltiphover
                />
              </div>
            </div>
          </div>
          <div className={"app-chrome--right"}>
            <div className={"app-chrome-item volume"}>
              <button
                className={"volume-button--small volume"}
                onClick={muteButtonPressed}
                className={"{'active': cfg.audio.volume === 0}"}
                title={cfg.audio.muted ? $root.getLz("term.unmute") : $root.getLz("term.mute")}
                v-b-tooltiphover
              />
              {typeof mk.volume !== "undefined" && (
                <input
                  type={"range"}
                  wheel={volumeWheel}
                  step={cfg.audio.volumeStep}
                  min={"0"}
                  max={cfg.audio.maxVolume}
                  v-model={mk.volume}
                  onChange={() => checkMuteChange()}
                  v-b-tooltiphover
                  title={formatVolumeTooltip()}
                />
              )}
            </div>
            <div className={"app-chrome-item generic"}>
              <button
                className={"playback-button--small cast"}
                title={$root.getLz("term.cast")}
                v-b-tooltiphover
                onClick={() => {
                  modals.castMenu = true;
                }}
              />
            </div>
            <div className={"app-chrome-item generic"}>
              <button
                className={"playback-button--small queue"}
                className={"{'active': drawer.panel === 'queue'}"}
                title={$root.getLz("term.queue")}
                v-b-tooltiphover
                onClick={() => invokeDrawer("queue")}
              />
            </div>
            <div className={"app-chrome-item generic"}>
              {lyrics && lyrics !== [] && lyrics.length > 0 ? (
                <template>
                  <button
                    className={"playback-button--small lyrics"}
                    title={$root.getLz("term.lyrics")}
                    v-b-tooltiphover
                    className={"{'active': drawer.panel === 'lyrics'}"}
                    onClick={() => invokeDrawer("lyrics")}
                  />
                </template>
              ) : (
                <template>
                  <button
                    className={"playback-button--small lyrics"}
                    style={{ opacity: 0.3, pointerEvents: "none" }}
                  />
                </template>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChromeBottom;
