import { ipcRenderer } from "electron";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CfgStore } from "../../main/base/store.js";
import { hmsToSecondsOnly, parseTime } from "../main/helpers.js";
interface AppState {
  version: string;
  appMode: string;
  cfg: CfgStore;
  isDev: boolean;
  clientPort: number;
  platform: string;
  pluginInstalled: boolean;
  pluginMenuEntries: string[];
  pluginMenuTopEntries: string[];
  lz: string[];
  lzListing: string;
  radiohls: string | null;
  fullscreenLyrics: boolean;
  fullscreenState: Record<string, any>;
  browsepage: string[];
  listennow: { timestamp: number };
  madeforyou: string[];
  radio: string[];
  mklang: string;
  webview: {
    url: string;
    title: string;
    loading: boolean;
  };
  appleCurator: string[];
  multiroom: string[];

  webremoteurl: string;
  webremoteqr: string;
  mxmtoken: string;
  mkIsReady: boolean;
  animateBackground: boolean;
  currentArtUrl: string;
  currentArtUrlRaw: string;
  mvViewMode: string;
  currentTrackID: string;
  lyrics: { startTime: any; endTime: any; line: any }[];
  currentLyricsLine: number;
  richlyrics: { startTime: any; endTime: any; line: any }[];
  lyricsMediaItem: Record<string, any>;
  lyricsDebug: {
    current: number;
    start: number;
    end: number;
  };
  lyricOffset: number;
  v3: {
    requestBody: {
      platform: "web";
    };
  };
  tmpHeight: string;
  tmpWidth: string;
  tmpX: string;
  tmpY: string;
  miniTmpX: string;
  miniTmpY: string;
  tmpVar: string[];
  notification: boolean;
  hintscontext: boolean;
  collectionList: {
    response: Record<string, any>;
    title: string;
    type: string;
  };
  MVsource: string | null;
  currentSongInfo: Record<string, any>;
  songstest: boolean;
  hangtimer: string | null;
  routes: string[];
  musicBaseUrl: string;

  pauseButtonTimer: number | null;
  activeCasts: string[];

