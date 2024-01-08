
<template>
  <Page>
    <div class="power-test">
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

      <div v-if="!showResult"
           class="page-content power-step">
        <!-- 左边浮动记录信息 -->
        <div class="info-panel">
          阻力（kg）
          <div>{{ forceResult[0] || '--' }}</div>
          <div>{{ forceResult[1] || '--' }}</div>
          <div>{{ forceResult[2] || '--' }}</div>
        </div>
        <div class="step-box">
          <div class="progress">
            <span class="step-icon"
                  :class="{'active': testTimes === 1}">
              1
            </span>
            <SwapRightOutlined />

            <span class="step-icon"
                  :class="{ 'active': testTimes === 2 }">
              2
            </span>
            <SwapRightOutlined />
            <span class="step-icon"
                  :class="{ 'active': testTimes === 3 }">
              3
            </span>
          </div>

          <!-- 阶梯 -->
          <div class="power-bar-box">
            <div v-for="item in 10"
                 :key="item"
                 class="power-bar"
                 :class="{'active': (force / 10) >= item, 'active2': (maxForce / 10) >= item }"
                 :style="{
                   width: (item * 40 + 150) + 'px',
                   'border-bottom': (item * 6 + 10) + 'px solid #fff',
                 }" />
          </div>

          <!-- 开始停止按钮 -->
          <div class="start-btn">
            <PlayCircleOutlined @click="startTest" />
            <PauseCircleOutlined />
            <div class="rect-icon">
              <span />
            </div>
          </div>
          <!-- END 开始停止按钮 -->
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
} from 'vue'
import { connectJoyo, throttle, send_fit_build_frame } from '@/api/joyo-ble/web-ble-server'

import ResultTitle from '@/components/ResultTitle.vue'
import ResultDataItem from '@/components/ResultDataItem.vue'
import Page from '@/components/Page.vue'

export default defineComponent({
  name: 'ProFit',
  components: {
    Page,
    // HistoryOutlined,
    // FireOutlined,
    // SyncOutlined,
    // BulbOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    ResultTitle,
    ResultDataItem,
    SwapRightOutlined,
  },

  setup () {
    // @ts-ignore
    const state = reactive({
      connectStatus: false,
      showResult: false,

      testTimes: 0, // 1-3
      showOverlay: false,
      forceResult: [0, 0, 0],

      force: 0,
      maxForce: 0,

      maxStep: 30,
      minStep: 20,
      hasPull: false,
      isTesting: false,
    })

    function startTest () { // 开始测试
      state.testTimes++
      if (state.testTimes >= 3) return
      state.showOverlay = true
      setTimeout(() => {
        // 确保先进入等速模式
        send_fit_build_frame({
          mode: 'FLU',
        })

        state.showOverlay = false
        state.isTesting = true
      }, 1000)
    }

    function overTest () { // 结束一轮测试
      state.isTesting = false
      state.forceResult[state.testTimes - 1] = state.maxForce // 填写力度
      setTimeout(() => {
        startTest()
      }, 500)
    }

    // 处理力度变化
    const handleForceChange = (force: number) => {
      if (!state.isTesting) return
      if (!state.hasPull && force > state.maxStep) { // 超过一定值视为已拉
        state.hasPull = true
      }
      if (state.hasPull && force < state.minStep) { // 力度小于一定值，视为结束一个拉扯
        overTest()
        return
      }
      state.maxForce = Math.max(state.maxForce, force)
      state.force = force
    }

    // 力度收敛，进入下一阶段

    const goPage = (name: string) => {
      router.push({ name })
    }

    const connect = () => {
      connectJoyo()
    }

    onMounted(() => {
      const throttledHandleForceChange = throttle(handleForceChange, 500);

      (window as any).webBleNotify = (obj: { info0: any, info1: any }) => {
        console.log('webBleNotify', obj.info0, obj.info1)

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
      startTest,
    }
  },
})
</script>

<style lang="scss" scoped>
@import "~@/style/var.scss";

.power-test {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;

  .result-box {
    .flex-box {
      position: relative;
      width: 100%;
      height: 80px;
      display: flex;
      justify-content: center;
    }
  }
  .power-step {
    height: 100%;
  }

  .info-panel {
    position: absolute;
    left: 40px;
    top: 50%;
    transform: translateY(-50%);
    width: 200px;
    height: 300px;
    // background-color: #ccc;
  }
  .start-btn {
    position: absolute;
    right: 80px;
    top: 50%;
    transform: translateY(-50%);
    width: 100px;
    height: 100px;
    font-size: 60px;
  }

  .step-box {
    display: inline-block;
    width: 600px;
    margin: 0 auto;
    .progress {
      width: 400px;
      margin-left: 100px;
      display: flex;
      justify-content: space-around;
      .step-icon {
        display: inline-block;
        width: 50px;
        height: 50px;
        line-height: 50px;
        border-radius: 50%;
        border: 1px solid #fff;
        text-align: center;
        &.active {
           border: 1px solid $blue ;
           background-color: $blue;
           color: $bgColor;
        }
      }
      .step-line {
        display: inline-block;
        width: 50px;
        height: 50px;

      }
    }

    .power-bar-box {
      transform: scale(0.8);
      text-align: center;
      .power-bar {
        width: 150px;
        height: 0;
        // background-color: #fff;
        margin: 0 auto;
        // margin-bottom: 20px;
        margin-bottom: 10px;
        border-bottom: 20px solid #fff;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;

        &.active, &.active.active2 {
           border-bottom: 20px solid $blue;
        }
        &.active2 {
           border-bottom: 20px solid rgb(24, 144, 255, .4);
        }
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
}
</style>
