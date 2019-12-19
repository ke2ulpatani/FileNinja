var export_service = require('../service/export_service');
var slack_bot_service = require('../service/slack_bot_service');
var bot = slack_bot_service.bot;

async function deleteCategoryFiles(category_name, data) {
	var response = await export_service.deleteCategoryFiles(category_name, data).then((res) => res);
	bot.postMessage({"channel":data.channel, "text" :response});
	return response
}

async function openModalToRegisterGoogleDrive(trigger_id) {
	await slack_bot_service.open_modal(trigger_id).then((res) => res);
}

async function exportCategory(category_name, drive_name, data) {
	var response = await export_service.exportCategory(category_name, drive_name, data).then((res) => res);
	bot.postMessage({"channel":data.channel, "text" :response});
	return response
}

module.exports.deleteCategoryFiles = deleteCategoryFiles;
module.exports.exportCategory = exportCategory;
module.exports.openModalToRegisterGoogleDrive = openModalToRegisterGoogleDrive;
