import { useEffect, useMemo } from "react";
import Pagination from "../components/pagination.jsx";
import MediaItemListItem from "../components/mediaitem-list-item.jsx";

const Component = () => {
  const app = this.$root;
  let library = this.$root.library;
  let mediaItemSize = "compact";
  let prefs = this.$root.cfg.libraryPrefs.songs;
  let start = 0;
  const pageSize = this.$root.cfg.libraryPrefs.pageSize;
  let end = pageSize;

  useEffect(() => {
    this.$root.getLibrarySongsFull();
  }, []);

  const currentSlice = useMemo(() => {
    return library.songs.displayListing.slice(start, end);
  }, [start, end]);

  function onRangeChange(newRange) {
    start = newRange[0];
    end = newRange[1];
  }
  function play() {
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }

    let query = app.library.songs.displayListing.map((item) => new MusicKit.MediaItem(item));
    if (!app.mk.queue.isEmpty) app.mk.queue.splice(0, app.mk.queue._itemIDs.length);
    app.mk.stop().then(() => {
      if (app.mk.shuffleMode === 1) {
        shuffleArray(query);
      }
      app.mk.queue.append(query);
      app.mk.changeToMediaAtIndex(0);
    });
  }

  return (
    <div id="cider-library-songs">
      <div className="content-inner library-page">
        <div className="library-header">
          <div className="row">
            <div
              className="col"
              style={{ padding: 0 }}>
              <div
                className="search-input-container"
                style={{ width: "100%", margin: "16px 0" }}>
                <div className="search-input--icon" />
                <input
                  type="search"
                  style={{ width: "100%" }}
                  spellCheck="false"
                  placeholder={app.getLz("term.search") + "..."}
                  input={$root.searchLibrarySongs}
                  v-model={library.songs.search}
                  className="search-input"
                />
              </div>
            </div>
            <div className="col-auto cider-flex-center">
              <div className="row">
                <button
                  className="col md-btn md-btn-primary  md-btn-icon"
                  style={{ minWidth: "100px", marginRight: "3px" }}
                  onClick={() => {
                    app.mk.shuffleMode = 0;
                    play();
                  }}>
                  <img className="md-ico-play" />
                  {app.getLz("term.play")}
                </button>
                <button
                  className="col md-btn md-btn-primary  md-btn-icon"
                  style={{ minWidth: "100px", marginRight: "3px" }}
                  onClick={() => {
                    app.mk.shuffleMode = 1;
                    play();
                  }}>
                  <img className="md-ico-shuffle" />
                  {app.getLz("term.shuffle")}
                </button>
                <div className="col">
                  <select
                    className="md-select"
                    v-model={prefs.sort}
                    onChange={() => $root.searchLibrarySongs()}>
                    <optgroup label={app.getLz("term.sortBy")}>
                      {library.songs.sortingOptions.map((sort, index) => (
                        <option value="index">{sort}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="col">
                  <select
                    className="md-select"
                    v-model={prefs.sortOrder}
                    onChange={() => $root.searchLibrarySongs()}>
                    <optgroup label={app.getLz("term.sortOrder")}>
                      <option value="asc">{app.getLz("term.sortOrder.ascending")}</option>
                      <option value="desc">{app.getLz("term.sortOrder.descending")}</option>
                    </optgroup>
                  </select>
                </div>
                <div className="col">
                  <select
                    className="md-select"
                    v-model={prefs.size}
                    onChange={() => $root.searchLibrarySongs()}>
                    <optgroup label={app.getLz("term.size")}>
                      <option value="normal">{app.getLz("term.size.normal")}</option>
                      <option value="compact">{app.getLz("term.size.compact")}</option>
                    </optgroup>
                  </select>
                </div>
                <div className="col">
                  <select
                    className="md-select"
                    v-model={prefs.scroll}>
                    <optgroup label={app.getLz("term.scroll")}>
                      <option value="infinite">{app.getLz("term.scroll.infinite")}</option>
                      <option value="paged">{app.getLz("term.scroll.paged").replace("${songsPerPage}", pageSize)}</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-auto cider-flex-center">
              <button
                v-if={library.songs.downloadState === 2}
                onClick={() => $root.getLibrarySongsFull(true)}
                className="reload-btn"
                aria-label={app.getLz("menubar.options.reload")}>
                {import("../svg/redo.svg")}
              </button>
              <button
                v-else
                className="reload-btn"
                style={{ opacity: 0.8, pointerEvents: "none" }}
                aria-label={app.getLz("menubar.options.reload")}>
                <div className="spinner" />
              </button>
            </div>
          </div>
          <Pagination
            length={library.songs.displayListing.length}
            pageSize={pageSize}
            scroll={prefs.scroll}
            scrollSelector="#app-content"
            onRangeChange={onRangeChange}
          />
        </div>

        <div v-if={library.songs.downloadState === 3}>Library contains no songs.</div>
        <div
          className="well"
          key="1"
          v-if={prefs.size === "compact"}>
          {currentSlice.map((item, index) => (
            <MediaItemListItem
              class-list="compact"
              item={item}
              parent="'librarysongs'"
              index={index}
              show-meta-data="true"
              show-library-status="false"
              v-bind:key={item.id}
            />
          ))}
        </div>
        <div
          className="well"
          key="2"
          v-else>
          {currentSlice.map((item, index) => (
            <MediaItemListItem
              item={item}
              parent="'librarysongs'"
              index={index}
              show-meta-data="true"
              show-library-status="false"
              v-bind:key={item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
