import { notyf } from "..";

const helpers = {
  setWindowScaleFactor() {
    let scale = (((window.devicePixelRatio * window.innerWidth) / 1280) * window.innerHeight) / 720;
    const desiredScale = clamp(parseFloat(app.cfg.visual.maxElementScale === -1 ? 1.5 : app.cfg.visual.maxElementScale), 1, 1.5);
    app.$store.state.windowRelativeScale = scale;
    if (scale <= 1) {
      scale = 1;
    } else if (scale >= desiredScale) {
      scale = desiredScale;
    }
    document.documentElement.style.setProperty("--windowRelativeScale", scale);
  },
  c2offer() {
    app.modals.c2Upgrade = true;
  },
  showFoo(querySelector, time) {
    clearTimeout(this.idleTimer);
    if (this.idleState) {
      document.querySelector(querySelector).classList.remove("inactive");
    }
    this.idleState = false;
    this.idleTimer = setTimeout(() => {
      document.querySelector(querySelector).classList.add("inactive");
      this.idleState = true;
    }, time);
  },
  setContentScrollPos(scroll) {
    this.chrome.contentScrollPosY = scroll.target.scrollTop;
  },
  async checkForThemeUpdates() {
    const self = this;
    const themes = window.electronAPI.sendSync("get-themes");
    await asyncForEach(themes, async (theme) => {
      if (theme.commit !== "") {
        if (theme.commit !== "") {
          app._fetch(`https://api.github.com/repos/${theme.github_repo}/commits`).then((res) => res.json());
          if (res[0].sha !== theme.commit) {
            const notify = notyf.open({
              className: "notyf-info",
              type: "info",
              message: app.stringTemplateParser(app.getLz("settings.notyf.visual.theme.updateAvailable"), { theme: theme.name }),
            });
            notify.on("click", () => {
              app.openSettingsPage("github-themes");
              notyf.dismiss(notify);
            });
          }
        }
      }
    });
  },
  async setTheme(theme = "", onlyPrefs = false) {
    console.debug(theme);
    if (this.cfg.visual.theme === "") {
      this.cfg.visual.theme = "default.less";
    }
    if (theme === "") {
      theme = this.cfg.visual.theme;
    } else {
      this.cfg.visual.theme = "";
      this.cfg.visual.theme = theme;
    }
    const info = {};
    try {
      const infoResponse = await fetch("themes/" + app.cfg.visual.theme.replace("index.less", "theme.json"));
      this.chrome.appliedTheme.info = await infoResponse.json();
    } catch (e) {
      e = null;
      console.warn("failed to get theme.json");
      this.chrome.appliedTheme.info = {};
    }

    if (!onlyPrefs) {
      document.querySelector("#userTheme").href = `themes/${this.cfg.visual.theme}`;
      document.querySelectorAll(`[id*='less']`).forEach((el) => {
        el.remove();
      });
      await less.refresh();
    }
  },
  async reloadStyles() {
    const styles = this.cfg.visual.styles;
    document.querySelectorAll(`[id*='less']`).forEach((el) => {
      if (el.id !== "less:style") {
        el.remove();
      }
    });

    this.chrome.appliedTheme.info = {};
    await asyncForEach(styles, async (style) => {
      const styleEl = document.createElement("link");
      styleEl.id = `less-${style.replace(".less", "")}`;
      styleEl.rel = "stylesheet/less";
      styleEl.href = `themes/${style}`;
      styleEl.type = "text/css";
      document.head.appendChild(styleEl);
      try {
        const infoResponse = await fetch("themes/" + style.replace("index.less", "theme.json"));
        this.chrome.appliedTheme.info = Object.assign(this.chrome.appliedTheme.info, await infoResponse.json());
      } catch (e) {
        e = null;
        console.warn("failed to get theme.json");
      }
    });
    less.registerStylesheetsImmediately();
    await less.refresh(true, true, true);
    this.$forceUpdate();
    return;
  },
  macOSEmu() {
    this.chrome.forceDirectives["macosemu"] = {
      value: true,
    };
    this.chrome.windowControlPosition = "left";
  },
  getThemeDirective(directive = "") {
    let directives = {};
    if (typeof this.chrome.appliedTheme.info.directives === "object") {
      directives = this.chrome.appliedTheme.info.directives;
    }
    directives = Object.assign(directives, this.chrome.forceDirectives);
    if (directives[directive]) {
      return directives[directive].value;
    } else if (this.cfg.visual.directives[directive]) {
      return this.cfg.visual.directives[directive];
    } else {
      return false;
    }
  },
  unauthorize() {
    this.confirm(app.getLz("term.confirmLogout"), function (result) {
      if (result) {
        app.mk.unauthorize();
        document.location.reload();
      }
    });
  },
  getAppClasses() {
    const classes = {};
    switch (this.getThemeDirective("forceUI") ?? "none") {
      case "compact":
        classes.compact = true;
        break;
      case "standard":
        classes.compact = false;
        break;
      default:
        if (this.cfg.advanced.experiments.includes("compactui")) {
          classes.compact = true;
        }
        break;
    }

    if (this.cfg.visual.window_background_style === "none") {
      classes.simplebg = true;
    }

    if (this.platform !== "darwin") {
      switch (parseInt(this.cfg.visual.windowControlPosition)) {
        default:
        case 0:
          this.chrome.windowControlPosition = "right";
          this.chrome.forceDirectives["macosemu"] = {
            value: false,
          };
          break;
        case 1:
          this.chrome.windowControlPosition = "left";
          this.chrome.forceDirectives["macosemu"] = {
            value: true,
          };
          break;
      }
    }

    if (this.getThemeDirective("windowLayout") === "twopanel") {
      classes.twopanel = true;
    }
    if (this.getThemeDirective("appNavigation") === "seperate") {
      classes.navbar = true;
    }
    if (this.getThemeDirective("macosemu")) {
      classes.macosemu = true;
    }
    return classes;
  },
  invokeDrawer(panel) {
    if (this.drawer.panel === panel && this.drawer.open) {
      if (panel === "lyrics") {
        this.lyricon = false;
      }
      this.drawer.panel = "";
      this.drawer.open = false;
    } else {
      if (panel === "lyrics") {
        this.lyricon = true;
      } else {
        this.lyricon = false;
      }
      this.drawer.open = true;
      this.drawer.panel = panel;
    }
  },
  select_removeMediaItem(id) {
    this.selectedMediaItems
      .filter((item) => item.guid === id)
      .forEach((item) => {
        this.selectedMediaItems.splice(this.selectedMediaItems.indexOf(item), 1);
      });
  },
  select_hasMediaItem(id) {
    const found = this.selectedMediaItems.find((item) => item.guid === id);
    if (found) {
      return true;
    } else {
      return false;
    }
  },
  select_selectMediaItem(id, kind, index, guid, library) {
    if (!this.select_hasMediaItem(guid)) {
      this.selectedMediaItems.push({
        id: id,
        kind: kind,
        index: index,
        guid: guid,
        isLibrary: library,
      });
    }
  },
  getPlaylistFolderChildren(id) {
    return this.playlists.listing.filter((playlist) => {
      if (playlist.parent === id) {
        return playlist;
      }
    });
  },
  async syncFavorites() {
    const notify = notyf.open({
      className: "notyf-info",
      type: "info",
      message: `[${app.getLz("home.syncFavorites")}] ${app.getLz("home.syncFavorites.gettingArtists")}`,
    });
    const results = await MusicKitTools.v3Continuous({
      href: "/v1/me/library/artists",
      options: {
        include: ["catalog"],
        "fields[artists]": ["inFavorites"],
      },
    });
    const favs = [];
    // for each result
    results.forEach((result) => {
      try {
        if (result.relationships?.catalog?.data[0]?.attributes?.inFavorites) {
          if (!favs.includes(result.relationships?.catalog?.data[0].id)) {
            favs.push(result.relationships?.catalog?.data[0].id);
          }
        }
      } catch (e) {
        e = null;
      }
    });
    notyf.success(`[${app.getLz("home.syncFavorites")}] ${app.getLz("action.done")}`);
    app.cfg.home.followedArtists = favs;
    return favs;
  },
  async setArtistFavorite(id, val = true) {
    if (val) {
      if (!app.cfg.home.followedArtists.includes(id)) {
        app.cfg.home.followedArtists.push(id);
      }
      await app.mk.api.v3.music(
        `/v1/me/favorites`,
        {
          "art[url]": "f",
          "ids[artists]": app.artistPage.data.id,
          l: app.mklang,
          platform: "web",
        },
        {
          fetchOptions: {
            method: "POST",
          },
        },
      );
    } else {
      if (app.cfg.home.followedArtists.includes(id)) {
        app.cfg.home.followedArtists.splice(app.cfg.home.followedArtists.indexOf(id), 1);
      }
      await app.mk.api.v3.music(
        `/v1/me/favorites`,
        {
          "art[url]": "f",
          "ids[artists]": app.artistPage.data.id,
          l: app.mklang,
          platform: "web",
        },
        {
          fetchOptions: {
            method: "DELETE",
          },
        },
      );
    }
  },
  async refreshPlaylists(localOnly = false, useCachedPlaylists = true) {
    const self = this;
    const trackMap = this.cfg.advanced.playlistTrackMapping;
    const newListing = [];
    const trackMapping = {};

    if (useCachedPlaylists) {
      const cachedPlaylist = await CiderCache.getCache("library-playlists");
      const cachedTrackMapping = await CiderCache.getCache("library-playlists-tracks");

      if (cachedPlaylist) {
        console.debug("[CiderCache] Using cached playlist");
        this.playlists.listing = cachedPlaylist;
        self.sortPlaylists();
      } else {
        console.debug("[CiderCache] Playlist has no cache");
      }

      if (cachedTrackMapping) {
        console.debug("[CiderCache] Using cached track mapping");
        this.playlists.trackMapping = cachedTrackMapping;
      }
      if (localOnly) {
        return;
      }
    }

    this.library.backgroundNotification.message = app.getLz("notification.buildingPlaylistCache");
    this.library.backgroundNotification.show = true;

    async function deepScan(parent = "p.playlistsroot") {
      console.debug(`scanning ${parent}`);
      // const playlistData = await app.mk.api.v3.music(`/v1/me/library/playlist-folders/${parent}/children/`)
      const playlistData = await MusicKitTools.v3Continuous({
        href: `/v1/me/library/playlist-folders/${parent}/children/`,
      });
      console.log(playlistData);
      await asyncForEach(playlistData, async (playlist) => {
        playlist.parent = parent;
        if (playlist.type !== "library-playlist-folders" && typeof playlist.attributes.playParams["versionHash"] !== "undefined") {
          playlist.parent = "p.applemusic";
        }
        playlist.children = [];
        playlist.tracks = [];
        try {
          if (trackMap) {
            const tracks = await app.mk.api.v3.music(playlist.href + "/tracks").catch((e) => {
              // no tracks
              e = null;
            });
            tracks.data.data.forEach((track) => {
              if (!trackMapping[track.id]) {
                trackMapping[track.id] = [];
              }
              trackMapping[track.id].push(playlist.id);

              if (typeof track.attributes.playParams.catalogId === "string") {
                if (!trackMapping[track.attributes.playParams.catalogId]) {
                  trackMapping[track.attributes.playParams.catalogId] = [];
                }
                trackMapping[track.attributes.playParams.catalogId].push(playlist.id);
              }
            });
          }
        } catch (e) {
          console.log(e);
        }
        if (playlist.type === "library-playlist-folders") {
          try {
            await deepScan(playlist.id).catch((e) => {});
          } catch (e) {
            console.log(e);
          }
        }
        newListing.push(playlist);
      });
    }

    await deepScan();

    this.library.backgroundNotification.show = false;
    this.playlists.listing = newListing;
    self.sortPlaylists();
    if (trackMap) {
      CiderCache.putCache("library-playlists-tracks", trackMapping);
      this.playlists.trackMapping = trackMapping;
    }
    CiderCache.putCache("library-playlists", newListing);
  },
  sortPlaylists() {
    this.playlists.listing.sort((a, b) => {
      if (a.type === "library-playlist-folders" && b.type !== "library-playlist-folders") {
        return -1;
      } else if (a.type !== "library-playlist-folders" && b.type === "library-playlist-folders") {
        return 1;
      } else {
        return 0;
      }
    });
  },
  playlistHeaderContextMenu(event) {
    const menu = {
      items: [
        {
          name: app.getLz("term.createNewPlaylist"),
          action: () => {
            this.newPlaylist();
          },
        },
        {
          name: app.getLz("term.createNewPlaylistFolder"),
          action: () => {
            this.newPlaylistFolder();
          },
        },
        {
          name: app.getLz("action.refresh"),
          action: () => {
            this.refreshPlaylists();
          },
        },
      ],
    };
    this.showMenuPanel(menu, event);
  },
  async editPlaylistFolder(id, name = app.getLz("term.newPlaylist")) {
    const self = this;
    this.mk.api.v3
      .music(
        `/v1/me/library/playlist-folders/${id}`,
        {},
        {
          fetchOptions: {
            method: "PATCH",
            body: JSON.stringify({
              attributes: { name: name },
            }),
          },
        },
      )
      .then((res) => {
        self.refreshPlaylists(false, false);
      });
  },
  async editPlaylist(id, name = app.getLz("term.newPlaylist")) {
    const self = this;
    this.mk.api.v3
      .music(
        `/v1/me/library/playlists/${id}`,
        {},
        {
          fetchOptions: {
            method: "PATCH",
            body: JSON.stringify({
              attributes: { name: name },
            }),
          },
        },
      )
      .then((res) => {
        self.refreshPlaylists(false, false);
      });
  },
  async editPlaylistDescription(id, name = app.getLz("term.newPlaylist")) {
    const self = this;
    this.mk.api.v3
      .music(
        `/v1/me/library/playlists/${id}`,
        {},
        {
          fetchOptions: {
            method: "PATCH",
            body: JSON.stringify({
              attributes: { description: name },
            }),
          },
        },
      )
      .then((res) => {
        self.refreshPlaylists(false, false);
      });
  },
  copyToClipboard(str) {
    // if (navigator.userAgent.includes('Darwin') || navigator.appVersion.indexOf("Mac") !== -1) {
    // this.darwinShare(str)
    // } else {
    notyf.success(app.getLz("term.share.success"));
    navigator.clipboard.writeText(str).then((r) => console.debug("Copied to clipboard."));
    // }
  },
  newPlaylist(name = app.getLz("term.newPlaylist"), tracks = []) {
    const self = this;
    const request = {
      name: name,
    };
    if (tracks.length > 0) {
      request.tracks = tracks;
    }
    app.mk.api.v3
      .music(
        `/v1/me/library/playlists`,
        {},
        {
          fetchOptions: {
            method: "POST",
            body: JSON.stringify({
              attributes: { name: name },
              relationships: {
                tracks: { data: tracks },
              },
            }),
          },
        },
      )
      .then((res) => {
        res = res.data.data[0];
        console.debug(res);
        self.appRoute(`playlist_` + res.id);
        self.showingPlaylist = [];
        self.getPlaylistFromID(app.page.substring(9), true);
        self.playlists.listing.push({
          id: res.id,
          attributes: {
            name: name,
          },
          parent: "p.playlistsroot",
        });
        self.sortPlaylists();
        setTimeout(() => {
          app.refreshPlaylists(false, false);
        }, 8000);
      });
  },
  deletePlaylist(id) {
    const self = this;
    this.confirm(app.getLz("term.deletePlaylist"), (ok) => {
      if (ok) {
        app.mk.api.v3
          .music(
            `/v1/me/library/playlists/${id}`,
            {},
            {
              fetchOptions: {
                method: "DELETE",
              },
            },
          )
          .then((res) => {
            // remove this playlist from playlists.listing if it exists
            const found = self.playlists.listing.find((item) => item.id === id);
            if (found) {
              self.playlists.listing.splice(self.playlists.listing.indexOf(found), 1);
            }
            setTimeout(() => {
              app.refreshPlaylists(false, false);
            }, 8000);
          });
      }
    });
  },
  /**
   * @param {string} url, href for the initial request
   * @memberof app
   */
  async showRoom(url) {
    const self = this;
    const response = await this.mk.api.v3.music(url);
    const room = response.data.data[0];
    this.showCollection(room.relationships.contents, room.attributes.title);
  },
  async showCollection(response, title, type, requestBody = {}) {
    const self = this;
    console.debug(response);
    this.collectionList.requestBody = {};
    this.collectionList.response = response;
    this.collectionList.title = title;
    this.collectionList.type = type;
    this.collectionList.requestBody = requestBody;
    app.appRoute("collection-list");
  },
  async showArtistView(artist, title, view) {
    const response = (
      await app.mk.api.v3.music(
        `/v1/catalog/${app.mk.storefrontId}/artists/${artist}/view/${view}?l=${this.mklang}`,
        {},
        { includeResponseMeta: !0 },
      )
    ).data;
    console.debug(response);
    await this.showCollection(response, title, "artists");
  },
  async showRecordLabelView(label, title, view) {
    const response = (await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/record-labels/${label}/view/${view}?l=${this.mklang}`))
      .data;
    await this.showCollection(response, title, "record-labels");
  },
  async showSearchView(term, group, title) {
    const requestBody = {
      platform: "web",
      groups: group,
      types:
        "activities,albums,apple-curators,artists,curators,editorial-items,music-movies,music-videos,playlists,songs,stations,tv-episodes,uploaded-videos,record-labels",
      limit: 25,
      relate: {
        editorialItems: ["contents"],
      },
      include: {
        albums: ["artists"],
        songs: ["artists"],
        "music-videos": ["artists"],
      },
      extend: "artistUrl",
      fields: {
        artists: "url,name,artwork,hero",
        albums: "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
      },
      with: "serverBubbles,lyricHighlights",
      art: {
        url: "cf",
      },
      omit: {
        resource: ["autos"],
      },
      l: this.mklang,
    };
    const response = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/search?term=${term}`, requestBody, {
      includeResponseMeta: !0,
    });

    console.debug("searchres", response);
    const responseFormat = {
      data: response.data.results[group].data,
      next: response.data.results[group].next,
      groups: group,
    };
    await this.showCollection(responseFormat, title, "search", requestBody);
  },
  async getPlaylistContinuous(response, transient = false) {
    response = response.data.data[0];
    const self = this;
    const playlistId = response.id;
    this.playlists.loadingState = !transient ? 0 : 1;
    this.showingPlaylist = response;
    if (!response.relationships?.tracks?.next) {
      this.playlists.loadingState = 1;
      return;
    }

    function getPlaylistTracks(next) {
      app.apiCall(app.musicBaseUrl + next, (res) => {
        if (self.showingPlaylist.id !== playlistId) {
          return;
        }
        self.showingPlaylist.relationships.tracks.data = self.showingPlaylist.relationships.tracks.data.concat(res.data);
        if (res.next) {
          getPlaylistTracks(res.next);
        } else {
          self.playlists.loadingState = 1;
        }
      });
    }

    getPlaylistTracks(response.relationships.tracks.next);
  },
  async getPlaylistFromID(id, transient = false) {
    const self = this;
    const params = {
      include: "tracks",
      platform: "web",
      "include[library-playlists]": "catalog,tracks",
      "fields[playlists]": "curatorName,playlistType,name,artwork,url,playParams",
      "include[library-songs]": "catalog,artists,albums,playParams,name,artwork,url",
      "fields[catalog]": "artistUrl,albumUrl,url",
      "fields[songs]": "artistUrl,albumUrl,playParams,name,artwork,url,artistName,albumName,durationInMillis",
      l: this.mklang,
    };
    if (!transient) {
      this.playlists.loadingState = 0;
    }
    app.mk.api.v3
      .music(`/v1/me/library/playlists/${id}`, params)
      .then((res) => {
        self.getPlaylistContinuous(res, transient);
      })
      .catch((e) => {
        console.debug(e);
        try {
          app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/playlists/${id}`, params).then((res) => {
            self.getPlaylistContinuous(res, transient);
          });
        } catch (err) {
          console.debug(err);
        }
      });
  },
  async getArtistFromID(id) {
    this.page = "";
    const artistData = await this.mkapi(
      "artists",
      false,
      id,
      {
        views:
          "featured-release,full-albums,appears-on-albums,featured-albums,featured-on-albums,singles,compilation-albums,live-albums,latest-release,top-music-videos,similar-artists,top-songs,playlists,more-to-hear,more-to-see",
        extend: "centeredFullscreenBackground,artistBio,bornOrFormed,editorialArtwork,editorialVideo,isGroup,origin,hero",
        "extend[playlists]": "trackCount",
        "include[songs]": "albums",
        "fields[albums]":
          "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount",
        "limit[artists:top-songs]": 20,
        "art[url]": "f",
        l: this.mklang,
      },
      { includeResponseMeta: !0 },
    );
    console.debug(artistData.data.data[0]);
    this.artistPage.data = artistData.data.data[0];
    this.page = "artist-page";
  },
  progressBarStyle() {
    let val = this.playerLCD.playbackDuration;
    if (this.playerLCD.desiredDuration > 0) {
      val = this.playerLCD.desiredDuration;
    }
    const min = 0;
    const max = this.mk.currentPlaybackDuration;
    const value = ((val - min) / (max - min)) * 100;
    return {
      background:
        "linear-gradient(to right, var(--songProgressColor) 0%, var(--songProgressColor) " +
        value +
        "%, var(--songProgressBackground) " +
        value +
        "%, var(--songProgressBackground) 100%)",
    };
  },
  async getRecursive(response) {
    // if response has a .next() property run it and keep running until .next is null or undefined
    // and then return the response concatenated with the results of the next() call
    function executeRequest() {
      if (response.next) {
        return response.next().then(executeRequest);
      } else {
        return response;
      }
    }

    return executeRequest();
  },
  async getRecursive2(response, sendTo) {
    const returnData = {
      data: [],
      meta: {},
    };
    if (response.next) {
      console.debug("has next");
      returnData.data.concat(response.data);
      returnData.meta = response.meta;
      return await this.getRecursive(await response.next());
    } else {
      console.debug("no next");
      returnData.data.concat(response.data);
      return returnData;
    }
  },
  async getSearchHints() {
    if (this.search.term === "") {
      this.search.hints = [];
      this.search.showHints = true;
      this.search.showSearchView = false;
      return;
    }
    const hints = await (
      await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/search/suggestions?term=${encodeURIComponent(this.search.term)}`, {
        "fields[albums]": "artwork,name,playParams,url,artistName,id",
        "fields[artists]": "url,name,artwork,id",
        "fields[songs]": "artwork,name,playParams,url,artistName,id",
        kinds: "terms,topResults",
        l: this.mklang,
        "limit[results:terms]": 5,
        "limit[results:topResults]": 5,
        "omit[resource]": "autos",
        platform: "web",
        types: "activities,albums,artists,editorial-items,music-movies,playlists,record-labels,songs,stations",
      })
    ).data.results;
    const shints = hints ? hints.suggestions : [];
    for (const item in shints) {
      if ((shints[item]?.displayTerm ?? "").includes("?fields[")) {
        shints[item].displayTerm = shints[item].searchTerm = shints[item].displayTerm.split("?fields[")[0];
      }
    }
    this.search.hints = shints;
  },
  getSongProgress() {
    if (this.playerLCD.userInteraction) {
      return this.playerLCD.desiredDuration;
    } else {
      return this.playerLCD.playbackDuration;
    }
  },
  /**
   * Converts seconds to dd:hh:mm:ss / Days:Hours:Minutes:Seconds
   * @param {number} seconds
   * @param {string} format (short, long)
   * @returns {string}
   * @author Core#1034
   * @memberOf app
   */
  convertTime(seconds, format = "short") {
    if (app.mk?.nowPlayingItem?.type === "radioStation") return;
    if (isNaN(seconds) || seconds === Infinity) {
      seconds = 0;
    }

    const datetime = new Date(seconds * 1000);

    if (format === "long") {
      const d = Math.floor(seconds / (3600 * 24));
      const h = Math.floor((seconds % (3600 * 24)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);

      const dDisplay = d > 0 ? `${d} ${app.getLz("term.time.day", { count: d })}` : "";
      const hDisplay = h > 0 ? `${h} ${app.getLz("term.time.hour", { count: h })}` : "";
      const mDisplay = m > 0 ? `${m} ${app.getLz("term.time.minute", { count: m })}` : "";

      return dDisplay + (dDisplay && hDisplay ? ", " : "") + hDisplay + (hDisplay && mDisplay ? ", " : "") + mDisplay;
    } else {
      return MusicKit.formatMediaTime(seconds);
    }
  },
  hashCode(str) {
    let hash = 0,
      i,
      chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
  getPagePos(href = "") {
    const state = this.$store.state.pageState.scrollPos.pos.find((page) => {
      return page.href === href;
    });
    return (
      state ?? {
        page: href,
        position: 0,
      }
    );
  },
  appRoute(route) {
    if (route === "" || route === "#" || route === "/") {
      return;
    }
    route = route.replace(/#/g, "");
    if (app.cfg.general.resumeTabs.tab === "dynamic") {
      if (
        route === "home" ||
        route === "listen_now" ||
        route === "browse" ||
        route === "radio" ||
        route === "library-songs" ||
        route === "library-albums" ||
        route === "library-artists" ||
        route === "library-videos" ||
        route === "podcasts"
      ) {
        app.cfg.general.resumeTabs.dynamicData = route;
      } else {
        app.cfg.general.resumeTabs.dynamicData = "home";
      }
    }

    // if the route contains does not include a / then route to the page directly
    if (route.indexOf("/") === -1) {
      this.page = route;
      window.location.hash = this.page;
      this.resumePagePos();
      // if (this.page === "settings") {
      //     this.version
      // }
      return;
    }
    const hash = route.split("/");
    const page = hash[0];
    const id = hash[1];
    const isLibrary = hash[2] ?? false;
    if (page === "plugin") {
      this.pluginPages.page = "plugin." + id;
      this.page = "plugin-renderer";
      return;
    }
    this.routeView({
      kind: page,
      id: id,
      attributes: {
        playParams: { kind: page, id: id, isLibrary: isLibrary },
      },
    });
  },
  resumePagePos() {
    setTimeout(() => {
      $("#app-content").scrollTop(app.getPagePos(window.location.hash).position);
    }, 100);
  },
  setPagePos() {
    try {
      console.debug({
        href: window.location.hash,
        position: $("#app-content").scrollTop(),
      });
      this.$store.commit("setPagePos", {
        href: window.location.hash,
        position: $("#app-content").scrollTop(),
      });
    } catch (e) {
      console.log(e);
    }
  },
  routeView(item) {
    this.setPagePos();
    let kind = item.attributes?.playParams ? (item.attributes?.playParams?.kind ?? item.type ?? "") : (item.type ?? "");
    let id = item.attributes?.playParams ? (item.attributes?.playParams?.id ?? item.id ?? "") : (item.id ?? "");
    const isLibrary = item.attributes?.playParams ? (item.attributes?.playParams?.isLibrary ?? false) : false;
    if (kind.includes("playlist") || kind.includes("album")) {
      app.showingPlaylist = [];
    }
    if (kind.toString().includes("apple-curator")) {
      kind = "appleCurator";
      app
        .getTypeFromID("appleCurator", id, false, {
          platform: "web",
          include: "grouping,playlists",
          extend: "editorialArtwork",
          "art[url]": "f",
        })
        .then(() => {
          kind = "appleCurator";
          window.location.hash = `${kind}/${id}`;
        });
    } else if (kind === "editorial-elements" || kind === "editorial-items") {
      console.debug(item);
      if (item.relationships?.contents?.data !== null && item.relationships?.contents?.data.length > 0) {
        this.routeView(item.relationships.contents.data[0]);
      } else if (item.attributes?.link?.url !== null) {
        if (item.attributes.link.url.includes("viewMultiRoom") || item.attributes.link.url.includes("/collection/")) {
          const params = new Proxy(new URLSearchParams(new URL(item.attributes.link.url).search), {
            get: (searchParams, prop) => searchParams.get(prop),
          });
          id = params.fcId;
          kind = "multiroom";
          if (item.attributes.link.url.includes("viewMultiRoom")) {
            kind = "multiroom";
          } else {
            kind = "room";
          }
          app
            .getTypeFromID(kind, id, false, {
              platform: "web",
              extend: "editorialArtwork,uber,lockupStyle",
            })
            .then(() => {
              kind = "multiroom";
              window.location.hash = `${kind}/${id}`;
            });

          return;
        } else if (item.attributes.link.url.includes("viewFeature")) {
          const params = new Proxy(new URLSearchParams(new URL(item.attributes.link.url).search), {
            get: (searchParams, prop) => searchParams.get(prop),
          });
          id = params.id;
          app.mk.api.v3
            .music(`/v1/editorial/${app.mk.storefrontId}/multiplex/${id}?art%5Burl%5D=f&format%5Bresources%5D=map&platform=web`)
            .then((data) => {
              const item = data.data.results?.target ?? [];
              app.routeView(item);
            });
        } else {
          window.open(item.attributes.link.url);
        }
      }
    } else if (kind === "multiplex") {
      app.mk.api.v3
        .music(`/v1/editorial/${app.mk.storefrontId}/multiplex/${id}?art%5Burl%5D=f&format%5Bresources%5D=map&platform=web`)
        .then((data) => {
          const item = data.data.results?.target ?? [];
          app.routeView(item);
        });
    }
    if (kind === "multirooms") {
      app
        .getTypeFromID("multiroom", id, false, {
          platform: "web",
          extend: "editorialArtwork,uber,lockupStyle",
        })
        .then(() => {
          kind = "multiroom";
          window.location.hash = `${kind}/${id}`;
          // document.querySelector("#app-content").scrollTop = 0;
        });
      this.resumePagePos();
    } else if (kind.toString().includes("artist")) {
      app.getArtistInfo(id, isLibrary);
      window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ""}`;
      // document.querySelector("#app-content").scrollTop = 0;
    } else if (kind.toString().includes("record-label") || kind.toString().includes("curator")) {
      if (kind.toString().includes("record-label")) {
        kind = "recordLabel";
      } else {
        kind = "curator";
      }
      app.page = kind + "_" + id;
      app.getTypeFromID(kind, id, isLibrary, {
        extend: "editorialVideo",
        include: "grouping,playlists",
        views: "top-releases,latest-releases,top-artists",
      });
      window.location.hash = `${kind}/${id}`;
      document.querySelector("#app-content").scrollTop = 0;
      this.resumePagePos();
    } else if (kind.toString().includes("social-profiles")) {
      app.page = kind + "_" + id;
      app.mk.api.v3
        .music(`/v1/social/${app.mk.storefrontId}/social-profiles/${id}`, {
          include: "shared-playlists",
        })
        .then((data) => {
          console.log(data);
          app.showingPlaylist = data.data?.data[0];
          window.location.hash = `${kind}/${id}`;
          document.querySelector("#app-content").scrollTop = 0;
        });
      // app.getTypeFromID((kind), (id), (isLibrary), {
      //     extend: "editorialVideo",
      //     include: 'grouping,playlists',
      //     views: 'top-releases,latest-releases,top-artists'
      // });
    } else if (
      !kind.toString().includes("radioStation") &&
      !kind.toString().includes("song") &&
      !kind.toString().includes("musicVideo") &&
      !kind.toString().includes("uploadedVideo") &&
      !kind.toString().includes("music-movie")
    ) {
      const params = {
        extend: "offers,editorialVideo",
        views: "appears-on,more-by-artist,related-videos,other-versions,you-might-also-like,video-extras,audio-extras",
      };
      if (kind.includes("playlist")) {
        params["include"] = "tracks";
      }
      if (kind.includes("album")) {
        params["include[albums]"] = "artists";
        params["fields[artists]"] = "name,url";
        params["omit[resource]"] = "autos";
        params["meta[albums:tracks]"] = "popularity";
        params["fields[albums]"] =
          "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialNotes,editorialVideo,name,playParams,releaseDate,url,copyright,genreNames";
      }
      if (kind.includes("playlist") || kind.includes("album")) {
        app.page = kind + "_" + id;
        window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ""}`;
        app.getTypeFromID(kind, id, isLibrary, params);
      } else {
        app.page = kind;
        window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ""}`;
      }
      this.resumePagePos();
      // app.getTypeFromID((kind), (id), (isLibrary), params);
    } else if (kind.toString().includes("song")) {
      const albumUrl = new Promise(async (resolve, reject) => {
        resolve(await MusicKitInterop.fetchSongRelationships({ id: id, relationship: "album" }));
      });
      albumUrl.then((data) => {
        if (data && data.type === "albums" && data.id) {
          window.location.hash = `album/${data.id}${isLibrary ? "/" + isLibrary : ""}`;
        } else {
          app.playMediaItemById(id, kind, isLibrary, item.attributes.url ?? "");
        }
      });
    } else {
      app.playMediaItemById(id, kind, isLibrary, item.attributes.url ?? "");
    }
  },
};

export default { helpers };
