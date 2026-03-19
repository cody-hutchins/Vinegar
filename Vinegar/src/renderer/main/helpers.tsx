import { useEffect } from "react";
import { Notyf } from "notyf";
export const notyf = new Notyf();

export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

export const MusicKitObjects = {
  LibraryPlaylist: function () {
    this.id = "";
    this.type = "library-playlist-folders";
    this.href = "";
    this.attributes = {
      dateAdded: "",
      name: "",
    };
    this.playlists = [];
  },
};
export const _rgbToRgb = (rgb = [0, 0, 0]) => {
  // if rgb
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
};
export const saveFile = (fileName, urlFile) => {
  const a = document.createElement("a");
  a.style = "display: none";
  document.body.appendChild(a);
  a.href = urlFile;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};
/**
 * Converts seconds to dd:hh:mm:ss / Days:Hours:Minutes:Seconds
 * @param {number} seconds
 * @param {string} format (short, long)
 * @returns {string}
 * @author Core#1034
 * @memberOf app
 */
export const convertTime = (seconds, format = "short") => {
  // if (this.mk?.nowPlayingItem?.type === "radioStation") return;
  if (isNaN(seconds) || seconds === Infinity) {
    seconds = 0;
  }

  const datetime = new Date(seconds * 1000);

  if (format === "long") {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? `${d} ${this.getLz("term.time.day", { count: d })}` : "";
    const hDisplay = h > 0 ? `${h} ${this.getLz("term.time.hour", { count: h })}` : "";
    const mDisplay = m > 0 ? `${m} ${this.getLz("term.time.minute", { count: m })}` : "";

    return dDisplay + (dDisplay && hDisplay ? ", " : "") + hDisplay + (hDisplay && mDisplay ? ", " : "") + mDisplay;
  } else {
    return MusicKit.formatMediaTime(seconds);
  }
};
export const stringTemplateParser = (expression: string, valueObj) => {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  const text = expression.replace(templateMatcher, (_substring, value, _index) => {
    value = valueObj[value];
    return value;
  });
  return text;
};
export const hashCode = (str: string) => {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
export const getSvgIcon = async (url: string) => {
  const response = await fetch(url);
  const data = await response.text();
  return data;
};

// limit an array to a certain number of items
Array.prototype.limit = function (n) {
  return this.slice(0, n);
};
export const formatTimezoneOffset = (e = new Date()) => {
  const leadingZeros = (e, s = 2) => {
    let n = "" + e;
    for (; n.length < s; ) n = "0" + n;
    return n;
  };

  const s = e.getTimezoneOffset(),
    n = Math.floor(Math.abs(s) / 60),
    d = Math.round(Math.abs(s) % 60);
  let h = "+";
  return (0 !== s && (h = s > 0 ? "-" : "+"), `${h}${leadingZeros(n, 2)}:${leadingZeros(d, 2)}`);
};
export const arrayToChunk = (arr: Array<any>, chunkSize: number) => {
  const R = [];
  for (let i = 0, len = arr.length; i < len; i += chunkSize) {
    R.push(arr.slice(i, i + chunkSize));
  }
  return R;
};
export const apiCall = async (url, callback) => {
  const xmlHttp = new XMLHttpRequest();

  xmlHttp.onreadystatechange = (e) => {
    if (xmlHttp.readyState !== 4) {
      return;
    }

    if (xmlHttp.status === 200) {
      // console.log('SUCCESS', xmlHttp.responseText);
      callback(JSON.parse(xmlHttp.responseText));
    } else {
      console.warn("request_error");
    }
  };

  xmlHttp.open("GET", url);
  xmlHttp.setRequestHeader("Authorization", "Bearer " + MusicKit.getInstance().developerToken);
  xmlHttp.setRequestHeader("Music-User-Token", "" + MusicKit.getInstance().musicUserToken);
  xmlHttp.setRequestHeader("Accept", "application/json");
  xmlHttp.setRequestHeader("Content-Type", "application/json");
  xmlHttp.responseType = "text";
  xmlHttp.send();
};

export const getMediaItemArtwork = (url, height = 64, width) => {
  try {
    if (typeof url === "undefined" || url === "") {
      return "./assets/MissingArtwork.svg";
    }
    height = parseInt(height * window.devicePixelRatio);
    if (width) {
      width = parseInt(width * window.devicePixelRatio);
    }
    let newurl = `${(url ?? "")
      .replace("{w}", width ?? height)
      .replace("{h}", height)
      .replace("{f}", "webp")
      .replace("{c}", width === 900 || width === 380 || width === 600 ? "sr" : "cc")}`;

    if (newurl.includes("900x516")) {
      newurl = newurl.replace("900x516cc", "900x516sr").replace("900x516bb", "900x516sr");
    }
    return newurl;
  } catch (e) {
    console.log("error:", e);
    console.log(url);
    return "./assets/MissingArtwork.svg";
  }
};
export const checkScrollDirectionIsUp = (event) => {
  if (event.wheelDelta) {
    return event.wheelDelta > 0;
  }
  return event.deltaY < 0;
};
export const toMS = (str: string) => {
  const rawTime = str.match(/(\d+:)?(\d+:)?(\d+)(\.\d+)?/);
  const hours = rawTime[2] !== null ? rawTime[1].replace(":", "") : 0;
  const minutes =
    rawTime[2] !== null ? hours * 60 + rawTime[2].replace(":", "") * 1 : rawTime[1] !== null ? rawTime[1].replace(":", "") : 0;
  const seconds = rawTime[3] !== null ? rawTime[3] : 0;
  const milliseconds = rawTime[4] !== null ? rawTime[4].replace(".", "") : 0;
  return parseFloat(`${minutes * 60 + seconds * 1}.${milliseconds * 1}`);
};
export const stringToXml = (st: string) => {
  // string to xml
  const xml = new DOMParser().parseFromString(st, "text/xml");
  return xml;
};

export const parseTime = (value: number) => {
  const minutes = Math.floor(value / 60000);
  const seconds = ((value % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
};
export const parseTimeDecimal = (value: number) => {
  const minutes = Math.floor(value / 60000);
  const seconds = ((value % 60000) / 1000).toFixed(0);
  return minutes + "." + (seconds < 10 ? "0" : "") + seconds;
};

export const hmsToSecondsOnly = (str: string) => {
  const p = str.split(":");
  let s = 0,
    m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  return s;
};
export const AnimatedNumber = ({ number }: { number: 0 }) => {
  let displayNumber = number ? number : 0;
  let interval = -1;
  useEffect(() => {
    clearInterval(interval);
    if (number === displayNumber) {
      return;
    }
    interval = window.setInterval(() => {
      if (displayNumber !== number) {
        let change = (number - displayNumber) / 10;
        change = change >= 0 ? Math.ceil(change) : Math.floor(change);
        displayNumber = displayNumber + change;
      }
    }, 20);
  }, [number]);

  return <div style={{ display: "inline-block" }}>{displayNumber}</div>;
};

const initMusicKit = () => {
  if (!this.responseText) {
    console.log("Using stored token");
    this.responseText = JSON.stringify({
      token: localStorage.getItem("lastToken"),
    });
  }
  const parsedJson = JSON.parse(this.responseText);
  localStorage.setItem("lastToken", parsedJson.token);
  MusicKit.configure({
    developerToken: parsedJson.token,
    app: {
      name: "Apple Music",
      build: "1978.4.1",
      version: "1.0",
    },
    sourceType: 24,
    suppressErrorDialog: true,
  }).then(() => {
    function waitForApp() {
      if (typeof app.init !== "undefined") {
        app.init();
        if (app.cfg.visual.window_background_style === "mica" && !app.isDev) {
          app.spawnMica();
        }
      } else {
        setTimeout(waitForApp, 250);
      }
    }
    waitForApp();
  });
};

export const capiInit = () => {
  const request = new XMLHttpRequest();
  request.timeout = 5000;
  request.addEventListener("load", initMusicKit);
  request.onreadystatechange = function (aEvt) {
    if (request.readyState === 4 && request.status !== 200) {
      if (localStorage.getItem("lastToken") !== null) {
        initMusicKit();
      } else {
        console.error(`Failed to load capi, cannot get token [${request.status}]`);
      }
    }
  };
  request.open("GET", "https://api.cider.sh/v1/");
  request.send();
};

document.addEventListener("musickitloaded", function () {
  if (showOobe()) return;
  console.log("MusicKit loaded");
  // MusicKit global is now defined
  capiInit();
});

window.addEventListener("drmUnsupported", function () {
  initMusicKit();
});

if ("serviceWorker" in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js?v=1");
  });
}

export const getBase64FromUrl = async (url: string | URL | Request) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

export const Clone = (obj: object) => {
  return JSON.parse(JSON.stringify(obj));
};

export const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
};

