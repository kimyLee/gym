
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
            <div v-show="!isPlaying"
                 class="option-box">
              <div>单次阻力调节</div>
              <div>
                <span class="plus"
                      @click="changeValue(-0.5)">-</span>
                {{ valueShowVal }} kg
                <span class="plus"
                      @click="changeValue(0.5)">+</span>
              </div>
            </div>
            <div v-show="!isPlaying"
                 class="option-box">
              <div>速度调节</div>
              <div>
                <span class="plus"
                      @click="changeSpeed(-1)">-</span>
                {{ speedShowVal }}
                <span class="plus"
                      @click="changeSpeed(1)">+</span>
              </div>
            </div>
            <div v-show="isPlaying"
                 class="option-box">
              <div>得分数</div>
              <div>
                {{ score }}
              </div>
            </div>
          </div>

          <div class="wave-top">
            <div v-for="item in 18"
                 :key="item"
                 class="coin"
                 :style="{'left': 3.5 + (item - 1) * 5.4 + '%', top: computedTop(item - 1)}" />
          </div>
          <div class="wave-bottom" />

          <div class="ball-box">
            <div class="smart-ball"
                 :style="{top: distance * 2 + '%'}" />
          </div>

          <!-- 开始停止按钮 -->
          <div class="start-btn">
            <PlayCircleOutlined v-show="!isPlaying"
                                @click="startGame" />
            <PauseCircleOutlined v-show="isPlaying"
                                 @click="stopGame" />
            <div class="rect-icon"
                 @click="finishGame">
              <span />
            </div>
          </div>
          <!-- END 开始停止按钮 -->
        </div>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">

import {

  PlayCircleOutlined, PauseCircleOutlined,
} from '@ant-design/icons-vue'

import router from '@/router'
import {
  toRefs,
  reactive,
  defineComponent,
  computed,
  onMounted,
  onUnmounted,
} from 'vue'
import { connectJoyo, throttle, send_fit_build_frame } from '@/api/joyo-ble/web-ble-server'

import ResultTitle from '@/components/ResultTitle.vue'
import ResultDataItem from '@/components/ResultDataItem.vue'
import Page from '@/components/Page.vue'

