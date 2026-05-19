<template>
  <el-dialog
    :title="$t('file.localStoreManage')"
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
    <div class="source-container table-container">
      <el-table
        :data="localFileList"
        :height="dialogContentHeight"
        @selection-change="localFileSelection = $event"
      >
        <el-table-column
          type="selection"
          width="25"
          :fixed="$store.state.miniInterface"
          :selectable="row => !row.toParent"
        >
        </el-table-column>
        <el-table-column
          property="name"
          min-width="150px"
          :label="$t('file.name')"
          :fixed="$store.state.miniInterface"
        >
          <template slot-scope="scope">
            <span v-if="!scope.row.isDirectory">{{ scope.row.name }}</span>
            <el-link
              type="primary"
              v-if="scope.row.isDirectory"
              @click="showLocalStoreFile(scope.row.path)"
              >{{ scope.row.name }}</el-link
            >
          </template>
        </el-table-column>
        <el-table-column
          property="size"
          :label="$t('file.size')"
          :formatter="formatTableField"
          min-width="100px"
        ></el-table-column>
        <el-table-column
          property="lastModified"
          :label="$t('file.modifiedAt')"
          :formatter="formatTableField"
          width="120px"
        ></el-table-column>
        <el-table-column :label="$t('group.operation')" width="100px">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="deleteLocalStoreFile(scope.row)"
              style="color: #f56c6c"
              v-if="!scope.row.toParent"
              >{{ $t("common.delete") }}</el-button
            >
            <el-button
              type="text"
              @click="importFromLocalStore(scope.row)"
              v-if="canImport(scope.row)"
              >{{ $t("book.addToShelf") }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="medium"
        class="float-left"
        @click="deleteLocalStoreFileList"
        >{{ $t("book.batchDelete") }}</el-button
      >
      <el-button
        type="primary"
        size="medium"
        class="float-left"
        @click="importFromLocalStore(true)"
        >{{ $t("file.batchAddToShelf") }}</el-button
      >
      <el-button
        type="primary"
        size="medium"
        class="float-left"
        @click="uploadToLocalStore"
      >
        {{ $t("file.uploadBooks") }}
      </el-button>
      <input
        ref="bookRef"
        type="file"
        multiple="multiple"
        @change="onBookFileChange"
        style="display:none"
      />
      <span class="check-tip">{{
        $t("common.selectedCount", { count: localFileSelection.length })
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
import { formatSize } from "../plugins/helper";

export default {
  model: {
    prop: "show",
    event: "setShow"
  },
  name: "LocalStore",
  data() {
    return {
      localCurrentPath: "/",
      localFileList: [],

      localFileSelection: []
    };
  },
  props: ["show"],
  computed: {
    ...mapGetters(["dialogWidth", "dialogTop", "dialogContentHeight"])
  },
  watch: {
    show(isVisible) {
      if (isVisible) {
        this.showLocalStoreFile("/");
      }
    }
  },
  methods: {
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
    canImport(row) {
      const path = row.path.toLowerCase();
      return (
        path.endsWith(".txt") ||
        path.endsWith(".epub") ||
        path.endsWith(".umd") ||
        path.endsWith(".cbz")
      );
    },
    cancel() {
      this.$emit("setShow", false);
    },
    showLocalStoreFile(path) {
      this.localCurrentPath = path || "/";
      Axios.get(this.api + "/getLocalStoreFileList", {
        params: {
          path: this.localCurrentPath
        }
      }).then(
        res => {
          if (res.data.isSuccess) {
            res.data.data = res.data.data || [];
            if (this.localCurrentPath !== "/") {
              const paths = this.localCurrentPath.split("/").filter(v => v);
              paths.pop();
              res.data.data.unshift({
                name: "..",
                isDirectory: true,
                toParent: true,
                path: "/" + paths.join("/")
              });
            }
            this.localFileList = res.data.data;
            this.showLocalStoreManageDialog = true;
          }
        },
        error => {
          this.$message.error(
            this.$t("file.localStoreLoadFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async deleteLocalStoreFileList() {
      if (!this.localFileSelection.length) {
        this.$message.error(this.$t("file.selectDeleteRequired"));
        return;
      }
      const res = await this.$confirm(
        this.$t("file.confirmDeleteSelected"),
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
      Axios.post(this.api + "/deleteLocalStoreFileList", {
        path: this.localFileSelection.map(v => v.path)
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.localFileSelection = [];
            this.$message.success(this.$t("common.fileDeleteSuccess"));
            this.showLocalStoreFile(this.localCurrentPath);
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
    async deleteLocalStoreFile(row) {
      const res = await this.$confirm(
        this.$t("file.confirmDeleteOne", {
          type: row.isDirectory ? this.$t("file.folder") : this.$t("file.file")
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
      Axios.post(this.api + "/deleteLocalStoreFile", {
        path: row.path
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.fileDeleteSuccess"));
            this.showLocalStoreFile(this.localCurrentPath);
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
    async importFromLocalStore(row) {
      if (row === true) {
        if (!this.localFileSelection.length) {
          this.$message.error(this.$t("file.selectAddToShelfRequired"));
          return;
        }
      }
      Axios.post(this.api + "/importFromLocalPathPreview", {
        path:
          row === true ? this.localFileSelection.map(v => v.path) : [row.path]
      }).then(
        res => {
          if (res.data.isSuccess) {
            if (!res.data.data || !res.data.data.length) {
              this.$message.error(this.$t("file.noImportableBooks"));
              return;
            }
            // this.cancel();
            setTimeout(() => {
              this.$emit("importFromLocalPathPreview", res.data.data);
            }, 0);
          }
        },
        error => {
          this.$message.error(
            this.$t("common.requestFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    uploadToLocalStore() {
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
      param.append("path", this.localCurrentPath);
      Axios.post(this.api + "/uploadFileToLocalStore", param, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("file.uploadBooksSuccess"));
            this.showLocalStoreFile(this.localCurrentPath);
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
    }
  }
};
</script>
<style lang="stylus" scoped>
.float-left {
  float: left;
}
</style>
