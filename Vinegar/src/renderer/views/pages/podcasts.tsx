import { useEffect } from "react";
import MediaItemArtwork from "../components/mediaitem-artwork.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { Row, Col } from "react-bootstrap";

export const PodcastEpisode = ({ item, isSelected }: { item: object; isSelected: boolean }) => {
  function msToMinSec(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
  return (
    <div className={`cd-mediaitem-list-item list-flat ${isSelected ? "mediaitem-selected" : ""}`}>
      <div
        className={"info-rect"}
        style={{ paddingLeft: "16px" }}>
        <div className={"title text-overflow-elipsis"}>{item.attributes.name}</div>
        <div className={"subtitle text-overflow-elipsis"}>{item.attributes.description.standard}</div>
        <div className={"subtitle text-overflow-elipsis"}>
          {msToMinSec(item.attributes.durationInMilliseconds)} • {new Date(item.attributes.releaseDateTime).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export const PodcastTab = ({ item, isSelected }: { item: object; isSelected: boolean }) => {
  return (
    <div className={`cd-mediaitem-list-item list-flat ${isSelected ? "mediaitem-selected" : ""}`}>
      <div className={"artwork"}>
        <MediaItemArtwork
          url={item.attributes.artwork.url}
          size={"50"}
          type={"podcast"}
        />
      </div>
      <div className={"info-rect"}>
        <div className={"title text-overflow-elipsis"}>{item.attributes.name}</div>
      </div>
    </div>
  );
};

export const Podcasts = () => {
  const ciderPodcasts = [];
  let podcasts = [];
  let episodes = [];
  const search = {
    term: "",
    loading: false,
    results: [],
    resultsLibrary: [],
    next: "",
  };
  let podcastSelected = {
    id: -1,
  };
  let selected = {
    id: -1,
  };
  async function mounted() {
    const podcastShow = await app.mk.api.v3.podcasts(`/v1/me/library/podcasts?include=episodes`);
    podcasts = podcastShow.data.data;
    if (podcastShow.data.next) {
      await getNext(podcastShow.data.next);
    }
    // episodes = podcastShow.data.data[0].relationships.episodes.data
  }
  useEffect(() => {
    mounted().then();
  }, []);

  function searchTriggerVis(visible) {}

  function librarySearch() {
    search.resultsLibrary = [];
    if (search.term.length > 2) {
      search.resultsLibrary = podcasts.filter((podcast) => podcast.attributes.name.toLowerCase().includes(search.term.toLowerCase()));
    }
  }

  function isSubscribed(id) {
    return podcasts.filter((podcast) => podcast.id === id).length > 0;
  }

  function searchPodcasts() {
    if (search.term === "") {
      return;
    }
    app.mk.api.v3
      .podcasts(`/v1/catalog/${app.mk.storefrontId}/search`, {
        term: search.term,
        types: ["podcasts"],
        limit: 25,
      })
      .then((response) => {
        console.log(response);
        search.results = response.data.results.podcasts.data;
      });
  }

  function openUrl(url) {
    window.open(url);
  }

  function msToMinSec(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  function playEpisode(episode) {
    app.mk.setQueue({ episode: episode.id, parameters: { l: app.mklang } }).then(() => {
      app.mk.play();
    });
  }

  function selectPodcast(podcast) {
    podcastSelected = podcast;
    getEpisodes(podcast);
  }

  function selectEpisode(episode) {
    selected = Clone(episode);
  }

  async function getEpisodes(podcast) {
    episodes = [];
    const eps = await app.mk.api.v3.podcasts(`/v1/catalog/${app.mk.storefrontId}/podcasts/${podcast.id}?include=episodes`);

    eps.data.data[0].relationships.episodes.data.forEach((ep) => {
      episodes.push(ep);
    });
    if (eps.data.data[0].relationships.episodes.next) {
      await getNextEpisodes(eps.data.data[0].relationships.episodes.next, podcast.id);
    }
  }

  async function getNextEpisodes(next, podcastId) {
    const podcastShow = await app.mk.api.v3.podcasts(next);
    if (podcastId !== podcastSelected.id) {
      return;
    }
    podcastShow.data.data.forEach((ep) => {
      episodes.push(ep);
    });
    if (podcastShow.data.next) {
      await getNextEpisodes(podcastShow.data.next, podcastId);
    }
  }

  async function getNext(next) {
    const podcastShow = await app.mk.api.v3.podcasts(next);
    podcasts = podcasts.concat(podcastShow.data.data);
    if (podcastShow.data.next) {
      await getNext(podcastShow.data.next);
    }
  }

  return (
    <div>
      <div id={"apple-podcasts"}>
        <div className={"content-inner podcasts-page"}>
          <div className={"podcasts-list"}>
            <div className={"podcasts-search"}>
              <div
                className={"search-input-container"}
                style={{ width: "100%" }}>
                <div className={"search-input--icon"} />
                <input
                  type={"search"}
                  style={{ width: "100%" }}
                  spellCheck={"false"}
                  placeholder={$root.getLz("term.search") + "..."}
                  onChange={() => {
                    searchPodcasts();
                    librarySearch();
                  }}
                  v-model={search.term}
                  className={"search-input"}
                />
              </div>
            </div>
            {search.term === "" ? (
              <div>
                {ciderPodcasts.length !== 0 && <div className={"podcast-list-header"}>{$root.getLz("podcast.followedOnCider")}</div>}
                {podcasts.length !== 0 && <div className={"podcast-list-header"}>{$root.getLz("podcast.subscribedOnItunes")}</div>}
                {podcasts.map((podcast) => (
                  <PodcastTab
                    isSelected={podcastSelected.id === podcast.id}
                    clicknative={selectPodcast(podcast)}
                    item={podcast}
                  />
                ))}
              </div>
            ) : (
              <div>
                {podcasts.length !== 0 && <div className={"podcast-list-header"}>{$root.getLz("term.library")}</div>}
                {search.resultsLibrary.map((podcast) => (
                  <PodcastTab
                    isSelected={podcastSelected.id === podcast.id}
                    clicknative={selectPodcast(podcast)}
                    item={podcast}
                  />
                ))}
                {podcasts.length !== 0 && <div className={"podcast-list-header"}>{$root.getLz("podcast.itunesStore")}</div>}
                {search.results.map((podcast) => (
                  <PodcastTab
                    isSelected={podcastSelected.id === podcast.id}
                    clicknative={selectPodcast(podcast)}
                    item={podcast}
                  />
                ))}
              </div>
            )}
          </div>
          <div className={"episodes-list"}>
            {podcastSelected.id !== -1 && (
              <div className={"episodes-inline-info"}>
                <Row className={"row"}>
                  <Col
                    auto
                    className={"cider-flex-center"}>
                    <div className={"podcast-artwork"}>
                      <MediaItemArtwork
                        shadow={"large"}
                        url={podcastSelected.attributes.artwork.url}
                        size={"300"}
                      />
                    </div>
                  </Col>
                  <Col className={"podcast-show-info"}>
                    <h1>{podcastSelected.attributes.name}</h1>
                    <small>{podcastSelected.attributes.releaseFrequency}</small>
                    <small>Created: {new Date(podcastSelected.attributes.createdDate).toLocaleDateString()}</small>
                  </Col>
                </Row>
                <div className={"well podcast-show-description"}>{podcastSelected.attributes.description.standard}</div>
                {!isSubscribed(podcastSelected.id) && (
                  <Row>
                    <Col>
                      <button className={"md-btn md-btn-block"}>{$root.getLz("podcast.followOnCider")}</button>
                    </Col>
                    <Col>
                      <button className={"md-btn md-btn-block"}>{$root.getLz("podcast.subscribeOnItunes")}</button>
                    </Col>
                  </Row>
                )}
                <h3>{$root.getLz("podcast.episodes")}</h3>
              </div>
            )}
            {search.results.length === 0 && podcastSelected.id === -1 && (
              <div className={"podcast-no-search-results"}>
                <h3>{$root.getLz("error.noResults")}</h3>
                <p>{$root.getLz("error.noResults.description")}</p>
              </div>
            )}
            {episodes.map((episode) => (
              <PodcastEpisode
                key={episode.id}
                isSelected={selected.id === episode.id}
                dblclicknative={() => playEpisode(episode)}
                clicknative={() => selectEpisode(episode)}
                item={episode}
              />
            ))}
          </div>
          <AnimatePresence>
            <motion.div name={"wpfade"}>
              {selected.id !== -1 && (
                <div className={"podcasts-details"}>
                  <div className={"podcasts-details-header"}>
                    <button
                      className={"close-btn"}
                      onClick={() => (selected.id = -1)}
                      aria-label={$root.getLz("action.close")}
                    />
                  </div>
                  <div className={"podcast-artwork"}>
                    <MediaItemArtwork
                      shadow={"large"}
                      url={selected.attributes.artwork.url}
                      size={"300"}
                    />
                  </div>
                  <h3 className={"podcast-header"}>{selected.attributes.name}</h3>
                  <button
                    onClick={() => playEpisode(selected)}
                    className={"md-btn podcast-play-btn"}>
                    {$root.getLz("podcast.playEpisode")}
                  </button>
                  <div className={"podcast-genre"}>{selected.attributes.genreNames[0]}</div>
                  <div className={"podcast-metainfo"}>
                    {msToMinSec(selected.attributes.durationInMilliseconds)} • {new Date(selected.attributes.releaseDateTime).toLocaleString()}
                  </div>
                  {selected.attributes.description.standard && <div className={"well podcast-description"}>{selected.attributes.description.standard}</div>}
                  <Row>
                    <Col>
                      <button
                        className={"md-btn md-btn-block meta-btn"}
                        onClick={() => openUrl(selected.attributes.websiteUrl)}>
                        {$root.getLz("podcast.website")}
                      </button>
                    </Col>
                    <Col>
                      <button
                        className={"md-btn md-btn-block meta-btn"}
                        onClick={() => $root.share(selected.attributes.websiteUrl)}>
                        {$root.getLz("action.share")}
                      </button>
                    </Col>
                  </Row>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div id={"podcast-tab"}>
        <div className={`cd-mediaitem-list-item list-flat ${isSelected ? "mediaitem-selected" : ""}`}>
          <div className={"artwork"}>
            <MediaItemArtwork
              url={item.attributes.artwork.url}
              size={"50"}
              type={"podcast"}
            />
          </div>
          <div className={"info-rect"}>
            <div className={"title text-overflow-elipsis"}>{item.attributes.name}</div>
          </div>
        </div>
      </div>
      <div id={"podcast-episode"}>
        <div className={`cd-mediaitem-list-item list-flat ${isSelected ? "mediaitem-selected" : ""}`}>
          <div
            className={"info-rect"}
            style={{ paddingLeft: "16px" }}>
            <div className={"title text-overflow-elipsis"}>{item.attributes.name}</div>
            <div className={"subtitle text-overflow-elipsis"}>{item.attributes.description.standard}</div>
            <div className={"subtitle text-overflow-elipsis"}>
              {msToMinSec(item.attributes.durationInMilliseconds)} • {new Date(item.attributes.releaseDateTime).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
