export const Component = () => {
  Vue.component("mediaitem-mvview-sp", {
    template: "#mediaitem-mvview-sp",
    props: ["item", "imagesize", "badge"],
    data: function () {
      return {
        app: this.$root,
      };
    },
    methods: {
      log(item) {
        console.log(item);
      },
    },
  });
  return (
    <div id="mediaitem-mvview-sp">
      <div
        v-if="(item.attributes?.editorialArtwork?.subscriptionHero?.url ?? item.attributes?.artwork?.url ?? '') !='' "
        style={{ position: "relative", display: "inline-flex" }}>
        <div
          clickself="log(item);app.routeView(item)"
          className="cd-mediaitem-mvview">
          <div style={{ height: "70px", minHeight: "70px", maxHeight: "70px", width: "100%", marginLeft: "5px" }}>
            <div
              className="title-browse-sp bold "
              click="log(item);app.routeView(item)"
              style={{ color: "darkgrey" }}>
              {badge ? badge?.designBadge : ""}
            </div>
            <div className="title-browse-sp ">{badge != null && badge?.designTag != null ? badge?.designTag : (item.attributes?.name ?? "")}</div>
            <div
              className="title-browse-sp semibold"
              style={{ color: "darkgrey" }}>
              {item?.attributes?.artistName ?? item?.attributes?.curatorName ?? ""}
            </div>
          </div>
          <div className="artwork">
            <mediaitem-artwork
              url="item.attributes?.editorialArtwork?.subscriptionHero?.url ?? item.attributes?.artwork?.url"
              video="(item.attributes != null && item.attributes?.editorialVideo != null) ? (item.attributes?.editorialVideo?.motionDetailSquare ? item.attributes?.editorialVideo?.motionDetailSquare?.video : (item.attributes?.editorialVideo?.motionSquareVideo1x1 ? item?.attributes?.editorialVideo?.motionSquareVideo1x1?.video : '')) : '' "
              size="516"
              width="900"></mediaitem-artwork>
          </div>
          <div
            className="cd-mediaitem-mvview-overlay"
            clickself="log(item);app.routeView(item)">
            <div
              className="button"
              style={{ ...(!(item.attributes?.playParams ? (item.attributes?.playParams?.kind ?? item.type ?? "") : (item.type ?? "")).includes("radioStation") && !(item.attributes?.playParams ? (item.attributes?.playParams?.kind ?? item.type ?? "") : (item.type ?? "")).includes("song") ? { margin: "205px", marginLeft: "260px", marginBottom: "140px", width: "30px", height: "30px" } : { margin: "205px", marginLeft: "260px", marginBottom: "140px", width: "30px", height: "30px" }), borderRadius: "50%", background: "rgba(50,50,50,0.7)" }}
              click="app.playMediaItem(item)">
              {import("../svg/play.svg")}
            </div>
          </div>
        </div>
        <div
          className="cd-mediaitem-mvview-overlay"
          clickself="log(item);app.routeView(item)"
          tabindex="0">
          <div
            className="button"
            style={{ ...(!(item.attributes?.playParams ? (item.attributes?.playParams?.kind ?? item.type ?? "") : (item.type ?? "")).includes("radioStation") && !(item.attributes?.playParams ? (item.attributes?.playParams?.kind ?? item.type ?? "") : (item.type ?? "")).includes("song") ? { margin: "205px", marginLeft: "260px", marginBottom: "140px", width: "30px", height: "30px" } : { margin: "205px", marginLeft: "260px", marginBottom: "140px", width: "30px", height: "30px" }), borderRadius: "50%", background: "rgba(50,50,50,0.7)" }}
            click="app.playMediaItem(item)">
            {import("../svg/play.svg")}
          </div>
        </div>
      </div>
    </div>
  );
};
