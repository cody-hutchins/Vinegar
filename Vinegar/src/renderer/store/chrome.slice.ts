import { StateCreator } from "zustand";
import { ChromeState, GeneralState } from "./store.js";

type ChromeStateCreator = StateCreator<GeneralState, [["zustand/immer", never], never], [], { chrome: ChromeState }>;

export const createChromeSlice: ChromeStateCreator = (set, get) => ({
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
    setContentScrollPos: (scroll) =>
      set((state) => {
        state.chrome.contentScrollPosY = scroll.target.scrollTop;
      }),
    mainMenuVisibility: (val) =>
      set((state) => {
        if (val) {
          if (state.app.mk.isAuthorized) {
            state.chrome.menuOpened = !state.chrome.menuOpened;
          } else {
            window.electronAPI.send("auth-window");
          }
        } else {
          setTimeout(() => {
            state.chrome.menuOpened = false;
          }, 100);
        }
      }),

    async reloadStyles() {
      const styles = get().cfg.visual.styles;
      document.querySelectorAll(`[id*='less']`).forEach((el) => {
        if (el.id !== "less:style") {
          el.remove();
        }
      });

      this.chrome.appliedTheme.info = {};
      for (const style of styles) {
        const styleEl = document.createElement("link");
        styleEl.id = `less-${style.replace(".less", "")}`;
        styleEl.rel = "stylesheet/less";
        styleEl.href = `themes/${style}`;
        styleEl.type = "text/css";
        document.head.appendChild(styleEl);
        try {
          const infoResponse = await fetch("themes/" + style.replace("index.less", "theme.json"));
          this.chrome.appliedTheme.info = Object.assign(this.chrome.appliedTheme.info, await infoResponse.json());
        } catch {
          console.warn("failed to get theme.json");
        }
      }
      less.registerStylesheetsImmediately();
      await less.refresh(true, true, true);
      return;
    },
    macOSEmu: () =>
      set((state) => {
        state.chrome.forceDirectives["macosemu"] = {
          value: true,
        };
        state.chrome.windowControlPosition = "left";
      }),
    getThemeDirective(directive = "") {
      let directives: Record<string, any> = {};
      if (typeof get().chrome.appliedTheme.info.directives === "object") {
        directives = get().chrome.appliedTheme.info.directives;
      }
      directives = Object.assign(directives, get().chrome.forceDirectives);
      if (directives[directive]) {
        return directives[directive].value;
      } else if (get().cfg.visual.directives[directive]) {
        return get().cfg.visual.directives[directive];
      } else {
        return false;
      }
    },
    getAppClasses() {
      const classes: Record<string, boolean> = {};
      switch (this.getThemeDirective("forceUI") ?? "none") {
        case "compact":
          classes.compact = true;
          break;
        case "standard":
          classes.compact = false;
          break;
        default:
          if (this.cfg.advanced.experiments.includes("compactui")) {
            classes.compact = true;
          }
          break;
      }

      if (this.cfg.visual.window_background_style === "none") {
        classes.simplebg = true;
      }

      if (this.platform !== "darwin") {
        switch (parseInt(this.cfg.visual.windowControlPosition)) {
          default:
          case 0:
            this.chrome.windowControlPosition = "right";
            this.chrome.forceDirectives["macosemu"] = {
              value: false,
            };
            break;
          case 1:
            this.chrome.windowControlPosition = "left";
            this.chrome.forceDirectives["macosemu"] = {
              value: true,
            };
            break;
        }
      }

      if (this.getThemeDirective("windowLayout") === "twopanel") {
        classes.twopanel = true;
      }
      if (this.getThemeDirective("appNavigation") === "seperate") {
        classes.navbar = true;
      }
      if (this.getThemeDirective("macosemu")) {
        classes.macosemu = true;
      }
      return classes;
    },
    toggleHideUserInfo() {
      if (this.chrome.hideUserInfo) {
        this.cfg.visual.showuserinfo = true;
        this.chrome.hideUserInfo = false;
      } else {
        this.cfg.visual.showuserinfo = false;
        this.chrome.hideUserInfo = true;
      }
    },
  },
});
