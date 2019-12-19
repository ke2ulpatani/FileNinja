require('dotenv').config();
const nock = require("nock");
var controller = require('../controller/export_controller.js');
var expect = require('chai').expect;
var assert = require('chai').assert;
var AWS = require('aws-sdk-mock');

// Load mock data
const data = require("../mock.json")

describe('testExport', function () {
    this.timeout(5000);
    beforeEach(function () {
        nock("https://slack.com/api")
            .persist()
            .log(console.log)
            .post('/chat.postMessage')
            .reply(200, { ok: true })
    });

    it('it should fail to delete files from a category as the category does not exist', async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result_undefined);
            });

            var response = await controller.deleteCategoryFiles('mock1', data.watermarks[2]).then((res) => res);
            expect(response).to.equal('No category with the name mock1 exists')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it('it should successfully delete files from a category', async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
                callback(null, data.show_all_files_in_category_result);
            });
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result);
            });

            nock("https://slack.com/api")
                .persist()
                .log(console.log)
                .post('/files.delete')
                .reply(200, { ok: true })

            AWS.mock('DynamoDB.DocumentClient', 'delete', function (params, callback) {
                callback(null, true);
            });

            var response = await controller.deleteCategoryFiles('mock1', data.watermarks[2]).then((res) => res);
            expect(response).to.equal('Files of category mock1 have been deleted.')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it('it should fail to export files from a category to google drive as as the drive does not exist', async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_drive_result_undefined);
            });

            var response = await controller.exportCategory('mock1', 'mock_drive', data.watermarks[2]).then((res) => res);
            expect(response).to.equal("Google drive with name mock_drive doesn't exists. Try again with a valid drive name")
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


