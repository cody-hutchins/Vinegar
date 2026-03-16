import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import { Row, Col } from "react-bootstrap";

const SocialProfile = ({ data }: { data: object }) => {
  const app = this.$root;
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
    <div id={"cider-socialprofile"}>
      <div className={"content-inner artist-page profile-page"}>
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
                  imagesize={"220"}
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
          {data.relationships && data.relationships["shared-playlists"] && (
            <template>
              <Row>
                <Col>
                  <h3>Shared Playlists</h3>
                </Col>
              </Row>
              {data.relationships["shared-playlists"].data.limit(10).map((item) => (
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

export default SocialProfile;
