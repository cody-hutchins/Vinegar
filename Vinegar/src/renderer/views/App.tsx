import CiderRound from "../assets/cider-round.svg";
import panels from "./app/panels";
import chromeTop from "./app/chrome-top";
import appNavigation from "./app/app-navigation";
import chromeBottom from "./app/chrome-bottom";
import { ReactElement } from "react";

export default function App(): ReactElement {
  window.quasarConfig = {
    brand: {
      primary: "#fc3c44",
    },
    config: {
      dark: true,
    },
    loadingBar: { skipHijack: true },
  };
  return (
    <div>
      <head>
        <link
          rel="preconnect"
          href="https://amp-api.music.apple.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://api.music.apple.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://is1-ssl.mzstatic.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://is2-ssl.mzstatic.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://is3-ssl.mzstatic.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://is4-ssl.mzstatic.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://is5-ssl.mzstatic.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://play.itunes.apple.com/"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://aod-ssl.itunes.apple.com/"
          crossOrigin="anonymous"
        />
        <meta charSet="UTF-8" />
        <meta
          http-equiv="X-UA-Compatible"
          content="IE=edge"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <title>Cider</title>
        <link
          rel={process.env.dev ? " stylesheet" : "stylesheet/less"}
          type="text/css"
          href={`style.${process.env.dev ? "css" : "less"}`}
        />
        {/* <link rel="stylesheet/less" type="text/css" id="userTheme" href="themes/default.less"/> */}
        <script src="./lib/less.js"></script>
        <script src={process.env.dev ? " ./lib/vue.js" : "./lib/vue.dev.js"}></script>
        <script src="./lib/smoothscroll.js"></script>
        <link
          rel="manifest"
          href="./manifest.json?v=2"
        />
        <script src="https://js-cdn.music.apple.com/hls.js/2.141.0/hls.js/hls.js"></script>
        <script src="hlscider.js"></script>
        <script src="./lib/jquery-3.2.1.slim.min.js"></script>
        <script src="./lib/popper.min.js"></script>
        <script src="./lib/bootstrap.min.js"></script>
        <script src="./lib/bootbox.min.js"></script>
        <script src="./lib/notyf.min.js"></script>
        <script src="./lib/marked.js"></script>
        <script src="./lib/velocity.min.js"></script>
        <script src="./lib/fast-plural-rules.js"></script>
        <script src="./lib/resonance-audio.min.js"></script>
        <script src="./lib/stackblur.min.js"></script>

        <style>
          {```#LOADER {
          position: fixed;
          top: 0;
          left: 0;
          width: '100%';
          height: '100%';
          background-color: #1E1E1E;
          z-index: 99999;
          display: flex;
          justify-content: center;
          alignItems: center;
        }

        #LOADER > svg {
          width: '128px;
        }

        media (prefers-color-scheme: light) {
          #LOADER {
            background-color: #eee;
          }
        }```}
        </style>
      </head>

      <body
        className="notransparency"
        onContextMenu={() => false}
        os-release={parseInt(process.env.osRelease || "0")}
        loading="1"
        platform={process.env.platform}>
        <script src="./lib/vue-horizontal.js"></script>
        <script src="./lib/bootstrap-vue.min.js"></script>
        <script src="./lib/vuex.min.js"></script>
        <script src="./lib/sortable.min.js"></script>
        <script src="./lib/vue-observe-visibility.min.js"></script>
        <script src="./lib/vuedraggable.umd.min.js"></script>
        {/* <script src="./lib/quasar/quasar.umd.min.js"></script> */}
        <script
          type="module"
          src="./main/app.js"></script>

        <div id="LOADER">
          <CiderRound />
        </div>
        <div
          id="app"
          className={getAppClasses()}
          v-if="appVisible"
          window-state={chrome.windowState}
          style={getAppStyle()}
          library-visible={chrome.sidebarCollapsed ? 0 : 1}
          window-style={cfg.visual.directives.windowLayout}>
          <ViewTransition name="fsModeSwitch">
            {appMode === "player" && (
              <div id="app-main">
                <chromeTop />
                <appNavigation />
                <chromeBottom />
              </div>
            )}
          </ViewTransition>
          <ViewTransition name="fsModeSwitch">
            {appMode === "fullscreen" && (
              <div className="fullscreen-view-container">
                <fullscreen-view
                  ref="fsView"
                  image="currentArtUrlRaw"
                  time={mk.currentPlaybackTime - lyricOffset}
                  lyrics="lyrics"
                  richlyrics="richlyrics"
                />
              </div>
            )}
          </ViewTransition>
          <ViewTransition name="fsModeSwitch">
            {appMode === "mini" && (
              <div className="fullscreen-view-container">
                <mini-view
                  image="currentArtUrlRaw"
                  time={mk.currentPlaybackTime - lyricOffset}
                  lyrics="lyrics"
                  richlyrics="richlyrics"></mini-view>
              </div>
            )}
          </ViewTransition>
          <ViewTransition name="fsModeSwitch">
            {appMode === "oobe" && (
              <div className="fullscreen-view-container oobe">
                <cider-oobe />
              </div>
            )}
          </ViewTransition>
          <panels />
          <div
            className="cursor"
            v-if="chrome.showCursor"
          />
        </div>

        {process.env.components as unknown as ReactElement[]}

        <script
          async
          src="https://js-cdn.music.apple.com/musickit/v3/amp/musickit.js"
          data-web-components></script>
        <script src="index.js?v=1"></script>
        <div id="am-musiccovershelf">
          <h1>{component.attributes.title.stringForDisplay}</h1>
        </div>
      </body>
    </div>
  );
}
