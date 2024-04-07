// export default function startClickTimer (callback: any, time = 6000) {
//   let timer = null as any

//   function handleClick () {
//     // 每次点击时重置计时器
//     clearTimeout(timer)
//     timer = setTimeout(function () {
//       // 60秒内没有点击事件发生，执行回调函数
//       callback()
//     }, time)
//   }

//   // 监听点击事件
//   document.addEventListener('click', handleClick)

//   // 返回取消函数
//   return function () {
//     // 移除点击事件监听器
//     document.removeEventListener('click', handleClick)
//     // 清除计时器
//     clearTimeout(timer)
//   }
// }

// // 测试
// // const cancelFunction = startClickTimer(function () {
// //   console.log('60秒内没有点击事件发生！')
// //   // 在这里执行你的回调函数逻辑
// // })

// // 取消监听
// // cancelFunction();
