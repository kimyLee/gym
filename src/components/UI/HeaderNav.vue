<template>
  <div class="header-nav-ui">
    <div class="home-box">
      <div class="icon icon-home left-bottom"
           @click="goHome" />
      <span class="current-time">{{ currentTime }}<span class="current-pm">{{ currentPM }}</span></span>
    </div>
    <DisconnectOutlined v-show="!connectStatus"
                        class="right-ble"
                        @click="connectJoyo" />
    <LinkOutlined v-show="connectStatus"
                  class="right-ble" />
    <!-- 设置按钮 -->
    <!-- <div class="right icon icon-setting"
         @click="connectJoyo" /> -->
    <!-- <SettingOutlined class="right"
                     @click="connectJoyo" /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, useAttrs, markRaw, computed, reactive, toRefs } from 'vue'

import { SettingOutlined, DisconnectOutlined, LinkOutlined } from '@ant-design/icons-vue'

import { useStore } from 'vuex'

import router from '@/router'

declare global {
  interface Window {
    getTimer: any,
  }
}

export default defineComponent({
  name: 'HeaderNav',
  components: {
    // SettingOutlined,
    DisconnectOutlined,
    LinkOutlined,
  },
  setup () {
    const store = useStore()

    const connectStatus = computed(() => { // 看下行否
      return store.getters['ble/connectStatus']
    })

    const state = reactive({
      currentTime: '',
      currentPM: '',
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

    const goHome = () => {
      router.push({ name: 'Menu1' })
    }

    // 循环获取时间
    window.getTimer = null
    getFormatTime()
    window.getTimer = setInterval(() => {
      console.log('getTimer')
      getFormatTime()
    }, 60000)

    function connectJoyo () {
      if (!connectStatus.value) {
        store.dispatch('ble/bleConnect')
      } else {
        store.dispatch('ble/bleDisconnect')
      }
    }
    return {
      ...toRefs(state),
      connectStatus,
      connectJoyo,
      goHome,
    }
  },
})
</script>

<style scoped lang="scss">
@import "~@/style/var.scss";
.header-nav-ui::v-deep {
  width: 100%;
  // background-color: #002253;
  padding-left: 75px;
  position: relative;
  height: $headerHeight;
  line-height:$headerHeight;
  font-size: 36px;
  height: 80px;
  line-height: 80px;

  .home-box {
    height: 100%;
    line-height: 80px;
    display: flex;
    align-items: center;
  }
  .current-time {
    margin-top: 5px;
    font-size: 20px;
    font-weight: 300;
    .current-pm {
      font-size: 18px;
    }
  }
  .time-text {
    font-size: 24px;
  }
  .right {
    position: absolute;
    right: 72px;
    top: 50%;
    transform: translateY(-50%);
  }
  .right-ble {
    position: absolute;
    right: 72px;
    // right: 132px;
    top: 50%;
    transform: translateY(-50%);
  }
  .icon {
    display: inline-block;
    width: 36px;
    height: 36px;
    background-size: 100% 100%;
  }
  .icon-setting {
    background-image: url(/gym/dist/img/setting.png);
  }
}
</style>
