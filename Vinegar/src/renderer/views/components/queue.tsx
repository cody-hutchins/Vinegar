import { useEffect, useMemo } from "react";
import MediaItemArtwork from "./mediaitem-artwork.jsx";
import MediaItemListItem from "./mediaitem-list-item.jsx";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import classNames from "classnames";

const Queue = () => {
  const drag = false;
  let queuePosition = 0;
  let queueItems = [];
  let selected = -1;
  let selectedItems = [];
  let history = [];
  let page = "queue";
  const app = this.$root;

  const displayQueueItems = useMemo(() => {
    const displayLimit = 50;
    const lastDisplayPosition = Math.min(displayLimit + queuePosition, queueItems.length);
    return queueItems.slice(queuePosition, lastDisplayPosition);
  }, [queuePosition, queueItems]);

  useEffect(() => {
    updateQueue();
  }, []);
  async function geory() {
    const _history = await app.mk.api.v3.music(`/v1/me/recent/played/tracks`, { l: this.$root.mklang });
    history = _history.data.data;
  }
  function select(e, id) {
    if (e.ctrlKey || e.shiftKey) {
      if (selectedItems.indexOf(id) === -1) {
        selectedItems.push(id);
      } else {
        selectedItems.splice(selectedItems.indexOf(id), 1);
      }
    } else {
      selectedItems = [id];
    }
  }
  function queueContext(event, item) {
    const useMenu = selectedItems.length > 1 ? "multiple" : "single";
    const menus = {
      single: {
        items: [
          {
            name: app.getLz("action.removeFromQueue"),
            action: function () {
              queueItems.splice(
                queueItems.findIndex((queueItem) => queueItem.item.id === item.id),
                1,
              );
              app.mk.queue._queueItems = queueItems;
              app.mk.queue._reindex();
            },
          },
          {
            name: app.getLz("action.startRadio"),
            action: function () {
              app.mk
                .setStationQueue({
                  song: item.attributes.playParams.id ?? item.id,
                })
                .then(() => {
                  app.mk.play();
                });
            },
          },
          {
            name: app.getLz("action.goToArtist"),
            action: function () {
              app.searchAndNavigate(item, "artist");
            },
          },
          {
            name: app.getLz("action.goToAlbum"),
            action: function () {
              app.searchAndNavigate(item, "album");
            },
          },
        ],
      },
      multiple: {
        items: [
          {
            name: app.getLz("action.removeTracks").replace("${selectedItems.length}", selectedItems.length.toString()),
            action: function () {
              // add property to items to be removed
              selectedItems.forEach(function (item) {
                queueItems.find((x) => x.item.id === item).remove = true;
              });
              // remove items
              queueItems = queueItems.filter(function (item) {
                return !item.remove;
              });
              app.mk.queue._queueItems = queueItems;
              app.mk.queue._reindex();
              selectedItems = [];
            },
          },
        ],
      },
    };
    app.showMenuPanel(menus[useMenu], event);
  }

  function playQueueItem(id) {
    app.mk.changeToMediaAtIndex(app.mk.queue._itemIDs.indexOf(id));
  }

  function updateQueue() {
    selected = -1;
    if (app.mk.queue) {
      queuePosition = app.mk.queue.position;
      queueItems = app.mk.queue._queueItems;
    } else {
      queuePosition = 0;
      queueItems = [];
    }
  }

  function move() {
    selected = -1;
    app.mk.queue._queueItems = queueItems;
    app.mk.queue._reindex();
  }

  return (
    <div id={"cider-queue"}>
      <div className={"queue-panel"}>
        <Row>
          <Col>
            {page === "queue" && <h3 className={"queue-header-text"}>{app.getLz("term.queue")}</h3>}
            {page === "history" && <h3 className={"queue-header-text"}>{app.getLz("term.history")}</h3>}
          </Col>
          <Col
            auto
            className={"cider-flex-center"}>
            <OverlayTrigger overlay={<Tooltip id={"autoplay"}>{app.getLz("term.autoplay")}</Tooltip>}>
              <button
                className={"autoplay"}
                style={{ background: app.mk.autoplayEnabled ? "var(--keyColor)" : "" }}
                onClick={() => {
                  app.mk.autoplayEnabled = !app.mk.autoplayEnabled;
                }}>
                <img className={"infinity"} />
              </button>
            </OverlayTrigger>
          </Col>
        </Row>
        {page === "history" && (
          <div className={"queue-body"}>
            {history.map((item) => (
              <MediaItemListItem
                showLibraryStatus={false}
                key={item.id}
                item={item}
              />
            ))}
          </div>
        )}
        {page === "queue" && (
          <div className={"queue-body"}>
            <draggable
              v-model={queueItems}
              start={"drag=true"}
              end={"drag=false;move()"}>
              {displayQueueItems.map((queueItem, position) => (
                <div key={position}>
                  {position === 0 ? (
                    <div key={queueItem.item.id} />
                  ) : (
                    <div
                      className={classNames("cd-queue-item", { selected: selectedItems.includes(queueItem.item.id) })}
                      onClick={(e) => select(e, queueItem.item.id)}
                      onDoubleClick={() => playQueueItem(queueItem.item.id)}
                      key={queueItem.item.id}
                      onContextMenu={(e) => queueContext(e, queueItem.item)}>
                      <Row>
                        <Col
                          auto
                          className={"cider-flex-center"}>
                          <div className={"artwork"}>
                            <MediaItemArtwork
                              url={queueItem.item.attributes.artwork ? queueItem.item.attributes.artwork.url : ""}
                              imagesize={"32"}
                            />
                          </div>
                        </Col>
                        <Col className={"queue-info"}>
                          <div className={"queue-title text-overflow-elipsis"}>{queueItem.item.attributes.name}</div>
                          <div className={"queue-subtitle text-overflow-elipsis"}>
                            {queueItem.item.attributes.artistName} — {queueItem.item.attributes.albumName}
                          </div>
                        </Col>
                        {queueItem.item.attributes.contentRating === "explicit" && (
                          <div className={"queue-explicit-icon cider-flex-center"}>
                            <div className={"explicit-icon"} />
                          </div>
                        )}
                        <Col className={"queue-duration-info"}>
                          <div className={"queue-duration cider-flex-center"}>{app.convertTime(queueItem.item.attributes.durationInMillis / 1000)}</div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              ))}
            </draggable>
          </div>
        )}
        <div className={"queue-footer"}>
          <div
            className={"btn-group"}
            style={{ width: "100%" }}>
            <button
              className={classNames("md-btn md-btn-small", { "md-btn-primary": page === "queue" })}
              onClick={() => {
                page = "queue";
              }}>
              {app.getLz("term.queue")}
            </button>
            <button
              className={classNames("md-btn md-btn-small", { "md-btn-primary": page === "history" })}
              onClick={() => {
                geory();
                page = "history";
              }}>
              {app.getLz("term.history")}
            </button>
          </div>
          {queueItems.length > 1 && (
            <button
              className={"md-btn md-btn-small"}
              style={{ width: "100%", marginTop: "6px" }}
              onClick={() => {
                app.mk.clearQueue();
                updateQueue();
              }}>
              {app.getLz("term.clearAll")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Queue;
