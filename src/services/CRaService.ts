/// <reference path="../_all.d.ts" />

import { CRaApiConfig } from "../Config";
import { Result } from "./DeviceInfoValue";
import { Promise } from "es6-promise";
import request = require("request");

export class CRaService {
  private basePath = CRaApiConfig.basePath;
  private deviceDetailBaseUrl = CRaApiConfig.deviceDetailBaseUrl;
  private token = CRaApiConfig.token;

  /**    
   * @param devEUI ID čidla / zařízení.
   * @param token Slouží k autorizaci requestu a je unikátní pro každý soutěžní team. Pro jeho vygenerování kontaktujte ČRa.
   * @param limit Omezení počtu vypsaných záznamů. Hodnota musí být přirozeným číslem (1,2,3…N).
   * @param offset Posunutí prvního vypsaného záznamu o N záznamů. Hodnota musí být nezáporné celé číslo (0,1,2,3…N)
   * @param order Řazení záznamů dle časového razítka. Povolené hodnoty jsou asc nebo desc
   * @param start Omezení výpisu zpráv od konkrétního data. Formát 2016-01-01T01:50:50. Zprávy jsou ukládány v časovém pásmu Europe/Prague.
   * @param stop Omezení výpisu zpráv do konkrétního data. Formát 2016-01-01T01:50:50. Zprávy jsou ukládány v časovém pásmu Europe/Prague.
  */
  public getDeviceInfo(devEUI: string, limit?: number, start?: string, order?: string, offset?: number, stop?: string): Promise<Result> {
        const localVarPath = this.basePath + this.deviceDetailBaseUrl.replace("{" + "devEUI" + "}", String(devEUI));
        let queryParameters: any = {};

        // verify required parameter "devEUI" is not null or undefined
        if (devEUI === null || devEUI === undefined) {
            throw new Error("Required parameter devEUI was null or undefined when calling getDeviceInfo.");
        }

        // verify required parameter "token" is not null or undefined
        if (this.token === null || this.token === undefined) {
            throw new Error("Required parameter token was null or undefined when calling getDeviceInfo.");
        }

        if (this.token !== undefined) {
            queryParameters.token = this.token;
        }

        if (limit !== undefined) {
            queryParameters.limit = limit;
        }

        if (offset !== undefined) {
            queryParameters.offset = offset;
        }

        if (order !== undefined) {
            queryParameters.order = order;
        }

        if (start !== undefined) {
            queryParameters.start = start;
        }

        if (stop !== undefined) {
            queryParameters.stop = stop;
        }

        let requestOptions: request.CoreOptions & request.UrlOptions = {
            method: "GET",
            url: localVarPath,
            qs: queryParameters,
            json: true
        };

        return new Promise<Result>((resolve, reject) => {
            request(requestOptions, (error, response, body) => {
                if (error) {
                    console.error(error);
                    console.error(body);
                    reject(error);
                } else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve(body);
                    } else {
                        console.error(body);
                        reject(body);
                    }
                }
            });
        });
    }
}