import classNames from "classnames";
import SVGIcon from "../../main/components/svg-icon.jsx";
import { useEffect } from "react";
import MusicKit from "@musickit-js";
import { useTranslation } from "react-i18next";

const SidebarPlaylist = ({ item, playlistSelect, relateMediaItems = [] }: { item: MusicKit.MediaItem; playlistSelect?: (playlist: object) => void; relateMediaItems?: string[] }) => {
  const { t } = useTranslation();
  let folderOpened = false;
  let children = [];
  const playlistRoot = "p.playlistsroot";
  let renaming = false;
  let icon = "";
  let hasRelatedMediaItems = false;

  useEffect(() => {
    if (item.type !== "library-playlist-folders") {
      icon = "./assets/feather/list.svg";
    } else {
      icon = "./assets/feather/folder.svg";
    }
    const playlistMap = $root.playlists.trackMapping;
    if (relateMediaItems.length !== 0) {
      if (playlistMap[relateMediaItems[0]]) {
        if (playlistMap[relateMediaItems[0]].includes(item.id)) {
          hasRelatedMediaItems = true;
        }
      }
    }
  }, []);
  function clickEvent() {
    if (item.type !== "library-playlist-folders") {
      if (playlistSelect) {
        playlistSelect(item);
      } else {
        openPlaylist(item);
      }
    } else {
      getPlaylistChildren(item);
    }
  }
  function rename() {
    renaming = false;

    if (item.type === "library-playlist-folders") {
      $root.editPlaylistFolder(item.id, item.attributes.name);
    } else {
      $root.editPlaylist(item.id, item.attributes.name);
    }
  }
  function getChildren() {
    children = $root.playlists.listing.filter((child) => {
      if (child.parent === item.id) {
        return child;
      }
    });
  }
  async function move(item, sendTo) {
    const type = item.type.replace("library-", "");
    const typeTo = sendTo.type;
    $root.mk.api.v3.music(
      `/v1/me/library/${type}/${item.id}/parent`,
      {},
      {
        fetchOptions: {
          method: "PUT",
          body: JSON.stringify({
            data: [
              {
                id: sendTo.id,
                type: typeTo,
              },
            ],
          }),
        },
      },
    );

    // find the item in $root.playlists.listing and store it in a variable
    $root.playlists.listing.filter((playlist) => {
      if (playlist.id === item.id) {
        console.log(playlist);
        playlist.parent = sendTo.id;
      }
    });
    if (typeof $root.getChildren === "function") {
      $root.getChildren();
      console.log($root.children);
    }
    await getChildren();
    $root.sortPlaylists();
    // await $root.refreshPlaylists()
  }
  function playlistContextMenu(event, playlist_id) {
    const menu = {
      items: {
        moveToParent: {
          name: t("action.moveToTop"),
          action: () => {
            move(item, {
              id: playlistRoot,
              type: "library-playlist-folders",
            });
            setTimeout(() => {
              getChildren();
            }, 2000);
          },
        },
        rename: {
          name: t("action.rename"),
          action: () => {
            renaming = true;
            setTimeout(() => {
              document.querySelector(".pl-rename-field").focus();
              document.querySelector(".pl-rename-field").select();
            }, 100);
          },
        },
        deleteFromPlaylist: {
          name: t("action.removeFromLibrary"),
          action: () => {
            $root.deletePlaylist(playlist_id);
          },
        },
        addToFavorites: {
          name: t("action.addToFavorites"),
          disabled: true,
          hidden: true,
          action: () => {
            addFavorite(playlist_id, "library-playlists");
          },
        },
      },
    };
    if (item.type === "library-playlist-folders") {
      menu.items.addToFavorites.disabled = true;
    }
    app.showMenuPanel(menu, event);
  }
  function dragOver(evt) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
  }
  function onDrop(evt) {
    const data = JSON.parse(evt.dataTransfer.getData("text/plain"));
    evt.preventDefault();
    if (data.id === item.id) {
      return;
    }
    console.log(data);
    if (data) {
      if (item.type === "library-playlists" || item.type === "library-playlist-folders") {
        if (data.type === "library-playlists" && item.type === "library-playlists") {
          return;
        }
        move(data, item);
      }
    }
  }
  function startDrag(evt) {
    evt.dataTransfer.dropEffect = "move";
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData("text/plain", JSON.stringify(item));
  }
  function openPlaylist(item) {
    $root.appRoute(`playlist_` + item.id);
    $root.showingPlaylist = [];
    if (item.id === "ciderlocal") {
      $root.showingPlaylist = {
        id: "ciderlocal",
        type: "library-playlists",
        href: "",
        attributes: {
          artwork: {
            width: null,
            height: null,
            url: "",
            hasP3: false,
          },
          dateAdded: "2021-02-16T03:39:47Z",
          name: "Local Songs",
          canDelete: true,
          hasCatalog: true,
          canEdit: true,
          playParams: {
            id: "ciderlocal",
            kind: "playlist",
            isLibrary: true,
          },
          isPublic: true,
          description: {
            standard: "",
          },
        },
        relationships: {
          tracks: {
            href: "",
            data: $root.library.localsongs,
          },
        },
      };
      $root.playlists.loadingState = 1;
    } else {
      $root.getPlaylistFromID($root.page.substring(9), true);
    }
  }
  function getPlaylistChildren(item) {
    children = [];
    getChildren();
    toggleFolder();

    $root.mk.api.v3.music(`v1/me/library/playlist-folders/${item.id}/children`).then((data) => {
      const children = data.data.data;
      children.forEach((child) => {
        if (!$root.playlists.listing.find((listing) => listing.id === child.id)) {
          child.parent = item.id;
          $root.playlists.listing.push(child);
        }
      });

      $root.playlists.listing.sort((a, b) => {
        if (a.type === "library-playlist-folders" && b.type !== "library-playlist-folders") {
          return -1;
        } else if (a.type !== "library-playlist-folders" && b.type === "library-playlist-folders") {
          return 1;
        } else {
          return 0;
        }
      });
      getChildren();
    });
  }
  function isPlaylistSelected(item) {
    if ($root.showingPlaylist.id === item.id) {
      return ["active"];
    } else {
      return [];
    }
  }
  function toggleFolder() {
    folderOpened = !folderOpened;
  }
  return (
    <div id={"sidebar-playlist"}>
      <div
        className={"sidebar-playlist"}
        key={item.id}>
        <button
          key={item.id}
          className={classNames("app-sidebar-item", "app-sidebar-item-playlist", item.type !== "library-playlist-folders" ? { active: $root.page.includes(item.id) } : ["playlist-folder", { "folder-button-active": folderOpened }, isPlaylistSelected])}
          onContextMenu={(e) => playlistContextMenu(e, item.id)}
          onDragStart={(e) => startDrag(e, item)}
          onDragOver={dragOver}
          onDrop={onDrop}
          href={item.href}
          onClick={() => clickEvent()}>
          {!renaming ? (
            <>
              <SVGIcon
                url={icon}
                name={"sidebar-playlist"}
              />
              {item.attributes.name}
              {hasRelatedMediaItems && <small className={"presentNotice"}>(Track present)</small>}
            </>
          ) : (
            <input
              type={"text"}
              v-model={item.attributes.name}
              className={"pl-rename-field"}
              onBlur={() => rename()}
              onKeyDown={(e) => {
                if (e.key === "enter") rename();
              }}
            />
          )}
        </button>
        {item.type === "library-playlist-folders" && folderOpened && (
          <div className={"folder-body"}>
            {children.length !== 0 ? (
              children.map((item) => (
                <SidebarPlaylist
                  relateMediaItems={relateMediaItems}
                  playlistSelect={playlistSelect}
                  item={item}
                  key={item.id}
                />
              ))
            ) : (
              <div className={"spinner"} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarPlaylist;
