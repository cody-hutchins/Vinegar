import SidebarPlaylist from "./sidebar-playlist.jsx";
import { useAppStore } from "../../store/app.slice.js";
import { useTranslation } from "react-i18next";

const AddToPlaylistPanel = ({ playlists }: { playlists: string[] }) => {
  const { t } = useTranslation();
  let playlistSorted = [];
  const searchQuery = "";
  let focused = "";
  const app = useAppStore();
  const relateItems = [app.selectedMediaItems[0].id];
  this.$refs.searchInput.focus();
  this.$refs.searchInput.addEventListener("keydown", (e) => {
    if (e.keyCode === 13) {
      if (focused !== "") {
        addToPlaylist(focused);
      }
    }
  });

  const playlistSelect = (playlist) => {
    if (playlist.type !== "library-playlist-folders") {
      addToPlaylist(playlist.id);
    }
  };
  const addToPlaylist = (id) => {
    app.addSelectedToPlaylist(id);
  };
  const search = () => {
    focused = "";
    if (searchQuery === "") {
      playlistSorted = playlists;
    } else {
      playlistSorted = playlists.filter((playlist) => {
        return playlist.attributes.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;
      });
      if (playlistSorted.length === 1) {
        focused = playlistSorted[0].id;
      }
    }
  };

  return (
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
          <div className={"modal-title"}>{t("action.addToPlaylist")}</div>
          <button
            className={"close-btn"}
            onClick={app.resetState}
            aria-label={t("action.close")}
          />
        </div>
        <div className={"modal-content"}>
          <button
            className={"playlist-item"}
            onClick={app.addSelectedToNewPlaylist()}
            style={{ width: "100%" }}>
            <div className={"icon"}>{import("../svg/plus.svg")}</div>
            <div className={"name"}>{t("action.createPlaylist")}</div>
          </button>
          {$root.getPlaylistFolderChildren("p.playlistsroot").map((item) => (
            <SidebarPlaylist
              playlist-select={playlistSelect}
              relate-media-items={relateItems}
              key={item.id}
              item={item}
            />
          ))}
        </div>
        <div className={"modal-search"}>
          <div
            className={"search-input-container"}
            style={{ width: "100%", margin: "16px 0" }}>
            <div className={"search-input--icon"} />
            <input
              type={"search"}
              ref={"searchInput"}
              style={{ width: "100%" }}
              spellCheck={false}
              placeholder={t("term.search") + "..."}
              v-model={searchQuery}
              onInput={() => search()}
              className={"search-input"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistPanel;
