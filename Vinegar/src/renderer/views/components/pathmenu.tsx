export const Component = () => {
  let folders = [];
  function mounted() {
    folders = this.$root.cfg.libraryPrefs.localPaths;
  }
  function close() {
    this.$root.modals.pathMenu = false;
  }
  async function add() {
    const result = await ipcRenderer.invoke("folderSelector");
    for (i of result) {
      if (folders.findIndex((x) => x.startsWith(i)) == -1) {
        folders.push(i);
      }
    }
    this.$root.cfg.libraryPrefs.localPaths = folders;
    ipcRenderer.invoke("scanLibrary");
  }
  function remove(dir) {
    folders = folders.filter((item) => item !== dir);
    this.$root.cfg.libraryPrefs.localPaths = folders;
    ipcRenderer.invoke("scanLibrary");
  }
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
              onClick={() => close()}
              aria-label="$root.getLz('action.close')"></button>
          </div>
          <div className="modal-content">
            <template v-for="folder of folders">
              <div className="md-option-line">
                <div className="md-option-segment">{folder}</div>
                <div className="md-option-segment md-option-segment_auto">
                  <button
                    className="md-btn"
                    onClick={() => remove(folder)}>
                    {"Remove"}
                  </button>
                </div>
              </div>
            </template>
            <div className="md-option-line">
              <div className="md-option-segment md-option-segment_auto">
                <button
                  className="md-btn"
                  onClick={() => add()}>
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
