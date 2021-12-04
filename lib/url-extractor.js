const got = require("got"),
	Promise = require("bluebird");

function isTrackingUrl(url) {
	return !!url.match(/\/file-tracking\//);
}

function extractFileSlugSimple(url) {
	var m = url.match(/\/file\/([^/]+)\//);
	return m ? m[1] : null;
}

function resolveTrackingUrl(url) {
	return got({
		url,
		followRedirect: false
	}).then(res => {
		if(res.statusCode !== 301) {
			console.log(res.statusCode, res.body);
			throw new Error("invalid status code: " + res.statusCode);
		}

		return res.headers.location;
	});
}

function extractFileSlug(url) {
	if(isTrackingUrl(url))
		return resolveTrackingUrl(url).then(extractFileSlugSimple);
	return Promise.resolve(extractFileSlugSimple(url));
}

module.exports = { extractFileSlug };
