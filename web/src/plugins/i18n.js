import Vue from "vue";
import { messages, localeOptions, normalizeLocale } from "../locales";

const STORAGE_KEY = "reader_locale";

const state = Vue.observable({
  locale: normalizeLocale(localStorage.getItem(STORAGE_KEY) || "zh")
});

function readPath(obj, path) {
  return path.split(".").reduce((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return current[key];
  }, obj);
}

function format(message, params) {
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(params, key)
      ? params[key]
      : match;
  });
}

export function setLocale(locale) {
  const nextLocale = normalizeLocale(locale);
  state.locale = nextLocale;
  localStorage.setItem(STORAGE_KEY, nextLocale);
  document.documentElement.setAttribute("lang", nextLocale);
}

export function t(key, params) {
  const table = messages[state.locale] || messages.zh;
  const fallback = messages.zh;
  const message = readPath(table, key) || readPath(fallback, key) || key;
  return format(message, params);
}

document.documentElement.setAttribute("lang", state.locale);

Vue.prototype.$i18n = state;
Vue.prototype.$localeOptions = localeOptions;
Vue.prototype.$setLocale = setLocale;
Vue.prototype.$t = t;
