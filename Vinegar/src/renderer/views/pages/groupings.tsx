import { useEffect } from "react";
import ListItemHorizontal from "../components/listitem-horizontal.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";

const Component = () => {
  const app = this.$root;
  let data = null;
  let query = "";

  async function mounted() {
    const queryDefaults = {
      platform: "web",
      l: this.$root.mklang,
      extend: "editorialArtwork,artistUrl",
      "omit[resource:artists]": "relationships",
      "include[groupings]": "curator",
      "include[albums]": "artists",
      "include[songs]": "artists",
      "include[music-videos]": "artists",
      "fields[artists]": "name,url,artwork,editorialArtwork,genreNames,editorialNotes",
    };
    const hash = window.location.hash;
    // get everything after the first / character but keep everything afterwards
    const query = hash.substring(hash.indexOf("/") + 1, hash.indexOf("&") > 0 ? hash.indexOf("&") : hash.length);
    query = query;
    // if(!query.includes("?")) {
    //   query += queryDefaults;
    // }
    console.debug(query);
    const result = await this.$root.mk.api.v3.music(`/v1/editorial/${this.$root.mk.storefrontId}/groupings/${query}`, !query.includes("&") ? queryDefaults : { platform: "web" });
    data = result.data.data[0];

    console.log(data);

    //this.$root.getBrowsePage();
  }
  useEffect(() => {
    mounted().then();
  }, []);
  return (
    <div id="cider-groupings">
      <div className="content-inner">
        <template v-if={data !== null}>
          <h1 className="header-text">{data.attributes?.name}</h1>

          <template v-if={data.relationships && data.relationships.tabs}>
            {data.relationships.tabs.data[0].relationships.children.data.map((recom, index) => (
              <template>
                <div className="row">
                  <div
                    className="col"
                    v-if={recom.attributes.name !== "Chart Set"}>
                    <h3>{recom.attributes.name ?? ""}</h3>
                  </div>
                  <div
                    className="col-auto cider-flex-center"
                    v-if={index !== 0 && recom.relationships && ((recom.relationships.children && recom.relationships.children.data.length > 10) || (recom.relationships.contents && recom.relationships.contents.data.length > 10))}>
                    <button
                      className="cd-btn-seeall"
                      v-if={recom.relationships.room}
                      onClick={() => app.showRoom(recom.relationships.room?.data[0].href)}>
                      {app.getLz("term.seeAll")}
                    </button>
                    <button
                      className="cd-btn-seeall"
                      v-else
                      onClick={() => app.showCollection(recom.relationships.children ? recom.relationships.children : recom.relationships.contents, recom.attributes.name ?? "", "listen_now")}>
                      {app.getLz("term.seeAll")}
                    </button>
                  </div>
                </div>
                <template v-if={recom.relationships !== null && ((recom.relationships.children && recom.relationships.children.data) || (recom.relationships.contents && recom.relationships.contents.data))}>
                  <template v-if={index === 0 || (data.relationships.tabs.data[0].relationships.children.data[0].relationships === null && index === 1)}>
                    <MediaItemScrollerHorizontalMVView
                      imagesize={800}
                      browsesp={index === 0 || (data.relationships.tabs.data[0].relationships.children.data[0].relationships === null && index === 1)}
                      kind={recom.attributes.editorialElementKind}
                      items={recom.relationships.children ? recom.relationships.children.data : recom.relationships.contents.data}
                    />
                  </template>
                  <template v-else-if={["327"].includes(recom.attributes.editorialElementKind)}>
                    <div className="mediaitem-list-item__grid">
                      <ListItemHorizontal items={recom.relationships.contents.data.limit(20)} />
                    </div>
                  </template>
                  <template v-else-if={["385"].includes(recom.attributes.editorialElementKind)}>
                    <MediaItemScrollerHorizontalMVView
                      imagesize={800}
                      kind={recom.attributes.editorialElementKind}
                      items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)}
                    />
                  </template>
                  <template v-else-if={recom.attributes.name === "Chart Set"}>{/* ignored  */}</template>
                  <template v-else>
                    <MediaItemScrollerHorizontalLarge items={recom.relationships.children ? recom.relationships.children.data.limit(10) : recom.relationships.contents.data.limit(10)} />
                  </template>
                </template>
                <template v-else>
                  <template v-if={recom.attributes.links && recom.attributes.editorialElementKind.includes("391")}>
                    <div className="grouping-container">
                      {recom.attributes.links.map((link) => (
                        <button
                          className="grouping-btn"
                          onClick={() => $root.goToGrouping(link.url)}>
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </template>
                </template>
              </template>
            ))}
          </template>
        </template>
      </div>
    </div>
  );
};
