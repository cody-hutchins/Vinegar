import AddToPlaylist from "../components/add-to-playlist-panel.jsx";
import EQView from "../components/eq-view.jsx";
import MenuPanel from "../components/menu-panel.jsx";
import MoreInfoModal from "../components/moreinfo-modal.jsx";
import PluginMenu from "../components/plugin-menu.jsx";
import QRCodeModal from "../components/qrcode-modal.jsx";
import SettingsWindow from "../components/settings-window.jsx";

const Panels = () => {
  return (
    <>
      <MenuPanel v-if={menuPanel.visible} />
      <transition name="wpfade">
        <div
          className="bg-artwork-container"
          v-if={cfg.visual.window_background_style === "artwork"}
          className="{noanimation: (!cfg.visual.bg_artwork_rotation || !animateBackground)}">
          <img
            load={chrome.artworkReady = true}
            className="bg-artwork a"
          />
          <img className="bg-artwork b" />
        </div>
      </transition>
      <transition name="wpfade">
        <div className="bg-artwork--placeholder" />
      </transition>
      <transition name="modal">
        <c2-upgrade v-if={modals.c2Upgrade} />
      </transition>
      <transition name="modal">
        <AddToPlaylist
          playlists={playlists.listing}
          v-if={modals.addToPlaylist}
        />
      </transition>
      <transition name="modal">
        <audio-controls v-if={modals.audioControls} />
      </transition>
      <transition name="modal">
        <audio-playbackrate v-if={modals.audioPlaybackRate} />
      </transition>
      <transition name="modal">
        <audio-settings v-if={modals.audioSettings} />
      </transition>
      <transition name="modal">
        <castmenu v-if={modals.castMenu} />
      </transition>
      <transition name="modal">
        <pathmenu v-if={modals.pathMenu} />
      </transition>
      <transition name="modal">
        <airplay-modal v-if={modals.airplayPW} />
      </transition>
      <transition name="modal">
        <PluginMenu v-if={modals.pluginMenu} />
      </transition>
      <transition name="modal">
        <SettingsWindow v-if={modals.settings} />
      </transition>
      <transition name="modal">
        <EQView v-if={modals.equalizer} />
      </transition>
      <transition name="modal">
        <QRCodeModal
          v-if={modals.qrcode}
          src="webremoteqr"
          url="webremoteurl"
        />
      </transition>
      <transition name="modal">
        <MoreInfoModal
          v-if={modals.moreInfo}
          data="moreinfodata"
        />
      </transition>
      <div
        id="apple-music-video-container"
        className="{'mini': mvViewMode === 'mini'}">
        <div id="apple-music-video-player-controls">
          <div
            id="player-exit"
            title="Close"
            onClick={() => {
              exitMV();
              fullscreen(false);
            }}>
            <svg
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 21 21"
              aria-role="presentation"
              focusable="false"
              onClick={() => {
                exitMV();
                fullscreen(false);
              }}>
              <path
                d="M10.5 21C4.724 21 0 16.275 0 10.5S4.724 0 10.5 0 21 4.725 21 10.5 16.276 21 10.5 21zm-3.543-5.967a.96.96 0 00.693-.295l2.837-2.842 2.85 2.842c.167.167.41.295.693.295.552 0 1.001-.461 1.001-1.012 0-.281-.115-.512-.295-.704L11.899 10.5l2.85-2.855a.875.875 0 00.295-.68c0-.55-.45-.998-1.001-.998a.871.871 0 00-.668.295l-2.888 2.855-2.862-2.843a.891.891 0 00-.668-.281.99.99 0 00-1.001.986c0 .269.116.512.295.678L9.088 10.5l-2.837 2.843a.926.926 0 00-.295.678c0 .551.45 1.012 1.001 1.012z"
                fill-rule="nonzero"
              />
            </svg>
          </div>
          <div
            id="captions"
            v-if={lyricon && mvViewMode === "full"}>
            {(lyricon ? (lyrics.length > 0 && lyrics[currentLyricsLine] && lyrics[currentLyricsLine].line ? lyrics[currentLyricsLine].line.replace("lrcInstrumental", "") : "") : "") + (lyricon ? (lyrics.length > 0 && lyrics[currentLyricsLine] && lyrics[currentLyricsLine].line ? (lyrics[currentLyricsLine].translation ? "\n\r" + lyrics[currentLyricsLine].translation : "") : "") : "")}
          </div>
          <div className="playback-info music-player-info">
            <div
              className="song-artist-album-content"
              v-if={mvViewMode === "full"}
              style={{ display: "inline-block", "-webkit-box-orient": "horizontal", whiteSpace: "nowrap" }}>
              <div
                className="song-artist"
                style={{ display: "inline-block" }}>
                {mk.nowPlayingItem?.attributes?.artistName ?? ""}
              </div>
            </div>
            <div
              className="song-name"
              v-if={mvViewMode === "full"}>
              {mk.nowPlayingItem?.attributes?.name ?? ""}
              <div
                className="explicit-icon"
                v-if={mk.nowPlayingItem?.attributes?.contentRating === "explicit"}
                style={{ display: "inline-block" }}
              />
            </div>
            <div
              className="song-progress"
              v-if={mvViewMode === "full"}>
              <p style={{ width: "auto" }}>{convertTime(getSongProgress())}</p>
              <input
                type="range"
                step={0.01}
                min="0"
                style={progressBarStyle()}
                style={{ width: "95%" }}
                onInput={() => playerLCD.desiredDuration = $event.target.value;playerLCD.userInteraction = true}}
                onMouseUp={() => mk.seekToTime($event.target.value);setTimeout(()=>{playerLCD.desiredDuration = 0;playerLCD.userInteraction = false}, 1000);}}
                onTouchEnd={() => mk.seekToTime($event.target.value);setTimeout(()=>{playerLCD.desiredDuration = 0;playerLCD.userInteraction = false}, 1000);}}
                max={mk.currentPlaybackDuration}
                value="getSongProgress()"
              />
              <p style={{ width: "auto" }}>{convertTime(mk.currentPlaybackDuration)}</p>
            </div>

            <div className="app-chrome-item display--large">
              <div
                className="app-chrome-item volume display--large"
                v-if={mvViewMode === "full"}>
                <button
                  className="volume-button--small volume"
                  onClick={() => muteButtonPressed()}
                  className="{'active': cfg.audio.volume === 0}"
                  title={cfg.audio.muted ? $root.getLz('term.unmute') : $root.getLz('term.mute')}
                  v-b-tooltiphover
                />
                <input
                  type="range"
                  wheel="volumeWheel"
                  step={cfg.audio.volumeStep}
                  min="0"
                  max={cfg.audio.maxVolume}
                  v-model={mk.volume}
                  v-if={typeof mk.volume !== "undefined"}
                  onChange={() => checkMuteChange()}
                  v-b-tooltiphover
                  title={formatVolumeTooltip()}
                />
              </div>
              <template v-if={mvViewMode === "full"}>
                <button
                  className="playback-button pause"
                  onClick={() => mk.pause()}
                  v-if={mk.isPlaying}
                  title={$root.getLz("term.pause")}
                  v-b-tooltiphover
                />
                <button
                  className="playback-button play"
                  onClick={() => mk.play()}
                  v-else
                  title={$root.getLz("term.play")}
                  v-b-tooltiphover
                />
              </template>
              <div
                className="app-chrome-item generic"
                v-if={mvViewMode === "full"}>
                <template v-if={lyrics && lyrics !== [] && lyrics.length > 0}>
                  <button
                    className="playback-button--small lyrics"
                    title={$root.getLz("term.lyrics")}
                    v-b-tooltiphover
                    className="{'active': drawer.panel === 'lyrics'}"
                    onClick={() => invokeDrawer("lyrics")}
                  />
                </template>
                <template v-else>
                  <button
                    className="playback-button--small lyrics"
                    style={{ opacity: 0.3, pointerEvents: "none" }}
                  />
                </template>
              </div>
              <div
                id="player-pip"
                className="{'mini': mvViewMode === 'mini'}"
                onClick={() => pip()}
                title="Picture-in-Picture"
                v-b-tooltiphover>
                {import("../svg/pip.svg")}
              </div>
              <div
                id="player-fullscreen"
                v-if={mvViewMode === "full"}
                onClick={() => fullscreen(!fullscreenState, true)}
                title="Fullscreen"
                v-b-tooltiphover>
                {import("../svg/fullscreen.svg")}
              </div>
            </div>
          </div>
        </div>
        <div id="apple-music-video-player" />
      </div>
    </>
  );
};

export default Panels;
