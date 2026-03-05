import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontalLarge = ({ items }: { items: object[] }) => {
  return (
    <div id="mediaitem-scroller-horizontal-large">
      <vue-horizontal>
        {items.map((item) => <MediaItemSquare
          item={item}
          key={item?.id ?? ''}
        />)}
      </vue-horizontal>
    </div>
  );
};
export default MediaItemScrollerHorizontalLarge;
