import { useMemo } from "react";
import MediaItemArtwork from "./mediaitem-artwork.jsx";
import MediaItemListItem from "./mediaitem-list-item.jsx";

const Queue = () => {
  let drag = false;
  let queuePosition = 0;
  let queueItems = [];
  let selected = -1;
  let selectedItems = [];
  let history = [];
  let page = "queue";
  let app = this.$root;

  const displayQueueItems = useMemo(() => {
    const displayLimit = 50;
    const lastDisplayPosition = Math.min(displayLimit + queuePosition, queueItems.length);
    return queueItems.slice(queuePosition, lastDisplayPosition);
  }, [queuePosition, queueItems]);

  function mounted() {
    updateQueue();
  }
  async function geory() {
    let history = await app.mk.api.v3.music(`/v1/me/recent/played/tracks`, { l: this.$root.mklang });
    history = history.data.data;
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
              self.queueItems.splice(
                self.queueItems.findIndex((queueItem) => queueItem.item.id === item.id),
                1,
              );
              app.mk.queue._queueItems = self.queueItems;
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
            name: app.getLz("action.removeTracks").replace("${self.selectedItems.length}", self.selectedItems.length.toString()),
            action: function () {
              // add property to items to be removed
              self.selectedItems.forEach(function (item) {
                self.queueItems.find((x) => x.item.id === item).remove = true;
              });
              // remove items
              self.queueItems = self.queueItems.filter(function (item) {
                return !item.remove;
              });
              app.mk.queue._queueItems = self.queueItems;
              app.mk.queue._reindex();
              self.selectedItems = [];
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
    <div id="cider-queue">
      <div className="queue-panel">
        <div className="row">
          <div className="col">
            <h3
              className="queue-header-text"
              v-if={page === "queue"}>
              {app.getLz("term.queue")}
            </h3>
            <h3
              className="queue-header-text"
              v-if={page === "history"}>
              {app.getLz("term.history")}
            </h3>
          </div>
          <div className="col-auto cider-flex-center">
            <button
              className="autoplay"
              style={{ background: app.mk.autoplayEnabled ? "var(--keyColor)" : "" }}
              onClick={() => {
                app.mk.autoplayEnabled = !app.mk.autoplayEnabled;
              }}
              title={app.getLz("term.autoplay")}
              v-b-tooltiphover>
              <img className="infinity" />
            </button>
          </div>
        </div>
        {page === "history" && <div
          className="queue-body">
          {history.map((item) => <MediaItemListItem
            show-library-status="false"
            v-bind:key={item.id}
            item={item}
          />)}
        </div>}
        <div
          className="queue-body"
          v-if={page === "queue"}>
          <draggable
            v-model={queueItems}
            start="drag=true"
            end="drag=false;move()">
            {displayQueueItems.map((queueItem, position) => <template>
              {position === 0 ? <div
                key={queueItem.item.id}
              />:
              <div
                className="cd-queue-item"
                v-else
                className="{selected: selectedItems.includes(queueItem.item.id)}"
                onClick={(e) => select(e, queueItem.item.id)}
                onDoubleClick={() => playQueueItem(queueItem.item.id)}
                key={queueItem.item.id}
                onContextMenu={(e) => queueContext(e, queueItem.item)}>
                <div className="row">
                  <div className="col-auto cider-flex-center">
                    <div className="artwork">
                      <MediaItemArtwork
                        url={queueItem.item.attributes.artwork ? queueItem.item.attributes.artwork.url : ''}
                        size="32"
                      />
                    </div>
                  </div>
                  <div className="col queue-info">
                    <div className="queue-title text-overflow-elipsis">{queueItem.item.attributes.name}</div>
                    <div className="queue-subtitle text-overflow-elipsis">
                      {queueItem.item.attributes.artistName} — {queueItem.item.attributes.albumName}
                    </div>
                  </div>
                  <div
                    className="queue-explicit-icon cider-flex-center"
                    v-if={queueItem.item.attributes.contentRating === "explicit"}>
                    <div className="explicit-icon" />
                  </div>
                  <div className="col queue-duration-info">
                    <div className="queue-duration cider-flex-center">{app.convertTime(queueItem.item.attributes.durationInMillis / 1000)}</div>
                  </div>
                </div>
              </div>}
            </template>)}
          </draggable>
        </div>
        <div className="queue-footer">
          <div
            className="btn-group"
            style={{ width: "100%" }}>
            <button
              className="md-btn md-btn-small"
              className="{'md-btn-primary': (page === 'queue')}"
              onClick={() => {
                page = "queue";
              }}>
              {app.getLz("term.queue")}
            </button>
            <button
              className="md-btn md-btn-small"
              className="{'md-btn-primary': (page === 'history')}"
              onClick={() => {
                geory();
                page = "history";
              }}>
              {app.getLz("term.history")}
            </button>
          </div>
          <button
            className="md-btn md-btn-small"
            style={{ width: "100%", marginTop: "6px" }}
            v-if={queueItems.length > 1}
            onClick={() => {
              app.mk.clearQueue();
              updateQueue();
            }}>
            {app.getLz("term.clearAll")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Queue;
