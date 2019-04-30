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

  async draw(text, bgImage = this.$options.bgImage) {
	let {ctx} = this
	let {width, height} = this.$cvs
	let img = await this.createImage(bgImage)
	ctx.clearRect(0, 0, width, height)
	ctx.drawImage(img, 0, 0, width, height)
	let len = 0
	while (len < text.length) {
	  this.drawText(text[len])
	  len++
	}
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
	ctx.fillText(text.text, text.x, text.y)
	ctx.restore()
  }

  createText(str) {
	let {width, height} = this.$cvs
	let text = new Text({
	  text: str,
	  x: ranger(0, width),
	  y: ranger(0, height),
	  color: color16(),
	})
	let item = getHitPoint(text, this.positionList)
	if (item) {
	  return this.createText(str)
	}
	this.positionList.push(text)
	return text
  }

  getOffset() {
	this.elRect = this.$el.getBoundingClientRect()
  }

  down = e => {
	this.mouseHadDown = true
	this.getOffset()
	let {x, y} = this.getPosition(e)
	this.hitPoint = this.getHitPoint({x, y}) || null
	this.points.forEach(it => it.hasOwnProperty('show') && (it.show = false))
	if (this.hitPoint) {
	  this.fire('hit', this.hitPoint)
	}
	else {
	  this.points.forEach(it => it.hasOwnProperty('show') && (it.show = false))
	}
  }

  move = e => {
	if (!this.mouseHadDown) return
	let {x, y} = this.getPosition(e)

	if (this.hitPoint) {
	  this.fire('move', {x, y})
	}
  }

  up = e => {
	if (!this.mouseHadDown) return
	this.mouseHadDown = false
	this.hitPoint = null
	this.fire('over')
  }

}
