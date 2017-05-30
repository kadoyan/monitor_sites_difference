"use strict"

const http = require("http")
const fs = require("fs")

const URL = "http://www.yodobashi.com/product/100000001003431566/"
const ELM = "js_buyBoxMain"

http.get(URL, (res) => {
	const { statusCode } = res
	const contentType = res.headers["content-type"]
	
	let error
	if (statusCode !== 200) {
		error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`)
	}
	if (error) {
		console.error(error.message)
		res.resume()
		return
	}
	res.setEncoding("utf8")
	let rawData = ""
	res.on("data", (chunk) => {//データが来る度に蓄積させる
		rawData += chunk
	})
	res.on("end", () => {//終わったら
		const reg = new RegExp('<div\\sid=\\"'+ ELM +'\\b[^<]*(?:(?!<\\/div>)<[^<]*)*<\\/div>');
		const target = rawData.match(reg)[0] || ""
//console.log()
		fs.writeFile("element.txt", target, function(err) {
			if (err) throw err;
			console.log('Saved!');
		})
	})
})