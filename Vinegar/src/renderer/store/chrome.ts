import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ChromeState {
  chrome: {
    sidebarCollapsed: boolean,
    nativeControls: boolean,
    contentScrollPosY: number,
    appliedTheme: {
      location: string,
      info: Record<string, any>,
    },
    windowState: string,
    desiredPageTransition: string,
    hideUserInfo: boolean,
    artworkReady: boolean,
    userinfo: {
      id: string,
      attributes: {
        name: string,
        handle: string
        artwork: { url: string },
      },
    },
    forceDirectives: Record<string, any>,
    menuOpened: boolean,
    maximized: boolean,
    drawerOpened: boolean,
    drawerState: string,
    topChromeVisible: boolean,
    progresshover: boolean,
    windowControlPosition: "left" | "right",
    contentAreaScrolling: boolean,
    showCursor: boolean,
    noC2Upgrade: boolean,
  },
};

export const useChromeStore = create<ChromeState>()(immer((set) => ({
  chrome: {
    sidebarCollapsed: false,
    nativeControls: false,
    contentScrollPosY: 0,
    appliedTheme: {
      location: "",
      info: {},
    },
    windowState: "normal",
    desiredPageTransition: "wpfade_transform",
    hideUserInfo: ipcRenderer.sendSync("is-dev") || false,
    artworkReady: false,
    userinfo: {
      id: "",
      attributes: {
        name: "Cider User",
        handle: "CiderUser",
        artwork: { url: "./assets/logocut.png" },
      },
    },
    forceDirectives: {},
    menuOpened: false,
    maximized: false,
    drawerOpened: false,
    drawerState: "queue",
    topChromeVisible: true,
    progresshover: false,
    windowControlPosition: "right",
    contentAreaScrolling: true,
    showCursor: false,
    noC2Upgrade: localStorage.getItem("noC2Upgrade") == "true" ? true : false,
  },
})));
