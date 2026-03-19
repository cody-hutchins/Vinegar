import classNames from "classnames";
import SVGIcon from "../../main/components/svg-icon.jsx";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import MediaItemSmarthints from "../components/mediaitem-smarthints.jsx";
import SidebarLibraryItem from "../../main/components/sidebar-library-item.jsx";
import { useChromeStore } from "../../store/chrome.js";
import { AnimatePresence, motion } from "framer-motion";
import { OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useCfgStore } from "../../store/cfg.js";

const ChromeTop = ({ search = {} }: { search?: object }) => {
  const chrome = useChromeStore((state) => state);
  const { cfg } = useCfgStore();
  const { t } = useTranslation();

  return (
    <div
      className={"app-chrome"}
      style={{ display: chrome.topChromeVisible ? "" : "none" }}>
      <div className={"app-chrome--left"}>
        {chrome.windowControlPosition === "left" && !chrome.nativeControls ? (
          <div className={"app-chrome-item full-height"}>
            <div className={"window-controls-macos"}>
              <div
                className={"close"}
                onClick={() => window.electronAPI.send("close")}
              />
              <div
                className={"minimize"}
                onClick={() => window.electronAPI.send("minimize")}
              />
              {chrome.maximized ? (
                <div
                  className={"minmax restore"}
                  onClick={() => window.electronAPI.send("maximize")}
                />
              ) : (
                <div
                  className={"minmax"}
                  onClick={() => window.electronAPI.send("maximize")}
                />
              )}
            </div>
          </div>
        ) : (
          <div className={"app-chrome-item full-height"}>
            <button
              className={classNames("app-mainmenu", { active: chrome.menuOpened })}
              onBlur={() => mainMenuVisibility(false)}
              onClick={() => mainMenuVisibility(true)}
              onContextMenu={() => mainMenuVisibility(true)}
              aria-label={t("term.quickNav")}
            />
          </div>
        )}
        {getThemeDirective("appNavigation") !== "seperate" ? (
          <>
            {getThemeDirective("windowLayout") === "twopanel" && <div className={"vdiv"} />}
            <div className={"app-chrome-item"}>
              <OverlayTrigger overlay={<Tooltip id={"navigation-back"}>{t("term.navigateBack")}</Tooltip>}>
                <button
                  className={"playback-button navigation"}
                  onClick={() => navigateBack()}>
                  <SVGIcon url={"./views/svg/chevron-left.svg"} />
                </button>
              </OverlayTrigger>
            </div>
            <div className={"app-chrome-item"}>
              <OverlayTrigger overlay={<Tooltip id={"navigation-forward"}>{t("term.navigateForward")}</Tooltip>}>
                <button
                  className={"playback-button navigation"}
                  onClick={() => navigateForward()}>
                  <SVGIcon url={"./views/svg/chevron-right.svg"} />
                </button>
              </OverlayTrigger>
            </div>
            {getThemeDirective("windowLayout") === "twopanel" && (
              <div className={"app-chrome-item"}>
                <OverlayTrigger
                  overlay={
                    <Tooltip id={"show-library"}>
                      {chrome.sidebarCollapsed ? getLz("action.showLibrary") : getLz("action.hideLibrary")}
                    </Tooltip>
                  }>
                  <button
                    className={"playback-button collapseLibrary"}
                    onClick={() => {
                      chrome.sidebarCollapsed = !chrome.sidebarCollapsed;
                    }}>
                    <AnimatePresence>
                      <motion.div name={"fade"}>{chrome.sidebarCollapsed && <span></span>}</motion.div>
                      <motion.div name={"fade"}>{!chrome.sidebarCollapsed && <span></span>}</motion.div>
                    </AnimatePresence>
                  </button>
                </OverlayTrigger>
              </div>
            )}
            {getThemeDirective("windowLayout") !== "twopanel" && <div className={"vdiv display--large"} />}
          </>
        ) : getThemeDirective("windowLayout") !== "twopanel" ? (
          <div className={"app-chrome-item playback-control-buttons"}>
            <div className={"app-chrome-item display--large"}>
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
                    onClick={() => {
                      mk.shuffleMode = 0;
                    }}
                  />
                </OverlayTrigger>
              )}
            </div>
            <div className={"app-chrome-item display--large"}>
              <OverlayTrigger overlay={<Tooltip id={"previous"}>{t("term.previous")}</Tooltip>}>
                <button
                  className={classNames("playback-button", "previous", { disabled: isPrevDisabled() })}
                  onClick={() => prevButton()}
                />
              </OverlayTrigger>
            </div>
            <div className={"app-chrome-item display--large"}>
              {mk.isPlaying && mk.nowPlayingItem.attributes.playParams.kind === "radioStation" ? (
                <OverlayTrigger overlay={<Tooltip id={"stop"}>{t("term.stop")}</Tooltip>}>
                  <button
                    className={"playback-button stop"}
                    onClick={() => mk.stop()}
                  />
                </OverlayTrigger>
              ) : (
                <OverlayTrigger overlay={<Tooltip id={"play"}>{t("term.play")}</Tooltip>}>
                  <button
                    className={"playback-button play"}
                    onClick={() => mk.play()}
                  />
                </OverlayTrigger>
              )}
            </div>
            <div className={"app-chrome-item display--large"}>
              <OverlayTrigger overlay={<Tooltip id={"next"}>{t("term.next")}</Tooltip>}>
                <button
                  className={classNames("playback-button", "next", { disabled: isNextDisabled() })}
                  onClick={() => skipToNextItem()}
                />
              </OverlayTrigger>
            </div>
            <div className={"app-chrome-item display--large"}>
              <OverlayTrigger overlay={<Tooltip id={"repeat"}>{$root.lz.repeat[mk.repeatMode]}</Tooltip>}>
                <button
                  className={classNames(
                    "playback-button--small",
                    "repeat",
                    { repeatOne: mkdir.repeatMode === 1 },
                    { active: mk.repeatMode === 2 },
                    { disabled: isDisabled() },
                  )}
                  onClick={() => repeatIncrement()}
                />
              </OverlayTrigger>
            </div>
          </div>
        ) : null}
      </div>
      <div className={"app-chrome--center"}>
        {getThemeDirective("windowLayout") !== "twopanel" ? (
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
                contextMenu={"nowPlayingContextMenu"}>
                <div
                  className={"artwork"}
                  id={"artworkLCD"}>
                  <MediaItemArtwork url={currentArtUrl} />
                </div>
                <Popover
                  custom-className={"mediainfo-popover"}
                  target={"artworkLCD"}
                  triggers={"hover"}
                  placement={"bottom"}>
                  <div className={"content"}>
                    <div className={"shadow-artwork"}>
                      <MediaItemArtwork url={currentArtUrl} />
                    </div>
                    <div className={"popover-artwork"}>
                      <MediaItemArtwork
                        size={"210"}
                        url={currentArtUrl}
                      />
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
                <div className={"playback-info"}>
                  <div className={"chrome-icon-container"}>
                    {cfg.general.privateEnabled && (
                      <OverlayTrigger overlay={<Tooltip id={"private"}>{t("term.privateSession")}</Tooltip>}>
                        <div className={"audio-type private-icon"} />
                      </OverlayTrigger>
                    )}
                    {cfg.audio.maikiwiAudio.spatial && (
                      <OverlayTrigger
                        overlay={
                          <Tooltip id={"spatial"}>
                            {t("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization") +
                              " (" +
                              getProfileLz("CTS", cfg.audio.maikiwiAudio.spatialProfile) +
                              ")"}
                          </Tooltip>
                        }>
                        <div className={"audio-type spatial-icon"} />
                      </OverlayTrigger>
                    )}
                    {(mk.nowPlayingItem?.localFilesMetadata?.lossless ?? false) && (
                      <OverlayTrigger
                        overlay={
                          <Tooltip id={"lossless"}>
                            {mk.nowPlayingItem?.localFilesMetadata?.bitDepth +
                              "-bit / " +
                              mk.nowPlayingItem?.localFilesMetadata?.sampleRate / 1000 +
                              " kHz " +
                              mk.nowPlayingItem.localFilesMetadata.container}
                          </Tooltip>
                        }>
                        <div className={"audio-type lossless-icon"} />
                      </OverlayTrigger>
                    )}
                    {mk.nowPlayingItem.localFilesMetadata === null && cfg.audio.maikiwiAudio.ciderPPE && (
                      <OverlayTrigger
                        overlay={<Tooltip id={"lossless"}>{t("settings.option.audio.enableAdvancedFunctionality.ciderPPE")}</Tooltip>}>
                        <div className={"audio-type ppe-icon"} />
                      </OverlayTrigger>
                    )}
                    {mk.nowPlayingItem?.attributes?.isLive && (
                      <OverlayTrigger overlay={<Tooltip id={"live"}>{t("term.live")}</Tooltip>}>
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
                  <div className={"info-rect"}>
                    <div
                      className={`song-name ${[isElementOverflowing("#app-main >div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-name") ? "marquee" : ""]}`}>
                      {mk.nowPlayingItem["attributes"]["name"]}
                      {mk.nowPlayingItem["attributes"]["contentRating"] === "explicit" && (
                        <div
                          className={"explicit-icon"}
                          style={{ display: "inline-block" }}
                        />
                      )}
                    </div>
                    <div className={"song-artist-album"}>
                      <div
                        className={
                          "song-artist-album-content " +
                          [
                            isElementOverflowing(
                              "#app-main >.app-chrome .app-chrome-item > .app-playback-controls > div >.song-artist-album > .song-artist-album-content",
                            )
                              ? "marquee"
                              : "",
                          ]
                        }
                        style={{ display: "inline-block", "-webkit-box-orient": "horizontal", whiteSpace: "nowrap" }}>
                        <div
                          className={"item-navigate song-artist"}
                          style={{ display: "inline-block" }}
                          onClick={() => getNowPlayingItemDetailed(`artist`)}>
                          {mk.nowPlayingItem["attributes"]["artistName"]}
                        </div>
                        {mk.nowPlayingItem["attributes"]["albumName"] !== "" && (
                          <div
                            className={"song-artist item-navigate"}
                            style={{ display: "inline-block" }}
                            onClick={() => getNowPlayingItemDetailed("album")}>
                            <div
                              className={"separator"}
                              style={{ display: "inline-block" }}>
                              —
                            </div>
                            {mk.nowPlayingItem["attributes"]["albumName"] ? mk.nowPlayingItem["attributes"]["albumName"] : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {!mk.nowPlayingItem?.attributes?.isLive && (
                    <div className={"song-progress"}>
                      <div
                        className={"song-duration"}
                        style={{ justifyContent: "space-between", height: "1px", display: hrome.progresshover ? "flex" : "none" }}>
                        <p style={{ width: "auto" }}>{convertTime(getSongProgress())}</p>
                        <p style={{ width: "auto" }}>{convertTime(mk.currentPlaybackDuration)}</p>
                      </div>

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
                    </div>
                  )}
                </div>
                {mk.nowPlayingItem["attributes"]["playParams"] && (
                  <div className={"actions"}>
                    <OverlayTrigger overlay={<Tooltip id={"more"}>{t("term.more")}</Tooltip>}>
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
                <div
                  className={"artwork"}
                  id={"artworkLCD"}
                  style={{ pointerEvents: "none" }}>
                  <MediaItemArtwork url={currentArtUrl} />
                </div>
                <div className={"playback-info"}>
                  <div className={"info-rect"} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={"app-chrome-item"}>
            <div className={"top-nav-group"}>
              <SidebarLibraryItem
                name={t("home.title")}
                svg-icon={"./assets/feather/home.svg"}
                svg-icon-name={"home"}
                page={"home"}
              />
              <SidebarLibraryItem
                name={t("term.listenNow")}
                svg-icon={"./assets/feather/play-circle.svg"}
                svg-icon-name={"listenNow"}
                page={"listen_now"}
              />
              <SidebarLibraryItem
                name={t("term.browse")}
                svg-icon={"./assets/feather/globe.svg"}
                svg-icon-name={"browse"}
                page={"browse"}
              />
              <SidebarLibraryItem
                name={t("term.radio")}
                svg-icon={"./assets/feather/radio.svg"}
                svg-icon-name={"radio"}
                page={"radio"}
              />
            </div>
          </div>
        )}
      </div>
      <div className={"app-chrome--right"}>
        {getThemeDirective("windowLayout") !== "twopanel" ? (
          <>
            <div className={"app-chrome-item volume display--large"}>
              <OverlayTrigger overlay={<Tooltip id={"more"}>{cfg.audio.muted ? t("term.unmute") : t("term.mute")}</Tooltip>}>
                <button
                  className={classNames("volume-button--small volume", { active: cfg.audio.volume === 0 })}
                  onClick={() => muteButtonPressed()}
                />
              </OverlayTrigger>
              {typeof mk.volume !== "undefined" && (
                <OverlayTrigger overlay={<Tooltip id={"range"}>{formatVolumeTooltip()}</Tooltip>}>
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
                  className={classNames("playback-button--small queue", { active: drawer.panel === "queue" })}
                  onClick={() => invokeDrawer("queue")}
                />
              </OverlayTrigger>
            </div>
            <div className={"app-chrome-item generic"}>
              {lyrics && lyrics !== [] && lyrics.length > 0 ? (
                <OverlayTrigger overlay={<Tooltip id={"lyrics"}>{t("term.lyrics")}</Tooltip>}>
                  <button
                    className={classNames("playback-button--small lyrics", { active: drawer.panel === "lyrics" })}
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
          </>
        ) : (
          <div className={"app-chrome-item search"}>
            <div className={"search-input-container"}>
              <div className={"search-input--icon"} />
              <input
                type={"search"}
                spellCheck={false}
                onClick={() => {
                  $root.appRoute("search");
                  search.showHints = true;
                }}
                onFocus={() => (search.showHints = true)}
                onBlur={() =>
                  setTimeout(() => {
                    if (!hintscontext) {
                      search.showHints = false;
                    }
                  }, 300)
                }
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    searchQuery(search.hints[search.cursor]?.content ?? search.hints[search.cursor]?.searchTerm ?? search.term);
                    search.showHints = false;
                    search.showSearchView = true;
                    search.cursor = -1;
                  }
                  searchCursor();
                }}
                onChange={() => $root.appRoute("search")}
                onInput={() => getSearchHints()}
                placeholder={t("term.search") + "..."}
                v-model={search.term}
                ref={"searchInput"}
                className={"search-input"}
              />
              {search.showHints && search.hints.length !== 0 && (
                <div
                  className={"search-hints-container"}
                  style={{ right: "-13px", left: "unset", paddingTop: 0 }}>
                  <div className={"search-hints"}>
                    {search.hints
                      .filter((a) => {
                        return a.content === null;
                      })
                      .map((hint, index) => (
                        <button
                          key={index}
                          className={classNames("search-hint text-overflow-elipsis", { active: search.cursor === index })}
                          onClick={() => {
                            search.term = hint.searchTerm;
                            search.showHints = false;
                            searchQuery(hint.searchTerm);
                            search.cursor = -1;
                          }}>
                          {hint.displayTerm}
                        </button>
                      ))}
                    {search.hints
                      .filter((a) => {
                        return a.content !== null;
                      })
                      .map((item, position) => (
                        <MediaItemSmarthints
                          key={position}
                          item={item.content}
                          position={position}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {chrome.windowControlPosition === "right" && !chrome.nativeControls ? (
          <div
            className={"app-chrome-item full-height"}
            id={"window-controls-container"}>
            <div className={"window-controls"}>
              <div
                className={"minimize"}
                onClick={() => window.electronAPI.send("minimize")}
              />
              {chrome.maximized ? (
                <div
                  className={"minmax restore"}
                  onClick={() => window.electronAPI.send("maximize")}
                />
              ) : (
                <div
                  className={"minmax"}
                  onClick={() => window.electronAPI.send("maximize")}
                />
              )}
              <div
                className={"close"}
                onClick={() => window.electronAPI.send("close")}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default ChromeTop;
