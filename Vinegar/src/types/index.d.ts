import { CfgStore } from "../main/base/store";
import MusicKit from "@types/musickit-js";
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IElectronAPI {
  send: (channel: string, ...data: any[]) => void;
  sendSync: (channel: string, ...data: any[]) => Promise<any>;
  on: (channel: string, callback: (...args: any[]) => void) => Electron.IpcRenderer;
  invoke: (channel: string, ...data: any[]) => Promise<any>;
  once: (channel: string, listener: (event: Electron.IpcRendererEvent) => void) => Electron.IpcRenderer;
  getStore: () => Promise<CfgStore>;
}
declare global {
  interface Window {
    electronAPI: IElectronAPI;
    MusicKitTools: MusicKitTools;
    CiderAudio: CiderAudio;
    CiderCache: CiderCache;
    CiderFrontAPI: CiderFrontAPI;
    wsapi: wsapi;
  }
  interface MusicKitInterop {
    init: any;
  }
}

export { MusicKit };
/* eslint-enable @typescript-eslint/no-explicit-any */
