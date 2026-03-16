import MediaItemMVViewSP from "./mediaitem-mvview-sp.jsx";
import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontalMVView = ({ items, imagesize = 16, browsesp = false, kind = "" }: { items: MusicKit.MediaItem[]; imagesize?: number; browsesp?: boolean; kind?: string }) => {
  const app = this.$root;
  return (
    <div
      id={"mediaitem-scroller-horizontal-mvview"}
      style={{ overflowX: "auto", display: "flex", scrollSnapType: "x mandatory" }}>
      {items.map((item) =>
        browsesp ? (
          <MediaItemMVViewSP
            item={(item?.attributes?.kind !== null || item?.attributes?.type === "editorial-elements" ? item : item.relationships && item.relationships.contents ? item.relationships.contents.data[0] : item) ?? item}
            imagesize={imagesize}
            key={item.id}
            badge={item.attributes ?? []}
          />
        ) : (
          <MediaItemSquare
            kind={kind}
            imagesize={imagesize ?? "600"}
            key={item?.id ?? ""}
            item={item ? (item.attributes?.kind !== null || item.type === "editorial-elements" ? item : item.relationships && item.relationships.contents ? item.relationships.contents.data[0] : item) : []}
          />
        ),
      )}
    </div>
  );
};

export default MediaItemScrollerHorizontalMVView;
