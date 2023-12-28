
<template>
  <Page>
    <div class="pro-fit">
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
           class="page-content">
        <!-- 左边slider -->
        <div class="half half-left">
          <div class="mode-box">
            <!-- <a-radio-group v-model:value="selectMode"
                           option-type="button"
                           :options="plainOptions" /> -->
            <a-radio-group v-model:value="selectMode"
                           size="large"

                           @change="resetParams">
              <a-radio-button value="STD">
                标准
              </a-radio-button>
              <a-radio-button disabled
                              :value="5">
                离心
              </a-radio-button>
              <a-radio-button value="FLU">
                等速
              </a-radio-button>
              <a-radio-button value="SPR">
                弹力
              </a-radio-button>
            </a-radio-group>
          </div>
          <div class="slider-box">
            <div class="fit-slider">
              <!-- 力度调节 -->
              <a-slider
                v-model:value="value1"
                :min="0"
                :max="60"
                :step="0.5"
                class="slider"
                vertical />
              <div class="slider-data">
                <div>{{ value1ShowVal }}kg</div>
                <span class="plus"
                      @click="changeValue1(0.5)">+</span>
                <span class="reduce"
                      @click="changeValue1(-0.5)">-</span>
              </div>
            </div>
            <div v-show="selectMode === 'SPR'"
                 class="fit-slider">
              <!-- 弹力模式 -->
              <a-slider
                v-model:value="spring_rate"
                :min="0"
                :max="100"
                class="slider"
                vertical />
              <div class="slider-data">
                <div>弹力 {{ spring_rateShowVal }}</div>
                <span class="plus"
                      @click="changeSpring_rate(1)">+</span>
                <span class="reduce"
                      @click="changeSpring_rate(-1)">-</span>
              </div>
            </div>
            <div v-show="selectMode === 'FLU'"
                 class="fit-slider">
              <!-- 流阻模式 -->
              <a-slider
                v-model:value="fluid_resis_param"
                :min="0"
                :max="100"
                class="slider"
                vertical />
              <div class="slider-data">
                <div>流阻 {{ fluid_resis_paramShowVal }}</div>
                <span class="plus"
                      @click="changeFluid_resis_param(1)">+</span>
                <span class="reduce"
                      @click="changeFluid_resis_param(-1)">-</span>
              </div>
              <!-- xx调节 -->
            </div>
          </div>
        </div>
        <!-- 右侧form表单 -->
        <div class="half half-right">
          <!-- echart 背景图 -->

          <div>
            <div class="data-item">
              <div class="title-item">
                <HistoryOutlined />
                运动时长
              </div>
              <div class="number-item">
                {{ formatPlayTime }}
              </div>
            </div>
            <div class="data-item">
              <div class="title-item">
                <FireOutlined />
                热量消耗
              </div>
              <div class="number-item">
                {{ totalCal }} cal
              </div>
            </div>
            <div class="data-item">
              <div class="title-item">
                <SyncOutlined />
                运动次数
              </div>
              <div class="number-item">
                {{ playCount }}
              </div>
            </div>
            <div class="data-item">
              <div class="title-item">
                <BulbOutlined />
                总功率
              </div>
              <div class="number-item">
                {{ totalW }} w
              </div>
            </div>
          </div>
          <div id="echart"
               class="echart-box" />

          <div class="start-btn">
            <PlayCircleOutlined v-show="!isPlaying"
                                @click="readyStart" />
            <PauseCircleOutlined v-show="isPlaying"
                                 @click="pause" />
            <div class="rect-icon">
              <span />
            </div>
          </div>
        </div>
        <!-- End 右侧form表单 -->
      </div>
      <!-- 加载动画特效 -->
      <div
        v-show="showOverlay"
        class="over-layer">
        <Transition name="scale">
          <div v-show="readyStartTime===3"
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
import { bleSetSingleLight } from '@/api/joyo-ble/index'
import { formatTime } from '@/utils'

