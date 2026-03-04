import { app } from "./vueapp.tsx";
import { CiderCache } from "./cidercache.tsx";
import { CiderFrontAPI } from "./ciderfrontapi.tsx";
import { simulateGamepad } from "./gamepad.tsx";
import { CiderAudio } from "../audio/cideraudio.tsx";
import { Events } from "./events.tsx";
import { wsapi } from "./wsapi_interop.tsx";
import { MusicKitTools } from "./musickittools.tsx";
import { spawnMica } from "./mica.tsx";
import SVGIcon from "./components/svg-icon.tsx";
import SidebarLibraryItem from "./components/sidebar-library-item.tsx";
import i18nEditor from "./components/i18n-editor.tsx";

// Define window objects
window.app = app;
window.MusicKitTools = MusicKitTools;
window.CiderAudio = CiderAudio;
window.CiderCache = CiderCache;
window.CiderFrontAPI = CiderFrontAPI;
window.wsapi = wsapi;

if (app.cfg.advanced.disableLogging === true) {
  window.console = {
    log: function () {},
    error: function () {},
    warn: function () {},
    assert: function () {},
    debug: function () {},
  };
}

// Init CiderAudio and force audiocontext
if (app.cfg.advanced.AudioContext != true) {
  app.cfg.advanced.AudioContext = true;
  window.location.reload();
}

CiderAudio.init();

// Import gamepad support
app.simulateGamepad = simulateGamepad;
app.spawnMica = spawnMica;

Events.InitEvents();

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <app />
    </StrictMode>,
  );
}