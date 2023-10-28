import messages from "@intlify/unplugin-vue-i18n/messages";
import { createApp, type DirectiveBinding } from "vue";
// import { VueFire, VueFireAuth } from "vuefire";
import { useMotion } from "@vueuse/motion";
// import { FireApp } from "./utils/firebase";
import { createI18n } from "vue-i18n";
import "vue3-lottie/dist/style.css";
import router from "./router";
import App from "./App.vue";
import "./assets/main.css";

const locale = localStorage.getItem("locale");

const DEFAULT_DATE_TIME_FORMAT = {
  short: {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  monthOnly: {
    month: "long",
  },
  long: {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  },
};

const datetimeFormats = {
  "en-US": DEFAULT_DATE_TIME_FORMAT,
  "fr-FR": DEFAULT_DATE_TIME_FORMAT,
  "ar-AE": DEFAULT_DATE_TIME_FORMAT,
  "de-DE": DEFAULT_DATE_TIME_FORMAT,
};

const initiVueApp = () => {
  // create app
  createApp(App)
    // .use(VueFire, {
    //   firebaseApp: FireApp,
    //   modules: [VueFireAuth()],
    // })
    .directive("slide", {
      mounted: (el: HTMLElement, bin: DirectiveBinding) => {
        useMotion(el, {
          initial: {
            opacity: 0,
            x: 20,
          },
          enter: {
            opacity: 1,
            x: 0,
            transition: {
              delay: (bin.value + 1) * 100,
            },
          },
        });
      },
    })
    .directive("fade", {
      mounted: (el: HTMLElement, bin: DirectiveBinding) => {
        useMotion(el, {
          initial: {
            opacity: 0,
          },
          enter: {
            opacity: 1,
            transition: {
              delay: (bin.value + 1) * 100,
            },
          },
        });
      },
    })
    .use(router)
    .use(
      createI18n({
        legacy: false,
        globalInjection: false,
        locale: locale ? JSON.parse(locale).key : "en-US",
        fallbackLocale: "en-US",
        availableLocales: ["en-US", "fr-FR", "ar-AE", "de-DE"],
        messages: messages,
        // @ts-ignore
        datetimeFormats,
      })
    )
    .mount("#app");
};

initiVueApp();
