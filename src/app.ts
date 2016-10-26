/// <reference path="_all.d.ts" />
"use strict";

import * as swaggerTools from "swagger-tools";
import * as jsYaml from "js-yaml";
import * as fs from "fs";
import * as express from "express";
import { LoadDeviceInfo } from "./services/LoadDeviceInfo";
import { LoadDevideConfig, CRaApiConfig } from "./Config";
import * as winston from "winston";
var expressWinston = require("express-winston");
require("console-winston")();

import { CRaService } from "./services/CRaService";
import { DeSenseNoisePayloadResolver } from "./payloads/DeSenseNoisePayloadResolver";
import { Payload, PayloadType } from "./payloads/payload";
import { StatisticsUtils, StatisType } from "./utils/statis-utils";
import { DateUtils } from "./utils/utils";
import { Sensor } from "./entity/sensor";

namespace UpdateCache {
  export let devEUIs: string[];

  export function updateCache() {
    let loadDeviceInfo = new LoadDeviceInfo();
    loadDeviceInfo.updateAll(devEUIs);
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
    let devEUI = "0004A30B0019D0EA";
    let cRaService = new CRaService();
    let promise = cRaService.getDeviceInfo(devEUI, 10000);

    promise.then((result) => {
      let res = new DeSenseNoisePayloadResolver();
      let sensor = new Sensor();
      sensor.devEUI = devEUI;
      sensor.payloadType = PayloadType.DeSenseNoise;
      result.records.forEach((value) => {
        let payload = res.resolve(value.payloadHex);
        payload.createdAt = DateUtils.parseDate(value.createdAt);
        payload.payloadType = sensor.payloadType;
        sensor.payloads.push(payload);
      });
      StatisticsUtils.resolveLogAverangeListEvent(sensor, StatisType.DAY24).subscribe(list => {
        console.log("resolveLogAverangeListEvent", list);
      });
    });
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