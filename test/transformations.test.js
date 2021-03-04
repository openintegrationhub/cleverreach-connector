/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const { personFromOih } = require('../lib/transformations/personFromOih');
const { personToOih } = require('../lib/transformations/personToOih');

const {
  personMessage,
  receiverMessage,
} = require('./seed/seed');

describe('Transformations - personFromOih', () => {
  before(async () => {
  });

  it('should transform OIH person to receiver format', async () => {
    const receiver = await personFromOih(personMessage);

    expect(receiver).to.not.be.empty;
    expect(receiver).to.be.an('object');
    expect(receiver.metadata).to.be.an('object');
    expect(receiver.data).to.be.an('object');

    expect(receiver.data.attributes).to.be.an('object');
    expect(receiver.data.global_attributes).to.be.an('object');

    expect(receiver.metadata.recordUid).to.equal('25mop1jxq2ss3x');

    expect(receiver.data.email).to.equal('info@smith.com');

    expect(receiver.data.attributes.firstname).to.equal('Mark');
    expect(receiver.data.attributes.name).to.equal('Smith');
    expect(receiver.data.attributes.salutation).to.equal('Mr');

    expect(receiver.data.global_attributes.firstname).to.equal('Mark');
    expect(receiver.data.global_attributes.name).to.equal('Smith');
    expect(receiver.data.global_attributes.phone).to.equal('123456');
  });
});

describe('Transformations - personToOih', () => {
  before(async () => {
  });

  it('should transform receiver to OIH person format', async () => {
    const person = await personToOih(receiverMessage);

    expect(person).to.not.be.empty;
    expect(person).to.be.an('object');
    expect(person.metadata).to.be.an('object');
    expect(person.data).to.be.an('object');

    expect(person.data.firstName).to.equal('Stefan');
    expect(person.data.lastName).to.equal('Meyer');
    expect(person.data.salutation).to.equal('Herr');

    expect(person.data.contactData).to.be.an('array');
    expect(person.data.contactData[0].type).to.equal('email');
    expect(person.data.contactData[0].value).to.equal('a@b.de');
    expect(person.data.contactData[1].type).to.equal('phone');
    expect(person.data.contactData[1].value).to.equal('123456');
  });
});