import {
  HistoryOutlined, FireOutlined, SyncOutlined, BulbOutlined,
  PlayCircleOutlined, PauseCircleOutlined,
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
  watch,
  onMounted,
  onUnmounted,
} from 'vue'
import { connectJoyo, bleState, send_fit_build_frame, continutePlay, pausePlay } from '@/api/joyo-ble/web-ble-server'

import HeaderNav from '@/components/HeaderNav.vue'
import ResultTitle from '@/components/ResultTitle.vue'
import ResultDataItem from '@/components/ResultDataItem.vue'
import Page from '@/components/Page.vue'

import { useRoute, useRouter } from 'vue-router'

import { useStore } from 'vuex'

import '@/style/blockly-category.scss'

export default defineComponent({
  name: 'ProFit',
  components: {
    Page,
    HistoryOutlined,
    FireOutlined,
    SyncOutlined,
    BulbOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    ResultTitle,
    ResultDataItem,
  },

  setup () {
    const store = useStore()
    // @ts-ignore
    const state = reactive({
      // connectStatus: false,
      value1: 1,
      value2: 2,
      fluid_resis_param: 0,
      spring_rate: 0,
      selectMode: 'STD',
      showResult: false,
      hasFirstInit: false, // 是否已经获取初始值力度
      isPlaying: false,
      playTime: 0,
      totalCal: 0, // 卡路里
      playCount: 0, // 运动次数
      totalW: 0, // 总功率
      readyStartTime: -1,
      showOverlay: false,
    })
    // const plainOptions =
    // [
    //   { label: '标准', value: 0 },
    //   { label: '离心', value: 1 },
    //   { label: '等速', value: 2 },
    //   { label: '弹力', value: 3 },
    // ]

    const value1ShowVal = computed(() => { // 看下行否
      return state.value1.toFixed(1)
    })
    const value2ShowVal = computed(() => { // 看下行否
      return state.value2.toFixed(1)
    })
    const spring_rateShowVal = computed(() => { // 看下行否
      return state.spring_rate.toFixed(1)
    })
    const fluid_resis_paramShowVal = computed(() => { // 看下行否
      return state.fluid_resis_param.toFixed(1)
    })
    const formatPlayTime = computed(() => { // 看下行否
      return formatTime(state.playTime)
    })

    const goPage = (name: string) => {
      router.push({ name })
    }

    function setPower () { // 设置力量

    }

    function enterShowResult () {
      store.dispatch('showBackIcon', false)
    }

    const connect = () => {
      heartBeat()
      connectJoyo()
    }

    let timer = null as any

    function heartBeat () {
      clearInterval(timer)
      timer = setInterval(() => { // 定时防止休眠
        console.log('beat')
        bleSetSingleLight(11, 0x000000)
      }, 20000)
    }

    function changeValue1 (step: number) {
      state.value1 = state.value1 + step
    }

    function changeValue2 (step: number) {
      state.value2 = state.value2 + step
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
              }, 1000)
            }, 1000)
          }, 1000)
        }, 1000)
      }, 200)
    }

    function initAllData () {
      state.playTime = 0
      state.playCount = 0
      state.totalW = 0
      // state.isPlaying = true
    }

    function resetParams () { // 切换mode时候，重置基础参数
      state.fluid_resis_param = 0
      state.spring_rate = 0
      state.value1 = 0
    }

    function startPlay () { // 发送设置力量指令
      // 先恢复正常
      continutePlay()

      // 发送对应指令
      console.log('发送指令')
      console.log('fluid_resis_param', state.fluid_resis_param)
      console.log('spring_rate', state.spring_rate)
      console.log('force', state.value1)
      console.log('mode', state.selectMode)
      setTimeout(() => {
        send_fit_build_frame({
          fluid_resis_param: state.fluid_resis_param,
          spring_rate: state.spring_rate,
          force: state.value1,
          mode: state.selectMode,
        })
        state.isPlaying = true
      }, 500)
      // state.playTime = 0
      // state.playCount = 0
      // state.totalW = 0
      // state.isPlaying = true
    }

    function pause () {
      pausePlay()
      state.isPlaying = false
    }

    function handleUpdateData (info: any) { // 更新运动的实时状态
      state.playTime++
      state.playCount = info.pull_num
      state.totalW = Number((info.iq_return / 2 * info.speed / 1000).toFixed(2))
    }

    let chart: any

    function initChartLine () {
      const echarts = (window as any).echarts
      chart = echarts.init(document.getElementById('echart'))
      // canvas.setChart(chart)
      // chartLine = chart

      var option = {
        title: {
          text: '',
          left: 'center',
        },
        legend: {
          data: ['t', 'v', 'p', 't1', 'v1', 'p1'],
          // orient: 'vertical',
          // top: 20,
          // // left:10,
          // // top: 'center',
          // left: 'center',
          // backgroundColor: '#eee',
          // z: 400,
        },
        grid: {
          // containLabel: true,
        },
        tooltip: {
          show: true,
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          show: false,
        },
        yAxis: {
          type: 'value',
          // splitLine: {
          //   lineStyle: {
          //     type: 'dashed',
          //   },
          // },
        },
        series: [],
      }

      chart.setOption(option)
    }

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

    onMounted(() => {
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
        console.log('webBleNotify', obj.info0, obj.info1)
        updateLine(obj.info0, obj.info1)
        if (!state.hasFirstInit) {
          state.value1 = obj.info0.iq_return / 2
          state.value2 = obj.info1.iq_return / 2
          state.hasFirstInit = true
        }
        if (state.isPlaying) { //
          handleUpdateData(obj.info0)
        }
      }
      setTimeout(() => {
        initChartLine()
      }, 1000)
    })

    onUnmounted(() => {
      (window as any).webBleNotify = null
    })

    return {
      ...toRefs(state),
      resetParams,
      connect,
      goPage,
      changeValue1,
      changeValue2,
      changeSpring_rate,
      changeFluid_resis_param,
      value1ShowVal,
      value2ShowVal,
      spring_rateShowVal,
      fluid_resis_paramShowVal,
      // plainOptions,
      startPlay,
      readyStart,
      pause,
      formatPlayTime,
    }
  },
})
</script>

