import { message } from 'ant-design-vue'
import { Module, createStore } from 'vuex'

import type State from '@/store/interface'

import { connectJoyo, bleState, disconnectJoyo } from '@/api/joyo-ble/web-ble-server'

export interface BleStateType {
  bleConnectStatus: boolean,
}

declare global {
  interface Window {
    SecureDfuPackage: any,
  }
}

const bleModule: Module<BleStateType, State> = {
  namespaced: true,
  state: {
    bleConnectStatus: false, // 蓝牙连接状态
  },
  getters: {
    connectStatus (state) {
      return bleState.connectStatus
    },
  },
  mutations: {

  },
  actions: {
    bleConnect ({ commit, state }) { // 蓝牙连接
      // 1. 持续保持连接， 2. 连接JOYO
      connectJoyo()
    },
    bleDisconnect ({ commit, state }) { // 蓝牙断开连接
      disconnectJoyo()
    },

  },
}

export default bleModule
