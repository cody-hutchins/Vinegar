export const Component = () => {
  Vue.component("cider-listen-now", {
    template: "#cider-listen-now",
    props: ["data"],
    data: function () {
      return {
        app: this.$root,
      };
    },
    mounted() {
      this.$root.getListenNow();
    },
  });
  return (
    <div id="cider-listen-now">
      <div className="content-inner">
        <h1 className="header-text">{app.getLz("term.listenNow")}</h1>
        <template v-for="(recom,index) in data.data">
          <listennow-child
            recom="recom"
            index="index"></listennow-child>
        </template>
      </div>
    </div>
  );
};
