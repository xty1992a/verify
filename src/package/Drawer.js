import {fresh} from './fresh'

// 一个点是否命中一个点列表中的某一个
// 抽象为,一个点是否命中一个圆-->抽象为平面坐标中两点距离(点是否命中圆即点与圆心的距离是否小于圆半径)
const getHitPoint = (point, points) => points.find(it => Math.sqrt(Math.pow(it.x - point.x, 2) + Math.pow(it.y - point.y, 2)) < it.r)

const ranger = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function color16() {//十六进制颜色随机
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
  return '#' + r.toString(16) + g.toString(16) + b.toString(16);
}

const dftTextOptions = {
  x: 0, y: 0, r: 8, text: 'a', color: color16(),
}

class Text {
  constructor(opt) {
	Object.assign(this, dftTextOptions, opt)
  }

  isHit(point) {
	return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2)) < this.r
  }
}

class EmitAble {
  task = {}

  on(event, callback) {
	this.task[event] = callback
  }

  fire(event, payload) {
	this.task[event] && this.task[event](payload)
  }
}

const dftOptions = {
  width: 200,
  height: 100,
  bgImage: '',
}

export default class Drawer extends EmitAble {
  positionList = []
  hitPoints = []
  expectText = ''

  get completeText() {
	return this.hitPoints.map(it => it.text).join('')
  }

  constructor(opt) {
	super();
	if (!opt.el) {
	  throw new Error('el is required !')
	}
	this.$options = {
	  ...opt,
	  ...dftOptions,
	}
	this.init()
  }

  init() {
	let {el} = this.$options
	el.appendChild(this.createCanvas())
	this.$cvs.addEventListener('click', this.down)
  }

  createCanvas() {
	let {width, height} = this.$options
	const canvas = this.$cvs = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	canvas.style.width = '100%'
	canvas.style.height = '100%'
	this.ctx = canvas.getContext('2d')
	return canvas
  }

  createIcon() {
	const img = new Image()
	img.src = fresh
	let {ctx} = this
	let {x, y, r} = this.iconPoint
	img.onload = () => {
	  ctx.save()
	  ctx.beginPath()
	  ctx.fillStyle = '#fff'
	  ctx.arc(x, y, r, 0, 2 * Math.PI)
	  ctx.closePath()
	  ctx.fill()
	  ctx.drawImage(img, x - 8, y - 8, 2 * r, 2 * r)
	  ctx.restore()
	}
  }

  async draw(text, bgImage = this.$options.bgImage, expectText = '') {
	this.expectText = expectText
	this.hitPoints = []
	let {ctx} = this
	let {width, height} = this.$cvs

	this.iconPoint = {
	  x: width - 22,
	  y: 18,
	  r: 8
	}

	let img = await this.createImage(bgImage)
	ctx.clearRect(0, 0, width, height)
	ctx.drawImage(img, 0, 0, width, height)
	ctx.font = '16px Arial'
	ctx.fillStyle = '#fff'
	// ctx.fillText('a', 0, 10)
	let len = text.length
	while (len--) {
	  this.drawText(text[len])
	}
	this.createIcon()
  }

  createImage(src) {
	return new Promise(resolve => {
	  const img = this.$img || (this.$img = new Image(), this.$img)
	  img.src = src
	  img.onload = () => {
		resolve(img)
	  }
	})
  }

  drawText(text) {
	let {ctx} = this
	text = this.createText(text)
	console.log(text)
	ctx.save()
	ctx.font = text.r * 2 + 'px Arial';
	ctx.fillStyle = text.color;
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText(text.text, text.x, text.y)
	// ctx.beginPath()
	// ctx.arc(text.x, text.y, text.r, 0, 2 * Math.PI);
	// ctx.closePath()
	// ctx.stroke()
	ctx.restore()
  }

  drawHitMark({index, x, y}) {
	let {ctx} = this
	ctx.save()
	ctx.beginPath()
	ctx.arc(x, y, 8, 0, 2 * Math.PI)
	ctx.closePath()
	ctx.fillStyle = '#00c8ff'
	ctx.fill()
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'

	ctx.fillStyle = '#001d26'
	ctx.font = '12px Arial'
	ctx.fillText(index + '', x, y)
	ctx.restore()
  }

  createText(str) {
	let {width, height} = this.$cvs
	let text = new Text({
	  text: str,
	  x: ranger(8, width - 8),
	  y: ranger(8, height - 8),
	  color: color16(),
	})
	let item = getHitPoint(text, [...this.positionList, this.iconPoint])
	if (item) {
	  return this.createText(str)
	}
	this.positionList.push(text)
	return text
  }

  getOffset() {
	this.elRect = this.$cvs.getBoundingClientRect()
  }

  getPosition(e) {
	let point = e.changedTouches ? e.changedTouches[0] : e

	let {left, top} = this.elRect
	let {clientX, clientY} = point
	let x = (clientX - left)
	let y = (clientY - top)
	return {x, y}
  }

  getHitPoint(point) {
	return getHitPoint(point, this.positionList)
  }

  checkHitIcon({x, y}) {
	let it = this.iconPoint
	return Math.sqrt(Math.pow(it.x - x, 2) + Math.pow(it.y - y, 2)) < it.r
  }

  down = e => {
	if (this.complete) return;

	this.getOffset()
	let {x, y} = this.getPosition(e)

	if (this.checkHitIcon({x, y})) {
	  this.fire('refresh')
	}

	let hitPoint = this.getHitPoint({x, y}) || null
	if (hitPoint) {
	  if (this.hitPoints.includes(hitPoint)) {
		return
	  }
	  this.hitPoints.push(hitPoint)
	  this.drawHitMark({index: this.hitPoints.length, x, y})
	}

	console.log(hitPoint, this.expectText, this.completeText)
	if (this.completeText.length === this.expectText.length) {
	  let flag = this.completeText === this.expectText
	  this.fire('complete', flag)
	  this.complete = flag
	}
  }

}
