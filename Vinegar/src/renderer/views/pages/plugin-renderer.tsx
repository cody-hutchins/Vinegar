const PluginRenderer = () => {
  function getPage() {
    return this.$root.pluginPages.page;
  }
  return <component is={getPage} />;
};

export default PluginRenderer;
