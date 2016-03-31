import soap from 'soap';
import { Activity, singleS3StreamInput } from 'astronomer-aries';
import { parseString } from 'xml2js';
import promisify from 'es6-promisify';

export default class HobsonsConnectSource extends Activity {
    static props = {
        name: require('../package.json').name,
        version: require('../package.json').version
    };

    constructor() {
        super();
        this.client = null;
    }

    async onTask(activityTask, config) {
        await this.createClient(config.url);
    }

    createClient(url) {
        return new Promise((resolve, reject) => {
            const client = soap.createClient(url, (err, client) => {
                if (err) {
                    return reject(err);
                }

                this.client = client;
                resolve();
            });
        });
    }

    // Returns array of json objects with with each object describing the attribute type, name, etc.
    getAllAttributes(config) {
        return new Promise((resolve, reject) => {
            const args = { ClientName: config.clientName, PassKey: config.passKey };
            this.client.GetAllAttributes(args, async (err, result, raw, soapHeader) => {
                if (err) {
                    return reject(err);
                }

                const xml = result.GetAllAttributesResult;
                const parseStringAsync = promisify(parseString);
                const jsonResult = await parseStringAsync(xml);
                resolve(jsonResult.result.returndata[0].attributes[0].attribute);
            });
        });
    }

    getContactCount(config) {
        return new Promise((resolve, reject) => {
            const args = { ClientName: config.clientName, PassKey: config.passKey };
            this.client.GetContactCount(args, async (err, result, raw, soapHeader) => {
                if (err) {
                    return reject(err);
                }

                const xml = result.GetContactCountResult;
                const parseStringAsync = promisify(parseString);
                const jsonResult = await parseStringAsync(xml);
                resolve(jsonResult.result.count);
            });
        });
    }

    getAllContacts(config) {
        return new Promise(async (resolve, reject) => {
            const count = await this.getContactCount(config);
            const attributesArray = await this.getAllAttributes(config);
            const attrs = this.attributesXmlFromJsonArray(attributesArray);
            const args = {
                ClientName: config.clientName,
                PassKey: config.passKey,
                StartingRecord: config.startingRecord,
                EndingRecord: 2,
                SearchCriteriaXml: config.searchCriteriaXml,
                AttributesXml: attrs,
                OrderByXml: config.orderByXml
            };

            this.log.info(attrs);

            this.client.GetContacts(args, async (err, result, raw, soapHeader) => {
                if (err) {
                    return reject(err);
                }

                const xml = result.GetContactsResult;
                const parseStringAsync = promisify(parseString);
                const jsonResult = await parseStringAsync(xml);
                this.log.info(jsonResult);
                resolve(jsonResult);
            })
        });
    }

    attributesXmlFromJsonArray(jsonArray) {
        let attributesXmlString = '<attributes>';
        for (let i = 0, l = jsonArray.length; i < l; i++) {
            const attribute =  jsonArray[i];
            if (attribute.type[0] === 'attribute') {
                attributesXmlString += `<attribute><name>${attribute.name}</name></attribute>`;
            }
        }
        attributesXmlString += '</attributes>';
        return attributesXmlString;
    }
};

