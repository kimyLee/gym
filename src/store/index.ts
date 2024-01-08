import { InjectionKey } from 'vue'

import { createStore, useStore as baseUseStore, Store } from 'vuex'

import ble from './ble'
import type { BleStateType } from './ble'
import type State from '@/store/interface'

export const key: InjectionKey<Store<State>> = Symbol('key')

export default createStore({
  state: {
    allData: {}, // 所有硬件数据
    allDataInfo2: {}, // 所有硬件数据2
    showResult: false,
    showBackIcon: false,
  },
  getters: {

  },
  mutations: {
    setShowResult (state, bool) {
      state.showResult = bool
      state.showBackIcon = bool
    },
    showBackIcon (state, bool) {
      state.showBackIcon = bool
    },
    setAllData (state, obj) { // 设置更新所有数据
      state.allData = obj
      console.log(state.allData)
    },
    setAllDataInfo2 (state, obj) { // 设置更新所有数据
      state.allDataInfo2 = obj
      console.log(state.allDataInfo2)
    },
  },
  actions: {

  },
  modules: {
    ble,
  },
})

interface AllStateType extends State {
  ble: BleStateType,
}

export function useStore () {
  return baseUseStore<AllStateType>(key)
}
