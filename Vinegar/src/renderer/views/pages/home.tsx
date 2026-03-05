import { useEffect } from "react";
import MediaItemScrollerHorizontal from "../components/mediaitem-scroller-horizontal.jsx";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";

const Component = () => {
  const app = this.$root;
  let followedArtists = this.$root.cfg.home.followedArtists;
  let favoriteItems = this.$root.cfg.home.favoriteItems;
  let madeForYou = [];
  let recentlyPlayed = [];
  let friendsListeningTo = [];
  let replayPlaylists = [];
  let favorites = [];
  let profile = {};
  let modify = 0;
  let artistFeed = [];
  let showingArtistFeed = false;
  let page = "main";
  let sectionsReady = [];
  let year = new Date().getFullYear();
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
    let hist = await app.mk.api.v3.music(`/v1/me/recent/played`, {
      l: this.$root.mklang,
      include: "tracks",
      "include[albums]": "catalog,tracks,artists",
      "include[songs]": "catalog,artists",
    });
    app.showCollection(hist.data, app.getLz("home.recentlyPlayed"));
  }
  async function seeAllHistory() {
    let hist = await app.mk.api.v3.music(`/v1/me/recent/played/tracks`, {
      l: this.$root.mklang,
    });
    app.showCollection(hist.data, app.getLz("term.history"));
  }
  function isSectionReady(section) {
    return sectionsReady.includes(section);
  }
  function removeFavoriteContext() {
    return {
      name: "Remove from Favorites",
      action: function (item) {
        let index = self.favoriteItems.findIndex((x) => x.id === item.id);
        if (index > -1) {
          self.favoriteItems.splice(index, 1);
          self.app.cfg.home.favoriteItems = self.favoriteItems;
        }
      },
    };
  }
  async function getFavorites() {
    let libraryPlaylists = [];
    let playlists = [];
    for (let item of favoriteItems) {
      if (item.type === "library-playlists") {
        libraryPlaylists.push(item.id);
      } else if (item.type === "playlists") {
        playlists.push(item.id);
      }
    }
    if (playlists.length !== 0) {
      app.mk.api.v3
        .music(`/v1/catalog/${app.mk.storefrontId}/playlists/${playlists.toString()}`, {
          l: this.$root.mklang,
        })
        .then((playlistsData) => {
          self.favorites.push(...playlistsData.data);
        });
    }
    if (libraryPlaylists.length !== 0) {
      app.mk.api.v3
        .music(`v1/me/library/playlists/${playlists.toString()}`, {
          l: this.$root.mklang,
        })
        .then((playlistsData) => {
          self.favorites.push(...playlistsData.data);
        });
    }
  }
  async function getArtistFeed() {
    let artists = followedArtists;
    artistFeed = [];
    let chunks = [];
    for (let artistIdx = 0; artistIdx < artists.length; artistIdx += 50) {
      chunks.push(artists.slice(artistIdx, artistIdx + 50));
    }
    try {
      const chunkArtistData = await Promise.all(chunks.map((chunk) => app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists?ids=${chunk.toString()}&views=latest-release&include[songs]=albums&fields[albums]=artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount&limit[artists:top-songs]=2&art[url]=f`)));
      chunkArtistData.forEach((chunkResult) =>
        chunkResult.data.data.forEach((item) => {
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
    } catch (error) {}
  }
  async function getRecentlyPlayed() {
    let hist = await app.mk.api.v3.music(`/v1/me/recent/played`, {
      l: this.$root.mklang,
      include: "tracks",
      "include[albums]": "catalog,tracks,artists",
      "include[songs]": "catalog,artists",
    });
    recentlyPlayed = hist.data.data;
  }
  async function getListenNowData() {
    app.mk.api.v3
      .music(
        `/v1/me/recommendations?timezone=${encodeURIComponent(app.formatTimezoneOffset())}&name=listen-now&with=friendsMix,library,social&art[social-profiles:url]=c&art[url]=c,f&omit[resource]=autos&relate[editorial-items]=contents&extend=editorialCard,editorialVideo&extend[albums]=artistUrl&extend[library-albums]=artistUrl,editorialVideo&extend[playlists]=artistNames,editorialArtwork,editorialVideo&extend[library-playlists]=artistNames,editorialArtwork,editorialVideo&extend[social-profiles]=topGenreNames&include[albums]=artists&include[songs]=artists&include[music-videos]=artists&fields[albums]=artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url&fields[artists]=name,url&extend[stations]=airDate,supportsAirTimeUpdates&meta[stations]=inflectionPoints&types=artists,albums,editorial-items,library-albums,library-playlists,music-movies,music-videos,playlists,stations,uploaded-audios,uploaded-videos,activities,apple-curators,curators,tv-shows,social-upsells&platform=web&l=${this.$root.mklang}`,
      )
      .then((data) => {
        console.log(data.data.data[1]);
        try {
          self.madeForYou = data.data.data.filter((section) => {
            if (section.meta.metrics.moduleType === "6") {
              return section;
            }
          })[0].relationships.contents.data;
        } catch (err) {}
        self.sectionsReady.push("madeForYou");

        try {
          self.friendsListeningTo = data.data.data.filter((section) => {
            if (section.meta.metrics.moduleType === "11") {
              return section;
            }
          })[0].relationships.contents.data;
        } catch (err) {}
        self.sectionsReady.push("recentlyPlayed");
        self.sectionsReady.push("friendsListeningTo");
      });

    app.mk.api.v3.music("/v1/me/social/profile/").then((response) => {
      self.profile = response.data.data[0];
    });
  }

  return (
    <div id="cider-home">
      <div className="content-inner home-page">
        <div v-if={page === "main"}>
          <div className="row">
            <div className="col">
              <div className="row">
                <div className="col nopadding">
                  <h3>{app.getLz("home.recentlyPlayed")}</h3>
                </div>
                <div className="col-auto nopadding cider-flex-center">
                  <button
                    className="cd-btn-seeall"
                    onClick={() => seeAllHistory()}>
                    {app.getLz("term.history")}
                  </button>
                  <button
                    className="cd-btn-seeall"
                    onClick={() => seeAllRecentlyPlayed()}>
                    {app.getLz("term.seeAll")}
                  </button>
                </div>
              </div>
              <div className="well artistfeed-well">
                {isSectionReady("recentlyPlayed") ? (
                  recentlyPlayed.limit(6).map((item) => (
                    <MediaItemListItem
                      item={item}
                      v-bind:key={item.id}
                    />
                  ))
                ) : (
                  <div className="spinner" />
                )}
              </div>
            </div>
            <div className="col">
              <div className="row">
                <div className="col nopadding">
                  <h3>{app.getLz("home.artistsFeed")}</h3>
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
                  <button
                    className="cd-btn-seeall"
                    onClick={() => app.appRoute("artist-feed")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </div>
              </div>
              <div
                className="well artistfeed-well"
                style={{ marginTop: 0 }}>
                {artistFeed.length > 0 ? (
                  artistFeed.limit(6).map((item) => (
                    <MediaItemListItem
                      item={item}
                      v-bind:key={item.id}
                    />
                  ))
                ) : followedArtists.length > 0 ? (
                  <div className="spinner" />
                ) : (
                  <div className="no-artist"> {app.getLz("home.artistsFeed.noArtist")}</div>
                )}
              </div>
            </div>
          </div>
          {/*            <div className="row" v-if={app.isDev}> */}
          {/*                <div className="col"> */}
          {/*                    <h3>Your Favorites</h3> */}
          {/*                    <div className="well"> */}
          {/*                        <div className="hint-text" v-if={favorites.length === 0}>Items you have added to your favorites will */}
          {/*                            appear here. */}
          {/*                        </div> */}
          {/*                        <MediaItemScrollerHorizontal kind="small" items="favorites" */}
          {/*                                                       item={item} /> */}
          {/*                    </div> */}
          {/*                </div> */}
          {/*            </div> */}
          <div
            className="row"
            v-if={!seenReplay}>
            <div className="col">
              <button
                className="md-btn md-btn-block md-btn-replay--hero"
                onClick={() => $root.appRoute("replay")}>
                {$root.getLz("term.replay")} {year}
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="row">
                <div className="col nopadding">
                  <h3>{app.getLz("home.madeForYou")}</h3>
                </div>
                <div className="col-auto nopadding cider-flex-center">
                  <button
                    className="md-btn md-btn-replay"
                    v-if={seenReplay}
                    onClick={() => $root.appRoute("replay")}>
                    {$root.getLz("term.replay")} {year}
                  </button>
                </div>
              </div>
              <div className="well">
                <MediaItemScrollerHorizontal
                  items="madeForYou"
                  v-if={isSectionReady("madeForYou")}
                />
                <div
                  className="spinner"
                  v-else
                />
              </div>
            </div>
          </div>
          <div
            className="row"
            v-if={friendsListeningTo && friendsListeningTo.length > 0}>
            <div className="col">
              <div className="row">
                <div className="col nopadding">
                  <h3>{app.getLz("home.friendsListeningTo")}</h3>
                </div>
                <div className="col-auto nopadding cider-flex-center">
                  <button
                    className="cd-btn-seeall"
                    onClick={() => app.showSocialListeningTo()}>
                    {app.getLz("term.seeAll")}
                  </button>
                </div>
              </div>
              <div className="well">
                <MediaItemScrollerHorizontal
                  items="friendsListeningTo"
                  v-if={isSectionReady("friendsListeningTo")}
                />
                <div
                  className="spinner"
                  v-else
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
