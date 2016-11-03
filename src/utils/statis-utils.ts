import { Observable } from "rxjs/Observable";
import { GroupedObservable } from "rxjs/operator/groupBy";
import "rxjs";
import { Payload, PayloadType } from "../payloads/payload";
import { DateUtils, ObjectUtils } from "./utils";
import { Sensor } from "../entity/sensor";
import { ARF8084BAPayload } from "../payloads/ARF8084BAPayload";
import { RHF1S001Payload } from "../payloads/RHF1S001Payload";
import { DeSenseNoisePayload } from "../payloads/DeSenseNoisePayload";

export enum StatisType {
    HOUR = <any>"HOUR",
    DAY6_22 = <any>"DAY6_22",
    DAY18_22 = <any>"DAY18_22",
    NIGHT22_6 = <any>"NIGHT22_6",
    DAY24 = <any>"DAY24",
    WEEK = <any>"WEEK",
    MONTH = <any>"MONTH",
}

export class Statistics {
    statisType: StatisType;
    statistic: Statistic[];
}

export class Statistic {
    time: Date;
    logAverange: number;
    isComplete: boolean;
    count: number;
}

/**
 * utility pro vypocet statistik
 */
export class StatisticsUtils {

    /**
     * Pro zadany list statistic spocita log prumer vsech hodnot.
     * napr. pokud chceme spocita prumer pro tyden, list bude obsahovat 7 statistik pro kazdy den v tydnu atp.
     * return log. prumer vsech hodnot
     */
    public static resolveLogAverange(daysStatistic: Statistic[]): number {
        let sumValue = 0;
        let count = daysStatistic.length;

        daysStatistic.forEach((statis) => {
            let powValue = Math.pow(10, statis.logAverange / 10);
            sumValue += powValue;
        });

        let logAverange = 10 * Math.log(sumValue / count) / Math.log(10);
        return logAverange;
    }

    /**
     * vstupni data roztridi dle intervalu zadaneho v parametru statisType
     * Vraci Observable, ktery obsahuje jen jednu eventu a to list vsech objektu obsahujici k danemu datu log. prumer
     * return Observable<{ time: Date, logAverange: number }>
     */
    public static resolveLogAverangeListEvent(data: Sensor, statisType: StatisType): Observable<Statistic[]> {
        return this.resolveLogAverangeObjEvents(data, statisType).toArray();
    }

    /**
     * vstupni data roztridi dle intervalu zadaneho v parametru statisType
     * Vraci Observable, kde eventy jsou objekty obsahujici k danemu datu log. prumer
     * return Observable<{ time: Date, logAverange: number }>
     */
    public static resolveLogAverangeObjEvents(data: Sensor, statisType: StatisType): Observable<Statistic> {
        return this.groupByTime(data, statisType).flatMap(group => group.toArray()).map(group => {
            let groupTime = group[0].createdAt;
            let sumValue = 0;
            let count = group.length;
            let isComplete = this.isComplete(group, statisType);
            if (!isComplete) {
                console.warn(groupTime);
                console.warn(data.devEUI);
                console.warn(statisType);
                console.warn("************************************************");
            }

            group.forEach((data) => {
                let powValue = Math.pow(10, this.getValue(data) / 10);
                sumValue += powValue;
            });

            let logAverange = 10 * Math.log(sumValue / count) / Math.log(10);

            return { time: groupTime, logAverange: logAverange, isComplete: isComplete, count: count };
        });
    }

    private static groupByTime(data: Sensor, statisType: StatisType): Observable<GroupedObservable<number, Payload>> {
        // musim provest deep copy listu a v nem obs. objektu jinak dochazi k modifikaci objektu napric streamy 
        switch (statisType) {
            case StatisType.HOUR: {
                // log.debug('hodinovy prumer: ');
                return RxUtils.groupByHours(ObjectUtils.deepCopyArr(data.payloads));
            }
            case StatisType.DAY6_22: {
                // log.debug('denni 6-22 prumer: ');
                return RxUtils.groupByDay(ObjectUtils.deepCopyArr(data.payloads));
            }
            case StatisType.DAY18_22: {
                // log.debug('denni 18-22 prumer: ');
                return RxUtils.groupBy18_22(ObjectUtils.deepCopyArr(data.payloads));
            }
            case StatisType.NIGHT22_6: {
                // log.debug('nocni 22-6 prumer: ');
                return RxUtils.groupByNight(ObjectUtils.deepCopyArr(data.payloads));
            }
            case StatisType.DAY24: {
                // log.debug('denni 24h prumer: ');
                return RxUtils.groupByDays(ObjectUtils.deepCopyArr(data.payloads));
            }
            case StatisType.WEEK: {
                // log.debug('tydeni prumer: ');
                return RxUtils.groupByWeek(ObjectUtils.deepCopyArr(data.payloads));
            }
            case StatisType.MONTH: {
                // log.debug('mesicni prumer: ');
                return RxUtils.groupByMonth(ObjectUtils.deepCopyArr(data.payloads));
            }
            default: throw "Nepodporovany typ statistiky: " + statisType;
        }
    }

