import { AnimatePresence } from "framer-motion";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";

const Component = ({ data, title, type = "artists" }: { data: object; title?: string; type?: string }) => {
  const app = this.$root;
  let triggerEnabled = true;
  let canSeeTrigger = false;
  let showFab = false;
  let commonKind = "song";
  let api = this.$root.mk.api;
  let loading = false;
  function getClasses() {
    if ((data?.data?.length ?? 0) > 0) {
      let item = data.data[0];
      if (typeof item.kind !== "undefined") {
        commonKind = item.kind;
        return item.kind;
      }
      if (typeof item.attributes.playParams !== "undefined") {
        commonKind = item.attributes.playParams.kind;
        return item.attributes.playParams.kind;
      }
      if (commonKind !== "song") {
        return "collection-list-square";
      } else {
        return "";
      }
    } else {
      return "";
    }
  }
  function getKind(item) {
    if (typeof item.kind !== "undefined") {
      //  commonKind = item.kind;
      return item.kind;
    }
    if (typeof item.attributes.playParams !== "undefined") {
      //  commonKind = item.attributes.playParams.kind
      return item.attributes.playParams.kind;
    }
    return commonKind;
  }
  function scrollToTop() {
    let target = document.querySelector(".header-text");
    document.querySelector("#app-content").scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
  function getNext() {
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
  }
  function headerVisibility(isVisible, entry) {
    if (isVisible) {
      showFab = false;
    } else {
      showFab = true;
    }
  }
  function visibilityChanged(isVisible, entry) {
    if (isVisible) {
      canSeeTrigger = true;
      getNext();
    } else {
      canSeeTrigger = false;
    }
  }
  return (
    <div id="cider-collection-list">
      <div className="content-inner collection-page">
        <h3
          className="header-text"
          v-observe-visibility={{ callback: headerVisibility }}>
          {title}
        </h3>
        <div
          v-if={data["data"] !== "null"}
          className={"well itemContainer " + getClasses()}>
          {data.data.map((item, key) =>
            item.type === "artists" ? (
              <MediaItemSquare item={item} />
            ) : getKind(item) === "song" ? (
              <MediaItemListItem
                index={key}
                item={item}
              />
            ) : (
              <MediaItemSquare
                item={item}
                type={getKind(item)}
              />
            ),
          )}
          <button
            v-if={triggerEnabled}
            style={{ opacity: 0, height: "32px" }}
            v-observe-visibility={{ callback: visibilityChanged }}>
            {app.getLz("term.showMore")}
          </button>
        </div>
        <AnimatePresence>
          <motion.div name="fabfade">
            <button
              className="top-fab"
              v-show={showFab}
              onClick={() => scrollToTop()}
              aria-label={app.getLz("action.scrollToTop")}>
              {import("../svg/arrow-up.svg")}
            </button>
          </motion.div>
        </AnimatePresence>
        <div
          className="well itemContainer"
          v-show={loading}>
          <div className="spinner" />
        </div>
      </div>
    </div>
  );
};
