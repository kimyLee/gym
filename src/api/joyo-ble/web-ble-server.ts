
import { reactive } from 'vue'
// import { floatToHex } from './utils'

let writeCharacteristic = null as any
let notifyCharacteristic = null as any
let gattServer: any = null
let commandService = null as any

export const bleState = reactive({
  connectStatus: false,
})

export let bleDevice = null as any

declare global {
  interface Window {
    handleNotifyEvent: any,
    webBleNotify: any,
    dfu: any,
  }
}

const naviga: any = window.navigator

function handleDisconnect () { // TODO：这里同一设备会重复两次
  writeCharacteristic = null
  bleDevice = null
  notifyCharacteristic = null
  gattServer = null
  commandService = null
  bleState.connectStatus = false
}

export function disconnectJoyo () {
  if (!bleDevice) {
    return
  }
  if (bleDevice.gatt.connected) {
    bleDevice.gatt.disconnect()
    // bleDevice.removeEventListener('gattserverdisconnected', handleDisconnect)
    bleDevice = null
  } else {
    console.log('already disconnect')
  }
}

// 连接设备
export function connectJoyo () {
  console.log('Connecting...')
  if (writeCharacteristic === null) {
    naviga.bluetooth.requestDevice({
      // acceptAllDevices: true,
      filters: [
        { namePrefix: '@' },
        // { services: ['17008380-B0F2-736A-65D2-82593DAE9803'] },
        // { services: [('17008380-B0F2-736A-65D2-82593DAE9803').toLowerCase()] },
        // { namePrefix: 'DDT' },
      ],
      optionalServices: [
        ('0000fff0-0000-1000-8000-00805f9b34fb').toLowerCase(),
        ('0000fff1-0000-1000-8000-00805f9b34fb').toLowerCase(),
        ('0000fff2-0000-1000-8000-00805f9b34fb').toLowerCase(),
        // ('00002530-1212-efde-1523-785feabcd123').toLowerCase(),
        // ('00001530-1212-efde-1523-785feabcd123').toLowerCase(),
        // ('00002160-0000-1000-8000-00805F9B34FB').toLowerCase(),
      ],
    })
      .then((device: any) => {
        console.log('Connecting to GATT Server...')
        // 断连监听
        bleDevice = device
        bleDevice.addEventListener('gattserverdisconnected', handleDisconnect)
        return bleDevice.gatt.connect()
      })
      .then((server: any) => {
        console.log('> Found GATT server')
        gattServer = server
        // todo:是否有其他sevice 可能是 0000ffe0-0000-1000-8000-00805f9b34fb
        return gattServer.getPrimaryService(('0000fff0-0000-1000-8000-00805f9b34fb').toLowerCase())
      })
      .then((service: any) => {
        console.log('> Found command service')
        console.log(service)
        commandService = service
        // Get write characteristic, 可能是 0000ffe1-0000-1000-8000-00805f9b34fb
        return commandService.getCharacteristic(('0000fff2-0000-1000-8000-00805f9b34fb').toLowerCase())
      })
      .then((characteristic: any) => {
        console.log('> Found write characteristic')
        writeCharacteristic = characteristic
        // const params = [85, 161, 44, 178, 54, 0, 40, 207, 0, 243, 244, 245, 246, 247, 248, 249, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 240, 241, 242, 243, 244, 245, 246, 205, 204, 204, 61]
        // sendCommand(params)
        return commandService.getCharacteristic(('0000fff1-0000-1000-8000-00805f9b34fb').toLowerCase())
      })
      .then((characteristic: any) => {
        console.log('> Found notice characteristic')
        notifyCharacteristic = characteristic
        bleState.connectStatus = true
        // 设置断连监听

        return notifyCharacteristic.startNotifications().then(() => {
          console.log('> Notifications started')
          // const throttledFunction = throttle(handleNotifications, 100)
          notifyCharacteristic.addEventListener('characteristicvaluechanged',
            handleNotifications)
        })
      })
      .catch((err: any) => {
        bleState.connectStatus = false
        console.log(err)
      })
  } else {
  }
}
// eg: [1, 100, 0, 0, 254, 179, 0, 250, 67, 0, 0, 0, 0, 0, 255, 6, 67, 109, 0, 0, 59, 26, 0, 205]
function handleNotifications (event: any) { // 做一个节流处理，500ms接受一次
  const value = event.target.value
  parse_drive_data(new Uint8Array(value.buffer)) // 注意
  // window.handleNotifyEvent && window.handleNotifyEvent(a)
  // window.webBleNotify && window.webBleNotify(a)
}

