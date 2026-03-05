import { useEffect, useMemo } from "react";
const Pagination = ({ length, pageSize, scroll, scrollSelector }: { length: number; pageSize: number; scroll: string; scrollSelector: string }) => {
  let currentPage = 1;
  function mounted() {
    document.querySelector(scrollSelector).addEventListener("scroll", handleScroll);
  }
  function destroyed() {
    document.querySelector(scrollSelector).removeEventListener("scroll", handleScroll);
  }
  useEffect(() => {
    mounted();
    return destroyed;
  });
  const watch = {
    length: function () {
      if (isInfinite) {
        // If a search reduces the number of things to show, we want to limit
        // the number of songs shown as well. is to prevent you scrolling
        // to load your entire library, searching for one song, and then having
        // th re-render the entire library
        if (currentPage > numPages) {
          currentPage = numPages;
          this.$emit("onRangeChange", currentRange);
        }
      } else {
        this.$emit("onRangeChange", currentRange);
      }
    },
    scroll: function () {
      // When changing modes, set the page to 1. is primarily to
      // prevent going to a high page (e.g., 50) and then switching to infinite
      // and showing 12.5k songs
      currentPage = 1;
      this.$emit("onRangeChange", currentRange);
    },
  };

  const isInfinite = useMemo(() => {
    return scroll === "infinite";
  }, [scroll]);

  const numPages = useMemo(() => {
    return Math.ceil(length / pageSize) || 1;
  }, [length, pageSize]);

  const currentRange = useMemo(() => {
    if (isInfinite) {
      return [0, currentPage * pageSize];
    } else {
      const startingPage = Math.min(numPages, currentPage);

      return [(startingPage - 1) * pageSize, startingPage * pageSize];
    }
  }, [isInfinite, currentPage, pageSize]);

  const effectivePage = useMemo(() => {
    return Math.min(currentPage, numPages);
  }, [currentPage, numPages]);


  const pagesToShow = useMemo(() => {
    let start = currentPage - 2;
    let end = currentPage + 2;

    if (start < 1) {
      end += 1 - start;
      start = 1;
    }

    const endDifference = end - numPages;
    if (endDifference > 0) {
      end = numPages;
      start = Math.max(1, start - endDifference);
    }

    const array = [];
    for (let idx = start; idx <= end; idx++) {
      array.push(idx);
    }
    return array;
  }, [currentPage, numPages]);

  // Infinite Scrolling
  const handleScroll = (event) => {
    if (isInfinite && currentPage < numPages && event.target.scrollTop >= event.target.scrollHeight - event.target.clientHeight) {
      currentPage += 1;
      this.$emit("onRangeChange", currentRange);
    }
  };
  // Pagination
  const isCurrentPage = (idx) => {
    return idx === currentPage || (idx === numPages && currentPage > numPages);
  };
  const changePage = (event) => {
    const value = event.target.valueAsNumber;

    if (!isNaN(value) && value >= 1 && value <= numPages) {
      currentPage = value;
      this.$emit("onRangeChange", currentRange);
    }
  };
  const goToPage = (page) => {
    currentPage = page;
    this.$emit("onRangeChange", currentRange);
  };
  const goToPrevious = () => {
    if (currentPage > 1) {
      currentPage -= 1;
      this.$emit("onRangeChange", currentRange);
    }
  };
  const goToNext = () => {
    if (currentPage < numPages) {
      currentPage += 1;
      this.$emit("onRangeChange", currentRange);
    }
  };
  const goToEnd = () => {
    currentPage = numPages;
    this.$emit("onRangeChange", currentRange);
  };

  return (
    <div id="pagination">
      <div
        className="pagination-container"
        v-if={!isInfinite}>
        <button
          className="md-btn page-btn"
          disabled={effectivePage === 1}
          onClick={() => goToPage(1)}>
          <img className="md-ico-first" />
        </button>
        <button
          className="md-btn page-btn prev"
          disabled={effectivePage === 1}
          onClick={() => goToPrevious()}>
          <img className="md-ico-prev" />
        </button>
        {pagesToShow.map((page) => <button
          className={`md-btn page-btn ${isCurrentPage(page) ? ' md-btn-primary': ''}`}
          onClick={() => goToPage(page)}>
          {page}
        </button>)}
        <button
          className="md-btn page-btn next"
          disabled={effectivePage === numPages}
          onClick={() => goToNext()}>
          <img className="md-ico-next" />
        </button>
        <button
          className="md-btn page-btn last"
          disabled={effectivePage === numPages}
          onClick={() => goToEnd()}>
          <img className="md-ico-last" />
        </button>
        <div className="page-btn md-input-number">
          <input
            type="number"
            min={1}
            max={numPages}
            value={effectivePage}
            onChange={changePage}
          />
          <span>/ {numPages}</span>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
