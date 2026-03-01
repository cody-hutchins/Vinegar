export const Component = () => {
  Vue.component("audio-settings", {
    template: "#audio-settings",
    data: function () {
      return {
        app: this.$root,
      };
    },
    props: {},
    mounted() {},
    methods: {
      openEqualizer() {
        app.modals.equalizer = true;
        app.modals.audioSettings = false;
      },
      openAudioControls() {
        app.modals.audioControls = true;
        app.modals.audioSettings = false;
      },
      openAudioPlaybackRate() {
        app.modals.audioPlaybackRate = true;
        app.modals.audioSettings = false;
      },
    },
  });
  return (
    <div id="audio-settings">
      <template>
        <div
          className="modal-fullscreen addtoplaylist-panel"
          clickself="app.modals.audioSettings = false"
          contextmenuself="app.modals.audioSettings = false">
          <div className="modal-window">
            <div className="modal-header">
              <div className="modal-title">{app.getLz("term.audioSettings")}</div>
              <button
                className="close-btn"
                click="app.modals.audioSettings = false"
                aria-label="app.getLz('action.close')"></button>
            </div>
            <div className="modal-content">
              <button
                className="playlist-item"
                click="openEqualizer()"
                style={{ width: 100 % "" }}>
                <div className="icon">{import("../svg/speaker.svg")}</div>
                <div className="name">{app.getLz("term.equalizer")}</div>
              </button>
              <button
                className="playlist-item"
                click="openAudioControls()"
                style={{ width: 100 % "" }}>
                <div className="icon">{import("../svg/speaker.svg")}</div>
                <div className="name">{app.getLz("term.audioControls")}</div>
              </button>
              <button
                className="playlist-item"
                click="openAudioPlaybackRate()"
                style={{ width: 100 % "" }}>
                <div className="icon">{import("../svg/speaker.svg")}</div>
                <div className="name">{app.getLz("settings.option.audio.changePlaybackRate")}</div>
              </button>
              <button
                className="playlist-item"
                click="$root.openSettingsPage('audiolabs')"
                style={{ width: 100 % "" }}>
                <div className="icon">{import("../svg/speaker.svg")}</div>
                <div className="name">{app.getLz("settings.option.audio.audioLab")}</div>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  );
};
