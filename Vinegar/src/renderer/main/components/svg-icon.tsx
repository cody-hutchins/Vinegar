import { html } from "../html.js";

const SVGIcon = ({name, classes, url="./assets/repeat.svg"}: {name?: string, classes?: string, url?: string}) => {
  return <div className={`_svg-icon ${classes}`} svg-name={name} style={{'--icon': 'url(' + url + ')'}}></div>;
};

export default SVGIcon;
