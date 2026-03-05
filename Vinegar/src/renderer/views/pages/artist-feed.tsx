import { useEffect } from "react";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";

const ArtistFeed = () => {
  const app = this.$root;
  let followedArtists = this.$root.cfg.home.followedArtists;
  let artistFeed = [];
  let artists = [];
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
    let index = followedArtists.indexOf(id);
    if (index > -1) {
      followedArtists.splice(index, 1);
    }
    let artist = artists.find((a) => a.id === id);
    let index2 = artists.indexOf(artist);
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
    let artists = followedArtists;
    artistFeed = [];

    // Apple limits the number of IDs we can provide in a single API call to 50.
    // Divide it into groups of 50 and send parallel requests
    let chunks = [];
    for (let artistIdx = 0; artistIdx < artists.length; artistIdx += 50) {
      chunks.push(artists.slice(artistIdx, artistIdx + 50));
    }
    try {
      const chunkArtistData = await Promise.all(chunks.map((chunk) => app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists?ids=${chunk.toString()}&views=latest-release&include[songs]=albums&fields[albums]=artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount&limit[artists:top-songs]=2&art[url]=f`)));
      chunkArtistData.forEach((chunkResult) =>
        chunkResult.data.data.forEach((item) => {
          self.artists.push(item);
          if (item.views["latest-release"].data.length !== 0) {
            self.artistFeed.push(item.views["latest-release"].data[0]);
          }
        }),
      );
      // sort artistFeed by attributes.releaseDate descending, date is formatted as "YYYY-MM-DD"
      artistFeed.sort((a, b) => {
        let dateA = new Date(a.attributes.releaseDate);
        let dateB = new Date(b.attributes.releaseDate);
        return dateB - dateA;
      });
    } catch (err) {}
  }

  return (
    <div id="cider-artist-feed">
      <div className="content-inner">
        <div>
          <div className="row">
            <div className="col">
              <div className="row nopadding">
                <div className="col nopadding">
                  <h3>{app.getLz("home.followedArtists")}</h3>
                </div>
                <div className="col-auto nopadding cider-flex-center">
                  <button
                    className="cd-btn-seeall"
                    onClick={() => syncFavorites()}
                    v-if={!syncingFavs}>
                    {app.getLz("home.syncFavorites")}
                  </button>
                  <div
                    className="spinner"
                    style={{ height: "26px" }}
                    v-else
                  />
                </div>
              </div>
              <vue-horizontal>
                <div
                  v-for={artist in artists}
                  style={{ margin: "6px" }}>
                  <MediaItemSquare
                    item={artist}
                    kind="small"
                  />
                  <button
                    onClick={() => unfollow(artist.id)}
                    className="md-btn md-btn-glyph"
                    style={{ display: flex }}>
                    <div className="sidebar-icon">
                      <div
                        className="svg-icon"
                        style={{ "--url": "url(./assets/feather/x-circle.svg)" }}
                      />
                    </div>
                    {app.getLz("action.removeFavorite")}
                  </button>
                </div>
              </vue-horizontal>
            </div>
          </div>
        </div>

        <div>
          <div className="row">
            <div className="col">
              <div className="row nopadding">
                <div className="col nopadding">
                  <h3>{app.getLz("home.artistsFeed")}</h3>
                </div>
              </div>
              <div
                className="well"
                style={{ marginTop: 0 }}>
                <template v-if={artistFeed.length > 0}>
                  <MediaItemListItem
                    v-for={item in artistFeed}
                    v-bind:key={item.id}
                    item={item}
                  />
                </template>
                <template v-else>
                  <div className="spinner" />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ArtistFeed;
