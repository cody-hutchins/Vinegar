import { useEffect } from "react";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const LibrarySongs = ({ data }: { data: object }) => {
  const { t } = useTranslation();
  let videos = [];
  let loaded = false;
  useEffect(() => {
    setTimeout(async () => {
      if (videos === null || videos.length === 0)
        videos = (await this.$root.mk.api.music("/v1/me/library/music-videos")).data?.data ?? [];
      loaded = true;
    });
  }, []);

  return (
    <div id={"cider-library-videos"}>
      <div className={"content-inner"}>
        <Row className={"row"}>
          <Col style={{ padding: 0 }}>
            <h1 className={"header-text"}>{t("term.videos")}</h1>
          </Col>
        </Row>
        <div className={"madeforyou-body"}>
          {videos.length > 0 ? (
            videos.map((item) => (
              <MediaItemSquare
                key={item.id}
                imagesize={300}
                item={item}
              />
            ))
          ) : loaded ? (
            <div>{t("term.noVideos")}</div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarySongs;
