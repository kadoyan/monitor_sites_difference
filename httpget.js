"use strict"
//
// Need a JSON file "twitter_keys.json" at the same directory.
/*
{
	"consumer_key": "YOUR_VALUE",
	"consumer_secret": "YOUR_VALUE",
	"access_token_key": "YOUR_VALUE",
	"access_token_secret": "YOUR_VALUE",
	"screen_name": "YOUR_VALUE"
}
*/

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

const tweetMsg = (tweet) => {
	Twitter.post('direct_messages/new', {
		screen_name: twitterKeys.screen_name,
		text: tweet
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
				const err = `${statusCode} ERROR: Something has happened on ${site.name}.${site.url}`//new Error(`Request Failed. Status Code: ${statusCode}`)
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
	let current = ""
	if (rawData.match(site.regexp) !== null) {
		current = rawData.match(site.regexp)[0]
	} else {
		current = rawData
	}
	let tweet = ""
	let previous = ""	
	try {
		previous = fs.readFileSync(site.file).toString()
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.log(`${site.file}: File not found. Begin checking.`)
			tweet = `${site.name}: Begin checking.`
		} else {
			throw err
		}
	}
	
	if (previous !== "" && previous !== current && current !== rawData) {
		tweet = `Hey! Go and check ${site.name}! ${site.url}`
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
	
	fs.writeFile(site.file, current, (err) => {
		if (err) throw err;
	})
}

//Get current time
const getCurrentTime = ()=> {
	const now = new Date()
	const hour = now.getHours()
	const minute = now.getMinutes()
	return `${hour}:${minute}`
}

fs.readFile("sites.json", (err, data) => {
	if (err) throw err
	const json = JSON.parse(data)
	getHtml(json)
	cron.schedule('*/4 * * * *', function(){
		getHtml(json)
	})
})