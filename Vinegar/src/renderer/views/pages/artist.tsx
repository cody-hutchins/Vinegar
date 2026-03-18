import { Col, Row } from "react-bootstrap";
import AnimatedArtworkView from "../components/animatedartwork-view.jsx";
import ArtworkMaterial from "../components/artwork-material.jsx";
import ListitemHorizontal from "../components/listitem-horizontal.jsx";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import classNames from "classnames";
import { useOnInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";

const Artist = ({ data }: { data: object }) => {
  const { t } = useTranslation();
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
  const ref = useOnInView(isHeaderVisible);
  async function artistMenu(event) {
    // let followAction = "follow";
    // const followActions = {
    //   follow: {
    //     icon: "./assets/feather/plus-circle.svg",
    //     name: t("action.follow"),
    //     action: () => {
    //       app.cfg.home.followedArtists.push(data.id);
    //     },
    //   },
    //   unfollow: {
    //     icon: "./assets/feather/x-circle.svg",
    //     name: t("action.unfollow"),
    //     action: () => {
    //       const index = app.cfg.home.followedArtists.indexOf(data.id);
    //       if (index > -1) {
    //         app.cfg.home.followedArtists.splice(index, 1);
    //       }
    //     },
    //   },
    // };
    const favoriteActions = {
      favorite: {
        icon: "./assets/star.svg",
        name: t("action.favorite"),
        action: () => {
          app.setArtistFavorite(app.artistPage.data.id, true);
        },
      },
      removeFavorite: {
        icon: "./assets/star.svg",
        name: t("action.removeFavorite"),
        action: () => {
          app.setArtistFavorite(app.artistPage.data.id, false);
        },
      },
    };
    // if (app.cfg.home.followedArtists.includes(data.id)) {
    //   followAction = "unfollow";
    // }
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
            name: t("action.startRadio"),
            action: () => {
              app.mk.setStationQueue({ artist: data.id }).then(() => {
                app.mk.play();
              });
            },
          },
          favoriteActions[inFavorites ? "removeFavorite" : "favorite"],
          // followActions[followAction],
          {
            icon: "./assets/feather/share.svg",
            name: t("term.share"),
            action: () => {
              app.copyToClipboard(data.attributes.url);
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
    <div id={"cider-artist"}>
      <div className={classNames("content-inner", "artist-page", (data.attributes.editorialVideo && (data.attributes.editorialVideo.motionArtistWide16x9 || data.attributes.editorialVideo.motionArtistFullscreen16x9)) || hasHero() ? "animated" : "")}>
        <div
          ref={ref}
          className={classNames("artist-header", { "artist-header-compact": app.cfg.visual.compactArtistHeader })}
          key={data.id}>
          {hasAnimated() && (
            <AnimatedArtworkView
              priority={true}
              video={data.attributes.editorialVideo.motionArtistWide16x9.video ?? data.attributes.editorialVideo.motionArtistFullscreen16x9.video ?? ""}
            />
          )}
          <div
            className={"header-content"}
            style={{ pointerEvents: "all" }}>
            <Row>
              <Col
                auto
                style={{ width: "auto" }}>
                {!(data.attributes.editorialVideo && (data.attributes.editorialVideo.motionArtistWide16x9 || data.attributes.editorialVideo.motionArtistFullscreen16x9)) && !hasHero() && (
                  <div className={"artist-image"}>
                    <MediaItemArtwork
                      shadow={"large"}
                      url={data.attributes.artwork ? data.attributes.artwork.url : ""}
                      imagesize={"190"}
                      type={"artists"}
                    />
                    <button
                      className={"overlay-play"}
                      onClick={() =>
                        app.mk.setStationQueue({ artist: "a-" + data.id }).then(() => {
                          app.mk.play();
                        })
                      }
                      aria-label={t("term.play")}>
                      {import("../svg/play.svg")}
                    </button>
                  </div>
                )}
              </Col>
              <Col
                className={classNames("cider-flex-center artist-title", { "artist-animation-on": (data.attributes.editorialVideo && (data.attributes.editorialVideo.motionArtistWide16x9 || data.attributes.editorialVideo.motionArtistFullscreen16x9)) || hasHero() })}
                style={{ color: hasHeroObject()?.textColor1 ? "#" + hasHeroObject().textColor1 : "" }}>
                <button
                  className={"artist-play"}
                  onClick={() =>
                    app.mk.setStationQueue({ artist: "a-" + data.id }).then(() => {
                      app.mk.play();
                    })
                  }
                  aria-label={t("term.play")}>
                  {import("../svg/play.svg")}
                </button>
                <h1>{data.attributes.name}</h1>
              </Col>
            </Row>
            <button
              className={"more-btn-round favorite"}
              onClick={artistMenu}
              style={{ pointerEvents: "all" }}
              aria-label={t("term.more")}>
              <div className={"svg-icon"} />
            </button>
            <button
              className={"more-btn-round menu"}
              onClick={artistMenu}
              style={{ pointerEvents: "all" }}
              aria-label={t("term.more")}>
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
          style={{ opacity: headerVisible ? 0 : 1, pointerEvents: headerVisible ? "none" : "inherit" }}>
          <Row>
            <Col
              auto
              className={"cider-flex-center"}>
              <button
                className={"artist-play"}
                style={{ display: "block" }}
                onClick={() =>
                  app.mk.setStationQueue({ artist: "a-" + data.id }).then(() => {
                    app.mk.play();
                  })
                }
                aria-label={t("term.play")}>
                {import("../svg/play.svg")}
              </button>
            </Col>
            <Col>
              <h3>{data.attributes.name}</h3>
            </Col>
            <Col
              auto
              className={"cider-flex-center"}>
              <button
                className={"more-btn-round menu"}
                onClick={() => artistMenu}
                aria-label={t("term.more")}>
                <div className={"svg-icon"} />
              </button>
            </Col>
          </Row>
        </div>
        <div className={"artist-body"}>
          <div className={classNames("arow well", { arowb: data.views["latest-release"].data.length === 0 })}>
            {data.views["latest-release"].data.length !== 0 && (
              <div className={"latestRelease"}>
                <h3>{t("term.latestReleases")}</h3>
                <div style={{ width: "auto", margin: "0 auto" }}>
                  {data.views["latest-release"].data.map((song) => (
                    <MediaItemSquare
                      key={song.id}
                      kind={"card"}
                      no-scale={true}
                      item={song}
                    />
                  ))}
                </div>
              </div>
            )}
            {data.views["top-songs"] && (
              <div className={"topSongs"}>
                <Row>
                  <Col style={{ padding: 0 }}>
                    <h3>{t("term.topSongs")}</h3>
                  </Col>
                </Row>
                <Row>
                  <Col
                    className={"cider-flex-center"}
                    style={{ padding: 0 }}>
                    <div className={"mediaitem-list-item__grid"}>
                      <ListitemHorizontal items={data.views["top-songs"].data.limit(20)} />
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
          <Row className={"well"}>
            <Col>
              {data.meta.views.order.map(
                (view) =>
                  data.views[view].data.length !== 0 &&
                  view !== "latest-release" &&
                  view !== "top-songs" && (
                    <>
                      <Row>
                        <Col>
                          <h3>{data.views[view].attributes.title ? data.views[view].attributes.title : "???"}</h3>
                        </Col>
                      </Row>
                      {!((data.views[view].attributes.title ? data.views[view].attributes.title : "???").includes("Video") || (data.views[view].attributes.title ? data.views[view].attributes.title : "???").includes("More To See")) ? <MediaItemScrollerHorizontalLarge items={data.views[view].data.limit(10)} /> : <MediaItemScrollerHorizontalMVView items={data.views[view].data.limit(10)} />}
                    </>
                  ),
              )}
              <Row>
                {data.attributes.artistBio && (
                  <Col>
                    <h3>{$root.stringTemplateParser(t("term.aboutArtist"), { artistName: data.attributes.name })}</h3>
                    <p dangerouslySetInnerHTML={{ __html: data.attributes.artistBio }} />
                  </Col>
                )}
                <Col>
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
                      <h3>{t("term.sortBy.genre")}</h3>
                      {data.attributes.genreNames.join(", ")}
                    </div>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Artist;
