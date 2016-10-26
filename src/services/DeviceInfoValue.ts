export class Result {
    _meta: Meta;
    records: Array<DeviceInfo>;

    constructor(records: Array<DeviceInfo>) {
        this._meta = { status: "SUCCESS", count: records.length };
        this.records = Array<DeviceInfo>(records.length);
        records.forEach((element, index) => {
            this.records[index] = new DeviceInfo(element);
        });
    }
}

export interface Meta {
    status: string;
    count: number;
}

export class DeviceInfo {

    createdAt: string;
    devEUI: string;
    fPort: number;
    fCntUp: number;
    aDRbit: number;
    fCntDn: number;
    payloadHex: string;
    micHex: string;
    lrrRSSI: string;
    lrrSNR: string;
    spFact: number;
    subBand: string;
    channel: string;
    devLrrCnt: number;
    lrrid: string;
    lrrLAT: string;
    lrrLON: string;
    lrrs: Array<Irrs>;

    constructor(deviceInfo: DeviceInfo) {
        this.createdAt = deviceInfo.createdAt;
        this.devEUI = deviceInfo.devEUI;
        this.fPort = deviceInfo.fPort;
        this.fCntUp = deviceInfo.fCntUp;
        this.aDRbit = deviceInfo.aDRbit;
        this.fCntDn = deviceInfo.fCntDn;
        this.payloadHex = deviceInfo.payloadHex;
        this.micHex = deviceInfo.micHex;
        this.lrrRSSI = deviceInfo.lrrRSSI;
        this.lrrSNR = deviceInfo.lrrSNR;
        this.spFact = deviceInfo.spFact;
        this.subBand = deviceInfo.subBand;
        this.channel = deviceInfo.channel;
        this.devLrrCnt = deviceInfo.devLrrCnt;
        this.lrrid = deviceInfo.lrrid;
        this.lrrLAT = deviceInfo.lrrLAT;
        this.lrrLON = deviceInfo.lrrLON;
        this.lrrs = deviceInfo.lrrs;
    }
}

export interface Irrs {
    Lrrid: string;
    LrrRSSI: string;
    LrrSNR: string;
}

export interface LastRecord {
    devEUI: string;
    createdAt: Date;
}