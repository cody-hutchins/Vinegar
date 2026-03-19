import { notyf } from "..";

const helpers = {
  addToLibrary(id) {
    const self = this;
    this.mk.addToLibrary(id).then((data) => {
      self.getLibrarySongsFull(true);
    });
    notyf.success(app.getLz("action.addToLibrary.success"));
  },
  removeFromLibrary(kind, id) {
    const self = this;
    const truekind = !kind.endsWith("s") ? kind + "s" : kind;
    app.mk.api.v3
      .music(
        `v1/me/library/${truekind}/${id.toString()}`,
        {},
        {
          fetchOptions: {
            method: "DELETE",
          },
        },
      )
      .then((data) => {
        self.getLibrarySongsFull(true);
      });
    notyf.success(app.getLz("action.removeFromLibrary.success"));
  },
  async loadYTLyrics() {
    const track = this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem.title ?? "") : "";
    const artist = this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem.artistName ?? "") : "";
    const time =
      this.mk.nowPlayingItem !== null ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1;
    await window.electronAPI.invoke("getYTLyrics", track, artist).then((result) => {
      if (result.length > 0) {
        const ytid = result[0]["id"]["videoId"];
        if (app.cfg.lyrics.enable_yt) {
          loadYT(ytid, app.cfg.lyrics.mxm_language ?? "en");
        } else {
          app.loadMXM();
        }
      } else {
        app.loadMXM();
      }

      function loadYT(id, lang) {
        const req = new XMLHttpRequest();
        const url = `https://www.youtube.com/watch?&v=${id}`;
        req.open("GET", url, true);
        req.onerror = function (e) {
          this.loadMXM();
        };
        req.onload = function () {
          // console.log(this.responseText);
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
              app.loadMXM();
            };
            req2.onload = function () {
              try {
                const ttmlLyrics = this.responseText;
                if (ttmlLyrics) {
                  this.lyricsMediaItem = ttmlLyrics;
                  this.parseTTML();
                }
              } catch (e) {
                app.loadMXM();
              }
            };
            req2.send();
          } else {
            app.loadMXM();
          }
        };
        req.send();
      }
    });
  },
  loadMXM() {
    let attempt = 0;
    const track = encodeURIComponent(this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem.title ?? "") : "");
    const artist = encodeURIComponent(this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem.artistName ?? "") : "");
    const time = encodeURIComponent(
      this.mk.nowPlayingItem !== null ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1,
    );
    const id = encodeURIComponent(
      this.mk.nowPlayingItem !== null ? (app.mk.nowPlayingItem._songId ?? app.mk.nowPlayingItem["songId"] ?? "") : "",
    );
    let lrcfile = "";
    let richsync = [];
    const lang = app.cfg.lyrics.mxm_language; //  translation language
    function revisedRandId() {
      return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .slice(2, 10);
    }

    /* get token */
    function getToken(mode, track, artist, songid, lang, time, id) {
      if (attempt > 2) {
        app.loadNeteaseLyrics();
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
                app.mxmtoken = token;

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
            app.loadQQLyrics();
            //app.loadAMLyrics();
          }
        };
        req.onerror = function () {
          console.log("error");
          app.loadQQLyrics();
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
                  jsonResponse["message"]["body"]["macro_calls"]["track.subtitles.get"]["message"]["body"]["subtitle_list"][0]["subtitle"][
                    "subtitle_body"
                  ];

                try {
                  const lrcrich =
                    jsonResponse["message"]["body"]["macro_calls"]["track.richsync.get"]["message"]["body"]["richsync"]["richsync_body"];
                  richsync = JSON.parse(lrcrich);
                  app.richlyrics = richsync;
                } catch (_) {}
              }

              if (lrcfile === "") {
                app.loadQQLyrics();
                // app.loadAMLyrics()
              } else {
                if (richsync === [] || richsync.length === 0) {
                  console.log("ok");
                  // process lrcfile to json here
                  app.lyricsMediaItem = lrcfile;
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
                  app.lyrics = preLrc.reverse();
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
                  app.lyrics = preLrc;
                }
                if (lrcfile !== null && lrcfile !== "") {
                  // load translation
                  getMXMTrans(id, lang, token);
                } else {
                  // app.loadAMLyrics()
                  app.loadQQLyrics();
                }
              }
            } catch (e) {
              console.log(e);
              app.loadQQLyrics();
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
                  app.lyrics = u;
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
  },
  loadNeteaseLyrics() {
    const track = encodeURIComponent(this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem.title ?? "") : "");
    const artist = encodeURIComponent(this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem.artistName ?? "") : "");
    const time = encodeURIComponent(
      this.mk.nowPlayingItem !== null ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1,
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
            app.lyricsMediaItem = lrcfile;
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
            app.lyrics = preLrc.reverse();
          } catch (e) {
            app.lyrics = "";
          }
        };
        req2.onerror = function () {};
        req2.send();
      } catch (e) {
        app.lyrics = "";
      }
    };
    req.send();
    req.onerror = function () {};
  },
  loadQQLyrics() {
    if (!app.cfg.lyrics.enable_qq) return;
    const track = encodeURIComponent(this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem.title ?? "") : "");
    const artist = encodeURIComponent(this.mk.nowPlayingItem !== null ? (this.mk.nowPlayingItem.artistName ?? "") : "");
    const time = encodeURIComponent(
      this.mk.nowPlayingItem !== null ? (Math.round((this.mk.nowPlayingItem.attributes["durationInMillis"] ?? -1000) / 1000) ?? -1) : -1,
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
            app.lyricsMediaItem = lrcfile;
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
            app.lyrics = preLrc.reverse();
            if (app.lyrics[5].line === "") {
              app.loadNeteaseLyrics();
            } // Detect incomplete QQ lyrics.
          } catch (e) {
            console.log(e);
            app.loadNeteaseLyrics();
            app.lyrics = "";
          }
        };
        req2.onerror = function () {
          app.loadNeteaseLyrics();
        };
        req2.send();
      } catch (e) {
        console.log(e);
        app.loadNeteaseLyrics();
        app.lyrics = "";
      }
    };
    req.onerror = function () {
      app.loadNeteaseLyrics();
    };
    req.send();
  },
  toMS(str) {
    const rawTime = str.match(/(\d+:)?(\d+:)?(\d+)(\.\d+)?/);
    const hours = rawTime[2] !== null ? rawTime[1].replace(":", "") : 0;
    const minutes =
      rawTime[2] !== null ? hours * 60 + rawTime[2].replace(":", "") * 1 : rawTime[1] !== null ? rawTime[1].replace(":", "") : 0;
    const seconds = rawTime[3] !== null ? rawTime[3] : 0;
    const milliseconds = rawTime[4] !== null ? rawTime[4].replace(".", "") : 0;
    return parseFloat(`${minutes * 60 + seconds * 1}.${milliseconds * 1}`);
  },
  parseTTML() {
    this.lyrics = [];
    const preLrc = [];
    const xml = this.stringToXml(this.lyricsMediaItem);
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
    this.lyrics = preLrc;
  },
  parseLyrics() {
    const xml = this.stringToXml(this.lyricsMediaItem);
    const json = xmlToJson(xml);
    this.lyrics = json;
  },
  stringToXml(st) {
    // string to xml
    const xml = new DOMParser().parseFromString(st, "text/xml");
    return xml;
  },
  getCurrentTime() {
    return parseFloat(
      this.hmsToSecondsOnly(
        this.parseTime(this.mk.nowPlayingItem.attributes.durationInMillis - app.mk.currentPlaybackTimeRemaining * 1000),
      ),
    );
  },
  seekTo(time) {
    this.mk.seekToTime(time);
  },
  parseTime(value) {
    const minutes = Math.floor(value / 60000);
    const seconds = ((value % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  },
  parseTimeDecimal(value) {
    const minutes = Math.floor(value / 60000);
    const seconds = ((value % 60000) / 1000).toFixed(0);
    return minutes + "." + (seconds < 10 ? "0" : "") + seconds;
  },
  hmsToSecondsOnly(str) {
    let p = str.split(":"),
      s = 0,
      m = 1;

    while (p.length > 0) {
      s += m * parseInt(p.pop(), 10);
      m *= 60;
    }

    return s;
  },
  getLyricBGStyle(start, end) {
    const currentTime = this.getCurrentTime();
    // let duration = this.mk.nowPlayingItem.attributes.durationInMillis
    const start2 = this.hmsToSecondsOnly(start);
    const end2 = this.hmsToSecondsOnly(end);
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
  playMediaItemById(id, kind, isLibrary, raurl = "") {
    const truekind = !kind.endsWith("s") ? kind + "s" : kind;
    console.debug(id, truekind, isLibrary);
    try {
      if (truekind.includes("artist")) {
        app.mk.setStationQueue({ artist: "a-" + id }).then(() => {
          app.mk.play();
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
        const u = app.library.localsongs.map((i) => {
          return i.id;
        });
        app.mk.setQueue({ episodes: u }).then(() => {
          const id = app.mk.queue._itemIDs.findIndex((element) => element === item.id);
          app.mk.changeToMediaAtIndex(id);
        });
      } else if (app.library.songs.displayListing.length > childIndex && parent === "librarysongs") {
        console.log(item);
        if (item && app.library.songs.displayListing[childIndex].id !== item.id) {
          childIndex = app.library.songs.displayListing.indexOf(item);
        }

        const query = app.library.songs.displayListing.map((item) => new MusicKit.MediaItem(item));

        app.mk.stop().then(() => {
          if (item) {
            app.mk
              .setQueue({
                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                parameters: { l: app.mklang },
              })
              .then(function () {
                app.mk.play().then(() => {
                  if (app.mk.shuffleMode === 1) {
                    shuffleArray(query);
                  } else {
                    for (let i = 0; i < query.length; i++) {
                      if (query[i].id === item.id) {
                        query.splice(0, i + 1);
                        break;
                      }
                    }
                  }
                  app.mk.queue.append(query);
                });
              });
          } else {
            app.mk.queue.splice(0, app.mk.queue._itemIDs.length);
            if (app.mk.shuffleMode === 1) {
              shuffleArray(query);
            }
            app.mk.queue.append(query);
            if (childIndex !== -1) {
              app.mk.changeToMediaAtIndex(childIndex);
            } else {
              app.mk.play();
            }
          }
        });
      } else if (parent.startsWith("listitem-hr")) {
        app.mk.stop().then(() => {
          if (app.mk.shuffleMode === 1) {
            app.mk
              .setQueue({
                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
              })
              .then(function () {
                app.mk.play().then(() => {
                  const data = JSON.parse(parent.split("listitem-hr")[1] ?? "[]");
                  const itemsToPlay = {};
                  const u = data.map((x) => x.id);
                  try {
                    data.splice(u.indexOf(item.attributes.playParams.id ?? item.id), 1);
                  } catch (e) {
                    console.log(e);
                  }
                  if (app.mk.shuffleMode === 1) {
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
                      app.mk.playLater({ [kind + "s"]: itemsToPlay[kind] });
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
            app.mk.queue.splice(0, app.mk.queue._itemIDs.length);
            let ind = 0;
            for (const kind in itemsToPlay) {
              const ids = itemsToPlay[kind];
              if (ids.length > 0) {
                if (app.mk.queue._itemIDs.length > 0) {
                  app.mk.playLater({ [kind + "s"]: itemsToPlay[kind] }).then(function () {
                    ind += 1;
                    console.log(ind, Object.keys(itemsToPlay).length);
                    if (ind >= Object.keys(itemsToPlay).length) {
                      app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(item.attributes.playParams.id ?? item.id));
                    }
                  });
                } else {
                  app.mk.setQueue({ [kind + "s"]: itemsToPlay[kind] }).then(function () {
                    ind += 1;
                    console.log(ind, Object.keys(itemsToPlay).length);
                    if (ind >= Object.keys(itemsToPlay).length) {
                      app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(item.attributes.playParams.id ?? item.id));
                    }
                  });
                }
              }
            }
          }
        });
      } else {
        app.mk.stop().then(() => {
          if (truekind === "playlists" && (id.startsWith("p.") || id.startsWith("pl.u"))) {
            app.mk
              .setQueue({
                [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                parameters: { l: app.mklang },
              })
              .then(function () {
                app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(item.id) ?? 1).then(function () {
                  if (app.showingPlaylist && app.showingPlaylist.id === id) {
                    const query = app.showingPlaylist.relationships.tracks.data.map((item) => new MusicKit.MediaItem(item));
                    const u = query;
                    if (app.mk.shuffleMode === 1) {
                      shuffleArray(u);
                    } else {
                      for (let i = 0; i < app.showingPlaylist.relationships.tracks.data.length; i++) {
                        if (app.showingPlaylist.relationships.tracks.data[i].id === item.id) {
                          u.splice(0, i + 1);
                          break;
                        }
                      }
                    }
                    app.mk.queue.append(u);
                  } else {
                    app.getPlaylistFromID(id, true).then(function () {
                      const query = app.showingPlaylist.relationships.tracks.data.map((item) => new MusicKit.MediaItem(item));
                      const u = query;
                      if (app.mk.shuffleMode === 1) {
                        shuffleArray(u);
                      } else {
                        for (let i = 0; i < app.showingPlaylist.relationships.tracks.data.length; i++) {
                          if (app.showingPlaylist.relationships.tracks.data[i].id === item.id) {
                            u.splice(0, i + 1);
                            break;
                          }
                        }
                      }
                      app.mk.queue.append(u);
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
                  app.mk.changeToMediaAtIndex(childIndex);
                } else if (item) {
                  app.mk
                    .playNext({
                      [item.attributes.playParams.kind ?? item.type]: item.attributes.playParams.id ?? item.id,
                    })
                    .then(function () {
                      app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(item.id) ?? 1);
                      app.mk.play();
                    });
                } else {
                  app.mk.play();
                }
              });
          }
        });
      }
    } catch (err) {
      console.log(err);
      try {
        app.mk.stop();
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
  friendlyTypes(type) {
    // use switch statement to return friendly name for media types "songs,artists,albums,playlists,music-videos,stations,apple-curators,curators"
    switch (type) {
      case "library-songs":
        return app.getLz("term.songs");
        break;
      case "library-artists":
        return app.getLz("term.artists");
        break;
      case "library-albums":
        return app.getLz("term.albums");
        break;
      case "library-playlists":
        return app.getLz("term.playlists");
        break;
      case "song":
        return app.getLz("term.songs");
        break;
      case "artist":
        return app.getLz("term.artists");
        break;
      case "album":
        return app.getLz("term.albums");
        break;
      case "playlist":
        return app.getLz("term.playlists");
        break;
      case "music_video":
        return app.getLz("term.musicVideos");
        break;
      case "station":
        return app.getLz("term.stations");
        break;
      case "apple-curator":
        return app.getLz("term.appleCurators");
        break;
      case "radio_show":
        return app.getLz("term.radioShows");
        break;
      case "record_label":
        return app.getLz("term.recordLabels");
        break;
      case "radio_episode":
        return app.getLz("podcast.episodes");
        break;
      case "video_extra":
        return app.getLz("term.videoExtras");
        break;
      case "curator":
        return app.getLz("term.curators");
        break;
      case "top":
        return app.getLz("term.top");
        break;
      default:
        return type;
        break;
    }
  },
  searchCursor(e) {
    if (e.keyCode === "40") {
      if (this.search.hints.length - 1 < this.search.cursor + 1) return;
      this.search.cursor++;
      const item = this.search.hints[this.search.cursor];
      this.search.term = item.content ? (item.content?.attributes?.name ?? "") : item.displayTerm;
    } else if (e.keyCode === "38") {
      if (this.search.cursor === 0) return;
      this.search.cursor--;
      const item = this.search.hints[this.search.cursor];
      this.search.term = item.content ? (item.content?.attributes?.name ?? "") : item.displayTerm;
    }
  },
  async searchQuery(term = this.search.term) {
    const self = this;
    if (typeof term === "object") {
      this.routeView(term);
      this.search.term = "";
      return;
    }
    if (term === "") {
      return;
    }
    //this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/search?term=${this.search.term}`
    this.mk.api.v3
      .music(`/v1/catalog/${app.mk.storefrontId}/search?term=${encodeURIComponent(this.search.term)}`, {
        types:
          "activities,albums,apple-curators,artists,curators,editorial-items,music-movies,music-videos,playlists,songs,stations,tv-episodes,uploaded-videos,record-labels",
        "relate[editorial-items]": "contents",
        "include[editorial-items]": "contents",
        "include[albums]": "artists",
        "include[artists]": "artists",
        "include[songs]": "artists,albums",
        "include[music-videos]": "artists",
        extend: "artistUrl",
        "fields[artists]": "url,name,artwork,hero",
        "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url",
        with: "serverBubbles,lyricHighlights",
        "art[url]": "c,f",
        "omit[resource]": "autos",
        platform: "web",
        limit: 25,
        l: this.mklang,
      })
      .then(function (results) {
        results.data.results["meta"] = results.data.meta;
        self.search.results = results.data.results;
      });

    await app.mk.api.v3
      .music(
        `v1/social/${app.mk.storefrontId}/search?term=${app.search.term}`,
        {
          types: ["playlists", "social-profiles"],
          limit: 25,
          with: ["serverBubbles", "lyricSnippet"],
          "art[url]": "f",
          "art[social-profiles:url]": "c",
        },
        { includeResponseMeta: !0 },
      )
      .then(function (results) {
        results.data.results["meta"] = results.data.meta;
        self.search.resultsSocial = results.data.results;
      });

    this.search.resultsLibrary = await app.mk.api.library.search(app.search.term, {
      types: "library-songs,library-albums,library-playlists,library-artists",
      limit: 25,
      offset: 0,
    });
  },
  async inLibrary(items = []) {
    const types = [];

    for (const item of items) {
      let type = item.type;
      if (type.slice(-1) !== "s") {
        type += "s";
      }
      type = type.replace("library-", "");
      const id = item.attributes.playParams?.catalogId ?? item.attributes.playParams.id ?? item.id;

      const index = types.findIndex(function (type) {
        return type.type === this;
      }, type);
      if (index === -1) {
        types.push({ type: type, id: [id] });
      } else {
        types[index].id.push(id);
      }
    }
    let types2 = types.map(function (item) {
      return {
        [`ids[${item.type}]`]: [item.id],
      };
    });
    types2 = types2.reduce(function (result, item) {
      const key = Object.keys(item)[0]; //first property: a, b, c
      result[key] = item[key];
      return result;
    }, {});
    return (
      await this.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}`, {
        ...{
          "omit[resource]": "autos",
          relate: "library",
          fields: "inLibrary",
        },
        ...types2,
      })
    ).data.data;
  },
  isInLibrary(playParams) {
    const self = this;
    let id = "";
    // ugly code to check if current playback item is in library
    if (typeof playParams === "undefined") {
      return true;
    }
    if (playParams["isLibrary"]) {
      return true;
    } else if (playParams["catalogId"]) {
      id = playParams["catalogId"];
    } else if (playParams["id"]) {
      id = playParams["id"];
    }
    const found = this.library.songs.listing.filter((item) => {
      if (item["attributes"]) {
        if (item["attributes"]["playParams"] && item["attributes"]["playParams"]["catalogId"] === id) {
          return item;
        }
      }
    });
    if (found.length !== 0) {
      return true;
    } else {
      return false;
    }
  },
};

export default { helpers };
