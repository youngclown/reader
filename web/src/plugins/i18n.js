import Vue from "vue";
import ElementLocale from "element-ui/lib/locale";
import elementEn from "element-ui/lib/locale/lang/en";
import elementKo from "element-ui/lib/locale/lang/ko";
import elementZh from "element-ui/lib/locale/lang/zh-CN";
import { messages, localeOptions, normalizeLocale } from "../locales";

const STORAGE_KEY = "reader_locale";
const backendErrorKeys = {
  本地书籍源文件不存在: "localBookSourceFileMissing",
  本地源书籍文件不存在: "localSourceBookFileMissing",
  章节不存在: "chapterNotFound",
  本地书仓书籍不存在: "localStoreBookMissing",
  webdav书仓书籍不存在: "webdavStoreBookMissing",
  书籍不存在: "bookNotFound",
  上传书籍不存在: "uploadedBookMissing",
  导入本地书籍失败: "importLocalBookFailed",
  导入本地Epub书籍失败: "importLocalEpubFailed",
  导入本地CBZ书籍失败: "importLocalCbzFailed",
  书架书籍不存在: "shelfBookMissing",
  路径不存在: "pathNotFound",
  未开启webdav功能: "webdavDisabled",
  未开启本地书仓功能: "localStoreDisabled",
  获取书籍信息失败: "bookInfoLoadFailed",
  获取章节链接失败: "chapterUrlLoadFailed",
  获取章节信息失败: "chapterInfoLoadFailed",
  Epub书籍解压失败: "epubExtractFailed",
  章节文件不存在: "chapterFileMissing",
  获取章节内容失败: "chapterContentLoadFailed"
};
const elementLocales = {
  zh: {
    ...elementZh,
    el: {
      ...elementZh.el,
      pagination: {
        ...elementZh.el.pagination,
        total: "共 {total} 条",
        pagesize: "条/页",
        goto: "前往",
        pageClassifier: "页"
      },
      select: {
        ...elementZh.el.select,
        noData: "暂无数据",
        noMatch: "无匹配数据",
        loading: "加载中"
      },
      cascader: {
        ...elementZh.el.cascader,
        noData: "暂无数据",
        noMatch: "无匹配数据",
        loading: "加载中"
      },
      table: {
        ...elementZh.el.table,
        emptyText: "暂无数据"
      },
      tree: {
        ...elementZh.el.tree,
        emptyText: "暂无数据"
      },
      transfer: {
        ...elementZh.el.transfer,
        noData: "暂无数据",
        noMatch: "无匹配数据"
      },
      empty: {
        ...elementZh.el.empty,
        description: "暂无数据"
      }
    }
  },
  ko: {
    ...elementKo,
    el: {
      ...elementKo.el,
      pagination: {
        ...elementKo.el.pagination,
        total: "총 {total}개",
        pagesize: "개/페이지",
        goto: "이동",
        pageClassifier: "페이지"
      },
      select: {
        ...elementKo.el.select,
        noData: "데이터가 없습니다",
        noMatch: "일치하는 데이터가 없습니다",
        loading: "불러오는 중"
      },
      cascader: {
        ...elementKo.el.cascader,
        noData: "데이터가 없습니다",
        noMatch: "일치하는 데이터가 없습니다",
        loading: "불러오는 중"
      },
      table: {
        ...elementKo.el.table,
        emptyText: "데이터가 없습니다"
      },
      tree: {
        ...elementKo.el.tree,
        emptyText: "데이터가 없습니다"
      },
      transfer: {
        ...elementKo.el.transfer,
        noData: "데이터가 없습니다",
        noMatch: "일치하는 데이터가 없습니다"
      },
      empty: {
        ...elementKo.el.empty,
        description: "데이터가 없습니다"
      }
    }
  },
  en: {
    ...elementEn,
    el: {
      ...elementEn.el,
      pagination: {
        ...elementEn.el.pagination,
        total: "Total {total}",
        pagesize: "items/page",
        goto: "Go to",
        pageClassifier: ""
      },
      select: {
        ...elementEn.el.select,
        noData: "No data",
        noMatch: "No matching data",
        loading: "Loading"
      },
      cascader: {
        ...elementEn.el.cascader,
        noData: "No data",
        noMatch: "No matching data",
        loading: "Loading"
      },
      table: {
        ...elementEn.el.table,
        emptyText: "No data"
      },
      tree: {
        ...elementEn.el.tree,
        emptyText: "No data"
      },
      transfer: {
        ...elementEn.el.transfer,
        noData: "No data",
        noMatch: "No matching data"
      },
      empty: {
        ...elementEn.el.empty,
        description: "No data"
      }
    }
  }
};

const state = Vue.observable({
  locale: normalizeLocale(localStorage.getItem(STORAGE_KEY) || "en")
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
  ElementLocale.use(elementLocales[nextLocale] || elementLocales.zh);
  localStorage.setItem(STORAGE_KEY, nextLocale);
  document.documentElement.setAttribute("lang", nextLocale);
}

export function t(key, params) {
  const table = messages[state.locale] || messages.zh;
  const fallback = messages.zh;
  const message = readPath(table, key) || readPath(fallback, key) || key;
  return format(message, params);
}

export function translateBackendMessage(message) {
  if (!message || typeof message !== "string") return message;
  const key = backendErrorKeys[message];
  return key ? t("backendErrors." + key) : message;
}

ElementLocale.use(elementLocales[state.locale] || elementLocales.zh);
document.documentElement.setAttribute("lang", state.locale);

Vue.prototype.$i18n = state;
Vue.prototype.$localeOptions = localeOptions;
Vue.prototype.$setLocale = setLocale;
Vue.prototype.$t = t;
