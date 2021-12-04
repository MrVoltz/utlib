const { resolveCaptcha: resolveCaptchaBrowser } = require("./lib/captcha-browser"),
	{ generateLink } = require("./lib/link-generator");

function extractFileSlug(url) {
	var m = url.match(/\/file\/([^/]+)\//);
	return m ? m[1] : null;
}

function main() {
	let url = process.argv[2];
	if(!url) {
		console.error("No url specified.");
		return;
	}

	let fileSlug = extractFileSlug(url);
	if(!fileSlug) {
		console.error("Invalid url.");
		return;
	}

	generateLink(fileSlug, resolveCaptchaBrowser).then(link => {
		console.log("link: " + link);
	}).catch(err => {
		console.log("error", err);
	});
}

main();
