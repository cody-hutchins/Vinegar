const PluginMenu = () => {
  const app = this.$root;
  function closeMenu() {
    app.modals.pluginMenu = false;
  }
  return (
    <div id="plugin-menu">
      <div
        className="modal-fullscreen addtoplaylist-panel"
        clickself={app.resetState()}
        contextmenuself={app.resetState()}>
        <div className="modal-window">
          <div className="modal-header">
            <div className="modal-title">{$root.getLz("term.pluginMenu")}</div>
            <button
              className="close-btn"
              onClick={() => app.resetState()}
              aria-label={app.getLz("action.close")}
            />
          </div>
          <div className="modal-content">
            <span
              className="playlist-item"
              v-if={!app.pluginInstalled}>
              <span className="icon">{import("../svg/x.svg")}</span>
              <span
                className="name"
                style={{ top: "0.5px" }}>
                {$root.getLz("term.pluginMenu.none")}
              </span>
            </span>
            {app.pluginMenuEntries.map((entry) => (
              <button
                className="playlist-item"
                onClick={() => {
                  entry.onClick();
                  closeMenu();
                }}>
                <span className="icon">{import("../svg/grid.svg")}</span>
                <span
                  className="name"
                  style={{ top: "0.5px" }}>
                  {entry.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginMenu;
