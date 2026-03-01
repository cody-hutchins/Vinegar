export const Component = () => {
  Vue.component("cider-library-videos", {
    template: "#cider-library-videos",
    props: ["data"],
    data: function () {
      return {
        videos: [],
        loaded: false,
      };
    },
    mounted() {
      this.$nextTick(async function () {
        if (this.$data.videos == null || this.$data.videos.length == 0) this.$data.videos = (await this.$root.mk.api.v3.music("/v1/me/library/music-videos")).data?.data ?? [];
        this.$data.loaded = true;
      });
    },
  });
  return (
    <div id="cider-library-videos">
      <div className="content-inner">
        <div className="row">
          <div
            className="col"
            style={{ padding: 0 }}>
            <h1 className="header-text">{$root.getLz("term.videos")}</h1>
          </div>
        </div>
        <div className="madeforyou-body">
          <template v-if="videos.length > 0">
            <mediaitem-square
              size="300"
              item="item"
              v-for="item in videos"></mediaitem-square>
          </template>
          <template v-else-if="loaded == true">
            <div>{$root.getLz("term.noVideos")}</div>
          </template>
        </div>
      </div>
    </div>
  );
};