export default defineComponent({
  name: 'IntelFit',
  components: {
    Page,
    ResultTitle,
    ResultDataItem,
    PlayCircleOutlined,
    PauseCircleOutlined,

  },

  setup () {
    // @ts-ignore
    const state = reactive({
      connectStatus: false,
      value: 0,
      speed: 5, // [0-10]

      distance: 10, // 小球距离， distance

      showResult: false,

      isPlaying: false,
      score: 0,
    })

    const goPage = (name: string) => {
      router.push({ name })
    }

    const connect = () => {
      connectJoyo()
    }

    const valueShowVal = computed(() => { // 看下行否
      return state.value.toFixed(1)
    })
    const speedShowVal = computed(() => { // 看下行否
      return state.speed.toFixed(1)
    })

    function changeValue (step: number) { // 设置阻力调节
      state.value = Math.max(0, Math.min(100, state.value + step))

      send_fit_build_frame({
        mode: 'STD',
        force: state.value,
        back_force: state.value,
      })
    }

    // let timer = null as any
    // // 生成金币
    // function generateCoins (index = 0) {
    //   // 创建一个 div 元素
    //   const newDiv = document.createElement('div')
    //   // 添加类名为 'coin'
    //   newDiv.classList.add('coin')
    //   console.log(index)
    //   newDiv.style.left = `${index * 10}%`
    //   // 将新创建的 div 元素添加到页面中的 body 元素内

    //   const waveTop = document.querySelector('.wave-top') as HTMLElement
    //   if (waveTop) {
    //     waveTop.appendChild(newDiv)
    //     if (waveTop.children.length >= 10) {
    //       waveTop.removeChild(waveTop.children[0])
    //     }
    //   }

    //   timer = setTimeout(() => {
    //     generateCoins(index >= 10 ? 0 : (index + 1))
    //   }, 2000)
    // }

    // 修改速度
    function changeSpeed (step: number) {
      state.speed = Math.max(0, Math.min(10, state.speed + step))

      // 背景移动速度调整
      setAnimationStyle()
    }

    function setAnimationStyle () {
      // 1: 16s, 10, 4s
      // const second = 16 - (state.speed) * 1.2
      const waveTop = document.querySelector('.wave-top') as HTMLElement
      const waveBottom = document.querySelector('.wave-bottom') as HTMLElement

      if (waveTop) {
        removeSpeedClasses(waveTop)
        waveTop.classList.add(`speed-${state.speed}`)
      }
      if (waveBottom) {
        removeSpeedClasses(waveBottom)
        waveBottom.classList.add(`speed-${state.speed}`)
        // waveBottom.style.animation = `wave ${second}s linear infinite;`
      }
      console.log(waveTop.style.animation, waveBottom.style.animation)
    }

    function removeSpeedClasses (element: HTMLElement) {
      if (element.classList) {
        const classes = Array.from(element.classList)
        classes.forEach(className => {
          if (className.startsWith('speed-')) {
            element.classList.remove(className)
          }
        })
      }
    }

    // 处理力度变化
    const handleForceChange = (distance: number) => {
      state.distance = distance
      console.log(distance)
      // 处理小球位置
    }

    function computedTop (item: number) {
      switch (item % 3) {
        case 0:
          return '40px'
        case 1:
          return '110px'
        case 2:
          return '110px'
        // case 3:
        //   return '10px'
      }
    }

    function getFactor () {
      if (state.speed > 5) {
        return 0.2 * (state.speed - 5) + 1
      } else if (state.speed < 5) {
        return 1 - 0.1 * (5 - state.speed)
      }
      return 1
    }

    let dirc = 1
    let count = 0
    let lastIndex = -1
    let myReq: any

    function mockAnimation () {
      // state.distance = state.distance + dirc
      const factor = getFactor()
      count += factor
      if (count >= 976) {
        count = 0
      }
      if (state.distance > 50) {
        state.distance = 50
        dirc = -1
      }
      if (state.distance < 0) {
        state.distance = 0
        dirc = 1
      }

      const waveTop = document.querySelector('.wave-top') as HTMLElement
      const waveBottom = document.querySelector('.wave-bottom') as HTMLElement
      if (waveTop) {
        waveTop.style.left = `-${count / 10}%`
        waveBottom.style.left = `-${count / 10}%`
      }
      // 判断小球是否得分

      const count_temp = Math.floor(count - 71)
      if (count_temp % 108 <= 3) {
        const index = Math.floor(count_temp / 108)
        if (index !== lastIndex) {
          lastIndex = index
          console.log('开始算分', state.distance, count)

          if (index % 4 === 0 || index % 4 === 3) {
            if (state.distance > 7 && state.distance < 22.5) {
              state.score++
              // console.log('中')
            } else {
              // console.log('不中')
            }
          } else {
            if (state.distance > 22.5 && state.distance < 39) {
              state.score++
              // console.log('中')
            } else {
              // console.log('不中')
            }
          }
        }
      }

      myReq = requestAnimationFrame(mockAnimation)

      // re(() => {
      //   mockAnimation()
      // }, 100)
    }

    function startGame () {
      state.isPlaying = true
    }
    function stopGame () {
      state.isPlaying = false
    }
    function finishGame () {
      state.isPlaying = false
      // state.showResult
    }

    onMounted(() => {
      const throttledHandleForceChange = throttle(handleForceChange, 100);

      (window as any).webBleNotify = (obj: { info0: any, info1: any }) => {
        // console.log('webBleNotify', obj.info0)

        const distance = Math.min(50, Math.abs(obj.info0.distance))

        throttledHandleForceChange(distance)
      }
      mockAnimation()
    })

    onUnmounted(() => {
      (window as any).webBleNotify = null
      cancelAnimationFrame(myReq)
    })

    return {
      ...toRefs(state),
      connect,
      goPage,
      changeValue,
      changeSpeed,
      valueShowVal,
      speedShowVal,
      computedTop,
      startGame,
      stopGame,
      finishGame,
    }
  },
})
</script>

