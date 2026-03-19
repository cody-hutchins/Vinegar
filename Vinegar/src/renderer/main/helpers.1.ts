import { notyf } from "..";

const helpers = {
  _fetch(url, opts = {}) {
    if (app.cfg.advanced.experiments.includes("cider_mirror")) {
      if (url.includes("api.github.com/")) {
        return fetch(url.replace("api.github.com/", "mirror.api.cider.sh/v2/api/"), opts);
      } else if (url.includes("raw.githubusercontent.com/")) {
        return fetch(url.replace("raw.githubusercontent.com/", "mirror.api.cider.sh/v2/raw/"), opts);
      } else {
        return fetch(url, opts);
      }
    } else {
      return fetch(url, opts);
    }
  },
  setWindowHash(route = "") {
    this.setPagePos();
    window.location.hash = `#${route}`;
  },
  monitorMusickit() {
    if (!app.cfg.musickit) return;

    for (const [attr, value] of Object.entries(app.cfg.musickit["stored-attributes"])) {
      console.log(`Musickit value: ` + app.mk[attr]);
      console.log(`Config value: ` + value);
      if (value !== "" && app.mk[attr] !== value) {
        app.mk[attr] = value;
      }
      this.$watch(`mk.${attr}`, (val) => {
        console.log(`MK ${attr} changed to ${val}`);
        app.cfg.musickit["stored-attributes"][attr] = val;
      });
    }
    const ERROR_CODES = ["drmUnsupported", "mediaPlaybackError"];
    /* MusicKit.Events */
    ERROR_CODES.forEach((code) => {
      MusicKit.getInstance().addEventListener(MusicKit.Events[code], (e) => {
        console.error(`[MusicKit] MusicKit Error ${code}`);
        console.error({ e: e });
        app.notyf.open({
          duration: 20000,
          type: "error",
          className: "notyf-info",
          message: `<small>${app.getLz("error.musickitError")} \n</small><code>${code.toUpperCase()}</code>`,
        });
      });
    });
  },
  async oobeInit() {
    this.appMode = "oobe";
    for (const [k, v] of Object.entries(window.electronAPI.sendSync("get-i18n-listing"))) {
      if (v.code === navigator.language.replace("-", "_")) {
        this.cfg.general.language = v.code;
        break;
      }
    }
    this.setLz(this.cfg.general.language);
    this.setLzManual();
    clearTimeout(this.hangtimer);
    document.body.removeAttribute("loading");
    await window.electronAPI.invoke("renderer-ready", true);
    document.querySelector("#LOADER").remove();

    window.electronAPI.on("recv-cookies", function (_event, cookies) {
      console.log("[appIPC] recv-cookies");
      Object.keys(cookies).forEach((key) => {
        localStorage.setItem(key, cookies[key]);
      });
      localStorage.setItem("seenOOBE", 1);
      window.location.reload();
    });
  },
  getAppStyle() {
    const finalStyle: Record<string, any> = {};
    if (this.cfg.visual.window_background_style === "color") {
      finalStyle["background-color"] = this.cfg.visual.windowColor;
    }
    if (this.cfg.visual.customAccentColor) {
      finalStyle["--keyColor"] = this.cfg.visual.accentColor;
      finalStyle["--songProgressColor"] = this.cfg.visual.accentColor;
    } else if (this.cfg.visual.purplePodcastPlaybackBar && MusicKit.getInstance().nowPlayingItem?.type === "podcast-episodes") {
      finalStyle["--songProgressColor"] = "#6929D0";
    }
    return finalStyle;
  },
  songLinkShare(amUrl) {
    notyf.open({
      type: "info",
      className: "notyf-info",
      message: app.getLz("term.song.link.generate"),
    });
    const self = this;
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", `https://api.song.link/v1-alpha.1/links?url=${amUrl}&userCountry=US`, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          const response = JSON.parse(httpRequest.responseText);
          console.debug(response);
          self.copyToClipboard(response.pageUrl);
        } else {
          console.warn("There was a problem with the request.");
          notyf.error(app.getLz("term.requestError"));
        }
      }
    };
  },
  formatVolumeTooltip() {
    const advancedTooltip = this.cfg.audio.dBSPL
      ? (Number(this.cfg.audio.dBSPLcalibration) + Math.log10(this.mk.volume) * 20).toFixed(2) + " dB SPL"
      : (Math.log10(this.mk.volume) * 20).toFixed(2) + " dBFS";
    return this.cfg.audio.advanced ? advancedTooltip : (this.mk.volume * 100).toFixed(0) + "%";
  },
  mainMenuVisibility(val) {
    if (val) {
      this.mk.isAuthorized ? (this.chrome.menuOpened = !this.chrome.menuOpened) : false;
      if (!this.mk.isAuthorized) {
        window.electronAPI.send("auth-window");
      }
    } else {
      setTimeout(() => {
        this.chrome.menuOpened = false;
      }, 100);
    }
  },
  stringTemplateParser(expression, valueObj) {
    const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
    const text = expression.replace(templateMatcher, (substring, value, index) => {
      value = valueObj[value];
      return value;
    });
    return text;
    // stringTemplateParser('my name is {{name}} and age is {{age}}', {name: 'Tom', age:100})
  },
  async setLz(lang) {
    if (lang === "") {
      lang = this.cfg.general.language;
    }
    this.lz = window.electronAPI.sendSync("get-i18n", lang);
    this.mklang = await this.MKJSLang();
    try {
      this.listennow.timestamp = 0;
      this.browsepage.timestamp = 0;
      this.radio.timestamp = 0;
    } catch (e) {
      console.log(e);
    }
  },
  /**
   * Grabs translation for localization.
   * @param {string} message - The key to grab the translated term
   * @param {object} options - Optional options
   * @author booploops#7139
   * @memberOf app
   */
  getLz(message, options = {}) {
    if (this.lz[message]) {
      if (options["count"]) {
        if (typeof this.lz[message] === "object") {
          const type = window.fastPluralRules.getPluralFormNameForCardinalByLocale(
            this.cfg.general.language.replace("_", "-"),
            options["count"],
          );
          return this.lz[message][type] ?? this.lz[message][Object.keys(this.lz[message])[0]] ?? this.lz[message];
        } else {
          // fallback English plural forms ( old i18n )
          if (options["count"] > 1) {
            return this.lz[message + "s"] ?? this.lz[message];
          } else {
            return this.lz[message] ?? this.lz[message + "s"];
          }
        }
      } else if (typeof this.lz[message] === "object") {
        return this.lz[message][Object.keys(this.lz[message])[0]];
      }
      return this.lz[message];
    } else {
      return message;
    }
  },
  getProfileLz(type, name) {
    // For Spatial and CAR.
    let result = "";

    // Hard-coded shiz
    switch (name) {
      case "Maikiwi":
        return "Maikiwi";
        break;

      case "Maikiwi+":
        return "Maikiwi+";
        break;

      case "Minimal+":
        return this.getLz("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.minimal") + "+";
        break;

      case "live":
        return "LIVE";
        break;
    }
    switch (type) {
      case "CAR":
        result = this.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode." + name);
        if (result === "settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode." + name) {
          return name;
        } else {
          return result;
        }
        break;
      case "CTS":
        result = this.getLz("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile." + name.toLowerCase());
        if (result === "settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile." + name.toLowerCase()) {
          return name;
        } else {
          return result;
        }
        break;
      default:
        return name;
    }
  },
  setLzManual() {
    app.$data.library.songs.sortingOptions = {
      albumName: app.getLz("term.sortBy.album"),
      artistName: app.getLz("term.sortBy.artist"),
      name: app.getLz("term.sortBy.name"),
      genre: app.getLz("term.sortBy.genre"),
      releaseDate: app.getLz("term.sortBy.releaseDate"),
      durationInMillis: app.getLz("term.sortBy.duration"),
      dateAdded: app.getLz("term.sortBy.dateAdded"),
    };

    app.$data.library.albums.sortingOptions = {
      artistName: app.getLz("term.sortBy.artist"),
      name: app.getLz("term.sortBy.name"),
      genre: app.getLz("term.sortBy.genre"),
      releaseDate: app.getLz("term.sortBy.releaseDate"),
      dateAdded: app.getLz("term.sortBy.dateAdded"),
    };

    app.$data.library.artists.sortingOptions = {
      artistName: app.getLz("term.sortBy.artist"),
      name: app.getLz("term.sortBy.name"),
      genre: app.getLz("term.sortBy.genre"),
      releaseDate: app.getLz("term.sortBy.releaseDate"),
    };

    this.lz.repeat = {
      0: this.lz["term.repeat.all"] ?? this.lz["term.repeat"],
      1: this.lz["term.repeat.none"] ?? this.lz["term.disableRepeat"],
      2: this.lz["term.repeat.one"] ?? this.lz["term.enableRepeatOne"],
    };
  },
  async showSocialListeningTo() {
    const contentIds = Object.keys(app.socialBadges.badgeMap);
    app.showCollection({ data: this.socialBadges.mediaItems }, "Friends Listening To", "albums");
    if (this.socialBadges.mediaItemDLState === 1 || this.socialBadges.mediaItemDLState === 2) {
      return;
    }
    this.socialBadges.mediaItemDLState = 2;
    await asyncForEach(contentIds, async (item) => {
      try {
        let type = "albums";
        if (item.includes("pl.")) {
          type = "playlists";
        }
        if (item.includes("ra.")) {
          type = "stations";
        }
        const found = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/${type}/${item}`);
        this.socialBadges.mediaItems.push(found.data.data[0]);
      } catch (e) {
        console.log(e);
      }
    });
  },
  quit() {
    await window.electronAPI.invoke("quit-app");
  },
  async openAppleMusicURL(url) {
    const properties = MusicKit.formattedMediaURL(url);
    const item = {
      id: properties.contentId,
      attributes: {
        playParams: {
          id: properties.contentId,
          kind: properties.kind,
        },
      },
      type: properties.kind,
      kind: properties.kind,
    };
    app.routeView(item);
  },
  saveFile(fileName, urlFile) {
    const a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    a.href = urlFile;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
  async showMenuPanel(data, event) {
    app.menuPanel.visible = true;
    app.menuPanel.content.name = data.name ?? "";
    app.menuPanel.content.items = data.items ?? {};
    app.menuPanel.content.headerItems = data.headerItems ?? {};
    if (event) {
      app.menuPanel.event = event;
    }
  },
  async getSvgIcon(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
  },
  getSocialBadges(cb = () => {}) {
    const self = this;
    try {
      app.mk.api.v3.music("/v1/social/badging-map").then((data) => {
        self.socialBadges.badgeMap = data.data.results.badgingMap;
        cb(data.data.results.badgingMap);
      });
    } catch (ex) {
      this.socialBadges.badgeMap = {};
    }
  },
  addFavorite(id, type) {
    this.cfg.home.favoriteItems.push({
      id: id,
      type: type,
    });
  },
  modularUITest(val = false) {
    this.fullscreenLyrics = val;
    if (val) {
      document.querySelector("#app-main").classList.add("modular-fs");
    } else {
      document.querySelector("#app-main").classList.remove("modular-fs");
    }
  },
  navigateBack() {
    this.setPagePos();
    this.resumePagePos();
    this.chrome.desiredPageTransition = "wpfade_transform_backwards";
    return new Promise((resolve, reject) => {
      history.back();
      setTimeout(() => {
        resolve((this.chrome.desiredPageTransition = "wpfade_transform"));
      }, 100);
    });
  },
  goToGrouping(url = "https://music.apple.com/WebObjects/MZStore.woa/wa/viewGrouping?cc=us&id=34") {
    this.setPagePos();
    this.resumePagePos();
    if (url.includes("viewTop")) {
      window.location.hash = `#charts/top`;
    } else {
      const id = url.split("id=")[1];
      if (id !== null) {
        window.location.hash = `#groupings/${id}`;
      } else {
        const params = new Proxy(new URLSearchParams(new URL(url).search), {
          get: (searchParams, prop) => searchParams.get(prop),
        });
        const id = params.fcId;
        app
          .getTypeFromID("room", id, false, {
            platform: "web",
            extend: "editorialArtwork,uber,lockupStyle",
          })
          .then(() => {
            const kind = "multiroom";
            window.location.hash = `${kind}/${id}`;
            document.querySelector("#app-content").scrollTop = 0;
          });
      }
    }
  },
  navigateForward() {
    this.setPagePos();
    this.resumePagePos();
    history.forward();
  },
  resetState() {
    this.menuPanel.visible = false;
    app.selectedMediaItems = [];
    this.chrome.contentAreaScrolling = true;
    for (const key in app.modals) {
      app.modals[key] = false;
    }
  },
  resumeTabs() {
    if (app.cfg.general.resumeTabs.tab === "dynamic") {
      this.appRoute(app.cfg.general.resumeTabs.dynamicData);
    } else {
      this.appRoute(app.cfg.general.resumeTabs.tab);
    }
  },
  promptAddToPlaylist() {
    app.modals.addToPlaylist = true;
  },
  async addSelectedToNewPlaylist() {
    const self = this;
    let pl_items = [];
    for (let i = 0; i < self.selectedMediaItems.length; i++) {
      if (self.selectedMediaItems[i].kind === "song" || self.selectedMediaItems[i].kind === "songs") {
        self.selectedMediaItems[i].kind = "songs";
        pl_items.push({
          id: self.selectedMediaItems[i].id,
          type: self.selectedMediaItems[i].kind,
        });
      } else if (
        (self.selectedMediaItems[i].kind === "album" || self.selectedMediaItems[i].kind === "albums") &&
        !self.selectedMediaItems[i].isLibrary
      ) {
        self.selectedMediaItems[i].kind = "albums";
        const res = await self.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/albums/${self.selectedMediaItems[i].id}/tracks`);
        const ids = res.data.data.map(function (i) {
          return { id: i.id, type: i.type };
        });
        pl_items = pl_items.concat(ids);
      } else if (self.selectedMediaItems[i].kind === "library-song" || self.selectedMediaItems[i].kind === "library-songs") {
        self.selectedMediaItems[i].kind = "library-songs";
        pl_items.push({
          id: self.selectedMediaItems[i].id,
          type: self.selectedMediaItems[i].kind,
        });
      } else if (
        self.selectedMediaItems[i].kind === "library-album" ||
        self.selectedMediaItems[i].kind === "library-albums" ||
        (self.selectedMediaItems[i].kind === "album" && self.selectedMediaItems[i].isLibrary)
      ) {
        self.selectedMediaItems[i].kind = "library-albums";
        const res = await self.mk.api.v3.music(`/v1/me/library/albums/${self.selectedMediaItems[i].id}/tracks`);
        const ids = res.data.data.map(function (i) {
          return { id: i.id, type: i.type };
        });
        pl_items = pl_items.concat(ids);
      } else {
        pl_items.push({
          id: self.selectedMediaItems[i].id,
          type: self.selectedMediaItems[i].kind,
        });
      }
    }
    this.modals.addToPlaylist = false;
    app.newPlaylist(app.getLz("term.newPlaylist"), pl_items);
  },
  async isSongInPlaylist(song_ids, playlist_id) {
    let isInPlaylist = false;
    const playlistTracks = (
      await app.mk.api.v3.music(`/v1/me/library/playlists/${playlist_id}/tracks`, {
        platform: "web",
        l: app.mklang,
      })
    ).data?.data;

    playlistTracks.forEach((track) => {
      if (song_ids.includes(track.id)) {
        isInPlaylist = true;
      }
    });
    return isInPlaylist;
  },
  addToPlaylist(pid, pitems) {
    app.mk.api.v3
      .music(
        `/v1/me/library/playlists/${pid}/tracks`,
        {},
        {
          fetchOptions: {
            method: "POST",
            body: JSON.stringify({
              data: pitems,
            }),
          },
        },
      )
      .then(() => {
        if (app.page === "playlist_" + pid) {
          app.getPlaylistFromID(app.showingPlaylist.id, true);
        }
      });
  },
  async addSelectedToPlaylist(playlist_id) {
    const self = this;
    let pl_items = [];
    const song_ids = [];
    for (let i = 0; i < self.selectedMediaItems.length; i++) {
      if (self.selectedMediaItems[i].kind === "song" || self.selectedMediaItems[i].kind === "songs") {
        self.selectedMediaItems[i].kind = "songs";
        pl_items.push({
          id: self.selectedMediaItems[i].id,
          type: self.selectedMediaItems[i].kind,
        });
        song_ids.push(self.selectedMediaItems[i].id);
      } else if (
        (self.selectedMediaItems[i].kind === "album" || self.selectedMediaItems[i].kind === "albums") &&
        !self.selectedMediaItems[i].isLibrary
      ) {
        self.selectedMediaItems[i].kind = "albums";
        const res = await self.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/albums/${self.selectedMediaItems[i].id}/tracks`);
        const ids = res.data.data.map(function (i) {
          return { id: i.id, type: i.type };
        });
        pl_items = pl_items.concat(ids);
        song_ids.push(...ids.map((id) => id.id));
      } else if (self.selectedMediaItems[i].kind === "library-song" || self.selectedMediaItems[i].kind === "library-songs") {
        self.selectedMediaItems[i].kind = "library-songs";
        pl_items.push({
          id: self.selectedMediaItems[i].id,
          type: self.selectedMediaItems[i].kind,
        });
        song_ids.push(self.selectedMediaItems[i].id);
      } else if (
        self.selectedMediaItems[i].kind === "library-album" ||
        self.selectedMediaItems[i].kind === "library-albums" ||
        (self.selectedMediaItems[i].kind === "album" && self.selectedMediaItems[i].isLibrary)
      ) {
        self.selectedMediaItems[i].kind = "library-albums";
        const res = await self.mk.api.v3.music(`/v1/me/library/albums/${self.selectedMediaItems[i].id}/tracks`);
        const ids = res.data.data.map(function (i) {
          return { id: i.id, type: i.type };
        });
        pl_items = pl_items.concat(ids);
        song_ids.push(...ids.map((id) => id.id));
      } else {
        pl_items.push({
          id: self.selectedMediaItems[i].id,
          type: self.selectedMediaItems[i].kind,
        });
        song_ids.push(self.selectedMediaItems[i].id);
      }
    }
    this.modals.addToPlaylist = false;

    if (await this.isSongInPlaylist(song_ids, playlist_id)) {
      app.confirm(app.getLz("action.addToPlaylist.duplicate"), (result) => {
        if (result) {
          app.addToPlaylist(playlist_id, pl_items);
        }
      });
    } else {
      app.addToPlaylist(playlist_id, pl_items);
    }
  },
  async init() {
    const self = this;
    if (!localStorage.getItem("seenOOBE")) {
      localStorage.setItem("seenOOBE", 1);
    }
    if (this.cfg.visual.styles.length !== 0) {
      await this.reloadStyles();
    }

    if (this.platform === "darwin") {
      this.chrome.windowControlPosition = "left";
    }

    if (this.cfg.visual.nativeTitleBar) {
      this.chrome.nativeControls = true;
    }

    this.setLz(this.cfg.general.language);
    this.setLzManual();
    clearTimeout(this.hangtimer);
    this.mk = MusicKit.getInstance();
    const needsReload = typeof localStorage["music.ampwebplay.media-user-token"] === "undefined";
    if (needsReload) {
      window.electronAPI.send("auth-window");
      this.mkIsReady = true;
    }
    // this.mk.authorize().then(() => {
    //   self.mkIsReady = true;
    //   if (needsReload) {
    //     document.location.reload();
    //   }
    // });
    this.$forceUpdate();
    if (this.isDev) {
      this.mk.privateEnabled = true;
      // Hide UserInfo if Dev mode
    } else {
      // Get Hide User from Settings
      this.chrome.hideUserInfo = !this.cfg.visual.showuserinfo;
      this.mk.privateEnabled = this.cfg.general.privateEnabled;
    }
    if (this.cfg.visual.hw_acceleration === "disabled") {
      document.body.classList.add("no-gpu");
    }
    this.mk._services.timing.mode = 0;
    this.platform = this.cfg.main.PLATFORM;

    this.mklang = await this.MKJSLang();
    this.mk._playbackController._storekit.overrideRestrictEnabled(false);
    try {
      // Set profile name
      this.chrome.userinfo = (await app.mk.api.v3.music(`/v1/me/social-profile`)).data.data[0];
      // check if this.chrome.userinfo.attributes.artwork exists
      if (this.chrome.userinfo.attributes.artwork && !this.chrome.hideUserInfo) {
        document.documentElement.style.setProperty(
          "--cvar-userprofileimg",
          `url("${this.getMediaItemArtwork(this.chrome.userinfo.attributes.artwork.url)}")`,
        );
      }
    } catch (e) {
      console.log(e);
    }

    // Used to get a scale factor for the window for CSS scaling
    window.addEventListener("resize", (e) => this.setWindowScaleFactor());
    this.setWindowScaleFactor();
    this.mk._bag.features["seamless-audio-transitions"] = this.cfg.audio.seamless_audio;
    this.mk._bag.features["broadcast-radio"] = true;
    this.mk._services.apiManager.store.storekit._restrictedEnabled = false;
    // API Fallback
    if (!this.chrome.userinfo) {
      this.chrome.userinfo = {
        id: "",
        attributes: {
          name: "Cider User",
          handle: "CiderUser",
          artwork: { url: "./assets/logocut.png" },
        },
      };
    }
    MusicKitInterop.init();
    this.monitorMusickit();
    // Set the volume

    // Check the value of this.cfg.audio.muted
    if (!this.cfg.audio.muted) {
      // Set the mk.volume to the last stored volume data
      this.mk.volume = this.cfg.audio.volume;
    } else if (this.cfg.audio.muted) {
      // Set mk.volume to -1 (setting to 0 wont work, so temp solution setting to -1)
      this.mk.volume = -1;
    }

    // Restore mk

    // load cached library
    const librarySongs = await CiderCache.getCache("library-songs");
    const libraryAlbums = await CiderCache.getCache("library-albums");
    if (librarySongs) {
      this.library.songs.listing = librarySongs;
      this.library.songs.displayListing = this.library.songs.listing;
    }
    if (libraryAlbums) {
      this.library.albums.listing = libraryAlbums;
      this.library.albums.displayListing = this.library.albums.listing;
    }

    if (typeof MusicKit.PlaybackBitrate[app.cfg.audio.quality] !== "string") {
      app.mk.bitrate = MusicKit.PlaybackBitrate[app.cfg.audio.quality];
    } else {
      app.mk.bitrate = 256;
      app.cfg.audio.quality = "HIGH";
    }

    switch (this.cfg.general.resumeOnStartupBehavior) {
      default:
      case "local":
        // load last played track
        try {
          let lastItem = window.localStorage.getItem("currentTrack");
          const time = window.localStorage.getItem("currentTime");
          let queue = window.localStorage.getItem("currentQueue");
          app.mk.queue.position = 0; // Reset queue position.
          if (lastItem !== null) {
            lastItem = JSON.parse(lastItem);
            const kind = lastItem.attributes.playParams.kind;
            const truekind = !kind.endsWith("s") ? kind + "s" : kind;
            app.mk.setQueue({
              [truekind]: [lastItem.attributes.playParams.id],
              parameters: { l: app.mklang },
            });
            app.mk.mute();
            setTimeout(() => {
              app.mk.play().then(() => {
                app.mk.pause().then(() => {
                  if (time !== null) {
                    app.mk.seekToTime(time);
                  }
                  app.mk.unmute();
                  if (queue !== null) {
                    queue = JSON.parse(queue);
                    if (queue && queue.length > 0) {
                      const ids = queue.map((e) =>
                        e.playParams ? e.playParams.id : e.item.attributes.playParams ? e.item.attributes.playParams.id : "",
                      );
                      let i = 0;
                      if (ids.length > 0) {
                        for (const id of ids) {
                          if (!(i === 0 && ids[0] === lastItem.attributes.playParams.id)) {
                            try {
                              app.mk.playLater({ songs: [id] });
                            } catch (e) {
                              console.log(e);
                            }
                          }
                          i++;
                        }
                      }
                    }
                  }
                });
              });
            }, 1500);
          }
        } catch (e) {
          console.log(e);
        }
        break;
      case "history":
        const history = await app.mk.api.v3.music(`/v1/me/recent/played/tracks`, { l: app.mklang });
        if (history.data.data.length > 0) {
          const lastItem = history.data.data[0];
          const kind = lastItem.attributes.playParams.kind;
          const truekind = !kind.endsWith("s") ? kind + "s" : kind;
          app.mk.setQueue({
            [truekind]: [lastItem.attributes.playParams.id],
            parameters: { l: app.mklang },
          });
          app.mk.mute();
          setTimeout(() => {
            app.mk.play().then(() => {
              app.mk.pause().then(() => {
                app.mk.unmute();
              });
            });
          }, 1500);
        }

        break;
      case "disabled":
        break;
    }

    MusicKit.getInstance().videoContainerElement = document.getElementById("apple-music-video-player");

    window.electronAPI.on("setStoreValue", (e, key, value) => {
      app.cfg[key] = value;
    });

    window.electronAPI.on("theme-update", async (event, arg) => {
      await less.refresh(true, true, true);
      self.setTheme(self.cfg.visual.theme, true);
      if (app.cfg.visual.styles.length !== 0) {
        app.reloadStyles();
      }
    });

    /**
     * DiscordRPC Reload Return Event
     * @author @coredev-uk
     */
    window.electronAPI.on("rpcReloaded", (e, user) => {
      if (user.username) {
        app.notyf.success(
          app.stringTemplateParser(app.getLz("settings.option.connectivity.discordRPC.reconnectedToUser"), {
            user: `${user.username}#${user.discriminator}`,
            userid: user.id,
          }),
        );
      }
    });

    window.electronAPI.on("getUpdatedLocalList", (event, data) => {
      // console.log("cider-local", data);
      this.library.localsongs = data;
    });

    window.electronAPI.on("window-state-changed", (event, data) => {
      this.chrome.windowState = data;
    });

    window.electronAPI.on("SoundCheckTag", (event, tag) => {
      // let replaygain = self.parseSCTagToRG(tag)
      try {
        if (app.mk.nowPlayingItem.type !== "song") {
          CiderAudio.audioNodes.gainNode.gain.value = 0.70794578438;
        } else {
          const soundcheck = tag.split(" ");
          const numbers = [];
          for (const item of soundcheck) {
            numbers.push(parseInt(item, 16));
          }
          numbers.shift();
          const peak = Math.max(numbers[6], numbers[7]) / 32768.0;
          const gain = Math.pow(10, (-1.7 - Math.log10(peak) * 20) / 20); // EBU R 128 Compliant
          console.debug(
            `[Cider][MaikiwiSoundCheck] Peak Gain: '${(Math.log10(peak) * 20).toFixed(2)}' dB | Adjusting '${(Math.log10(gain) * 20).toFixed(2)}' dB`,
          );
          try {
            //CiderAudio.audioNodes.gainNode.gain.value = (Math.min(Math.pow(10, (replaygain.gain / 20)), (1 / replaygain.peak)))
            CiderAudio.audioNodes.gainNode.gain.value = gain;
            CiderAudio.hierarchical_loading();
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        try {
          window.electronAPI.send("SoundCheckTag", event, tag);
        } catch (e) {
          try {
            window.electronAPI.send("SoundCheckTag", event, tag);
          } catch (e) {
            console.log("[Cider][MaikiwiSoundCheck] Error [Gave up after 3 consecutive attempts]: " + e);
          }
        }
      } // brute force until it works
    });

    window.electronAPI.on("play", function (_event, mode, id) {
      if (mode !== "url") {
        self.mk.setQueue({ [mode]: id, parameters: { l: self.mklang } }).then(() => {
          app.mk.play();
        });
      } else {
        app.openAppleMusicURL(id);
      }
    });

    this.mk.addEventListener(MusicKit.Events.playbackStateDidChange, (event) => {
      window.electronAPI.send("wsapi-updatePlaybackState", wsapi.getAttributes());
      document.body.setAttribute("playback-state", event.state === 2 ? "playing" : "paused");
    });

    this.mk.addEventListener(MusicKit.Events.playbackTimeDidChange, (a) => {
      // self.lyriccurrenttime = self.mk.currentPlaybackTime - app.lyricOffset
      this.currentSongInfo = a;
      self.playerLCD.playbackDuration = self.mk.currentPlaybackTime;
      // wsapi
      window.electronAPI.send("wsapi-updatePlaybackState", wsapi.getAttributes());
    });

    this.mk.addEventListener(MusicKit.Events.queueItemsDidChange, () => {
      if (self.$refs.queue || self.$refs.fsView?.$refs?.queue) {
        setTimeout(() => {
          if (self.$refs.fsView?.$refs?.queue) {
            self.$refs.fsView?.$refs?.queue.updateQueue();
          }
          if (self.$refs?.queue) {
            self.$refs.queue.updateQueue();
          }
        }, 100);
      }
    });

    // Used for Live Radio stations to set Metadata
    this.mk.addEventListener(MusicKit.Events.timedMetadataDidChange, (e) => {
      app.mk.nowPlayingItem.attributes.name = e.title;
      app.mk.nowPlayingItem.attributes.artistName = e.performer;
      app.mk.nowPlayingItem.attributes.albumName = e.album;
      if (e.links[1]) {
        app.currentArtUrl = e.links[1].url;
        app.currentArtUrlRaw = e.links[1].url;
      } else {
        app.currentArtUrl = e.links[0].url;
        app.currentArtUrlRaw = e.links[0].url;
      }
      app.mk.nowPlayingItem._songId = e._adamId ? e._adamId : -1;
      app.mk.nowPlayingItem.id = e._adamId ? e._adamId : -1;
    });

    this.mk.addEventListener(MusicKit.Events.nowPlayingItemDidChange, (a) => {
      if (self.$refs.fsView?.$refs?.queue) {
        self.$refs.fsView?.$refs?.queue.updateQueue();
      }
      if (self.$refs?.queue) {
        self.$refs.queue.updateQueue();
      }
      this.currentSongInfo = a;
      if (this.currentSongInfo === null || this.currentSongInfo === undefined) {
        return;
      } // EVIL EMPTY OBJECTS BE GONE

      try {
        this.radiohls.destroy();
        this.radiohls = null;
      } catch (_) {}

      try {
        if ((MusicKit.getInstance().nowPlayingItem["type"] ?? "").includes("ideo")) {
          setTimeout(() => {
            this.MVsource = CiderAudio.context.createMediaElementSource(document.querySelector("div#apple-music-video-player > video"));
            this.MVsource.connect(CiderAudio.audioNodes.intelliGainComp);
          }, 300);
        } else {
          this.MVsource.disconnect();
          this.MVsource = null;
        }
      } catch (e) {
        console.log(e);
      }

      let localFiles = false;
      try {
        if (app.mk.nowPlayingItem.flavor.includes("64") && app.mk.nowPlayingItem.flavor.includes(":")) {
          localStorage.setItem("playingBitrate", "64");
        } else if (app.mk.nowPlayingItem.flavor.includes("256") && app.mk.nowPlayingItem.flavor.includes(":")) {
          localStorage.setItem("playingBitrate", "256");
        } else {
          localFiles = true;
          localStorage.setItem("playingBitrate", app.mk.nowPlayingItem.flavor);
        }
      } catch (e) {
        localFiles = true;
        try {
          localStorage.setItem("playingBitrate", app.mk.nowPlayingItem.flavor);
        } catch (e) {
          console.log(e);
        }
      }

      if (!app.cfg.audio.normalization) {
        CiderAudio.hierarchical_loading();
      } // Just Reload for Adaptive CAP if norm is off
      else {
        // get unencrypted audio previews to get SoundCheck's normalization tag
        try {
          let previewURL = null;
          try {
            previewURL = app.mk.nowPlayingItem.previewURL;
          } catch (e) {
            if (!(e instanceof TypeError)) {
              console.debug("[Cider][MaikiwiSoundCheck] normalizer function err: " + e);
            } else {
              if (localFiles) {
                CiderAudio.audioNodes.gainNode.gain.value = 0.822242649947;
              }
            }
          }
          if (
            previewURL === null &&
            (app.mk.nowPlayingItem?._songId ??
              app.mk.nowPlayingItem["songId"] ??
              app.mk.nowPlayingItem.relationships.catalog.data[0].id) !== -1
          ) {
            app.mk.api.v3
              .music(
                `/v1/catalog/${app.mk.storefrontId}/songs/${app.mk.nowPlayingItem?._songId ?? app.mk.nowPlayingItem["songId"] ?? app.mk.nowPlayingItem.relationships.catalog.data[0].id}`,
              )
              .then((response) => {
                try {
                  previewURL = response.data.data[0].attributes.previews[0].url;
                } catch (e) {
                  if (!(e instanceof TypeError)) {
                    console.debug("[Cider][MaikiwiSoundCheck] normalizer function err: " + e);
                  } else {
                    if (localFiles) {
                      CiderAudio.audioNodes.gainNode.gain.value = 0.822242649947;
                    }
                  }
                }
                if (previewURL) {
                  console.debug("[Cider][MaikiwiSoundCheck] previewURL response.data.data[0].attributes.previews[0].url: " + previewURL);
                  window.electronAPI.send("getPreviewURL", previewURL);
                } else {
                  if (localFiles) {
                    CiderAudio.audioNodes.gainNode.gain.value = 0.822242649947;
                  }
                }
              });
          } else {
            if (previewURL) {
              console.debug("[Cider][MaikiwiSoundCheck] previewURL in app.mk.nowPlayingItem.previewURL: " + previewURL);
              window.electronAPI.send("getPreviewURL", previewURL);
            }
          }
        } catch (e) {
          if (!(e instanceof TypeError)) {
            console.debug("[Cider][MaikiwiSoundCheck] normalizer function err: " + e);
          } else {
            if (localFiles) {
              CiderAudio.audioNodes.gainNode.gain.value = 0.822242649947;
            }
          }
        }
      }

      try {
        a = a.item.attributes;
      } catch (_) {}
      const type = self.mk.nowPlayingItem !== null ? (self.mk.nowPlayingItem["type"] ?? "") : "";

      if (
        type.includes("musicVideo") ||
        type.includes("uploadedVideo") ||
        type.includes("music-movie") ||
        (self.mk.nowPlayingItem?.type === "radioStation") & (self.mk.nowPlayingItem?.attributes?.mediaKind === "video")
      ) {
        document.getElementById("apple-music-video-container").style.display = "block";
        document.body.setAttribute("video-playing", "true");
        // app.chrome.topChromeVisible = false
      } else {
        document.body.removeAttribute("video-playing");
        document.getElementById("apple-music-video-container").style.display = "none";
        // app.chrome.topChromeVisible = true
      }
      self.chrome.artworkReady = false;
      self.lyrics = [];
      self.richlyrics = [];
      app.getCurrentArtURL().then((urls) => {
        app.currentArtUrl = urls?.currentArtUrl ?? "";
        app.currentArtUrlRaw = urls?.currentArtUrlRaw ?? "";
        window.electronAPI.send("discordrpc:updateImage", app.currentArtUrl);
      });
      // app.getNowPlayingArtwork(42);
      app.getNowPlayingArtworkBG(32);
      app.loadLyrics();

      setTimeout(() => {
        const i = document.querySelector("#apple-music-player")?.src ?? "";
        if (i.endsWith(".m3u8") || i.endsWith(".m3u")) {
          this._playRadioStream(i);
        }
      }, 1500);
    });

    this.mk.addEventListener(MusicKit.Events.playbackVolumeDidChange, (_a) => {
      this.cfg.audio.volume = this.mk.volume;
      window.electronAPI.send("mpris:volumeChange", this.mk.volume);
    });

    this.refreshPlaylists(this.isDev);
    document.body.removeAttribute("loading");
    if (window.location.hash !== "") {
      this.appRoute(window.location.hash);
    }

    if (this.page !== "home") {
      this.resumeTabs();
    }
    this.mediaKeyFixes();

    setTimeout(() => {
      this.getSocialBadges();
      this.getBrowsePage();
      this.$forceUpdate();
    }, 500);
    document.querySelector("#apple-music-video-player-controls").addEventListener("mousemove", () => {
      this.showFoo(".music-player-info", 2000);
    });
    await window.electronAPI.invoke("renderer-ready", true);
    document.querySelector("#LOADER").remove();
    if (this.cfg.general.themeUpdateNotification && !this.isDev) {
      this.checkForThemeUpdates();
    }

    if (!localStorage.getItem("noC2Startup")) {
      const c2UpgradeDate = 1688172351000;
      if (Date.now() <= c2UpgradeDate) {
        setTimeout(() => {
          app.modals.c2Upgrade = true;
        }, 2000);
      }
    }
  },
};

export default { helpers };
