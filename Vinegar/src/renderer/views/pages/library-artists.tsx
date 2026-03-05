import { useEffect } from "react";
import MediaItemArtwork from "../components/MediaItemArtwork.jsx";
import LibraryArtistItem from "../components/libraryartist-item.jsx";
import InlineCollectionList from "../components/inline-collection-list.jsx";

const Component = () => {
  const app = this.$root;
  let library = this.$root.library;
  let ciderPodcasts = [];
  let podcasts = [];
  let episodes = [];
  let search = {
    term: "",
    loading: false,
    results: [],
    resultsLibrary: [],
    next: "",
  };
  let podcastSelected = {
    id: -1,
  };
  let selected = {
    id: -1,
  };
  let collectionList = {
    response: null,
    title: null,
    type: null,
    requestBody: null,
  };
  let clresponse = [];
  let clready = false;
  let cltitle = "";
  let cltype = "artists";

  function mounted() {
    this.$root.getLibraryArtistsFull(null, 0);
    this.$root.$on("ap-inlinecollection", function (e) {
      console.log("hey", e);
      clready = true;
      clresponse = e.response;
      cltitle = e.title ?? "";
      cltype = e.type;
    });
  }
  useEffect(() => {
    mounted();
  }, []);
  function getInlineCollection(e) {
    console.log("hey", e);
  }
  return (
    <div id="cider-library-artists">
      <div className="content-inner library-artists-page">
        {/* <div className="row">
                <div className="col" style={{padding:0}}>
                    <h1 className="header-text">{$root.getLz('term.artists')}</h1>
                </div>

            </div>  */}
        <div className="inner-container">
          <div className="list-container">
            <div
              className="col"
              style={{ padding: 0 }}>
              <div
                className="search-input-container"
                style={{ width: "calc('100%', '-20px')", margin: "16px 10px 10px 10px" }}>
                <div className="search-input--icon" />
                <input
                  type="search"
                  style={{ width: "100%" }}
                  spellCheck="false"
                  placeholder={$root.getLz("term.search") + "..."}
                  input={$root.searchLibraryArtists}
                  v-model={library.artists.search}
                  className="search-input"
                />
              </div>
            </div>
            <div className="podcasts-list">
              <LibraryArtistItem
                show-duration="false"
                show-meta-data="true"
                show-library-status="false"
                item={item}
                v-for={item in library.artists.displayListing}
              />
            </div>
          </div>
          <div className="episodes-list">
            <div
              className="episodes-inline-info"
              v-if={clready}>
              <InlineCollectionList
                parentSelector="'.episodes-list'"
                data="clresponse"
                type="cltype"
                title="cltitle"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Component2 = ({ item, parent, index = -1, showArtwork = true, showLibraryStatus = true, showMetadata = false, showDuration = true, contextExt }: { item: Object; parent?: String; index?: Number; showArtwork?: Boolean; showLibraryStatus?: Boolean; showMetadata?: Boolean; showDuration?: Boolean; contextExt?: Object }) => {
  let isVisible = false;
  let addedToLibrary = false;
  let guid = uuidv4();
  const app = this.$root;
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  }
  function msToMinSec(ms) {
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
  function getDataType() {
    return item.type;
  }
  async function select(e) {
    let u = item;
    let u1 = await app.mk.api.v3.music(`/v1/me/library/artists/${u.id}/albums`, {
      platform: "web",
      "include[library-albums]": "artists,tracks",
      "include[library-artists]": "catalog",
      "fields[artists]": "url",
      includeOnly: "catalog,artists",
    });
    showCollection({ data: Object.assign({}, u1.data.data) }, u.attributes.name ?? "", "");
    //app.select_selectMediaItem(u.id, getDataType(), index, guid, true)
  }
  function showCollection(response, title, type, requestBody = {}) {
    this.$root.$emit("ap-inlinecollection", {
      response: response,
      title: title,
      type: type,
      requestBody: {},
    });
  }
  function getArtwork() {
    let u = "";
    try {
      u = item.relationships.catalog.data[0].attributes.artwork.url;
    } catch (e) {}
    return u;
  }
  function contextMenu(event) {
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
          // Hidden for now, as it's not implemented yet
          /*{
              "icon": "./assets/feather/share.svg",
              "name": app.getLz('action.share'),
              "action": function () {
                  if (!item.attributes.url && item.relationships){
                      if (item.relationships.catalog){
                          app.mkapi(item.attributes.playParams.kind, false, item.relationships.catalog.data[0].id).then(u => {app.copyToClipboard((u.data.data.length && u.data.data.length > 0)? u.data.data[0].attributes.url : u.data.data.attributes.url)})
                      }
                  } else {
                  app.copyToClipboard(item.attributes.url)}
              }
          },*/
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
  }
  function visibilityChanged(isVisible, entry) {
    isVisible = isVisible;
  }
  function addToLibrary() {
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
  }
  async function removeFromLibrary() {
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
  }
  function playTrack() {
    let item = item;
    let parent = parent;
    let childIndex = index;
    console.log(item, parent, childIndex);
    if (parent !== null && childIndex !== null) {
      app.queueParentandplayChild(parent, childIndex, item);
    } else {
      app.playMediaItemById(item.attributes.playParams.id ?? item.id, item.attributes.playParams.kind ?? item.type, item.attributes.playParams.isLibrary ?? false, item.attributes.url);
    }
  }
  return (
    <div id="libraryartist-item">
      <div
        v-observe-visibility="{callback: visibilityChanged}"
        onClick={() => select}
        className={`cd-mediaitem-list-item ${app.select_hasMediaItem(guid) ? "mediaitem-selected" : ""}`}
        onContextMenu={contextMenu}>
        <template v-if={isVisible}>
          <div
            className="artwork"
            v-if={showArtwork === true}>
            <MediaItemArtwork
              url={getArtwork()}
              size="50"
              type={item.type}
            />
          </div>
          <div
            className="info-rect"
            style={{ paddingLeft: showArtwork ? "" : "16px" }}
            onDoubleClick={select}>
            <div className="title text-overflow-elipsis">{item.attributes.name}</div>
          </div>
        </template>
      </div>
    </div>
  );
};
