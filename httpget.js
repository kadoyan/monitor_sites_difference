"use strict"

const cron = require("node-cron")
const fs = require("fs")
const TwitterPackage = require("twitter")
const twitterKeys = require("./twitter_keys.json")
const Twitter = new TwitterPackage({
	consumer_key: twitterKeys.consumer_key,
	consumer_secret: twitterKeys.consumer_secret,
	access_token_key: twitterKeys.access_token_key,
	access_token_secret: twitterKeys.access_token_secret
})
const sitesJson = process.argv[2] || "./sites.json"
const targetText = {}

const tweetMsg = (tweet) => {
	Twitter.post('statuses/update', {
		screen_name: twitterKeys.screen_name,
		status: tweet
	}, function(err) {
	});
}

//Get sites HTML
const getHtml = (json) => {
	for (const i in json) {
		const site = json[i]
		site.protocol = (site.url.indexOf("https") != -1) ? "https" : "http"
		
		const http = require(site.protocol)
		http.get(site.url, (res) => {
			const { statusCode } = res
			const contentType = res.headers["content-type"]
			let rawData = ""
			
			if (statusCode !== 200) {
				const currentTime = getCurrentTime()
				const err = `${currentTime}確認、${statusCode} ERROR: サイトにエラー発生中…。 ${site.url} #NintendoSwitch`//new Error(`Request Failed. Status Code: ${statusCode}`)
				console.log(err)
				res.pause()
				rawData = err
				detectDifference(site, rawData)
			}
			res.setEncoding("utf8")
			res.on("data", (chunk) => {
				rawData += chunk
			})
			res.on("end", () => {
				detectDifference(site, rawData)
			})
		})
	}
}

//The differences detection of the target part
const detectDifference = (site, rawData) => {
	const currentTime = getCurrentTime()
	let current = ""
	if (rawData.match(site.regexp) !== null) {
		current = rawData.match(site.regexp)[0]
	} else {
		current = rawData
	}
	let tweet = ""
	let previous = ""
	if (typeof targetText[site.id] !== "undefined") {
		previous = targetText[site.id]
	} else {
		console.log(`${site.id}: Begin checking.`)
		tweet = `${currentTime}、${site.name}の在庫チェックを開始しました。 ${site.url} #NintendoSwitch`
	}
	
	if (previous !== "" && previous !== current && current !== rawData) {
		console.log(`${site.id}: A difference is detected!`)
		tweet = `${currentTime}確認、${site.name}に変化あり？サイトをチェック！ ${site.url} #NintendoSwitch`
	}
	if (current === rawData) {
		tweetMsg(current)
	}
	if (tweet !== "") {
		tweetMsg(tweet)
	} else {
		const now = getCurrentTime()
		console.log(`${now} ${site.name} nothing changed.`)
	}
	
	targetText[site.id] = current
}

//Get current time
const getCurrentTime = ()=> {
	const now = new Date()
	const hour = now.getHours()
	const minute = now.getMinutes()
	return `${hour}時${minute}分`//hour:minute
}

fs.readFile(sitesJson, (err, data) => {
	if (err) throw err
	const json = JSON.parse(data)
	getHtml(json)
	cron.schedule('*/3 * * * *', function(){
		getHtml(json)
	})
})