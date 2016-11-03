/// <reference path="../_all.d.ts" />

import "rxjs";
import { Observable } from "rxjs/Observable";
import { DBLoki } from "./BDLoki";
import { Result, DeviceInfo, StatisticsInfo } from "./DeviceInfoValue";
import { StatisticsUtils, StatisType } from "../utils/statis-utils";
import { ServerResponse } from "http";
import { DateUtils } from "../utils/utils";

class StatisticsInfoService {

    private statisticsData: LokiCollection<StatisticsInfo>;

    constructor() {
        this.statisticsData = DBLoki.statisticsData;
    }

    rootGET(req: any, res: ServerResponse, next: any) {
        res.setHeader("Content-Type", "application/json");

        let devEUI: string = req.devEUI.value;
        let dateStr: string = req.date.value;

        let date: Date;
        if (dateStr !== undefined && dateStr !== null) {
            date = DateUtils.getDayFlatDate(new Date(dateStr));
        }

        let resultData;
        if (date !== undefined && date !== null) {
            resultData = this.getData(devEUI, date);
        } else {
            resultData = this.getAllData(devEUI);
        }

        res.end(JSON.stringify({devEUI: devEUI, statistics: resultData}));
    }

    private getData(devEUI: string, date: Date) {
        let lastMonthDate = new Date(date);
        lastMonthDate.setDate(lastMonthDate.getDate() - 30);
        let lastWeekDate = new Date(date);
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        console.warn(date);
        console.warn(lastMonthDate);
        console.warn(lastWeekDate);
        let resultLast30 = this.statisticsData.chain().where((data) => data.devEUI === devEUI
                                                                    && data.statisType === StatisType.DAY24
                                                                    && data.time <= date
                                                                    && data.time >= lastMonthDate)
                                                      .data()
                                                      .map(data => {
                                                        return {time: data.time, logAverange: data.logAverange };
                                                      });

        let resultDay24 = this.statisticsData.chain().where((data) =>
                                     data.devEUI === devEUI
                                     && data.statisType === StatisType.DAY24
                                     && DateUtils.getDayFlatDate(new Date(data.time)) >= date
                                     && DateUtils.getDayFlatDate(new Date(data.time)) <= date);
        let resultDay622 = this.statisticsData.chain().where((data) =>
                                     data.devEUI === devEUI
                                     && data.statisType === StatisType.DAY6_22
                                     && DateUtils.getDayFlatDate(new Date(data.time)) >= date
                                     && DateUtils.getDayFlatDate(new Date(data.time)) <= date);
        let resultDay1822 = this.statisticsData.chain().where((data) =>
                                     data.devEUI === devEUI
                                     && data.statisType === StatisType.DAY18_22
                                     && DateUtils.getDayFlatDate(new Date(data.time)) >= date
                                     && DateUtils.getDayFlatDate(new Date(data.time)) <= date);
        let resultNight226 = this.statisticsData.chain().where((data) =>
                                     data.devEUI === devEUI
                                     && data.statisType === StatisType.NIGHT22_6
                                     && DateUtils.getDayFlatDate(new Date(data.time)) >= date
                                     && DateUtils.getDayFlatDate(new Date(data.time)) <= date);
        let resultData = [];
        this.transformToResultData(resultDay24.data()).forEach(value => resultData.push(value));
        this.transformToResultData(resultDay622.data()).forEach(value => resultData.push(value));
        this.transformToResultData(resultDay1822.data()).forEach(value => resultData.push(value));
        this.transformToResultData(resultNight226.data()).forEach(value => resultData.push(value));
/*
        if (resultLast30.length > 0) {
            let avgValueLast30 = StatisticsUtils.resolveLogAverange(resultLast30);
            resultData.push({ type: StatisType.MONTH, avgValues: [ { date: lastMonthDate, avgValue: avgValueLast30 } ] });

            let resultLast7 = resultLast30.filter(value => value.time >= lastWeekDate);
            let avgValueLast7 = StatisticsUtils.resolveLogAverange(resultLast7);
            resultData.push({ type: StatisType.WEEK, avgValues: [ { date: lastWeekDate, avgValue: avgValueLast7 } ] });
        }
*/
        return resultData;
    }

    private getAllData(devEUI: string) {
        let result = this.statisticsData.chain().where((data) => data.devEUI === devEUI);
        return this.transformToResultData(result.data());
    }

    private transformToResultData(result: StatisticsInfo[]): any[] {
        let resultMap = Observable.from(result)
                            .groupBy(data => data.statisType)
                            .map(data => {
                                let avgValues = data.map(it => { return { date: it.time, avgValue: it.logAverange,
                                                                          isComplete: it.isComplete, count: it.count }; });
                                return { type: data.key, avgValues: avgValues };
                            });

        let resultData = [];
        resultMap.forEach(value => {
            let avgValues = [];
            value.avgValues.forEach(avgValue => {
                let date: Date = avgValue.date;
                let dateSrt = date.toLocaleDateString() + "T" + date.toLocaleTimeString();
                avgValues.push({ date: dateSrt, avgValue: avgValue.avgValue, isComplete: avgValue.isComplete, count: avgValue.count });
            });
            let statRes = { type: value.type, avgValues: avgValues };
            resultData.push(statRes);
        });
        return resultData;
    }
}

export default StatisticsInfoService;