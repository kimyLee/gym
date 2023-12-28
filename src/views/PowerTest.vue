
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
          <div>58.6 kg</div>
          <div>28.3 kg</div>
          <div>0 kg</div>
        </div>
        <div class="step-box">
          <div class="progress">
            <span class="step-icon">
              1
            </span>
            <SwapRightOutlined />

            <span class="step-icon">
              2
            </span>
            <SwapRightOutlined />
            <span class="step-icon">
              3
            </span>
          </div>

          <!-- 阶梯 -->
          <div class="power-bar-box">
            <div v-for="item in 10"
                 :key="item"
                 class="power-bar"
                 :style="{
                   width: (item * 40 + 150) + 'px',
                   'border-bottom': (item * 6 + 10) + 'px solid #fff',
                 }" />
          </div>

          <!-- 开始停止按钮 -->
          <div class="start-btn">
            <PlayCircleOutlined />
            <PauseCircleOutlined />
            <div class="rect-icon">
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
} from 'vue'
import { connectJoyo, bleState } from '@/api/joyo-ble/web-ble-server'

import HeaderNav from '@/components/HeaderNav.vue'
import ResultTitle from '@/components/ResultTitle.vue'
import ResultDataItem from '@/components/ResultDataItem.vue'
import Page from '@/components/Page.vue'

import { useRoute, useRouter } from 'vue-router'
import '@/style/blockly-category.scss'

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
    }
  },
})
</script>

<style lang="scss" scoped>
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
      }
    }

  }

}
</style>
