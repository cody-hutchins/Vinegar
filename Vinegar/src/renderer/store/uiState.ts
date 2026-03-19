import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { clamp, convertTime, getBase64FromUrl, notyf, stringTemplateParser } from "../main/helpers.js";
interface UIState {
  windowRelativeScale: number;
  pageState: {
    recentlyAdded: {
      loaded: boolean;
      nextUrl: string | null;
      items: string[];
      size: string;
    };
    settings: {
      currentTabIndex: number;
      fullscreen: boolean;
    };
    scrollPos: {
      limit: number;
      pos: {
        href: string;
        position: number;
      }[];
    };
  };
  lyricon: boolean;
  page: string;
  pageHistory: string[];
  pluginPages: {
    page: string;
    pages: string[];
  };
  artwork: {
    playerLCD: string;
  };
  playerLCD: {
    playbackDuration: number;
    desiredDuration: number;
    userInteraction: boolean;
  };
  drawertest: boolean;
  drawer: {
    open: boolean;
    panel: string;
  };
  artistPage: {
    data: Record<string, any>;
  };
  modals: Record<
    | "addToPlaylist"
    | "spatialProperties"
    | "qrcode"
    | "equalizer"
    | "audioSettings"
    | "pluginMenu"
    | "audioControls"
    | "audioPlaybackRate"
    | "showPlaylist"
    | "castMenu"
    | "pathMenu"
    | "moreInfo"
    | "airplayPW"
    | "settings",
    boolean
  >;
  showingPlaylist: string[];
  search: {
    term: string;
    cursor: number;
    hints: string[];
    showHints: boolean;
    showSearchView: boolean;
    results: Record<string, any>;
    resultsSocial: Record<string, any>;
    resultsLibrary: Record<string, any>;
    limit: number;
  };
  menuPanel: {
    visible: boolean;
    event: Event | null;
    content: {
      name: string;
      items: Record<string, any>;
      headerItems: Record<string, any>;
    };
  };
  setPage: (value: string) => void;
  setShowingPlaylist: (value: string[]) => void;
  setArtistPage: (value: { data: Record<string, any> }) => void;
  resetSimpleState: () => void;
  resetRecentlyAdded: () => void;
  setLCDArtwork: (artwork: string) => void;
  setPagePos: (pageState?: Record<string, any>) => void;
  invokeDrawer: (panel: string) => void;
}

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    windowRelativeScale: 1,

    artwork: {
      playerLCD: "",
    },
    playerLCD: {
      playbackDuration: 0,
      desiredDuration: 0,
      userInteraction: false,
    },
    pluginPages: {
      page: "hello-world",
      pages: [],
    },
    pageState: {
      recentlyAdded: {
        loaded: false,
        nextUrl: null,
        items: [],
        size: "normal",
      },
      settings: {
        currentTabIndex: 0,
        fullscreen: false,
      },
      scrollPos: {
        limit: 10,
        pos: [],
      },
    },
    lyricon: false,
    drawertest: false,
    drawer: {
      open: false,
      panel: "",
    },
    page: "",
    pageHistory: [],
    artistPage: {
      data: {},
    },
    selectedMediaItems: [],
    search: {
      term: "",
      cursor: -1,
      hints: [],
      showHints: false,
      showSearchView: false,
      results: {},
      resultsSocial: {},
      resultsLibrary: {},
      limit: 10,
    },
    menuPanel: {
      visible: false,
      event: null,
      content: {
        name: "",
        items: {},
        headerItems: {},
      },
    },
    showingPlaylist: [],
    modals: {
      addToPlaylist: false,
      spatialProperties: false,
      qrcode: false,
      equalizer: false,
      audioSettings: false,
      pluginMenu: false,
      audioControls: false,
      audioPlaybackRate: false,
      showPlaylist: false,
      castMenu: false,
      pathMenu: false,
      moreInfo: false,
      airplayPW: false,
      settings: false,
    },
    setWindowScaleFactor: () =>
      set((state) => {
        let scale = (((window.devicePixelRatio * window.innerWidth) / 1280) * window.innerHeight) / 720;
        const desiredScale = clamp(parseFloat(this.cfg.visual.maxElementScale === -1 ? 1.5 : this.cfg.visual.maxElementScale), 1, 1.5);
        state.windowRelativeScale = scale;
        if (scale <= 1) {
          scale = 1;
        } else if (scale >= desiredScale) {
          scale = desiredScale;
        }
        document.documentElement.style.setProperty("--windowRelativeScale", scale);
      }),
    getPagePos: (href = "") =>
      set((state) => {
        const _state = state.pageState.scrollPos.pos.find((page) => {
          return page.href === href;
        });
        return (
          _state ?? {
            page: href,
            position: 0,
          }
        );
      }),
    setPage: (value) =>
      set((state) => {
        state.page = value;
        // document.getElementById("app-content").scrollTo(0, 0);
        state.resetSimpleState();
      }),
    setShowingPlaylist: (value) =>
      set((state) => {
        state.showingPlaylist = value;
        if (!state.modals.showPlaylist) {
          // document.getElementById("app-content").scrollTo(0, 0);
          state.resetSimpleState();
        }
      }),
    resetSimpleState: () =>
      set((state) => {
        state.menuPanel.visible = false;
        state.selectedMediaItems = [];
        state.chrome.contentAreaScrolling = true;
        for (const key in Object.keys(state.modals)) {
          state.modals[key as keyof typeof state.modals] = false;
        }
      }),
    resetRecentlyAdded: () =>
      set((state) => {
        state.pageState.recentlyAdded.loaded = false;
        state.pageState.recentlyAdded.nextUrl = null;
        state.pageState.recentlyAdded.items = [];
      }),

    setLCDArtwork: (artwork) =>
      set((state) => {
        state.artwork.playerLCD = artwork;
      }),
    setArtistPage: (value) =>
      set((state) => {
        state.artistPage = value;
        // document.getElementById("app-content").scrollTo(0, 0);
        state.resetSimpleState();
      }),
    setPagePos: (pageState = {}) =>
      set((state) => {
        const cached = state.pageState.scrollPos.pos.find((page) => {
          return page.href === pageState.href;
        });
        if (cached) {
          state.pageState.scrollPos.pos.find((page) => {
            if (page.href === pageState.href) {
              page.position = pageState.position;
            }
          });
          return;
        }
        state.pageState.scrollPos.pos.push({
          href: pageState.href,
          position: pageState.position,
        });
        if (state.pageState.scrollPos.pos.length > state.pageState.scrollPos.limit) {
          pages.value.shift();
        }
        return;
      }),
    openSettingsPage: (page: string) =>
      set((state) => {
        switch (page) {
          case "general":
            state.pageState.settings.currentTabIndex = 0;
            break;
          case "audio":
            state.pageState.settings.currentTabIndex = 1;
            break;
          case "audiolabs":
            state.pageState.settings.currentTabIndex = 2;
            break;
          case "styles":
            state.pageState.settings.currentTabIndex = 3;
            break;
          case "visual":
            state.pageState.settings.currentTabIndex = 4;
            break;
          case "github-plugins":
            state.pageState.settings.currentTabIndex = 5;
            break;
          case "lyrics":
            state.pageState.settings.currentTabIndex = 6;
            break;
          case "connectivity":
            state.pageState.settings.currentTabIndex = 7;
            break;
          case "advanced":
            state.pageState.settings.currentTabIndex = 8;
            break;
          case "keybindings":
            state.pageState.settings.currentTabIndex = 9;
            break;
          case "github-themes":
            state.pageState.settings.currentTabIndex = 10;
            break;
        }
        state.modals.settings = true;
      }),
    invokeDrawer: (panel) =>
      set((state) => {
        if (state.drawer.panel === panel && state.drawer.open) {
          if (panel === "lyrics") {
            state.lyricon = false;
          }
          state.drawer.panel = "";
          state.drawer.open = false;
        } else {
          if (panel === "lyrics") {
            state.lyricon = true;
          } else {
            state.lyricon = false;
          }
          state.drawer.open = true;
          state.drawer.panel = panel;
        }
      }),
    showMenuPanel: (data, event) =>
      set((state) => {
        state.menuPanel.visible = true;
        state.menuPanel.content.name = data.name ?? "";
        state.menuPanel.content.items = data.items ?? {};
        state.menuPanel.content.headerItems = data.headerItems ?? {};
        if (event) {
          state.menuPanel.event = event;
        }
      }),
    promptAddToPlaylist: () =>
      set((state) => {
        state.modals.addToPlaylist = true;
      }),
    setWindowHash(route = "") {
      this.setPagePos();
      window.location.hash = `#${route}`;
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
    async getSearchHints() {
      if (get().search.term === "") {
        this.search.hints = [];
        this.search.showHints = true;
        this.search.showSearchView = false;
        return;
      }
      const hints = await (
        await this.mk.api.v3.music(`/v1/catalog/${this.mk.storefrontId}/search/suggestions?term=${encodeURIComponent(this.search.term)}`, {
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
      if (get().playerLCD.userInteraction) {
        return get().playerLCD.desiredDuration;
      } else {
        return get().playerLCD.playbackDuration;
      }
    },

    appRoute(route) {
      if (route === "" || route === "#" || route === "/") {
        return;
      }
      route = route.replace(/#/g, "");
      if (this.cfg.general.resumeTabs.tab === "dynamic") {
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
          this.cfg.general.resumeTabs.dynamicData = route;
        } else {
          this.cfg.general.resumeTabs.dynamicData = "home";
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
        $("#app-content").scrollTop(this.getPagePos(window.location.hash).position);
      }, 100);
    },
    routeView(item) {
      this.setPagePos();
      let kind = item.attributes?.playParams ? (item.attributes?.playParams?.kind ?? item.type ?? "") : (item.type ?? "");
      let id = item.attributes?.playParams ? (item.attributes?.playParams?.id ?? item.id ?? "") : (item.id ?? "");
      const isLibrary = item.attributes?.playParams ? (item.attributes?.playParams?.isLibrary ?? false) : false;
      if (kind.includes("playlist") || kind.includes("album")) {
        this.showingPlaylist = [];
      }
      if (kind.toString().includes("apple-curator")) {
        kind = "appleCurator";
        this.getTypeFromID("appleCurator", id, false, {
          platform: "web",
          include: "grouping,playlists",
          extend: "editorialArtwork",
          "art[url]": "f",
        }).then(() => {
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
            this.getTypeFromID(kind, id, false, {
              platform: "web",
              extend: "editorialArtwork,uber,lockupStyle",
            }).then(() => {
              kind = "multiroom";
              window.location.hash = `${kind}/${id}`;
            });

            return;
          } else if (item.attributes.link.url.includes("viewFeature")) {
            const params = new Proxy(new URLSearchParams(new URL(item.attributes.link.url).search), {
              get: (searchParams, prop) => searchParams.get(prop),
            });
            id = params.id;
            this.mk.api.v3
              .music(`/v1/editorial/${this.mk.storefrontId}/multiplex/${id}?art%5Burl%5D=f&format%5Bresources%5D=map&platform=web`)
              .then((data) => {
                const item = data.data.results?.target ?? [];
                this.routeView(item);
              });
          } else {
            window.open(item.attributes.link.url);
          }
        }
      } else if (kind === "multiplex") {
        this.mk.api.v3
          .music(`/v1/editorial/${this.mk.storefrontId}/multiplex/${id}?art%5Burl%5D=f&format%5Bresources%5D=map&platform=web`)
          .then((data) => {
            const item = data.data.results?.target ?? [];
            this.routeView(item);
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
        this.getArtistInfo(id, isLibrary);
        window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ""}`;
        // document.querySelector("#app-content").scrollTop = 0;
      } else if (kind.toString().includes("record-label") || kind.toString().includes("curator")) {
        if (kind.toString().includes("record-label")) {
          kind = "recordLabel";
        } else {
          kind = "curator";
        }
        this.page = kind + "_" + id;
        this.getTypeFromID(kind, id, isLibrary, {
          extend: "editorialVideo",
          include: "grouping,playlists",
          views: "top-releases,latest-releases,top-artists",
        });
        window.location.hash = `${kind}/${id}`;
        document.querySelector("#app-content").scrollTop = 0;
        this.resumePagePos();
      } else if (kind.toString().includes("social-profiles")) {
        this.page = kind + "_" + id;
        this.mk.api.v3
          .music(`/v1/social/${this.mk.storefrontId}/social-profiles/${id}`, {
            include: "shared-playlists",
          })
          .then((data) => {
            console.log(data);
            this.showingPlaylist = data.data?.data[0];
            window.location.hash = `${kind}/${id}`;
            document.querySelector("#app-content").scrollTop = 0;
          });
        // this.getTypeFromID((kind), (id), (isLibrary), {
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
        const params: Record<string, any> = {
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
          this.page = kind + "_" + id;
          window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ""}`;
          this.getTypeFromID(kind, id, isLibrary, params);
        } else {
          this.page = kind;
          window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ""}`;
        }
        this.resumePagePos();
        // this.getTypeFromID((kind), (id), (isLibrary), params);
      } else if (kind.toString().includes("song")) {
        const albumUrl = new Promise(async (resolve, reject) => {
          resolve(await MusicKitInterop.fetchSongRelationships({ id: id, relationship: "album" }));
        });
        albumUrl.then((data) => {
          if (data && data.type === "albums" && data.id) {
            window.location.hash = `album/${data.id}${isLibrary ? "/" + isLibrary : ""}`;
          } else {
            this.playMediaItemById(id, kind, isLibrary, item.attributes.url ?? "");
          }
        });
      } else {
        this.playMediaItemById(id, kind, isLibrary, item.attributes.url ?? "");
      }
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
      const response = await this.mk.api.v3.music(`/v1/catalog/${this.mk.storefrontId}/search?term=${term}`, requestBody, {
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
    async showRecordLabelView(label, title, view) {
      const response = (
        await this.mk.api.v3.music(`/v1/catalog/${this.mk.storefrontId}/record-labels/${label}/view/${view}?l=${this.mklang}`)
      ).data;
      await this.showCollection(response, title, "record-labels");
    },
    async showCollection(response, title, type, requestBody = {}) {
      console.debug(response);
      this.collectionList.requestBody = {};
      this.collectionList.response = response;
      this.collectionList.title = title;
      this.collectionList.type = type;
      this.collectionList.requestBody = requestBody;
      this.appRoute("collection-list");
    },
    async showArtistView(artist, title, view) {
      const response = (
        await this.mk.api.v3.music(
          `/v1/catalog/${this.mk.storefrontId}/artists/${artist}/view/${view}?l=${this.mklang}`,
          {},
          { includeResponseMeta: !0 },
        )
      ).data;
      console.debug(response);
      await this.showCollection(response, title, "artists");
    },
    /**
     * @param {string} url, href for the initial request
     * @memberof app
     */
    async showRoom(url) {
      const response = await this.mk.api.v3.music(url);
      const room = response.data.data[0];
      this.showCollection(room.relationships.contents, room.attributes.title);
    },
    progressBarStyle() {
      let val = get().playerLCD.playbackDuration;
      if (get().playerLCD.desiredDuration > 0) {
        val = get().playerLCD.desiredDuration;
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
    resetState: () =>
      set((state) => {
        state.menuPanel.visible = false;
        state.selectedMediaItems = [];
        this.chrome.contentAreaScrolling = true;
        for (const key in Object.keys(state.modals)) {
          state.modals[key as keyof typeof state.modals] = false;
        }
      }),
    resumeTabs() {
      if (this.cfg.general.resumeTabs.tab === "dynamic") {
        this.appRoute(this.cfg.general.resumeTabs.dynamicData);
      } else {
        this.appRoute(this.cfg.general.resumeTabs.tab);
      }
    },
    playlistHeaderContextMenu(event) {
      const menu = {
        items: [
          {
            name: this.getLz("term.createNewPlaylist"),
            action: () => {
              this.newPlaylist();
            },
          },
          {
            name: this.getLz("term.createNewPlaylistFolder"),
            action: () => {
              this.newPlaylistFolder();
            },
          },
          {
            name: this.getLz("action.refresh"),
            action: () => {
              this.refreshPlaylists();
            },
          },
        ],
      };
      this.showMenuPanel(menu, event);
    },
    async checkForThemeUpdates() {
      const themes = window.electronAPI.sendSync("get-themes");
      await asyncForEach(themes, async (theme) => {
        if (theme.commit !== "") {
          if (theme.commit !== "") {
            this._fetch(`https://api.github.com/repos/${theme.github_repo}/commits`).then((res) => res.json());
            if (res[0].sha !== theme.commit) {
              const notify = notyf.open({
                className: "notyf-info",
                type: "info",
                message: stringTemplateParser(this.getLz("settings.notyf.visual.theme.updateAvailable"), { theme: theme.name }),
              });
              notify.on("click", () => {
                this.openSettingsPage("github-themes");
                notyf.dismiss(notify);
              });
            }
          }
        }
      });
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
      this.routeView(item);
    },
    showSearch: () =>
      set((state) => {
        state.page = "search";
      }),
    /**
     * Gets the total duration in seconds of a playlist
     * @returns {string} Total tracks, and duration
     * @author Core#1034
     * @memberOf app
     */
    getTotalTime: () => {
      try {
        if (get().showingPlaylist.relationships.tracks.data.length === 0) return "";
        const timeInSeconds = Math.round(
          []
            .concat(...get().showingPlaylist.relationships.tracks.data)
            .reduce((a, { attributes: { durationInMillis } }) => a + durationInMillis, 0) / 1000,
        );
        return `${get().showingPlaylist.relationships.tracks.data.length} ${this.getLz("term.track", {
          count: get().showingPlaylist.relationships.tracks.data.length,
        })}, ${convertTime(timeInSeconds, "long")}`;
      } catch (err) {
        return "";
      }
    },
    focusSearch() {
      this.appRoute("search");
      const search = document.getElementsByClassName("search-input");
      if (search.length > 0) {
        search[0].focus();
      }
    },
    getSidebarItemClass(page: string) {
      if (get().page === page) {
        return ["active"];
      } else {
        return [];
      }
    },
    async searchAndNavigate(item, target) {
      this.tmpVar = item;
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
              await this.mk.api.v3.music(`v1/catalog/${this.mk.storefrontId}/search?term=${item.attributes.artistName}`, {
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
          if (artistId !== "") this.appRoute(`artist/${artistId}`);
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
                await this.mk.api.v3.music(
                  `v1/catalog/${this.mk.storefrontId}/search?term=${(item.attributes.albumName ?? item.attributes.name ?? "") + " " + (item.attributes.artistName ?? "")}`,
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
            this.appRoute(`album/${albumId}`);
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
                await this.mk.api.v3.music(`v1/catalog/${this.mk.storefrontId}/search?term=${item.attributes.recordLabel}`, {
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
            this.showingPlaylist = [];
            await this.getTypeFromID("recordLabel", labelId, false, {
              views: "top-releases,latest-releases,top-artists",
            });
            this.page = "recordLabel_" + labelId;
          }

          break;
      }
    },

    async getNowPlayingItemDetailed(target) {
      const nowPlayingItem = JSON.parse(JSON.stringify(this.mk.nowPlayingItem));
      if (nowPlayingItem.type === "radioStation" && this.mk.nowPlayingItem.id !== -1) {
        nowPlayingItem.playParams = { kind: "songs" };
        nowPlayingItem.attributes.playParams.catalogId = this.mk.nowPlayingItem.id;
        nowPlayingItem.attributes.playParams.id = this.mk.nowPlayingItem.id;
        nowPlayingItem.id = this.mk.nowPlayingItem.id;
      }
      try {
        const u = await this.mkapi(
          nowPlayingItem.playParams.kind,
          nowPlayingItem.songId === -1,
          nowPlayingItem.songId !== -1 ? nowPlayingItem.songId : nowPlayingItem["id"],
          { "include[songs]": "albums,artists", l: this.mklang },
        );
        this.searchAndNavigate(u.data.data[0], target);
      } catch (e) {
        this.searchAndNavigate(nowPlayingItem, target);
      }
    },
    exitMV() {
      MusicKit.getInstance().stop();
      document.getElementById("apple-music-video-container").style.display = "none";
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
    async searchQuery(term = get().search.term) {
      if (typeof term === "object") {
        this.routeView(term);
        this.search.term = "";
        return;
      }
      if (term === "") {
        return;
      }
      //this.mk.api.v3.music(`/v1/catalog/${this.mk.storefrontId}/search?term=${this.search.term}`
      this.mk.api.v3
        .music(`/v1/catalog/${this.mk.storefrontId}/search?term=${encodeURIComponent(this.search.term)}`, {
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
          this.search.results = results.data.results;
        });

      this.mk.api.v3
        .music(
          `v1/social/${this.mk.storefrontId}/search?term=${this.search.term}`,
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
          this.search.resultsSocial = results.data.results;
        });

      this.search.resultsLibrary = await this.mk.api.library.search(this.search.term, {
        types: "library-songs,library-albums,library-playlists,library-artists",
        limit: 25,
        offset: 0,
      });
    },
    async getCurrentArtURL() {
      let artworkSize = 50;
      if (this.getThemeDirective("lcdArtworkSize") !== "") {
        artworkSize = this.getThemeDirective("lcdArtworkSize");
      } else if (this.cfg.visual.directives.windowLayout === "twopanel") {
        artworkSize = 110;
      }
      const mediaItem =
        (this.mk?.nowPlayingItem?.attributes?.artwork?.url ? this?.mk?.nowPlayingItem : null) ??
        (await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk?.nowPlayingItem?.id}`)?.data?.data?.data[0]) ??
        {};
      return {
        currentArtUrlRaw: mediaItem?.attributes?.artwork?.url ?? "",
        currentArtUrl:
          mediaItem?._assets[0]?.artworkURL ?? mediaItem?.attributes?.artwork?.url?.replace("{w}", artworkSize).replace("{h}", artworkSize),
      };
    },
    async setLibraryArtBG() {
      if (typeof this.mk.nowPlayingItem === "undefined") return;
      try {
        let data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
        data = data.data.data[0];

        if (data !== null && data !== "") {
          getBase64FromUrl(data["attributes"]["artwork"]["url"].toString()).then((img) => {
            document.querySelectorAll(".bg-artwork")?.forEach((artwork) => {
              artwork.src = img;
            });
            this.setLCDArtwork(img);
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
    async setLibraryArt() {
      if (typeof this.mk.nowPlayingItem === "undefined") return;
      try {
        let data = await this.mk.api.v3.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
        data = data.data.data[0];

        if (data !== null && data !== "") {
          document
            .querySelector(".app-playback-controls .artwork")
            ?.style.setProperty("--artwork", 'url("' + data["attributes"]["artwork"]["url"].toString() + '")');
        } else {
          document.querySelector(".app-playback-controls .artwork")?.style.setProperty("--artwork", `url("")`);
        }
      } catch (e) {
        console.log(e);
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
      const data_type = this.mk.nowPlayingItem.playParams.kind;
      const item_id = this.mk.nowPlayingItem.attributes.playParams.id ?? this.mk.nowPlayingItem.id;
      const isLibrary = this.mk.nowPlayingItem.attributes.playParams.isLibrary ?? false;
      const params = {
        "fields[songs]": "inLibrary",
        "fields[albums]": "inLibrary",
        relate: "library",
        t: "1",
      };
      this.selectedMediaItems = [];
      this.select_selectMediaItem(item_id, data_type, 0, "12344", isLibrary);
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
              name: this.getLz("action.love"),
              hidden: false,
              disabled: true,
              action: function () {
                this.love(this.mk.nowPlayingItem);
              },
            },
            {
              icon: "./assets/feather/heart.svg",
              id: "unlove",
              active: true,
              name: this.getLz("action.unlove"),
              hidden: true,
              action: function () {
                this.unlove(this.mk.nowPlayingItem);
              },
            },
            {
              icon: "./assets/feather/thumbs-down.svg",
              id: "dislike",
              name: this.getLz("action.dislike"),
              hidden: false,
              disabled: true,
              action: function () {
                this.dislike(this.mk.nowPlayingItem);
              },
            },
            {
              icon: "./assets/feather/thumbs-down.svg",
              id: "undo_dislike",
              name: this.getLz("action.undoDislike"),
              active: true,
              hidden: true,
              action: function () {
                this.unlove(this.mk.nowPlayingItem);
              },
            },
          ],
          items: [
            {
              icon: "./assets/feather/plus.svg",
              id: "addToLibrary",
              name: this.getLz("action.addToLibrary") + " ...",
              disabled: true,
              action: function () {
                this.addToLibrary(this.mk.nowPlayingItem.id);
              },
            },
            {
              id: "removeFromLibrary",
              icon: "./assets/feather/x-circle.svg",
              name: this.getLz("action.removeFromLibrary"),
              hidden: true,
              action: function () {
                this.removeFromLibrary(this.mk.nowPlayingItem.type, MusicKitInterop.getAttributes().songId);
              },
            },
            {
              icon: "./assets/feather/list.svg",
              name: this.getLz("action.addToPlaylist") + " ...",
              action: function () {
                this.promptAddToPlaylist();
              },
            },
            {
              icon: "./assets/feather/radio.svg",
              name: this.getLz("action.startRadio"),
              action: function () {
                this.mk.setStationQueue({ song: this.mk.nowPlayingItem.id }).then(() => {
                  this.mk.play();
                  this.selectedMediaItems = [];
                });
              },
            },
            {
              icon: "./assets/feather/user.svg",
              name: this.getLz("action.goToArtist"),
              action: async function () {
                if (this.mk.nowPlayingItem.relationships.artists.data[0].id) {
                  this.appRoute(`artist/${this.mk.nowPlayingItem.relationships.artists.data[0].id}`);
                } else {
                  const primaryArtist = await MusicKitInterop.fetchSongRelationships({ relationship: "primaryArtist" });
                  this.appRoute(`artist/${primaryArtist.id}`);
                }
              },
            },
            {
              icon: "./assets/feather/disc.svg",
              name: this.getLz("action.goToAlbum"),
              action: function () {
                this.appRoute(`album/${this.mk.nowPlayingItem.relationships.albums.data[0].id}`);
              },
            },
            {
              id: "showInMusic",
              icon: "./assets/music.svg",
              hidden: true,
              name: this.getLz("action.showInAppleMusic"),
              action: function () {
                this.routeView(this.mk.nowPlayingItem._container);
              },
            },
            {
              icon: "./assets/feather/share.svg",
              name: this.getLz("action.share"),
              action: function () {
                app
                  .mkapi(
                    this.mk.nowPlayingItem.attributes?.playParams?.kind ?? this.mk.nowPlayingItem.type ?? "songs",
                    false,
                    this.mk.nowPlayingItem._songId ?? this.mk.nowPlayingItem.songId ?? this.mk.nowPlayingItem.id ?? "",
                  )
                  .then((u) => {
                    this.copyToClipboard(
                      u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url,
                    );
                  });
              },
            },
            {
              icon: "./assets/feather/share.svg",
              name: `${this.getLz("action.share")} (song.link)`,
              action: function () {
                app
                  .mkapi(
                    this.mk.nowPlayingItem.attributes?.playParams?.kind ?? this.mk.nowPlayingItem.type ?? "songs",
                    false,
                    this.mk.nowPlayingItem._songId ?? this.mk.nowPlayingItem.songId ?? this.mk.nowPlayingItem.id ?? "",
                  )
                  .then((u) => {
                    this.songLinkShare(
                      u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url,
                    );
                  });
              },
            },
            {
              id: "equalizer",
              icon: "../views/svg/speaker.svg",
              name: this.getLz("term.equalizer"),
              hidden: false,
              action: function () {
                this.modals.equalizer = true;
                this.modals.audioSettings = false;
              },
            },
            {
              id: "audioLab",
              icon: "../views/svg/speaker.svg",
              name: this.getLz("settings.option.audio.audioLab"),
              hidden: false,
              action: function () {
                this.openSettingsPage("audiolabs");
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

      const nowPlayingContainer = this.mk.nowPlayingItem._container;
      if (nowPlayingContainer && nowPlayingContainer["attributes"] && nowPlayingContainer.name !== "station") {
        menus.normal.items.find((x) => x.id === "showInMusic").hidden = false;
      }

      this.showMenuPanel(menus[useMenu], event);

      try {
        // if its a radio station, then change the attributes to match a song
        const nowPlayingItem = JSON.parse(JSON.stringify(this.mk.nowPlayingItem));
        if (nowPlayingItem.type === "radioStation" && this.mk.nowPlayingItem.id !== -1) {
          nowPlayingItem.type = "song";
          nowPlayingItem.attributes.playParams.catalogId = this.mk.nowPlayingItem.id;
          nowPlayingItem.attributes.playParams.id = this.mk.nowPlayingItem.id;
          nowPlayingItem.id = this.mk.nowPlayingItem.id;
        }
        const result = await this.inLibrary([nowPlayingItem]);
        if (result[0].attributes.inLibrary) {
          menus.normal.items.find((x) => x.id === "addToLibrary")!.hidden = true;
          menus.normal.items.find((x) => x.id === "removeFromLibrary")!.hidden = false;
        } else {
          menus.normal.items.find((x) => x.id === "addToLibrary")!.disabled = false;
        }
      } catch (e) {
        e = null;
      }

      try {
        const rating = await this.getRating(this.mk.nowPlayingItem);
        if (rating === 0) {
          menus.normal.headerItems.find((x) => x.id === "love")!.disabled = false;
          menus.normal.headerItems.find((x) => x.id === "dislike")!.disabled = false;
        } else if (rating === 1) {
          menus.normal.headerItems.find((x) => x.id === "unlove")!.hidden = false;
          menus.normal.headerItems.find((x) => x.id === "love")!.hidden = true;
        } else if (rating === -1) {
          menus.normal.headerItems.find((x) => x.id === "undo_dislike")!.hidden = false;
          menus.normal.headerItems.find((x) => x.id === "dislike")!.hidden = true;
        }
      } catch (e) {
        console.log(e);
      }
    },

    fullscreen(flag, mv = false) {
      this.fullscreenState = flag;
      if (flag) {
        window.electronAPI.send("setFullScreen", true);
        if (!mv) {
          this.appMode = "fullscreen";
        } else {
          this.mvViewMode = "full";
        }

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && this.appMode === "fullscreen") {
            this.fullscreen(false);
          }
        });
      } else {
        window.electronAPI.send("setFullScreen", false);
        this.appMode = "player";
      }
    },
    getNowPlayingArtworkBG(size = 32, force = false) {
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
            document.querySelector(".bg-artwork")!.src = "";
            if (this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
              getBase64FromUrl(this.mk["nowPlayingItem"]["attributes"]["artwork"]["url"].replace("{w}", size).replace("{h}", size)).then(
                (img) => {
                  document.querySelectorAll(".bg-artwork").forEach((artwork) => {
                    artwork.src = img;
                  });
                  this.setLCDArtwork(img);
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
  })),
);
