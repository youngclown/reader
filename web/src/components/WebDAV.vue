<template>
  <el-dialog
    :title="$t('file.webdavManage')"
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
        :data="fileList"
        :height="dialogContentHeight"
        @selection-change="fileSelection = $event"
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
              @click="showWebdavFile(scope.row.path)"
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
              @click="restoreFromWebdav(scope.row)"
              v-if="!scope.row.isDirectory && scope.row.name.endsWith('.zip')"
              >{{ $t("file.restore") }}</el-button
            >
            <el-button
              type="text"
              @click="downloadFromWebdav(scope.row)"
              v-if="!scope.row.isDirectory"
              >{{ $t("file.download") }}</el-button
            >
            <el-button
              type="text"
              @click="importFromWebdav(scope.row)"
              v-if="canImport(scope.row)"
              >{{ $t("file.addToShelf") }}</el-button
            >
            <el-button
              type="text"
              @click="deleteWebdavFile(scope.row)"
              style="color: #f56c6c"
              v-if="!scope.row.toParent"
              >{{ $t("common.delete") }}</el-button
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
        @click="deleteWebdavFileList"
        >{{ $t("book.batchDelete") }}</el-button
      >
      <el-button
        type="primary"
        size="medium"
        class="float-left"
        @click="importFromWebdav(true)"
        >{{ $t("file.batchAddToShelf") }}</el-button
      >
      <el-button
        type="primary"
        size="medium"
        class="float-left"
        @click="uploadToWebDAV"
      >
        {{ $t("file.upload") }}
      </el-button>
      <input
        ref="fileRef"
        type="file"
        multiple="multiple"
        @change="onFileChange"
        style="display:none"
      />
      <span class="check-tip">{{
        $t("book.selectedCount", { count: fileSelection.length })
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
  name: "WebDAV",
  data() {
    return {
      currentPath: "/",
      fileList: [],

      fileSelection: []
    };
  },
  props: ["show"],
  computed: {
    ...mapGetters(["dialogWidth", "dialogTop", "dialogContentHeight"])
  },
  watch: {
    show(isVisible) {
      if (isVisible) {
        this.showWebdavFile("/");
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
        path.endsWith(".txt") || path.endsWith(".epub") || path.endsWith(".umd")
      );
    },
    cancel() {
      this.$emit("setShow", false);
    },
    showWebdavFile(path) {
      this.currentPath = path || "/";
      Axios.get(this.api + "/getWebdavFileList", {
        params: {
          path: this.currentPath
        }
      }).then(
        res => {
          if (res.data.isSuccess) {
            res.data.data = res.data.data || [];
            if (this.currentPath !== "/") {
              const paths = this.currentPath.split("/").filter(v => v);
              paths.pop();
              res.data.data.unshift({
                name: "..",
                isDirectory: true,
                toParent: true,
                path: "/" + paths.join("/")
              });
            }
            this.fileList = res.data.data;
          }
        },
        error => {
          this.$message.error(
            this.$t("file.webdavLoadFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async deleteWebdavFileList() {
      if (!this.fileSelection.length) {
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
      Axios.post(this.api + "/deleteWebdavFileList", {
        path: this.fileSelection.map(v => v.path)
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.fileSelection = [];
            this.$message.success(this.$t("common.fileDeleteSuccess"));
            this.showWebdavFile(this.currentPath);
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
    async deleteWebdavFile(row) {
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
      Axios.post(this.api + "/deleteWebdavFile", {
        path: row.path
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.fileDeleteSuccess"));
            this.showWebdavFile(this.currentPath);
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
    async restoreFromWebdav(row) {
      const res = await this.$confirm(
        this.$t("file.confirmRestoreArchive"),
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
      Axios.post(this.api + "/restoreFromWebdav", {
        path: row.path
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("source.restoreSuccess"));
            this.init(true);
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
    downloadFromWebdav(row) {
      window.open(
        this.api +
          "/getWebdavFile?path=" +
          escape(row.path) +
          "&accessToken=" +
          this.$store.state.token,
        "__blank"
      );
    },
    uploadToWebDAV() {
      this.$refs.fileRef.dispatchEvent(new MouseEvent("click"));
    },
    onFileChange(event) {
      if (!event.target || !event.target.files || !event.target.files.length) {
        return;
      }
      let param = new FormData();
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        param.append("file" + i, file);
      }
      param.append("path", this.currentPath);
      Axios.post(this.api + "/uploadFileToWebdav", param, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("file.uploadSuccess"));
            this.showWebdavFile(this.currentPath);
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
      this.$refs.fileRef.value = null;
    },
    async importFromWebdav(row) {
      if (row === true) {
        if (!this.fileSelection.length) {
          this.$message.error(this.$t("file.selectAddToShelfRequired"));
          return;
        }
      }
      Axios.post(this.api + "/importFromLocalPathPreview", {
        path: row === true ? this.fileSelection.map(v => v.path) : [row.path],
        webdav: true
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
    }
  }
};
</script>
<style lang="stylus" scoped>
.float-left {
  float: left;
}
</style>