<style lang="scss" scoped>
// @function fact($number) {
//     $value: 1;
//     @if $number>0 {
//         @for $i from 1 through $number {
//             $value: $value * $i;
//         }
//     }
//     @return $value;
// }
// @function pow($number, $exp) {
//     $value: 1;
//     @if $exp>0 {
//         @for $i from 1 through $exp {
//             $value: $value * $number;
//         }
//     }
//     @else if $exp < 0 {
//         @for $i from 1 through -$exp {
//             $value: $value / $number;
//         }
//     }
//     @return $value;
// }
// @function rad($angle) {
//     $unit: unit($angle);
//     $unitless: $angle / ($angle * 0 + 1);
//     @if $unit==deg {
//         $unitless: $unitless / 180 * pi();
//     }
//     @return $unitless;
// }
// @function pi() {
//     @return 3.14159265359;
// }
// @function sin($angle) {
//     $sin: 0;
//     $angle: rad($angle);
//     // Iterate a bunch of times.
//     @for $i from 0 through 15 {
//         $sin: $sin + pow(-1, $i) * pow($angle, (2 * $i + 1)) / fact(2 * $i + 1);
//     }
//     @return $sin;
// }
// @function shadowSet($vx, $vy, $direction, $count, $color) {
//     $shadow : 0 0 0 0 $color;
//     @for $i from 0 through $count {
//         $x: sin($i / 8) * $vx * $direction;
//         $y: $i * $vy;
//         $shadow: $shadow, #{$y} #{$x} 0 0 $color;
//     }
//     @return $shadow;
// }

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
      user-select: none;

      .option-box {
        display: inline-block;
        width: 50%;
        text-align: center;
      }
      .plus {
        display: inline-block;
        width: 50px;
        height: 50px;
        line-height: 50px;
        border-radius: 5px;
        border: 1px solid #fff;
        text-align: center;
      }

    }

  }

}

.ball-box {
  position: absolute;
  width: 100%;
  top: 50%;
  left: 0;
  transform: translateY(calc(-50% + 70px));
  height: 220px;
  .smart-ball {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: yellow;

    position: absolute;
    left: 0;
    top: 0;
    transform: translateY(-50%);
  }
}

.wave-top {
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: -35px;
  width: 200%;
  height: 100px; /* 调整高度 */
  // overflow: hidden;
  background-image: url(/gym/dist/map-line.png);
  // background-size: 100% 100%;
  background-size: 32.5% 100%;
  background-position: -150px 0;
  // animation: wave 11.2s linear infinite;

  // $animation-duration: 1s;
  // @for $i from 0 through 10{
  //   &.speed-#{$i}{
  //     animation: wave (16 - ($i) * 1.2) * $animation-duration linear infinite;
  //   }
  // }

}
.wave-bottom {
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: 75px;
  // transform: translateY(calc(-50% + 75px));
  width: 200%;
  height: 100px; /* 调整高度 */
  // background-color: #f0f0f0; /* 波浪线的背景色 */
  overflow: hidden;
  background-image: url(/gym/dist/map-line.png);
  background-size: 100% 100%;
  background-size: 32.5% 100%;
  background-position: -150px 0;
  // animation: wave 11.2s linear infinite;

  // $animation-duration: 1s;
  // @for $i from 0 through 10{
  //   &.speed-#{$i}{
  //     animation: wave (16 - ($i) * 1.2) * $animation-duration linear infinite;
  //   }
  // }
}

.start-btn {
  position: absolute;
  right: 20px;
  top: 100px;
  // transform: translateY(-50%);
  width: 100px;
  height: 100px;
  font-size: 60px;
  z-index: 100;
  cursor: pointer;
}

</style>
<style lang="scss">
.coin {
  position: absolute;
  width: 40px;
  height: 40px;
  background-image: url(/gym/dist/coin.png);
  background-size: 100% 100%;
  // animation: move-coin 11.2s linear infinite;
}
@keyframes move-coin {
  0% {
    transform: translateX(0);

  }
  100% {
    transform: translateX(-50%);
  }
}
@keyframes wave {
  0% {
    transform: translateX(0);
    // background-position: 723px 0;
  }
  100% {
    transform: translateX(-960px);
    // background-position: 0 0;
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
