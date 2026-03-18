import { useEffect } from "react";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ArtistFeed = () => {
  const { t } = useTranslation();
  const app = this.$root;
  const followedArtists = this.$root.cfg.home.followedArtists;
  let artistFeed = [];
  const artists = [];
  let syncingFavs = false;

  useEffect(() => {
    getArtistFeed().then();
  }, []);

  async function syncFavorites() {
    syncingFavs = true;
    await app.syncFavorites();
    await getArtistFeed();
    syncingFavs = false;
  }

  async function unfollow(id) {
    const index = followedArtists.indexOf(id);
    if (index > -1) {
      followedArtists.splice(index, 1);
    }
    const artist = artists.find((a) => a.id === id);
    const index2 = artists.indexOf(artist);
    if (index2 > -1) {
      artists.splice(index2, 1);
    }
    await app.mk.api.v3.music(
      `/v1/me/favorites`,
      {
        "art[url]": "f",
        "ids[artists]": id,
        l: app.mklang,
        platform: "web",
      },
      {
        fetchOptions: {
          method: "DELETE",
        },
      },
    );
    getArtistFeed();
  }

  async function getArtistFeed() {
    const artists = followedArtists;
    artistFeed = [];

    // Apple limits the number of IDs we can provide in a single API call to 50.
    // Divide it into groups of 50 and send parallel requests
    const chunks = [];
    for (let artistIdx = 0; artistIdx < artists.length; artistIdx += 50) {
      chunks.push(artists.slice(artistIdx, artistIdx + 50));
    }
    try {
      const chunkArtistData = await Promise.all(chunks.map((chunk) => app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists?ids=${chunk.toString()}&views=latest-release&include[songs]=albums&fields[albums]=artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount&limit[artists:top-songs]=2&art[url]=f`)));
      chunkArtistData.forEach((chunkResult) =>
        chunkResult.data.data.forEach((item) => {
          artists.push(item);
          if (item.views["latest-release"].data.length !== 0) {
            artistFeed.push(item.views["latest-release"].data[0]);
          }
        }),
      );
      // sort artistFeed by attributes.releaseDate descending, date is formatted as "YYYY-MM-DD"
      artistFeed.sort((a, b) => {
        const dateA = new Date(a.attributes.releaseDate);
        const dateB = new Date(b.attributes.releaseDate);
        return dateB - dateA;
      });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div id={"cider-artist-feed"}>
      <div className={"content-inner"}>
        <div>
          <Row>
            <Col>
              <Row className={"nopadding"}>
                <Col className={"nopadding"}>
                  <h3>{t("home.followedArtists")}</h3>
                </Col>
                <Col
                  auto
                  className={"nopadding cider-flex-center"}>
                  {!syncingFavs ? (
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => syncFavorites()}>
                      {t("home.syncFavorites")}
                    </button>
                  ) : (
                    <div
                      className={"spinner"}
                      style={{ height: "26px" }}
                    />
                  )}
                </Col>
              </Row>
              <div style={{ overflowX: "auto", display: "flex", scrollSnapType: "x mandatory" }}>
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    style={{ margin: "6px" }}>
                    <MediaItemSquare
                      item={artist}
                      kind={"small"}
                    />
                    <button
                      onClick={() => unfollow(artist.id)}
                      className={"md-btn md-btn-glyph"}
                      style={{ display: "flex" }}>
                      <div className={"sidebar-icon"}>
                        <div
                          className={"svg-icon"}
                          style={{ "--url": "url(./assets/feather/x-circle.svg)" }}
                        />
                      </div>
                      {t("action.removeFavorite")}
                    </button>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>

        <div>
          <Row>
            <Col>
              <Row className={"nopadding"}>
                <Col className={"nopadding"}>
                  <h3>{t("home.artistsFeed")}</h3>
                </Col>
              </Row>
              <div
                className={"well"}
                style={{ marginTop: 0 }}>
                {artistFeed.length > 0 ? (
                  artistFeed.map((item) => (
                    <MediaItemListItem
                      key={item.id}
                      item={item}
                    />
                  ))
                ) : (
                  <div className={"spinner"} />
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};
export default ArtistFeed;
