export const Component = () => {
  Vue.component("audiolabs-page", {
    template: "#audiolabs-page",
    props: [],
    data: function () {
      return {
        app: this.$root,
        arprofiles: CiderAudio.atmosphereRealizerProfiles,
        spprofiles: CiderAudio.spatialProfiles,
        ciderPPE: [
          { name: "MAIKIWI", displayName: "Maikiwi " + app.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.adaptive") },
          { name: "MAIKIWI_LEGACY", displayName: "Maikiwi " + app.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.legacy") },
          { name: "NATURAL", displayName: app.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.standard") },
          { name: "LEGACY", displayName: app.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.legacy") },
        ],
      };
    },
    mounted: function () {
      return {
        ciderPPE: [
          { name: "MAIKIWI", displayName: "Maikiwi " + app.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.adaptive") },
          { name: "MAIKIWI_LEGACY", displayName: "Maikiwi " + app.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.legacy") },
          { name: "NATURAL", displayName: app.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.standard") },
          { name: "LEGACY", displayName: app.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.legacy") },
        ],
      };
    },
    methods: {},
  });
  return (
    <div id="audiolabs-page">
      <div className="audiolabs-page">
        <div className="md-option-container">
          <div className="settings-option-body">
            <div className="md-option-line">
              <b-jumbotron
                header="$root.getLz('settings.option.audio.audioLab')"
                lead="Designed by Cider Acoustic Technologies in California"></b-jumbotron>
            </div>
            <div className="md-option-line">
              <div className="md-option-segment">
                {$root.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPE")}
                <br />
                <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPE.description")}</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <input
                  type="checkbox"
                  v-model="app.cfg.audio.maikiwiAudio.ciderPPE"
                  v-on:change="CiderAudio.hierarchical_loading();"
                  switch
                />
              </div>
            </div>
            <div
              className="md-option-line"
              v-show="app.cfg.audio.maikiwiAudio.ciderPPE === true">
              <div className="md-option-segment">
                {$root.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength")}
                <br />
                <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.description")}</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <select
                  className="md-select"
                  style="width:180px;"
                  v-model="app.cfg.audio.maikiwiAudio.ciderPPE_value"
                  v-on:change="CiderAudio.hierarchical_loading()">
                  <option
                    v-for="(item, index) in ciderPPE"
                    value="item.name"
                    key="index.name">
                    {item.displayName}
                  </option>
                </select>
              </div>
            </div>
            <div className="md-option-line">
              <div className="md-option-segment">
                Cider Opportunistic Correction System
                <br />
                <small>Takes advantage of the sonic characteristics of a specific equipment and adapts it to be more 'Cider' oriented.</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <select
                  className="md-select"
                  style="width:180px;"
                  v-model="app.cfg.audio.maikiwiAudio.opportunisticCorrection_state"
                  v-on:change="CiderAudio.hierarchical_loading()">
                  <option value="OFF">OFF</option>
                  <option value="CHU">Moondrop Chu</option>
                </select>
              </div>
            </div>
            <div className="md-option-line">
              <div className="md-option-segment">
                {$root.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizer")} [1]
                <br />
                <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizer.description")}</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <input
                  type="checkbox"
                  v-model="app.cfg.audio.maikiwiAudio.atmosphereRealizer1"
                  v-on:change="CiderAudio.hierarchical_loading();"
                  switch
                />
              </div>
            </div>
            <div
              className="md-option-line"
              v-show="app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true">
              <div className="md-option-segment">
                {$root.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode")} [1]
                <br />
                <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.description")}</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <select
                  className="md-select"
                  style="width:230px;"
                  v-model="$root.cfg.audio.maikiwiAudio.atmosphereRealizer1_value"
                  v-on:change="CiderAudio.hierarchical_loading();">
                  <option
                    v-for="profile in arprofiles"
                    value="profile.id">
                    {$root.getProfileLz("CAR", profile.id)}
                  </option>
                </select>
              </div>
            </div>
            <div className="md-option-line">
              <div className="md-option-segment">
                {$root.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizer")} [2]
                <br />
                <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizer.description")}</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <input
                  type="checkbox"
                  v-model="app.cfg.audio.maikiwiAudio.atmosphereRealizer2"
                  v-on:change="CiderAudio.hierarchical_loading();"
                  switch
                />
              </div>
            </div>
            <div
              className="md-option-line"
              v-show="app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true">
              <div className="md-option-segment">
                {$root.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode")} [2]
                <br />
                <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.description")}</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <select
                  className="md-select"
                  style="width:230px;"
                  v-model="$root.cfg.audio.maikiwiAudio.atmosphereRealizer2_value"
                  v-on:change="CiderAudio.hierarchical_loading();">
                  <option
                    v-for="profile in arprofiles"
                    value="profile.id">
                    {$root.getProfileLz("CAR", profile.id)}
                  </option>
                </select>
              </div>
            </div>
            <div className="md-option-line">
              <div className="md-option-segment">
                {$root.getLz("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization")}
                <br />
                <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.description")}</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <input
                  type="checkbox"
                  v-model="app.cfg.audio.maikiwiAudio.spatial"
                  v-on:change="CiderAudio.hierarchical_loading();"
                  switch
                />
              </div>
            </div>
            <div
              className="md-option-line"
              v-show="app.cfg.audio.maikiwiAudio.spatial === true">
              <div className="md-option-segment">
                {$root.getLz("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile")}
                <br />
                <small>{$root.getLz("settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.description")}</small>
              </div>
              <div className="md-option-segment md-option-segment_auto">
                <select
                  className="md-select"
                  style="width:180px;"
                  v-model="$root.cfg.audio.maikiwiAudio.spatialProfile"
                  v-on:change="CiderAudio.hierarchical_loading();">
                  <option
                    v-for="profile in spprofiles"
                    value="profile.id">
                    {$root.getProfileLz("CTS", profile.name)}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
