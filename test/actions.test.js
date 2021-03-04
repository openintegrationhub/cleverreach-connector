/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const { upsertReceiver } = require('../lib/utils/helpers');

const cfg = {
  accessToken: 'TOKEN',
};

const msg = {
  metadata: {},
  data: {},
};

const categories = [{ label: 'testgruppe' }];

const {
  getGroupsSuccessful,
  createReceiverSuccessful,
  // createReceiverFailed,
  updateReceiverSuccessful,
  // updateReceiverFailed,
  // deleteReceiverSuccessful,
  // deleteReceiverFailed,
} = require('./seed/actions.seed');

describe('Actions - upsertReceiver', () => {
  before(async () => {
    getGroupsSuccessful;
    createReceiverSuccessful;
    // createReceiverFailed;
    updateReceiverSuccessful;
    // updateReceiverFailed;
    // deleteReceiverSuccessful;
    // deleteReceiverFailed;
  });

  it('should create a Receiver', async () => {
    const receiver = await upsertReceiver(msg, cfg, categories);
    expect(receiver).to.not.be.empty;
    expect(receiver).to.be.a('object');
    expect(receiver.metadata).to.be.a('object');
  });

  it('should update a Receiver', async () => {
    msg.metadata.recordUid = 1;
    const receiver = await upsertReceiver(msg, cfg, categories);
    expect(receiver).to.not.be.empty;
    expect(receiver).to.be.a('object');
    expect(receiver.metadata).to.be.a('object');
    expect(receiver.metadata.recordUid).to.equal(1);
  });
});
