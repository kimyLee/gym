
/* eslint-disable */
export class DragAcr {
  constructor (param: any) {
    this.initParam(param)
    this.draw((this as any).value)
  }

  initParam (this: any, param: any) {
    const {
      el,
      startDeg = 0,
      endDeg = 1,
      innerColor = '#51e6b6',
      outColor = '#c0c0c0',
      innerLineWidth = 1,
      outLineWidth = 20,
      counterclockwise = true,
      slider = 15,
      color = ['#06dabc', '#33aaff'],
      // sliderColor = '#fff',
      sliderColor = '#0796ff',
      // sliderBorderColor = '#33aaff',
      sliderBorderColor = '#fff',
      value = 0,
      change = (v: any) => { console.log(v) },
      // textShow = true,
      textShow = false,
    } = param

    this.el = el
    this.width = el.offsetWidth
    this.height = el.offsetHeight
    this.center = this.width / 2
    this.centerHeight = this.height / 2
    this.radius = this.width / 2 - 30 // 滑动路径半径
    this.initCanvas(el)

    this.startDeg = startDeg
    this.endDeg = endDeg
    this.innerColor = innerColor
    this.outColor = outColor
    this.innerLineWidth = innerLineWidth
    this.outLineWidth = outLineWidth
    this.counterclockwise = counterclockwise
    this.slider = slider
    this.color = color
    this.sliderColor = sliderColor
    this.sliderBorderColor = sliderBorderColor

    this.residueDeg = 2 - startDeg;

    this.value = value
    this.textShow = textShow

    this.change = change

    this.isDown = false
    this.event(el)
  }

