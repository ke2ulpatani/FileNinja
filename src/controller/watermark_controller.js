var watermark_service = require('../service/watermark_service');
var file_upload_service = require('../service/file_upload_service');
var utils_service = require('../service/utils_service');
var slack_bot_service = require('../service/slack_bot_service');

var fs = require('fs');
var PDFLib = require('pdf-lib');
var Jimp = require('jimp');
var PDFDocument = PDFLib.PDFDocument;
var bot = slack_bot_service.bot

async function init(command, data) {
	var bot_response = ""
	if (command[1] == 'register') {
		if (typeof data.files == 'undefined') {
			bot_response = "No file associated with command. Upload a PNG file with command to create watermark."
		}
		else if (data.files.length > 1) {
			bot_response = "Only one file should be associated with the command. Upload only one file to create watermark."
		}
		else if (utils_service.get_file_extension(data.files[0].name) == 'png') {
			if (command.length == 3) {
				bot_response = await watermark_service.register_watermark(command[2], data.files[0].url_private, data.channel)
			}
			else {
				// Provide a name for this watermark
				bot_response = "Please Provide a name for this watermark"
			}
		}
		else {
			// Wrong format. Only accept .png
			bot_response = "Wrong format for file . Watermark only accepts .png files"
		}

	}
	else if (command[1] == 'text') {
		if (typeof data.files == 'undefined') {
			bot_response = "No file associated with command. Upload a PDF file with command watermark the file."
		}
		else if (command.length == 3) {
			bot_response = await watermark_files(data, command)
		}
		else {
			// Provide a text for this watermark
			bot_response = "Please Provide a text for this watermark."
		}
	}
	else if (command[1] == 'list') {
		bot_response = await watermark_service.get_all_watermarks(data.channel)
	}
	else if (command.length == 2) {
		if (typeof data.files == 'undefined') {
			bot_response = "No file associated with command. Upload a PDF file with command watermark the file."
		}
		else {
			bot_response = await watermark_files(data, command)
		}
	}
	bot.postMessage({"channel":data.channel, "text" :bot_response});
	return bot_response
}

async function watermark_files(data, command) {
	if (watermark_service.check_if_all_pdf(data)) {
		for (i = 0; i < data.files.length; i++) {
			f = data.files[i]
			upload_status = await watermark(f.url_private, command, data).then(async (water_marked_file) => {
				fs.writeFileSync("temp_files/temp_" + f.name, water_marked_file);
				status = await file_upload_service.upload_file_via_bot("temp_files/temp_" + f.name, "watermark_" + f.name, data.channel)
					.then((res) => {
						return res
					});
				return status
			});
			if (!upload_status) {
				return ('Something went wrong. Try again')
			}
		}
		utils_service.fileCleanUp("temp_files")
		return ('File watermarked successfully.');
	}
	else {
		return ('Wrong format. All files must be of PDF format')
	}
}

async function watermark(url, command, data) {
	if (command[1] == 'text') {
		return await text_watermark_Pdf(url, command[2])
	}
	else {
		return await image_watermark_PDF(url, command[1], data.channel)
	}
}

async function image_watermark_PDF(pdf_url, watermark_name, channel_name) {
	var url = pdf_url
	pdfBytes = {}
	var existingPdfBytes = await slack_bot_service.get_slack_resource_from_url(url)

	var pdfDoc = await PDFDocument.load(existingPdfBytes).catch(function (error) {
		console.log(error);
	});
	var pngUrl = await watermark_service.get_watermark(watermark_name, channel_name).then((res) => res)
	var pngImageBytes = await slack_bot_service.get_slack_resource_from_url(pngUrl)

	await Jimp.read(pngImageBytes)
		.then(async (image) => {
			await image.opacity(0.1).getBufferAsync(Jimp.MIME_PNG).then(async (im) => {
				var pngImage = await pdfDoc.embedPng(im)
				var pngDims = pngImage.scale(0.5)

				var pages = pdfDoc.getPages()
				pages.forEach(page => {

					page.drawImage(pngImage, {
						x: page.getWidth() / 2 - pngDims.width / 2,
						y: page.getHeight() / 2 - pngDims.height / 2,
						width: pngDims.width,
						height: pngDims.height
					})
				})
				pdfBytes = await pdfDoc.save()
			});
		})
	return pdfBytes;
}

async function text_watermark_Pdf(pdf_url, watermark_text) {
	var url = pdf_url
	pdfBytes = {}
	var existingPdfBytes = await slack_bot_service.get_slack_resource_from_url(url)

	var pdfDoc = await PDFDocument.load(existingPdfBytes).catch(function (error) {
		console.log(error);
	});
	var pages = pdfDoc.getPages()

	var image = new Jimp(pages[0].getWidth(), pages[0].getHeight(), (err, image) => {
		if (err) throw err
	})

	var message = watermark_text
	var x = pages[0].getWidth() / 2 - (watermark_text.length * pages[0].getWidth() / 36)
	var y = pages[0].getHeight() / 2

	await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
		.then(async (font) => {
			await image.print(font, x, y, message).opacity(0.3).getBufferAsync(Jimp.MIME_PNG).then(async (im) => {
				var pngImage = await pdfDoc.embedPng(im)
				var pngDims = pngImage.scale(1)

				pages.forEach(page => {
					page.drawImage(pngImage, {
						x: page.getWidth() / 2 - pngDims.width / 2,
						y: page.getHeight() / 2 - pngDims.height / 2,
						width: pngDims.width,
						height: pngDims.height
					})
				})
				pdfBytes = await pdfDoc.save()
			});
		})
	return pdfBytes;
}

module.exports.init = init;