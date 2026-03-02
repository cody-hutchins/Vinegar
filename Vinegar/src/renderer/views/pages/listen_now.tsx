import { useEffect } from "react";

export const Component = ({ data }: { data: object }) => {
  const app = this.$root;
  useEffect(() => {
    this.$root.getListenNow();
  }, []);
  return (
    <div id="cider-listen-now">
      <div className="content-inner">
        <h1 className="header-text">{app.getLz("term.listenNow")}</h1>
        <template v-for="(recom,index) in data.data">
          <listennow-child
            recom="recom"
            index="index"></listennow-child>
        </template>
      </div>
    </div>
  );
};
