<template>
  <div class="start-page">
    <div class="start-img" />
    <div class="page">
      <div class="img-holder"
           :class="{ 'normal': showBtn }" />
      <div class="start-btn-box">
        <div class="start my-btn"
             @click="goMenu">
          开始训练 START
        </div>
      </div>
      <!-- <Transition name="fade">
        <div v-if="showBtn" class="home-btn-box ">
          <div class="home-btn" @click="goMenu">
            <span class="active-btn-left">》</span>开始训练<span class="active-btn-right">《</span>
          </div>
        </div>
      </Transition> -->
    </div>
  </div>
</template>

<script lang="ts">

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
import { connectJoyo } from '@/api/joyo-ble/web-ble-server'

import { useRoute, useRouter } from 'vue-router'

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
      router.push({ name: 'Menu1' })
    }

    const connect = () => {
      connectJoyo()
    }

    onMounted(() => {
      setTimeout(() => {
        state.showBtn = true
      }, 4000)
    })

    return {
      ...toRefs(state),
      connect,
      goMenu,
    }
  },
})
</script>

<style lang="scss" scoped>
.start-page::v-deep {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #3C3D3D;

  font-family: myFont-en myFont-zh myFont;
  font-weight: 300;

  display: flex;
  align-items: center;
  justify-content: center;

  background-blend-mode: multiply;
  position: relative;

  .start-img {
    width: 100%;
    height: 100%;
    background-image: url(/gym/dist/img/startBg.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    opacity: 0.3;
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

    .start-btn-box {
      width: 100%;
      height: 120px;
      text-align: center;
      position: absolute;
      bottom: 60px;
      cursor: pointer;
      font-family: myFont-en myFont-zh myFont;

      .my-btn {
        font-size: 50px;
        display: inline-block;
        width: 600px;
        height: 88px;
        line-height: 88px;
        border-radius: 44px;
        background-color: #3486C8;

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
