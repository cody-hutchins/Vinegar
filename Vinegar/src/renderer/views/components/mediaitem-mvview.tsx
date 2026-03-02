export const Component = ({item, imagesize}: {item: object, imagesize: number}) => {
  const app = this.$root;
  return (
    <div id="mediaitem-mvview">
      <template>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <div
            clickself="app.routeView(item)"
            className="cd-mediaitem-mvview">
            <div className="artwork">
              <mediaitem-artwork
                url="item.attributes.artwork ? item.attributes.artwork.url : ''"
                video="(item.attributes != null && item.attributes.editorialVideo != null) ? (item.attributes.editorialVideo.motionDetailSquare ? item.attributes.editorialVideo.motionDetailSquare.video : (item.attributes.editorialVideo.motionSquareVideo1x1 ? item.attributes.editorialVideo.motionSquareVideo1x1.video : '')) : '' "
                size={imagesize ?? 300}></mediaitem-artwork>
            </div>
            <div
              className="cd-mediaitem-mvview-overlay"
              clickself="app.routeView(item)">
              <div
                className="button"
                style={{ ...(!(item.attributes.playParams ? (item.attributes.playParams.kind ?? item.type ?? "") : (item.type ?? "")).includes("radioStation") && !(item.attributes.playParams ? (item.attributes.playParams.kind ?? item.type ?? "") : (item.type ?? "")).includes("song") ? { margin: "140px", marginLeft: "250px", width: "40px", height: "40px" } : { margin: "35px", marginLeft: "95px", width: "120px", height: "120px" }), borderRadius: "50%", background: "rgba(50,50,50,0.7)" }}
                click="app.playMediaItem(item)">
                {import("../svg/play.svg")}
              </div>
            </div>
            <div
              className="title text-overflow-elipsis"
              click="app.routeView(item)">
              {item.attributes.name ?? ""}
            </div>
            <div
              className="subtitle text-overflow-elipsis item-navigate"
              v-if="item.attributes.artistName"
              style={{ zIndex: item.attributes.editorialNotes == null && item.attributes.artistName ? "4" : "" }}
              click="if (item.attributes.artistName)app.searchAndNavigate(item,'artist')">
              {item.attributes.artistName ?? ""}
            </div>
          </div>
          <div
            className="cd-mediaitem-mvview-overlay"
            clickself="app.routeView(item)"
            tabindex="0">
            <div
              className="button"
              style={{ ...(!(item.attributes.playParams ? (item.attributes.playParams.kind ?? item.type ?? "") : (item.type ?? "")).includes("radioStation") && !(item.attributes.playParams ? (item.attributes.playParams.kind ?? item.type ?? "") : (item.type ?? "")).includes("song") ? { margin: "140px", marginLeft: "250px", width: "40px", height: "40px" } : { margin: "35px", marginLeft: "95px", width: "120px", height: "120px" }), borderRadius: "50%", background: "rgba(50,50,50,0.7)" }}
              click="app.playMediaItem(item)">
              {import("../svg/play.svg")}
            </div>
          </div>
        </div>
      </template>
    </div>
  );
};