function parse_drive_data (buffer: any) {
  const info0 = {} as any
  const info1 = {} as any
  // console.log('是否匹配', buffer[23] === calculateCRC8(buffer.slice(0, -1)))
  // console.log(calculateCRC8(buffer.slice(0, -1)), buffer[23])
  if (buffer.length === 24 &&
    buffer[23] === calculateCRC8(buffer.slice(0, -1))
  ) {
    parse_feedback_info(info0, buffer.slice(2))
    parse_feedback_info(info1, buffer.slice(10))
    info0.temp_mos = buffer[17]
    // console.log('温度', info0.temp_mos)
    info0.err = buffer[18]
    // console.log('错误信息', info0.err)
    info0.mode = buffer[19]
    // console.log('M_mode', info0.mode)
    info0.temp = buffer[20]
    // console.log('电机1温度', info0.temp_mos)
    info1.temp = buffer[21]
    // console.log('电机2温度', info1.temp_mos)
  } else if (buffer.length === 20 &&
    buffer[0] === 1 &&
    buffer[19] === calculateCRC8(buffer.slice(0, -1))
  ) {
    parse_feedback_info20(info0, buffer.slice(2))
    parse_feedback_info20(info1, buffer.slice(8))
    // console.info(info0)
  }
  window.webBleNotify && window.webBleNotify({ info0, info1 })
  return { info0, info1 }
}

// buffer is uint8array
function parse_feedback_info (info: any, buffer: any) { // 一秒10次（100ms）
  const dv = new DataView(buffer.buffer)
  info.iq_return = dv.getInt16(0, false)
  // console.log('力值', info.iq_return) // 显示两个： P = iq_return / 2 * 0.1 * speed (N m/s)
  info.speed = dv.getInt16(2, false) //
  // console.log('速度', info.speed)
  info.distance = dv.getInt16(4, false) //
  // console.log('距离', info.distance)
  info.pull_num = buffer[6]
  // console.log('pull num', info.pull_num) // 运动次数：显示两个
  // 卡路cal = sum( P * 0.1 ) * 4.18

  // 标准：两个slide，来回力
  // done 1. 一秒10次（100ms）done
  // done 2. 显示两个次数和功率： P = iq_return / 2 * 0.1 * speed (N m/s)
  // done 3. 运动次数：显示两个
  // done 4. 卡路cal = sum( P * 0.1 ) * 4.18
  // Review 5. 标准下：拉力和回力
  // done 1. 去掉离心选项
  // done 1. KG的显示除以2
  // done 1. KG的显示除以2
  // 力量测试，切换等速
  // 力度 = iq_return / 2   （10-100）
  // 智能健身：小球数值： distance 【 0-50 cm】，速度可调，阻力：拉力回力一致，背景图
  //
}

function u82i8 (num: number) {
  return num < 128 ? num : num - 256
}

function parse_feedback_info20 (info: any, buffer: any) {
  info.iq_return = buffer[0]
  info.temp = buffer[1]
  info.speed = u82i8(buffer[2]) * 2
  info.distance = buffer[3] * 256 + buffer[4]
  info.pull_num = buffer[5]
}

