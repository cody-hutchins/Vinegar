import SidebarLibraryItem from "../../main/components/sidebar-library-item.jsx";
import SVGIcon from "../../main/components/svg-icon.jsx";
import MediaItemArtwork from "./mediaitem-artwork.jsx";
import MediaItemSmarthints from "./mediaitem-smarthints.jsx";
import SidebarPlaylist from "./sidebar-playlist.jsx";

const Sidebar = () => {
  const switchArtworkDisplayLayout = () => {
    switch (app.cfg.visual.artworkDisplayLayout) {
      case "default":
        app.cfg.visual.artworkDisplayLayout = "sidebar";
        break;
      case "sidebar":
        app.cfg.visual.artworkDisplayLayout = "default";
        break;
      default:
        app.cfg.visual.artworkDisplayLayout = "default";
        break;
    }
  };
  return (
    <>
      <div id={"cider-app-sidebar"}>
        <div id={"app-sidebar"}>
          {$root.getThemeDirective("windowLayout") !== "twopanel" && (
            <template>
              <div className={"app-sidebar-header"}>
                <div className={"search-input-container"}>
                  <div className={"search-input--icon"} />
                  <input
                    type={"search"}
                    spellCheck={"false"}
                    onClick={() => {
                      $root.appRoute("search");
                      $root.search.showHints = true;
                    }}
                    onFocus={() => {
                      $root.search.showHints = true;
                    }}
                    onBlur={() =>
                      $root.setTimeout(() => {
                        if ($root.hintscontext !== true) {
                          $root.search.showHints = false;
                        }
                      }, 300)
                    }
                    v-on:keyupenter={() => {
                      $root.searchQuery($root.search.hints[$root.search.cursor]?.content ?? $root.search.hints[$root.search.cursor]?.searchTerm ?? $root.search.term);
                      $root.search.showHints = false;
                      $root.search.showSearchView = true;
                      $root.search.cursor = -1;
                    }}
                    v-on:keyup={$root.searchCursor}
                    onChange={() => $root.appRoute("search")}
                    onInput={() => $root.getSearchHints()}
                    placeholder={$root.getLz("term.search") + "..."}
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
                              className={"search-hint text-overflow-elipsis"}
                              className={"{active: ($root.search.cursor === index)}"}
                              onClick={() => {
                                $root.search.term = hint.searchTerm;
                                $root.search.showHints = false;
                                $root.searchQuery(hint.searchTerm);
                                $root.search.cursor = -1;
                              }}>
                              {hint.displayTerm}
                            </button>
                          ))}
                        <template>
                          {$root.search.hints
                            .filter((a) => a.content !== null)
                            .map((item, position) => (
                              <MediaItemSmarthints
                                item={item.content}
                                position={position}
                              />
                            ))}
                        </template>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </template>
          )}
          <div
            className={"app-sidebar-content"}
            scrollaxis={"y"}>
            {/* AM Navigation  */}
            <div
