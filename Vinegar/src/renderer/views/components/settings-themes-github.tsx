export const Component = () => {
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
    themes = ipcRenderer.sendSync("get-themes");
    getRepos();
    getInstalledThemes();
  }
  function openThemesFolder() {
    ipcRenderer.invoke("open-path", "themes");
  }
  function getInstalledThemes() {
    const themes = ipcRenderer.sendSync("get-themes");
    // for each theme, get the github_repo property and push it to the themesInstalled array, if not blank
    themes.forEach((theme) => {
      if (theme.github_repo !== "" && typeof theme.commit != "") {
        themesInstalled.push(theme.github_repo.toLowerCase());
      }
    });
  }
  function showRepo(repo) {
    const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/README.md`;
    var requestOptions = {
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
        openRepo.readme = `This repository doesn't have a README.md file.`;
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
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    app
      ._fetch("https://api.github.com/search/repositories?q=topic:cidermusictheme fork:true&per_page=100", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        let items = JSON.parse(result).items;
        repos = items;
      })
      .catch((error) => console.log("error", error));
  }

  return (
    <div id="themes-github">
      <div className="github-themes-page">
        <div className="gh-header">
          <div className="row">
            <div className="col nopadding">
              <h1 className="header-text">{$root.getLz("settings.header.visual.theme.github.page")}</h1>
            </div>
            <div className="col-auto nopadding cider-flex-center">
              <button
                className="md-btn md-btn-small md-btn-block"
                click="$root.openSettingsPage('styles')">
                {$root.getLz("settings.option.visual.theme.manageStyles")}
              </button>
            </div>
            <div className="col-auto cider-flex-center">
              <button
                className="md-btn md-btn-small md-btn-block"
                click="$root.checkForThemeUpdates()">
                {$root.getLz("settings.option.visual.theme.checkForUpdates")}
              </button>
            </div>
            <div className="col-auto nopadding cider-flex-center">
              <button
                className="md-btn md-btn-small md-btn-block"
                click="installThemeURL()">
                {$root.getLz("settings.option.visual.theme.github.download")}
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
                style={{ background: repo.id == openRepo.id ? "var(--keyColor)" : "" }}
                v-for="repo in repos">
                <div className="row">
                  <div className="col cider-flex-center">
                    <div>
                      <h4 className="repo-name">{repo.description != null ? repo.description : repo.full_name}</h4>
                      <div>⭐ {repo.stargazers_count}</div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <span
                      v-if="themesInstalled.includes(repo.full_name.toLowerCase())"
                      className="codicon codicon-cloud-download"></span>
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
                        style={{ "--url": "url('./assets/github.svg')" }}></div>
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
                    <span v-if="!themesInstalled.includes(openRepo.full_name.toLowerCase())">{$root.getLz("action.install")}</span>
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
