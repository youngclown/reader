<template>
  <el-dialog
    :visible.sync="show"
    :width="dialogWidth"
    :top="dialogTop"
    :fullscreen="$store.state.miniInterface"
    :class="
      isWebApp && !$store.getters.isNight ? 'status-bar-light-bg-dialog' : ''
    "
    v-if="$store.getters.isNormalPage"
    :before-close="cancel"
  >
    <div class="custom-dialog-title" slot="title">
      <span class="el-dialog__title"
        >{{ this.book ? this.book.name : "" }} {{ $t("bookmark.manage") }}
        <span class="float-right span-btn" @click="uploadFile">{{
          $t("common.import")
        }}</span>
        <input
          ref="fileRef"
          type="file"
          @change="onFileChange($event)"
          style="display:none"
        />
      </span>
    </div>
    <div class="source-container table-container">
      <el-table
        :data="bookmarkList"
        :height="dialogContentHeight"
        @selection-change="localSelection = $event"
      >
        <el-table-column
          type="selection"
          width="25"
          :fixed="$store.state.miniInterface"
        >
        </el-table-column>
        <el-table-column
          min-width="150px"
          :label="$t('book.title')"
          :fixed="$store.state.miniInterface"
        >
          <template slot-scope="scope">
            {{ scope.row.bookName }} - {{ scope.row.bookAuthor }}
          </template>
        </el-table-column>
        <el-table-column
          property="chapterName"
          :label="$t('book.chapter')"
          min-width="150px"
        >
        </el-table-column>
        <el-table-column
          property="bookText"
          :label="$t('bookmark.content')"
          min-width="150px"
        >
        </el-table-column>
        <el-table-column
          property="content"
          :label="$t('bookmark.note')"
          min-width="150px"
        >
        </el-table-column>
        <el-table-column :label="$t('group.operation')" width="100px">
          <template slot-scope="scope">
            <el-button type="text" @click="showBookmark(scope.row)">{{
              $t("bookmark.jump")
            }}</el-button>
            <el-button type="text" @click="editBookmark(scope.row)">{{
              $t("common.edit")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="medium"
        class="float-left"
        @click="deleteBookmarks"
        >{{ $t("book.batchDelete") }}</el-button
      >
      <span class="check-tip">{{
        $t("common.selectedCount", { count: localSelection.length })
      }}</span>
      <el-button size="medium" @click="cancel">{{
        $t("common.cancel")
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import Axios from "../plugins/axios";
import eventBus from "../plugins/eventBus";

export default {
  model: {
    prop: "show",
    event: "setShow"
  },
  name: "Bookmark",
  data() {
    return {
      localSelection: []
    };
  },
  computed: {
    ...mapGetters(["dialogWidth", "dialogTop", "dialogContentHeight"]),
    bookmarkList() {
      if (!this.book || !this.book.name) {
        return this.$store.state.bookmarks;
      }
      return this.$store.state.bookmarks.filter(
        v => v.bookName === this.book.name && v.bookAuthor === this.book.author
      );
    }
  },
  props: ["show", "book"],
  watch: {
    show(isVisible) {
      if (isVisible) {
        //
      }
    }
  },
  methods: {
    formatTableField(row, column, cellValue) {
      switch (column.property) {
        default:
          return cellValue;
      }
    },
    cancel() {
      this.$emit("setShow", false);
    },
    async deleteBookmarks() {
      if (!this.localSelection.length) {
        this.$message.error(this.$t("bookmark.selectDeleteRequired"));
        return;
      }
      const res = await this.$confirm(
        this.$t("bookmark.confirmDeleteSelected"),
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
      Axios.post(this.api + "/deleteBookmarks", this.localSelection).then(
        res => {
          if (res.data.isSuccess) {
            this.localSelection = [];
            this.$message.success(this.$t("bookmark.deleteSuccess"));
            this.$root.$children[0].loadBookmarks(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("bookmark.deleteFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    editBookmark(row) {
      eventBus.$emit("showBookmarkForm", { ...row }, false);
    },
    uploadFile() {
      this.$refs.fileRef.dispatchEvent(new MouseEvent("click"));
    },
    onFileChange(event) {
      const rawFile = event.target.files && event.target.files[0];
      // console.log("rawFile", rawFile);
      const reader = new FileReader();
      reader.onload = e => {
        const data = e.target.result;
        try {
          const bookmarkList = JSON.parse(data);
          if (Array.isArray(bookmarkList) && bookmarkList.length) {
            this.comfirmImport(bookmarkList);
          }
        } catch (error) {
          this.$message.error(this.$t("bookmark.fileError"));
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
              let bookmarkList = [];
              res.data.data.forEach(v => {
                try {
                  const data = JSON.parse(v);
                  if (Array.isArray(data)) {
                    bookmarkList = bookmarkList.concat(data);
                  }
                } catch (error) {
                  //
                }
              });
              if (bookmarkList.length) {
                this.comfirmImport(bookmarkList);
              } else {
                this.$message.error(this.$t("bookmark.fileError"));
              }
            }
          },
          error => {
            this.$message.error(
              this.$t("bookmark.fileReadFailed", {
                message: error && error.toString()
              })
            );
          }
        );
      };
      reader.readAsText(rawFile);
      this.$refs.fileRef.value = null;
    },
    async comfirmImport(bookmarkList) {
      const res = await this.$confirm(
        this.$t("bookmark.confirmImportCount", {
          count: bookmarkList.length
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
      Axios.post(this.api + "/saveBookmarks", bookmarkList).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("bookmark.importSuccess"));
            this.$root.$children[0].loadBookmarks(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("bookmark.importFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    showBookmark(bookmark) {
      eventBus.$emit("showBookmark", bookmark);
      this.cancel();
    }
  }
};
</script>
<style lang="stylus" scoped>
.float-left {
  float: left;
}
</style>
