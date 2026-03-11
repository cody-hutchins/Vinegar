import { useEffect } from "react";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import { Col, Row } from "react-bootstrap";

const AppleCurator = ({ data }: { data: object }) => {
  const app = this.$root;
  useEffect(() => {
    console.log("ping");
  }, []);
  return (
    <div id={"cider-applecurator"}>
      <div className={"content-inner"}>
        <h1 className={"header-text"}>{data.attributes?.shortName ?? data.attributes.name}</h1>
        {data.relationships && data.relationships.grouping && (
          <template>
            {data.relationships.grouping.data[0].relationships.tabs.data[0].relationships.children.data.map((recom, index) => (
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
                      <button
                        className={"cd-btn-seeall"}
                        onClick={() => app.showCollection(recom.relationships.children ? recom.relationships.children : recom.relationships.contents, recom.attributes.name ?? "", "listen_now")}>
                        {app.getLz("term.seeAll")}
                      </button>
                    </Col>
                  )}
                </Row>
                {recom.relationships && ((recom.relationships.children && recom.relationships.children.data) || (recom.relationships.contents && recom.relationships.contents.data)) && (
                  <div>
                    {(recom.attributes.name && recom.attributes.name.includes("ideo")) || index === 0 ? (
                      <MediaItemScrollerHorizontalMVView
                        imagesize={800}
                        browsesp={index === 0}
                        items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)}
                      />
                    ) : recom.attributes.name === "Chart Set" ? (
                      <div />
                    ) : (
                      <MediaItemScrollerHorizontalLarge items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </template>
        )}
      </div>
    </div>
  );
};

export default AppleCurator;
