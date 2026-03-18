import { useEffect } from "react";
import ListenNowChild from "../components/listennow-child.jsx";
import { useTranslation } from "react-i18next";

const ListenNow = ({ data }: { data: object }) => {
  const { t } = useTranslation();
  const app = this.$root;
  useEffect(() => {
    this.$root.getListenNow();
  }, []);
  return (
    <div id={"cider-listen-now"}>
      <div className={"content-inner"}>
        <h1 className={"header-text"}>{t("term.listenNow")}</h1>
        {data.data.map((recom, index) => (
          <ListenNowChild
            key={index}
            recom={recom}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
export default ListenNow;
