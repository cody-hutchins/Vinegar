import { Col, Row } from "react-bootstrap";
import MediaItemArtwork from "./mediaitem-artwork.js";
import MediaItemScrollerHorizontalLarge from "./mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalSP from "./mediaitem-scroller-horizontal-sp.jsx";

const ListenNowChild = ({ recom, index }: { recom: object; index: number }) => {
  const isVisible = true;
  const app = this.$root;
  const visibilityChanged = (isVisible, entry) => {
    // isVisible = isVisible
  };
  const showCollection = (recom) => {
    console.debug(recom);
    app.showCollection(recom.relationships.contents, recom.attributes.title ? recom.attributes.title.stringForDisplay : "", "listen_now");
  };
  const navigateContent = async (id) => {
    if (typeof id !== "string") {
      app.routeView(id);
    } else {
      try {
        const a = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}?ids[albums]=${id}`);
        const q1 = a.data?.data[0];
        if (q1) {
          app.routeView(q1);
        } else {
          const b = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}?ids[artists]=${id}`);
          const q2 = b.data?.data[0];
          if (q2) {
            app.routeView(q2);
          } else {
            const c = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}?ids[playlists]=${id}`);
            const q3 = c.data?.data[0];
            if (q3) {
              app.routeView(q3);
            }
          }
        }
      } catch (e) {
        const b = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}?ids[artists]=${id}`);
        const q2 = b.data?.data[0];
        if (q2) {
          app.routeView(q2);
        }
      }
    }
  };
  return (
    <div id={"listennow-child"}>
      <div v-observe-visibility={"{callback: visibilityChanged}"}>
        {isVisible && recom.attributes.display.kind !== "MusicSuperHeroShelf" ? (
          <template>
            <Row className={"row"}>
              {recom?.relationships["primary-content"]?.data?.length > 0 ? (
                <Col style={{ display: "flex", marginBlock: "1rem" }}>
                  <div
                    onClick={() => navigateContent(recom?.relationships["primary-content"]?.data[0] ?? recom?.attributes?.title?.contentIds[0] ?? "")}
                    className={"listennow-chip"}
                    style={{ height: "40px", width: "40px", alignSelf: center, marginRight: "10px" }}
                    className={"{ 'circle': recom?.relationships['primary-content']?.data[0]?.type === 'artists'  }"}>
                    {recom?.relationships["primary-content"]?.data[0]?.attributes?.artwork !== null && (
                      <MediaItemArtwork
                        url={recom?.relationships["primary-content"]?.data[0]?.attributes?.artwork?.url}
                        size={"100"}
                      />
                    )}
                  </div>
                  <div
                    onClick={() => navigateContent(recom?.relationships["primary-content"]?.data[0] ?? recom?.attributes?.title?.contentIds[0] ?? "")}
                    style={{ width: "fit-content" }}
                    className={"{'item-navigate' : (recom?.attributes?.title?.contentIds?.length ?? 0) > 0 | recom?.relationships['primary-content']?.data?.length > 0}"}>
                    <span style={{ opacity: 0.5, fontWeight: "bold" }}>{recom.attributes.titleWithoutName.stringForDisplay}</span>
                    <h3 style={{ marginBlock: 0 }}> {recom?.relationships["primary-content"]?.data[0].attributes?.name ?? recom.attributes.title.stringForDisplay.replace(recom.attributes.titleWithoutName.stringForDisplay, "")}</h3>
                  </div>
                </Col>
              ) : (
                <Col style={{ display: "flex", marginBlock: "1rem" }}>
                  <h3
                    onClick={() => navigateContent(recom?.relationships["primary-content"]?.data[0] ?? recom?.attributes?.title?.contentIds[0] ?? "")}
                    style={{ width: "fit-content", marginBlock: 0 }}
                    className={"{'item-navigate' : (recom?.attributes?.title?.contentIds?.length ?? 0) > 0 | recom?.relationships['primary-content']?.data?.length > 0}"}>
                    {recom.attributes.title ? recom.attributes.title.stringForDisplay : " "}
                  </h3>
                </Col>
              )}
            </Row>
            {recom.attributes.display.kind === "MusicCoverShelf" || recom.attributes.display.kind === "MusicCircleCoverShelf" ? (
              <MediaItemScrollerHorizontalLarge items={recom.relationships.contents.data.limit(10)} />
            ) : (
              <MediaItemScrollerHorizontalSP
                withReason={index === 0}
                items={recom.relationships.contents.data.limit(10)}
              />
            )}
          </template>
        ) : null}
      </div>
    </div>
  );
};

export default ListenNowChild;
