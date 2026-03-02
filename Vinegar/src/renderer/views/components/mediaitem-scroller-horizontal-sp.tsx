export const Component = ({ items, withReason }: { items?: object[]; withReason?: boolean }) => {
  return (
    <div id="mediaitem-scroller-horizontal-sp">
      <div className="cd-hmedia-scroller hmedia-scroller-card">
        <vue-horizontal>
          <template>
            <mediaitem-square
              kind="card"
              item="item"
              size="300"
              reasonShown={withReason}
              v-bind:key="item.id"
              v-for={item in items}></mediaitem-square>
          </template>
        </vue-horizontal>
      </div>
    </div>
  );
};
