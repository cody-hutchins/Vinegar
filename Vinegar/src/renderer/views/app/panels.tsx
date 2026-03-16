import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import { useChromeStore } from "../../store/chrome.js";
import AddToPlaylist from "../components/add-to-playlist-panel.jsx";
import EQView from "../components/eq-view.jsx";
import MenuPanel from "../components/menu-panel.jsx";
import MoreInfoModal from "../components/moreinfo-modal.jsx";
import PluginMenu from "../components/plugin-menu.jsx";
import QRCodeModal from "../components/qrcode-modal.jsx";
import SettingsWindow from "../components/settings-window.jsx";

const Panels = () => {
  const chrome = useChromeStore((state) => state.chrome);

  return (
    <>
      {menuPanel.visible && <MenuPanel />}
      <AnimatePresence>
        <motion.div name={"wpfade"}>
          {cfg.visual.window_background_style === "artwork" && (
            <div className={classNames("bg-artwork-container", { noanimation: !cfg.visual.bg_artwork_rotation || !animateBackground })}>
              <img
                load={(chrome.artworkReady = true)}
                className={"bg-artwork a"}
              />
              <img className={"bg-artwork b"} />
            </div>
          )}
        </motion.div>
        <motion.div name={"wpfade"}>
          <div className={"bg-artwork--placeholder"} />
        </motion.div>
        <motion.div name={"modal"}>{modals.c2Upgrade && <c2-upgrade></c2-upgrade>}</motion.div>
        <motion.div name={"modal"}>{modals.addToPlaylist && <AddToPlaylist playlists={playlists.listing} />}</motion.div>
        <motion.div name={"modal"}>{modals.audioControls && <audio-controls></audio-controls>}</motion.div>
        <motion.div name={"modal"}>{modals.audioPlaybackRate && <audio-playbackrate></audio-playbackrate>}</motion.div>
        <motion.div name={"modal"}>{modals.audioSettings && <audio-settings></audio-settings>}</motion.div>
        <motion.div name={"modal"}>{modals.castMenu && <castmenu />}</motion.div>
        <motion.div name={"modal"}>{modals.pathMenu && <pathmenu />}</motion.div>
        <motion.div name={"modal"}>{modals.airplayPW && <airplay-modal></airplay-modal>}</motion.div>
        <motion.div name={"modal"}>{modals.pluginMenu && <PluginMenu />}</motion.div>
        <motion.div name={"modal"}>{modals.settings && <SettingsWindow />}</motion.div>
        <motion.div name={"modal"}>{modals.equalizer && <EQView />}</motion.div>
        <motion.div name={"modal"}>
          {modals.qrcode && (
            <QRCodeModal
              src={webremoteqr}
              url={webremoteurl}
            />
          )}
        </motion.div>
        <motion.div name={"modal"}>{modals.moreInfo && <MoreInfoModal data={moreinfodata} />}</motion.div>
      </AnimatePresence>
      <div
        id={"apple-music-video-container"}
        className={classNames({ mini: mvViewMode === "mini" })}>
        <div id={"apple-music-video-player-controls"}>
          <div
            id={"player-exit"}
            title={"Close"}
            onClick={() => {
              exitMV();
              fullscreen(false);
            }}>
            <svg
              fill={"white"}
              xmlns={"http://www.w3.org/2000/svg"}
              width={"21"}
              height={"21"}
              viewBox={"0 0 21 21"}
              aria-role={"presentation"}
              focusable={false}
              onClick={() => {
                exitMV();
                fullscreen(false);
              }}>
              <path
                d={"M10.5 21C4.724 21 0 16.275 0 10.5S4.724 0 10.5 0 21 4.725 21 10.5 16.276 21 10.5 21zm-3.543-5.967a.96.96 0 00.693-.295l2.837-2.842 2.85 2.842c.167.167.41.295.693.295.552 0 1.001-.461 1.001-1.012 0-.281-.115-.512-.295-.704L11.899 10.5l2.85-2.855a.875.875 0 00.295-.68c0-.55-.45-.998-1.001-.998a.871.871 0 00-.668.295l-2.888 2.855-2.862-2.843a.891.891 0 00-.668-.281.99.99 0 00-1.001.986c0 .269.116.512.295.678L9.088 10.5l-2.837 2.843a.926.926 0 00-.295.678c0 .551.45 1.012 1.001 1.012z"}
                fillRule={"nonzero"}
              />
            </svg>
          </div>
          {lyricon && mvViewMode === "full" && <div id={"captions"}>{(lyricon ? (lyrics.length > 0 && lyrics[currentLyricsLine] && lyrics[currentLyricsLine].line ? lyrics[currentLyricsLine].line.replace("lrcInstrumental", "") : "") : "") + (lyricon ? (lyrics.length > 0 && lyrics[currentLyricsLine] && lyrics[currentLyricsLine].line ? (lyrics[currentLyricsLine].translation ? "\n\r" + lyrics[currentLyricsLine].translation : "") : "") : "")}</div>}
          <div className={"playback-info music-player-info"}>
            {mvViewMode === "full" && (
              <div
                className={"song-artist-album-content"}
                style={{ display: "inline-block", "-webkit-box-orient": "horizontal", whiteSpace: "nowrap" }}>
                <div
                  className={"song-artist"}
                  style={{ display: "inline-block" }}>
                  {mk.nowPlayingItem?.attributes?.artistName ?? ""}
                </div>
              </div>
            )}
            {mvViewMode === "full" && (
              <div className={"song-name"}>
                {mk.nowPlayingItem?.attributes?.name ?? ""}
                {mk.nowPlayingItem?.attributes?.contentRating === "explicit" && (
                  <div
                    className={"explicit-icon"}
                    style={{ display: "inline-block" }}
                  />
                )}
              </div>
            )}
            {mvViewMode === "full" && (
              <div className={"song-progress"}>
                <p style={{ width: "auto" }}>{convertTime(getSongProgress())}</p>
                <input
                  type={"range"}
                  step={0.01}
                  min={"0"}
                  style={{ ...progressBarStyle(), width: "95%" }}
                  onInput={() => {
                    playerLCD.desiredDuration = $event.target.value;
                    playerLCD.userInteraction = true;
                  }}
                  onMouseUp={() => {
                    mk.seekToTime($event.target.value);
                    setTimeout(() => {
                      playerLCD.desiredDuration = 0;
                      playerLCD.userInteraction = false;
                    }, 1000);
                  }}
                  onTouchEnd={() => {
                    mk.seekToTime($event.target.value);
                    setTimeout(() => {
                      playerLCD.desiredDuration = 0;
                      playerLCD.userInteraction = false;
                    }, 1000);
                  }}
                  max={mk.currentPlaybackDuration}
                  value={getSongProgress()}
                />
                <p style={{ width: "auto" }}>{convertTime(mk.currentPlaybackDuration)}</p>
              </div>
            )}
            <div className={"app-chrome-item display--large"}>
              {mvViewMode === "full" && (
                <div className={"app-chrome-item volume display--large"}>
                  <button
                    className={classNames("volume-button--small volume", { active: cfg.audio.volume === 0 })}
                    onClick={() => muteButtonPressed()}
                    title={cfg.audio.muted ? $root.getLz("term.unmute") : $root.getLz("term.mute")}
                    v-b-tooltiphover
                  />
                  {typeof mk.volume !== "undefined" && (
                    <input
                      type={"range"}
                      wheel={"volumeWheel"}
                      step={cfg.audio.volumeStep}
                      min={"0"}
                      max={cfg.audio.maxVolume}
                      v-model={mk.volume}
                      onChange={() => checkMuteChange()}
                      v-b-tooltiphover
                      title={formatVolumeTooltip()}
                    />
                  )}
                </div>
              )}
              {mvViewMode === "full" && (
                <template>
                  {mk.isPlaying ? (
                    <button
                      className={"playback-button pause"}
                      onClick={() => mk.pause()}
                      title={$root.getLz("term.pause")}
                      v-b-tooltiphover
                    />
                  ) : (
                    <button
                      className={"playback-button play"}
                      onClick={() => mk.play()}
                      title={$root.getLz("term.play")}
                      v-b-tooltiphover
                    />
                  )}
                </template>
              )}
              {mvViewMode === "full" && (
                <div className={"app-chrome-item generic"}>
                  {lyrics && lyrics !== [] && lyrics.length > 0 ? (
                    <template>
                      <button
                        className={classNames("playback-button--small lyrics", { active: drawer.panel === "lyrics" })}
                        title={$root.getLz("term.lyrics")}
                        v-b-tooltiphover
                        onClick={() => invokeDrawer("lyrics")}
                      />
                    </template>
                  ) : (
                    <template>
                      <button
                        className={"playback-button--small lyrics"}
                        style={{ opacity: 0.3, pointerEvents: "none" }}
                      />
                    </template>
                  )}
                </div>
              )}
              <div
                id={"player-pip"}
                className={classNames({ mini: mvViewMode === "mini" })}
                onClick={() => pip()}
                title={"Picture-in-Picture"}
                v-b-tooltiphover>
                {import("../svg/pip.svg")}
              </div>
              {mvViewMode === "full" && (
                <div
                  id={"player-fullscreen"}
                  onClick={() => fullscreen(!fullscreenState, true)}
                  title={"Fullscreen"}
                  v-b-tooltiphover>
                  {import("../svg/fullscreen.svg")}
                </div>
              )}
            </div>
          </div>
        </div>
        <div id={"apple-music-video-player"} />
      </div>
    </>
  );
};

export default Panels;
