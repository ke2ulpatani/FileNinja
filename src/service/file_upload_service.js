var fs = require('fs');
var slack_bot_service = require('./slack_bot_service');
var slack = slack_bot_service.bot

async function upload_file_via_bot(filepath, filename, channels) {
	var form = {
		file: fs.createReadStream(filepath), // Optional, via multipart/form-data. If omitting this parameter, you MUST submit content
		// content: 'Your text here', // Optional, File contents. If omitting this parameter, you must provide a `file` 
		filename: filename, // Required 
		fileType: 'post', // Optional, See more file types in https://api.slack.com/types/file#file_types
		channels: channels //Optional, If you want to put more than one channel, separate using comma, example: 'general,random'
	};

	const res = await slack.fileUpload(form)
		.then(function (response) {
			// Slack sends a json with a boolean var ok. 
			// Error example : data = { ok: false, error: 'user_not_found' }
			// Error example : data = { ok: true, file: 'user_not_found' }
			if (!response || !response.ok) {
				return Promise.reject(new Error('Something wrong happened during the upload.'));
			}
			console.log('Uploaded Successfully:', response);

			return Promise.resolve(response);
		})
		.catch(function (err) {
			console.log('Failed on Uploading:', err);

			return Promise.reject(err);
		});
	return res.ok
}

module.exports.upload_file_via_bot = upload_file_via_bot;