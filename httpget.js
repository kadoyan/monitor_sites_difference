"use strict"

const cron = require("node-cron")
const fs = require("fs")
const TwitterPackage = require("twitter")
const Twitter = new TwitterPackage({
	consumer_key: "X5q5gLw7RQpVPCmbwezFHinpz",
	consumer_secret: "Z3UugebjA8FGRn76ir327YNd0bcEMZ4JECCc0LdzGaA3vnWVfq",
	access_token_key: "3878921-aNrjw5Y82elzDvsGY8wovPjMk2MbMsAHuyLOW4tH9P",
	access_token_secret: "IHH9YO7Fy9VJY2PnzFlWVK7jgmpabGLWpXXY8PErgnSTs"
})

const getHtml = (json) => {
	for (const i in json) {
		const site = json[i]
		site.protocol = (site.url.indexOf("https") != -1) ? "https" : "http"
		
		const http = require(site.protocol)
		http.get(site.url, (res) => {
			const { statusCode } = res
			const contentType = res.headers["content-type"]
			
			if (statusCode !== 200) {
				const err = new Error(`Request Failed. Status Code: ${statusCode}`)
				throw err
				res.resume()
				return
			}
			res.setEncoding("utf8")
			let rawData = ""
			res.on("data", (chunk) => {//データが来る度に蓄積させる
				rawData += chunk
			})
			res.on("end", () => {//終わったら
				detectDifference(site, rawData)
			})
		})
	}
}

const detectDifference = (site, rawData) => {
	const current = rawData.match(site.regexp)[0] || ""
	let previous = ""
	try {
		previous = fs.readFileSync(site.file).toString()
	} catch (err) {
		throw err
	}
	fs.writeFile(site.file, current, (err) => {
		if (err) throw err;
	})
	
	let tweet = ""
	if (previous !== current) {
		tweet = `${site.name}変化あり！ ${site.url}`
	}
	if (tweet !== "") {
		Twitter.post('direct_messages/new', {
			screen_name: "GetNSWonYodo",
			text: tweet
		}, function(err, tw, res) {
			if (err) throw err;
		});
	} else {
		const now = getCurrentTime()
		console.log(`${now} ${site.name}変化なし`)
	}
}

fs.readFile("sites.json", (err, data) => {
	if (err) throw err
	const json = JSON.parse(data)
	cron.schedule('*/3 * * * *', function(){
		getHtml(json)
	})
})