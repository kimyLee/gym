<template>
  <div class="page">
    <HeaderNav />
    <Transition name="fade-up">
      <div v-if="showPageAnimation"
           class="page-content">
        <slot />
      </div>
    </Transition>

    <!-- 可选项，Home 和 返回 -->
    <HomeOutlined v-show="showHome"
                  class="left-bottom"
                  @click="goHome" />
    <RollbackOutlined v-show="showBackIcon"
                      class="right-bottom"
                      @click="goBack" />
  </div>
</template>

<script lang="ts">
import { defineComponent, useAttrs, markRaw, reactive, onMounted, toRefs, computed } from 'vue'

import { HomeOutlined, RollbackOutlined } from '@ant-design/icons-vue'

import HeaderNav from '@/components/HeaderNav.vue'

import router from '@/router'

import { useRoute } from 'vue-router'

import { useStore } from 'vuex'

export default defineComponent({
  name: 'Page',
  components: {
    HeaderNav,
    HomeOutlined,
    RollbackOutlined,
  },
  setup () {
    const state = reactive({
      showPageAnimation: false,
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
      store.dispatch('setShowResult', false)
    }

    onMounted(() => {
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
    }
  },
})
</script>

<style scoped lang="scss">
// 在本页面做屏幕适配
.page::v-deep {
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
  .page-content {
    flex: 1;
    width: 100%;
    height: 100%;
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
