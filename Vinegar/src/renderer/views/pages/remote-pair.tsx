import { useEffect } from "react";

const RemotePair = () => {
  useEffect(() => {
    window.electronAPI.send("get-remote-pair-url");
    window.electronAPI.on("send-remote-pair-url", (event, url) => {
      const _url = url;
      app.webview.src = _url;
      document.getElementById("foo").src = _url;
    });
  }, []);
  return (
    <div id={"remote-pair"}>
      <div style={{ display: "flex", width: "100%", height: "100%", paddingTop: "var(--navigationBarHeight)", position: "absolute", top: 0, left: 0 }}>
        <webview
          id={"foo"}
          src={"https://cider.sh"}
          style={{ display: "inline-flex", width: "100%" }}
        />
      </div>
    </div>
  );
};

export default RemotePair;
