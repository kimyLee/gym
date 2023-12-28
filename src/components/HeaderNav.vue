<template>
  <div class="header-nav">
    <div>{{ currentTime }}</div>
    <DisconnectOutlined v-show="!connectStatus"
                        class="right-ble" />
    <LinkOutlined v-show="connectStatus"
                  class="right-ble" />
    <SettingOutlined class="right"
                     @click="connectJoyo" />
  </div>
</template>

<script lang="ts">
import { defineComponent, useAttrs, markRaw, computed, reactive, toRefs } from 'vue'

import { SettingOutlined, DisconnectOutlined, LinkOutlined } from '@ant-design/icons-vue'

import { useStore } from 'vuex'

declare global {
  interface Window {
    getTimer: any,
  }
}

export default defineComponent({
  name: 'HeaderNav',
  components: {
    SettingOutlined,
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
    })

    function getFormatTime () {
      const now = new Date()
      let hours: string | number = now.getHours()
      let minutes: string | number = now.getMinutes()

      // 如果小时或分钟小于10，则在前面补0
      hours = hours < 10 ? `0${hours}` : hours
      minutes = minutes < 10 ? `0${minutes}` : minutes

      // 拼接成“hh:mm”格式的时间
      state.currentTime = `${hours}:${minutes}`
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
    }
  },
})
</script>

<style scoped lang="scss">
@import "~@/style/var.scss";
.header-nav::v-deep {
  width: 100%;
  // background-color: #002253;
  padding-left: 20px;
  position: relative;
  height: $headerHeight;
  line-height:$headerHeight;
  font-size: 36px;
  .right {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }
  .right-ble {
    position: absolute;
    right: 80px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
