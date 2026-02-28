export const Component = () => {
  Vue.component("cider-applecurator", {
    template: "#cider-applecurator",
    props: ["data"],
    data: function () {
      return {
        app: this.$root,
      };
    },
    mounted() {
      console.log("ping");
    },
  });
  return (
    <div id="cider-applecurator">
      <div className="content-inner">
        <h1 className="header-text">{data.attributes?.shortName ?? data.attributes.name}</h1>
        <template v-if="data.relationships && data.relationships.grouping">
          <template v-for="(recom,index) in data.relationships.grouping.data[0].relationships.tabs.data[0].relationships.children.data">
            <div className="row">
              <div
                className="col"
                v-if="recom.attributes.name != 'Chart Set'">
                <h3>{recom.attributes.name ?? ""}</h3>
              </div>
              <div
                className="col-auto cider-flex-center"
                v-if="index != 0 && recom.relationships && ((recom.relationships.children &&  recom.relationships.children.data.length > 10) || (recom.relationships.contents && recom.relationships.contents.data.length > 10))">
                <button
                  className="cd-btn-seeall"
                  click="app.showCollection(recom.relationships.children ? recom.relationships.children : recom.relationships.contents, recom.attributes.name ?? '', 'listen_now')">
                  {app.getLz("term.seeAll")}
                </button>
              </div>
            </div>
            <template v-if="recom.relationships && ((recom.relationships.children && recom.relationships.children.data) || (recom.relationships.contents && recom.relationships.contents.data))">
              <template v-if="(recom.attributes.name && recom.attributes.name.includes('ideo')) || index === 0">
                <mediaitem-scroller-horizontal-mvview
                  imagesize="800"
                  browsesp="index == 0"
                  items="recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)"></mediaitem-scroller-horizontal-mvview>
              </template>
              <template v-else-if="recom.attributes.name == 'Chart Set'"></template>
              <template v-else>
                <mediaitem-scroller-horizontal-large items="recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)"></mediaitem-scroller-horizontal-large>
              </template>
            </template>
          </template>
        </template>
      </div>
    </div>
  );
};
