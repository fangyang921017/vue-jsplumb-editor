<template>
  <el-tooltip :disabled="tooltipDisabled"
              placement="right">
    <div slot="content"
         class="fy_tooltip_content">节点信息：{{text}}</div>
    <div @mousedown="tooltipDisabled=true"
         @mouseup="tooltipDisabled=false">
      <span class="blue_line"></span>
      <div class="content">
        <i :class="iconCLassName"></i>
        <span class="text">{{text}}</span>
        <i v-if="state==='loading'" class="el-icon-loading node-state"></i>
        <i v-else-if="state==='success'" class="el-icon-circle-check node-state"></i>
        <i v-else-if="state==='failed'" class="el-icon-circle-close node-state"></i>
        <i v-else-if="state==='warning'" class="el-icon-warning-outline node-state"></i>
        <i v-else></i>
      </div>
    </div>
  </el-tooltip>
</template>
<script>
export default {
  data() {
    return {
      tooltipDisabled: false,
      text: this.contentText,
      state: this.nodeState,
    };
  },
  props: [
    'nodeState',
    'iconCLassName',
    'contentText',
  ],
  methods: {

  },
};
</script>
<style lang="scss" scoped>
.el-icon-loading{
  color: #909399 !important;
}
.el-icon-circle-check{
  color: #67C23A !important;
}
.el-icon-circle-close{
  color: #F56C6C !important;
}
.el-icon-warning-outline{
  color: #E6A23C !important;
}
</style>
