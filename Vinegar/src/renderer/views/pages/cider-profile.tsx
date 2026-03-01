export const Component = () => {
  Vue.component("cider-socialprofile", {
    template: "#cider-socialprofile",
    props: ["data"],
    data: function () {
      return {
        topSongsExpanded: false,
        app: this.$root,
      };
    },
    methods: {
      getArtistPalette(artist) {
        if (artist?.attributes?.artwork != null) {
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
      },
      getTopResult() {
        if (this.search.results["meta"]) {
          return this.search.results[this.search.results.meta.results.order[0]]["data"][0];
        } else {
          return false;
        }
      },
    },
  });
  return (
    <div id="cider-socialprofile">
      <div className="content-inner artist-page profile-page">
        <div
          className="artist-header"
          style={getArtistPalette(data)}>
          <div className="row">
            <div
              className="col-sm"
              style={{ width: auto }}>
              <div className="artist-image">
                <mediaitem-artwork
                  shadow="large"
                  url="data.attributes.artwork ? data.attributes.artwork.url : ''"
                  size="220"
                  type="artists"></mediaitem-artwork>
              </div>
            </div>
            <div className="col cider-flex-center">
              <h1>{data.attributes.name}</h1>
            </div>
          </div>
        </div>
        <div className="artist-body">
          <template v-if="data.relationships && data.relationships['shared-playlists']">
            <div className="row">
              <div className="col">
                <h3>{"Shared Playlists" ?? ""}</h3>
              </div>
              <div
                className="col-auto cider-flex-center"
                v-if="data.relationships['shared-playlists'].data.length >= 10">
                <button
                  className="cd-btn-seeall"
                  click="app.showCollection(data.relationships['shared-playlists'],'Shared Playlists' ?? '', 'default')">
                  {app.getLz("term.seeAll")}
                </button>
              </div>
            </div>
            <mediaitem-square
              item="item"
              v-for="item in data.relationships['shared-playlists'].data.limit(10)"></mediaitem-square>
          </template>
        </div>
      </div>
    </div>
  );
};
