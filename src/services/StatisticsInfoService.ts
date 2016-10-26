/// <reference path="../_all.d.ts" />

import "rxjs";
import { Observable } from "rxjs/Observable";
import { DBLoki } from "./BDLoki";
import { Result, DeviceInfo, StatisticsInfo } from "./DeviceInfoValue";
import { StatisType } from "../utils/statis-utils";
import { ServerResponse } from "http";

class StatisticsInfoService {

    private statisticsData: LokiCollection<StatisticsInfo>;

    constructor() {
        this.statisticsData = DBLoki.statisticsData;
    }

    rootGET(req: any, res: ServerResponse, next: any) {
        res.setHeader("Content-Type", "application/json");

        let devEUI: string = req.devEUI.value;
        let start: string = req.date.value;

        let startDate: Date;
        if (start !== undefined && start !== null) {
            startDate = new Date(start);
        }

        let result = this.statisticsData.chain().where((data) => data.devEUI === devEUI);
        let resultMap = Observable.from(result.data())
                            .groupBy(data => data.statisType)
                            .map(data => {
                                let avgValues = data.map(it => { return { date: it.time, avgValue: it.logAverange }; });
                                return { type: data.key, avgValues: avgValues };
                            });

        let resultData = [];
        resultMap.forEach(value => {
            let avgValues = [];
            value.avgValues.forEach(avgValue => avgValues.push({ date: avgValue.date, avgValue: avgValue.avgValue }) );
            let statRes = { type: value.type, avgValues: avgValues };
            resultData.push(statRes);
        });

        res.end(JSON.stringify({devEUI: devEUI, statistics: resultData}));
    }
}

export default StatisticsInfoService;