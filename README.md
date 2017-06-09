[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Monitor sites difference
Automatically monitoring the differences of website at every few minutes and reporting you via twitter message.

## Getting Started
Make a JSON file named "twitter_keys.json" at same directory.
It has twitter API Keys.
```
{
	"consumer_key": "YOUR_VALUE",
	"consumer_secret": "YOUR_VALUE",
	"access_token_key": "YOUR_VALUE",
	"access_token_secret": "YOUR_VALUE",
	"screen_name": "The twitter user name receiving direct messages."
}
```

Edit the JSON file named "sites.json".
```
[
	{
		"name": "Display name",
		"url": "Monitoring URL",
		"regexp": "The regular expression pattern of the monitoring part of the webpage",
		"file": "The export filename of the matching text."
	}
]
```

Start this script.
```
node index.js sites.json
```
