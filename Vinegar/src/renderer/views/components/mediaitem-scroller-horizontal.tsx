import { ReactNode } from "react";
import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontal = ({ children, items, kind = "" }: { children?: ReactNode | ReactNode[]; items?: MusicKit.MediaItem[]; kind?: string }) => {
  const app = this.$root;
  return (
    <div id={"mediaitem-scroller-horizontal"}>
      <div
        ref={"horizontal"}
        style={{ overflowX: "auto", display: "flex", scrollSnapType: "x mandatory" }}>
        {children}
        {items?.map((item) => (
          <MediaItemSquare
            key={item.id ?? ""}
            kind={kind}
            item={item}
          />
        ))}
      </div>
    </div>
  );
};

export default MediaItemScrollerHorizontal;
