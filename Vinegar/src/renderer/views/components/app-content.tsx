export const AppContent = () => {
  Vue.component("app-content-area", {
    template: "#app-content-area",
    data: function () {
      return {
        scrollPos: 0,
      };
    },
    methods: {},
  });
  return (
    <div id="app-content-area">
      <div
        id="app-content"
        scrollpos="$root.chrome.contentScrollPosY"
        scrollaxis="y"
        style="{'overflow': ($root.chrome.contentAreaScrolling ? '' : 'hidden')}">
        <div
          id="navigation-bar"
          v-if="$root.getThemeDirective('appNavigation') == 'seperate'">
          <button
            className="nav-item"
            click="$root.navigateBack()">
            {import("../svg/chevron-left.svg")}
          </button>
          <button
            className="nav-item"
            click="$root.navigateForward()">
            {import("../svg/chevron-right.svg")}
          </button>
        </div>

        {/* <!-- Include App Routes --> */}
        {Object.keys(process.env.appRoutes).map((appRoute) => (
          <transition
            v-onenter={appRoute.onEnter}
            name="$root.chrome.desiredPageTransition">
            <template v-if={appRoute.condition}>env.appRoutes[i].component;</template>
          </transition>
        ))}
        {/* <!-- Library - Made For You --> */}
        <transition
          name="$root.chrome.desiredPageTransition"
          v-on:enter="$root.getMadeForYou()">
          <template v-if="$root.page == 'library-madeforyou'">{import("../pages/madeforyou")}</template>
        </transition>
        {/* <!-- Library - Artists--> */}
      </div>
    </div>
  );
};
