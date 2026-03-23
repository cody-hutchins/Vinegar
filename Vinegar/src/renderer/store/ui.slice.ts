import { StateCreator } from "zustand";
import { asyncForEach, clamp, convertTime, getBase64FromUrl, notyf, stringTemplateParser } from "../main/helpers.js";
import { ContextMenuEvent } from "electron";
import { NotyfEvent } from "notyf";
import { GeneralState, UIState } from "./store.js";
import i18n from "../main/i18n.js";

type UIStateCreator = StateCreator<GeneralState, [["zustand/immer", never], never], [], { ui: UIState }>;

export const createUISlice: UIStateCreator = (set, get) => ({
  ui: {
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
    showingPlaylist: {} as MusicKit.Playlists,
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
        const desiredScale = clamp(parseFloat(state.cfg.visual.maxElementScale === -1 ? 1.5 : state.cfg.visual.maxElementScale), 1, 1.5);
        state.ui.windowRelativeScale = scale;
        if (scale <= 1) {
          scale = 1;
        } else if (scale >= desiredScale) {
          scale = desiredScale;
        }
        document.documentElement.style.setProperty("--windowRelativeScale", scale);
      }),
    getPagePos: (href = "") => {
      const _state = get().ui.pageState.scrollPos.pos.find((page) => {
        return page.href === href;
      });
      return (
        _state ?? {
          page: href,
          position: 0,
        }
      );
    },
    setPage: (value) =>
      set((state) => {
        state.ui.page = value;
        // document.getElementById("app-content").scrollTo(0, 0);
        state.ui.resetSimpleState();
      }),
    setShowingPlaylist: (value) =>
      set((state) => {
        state.ui.showingPlaylist = value;
        if (!state.ui.modals.showPlaylist) {
          // document.getElementById("app-content").scrollTo(0, 0);
          state.ui.resetSimpleState();
        }
      }),
    resetSimpleState: () =>
      set((state) => {
        state.ui.menuPanel.visible = false;
        state.library.selectedMediaItems = [];
        state.chrome.contentAreaScrolling = true;
        for (const key in Object.keys(state.modals)) {
          state.ui.modals[key as keyof typeof state.ui.modals] = false;
        }
      }),
    resetRecentlyAdded: () =>
      set((state) => {
        state.ui.pageState.recentlyAdded.loaded = false;
        state.ui.pageState.recentlyAdded.nextUrl = null;
        state.ui.pageState.recentlyAdded.items = [];
      }),

    setLCDArtwork: (artwork) =>
      set((state) => {
        state.ui.artwork.playerLCD = artwork;
      }),
    setArtistPage: (value) =>
      set((state) => {
        state.ui.artistPage = value;
        // document.getElementById("app-content").scrollTo(0, 0);
        state.ui.resetSimpleState();
      }),
    setPagePos: (pageState = {}) =>
      set((state) => {
        const cached = state.ui.pageState.scrollPos.pos.find((page) => {
          return page.href === pageState.href;
        });
        if (cached) {
          state.ui.pageState.scrollPos.pos.find((page) => {
            if (page.href === pageState.href) {
              page.position = pageState.position;
            }
          });
          return;
        }
        state.ui.pageState.scrollPos.pos.push({
          href: pageState.href,
          position: pageState.position,
        });
        if (state.ui.pageState.scrollPos.pos.length > state.ui.pageState.scrollPos.limit) {
          pages.value.shift();
        }
        return;
      }),
    openSettingsPage: (page: string) =>
      set((state) => {
        switch (page) {
          case "general":
            state.ui.pageState.settings.currentTabIndex = 0;
            break;
          case "audio":
            state.ui.pageState.settings.currentTabIndex = 1;
            break;
          case "audiolabs":
            state.ui.pageState.settings.currentTabIndex = 2;
            break;
          case "styles":
            state.ui.pageState.settings.currentTabIndex = 3;
            break;
          case "visual":
            state.ui.pageState.settings.currentTabIndex = 4;
            break;
          case "github-plugins":
            state.ui.pageState.settings.currentTabIndex = 5;
            break;
          case "lyrics":
            state.ui.pageState.settings.currentTabIndex = 6;
            break;
          case "connectivity":
            state.ui.pageState.settings.currentTabIndex = 7;
            break;
          case "advanced":
            state.ui.pageState.settings.currentTabIndex = 8;
            break;
          case "keybindings":
            state.ui.pageState.settings.currentTabIndex = 9;
            break;
          case "github-themes":
            state.ui.pageState.settings.currentTabIndex = 10;
            break;
        }
        state.ui.modals.settings = true;
      }),
    invokeDrawer: (panel) =>
      set((state) => {
        if (state.ui.drawer.panel === panel && state.ui.drawer.open) {
          if (panel === "lyrics") {
            state.ui.lyricon = false;
          }
          state.ui.drawer.panel = "";
          state.ui.drawer.open = false;
        } else {
          if (panel === "lyrics") {
            state.ui.lyricon = true;
          } else {
            state.ui.lyricon = false;
          }
          state.ui.drawer.open = true;
          state.ui.drawer.panel = panel;
        }
      }),
    showMenuPanel: (data: { name: string; items: Record<string, any>; headerItems: Record<string, any> }, event: ContextMenuEvent) =>
      set((state) => {
        state.ui.menuPanel.visible = true;
        state.ui.menuPanel.content.name = data.name ?? "";
        state.ui.menuPanel.content.items = data.items ?? {};
        state.ui.menuPanel.content.headerItems = data.headerItems ?? {};
        if (event) {
          state.ui.menuPanel.event = event;
        }
      }),
    promptAddToPlaylist: () =>
      set((state) => {
        state.ui.modals.addToPlaylist = true;
      }),
    setWindowHash(route = "") {
      get().ui.setPagePos();
      window.location.hash = `#${route}`;
    },
    navigateBack() {
      set((state) => {
        state.ui.setPagePos();
        state.ui.resumePagePos();
        state.chrome.desiredPageTransition = "wpfade_transform_backwards";
      });
      return new Promise((resolve, reject) => {
        history.back();
        setTimeout(() => {
          resolve((get().chrome.desiredPageTransition = "wpfade_transform"));
        }, 100);
      });
    },
    async getSearchHints() {
      if (get().ui.search.term === "") {
        set((state) => {
          state.ui.search.hints = [];
          state.ui.search.showHints = true;
          state.ui.search.showSearchView = false;
        });
        return;
      }
      const hints = await (
        await get().app.mk.api.music(
          `/v1/catalog/${get().app.mk.storefrontId}/search/suggestions?term=${encodeURIComponent(get().ui.search.term)}`,
          {
            "fields[albums]": "artwork,name,playParams,url,artistName,id",
            "fields[artists]": "url,name,artwork,id",
            "fields[songs]": "artwork,name,playParams,url,artistName,id",
            kinds: "terms,topResults",
            l: get().app.mklang,
            "limit[results:terms]": 5,
            "limit[results:topResults]": 5,
            "omit[resource]": "autos",
            platform: "web",
            types: "activities,albums,artists,editorial-items,music-movies,playlists,record-labels,songs,stations",
          },
        )
      ).data.results;
      const shints = hints ? hints.suggestions : [];
      for (const item in shints) {
        if ((shints[item]?.displayTerm ?? "").includes("?fields[")) {
          shints[item].displayTerm = shints[item].searchTerm = shints[item].displayTerm.split("?fields[")[0];
        }
      }
      set((state) => {
        state.ui.search.hints = shints;
      });
    },
    getSongProgress() {
      if (get().ui.playerLCD.userInteraction) {
        return get().ui.playerLCD.desiredDuration;
      } else {
        return get().ui.playerLCD.playbackDuration;
      }
    },

    appRoute: (route: string) =>
      set((state) => {
        if (route === "" || route === "#" || route === "/") {
          return;
        }
        route = route.replace(/#/g, "");
        if (get().cfg.general.resumeTabs.tab === "dynamic") {
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
            state.cfg.general.resumeTabs.dynamicData = route;
          } else {
            state.cfg.general.resumeTabs.dynamicData = "home";
          }
        }

        // if the route contains does not include a / then route to the page directly
        if (route.indexOf("/") === -1) {
          state.ui.page = route;
          window.location.hash = state.ui.page;
          state.ui.resumePagePos();
          // if (state.ui.page === "settings") {
          //     state.app.version
          // }
          return;
        }
        const hash = route.split("/");
        const page = hash[0];
        const id = hash[1];
        const isLibrary = hash[2] ?? false;
        if (page === "plugin") {
          state.ui.pluginPages.page = "plugin." + id;
          state.ui.page = "plugin-renderer";
          return;
        }
        state.ui.routeView({
          kind: page,
          id: id,
          attributes: {
            playParams: { kind: page, id: id, isLibrary: isLibrary },
          },
        });
      }),
    resumePagePos() {
      setTimeout(() => {
        $("#app-content").scrollTop(get().ui.getPagePos(window.location.hash).position);
      }, 100);
    },
    async routeView(item: MusicKit.Albums) {
      get().ui.setPagePos();
      let kind = item.attributes?.playParams ? (item.attributes?.playParams?.kind ?? item.type ?? "") : (item.type ?? "");
      let id = item.attributes?.playParams ? (item.attributes?.playParams?.id ?? item.id ?? "") : (item.id ?? "");
      const isLibrary = item.attributes?.playParams ? (item.attributes?.playParams?.isLibrary ?? false) : false;
      if (kind.includes("playlist") || kind.includes("album")) {
        set((state) => {
          state.ui.showingPlaylist = {} as MusicKit.Playlists;
        });
      }
      if (kind.toString().includes("apple-curator")) {
        kind = "appleCurator";
        await get().app.getTypeFromID("appleCurator", id, false, {
          platform: "web",
          include: "grouping,playlists",
          extend: "editorialArtwork",
          "art[url]": "f",
        });
        kind = "appleCurator";
        window.location.hash = `${kind}/${id}`;
      } else if (kind === "editorial-elements" || kind === "editorial-items") {
        console.debug(item);
        if (item.relationships?.contents?.data !== null && item.relationships?.contents?.data.length > 0) {
          get().ui.routeView(item.relationships.contents.data[0]);
        } else if (item.attributes && item.attributes.url !== null) {
          if (item.attributes.url.includes("viewMultiRoom") || item.attributes.url.includes("/collection/")) {
            const params = new Proxy(new URLSearchParams(new URL(item.attributes.url).search), {
              get: (searchParams, prop) => searchParams.get(prop as string),
            });
            id = params.get("fcId");
            kind = "multiroom";
            if (item.attributes.url.includes("viewMultiRoom")) {
              kind = "multiroom";
            } else {
              kind = "room";
            }
            get().app.getTypeFromID(kind, id, false, {
              platform: "web",
              extend: "editorialArtwork,uber,lockupStyle",
            });
            kind = "multiroom";
            window.location.hash = `${kind}/${id}`;

            return;
          } else if (item.attributes.url.includes("viewFeature")) {
            const params = new Proxy(new URLSearchParams(new URL(item.attributes.url).search), {
              get: (searchParams, prop) => searchParams.get(prop as string),
            });
            id = params.get("id");
            const data = await get().app.mk.api.music(
              `/v1/editorial/${get().app.mk.storefrontId}/multiplex/${id}?art%5Burl%5D=f&format%5Bresources%5D=map&platform=web`,
            );
            const item = data.data.results?.target ?? [];
            get().ui.routeView(item);
          } else {
            window.open(item.attributes.url);
          }
        }
      } else if (kind === "multiplex") {
        const data = await get().app.mk.api.music(
          `/v1/editorial/${get().app.mk.storefrontId}/multiplex/${id}?art%5Burl%5D=f&format%5Bresources%5D=map&platform=web`,
        );
        const item = data.data.results?.target ?? [];
        get().ui.routeView(item);
      }
      if (kind === "multirooms") {
        await get().app.getTypeFromID("multiroom", id, false, {
          platform: "web",
          extend: "editorialArtwork,uber,lockupStyle",
        });
        kind = "multiroom";
        window.location.hash = `${kind}/${id}`;
        // document.querySelector("#app-content").scrollTop = 0;
        get().ui.resumePagePos();
      } else if (kind.toString().includes("artist")) {
        get().library.getArtistFromID(id, isLibrary);
        window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ""}`;
        // document.querySelector("#app-content").scrollTop = 0;
      } else if (kind.toString().includes("record-label") || kind.toString().includes("curator")) {
        if (kind.toString().includes("record-label")) {
          kind = "recordLabel";
        } else {
          kind = "curator";
        }
        this.page = kind + "_" + id;
        await get().app.getTypeFromID(kind, id, isLibrary, {
          extend: "editorialVideo",
          include: "grouping,playlists",
          views: "top-releases,latest-releases,top-artists",
        });
        window.location.hash = `${kind}/${id}`;
        document.querySelector("#app-content")!.scrollTop = 0;
        get().ui.resumePagePos();
      } else if (kind.toString().includes("social-profiles")) {
        this.page = kind + "_" + id;
        const data = await get().app.mk.api.music(`/v1/social/${get().app.mk.storefrontId}/social-profiles/${id}`, {
          include: "shared-playlists",
        });
        console.log(data);
        this.showingPlaylist = data.data?.data[0];
        window.location.hash = `${kind}/${id}`;
        document.querySelector("#app-content")!.scrollTop = 0;
        // get().app.getTypeFromID((kind), (id), (isLibrary), {
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
          await get().app.getTypeFromID(kind, id, isLibrary, params);
        } else {
          this.page = kind;
          window.location.hash = `${kind}/${id}${isLibrary ? "/" + isLibrary : ""}`;
        }
        get().ui.resumePagePos();
        // await get().app.getTypeFromID((kind), (id), (isLibrary), params);
      } else if (kind.toString().includes("song")) {
        const data = await MusicKitInterop.fetchSongRelationships({ id: id, relationship: "album" });
        if (data && data.type === "albums" && data.id) {
          window.location.hash = `album/${data.id}${isLibrary ? "/" + isLibrary : ""}`;
        } else {
          get().app.playMediaItemById(id, kind, isLibrary, item.attributes!.url ?? "");
        }
      } else {
        get().app.playMediaItemById(id, kind, isLibrary, item.attributes!.url ?? "");
      }
    },
    async showSearchView(term: string, group: string, title: string) {
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
        l: get().app.mklang,
      };
      const response = await get().app.mk.api.music(`/v1/catalog/${get().app.mk.storefrontId}/search?term=${term}`, requestBody, {
        includeResponseMeta: !0,
      });

      console.debug("searchres", response);
      const responseFormat = {
        data: response.data.results[group].data,
        next: response.data.results[group].next,
        groups: group,
      };
      await get().app.showCollection(responseFormat, title, "search", requestBody);
    },
    async showRecordLabelView(label: string, title: string, view: string) {
      const response = (
        await get().app.mk.api.music(`/v1/catalog/${get().app.mk.storefrontId}/record-labels/${label}/view/${view}?l=${get().app.mklang}`)
      ).data;
      await get().app.showCollection(response, title, "record-labels");
    },
    async showArtistView(artist: string, title: string, view: string) {
      const response = (
        await get().app.mk.api.music(
          `/v1/catalog/${get().app.mk.storefrontId}/artists/${artist}/view/${view}?l=${get().app.mklang}`,
          {},
          { includeResponseMeta: !0 },
        )
      ).data;
      console.debug(response);
      await get().app.showCollection(response, title, "artists");
    },
    /**
     * @param {string} url, href for the initial request
     * @memberof app
     */
    async showRoom(url: string) {
      const response = await get().app.mk.api.music(url);
      const room = response.data.data[0];
      get().app.showCollection(room.relationships.contents, room.attributes.title);
    },
    progressBarStyle() {
      let val = get().ui.playerLCD.playbackDuration;
      if (get().ui.playerLCD.desiredDuration > 0) {
        val = get().ui.playerLCD.desiredDuration;
      }
      const min = 0;
      const max = get().app.mk.currentPlaybackDuration;
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
            get: (searchParams, prop) => searchParams.get(prop as string),
          });
          const id = params.get("fcId");
          get()
            .app.getTypeFromID("room", id, false, {
              platform: "web",
              extend: "editorialArtwork,uber,lockupStyle",
            })
            .then(() => {
              const kind = "multiroom";
              window.location.hash = `${kind}/${id}`;
              document.querySelector("#app-content")!.scrollTop = 0;
            });
        }
      }
    },
    navigateForward() {
      get().ui.setPagePos();
      get().ui.resumePagePos();
      history.forward();
    },
    resetState: () =>
      set((state) => {
        state.ui.menuPanel.visible = false;
        state.library.selectedMediaItems = [];
        state.chrome.contentAreaScrolling = true;
        for (const key in Object.keys(state.ui.modals)) {
          state.ui.modals[key as keyof typeof state.ui.modals] = false;
        }
      }),
    resumeTabs() {
      if (get().cfg.general.resumeTabs.tab === "dynamic") {
        get().ui.appRoute(get().cfg.general.resumeTabs.dynamicData);
      } else {
        get().ui.appRoute(get().cfg.general.resumeTabs.tab);
      }
    },
    playlistHeaderContextMenu(event: ContextMenuEvent) {
      const menu = {
        items: [
          {
            name: i18n.t("term.createNewPlaylist"),
            action: () => {
              get().library.newPlaylist();
            },
          },
          {
            name: i18n.t("term.createNewPlaylistFolder"),
            action: () => {
              get().library.newPlaylistFolder();
            },
          },
          {
            name: i18n.t("action.refresh"),
            action: () => {
              get().library.refreshPlaylists();
            },
          },
        ],
      };
      this.showMenuPanel(menu, event);
    },
    async checkForThemeUpdates() {
      const themes = window.electronAPI.sendSync("get-themes");
      await asyncForEach(themes, async (theme: { commit: string; github_repo: string; name: string }) => {
        if (theme.commit !== "") {
          if (theme.commit !== "") {
            const res = (await this._fetch(`https://api.github.com/repos/${theme.github_repo}/commits`)).toJSON();
            if (res[0].sha !== theme.commit) {
              const notify = notyf.open({
                className: "notyf-info",
                type: "info",
                message: stringTemplateParser(this.getLz("settings.notyf.visual.theme.updateAvailable"), { theme: theme.name }),
              });
              notify.on(NotyfEvent.Click, () => {
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
        state.ui.page = "search";
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
          } catch {}

          if (artistId === "") {
            const artistQuery = (
              await this.mk.api.music(`v1/catalog/${this.mk.storefrontId}/search?term=${item.attributes.artistName}`, {
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
          } catch {}

          if (albumId === "") {
            try {
              const albumQuery = (
                await this.mk.api.music(
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
          } catch {}

          if (labelId === "") {
            try {
              const labelQuery = (
                await this.mk.api.music(`v1/catalog/${this.mk.storefrontId}/search?term=${item.attributes.recordLabel}`, {
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
        const u = await get().app.mkapi(
          nowPlayingItem.playParams.kind,
          nowPlayingItem.songId === -1,
          nowPlayingItem.songId !== -1 ? nowPlayingItem.songId : nowPlayingItem["id"],
          { "include[songs]": "albums,artists", l: this.mklang },
        );
        this.searchAndNavigate(u.data.data[0], target);
      } catch {
        this.searchAndNavigate(nowPlayingItem, target);
      }
    },
    exitMV() {
      MusicKit.getInstance().stop();
      document.getElementById("apple-music-video-container")!.style.display = "none";
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
    async searchQuery(term = get().ui.search.term) {
      if (typeof term === "object") {
        this.routeView(term);
        this.search.term = "";
        return;
      }
      if (term === "") {
        return;
      }
      //this.mk.api.music(`/v1/catalog/${this.mk.storefrontId}/search?term=${this.search.term}`
      this.mk.api
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

      this.mk.api
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
        (await this.mk.api.music(`/v1/me/library/songs/${this.mk?.nowPlayingItem?.id}`)?.data?.data?.data[0]) ??
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
        let data = await this.mk.api.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
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
        let data = await this.mk.api.music(`/v1/me/library/songs/${this.mk.nowPlayingItem.id}`);
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
                get()
                  .app.mkapi(
                    get().app.mk.nowPlayingItem.attributes?.playParams?.kind ?? get().app.mk.nowPlayingItem.type ?? "songs",
                    false,
                    get().app.mk.nowPlayingItem._songId ?? get().app.mk.nowPlayingItem.songId ?? get().app.mk.nowPlayingItem.id ?? "",
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
                get()
                  .app.mkapi(
                    get().app.mk.nowPlayingItem.attributes?.playParams?.kind ?? get().app.mk.nowPlayingItem.type ?? "songs",
                    false,
                    get().app.mk.nowPlayingItem._songId ?? get().app.mk.nowPlayingItem.songId ?? get().app.mk.nowPlayingItem.id ?? "",
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
              action: () =>
                set((state) => {
                  state.ui.modals.equalizer = true;
                  state.ui.modals.audioSettings = false;
                }),
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
      } catch {
        // e = null;
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
      if (typeof get().app.mk.nowPlayingItem === "undefined") return;
      const bginterval = setInterval(() => {
        if (!get().app.mkReady()) {
          return "";
        }
        try {
          if (
            (get().app.mk.nowPlayingItem &&
              get().app.mk.nowPlayingItem["id"] !== get().app.currentTrackID &&
              document.querySelector(".bg-artwork")) ||
            force
          ) {
            if (document.querySelector(".bg-artwork")) {
              clearInterval(bginterval);
            }
            this.currentTrackID = this.mk.nowPlayingItem["id"];
            document.querySelector(".bg-artwork")!.src = "";
            if (get().app.mk["nowPlayingItem"]["attributes"]["artwork"]["url"]) {
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
          } else if (get().app.mk.nowPlayingItem["id"] === get().app.currentTrackID) {
            try {
              clearInterval(bginterval);
            } catch (e) {
              console.log(e);
            }
          }
        } catch {
          if (get().app.mk.nowPlayingItem && get().app.mk.nowPlayingItem["id"] && document.querySelector(".bg-artwork")) {
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
    isElementOverflowing(selector: string) {
      try {
        const element = document.querySelector(selector);
        const overflowX = element!.offsetWidth < element!.scrollWidth,
          overflowY = element!.offsetHeight < element!.scrollHeight;
        element!.setAttribute("data-value", "\xa0\xa0\xa0\xa0" + element!.textContent);

        return overflowX || overflowY;
      } catch {
        return false;
      }
    },
    checkMarquee() {
      if (
        get().ui.isElementOverflowing(
          "#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-artist",
        )
      ) {
        document.getElementsByClassName("song-artist")[0].classList.add("marquee");
        document.getElementsByClassName("song-artist")[1].classList.add("marquee-after");
      }
      if (
        get().ui.isElementOverflowing("#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-name")
      ) {
        document.getElementsByClassName("song-name")[0].classList.add("marquee");
        document.getElementsByClassName("song-name")[1].classList.add("marquee-after");
      }
    },
    closeWindow() {
      window.electronAPI.send("close");
    },
    darwinShare(url: string) {
      window.electronAPI.send("share-menu", url);
    },
  },
});
