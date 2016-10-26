/// <reference path="../_all.d.ts" />

import * as Lokijs from "lokijs";
import { StatisticsInfo } from "./DeviceInfoValue";

export namespace DBLoki {

    export const DB = new Lokijs("example.db");
    export const statisticsData = DB.addCollection<StatisticsInfo>("statisticsData");
}
