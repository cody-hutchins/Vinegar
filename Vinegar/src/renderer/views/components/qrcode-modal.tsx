import { useTranslation } from "react-i18next";

const QRCodeModal = ({ src, url }: { src: string; url: string }) => {
  const { t } = useTranslation();
  const app = this.$root;
  function close() {
    app.resetState();
  }
  return (
    <div id={"qrcode-modal"}>
      <div className={"modal-fullscreen spatialproperties-panel"}>
        <div className={"modal-window"}>
          <div className={"modal-header"}>
            <div className={"modal-title"}>Web Remote QR : {url}</div>
            <button
              className={"close-btn"}
              onClick={() => close()}
              aria-label={t("action.close")}
            />
          </div>
          <div className={"modal-content"}>
            <img
              className={"qrimg"}
              src={src}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
