
<template>
  <Page>
    <div class="menu-box">
      <Transition name="fade1">
        <div v-show="showMenu1"
             class="menu-item"
             @click="goPage('QuickFit1')">
          <div class="menu-img" />
          <div class="menu-text">
            <div class="line-1">
              快速健身
            </div>
            <div class="line" />
            <div class="line-2">
              QUICK START
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="fade2">
        <div v-show="showMenu1"
             class="menu-item"
             @click="goPage('ProFitMenu')">
          <div class="menu-img" />
          <div class="menu-text">
            <div class="line-1">
              专业健身
            </div>
            <div class="line" />
            <div class="line-2">
              PRO-training
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="fade3">
        <div v-show="showMenu1"
             class="menu-item"
             @click="goPage('PowerTest1')">
          <div class="menu-img" />
          <div class="menu-text">
            <div class="line-1">
              力量测试
            </div>
            <div class="line" />
            <div class="line-2">
              POWER-TEST
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="fade4">
        <div v-show="showMenu1"
             class="menu-item"
             @click="goPage('IntelFit1')">
          <div class="menu-img" />
          <div class="menu-text">
            <div class="line-1">
              智能健身
            </div>
            <div class="line" />
            <div class="line-2">
              SMART MODE
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Page>
</template>

<script lang="ts">
import { InfoCircleOutlined } from '@ant-design/icons-vue'

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
  computed,
} from 'vue'
import { connectJoyo, bleState } from '@/api/joyo-ble/web-ble-server'

import HeaderNav from '@/components/HeaderNav.vue'
import Page from '@/components/UI/Page.vue'

import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'Menu',
  components: {
    Page,
    // HeaderNav,
  },

  setup () {
    // @ts-ignore
    const state = reactive({
      showMenu1: false,
    })

    const store = useStore()
    const connectStatus = computed(() => { // 看下行否
      return store.getters['ble/connectStatus']
    })

    const goPage = (name: string) => {
      if (connectStatus.value) {
        router.push({ name })
      } else {
        message.info('设备未连接，请先连接蓝牙')
      }
    }

    const connect = () => {
      connectJoyo()
    }

    onMounted(() => {
      setTimeout(() => {
        state.showMenu1 = true
      }, 500)
    })

    return {
      ...toRefs(state),
      connect,
      goPage,
    }
  },
})
</script>

<style lang="scss" scoped>
.menu-box {
  display: flex;
  height: 100%;
  width: 100%;;
  justify-content: center;
  .menu-item {
    width: 20%;
    // padding: 0 22px;
    height: calc(100% - 80px);
    // border: 1px solid #fff;
    border-radius: 12px;
    margin: 0 10px;
    font-size: 60px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    flex-direction: column;

    transform: skewX(-8deg);
    overflow: hidden;
     background-color: rgba(117, 117, 117, .8);
    //  &:after {
    //     position: absolute;
    //     width: 100%;
    //     height: 100%;
    //     background-color: rgba(117, 117, 117, .8);
    //   }

    .menu-img {
      flex: 1;
      width: 100%;
      height: 100%;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      transform: skewX(8deg);
      opacity: 0.4;
      width: 140%;
      margin-left: -20%;

    }
    .menu-text {
      width: 100%;
      // height: 30px;
      font-size: 24px;
      text-align: center;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) skewX(8deg);
      text-align: center;
      font-weight: 200;
      padding-bottom: 20px;
      .line-1 {
        font-size: 36px;
      }
      .line {
        height: 0;
        width: 80%;
        margin: 5px 0 5px 10%;
        border-top: 1px solid #fff;

      }
       .line-2 {
        font-size: 16px;
      }
    }

    &:nth-child(1) {
      .menu-img {
        background-image: url(/gym/dist/img/menu1.png);
        background-size: 100% 100%;
        // background-position: 0 10px;
      }
    }
    &:nth-child(2) {
      .menu-img {
        background-image: url(/gym/dist/img/menu4.png);
      }

    }
    &:nth-child(3) {
      .menu-img {
        background-image: url(/gym/dist/img/menu2.png);
      background-size: 104% 104%;
      background-position: -3px -6px;
      }

    }
    &:nth-child(4) {
      .menu-img {
        background-image: url(/gym/dist/img/menu3.png);
      }

    }
  }
}

</style>
<style>
.fade1-enter-active,
.fade1-leave-active {
  transition: all .5s ease;
}

.fade1-enter-from,
.fade1-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.fade2-enter-active,
.fade2-leave-active {
  transition: all 1s ease;
  transition-delay: 100ms;
}

.fade2-enter-from,
.fade2-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.fade3-enter-active,
.fade3-leave-active {
  transition: all 1s ease;
  transition-delay: 200ms;
}

.fade3-enter-from,
.fade3-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.fade4-enter-active,
.fade4-leave-active {
  transition: all 1s ease;
  transition-delay: 300ms;
}

.fade4-enter-from,
.fade4-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

</style>
