const nock = require('nock');

const url = 'https://rest.cleverreach.com/v3';
const groups = [{
  id: '1',
  name: 'Testgruppe',
}];

const getGroupsSuccessful = nock(`${url}/groups.json/${groups[0].id}/receivers`)
  .get('')
  .reply(200, groups)
  .persist();


const getReceiversSuccessful = nock(`${url}/groups.json/${groups[0].id}/receivers`)
  .get('')
  .reply(200, [
    {
      id: '007',
      email: 'a@b.de',
      imported: 1598960975,
      bounced: 1627283954,
      group_id: '1123825',
      activated: 1598960975,
      registered: 1598960975,
      deactivated: 0,
      last_ip: '',
      last_location: '',
      last_client: '',
      points: 0,
      stars: 0,
      source: 'User Import',
      attributes: {
        firstname: 'Stefan',
        name: 'Meyer',
        salutation: 'Herr',
        serial_salutation: 'Sehr geehrter Herr Meyer',
      },
      global_attributes: {
        serienbriefanrede: '',
        firstname: 'Stefan',
        lastname: '',
        name: 'Meyer',
        phone: '12345',
      },
      active: false,
      conversion_rate: 0,
      open_rate: 0,
      click_rate: 0,
    },
  ]);

const getReceiversEmpty = nock(`${url}/groups.json/0/receivers`)
  .get('')
  .reply(204, []);


module.exports = {
  getGroupsSuccessful,
  getReceiversSuccessful,
  getReceiversEmpty,
};
