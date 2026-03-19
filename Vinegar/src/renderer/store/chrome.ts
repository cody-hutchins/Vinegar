import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ChromeState {
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
}

export const useChromeStore = create<ChromeState>()(
  immer((set) => ({
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
        state.contentScrollPosY = scroll.target.scrollTop;
      }),
    mainMenuVisibility(val) {
      if (val) {
        this.mk.isAuthorized ? (this.chrome.menuOpened = !this.chrome.menuOpened) : false;
        if (!this.mk.isAuthorized) {
          window.electronAPI.send("auth-window");
        }
      } else {
        setTimeout(() => {
          this.chrome.menuOpened = false;
        }, 100);
      }
    },
    async setTheme(theme = "", onlyPrefs = false) {
      console.debug(theme);
      if (this.cfg.visual.theme === "") {
        this.cfg.visual.theme = "default.less";
      }
      if (theme === "") {
        theme = this.cfg.visual.theme;
      } else {
        this.cfg.visual.theme = "";
        this.cfg.visual.theme = theme;
      }
      const info = {};
      try {
        const infoResponse = await fetch("themes/" + this.cfg.visual.theme.replace("index.less", "theme.json"));
        this.chrome.appliedTheme.info = await infoResponse.json();
      } catch (e) {
        e = null;
        console.warn("failed to get theme.json");
        this.chrome.appliedTheme.info = {};
      }

      if (!onlyPrefs) {
        document.querySelector("#userTheme").href = `themes/${this.cfg.visual.theme}`;
        document.querySelectorAll(`[id*='less']`).forEach((el) => {
          el.remove();
        });
        await less.refresh();
      }
    },
    async reloadStyles() {
      const styles = this.cfg.visual.styles;
      document.querySelectorAll(`[id*='less']`).forEach((el) => {
        if (el.id !== "less:style") {
          el.remove();
        }
      });

      this.chrome.appliedTheme.info = {};
      await asyncForEach(styles, async (style) => {
        const styleEl = document.createElement("link");
        styleEl.id = `less-${style.replace(".less", "")}`;
        styleEl.rel = "stylesheet/less";
        styleEl.href = `themes/${style}`;
        styleEl.type = "text/css";
        document.head.appendChild(styleEl);
        try {
          const infoResponse = await fetch("themes/" + style.replace("index.less", "theme.json"));
          this.chrome.appliedTheme.info = Object.assign(this.chrome.appliedTheme.info, await infoResponse.json());
        } catch (e) {
          e = null;
          console.warn("failed to get theme.json");
        }
      });
      less.registerStylesheetsImmediately();
      await less.refresh(true, true, true);
      return;
    },
    macOSEmu() {
      this.chrome.forceDirectives["macosemu"] = {
        value: true,
      };
      this.chrome.windowControlPosition = "left";
    },
    getThemeDirective(directive = "") {
      let directives = {};
      if (typeof this.chrome.appliedTheme.info.directives === "object") {
        directives = this.chrome.appliedTheme.info.directives;
      }
      directives = Object.assign(directives, this.chrome.forceDirectives);
      if (directives[directive]) {
        return directives[directive].value;
      } else if (this.cfg.visual.directives[directive]) {
        return this.cfg.visual.directives[directive];
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
  })),
);
