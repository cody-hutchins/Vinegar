export const Component = ({ src, url }: { src: string; url: string }) => {
  const app = this.$root;
  function close() {
    app.resetState();
  }
  return (
    <div id="qrcode-modal">
      <div className="modal-fullscreen spatialproperties-panel">
        <div className="modal-window">
          <div className="modal-header">
            <div className="modal-title">{`Web Remote QR : ` + url}</div>
            <button
              className="close-btn"
              click="close()"
              aria-label="app.getLz('action.close')"></button>
          </div>
          <div className="modal-content">
            <img
              className="qrimg"
              src="src"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
