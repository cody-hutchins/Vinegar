import { useEffect } from "react";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import MediaItemSquare from "../components/mediaitem-square.jsx";
import MediaItemScrollerHorizontal from "../components/mediaitem-scroller-horizontal.jsx";
import ListitemHorizontal from "../components/listitem-horizontal.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { Col, Row } from "react-bootstrap";

const Replay = () => {
  let years = [];
  let loaded = {
    id: -1,
  };
  let hourshow = true;
  let musicTypeGenre = "";
  async function mounted() {
    // Get available years
    const year = await app.mk.api.v3.music("/v1/me/music-summaries/search?extend=inLibrary&period=year&fields[music-summaries]=period%2Cyear&include[music-summaries]=playlist");
    years = year.data.data;
    years.reverse();
    localStorage.setItem("seenReplay", true);
    getReplayYear();
    const musicGenre = await app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/genres/34`);
    musicTypeGenre = musicGenre.data.data[0].attributes.name;
  }
  useEffect(() => {
    mounted().then();
  }, []);

  function songsToArray(songsData) {
    const songs = [];
    const topGenres: Record<string, any> = {};
    let genrePlayCount = 0;
    songsData.forEach(function (songData) {
      const song = songData.relationships.song.data[0];
      song.attributes.playCount = songData.attributes.playCount;
      songs.push(song);
      genrePlayCount += song.attributes.playCount;
      song.attributes.genreNames.forEach(function (genre) {
        if (genre !== musicTypeGenre) {
          if (topGenres[genre] === undefined) {
            topGenres[genre] = song.attributes.playCount;
          } else {
            topGenres[genre] += song.attributes.playCount;
          }
        }
      });
    });
    const topGenresArray = [];
    for (const genre in topGenres) {
      topGenresArray.push({
        genre: genre,
        count: topGenres[genre],
      });
    }
    topGenresArray.sort(function (a, b) {
      return b.count - a.count;
    });
    topGenresArray.forEach(function (genre) {
      genre.count = Math.round((genre.count / genrePlayCount) * 100);
    });
    loaded.topGenres = topGenresArray;

    return songs;
  }
  async function getReplayYear(year = new Date().getFullYear()) {
    loaded.id = -1;
    const response = await app.mk.api.v3.music(`/v1/me/music-summaries/year-${year}?extend=inLibrary&views=top-artists%2Ctop-albums%2Ctop-songs&include[music-summaries]=playlist&include[playlists]=tracks&includeOnly=playlist%2Ctracks%2Csong%2Cartist%2Calbum`);
    const replayData = response.data.data[0];
    // extended playlist
    const playlist = await app.mk.api.v3.music(replayData.relationships.playlist.data[0].href, { extend: "editorialArtwork,editorialVideo" });
    replayData.playlist = playlist.data.data[0];
    loaded = replayData;
  }
  function convertToHours(minutes: number) {
    return Math.floor(minutes / 60);
  }

  return (
    <div id={"replay-page"}>
      <div className={"content-inner replay-page"}>
        <div style={{ height: "300px", overflowX: "auto", display: "flex", scrollSnapType: "x mandatory" }}>
          {years.map((year) => (
            <div
              key={year}
              className={"replay-period"}
              onClick={() => getReplayYear(year.attributes.year)}>
              <div className={"artwork-container"}>
                <MediaItemArtwork
                  imagesize={"200"}
                  url={year.relationships.playlist.data[0].attributes.artwork.url}
                />
              </div>
              {year.attributes.year}
            </div>
          ))}
        </div>
        <hr />
        <AnimatePresence>
          <motion.div name={"replaycard"}>
            {loaded.id !== -1 && (
              <div className={"replay-viewport"}>
                {/* Stats  */}
                {/* {false && ( */}
                <div className={"replay-video"}>
                  <MediaItemArtwork
                    url={loaded.playlist.attributes.editorialVideo.motionWideVideo21x9.previewFrame.url}
                    video={loaded.playlist.attributes.editorialVideo.motionWideVideo21x9.video}
                    video-priority={"true"}
                  />
                </div>
                {/* )} */}
                <h1 className={"replay-header"}>
                  {loaded.attributes.year} {$root.getLz("term.replay")}
                </h1>
                <hr />
                <Row>
                  <Col>
                    <h4 onClick={() => (hourshow = !hourshow)}>
                      {convertToHours(loaded.attributes.listenTimeInMinutes)}
                      {$root.getLz("term.time.hours")}
                      {hourshow ? "" : loaded.attributes.listenTimeInMinutes % 60}
                      {hourshow ? "" : $root.getLz("term.time.minutes")}
                    </h4>
                    <h4>
                      {loaded.attributes.uniqueAlbumCount} {$root.getLz("term.uniqueAlbums")}
                    </h4>
                    <h4>
                      {loaded.attributes.uniqueArtistCount} {$root.getLz("term.uniqueArtists")}
                    </h4>
                    <h4>
                      {loaded.attributes.uniqueSongCount} {$root.getLz("term.uniqueSongs")}
                    </h4>
                  </Col>
                  <Col
                    auto
                    className={"replay-playlist-container"}>
                    <MediaItemSquare
                      kind={"card"}
                      no-scale={"true"}
                      force-video={"true"}
                      item={loaded.playlist}
                    />
                  </Col>
                </Row>
                {/*            Top Artists */}
                <h3>{$root.getLz("term.topArtists")}</h3>
                <div className={"well"}>
                  <MediaItemScrollerHorizontal>
                    {loaded.views["top-artists"].data.map((artistData) => (
                      <div
                        key={artistData.id}
                        className={"card replay-card"}>
                        <div className={"card-body"}>
                          <MediaItemSquare item={artistData.relationships.artist.data[0]} />
                        </div>
                        <div className={"card-footer"}>
                          {convertToHours(artistData.attributes.listenTimeInMinutes)}
                          {$root.getLz("term.time.hours", { count: convertToHours(artistData.attributes.listenTimeInMinutes) })}
                          <br />
                          {$root.getLz("term.listenedTo")} {artistData.attributes.playCount}
                          {$root.getLz("term.times")}
                        </div>
                      </div>
                    ))}
                  </MediaItemScrollerHorizontal>
                </div>
                {/*            Top Albums */}
                <h3>{$root.getLz("term.topAlbums")}</h3>
                <div className={"well"}>
                  <MediaItemScrollerHorizontal>
                    {loaded.views["top-albums"].data.map((albumData) => (
                      <div
                        key={albumData.id}
                        className={"card replay-card"}>
                        <div className={"card-body"}>
                          <MediaItemSquare item={albumData.relationships.album.data[0]} />
                        </div>
                        <div className={"card-footer"}>
                          {convertToHours(albumData.attributes.listenTimeInMinutes)}
                          {$root.getLz("term.time.hours", { count: convertToHours(albumData.attributes.listenTimeInMinutes) })}
                          <br />
                          {albumData.attributes.playCount} {$root.getLz("term.plays")}
                        </div>
                      </div>
                    ))}
                  </MediaItemScrollerHorizontal>
                </div>
                {/*            Top Songs */}
                <h3>{$root.getLz("term.topSongs")}</h3>
                <div className={"well"}>
                  <ListitemHorizontal
                    showLibraryStatus={"false"}
                    items={songsToArray(loaded.views["top-songs"].data)}
                  />
                </div>
                <h3>{$root.getLz("term.topGenres")}</h3>
                <div className={"top-genres-container"}>
                  {loaded.topGenres.map((genre) => (
                    <div
                      key={genre.id}
                      className={"replay-genre-display"}>
                      <div className={"genre-name"}>{genre.genre}</div>
                      <div className={"genre-count"}>
                        <div
                          className={"genre-count-bar"}
                          style={{ width: genre.count + "%" }}>
                          {genre.count}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Replay;
