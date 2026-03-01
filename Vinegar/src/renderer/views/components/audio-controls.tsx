export const Component = () => {
  Vue.component("audio-controls", {
    template: "#audio-controls",
    data: function () {
      return {
        app: this.$root,
        maxVolume: this.$root.cfg.audio.maxVolume * 100,
        volumeStep: this.$root.cfg.audio.volumeStep * 100,
        volume: this.$root.cfg.audio.volume * 100,
      };
    },
    watch: {
      maxVolume: function (newValue, _oldValue) {
        if (newValue > 100) {
          newValue = 100;
        } else {
          newValue = Math.round(newValue);
        }
        this.$root.cfg.audio.maxVolume = newValue / 100;
        this.maxVolume = newValue;
        console.log(newValue, _oldValue);
      },
      volume: function (newValue, _oldValue) {
        if (newValue > this.maxVolume) {
          newValue = 100;
        } else {
          newValue = Math.round(newValue);
        }
        this.$root.mk.volume = newValue / 100;
        this.volume = newValue;
        console.log(newValue, _oldValue);
      },
      volumeStep: function (newValue, _oldValue) {
        if (newValue > this.maxVolume) {
          newValue = 100;
        } else {
          newValue = Math.round(newValue);
        }
        this.$root.cfg.audio.volumeStep = newValue / 100;
        this.volumeStep = newValue;
        console.log(newValue, _oldValue);
      },
    },
  });
  return (
    <div id="audio-controls">
      <div
        className="modal-fullscreen addtoplaylist-panel"
        clickself="app.modals.audioControls = false"
        contextmenuself="app.modals.audioControls = false">
        <div className="modal-window">
          <div className="modal-header">
            <div className="modal-title">{app.getLz("term.audioControls")}</div>
            <button
              className="close-btn"
              click="app.modals.audioControls = false"
              aria-label="app.getLz('action.close')"></button>
          </div>
          <div className="modal-content">
            <div className="md-option-line">
              <div className="md-option-segment">{app.getLz("term.volume")}</div>
              <div className="md-option-segment md-option-segment_auto percent">
                <input
                  type="number"
                  style={{ width: "100%", textAlign: "center", marginRight: "5px" }}
                  min="0"
                  step="2"
                  v-model="volume"
                />
              </div>
            </div>
            <div className="md-option-line">
              <div className="md-option-segment">{app.getLz("settings.option.audio.volumeStep")}</div>
              <div className="md-option-segment md-option-segment_auto percent">
                <input
                  type="number"
                  style={{ width: "100%", textAlign: "center", marginRight: "5px" }}
                  min="0"
                  v-model="volumeStep"
                />
              </div>
            </div>
            <div className="md-option-line">
              <div className="md-option-segment">{app.getLz("settings.option.audio.maxVolume")}</div>
              <div className="md-option-segment md-option-segment_auto percent">
                <input
                  type="number"
                  style={{ width: "100%", textAlign: "center", marginRight: "5px" }}
                  min="0"
                  v-model="maxVolume"
                />
              </div>
            </div>
            <div className="md-option-line">
              <div className="md-option-segment">{$root.getLz("settings.option.audio.advanced")}</div>
              <div className="md-option-segment md-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="app.cfg.audio.advanced"
                    switch
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
