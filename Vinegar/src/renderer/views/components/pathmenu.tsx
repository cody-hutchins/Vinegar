import { ipcRenderer } from "electron";
import { useEffect } from "react";

const PathMenu = () => {
  let folders = [];
  function mounted() {
    folders = this.$root.cfg.libraryPrefs.localPaths;
  }
  useEffect(() => {
    mounted();
  }, [])
  function close() {
    this.$root.modals.pathMenu = false;
  }
  async function add() {
    const result = await ipcRenderer.invoke("folderSelector");
    for (const i of result) {
      if (folders.findIndex((x) => x.startsWith(i)) === -1) {
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
        clickself={close()}
        contextmenuself={close()}>
        <div className="modal-window">
          <div className="modal-header">
            <div className="modal-title">{"Edit Paths"}</div>
            <button
              className="close-btn"
              onClick={() => close()}
              aria-label={$root.getLz('action.close')}
            />
          </div>
          <div className="modal-content">
            {folders.map((folder) =>
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
           )}
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

export default PathMenu;
