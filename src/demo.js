// 未编译API,需要引入polyfill
import 'core-js'
// import Verify from './package/verifyAction.js'
// import Verify from '../lib/verify.js'
import Verify from './package/verifyAction.js'

const ranger = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

document.getElementById('btn').addEventListener('click', async function () {
  const getCode = () => {
	let text = ranger(1000, 9999) + '';
	return {
	  text,
	  img: '/static/2.png',
	  expectText: text.split('').reverse().join(''),
	}
  }

  let result = await Verify({
	// 刷新,获取新数据
	fontSize: 24,
	width: 300,
	height: 200,
	getCodeAsync(callback) {
	  const result = getCode()
	  callback(result)
	},
  })

  console.log(result);
})

document.getElementById('btn').click()
