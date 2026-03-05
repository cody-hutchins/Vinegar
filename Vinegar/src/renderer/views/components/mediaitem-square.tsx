import { useEffect } from "react";
import MediaItemArtwork from "./mediaitem-artwork.jsx";

const MediaItemSquare = ({ item, kind = "", size = "190", forceVideo = false, reasonShown = false, noScale = false, imageformat = "cc", removeamtext = false, contextExt }: { item: object; kind?: string; size?: string; forceVideo?: boolean; reasonShown?: boolean; noScale?: boolean; imageformat?: string; removeamtext?: boolean; contextExt?: { type: Object; required: false } }) => {
  const isVisible = false;
  let addedToLibrary = false;
  const guid = uuidv4();
  const noplay = ["apple-curators", "editorial-elements", "editorial-items"];
  const nomenu = ["stations", "apple-curators", "editorial-elements", "editorial-items"];
  const app = this.$root;
  const badges = this.$root.socialBadges.badgeMap;
  const itemBadges = [];
  const unavailable = false;
  async function mounted() {
    await getBadges();
    if (typeof item.attributes.playParams === "object") {
      if (item.attributes.playParams.kind.includes("radioStation") && item.attributes.playParams.streamingKind === 1) {
        unavailable = true;
      }
    } else {
      if (item.type === "music-movies" || item.type === "tv-episodes") {
        unavailable = true;
      }
    }
  }
  function getBgColor() {
    return `#${item.attributes.artwork !== null && item.attributes.artwork.bgColor !== null ? item.attributes.artwork.bgColor : ``}`;
  }
  function getContextMenu(event) {
    if (item.type === "artists") {
      return artistMenu(event);
    } else {
      return contextMenu(event);
    }
  }
  function getSubtitle() {
    if (kind === "card") {
      if (typeof item.attributes.artistNames !== "undefined") {
        return item.attributes.artistNames;
      } else if (typeof item.attributes.editorialNotes !== "undefined") {
        return item?.attributes?.editorialNotes?.short ?? item.attributes?.editorialNotes?.name ?? "";
      } else if (typeof item.attributes.artistName !== "undefined") {
        return item.attributes.artistName;
      } else {
        return "";
      }
    } else {
      if (typeof item.attributes.artistName !== "undefined") {
        return item.attributes.artistName;
      } else if (typeof item.attributes.artist !== "undefined") {
        return item.attributes.artist.attributes.name;
      } else if (typeof item.attributes.curatorName !== "undefined") {
        return item.attributes.curatorName;
      } else {
        return "";
      }
    }
  }
  function getSubtitleNavigation() {
    if (kind === "card" || item.type === "playlists") {
      try {
        if (typeof item.attributes.artistName !== "undefined") {
          return app.searchAndNavigate(item, "artist");
        } else {
          return app.routeView(item);
        }
      } catch (e) {
        return app.routeView(item);
      }
    } else {
      if (typeof item.attributes.artistName !== "undefined") {
        return app.searchAndNavigate(item, "artist");
      } else {
        return app.routeView(item);
      }
    }
  }
  async function getBadges() {
    const id = ((item.attributes?.playParams ?? false) ? item.attributes?.playParams.id : null) || item.id;
    if (id && badges[id]) {
      let friends = badges[id];
      if (friends) {
        friends.forEach(function (friend) {
          self.app.mk.api.v3.music(`/v1/social/${app.mk.storefrontId}/social-profiles/${friend}`).then((data) => {
            self.itemBadges.push(data.data.data[0]);
          });
        });
      }
    }
  }
  function revisedRandId() {
    return Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .slice(2, 10);
  }
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
  async function removeFromLibrary(id) {
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
    if (res && res.relationships && res.relationships.library && res.relationships.library.data && res.relationships.library.data.length > 0) {
      id = res.relationships.library.data[0].id;
    }

    app.mk.api.v3.music(
      `v1/me/library/${truekind}/${id.toString()}`,
      {},
      {
        fetchOptions: {
          method: "DELETE",
        },
      },
    );
    addedToLibrary = true;
  }
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  }
  function getArtworkUrl(size = -1, includeUrl = false) {
    let artwork = item?.attributes?.artwork ? item?.attributes?.artwork?.url : (item?.attributes?.editorialArtwork?.subscriptionCover?.url ?? "");
    if (size !== -1) {
      artwork = artwork
        .replace("{w}", size)
        .replace("{h}", size)
        .replace("{f}", "webp")
        .replace("{c}", size === 900 || size === 380 || size === 600 ? "sr" : imageformat);
    }
    switch (kind) {
      case "385":
        artwork = (item.attributes.editorialArtwork?.subscriptionHero?.url ?? item.attributes.artwork?.url ?? item.relationships?.contents?.data[0]?.attributes?.editorialArtwork?.subscriptionHero?.url ?? "").replace("{c}", size === 900 || size === 380 || size === 600 ? "sr" : imageformat);
        break;
    }
    if (!includeUrl) {
      return artwork;
    } else {
      return `url("${artwork}")`;
    }
  }
  function getClasses() {
    let type = [];
    let classes = [];
    if (noScale) {
      classes.push("noscale");
    }
    try {
      type = item.type;
    } catch (e) {
      console.log("sd", item);
    }

    if (kind !== "") {
      type = kind;
    }
    switch (type) {
      default:
        break;
      case "editorial-elements":
      case "card":
        classes.push("mediaitem-card");
        break;
      case "385": // editorial
        classes.push("mediaitem-brick");
        break;
      case "small":
        classes.push("mediaitem-small");
        break;
      case "music-videos":
      case "uploadedVideo":
      case "uploaded-videos":
      case "library-music-videos":
        classes.push("mediaitem-video");
        break;
    }
    return classes;
  }
  const visibilityChanged = (isVisible, entry) => {
    isVisible = isVisible;
  };
  async function contextMenu(event) {
    if (nomenu.includes(item.type)) {
      return;
    }
    if (!event) {
      event = this.$refs.main;
    } else {
      console.log(event);
    }
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
              app.love(self.item);
            },
          },
          {
            icon: "./assets/feather/heart.svg",
            id: "unlove",
            active: true,
            name: app.getLz("action.unlove"),
            hidden: true,
            action: function () {
              app.unlove(self.item);
            },
          },
          {
            icon: "./assets/feather/thumbs-down.svg",
            id: "dislike",
            name: app.getLz("action.dislike"),
            hidden: false,
            disabled: true,
            action: function () {
              app.dislike(self.item);
            },
          },
          {
            icon: "./assets/feather/thumbs-down.svg",
            id: "undo_dislike",
            name: app.getLz("action.undoDislike"),
            active: true,
            hidden: true,
            action: function () {
              app.unlove(self.item);
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
              let item_id = self.item.attributes.playParams.id ?? self.item.id;
              let data_type = self.item.attributes.playParams.kind ?? self.item.type;
              app.addToLibrary(item_id);
              self.addedToLibrary = true;
            },
          },
          {
            id: "removeFromLibrary",
            icon: "./assets/feather/x-circle.svg",
            name: app.getLz("action.removeFromLibrary"),
            hidden: true,
            action: async function () {
              console.log("remove");
              let item_id = self.item.attributes.playParams.id ?? self.item.id;
              let data_type = self.item.attributes.playParams.kind ?? self.item.type;
              await self.removeFromLibrary(item_id);
              self.addedToLibrary = false;
            },
          },
          {
            name: app.getLz("action.playNext"),
            icon: "./assets/arrow-bend-up.svg",
            action: function () {
              app.mk.playNext({ [self.item.attributes.playParams.kind ?? self.item.type]: self.item.attributes.playParams.id ?? self.item.id });
              app.mk.queue._reindex();
              app.selectedMediaItems = [];
            },
          },
          {
            name: app.getLz("action.playLater"),
            icon: "./assets/arrow-bend-down.svg",
            action: function () {
              app.mk.playLater({ [self.item.attributes.playParams.kind ?? self.item.type]: self.item.attributes.playParams.id ?? self.item.id });
              app.mk.queue._reindex();
              app.selectedMediaItems = [];
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: app.getLz("action.share"),
            action: function () {
              if (!self.item.attributes.url && self.item.relationships) {
                if (self.item.relationships.catalog) {
                  app.mkapi(self.item.attributes.playParams.kind, false, self.item.relationships.catalog.data[0].id).then((u) => {
                    self.app.copyToClipboard(u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url);
                  });
                }
              } else {
                self.app.copyToClipboard(self.item.attributes.url);
              }
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: `${app.getLz("action.share")} (song.link)`,
            action: function () {
              if (!self.item.attributes.url && self.item.relationships) {
                if (self.item.relationships.catalog) {
                  app.mkapi(self.item.attributes.playParams.kind, false, self.item.relationships.catalog.data[0].id).then((u) => {
                    self.app.songLinkShare(u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url);
                  });
                }
              } else {
                self.app.songLinkShare(self.item.attributes.url);
              }
            },
          },
        ],
      },
    };
    if ((self.item.attributes.playParams.kind ?? self.item.type).includes("playlist")) {
      // remove the add to playlist option by id "addToPlaylist" using the .filter() method
      menus.normal.items = menus.normal.items.filter(function (item) {
        return item.id !== "addToPlaylist";
      });
    }
    app.showMenuPanel(menus[useMenu], event);

    try {
      await isInLibrary().then((_) => {
        if (self.addedToLibrary) {
          menus.normal.items.find((x) => x.id === "addToLibrary").hidden = true;
          menus.normal.items.find((x) => x.id === "removeFromLibrary").hidden = false;
        } else {
          menus.normal.items.find((x) => x.id === "addToLibrary").disabled = false;
        }
      });
    } catch (e) {}
    try {
      let rating = await app.getRating(self.item);
      if (rating === 0) {
        menus.normal.headerItems.find((x) => x.id === "love").disabled = false;
        menus.normal.headerItems.find((x) => x.id === "dislike").disabled = false;
      } else if (rating === 1) {
        menus.normal.headerItems.find((x) => x.id === "unlove").hidden = false;
        menus.normal.headerItems.find((x) => x.id === "love").hidden = true;
      } else if (rating === -1) {
        menus.normal.headerItems.find((x) => x.id === "undo_dislike").hidden = false;
        menus.normal.headerItems.find((x) => x.id === "dislike").hidden = true;
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
  const artistMenu = async (event) => {
    console.debug(item);
    let followAction = "follow";
    let followActions = {
      follow: {
        icon: "./assets/star.svg",
        name: app.getLz("action.favorite"),
        action: () => {
          self.$root.setArtistFavorite(item.id, true);
        },
      },
      unfollow: {
        icon: "./assets/star.svg",
        name: app.getLz("action.removeFavorite"),
        action: () => {
          self.$root.setArtistFavorite(item.id, false);
        },
      },
    };
    if (self.app.cfg.home.followedArtists.includes(item.id)) {
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
              self.app.copyToClipboard(item.attributes.url);
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
  };
  const beforeDestroy = () => {
    // item = null;
    // kind = null;
    // size = null;
  };
  useEffect(() => {
    mounted().then();
    return beforeDestroy;
  }, []);
  return (
    <div id="mediaitem-square">
      <div
        tabindex="0"
        className="cd-mediaitem-square-container"
        clickself={app.routeView(item)}
        controller-click={app.routeView(item)}
        contextmenuself="getContextMenu"
        v-observe-visibility="{callback: visibilityChanged}">
        <div
          v-if={reasonShown}
          className="reasonSP ">
          {item?.meta?.reason?.stringForDisplay ?? ""}
        </div>
        <div
          style={{ "--spcolor": getBgColor() }}
          className="cd-mediaitem-square"
          className={getClasses()}
          contextmenu="getContextMenu">
          <div
            className="artwork-container"
            v-show={isVisible}>
            <div
              className="unavailable-overlay"
              v-if={unavailable}>
              <div className="codicon codicon-circle-slash" />
            </div>
            <div
              className="artwork"
              onClick={() => app.routeView(item)}>
              <MediaItemArtwork
                url={getArtworkUrl()}
                video={item.attributes !== null && item.attributes.editorialVideo !== null ? (item.attributes.editorialVideo.motionDetailSquare ? item.attributes.editorialVideo.motionDetailSquare.video : item.attributes.editorialVideo.motionSquareVideo1x1 ? item.attributes.editorialVideo.motionSquareVideo1x1.video : "") : ""}
                size="size"
                upscaling="true"
                shadow="subtle"
                bgcolor={getBgColor()}
                video-priority={forceVideo}
                type={item.type}
              />
            </div>
            <button
              className="menu-btn"
              v-if={!nomenu.includes(item.type)}
              onClick={() => getContextMenu}
              aria-label={$root.getLz("term.more")}>
              {import("../svg/more.svg")}
            </button>
            <button
              className="play-btn"
              v-if={!noplay.includes(item.type)}
              onClick={() => app.playMediaItem(item)}
              aria-label={$root.getLz("term.play")}>
              {import("../svg/play.svg")}
            </button>
            {itemBadges.length !== 0 &&
              itemBadges.limit(1).map((badge) => (
                <div
                  className="socialBadge"
                  v-bind:key={badge.id}>
                  <MediaItemArtwork
                    url={badge.attributes.artwork ? badge.attributes.artwork.url : ""}
                    size="32"
                  />
                </div>
              ))}
          </div>
          <div
            className="info-rect"
            className="{'info-rect-card': kind === 'card'}"
            v-show={isVisible}
            style={{ "--bgartwork": getArtworkUrl(size, true) }}>
            <div
              className="title"
              title={item.attributes?.name ?? item.relationships?.contents?.data[0]?.attributes?.name ?? item.attributes?.editorialNotes?.name ?? ""}
              v-if={item.attributes.artistNames === null || kind !== "card"}
              onClick={() => app.routeView(item)}>
              <div className="item-navigate text-overflow-elipsis">{item.attributes?.editorialElementKind === "394" && item.relationships?.contents?.data[0]?.attributes?.shortName !== null ? item.relationships?.contents?.data[0]?.attributes?.shortName : item.attributes?.name ? (removeamtext ? item.attributes?.name.replace(/&nbsp;/g, " ").replace(/Apple Music |^Apple |/g, "") : item.attributes?.name.replace(/&nbsp;/g, " ")) : (item.relationships?.contents?.data[0]?.attributes?.name ?? item.attributes?.editorialNotes?.name ?? "")}</div>
              <div
                className="explicit-icon"
                v-if={item.attributes && item.attributes.contentRating === "explicit"}
                style={{ backgroundImage: "url(./assets/explicit.svg)", height: "12px", width: "12px", filter: "contrast(0)", backgroundRepeat: "no-repeat", marginTop: "2.63px", marginLeft: "4px" }}
              />
            </div>
            <div
              title={getSubtitle()}
              className="subtitle item-navigate text-overflow-elipsis"
              onClick={() => getSubtitleNavigation()}
              v-if={getSubtitle() !== ""}>
              {getSubtitle()}
            </div>
            <div
              className="subtitle"
              v-if={getSubtitle() === "" && kind !== "card"}>
              &nbsp;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaItemSquare;
