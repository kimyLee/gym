
<template>
  <Page>
    <div class="intel-fit">
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
        <div class="step-box">
          <div class="progress">
            <div>单次阻力调节</div>
            <div>
              <span class="plus"
                    @click="changeValue1(-0.5)">-</span>
              {{ value1ShowVal }} kg
              <span class="plus"
                    @click="changeValue1(0.5)">+</span>
            </div>
            <!-- <span class="step-icon">
              1
            </span>
            <SwapRightOutlined />

            <span class="step-icon">
              2
            </span>
            <SwapRightOutlined />
            <span class="step-icon">
              3
            </span> -->
          </div>

          <!-- 阶梯 -->
          <!-- <div class="line" /> -->
          <!-- <div class="wave" /> -->
          <div class="wave-top" />
          <div class="wave-bottom" />

          <!-- 开始停止按钮 -->
          <!-- <div class="start-btn">
            <PlayCircleOutlined />
            <PauseCircleOutlined />
            <div class="rect-icon">
              <span />
            </div>
          </div> -->
          <!-- END 开始停止按钮 -->
        </div>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { bleSetSingleLight } from '@/api/joyo-ble/index'

import {
  HistoryOutlined, FireOutlined, SyncOutlined, BulbOutlined,
  PlayCircleOutlined, PauseCircleOutlined, SwapRightOutlined,
} from '@ant-design/icons-vue'

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
  computed,
} from 'vue'
import { connectJoyo, bleState } from '@/api/joyo-ble/web-ble-server'

import HeaderNav from '@/components/HeaderNav.vue'
import ResultTitle from '@/components/ResultTitle.vue'
import ResultDataItem from '@/components/ResultDataItem.vue'
import Page from '@/components/Page.vue'

import { useRoute, useRouter } from 'vue-router'
import '@/style/blockly-category.scss'

export default defineComponent({
  name: 'IntelFit',
  components: {
    Page,
    // HistoryOutlined,
    // FireOutlined,
    // SyncOutlined,
    // BulbOutlined,
    // PlayCircleOutlined,
    // PauseCircleOutlined,
    ResultTitle,
    ResultDataItem,
    // SwapRightOutlined,
  },

  setup () {
    // @ts-ignore
    const state = reactive({
      connectStatus: false,
      value: 0,
      value1: 0,
      value2: 0,
      showResult: false,
    })

    const goPage = (name: string) => {
      router.push({ name })
    }

    const connect = () => {
      heartBeat()
      connectJoyo()
    }

    let timer = null as any

    const value1ShowVal = computed(() => { // 看下行否
      return state.value.toFixed(1)
    })

    function changeValue1 (step: number) {
      state.value = state.value + step
    }

    function heartBeat () {
      clearInterval(timer)
      timer = setInterval(() => { // 定时防止休眠
        console.log('beat')
        bleSetSingleLight(11, 0x000000)
      }, 20000)
    }

    return {
      ...toRefs(state),
      connect,
      goPage,
      changeValue1,
      value1ShowVal,
    }
  },
})
</script>

<style lang="scss" scoped>
@function fact($number) {
    $value: 1;
    @if $number>0 {
        @for $i from 1 through $number {
            $value: $value * $i;
        }
    }
    @return $value;
}
@function pow($number, $exp) {
    $value: 1;
    @if $exp>0 {
        @for $i from 1 through $exp {
            $value: $value * $number;
        }
    }
    @else if $exp < 0 {
        @for $i from 1 through -$exp {
            $value: $value / $number;
        }
    }
    @return $value;
}
@function rad($angle) {
    $unit: unit($angle);
    $unitless: $angle / ($angle * 0 + 1);
    @if $unit==deg {
        $unitless: $unitless / 180 * pi();
    }
    @return $unitless;
}
@function pi() {
    @return 3.14159265359;
}
@function sin($angle) {
    $sin: 0;
    $angle: rad($angle);
    // Iterate a bunch of times.
    @for $i from 0 through 15 {
        $sin: $sin + pow(-1, $i) * pow($angle, (2 * $i + 1)) / fact(2 * $i + 1);
    }
    @return $sin;
}
@function shadowSet($vx, $vy, $direction, $count, $color) {
    $shadow : 0 0 0 0 $color;
    @for $i from 0 through $count {
        $x: sin($i / 8) * $vx * $direction;
        $y: $i * $vy;
        $shadow: $shadow, #{$y} #{$x} 0 0 $color;
    }
    @return $shadow;
}

