import { useEffect } from "react";

const SidebarLibraryItem = ({ name, page, svgIcon = "", svgIconName, cdClick }: { name: string; page: string; svgIcon?: string; svgIconName?: string; cdClick?: () => void }) => {
  const app = app;
  let svgIconData = "";

  async function mounted() {
    if (svgIcon) {
      svgIconData = svgIcon;
    }
  }
  useEffect(() => {
    mounted().then();
  }, []);
  return (
    <button
      className={"app-sidebar-item"}
      className={"$root.getSidebarItemClass(page)"}
      click={"$root.setWindowHash(page)"}>
      {svgIconData != "" && (
        <SVGIcon
          url={"svgIconData"}
          name={"'sidebar-' + svgIconName"}
        />
      )}
      <span className={"sidebar-item-text"}>{name}</span>
    </button>
  );
};

export default SidebarLibraryItem;
