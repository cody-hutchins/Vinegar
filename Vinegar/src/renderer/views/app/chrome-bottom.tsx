import MediaItemArtwork from "../components/mediaitem-artwork.jsx";

export const ChromeBottom = () => (
  <div
    className="app-chrome chrome-bottom"
    v-if={getThemeDirective("windowLayout") === "twopanel"}
    style={{ display: chrome.topChromeVisible ? "" : "none" }}>
    <div className="app-chrome--left">
      <div className="app-chrome-item playback-controls">
        <template v-if={mkReady()}>
          <div
            className="app-playback-controls"
            onMouseOver={() => {chrome.progresshover = true}}
            onMouseLeave={() => {chrome.progresshover = false}}
            onContextMenu={nowPlayingContextMenu}>
            <div
              v-if={cfg.visual.artworkDisplayLayout === "default"}
              clickstop={switchArtworkDisplayLayout()}
              className="artwork"
              id="artworkLCD">
              <MediaItemArtwork url={$root.currentArtUrl} />
              <b-popover
                custom-className="mediainfo-popover"
                target="artworkLCD"
                triggers="hover"
                placement="right">
                <div className="content">
                  <div className="shadow-artwork">
                    <MediaItemArtwork url="currentArtUrl" />
                  </div>
                  <div className="popover-artwork">
                    <MediaItemArtwork url="currentArtUrl" />
                  </div>
                  <div className="song-name">{mk.nowPlayingItem["attributes"]["name"]}</div>
                  <div
                    className="song-artist"
                    onClick={() => getNowPlayingItemDetailed(`artist`)}>
                    {mk.nowPlayingItem["attributes"]["artistName"]}
                  </div>
                  <div
                    className="song-album"
                    onClick={() => getNowPlayingItemDetailed(`album`)}>
                    {mk.nowPlayingItem["attributes"]["albumName"] ? mk.nowPlayingItem["attributes"]["albumName"] : ""}
                  </div>
                  <hr />
                  <div
                    className="btn-group"
                    style={{ width: "100%" }}>
                    <button
                      className="md-btn md-btn-small"
                      style={{ width: "100%" }}
                      onClick={() => {
                        drawer.open = false;
                        miniPlayer(true);
                      }}>
                      {$root.getLz("term.miniplayer")}
                    </button>
                    <button
                      className="md-btn md-btn-small"
                      style={{ width: "100%" }}
                      onClick={() => {
                        drawer.open = false;
                        fullscreen(true);
                      }}>
                      {$root.getLz("term.fullscreenView")}
                    </button>
                  </div>
                </div>
              </b-popover>
            </div>
            <div className="playback-info">
              <div
                className="song-name"
                className="[isElementOverflowing('#app-main > div.app-chrome > div.app-chrome--center > div > div > div.playback-info > div.song-name') ? 'marquee' : '']">
                {mk.nowPlayingItem["attributes"]["name"]}
                <div
                  className="explicit-icon"
                  v-if={mk.nowPlayingItem["attributes"]["contentRating"] === "explicit"}
                  style={{ display: "inline-block" }}
                />
              </div>
              <div
                className="song-artist"
                onClick={() => getNowPlayingItemDetailed(`artist`)}>
                {mk.nowPlayingItem["attributes"]["artistName"]}
              </div>
              <div
                className="song-album"
                onClick={() => getNowPlayingItemDetailed("album")}
                v-if='mk.nowPlayingItem["attributes"]["albumName"]'>
                {mk.nowPlayingItem["attributes"]["albumName"] ? mk.nowPlayingItem["attributes"]["albumName"] : ""}
              </div>
              <div className="chrome-icon-container">
                <div
                  className="audio-type private-icon"
                  v-if={cfg.general.privateEnabled === true}
                />
                <div
                  className="audio-type spatial-icon"
                  v-if={cfg.audio.maikiwiAudio.spatial === true}
                  title={$root.getLz("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization") + " (" + getProfileLz("CTS", cfg.audio.maikiwiAudio.spatialProfile) + ")"}
                  v-b-tooltiphover
                />
                <div
                  className="audio-type lossless-icon"
                  v-if={(mk.nowPlayingItem?.localFilesMetadata?.lossless ?? false) === true}
                  title={mk.nowPlayingItem?.localFilesMetadata?.bitDepth +'-bit / '+ mk.nowPlayingItem?.localFilesMetadata?.sampleRate/1000 + ' kHz ' + mk.nowPlayingItem.localFilesMetadata.container"
                  v-b-tooltiphover
                />
                <div
                  className="audio-type ppe-icon"
                  v-if={mk.nowPlayingItem.localFilesMetadata === null && cfg.audio.maikiwiAudio.ciderPPE === true}
                  title={$root.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPE")}
                  v-b-tooltiphover
                />
                <svg
                  className="audio-type live-icon"
                  v-if={mk.nowPlayingItem?.attributes?.isLive === true}
                  title={$root.getLz("term.live")}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--keyColor)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  v-b-tooltiphover>
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line
                    x1="12"
                    y1="20"
                    x2={12.01}
                    y2="20"
                  />
                </svg>
              </div>
            </div>
            <template v-if={mk.nowPlayingItem["attributes"]["playParams"]}>
              <div className="actions">
                <button
                  className="lcdMenu"
                  onClick={nowPlayingContextMenu}
                  title={$root.getLz("term.more")}
                  v-b-tooltiphover>
                  <div className="svg-icon" />
                </button>
              </div>
            </template>
          </div>
        </template>

        <template v-else>
          <div className="app-playback-controls">
            <div
              v-if={cfg.visual.artworkDisplayLayout === "default"}
              className="artwork"
              id="artworkLCD"
              style={{ pointerEvents: "none" }}>
              <MediaItemArtwork url="currentArtUrl" />
            </div>
            <div className="playback-info">
              <div className="song-name" />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div className="app-chrome--center">
      <div className="app-chrome-playback-duration-bottom">
        <b-row v-if={mkReady() && mk.nowPlayingItem?.attributes?.isLive !== true}>
          <b-col sm="auto">{convertTime(getSongProgress())}</b-col>
          <b-col>
            <input
              type="range"
              step={0.01}
              min="0"
              style={progressBarStyle()}
              onInput={() => {playerLCD.desiredDuration = $event.target.value;playerLCD.userInteraction = true}}
              onMouseUp={() => {mk.seekToTime($event.target.value);setTimeout(()=>{playerLCD.desiredDuration = 0;playerLCD.userInteraction = false}, 1000);}}
              onTouchEnd={() => {mk.seekToTime($event.target.value);setTimeout(()=>{playerLCD.desiredDuration = 0;playerLCD.userInteraction = false}, 1000);}}
              max={mk.currentPlaybackDuration}
              value={getSongProgress()}
            />
          </b-col>
          <b-col
            sm="auto"
            v-if={!mk.nowPlayingItem?.isLiveRadioStation}>
            {convertTime(mk.currentPlaybackDuration)}
          </b-col>
          <b-col
            sm="auto"
            v-else>
            {getLz("term.live")}
          </b-col>
        </b-row>
      </div>
      <div className="app-chrome-playback-controls">
        <div className="app-chrome-item">
          <button
            className="playback-button--small shuffle"
            v-if={mk.shuffleMode === 0}
            className={isDisabled() && 'disabled'}
            onClick={() => {
              mk.shuffleMode = 1;
            }}
            title={$root.getLz("term.enableShuffle")}
            v-b-tooltiphover
          />
          <button
            className="playback-button--small shuffle active"
            v-else
            className={isDisabled() && 'disabled'}
            onClick={() => (mk.shuffleMode = 0)}
            title={$root.getLz("term.disableShuffle")}
            v-b-tooltiphover
          />
        </div>
        <div className="app-chrome-item">
          <button
            className="playback-button previous"
            onClick={prevButton}
            className={isPrevDisabled() && 'disabled'}
            title={$root.getLz("term.previous")}
            v-b-tooltiphover
          />
        </div>
        <div className="app-chrome-item">
          <button
            className="playback-button stop"
            onClick={mk.stop}
            v-if={mk.isPlaying && mk.nowPlayingItem.attributes.playParams.kind === "radioStation"}
            title={$root.getLz("term.stop")}
            v-b-tooltiphover
          />
          <button
            className="playback-button pause"
            onClick={mk.pause}
            v-else-if={mk.isPlaying}
            title={$root.getLz("term.pause")}
            v-b-tooltiphover
          />
          <button
            className="playback-button play"
            onClick={mk.play}
            v-else
            title={$root.getLz("term.play")}
            v-b-tooltiphover
          />
        </div>
        <div className="app-chrome-item">
          <button
            className="playback-button next"
            onClick={skipToNextItem}
            className={isNextDisabled() && 'disabled'}
            title={$root.getLz("term.next")}
            v-b-tooltiphover
          />
        </div>
        <div className="app-chrome-item">
          <button
            className="playback-button--small repeat"
            className={mk.repeatMode === 1 ? 'repeatOne' : mk.repeatMode === 2 ? 'active' : ''}
            className={isDisabled() && 'disabled'}
            onClick={repeatIncrement}
            title={$root.lz.repeat[mk.repeatMode]}
            v-b-tooltiphover
          />
        </div>
      </div>
    </div>
    <div className="app-chrome--right">
      <div className="app-chrome-item volume">
        <button
          className="volume-button--small volume"
          onClick={muteButtonPressed}
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
      <div className="app-chrome-item generic">
        <button
          className="playback-button--small cast"
          title={$root.getLz("term.cast")}
          v-b-tooltiphover
          onClick={() => {
            modals.castMenu = true;
          }}
        />
      </div>
      <div className="app-chrome-item generic">
        <button
          className="playback-button--small queue"
          className="{'active': drawer.panel === 'queue'}"
          title={$root.getLz("term.queue")}
          v-b-tooltiphover
          onClick={() => invokeDrawer("queue")}
        />
      </div>
      <div className="app-chrome-item generic">
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
    </div>
  </div>
);

export default ChromeBottom;
