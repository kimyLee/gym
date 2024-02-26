
<template>
  <Page show-slot>
    <div class="power-test-1">
      <div v-if="showResult"
           class="result-box">
        <ResultTitle />
        <!-- 具体报告 -->
        <div class="flex-box">
          <ResultDataItem />
          <ResultDataItem />
        </div>
        <div class="flex-box">
          <ResultDataItem />
          <ResultDataItem />
          <ResultDataItem />
        </div>
      </div>
      <!-- 左边浮动记录信息 -->
      <div class="info-panel">
        <div class="panel-title">
          阻力（kg）
        </div>
        <div class="panel-data">
          <!-- <div>{{ force }}</div> -->
          <div class="panel-data-item">
            <span class="panel-sub-title">测试 1</span><span class="triangle" />{{ forceResult[0] || '--' }}
          </div>
          <div class="panel-data-item">
            <span class="panel-sub-title">测试 2</span><span class="triangle" />{{ forceResult[1] || '--' }}
          </div>
          <div class="panel-data-item">
            <span class="panel-sub-title">测试 3</span><span class="triangle" />{{ forceResult[2] || '--' }}
          </div>
        </div>
      </div>
      <!-- 右侧提示语 -->
      <div class="info-panel-right">
        第二次测试：<br /><br />
        在保证安全的前提下请用你的最大力去做运动
      </div>
      <div v-if="!showResult"
           class="page-content power-step">
        <div class="step-box">
          <div class="progress">
            <span class="step-icon"
                  :class="{ 'active': testTimes === 1 }">
              1
            </span>
            <span class="step-icon"
                  :class="{ 'active': testTimes === 2 }">
              2
            </span>
            <span class="step-icon"
                  :class="{ 'active': testTimes === 3 }">
              3
            </span>
          </div>

          <!-- 阶梯 -->
          <div class="power-bar-box">
            <div class="cover-left" />
            <div class="cover-right" />
            <div class="slide-tag"
                 :style="{
                   'left': handleForceStyleLeft(),
                   'top': handleForceStyleTop(),
                 }">
              {{ forceShowVal }}<span class="triangle" />
            </div>
            <div v-for="item in 30"
                 :key="item"
                 :style="{
                   'border-bottom': handleColorStyle(item),
                 }"
                 class="power-bar" />
          </div>
        </div>

        <!-- 开始停止按钮 -->
        <div class="start-btn-box">
          <div v-show="!isTesting"
               class="start my-btn"
               @click="clickStartTest">
            开始
          </div>
          <div v-show="isTesting"
               class="pause my-btn">
            暂停
          </div>

          <div v-show="isTesting"
               class="finish  my-btn">
            结束
          </div>
        </div>
      </div>

      <!-- 加载动画特效 -->
      <div
        v-show="showOverlay"
        class="over-layer">
        <div
          class="progress-bar">
          第{{ testTimes }}次测试
        </div>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">

import {

  PlayCircleOutlined, PauseCircleOutlined, SwapRightOutlined,
} from '@ant-design/icons-vue'

import router from '@/router'
import {
  toRefs,
  reactive,
  defineComponent,
  onMounted,
  onUnmounted,
  watch,
  computed,
} from 'vue'
import { connectJoyo, throttle, send_fit_build_frame, continutePlay } from '@/api/joyo-ble/web-ble-server'

import ResultTitle from '@/components/UI/ResultTitle.vue'
import ResultDataItem from '@/components/UI/ResultDataItem.vue'
import Page from '@/components/UI/Page.vue'

import { useStore } from 'vuex'

