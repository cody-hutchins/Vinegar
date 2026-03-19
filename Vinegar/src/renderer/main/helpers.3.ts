import { notyf } from "..";

const helpers = {
  prevButton() {
    if (app.mk.nowPlayingItem && app.mk.currentPlaybackTime > 2) {
      app.mk.seekToTime(0);
    } else {
      app.skipToPreviousItem();
    }
  },
  isDisabled() {
    return !app.mk.nowPlayingItem || app.mk.nowPlayingItem.attributes.playParams.kind === "radioStation";
  },
  isPrevDisabled() {
    return this.isDisabled() || (app.mk.queue._position === 0 && app.mk.currentPlaybackTime <= 2);
  },
  isNextDisabled() {
    return this.isDisabled() || app.mk.queue._position + 1 === app.mk.queue.length;
  },

  switchArtworkDisplayLayout() {
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
  },

  async getNowPlayingItemDetailed(target) {
    const nowPlayingItem = JSON.parse(JSON.stringify(this.mk.nowPlayingItem));
    if (nowPlayingItem.type === "radioStation" && app.mk.nowPlayingItem.id !== -1) {
      nowPlayingItem.playParams = { kind: "songs" };
      nowPlayingItem.attributes.playParams.catalogId = app.mk.nowPlayingItem.id;
      nowPlayingItem.attributes.playParams.id = app.mk.nowPlayingItem.id;
      nowPlayingItem.id = app.mk.nowPlayingItem.id;
    }
    try {
      const u = await app.mkapi(
        nowPlayingItem.playParams.kind,
        nowPlayingItem.songId === -1,
        nowPlayingItem.songId !== -1 ? nowPlayingItem.songId : nowPlayingItem["id"],
        { "include[songs]": "albums,artists", l: app.mklang },
      );
      app.searchAndNavigate(u.data.data[0], target);
    } catch (e) {
      app.searchAndNavigate(nowPlayingItem, target);
    }
  },
  async searchAndNavigate(item, target) {
    const self = this;
    app.tmpVar = item;
    switch (target) {
      case "artist":
        let artistId = "";
        try {
          if (
            item.relationships.artists &&
            item.relationships.artists.data.length > 0 &&
            !item.relationships.artists.data[0].type.includes("library")
          ) {
            if (item.relationships.artists.data[0].type === "artist" || item.relationships.artists.data[0].type === "artists") {
              artistId = item.relationships.artists.data[0].id;
            }
          }
          if (item.relationships.albums && item.relationships.albums.data.length > 0) {
            if (item.relationships.albums.data[0].attributes.artistUrl) {
              artistId = item.relationships.albums.data[0].attributes.artistUrl.split("/").pop();
            }
          }
          if (artistId === "") {
            const url = item.relationships.catalog.data[0].attributes.artistUrl;
            artistId = url.substring(url.lastIndexOf("/") + 1);
            if (artistId.includes("viewCollaboration")) {
              artistId = artistId.substring(artistId.lastIndexOf("ids=") + 4, artistId.lastIndexOf("-"));
            }
          }
        } catch (_) {}

        if (artistId === "") {
          const artistQuery = (
            await app.mk.api.v3.music(`v1/catalog/${app.mk.storefrontId}/search?term=${item.attributes.artistName}`, {
              limit: 1,
              types: "artists",
            })
          ).data.results;
          try {
            if (artistQuery.artists.data.length > 0) {
              artistId = artistQuery.artists.data[0].id;
              console.debug(artistId);
            }
          } catch (e) {
            console.log(e);
          }
        }
        console.debug(artistId);
        if (artistId !== "") self.appRoute(`artist/${artistId}`);
        break;
      case "album":
        let albumId = "";
        try {
          if ((item.type ?? item.playParams?.kind ?? "") === "albums") {
            albumId = item.id ?? "";
          } else if (
            item.relationships.albums &&
            item.relationships.albums.data.length > 0 &&
            !item.relationships.albums.data[0].type.includes("library")
          ) {
            if (item.relationships.albums.data[0].type === "album" || item.relationships.albums.data[0].type === "albums") {
              albumId = item.relationships.albums.data[0].id;
            }
          }
          if (albumId === "") {
            const url = item.relationships.catalog.data[0].attributes.url;
            albumId = url.substring(url.lastIndexOf("/") + 1);
            if (albumId.includes("?i=")) {
              albumId = albumId.substring(0, albumId.indexOf("?i="));
            }
          }
        } catch (_) {}

        if (albumId === "") {
          try {
            const albumQuery = (
              await app.mk.api.v3.music(
                `v1/catalog/${app.mk.storefrontId}/search?term=${(item.attributes.albumName ?? item.attributes.name ?? "") + " " + (item.attributes.artistName ?? "")}`,
                {
                  limit: 1,
                  types: "albums",
                },
              )
            ).data.results;
            if (albumQuery.albums.data.length > 0) {
              albumId = albumQuery.albums.data[0].id;
              console.debug(albumId);
            }
          } catch (e) {
            console.log(e);
          }
        }
        if (albumId !== "") {
          self.appRoute(`album/${albumId}`);
        }
        break;
      case "recordLabel":
        let labelId = "";
        try {
          labelId = item.relationships["record-labels"].data[0].id;
        } catch (_) {}

        if (labelId === "") {
          try {
            const labelQuery = (
              await app.mk.api.v3.music(`v1/catalog/${app.mk.storefrontId}/search?term=${item.attributes.recordLabel}`, {
                limit: 1,
                types: "record-labels",
              })
            ).data.results;
            if (labelQuery["record-labels"].data.length > 0) {
              labelId = labelQuery["record-labels"].data[0].id;
              console.debug(labelId);
            }
          } catch (e) {
            console.log(e);
          }
        }
        if (labelId !== "") {
          app.showingPlaylist = [];
          await app.getTypeFromID("recordLabel", labelId, false, {
            views: "top-releases,latest-releases,top-artists",
          });
          app.page = "recordLabel_" + labelId;
        }

        break;
    }
  },
  exitMV() {
    MusicKit.getInstance().stop();
    document.getElementById("apple-music-video-container").style.display = "none";
  },
  getArtistInfo(id, isLibrary) {
    this.getArtistFromID(id);
    //this.getTypeFromID("artist",id,isLibrary,query)
  },
  followingArtist(id) {
    console.debug(`check for ${id}`);
    return this.cfg.home.followedArtists.includes(id);
  },
  playMediaItem(item) {
    const kind = item.attributes.playParams ? (item.attributes.playParams.kind ?? item.type ?? "") : (item.type ?? "");
    const id = item.attributes.playParams ? (item.attributes.playParams.id ?? item.id ?? "") : (item.id ?? "");
    const isLibrary = item.attributes.playParams ? (item.attributes.playParams.isLibrary ?? false) : false;
    const truekind = !kind.endsWith("s") ? kind + "s" : kind;
    // console.log(kind, id, isLibrary)
    app.mk.stop().then(() => {
      if (kind.includes("artist")) {
        app.mk.setStationQueue({ artist: "a-" + id }).then(() => {
          app.mk.play();
        });
      } else {
        app.playMediaItemById(id, kind, isLibrary, item.attributes.url ?? "");
      }
    });
  },
  async getTypeFromID(kind, id, isLibrary = false, params = {}, params2 = {}) {
    let a;
    if ((kind === "album") | (kind === "albums")) {
      params["include"] = "tracks,artists,record-labels,catalog";
    }
    params["l"] = this.mklang;
    try {
      a = await this.mkapi(kind.toString(), isLibrary, id.toString(), params, params2);
    } catch (e) {
      console.debug(e);
      try {
        a = await this.mkapi(kind.toString(), !isLibrary, id.toString(), params, params2);
      } catch (err) {
        console.log(err);
        a = [];
      } finally {
        if (kind === "appleCurator") {
          app.appleCurator = a.data.data[0];
        } else if (kind === "multiroom" || kind === "room") {
          app.multiroom = a.data.data[0];
        } else {
          this.getPlaylistContinuous(a, true);
        }
      }
    } finally {
      if (kind === "appleCurator") {
        app.appleCurator = a.data.data[0];
      } else if (kind === "multiroom" || kind === "room") {
        app.multiroom = a.data.data[0];
      } else {
        this.getPlaylistContinuous(a, true);
      }
    }
  },
  searchLibrarySongs() {
    const self = this;
    const prefs = this.cfg.libraryPrefs.songs;

    function sortSongs() {
      // sort this.library.songs.displayListing by song.attributes[self.library.songs.sorting] in descending or ascending order based on alphabetical order and numeric order
      // check if song.attributes[self.library.songs.sorting] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
      self.library.songs.displayListing.sort((a, b) => {
        let aa = a.attributes[prefs.sort];
        let bb = b.attributes[prefs.sort];
        if (prefs.sort === "genre") {
          aa = a.attributes.genreNames[0];
          bb = b.attributes.genreNames[0];
        } else if (prefs.sort === "dateAdded") {
          aa = a.relationships?.albums?.data[0]?.attributes?.dateAdded;
          bb = b.relationships?.albums?.data[0]?.attributes?.dateAdded;
          // if dateAdded is equal, an entire album was added at once, so sorting by track number (in reverse order because lower track number should be above in descending mode)
          if (aa === bb) {
            aa = b.attributes.trackNumber;
            bb = a.attributes.trackNumber;
          }
        } else if (prefs.sort === "artistName") {
          if (a.relationships?.artists?.data[0]?.id === b.relationships?.artists?.data[0]?.id) {
            aa = a.attributes.albumName;
            bb = b.attributes.albumName;
          }
          if (a.relationships?.albums?.data[0]?.id === b.relationships?.albums?.data[0]?.id) {
            aa = a.attributes.trackNumber;
            bb = b.attributes.trackNumber;
          }
        } else if (prefs.sort === "albumName") {
          if (a.relationships?.albums?.data[0]?.id === b.relationships?.albums?.data[0]?.id) {
            aa = a.attributes.trackNumber;
            bb = b.attributes.trackNumber;
          }
        }
        if (aa === null) {
          aa = "";
        }
        if (bb === null) {
          bb = "";
        }
        if (prefs.sortOrder === "asc") {
          if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
            return aa - bb;
          } else {
            return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
          }
        } else if (prefs.sortOrder === "desc") {
          if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
            return bb - aa;
          } else {
            return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
          }
        }
      });
    }

    if (this.library.songs.search === "") {
      this.library.songs.displayListing = this.library.songs.listing;
      sortSongs();
    } else {
      this.library.songs.displayListing = this.library.songs.listing.filter((item) => {
        let itemName = item.attributes.name.toLowerCase();
        let searchTerm = this.library.songs.search.toLowerCase();
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

        if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
          return item;
        }
      });
      sortSongs();
    }
  },
  getAlbumSort() {
    this.library.albums.sortOrder[1] = this.cfg.libraryPrefs.albums.sortOrder;
    this.library.albums.sorting[1] = this.cfg.libraryPrefs.albums.sort;
  },
  // make a copy of searchLibrarySongs except use Albums instead of Songs
  searchLibraryAlbums(index) {
    const self = this;

    function sortAlbums() {
      // sort this.library.albums.displayListing by album.attributes[self.library.albums.sorting[index]] in descending or ascending order based on alphabetical order and numeric order
      // check if album.attributes[self.library.albums.sorting[index]] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
      self.library.albums.displayListing.sort((a, b) => {
        let aa = a.attributes[self.library.albums.sorting[index]];
        let bb = b.attributes[self.library.albums.sorting[index]];
        if (self.library.albums.sorting[index] === "genre") {
          aa = a.attributes.genreNames[0];
          bb = b.attributes.genreNames[0];
        } else if (self.library.albums.sorting[index] === "dateAdded") {
          aa = a.attributes?.dateAdded;
          bb = b.attributes?.dateAdded;
        }
        if (aa === null) {
          aa = "";
        }
        if (bb === null) {
          bb = "";
        }
        if (self.library.albums.sortOrder[index] === "asc") {
          if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
            return aa - bb;
          } else {
            return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
          }
        } else if (self.library.albums.sortOrder[index] === "desc") {
          if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
            return bb - aa;
          } else {
            return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
          }
        }
      });
    }

    if (this.library.albums.search === "") {
      this.library.albums.displayListing = this.library.albums.listing;
      sortAlbums();
    } else {
      this.library.albums.displayListing = this.library.albums.listing.filter((item) => {
        let itemName = item.attributes.name.toLowerCase();
        let searchTerm = this.library.albums.search.toLowerCase();
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

        if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
          return item;
        }
      });
      sortAlbums();
    }
  },
  // make a copy of searchLibrarySongs except use Albums instead of Songs
  searchLibraryArtists(index) {
    const self = this;

    function sortArtists() {
      // sort this.library.albums.displayListing by album.attributes[self.library.albums.sorting[index]] in descending or ascending order based on alphabetical order and numeric order
      // check if album.attributes[self.library.albums.sorting[index]] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
      self.library.artists.displayListing.sort((a, b) => {
        let aa = a.attributes[self.library.artists.sorting[index]];
        let bb = b.attributes[self.library.artists.sorting[index]];
        if (self.library.artists.sorting[index] === "genre") {
          aa = a.attributes.genreNames[0];
          bb = b.attributes.genreNames[0];
        }
        if (aa === null) {
          aa = "";
        }
        if (bb === null) {
          bb = "";
        }
        if (self.library.artists.sortOrder[index] === "asc") {
          if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
            return aa - bb;
          } else {
            return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
          }
        } else if (self.library.artists.sortOrder[index] === "desc") {
          if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
            return bb - aa;
          } else {
            return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
          }
        }
      });
    }

    if (this.library.artists.search === "") {
      this.library.artists.displayListing = this.library.artists.listing;
      sortArtists();
    } else {
      this.library.artists.displayListing = this.library.artists.listing.filter((item) => {
        let itemName = item.attributes.name.toLowerCase();
        let searchTerm = this.library.artists.search.toLowerCase();
        const artistName = "";
        const albumName = "";
        // if (item.attributes.artistName !== null) {
        //     artistName = item.attributes.artistName.toLowerCase()
        // }
        // if (item.attributes.albumName !== null) {
        //     albumName = item.attributes.albumName.toLowerCase()
        // }

        // remove any non-alphanumeric characters and spaces from search term and item name
        searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "");
        itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "");

        if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
          return item;
        }
      });
      sortArtists();
    }
  },
  focusSearch() {
    app.appRoute("search");
    const search = document.getElementsByClassName("search-input");
    if (search.length > 0) {
      search[0].focus();
    }
  },
  getSidebarItemClass(page) {
    if (this.page === page) {
      return ["active"];
    } else {
      return [];
    }
  },
  async mkapi(method, library = false, term, params = {}, params2 = {}, attempts = 0) {
    if (method.includes(`recordLabel`)) {
      method = `record-labels`;
    }
    if (method.includes(`appleCurator`)) {
      method = `apple-curators`;
    }
    if (attempts > 3) {
      return;
    }
    const truemethod = !method.endsWith("s") ? method + "s" : method;
    try {
      if (method.includes(`room`)) {
        return await this.mk.api.v3.music(`v1/editorial/${app.mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2);
      } else if (library) {
        return await this.mk.api.v3.music(`v1/me/library/${truemethod}/${term.toString()}`, params, params2);
      } else {
        return await this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2);
      }
    } catch (e) {
      console.debug(e);
      return await this.mkapi(method, library, term, params, params2, attempts + 1);
    }
  },
  getLibraryGenres() {
    let genres = [];
    genres = [];
    this.library.songs.listing.forEach((item) => {
      item.attributes.genreNames.forEach((genre) => {
        if (!genres.includes(genre)) {
          genres.push(genre);
        }
      });
    });
    return genres;
  },
  async getLibrarySongsFull(force = false) {
    const self = this;
    let library = [];
    const cacheId = "library-songs";
    const downloaded = null;
    this.$store.commit("resetRecentlyAdded");
    if (this.library.songs.downloadState === 2 && !force) {
      return;
    }
    if (this.library.songs.downloadState === 1) {
      return;
    }
    const librarySongs = await CiderCache.getCache(cacheId);
    if (librarySongs) {
      this.library.songs.listing.data = librarySongs;
      this.searchLibrarySongs();
    }
    if (this.songstest) {
      return;
    }
    this.library.songs.downloadState = 1;
    this.library.backgroundNotification.show = true;
    this.library.backgroundNotification.message = app.getLz("notification.updatingLibrarySongs");

    library = await MusicKitTools.v3Continuous({
      href: `/v1/me/library/songs/`,
      options: {
        "include[library-songs]": "catalog,artists,albums",
        "fields[artists]": "name,url,id",
        "fields[albums]": "name,url,id",
        platform: "web",
        "fields[catalog]": "artistUrl,albumUrl",
        "fields[songs]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
        limit: 100,
        l: app.mklang,
      },
      onProgress: (data) => {
        console.debug(`${data.total}/${data.response.data.meta.total}`);
        self.library.backgroundNotification.show = true;
        self.library.backgroundNotification.message = app.getLz("notification.updatingLibrarySongs");
        self.library.backgroundNotification.total = data.response.data.meta.total;
        self.library.backgroundNotification.progress = data.total;
      },
      onSuccess: () => {},
    });

    self.library.songs.listing = library;
    self.library.songs.downloadState = 2;
    self.library.backgroundNotification.show = false;
    self.searchLibrarySongs();
    CiderCache.putCache(cacheId, library);
    console.debug("Done!");

    return;
  },
  // copy the getLibrarySongsFull function except change Songs to Albums
  async getLibraryAlbumsFull(force = false, index) {
    const self = this;
    let library = [];
    const cacheId = "library-albums";
    let downloaded = null;
    if ((this.library.albums.downloadState === 2 || this.library.albums.downloadState === 1) && !force) {
      return;
    }
    const libraryAlbums = await CiderCache.getCache(cacheId);
    if (libraryAlbums) {
      this.library.albums.listing = libraryAlbums;
      this.searchLibraryAlbums(index);
    }
    if (this.songstest) {
      return;
    }
    this.library.albums.downloadState = 1;
    this.library.backgroundNotification.show = true;
    this.library.backgroundNotification.message = app.getLz("notification.updatingLibraryAlbums");

    function downloadChunk() {
      self.library.albums.downloadState = 1;
      const params = {
        "include[library-albums]": "catalog,artists,albums",
        "fields[artists]": "name,url,id",
        // "fields[albums]": "name,url,id",
        platform: "web",
        "fields[catalog]": "artistUrl,albumUrl",
        "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
        limit: 100,
        l: self.mklang,
      };
      const safeparams = {
        platform: "web",
        limit: "60",
        "include[library-albums]": "artists",
        "include[library-artists]": "catalog",
        "include[albums]": "artists",
        "fields[artists]": "name,url",
        "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
        includeOnly: "catalog,artists",
      };
      if (downloaded === null) {
        app.mk.api.v3
          .music(`/v1/me/library/albums/`, params)
          .then((response) => {
            processChunk(response.data);
          })
          .catch((error) => {
            console.debug("safe loading");
            app.mk.api.v3
              .music(`/v1/me/library/albums/`, safeparams)
              .then((response) => {
                processChunk(response.data);
              })
              .catch((error) => {
                console.log("safe loading failed", error);
                app.library.albums.downloadState = 2;
                app.library.backgroundNotification.show = false;
              });
          });
      } else {
        if (downloaded.next !== null) {
          app.mk.api.v3
            .music(downloaded.next, params)
            .then((response) => {
              processChunk(response.data);
            })
            .catch((error) => {
              console.debug("safe loading");
              app.mk.api.v3
                .music(downloaded.next, safeparams)
                .then((response) => {
                  processChunk(response.data);
                })
                .catch((error) => {
                  console.log("safe loading failed", error);
                  app.library.albums.downloadState = 2;
                  app.library.backgroundNotification.show = false;
                });
            });
        } else {
          console.debug("Download next", downloaded.next);
        }
      }
    }

    function processChunk(response) {
      downloaded = response;
      library = library.concat(downloaded.data);
      self.library.backgroundNotification.show = true;
      self.library.backgroundNotification.message = app.getLz("notification.updatingLibraryAlbums");
      self.library.backgroundNotification.total = downloaded.meta.total;
      self.library.backgroundNotification.progress = library.length;
      if (downloaded.meta.total === 0) {
        self.library.albums.downloadState = 3;
        return;
      }
      if (typeof downloaded.next === "undefined") {
        console.debug("downloaded.next is undefined");
        self.library.albums.listing = library;
        self.library.albums.downloadState = 2;
        self.library.backgroundNotification.show = false;
        CiderCache.putCache(cacheId, library);
        self.searchLibraryAlbums(index);
      }
      if (downloaded.meta.total > library.length || typeof downloaded.meta.next !== "undefined") {
        console.debug(`downloading next chunk - ${library.length} albums so far`);
        downloadChunk();
      } else {
        self.library.albums.listing = library;
        self.library.albums.downloadState = 2;
        self.library.backgroundNotification.show = false;
        CiderCache.putCache(cacheId, library);
        self.searchLibraryAlbums(index);
        // console.log(library)
      }
    }

    downloadChunk();
  },
  // copy the getLibrarySongsFull function except change Songs to Albums
  async getLibraryArtistsFull(force = false, index) {
    const self = this;
    let library = [];
    const cacheId = "library-artists";
    let downloaded = null;
    if ((this.library.artists.downloadState === 2 || this.library.artists.downloadState === 1) && !force) {
      return;
    }
    const libraryArtists = await CiderCache.getCache(cacheId);
    if (libraryArtists) {
      this.library.artists.listing = libraryArtists;
      this.searchLibraryArtists(index);
    }
    if (this.songstest) {
      return;
    }
    this.library.artists.downloadState = 1;
    this.library.backgroundNotification.show = true;
    this.library.backgroundNotification.message = app.getLz("notification.updatingLibraryArtists");

    function downloadChunk() {
      self.library.artists.downloadState = 1;
      const params = {
        include: "catalog",
        // "include[library-artists]": "catalog,artists,albums",
        // "fields[artists]": "name,url,id",
        // "fields[albums]": "name,url,id",
        platform: "web",
        // "fields[catalog]": "artistUrl,albumUrl",
        // "fields[artists]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
        limit: 100,
        l: self.mklang,
      };
      const safeparams = {
        include: "catalog",
        platform: "web",
        limit: 50,
      };
      if (downloaded === null) {
        app.mk.api.v3
          .music(`/v1/me/library/artists/`, params)
          .then((response) => {
            processChunk(response.data);
          })
          .catch((error) => {
            console.debug("safe loading");
            app.mk.api.v3
              .music(`/v1/me/library/artists/`, safeparams)
              .then((response) => {
                processChunk(response.data);
              })
              .catch((error) => {
                console.log("safe loading failed", error);
                app.library.artists.downloadState = 2;
                app.library.backgroundNotification.show = false;
              });
          });
      } else {
        if (downloaded.next !== null) {
          app.mk.api.v3
            .music(downloaded.next, params)
            .then((response) => {
              processChunk(response.data);
            })
            .catch((error) => {
              console.log("safe loading");
              app.mk.api.v3
                .music(downloaded.next, safeparams)
                .then((response) => {
                  processChunk(response.data);
                })
                .catch((error) => {
                  console.log("safe loading failed", error);
                  app.library.artists.downloadState = 2;
                  app.library.backgroundNotification.show = false;
                });
            });
        } else {
          console.log("Download next", downloaded.next);
        }
      }
    }

    function processChunk(response) {
      downloaded = response;
      library = library.concat(downloaded.data);
      self.library.backgroundNotification.show = true;
      self.library.backgroundNotification.message = app.getLz("notification.updatingLibraryArtists");
      self.library.backgroundNotification.total = downloaded.meta.total;
      self.library.backgroundNotification.progress = library.length;
      if (downloaded.meta.total === 0) {
        self.library.albums.downloadState = 3;
        return;
      }
      if (typeof downloaded.next === "undefined") {
        console.log("downloaded.next is undefined");
        self.library.artists.listing = library;
        self.library.artists.downloadState = 2;
        self.library.artists.show = false;
        CiderCache.putCache(cacheId, library);
        self.searchLibraryArtists(index);
      }
      if (downloaded.meta.total > library.length || typeof downloaded.meta.next !== "undefined") {
        console.log(`downloading next chunk - ${library.length} artists so far`);
        downloadChunk();
      } else {
        self.library.artists.listing = library;
        self.library.artists.downloadState = 2;
        self.library.backgroundNotification.show = false;
        CiderCache.putCache(cacheId, library);
        self.searchLibraryArtists(index);
        // console.log(library)
      }
    }

    downloadChunk();
  },
  /**
   * Gets the total duration in seconds of a playlist
   * @returns {string} Total tracks, and duration
   * @author Core#1034
   * @memberOf app
   */
  getTotalTime() {
    try {
      if (app.showingPlaylist.relationships.tracks.data.length === 0) return "";
      const timeInSeconds = Math.round(
        []
          .concat(...app.showingPlaylist.relationships.tracks.data)
          .reduce((a, { attributes: { durationInMillis } }) => a + durationInMillis, 0) / 1000,
      );
      return `${app.showingPlaylist.relationships.tracks.data.length} ${app.getLz("term.track", {
        count: app.showingPlaylist.relationships.tracks.data.length,
      })}, ${app.convertTime(timeInSeconds, "long")}`;
    } catch (err) {
      return "";
    }
  },
  async getLibrarySongs() {
    const response = await this.mkapi("songs", true, "", { limit: 100, l: this.mklang }, { includeResponseMeta: !0 });
    this.library.songs.listing = response.data.data;
    this.library.songs.meta = response.data.meta;
  },
  async getLibraryAlbums() {
    const response = await this.mkapi("albums", true, "", { limit: 100, l: this.mklang }, { includeResponseMeta: !0 });
    this.library.albums.listing = response.data.data;
    this.library.albums.meta = response.data.meta;
  },
  async getListenNow(attempt = 0) {
    if (this.listennow.timestamp > Date.now() - 120000) {
      return;
    }

    if (attempt > 3) {
      return;
    }
    try {
      this.listennow = (
        await this.mk.api.v3.music(
          `v1/me/recommendations?timezone=${encodeURIComponent(this.formatTimezoneOffset())}`,
          {
            name: "listen-now",
            with: "friendsMix,library,social",
            "art[social-profiles:url]": "c",
            "art[url]": "c,f",
            "omit[resource]": "autos",
            "relate[editorial-items]": "contents",
            extend: ["editorialCard", "editorialVideo"],
            "extend[albums]": ["artistUrl"],
            "extend[library-albums]": ["artistUrl", "editorialVideo"],
            "extend[playlists]": ["artistNames", "editorialArtwork", "editorialVideo"],
            "extend[library-playlists]": ["artistNames", "editorialArtwork", "editorialVideo"],
            "extend[social-profiles]": "topGenreNames",
            "include[albums]": "artists",
            "include[songs]": "artists",
            "include[music-videos]": "artists",
            "include[personal-recommendation]": "primary-content",
            "fields[albums]": [
              "artistName",
              "artistUrl",
              "artwork",
              "contentRating",
              "editorialArtwork",
              "editorialVideo",
              "name",
              "playParams",
              "releaseDate",
              "url",
            ],
            "fields[artists]": ["name", "url", "artwork"],
            "extend[stations]": ["airDate", "supportsAirTimeUpdates"],
            "meta[stations]": "inflectionPoints",
            types:
              "artists,albums,editorial-items,library-albums,library-playlists,music-movies,music-videos,playlists,stations,uploaded-audios,uploaded-videos,activities,apple-curators,curators,tv-shows,social-upsells",
            platform: "web",
            l: this.mklang,
          },
          {
            includeResponseMeta: !0,
            reload: !0,
          },
        )
      ).data;
      this.listennow.timestamp = Date.now();
      console.debug(this.listennow);
    } catch (e) {
      console.log(e);
      this.getListenNow(attempt + 1);
    }
  },
  async getRadioPage(attempt = 0) {
    if (this.radio.timestamp > Date.now() - 120000) {
      return;
    }
    if (attempt > 3) {
      return;
    }
    try {
      app.mk.api.v3
        .music(`/v1/editorial/${app.mk.storefrontId}/groupings`, {
          platform: "web",
          name: "radio",
          "omit[resource:artists]": "relationships",
          "include[albums]": "artists",
          "include[songs]": "artists",
          "include[music-videos]": "artists",
          extend: "editorialArtwork,artistUrl",
          "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
          "art[url]": "f",
          l: app.mklang,
        })
        .then((radio) => {
          app.radio = radio.data.data[0];
          console.debug(app.radio);
        });

      this.radio.timestamp = Date.now();
    } catch (e) {
      console.log(e);
      this.getRadioPage(attempt + 1);
    }
  },
  async getBrowsePage(attempt = 0) {
    if (this.browsepage.timestamp > Date.now() - 120000) {
      return;
    }
    if (attempt > 3) {
      return;
    }
    try {
      const browse = await app.mk.api.v3.music(`/v1/editorial/${app.mk.storefrontId}/groupings`, {
        platform: "web",
        name: "music",
        "omit[resource:artists]": "relationships",
        "include[albums]": "artists",
        "include[songs]": "artists",
        "include[music-videos]": "artists",
        extend: "editorialArtwork,artistUrl",
        "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
        "art[url]": "f",
        l: app.mklang,
      });
      this.browsepage = browse.data.data[0];
      this.browsepage.timestamp = Date.now();
      console.debug(this.browsepage);
    } catch (e) {
      console.log(e);
      this.getBrowsePage(attempt + 1);
    }
  },
  async getMadeForYou(attempt = 0) {
    if (attempt > 3) {
      return;
    }
    try {
      const mfu = await app.mk.api.v3.music(
        "/v1/me/library/playlists?platform=web&extend=editorialVideo&fields%5Bplaylists%5D=lastModifiedDate&filter%5Bfeatured%5D=made-for-you&include%5Blibrary-playlists%5D=catalog&fields%5Blibrary-playlists%5D=artwork%2Cname%2CplayParams%2CdateAdded",
      );
      this.madeforyou = mfu.data;
    } catch (e) {
      console.log(e);
      this.getMadeForYou(attempt + 1);
    }
  },
  newPlaylistFolder(name = app.getLz("term.newPlaylistFolder")) {
    const self = this;
    this.mk.api.v3
      .music(
        "/v1/me/library/playlist-folders/",
        {},
        {
          fetchOptions: {
            method: "POST",
            body: JSON.stringify({
              attributes: { name: name },
            }),
          },
        },
      )
      .then((res) => {
        const playlist = res.data.data[0];
        self.playlists.listing.push({
          id: playlist.id,
          attributes: {
            name: playlist.attributes.name,
          },
          type: "library-playlist-folders",
          parent: "p.playlistsroot",
        });
        self.sortPlaylists();
        setTimeout(() => {
          app.refreshPlaylists(false, false);
        }, 13000);
      });
  },
  showSearch() {
    this.page = "search";
  },
  loadLyrics() {
    const musicType = MusicKit.getInstance().nowPlayingItem !== null ? (MusicKit.getInstance().nowPlayingItem["type"] ?? "") : "";
    // console.log("mt", musicType)
    if (musicType === "musicVideo") {
      this.loadYTLyrics();
    } else {
      // only load MXM lyrics if AM lyrics failed to load
      if (app.cfg.lyrics.enable_mxm) {
        this.loadMXM();
      } else {
        this.loadAMLyrics();
      }
    }
  },
  async loadAMLyrics() {
    const songID = this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem["_songId"] ?? this.mk.nowPlayingItem["songId"] ?? -1) : -1;
    // this.getMXM( trackName, artistName, 'en', duration);
    if (songID !== -1) {
      try {
        const response = await this.mk.api.v3.music(`v1/catalog/${this.mk.storefrontId}/songs/${songID}/lyrics`);
        this.lyricsMediaItem = response.data?.data[0]?.attributes["ttml"];
        this.parseTTML();
      } catch (_) {
        if (app.cfg.lyrics.enable_mxm) {
          this.loadQQLyrics();
        } else {
          this.loadMXM();
        }
      }
    } else {
      if (app.cfg.lyrics.enable_mxm) {
        this.loadQQLyrics(); // since mxm is already prioritized, we can just load qq lyrics if am fails
      } else {
        this.loadMXM();
      }
    }
  },
};

export default { helpers };
