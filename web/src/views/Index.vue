<template>
  <div
    class="index-wrapper"
    :class="{
      night: isNight,
      day: !isNight
    }"
  >
    <div
      class="navigation-wrapper"
      :class="[
        navigationClass,
        isWebApp && !isNight ? 'status-bar-light-bg' : ''
      ]"
      :style="navigationStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      v-if="$store.getters.isNormalPage"
    >
      <div class="navigation-inner-wrapper">
        <div class="navigation-title">
          {{ $t("app.title") }}
          <span class="version-text" @click="updateForce">{{
            $store.state.version
          }}</span>
        </div>
        <div class="navigation-sub-title">
          {{ $t("app.subtitle") }}
        </div>
        <div class="search-wrapper">
          <el-input
            size="mini"
            :placeholder="$t('search.placeholder')"
            v-model="search"
            class="search-input"
            @keyup.enter.native="searchBook(1)"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <div class="setting-wrapper search-setting">
          <div class="setting-title">
            {{ $t("search.settings") }}
          </div>
          <div class="setting-item">
            <el-select
              size="mini"
              v-model="searchConfig.searchType"
              class="setting-select"
              filterable
              :placeholder="$t('search.typePlaceholder')"
            >
              <el-option
                v-for="(item, index) in searchTypeList"
                :key="'search-type-' + index"
                :label="$t(item.nameKey)"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div
            class="setting-item"
            v-show="searchConfig.searchType === 'single'"
          >
            <el-select
              size="mini"
              v-model="searchConfig.bookSourceUrl"
              class="setting-select"
              filterable
              :placeholder="$t('search.sourcePlaceholder')"
            >
              <el-option
                v-for="(item, index) in bookSourceList"
                :key="'source-' + index"
                :label="item.bookSourceName"
                :value="item.bookSourceUrl"
              >
              </el-option>
            </el-select>
          </div>
          <div
            class="setting-item"
            v-show="searchConfig.searchType !== 'single'"
          >
            <el-select
              size="mini"
              v-model="searchConfig.bookSourceGroup"
              class="setting-select"
              filterable
              :placeholder="$t('search.sourceGroupPlaceholder')"
            >
              <el-option
                v-for="(item, index) in bookSourceGroupList"
                :key="'source-group-' + index"
                :label="item.name + ' (' + item.count + ')'"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div
            class="setting-item"
            v-show="searchConfig.searchType !== 'single'"
          >
            <el-select
              size="mini"
              v-model="searchConfig.concurrentCount"
              class="setting-select"
              filterable
              :placeholder="$t('search.concurrentPlaceholder')"
            >
              <el-option
                v-for="(item, index) in concurrentList"
                :key="'source-' + index"
                :label="$t('search.concurrentThreads', { count: item })"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="recent-wrapper">
          <div class="recent-title">
            {{ $t("home.recentReading") }}
          </div>
          <div class="reading-recent">
            <el-tag
              type="warning"
              :effect="isNight ? 'dark' : 'light'"
              class="recent-book"
              @click="toDetail(readingRecent)"
              :class="{ 'no-point': readingRecent.bookUrl == '' }"
            >
              {{ readingRecent.name }}
            </el-tag>
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            {{ $t("home.backend") }}
          </div>
          <div class="setting-item">
            <el-tag
              :type="connectType"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-connect"
              :class="{ 'no-point': connecting }"
              @click="setIP"
            >
              {{ connectStatus }}
            </el-tag>
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            {{ $t("home.sourceSettings") }}
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="showBookSourceManageDialog = true"
            >
              {{ $t("home.sourceManage") }}
            </el-tag>
            <el-popover
              placement="right"
              :width="popupWidth"
              trigger="click"
              :visible-arrow="false"
              v-model="popExploreVisible"
              popper-class="popper-component"
            >
              <Explore
                ref="popExplore"
                class="popup"
                :visible="popExploreVisible"
                :bookSourceList="bookSourceList"
                @showSearchList="showSearchList"
                @close="popExploreVisible = false"
              />
              <el-tag
                type="info"
                :effect="isNight ? 'dark' : 'light'"
                slot="reference"
                ref="exploreBtn"
                class="setting-btn"
                @click="showNavigation = false"
              >
                {{ $t("home.sourceExplore") }}
              </el-tag>
            </el-popover>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="uploadBookSource"
            >
              {{ $t("home.sourceImport") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="loadRemoteBookSource"
            >
              {{ $t("home.sourceRemote") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="showFailureBookSource()"
            >
              {{ $t("home.sourceInvalid") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="debugBookSource()"
            >
              {{ $t("home.sourceDebug") }}
            </el-tag>
            <input
              ref="fileRef"
              type="file"
              accept=".json,.txt"
              @change="onSourceFileChange"
              style="display:none"
            />
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            {{ $t("home.shelfSettings") }}
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              :effect="$store.getters.isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="showBookManage"
            >
              {{ $t("home.bookManage") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="$store.getters.isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="showManageBookGroup"
            >
              {{ $t("home.groupManage") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="$store.getters.isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="importLocalBook"
            >
              {{ $t("home.bookImport") }}
            </el-tag>
            <input
              ref="bookRef"
              type="file"
              accept=".txt,.epub,.umd"
              multiple="multiple"
              @change="onBookFileChange"
              style="display:none"
            />
            <el-tag
              type="info"
              :effect="$store.getters.isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="showLocalStoreManageDialog = true"
              v-if="
                !$store.state.isSecureMode ||
                  $store.state.userInfo.enableLocalStore
              "
            >
              {{ $t("home.localStore") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="init(true)"
            >
              {{ $t("home.refreshCache") }}
            </el-tag>
          </div>
        </div>

        <div class="setting-wrapper">
          <div class="setting-title">
            {{ $t("language.title") }}
          </div>
          <div class="setting-item">
            <el-select
              size="mini"
              :value="$store.getters.config.locale || $i18n.locale"
              class="setting-select"
              @change="setLocaleConfig"
            >
              <el-option
                v-for="locale in $localeOptions"
                :key="'locale-' + locale"
                :label="$t('language.' + locale)"
                :value="locale"
              >
              </el-option>
            </el-select>
          </div>
        </div>

        <div class="setting-wrapper">
          <div class="setting-title">
            {{ $t("home.userSpace") }}
            <span
              class="right-text"
              v-if="$store.state.isSecureMode && $store.state.userInfo.username"
              @click="logout()"
              >{{ $t("common.logout") }}</span
            >
            <span
              class="right-text"
              v-else
              @click="$store.commit('setShowLogin', true)"
              >{{ $t("common.login") }}</span
            >
          </div>
          <div class="setting-item" v-if="$store.state.showManagerMode">
            <el-select
              size="mini"
              v-model="userNS"
              class="setting-select"
              filterable
              :placeholder="$t('home.userSpacePlaceholder')"
            >
              <el-option
                v-for="(item, index) in userList"
                :key="'source-' + index"
                :label="item.username"
                :value="item.userNS"
              >
              </el-option>
            </el-select>
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="saveUserConfig"
              v-if="localStorageAvaliable"
            >
              {{ $t("home.backupUserConfig") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="restoreUserConfig"
              v-if="localStorageAvaliable"
            >
              {{ $t("home.syncUserConfig") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="loadUserList"
              v-if="$store.state.showManagerMode"
            >
              {{ $t("home.loadUserSpace") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              v-if="$store.state.isManagerMode"
              @click="showUserManageDialog()"
            >
              {{ $t("home.manageUserSpace") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              v-if="$store.state.isManagerMode"
              @click="exitSecureMode"
            >
              {{ $t("home.exitManagerMode") }}
            </el-tag>
          </div>
        </div>
        <div
          class="setting-wrapper"
          v-if="
            !$store.state.isSecureMode || $store.state.userInfo.enableWebdav
          "
        >
          <div class="setting-title">
            WebDAV
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="showWebDAVManageDialog = true"
            >
              {{ $t("home.fileManage") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="backupToWebdav"
            >
              {{ $t("home.saveBackup") }}
            </el-tag>
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            {{ $t("home.other") }}
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="showMPCode"
            >
              {{ $t("home.followOfficialAccount") }}
            </el-tag>
            <el-tag
              type="info"
              :effect="isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="joinTGChannel"
            >
              {{ $t("home.joinTelegram") }}
            </el-tag>
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            {{ $t("home.localCache") }}
            <span class="right-text">{{ localCacheStats.total }}</span>
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              :effect="$store.getters.isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="clearCache('bookSourceList')"
            >
              {{ $t("home.clearBookSourceCache") }}
              <span>{{ localCacheStats.bookSourceList }}</span>
            </el-tag>
            <el-tag
              type="info"
              :effect="$store.getters.isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="clearCache('rssSources')"
            >
              {{ $t("home.clearRssCache") }}
              <span>{{ localCacheStats.rssSources }}</span>
            </el-tag>
            <el-tag
              type="info"
              :effect="$store.getters.isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="clearCache('chapterList')"
            >
              {{ $t("home.clearChapterListCache") }}
              <span>{{ localCacheStats.chapterList }}</span>
            </el-tag>
            <el-tag
              type="info"
              :effect="$store.getters.isNight ? 'dark' : 'light'"
              class="setting-btn"
              @click="clearCache('chapterContent')"
            >
              {{ $t("home.clearChapterContentCache") }}
              <span>{{ localCacheStats.chapterContent }}</span>
            </el-tag>
          </div>
        </div>
      </div>
      <div class="bottom-icons">
        <a href="https://github.com/hectorqin/reader" target="_blank">
          <div class="bottom-icon">
            <img
              v-if="isNight"
              :src="require('../assets/imgs/github.png')"
              alt=""
            />
            <img v-else :src="require('../assets/imgs/github2.png')" alt="" />
          </div>
        </a>
        <span
          class="theme-item"
          :style="themeColor"
          ref="themes"
          @click="toogleNight"
        >
          <i class="el-icon-moon" v-if="!isNight"></i>
          <i class="el-icon-sunny" v-else></i>
        </span>
      </div>
    </div>
    <div
      class="shelf-wrapper"
      :class="isWebApp && !isNight ? 'status-bar-light-bg' : ''"
      ref="shelfWrapper"
      @click="showNavigation = false"
    >
      <div class="shelf-title">
        <i
          class="el-icon-menu"
          v-if="$store.getters.isNormalPage && collapseMenu"
          @click.stop="toggleMenu"
        ></i>
        {{
          isSearchResult
            ? isExploreResult
              ? $t("home.explore")
              : $t("home.search")
            : $t("reader.shelf")
        }}
        ({{ bookList.length }})
        <div
          class="title-btn"
          v-if="$store.getters.isNormalPage && isSearchResult"
          @click="backToShelf"
        >
          {{ $t("reader.shelf") }}
        </div>
        <div
          class="title-btn"
          v-if="$store.getters.isNormalPage && isSearchResult"
          @click="loadMore"
        >
          <i class="el-icon-loading" v-if="loadingMore"></i>
          {{
            loadingMore
              ? $t("contentSearch.loading")
              : $t("contentSearch.loadMore")
          }}
        </div>
        <div
          class="title-btn"
          v-if="$store.getters.isNormalPage && !isSearchResult"
          @click="showBookEditButton = !showBookEditButton"
        >
          {{ showBookEditButton ? $t("common.cancel") : $t("common.edit") }}
        </div>
        <div class="title-btn" v-if="!isSearchResult" @click="refreshShelf">
          <i class="el-icon-loading" v-if="refreshLoading"></i>
          {{ refreshLoading ? $t("common.refreshing") : $t("common.refresh") }}
        </div>
        <div
          class="title-btn"
          v-if="$store.getters.isNormalPage && !isSearchResult"
          @click="showRssDialog"
        >
          RSS
        </div>
        <div
          class="title-btn"
          @click="showExplorePop"
          v-if="
            $store.getters.isNormalPage && !(isSearchResult && !isExploreResult)
          "
        >
          {{ $t("home.explore") }}
        </div>
      </div>
      <div class="book-group-wrapper" v-if="!isSearchResult">
        <el-tabs class="book-group-tabs" v-model="showBookGroupString" stretch>
          <el-tab-pane
            v-for="group in bookGroupDisplayList"
            :label="group.groupName"
            :name="'' + group.groupId"
            :key="'bookGroup-' + group.groupId"
          ></el-tab-pane>
        </el-tabs>
      </div>
      <div
        class="books-wrapper"
        ref="bookList"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @scroll="scrollHandler"
      >
        <div class="wrapper">
          <div
            class="book"
            :style="showNavigation ? { minWidth: '360px !important' } : {}"
            v-for="book in bookList"
            :key="book.bookUrl"
            @click="toDetail(book)"
          >
            <div class="cover-img" @click.stop="showBookInfoDialog(book)">
              <!-- <img class="cover" v-lazy="getCover(book.coverUrl)" alt="" /> -->
              <el-image
                class="cover"
                ref="bookCoverList"
                :src="getCover(getBookCoverUrl(book), true)"
                fit="cover"
                lazy
              >
              </el-image>
            </div>
            <div class="info" @click="toDetail(book)">
              <div class="book-operation">
                <i
                  class="el-icon-close"
                  v-if="!isSearchResult && showBookEditButton"
                  @click.stop="deleteBook(book)"
                ></i>
                <i
                  class="el-icon-edit"
                  v-if="!isSearchResult && showBookEditButton"
                  @click.stop="editBook(book)"
                ></i>
                <i
                  class="el-icon-edit"
                  v-if="isSearchResult"
                  @click.stop="editBook(book, true)"
                ></i>
                <el-badge
                  class="unread-num-badge"
                  :max="99"
                  :value="book.totalChapterNum - 1 - book.durChapterIndex"
                  v-if="
                    !isSearchResult &&
                      !showBookEditButton &&
                      book.totalChapterNum - 1 - book.durChapterIndex > 0
                  "
                />
              </div>
              <div
                class="name"
                slot="reference"
                :class="showBookEditButton ? 'edit' : ''"
              >
                {{ book.name }}
              </div>
              <div class="sub">
                <div class="author">
                  {{ book.author || "" }}
                </div>
                <div class="dot" v-if="book.totalChapterNum">•</div>
                <div class="size" v-if="book.totalChapterNum">
                  {{
                    $t("book.totalChapters", { count: book.totalChapterNum })
                  }}
                </div>
              </div>
              <div
                class="dur-chapter"
                v-if="!isSearchResult && book.durChapterTitle"
              >
                {{ $t("book.read") }}{{ book.durChapterTitle }}
              </div>
              <div class="last-chapter" v-if="book.latestChapterTitle">
                {{
                  book.lastCheckTime
                    ? dateFormat(book.lastCheckTime)
                    : $t("book.latest")
                }}：{{ book.latestChapterTitle }}
              </div>
              <div v-if="isSearchResult">
                <el-tag
                  type="success"
                  :effect="isNight ? 'dark' : 'light'"
                  class="setting-connect"
                  @click.stop="addBookToShelf(book)"
                >
                  {{ $t("book.addToShelf") }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      :title="
        isImportRssSource
          ? $t('source.importRss')
          : $t('source.importBookSource')
      "
      :visible.sync="showImportSourceDialog"
      :width="dialogWidth"
      :top="this.collapseMenu ? '0' : '15vh'"
      :fullscreen="collapseMenu"
      :class="isWebApp && !isNight ? 'status-bar-light-bg' : ''"
      v-if="$store.getters.isNormalPage"
    >
      <div class="source-container source-list-container">
        <el-checkbox-group
          v-model="checkedSourceIndex"
          @change="handleCheckedSourcesChange"
        >
          <el-checkbox
            v-for="(source, index) in importSourceList"
            :label="index"
            :key="index"
            class="source-checkbox"
            >{{ isImportRssSource ? source.sourceName : source.bookSourceName }}
            {{ isImportRssSource ? source.sourceUrl : source.bookSourceUrl }}
            {{ getSourceTag(source) }}</el-checkbox
          >
        </el-checkbox-group>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="checkAll"
          @change="handleCheckAllChange"
          border
          size="medium"
          class="float-left"
          >{{ $t("source.selectAll") }}</el-checkbox
        >
        <span class="check-tip">{{
          $t("common.selectedCount", { count: checkedSourceIndex.length })
        }}</span>
        <el-button
          size="medium"
          @click="
            showImportSourceDialog = false;
            checkedSourceIndex = [];
          "
          >{{ $t("common.cancel") }}</el-button
        >
        <el-button size="medium" type="primary" @click="saveSourceList">{{
          $t("common.confirm")
        }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="showBookSourceManageDialog"
      :width="dialogWidth"
      :top="dialogTop"
      @closed="
        isShowFailureBookSource = false;
        showSourceGroup = '';
      "
      :fullscreen="collapseMenu"
      :class="isWebApp && !isNight ? 'status-bar-light-bg-dialog' : ''"
      v-if="$store.getters.isNormalPage"
    >
      <div class="custom-dialog-title" slot="title">
        <span class="el-dialog__title"
          >{{
            isShowFailureBookSource
              ? $t("home.sourceInvalid")
              : $t("home.sourceManage")
          }}
          <span
            v-if="!isShowFailureBookSource"
            class="float-right span-btn"
            @click="deleteAllBookSource()"
            >{{ $t("common.clear") }}</span
          >
          <span
            v-if="!isShowFailureBookSource"
            class="float-right span-btn"
            @click="deleteBookSourceFile()"
            >{{ $t("common.restoreDefault") }}</span
          >
          <span
            v-if="!isShowFailureBookSource"
            class="float-right span-btn"
            @click="exportBookSource()"
            >{{ $t("common.export") }}</span
          >
          <span
            v-if="!isShowFailureBookSource"
            class="float-right span-btn"
            @click="editBookSource(false)"
            >{{ $t("common.add") }}</span
          >
        </span>
      </div>
      <div class="source-container table-container">
        <div class="check-form" v-if="isShowFailureBookSource">
          <span class="check-form-label">{{ $t("source.searchWord") }}</span>
          <el-input v-model="checkBookSourceConfig.keyword" size="small">
          </el-input>
          <span class="check-form-label" style="min-width: 68px;">
            {{ $t("reader.speechTimer") }}(ms):
          </span>
          <el-input-number
            v-model="checkBookSourceConfig.timeout"
            :min="1000"
            :max="15000"
            :step="500"
            size="small"
          >
          </el-input-number>
          <span class="check-form-label">{{
            $t("source.concurrentCount")
          }}</span>
          <el-input-number
            v-model="checkBookSourceConfig.concurrent"
            :min="3"
            :max="15"
            :step="1"
            size="small"
          >
          </el-input-number>
        </div>
        <div class="source-group-wrapper">
          <el-tag
            type="info"
            :effect="$store.getters.isNight ? 'dark' : 'light'"
            class="source-group-btn"
            :class="showSourceGroup === name ? 'selected' : ''"
            v-for="name in bookSourceShowGroup"
            :key="'sourceGroup-' + name"
            @click="setShowSourceGroup(name)"
          >
            {{ name === "ungrouped" ? $t("book.ungrouped") : name }}
          </el-tag>
        </div>
        <el-table
          :data="bookSourceShowResultPageList"
          :height="
            dialogContentHeight - 42 - 42 - (isShowFailureBookSource ? 32 : 0)
          "
          @selection-change="manageSourceSelection = $event"
          :key="isShowFailureBookSource"
        >
          <el-table-column
            type="selection"
            width="25"
            :fixed="$store.state.miniInterface"
            :selectable="isBookSourceSelectable"
          >
          </el-table-column>
          <el-table-column
            property="bookSourceName"
            :label="$t('source.sourceName')"
            min-width="120"
            :fixed="$store.state.miniInterface"
          ></el-table-column>
          <el-table-column
            property="bookSourceUrl"
            :label="$t('source.sourceUrl')"
            min-width="120"
          >
            <template slot-scope="scope">
              <el-link
                type="primary"
                :href="scope.row.bookSourceUrl"
                target="_blank"
                >{{ scope.row.bookSourceUrl }}</el-link
              >
            </template>
          </el-table-column>
          <el-table-column
            property="errorMsg"
            :label="$t('source.errorInfo')"
            min-width="120"
            v-if="isShowFailureBookSource"
          ></el-table-column>
          <el-table-column :label="$t('source.shelfBooks')" min-width="120">
            <template slot-scope="scope">
              <pre>{{ showSourceBook(scope.row) }}</pre>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('group.operation')"
            width="100px"
            v-if="!isShowFailureBookSource"
          >
            <template slot-scope="scope">
              <el-button type="text" @click="editBookSource(scope.row)">{{
                $t("common.edit")
              }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="source-pagination">
          <el-pagination
            :current-page.sync="bookSourcePagination.page"
            :page-sizes="[25, 50, 100, 200, 300, 400]"
            :page-size.sync="bookSourcePagination.size"
            layout="total, sizes, prev, pager, next"
            :total="bookSourceShowLength"
            :pager-count="collapseMenu ? 5 : 7"
          >
          </el-pagination>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          class="float-left"
          size="medium"
          @click="deleteBookSourceList"
          >{{ $t("book.batchDelete") }}</el-button
        >
        <span class="check-tip">{{
          $t("common.selectedCount", { count: manageSourceSelection.length })
        }}</span>
        <el-button
          @click="checkBookSource"
          v-if="isShowFailureBookSource"
          size="medium"
          style="margin-bottom: 5px;"
          :disabled="isCheckingBookSource"
          >{{ isCheckingBookSource ? $t("common.checking") : ""
          }}{{ $t("source.checkSources") }} {{ checkBookSourceTip }}</el-button
        >
        <el-button @click="showBookSourceManageDialog = false" size="medium">{{
          $t("common.cancel")
        }}</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="$t('source.importLocalBook') + importMultiBookTip"
      :visible.sync="showImportBookDialog"
      :width="dialogSmallWidth"
      :top="dialogTop"
      @closed="importBookDialogClosed"
      :fullscreen="collapseMenu"
      :class="isWebApp && !isNight ? 'status-bar-light-bg-dialog' : ''"
      v-if="$store.getters.isNormalPage"
    >
      <div class="source-container table-container">
        <div class="check-form">
          <div class="book-cover">
            <el-image
              class="cover"
              :src="getCover(getBookCoverUrl(importBookInfo), true)"
              :key="getBookCoverUrl(importBookInfo)"
              fit="cover"
              lazy
            >
            </el-image>
          </div>
          <div class="book-info">
            <div>
              <span>{{ $t("source.bookName") }}</span>
              <el-input v-model="importBookInfo.name" size="small"> </el-input>
            </div>
            <div>
              <span>{{ $t("source.author") }}</span>
              <el-input v-model="importBookInfo.author" size="small">
              </el-input>
            </div>
            <div>
              <span>{{ $t("source.group") }}</span>
              <el-select
                size="mini"
                v-model="importBookGroup"
                filterable
                multiple
                :placeholder="$t('book.ungrouped')"
              >
                <el-option
                  v-for="(bookGroup, index) in bookGroupSetList"
                  :key="'bookGroup-' + index"
                  :label="bookGroup.groupName"
                  :value="bookGroup.groupId"
                >
                </el-option>
              </el-select>
            </div>
            <div v-if="isShowTocRule">
              <span>{{ $t("source.rule") }}</span>
              <el-select
                size="mini"
                v-model="importUsedTxtRule"
                filterable
                :placeholder="$t('catalog.builtInRules')"
              >
                <el-option
                  v-for="(rule, index) in tocRuleList"
                  :key="'txtTocRule-' + index"
                  :label="rule.name"
                  :value="rule.rule"
                >
                </el-option>
              </el-select>
              <el-button
                class="toc-refresh-btn"
                type="text"
                @click="getChapterListByRule()"
                >{{ $t("source.refreshCatalog") }}</el-button
              >
            </div>
            <div v-if="isShowTocRule">
              <el-input
                type="textarea"
                :rows="2"
                v-model="importBookInfo.tocUrl"
                size="small"
              >
              </el-input>
            </div>
          </div>
        </div>
        <div class="chapter-title">
          {{ $t("book.chapterList") }}({{ importBookChapters.length }})
        </div>
        <div
          class="chapter-list"
          :style="{ maxHeight: dialogContentHeight - 40 - 35 + 'px' }"
        >
          <p v-for="(chapter, index) in importBookChapters" :key="index">
            {{ index + 1 }}. {{ chapter.title }}
          </p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="medium"
          @click="saveBook(importBookInfo, true)"
          >{{ $t("source.confirmImport") }}</el-button
        >
        <el-button size="medium" @click="showImportBookDialog = false">{{
          $t("common.cancel")
        }}</el-button>
      </div>
    </el-dialog>

    <LocalStore
      v-model="showLocalStoreManageDialog"
      @importFromLocalPathPreview="importMultiBooks"
    ></LocalStore>

    <WebDAV
      v-model="showWebDAVManageDialog"
      @importFromLocalPathPreview="importMultiBooks"
    ></WebDAV>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Explore from "../components/Explore.vue";
import LocalStore from "../components/LocalStore.vue";
import WebDAV from "../components/WebDAV.vue";
import Axios from "../plugins/axios";
import { errorTypeList } from "../plugins/config";
import { setCache, getCache } from "../plugins/cache";
import eventBus from "../plugins/eventBus";
import { formatSize, LimitResquest } from "../plugins/helper";
const buildURL = require("axios/lib/helpers/buildURL");
import { isInContainer } from "element-ui/src/utils/dom";
import Vue from "vue";

export default {
  components: {
    Explore,
    LocalStore,
    WebDAV
  },
  data() {
    return {
      search: "",
      searchTypeList: [
        { nameKey: "search.single", value: "single" },
        { nameKey: "search.multi", value: "multi" }
      ],
      isSearchResult: false,
      isExploreResult: false,
      searchResult: [],
      searchPage: 1,
      refreshLoading: false,
      searchLastIndex: -1,

      showBookEditButton: false,

      popExploreVisible: false,
      loadingMore: false,

      importSourceList: [],
      showImportSourceDialog: false,
      isImportRssSource: false,
      checkAll: false,
      isIndeterminate: false,
      checkedSourceIndex: [],

      showBookSourceManageDialog: false,
      manageSourceSelection: [],
      isShowFailureBookSource: false,
      checkBookSourceTip: "",
      isCheckingBookSource: false,

      showNavigation: false,

      navigationClass: "",
      navigationStyle: {},

      popIntroVisible: {},

      connecting: false,

      lastScrollTop: 0,

      localStorageAvaliable:
        window.localStorage &&
        window.localStorage.getItem &&
        window.localStorage.setItem,

      showSourceGroup: "",
      bookSourcePagination: {
        page: 1,
        size: 25
      },
      checkBookSourceConfig: {
        keyword: "",
        timeout: 5000,
        concurrent: 5
      },
      importBookInfo: {},
      importBookGroup: [],
      importBookChapters: [],
      showImportBookDialog: false,

      importMultiBookTip: "",

      rssSource: {},

      concurrentList: [12, 18, 24, 30, 36, 42, 48, 54, 60],

      localCacheStats: {
        total: "0 Bytes",
        bookSourceList: "0 Bytes",
        rssSources: "0 Bytes",
        chapterList: "0 Bytes",
        chapterContent: "0 Bytes"
      },

      showLocalStoreManageDialog: false,

      showWebDAVManageDialog: false,

      importUsedTxtRule: "",

      showAddUser: false,
      addUserForm: {
        username: "",
        password: ""
      }
    };
  },
  watch: {
    searchConfig: {
      handler(val) {
        this.$store.commit("setSearchConfig", val);
        if (this.isSearchResult) {
          this.searchBook(1);
        }
      },
      deep: true
    },
    searchResult(val) {
      if (this.isSearchResult && val.length) {
        this.$nextTick(() => {
          this.$refs.bookList.scrollTop = this.lastScrollTop;
        });
      }
    },
    collapseMenu(val) {
      if (!val) {
        this.navigationClass = "";
      } else if (!this.showNavigation) {
        this.navigationClass = "navigation-hidden";
      }
    },
    showNavigation(val) {
      if (!val) {
        this.navigationClass = "navigation-out";
        setTimeout(() => {
          this.navigationClass = "navigation-hidden";
        }, 300);
      } else {
        this.navigationClass = "navigation-in";
      }
    },
    loginAuth() {
      this.init(true);
    },
    userNS() {
      this.init(true);
    },
    importUsedTxtRule(val) {
      if (val) {
        this.importBookInfo.tocUrl = val;
      }
    },
    importBookGroup(val) {
      if (val && this.showImportBookDialog) {
        let groupId = 0;
        val.forEach(v => {
          groupId |= v;
        });
        this.importBookInfo.group = groupId;
      }
    },
    showBookGroup() {
      this.$nextTick(() => {
        setTimeout(this.ensureLoadBookCover);
      });
    }
  },
  mounted() {
    document.title = this.$t("app.title");
    this.navigationClass =
      this.collapseMenu && !this.showNavigation ? "navigation-hidden" : "";
    window.shelfPage = this;
    this.init();
    eventBus.$on("onSourceFileChange", (event, isRssSource) => {
      if (this._inactive) {
        return;
      }
      this.onSourceFileChange(event, isRssSource);
    });
    eventBus.$on("editBook", (book, isAdd, onSuccess) => {
      if (this._inactive) {
        return;
      }
      this.editBook(book, isAdd, onSuccess);
    });
  },
  activated() {
    document.title = this.$t("app.title");
    this.scanCacheStorage();
  },
  methods: {
    init(refresh) {
      this.$root.$children[0].init(refresh);
    },
    setLocaleConfig(locale) {
      this.$store.commit("setConfig", {
        ...this.$store.getters.config,
        locale
      });
    },
    setIP() {
      this.$prompt(
        this.$t("home.backendPromptMessage"),
        this.$t("home.backendPromptTitle"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          inputValue: this.api,
          // inputPattern: /^((2[0-4]\d|25[0-5]|[1]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[1]?\d\d?):([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|[1-6][0-5][0-5][0-3][0-5])$/,
          beforeClose: (action, instance, done) => {
            if (action === "confirm") {
              this.connecting = true;
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = this.$t("common.validating");
              var inputUrl = instance.inputValue.replace(/\/*$/g, "");
              this.loadBookshelf(inputUrl)
                .then(() => {
                  this.connecting = false;
                  instance.confirmButtonLoading = false;
                  done();
                  setCache("api_prefix", inputUrl);
                  this.$store.commit("setApi", inputUrl);
                  this.init();
                })
                .catch(() => {
                  instance.confirmButtonLoading = false;
                  instance.confirmButtonText = this.$t("common.confirm");
                });
            } else {
              done();
            }
          }
        }
      )
        .then(({ value }) => {
          this.$message({
            type: "success",
            message: this.$t("home.backendConnectSuccess", { value })
          });
        })
        .catch(() => {});
    },
    loadBookshelf(api, refresh) {
      api = api || this.api;
      if (!api) {
        this.$message.error(this.$t("source.needBackendApi"));
        this.$store.commit("setConnected", false);
        return Promise.reject(false);
      }

      if (!this.loading || !this.loading.visible) {
        this.loading = this.$loading({
          target: this.$refs.bookList,
          lock: true,
          text: refresh
            ? this.$t("book.refreshingInfo")
            : this.$t("book.loadingInfo"),
          spinner: "el-icon-loading",
          background: this.isNight ? "#222" : "#fff"
        });
      }

      if (
        !api.startsWith("http://") &&
        !api.startsWith("https://") &&
        !api.startsWith("//")
      ) {
        api = "//" + api;
      }

      return this.$root.$children[0].loadBookShelf(refresh, api).then(() => {
        this.loading.close();
      });
    },
    refreshShelf() {
      return this.loadBookshelf(null, true);
    },
    loadBookGroup(refresh) {
      return this.$root.$children[0].loadBookGroup(refresh);
    },
    loadBookSource(refresh) {
      return this.$root.$children[0].loadBookSource(refresh);
    },
    searchBook(page) {
      if (!this.$store.state.connected) {
        this.$message.error(this.$t("source.backendDisconnected"));
        return;
      }
      if (!this.search) {
        this.$message.error(this.$t("source.keywordRequired"));
        return;
      }
      if (
        this.searchConfig.searchType === "single" &&
        !this.searchConfig.bookSourceUrl
      ) {
        this.$message.error(this.$t("source.sourceRequired"));
        return;
      }
      if (page) {
        this.searchPage = page;
      }
      page = this.searchPage;
      if (page === 1) {
        this.searchLastIndex = -1;
      }
      if (this.searchConfig.searchType === "multi" && window.EventSource) {
        this.searchBookByEventStream(page);
        return;
      }
      if (this.loadingMore) {
        return;
      }
      this.isSearchResult = true;
      this.isExploreResult = false;
      this.loadingMore = true;
      if (page === 1) {
        this.searchResult = [];
      }
      Axios.post(
        this.api +
          (this.searchConfig.searchType === "single"
            ? "/searchBook"
            : "/searchBookMulti"),
        {
          key: this.search,
          bookSourceUrl: this.searchConfig.bookSourceUrl,
          bookSourceGroup: this.searchConfig.bookSourceGroup,
          concurrentCount: this.searchConfig.concurrentCount,
          lastIndex: this.searchLastIndex,
          page: page
        },
        {
          timeout: this.searchConfig.searchType === "single" ? 30000 : 180000
        }
      ).then(
        res => {
          this.loadingMore = false;
          if (res.data.isSuccess) {
            //
            let resultList = [];
            if (this.searchConfig.searchType === "single") {
              resultList = res.data.data;
            } else {
              this.searchLastIndex = res.data.data.lastIndex;
              resultList = res.data.data.list;
            }
            var data = [].concat(this.searchResult);
            var length = data.length;
            resultList.forEach(v => {
              if (!this.searchResultMap[v.bookUrl]) {
                data.push(v);
              }
            });
            this.searchResult = data;
            if (data.length === length) {
              this.$message.error(this.$t("common.noMore"));
            }
          }
        },
        error => {
          this.$message.error(
            this.$t("source.searchBookFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    searchBookByEventStream(page) {
      const tryClose = () => {
        try {
          if (
            this.searchEventSource &&
            this.searchEventSource.readyState != this.searchEventSource.CLOSED
          ) {
            this.searchEventSource.close();
          }
          this.searchEventSource = null;
        } catch (error) {
          //
        }
      };
      if (this.loadingMore) {
        tryClose();
        this.loadingMore = false;
        if (page !== 1) {
          return;
        }
      }
      const params = {
        accessToken: this.$store.state.token,
        key: this.search,
        bookSourceUrl: this.searchConfig.bookSourceUrl,
        bookSourceGroup: this.searchConfig.bookSourceGroup,
        concurrentCount: this.searchConfig.concurrentCount,
        lastIndex: this.searchLastIndex,
        page: page
      };

      this.isSearchResult = true;
      this.isExploreResult = false;
      this.loadingMore = true;
      if (page === 1) {
        this.searchResult = [];
      }
      const url = buildURL(this.api + "/searchBookMultiSSE", params);

      tryClose();

      this.searchEventSource = new EventSource(url, {
        withCredentials: true
      });
      this.searchEventSource.addEventListener("error", e => {
        this.loadingMore = false;
        tryClose();
        try {
          if (e.data) {
            const result = JSON.parse(e.data);
            if (result && result.errorMsg) {
              this.$message.error(result.errorMsg);
            }
          }
        } catch (error) {
          //
        }
      });
      let oldSearchResultLength = this.searchResult.length;
      this.searchEventSource.addEventListener("end", e => {
        this.loadingMore = false;
        tryClose();
        try {
          if (e.data) {
            const result = JSON.parse(e.data);
            if (result && result.lastIndex) {
              this.searchLastIndex = result.lastIndex;
            }
          }
          if (this.searchResult.length === oldSearchResultLength) {
            this.$message.error(this.$t("common.noMore"));
          }
        } catch (error) {
          //
        }
      });
      this.searchEventSource.addEventListener("message", e => {
        try {
          if (e.data) {
            const result = JSON.parse(e.data);
            if (result && result.lastIndex) {
              this.searchLastIndex = result.lastIndex;
            }
            if (result.data) {
              var data = [].concat(this.searchResult);
              result.data.forEach(v => {
                if (!this.searchResultMap[v.bookUrl]) {
                  data.push(v);
                }
              });
              this.searchResult = data;
            }
          }
        } catch (error) {
          //
        }
      });
    },
    toDetail(book) {
      if (!book.bookUrl) {
        return;
      }
      if (this.isSearchResult) {
        // return;
      }
      this.$store.commit("setReadingBook", {
        name: book.name,
        bookUrl: book.bookUrl,
        index: book.index ?? book.durChapterIndex ?? 0,
        type: book.type,
        coverUrl: this.getBookCoverUrl(book),
        tocUrl: book.tocUrl,
        author: book.author,
        origin: book.origin,
        originName: book.originName,
        latestChapterTitle: book.latestChapterTitle,
        intro: book.intro
      });
      this.$router.push({
        path: "/reader" + (this.isSearchResult ? "?search=1" : "")
      });
    },
    async addBookToShelf(book) {
      const customImportBookInfo = await this.customImportBookInfo({
        title: this.$t("book.setGroup"),
        cancelButtonText: this.$t("book.skipAddToShelf")
      });
      if (customImportBookInfo === false) {
        return;
      }
      this.saveBook({ ...book, ...customImportBookInfo });
    },
    saveBook(book, isImport, isEdit) {
      if (!book || !book.bookUrl || !book.origin) {
        this.$message.error(this.$t("source.bookInfoError"));
        return Promise.reject(false);
      }
      return Axios.post(this.api + "/saveBook", book).then(
        res => {
          if (res.data.isSuccess) {
            //
            if (isImport) {
              this.showImportBookDialog = false;
            }
            this.$message.success(
              isImport
                ? this.$t("book.importSuccess")
                : isEdit
                ? this.$t("book.editBookSuccess")
                : this.$t("book.addToShelfSuccess")
            );
            if (!isEdit) {
              this.loadBookshelf();
            } else {
              this.$store.commit("updateShelfBook", res.data.data);
            }
            return res.data.data;
          }
        },
        error => {
          this.$message.error(
            isImport
              ? this.$t("book.importFailed", {
                  message: error && error.toString()
                })
              : isEdit
              ? this.$t("book.editBookFailed", {
                  message: error && error.toString()
                })
              : this.$t("book.addToShelfFailed", {
                  message: error && error.toString()
                })
          );
        }
      );
    },
    async deleteBook(book) {
      if (!book || (!book.name && !book.bookUrl)) {
        this.$message.error(this.$t("source.bookInfoError"));
        return;
      }
      const res = await this.$confirm(
        this.$t("book.confirmDeleteWithProgress"),
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
      Axios.post(this.api + "/deleteBook", book).then(
        res => {
          if (res.data.isSuccess) {
            //
            this.$message.success(this.$t("common.deleteSuccess"));
            this.loadBookshelf();
          }
        },
        error => {
          this.$message.error(
            this.$t("common.deleteFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    editBook(book, isAdd, onSuccess) {
      if (!book || !book.name || !book.bookUrl || !book.origin) {
        this.$message.error(this.$t("source.bookInfoError"));
        return;
      }
      const bookInfo = { ...book };
      delete bookInfo["variableMap$delegate"];
      eventBus.$emit(
        "showEditor",
        isAdd ? this.$t("book.saveBook") : this.$t("book.editBook"),
        JSON.stringify(bookInfo, null, 4),
        async (content, close) => {
          try {
            const newBook = JSON.parse(content);
            if (!newBook.name) {
              this.$message.error(this.$t("source.bookNameRequired"));
              return;
            }
            if (!newBook.bookUrl) {
              this.$message.error(this.$t("source.bookUrlRequired"));
              return;
            }
            if (!newBook.origin) {
              this.$message.error(this.$t("source.bookOriginRequired"));
              return;
            }
            if (isAdd) {
              const res = await this.$confirm(
                this.$t("book.confirmAddBeforeEdit"),
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
            }
            this.saveBook(newBook, false, true).then(() => {
              close();
              if (onSuccess) {
                onSuccess();
              }
            });
          } catch (e) {
            this.$message.error(this.$t("source.bookJsonRequired"));
          }
        }
      );
    },
    currentDateTime() {
      const now = new Date();
      const pad = a => (a < 10 ? "0" + a : a);
      return (
        now.getFullYear() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        "_" +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds())
      );
    },
    dateFormat(t) {
      let time = new Date().getTime();
      let int = parseInt((time - t) / 1000);
      let str = "";

      if (int <= 30) {
        str = this.$t("time.justNow");
      } else if (int < 60) {
        str = this.$t("time.secondsAgo", { count: int });
      } else if (int < 3600) {
        str = this.$t("time.minutesAgo", { count: parseInt(int / 60) });
      } else if (int < 86400) {
        str = this.$t("time.hoursAgo", { count: parseInt(int / 3600) });
      } else if (int < 2592000) {
        str = this.$t("time.daysAgo", { count: parseInt(int / 86400) });
      } else if (int < 31536000) {
        str = this.$t("time.monthsAgo", { count: parseInt(int / 2592000) });
      } else {
        str = this.$t("time.yearsAgo", { count: parseInt(int / 31536000) });
      }
      return str;
    },
    backToShelf() {
      this.isSearchResult = false;
      this.isExploreResult = false;
      this.searchResult = [];
      this.loadingMore = false;
    },
    toogleNight() {
      if (this.isNight) {
        this.$store.commit("setNightTheme", false);
      } else {
        this.$store.commit("setNightTheme", true);
      }
    },
    showSearchList(data) {
      this.isSearchResult = true;
      this.isExploreResult = true;
      this.loadingMore = false;
      this.searchResult = data;
    },
    loadMore() {
      this.lastScrollTop = this.$refs.bookList.scrollTop;
      if (this.isExploreResult) {
        this.loadingMore = true;
        this.$refs.popExplore.loadMore();
      } else {
        this.searchBook(this.searchPage + 1);
      }
    },
    uploadBookSource() {
      this.$refs.fileRef.dispatchEvent(new MouseEvent("click"));
    },
    onSourceFileChange(event, isRssSource) {
      const rawFile = event.target.files && event.target.files[0];
      if (
        rawFile &&
        /\.(epub|umd)$/i.test(rawFile.name) &&
        !/\.json$/i.test(rawFile.name)
      ) {
        this.$message.error(this.$t("source.bookFileSelectedAsSource"));
        this.$refs.fileRef.value = null;
        return;
      }
      // console.log("rawFile", rawFile);
      const reader = new FileReader();
      const sourceTypeName = isRssSource
        ? this.$t("rss.sourceType")
        : this.$t("source.sourceType");
      reader.onload = e => {
        const data = e.target.result;
        try {
          const sourceList = JSON.parse(data);
          if (Array.isArray(sourceList) && sourceList.length) {
            this.importSourceList = sourceList.map(v => {
              if (v.headerMap) {
                if (!v.header) {
                  v.header =
                    typeof v.headerMap === "string"
                      ? v.headerMap
                      : JSON.stringify(v.headerMap);
                }
                delete v.headerMap;
              }
              return v;
            });
            this.showImportSourceDialog = true;
            this.isImportRssSource = !!isRssSource;
          } else {
            this.$message.error(
              this.$t("source.sourceFileError", { type: sourceTypeName })
            );
          }
        } catch (error) {
          this.$message.error(
            this.$t("source.sourceFileError", { type: sourceTypeName })
          );
        }
      };
      reader.onerror = () => {
        // console.log("FileReader error", e);
        let param = new FormData();
        param.append("file", rawFile);
        Axios.post(this.api + "/readSourceFile", param, {
          headers: { "Content-Type": "multipart/form-data" }
        }).then(
          res => {
            if (res.data.isSuccess) {
              //
              let sourceList = [];
              res.data.data.forEach(v => {
                try {
                  const data = JSON.parse(v);
                  if (Array.isArray(data)) {
                    sourceList = sourceList.concat(data);
                  }
                } catch (error) {
                  //
                }
              });
              if (sourceList.length) {
                this.importSourceList = sourceList.map(v => {
                  if (v.headerMap) {
                    if (!v.header) {
                      v.header =
                        typeof v.headerMap === "string"
                          ? v.headerMap
                          : JSON.stringify(v.headerMap);
                    }
                    delete v.headerMap;
                  }
                  return v;
                });
                this.showImportSourceDialog = true;
                this.isImportRssSource = !!isRssSource;
              } else {
                this.$message.error(
                  this.$t("source.sourceFileError", { type: sourceTypeName })
                );
              }
            }
          },
          error => {
            this.$message.error(
              this.$t("source.sourceFileReadFailed", {
                type: sourceTypeName,
                message: error && error.toString()
              })
            );
          }
        );
      };
      reader.readAsText(rawFile);
      if (this.isRssSource) {
        this.$refs.rssInputRef.value = null;
      } else {
        this.$refs.fileRef.value = null;
      }
    },
    async loadRemoteBookSource() {
      const lastRemoteSourceUrl = getCache(
        this.currentUserName + "@lastRemoteSourceUrl",
        ""
      );
      const res = await this.$prompt(
        this.$t("source.remoteSourcePrompt"),
        this.$t("source.remoteSourceTitle"),
        {
          inputValue: lastRemoteSourceUrl || "",
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel")
        }
      ).catch(() => {
        return false;
      });
      if (!res || !res.value) {
        return;
      }
      Axios.post(this.api + "/readRemoteSourceFile", {
        url: res.value
      }).then(
        res => {
          if (res.data.isSuccess) {
            setCache(this.currentUserName + "@lastRemoteSourceUrl", res.value);
            //
            let sourceList = [];
            res.data.data.forEach(v => {
              try {
                const data = JSON.parse(v);
                if (Array.isArray(data)) {
                  sourceList = sourceList.concat(data);
                }
              } catch (error) {
                //
              }
            });
            if (sourceList.length) {
              this.importSourceList = sourceList;
              this.showImportSourceDialog = true;
              this.isImportRssSource = false;
            } else {
              this.$message.error(this.$t("source.remoteSourceFileError"));
            }
          }
        },
        error => {
          this.$message.error(
            this.$t("source.remoteSourceFileReadFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    handleCheckAllChange(val) {
      let hasFilterd = false;
      this.checkedSourceIndex = val
        ? this.importSourceList
            .map((v, i) => {
              const source = JSON.stringify(v);
              if (
                source.indexOf("@js:") !== -1 ||
                source.indexOf("webView:") !== -1
              ) {
                hasFilterd = true;
                return false;
              }
              return i;
            })
            .filter(v => v)
        : [];
      if (val && hasFilterd) {
        this.$message.info(this.$t("source.javascriptWebviewNotChecked"));
      }
      this.isIndeterminate = false;
    },
    handleCheckedSourcesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.importSourceList.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.importSourceList.length;
    },
    getSourceTag(source) {
      const sourceStr = JSON.stringify(source);
      const tags = [];
      if (sourceStr.indexOf("@js:") !== -1) {
        tags.push("@Javascript");
      }

      if (sourceStr.indexOf("webView:") !== -1) {
        tags.push("@WebView");
      }

      return "   " + tags.join("  ");
    },
    saveSourceList() {
      if (!this.$store.state.connected) {
        this.$message.error(this.$t("source.backendDisconnected"));
        return;
      }
      if (!this.checkedSourceIndex.length) {
        this.$message.error(this.$t("source.importSourceRequired"));
        return;
      }
      const sourceList = this.checkedSourceIndex.map(
        v => this.importSourceList[v]
      );
      Axios.post(
        this.api +
          (this.isImportRssSource ? "/saveRssSources" : "/saveBookSources"),
        sourceList
      ).then(
        res => {
          if (res.data.isSuccess) {
            //
            this.$message.success(
              this.isImportRssSource
                ? this.$t("rss.importSuccess")
                : this.$t("source.importSuccess")
            );
            if (this.isImportRssSource) {
              this.loadRssSources(true);
            } else {
              this.loadBookSource(true);
            }
            this.showImportSourceDialog = false;
            this.isImportRssSource = false;
            this.checkedSourceIndex = [];
          }
        },
        error => {
          this.$message.error(
            this.isImportRssSource
              ? this.$t("rss.importFailed", {
                  message: error && error.toString()
                })
              : this.$t("source.importFailed", {
                  message: error && error.toString()
                })
          );
        }
      );
    },
    isBookSourceSelectable(bookSource) {
      const res = [];
      (this.$store.state.shelfBooks || []).forEach(v => {
        if (v.origin === bookSource.bookSourceUrl) {
          res.push(v.name);
        }
      });
      return !res.length;
    },
    showSourceBook(bookSource) {
      const res = [];
      (this.$store.state.shelfBooks || []).forEach(v => {
        if (v.origin === bookSource.bookSourceUrl) {
          res.push(v.name);
        }
      });
      return res.join("\n");
    },
    getInvalidBookSources() {
      if (!this.$store.state.connected) {
        this.$message.error(this.$t("source.backendDisconnected"));
        return;
      }
      Axios.post(this.api + "/getInvalidBookSources").then(
        res => {
          if (res.data.isSuccess) {
            //
            res.data.data.forEach(v => {
              this.$store.commit("addFailureBookSource", {
                bookSourceUrl: v.sourceUrl,
                errorMsg: v.error
              });
            });
          }
        },
        () => {
          //
        }
      );
    },
    async checkBookSource() {
      if (!this.checkBookSourceConfig.keyword) {
        this.$message.error(this.$t("source.keywordRequired"));
        return;
      }
      this.isCheckingBookSource = true;
      this.$store.commit("setFailureIncludeTimeout", true);
      const limitFunc = LimitResquest(
        this.checkBookSourceConfig.concurrent,
        handler => {
          this.checkBookSourceTip =
            handler.requestCount + "/" + this.bookSourceList.length;
          if (handler.isEnd()) {
            this.isCheckingBookSource = false;
            this.$store.commit("setFailureIncludeTimeout", false);
          }
        }
      );
      this.bookSourceList.forEach(v => {
        limitFunc(() => {
          return Axios.post(
            this.api + "/searchBook",
            {
              key: this.checkBookSourceConfig.keyword,
              bookSourceUrl: v.bookSourceUrl
            },
            {
              timeout: this.checkBookSourceConfig.timeout,
              silent: true
            }
          );
        });
      });
    },
    async deleteBookSourceList() {
      if (!this.manageSourceSelection.length) {
        this.$message.error(this.$t("source.sourceDeleteRequired"));
        return;
      }
      const res = await this.$confirm(
        this.$t("source.confirmDeleteSources"),
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
      Axios.post(
        this.api + "/deleteBookSources",
        this.manageSourceSelection
      ).then(
        res => {
          if (res.data.isSuccess) {
            this.$store.commit(
              "removeFailureBookSource",
              this.manageSourceSelection
            );
            this.manageSourceSelection = [];
            this.$message.success(this.$t("source.deleteSourceSuccess"));
            this.loadBookSource(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("source.deleteSourceFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    toggleMenu() {
      if (this.collapseMenu) {
        this.showNavigation = !this.showNavigation;
      }
    },
    showExplorePop() {
      setTimeout(() => {
        this.popExploreVisible = true;
      }, 100);
    },
    showBookInfoDialog(book) {
      eventBus.$emit("showBookInfoDialog", book);
    },
    async saveUserConfig() {
      if (!window.localStorage) {
        this.$message.error(this.$t("source.localStorageUnsupported"));
        return;
      }
      const res = await this.$confirm(
        this.$t("source.confirmBackupUserConfig"),
        this.$t("common.tip")
      ).catch(() => {
        return false;
      });
      if (!res) {
        return;
      }
      const userConfig = {};
      ["config", "shelfConfig", "searchConfig", "customConfigList"].forEach(
        key => {
          const val = getCache(key);
          if (val) {
            userConfig[key] = val;
          }
        }
      );
      Axios.post(this.api + "/saveUserConfig", userConfig).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("source.backupSuccess"));
          }
        },
        error => {
          this.$message.error(
            this.$t("source.backupFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async restoreUserConfig() {
      if (!window.localStorage) {
        this.$message.error(this.$t("source.localStorageUnsupported"));
        return;
      }
      const res = await this.$confirm(
        this.$t("source.confirmRestoreUserConfig"),
        this.$t("common.tip")
      ).catch(() => {
        return false;
      });
      if (!res) {
        return;
      }
      Axios.get(this.api + "/getUserConfig").then(
        res => {
          if (res.data.isSuccess) {
            for (const key in res.data.data) {
              if (Object.hasOwnProperty.call(res.data.data, key)) {
                setCache(key, res.data.data[key]);
              }
            }
            this.$store.dispatch("syncFromLocalStorage");
            this.$message.success(this.$t("source.restoreSuccess"));
          }
        },
        error => {
          this.$message.error(
            this.$t("source.restoreFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    loadUserList() {
      if (!this.$store.state.connected) {
        this.$message.error(this.$t("source.backendDisconnected"));
        return;
      }
      Axios.get(this.api + "/getUserList").then(
        res => {
          if (res.data.isSuccess) {
            this.userNS = this.$store.state.userInfo.username;
            this.userList = res.data.data.map(v => ({
              ...v,
              userNS: v.username
            }));
            this.$store.commit("setIsManagerMode", true);
          }
        },
        error => {
          this.$message.error(
            this.$t("user.loadUserSpaceFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    formatTableField(row, column, cellValue) {
      switch (column.property) {
        case "createdAt":
        case "lastLoginAt":
        case "lastModified":
          return cellValue ? new Date(cellValue).format("yy-MM-dd hh:mm") : "";
        case "size":
          return row.isDirectory ? "" : formatSize(cellValue);
        default:
          return cellValue;
      }
    },
    exitSecureMode() {
      this.userNS = "default";
      this.userList = [];
      this.$store.commit("setIsManagerMode", false);
      this.init(true);
    },
    async backupToWebdav() {
      const res = await this.$confirm(
        this.$t("source.confirmBackupToWebdav"),
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
      Axios.post(this.api + "/backupToWebdav").then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("source.backupSuccess"));
          }
        },
        error => {
          this.$message.error(
            this.$t("source.backupFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    handleTouchStart(e) {
      this.lastTouch = false;
      this.lastMoveX = false;
      this.touchMoveTimes = 0;
      if (
        e.touches &&
        e.touches[0] &&
        e.touches[0].clientX > 20 &&
        e.touches[0].clientX < window.innerWidth - 20 &&
        e.touches[0].clientY > 20 &&
        e.touches[0].clientY < window.innerHeight - 20
      ) {
        this.lastTouch = e.touches[0];
      }
    },
    handleTouchMove(e) {
      if (e.touches && e.touches[0] && this.lastTouch) {
        if (this.collapseMenu) {
          const moveX = e.touches[0].clientX - this.lastTouch.clientX;
          const moveY = e.touches[0].clientY - this.lastTouch.clientY;
          if (Math.abs(moveY) > Math.abs(moveX)) {
            this.navigationStyle = {};
            this.lastMoveX = 0;
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          if (!this.showNavigation && moveX > 0 && moveX <= 270) {
            if (this.touchMoveTimes % 3 === 0) {
              this.navigationStyle = {
                marginLeft: moveX - 270 + "px"
              };
            }
            this.lastMoveX = moveX;
          } else if (this.showNavigation && moveX < 0 && moveX >= -270) {
            if (this.touchMoveTimes % 3 === 0) {
              this.navigationStyle = {
                marginLeft: moveX + "px"
              };
            }
            this.lastMoveX = moveX;
          }
          this.touchMoveTimes++;
        }
      }
    },
    handleTouchEnd() {
      if (this.collapseMenu) {
        if (this.lastMoveX > 0) {
          this.showNavigation = true;
          this.navigationStyle = {};
        } else if (this.lastMoveX < 0) {
          this.showNavigation = false;
          this.navigationStyle = {};
        }
      }
    },
    showFailureBookSource() {
      this.getInvalidBookSources();
      this.isShowFailureBookSource = true;
      this.showBookSourceManageDialog = true;
    },
    debugBookSource() {
      window.open(
        window.location.origin +
          window.location.pathname +
          "bookSourceDebug/#domain=" +
          this.api,
        "_target"
      );
    },
    setShowSourceGroup(group) {
      if (this.showSourceGroup === group) {
        this.showSourceGroup = "";
      } else {
        this.showSourceGroup = group;
      }
    },
    importLocalBook() {
      this.$refs.bookRef.dispatchEvent(new MouseEvent("click"));
    },
    onBookFileChange(event) {
      if (!event.target || !event.target.files || !event.target.files.length) {
        return;
      }
      let param = new FormData();
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        param.append("file" + i, file);
      }
      Axios.post(this.api + "/importBookPreview", param, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(
        res => {
          if (res.data.isSuccess && res.data.data.length) {
            if (res.data.data.length > 1) {
              this.importMultiBooks(res.data.data);
            } else {
              //
              this.importBookInfo = res.data.data[0].book;
              this.importBookGroup = [];
              this.importBookChapters = res.data.data[0].chapters;
              this.showImportBookDialog = true;
            }
          }
        },
        error => {
          this.$message.error(
            this.$t("file.uploadBooksFailed", {
              message: error && error.toString()
            })
          );
        }
      );
      this.$refs.bookRef.value = null;
    },
    async importMultiBooks(books) {
      if (!books || !books.length) {
        return;
      }
      if (books.length == 1) {
        this.importBookInfo = books[0].book;
        this.importBookGroup = [];
        this.importBookChapters = books[0].chapters;
        this.showImportBookDialog = true;
        return;
      }
      const res = await this.$confirm(
        this.$t("book.confirmMultiImportMode"),
        this.$t("common.tip"),
        {
          confirmButtonText: this.$t("book.batchImport"),
          cancelButtonText: this.$t("book.importOneByOne"),
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
      if (res) {
        const customImportBookInfo = await this.customImportBookInfo();
        if (customImportBookInfo === false) {
          return;
        }
        for (let i = 0; i < books.length; i++) {
          const book = books[i];
          await this.saveBook(
            { ...book.book, ...customImportBookInfo },
            true
          ).catch(() => {});
        }
      } else {
        for (let i = 0; i < books.length; i++) {
          const book = books[i];
          this.importMultiBookTip = `（${i + 1}/${books.length}）`;
          await this.waitForImportBook(book);
        }
        this.importMultiBookTip = "";
      }
    },
    waitForImportBook(bookInfo) {
      return new Promise(resolve => {
        this.importBookInfo = bookInfo.book;
        this.importBookGroup = [];
        this.importBookChapters = bookInfo.chapters;
        this.showImportBookDialog = true;
        this.$once("importEnd", resolve);
      });
    },
    importBookDialogClosed() {
      const url = this.importBookInfo.bookUrl;
      this.importBookInfo = {};
      this.importBookGroup = [];
      this.importBookChapters = [];
      this.importUsedTxtRule = "";
      this.$nextTick(() => {
        this.$emit("importEnd");
      });

      Axios.post(
        this.api + "/deleteFile",
        {
          url
        },
        {
          silent: true
        }
      ).then(
        () => {
          //
        },
        () => {
          //
        }
      );
    },
    async customImportBookInfo(options) {
      this.importBookGroup = [];
      const res = await this.$msgbox({
        title: this.$t("book.setGroupForAll"),
        message: this.renderComp(),
        showCancelButton: true,
        confirmButtonText: this.$t("common.confirm"),
        cancelButtonText: this.$t("book.cancelImport"),
        ...(options || {})
      }).catch(action => {
        return action === "close" ? "close" : false;
      });
      if (res === "confirm") {
        return {
          group: this.importBookGroup.reduce((v, c) => v | c, 0)
        };
      } else {
        return false;
      }
    },
    renderComp() {
      var bookGroupList = this.bookGroupSetList;
      var shelf = this;
      Vue.component("custComp", {
        render() {
          return (
            <div style={{ textAlign: "center" }}>
              <span>{shelf.$t("source.selectGroup")}</span>
              <el-select
                size="mini"
                vModel={this.importBookGroup}
                ref="bookGroupSelect"
                filterable={true}
                multiple={true}
                placeholder={shelf.$t("book.ungrouped")}
                vOn:change={this.change}
              >
                {bookGroupList.map((bookGroup, index) => {
                  return (
                    <el-option
                      key={"bookGroup-" + index}
                      label={bookGroup.groupName}
                      value={bookGroup.groupId}
                    ></el-option>
                  );
                })}
              </el-select>
            </div>
          );
        },
        data() {
          return {
            importBookGroup: []
          };
        },
        methods: {
          change() {
            shelf.importBookGroup = this.importBookGroup;
          }
        }
      });
      var custComp = Vue.component("custComp");
      return this.$createElement(custComp);
    },
    showBookManage() {
      eventBus.$emit("showBookManageDialog");
    },
    showManageBookGroup() {
      this.loadBookGroup(true);
      eventBus.$emit("showBookGroupDialog", false);
    },
    getShowShelfBooks(bookGroup) {
      if (bookGroup === -1) {
        return this.shelfBooks;
      } else if (bookGroup === -2) {
        return this.shelfBooks.filter(v => v.origin === "loc_book");
      } else if (bookGroup === -3) {
        return this.shelfBooks.filter(v => v.type === 1);
      } else if (bookGroup === -4) {
        return this.shelfBooks.filter(v => v.group === 0);
      }

      return this.shelfBooks.filter(v =>
        bookGroup === 0 ? true : v.group & bookGroup
      );
    },
    loadRssSources(refresh) {
      return this.$root.$children[0].loadRssSources(refresh);
    },
    showRssDialog() {
      eventBus.$emit("showRssSourceListDialog");
    },
    showRssArticleListDialog(source) {
      eventBus.$emit("showRssArticleListDialog", source);
    },
    noop() {},
    exportBookSource() {
      Axios.get(this.api + "/getBookSources").then(
        res => {
          if (res.data.isSuccess) {
            const aEle = document.createElement("a");
            const blob = new Blob([
              JSON.stringify(res.data.data || [], null, 4)
            ]);

            aEle.download =
              "reader-sources-" + this.currentDateTime() + ".json";
            aEle.href = URL.createObjectURL(blob);
            aEle.click();
          }
        },
        error => {
          this.$message.error(
            this.$t("source.exportSourceFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async deleteAllBookSource() {
      const res = await this.$confirm(
        this.$t("source.confirmClearSources"),
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
      Axios.post(this.api + "/deleteAllBookSources").then(
        res => {
          if (res.data.isSuccess) {
            //
            this.$message.success(this.$t("source.clearSourcesSuccess"));
            this.loadBookSource(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("source.clearSourcesFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async deleteBookSourceFile() {
      const res = await this.$confirm(
        this.$t("source.confirmRestoreDefaultSources"),
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
      Axios.post(this.api + "/deleteBookSourcesFile").then(
        res => {
          if (res.data.isSuccess) {
            //
            this.$message.success(
              this.$t("source.restoreDefaultSourcesSuccess")
            );
            this.loadBookSource(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("common.operationFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    editBookSource(bookSource) {
      const editHandler = data => {
        eventBus.$emit(
          "showEditor",
          this.$t("source.editSource"),
          JSON.stringify(data, null, 4),
          (content, close) => {
            try {
              const source = JSON.parse(content);
              if (!source.bookSourceName) {
                this.$message.error(this.$t("source.sourceNameRequired"));
                return;
              }
              if (!source.bookSourceUrl) {
                this.$message.error(this.$t("source.sourceUrlRequired"));
                return;
              }
              Axios.post(this.api + "/saveBookSource", source).then(
                res => {
                  if (res.data.isSuccess) {
                    //
                    close();
                    this.$message.success(this.$t("source.saveSourceSuccess"));
                    this.loadBookSource(true);
                  }
                },
                error => {
                  this.$message.error(
                    this.$t("source.saveSourceFailed", {
                      message: error && error.toString()
                    })
                  );
                }
              );
            } catch (e) {
              this.$message.error(this.$t("source.sourceJsonRequired"));
            }
          }
        );
      };
      if (!bookSource) {
        editHandler({
          bookSourceComment: "",
          bookSourceGroup: "",
          bookSourceName: this.$t("source.addSource"),
          bookSourceType: 0,
          bookSourceUrl: "",
          bookUrlPattern: "",
          enabled: true,
          enabledExplore: true,
          exploreUrl: "",
          ruleBookInfo: {},
          ruleContent: {
            content: ""
          },
          ruleExplore: {},
          ruleSearch: {
            author: "",
            bookList: "",
            bookUrl: "",
            coverUrl: "",
            intro: "",
            kind: "",
            lastChapter: "",
            name: ""
          },
          ruleToc: {
            chapterList: "",
            chapterName: "",
            chapterUrl: ""
          },
          searchUrl: ""
        });
        return;
      }
      Axios.post(this.api + "/getBookSource", {
        bookSourceUrl: bookSource.bookSourceUrl
      }).then(
        res => {
          if (res.data.isSuccess) {
            //
            editHandler(res.data.data);
          }
        },
        error => {
          this.$message.error(
            this.$t("source.loadSourceInfoFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    updateForce() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then(async function(registrations) {
            /* eslint-disable-next-line no-console */
            console.log("registrations", registrations);
            for (let i = 0; i < registrations.length; i++) {
              await registrations[i].update();
            }

            /* eslint-disable-next-line no-console */
            console.log("Try to clear home cache");
            navigator.serviceWorker.controller &&
              navigator.serviceWorker.controller.postMessage({
                type: "CLEAR_HOME_CACHE"
              });

            /* eslint-disable-next-line no-console */
            console.log("Try to skip waiting");
            navigator.serviceWorker.controller &&
              navigator.serviceWorker.controller.postMessage({
                type: "SKIP_WAITING"
              });

            setTimeout(() => {
              /* eslint-disable-next-line no-console */
              console.log("Try to reload force");
              window.location.reload(true);
            }, 50);
          });
      }
    },
    async scanCacheStorage() {
      this.localCacheStats = {
        total: (await this.analyseLocalStorage()).totalBytes,
        bookSourceList: (await this.analyseLocalStorage("bookSourceList"))
          .totalBytes,
        rssSources: (await this.analyseLocalStorage("rssSources")).totalBytes,
        chapterList: (await this.analyseLocalStorage("chapterList")).totalBytes,
        chapterContent: (await this.analyseLocalStorage("chapterContent"))
          .totalBytes
      };
    },
    analyseLocalStorage(match) {
      let totalBytes = 0;
      let cacheBytes = 0;
      return window.$cacheStorage
        .iterate(function(value, key) {
          if (!match || key.indexOf(match) >= 0) {
            totalBytes += JSON.stringify(value).getBytesLength();
            if (key.startsWith("localCache@")) {
              cacheBytes += JSON.stringify(value).getBytesLength();
            }
          }
        })
        .then(() => {
          return {
            totalBytes: formatSize(totalBytes),
            cacheBytes: formatSize(cacheBytes)
          };
        })
        .catch(function() {
          // console.log(err);
        });
    },
    clearCache(match) {
      let cacheBytes = 0;
      window.$cacheStorage
        .iterate(function(value, key) {
          if (!match || key.indexOf(match) >= 0) {
            if (key.startsWith("localCache@")) {
              cacheBytes += JSON.stringify(value).getBytesLength();
              window.$cacheStorage.removeItem(key);
            }
          }
        })
        .then(() => {
          this.scanCacheStorage();

          return {
            cacheBytes: formatSize(cacheBytes)
          };
        })
        .catch(function() {
          // console.log(err);
        });
    },
    scrollHandler() {
      this.lastScrollTop = this.$refs.bookList.scrollTop;
    },
    getBookCoverUrl(book) {
      return book.customCoverUrl || book.coverUrl;
    },
    logout() {
      Axios.post(this.api + "/logout").then(
        res => {
          if (res.data.isSuccess) {
            this.$store.commit("setToken", "");
            window.location.reload(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("auth.logoutFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    getChapterListByRule() {
      return Axios.post("/getChapterListByRule", this.importBookInfo).then(
        res => {
          if (res.data.isSuccess && res.data.data.book) {
            this.importBookInfo = res.data.data.book;
            this.importBookChapters = res.data.data.chapters;
          }
        },
        error => {
          this.$message.error(
            this.$t("source.refreshCatalogFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    showUserManageDialog() {
      eventBus.$emit("showUserManageDialog");
    },
    showMPCode() {
      eventBus.$emit("showMPCodeDialog");
    },
    joinTGChannel() {
      window.open("https://t.me/facker_channel", "_target");
    },
    ensureLoadBookCover() {
      this.$refs.bookList.dispatchEvent(new MouseEvent("scroll"));

      this.$refs.bookCoverList.forEach(v => {
        if (!v.show && isInContainer(v.$el, this.$refs.bookList)) {
          // console.log("not show ", v);
          v.show = true;
        }
      });
    }
  },
  computed: {
    ...mapGetters([
      "collapseMenu",
      "dialogWidth",
      "dialogSmallWidth",
      "dialogTop",
      "dialogContentHeight",
      "popupWidth"
    ]),
    config() {
      return this.$store.getters.config;
    },
    isNight() {
      return this.$store.getters.isNight;
    },
    themeColor() {
      if (this.$store.getters.isNight) {
        return {
          background: "#f7f7f7"
        };
      } else {
        return {
          background: "#222"
        };
      }
    },
    bookList() {
      return this.isSearchResult ? this.searchResult : this.showShelfBooks;
    },
    bookCoverList() {
      return this.bookList
        .filter(v => this.getBookCoverUrl(v))
        .map(v => this.getCover(this.getBookCoverUrl(v), true));
    },
    shelfBooks() {
      return this.$store.getters.shelfBooks;
    },
    showShelfBooks() {
      return this.getShowShelfBooks(this.showBookGroup);
    },
    searchResultMap() {
      return this.searchResult.reduce((c, v) => {
        c[v.bookUrl] = v;
        return c;
      }, {});
    },
    connectStatus() {
      return this.$store.state.connected
        ? this.$t("home.backendConnected")
        : this.connecting
        ? this.$t("home.backendConnecting")
        : this.$t("home.backendClickToSet");
    },
    connectType() {
      return this.$store.state.connected ? "success" : "danger";
    },
    readingRecent() {
      return this.$store.getters.readingBook &&
        this.$store.getters.readingBook.name
        ? this.$store.getters.readingBook
        : {
            name: this.$t("home.noReadingRecord"),
            bookUrl: "",
            index: 0
          };
    },
    loginAuth() {
      return this.$store.state.loginAuth;
    },
    bookSourceList() {
      return this.$store.state.bookSourceList;
    },
    userNS: {
      get() {
        return this.$store.state.userNS;
      },
      set(val) {
        this.$store.commit("setUserNS", val);
        if (val) {
          this.$store.commit("setIsManagerMode", true);
        }
      }
    },
    userList: {
      get() {
        return this.$store.state.userList;
      },
      set(val) {
        this.$store.commit("setUserList", val);
      }
    },
    bookSourceShowList() {
      return this.isShowFailureBookSource
        ? this.$store.state.failureBookSource
        : this.bookSourceList;
    },
    bookSourceGroupList() {
      const groupsMap = {};
      this.bookSourceList.forEach(v => {
        if (v.bookSourceGroup) {
          groupsMap[v.bookSourceGroup] = (groupsMap[v.bookSourceGroup] | 0) + 1;
        }
      });
      const groups = [
        {
          name: this.$t("group.all"),
          value: "",
          count: this.bookSourceList.length
        }
      ];
      for (const i in groupsMap) {
        if (Object.hasOwnProperty.call(groupsMap, i)) {
          groups.push({
            name: i,
            value: i,
            count: groupsMap[i]
          });
        }
      }
      return groups;
    },
    bookSourceShowGroup() {
      if (!this.isShowFailureBookSource) {
        const groups = new Set();
        this.bookSourceShowList.forEach(v => {
          v.bookSourceGroup && groups.add(v.bookSourceGroup);
        });
        groups.add("ungrouped");
        return Array.from(groups);
      } else {
        return [].concat(errorTypeList).concat(["timeout"]);
      }
    },
    bookSourceShowLength() {
      return this.bookSourceShowResult.length;
    },
    bookSourceShowResult() {
      if (!this.showSourceGroup) {
        return this.bookSourceShowList;
      }
      if (this.isShowFailureBookSource) {
        return this.bookSourceShowList.filter(v =>
          this.showSourceGroup
            ? v.errorMsg.indexOf(this.showSourceGroup) >= 0
            : true
        );
      } else {
        return this.bookSourceShowList.filter(v =>
          this.showSourceGroup === "ungrouped"
            ? !v.bookSourceGroup
            : v.bookSourceGroup === this.showSourceGroup
        );
      }
    },
    bookSourceShowResultPageList() {
      const start =
        (this.bookSourcePagination.page - 1) * this.bookSourcePagination.size;
      if (start > this.bookSourceShowResult.length) {
        return [];
      }
      return this.bookSourceShowResult.slice(
        start,
        Math.min(
          start + this.bookSourcePagination.size,
          this.bookSourceShowResult.length
        )
      );
    },
    showBookGroup: {
      get() {
        if (!this.bookGroupDisplayList.length) return -1;
        return this.$store.state.shelfConfig.showBookGroup;
      },
      set(val) {
        this.$store.commit("setShelfConfig", {
          ...this.$store.state.shelfConfig,
          showBookGroup: val
        });
      }
    },
    showBookGroupString: {
      get() {
        return "" + this.showBookGroup;
      },
      set(val) {
        this.showBookGroup = +val;
      }
    },
    bookGroupSetList() {
      return this.$store.state.bookGroupList.filter(v => v.groupId > 0);
    },
    bookGroupDisplayList() {
      return this.$store.state.bookGroupList
        .filter(v => this.getShowShelfBooks(v.groupId).length && v.show)
        .sort((a, b) => a.order - b.order);
    },
    searchConfig: {
      get() {
        return this.$store.state.searchConfig;
      },
      set(val) {
        this.$store.commit("setSearchConfig", val);
      }
    },
    isShowTocRule() {
      try {
        return (
          this.importBookInfo &&
          this.importBookInfo.originName &&
          (this.importBookInfo.originName.toLowerCase().endsWith(".txt") ||
            this.importBookInfo.originName.toLowerCase().endsWith(".epub"))
        );
      } catch (e) {
        // console.log(e);
      }
      return false;
    },
    tocRuleList() {
      if (!this.importBookInfo || !this.importBookInfo.originName) {
        return [];
      }
      if (this.importBookInfo.originName.toLowerCase().endsWith(".txt")) {
        // txt
        return this.$store.state.txtTocRules;
      } else {
        // epub
        return [
          { name: this.$t("catalog.rule.spin+toc"), rule: "spin+toc" },
          { name: this.$t("catalog.rule.spin<toc"), rule: "spin<toc" },
          { name: this.$t("catalog.rule.spin"), rule: "spin" },
          { name: this.$t("catalog.rule.toc+spin"), rule: "toc+spin" },
          { name: this.$t("catalog.rule.toc<spin"), rule: "toc<spin" },
          { name: this.$t("catalog.rule.toc"), rule: "toc" }
        ];
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
.index-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;

  .navigation-wrapper {
    width: 260px;
    min-width: 260px;
    height: 100%;
    box-sizing: border-box;
    background-color: #F7F7F7;
    position: relative;
    padding-top: 0;
    padding-top: constant(safe-area-inset-top) !important;
    padding-top: env(safe-area-inset-top) !important;

    .navigation-inner-wrapper {
      padding: 48px 36px 66px 36px;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }

    .navigation-title {
      font-size: 24px;
      font-weight: 600;
      font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;

      .version-text {
        float: right;
        font-size: 14px;
        line-height: 33px;
        font-weight: 400;
        color: #b1b1b1;
        display: inline-block;
        cursor: pointer;
      }
    }

    .navigation-sub-title {
      font-size: 16px;
      font-weight: 500;
      font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
      margin-top: 16px;
      color: #b1b1b1;
    }

    .search-wrapper {
      .search-input {
        border-radius: 50%;
        margin-top: 24px;

        >>> .el-input__inner {
          border-radius: 50px;
          border-color: #E3E3E3;
        }
      }
    }

    .recent-wrapper {
      margin-top: 36px;

      .recent-title {
        font-size: 14px;
        color: #b1b1b1;
        font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
      }

      .reading-recent {
        margin: 18px 0;

        .recent-book {
          cursor: pointer;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .setting-wrapper {
      margin-top: 36px;

      .setting-title {
        font-size: 14px;
        color: #b1b1b1;
        font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;

        .right-text {
          float: right;
          display: inline-block;
          height: 20px;
          line-height: 20px;
          cursor: pointer;
          user-select: none;
        }
      }

      .no-point {
        pointer-events: none;
      }

      .setting-connect {
        cursor: pointer;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .setting-item {
        padding-top: 16px;
      }

      .setting-btn {
        margin-right: 15px;
        margin-bottom: 15px;
        cursor: pointer;
      }

      .setting-select {
        width: 100%;
      }
    }

    .search-setting {
      margin-top: 28px;
    }

    .bottom-icons {
      position: absolute;
      bottom: 30px;
      width: 188px;
      left: 36px;
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      pointer-events: none;

      .bottom-icon {
        height: 36px;
        pointer-events: all;
        img {
          width: 36px;
          height: 36px;
        }
      }

      .theme-item {
        line-height: 32px;
        width: 36px;
        height: 36px;
        border-radius: 100%;
        display: inline-block;
        cursor: pointer;
        text-align: center;
        vertical-align: middle;
        pointer-events: all;

        .el-icon-moon {
          color: #f7f7f7;
          line-height: 34px;
        }
        .el-icon-sunny {
          color: #121212;
          line-height: 34px;
        }
      }
    }

    .setting-wrapper:nth-last-child(1) {
      padding-bottom: 20px;
    }
  }

  .shelf-wrapper {
    padding: 48px 48px;
    height: 100%;
    max-height: 100%;
    width: 100%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .shelf-title {
      font-size: 20px;
      font-weight: 600;
      font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
      margin-bottom: 5px;
      min-width: 320px;
      box-sizing: border-box;

      .el-icon-menu {
        cursor: pointer;
      }

      .title-btn {
        font-size: 14px;
        line-height: 28px;
        float: right;
        cursor: pointer;
        user-select: none;
        margin-left: 10px;

        >>>.el-icon-loading {
          font-size: 16px;
        }
      }
    }

    >>>.el-icon-loading {
      font-size: 36px;
      color: #B5B5B5;
    }

    >>>.el-loading-text {
      font-weight: 500;
      color: #B5B5B5;
    }

    .book-group-wrapper {
      padding: 5px 0;
      margin-bottom: 10px;

      .book-group-tabs {
        width: 100%;
      }

      .book-group-btn {
        margin-right: 10px;
        cursor: pointer;
      }

      .book-group-btn.selected {
        color: #fff;
        background: #409EFF;
        border-color: #409EFF;
      }
    }

    .books-wrapper {
      flex: 1;
      overflow-x: hidden;
      overflow-y: scroll;

      .wrapper {
        display: grid ;
        grid-template-columns: repeat(auto-fill, 380px);
        justify-content: space-around;
        grid-gap: 10px;

        .book {
          user-select: none;
          display: flex;
          cursor: pointer;
          margin-bottom: 18px;
          padding: 24px 24px;
          width: 360px;
          flex-direction: row;
          justify-content: space-around;

          .cover-img {
            width: 84px;
            height: 112px;

            .cover {
              width: 84px;
              height: 112px;
            }
          }

          .info {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: left;
            height: 112px;
            margin-left: 20px;
            flex: 1;

            .book-operation {
              position: absolute;
              right: 5px;
              top: 0px;
              font-size: 24px;
              color: #969ba3;

              i {
                margin-left: 10px;
              }
            }

            .name {
              width: fit-content;
              font-size: 16px;
              font-weight: 700;
              color: #33373D;
              margin-right: 38px;
              max-height: 45px;
              word-wrap: break-word;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
            }

            .name.edit {
              margin-right: 62px;
            }

            .sub {
              display: flex;
              flex-direction: row;
              font-size: 12px;
              font-weight: 600;
              color: #969ba3;

              .dot {
                margin: 0 7px;
              }
            }

            .intro, .dur-chapter, .last-chapter {
              color: #6b6b6b;
              font-size: 13px;
              margin-top: 3px;
              font-weight: 500;
              word-wrap: break-word;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              text-align: left;
            }
          }
        }
      }

      .wrapper:last-child {
        margin-right: auto;
      }
    }

    .books-wrapper::-webkit-scrollbar {
      width: 0 !important;
    }
  }
}

.unread-num-badge {
  >>>.el-badge__content {
    border: none;
  }
}

.night {
  >>>.navigation-wrapper {
    background-color: #121212;
    border-right: 1px solid #555;
  }
  >>>.navigation-title {
    color: #bbb;
  }
  >>>.shelf-title {
    color: #bbb;
  }
  >>>.shelf-wrapper {
    background-color: #222;
  }
  >>>.el-input__inner {
    background-color: #444;
    border: 1px solid #444 !important;
    color: #aaa;
  }
  .book .info .name {
    color: #bbb !important;
  }
  .book .info .book-operation {
    color: #6b6b6b !important;
  }
  .book .info .sub {
    color: #6b6b6b !important;
  }
  .book .info .intro, .book .info .dur-chapter, .book .info .last-chapter {
    color: #969ba3 !important;
  }

  >>>.check-tip {
    color: #bbb;
  }
}

.source-container {
  // max-height: 400px;
  // overflow-y: auto;
  padding: 0 10px;

  &.table-container {
    padding: 0;
  }

  .check-form {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    align-items: center;

    .check-form-label {
      min-width: 60px;
    }

    .el-input {
      width: auto;
      min-width: 100px;
      margin-right: 10px;
    }

    .el-input-number {
      min-width: 130px;
      margin-right: 10px;
    }

    .book-cover {
      width: 84px;
      height: 112px;

      .cover {
        width: 84px;
        height: 112px;
      }
    }

    .book-info {
      display: flex;
      flex-direction: column;
      margin-left: 30px;
      justify-content: space-between;
      min-height: 100px;

      .toc-refresh-btn {
        margin-left: 5px;
      }

      span {
        display: inline-block;
        min-width: 56px;
        text-align-last: justify;
      }
      .el-input {
        width: auto;
        min-width: 100px;
        margin-right: 10px;
      }
      .el-input-number {
        min-width: 130px;
        margin-right: 10px;
      }
    }
  }

  .chapter-title {
    font-size: 15px;
    padding: 5px 0;
    font-weight: 600;
    margin-top: 10px;
  }

  .chapter-list {
    overflow-y: auto;
    box-sizing: border-box;
    padding: 0 5px;

    p {
      margin-top: 0.4em;
      margin-bottom: 0.4em;
    }
  }

  .source-group-wrapper {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 5px 0;

    .source-group-btn {
      margin-right: 10px;
      cursor: pointer;
    }

    .source-group-btn.selected {
      color: #fff;
      background: #409EFF;
      border-color: #409EFF;
    }
  }

  .el-pagination {
    margin-top: 8px;
    float: right;
    max-width: 100%;
    overflow-x: auto;
    box-sizing: border-box;
  }

  >>>.source-checkbox {
    display: block;
    padding: 8px 0;
    width: 100%;
  }

  pre {
    margin: 0;
  }

  .source-pagination::after {
    display: table;
    content: "";
    clear: both;
  }
}

.source-list-container {
  max-height: calc(var(--vh, 1vh) * 70 - 54px - 60px - 66px);
  overflow-y: auto;
  overflow-x: auto;
}

.night {
  .source-container {
    .source-group-wrapper {
      .source-group-btn.selected {
        color: #fff;
        background: #185798;
        border-color: #185798;
      }
    }
  }
  .book-group-wrapper {
    .book-group-btn.selected {
      color: #fff;
      background: #185798 !important;
      border-color: #185798 !important;
    }
  }
}

.source-container::-webkit-scrollbar {
  width: 0 !important;
}
.navigation-inner-wrapper::-webkit-scrollbar {
  width: 0 !important;
}
>>> .el-table__body-wrapper::-webkit-scrollbar {
  width: 0 !important;
}
>>> .el-dialog__wrapper::-webkit-scrollbar {
  width: 0 !important;
}
@media screen and (max-width: 750px) {
  .index-wrapper {
    overflow-x: hidden;

    >>>.navigation-wrapper {
      .navigation-inner-wrapper {
        padding: 20px 36px 66px 36px;
      }
    }
    >>>.shelf-wrapper {
      padding: 0;
      padding-top: constant(safe-area-inset-top) !important;
      padding-top: env(safe-area-inset-top) !important;

      .shelf-title {
        padding: 20px 24px 0 24px;
      }

      .book-group-wrapper {
        margin-left: 24px;
        margin-right: 24px;
      }

      .books-wrapper {
        .wrapper {
          display: flex;
          flex-direction: column;

          .book {
            box-sizing: border-box;
            width: 100%;
            margin-bottom: 0;
            padding: 10px 20px;
          }
        }
      }
    }
  }
  .source-list-container  {
    max-height: calc(var(--vh, 1vh) * 100 - 54px - 40px - 66px);
  }
}
@media screen and (max-width: 480px) {
  .source-container.table-container {
    margin: -15px -5px;
  }
}
</style>
<style>
.navigation-hidden {
  margin-left: -260px;
}
.navigation-in {
  margin-left: 0px;
  transition: margin-left 0.3s;
}
.navigation-out {
  margin-left: -260px;
  transition: margin-left 0.3s;
}
.popper-intro {
  padding: 15px;
}
.book-kind span {
  display: inline-block;
  margin-left: 5px;
  margin-right: 5px;
}
.night-theme .popper-intro {
  background: #121212;
  color: #bbb !important;
  border: none;
}
.night-theme .popper-intro.el-popper[x-placement^="bottom"] .popper__arrow,
.night-theme
  .popper-intro.el-popper[x-placement^="bottom"]
  .popper__arrow::after {
  border-bottom-color: #121212 !important;
}
.night-theme .popper-intro.el-popper[x-placement^="top"] .popper__arrow,
.night-theme .popper-intro.el-popper[x-placement^="top"] .popper__arrow::after {
  border-top-color: #121212 !important;
}
.night-theme .el-popover__title {
  color: #ddd !important;
}
.status-bar-light-bg {
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0,
    transparent 36px
  ) !important;
}
.status-bar-light-bg-dialog .el-dialog.is-fullscreen {
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0,
    transparent 36px
  ) !important;
}
@media (hover: hover) {
  .book:hover {
    background: rgba(0, 0, 0, 0.1);
    transition-duration: 0.5s;
  }
  .el-icon-close:hover {
    color: #409eff;
  }
  .el-icon-edit:hover {
    color: #409eff;
  }
}

.mini-interface .el-dialog__body {
  padding: 15px 20px;
}
.book-group-tabs .el-tabs__header {
  margin-bottom: 0px;
}
</style>
