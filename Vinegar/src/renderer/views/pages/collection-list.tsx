import { AnimatePresence, motion } from "framer-motion";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import { useOnInView } from "react-intersection-observer";

const Component = ({ data, title, type = "artists" }: { data: object; title?: string; type?: string }) => {
  const app = this.$root;
  let triggerEnabled = true;
  let canSeeTrigger = false;
  let showFab = false;
  let commonKind = "song";
  const api = this.$root.mk.api;
  let loading = false;
  function getClasses() {
    if ((data?.data?.length ?? 0) > 0) {
      const item = data.data[0];
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
    const target = document.querySelector(".header-text");
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
  const headerRef = useOnInView(headerVisibility);
  function visibilityChanged(isVisible, entry) {
    if (isVisible) {
      canSeeTrigger = true;
      getNext();
    } else {
      canSeeTrigger = false;
    }
  }
  const buttonRef = useOnInView(visibilityChanged);
  return (
    <div id={"cider-collection-list"}>
      <div className={"content-inner collection-page"}>
        <h3
          className={"header-text"}
          ref={headerRef}>
          {title}
        </h3>
        {data["data"] !== "null" && (
          <div className={"well itemContainer " + getClasses()}>
            {data.data.map((item, key) =>
              item.type === "artists" ? (
                <MediaItemSquare
                  key={key}
                  item={item}
                />
              ) : getKind(item) === "song" ? (
                <MediaItemListItem
                  key={key}
                  index={key}
                  item={item}
                />
              ) : (
                <MediaItemSquare
                  key={key}
                  item={item}
                  type={getKind(item)}
                />
              ),
            )}
            {triggerEnabled && (
              <button
                style={{ opacity: 0, height: "32px" }}
                ref={buttonRef}>
                {app.getLz("term.showMore")}
              </button>
            )}
          </div>
        )}
        <AnimatePresence>
          <motion.div name={"fabfade"}>
            <button
              className={"top-fab"}
              style={{ display: showFab ? "inherit" : "none" }}
              onClick={() => scrollToTop()}
              aria-label={app.getLz("action.scrollToTop")}>
              {import("../svg/arrow-up.svg")}
            </button>
          </motion.div>
        </AnimatePresence>
        <div
          className={"well itemContainer"}
          style={{ display: loading ? "inherit" : "none" }}>
          <div className={"spinner"} />
        </div>
      </div>
    </div>
  );
};
