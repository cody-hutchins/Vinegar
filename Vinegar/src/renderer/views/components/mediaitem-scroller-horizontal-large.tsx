export const Component = ({ items }: { items: object[] }) => {
  return (
    <div id="mediaitem-scroller-horizontal-large">
      <vue-horizontal>
        <mediaitem-square
          item="item"
          key="item?.id ?? ''"
          v-for="item in items"></mediaitem-square>
      </vue-horizontal>
    </div>
  );
};
