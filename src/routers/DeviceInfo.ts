/// <reference path="../_all.d.ts" />

import DeviceInfoService from "../services/DeviceInfoService";

let deviceInfoService = new DeviceInfoService();

export function rootGET(req: any, res: any, next: any) {
    return deviceInfoService.rootGET(req.swagger.params, res, next);
}