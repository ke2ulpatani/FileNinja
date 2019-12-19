var Slack = require('nodejslack');
const fetch = require("node-fetch");

// Creating instance to connect to Slack. check: https://github.com/marcogbarcellos/nodejslack

var bot = new Slack(process.env.SLACK_TOKEN);

var bot_id = process.env.BOT_ID

async function get_slack_resource_from_url(url) {
	const resource = await fetch(url, {
		method: 'GET',
		mode: 'cors',
		withCredentials: true,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + process.env.SLACK_TOKEN
		}
	}).then((res) => res.arrayBuffer())
	return resource
}

async function get_json_data_from_url(url) {
	const resource = await fetch(url, {
		method: 'GET'
	}).then(function (response) {
		return response.json();
	})
		.then(function (json) {
			return json
		});
	return resource
}

async function delete_file_from_slack(url, file_id) {
	const resource = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		withCredentials: true,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + process.env.ADMIN_TOKEN
		},
		body: JSON.stringify({
			file: file_id
		})
	}).then((res) => res)
	return resource
}

async function open_modal(trigger_id) {
	const resource = await fetch("https://slack.com/api/views.open", {
		method: 'POST',
		mode: 'cors',
		withCredentials: true,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + process.env.ADMIN_TOKEN
		},
		body: JSON.stringify({
			"trigger_id": trigger_id,
			"view": {
				"type": "modal",
				"title": {
					"type": "plain_text",
					"text": "Register Google Drive"
				},
				"submit": {
					"type": "plain_text",
					"text": "Submit"
				},
				"close": {
					"type": "plain_text",
					"text": "Cancel"
				},
				"blocks": [
					{
						"type": "section",
						"text": {
							"type": "mrkdwn",
							"text": "*For exporting to a google drive, you would need to have a google service account. Follow these instructions to register:*"
						}
					},
					{
						"type": "section",
						"text": {
							"type": "mrkdwn",
							"text": "*1.* Go to <https://console.developers.google.com/cloud-resource-manager|Google Developers Console>. \n *2.* Select your project or create a new one (and then select it)\n*3.* In the sidebar on the left, expand APIs & Services > Library"
							+ "\n*4.* Find 'Google Drive API' and enable it for your selected project ."
							+ "\n*5.* In the sidebar on the left, expand APIs & Services > Credentials"
							+ "\n*6.* Click blue \"Create credentials\" drop down and select \"Service account key\"."
							+ "\n*7.* Select a existing service account or create a new one."
							+ "\n*8.* Select the 'JSON' key type radio button and click create. A JSON file will be downloaded."
							+ "\n*9.* Now go to your google drive and create a new folder. Share this folder with \"client_email\". Open the folder and copy the folder-id from the URL to the 'Folder-Id' field below."
							+ "\n*10.* Open the JSON file and copy the \"private_key\" and \"client_email\" attributes in the following respective fields below"
						}
					},
					{
						"type": "input",
						"block_id": "inp4",
						"element": {
							"type": "plain_text_input",
							"action_id": "sl_input_4",
							"placeholder": {
								"type": "plain_text",
								"text": "Folder-Id"
							}
						},
						"label": {
							"type": "plain_text",
							"text": "Folder-Id"
						}
					},
					{
						"type": "input",
						"block_id": "inp1",
						"element": {
							"type": "plain_text_input",
							"action_id": "sl_input_1",
							"placeholder": {
								"type": "plain_text",
								"text": "Private Key"
							}
						},
						"label": {
							"type": "plain_text",
							"text": "Private Key"
						},
						"hint": {
							"type": "plain_text",
							"text": "Paste \"private_key\" from the JSON file"
						}
					},
					{
						"type": "input",
						"block_id": "inp2",
						"element": {
							"type": "plain_text_input",
							"action_id": "sl_input_2",
							"placeholder": {
								"type": "plain_text",
								"text": "Client Email"
							}
						},
						"label": {
							"type": "plain_text",
							"text": "Client Email"
						},
						"hint": {
							"type": "plain_text",
							"text": "Paste \"client_email\" from the JSON file"
						}
					},
					{
						"type": "input",
						"block_id": "inp3",
						"element": {
							"type": "plain_text_input",
							"action_id": "sl_input_3",
							"placeholder": {
								"type": "plain_text",
								"text": "Name for drive"
							}
						},
						"label": {
							"type": "plain_text",
							"text": "Name for drive"
						}
					}
				]
			}
		})
	}).then((res) => res)
	return resource
}

async function get_slack_file_list_for_channel(channel) {
    const resource = await fetch("https://slack.com/api/files.list?token="+process.env.ADMIN_TOKEN+"&channel="+channel+"&pretty=1", {
		method: 'GET'
	}).then(function (response) {
        return response.json();
	})
		.then(function (json) {
            return json
		});
	return resource
}

module.exports.bot = bot;
module.exports.bot_id = bot_id;
module.exports.get_slack_resource_from_url = get_slack_resource_from_url;
module.exports.get_json_data_from_url = get_json_data_from_url;
module.exports.delete_file_from_slack = delete_file_from_slack;
module.exports.open_modal = open_modal;
module.exports.get_slack_file_list_for_channel= get_slack_file_list_for_channel
