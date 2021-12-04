const Promise = require("bluebird"),
	readline = require("readline");

const { resolveCaptcha: resolveCaptchaBrowser } = require("./lib/captcha-browser"),
	{ generateLink } = require("./lib/link-generator"),
	{ extractFileSlug } = require("./lib/url-extractor");

function processUrl(url) {
	return Promise.try(() => {
		url = url.trim();
		if(!url)
			throw new Error("No url specified.");

		return extractFileSlug(url);
	}).then(fileSlug => {
		if(!fileSlug)
			throw new Error("Invalid url.");

		return generateLink(fileSlug, resolveCaptchaBrowser);
	}).then(link => {
		console.log(`Link: ${link}`);
	}).catch(err => {
		console.error(`Error: ${err.message || err}`);
	});
}

function interactive() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	function loop() {
		return (new Promise(resolve => {
			rl.question("URL: ", resolve);
		})).then(processUrl).then(loop);
	}

	return loop();
}


function main() {
	let url = process.argv[2];
	if(!url)
		return interactive();

	return processUrl(url);
}

main();
