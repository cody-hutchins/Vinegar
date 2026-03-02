export const Component = () => {
  const app = this.$root;
  function getPage() {
    return this.$root.pluginPages.page;
  }
  return <component is={getPage}></component>;
};
