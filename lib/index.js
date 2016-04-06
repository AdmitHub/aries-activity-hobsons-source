import soap from 'soap';
import { Activity, singleS3FileOutput } from 'aries-data';
import { parseString } from 'xml2js';
import promisify from 'es6-promisify';
import indexOf from 'lodash.indexof';
import forEach from 'lodash.foreach';
import has from 'lodash.has';
import find from 'lodash.find';

export default class HobsonsConnectSource extends Activity {
    static props = {
        name: require('../package.json').name,
        version: require('../package.json').version
    };

    constructor() {
        super();
        this.client = null;
    }

    @singleS3FileOutput()
    async onTask(activityTask, config) {
        await this.createClient(config.url);
        const allContacts = await this.getFilterContactsByFilterId(config);
        return allContacts.join('\n');
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

    getAllFilters(config) {
        return new Promise((resolve, reject) => {
            const args = { ClientName: config.clientName, PassKey: config.passKey };
            this.client.GetAllFilters(args, async (err, result, raw, soapHeader) => {
                if (err) {
                    return reject(err);
                }

                const xml = result.GetAllFiltersResult;
                const parseStringAsync = promisify(parseString);
                const jsonResult = await parseStringAsync(xml);
                this.log.info(jsonResult.result.returndata[0].filters[0].length);
                resolve(jsonResult.result.returndata[0].filters);
            });
        });
    }

    getFilterContactsByFilterId(config) {
        return new Promise(async (resolve, reject) => {
            let attributes = config.attributes;
            const attributesArray = await this.getAllAttributes(config);
            const attrsXml = this.attributesXmlFromJsonArray(attributesArray, attributes);
            const filterIdsXml = `<filterids><id>${config.filterId}</id></filterids>`;
            const args = {
                ClientName: config.clientName,
                PassKey: config.passKey,
                AttributesXml: attrsXml,
                FilterIdsXml: filterIdsXml
            };

            this.client.GetFilterContacts(args, async (err, result, raw, soapHeader) => {
                if (err) {
                    return reject(err);
                }

                const xml = result.GetFilterContactsResult;
                this.log.info(xml);
                const parseStringAsync = promisify(parseString);
                const jsonResult = await parseStringAsync(xml);
                const contactsArray = jsonResult.result.returndata[0].contacts[0].contact;
                // we need to change the structure of the contacts here to what we want
                let mappedContactsArray = contactsArray.map((contact) => {
                    let mappedContact = {};
                    mappedContact.attributes = [];
                    forEach(contact.attribute, (attribute) => {
                        let newAttribute = {};
                        const attributeName = attribute.name[0];
                        const attributeValue = attribute.value[0];
                        newAttribute.name = attributeName;
                        newAttribute.value = attributeValue;
                        // we need to find the mapping name for the attribute
                        const foundAttribute = find(attributes, (attr) => {
                            return attr.name === attributeName;
                        });
                        newAttribute.mappingName = foundAttribute.mappingName;
                        mappedContact.attributes.push(newAttribute);
                    });

                    return mappedContact;
                });

                resolve(mappedContactsArray);
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
            let attributes = config.attributes;
            const count = await this.getContactCount(config);
            const attributesArray = await this.getAllAttributes(config);
            const attrsXml = this.attributesXmlFromJsonArray(attributesArray, attributes);
            let args = {
                ClientName: config.clientName,
                PassKey: config.passKey,
                StartingRecord: config.startingRecord,
                EndingRecord: 100,
                SearchCriteriaXml: config.searchCriteriaXml,
                AttributesXml: attrsXml,
                OrderByXml: config.orderByXml
            };

            let allMappedContacts = [];
            for (let i = 100, l = count; i <= l; i += 100) {
                args.EndingRecord = i;
                this.log.info(args.StartingRecord);
                this.log.info(args.EndingRecord);
                let contactsChunk = await this.getContactsChunk(args, attributes);
                this.log.info(contactsChunk[contactsChunk.length - 1]);
                Array.prototype.push.apply(allMappedContacts, contactsChunk);
                args.StartingRecord = args.StartingRecord + 100;
            }

            resolve(allMappedContacts);
        });
    }

    getContactsChunk(args, attributes) {
        return new Promise((resolve, reject) => {
            this.client.GetContacts(args, async (err, result, raw, soapHeader) => {
                if (err) {
                    return reject(err);
                }

                const xml = result.GetContactsResult;
                const parseStringAsync = promisify(parseString);
                const jsonResult = await parseStringAsync(xml);
                const contactsArray = jsonResult.result.returndata[0].contacts[0].contact;
                // we need to change the structure of the contacts here to what we want
                let mappedContactsArray = contactsArray.map((contact) => {
                    let mappedContact = {};
                    mappedContact.attributes = [];
                    forEach(contact.attribute, (attribute) => {
                        let newAttribute = {};
                        const attributeName = attribute.name[0];
                        const attributeValue = attribute.value[0];
                        newAttribute.name = attributeName;
                        newAttribute.value = attributeValue;
                        // we need to find the mapping name for the attribute
                        const foundAttribute = find(attributes, (attr) => {
                            return attr.name === attributeName;
                        });
                        newAttribute.mappingName = foundAttribute.mappingName;
                        mappedContact.attributes.push(newAttribute);
                    });

                    return mappedContact;
                });

                resolve(mappedContactsArray);
            });
        });
    }

    /** attributes is an array of the specified attributes from the config in the db */
    attributesXmlFromJsonArray(jsonArray, attributes) {
        // this is an array of the attribute names we want
        const attributeNames = attributes.map((obj) => {
            return obj.mappingName;
        });
        let attributesXmlString = '<attributes>';
        // loop through all the attributes from the server, and see if they are specified as attribute we want
        for (let i = 0, l = jsonArray.length; i < l; i++) {
            const serverAttribute = jsonArray[i];
            if (has(serverAttribute, 'mappingname') && serverAttribute.mappingname.length > 0) {
                const mappingName = serverAttribute.mappingname[0];
                // if the attribute name from the server is in the list of names we want
                const index = indexOf(attributeNames, mappingName);
                if (index !== -1) {
                    attributesXmlString += `<attribute><name>${serverAttribute.name}</name></attribute>`;
                    let attribute = attributes[index];
                    attribute.name = serverAttribute.name[0];
                }
            }
        }
        attributesXmlString += '</attributes>';
        return attributesXmlString;
    }
};