    private static isComplete(payload: Payload[], statisType: StatisType): boolean {
        let intervalMeasurementS = 5 * 60;
        let requiredMeasurement = 0.65;
        let statisticInterval;
        switch (statisType) {
            case StatisType.HOUR: {
                statisticInterval = (60 * 60);
                break;
            }
            case StatisType.DAY6_22: {
                statisticInterval = (16 * 60 * 60);
                break;
            }
            case StatisType.DAY18_22: {
                statisticInterval = (4 * 60 * 60);
                break;
            }
            case StatisType.NIGHT22_6: {
                statisticInterval = (8 * 60 * 60);
                break;
            }
            case StatisType.DAY24: {
                statisticInterval = (24 * 60 * 60);
                break;
            }
            case StatisType.WEEK: {
                statisticInterval = (7 * 24 * 60 * 60);
                break;
            }
            case StatisType.MONTH: {
                statisticInterval = (30 * 24 * 60 * 60);
                break;
            }
            default: throw "Nepodporovany typ statistiky: " + statisType;
        }
        let totalMeas = statisticInterval / intervalMeasurementS;
        let reqMeas = totalMeas * requiredMeasurement;
        if (payload.length < Math.round(reqMeas)) {
            console.warn("************************************************");
            console.warn(Math.round(reqMeas));
            console.warn(payload.length);
        }
        return payload.length >= Math.round(reqMeas);
    }

    private static getValue(payload: Payload): number {

        if (payload.payloadType == PayloadType.ARF8084BA) {
            return (payload as ARF8084BAPayload).temp;
        }

        if (payload.payloadType == PayloadType.RHF1S001) {
            return (payload as RHF1S001Payload).teplota;
        }

        if (payload.payloadType == PayloadType.DeSenseNoise) {
            return (payload as DeSenseNoisePayload).noise;
        }
    }
}

export class RxUtils {

    public static groupByHours(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).groupBy(
            data => {
                return DateUtils.getHourFlatDate(data.createdAt).getTime();
            },
            data => {
                data.createdAt = DateUtils.getHourFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByDays(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).groupBy(
            data => {
                return DateUtils.getDayFlatDate(data.createdAt).getTime();
            },
            data => {
                data.createdAt = DateUtils.getDayFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByMonth(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).groupBy(
            data => {
                return DateUtils.getMonthFlatDate(data.createdAt).getTime();
            },
            data => {
                data.createdAt = DateUtils.getMonthFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByWeek(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).groupBy(
            data => {
                return DateUtils.getWeekFlatDate(data.createdAt).getTime();
            },
            data => {
                data.createdAt = DateUtils.getWeekFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByDay(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).filter(data => {
            return DateUtils.isDay(data.createdAt);
        }).groupBy(
            data => {
                return DateUtils.getDayNightFlatDate(data.createdAt).getTime();
            },
            data => {
                data.createdAt = DateUtils.getDayNightFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByNight(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).filter(data => {
            return !DateUtils.isDay(data.createdAt);
        }).groupBy(
            data => {
                return DateUtils.getDayNightFlatDate(data.createdAt).getTime();
            },
            data => {
                data.createdAt = DateUtils.getDayNightFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupBy18_22(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).filter(data => {
            return DateUtils.isHours18_22(data.createdAt);
        }).groupBy(
            data => {
                return DateUtils.get18_22FlatDate(data.createdAt).getTime();
            },
            data => {
                data.createdAt = DateUtils.get18_22FlatDate(data.createdAt);
                return data;
            });
        return source;
    }
}