var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://dynamodb.us-east-1.amazonaws.com"
});

var table = "watermark";

async function create(create_obj) {
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: table,
        Item: {
            "name": create_obj.name,
            "channel": create_obj.channel,
            "url": create_obj.url
        }
    };

    console.log("Adding a new item...");
    return await new Promise((resolve, reject) => {
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                resolve("Watermark created successfully.");
            }
        });
    });
}

async function get(watermark_name, channel_name) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: table,
        Key: {
            "name": watermark_name,
            "channel": channel_name
        }
    };
    return await new Promise((resolve, reject) => {
        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        })
    });
}

async function get_all(channel_name) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: table,
        IndexName: "channel-name-index",
        KeyConditionExpression: "channel = :a",
        ExpressionAttributeValues: {
            ":a": channel_name
        }
    };
    return await new Promise((resolve, reject) => {
        docClient.query(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        })
    });
}

module.exports.create = create;
module.exports.get = get;
module.exports.get_all = get_all;