const KaraokeIn = ({ lyrics }: { lyrics: object[] }) => (
  <div id={"karaoke-in"}>
    <div className={"karaoke-viewer"}>
      <div className={"lyric"}>
        {lyrics.map((segment: object) =>
          segmentInRange(segment.ts, segment.te, segment.x) ? (
            <div
              key={segment.id}
              className={"verse-group active"}>
              {segment.l.map((verse, verseIndex) =>
                verseInRange(segment.ts, segment.te, verse.o) ? (
                  <span
                    key={verseIndex}
                    className={"verse verse-active"}>
                    {verse.c}
                  </span>
                ) : (
                  <span
                    key={verseIndex}
                    className={"verse"}>
                    {verse.c}
                  </span>
                ),
              )}
            </div>
          ) : (
            <div
              key={segment.id}
              className={"verse-group"}>
              {segment.x}
            </div>
          ),
        )}
      </div>
    </div>
  </div>
);

export default KaraokeIn;
