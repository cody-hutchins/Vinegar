const Webview = ({ page, webview }: { page: string; webview: { url: string } }) =>
  page === "webview" && (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <webview
        id={"foo"}
        src={webview.url}
        style={{ display: "inline-flex", width: "100%" }}
      />
    </div>
  );

export default Webview;
