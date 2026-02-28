export const Component = () => {
  Vue.component("moreinfo-modal", {
    template: "#moreinfo-modal",
    data: function () {
      return {
        app: this.$root,
        timedelay: false,
      };
    },
    props: ["data"],
    mounted() {
      let self = this;
      this.$nextTick(() => {
        setTimeout(function () {
          self.timedelay = true;
        }, 1000);
      });
    },
    methods: {
      close() {
        app.modals.moreInfo = false;
      },
    },
  });
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
