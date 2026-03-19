import { useEffect } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const LyricsView = ({
  time,
  lyrics,
  richlyrics,
  translation,
  onindex,
  yoffset,
}: {
  time: number;
  lyrics: object[];
  richlyrics: object[];
  translation?: string;
  onindex?: () => void;
  yoffset?: number;
}) => {
  const { t } = useTranslation();
  const app = this.$root;
  useEffect(() => {
    if (((app.lyricon && app.drawer.open) || app.appMode === "fullscreen") && this.$refs.lyricsview) {
      const currentLine = this.$refs.lyricsview.querySelector(`.lyric-line.active`);
      if (currentLine && currentLine.getElementsByClassName("lyricWaiting").length > 0) {
        const duration = currentLine.getAttribute("end") - currentLine.getAttribute("start");
        const u = (time - currentLine.getAttribute("start")) / duration;
        if (u < 0.25 && !currentLine.classList.contains("mode1")) {
          try {
            currentLine.classList.add("mode1");
            currentLine.classList.remove("mode3");
            currentLine.classList.remove("mode2");
          } catch (e) {
            console.log(e);
          }
          currentLine.getElementsByClassName("WaitingDot1")[0].style.animation =
            `dotOpacity ${0.25 * duration}s cubic-bezier(0.42, 0, 0.58, 1) forwards`;
          currentLine.getElementsByClassName("WaitingDot2")[0].style.animation = ``;
          currentLine.getElementsByClassName("WaitingDot3")[0].style.animation = ``;
          currentLine.getElementsByClassName("WaitingDot2")[0].style.opacity = 0.25;
          currentLine.getElementsByClassName("WaitingDot3")[0].style.opacity = 0.25;
        } else if (u >= 0.25 && u < 0.5 && !currentLine.classList.contains("mode2")) {
          try {
            currentLine.classList.add("mode2");
            currentLine.classList.remove("mode1");
            currentLine.classList.remove("mode3");
          } catch (e) {
            console.log(e);
          }
          currentLine.getElementsByClassName("WaitingDot2")[0].style.animation =
            `dotOpacity ${0.25 * duration}s cubic-bezier(0.42, 0, 0.58, 1) forwards`;
          currentLine.getElementsByClassName("WaitingDot1")[0].style.animation = ``;
          currentLine.getElementsByClassName("WaitingDot3")[0].style.animation = ``;
          currentLine.getElementsByClassName("WaitingDot1")[0].style.opacity = 1;
          currentLine.getElementsByClassName("WaitingDot3")[0].style.opacity = 0.25;
        } else if (u >= 0.5 && u < 0.75 && !currentLine.classList.contains("mode3")) {
          try {
            currentLine.classList.add("mode3");
            currentLine.classList.remove("mode1");
            currentLine.classList.remove("mode2");
          } catch (e) {
            console.log(e);
          }
          currentLine.getElementsByClassName("WaitingDot3")[0].style.animation =
            `dotOpacity ${0.25 * duration}s cubic-bezier(0.42, 0, 0.58, 1) forwards`;
          currentLine.getElementsByClassName("WaitingDot1")[0].style.animation = ``;
          currentLine.getElementsByClassName("WaitingDot2")[0].style.animation = ``;
          currentLine.getElementsByClassName("WaitingDot1")[0].style.opacity = 1;
          currentLine.getElementsByClassName("WaitingDot2")[0].style.opacity = 1;
        } else if (u >= 0.75 && currentLine.classList.contains("mode3")) {
          try {
            currentLine.classList.remove("mode1");
            currentLine.classList.remove("mode2");
            currentLine.classList.remove("mode3");
          } catch (e) {
            console.log(e);
          }
          currentLine.getElementsByClassName("WaitingDot1")[0].style.animation = ``;
          currentLine.getElementsByClassName("WaitingDot2")[0].style.animation = ``;
          currentLine.getElementsByClassName("WaitingDot1")[0].style.opacity = 1;
          currentLine.getElementsByClassName("WaitingDot2")[0].style.opacity = 1;
        }
      }
    }
    getActiveLyric();
  }, [time]);
  const seekTo = (startTime) => {
    if (startTime !== 9999999) app.seekTo(startTime, false);
  };
  const getActiveLyric = () => {
    const delayfix = Object.hasOwn(app.activeCasts[0], "airplay2") ? -2.5 : 0.1;
    const prevLine = app.currentLyricsLine;
    for (let i = 0; i < lyrics.length; i++) {
      if (time + delayfix >= lyrics[i].startTime && time + delayfix <= app.lyrics[i].endTime) {
        if (app.currentLyricsLine !== i) {
          app.currentLyricsLine = i;
          if (
            ((app.lyricon && app.drawer.open) || app.appMode === "fullscreen") &&
            this.$refs.lyricsview.querySelector(`.lyric-line[line-index={${i}}]`)
          ) {
            if (this.$refs.lyricsview.querySelector(`.lyric-line[line-index={${prevLine}}]`)) {
              this.$refs.lyricsview.querySelector(`.lyric-line[line-index={${prevLine}}]`).classList.remove("active");
            }
            this.$refs.lyricsview.querySelector(`.lyric-line[line-index={${i}}]`).classList.add("active");
            if (checkIfScrollIsStatic) {
              const lyricElement = this.$refs.lyricsview.querySelector(`.lyric-line[line-index={${i}}]`);
              // this.$refs.lyricsview.querySelector(`.lyric-line[line-index={${i}}]`).scrollIntoView({
              //     behavior: "smooth",
              //     block: "nearest", inline: 'start'
              // })
              const parent = lyricElement.parentElement;
              const parentRect = parent.getBoundingClientRect();
              const lyricElementRect = lyricElement.getBoundingClientRect();
              const parentScrollTop = parent.scrollTop;
              const parentScrollLeft = parent.scrollLeft;
              const parentScrollTopDiff = parentScrollTop - parentRect.top;
              const parentScrollLeftDiff = parentScrollLeft - parentRect.left;
              const lyricElementScrollTop = lyricElementRect.top + parentScrollTopDiff;
              const lyricElementScrollLeft = lyricElementRect.left + parentScrollLeftDiff;
              const scrollTopDiff = lyricElementScrollTop - parentScrollTop;
              const scrollLeftDiff = lyricElementScrollLeft - parentScrollLeft;
              const scrollTop = parent.scrollTop + scrollTopDiff;
              const scrollLeft = parent.scrollLeft + scrollLeftDiff;
              parent.scrollTo({
                top: scrollTop - (yoffset ?? 128),
                left: scrollLeft,
                behavior: "smooth",
              });
            }
          }
        } else if (app.currentLyricsLine === 0 && app.drawer.open) {
          if (
            this.$refs.lyricsview.querySelector(`.lyric-line[line-index="0"]`) &&
            !this.$refs.lyricsview.querySelector(`.lyric-line[line-index="0"]`).classList.contains("active")
          )
            this.$refs.lyricsview.querySelector(`.lyric-line[line-index="0"]`).classList.add("active");
        }
        break;
      }
    }
    try {
      if (app.drawer.open || app.appMode === "fullscreen") {
        try {
          this.$refs.lyricsview.querySelector(`.lyric-line[line-index={${prevLine}}]`).childNodes.classList.remove("verse-active");
        } catch (e) {
          console.log(e);
        }
        for (child of this.$refs.lyricsview
          .querySelector(`.lyric-line[line-index={${app.currentLyricsLine}}]`)
          .querySelectorAll(".verse")) {
          if (time + delayfix >= child.getAttribute("lyricstart") * 1 + child.getAttribute("versestart") * 1) {
            child.classList.add("verse-active");
          } else {
            child.classList.remove("verse-active");
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const getActiveVerse = (timeStart, timeEnd, verseTime) => {
    const relativeTime = time - timeStart;
    console.log(time, timeEnd, timeStart, relativeTime >= verseTime && relativeTime <= timeEnd - timeStart);
    return relativeTime >= verseTime && relativeTime <= timeEnd - timeStart;
  };
  const getVerseLine = (index) => {
    if (richlyrics[index] !== null && richlyrics[index].l !== null) {
      return richlyrics[index].l;
    } else return [];
  };
  const qqInstrumental = (lyrics) => {
    for (lyric of lyrics) {
      if (lyric.line.includes("纯音乐") && lyric.line.includes("欣赏")) {
        return true;
      }
    }
    return false;
  };
  const checkIfScrollIsStatic = setInterval(() => {
    try {
      if (position === this.$refs.lyricsview.scrollTop) {
        clearInterval(checkIfScrollIsStatic);
        // do something
      }
      position = this.$refs.lyricsview.scrollTop;
    } catch (e) {
      console.log(e);
    }
  }, 50);
  return (
    <div id={"lyrics-view"}>
      <div
        ref={"lyricsview"}
        className={"md-body lyric-body"}>
        {lyrics && lyrics !== [] && lyrics.length > 0 && !qqInstrumental(lyrics) ? (
          lyrics.map((lyric, index) =>
            lyric && lyric.line && lyric.line !== "lrcInstrumental" ? (
              <h3
                key={index}
                className={classNames("lyric-line", { unsynced: lyric.startTime === 9999999 })}
                onClick={() => seekTo(lyric.startTime)}
                line-index={index.toString()}>
                {richlyrics && richlyrics !== [] && richlyrics.length > 0 ? (
                  <div className={"richl"}>
                    {getVerseLine(index - 1).map((verse) => (
                      <span
                        key={verse.id}
                        className={"verse"}
                        lyricstart={lyric.startTime}
                        versestart={verse.o}>
                        {verse.c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={"norm"}>{lyric.line}</div>
                )}
                {lyric.translation && lyric.translation !== "" ? <div className={"lyrics-translation"}>{lyric.translation}</div> : null}
              </h3>
            ) : (
              <h3
                key={lyric.id}
                className={"lyric-line"}
                onClick={() => seekTo(lyric.startTime)}
                start={lyric.startTime}
                end={lyric.endTime}
                line-index={index.toString()}>
                <div className={"lyricWaiting"}>
                  <div className={"WaitingDot1"} />
                  <div className={"WaitingDot2"} />
                  <div className={"WaitingDot3"} />
                </div>
              </h3>
            ),
          )
        ) : (
          <div className={"no-lyrics"}>{t("term.noLyrics")}</div>
        )}
      </div>
    </div>
  );
};

export default LyricsView;
