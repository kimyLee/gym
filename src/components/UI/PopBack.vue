<template>
  <!-- 回到首页弹窗 -->
  <div class="pop-back"
       :class="{ 'notShow': !showPop}">
    <div class="content-box">
      <div class="time-box">
        {{ showTime }}<span class="time-box-small">s</span>
      </div>
      <div class="line1" />
      <div class="text-box">
        倒计时结束自动回到首页
      </div>
    </div>

    <div class="start-btn-box">
      <div class="start my-btn"
           @click="keepOnPlay">
        继续运动
      </div>
      <div class="pause my-btn"
           @click="goMenu">
        返回首页
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

  setup () {
    // @ts-ignore
    const HIDE_PAGE_TIME = 40
    const COUNT_DOWN_TIME = 20
    const state = reactive({
      showTime: 0,
      showPop: false,
      timer: null as any,
      sleepTimer: null as any,
    })

    const route = useRoute()

    const goMenu = () => {
      // 菜单页返回home页，其他页面返回菜单
      if (route.name === 'Menu1') {
        router.push({ name: 'Start' })
      } else {
        router.push({ name: 'Menu1' })
      }
    }

    // 开始20s弹窗倒数
    function startCountDown () {
      state.timer = setTimeout(() => {
        state.showTime = state.showTime - 1
        console.log(state.showTime)
        if (state.showTime <= 0) {
          clearTimeout(state.timer)
          state.showPop = false
          goMenu()
        } else {
          startCountDown()
        }
      }, 1000)
    }

    function resetCountDown () {
      state.showPop = true
      state.showTime = COUNT_DOWN_TIME
    }

    function keepOnPlay () {
      clearTimeout(state.timer)
      state.showPop = false
      addClickTimer()
      handleClick()
    }

    // ————————————————————————————

    function handleClick () {
      // 每次点击时重置计时器
      console.log('reset sleepTimer')
      clearTimeout(state.sleepTimer)
      state.sleepTimer = setTimeout(function () { // 40秒内没有点击事件发生，触发弹窗
        removeClickTimer() // 移除监听
        resetCountDown()

        console.log('长时间未点击页面, 触发弹窗')
        startCountDown()
      }, HIDE_PAGE_TIME * 1000)
    }

    function addClickTimer () { // 开始计时
      // 监听点击事件
      document.addEventListener('click', handleClick)
      document.addEventListener('playing', handleClick)
    }
    function removeClickTimer () { // 开始计时
      // 监听点击事件
      document.removeEventListener('click', handleClick)
      document.removeEventListener('playing', handleClick)
      clearTimeout(state.sleepTimer)
    }

    onMounted(() => {
      addClickTimer()
      handleClick()
      // startCountDown()
    })

    onUnmounted(() => {
      removeClickTimer()
      clearTimeout(state.timer)
      // cancelFunction && cancelFunction() // 执行注销函数
    })

    return {
      ...toRefs(state),
      goMenu,
      keepOnPlay,
    }
  },
})
</script>

<style lang="scss" scoped>
.pop-back {
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
    font-size: 16px;
    margin-top: 5px;
    font-weight: 300;
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
