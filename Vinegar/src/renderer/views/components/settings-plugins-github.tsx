export const Component = () => {
  Vue.component("plugins-github", {
    template: "#plugins-github",
    props: [],
    data: function () {
      return {
        repos: [],
        openRepo: {
          id: -1,
          name: "",
          description: "",
          html_url: "",
          stargazers_count: 0,
          owner: {
            avatar_url: "",
          },
          readme: "",
        },
        themesInstalled: [],
      };
    },
    mounted() {
      this.getRepos();
      // this.getInstalledThemes();
    },
    methods: {
      getInstalledThemes() {
        let self = this;
        const themes = ipcRenderer.sendSync("get-themes");
        // for each theme, get the github_repo property and push it to the themesInstalled array, if not blank
        themes.forEach((theme) => {
          if (theme.github_repo !== "") {
            self.themesInstalled.push(theme.github_repo);
          }
        });
      },
      showRepo(repo) {
        const self = this;
        const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/README.md`;
        var requestOptions = {
          method: "GET",
          redirect: "follow",
        };

        app
          ._fetch(readmeUrl, requestOptions)
          .then((response) => response.text())
          .then((result) => {
            self.openRepo = repo;
            self.openRepo.readme = self.convertReadMe(result);
          })
          .catch((error) => {
            self.openRepo = repo;
            self.openRepo.readme = `This repository doesn't have a README.md file.`;
            console.log("error", error);
          });
      },
      convertReadMe(text) {
        return marked.parse(text);
      },
      installThemeRepo(repo) {
        let self = this;
        let msg = app.stringTemplateParser(app.getLz("settings.option.visual.plugin.github.install.confirm"), {
          repo: repo.full_name,
        });
        app.confirm(msg, (res) => {
          if (res) {
            ipcRenderer.once("plugin-installed", (event, arg) => {
              if (arg.success) {
                self.themes = [];
                notyf.success(app.getLz("settings.notyf.visual.plugin.install.success"));
                app.confirm(app.getLz("settings.prompt.visual.plugin.github.success"), (ok) => {
                  if (ok) {
                    ipcRenderer.invoke("relaunchApp");
                  } else {
                    return;
                  }
                });
              } else {
                notyf.error(app.getLz("settings.notyf.visual.plugin.install.error"));
              }
            });
            ipcRenderer.invoke("get-github-plugin", repo.html_url);
          }
        });
      },
      installThemeURL() {
        let self = this;
        app.prompt(app.getLz("settings.prompt.visual.plugin.github.URL"), (result) => {
          if (result) {
            ipcRenderer.once("plugin-installed", (event, arg) => {
              if (arg.success) {
                self.themes = ipcRenderer.sendSync("get-themes");
                app.confirm(app.getLz("settings.prompt.visual.plugin.github.success"), (ok) => {
                  if (ok) {
                    ipcRenderer.invoke("relaunchApp");
                  } else {
                    return;
                  }
                });
                notyf.success(app.getLz("settings.notyf.visual.plugin.install.success"));
              } else {
                notyf.error(app.getLz("settings.notyf.visual.plugin.install.error"));
              }
            });
            ipcRenderer.invoke("get-github-plugin", result);
          }
        });
      },
      getRepos() {
        let self = this;
        var requestOptions = {
          method: "GET",
          redirect: "follow",
        };

        app
          ._fetch("https://api.github.com/search/repositories?q=topic:cidermusicplugin fork:true&per_page=100", requestOptions)
          .then((response) => response.text())
          .then((result) => {
            self.repos = JSON.parse(result).items;
          })
          .catch((error) => console.log("error", error));
      },
    },
  });
  return (
    <div id="plugins-github">
      <div className="github-themes-page">
        <div className="gh-header">
          <div className="row">
            <div className="col nopadding">
              <h1 className="header-text">{$root.getLz("settings.header.visual.plugin.github.page")}</h1>
            </div>
            <div className="col-auto nopadding cider-flex-center">
              <button
                className="md-btn md-btn-small md-btn-block"
                click="installThemeURL()">
                {$root.getLz("settings.option.visual.plugin.github.download")}
              </button>
            </div>
          </div>
        </div>
        <div className="gh-content">
          <div className="repos-list">
            <ul className="list-group list-group-flush">
              <li
                click="showRepo(repo)"
                className="list-group-item list-group-item-dark"
                style="{'background': (repo.id == openRepo.id) ? 'var(--keyColor)' : '', 'border-radius': '5px'}"
                v-for="repo in repos">
                <div className="row">
                  <div className="col cider-flex-center">
                    <div>
                      <h4 className="repo-name">{repo.description != null ? repo.description : repo.full_name}</h4>
                      <div>⭐ {repo.stargazers_count}</div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div
            className="github-preview"
            v-if="openRepo.full_name">
            <div className="gh-preview-header">
              <div className="row nopadding">
                <div className="col nopadding cider-flex-center">
                  <div>
                    <h3 className="repo-preview-name">{openRepo.description}</h3>
                    <div>
                      <div
                        className="svg-icon inline"
                        style="{'--url': 'url(\'./assets/github.svg\')'}"></div>
                      <a
                        className="repo-url"
                        target="_blank"
                        href="openRepo.html_url">
                        {openRepo.full_name}
                      </a>
                    </div>
                    <div>⭐ {openRepo.stargazers_count}</div>
                  </div>
                </div>
                <div className="col-auto nopadding cider-flex-center">
                  <button
                    className="md-btn md-btn-primary"
                    click="installThemeRepo(openRepo)">
                    <span v-if="!themesInstalled.includes(openRepo.full_name)">{$root.getLz("action.install")}</span>
                    <span v-else>{$root.getLz("action.update")}</span>
                  </button>
                </div>
              </div>
            </div>
            <hr />
            <div
              v-html="openRepo.readme"
              className="github-content"></div>
          </div>
          <div
            className="github-preview"
            v-else></div>
        </div>
      </div>
    </div>
  );
};
