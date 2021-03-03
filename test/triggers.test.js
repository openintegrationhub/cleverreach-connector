/* eslint no-unused-expressions: "off" */

// const nock = require('nock');
const { expect } = require('chai');
const { getReceivers } = require('../lib/utils/helpers');
const {
  getGroupsSuccessful,
  getReceiversSuccessful,
  getReceiversEmpty,
} = require('./seed/triggers.seed');

describe('Triggers - getReceivers & getReceiversByGroupId', () => {
  let token;
  const cfg = {
    accessToken: 'TOKEN',
  };

  before(async () => {
    getGroupsSuccessful;
    getReceiversSuccessful;
    getReceiversEmpty;
  });

  it.only('should get all Receivers', async () => {
    const snapshot = {
      lastUpdated: (new Date(0)).getTime(),
    };
    const receivers = await getReceivers(cfg, snapshot);

    expect(receivers).to.not.be.empty;
    expect(receivers).to.be.an('array');
    expect(receivers).to.have.length(1);
    expect(receivers.email).to.equal('a@b.de');
    expect(receivers.attributes).to.exist;
    expect(receivers.attributes).to.be.a('object');
  });

  it('should throw an exception if no Receivers were found', async () => {
    const snapshot = {
      lastUpdated: 0,
    };
    const Receivers = await getReceivers(token, snapshot, 'Receiver');
    expect(Receivers).to.equal('Expected records array.');
  });
});
