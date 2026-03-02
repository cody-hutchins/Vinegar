export const Component = () => {
  const app = this.$root;
  const menuPanel = this.$root.menuPanel;
  const content = this.$root.menuPanel.content;
  const getSvgIcon = this.$root.getSvgIcon;
  let position = [0, 0];
  const size = [0, 0];
  const event = this.$root.menuPanel.event;
  let direction = "down";
  let elStyle: Record<string, string | number> = {
    opacity: 0,
  };

  function mounted() {
    if (event) {
      position = [event.clientX, event.clientY];
      // size = [document.querySelector(".menu-panel-body").offsetWidth, document.querySelector(".menu-panel-body").offsetHeight];
      // ugly hack
      setTimeout(getStyle);
    } else {
      document.addEventListener(
        "mouseover",
        (event) => {
          event = event;
          position = [event.clientX, event.clientY];
          console.log("pos", position);
          setTimeout(getStyle);
        },
        { once: true },
      );
    }
  }

  function getBodyClasses() {
    if (direction == "down") {
      return ["menu-panel-body-down"];
    } else if (direction == "up") {
      return ["menu-panel-body-up"];
    } else {
      return ["foo"];
    }
  }
  function getClasses(item) {
    if (item["active"]) {
      return "active";
    }
  }
  function focusOther() {
    document.querySelector(".search-input-container input").focus();
  }
  function getStyle() {
    let style: Record<string, string | number> = {};
    size = [this.$refs.menubody.offsetWidth, this.$refs.menubody.offsetHeight];
    if (event) {
      style["position"] = "absolute";
      style["left"] = event.clientX + "px";
      style["top"] = event.clientY + "px";
      // make sure the menu panel isnt off the screen
      if (event.clientX + size[0] > window.innerWidth) {
        style["left"] = event.clientX - size[0] + "px";
      }
      if (event.clientY + size[1] > window.innerHeight) {
        style["top"] = event.clientY - size[1] + "px";
      }

      // if the panel is above the mouse, set the direction to up
      if (event.clientY < size[1]) {
        direction = "up";
      } else {
        direction = "down";
      }
      // check if the panel is too long and goes off the screen vertically,
      // if so move it upwards
      if (event.clientY + size[1] > window.innerHeight) {
        style["top"] = event.clientY - size[1] + "px";
      }
    }
    style["opacity"] = 1;
    elStyle = style;
  }
  function getItemStyle(item) {
    let style = {};
    if (item["disabled"]) {
      style = Object.assign(style, {
        pointerEvents: "none",
        opacity: "0.5",
      });
    }
    return style;
  }
  function canDisplay(item) {
    if (!item["hidden"]) {
      return true;
    } else {
      return false;
    }
  }
  async function getActions() {
    return content.items;
  }
  function action(item) {
    item.action();
    if (!item["keepOpen"]) {
      menuPanel.visible = false;
      if (app.hintscontext) {
        app.hintscontext = false;
        document.querySelector(".search-input-container input").focus();
        app.search.showHints = false;
      }
    }
  }

  return (
    <div id="cider-menu-panel">
      <div
        className="menu-panel"
        clickself="menuPanel.visible = false; if($root.hintscontext){$root.hintscontext = false;focusOther()}"
        contextmenuself="menuPanel.visible = false; if($root.hintscontext){$root.hintscontext = false;focusOther()}">
        <div
          className="menu-panel-body"
          ref="menubody"
          style={elStyle}
          className="getBodyClasses()">
          <div
            className="menu-header-text"
            v-if="content.name != ''">
            <div className="row">
              <div className="col">
                <h3 className="queue-header-text">{content.name}</h3>
              </div>
            </div>
          </div>
          <div
            className="menu-header-body"
            v-if="Object.keys(content.headerItems).length != 0">
            <template v-for="item in content.headerItems">
              <button
                className="menu-option-header"
                className="getClasses(item)"
                v-b-tooltiphover
                title="item.name"
                v-if="canDisplay(item)"
                style={getItemStyle(item)}
                onClick={() => action(item)}>
                <div
                  className="sidebar-icon"
                  style={{ margin: 0 }}
                  v-if="item.icon">
                  <div
                    className="svg-icon"
                    style={{ "--url": "url(" + item.icon + ")" }}></div>
                </div>
              </button>
            </template>
          </div>
          <div className="menu-body">
            <template v-for="item in content.items">
              <button
                className="menu-option"
                v-if="canDisplay(item)"
                style={getItemStyle(item)}
                onClick={() => action(item)}>
                <div
                  className="sidebar-icon"
                  v-if="item.icon">
                  <div
                    className="svg-icon"
                    style={{ "--url": "url(" + item.icon + ")" }}></div>
                </div>
                {item.name}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  );
};
