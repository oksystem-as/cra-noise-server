import { BitUtils } from "../utils/utils";
import { Payload, PayloadType } from "./payload";

export enum Hemisphere {
    N, S, E, W
}

export class ARF8084BAPayload implements Payload {
    status: Status;
    temp: number;
    latitudeText: String;
    latitude: number;
    latitudeHemisphere: Hemisphere;
    longtitudeText: String;
    longtitude: number;
    longtitudeHemisphere: Hemisphere;
    uplinkFrameCounter: number;
    downlinkFrameCounter: number;
    batteryMSB: number;
    batteryLSB: number;
    rssi: number;
    snr: number;
    createdAt: Date;
    payloadType: PayloadType;
}

export class Status {
    tempInfoIsPresent: boolean;
    accelerometerWasTriggered: boolean;
    bTN1WasTriggered: boolean;
    gPSInfoIsPresent: boolean;
    upCounterIsPresent: boolean;
    downCounterIsPresent: boolean;
    batteryVoltageInformationIsPresent: boolean;
    rssiSNRInformationIsPresent: boolean;

    constructor(status: number) {
        this.tempInfoIsPresent = BitUtils.isBitOn(status, 7);
        this.accelerometerWasTriggered = BitUtils.isBitOn(status, 6);
        this.bTN1WasTriggered = BitUtils.isBitOn(status, 5);
        this.gPSInfoIsPresent = BitUtils.isBitOn(status, 4);
        this.upCounterIsPresent = BitUtils.isBitOn(status, 3);
        this.downCounterIsPresent = BitUtils.isBitOn(status, 2);
        this.batteryVoltageInformationIsPresent = BitUtils.isBitOn(status, 1);
        this.rssiSNRInformationIsPresent = BitUtils.isBitOn(status, 0);
    }
}