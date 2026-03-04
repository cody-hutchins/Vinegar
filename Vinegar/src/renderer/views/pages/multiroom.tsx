import ArtworkMaterial from "../components/artwork-material.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";

const Multiroom = ({ data }: { data: object }) => {
  const app = this.$root;

  return (
    <div id="cider-multiroom">
      <div className="content-inner cider-multiroom">
        <div
          className="artworkContainer"
          v-if="data.attributes?.uber?.masterArt?.url">
          <ArtworkMaterial
            url="data.attributes?.uber?.masterArt?.url ?? ''"
            size="800"
            images="1"
          />
        </div>
        <div className="detail">
          <h1 className="header-text">{data.attributes?.title ?? ""}</h1>
          <h2
            className="header-desc"
            v-html='data.relationships?.children?.data[0]?.attributes?.description ?? ""'
          />
          <template v-if="data.relationships">
            <template v-if="datatype=='rooms' &&  (data?.relationships?.contents?.data ?? []).length > 0">
              {/* <div className="row">
                        <div className="col-auto cider-flex-center"
                             v-if="data?.relationships?.contents?.data.length > 10">
                            <button className="cd-btn-seeall"
                                    onClick={() =>app.showCollection(recom, data.attributes.name ?? '', 'listen_now')}>
                                {app.getLz('term.seeAll')}
                            </button>
                        </div>
                    </div>  */}
              <template>
                <MediaItemSquare
                  item="item"
                  key="item?.id ?? ''"
                  v-for="item in data?.relationships?.contents?.data"
                />
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
                      onClick={() => app.showCollection(recom.relationships.children ? recom.relationships.children : recom.relationships.contents, recom.attributes.name ?? "", "listen_now")}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                </div>
                <template v-if="recom.relationships && ((recom.relationships.children && recom.relationships.children.data) || (recom.relationships.contents && recom.relationships.contents.data))">
                  <template v-if="(recom.attributes.name && recom.attributes.name.includes('ideo')) || index === 0">
                    <MediaItemScrollerHorizontalMVView
                      imagesize="800"
                      browsesp="index == 0"
                      items="recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)"
                    />
                  </template>
                  <template v-else-if="recom.attributes.name == 'Chart Set'" />
                  <template v-else>
                    <MediaItemScrollerHorizontalLarge items="recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)" />
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

export default Multiroom;
