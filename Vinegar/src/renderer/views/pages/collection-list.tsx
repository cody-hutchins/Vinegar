export const Component = () => {
  Vue.component("cider-collection-list", {
    template: "#cider-collection-list",
    props: {
      data: {
        type: Object,
        required: true,
      },
      title: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        required: false,
        default: "artists",
      },
    },
    data: function () {
      return {
        triggerEnabled: true,
        canSeeTrigger: false,
        showFab: false,
        commonKind: "song",
        api: this.$root.mk.api,
        loading: false,
        app: this.$root,
      };
    },
    methods: {
      getClasses() {
        if ((data?.data?.length ?? 0) > 0) {
          let item = data.data[0];
          if (typeof item.kind != "undefined") {
            commonKind = item.kind;
            return item.kind;
          }
          if (typeof item.attributes.playParams != "undefined") {
            commonKind = item.attributes.playParams.kind;
            return item.attributes.playParams.kind;
          }
          if (commonKind != "song") {
            return "collection-list-square";
          } else {
            return "";
          }
        } else {
          return "";
        }
      },
      getKind(item) {
        if (typeof item.kind != "undefined") {
          //  commonKind = item.kind;
          return item.kind;
        }
        if (typeof item.attributes.playParams != "undefined") {
          //  commonKind = item.attributes.playParams.kind
          return item.attributes.playParams.kind;
        }
        return commonKind;
      },
      scrollToTop() {
        let target = document.querySelector(".header-text");
        document.querySelector("#app-content").scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      },
      getNext() {
        if (typeof data.next == "undefined") {
          return;
        }
        loading = true;

        api.v3.music(data.next, app.collectionList.requestBody).then((response) => {
          console.log(response);
          if (!app.collectionList.response.groups) {
            data.data = data.data.concat(response.data.data);
            if (response.data.next) {
              data.next = response.data.next;
              triggerEnabled = true;
            }
            loading = false;
          } else {
            if (!response.data.results[app.collectionList.response.groups]) {
              loading = false;
              return;
            }
            data.data = data.data.concat(response.data.results[app.collectionList.response.groups].data);
            if (response.data.results[app.collectionList.response.groups].next) {
              data.next = response.data.results[app.collectionList.response.groups].next;
              triggerEnabled = true;
              loading = false;
            }
          }
        });
      },
      headerVisibility: function (isVisible, entry) {
        if (isVisible) {
          showFab = false;
        } else {
          showFab = true;
        }
      },
      visibilityChanged: function (isVisible, entry) {
        if (isVisible) {
          canSeeTrigger = true;
          getNext();
        } else {
          canSeeTrigger = false;
        }
      },
    },
  });
  return (
    <div id="cider-collection-list">
      <div className="content-inner collection-page">
        <h3
          className="header-text"
          v-observe-visibility="{callback: headerVisibility}">
          {title}
        </h3>
        <div
          v-if="data['data'] != 'null'"
          className="well itemContainer"
          className="getClasses()">
          <template v-for="(item, key) in data.data">
            <template v-if="item.type == 'artists'">
              <mediaitem-square item="item"></mediaitem-square>
            </template>
            <template v-else>
              <mediaitem-list-item
                v-if="getKind(item) == 'song'"
                index="key"
                item="item"></mediaitem-list-item>
              <mediaitem-square
                v-else
                item="item"
                type="getKind(item)"></mediaitem-square>
            </template>
          </template>
          <button
            v-if="triggerEnabled"
            style={{ opacity: 0, height: "32px" }}
            v-observe-visibility="{callback: visibilityChanged}">
            {app.getLz("term.showMore")}
          </button>
        </div>
        <transition name="fabfade">
          <button
            className="top-fab"
            v-show="showFab"
            onClick={() => scrollToTop()}
            aria-label="app.getLz('action.scrollToTop')">
            {import("../svg/arrow-up.svg")}
          </button>
        </transition>
        <div
          className="well itemContainer"
          v-show="loading">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};
