
<template>
  <Page>
    <div class="intel-fit-1">
      <div v-show="showResult"
           class="result-box-ui">
        <ResultTitle title="运动总结"
                     sub-title="智能健身" />
        <!-- 具体报告 -->
        <div class="flex-box">
          <ResultDataItem title="运动时长"
                          :data="totalWork" />
          <ResultDataItem title="运动次数"
                          :data="totalTime" />
          <ResultDataItem title="总重量"
                          :data="totalTime" />
        </div>
        <div class="flex-box">
          <ResultDataItem title="总做工"
                          :data="totalPlayTime" />
          <ResultDataItem title="平均功率"
                          :data="totalAverW" />
          <ResultDataItem title="热量消耗"
                          :data="totalFinalCal" />
        </div>
        <!-- 返回按钮 -->
        <div
          class="icon-back-ui right-bottom"
          @click="goBack" />
      </div>

      <div v-if="!showResult"
           class="page-content power-step">
        <!-- 左边浮动记录信息 -->
        <div class="step-box">
          <div v-show="!isPlaying"
               class="progress">
            <div
              class="option-box">
              <div>阻力调节</div>
              <div>
                <span class="plus"
                      @click="changeValue(-0.5)">-</span>
                {{ valueShowVal }} kg
                <span class="plus"
                      @click="changeValue(0.5)">+</span>
              </div>
            </div>
            <div
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
            <div class="show-score">
              {{ score }}
            </div>
          </div>
          <div v-show="isPlaying"
               class="progress">
            <div class="sub-info">
              <div class="">
                阻力: {{ valueShowVal }} kg
              </div>
              <div class="">
                速度: {{ speedShowVal }}
              </div>
            </div>

            <div class="flex-box">
              <ResultDataItem title="训练时长"
                              :data="totalWork" />
              <ResultDataItem title="得分"
                              :data="score" />
              <ResultDataItem title="热量消耗"
                              :data="totalTime" />
            </div>
          </div>

          <div class="wave-top">
            <div v-for="item in 14"
                 :key="item"
                 class="coin"
                 :style="{'left': computedLeft(item), top: computedTop(item)}" />
          </div>
          <!-- <div class="wave-bottom" /> -->

          <div class="ball-box">
            <Transition name="score-fade">
              <div v-if="showScore"
                   class="score-text">
                $ +1
              </div>
            </Transition>

            <div class="smart-ball pacman"
                 :class="{'up': addForce, 'down': reduceForce }"
                 :style="{top: distance * 2 + '%'}" />
          </div>

          <!-- 开始停止按钮 -->
          <div class="start-btn-box">
            <div v-show="!isPlaying"
                 class="start my-btn"
                 :class="{'go-on': hasStart }"
                 @click="startGame">
              {{ hasStart ? '继续' : '开始' }}
            </div>
            <div v-show="isPlaying"
                 class="pause my-btn"
                 @click="stopGame">
              暂停
            </div>

            <div v-show="hasStart"
                 class="finish  my-btn"
                 @click="finishGame">
              结束
            </div>
          </div>
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

import ResultTitle from '@/components/UI/ResultTitle.vue'
import ResultDataItem from '@/components/UI/ResultDataItem.vue'
import Page from '@/components/UI/Page.vue'

