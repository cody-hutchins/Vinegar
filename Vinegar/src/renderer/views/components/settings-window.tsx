import classNames from "classnames";
import Audiolabs from "../pages/audiolabs.jsx";
import { InstalledThemes } from "./settings-installed-themes.jsx";
import Keybinds from "./settings-keybinds.jsx";
import PluginsGithub from "./settings-plugins-github.jsx";
import ThemesGithub from "./settings-themes-github.jsx";
import { Modal, Tab } from "react-bootstrap";
import { useEffect, useState } from "react";
import SVGIcon from "../../main/components/svg-icon.jsx";
import { useTranslation } from "react-i18next";
import { notyf } from "../../index.js";

const SettingsWindow = () => {
  const { t } = useTranslation();
  const app = this.$root;
  const themes = window.electronAPI.sendSync("get-themes");
  const tabIndex = 0;
  const canChangeHash = false;
  let lastfmConnecting = false;
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    if (canChangeHash) {
      // window.location.hash = `#settings/${val}`
    }
  }, [tabIndex]);

  function sidebarVis() {
    const tabIndex = app.$store.state.pageState["settings"].currentTabIndex;
    if (tabIndex === 3 || tabIndex === 5 || tabIndex === 10) {
      return true;
    }
    return false;
  }
  function close() {
    this.$root.modals.settings = false;
  }
  function windowBgStyleChange() {
    this.$root.getNowPlayingArtworkBG(undefined, true);
    if (this.$root.cfg.visual.window_background_style === "mica") {
      this.$root.spawnMica();
    }
  }
  function reinstallWidevineCDM() {
    app.confirm(t("settings.option.experimental.reinstallwidevine.confirm"), (ok) => {
      if (ok) {
        window.electronAPI.invoke("reinstall-widevine-cdm").then();
      }
    });
  }
  function gitHubExplore() {
    app.openSettingsPage("github-themes");
  }
  function copyLogs() {
    window.electronAPI.send("fetch-log");
    notyf.success(t("term.share.success"));
  }
  function openAppData() {
    window.electronAPI.send("open-appdata");
  }
  function changeDisplayTheme() {
    window.electronAPI.send("changeDisplayTheme", app.cfg.visual.overrideDisplayTheme);
  }
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
        try {
          categories[langs[i].category].push(langs[i]);
        } catch {
          categories["unsorted"].push(langs[i]);
        }
      }
    }
    // return
    console.log(categories);
    return categories;
  };
  function addExperiment(flag) {
    app.cfg.advanced.experiments.push(flag);
  }
  function removeExperiment(flag) {
    app.cfg.advanced.experiments.splice(app.cfg.advanced.experiments.indexOf(flag), 1);
  }
  const toggleNormalization = () => {
    if (app.cfg.audio.normalization) {
      CiderAudio.normalizerOn();
    } else {
      CiderAudio.normalizerOff();
    }
  };
  const changeAudioQuality = () => {
    app.mk.bitrate = MusicKit.PlaybackBitrate[app.cfg.audio.quality];
  };
  const toggleUserInfo = () => {
    app.chrome.hideUserInfo = !app.cfg.visual.showuserinfo;
  };
  const sendDataToMTT = async () => {
    await window.electronAPI.invoke("setStoreValue", "general.close_behavior", app.cfg.general.close_behavior);
    //  setStoreValue does not change plugin store values somehow
    await window.electronAPI.invoke("update-store-mtt", app.cfg.general.close_behavior);
  };
  function checkIfUpdateDisabled() {
    if (app.cfg.main.UPDATABLE) return;

    const updateFields = document.getElementsByClassName("update-check");
    for (let i = 0; i < updateFields.length; i++) {
      updateFields[i].style = "opacity: 0.5; pointerEvents: none;";
      updateFields[i].title = "Not available on type of build";
    }
  }
  function promptForRelaunch() {
    app.confirm(t("action.relaunch.confirm"), (result) => {
      if (result) {
        window.electronAPI.send("relaunchApp", "");
      }
    });
  }
  function authCC() {
    window.electronAPI.send("cc-auth");
  }
  function logoutCC() {
    window.electronAPI.send("cc-logout");
  }
  function reloadDiscordRPC() {
    window.electronAPI.send("discordrpc:reload");
  }
  function lfmDisconnect() {
    this.$root.cfg.connectivity.lastfm.enabled = false;
    this.$root.cfg.connectivity.lastfm.secrets.username = "";
    this.$root.cfg.connectivity.lastfm.secrets.key = "";
    window.electronAPI.send("lastfm:disconnect");
  }
  async function lfmAuthorize() {
    lastfmConnecting = true;
    window.open(await window.electronAPI.invoke("lastfm:url"));
    app.notyf.success(t("settings.notyf.connectivity.lastfmScrobble.connecting"));

    /* Just a timeout for the button */
    setTimeout(() => {
      if (!this.$root.cfg.connectivity.lastfm.enabled) {
        app.notyf.error(t("settings.notyf.connectivity.lastfmScrobble.connectError"));
        console.warn("[lastfm:authorize] Last.fm authorization timed out.");
        lastfmConnecting = false;
      }
    }, 40000);

    window.electronAPI.once("lastfm:authenticated", (_e, session) => {
      this.$root.cfg.connectivity.lastfm.secrets.username = session.username;
      this.$root.cfg.connectivity.lastfm.secrets.key = session.key;
      this.$root.cfg.connectivity.lastfm.enabled = true;
      lastfmConnecting = false;
      app.notyf.success(t("settings.notyf.connectivity.lastfmScrobble.connectSuccess"));
    });
  }
  function filterChange(e) {
    this.$root.cfg.connectivity.lastfm.filter_types[e.target.value] = e.target.checked;
  }
  function submitToken() {
    const token = document.getElementById("lfmToken").value;
    window.electronAPI.send("lastfm:auth", token);
  }
  // function openLocalSongsPathMenu() {
  //   app.modals.pathMenu = true;
  // }
  return (
    <div id={"settings-window"}>
      <div
        className={"settings-panel"}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            close();
          }
        }}
      />
      <button
        className={classNames("close-btn minmax-btn", { min: $store.state.pageState["settings"].fullscreen })}
        onClick={() => {
          $store.state.pageState["settings"].fullscreen = !$store.state.pageState["settings"].fullscreen;
        }}
      />
      <button
        className={"close-btn"}
        onClick={() => close()}
      />
      <Tab>
        <template title>
          <div>
            <SVGIcon
              url={"./assets/settings.svg"}
              classes={"svg-md"}
              name={"settings-general"}
            />
          </div>
          <div>{t("settings.header.general")}</div>
        </template>
        <div className={"settings-tab-content"}>
          <div className={"md-option-container"}>
            {/* General Settings  */}
            <div className={"md-option-header"}>
              <span>{t("settings.header.general")}</span>
            </div>
            <div className={"settings-option-body"}>
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
                      v-model={app.cfg.general.language}>
                      {getLanguages().map((categories, index) => (
                        <optgroup
                          key={index}
                          label={index}>
                          {categories.map((lang) => (
                            <option
                              value={lang.code}
                              key={lang.id}>
                              {lang.nameNative}({lang.nameEnglish})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("term.accountSettings")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <button
                    className={"md-btn"}
                    onClick={() => app.appRoute("apple-account-settings")}>
                    {t("term.accountSettings")}
                  </button>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("term.privateSession")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={$root.cfg.general.privateEnabled}
                      onChange={() => ($root.mk.privateEnabled = $root.cfg.general.privateEnabled)}
                    />
                  </label>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: app.platform !== "linux" ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>{t("settings.option.window.openOnStartup")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.general.onStartup.enabled}
                    />
                  </label>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: app.cfg.general.onStartup.enabled ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>{t("settings.option.window.openOnStartup.hidden")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.general.onStartup.hidden}
                    />
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>
                  {t("settings.option.general.resumebehavior")}
                  <br />
                  <small>
                    {t("settings.option.general.resumebehavior.description")}
                    <br />
                    <b>{t("settings.option.general.resumebehavior.locally")}: </b>
                    {t("settings.option.general.resumebehavior.locally.description")}
                    <br />
                    <b>{t("settings.option.general.resumebehavior.history")}: </b>
                    {t("settings.option.general.resumebehavior.history.description")}
                  </small>
                </div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <select
                      className={"md-select"}
                      style={{ width: "180px" }}
                      v-model={$root.cfg.general.resumeOnStartupBehavior}>
                      <option value={"disabled"}>{t("term.disabled")}</option>
                      <option value={"local"}>{t("settings.option.general.resumebehavior.locally")}</option>
                      <option value={"history"}>{t("settings.option.general.resumebehavior.history")}</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>
                  {t("settings.option.general.resumetabs")}
                  <br />
                  <small>
                    {t("settings.option.general.resumetabs.description")}
                    <br />
                    <b>{t("settings.option.general.resumetabs.dynamic")}: </b>
                    {t("settings.option.general.resumetabs.dynamic.description")}
                  </small>
                </div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <select
                      className={"md-select"}
                      style={{ width: "180px" }}
                      v-model={$root.cfg.general.resumeTabs.tab}>
                      <option value={"dynamic"}>{t("settings.option.general.resumetabs.dynamic")}</option>
                      <option value={"home"}>{t("home.title")}</option>
                      <option value={"listen_now"}>{t("term.listenNow")}</option>
                      <option value={"browse"}>{t("term.browse")}</option>
                      <option value={"radio"}>{t("term.radio")}</option>
                      <option value={"library-recentlyadded"}>{t("term.recentlyAdded")}</option>
                      <option value={"library-songs"}>{t("term.songs")}</option>
                      <option value={"library-albums"}>{t("term.albums")}</option>
                      <option value={"library-artists"}>{t("term.artists")}</option>
                      <option value={"library-videos"}>{t("term.videos")}</option>
                      <option value={"podcasts"}>{t("term.podcasts")}</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.general.customizeSidebar")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <button
                    className={"md-btn"}
                    onClick={() => setModalShow(true)}>
                    {t("settings.option.general.customizeSidebar.customize")}
                  </button>
                </div>
                <Modal
                  id={"modal-1"}
                  centered
                  size={"lg"}
                  show={modalShow}
                  title={t("settings.option.general.customizeSidebar")}>
                  <div className={"settings-option-body"}>
                    <div className={"md-option-line"}>
                      <div className={"md-option-segment"}>{t("term.recentlyAdded")}</div>
                      <div className={"md-option-segment md-option-segment_auto"}>
                        <label>
                          <input
                            type={"checkbox"}
                            v-model={app.cfg.general.sidebarItems.recentlyAdded}
                          />
                        </label>
                      </div>
                    </div>
                    <div className={"md-option-line"}>
                      <div className={"md-option-segment"}>{t("term.songs")}</div>
                      <div className={"md-option-segment md-option-segment_auto"}>
                        <label>
                          <input
                            type={"checkbox"}
                            v-model={app.cfg.general.sidebarItems.songs}
                          />
                        </label>
                      </div>
                    </div>
                    <div className={"md-option-line"}>
                      <div className={"md-option-segment"}>{t("term.albums")}</div>
                      <div className={"md-option-segment md-option-segment_auto"}>
                        <label>
                          <input
                            type={"checkbox"}
                            v-model={app.cfg.general.sidebarItems.albums}
                          />
                        </label>
                      </div>
                    </div>
                    <div className={"md-option-line"}>
                      <div className={"md-option-segment"}>{t("term.artists")}</div>
                      <div className={"md-option-segment md-option-segment_auto"}>
                        <label>
                          <input
                            type={"checkbox"}
                            v-model={app.cfg.general.sidebarItems.artists}
                          />
                        </label>
                      </div>
                    </div>
                    <div className={"md-option-line"}>
                      <div className={"md-option-segment"}>{t("term.videos")}</div>
                      <div className={"md-option-segment md-option-segment_auto"}>
                        <label>
                          <input
                            type={"checkbox"}
                            v-model={app.cfg.general.sidebarItems.videos}
                          />
                        </label>
                      </div>
                    </div>
                    <div className={"md-option-line"}>
                      <div className={"md-option-segment"}>{t("term.podcasts")}</div>
                      <div className={"md-option-segment md-option-segment_auto"}>
                        <label>
                          <input
                            type={"checkbox"}
                            v-model={app.cfg.general.sidebarItems.podcasts}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </Modal>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.general.keybindings")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <button
                    className={"md-btn"}
                    onClick={() => $root.openSettingsPage("keybindings")}>
                    {t("action.open")}
                  </button>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.general.themeUpdateNotification")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.general.themeUpdateNotification}
                    />
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.general.showLovedTracksInline")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.general.showLovedTracksInline}
                    />
                  </label>
                </div>
              </div>
              {/* <div className="md-option-line">
                                    <div className="md-option-segment">
                                        {'Local files path'}
                                    </div>
                                    <div className="md-option-segment md-option-segment_auto">
                                        <button className="md-btn" onClick={() =>openLocalSongsPathMenu}>
                                            {'Edit Paths'}
                                        </button>
                                    </div>
                                </div>  */}
            </div>
          </div>
        </div>
      </Tab>
      <Tab>
        <template title={"#"}>
          <div>
            <SVGIcon
              url={"./assets/feather/headphones.svg"}
              classes={"svg-md"}
              name={"settings-audio"}
            />
          </div>
          <div>{t("settings.header.audio")}</div>
        </template>
        <div className={"settings-tab-content"}>
          <div className={"md-option-container"}>
            {/* Audio Settings  */}
            <div className={"md-option-header"}>
              <span>{t("settings.header.audio")}</span>
            </div>
            <div className={"settings-option-body"}>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.audio.quality")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <select
                      className={"md-select"}
                      style={{ width: "180px" }}
                      v-model={app.cfg.audio.quality}
                      onChange={changeAudioQuality}>
                      {/* // <option value="">{t('settings.header.audio.quality.hireslossless')}</option>  */}
                      {/* <option value="">{t('settings.header.audio.quality.lossless')}</option>  */}
                      <option value={"HIGH"}>
                        {t("settings.header.audio.quality.high")}({t("settings.header.audio.quality.high.description")})
                      </option>
                      <option value={"STANDARD"}>
                        {t("settings.header.audio.quality.standard")}({t("settings.header.audio.quality.standard.description")})
                      </option>
                    </select>
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("term.audioControls")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <button
                    className={"md-btn"}
                    onClick={() => (app.modals.audioControls = true)}>
                    {t("term.audioControls")}
                  </button>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.audio.changePlaybackRate")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <button
                    className={"md-btn"}
                    onClick={() => (app.modals.audioPlaybackRate = true)}>
                    {t("settings.option.audio.playbackRate.change")}
                  </button>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.audio.seamlessTransition")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.audio.seamless_audio}
                      onChange={() => (app.mk._bag.features["seamless-audio-transitions"] = app.cfg.audio.seamless_audio)}
                    />
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("term.equalizer")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <button
                    className={"md-btn"}
                    onClick={() => (app.modals.equalizer = true)}>
                    {t("term.equalizer")}
                  </button>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div
                  className={"md-option-segment"}
                  style={{ whiteSpace: "pre-line" }}>
                  {t("settings.option.audio.enableAdvancedFunctionality.audioNormalization")}
                  <small>{app.cfg.audio.equalizer.vibrantBass !== 0 || app.cfg.audio.maikiwiAudio.spatial || app.cfg.audio.maikiwiAudio.ciderPPE ? `${t("settings.option.audio.enableAdvancedFunctionality.audioNormalization.description")}\n${t("settings.option.audio.enableAdvancedFunctionality.audioNormalization.disabled")}` : t("settings.option.audio.enableAdvancedFunctionality.audioNormalization.description")}</small>
                </div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.audio.normalization}
                      onChange={toggleNormalization}
                      disabled={app.cfg.audio.maikiwiAudio.spatial || app.cfg.audio.maikiwiAudio.ciderPPE || app.cfg.audio.maikiwiAudio.atmosphereRealizer1 || app.cfg.audio.maikiwiAudio.atmosphereRealizer2}
                    />
                  </label>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: app.cfg.audio.normalization && app.cfg.audio.advanced ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>
                  {t("settings.option.audio.dbspl.display")}
                  <br />
                  <small>{t("settings.option.audio.dbspl.description")}</small>
                </div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.audio.dBSPL}
                    />
                  </label>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: app.cfg.audio.dBSPL ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>
                  {t("settings.option.audio.dbfs.calibration")}
                  <br />
                  <small>{t("settings.option.audio.dbfs.description")}</small>
                </div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"number"}
                      v-model={app.cfg.audio.dBSPLcalibration}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tab>
      <Tab>
        <div>
          <SVGIcon
            url={"./assets/feather/zap.svg"}
            classes={"svg-md"}
            name={"settings-audiolabs"}
          />
        </div>
        <div>{t("settings.option.audio.audioLab")}</div>
        <div className={"settings-tab-content"}>
          <Audiolabs />
        </div>
      </Tab>
      <Tab>
        <div>
          <SVGIcon
            url={"./assets/feather/style.svg"}
            classes={"svg-md"}
            name={"settings-styles"}
          />
        </div>
        <div>{t("settings.header.visual.styles")}</div>
        <div className={"settings-tab-content"}>
          <InstalledThemes />
        </div>
      </Tab>
      <div>
        <SVGIcon
          url={"./assets/feather/pen-tool.svg"}
          classes={"svg-md"}
          name={"settings-visual"}
        />
      </div>
      <div>{t("settings.header.visual")}</div>
      <div className={"md-option-container"}>
        {/* Visual Settings  */}
        <div className={"md-option-header"}>
          <span>{t("settings.header.visual")}</span>
        </div>
        <div className={"settings-option-body"}>
          {/*<div className="md-option-line">
                                        <div className="md-option-segment">
                                            {t('settings.header.visual.theme')}
                                        </div>
                                        <div className="md-option-segment md-option-segment_auto">
                                            <button className="md-btn md-btn-block" onClick={() =>$root.appRoute('installed-themes')}>
                                                {t('settings.option.visual.theme.manageStyles')}
                                            </button>
                                        </div>
                                    </div>*/}
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.visual.windowStyle")}</div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <label>
                <select
                  className={"md-select"}
                  v-model={$root.cfg.visual.directives.windowLayout}>
                  <option value={"default"}>Maverick</option>
                  <option value={"twopanel"}>Mojave</option>
                </select>
              </label>
            </div>
          </div>
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>Display Style</div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <label>
                <select
                  className={"md-select"}
                  v-model={$root.cfg.visual.overrideDisplayTheme}
                  onChange={changeDisplayTheme}>
                  <option value={"system"}>System</option>
                  <option value={"dark"}>Dark</option>
                  <option value={"light"}>Light</option>
                </select>
              </label>
            </div>
          </div>
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.visual.windowBackgroundStyle")}</div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <label>
                <select
                  className={"md-select"}
                  onChange={windowBgStyleChange}
                  v-model={app.cfg.visual.window_background_style}>
                  <option value={"none"}>{t("settings.header.visual.windowBackgroundStyle.none")}</option>
                  <option value={"artwork"}>{t("settings.header.visual.windowBackgroundStyle.artwork")}</option>
                  <option value={"image"}>{t("settings.header.visual.windowBackgroundStyle.image")}</option>
                  <option value={"color"}>{t("settings.header.visual.windowBackgroundStyle.color")}</option>
                  {$root.platform === "win32" && <option value={"mica"}>Mica (Beta)</option>}
                </select>
              </label>
            </div>
          </div>
          {app.cfg.visual.window_background_style === "color" && (
            <div className={"md-option-line child"}>
              <div className={"md-option-segment"}>{t("settings.option.visual.windowColor")}</div>
              <div className={"md-option-segment_auto"}>
                <input
                  type={"color"}
                  v-model={app.cfg.visual.windowColor}
                />
              </div>
            </div>
          )}
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.visual.customAccentColor")}</div>
            <div className={"md-option-segment_auto"}>
              <input
                type={"checkbox"}
                v-model={app.cfg.visual.customAccentColor}
                disabled={app.cfg.visual.purplePodcastPlaybackBar}
              />
            </div>
          </div>
          {app.cfg.visual.customAccentColor && (
            <div className={"md-option-line child"}>
              <div className={"md-option-segment"}>{t("settings.option.visual.accentColor")}</div>
              <div className={"md-option-segment_auto"}>
                <input
                  type={"color"}
                  v-model={app.cfg.visual.accentColor}
                />
              </div>
            </div>
          )}
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.visual.purplePodcastPlaybackBar")}</div>
            <div className={"md-option-segment_auto"}>
              <input
                type={"checkbox"}
                v-model={app.cfg.visual.purplePodcastPlaybackBar}
                disabled={app.cfg.visual.customAccentColor}
              />
            </div>
          </div>
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.visual.compactArtistHeader")}</div>
            <div className={"md-option-segment_auto"}>
              <input
                type={"checkbox"}
                v-model={app.cfg.visual.compactArtistHeader}
              />
            </div>
          </div>
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>
              {t("settings.option.visual.hardwareAcceleration")}
              <br />
              <small>({t("settings.option.visual.hardwareAcceleration.description")})</small>
            </div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <label>
                <select
                  className={"md-select"}
                  style={{ width: " 180px" }}
                  v-model={app.cfg.visual.hw_acceleration}
                  onChange={() => promptForRelaunch()}>
                  <option value={"default"}>{t("settings.header.visual.hardwareAcceleration.default")}</option>
                  <option value={"webgpu"}>{t("settings.header.visual.hardwareAcceleration.webGPU")}</option>
                  <option value={"disabled"}>{t("term.disabled")}</option>
                </select>
              </label>
            </div>
          </div>
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.visual.showPersonalInfo")}</div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <label>
                <input
                  type={"checkbox"}
                  v-model={app.cfg.visual.showuserinfo}
                  onChange={toggleUserInfo}
                />
              </label>
            </div>
          </div>
        </div>
        {/* Window Settings  */}
        <div className={"md-option-header"}>
          <span>{t("settings.header.window")}</span>
        </div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.option.window.maxElementScale")}</div>
      </div>
      <option value={"-1"}>Default (1.5x)</option>
      <option value={"1"}>1.0x</option>
      <option value={1.2}>1.2x</option>
      <option value={1.4}>1.4x</option>
      <div
        className={"md-option-line"}
        style={{ display: app.platform !== "darwin" ? "inherit" : "none" }}>
        <div className={"md-option-segment"}>{t("settings.option.window.close_button_hide")}</div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <input
              type={"checkbox"}
              v-model={app.cfg.general.close_button_hide}
            />
          </label>
        </div>
      </div>
      <div
        className={"md-option-line"}
        style={{ display: app.platform !== "darwin" ? "inherit" : "none" }}>
        <div className={"md-option-segment"}>
          {t("settings.option.window.useNativeTitleBar")}
          <br />
          <small>({t("settings.option.visual.hardwareAcceleration.description")})</small>
        </div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <input
              type={"checkbox"}
              v-model={app.cfg.visual.nativeTitleBar}
              onChange={() => promptForRelaunch()}
            />
          </label>
        </div>
      </div>
      <div
        className={"md-option-line"}
        style={{ display: app.platform !== "darwin" && !app.cfg.visual.nativeTitleBar ? "inherit" : "none" }}>
        <div className={"md-option-segment"}>{t("settings.option.window.windowControlStyle")}</div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <select
              className={"md-select"}
              v-model={app.cfg.visual.windowControlPosition}>
              <option value={"0"}>{t("settings.option.window.windowControlStyle.right")}</option>
              <option value={"1"}>{t("settings.option.window.windowControlStyle.left")}</option>
            </select>
          </label>
        </div>
      </div>
      {/* Advanced Visual  */}
      <div className={"md-option-header"}>
        <span>{t("settings.header.advanced")}</span>
      </div>
      <div className={"settings-option-body"}>
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{t("settings.option.visual.animatedArtwork")}</div>
          <div className={"md-option-segment md-option-segment_auto"}>
            <label>
              <select
                className={"md-select"}
                v-model={app.cfg.visual.animated_artwork}>
                <option value={"always"}>{t("settings.header.visual.animatedArtwork.always")}</option>
                <option value={"limited"}>{t("settings.header.visual.animatedArtwork.limited")}</option>
                <option value={"disabled"}>{t("settings.header.visual.animatedArtwork.disable")}</option>
              </select>
            </label>
          </div>
        </div>
        {(app.cfg.visual.animated_artwork === "always" || app.cfg.visual.animated_artwork === "limited") && (
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.visual.animatedArtworkQuality")}</div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <label>
                <select
                  className={"md-select"}
                  v-model={app.cfg.visual.animated_artwork_qualityLevel}>
                  <option value={"0"}>{t("settings.header.visual.animatedArtworkQuality.low")}</option>
                  <option value={"1"}>{t("settings.header.visual.animatedArtworkQuality.medium")}</option>
                  <option value={"2"}>{t("settings.header.visual.animatedArtworkQuality.high")}</option>
                  <option value={"3"}>{t("settings.header.visual.animatedArtworkQuality.veryHigh")}</option>
                  <option value={"4"}>{t("settings.header.visual.animatedArtworkQuality.extreme")}</option>
                </select>
              </label>
            </div>
          </div>
        )}
        <div className={"md-option-line"}>
          <div className={"md-option-segment"}>{t("settings.option.visual.animatedWindowBackground")}</div>
          <div className={"md-option-segment md-option-segment_auto"}>
            <label>
              <input
                type={"checkbox"}
                v-model={app.cfg.visual.bg_artwork_rotation}
              />
            </label>
          </div>
        </div>
      </div>
      <Tab>
        <div>
          <SVGIcon
            url={"./assets/feather/plugins.svg"}
            classes={"svg-md"}
            name={"settings-plugins"}
          />
        </div>
        <div>{t("term.plugins")}</div>
        <div className={"settings-tab-content"}>
          <PluginsGithub />
        </div>
      </Tab>
      <Tab>
        <div>
          <SVGIcon
            url={"./assets/feather/mic.svg"}
            classes={"svg-md"}
            name={"settings-lyrics"}
          />
        </div>
        <div>{t("settings.header.lyrics")}</div>
        <div className={"settings-tab-content"}>
          <div className={"md-option-container"}>
            {/* Lyric Settings  */}
            <div className={"md-option-header"}>
              <span>{t("settings.header.lyrics")}</span>
            </div>
            <div className={"settings-option-body"}>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.lyrics.enableMusixmatch")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.lyrics.enable_mxm}
                    />
                  </label>
                </div>
              </div>
              {app.cfg.lyrics.enable_mxm && (
                <div className={"md-option-line"}>
                  <div className={"md-option-segment"}>{t("settings.option.lyrics.enableMusixmatchKaraoke")}</div>
                  <div className={"md-option-segment md-option-segment_auto"}>
                    <label>
                      <input
                        type={"checkbox"}
                        v-model={app.cfg.lyrics.mxm_karaoke}
                      />
                    </label>
                  </div>
                </div>
              )}
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.lyrics.musixmatchPreferredLanguage")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <select
                      className={"md-select"}
                      v-model={app.cfg.lyrics.mxm_language}>
                      <option value={"disabled"}>Disabled</option>
                      <option value={"ab"}>Abkhazian</option>
                      <option value={"aa"}>Afar</option>
                      <option value={"af"}>Afrikaans</option>
                      <option value={"ak"}>Akan</option>
                      <option value={"sq"}>Albanian</option>
                      <option value={"am"}>Amharic</option>
                      <option value={"ar"}>Arabic</option>
                      <option value={"an"}>Aragonese</option>
                      <option value={"hy"}>Armenian</option>
                      <option value={"as"}>Assamese</option>
                      <option value={"a5"}>Assamese-romaji</option>
                      <option value={"a3"}>Asturian</option>
                      <option value={"av"}>Avaric</option>
                      <option value={"ae"}>Avestan</option>
                      <option value={"ay"}>Aymara</option>
                      <option value={"az"}>Azerbaijani</option>
                      <option value={"bm"}>Bambara</option>
                      <option value={"ba"}>Bashkir</option>
                      <option value={"eu"}>Basque</option>
                      <option value={"b1"}>Bavarian</option>
                      <option value={"be"}>Belarusian</option>
                      <option value={"bn"}>Bengali</option>
                      <option value={"b5"}>Bengali-romaji</option>
                      <option value={"bh"}>Bihari languages</option>
                      <option value={"b3"}>Bishnupriya</option>
                      <option value={"bi"}>Bislama</option>
                      <option value={"bs"}>Bosnian</option>
                      <option value={"br"}>Breton</option>
                      <option value={"bg"}>Bulgarian</option>
                      <option value={"my"}>Burmese</option>
                      <option value={"ca"}>Catalan</option>
                      <option value={"c2"}>Cebuano</option>
                      <option value={"b2"}>Central bikol</option>
                      <option value={"c3"}>Central kurdish</option>
                      <option value={"ch"}>Chamorro</option>
                      <option value={"c1"}>Chavacano</option>
                      <option value={"ce"}>Chechen</option>
                      <option value={"ny"}>Chichewa</option>
                      <option value={"zh"}>Chinese (simplified)</option>
                      <option value={"z1"}>Chinese (traditional)</option>
                      <option value={"rz"}>Chinese-romaji</option>
                      <option value={"cu"}>Church slavic</option>
                      <option value={"cv"}>Chuvash</option>
                      <option value={"kw"}>Cornish</option>
                      <option value={"co"}>Corsican</option>
                      <option value={"cr"}>Cree</option>
                      <option value={"c4"}>Creoles and pidgins</option>
                      <option value={"c5"}>Creoles and pidgins, english based</option>
                      <option value={"c6"}>Creoles and pidgins, french-based</option>
                      <option value={"c7"}>Creoles and pidgins, portuguese-based</option>
                      <option value={"hr"}>Croatian</option>
                      <option value={"cs"}>Czech</option>
                      <option value={"da"}>Danish</option>
                      <option value={"d1"}>Dimli (individual language)</option>
                      <option value={"dv"}>Divehi</option>
                      <option value={"d3"}>Dotyali</option>
                      <option value={"nl"}>Dutch</option>
                      <option value={"dz"}>Dzongkha</option>
                      <option value={"m2"}>Eastern mari</option>
                      <option value={"a2"}>Egyptian arabic</option>
                      <option value={"e1"}>Emilian-romagnol</option>
                      <option value={"en"}>English</option>
                      <option value={"m6"}>Erzya</option>
                      <option value={"eo"}>Esperanto</option>
                      <option value={"et"}>Estonian</option>
                      <option value={"ee"}>Ewe</option>
                      <option value={"fo"}>Faroese</option>
                      <option value={"h1"}>Fiji hindi</option>
                      <option value={"fj"}>Fijian</option>
                      <option value={"f1"}>Filipino</option>
                      <option value={"fi"}>Finnish</option>
                      <option value={"fr"}>French</option>
                      <option value={"f2"}>Frisian, northern</option>
                      <option value={"fy"}>Frisian, western</option>
                      <option value={"ff"}>Fulah</option>
                      <option value={"gl"}>Galician</option>
                      <option value={"lg"}>Ganda</option>
                      <option value={"ka"}>Georgian</option>
                      <option value={"de"}>German</option>
                      <option value={"n2"}>German, low</option>
                      <option value={"g1"}>Goan konkani</option>
                      <option value={"el"}>Greek</option>
                      <option value={"e2"}>Greek-romaji</option>
                      <option value={"kl"}>Greenlandic</option>
                      <option value={"gn"}>Guarani</option>
                      <option value={"gu"}>Gujarati</option>
                      <option value={"g2"}>Gujarati-romaji</option>
                      <option value={"ht"}>Haitian creole</option>
                      <option value={"ha"}>Hausa</option>
                      <option value={"he"}>Hebrew</option>
                      <option value={"hz"}>Herero</option>
                      <option value={"hi"}>Hindi</option>
                      <option value={"h3"}>Hindi-romaji</option>
                      <option value={"ho"}>Hiri motu</option>
                      <option value={"hu"}>Hungarian</option>
                      <option value={"is"}>Icelandic</option>
                      <option value={"io"}>Ido</option>
                      <option value={"ig"}>Igbo</option>
                      <option value={"i1"}>Iloko</option>
                      <option value={"id"}>Indonesian</option>
                      <option value={"ia"}>Interlingua</option>
                      <option value={"ie"}>Interlingue</option>
                      <option value={"iu"}>Inuktitut</option>
                      <option value={"ik"}>Inupiaq</option>
                      <option value={"ga"}>Irish</option>
                      <option value={"it"}>Italian</option>
                      <option value={"ja"}>Japanese</option>
                      <option value={"rj"}>Japanese-romaji</option>
                      <option value={"jv"}>Javanese</option>
                      <option value={"x1"}>Kalmyk</option>
                      <option value={"kn"}>Kannada</option>
                      <option value={"k2"}>Kannada-romaji</option>
                      <option value={"kr"}>Kanuri</option>
                      <option value={"k1"}>Karachay-balkar</option>
                      <option value={"ks"}>Kashmiri</option>
                      <option value={"kk"}>Kazakh</option>
                      <option value={"km"}>Khmer, central</option>
                      <option value={"ki"}>Kikuyu</option>
                      <option value={"rw"}>Kinyarwanda</option>
                      <option value={"ky"}>Kirghiz</option>
                      <option value={"kv"}>Komi</option>
                      <option value={"kg"}>Kongo</option>
                      <option value={"ko"}>Korean</option>
                      <option value={"rk"}>Korean-romaji</option>
                      <option value={"kj"}>Kuanyama</option>
                      <option value={"ku"}>Kurdish</option>
                      <option value={"lo"}>Lao</option>
                      <option value={"la"}>Latin</option>
                      <option value={"lv"}>Latvian</option>
                      <option value={"l1"}>Lezghian</option>
                      <option value={"li"}>Limburgish</option>
                      <option value={"ln"}>Lingala</option>
                      <option value={"lt"}>Lithuanian</option>
                      <option value={"j1"}>Lojban</option>
                      <option value={"l2"}>Lombard</option>
                      <option value={"lu"}>Luba-katanga</option>
                      <option value={"lb"}>Luxembourgish</option>
                      <option value={"mk"}>Macedonian</option>
                      <option value={"m1"}>Maithili</option>
                      <option value={"mg"}>Malagasy</option>
                      <option value={"ms"}>Malay</option>
                      <option value={"ml"}>Malayalam</option>
                      <option value={"m8"}>Malayalam-romaji</option>
                      <option value={"mt"}>Maltese</option>
                      <option value={"gv"}>Manx</option>
                      <option value={"mi"}>Maori</option>
                      <option value={"mr"}>Marathi</option>
                      <option value={"m9"}>Marathi-romaji</option>
                      <option value={"mh"}>Marshallese</option>
                      <option value={"m7"}>Mazanderani</option>
                      <option value={"m3"}>Minangkabau</option>
                      <option value={"x2"}>Mingrelian</option>
                      <option value={"m5"}>Mirandese</option>
                      <option value={"mo"}>Moldavian</option>
                      <option value={"mn"}>Mongolian</option>
                      <option value={"n4"}>Nahuatl</option>
                      <option value={"na"}>Nauru</option>
                      <option value={"nv"}>Navajo</option>
                      <option value={"nd"}>Ndebele, north</option>
                      <option value={"nr"}>Ndebele, south</option>
                      <option value={"ng"}>Ndonga</option>
                      <option value={"n1"}>Neapolitan</option>
                      <option value={"n3"}>Nepal bhasa</option>
                      <option value={"ne"}>Nepali</option>
                      <option value={"n5"}>Nepali-romaji</option>
                      <option value={"l3"}>Northern luri</option>
                      <option value={"no"}>Norwegian</option>
                      <option value={"nb"}>Norwegian bokmål</option>
                      <option value={"nn"}>Norwegian nynorsk</option>
                      <option value={"oc"}>Occitan</option>
                      <option value={"oj"}>Ojibwa</option>
                      <option value={"or"}>Oriya</option>
                      <option value={"o1"}>Oriya-romaji</option>
                      <option value={"om"}>Oromo</option>
                      <option value={"os"}>Ossetian</option>
                      <option value={"pi"}>Pali</option>
                      <option value={"p1"}>Pampanga</option>
                      <option value={"pa"}>Panjabi</option>
                      <option value={"p5"}>Panjabi-romaji</option>
                      <option value={"fa"}>Persian</option>
                      <option value={"p2"}>Pfaelzisch</option>
                      <option value={"p3"}>Piemontese</option>
                      <option value={"pl"}>Polish</option>
                      <option value={"pt"}>Portuguese</option>
                      <option value={"ps"}>Pushto</option>
                      <option value={"qu"}>Quechua</option>
                      <option value={"ro"}>Romanian</option>
                      <option value={"rm"}>Romansh</option>
                      <option value={"rn"}>Rundi</option>
                      <option value={"b4"}>Russia buriat</option>
                      <option value={"ru"}>Russian</option>
                      <option value={"r2"}>Russian-romaji</option>
                      <option value={"r1"}>Rusyn</option>
                      <option value={"se"}>Sami, northern</option>
                      <option value={"sm"}>Samoan</option>
                      <option value={"sg"}>Sango</option>
                      <option value={"sa"}>Sanskrit</option>
                      <option value={"s4"}>Sanskrit-romaji</option>
                      <option value={"sc"}>Sardinian</option>
                      <option value={"s3"}>Scots</option>
                      <option value={"gd"}>Scottish gaelic</option>
                      <option value={"sr"}>Serbian</option>
                      <option value={"sh"}>Serbo-croatian</option>
                      <option value={"sn"}>Shona</option>
                      <option value={"ii"}>Sichuan yi</option>
                      <option value={"s2"}>Sicilian</option>
                      <option value={"sd"}>Sindhi</option>
                      <option value={"si"}>Sinhala</option>
                      <option value={"sk"}>Slovak</option>
                      <option value={"sl"}>Slovenian</option>
                      <option value={"so"}>Somali</option>
                      <option value={"d2"}>Sorbian, lower</option>
                      <option value={"h2"}>Sorbian, upper</option>
                      <option value={"st"}>Sotho, southern</option>
                      <option value={"a4"}>South azerbaijani</option>
                      <option value={"es"}>Spanish</option>
                      <option value={"su"}>Sundanese</option>
                      <option value={"sw"}>Swahili</option>
                      <option value={"ss"}>Swati</option>
                      <option value={"sv"}>Swedish</option>
                      <option value={"tl"}>Tagalog</option>
                      <option value={"ty"}>Tahitian</option>
                      <option value={"tg"}>Tajik</option>
                      <option value={"ta"}>Tamil</option>
                      <option value={"t2"}>Tamil-romaji</option>
                      <option value={"tt"}>Tatar</option>
                      <option value={"te"}>Telugu</option>
                      <option value={"t3"}>Telugu-romaji</option>
                      <option value={"th"}>Thai</option>
                      <option value={"t4"}>Thai-romaji</option>
                      <option value={"bo"}>Tibetan</option>
                      <option value={"ti"}>Tigrinya</option>
                      <option value={"to"}>Tonga (tonga islands)</option>
                      <option value={"a1"}>Tosk albanian</option>
                      <option value={"ts"}>Tsonga</option>
                      <option value={"tn"}>Tswana</option>
                      <option value={"tr"}>Turkish</option>
                      <option value={"tk"}>Turkmen</option>
                      <option value={"t1"}>Tuvinian</option>
                      <option value={"tw"}>Twi</option>
                      <option value={"ug"}>Uighur</option>
                      <option value={"uk"}>Ukrainian</option>
                      <option value={"ur"}>Urdu</option>
                      <option value={"u1"}>Urdu-romaji</option>
                      <option value={"uz"}>Uzbek</option>
                      <option value={"ve"}>Venda</option>
                      <option value={"v1"}>Venetian</option>
                      <option value={"v2"}>Veps</option>
                      <option value={"vi"}>Vietnamese</option>
                      <option value={"v3"}>Vlaams</option>
                      <option value={"vo"}>Volapük</option>
                      <option value={"wa"}>Walloon</option>
                      <option value={"w1"}>Waray</option>
                      <option value={"cy"}>Welsh</option>
                      <option value={"m4"}>Western mari</option>
                      <option value={"p4"}>Western panjabi</option>
                      <option value={"wo"}>Wolof</option>
                      <option value={"w2"}>Wu chinese</option>
                      <option value={"xh"}>Xhosa</option>
                      <option value={"s1"}>Yakut</option>
                      <option value={"yi"}>Yiddish</option>
                      <option value={"yo"}>Yoruba</option>
                      <option value={"y1"}>Yue chinese</option>
                      <option value={"za"}>Zhuang</option>
                      <option value={"zu"}>Zulu</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.lyrics.enableYoutubeLyrics")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.lyrics.enable_yt}
                    />
                  </label>
                </div>
              </div>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.lyrics.enableQQLyrics")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.lyrics.enable_qq}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tab>
      <Tab>
        <div>
          <SVGIcon
            url={"./assets/feather/radio.svg"}
            classes={"svg-md"}
            name={"settings-connectivity"}
          />
        </div>
        <div>{t("settings.header.connectivity")}</div>
        <div className={"settings-tab-content"}>
          <div className={"md-option-container"}>
            {/* Connectivity Settings  */}
            <div className={"md-option-header"}>
              <span>{t("settings.header.connectivity")}</span>
            </div>
            <div className={"settings-option-body"}>
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.connectivity.playbackNotifications")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.general.playbackNotifications}
                    />
                  </label>
                </div>
              </div>

              {/* DiscordRPC  */}
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.connectivity.discordRPC")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.connectivity.discord_rpc.enabled}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: app.cfg.connectivity.discord_rpc.enabled ? "inherit" : "none" }}>
                <div className={"md-option-line"}>
                  <div className={"md-option-segment"}>{t("settings.option.connectivity.discordRPC.reload")}</div>
                  <div className={"md-option-segment md-option-segment_auto"}>
                    <button
                      className={"md-btn"}
                      onClick={() => reloadDiscordRPC()}>
                      {t("menubar.options.reload")}
                    </button>
                  </div>
                </div>

                <div className={"md-option-line"}>
                  <div className={"md-option-segment"}>{t("settings.option.connectivity.discordRPC.clientName")}</div>
                  <div className={"md-option-segment md-option-segment_auto"}>
                    <label>
                      <select
                        className={"md-select"}
                        v-model={app.cfg.connectivity.discord_rpc.client}>
                        <option value={"Cider"}>{t("app.name")}</option>
                        <option value={"AppleMusic"}>{t("term.appleMusic")}</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className={"md-option-line"}>
                  <div className={"md-option-segment"}>{t("settings.option.connectivity.discordRPC.clearOnPause")}</div>
                  <div className={"md-option-segment md-option-segment_auto"}>
                    <label>
                      <input
                        type={"checkbox"}
                        v-model={app.cfg.connectivity.discord_rpc.clear_on_pause}
                      />
                    </label>
                  </div>
                </div>

                <div className={"md-option-line"}>
                  <div className={"md-option-segment"}>{t("settings.option.connectivity.discordRPC.hideTimestamp")}</div>
                  <div className={"md-option-segment md-option-segment_auto"}>
                    <label>
                      <input
                        type={"checkbox"}
                        v-model={app.cfg.connectivity.discord_rpc.activity.hide_timestamp}
                      />
                    </label>
                  </div>
                </div>

                <div className={"md-option-line"}>
                  <div className={"md-option-segment"}>
                    {t("settings.option.connectivity.discordRPC.detailsFormat")}
                    <br />
                    <small>
                      {t("term.variables")}: {artist}, {composer}, {title},{album},{trackNumber}
                    </small>
                  </div>
                  <div className={"md-option-segment md-option-segment_auto"}>
                    <label>
                      <input
                        type={"text"}
                        v-model={app.cfg.connectivity.discord_rpc.activity.details_format}
                      />
                    </label>
                  </div>
                </div>

                <div className={"md-option-line"}>
                  <div className={"md-option-segment"}>
                    {t("settings.option.connectivity.discordRPC.stateFormat")}
                    <small>
                      {t("term.variables")}: {artist}, {composer}, {title},{album},{trackNumber}
                    </small>
                  </div>
                  <div className={"md-option-segment md-option-segment_auto"}>
                    <label>
                      <input
                        type={"text"}
                        v-model={app.cfg.connectivity.discord_rpc.activity.state_format}
                      />
                    </label>
                  </div>
                </div>

                <div className={"md-option-line"}>
                  <div className={"md-option-segment"}>{t("settings.option.connectivity.discordRPC.showActivityButtons")}</div>
                  <div className={"md-option-segment md-option-segment_auto"}>
                    <label>
                      <input
                        type={"checkbox"}
                        v-model={app.cfg.connectivity.discord_rpc.activity.buttons.enabled}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: app.cfg.connectivity.discord_rpc.activity.buttons.enabled ? "inherit" : "none" }}>
                  <div className={"md-option-line"}>
                    <div className={"md-option-segment"}>{t("settings.option.connectivity.discordRPC.firstButton")}</div>
                    <div className={"md-option-segment md-option-segment_auto"}>
                      <label>
                        <select
                          className={"md-select"}
                          v-model={app.cfg.connectivity.discord_rpc.activity.buttons.first}
                          onChange={(e) => (e.target.value === "disabled" ? (app.cfg.connectivity.discord_rpc.activity.buttons.second = "disabled") : "")}>
                          {app.cfg.connectivity.discord_rpc.activity.buttons.options.map((option) => (
                            <option
                              key={option.id}
                              value={"option"}
                              style={{ display: app.cfg.connectivity.discord_rpc.activity.buttons.second !== option ? "inherit" : "none" }}>
                              {t(`settings.option.connectivity.discordRPC.buttons.${option}`)}
                            </option>
                          ))}
                          <option value={"disabled"}>{t("term.disabled")}</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div
                    className={"md-option-line"}
                    style={{ display: app.cfg.connectivity.discord_rpc.activity.buttons.first !== "disabled" ? "inherit" : "none" }}>
                    <div className={"md-option-segment"}>{t("settings.option.connectivity.discordRPC.secondButton")}</div>
                    <div className={"md-option-segment md-option-segment_auto"}>
                      <label>
                        <select
                          className={"md-select"}
                          v-model={app.cfg.connectivity.discord_rpc.activity.buttons.second}>
                          {app.cfg.connectivity.discord_rpc.activity.buttons.options.map((option) => (
                            <option
                              key={option.id}
                              value={"option"}
                              style={{ display: app.cfg.connectivity.discord_rpc.activity.buttons.first !== option ? "inherit" : "none" }}>
                              {t(`settings.option.connectivity.discordRPC.buttons.${option}`)}
                            </option>
                          ))}
                          <option value={"disabled"}>{t("term.disabled")}</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* LastFM  */}
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{t("settings.option.connectivity.lastfmScrobble")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <button
                    className={"md-btn"}
                    id={"lfmConnect"}
                    onClick={() => (app.cfg.connectivity.lastfm.enabled ? lfmDisconnect() : lfmAuthorize())}>
                    {t(`term.${$root.cfg.connectivity.lastfm.enabled ? "disconnect" : "connect"}`)}
                    <br />
                    <small>
                      {app.cfg.connectivity.lastfm.enabled
                        ? `${t("term.authed")}:
                                                ${$root.cfg.connectivity.lastfm.secrets.username}`
                        : ""}
                    </small>
                  </button>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: lastfmConnecting ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>
                  {t("settings.option.connectivity.lastfmScrobble.manualToken")}
                  <small>
                    <a
                      href={"https://www.last.fm/api/auth?api_key=f9986d12aab5a0fe66193c559435ede3"}
                      target={"_blank"}
                      rel={"noreferrer"}>
                      {t("settings.option.connectivity.lastfmScrobble.manualToken.link")}
                    </a>
                  </small>
                </div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <form submitprevent={submitToken}>
                      <input
                        type={"text"}
                        autoFocus
                        id={"lfmToken"}
                      />
                      <input
                        type={"submit"}
                        className={"md-btn"}
                        value={t("action.submit")}
                      />
                    </form>
                  </label>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: app.cfg.connectivity.lastfm.enabled ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>{t("settings.option.connectivity.lastfmScrobble.delay")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"number"}
                      min={"50"}
                      max={"100"}
                      v-model={app.cfg.connectivity.lastfm.scrobble_after}
                    />
                  </label>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: app.cfg.connectivity.lastfm.enabled ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>
                  {t("settings.option.connectivity.lastfmScrobble.filterLoop")}
                  <small>{t("settings.option.connectivity.lastfmScrobble.filterLoop.description")}</small>
                </div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.connectivity.lastfm.filter_loop}
                    />
                  </label>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: app.cfg.connectivity.lastfm.enabled ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>{t("settings.option.connectivity.lastfmScrobble.removeFeatured")}</div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.connectivity.lastfm.remove_featured}
                    />
                  </label>
                </div>
              </div>
              <div
                className={"md-option-line"}
                style={{ display: app.cfg.connectivity.lastfm.enabled ? "inherit" : "none" }}>
                <div className={"md-option-segment"}>
                  {t("settings.option.connectivity.lastfmScrobble.filterTypes")}
                  <small>{t("settings.option.connectivity.lastfmScrobble.filterTypes.description")}</small>
                </div>
                <div className={"md-option-segment md-option-segment_auto"}>
                  <label>
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.connectivity.lastfm.filter_types["song"]}
                    />
                    {t("term.songs")}
                    <br />
                    <input
                      type={"checkbox"}
                      v-model={app.cfg.connectivity.lastfm.filter_types["musicVideo"]}
                    />
                    {t("term.musicVideos")}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tab>
      <div>
        <SVGIcon
          url={"./assets/feather/hard-drive.svg"}
          classes={"svg-md"}
          name={"settings-advanced"}
        />
      </div>
      <div>{t("settings.header.advanced")}</div>
      <div className={"md-option-container"}>
        {/* Debug Settings  */}
        <div className={"md-option-header"}>
          <span>{t("settings.header.debug")}</span>
        </div>
        <div className={"settings-option-body"}>
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.debug.copy_log")}</div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <button
                className={"md-btn"}
                onClick={() => copyLogs}>
                {t("action.copy")}
              </button>
            </div>
          </div>
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>{t("settings.option.debug.openAppData")}</div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <button
                className={"md-btn"}
                onClick={() => openAppData}>
                {t("action.open")}
              </button>
            </div>
          </div>
          <div className={"md-option-line"}>
            <div className={"md-option-segment"}>
              Performant Logging
              <small>Disables debug logging, resulting in a slightly faster Cider. (Requires relaunch)</small>
            </div>
            <div className={"md-option-segment md-option-segment_auto"}>
              <label>
                <input
                  type={"checkbox"}
                  v-model={app.cfg.advanced.disableLogging}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Experimental Settings  */}
        <div className={"md-option-header"}>
          <span>{t("settings.header.experimental")}</span>
        </div>
      </div>
      {/*<div className="md-option-line">
                                    <div className="md-option-segment">
                                        {t('settings.option.visual.plugin.github.explore')}
                                    </div>
                                    <div className="md-option-segment md-option-segment_auto">
                                        <button className="md-btn" onClick={() =>$root.openSettingsPage('github-plugins')}>{
                                            t("settings.option.visual.plugin.github.explore") }
                                        </button>
                                    </div>
                                </div>*/}
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.option.experimental.reinstallwidevine")}</div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <button
            className={"md-btn"}
            onClick={() => reinstallWidevineCDM}>
            {t("settings.option.experimental.reinstallwidevine")}
          </button>
        </div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>Immersive Fullscreen Test</div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <input
              type={"checkbox"}
              v-model={app.cfg.advanced.experiments.includes("immersive-preview")}
              onClick={() => (app.cfg.advanced.experiments.includes("immersive-preview") ? removeExperiment("immersive-preview") : addExperiment("immersive-preview"))}
            />
          </label>
        </div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>
          {t("settings.option.experimental.unknownPlugin")}
          <br />
          <small>{t("settings.option.experimental.unknownPlugin.description")}</small>
        </div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <input
              type={"checkbox"}
              v-model={app.cfg.advanced.experiments.includes("unknown-sources")}
              onClick={() => (app.cfg.advanced.experiments.includes("unknown-sources") ? removeExperiment("unknown-sources") : addExperiment("unknown-sources"))}
            />
          </label>
        </div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>
          Theme & Plugin Mirror to Cider
          <small>Only works in region where GitHub is blacklisted. Requires relaunch.</small>
        </div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <input
              type={"checkbox"}
              v-model={app.cfg.advanced.experiments.includes("cider_mirror")}
              onClick={() => (app.cfg.advanced.experiments.includes("cider_mirror") ? removeExperiment("cider_mirror") : addExperiment("cider_mirror"))}
            />
          </label>
        </div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>
          {t("settings.option.advanced.playlistTrackMapping")}
          <br />
          <small>{t("settings.option.advanced.playlistTrackMapping.description")}</small>
        </div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <input
              type={"checkbox"}
              v-model={app.cfg.advanced.playlistTrackMapping}
            />
          </label>
        </div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>
          {t("settings.option.experimental.compactUI")}
          {!!app.getThemeDirective("forceUI") && <small>{t("term.themeManaged")}</small>}
        </div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <input
              type={"checkbox"}
              v-model={app.cfg.advanced.experiments.includes("compactui")}
              onClick={() => (app.cfg.advanced.experiments.includes("compactui") ? removeExperiment("compactui") : addExperiment("compactui"))}
              disabled={!!app.getThemeDirective("forceUI")}
            />
          </label>
        </div>
      </div>
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>{t("settings.option.experimental.inline_playlists")}</div>
        <div className={"md-option-segment md-option-segment_auto"}>
          <label>
            <input
              type={"checkbox"}
              disabled
              v-model={app.cfg.advanced.experiments.includes("inline-playlists")}
              onClick={() => (app.cfg.advanced.experiments.includes("inline-playlists") ? removeExperiment("inline-playlists") : addExperiment("inline-playlists"))}
            />
          </label>
        </div>
      </div>
      {(app.platform === "win32" || app.platform === "linux") && (
        <div className={"md-option-line update-check"}>
          <div className={"md-option-segment"}>
            {t("settings.option.visual.transparent")}
            <br />
            <small>({t("settings.option.visual.transparent.description")})</small>
          </div>
          <div className={"md-option-segment md-option-segment_auto"}>
            <label>
              <input
                type={"checkbox"}
                v-model={app.cfg.visual.transparent}
                onChange={() => promptForRelaunch()}
              />
            </label>
          </div>
        </div>
      )}
      <div className={"md-option-line"}>
        <div className={"md-option-segment"}>
          {t("settings.option.general.pagination")}
          <br />
          <small>
            {t("settings.options.general.pagination.description")}
            <br />
          </small>
        </div>
      </div>
      <option value={"100"}>100</option>
      <option value={"500"}>500</option>
      {/*keybinds Settings  */}
      <Tab id={"hid"}>
        <Keybinds />
      </Tab>
      {/*keybinds-settings  */}
      {/*Github-theme-settings  */}
      <Tab id={"hid"}>
        <ThemesGithub />
      </Tab>
      {/*Github-theme-settings  */}
      {/* Connect Settings  */}
      {/* Not Prod Ready<Tab title={t('settings.header.connect')}>
                <div className="md-option-container">
                    <!!!!!-- Cider Connect / Linking Settings -!->
                    <div className="md-option-header">
                        <span>{t('settings.header.connect')}</span>
                    </div>
                    <div className="settings-option-body">{(app.cfg.connectUser.auth === null) && <div className="md-option-line update-check" >
                            <div className="md-option-segment">
                                {t('settings.option.connect.link_account')}
                                <small>{t('settings.option.connect.link_account.description')}</small>
                                <br/>
                                <small>Debug Status: { app.cfg.connectUser }</small>
                            </div>
                            <div className="md-option-segment md-option-segment_auto">
                                <button className="md-btn" id='settings.option.general.updateCider.check' onClick={() =>authCC()}>
                                    {t('term.connect')}
                                </button>
                            </div>
                        </div>}{(app.cfg.connectUser.auth !== null) && <div>
                            <div className="md-option-line">
                                <div className="md-option-segment">
                                    {t('settings.option.connect.link_account')}
                                    <small>{t('settings.option.connect.link_account.description')}</small>
                                    <br/>
                                </div>
                                <div className="md-option-segment md-option-segment_auto">
                                    <button className="md-btn" id='settings.option.general.updateCider.check'
                                            onClick={() =>logoutCC()} style={{display: flex,alignItems: center,gap: 0.4em}}>
                                        {import("../svg/check.svg") }
                                        <div v>Connected</div>
                                    </button>
                                </div>
                            </div>
                            <div className="md-option-header" style={{marginLeft: -0.55em}}>
                                <span>{app.cfg.connectUser.username}</span>
                                <img src="https://cdn.discordapp.com/avatars/' + app.cfg.connectUser.id + '/' + app.cfg.connectUser.avatar + '.png?size=32' alt="Discord Avatar" />
                            </div>

                            <div className="md-option-line">
                                <div className="md-option-segment">
                                    Sync Settings
                                </div>
                                <div className="md-option-segment md-option-segment_auto">
                                    <label>
                                        <input type="checkbox" a-v-model={app.cfg.connectUser.sync.settings}
                                               onClick={() =>app.cfg.connectUser.sync.settings = !app.cfg.connectUser.sync.settings}
                                               switch/>
                                    </label>
                                </div>
                            </div>

                            <div className="md-option-line">
                                <div className="md-option-segment">
                                    Sync Themes
                                </div>
                                <div className="md-option-segment md-option-segment_auto">
                                    <label>
                                        <input type="checkbox" disabled a-v-model={app.cfg.connectUser.sync.themes}
                                               onClick={() =>app.cfg.connectUser.sync.themes = !app.cfg.connectUser.sync.themes}
                                               switch/>
                                    </label>
                                </div>
                            </div>

                            <div className="md-option-line">
                                <div className="md-option-segment">
                                    Sync Plugins
                                </div>
                                <div className="md-option-segment md-option-segment_auto">
                                    <label>
                                        <input type="checkbox" disabled a-v-model={app.cfg.connectUser.sync.plugins}
                                               onClick={() =>app.cfg.connectUser.sync.plugins = !app.cfg.connectUser.sync.plugins}
                                               switch/>
                                    </label>
                                </div>
                            </div>

                        </div>}</div>
                </div>
            </Tab>*/}
    </div>
  );
};
export default SettingsWindow;
