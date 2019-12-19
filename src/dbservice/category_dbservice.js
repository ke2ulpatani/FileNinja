var AWS = require("aws-sdk");

var table = "category";
async function create(obj) {
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: table,
        Item: {
            "name": obj.name,
            "channel": obj.channel,
        }
    };

    console.log("Adding a new item...");
    return await new Promise((resolve, reject) => {
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                var res = "Category registered.";
                resolve(res);
            }
        });
    });
}

async function get(category_name, channel_name) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: table,
        Key: {
            "name": category_name,
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
        TableName: "category",
        IndexName: "ChannelIndex",
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
                console.log("Get Item succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        })
    });
}

async function add_file(data, channel_name, category_name) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var itemsArray = [];

    data.files.forEach(file => {
        var item = {
            PutRequest: {
                Item: {
                    "channel_id": channel_name,
                    "category_name": category_name,
                    "file_id": file.id,
                    "file_url": file.url_private,
                    "file_name": file.name,
                    "file_size": file.size,
                    "file_type": file.filetype
                }
            }
        };

        if (item) {
            itemsArray.push(item);
        }
    });

    var params = {
        RequestItems: {
            "files": itemsArray
        }
    };
    return await new Promise((resolve, reject) => {
        docClient.batchWrite(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                var res = "File added to category.";
                resolve(res);
            }
        });
    });
}

async function get_files(category_name, channel_name) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: "files",
        IndexName: "channel_id-category_name-index",
        KeyConditionExpression: "channel_id = :a AND category_name = :b",
        ExpressionAttributeValues: {
            ":a": channel_name,
            ":b": category_name
        }
    };
    return await new Promise((resolve, reject) => {
        docClient.query(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Get Item succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        })
    });
}

module.exports.create = create;
module.exports.get = get;
module.exports.get_all = get_all;
module.exports.add_file = add_file;
module.exports.get_files = get_files;