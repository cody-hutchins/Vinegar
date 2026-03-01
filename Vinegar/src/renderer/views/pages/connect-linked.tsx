export const Component = () => {
  Vue.component("connected", {
    template: "#connected",
    async mounted() {
      ipcRenderer.send("get-connected-url");
      ipcRenderer.on("send-connected-url", (event, url) => {
        this.url = url;
        app.webview.src = url;
        document.getElementById("foo").src = url;
      });
    },
    methods: {},
  });
  return (
    <div id="connected">
      <div style={{ display: "flex", width: "100%", height: "100%", paddingTop: "var(--navigationBarHeight)", position: "absolute", top: 0, left: 0 }}>
        <webview
          id="foo"
          src="https://cider.sh"
          style={{ display: "inline-flex", width: "100%" }}></webview>
      </div>
    </div>
  );
};
