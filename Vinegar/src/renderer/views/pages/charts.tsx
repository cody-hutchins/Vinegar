import { useEffect } from "react";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import ListItemHorizontal from "../components/listitem-horizontal.jsx";
import { Col, Row } from "react-bootstrap";

const Charts = () => {
  const app = this.$root;
  let songs = [];
  let albums = [];
  let playlists = [];
  let musicvideos = [];
  let citycharts = [];
  let globalcharts = [];
  const categories = [];

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    const res = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/charts`, {
      types: "albums,songs,music-videos,playlists",
      l: "en-gb",
      platform: "auto",
      limit: "50",
      genre: "34",
      include: "tracks",
      with: "cityCharts,dailyGlobalTopCharts",
      extend: "artistUrl",
      "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
      "fields[playlists]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url,curatorName",
    });
    const page = res.data?.results ?? [];
    songs = page.songs[0] ?? [];
    albums = page.albums[0] ?? [];
    playlists = page.playlists[0] ?? [];
    musicvideos = page["music-videos"][0] ?? [];
    citycharts = page.cityCharts[0] ?? [];
    globalcharts = page.dailyGlobalTopCharts[0] ?? [];
    // app.mk.api.music(`/v1/catalog/${app.mk.storefrontId}/charts?types=songs%2Calbums%2Cplaylists&limit=36`).then(res => {
    //     let page = res.data?.results ?? [];
    //     songs = page.songs[0] ?? [];
    //     albums = page.albums[0] ?? [];
    //     playlists = page.playlists[0] ?? [];
    // })
  }

  return (
    <div id={"cider-charts"}>
      <div className={"content-inner"}>
        <h1 className={"header-text"}>{$root.getLz("term.charts")}</h1>
        {songs !== [] && (
          <template>
            <Row>
              <Col>
                <h3>{songs.name ?? ""}</h3>
              </Col>
              {songs.data.length > 12 && (
                <Col
                  auto
                  className={"cider-flex-center"}>
                  <button
                    className={"cd-btn-seeall"}
                    onClick={() => app.showCollection(songs ?? [], songs.name ?? "", "default")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </Col>
              )}
            </Row>
            <div className={"mediaitem-list-item__grid"}>
              <ListItemHorizontal items={(songs?.data ?? []).limit(12)} />
            </div>
          </template>
        )}
        {albums !== [] && (
          <template>
            <Row>
              <Col>
                <h3>{albums.name ?? ""}</h3>
              </Col>
              {songs.data.length > 12 && (
                <Col
                  auto
                  className={"cider-flex-center"}>
                  <button
                    className={"cd-btn-seeall"}
                    onClick={() => app.showCollection(albums ?? [], albums.name ?? "", "default")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </Col>
              )}
            </Row>
            <MediaItemScrollerHorizontalLarge items={(albums?.data ?? []).limit(10)} />
          </template>
        )}
        {playlists !== [] && (
          <template>
            <Row>
              <Col>
                <h3>{playlists.name ?? ""}</h3>
              </Col>
              {playlists.data.length > 12 && (
                <Col
                  auto
                  className={"cider-flex-center"}>
                  <button
                    className={"cd-btn-seeall"}
                    onClick={() => app.showCollection(playlists ?? [], playlists.name ?? "", "default")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </Col>
              )}
            </Row>
            <MediaItemScrollerHorizontalLarge items={(playlists?.data ?? []).limit(10)} />
          </template>
        )}
        {musicvideos !== [] && (
          <template>
            <Row>
              <Col>
                <h3>{musicvideos.name ?? ""}</h3>
              </Col>
              {musicvideos.data.length > 12 && (
                <Col
                  auto
                  className={"cider-flex-center"}>
                  <button
                    className={"cd-btn-seeall"}
                    onClick={() => app.showCollection(musicvideos ?? [], musicvideos.name ?? "", "default")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </Col>
              )}
            </Row>
            <MediaItemScrollerHorizontalLarge items={(musicvideos?.data ?? []).limit(10)} />
          </template>
        )}
        {globalcharts !== [] && (
          <template>
            <Row>
              <Col>
                <h3>{globalcharts.name ?? ""}</h3>
              </Col>
              {globalcharts.data.length > 12 && (
                <Col
                  auto
                  className={"cider-flex-center"}>
                  <button
                    className={"cd-btn-seeall"}
                    onClick={() => app.showCollection(globalcharts ?? [], globalcharts.name ?? "", "default")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </Col>
              )}
            </Row>
            <MediaItemScrollerHorizontalLarge items={(globalcharts?.data ?? []).limit(10)} />
          </template>
        )}
        {citycharts !== [] && (
          <template>
            <Row>
              <Col>
                <h3>{citycharts.name ?? ""}</h3>
              </Col>
              {citycharts.data.length > 12 && (
                <Col
                  auto
                  className={"cider-flex-center"}>
                  <button
                    className={"cd-btn-seeall"}
                    onClick={() => app.showCollection(citycharts ?? [], citycharts.name ?? "", "default")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </Col>
              )}
            </Row>
            <MediaItemScrollerHorizontalLarge items={(citycharts?.data ?? []).limit(10)} />
          </template>
        )}
      </div>
    </div>
  );
};

export default Charts;
