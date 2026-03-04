import SVGIcon from "../../main/components/svg-icon.jsx";

const SidebarPlaylist = ({ item, playlistSelect, relateMediaItems = [] }: { item: object; playlistSelect: () => void; relateMediaItems: string[] }) => {
  let folderOpened = false;
  let children = [];
  let playlistRoot = "p.playlistsroot";
  let renaming = false;
  let icon = "";
  let hasRelatedMediaItems = false;

  async function mounted() {
    if (item.type !== "library-playlist-folders") {
      icon = "./assets/feather/list.svg";
    } else {
      icon = "./assets/feather/folder.svg";
    }
    let playlistMap = this.$root.playlists.trackMapping;
    if (relateMediaItems.length != 0) {
      if (playlistMap[relateMediaItems[0]]) {
        if (playlistMap[relateMediaItems[0]].includes(item.id)) {
          hasRelatedMediaItems = true;
        }
      }
    }
  }
  function clickEvent() {
    if (item.type != "library-playlist-folders") {
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
      this.$root.editPlaylistFolder(item.id, item.attributes.name);
    } else {
      this.$root.editPlaylist(item.id, item.attributes.name);
    }
  }
  async function getChildren() {
    children = this.$root.playlists.listing.filter((child) => {
      if (child.parent == item.id) {
        return child;
      }
    });
  }
  async function move(item, sendTo) {
    let type = item.type.replace("library-", "");
    let typeTo = sendTo.type;
    this.$root.mk.api.v3.music(
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

    // find the item in this.$root.playlists.listing and store it in a variable
    this.$root.playlists.listing.filter((playlist) => {
      if (playlist.id == item.id) {
        console.log(playlist);
        playlist.parent = sendTo.id;
      }
    });
    if (typeof this.$root.getChildren == "function") {
      this.$root.getChildren();
      console.log(this.$root.children);
    }
    await getChildren();
    this.$root.sortPlaylists();
    // await this.$root.refreshPlaylists()
  }
  function playlistContextMenu(event, playlist_id) {
    let menu = {
      items: {
        moveToParent: {
          name: this.$root.getLz("action.moveToTop"),
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
          name: this.$root.getLz("action.rename"),
          action: () => {
            renaming = true;
            setTimeout(() => {
              document.querySelector(".pl-rename-field").focus();
              document.querySelector(".pl-rename-field").select();
            }, 100);
          },
        },
        deleteFromPlaylist: {
          name: this.$root.getLz("action.removeFromLibrary"),
          action: () => {
            this.$root.deletePlaylist(playlist_id);
          },
        },
        addToFavorites: {
          name: this.$root.getLz("action.addToFavorites"),
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
    let data = JSON.parse(evt.dataTransfer.getData("text/plain"));
    evt.preventDefault();
    if (data.id == item.id) {
      return;
    }
    console.log(data);
    if (data) {
      if (item.type == "library-playlists" || item.type == "library-playlist-folders") {
        if (data.type == "library-playlists" && item.type == "library-playlists") {
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
    this.$root.appRoute(`playlist_` + item.id);
    this.$root.showingPlaylist = [];
    if (item.id == "ciderlocal") {
      this.$root.showingPlaylist = {
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
            data: this.$root.library.localsongs,
          },
        },
      };
      this.$root.playlists.loadingState = 1;
    } else {
      this.$root.getPlaylistFromID(this.$root.page.substring(9), true);
    }
  }
  function getPlaylistChildren(item) {
    children = [];
    getChildren();
    toggleFolder();

    this.$root.mk.api.v3.music(`v1/me/library/playlist-folders/${item.id}/children`).then((data) => {
      let children = data.data.data;
      children.forEach((child) => {
        if (!$root.playlists.listing.find((listing) => listing.id == child.id)) {
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
    if (this.$root.showingPlaylist.id == item.id) {
      return ["active"];
    } else {
      return [];
    }
  }
  function toggleFolder() {
    folderOpened = !folderOpened;
  }
  return (
    <div id="sidebar-playlist">
      <div
        className="sidebar-playlist"
        key="item.id">
        <button
          className="app-sidebar-item app-sidebar-item-playlist"
          key="item.id"
          className="item.type != 'library-playlist-folders' ? {'active': $root.page.includes(item.id)} : ['playlist-folder', {'folder-button-active': folderOpened}, isPlaylistSelected]"
          contextmenu="playlistContextMenu($event, item.id)"
          dragstart="startDrag($event, item)"
          dragover="dragOver"
          drop="onDrop"
          href="item.href"
          onClick={() => clickEvent()}>
          <template v-if="!renaming">
            <SVGIcon
              url="icon"
              name="sidebar-playlist"
            />
            {item.attributes.name}
            <small
              className="presentNotice"
              v-if="hasRelatedMediaItems">
              (Track present)
            </small>
          </template>
          <input
            type="text"
            v-model="item.attributes.name"
            className="pl-rename-field"
            blur="rename()"
            keydownenter="rename()"
            v-else
          />
        </button>
        <div
          className="folder-body"
          v-if="item.type === 'library-playlist-folders' && folderOpened">
          <template v-if="children.length != 0">
            <SidebarPlaylist
              v-for="item in children"
              relate-media-items="relateMediaItems"
              playlist-select="playlistSelect"
              item="item"
              v-bind:key="item.id"
            />
          </template>
          <template v-else>
            <div className="spinner" />
          </template>
        </div>
      </div>
    </div>
  );
};

export default SidebarPlaylist;
