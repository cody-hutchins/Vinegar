import { useEffect } from "react";
import MediaItemArtwork from "./mediaitem-artwork.jsx";
import classNames from "classnames";
import { useOnInView } from "react-intersection-observer";
import { uuidv4 } from "../../index.js";
import { useTranslation } from "react-i18next";

const MediaItemListItem = ({ item, parent, index = -1, showArtwork = true, showLibraryStatus = true, showMetadata = false, showDuration = true, showIndex, showIndexPlaylist, contextExt, classList = "" }: { item: MusicKit.MediaItem; parent?: string; index?: number; showArtwork?: boolean; showLibraryStatus?: boolean; showMetadata?: boolean; showDuration?: boolean; showIndex?: boolean; showIndexPlaylist?: boolean; contextExt?: object; classList?: string }) => {
  const { t } = useTranslation();
  let showInLibrary = false;
  let isVisible = false;
  let addedToLibrary = false;
  const guid = uuidv4();
  const app = this.$root;
  let displayDuration = true;
  let addClasses: Record<string, unknown> = {};
  let itemId: number | string = 0;
  let isLibrary = false;
  let isLoved = null;

  function mounted() {
    if (item.attributes.playParams) {
      itemId = item.attributes.playParams?.id ?? item.id;
      isLibrary = item.attributes.playParams?.isLibrary ?? false;
    } else {
      itemId = item.id;
    }
    if (item.attributes.playParams && this.$root.cfg.general.showLovedTracksInline) {
      getHeartStatus();
    }
    const duration = item.attributes.durationInMillis ?? 0;
    if (duration === 0 || !showDuration) {
      displayDuration = false;
    }
    getClasses();
  }

  useEffect(() => {
    mounted();
  }, []);

  function getBgColor() {
    const color = `#${item.attributes.artwork !== null && item.attributes.artwork.bgColor !== null ? item.attributes.artwork.bgColor : ``}`;
    return color;
  }
  function checkLibrary() {
    if ((item?.id ?? "").toString().startsWith("ciderlocal")) {
      return true;
    }
    if (addedToLibrary) {
      return addedToLibrary;
    }
    if (item.type.includes("library-playlists") || item.type.includes("station")) {
      addedToLibrary = true;
      return;
    }
    this.$root.inLibrary([item]).then((res) => {
      addedToLibrary = res[0]?.attributes?.inLibrary ?? false;
    });
    return addedToLibrary;
  }

  function getClasses() {
    addClasses = {};
    if (typeof item.attributes.playParams === "undefined" && item.type !== "podcast-episodes") {
      addClasses["disabled"] = true;
    }
    if (classList) {
      const _classList = classList.split(" ");
      for (let i = 0; i < _classList.length; i++) {
        addClasses[_classList[i]] = true;
      }
    }
  }

  function dragStart(evt) {
    evt.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: item.attributes.playParams?.kind ?? item.type,
        id: item.id,
      }),
    );
  }

  function msToMinSec(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  function getDataType() {
    let type;
    if (typeof item.attributes.playParams !== "undefined") {
      if (item.attributes.playParams?.isLibrary) {
        type = item.type;
      } else {
        type = item.attributes.playParams?.kind;
      }
    } else {
      type = item.type;
    }
    if (type === "podcast-episodes") type = "episode";
    return type;
  }
  function select(e) {
    const data_type = getDataType();
    const item_id = item.attributes.playParams?.id ?? item.id;
    const isLibrary = item.attributes.playParams?.isLibrary ?? false;

    if (e.shiftKey) {
      if (index !== -1) {
        if (app.selectedMediaItems.length === 0) {
          app.select_selectMediaItem(item_id, getDataType(), index, guid, isLibrary);
        }
        const allMediaItems = document.querySelectorAll(".cd-mediaitem-list-item[data-index]");
        const startIndex = Math.min(...app.selectedMediaItems.map((item) => item.index));
        const endIndex = Math.max(...app.selectedMediaItems.map((item) => item.index));
        if (index < startIndex) {
          for (let i = index; i <= endIndex; i++) {
            const item = allMediaItems[i];
            if (item) {
              (app.select_selectMediaItem(item.getAttribute("data-id"), item.getAttribute("data-type"), item.getAttribute("data-index"), item.getAttribute("data-guid")), item.getAttribute("data-islibrary"));
            }
          }
        } else if (index > endIndex) {
          for (let i = startIndex; i <= index; i++) {
            const item = allMediaItems[i];
            if (item) {
              (app.select_selectMediaItem(item.getAttribute("data-id"), item.getAttribute("data-type"), item.getAttribute("data-index"), item.getAttribute("data-guid")), item.getAttribute("data-islibrary"));
            }
          }
        } else {
          for (let i = startIndex; i <= endIndex; i++) {
            const item = allMediaItems[i];
            if (item) {
              (app.select_selectMediaItem(item.getAttribute("data-id"), item.getAttribute("data-type"), item.getAttribute("data-index"), item.getAttribute("data-guid")), item.getAttribute("data-islibrary"));
            }
          }
        }
      }
    } else if (e.ctrlKey) {
      if (app.select_hasMediaItem(guid)) {
        app.select_removeMediaItem(guid);
      } else {
        app.select_selectMediaItem(item_id, getDataType(), index, guid, isLibrary);
      }
    } else {
      if (app.select_hasMediaItem(guid)) {
        app.selectedMediaItems = [];
      } else {
        app.selectedMediaItems = [];
        app.select_selectMediaItem(item_id, getDataType(), index, guid, isLibrary);
      }
    }
  }
  async function contextMenu(event) {
    const data_type = getDataType();
    const item_id = item.attributes.playParams?.id ?? item.id;
    const isLibrary = item.attributes.playParams?.isLibrary ?? false;

    let useMenu = "normal";
    if (app.selectedMediaItems.length <= 1) {
      app.selectedMediaItems = [];
      app.select_selectMediaItem(item_id, data_type, index, guid, isLibrary);
    } else {
      useMenu = "multiple";
    }
    const menus = {
      multiple: {
        items: [
          {
            name: t("action.addToPlaylist"),
            icon: "./assets/feather/plus.svg",
            action: function () {
              app.promptAddToPlaylist();
            },
          },
          {
            name: t("action.playTracksNext").replace("${app.selectedMediaItems.length}", app.selectedMediaItems.length),
            icon: "./assets/arrow-bend-up.svg",
            action: () => {
              const itemsToPlay: Record<string, unknown[]> = {};
              app.selectedMediaItems.forEach((item) => {
                if (!itemsToPlay[item.kind]) {
                  itemsToPlay[item.kind] = [];
                }
                itemsToPlay[item.kind].push(item.id);
              });
              // loop through itemsToPlay
              for (const kind in itemsToPlay) {
                const ids = itemsToPlay[kind];
                if (ids.length > 0) {
                  app.mk.playNext({ [kind + "s"]: itemsToPlay[kind] });
                }
              }
              console.log(itemsToPlay);
              app.selectedMediaItems = [];
            },
          },
          {
            name: t("action.playTracksLater").replace("${app.selectedMediaItems.length}", app.selectedMediaItems.length),
            icon: "./assets/arrow-bend-down.svg",
            action: () => {
              const itemsToPlay: Record<string, unknown[]> = {};
              app.selectedMediaItems.forEach((item) => {
                if (!itemsToPlay[item.kind]) {
                  itemsToPlay[item.kind] = [];
                }
                itemsToPlay[item.kind].push(item.id);
              });
              // loop through itemsToPlay
              for (const kind in itemsToPlay) {
                const ids = itemsToPlay[kind];
                if (ids.length > 0) {
                  app.mk.playLater({ [kind + "s"]: itemsToPlay[kind] });
                }
              }
              console.log(itemsToPlay);
              app.selectedMediaItems = [];
            },
          },
        ],
      },
      normal: {
        headerItems: [
          {
            icon: "./assets/feather/heart.svg",
            id: "love",
            name: t("action.love"),
            hidden: false,
            disabled: true,
            action: function () {
              isLoved = true;
              app.love(item);
            },
          },
          {
            icon: "./assets/feather/heart.svg",
            id: "unlove",
            active: true,
            name: t("action.unlove"),
            hidden: true,
            action: function () {
              isLoved = false;
              app.unlove(item);
            },
          },
          {
            icon: "./assets/feather/thumbs-down.svg",
            id: "dislike",
            name: t("action.dislike"),
            hidden: false,
            disabled: true,
            action: function () {
              app.dislike(item);
            },
          },
          {
            icon: "./assets/feather/thumbs-down.svg",
            id: "undo_dislike",
            name: t("action.undoDislike"),
            active: true,
            hidden: true,
            action: function () {
              app.unlove(item);
            },
          },
        ],
        items: [
          {
            id: "addToLibrary",
            icon: "./assets/feather/plus.svg",
            name: t("action.addToLibrary"),
            hidden: false,
            disabled: true,
            action: function () {
              addToLibrary();
            },
          },
          {
            id: "removeFromLibrary",
            icon: "./assets/feather/x-circle.svg",
            name: t("action.removeFromLibrary"),
            hidden: true,
            action: function () {
              removeFromLibrary();
            },
          },
          {
            icon: "./assets/feather/list.svg",
            name: t("action.addToPlaylist"),
            action: function () {
              app.promptAddToPlaylist();
            },
          },
          {
            name: t("action.playNext"),
            icon: "./assets/arrow-bend-up.svg",
            action: function () {
              let type = item.attributes.playParams?.kind ?? item.type;
              if (type === "podcast-episodes") {
                type = "episode";
              }
              app.mk.playNext({ [type]: item.attributes.playParams?.id ?? item.id });
              app.mk.queue._reindex();
              app.selectedMediaItems = [];
            },
          },
          {
            name: t("action.playLater"),
            icon: "./assets/arrow-bend-down.svg",
            action: function () {
              let type = item.attributes.playParams?.kind ?? item.type;
              if (type === "podcast-episodes") {
                type = "episode";
              }
              app.mk.playLater({ [type]: item.attributes.playParams?.id ?? item.id });
              app.mk.queue._reindex();
              app.selectedMediaItems = [];
            },
          },
          {
            icon: "./assets/feather/radio.svg",
            name: t("action.startRadio"),
            action: function () {
              app.mk.setStationQueue({ song: item.attributes.playParams?.id ?? item.id }).then(() => {
                app.mk.play();
                app.selectedMediaItems = [];
              });
            },
          },
          {
            icon: "./assets/feather/user.svg",
            name: t("action.goToArtist"),
            action: function () {
              app.searchAndNavigate(item, "artist");
            },
          },
          {
            icon: "./assets/feather/disc.svg",
            name: t("action.goToAlbum"),
            action: function () {
              app.searchAndNavigate(item, "album");
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: t("action.share"),
            action: async function () {
              const _item = item;
              if (!_item.attributes.url) {
                if (_item.type.includes("library")) {
                  const result = (await app.mk.api.v3.music(`/v1/me/library/${_item.type.replace("library-", "")}/${_item.id}/catalog`)).data.data[0];
                  if (result.attributes.url) {
                    app.copyToClipboard(result.attributes.url);
                  } else {
                    notyf.error("Failed to get share URL");
                  }
                }
              } else {
                app.copyToClipboard(_item.attributes.url);
              }
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: `${t("action.share")} (song.link)`,
            action: async function () {
              const _item = item;
              if (_item.type.startsWith("library-")) {
                _item.attributes.url = _item.relationships.catalog.data[0].attributes.url;
                _item.attributes.url = _item.relationships.catalog.data[0].attributes.url;
              }
              if (!_item.attributes.url) {
                if (_item.type.includes("library")) {
                  const result = (await app.mk.api.v3.music(`/v1/me/library/${_item.type.replace("library-", "")}/${_item.id}/catalog`)).data.data[0];
                  if (result.attributes.url) {
                    app.copyToClipboard(result.attributes.url);
                  } else {
                    notyf.error("Failed to get share URL");
                  }
                }
              } else {
                app.songLinkShare(_item.attributes.url);
              }
            },
          },
        ],
      },
    };
    if (contextExt) {
      // if context-ext.normal is true append all options to the 'normal' menu which is a kvp of arrays
      if (contextExt.normal) {
        menus.normal.items = menus.normal.items.concat(contextExt.normal);
      }
      if (contextExt.multiple) {
        menus.multiple.items = menus.multiple.items.concat(contextExt.multiple);
      }
    }
    app.showMenuPanel(menus[useMenu], event);

    try {
      await checkLibrary().then((res) => {
        console.log(res);
        if (res) {
          menus.normal.items.find((x) => x.id === "addToLibrary")!.hidden = true;
          menus.normal.items.find((x) => x.id === "removeFromLibrary")!.hidden = false;
        } else {
          menus.normal.items.find((x) => x.id === "addToLibrary")!.disabled = false;
        }
      });
    } catch (e) {
      console.log(e);
    }
    try {
      const rating = await app.getRating(item);
      if (rating === 0) {
        menus.normal.headerItems.find((x) => x.id === "love")!.disabled = false;
        menus.normal.headerItems.find((x) => x.id === "dislike")!.disabled = false;
      } else if (rating === 1) {
        menus.normal.headerItems.find((x) => x.id === "unlove")!.hidden = false;
        menus.normal.headerItems.find((x) => x.id === "love")!.hidden = true;
      } else if (rating === -1) {
        menus.normal.headerItems.find((x) => x.id === "undo_dislike")!.hidden = false;
        menus.normal.headerItems.find((x) => x.id === "dislike")!.hidden = true;
      }
    } catch (err) {
      console.log(err);
    }
  }

  const visibilityChanged = (_isVisible, entry) => {
    isVisible = _isVisible;
  };
  const ref = useOnInView(visibilityChanged);
  async function getHeartStatus() {
    try {
      await app.getRating(item).then((res) => {
        if (res === 1) {
          isLoved = true;
        } else {
          isLoved = false;
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  function addToLibrary() {
    const _item = item;
    if (_item.attributes.playParams?.id) {
      console.log("adding to library", _item.attributes.playParams?.id);
      app.addToLibrary(_item.attributes.playParams?.id.toString());
      addedToLibrary = true;
    } else if (_item.id) {
      console.log("adding to library", _item.id);
      app.addToLibrary(_item.id.toString());
      addedToLibrary = true;
    }
  }
  async function removeFromLibrary() {
    const _item = item;
    const params = { "fields[songs]": "inLibrary", "fields[albums]": "inLibrary", relate: "library" };
    let id = _item.id ?? _item.attributes.playParams?.id;
    const res = await app.mkapi(_item.attributes.playParams?.kind ?? _item.type, _item.attributes.playParams?.isLibrary ?? false, _item.attributes.playParams?.id ?? _item.id, params);
    if (res && res.relationships && res.relationships.library && res.relationships.library.data && res.relationships.library.data.length > 0) {
      id = res.relationships.library.data[0].id;
    }
    const kind = _item.attributes.playParams?.kind ?? data.item ?? "";
    const truekind = !kind.endsWith("s") ? kind + "s" : kind;
    if (_item.attributes.playParams?.id) {
      console.log("remove from library", id);
      app.removeFromLibrary(truekind, id);
      addedToLibrary = false;
    } else if (_item.id) {
      console.log("remove from library", id);
      app.removeFromLibrary(truekind, id);
      addedToLibrary = false;
    }
  }

  function playTrack() {
    const childIndex = index;
    const kind = item.attributes.playParams ? (item.attributes.playParams?.kind ?? item.type ?? "") : (item.type ?? "");
    const id = item.attributes.playParams ? (item.attributes.playParams?.id ?? item.id ?? "") : (item.id ?? "");
    const isLibrary = item.attributes.playParams ? (item.attributes.playParams?.isLibrary ?? false) : false;
    const truekind = !kind.endsWith("s") ? kind + "s" : kind;
    console.log(item, parent, childIndex, kind, id, isLibrary, kind === "playlists", id.startsWith("p.") || id.startsWith("pl.u"));
    app.mk.stop().then(() => {
      if (parent !== null && childIndex !== null) {
        app.queueParentandplayChild(parent, childIndex, item);
      } else if (kind.includes("playlist") && (id.startsWith("p.") || id.startsWith("pl."))) {
        function shuffleArray(array: unknown[]) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
          }
        }

        app.mk
          .setQueue({
            [truekind]: [item.attributes.playParams?.id ?? item.id],
            parameters: { l: app.mklang },
          })
          .then(function () {
            app.mk.play().then(function () {
              // const playlistId = id;

              function getPlaylist(id, isLibrary) {
                if (isLibrary) {
                  return app.mk.api.v3.music(`/v1/me/library/playlists/${id}`);
                } else {
                  return app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/playlists/${id}`);
                }
              }

              try {
                getPlaylist(id, isLibrary).then((res) => {
                  //let query = res.relationships.tracks.data.map(item => new MusicKit.MediaItem(item));
                  //if (app.mk.shuffleMode === 1){shuffleArray(query); }
                  // console.log(query)
                  // app.mk.queue.append(query)
                  if (!res.data.relationships.tracks.next) {
                    return;
                  } else {
                    getPlaylistTracks(res.data.relationships.tracks.next);
                  }

                  function getPlaylistTracks(next) {
                    app.apiCall(app.musicBaseUrl + next, (res) => {
                      // if (res.id !== playlistId || next.includes(playlistId)) {
                      //     return
                      // }
                      console.log("nextres", res);
                      const query = res.data.map((item) => new MusicKit.MediaItem(item));
                      if (app.mk.shuffleMode === 1) {
                        shuffleArray(query);
                        console.log("shf");
                      }
                      app.mk.queue.append(query);

                      if (res.next) {
                        getPlaylistTracks(res.next);
                      }
                    });
                  }
                });
              } catch (e) {
                console.log(e);
              }
            });
          });
      } else {
        app.playMediaItemById(item.attributes.playParams?.id ?? item.id, item.attributes.playParams?.kind ?? item.type, item.attributes.playParams?.isLibrary ?? false, item.attributes.url);
      }
    });
  }
  function route() {
    const kind = item.attributes.playParams ? (item.attributes.playParams?.kind ?? item.type ?? "") : (item.type ?? "");
    if (kind.toLowerCase().includes("album") || kind.toLowerCase().includes("playlist")) {
      app.routeView(item);
    } else {
      playTrack();
    }
  }
  return (
    <div id={"mediaitem-list-item"}>
      <div
        ref={ref}
        onContextMenu={contextMenu}
        onClick={() => select}
        data-id={itemId}
        data-type={getDataType()}
        data-index={index}
        data-guid={guid}
        data-islibrary={isLibrary}
        key={itemId}
        className={classNames("cd-mediaitem-list-item", { "mediaitem-selected": app.select_hasMediaItem(guid) }, addClasses)}
        onMouseEnter={checkLibrary}
        onMouseOver={() => {
          showInLibrary = true;
        }}
        onMouseLeave={() => {
          showInLibrary = false;
        }}
        onDoubleClick={route}
        controller-click={route()}
        tabIndex={0}>
        <div
          style={{ display: isVisible ? "inherit" : "none" }}
          className={"listitem-content"}>
          {!showInLibrary && item?.meta?.popularity !== null && item?.meta?.popularity > 0.7 && <div className={"popular"} />}
          {showLibraryStatus && (
            <div className={"isLibrary"}>
              {showInLibrary && (
                <div style={{ display: showInLibrary ? "block" : "none", marginLeft: "11px" }}>
                  {!addedToLibrary && (!showIndex || (showIndex && showIndexPlaylist)) ? (
                    <button
                      onClick={() => addToLibrary()}
                      aria-label={t("action.addToLibrary")}>
                      <div
                        className={"svg-icon addIcon"}
                        style={{ color: "var(--keyColor)", url: "url(./assets/feather/plus.svg)" }}
                      />
                    </button>
                  ) : null}
                </div>
              )}
              {!(app.mk.isPlaying && ((app.mk.nowPlayingItem._songId ?? app.mk.nowPlayingItem.songId ?? app.mk.nowPlayingItem.id) === itemId || app.mk.nowPlayingItem.id === item.id)) && showIndex && (
                <div style={{ display: showIndex && !showInLibrary ? "block" : "none", marginLeft: "11px" }}>
                  <div>
                    <div>{item.attributes && !showIndexPlaylist ? (item.attributes.trackNumber ?? "") : index ? index * 1 + 1 : ""}</div>
                  </div>
                </div>
              )}
              {app.mk.isPlaying && ((app.mk.nowPlayingItem._songId ?? app.mk.nowPlayingItem.songId ?? app.mk.nowPlayingItem.id) === itemId || app.mk.nowPlayingItem.id === item.id) && (
                <div style={{ display: showInLibrary ? "none" : "block" }}>
                  <div className={"loadbar-sound"} />
                </div>
              )}
            </div>
          )}
          {showArtwork && (!showIndex || (showIndex && showIndexPlaylist)) && (
            <div className={"artwork"}>
              <MediaItemArtwork
                url={item.attributes.artwork ? item.attributes.artwork.url : ""}
                size={"48"}
                bgcolor={getBgColor()}
                type={item.type}
              />
              <button
                className={"overlay-play"}
                onClick={() => playTrack()}
                aria-label={t("term.play")}>
                {import("../svg/play.svg")}
              </button>
            </div>
          )}
          <div
            className={"info-rect"}
            style={{ paddingLeft: showArtwork ? "" : "16px" }}
            onDoubleClick={route}>
            <div
              className={"title text-overflow-elipsis"}
              title={item.attributes.name}>
              {item.attributes.name}
            </div>
            <div
              className={"subtitle text-overflow-elipsis"}
              style={{ "-webkit-box-orient": "horizontal" }}>
              {item.attributes.artistName && (
                <>
                  <div
                    className={"artist item-navigate text-overflow-elipsis"}
                    title={item.attributes.artistName}
                    onClick={() => app.searchAndNavigate(item, "artist")}>
                    {item.attributes.artistName}
                  </div>
                  {item.attributes.albumName && <>&nbsp;—&nbsp;</>}
                  {item.attributes.albumName && (
                    <div
                      className={"artist item-navigate text-overflow-elipsis"}
                      title={item.attributes.albumName}
                      onClick={() => app.searchAndNavigate(item, "album")}>
                      {item.attributes.albumName}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className={"heart-icon"}>
            {/*{(!isLoved) && <div className="heart-unfilled"  style={{'--url': 'url(./assets/feather/heart.svg)'}} />}*/}
            {isLoved && (
              <div
                className={"heart-filled"}
                style={{ url: "url(./assets/feather/heart-fill.svg)" }}
              />
            )}
          </div>
          {item.attributes && item.attributes.contentRating === "explicit" && <div className={"explicit-icon"} />}
          {showMetadata && (
            <template onDoubleClick={route}>
              <div className={"metainfo"}>{item.attributes.releaseDate ? new Date(item.attributes.releaseDate).toLocaleDateString() : ""}</div>
              <div className={"metainfo"}>{item.attributes.genreNames[0] ?? ""}</div>
            </template>
          )}
          {displayDuration && (
            <div
              className={"duration"}
              onDoubleClick={route}>
              {msToMinSec(item.attributes.durationInMillis ?? 0)}
            </div>
          )}
          {item.attributes.playCount && (
            <div
              className={"duration"}
              onDoubleClick={route}>
              {item.attributes.playCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaItemListItem;
