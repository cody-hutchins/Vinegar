import { useEffect, useMemo } from "react";

const Component = () => {
  let loading = false;
  let firstRoute = `/v1/me/library/recently-added?l=${app.mklang}&platform=web&include[library-albums]=artists&include[library-artists]=catalog&fields[artists]=url&fields%5Balbums%5D=artistName%2CartistUrl%2Cartwork%2CcontentRating%2CeditorialArtwork%2Cname%2CplayParams%2CreleaseDate%2Curl&includeOnly=catalog%2Cartists&limit=25`;
  const items = useMemo(() => {
    return this.$store.state.pageState["recentlyAdded"].items;
  }, [this.$store.state.pageState]);
  const nextUrl = useMemo(() => {
    return this.$store.state.pageState["recentlyAdded"].nextUrl;
  }, [this.$store.state.pageState]);
  const itemSize = useMemo(() => {
    return this.$store.state.pageState["recentlyAdded"].size;
  }, [this.$store.state.pageState]);

  async function mounted() {
    if (this.$store.state.pageState["recentlyAdded"].items.length !== 0) return;

    const firstResult = await app.mk.api.v3.music(firstRoute);
    this.$store.state.pageState["recentlyAdded"].items = firstResult.data.data;
    this.$store.state.pageState["recentlyAdded"].nextUrl = firstResult.data.next;
  }

  function beforeDestroy() {
    // this.$store.state.pageState["recently-added"].scrollPosY = $("#app-content").scrollTop()
  }

  useEffect(() => {
    mounted();
    return beforeDestroy;
  }, []);

  function visibilityChanged(isVisible, entry) {
    if (isVisible && !loading) {
      getNextData();
    }
  }

  async function getNextData() {
    if (this.$store.state.pageState["recentlyAdded"].nextUrl) {
      loading = true;
      const nextResult = await app.mk.api.v3.music(this.$store.state.pageState["recentlyAdded"].nextUrl);
      this.$store.state.pageState["recentlyAdded"].items = this.$store.state.pageState["recentlyAdded"].items.concat(nextResult.data.data);
      if (nextResult.data.next) {
        this.$store.state.pageState["recentlyAdded"].nextUrl = nextResult.data.next;
      } else {
        this.$store.state.pageState["recentlyAdded"].nextUrl = null;
      }
      loading = false;
    }
    return;
  }

  return (
    <div id="cider-recentlyadded">
      <div className="content-inner">
        <h1 className="header-text">{$root.getLz("term.recentlyAdded")}</h1>
        <div
          className="well itemContainer collection-list-square"
          v-if={itemSize === "normal"}>
          <MediaItemSquare
            v-for={item in items}
            item={item}
            v-bind:key={item.id}
          />
        </div>
        <div
          className="well itemContainer collection-list-square"
          v-else={itemSize === "compact"}>
          <MediaItemListItem
            show-meta-data="true"
            show-library-status="false"
            v-for={item in items}
            item={item}
            v-bind:key={item.id}
          />
        </div>
        <div
          className="well itemContainer collection-list-square"
          v-show={loading}>
          <div className="spinner" />
        </div>
        <button
          v-if={nextUrl && !loading}
          style={{ opacity: 0, height: "32px" }}
          v-observe-visibility="{callback: visibilityChanged}">
          {$root.getLz("term.showMore")}
        </button>
      </div>
    </div>
  );
};
