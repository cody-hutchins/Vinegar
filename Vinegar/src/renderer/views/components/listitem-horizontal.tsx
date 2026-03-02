export const Component = ({ items, showLibraryStatus = true }: { items: object[]; showLibraryStatus?: boolean }) => {
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
          <div v-for="items in itemPages">
            <mediaitem-list-item
              v-for="(song, index) in items"
              show-library-status={showLibraryStatus}
              v-bind:key="song.id"
              parent="'listitem-hr' + simplifiedParent"
              index="song.index"
              item="song"></mediaitem-list-item>
          </div>
        </vue-horizontal>
      </div>
    </div>
  );
};
