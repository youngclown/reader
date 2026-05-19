<template>
  <el-dialog
    :title="$t('bookmark.title')"
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
    <el-form :model="bookmarkForm">
      <el-form-item :label="$t('book.title')">
        <el-input v-model="bookmarkForm.bookName" readonly></el-input>
      </el-form-item>
      <el-form-item :label="$t('book.author')">
        <el-input v-model="bookmarkForm.bookAuthor" readonly></el-input>
      </el-form-item>
      <el-form-item :label="$t('book.chapter')">
        <el-input v-model="bookmarkForm.chapterName" readonly></el-input>
      </el-form-item>
      <el-form-item :label="$t('bookmark.content')">
        <el-input
          v-model="bookmarkForm.bookText"
          type="textarea"
          :rows="5"
          readonly
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('bookmark.note')">
        <el-input
          v-model="bookmarkForm.content"
          type="textarea"
          :rows="3"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="medium" @click="cancel">{{
        $t("common.cancel")
      }}</el-button>
      <el-button size="medium" type="primary" @click="save">{{
        $t("common.confirm")
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import Axios from "../plugins/axios";
import { defaultBookmark } from "../plugins/config.js";

export default {
  model: {
    prop: "show",
    event: "setShow"
  },
  name: "BookmarkForm",
  data() {
    return {
      bookmarkForm: { ...defaultBookmark }
    };
  },
  props: ["show", "bookmark", "isAdd"],
  computed: {
    ...mapGetters(["dialogWidth", "dialogTop", "dialogContentHeight"])
  },
  watch: {
    show(isVisible) {
      if (isVisible) {
        this.bookmarkForm = this.bookmark || { ...defaultBookmark };
      }
    }
  },
  methods: {
    cancel() {
      this.$emit("setShow", false);
    },
    save() {
      if (!this.bookmarkForm.bookName && !this.bookmarkForm.bookAuthor) {
        this.$message.error(this.$t("source.bookInfoError"));
        return;
      }
      if (!this.bookmarkForm.bookText) {
        this.$message.error(this.$t("bookmark.bookTextRequired"));
        return;
      }
      const form = { ...this.bookmarkForm };
      Axios.post("/saveBookmark", form).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(
              this.$t(
                this.isAdd ? "bookmark.addSuccess" : "bookmark.editSuccess"
              )
            );
            this.$root.$children[0].loadBookmarks(true);
            this.cancel();
          }
        },
        error => {
          this.$message.error(
            this.$t(this.isAdd ? "bookmark.addFailed" : "bookmark.editFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    }
  }
};
</script>
<style lang="stylus" scoped>
.float-left {
  float: left;
}
</style>
