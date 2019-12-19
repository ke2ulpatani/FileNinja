var category_service = require('../service/category_service');
var slack_bot_service = require('../service/slack_bot_service');
var bot = slack_bot_service.bot;

async function setCategory(category_name, data) {
	var response = await category_service.setCategory(category_name, data.channel).then((res) => res);
	bot.postMessage({"channel":data.channel, "text" :response});
	return response
}

async function getCategories(data) {
	var response = await category_service.getCategories(data.channel).then((res) => res);
	bot.postMessage({"channel":data.channel, "text" :response});
	return response
}

async function addFileToCategory(category_name, data) {
	var response = await category_service.addFileToCategory(category_name, data).then((res) => res);
	bot.postMessage({"channel":data.channel, "text" :response});
	return response
}

async function showFilesOfACategory(category_name, data) {
	var response = await category_service.showFilesOfACategory(category_name, data).then((res) => res);
	response.forEach(res => {
		var file = res.key + ": " + res.value;
		bot.postMessage({"channel":data.channel, "text" :file});
	});
	return response
}

async function exportDeleteCategory(category_name, storage_name, data, is_export) {
	var response = await category_service.exportDeleteCategory(category_name, storage_name, data, is_export).then((res) => res);
	bot.postMessage({"channel":data.channel, "text" :response});
	return response
}

module.exports.setCategory = setCategory;
module.exports.getCategories = getCategories;
module.exports.addFileToCategory = addFileToCategory;
module.exports.showFilesOfACategory = showFilesOfACategory;
module.exports.exportDeleteCategory = exportDeleteCategory;
