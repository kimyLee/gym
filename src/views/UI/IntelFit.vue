
<template>
  <Page>
    <PopForce v-model:showPop="showPop"
              :val="value"
              @change-force="setPopForce" />
    <PopFinish v-model:showPop="showFinishPop" />

    <div class="intel-fit-1">
      <div v-show="showResult"
           class="result-box-ui">
        <ResultTitle title="运动总结"
                     sub-title="智能健身" />
        <!-- 具体报告 -->
        <div class="flex-box">
          <ResultDataItem title="目标达成率"
                          :data="getScore()" />
          <ResultDataItem title="热量消耗"
                          :data="totalCal + ' cal'" />
          <!-- <ResultDataItem title="总重量"
                          :data="totalTime" /> -->
        </div>
        <div class="flex-box">
          <ResultDataItem title="训练阻力"
                          :data="currentKG + 'kg /' + value * 40 + ' kg'" />
          <ResultDataItem title="训练组数"
                          :data="currentCount + '/' + totalCount" />
          <ResultDataItem title="训练次数"
                          :data="score + '/' + totalTarget" />
        </div>
        <!-- 返回按钮 -->
        <div class="icon-back-ui right-bottom"
             @click="goBack" />
      </div>

      <div v-show="!showResult"
           class="page-content power-step">
        <!-- 左边浮动记录信息 -->
        <div class="step-box">
          <div v-show="!isPlaying"
               class="progress">
            <div class="option-box">
              <div>阻力调节</div>
              <div>
                <span class="plus"
                      @click="changeValue(-0.5)">-</span>
                <span style="margin: 0 10px;"
                      @click="showPop = true">{{ valueShowVal }} kg</span>
                <span class="plus"
                      @click="changeValue(0.5)">+</span>
              </div>
            </div>
            <div class="option-box">
              <div>速度调节</div>
              <div>
                <span class="plus"
                      @click="changeSpeed(-1)">-</span>
                {{ speedShowVal }}
                <span class="plus"
                      @click="changeSpeed(1)">+</span>
              </div>
            </div>
            <!-- <div class="show-score">
              {{ score }}
            </div> -->
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
              <ResultDataItem title="训练阻力"
                              style="margin-top: 0;"
                              :data="currentKGShow" />
              <ResultDataItem title="训练组数"
                              style="margin-top: 0;"
                              :data="currentCount + '/' + totalCount" />
              <ResultDataItem title="训练次数"
                              style="margin-top: 0;"
                              :data="score + '/' + totalTarget" />
            </div>
          </div>
          <!-- 绘制正弦背景 -->
          <canvas id="myCanvas" />
          <!-- <div class="wave-top">
            <div v-for="item in 18"
                 :key="item"
                 class="coin"
                 :style="{'left': computedLeft(item), top: computedTop(item)}" />
          </div> -->
          <!-- <div class="wave-bottom" /> -->

          <div class="ball-box">
            <Transition name="score-fade">
              <div v-if="showScore"
                   class="score-text">
                $ +1
              </div>
            </Transition>

            <!-- <div class="smart-ball pacman"
                 :class="{'up': addForce, 'down': reduceForce }"
                 :style="{top: distance * 2 + '%'}" /> -->
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

import { myEvent } from '@/utils'

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
import PopForce from '@/components/UI/PopForce.vue'
import PopFinish from '@/components/UI/PopFinish.vue'
import { imageProps } from 'ant-design-vue/lib/image'

