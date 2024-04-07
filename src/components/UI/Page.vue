<template>
  <div class="page-ui">
    <PopBack />
    <HeaderNav />
    <Transition name="fade-up">
      <div v-show="showPageAnimation || showSlot"
           class="page-content">
        <slot />
      </div>
    </Transition>
    <div class="icon icon-chair"
         @click="showChair = true" />
    <!-- 座椅调节弹窗 -->
    <div v-show="showChair"
         class="chair-option">
      <div class="chair-title">
        ——————————— &nbsp;&nbsp;座椅调节
      </div>
      <div class="option-box">
        <div class="left-box">
          <div class="img-1" />
          <div class="left-btn-box">
            <LeftCircleOutlined class="box-btn"
                                @touchstart="startLongPress1(1)"
                                @touchend="endLongPress1" />
            <RightCircleOutlined class="box-btn"
                                 @touchstart="startLongPress1(0)"
                                 @touchend="endLongPress1" />
          </div>
        </div>
        <div class="right-box">
          <div class="img-2" />
          <div class="right-btn-box">
            <UpCircleOutlined class="box-btn"
                              @touchstart="startLongPress2(1)"
                              @touchend="endLongPress2" />
            <DownCircleOutlined class="box-btn"
                                @touchstart="startLongPress2(0)"
                                @touchend="endLongPress2" />
          </div>
        </div>
      </div>
      <div class="start-btn-box">
        <div class="start my-btn"
             @click="showChair = false">
          确定
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useAttrs, markRaw, reactive, onMounted, toRefs, computed } from 'vue'

import {
  HomeOutlined, RollbackOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
} from '@ant-design/icons-vue'

import HeaderNav from '@/components/UI/HeaderNav.vue'
import PopBack from '@/components/UI/PopBack.vue'

import router from '@/router'

import { useRoute } from 'vue-router'

import { useStore } from 'vuex'

import { send_chair01_frame, send_chair02_frame } from '@/api/joyo-ble/web-ble-server'

export default defineComponent({
  name: 'Page',
  components: {
    HeaderNav,
    LeftCircleOutlined,
    RightCircleOutlined,
    UpCircleOutlined,
    DownCircleOutlined,
    PopBack,
    // HomeOutlined,
    // RollbackOutlined,
  },
  props: {
    showSlot: {
      type: Boolean,
      default: false,
    },
  },
  setup () {
    const state = reactive({
      showPageAnimation: false,
      timer: null as any,
      showChair: false,
    })

    const route = useRoute()
    const store = useStore()

    const showHome = computed(() => { // 看下行否
      return route.name !== 'Menu'
    })
    const showBackIcon = computed(() => { // 看下行否
      return store.state.showBackIcon
    })

    const goHome = () => {
      router.push({ name: 'Menu' })
    }

    function goBack () {
      store.commit('setShowResult', false)
    }

    function handleOrder (order: number) {
      console.log('长按', order)
    }

    function startLongPress1 (num: number) {
      state.timer = setInterval(() => {
        // 在这里执行长按时要触发的操作
        console.log('Long press action triggered')
        send_chair01_frame(num)
      }, 300)
    }
    function endLongPress1 () {
      console.log('Long press over')
      send_chair01_frame(0x02)
      clearInterval(state.timer)
      state.timer = null
    }
    function startLongPress2 (num: number) {
      state.timer = setInterval(() => {
        // 在这里执行长按时要触发的操作
        console.log('Long press action triggered')
        send_chair02_frame(num)
      }, 300)
    }
    function endLongPress2 () {
      console.log('Long press over')
      send_chair02_frame(2)
      clearInterval(state.timer)
      state.timer = null
    }

    onMounted(() => {
      document.oncontextmenu = (e) => {
        e.preventDefault()
      }
      setTimeout(() => {
        state.showPageAnimation = true
      }, 0)
    })
    return {
      ...toRefs(state),
      goHome,
      showHome,
      goBack,
      showBackIcon,
      handleOrder,
      startLongPress1,
      endLongPress1,
      startLongPress2,
      endLongPress2,
    }
  },
})
</script>

<style scoped lang="scss">
@import "~@/style/var.scss";
// 在本页面做屏幕适配
.page-ui::v-deep {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 960px;
  max-height: 600px;

  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: 36px;
  background-color: #3C3D3D;

  font-family: myFont-en myFont-zh myFont;
  .page-content {
    flex: 1;
    width: 100%;
    height: calc(100% - 80px);

  }
  .left-bottom {
    position: absolute;
    bottom: 20px;
    left: 20px;
  }
  .right-bottom {
    position: absolute;
    bottom: 20px;
    right: 20px;
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
  .icon-chair {
    background-image: url(/gym/dist/img/chair.png);
    background-size: 60% 60%;
    background-repeat: no-repeat;
    background-position: center center;
    position: absolute;
    right: 13px;
    top: 22px;
    border: 1px solid #fff;
    border-radius: 50%;
  }
  .chair-option {
    position: absolute;
    width: 890px;
    height: 550px;
    left: 50%;
    top: 50%;
    z-index: 100;
    transform: translateX(-50%) translateY(-50%);
    background-color: rgba(0, 0, 0, .8);
    border-radius: 15px;
    padding: 20px;
    box-sizing: border-box;
    font-weight: 300;
    font-size: 36px;
    .chair-title {
      text-align: center;
    }
    .option-box {
      display: flex;
      padding-top: 50px;
      user-select: none;
      .left-box, .right-box {
        width: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }
      .left-box {
        align-items: flex-end;
      }
      .img-1 {
        margin-bottom: 30px;
        width: 305.2px;
        height: 96.4px;
        background-image: url(/gym/dist/img/left.png);
        background-size: 100% 100%;
      }
      .img-2 {
        width: 178.2px;
        height: 193px;
        background-image: url(/gym/dist/img/right.png);
        background-size: 100% 100%;
      }
      .box-btn {
        width: 80px;
        height: 80px;
        font-size: 54px;
        margin: 0 10px;
        font-weight: 300;
        &:active, &:focus {
          opacity: .7;
        }
      }
      .right-btn-box {
        margin-top: 20px;
      }
    }
  }
}

.start-btn-box {
  width: 100%;
  height: $bottomHeight;
  text-align: center;
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
  }
}
</style>
<style>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.5s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(100px);
}
</style>