  moreinfodata: string[];
  idleTimer: string | null;
  idleState: boolean;
  appVisible: boolean;
  currentAirPlayCodeID: string;
  airplayTrys: string[];
  setCfg: (value: CfgStore) => void;
  setCfgConnectivityDiscord_rpcEnabled: (newValue: boolean) => void;
  loadMXM: () => void;
  loadNeteaseLyrics: () => void;
  loadYTLyrics: () => void;
  loadQQLyrics: () => void;
  parseTTML: () => void;
  loadAMLyrics: () => void;
}

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // --- STATE (from vuex-store) ---
    version: ipcRenderer.sendSync("get-version"),
    appMode: "player",
    cfg: ipcRenderer.sendSync("getStore"),
    setCfg: (value) =>
      set((state) => {
        state.cfg = value;
        console.debug(`Config changed: ${JSON.stringify(value)}`);
        ipcRenderer.send("setStore", value);
      }),
    setCfgConnectivityDiscord_rpcEnabled: (newValue) =>
      set((state) => {
        state.cfg.connectivity.discord_rpc.enabled = newValue;
        ipcRenderer.send("discordrpc:reload", newValue);
      }),

    isDev: ipcRenderer.sendSync("is-dev"),
    clientPort: ipcRenderer.sendSync("get-port"),
    platform: "",
    mk: {},
    pluginInstalled: false,
    pluginMenuEntries: [],
    pluginMenuTopEntries: [],
    lz: ipcRenderer.sendSync("get-i18n", "en"),
    lzListing: ipcRenderer.sendSync("get-i18n-listing"),
    radiohls: null,
    fullscreenLyrics: false,
    fullscreenState: ipcRenderer.sendSync("getFullScreen"),
    browsepage: [],
    listennow: { timestamp: 0 },
    madeforyou: [],
    radio: [],
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
    lyricsMediaItem: {},
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
    idleTimer: null,
    idleState: false,
    appVisible: true,
    currentAirPlayCodeID: "",
    airplayTrys: [],
    // lyrics stuff
    parseTTML: () =>
      set((state) => {
        state.lyrics = [];
        const preLrc = [];
        const xml = get().stringToXml(get().lyricsMediaItem);
        const lyricsLines = xml.getElementsByTagName("p");
        let synced = true;
        const endTimes = [];
        if (xml.getElementsByTagName("tt")[0].getAttribute("itunes:timing") === "None") {
          synced = false;
        }
        endTimes.push(0);
        if (synced) {
          for (const element of lyricsLines) {
            const start = this.toMS(element.getAttribute("begin"));
            const end = this.toMS(element.getAttribute("end"));
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
        const xml = this.stringToXml(this.lyricsMediaItem);
        const json = xmlToJson(xml);
        state.lyrics = json;
      }),
    loadLyrics() {
      const musicType = MusicKit.getInstance().nowPlayingItem !== null ? (MusicKit.getInstance().nowPlayingItem["type"] ?? "") : "";
      // console.log("mt", musicType)
      if (musicType === "musicVideo") {
        get().loadYTLyrics();
      } else {
        // only load MXM lyrics if AM lyrics failed to load
        if (app.cfg.lyrics.enable_mxm) {
          get().loadMXM();
        } else {
          get().loadAMLyrics();
        }
      }
    },
    loadAMLyrics: () =>
      set((state) => {
        const songID =
          get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem["_songId"] ?? get().mk.nowPlayingItem["songId"] ?? -1) : -1;
        // get().getMXM( trackName, artistName, 'en', duration);
        if (songID !== -1) {
          get()
            .mk.api.v3.music(`v1/catalog/${get().mk.storefrontId}/songs/${songID}/lyrics`)
            .then((response) => {
              state.lyricsMediaItem = response.data?.data[0]?.attributes["ttml"];
              get().parseTTML();
            })
            .catch(() => {
              if (app.cfg.lyrics.enable_mxm) {
                get().loadQQLyrics();
              } else {
                get().loadMXM();
              }
            });
        } else {
          if (get().cfg.lyrics.enable_mxm) {
            get().loadQQLyrics(); // since mxm is already prioritized, we can just load qq lyrics if am fails
          } else {
            get().loadMXM();
          }
        }
      }),
    loadYTLyrics: () =>
      set((state) => {
        const track = get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem.title ?? "") : "";
        const artist = get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem.artistName ?? "") : "";
        const time =
          get().mk.nowPlayingItem !== null
            ? (Math.round((get().mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1)
            : -1;
        window.electronAPI.invoke("getYTLyrics", track, artist).then((result) => {
          if (result.length > 0) {
            const ytid = result[0]["id"]["videoId"];
            if (get().cfg.lyrics.enable_yt) {
              loadYT(ytid, get().cfg.lyrics.mxm_language ?? "en");
            } else {
              get().loadMXM();
            }
          } else {
            get().loadMXM();
          }

          function loadYT(id, lang) {
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
        const track = encodeURIComponent(get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem.title ?? "") : "");
        const artist = encodeURIComponent(get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem.artistName ?? "") : "");
        const time = encodeURIComponent(
          get().mk.nowPlayingItem !== null
            ? (Math.round((get().mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1)
            : -1,
        );
        const id = encodeURIComponent(
          get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem._songId ?? get().mk.nowPlayingItem["songId"] ?? "") : "",
        );
        let lrcfile = "";
        let richsync = [];
        const lang = get().cfg.lyrics.mxm_language; //  translation language
        function revisedRandId() {
          return Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, "")
            .slice(2, 10);
        }

        /* get token */
        function getToken(mode, track, artist, songid, lang, time, id) {
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
                      getMXMSubs(track, artist, app.mxmtoken, lang, time, id);
                    } else {
                      getMXMTrans(songid, lang, app.mxmtoken);
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

        function getMXMSubs(track, artist, token, lang, time, id) {
          const usertoken = encodeURIComponent(token);
          const richsyncQuery = app.cfg.lyrics.mxm_karaoke ? "&optional_calls=track.richsync" : "";
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
                    if (richsync === [] || richsync.length === 0) {
                      console.log("ok");
                      // process lrcfile to json here
                      state.lyricsMediaItem = lrcfile;
                      const u = app.lyricsMediaItem.split(/[\r\n]/);
                      const preLrc = [];
                      for (let i = u.length - 1; i >= 0; i--) {
                        const xline = /(\[[0-9.:\[\]]*\])+(.*)/.exec(u[i]);
                        const end = preLrc.length > 0 ? (preLrc[preLrc.length - 1].startTime ?? 99999) : 99999;
                        preLrc.push({
                          startTime: app.toMS(xline[1].substring(1, xline[1].length - 2)) ?? 0,
                          endTime: end,
                          line: xline[2],
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
                          startTime: item.ts,
                          endTime: item.te,
                          line: item.x,
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
              app.loadQQLyrics();
              //app.loadAMLyrics()
            }
          };
          req.onerror = function () {
            app.loadQQLyrics();
            console.log("error");
            // app.loadAMLyrics();
          };
          req.send();
        }

        function getMXMTrans(id, lang, token) {
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
                    const u = app.lyrics;
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

        if ((track !== "") & (track !== "No Title Found")) {
          if (app.mxmtoken !== null && app.mxmtoken !== "") {
            getMXMSubs(track, artist, app.mxmtoken, lang, time, id);
          } else {
            getToken(1, track, artist, "", lang, time);
          }
        }
      }),
    loadNeteaseLyrics: () =>
      set((state) => {
        const track = encodeURIComponent(get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem.title ?? "") : "");
        const artist = encodeURIComponent(get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem.artistName ?? "") : "");
        const time = encodeURIComponent(
          get().mk.nowPlayingItem !== null
            ? (Math.round((get().mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1)
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
                const u = app.lyricsMediaItem.split(/[\n]/);
                const preLrc = [];
                for (let i = u.length - 1; i >= 0; i--) {
                  const xline = /(\[[0-9.:\[\]]*\])+(.*)/.exec(u[i]);
                  if (xline !== null) {
                    const end = preLrc.length > 0 ? (preLrc[preLrc.length - 1].startTime ?? 99999) : 99999;
                    preLrc.push({
                      startTime: app.toMS(xline[1].substring(1, xline[1].length - 2)) ?? 0,
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
                state.lyrics = "";
              }
            };
            req2.onerror = function () {};
            req2.send();
          } catch (e) {
            state.lyrics = "";
          }
        };
        req.send();
        req.onerror = function () {};
      }),
    loadQQLyrics: () =>
      set((state) => {
        if (!get().cfg.lyrics.enable_qq) return;
        const track = encodeURIComponent(get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem.title ?? "") : "");
        const artist = encodeURIComponent(get().mk.nowPlayingItem !== null ? (get().mk.nowPlayingItem.artistName ?? "") : "");
        const time = encodeURIComponent(
          get().mk.nowPlayingItem !== null
            ? (Math.round((get().mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1)
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
                function b64_to_utf8(str) {
                  return decodeURIComponent(escape(window.atob(str)));
                }

                const htmlDecode = (input) => {
                  const doc = new DOMParser().parseFromString(input, "text/html");
                  return doc.documentElement.textContent;
                };
                const jsonResponse2 = JSON.parse(req2.responseText.replace("MusicJsonCallback(", "").replace("})", "}"));
                const lrcfile = htmlDecode(b64_to_utf8(jsonResponse2["lyric"]));
                state.lyricsMediaItem = lrcfile;
                const u = app.lyricsMediaItem.split(/[\n]/);

                const preLrc = [];
                for (let i = u.length - 1; i >= 0; i--) {
                  const xline = /(\[[0-9.:\[\]]*\])+(.*)/.exec(u[i]);
                  if (xline !== null) {
                    const end = preLrc.length > 0 ? (preLrc[preLrc.length - 1].startTime ?? 99999) : 99999;
                    preLrc.push({
                      startTime: app.toMS(xline[1].substring(1, xline[1].length - 2)) ?? 0,
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
                state.lyrics = "";
              }
            };
            req2.onerror = function () {
              get().loadNeteaseLyrics();
            };
            req2.send();
          } catch (e) {
            console.log(e);
            get().loadNeteaseLyrics();
            state.lyrics = "";
          }
        };
        req.onerror = function () {
          get().loadNeteaseLyrics();
        };
        req.send();
      }),
    // end lyrics stuff
    _fetch(url, opts = {}) {
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
    formatVolumeTooltip() {
      const advancedTooltip = this.cfg.audio.dBSPL
        ? (Number(this.cfg.audio.dBSPLcalibration) + Math.log10(this.mk.volume) * 20).toFixed(2) + " dB SPL"
        : (Math.log10(this.mk.volume) * 20).toFixed(2) + " dBFS";
      return this.cfg.audio.advanced ? advancedTooltip : (this.mk.volume * 100).toFixed(0) + "%";
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
      this.$data.library.songs.sortingOptions = {
        albumName: this.getLz("term.sortBy.album"),
        artistName: this.getLz("term.sortBy.artist"),
        name: this.getLz("term.sortBy.name"),
        genre: this.getLz("term.sortBy.genre"),
        releaseDate: this.getLz("term.sortBy.releaseDate"),
        durationInMillis: this.getLz("term.sortBy.duration"),
        dateAdded: this.getLz("term.sortBy.dateAdded"),
      };

      this.$data.library.albums.sortingOptions = {
        artistName: this.getLz("term.sortBy.artist"),
        name: this.getLz("term.sortBy.name"),
        genre: this.getLz("term.sortBy.genre"),
        releaseDate: this.getLz("term.sortBy.releaseDate"),
        dateAdded: this.getLz("term.sortBy.dateAdded"),
      };

      this.$data.library.artists.sortingOptions = {
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

    quit() {
      await window.electronAPI.invoke("quit-app");
    },

    modularUITest(val = false) {
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
      this.confirm(this.getLz("term.confirmLogout"), function (result) {
        if (result) {
          this.mk.unauthorize();
          document.location.reload();
        }
      });
    },

    copyToClipboard(str) {
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
        this.mk.api.v3
          .music(`/v1/editorial/${this.mk.storefrontId}/groupings`, {
            platform: "web",
            name: "radio",
            "omit[resource:artists]": "relationships",
            "include[albums]": "artists",
            "include[songs]": "artists",
            "include[music-videos]": "artists",
            extend: "editorialArtwork,artistUrl",
            "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
            "art[url]": "f",
            l: this.mklang,
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
        const browse = await this.mk.api.v3.music(`/v1/editorial/${this.mk.storefrontId}/groupings`, {
          platform: "web",
          name: "music",
          "omit[resource:artists]": "relationships",
          "include[albums]": "artists",
          "include[songs]": "artists",
          "include[music-videos]": "artists",
          extend: "editorialArtwork,artistUrl",
          "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
          "art[url]": "f",
          l: this.mklang,
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
        const mfu = await this.mk.api.v3.music(
          "/v1/me/library/playlists?platform=web&extend=editorialVideo&fields%5Bplaylists%5D=lastModifiedDate&filter%5Bfeatured%5D=made-for-you&include%5Blibrary-playlists%5D=catalog&fields%5Blibrary-playlists%5D=artwork%2Cname%2CplayParams%2CdateAdded",
        );
        this.madeforyou = mfu.data;
      } catch (e) {
        console.log(e);
        this.getMadeForYou(attempt + 1);
      }
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
    switchArtworkDisplayLayout() {
      switch (this.cfg.visual.artworkDisplayLayout) {
        case "default":
          this.cfg.visual.artworkDisplayLayout = "sidebar";
          break;
        case "sidebar":
          this.cfg.visual.artworkDisplayLayout = "default";
          break;
        default:
          this.cfg.visual.artworkDisplayLayout = "default";
          break;
      }
    },

    followingArtist(id) {
      console.debug(`check for ${id}`);
      return this.cfg.home.followedArtists.includes(id);
    },
    getCurrentTime() {
      return parseFloat(
        hmsToSecondsOnly(parseTime(this.mk.nowPlayingItem.attributes.durationInMillis - this.mk.currentPlaybackTimeRemaining * 1000)),
      );
    },
    getLyricBGStyle(start, end) {
      const currentTime = this.getCurrentTime();
      // let duration = this.mk.nowPlayingItem.attributes.durationInMillis
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
          this.activeCasts = [];
          notyf.error("Devices disconnected!");
        } else {
          this.activeCasts;
          notyf.error("Device disconnected!");
        }
      }
    },
    authCC() {
      window.electronAPI.send("cc-auth");
    },
    _playRadioStream(e) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = process;
      xhr.open("GET", e, true);
      xhr.send();

      function process() {
        if (xhr.readyState === 4) {
          const sources = xhr.responseText.match(/^(?!#)(?!\s).*$/gm).filter(function (element) {
            return element;
          });
          // Load first source
          const src = sources[0];
          if (src.includes("http")) {
            this.mk._services.mediaItemPlayback._currentPlayer._playAssetURL(src, false);
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
              if (this.radiohls !== null && this.radiohls.destroy !== null) {
                this.radiohls.destroy();
                this.radiohls = null;
                this.radiohls = new CiderHls();
                this.radiohls.loadSource(e);
                this.radiohls.attachMedia(this.mk._services.mediaItemPlayback._currentPlayer._targetElement);
                this.mk._services.mediaItemPlayback._currentPlayer._targetElement.play();
              } else {
                this.radiohls = null;
                this.radiohls = new CiderHls();
                this.radiohls.loadSource(e);
                this.radiohls.attachMedia(this.mk._services.mediaItemPlayback._currentPlayer._targetElement);
                this.mk._services.mediaItemPlayback._currentPlayer._targetElement.play();
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
  })),
);
