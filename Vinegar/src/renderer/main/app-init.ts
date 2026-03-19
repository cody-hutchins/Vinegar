import { CiderAudio } from "../audio/audio.js";
import { notyf } from "./helpers.js";
import { CiderCache } from "./cidercache.js";

const init = async () => {
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
  //   this.mkIsReady = true;
  //   if (needsReload) {
  //     document.location.reload();
  //   }
  // });
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
          const callback = async () => {
            await app.mk.play();
            await app.mk.pause();
            app.mk.unmute();
          };
          callback().then();
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
    this.setTheme(self.cfg.visual.theme, true);
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
      notyf.success(
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
        let previewURL: string | null = null;
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
          (app.mk.nowPlayingItem?._songId ?? app.mk.nowPlayingItem["songId"] ?? app.mk.nowPlayingItem.relationships.catalog.data[0].id) !==
            -1
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
  }, 500);

  document.querySelector("#apple-music-video-player-controls")?.addEventListener("mousemove", () => {
    this.showFoo(".music-player-info", 2000);
  });
  await window.electronAPI.invoke("renderer-ready", true);
  document.querySelector("#LOADER")?.remove();
  if (this.cfg.general.themeUpdateNotification && !this.isDev) {
    this.checkForThemeUpdates();
  }
};

export default init;
