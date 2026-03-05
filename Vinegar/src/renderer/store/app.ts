import { IpcRenderer, ipcRenderer } from 'electron';
import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {CfgStore} from '../../main/base/store.js';
interface AppState {
  windowRelativeScale: 1,
  pageState: {
    recentlyAdded: {
      loaded: false,
      nextUrl: string | null,
      items: string[],
      size: string,
    },
    settings: {
      currentTabIndex: number,
      fullscreen: false,
    },
    scrollPos: {
      limit: number,
      pos: {
      href: string,
      position: number,
    }[],
    },
  },
  artwork: {
    playerLCD: string,
  },
  version: string,
  appMode: string,
  cfg: CfgStore,
  isDev: boolean,
  clientPort: number,
  drawertest: false,
  platform: string,
  mk: Record<string, any>,
  pluginInstalled: false,
  pluginMenuEntries: string[],
  pluginMenuTopEntries: string[],
  lz: string[],
  lzListing: string,
  radiohls: string | null,
  search: {
    term: string,
    cursor: number,
    hints: string[],
    showHints: boolean,
    showSearchView: boolean,
    results: Record<string, any>,
    resultsSocial: Record<string, any>,
    resultsLibrary: Record<string, any>,
    limit: number,
  },
  fullscreenLyrics: false,
  fullscreenState: Record<string, any>,
  playerLCD: {
    playbackDuration: number,
    desiredDuration: number,
    userInteraction: boolean,
  },
  drawer: {
    open: boolean,
    panel: string,
  },
  browsepage: string[],
  listennow: string[],
  madeforyou: string[],
  radio: string[],
  mklang: string,
  webview: {
    url: string,
    title: string,
    loading: boolean,
  },
  showingPlaylist: string[],
  appleCurator: string[],
  multiroom: string[],
  artistPage: {
    data: Record<string, any>,
  },
  playlists: {
    listing: string[],
    details: Record<string, any>,
    loadingState: number, // 0 loading, 1 loaded, 2 error
    id: string,
    trackMapping: Record<string, any>,
  },
  webremoteurl: string,
  webremoteqr: string,
  mxmtoken: string,
  mkIsReady: boolean,
  animateBackground: boolean,
  currentArtUrl: string,
  currentArtUrlRaw: string,
  mvViewMode: string,
  lyricon: boolean,
  currentTrackID: string,
  lyrics: string[],
  currentLyricsLine: number,
  richlyrics: string[],
  lyricsMediaItem: Record<string, any>,
  lyricsDebug: {
    current: number,
    start: number,
    end: number,
  },
  lyricOffset: number,
  v3: {
    requestBody: {
      platform: "web",
    },
  },
  tmpHeight: string,
  tmpWidth: string,
  tmpX: string,
  tmpY: string,
  miniTmpX: string,
  miniTmpY: string,
  tmpVar: string[],
  notification: boolean,
  hintscontext: boolean,
  collectionList: {
    response: Record<string, any>,
    title: string,
    type: string,
  },
  MVsource: string | null,
  currentSongInfo: Record<string, any>,
  page: string,
  pageHistory: string[],
  songstest: boolean,
  hangtimer: string | null,
  selectedMediaItems: string[],
  routes:  string[],
  musicBaseUrl:  string,
  modals: Record<'addToPlaylist' |
    'spatialProperties' |
    'qrcode' |
    'equalizer' |
    'audioSettings' |
    'pluginMenu' |
    'audioControls' |
    'audioPlaybackRate' |
    'showPlaylist' |
    'castMenu' |
    'pathMenu' |
    'moreInfo' |
    'airplayPW' |
    'settings' |
    'c2Upgrade', boolean>,
  socialBadges: {
    badgeMap: Record<string, any>,
    version: string,
    mediaItems: string[],
    mediaItemDLState: number, // 0 = not started, 1 = in progress, 2 = complete
  },
  menuPanel: {
    visible: boolean,
    event: Event | null,
    content: {
      name: string,
      items: Record<string, any>,
      headerItems: Record<string, any>,
    },
  },
  pauseButtonTimer: number | null,
  activeCasts: string[],
  pluginPages: {
    page: string,
    pages: string[],
  },
  moreinfodata: string[],
  notyf: Record<string, any>,
  idleTimer: string | null,
  idleState: false,
  appVisible: true,
  currentAirPlayCodeID: string,
  airplayTrys: string[],

  ipcRenderer: IpcRenderer,
  setPage: (value: string) => void,
  setShowingPlaylist: (value: string[]) => void,
  setArtistPage: (value: {
    data: Record<string, any>,
  }) => void,
  resetSimpleState: () => void,
  resetRecentlyAdded: () => void,
  setLCDArtwork: (artwork: string) => void,
  setPagePos: (pageState?: Record<string, any>) => void,
  setCfg: (value: CfgStore) => void,
  setCfgConnectivityDiscord_rpcEnabled: (newValue: boolean) => void,
  setMkPrivateEnabled: (newValue: boolean) => void,
};

