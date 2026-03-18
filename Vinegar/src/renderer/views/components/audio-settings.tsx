import { useTranslation } from "react-i18next";

const AudioSettings = () => {
  const { t } = useTranslation();

  const app = this.$root;
  const openEqualizer = () => {
    app.modals.equalizer = true;
    app.modals.audioSettings = false;
  };
  const openAudioControls = () => {
    app.modals.audioControls = true;
    app.modals.audioSettings = false;
  };
  const openAudioPlaybackRate = () => {
    app.modals.audioPlaybackRate = true;
    app.modals.audioSettings = false;
  };
  return (
    <div id={"audio-settings"}>
      <div
        className={"modal-fullscreen addtoplaylist-panel"}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            app.modals.audioSettings = false;
          }
        }}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) {
            app.modals.audioSettings = false;
          }
        }}>
        <div className={"modal-window"}>
          <div className={"modal-header"}>
            <div className={"modal-title"}>{t("term.audioSettings")}</div>
            <button
              className={"close-btn"}
              onClick={() => {
                app.modals.audioSettings = false;
              }}
              aria-label={t("action.close")}
            />
          </div>
          <div className={"modal-content"}>
            <button
              className={"playlist-item"}
              onClick={openEqualizer}
              style={{ width: "100%" }}>
              <div className={"icon"}>{import("../svg/speaker.svg")}</div>
              <div className={"name"}>{t("term.equalizer")}</div>
            </button>
            <button
              className={"playlist-item"}
              onClick={openAudioControls}
              style={{ width: "100%" }}>
              <div className={"icon"}>{import("../svg/speaker.svg")}</div>
              <div className={"name"}>{t("term.audioControls")}</div>
            </button>
            <button
              className={"playlist-item"}
              onClick={openAudioPlaybackRate}
              style={{ width: "100%" }}>
              <div className={"icon"}>{import("../svg/speaker.svg")}</div>
              <div className={"name"}>{t("settings.option.audio.changePlaybackRate")}</div>
            </button>
            <button
              className={"playlist-item"}
              onClick={() => $root.openSettingsPage("audiolabs")}
              style={{ width: "100%" }}>
              <div className={"icon"}>{import("../svg/speaker.svg")}</div>
              <div className={"name"}>{t("settings.option.audio.audioLab")}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AudioSettings;
