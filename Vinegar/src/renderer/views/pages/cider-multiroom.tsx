export const Component = () => {
  Vue.component("cider-multiroom", {
    template: "#cider-multiroom",
    props: ["data"],
    data: function () {
      return {
        app: this.$root,
      };
    },
  });
  return (
    <div id="cider-multiroom">
      <div className="content-inner cider-multiroom">
        <div
          className="artworkContainer"
          v-if="data.attributes?.uber?.masterArt?.url">
          <artwork-material
            url="data.attributes?.uber?.masterArt?.url ?? ''"
            size="800"
            images="1"></artwork-material>
        </div>
        <div className="detail">
          <h1 className="header-text">{data.attributes?.title ?? ""}</h1>
          <h2
            className="header-desc"
            v-html='data.relationships?.children?.data[0]?.attributes?.description ?? ""'></h2>
          <template v-if="data.relationships">
            <template v-if="datatype=='rooms' &&  (data?.relationships?.contents?.data ?? []).length > 0">
              {/* <div className="row">
                        <div className="col-auto cider-flex-center"
                             v-if="data?.relationships?.contents?.data.length > 10">
                            <button className="cd-btn-seeall"
                                    click="app.showCollection(recom, data.attributes.name ?? '', 'listen_now')">
                                {app.getLz('term.seeAll')}
                            </button>
                        </div>
                    </div>  */}
              <template>
                <mediaitem-square
                  item="item"
                  key="item?.id ?? ''"
                  v-for="item in data?.relationships?.contents?.data"></mediaitem-square>
              </template>
            </template>
            <template
              v-else
              v-for="(recom,index) in (data.relationships?.children?.data ?? recom?.relationships?.contents?.data)">
              <template v-if="(recom.relationships?.contents?.data ?? []).length > 0">
                <div className="row">
                  <div
                    className="col"
                    v-if="recom.attributes.name != 'Chart Set'">
                    <h3>{recom.attributes?.title ?? ""}</h3>
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
          </template>
        </div>
      </div>
    </div>
  );
};
