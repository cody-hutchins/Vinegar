const Webview = () =>
  page === "webview" && (
    <template>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <webview
          id={"foo"}
          src={webview.url}
          nodeintegration
          style={{ display: "inline-flex", width: "100%" }}
        />
      </div>
    </template>
  );

export default Webview;
