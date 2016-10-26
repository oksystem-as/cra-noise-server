/// <reference path="../_all.d.ts" />

import * as Lokijs from "lokijs";
import { DeviceInfo, LastRecord } from "./DeviceInfoValue";

export namespace DBLoki {

    export const DB = new Lokijs("example.db");
    export const deviceData = DB.addCollection<DeviceInfo>("deviceData");
    export const lastData = DB.addCollection<LastRecord>("lastData", { unique: ["devEUI"] });
}
