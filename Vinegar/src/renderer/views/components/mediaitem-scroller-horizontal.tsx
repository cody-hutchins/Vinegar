export const Component = ({ items, kind = "" }: { items?: object[]; kind?: string }) => {
  const app = this.$root;
  return (
    <div id="mediaitem-scroller-horizontal">
      <vue-horizontal ref="horizontal">
        <slot></slot>
        <mediaitem-square
          key="item?.id ?? ''"
          kind={kind}
          item="item"
          v-for={item in items}></mediaitem-square>
      </vue-horizontal>
    </div>
  );
};
