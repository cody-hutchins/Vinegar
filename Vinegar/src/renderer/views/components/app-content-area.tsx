import { AnimatePresence, motion } from "framer-motion";

const AppContentArea = () => {
  const scrollPos = 0;
  return (
    <>
      <div id={"app-content-area"}>
        <div
          id={"app-content"}
          scrollpos={$root.chrome.contentScrollPosY}
          scrollaxis={"y"}
          style={{ overflow: $root.chrome.contentAreaScrolling ? "" : "hidden" }}>
          {$root.getThemeDirective("appNavigation") === "seperate" && (
            <div id={"navigation-bar"}>
              <button
                className={"nav-item"}
                onClick={() => $root.navigateBack()}>
                {import("../svg/chevron-left.svg")}
              </button>
              <button
                className={"nav-item"}
                onClick={() => $root.navigateForward()}>
                {import("../svg/chevron-right.svg")}
              </button>
            </div>
          )}
          {/**/}
          <AnimatePresence>
            {Object.keys(process.env.appRoutes).map((appRoute) => (
              <motion.div
                v-onenter={appRoute.onEnter}
                name={$root.chrome.desiredPageTransition}>
                {appRoute.condition && <template>{appRoute.component}</template>}
              </motion.div>
            ))}
            {/*  */}
            <motion.div
              name={$root.chrome.desiredPageTransition}
              v-on:enter={$root.getMadeForYou()}>
              {$root.page === "library-madeforyou" && <template>{import("../pages/madeforyou.jsx")}</template>}
            </motion.div>
          </AnimatePresence>
          {/**/}
        </div>
      </div>
    </>
  );
};

export default AppContentArea;
