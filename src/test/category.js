require('dotenv').config();
const nock = require("nock");
var controller = require('../controller/category_controller.js');
var expect = require('chai').expect;
var assert = require('chai').assert;
var AWS = require('aws-sdk-mock');

// Load mock data
const data = require("../mock.json")

describe('testCategory', function () {
    this.timeout(5000);
    beforeEach(function () {
        nock("https://slack.com/api")
            .persist()
            .log(console.log)
            .post('/chat.postMessage')
            .reply(200, { ok: true })
    });

    it('it should fail to register the category as a category with same name exists', async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result);
            });

            var response = await controller.setCategory('mock1', data.watermarks[2]).then((res) => res);
            expect(response).to.equal('Category with name mock1 already exists in this channel')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it('it should register the category successfully', async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback) {
                callback(null, "successfully put item in database");
            });
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result_undefined);
            });

            var response = await controller.setCategory('mock1', data.watermarks[2]).then((res) => res);
            expect(response).to.equal('Category registered.')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it('it should show all the categories for a channel', async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
                callback(null, data.get_all_categories_result);
            });

            var response = await controller.getCategories(data.watermarks[2]).then((res) => res);
            expect(response).to.equal('Categories for this channel are: mock1,mock2,mock3')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it('it should show no category registered for the channel', async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
                callback(null, data.get_all_categories_result_zero);
            });

            var response = await controller.getCategories(data.watermarks[2]).then((res) => res);
            expect(response).to.equal('No category registered.')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it("it should fail to add file to category as category doesn't exist", async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result_undefined);
            });

            var response = await controller.addFileToCategory('mock1', data.watermarks[3]).then((res) => res);
            expect(response).to.equal('No category with the name mock1 exists')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it("it should add file to a category", async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result);
            });
            AWS.mock('DynamoDB.DocumentClient', 'batchWrite', function (params, callback) {
                callback(null, "Added successfully");
            });

            var response = await controller.addFileToCategory('mock1', data.watermarks[3]).then((res) => res);
            expect(response).to.equal('File added to category.')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it("it should fail to show files of a category as category doesn't exist", async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result_undefined);
            });

            var response = await controller.showFilesOfACategory('mock1', data.watermarks[3]).then((res) => res);
            expect(response[0].value).to.equal('No category with the name mock1 exists')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it("it should show all files of a category", async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result);
            });
            AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
                callback(null, data.show_all_files_in_category_result);
            });

            var response = await controller.showFilesOfACategory('mock1', data.watermarks[3]).then((res) => res);
            expect(response[0].key).to.equal('file1')
            expect(response[1].key).to.equal('file2')
            expect(response[2].key).to.equal('file3')
            AWS.restore('DynamoDB.DocumentClient');
        }
        catch (e) {
            console.log(e)
            assert.fail()
        }
    });

    it("it should show no files exist in a category", async function () {
        try {
            AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
                callback(null, data.get_category_result);
            });
            AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
                callback(null, data.show_all_files_in_category_result_zero);
            });

            var response = await controller.showFilesOfACategory('mock1', data.watermarks[3]).then((res) => res);
            expect(response[0].value).to.equal('No files found in mock1')
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


