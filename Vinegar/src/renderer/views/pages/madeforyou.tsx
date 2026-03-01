export const MadeForYou = (
  <div className="content-inner">
    <div className="row">
      <div
        className="col"
        style={{ padding: 0 }}>
        <h1 className="header-text">{$root.getLz("home.madeForYou")}</h1>
      </div>
    </div>
    <div className="madeforyou-body">
      <mediaitem-square
        item="item"
        v-for="item in madeforyou.data"
        v-bind:key="item.id"></mediaitem-square>
    </div>
  </div>
);
