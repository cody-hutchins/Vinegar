import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCfgStore } from "../../store/cfg.js";

const AudioControls = () => {
  const { cfg } = useCfgStore();
  const { t } = useTranslation();

  let maxVolume: number = cfg.audio.maxVolume * 100;
  let volumeStep: number = cfg.audio.volumeStep * 100;
  let volume: number = cfg.audio.volume * 100;

  useEffect(() => {
    if (newValue > 100) {
      newValue = 100;
    } else {
      newValue = Math.round(newValue);
    }
    cfg.audio.maxVolume = newValue / 100;
    maxVolume = newValue;
    console.log(newValue, _oldValue);
  }, [maxVolume]);

  useEffect(() => {
    if (newValue > maxVolume) {
      newValue = 100;
    } else {
      newValue = Math.round(newValue);
    }
    this.$root.mk.volume = newValue / 100;
    volume = newValue;
    console.log(newValue, _oldValue);
  }, [volume]);

  useEffect(() => {
    if (newValue > maxVolume) {
      newValue = 100;
    } else {
      newValue = Math.round(newValue);
    }
    cfg.audio.volumeStep = newValue / 100;
    volumeStep = newValue;
    console.log(newValue, _oldValue);
  }, [volumeStep]);

  return (
    <div id={"audio-controls"}>
      <div
        className={"modal-fullscreen addtoplaylist-panel"}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            app.modals.audioControls = false;
          }
        }}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) {
            app.modals.audioControls = false;
          }
        }}>
        <div className={"modal-window"}>
          <div className={"modal-header"}>
            <div className={"modal-title"}>{t("term.audioControls")}</div>
            <button
              className={"close-btn"}
              onClick={() => (app.modals.audioControls = false)}
              aria-label={t("action.close")}
            />
          </div>
          <div className={"modal-content"}>
            <div className={"md-option-line"}>
              <div className={"md-option-segment"}>{t("term.volume")}</div>
              <div className={"md-option-segment md-option-segment_auto percent"}>
                <input
                  type={"number"}
                  style={{ width: "100%", textAlign: "center", marginRight: "5px" }}
                  min={"0"}
                  step={"2"}
                  v-model={volume}
                />
              </div>
            </div>
            <div className={"md-option-line"}>
              <div className={"md-option-segment"}>{t("settings.option.audio.volumeStep")}</div>
              <div className={"md-option-segment md-option-segment_auto percent"}>
                <input
                  type={"number"}
                  style={{ width: "100%", textAlign: "center", marginRight: "5px" }}
                  min={"0"}
                  v-model={volumeStep}
                />
              </div>
            </div>
            <div className={"md-option-line"}>
              <div className={"md-option-segment"}>{t("settings.option.audio.maxVolume")}</div>
              <div className={"md-option-segment md-option-segment_auto percent"}>
                <input
                  type={"number"}
                  style={{ width: "100%", textAlign: "center", marginRight: "5px" }}
                  min={"0"}
                  v-model={maxVolume}
                />
              </div>
            </div>
            <div className={"md-option-line"}>
              <div className={"md-option-segment"}>{t("settings.option.audio.advanced")}</div>
              <div className={"md-option-segment md-option-segment_auto"}>
                <label>
                  <input
                    type={"checkbox"}
                    v-model={app.cfg.audio.advanced}
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

export default AudioControls;
