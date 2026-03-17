import { Col, Row } from "react-bootstrap";
import ArtworkMaterial from "../components/artwork-material.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";

const Multiroom = ({ data }: { data: object }) => {
  const app = this.$root;
  {
    /* <div className="row">
      {data?.relationships?.contents?.data.length > 10 &&<div className="col-auto cider-flex-center">
          <button className="cd-btn-seeall"
                  onClick={() =>app.showCollection(recom, data.attributes.name ?? '', 'listen_now')}>
              {app.getLz('term.seeAll')}
          </button>
      </div>}
  </div>  */
  }
  return (
    <div id={"cider-multiroom"}>
      <div className={"content-inner cider-multiroom"}>
        {data.attributes?.uber?.masterArt?.url && (
          <div className={"artworkContainer"}>
            <ArtworkMaterial
              url={data.attributes?.uber?.masterArt?.url ?? ""}
              size={"800"}
              images={"1"}
            />
          </div>
        )}
        <div className={"detail"}>
          <h1 className={"header-text"}>{data.attributes?.title ?? ""}</h1>
          <h2
            className={"header-desc"}
            dangerouslySetInnerHTML={{ __html: data.relationships?.children?.data[0]?.attributes?.description ?? "" }}></h2>
          {data.relationships &&
            (datatype === "rooms" && (data?.relationships?.contents?.data ?? []).length > 0
              ? data?.relationships?.contents?.data.map((item) => (
                  <MediaItemSquare
                    item={item}
                    key={item?.id ?? ""}
                  />
                ))
              : (data.relationships?.children?.data ??
                recom?.relationships?.contents?.data.map(
                  (recom, index) =>
                    (recom.relationships?.contents?.data ?? []).length > 0 && (
                      <div key={index}>
                        <Row>
                          {recom.attributes.name !== "Chart Set" && (
                            <Col>
                              <h3>{recom.attributes?.title ?? ""}</h3>
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
                        {recom.relationships &&
                          ((recom.relationships.children && recom.relationships.children.data) || (recom.relationships.contents && recom.relationships.contents.data)) &&
                          ((recom.attributes.name && recom.attributes.name.includes("ideo")) || index === 0 ? (
                            <MediaItemScrollerHorizontalMVView
                              imagesize={800}
                              browsesp={index === 0}
                              items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)}
                            />
                          ) : (
                            <MediaItemScrollerHorizontalLarge items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)} />
                          ))}
                      </div>
                    ),
                )))}
        </div>
      </div>
    </div>
  );
};

export default Multiroom;