.intel-fit {
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
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 200px;
    height: 300px;
    background-color: #ccc;
  }

  .step-box {
    display: inline-block;
    width: 600px;
    margin: 0 auto;

    .line {
      width: 1px;
      height: 1px;
      margin: 10vh auto;
      background: #fff;
      border-radius: 50%;
      // transform: scale(3);
      box-shadow: shadowSet(10px, 1px, 1, 100, #fff);
    }

    .progress {
      text-align: center;
      // display: flex;
      // justify-content: space-around;

      .step-icon {
        display: inline-block;
        width: 50px;
        height: 50px;
        line-height: 50px;
        border-radius: 50%;
        border: 1px solid #fff;
        text-align: center;
      }

      .step-line {
        display: inline-block;
        width: 50px;
        height: 50px;

      }
    }

    .power-bar-box {
      // transform: rotateX(30deg);
      text-align: center;

      .power-bar {
        width: 200px;
        height: 0;
        // background-color: #fff;
        margin: 0 auto;
        margin-bottom: 20px;
        border-bottom: 20px solid #fff;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
      }
    }

  }

}
// .wave {
//   position: absolute;
//   left: 0;
//   top: 50%;
//   transform: translateY(calc(-50%));
//   width: 100%;
//   height: 360px; /* 调整高度 */
//   // background-color: #f0f0f0; /* 波浪线的背景色 */
//   overflow: hidden;
//   background-image: url(/bg-wave.png);
//   // background-size: 100% 100%;
//   background-size: 120% 120%;
//     background-position: -10px 0;
//      animation: wave 4s linear infinite;
//   // background-position: -150px 0
// }
.wave-top {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(calc(-50% - 55px));
  width: 100%;
  height: 100px; /* 调整高度 */
  // background-color: #f0f0f0; /* 波浪线的背景色 */
  overflow: hidden;
  background-image: url(/gym/dist/map-line.png);
  background-size: 100% 100%;
  background-size: 75% 100%;
  background-position: -150px 0;
  animation: wave 4s linear infinite;

}
.wave-bottom {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(calc(-50% + 55px));
  width: 100%;
  height: 100px; /* 调整高度 */
  // background-color: #f0f0f0; /* 波浪线的背景色 */
  overflow: hidden;
  background-image: url(/gym/dist/map-line.png);
  background-size: 100% 100%;
  background-size: 75% 100%;
  background-position: -150px 0;
  animation: wave 4s linear infinite;
}

// .wave::before,
// .wave::after {
//   content: "";
//   position: absolute;
//   width: 100%;
//   height: 20px; /* 波浪线的高度 */
//   background: linear-gradient(90deg, transparent, #fff, transparent); /* 调整波浪线的颜色 */
//   bottom: 0;
//   border-radius: 50%; /* 边缘圆角使波浪线更圆润 */
// }

// .wave::before {
//   left: -25%;
//   animation: wave 2s linear infinite; /* 通过动画使波浪线移动 */
// }

// .wave::after {
//   right: -25%;
//   animation: wave-reverse 2s linear infinite; /* 通过动画使波浪线移动 */
// }

@keyframes wave {
  0% {
    // transform: translateX(0);
    background-position: 0 0;
  }
  100% {
    background-position: 723px 0;
  }
}

@keyframes wave-reverse {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

</style>
