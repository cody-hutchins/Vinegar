import { useEffect } from "react";
import MediaItemScrollerHorizontal from "../components/mediaitem-scroller-horizontal.jsx";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";
import { Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const app = this.$root;
  const followedArtists = this.$root.cfg.home.followedArtists;
  const favoriteItems = this.$root.cfg.home.favoriteItems;
  let madeForYou = [];
  let recentlyPlayed = [];
  let friendsListeningTo = [];
  const replayPlaylists = [];
  const favorites = [];
  let profile = {};
  const modify = 0;
  let artistFeed = [];
  const showingArtistFeed = false;
  const page = "main";
  const sectionsReady = [];
  const year = new Date().getFullYear();
  let seenReplay = localStorage.getItem("seenReplay");
  let syncingFavs = false;

  async function mounted() {
    getListenNowData();
    await getArtistFeed();
    await getFavorites();
    await getRecentlyPlayed();
    if (new Date().getMonth() === 11) {
      seenReplay = false;
      localStorage.setItem("seenReplay", false);
    }
  }
  useEffect(() => {
    mounted().then();
  }, []);

  async function syncFavorites() {
    syncingFavs = true;
    await app.syncFavorites();
    await getArtistFeed();
    syncingFavs = false;
  }
  async function seeAllRecentlyPlayed() {
    const hist = await app.mk.api.music(`/v1/me/recent/played`, {
      l: this.$root.mklang,
      include: "tracks",
      "include[albums]": "catalog,tracks,artists",
      "include[songs]": "catalog,artists",
    });
    app.showCollection(hist.data, t("home.recentlyPlayed"));
  }
  async function seeAllHistory() {
    const hist = await app.mk.api.music(`/v1/me/recent/played/tracks`, {
      l: this.$root.mklang,
    });
    app.showCollection(hist.data, t("term.history"));
  }
  function isSectionReady(section) {
    return sectionsReady.includes(section);
  }
  function removeFavoriteContext() {
    return {
      name: "Remove from Favorites",
      action: function (item) {
        const index = favoriteItems.findIndex((x) => x.id === item.id);
        if (index > -1) {
          favoriteItems.splice(index, 1);
          app.cfg.home.favoriteItems = favoriteItems;
        }
      },
    };
  }
  function getFavorites() {
    const libraryPlaylists = [];
    const playlists = [];
    for (const item of favoriteItems) {
      if (item.type === "library-playlists") {
        libraryPlaylists.push(item.id);
      } else if (item.type === "playlists") {
        playlists.push(item.id);
      }
    }
    if (playlists.length !== 0) {
      app.mk.api
        .music(`/v1/catalog/${app.mk.storefrontId}/playlists/${playlists.toString()}`, {
          l: this.$root.mklang,
        })
        .then((playlistsData) => {
          favorites.push(...playlistsData.data);
        });
    }
    if (libraryPlaylists.length !== 0) {
      app.mk.api
        .music(`v1/me/library/playlists/${playlists.toString()}`, {
          l: this.$root.mklang,
        })
        .then((playlistsData) => {
          favorites.push(...playlistsData.data);
        });
    }
  }
  async function getArtistFeed() {
    const artists = followedArtists;
    artistFeed = [];
    const chunks = [];
    for (let artistIdx = 0; artistIdx < artists.length; artistIdx += 50) {
      chunks.push(artists.slice(artistIdx, artistIdx + 50));
    }
    try {
      const chunkArtistData = await Promise.all(
        chunks.map((chunk) =>
          app.mk.api.music(
            `/v1/catalog/${app.mk.storefrontId}/artists?ids=${chunk.toString()}&views=latest-release&include[songs]=albums&fields[albums]=artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount&limit[artists:top-songs]=2&art[url]=f`,
          ),
        ),
      );
      chunkArtistData.forEach((chunkResult) =>
        chunkResult.data.data.forEach((item) => {
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
  async function getRecentlyPlayed() {
    const hist = await app.mk.api.music(`/v1/me/recent/played`, {
      l: this.$root.mklang,
      include: "tracks",
      "include[albums]": "catalog,tracks,artists",
      "include[songs]": "catalog,artists",
    });
    recentlyPlayed = hist.data.data;
  }
  function getListenNowData() {
    app.mk.api
      .music(
        `/v1/me/recommendations?timezone=${encodeURIComponent(app.formatTimezoneOffset())}&name=listen-now&with=friendsMix,library,social&art[social-profiles:url]=c&art[url]=c,f&omit[resource]=autos&relate[editorial-items]=contents&extend=editorialCard,editorialVideo&extend[albums]=artistUrl&extend[library-albums]=artistUrl,editorialVideo&extend[playlists]=artistNames,editorialArtwork,editorialVideo&extend[library-playlists]=artistNames,editorialArtwork,editorialVideo&extend[social-profiles]=topGenreNames&include[albums]=artists&include[songs]=artists&include[music-videos]=artists&fields[albums]=artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url&fields[artists]=name,url&extend[stations]=airDate,supportsAirTimeUpdates&meta[stations]=inflectionPoints&types=artists,albums,editorial-items,library-albums,library-playlists,music-movies,music-videos,playlists,stations,uploaded-audios,uploaded-videos,activities,apple-curators,curators,tv-shows,social-upsells&platform=web&l=${this.$root.mklang}`,
      )
      .then((data) => {
        console.log(data.data.data[1]);
        try {
          madeForYou = data.data.data.filter((section) => {
            if (section.meta.metrics.moduleType === "6") {
              return section;
            }
          })[0].relationships.contents.data;
        } catch (e) {
          console.log(e);
        }
        sectionsReady.push("madeForYou");

        try {
          friendsListeningTo = data.data.data.filter((section) => {
            if (section.meta.metrics.moduleType === "11") {
              return section;
            }
          })[0].relationships.contents.data;
        } catch (e) {
          console.log(e);
        }
        sectionsReady.push("recentlyPlayed");
        sectionsReady.push("friendsListeningTo");
      });

    app.mk.api.music("/v1/me/social/profile/").then((response) => {
      profile = response.data.data[0];
    });
  }

  return (
    <div id={"cider-home"}>
      <div className={"content-inner home-page"}>
        {page === "main" && (
          <div>
            <Row>
              <Col>
                <Row>
                  <Col className={"nopadding"}>
                    <h3>{t("home.recentlyPlayed")}</h3>
                  </Col>
                  <Col
                    auto
                    className={"nopadding cider-flex-center"}>
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => seeAllHistory()}>
                      {t("term.history")}
                    </button>
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => seeAllRecentlyPlayed()}>
                      {t("term.seeAll")}
                    </button>
                  </Col>
                </Row>
                <div className={"well artistfeed-well"}>
                  {isSectionReady("recentlyPlayed") ? (
                    recentlyPlayed.limit(6).map((item) => (
                      <MediaItemListItem
                        item={item}
                        key={item.id}
                      />
                    ))
                  ) : (
                    <div className={"spinner"} />
                  )}
                </div>
              </Col>
              <Col>
                <Row>
                  <Col className={"nopadding"}>
                    <h3>{t("home.artistsFeed")}</h3>
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
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => app.appRoute("artist-feed")}>
                      {t("term.seeAll")}
                    </button>
                  </Col>
                </Row>
                <div
                  className={"well artistfeed-well"}
                  style={{ marginTop: 0 }}>
                  {artistFeed.length > 0 ? (
                    artistFeed.limit(6).map((item) => (
                      <MediaItemListItem
                        item={item}
                        key={item.id}
                      />
                    ))
                  ) : followedArtists.length > 0 ? (
                    <div className={"spinner"} />
                  ) : (
                    <div className={"no-artist"}> {t("home.artistsFeed.noArtist")}</div>
                  )}
                </div>
              </Col>
            </Row>
            {/*{(app.isDev) && <div className="row" > */}
            {/*                <div className="col"> */}
            {/*                    <h3>Your Favorites</h3> */}
            {/*                    <div className="well">*/}
            {/*{(favorites.length === 0) && <div className="hint-text" >Items you have added to your favorites will */}
            {/*                            appear here. */}
            {/*                        </div>}*/}
            {/*<MediaItemScrollerHorizontal kind="small" items="favorites" */}
            {/*                                                       item={item} />*/}
            {/*</div> */}
            {/*                </div> */}
            {/*            </div>}*/}
            {!seenReplay && (
              <Row>
                <Col>
                  <button
                    className={"md-btn md-btn-block md-btn-replay--hero"}
                    onClick={() => $root.appRoute("replay")}>
                    {t("term.replay")} {year}
                  </button>
                </Col>
              </Row>
            )}
            <Row>
              <Col>
                <Row>
                  <Col className={"nopadding"}>
                    <h3>{t("home.madeForYou")}</h3>
                  </Col>
                  <Col
                    auto
                    className={"nopadding cider-flex-center"}>
                    {seenReplay && (
                      <button
                        className={"md-btn md-btn-replay"}
                        onClick={() => $root.appRoute("replay")}>
                        {t("term.replay")} {year}
                      </button>
                    )}
                  </Col>
                </Row>
                <div className={"well"}>
                  {isSectionReady("madeForYou") ? <MediaItemScrollerHorizontal items={madeForYou} /> : <div className={"spinner"} />}
                </div>
              </Col>
            </Row>
            {friendsListeningTo && friendsListeningTo.length > 0 && (
              <Row>
                <Col>
                  <Row>
                    <Col className={"nopadding"}>
                      <h3>{t("home.friendsListeningTo")}</h3>
                    </Col>
                    <Col
                      auto
                      className={"nopadding cider-flex-center"}>
                      <button
                        className={"cd-btn-seeall"}
                        onClick={() => app.showSocialListeningTo()}>
                        {t("term.seeAll")}
                      </button>
                    </Col>
                  </Row>
                  <div className={"well"}>
                    {isSectionReady("friendsListeningTo") ? (
                      <MediaItemScrollerHorizontal items={friendsListeningTo} />
                    ) : (
                      <div className={"spinner"} />
                    )}
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
