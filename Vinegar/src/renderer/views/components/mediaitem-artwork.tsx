import AnimatedartworkView from "./animatedartwork-view.jsx";

const MediaItemArtwork = ({ size = "120", width, bgcolor = "", url = "", type = "", video, videoPriority, shadow = "", upscaling = false }: { size: string | number; width?: string | number; bgcolor?: string; url?: string; type?: string; video?: string; videoPriority?: boolean; shadow?: string; upscaling?: boolean }) => {
  const app = this.$root;
  const isVisible = false;
  const style = {
    "box-shadow": "",
  };
  const awStyle = {
    background: bgcolor,
  };
  const imgStyle = {
    opacity: 0,
    transition: "opacity .25s linear",
  };
  const classes = [];
  const imgSrc = "";

  const computed = {
    windowRelativeScale: function () {
      return app.$store.state.windowRelativeScale;
    },
  };

  const watch = {
    windowRelativeScale: function (newValue, oldValue) {
      swapImage(newValue);
    },
    url: function (newValue, oldValue) {
      imgSrc = app.getMediaItemArtwork(url, size, width);
    },
  };

  function mounted() {
    getClasses();
    imgSrc = app.getMediaItemArtwork(url, size, width);
  }

  const swapImage = (newValue) => {
    if (!upscaling || window.devicePixelRatio !== 1) return;
    if (newValue > 1.5) {
      imgSrc = app.getMediaItemArtwork(url, parseInt(size * 2.0), parseInt(size * 2.0));
    }
  };

  const imgLoaded = () => {
    imgStyle.opacity = 1;
    swapImage(app.$store.state.windowRelativeScale);
    // awStyle.background = ""
  };

  const contextMenu = (event) => {
    app.showMenuPanel(
      {
        items: {
          save: {
            name: app.getLz("action.openArtworkInBrowser"),
            action: () => {
              window.open(app.getMediaItemArtwork(self.url, 1024, 1024));
            },
          },
        },
      },
      event,
    );
  };

  const getVideoPriority = () => {
    if (app.cfg.visual.animated_artwork == "always") {
      return true;
    } else if (videoPriority && app.cfg.visual.animated_artwork == "limited") {
      return true;
    } else if (app.cfg.visual.animated_artwork == "disabled") {
      return false;
    }
    return videoPriority;
  };

  const getClasses = () => {
    switch (shadow) {
      case "none":
        classes.push("no-shadow");
        break;
      case "large":
        classes.push("shadow");
        break;
      case "subtle":
        classes.push("subtle-shadow");
        break;
      default:
        break;
    }
    return classes;
  };

  const getArtworkStyle = () => {
    return {
      width: size + "px",
      height: size + "px",
    };
  };

  return (
    <div id="mediaitem-artwork">
      <div
        className="mediaitem-artwork"
        style={awStyle}
        contextmenu="contextMenu"
        className="[{'rounded': (type == 'artists')}, classes]"
        key="url">
        <img
          src="imgSrc"
          ref="image"
          decoding="async"
          loading="lazy"
          style={imgStyle}
          load="imgLoaded()"
          className="mediaitem-artwork--img"
        />
        <div
          v-if="video && getVideoPriority()"
          className="animatedartwork-view-box"
        />
        <AnimatedartworkView
          priority="getVideoPriority()"
          video="video"
        />
      </div>
    </div>
  );
};

export default MediaItemArtwork;
