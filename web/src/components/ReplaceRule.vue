<template>
  <el-dialog
    :title="$t('replaceRule.manage')"
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
        >{{ $t("replaceRule.manage") }}
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
        :data="$store.state.filterRules"
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
          property="name"
          min-width="150px"
          :label="$t('replaceRule.ruleName')"
          :fixed="$store.state.miniInterface"
        >
        </el-table-column>
        <el-table-column
          property="scope"
          :label="$t('replaceRule.scope')"
          min-width="150px"
        >
        </el-table-column>
        <el-table-column
          property="isEnabled"
          :label="$t('replaceRule.enabled')"
          min-width="80"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isEnabled"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              @change="toggleRuleEnabled(scope.row, $event)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column :label="$t('group.operation')" width="100px">
          <template slot-scope="scope">
            <el-button type="text" @click="editReplaceRule(scope.row)">{{
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
        @click="deleteReplaceRules"
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
  name: "ReplaceRule",
  data() {
    return {
      localSelection: []
    };
  },
  computed: {
    ...mapGetters(["dialogWidth", "dialogTop", "dialogContentHeight"])
  },
  props: ["show"],
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
    async deleteReplaceRules() {
      if (!this.localSelection.length) {
        this.$message.error(this.$t("replaceRule.selectDeleteRequired"));
        return;
      }
      const res = await this.$confirm(
        this.$t("replaceRule.confirmDeleteSelected"),
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
      Axios.post(this.api + "/deleteReplaceRules", this.localSelection).then(
        res => {
          if (res.data.isSuccess) {
            this.localSelection = [];
            this.$message.success(this.$t("replaceRule.deleteSuccess"));
            this.$root.$children[0].loadReplaceRules(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("replaceRule.deleteFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    toggleRuleEnabled(rule, isEnabled) {
      Axios.post("/saveReplaceRule", { ...rule, isEnabled }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.editSuccess"));
            this.$root.$children[0].loadReplaceRules(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("common.editFailed", { message: error && error.toString() })
          );
        }
      );
    },
    editReplaceRule(row) {
      eventBus.$emit("showReplaceRuleForm", { ...row }, false);
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
          const ruleList = JSON.parse(data);
          if (Array.isArray(ruleList) && ruleList.length) {
            this.comfirmImport(ruleList);
          }
        } catch (error) {
          this.$message.error(this.$t("replaceRule.fileError"));
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
              let ruleList = [];
              res.data.data.forEach(v => {
                try {
                  const data = JSON.parse(v);
                  if (Array.isArray(data)) {
                    ruleList = ruleList.concat(data);
                  }
                } catch (error) {
                  //
                }
              });
              if (ruleList.length) {
                this.comfirmImport(ruleList);
              } else {
                this.$message.error(this.$t("replaceRule.fileError"));
              }
            }
          },
          error => {
            this.$message.error(
              this.$t("replaceRule.fileReadFailed", {
                message: error && error.toString()
              })
            );
          }
        );
      };
      reader.readAsText(rawFile);
      this.$refs.fileRef.value = null;
    },
    async comfirmImport(ruleList) {
      const res = await this.$confirm(
        this.$t("replaceRule.confirmImportCount", {
          count: ruleList.length
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
      Axios.post(this.api + "/saveReplaceRules", ruleList).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("replaceRule.importSuccess"));
            this.$root.$children[0].loadReplaceRules(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("replaceRule.importFailed", {
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
