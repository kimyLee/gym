<template>
  <div class="result-data-item">
    <div class="title-item">
      {{ title }}
    </div>
    <div class="number-item">
      {{ data }}
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
  props: {
    title: {
      type: String,
      default: '',
    },
    data: {
      type: String,
      default: '',
    },
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
  justify-content: center;
  text-align: center;
  font-size: 24px;
  margin-top: 30px;
  .title-item {
    width: 100%;
  }
  .number-item {
      width: 100%;
      // text-align: center;
  }
}

</style>
