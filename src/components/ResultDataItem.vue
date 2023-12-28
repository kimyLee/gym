<template>
  <div class="result-data-item">
    <div class="title-item">
      运动时长
    </div>
    <div class="number-item">
      110
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useAttrs, markRaw } from 'vue'

import { SettingOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'ResultDataItem',
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
.result-data-item {
  display: inline-flex;
  width: 33%;
  flex-wrap: wrap;
  align-items: center;
  font-size: 24px;
  .title-item {
    width: 100%;
  }
  .number-item {
      width: 100%;
      // text-align: center;
  }
}

</style>
