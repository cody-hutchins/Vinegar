import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";

const SocialProfile = ({ data }: { data: object }) => {
  const app = this.$root;
  let topSongsExpanded = false;
  function getArtistPalette(artist) {
    if (artist?.attributes?.artwork != null) {
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
    <div id="cider-socialprofile">
      <div className="content-inner artist-page profile-page">
        <div
          className="artist-header"
          style={getArtistPalette(data)}>
          <div className="row">
            <div
              className="col-sm"
              style={{ width: "auto" }}>
              <div className="artist-image">
                <MediaItemArtwork
                  shadow="large"
                  url="data.attributes.artwork ? data.attributes.artwork.url : ''"
                  size="220"
                  type="artists"
                />
              </div>
            </div>
            <div className="col cider-flex-center">
              <h1>{data.attributes.name}</h1>
            </div>
          </div>
        </div>
        <div className="artist-body">
          <template v-if="data.relationships && data.relationships['shared-playlists']">
            <div className="row">
              <div className="col">
                <h3>{"Shared Playlists" ?? ""}</h3>
              </div>
              <div
                className="col-auto cider-flex-center"
                v-if="data.relationships['shared-playlists'].data.length >= 10">
                <button
                  className="cd-btn-seeall"
                  onClick={() => app.showCollection(data.relationships["shared-playlists"], "Shared Playlists" ?? "", "default")}>
                  {app.getLz("term.seeAll")}
                </button>
              </div>
            </div>
            <MediaItemSquare
              item="item"
              v-for="item in data.relationships['shared-playlists'].data.limit(10)"
            />
          </template>
        </div>
      </div>
    </div>
  );
};

export default SocialProfile;