export default defineComponent({
  name: 'IntelFit',
  components: {
    Page,
    ResultTitle,
    ResultDataItem,
    // PlayCircleOutlined,
    // PauseCircleOutlined,

  },

  setup () {
    // @ts-ignore
    const state = reactive({
      connectStatus: false,
      value: 0,
      speed: 5, // [0-10]

      distance: 20, // 小球距离， distance
      addForce: false,
      reduceForce: false,
      showScore: false,

      showResult: false,

      isPlaying: false,
      hasStart: false,
      score: 0,

      // 汇总数据
      totalWork: '0J',
      totalTime: '00:00:00',
      totalPlayTime: '0 | 0',
      totalAverW: '0w',
      totalFinalCal: '0cal',
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

      if (waveTop) {
        removeSpeedClasses(waveTop)
        waveTop.classList.add(`speed-${state.speed}`)
      }
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
      if (distance > state.distance) {
        state.addForce = true
        state.reduceForce = false
      } else if (distance === state.distance) {
        state.addForce = false
        state.reduceForce = false
      } else {
        state.addForce = false
        state.reduceForce = true
      }
      state.distance = distance
      console.log(distance)
      // 处理小球位置
    }

    function computedLeft (item: number) {
      switch (item) {
        case 1:
          // return '3%'
          return '58px' // 差144
        case 2:
          return '192px'
          // return '10%'
        case 3:
          return '326px'
          // return '17%'
        case 4:
          return '24%'
        case 5:
          return '31%'
        case 6:
          return '38%'
        case 7:
          return '45%'
        case 8:
          return '53%'
        case 9:
          return '60%'
        case 10:
          return '67%'
        case 11:
          return '74%'
        case 12:
          return '81%'
        case 13:
          return '88%'
        case 14:
          return '95%'
      }
      return ''
    }

    function computedTop (item: number) {
      switch (item) {
        case 1: case 5: case 8: case 12:
          return '82px'
        case 2: case 6: case 9: case 13:
          return '30px'
        case 3: case 7: case 10: case 14:
          return '82px'
        case 4: case 11:
          return '128px'
      }
      return '128px'
    }

    const audio = new Audio('/gym/dist/audio/score.mp3')

    function handleScore () { // 得分效果
      state.showScore = true
      audio.play()
      setTimeout(() => {
        state.showScore = false
      }, 50)
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
      const factor = getFactor()
      count += factor
      if (count >= 1000) {
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
      if (waveTop) {
        waveTop.style.left = `-${count / 10}%`
      }
      // 判断小球是否得分
      // const count_temp = Math.floor(count)
      const count_temp = count // 偏移位置
      const step = 144
      if (count_temp % step <= 3) {
        const index = Math.floor(count_temp / step)
        if (index !== lastIndex) {
          lastIndex = index
          if (index % 4 === 1) {
            if (state.distance > 7 && state.distance < 16.5) {
              state.score++
              handleScore()
            }
          } else if (index % 4 === 0 || index % 4 === 2) {
            if (state.distance > 19 && state.distance < 28.5) {
              state.score++
              handleScore()
            }
          } else if (index % 4 === 3) {
            if (state.distance > 29 && state.distance < 38.5) {
              state.score++
              handleScore()
            }
          }
        }
      }

      myReq = requestAnimationFrame(mockAnimation)
    }

    function startGame () {
      mockAnimation()
      state.hasStart = true
      state.isPlaying = true
    }
    function stopGame () {
      state.isPlaying = false
      cancelAnimationFrame(myReq)
    }
    function finishGame () {
      cancelAnimationFrame(myReq)
      state.isPlaying = false
      state.showResult = true
      state.hasStart = false
    }

    function goBack () {
      state.showResult = false

      cancelAnimationFrame(myReq)
      state.isPlaying = false
      state.hasStart = false
      state.score = 0
    }

    onMounted(() => {
      const throttledHandleForceChange = throttle(handleForceChange, 100);

      (window as any).webBleNotify = (obj: { info0: any, info1: any }) => {
        // console.log('webBleNotify', obj.info0)

        const distance = Math.min(50, Math.abs(obj.info0.distance))

        throttledHandleForceChange(distance)
      }
      // mockAnimation()

      // mock
      // let step = 1
      // setInterval(() => {
      //   const distance = state.distance + step
      //   if (state.distance >= 30) {
      //     step = -1
      //   } if (state.distance <= 0) {
      //     step = 1
      //   }

      //   if (distance < state.distance) {
      //     state.addForce = true
      //     state.reduceForce = false
      //   } else if (distance === state.distance) {
      //     state.addForce = false
      //     state.reduceForce = false
      //   } else {
      //     state.addForce = false
      //     state.reduceForce = true
      //   }
      //   state.distance = distance
      // }, 200)
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
      computedLeft,
      computedTop,
      startGame,
      stopGame,
      finishGame,
      goBack,
    }
  },
})
</script>

<style lang="scss" scoped>
@import "~@/style/var.scss";
.intel-fit-1 {
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
      .show-score {
        position:absolute;
        left: 50%;
        transform: translateX(-50%);
      }
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
      .sub-info {
        display: flex;
        font-size: 24px;
        justify-content: space-evenly;
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
  .score-text {
    position: absolute;
    top: 45px;
    left: 50px;
    color: yellow;
    font-size: 24px;
    font-weight: bold;
  }
  .smart-ball {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    // background-color: yellow;
    // background-image: url(/gym/dist/img/hero.png);
    // background-size: cover;

    position: absolute;
    left: 60px;
    top: 0;
    transform: translateY(-50%);
    &.up {
      transform: translateY(-50%) rotate(-45deg);
    }
    &.down {
      transform: translateY(-50%) rotate(45deg);
    }
  }
  .pacman:before,
  .pacman:after {
    content: '';
    position: absolute;
    background: $blue;
    width: 36px;
    height: 18px;
    left: 50%;
    top: 50%;
    margin-left: -18px;
    margin-top: -18px;
    border-radius: 18px 18px 0 0;
    /*动画*/
    animation: up 0.6s infinite;

  }

  .pacman:after {
    /*为了使两个半圆咬合时不出现缝隙*/
    margin-top: -1px;
    border-radius: 0 0 18px 18px;
    -webkit-animation: down 0.6s infinite;
    -moz-animation: down 0.6s infinite;
    -o-animation: down 0.6s infinite;
    animation: down 0.6s infinite;
  }
}

.wave-top {
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: -35px;
  width: 200%;
  height: 200px; /* 调整高度 */
  background-image: url(/gym/dist/img/gameBg.png);
  background-size: 50% 100%;
  background-position: 0 0;
}
.wave-bottom {
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: 75px;
  width: 200%;
  height: 100px; /* 调整高度 */
  overflow: hidden;
  // background-image: url(/gym/dist/gameBg.png);
  background-size: 32.5% 100%;
  background-position: -150px 0;
}

.start-btn-box {
  width: 100%;
  height: $bottomHeight;
  text-align: center;
  // margin-top: 287px;
  position: absolute;
  bottom: 0;
  left: 0;
  .my-btn {
    font-size: 60px;
    display: inline-block;
    width: 240px;
    height: 88px;
    line-height: 88px;
    border-radius: 44px;
    background-color: #0d92f5;
    &.pause {
      background-color: #F6B325;
    }
    &:last-child {
        margin-left: 20px;
    }

    &.finish {
      background-color: #E32E29;
    }
  }
}

</style>
<style lang="scss">
.coin {
  position: absolute;
  width: 40px;
  height: 40px;
  background-image: url(/gym/dist/img/coin2.png);
  background-size: 100% 100%;
  // animation: move-coin 11.2s linear infinite;
}
@keyframes up {
  0%,
  100% {
    transform: rotate(0);
  }
  50% {
    transform: rotate(-30deg);
  }
}
 @keyframes down {
  0%,
  100% {
    transform: rotate(0);
  }

  50% {
    transform: rotate(30deg);
  }
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
<style>
/*
  进入和离开动画可以使用不同
  持续时间和速度曲线。
*/

/* .score-fade-enter-active {
  transition: all 0.3s ease-out;
} */

.score-fade-leave-active {
  transition: all .5s ease;
}

.score-fade-leave-to {
  transform: translateY(-40px);
  opacity: 0;
}
</style>
