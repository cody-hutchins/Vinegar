import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";

const ThemesGithub = () => {
  const repos = [];
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
    full_name: "",
  };

  const themesInstalled = [];
  let themes = [];
  useEffect(() => {
    themes = window.electronAPI.sendSync("get-themes");
    getRepos();
    getInstalledThemes();
  }, []);
  function openThemesFolder() {
    window.electronAPI.invoke("open-path", "themes");
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
    const msg = app.stringTemplateParser(app.getLz("settings.option.visual.theme.github.install.confirm"), {
      repo: repo.full_name,
    });
    app.confirm(msg, (res) => {
      if (res) {
        window.electronAPI.once("theme-installed", (event, arg) => {
          if (arg.success) {
            themes = window.electronAPI.sendSync("get-themes");
            getInstalledThemes();
            notyf.success(app.getLz("settings.notyf.visual.theme.install.success"));
          } else {
            notyf.error(app.getLz("settings.notyf.visual.theme.install.error"));
          }
        });
        window.electronAPI.invoke("get-github-theme", repo.html_url);
      }
    });
  }
  function installThemeURL() {
    app.prompt(app.getLz("settings.prompt.visual.theme.github.URL"), (result) => {
      if (result) {
        window.electronAPI.once("theme-installed", (event, arg) => {
          if (arg.success) {
            themes = window.electronAPI.sendSync("get-themes");
            notyf.success(app.getLz("settings.notyf.visual.theme.install.success"));
          } else {
            notyf.error(app.getLz("settings.notyf.visual.theme.install.error"));
          }
        });
        window.electronAPI.invoke("get-github-theme", result);
      }
    });
  }
  function getRepos() {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    app
      ._fetch("https://api.github.com/search/repositories?q=topic:cidermusictheme fork:true&per_page=100", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const items = JSON.parse(result).items;
        repos = items;
      })
      .catch((error) => console.log("error", error));
  }

  //Not used for Now
  return (
    <div id={"themes-github"}>
      <div className={"github-themes-page"}>
        <div className={"gh-header"}>
          <Row>
            <Col className={"nopadding"}>
              <h1 className={"header-text"}>{$root.getLz("settings.header.visual.theme.github.page")}</h1>
            </Col>
            <Col
              auto
              className={" nopadding flex-center"}>
              <button
                className={"md-btn md-btn-small md-btn-block"}
                onClick={() => $root.appRoute("installed-themes")}>
                {$root.getLz("settings.option.visual.theme.manageStyles")}
              </button>
            </Col>
            <Col
              auto
              className={"flex-center"}>
              <button
                className={"md-btn md-btn-small md-btn-block"}
                onClick={() => $root.checkForThemeUpdates()}>
                {$root.getLz("settings.option.visual.theme.checkForUpdates")}
              </button>
            </Col>
            <Col
              auto
              className={"nopadding flex-center"}>
              <button
                className={"md-btn md-btn-small md-btn-block"}
                onClick={() => installThemeURL()}>
                {$root.getLz("settings.option.visual.theme.github.download")}
              </button>
            </Col>
          </Row>
        </div>
        <div className={"gh-content"}>
          <div className={"repos-list"}>
            <ul className={"list-group list-group-flush"}>
              {repos.map((repo) => (
                <li
                  key={repo.id}
                  onClick={() => showRepo(repo)}
                  className={"list-group-item list-group-item-dark"}
                  style={{ background: repo.id === openRepo.id ? "var(--keyColor)" : "" }}>
                  <Row className={"row"}>
                    <Col className={"flex-center"}>
                      <div>
                        <h4 className={"repo-name"}>{repo.description !== null ? repo.description : repo.full_name}</h4>
                        <div>⭐ {repo.stargazers_count}</div>
                      </div>
                    </Col>
                    <Col auto>{themesInstalled.includes(repo.full_name.toLowerCase()) && <span className={"codicon codicon-cloud-download"} />}</Col>
                  </Row>
                </li>
              ))}
            </ul>
          </div>
          {openRepo.full_name ? (
            <div className={"github-preview"}>
              <div className={"gh-preview-header"}>
                <Row className={"row nopadding"}>
                  <Col className={"nopadding flex-center"}>
                    <div>
                      <h3 className={"repo-preview-name"}>{openRepo.description}</h3>
                      <div>
                        <div
                          className={"svg-icon inline"}
                          style={{ "--url": "url('./assets/github.svg')" }}
                        />
                        <a
                          className={"repo-url"}
                          target={"_blank"}
                          href={openRepo.html_url}
                          rel={"noreferrer"}>
                          {openRepo.full_name}
                        </a>
                      </div>
                      <div>⭐ {openRepo.stargazers_count}</div>
                    </div>
                  </Col>
                  <Col
                    auto
                    className={"nopadding flex-center"}>
                    <button
                      className={"md-btn md-btn-primary"}
                      onClick={() => installThemeRepo(openRepo)}>
                      {!themesInstalled.includes(openRepo.full_name.toLowerCase()) ? <span>{$root.getLz("action.install")}</span> : <span>{$root.getLz("action.update")}</span>}
                    </button>
                  </Col>
                </Row>
              </div>
              <hr />
              <div
                dangerouslySetInnerHTML={{ __html: openRepo.readme }}
                className={"github-content"}
              />
            </div>
          ) : (
            <div className={"github-preview"} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemesGithub;
