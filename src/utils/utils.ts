import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from "rxjs/Observable";
import { GroupedObservable } from "rxjs/operator/groupBy";
import { Payload, PayloadType } from "../payloads/payload";
import "rxjs/Rx";

export class BitUtils {
    static flagbit1: number = 1;    // 2^^0    000...00000001
    static flagbit2: number = 2;    // 2^^1    000...00000010
    static flagbit3: number = 4;    // 2^^2    000...00000100
    static flagbit4: number = 8;    // 2^^3    000...00001000
    static flagbit5: number = 16;   // 2^^4    000...00010000
    static flagbit6: number = 32;   // 2^^5    000...00100000
    static flagbit7: number = 64;   // 2^^6    000...01000000
    static flagbit8: number = 128;  // 2^^7    000...10000000

    static flagbits: number[] = [BitUtils.flagbit1, BitUtils.flagbit2, BitUtils.flagbit3,
                                 BitUtils.flagbit4, BitUtils.flagbit5, BitUtils.flagbit6,
                                 BitUtils.flagbit7, BitUtils.flagbit8];

    static isBitOn(vstup: number, position: number): boolean {
        let num = this.flagbits[position];
        return (vstup & num) === num;
    }
}

export class DateUtils {
    public static HOUR_IN_MILIS = 3600000;
    public static DAY_IN_MILIS = DateUtils.HOUR_IN_MILIS * 24;

    public static isBetween_dayInterval(date: Date, startDate: Date): boolean {
        let createdAt = date.getTime();
        let min = startDate.getTime();
        let max = startDate.getTime() + DateUtils.DAY_IN_MILIS;
        let isBetween = min <= createdAt && createdAt < max;

        return isBetween;
    }

    public static isBetween_dayIntervalFromMidnight(date: Date, startDate: Date): boolean {
        let createdAt = date.getTime();
        let min = DateUtils.getDayFlatDate(startDate).getTime();
        let max = DateUtils.getDayFlatDate(startDate).getTime() + DateUtils.DAY_IN_MILIS;
        let isBetween = min <= createdAt && createdAt < max;

        return isBetween;
    }

    /**
     * ocekavanzy format je 2016-10-04T07:55:32+0000
     */
    public static parseDate(dateStr: string): Date {
        // dateStr = "2016-10-04T07:55:32+0000"

        // 2016-10-04 , 07:55:32+0000
        var a = dateStr.split("T");

        // 2016, 10, 04 
        var d: string[] = a[0].split("-");

        // 07:55:32 , 0000
        var time: string[] = a[1].split("+");

        // 07, 55, 32 
        var t: string[] = time[0].split(":");

        // 0000
        var tMilis: string = time[1];

        // "+"" znamena prevod na cislo
        let dateUTC = new Date();
        dateUTC.setUTCFullYear(+d[0]);
        dateUTC.setUTCMonth(+d[1] - 1);
        dateUTC.setUTCDate(+d[2]);
        dateUTC.setUTCHours(+t[0]);
        dateUTC.setUTCMinutes(+t[1]);
        dateUTC.setUTCSeconds(+t[2]);
        dateUTC.setUTCMilliseconds(+tMilis);
        return dateUTC;
    }

    public static getWeek(date: Date) {
        var onejan = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    };

    public static isDay(date: Date): boolean {
        return 6 <= date.getHours() && date.getHours() < 22;
    }

    public static isHours18_22(date: Date): boolean {
        return 18 <= date.getHours() && date.getHours() < 22;
    }

    public static get18_22FlatDate(date: Date): Date {
        date.setHours(18);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getDayNightFlatDate(date: Date): Date {
        if (DateUtils.isDay(date)) {
            date.setHours(6);
        } else {
            date.setHours(22);
        }
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getHourFlatDate(date: Date): Date {
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getDayFlatDate(date: Date): Date {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getWeekFlatDate(date: Date): Date {
        var startOfWeek = date.getDate() - date.getDay() + 1;
        date.setDate(startOfWeek);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getMonthFlatDate(date: Date): Date {
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }


    public static getyearFlatDate(date: Date): Date {
        date.setMonth(1);
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

     public static getMidnight(date: Date): Date {
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date;
    }

    public static dateToString(date: Date): string {
        let dateSrt = this.twoDigits(date.getFullYear()) + "-" + this.twoDigits(date.getMonth() + 1) + "-" + this.twoDigits(date.getDate()) + "T" +
                        this.twoDigits(date.getHours()) + ":" + this.twoDigits(date.getMinutes()) + ":" + this.twoDigits(date.getSeconds());
        return dateSrt;
    }

    public static twoDigits(num: number): string {
        if (num < 10) {
            return "0" + num;
        }
        return num.toString();
    }
}

export class ObjectUtils {

    private isEquivalent(a: any, b: any) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }

    public static deepCopyArr(array: any[]): any[] {
        var out = [];
        for (var i = 0, len = array.length; i < len; i++) {
            var item: any[] = array[i];
            var obj = {};
            for (var k in item) {
                if (item.hasOwnProperty(k)) {
                    obj[k] = ObjectUtils.deepCopy(item[k], null);
                }
            }
            out.push(obj);
        }
        return out;
    }

    public static deepCopy(from: any, to: any) {
        // console.log("deepCopy", from);
        // console.log(from, to);
        if (from == null || typeof from != "object") {
            // console.log("prvni");
            return from;
        }
        if (!(from instanceof Object) && !(from instanceof Array)) {
            // console.log("druhy");
            return from;
        }
        if (from instanceof Date) {
            // console.log("treti Date");
            return new Date(from);
        }
        // TODO i ostani objekty
        if (from instanceof RegExp || from instanceof Function ||
            from instanceof String || from instanceof Number || from instanceof Boolean) {
            throw "Ne vsechny objekty momentalne umim klonovat ... :( ) objekt: " + from;
            // return this.newInstance(from, from);
        }

        // console.log("ctvrty - ", from);

        to = to || Object.create(from);
        // console.log("4te to ", to);
        for (var name in from) {
            if (from.hasOwnProperty(name)) {
                to[name] = typeof to[name] == "undefined" ? ObjectUtils.deepCopy(from[name], null) : to[name];
            }
        }

        return to;
    }
}