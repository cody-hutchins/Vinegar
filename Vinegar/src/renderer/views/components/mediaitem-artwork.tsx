import { useEffect } from "react";
import AnimatedartworkView from "./animatedartwork-view.jsx";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const MediaItemArtwork = ({
  imagesize = 120,
  width,
  bgcolor = "",
  url = "",
  type = "",
  video,
  videoPriority,
  shadow = "",
  upscaling = false,
}: {
  imagesize?: string | number;
  width?: string | number;
  bgcolor?: string;
  url?: string;
  type?: string;
  video?: string;
  videoPriority?: boolean;
  shadow?: string;
  upscaling?: boolean;
}) => {
  const { t } = useTranslation();
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
  const classes: string[] = [];
  let imgSrc = "";

  const windowRelativeScale = app.$store.state.windowRelativeScale;

  useEffect(() => {
    swapImage(newValue);
  }, [windowRelativeScale]);

  useEffect(() => {
    imgSrc = app.getMediaItemArtwork(url, imagesize, width);
  }, [url]);

  useEffect(() => {
    getClasses();
    imgSrc = app.getMediaItemArtwork(url, imagesize, width);
  }, []);

  const swapImage = (newValue) => {
    if (!upscaling || window.devicePixelRatio !== 1) return;
    if (newValue > 1.5) {
      imgSrc = app.getMediaItemArtwork(url, parseInt(imagesize * 2.0), parseInt(imagesize * 2.0));
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
            name: t("action.openArtworkInBrowser"),
            action: () => {
              window.open(app.getMediaItemArtwork(url, 1024, 1024));
            },
          },
        },
      },
      event,
    );
  };

  const getVideoPriority = () => {
    if (app.cfg.visual.animated_artwork === "always") {
      return true;
    } else if (videoPriority && app.cfg.visual.animated_artwork === "limited") {
      return true;
    } else if (app.cfg.visual.animated_artwork === "disabled") {
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
      width: imagesize + "px",
      height: imagesize + "px",
    };
  };

  return (
    <div id={"mediaitem-artwork"}>
      <div
        className={classNames("mediaitem-artwork", { rounded: type === "artists" }, classes)}
        style={awStyle}
        contextMenu={"contextMenu"}
        key={url}>
        <img
          src={imgSrc}
          ref={"image"}
          decoding={"async"}
          loading={"lazy"}
          style={imgStyle}
          load={imgLoaded()}
          className={"mediaitem-artwork--img"}
        />
        {video && getVideoPriority() && <div className={"animatedartwork-view-box"} />}
        <AnimatedartworkView
          priority={!!getVideoPriority()}
          video={video ?? ""}
        />
      </div>
    </div>
  );
};

export default MediaItemArtwork;
