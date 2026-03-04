import { useEffect } from "react";

const AppleAccountSettings = () => {
  useEffect(() => {
    document.querySelector("#foo").addEventListener("dom-ready", () => {
      // document.querySelector("#foo").executeJavaScript(`document.body.innerHTML += ("<style>.header {display: none!important;} </style>")`)
    });
  }, []);
  return (
    <div id="apple-account-settings">
      <div style={{ display: "flex", width: "100%", height: "100%", paddingTop: "var(--navigationBarHeight)", position: "absolute", top: 0, left: 0 }}>
        <webview
          id="foo"
          src="https://beta.music.apple.com/includes/commerce/account/settings?product=music&isFullscreen=false&isModal=false&expectsModalLayout=false&isFullScreen=true"
          style={{ display: "inline-flex", width: "100%" }}
        />
      </div>
    </div>
  );
};

export default AppleAccountSettings;
