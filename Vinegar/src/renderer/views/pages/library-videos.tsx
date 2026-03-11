import { useEffect } from "react";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import { Col, Row } from "react-bootstrap";

const LibrarySongs = ({ data }: { data: object }) => {
  const videos = [];
  const loaded = false;
  useEffect(() => {
    setTimeout(async () => {
      if (this.$data.videos === null || this.$data.videos.length === 0) this.$data.videos = (await this.$root.mk.api.v3.music("/v1/me/library/music-videos")).data?.data ?? [];
      this.$data.loaded = true;
    });
  }, []);

  return (
    <div id={"cider-library-videos"}>
      <div className={"content-inner"}>
        <Row className={"row"}>
          <Col style={{ padding: 0 }}>
            <h1 className={"header-text"}>{$root.getLz("term.videos")}</h1>
          </Col>
        </Row>
        <div className={"madeforyou-body"}>
          {videos.length > 0 ? (
            videos.map((item) => (
              <MediaItemSquare
                key={item.id}
                size={"300"}
                item={item}
              />
            ))
          ) : loaded === true ? (
            <div>{$root.getLz("term.noVideos")}</div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarySongs;
