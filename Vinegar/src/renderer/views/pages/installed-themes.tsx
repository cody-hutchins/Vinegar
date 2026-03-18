import { useEffect } from "react";
import { Col, ListGroupItem, Row } from "react-bootstrap";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

//Not used for Now
export const StylestackEditor = ({ themes = [] }: { themes?: object[] }) => {
  const selected = null;
  const newTheme = null;
  let themeList = [];
  function mounted() {
    console.log(themes);
    themeList = [...themes];

    themeList.forEach((theme) => {
      if (theme.pack) {
        theme.pack.forEach((packEntry) => {
          packEntry.file = theme.file.replace("index.less", "") + packEntry.file;
          themeList.push(packEntry);
        });
      }
    });
  }

  useEffect(() => {
    mounted();
  }, []);

  function gitHubExplore() {
    this.$root.appRoute("themes-github");
  }
  function getThemeName(filename) {
    try {
      return themeList.find((theme) => theme.file === filename).name;
    } catch (e) {
      return filename;
    }
  }
  function moveUp() {
    const styles = this.$root.cfg.visual.styles;
    const index = styles.indexOf(selected);
    if (index > 0) {
      styles.splice(index, 1);
      styles.splice(index - 1, 0, selected);
    }
    this.$root.reloadStyles();
  }
  function moveDown() {
    const styles = this.$root.cfg.visual.styles;
    const index = styles.indexOf(selected);
    if (index < styles.length - 1) {
      styles.splice(index, 1);
      styles.splice(index + 1, 0, selected);
    }
    this.$root.reloadStyles();
  }
  function remove(style) {
    const styles = this.$root.cfg.visual.styles;
    const index = styles.indexOf(style);
    styles.splice(index, 1);
    this.$root.reloadStyles();
  }
  function addStyle(style) {
    const styles = this.$root.cfg.visual.styles;
    styles.push(style);
    this.$root.reloadStyles();
  }
  return (
    <>
      <div className={"stylestack-editor"}>
        <draggable
          className={"list-group"}
          v-model={$root.cfg.visual.styles}
          end={$root.reloadStyles()}>
          {$root.cfg.visual.styles.map((theme) => (
            <ListGroupItem
              variant={"dark"}
              key={theme}>
              <Row>
                <Col sm={"auto"}>
                  <div className={"handle codicon codicon-grabber"} />
                </Col>
                <Col className={"themeLabel"}>{getThemeName(theme)}</Col>
                <Col sm={"auto"}>
                  <button
                    className={"removeItem codicon codicon-close"}
                    onClick={() => remove(theme)}
                  />
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </draggable>
      </div>
    </>
  );
};
export const InstalledThemes = () => {
  const { t } = useTranslation();
  const repos = [];
  const openRepo = {
    id: -1,
    name: "",
    description: "",
    html_url: "",
    stargazers_count: 0,
    owner: {
      avatar_url: "",
    },
    readme: "",
  };
  const themesInstalled = [];
  let themes = [];
  useEffect(() => {
    getThemesList();
  }, []);

  function getThemesList() {
    const _themes = window.electronAPI.sendSync("get-themes");
    _themes.unshift({
      name: "Acrylic Grain",
      file: "grain.less",
    });
    _themes.unshift({
      name: "Sweetener",
      file: "sweetener.less",
    });
    _themes.unshift({
      name: "Reduce Visuals",
      file: "reduce_visuals.less",
    });
    // _themes.unshift({
    //     name: "Inline Drawer",
    //     file: "inline_drawer.less"
    // })
    _themes.unshift({
      name: "Dark",
      file: "dark.less",
    });
    themes = _themes;
  }
  function contextMenu(event, theme) {
    const menu = {
      items: {
        uninstall: {
          name: t("settings.option.visual.theme.uninstall"),
          disabled: true,
          action: () => {
            app.confirm(
              app.stringTemplateParser(t("settings.prompt.visual.theme.uninstallTheme"), {
                theme: theme.name ?? theme.file,
              }),
              (res) => {
                if (res) {
                  console.debug(theme);
                  window.electronAPI.once("theme-uninstalled", (event, args) => {
                    console.debug(event, args);
                    getThemesList();
                  });
                  window.electronAPI.invoke("uninstall-theme", theme.path).then();
                }
              },
            );
          },
        },
        viewInfo: {
          name: t("settings.option.visual.theme.viewInfo"),
          disabled: true,
          action: () => {},
        },
      },
    };
    if (theme.path) {
      menu.items.uninstall.disabled = false;
    }
    this.$root.showMenuPanel(menu, event);
  }
  async function openThemesFolder() {
    window.electronAPI.invoke("open-path", "themes").then();
  }
  function getInstalledThemes() {
    const themes = window.electronAPI.sendSync("get-themes");
    // for each theme, get the github_repo property and push it to the themesInstalled array, if not blank
    themes.forEach((theme) => {
      if (theme.github_repo !== "" && typeof theme.commit !== "undefined") {
        themesInstalled.push(theme.github_repo.toLowerCase());
      }
    });
  }
  function addStyle(filename) {
    this.$refs.stackEditor.addStyle(filename);
  }
  function showRepo(repo) {
    const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/README.md`;
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(readmeUrl, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        openRepo = repo;
        openRepo.readme = convertReadMe(result);
      })
      .catch((error) => {
        openRepo = repo;
        openRepo.readme = `repository doesn't have a README.md file.`;
        console.log("error", error);
      });
  }
  function convertReadMe(text) {
    return marked.parse(text);
  }
  function installThemeRepo(repo) {
    const msg = app.stringTemplateParser(t("settings.option.visual.theme.github.install.confirm"), {
      repo: repo.full_name,
    });
    app.confirm(msg, (res) => {
      if (res) {
        window.electronAPI.once("theme-installed", (event, arg) => {
          if (arg.success) {
            themes = window.electronAPI.sendSync("get-themes");
            getInstalledThemes();
            notyf.success(t("settings.notyf.visual.theme.install.success"));
          } else {
            notyf.error(t("settings.notyf.visual.theme.install.error"));
          }
        });
        window.electronAPI.invoke("get-github-theme", repo.html_url).then();
      }
    });
  }
  function installThemeURL() {
    app.prompt(t("settings.prompt.visual.theme.github.URL"), (result) => {
      if (result) {
        window.electronAPI.once("theme-installed", (event, arg) => {
          if (arg.success) {
            themes = window.electronAPI.sendSync("get-themes");
            notyf.success(t("settings.notyf.visual.theme.install.success"));
          } else {
            notyf.error(t("settings.notyf.visual.theme.install.error"));
          }
        });
        window.electronAPI.invoke("get-github-theme", result).then();
      }
    });
  }
  function getRepos() {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    app
      ._fetch("https://api.github.com/search/repositories?q=topic:cidermusictheme fork:true", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const items = JSON.parse(result).items;
        repos = items;
      })
      .catch((error) => console.log("error", error));
  }

  return (
    <div id={"installed-themes"}>
      <div className={"installed-themes-page"}>
        <div className={"gh-header"}>
          <Row>
            <Col className={"nopadding"}>
              <h1 className={"header-text"}>{t("settings.option.visual.theme.manageStyles")}</h1>
            </Col>
            <Col
              auto
              className={"nopadding flex-center"}>
              <button
                className={"md-btn md-btn-small md-btn-block"}
                onClick={() => $root.appRoute("themes-github")}>
                {t("settings.option.visual.theme.github.explore")}
              </button>
            </Col>
            <Col
              auto
              className={"flex-center"}>
              <button
                className={"md-btn md-btn-small md-btn-block"}
                onClick={() => $root.checkForThemeUpdates()}>
                {t("settings.option.visual.theme.checkForUpdates")}
              </button>
            </Col>
            <Col
              auto
              className={"nopadding flex-center"}>
              <button
                className={"md-btn md-btn-small md-btn-block"}
                onClick={() => openThemesFolder()}>
                {t("settings.option.visual.theme.github.openfolder")}
              </button>
            </Col>
          </Row>
        </div>
        <div className={"gh-content"}>
          <div className={"repos-list"}>
            <div className={"repo-header"}>
              <h4>{t("settings.option.visual.theme.github.available")}</h4>
            </div>
            <ul className={"list-group list-group-flush"}>
              {themes.map((theme) => (
                <div key={theme.id}>
                  <li
                    onClick={() => addStyle(theme.file)}
                    onContextMenu={() => contextMenu($event, theme)}
                    className={classNames("list-group-item list-group-item-dark", { applied: $root.cfg.visual.styles.includes(theme.file) })}>
                    <Row>
                      <Col className={"themeLabel"}>{theme.name}</Col>
                      {$root.cfg.visual.styles.includes(theme.file) ? (
                        <>
                          {theme.pack && (
                            <Col sm={"auto"}>
                              <button className={"themeContextMenu codicon codicon-package"} />
                            </Col>
                          )}
                          <Col sm={"auto"}>
                            <button className={"themeContextMenu codicon codicon-check"} />
                          </Col>
                        </>
                      ) : (
                        <>
                          {theme.pack && (
                            <Col sm={"auto"}>
                              <button className={"themeContextMenu codicon codicon-package"} />
                            </Col>
                          )}
                          <Col sm={"auto"}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                contextMenu(e, theme);
                              }}
                              className={"themeContextMenu codicon codicon-list-unordered"}
                            />
                          </Col>
                        </>
                      )}
                    </Row>
                  </li>
                  {theme.pack.map(
                    (packEntry) =>
                      theme.pack && (
                        <li
                          key={packEntry.id}
                          onClick={() => addStyle(packEntry.file)}
                          onContextMenu={() => contextMenu($event, theme)}
                          className={classNames("list-group-item list-group-item-dark addon", { applied: $root.cfg.visual.styles.includes(packEntry.file) })}>
                          <Row>
                            <Col className={"themeLabel"}>{packEntry.name}</Col>
                            {$root.cfg.visual.styles.includes(packEntry.file) ? (
                              <Col sm={"auto"}>
                                <button className={"themeContextMenu codicon codicon-check"} />
                              </Col>
                            ) : (
                              <Col sm={"auto"}>
                                <button className={"themeContextMenu codicon codicon-diff-added"} />
                              </Col>
                            )}
                          </Row>
                        </li>
                      ),
                  )}
                </div>
              ))}
            </ul>
          </div>

          <div className={"style-editor-container"}>
            <div className={"repo-header"}>
              <h4>{t("settings.option.visual.theme.github.applied")} </h4>
            </div>
            {themes.length !== 0 && (
              <StylestackEditor
                ref={"stackEditor"}
                themes={themes}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
