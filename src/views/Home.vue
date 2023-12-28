
<template>
  <div class="home">
    <!-- <div class="bg-holder" /> -->
    <div class="page">
      <div class="img-holder"
           :class="{'normal': showBtn }">
        <img src="/dist/bg.gif" />
      </div>
      <!-- <div class="home-title">
      健身，遇见更好的自己
      </div> -->
      <Transition name="fade">
        <div v-if="showBtn"
             class="home-btn-box ">
          <div class="home-btn"
               @click="goMenu">
            <span class="active-btn-left">》</span>开始训练<span class="active-btn-right">《</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script lang="ts">
import { bleSetSingleLight } from '@/api/joyo-ble/index'

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

import { useRoute, useRouter } from 'vue-router'

import '@/style/blockly-category.scss'

// declare global {
//     interface Window {
//     }
// }

export default defineComponent({
  name: 'BleUsage',
  components: {
  },

  setup () {
    // @ts-ignore
    const state = reactive({
      connectStatus: false,
      showBtn: false,
    })

    const goMenu = () => {
      router.push({ name: 'Menu' })
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
        state.showBtn = true
      }, 4000)
    })

    // 水印效果
    // const text = 'Your Watermark Text Here' // 要作为水印的文字
    // const wrapper = document.createElement('div')
    // wrapper.className = 'watermark'
    // document.body.appendChild(wrapper)

    // for (let i = 0; i < 30; i++) {
    //   const span = document.createElement('span')
    //   span.textContent = text
    //   wrapper.appendChild(span)
    // }

    // const spans = document.querySelectorAll('.watermark span')

    // let rotation = 0
    // function moveWatermark () {
    //   rotation += 1 // 设置旋转角度的增量
    //   spans.forEach((span, index) => {
    //     span.style.transform = `rotate(${rotation + index * 10}deg) translate(${index * 20}px, ${index * 20}px)` // 设置每个水印的位置和旋转角度
    //   })
    //   requestAnimationFrame(moveWatermark)
    // }

    // moveWatermark()

    return {
      ...toRefs(state),
      connect,
      goMenu,
    }
  },
})
</script>

<style lang="scss" scoped>
.home::v-deep {
  width: 100%;
  height: 100vh;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
  // background-color: rgba(0, 0, 0, .4);
  background-size: 100% 100%;
  background-blend-mode: multiply;
  position: relative;
  .bg2-holder {
    position: absolute;
    max-height: 600px;
    height: 100vh;
    top: 50%;
    width: 100%;
    left: 0;
    // opacity: .2;
    transform: translateY(-50%);
    background-image: url(/dist/home.jpg);
    background-size: 100% auto;
    background-position: center center;
    background-repeat: no-repeat;
    background-blend-mode: multiply;

    // filter: brightness(70%) contrast(120%) blur(2px) Alpha(opacity=50);;
  }

  .page {
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
  }

  .img-holder {
    display: flex;
    justify-content: center;
    transform: translateY(150px);
    transition: transform 1s ease;
    &.normal {
      transform: translateY(0)
    }
  }
  .home-title {
    font-size: 36px;
  }
  .home-btn-box {
    position: absolute;
    right: 40px;
    bottom: 120px;
    cursor: pointer;
    .home-btn {
      width: 200px;
      .active-btn-left {
        display: inline-block;
        opacity: 0; /* 初始设置透明度为 0，使图标隐藏 */
        animation: fadeInLeftToRight 2s ease-in-out infinite; /* 应用动画效果 */
      }
      .active-btn-right {
        display: inline-block;
        opacity: 0; /* 初始设置透明度为 0，使图标隐藏 */
        animation: fadeInRightToLeft 2s ease-in-out infinite; /* 应用动画效果 */
      }
    }
  }
}

@keyframes fadeInLeftToRight {
  0% {
    opacity: 0;
    transform: translateX(-100%); /* 图标位于左侧，超出可见范围 */
  }
  50% {
    opacity: 1; /* 50% 时完全显示图标 */
    transform: translateX(0); /* 图标位于正常位置 */
  }
  100% {
    opacity: 0;
    transform: translateX(100%); /* 图标位于右侧，超出可见范围 */
  }
}
@keyframes fadeInRightToLeft {
  0% {
    opacity: 0;
    transform: translateX(100%); /* 图标位于左侧，超出可见范围 */
  }
  50% {
    opacity: 1; /* 50% 时完全显示图标 */
    transform: translateX(0); /* 图标位于正常位置 */
  }
  100% {
    opacity: 0;
    transform: translateX(-100%); /* 图标位于右侧，超出可见范围 */
  }
}

</style>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
