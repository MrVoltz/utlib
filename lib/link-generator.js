const got = require("got"),
	tough = require("tough-cookie"),
	cheerio = require("cheerio");

const { BASE } = require("./constants");

function fetchCaptchaForm(fileSlug) {
	if(!fileSlug)
		return Promise.reject(new Error("Missing fileSlug"));

	var cookieJar = new tough.CookieJar();

	return got({
		url: BASE + "/download-dialog/free/download",
		searchParams: {
			fileSlug
		},
		cookieJar
	}).text().then(cheerio.load).then($ => {
		var $form = $("#frm-freeDownloadForm-form");
		if(!$form.length)
			throw new Error("Form not found");

		var data = {};
		for(let key of ["timestamp", "salt", "hash", "captcha_type"])
			data[key] = $form.find("[name=" + key + "]").attr("value");

		return {
			action: BASE + $form.attr("action"),
			cookieJar,
			data,
			imageUrl: "https:" + $form.find(".xapca-image").attr("src")
		};
	});
}

function submitCaptchaForm(action, data, cookieJar, value) {
	return got({
		method: "POST",
		url: action,
		form: {
			...data,
			captcha_value: value,
			_do: "freeDownloadForm-form-submit"
		},
		followRedirect: false,
		cookieJar
	}).then(res => {
		if(res.statusCode !== 303) {
			console.log(res.statusCode, res.body);
			throw new Error("invalid status code: " + res.statusCode);
		}
		let location = res.headers.location;
		if(!location)
			throw new Error("missing location header");
		return location;
	});
}

function generateLink(fileSlug, captchaCallback) {
	return fetchCaptchaForm(fileSlug).then(({ action, data, cookieJar, imageUrl }) => {
		return got({
			url: imageUrl,
			cookieJar
		}).buffer().then(captchaData => {
			return Promise.resolve(captchaCallback(captchaData));
		}).then(value => {
			if(!value) {
				console.log("captchaCallback didn't return value, returning null");
				return null;
			}

			console.log("Got captcha! " + value);
			return submitCaptchaForm(action, data, cookieJar, value);
		});
	});
}

module.exports = {
	generateLink
};
