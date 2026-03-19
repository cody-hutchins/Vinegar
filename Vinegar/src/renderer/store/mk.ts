import { ipcRenderer } from "electron";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CfgStore } from "../../main/base/store.js";
import { checkScrollDirectionIsUp } from "../main/helpers.js";
interface MkState {
  privateEnabled: boolean;
  nowPlayingItem: MusicKit.Item;
  currentPlaybackTime: number;
  queue: MusicKit.Queue;
  api: {
    v3: () => void;
  };
  prevButton: () => void;
  isDisabled: () => boolean;
  isPrevDisabled: () => boolean;
  isNextDisabled: () => boolean;
  changeToMediaAtIndex: (idx: number) => void;
  setMkPrivateEnabled: (newValue: boolean) => void;
  seekToTime: (time: number) => void;
  skipToPreviousItem: () => void;
}

export const useMkStore = create<MkState>()(
  immer((set, get) => ({
    api: { v3: () => {} },
    privateEnabled: false,
    nowPlayingItem: {},
    currentPlaybackTime: 0,
    queue: [],
    setMkPrivateEnabled: (newValue) =>
      set((state) => {
        state.privateEnabled = newValue;
        ipcRenderer.send("onPrivacyModeChange", newValue);
      }),

    // mk stuff
    prevButton() {
      if (get().nowPlayingItem && get().currentPlaybackTime > 2) {
        get().seekToTime(0);
      } else {
        get().skipToPreviousItem();
      }
    },
    isDisabled() {
      return !get().nowPlayingItem || get().nowPlayingItem.attributes.playParams.kind === "radioStation";
    },
    isPrevDisabled() {
      return get().isDisabled() || (get().queue._position === 0 && get().currentPlaybackTime <= 2);
    },
    isNextDisabled() {
      return get().isDisabled() || get().queue._position + 1 === get().queue.length;
    },
    skipToNextItem() {
      if (get().queue.nextPlayableItemIndex !== -1 && get().queue.nextPlayableItemIndex !== null)
        get().changeToMediaAtIndex(get().queue.nextPlayableItemIndex);
    },
    skipToPreviousItem() {
      if (get().queue.previousPlayableItemIndex !== -1 && get().queue.previousPlayableItemIndex !== null)
        get().changeToMediaAtIndex(get().queue.previousPlayableItemIndex);
    },
    changeToMediaAtIndex: (idx) => {},
    seekToTime: (idx) => {},
    monitorMusickit() {
      if (!this.cfg.musickit) return;

      for (const [attr, value] of Object.entries(this.cfg.musickit["stored-attributes"])) {
        console.log(`Musickit value: ` + this.mk[attr]);
        console.log(`Config value: ` + value);
        if (value !== "" && this.mk[attr] !== value) {
          this.mk[attr] = value;
        }
        this.$watch(`mk.${attr}`, (val) => {
          console.log(`MK ${attr} changed to ${val}`);
          this.cfg.musickit["stored-attributes"][attr] = val;
        });
      }
      const ERROR_CODES = ["drmUnsupported", "mediaPlaybackError"];
      /* MusicKit.Events */
      ERROR_CODES.forEach((code) => {
        MusicKit.getInstance().addEventListener(MusicKit.Events[code], (e) => {
          console.error(`[MusicKit] MusicKit Error ${code}`);
          console.error({ e: e });
          this.notyf.open({
            duration: 20000,
            type: "error",
            className: "notyf-info",
            message: `<small>${this.getLz("error.musickitError")} \n</small><code>${code.toUpperCase()}</code>`,
          });
        });
      });
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
          return await this.mk.api.v3.music(`v1/editorial/${this.mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2);
        } else if (library) {
          return await this.mk.api.v3.music(`v1/me/library/${truemethod}/${term.toString()}`, params, params2);
        } else {
          return await this.mk.api.v3.music(`/v1/catalog/${this.mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2);
        }
      } catch (e) {
        console.debug(e);
        return await this.mkapi(method, library, term, params, params2, attempts + 1);
      }
    },
    playMediaItem(item) {
      const kind = item.attributes.playParams ? (item.attributes.playParams.kind ?? item.type ?? "") : (item.type ?? "");
      const id = item.attributes.playParams ? (item.attributes.playParams.id ?? item.id ?? "") : (item.id ?? "");
      const isLibrary = item.attributes.playParams ? (item.attributes.playParams.isLibrary ?? false) : false;
      const truekind = !kind.endsWith("s") ? kind + "s" : kind;
      // console.log(kind, id, isLibrary)
      this.mk.stop().then(() => {
        if (kind.includes("artist")) {
          this.mk.setStationQueue({ artist: "a-" + id }).then(() => {
            this.mk.play();
          });
        } else {
          this.playMediaItemById(id, kind, isLibrary, item.attributes.url ?? "");
        }
      });
    },
    playMediaItemById(id, kind, isLibrary, raurl = "") {
      const truekind = !kind.endsWith("s") ? kind + "s" : kind;
      console.debug(id, truekind, isLibrary);
      try {
        if (truekind.includes("artist")) {
          this.mk.setStationQueue({ artist: "a-" + id }).then(() => {
            this.mk.play();
          });
        } else if (truekind === "radioStations") {
          this.mk.setStationQueue({ url: raurl }).then(function (queue) {
            MusicKit.getInstance().play();
          });
        } else {
          this.mk
            .setQueue({
              [truekind]: [id],
              parameters: { l: this.mklang },
            })
            .then(function (queue) {
              MusicKit.getInstance().play();
            });
        }
      } catch (err) {
        console.log(err);
        this.playMediaItemById(id, kind, isLibrary, raurl);
      }
    },
    queueParentandplayChild(parent, childIndex, item) {
      /* Randomize array in-place using Durstenfeld shuffle algorithm */
      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      }

      const kind = parent.substring(0, parent.indexOf(":"));
      const id = parent.substring(parent.indexOf(":") + 1, parent.length);
      const truekind = !kind.endsWith("s") ? kind + "s" : kind;
      console.log(truekind, id);

      try {
        if (parent === "playlist:ciderlocal") {
          const u = this.library.localsongs.map((i) => {
            return i.id;
          });
          this.mk.setQueue({ episodes: u }).then(() => {
            const id = this.mk.queue._itemIDs.findIndex((element) => element === item.id);
            this.mk.changeToMediaAtIndex(id);
          });
        } else if (this.library.songs.displayListing.length > childIndex && parent === "librarysongs") {
          console.log(item);
          if (item && this.library.songs.displayListing[childIndex].id !== item.id) {
            childIndex = this.library.songs.displayListing.indexOf(item);
          }

          const query = this.library.songs.displayListing.map((item) => new MusicKit.MediaItem(item));

          this.mk.stop().then(() => {
            if (item) {
              this.mk
                .setQueue({
                  [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                  parameters: { l: this.mklang },
                })
                .then(function () {
                  this.mk.play().then(() => {
                    if (this.mk.shuffleMode === 1) {
                      shuffleArray(query);
                    } else {
                      for (let i = 0; i < query.length; i++) {
                        if (query[i].id === item.id) {
                          query.splice(0, i + 1);
                          break;
                        }
                      }
                    }
                    this.mk.queue.append(query);
                  });
                });
            } else {
              this.mk.queue.splice(0, this.mk.queue._itemIDs.length);
              if (this.mk.shuffleMode === 1) {
                shuffleArray(query);
              }
              this.mk.queue.append(query);
              if (childIndex !== -1) {
                this.mk.changeToMediaAtIndex(childIndex);
              } else {
                this.mk.play();
              }
            }
          });
        } else if (parent.startsWith("listitem-hr")) {
          this.mk.stop().then(() => {
            if (this.mk.shuffleMode === 1) {
              this.mk
                .setQueue({
                  [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                })
                .then(function () {
                  this.mk.play().then(() => {
                    const data = JSON.parse(parent.split("listitem-hr")[1] ?? "[]");
                    const itemsToPlay = {};
                    const u = data.map((x) => x.id);
                    try {
                      data.splice(u.indexOf(item.attributes.playParams.id ?? item.id), 1);
                    } catch (e) {
                      console.log(e);
                    }
                    if (this.mk.shuffleMode === 1) {
                      shuffleArray(data);
                    }
                    data.forEach((item) => {
                      if (!itemsToPlay[item.kind]) {
                        itemsToPlay[item.kind] = [];
                      }
                      itemsToPlay[item.kind].push(item.id);
                    });
                    // loop through itemsToPlay
                    for (const kind in itemsToPlay) {
                      const ids = itemsToPlay[kind];
                      if (ids.length > 0) {
                        this.mk.playLater({ [kind + "s"]: itemsToPlay[kind] });
                      }
                    }
                  });
                });
            } else {
              const data = JSON.parse(parent.split("listitem-hr")[1] ?? "[]");
              const itemsToPlay = {};
              data.forEach((item) => {
                if (!itemsToPlay[item.kind]) {
                  itemsToPlay[item.kind] = [];
                }
                itemsToPlay[item.kind].push(item.id);
              });
              // loop through itemsToPlay
              this.mk.queue.splice(0, this.mk.queue._itemIDs.length);
              let ind = 0;
              for (const kind in itemsToPlay) {
                const ids = itemsToPlay[kind];
                if (ids.length > 0) {
                  if (this.mk.queue._itemIDs.length > 0) {
                    this.mk.playLater({ [kind + "s"]: itemsToPlay[kind] }).then(function () {
                      ind += 1;
                      console.log(ind, Object.keys(itemsToPlay).length);
                      if (ind >= Object.keys(itemsToPlay).length) {
                        this.mk.changeToMediaAtIndex(this.mk.queue._itemIDs.indexOf(item.attributes.playParams.id ?? item.id));
                      }
                    });
                  } else {
                    this.mk.setQueue({ [kind + "s"]: itemsToPlay[kind] }).then(function () {
                      ind += 1;
                      console.log(ind, Object.keys(itemsToPlay).length);
                      if (ind >= Object.keys(itemsToPlay).length) {
                        this.mk.changeToMediaAtIndex(this.mk.queue._itemIDs.indexOf(item.attributes.playParams.id ?? item.id));
                      }
                    });
                  }
                }
              }
            }
          });
        } else {
          this.mk.stop().then(() => {
            if (truekind === "playlists" && (id.startsWith("p.") || id.startsWith("pl.u"))) {
              this.mk
                .setQueue({
                  [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                  parameters: { l: this.mklang },
                })
                .then(function () {
                  this.mk.changeToMediaAtIndex(this.mk.queue._itemIDs.indexOf(item.id) ?? 1).then(function () {
                    if (this.showingPlaylist && this.showingPlaylist.id === id) {
                      const query = this.showingPlaylist.relationships.tracks.data.map((item) => new MusicKit.MediaItem(item));
                      const u = query;
                      if (this.mk.shuffleMode === 1) {
                        shuffleArray(u);
                      } else {
                        for (let i = 0; i < this.showingPlaylist.relationships.tracks.data.length; i++) {
                          if (this.showingPlaylist.relationships.tracks.data[i].id === item.id) {
                            u.splice(0, i + 1);
                            break;
                          }
                        }
                      }
                      this.mk.queue.append(u);
                    } else {
                      this.getPlaylistFromID(id, true).then(function () {
                        const query = this.showingPlaylist.relationships.tracks.data.map((item) => new MusicKit.MediaItem(item));
                        const u = query;
                        if (this.mk.shuffleMode === 1) {
                          shuffleArray(u);
                        } else {
                          for (let i = 0; i < this.showingPlaylist.relationships.tracks.data.length; i++) {
                            if (this.showingPlaylist.relationships.tracks.data[i].id === item.id) {
                              u.splice(0, i + 1);
                              break;
                            }
                          }
                        }
                        this.mk.queue.append(u);
                      });
                    }
                  });
                });
            } else {
              this.mk
                .setQueue({
                  [truekind]: [id],
                  parameters: { l: this.mklang },
                })
                .then(function (queue) {
                  if (item && queue._itemIDs[childIndex] !== item.id) {
                    childIndex = queue._itemIDs.indexOf(item.id);
                  }
                  if (childIndex !== -1) {
                    this.mk.changeToMediaAtIndex(childIndex);
                  } else if (item) {
                    this.mk
                      .playNext({
                        [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                      })
                      .then(function () {
                        this.mk.changeToMediaAtIndex(this.mk.queue._itemIDs.indexOf(item.id) ?? 1);
                        this.mk.play();
                      });
                  } else {
                    this.mk.play();
                  }
                });
            }
          });
        }
      } catch (err) {
        console.log(err);
        try {
          this.mk.stop();
        } catch (e) {
          console.log(e);
        }
        this.playMediaItemById(
          item.attributes.playParams.id ?? item.id,
          item.attributes.playParams.kind ?? item.type,
          item.attributes.playParams.isLibrary ?? false,
          item.attributes.url,
        );
      }
    },
    seekTo: (time: number) => {
      this.mk.seekToTime(time);
    },
    volumeUp() {
      if (this.mk.volume + this.cfg.audio.volumeStep > this.cfg.audio.maxVolume) {
        this.mk.volume = this.cfg.audio.maxVolume;
      } else {
        this.mk.volume = (Math.floor(this.mk.volume * 100) + this.cfg.audio.volumeStep * 100) / 100;
      }
    },
    volumeDown() {
      if (this.mk.volume - this.cfg.audio.volumeStep < 0) {
        this.mk.volume = 0;
      } else {
        this.mk.volume = (Math.floor(this.mk.volume * 100) - this.cfg.audio.volumeStep * 100) / 100;
      }
    },
    volumeWheel(event) {
      checkScrollDirectionIsUp(event) ? this.volumeUp() : this.volumeDown();
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
      switch (this.mk.repeatMode) {
        default:
        case MusicKit.PlayerRepeatMode.none:
          this.mk.repeatMode = MusicKit.PlayerRepeatMode.all;
          break;

        case MusicKit.PlayerRepeatMode.all:
          this.mk.repeatMode = MusicKit.PlayerRepeatMode.one;
          break;

        case MusicKit.PlayerRepeatMode.one:
          this.mk.repeatMode = MusicKit.PlayerRepeatMode.none;
          break;
      }
    },
    mkReady() {
      if (this.mk["nowPlayingItem"]) {
        return true;
      } else {
        return false;
      }
    },
    quickPlay(query) {
      MusicKit.getInstance()
        .api.search(query, { limit: 2, types: "songs" })
        .then(function (data) {
          MusicKit.getInstance()
            .setQueue({
              song: data["songs"]["data"][0]["id"],
              parameters: { l: this.mklang },
            })
            .then(function (queue) {
              MusicKit.getInstance().play();
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
    fetchPlaylist(id, callback) {
      // id can be found in playlist.attributes.playParams.globalId
      // this.mk.api.
      this.mk.api.v3.music(`/v1/catalog/${this.mk.storefrontId}/playlists/${id}`).then((res) => {
        callback(res.data.data[0]);
      });

      // tracks are found in relationship.data
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
        const item = await MusicKit.getInstance().api.v3.music(`v1/storefronts/${this.mk.storefrontId}`);
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
    mediaKeyFixes() {
      MusicKitInterop.initMediaSession();
      // navigator.mediaSession.setActionHandler("previoustrack", function () {
      //   this.skipToPreviousItem();
      // });
      // navigator.mediaSession.setActionHandler("nexttrack", function () {
      //   this.skipToNextItem();
      // });
    },
    // end mk stuff
  })),
);
