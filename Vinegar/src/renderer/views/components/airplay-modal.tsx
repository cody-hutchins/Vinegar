import { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const AirplayModal = () => {
  const [passcode, setPasscode] = useState("");
  const { t } = useTranslation();

  const close = () => {
    this.$root.modals.airplayPW = false;
  };
  const enterPassword = () => {
    console.log("Entered passCode: ", passcode);
    window.electronAPI.send("setAirPlayPasscode", passcode, this.$root.currentAirPlayCodeID);
    close();
  };

  return (
    <div
      className={"spatialproperties-panel castmenu modal-fullscreen airplay-modal"}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          close();
        }
      }}
      onContextMenu={(e) => {
        if (e.target === e.currentTarget) {
          close();
        }
      }}>
      <div className={"modal-window airplay-modal"}>
        <div className={"modal-header"}>
          <div className={"modal-title"}>Enter password</div>
          <button
            className={"close-btn"}
            onClick={close}
            aria-label={t("action.close")}
          />
        </div>
        <div
          className={"modal-content"}
          style={{ overflowY: "overlay", padding: "3%" }}>
          <input
            type={"text"}
            onChange={(e) => setPasscode(e.target.value)}
          />
        </div>
        <div className={"md-footer"}>
          <Row>
            <Col>
              <button
                style={{ width: "100%" }}
                onClick={enterPassword}
                className={"md-btn md-btn-block md-btn-primary"}>
                OK
              </button>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AirplayModal;
