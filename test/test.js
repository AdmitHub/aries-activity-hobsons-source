import test from 'blue-tape';
import HobsonsSource from '../lib/index.js';
import config from './test-config.js';

// test('Creates Client', async t => {
//     const source = new HobsonsSource();
//     try {
//         await source.createClient(config.url);
//         t.notEqual(source.client, null, 'Client should not be null');
//     } catch(err) {
//         t.comment(err);
//     }
// });

// test('Gets All Attributes', async t => {
//     const source = new HobsonsSource();
//     try {
//         await source.createClient(config.url);
//         const attributes = await source.getAllAttributes(config);
//     } catch(err) {
//         t.comment(err);
//     }
// });

// test('Gets Contact Count', async t => {
//     const source = new HobsonsSource();
//     try {
//         await source.createClient(config.url);
//         const count = await source.getContactCount(config);
//     } catch(err) {
//         t.comment(err);
//     }
// });

// test('Gets All Contacts', async t => {
//     const source = new HobsonsSource();
//     try {
//         await source.createClient(config.url);
//         const allContacts = await source.onTask(null, config);
//         t.comment(allContacts.length);
//     } catch(err) {
//         t.comment(err);
//     }
// });

// test('Gets All Filters', async t => {
//     const source = new HobsonsSource();
//     try {
//         await source.createClient(config.url);
//         const allFilters = await source.getAllFilters(config);
//         t.comment(allFilters);
//     } catch(err) {
//         t.comment(err);
//     }
// });

test('Gets Filter Contacts', async t => {
    const source = new HobsonsSource();
    try {
        await source.createClient(config.url);
        const contacts = await source.getFilterContactsByFilterId(config);
        t.comment(JSON.stringify(contacts));
    } catch(err) {
        t.comment(err);
    }
});

// test('Gets Contact Count', t => async function () {
//     const args = {
//         ClientName: config.clientName,
//         PassKey: config.passKey
//     };
//     const source = new HobsonsSource();
//     await source.createClient(config.url);
//     const contactsCount = await source.executeMethod(methodName, args);
//     this.log.info(contactsCount);
// }());

// test('Gets Contacts', t => async function() {
//     const source = new HobsonsSource();
//     const contacts = await source.queryContacts(config);
//     t.comment(contacts);
// }());

