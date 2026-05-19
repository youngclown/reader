<template>
  <div
    class="settings-wrapper"
    :style="popupTheme"
    :class="{ night: $store.getters.isNight, day: !$store.getters.isNight }"
  >
    <div class="settings-title">
      {{ $t("reader.settingsTitle") }}
      <div class="title-btn" @click="resetConfig">
        {{ $t("reader.resetDefaultConfig") }}
      </div>
    </div>
    <div class="setting-list">
      <ul>
        <li>
          <span class="setting-item-title">{{ $t("reader.appLanguage") }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="locale in $localeOptions"
              :key="'settings-locale-' + locale"
              :class="{ selected: config.locale === locale }"
              @click="setLocaleConfig(locale)"
              >{{ $t("language." + locale) }}</span
            >
          </div>
        </li>
        <el-divider></el-divider>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.specialMode")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(type, index) in pageTypes"
              :key="index"
              :class="{ selected: config.pageType == type }"
              @click="setPageType(type)"
              >{{
                type === "Kindle"
                  ? $t("readSettings.simple")
                  : $t("readSettings.normal")
              }}</span
            >
            <span class="small-tip">{{
              $t("readSettings.simpleModeTip")
            }}</span>
          </div>
        </li>
        <el-divider></el-divider>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.configScheme")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(customConfig, index) in $store.state.customConfigList"
              :key="index"
              :class="{
                selected:
                  $store.getters.config.customConfig === customConfig.name
              }"
              @click="setCustomConfig(customConfig)"
            >
              <span>{{ configName(customConfig) }}</span>
              <i
                class="el-icon-close delete-custom-config-icon"
                v-if="
                  index > 1 &&
                    $store.getters.config.customConfig !== customConfig.name
                "
                @click.stop="deleteCustomConfig(index, customConfig.name)"
              ></i>
            </span>
            <span
              class="span-item"
              :key="'addNewCustomConfig'"
              @click="addNewCustomConfig"
              >{{ $t("readSettings.addScheme") }}</span
            >
            <span
              class="span-item"
              :key="'autoTheme'"
              ref="themes"
              @click="setAutoTheme"
              :class="{ selected: $store.getters.config.autoTheme }"
              >{{ $t("readSettings.autoTheme") }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.schemeType")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(configDefaultType, index) in configDefaultTypeList"
              :key="index"
              :class="{
                selected:
                  currentCustomConfig.configDefaultType === configDefaultType
              }"
              @click="setConfigDefaultType(configDefaultType)"
              >{{ optionLabel(configDefaultType) }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{ $t("readSettings.theme") }}</span>
          <div class="selection-zone">
            <span
              class="theme-item"
              v-for="(themeColor, index) in themeColors"
              :key="index"
              :style="themeColor"
              ref="themes"
              @click="setConfig('theme', index)"
              :class="{ selected: config.theme === index }"
              ><em v-if="index != 6" class="iconfont">&#58980;</em
              ><em v-else class="moon-icon">{{ moonIcon }}</em></span
            >
            <span
              class="span-item"
              :key="'custom'"
              ref="themes"
              @click="setConfig('theme', 'custom')"
              :class="{ selected: config.theme === 'custom' }"
              >{{ $t("readSettings.custom") }}</span
            >
          </div>
        </li>
        <li v-if="config.theme === 'custom'">
          <span class="setting-item-title">{{
            $t("readSettings.custom")
          }}</span>
          <div class="custom-theme">
            <div class="custom-theme-title">
              <span class="custom-theme-title">{{
                $t("readSettings.themeMode")
              }}</span>
              <span
                class="span-item"
                v-for="(type, index) in themeTypes"
                :key="index"
                :class="{ selected: themeType == type }"
                @click="setConfig('themeType', type)"
                >{{
                  type === "day"
                    ? $t("readSettings.day")
                    : $t("readSettings.night")
                }}</span
              >
            </div>
            <span class="custom-theme-title"
              >{{ $t("readSettings.bodyColor") }}
              <el-color-picker v-model="config.bodyColor"></el-color-picker>
            </span>
            <span class="custom-theme-title"
              >{{ $t("readSettings.popupColor") }}
              <el-color-picker v-model="config.popupColor"></el-color-picker
            ></span>
            <span class="custom-theme-title"
              >{{ $t("readSettings.contentColor") }}
              <el-color-picker v-model="config.contentColor"></el-color-picker
            ></span>
            <span class="custom-theme-title"
              >{{ $t("readSettings.contentBgImage") }}
              <img
                class="content-bg-preview"
                v-for="(item, index) in builtinBG"
                :key="index"
                :class="{
                  selected: $store.getters.config.contentBGImg == item.src
                }"
                :src="item.src"
                alt=""
                @click="setBGImg(item.src)"
              />
              <div
                class="content-bg-preview"
                v-for="item in $store.getters.config.customBGImgList || []"
                :key="item"
                :class="{
                  selected: $store.getters.config.contentBGImg == item
                }"
              >
                <img
                  :src="getCustomBGImgURL(item)"
                  alt=""
                  @click="setBGImg(item)"
                />
                <i
                  class="el-icon-close delete-bg-icon"
                  @click.stop="deleteCustomBGImg(item)"
                ></i>
              </div>

              <span class="upload-bg-btn" @click="uploadBGFile">{{
                $t("readSettings.upload")
              }}</span>
              <input
                ref="bgFileRef"
                type="file"
                @change="onBGFileChange"
                style="display:none"
              />
            </span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{ $t("readSettings.font") }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(font, index) in fonts"
              :key="index"
              :class="{ selected: config.font == index }"
              @click="setConfig('font', index)"
              >{{ optionLabel(font) }}
              <i
                :class="{
                  'el-icon-upload': true,
                  'upload-font-icon': true,
                  active:
                    config.customFontsMap &&
                    config.customFontsMap[customFonts[index]]
                }"
                @click.stop="uploadFontFile(customFonts[index], optionLabel(font))"
              ></i>
            </span>
            <input
              ref="fontFileRef"
              type="file"
              @change="onFontFileChange"
              style="display:none"
            />
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.chineseFont")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(chineseFont, index) in chineseFonts"
              :key="index"
              :class="{ selected: config.chineseFont == chineseFont }"
              @click="setConfig('chineseFont', chineseFont)"
              >{{ optionLabel(chineseFont) }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.fontSize")
          }}</span>
          <div class="resize">
            <span class="less" @click="decConfig('fontSize')"
              ><em class="iconfont">&#58966;</em></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.fontSize"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="more" @click="incConfig('fontSize')"
              ><em class="iconfont">&#58976;</em></span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.fontWeight")
          }}</span>
          <div class="resize">
            <span class="less" @click="decConfig('fontWeight')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.fontWeight"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('fontWeight')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.lineHeight")
          }}</span>
          <div class="resize">
            <span class="less" @click="decConfig('lineHeight')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.lineHeight"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('lineHeight')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.paragraphSpace")
          }}</span>
          <div class="resize">
            <span class="less" @click="decConfig('paragraphSpace')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.paragraphSpace"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('paragraphSpace')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title font-color-title">{{
            $t("readSettings.fontColor")
          }}</span>
          <el-color-picker v-model="config.fontColor"></el-color-picker>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.pageMode")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(mode, index) in pageModes"
              :key="index"
              :class="{ selected: config.pageMode == mode }"
              @click="setPageMode(mode)"
              >{{ optionLabel(mode) }}</span
            >
          </div>
        </li>
        <li v-if="!$store.state.miniInterface">
          <span class="setting-item-title">{{
            $t("readSettings.pageWidth")
          }}</span>
          <div class="resize">
            <span class="less" @click="decConfig('readWidth')"
              ><em class="iconfont">&#58965;</em></span
            ><b></b> <span class="lang">{{ config.readWidth }}</span
            ><b></b>
            <span class="more" @click="incConfig('readWidth')"
              ><em class="iconfont">&#58975;</em></span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.readMethod")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(method, index) in readMethods"
              :key="index"
              :class="{ selected: config.readMethod == method }"
              @click="setReadMethod(method)"
              v-show="
                (!$store.state.miniInterface && method !== 'horizontalSwipe') ||
                  $store.state.miniInterface
              "
              >{{ optionLabel(method) }}</span
            >
            <span class="small-tip">{{ $t("readSettings.scroll2Tip") }}</span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.animateTime")
          }}</span>
          <div class="resize">
            <span class="less" @click="decConfig('animateMSTime')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.animateMSTime"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('animateMSTime')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.autoReading")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(method, index) in autoReadingMethods"
              :key="index"
              :class="{ selected: config.autoReadingMethod === method }"
              @click="setConfig('autoReadingMethod', method)"
              >{{ optionLabel(method) }}</span
            >
            >
          </div>
        </li>
        <li v-if="config.autoReadingMethod === 'pixelScroll'">
          <span class="setting-item-title">{{
            $t("readSettings.scrollPixel")
          }}</span>
          <div class="resize">
            <span class="less" @click="decConfig('autoReadingPixel')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.autoReadingPixel"
                size="mini"
              ></el-input> </span
            ><b></b>
            <span class="less" @click="incConfig('autoReadingPixel')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.pageSpeed")
          }}</span>
          <div class="resize">
            <span class="less" @click="decConfig('autoReadingLineTime')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang"
              ><el-input
                class="setting-input"
                v-model="config.autoReadingLineTime"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('autoReadingLineTime')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.fullScreenClick")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(method, index) in clickMethods"
              :key="index"
              :class="{ selected: config.clickMethod == method }"
              @click="setConfig('clickMethod', method)"
              >{{ optionLabel(method) }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">{{
            $t("readSettings.textSelection")
          }}</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(action, index) in selectionActions"
              :key="index"
              :class="{ selected: config.selectionAction == action }"
              @click="setConfig('selectionAction', action)"
              >{{ optionLabel(action) }}</span
            >
          </div>
        </li>
        <el-divider></el-divider>
        <li class="operation-zone">
          <span class="span-btn" @click="showClickZone">{{
            $t("readSettings.showClickZone")
          }}</span>
          <span class="span-btn" @click="showRuleEditor">{{
            $t("readSettings.ruleManage")
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Axios from "../plugins/axios";
import settings, { customFonts, normalizeConfigValues } from "../plugins/config";
import eventBus from "../plugins/eventBus";
import { isMiniInterface, removeFont } from "../plugins/helper";
import { setCache, getCache } from "../plugins/cache";

export default {
  name: "ReadSettings",
  data() {
    return {
      themeColors: [
        {
          background: "rgba(250, 245, 235, 0.8)"
        },
        {
          background: "rgba(245, 234, 204, 0.8)"
        },
        {
          background: "rgba(230, 242, 230, 0.8)"
        },
        {
          background: "rgba(228, 241, 245, 0.8)"
        },
        {
          background: "rgba(245, 228, 228, 0.8)"
        },
        {
          background: "rgba(224, 224, 224, 0.8)"
        },
        {
          background: "rgba(0, 0, 0, 0.5)"
        },
        {
          background: "rgba(255, 255, 255, 0.8)"
        }
      ],
      builtinBG: [
        { src: "bg/landscape-painting.jpg" },
        { src: "bg/ink-landscape.jpg" },
        { src: "bg/parchment-1.jpg" },
        { src: "bg/eye-care-green.jpg" },
        { src: "bg/parchment-2.jpg" },
        { src: "bg/new-parchment.jpg" },
        { src: "bg/parchment-3.jpg" },
        { src: "bg/bright-city.jpg" },
        { src: "bg/parchment-4.jpg" },
        { src: "bg/palace-shadow.jpg" },
        { src: "bg/afternoon-beach.jpg" },
        { src: "bg/fresh-time.jpg" },
        { src: "bg/quiet-night.jpg" },
        { src: "bg/color-edge-canvas.jpg" }
      ],
      fonts: ["system", "heiti", "kaiti", "songti", "fangsong"],
      readMethods: [
        "verticalSwipe",
        "horizontalSwipe",
        "verticalScroll",
        "verticalScroll2"
      ],
      clickMethods: ["nextPage", "auto", "noTurn"],
      selectionActions: ["actionPopup", "ignore"],
      pageModes: ["adaptive", "mobileMode"],
      pageTypes: ["normal", "Kindle"],
      themeTypes: ["day", "night"],
      configDefaultTypeList: ["dayDefault", "nightDefault"],
      autoReadingMethods: ["pixelScroll", "paragraphScroll"],
      chineseFonts: ["simplified", "traditional"],

      customFontName: "",
      customFonts: customFonts,

      config: this.$store.state.config,

      configRules: {
        fontSize: { min: 8, delta: 1 },
        fontWeight: { min: 100, max: 900, delta: 100 },
        animateMSTime: { min: 0, max: 500, delta: 50 },
        autoReadingPixel: { min: 1, delta: 5 },
        autoReadingLineTime: { min: 10, delta: 50 },
        lineHeight: { min: 1, max: 5, delta: 0.2 },
        paragraphSpace: { min: 0, max: 5, delta: 0.2 },
        readWidth: {
          min: Math.min(Math.floor(window.innerWidth / 160), 4) * 160,
          max: Math.floor(window.innerWidth / 160) * 160,
          delta: 160
        }
      }
    };
  },
  mounted() {
    this.config = {
      ...settings.config,
      ...normalizeConfigValues(this.config)
    };
  },
  computed: {
    moonIcon() {
      return this.$store.getters.isSystemNight ? "" : "";
    },
    popupTheme() {
      return {
        background: this.$store.getters.currentThemeConfig.popup
      };
    },
    currentCustomConfig() {
      return this.$store.state.customConfigList.find(
        v => v.name === this.$store.state.config.customConfig
      );
    }
  },
  watch: {
    config: {
      deep: true,
      handler(val) {
        this.$store.commit("setConfig", { ...val });
      }
    }
  },
  methods: {
    optionLabel(value) {
      const optionKeyMap = {
        system: "system",
        heiti: "heiti",
        kaiti: "kaiti",
        songti: "songti",
        fangsong: "fangsong",
        simplified: "simplified",
        traditional: "traditional",
        verticalSwipe: "verticalSwipe",
        horizontalSwipe: "horizontalSwipe",
        verticalScroll: "verticalScroll",
        verticalScroll2: "verticalScroll2",
        nextPage: "nextPage",
        auto: "auto",
        noTurn: "noTurn",
        actionPopup: "actionPopup",
        ignore: "ignore",
        adaptive: "adaptive",
        mobileMode: "mobileMode",
        dayDefault: "dayDefault",
        nightDefault: "nightDefault",
        pixelScroll: "pixelScroll",
        paragraphScroll: "paragraphScroll",
        normal: "normal",
        builtInDay: "builtInDay",
        builtInNight: "builtInNight"
      };
      const key = optionKeyMap[value];
      return key ? this.$t("readSettings.option." + key) : value;
    },
    configName(config) {
      return this.optionLabel(config.name);
    },
    setPageType(type) {
      if (type === this.config.pageType) {
        return;
      }
      let lastConfig = {};
      if (type === "Kindle") {
        setCache("lastNormalConfig", this.config);

        lastConfig = normalizeConfigValues(getCache("lastKindleConfig"));
        lastConfig = lastConfig || {
          animateMSTime: 0,
          fontSize: Math.min(this.fontSize, 20),
          theme: 7,
          readMethod: "horizontalSwipe",
          selectionAction: "ignore",
          pageMode: "mobileMode"
        };
      } else {
        setCache("lastKindleConfig", this.config);
        lastConfig = normalizeConfigValues(getCache("lastNormalConfig")) || {};
      }

      this.config = { ...this.config, ...(lastConfig || {}), pageType: type };

      this.$emit("readMethodChange");
      this.$emit("pageModeChange");
      if (this.config.pageMode === "mobileMode") {
        this.$store.commit("setMiniInterface", true);
      } else {
        this.$store.commit("setMiniInterface", isMiniInterface());
      }
    },
    setPageMode(pageMode) {
      this.$emit("pageModeChange");
      this.config = { ...this.config, pageMode };
      if (this.config.pageMode === "mobileMode") {
        this.$store.commit("setMiniInterface", true);
      } else {
        this.$store.commit("setMiniInterface", isMiniInterface());
      }
    },
    setReadMethod(readMethod) {
      this.$emit("readMethodChange");
      this.config = { ...this.config, readMethod };
    },
    setConfig(name, value) {
      const data = {};
      data[name] = value;
      this.config = { ...this.config, ...data };
    },
    setLocaleConfig(locale) {
      this.$setLocale(locale);
      this.setConfig("locale", locale);
    },
    setAutoTheme() {
      this.config = { ...this.config, autoTheme: !this.config.autoTheme };
    },
    incConfig(name) {
      const data = {};
      const rule = this.configRules[name];
      const val = +this.config[name];
      data[name] =
        "max" in rule ? Math.min(rule.max, val + rule.delta) : val + rule.delta;
      this.config = {
        ...this.config,
        ...data
      };
    },
    decConfig(name) {
      const data = {};
      const rule = this.configRules[name];
      const val = +this.config[name];
      data[name] =
        "min" in rule ? Math.max(rule.min, val - rule.delta) : val - rule.delta;
      this.config = {
        ...this.config,
        ...data
      };
    },
    getCustomBGImgURL(src) {
      return this.api.replace(/\/reader3\/?/, "") + src;
    },
    setBGImg(src) {
      let config = { ...this.config };
      if (config.contentBGImg === src) {
        delete config.contentBGImg;
      } else {
        config.contentBGImg = src;
      }
      this.config = config;
    },
    uploadBGFile() {
      this.$refs.bgFileRef.dispatchEvent(new MouseEvent("click"));
    },
    onBGFileChange(event) {
      const rawFile = event.target.files && event.target.files[0];
      // console.log("rawFile", rawFile);
      let param = new FormData();
      param.append("file", rawFile);
      param.append("type", "background");
      Axios.post(this.api + "/uploadFile", param, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(
        res => {
          if (res.data.isSuccess) {
            if (!res.data.data.length) {
              this.$message.error(this.$t("common.uploadFileFailed"));
              return;
            }
            let config = { ...this.config };
            config.customBGImgList = config.customBGImgList || [];
            if (!config.customBGImgList.includes(res.data.data[0])) {
              config.customBGImgList.push(res.data.data[0]);
            }
            config.contentBGImg = res.data.data[0];
            this.config = config;
          }
        },
        error => {
          this.$message.error(
            this.$t("common.uploadFileFailedWithMessage", {
              message: error && error.toString()
            })
          );
        }
      );
      this.$refs.bgFileRef.value = null;
    },
    async uploadFontFile(customFontName, fontName) {
      if (
        this.config.customFontsMap &&
        this.config.customFontsMap[customFontName]
      ) {
        const res = await this.$confirm(
          this.$t("readSettings.customFontUploaded", { fontName }),
          this.$t("common.tip"),
          {
            confirmButtonText: this.$t("readSettings.continueUpload"),
            cancelButtonText: this.$t("readSettings.restoreDefaultFont"),
            type: "warning",
            closeOnClickModal: false,
            closeOnPressEscape: false,
            distinguishCancelAndClose: true
          }
        ).catch(action => {
          return action === "close" ? "close" : false;
        });
        if (res === "close") {
          return;
        }
        if (!res) {
          Axios.post(this.api + "/deleteFile", {
            url: this.config.customFontsMap[customFontName]
          }).then(
            res => {
              if (res.data.isSuccess) {
                let config = { ...this.config };
                delete config.customFontsMap[customFontName];
                this.config = config;
                removeFont(customFontName);
              }
            },
            error => {
              this.$message.error(
                this.$t("readSettings.customFontDeleteFailed", {
                  message: error && error.toString()
                })
              );
            }
          );
          return;
        }
      }
      this.customFontName = customFontName;
      this.$refs.fontFileRef.dispatchEvent(new MouseEvent("click"));
    },
    onFontFileChange(event) {
      const rawFile = event.target.files && event.target.files[0];
      // console.log("rawFile", rawFile);
      if (!rawFile.name.toLowerCase().endsWith(".ttf")) {
        this.$message.error(this.$t("readSettings.ttfOnly"));
        return;
      }
      let param = new FormData();
      param.append("file", rawFile);
      param.append("type", "fonts");
      Axios.post(this.api + "/uploadFile", param, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(
        res => {
          if (res.data.isSuccess) {
            if (!res.data.data.length) {
              this.$message.error(this.$t("common.uploadFileFailed"));
              return;
            }
            let config = { ...this.config };
            config.customFontsMap = config.customFontsMap || {};
            config.customFontsMap[this.customFontName] = res.data.data[0];
            this.config = config;
          }
        },
        error => {
          this.$message.error(
            this.$t("common.uploadFileFailedWithMessage", {
              message: error && error.toString()
            })
          );
        }
      );
      this.$refs.fontFileRef.value = null;
    },
    deleteCustomBGImg(src) {
      Axios.post(this.api + "/deleteFile", {
        url: src
      }).then(
        res => {
          if (res.data.isSuccess) {
            let config = { ...this.config };
            config.customBGImgList = config.customBGImgList || [];
            var index = config.customBGImgList.indexOf(src);
            if (index != -1) {
              config.customBGImgList.splice(index, 1);
            }
            if (config.contentBGImg === src) {
              config.contentBGImg = this.builtinBG[0].src;
            }
            this.config = config;
          }
        },
        error => {
          this.$message.error(
            this.$t("common.fileDeleteFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    resetConfig() {
      this.config = { ...settings.config };
    },
    showClickZone() {
      this.$emit("close");
      this.$emit("showClickZone");
    },
    showRuleEditor() {
      this.$emit("close");
      eventBus.$emit("showReplaceRuleDialog");
    },
    async addNewCustomConfig() {
      const res = await this.$prompt(
        this.$t("readSettings.schemeNamePrompt"),
        this.$t("readSettings.addSchemeTitle"),
        {
          inputValue: "",
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          inputValidator: v => {
            if (!v) {
              return this.$t("readSettings.schemeNameRequired");
            }
            return true;
          }
        }
      ).catch(() => {
        return false;
      });
      if (!res) {
        return;
      }
      const name = res.value.replace(/^\s+/, "").replace(/\s+$/, "");
      if (!name) {
        this.$message.error(this.$t("readSettings.schemeNameRequired"));
        return;
      }
      const isExist = this.$store.state.customConfigList.find(
        v => v.name === name
      );
      if (isExist) {
        this.$message.error(this.$t("readSettings.schemeNameDuplicate"));
        return;
      }
      const newConfig = { ...this.$store.state.customConfigList[0] };
      newConfig.name = name;
      this.$store.commit(
        "setCustomConfigList",
        [].concat(this.$store.state.customConfigList).concat([newConfig])
      );
    },
    setCustomConfig(customConfig) {
      this.config = {
        ...this.config,
        customConfig: customConfig.name,
        ...customConfig
      };
    },
    async deleteCustomConfig(index, name) {
      const customConfigList = [].concat(this.$store.state.customConfigList);
      if (index <= 1) {
        this.$message.error(this.$t("readSettings.builtInSchemeCannotDelete"));
        return;
      }
      if (customConfigList.length <= index) {
        this.$message.error(this.$t("readSettings.schemeNotFound"));
        return;
      }
      if (this.$store.state.config.customConfig === name) {
        this.$message.error(this.$t("readSettings.schemeInUse"));
        return;
      }
      const res = await this.$confirm(
        this.$t("readSettings.confirmDeleteScheme", { name }),
        this.$t("common.tip"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          type: "warning"
        }
      ).catch(() => {
        return false;
      });
      if (!res) {
        return;
      }
      customConfigList.splice(index, 1);

      this.$store.commit("setCustomConfigList", [].concat(customConfigList));
    },
    async setConfigDefaultType(configDefaultType) {
      const res = await this.$confirm(
        this.$t("readSettings.confirmSetDefaultScheme", {
          type: this.optionLabel(configDefaultType)
        }),
        this.$t("common.tip"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          type: "warning"
        }
      ).catch(() => {
        return false;
      });
      if (!res) {
        return;
      }
      const customConfigList = [].concat(this.$store.state.customConfigList);
      customConfigList.forEach(v => {
        if (v.name === this.$store.state.config.customConfig) {
          v.configDefaultType = configDefaultType;
        } else if (v.configDefaultType === configDefaultType) {
          v.configDefaultType = "";
        }
      });
      this.$store.commit("setCustomConfigList", customConfigList);
    }
  }
};
</script>

<style lang="stylus" scoped>
>>>.iconfont {
  font-family: iconfont;
  font-style: normal;
}

>>>.moon-icon {
  font-family: iconfont;
  font-style: normal;
}

.settings-wrapper {
  user-select: none;
  margin: -16px;
  margin-bottom: -13px;
  text-align: left;
  padding: 24px;
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));

  .settings-title {
    font-size: 18px;
    line-height: 22px;
    margin-bottom: 28px;
    font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
    font-weight: 400;

    .title-btn {
      float: right;
      font-size: 14px;
      color: #ed4259;
      cursor: pointer;
    }
  }

  .setting-list {
    max-height: 45vh;
    overflow-y: auto;
    ul {
      list-style: none outside none;
      margin: 0;
      padding: 0;

      li:not(:first-child) {
        margin-top: 20px;
      }

      li {
        list-style: none outside none;

        .setting-item-title {
          display: inline-block;
          width: 56px;
          margin-right: 16px;
          vertical-align: top;
          line-height: 36px;
          color: #666;
        }
        .font-color-title {
          line-height: 40px;
        }
        .selection-zone {
          display: inline-block;
          width: calc(100% - 72px);
          word-wrap: break-word;

          span {
            margin-bottom: 5px;
          }
        }

        .span-item {
          width: 78px;
          height: 34px;
          cursor: pointer;
          margin-right: 16px;
          border-radius: 2px;
          text-align: center;
          vertical-align: middle;
          display: inline-block;
          font: 14px / 34px PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;
          position: relative;

          .delete-custom-config-icon {
            display: inline-block;
            cursor: pointer;
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 20px;
            color: #ed4259;
            z-index: 10;
          }

          .upload-font-icon {
            display: inline-block;
            cursor: pointer;
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 20px;
            z-index: 10;
            color: #606266;

            &.active {
              color: #ed4259;
            }
          }
        }

        .span-item.selected  {
          border: 1px solid #ed4259;
          color: #ed4259;
        }

        .custom-theme {
          width: calc(100% - 72px);
          display: inline-block;

          .custom-theme-title {
            display: inline-block;
            margin-right: 28px;
            margin-bottom: 5px;
          }

          .content-bg-preview {
            width: 36px;
            height: 36px;
            display: inline-block;
            vertical-align: middle;
            margin-left: 10px;
            margin-bottom: 8px;
            position: relative;
            box-sizing: border-box;

            img {
              width: 100%;
              height: 100%;
              display: inline-block;
              vertical-align: middle;
            }

            .delete-bg-icon {
              position: absolute;
              top: -6px;
              right: -6px;
              font-size: 18px;
              color: #ed4259;
            }
          }
          .selected {
            color: #ed4259;
            border: 1px solid #ed4259;
          }
          .upload-bg-btn {
            display: inline-block;
            margin-left: 10px;
            color: #ed4259;
            cursor: pointer;
          }
        }

        .theme-item {
          line-height: 32px;
          width: 34px;
          height: 34px;
          margin-right: 16px;
          border-radius: 100%;
          display: inline-block;
          cursor: pointer;
          text-align: center;
          vertical-align: middle;

          .iconfont {
            display: none;
          }
        }

        .selected {
          color: #ed4259;

          .iconfont {
            display: inline;
          }
        }
      }

      li {

        .resize {
          display: inline-block;
          height: 34px;
          vertical-align: middle;
          border-radius: 2px;

          span {
            min-width: 72px;
            height: 34px;
            line-height: 34px;
            display: inline-block;
            cursor: pointer;
            text-align: center;
            vertical-align: middle;

            em {
              font-style: normal;
            }
          }

          .lang {
            color: #a6a6a6;
            font-weight: 400;
            font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
          }

          b {
            display: inline-block;
            height: 20px;
            vertical-align: middle;
          }
        }
      }

      .operation-zone {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        .span-btn {
          cursor: pointer;
          color: #ed4259;
        }
      }
    }
  }
  .setting-list::-webkit-scrollbar {
    width: 0 !important;
  }
  .el-color-picker {
    vertical-align: middle;
  }
}

.night {
  >>>.theme-item {
    border: 1px solid #666;
  }

  >>>.selected {
    border: 1px solid #666;
  }

  >>>.moon-icon {
    color: #ed4259;
  }

  .span-item {
    border: 1px solid #666;
    background: rgba(45, 45, 45, 0.5);
  }

  >>>.resize {
    border: 1px solid #666;
    background: rgba(45, 45, 45, 0.5);

    b {
      border-right: 1px solid #666;
    }
  }
}

.day {
  >>>.theme-item {
    border: 1px solid #e5e5e5;
  }

  >>>.selected {
    border: 1px solid #ed4259;
  }

  >>>.moon-icon {
    display: inline;
    color: rgba(255, 255, 255, 0.2);
  }

  .span-item {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  >>>.resize {
    border: 1px solid #e5e5e5;
    background: rgba(255, 255, 255, 0.5);

    b {
      border-right: 1px solid #e5e5e5;
    }
  }
}

@media (hover: hover) {
  .span-item:hover {
    border: 1px solid #ed4259;
    color: #ed4259;
  }
  li {
    .less:hover, .more:hover {
      color: #ed4259;
    }
  }
}
</style>
<style lang="stylus">
.setting-input {
  .el-input__inner {
    background: transparent;
    border: none !important;
    text-align: center;
    width: 72px;
    font-size: 14px;
    color: #a6a6a6;
  }
}
</style>
