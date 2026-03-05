import { useState } from "react";

const Component = () => {
  const app = this.$root;
  const [playbackRate, setPlaybackRate] = useState(this.$root.cfg.audio.playbackRate);
  const playbackRateWheel = (event) => {
    if (app.checkScrollDirectionIsUp(event)) {
      playbackRateClick(this.$root.cfg.audio.playbackRate + 0.05);
    } else {
      playbackRateClick(this.$root.cfg.audio.playbackRate - 0.05);
    }
  };
  const playbackRateClick = (newValue) => {
    newValue = Number(newValue);
    if (newValue >= 0.25 && newValue <= 2) {
      newValue = String(newValue).length > 4 ? newValue.toFixed(2) : newValue;
      this.$root.mk.playbackRate = newValue;
      this.$root.cfg.audio.playbackRate = newValue;
      setPlaybackRate(newValue);
    }
  };
  return (
    <div id="audio-playbackrate">
      <div
        className="modal-fullscreen addtoplaylist-panel"
        clickself={(app.modals.audioPlaybackRate = false)}
        contextmenuself={(app.modals.audioPlaybackRate = false)}>
        <div className="modal-window">
          <div className="modal-header">
            <div className="modal-title">{app.getLz("settings.option.audio.changePlaybackRate")}</div>
            <button
              className="close-btn"
              onClick={() => (app.modals.audioPlaybackRate = false)}
              aria-label={app.getLz("action.close")}
            />
          </div>
          <div className="modal-content">
            <div className="md-option-line">
              <div className="md-option-segment">{app.getLz("settings.option.audio.playbackRate")}</div>
              <div
                className="md-option-segment playbackrate-text"
                v-if={playbackRate}>
                {playbackRate} ×
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <input
                  type="range"
                  step={0.05}
                  min={0.25}
                  max="2"
                  onWheel={playbackRateWheel}
                  onChange={(e) => playbackRateClick(e.target.value)}
                  v-model={playbackRate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
