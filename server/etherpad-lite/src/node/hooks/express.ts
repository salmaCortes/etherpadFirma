'use strict';

import {Socket} from "node:net";
import type {MapArrayType} from "../types/MapType";

import _ from 'underscore';
// @ts-ignore
import cookieParser from 'cookie-parser';
import events from 'events';
import express from 'express';
// @ts-ignore
import expressSession from '@etherpad/express-session';
import fs from 'fs';
const hooks = require('../../static/js/pluginfw/hooks');
import log4js from 'log4js';
const SessionStore = require('../db/SessionStore');
const settings = require('../utils/Settings');
const stats = require('../stats');
import util from 'util';
const webaccess = require('./express/webaccess');

import SecretRotator from '../security/SecretRotator';

let secretRotator: SecretRotator|null = null;
const logger = log4js.getLogger('http');
let serverName:string;
let sessionStore: { shutdown: () => void; } | null;
const sockets:Set<Socket> = new Set();
const socketsEvents = new events.EventEmitter();
const startTime = stats.settableGauge('httpStartTime');

exports.server = null;

const closeServer = async () => {
  if (exports.server != null) {
    logger.info('Closing HTTP server...');
    const p = util.promisify(exports.server.close.bind(exports.server))();
    await hooks.aCallAll('expressCloseServer');
    const timeout = setTimeout(async () => {
      logger.info(`Forcibly terminating remaining ${sockets.size} HTTP connections...`);
      for (const socket of sockets) socket.destroy(new Error('HTTP server is closing'));
    }, 5000);
    let lastLogged = 0;
    while (sockets.size > 0  && !settings.enableAdminUITests) {
      if (Date.now() - lastLogged > 1000) { // Rate limit to avoid filling logs.
        logger.info(`Waiting for ${sockets.size} HTTP clients to disconnect...`);
        lastLogged = Date.now();
      }
      await events.once(socketsEvents, 'updated');
    }
    await p;
    clearTimeout(timeout);
    exports.server = null;
    startTime.setValue(0);
    logger.info('HTTP server closed');
  }
  if (sessionStore) sessionStore.shutdown();
  sessionStore = null;
  if (secretRotator) secretRotator.stop();
  secretRotator = null;
};

exports.createServer = async () => {
  console.log('Report bugs at https://github.com/ether/etherpad-lite/issues');

  serverName = `Etherpad ${settings.getGitCommit()} (https://etherpad.org)`;

  console.log(`Your Etherpad version is ${settings.getEpVersion()} (${settings.getGitCommit()})`);

  await exports.restartServer();

  if (settings.ip === '') {
    console.log(`You can access your Etherpad instance using the Unix socket at ${settings.port}`);
  } else {
    console.log(`You can access your Etherpad instance at http://${settings.ip}:${settings.port}/`);
  }

  if (!_.isEmpty(settings.users)) {
    console.log(`The plugin admin page is at http://${settings.ip}:${settings.port}/admin/plugins`);
  } else {
    console.warn('Admin username and password not set in settings.json. ' +
                 'To access admin please uncomment and edit "users" in settings.json');
  }

  const env = process.env.NODE_ENV || 'development';

  if (env !== 'production') {
    console.warn('Etherpad is running in Development mode. This mode is slower for users and ' +
                 'less secure than production mode. You should set the NODE_ENV environment ' +
                 'variable to production by using: export NODE_ENV=production');
  }
};

exports.restartServer = async () => {
  await closeServer();

  const app = express(); // New syntax for express v3

  if (settings.ssl) {
    console.log('SSL -- enabled');
    console.log(`SSL -- server key file: ${settings.ssl.key}`);
    console.log(`SSL -- Certificate Authority's certificate file: ${settings.ssl.cert}`);

    const options: MapArrayType<any> = {
      key: fs.readFileSync(settings.ssl.key),
      cert: fs.readFileSync(settings.ssl.cert),
    };

    if (settings.ssl.ca) {
      options.ca = [];
      for (let i = 0; i < settings.ssl.ca.length; i++) {
        const caFileName = settings.ssl.ca[i];
        options.ca.push(fs.readFileSync(caFileName));
      }
    }

    const https = require('https');
    exports.server = https.createServer(options, app);
  } else {
    const http = require('http');
    exports.server = http.createServer(app);
  }

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "OPTIONS, HEAD, GET, POST, PUT, DELETE");


    if (settings.ssl) {
      res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    res.header('X-UA-Compatible', 'IE=Edge,chrome=1');

    if (settings.exposeVersion) {
      res.header('Server', serverName);
    }

    next();
  });

  if (settings.trustProxy) {
    app.enable('trust proxy');
  }

  app.use((req, res, next) => {
    const stopWatch = stats.timer('httpRequests').start();
    const sendFn = res.send.bind(res);
    res.send = (...args) => { stopWatch.end(); return sendFn(...args); };
    next();
  });

  if (!(settings.loglevel === 'WARN' && settings.loglevel === 'ERROR')) {
    app.use(log4js.connectLogger(logger, {
      level: log4js.levels.DEBUG.levelStr,
      format: ':status, :method :url',
    }));
  }

  const {keyRotationInterval, sessionLifetime} = settings.cookie;
  let secret = settings.sessionKey;
  if (keyRotationInterval && sessionLifetime) {
    secretRotator = new SecretRotator(
        'expressSessionSecrets', keyRotationInterval, sessionLifetime, settings.sessionKey);
    await secretRotator.start();
    secret = secretRotator.secrets;
  }
  if (!secret) throw new Error('missing cookie signing secret');

  app.use(cookieParser(secret, {}));

  sessionStore = new SessionStore(settings.cookie.sessionRefreshInterval);
  exports.sessionMiddleware = expressSession({
    propagateTouch: true,
    rolling: true,
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'express_sid',
    cookie: {
      maxAge: sessionLifetime || null,
      sameSite: 'None',  // SameSite debe ser configurado en 'None' para ser enviado desde un iframe
      secure: false,      // Debe estar en true para enviar la cookie a través de conexiones seguras (HTTPS)
    },
    
  });

  await hooks.aCallAll('expressPreSession', {app});
  app.use(exports.sessionMiddleware);

  app.use(webaccess.checkAccess);

  await Promise.all([
    hooks.aCallAll('expressConfigure', {app}),
    hooks.aCallAll('expressCreateServer', {app, server: exports.server}),
  ]);

  exports.server.on('connection', (socket:Socket) => {
    sockets.add(socket);
    socketsEvents.emit('updated');
    socket.on('close', () => {
      sockets.delete(socket);
      socketsEvents.emit('updated');
    });
  });

  await util.promisify(exports.server.listen).bind(exports.server)(settings.port, settings.ip);
  startTime.setValue(Date.now());
  logger.info('HTTP server listening for connections');
};

exports.shutdown = async (hookName:string, context: any) => {
  await closeServer();
};