export default defineComponent({
  name: 'ProFit',
  components: {
    Page,
    // PlayCircleOutlined,
    ResultTitle,
    ResultDataItem,
    // SwapRightOutlined,
  },

  setup () {
    // @ts-ignore
    const state = reactive({
      connectStatus: false,
      showResult: false,

      testTimes: 0, // 1-3
      showOverlay: false,
      forceResult: [0, 0, 0],

      force: 0.0,
      maxForce: 0,

      maxStep: 5,
      minStep: 5,
      hasPull: false,
      isTesting: false,
    })
    const store = useStore()

    const connectStatus = computed(() => { // 看下行否
      return store.getters['ble/connectStatus']
    })

    watch(() => connectStatus.value, (val) => {
      if (val) {
        initForce()
      }
    })

    const forceShowVal = computed(() => { // 看下行否
      return state.force.toFixed(1)
    })

    function clickStartTest () {
      state.testTimes = 1
      startTest()
    }

    function startTest () { // 开始测试
      if (state.testTimes > 3) return
      state.showOverlay = true
      initForce()
      setTimeout(() => {
        // 确保先进入等速模式

        state.showOverlay = false
        state.isTesting = true
      }, 1000)
    }

    function overTest () { // 结束一轮测试
      state.hasPull = false
      state.isTesting = false

      console.log('结束', state.testTimes, state.maxForce)
      state.forceResult[state.testTimes - 1] = state.maxForce // 填写力度
      state.maxForce = 0
      setTimeout(() => {
        state.testTimes++
        startTest()
      }, 500)
    }

    // 处理力度变化
    const handleForceChange = (force: number) => {
      state.force = force
      console.log(force, '力度')
      if (!state.isTesting) return

      if (!state.hasPull && force > state.maxStep) { // 超过一定值视为已拉
        console.log('已啦')
        state.hasPull = true
      }
      if (state.hasPull && force < state.minStep) { // 力度小于一定值，视为结束一个拉扯
        console.log('结束啦')
        overTest()
        return
      }
      state.maxForce = Math.max(state.maxForce, force)
      // state.force = force
    }

    // 力度收敛，进入下一阶段

    const goPage = (name: string) => {
      router.push({ name })
    }

    const connect = () => {
      connectJoyo()
    }

    function initForce () {
      continutePlay()
      setTimeout(() => {
        send_fit_build_frame({
          mode: 'FLU',
          force: 10,
          back_force: 10,
          fluid_resis_param: 100,
        })
      }, 500)
    }

    const colors = ['#0000ff', '#2727ff', '#4e4eff', '#7676ff', '#9d9dff', '#c4c4ff', '#ebebff', '#ffffff', '#ffffd8', '#ffffb1', '#ffff89', '#ffff62', '#ffff3b', '#ffff14', '#ffff00', '#fff100', '#ffe300', '#ffd500', '#ffc800', '#ffba00', '#ffac00', '#ff9e00', '#ffa500', '#ff8c00', '#ff7200', '#ff5900', '#ff3f00', '#ff2600', '#ff0d00', '#ff0000']
    function handleColorStyle (item: number) {
      if ((state.force / 4 * 3) > (30 - item)) {
        return `5px solid ${colors[colors.length - item]}`
      } else if ((state.maxForce / 4 * 3) >= (30 - item)) { // 峰值
        return `5px solid ${colors[colors.length - item]}88`
      }
      // 未触达
      return '5px solid #fff'
    }
    function handleForceStyleTop () {
      let val = 0
      if (state.force >= 39) {
        val = -12
        return val + 'px'
      }
      if (state.force <= 2) {
        val = 257
        return val + 'px'
      }
      val = 257 + 12 - Math.floor((state.force - 2) * 0.75) * 10
      return val + 'px'
    }
    function handleForceStyleLeft () {
      let val = 0
      if (state.force >= 39) {
        val = 94
        return val + 'px'
      }
      if (state.force <= 1) {
        val = 11
        return val + 'px'
      }
      val = Math.floor((state.force - 2) * 0.75 * 3) + 11
      return val + 'px'
    }

    onMounted(() => {
      initForce()

      const throttledHandleForceChange = throttle(handleForceChange, 300);

      (window as any).webBleNotify = (obj: { info0: any, info1: any }) => {
        // console.log('力度', obj.info0.iq_return)

        throttledHandleForceChange(obj.info0.iq_return / 2)
      }
    })

    onUnmounted(() => {
      (window as any).webBleNotify = null
    })

    return {
      ...toRefs(state),
      connect,
      goPage,
      clickStartTest,
      handleColorStyle,
      handleForceStyleLeft,
      handleForceStyleTop,
      forceShowVal,
    }
  },
})
</script>

<style lang="scss" scoped>
@import "~@/style/var.scss";

