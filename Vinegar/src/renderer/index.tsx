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

// limit an array to a certain number of items
Array.prototype.limit = function (n) {
  return this.slice(0, n);
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
