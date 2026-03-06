import { AnimatePresence, motion } from "framer-motion";

const AppContentArea = () => {
  const scrollPos = 0;
  return (
    <div id="app-content-area">
      <div
        id="app-content"
        scrollpos={$root.chrome.contentScrollPosY}
        scrollaxis="y"
        style={{ overflow: $root.chrome.contentAreaScrolling ? "" : "hidden" }}>
        <div
          id="navigation-bar"
          v-if={$root.getThemeDirective("appNavigation") === "seperate"}>
          <button
            className="nav-item"
            onClick={() => $root.navigateBack()}>
            {import("../svg/chevron-left.svg")}
          </button>
          <button
            className="nav-item"
            onClick={() => $root.navigateForward()}>
            {import("../svg/chevron-right.svg")}
          </button>
        </div>

        {/* <!-- Include App Routes --> */}
        <AnimatePresence>
        {Object.keys(process.env.appRoutes).map((appRoute) => (
          <motion.div
            v-onenter={appRoute.onEnter}
            name={$root.chrome.desiredPageTransition}>
            <template v-if={appRoute.condition}>{appRoute.component}</template>
          </motion.div>
        ))}
        {/* <!-- Library - Made For You --> */}
        <motion.div
          name={$root.chrome.desiredPageTransition}
          v-on:enter={$root.getMadeForYou()}>
          <template v-if={$root.page === "library-madeforyou"}>{import("../pages/madeforyou.jsx")}</template>
        </motion.div>
        </AnimatePresence>
        {/* <!-- Library - Artists--> */}
      </div>
    </div>
  );
};

export default AppContentArea;
