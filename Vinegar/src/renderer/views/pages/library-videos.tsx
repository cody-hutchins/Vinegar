import { useEffect } from "react";

const Component = ({ data }: { data: object }) => {
  let videos = [];
  let loaded = false;
  useEffect(() => {
    setTimeout(async () => {
      if (this.$data.videos === null || this.$data.videos.length === 0) this.$data.videos = (await this.$root.mk.api.v3.music("/v1/me/library/music-videos")).data?.data ?? [];
      this.$data.loaded = true;
    });
  }, []);

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
          <template v-if={videos.length > 0}>
            <MediaItemSquare
              size="300"
              item={item}
              v-for={item in videos}
            />
          </template>
          <template v-else-if="loaded === true">
            <div>{$root.getLz("term.noVideos")}</div>
          </template>
        </div>
      </div>
    </div>
  );
};
