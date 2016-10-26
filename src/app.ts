/// <reference path="_all.d.ts" />
"use strict";

import * as swaggerTools from "swagger-tools";
import * as jsYaml from "js-yaml";
import * as fs from "fs";
import * as express from "express";
import { SaveStatistics } from "./services/SaveStatistics";
import { LoadDevideConfig, CRaApiConfig } from "./Config";
import * as winston from "winston";
var expressWinston = require("express-winston");
require("console-winston")();

namespace UpdateCache {
  export let devEUIs: string[];

  export function updateCache() {
    //let loadDeviceInfo = new LoadDeviceInfo();
    //loadDeviceInfo.updateAll(devEUIs);
  }
}

class Server {

  public app: express.Application;

  public static bootstrap(): Server {
    return new Server();
  }

  constructor() {
    //create expressjs application
    this.app = express();
    /*
    this.loggerConfig();

    this.app.use((req, res, next) => {
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    this.configCache();
    this.routes();
    */
    let loadStatistics = new SaveStatistics();
    loadStatistics.loadAll(["0004A30B0019D0EA"]);
  }

  private configCache() {
    var config = fs.readFileSync("config.yaml", "UTF-8");
    var cacheConfig = jsYaml.safeLoad(config);
    if (cacheConfig.token !== undefined && cacheConfig.token !== null) {
      CRaApiConfig.token = cacheConfig.token;
    }
    UpdateCache.devEUIs = cacheConfig.devEUIs;

    UpdateCache.updateCache();
    setInterval(function() {
      try {
        UpdateCache.updateCache();
      } catch (error) {
        console.error(error);
      }
    }, LoadDevideConfig.updateInterval);
  }

  private routes() {
    var spec = fs.readFileSync("docs/swagger.yaml", "UTF-8");
    var swaggerDoc = jsYaml.safeLoad(spec);
    swaggerTools.initializeMiddleware(swaggerDoc, middleware => {
      // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
      this.app.use(middleware.swaggerMetadata());

      // Validate Swagger requests
      this.app.use(middleware.swaggerValidator());

      // Route validated requests to appropriate controller
      this.app.use(middleware.swaggerRouter({ controllers: "dist/routers" }));

      // Serve the Swagger documents and Swagger UI
      this.app.use(middleware.swaggerUi());
     });
  }

  private loggerConfig() {
    let logger = new winston.Logger({ transports: [ new winston.transports.Console({ json: true, colorize: true }) ] });

    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
      //level: "debug",
      colorize: true
    });

    this.app.use(expressWinston.logger({
      transports: [ new winston.transports.Console({ json: true, colorize: true }) ],
      meta: true, // optional: control whether you want to log the meta data about the request (default to true) 
      msg: "HTTP {{req.method}} {{req.url}}",
      expressFormat: true,
      colorize: true
    }));
  }
}

var server = Server.bootstrap();
export = server.app;