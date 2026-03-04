import { useEffect } from "react";

const SidebarLibraryItem = ({
      name,
    page,
    svgIcon="",
    svgIconName,
    cdClick,
}:{name: string,
    page: string,
    svgIcon?: string,
    svgIconName?: string,
    cdClick?: () => void}) => {
  let app = app;
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
    <button class="app-sidebar-item" class="$root.getSidebarItemClass(page)" click="$root.setWindowHash(page)">
      <SVGIcon url="svgIconData" name="'sidebar-' + svgIconName" v-if="svgIconData != ''" />
      <span class="sidebar-item-text">{name}</span>
    </button>
  );
};

export default SidebarLibraryItem;
