import body_0 from "../assets/imgs/themes/body_0.png";
import content_0 from "../assets/imgs/themes/content_0.png";
import popup_0 from "../assets/imgs/themes/popup_0.png";
import body_1 from "../assets/imgs/themes/body_1.png";
import content_1 from "../assets/imgs/themes/content_1.png";
import popup_1 from "../assets/imgs/themes/popup_1.png";
import body_2 from "../assets/imgs/themes/body_2.png";
import content_2 from "../assets/imgs/themes/content_2.png";
import popup_2 from "../assets/imgs/themes/popup_2.png";
import body_3 from "../assets/imgs/themes/body_3.png";
import content_3 from "../assets/imgs/themes/content_3.png";
import popup_3 from "../assets/imgs/themes/popup_3.png";
import body_5 from "../assets/imgs/themes/body_5.png";
import content_5 from "../assets/imgs/themes/content_5.png";
import popup_5 from "../assets/imgs/themes/popup_5.png";
import body_6 from "../assets/imgs/themes/body_6.png";
import content_6 from "../assets/imgs/themes/content_6.png";
// import popup_6 from "../assets/imgs/themes/popup_6.png";

export const legacyConfigValueMap = {
  "\u767d\u5929\u9ed8\u8ba4": "dayDefault",
  "\u9ed1\u591c\u9ed8\u8ba4": "nightDefault",
  "\u5185\u7f6e\u767d\u5929": "builtInDay",
  "\u5185\u7f6e\u9ed1\u591c": "builtInNight",
  "\u7b80\u4f53": "simplified",
  "\u7e41\u4f53": "traditional",
  "\u4e0a\u4e0b\u6ed1\u52a8": "verticalSwipe",
  "\u5de6\u53f3\u6ed1\u52a8": "horizontalSwipe",
  "\u4e0a\u4e0b\u6eda\u52a8": "verticalScroll",
  "\u4e0a\u4e0b\u6eda\u52a82": "verticalScroll2",
  "\u4e0b\u4e00\u9875": "nextPage",
  "\u81ea\u52a8": "auto",
  "\u4e0d\u7ffb\u9875": "noTurn",
  "\u64cd\u4f5c\u5f39\u7a97": "actionPopup",
  "\u8fc7\u6ee4\u5f39\u7a97": "actionPopup",
  "\u5ffd\u7565": "ignore",
  "\u81ea\u9002\u5e94": "adaptive",
  "\u624b\u673a\u6a21\u5f0f": "mobileMode",
  "\u50cf\u7d20\u6eda\u52a8": "pixelScroll",
  "\u6bb5\u843d\u6eda\u52a8": "paragraphScroll",
  "\u6b63\u5e38": "normal"
};

export const normalizeConfigValue = value => legacyConfigValueMap[value] || value;

export const legacyBgMap = {
  "bg/\u5c71\u6c34\u753b.jpg": "bg/landscape-painting.jpg",
  "bg/\u5c71\u6c34\u58a8\u5f71.jpg": "bg/ink-landscape.jpg",
  "bg/\u7f8a\u76ae\u7eb81.jpg": "bg/parchment-1.jpg",
  "bg/\u62a4\u773c\u6f2b\u7eff.jpg": "bg/eye-care-green.jpg",
  "bg/\u7f8a\u76ae\u7eb82.jpg": "bg/parchment-2.jpg",
  "bg/\u65b0\u7f8a\u76ae\u7eb8.jpg": "bg/new-parchment.jpg",
  "bg/\u7f8a\u76ae\u7eb83.jpg": "bg/parchment-3.jpg",
  "bg/\u660e\u5a9a\u503e\u57ce.jpg": "bg/bright-city.jpg",
  "bg/\u7f8a\u76ae\u7eb84.jpg": "bg/parchment-4.jpg",
  "bg/\u6df1\u5bab\u9b45\u5f71.jpg": "bg/palace-shadow.jpg",
  "bg/\u5348\u540e\u6c99\u6ee9.jpg": "bg/afternoon-beach.jpg",
  "bg/\u6e05\u65b0\u65f6\u5149.jpg": "bg/fresh-time.jpg",
  "bg/\u5b81\u9759\u591c\u8272.jpg": "bg/quiet-night.jpg",
  "bg/\u8fb9\u5f69\u753b\u5e03.jpg": "bg/color-edge-canvas.jpg"
};

export const normalizeConfigValues = config => {
  if (!config) {
    return config;
  }
  const normalized = { ...config };
  [
    "configDefaultType",
    "name",
    "chineseFont",
    "readMethod",
    "clickMethod",
    "autoReadingMethod",
    "pageMode",
    "selectionAction",
    "customConfig",
    "pageType"
  ].forEach(field => {
    if (typeof normalized[field] !== "undefined") {
      normalized[field] = normalizeConfigValue(normalized[field]);
    }
  });
  if (normalized.contentBGImg) {
    normalized.contentBGImg =
      legacyBgMap[normalized.contentBGImg] || normalized.contentBGImg;
  }
  return normalized;
};

export const normalizeCustomConfigList = list =>
  (list || []).map(config => normalizeConfigValues(config));

