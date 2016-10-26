/// <reference path="../_all.d.ts" />

import StatisticsInfoService from "../services/StatisticsInfoService";

let statisticsInfoService = new StatisticsInfoService();

export function rootGET(req: any, res: any, next: any) {
    return statisticsInfoService.rootGET(req.swagger.params, res, next);
}