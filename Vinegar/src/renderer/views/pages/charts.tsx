import { useEffect } from "react";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import ListItemHorizontal from "../components/listitem-horizontal.jsx";

const Charts = () => {
  const app = this.$root;
  const songs = [];
  const albums = [];
  const playlists = [];
  const musicvideos = [];
  const citycharts = [];
  const globalcharts = [];
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
    const self: Record<string, any> = {};
    const page = res.data?.results ?? [];
    self.songs = page.songs[0] ?? [];
    self.albums = page.albums[0] ?? [];
    self.playlists = page.playlists[0] ?? [];
    self.musicvideos = page["music-videos"][0] ?? [];
    self.citycharts = page.cityCharts[0] ?? [];
    self.globalcharts = page.dailyGlobalTopCharts[0] ?? [];
    return self;
    // app.mk.api.music(`/v1/catalog/${app.mk.storefrontId}/charts?types=songs%2Calbums%2Cplaylists&limit=36`).then(res => {
    //     let page = res.data?.results ?? [];
    //     self.songs = page.songs[0] ?? [];
    //     self.albums = page.albums[0] ?? [];
    //     self.playlists = page.playlists[0] ?? [];
    // })
  }

  return (
    <>
      <div id={"cider-charts"}>
        <div className={"content-inner"}>
          <h1 className={"header-text"}>{$root.getLz("term.charts")}</h1>
          {songs !== [] && (
            <template>
              <div className={"row"}>
                <div className={"col"}>
                  <h3>{songs.name ?? ""}</h3>
                </div>
                {songs.data.length > 12 && (
                  <div className={"col-auto cider-flex-center"}>
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => app.showCollection(songs ?? [], songs.name ?? "", "default")}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                )}
              </div>
              <div className={"mediaitem-list-item__grid"}>
                <ListItemHorizontal items={(songs?.data ?? []).limit(12)} />
              </div>
            </template>
          )}
          {albums !== [] && (
            <template>
              <div className={"row"}>
                <div className={"col"}>
                  <h3>{albums.name ?? ""}</h3>
                </div>
                {songs.data.length > 12 && (
                  <div className={"col-auto cider-flex-center"}>
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => app.showCollection(albums ?? [], albums.name ?? "", "default")}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                )}
              </div>
              <MediaItemScrollerHorizontalLarge items={(albums?.data ?? []).limit(10)} />
            </template>
          )}
          {playlists !== [] && (
            <template>
              <div className={"row"}>
                <div className={"col"}>
                  <h3>{playlists.name ?? ""}</h3>
                </div>
                {playlists.data.length > 12 && (
                  <div className={"col-auto cider-flex-center"}>
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => app.showCollection(playlists ?? [], playlists.name ?? "", "default")}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                )}
              </div>
              <MediaItemScrollerHorizontalLarge items={(playlists?.data ?? []).limit(10)} />
            </template>
          )}
          {musicvideos !== [] && (
            <template>
              <div className={"row"}>
                <div className={"col"}>
                  <h3>{musicvideos.name ?? ""}</h3>
                </div>
                {musicvideos.data.length > 12 && (
                  <div className={"col-auto cider-flex-center"}>
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => app.showCollection(musicvideos ?? [], musicvideos.name ?? "", "default")}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                )}
              </div>
              <MediaItemScrollerHorizontalLarge items={(musicvideos?.data ?? []).limit(10)} />
            </template>
          )}
          {globalcharts !== [] && (
            <template>
              <div className={"row"}>
                <div className={"col"}>
                  <h3>{globalcharts.name ?? ""}</h3>
                </div>
                {globalcharts.data.length > 12 && (
                  <div className={"col-auto cider-flex-center"}>
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => app.showCollection(globalcharts ?? [], globalcharts.name ?? "", "default")}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                )}
              </div>
              <MediaItemScrollerHorizontalLarge items={(globalcharts?.data ?? []).limit(10)} />
            </template>
          )}
          {citycharts !== [] && (
            <template>
              <div className={"row"}>
                <div className={"col"}>
                  <h3>{citycharts.name ?? ""}</h3>
                </div>
                {citycharts.data.length > 12 && (
                  <div className={"col-auto cider-flex-center"}>
                    <button
                      className={"cd-btn-seeall"}
                      onClick={() => app.showCollection(citycharts ?? [], citycharts.name ?? "", "default")}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                )}
              </div>
              <MediaItemScrollerHorizontalLarge items={(citycharts?.data ?? []).limit(10)} />
            </template>
          )}
        </div>
      </div>
    </>
  );
};

export default Charts;
