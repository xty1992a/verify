// https://www.yunhuiyuan.cn/UploadFile/UploadSingleImage?isCompress=true
function formatResult(raw) {
  let result = raw
  try {
	result = JSON.parse(raw)
  } catch (e) {
	console.log(e)
  }
  return result
}

export default function (url, data, method) {
  return new Promise((resolve) => {
	const xhr = new XMLHttpRequest();
	xhr.open(method || 'POST', url);
	xhr.send(data);
	xhr.onreadystatechange = function () {
	  const DONE = 4;
	  if (xhr.readyState === DONE) {
		if (xhr.status >= 200 && xhr.status < 300) {
		  resolve({
			success: true,
			data: formatResult(xhr.responseText),
		  })
		}
		else {
		  resolve({success: false, data: xhr.responseText})
		}
	  }
	}
  })
}
