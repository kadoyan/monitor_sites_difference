"use strict"

const fs = require("fs")
const TwitterPackage = require("twitter")

const URL = "http://www.yodobashi.com/product/100000001003431566/"
const ELM = "js_buyBoxMain"
const FILE = "element.txt"

const NURL = "https://store.nintendo.co.jp/customize.html"
const NELM = "customize_price__priceInner"
const NFILE = "elementn.txt"

const secret = {
	consumer_key: "X5q5gLw7RQpVPCmbwezFHinpz",
	consumer_secret: "Z3UugebjA8FGRn76ir327YNd0bcEMZ4JECCc0LdzGaA3vnWVfq",
	access_token_key: "3878921-aNrjw5Y82elzDvsGY8wovPjMk2MbMsAHuyLOW4tH9P",
	access_token_secret: "IHH9YO7Fy9VJY2PnzFlWVK7jgmpabGLWpXXY8PErgnSTs"
}

const Twitter = new TwitterPackage(secret)

const detectDiff = function(name, rawData) {
	let reg
	let file
	let url
	if (name === "ヨドバシ") {
		url = URL
		reg = new RegExp('<div\\sid=\\"'+ ELM +'\\b[^<]*(?:(?!<\\/div>)<[^<]*)*<\\/div>');
		file = FILE
	} else {
		url = NURL
		reg = new RegExp('<span\\sclass=\\"items\\">HAC_S_KAYAA\\/.');
		file = NFILE
	}
	const current = rawData.match(reg)[0] || ""
	let previous = ""
	
	try {
		previous = fs.readFileSync(file).toString()
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.log(`${file}: File not found.`)
		} else {
			throw err
		}
	}
	
	let tweet = ""
	if (previous !== current) {
		tweet = `${name}変化あり！ ${url}`
	}
	
	fs.writeFile(file, current, (err) => {
		if (err) throw err;
	})
	
	if (tweet !== "") {
		Twitter.post('direct_messages/new', {
				screen_name: "GetNSWonYodo",
				text: tweet
			}, function(err, tw, res){
			if (err) {
				console.log(err);
			}
		});
	} else {
		console.log(`${name}変化なし`)
	}
}
const startCheck = function(name, method, url) {
	const http = require(method)
	http.get(url, (res) => {
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
			detectDiff(name, rawData)
		})
	})
}

setInterval(()=>{
	startCheck("ヨドバシ", "http", URL)
	startCheck("任天堂", "https", NURL)
}, 1000*60*5)