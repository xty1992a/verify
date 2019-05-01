### 机器人验证弹窗

#### live code
[live code](https://codepen.io/xty1992a/pen/xeoKam)

#### 简介
一个简单的验证弹窗.命令式调用,用户需要按照特定顺序点击canvas上的特定字符才能验证通过.
最终打包格式为umd,可`<script>`和import/require引入使用.


#### 安装
js: `npm i @redbuck/verify`或`yarn add @redbuck/verify`

css: 位于`@redbuck/verifyr/lib/verify.css`

#### 使用
```

Verify(options)  // => promise

// 为了便于async/await使用,只会resolve,返回{success: Boolean}
```

options:

属性 | 类型 | 默认值|描述
--:|--:|--:|--:
getCodeAsync| `Function` | 100|截图框及输出尺寸

#### 示例
```
const getCode = () => {
  let text = ranger(1000, 9999) + '';
  return {
    text,
    img: '/static/2.png',
    expectText: text.split('').reverse().join(''),
  }
}

Verify({
	// 刷新,获取新数据
	getCodeAsync(callback) {
	  const options = getCode()
	  callback(options)
	},
  })
  .then(result => {
    // 验证成功返回
    console.log(result.success)
  })
```


