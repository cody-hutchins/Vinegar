import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontalLarge = ({ items }: { items: object[] }) => {
  return (
    <div id="mediaitem-scroller-horizontal-large">
      <vue-horizontal>
        <MediaItemSquare
          item="item"
          key="item?.id ?? ''"
          v-for="item in items"
        />
      </vue-horizontal>
    </div>
  );
};
export default MediaItemScrollerHorizontalLarge;
