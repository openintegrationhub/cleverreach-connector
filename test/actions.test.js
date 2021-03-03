// /* eslint no-unused-expressions: "off" */
//
// const { expect } = require('chai');
// const { upsertObject } = require('../lib/utils/helpers');
// // const { deleteReceiver } = require('../lib/actions/deleteReceiver');
// // const { deleteOrganization } = require('../lib/actions/deleteOrganization');
//
// const {
//   resolve,
//   checkForExistingObject,
//   resolveConflict,
// } = require('./../lib/utils/resolver.js');
//
// const {
//   createReceiverSuccessful,
//   createReceiverFailed,
//   updateReceiver,
//   getReceiver,
//   getReceiverFailed,
//   getReceiverNoToken,
// } = require('./seed/actions.seed');
// const { Receivers } = require('./seed/seed');
//
// describe('Actions - upsertReceiver', () => {
//   const token = 'WXYUFOmgDdoniZatfaMTa4Ov-An98v2-4668x5fXOoLZS';
//   before(async () => {
//     createReceiverSuccessful;
//     createReceiverFailed;
//     updateReceiver;
//     getReceiver;
//     getReceiverFailed;
//     getReceiverNoToken;
//   });
//
//   it('should check for an existing Receiver', async () => {
//     const res = await checkForExistingObject(Receivers[0], token, 'Receiver');
//     expect(res.firstName).to.equal('Yahoouser');
//     expect(res.lastName).to.equal('Accountname');
//     expect(res.uid).to.equal('25mop1jxq2ss3x');
//     expect(res.gender).to.equal('');
//     expect(res.meta).to.be.a('object');
//     expect(res.addresses.length).to.equal(0);
//     expect(res.contactData.length).to.equal(0);
//     expect(res.categories.length).to.equal(1);
//     expect(res.relations.length).to.equal(0);
//   });
//
//   it('should return false if response is undefined', async () => {
//     const res = await checkForExistingObject(Receivers[1], token, 'Receiver');
//     expect(res).to.be.false;
//   });
//
//   it('should return false if token is undefined', async () => {
//     const res = await checkForExistingObject(Receivers[2], undefined, 'Receiver');
//     expect(res).to.be.false;
//   });
//
//   it('should create a Receiver', async () => {
//     const Receiver = await upsertObject(Receivers[0], token, false, 'Receiver');
//     expect(Receiver).to.not.be.empty;
//     expect(Receiver).to.be.a('object');
//     expect(Receiver.statusCode).to.be.equal(200);
//     expect(Receiver.body.eventName).to.equal('ReceiverCreated');
//     expect(Receiver.body.meta.role).to.equal('USER');
//     expect(Receiver.body.meta.username).to.equal('admin@wice.de');
//     expect(Receiver.body.payload.firstName).to.equal('John');
//     expect(Receiver.body.payload.lastName).to.equal('Doe');
//   });
//
//   it('should not create a Receiver if type is undefined', async () => {
//     const Receiver = await upsertObject(Receivers[0], token, false);
//     expect(Receiver).to.be.false;
//   });
//
//   it('should update a Receiver', async () => {
//     const Receiver = await upsertObject(Receivers[4], token, true, 'Receiver', Receivers[4].metadata.recordUid);
//     expect(Receiver).to.not.be.empty;
//     expect(Receiver).to.be.a('object');
//     expect(Receiver.statusCode).to.be.equal(200);
//     expect(Receiver.body.eventName).to.equal('ReceiverLastNameUpdated');
//     expect(Receiver.body.meta.role).to.equal('USER');
//     expect(Receiver.body.meta.username).to.equal('admin@wice.de');
//     expect(Receiver.body.payload.uid).to.equal('25mop1jzwjc4by');
//     expect(Receiver.body.payload.lastName).to.equal('Stevenson');
//   });
//
//   it('should throw an exception if input does not match models', async () => {
//     const input = {
//       body: {
//         meta: {
//           uid: '5h4k3j23211',
//         },
//         data: {
//           uid: '5h4k3j23211',
//           firstName: 'Jane',
//           lastName: 'Smith',
//         },
//       },
//     };
//     const Receiver = await upsertObject(input, token, false, 'Receiver');
//     expect(Receiver.statusCode).to.be.equal(400);
//     expect(Receiver.body).to.be.equal('Data does not match schema!');
//   });
//
//
// });
