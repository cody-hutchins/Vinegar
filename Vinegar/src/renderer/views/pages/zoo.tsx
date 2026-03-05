import { useEffect } from "react";
import ArtistChip from "../components/artist-chip.jsx";
import SVGIcon from "../../main/components/svg-icon.jsx";

const Zoo = () => {
  let artistLoaded = false;
  let artist = {};
  async function mounted() {
    app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists/669831761`).then((response) => {
      artist = response.data.data[0];
      artistLoaded = true;
    });
  }
  useEffect(() => {
    mounted().then();
  }, []);
  return (
    <div id="cider-zoo">
      <div className="content-inner">
        <SVGIcon />
        <h3>Welcome to element park. *BERR NERR NERR NERR NERRRRR BERR NER NER NER NERRR BERRR NR NR NRRRR*</h3>
        <button onClick={() => app.playMediaItemById("1592151778", "album")}>Play Test Album</button>
        {$store.state.test}
        <div className="spinner" />
        <button className="md-btn">Cider Button</button>
        <ArtistChip
          v-if={artistLoaded}
          item={artist}
        />

        <amp-chrome-player />
        {/* <amp-footer-player/>  */}
        <hr />
        <amp-lcd-progress />
        <hr />
        <amp-playback-controls-shuffle />
        <apple-music-playback-controls theme="dark" />
        <apple-music-progress theme="dark" />
        <apple-music-volume theme="dark" />
        <amp-user-menu />
        <amp-tv-overlay />
        <amp-podcast-playback-controls />
        <amp-lcd />
      </div>
    </div>
  );
};

export default Zoo;
