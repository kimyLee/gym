<template>
  <div class="result-title">
    <div class="sub-title">
      力量测试
    </div>
    <div class="main-title">
      力量测试报告
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useAttrs, markRaw } from 'vue'

import { SettingOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'ResultTitle',
  components: {
  },
  setup () {
    return {
    }
  },
})
</script>

<style scoped lang="scss">
@import "~@/style/var.scss";
.result-title::v-deep {
  width: 400px;
  position: relative;
  height: $headerHeight;
  line-height:$headerHeight;
  font-size: 36px;
  .main-title {
    text-align: center;
    // text-decoration: underline;
    border-bottom: 1px solid #fff;
  }
  .sub-title {
    font-size: 24px;
    position: absolute;
    transform: translateX(-90%);
  }
}
</style>
