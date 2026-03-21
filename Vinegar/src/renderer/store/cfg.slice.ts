import { StateCreator } from "zustand";
import { CfgStore, defaults } from "../../main/base/store.js";
import { GeneralState } from "./store.js";
import { MusicKitTools } from "../main/musickittools.js";
import { notyf } from "../main/helpers.js";

type CfgStateCreator = StateCreator<GeneralState, [["zustand/immer", never], never], [], { cfg: CfgStore }>;
export const createCfgSlice: CfgStateCreator = (set, get) => ({
  cfg: {
    ...defaults,
    setCfgConnectivityDiscord_rpcEnabled: (newValue: boolean) =>
      set((state) => {
        state.cfg.connectivity.discord_rpc.enabled = newValue;
        window.electronAPI.send("discordrpc:reload", newValue);
      }),
    switchArtworkDisplayLayout: () =>
      set((state) => {
        switch (state.cfg.visual.artworkDisplayLayout) {
          case "default":
            state.cfg.visual.artworkDisplayLayout = "sidebar";
            break;
          case "sidebar":
            state.cfg.visual.artworkDisplayLayout = "default";
            break;
          default:
            state.cfg.visual.artworkDisplayLayout = "default";
            break;
        }
      }),
    formatVolumeTooltip(mkVolume: number) {
      const advancedTooltip = get().cfg.audio.dBSPL
        ? (Number(get().cfg.audio.dBSPLcalibration) + Math.log10(mkVolume) * 20).toFixed(2) + " dB SPL"
        : (Math.log10(mkVolume) * 20).toFixed(2) + " dBFS";
      return get().cfg.audio.advanced ? advancedTooltip : (mkVolume * 100).toFixed(0) + "%";
    },
    getAppStyle() {
      const finalStyle: Record<string, any> = {};
      if (get().cfg.visual.window_background_style === "color") {
        finalStyle["background-color"] = get().cfg.visual.windowColor;
      }
      if (get().cfg.visual.customAccentColor) {
        finalStyle["--keyColor"] = get().cfg.visual.accentColor;
        finalStyle["--songProgressColor"] = get().cfg.visual.accentColor;
      } else if (get().cfg.visual.purplePodcastPlaybackBar && MusicKit.getInstance().player.nowPlayingItem?.type === "podcast-episodes") {
        finalStyle["--songProgressColor"] = "#6929D0";
      }
      return finalStyle;
    },
    followingArtist(id: string) {
      console.debug(`check for ${id}`);
      return get().cfg.home.followedArtists.includes(id);
    },
    pinMiniPlayer: (status = false) =>
      set((state) => {
        if (!status) {
          if (!state.cfg.visual.miniplayer_top_toggle) {
            window.electronAPI.send("windowontop", true);
            state.cfg.visual.miniplayer_top_toggle = true;
          } else {
            window.electronAPI.send("windowontop", false);
            state.cfg.visual.miniplayer_top_toggle = false;
          }
        } else {
          window.electronAPI.send("windowontop", state.cfg.visual.miniplayer_top_toggle ?? false);
        }
      }),
    async setTheme(_theme = "", onlyPrefs = false) {
      let theme = _theme;
      console.debug(theme);
      if (theme === "") {
        theme = get().cfg.visual.theme;
      }
      let info: { location: string; info: Record<string, any> };
      try {
        const infoResponse = await fetch("themes/" + theme.replace("index.less", "theme.json"));
        info = await infoResponse.json();
      } catch {
        console.warn("failed to get theme.json");
      }
      set((state) => {
        if (state.cfg.visual.theme !== theme) state.cfg.visual.theme = theme;
        if (info) state.chrome.appliedTheme = info;
      });
      if (!onlyPrefs) {
        document.querySelector("#userTheme")!.href = `themes/${theme}`;
        document.querySelectorAll(`[id*='less']`).forEach((el) => {
          el.remove();
        });
        await less.refresh();
      }
    },
    addFavorite: (id: string, type: string) =>
      set((state) => {
        state.cfg.home.favoriteItems.push({
          id: id,
          type: type,
        });
      }),

    async syncFavorites() {
      notyf.open({
        className: "notyf-info",
        type: "info",
        message: `[${this.getLz("home.syncFavorites")}] ${this.getLz("home.syncFavorites.gettingArtists")}`,
      });
      const results = await MusicKitTools.v3Continuous({
        href: "/v1/me/library/artists",
        options: {
          include: ["catalog"],
          "fields[artists]": ["inFavorites"],
        },
      });
      const favs: { id: string; type: string }[] = [];
      // for each result
      results.forEach((result) => {
        try {
          if (result.relationships?.catalog?.data[0]?.attributes?.inFavorites) {
            if (!favs.includes(result.relationships?.catalog?.data[0].id)) {
              favs.push(result.relationships?.catalog?.data[0].id);
            }
          }
        } catch (e) {
          e = null;
        }
      });
      notyf.success(`[${this.getLz("home.syncFavorites")}] ${this.getLz("action.done")}`);
      set((state) => {
        state.cfg.home.followedArtists = favs;
      });
      return favs;
    },
    async setArtistFavorite(id: string, val = true) {
      if (val) {
        set((state) => {
          if (!state.cfg.home.followedArtists.includes(id)) {
            state.cfg.home.followedArtists.push(id);
          }
        });
        await get().app.mk.api.music(`/v1/me/favorites`, {
          "art[url]": "f",
          "ids[artists]": get().ui.artistPage.data.id,
          l: get().app.mklang,
          platform: "web",
          fetchOptions: {
            method: "POST",
          },
        });
      } else {
        set((state) => {
          if (state.cfg.home.followedArtists.includes(id)) {
            state.cfg.home.followedArtists.splice(state.cfg.home.followedArtists.indexOf(id), 1);
          }
        });
        await get().app.mk.api.music(`/v1/me/favorites`, {
          "art[url]": "f",
          "ids[artists]": get().ui.artistPage.data.id,
          l: get().app.mklang,
          platform: "web",
          fetchOptions: {
            method: "DELETE",
          },
        });
      }
    },
  },
});
