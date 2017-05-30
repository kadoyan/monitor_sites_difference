"use strict"

const http = require("http")
const https = require("https")
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

const detectDiff = function() {
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
			const current = rawData.match(reg)[0] || ""
			let previous = ""
			try {
				previous = fs.readFileSync(FILE).toString()
			} catch (err) {
				if (err.code === 'ENOENT') {
					console.log('File not found.')
				} else {
					throw err
				}
			}
			
			let tweet = ""
			if (previous !== current) {
				tweet = `Yodobashi変化あり！ ${URL}`
			}
			
			fs.writeFile(FILE, current, (err) => {
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
				console.log("ヨドバシ変化なし")
			}
		})
	})
	
	https.get(NURL, (res) => {
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
			const reg = new RegExp('<div\\sclass=\\"'+ NELM +'\\b[^<]*(?:(?!<\\/div>)<[^<]*)*<\\/div>');
			const current = rawData.match(reg)[0] || ""
			let previous = ""
			try {
				previous = fs.readFileSync(NFILE).toString()
			} catch (err) {
				if (err.code === 'ENOENT') {
					console.log('File not found.')
				} else {
					throw err
				}
			}
			
			let tweet = ""
			if (previous !== current) {
				tweet = `Nintendo変化あり！ ${NURL}`
			}
			
			fs.writeFile(NFILE, current, (err) => {
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
				console.log("任天堂変化なし")
			}
		})
	})
}

setInterval(()=>{
	detectDiff()
}, 1000*60*10)