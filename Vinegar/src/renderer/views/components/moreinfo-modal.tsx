export const Component = ({ data }: { data: object }) => {
  const app = this.$root;
  const timedelay = false;
  function mounted() {
    let self = this;
    this.$nextTick(() => {
      setTimeout(function () {
        self.timedelay = true;
      }, 1000);
    });
  }

  function close() {
    app.modals.moreInfo = false;
  }

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
              click="close()"
              aria-label="app.getLz('action.close')"></button>
          </div>
          <div className="modal-content">
            <div
              className="content"
              v-html="data.content"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
