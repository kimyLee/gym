import axios from '@/utils/axios'
import { message } from 'ant-design-vue'

export function fetchFirmware (url: string): Promise<void> {
  return axios.get(url, { responseType: 'arraybuffer' })
    .then(function (response: any) {
      // 处理成功情况
      return response // todo: 其他信息
    })
    .catch(function (error) {
      message.error('下载固件失败')
      // 处理错误情况
      console.log(error)
    })
}
