/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IElectronAPI {
  send: (channel: string, ...data: any[]) => void;
  sendSync: (channel: string, ...data: any[]) => Promise<void>;
  on: (callback: (...args: any[]) => void) => Electron.IpcRenderer;
  invoke: (...data: any[]) => Promise<any>;
  once: (channel: string, listener: (event: Electron.IpcRendererEvent) => void) => Electron.IpcRenderer;
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

export {};
/* eslint-enable @typescript-eslint/no-explicit-any */
