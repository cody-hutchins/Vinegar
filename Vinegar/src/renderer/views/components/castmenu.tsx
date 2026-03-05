import { ipcRenderer } from "electron";
import { CiderAudio } from "../../audio/audio.js";

const Component = () => {
  let devices = {
    cast: [],
    airplay: [],
  };
  let scanning = false;
  let activeCasts = this.$root.activeCasts;
  function mounted() {
    scan();
  }

  const watch = {
    activeCasts: function (newVal, oldVal) {
      this.$root.activeCasts = activeCasts;
    },
  };

  const close = () => {
    this.$root.modals.castMenu = false;
  };

  const scan = () => {
    ipcRenderer.send("getChromeCastDevices", "");
    ipcRenderer.send("getAirplayDevice", "");
    setTimeout(() => {
      devices.cast = ipcRenderer.sendSync("getKnownCastDevices");
      devices.airplay = ipcRenderer.sendSync("getKnownAirplayDevices");
      scanning = false;
    }, 2000);
    console.log(devices);
    // vm.$forceUpdate();
  };

  const setCast = (device) => {
    CiderAudio.sendAudio();
    activeCasts.push(device);
    ipcRenderer.send("performGCCast", device, "Cider", "Playing ...", "Test build", "");
  };

  const setAirPlayCast = (device) => {
    if (
      !activeCasts.some((item) => {
        return item.host === device.host && item.name === device.name && item.port === device.port;
      })
    ) {
      activeCasts.push(device);
      ipcRenderer.send("performAirplayPCM", device.host, device.port, null, "", "", "", "", device.txt, device.airplay2, false);
    }
  };

  const disconnectAirPlayCast = (device) => {
    app.confirm("Do you want to disconnect device?", (res) => {
      if (res) {
        ipcRenderer.send("disconnectAirplay", device.host + ":" + device.port + "ap");
        console.log("disconnectAirplay", device.host + ":" + device.port + "ap");
        let idx = activeCasts.findIndex((a) => {
          return a.host === device.host && a.port === device.port;
        });
        console.log(idx);
        if (idx !== -1) {
          delete activeCasts[idx];
          delete this.$root.activeCasts[idx];
          activeCasts = activeCasts.filter((a) => {
            return !(a.host === device.host && a.port === device.port);
          });
          console.log(activeCasts);
          if (activeCasts.length === 0) {
            stopCasting();
          }
        }
      }
    });
  };
  const stopCasting = () => {
    CiderAudio.stopAudio();
    ipcRenderer.send("disconnectAirplay", "");
    ipcRenderer.send("stopGCast", "");
    activeCasts = [];
    // vm.$forceUpdate();
  };

  return (
    <div id="castmenu">
      <div
        className="spatialproperties-panel castmenu modal-fullscreen"
        clickself={close()}
        contextmenuself={close()}>
        <div className="modal-window">
          <div className="modal-header">
            <div className="modal-title">{$root.getLz("action.cast.todevices")}</div>
            <button
              className="close-btn"
              onClick={() => close()}
              aria-label={$root.getLz("action.close")}
            />
          </div>
          <div
            className="modal-content"
            style={{ overflowY: "overlay", padding: "3%" }}>
            <div className="md-labeltext">{$root.getLz("action.cast.chromecast")}</div>
            <div
              className="md-option-container"
              style={{ marginTop: "12px", marginBottom: "12px", overflowY: "scroll" }}>
              <template v-if={!scanning}>
                {devices.cast.map((device) => <template>
                  <div
                    className="md-option-line"
                    style={{ cursor: "pointer" }}
                    onClick={() => setCast(device)}>
                    <div className="md-option-segment">
                      {device.name}
                      <br />
                      <small>{device.host}</small>
                    </div>
                    <div
                      className="md-option-segment_auto"
                      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                      v-if={activeCasts.includes(device)}>
                      Connected
                    </div>
                    <div
                      className="md-option-segment_auto"
                      v-else
                      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 34 34"
                        fill="#fff"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xml:space="preserve"
                        className="castPlayIndicator">
                        <path
                          d="M28.228,18.327l-16.023,8.983c-0.99,0.555 -2.205,-0.17 -2.205,-1.318l0,-17.984c0,-1.146 1.215,-1.873 2.205,-1.317l16.023,8.982c1.029,0.577 1.029,2.077 0,2.654Z"
                          style={{ fillRule: "nonzero" }}
                        />
                      </svg>
                    </div>
                  </div>
                </template>)}
              </template>
              <template v-else>
                <div
                  className="md-option-line"
                  style={{ cursor: pointer }}>
                  <div className="md-option-segment">{$root.getLz("action.cast.scanning")}</div>
                </div>
              </template>
            </div>
            <div className="md-labeltext">{$root.getLz("action.cast.airplay")}</div>
            <div
              className="md-option-container"
              style={{ marginTop: "12px", marginBottom: "12px", overflowY: "scroll" }}>
              <div className="md-option-line">
                <div className="md-option-segment">
                  Supports AirPlay 1 & AirPlay 2. Please set your device access in the Home app to "Everyone" or "Anyone on the same network".
                  {/* {$root.getLz('action.cast.airplay.underdevelopment')}  */}
                  {devices.airplay.map((device) =><template>
                    <div
                      className="md-option-line"
                      style={{ cursor: pointer }}
                      onClick={() => setAirPlayCast(device)}>
                      <div className="md-option-segment">
                        {device.name}
                        <br />
                        <small>{device.host}</small>
                      </div>
                      <div
                        className="md-option-segment_auto"
                        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        onClick={() => disconnectAirPlayCast(device)}
                        v-if={activeCasts.some((item) => {
                          return item.host === device.host && item.name === device.name && item.port === device.port;
                        })}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          xmlns:xlink="http://www.w3.org/1999/xlink"
                          width="20px"
                          height="20px"
                          viewBox="0 0 20 20"
                          version="1.1">
                          <g id="surface1">
                            <path
                              style={{ stroke: "none", fillRule: "evenodd", fill: "#fff", fillOpacity: 1 }}
                              d="M 10 0 C 15.523438 0 20 4.476562 20 10 C 20 15.523438 15.523438 20 10 20 C 4.476562 20 0 15.523438 0 10 C 0 4.476562 4.476562 0 10 0 Z M 12.136719 5.988281 C 12.421875 5.703125 12.597656 5.472656 12.953125 5.828125 L 14.089844 6.988281 C 14.464844 7.355469 14.445312 7.570312 14.089844 7.914062 L 11.933594 10.0625 L 14.011719 12.136719 C 14.296875 12.421875 14.527344 12.597656 14.171875 12.953125 L 13.011719 14.089844 C 12.644531 14.464844 12.429688 14.445312 12.089844 14.089844 L 10 12 L 7.914062 14.082031 C 7.574219 14.433594 7.359375 14.453125 6.992188 14.082031 L 5.828125 12.945312 C 5.472656 12.59375 5.703125 12.417969 5.992188 12.128906 L 8.066406 10.0625 L 5.917969 7.917969 C 5.566406 7.574219 5.546875 7.359375 5.917969 6.992188 L 7.054688 5.828125 C 7.40625 5.472656 7.582031 5.703125 7.871094 5.992188 L 10 8.128906 Z M 12.136719 5.988281 "
                            />
                          </g>
                        </svg>
                      </div>
                      <div
                        className="md-option-segment_auto"
                        v-else
                        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 34 34"
                          fill="#fff"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          xml:space="preserve"
                          className="castPlayIndicator">
                          <path
                            d="M28.228,18.327l-16.023,8.983c-0.99,0.555 -2.205,-0.17 -2.205,-1.318l0,-17.984c0,-1.146 1.215,-1.873 2.205,-1.317l16.023,8.982c1.029,0.577 1.029,2.077 0,2.654Z"
                            style={{ fillRule: "nonzero" }}
                          />
                        </svg>
                      </div>
                    </div>
                  </template>)}
                </div>
              </div>
            </div>
          </div>
          <div className="md-footer">
            <div className="row">
              <div
                className="col"
                v-if={activeCasts.length !== 0}>
                <button
                  style={{ width: "100%" }}
                  onClick={() => stopCasting()}
                  className="md-btn md-btn-block md-btn-primary">
                  {$root.getLz("action.cast.stop")}
                </button>
              </div>
              <div className="col">
                <button
                  style={{ width: "100%" }}
                  className="md-btn md-btn-block"
                  onClick={() => scan()}>
                  {$root.getLz("action.cast.scan")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
