import ListitemHorizontal from "../components/listitem-horizontal.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";
import MediaitemScrollerHorizontal from "../components/mediaitem-scroller-horizontal.jsx";
import MediaitemSmarthints from "../components/mediaitem-smarthints.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";

const Component = ({ search }: { search: object }) => {
  const app = this.$root;
  let recentlyPlayed = [];
  let goriesView = [];
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
    if (categoriesView != [] && categoriesView.length > 0) {
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
          if (categoriesView[i].relationships.contents.data[j].type != "editorial-items") flattened.push(categoriesView[i].relationships.contents.data[j]);
        }
      }
    }
    return flattened;
  }

  return (
    <div id="cider-search">
      <div className="content-inner search-page">
        <div
          className="search-input-container fs-search"
          v-if="$root.appMode == 'fullscreen'">
          <div className="search-input--icon" />
          <input
            type="search"
            spellcheck="false"
            focus="$root.search.showHints = true"
            blur="$root.setTimeout(()=>{if($root.hintscontext != true){$root.search.showHints = false} }, 300)"
            v-on:keyupenter="$root.searchQuery($root.search.hints[$root.search.cursor]?.content ?? $root.search.hints[$root.search.cursor]?.searchTerm ?? $root.search.term);$root.search.showHints = false; $root.search.showSearchView = true"
            input="$root.getSearchHints()"
            placeholder="$root.getLz('term.search') + '...'"
            v-model="$root.search.term"
            className="search-input"
          />

          <div
            className="search-hints-container"
            v-if="$root.search.showHints && $root.search.hints.length != 0">
            <div className="search-hints">
              <button
                className="search-hint text-overflow-elipsis"
                v-for="(hint, index) in $root.search.hints.filter((a) => {return a.content == null})"
                className="{active: ($root.search.cursor == index)}"
                onClick={() => {
                  $root.search.term = hint.searchTerm;
                  $root.search.showHints = false;
                  $root.searchQuery(hint.searchTerm);
                }}>
                {hint.displayTerm}
              </button>
              <template v-for="(item, position) in $root.search.hints.filter((a) => {return a.content != null})">
                <MediaitemSmarthints
                  item="item.content"
                  position="position">
                  {" "}
                </MediaitemSmarthints>
              </template>
            </div>
          </div>
        </div>
        <div className="btn-group searchToggle">
          <button
            onClick={() => {
              searchType = "catalog";
            }}
            className="md-btn md-btn-small"
            className="{'md-btn-primary': searchType == 'catalog'}">
            {$root.getLz("term.appleMusic")}
          </button>
          <button
            onClick={() => {
              searchType = "library";
            }}
            className="md-btn md-btn-small"
            className="{'md-btn-primary': searchType == 'library'}">
            {$root.getLz("term.library")}
          </button>
        </div>
        <div v-if="search != null && search != [] && search.term != '' && $root.search.showSearchView">
          <template v-if="searchType == 'catalog'">
            <h3>{app.getLz("term.topResult")}</h3>
            <MediaitemScrollerHorizontal items="search?.results[search?.results?.meta?.results?.order[0]]?.data" />
            <div className="row">
              <div
                className="col"
                v-if="search.results.song">
                <div className="row">
                  <div className="col">
                    <h3>{app.getLz("term.songs")}</h3>
                  </div>
                  <div
                    className="col-auto cider-flex-center"
                    onClick={() => app.showSearchView(app.search.term, "song", app.friendlyTypes("song"))}
                    v-if="search.results.song.data.length >= 12">
                    <button className="cd-btn-seeall">{app.getLz("term.seeAll")}</button>
                  </div>
                </div>
                <div className="mediaitem-list-item__grid">
                  <ListitemHorizontal items="search.results.song.data.limit(12)" />
                </div>
              </div>
              <div
                v-else
                style={{ textAlign: "center" }}>
                <h3>{app.getLz("error.noResults")}</h3>
                <p>{app.getLz("error.noResults.description")}</p>
              </div>
            </div>

            <template v-if="search.results['meta'] != null">
              <template
                v-for="section in search.results.meta.results.order"
                v-if="section != 'song' && section != 'top'">
                <div className="row">
                  <div className="col">
                    <h3>{app.friendlyTypes(section)}</h3>
                  </div>
                  <div
                    className="col-auto cider-flex-center"
                    v-if="search.results[section].data.length >= 10">
                    <button
                      className="cd-btn-seeall"
                      onClick={() => app.showSearchView(app.search.term, section, app.friendlyTypes(section))}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                </div>
                <template v-if="!app.friendlyTypes(section).includes('Video')">
                  <MediaItemScrollerHorizontalLarge items="search.results[section].data.limit(10)" />
                </template>
                <template v-else>
                  <MediaItemScrollerHorizontalMVView items="search.results[section].data.limit(10)" />
                </template>
              </template>
            </template>
            <template v-if="search.resultsSocial.playlist">
              <div className="row">
                <div className="col">
                  <h3>{app.getLz("term.sharedPlaylists")}</h3>
                </div>
                <div
                  className="col-auto cider-flex-center"
                  v-if="search.resultsSocial.playlist.data.length >= 10">
                  <button
                    className="cd-btn-seeall"
                    onClick={() => app.showCollection(search.resultsSocial.playlist, "Shared Playlists", "default")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </div>
              </div>
              <MediaItemScrollerHorizontalLarge items="search.resultsSocial.playlist.data.limit(10)" />
            </template>
            <template v-if="search.resultsSocial.profile">
              <div className="row">
                <div className="col">
                  <h3>{app.getLz("term.people")}</h3>
                </div>
                <div
                  className="col-auto cider-flex-center"
                  v-if="search.resultsSocial.profile.data.length >= 10">
                  <button
                    className="cd-btn-seeall"
                    onClick={() => app.showCollection(search.resultsSocial.profile, "People", "default")}>
                    {app.getLz("term.seeAll")}
                  </button>
                </div>
              </div>
              <MediaItemScrollerHorizontalLarge items="search.resultsSocial.profile.data.limit(10)" />
            </template>
          </template>
          <template v-else>
            <h1>{$root.getLz("term.library")}</h1>
            <div v-for="(section, key) in $root.search.resultsLibrary">
              <h3>{app.friendlyTypes(key)}</h3>
              <div
                className="mediaitem-list-item__grid"
                v-if="key.includes('songs')">
                <ListitemHorizontal items="section.data" />
              </div>
              <div
                className="well"
                v-else>
                <MediaItemScrollerHorizontalLarge items="section.data" />
              </div>
            </div>
          </template>
        </div>
        <div v-else>
          <div v-if="categoriesReady || getCategories()">
            <div>
              <div
                className="col"
                v-if="categoriesView != null && categoriesView != [] && categoriesView[0]?.attributes != null && categoriesView[0]?.attributes.title != null">
                <h3>{$root.getLz("home.recentlyPlayed")}</h3>
                <div className="mediaitem-list-item__grid">
                  <ListitemHorizontal items="recentlyPlayed.limit(10)" />
                </div>
                {/* <MediaItemSquare kind="'385'" size="600" v-for="item in recentlyPlayed.limit(10)" item="item" imagesize="800" /> */}
                <h3>{categoriesView[0]?.attributes?.title?.stringForDisplay ?? ""}</h3>
              </div>
            </div>
            <div className="categories">
              <MediaItemSquare
                kind="'385'"
                imageformat="'bb'"
                size="600"
                removeamtext="true"
                item="item ? (item.attributes.kind ? item : ((item.relationships && item.relationships.contents ) ? item.relationships.contents.data[0] : item)) : []"
                imagesize="800"
                v-for="item of getFlattenedCategories()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
