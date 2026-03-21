import { StateCreator } from "zustand";
import { ChromeState, GeneralState } from "./store.js";
import less from "less";

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
    mainMenuVisibility: (val: boolean) =>
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
      const styles: string[] = get().cfg.visual.styles;
      document.querySelectorAll(`[id*='less']`).forEach((el) => {
        if (el.id !== "less:style") {
          el.remove();
        }
      });

      // this.chrome.appliedTheme.info = {};
      let infoResponse: Response;
      for (const style of styles) {
        const styleEl = document.createElement("link");
        styleEl.id = `less-${style.replace(".less", "")}`;
        styleEl.rel = "stylesheet/less";
        styleEl.href = `themes/${style}`;
        styleEl.type = "text/css";
        document.head.appendChild(styleEl);
        try {
          infoResponse = await fetch("themes/" + style.replace("index.less", "theme.json"));
        } catch {
          console.warn("failed to get theme.json");
        }
      }
      set((state) => {
        if (infoResponse) state.chrome.appliedTheme.info = { ...infoResponse.json() };
      });
      less.registerStylesheetsImmediately();
      await less.refresh(true, true, true);
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
    getAppClasses: () =>
      set((state) => {
        const classes: Record<string, boolean> = {};
        switch (state.chrome.getThemeDirective("forceUI") ?? "none") {
          case "compact":
            classes.compact = true;
            break;
          case "standard":
            classes.compact = false;
            break;
          default:
            if (state.cfg.advanced.experiments.includes("compactui")) {
              classes.compact = true;
            }
            break;
        }

        if (state.cfg.visual.window_background_style === "none") {
          classes.simplebg = true;
        }

        if (state.app.platform !== "darwin") {
          switch (state.cfg.visual.windowControlPosition) {
            default:
            case 0:
              state.chrome.windowControlPosition = "right";
              state.chrome.forceDirectives["macosemu"] = {
                value: false,
              };
              break;
            case 1:
              state.chrome.windowControlPosition = "left";
              state.chrome.forceDirectives["macosemu"] = {
                value: true,
              };
              break;
          }
        }

        if (state.chrome.getThemeDirective("windowLayout") === "twopanel") {
          classes.twopanel = true;
        }
        if (state.chrome.getThemeDirective("appNavigation") === "seperate") {
          classes.navbar = true;
        }
        if (state.chrome.getThemeDirective("macosemu")) {
          classes.macosemu = true;
        }
        return classes;
      }),
    toggleHideUserInfo: () =>
      set((state) => {
        if (state.chrome.hideUserInfo) {
          state.cfg.visual.showuserinfo = true;
          state.chrome.hideUserInfo = false;
        } else {
          state.cfg.visual.showuserinfo = false;
          state.chrome.hideUserInfo = true;
        }
      }),
  },
});
