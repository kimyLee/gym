<template>
  <div class="result-title">
    <div class="sub-title">
      {{ subTitle }}
    </div>
    <div class="main-title">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useAttrs, markRaw } from 'vue'

import { SettingOutlined } from '@ant-design/icons-vue'
import { string } from 'blockly/core/utils'

export default defineComponent({
  name: 'ResultTitle',
  components: {
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    subTitle: {
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

.result-title::v-deep {
  width: 60%;
  margin-left: 20%;
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
<style lang="scss">
.result-box {
  width: 100%;
  height: 100%;
}
</style>
