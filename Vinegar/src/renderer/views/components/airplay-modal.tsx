import { useState } from "react";

export const AirplayModal = () => {
  const [passcode, setPasscode] = useState("");
  const close = () => {
    this.$root.modals.airplayPW = false;
  };
  const enterPassword = () => {
    console.log("Entered passCode: ", passcode);
    ipcRenderer.send("setAirPlayPasscode", passcode, this.$root.currentAirPlayCodeID);
    close();
  };

  return (
    <div
      className="spatialproperties-panel castmenu modal-fullscreen airplay-modal"
      clickself={close}
      contextmenuself={close}>
      <div className="modal-window airplay-modal">
        <div className="modal-header">
          <div className="modal-title">Enter password</div>
          <button
            className="close-btn"
            onClick={close}
            aria-label={this.$root.getLz("action.close")}></button>
        </div>
        <div
          className="modal-content"
          style={{ overflowY: "overlay", padding: "3%" }}>
          <input
            type="text"
            onChange={(e) => setPasscode(e.target.value)}
          />
        </div>
        <div className="md-footer">
          <div className="row">
            <div className="col">
              <button
                style={{ width: "100%" }}
                onClick={enterPassword}
                className="md-btn md-btn-block md-btn-primary">
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirplayModal;
