import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CfgStore } from "../../main/base/store.js";
import { createUISlice } from "./ui.slice.js";
import { createCfgSlice } from "./cfg.slice.js";
import { createLibrarySlice } from "./library.slice.js";
import { createChromeSlice } from "./chrome.slice.js";
import { createAppSlice } from "./app.slice.js";

export interface AppState {
  version: string;
  appMode: string;
  mk: MusicKit.MusicKitInstance;
  mkapi: (method: string, library: boolean | undefined, term: string, params?: MusicKit.QueryParameters, attempts?: number) => Promise<any>;
  isDev: boolean;
  clientPort: number;
  platform: string;
  pluginInstalled: boolean;
  pluginMenuEntries: string[];
  pluginMenuTopEntries: string[];
  lz: string[];
  lzListing: string;
  radiohls: Record<string, any>;
  fullscreenLyrics: boolean;
  fullscreenState: Record<string, any>;
  browsepage: Record<string, any>;
  listennow: { timestamp: number };
  madeforyou: string[];
  radio: Record<string, any>;
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
  lyrics: { startTime: number; endTime: number; line: string; translation?: string }[];
  currentLyricsLine: number;
  richlyrics: { startTime: number; endTime: number; line: string; translation?: string }[];
  lyricsMediaItem: string;
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
  idleTimer?: NodeJS.Timeout;
  idleState: boolean;
  appVisible: boolean;
  currentAirPlayCodeID: string;
  airplayTrys: { id: string; attempts: number }[];
  loadMXM: () => void;
  loadNeteaseLyrics: () => void;
  loadYTLyrics: () => void;
  loadQQLyrics: () => void;
  parseTTML: () => void;
  loadAMLyrics: () => void;
  confirm: (title: string, callback: (...args: any[]) => void) => Promise<void>;
}

