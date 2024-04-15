<template>
  <!-- 阻力调节弹窗 -->
  <div v-show="showPop"
       class="pop-force">
    <div class="content-box">
      <div class="title-box">
        阻力调节(Kg)
      </div>
      <div class="title-box">
        {{ force }}
      </div>
      <!-- <div class="line1" /> -->
      <div class="item-container m-t-15">
        <div v-for="item in forceArray"
             :key="item"
             class="item-box"
             @click="setForce(item)">
          {{ item }}
        </div>
      </div>
      <div class="item-container m-t-15">
        <div v-for="item in changeArray"
             :key="item"
             class="item-box"
             @click="changeForce(item)">
          {{ item }}
        </div>
      </div>
    </div>

    <div class="start-btn-box">
      <div class="start my-btn"
           @click="confirmForce()">
        确定
      </div>
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
  onUnmounted,
  watch,
} from 'vue'

import { useRoute, useRouter } from 'vue-router'

// import startClickTimer from '@/lib/sleep'

export default defineComponent({
  name: 'BleUsage',
  components: {
  },
  props: {
    val: {
      type: Number,
      default: 0,
    },
    showPop: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['changeForce', 'update:showPop'],

  setup (props, { emit }) {
    // @ts-ignore
    const state = reactive({
      force: 0,
      // showPop: true,
      timer: null as any,
      sleepTimer: null as any,
      forceArray: [10, 20, 30, 40, 50, 60],
      changeArray: ['-5.0', '-1.0', '-0.5', '+0.5', '+1.0', '+5.0'],
    })

    const route = useRoute()

    const goMenu = () => {
      // 菜单页返回home页，其他页面返回菜单
      if (route.name === 'Menu1') {
        router.push({ name: 'Start' })
      } else {
        router.push({ name: 'Menu1' })
      }
    }

    watch(() => props.val, (value) => {
      state.force = value
    })

    function setForce (val: number) {
      state.force = val
    }

    function changeForce (val: string) {
      state.force = Math.min(60, Math.max(0, state.force + Number(val)))
    }

    function confirmForce () {
      emit('changeForce', state.force)
      emit('update:showPop', false)
    }

    onMounted(() => {
      //
    })

    onUnmounted(() => {
      // cancelFunction && cancelFunction() // 执行注销函数
    })

    return {
      ...toRefs(state),
      goMenu,
      setForce,
      changeForce,
      confirmForce,
    }
  },
})
</script>

<style lang="scss" scoped>
.m-t-15 {
  margin-top: 15px;
}
.pop-force {
  position: absolute;
  z-index: 199;
  width: 800px;
  height: 500px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 25px;
  background-color: rgba(0, 0, 0, .8);
  &.notShow {
    left: -100%;
  }

  .content-box {
    width: 100%;
    height: 100%;
    padding-top: 30px;
    box-sizing: border-box;

  }

  .title-box {
    text-align: center;
    font-size: 36px;
    font-weight: 300;
  }
  .text-box {
    font-size: 16px;
    margin-top: 5px;
    font-weight: 300;
  }
  .item-container {
    display: flex;
    justify-content: space-evenly;
    .item-box {
      width: 80px;
      height: 80px;
      font-size: 32px;

      border: 4px solid #3DBBCE;
      background-color: #fff;
      border-radius: 10px;
      font-weight: 300;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #444;
      &:nth-child(3), &:nth-child(4) {
        border: 4px solid #F4C71B;
      }
      &:nth-child(5),
      &:nth-child(6) {
        border: 4px solid #E61F19;
      }
      &:active, &:focus {
        opacity: .7;
      }
    }
  }

  .start-btn-box {
    width: 100%;
    height: 88px;
    position: absolute;
    bottom: 42px;
    left: 0;
    display: flex;
    justify-content: space-around;
    font-weight: 300;

    .my-btn {
      font-size: 32px;
      display: inline-block;
      text-align: center;
      width: 240px;
      height: 88px;
      line-height: 88px;
      border-radius: 44px;
      background-color: #0d92f5;

      &.pause {
        background-color: #F42727;
      }
    }
  }
}

</style>
