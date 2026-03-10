import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontalLarge = ({ items }: { items: object[] }) => {
  return (
    <div
      id={"mediaitem-scroller-horizontal-large"}
      style={{ overflowX: "auto", display: "flex", scrollSnapType: "x mandatory" }}>
      {items.map((item) => (
        <MediaItemSquare
          item={item}
          key={item?.id ?? ""}
        />
      ))}
    </div>
  );
};
export default MediaItemScrollerHorizontalLarge;
