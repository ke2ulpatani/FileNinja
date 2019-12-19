var storage_limit_service = require('../service/storage_limit_service');
var slack_bot_service = require('../service/slack_bot_service');
var bot = slack_bot_service.bot;

async function setAlertSize(size, data) {
	var response = await storage_limit_service.updateAlertSizeForChannel(size, data).then((res) => res);
    bot.postMessage({"channel":data.channel, "text" :response});
    return response
}

async function getAlertSize(data) {
	var response = await storage_limit_service.getAlertSizeforChannel(data.channel).then((res) => res);
    bot.postMessage({"channel":data.channel, "text" :response});
    return response
}

async function getCurrentSize(data) {
	var response = await storage_limit_service.getCurrentSizeforChannel(data.channel).then((res) => res);
    bot.postMessage({"channel":data.channel, "text" :response});
    return response
}

async function listenForFileActivity(data) {
    if (data.type == 'file_deleted') {
        var response = await storage_limit_service.deleteActivity(data.channel_ids[0]).then((res) => res);
        if (response[0]) {
            if (!response[1]) {
                bot.postMessage(data.channel_ids[0], "Total current file size has gone above the alert limit. ")
            } 
            return
        } else {
            console.log("Error deleting file from db")
            return
        }
    } else if (data.upload == true) {
        var response = await storage_limit_service.uploadActivity(data.channel).then((res) => res);
        if (response[0]) {
            if (!response[1]) {
                bot.postMessage({"channel":data.channel, "text" :"Total current file size has gone above the alert limit. "});
            }
            return
        } else {
            console.log("Error uploading file metdata to db")
            return
        }

    }

}

module.exports.setAlertSize = setAlertSize;
module.exports.getAlertSize = getAlertSize;
module.exports.getCurrentSize = getCurrentSize;
module.exports.listenForFileActivity = listenForFileActivity;