<style lang="scss" scoped>
.pro-fit {
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

  .slider-box {
    height: 100%;
    display: flex;
    padding-top: 20px;
    box-sizing: border-box;
  }

  .fit-slider {
    height: 65%;
    display: flex;
    .slider {

    }
    .slider-data {
      width: 150px;
      position: relative;
      text-align: center;
      margin-right: 40px;
    }
    .plus, .reduce {
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
  .half {
    display: flex;
    flex-wrap: wrap;
    &.half-left {
      display: block;
      width: 50%;
      padding: 10px 20px;
      box-sizing: border-box;
    }
    &.half-right {
       width: 50%;
       padding: 0;
       .echart-box {
        // position: absolute;
        // z-index: -1;
        width: 100%;
        height: 180px;
       }
    }
    .mode-box::v-deep {
      width: 100%;
      user-select: none;
      // height: 40px;
      .ant-radio-group-large .ant-radio-button-wrapper {
        font-size: 32px;
      }
      .ant-radio-button-wrapper {
        background: transparent;
        color: rgba(255, 255, 255, .8);
        &.ant-radio-button-wrapper-checked {
          color: #1890ff;
          // & span:nth-child(2) {
          //   font-size: 34px;
          // }
        }
      }
    }

  }
  .data-item {
    width: 50%;
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 28px;
    .title-item {
      width: 100%;
    }
    .number-item {
       width: 100%;
       // text-align: center;
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
.scale-enter-active{
  transition: all 0.9s ease;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(2);
  transform-origin: center center;
}
</style>
