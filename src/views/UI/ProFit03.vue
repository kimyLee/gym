<template>
  <Page show-slot>
    <PopForce v-model:showPop="showPop"
              :val="force"
              @change-force="setPopForce" />
    <div class="pro-fit-03">
      <div v-show="showResult"
           class="result-box-ui">
        <ResultTitle title="运动总结"
                     sub-title="快速健身" />
        <!-- 具体报告 -->
        <div class="flex-box">
          <ResultDataItem title="总做功"
                          :data="totalWork" />
          <ResultDataItem title="运动总时长"
                          :data="totalTime" />
        </div>
        <div class="flex-box">
          <ResultDataItem title="运动次数"
                          :data="totalPlayTime" />
          <ResultDataItem title="平均功率"
                          :data="totalAverW" />
          <ResultDataItem title="热量消耗"
                          :data="totalFinalCal" />
        </div>
        <!-- 返回按钮 -->
        <div class="icon-back-ui right-bottom"
             @click="goBack" />
      </div>
      <div v-show="!showResult"
           class="page-content">
        <div class="half-box">
          <div class="half half-left">
            <div class="tag-text">
              快速健身-弹力模式
            </div>
            <div class="slider-box"
                 :class="{ 'disable': isPlaying }">
              <div id="content" />

              <div class="show-text">
                阻力调节
              </div>
              <div class="show-num"
                   @click="showPop = true">
                {{ forceShowVal }}<span class="small">kg</span>
              </div>
              <div class="slider-btn">
                <span class="reduce"
                      @click="changeForce(-0.5)">-</span>
                <span class="plus"
                      @click="changeForce(0.5)">+</span>
              </div>
            </div>
          </div>
          <!-- 右侧form表单 -->
          <div class="half half-right">
            <!-- echart 背景图 -->
            <div>
              <div class="data-item">
                <div class="title-item">
                  运动次数
                </div>
                <div class="number-item">
                  <span class="big-text">{{ playCount }} | {{ playCount2 }}</span>
                </div>
              </div>
              <div class="data-item">
                <div class="title-item">
                  总做功
                </div>
                <div class="number-item">
                  <!-- {{ totalW }} w ｜ {{ totalW2 }} w -->
                  <span class="big-text">{{ totalW }}</span>J
                </div>
              </div>
              <div class="data-item">
                <div class="title-item">
                  运动时长
                </div>
                <div class="number-item">
                  <span class="big-text">{{ formatPlayTime }}</span>
                </div>
              </div>
              <div class="data-item">
                <div class="title-item">
                  能量消耗
                </div>
                <div class="number-item">
                  <span class="big-text">{{ totalCal }}</span> Kcal
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 开始按钮 -->
        <div class="start-btn-box">
          <div v-show="!isPlaying"
               class="start my-btn"
               :class="{ 'disable': !connectStatus }"
               @click="readyStart">
            开始
          </div>
          <div v-show="isPlaying"
               class="pause my-btn"
               @click="pause">
            暂停
          </div>
          <!-- <div v-show="!isPlaying"
               class="pause my-btn"
               @click="startPlay">
            继续
          </div> -->
          <div v-show="isPlaying"
               class="finish  my-btn"
               @click="finishGame">
            结束
          </div>
        </div>

        <!-- End 右侧form表单 -->
      </div>
      <!-- 加载动画特效 -->
      <div v-show="showOverlay"
           class="over-layer">
        <Transition name="scale">
          <div v-show="readyStartTime === 3"
               class="over-num">
            <div>3</div>
          </div>
        </Transition>
        <Transition name="scale">
          <div v-show="readyStartTime === 2"
               class="over-num">
            <div>2</div>
          </div>
        </Transition>
        <Transition name="scale">
          <div v-show="readyStartTime === 1"
               class="over-num">
            <div>1</div>
          </div>
        </Transition>
        <div v-show="readyStartTime === 0"
             class="progress-bar">
          开始训练
        </div>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { formatTime2 } from '@/utils'

import router from '@/router'
import {
  toRefs,
  reactive,
  defineComponent,
  computed,
  watch,
  onMounted,
  onUnmounted,
} from 'vue'
import { connectJoyo, bleState, send_fit_build_frame, continutePlay, pausePlay } from '@/api/joyo-ble/web-ble-server'

import HeaderNav from '@/components/HeaderNav.vue'
import ResultTitle from '@/components/ResultTitle.vue'
import ResultDataItem from '@/components/ResultDataItem.vue'
import Page from '@/components/UI/Page.vue'
import PopForce from '@/components/UI/PopForce.vue'

