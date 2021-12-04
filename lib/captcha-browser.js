const express = require("express"),
	open = require("open");

function buildForm(imageUrl, messages) {
	return `<!DOCTYPE html>
		<form method="post">
			<p>${messages}</p>
			${imageUrl ? `<img src="${imageUrl}"><br>` : ""}
			<input type="text" name="value">
			<input type="submit">
		</form>`;
}

function resolveCaptcha(imageData) {
	return new Promise((resolve, reject) => {
		let app = express();

		app.use(express.urlencoded({ extended: false }));

		let imageUrl = "data:image/png;base64," + imageData.toString("base64");
		app.get("/", (req, res) => {
			res.send(buildForm(imageUrl, "Captcha?"));
		});

		app.post("/", (req, res) => {
			let value = String(req.body.value || "").trim();
			if(!value) {
				res.send(buildForm(imageUrl, "Try again."));
				return;
			}
			res.send(`<!DOCTYPE html>
				<p>Ok, closing window...</p>
				<script>window.close();</script>`);

			server.close();
			resolve(value);
		});

		let port = 9000 + Math.floor(Math.random() * 1000), server;
		server = app.listen(port, err => err && reject(err));

		let url = `http://localhost:${port}/`;
		open(url);
		console.log(`Waiting for captcha at ${url}`);
	});
}

module.exports = { resolveCaptcha };
