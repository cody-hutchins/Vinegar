import { useTranslation } from "react-i18next";
import { useCfgStore } from "../../store/cfg.js";

const Keybinds = () => {
  const { t } = useTranslation();
  const { cfg } = useCfgStore();

  const keyBindUpdate = (action) => {
    const blur = document.createElement("div");
    blur.className = "blur";
    blur.style.backgroundColor = "rgba(0,0,0,0.25)";
    blur.style.position = "fixed";
    blur.style.top = "0";
    blur.style.left = "0";
    blur.style.width = "100%";
    blur.style.height = "100%";
    blur.style.zIndex = "9999";
    blur.style.display = "flex";
    blur.style.alignItems = "center";
    blur.style.justifyContent = "center";
    blur.style.fontSize = "2em";
    blur.style.color = "white";
    blur.innerHTML = `<center>${t("settings.option.general.keybindings.pressCombination")}<br />${t("settings.option.general.keybindings.pressEscape")}</center>`;
    document.body.appendChild(blur);

    let keyBind = [];
    const keyBindTimeout = setTimeout(function () {
      keyBind = [];
      document.body.removeChild(blur);
    }, 30000);
    const keyBindUpdate = function (e) {
      if (document.body.contains(blur)) {
        if (e.key === "Escape") {
          document.body.removeChild(blur);
          clearTimeout(keyBindTimeout);
          return;
        } else {
          if (e.keyCode >= 65 && e.keyCode <= 90 && e.keyCode <= 97 && e.keyCode <= 122) {
            keyBind.push(e.key.toUpperCase());
          } else {
            keyBind.push(e.key);
          }
          if (keyBind.length === 2) {
            if (keyBind[0] !== keyBind[1]) {
              cfg.general.keybindings[action] = keyBind;
              document.body.removeChild(blur);
              clearTimeout(keyBindTimeout);
              notyf.success(t("settings.notyf.general.keybindings.update.success"));
              app.confirm(t("settings.prompt.general.keybindings.update.success"), (ok) => {
                if (ok) window.electronAPI.invoke("relaunchApp").then();
              });
            } else {
              keyBind = [];
            }
          }
        }
      }
    };
    document.addEventListener("keydown", keyBindUpdate);
  };
  const keyBindReset = () => {
    cfg.general.keybindings.search = [app.platform === "darwin" ? "Command" : "Control", "F"];
    cfg.general.keybindings.listnow = [app.platform === "darwin" ? "Command" : "Control", "L"];
    cfg.general.keybindings.browse = [app.platform === "darwin" ? "Command" : "Control", "B"];
    cfg.general.keybindings.recentAdd = [app.platform === "darwin" ? "Command" : "Control", "G"];
    cfg.general.keybindings.songs = [app.platform === "darwin" ? "Command" : "Control", "J"];
    cfg.general.keybindings.albums = [app.platform === "darwin" ? "Command" : "Control", "A"];
    cfg.general.keybindings.artists = [app.platform === "darwin" ? "Command" : "Control", "D"];
    cfg.general.keybindings.togglePrivateSession = [app.platform === "darwin" ? "Command" : "Control", "P"];
    cfg.general.keybindings.webRemote = [
      app.platform === "darwin" ? "Command" : "Control",
      app.platform === "darwin" ? "Option" : app.platform === "linux" ? "Shift" : "Alt",
      "W",
    ];
    cfg.general.keybindings.audioSettings = [
      app.platform === "darwin" ? "Command" : "Control",
      app.platform === "darwin" ? "Option" : app.platform === "linux" ? "Shift" : "Alt",
      "A",
    ];
    cfg.general.keybindings.pluginMenu = [
      app.platform === "darwin" ? "Command" : "Control",
      app.platform === "darwin" ? "Option" : app.platform === "linux" ? "Shift" : "Alt",
      "P",
    ];
    cfg.general.keybindings.castToDevices = [
      app.platform === "darwin" ? "Command" : "Control",
      app.platform === "darwin" ? "Option" : app.platform === "linux" ? "Shift" : "Alt",
      "C",
    ];
    cfg.general.keybindings.settings = [app.platform === "darwin" ? "Command" : "Control", ","];
    cfg.general.keybindings.zoomn = [app.platform === "darwin" ? "Command" : "Control", "numadd"];
    cfg.general.keybindings.zoomt = [app.platform === "darwin" ? "Command" : "Control", "numsub"];
    cfg.general.keybindings.zoomrst = [app.platform === "darwin" ? "Command" : "Control", "num0"];
    cfg.general.keybindings.openDeveloperTools = [
      app.platform === "darwin" ? "Command" : "Control",
      app.platform === "darwin" ? "Option" : "Shift",
      "I",
    ];
    notyf.success(t("settings.notyf.general.keybindings.update.success"));
    app.confirm(t("settings.prompt.general.keybindings.update.success"), (ok) => {
      if (ok) window.electronAPI.invoke("relaunchApp").then();
    });
  };

  const getLanguages = () => {
    const langs = this.$root.lzListing;
    const categories = {
      main: [],
      fun: [],
      unsorted: [],
    };
    // sort by category if category is undefined or empty put it in "unsorted"
    for (let i = 0; i < langs.length; i++) {
      if (langs[i].category === undefined || langs[i].category === "") {
        categories.unsorted.push(langs[i]);
      } else {
        categories[langs[i].category].push(langs[i]);
      }
    }
    // return
    return categories;
  };

  return (
    <div id={"keybinds-settings"}>
      <div className={"keybinds-page"}>
        <div className={"md-option-header"}>
          <span>{t("settings.option.general.keybindings")}</span>
        </div>
      </div>
      <div className={"md-option-header-sub"}>
        <span>{t("settings.option.general.keybindings.library")}</span>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.search")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.listnow")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.browse")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.recentAdd")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.songs")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.albums")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.artists")}</div>
      </div>
      <div className={"md-option-header-sub"}>
        <span>{t("settings.option.general.keybindings.session")}</span>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.private")}</div>
      </div>
      <div className={"md-option-header-sub"}>
        <span>{t("settings.option.general.keybindings.control")}</span>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.remote")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.audio")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.plugins")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.cast")}</div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.settings")}</div>
      </div>
      {app.platform !== "darwin" && (
        <div className={"md-option-header-sub"}>
          <span>{t("settings.option.general.keybindings.interface")}</span>
        </div>
      )}
      {app.platform !== "darwin" && (
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{t("term.zoomin")}</div>
        </div>
      )}
      {app.platform !== "darwin" && (
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{t("term.zoomout")}</div>
        </div>
      )}
      {app.platform !== "darwin" && (
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{t("term.zoomreset")}</div>
        </div>
      )}
      <div className={"md-option-header-sub"}>
        <span>{t("settings.option.general.keybindings.advanced")}</span>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.description.developer")}</div>
      </div>
      <button
        className={"md-btn md-btn-large md-btn-block"}
        onClick={() => keyBindReset()}>
        {t("term.reset")}
      </button>
    </div>
  );
};

export default Keybinds;
