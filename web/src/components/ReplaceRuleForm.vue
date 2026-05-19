<template>
  <el-dialog
    :title="$t('replaceRule.title')"
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
    <el-form :model="ruleForm">
      <el-form-item :label="$t('replaceRule.name')">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('replaceRule.rule')">
        <el-input v-model="ruleForm.pattern"></el-input>
      </el-form-item>
      <el-form-item :label="$t('replaceRule.replacement')">
        <el-input v-model="ruleForm.replacement"></el-input>
      </el-form-item>
      <el-form-item :label="$t('replaceRule.scope')">
        <el-input v-model="ruleForm.scope"></el-input>
      </el-form-item>
      <el-checkbox v-model="ruleForm.isRegex">{{
        $t("replaceRule.useRegex")
      }}</el-checkbox>
      <el-checkbox v-model="ruleForm.isEnabled">{{
        $t("replaceRule.enabled")
      }}</el-checkbox>
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
import { defaultReplaceRule } from "../plugins/config.js";

export default {
  model: {
    prop: "show",
    event: "setShow"
  },
  name: "ReplaceRuleForm",
  data() {
    return {
      ruleForm: { ...defaultReplaceRule }
    };
  },
  props: ["show", "rule", "isAdd"],
  computed: {
    ...mapGetters(["dialogWidth", "dialogTop", "dialogContentHeight"])
  },
  watch: {
    show(isVisible) {
      if (isVisible) {
        this.ruleForm = this.rule || { ...defaultReplaceRule };
      }
    }
  },
  methods: {
    cancel() {
      this.$emit("setShow", false);
    },
    save() {
      if (!this.ruleForm.name) {
        this.$message.error(this.$t("replaceRule.nameRequired"));
        return;
      }
      if (!this.ruleForm.pattern) {
        this.$message.error(this.$t("replaceRule.ruleRequired"));
        return;
      }
      if (!this.ruleForm.scope) {
        this.$message.error(this.$t("replaceRule.scopeRequired"));
        return;
      }
      if (this.isAdd) {
        const isExisted = this.$store.state.filterRules.find(
          v => v.name === this.ruleForm.name
        );
        if (isExisted) {
          this.$message.error(this.$t("replaceRule.nameDuplicate"));
          return;
        }
      }
      const rule = { ...this.ruleForm };
      // this.$store.commit("addFilterRule", rule);
      Axios.post("/saveReplaceRule", rule).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(
              this.$t(
                this.isAdd
                  ? "replaceRule.addSuccess"
                  : "replaceRule.editSuccess"
              )
            );
            this.$root.$children[0].loadReplaceRules(true);
            this.cancel();
          }
        },
        error => {
          this.$message.error(
            this.$t(
              this.isAdd ? "replaceRule.addFailed" : "replaceRule.editFailed",
              {
                message: error && error.toString()
              }
            )
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
