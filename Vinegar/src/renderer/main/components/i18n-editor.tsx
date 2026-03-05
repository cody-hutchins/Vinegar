import { html } from "../html.js";
import bootbox from "bootbox";

export const i18nEditor = () => {
  let listing = ipcRenderer.sendSync("get-i18n-listing");
  let baseLz = ipcRenderer.sendSync("get-i18n", "en_US");

  function exportLz() {
    bootbox.alert(`<textarea spellcheck='false' style="width:100%;height: 300px;">${JSON.stringify(app.lz, true, " ")}</textarea>`);
    notyf.success("Copied to clipboard");
    navigator.clipboard.writeText(JSON.stringify(app.lz, true, " ")).then((r) => console.debug("Copied to clipboard."));
  }
  const getLanguages = () => {
    let langs = this.$root.lzListing;
    let categories = {
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
  }

  return (
    <div className="content-inner i18n-page">
      <div className="row nopadding">
        <div className="col nopadding">
          <h1>i18n Editor</h1>
        </div>
        <div className="col-auto nopadding selectCol">
          <select className="md-select" change="$root.setLz('');$root.setLzManual()" v-model="$root.cfg.general.language">
            {getLanguages().map((categories, index) => <optgroup label="index">
              {categories.map((lang) => <option value={lang.code}>{lang.nameNative} ({lang.nameEnglish})</option>)}
            </optgroup>)}
          </select>
          <button className="md-btn" onClick={exportLz}>Export</button>
        </div>
      </div>
      <hr />
      <div className="md-option-container">
        {baseLz.map((val, key) => <template>
          <div className="md-option-line" v-if="$root.lz[key]">
            <div className="md-option-segment">{key }</div>
            <div className="md-option-segment">
              <template v-if='typeof $root.lz[key] == "object"'>
                {$root.lz[key].map((variant, vkey) => <div>
                  {variant}
                  <input type="text" v-model="$root.lz[key][vkey]" />
                </div>)}
              </template>
              <textarea type="text" v-model="$root.lz[key]" v-else></textarea>
            </div>
          </div>
          <div className="md-option-line" v-else>
            <div className="md-option-segment">
              <b>{ key }</b>
            </div>
            <div className="md-option-segment">
              <textarea type="text" v-model="$root.lz[key]" placeholder="val"></textarea>
            </div>
          </div>
        </template>)}
      </div>
    </div>);
  };
export default i18nEditor;