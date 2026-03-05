import { useEffect } from "react";
import MediaItemScrollerHorizontal from "../components/mediaitem-scroller-horizontal.jsx";
import ArtistChip from "../components/artist-chip.jsx";
import ArtworkMaterial from "../components/artwork-material.jsx";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";

const Component = ({ data }: { data: object }) => {
  const app = this.$root;
  let editorialNotesExpanded = false;
  let drag = false;
  let nameEditing = false;
  let inLibrary = null;
  let confirm = false;
  let itemBadges = [];
  let badgesRequested = false;
  let headerVisible = true;
  let useArtistChip = false;
  let nestedPlaylist = [];

  useEffect(() => {
    setTimeout(isInLibrary);
  }, []);

  const watch = {
    data: function () {
      nestedPlaylist = [];
      isInLibrary();
      getBadges();
      generateNestedPlaylist();
    },
  };

  function openInfoModal() {
    app.moreinfodata = [];
    app.moreinfodata = {
      title: data?.attributes ? (data?.attributes?.name ?? data?.attributes?.title ?? "" ?? "") : "",
      subtitle: data?.attributes?.artistName ?? "",
      content: data?.attributes?.editorialNotes !== null ? (data?.attributes?.editorialNotes?.standard ?? data?.attributes?.editorialNotes?.short ?? "") : data.attributes?.description ? (data.attributes?.description?.standard ?? data?.attributes?.description?.short ?? "") : "",
    };
    app.modals.moreInfo = true;
  }
  function generateNestedPlaylist() {
    nestedPlaylist = [];
    if (data?.type?.includes("album")) {
      console.log(data.relationships.tracks.data);
      let songlists = data.relationships.tracks.data;
      let discs = songlists
        .map((x) => {
          return x.attributes.discNumber;
        })
        .filter((item, i, ar) => ar.indexOf(item) === i);
      if (discs && discs.length > 1) {
        for (disc of discs) {
          let songs = songlists.filter((x) => x.attributes.discNumber === disc);
          nestedPlaylist.push({ disc: disc, tracks: songs });
        }
      }
      console.log(nestedPlaylist);
    }
  }
  function isHeaderVisible(visible) {
    headerVisible = visible;
  }
  function getBadges() {
    // TODO find why it was just returning
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
      let friends = badges[id];
      if (friends) {
        friends.forEach(function (friend) {
          self.app.mk.api.v3.music(`/v1/social/${app.mk.storefrontId}/social-profiles/${friend}`).then((data) => {
            self.itemBadges.push(data.data.data[0]);
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
      let date = data.attributes.releaseDate;
      if (date === null || date === "") return "";
      return `${data.relationships.tracks.data[0].attributes.genreNames[0]} · ${new Date(date).getFullYear()}`;
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
    app.playlists.listing.forEach((playlist) => {
      if (playlist.id === data.id) {
        playlist.attributes.name = data.attributes.name;
      }
    });
    nameEditing = false;
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
    let kind = data.attributes.playParams.kind ?? data.type ?? "";
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
            self.remove();
          },
        },
      ],
      multiple: [
        {
          icon: "./assets/feather/x-circle.svg",
          name: app.getLz("action.removeFromPlaylist"),
          action: () => {
            self.remove();
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
      let item = app.selectedMediaItems[i];
      let index = data.relationships.tracks.data.findIndex((x) => x.id === item.id);
      if (index > -1) {
        data.relationships.tracks.data.splice(index, 1);
      }
    }
    await put();
  }
  function convert() {
    let pl_tracks = [];
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
  function menu(event) {
    let artistId = null;

    if (typeof data.relationships.artists !== "undefined") {
      artistId = data.relationships.artists.data[0].id;
      if (data.relationships.artists.data[0].type === "library-artists") {
        artistId = data.relationships.artists.data[0].relationships.catalog.data[0].id;
      }
    }

    let menuItems = {
      items: {
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
        follow: {
          name: app.getLz("action.follow"),
          icon: "./assets/feather/plus-circle.svg",
          hidden: false,
          action: () => {
            app.setArtistFavorite(artistId, true);
          },
        },
        unfollow: {
          name: app.getLz("action.unfollow"),
          icon: "./assets/feather/x-circle.svg",
          hidden: true,
          action: () => {
            app.setArtistFavorite(artistId, false);
          },
        },
      },
    };

    if (artistId !== null) {
      if (app.followingArtist(artistId)) {
        menuItems.items.follow.hidden = true;
        menuItems.items.unfollow.hidden = false;
      } else {
        menuItems.items.follow.hidden = false;
        menuItems.items.unfollow.hidden = true;
      }
    } else {
      menuItems.items.follow.hidden = true;
      menuItems.items.unfollow.hidden = true;
    }

    app.showMenuPanel(menuItems, event);
  }
  function getItemParent(data) {
    kind = data.attributes.playParams.kind;
    id = data.attributes.playParams.id;
    return `${kind}:${id}`;
  }
  function getFormattedDate() {
    let date = data.attributes.releaseDate ?? data.attributes.lastModifiedDate ?? data.attributes.dateAdded ?? "";
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
    let month, year;
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
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }

    const id = data.attributes.playParams.id ?? data.id;
    //console.log("1")
    const kind = data.attributes.playParams.kind ?? data.type ?? "";
    //console.log("1")
    const truekind = !kind.endsWith("s") ? kind + "s" : kind;

    let query = (data ?? app.showingPlaylist).relationships.tracks.data.map((item) => new MusicKit.MediaItem(item));
    app.mk.stop().then(function () {
      app.mk.setQueue({ [truekind]: [id], parameters: { l: app.mklang } }).then(function () {
        app.mk.play().then(function () {
          if (query.length > 100) {
            let u = query.slice(100);
            if (app.mk.shuffleMode === 1) {
              shuffleArray(u);
            }
            app.mk.queue.append(u);
          }
        });
      });
    });
  }
  return (
    <div id="playlist-inline">
      <div
        className="content-inner playlist-page inline-playlist"
        clickself={$root.resetState()}>
        <div
          className="playlist-inner"
          v-if={data !== [] && data.attributes !== null}>
          <div
            className="close-btn"
            title="Close"
            onClick={() => $root.resetState()}>
            <svg
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 21 21"
              aria-role="presentation"
              focusable="false">
              <path
                d="M10.5 21C4.724 21 0 16.275 0 10.5S4.724 0 10.5 0 21 4.725 21 10.5 16.276 21 10.5 21zm-3.543-5.967a.96.96 0 00.693-.295l2.837-2.842 2.85 2.842c.167.167.41.295.693.295.552 0 1.001-.461 1.001-1.012 0-.281-.115-.512-.295-.704L11.899 10.5l2.85-2.855a.875.875 0 00.295-.68c0-.55-.45-.998-1.001-.998a.871.871 0 00-.668.295l-2.888 2.855-2.862-2.843a.891.891 0 00-.668-.281.99.99 0 00-1.001.986c0 .269.116.512.295.678L9.088 10.5l-2.837 2.843a.926.926 0 00-.295.678c0 .551.45 1.012 1.001 1.012z"
                fill-rule="nonzero"
              />
            </svg>
          </div>
          <template v-if={app.playlists.loadingState === 0}>
            <div className="content-inner centered">
              <div className="spinner" />
            </div>
          </template>
          <template v-if={app.playlists.loadingState === 1}>
            <div
              className="playlist-display"
              style={{ backgroundColor: data.attributes.artwork !== null && data.attributes.artwork["bgColor"] !== null ? "#" + data.attributes.artwork.bgColor : "", textColor: data.attributes.artwork !== null && data.attributes.artwork["textColor1"] !== null ? "#" + data.attributes.artwork.textColor1 : "" }}>
              <div className="playlistInfo">
                <div className="row">
                  <div className="col-auto cider-flex-center">
                    <div style={{ width: "260px", height: "260px" }}>
                      <MediaItemArtwork
                        shadow="large"
                        video-priority="true"
                        url={data.attributes !== null && data.attributes.artwork !== null ? data.attributes.artwork.url : data.relationships !== null && data.relationships.tracks.data.length > 0 && data.relationships.tracks.data[0].attributes !== null ? (data.relationships.tracks.data[0].attributes.artwork !== null ? data.relationships.tracks.data[0].attributes.artwork.url : "") : ""}
                        video={data.attributes !== null && data.attributes.editorialVideo !== null ? (data.attributes.editorialVideo.motionDetailSquare ? data.attributes.editorialVideo.motionDetailSquare.video : data.attributes.editorialVideo.motionSquareVideo1x1 ? data.attributes.editorialVideo.motionSquareVideo1x1.video : "") : ""}
                        size="260"
                      />
                    </div>
                  </div>
                  <div className="col playlist-info">
                    <template v-if={!editorialNotesExpanded}>
                      <div>
                        <div
                          className="playlist-name"
                          onClick={() => editPlaylistName()}
                          v-show={!nameEditing}>
                          {data.attributes ? (data.attributes.name ?? data.attributes.title ?? "" ?? "") : ""}
                        </div>
                        <div
                          className="playlist-name"
                          v-show={nameEditing}>
                          <input
                            type="text"
                            spellCheck="false"
                            className="nameEdit"
                            v-model={data.attributes.name}
                            onBlur={editPlaylist}
                            onChange={editPlaylist}
                            onKeyDown={(e) => {
                              if (e.key === "enter") editPlaylist();
                            }}
                          />
                        </div>
                        <div
                          className="playlist-time genre"
                          style={{ margin: "0px" }}>
                          {getAlbumGenre()}
                        </div>
                        <div
                          className="playlist-artist item-navigate"
                          v-if={getArtistName(data) !== "" && !useArtistChip}
                          onClick={() => (data.attributes && data.attributes.artistName ? app.searchAndNavigate(data, "artist") : "")}>
                          {getArtistName(data)}
                        </div>
                        <template v-if={useArtistChip}>
                          {data.relationships.artists?.data.map((artist) => (
                            <ArtistChip item={artist} />
                          ))}
                        </template>
                        <div
                          className="playlist-desc"
                          v-if={(data.attributes.description && (data.attributes.description.standard || data.attributes.description.short)) || (data.attributes.editorialNotes && (data.attributes.editorialNotes.standard || data.attributes.editorialNotes.short))}>
                          <div
                            v-if={(data.attributes.description?.short ?? data.attributes.editorialNotes?.short) !== null}
                            className="content"
                            v-html={data.attributes.description?.short ?? data.attributes.editorialNotes?.short}
                            onClick={() => openInfoModal()}
                          />
                          <div
                            v-else-if={(data.attributes.description?.standard ?? data.attributes.editorialNotes?.standard) !== null}
                            className={content}
                            v-html={data.attributes.description?.standard ?? data.attributes.editorialNotes?.standard}
                          />
                          {/* <button v-if={(data.attributes.description?.short ?? data.attributes.editorialNotes?.short ) !== null} className="more-btn"}
                                                    onClick={() =>openInfoModal()}>
                                                {app.getLz('term.showMore')}
                                            </button>  */}
                        </div>
                      </div>
                    </template>
                    <template v-if={editorialNotesExpanded}>
                      <div className="playlist-desc-expanded">
                        <div
                          className="content"
                          v-html={data.attributes.editorialNotes ? (data.attributes.editorialNotes.standard ?? data.attributes.editorialNotes.short ?? "") : data.attributes.description ? (data.attributes.description.standard ?? data.attributes.description.short ?? "") : ""}
                        />
                        <button
                          className="more-btn"
                          onClick={() => {
                            editorialNotesExpanded = !editorialNotesExpanded;
                          }}>
                          {app.getLz("term.showLess")}
                        </button>
                      </div>
                    </template>
                    <div
                      className="playlist-controls"
                      v-observe-visibility="{callback: isHeaderVisible}">
                      <button
                        className="md-btn md-btn-primary md-btn-icon"
                        style={{ minWidth: "100px" }}
                        onClick={() => {
                          app.mk.shuffleMode = 0;
                          play();
                        }}>
                        <img className="md-ico-play" />
                        {app.getLz("term.play")}
                      </button>
                      <button
                        className="md-btn md-btn-primary md-btn-icon"
                        style={{ minWidth: "100px" }}
                        onClick={() => {
                          app.mk.shuffleMode = 1;
                          play();
                        }}>
                        <img className="md-ico-shuffle" />
                        {app.getLz("term.shuffle")}
                      </button>
                      <button
                        className="md-btn md-btn-icon"
                        style={{ minWidth: "180px" }}
                        v-if={inLibrary !== null && confirm !== true}
                        onClick={() => confirmButton()}>
                        <img className={!inLibrary ? "md-ico-add" : "md-ico-remove"} />
                        {!inLibrary ? app.getLz("action.addToLibrary") : app.getLz("action.removeFromLibrary")}
                      </button>
                      <button
                        className="md-btn md-btn-icon"
                        style={{ minWidth: "180px" }}
                        v-if={confirm === true}
                        onClick={() => (!inLibrary ? addToLibrary(data.attributes.playParams.id.toString()) : removeFromLibrary(data.attributes.playParams.id.toString()))}>
                        <img className={!inLibrary ? "md-ico-add" : "md-ico-remove"} />
                        {app.getLz("term.confirm")}
                      </button>
                      <button
                        className="more-btn-round"
                        style={{ float: "right" }}
                        onClick={() => menu}
                        aria-label={app.getLz("term.more")}>
                        <div className="svg-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="artworkContainer"
                v-if={data.attributes.artwork !== null}>
                <ArtworkMaterial
                  url={data.attributes.artwork.url}
                  size="260"
                  images="1"
                />
              </div>
            </div>
            <div
              className="floating-header"
              style={{ opacity: headerVisible ? 0 : 1, pointerEvents: headerVisible ? "none" : "" }}>
              <div className="row">
                <div className="col">
                  <h3>{data.attributes ? (data.attributes.name ?? data.attributes.title ?? "" ?? "") : ""}</h3>
                </div>
                <div className="col-auto cider-flex-center">
                  <div>
                    <button
                      className="md-btn md-btn-primary  md-btn-icon"
                      style={{ minWidth: "100px" }}
                      onClick={() => {
                        app.mk.shuffleMode = 0;
                        play();
                      }}>
                      <img className="md-ico-play" />
                      {app.getLz("term.play")}
                    </button>
                    <button
                      className="md-btn md-btn-primary  md-btn-icon"
                      style={{ minWidth: "100px" }}
                      onClick={() => {
                        app.mk.shuffleMode = 1;
                        play();
                      }}>
                      <img className="md-ico-shuffle" />
                      {app.getLz("term.shuffle")}
                    </button>
                    <button
                      className="md-btn md-btn-icon"
                      style={{ minWidth: "180px" }}
                      v-if={inLibrary !== null && confirm !== true}
                      onClick={() => confirmButton()}>
                      <img className={!inLibrary ? "md-ico-add" : "md-ico-remove"} />
                      {!inLibrary ? app.getLz("action.addToLibrary") : app.getLz("action.removeFromLibrary")}
                    </button>
                    <button
                      className="md-btn md-btn-icon"
                      style={{ minWidth: "180px" }}
                      v-if={confirm === true}
                      onClick={() => (!inLibrary ? addToLibrary(data.attributes.playParams.id.toString()) : removeFromLibrary(data.attributes.playParams.id.toString()))}>
                      <img className={!inLibrary ? "md-ico-add" : "md-ico-remove"} />
                      {app.getLz("term.confirm")}
                    </button>
                  </div>
                </div>
                <div className="col-auto cider-flex-center">
                  <button
                    className="more-btn-round"
                    style={{ float: "right" }}
                    onClick={() => menu}
                    aria-label={term.more}>
                    <div className="svg-icon" />
                  </button>
                </div>
              </div>
            </div>
            <div className="playlist-body scrollbody">
              <b-tabs
                pills
                align="center"
                content-className="mt-3">
                <b-tab title="Tracks">
                  <div className="">
                    <div style={{ width: "100%" }}>
                      <draggable
                        sort={data.attributes.canEdit && data.type === "library-playlists"}
                        v-model={data.relationships.tracks.data}
                        start="drag=true"
                        end="drag=false;put()">
                        <template v-if={nestedPlaylist === [] || nestedPlaylist.length <= 1}>
                          {data.relationships.tracks.data.map((item, index) => (
                            <MediaItemListItem
                              item={item}
                              parent={getItemParent(data)}
                              index={index}
                              showIndex={true}
                              showIndexPlaylist={(data.attributes.playParams.kind ?? data.type ?? "").includes("playlist")}
                              context-ext={buildContextMenu()}
                              v-bind:key={item.id}
                            />
                          ))}
                        </template>
                        <template v-else>
                          {nestedPlaylist.map((disc) =>
                            disc.tracks.map((item, index) => (
                              <div>
                                <div className="playlist-time">{($root.getLz("term.discNumber") ?? "").replace("${discNumber}", disc.disc)}</div>
                                <MediaItemListItem
                                  item={item}
                                  parent={getItemParent(data)}
                                  index={index}
                                  showIndex={true}
                                  showIndexPlaylist={(data.attributes.playParams.kind ?? data.type ?? "").includes("playlist")}
                                  context-ext={buildContextMenu()}
                                  v-bind:key={item.id}
                                />
                              </div>
                            )),
                          )}
                        </template>
                      </draggable>
                    </div>
                  </div>
                  <div
                    className="friends-info"
                    v-if={itemBadges.length !== 0}>
                    <div className="well">
                      <div className="badge-container">
                        {itemBadges.map((badge) => (
                          <div
                            className="socialBadge"
                            title="`${badge.attributes.name} - ${badge.attributes.handle}`"
                            v-bind:key={badge.id}>
                            <MediaItemArtwork
                              url={badge.attributes.artwork.url}
                              size="60"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="playlist-time">{getFormattedDate()}</div>
                  <div className="playlist-time total">{app.getTotalTime()}</div>
                  <div
                    className="playlist-time item-navigate"
                    onClick={() => app.searchAndNavigate(data, "recordLabel")}
                    style={{ width: "50%" }}>
                    {data.attributes.copyright}
                  </div>
                  <template v-if={(data.attributes?.playParams?.kind ?? data.type ?? "").includes("album") && data.relationships.catalog !== null && data.relationships.catalog !== null && data.relationships.catalog.data.length > 0}>
                    <div
                      className="playlist-time showExtended item-navigate"
                      style={{ color: "#fa586a", fontWeight: "bold" }}
                      onClick={() => app.routeView(data.relationships.catalog.data[0])}>
                      {$root.getLz("action.showAlbum")}
                    </div>
                  </template>
                  <hr />
                </b-tab>
                <template v-if={typeof data.views !== "undefined"}>
                  {data.meta.views.order.map((view) => (
                    <b-tab
                      lazy
                      title={data.views[view].attributes.title}
                      v-if={data.views[view].data.length !== 0}>
                      <div>
                        <div className="row">
                          <div className="col">
                            <h3>{data.views[view].attributes.title}</h3>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <MediaItemScrollerHorizontal items={data.views[view].data} />
                          </div>
                        </div>
                      </div>
                    </b-tab>
                  ))}
                </template>
              </b-tabs>
            </div>
          </template>
        </div>
        <div
          className="playlist-inner"
          v-else>
          <div
            className="close-btn"
            title="Close"
            onClick={() => $root.resetState()}>
            <svg
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 21 21"
              aria-role="presentation"
              focusable="false">
              <path
                d="M10.5 21C4.724 21 0 16.275 0 10.5S4.724 0 10.5 0 21 4.725 21 10.5 16.276 21 10.5 21zm-3.543-5.967a.96.96 0 00.693-.295l2.837-2.842 2.85 2.842c.167.167.41.295.693.295.552 0 1.001-.461 1.001-1.012 0-.281-.115-.512-.295-.704L11.899 10.5l2.85-2.855a.875.875 0 00.295-.68c0-.55-.45-.998-1.001-.998a.871.871 0 00-.668.295l-2.888 2.855-2.862-2.843a.891.891 0 00-.668-.281.99.99 0 00-1.001.986c0 .269.116.512.295.678L9.088 10.5l-2.837 2.843a.926.926 0 00-.295.678c0 .551.45 1.012 1.001 1.012z"
                fill-rule="nonzero"
              />
            </svg>
          </div>
          <template v-if={app.playlists.loadingState === 0}>
            <div className="content-inner centered">
              <div className="spinner" />
            </div>
          </template>
        </div>
      </div>
    </div>
  );
};
