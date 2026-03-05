import MediaItemMVViewSP from "./mediaitem-mvview-sp.jsx";
import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontalMVView = ({ items, imagesize, browsesp = false, kind = "" }: { items: object[]; imagesize?: number; browsesp?: boolean; kind?: string }) => {
  const app = this.$root;
  return (
    <div id="mediaitem-scroller-horizontal-mvview">
      <vue-horizontal>
        {items.map((item) => browsesp ?
          <MediaItemMVViewSP
            item={(item?.attributes?.kind !== null || item?.attributes?.type === "editorial-elements" ? item : item.relationships && item.relationships.contents ? item.relationships.contents.data[0] : item) ?? item}
            imagesize={imagesize}
            v-bind:key={item.id}
            badge={item.attributes ?? []}
          />
        :
          <MediaItemSquare
            kind={kind}
            size="600"
            key={item?.id ?? ""}
            item={item ? (item.attributes?.kind !== null || item.type === "editorial-elements" ? item : item.relationships && item.relationships.contents ? item.relationships.contents.data[0] : item) : []}
            imagesize={imagesize}
            v-bind:key={item.id}
          />
        )}
      </vue-horizontal>
    </div>
  );
};

export default MediaItemScrollerHorizontalMVView;
