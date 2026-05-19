<template>
  <el-dialog
    :title="$t('auth.addUser')"
    :visible.sync="show"
    :width="dialogSmallWidth"
    :top="dialogTop"
    :fullscreen="$store.state.miniInterface"
    :class="
      isWebApp && !$store.getters.isNight ? 'status-bar-light-bg-dialog' : ''
    "
    v-if="$store.getters.isNormalPage"
    :before-close="cancel"
  >
    <el-form :model="addUserForm">
      <el-form-item :label="$t('common.username')">
        <el-input v-model="addUserForm.username" autocomplete="on"></el-input>
      </el-form-item>
      <el-form-item :label="$t('common.password')">
        <el-input
          type="password"
          v-model="addUserForm.password"
          autocomplete="on"
          show-password
          @keyup.enter.native="login"
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

const defaultForm = {
  username: "",
  password: ""
};

export default {
  model: {
    prop: "show",
    event: "setShow"
  },
  name: "AddUser",
  data() {
    return {
      addUserForm: { ...defaultForm }
    };
  },
  props: ["show", "rule", "isAdd"],
  computed: {
    ...mapGetters(["dialogSmallWidth", "dialogTop"])
  },
  watch: {
    show(isVisible) {
      if (isVisible) {
        this.addUserForm = { ...defaultForm };
      }
    }
  },
  methods: {
    cancel() {
      this.$emit("setShow", false);
    },
    save() {
      if (!this.addUserForm.username) {
        this.$message.success(this.$t("auth.usernameRequired"));
        return;
      }
      if (!this.addUserForm.password) {
        this.$message.success(this.$t("auth.passwordRequired"));
        return;
      }
      Axios.post(this.api + "/addUser", this.addUserForm).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("auth.addSuccess"));
            this.cancel();
            const userList = res.data.data.map(v => ({
              ...v,
              userNS: v.username
            }));
            this.$store.commit("setUserList", userList);
          }
        },
        error => {
          this.$message.error(
            this.$t("auth.addFailed", { message: error && error.toString() })
          );
        }
      );
    }
  }
};
</script>
<style lang="stylus" scoped></style>
