export const Component = () => {
  Vue.component("mediaitem-scroller-horizontal-large", {
    template: "#mediaitem-scroller-horizontal-large",
    props: ["items"],
  });
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
