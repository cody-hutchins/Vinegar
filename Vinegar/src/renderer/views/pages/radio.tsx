import { useEffect } from "react";
import ListItemHorizontal from "../components/listitem-horizontal.jsx";
import MediaItemScrollerHorizontalMVView from "../components/mediaitem-scroller-horizontal-mvview.jsx";
import MediaItemScrollerHorizontalLarge from "../components/mediaitem-scroller-horizontal-large.jsx";

const Radio = ({ data }: { data: object }) => {
  const app = this.$root;
  const recent = [];
  useEffect(() => {
    this.$root.getRadioPage();
    //   debugger
    getRecentlyPlayed();
    //   debugger
  }, []);
  const getRecentlyPlayed = async (next = null) => {
    const recent = await app.mk.api.v3.music(`${next ?? "/v1/me/recent/radio-stations"}`, {
      platform: "web",
      "art[url]": "f",
      l: app.mklang,
    });

    console.debug(recent.data.data);
    recent = recent.concat(recent.data.data);

    if (recent.data.next) {
      getRecentlyPlayed(recent.data.next);
    }
  };
  return (
    <>
      <div id={"cider-radio"}>
        <div className={"content-inner"}>
          <h1 className={"header-text"}>{$root.getLz("term.radio")}</h1>
          {data.relationships && data.relationships.tabs && (
            <template>
              {data.relationships.tabs.data[0].relationships.children.data.map((recom, index) => (
                <template>
                  <div className={"row"}>
                    {recom.attributes.name !== "Chart Set" && (
                      <div className={"col"}>
                        <h3>{recom.attributes.name ?? ""}</h3>
                      </div>
                    )}
                    <div className={"col-auto cider-flex-center"}>
                      {recom.attributes.name === "Recently Played" && recent.length > 10 && (
                        <button
                          className={"cd-btn-seeall"}
                          onClick={() => app.showCollection({ data: recent }, recom.attributes.name ?? "", "listen_now")}>
                          {app.getLz("term.seeAll")}
                        </button>
                      )}
                      {index !== 0 && recom.relationships && ((recom.relationships.children && recom.relationships.children.data.length > 10) || (recom.relationships.contents && recom.relationships.contents.data.length > 10)) && (
                        <template>
                          {recom.relationships.room ? (
                            <button
                              className={"cd-btn-seeall"}
                              onClick={() => app.showRoom(recom.relationships.room?.data[0].href)}>
                              {app.getLz("term.seeAll")}
                            </button>
                          ) : (
                            <button
                              className={"cd-btn-seeall"}
                              onClick={() => app.showCollection(recom.relationships.children ? recom.relationships.children : recom.relationships.contents, recom.attributes.name ?? "", "listen_now")}>
                              {app.getLz("term.seeAll")}
                            </button>
                          )}
                        </template>
                      )}
                    </div>
                  </div>
                  {recom.attributes.name === "Recently Played" ? (
                    <div>
                      <MediaItemScrollerHorizontalMVView
                        imagesize={800}
                        browsesp={index === 0 || (data.relationships.tabs.data[0].relationships.children.data[0].relationships === null && index === 1)}
                        kind={recom.attributes.editorialElementKind}
                        items={recent.limit(10)}
                      />
                    </div>
                  ) : (
                    <template>
                      {recom.attributes.links && recom.attributes.editorialElementKind.includes("391") && (
                        <template>
                          <div className={"grouping-container"}>
                            {recom.attributes.links.map((link) => (
                              <button
                                className={"grouping-btn"}
                                onClick={() => $root.goToGrouping(link.url)}>
                                {link.label}
                              </button>
                            ))}
                          </div>
                        </template>
                      )}
                    </template>
                  )}
                </template>
              ))}
            </template>
          )}
        </div>
      </div>
    </>
  );
};

export default Radio;
