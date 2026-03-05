import { useEffect } from "react";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import ListitemHorizontal from "../components/listitem-horizontal.jsx";

const Browse = ({ data }: { data: object }) => {
  const app = this.$root;
  useEffect(() => {
    this.$root.getBrowsePage();
  }, []);
  return (
    <div id="cider-browse">
      <div className="content-inner">
        <h1 className="header-text">{$root.getLz("term.browse")}</h1>
        <template v-if={data.relationships && data.relationships.tabs}>
          <template v-for={(recom, index) in data.relationships.tabs.data[0].relationships.children.data}>
            <div className="row">
              <div
                className="col"
                v-if={recom.attributes.name !== "Chart Set"}>
                <h3>{recom.attributes.name ?? ""}</h3>
              </div>
              <div
                className="col-auto cider-flex-center"
                v-if={index !== 0 && recom.relationships && ((recom.relationships.children && recom.relationships.children.data.length > 10) || (recom.relationships.contents && recom.relationships.contents.data.length > 10))}>
                <button
                  className="cd-btn-seeall"
                  v-if={recom.relationships.room}
                  onClick={() => app.showRoom(recom.relationships.room?.data[0].href)}>
                  {app.getLz("term.seeAll")}
                </button>
                <button
                  className="cd-btn-seeall"
                  v-else
                  onClick={() => app.showCollection(recom.relationships.children ? recom.relationships.children : recom.relationships.contents, recom.attributes.name ?? "", "listen_now")}>
                  {app.getLz("term.seeAll")}
                </button>
              </div>
            </div>
            <template v-if={recom.relationships !== null && ((recom.relationships.children && recom.relationships.children.data) || (recom.relationships.contents && recom.relationships.contents.data))}>
              <template v-if={index === 0 || (data.relationships.tabs.data[0].relationships.children.data[0].relationships === null && index === 1)}>
                <MediaItemScrollerHorizontalMVView
                  imagesize="800"
                  browsesp="index === 0|| (data.relationships.tabs.data[0].relationships.children.data[0].relationships === null && index === 1)"
                  kind={recom.attributes.editorialElementKind}
                  items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)"
                />
              </template>
              <template v-else-if={(['327']).includes(recom.attributes.editorialElementKind)}>
                <div className="mediaitem-list-item__grid">
                  <ListitemHorizontal items={recom.relationships.contents.data.limit(20)} />
                </div>
              </template>
              <template v-else-if={(['385']).includes(recom.attributes.editorialElementKind)}>
                <MediaItemScrollerHorizontalMVView
                  imagesize="800"
                  kind={recom.attributes.editorialElementKind}
                  items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)"
                />
              </template>
              <template v-else-if={recom.attributes.name === 'Chart Set'}>{/* ignored  */}</template>
              <template v-else>
                <MediaItemScrollerHorizontalLarge items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)" />
              </template>
            </template>
            <template v-else>
              <template v-if={recom.attributes.links && recom.attributes.editorialElementKind.includes("391")}>
                <div className="grouping-container">
                  <button
                    className="grouping-btn"
                    onClick={() => $root.goToGrouping(link.url)}
                    v-for={link in recom.attributes.links}>
                    {link.label}
                  </button>
                </div>
              </template>
            </template>
          </template>
        </template>
      </div>
    </div>
  );
};

export default Browse;