const defaultDayConfig = {
  configDefaultType: "dayDefault",
  name: "builtInDay",
  theme: 0,
  font: 0,
  chineseFont: "simplified",
  fontSize: 18,
  fontWeight: 400,
  fontColor: "#262626",
  bodyColor: "#eadfca",
  contentColor: "#fff",
  popupColor: "#ede7da",
  themeType: "day",
  readMethod: "verticalSwipe",
  clickMethod: "auto",
  animateMSTime: 300,
  readWidth: 800,
  lineHeight: 1.8,
  paragraphSpace: 0.2,
  autoReadingMethod: "pixelScroll",
  autoReadingPixel: 1,
  autoReadingLineTime: 1000,
  pageMode: "adaptive",
  selectionAction: "actionPopup"
};
const defaultNightConfig = {
  configDefaultType: "nightDefault",
  name: "builtInNight",
  theme: 6,
  font: 0,
  chineseFont: "simplified",
  fontSize: 18,
  fontWeight: 400,
  fontColor: "#666666",
  bodyColor: "#121212",
  contentColor: "#171717",
  popupColor: "#121212",
  themeType: "night",
  readMethod: "verticalSwipe",
  clickMethod: "auto",
  animateMSTime: 300,
  readWidth: 800,
  lineHeight: 1.8,
  paragraphSpace: 0.2,
  autoReadingMethod: "pixelScroll",
  autoReadingPixel: 1,
  autoReadingLineTime: 1000,
  pageMode: "adaptive",
  selectionAction: "actionPopup"
};

const defaultLocale =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("reader_locale") || "en"
    : "en";

const settings = {
  shelfConfig: {
    showBookGroup: -1
  },
  searchConfig: {
    searchType: "multi",
    bookSourceGroup: "",
    bookSourceUrl: "",
    concurrentCount: 24
  },
  customConfigList: [defaultDayConfig, defaultNightConfig],
  config: {
    ...defaultDayConfig,
    locale: defaultLocale,
    customConfig: "builtInDay",
    autoTheme: true,
    pageType: "normal"
  },
  speechVoiceConfig: {
    voiceName: "",
    speechRate: 1,
    speechPitch: 1
  },
  defaultNightTheme: 6,
  themes: [
    {
      body: "url(" + body_0 + ") repeat",
      content: "url(" + content_0 + ") repeat",
      popup: "url(" + popup_0 + ") repeat"
    },
    {
      body: "url(" + body_1 + ") repeat",
      content: "url(" + content_1 + ") repeat",
      popup: "url(" + popup_1 + ") repeat"
    },
    {
      body: "url(" + body_2 + ") repeat",
      content: "url(" + content_2 + ") repeat",
      popup: "url(" + popup_2 + ") repeat"
    },
    {
      body: "url(" + body_3 + ") repeat",
      content: "url(" + content_3 + ") repeat",
      popup: "url(" + popup_3 + ") repeat"
    },
    {
      body: "#ebcece repeat",
      content: "#f5e4e4 repeat",
      popup: "#faeceb repeat"
    },
    {
      body: "url(" + body_5 + ") repeat",
      content: "url(" + content_5 + ") repeat",
      popup: "url(" + popup_5 + ") repeat"
    },
    {
      body: "url(" + body_6 + ") repeat",
      content: "url(" + content_6 + ") repeat",
      popup: "#121212"
    },
    {
      body: "#f7f7f7 repeat",
      content: "#fff repeat",
      popup: "#f7f7f7 repeat"
    }
  ],
  fonts: [
    {
      fontFamily: "custom-system"
    },
    {
      // fontFamily:
      //   '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif'
      fontFamily: "custom-ht, reader-ht"
    },
    {
      // fontFamily:
      // 'Baskerville, Georgia, "Liberation Serif", "Kaiti SC", STKaiti, "AR PL UKai CN", "AR PL UKai HK", "AR PL UKai TW", "AR PL UKai TW MBE", "AR PL KaitiM GB", KaiTi, KaiTi_GB2312, DFKai-SB, "TW-Kai", serif',
      fontFamily: "custom-kt, reader-kt"
      // fontFamily: "STKaiti",
      // "-fx-font-family": "STKaiti"
    },
    {
      // fontFamily:
      // 'Georgia, "Nimbus Roman No9 L", "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif CN", STSong, "AR PL New Sung", "AR PL SungtiL GB", NSimSun, SimSun, "TW-Sung", "WenQuanYi Bitmap Song", "AR PL UMing CN", "AR PL UMing HK", "AR PL UMing TW", "AR PL UMing TW MBE", PMingLiU, MingLiU, serif',
      fontFamily: "custom-st, reader-st"
      // fontFamily: "'Source Han Serif CN'",
      // "-fx-font-family": "'Source Han Serif CN'"
    },
    {
      // fontFamily:
      //   'Baskerville, "Times New Roman", "Liberation Serif", STFangsong, FangSong, FangSong_GB2312, "CWTEX-F", serif',
      fontFamily: "custom-fs, reader-fs"
      // fontFamily: "STFangsong",
      // "-fx-font-family": "STFangsong"
    }
  ]
};
export const errorTypeList = [
  "UnknownHostException",
  "ConnectException: Failed to connect",
  "SocketException: Connection reset",
  "SSLHandshakeException",
  "responseCode: 307",
  "responseCode: 400",
  "responseCode: 403",
  "responseCode: 404",
  "responseCode: 500",
  "responseCode: 502",
  "responseCode: 503",
  "responseCode: 504",
  "responseCode: 513"
];
export const defaultReplaceRule = {
  name: "",
  pattern: "",
  replacement: "",
  scope: "",
  isRegex: false,
  isEnabled: true
};
export const defaultBookmark = {
  bookName: "",
  bookAuthor: "",
  chapterIndex: 0,
  chapterPos: 0,
  chapterName: "",
  bookText: "",
  content: ""
};
export const syncConfigFiled = Object.keys(defaultDayConfig).concat([
  "contentBGImg"
]);
export const customFonts = [
  "custom-system",
  "custom-ht",
  "custom-kt",
  "custom-st",
  "custom-fs"
];
export default settings;
