// 未编译API,需要引入polyfill
import 'core-js'
import Verifyer from './package/main'
import Verify from './package/verifyAction.js'
import * as API from './tools/api';

(async () => {
  // let res = await API.getSmsCode()
  // console.log(res)
  // res = await API.getCheckCode()
  // console.log(res)
})();

const ranger = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

document.getElementById('btn').addEventListener('click', function () {
  Verify({
	getCodeAsync(callback) {
	  callback({
		text: ranger(1000, 9999) + '',
		img: '/static/2.png',
	  })
	},
  })
})

document.getElementById('btn').click()
