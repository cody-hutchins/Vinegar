export const Component = ({ item, parent, index = -1, showArtwork = true, showLibraryStatus = true, showMetadata = false, showDuration = true, contextExt }: { item: object; parent?: string; index?: number; showArtwork?: boolean; showLibraryStatus?: boolean; showMetadata?: boolean; showDuration?: boolean; contextExt?: object }) => {
  const isVisible = false;
  let addedToLibrary = false;
  const guid = uuidv4();
  const app = this.$root;
  const uuidv4 = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  };
  const msToMinSec = (ms) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };
  const getDataType = () => {
    return item.type;
  };
  const select = async (e) => {
    let u = item;
    let u1 = await app.mk.api.v3.music(`/v1/me/library/artists/${u.id}/albums`, {
      platform: "web",
      "include[library-albums]": "artists,tracks",
      "include[library-artists]": "catalog",
      "fields[artists]": "url",
      includeOnly: "catalog,artists",
    });
    app.showCollection({ data: Object.assign({}, u1.data.data) }, u.attributes.name ?? "", "");
    app.select_selectMediaItem(u.id, getDataType(), index, guid, true);
  };
  const getArtwork = () => {
    let u = "";
    try {
      u = item.relationships.catalog.data[0].attributes.artwork.url;
    } catch (e) {}
    return u;
  };
  const contextMenu = (event) => {
    let self = this;
    let data_type = getDataType();

    let item = item;
    item.attributes.artistName = item.attributes.name;

    let useMenu = "normal";
    if (app.selectedMediaItems.length <= 1) {
      app.selectedMediaItems = [];
      app.select_selectMediaItem(item.id, data_type, index, guid, true);
    } else {
      useMenu = "multiple";
    }

    let menus = {
      multiple: {
        items: [], //
      },
      normal: {
        items: [
          {
            name: app.getLz("action.goToArtist"),
            icon: "./assets/feather/user.svg",
            action: function () {
              app.searchAndNavigate(item, "artist");
              console.log(item);
            },
          },
          {
            icon: "./assets/feather/radio.svg",
            name: app.getLz("action.startRadio"),
            action: function () {
              app.mk.setStationQueue({ song: item.attributes.playParams.id ?? item.id }).then(() => {
                app.mk.play();
                app.selectedMediaItems = [];
              });
            },
          },
          {
            icon: "./assets/feather/share.svg",
            name: app.getLz("action.share"),
            action: function () {
              if (!item.attributes.url && item.relationships) {
                if (item.relationships.catalog) {
                  app.mkapi(item.attributes.playParams.kind, false, item.relationships.catalog.data[0].id).then((u) => {
                    app.copyToClipboard(u.data.data.length && u.data.data.length > 0 ? u.data.data[0].attributes.url : u.data.data.attributes.url);
                  });
                }
              } else {
                app.copyToClipboard(item.attributes.url);
              }
            },
          },
        ],
      },
    };
    if (contextExt) {
      // if context-ext.normal is true append all options to the 'normal' menu which is a kvp of arrays
      if (contextExt.normal) {
        menus.normal.items = menus.normal.items.concat(contextExt.normal);
      }
      if (contextExt.multiple) {
        menus.multiple.items = menus.multiple.items.concat(contextExt.multiple);
      }
    }
    //CiderContextMenu.Create(event, menus[useMenu]); // Depreciated Context Menu
    app.showMenuPanel(menus[useMenu], event);
  };
  const visibilityChanged = (_isVisible, entry) => {
    isVisible = _isVisible;
  };
  const addToLibrary = () => {
    let item = item;
    if (item.attributes.playParams.id) {
      console.log("adding to library", item.attributes.playParams.id);
      app.addToLibrary(item.attributes.playParams.id.toString());
      addedToLibrary = true;
    } else if (item.id) {
      console.log("adding to library", item.id);
      app.addToLibrary(item.id.toString());
      addedToLibrary = true;
    }
  };
  const removeFromLibrary = async () => {
    let item = item;
    let params = { "fields[songs]": "inLibrary", "fields[albums]": "inLibrary", relate: "library" };
    let id = item.id ?? item.attributes.playParams.id;
    let res = await app.mkapi(item.attributes.playParams.kind ?? item.type, item.attributes.playParams.isLibrary ?? false, item.attributes.playParams.id ?? item.id, params);
    if (res && res.relationships && res.relationships.library && res.relationships.library.data && res.relationships.library.data.length > 0) {
      id = res.relationships.library.data[0].id;
    }
    let kind = item.attributes.playParams.kind ?? data.item ?? "";
    let truekind = !kind.endsWith("s") ? kind + "s" : kind;
    if (item.attributes.playParams.id) {
      console.log("remove from library", id);
      app.removeFromLibrary(truekind, id);
      addedToLibrary = false;
    } else if (item.id) {
      console.log("remove from library", id);
      app.removeFromLibrary(truekind, id);
      addedToLibrary = false;
    }
  };
  const playTrack = () => {
    let item = item;
    let parent = parent;
    let childIndex = index;
    console.log(item, parent, childIndex);
    if (parent != null && childIndex != null) {
      app.queueParentandplayChild(parent, childIndex, item);
    } else {
      app.playMediaItemById(item.attributes.playParams.id ?? item.id, item.attributes.playParams.kind ?? item.type, item.attributes.playParams.isLibrary ?? false, item.attributes.url);
    }
  };
  return (
    <div id="libraryartist-item">
      <div
        v-observe-visibility="{callback: visibilityChanged}"
        click="select"
        className="cd-mediaitem-list-item"
        className="{'mediaitem-selected': app.select_hasMediaItem(guid)}"
        contextmenu="contextMenu">
        <div
          className="artwork"
          v-show="isVisible"
          v-if="showArtwork == true">
          <mediaitem-artwork
            url="getArtwork()"
            size="50"
            type="item.type"></mediaitem-artwork>
        </div>
        <div
          className="info-rect"
          style={{ paddingLeft: showArtwork ? "" : "16px" }}
          dblclick="app.routeView(item)">
          <div className="title text-overflow-elipsis">{item.attributes.name}</div>
        </div>
      </div>
    </div>
  );
};