import { useRoute, useRouter } from 'vue-router'

import { useStore } from 'vuex'

import { DragAcr } from '@/lib/circle'
// import startClickTimer from '@/lib/sleep'

export default defineComponent({
  name: 'ProFit',
  components: {
    Page,
    // RollbackOutlined,
    ResultTitle,
    ResultDataItem,
    PopForce,
  },

  setup () {
    const store = useStore()

    const connectStatus = computed(() => { // 看下行否
      return store.getters['ble/connectStatus']
    })
    // @ts-ignore
    const state = reactive({
      // value1: 1,
      force: 0,
      showPop: false,

      fluid_resis_param: 50,
      spring_rate: 50,
      back_force: 0,

      selectMode: 'STD',
      showResult: false,
      hasFirstInit: false, // 是否已经获取初始值力度
      isPlaying: false,
      isPause: false,
      playTime: 0,
      totalCal: 922, // 卡路里
      totalCalJiaoEr: 0, // 卡路里
      playCount: 0, // 运动次数
      playCount2: 0, // 运动次数
      totalW: 0, // 总功率
      totalW2: 0, // 总功率
      readyStartTime: -1,
      showOverlay: false,

      // 汇总数据
      totalWork: '0J',
      totalTime: '00:00:00',
      totalPlayTime: '0 | 0',
      totalAverW: '0w',
      totalFinalCal: '0cal',

      currentTime: '',
      currentPM: '',

      target: null as any,
    })

    function getFormatTime () {
      const now = new Date()
      let hours: string | number = now.getHours()
      let minutes: string | number = now.getMinutes()

      const APM = (hours >= 12 ? ' PM' : ' AM')
      // 如果小时或分钟小于10，则在前面补0
      hours = hours < 10 ? `0${hours}` : hours
      minutes = minutes < 10 ? `0${minutes}` : minutes

      // 拼接成“hh:mm”格式的时间
      state.currentTime = `${hours}:${minutes}  `
      state.currentPM = APM
    }

    // 循环获取时间
    window.getTimer = null
    getFormatTime()
    window.getTimer = setInterval(() => {
      console.log('getTimer')
      getFormatTime()
    }, 60000)

    const goHome = () => {
      router.push({ name: 'Menu1' })
    }

    const forceShowVal = computed(() => { // 看下行否
      return state.force.toFixed(1)
    })
    // const showResult = computed(() => { // 看下行否
    //   return store.state.showResult
    // })

    watch(() => state.showResult, (val, old) => {
      if (old && !val) {
        console.log('重置数据')
        initAllData()
      }
    })
    const back_forceShowVal = computed(() => { // 看下行否
      return state.back_force.toFixed(1)
    })
    const spring_rateShowVal = computed(() => { // 看下行否
      return state.spring_rate.toFixed(1)
    })
    const fluid_resis_paramShowVal = computed(() => { // 看下行否
      return state.fluid_resis_param.toFixed(1)
    })
    const formatPlayTime = computed(() => { // 看下行否
      return formatTime2(Math.floor(state.playTime))
    })

    const goPage = (name: string) => {
      router.push({ name })
    }

    const connect = () => {
      connectJoyo()
    }

    function setPopForce (val: number) {
      state.force = val

      if (state.target) {
        state.target.value = Math.floor(state.force / 6 * 5 * 2) //
        state.target.draw(state.target.value)
      }
      setForce()
    }

    function changeForce (step: number) {
      state.force = Math.min(60, Math.max(0, state.force + step))

      if (state.target) {
        state.target.value = Math.floor(state.force / 6 * 5 * 2) //
        state.target.draw(state.target.value)
      }
      setForce()
    }
    // 修改回力
    function changeBackForce (step: number) {
      state.back_force = state.back_force + step
    }

    // 修改弹力流阻
    function changeSpring_rate (step: number) {
      state.spring_rate = state.spring_rate + step
    }
    function changeFluid_resis_param (step: number) {
      state.fluid_resis_param = state.fluid_resis_param + step
    }

    function readyStart () {
      state.showOverlay = true
      setTimeout(() => {
        state.readyStartTime = 3
        setTimeout(() => {
          state.readyStartTime = 2
          setTimeout(() => {
            state.readyStartTime = 1
            setTimeout(() => {
              state.readyStartTime = 0
              setTimeout(() => {
                state.readyStartTime = -1
                state.showOverlay = false

                startPlay()
              }, 500)
            }, 500)
          }, 500)
        }, 500)
      }, 200)
    }

    function initAllData () {
      state.playTime = 0
      state.playCount = 0
      state.playCount2 = 0
      state.totalW = 0
      state.totalW2 = 0

      state.totalCal = 0
      state.totalCalJiaoEr = 0
      // resetParams()
      // state.isPlaying = true
    }

    function handleSelectMode (mode: string) {
      state.selectMode = mode
      setForce()
      // resetParams()
    }

    function resetParams () { // 切换mode时候，重置基础参数
      state.fluid_resis_param = 0
      state.spring_rate = 0
      state.force = 0
      state.back_force = 0
    }

    function setForce () { // 设置力度
      console.log('触发设置')

      clearTimeout(setTimer2) // 防抖

      setTimer2 = setTimeout(() => {
        continutePlay()
        state.back_force = state.force

        console.log('正常设置', state.selectMode, ' ', state.force)
        setTimeout(() => {
          send_fit_build_frame({
            fluid_resis_param: state.fluid_resis_param,
            spring_rate: state.spring_rate,
            force: state.force,
            back_force: state.back_force,
            mode: state.selectMode,
          })
        }, 500)
      }, 1000)
    }

    function startPlay () { // 发送设置力量指令
      // 先恢复正常
      continutePlay()

      // 发送对应指令
      console.log('发送指令')
      console.log('fluid_resis_param', state.fluid_resis_param)
      console.log('spring_rate', state.spring_rate)
      console.log('force', state.force)
      console.log('mode', state.selectMode)

      state.back_force = state.force
      setTimeout(() => {
        send_fit_build_frame({
          fluid_resis_param: state.fluid_resis_param,
          spring_rate: state.spring_rate,
          force: state.force,
          back_force: state.back_force,
          mode: state.selectMode,
        })
        state.isPlaying = true
      }, 500)
    }

    function pause () {
      pausePlay()
      state.isPlaying = false
    }
    function finishGame () {
      pausePlay()
      state.isPlaying = false

      state.totalWork = Math.round(state.totalCal * 4.18) + 'J'
      state.totalTime = formatTime2(Math.floor(state.playTime))
      state.totalPlayTime = state.playCount + ' | ' + state.playCount2
      state.totalAverW = Math.round(state.totalCal * 4.18 / state.playTime) + 'w'
      state.totalFinalCal = state.totalCal + 'cal'

      // store.commit('setShowResult', true)
      state.showResult = true
    }

    function handleUpdateData (info: any, info1: any) { // 更新运动的实时状态
      state.playTime = state.playTime + 0.1

      // 运动次数
      state.playCount = info.pull_num
      state.playCount2 = info1.pull_num

      // 瞬时功率
      const totalW = Math.abs(Math.round((info.iq_return / 2 * 0.1 * info.speed)))
      const totalW2 = Math.abs(Math.round((info1.iq_return / 2 * 0.1 * info1.speed)))

      // 卡路里, 这里取两个电机总和，sum( P * 0.1 ) * 4.18

      const cal1 = Number((totalW * 0.1 * 4.18).toFixed(2)) - 0
      const cal2 = Number((totalW2 * 0.1 * 4.18).toFixed(2)) - 0

      // todo: 如果误差太大，再用小数点
      state.totalCal = Math.round(Number(cal1 + cal2 + (state.totalCal || 0)))
      console.log(cal1, cal2, state.totalCal, '||||', info.iq_return, info.speed)
      state.totalW = Math.round(state.totalCal * 4.18)

      // state.totalCalJiaoEr = state.totalCal * 4.18
    }

    let chart: any

    const windowCnt = 40 // 一个波形绘图窗口数据点数
    const charData = {
      torque: new Array(windowCnt),
      torque1: new Array(windowCnt), // 电机2
      speed: new Array(windowCnt),
      speed1: new Array(windowCnt),
      rope_distance: new Array(windowCnt),
      rope_distance1: new Array(windowCnt),
    }

    function updateLine (info0: any, info1: any) {
      if (isNaN(info0.iq_return) || isNaN(info1.iq_return)) return
      charData.torque.shift()
      charData.torque1.shift()
      charData.torque[windowCnt - 1] = info0.iq_return / 2
      charData.torque1[windowCnt - 1] = info1.iq_return / 2

      charData.speed.shift()
      charData.speed1.shift()
      charData.speed[windowCnt - 1] = info0.speed
      charData.speed1[windowCnt - 1] = info1.speed

      charData.rope_distance.shift()
      charData.rope_distance1.shift()
      charData.rope_distance[windowCnt - 1] = info0.distance
      charData.rope_distance1[windowCnt - 1] = info1.distance

      var option = {
        animation: false,
        series: [{
          // name: 't',
          name: 't',
          type: 'line',
          data: charData.torque,
        }, {
          name: 'v',
          type: 'line',
          data: charData.speed,
        }, {
          name: 'p',
          type: 'line',
          data: charData.rope_distance,
        }, {
          name: 't1',
          type: 'line',
          data: charData.torque1,
        }, {
          name: 'v1',
          type: 'line',
          data: charData.speed1,
        }, {
          name: 'p1',
          type: 'line',
          data: charData.rope_distance1,
        }],
      }

      // var optionGauge = {
      //   backgroundColor: "#ffffff",
      //   series: [{
      //     animation: false,
      //     data: [{
      //       // value: parseInt( (1+Math.sin(time)) * 50 ),
      //       value: info0.iq_return,
      //       name: '力量',
      //     }]
      //   }]
      // };
      if (chart) {
        chart.setOption(option)
      }

      // chartGauge.setOption(optionGauge)
    }

    function goBack () {
      state.showResult = false
      // store.commit('setShowResult', false)
    }

    let setTimer2 = null as any

    onMounted(() => {
      // 监听60s点击屏幕

      const dom = document.getElementById('content')
      // const DragAcrInstance = (window as any).DragAcr
      const a = new DragAcr({
        el: dom,
        startDeg: 0.75,
        endDeg: 2.25,
        outColor: '#eee',
        counterclockwise: false,
        change: (v: any) => {
          state.force = v / 5 * 3 // 0-60kg
          setForce()
          console.log(`value:${v}`)
        },
      })
      state.target = a;
      // const info0 = {
      //   temp_mos,
      //   err,
      //   mode,
      //   iq_return,
      //   temp,
      //   speed,
      //   distance,
      //   pull_num,
      // }
      // const info1 = {
      //   iq_return,
      //   temp,
      //   speed,
      //   distance,
      //   pull_num,
      // }
      (window as any).webBleNotify = (obj: { info0: any, info1: any }) => {
        // console.log('webBleNotify', obj.info0, obj.info1)

        //  P = iq_return / 2 * 0.1 * speed (N m/s)
        if (!obj?.info0) {
          return
        }
        if (obj?.info0?.iq_return === undefined) {
          return
        }

        // updateLine(obj.info0, obj.info1)
        if (!state.hasFirstInit) {
          state.force = obj.info0.iq_return / 2 // 拉力
          state.back_force = obj.info1.iq_return / 2 // 回力

          state.hasFirstInit = true
        }
        if (state.isPlaying) { //
          handleUpdateData(obj.info0, obj.info1)
        }
      }
      // setTimeout(() => {
      //   initChartLine()
      // }, 1000)
    })

    onUnmounted(() => {
      // cancelFunction && cancelFunction() // 执行注销函数
      state.target = null;
      (window as any).webBleNotify = null
    })

    return {
      ...toRefs(state),
      goHome,
      // resetParams,
      connect,
      goPage,
      changeForce,
      setPopForce,
      changeBackForce,
      changeSpring_rate,
      changeFluid_resis_param,
      forceShowVal,
      back_forceShowVal,
      spring_rateShowVal,
      fluid_resis_paramShowVal,
      // plainOptions,
      startPlay,
      readyStart,
      pause,
      finishGame,
      formatPlayTime,
      // showResult,
      handleSelectMode,
      goBack,
      connectStatus,
    }
  },
})
</script>

