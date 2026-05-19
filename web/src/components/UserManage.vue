<template>
  <el-dialog
    :title="$t('user.manage')"
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
        >{{ $t("user.manage") }}
        <span class="float-right span-btn" @click="showAddUserDialog()">{{
          $t("user.add")
        }}</span>
      </span>
    </div>
    <div class="source-container table-container">
      <el-table
        :data="userList"
        :height="dialogContentHeight"
        @selection-change="manageUserSelection = $event"
      >
        <el-table-column
          type="selection"
          width="25"
          :selectable="isUserSelectable"
          :fixed="$store.state.miniInterface"
        >
        </el-table-column>
        <el-table-column
          property="username"
          :label="$t('common.username')"
          min-width="100"
          :fixed="$store.state.miniInterface"
        ></el-table-column>
        <el-table-column
          property="lastLoginAt"
          :label="$t('user.lastLogin')"
          :formatter="formatTableField"
          min-width="120"
        ></el-table-column>
        <el-table-column
          property="createdAt"
          :label="$t('user.createdAt')"
          :formatter="formatTableField"
          min-width="120"
        ></el-table-column>
        <el-table-column property="enableWebdav" label="WebDAV" min-width="80">
          <template slot-scope="scope">
            <el-switch
              v-if="scope.row.userNS !== 'default'"
              v-model="scope.row.enableWebdav"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              @change="toggleUserWebdav(scope.row, $event)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          property="enableLocalStore"
          :label="$t('user.localStore')"
          min-width="80"
        >
          <template slot-scope="scope">
            <el-switch
              v-if="scope.row.userNS !== 'default'"
              v-model="scope.row.enableLocalStore"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              @change="toggleUserLocalStore(scope.row, $event)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column :label="$t('group.operation')" width="100px">
          <template slot-scope="scope">
            <el-button type="text" @click="resetPassword(scope.row)">{{
              $t("user.resetPassword")
            }}</el-button>
            <el-button
              type="text"
              @click="setAsDefaultBookSources(scope.row)"
              >{{ $t("user.setDefaultBookSource") }}</el-button
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
        @click="deleteUserList"
        >{{ $t("book.batchDelete") }}</el-button
      >
      <el-button
        type="primary"
        size="medium"
        class="float-left"
        @click="deleteUserBookSource"
        >{{ $t("user.deleteUserSource") }}</el-button
      >
      <span class="check-tip">{{
        $t("book.selectedCount", { count: manageUserSelection.length })
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
import { formatSize } from "../plugins/helper";

export default {
  model: {
    prop: "show",
    event: "setShow"
  },
  name: "UserManage",
  data() {
    return {
      manageUserSelection: []
    };
  },
  props: ["show"],
  computed: {
    ...mapGetters(["dialogWidth", "dialogTop", "dialogContentHeight"]),
    userList: {
      get() {
        return this.$store.state.userList;
      },
      set(val) {
        this.$store.commit("setUserList", val);
      }
    }
  },
  watch: {
    show(isVisible) {
      if (isVisible) {
        this.manageUserSelection = [];
      }
    }
  },
  methods: {
    cancel() {
      this.$emit("setShow", false);
    },
    showAddUserDialog() {
      eventBus.$emit("showAddUserDialog");
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
    isUserSelectable(user) {
      return user.userNS !== "default";
    },
    async deleteUserList() {
      if (!this.manageUserSelection.length) {
        this.$message.error(this.$t("user.selectDeleteRequired"));
        return;
      }
      const res = await this.$confirm(
        this.$t("user.confirmDeleteSelected"),
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
        this.api + "/deleteUsers",
        this.manageUserSelection.map(v => v.username)
      ).then(
        res => {
          if (res.data.isSuccess) {
            this.manageUserSelection = [];
            this.$message.success(this.$t("user.deleteSuccess"));
            this.userList = res.data.data.map(v => ({
              ...v,
              userNS: v.username
            }));
          }
        },
        error => {
          this.$message.error(
            this.$t("user.deleteFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async deleteUserBookSource() {
      if (!this.manageUserSelection.length) {
        this.$message.error(this.$t("user.selectDeleteSourceRequired"));
        return;
      }
      const res = await this.$confirm(
        this.$t("user.confirmDeleteSelectedSources"),
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
        this.api + "/deleteUserBookSource",
        this.manageUserSelection.map(v => v.username)
      ).then(
        res => {
          if (res.data.isSuccess) {
            this.manageUserSelection = [];
            this.$message.success(this.$t("common.operationSuccess"));
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
    toggleUserWebdav(user, enableWebdav) {
      Axios.post(this.api + "/updateUser", {
        username: user.username,
        enableWebdav
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.editSuccess"));
            this.userList = res.data.data.map(v => ({
              ...v,
              userNS: v.username
            }));
          }
        },
        error => {
          this.$message.error(
            this.$t("common.editFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    toggleUserLocalStore(user, enableLocalStore) {
      Axios.post(this.api + "/updateUser", {
        username: user.username,
        enableLocalStore
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.editSuccess"));
            this.userList = res.data.data.map(v => ({
              ...v,
              userNS: v.username
            }));
          }
        },
        error => {
          this.$message.error(
            this.$t("common.editFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async setAsDefaultBookSources(user) {
      const res = await this.$confirm(
        this.$t("user.confirmSetDefaultBookSource", {
          username: user.username
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
      return Axios.post(this.api + "/setAsDefaultBookSources", {
        username: user.username
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.setSuccess"));
          }
        },
        error => {
          this.$message.error(
            this.$t("common.setFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async resetPassword(user) {
      const res = await this.$prompt("", this.$t("user.resetPassword"), {
        inputValue: "",
        confirmButtonText: this.$t("common.confirm"),
        cancelButtonText: this.$t("common.cancel"),
        inputValidator: v => {
          if (!v) {
            return this.$t("auth.passwordRequired");
          }
          return true;
        }
      }).catch(() => {
        return false;
      });
      if (!res) {
        return;
      }
      Axios.post(this.api + "/resetPassword", {
        username: user.username,
        password: res.value
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("user.resetPasswordSuccess"));
          }
        },
        error => {
          this.$message.error(
            this.$t("user.resetPasswordFailed", {
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
.float-right {
  float: right;
}
</style>
