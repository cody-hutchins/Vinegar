export const StylestackEditor = ({ themes }: { themes: object[] }) => {
  let selected = null;
  let newTheme = null;
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

  function gitHubExplore() {
    this.$root.openSettingsPage("github-themes");
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
    <div className="stylestack-editor">
      <draggable
        className="list-group"
        v-model={$root.cfg.visual.styles}
        end={$root.reloadStyles()}>
        {$root.cfg.visual.styles.map((theme) => (
          <b-list-group-item
            variant="dark"
            key="theme">
            <b-row>
              <b-col sm="auto">
                <div className="handle codicon codicon-grabber" />
              </b-col>
              <b-col className="themeLabel">{getThemeName(theme)}</b-col>
              <b-col sm="auto">
                <button
                  className="removeItem codicon codicon-close"
                  onClick={() => remove(theme)}
                />
              </b-col>
            </b-row>
          </b-list-group-item>
        ))}
      </draggable>
    </div>
  );
};

export const InstalledThemes = () => {
  let repos = [];
  let openRepo = {
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
  let themesInstalled = [];
  let themes = [];
  function mounted() {
    getThemesList();
  }
  function getThemesList() {
    let themes = ipcRenderer.sendSync("get-themes");
    themes.unshift({
      name: "Acrylic Grain",
      file: "grain.less",
    });
    themes.unshift({
      name: "Sweetener",
      file: "sweetener.less",
    });
    themes.unshift({
      name: "Reduce Visuals",
      file: "reduce_visuals.less",
    });
    // themes.unshift({
    //     name: "Inline Drawer",
    //     file: "inline_drawer.less"
    // })
    themes.unshift({
      name: "Dark",
      file: "dark.less",
    });
    themes = themes;
  }
  const contextMenu = (event, theme) => {
    let menu = {
      items: {
        uninstall: {
          name: app.getLz("settings.option.visual.theme.uninstall"),
          disabled: true,
          action: () => {
            app.confirm(
              app.stringTemplateParser(app.getLz("settings.prompt.visual.theme.uninstallTheme"), {
                theme: theme.name ?? theme.file,
              }),
              (res) => {
                if (res) {
                  console.debug(theme);
                  ipcRenderer.once("theme-uninstalled", (event, args) => {
                    console.debug(event, args);
                    getThemesList();
                  });
                  ipcRenderer.invoke("uninstall-theme", theme.path);
                }
              },
            );
          },
        },
        viewInfo: {
          name: app.getLz("settings.option.visual.theme.viewInfo"),
          disabled: true,
          action: () => {},
        },
      },
    };
    if (theme.path) {
      menu.items.uninstall.disabled = false;
    }
    this.$root.showMenuPanel(menu, event);
  };
  function openThemesFolder() {
    ipcRenderer.invoke("open-path", "themes");
  }
  function getInstalledThemes() {
    const themes = ipcRenderer.sendSync("get-themes");
    // for each theme, get the github_repo property and push it to the themesInstalled array, if not blank
    themes.forEach((theme) => {
      if (theme.github_repo !== "" && typeof theme.commit !== "") {
        themesInstalled.push(theme.github_repo.toLowerCase());
      }
    });
  }
  function addStyle(filename) {
    this.$refs.stackEditor.addStyle(filename);
  }
  function showRepo(repo) {
    const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/README.md`;
    let requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    app
      ._fetch(readmeUrl, requestOptions)
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
    let msg = app.stringTemplateParser(app.getLz("settings.option.visual.theme.github.install.confirm"), {
      repo: repo.full_name,
    });
    app.confirm(msg, (res) => {
      if (res) {
        ipcRenderer.once("theme-installed", (event, arg) => {
          if (arg.success) {
            themes = ipcRenderer.sendSync("get-themes");
            getInstalledThemes();
            notyf.success(app.getLz("settings.notyf.visual.theme.install.success"));
          } else {
            notyf.error(app.getLz("settings.notyf.visual.theme.install.error"));
          }
        });
        ipcRenderer.invoke("get-github-theme", repo.html_url);
      }
    });
  }
  function installThemeURL() {
    app.prompt(app.getLz("settings.prompt.visual.theme.github.URL"), (result) => {
      if (result) {
        ipcRenderer.once("theme-installed", (event, arg) => {
          if (arg.success) {
            themes = ipcRenderer.sendSync("get-themes");
            notyf.success(app.getLz("settings.notyf.visual.theme.install.success"));
          } else {
            notyf.error(app.getLz("settings.notyf.visual.theme.install.error"));
          }
        });
        ipcRenderer.invoke("get-github-theme", result);
      }
    });
  }
  function getRepos() {
    let requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch("https://api.github.com/search/repositories?q=topic:cidermusictheme fork:true", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        let items = JSON.parse(result).items;
        repos = items;
      })
      .catch((error) => console.log("error", error));
  }
  return (
    <div id="installed-themes">
      <div className="installed-themes-page">
        <div className="gh-header">
          <div className="row">
            <div className="col nopadding">
              <h1 className="header-text">{$root.getLz("settings.option.visual.theme.manageStyles")}</h1>
            </div>
            <div className="col-auto nopadding cider-flex-center">
              <button
                className="md-btn md-btn-small md-btn-block"
                onClick={() => $root.openSettingsPage("github-themes")}>
                {$root.getLz("settings.option.visual.theme.github.explore")}
              </button>
            </div>
            <div className="col-auto  cider-flex-center">
              <button
                className="md-btn md-btn-small md-btn-block"
                onClick={() => $root.checkForThemeUpdates()}>
                {$root.getLz("settings.option.visual.theme.checkForUpdates")}
              </button>
            </div>
            <div className="col-auto nopadding cider-flex-center">
              <button
                className="md-btn md-btn-small md-btn-block"
                onClick={() => openThemesFolder()}>
                {$root.getLz("settings.option.visual.theme.github.openfolder")}
              </button>
            </div>
          </div>
        </div>
        <div className="gh-content">
          <div className="repos-list">
            <div className="repo-header">
              <h4>{$root.getLz("settings.option.visual.theme.github.available")}</h4>
            </div>
            <ul className="list-group list-group-flush">
              {themes.map((theme) => (
                <div>
                  <li
                    onClick={() => addStyle(theme.file)}
                    contextmenu="contextMenu($event, theme)"
                    className="list-group-item list-group-item-dark"
                    className="{'applied': $root.cfg.visual.styles.includes(theme.file)}">
                    <b-row>
                      <b-col className="themeLabel">{theme.name}</b-col>
                      <template v-if={$root.cfg.visual.styles.includes(theme.file)}>
                        <b-col
                          sm="auto"
                          v-if={theme.pack}>
                          <button className="themeContextMenu codicon codicon-package" />
                        </b-col>
                        <b-col sm="auto">
                          <button className="themeContextMenu codicon codicon-check" />
                        </b-col>
                      </template>
                      <template v-else>
                        <b-col
                          sm="auto"
                          v-if={theme.pack}>
                          <button className="themeContextMenu codicon codicon-package" />
                        </b-col>
                        <b-col sm="auto">
                          <button
                            clickstop="contextMenu($event, theme)"
                            className="themeContextMenu codicon codicon-list-unordered"
                          />
                        </b-col>
                      </template>
                    </b-row>
                  </li>
                  {theme.pack &&
                    theme.pack.amp((packEntry) => (
                      <li
                        onClick={() => addStyle(packEntry.file)}
                        contextmenu="contextMenu($event, theme)"
                        className="list-group-item list-group-item-dark addon"
                        className="{'applied': $root.cfg.visual.styles.includes(packEntry.file)}">
                        <b-row>
                          <b-col className="themeLabel">{packEntry.name}</b-col>
                          <template v-if={$root.cfg.visual.styles.includes(packEntry.file)}>
                            <b-col sm="auto">
                              <button className="themeContextMenu codicon codicon-check" />
                            </b-col>
                          </template>
                          <template v-else>
                            <b-col sm="auto">
                              <button className="themeContextMenu codicon codicon-diff-added" />
                            </b-col>
                          </template>
                        </b-row>
                      </li>
                    ))}
                </div>
              ))}
            </ul>
          </div>

          <div className="style-editor-container">
            <div className="repo-header">
              <h4>{$root.getLz("settings.option.visual.theme.github.applied")} </h4>
            </div>
            <StylestackEditor
              ref="stackEditor"
              v-if={themes.length !== 0}
              themes={themes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
