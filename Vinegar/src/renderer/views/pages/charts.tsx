export const Component = () => {
  Vue.component("cider-charts", {
    template: "#cider-charts",
    data: function () {
      return {
        app: this.$root,
        songs: [],
        albums: [],
        playlists: [],
        musicvideos: [],
        citycharts: [],
        globalcharts: [],
        categories: [],
      };
    },
    mounted() {
      this.getData();
    },
    methods: {
      getData() {
        let self = this;
        app.mk.api.v3
          .music(`/v1/catalog/${app.mk.storefrontId}/charts`, {
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
          })
          .then((res) => {
            let page = res.data?.results ?? [];
            self.songs = page.songs[0] ?? [];
            self.albums = page.albums[0] ?? [];
            self.playlists = page.playlists[0] ?? [];
            self.musicvideos = page["music-videos"][0] ?? [];
            self.citycharts = page.cityCharts[0] ?? [];
            self.globalcharts = page.dailyGlobalTopCharts[0] ?? [];
          });
        // let self = this;
        // app.mk.api.music(`/v1/catalog/${app.mk.storefrontId}/charts?types=songs%2Calbums%2Cplaylists&limit=36`).then(res => {
        //     let page = res.data?.results ?? [];
        //     self.songs = page.songs[0] ?? [];
        //     self.albums = page.albums[0] ?? [];
        //     self.playlists = page.playlists[0] ?? [];
        // })
      },
    },
  });
  return (
    <div id="cider-charts">
      <div className="content-inner">
        <h1 className="header-text">{$root.getLz("term.charts")}</h1>
        <template v-if="songs != []">
          <div className="row">
            <div className="col">
              <h3>{songs.name ?? ""}</h3>
            </div>
            <div
              className="col-auto cider-flex-center"
              v-if="songs.data.length > 12">
              <button
                className="cd-btn-seeall"
                click="app.showCollection((songs ?? []), songs.name ?? '', 'default')">
                {app.getLz("term.seeAll")}
              </button>
            </div>
          </div>
          <div className="mediaitem-list-item__grid">
            <listitem-horizontal items="(songs?.data ?? []).limit(12)"></listitem-horizontal>
          </div>
        </template>
        <template v-if="albums != []">
          <div className="row">
            <div className="col">
              <h3>{albums.name ?? ""}</h3>
            </div>
            <div
              className="col-auto cider-flex-center"
              v-if="songs.data.length > 12">
              <button
                className="cd-btn-seeall"
                click="app.showCollection((albums ?? []), albums.name ?? '', 'default')">
                {app.getLz("term.seeAll")}
              </button>
            </div>
          </div>
          <mediaitem-scroller-horizontal-large items="(albums?.data ?? []).limit(10)"></mediaitem-scroller-horizontal-large>
        </template>
        <template v-if="playlists != []">
          <div className="row">
            <div className="col">
              <h3>{playlists.name ?? ""}</h3>
            </div>
            <div
              className="col-auto cider-flex-center"
              v-if="playlists.data.length > 12">
              <button
                className="cd-btn-seeall"
                click="app.showCollection((playlists ?? []), playlists.name ?? '', 'default')">
                {app.getLz("term.seeAll")}
              </button>
            </div>
          </div>
          <mediaitem-scroller-horizontal-large items="(playlists?.data ?? []).limit(10)"></mediaitem-scroller-horizontal-large>
        </template>
        <template v-if="musicvideos != []">
          <div className="row">
            <div className="col">
              <h3>{musicvideos.name ?? ""}</h3>
            </div>
            <div
              className="col-auto cider-flex-center"
              v-if="musicvideos.data.length > 12">
              <button
                className="cd-btn-seeall"
                click="app.showCollection((musicvideos ?? []), musicvideos.name ?? '', 'default')">
                {app.getLz("term.seeAll")}
              </button>
            </div>
          </div>
          <mediaitem-scroller-horizontal-large items="(musicvideos?.data ?? []).limit(10)"></mediaitem-scroller-horizontal-large>
        </template>
        <template v-if="globalcharts != []">
          <div className="row">
            <div className="col">
              <h3>{globalcharts.name ?? ""}</h3>
            </div>
            <div
              className="col-auto cider-flex-center"
              v-if="globalcharts.data.length > 12">
              <button
                className="cd-btn-seeall"
                click="app.showCollection((globalcharts ?? []), globalcharts.name ?? '', 'default')">
                {app.getLz("term.seeAll")}
              </button>
            </div>
          </div>
          <mediaitem-scroller-horizontal-large items="(globalcharts?.data ?? []).limit(10)"></mediaitem-scroller-horizontal-large>
        </template>
        <template v-if="citycharts != []">
          <div className="row">
            <div className="col">
              <h3>{citycharts.name ?? ""}</h3>
            </div>
            <div
              className="col-auto cider-flex-center"
              v-if="citycharts.data.length > 12">
              <button
                className="cd-btn-seeall"
                click="app.showCollection((citycharts ?? []), citycharts.name ?? '', 'default')">
                {app.getLz("term.seeAll")}
              </button>
            </div>
          </div>
          <mediaitem-scroller-horizontal-large items="(citycharts?.data ?? []).limit(10)"></mediaitem-scroller-horizontal-large>
        </template>
      </div>
    </div>
  );
};
