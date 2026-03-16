import { useEffect } from "react";
import MediaItemListItem from "./mediaitem-list-item.jsx";

const ListItemHorizontal = ({ items, showLibraryStatus = true }: { items: object[]; showLibraryStatus?: boolean }) => {
  let itemPages = [];
  let simplifiedParent: string;

  useEffect(() => {
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
    } catch (e) {
      console.log(e);
    }
  }, [items]);

  const sayHello = () => {
    alert("Hello world!");
  };

  return (
    <div id={"listitem-horizontal"}>
      <div
        className={"listitem-horizontal"}
        style={{ overflowX: "auto", display: "flex", scrollSnapType: "x mandatory" }}>
        {itemPages.map((items) =>
          items.map((song) => (
            <MediaItemListItem
              showLibraryStatus={showLibraryStatus}
              key={song.id}
              parent={"listitem-hr" + simplifiedParent}
              index={song.index}
              item={song}
            />
          )),
        )}
      </div>
    </div>
  );
};

export default ListItemHorizontal;
