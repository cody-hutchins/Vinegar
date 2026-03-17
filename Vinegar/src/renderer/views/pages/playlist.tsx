import { useEffect, useMemo } from "react";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import ArtistChip from "../components/artist-chip.jsx";
import ArtworkMaterial from "../components/artwork-material.jsx";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";
import MediaitemScrollerHorizontal from "../components/mediaitem-scroller-horizontal.jsx";
import SVGIcon from "../../main/components/svg-icon.jsx";
import Pagination from "../components/pagination.jsx";
import { Col, Row, Tab, Tabs } from "react-bootstrap";
import { useOnInView } from "react-intersection-observer";

const Playlist = ({ data }: { data: object }) => {
  const app = this.$root;
  let editorialNotesExpanded = false;
  const drag = false;
  let nameEditing = false;
  let descriptionEditing = false;
  let inLibrary = null;
  let confirm = false;
  let itemBadges = [];
  let badgesRequested = false;
  let headerVisible = true;
  let useArtistChip = false;
  let nestedPlaylist = [];
  let nestedDisplayLength = 0;
  let classes = [];
  let editing = false;
  let inPlaylist = false;
  let searchQuery = "";
  let displayListing = [];
  let hasNestedPlaylist = false;
  let showSearch = false;
  const pageSize = this.$root.cfg.libraryPrefs.pageSize;
  let start = 0;
  let end = pageSize;
  const prefs = this.$root.cfg.libraryPrefs.playlists;

  const mounted = () => {
    setTimeout(function () {
      if (data.id !== "ciderlocal") {
        isInLibrary();
      } else {
        if (data.relationships !== null && data.id === "ciderlocal") {
          displayListing = data.relationships.tracks.data;
        }

        inPlaylist = data.type === "library-playlists";
      }
    });
  };
  function beforeMount() {
    if (window.location.hash.includes("playlist")) {
      window.addEventListener("keydown", getCopiedPlayListSongs);
      window.addEventListener("keydown", pasteSongs);
    }
  }
  function beforeDestroy() {
    if (window.location.hash.includes("playlist")) {
      window.removeEventListener("keydown", getCopiedPlayListSongs);
      window.removeEventListener("keydown", pasteSongs);
    }
  }

  useEffect(() => {
    beforeMount();
    mounted();
    return beforeDestroy;
  }, []);

  useEffect(() => {
    isInLibrary();
    getBadges();

    if (data.relationships !== null) {
      if (data.id === "ciderlocal") {
        displayListing = data.relationships.tracks.data;
      } else {
        generateNestedPlaylist(data.relationships.tracks.data);
        if (!hasNestedPlaylist) {
          displayListing = data.relationships.tracks.data;
        }
      }
    }

    inPlaylist = data.type === "library-playlists";
  }, [data]);

  useEffect(() => {
    isInLibrary();
    getBadges();

    if (data.relationships !== null) {
      if (data.id === "ciderlocal") {
        displayListing = data.relationships.tracks.data;
      } else {
        generateNestedPlaylist(data.relationships.tracks.data);
        if (!hasNestedPlaylist) {
          displayListing = data.relationships.tracks.data;
        }
      }
    }

    inPlaylist = data.type === "library-playlists";
  }, [data]);
  const shouldPaginate = useMemo(() => {
    const result = data.relationships.tracks.data.length > pageSize;
    console.log(result);
    return result;
  }, [data]);
  const currentSlice = useMemo(() => {
    return displayListing.slice(start, end);
  }, [displayListing, start, end]);
  const nestedSlices = useMemo(() => {
    if (shouldPaginate) {
      let songsSeen = 0;
      const discs = [];

      for (const disc of nestedPlaylist) {
        songsSeen += disc.tracks.length;

        if (songsSeen >= end) {
          discs.push({
            disc: disc.disc,
            tracks: disc.tracks.slice(0, end + disc.tracks.length - songsSeen),
          });
          break;
        } else if (songsSeen > start) {
          discs.push({
            disc: disc.disc,
            tracks: disc.tracks.slice(start - songsSeen),
          });
        }
      }

      return discs;
    } else {
      return nestedPlaylist;
    }
  }, [shouldPaginate, nestedPlaylist]);

  function onRangeChange(newRange) {
    start = newRange[0];
    end = newRange[1];
  }
  function isAlbum() {
    return (data.attributes?.playParams?.kind ?? data.type ?? "").includes("album");
  }
  function minClass(val) {
    if (app.appMode === "fullscreen") {
      return;
    }
    if (val) {
      classes = ["plmin"];
    } else {
      classes = [];
    }
  }
  function openInfoModal() {
    app.moreinfodata = [];
    app.moreinfodata = {
      title: data?.attributes ? (data?.attributes?.name ?? data?.attributes?.title) || "" : "",
      subtitle: data?.attributes?.artistName ?? "",
      content: data?.attributes?.editorialNotes !== null ? (data?.attributes?.editorialNotes?.standard ?? data?.attributes?.editorialNotes?.short ?? "") : data.attributes?.description ? (data.attributes?.description?.standard ?? data?.attributes?.description?.short ?? "") : "",
    };
    app.modals.moreInfo = true;
  }
  function generateNestedPlaylist(songlists) {
    nestedPlaylist = [];
    nestedDisplayLength = songlists.length;

    if (data?.type?.includes("album")) {
      const discs = songlists
        .map((x) => {
          return x.attributes.discNumber;
        })
        .filter((item, i, ar) => ar.indexOf(item) === i);

      if ((discs && discs.length > 1) || (discs && hasNestedPlaylist)) {
        for (disc of discs) {
          const songs = songlists.filter((x) => x.attributes.discNumber === disc);
          nestedPlaylist.push({ disc: disc, tracks: songs });
        }
      }
      console.log(nestedPlaylist);
    }

    if (!hasNestedPlaylist) hasNestedPlaylist = nestedPlaylist !== [] && nestedPlaylist.length > 1;
  }
  function isHeaderVisible(visible) {
    headerVisible = visible;
  }
  const ref = useOnInView(isHeaderVisible);
  function hasHero() {
    if (data.attributes?.editorialArtwork?.bannerUber) {
      return data.attributes?.editorialArtwork?.bannerUber.url;
    } else if (data.attributes?.editorialArtwork?.subscriptionHero) {
      return data.attributes?.editorialArtwork?.subscriptionHero.url;
    } else if (data.attributes?.editorialArtwork?.storeFlowcase) {
      return data.attributes?.editorialArtwork?.storeFlowcase.url;
    }
    return false;
  }
  function hasHeroObject() {
    if (data.attributes?.editorialArtwork?.bannerUber) {
      return data.attributes?.editorialArtwork?.bannerUber;
    } else if (data.attributes?.editorialArtwork?.subscriptionHero) {
      return data.attributes?.editorialArtwork?.subscriptionHero;
    } else if (data.attributes?.editorialArtwork?.storeFlowcase) {
      return data.attributes?.editorialArtwork?.storeFlowcase;
    }
    return [];
  }
  function getBadges() {
    // TODO assert why this was being bypassed
    if (badgesRequested) {
      return;
    }
    badgesRequested = true;
    itemBadges = [];
    let id = 0;
    try {
      id = data.attributes.playParams.id;
    } catch (e) {
      id = data.id;
    }
    this.$root.getSocialBadges((badges) => {
      const friends = badges[id];
      if (friends) {
        friends.forEach(function (friend) {
          app.mk.api.v3.music(`/v1/social/${app.mk.storefrontId}/social-profiles/${friend}`).then((data) => {
            itemBadges.push(data.data.data[0]);
          });
        });
      }
    });
  }
  function confirmButton() {
    // Return button to normal state after 3 seconds

    confirm = true;
    setTimeout(() => (confirm = false), 3000);
  }
  function getArtistName(data) {
    if (data.attributes.artistName) {
      useArtistChip = true;
      return data.attributes.artistName;
    } else if (data.attributes.artist) {
      useArtistChip = true;
      return data.attributes.artist.attributes.name;
    } else if (data.attributes.curatorName) {
      return data.attributes.curatorName;
    } else {
      return "";
    }
  }
  function getAlbumGenre() {
    if (data.type.includes("albums")) {
      const date = data.attributes.releaseDate;
      if (date === null || date === "") return "";
      return `${data.attributes.genreNames[0]} · ${new Date(date).getFullYear()}`;
    }
  }
  async function isInLibrary() {
    if (data.type && !data.type.includes("library")) {
      // please keep using vars here
      const params = {
        "fields[playlists]": "inLibrary",
        "fields[albums]": "inLibrary",
        relate: "library",
      };
      const res = await app.mkapi(data.attributes.playParams.kind ?? data.type, data.attributes.playParams.isLibrary ?? false, data.attributes.playParams.id ?? data.id, params);
      inLibrary = res.data.data[0] && res.data.data[0].attributes && res.data.data[0].attributes.inLibrary ? res.data.data[0].attributes.inLibrary : false;
      console.log(res);
    } else {
      inLibrary = true;
    }
  }
  function editPlaylist() {
    app.editPlaylist(data.id, data.attributes.name);
    app.editPlaylistDescription(data.id, data.attributes.description.standard);
    app.playlists.listing.forEach((playlist) => {
      if (playlist.id === data.id) {
        playlist.attributes.name = data.attributes.name;
        playlist.attributes.description = data.attributes.description.standard;
      }
    });
    nameEditing = false;
    descriptionEditing = false;
  }
  function editPlaylistDescription() {
    app.editPlaylistDescription(data.id, data.attributes.description.standard);
    app.playlists.listing.forEach((playlist) => {
      if (playlist.id === data.id) {
        playlist.attributes.description = data.attributes.description.standard;
      }
    });
    descriptionEditing = false;
  }
  function addToLibrary(id) {
    app.mk.addToLibrary(id);
    inLibrary = true;
    confirm = false;
  }
  async function removeFromLibrary(id) {
    const params = { "fields[songs]": "inLibrary", "fields[albums]": "inLibrary", relate: "library" };
    let id = data.id ?? data.attributes.playParams.id;
    const res = await app.mkapi(data.attributes.playParams.kind ?? data.type, data.attributes.playParams.isLibrary ?? false, data.attributes.playParams.id ?? data.id, params);
    if (res.data.data[0] && res.data.data[0].relationships && res.data.data[0].relationships.library && res.data.data[0].relationships.library.data && res.data.data[0].relationships.library.data.length > 0) {
      id = res.data.data[0].relationships.library.data[0].id;
    }
    const kind = data.attributes.playParams.kind ?? data.type ?? "";
    const truekind = !kind.endsWith("s") ? kind + "s" : kind;
    app.mk.api.v3.music(
      `v1/me/library/${truekind}/${id.toString()}`,
      {},
      {
        fetchOptions: {
          method: "DELETE",
        },
      },
    );
    inLibrary = false;
    confirm = false;
  }
  function editPlaylistName() {
    if (data.attributes.canEdit && data.type === "library-playlists") {
      nameEditing = true;
      setTimeout(() => {
        document.querySelector(".nameEdit").focus();
      }, 100);
    }
  }
  function editPlaylistDescription() {
    if (data.attributes.canEdit && data.type === "library-playlists") {
      descriptionEditing = true;
      setTimeout(() => {
        document.querySelector(".descriptionEdit").focus();
      }, 100);
    }
  }
  function buildContextMenu(index) {
    if (!data.attributes.canEdit) {
      return;
    }
    return {
      normal: [
        {
          icon: "./assets/feather/x-circle.svg",
          name: app.getLz("action.removeFromPlaylist"),
          action: () => {
            remove();
          },
        },
      ],
      multiple: [
        {
          icon: "./assets/feather/x-circle.svg",
          name: app.getLz("action.removeFromPlaylist"),
          action: () => {
            remove();
          },
        },
      ],
    };
  }
  async function put() {
    if (!data.attributes.canEdit) {
      return;
    }
    console.log("sds", convert());
    await app.mk.api.v3.music(
      `/v1/me/library/playlists/${data.attributes.playParams.id}/tracks`,
      {},
      {
        fetchOptions: {
          method: "PUT",
          body: JSON.stringify({
            data: convert(),
          }),
        },
      },
    );
  }
  async function remove() {
    if (!data.attributes.canEdit) {
      return;
    }
    // for each app.selectedMediaItems splice the items from the playlist
    for (let i = 0; i < app.selectedMediaItems.length; i++) {
      const item = app.selectedMediaItems[i];
      const index = data.relationships.tracks.data.findIndex((x) => x.id === item.id);
      if (index > -1) {
        data.relationships.tracks.data.splice(index, 1);
      }
    }
    await put();
  }
  function convert() {
    const pl_tracks = [];
    for (let i = 0; i < data.relationships.tracks.data.length; i++) {
      pl_tracks.push({
        id: data.relationships.tracks.data[i].id,
        type: data.relationships.tracks.data[i].type,
      });
    }
    return pl_tracks;
  }
  function getRecursive(url) {
    app.apiCall(app.musicBaseUrl + "/v1/me/library/playlists/p.V7VYlrDso6kkYY/tracks?offset=100", (res) => {
      data.relationships.tracks.data = data.relationships.tracks.data.concat(res.data.data);
      if (res.data.next) {
        getRecursive(res.data.next);
      }
    });
  }
  async function menu(event) {
    let artistId = null;

    if (typeof data.relationships.artists !== "undefined") {
      artistId = data.relationships.artists.data[0].id;
      if (data.relationships.artists.data[0].type === "library-artists") {
        artistId = data.relationships.artists.data[0].relationships.catalog.data[0].id;
      }
    }

    const menuItems = {
      headerItems: [
        {
          icon: "./assets/feather/heart.svg",
          id: "love",
          name: app.getLz("action.love"),
          hidden: false,
          disabled: true,
          action: function () {
            app.love(data);
          },
        },
        {
          icon: "./assets/feather/heart.svg",
          id: "unlove",
          active: true,
          name: app.getLz("action.unlove"),
          hidden: true,
          action: function () {
            app.unlove(data);
          },
        },
        {
          icon: "./assets/feather/thumbs-down.svg",
          id: "dislike",
          name: app.getLz("action.dislike"),
          hidden: false,
          disabled: true,
          action: function () {
            app.dislike(data);
          },
        },
        {
          icon: "./assets/feather/thumbs-down.svg",
          id: "undo_dislike",
          name: app.getLz("action.undoDislike"),
          active: true,
          hidden: true,
          action: function () {
            app.unlove(data);
          },
        },
      ],
      items: {
        addToPlaylist: {
          name: app.getLz("action.addToPlaylist"),
          icon: "./assets/feather/list.svg",
          action: () => {
            app.selectedMediaItems = [];
            app.select_selectMediaItem(data.attributes.playParams.id ?? data.id, data.attributes.playParams.kind ?? data.type, 0, 0, data.attributes.playParams.isLibrary ?? false);
            app.promptAddToPlaylist();
          },
        },
        share: {
          name: app.getLz("term.share"),
          icon: "./assets/feather/share.svg",
          action: () => {
            let route = "";
            switch (data.type) {
              case "albums":
                route = `/v1/catalog/${app.mk.storefrontId}/albums/${data.id}`;
                break;
              case "playlists":
                route = `/v1/catalog/${app.mk.storefrontId}/playlists/${data.id}`;
                break;
              case "library-playlists":
                route = `/v1/me/library/playlists/${data.id}/catalog`;
                break;
              case "library-albums":
                route = `/v1/me/library/albums/${data.id}/catalog`;
                break;
            }
            if (route === "") {
              return;
            }
            app.mk.api.v3.music(route).then((res) => {
              console.log(res.data.data[0].attributes.url);
              app.copyToClipboard(res.data.data[0].attributes.url);
            });
          },
        },
      },
    };
    app.showMenuPanel(menuItems, event);

    try {
      const rating = await app.getRating(data);
      if (rating === 0) {
        menuItems.headerItems.find((x) => x.id === "love").disabled = false;
        menuItems.headerItems.find((x) => x.id === "dislike").disabled = false;
      } else if (rating === 1) {
        menuItems.headerItems.find((x) => x.id === "unlove").hidden = false;
        menuItems.headerItems.find((x) => x.id === "love").hidden = true;
      } else if (rating === -1) {
        menuItems.headerItems.find((x) => x.id === "undo_dislike").hidden = false;
        menuItems.headerItems.find((x) => x.id === "dislike").hidden = true;
      }
    } catch (e) {
      console.log(e);
    }
  }
  function getItemParent(data) {
    const kind = data.attributes.playParams.kind;
    const id = data.attributes.playParams.id;
    return `${kind}:${id}`;
  }
  function getFormattedDate() {
    const date = data.attributes.releaseDate ?? data.attributes.lastModifiedDate ?? data.attributes.dateAdded ?? "";
    let prefix = "";
    if (date === null || date === "") return "";
    switch (date) {
      case data.attributes.releaseDate:
        prefix = app.getLz("term.time.released") + " ";
        break;
      case data.attributes.lastModifiedDate:
        prefix = app.getLz("term.time.updated") + " ";
        break;
      case data.attributes.dateAdded:
        prefix = app.getLz("term.time.added") + " ";
        break;
    }
    // let month, year;
    try {
      const releaseDate = new Date(date);
      // month = new Intl.DateTimeFormat(app.cfg.general.language.replace('_','-'), {month: 'long'}).format(releaseDate);
      // date = releaseDate.getDate();
      // year = releaseDate.getFullYear();
      let formatted = "";
      try {
        formatted = new Intl.DateTimeFormat(app.cfg.general.language?.replace("_", "-") ?? "en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(releaseDate);
      } catch (e) {
        // use the format in json instead
        if (app.getLz("date.format") !== null) {
          formatted = new app.getLz("date.format").replace("${d}", releaseDate.getDate()).replace("${m}", releaseDate.getMonth()).replace("${y}", releaseDate.getFullYear());
        } else {
          formatted = new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(releaseDate);
        }
      }
      return prefix + formatted;
    } catch (e) {
      return "";
    }
  }
  function play() {
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }

    const id = data.attributes.playParams?.id ?? data.id;
    //console.log("1")
    const kind = data.attributes.playParams?.kind ?? data.type ?? "";
    //console.log("1")
    if (kind === "podcast-episodes") {
      kind = "episode";
    }
    const truekind = !kind.endsWith("s") ? kind + "s" : kind;

    const query = (data ?? app.showingPlaylist).relationships.tracks.data.map((item) => new MusicKit.MediaItem(item));

    app.mk.stop().then(() => {
      if (id !== "ciderlocal") {
        app.mk.setQueue({ [truekind]: [id], parameters: { l: app.mklang } }).then(function () {
          app.mk.play().then(function () {
            if (query.length > 100) {
              const u = query.slice(100);
              if (app.mk.shuffleMode === 1) {
                shuffleArray(u);
              }
              app.mk.queue.append(u);
            }
          });
        });
      } else {
        const u = app.library.localsongs.map((i) => {
          return i.id;
        });
        app.mk.setQueue({ episodes: u }).then(() => {
          app.mk.play();
        });
      }
    });
  }
  function navClass(data) {
    if (data && typeof data.views !== "undefined") return "";
    return "d-none";
  }
  function getCopiedPlayListSongs(event) {
    if (event.ctrlKey && event.keyCode === 67) {
      const urls = [];
      app.selectedMediaItems.forEach((item) => {
        app.mk.api.v3.music(`/v1/me/library/songs/${item.id}`).then((response) => {
          app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/songs/${response.data.data[0].attributes.playParams.catalogId}`).then((response1) => {
            urls.push(response1.data.data[0].attributes.url);
            navigator.clipboard.writeText(urls);
          });
        });
      });
      notyf.success(app.getLz("term.share.success"));
    }
  }
  async function pasteSongs(event) {
    if (event.ctrlKey && event.keyCode === 86 && data.attributes.canEdit) {
      const clipboard = await navigator.clipboard.readText();
      const songs = [];

      const clipboards = clipboard.split(",");
      clipboards.forEach((item) => {
        songs.push({
          id: item.substring(item.indexOf("i=") + 2, item.length),
          type: "songs",
        });
      });

      app.mk.api.v3
        .music(
          `/v1/me/library/playlists/${data.id}/tracks`,
          {},
          {
            fetchOptions: {
              method: "POST",
              body: JSON.stringify({
                data: songs,
              }),
            },
          },
        )
        .then((response) => {
          songs.forEach((item) => {
            app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/songs/${item.id}`).then((response1) => {
              displayListing.push(response1.data.data[0]);
            });
          });
        });
    }
  }
  function toggleSearch() {
    showSearch = !showSearch;

    if (!showSearch && searchQuery !== "") {
      // Clear search query if the search bar becomes hidden
      searchQuery = "";
      search();
    } else if (showSearch) {
      // Focus search bar
      setTimeout(() => {
        this.$refs["search-bar"].focus();
      });
    }
  }
  function search() {
    let filtered: object[];

    if (searchQuery === "") {
      filtered = data.relationships.tracks.data;
    } else {
      filtered = data.relationships.tracks.data.filter((item) => {
        let itemName = item.attributes.name.toLowerCase();
        let searchTerm = searchQuery.toLowerCase();
        let artistName = "";
        let albumName = "";
        if (item.attributes.artistName !== null) {
          artistName = item.attributes.artistName.toLowerCase();
        }
        if (item.attributes.albumName !== null) {
          albumName = item.attributes.albumName.toLowerCase();
        }

        // remove any non-alphanumeric characters and spaces from search term and item name
        searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "");
        itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "");
        artistName = artistName.replace(/[^\p{L}\p{N} ]/gu, "");
        albumName = albumName.replace(/[^\p{L}\p{N} ]/gu, "");

        let match = itemName.includes(searchTerm) || artistName.includes(searchTerm);
        // only include album name in playlists
        // allows to search for the title track (itemName === albumName)
        if (inPlaylist) match = match || albumName.includes(searchTerm);

        if (match) return item;
      });
    }

    if (!hasNestedPlaylist) {
      // Regular album/playlist
      displayListing = filtered;
    } else {
      // Album with multiple discs
      generateNestedPlaylist(filtered);
    }
  }

  return (
    <div id={"cider-playlist"}>
      {data !== [] && data.attributes !== null && (
        <div
          className={classNames("content-inner playlist-page", classes)}
          is-album={isAlbum()}
          style={{ backgroundColor: data.attributes.artwork !== null && data.attributes.artwork["bgColor"] !== null ? "#" + data.attributes.artwork.bgColor : "" }}>
          {app.playlists.loadingState === 0 && (
            <template>
              <div className={"content-inner centered"}>
                <div className={"spinner"} />
              </div>
            </template>
          )}
          {app.playlists.loadingState === 1 && (
            <template>
              <div
                className={"playlist-display"}
                style={{ backgroundColor: hasHeroObject()?.bgColor ? "#" + hasHeroObject().bgColor : "" }}
                onMouseOver={(e) => {
                  if (e.target === e.currentTarget) {
                    minClass(false);
                  }
                }}>
                <div className={"playlistInfo"}>
                  {hasHero() && (
                    <div className={"playlist-hero"}>
                      <MediaItemArtwork
                        shadow={"none"}
                        url={hasHero()}
                        size={"2160"}
                      />
                      <div
                        className={"hero-tint"}
                        style={{ backgroundColor: hasHeroObject()?.bgColor ? "#" + hasHeroObject().bgColor : "" }}
                      />
                    </div>
                  )}
                  <Row>
                    <Col
                      auto
                      className={"cider-flex-center"}
                      onMouseOver={() => minClass(false)}>
                      <div className={"mediaContainer"}>
                        <MediaItemArtwork
                          shadow={"large"}
                          video-priority={true}
                          url={data.attributes !== null && data.attributes.artwork !== null ? data.attributes.artwork.url : data.relationships !== null && data.relationships.tracks.data.length > 0 && data.relationships.tracks.data[0].attributes !== null ? (data.relationships.tracks.data[0].attributes.artwork !== null ? data.relationships.tracks.data[0].attributes.artwork.url : "") : ""}
                          video={data.attributes !== null && data.attributes.editorialVideo !== null ? (data.attributes.editorialVideo.motionDetailSquare ? data.attributes.editorialVideo.motionDetailSquare.video : data.attributes.editorialVideo.motionSquareVideo1x1 ? data.attributes.editorialVideo.motionSquareVideo1x1.video : "") : ""}
                          size={"500"}
                        />
                      </div>
                    </Col>
                    <Col className={"playlist-info"}>
                      {!editorialNotesExpanded && (
                        <template>
                          <div>
                            <div
                              className={"playlist-name"}
                              onMouseOver={() => minClass(false)}
                              onClick={() => editPlaylistName()}
                              style={{ display: nameEditing ? "none" : "inherit", color: hasHeroObject()?.textColor1 ? "#" + hasHeroObject()?.textColor1 : "", filter: `drop-shadow(${hasHeroObject()?.textColor4 ? "1px 3px 8px #" + hasHeroObject()?.textColor4 : ""})` }}>
                              {data.attributes ? (data.attributes.name ?? data.attributes.title) || "" : ""}
                            </div>
                            <div
                              className={"playlist-name"}
                              onMouseOver={() => minClass(false)}
                              style={{ display: nameEditing ? "inherit" : "none" }}>
                              <input
                                type={"text"}
                                spellCheck={false}
                                className={"nameEdit"}
                                v-model={data.attributes.name}
                                onBlur={editPlaylist}
                                onChange={editPlaylist}
                                onKeyDown={(e) => {
                                  if (e.key === "enter") editPlaylist();
                                }}
                              />
                            </div>
                            <div
                              className={"playlist-time genre"}
                              style={{ margin: "0px", color: hasHeroObject()?.textColor2 ? "#" + hasHeroObject().textColor2 : "" }}>
                              {getAlbumGenre()}
                            </div>
                            {getArtistName(data) !== "" && !useArtistChip && (
                              <div
                                className={"playlist-artist item-navigate"}
                                onClick={() => (data.attributes && data.attributes.artistName ? app.searchAndNavigate(data, "artist") : "")}>
                                {getArtistName(data)}
                              </div>
                            )}
                            {useArtistChip && (
                              <template>
                                {data.relationships.artists?.data.map((artist) => (
                                  <ArtistChip
                                    key={artist.id}
                                    style={{ color: hasHeroObject()?.textColor3 ? "#" + hasHeroObject().textColor3 : "" }}
                                    item={artist}
                                  />
                                ))}
                              </template>
                            )}
                            {((data.attributes.description && (data.attributes.description.standard || data.attributes.description.short)) || (data.attributes.editorialNotes && (data.attributes.editorialNotes.standard || data.attributes.editorialNotes.short))) && (
                              <div
                                className={"playlist-desc"}
                                style={{ color: hasHeroObject()?.textColor3 ? "#" + hasHeroObject().textColor3 : "" }}>
                                {(data.attributes.description?.short ?? data.attributes.editorialNotes?.short) !== null ? (
                                  <div
                                    className={"content"}
                                    dangerouslySetInnerHTML={{ __html: data.attributes.description?.short ?? data.attributes.editorialNotes?.short }}
                                    onClick={() => openInfoModal()}
                                  />
                                ) : (
                                  <>
                                    {/*{((data.attributes.description?.short ?? data.attributes.editorialNotes?.short ) !== null) ? <button  className="more-btn"}
                                                onClick={() =>editorialNotesExpanded = !editorialNotesExpanded}>
                                            {app.getLz('term.showMore')}
                                        </button> : */}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </template>
                      )}
                      {editorialNotesExpanded && (
                        <template>
                          <div className={"playlist-desc-expanded"}>
                            <div
                              className={"content"}
                              dangerouslySetInnerHTML={{ __html: data.attributes.editorialNotes ? (data.attributes.editorialNotes.standard ?? data.attributes.editorialNotes.short ?? "") : data.attributes.description ? (data.attributes.description.standard ?? data.attributes.description.short ?? "") : "" }}
                            />
                            <button
                              className={"more-btn"}
                              onClick={() => (editorialNotesExpanded = !editorialNotesExpanded)}>
                              {app.getLz("term.showLess")}
                            </button>
                          </div>
                        </template>
                      )}
                      <div
                        className={"playlist-controls"}
                        ref={ref}
                        style={{ zIndex: 20 }}>
                        <button
                          className={"md-btn md-btn-primary md-btn-icon"}
                          style={{ minWidth: "100px", background: hasHeroObject()?.textColor4 ? "#" + hasHeroObject().textColor4 : "", borderTop: hasHeroObject()?.textColor3 ? "#" + hasHeroObject().textColor3 : "", border: hasHeroObject()?.textColor2 ? "#" + hasHeroObject().textColor2 : "" }}
                          onClick={() => {
                            app.mk.shuffleMode = 0;
                            play();
                          }}>
                          <img className={"md-ico-play"} />
                          {app.getLz("term.play")}
                        </button>
                        <button
                          className={"md-btn md-btn-primary md-btn-icon"}
                          style={{ minWidth: "100px", background: hasHeroObject()?.textColor4 ? "#" + hasHeroObject().textColor4 : "", borderTop: hasHeroObject()?.textColor3 ? "#" + hasHeroObject().textColor3 : "", border: hasHeroObject()?.textColor2 ? "#" + hasHeroObject().textColor2 : "" }}
                          onClick={() => {
                            app.mk.shuffleMode = 1;
                            play();
                          }}>
                          <img className={"md-ico-shuffle"} />
                          {app.getLz("term.shuffle")}
                        </button>
                        {inLibrary !== null && !confirm && (
                          <button
                            className={"md-btn md-btn-icon"}
                            style={{ minWidth: "180px" }}
                            onClick={() => confirmButton()}>
                            <img className={!inLibrary ? "md-ico-add" : "md-ico-remove"} />
                            {!inLibrary ? app.getLz("action.addToLibrary") : app.getLz("action.removeFromLibrary")}
                          </button>
                        )}
                        {!confirm && (
                          <button
                            className={"md-btn md-btn-icon"}
                            style={{ minWidth: "180px" }}
                            onClick={() => (!inLibrary ? addToLibrary(data.attributes.playParams.id.toString()) : removeFromLibrary(data.attributes.playParams.id.toString()))}>
                            <img className={!inLibrary ? "md-ico-add" : "md-ico-remove"} />
                            {app.getLz("term.confirm")}
                          </button>
                        )}
                        {shouldPaginate && (
                          <select
                            className={"md-select"}
                            v-model={prefs.scroll}>
                            <optgroup label={app.getLz("term.scroll")}>
                              <option value={"infinite"}>{app.getLz("term.scroll.infinite")}</option>
                              <option value={"paged"}>{app.getLz("term.scroll.paged").replace("${songsPerPage}", pageSize)}</option>
                            </optgroup>
                          </select>
                        )}
                        <div style={{ display: "flex", float: "right" }}>
                          <button
                            style={{ background: hasHeroObject()?.textColor4 ? "#" + hasHeroObject().textColor4 : "" }}
                            className={"['search-btn', showSearch ? 'active' : '']"}
                            onClick={() => toggleSearch()}
                            aria-label={"showSearch ? app.getLz('term.hideSearch') : app.getLz('term.showSearch')"}>
                            <SVGIcon
                              style={{ width: "15px", backgroundColor: hasHeroObject()?.bgColor ? "#" + hasHeroObject().bgColor : "" }}
                              url={showSearch ? "./assets/search-alt.svg" : "./assets/search.svg"}
                            />
                          </button>
                          <button
                            style={{ background: hasHeroObject()?.textColor4 ? "#" + hasHeroObject().textColor4 : "" }}
                            className={"more-btn-round"}
                            onClick={() => menu}
                            aria-label={app.getLz("term.more")}>
                            <div
                              style={{ backgroundColor: hasHeroObject()?.bgColor ? "#" + hasHeroObject().bgColor : "" }}
                              className={"svg-icon"}
                            />
                          </button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
                {data.attributes.artwork !== null && !hasHero() && (
                  <div className={"artworkContainer"}>
                    <ArtworkMaterial
                      url={data.attributes.artwork.url}
                      size={"500"}
                      images={"1"}
                    />
                  </div>
                )}
                {data.attributes.canEdit && data.type === "library-playlists" && (
                  <button
                    className={"md-btn md-btn-small editTracksBtn"}
                    onClick={() => {
                      editing = !editing;
                    }}>
                    {!editing ? (
                      <span>
                        <div className={"codicon codicon-edit"} /> {$root.getLz("action.editTracklist")}
                      </span>
                    ) : (
                      <span>
                        <div className={"codicon codicon-check"} /> {$root.getLz("action.done")}
                      </span>
                    )}
                  </button>
                )}
              </div>
              <div
                className={"floating-header"}
                style={{ opacity: headerVisible ? 0 : 1, pointerEvents: headerVisible ? "none" : "" }}>
                <Row>
                  <Col>
                    <h3>{data.attributes ? (data.attributes.name ?? data.attributes.title) || "" : ""}</h3>
                  </Col>
                  <Col
                    auto
                    className={"cider-flex-center"}>
                    <div>
                      <button
                        className={"md-btn md-btn-primary  md-btn-icon"}
                        style={{ minWidth: "100px" }}
                        onClick={() => {
                          app.mk.shuffleMode = 0;
                          play();
                        }}>
                        <img className={"md-ico-play"} />
                        {app.getLz("term.play")}
                      </button>
                      <button
                        className={"md-btn md-btn-primary  md-btn-icon"}
                        style={{ minWidth: "100px" }}
                        onClick={() => {
                          app.mk.shuffleMode = 1;
                          play();
                        }}>
                        <img className={"md-ico-shuffle"} />
                        {app.getLz("term.shuffle")}
                      </button>
                      {inLibrary !== null && !confirm && (
                        <button
                          className={"md-btn md-btn-icon"}
                          style={{ minWidth: "180px" }}
                          onClick={() => confirmButton()}>
                          <img className={!inLibrary ? "md-ico-add" : "md-ico-remove"} />
                          {!inLibrary ? app.getLz("action.addToLibrary") : app.getLz("action.removeFromLibrary")}
                        </button>
                      )}
                      {!confirm && (
                        <button
                          className={"md-btn md-btn-icon"}
                          style={{ minWidth: "180px" }}
                          onClick={() => (!inLibrary ? addToLibrary(data.attributes.playParams.id.toString()) : removeFromLibrary(data.attributes.playParams.id.toString()))}>
                          <img className={!inLibrary ? "md-ico-add" : "md-ico-remove"} />
                          {app.getLz("term.confirm")}
                        </button>
                      )}
                      {shouldPaginate && (
                        <select
                          className={"md-select"}
                          v-model={prefs.scroll}>
                          <optgroup label={app.getLz("term.scroll")}>
                            <option value={"infinite"}>{app.getLz("term.scroll.infinite")}</option>
                            <option value={"paged"}>{app.getLz("term.scroll.paged").replace("${songsPerPage}", pageSize)}</option>
                          </optgroup>
                        </select>
                      )}
                    </div>
                  </Col>
                  <Col
                    auto
                    className={"cider-flex-center"}>
                    <button
                      className={"more-btn-round"}
                      style={{ float: "right" }}
                      onClick={() => menu}
                      aria-label={app.getLz("term.more")}>
                      <div className={"svg-icon"} />
                    </button>
                  </Col>
                </Row>
              </div>
              <div className={"playlist-body scrollbody"}>
                <Tabs
                  pills
                  className={"track-pills pilldim fancy-pills"}
                  align={"center"}
                  content-className={"mt-3"}
                  nav-wrapper-className={navClass(data)}>
                  <Tab
                    title={$root.getLz("term.tracks")}
                    id={"songList"}
                    active>
                    <div
                      onWheel={() => minClass(true)}
                      onScroll={() => minClass(true)}>
                      <div className={""}>
                        <div
                          style={{ width: "100%" }}
                          onClick={() => minClass(true)}>
                          {showSearch && (
                            <div className={"search-input-container"}>
                              <div className={"search-input--icon"} />
                              <input
                                type={"search"}
                                spellCheck={false}
                                placeholder={$root.getLz("term.search") + "..."}
                                onInput={() => search()}
                                v-model={searchQuery}
                                className={"search-input"}
                                ref={"search-bar"}
                              />
                            </div>
                          )}
                          {shouldPaginate && (
                            <Pagination
                              style={{ marginTop: "10px" }}
                              length={hasNestedPlaylist ? nestedDisplayLength : displayListing.length}
                              pageSize={pageSize}
                              scroll={prefs.scroll}
                              scrollSelector={"#songList"}
                              onRangeChange={"onRangeChange"}
                            />
                          )}
                          <draggable
                            options={"{disabled: !editing}"}
                            v-model={data.relationships.tracks.data}
                            start={"drag=true"}
                            end={"drag=false;put()"}>
                            {!hasNestedPlaylist ? (
                              <template>
                                {currentSlice.map((item, index) => (
                                  <MediaItemListItem
                                    item={item}
                                    parent={getItemParent(data)}
                                    index={index + start}
                                    showIndex={true}
                                    showIndexPlaylist={(data.attributes.playParams?.kind ?? data.type ?? "").includes("playlist")}
                                    context-ext={buildContextMenu()}
                                    key={item.id}
                                  />
                                ))}
                              </template>
                            ) : (
                              <template>
                                {nestedSlices.map((disc) => (
                                  <div key={disc.id}>
                                    <div className={"playlist-time"}>{($root.getLz("term.discNumber") ?? "").replace("${discNumber}", disc.disc)}</div>
                                    {disc.tracks.map((item, index) => (
                                      <MediaItemListItem
                                        item={item}
                                        parent={getItemParent(data)}
                                        index={index}
                                        showIndex={true}
                                        showIndexPlaylist={(data.attributes.playParams?.kind ?? data.type ?? "").includes("playlist")}
                                        context-ext={buildContextMenu()}
                                        key={item.id}
                                      />
                                    ))}
                                  </div>
                                ))}
                              </template>
                            )}
                          </draggable>
                        </div>
                      </div>
                      {itemBadges.length !== 0 && (
                        <div className={"friends-info"}>
                          <div className={"well"}>
                            <div className={"badge-container"}>
                              {itemBadges.map((badge) => (
                                <div
                                  key={badge.id}
                                  className={"socialBadge"}
                                  title={`${badge.attributes.name} - ${badge.attributes.handle}`}>
                                  <MediaItemArtwork
                                    url={badge.attributes.artwork.url}
                                    size={"60"}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={"playlist-time"}>{getFormattedDate()}</div>
                      <div className={"playlist-time total"}>{app.getTotalTime()}</div>
                      <div
                        className={"playlist-time item-navigate"}
                        onClick={() => app.searchAndNavigate(data, "recordLabel")}
                        style={{ width: "50%" }}>
                        {data.attributes.copyright}
                      </div>
                      {(data.attributes?.playParams?.kind ?? data.type ?? "").includes("album") && data.relationships.catalog !== null && data.relationships.catalog !== null && data.relationships.catalog.data.length > 0 && (
                        <template>
                          <div
                            className={"playlist-time showExtended item-navigate"}
                            style={{ color: "#fa586a", fontWeight: "bold" }}
                            onClick={() => app.routeView(data.relationships.catalog.data[0])}>
                            {$root.getLz("action.showAlbum")}
                          </div>
                        </template>
                      )}
                    </div>
                  </Tab>
                  {typeof data.views !== "undefined" && (
                    <template>
                      {data.meta.views.order.map(
                        (view) =>
                          data.views[view].data.length !== 0 && (
                            <Tab
                              key={view.id}
                              lazy
                              title={data.views[view].attributes.title}>
                              <div>
                                <Row>
                                  <Col>
                                    <h3>{data.views[view].attributes.title}</h3>
                                  </Col>
                                </Row>
                                <Row className={"row"}>
                                  <Col>
                                    <MediaitemScrollerHorizontal items={data.views[view].data} />
                                  </Col>
                                </Row>
                              </div>
                            </Tab>
                          ),
                      )}
                    </template>
                  )}
                </Tabs>
              </div>
            </template>
          )}
        </div>
      )}
    </div>
  );
};

export default Playlist;
