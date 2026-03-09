import ListitemHorizontal from "../components/listitem-horizontal.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import MediaitemScrollerHorizontal from "../components/mediaitem-scroller-horizontal.jsx";
import MediaitemSmarthints from "../components/mediaitem-smarthints.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";

const Component = ({ search }: { search: object }) => {
  const app = this.$root;
  let recentlyPlayed = [];
  let categoriesView = [];
  let categoriesReady = false;
  let searchType = "catalog";

  function getTopResult() {
    try {
      return search.results[search.results.meta.results.order[0]]["data"][0];
    } catch (error) {
      return false;
    }
  }

  async function seeAllHistory() {
    let hist = await app.mk.api.v3.music(`/v1/me/recent/played/tracks`, {
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
      let response = await app.mk.api.v3.music(`/v1/recommendations/${app.mk.storefrontId}?timezone=${encodeURIComponent(app.formatTimezoneOffset())}&name=search-landing&platform=web&extend=editorialArtwork&art%5Burl%5D=f%2Cc&types=editorial-items%2Capple-curators%2Cactivities&l=${this.$root.mklang}`);
      categoriesView = response.data.data;
      console.log(categoriesView);
      categoriesReady = true;
      return await true;
    }
  }

  function getFlattenedCategories() {
    let flattened = [];
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
    <div id="cider-search">
      <div className="content-inner search-page">
        {$root.appMode === "fullscreen" ? (
          <div className="search-input-container fs-search">
            <div className="search-input--icon"></div>
            <input
              type="search"
              spellCheck="false"
              onFocus={() => {
                $root.search.showHints = true;
              }}
              onBlur={() =>
                $root.setTimeout(() => {
                  if ($root.hintscontext !== true) {
                    $root.search.showHints = false;
                  }
                }, 300)
              }
              v-on:keyupenter={() => {
                $root.searchQuery($root.search.hints[$root.search.cursor]?.content ?? $root.search.hints[$root.search.cursor]?.searchTerm ?? $root.search.term);
                $root.search.showHints = false;
                $root.search.showSearchView = true;
              }}
              onInput={() => $root.getSearchHints()}
              placeholder={$root.getLz("term.search") + "..."}
              v-model={$root.search.term}
              className="search-input"></input>
            {$root.search.showHints && $root.search.hints.length !== 0 && (
              <div className="search-hints-container">
                <div className="search-hints">
                  {$root.search.hints
                    .filter((a) => a.content === null)
                    .map((hint, index) => (
                      <button
                        className="search-hint text-overflow-elipsis"
                        className="{active: ($root.search.cursor === index)}"
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
                      <template>
                        <MediaitemSmarthints
                          item={item.content}
                          position={position}>
                          {" "}
                        </MediaitemSmarthints>
                      </template>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
        <div className="btn-group searchToggle">
          <button
            onClick={() => {
              searchType = "catalog";
            }}
            className="md-btn md-btn-small"
            className="{'md-btn-primary': searchType === 'catalog'}">
            {$root.getLz("term.appleMusic")}
          </button>
          <button
            onClick={() => {
              searchType = "library";
            }}
            className="md-btn md-btn-small"
            className="{'md-btn-primary': searchType === 'library'}">
            {$root.getLz("term.library")}
          </button>
        </div>
        {search !== null && search !== [] && search.term !== "" && $root.search.showSearchView ? (
          <div>
            {searchType === "catalog" ? (
              <template>
                <h3>{app.getLz("term.topResult")}</h3>
                <MediaitemScrollerHorizontal items="search?.results[search?.results?.meta?.results?.order[0]]?.data"></MediaitemScrollerHorizontal>
                <div className="row">
                  {search.results.song ? (
                    <div className="col">
                      <div className="row">
                        <div className="col">
                          <h3>{app.getLz("term.songs")}</h3>
                        </div>
                      </div>
                      <div className="mediaitem-list-item__grid">
                        <ListitemHorizontal items={search.results.song.data.limit(12)}></ListitemHorizontal>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <h3>{app.getLz("error.noResults")}</h3>
                      <p>{app.getLz("error.noResults.description")}</p>
                    </div>
                  )}
                </div>
                {search.results["meta"] !== null && (
                  <template>
                    {search.results.meta.results.order.map(
                      (section) =>
                        section !== "song" &&
                        section !== "top" && (
                          <template>
                            <div className="row">
                              <div className="col">
                                <h3>{app.friendlyTypes(section)}</h3>
                              </div>
                            </div>
                            {!app.friendlyTypes(section).includes("Video") ? (
                              <template>
                                <MediaItemScrollerHorizontalLarge items={search.results[section].data.limit(10)}></MediaItemScrollerHorizontalLarge>
                              </template>
                            ) : (
                              <template>
                                <MediaItemScrollerHorizontalMVView items={search.results[section].data.limit(10)}></MediaItemScrollerHorizontalMVView>
                              </template>
                            )}
                          </template>
                        ),
                    )}
                  </template>
                )}
                {search.resultsSocial.playlist && (
                  <template>
                    <div className="row">
                      <div className="col">
                        <h3>{app.getLz("term.sharedPlaylists")}</h3>
                      </div>
                    </div>
                    <MediaItemScrollerHorizontalLarge items={search.resultsSocial.playlist.data.limit(10)}></MediaItemScrollerHorizontalLarge>
                  </template>
                )}
                {search.resultsSocial.profile && (
                  <template>
                    <div className="row">
                      <div className="col">
                        <h3>{app.getLz("term.people")}</h3>
                      </div>
                    </div>
                    <MediaItemScrollerHorizontalLarge items={search.resultsSocial.profile.data.limit(10)}></MediaItemScrollerHorizontalLarge>
                  </template>
                )}
              </template>
            ) : (
              <template>
                <h1>{$root.getLz("term.library")}</h1>
                {$root.search.resultsLibrary.map((section, key) => (
                  <div>
                    <h3>{app.friendlyTypes(key)}</h3>
                    {key.includes("songs") ? (
                      <div className="mediaitem-list-item__grid">
                        <ListitemHorizontal items={section.data}></ListitemHorizontal>
                      </div>
                    ) : (
                      <div className="well">
                        <MediaItemScrollerHorizontalLarge items={section.data}></MediaItemScrollerHorizontalLarge>
                      </div>
                    )}
                  </div>
                ))}
              </template>
            )}
          </div>
        ) : (
          <div>
            {(categoriesReady || getCategories()) && (
              <div>
                <div>
                  {categoriesView !== null && categoriesView !== [] && categoriesView[0]?.attributes !== null && categoriesView[0]?.attributes.title !== null && (
                    <div className="col">
                      <h3>{$root.getLz("home.recentlyPlayed")}</h3>
                      <div className="mediaitem-list-item__grid">
                        <ListitemHorizontal items={recentlyPlayed.limit(10)}></ListitemHorizontal>
                      </div>
                      {/* {recentlyPlayed.limit(10).map((item) => <MediaItemSquare kind="'385'" size="600" item="item" imagesize"800" ></MediaItemSquare>)} */}
                      <h3>{categoriesView[0]?.attributes?.title?.stringForDisplay ?? ""}</h3>
                    </div>
                  )}
                </div>
                <div className="categories">
                  {getFlattenedCategories().map((item) => (
                    <MediaItemSquare
                      kind="'385'"
                      imageformat="'bb'"
                      size="600"
                      removeamtext="true"
                      item={item ? (item.attributes.kind ? item : item.relationships && item.relationships.contents ? item.relationships.contents.data[0] : item) : []}
                      imagesize="800"></MediaItemSquare>
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
