/// <reference path="_all.d.ts" />

export namespace LoadDevideConfig {
    /** První datum od kterého se načítají údaje ze senzotů */
    export const defautlStartDate = new Date("2016-01-01T00:00:00+0000");
    /** Limit kolik zaznamů se má vrátit v jednom dotazu na API ČRa */
    export const defautlLimit = 10000;
    /** Interval (v ms) po kterým se má kontrolovat aktuálnost cache. */
    export const updateInterval = 5 * 60 * 1000;
}

export namespace CRaApiConfig {

//  export const basePath = "http://hndocker.oksystem.local:58080";
    export const basePath = "https://api.pripoj.me/";

    export const deviceDetailBaseUrl = "/message/get/{devEUI}";
    export const limit = 10000 ;
    export let token = "kBPIDfNdSfk8fkATerBa6ct6yshdPbOX";
}