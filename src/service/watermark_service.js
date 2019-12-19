var watermark_dbservice = require('../dbservice/watermark_dbservice');
var utils_service = require('./utils_service');
var slack_bot_service = require('./slack_bot_service');

var bot = slack_bot_service.bot

async function register_watermark(name, url, channel) {
	obj = {
		name: name,
		channel: channel,
		url: url
	}
	var watermark_exists = await watermark_dbservice.get(name, channel).
		then((res) => {
			if (typeof res.Item != 'undefined') {
				return true;
			}
			else {
				return false
			}
		});
	if (watermark_exists == false) {
		var result = await watermark_dbservice.create(obj).then((res) => res)
		return result
	}
	else {
		return ('Watermark with name ' + name + " already exists")
	}
}

async function get_watermark(watermark_name, channel_name) {
	var watermark_image_url = await watermark_dbservice.get(watermark_name, channel_name).
		then((res) => {
			if (typeof res.Item != 'undefined') {
				return Promise.resolve(res.Item.url);
			}
			else {
				bot.postMessage({"channel":channel_name, "text" :'Could not find watermark with name ' + watermark_name + " and channel " + channel_name});
				return Promise.reject(new Error('Could not find the watermark'));
			}
		});
	return watermark_image_url
}

async function get_all_watermarks(channel_name) {
	var watermark_list = await watermark_dbservice.get_all(channel_name).
		then((res) => {
			if (res.Count > 0) {
				var list = res.Items.map(a => a.name);
				return Promise.resolve('Watermarks for this channel are: ' + list.join())
			}
			else {
				return Promise.resolve('No watermark registered');
			}
		});
	return watermark_list
}

function check_if_all_pdf(data) {
	var result = true
	data.files.forEach(f => {
		if (utils_service.get_file_extension(f.name) != 'pdf') {
			result = false
		}
	});
	return result
}

module.exports.get_watermark = get_watermark;
module.exports.get_all_watermarks = get_all_watermarks;
module.exports.register_watermark = register_watermark;
module.exports.check_if_all_pdf = check_if_all_pdf;