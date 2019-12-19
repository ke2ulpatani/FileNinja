var export_dbservice = require('../dbservice/export_dbservice')
var drive_dbservice = require('../dbservice/drive_dbservice');
var db_service = require('../dbservice/category_dbservice')
var slack_bot_service = require('./slack_bot_service');
var utils_service = require('./utils_service');
const fs = require('fs');
const { google } = require('googleapis');
var mime = require('mime-types');
const drive = google.drive('v3');

async function exportCategory(category_name, drive_name, data) {
	var key = await drive_dbservice.getDrive(drive_name).then((res) => { return res; });
	if (typeof key == 'undefined') {
		return ('Google drive with name ' + drive_name + " doesn't exists. Try again with a valid drive name")
	}
	return new Promise((resolve, reject) => {
		const jwtClient = new google.auth.JWT(
			key.client_email,
			null,
			key.private_key.replace(/\\n/g, '\n'),
			['https://www.googleapis.com/auth/drive'],
			null
		);
		jwtClient.authorize(async (authErr) => {
			if (authErr) {
				console.log(authErr);
				reject(authErr)
			}
			var message = await exporting(category_name, data, key, jwtClient).then((res) => res)
			resolve(message)
		});
	})
}

async function deleteCategoryFiles(category_name, data) {
	try {
		var items = [];
		var category_exists = await utils_service.checkIfCategoryExists(category_name, data.channel);
		if (category_exists == false) {
			return "No category with the name " + category_name + " exists";
		}
		else {
			var files = await db_service.get_files(category_name, data.channel).then((res) => {
				res.Items.forEach(file => {
					items.push(file.file_id);
				});
				return Promise.resolve(items);
			});

			var i = 0;
			for (i = 0; i < files.length; i++) {
				await slack_bot_service.delete_file_from_slack("https://slack.com/api/files.delete", files[i]).
					then((res) => res);
				await export_dbservice.delete_file_record(files[i]).then((res) => res);
			}
			await export_dbservice.delete_category_record(category_name, data.channel).then((res) => res);

			return "Files of category " + category_name + " have been deleted.";
		}
	} catch (err) {
		console.log("Error Occurred: ", err);
		return err;
	}
}

async function create_folder(category_name, key, jwtClient) {
	var folder_id = ""
	var fileMetadata = {
		'name': category_name,
		'mimeType': 'application/vnd.google-apps.folder',
		'parents': [key.access_folder_id]
	};
	await drive.files.create({
		auth: jwtClient,
		resource: fileMetadata,
		fields: 'id'
	}).then(function (response) {
		folder_id = response.data.id
		console.log('Folder created Successfully:', response.data.id);
	})
		.catch(function (err) {
			console.log('Failed to create folder:', err);
		});
	return folder_id
}

async function exporting(category_name, data, key, jwtClient) {
	try {
		var items = [];
		var category_exists = await utils_service.checkIfCategoryExists(category_name, data.channel);
		if (category_exists == false) {
			return "No category with the name '" + category_name + "' exists";
		}
		else {
			var files = await db_service.get_files(category_name, data.channel).then((res) => {
				res.Items.forEach(file => {
					var x = { "url": file.file_url, "id": file.file_id, "name": file.file_name, "type": file.file_type }
					items.push(x);
				});
				return Promise.resolve(items);
			});

			var folder_id = await create_folder(category_name, key, jwtClient).then((fid) => fid)
			var i = 0;
			for (i = 0; i < files.length; i++) {
				const buffer = await slack_bot_service.get_slack_resource_from_url(files[i]["url"])
				var local_path = "temp_files/" + files[i]["name"]
				var name = files[i]["name"]
				var file_type = files[i]["type"]
				var file_id = files[i]["id"]
				fs.writeFileSync(local_path, new Buffer(buffer));
				var fileMetadata = {
					'name': name,
					parents: [folder_id]
				};
				var mime_type = mime.lookup(file_type);
				var media = {
					mimeType: mime_type,
					body: fs.createReadStream(local_path)
				};
				await drive.files.create({
					auth: jwtClient,
					resource: fileMetadata,
					media: media,
					fields: 'id'
				}).then(function (response) {
					console.log('Exported Successfully:', response.data.id);
				})
					.catch(function (err) {
						console.log('Failed to export:', err);
					});
				await slack_bot_service.delete_file_from_slack("https://slack.com/api/files.delete",
					file_id).then((res) => res);
				await export_dbservice.delete_file_record(file_id).then((res) => res);
			}
			await export_dbservice.delete_category_record(category_name, data.channel).then((res) => res);
			utils_service.fileCleanUp("temp_files")

			return "Files of category '" + category_name + "' have been exported.";
		}
	} catch (err) {
		console.log("Error Occurred: ", err);
		return err;
	}
}

module.exports.deleteCategoryFiles = deleteCategoryFiles;
module.exports.exportCategory = exportCategory;
