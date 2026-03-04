import { useEffect } from "react";

const AnimatedArtworkView = ({ video, priority = false }: { video: string; priority: boolean }) => {
  const app = this.$root;
  let hls = null;
  const mounted = () => {
    if (!priority && app.cfg.visual.animated_artwork == "limited") {
      return;
    } else if (app.cfg.visual.animated_artwork == "disabled") {
      return;
    }
    if (video) {
      setTimeout(() => {
        let config = {
          backBufferLength: 0,
          enableWebVTT: false,
          enableCEA708Captions: false,
          emeEnabled: false,
          abrEwmaDefaultEstimate: 10000,
          testBandwidth: false,
        };
        if (hls) {
          hls.detachMedia();
        } else {
          hls = new CiderHls(config);
        }
        // bind them together
        if (this.$refs.video) {
          let d = "WIDEVINE_SOFTWARE";
          let h = {
            initDataTypes: ["cenc", "keyids"],
            distinctiveIdentifier: "optional",
            persistentState: "required",
          };
          let p = {
            platformInfo: { requiresCDMAttachOnStart: !0, maxSecurityLevel: d, keySystemConfig: h },
            appData: { serviceName: "Apple Music" },
          };

          hls.attachMedia(this.$refs.video);
          hls.loadSource(video, p);
          let u = hls;
          let quality = app.cfg.visual.animated_artwork_qualityLevel;
          setTimeout(() => {
            let levelsnum = u.levels.map((level) => {
              return level.width;
            });
            if (levelsnum.length > 0) {
              let qualities = [];
              let qualities2 = [];
              for (let i = 0; i < levelsnum.length; i++) {
                if (qualities2.indexOf(levelsnum[i]) == -1) {
                  qualities.push({ level: i, quality: levelsnum[i] });
                  qualities2.push(levelsnum[i]);
                }
              }
              let actualnum = Math.floor(qualities[qualities.length - 1].level * (quality / 4));
              if (quality != 0) {
                quality = qualities[Math.min(actualnum, qualities.length - 1)].level;
              }
              if (quality == 4) {
                quality = qualities[qualities.length - 1].level;
              }
            }
            try {
              hls.loadLevel = parseInt(quality || 1);
            } catch (e) {}
          }, 200);
        }
      });
    }
  };

  const beforeDestroy = () => {
    if (hls) {
      hls.destroy().then();
      hls = null;
    }
  };

  useEffect(() => {
    mounted();
    return beforeDestroy;
  }, []);

  return (
    <div id="animatedartwork-view">
      <div
        className="animated"
        v-bind:vid="app.hashCode(video).toString()"
        v-if="video">
        <video
          ref="video"
          className="animated-artwork-video"
          loop
          id="animated-artwork"
        />
      </div>
    </div>
  );
};
export default AnimatedArtworkView;
