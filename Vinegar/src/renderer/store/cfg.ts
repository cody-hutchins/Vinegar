import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CfgStore, defaults } from "../../main/base/store.js";

export const useCfgStore = create<{ cfg: CfgStore; hydrate: () => Promise<void> }>()(
  immer((set) => ({
    cfg: { ...defaults },
    hydrate: async () => {
      const data = await window.electronAPI.getStore();
      set((state) => {
        state.cfg = data;
      });
    },
    setCfgConnectivityDiscord_rpcEnabled: (newValue) =>
      set((state) => {
        state.cfg.connectivity.discord_rpc.enabled = newValue;
        ipcRenderer.send("discordrpc:reload", newValue);
      }),
    switchArtworkDisplayLayout() {
      switch (this.cfg.visual.artworkDisplayLayout) {
        case "default":
          this.cfg.visual.artworkDisplayLayout = "sidebar";
          break;
        case "sidebar":
          this.cfg.visual.artworkDisplayLayout = "default";
          break;
        default:
          this.cfg.visual.artworkDisplayLayout = "default";
          break;
      }
    },
    formatVolumeTooltip(mkVolume: number) {
      const advancedTooltip = this.cfg.audio.dBSPL
        ? (Number(this.cfg.audio.dBSPLcalibration) + Math.log10(mkVolume) * 20).toFixed(2) + " dB SPL"
        : (Math.log10(mkVolume) * 20).toFixed(2) + " dBFS";
      return this.cfg.audio.advanced ? advancedTooltip : (mkVolume * 100).toFixed(0) + "%";
    },
    getAppStyle() {
      const finalStyle: Record<string, any> = {};
      if (this.cfg.visual.window_background_style === "color") {
        finalStyle["background-color"] = this.cfg.visual.windowColor;
      }
      if (this.cfg.visual.customAccentColor) {
        finalStyle["--keyColor"] = this.cfg.visual.accentColor;
        finalStyle["--songProgressColor"] = this.cfg.visual.accentColor;
      } else if (this.cfg.visual.purplePodcastPlaybackBar && MusicKit.getInstance().player.nowPlayingItem?.type === "podcast-episodes") {
        finalStyle["--songProgressColor"] = "#6929D0";
      }
      return finalStyle;
    },
    followingArtist(id: string) {
      console.debug(`check for ${id}`);
      return this.cfg.home.followedArtists.includes(id);
    },
    pinMiniPlayer(status = false) {
      if (!status) {
        if (!this.cfg.visual.miniplayer_top_toggle) {
          window.electronAPI.send("windowontop", true);
          this.cfg.visual.miniplayer_top_toggle = true;
        } else {
          window.electronAPI.send("windowontop", false);
          this.cfg.visual.miniplayer_top_toggle = false;
        }
      } else {
        window.electronAPI.send("windowontop", this.cfg.visual.miniplayer_top_toggle ?? false);
      }
    },
  })),
);
