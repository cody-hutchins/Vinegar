import CrowdinClient from "@crowdin/ota-client";
import { CiderCache } from "./cidercache.js";
import { CiderFrontAPI } from "./ciderfrontapi.js";
import { simulateGamepad } from "./gamepad.js";
import { Events } from "./events.js";
import { wsapi } from "./wsapi_interop.js";
import { MusicKitTools } from "./musickittools.js";
import { spawnMica } from "./mica.js";
import { CiderAudio } from "../audio/audio.js";
import i18n from "./i18n.js";

// Define window objects
window.MusicKitTools = MusicKitTools;
window.CiderAudio = CiderAudio;
window.CiderCache = CiderCache;
window.CiderFrontAPI = CiderFrontAPI;
window.wsapi = wsapi;

if (cfg.advanced.disableLogging) {
  window.console = {
    ...window.console,
    log: function () {},
    error: function () {},
    warn: function () {},
    assert: function () {},
    debug: function () {},
  };
}

const crowdinClient = new CrowdinClient("cider-app");
crowdinClient.getTranslations().then((translations) => {
  Object.keys(translations).forEach((lang) => {
    i18n.addResourceBundle(lang, "translation", translations[lang], true, true);
  });
  // i18n is now updated with the latest strings from Crowdin!
});

// Init CiderAudio and force audiocontext
if (!cfg.advanced.AudioContext) {
  cfg.advanced.AudioContext = true;
  window.location.reload();
}

CiderAudio.init();

// Import gamepad support
cfg.simulateGamepad = simulateGamepad;
cfg.spawnMica = spawnMica;

Events.InitEvents();
