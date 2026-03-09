import MediaItemSquare from "../components/mediaitem-square.jsx";

const RecordLabel = ({ data }: { data: string }) => {
  let topSongsExpanded = false;
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
    <>
      <div id="cider-recordlabel">
        <div className="content-inner artist-page">
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
                    url={data.attributes.artwork ? data.attributes.artwork.url : ""}
                    size="220"
                    type="artists"></MediaItemArtwork>
                </div>
              </div>
              <div className="col cider-flex-center">
                <h1>{data.attributes.name}</h1>
              </div>
            </div>
          </div>
          <div className="artist-body">
            {$root.showingPlaylist.attributes.description && (
              <div>
                <div className="row">
                  <h3>{$root.getLz("term.about")}</h3>
                </div>
                <div className="row">
                  <div>{$root.showingPlaylist.attributes.description.standard}</div>
                </div>
              </div>
            )}
            {data.views && data.views["latest-releases"] && (
              <template>
                <div className="row">
                  <div className="col">
                    <h3>{data.views["latest-releases"].attributes.title ?? ""}</h3>
                  </div>
                </div>
                {data.views["latest-releases"].data.map((item) => (
                  <MediaItemSquare item={item}></MediaItemSquare>
                ))}
              </template>
            )}
            {data.views && data.views["top-releases"] && (
              <template>
                <div className="row">
                  <div className="col">
                    <h3>{data.views["top-releases"].attributes.title ?? ""}</h3>
                  </div>
                </div>
                {data.views["top-releases"].data.map((item) => (
                  <MediaItemSquare item={item}></MediaItemSquare>
                ))}
              </template>
            )}
            {data.relationships && data.relationships.playlists && data.relationships.playlists.data.length > 0 && (
              <template>
                <div className="row">
                  <div className="col">
                    <h3>{$root.getLz("term.playlists")}</h3>
                  </div>
                </div>
                {data.relationships.playlists.data.limit(5).map((item) => (
                  <MediaItemSquare item={item}></MediaItemSquare>
                ))}
              </template>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default RecordLabel;
