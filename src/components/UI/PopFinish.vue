<template>
  <!-- 完成弹窗 -->
  <div class="pop-finish"
       :class="{ 'notShow': !showPop }">
    <div class="content-box">
      <div class="time-box">
        恭喜完成
      </div>
      <div class="line1" />
      <div class="text-box">
        Finish
      </div>
    </div>

    <div class="start-btn-box">
      <div class="start my-btn"
           @click="keepOnPlay">
        确定
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {
  ClientResponse,
  ClientResponseWithData,
  BleList,
} from '@/api/common-type'

import router from '@/router'
import {
  toRefs,
  reactive,
  defineComponent,
  onMounted,
  onUnmounted,
} from 'vue'

import { useRoute, useRouter } from 'vue-router'
// import { myEvent } from 'vue-router'

// import startClickTimer from '@/lib/sleep'

export default defineComponent({
  name: 'BleUsage',
  components: {
  },
  props: {
    showPop: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:showPop'],

  setup (props, { emit }) {
    // @ts-ignore
    const state = reactive({
      // showPop: true,
    })

    const route = useRoute()

    function keepOnPlay () {
      emit('update:showPop', false)
      // state.showPop = false
    }

    // ————————————————————————————

    onMounted(() => { //
    })

    onUnmounted(() => { //
    })

    return {
      ...toRefs(state),
      keepOnPlay,
    }
  },
})
</script>

<style lang="scss" scoped>
.pop-finish {
  position: absolute;
  z-index: 200;
  width: 800px;
  height: 500px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 25px;
  background-color: rgba(0, 0, 0, .8);

  &.notShow {
    left: -100%;
  }

  // padding: 30px;
  // box-sizing: border-box;
  // display: flex;
  // align-items: center;
  // justify-content: center;

  .content-box {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .time-box {
    text-align: center;
    font-size: 72px;
    font-weight: 300;

    .time-box-small {
      font-size: 64px;
    }
  }

  .text-box {
    font-size: 20px;
    margin-top: 5px;
    font-weight: 300;
    text-align: center;
    color: #0d92f5;
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

  .start-btn-box {
    width: 100%;
    height: 88px;
    position: absolute;
    bottom: 92px;
    left: 0;
    display: flex;
    justify-content: space-around;
    font-weight: 300;

    .my-btn {
      font-size: 32px;
      display: inline-block;
      text-align: center;
      width: 240px;
      height: 88px;
      line-height: 88px;
      border-radius: 44px;
      background-color: #0d92f5;

      &.pause {
        background-color: #F42727;
      }
    }
  }
}
</style>
