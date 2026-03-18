import { Col, Row } from "react-bootstrap";
import classNames from "classnames";
import ListitemHorizontal from "../components/listitem-horizontal.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import MediaitemScrollerHorizontal from "../components/mediaitem-scroller-horizontal.jsx";
import MediaitemSmarthints from "../components/mediaitem-smarthints.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import { useTranslation } from "react-i18next";

const Search = ({ search }: { search: object }) => {
  const { t } = useTranslation();

  const app = this.$root;
  let recentlyPlayed = [];
  let categoriesView = [];
  let categoriesReady = false;
  let searchType = "catalog";

  function getTopResult() {
    try {
      return search.results[search.results.meta.results.order[0]]["data"][0];
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function seeAllHistory() {
    const hist = await app.mk.api.v3.music(`/v1/me/recent/played/tracks`, {
      l: this.$root.mklang,
    });
    recentlyPlayed = hist.data.data;
  }

  async function getCategories() {
    if (categoriesView !== [] && categoriesView.length > 0) {
      categoriesReady = true;
      return await true;
    } else {
      await seeAllHistory();
      const response = await app.mk.api.v3.music(`/v1/recommendations/${app.mk.storefrontId}?timezone=${encodeURIComponent(app.formatTimezoneOffset())}&name=search-landing&platform=web&extend=editorialArtwork&art%5Burl%5D=f%2Cc&types=editorial-items%2Capple-curators%2Cactivities&l=${this.$root.mklang}`);
      categoriesView = response.data.data;
      console.log(categoriesView);
      categoriesReady = true;
      return await true;
    }
  }

  function getFlattenedCategories() {
    const flattened = [];
    for (let i = 0; i < categoriesView.length; i++) {
      if (categoriesView[i].relationships && categoriesView[i].relationships.contents && categoriesView[i].relationships.contents.data) {
        for (let j = 0; j < categoriesView[i].relationships.contents.data.length; j++) {
          if (categoriesView[i].relationships.contents.data[j].type !== "editorial-items") flattened.push(categoriesView[i].relationships.contents.data[j]);
        }
      }
    }
    return flattened;
  }

  return (
    <div id={"cider-search"}>
      <div className={"content-inner search-page"}>
        {$root.appMode === "fullscreen" ? (
          <div className={"search-input-container fs-search"}>
            <div className={"search-input--icon"} />
            <input
              type={"search"}
              spellCheck={false}
              onFocus={() => {
                $root.search.showHints = true;
              }}
              onBlur={() =>
                $root.setTimeout(() => {
                  if (!$root.hintscontext) {
                    $root.search.showHints = false;
                  }
                }, 300)
              }
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  $root.searchQuery($root.search.hints[$root.search.cursor]?.content ?? $root.search.hints[$root.search.cursor]?.searchTerm ?? $root.search.term);
                  $root.search.showHints = false;
                  $root.search.showSearchView = true;
                }
              }}
              onInput={() => $root.getSearchHints()}
              placeholder={t("term.search") + "..."}
              v-model={$root.search.term}
              className={"search-input"}
            />
            {$root.search.showHints && $root.search.hints.length !== 0 && (
              <div className={"search-hints-container"}>
                <div className={"search-hints"}>
                  {$root.search.hints
                    .filter((a) => a.content === null)
                    .map((hint, index) => (
                      <button
                        key={index}
                        className={classNames("search-hint text-overflow-elipsis", { active: $root.search.cursor === index })}
                        onClick={() => {
                          $root.search.term = hint.searchTerm;
                          $root.search.showHints = false;
                          $root.searchQuery(hint.searchTerm);
                        }}>
                        {hint.displayTerm}
                      </button>
                    ))}
                  {$root.search.hints
                    .filter((a) => a.content !== null)
                    .map((item, position) => (
                      <MediaitemSmarthints
                        key={position}
                        item={item.content}
                        position={position}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
        <div className={"btn-group searchToggle"}>
          <button
            onClick={() => {
              searchType = "catalog";
            }}
            className={classNames("md-btn", "md-btn-small", { "md-btn-primary": searchType === "catalog" })}>
            {t("term.appleMusic")}
          </button>
          <button
            onClick={() => {
              searchType = "library";
            }}
            className={classNames("md-btn", "md-btn-small", { "md-btn-primary": searchType === "library" })}>
            {t("term.library")}
          </button>
        </div>
        {search !== null && search !== [] && search.term !== "" && $root.search.showSearchView ? (
          <div>
            {searchType === "catalog" ? (
              <>
                <h3>{t("term.topResult")}</h3>
                <MediaitemScrollerHorizontal items={"search?.results[search?.results?.meta?.results?.order[0]]?.data"} />
                <Row>
                  {search.results.song ? (
                    <Col>
                      <Row>
                        <Col>
                          <h3>{t("term.songs")}</h3>
                        </Col>
                      </Row>
                      <div className={"mediaitem-list-item__grid"}>
                        <ListitemHorizontal items={search.results.song.data.limit(12)} />
                      </div>
                    </Col>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <h3>{t("error.noResults")}</h3>
                      <p>{t("error.noResults.description")}</p>
                    </div>
                  )}
                </Row>
                {search.results["meta"] !== null &&
                  search.results.meta.results.order.map(
                    (section) =>
                      section !== "song" &&
                      section !== "top" && (
                        <div key={section.id}>
                          <Row>
                            <Col>
                              <h3>{app.friendlyTypes(section)}</h3>
                            </Col>
                          </Row>
                          {!app.friendlyTypes(section).includes("Video") ? <MediaItemScrollerHorizontalLarge items={search.results[section].data.limit(10)} /> : <MediaItemScrollerHorizontalMVView items={search.results[section].data.limit(10)} />}
                        </div>
                      ),
                  )}
                {search.resultsSocial.playlist && (
                  <>
                    <Row>
                      <Col>
                        <h3>{t("term.sharedPlaylists")}</h3>
                      </Col>
                    </Row>
                    <MediaItemScrollerHorizontalLarge items={search.resultsSocial.playlist.data.limit(10)} />
                  </>
                )}
                {search.resultsSocial.profile && (
                  <>
                    <Row>
                      <Col>
                        <h3>{t("term.people")}</h3>
                      </Col>
                    </Row>
                    <MediaItemScrollerHorizontalLarge items={search.resultsSocial.profile.data.limit(10)} />
                  </>
                )}
              </>
            ) : (
              <>
                <h1>{t("term.library")}</h1>
                {$root.search.resultsLibrary.map((section, key) => (
                  <div key={key}>
                    <h3>{app.friendlyTypes(key)}</h3>
                    {key.includes("songs") ? (
                      <div className={"mediaitem-list-item__grid"}>
                        <ListitemHorizontal items={section.data} />
                      </div>
                    ) : (
                      <div className={"well"}>
                        <MediaItemScrollerHorizontalLarge items={section.data} />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <div>
            {(categoriesReady || getCategories()) && (
              <div>
                <div>
                  {categoriesView !== null && categoriesView !== [] && categoriesView[0]?.attributes !== null && categoriesView[0]?.attributes.title !== null && (
                    <Col>
                      <h3>{t("home.recentlyPlayed")}</h3>
                      <div className={"mediaitem-list-item__grid"}>
                        <ListitemHorizontal items={recentlyPlayed.limit(10)} />
                      </div>
                      {/* {recentlyPlayed.limit(10).map((item) => <MediaItemSquare kind="385" size="600" item="item" imagesize"800" />)} */}
                      <h3>{categoriesView[0]?.attributes?.title?.stringForDisplay ?? ""}</h3>
                    </Col>
                  )}
                </div>
                <div className={"categories"}>
                  {getFlattenedCategories().map((item) => (
                    <MediaItemSquare
                      key={item.id}
                      kind={"385"}
                      imageformat={"bb"}
                      removeamtext={true}
                      item={item ? (item.attributes.kind ? item : item.relationships && item.relationships.contents ? item.relationships.contents.data[0] : item) : []}
                      imagesize={800}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Search;
