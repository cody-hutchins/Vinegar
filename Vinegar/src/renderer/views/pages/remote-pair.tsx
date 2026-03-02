import { useEffect } from "react";

export const Component = () => {
  async function mounted() {
    ipcRenderer.send("get-remote-pair-url");
    ipcRenderer.on("send-remote-pair-url", (event, url) => {
      url = url;
      app.webview.src = url;
      document.getElementById("foo").src = url;
    });
  }
  useEffect(() => {
    mounted().then();
  }, []);
  return (
    <div id="remote-pair">
      <div style={{ display: "flex", width: "100%", height: "100%", paddingTop: "var(--navigationBarHeight)", position: "absolute", top: 0, left: 0 }}>
        <webview
          id="foo"
          src="https://cider.sh"
          style={{ display: "inline-flex", width: "100%" }}></webview>
      </div>
    </div>
  );
};