<style lang="scss" scoped>
@import "~@/style/var.scss";

$bottomHeight: 120px;

.pro-fit-03 {
  background-color: #3d3d3d;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-weight: 300;

  .header-nav::v-deep {
    width: 100%;
    padding-left: 20px;
    position: relative;
    height: $headerHeight;
    line-height: $headerHeight;
    font-size: 36px;

    .home-box {
      height: 100%;
      line-height: 80px;
      display: flex;
      align-items: center;
    }

    .current-time {
      margin-left: 20px;
      margin-top: 2px;
      font-size: 20px;
      font-weight: 300;

      .current-pm {
        font-size: 18px;
      }
    }

    .right {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
    }

    .right-ble {
      position: absolute;
      right: 80px;
      top: 50%;
      transform: translateY(-50%);
    }

    .icon {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-size: 100% 100%;
    }

    .icon-home {
      background-image: url(/gym/dist/img/home.png);
    }
  }

  .right-bottom {
    position: absolute;
    bottom: 20px;
    right: 20px;
  }

  .slider-box {
    flex: 1;
    height: 100%;
    display: flex;
    margin-left: 55px;
    margin-top: 10px;
    box-sizing: border-box;
    justify-content: center;
    text-align: center;
    position: relative;

    &.disable {
      opacity: .6;
      pointer-events: none;
    }

    #content {
      width: 100%;
      height: 100%;
      width: 280px;
    }

    .show-text {
      position: absolute;
      left: 50%;
      transform: translate(-50%);
      top: 70px;
      font-size: 20px;
    }

    .show-num {
      position: absolute;
      left: 50%;
      transform: translate(-50%);
      top: 100px;
      font-size: 48px;

      .small {
        font-size: 20px;
      }
    }

    .slider-btn {
      position: absolute;
      left: 50%;
      transform: translate(-50%);
      bottom: 50px;

      .plus,
      .reduce {
        font-size: 56px;
        font-weight: bold;
        cursor: pointer;
        width: 80px;
        height: 80px;
        padding: 0 10px;
        line-height: 80px;

        border-radius: 2px;
        text-align: center;

        user-select: none;

        &:active {
          opacity: .8;
        }
      }

      .plus {
        margin-left: 35px;
      }
    }
  }

  .fit-slider {
    height: 65%;
    display: flex;

    .slider {}

    .slider-data {
      width: 150px;
      position: relative;
      text-align: center;
      margin-right: 40px;
    }

    .plus,
    .reduce {
      cursor: pointer;
      position: absolute;
      width: 50px;
      height: 50px;
      line-height: 50px;
      border: 2px solid #91d5ff;
      // border: 2px solid #fff;
      // color: #91d5ff;
      border-radius: 2px;
      text-align: center;
      left: 50%;
      transform: translateX(-50%);
      top: 30%;
      user-select: none;

      &:active {
        opacity: .8;
      }
    }

    .reduce {
      top: 60%;
    }

  }

  .page-content {
    display: block;
    width: 100%;
    height: 100%;
  }

  .half-box {
    width: 100%;
    height: calc(100% - $bottomHeight);

    display: flex;
  }

  .half {
    display: flex;
    flex-wrap: wrap;
    position: relative;

    &.half-left {
      padding: 30px;
      box-sizing: border-box;
      display: flex;
      width: 50%;
      flex-wrap: nowrap;

    }

    .tag-text {
      width: 50px;
      border: 1px solid #fff;
      border-radius: 35px;
      writing-mode: vertical-lr;
      text-align: center;
      height: 320px;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      left: 60px;
      top: 50%;
      transform: translateY(-50%);
    }

    &.half-right {
      width: 50%;
      padding: 8px 36px;
      box-sizing: border-box;

      .echart-box {
        // position: absolute;
        // z-index: -1;
        width: 100%;
        height: 180px;
      }
    }

    .mode-box::v-deep {
      width: 100px;
      user-select: none;

      .quick-btn {
        // width: 100%;
        padding: 0 12px;
        text-align: center;
        height: 50px;
        line-height: 50px;
        border-radius: 50px;
        border: 1px solid #fff;
        font-size: 32px;
        margin-bottom: 36px;
        user-select: none;
        cursor: pointer;

        &.active {
          border: 1px solid $blue;
          background-color: $blue;
          color: #fff;
        }

      }

    }

  }

  .data-item {
    // width: 50%;
    width: 160px;
    height: 160px;
    display: inline-flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 28px;
    margin: 4px;

    background-color: rgba(0, 0, 0, .6);

    .title-item {
      width: 100%;
      font-size: 24px;
    }

    .big-text {
      // display: inline-block;
      // height: 44px;
      // position: absolute;
      font-size: 48px;
      font-weight: 300;
    }

    .number-item {
      // font-family: myFont-en;
      font-weight: 400;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
    }
  }

  .start-btn-box {
    // position: absolute;
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
      // padding: 20px;
      background-color: $btnBlue;

      &.disable {
        opacity: .4;
        pointer-events: none;
      }

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

  // 开始训练
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

  .over-num {
    font-size: 80px;
    position: absolute;
    width: 100px;
    height: 100px;
    top: 50%;
    left: 50%;
    margin-left: -50px;
    margin-top: -50px;
    text-align: center;
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
<style lang="scss">
.scale-enter-active {
  transition: all 0.9s ease;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(2);
  transform-origin: center center;
}
</style>
