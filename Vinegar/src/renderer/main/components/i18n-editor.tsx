import { Col, Row } from "react-bootstrap";
import { html } from "../html.js";
import bootbox from "bootbox";

export const i18nEditor = () => {
  const listing = ipcRenderer.sendSync("get-i18n-listing");
  const baseLz = ipcRenderer.sendSync("get-i18n", "en_US");

  function exportLz() {
    bootbox.alert(`<textarea spellcheck='false' style="width:100%;height: 300px;">${JSON.stringify(app.lz, true, " ")}</textarea>`);
    notyf.success("Copied to clipboard");
    navigator.clipboard.writeText(JSON.stringify(app.lz, true, " ")).then((r) => console.debug("Copied to clipboard."));
  }
  const getLanguages = () => {
    const langs = this.$root.lzListing;
    const categories = {
      main: [],
      fun: [],
      unsorted: [],
    };
    // sort by category if category is undefined or empty put it in "unsorted"
    for (let i = 0; i < langs.length; i++) {
      if (langs[i].category === undefined || langs[i].category === "") {
        categories.unsorted.push(langs[i]);
      } else {
        categories[langs[i].category].push(langs[i]);
      }
    }
    // return
    return categories;
  };

  return (
    <div className={"content-inner i18n-page"}>
      <Row className={"row nopadding"}>
        <Col className={"nopadding"}>
          <h1>i18n Editor</h1>
        </Col>
        <Col
          auto
          className={"nopadding selectCol"}>
          <select
            className={"md-select"}
            onChange={() => {
              $root.setLz("");
              $root.setLzManual();
            }}
            v-model={"$root.cfg.general.language"}>
            {getLanguages().map((categories, index) => (
              <optgroup
                label={index}
                key={index}>
                {categories.map((lang) => (
                  <option
                    value={lang.code}
                    key={lang.code}>
                    {lang.nameNative} ({lang.nameEnglish})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            className={"md-btn"}
            onClick={exportLz}>
            Export
          </button>
        </Col>
      </Row>
      <hr />
      <div className={"md-option-container"}>
        {baseLz.map((val, key) => (
          <div key={key}>
            {$root.lz[key] ? (
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>{key}</div>
                <div className={"md-option-segment"}>
                  {typeof $root.lz[key] === "object" ? (
                    <template>
                      {$root.lz[key].map((variant, vkey) => (
                        <div key={vkey}>
                          {variant}
                          <input
                            type={"text"}
                            v-model={"$root.lz[key][vkey]"}
                          />
                        </div>
                      ))}
                    </template>
                  ) : (
                    <textarea
                      type={"text"}
                      v-model={"$root.lz[key]"}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className={"md-option-line"}>
                <div className={"md-option-segment"}>
                  <b>{key}</b>
                </div>
                <div className={"md-option-segment"}>
                  <textarea
                    type={"text"}
                    v-model={"$root.lz[key]"}
                    placeholder={"val"}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default i18nEditor;
