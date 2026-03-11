import { Col, Row } from "react-bootstrap";
import MediaItemArtwork from "../components/mediaitem-artwork.js";
import MediaItemSquare from "../components/mediaitem-square.jsx";

const RecordLabel = ({ data }: { data: string }) => {
  const topSongsExpanded = false;
  function getArtistPalette(artist) {
    if (artist?.attributes?.artwork !== null) {
      return {
        background: "#" + artist["attributes"]["artwork"]["bgColor"],
        color: "#" + artist["attributes"]["artwork"]["textColor1"],
      };
    } else {
      return {
        background: "#000000",
        color: "#ffffff",
      };
    }
  }
  function getTopResult() {
    if (search.results["meta"]) {
      return search.results[search.results.meta.results.order[0]]["data"][0];
    } else {
      return false;
    }
  }
  return (
    <div id={"cider-recordlabel"}>
      <div className={"content-inner artist-page"}>
        <div
          className={"artist-header"}
          style={getArtistPalette(data)}>
          <Row>
            <Col
              sm
              style={{ width: "auto" }}>
              <div className={"artist-image"}>
                <MediaItemArtwork
                  shadow={"large"}
                  url={data.attributes.artwork ? data.attributes.artwork.url : ""}
                  size={"220"}
                  type={"artists"}
                />
              </div>
            </Col>
            <Col className={"cider-flex-center"}>
              <h1>{data.attributes.name}</h1>
            </Col>
          </Row>
        </div>
        <div className={"artist-body"}>
          {$root.showingPlaylist.attributes.description && (
            <div>
              <Row>
                <h3>{$root.getLz("term.about")}</h3>
              </Row>
              <Row>
                <div>{$root.showingPlaylist.attributes.description.standard}</div>
              </Row>
            </div>
          )}
          {data.views && data.views["latest-releases"] && (
            <template>
              <Row>
                <Col>
                  <h3>{data.views["latest-releases"].attributes.title ?? ""}</h3>
                </Col>
              </Row>
              {data.views["latest-releases"].data.map((item) => (
                <MediaItemSquare
                  key={item.id}
                  item={item}
                />
              ))}
            </template>
          )}
          {data.views && data.views["top-releases"] && (
            <template>
              <Row>
                <Col>
                  <h3>{data.views["top-releases"].attributes.title ?? ""}</h3>
                </Col>
              </Row>
              {data.views["top-releases"].data.map((item) => (
                <MediaItemSquare
                  key={item.id}
                  item={item}
                />
              ))}
            </template>
          )}
          {data.relationships && data.relationships.playlists && data.relationships.playlists.data.length > 0 && (
            <template>
              <Row>
                <Col>
                  <h3>{$root.getLz("term.playlists")}</h3>
                </Col>
              </Row>
              {data.relationships.playlists.data.limit(5).map((item) => (
                <MediaItemSquare
                  key={item.id}
                  item={item}
                />
              ))}
            </template>
          )}
        </div>
      </div>
    </div>
  );
};
export default RecordLabel;
