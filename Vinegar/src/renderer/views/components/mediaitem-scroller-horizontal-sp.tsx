import MediaItemSquare from "./mediaitem-square.jsx";

const MediaItemScrollerHorizontalSP = ({ items, withReason }: { items?: object[]; withReason?: boolean }) => {
  return (
    <div id="mediaitem-scroller-horizontal-sp">
      <div className="cd-hmedia-scroller hmedia-scroller-card">
        <vue-horizontal>
          <template>
            <MediaItemSquare
              kind="card"
              item="item"
              size="300"
              reasonShown={withReason}
              v-bind:key="item.id"
              v-for={item in items}
            />
          </template>
        </vue-horizontal>
      </div>
    </div>
  );
};

export default MediaItemScrollerHorizontalSP;
