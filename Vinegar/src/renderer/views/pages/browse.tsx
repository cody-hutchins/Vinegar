import { useEffect } from "react";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import ListitemHorizontal from "../components/listitem-horizontal.jsx";
import { Col, Row } from "react-bootstrap";

const Browse = ({ data }: { data: object }) => {
  const app = this.$root;
  useEffect(() => {
    this.$root.getBrowsePage();
  }, []);
  return (
    <div id={"cider-browse"}>
      <div className={"content-inner"}>
        <h1 className={"header-text"}>{$root.getLz("term.browse")}</h1>
        {data.relationships &&
          data.relationships.tabs &&
          data.relationships.tabs.data[0].relationships.children.data.map((recom, index) => (
            <div key={index}>
              <Row>
                {recom.attributes.name !== "Chart Set" && (
                  <Col>
                    <h3>{recom.attributes.name ?? ""}</h3>
                  </Col>
                )}
                {index !== 0 && recom.relationships && ((recom.relationships.children && recom.relationships.children.data.length > 10) || (recom.relationships.contents && recom.relationships.contents.data.length > 10)) && (
                  <Col
                    auto
                    className={"cider-flex-center"}>
                    {recom.relationships.room ? (
                      <button
                        className={"cd-btn-seeall"}
                        onClick={() => app.showRoom(recom.relationships.room?.data[0].href)}>
                        {app.getLz("term.seeAll")}
                      </button>
                    ) : (
                      <button
                        className={"cd-btn-seeall"}
                        onClick={() => app.showCollection(recom.relationships.children ? recom.relationships.children : recom.relationships.contents, recom.attributes.name ?? "", "listen_now")}>
                        {app.getLz("term.seeAll")}
                      </button>
                    )}
                  </Col>
                )}
              </Row>
              {recom.relationships !== null && ((recom.relationships.children && recom.relationships.children.data) || (recom.relationships.contents && recom.relationships.contents.data)) ? (
                index === 0 || (data.relationships.tabs.data[0].relationships.children.data[0].relationships === null && index === 1) ? (
                  <MediaItemScrollerHorizontalMVView
                    imagesize={"800"}
                    browsesp={"index === 0|| (data.relationships.tabs.data[0].relationships.children.data[0].relationships === null && index === 1)"}
                    kind={recom.attributes.editorialElementKind}
                    items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)}
                  />
                ) : (
                  <MediaItemScrollerHorizontalLarge items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)} />
                )
              ) : (
                recom.attributes.links &&
                recom.attributes.editorialElementKind.includes("391") && (
                  <div className={"grouping-container"}>
                    {recom.attributes.links.map((link) => (
                      <button
                        key={link.name}
                        className={"grouping-btn"}
                        onClick={() => $root.goToGrouping(link.url)}>
                        {link.label}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Browse;
