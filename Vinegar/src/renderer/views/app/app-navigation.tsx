import LyricsView from "../components/lyrics-view.jsx";
import Queue from "../components/queue.jsx";

<div
  className="app-navigation"
  v-cloak>
  <transition name="wpfade">
    <div
      className="usermenu-container"
      v-if={chrome.menuOpened}>
      <div className="usermenu-body">
        <button
          className="app-sidebar-button"
          style={{ width: "100%" }}
          onClick={() => appRoute("apple-account-settings")}>
          <img
            className="sidebar-user-icon"
            loading="lazy"
            src="getMediaItemArtwork(chrome.hideUserInfo ? './assets/logocut.png' : (chrome.userinfo.attributes['artwork'] ? chrome.userinfo.attributes['artwork']['url'] : ''), 26)"
          />

          <div
            className="sidebar-user-text"
            v-if={!chrome.hideUserInfo}>
            <template v-if={chrome.userinfo.id || mk.isAuthorized}>
              <div className="fullname text-overflow-elipsis">{chrome.userinfo !== null && chrome.userinfo.attributes !== null ? (chrome.userinfo.attributes.name ?? "") : ""}</div>
              <div className="handle-text text-overflow-elipsis">{chrome.userinfo !== null && chrome.userinfo.attributes !== null ? (chrome.userinfo.attributes.handle ?? "") : ""}</div>
            </template>
            <template v-else>
              <div onClick={() => mk.authorize()}>{$root.getLz("term.login")}</div>
            </template>
          </div>
          <div
            className="sidebar-user-text"
            v-else>
            {$root.getLz("app.name")}
          </div>
        </button>
        {/* Use 20px SVG for usermenu icon  */}
        <button
          className="usermenu-item"
          v-if={cfg.general.privateEnabled}
          onClick={() => (cfg.general.privateEnabled = false)}>
          <span className="usermenu-item-icon"> {import("../svg/x.svg")} </span>
          <span className="usermenu-item-name">{$root.getLz("term.disablePrivateSession")}</span>
        </button>
        <button
          className="usermenu-item"
          onClick={() => appRoute("remote-pair")}>
          <span className="usermenu-item-icon"> {import("../svg/smartphone.svg")} </span>
          <span className="usermenu-item-name">{$root.getLz("action.showWebRemoteQR")}</span>
        </button>
        <button
          className="usermenu-item"
          onClick={() => (modals.castMenu = true)}>
          <span className="usermenu-item-icon"> {import("../svg/cast.svg")} </span>
          <span className="usermenu-item-name">{$root.getLz("term.cast")}</span>
        </button>
        <button
          className="usermenu-item"
          onClick={() => (modals.audioSettings = true)}>
          <span className="usermenu-item-icon"> {import("../svg/headphones.svg")} </span>
          <span className="usermenu-item-name">{$root.getLz("term.audioSettings")}</span>
        </button>
        <button
          className="usermenu-item"
          v-if={pluginInstalled}
          onClick={() => (modals.pluginMenu = true)}>
          <span className="usermenu-item-icon"> {import("../svg/grid.svg")} </span>
          <span className="usermenu-item-name">{$root.getLz("term.plugin")}</span>
        </button>
        <button
          className="usermenu-item"
          onClick={() => appRoute("about")}>
          <span className="usermenu-item-icon"> {import("../svg/info.svg")} </span>
          <span className="usermenu-item-name">{$root.getLz("term.about")}</span>
        </button>
        <button
          className="usermenu-item"
          onClick={() => (modals.settings = true)}>
          <span className="usermenu-item-icon"> {import("../svg/settings.svg")} </span>
          <span className="usermenu-item-name">{$root.getLz("term.settings")}</span>
        </button>
        {$root.pluginMenuTopEntries.map((entry) => <button
          className="usermenu-item"
          onClick={() => entry.onClick()}>
          <span
            className="usermenu-item-icon"
            style={{ right: "2.5px" }}>
            {import("../svg/grid.svg")}
          </span>
          <span className="usermenu-item-name">{entry.name}</span>
        </button>)}
        <button
          className="usermenu-item"
          onClick={() => unauthorize()}>
          <span
            className="usermenu-item-icon"
            style={{ right: "2.5px" }}>
            {import("../svg/log-out.svg")}
          </span>
          <span className="usermenu-item-name">{$root.getLz("term.logout")}</span>
        </button>
        <button
          className="usermenu-item"
          onClick={() => quit()}>
          <span
            className="usermenu-item-icon"
            style={{ right: "2.5px" }}>
            {import("../svg/x.svg")}
          </span>
          <span className="usermenu-item-name">{$root.getLz("term.quit")}</span>
        </button>
        <button
          v-if={!chrome.noC2Upgrade}
          className="usermenu-item"
          onClick={() => c2offer()}>
          <span
            className="usermenu-item-icon"
            style={{ right: "1.5px" }}>
            <img
              className="sidebar-user-icon"
              loading="lazy"
              style={{ height: "16px", width: "16px" }}
              src="./assets/logocut.png"
            />
          </span>
          <span className="usermenu-item-name">Cider 2 Upgrade</span>
        </button>
      </div>
    </div>
  </transition>
  <transition name="sidebartransition">
    <cider-app-sidebar v-if={!chrome.sidebarCollapsed} />
  </transition>
  <app-content-area />
  <transition name="drawertransition">
    <div
      className="app-drawer"
      v-if={drawer.open && drawer.panel === "lyrics" && lyrics && lyrics !== [] && lyrics.length > 0}>
      <div className="bgArtworkMaterial">
        <div className="bg-artwork-container">
          <img
            v-if={cfg.visual.bg_artwork_rotation && animateBackground}
            className="bg-artwork a"
            src={$store.state.artwork.playerLCD}
          />
          <img
            v-if={cfg.visual.bg_artwork_rotation && animateBackground}
            className="bg-artwork b"
            src={$store.state.artwork.playerLCD}
          />
          <img
            v-if={!(cfg.visual.bg_artwork_rotation && animateBackground)}
            className="bg-artwork no-animation"
            src={$store.state.artwork.playerLCD}
          />
        </div>
      </div>
      <LyricsView
        v-if={drawer.panel === "lyrics"}
        time={mk.currentPlaybackTime - lyricOffset}
        lyrics="lyrics"
        richlyrics="richlyrics"
      />
      <div
        v-if={drawer.panel === "lyrics"}
        className="lyric-footer">
        <button
          className="md-btn"
          onClick={() => modularUITest(!fullscreenLyrics)}>
          {fullscreenLyrics ? $root.getLz("term.defaultView") : $root.getLz("term.fullscreenView")}
        </button>
      </div>
    </div>
  </transition>
  <transition name="drawertransition">
    <div
      className="app-drawer"
      v-if={drawer.open && drawer.panel === "queue"}>
      <Queue
        ref="queue"
        v-if={drawer.panel === "queue"}
      />
    </div>
  </transition>
</div>;
