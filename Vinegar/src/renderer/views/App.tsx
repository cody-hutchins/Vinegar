import ChromeTop from "./app/chrome-top.jsx";
import AppNavigation from "./app/app-navigation.jsx";
import ChromeBottom from "./app/chrome-bottom.jsx";
import Panels from "./app/panels.jsx";
import MiniView from "./components/mini-view.jsx";
import FullscreenView from "./components/fullscreen-view.jsx";
import OOBE from "./pages/oobe.jsx";
import { useEffect, useState } from "react";
import {AnimatePresence, motion} from "framer-motion";
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO Perform IPC check for Electron Main process is ready
    const checkReady = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(checkReady);
  }, []);
  return (
    <div>
      {isLoading ? (
        <div id="LOADER">
          <svg>{include("../assets/cider-round.svg")}</svg>
        </div>
      ) : (
        <div
          className="notransparency"
          onContextMenu={() => false}
          loading="1"
          os-release={parseInt(process.env.osRelease)}
          platform={process.env.platform}>
          <script
            type="module"
            src="./main/app.js"></script>
          <div
            id="app"
            className={getAppClasses()}
            v-if="appVisible"
            window-state={chrome.windowState}
            style={getAppStyle()}
            library-visible={chrome.sidebarCollapsed ? 0 : 1}
            window-style={cfg.visual.directives.windowLayout}>
            <AnimatePresence>
              <motion.div name="fsModeSwitch">
                <div
                  id="app-main"
                  v-show="appMode == 'player'">
                  <ChromeTop />
                  <AppNavigation />
                  <ChromeBottom />
                </div>
              </motion.div>

              <motion.div name="fsModeSwitch">
                <div
                  className="fullscreen-view-container"
                  v-if="appMode == 'fullscreen'">
                  <FullscreenView
                    ref="fsView"
                    image={currentArtUrlRaw}
                    time={mk.currentPlaybackTime - lyricOffset}
                    lyrics={lyrics}
                    richlyrics={richlyrics}
                  />
                </div>
              </motion.div>

              <motion.div name="fsModeSwitch">
                <div
                  className="fullscreen-view-container"
                  v-if="appMode == 'mini'">
                  <MiniView
                    image={currentArtUrlRaw}
                    time={mk.currentPlaybackTime - lyricOffset}
                    lyrics={lyrics}
                    richlyrics={richlyrics}
                  />
                </div>
              </motion.div>

              <motion.div name="fsModeSwitch">
                <div
                  className="fullscreen-view-container oobe"
                  v-if="appMode == 'oobe'">
                  <OOBE />
                </div>
              </motion.div>
            </AnimatePresence>
            <Panels />
            {chrome.showCursor && <div className="cursor"></div>}
          </div>

          {Object.keys(process.env.components).map((component) => {
            include(component);
            return (
              <script
                type="text/x-template"
                id="am-musiccovershelf">
                <h1>{component.attributes.title.stringForDisplay}</h1>
              </script>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default App;
