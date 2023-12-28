
<template>
  <Page>
    <div class="menu-box">
      <Transition name="fade1">
        <div v-show="showMenu1"
             class="menu-item"
             @click="goPage('QuickFit')">
          <div class="menu-img" />
          <div class="menu-text">
            快速健身
          </div>
        </div>
      </Transition>

      <Transition name="fade2">
        <div v-show="showMenu1"
             class="menu-item"
             @click="goPage('ProFit')">
          <div class="menu-img" />
          <div class="menu-text">
            专业健身
          </div>
        </div>
      </Transition>

      <Transition name="fade3">
        <div v-show="showMenu1"
             class="menu-item"
             @click="goPage('PowerTest')">
          <div class="menu-img" />
          <div class="menu-text">
            力量测试
          </div>
        </div>
      </Transition>

      <Transition name="fade4">
        <div v-show="showMenu1"
             class="menu-item"
             @click="goPage('IntelFit')">
          <div class="menu-img" />
          <div class="menu-text">
            智能健身
          </div>
        </div>
      </Transition>
    </div>
  </Page>
</template>

<script lang="ts">
import { bleSetSingleLight } from '@/api/joyo-ble/index'

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
} from 'vue'
import { connectJoyo, bleState } from '@/api/joyo-ble/web-ble-server'

import HeaderNav from '@/components/HeaderNav.vue'
import Page from '@/components/Page.vue'

import { useRoute, useRouter } from 'vue-router'
import '@/style/blockly-category.scss'

export default defineComponent({
  name: 'Menu',
  components: {
    Page,
    // HeaderNav,
  },

  setup () {
    // @ts-ignore
    const state = reactive({
      connectStatus: false,
      showMenu1: false,
      //
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
 // align-items: center;
  .menu-item {
    width: 25%;
    // padding: 0 22px;
    height: calc(100% - 80px);
    // border: 1px solid #fff;
    border-radius: 4px;
    margin: 0 20px;
    font-size: 60px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    flex-direction: column;
    .menu-img {
      flex: 1;
      width: 100%;
      height: 100%;
      background-size: 100% 100%;
      background-repeat: no-repeat;

    }
    .menu-text {
      width: 100%;
      height: 30px;
      font-size: 24px;
      text-align: center;
    }

    &:nth-child(1) {
      .menu-img {
        background-image: url(/dist/menu1.png);
        background-position: 0 -10px;
      }
    }
    &:nth-child(2) {
      .menu-img {
        background-image: url(/dist/menu2.png);
      }

    }
    &:nth-child(3) {
      .menu-img {
        background-image: url(/dist/menu3.jpg);
      background-size: 104% 104%;
      background-position: -3px -6px;
      }

    }
    &:nth-child(4) {
      .menu-img {
        background-image: url(/dist/menu4.png);
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
