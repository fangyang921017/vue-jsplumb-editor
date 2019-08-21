<template>
  <el-container class="indexWrap">
    <el-aside width="48px"
              class="fy_el-aside">
      <el-menu default-active="2"
               background-color="transparent"
               text-color="#9aaeba"
               active-text-color="#9aaeba"
               :collapse="true">
        <el-menu-item index="1">
          <i class="el-icon-s-home"></i>
          <span slot="title">首页</span>
        </el-menu-item>
        <el-menu-item index="2">
          <i class="el-icon-magic-stick"></i>
          <span slot="title">设计</span>
        </el-menu-item>
        <el-menu-item index="3">
          <i class="el-icon-setting"></i>
          <span slot="title">设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <FlowChart></FlowChart>
    </el-main>
  </el-container>
</template>

<script>
import FlowChart from './FlowChart.vue';

export default {
  components: { FlowChart },

};
</script>

<style lang="scss">
.indexWrap{
  .fy_el-aside {
    background: #21232b;
    overflow-x: hidden;
    .el-menu--collapse {
      width: 48px;
      .el-menu-item {
        padding-left: 0 !important;
        padding: 0px !important;
        height: 48px;
        text-align: center;
        line-height: 48px;
        &:first-child {
          i {
            color: #fff !important;
          }
        }
        &.is-active {
          .el-tooltip {
            background: #121319;
            &::after {
              content: "";
              width: 3px;
              background: #00c1de;
              height: 48px;
              display: block;
              position: absolute;
              top: 0;
            }
          }
        }
        .el-tooltip {
          padding: 0 !important;
        }
      }
    }
  }
  .el-main{
    padding: 0;
  }
}

</style>
