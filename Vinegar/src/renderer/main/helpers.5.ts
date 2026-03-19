const helpers = {
  mkReady() {
    if (this.mk["nowPlayingItem"]) {
      return true;
    } else {
      return false;
    }
  },
  getMediaItemArtwork(url, height = 64, width) {
    try {
      if (typeof url === "undefined" || url === "") {
        return "./assets/MissingArtwork.svg";
      }
      height = parseInt(height * window.devicePixelRatio);
      if (width) {
        width = parseInt(width * window.devicePixelRatio);
      }
      let newurl = `${(url ?? "")
        .replace("{w}", width ?? height)
        .replace("{h}", height)
        .replace("{f}", "webp")
        .replace("{c}", width === 900 || width === 380 || width === 600 ? "sr" : "cc")}`;

      if (newurl.includes("900x516")) {
        newurl = newurl.replace("900x516cc", "900x516sr").replace("900x516bb", "900x516sr");
      }
      return newurl;
    } catch (e) {
      console.log(url);
      return "./assets/MissingArtwork.svg";
    }
  },
  _rgbToRgb(rgb = [0, 0, 0]) {
    // if rgb
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  },
  getNowPlayingArtworkBG(size = 32, force = false) {
    const self = this;
    if (typeof this.mk.nowPlayingItem === "undefined") return;
    const bginterval = setInterval(() => {
      if (!this.mkReady()) {
        return "";
      }

      try {
        if (
          (this.mk.nowPlayingItem && this.mk.nowPlayingItem["id"] !== this.currentTrackID && document.querySelector(".bg-artwork")) ||
          force
        ) {
          if (document.querySelector(".bg-artwork")) {
            clearInterval(bginterval);
          }
          this.currentTrackID = this.mk.nowPlayingItem["id"];
          document.querySelector(".bg-artwork").src = "";
          if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
            getBase64FromUrl(this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"].replace("{w}", size).replace("{h}", size)).then(
              (img) => {
                document.querySelectorAll(".bg-artwork").forEach((artwork) => {
                  artwork.src = img;
                });
                self.$store.commit("setLCDArtwork", img);
              },
            );
            try {
              clearInterval(bginterval);
            } catch (e) {
              console.log(e);
            }
          } else {
            this.setLibraryArtBG();
          }
        } else if (this.mk.nowPlayingItem["id"] === this.currentTrackID) {
          try {
            clearInterval(bginterval);
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        if (this.mk.nowPlayingItem && this.mk.nowPlayingItem["id"] && document.querySelector(".bg-artwork")) {
          this.setLibraryArtBG();
          try {
            clearInterval(bginterval);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }, 200);
  },
  async getCurrentArtURL() {
    let artworkSize = 50;
    if (app.getThemeDirective("lcdArtworkSize") !== "") {
      artworkSize = app.getThemeDirective("lcdArtworkSize");
    } else if (this.cfg.visual.directives.windowLayout === "twopanel") {
      artworkSize = 110;
    }
    const mediaItem =
      (app?.mk?.nowPlayingItem?.attributes?.artwork?.url ? app?.mk?.nowPlayingItem : null) ??
      (await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk?.nowPlayingItem?.id}`)?.data?.data?.data[0]) ??
      {};
    return {
      currentArtUrlRaw: mediaItem?.attributes?.artwork?.url ?? "",
      currentArtUrl:
        mediaItem?._assets[0]?.artworkURL ?? mediaItem?.attributes?.artwork?.url?.replace("{w}", artworkSize).replace("{h}", artworkSize),
    };
  },
  async setLibraryArt() {
    if (typeof this.mk.nowPlayingItem === "undefined") return;
    try {
      let data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
      data = data.data.data[0];

      if (data !== null && data !== "") {
        document
          .querySelector(".app-playback-controls .artwork")
          .style.setProperty("--artwork", 'url("' + data["attributes"]["artwork"]["url"].toString() + '")');
      } else {
        document.querySelector(".app-playback-controls .artwork").style.setProperty("--artwork", `url("")`);
      }
    } catch (e) {
      console.log(e);
    }
  },
  async setLibraryArtBG() {
    if (typeof this.mk.nowPlayingItem === "undefined") return;
    try {
      let data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
      data = data.data.data[0];

      if (data !== null && data !== "") {
        getBase64FromUrl(data["attributes"]["artwork"]["url"].toString()).then((img) => {
          document.querySelector(".bg-artwork").forEach((artwork) => {
            artwork.src = img;
          });
          self.$store.commit("setLCDArtwork", img);
        });
      }
    } catch (e) {
      console.log(e);
    }
  },
  quickPlay(query) {
    const self = this;
    MusicKit.getInstance()
      .api.search(query, { limit: 2, types: "songs" })
      .then(function (data) {
        MusicKit.getInstance()
          .setQueue({
            song: data["songs"]["data"][0]["id"],
            parameters: { l: app.mklang },
          })
          .then(function (queue) {
            MusicKit.getInstance().play();
            setTimeout(() => {
              self.$forceUpdate();
            }, 1000);
          });
      });
  },
  async getRating(item) {
    let type = item.type.slice(-1) === "s" ? item.type : item.type + "s";
    let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id);
    if (item.id !== null && item.id.toString().startsWith("i.")) {
      if (!type.startsWith("library-")) {
        type = "library-" + type;
      }
      id = item.id;
    }
    const response = await this.mk.api.v3.music(`/v1/me/ratings/${type}?platform=web&ids=${type.includes("library") ? item.id : id}`);
    if (response.data.data.length !== 0) {
      const value = response.data.data[0].attributes.value;
      return value;
    } else {
      return 0;
    }
  },
  love(item) {
    let type = item.type.slice(-1) === "s" ? item.type : item.type + "s";
    let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id);
    if (item.id !== null && item.id.toString().startsWith("i.")) {
      if (!type.startsWith("library-")) {
        type = "library-" + type;
      }
      id = item.id;
    }
    this.mk.api.v3.music(
      `/v1/me/ratings/${type}/${id}`,
      {},
      {
        fetchOptions: {
          method: "PUT",
          body: JSON.stringify({
            type: "rating",
            attributes: {
              value: 1,
            },
          }),
        },
      },
    );
  },
  dislike(item) {
    let type = item.type.slice(-1) === "s" ? item.type : item.type + "s";
    let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id);
    if (item.id !== null && item.id.toString().startsWith("i.")) {
      if (!type.startsWith("library-")) {
        type = "library-" + type;
      }
      id = item.id;
    }
    this.mk.api.v3.music(
      `/v1/me/ratings/${type}/${id}`,
      {},
      {
        fetchOptions: {
          method: "PUT",
          body: JSON.stringify({
            type: "rating",
            attributes: {
              value: -1,
            },
          }),
        },
      },
    );
  },
  unlove(item) {
    let type = item.type.slice(-1) === "s" ? item.type : item.type + "s";
    let id = item.attributes.playParams.catalogId ? item.attributes.playParams.catalogId : item.id;
    if (item.id.startsWith("i.")) {
      if (!type.startsWith("library-")) {
        type = "library-" + type;
      }
      id = item.id;
    }
    this.mk.api.v3.music(
      `/v1/me/ratings/${type}/${id}`,
      {},
      {
        fetchOptions: {
          method: "DELETE",
        },
      },
    );
  },
  checkScrollDirectionIsUp(event) {
    if (event.wheelDelta) {
      return event.wheelDelta > 0;
    }
    return event.deltaY < 0;
  },
  volumeUp() {
    if (app.mk.volume + app.cfg.audio.volumeStep > app.cfg.audio.maxVolume) {
      app.mk.volume = app.cfg.audio.maxVolume;
    } else {
      app.mk.volume = (Math.floor(app.mk.volume * 100) + app.cfg.audio.volumeStep * 100) / 100;
    }
  },
  volumeDown() {
    if (app.mk.volume - app.cfg.audio.volumeStep < 0) {
      app.mk.volume = 0;
    } else {
      app.mk.volume = (Math.floor(app.mk.volume * 100) - app.cfg.audio.volumeStep * 100) / 100;
    }
  },
  volumeWheel(event) {
    app.checkScrollDirectionIsUp(event) ? this.volumeUp() : this.volumeDown();
  },
  muteButtonPressed() {
    if (this.cfg.audio.muted) {
      this.mk.volume = this.cfg.audio.lastVolume;
      this.cfg.audio.muted = false;
    } else {
      this.cfg.audio.lastVolume = this.cfg.audio.volume;
      this.mk.volume = 0;
      this.cfg.audio.muted = true;
    }
  },
  checkMuteChange() {
    if (this.cfg.audio.muted) {
      this.cfg.audio.muted = false;
    }
  },
  repeatIncrement() {
    switch (app.mk.repeatMode) {
      default:
      case MusicKit.PlayerRepeatMode.none:
        app.mk.repeatMode = MusicKit.PlayerRepeatMode.all;
        break;

      case MusicKit.PlayerRepeatMode.all:
        app.mk.repeatMode = MusicKit.PlayerRepeatMode.one;
        break;

      case MusicKit.PlayerRepeatMode.one:
        app.mk.repeatMode = MusicKit.PlayerRepeatMode.none;
        break;
    }
  },
  async apiCall(url, callback) {
    const xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = (e) => {
      if (xmlHttp.readyState !== 4) {
        return;
      }

      if (xmlHttp.status === 200) {
        // console.log('SUCCESS', xmlHttp.responseText);
        callback(JSON.parse(xmlHttp.responseText));
      } else {
        console.warn("request_error");
      }
    };

    xmlHttp.open("GET", url);
    xmlHttp.setRequestHeader("Authorization", "Bearer " + MusicKit.getInstance().developerToken);
    xmlHttp.setRequestHeader("Music-User-Token", "" + MusicKit.getInstance().musicUserToken);
    xmlHttp.setRequestHeader("Accept", "application/json");
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.responseType = "text";
    xmlHttp.send();
  },
  fetchPlaylist(id, callback) {
    // id can be found in playlist.attributes.playParams.globalId
    // this.mk.api.
    this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/playlists/${id}`).then((res) => {
      callback(res.data.data[0]);
    });

    // tracks are found in relationship.data
  },
  setAirPlayCodeUI(identifier) {
    this.modals.airplayPW = true;
    this.currentAirPlayCodeID = identifier;
  },
  sendAirPlaySuccess(silent = false, identifier = "") {
    if (!silent) {
      notyf.success("Device paired successfully!");
    }
    console.log("delete idx-pre", identifier);
    const idx = this.airplayTrys.findIndex((a) => {
      return a.id === identifier;
    });
    console.log("delete idx", idx);
    if (idx !== -1) delete this.airplayTrys[idx];
    this.airplayTrys = this.airplayTrys.filter((n) => n);
  },
  sendAirPlayFailed() {
    notyf.success("Device paring failed!");
  },
  airplayDisconnect(dropped, array = [], identifier = "") {
    console.log("airplay dropped", dropped, array, identifier);
    if (dropped) {
      const [ipv4, ipport, sepassword, title, artist, album, artworkURL, txt, airplay2dv] = array;
      console.log(ipv4, ipport, sepassword, title, artist, album, artworkURL, txt, airplay2dv);
      let idx = this.airplayTrys.findIndex((a) => {
        return a.id === ipv4 + ":" + ipport + "ap";
      });
      if (idx === -1) {
        this.airplayTrys.push({
          id: ipv4 + ":" + ipport + "ap",
          attempts: 1,
        });
      }
      idx = this.airplayTrys.findIndex((a) => {
        return a.id === ipv4 + ":" + ipport + "ap";
      });
      if (this.airplayTrys[idx].attempts > 3) {
        delete this.airplayTrys[idx];
        this.airplayTrys = this.airplayTrys.filter((n) => n);
        console.log("delete idx", idx);
        return;
      } else {
        this.airplayTrys[idx].attempts = this.airplayTrys[idx].attempts + 1;
        setTimeout(() => {
          window.electronAPI.send("performAirplayPCM", ipv4, ipport, sepassword, title, artist, album, artworkURL, txt, airplay2dv, true);
        }, 1000);
      }
    } else {
      if (identifier === "") {
        app.activeCasts = [];
        notyf.error("Devices disconnected!");
      } else {
        app.activeCasts;
        notyf.error("Device disconnected!");
      }
    }
  },
  windowFocus(val) {
    if (val) {
      document.querySelectorAll(".animated-artwork-video").forEach((el) => {
        el.play();
      });
      document.querySelector("body").classList.remove("stopanimation");
      document.body.setAttribute("focus-state", "focused");
      this.animateBackground = true;
    } else {
      document.querySelectorAll(".animated-artwork-video").forEach((el) => {
        el.pause();
      });
      document.querySelector("body").classList.add("stopanimation");
      document.body.setAttribute("focus-state", "blurred");
      this.animateBackground = false;
    }
  },
  async nowPlayingContextMenu(event) {
    const self = this;
    const data_type = this.mk.nowPlayingItem.playParams.kind;
    const item_id = this.mk.nowPlayingItem.attributes.playParams.id ?? this.mk.nowPlayingItem.id;
    const isLibrary = this.mk.nowPlayingItem.attributes.playParams.isLibrary ?? false;
    const params = {
      "fields[songs]": "inLibrary",
      "fields[albums]": "inLibrary",
      relate: "library",
      t: "1",
    };
    app.selectedMediaItems = [];
    app.select_selectMediaItem(item_id, data_type, 0, "12344", isLibrary);
    const useMenu = "normal";
    const menus = {
      multiple: {
        items: [],
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
              app.love(app.mk.nowPlayingItem);
            },
          },
          {
            icon: "./assets/feather/heart.svg",
            id: "unlove",
            active: true,
            name: app.getLz("action.unlove"),
            hidden: true,
            action: function () {
              app.unlove(app.mk.nowPlayingItem);
            },
          },
          {
            icon: "./assets/feather/thumbs-down.svg",
            id: "dislike",
            name: app.getLz("action.dislike"),
            hidden: false,
            disabled: true,
            action: function () {
              app.dislike(app.mk.nowPlayingItem);
            },
          },
          {
            icon: "./assets/feather/thumbs-down.svg",
            id: "undo_dislike",
            name: app.getLz("action.undoDislike"),
            active: true,
            hidden: true,
            action: function () {
              app.unlove(app.mk.nowPlayingItem);
            },
          },
        ],
        items: [
          {
            icon: "./assets/feather/plus.svg",
            id: "addToLibrary",
            name: app.getLz("action.addToLibrary") + " ...",
            disabled: true,
            action: function () {
              app.addToLibrary(app.mk.nowPlayingItem.id);
            },
          },
          {
            id: "removeFromLibrary",
            icon: "./assets/feather/x-circle.svg",
            name: app.getLz("action.removeFromLibrary"),
            hidden: true,
            action: function () {
              self.removeFromLibrary(app.mk.nowPlayingItem.type, MusicKitInterop.getAttributes().songId);
            },
          },
          {
            icon: "./assets/feather/list.svg",
            name: app.getLz("action.addToPlaylist") + " ...",
            action: function () {
              app.promptAddToPlaylist();
            },
          },
          {
            icon: "./assets/feather/radio.svg",
            name: app.getLz("action.startRadio"),
            action: function () {
              app.mk.setStationQueue({ song: app.mk.nowPlayingItem.id }).then(() => {
                app.mk.play();
                app.selectedMediaItems = [];
              });
            },
          },
          {
            icon: "./assets/feather/user.svg",
            name: app.getLz("action.goToArtist"),
            action: async function () {
              if (app.mk.nowPlayingItem.relationships.artists.data[0].id) {
                app.appRoute(`artist/${app.mk.nowPlayingItem.relationships.artists.data[0].id}`);
              } else {
                const primaryArtist = await MusicKitInterop.fetchSongRelationships({ relationship: "primaryArtist" });
                app.appRoute(`artist/${primaryArtist.id}`);
              }
            },
          },
          {
            icon: "./assets/feather/disc.svg",
            name: app.getLz("action.goToAlbum"),
            action: function () {
              app.appRoute(`album/${app.mk.nowPlayingItem.relationships.albums.data[0].id}`);
            },
          },
          {
            id: "showInMusic",
            icon: "./assets/music.svg",
            hidden: true,
            name: app.getLz("action.showInAppleMusic"),
            action: function () {
              app.routeView(app.mk.nowPlayingItem._container);
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: app.getLz("action.share"),
            action: function () {
              app
                .mkapi(
                  app.mk.nowPlayingItem.attributes?.playParams?.kind ?? app.mk.nowPlayingItem.type ?? "songs",
                  false,
                  app.mk.nowPlayingItem._songId ?? app.mk.nowPlayingItem.songId ?? app.mk.nowPlayingItem.id ?? "",
                )
                .then((u) => {
                  app.copyToClipboard(
                    u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url,
                  );
                });
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: `${app.getLz("action.share")} (song.link)`,
            action: function () {
              app
                .mkapi(
                  app.mk.nowPlayingItem.attributes?.playParams?.kind ?? app.mk.nowPlayingItem.type ?? "songs",
                  false,
                  app.mk.nowPlayingItem._songId ?? app.mk.nowPlayingItem.songId ?? app.mk.nowPlayingItem.id ?? "",
                )
                .then((u) => {
                  app.songLinkShare(
                    u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url,
                  );
                });
            },
          },
          {
            id: "equalizer",
            icon: "../views/svg/speaker.svg",
            name: app.getLz("term.equalizer"),
            hidden: false,
            action: function () {
              app.modals.equalizer = true;
              app.modals.audioSettings = false;
            },
          },
          {
            id: "audioLab",
            icon: "../views/svg/speaker.svg",
            name: app.getLz("settings.option.audio.audioLab"),
            hidden: false,
            action: function () {
              app.openSettingsPage("audiolabs");
            },
          },
        ],
      },
    };
    /*
          if (this.cfg.advanced.AudioContext) {
              menus.normal.items.find(i => i.id === 'audioLab').hidden = false
              menus.normal.items.find(i => i.id === 'equalizer').hidden = false
          }
          */
    if (this.contextExt) {
      if (this.contextExt.normal) {
        menus.normal.items = menus.normal.items.concat(this.contextExt.normal);
      }
    }

    const nowPlayingContainer = app.mk.nowPlayingItem._container;
    if (nowPlayingContainer && nowPlayingContainer["attributes"] && nowPlayingContainer.name !== "station") {
      menus.normal.items.find((x) => x.id === "showInMusic").hidden = false;
    }

    this.showMenuPanel(menus[useMenu], event);

    try {
      // if its a radio station, then change the attributes to match a song
      const nowPlayingItem = JSON.parse(JSON.stringify(this.mk.nowPlayingItem));
      if (nowPlayingItem.type === "radioStation" && app.mk.nowPlayingItem.id !== -1) {
        nowPlayingItem.type = "song";
        nowPlayingItem.attributes.playParams.catalogId = app.mk.nowPlayingItem.id;
        nowPlayingItem.attributes.playParams.id = app.mk.nowPlayingItem.id;
        nowPlayingItem.id = app.mk.nowPlayingItem.id;
      }
      const result = await this.inLibrary([nowPlayingItem]);
      if (result[0].attributes.inLibrary) {
        menus.normal.items.find((x) => x.id === "addToLibrary").hidden = true;
        menus.normal.items.find((x) => x.id === "removeFromLibrary").hidden = false;
      } else {
        menus.normal.items.find((x) => x.id === "addToLibrary").disabled = false;
      }
    } catch (e) {
      e = null;
    }

    try {
      const rating = await app.getRating(app.mk.nowPlayingItem);
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
    } catch (e) {
      console.log(e);
    }
  },
  openSettingsPage(page) {
    switch (page) {
      case "general":
        this.$store.state.pageState.settings.currentTabIndex = 0;
        break;
      case "audio":
        this.$store.state.pageState.settings.currentTabIndex = 1;
        break;
      case "audiolabs":
        this.$store.state.pageState.settings.currentTabIndex = 2;
        break;
      case "styles":
        this.$store.state.pageState.settings.currentTabIndex = 3;
        break;
      case "visual":
        this.$store.state.pageState.settings.currentTabIndex = 4;
        break;
      case "github-plugins":
        this.$store.state.pageState.settings.currentTabIndex = 5;
        break;
      case "lyrics":
        this.$store.state.pageState.settings.currentTabIndex = 6;
        break;
      case "connectivity":
        this.$store.state.pageState.settings.currentTabIndex = 7;
        break;
      case "advanced":
        this.$store.state.pageState.settings.currentTabIndex = 8;
        break;
      case "keybindings":
        this.$store.state.pageState.settings.currentTabIndex = 9;
        break;
      case "github-themes":
        this.$store.state.pageState.settings.currentTabIndex = 10;
        break;
    }
    app.modals.settings = true;
  },
  fullscreen(flag, mv = false) {
    this.fullscreenState = flag;
    if (flag) {
      window.electronAPI.send("setFullScreen", true);
      if (!mv) {
        app.appMode = "fullscreen";
      } else {
        app.mvViewMode = "full";
      }

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && app.appMode === "fullscreen") {
          this.fullscreen(false);
        }
      });
    } else {
      window.electronAPI.send("setFullScreen", false);
      app.appMode = "player";
    }
  },
  pip() {
    // document.querySelector("video#apple-music-video-player").requestPictureInPicture();
    // // .then(pictureInPictureWindow => {
    // //     pictureInPictureWindow.addEventListener("resize", () => {
    // //         console.log("[PIP] Resized")
    // //     }, false);
    // //   })
    this.mvViewMode = this.mvViewMode === "mini" ? "full" : "mini";
  },
  miniPlayer(flag) {
    if (flag) {
      this.tmpWidth = window.innerWidth;
      this.tmpHeight = window.innerHeight;
      this.tmpX = window.screenX;
      this.tmpY = window.screenY;
      window.electronAPI.send("unmaximize");
      window.electronAPI.send("windowmin", 250, 250);
      if (this.miniTmpX !== "" && this.miniTmpY !== "") window.electronAPI.send("windowmove", this.miniTmpX, this.miniTmpY);
      window.electronAPI.send("windowresize", 300, 300, false);
      app.appMode = "mini";
    } else {
      this.miniTmpX = window.screenX;
      this.miniTmpY = window.screenY;
      window.electronAPI.send("windowmin", 844, 410);
      window.electronAPI.send("windowresize", this.tmpWidth, this.tmpHeight, false);
      window.electronAPI.send("windowmove", this.tmpX, this.tmpY);
      window.electronAPI.send("windowontop", false);
      //this.cfg.visual.miniplayer_top_toggle = true;
      app.appMode = "player";
    }
  },
  pinMiniPlayer(status = false) {
    if (!status) {
      if (!this.cfg.visual.miniplayer_top_toggle) {
        window.electronAPI.send("windowontop", true);
        this.cfg.visual.miniplayer_top_toggle = true;
      } else {
        window.electronAPI.send("windowontop", false);
        this.cfg.visual.miniplayer_top_toggle = false;
      }
    } else {
      window.electronAPI.send("windowontop", this.cfg.visual.miniplayer_top_toggle ?? false);
    }
  },
  formatTimezoneOffset: (e = new Date()) => {
    const leadingZeros = (e, s = 2) => {
      let n = "" + e;
      for (; n.length < s; ) n = "0" + n;
      return n;
    };

    const s = e.getTimezoneOffset(),
      n = Math.floor(Math.abs(s) / 60),
      d = Math.round(Math.abs(s) % 60);
    let h = "+";
    return (0 !== s && (h = s > 0 ? "-" : "+"), `${h}${leadingZeros(n, 2)}:${leadingZeros(d, 2)}`);
  },
  toggleHideUserInfo() {
    if (this.chrome.hideUserInfo) {
      this.cfg.visual.showuserinfo = true;
      this.chrome.hideUserInfo = false;
    } else {
      this.cfg.visual.showuserinfo = false;
      this.chrome.hideUserInfo = true;
    }
  },
  isElementOverflowing(selector) {
    try {
      const element = document.querySelector(selector);
      const overflowX = element.offsetWidth < element.scrollWidth,
        overflowY = element.offsetHeight < element.scrollHeight;
      element.setAttribute("data-value", "\xa0\xa0\xa0\xa0" + element.textContent);

      return overflowX || overflowY;
    } catch (e) {
      return false;
    }
  },
  async showWebRemoteQR() {
    //this.webremoteqr = await window.electronAPI.invoke('setRemoteQR','')
    this.webremoteurl = await window.electronAPI.invoke("showQR", "");
    //this.modals.qrcode = true;
  },
  checkMarquee() {
    if (isElementOverflowing("#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-artist")) {
      document.getElementsByClassName("song-artist")[0].classList.add("marquee");
      document.getElementsByClassName("song-artist")[1].classList.add("marquee-after");
    }
    if (isElementOverflowing("#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-name")) {
      document.getElementsByClassName("song-name")[0].classList.add("marquee");
      document.getElementsByClassName("song-name")[1].classList.add("marquee-after");
    }
  },
  closeWindow() {
    window.electronAPI.send("close");
  },
  darwinShare(url) {
    window.electronAPI.send("share-menu", url);
  },
  arrayToChunk(arr, chunkSize) {
    const R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) {
      R.push(arr.slice(i, i + chunkSize));
    }
    return R;
  },
  SpacePause() {
    const elems = document.querySelectorAll("input");
    for (const elem of elems) {
      if (elem === document.activeElement) {
        return;
      }
    }
    if (!this.isDev) {
      // disable in dev mode to keep my sanity
      MusicKitInterop.playPause();
    }
  },
  async MKJSLang() {
    const u = this.cfg.general.language;
    // use MusicKit.getInstance or crash
    try {
      const item = await MusicKit.getInstance().api.v3.music(`v1/storefronts/${app.mk.storefrontId}`);
      let langcodes = item.data.data[0].attributes.supportedLanguageTags;
      if (langcodes)
        langcodes = langcodes.map(function (u) {
          return u.replace(/-Han[s|t]/i, "").toLowerCase();
        });
      console.log(langcodes);
      let sellang = "";
      if (u && langcodes.includes(u.toLowerCase().replace("_", "-"))) {
        sellang = u.toLowerCase().replace("_", "-");
      } else if (u && u.includes("_") && langcodes.includes(u.toLowerCase().replace("_", "-").split("-")[0])) {
        sellang = u.toLowerCase().replace("_", "-").split("-")[0];
      }
      if (sellang === "") sellang = item.data.data[0].attributes.defaultLanguageTag.toLowerCase();

      // Fix weird locales:
      if (sellang === "iw") sellang = "iw-il";
      sellang = sellang.replace(/-Han[s|t]/i, "").toLowerCase();

      console.log(sellang);
      return await sellang;
    } catch (err) {
      console.log("locale err", err);
      const langcodes = [
        "af",
        "sq",
        "ar",
        "eu",
        "bg",
        "be",
        "ca",
        "zh",
        "zh-tw",
        "zh-cn",
        "zh-hk",
        "zh-sg",
        "hr",
        "cs",
        "da",
        "nl",
        "nl-be",
        "en",
        "en-us",
        "en-eg",
        "en-au",
        "en-gb",
        "en-ca",
        "en-nz",
        "en-ie",
        "en-za",
        "en-jm",
        "en-bz",
        "en-tt",
        "en-001",
        "et",
        "fo",
        "fa",
        "fi",
        "fr",
        "fr-ca",
        "gd",
        "de",
        "de-ch",
        "el",
        "he",
        "hi",
        "hu",
        "is",
        "id",
        "it",
        "ja",
        "ko",
        "lv",
        "lt",
        "mk",
        "mt",
        "no",
        "nb",
        "nn",
        "pl",
        "pt-br",
        "pt",
        "rm",
        "ro",
        "ru",
        "sr",
        "sk",
        "sl",
        "es",
        "es-mx",
        "es-419",
        "sv",
        "th",
        "ts",
        "tn",
        "tr",
        "uk",
        "ur",
        "ve",
        "vi",
        "xh",
        "yi",
        "zu",
        "ms",
        "iw",
        "lo",
        "tl",
        "kk",
        "ta",
        "te",
        "bn",
        "ga",
        "ht",
        "la",
        "pa",
        "sa",
      ];
      let sellang = "en";
      if (u && langcodes.includes(u.toLowerCase().replace("_", "-"))) {
        sellang = u.toLowerCase().replace("_", "-");
      } else if (u && u.includes("_") && langcodes.includes(u.toLowerCase().replace("_", "-").split("-")[0])) {
        sellang = u.toLowerCase().replace("_", "-").split("-")[0];
      }
      if (sellang.startsWith("en") && this.mk.storefrontId !== "us") sellang = "en-gb";
      return await sellang;
    }
  },
  skipToNextItem() {
    if (this.mk.queue.nextPlayableItemIndex !== -1 && this.mk.queue.nextPlayableItemIndex !== null)
      this.mk.changeToMediaAtIndex(this.mk.queue.nextPlayableItemIndex);
  },
  skipToPreviousItem() {
    if (this.mk.queue.previousPlayableItemIndex !== -1 && this.mk.queue.previousPlayableItemIndex !== null)
      this.mk.changeToMediaAtIndex(this.mk.queue.previousPlayableItemIndex);
  },
  mediaKeyFixes() {
    MusicKitInterop.initMediaSession();
    // navigator.mediaSession.setActionHandler("previoustrack", function () {
    //   app.skipToPreviousItem();
    // });
    // navigator.mediaSession.setActionHandler("nexttrack", function () {
    //   app.skipToNextItem();
    // });
  },
  authCC() {
    window.electronAPI.send("cc-auth");
  },
  _playRadioStream(e) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = process;
    xhr.open("GET", e, true);
    xhr.send();
    const self = this;

    function process() {
      if (xhr.readyState === 4) {
        const sources = xhr.responseText.match(/^(?!#)(?!\s).*$/gm).filter(function (element) {
          return element;
        });
        // Load first source
        const src = sources[0];
        if (src.includes("http")) {
          app.mk._services.mediaItemPlayback._currentPlayer._playAssetURL(src, false);
        } else {
          if (Hls.isSupported()) {
            const d = "WIDEVINE_SOFTWARE";
            const h = {
              initDataTypes: ["cenc", "keyids"],
              distinctiveIdentifier: "optional",
              persistentState: "required",
            };
            const p = {
              platformInfo: { requiresCDMAttachOnStart: !0, maxSecurityLevel: d, keySystemConfig: h },
              appData: { serviceName: "Apple Music" },
            };
            if (app.radiohls !== null && app.radiohls.destroy !== null) {
              app.radiohls.destroy();
              app.radiohls = null;
              app.radiohls = new CiderHls();
              app.radiohls.loadSource(e);
              app.radiohls.attachMedia(app.mk._services.mediaItemPlayback._currentPlayer._targetElement);
              app.mk._services.mediaItemPlayback._currentPlayer._targetElement.play();
            } else {
              app.radiohls = null;
              app.radiohls = new CiderHls();
              app.radiohls.loadSource(e);
              app.radiohls.attachMedia(app.mk._services.mediaItemPlayback._currentPlayer._targetElement);
              app.mk._services.mediaItemPlayback._currentPlayer._targetElement.play();
            }
          }
        }
      }
    }
  },
  confirm(message, callback) {
    bootbox.confirm(this.getBootboxParams(null, message, callback));
  },
  prompt(title, callback) {
    bootbox.prompt(this.getBootboxParams(title, null, callback));
  },
  getBootboxParams(title, message, callback) {
    return {
      title: title,
      message: message,
      buttons: {
        confirm: {
          label: app.getLz("dialog.ok"),
        },
        cancel: {
          label: app.getLz("dialog.cancel"),
        },
      },
      callback: function (result) {
        if (callback) callback(result);
      },
    };
  },
};
export default { helpers };
