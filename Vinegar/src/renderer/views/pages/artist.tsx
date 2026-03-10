import AnimatedArtworkView from "../components/animatedartwork-view.jsx";
import ArtworkMaterial from "../components/artwork-material.jsx";
import ListitemHorizontal from "../components/listitem-horizontal.jsx";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";

const Artist = ({ data }: { data: object }) => {
  const topSongsExpanded = false;
  const app = this.$root;
  let headerVisible = true;
  function hasAnimated() {
    if (data.attributes?.editorialVideo && (data.attributes?.editorialVideo?.motionArtistWide16x9 || data.attributes?.editorialVideo?.motionArtistFullscreen16x9)) {
      return true;
    }
    return false;
  }
  function hasHero() {
    if (data.attributes?.editorialArtwork?.centeredFullscreenBackground) {
      return data.attributes?.editorialArtwork?.centeredFullscreenBackground.url;
    } else if (data.attributes?.editorialArtwork?.bannerUber) {
      return data.attributes?.editorialArtwork?.bannerUber.url;
    } else if (data.attributes?.editorialArtwork?.subscriptionHero) {
      return data.attributes?.editorialArtwork?.subscriptionHero.url;
    }
    return false;
  }
  function hasHeroObject() {
    if (data.attributes?.editorialArtwork?.centeredFullscreenBackground) {
      return data.attributes?.editorialArtwork?.centeredFullscreenBackground;
    } else if (data.attributes?.editorialArtwork?.bannerUber) {
      return data.attributes?.editorialArtwork?.bannerUber;
    } else if (data.attributes?.editorialArtwork?.subscriptionHero) {
      return data.attributes?.editorialArtwork?.subscriptionHero;
    }
    return [];
  }
  function isHeaderVisible(visible) {
    headerVisible = visible;
  }
  async function artistMenu(event) {
    let followAction = "follow";
    const followActions = {
      follow: {
        icon: "./assets/feather/plus-circle.svg",
        name: app.getLz("action.follow"),
        action: () => {
          self.app.cfg.home.followedArtists.push(self.data.id);
        },
      },
      unfollow: {
        icon: "./assets/feather/x-circle.svg",
        name: app.getLz("action.unfollow"),
        action: () => {
          const index = self.app.cfg.home.followedArtists.indexOf(self.data.id);
          if (index > -1) {
            self.app.cfg.home.followedArtists.splice(index, 1);
          }
        },
      },
    };
    const favoriteActions = {
      favorite: {
        icon: "./assets/star.svg",
        name: app.getLz("action.favorite"),
        action: () => {
          app.setArtistFavorite(app.artistPage.data.id, true);
        },
      },
      removeFavorite: {
        icon: "./assets/star.svg",
        name: app.getLz("action.removeFavorite"),
        action: () => {
          app.setArtistFavorite(app.artistPage.data.id, false);
        },
      },
    };
    if (app.cfg.home.followedArtists.includes(self.data.id)) {
      followAction = "unfollow";
    }
    const inFavorites = (
      await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists/${app.artistPage.data.id}`, {
        "fields[artists]": "inFavorites",
      })
    ).data.data[0].attributes?.inFavorites;
    app.showMenuPanel(
      {
        items: [
          {
            icon: "./assets/feather/play.svg",
            name: app.getLz("action.startRadio"),
            action: () => {
              app.mk.setStationQueue({ artist: self.data.id }).then(() => {
                app.mk.play();
              });
            },
          },
          favoriteActions[inFavorites ? "removeFavorite" : "favorite"],
          // followActions[followAction],
          {
            icon: "./assets/feather/share.svg",
            name: app.getLz("term.share"),
            action: () => {
              self.app.copyToClipboard(self.data.attributes.url);
            },
          },
        ],
      },
      event,
    );
  }
  function getArtistPalette(artist) {
    if (artist["attributes"]["artwork"]) {
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
      <div id={"cider-artist"}>
        <div
          className={"content-inner artist-page"}
          className={"[(data.attributes.editorialVideo && (data.attributes.editorialVideo.motionArtistWide16x9 || data.attributes.editorialVideo.motionArtistFullscreen16x9) || hasHero()) ? 'animated' : '']"}>
          <div
            className={"['artist-header', { 'artist-header-compact': app.cfg.visual.compactArtistHeader }]"}
            key={data.id}
            v-observe-visibility={"{callback: isHeaderVisible}"}>
            {hasAnimated() && (
              <AnimatedArtworkView
                priority={"true"}
                video={data.attributes.editorialVideo.motionArtistWide16x9.video ?? data.attributes.editorialVideo.motionArtistFullscreen16x9.video ?? ""}
              />
            )}
            <div
              className={"header-content"}
              style={{ pointerEvents: all }}>
              <div className={"row"}>
                <div
                  className={"col-auto"}
                  style={{ width: auto }}>
                  {!(data.attributes.editorialVideo && (data.attributes.editorialVideo.motionArtistWide16x9 || data.attributes.editorialVideo.motionArtistFullscreen16x9)) && !hasHero() && (
                    <div className={"artist-image"}>
                      <MediaItemArtwork
                        shadow={"large"}
                        url={data.attributes.artwork ? data.attributes.artwork.url : ""}
                        size={"190"}
                        type={"artists"}
                      />
                      <button
                        className={"overlay-play"}
                        onClick={() =>
                          app.mk.setStationQueue({ artist: "a-" + data.id }).then(() => {
                            app.mk.play();
                          })
                        }
                        aria-label={app.getLz("term.play")}>
                        {import("../svg/play.svg")}
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={"col cider-flex-center artist-title"}
                  className={"{'artist-animation-on': (data.attributes.editorialVideo && (data.attributes.editorialVideo.motionArtistWide16x9 || data.attributes.editorialVideo.motionArtistFullscreen16x9)) || hasHero() }"}
                  style={{ color: "#" + hasHeroObject()?.textColor1 ?? "" }}>
                  <button
                    className={"artist-play"}
                    onClick={() =>
                      app.mk.setStationQueue({ artist: "a-" + data.id }).then(() => {
                        app.mk.play();
                      })
                    }
                    aria-label={app.getLz("term.play")}>
                    {import("../svg/play.svg")}
                  </button>
                  <h1>{data.attributes.name}</h1>
                </div>
              </div>
              <button
                className={"more-btn-round favorite"}
                onClick={() => artistMenu}
                style={{ pointerEvents: all }}
                aria-label={app.getLz("term.more")}>
                <div className={"svg-icon"} />
              </button>
              <button
                className={"more-btn-round menu"}
                onClick={() => artistMenu}
                style={{ pointerEvents: all }}
                aria-label={app.getLz("term.more")}>
                <div className={"svg-icon"} />
              </button>
            </div>
            {!(data.attributes.editorialVideo && (data.attributes.editorialVideo.motionArtistWide16x9 || data.attributes.editorialVideo.motionArtistFullscreen16x9)) && !hasHero() && (
              <div className={"artworkContainer"}>
                <ArtworkMaterial
                  url={data.attributes.artwork.url}
                  size={"190"}
                  images={"1"}
                />
              </div>
            )}
            {hasHero() && !hasAnimated() && (
              <div className={"artist-hero"}>
                <MediaItemArtwork
                  shadow={"none"}
                  url={hasHero()}
                  size={"2048"}
                />
              </div>
            )}
          </div>
          <div
            className={"floating-header"}
            style={{ opacity: headerVisible ? 0 : 1, pointerEvents: headerVisible ? "none" : "" }}>
            <div className={"row"}>
              <div className={"col-auto cider-flex-center"}>
                <button
                  className={"artist-play"}
                  style={{ display: "block" }}
                  onClick={() =>
                    app.mk.setStationQueue({ artist: "a-" + data.id }).then(() => {
                      app.mk.play();
                    })
                  }
                  aria-label={app.getLz("term.play")}>
                  {import("../svg/play.svg")}
                </button>
              </div>
              <div className={"col"}>
                <h3>{data.attributes.name}</h3>
              </div>
              <div className={"col-auto cider-flex-center"}>
                <button
                  className={"more-btn-round menu"}
                  onClick={() => artistMenu}
                  aria-label={app.getLz("term.more")}>
                  <div className={"svg-icon"} />
                </button>
              </div>
            </div>
          </div>
          <div className={"artist-body"}>
            <div
              className={"arow well"}
              className={"{arowb: data.views['latest-release'].data.length === 0}"}>
              {data.views["latest-release"].data.length !== 0 && (
                <div className={"latestRelease"}>
                  <h3>{app.getLz("term.latestReleases")}</h3>
                  <div style={{ width: "auto", margin: "0 auto" }}>
                    {data.views["latest-release"].data.map((song) => (
                      <MediaItemSquare
                        kind={"card"}
                        no-scale={"true"}
                        item={song}
                      />
                    ))}
                  </div>
                </div>
              )}
              {data.views["top-songs"] && (
                <div className={"topSongs"}>
                  <div className={"row"}>
                    <div
                      className={"col"}
                      style={{ padding: 0 }}>
                      <h3>{app.getLz("term.topSongs")}</h3>
                    </div>
                  </div>
                  <div className={"row"}>
                    <div
                      className={"col cider-flex-center"}
                      style={{ padding: 0 }}>
                      <div className={"mediaitem-list-item__grid"}>
                        <ListitemHorizontal items={data.views["top-songs"].data.limit(20)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={"row well"}>
              <div className={"col"}>
                {data.meta.views.order.map(
                  (view) =>
                    data.views[view].data.length !== 0 &&
                    view !== "latest-release" &&
                    view !== "top-songs" && (
                      <>
                        <div className={"row"}>
                          <div className={"col"}>
                            <h3>{data.views[view].attributes.title ? data.views[view].attributes.title : "???"}</h3>
                          </div>
                        </div>
                        {!((data.views[view].attributes.title ? data.views[view].attributes.title : "???").includes("Video") || (data.views[view].attributes.title ? data.views[view].attributes.title : "???").includes("More To See")) ? <MediaItemScrollerHorizontalLarge items={data.views[view].data.limit(10)} /> : <MediaItemScrollerHorizontalMVView items={data.views[view].data.limit(10)} />}
                      </>
                    ),
                )}
                <div className={"row"}>
                  {data.attributes.artistBio && (
                    <div className={"col"}>
                      <h3>{$root.stringTemplateParser($root.getLz("term.aboutArtist"), { artistName: data.attributes.name })}</h3>
                      <p dangerouslySetInnerHTML={{ __html: data.attributes.artistBio }} />
                    </div>
                  )}
                  <div className={"col"}>
                    {data.attributes.origin && (
                      <div>
                        <h3>{data.attributes.isGroup ? "Origin" : "Hometown"}</h3>
                        {data.attributes.origin}
                      </div>
                    )}
                    {data.attributes.bornOrFormed && (
                      <div>
                        <h3>{data.attributes.isGroup ? "Formed" : "Born"}</h3>
                        {data.attributes.bornOrFormed}
                      </div>
                    )}
                    {data.attributes.genreNames && (
                      <div>
                        <h3>{app.getLz("term.sortBy.genre")}</h3>
                        {data.attributes.genreNames.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Artist;