export interface ChromeState {
  sidebarCollapsed: boolean;
  nativeControls: boolean;
  contentScrollPosY: number;
  appliedTheme: {
    location: string;
    info: Record<string, any>;
  };
  windowState: string;
  desiredPageTransition: string;
  hideUserInfo: boolean;
  artworkReady: boolean;
  userinfo: {
    id: string;
    attributes: {
      name: string;
      handle: string;
      artwork: { url: string };
    };
  };
  forceDirectives: Record<string, any>;
  menuOpened: boolean;
  maximized: boolean;
  drawerOpened: boolean;
  drawerState: string;
  topChromeVisible: boolean;
  progresshover: boolean;
  windowControlPosition: "left" | "right";
  contentAreaScrolling: boolean;
  showCursor: boolean;
  setContentScrollPos: (scroll) => void;
  getThemeDirective: (directive?: string) => string;
}
export interface LibraryState {
  backgroundNotification: {
    show: boolean;
    message: string;
    total: number;
    progress: number;
  };
  selectedMediaItems: MusicKit.MediaItem[];
  songs: {
    sortingOptions: {
      albumName: string;
      artistName: string;
      name: string;
      genre: string;
      releaseDate: string;
      durationInMillis: string;
      dateAdded: string;
    };
    sorting: "dateAdded" | "name";
    sortOrder: "asc" | "desc";
    listing: MusicKit.Songs[];
    meta: { total: number; progress: number };
    search: string;
    displayListing: MusicKit.Songs[];
    downloadState: number; // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  };
  albums: {
    sortingOptions: {
      artistName: string;
      name: string;
      genre: string;
      releaseDate: string;
    };
    viewAs: string;
    sorting: "dateAdded" | "name"; // [0] = recentlyadded page, [1] = albums page
    sortOrder: "desc" | "asc"; // [0] = recentlyadded page, [1] = albums page
    listing: MusicKit.LibraryAlbums[];
    meta: { total: number; progress: number };
    search: string;
    displayListing: MusicKit.LibraryAlbums[];
    downloadState: number; // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  };
  artists: {
    sortingOptions: {
      artistName: string;
      name: string;
      genre: string;
      releaseDate: string;
    };
    viewAs: string;
    sorting: "dateAdded" | "name"; // [0] = recentlyadded page, [1] = albums page
    sortOrder: "desc" | "asc"; // [0] = recentlyadded page, [1] = albums page
    listing: MusicKit.Artists[];
    meta: { total: number; progress: number };
    search: string;
    displayListing: MusicKit.Artists[];
    downloadState: number; // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
  };
  playlists: {
    listing: MusicKit.Playlists[];
    details: Record<string, any>;
    loadingState: number; // 0 loading, 1 loaded, 2 error
    id: string;
    trackMapping: Record<string, any>;
  };

  socialBadges: {
    badgeMap: Record<string, any>;
    version: string;
    mediaItems: string[];
    mediaItemDLState: number; // 0 = not started, 1 = in progress, 2 = complete
  };
  localsongs: string[];
  getLibraryGenres: () => Array<string>;
  sortPlaylists: () => void;
  refreshPlaylists: (localOnly: boolean | undefined, cachedOnly: boolean | undefined) => Promise<void>;
  getLibrarySongs: () => void;
  getLibraryAlbums: () => void;
  isInLibrary: (playParams?: { isLibrary: boolean; catalogId: string; id: string }) => boolean;
  searchLibrarySongs: () => void;
  getAlbumSort: () => void;
  searchLibraryAlbums: (index: number) => void;
  searchLibraryArtists: (index: number) => void;
  getLibrarySongsFull: (force: boolean | undefined) => Promise<void>;
  getLibraryAlbumsFull: (force: boolean | undefined, index: number) => Promise<void>;
  getLibraryArtistsFull: (force: boolean | undefined, index: number) => void;
  addToLibrary: (id: string) => void;
  removeFromLibrary: (kind: string, id: string) => void;
  inLibrary: (items: MusicKit.MediaItem[]) => Promise<MusicKit.MediaItem[]>;
  addSelectedToNewPlaylist: () => void;
  addSelectedToPlaylist: (playlist_id: number) => Promise<void>;
  isSongInPlaylist: (song_ids: number[], playlist_id: string) => Promise<boolean>;
  addToPlaylist: (pid: string, pitems: string[]) => void;
  select_removeMediaItem: (id: string) => void;
  select_hasMediaItem: (id: string) => boolean;
  select_selectMediaItem: (id: string, kind: string, index: number, guid: string, library: boolean) => void;
  getPlaylistFolderChildren: (id: string) => MusicKit.Playlists[];
  getPlaylistFromID: (id: string, transient: boolean | undefined) => Promise<void>;
  getArtistFromID: (id: string) => void;
  newPlaylist: (name: string, tracks: string[]) => void;
  deletePlaylist: (id: string) => void;
  getPlaylistContinuous: (response: MusicKit.Playlists, transient: boolean | undefined) => Promise<void>,
  editPlaylistFolder: (id: string, name: string | undefined) => Promise<void>,
  editPlaylist: (id: string, name: string | undefined) => Promise<void>;
  editPlaylistDescription: (id: string, name: string | undefined) => Promise<void>;
  getSocialBadges: (cb: (..._args: any[]) => void) => void;
  showSocialListeningTo: () => void;
  newPlaylistFolder: (name: string) => void;
}

export interface UIState {
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
  showingPlaylist: MusicKit.Playlists | MusicKit.LibraryPlaylists;
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

export interface GeneralState {
  cfg: CfgStore;
  ui: UIState;
  library: LibraryState;
  chrome: ChromeState;
  app: AppState;
  hydrate: () => Promise<void>;
}

export const useGeneralStore = create<GeneralState>()(
  immer((...a) => ({
    ...createCfgSlice(...a),
    ...createUISlice(...a),
    ...createLibrarySlice(...a),
    ...createChromeSlice(...a),
    ...createAppSlice(...a),
    hydrate: async () => {
      const data = await window.electronAPI.getStore();
      a[0]((state) => {
        state.cfg = data;
      });
    },
  })),
);
