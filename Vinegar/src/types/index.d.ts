import fallbackEN from "../assets/locales/en.json";
export interface IElectronAPI {
  send: (channel: string, ...data: any[]) => void;
  sendSync: (channel: string, ...data: any[]) => Promise<void>;
  on: (callback: (...args: any[]) => void) => Electron.IpcRenderer;
  invoke: (...data: any[]) => Promise<any>;
  once: (channel: string, listener: (event: Electron.IpcRendererEvent) => void) => Electron.IpcRenderer;
}
declare module "i18next" {
  interface CustomTypeOptions {
    // This tells i18next that 'en' is the "master" shape
    resources: {
      translation: typeof en;
    };
  }
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

declare module "*.less" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.ttf" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "i18next" {
  interface CustomTypeOptions {
    // This tells i18next that 'en' is the "master" shape
    resources: {
      translation: typeof fallbackEN;
    };
  }
}
export {};
