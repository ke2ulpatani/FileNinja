const got = require('got');
var token = "token";

async function post_request(url, body_params) {
	var url = url;
	var options = {
		method: 'POST',
		headers: {
			"content-type": "application/json",
			"Authorization": "tokenToBeAddedLater"
		},
		body: JSON.stringify(body_params)
	};

	// Send a http request to url
	let response = (await got(url, options)).body;
	return response;
}

exports.post_request = post_request;
