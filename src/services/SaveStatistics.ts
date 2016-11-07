import { DBLoki } from "./BDLoki";
import { Observable } from "rxjs/Observable";
import { CRaService } from "./CRaService";
import { DeSenseNoisePayloadResolver } from "../payloads/DeSenseNoisePayloadResolver";
import { PayloadType } from "../payloads/payload";
import { StatisticsUtils, StatisType, Statistic } from "../utils/statis-utils";
import { DateUtils } from "../utils/utils";
import { Sensor } from "../entity/sensor";
import { Result, StatisticsInfo } from "./DeviceInfoValue";

/**
 * Provede načtení dat senzorů, 
 * spočtení statistik 
 * a uložení statistik do DB
 */
export class SaveStatistics {

    private statisticsData: LokiCollection<StatisticsInfo>;

    constructor() {
        this.statisticsData = DBLoki.statisticsData;
    }

    loadAll(devEUIs: string[], mock: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let devEUIsComplete = Array<string>();
            devEUIs.forEach(devEUI => {
                this.load(devEUI, mock).then((result) => {
                    if (devEUIsComplete.find((valeu) => valeu === result) == null) {
                        devEUIsComplete.push(result);
                    }
                    if (devEUIsComplete.length == devEUIs.length) {
                        resolve(true);
                    }
                });
            });
        });
    }

    load(devEUI: string, mock: boolean): Promise<string> {
        console.log("Počítám statistiku pro: " + devEUI);
        let cRaService = new CRaService();
        let promise = cRaService.getDeviceInfo(devEUI);

        return new Promise<string>((resolve, reject) => {
            promise.then((result) => {
                this.processResult(result, devEUI, mock);
                resolve(devEUI);
            });
        });
    }

    private processResult(result: Result, devEUI: string, mock: boolean) {
        let res = new DeSenseNoisePayloadResolver();
        let sensor = new Sensor();
        sensor.devEUI = devEUI;
        sensor.payloadType = PayloadType.DeSenseNoise;
        result.records.forEach((value) => {
            let payload;
            if (mock) {
                payload = { noise: Math.floor(((Math.random() * 100))),
                            battery: Math.floor(((Math.random() * 100))),
                            rssi: Math.floor(((Math.random() * 100))),
                            snr: Math.floor(((Math.random() * 100))) };
            } else {
                payload = res.resolve(value.payloadHex);
            }
            payload.createdAt = DateUtils.parseDate(value.createdAt);
            payload.payloadType = sensor.payloadType;
            sensor.payloads.push(payload);
        });
        this.processStatistics(sensor);
    }

    private processStatistics(sensor: Sensor) {
        StatisticsUtils.resolveLogAverangeListEvent(sensor, StatisType.HOUR).subscribe(list => {
            this.saveStatistics(list, sensor.devEUI, StatisType.HOUR);
            console.log("Hodinové statistiky spočítané.");
        });
        StatisticsUtils.resolveLogAverangeListEvent(sensor, StatisType.DAY6_22).subscribe(list => {
            this.saveStatistics(list, sensor.devEUI, StatisType.DAY6_22);
            console.log("Denní od 6 do 22 statistiky spočítané.");
        });
        StatisticsUtils.resolveLogAverangeListEvent(sensor, StatisType.DAY18_22).subscribe(list => {
            this.saveStatistics(list, sensor.devEUI, StatisType.DAY18_22);
            console.log("Denní od 18 do 22 statistiky spočítané.");
        });
        StatisticsUtils.resolveLogAverangeListEvent(sensor, StatisType.NIGHT22_6).subscribe(list => {
            this.saveStatistics(list, sensor.devEUI, StatisType.NIGHT22_6);
            console.log("Noční od 22 do 6 statistiky spočítané.");
        });
        StatisticsUtils.resolveLogAverangeListEvent(sensor, StatisType.DAY24).subscribe(list => {
            this.saveStatistics(list, sensor.devEUI, StatisType.DAY24);
            console.log("Denní statistiky spočítané.");
        });
        StatisticsUtils.resolveLogAverangeListEvent(sensor, StatisType.WEEK).subscribe(list => {
            this.saveStatistics(list, sensor.devEUI, StatisType.WEEK);
            console.log("Týdenní statistiky spočítané.");
        });
        StatisticsUtils.resolveLogAverangeListEvent(sensor, StatisType.MONTH).subscribe(list => {
            this.saveStatistics(list, sensor.devEUI, StatisType.MONTH);
            console.log("Měsíční statistiky spočítané.");
        });
    }

    private saveStatistics(statistics: Statistic[], devEUI: string, statisType: StatisType) {
        this.statisticsData.removeWhere((data) => data.devEUI === devEUI && data.statisType === statisType);
        statistics.forEach(statistic => {
            let time = statistic.time;
            let logAverange = statistic.logAverange;
            let isComplete = statistic.isComplete;
            let count = statistic.count;
            let stat: StatisticsInfo = { devEUI: devEUI, statisType: statisType, time, logAverange, isComplete, count };
            console.log("Ukládám statistiku: "
                                + "devEUI: " + stat.devEUI
                                + ", statisType: " + stat.statisType
                                + ", time: " + stat.time
                                + ", logAverange: " + stat.logAverange
                                + ", isComplete: " + stat.isComplete
                                + ", count: " + stat.count);
            this.statisticsData.insert(stat);
        });
    }
}