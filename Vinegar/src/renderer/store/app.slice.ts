import { ipcRenderer } from "electron";
import { StateCreator } from "zustand";

import {
  checkScrollDirectionIsUp,
  formatTimezoneOffset,
  hmsToSecondsOnly,
  notyf,
  parseTime,
  stringToXml,
  toMS,
  xmlToJson,
} from "../main/helpers.js";
import { AppState, GeneralState } from "./store.js";

type AppStateCreator = StateCreator<GeneralState, [["zustand/immer", never], never], [], { app: AppState }>;

export const createAppSlice: AppStateCreator = (set, get) => ({
  app: {
    // --- STATE (from vuex-store) ---
    version: ipcRenderer.sendSync("get-version"),
    appMode: "player",
    isDev: ipcRenderer.sendSync("is-dev"),
    clientPort: ipcRenderer.sendSync("get-port"),
    platform: "",
    mk: ipcRenderer.sendSync("get-mk-instance"),
    pluginInstalled: false,
    pluginMenuEntries: [],
    pluginMenuTopEntries: [],
    lz: ipcRenderer.sendSync("get-i18n", "en"),
    lzListing: ipcRenderer.sendSync("get-i18n-listing"),
    radiohls: {},
    fullscreenLyrics: false,
    fullscreenState: ipcRenderer.sendSync("getFullScreen"),
    browsepage: {},
    listennow: { timestamp: 0 },
    madeforyou: [],
    radio: {},
    mklang: "en",
    webview: {
      url: "",
      title: "",
      loading: false,
    },
    appleCurator: [],
    multiroom: [],

    webremoteurl: "",
    webremoteqr: "",
    mxmtoken: "",
    mkIsReady: false,
    animateBackground: false,
    currentArtUrl: "",
    currentArtUrlRaw: "",
    mvViewMode: "full",
    lyricon: false,
    currentTrackID: "",
    lyrics: [],
    currentLyricsLine: 0,
    richlyrics: [],
    lyricsMediaItem: "",
    lyricsDebug: {
      current: 0,
      start: 0,
      end: 0,
    },
    lyricOffset: 0,
    v3: {
      requestBody: {
        platform: "web",
      },
    },
    tmpHeight: "",
    tmpWidth: "",
    tmpX: "",
    tmpY: "",
    miniTmpX: "",
    miniTmpY: "",
    tmpVar: [],
    notification: false,
    hintscontext: false,
    collectionList: {
      response: {},
      title: "",
      type: "",
    },
    MVsource: null,
    currentSongInfo: {},
    songstest: false,
    hangtimer: null,
    routes: ["browse", "listen_now", "radio"],
    musicBaseUrl: "https://api.music.apple.com/",

    pauseButtonTimer: null,
    activeCasts: [],
    moreinfodata: [],
    idleState: false,
    appVisible: true,
    currentAirPlayCodeID: "",
    airplayTrys: [],
    // lyrics stuff
    parseTTML: () =>
      set((state) => {
        state.lyrics = [];
        const preLrc = [];
        const xml = stringToXml(get().lyricsMediaItem);
        const lyricsLines = xml.getElementsByTagName("p");
        let synced = true;
        const endTimes = [];
        if (xml.getElementsByTagName("tt")[0].getAttribute("itunes:timing") === "None") {
          synced = false;
        }
        endTimes.push(0);
        if (synced) {
          for (const element of lyricsLines) {
            const start = toMS(element.getAttribute("begin") || "");
            const end = toMS(element.getAttribute("end") || "");
            if (start - endTimes[endTimes.length - 1] > 5 && endTimes[endTimes.length - 1] !== 0) {
              preLrc.push({
                startTime: endTimes[endTimes.length - 1],
                endTime: start,
                line: "lrcInstrumental",
              });
            }
            preLrc.push({
              startTime: start,
              endTime: end,
              line: element.textContent,
            });
            endTimes.push(end);
          }
          // first line dot
          if (preLrc.length > 0)
            preLrc.unshift({
              startTime: 0,
              endTime: preLrc[0].startTime,
              line: "lrcInstrumental",
            });
        } else {
          for (const element of lyricsLines) {
            preLrc.push({
              startTime: 9999999,
              endTime: 9999999,
              line: element.textContent,
            });
          }
        }
        state.lyrics = preLrc;
      }),
    parseLyrics: () =>
      set((state) => {
        const xml = stringToXml(get().lyricsMediaItem);
        const json = xmlToJson(xml);
        state.lyrics = json as typeof state.lyrics;
      }),
    loadLyrics() {
      const musicType =
        MusicKit.getInstance().player.nowPlayingItem !== null ? (MusicKit.getInstance().player.nowPlayingItem["type"] ?? "") : "";
      // console.log("mt", musicType)
      if (musicType === "musicVideo") {
        get().loadYTLyrics();
      } else {
        // only load MXM lyrics if AM lyrics failed to load
        if (this.cfg.lyrics.enable_mxm) {
          get().loadMXM();
        } else {
          get().loadAMLyrics();
        }
      }
    },
    loadAMLyrics: () =>
      set((state) => {
        const songID =
          get().mk.player.nowPlayingItem !== null
            ? (get().mk.player.nowPlayingItem["_songId"] ?? get().mk.player.nowPlayingItem["songId"] ?? -1)
            : -1;
        // get().getMXM( trackName, artistName, 'en', duration);
        if (songID !== -1) {
          get()
            .mk.api.music(`v1/catalog/${get().mk.storefrontId}/songs/${songID}/lyrics`)
            .then((response) => {
              const res = response as MusicKit.SongSearchResponse;
              state.lyricsMediaItem = res.data.results.songs.data[0]?.attributes?.attribution || "";
              get().parseTTML();
            })
            .catch(() => {
              if (this.cfg.lyrics.enable_mxm) {
                get().loadQQLyrics();
              } else {
                get().loadMXM();
              }
            });
        } else {
          if (this.cfg.lyrics.enable_mxm) {
            get().loadQQLyrics(); // since mxm is already prioritized, we can just load qq lyrics if am fails
          } else {
            get().loadMXM();
          }
        }
      }),
    loadYTLyrics: () =>
      set((state) => {
        const track = get().mk.player.nowPlayingItem !== null ? (get().mk.player.nowPlayingItem.title ?? "") : "";
        const artist = get().mk.player.nowPlayingItem !== null ? (get().mk.player.nowPlayingItem.artistName ?? "") : "";
        const time =
          get().mk.player.nowPlayingItem !== null
            ? (Math.round((get().mk.player.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1)
            : -1;
        window.electronAPI.invoke("getYTLyrics", track, artist).then((result) => {
          if (result.length > 0) {
            const ytid = result[0]["id"]["videoId"];
            if (this.cfg.lyrics.enable_yt) {
              loadYT(ytid, this.cfg.lyrics.mxm_language ?? "en");
            } else {
              get().loadMXM();
            }
          } else {
            get().loadMXM();
          }

          function loadYT(id: string, lang: string) {
            const req = new XMLHttpRequest();
            const url = `https://www.youtube.com/watch?&v=${id}`;
            req.open("GET", url, true);
            req.onerror = function (e) {
              get().loadMXM();
            };
            req.onload = function () {
              const res = this.responseText;
              const captionurl1 = res.substring(
                res.indexOf(`{"playerCaptionsRenderer":{"baseUrl":"`) + `{"playerCaptionsRenderer":{"baseUrl":"`.length,
              );
              const captionurl = captionurl1.substring(0, captionurl1.indexOf(`"`));
              if (captionurl.includes("timedtext")) {
                const json = JSON.parse(`{"url": "${captionurl}"}`);
                const newurl = json.url + `&lang=${lang}&format=ttml`;

                const req2 = new XMLHttpRequest();

                req2.open("GET", newurl, true);
                req2.onerror = function (e) {
                  get().loadMXM();
                };
                req2.onload = function () {
                  try {
                    const ttmlLyrics = this.responseText;
                    if (ttmlLyrics) {
                      state.lyricsMediaItem = ttmlLyrics;
                      get().parseTTML();
                    }
                  } catch (e) {
                    get().loadMXM();
                  }
                };
                req2.send();
              } else {
                get().loadMXM();
              }
            };
            req.send();
          }
        });
      }),
    loadMXM: () =>
      set((state) => {
        let attempt = 0;
        const track = encodeURIComponent(get().mk.player.nowPlayingItem !== null ? (get().mk.player.nowPlayingItem.title ?? "") : "");
        const artist = encodeURIComponent(get().mk.player.nowPlayingItem !== null ? (get().mk.player.nowPlayingItem.artistName ?? "") : "");
        const time = encodeURIComponent(
          get().mk.player.nowPlayingItem !== null
            ? (Math.round((get().mk.player.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1)
            : -1,
        );
        const id = encodeURIComponent(
          get().mk.player.nowPlayingItem !== null
            ? (get().mk.player.nowPlayingItem._songId ?? get().mk.player.nowPlayingItem["songId"] ?? "")
            : "",
        );
        let lrcfile = "";
        let richsync: { startTime: number; endTime: number; line: string; translation?: string }[] = [];
        const lang = this.cfg.lyrics.mxm_language; //  translation language
        function revisedRandId() {
          return Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, "")
            .slice(2, 10);
        }

        /* get token */
        function getToken(mode: number, track: string, artist: string, songid: string, lang: string, time: string, id?: string) {
          if (attempt > 2) {
            get().loadNeteaseLyrics();
            // app.loadAMLyrics();
          } else {
            attempt = attempt + 1;
            const url = "https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0&t=" + revisedRandId();
            const req = new XMLHttpRequest();
            req.overrideMimeType("application/json");
            req.open("GET", url, true);
            req.setRequestHeader("authority", "apic-desktop.musixmatch.com");
            req.onload = function () {
              try {
                const jsonResponse = JSON.parse(this.responseText);
                const status2 = jsonResponse["message"]["header"]["status_code"];
                if (status2 === 200) {
                  const token = jsonResponse["message"]["body"]["user_token"] ?? "";
                  if (token !== "" && token !== "UpgradeOnlyUpgradeOnlyUpgradeOnlyUpgradeOnly") {
                    console.debug("200 token", mode);
                    // token good
                    state.mxmtoken = token;

                    if (mode === 1) {
                      getMXMSubs(track, artist, state.mxmtoken, lang, time, id);
                    } else {
                      getMXMTrans(songid, lang, state.mxmtoken);
                    }
                  } else {
                    console.debug("fake 200 token");
                    getToken(mode, track, artist, songid, lang, time);
                  }
                } else {
                  // console.log('token 4xx');
                  getToken(mode, track, artist, songid, lang, time);
                }
              } catch (e) {
                console.log("error");
                get().loadQQLyrics();
                //app.loadAMLyrics();
              }
            };
            req.onerror = function () {
              console.log("error");
              get().loadQQLyrics();
              // app.loadAMLyrics();
            };
            req.send();
          }
        }

        function getMXMSubs(track: string, artist: string, token: string, lang: string, time: string, id?: string) {
          const usertoken = encodeURIComponent(token);
          const richsyncQuery = this.cfg.lyrics.mxm_karaoke ? "&optional_calls=track.richsync" : "";
          const timecustom =
            !time || (time && time < 0) ? "" : `&f_subtitle_length=${time}&q_duration=${time}&f_subtitle_length_max_deviation=40`;
          const itunesid = id && id !== "" ? `&track_itunes_id=${id}` : "";
          const url =
            "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched" +
            richsyncQuery +
            "&subtitle_format=lrc&q_artist=" +
            artist +
            "&q_track=" +
            track +
            itunesid +
            "&usertoken=" +
            usertoken +
            timecustom +
            "&app_id=web-desktop-app-v1.0&t=" +
            revisedRandId();
          const req = new XMLHttpRequest();
          req.overrideMimeType("application/json");
          req.open("GET", url, true);
          req.setRequestHeader("authority", "apic-desktop.musixmatch.com");
          req.onload = function () {
            try {
              const jsonResponse = JSON.parse(this.responseText);
              console.debug(jsonResponse);
              const status1 = jsonResponse["message"]["header"]["status_code"];

              if (status1 === 200) {
                let id = "";
                try {
                  if (
                    jsonResponse["message"]["body"]["macro_calls"]["matcher.track.get"]["message"]["header"]["status_code"] === 200 &&
                    jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["header"]["status_code"] === 200
                  ) {
                    id = jsonResponse["message"]["body"]["macro_calls"]["matcher.track.get"]["message"]["body"]["track"]["track_id"] ?? "";
                    lrcfile =
                      jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["body"]["subtitle_list"][0][
                        "subtitle"
                      ]["subtitle_body"];

                    try {
                      const lrcrich =
                        jsonResponse["message"]["body"]["macro_calls"]["track.richsync.get"]["message"]["body"]["richsync"][
                          "richsync_body"
                        ];
                      richsync = JSON.parse(lrcrich);
                      state.richlyrics = richsync;
                    } catch (_) {}
                  }

                  if (lrcfile === "") {
                    get().loadQQLyrics();
                    // app.loadAMLyrics()
                  } else {
                    if (richsync.length === 0) {
                      console.log("ok");
                      // process lrcfile to json here
                      state.lyricsMediaItem = lrcfile;
                      const u = get().lyricsMediaItem.split(/[\r\n]/);
                      const preLrc = [];
                      for (let i = u.length - 1; i >= 0; i--) {
                        const xline = /(\[[0-9.:\[\]]*\])+(.*)/.exec(u[i]);
                        const end: number = preLrc.length > 0 ? (preLrc[preLrc.length - 1].startTime ?? 99999) : 99999;
                        preLrc.push({
                          startTime: toMS(xline![1].substring(1, xline![1].length - 2)) ?? 0,
                          endTime: end,
                          line: xline![2],
                          translation: "",
                        });
                      }
                      if (preLrc.length > 0)
                        preLrc.push({
                          startTime: 0,
                          endTime: preLrc[preLrc.length - 1].startTime,
                          line: "lrcInstrumental",
                          translation: "",
                        });
                      state.lyrics = preLrc.reverse();
                    } else {
                      const preLrc = richsync.map(function (item) {
                        return {
                          startTime: item.startTime,
                          endTime: item.endTime,
                          line: item.line,
                          translation: "",
                        };
                      });
                      if (preLrc.length > 0)
                        preLrc.unshift({
                          startTime: 0,
                          endTime: preLrc[0].startTime,
                          line: "lrcInstrumental",
                          translation: "",
                        });
                      state.lyrics = preLrc;
                    }
                    if (lrcfile !== null && lrcfile !== "") {
                      // load translation
                      getMXMTrans(id, lang, token);
                    } else {
                      // app.loadAMLyrics()
                      get().loadQQLyrics();
                    }
                  }
                } catch (e) {
                  console.log(e);
                  get().loadQQLyrics();
                  //  app.loadAMLyrics()
                }
              } else {
                //4xx rejected
                getToken(1, track, artist, "", lang, time);
              }
            } catch (e) {
              console.log(e);
              get().loadQQLyrics();
              //app.loadAMLyrics()
            }
          };
          req.onerror = function () {
            get().loadQQLyrics();
            console.log("error");
            // get().loadAMLyrics();
          };
          req.send();
        }

        function getMXMTrans(id: string, lang: string, token: string) {
          if (lang !== "disabled" && id !== "") {
            const usertoken = encodeURIComponent(token);
            const url2 =
              "https://apic-desktop.musixmatch.com/ws/1.1/crowd.track.translations.get?translation_fields_set=minimal&selected_language=" +
              lang +
              "&track_id=" +
              id +
              "&comment_format=text&part=user&format=json&usertoken=" +
              usertoken +
              "&app_id=web-desktop-app-v1.0&t=" +
              revisedRandId();
            const req2 = new XMLHttpRequest();
            req2.overrideMimeType("application/json");
            req2.open("GET", url2, true);
            req2.setRequestHeader("authority", "apic-desktop.musixmatch.com");
            req2.onload = function () {
              try {
                const jsonResponse2 = JSON.parse(this.responseText);
                console.log(jsonResponse2);
                const status2 = jsonResponse2["message"]["header"]["status_code"];
                if (status2 === 200) {
                  try {
                    const preTrans = [];
                    const u = get().lyrics;
                    const translation_list = jsonResponse2["message"]["body"]["translations_list"];
                    if (translation_list.length > 0) {
                      for (let i = 0; i < u.length - 1; i++) {
                        preTrans[i] = "";
                        for (const trans_line of translation_list) {
                          if (
                            u[i].line === " " + trans_line["translation"]["matched_line"] ||
                            u[i].line === trans_line["translation"]["matched_line"]
                          ) {
                            u[i].translation = trans_line["translation"]["description"];
                            break;
                          }
                        }
                      }
                      state.lyrics = u;
                    }
                  } catch (e) {
                    /// not found trans -> ignore
                  }
                } else {
                  //4xx rejected
                  getToken(2, "", "", id, lang, "");
                }
              } catch (e) {
                console.log(e);
              }
            };
            req2.send();
          }
        }

        if (track !== "" && track !== "No Title Found") {
          if (get().mxmtoken !== null && get().mxmtoken !== "") {
            getMXMSubs(track, artist, get().mxmtoken, lang, time, id);
          } else {
            getToken(1, track, artist, "", lang, time);
          }
        }
      }),
    loadNeteaseLyrics: () =>
      set((state) => {
        const track = encodeURIComponent(get().mk.player.nowPlayingItem !== null ? (get().mk.player.nowPlayingItem.title ?? "") : "");
        const artist = encodeURIComponent(get().mk.player.nowPlayingItem !== null ? (get().mk.player.nowPlayingItem.artistName ?? "") : "");
        const time = encodeURIComponent(
          get().mk.player.nowPlayingItem !== null
            ? (Math.round((get().mk.player.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1)
            : -1,
        );
        const url = `http://music.163.com/api/search/get/?csrf_token=hlpretag=&hlposttag=&s=${track + " " + artist}&type=1&offset=0&total=true&limit=6`;
        const req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open("GET", url, true);
        req.onload = function () {
          try {
            const jsonResponse = JSON.parse(req.responseText);
            const id = jsonResponse["result"]["songs"][0]["id"];
            const url2 = "https://music.163.com/api/song/lyric?os=pc&id=" + id + "&lv=-1&kv=-1&tv=-1";
            const req2 = new XMLHttpRequest();
            req2.overrideMimeType("application/json");
            req2.open("GET", url2, true);
            req2.onload = function () {
              try {
                const jsonResponse2 = JSON.parse(req2.responseText);
                const lrcfile = jsonResponse2["lrc"]["lyric"];
                state.lyricsMediaItem = lrcfile;
                const u = get().lyricsMediaItem.split(/[\n]/);
                const preLrc = [];
                for (let i = u.length - 1; i >= 0; i--) {
                  const xline = /(\[[0-9.:\[\]]*\])+(.*)/.exec(u[i]);
                  if (xline !== null) {
                    const end = preLrc.length > 0 ? (preLrc[preLrc.length - 1].startTime ?? 99999) : 99999;
                    preLrc.push({
                      startTime: toMS(xline[1].substring(1, xline[1].length - 2)) ?? 0,
                      endTime: end,
                      line: xline[2],
                      translation: "",
                    });
                  }
                }
                if (preLrc.length > 0)
                  preLrc.push({
                    startTime: 0,
                    endTime: preLrc[preLrc.length - 1].startTime,
                    line: "lrcInstrumental",
                    translation: "",
                  });
                state.lyrics = preLrc.reverse();
              } catch (e) {
                state.lyrics = [];
              }
            };
            req2.onerror = function () {};
            req2.send();
          } catch (e) {
            state.lyrics = [];
          }
        };
        req.send();
        req.onerror = function () {};
      }),
    loadQQLyrics: () =>
      set((state) => {
        if (!this.cfg.lyrics.enable_qq) return;
        const track = encodeURIComponent(get().mk.player.nowPlayingItem !== null ? (get().mk.player.nowPlayingItem.title ?? "") : "");
        const artist = encodeURIComponent(get().mk.player.nowPlayingItem !== null ? (get().mk.player.nowPlayingItem.artistName ?? "") : "");
        const time = encodeURIComponent(
          get().mk.player.nowPlayingItem !== null
            ? (Math.round((get().mk.player.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1)
            : -1,
        );
        const url = `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?w=${track + " " + artist}&t=0&n=1&page=1&cr=1&new_json=1&format=json&platform=yqq.json`;

        const req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open("GET", url, true);
        req.onload = function () {
          try {
            const jsonResponse = JSON.parse(req.responseText);
            const id = jsonResponse?.data?.song?.list[0]?.mid;
            console.log(jsonResponse);
            const usz = new Date().getTime();
            const url2 = `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?-=MusicJsonCallback_lrc&songmid=${id}&pcachetime=${usz}&g_tk=5381&loginUin=3003436226&hostUin=0&inCharset=utf-8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0`;
            const req2 = new XMLHttpRequest();
            req2.overrideMimeType("application/json");
            req2.open("GET", url2, true);
            req2.onload = function () {
              try {
                function b64_to_utf8(str: string) {
                  return decodeURIComponent(escape(window.atob(str)));
                }

                const htmlDecode = (input: string) => {
                  const doc = new DOMParser().parseFromString(input, "text/html");
                  return doc.documentElement.textContent;
                };
                const jsonResponse2 = JSON.parse(req2.responseText.replace("MusicJsonCallback(", "").replace("})", "}"));
                const lrcfile = htmlDecode(b64_to_utf8(jsonResponse2["lyric"]));
                state.lyricsMediaItem = lrcfile;
                const u = state.lyricsMediaItem.split(/[\n]/);

                const preLrc = [];
                for (let i = u.length - 1; i >= 0; i--) {
                  const xline = /(\[[0-9.:\[\]]*\])+(.*)/.exec(u[i]);
                  if (xline !== null) {
                    const end: number = preLrc.length > 0 ? (preLrc[preLrc.length - 1].startTime ?? 99999) : 99999;
                    preLrc.push({
                      startTime: toMS(xline[1].substring(1, xline[1].length - 2)) ?? 0,
                      endTime: end,
                      line: xline[2],
                      translation: "",
                    });
                  }
                }
                if (preLrc.length > 0)
                  preLrc.push({
                    startTime: 0,
                    endTime: preLrc[preLrc.length - 1].startTime,
                    line: "lrcInstrumental",
                    translation: "",
                  });
                state.lyrics = preLrc.reverse();
                if (state.lyrics[5].line === "") {
                  get().loadNeteaseLyrics();
                } // Detect incomplete QQ lyrics.
              } catch (e) {
                console.log(e);
                get().loadNeteaseLyrics();
                state.lyrics = [];
              }
            };
            req2.onerror = function () {
              get().loadNeteaseLyrics();
            };
            req2.send();
          } catch (e) {
            console.log(e);
            get().loadNeteaseLyrics();
            state.lyrics = [];
          }
        };
        req.onerror = function () {
          get().loadNeteaseLyrics();
        };
        req.send();
      }),
    // end lyrics stuff
    _fetch(url: string, opts = {}) {
      if (this.cfg.advanced.experiments.includes("cider_mirror")) {
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
      document.querySelector("#LOADER")!.remove();

      window.electronAPI.on("recv-cookies", function (_event, cookies) {
        console.log("[appIPC] recv-cookies");
        Object.keys(cookies).forEach((key) => {
          localStorage.setItem(key, cookies[key]);
        });
        localStorage.setItem("seenOOBE", 1);
        window.location.reload();
      });
    },
    songLinkShare(amUrl: string) {
      notyf.open({
        type: "info",
        className: "notyf-info",
        message: this.getLz("term.song.link.generate"),
      });
      const httpRequest = new XMLHttpRequest();
      httpRequest.open("GET", `https://api.song.link/v1-alpha.1/links?url=${amUrl}&userCountry=US`, true);
      httpRequest.send();
      httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200) {
            const response = JSON.parse(httpRequest.responseText);
            console.debug(response);
            this.copyToClipboard(response.pageUrl);
          } else {
            console.warn("There was a problem with the request.");
            notyf.error(this.getLz("term.requestError"));
          }
        }
      };
    },

    async setLz(lang: string) {
      if (lang === "") {
        lang = this.cfg.general.language;
      }
      this.lz = window.electronAPI.sendSync("get-i18n", lang);
      get().mklang = await get().mkJSLang();
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
    getLz(message: string, options: Record<string, number> = {}) {
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
    getProfileLz(type: string, name: string) {
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
      this.library.songs.sortingOptions = {
        albumName: this.getLz("term.sortBy.album"),
        artistName: this.getLz("term.sortBy.artist"),
        name: this.getLz("term.sortBy.name"),
        genre: this.getLz("term.sortBy.genre"),
        releaseDate: this.getLz("term.sortBy.releaseDate"),
        durationInMillis: this.getLz("term.sortBy.duration"),
        dateAdded: this.getLz("term.sortBy.dateAdded"),
      };

      this.library.library.albums.sortingOptions = {
        artistName: this.getLz("term.sortBy.artist"),
        name: this.getLz("term.sortBy.name"),
        genre: this.getLz("term.sortBy.genre"),
        releaseDate: this.getLz("term.sortBy.releaseDate"),
        dateAdded: this.getLz("term.sortBy.dateAdded"),
      };

      this.library.library.artists.sortingOptions = {
        artistName: this.getLz("term.sortBy.artist"),
        name: this.getLz("term.sortBy.name"),
        genre: this.getLz("term.sortBy.genre"),
        releaseDate: this.getLz("term.sortBy.releaseDate"),
      };

      this.lz.repeat = {
        0: this.lz["term.repeat.all"] ?? this.lz["term.repeat"],
        1: this.lz["term.repeat.none"] ?? this.lz["term.disableRepeat"],
        2: this.lz["term.repeat.one"] ?? this.lz["term.enableRepeatOne"],
      };
    },

    async quit() {
      await window.electronAPI.invoke("quit-app");
    },

    modularUITest(val: boolean = false) {
      this.fullscreenLyrics = val;
      if (val) {
        document.querySelector("#app-main").classList.add("modular-fs");
      } else {
        document.querySelector("#app-main").classList.remove("modular-fs");
      }
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

    unauthorize() {
      this.confirm(this.getLz("term.confirmLogout"), function (result: boolean) {
        if (result) {
          get().mk.unauthorize();
          document.location.reload();
        }
      });
    },

    copyToClipboard(str: string) {
      // if (navigator.userAgent.includes('Darwin') || navigator.appVersion.indexOf("Mac") !== -1) {
      // this.darwinShare(str)
      // } else {
      notyf.success(this.getLz("term.share.success"));
      navigator.clipboard.writeText(str).then((r) => console.debug("Copied to clipboard."));
      // }
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

    async getListenNow(attempt = 0) {
      if (this.listennow.timestamp > Date.now() - 120000) {
        return;
      }

      if (attempt > 3) {
        return;
      }
      try {
        const _listennow = await get().mk.api.music(`v1/me/recommendations?timezone=${encodeURIComponent(formatTimezoneOffset())}`, {
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
          l: get().mklang,
          includeResponseMeta: !0,
          reload: !0,
        });
        this.listennow.response = (_listennow as MusicKit.SongSearchResponse).data.results.songs.data;
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
        get()
          .mk.api.music(`/v1/editorial/${get().mk.storefrontId}/groupings`, {
            platform: "web",
            name: "radio",
            "omit[resource:artists]": "relationships",
            "include[albums]": "artists",
            "include[songs]": "artists",
            "include[music-videos]": "artists",
            extend: "editorialArtwork,artistUrl",
            "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
            "art[url]": "f",
            l: get().mklang,
          })
          .then((radio) => {
            this.radio = radio.data.data[0];
            console.debug(this.radio);
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
        const browse = await get().mk.api.music(`/v1/editorial/${get().mk.storefrontId}/groupings`, {
          platform: "web",
          name: "music",
          "omit[resource:artists]": "relationships",
          "include[albums]": "artists",
          "include[songs]": "artists",
          "include[music-videos]": "artists",
          extend: "editorialArtwork,artistUrl",
          "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
          "art[url]": "f",
          l: get().mklang,
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
        const mfu = await get().mk.api.music(
          "/v1/me/library/playlists?platform=web&extend=editorialVideo&fields%5Bplaylists%5D=lastModifiedDate&filter%5Bfeatured%5D=made-for-you&include%5Blibrary-playlists%5D=catalog&fields%5Blibrary-playlists%5D=artwork%2Cname%2CplayParams%2CdateAdded",
        );
        this.madeforyou = (mfu as MusicKit.SearchResponse<MusicKit.Curators>).data.results.Curators.data[0];
      } catch (e) {
        console.log(e);
        this.getMadeForYou(attempt + 1);
      }
    },
    async getTypeFromID(
      kind: string,
      id: number,
      isLibrary = false,
      params: Record<string, string> = {},
      params2: Record<string, string> = {},
    ) {
      let a;
      if (kind === "album" || kind === "albums") {
        params.include = "tracks,artists,record-labels,catalog";
      }
      params.l = get().mklang;
      try {
        a = await get().mkapi(kind.toString(), isLibrary, id.toString(), params, params2);
      } catch (e) {
        console.debug(e);
        try {
          a = await get().mkapi(kind.toString(), !isLibrary, id.toString(), params, params2);
        } catch (err) {
          console.log(err);
          a = [];
        } finally {
          if (kind === "appleCurator") {
            this.appleCurator = a.data.data[0];
          } else if (kind === "multiroom" || kind === "room") {
            this.multiroom = a.data.data[0];
          } else {
            this.getPlaylistContinuous(a, true);
          }
        }
      } finally {
        if (kind === "appleCurator") {
          this.appleCurator = a.data.data[0];
        } else if (kind === "multiroom" || kind === "room") {
          this.multiroom = a.data.data[0];
        } else {
          this.getPlaylistContinuous(a, true);
        }
      }
    },

    getCurrentTime() {
      return parseFloat(
        hmsToSecondsOnly(
          parseTime(get().mk.player.nowPlayingItem.attributes.durationInMillis - get().mk.player.currentPlaybackTimeRemaining * 1000),
        ) + "",
      );
    },
    getLyricBGStyle(start: string, end: string) {
      const currentTime = this.getCurrentTime();
      // let duration = get().mk.player.nowPlayingItem.attributes.durationInMillis
      const start2 = hmsToSecondsOnly(start);
      const end2 = hmsToSecondsOnly(end);
      // let currentProgress = ((100 * (currentTime)) / (end2))
      // check if currenttime is between start and end
      this.player.lyricsDebug.start = start2;
      this.player.lyricsDebug.end = end2;
      this.player.lyricsDebug.current = currentTime;
      if (currentTime >= start2 && currentTime <= end2) {
        return {
          "--bgSpeed": `${end2 - start2}s`,
        };
      } else {
        return {};
      }
    },
    setAirPlayCodeUI(identifier: string) {
      this.modals.airplayPW = true;
      this.currentAirPlayCodeID = identifier;
    },
    sendAirPlaySuccess(silent = false, identifier = "") {
      if (!silent) {
        notyf.success("Device paired successfully!");
      }
      console.log("delete idx-pre", identifier);
      const idx = get().airplayTrys.findIndex((a) => {
        return a.id === identifier;
      });
      console.log("delete idx", idx);
      if (idx !== -1) delete this.airplayTrys[idx];
      get().airplayTrys = get().airplayTrys.filter((n) => n);
    },
    sendAirPlayFailed() {
      notyf.success("Device paring failed!");
    },
    airplayDisconnect: (dropped: boolean, array = [], identifier = "") =>
      set((state) => {
        console.log("airplay dropped", dropped, array, identifier);
        if (dropped) {
          const [ipv4, ipport, sepassword, title, artist, album, artworkURL, txt, airplay2dv] = array;
          console.log(ipv4, ipport, sepassword, title, artist, album, artworkURL, txt, airplay2dv);
          let idx = state.airplayTrys.findIndex((a) => {
            return a.id === ipv4 + ":" + ipport + "ap";
          });
          if (idx === -1) {
            state.airplayTrys.push({
              id: ipv4 + ":" + ipport + "ap",
              attempts: 1,
            });
          }
          idx = state.airplayTrys.findIndex((a) => {
            return a.id === ipv4 + ":" + ipport + "ap";
          });
          if (state.airplayTrys[idx].attempts > 3) {
            delete state.airplayTrys[idx];
            state.airplayTrys = state.airplayTrys.filter((n) => n);
            console.log("delete idx", idx);
            return;
          } else {
            state.airplayTrys[idx].attempts = state.airplayTrys[idx].attempts + 1;
            setTimeout(() => {
              window.electronAPI.send(
                "performAirplayPCM",
                ipv4,
                ipport,
                sepassword,
                title,
                artist,
                album,
                artworkURL,
                txt,
                airplay2dv,
                true,
              );
            }, 1000);
          }
        } else {
          state.activeCasts = [];
          notyf.error("Devices disconnected!");
        }
      }),
    authCC() {
      window.electronAPI.send("cc-auth");
    },
    _playRadioStream: (e) =>
      set((state) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = process;
        xhr.open("GET", e, true);
        xhr.send();

        function process() {
          if (xhr.readyState === 4) {
            const sources = xhr.responseText.match(/^(?!#)(?!\s).*$/gm)?.filter(function (element) {
              return element;
            });
            // Load first source
            const src = sources![0];
            if (src.includes("http")) {
              get().mk._services.mediaItemPlayback._currentPlayer._playAssetURL(src, false);
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
                if (state.radiohls !== null && state.radiohls.destroy !== null) {
                  state.radiohls.destroy();
                  state.radiohls = null;
                  state.radiohls = new CiderHls();
                  state.radiohls.loadSource(e);
                  state.radiohls.attachMedia(get().mk._services.mediaItemPlayback._currentPlayer._targetElement);
                  get().mk._services.mediaItemPlayback._currentPlayer._targetElement.play();
                } else {
                  state.radiohls = null;
                  state.radiohls = new CiderHls();
                  state.radiohls.loadSource(e);
                  state.radiohls.attachMedia(get().mk._services.mediaItemPlayback._currentPlayer._targetElement);
                  get().mk._services.mediaItemPlayback._currentPlayer._targetElement.play();
                }
              }
            }
          }
        }
      }),
    confirm(message: string, callback: (...args: any[]) => void) {
      bootbox.confirm(this.getBootboxParams(null, message, callback));
    },
    prompt(title: string, callback: (...args: any[]) => void) {
      bootbox.prompt(this.getBootboxParams(title, null, callback));
    },
    getBootboxParams(title: string, message: string, callback: (...args: any[]) => void) {
      return {
        title: title,
        message: message,
        buttons: {
          confirm: {
            label: this.getLz("dialog.ok"),
          },
          cancel: {
            label: this.getLz("dialog.cancel"),
          },
        },
        callback: function (result) {
          if (callback) callback(result);
        },
      };
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
        this.appMode = "mini";
      } else {
        this.miniTmpX = window.screenX;
        this.miniTmpY = window.screenY;
        window.electronAPI.send("windowmin", 844, 410);
        window.electronAPI.send("windowresize", this.tmpWidth, this.tmpHeight, false);
        window.electronAPI.send("windowmove", this.tmpX, this.tmpY);
        window.electronAPI.send("windowontop", false);
        //this.cfg.visual.miniplayer_top_toggle = true;
        this.appMode = "player";
      }
    },

    setMkPrivateEnabled: (newValue) =>
      set((state) => {
        state.mk.privateEnabled = newValue;
        ipcRenderer.send("onPrivacyModeChange", newValue);
      }),

    // mk stuff
    prevButton() {
      if (get().mk.player.nowPlayingItem && get().mk.player.currentPlaybackTime > 2) {
        get().mk.player.seekToTime(0);
      } else {
        get().mk.player.skipToPreviousItem();
      }
    },
    isDisabled() {
      return !get().mk.player.nowPlayingItem || get().mk.player.nowPlayingItem.attributes.playParams.kind === "radioStation";
    },
    isPrevDisabled() {
      return get().isDisabled() || (get().mk.player.queue._position === 0 && get().mk.player.currentPlaybackTime <= 2);
    },
    isNextDisabled() {
      return get().isDisabled() || get().mk.player.queue._position + 1 === get().mk.player.queue.length;
    },
    skipToNextItem() {
      if (get().mk.player.queue.nextPlayableItemIndex !== -1 && get().queue.nextPlayableItemIndex !== null)
        get().mk.player.changeToMediaAtIndex(get().mk.player.queue.nextPlayableItemIndex);
    },
    skipToPreviousItem() {
      if (get().mk.player.queue.previousPlayableItemIndex !== -1 && get().queue.mk.player.previousPlayableItemIndex !== null)
        get().mk.player.changeToMediaAtIndex(get().mk.player.queue.previousPlayableItemIndex);
    },
    monitorMusickit() {
      if (!this.cfg.musickit) return;

      for (const [attr, value] of Object.entries(this.cfg.musickit["stored-attributes"])) {
        console.log(`Musickit value: ` + get().mk[attr]);
        console.log(`Config value: ` + value);
        if (value !== "" && get().mk[attr] !== value) {
          get().mk[attr] = value;
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
          return await get().mk.api.music(`v1/editorial/${get().mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2);
        } else if (library) {
          return await get().mk.api.music(`v1/me/library/${truemethod}/${term.toString()}`, params, params2);
        } else {
          return await get().mk.api.music(`/v1/catalog/${get().mk.storefrontId}/${truemethod}/${term.toString()}`, params, params2);
        }
      } catch (e) {
        console.debug(e);
        return await get().mkapi(method, library, term, params, params2, attempts + 1);
      }
    },
    playMediaItem(item) {
      const kind = item.attributes.playParams ? (item.attributes.playParams.kind ?? item.type ?? "") : (item.type ?? "");
      const id = item.attributes.playParams ? (item.attributes.playParams.id ?? item.id ?? "") : (item.id ?? "");
      const isLibrary = item.attributes.playParams ? (item.attributes.playParams.isLibrary ?? false) : false;
      const truekind = !kind.endsWith("s") ? kind + "s" : kind;
      // console.log(kind, id, isLibrary)
      get().mk.stop();
      if (kind.includes("artist")) {
        get()
          .mk.player.setStationQueue({ artist: "a-" + id })
          .then(() => {
            get().mk.play();
          });
      } else {
        this.playMediaItemById(id, kind, isLibrary, item.attributes.url ?? "");
      }
    },
    playMediaItemById(id, kind, isLibrary, raurl = "") {
      const truekind = !kind.endsWith("s") ? kind + "s" : kind;
      console.debug(id, truekind, isLibrary);
      try {
        if (truekind.includes("artist")) {
          get()
            .mk.player.setStationQueue({ artist: "a-" + id })
            .then(() => {
              get().mk.play();
            });
        } else if (truekind === "radioStations") {
          get()
            .mk.player.setStationQueue({ url: raurl })
            .then(function (queue) {
              MusicKit.getInstance().play();
            });
        } else {
          get()
            .mk.setQueue({
              [truekind]: [id],
              parameters: { l: get().mklang },
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
    queueParentandplayChild(parent: string, childIndex: number, item) {
      /* Randomize array in-place using Durstenfeld shuffle algorithm */
      function shuffleArray(array: Array<any>) {
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
          get()
            .mk.setQueue({ episodes: u })
            .then(() => {
              const id = get().mk.player.queue._itemIDs.findIndex((element) => element === item.id);
              get().mk.changeToMediaAtIndex(id);
            });
        } else if (this.library.songs.displayListing.length > childIndex && parent === "librarysongs") {
          console.log(item);
          if (item && this.library.songs.displayListing[childIndex].id !== item.id) {
            childIndex = this.library.songs.displayListing.indexOf(item);
          }

          const query = this.library.songs.displayListing.map((item) => new MusicKit.MediaItem(item));

          get().mk.stop();
          if (item) {
            get()
              .mk.setQueue({
                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                parameters: { l: get().mklang },
              })
              .then(function () {
                get()
                  .mk.play()
                  .then(() => {
                    if (get().mk.player.shuffleMode === 1) {
                      shuffleArray(query);
                    } else {
                      for (let i = 0; i < query.length; i++) {
                        if (query[i].id === item.id) {
                          query.splice(0, i + 1);
                          break;
                        }
                      }
                    }
                    get().mk.player.queue.append(query);
                  });
              });
          } else {
            get().mk.player.queue.splice(0, get().mk.player.queue._itemIDs.length);
            if (get().mk.player.shuffleMode === 1) {
              shuffleArray(query);
            }
            get().mk.player.queue.append(query);
            if (childIndex !== -1) {
              get().mk.changeToMediaAtIndex(childIndex);
            } else {
              get().mk.play();
            }
          }
        } else if (parent.startsWith("listitem-hr")) {
          get().mk.stop();
          if (get().mk.player.shuffleMode === 1) {
            get()
              .mk.setQueue({
                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
              })
              .then(function () {
                get()
                  .mk.play()
                  .then(() => {
                    const data: Record<string, string>[] = JSON.parse(parent.split("listitem-hr")[1] ?? "[]");
                    const itemsToPlay: Record<string, string[]> = {};
                    const u = data.map((x) => x.id);
                    try {
                      data.splice(u.indexOf(item.attributes.playParams.id ?? item.id), 1);
                    } catch (e) {
                      console.log(e);
                    }
                    if (get().mk.player.shuffleMode === 1) {
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
                        get().mk.playLater({ [kind + "s"]: itemsToPlay[kind] });
                      }
                    }
                  });
              });
          } else {
            const data: Record<string, string>[] = JSON.parse(parent.split("listitem-hr")[1] ?? "[]");
            const itemsToPlay: Record<string, string[]> = {};
            data.forEach((item) => {
              if (!itemsToPlay[item.kind]) {
                itemsToPlay[item.kind] = [];
              }
              itemsToPlay[item.kind].push(item.id);
            });
            // loop through itemsToPlay
            get().mk.player.queue.splice(0, get().mk.player.queue._itemIDs.length);
            let ind = 0;
            for (const kind in itemsToPlay) {
              const ids = itemsToPlay[kind];
              if (ids.length > 0) {
                if (get().mk.player.queue._itemIDs.length > 0) {
                  get()
                    .mk.playLater({ [kind + "s"]: itemsToPlay[kind] })
                    .then(function () {
                      ind += 1;
                      console.log(ind, Object.keys(itemsToPlay).length);
                      if (ind >= Object.keys(itemsToPlay).length) {
                        get().mk.changeToMediaAtIndex(get().mk.player.queue._itemIDs.indexOf(item.attributes.playParams.id ?? item.id));
                      }
                    });
                } else {
                  get()
                    .mk.setQueue({ [kind + "s"]: itemsToPlay[kind] })
                    .then(function () {
                      ind += 1;
                      console.log(ind, Object.keys(itemsToPlay).length);
                      if (ind >= Object.keys(itemsToPlay).length) {
                        get().mk.changeToMediaAtIndex(get().mk.player.queue._itemIDs.indexOf(item.attributes.playParams.id ?? item.id));
                      }
                    });
                }
              }
            }
          }
        } else {
          get().mk.stop();
          if (truekind === "playlists" && (id.startsWith("p.") || id.startsWith("pl.u"))) {
            get()
              .mk.setQueue({
                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                parameters: { l: get().mklang },
              })
              .then(function () {
                get()
                  .mk.changeToMediaAtIndex(get().mk.player.queue._itemIDs.indexOf(item.id) ?? 1)
                  .then(function () {
                    if (this.showingPlaylist && this.showingPlaylist.id === id) {
                      const query = this.showingPlaylist.relationships.tracks.data.map((item) => new MusicKit.MediaItem(item));
                      const u = query;
                      if (get().mk.player.shuffleMode === 1) {
                        shuffleArray(u);
                      } else {
                        for (let i = 0; i < this.showingPlaylist.relationships.tracks.data.length; i++) {
                          if (this.showingPlaylist.relationships.tracks.data[i].id === item.id) {
                            u.splice(0, i + 1);
                            break;
                          }
                        }
                      }
                      get().mk.player.queue.append(u);
                    } else {
                      this.getPlaylistFromID(id, true).then(function () {
                        const query = this.showingPlaylist.relationships.tracks.data.map((item) => new MusicKit.MediaItem(item));
                        const u = query;
                        if (get().mk.player.shuffleMode === 1) {
                          shuffleArray(u);
                        } else {
                          for (let i = 0; i < this.showingPlaylist.relationships.tracks.data.length; i++) {
                            if (this.showingPlaylist.relationships.tracks.data[i].id === item.id) {
                              u.splice(0, i + 1);
                              break;
                            }
                          }
                        }
                        get().mk.player.queue.append(u);
                      });
                    }
                  });
              });
          } else {
            get()
              .mk.setQueue({
                [truekind]: [id],
                parameters: { l: get().mklang },
              })
              .then(function (queue) {
                if (item && queue._itemIDs[childIndex] !== item.id) {
                  childIndex = queue._itemIDs.indexOf(item.id);
                }
                if (childIndex !== -1) {
                  get().mk.changeToMediaAtIndex(childIndex);
                } else if (item) {
                  get()
                    .mk.playNext({
                      [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                    })
                    .then(function () {
                      get().mk.changeToMediaAtIndex(get().mk.player.queue._itemIDs.indexOf(item.id) ?? 1);
                      get().mk.play();
                    });
                } else {
                  get().mk.play();
                }
              });
          }
        }
      } catch (err) {
        console.log(err);
        try {
          get().mk.stop();
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
      get().mk.seekToTime(time);
    },
    volumeUp() {
      if (get().mk.player.volume + this.cfg.audio.volumeStep > this.cfg.audio.maxVolume) {
        get().mk.player.volume = this.cfg.audio.maxVolume;
      } else {
        get().mk.player.volume = (Math.floor(get().mk.player.volume * 100) + this.cfg.audio.volumeStep * 100) / 100;
      }
    },
    volumeDown() {
      if (get().mk.player.volume - this.cfg.audio.volumeStep < 0) {
        get().mk.player.volume = 0;
      } else {
        get().mk.player.volume = (Math.floor(get().mk.player.volume * 100) - this.cfg.audio.volumeStep * 100) / 100;
      }
    },
    volumeWheel(event: MouseEvent) {
      return checkScrollDirectionIsUp(event) ? this.volumeUp() : this.volumeDown();
    },
    muteButtonPressed() {
      if (this.cfg.audio.muted) {
        get().mk.player.volume = this.cfg.audio.lastVolume;
        this.cfg.audio.muted = false;
      } else {
        this.cfg.audio.lastVolume = this.cfg.audio.volume;
        get().mk.player.volume = 0;
        this.cfg.audio.muted = true;
      }
    },
    checkMuteChange() {
      if (this.cfg.audio.muted) {
        this.cfg.audio.muted = false;
      }
    },
    repeatIncrement() {
      switch (get().mk.player.repeatMode) {
        default:
        case MusicKit.PlayerRepeatMode.none:
          get().mk.player.repeatMode = MusicKit.PlayerRepeatMode.all;
          break;

        case MusicKit.PlayerRepeatMode.all:
          get().mk.player.repeatMode = MusicKit.PlayerRepeatMode.one;
          break;

        case MusicKit.PlayerRepeatMode.one:
          get().mk.player.repeatMode = MusicKit.PlayerRepeatMode.none;
          break;
      }
    },
    mkReady: () => !!get().mk.player.nowPlayingItem,
    quickPlay(query: string) {
      MusicKit.getInstance()
        .api.search(query, { limit: 2, types: "songs" })
        .then(function (data) {
          MusicKit.getInstance()
            .setQueue({
              song: data.songs?.data[0].id,
              parameters: { l: get().mklang },
            })
            .then(function (queue) {
              MusicKit.getInstance().play();
            });
        });
    },
    async getRating(item: MusicKit.MediaItem) {
      let type = item.type.slice(-1) === "s" ? item.type : item.type + "s";
      let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id);
      if (item.id !== null && item.id.toString().startsWith("i.")) {
        if (!type.startsWith("library-")) {
          type = "library-" + type;
        }
        id = item.id;
      }
      const response = (await get().mk.api.music(
        `/v1/me/ratings/${type}?platform=web&ids=${type.includes("library") ? item.id : id}`,
      )) as MusicKit.SearchResponse<MusicKit.ContentRating>;
      if (response.data.results) {
        const value = response.data.results[0];
        return value;
      } else {
        return 0;
      }
    },
    love(item: MusicKit.MediaItem) {
      let type = item.type.slice(-1) === "s" ? item.type : item.type + "s";
      let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id);
      if (item.id !== null && item.id.toString().startsWith("i.")) {
        if (!type.startsWith("library-")) {
          type = "library-" + type;
        }
        id = item.id;
      }
      get().mk.api.music(`/v1/me/ratings/${type}/${id}`, {
        fetchOptions: {
          method: "PUT",
          body: JSON.stringify({
            type: "rating",
            attributes: {
              value: 1,
            },
          }),
        },
      });
    },
    dislike(item: MusicKit.MediaItem) {
      let type = item.type.slice(-1) === "s" ? item.type : item.type + "s";
      let id = item.attributes?.playParams?.catalogId ? item.attributes.playParams.catalogId : (item.attributes?.playParams?.id ?? item.id);
      if (item.id !== null && item.id.toString().startsWith("i.")) {
        if (!type.startsWith("library-")) {
          type = "library-" + type;
        }
        id = item.id;
      }
      get().mk.api.music(`/v1/me/ratings/${type}/${id}`, {
        fetchOptions: {
          method: "PUT",
          body: JSON.stringify({
            type: "rating",
            attributes: {
              value: -1,
            },
          }),
        },
      });
    },
    unlove(item: MusicKit.MediaItem) {
      let type = item.type.slice(-1) === "s" ? item.type : item.type + "s";
      let id = item.attributes.playParams.catalogId ? item.attributes.playParams.catalogId : item.id;
      if (item.id.startsWith("i.")) {
        if (!type.startsWith("library-")) {
          type = "library-" + type;
        }
        id = item.id;
      }
      get().mk.api.music(`/v1/me/ratings/${type}/${id}`, {
        fetchOptions: {
          method: "DELETE",
        },
      });
    },
    fetchPlaylist(id: string | number, callback: (...args: any[]) => void) {
      // id can be found in playlist.attributes.playParams.globalId
      // get().mk.api.
      get()
        .mk.api.music(`/v1/catalog/${get().mk.storefrontId}/playlists/${id}`)
        .then((res) => {
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
        const item = (await MusicKit.getInstance().api.music(
          `v1/storefronts/${get().mk.storefrontId}`,
        )) as MusicKit.SearchResponse<MusicKit.Storefronts>;
        let langcodes = item.data.results.Storefronts.data[0].attributes?.supportedLanguageTags || [];
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
        if (sellang === "") sellang = item.data.results[0].data[0].attributes?.defaultLanguageTag.toLowerCase() || "";

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
        if (sellang.startsWith("en") && get().mk.storefrontId !== "us") sellang = "en-gb";
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
  },
});
