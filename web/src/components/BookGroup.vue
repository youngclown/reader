<template>
  <el-dialog
    :title="
      isShowBookGroupSettingDialog ? $t('group.setGroup') : $t('group.manage')
    "
    :visible.sync="show"
    :width="dialogWidth"
    :top="dialogTop"
    :fullscreen="$store.state.miniInterface"
    :class="
      isWebApp && !$store.getters.isNight ? 'status-bar-light-bg-dialog' : ''
    "
    @opened="opened"
    v-if="$store.getters.isNormalPage"
    :before-close="cancel"
  >
    <div class="source-container table-container">
      <el-table
        :data="showBookGroupList"
        :height="dialogContentHeight"
        @selection-change="bookGroupSelection = $event"
        ref="bookGroupTableRef"
        :key="isShowBookGroupSettingDialog"
      >
        <el-table-column
          type="selection"
          width="25"
          v-if="isShowBookGroupSettingDialog"
        >
        </el-table-column>
        <el-table-column
          property="groupName"
          :label="$t('group.name')"
          min-width="100"
        >
          <template slot-scope="scope">
            <div class="drag-icon">
              <i class="el-icon-rank"></i>
            </div>
            <span> {{ displayBookGroupName(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          property="show"
          :label="$t('group.visible')"
          min-width="80"
          v-if="!isShowBookGroupSettingDialog"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.show"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              @change="toggleBookGroupShow(scope.row, $event)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column :label="$t('group.operation')" width="100px">
          <template slot-scope="scope">
            <el-button type="text" @click="saveBookGroup(scope.row)">{{
              $t("common.edit")
            }}</el-button>
            <el-button
              type="text"
              v-if="
                !isShowBookGroupSettingDialog &&
                  scope.row.groupId > 0 &&
                  !getShowShelfBooks(scope.row.groupId).length
              "
              @click="deleteBookGroup(scope.row)"
              style="color: #f56c6c"
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
        @click="saveBookGroup()"
        >{{ $t("group.add") }}</el-button
      >
      <el-button
        type="primary"
        size="medium"
        class="float-left"
        @click="saveOrder()"
        v-if="isShowSaveOrderButton"
        >{{ $t("group.saveOrder") }}</el-button
      >
      <el-button
        type="primary"
        size="medium"
        @click="setBookGroup"
        v-if="isShowBookGroupSettingDialog"
        >{{ $t("common.confirm") }}</el-button
      >
      <el-button size="medium" @click="cancel">{{
        $t("common.cancel")
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Axios from "../plugins/axios";
import { mapGetters } from "vuex";
import Dragable from "sortablejs";

export default {
  model: {
    prop: "show",
    event: "setShow"
  },
  name: "BookGroup",
  data() {
    return {
      isShowBookGroupSettingDialog: false,
      showBookGroupList: [],
      sortedBookGroupList: [],
      refreshCounter: 0,
      bookGroupSelection: []
    };
  },
  props: ["show", "isSet"],
  computed: {
    ...mapGetters(["dialogWidth", "dialogTop", "dialogContentHeight"]),
    bookGroupList() {
      return this.$store.state.bookGroupList;
    },
    shelfBooks() {
      return this.$store.getters.shelfBooks;
    },
    showBookInfo: {
      get() {
        return this.$store.state.showBookInfo;
      },
      set(val) {
        this.$store.commit("setShowBookInfo", val);
      }
    },
    isShowSaveOrderButton() {
      return (
        this.showBookGroupList.reduce((p, c) => p + "" + c.groupId, "") !==
        this.sortedBookGroupList.reduce((p, c) => p + "" + c.groupId, "")
      );
    }
  },
  watch: {
    show(isVisible) {
      if (isVisible) {
        this.isShowBookGroupSettingDialog = this.isSet;
        this.bookGroupSelection = [];
        this.computeBookGroupList();
        if (this.isSet) {
          this.$nextTick(() => {
            this.$refs.bookGroupTableRef.clearSelection();
            this.getBookGroupListForBook(this.showBookInfo.group).forEach(v => {
              this.$refs.bookGroupTableRef.toggleRowSelection(v, true);
            });
          });
        }
      }
    },
    isSet(value) {
      if (this.dragableElement) {
        this.dragableElement.option("disabled", value);
      }
    },
    bookGroupList() {
      this.computeBookGroupList();
    }
  },
  methods: {
    cancel() {
      this.isShowBookGroupSettingDialog = false;
      this.$emit("setShow", false);
    },
    computeBookGroupList() {
      this.showBookGroupList = [];
      this.$nextTick(() => {
        this.showBookGroupList = this.isSet
          ? this.$store.state.bookGroupList.filter(v => v.groupId > 0)
          : this.$store.state.bookGroupList;
        this.sortedBookGroupList = this.showBookGroupList;
      });
    },
    opened() {
      this.$refs.bookGroupTableRef.doLayout();
      this.setDragable();
    },
    loadBookGroup(refresh) {
      return this.$root.$children[0].loadBookGroup(refresh);
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
    toggleBookGroupShow(bookGroup, show) {
      Axios.post(this.api + "/saveBookGroup", {
        ...bookGroup,
        show
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.editSuccess"));
            this.loadBookGroup(true);
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
    async deleteBookGroup(row) {
      const res = await this.$confirm(
        this.$t("group.confirmDelete"),
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
      Axios.post(this.api + "/deleteBookGroup", {
        groupId: row.groupId
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("group.deleteSuccess"));
            this.loadBookGroup(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("group.deleteFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    async saveBookGroup(bookGroup) {
      const res = await this.$prompt(
        "",
        this.$t(bookGroup ? "group.edit" : "group.add"),
        {
          inputValue: bookGroup ? bookGroup.groupName : "",
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          inputValidator: v => {
            if (!v) {
              return this.$t("group.nameRequired");
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
      Axios.post(this.api + "/saveBookGroup", {
        ...bookGroup,
        groupName: res.value
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(
              bookGroup
                ? this.$t("common.editSuccess")
                : this.$t("common.addSuccess")
            );
            this.loadBookGroup(true);
          }
        },
        error => {
          this.$message.error(
            this.$t(bookGroup ? "common.editFailed" : "common.addFailed", {
              message: error && error.toString()
            })
          );
        }
      );
    },
    displayBookGroupName(bookGroup) {
      return (
        bookGroup.groupName +
        (bookGroup.groupId < 0
          ? "(" +
            this.$store.getters.builtInBookGroupMap[bookGroup.groupId] +
            ")"
          : "")
      );
    },
    setBookGroup() {
      if (!this.bookGroupSelection.length) {
        this.$message.error(this.$t("group.selectBookGroup"));
        return;
      }
      Axios.post(this.api + "/saveBookGroupId", {
        bookUrl: this.showBookInfo.bookUrl,
        groupId: this.bookGroupSelection.reduce((c, v) => {
          return c | v.groupId;
        }, 0)
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.setSuccess"));
            this.cancel();
            this.showBookInfo = res.data.data;
            this.$store.commit("updateShelfBook", res.data.data);
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
    getBookGroupListForBook(bookGroup) {
      const groups = [];
      this.$store.state.bookGroupList.forEach(v => {
        if (v.groupId > 0 && (v.groupId & bookGroup) !== 0) {
          groups.push(v);
        }
      });
      return groups;
    },
    setDragable() {
      const el = this.$el.querySelectorAll(
        ".el-table__body-wrapper > table > tbody"
      )[0];
      this.dragableElement = Dragable.create(el, {
        handler: ".drag-icon",
        setData: function(dataTransfer) {
          dataTransfer.setData("Text", "");
        },
        onEnd: evt => {
          if (evt.oldIndex === evt.newIndex) return;
          const list = [...this.showBookGroupList];
          const targetRow = list.splice(evt.oldIndex, 1)[0];
          list.splice(evt.newIndex, 0, targetRow);
          this.sortedBookGroupList = list;
        }
      });
      window.bookGroupComp = this;
      this.dragableElement.option("disabled", this.isSet);
    },
    async saveOrder() {
      Axios.post(this.api + "/saveBookGroupOrder", {
        order: this.sortedBookGroupList.map((v, index) => ({
          groupId: v.groupId,
          order: index
        }))
      }).then(
        res => {
          if (res.data.isSuccess) {
            this.$message.success(this.$t("common.saveSuccess"));
            this.loadBookGroup(true);
          }
        },
        error => {
          this.$message.error(
            this.$t("common.saveFailed", {
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
.qrcode-img {
  display: block;
  margin: 0 auto;
}
.drag-icon {
  cursor: move;
  display: inline-block;
  margin-right: 5px;
  user-select: none;
}
</style>
