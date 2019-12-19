var slack_bot_service = require('./slack_bot_service');

var storage_limit_dbservice = require("../dbservice/storage_limit_dbservice.js")
const delay = require('delay');

async function updateAlertSizeForChannel(size, data) {
	
	try {
		if (isNaN(size)) {
			throw "Please enter a number for storage size(in GB)."
		} else {
			temp_size = parseFloat(size);
			if (temp_size > 5.0) {
				throw "Error. Size limit cannot be more than 5.0"
			} else {
                
                var channel_exists = await storage_limit_dbservice.getAlertSize(data.channel).
                then((res) => {
                    if (typeof res.Item != 'undefined') {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                
                if (!channel_exists) {
                    var newCurrentSize = await totalFileSizeByChannel(data.channel).then((res) => {return res;});
                    if (newCurrentSize == -1) {
                        return "Failed updating alert limit size 1";
                    }
                    var updateDB = await storage_limit_dbservice.setCurrentSize(data.channel, newCurrentSize).then((res) => {return res;});
                    if (!updateDB) {
                        return "Failed updating alert limit size 2";
                    } 
                }
                
                let response = await storage_limit_dbservice.setAlertSize(data.channel, size).then((res) => {return res;});
                    if (response) {
                        return "New Alert Limit has been set to " + parseFloat(size) + " GB.";
                    } else {
                        return "Failed updating alert limit size";
                    }
			}
		}
	}
	catch (err) {
		console.log("Error Occurred: ", err);
		return err;
	}
}

async function getAlertSizeforChannel(channel) {
	var current_alert_size = await storage_limit_dbservice.getAlertSize(channel).
		then((res) => {
			if (typeof res.Item != 'undefined') {
				return "Current alert limit is " + parseFloat(res.Item.limit_size) + " GB";
			}
			else {
				return "No alert limit has been set for this channel.";
			}
		});
        
    return current_alert_size;
}

async function getCurrentSizeforChannel(channel) {
	var current_alert_size = await storage_limit_dbservice.getCurrentSize(channel).
		then((res) => {
			if (typeof res.Item != 'undefined') {
				return "Current size is " + parseFloat(res.Item.current_size) + " GB";
			}
			else {
				return "Can't get the current size for current channel, please set an alert limit for this channel first.";
			}
		});
        
    return current_alert_size;
}


async function totalFileSizeByChannel(channel) {
    
    // await slack_bot_service.slack.getFilesList({ "channel": channel})
    var files = await slack_bot_service.get_slack_file_list_for_channel(channel)
                    .then(function(answer){
                        return Promise.resolve(answer.files);
                    })
                    .catch(function(err){
                        console.log('DID NOT GET FILES LIST:',err);
                        return -1;
                    });

    if (files == -1) {
        return -1;
    }

    var totalSize = 0;
    for( var file in files) {
        totalSize +=  parseInt(files[file].size);
    }

    totalSize /= 1000000000;

    return totalSize

    
}

async function deleteActivity(channel) {
    var underLimit = true;
    var currentAlertSize = await storage_limit_dbservice.getAlertSize(channel).then((res) => {return res;});
    if (typeof currentAlertSize.Item != 'undefined') {
        await delay(30000);
        var newCurrentSize = await totalFileSizeByChannel(channel).then((res) => {return res;});
        if (newCurrentSize == -1) {
            return [false,underLimit];
        }
        if (parseFloat(newCurrentSize) > parseFloat(currentAlertSize.Item.limit_size)) {
            underLimit = false
        }
        
        var updateDB = await storage_limit_dbservice.setCurrentSize(channel, newCurrentSize).then((res) => {return res;});
    
        if (!updateDB) {
            return [false, underLimit];
        }
        return [true, underLimit, newCurrentSize, currentAlertSize.Item.limit_size];
    }
    return [false, underLimit]
    
}

async function uploadActivity(channel) {
    var underLimit = true;
    var currentAlertSize = await storage_limit_dbservice.getAlertSize(channel).then((res) => {return res;});
    if (typeof currentAlertSize.Item != 'undefined') {
        await delay(30000);
        var newCurrentSize = await totalFileSizeByChannel(channel).then((res) => {return res;});
        console.log("New currentsize: "+ newCurrentSize);
        if (newCurrentSize == -1) {
            console.log("inside this if");
            return [false,underLimit];
        }
        if ( parseFloat(newCurrentSize) > parseFloat(currentAlertSize.Item.limit_size)) {
            underLimit = false
        }
        var updateDB = await storage_limit_dbservice.setCurrentSize(channel, newCurrentSize).then((res) => {return res;});
        if (!updateDB) {
            return [false, underLimit];
        }
        return [true, underLimit, newCurrentSize, currentAlertSize.Item.limit_size];
    }
    return [false, underLimit] 
}


module.exports.updateAlertSizeForChannel = updateAlertSizeForChannel;
module.exports.getAlertSizeforChannel = getAlertSizeforChannel;
module.exports.getCurrentSizeforChannel = getCurrentSizeforChannel;
module.exports.deleteActivity = deleteActivity;
module.exports.uploadActivity = uploadActivity;