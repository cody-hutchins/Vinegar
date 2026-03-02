export const Component = ({ item, position }: { item: object; position: number }) => {
  const app = this.$root;
  const guid = uuidv4();
  let addedToLibrary = false;
  const beforeDestroy = () => {
    // item = null;
    // kind = null;
    // size = null;
  };
  async function isInLibrary() {
    if (item.type && !item.type.includes("library")) {
      let params = {
        relate: "library",
        fields: "inLibrary",
        extend: revisedRandId(),
      };
      let kind = item.type ?? item.attributes.playParams.kind;
      let truekind = !kind.endsWith("s") ? kind + "s" : kind;
      if (truekind === "musicVideos") {
        truekind = "music-videos";
      }
      let res = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/?ids[${truekind}]=${item.attributes.playParams.id ?? item.id}`, params);
      res = res.data.data[0];
      addedToLibrary = res && res.attributes && res.attributes.inLibrary ? res.attributes.inLibrary : false;
    } else {
      addedToLibrary = true;
    }
  }
  function revisedRandId() {
    return Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .slice(2, 10);
  }
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  }
  function getContextMenu(event) {
    if (event) {
      if (item.type === "artists") {
        return artistMenu(event);
      } else {
        return contextMenu(event);
      }
    } else {
      document.addEventListener(
        "mouseover",
        (event) => {
          if (item.type === "artists") {
            return artistMenu(event);
          } else {
            return contextMenu(event);
          }
        },
        { once: true },
      );
    }
  }
  async function contextMenu(event) {
    let useMenu = "normal";
    if (app.selectedMediaItems.length <= 1) {
      app.selectedMediaItems = [];
      app.select_selectMediaItem(item.attributes.playParams.id ?? item.id, item.attributes.playParams.kind ?? item.type, index, guid, item.attributes.playParams.isLibrary ?? false);
    } else {
      useMenu = "multiple";
    }
    let menus = {
      multiple: {
        items: [
          {
            name: app.getLz("action.playTracksNext").replace("${app.selectedMediaItems.length}", app.selectedMediaItems.length),
            icon: "./assets/arrow-bend-up.svg",
            action: () => {
              let itemsToPlay = {};
              app.selectedMediaItems.forEach((item) => {
                if (!itemsToPlay[item.kind]) {
                  itemsToPlay[item.kind] = [];
                }
                itemsToPlay[item.kind].push(item.id);
              });
              // loop through itemsToPlay
              for (let kind in itemsToPlay) {
                let ids = itemsToPlay[kind];
                if (ids.length > 0) {
                  app.mk.playNext({ [kind + "s"]: itemsToPlay[kind] });
                }
              }
              console.log(itemsToPlay);
              app.selectedMediaItems = [];
            },
          },
          {
            name: app.getLz("action.playTracksLater").replace("${app.selectedMediaItems.length}", app.selectedMediaItems.length),
            icon: "./assets/arrow-bend-down.svg",
            action: () => {
              let itemsToPlay = {};
              app.selectedMediaItems.forEach((item) => {
                if (!itemsToPlay[item.kind]) {
                  itemsToPlay[item.kind] = [];
                }
                itemsToPlay[item.kind].push(item.id);
              });
              // loop through itemsToPlay
              for (let kind in itemsToPlay) {
                let ids = itemsToPlay[kind];
                if (ids.length > 0) {
                  app.mk.playLater({ [kind + "s"]: itemsToPlay[kind] });
                }
              }
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
            name: app.getLz("action.love"),
            hidden: false,
            disabled: true,
            action: function () {
              app.love(item);
            },
          },
          {
            icon: "./assets/feather/heart.svg",
            id: "unlove",
            active: true,
            name: app.getLz("action.unlove"),
            hidden: true,
            action: function () {
              app.unlove(item);
            },
          },
          {
            icon: "./assets/feather/thumbs-down.svg",
            id: "dislike",
            name: app.getLz("action.dislike"),
            hidden: false,
            disabled: true,
            action: function () {
              app.dislike(item);
            },
          },
          {
            icon: "./assets/feather/thumbs-down.svg",
            id: "undo_dislike",
            name: app.getLz("action.undoDislike"),
            active: true,
            hidden: true,
            action: function () {
              app.unlove(item);
            },
          },
        ],
        items: [
          {
            icon: "./assets/feather/list.svg",
            id: "addToPlaylist",
            name: app.getLz("action.addToPlaylist"),
            action: function () {
              app.promptAddToPlaylist();
            },
          },
          {
            id: "addToLibrary",
            icon: "./assets/feather/plus.svg",
            name: app.getLz("action.addToLibrary"),
            hidden: false,
            disabled: true,
            action: function () {
              let item_id = item.attributes.playParams.id ?? item.id;
              let data_type = item.attributes.playParams.kind ?? item.type;
              app.addToLibrary(item_id);
              addedToLibrary = true;
            },
          },
          {
            id: "removeFromLibrary",
            icon: "./assets/feather/x-circle.svg",
            name: app.getLz("action.removeFromLibrary"),
            hidden: true,
            action: async function () {
              console.log("remove");
              let item_id = item.attributes.playParams.id ?? item.id;
              let data_type = item.attributes.playParams.kind ?? item.type;
              await removeFromLibrary(item_id);
              addedToLibrary = false;
            },
          },
          {
            name: app.getLz("action.playNext"),
            icon: "./assets/arrow-bend-up.svg",
            action: function () {
              app.mk.playNext({ [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id });
              app.mk.queue._reindex();
              app.selectedMediaItems = [];
            },
          },
          {
            name: app.getLz("action.playLater"),
            icon: "./assets/arrow-bend-down.svg",
            action: function () {
              app.mk.playLater({ [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id });
              app.mk.queue._reindex();
              app.selectedMediaItems = [];
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: app.getLz("action.share"),
            action: function () {
              if (!item.attributes.url && item.relationships) {
                if (item.relationships.catalog) {
                  app.mkapi(item.attributes.playParams.kind, false, item.relationships.catalog.data[0].id).then((u) => {
                    app.copyToClipboard(u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url);
                  });
                }
              } else {
                app.copyToClipboard(item.attributes.url);
              }
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: `${app.getLz("action.share")} (song.link)`,
            action: function () {
              if (!item.attributes.url && item.relationships) {
                if (item.relationships.catalog) {
                  app.mkapi(item.attributes.playParams.kind, false, item.relationships.catalog.data[0].id).then((u) => {
                    app.songLinkShare(u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url);
                  });
                }
              } else {
                app.songLinkShare(item.attributes.url);
              }
            },
          },
        ],
      },
    };
    if ((item.attributes.playParams.kind ?? item.type).includes("playlist")) {
      // remove the add to playlist option by id "addToPlaylist" using the .filter() method
      menus.normal.items = menus.normal.items.filter(function (item) {
        return item.id != "addToPlaylist";
      });
    }
    app.showMenuPanel(menus[useMenu], event);
    try {
      await isInLibrary().then((_) => {
        if (addedToLibrary) {
          menus.normal.items.find((x) => x.id == "addToLibrary").hidden = true;
          menus.normal.items.find((x) => x.id == "removeFromLibrary").hidden = false;
        } else {
          menus.normal.items.find((x) => x.id == "addToLibrary").disabled = false;
        }
      });
    } catch (e) {
      console.log(e);
    }
    try {
      let rating = await app.getRating(item);
      if (rating == 0) {
        menus.normal.headerItems.find((x) => x.id == "love").disabled = false;
        menus.normal.headerItems.find((x) => x.id == "dislike").disabled = false;
      } else if (rating == 1) {
        menus.normal.headerItems.find((x) => x.id == "unlove").hidden = false;
        menus.normal.headerItems.find((x) => x.id == "love").hidden = true;
      } else if (rating == -1) {
        menus.normal.headerItems.find((x) => x.id == "undo_dislike").hidden = false;
        menus.normal.headerItems.find((x) => x.id == "dislike").hidden = true;
      }
    } catch (err) {}

    if (contextExt) {
      if (contextExt.normal) {
        menus.normal.items = menus.normal.items.concat(contextExt.normal);
      }
      if (contextExt.multiple) {
        menus.multiple.items = menus.multiple.items.concat(contextExt.multiple);
      }
    }
  }
  async function artistMenu(event) {
    let followAction = "follow";
    let followActions = {
      follow: {
        icon: "./assets/star.svg",
        name: app.getLz("action.favorite"),
        action: () => {
          $root.setArtistFavorite(item.id, true);
        },
      },
      unfollow: {
        icon: "./assets/star.svg",
        name: app.getLz("action.removeFavorite"),
        action: () => {
          $root.setArtistFavorite(item.id, false);
        },
      },
    };
    if (app.cfg.home.followedArtists.includes(item.id)) {
      followAction = "unfollow";
    }
    app.showMenuPanel(
      {
        items: [
          {
            icon: "./assets/feather/play.svg",
            name: app.getLz("action.startRadio"),
            action: () => {
              app.mk.setStationQueue({ artist: "a-" + item.id }).then(() => {
                app.mk.play();
              });
            },
          },
          followActions[followAction],
          {
            icon: "./assets/feather/share.svg",
            name: app.getLz("term.share"),
            action: () => {
              app.copyToClipboard(item.attributes.url);
            },
          },
          {
            icon: "./assets/feather/external-link.svg",
            name: app.getLz("action.openArtworkInBrowser"),
            action: () => {
              window.open(app.getMediaItemArtwork(getArtworkUrl(), 1024, 1024));
            },
          },
        ],
      },
      event,
    );
  }
  function getArtworkUrl(size = -1, includeUrl = false) {
    let artwork = item.attributes.artwork ? item.attributes.artwork.url : "";
    if (size != -1) {
      artwork = artwork
        .replace("{w}", size)
        .replace("{h}", size)
        .replace("{f}", "webp")
        .replace("{c}", size === 900 ? "sr" : "cc");
    }
    switch (kind) {
      case "385":
        artwork = item.attributes?.editorialArtwork?.subscriptionHero?.url;
        break;
    }
    if (!includeUrl) {
      return artwork;
    } else {
      return `url("${artwork}")`;
    }
  }
  function playTrack(item) {
    let parent = parent;
    let childIndex = index;
    let kind = item.attributes.playParams ? (item.attributes.playParams?.kind ?? item.type ?? "") : (item.type ?? "");
    let id = item.attributes.playParams ? (item.attributes.playParams?.id ?? item.id ?? "") : (item.id ?? "");
    let isLibrary = item.attributes.playParams ? (item.attributes.playParams?.isLibrary ?? false) : false;
    let truekind = !kind.endsWith("s") ? kind + "s" : kind;
    console.log(item, parent, childIndex, kind, id, isLibrary, kind == "playlists", id.startsWith("p.") || id.startsWith("pl.u"));
    app.mk.stop().then(() => {
      if (parent != null && childIndex != null) {
        app.queueParentandplayChild(parent, childIndex, item);
      } else if (kind.includes("playlist") && (id.startsWith("p.") || id.startsWith("pl."))) {
        function shuffleArray(array) {
          for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
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
              let playlistId = id;

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
                  //if (app.mk.shuffleMode == 1){shuffleArray(query); }
                  // console.log(query)
                  // app.mk.queue.append(query)
                  if (!res.data.relationships.tracks.next) {
                    return;
                  } else {
                    getPlaylistTracks(res.data.relationships.tracks.next);
                  }

                  function getPlaylistTracks(next) {
                    app.apiCall(app.musicBaseUrl + next, (res) => {
                      // if (res.id != playlistId || next.includes(playlistId)) {
                      //     return
                      // }
                      console.log("nextres", res);
                      let query = res.data.map((item) => new MusicKit.MediaItem(item));
                      if (app.mk.shuffleMode == 1) {
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
              } catch (e) {}
            });
          });
      } else {
        app.playMediaItemById(item.attributes.playParams?.id ?? item.id, item.attributes.playParams?.kind ?? item.type, item.attributes.playParams?.isLibrary ?? false, item.attributes.url);
      }
    });
  }
  return (
    <div id="mediaitem-smarthints">
      <div
        className="cd-queue-item"
        onClick={() => {
          $root.search.showHints = false;
          $root.routeView(item);
          $root.search.cursor = -1;
          $root.search.term == "";
        }}
        contextmenu="$root.hintscontext = true;getContextMenu()"
        className="{'hintactive': ($root.search.cursor == position + $root.search.hints.filter((a) => {return a.content == null}).length)}">
        <div
          className="row"
          contextmenu="$root.hintscontext = true;getContextMenu()">
          <div
            className="col-auto cider-flex-center"
            contextmenu="$root.hintscontext = true;getContextMenu()">
            <div
              className="artwork"
              className="{'circle': item.type == 'artists'}">
              <mediaitem-artwork
                url="item.attributes.artwork ? item.attributes.artwork.url : ''"
                size="32"
                style={{ position: "relative", zIndex: "-1" }}></mediaitem-artwork>
              <button
                className="circular-play-button"
                clickstop="playTrack(item)">
                <div
                  className="_svg-icon"
                  style={{ icon: "url(\.\/assets\/play\.svg)", width: "15px" }}></div>
              </button>
            </div>
          </div>
          <div
            className="col queue-info"
            contextmenu="$root.hintscontext = true;getContextMenu()">
            <div className="queue-title text-overflow-elipsis">{item.attributes.name}</div>
            <div className="queue-subtitle text-overflow-elipsis">{item.attributes.artistName}</div>
          </div>
          <div
            className="queue-explicit-icon cider-flex-center"
            v-if="item.attributes.contentRating == 'explicit'">
            <div className="explicit-icon"></div>
          </div>
          {/* <div className="col queue-duration-info">
            <div className="queue-duration cider-flex-center">
                {convertTimeToString(item.content.attributes.durationInMillis)}
            </div>
        </div>  */}
        </div>
      </div>
    </div>
  );
};