  initCanvas (this: any, dom: any) {
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('id', 'dragArc')
    this.canvas.setAttribute('width', this.width)
    this.canvas.setAttribute('height', this.width)
    dom.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')

    var ua = navigator.userAgent
    var isAndroid = /(?:Android)/.test(ua)
    var isFireFox = /(?:Firefox)/.test(ua)
    var isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua))

    this.isMobile = isTablet || window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
  }

  // 绘图
  draw (this: any, value: any) {
    this.ctx.clearRect(0, 0, this.width, this.width)

    this.ctx.save()

    const startDeg = this.counterclockwise ? Math.PI * (2 - this.startDeg) : Math.PI * this.startDeg
    const endDeg = this.counterclockwise ? Math.PI * (2 - this.endDeg) : Math.PI * this.endDeg

    // 绘制内层圆弧
    // this.ctx.beginPath()
    // this.ctx.lineWidth = 1
    // this.ctx.arc(this.center, this.center, this.radius - 20, startDeg, endDeg, this.counterclockwise) // 绘制内层圆弧
    // this.ctx.strokeStyle = this.innerColor
    // this.ctx.stroke()

    // 绘制外侧圆弧
    // this.ctx.beginPath()
    // this.ctx.arc(this.center, this.center, this.radius, startDeg, endDeg, this.counterclockwise) // 绘制外侧圆弧
    // this.ctx.strokeStyle = this.outColor
    // this.ctx.lineCap = 'round'
    // this.ctx.lineWidth = this.outLineWidth
    // this.ctx.stroke()

    const Deg = this.valToDeg(value)

    // 绘制可变圆弧
    // const themeColor =  this.setLinearGradient()
    // this.ctx.beginPath()
    // this.ctx.arc(this.center, this.center, this.radius, startDeg, Deg, this.counterclockwise) // 可变圆弧
    // this.ctx.strokeStyle = themeColor
    // this.ctx.lineCap = 'round'
    // this.ctx.lineWidth = this.outLineWidth
    // this.ctx.stroke()

    // 绘制圆环
    const totalTicks = 80; // 总刻度数量
    const anglePerTick = (1.5 * Math.PI) / totalTicks;
    // const anglePerTick = ((5/4 * Math.PI) - (3/4 * Math.PI)) / totalTicks;

    const centerX = this.center
    const centerY = this.centerHeight - 20
    const radius = this.radius
    const ctx = this.ctx

    for (let i = 0; i < totalTicks; i++) {
      const angle = i * anglePerTick + (3 / 4 * Math.PI);
      const startX = centerX + Math.cos(angle) * (radius - 12);
      const startY = centerY + Math.sin(angle) * (radius - 12);
      const endX = centerX + Math.cos(angle) * (radius + 12);
      const endY = centerY + Math.sin(angle) * (radius + 12);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      if ((i / totalTicks) <= (value / 100)) {
         ctx.strokeStyle = this.sliderColor;
      } else {
         ctx.strokeStyle = '#fff';
      }
      // ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 绘制滑块
    this.P = this.DegToXY(Deg)
    this.ctx.beginPath()
    this.ctx.moveTo(this.center, this.center)
    this.ctx.arc(this.P.x, this.P.y, this.slider + 5, 0, Math.PI * 2, false) // 绘制滑块内侧
    this.ctx.fillStyle = this.sliderBorderColor
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.moveTo(this.center, this.center)
    this.ctx.arc(this.P.x, this.P.y, this.slider, 0, Math.PI * 2, false) // 绘制滑块
    this.ctx.fillStyle = this.sliderColor
    this.ctx.fill()

    // 文字
    // if (!this.textShow) return
    // this.ctx.font = `${this.center / 4}px serif`
    // this.ctx.fillStyle = themeColor
    // this.ctx.textAlign = 'center'
    // this.ctx.textBaseline = 'bottom'
    // this.ctx.fillText(this.value, this.center, this.center)
  }

  // 将值转化为弧度
  valToDeg (this: any, v: any) {
    const range = this.endDeg - this.startDeg
    let val = range / 100 * v
    if (this.counterclockwise && (val != 0)) val = 2 - val
    const startDeg = this.counterclockwise ? (2 - this.startDeg) : this.startDeg
    return (startDeg + val) * Math.PI
  }

  // 弧度转化为对应坐标值
  DegToXY (this: any, deg: any) {
    const d = 2 * Math.PI - deg
    return this.respotchangeXY({
      x: this.radius * Math.cos(d),
      y: this.radius * Math.sin(d),
    })
  }

  // canvas坐标转化为中心坐标
  spotchangeXY (this: any, point: any) {
    const spotchangeX = (i:any) => {
      return i - this.center
    }
    const spotchangeY = (i: any) => {
      return this.center - i
    }
    return {
      x: spotchangeX(point.x),
      y: spotchangeY(point.y),
    }
  }

  // 中心坐标转化为canvas坐标
  respotchangeXY (this: any, point: any) {
    const spotchangeX = (i: any) => {
      return i + this.center
    }
    const spotchangeY = (i: any) => {
      return this.center - i
    }
    return {
      x: spotchangeX(point.x),
      y: spotchangeY(point.y),
    }
  }

  setLinearGradient (this: any) {
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.width)
    this.color.forEach((e: any, i: any) => {
      if (i == 0) {
        grad.addColorStop(0, e)
      } else if (i == this.color.length - 1) {
        grad.addColorStop(1, e)
      } else {
        grad.addColorStop(1 / this.color.length * (i + 1), e)
      }
    })
    return grad
  }

  event (this: any, dom: any) { // 事件绑定
    if (this.isMobile) {
      dom.addEventListener('touchstart', this.OnMouseDown.bind(this), false)
      dom.addEventListener('touchmove', this.throttle(this.OnMouseMove.bind(this)), false)
      dom.addEventListener('touchend', this.OnMouseUp.bind(this), false)
      return
    }
    dom.addEventListener('mousedown', this.OnMouseDown.bind(this), false)
    dom.addEventListener('mousemove', this.throttle(this.OnMouseMove.bind(this)), false)
    dom.addEventListener('mouseup', this.OnMouseUp.bind(this), false)
  }

  OnMouseMove (this: any, evt: any) {
    if (!this.isDown) return
    const evpoint = {} as any
    evpoint.x = this.getx(evt)
    evpoint.y = this.gety(evt)
    const point = this.spotchangeXY(evpoint)
    console.log('x: ', point.x, ' y: ', point.y)
    let deg = this.XYToDeg(point.x, point.y)
    deg = this.counterclockwise ? deg : Math.PI * 2 - deg
    
    // let val = (deg / Math.PI - this.startDeg) / (this.endDeg - this.startDeg) * 100
    // console.log(deg, val, 'deg')
    const radian = deg / Math.PI;
    let val =
			((radian - (radian > this.startDeg ? this.startDeg : -this.residueDeg)) /
				(this.endDeg - this.startDeg)) *
      100;
    
    // if (val < 0) val = 100 + val
    // if(val>100 || val<0) return;
    if (val >= 100) val = 100
    if (val <= 0) val = 0
    if (Math.abs(val - this.value) > 10) return
    this.animate = requestAnimationFrame(this.draw.bind(this, val))
    if (this.value != Math.round(val)) {
      this.value = Math.round(val)
      this.change(this.value)
    }
  }

  OnMouseDown (this: any, evt: any) {
    const range = 10
    const X = this.getx(evt)
    const Y = this.gety(evt)
    const P = this.P
    const minX = P.x - this.slider - range
    const maxX = P.x + this.slider + range
    const minY = P.y - this.slider - range
    const maxY = P.y + this.slider + range
    if (minX < X && X < maxX && minY < Y && Y < maxY) { // 判断鼠标是否在滑块上
      this.isDown = true
    } else {
      this.isDown = false
    }
  }

  OnMouseUp (this: any) { // 鼠标释放
    const _this = this
    cancelAnimationFrame(_this.animate)
    this.isDown = false
  }

  // 将坐标点转化为弧度
  XYToDeg (lx: any, ly: any) {
    const adeg = Math.atan(ly / lx)
    let deg
    if (lx >= 0 && ly >= 0) {
      deg = adeg
    }
    if (lx <= 0 && ly >= 0) {
      deg = adeg + Math.PI
    }
    if (lx <= 0 && ly <= 0) {
      deg = adeg + Math.PI
    }
    if (lx > 0 && ly < 0) {
      deg = adeg + Math.PI * 2
    }
    return deg
  }

  // 获取鼠标在canvas内坐标x
  getx (this: any, ev: any) {
    if (!this.isMobile) return ev.clientX - this.el.getBoundingClientRect().left
    return ev.touches[0].pageX - this.el.getBoundingClientRect().left
  }

  // 获取鼠标在canvas内坐标y
  gety (this: any, ev: any) {
    if (!this.isMobile) return ev.clientY - this.el.getBoundingClientRect().top
    return ev.touches[0].pageY - this.el.getBoundingClientRect().top
  }

  // 节流
  throttle (func: any) {
    let previous = 0
    return function (this: any) {
      const now = Date.now()
      const context = this
      const args = arguments
      if (now - previous > 10) {
        func.apply(context, args)
        previous = now
      }
    }
  }
}

function main () {
  const dom = document.getElementById('content')
  const a = new DragAcr({
    el: dom,
    startDeg: 0.5,
    endDeg: 2.5,
    outColor: '#eee',
    counterclockwise: true,
    change: (v: any) => {
      console.log(`value:${v}`)
    },
  })
}