.power-test-1 {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-weight: 300;

  .result-box {
    .flex-box {
      position: relative;
      width: 100%;
      height: 80px;
      display: flex;
      justify-content: center;
    }
  }

  .info-panel-right {
    position: absolute;
    right: 20px;
    bottom: 145px;
    // transform: translateY(-50%);
    width: 190px;
    height: 240px;
    font-size: 20px;
    background-color: #000;
    padding: 15px;
    box-sizing: border-box;
  }
  .info-panel {
    position: absolute;
    left: 40px;
    top: 50%;
    transform: translateY(-50%);
    width: 190px;
    height: 300px;
    font-size: 24px;
    .panel-title {
      background-color: #000;
      padding: 10px;
    }
    .panel-data {
      margin-top: 10px;
      background-color: #000;
      padding: 10px;
      height: 230px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      .panel-sub-title {
        display: inline-block;
        width: 85px;
      }
      .panel-data-item {
        height: 50px;
        display: flex;
        align-items: center;
      }
    }
    .triangle {
      width: 0;
      height: 0;
      margin-right: 5px;
      border-left: 8px solid $blue;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-right: 8px solid transparent;
      display: inline-block;
    }
  }

  .power-step {
    height: 100%;
    display: flex;
    // flex-wrap: wrap;
    flex-direction: column;
  }

  .start-btn-box {
    width: 100%;
    height: $bottomHeight;
    text-align: center;
    .my-btn {
      font-size: 60px;
      display: inline-block;
      width: 240px;
      height: 88px;
      line-height: 88px;
      border-radius: 44px;
      background-color: #0d92f5;
      &:last-child {
         margin-left: 20px;
      }

      &.finish {
        background-color: orange;
      }
    }
  }
  .start-btn {

    height: 80px;
    line-height: 80px;
    font-size: 70px;
    color: rgba(255, 255, 255, .8);
    &>.anticon {
      cursor: pointer;
      margin-right: 30px;
    }
  }

  .step-box {
    display: inline-block;
    width: 500px;
    margin: 0 auto;
    flex: 1;
    overflow: hidden;
    padding: 20px 0;
    box-sizing: border-box;

    .progress {
      width: 400px;
      margin-left: 50px;
      display: flex;
      justify-content: space-around;

      .step-icon {
        display: inline-block;
        width: 50px;
        height: 30px;
        line-height: 30px;
        border-radius: 20px;
        background-color: #fff;
        // border: 1px solid #fff;
        text-align: center;
        color: $blue;
        font-size: 24px;
        font-weight: 400;
        &.active {
          background-color: $blue;
          color: #fff;
        }
      }

      .step-line {
        display: inline-block;
        width: 50px;
        height: 50px;

      }
    }

    .power-bar-box {
      // transform: scale(0.8);
      text-align: center;
      position: relative;
      overflow: hidden;
      margin-top: 30px;
      .cover-left {
        position: absolute;
        top: -420px;
        left: -120px;
        width: 277px;
        height: 700px;
        border-radius: 710px 0px;
        pointer-events: none;
        transform: scale(1.2);
        border-right: 200px solid #3C3D3D;
      }
      .cover-right {
        position: absolute;
        top: -420px;
        right: -120px;
        width: 277px;
        height: 700px;
        border-radius:  0px 710px;
        pointer-events: none;
        transform: scale(1.2);
        border-left: 200px solid #3C3D3D;
      }
      .slide-tag {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 30px;
        display: flex;
        align-items: center;

        .triangle {
          width: 0;
          height: 0;
          margin-left: 5px;
          border-left: 8px solid $blue;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-right: 8px solid transparent;
          display: inline-block;
        }
      }
      .power-bar {
        width: 450px;
        height: 0;
        margin: 0 auto;
        margin-bottom: 5px;
        border-bottom: 5px solid #fff;

      }
    }

  }

}

.over-layer {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .6);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.progress-bar {
  background-color: #0456a3;
  width: 100%;
  height: 50px;
  line-height: 50px;
  // padding: 10px 0;
  text-align: center;
  color: white;
  background-image: linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
  animation: progress 1s linear infinite;
}

@keyframes progress {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 120px 0;
  }
}</style>
