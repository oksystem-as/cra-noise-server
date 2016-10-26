import { DBLoki } from "./BDLoki";
import { Observable } from "rxjs/Observable";
import { CRaService } from "./CRaService";
import { DeSenseNoisePayloadResolver } from "../payloads/DeSenseNoisePayloadResolver";
import { PayloadType } from "../payloads/payload";
import { StatisticsUtils, StatisType } from "../utils/statis-utils";
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

    loadAll(devEUIs: string[]) {
        devEUIs.forEach(devEUI => this.load(devEUI));
    }

    load(devEUI: string) {
        let cRaService = new CRaService();
        let promise = cRaService.getDeviceInfo(devEUI);

        promise.then((result) => {
            this.processResult(result, devEUI);
        });
    }

    private processResult(result: Result, devEUI: string) {
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

    private saveStatistics(statistics: { time: Date, logAverange: number }[], devEUI: string, statisType: StatisType) {
        this.statisticsData.removeWhere((data) => data.devEUI === devEUI);
        statistics.forEach(statistic => {
            let time = statistic.time;
            let logAverange = statistic.logAverange;
            let stat: StatisticsInfo = { devEUI: devEUI, statisType: statisType, time, logAverange };
            console.log("Ukládám statistiku: "
                                + "devEUI: " + stat.devEUI
                                + ", statisType: " + stat.statisType
                                + ", time: " + stat.time
                                + ", logAverange: " + stat.logAverange);
            this.statisticsData.insert(stat);
        });
    }
}