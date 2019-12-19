require('dotenv').config();
const nock = require("nock");
var controller = require('../controller/storage_limit_controller.js');
var utils_service = require('../service/utils_service');
var expect = require('chai').expect;
var AWS = require('aws-sdk-mock');

// Load mock data
const data = require("../mock.json")

describe('testStorageLimit', function () {
  this.timeout(5000);
  beforeEach(function () {
    nock("https://slack.com/api")
      .persist()
      .log(console.log)
      .post('/chat.postMessage')
      .reply(200, { ok: true })
  });

  it('it should return a message for setting a storage limit', async function () {
    try {
      AWS.mock('DynamoDB.DocumentClient', 'update', function (params, callback) {
        callback(null, true);
      });
      AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
        callback(null, data.dynamoDB.storage);
      });
      nock("https://slack.com/api")
        .log(console.log)
        .post('/files.list')
        .query({ token: 'xoxb-775571702198-775695559382-MSox8rQEc2qhmuGa9wz3JiNJ', channel: "DNTLFGPE2", pretty: 1 })
        .reply(200, { ok: true })

      var response = await controller.setAlertSize("3.5", data.watermarks[1]).then((res) => res);
      expect(response).to.equal('New Alert Limit has been set to 3.5 GB.')
      AWS.restore('DynamoDB.DocumentClient');
    }
    catch (e) {
      console.log(e)
      assert.fail()
    }
  });

  it('it should return a message for providing incorrect size format', async function () {
    try {
      var response = await controller.setAlertSize("six", data.watermarks[1]).then((res) => res);
      expect(response).to.equal('Please enter a number for storage size(in GB).')
    }
    catch (e) {
      console.log(e)
      assert.fail()
    }
  });

  it('it should return an error message for setting limit greater than 5', async function () {
    try {
      var response = await controller.setAlertSize("6", data.watermarks[1]).then((res) => res);
      expect(response).to.equal('Error. Size limit cannot be more than 5.0')
    }
    catch (e) {
      console.log(e)
      assert.fail()
    }
  });

  it('it should return a message for current storage limit', async function () {
    try {
      AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
        callback(null, data.dynamoDB.storage);
      });
      var response = await controller.getAlertSize(data.watermarks[0]).then((res) => res);
      expect(response).to.equal('Current alert limit is 3.5 GB');
      AWS.restore('DynamoDB.DocumentClient');
    }
    catch (e) {
      console.log(e)
      assert.fail()
    }
  });
  afterEach(function () {
    nock.cleanAll()
  })
});


