<template>
  <div class="result-title-ui">
    <div class="sub-title">
      {{ subTitle }}
    </div>
    <div class="line1" />
    <div class="main-title">
      运动总结
    </div>
    <div class="line2" />
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

.result-title-ui::v-deep {
  width: 60%;
  margin-left: 20%;
  position: relative;
  height: 120px;
  line-height:$headerHeight;
  font-size: 36px;
  .sub-title {
    text-align: center;
    font-size: 28px;
    height: 32px;
    line-height: 32px;
    margin-bottom: 5px;
    // border-bottom: 1px solid #fff;
  }
  .line1 {
    width: 300px;
    height: 3px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background-image: url(/gym/dist/img/line1.png);
    background-size: 100% 100%;
  }
  .main-title {
    font-size: 36px;
    width: 100%;
    position: absolute;
    text-align: center;
    margin-bottom: 30px;
    // transform: translateX(-90%);
  }
  .line2 {
    width: 120%;
    height: 50px;
    position: absolute;
    left: -10%;
    top: 70px;
    // transform: translateX(-50%);
    background-image: url(/gym/dist/img/line2.png);
    background-size: 100% 100%;
  }
}
</style>
<style lang="scss">
  .result-box-ui {
     width: 100%;
    height: 100%;
    .flex-box {
      position: relative;
      width: 100%;
      height: 100px;
      display: flex;
      justify-content: center;
    }

    .icon-back-ui {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-size: 100% 100%;
      background-image: url(/gym/dist/img/back.png);
    }
  }
</style>
