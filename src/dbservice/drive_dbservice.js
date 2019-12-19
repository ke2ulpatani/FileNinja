var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://dynamodb.us-east-1.amazonaws.com"
});

var table = "drive";

async function getDrive(drive_name) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: table,
        Key: {
            "drive_name": drive_name
        }
    };
    console.log("Getting drive")
    return await new Promise((resolve, reject) => {
        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read drive item. Error JSON:", JSON.stringify(err, null, 2));
                reject(-1);
            } else {
                console.log("Getting Drive Item succeeded:", JSON.stringify(data.Item, null, 2));
                resolve(data.Item);
            }
        })
    });
}

async function registerDrive(obj) {
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: table,
        Item: {
            "drive_name": obj.drive_name,
            "private_key": obj.private_key,
            "client_email": obj.client_email,
            "access_folder_id": obj.access_folder_id
        }
    };

    console.log("Adding a new item...");
    return await new Promise((resolve, reject) => {
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                var res = "Drive registered.";
                resolve(res);
            }
        });
    });
}
module.exports.getDrive = getDrive;
module.exports.registerDrive = registerDrive;
