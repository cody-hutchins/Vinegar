const InlineCollectionList = ({ data, title, type, parentSelector = null }: { data: object; title?: string; type?: string; parentSelector?: string | null }) => {
  let triggerEnabled = true;
  let canSeeTrigger = false;
  let showFab = false;
  let commonKind = "song";
  let loading = false;
  const api = this.$root.mk.api;
  const app = this.$root;

  const getKind = (item) => {
    if (typeof item.kind !== "undefined") {
      commonKind = item.kind;
      return item.kind;
    }
    if (typeof item.attributes.playParams !== "undefined") {
      commonKind = item.attributes.playParams.kind;
      return item.attributes.playParams.kind;
    }
    return commonKind;
  };
  const scrollToTop = () => {
    let target = document.querySelector(".header-text");
    document.querySelector(parentSelector ?? ".collection-page").scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };
  const getNext = () => {
    if (typeof data.next === "undefined") {
      return;
    }
    loading = true;

    api.v3.music(data.next, app.collectionList.requestBody).then((response) => {
      console.log(response);
      if (!app.collectionList.response.groups) {
        data.data = data.data.concat(response.data.data);
        if (response.data.next) {
          data.next = response.data.next;
          triggerEnabled = true;
        }
        loading = false;
      } else {
        if (!response.data.results[app.collectionList.response.groups]) {
          loading = false;
          return;
        }
        data.data = data.data.concat(response.data.results[app.collectionList.response.groups].data);
        if (response.data.results[app.collectionList.response.groups].next) {
          data.next = response.data.results[app.collectionList.response.groups].next;
          triggerEnabled = true;
          loading = false;
        }
      }
    });
  };
  const headerVisibility = (isVisible, entry) => {
    if (isVisible) {
      showFab = false;
    } else {
      showFab = true;
    }
  };
  const visibilityChanged = (isVisible, entry) => {
    if (isVisible) {
      canSeeTrigger = true;
      getNext();
    } else {
      canSeeTrigger = false;
    }
  };
  return (
    <div id="inline-collection-list">
      <div className="collection-page">
        <h3
          className="header-text"
          v-observe-visibility="{callback: headerVisibility}">
          {title}
        </h3>
        <div
          v-if={data["data"] !== "null"}
          className="well itemContainer">
          <template v-for={(item, key) in data.data}>
            <template v-if={item.type === "artists"}>
              <MediaItemSquare item={item} />
            </template>
            <template v-else>
              <MediaItemListItem
                v-if={getKind(item) === "song"}
                index="key"
                item={item}
              />
              <MediaItemSquare
                v-else
                item={item}
                type="getKind(item)"
              />
            </template>
          </template>
          <button
            v-if={triggerEnabled}
            style={{ opacity: 0, height: "32px" }}
            v-observe-visibility="{callback: visibilityChanged}">
            {app.getLz("term.showMore")}
          </button>
        </div>
        <transition name="fabfade">
          <button
            className="top-fab"
            v-show={showFab}
            onClick={() => scrollToTop()}
            aria-label={app.getLz("action.scrollToTop")}>
            {import("../svg/arrow-up.svg")}
          </button>
        </transition>
        <div
          className="well itemContainer"
          v-show={loading}>
          <div className="spinner" />
        </div>
      </div>
    </div>
  );
};

export default InlineCollectionList;
