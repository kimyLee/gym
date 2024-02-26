
<template>
  <Page>
    <div class="pro-menu-box">
      <div class="menu-title">
        专业健身模式选择
      </div>
      <div class="pro-menus">
        <Transition name="fade1">
          <div v-show="showMenu1"
               class="menu-item"
               @click="goPage('ProFit01')">
            <div class="menu-img" />
            <div class="menu-num">
              01
            </div>
            <div class="menu-text">
              <div class="line-1">
                离心模式
              </div>
              <div class="line" />
              <div class="line-2">
                Centrifugal mode
              </div>
            </div>
          </div>
        </Transition>

        <Transition name="fade2">
          <div v-show="showMenu1"
               class="menu-item"
               @click="goPage('ProFit02')">
            <div class="menu-img" />
            <div class="menu-num">
              02
            </div>
            <div class="menu-text">
              <div class="line-1">
                等速模式
              </div>
              <div class="line" />
              <div class="line-2">
                Constant speed mode
              </div>
            </div>
          </div>
        </Transition>

        <Transition name="fade3">
          <div v-show="showMenu1"
               class="menu-item"
               @click="goPage('ProFit03')">
            <div class="menu-img" />
            <div class="menu-num">
              03
            </div>
            <div class="menu-text">
              <div class="line-1">
                弹力模式
              </div>
              <div class="line" />
              <div class="line-2">
                Elastic mode
              </div>
            </div>
          </div>
        </Transition>
      </div>
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
} from 'vue'
import { connectJoyo, bleState } from '@/api/joyo-ble/web-ble-server'

import HeaderNav from '@/components/HeaderNav.vue'
import Page from '@/components/UI/Page.vue'

import { useRoute, useRouter } from 'vue-router'

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
.pro-menu-box {
  // display: flex;
  height: 100%;
  width: 100%;;
  font-weight: 300;
  // justify-content: center;

  $TitleHeight: 60px;
  .menu-title {
    padding-left: 200px;
    height: $TitleHeight;
  }
  .pro-menus {
    display: flex;
    height: calc(100% - 60px);
    width: 100%;;
    justify-content: center;
  }
  .menu-item {
    position: relative;
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

    // transform: skewX(-8deg);
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
      // transform: skewX(8deg);
      opacity: 0.4;
      width: 140%;
      margin-left: -20%;

    }

    .menu-num {
      position: absolute;
      left: 10px;
      top: 0px;
      font-size: 40px;
      font-weight: 400;
    }
    .menu-text {
      width: 100%;
      font-size: 24px;
      text-align: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
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
