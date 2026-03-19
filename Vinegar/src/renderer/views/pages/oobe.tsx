import { Col, Row } from "react-bootstrap";
import { useAppStore } from "../../store/app.js";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
const OOBE = () => {
  const { t } = useTranslation();
  let screen = "before_we_start";
  const cfg = useAppStore((state) => state.cfg);
  function signIn() {
    if (localStorage.getItem("music.ampwebplay.media-user-token")) {
      localStorage.setItem("seenOOBE", 1);
      window.location.reload();
    }
    screen = "signin";
    capiInit();
  }
  function getLz(...args) {
    return t(args);
  }
  function getLanguages() {
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
  }
  return (
    <div id={"cider-oobe"}>
      <div className={"content-inner oobe"}>
        {/* before_we_start */}
        {/*<transition name="">*/}
        {screen === "before_we_start" && (
          <div className={"oobe-view"}>
            <div className={"oobe-header"}>{getLz("oobe.amupsell.title")}</div>
            <div className={"oobe-body text"}>
              {getLz("oobe.amupsell.text")}

              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("term.language")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <select
                      className={"md-select"}
                      onChange={() => {
                        $root.setLz("");
                        $root.setLzManual();
                      }}
                      v-model={cfg.general.language}>
                      {getLanguages().map((categories, index) => (
                        <optgroup
                          key={index}
                          label={index}>
                          {categories.map((lang) => (
                            <option
                              key={lang.code}
                              value={lang.code}>
                              {lang.nameNative}({lang.nameEnglish})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <div className={"oobe-footer"}>
              <div className={"btn-group"}>
                <div
                  className={"md-btn md-btn-primary"}
                  onClick={() => (screen = "welcome")}>
                  {getLz("oobe.next")}
                </div>
              </div>
            </div>
          </div>
        )}
        {/*</transition>*/}

        {/*     Welcome    */}
        {/*<transition name="">*/}
        {screen === "welcome" && (
          <div className={"oobe-view"}>
            <div className={"oobe-header"}>{getLz("oobe.intro.title")}</div>
            <div className={"oobe-body text"}>{getLz("oobe.intro.text")}</div>
            <div className={"oobe-footer"}>
              <div className={"btn-group"}>
                <div
                  className={"md-btn"}
                  onClick={() => (screen = "before_we_start")}>
                  {getLz("oobe.previous")}
                </div>
                <div
                  className={"md-btn md-btn-primary"}
                  onClick={() => (screen = "visual")}>
                  {getLz("oobe.next")}
                </div>
              </div>
            </div>
          </div>
        )}
        {/*</transition>*/}

        {/*     General    */}
        {/*<transition name="">*/}
        {screen === "general" && (
          <div className={"oobe-view"}>
            <div className={"oobe-header"}>{getLz("oobe.general.title")}</div>
            <div className={"oobe-body text"} />
            <div className={"oobe-footer"}>
              <div className={"btn-group"}>
                <div
                  className={"md-btn"}
                  onClick={() => (screen = "welcome")}>
                  {getLz("oobe.previous")}
                </div>
                <div
                  className={"md-btn md-btn-primary"}
                  onClick={() => (screen = "visual")}>
                  {getLz("oobe.next")}
                </div>
              </div>
            </div>
          </div>
        )}
        {/*</transition>*/}

        {/*     Visual    */}
        {/*<transition name="">*/}
        {screen === "visual" && (
          <div className={"oobe-view"}>
            <div className={"oobe-header"}>{getLz("oobe.visual.title")}</div>
            <div className={"oobe-body visual"}>
              <Row>
                <Col>
                  <div
                    className={classNames("card bg-dark text-white stylePicker", {
                      "style-active": cfg.visual.directives.windowLayout === "twopanel",
                    })}
                    onClick={() => (cfg.visual.directives.windowLayout = "twopanel")}>
                    <div className={"card-body"}>
                      <img
                        className={"visualPreview"}
                        src={"./assets/oobe/mojave.png"}
                        alt={"TEMP"}
                      />
                    </div>
                    <div className={"card-footer"}>Mojave</div>
                  </div>
                </Col>
                <Col>
                  <div
                    className={classNames("card bg-dark text-white stylePicker", {
                      "style-active": cfg.visual.directives.windowLayout === "default",
                    })}
                    onClick={() => (cfg.visual.directives.windowLayout = "default")}>
                    <div className={"card-body"}>
                      <img
                        className={"visualPreview"}
                        src={"./assets/oobe/maverick.png"}
                        alt={"TEMP"}
                      />
                    </div>
                    <div className={"card-footer"}>Maverick</div>
                  </div>
                </Col>
              </Row>
              <div className={"blurb"}>{getLz("oobe.visual.layout.text")}</div>
            </div>
            <div className={"oobe-footer"}>
              <div className={"btn-group"}>
                <div
                  className={"md-btn"}
                  onClick={() => (screen = "welcome")}>
                  {getLz("oobe.previous")}
                </div>
                <div
                  className={"md-btn md-btn-primary"}
                  onClick={() => (screen = "audio")}>
                  {getLz("oobe.next")}
                </div>
              </div>
            </div>
          </div>
        )}
        {/*</transition>*/}

        {/*     Audio    */}
        {/*<transition name="">*/}
        {screen === "audio" && (
          <div className={"oobe-view"}>
            <div className={"oobe-header"}>{getLz("oobe.audio.title")}</div>
            <div className={"oobe-body"}>
              <div className={"blurb"}>{getLz("oobe.audio.text")}</div>
              <div className={"md-option-container"}>
                <div className={"settings-option-body"}>
                  <div className={"md-option-line"}>
                    <div className={"md-option-segment"}>
                      {t("settings.option.audio.enableAdvancedFunctionality.ciderPPE")}
                      <br />
                      <small>{t("settings.option.audio.enableAdvancedFunctionality.ciderPPE.description")}</small>
                    </div>
                    <div className={"md-option-segment md-option-segment_auto"}>
                      <input
                        type={"checkbox"}
                        v-model={cfg.audio.maikiwiAudio.ciderPPE}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={"oobe-footer"}>
              <div className={"btn-group"}>
                <div
                  className={"md-btn"}
                  onClick={() => (screen = "visual")}>
                  {getLz("oobe.previous")}
                </div>
                <div
                  className={"md-btn md-btn-primary"}
                  onClick={() => signIn()}>
                  {getLz("oobe.next")}
                </div>
              </div>
            </div>
          </div>
        )}
        {/*</transition>*/}
        {screen === "signin" && (
          <div className={"oobe-view"}>
            <div className={"oobe-header"}>Sign in with Apple Music</div>
            <div className={"oobe-body"}>
              <div className={"blurb"} />
            </div>
            <div className={"oobe-footer"}>
              <div className={"btn-group"}>
                <div
                  className={"md-btn"}
                  onClick={() => (app.appMode = "player")}>
                  {getLz("oobe.done")}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={"oobe-titlebar"}>
          {$root.platform !== "darwin" && (
            <div className={"button-group"}>
              <button
                className={"min"}
                onClick={() => $root.window.electronAPI.send("minimize")}
              />
              <button
                className={"close"}
                onClick={() => $root.window.electronAPI.send("close")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OOBE;