export const xmlToJson = (xml) => {
  // Create the return object
  let obj: Record<string, any> = {};

  if (xml.nodeType === 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    // text
    obj = xml.nodeValue;
  }

  // do children
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      if (typeof obj[nodeName] === "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === "undefined") {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  console.log(obj);
  return obj;
};

export const asyncForEach = (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const checkIfScrollIsStatic = setInterval(() => {
  try {
    if (position === document.getElementsByClassName("lyric-body")[0].scrollTop) {
      clearInterval(checkIfScrollIsStatic);
      // do something
    }
    position = document.getElementsByClassName("lyric-body")[0].scrollTop;
  } catch (e) {
    console.log(e);
  }
}, 50);

// WebGPU Console Notification
export const webGPU = async () => {
  try {
    const currentGPU = await navigator.gpu.requestAdapter();
    console.log("WebGPU enabled on", currentGPU.name, "with feature ID", currentGPU.features.size);
  } catch (e) {
    console.log("WebGPU disabled / WebGPU initialization failed");
  }
};

export const isJson = (item: unknown) => {
  let _item = typeof item !== "string" ? JSON.stringify(item) : item;

  try {
    _item = JSON.parse(_item);
  } catch (e) {
    console.error(e);
    return false;
  }
  return typeof _item === "object" && _item !== null;
};

webGPU().then();

const showOobe = () => {
  if (localStorage.getItem("music.ampwebplay.media-user-token") && localStorage.getItem("seenOOBE")) {
    return false;
  } else {
    function waitForApp() {
      if (typeof app.init !== "undefined") {
        app.oobeInit();
      } else {
        setTimeout(waitForApp, 250);
      }
    }
    waitForApp();
    return true;
  }
};

export const screenWidth = screen.width;
export const screenHeight = screen.height;

document.addEventListener("DOMContentLoaded", async function () {
  // app.oobeInit()
});

document.addEventListener(
  "contextmenu",
  function (e) {
    if (
      e.target.tagName.toLowerCase() === "textarea" ||
      (e.target.tagName.toLowerCase() === "input" && e.target.type !== "checkbox" && e.target.type !== "radio" && !e.target.disabled)
    ) {
      e.preventDefault();
      const menuPanel = {
        items: {
          cut: {
            name: app.getLz("action.cut"),
            action: function () {
              document.execCommand("cut");
            },
          },
          copy: {
            name: app.getLz("action.copy"),
            action: function () {
              document.execCommand("copy");
            },
          },
          paste: {
            name: app.getLz("action.paste"),
            action: function () {
              document.execCommand("paste");
            },
          },
          delete: {
            name: app.getLz("action.delete"),
            action: function () {
              document.execCommand("delete");
            },
          },
          selectAll: {
            name: app.getLz("action.selectAll"),
            action: function () {
              document.execCommand("selectAll");
            },
          },
        },
      };
      app.showMenuPanel(menuPanel, e);
    }
  },
  false,
);
