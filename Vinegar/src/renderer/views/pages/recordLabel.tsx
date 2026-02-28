export const Component = () => {
  Vue.component("cider-recordlabel", {
    template: "#cider-recordlabel",
    props: ["data"],
    data: function () {
      return {
        topSongsExpanded: false,
        $root: this.$root,
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
    <div id="cider-recordlabel">
      <div className="content-inner artist-page">
        <div
          className="artist-header"
          style="getArtistPalette(data)">
          <div className="row">
            <div
              className="col-sm"
              style="width: auto;">
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
          <div v-if="$root.showingPlaylist.attributes.description">
            <div className="row">
              <h3>{$root.getLz("term.about")}</h3>
            </div>
            <div className="row">
              <div>{$root.showingPlaylist.attributes.description.standard}</div>
            </div>
          </div>
          <template v-if="data.views && data.views['latest-releases']">
            <div className="row">
              <div className="col">
                <h3>{data.views["latest-releases"].attributes.title ?? ""}</h3>
              </div>
              <div
                className="col-auto cider-flex-center"
                v-if="data.views['latest-releases'].data.length >= 10">
                <button
                  className="cd-btn-seeall"
                  click="$root.showRecordLabelView(data.id, data.attributes.name + ' -  Latest Releases', 'latest-releases')">
                  {$root.getLz("term.seeAll")}
                </button>
              </div>
            </div>
            <mediaitem-square
              item="item"
              v-for="item in data.views['latest-releases'].data"></mediaitem-square>
          </template>
          <template v-if="data.views && data.views['top-releases']">
            <div className="row">
              <div className="col">
                <h3>{data.views["top-releases"].attributes.title ?? ""}</h3>
              </div>
              <div
                className="col-auto cider-flex-center"
                v-if="data.views['top-releases'].data.length >= 10">
                <button
                  className="cd-btn-seeall"
                  click="$root.showRecordLabelView(data.id, data.attributes.name + ' -  Top Releases', 'top-releases')">
                  {$root.getLz("term.seeAll")}
                </button>
              </div>
            </div>
            <mediaitem-square
              item="item"
              v-for="item in data.views['top-releases'].data"></mediaitem-square>
          </template>
          <template v-if="data.relationships && data.relationships.playlists && data.relationships.playlists.data.length > 0">
            <div className="row">
              <div className="col">
                <h3>{$root.getLz("term.playlists")}</h3>
              </div>
              <div
                className="col-auto cider-flex-center"
                v-if="data.relationships.playlists.data.length >= 5">
                <button
                  className="cd-btn-seeall"
                  click="$root.showCollection(data.relationships.playlists, data.attributes.name + ' -  Playlists', 'curator')">
                  {$root.getLz("term.seeAll")}
                </button>
              </div>
            </div>
            <mediaitem-square
              item="item"
              v-for="item in data.relationships.playlists.data.limit(5)"></mediaitem-square>
          </template>
        </div>
      </div>
    </div>
  );
};
