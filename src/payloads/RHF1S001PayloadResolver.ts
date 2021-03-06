import  { RHF1S001Payload } from "./RHF1S001Payload";
import  { BitUtils } from "../utils/utils";

export class RHF1S001PayloadResolver {
    public resolve(payload: String): RHF1S001Payload {
        let rHF1S001Payload = new RHF1S001Payload();
        let charArrPayload = payload.split("");

        let status = parseInt(charArrPayload[0] + charArrPayload[1], 16);
        rHF1S001Payload.status = status;

        let temp = parseInt(charArrPayload[4] + charArrPayload[5] + charArrPayload[2] + charArrPayload[3], 16);
        rHF1S001Payload.teplota = ((175.72 * temp) / Math.pow(2, 16)) - 46.85;

        let hum = parseInt(charArrPayload[6] + charArrPayload[7] , 16);
        rHF1S001Payload.vlhkost = ((125 * hum) / Math.pow(2, 8)) - 6;

        let period = parseInt(charArrPayload[10] + charArrPayload[11] + charArrPayload[8] + charArrPayload[9], 16);
        rHF1S001Payload.period = period * 2;

        let rssi = parseInt(charArrPayload[12] + charArrPayload[13], 16);
        rHF1S001Payload.rssi = rssi - 180;

        let snr = parseInt(charArrPayload[14] + charArrPayload[15], 16);
        rHF1S001Payload.snr = snr / 4;

        let batt = parseInt(charArrPayload[16] + charArrPayload[17], 16);
        rHF1S001Payload.battery = (batt + 150) * 0.01;

        return rHF1S001Payload;
    }
}