export const useAppStore = create<AppState>()(immer((set) => ({
  // --- STATE (from vuex-store) ---
  windowRelativeScale: 1,
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
  artwork: {
    playerLCD: "",
  },
  version: ipcRenderer.sendSync("get-version"),
  appMode: "player",
  ipcRenderer: ipcRenderer,
  cfg: ipcRenderer.sendSync("getStore"),
  setCfg: (value) => set((state) => {
    state.cfg = value
    console.debug(`Config changed: ${JSON.stringify(value)}`);
    ipcRenderer.send("setStore", value);
  }),
  setCfgConnectivityDiscord_rpcEnabled: (newValue) => set((state) => {
    state.cfg.connectivity.discord_rpc.enabled = newValue;
    ipcRenderer.send("discordrpc:reload", newValue);
  }),
  setMkPrivateEnabled: (newValue)  => set((state) => {
    state.mk.privateEnabled = newValue;
    ipcRenderer.send("onPrivacyModeChange", newValue);
  }),

  isDev: ipcRenderer.sendSync("is-dev"),
  clientPort: ipcRenderer.sendSync("get-port"),
  drawertest: false,
  platform: "",
  mk: {},
  pluginInstalled: false,
  pluginMenuEntries: [],
  pluginMenuTopEntries: [],
  lz: ipcRenderer.sendSync("get-i18n", "en"),
  lzListing: ipcRenderer.sendSync("get-i18n-listing"),
  radiohls: null,
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
  fullscreenLyrics: false,
  fullscreenState: ipcRenderer.sendSync("getFullScreen"),
  playerLCD: {
    playbackDuration: 0,
    desiredDuration: 0,
    userInteraction: false,
  },
  drawer: {
    open: false,
    panel: "",
  },
  browsepage: [],
  listennow: [],
  madeforyou: [],
  radio: [],
  mklang: "en",
  webview: {
    url: "",
    title: "",
    loading: false,
  },
  showingPlaylist: [],
  setShowingPlaylist: (value) => set((state) => {
    state.showingPlaylist = value;
    if (!state.modals.showPlaylist) {
      // document.getElementById("app-content").scrollTo(0, 0);
      state.resetSimpleState();
    }
  }),
  appleCurator: [],
  multiroom: [],
  artistPage: {
    data: {},
  },
  setArtistPage: (value) => set((state) => {
    state.artistPage = value;
    // document.getElementById("app-content").scrollTo(0, 0);
    state.resetSimpleState();
  }),
  playlists: {
    listing: [],
    details: {},
    loadingState: 0, // 0 loading, 1 loaded, 2 error
    id: "",
    trackMapping: {},
  },
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
  page: "",
  setPage: (value) => set((state) => {
    state.page = value
    // document.getElementById("app-content").scrollTo(0, 0);
    state.resetSimpleState();
  }),
  pageHistory: [],
  songstest: false,
  hangtimer: null,
  selectedMediaItems: [],
  routes: ["browse", "listen_now", "radio"],
  musicBaseUrl: "https://api.music.apple.com/",
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
    c2Upgrade: false,
  },
  socialBadges: {
    badgeMap: {},
    version: "",
    mediaItems: [],
    mediaItemDLState: 0, // 0 = not started, 1 = in progress, 2 = complete
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
  pauseButtonTimer: null,
  activeCasts: [],
  pluginPages: {
    page: "hello-world",
    pages: [],
  },
  moreinfodata: [],
  notyf: () => {},
  idleTimer: null,
  idleState: false,
  appVisible: true,
  currentAirPlayCodeID: "",
  airplayTrys: [],

  // --- ACTIONS (from vueapp & vuex-store) ---
  resetSimpleState: () => set((state) => {
    state.menuPanel.visible = false;
    state.selectedMediaItems = [];
    state.chrome.contentAreaScrolling = true;
    for (const key in Object.keys(state.modals) ) {
      state.modals[key as keyof typeof state.modals] = false;
    }
  }),
  resetRecentlyAdded: () => set((state) => {
    state.pageState.recentlyAdded.loaded = false;
    state.pageState.recentlyAdded.nextUrl = null;
    state.pageState.recentlyAdded.items = [];
  }),

  setLCDArtwork: (artwork) => set((state) => {
    state.artwork.playerLCD = artwork;
  }),

  setPagePos: (pageState = {}) => set((state) => {
    let cached = state.pageState.scrollPos.pos.find((page) => {
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

})));