function calculateCRC8 (array: any) {
  const CRC8_DATA = [
    0, 94, 188, 226, 97, 63, 221, 131, 194, 156, 126, 32, 163, 253, 31, 65,
    157, 195, 33, 127, 252, 162, 64, 30, 95, 1, 227, 189, 62, 96, 130, 220,
    35, 125, 159, 193, 66, 28, 254, 160, 225, 191, 93, 3, 128, 222, 60, 98,
    190, 224, 2, 92, 223, 129, 99, 61, 124, 34, 192, 158, 29, 67, 161, 255,
    70, 24, 250, 164, 39, 121, 155, 197, 132, 218, 56, 102, 229, 187, 89, 7,
    219, 133, 103, 57, 186, 228, 6, 88, 25, 71, 165, 251, 120, 38, 196, 154,
    101, 59, 217, 135, 4, 90, 184, 230, 167, 249, 27, 69, 198, 152, 122, 36,
    248, 166, 68, 26, 153, 199, 37, 123, 58, 100, 134, 216, 91, 5, 231, 185,
    140, 210, 48, 110, 237, 179, 81, 15, 78, 16, 242, 172, 47, 113, 147, 205,
    17, 79, 173, 243, 112, 46, 204, 146, 211, 141, 111, 49, 178, 236, 14, 80,
    175, 241, 19, 77, 206, 144, 114, 44, 109, 51, 209, 143, 12, 82, 176, 238,
    50, 108, 142, 208, 83, 13, 239, 177, 240, 174, 76, 18, 145, 207, 45, 115,
    202, 148, 118, 40, 171, 245, 23, 73, 8, 86, 180, 234, 105, 55, 213, 139,
    87, 9, 235, 181, 54, 104, 138, 212, 149, 203, 41, 119, 244, 170, 72, 22,
    233, 183, 85, 11, 136, 214, 52, 106, 43, 117, 151, 201, 74, 20, 246, 168,
    116, 42, 200, 150, 21, 75, 169, 247, 182, 232, 10, 84, 215, 137, 107, 53]

  // const i = 0
  // const i2 = array.length
  let b = 0
  for (let index = 0; index < array.length; index++) {
    b = CRC8_DATA[b ^ array[index] & 0xff]
  }
  return b
}
// 暂停运动
export function pausePlay () {
  send_fit_build_frame({
    mode: 'STOP',
  })
}
// 暂停运动
export function continutePlay () {
  send_fit_build_frame({
    mode: 'PLAY',
  })
}

// 通用设置命令
export function send_fit_build_frame (fitObj: any) {
  const KG2DATA = 2 // 假设KG2DATA为2
  const fit_buffer = new Uint8Array(10)

  const originFit = {
    force: 0,
    back_force: 0,
    fluid_resis_param: 0,
    mode: 'STD',
    spring_rate: '0',
  }
  const fit = Object.assign({}, originFit, fitObj)

  fit_buffer[0] = 1
  fit_buffer[1] = 0x64

  switch (fit.mode) {
    case 'STD' : fit_buffer[2] = 0; break // 标准
    case 'SPR' : fit_buffer[2] = 4; break // 弹力、需弹簧系数
    case 'FLU' : fit_buffer[2] = 3; break // 等速、需流阻系数
    case 'PLAY' : fit_buffer[2] = 0xFA; break // 继续
    case 'STOP' : fit_buffer[2] = 0xFB; break // 暂停
    default: fit_buffer[2] = 0
  }

  fit_buffer[3] = fit.force * KG2DATA // pull // 力量
  fit_buffer[4] = fit.back_force * KG2DATA // back // 回力
  fit_buffer[5] = fit.fluid_resis_param * 0.1 // const speed[0,10] 流阻系数
  fit_buffer[6] = 0x00
  fit_buffer[7] = 0x00
  fit_buffer[8] = fit.spring_rate // spring k[0,100] // 弹簧系数
  fit_buffer[9] = calculateCRC8(fit_buffer.slice(0, -1))
  console.log('发送指令' + Array.from(fit_buffer))
  sendCommand(fit_buffer)
  return fit_buffer
  // 在这里可以将fit_buffer发送给UART和做其他处理
}

export function sendCommand (command: any) {
  if (writeCharacteristic) {
    // const cmd = Uint8Array.from(command)
    const cmd = command
    return writeCharacteristic.writeValue(cmd)
  } else {
    return Promise.resolve()
  }
}

export function throttle (func: any, delay: number) {
  let timeoutId: any
  let lastExecTime = 0

  return function (this: any, ...args: any[]) {
    const currentTime = Date.now()
    const elapsedTime = currentTime - lastExecTime

    if (!lastExecTime || elapsedTime >= delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(this, args)
        lastExecTime = currentTime
      }, delay - elapsedTime)
    }
  }
}
