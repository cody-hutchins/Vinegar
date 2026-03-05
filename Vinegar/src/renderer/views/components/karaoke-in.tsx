const KaraokeIn = ({lyrics}: {lyrics: object[]}) => (
  <div id="karaoke-in">
    <div className="karaoke-viewer">
      <div className="lyric">
        {lyrics.map((segment: object) => (
          segmentInRange(segment.ts, segment.te, segment.x) ? (
          <div className="verse-group active">
            {segment.l.map((verse, verseIndex) => verseInRange(segment.ts, segment.te, verse.o) ? (<span className="verse verse-active">{verse.c}</span>): (<span className="verse">{verse.c}</span>))}
          </div>
          ) : (<div className="verse-group">{segment.x}</div>)
        ))}
      </div>
    </div>
  </div>
);

export default KaraokeIn;
