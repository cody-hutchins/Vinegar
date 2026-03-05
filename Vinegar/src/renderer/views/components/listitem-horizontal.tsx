import MediaItemListItem from "./mediaitem-list-item.jsx";

const ListItemHorizontal = ({ items, showLibraryStatus = true }: { items: object[]; showLibraryStatus?: boolean }) => {
  const itemPages = [];
  const simplifiedParent = [];

  function mounted() {
    // give every item an id
    items.forEach(function (item, index) {
      item.id = index;
    });
    // split items into pages
    itemPages = app.arrayToChunk(items, 4);
    try {
      simplifiedParent = JSON.stringify(
        items.map(function (x) {
          return x.attributes.playParams;
        }),
      );
      console.debug("simplifiedParent: " + simplifiedParent);
    } catch (e) {}
  }
  const watch = {
    items: function (items) {
      // give every item an id
      items.forEach(function (item, index) {
        item.id = index;
      });
      // split items into pages
      itemPages = app.arrayToChunk(items, 4);
      try {
        simplifiedParent = JSON.stringify(
          items.map(function (x) {
            return x.attributes.playParams;
          }),
        );
        console.log("simplifiedParent: " + simplifiedParent);
      } catch (e) {}
    },
  };
  const sayHello = () => {
    alert("Hello world!");
  };

  return (
    <div id="listitem-horizontal">
      <div className="listitem-horizontal">
        <vue-horizontal>
          {itemPages.map((items) =>items.map((song)=> (
            <MediaItemListItem
              show-library-status={showLibraryStatus}
              v-bind:key={song.id}
              parent="'listitem-hr' + simplifiedParent"
              index={song.index}
              item={song}
            />)))}
        </vue-horizontal>
      </div>
    </div>
  );
};

export default ListItemHorizontal;
