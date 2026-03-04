import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontal = ({ items, kind = "" }: { items?: object[]; kind?: string }) => {
  const app = this.$root;
  return (
    <div id="mediaitem-scroller-horizontal">
      <vue-horizontal ref="horizontal">
        <slot />
        <MediaItemSquare
          key={item?.id ?? ""}
          kind={kind}
          item={item}
          v-for={item in items}
        />
      </vue-horizontal>
    </div>
  );
};

export default MediaItemScrollerHorizontal;
