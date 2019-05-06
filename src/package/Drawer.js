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

class EmitAble {
  task = {}

  on(event, callback) {
	this.task[event] = callback
  }

  fire(event, payload) {
	this.task[event] && this.task[event](payload)
  }
}

class Text {
  constructor(opt) {
	Object.assign(this, dftTextOptions, opt)
  }

  isHit(point) {
	return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2)) < this.r
  }

  draw(ctx) {
	console.log('text draw', this)
	ctx.save()
	ctx.font = this.r * 2 + 'px Arial';
	ctx.fillStyle = this.color;
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText(this.text, this.x, this.y)
	ctx.restore()
  }
}

class Icon extends Text {
  constructor(props) {
	super(props);
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

  async draw(ctx) {
	console.log(this)
	const img = await this.createImage(this.src)
	let {x, y, r} = this
	ctx.save()
	ctx.beginPath()
	ctx.fillStyle = '#fff'
	ctx.arc(x, y, r, 0, 2 * Math.PI)
	ctx.closePath()
	ctx.fill()
	ctx.translate(x - r, y - r)
	ctx.drawImage(img, 0, 0, 2 * r, 2 * r)
	ctx.restore()
  }
}

const dftOptions = {
  width: 200,
  height: 100,
  bgImage: '',
  ratio: 2,
}

export default class Drawer extends EmitAble {
  positionList = []
  usedPoint = []
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
	  ...dftOptions,
	  ...opt,
	}
	console.log(this.$options)
	this.init()
  }

  init() {
	let {el} = this.$options
	el.appendChild(this.createCanvas())
	this.$cvs.addEventListener('click', this.down)
  }

  createCanvas() {
	let {width, height, ratio} = this.$options
	const canvas = this.$cvs = document.createElement('canvas')
	canvas.width = width * ratio
	canvas.height = height * ratio
	canvas.style.width = '100%'
	canvas.style.height = '100%'
	this.ctx = canvas.getContext('2d')
	return canvas
  }

  restore(expectText) {
	this.expectText = expectText
	this.hitPoints = []
	let {width, height} = this.$cvs
	this.ctx.clearRect(0, 0, width, height)
  }

  async draw(text, bgImage = this.$options.bgImage, expectText = '') {
	this.restore(expectText)
	bgImage && await this.drawBg(bgImage)
	this.createIcon()
	let len = text.length
	while (len--) {
	  this.drawText(text[len])
	}

	this.freshIcon.draw(this.ctx)
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

  createText(str) {
	let {width, height} = this.$cvs
	let {fontSize, ratio} = this.$options
	let text = new Text({
	  text: str,
	  x: ranger(fontSize, width - fontSize),
	  y: ranger(fontSize, height - fontSize),
	  color: color16(),
	  r: fontSize,
	  ratio: ratio,
	})
	let item = getHitPoint(text, this.usedPoint)
	if (item) {
	  return this.createText(str)
	}
	this.usedPoint.push(text)
	this.positionList.push(text)
	return text
  }

  createIcon() {
	let {iconTop, iconRight, iconSize} = this.$options
	this.freshIcon = new Icon({
	  src: fresh,
	  x: (this.$cvs.width - iconRight),// * this.$options.ratio,
	  y: iconTop,
	  r: iconSize,
	})
	this.usedPoint.push(this.freshIcon)
  }

  async drawBg(bgImage) {
	let {ctx} = this
	let {width, height} = this.$cvs
	let img = await this.createImage(bgImage)
	ctx.drawImage(img, 0, 0, width, height)
  }

  drawText(text) {
	text = this.createText(text)
	text.draw(this.ctx)
  }

  drawHitMark({index, x, y}) {
	let {ctx} = this
	ctx.save()
	ctx.beginPath()
	ctx.arc(x, y, 8 * this.$options.ratio, 0, 2 * Math.PI)
	ctx.closePath()
	ctx.fillStyle = '#00c8ff'
	ctx.fill()
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'

	ctx.fillStyle = '#001d26'
	ctx.font = 12 * this.$options.ratio + 'px Arial'
	ctx.fillText(index + '', x, y)
	ctx.restore()
  }

  getOffset() {
	this.elRect = this.$cvs.getBoundingClientRect()
  }

  getPosition(e) {
	let point = e.changedTouches ? e.changedTouches[0] : e

	let {left, top} = this.elRect
	let {clientX, clientY} = point
	let x = (clientX - left) * this.$options.ratio
	let y = (clientY - top) * this.$options.ratio
	return {x, y}
  }

  getHitPoint(point) {
	return getHitPoint(point, this.positionList)
  }

  checkHitIcon({x, y}) {
	let it = this.freshIcon
	return Math.sqrt(Math.pow(it.x - x, 2) + Math.pow(it.y - y, 2)) < it.r
  }

  down = e => {
	if (this.complete) return;

	this.getOffset()
	let {x, y} = this.getPosition(e)

	if (this.checkHitIcon({x, y})) {
	  this.fire('refresh')
	  return
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
