
export function formatTime (seconds: number) {
  // 计算小时、分钟和秒数
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  // 格式化成两位数的形式，比如将 9 转换成 09
  const formattedHours = ('0' + hours).slice(-2)
  const formattedMinutes = ('0' + minutes).slice(-2)
  const formattedSeconds = ('0' + remainingSeconds).slice(-2)

  // 返回 hh:mm:ss 格式的时间显示
  return formattedHours + ':' + formattedMinutes + ':' + formattedSeconds
}
