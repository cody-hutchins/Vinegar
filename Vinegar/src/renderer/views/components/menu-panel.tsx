export const Component = () => {
  Vue.component("cider-menu-panel", {
    template: "#cider-menu-panel",
    data: function () {
      return {
        app: this.$root,
        menuPanel: this.$root.menuPanel,
        content: this.$root.menuPanel.content,
        getSvgIcon: this.$root.getSvgIcon,
        position: [0, 0],
        size: [0, 0],
        event: this.$root.menuPanel.event,
        direction: "down",
        elStyle: {
          opacity: 0,
        },
      };
    },
    mounted() {
      if (this.event) {
        this.position = [this.event.clientX, this.event.clientY];
        this.$nextTick(() => {
          // this.size = [document.querySelector(".menu-panel-body").offsetWidth, document.querySelector(".menu-panel-body").offsetHeight];
          // ugly hack
          setTimeout(this.getStyle, 0.8);
        });
      } else {
        document.addEventListener(
          "mouseover",
          (event) => {
            this.event = event;
            this.position = [event.clientX, event.clientY];
            console.log("pos", this.position);
            this.$nextTick(() => {
              setTimeout(this.getStyle, 0.8);
            });
          },
          { once: true },
        );
      }
    },
    methods: {
      getBodyClasses() {
        if (this.direction == "down") {
          return ["menu-panel-body-down"];
        } else if (this.direction == "up") {
          return ["menu-panel-body-up"];
        } else {
          return ["foo"];
        }
      },
      getClasses(item) {
        if (item["active"]) {
          return "active";
        }
      },
      focusOther() {
        document.querySelector(".search-input-container input").focus();
      },
      getStyle() {
        let style = {};
        this.size = [this.$refs.menubody.offsetWidth, this.$refs.menubody.offsetHeight];
        if (this.event) {
          style["position"] = "absolute";
          style["left"] = this.event.clientX + "px";
          style["top"] = this.event.clientY + "px";
          // make sure the menu panel isnt off the screen
          if (this.event.clientX + this.size[0] > window.innerWidth) {
            style["left"] = this.event.clientX - this.size[0] + "px";
          }
          if (this.event.clientY + this.size[1] > window.innerHeight) {
            style["top"] = this.event.clientY - this.size[1] + "px";
          }

          // if the panel is above the mouse, set the direction to up
          if (this.event.clientY < this.size[1]) {
            this.direction = "up";
          } else {
            this.direction = "down";
          }
          // check if the panel is too long and goes off the screen vertically,
          // if so move it upwards
          if (this.event.clientY + this.size[1] > window.innerHeight) {
            style["top"] = this.event.clientY - this.size[1] + "px";
          }
        }
        style["opacity"] = 1;
        this.elStyle = style;
      },
      getItemStyle(item) {
        let style = {};
        if (item["disabled"]) {
          style = Object.assign(style, {
            "pointer-events": "none",
            opacity: "0.5",
          });
        }
        return style;
      },
      canDisplay(item) {
        if (!item["hidden"]) {
          return true;
        } else {
          return false;
        }
      },
      async getActions() {
        return this.content.items;
      },
      action(item) {
        item.action();
        if (!item["keepOpen"]) {
          this.menuPanel.visible = false;
          if (app.hintscontext) {
            app.hintscontext = false;
            document.querySelector(".search-input-container input").focus();
            app.search.showHints = false;
          }
        }
      },
    },
  });
  return (
    <div id="cider-menu-panel">
      <div
        className="menu-panel"
        clickself="menuPanel.visible = false; if($root.hintscontext){$root.hintscontext = false;focusOther()}"
        contextmenuself="menuPanel.visible = false; if($root.hintscontext){$root.hintscontext = false;focusOther()}">
        <div
          className="menu-panel-body"
          ref="menubody"
          style="elStyle"
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
                style="getItemStyle(item)"
                click="action(item)">
                <div
                  className="sidebar-icon"
                  style="margin: 0;"
                  v-if="item.icon">
                  <div
                    className="svg-icon"
                    style="{'--url': 'url(' + item.icon + ')'}"></div>
                </div>
              </button>
            </template>
          </div>
          <div className="menu-body">
            <template v-for="item in content.items">
              <button
                className="menu-option"
                v-if="canDisplay(item)"
                style="getItemStyle(item)"
                click="action(item)">
                <div
                  className="sidebar-icon"
                  v-if="item.icon">
                  <div
                    className="svg-icon"
                    style="{'--url': 'url(' + item.icon + ')'}"></div>
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
