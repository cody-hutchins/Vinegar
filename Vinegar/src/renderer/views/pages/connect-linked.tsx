import { useEffect } from "react";

const Component = () => {
  useEffect(() => {
    ipcRenderer.send("get-connected-url");
    ipcRenderer.on("send-connected-url", (event, url) => {
      url = url;
      app.webview.src = url;
      document.getElementById("foo").src = url;
    });
  }, []);
  return (
    <div id="connected">
      <div style={{ display: "flex", width: "100%", height: "100%", paddingTop: "var(--navigationBarHeight)", position: "absolute", top: 0, left: 0 }}>
        <webview
          id="foo"
          src="https://cider.sh"
          style={{ display: "inline-flex", width: "100%" }}
        />
      </div>
    </div>
  );
};
