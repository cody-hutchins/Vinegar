import { useEffect } from "react";

const MoreInfoModal = ({ data }: { data: object }) => {
  const app = this.$root;
  const timedelay = false;
  function close() {
    app.modals.moreInfo = false;
  }
  useEffect(() => {
    setTimeout(() => {
      timedelay = true;
    }, 1000);
  }, []);
  return (
    <div id="moreinfo-modal">
      <div
        className="modal-fullscreen spatialproperties-panel moreinfo-modal"
        clickself="if(timedelay) close()">
        <div className="modal-window">
          <div className="modal-header">
            <div className="modal-title">{data.title}</div>
            <div className="modal-subtitle modal-title">{data.subtitle ?? ""}</div>
            <button
              className="close-btn"
              onClick={() => close()}
              aria-label={app.getLz("action.close")}
            />
          </div>
          <div className="modal-content">
            <div
              className="content"
              v-html={data.content}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreInfoModal;
