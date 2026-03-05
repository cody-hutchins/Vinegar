import MediaItemSquare from "../components/mediaitem-square.jsx";

export const MadeForYou = ({ item }: { item: object }) => (
  <div className="content-inner">
    <div className="row">
      <div
        className="col"
        style={{ padding: 0 }}>
        <h1 className="header-text">{$root.getLz("home.madeForYou")}</h1>
      </div>
    </div>
    <div className="madeforyou-body">
      {madeforyou.data.map((item) => (
        <MediaItemSquare
          item={item}
          v-bind:key={item.id}
        />
      ))}
    </div>
  </div>
);
