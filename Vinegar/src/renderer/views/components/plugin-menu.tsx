import { useTranslation } from "react-i18next";

const PluginMenu = () => {
  const { t } = useTranslation();
  const app = this.$root;
  function closeMenu() {
    app.modals.pluginMenu = false;
  }
  return (
    <div id={"plugin-menu"}>
      <div
        className={"modal-fullscreen addtoplaylist-panel"}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            app.resetState();
          }
        }}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) {
            app.resetState();
          }
        }}>
        <div className={"modal-window"}>
          <div className={"modal-header"}>
            <div className={"modal-title"}>{t("term.pluginMenu")}</div>
            <button
              className={"close-btn"}
              onClick={() => app.resetState()}
              aria-label={t("action.close")}
            />
          </div>
          <div className={"modal-content"}>
            {!app.pluginInstalled && (
              <span className={"playlist-item"}>
                <span className={"icon"}>{import("../svg/x.svg")}</span>
                <span
                  className={"name"}
                  style={{ top: "0.5px" }}>
                  {t("term.pluginMenu.none")}
                </span>
              </span>
            )}
            {app.pluginMenuEntries.map((entry) => (
              <button
                key={entry.id}
                className={"playlist-item"}
                onClick={() => {
                  entry.onClick();
                  closeMenu();
                }}>
                <span className={"icon"}>{import("../svg/grid.svg")}</span>
                <span
                  className={"name"}
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
