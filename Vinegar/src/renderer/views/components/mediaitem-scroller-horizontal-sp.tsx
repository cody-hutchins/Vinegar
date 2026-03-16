import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontalSP = ({ items, withReason }: { items: MusicKit.MediaItem[]; withReason?: boolean }) => {
  return (
    <div id={"mediaitem-scroller-horizontal-sp"}>
      <div
        className={"cd-hmedia-scroller hmedia-scroller-card"}
        style={{ overflowX: "auto", display: "flex", scrollSnapType: "x mandatory" }}>
        {items.map((item) => (
          <MediaItemSquare
            kind={"card"}
            item={item}
            imagesize={300}
            reasonShown={withReason}
            key={item.id}
          />
        ))}
      </div>
    </div>
  );
};

export default MediaItemScrollerHorizontalSP;
