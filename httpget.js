"use strict"

let http = require("http")
const url = "http://www.yodobashi.com/product/100000001003431566/"

http.get(url, (res) => {
	const { statusCode } = res
	const contentType = res.headers['content-type']
	
	let error
	if (statusCode !== 200) {
		error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`)
	}
	if (error) {
		console.error(error.message)
		res.resume()
		return
	}
	res.setEncoding('utf8')
	let rawData = ''
	res.on('data', (chunk) => { rawData += chunk; })//データが来る度に蓄積させる
	res.on('end', () => {//終わったら
		console.log(rawData)
	})
})