export default defineComponent({
  name: 'IntelFit',
  components: {
    Page,
    ResultTitle,
    ResultDataItem,
    PopForce,
    PopFinish,
    // PlayCircleOutlined,
    // PauseCircleOutlined,

  },

  setup () {
    // @ts-ignore
    const state = reactive({
      showPop: false,
      showFinishPop: false,
      connectStatus: false,
      value: 8,
      speed: 5, // [0-10]

      distance: 20, // 小球距离， distance
      addForce: false,
      reduceForce: false,
      showScore: false,

      showResult: false,

      isPlaying: false,
      hasStart: false,
      // 显示数据
      totalCount: 4, // 总组数4
      // currentCount: 1,
      totalTarget: 40, // 总组数4
      score: 0,
      currentKG: 0, // 累计训练负重

      // 汇总数据
      totalCal: 0,
      totalWork: '0J',
      totalTime: '00:00:00',
      totalPlayTime: '0 | 0',
      totalAverW: '0w',
      totalFinalCal: '0cal',
      ctx: null as any,
      canvas: null as any,
      img: null as any,
      phase: 0,
      bgOffset: 0,
      offsetSpeed: 1,
      sinMap: [] as any,
      coins: [] as any,
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
      // return state.speed.toFixed(1)
      return state.offsetSpeed.toFixed(1)
    })
    const currentCount = computed(() => { // 看下行否
      return Math.floor(state.score / 10) + 1
    })
    const currentKGShow = computed(() => { // 看下行否
      return state.currentKG + 'kg/' + state.value * 40 + 'kg'
    })

    function getScore () {
      return (state.score / state.totalTarget * 100).toFixed(1) + '%'
    }

    function setPopForce (val: number) {
      state.value = val

      send_fit_build_frame({
        mode: 'STD',
        force: state.value,
        back_force: state.value,
      })
    }

    function changeValue (step: number) { // 设置阻力调节
      state.value = Math.max(0, Math.min(60, state.value + step))

      send_fit_build_frame({
        mode: 'STD',
        force: state.value,
        back_force: state.value,
      })
    }

    // 修改速度
    function changeSpeed (step: number) {
      // state.speed = Math.max(0, Math.min(10, state.speed + step))
      state.offsetSpeed = Math.max(0, Math.min(3, state.offsetSpeed + step))

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
        document.dispatchEvent(myEvent)
      } else if (distance === state.distance) {
        state.addForce = false
        state.reduceForce = false
      } else {
        state.addForce = false
        state.reduceForce = true
        document.dispatchEvent(myEvent)
      }
      state.distance = distance
      // 处理小球位置
    }

    function computedLeft (item: number) {
      switch (item) {
        case 1:
          return '58px' // 差144
        case 2:
          return '138px'
          // return '10%'
        case 3:
          return '215px'
          // return '17%'
        case 4:
          return '19.5%'
        case 5:
          return '23.5%'
        case 6:
          return '27.5%'
        case 7:
          return '35.5%'
        case 8:
          return '39.5%'
        case 9:
          return '43.5%'
        // 第二
        case 10:
          return '51.5%'
        case 11:
          return '55.5%'
        case 12:
          return '59.5%'
        case 13:
          return '67.5%'
        case 14:
          return '71.5%'
        case 15:
          return '75.5%'
        case 16:
          return '83.5%'
        case 17:
          return '87.5%'
        case 18:
          return '91.5%'
      }
      return ''
    }

    function computedTop (item: number) {
      switch (item % 3) {
        case 1: case 5: case 8: case 12:
          return '109px'
          // return '52px'
        case 2: case 6: case 9: case 13:
          return '52px'
        case 0: case 7: case 10: case 14:
          return '-24px'
        // case 4: case 11:
        //   return '52px'
      }
      return '109px'
    }

    const audio = new Audio('/gym/dist/audio/score.mp3')

    function handleScore () { // 得分效果
      console.log(state.distance)
      state.score++
      state.showScore = true
      audio.play()
      setTimeout(() => {
        state.showScore = false
      }, 50)
      // 同时负重更新
      state.currentKG = state.currentKG + state.value
      if (state.score >= 40) {
        cancelAnimationFrame(myReq)
        setTimeout(() => {
          finishGame()
          state.showFinishPop = true
        }, 300)
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

    // let dirc = 1
    // let count = 0
    const lastIndex = -1
    let myReq: any

    function mockAnimation () {
      // draw()
      // 判断小球是否得分
      const stepLen = 314
      if (state.bgOffset === 130 || state.bgOffset === (130 + stepLen) || state.bgOffset === (130 + 2 * stepLen)) {
        console.log('bgOffset 得分', state.distance)
        if (state.distance > 0 && state.distance < 9) {
          state.score++
          handleScore()
        }
      }
      if (state.bgOffset === 205 || state.bgOffset === (205 + stepLen) || state.bgOffset === (205 + 2 * stepLen)) {
        console.log('bgOffset 得分2', state.distance)
        if (state.distance > 19 && state.distance < 28.5) {
          state.score++
          handleScore()
        }
      }
      if (state.bgOffset === 280 || state.bgOffset === (280 + stepLen) || state.bgOffset === (280 + 2 * stepLen)) {
        console.log('bgOffset 得分3', state.distance)
        if (state.distance > 29 && state.distance < 38.5) {
          state.score++
          handleScore()
        }
      }
      // const count_temp = state.bgOffset // 偏移位置
      // const step = 314

      // const index = Math.floor(count_temp % step)
      // if (index === 135) { // 134
      //   // console.log('here', 135)
      //   if (state.distance > 0 && state.distance < 9) {
      //     state.score++
      //     handleScore()
      //   }
      // } else if (index === 220) { // 382
      //   // console.log('here', 220)
      //   if (state.distance > 19 && state.distance < 28.5) {
      //     state.score++
      //     handleScore()
      //   }
      // } else if (index === 295) {
      //   // console.log('here', 295)
      //   if (state.distance > 29 && state.distance < 38.5) {
      //     state.score++
      //     handleScore()
      //   }
      // }
      // if (count_temp % step <= 3) {
      //   const index = Math.floor(count_temp / step)
      //   if (index !== lastIndex) {
      //     lastIndex = index
      //     if (index % 4 === 1) {
      //       if (state.distance > 7 && state.distance < 16.5) {
      //         state.score++
      //         handleScore()
      //       }
      //     } else if (index % 4 === 0 || index % 4 === 2) {
      //       if (state.distance > 19 && state.distance < 28.5) {
      //         state.score++
      //         handleScore()
      //       }
      //     } else if (index % 4 === 3) {
      //       if (state.distance > 29 && state.distance < 38.5) {
      //         state.score++
      //         handleScore()
      //       }
      //     }
      //   }
      // }

      // myReq = requestAnimationFrame(mockAnimation)
    }

    // 绘制canvas 背景
    function drawBg () {
      const canvas = document.getElementById('myCanvas') as any
      if (!canvas) return
      canvas.width = 960
      canvas.height = 300
      state.ctx = canvas.getContext('2d')
      state.canvas = canvas

      const amplitude = 70
      const frequency = 0.02
      state.phase = 0
      state.bgOffset = 0
      const centerY = canvas.height / 2
      const centerYOffset = 70

      for (let x = 0; x < 314; x++) {
        const y = centerY - centerYOffset + amplitude * Math.sin(frequency * x) // max: 150+70=220. min 150-70=80
        state.sinMap.push(y)
      }

      // 创建一个图片对象
      const img = new Image()
      // // img.src = 'data:image/png;base64,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' // 图片的路径
      img.src = '/gym/dist/coin.png' // 图片的路径
      state.img = img
      const w = 314
      state.coins = [
        [70, 200],
        [145, 125],
        [220, 50], // 220, 50
        [70 + w, 200],
        [145 + w, 125],
        [220 + w, 50],
        [70 + 2 * w, 200],
        [145 + 2 * w, 125],
        [220 + 2 * w, 50],
      ]
      addCoins()

      img.onload = function () {
        draw()
        cancelAnimationFrame(myReq)
      }
    }

    function addCoins () {
      const w = 314
      const canvasWidth = 960
      state.coins.push(
        [canvasWidth + 70, 200],
        [canvasWidth + 145, 125],
        [canvasWidth + 220, 50],
        [canvasWidth + 70 + w, 200],
        [canvasWidth + 145 + w, 125],
        [canvasWidth + 220 + w, 50],
        [canvasWidth + 70 + 2 * w, 200],
        [canvasWidth + 145 + 2 * w, 125],
        [canvasWidth + 220 + 2 * w, 50],
      )
    }

    function getSinX (data: number) {
      const x = data
      return state.sinMap[x % 314]
    }

    function draw () {
      const ctx = state.ctx
      const canvas = state.canvas

      const offset = state.bgOffset

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        if ((x - offset) < 0) {
          ctx.lineTo((canvas.width + x - offset), getSinX(canvas.width + x))
        } else {
          if (x - offset === 0) {
            ctx.moveTo(x - offset, getSinX(x))
          } else {
            ctx.lineTo(x - offset, getSinX(x))
          }
        }
      }
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 5
      ctx.stroke()

      // 绘制第二条曲线
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        if ((x - offset) < 0) {
          ctx.lineTo((canvas.width + x - offset), getSinX(canvas.width + x) + 140)
        } else {
          if (x - offset === 0) {
            ctx.moveTo(x - offset, getSinX(x) + 140)
          } else {
            ctx.lineTo(x - offset, getSinX(x) + 140)
          }
        }
      }
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 5
      ctx.stroke()

      // 绘制金币
      // ctx.drawImage(state.img, 100, 70, 30, 30)
      for (let i = state.coins.length; i--;) {
        ctx.drawImage(state.img, state.coins[i][0], state.coins[i][1], 30, 30)
        state.coins[i][0] = state.coins[i][0] - state.offsetSpeed // 跟随speed
        if (state.coins[i][0] < -30) {
          state.coins.splice(0, 1)
        }
      }

      state.bgOffset = state.bgOffset + state.offsetSpeed
      if (state.bgOffset > (canvas.width)) {
        state.bgOffset = 0
        addCoins() // 增加金币
      }

      // 绘制小球
      const centerX = 270
      const centerY = 50 + state.distance * 3.5
      const radius = 20
      // 判断小球和金币对撞
      for (let i = state.coins.length; i--;) {
        const offsetY = state.coins[i][1] - centerY
        const offsetX = state.coins[i][0] - centerX
        if (offsetX < radius && offsetX > (-1 * radius) && offsetY < radius && offsetY > (-1 * radius)) {
          handleScore()
          state.coins.splice(i, 1)
          break
        }
      }

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = '#0d92f5'
      ctx.fill()

      // requestAnimationFrame(draw)
      myReq = requestAnimationFrame(draw)
    }

    function startGame () {
      // mockAnimation()
      // drawBg()
      draw()
      state.hasStart = true
      state.isPlaying = true
      changeValue(0)
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
      // drawBg()
    }

    onMounted(() => {
      drawBg()
      const throttledHandleForceChange = throttle(handleForceChange, 100);

      (window as any).webBleNotify = (obj: { info0: any, info1: any }) => {
        // console.log('webBleNotify', obj.info0)

        const distance = Math.min(50, Math.abs(obj.info0.distance))

        const totalW = Math.abs(Math.round((obj.info0.iq_return * 0.05 * obj.info0.speed)))
        // 卡路里, 这里取两个电机总和，sum( P * 0.1 ) * 4.18
        const cal1 = Number((totalW * 0.418).toFixed(2)) - 0
        // todo: 如果误差太大，再用小数点
        state.totalCal = Math.round(Number(cal1 + (state.totalCal || 0)))

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
      currentCount,
      currentKGShow,
      computedLeft,
      computedTop,
      startGame,
      stopGame,
      finishGame,
      goBack,
      setPopForce,
      getScore,
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
    // .result-data-item {
    //   margin-top: 0 !important;
    // }
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
    left: 250px;
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
    left: 250px;
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

#myCanvas {
  position: absolute;
  left: 0;
  top: 200px;
  // border: 1px solid #fff;
  width: 100%;
  height: 270px;
}

.wave-top {
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: -35px;
  width: 200%;
  height: 200px; /* 调整高度 */
  // background-image: url(/gym/dist/img/gameBg.png);
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
