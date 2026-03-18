import { Row, Col } from "react-bootstrap";
import MediaItemSquare from "../components/mediaitem-square.jsx";

export const MadeForYou = ({ item }: { item: object }) => {
  const { t } = useTranslation();
  return (
    <div className={"content-inner"}>
      <Row>
        <Col style={{ padding: 0 }}>
          <h1 className={"header-text"}>{t("home.madeForYou")}</h1>
        </Col>
      </Row>
      <div className={"madeforyou-body"}>
        {madeforyou.data.map((item) => (
          <MediaItemSquare
            item={item}
            key={item.id}
          />
        ))}
      </div>
    </div>
  );
};
