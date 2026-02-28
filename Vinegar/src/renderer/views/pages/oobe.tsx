export const Component = () => {
  Vue.component("cider-oobe", {
    template: "#cider-oobe",
    data: function () {
      return {
        screen: "before_we_start",
      };
    },
    async mounted() {},
    methods: {
      signIn() {
        if (localStorage.getItem("music.ampwebplay.media-user-token")) {
          localStorage.setItem("seenOOBE", 1);
          window.location.reload();
        }
        this.screen = "signin";
        capiInit();
      },
      getLz() {
        return this.$root.getLz.apply(this.$root, arguments);
      },
      getLanguages: function () {
        let langs = this.$root.lzListing;
        let categories = {
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
      },
    },
  });
  return (
    <div id="cider-oobe">
      <div className="content-inner oobe">
        {/*        before_we_start */}
        {/* <transition name="">  */}
        <div
          className="oobe-view"
          v-if="screen == 'before_we_start'">
          <div className="oobe-header">{getLz("oobe.amupsell.title")}</div>
          <div className="oobe-body text">
            {getLz("oobe.amupsell.text")}

            <div className="md-option-line">
              <div className="md-option-segment">{$root.getLz("term.language")}</div>
              <div className="md-option-segment md-option-segment_auto">
                <label>
                  <select
                    className="md-select"
                    change="$root.setLz('');$root.setLzManual()"
                    v-model="$root.cfg.general.language">
                    <optgroup
                      label="index"
                      v-for="(categories, index) in getLanguages()">
                      <option
                        v-for="lang in categories"
                        value="lang.code">
                        {lang.nameNative}({lang.nameEnglish})
                      </option>
                    </optgroup>
                  </select>
                </label>
              </div>
            </div>
          </div>
          <div className="oobe-footer">
            <div className="btn-group">
              <div
                className="md-btn md-btn-primary"
                click="screen = 'welcome'">
                {getLz("oobe.next")}
              </div>
            </div>
          </div>
        </div>
        {/* </transition>  */}

        {/*     Welcome    */}
        {/* <transition name="">  */}
        <div
          className="oobe-view"
          v-if="screen == 'welcome'">
          <div className="oobe-header">{getLz("oobe.intro.title")}</div>
          <div className="oobe-body text">{getLz("oobe.intro.text")}</div>
          <div className="oobe-footer">
            <div className="btn-group">
              <div
                className="md-btn"
                click="screen = 'before_we_start'">
                {getLz("oobe.previous")}
              </div>
              <div
                className="md-btn md-btn-primary"
                click="screen = 'visual'">
                {getLz("oobe.next")}
              </div>
            </div>
          </div>
        </div>
        {/* </transition>  */}

        {/*     General    */}
        {/* <transition name="">  */}
        <div
          className="oobe-view"
          v-if="screen == 'general'">
          <div className="oobe-header">{getLz("oobe.general.title")}</div>
          <div className="oobe-body text"></div>
          <div className="oobe-footer">
            <div className="btn-group">
              <div
                className="md-btn"
                click="screen = 'welcome'">
                {getLz("oobe.previous")}
              </div>
              <div
                className="md-btn md-btn-primary"
                click="screen = 'visual'">
                {getLz("oobe.next")}
              </div>
            </div>
          </div>
        </div>
        {/* </transition>  */}

        {/*     Visual    */}
        {/* <transition name="">  */}
        <div
          className="oobe-view"
          v-if="screen == 'visual'">
          <div className="oobe-header">{getLz("oobe.visual.title")}</div>
          <div className="oobe-body visual">
            <b-row>
              <b-col>
                <div
                  className="card bg-dark text-white stylePicker"
                  click="$root.cfg.visual.directives.windowLayout = 'twopanel'"
                  className="{'style-active': ($root.cfg.visual.directives.windowLayout == 'twopanel')}">
                  <div className="card-body">
                    <img
                      className="visualPreview"
                      src="./assets/oobe/mojave.png"
                      alt="TEMP"
                    />
                  </div>
                  <div className="card-footer">Mojave</div>
                </div>
              </b-col>
              <b-col>
                <div
                  className="card bg-dark text-white stylePicker"
                  click="$root.cfg.visual.directives.windowLayout = 'default'"
                  className="{'style-active': ($root.cfg.visual.directives.windowLayout == 'default')}">
                  <div className="card-body">
                    <img
                      className="visualPreview"
                      src="./assets/oobe/maverick.png"
                      alt="TEMP"
                    />
                  </div>
                  <div className="card-footer">Maverick</div>
                </div>
              </b-col>
            </b-row>
            <div className="blurb">{getLz("oobe.visual.layout.text")}</div>
          </div>
          <div className="oobe-footer">
            <div className="btn-group">
              <div
                className="md-btn"
                click="screen = 'welcome'">
                {getLz("oobe.previous")}
              </div>
              <div
                className="md-btn md-btn-primary"
                click="screen = 'audio'">
                {getLz("oobe.next")}
              </div>
            </div>
          </div>
        </div>
        {/* </transition>  */}

        {/*     Audio    */}
        {/* <transition name="">  */}
        <div
          className="oobe-view"
          v-if="screen == 'audio'">
          <div className="oobe-header">{getLz("oobe.audio.title")}</div>
          <div className="oobe-body">
            <div className="blurb">{getLz("oobe.audio.text")}</div>
            <div className="md-option-container">
              <div className="settings-option-body">
                <div className="md-option-line">
                  <div className="md-option-segment">
                    {$root.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPE")}
                    <br />
                    <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPE.description")}</small>
                  </div>
                  <div className="md-option-segment md-option-segment_auto">
                    <input
                      type="checkbox"
                      v-model="$root.cfg.audio.maikiwiAudio.ciderPPE"
                      switch
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="oobe-footer">
            <div className="btn-group">
              <div
                className="md-btn"
                click="screen = 'visual'">
                {getLz("oobe.previous")}
              </div>
              <div
                className="md-btn md-btn-primary"
                click="signIn()">
                {getLz("oobe.next")}
              </div>
            </div>
          </div>
        </div>
        {/* </transition>  */}
        <div
          className="oobe-view"
          v-if="screen == 'signin'">
          <div className="oobe-header">Sign in with Apple Music</div>
          <div className="oobe-body">
            <div className="blurb"></div>
          </div>
          <div className="oobe-footer">
            <div className="btn-group">
              <div
                className="md-btn"
                click="app.appMode ='player'">
                {getLz("oobe.done")}
              </div>
            </div>
          </div>
        </div>
        <div className="oobe-titlebar">
          <div
            className="button-group"
            v-if="$root.platform !== 'darwin'">
            <button
              className="min"
              click="$root.ipcRenderer.send('minimize')"></button>
            <button
              className="close"
              click="$root.ipcRenderer.send('close')"></button>
          </div>
        </div>
      </div>
    </div>
  );
};
