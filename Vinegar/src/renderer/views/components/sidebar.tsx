import { OverlayTrigger, Tooltip } from "react-bootstrap";
import SidebarLibraryItem from "../../main/components/sidebar-library-item.jsx";
import SVGIcon from "../../main/components/svg-icon.jsx";
import MediaItemArtwork from "./mediaitem-artwork.jsx";
import MediaItemSmarthints from "./mediaitem-smarthints.jsx";
import SidebarPlaylist from "./sidebar-playlist.jsx";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useCfgStore } from "../../store/cfg.js";

const Sidebar = () => {
  const { t } = useTranslation();
  const { cfg } = useCfgStore();

  const switchArtworkDisplayLayout = () => {
    switch (cfg.visual.artworkDisplayLayout) {
      case "default":
        cfg.visual.artworkDisplayLayout = "sidebar";
        break;
      case "sidebar":
        cfg.visual.artworkDisplayLayout = "default";
        break;
      default:
        cfg.visual.artworkDisplayLayout = "default";
        break;
    }
  };
  return (
    <div id={"cider-app-sidebar"}>
      <div id={"app-sidebar"}>
        {$root.getThemeDirective("windowLayout") !== "twopanel" && (
          <div className={"app-sidebar-header"}>
            <div className={"search-input-container"}>
              <div className={"search-input--icon"} />
              <input
                type={"search"}
                spellCheck={false}
                onClick={() => {
                  $root.appRoute("search");
                  $root.search.showHints = true;
                }}
                onFocus={() => {
                  $root.search.showHints = true;
                }}
                onBlur={() =>
                  $root.setTimeout(() => {
                    if (!$root.hintscontext) {
                      $root.search.showHints = false;
                    }
                  }, 300)
                }
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    $root.searchQuery(
                      $root.search.hints[$root.search.cursor]?.content ??
                        $root.search.hints[$root.search.cursor]?.searchTerm ??
                        $root.search.term,
                    );
                    $root.search.showHints = false;
                    $root.search.showSearchView = true;
                    $root.search.cursor = -1;
                  }
                  $root.searchCursor();
                }}
                onChange={() => $root.appRoute("search")}
                onInput={() => $root.getSearchHints()}
                placeholder={t("term.search") + "..."}
                v-model={$root.search.term}
                ref={"searchInput"}
                className={"search-input"}
              />
              {$root.search.showHints && $root.search.hints.length !== 0 && (
                <div className={"search-hints-container"}>
                  <div className={"search-hints"}>
                    {$root.search.hints
                      .filter((a) => a.content === null)
                      .map((hint, index) => (
                        <button
                          key={index}
                          className={classNames("search-hint", "text-overflow-elipsis", { active: $root.search.cursor === index })}
                          onClick={() => {
                            $root.search.term = hint.searchTerm;
                            $root.search.showHints = false;
                            $root.searchQuery(hint.searchTerm);
                            $root.search.cursor = -1;
                          }}>
                          {hint.displayTerm}
                        </button>
                      ))}
                    {$root.search.hints
                      .filter((a) => a.content !== null)
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
        <div
          className={"app-sidebar-content"}
          scrollaxis={"y"}>
          {/* AM Navigation  */}
          <div
            style={{ display: $root.getThemeDirective("windowLayout") !== "twopanel" ? "inherit" : "none" }}
            className={"sidebarCatalogSection"}>
            <div
              className={classNames("app-sidebar-header-text", { collapsed: cfg.general.sidebarCollapsed.cider })}
              onClick={() => {
                cfg.general.sidebarCollapsed.cider = !cfg.general.sidebarCollapsed.cider;
              }}>
              {t("app.name")}
            </div>
            {!cfg.general.sidebarCollapsed.cider && (
              <SidebarLibraryItem
                name={t("home.title")}
                svg-icon={"./assets/feather/home.svg"}
                svg-icon-name={"home"}
                page={"home"}
              />
            )}
            <div
              className={classNames("app-sidebar-header-text", { collapsed: cfg.general.sidebarCollapsed.applemusic })}
              onClick={() => {
                cfg.general.sidebarCollapsed.applemusic = !cfg.general.sidebarCollapsed.applemusic;
              }}>
              {t("term.appleMusic")}
            </div>
            {!cfg.general.sidebarCollapsed.applemusic && (
              <>
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
              </>
            )}
          </div>
          <div
            className={classNames("app-sidebar-header-text", { collapsed: cfg.general.sidebarCollapsed.library })}
            onClick={() => {
              cfg.general.sidebarCollapsed.library = !cfg.general.sidebarCollapsed.library;
            }}>
            {t("term.library")}
          </div>
          {!cfg.general.sidebarCollapsed.library && (
            <>
              {cfg.general.sidebarItems.recentlyAdded && (
                <SidebarLibraryItem
                  name={t("term.recentlyAdded")}
                  svg-icon={"./assets/feather/plus-circle.svg"}
                  svg-icon-name={"recentlyAdded"}
                  page={"library-recentlyadded"}
                />
              )}
              {cfg.general.sidebarItems.songs && (
                <SidebarLibraryItem
                  name={t("term.songs")}
                  svg-icon={"./assets/feather/music.svg"}
                  svg-icon-name={"songs"}
                  page={"library-songs"}
                />
              )}
              {cfg.general.sidebarItems.albums && (
                <SidebarLibraryItem
                  name={t("term.albums")}
                  svg-icon={"./assets/feather/disc.svg"}
                  svg-icon-name={"albums"}
                  page={"library-albums"}
                />
              )}
              {cfg.general.sidebarItems.artists && (
                <SidebarLibraryItem
                  name={t("term.artists")}
                  svg-icon={"./assets/feather/user.svg"}
                  svg-icon-name={"artists"}
                  page={"library-artists"}
                />
              )}
              {cfg.general.sidebarItems.videos && (
                <SidebarLibraryItem
                  name={t("term.videos")}
                  svg-icon={"./assets/feather/video.svg"}
                  svg-icon-name={"videos"}
                  page={"library-videos"}
                />
              )}
              {cfg.general.sidebarItems.podcasts && (
                <SidebarLibraryItem
                  name={t("term.podcasts")}
                  svg-icon={"./assets/feather/mic.svg"}
                  svg-icon-name={"podcasts"}
                  page={"podcasts"}
                />
              )}
            </>
          )}
          {/*{(cfg.libraryPrefs.localPaths.length !== 0) && <><div className="app-sidebar-header-text"
                onClick={() =>{cfg.general.sidebarCollapsed.localLibrary = !cfg.general.sidebarCollapsed.localLibrary}}
                className="{collapsed: cfg.general.sidebarCollapsed.localLibrary}">
              Local Library
          </div>{(!cfg.general.sidebarCollapsed.localLibrary) && <>
              <SidebarPlaylist item={{attributes: { name:'Songs'} , id:'ciderlocal'}} />
          </>}</>}*/}
          {$root.getPlaylistFolderChildren("p.applemusic").length !== 0 && (
            <>
              <div
                className={classNames("app-sidebar-header-text", { collapsed: cfg.general.sidebarCollapsed.amplaylists })}
                onClick={() => {
                  cfg.general.sidebarCollapsed.amplaylists = !cfg.general.sidebarCollapsed.amplaylists;
                }}
                contextMenu={$root.playlistHeaderContextMenu}>
                {t("term.appleMusic")}
                {t("term.playlists")}
              </div>
              {!cfg.general.sidebarCollapsed.amplaylists &&
                $root.getPlaylistFolderChildren("p.applemusic").map((item) => (
                  <SidebarPlaylist
                    key={item.id}
                    item={item}
                  />
                ))}
            </>
          )}
          <div
            className={classNames("app-sidebar-header-text", { collapsed: cfg.general.sidebarCollapsed.playlists })}
            onClick={() => {
              cfg.general.sidebarCollapsed.playlists = !cfg.general.sidebarCollapsed.playlists;
            }}
            contextMenu={$root.playlistHeaderContextMenu}>
            {t("term.playlists")}
          </div>
          {!cfg.general.sidebarCollapsed.playlists && (
            <>
              <button
                className={"app-sidebar-item"}
                onClick={() => $root.playlistHeaderContextMenu}>
                <SVGIcon url={"./assets/feather/plus.svg"} />
                <div className={"sidebar-item-text"}>{t("action.createNew")}</div>
              </button>
              {$root.getPlaylistFolderChildren("p.playlistsroot").map((item) => (
                <SidebarPlaylist
                  key={item.id}
                  madeforyou
                  item={item}
                />
              ))}
            </>
          )}
          {cfg.visual.artworkDisplayLayout === "sidebar" && (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchArtworkDisplayLayout();
              }}
              className={"artwork"}
              id={"artworkLCD"}
              style={{ position: "sticky", bottom: "0px" }}>
              <MediaItemArtwork url={$root.currentArtUrl} />
            </div>
          )}
        </div>
        <div className={"app-sidebar-footer display--small app-sidebar-footer--controls"}>
          <div
            className={"app-playback-controls"}
            contextMenu={$root.nowPlayingContextMenu}>
            <div className={"control-buttons"}>
              <div className={"app-chrome-item"}>
                {$root.mk.shuffleMode === 0 ? (
                  <OverlayTrigger
                    placement={"top-end"}
                    overlay={<Tooltip id={"enable-shuffle"}>{t("term.enableShuffle")}</Tooltip>}>
                    <button
                      onClick={() => {
                        $root.mk.shuffleMode = 1;
                      }}
                      className={classNames("playback-button--small", "shuffle", { disabled: isDisabled() })}
                    />
                  </OverlayTrigger>
                ) : (
                  <OverlayTrigger
                    placement={"top-end"}
                    overlay={<Tooltip id={"disable-shuffle"}>{t("term.disableShuffle")}</Tooltip>}>
                    <button
                      onClick={() => {
                        $root.mk.shuffleMode = 0;
                      }}
                      className={classNames("playback-button--small", "shuffle", "active", { disabled: isDisabled() })}
                    />
                  </OverlayTrigger>
                )}
              </div>
              <div className={"app-chrome-item"}>
                <OverlayTrigger overlay={<Tooltip id={"previous"}>{t("term.previous")}</Tooltip>}>
                  <button
                    className={classNames("playback-button", "previous", { disabled: isPrevDisabled() })}
                    onClick={() => $root.prevButton()}
                  />
                </OverlayTrigger>
              </div>
              <div className={"app-chrome-item"}>
                {$root.mk.isPlaying && $root.mk.nowPlayingItem.attributes.playParams.kind === "radioStation" ? (
                  <OverlayTrigger overlay={<Tooltip id={"stop"}>{t("stop")}</Tooltip>}>
                    <button
                      className={"playback-button stop"}
                      onClick={() => $root.mk.stop()}
                    />
                  </OverlayTrigger>
                ) : (
                  <OverlayTrigger overlay={<Tooltip id={"play"}>{t("play")}</Tooltip>}>
                    <button
                      className={"playback-button play"}
                      onClick={() => $root.mk.play()}
                    />
                  </OverlayTrigger>
                )}
              </div>
              <div className={"app-chrome-item"}>
                <OverlayTrigger overlay={<Tooltip id={"next"}>{t("next")}</Tooltip>}>
                  <button
                    className={classNames("playback-button", "next", { disabled: isNextDisabled() })}
                    onClick={() => $root.skipToNextItem()}
                  />
                </OverlayTrigger>
              </div>
              <div className={"app-chrome-item"}>
                {$root.mk.repeatMode === 0 ? (
                  <OverlayTrigger overlay={<Tooltip id={"repeat"}>{t("enableRepeatOne")}</Tooltip>}>
                    <button
                      onClick={() => {
                        $root.mk.repeatMode = 1;
                      }}
                      className={classNames("playback-button--small", "repeat", { disabled: isDisabled() })}
                    />
                  </OverlayTrigger>
                ) : null}
              </div>
            </div>
            <div className={"app-chrome-item volume"}>
              <div className={"input-container"}>
                <OverlayTrigger overlay={<Tooltip id={"repeat"}>{cfg.audio.muted ? t("term.unmute") : t("term.mute")}</Tooltip>}>
                  <button
                    className={classNames("volume-button--small volume", { active: cfg.audio.volume === 0 })}
                    onClick={() => $root.muteButtonPressed()}
                  />
                </OverlayTrigger>
                {typeof $root.mk.volume !== "undefined" && (
                  <OverlayTrigger overlay={<Tooltip id={"range"}>{$root.formatVolumeTooltip()}</Tooltip>}>
                    <input
                      type={"range"}
                      className={""}
                      onWheel={$root.volumeWheel}
                      step={cfg.audio.volumeStep}
                      min={"0"}
                      max={cfg.audio.maxVolume}
                      v-model={$root.mk.volume}
                      onChange={() => $root.checkMuteChange()}
                    />
                  </OverlayTrigger>
                )}
              </div>
            </div>
          </div>
        </div>
        {$root.library.backgroundNotification.show && (
          <div className={"app-sidebar-notification backgroundNotification"}>
            <div className={"message"}>
              {$root.library.backgroundNotification.message} ({$root.library.backgroundNotification.progress} /{" "}
              {$root.library.backgroundNotification.total})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
