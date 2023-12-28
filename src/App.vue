<template>
  <div>
    <div class="bg-holder" />
    <router-view />
  </div>
</template>
<script lang="ts">

import {
  defineComponent,
  onMounted,
} from 'vue'

import { useStore } from 'vuex'

export default defineComponent({
  name: 'App',

  setup () {
    // const store = useStore()
    // onMounted(() => {
    //   (window as any).webBleNotify = ({ info0, info1 }) => {
    //     console.log('webBleNotify', info0, info1)
    //     store.commit('setAllDataInfo2', info1)
    //     store.commit('setAllData', info0)
    //   }
    // })
    return {
    }
  },
})
</script>

<style lang="scss">
@import "~@/style/var.scss";

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
</style>
