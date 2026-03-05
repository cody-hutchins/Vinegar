import { useEffect } from "react";
import ListenNowChild from "../components/listennow-child.jsx";

const ListenNow = ({ data }: { data: object }) => {
  const app = this.$root;
  useEffect(() => {
    this.$root.getListenNow();
  }, []);
  return (
    <div id="cider-listen-now">
      <div className="content-inner">
        <h1 className="header-text">{app.getLz("term.listenNow")}</h1>
        {data.data.map((recom, index) => (
          <ListenNowChild
            recom="recom"
            index="index"
          />
        ))}
      </div>
    </div>
  );
};
export default ListenNow;
