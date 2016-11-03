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
        let start: string = req.date.value;

        let startDate: Date;
        if (start !== undefined && start !== null) {
            startDate = DateUtils.getDayFlatDate(new Date(start));
        }

        let resultData;
        if (startDate !== undefined && startDate !== null) {
            resultData = this.getData(devEUI, startDate);
        } else {
            resultData = this.getAllData(devEUI);
        }

        res.end(JSON.stringify({devEUI: devEUI, statistics: resultData}));
    }

    private getData(devEUI: string, date: Date) {
        let startDate = new Date(date);
        startDate.setDate(startDate.getDate() + 1);
        let lastMonthDate = new Date(startDate);
        lastMonthDate.setDate(lastMonthDate.getDate() - 30);
        let lastWeekDate = new Date(startDate);
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        let resultLast30 = this.statisticsData.chain().where((data) => data.devEUI === devEUI
                                                                    && data.statisType === StatisType.DAY24
                                                                    && data.time <= startDate
                                                                    && data.time >= lastMonthDate)
                                                      .data()
                                                      .map(data => {
                                                        return {time: data.time, logAverange: data.logAverange };
                                                      });

        let resultDay24 = this.statisticsData.chain().where((data) => data.devEUI === devEUI
                                                                   && data.statisType === StatisType.DAY24
                                                                   && data.time <= startDate
                                                                   && data.time > date);
        let resultDay622 = this.statisticsData.chain().where((data) => data.devEUI === devEUI
                                                                    && data.statisType === StatisType.DAY6_22
                                                                    && data.time <= startDate
                                                                    && data.time > date);
        let resultDay1822 = this.statisticsData.chain().where((data) => data.devEUI === devEUI
                                                                     && data.statisType === StatisType.DAY18_22
                                                                     && data.time <= startDate
                                                                     && data.time > date);
        let resultNight226 = this.statisticsData.chain().where((data) => {
            if (data.devEUI === devEUI && data.statisType === StatisType.NIGHT22_6) {
                console.log(data.time);
            }
                                                                      return data.devEUI === devEUI
                                                                      && data.statisType === StatisType.NIGHT22_6
                                                                      && data.time <= startDate
                                                                      && data.time > date; });
        let resultData = [];
        this.transformToResultData(resultDay24.data()).forEach(value => resultData.push(value));
        this.transformToResultData(resultDay622.data()).forEach(value => resultData.push(value));
        this.transformToResultData(resultDay1822.data()).forEach(value => resultData.push(value));
        this.transformToResultData(resultNight226.data()).forEach(value => resultData.push(value));

        if (resultLast30.length > 0) {
            let avgValueLast30 = StatisticsUtils.resolveLogAverange(resultLast30);
            resultData.push({ type: StatisType.MONTH, avgValues: [ { date: lastMonthDate, avgValue: avgValueLast30 } ] });

            let resultLast7 = resultLast30.filter(value => value.time >= lastWeekDate);
            let avgValueLast7 = StatisticsUtils.resolveLogAverange(resultLast7);
            resultData.push({ type: StatisType.WEEK, avgValues: [ { date: lastWeekDate, avgValue: avgValueLast7 } ] });
        }

        return resultData;
    }

    private getAllData(devEUI: string) {
        let result = this.statisticsData.chain().where((data) => data.devEUI === devEUI);
        return this.transformToResultData(result.data());
    }

    private transformToResultData(result: any[]): any[] {
        let resultMap = Observable.from(result)
                            .groupBy(data => data.statisType)//.filter((value, index) => value.key === StatisType.MONTH)
                            .map(data => {
                                let avgValues = data.map(it => { return { date: it.time, avgValue: it.logAverange }; });
                                return { type: data.key, avgValues: avgValues };
                            });

        let resultData = [];
        resultMap.forEach(value => {
            let avgValues = [];
            value.avgValues.forEach(avgValue => {
                let date: Date = avgValue.date;
                let dateSrt = date.toLocaleDateString() + "T" + date.toLocaleTimeString();
                console.log("**********************************************************************");
                console.log(date);
                console.log(date.toDateString());
                console.log(date.toTimeString());
                console.log(date.toLocaleDateString());
                console.log(date.toLocaleTimeString());
                console.log(date.toString());
                console.log(dateSrt);
                console.log("**********************************************************************");
                avgValues.push({ date: dateSrt, avgValue: avgValue.avgValue });
            });
            let statRes = { type: value.type, avgValues: avgValues };
            resultData.push(statRes);
        });
        return resultData;
    }
}

export default StatisticsInfoService;