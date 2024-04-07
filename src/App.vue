<template>
  <div :class="{'show-bg': showBg }">
    <div class="bg-holder" />
    <router-view v-slot="{ Component }">
      <Transition name="my-fade"
                  mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
    <!-- <Transition name="my-fade" mode="out-in">
      <router-view />
    </Transition> -->
  </div>
</template>
<script lang="ts">

import {
  defineComponent,
  onMounted,
  computed,
} from 'vue'

import { useRoute } from 'vue-router'

import { useStore } from 'vuex'

export default defineComponent({
  name: 'App',

  setup () {
    const route = useRoute()

    const showBg = computed(() => { // 看下行否
      return route.name === 'QuickFit'
    })
    // const store = useStore()
    // onMounted(() => {
    //   (window as any).webBleNotify = ({ info0, info1 }) => {
    //     console.log('webBleNotify', info0, info1)
    //     store.commit('setAllDataInfo2', info1)
    //     store.commit('setAllData', info0)
    //   }
    // })
    return {
      showBg,
    }
  },
})
</script>

<style lang="scss">
@import "~@/style/var.scss";
body {
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  width: 100%;
  height: 100%;

  background: $bgColor;
  color: #fff;
  overflow: hidden;
  .show-bg {
    width: 100%;
    height: 100%;
     background: #3d3d3d;
  }
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.my-fade-enter-active,
.my-fade-leave-active {
  transition: opacity .8s ease;
}

.my-fade-enter-from,
.my-fade-leave-to {
  opacity: 0;
}
.my-fade-enter-to,
.my-fade-leave {
  opacity: 1;
}
</style>
