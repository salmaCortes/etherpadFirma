const settings = require('ep_etherpad-lite/node/utils/Settings');
const padManager = require("ep_etherpad-lite/node/db/PadManager");
const rateLimit = require("express-rate-limit");
const exportHandler = require('ep_etherpad-lite/node/handler/ExportHandler');
const importHandler = require('ep_etherpad-lite/node/handler/ImportHandler');
const absolutePaths = require('ep_etherpad-lite/node/utils/AbsolutePaths');
const fs = require("fs");
const log4js = require('log4js');

const importExportLogger = log4js.getLogger("ep_importexport"); //para nombrar al plugin creo

//ensure we have an apikey
var apikey = null;
const apikeyFilename = absolutePaths.makeAbsolute("./APIKEY.txt"); //tomamos la apiKey del usuario

//Configuración para leer la API key y validarla
try {
    apikey = fs.readFileSync(apikeyFilename, "utf8");
    importExportLogger.info(`Api key file read from: "${apikeyFilename}"`);
} catch(e) {
    importExportLogger.info(`Api key file "${apikeyFilename}" not found. importExport specific API are disabled`);
}

settings.importExportRateLimiting.onLimitReached = function(req, res, options) {
    // when the rate limiter triggers, write a warning in the logs
    importExportLogger.warn(`Import/Export rate limiter triggered on "${req.originalUrl}" for IP address ${req.ip}`);
}

const limiter = rateLimit(settings.importExportRateLimiting);

exports.expressCreateServer = function (hook_name, args, cb) {
    // handle export requests
    args.app.use('/importExport/:pad/:rev?/export/:type', limiter);
    args.app.get('/importExport/:pad/:rev?/export/:type', async function(req, res, next) {
        var types = ["pdf", "doc", "txt", "html", "odt", "etherpad"]; //configuración de los tipos de exportaciones para etherpad
        //send a 404 if we don't support this filetype
        if (types.indexOf(req.params.type) == -1) {
            return next();
        }

        // if abiword is disabled, and this is a format we only support with abiword, output a message
        if (settings.exportAvailable() == "no" &&
           ["odt", "pdf", "doc"].indexOf(req.params.type) !== -1) {
            importExportLogger.error(`Impossible to export pad "${req.params.pad}" in ${req.params.type} format. There is no converter configured`);

            // ACHTUNG: do not include req.params.type in res.send() because there is no HTML escaping and it would lead to an XSS
            res.send("This export is not enabled at this Etherpad instance. Set the path to Abiword or soffice (LibreOffice) in settings.json to enable this feature");
            return;
        }

        res.header("Access-Control-Allow-Origin", "*");

        const apiKeyParam = req.query.apikey || req.query.api_key;
        if (apiKeyParam !== apikey.trim()) {
            res.statusCode = 401;
            return res.send({ code: 4, message: 'no or wrong API Key', data: null });
        }

        let exists = await padManager.doesPadExists(req.params.pad);
        if (!exists) {
            importExportLogger.warn(`importExport tried to export a pad that doesn't exist (${req.params.pad})`);
            return next();
        }

        importExportLogger.info(`Exporting pad "${req.params.pad}" in ${req.params.type} format`);
        exportHandler.doExport(req, res, req.params.pad, req.params.type);
    });

    // handle import requests
    args.app.use('/importExport/:pad/import', limiter);
    args.app.post('/importExport/:pad/import', async function(req, res, next) {
        if (!(await padManager.doesPadExists(req.params.pad))) {
            importExportLogger.warn(`importExport tried to import into a pad that doesn't exist (${req.params.pad})`);
            return next();
        }

        const apiKeyParam = req.query.apikey || req.query.api_key;
        if (apiKeyParam !== apikey.trim()) {
            res.statusCode = 401;
            return res.send({ code: 4, message: 'no or wrong API Key', data: null });
        }

        importHandler.doImport(req, res, req.params.pad);
    });
}