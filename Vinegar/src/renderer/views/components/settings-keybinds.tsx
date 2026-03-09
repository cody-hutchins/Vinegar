const Keybinds = () => {
  const app = this.$root;

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
    blur.innerHTML = `<center>${app.getLz("settings.option.general.keybindings.pressCombination")}<br />${app.getLz("settings.option.general.keybindings.pressEscape")}</center>`;
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
              app.cfg.general.keybindings[action] = keyBind;
              document.body.removeChild(blur);
              clearTimeout(keyBindTimeout);
              notyf.success(app.getLz("settings.notyf.general.keybindings.update.success"));
              app.confirm(app.getLz("settings.prompt.general.keybindings.update.success"), (ok) => {
                if (ok) ipcRenderer.invoke("relaunchApp");
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
    app.cfg.general.keybindings.search = [app.platform === "darwin" ? "Command" : "Control", "F"];
    app.cfg.general.keybindings.listnow = [app.platform === "darwin" ? "Command" : "Control", "L"];
    app.cfg.general.keybindings.browse = [app.platform === "darwin" ? "Command" : "Control", "B"];
    app.cfg.general.keybindings.recentAdd = [app.platform === "darwin" ? "Command" : "Control", "G"];
    app.cfg.general.keybindings.songs = [app.platform === "darwin" ? "Command" : "Control", "J"];
    app.cfg.general.keybindings.albums = [app.platform === "darwin" ? "Command" : "Control", "A"];
    app.cfg.general.keybindings.artists = [app.platform === "darwin" ? "Command" : "Control", "D"];
    app.cfg.general.keybindings.togglePrivateSession = [app.platform === "darwin" ? "Command" : "Control", "P"];
    app.cfg.general.keybindings.webRemote = [app.platform === "darwin" ? "Command" : "Control", app.platform === "darwin" ? "Option" : app.platform === "linux" ? "Shift" : "Alt", "W"];
    app.cfg.general.keybindings.audioSettings = [app.platform === "darwin" ? "Command" : "Control", app.platform === "darwin" ? "Option" : app.platform === "linux" ? "Shift" : "Alt", "A"];
    app.cfg.general.keybindings.pluginMenu = [app.platform === "darwin" ? "Command" : "Control", app.platform === "darwin" ? "Option" : app.platform === "linux" ? "Shift" : "Alt", "P"];
    app.cfg.general.keybindings.castToDevices = [app.platform === "darwin" ? "Command" : "Control", app.platform === "darwin" ? "Option" : app.platform === "linux" ? "Shift" : "Alt", "C"];
    app.cfg.general.keybindings.settings = [app.platform === "darwin" ? "Command" : "Control", ","];
    app.cfg.general.keybindings.zoomn = [app.platform === "darwin" ? "Command" : "Control", "numadd"];
    app.cfg.general.keybindings.zoomt = [app.platform === "darwin" ? "Command" : "Control", "numsub"];
    app.cfg.general.keybindings.zoomrst = [app.platform === "darwin" ? "Command" : "Control", "num0"];
    app.cfg.general.keybindings.openDeveloperTools = [app.platform === "darwin" ? "Command" : "Control", app.platform === "darwin" ? "Option" : "Shift", "I"];
    notyf.success(app.getLz("settings.notyf.general.keybindings.update.success"));
    app.confirm(app.getLz("settings.prompt.general.keybindings.update.success"), (ok) => {
      if (ok) ipcRenderer.invoke("relaunchApp");
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
    <>
      <div id={"keybinds-settings"}>
        <div className={"keybinds-page"}>
          <div className={"md-option-header"}>
            <span>{$root.getLz("settings.option.general.keybindings")}</span>
          </div>
        </div>
        <div className={"md-option-header-sub"}>
          <span>{$root.getLz("settings.option.general.keybindings.library")}</span>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.search")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.listnow")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.browse")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.recentAdd")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.songs")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.albums")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.artists")}</div>
        </div>
        <div className={"md-option-header-sub"}>
          <span>{$root.getLz("settings.option.general.keybindings.session")}</span>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.private")}</div>
        </div>
        <div className={"md-option-header-sub"}>
          <span>{$root.getLz("settings.option.general.keybindings.control")}</span>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.remote")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.audio")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.plugins")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.cast")}</div>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.settings")}</div>
        </div>
        {app.platform !== "darwin" && (
          <div className={"md-option-header-sub"}>
            <span>{$root.getLz("settings.option.general.keybindings.interface")}</span>
          </div>
        )}
        {app.platform !== "darwin" && (
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{$root.getLz("term.zoomin")}</div>
          </div>
        )}
        {app.platform !== "darwin" && (
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{$root.getLz("term.zoomout")}</div>
          </div>
        )}
        {app.platform !== "darwin" && (
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{$root.getLz("term.zoomreset")}</div>
          </div>
        )}
        <div className={"md-option-header-sub"}>
          <span>{$root.getLz("settings.option.general.keybindings.advanced")}</span>
        </div>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{$root.getLz("settings.description.developer")}</div>
        </div>
        <button
          className={"md-btn md-btn-large md-btn-block"}
          onClick={() => keyBindReset()}>
          {$root.getLz("term.reset")}
        </button>
      </div>
    </>
  );
};

export default Keybinds;
