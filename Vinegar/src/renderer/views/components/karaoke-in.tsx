<div id="karaoke-in">
  <div className="karaoke-viewer">
    <div className="lyric">
      <template
        v-for="segment in lyrics"
        v-if="segmentInRange(segment.ts, segment.te, segment.x)">
        <div className="verse-group active">
          <template
            v-for="(verse, verseIndex) in segment.l"
            v-if="verseInRange(segment.ts, segment.te, verse.o)">
            <span className="verse verse-active">{verse.c}</span>
          </template>
          <template v-else>
            <span className="verse">{verse.c}</span>
          </template>
        </div>
      </template>
      <template v-else>
        <div className="verse-group">{segment.x}</div>
      </template>
    </div>
  </div>
</div>;
