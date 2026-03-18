import { useEffect, useMemo } from "react";
import Pagination from "../components/pagination";
import MediaItemSquare from "../components/mediaitem-square";
import MediaItemListItem from "../components/mediaitem-list-item";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const LibraryAlbums = () => {
  const { t } = useTranslation();
  const pageSize = this.$root.cfg.libraryPrefs.pageSize;
  const library = this.$root.library;
  const mediaItemSize = "compact";
  const prefs = this.$root.cfg.libraryPrefs.albums;
  const app = this.$root;
  let start = 0;
  let end = pageSize;

  function mounted() {
    this.$root.getLibraryAlbumsFull(null, 1);
    this.$root.getAlbumSort();
    this.$root.searchLibraryAlbums(1);
    this.$root.getLibrarySongsFull();
    this.$root.searchLibraryAlbums(1);
  }

  const currentSlice = useMemo(() => {
    return library.albums.displayListing.slice(start, end);
  }, [start, end]);

  const onRangeChange = (newRange: [number, number]) => {
    start = newRange[0];
    end = newRange[1];
  };
  useEffect(() => {
    mounted();
  }, []);

  return (
    <div id={"cider-library-albums"}>
      <div className={"content-inner"}>
        <Row className={"row"}>
          <Col style={{ padding: 0 }}>
            <h1 className={"header-text"}>{t("term.albums")}</h1>
          </Col>
          <Col auto>
            {library.albums.downloadState === 2 && (
              <button
                onClick={() => $root.getLibraryAlbumsFull(true, 1)}
                className={"reload-btn"}
                aria-label={t("menubar.options.reload")}>
                {import("../svg/redo.svg")}
              </button>
            )}
          </Col>
        </Row>
        <div className={"album-header"}>
          <Col style={{ padding: 0 }}>
            <div
              className={"search-input-container"}
              style={{ width: "100%", margin: "16px 0" }}>
              <div className={"search-input--icon"} />
              <input
                type={"search"}
                style={{ width: "100%" }}
                spellCheck={false}
                placeholder={t("term.search") + "..."}
                input={$root.searchLibraryAlbums}
                v-model={library.albums.search}
                className={"search-input"}
              />
            </div>
          </Col>
          <Col
            auto
            className={"cider-flex-center"}>
            <Row>
              <Col>
                <select
                  className={"md-select"}
                  v-model={prefs.sort}
                  onChange={() => {
                    library.albums.sorting[1] = prefs.sort;
                    $root.searchLibraryAlbums(1);
                  }}>
                  <optgroup label={t("term.sortBy")}>
                    {library.albums.sortingOptions.map((sort, index) => (
                      <option
                        key={index}
                        value={index}>
                        {sort}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </Col>
              <Col>
                <select
                  className={"md-select"}
                  v-model={prefs.sortOrder}
                  onChange={() => {
                    library.albums.sortOrder[1] = prefs.sortOrder;
                    $root.searchLibraryAlbums(1);
                  }}>
                  <optgroup label={t("term.sortOrder")}>
                    <option value={"asc"}>{t("term.sortOrder.ascending")}</option>
                    <option value={"desc"}>{t("term.sortOrder.descending")}</option>
                  </optgroup>
                </select>
              </Col>
              <Col>
                <select
                  className={"md-select"}
                  v-model={prefs.viewAs}>
                  <optgroup label={t("term.viewAs")}>
                    <option value={"covers"}>{t("term.viewAs.coverArt")}</option>
                    <option value={"list"}>{t("term.viewAs.list")}</option>
                  </optgroup>
                </select>
              </Col>
              <Col>
                <select
                  className={"md-select"}
                  v-model={prefs.scroll}>
                  <optgroup label={t("term.scroll")}>
                    <option value={"infinite"}>{t("term.scroll.infinite")}</option>
                    <option value={"paged"}>{t("term.scroll.paged").replace("${songsPerPage}", pageSize)}</option>
                  </optgroup>
                </select>
              </Col>
            </Row>
          </Col>
          <Pagination
            length={app.library.albums.displayListing.length}
            pageSize={pageSize}
            scroll={prefs.scroll}
            scrollSelector={"#app-content"}
            onRangeChange={onRangeChange}
            style={{ marginBottom: 0 }}
          />
        </div>
        <div className={"well"}>
          <div className={"albums-square-container"}>
            <div>
              {currentSlice.map(
                (item) =>
                  prefs.viewAs === "covers" && (
                    <MediaItemSquare
                      key={item.id}
                      size={"300"}
                      item={item}
                    />
                  ),
              )}
            </div>
          </div>
          {currentSlice.map(
            (item) =>
              prefs.viewAs === "list" && (
                <MediaItemListItem
                  showDuration={false}
                  showMetadata={true}
                  showLibraryStatus={false}
                  key={item.id}
                  item={item}
                />
              ),
          )}
        </div>
      </div>
    </div>
  );
};
export default LibraryAlbums;
