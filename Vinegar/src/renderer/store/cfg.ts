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
  })),
);
