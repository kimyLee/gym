<template>
  <div class="result-data-item">
    <div>
      <div class="title-item">
        <span class="dot" /><span class="text">{{ title }}</span>
      </div>
    </div>
    <div class="number-item"
         :class="{'small-text': data.length > 12}">
      {{ data }}{{ unit ? ' ' + unit : '' }}
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
    unit: {
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
  font-size: 30px;
  margin-top: 30px;
  .title-item {
    width: 100%;
    height: 38px;
    display: flex;
    align-items: center;

    .dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #fff;
      margin-right: 5px;
    }
  }
  .number-item {
      width: 100%;
      // text-align: center;
      &.small-text {
        font-size: 24px;
      }
  }
}

</style>
