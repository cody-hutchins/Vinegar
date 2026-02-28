export const Component = () => {
  Vue.component("pathmenu", {
    template: "#pathmenu",
    data: function () {
      return {
        folders: [],
      };
    },
    mounted() {
      this.folders = this.$root.cfg.libraryPrefs.localPaths;
    },
    watch: {},
    methods: {
      close() {
        this.$root.modals.pathMenu = false;
      },
      async add() {
        const result = await ipcRenderer.invoke("folderSelector");
        for (i of result) {
          if (this.folders.findIndex((x) => x.startsWith(i)) == -1) {
            this.folders.push(i);
          }
        }
        this.$root.cfg.libraryPrefs.localPaths = this.folders;
        ipcRenderer.invoke("scanLibrary");
      },
      remove(dir) {
        this.folders = this.folders.filter((item) => item !== dir);
        this.$root.cfg.libraryPrefs.localPaths = this.folders;
        ipcRenderer.invoke("scanLibrary");
      },
    },
  });
  return (
    <div id="pathmenu">
      <div
        className="spatialproperties-panel castmenu pathmenu modal-fullscreen"
        clickself="close()"
        contextmenuself="close()">
        <div className="modal-window">
          <div className="modal-header">
            <div className="modal-title">{"Edit Paths"}</div>
            <button
              className="close-btn"
              click="close()"
              aria-label="$root.getLz('action.close')"></button>
          </div>
          <div className="modal-content">
            <template v-for="folder of folders">
              <div className="md-option-line">
                <div className="md-option-segment">{folder}</div>
                <div className="md-option-segment md-option-segment_auto">
                  <button
                    className="md-btn"
                    click="remove(folder)">
                    {"Remove"}
                  </button>
                </div>
              </div>
            </template>
            <div className="md-option-line">
              <div className="md-option-segment md-option-segment_auto">
                <button
                  className="md-btn"
                  click="add()">
                  {"Add Path"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