style={{ display: $root.getThemeDirective("windowLayout") !== "twopanel" ? 'inherit' : 'none' }}
className={"sidebarCatalogSection"}>
              <div
                className={"app-sidebar-header-text"}
                onClick={() => {
                  $root.cfg.general.sidebarCollapsed.cider = !$root.cfg.general.sidebarCollapsed.cider;
                }}
                className={"{collapsed: $root.cfg.general.sidebarCollapsed.cider}"}>
                {$root.getLz("app.name")}
              </div>
              {!$root.cfg.general.sidebarCollapsed.cider && (
                <template>
                  <SidebarLibraryItem
                    name={$root.getLz("home.title")}
                    svg-icon={"./assets/feather/home.svg"}
                    svg-icon-name={"home"}
                    page={"home"}
                  />
                </template>
              )}
              <div
                className={"app-sidebar-header-text"}
                onClick={() => {
                  $root.cfg.general.sidebarCollapsed.applemusic = !$root.cfg.general.sidebarCollapsed.applemusic;
                }}
                className={"{collapsed: $root.cfg.general.sidebarCollapsed.applemusic}"}>
                {$root.getLz("term.appleMusic")}
              </div>
              {!$root.cfg.general.sidebarCollapsed.applemusic && (
                <template>
                  <SidebarLibraryItem
                    name={$root.getLz("term.listenNow")}
                    svg-icon={"./assets/feather/play-circle.svg"}
                    svg-icon-name={"listenNow"}
                    page={"listen_now"}
                  />
                  <SidebarLibraryItem
                    name={$root.getLz("term.browse")}
                    svg-icon={"./assets/feather/globe.svg"}
                    svg-icon-name={"browse"}
                    page={"browse"}
                  />
                  <SidebarLibraryItem
                    name={$root.getLz("term.radio")}
                    svg-icon={"./assets/feather/radio.svg"}
                    svg-icon-name={"radio"}
                    page={"radio"}
                  />
                </template>
              )}
            </div>
            <div
              className={"app-sidebar-header-text"}
              onClick={() => {
                $root.cfg.general.sidebarCollapsed.library = !$root.cfg.general.sidebarCollapsed.library;
              }}
              className={"{collapsed: $root.cfg.general.sidebarCollapsed.library}"}>
              {$root.getLz("term.library")}
            </div>
            {!$root.cfg.general.sidebarCollapsed.library && (
              <template>
                {$root.cfg.general.sidebarItems.recentlyAdded && (
                  <SidebarLibraryItem
                    name={$root.getLz("term.recentlyAdded")}
                    svg-icon={"./assets/feather/plus-circle.svg"}
                    svg-icon-name={"recentlyAdded"}
                    page={"library-recentlyadded"}
                  />
                )}
                {$root.cfg.general.sidebarItems.songs && (
                  <SidebarLibraryItem
                    name={$root.getLz("term.songs")}
                    svg-icon={"./assets/feather/music.svg"}
                    svg-icon-name={"songs"}
                    page={"library-songs"}
                  />
                )}
                {$root.cfg.general.sidebarItems.albums && (
                  <SidebarLibraryItem
                    name={$root.getLz("term.albums")}
                    svg-icon={"./assets/feather/disc.svg"}
                    svg-icon-name={"albums"}
                    page={"library-albums"}
                  />
                )}
                {$root.cfg.general.sidebarItems.artists && (
                  <SidebarLibraryItem
                    name={$root.getLz("term.artists")}
                    svg-icon={"./assets/feather/user.svg"}
                    svg-icon-name={"artists"}
                    page={"library-artists"}
                  />
                )}
                {$root.cfg.general.sidebarItems.videos && (
                  <SidebarLibraryItem
                    name={$root.getLz("term.videos")}
                    svg-icon={"./assets/feather/video.svg"}
                    svg-icon-name={"videos"}
                    page={"library-videos"}
                  />
                )}
                {$root.cfg.general.sidebarItems.podcasts && (
                  <SidebarLibraryItem
                    name={$root.getLz("term.podcasts")}
                    svg-icon={"./assets/feather/mic.svg"}
                    svg-icon-name={"podcasts"}
                    page={"podcasts"}
                  />
                )}
              </template>
            )}
            {/*{($root.cfg.libraryPrefs.localPaths.length !== 0) && <template><div className="app-sidebar-header-text"
                     onClick={() =>{$root.cfg.general.sidebarCollapsed.localLibrary = !$root.cfg.general.sidebarCollapsed.localLibrary}}
                     className="{collapsed: $root.cfg.general.sidebarCollapsed.localLibrary}">
                    Local Library
                </div>{(!$root.cfg.general.sidebarCollapsed.localLibrary) && <template>
                    <SidebarPlaylist item={{attributes: { name:'Songs'} , id:'ciderlocal'}} />
                </template>}</template>}*/}
            {$root.getPlaylistFolderChildren("p.applemusic").length !== 0 && (
              <template>
                <div
                  className={"app-sidebar-header-text"}
                  onClick={() => {
                    $root.cfg.general.sidebarCollapsed.amplaylists = !$root.cfg.general.sidebarCollapsed.amplaylists;
                  }}
                  contextMenu={$root.playlistHeaderContextMenu}
                  className={"{collapsed: $root.cfg.general.sidebarCollapsed.amplaylists}"}>
                  {$root.getLz("term.appleMusic")}
                  {$root.getLz("term.playlists")}
                </div>
                {!$root.cfg.general.sidebarCollapsed.amplaylists && (
                  <template>
                    {$root.getPlaylistFolderChildren("p.applemusic").map((item) => (
                      <SidebarPlaylist
                        v-bind:key={item.id}
                        item={item}
                      />
                    ))}
                  </template>
                )}
              </template>
            )}
            <div
              className={"app-sidebar-header-text"}
              onClick={() => {
                $root.cfg.general.sidebarCollapsed.playlists = !$root.cfg.general.sidebarCollapsed.playlists;
              }}
              contextMenu={$root.playlistHeaderContextMenu}
              className={"{collapsed: $root.cfg.general.sidebarCollapsed.playlists}"}>
              {$root.getLz("term.playlists")}
            </div>
            {!$root.cfg.general.sidebarCollapsed.playlists && (
              <template>
                <button
                  className={"app-sidebar-item"}
                  onClick={() => $root.playlistHeaderContextMenu}>
                  <SVGIcon url={"./assets/feather/plus.svg"} />
                  <div className={"sidebar-item-text"}>{$root.getLz("action.createNew")}</div>
                </button>
                {$root.getPlaylistFolderChildren("p.playlistsroot").map((item) => (
                  <SidebarPlaylist
                    v-bind:key={item.id}
                    madeforyou
                    item={item}
                  />
                ))}
              </template>
            )}
            {$root.cfg.visual.artworkDisplayLayout === "sidebar" && (
              <div
                clickstop={switchArtworkDisplayLayout()}
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
                    <button
                      className={"playback-button--small shuffle"}
                      onClick={() => {
                        $root.mk.shuffleMode = 1;
                      }}
                      title={$root.getLz("term.enableShuffle")}
                      className={$root.isDisabled() && "disabled"}
                      v-b-tooltiphoverrighttop
                    />
                  ) : (
                    <button
                      className={"playback-button--small shuffle active"}
                      onClick={() => {
                        $root.mk.shuffleMode = 0;
                      }}
                      title={$root.getLz("term.disableShuffle")}
                      className={$root.isDisabled() && "disabled"}
                      v-b-tooltiphoverrighttop
                    />
                  )}
                </div>
                <div className={"app-chrome-item"}>
                  <button
                    className={"playback-button previous"}
                    onClick={() => $root.prevButton()}
                    className={$root.isPrevDisabled() && "disabled"}
                    title={$root.getLz("term.previous")}
                    v-b-tooltiphover
                  />
                </div>
                <div className={"app-chrome-item"}>
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
                <div className={"app-chrome-item"}>
                  <button
                    className={"playback-button next"}
                    onClick={() => $root.skipToNextItem()}
                    title={$root.getLz("term.next")}
                    className={$root.isNextDisabled() && "disabled"}
                    v-b-tooltiphover
                  />
                </div>
                <div className={"app-chrome-item"}>
                  {$root.mk.repeatMode === 0 ? (
                    <button
                      className={"playback-button--small repeat"}
                      onClick={() => {
                        $root.mk.repeatMode = 1;
                      }}
                      className={$root.isDisabled() && "disabled"}
                      title={$root.getLz("term.enableRepeatOne")}
                      v-b-tooltiphover
                    />
                  ) : null}
                </div>
              </div>
              <div className={"app-chrome-item volume"}>
                <div className={"input-container"}>
                  <button
                    className={"volume-button--small volume"}
                    onClick={() => $root.muteButtonPressed()}
                    className={"{'active': $root.cfg.audio.volume === 0}"}
                    title={$root.cfg.audio.muted ? $root.getLz("term.unmute") : $root.getLz("term.mute")}
                    v-b-tooltiphover
                  />
                  {typeof $root.mk.volume !== "undefined" && (
                    <input
                      type={"range"}
                      className={""}
                      onWheel={$root.volumeWheel}
                      step={$root.cfg.audio.volumeStep}
                      min={"0"}
                      max={$root.cfg.audio.maxVolume}
                      v-model={$root.mk.volume}
                      onChange={() => $root.checkMuteChange()}
                      v-b-tooltiphover
                      title={$root.formatVolumeTooltip()}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          {$root.library.backgroundNotification.show && (
            <div className={"app-sidebar-notification backgroundNotification"}>
              <div className={"message"}>
                {$root.library.backgroundNotification.message} ({$root.library.backgroundNotification.progress} / {$root.library.backgroundNotification.total})
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
