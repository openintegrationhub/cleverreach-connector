/* eslint no-await-in-loop: "off" */
/* eslint consistent-return: "off" */

const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });

const secretServiceApiEndpoint = process.env.SECRET_SERVICE_ENDPOINT || 'https://secret-service.openintegrationhub.com';

const apiUrl = 'https://rest.cleverreach.com/v3';

async function upsertReceiver(msg, cfg) {
  try {
    let id = false;
    if (msg.metadata && msg.metadata.recordUid) {
      // id = await lookupentry(msg, cfg);
      id = msg.metadata.recordUid;
    }

    const newMsg = {
      data: Object.assign({}, msg.data),
      metadata: Object.assign({}, msg.metadata),
    };
    if (id) newMsg.data.id = id;

    const url = (cfg.apiUrl) ? cfg.apiUrl : apiUrl;

    const options = {
      method: id ? 'PUT' : 'POST',
      uri: id ? `${url}/groups.json/{group_id}/receivers/{id} ` : `${url}/groups.json`,
      json: true,
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
      },
      body: newMsg.data,
    };

    if (cfg.devMode) console.log(options);

    let response = await request(options);

    if (cfg.devMode) {
      console.log(response.statusCode);
      console.log(response.text);
      console.log(JSON.stringify(response.body));
    }

    // If insert with ID failed create new one
    if (id && response.statusCode !== 200 && response.statusCode !== 201) {
      // Entry deleted or recordUid from other account
      // Trying normal insert
      console.log(`Entry ${id} not found inserting as new entry`);
      options.method = 'POST';
      options.uri = `${url}/groups.json`;
      delete options.body.id;
      response = await request(options);
      if (cfg.devMode) {
        console.log(response.statusCode);
        console.log(response.text);
        console.log(JSON.stringify(response.body));
      }
    }

    // Upon success, return the new ID
    if (response.statusCode === 200 || response.statusCode === 201) {
      const newMeta = msg.metadata;
      if (response.body.id) newMeta.recordUid = String(response.body.id);
      return { metadata: newMeta };
    }
    return false;
  } catch (e) {
    console.error(e);
    return {};
  }
}

async function getReceivers(cfg) { // , snapshot
  try {
    const url = (cfg.apiUrl) ? cfg.apiUrl : apiUrl;

    // First get all groups
    const groupOptions = {
      method: 'GET',
      uri: `${url}/groups.json`,
      json: true,
      qs: {
      },
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
      },
    };

    const groupResponse = await request(groupOptions);

    const groups = [];
    if (groupResponse.statusCode === 200) {
      if (cfg.devMode) {
        console.log(JSON.stringify(groupResponse.body));
      }
      // groups.push();
    } else {
      console.error(groupResponse.statusCode);
      console.error(groupResponse.text);
      console.log(JSON.stringify(groupResponse.body));
    }


    // Then get all entries for each group (@todo: Consider duplicates)

    const entries = [];
    const { length } = groups;
    console.log(`Found ${length} Groups`);
    for (let i = 0; i < length; i += 1) {
      const options = {
        method: 'GET',
        uri: `${url}/groups.json/${entries[i].groupId}/receivers`,
        json: true,
        qs: {
          pagesize: 1000,
          type: 'all',
        },
        headers: {
          Authorization: `Bearer ${cfg.accessToken}`,
        },
      };

      const response = await request(options);

      if (response.statusCode === 200) {
        if (cfg.devMode) {
          console.log(JSON.stringify(response.body));
        }
        // entries.push()
        // if(snapshot) entries = entries.filter(entry => new Date(entry.updated).getTime() > snapshot.lastUpdated);
      } else {
        console.error(response.statusCode);
        console.error(response.text);
        console.log(JSON.stringify(response.body));
      }
    }

    return entries;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getReceiversByGroupId(cfg) { // , snapshot
  try {
    const url = (cfg.apiUrl) ? cfg.apiUrl : apiUrl;
    const options = {
      method: 'GET',
      uri: `${url}/groups.json/${cfg.groupId}/receivers`,
      json: true,
      qs: {
        pagesize: 1000,
        type: 'all',
      },
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
      },
    };

    const response = await request(options);

    if (response.statusCode === 200) {
      if (cfg.devMode) {
        console.log(JSON.stringify(response.body));
      }
      const entries = [];
      // if(snapshot) entries = entries.filter(entry => new Date(entry.updated).getTime() > snapshot.lastUpdated);
      return entries;
    }
    console.error(response.statusCode);
    console.error(response.text);
    console.log(JSON.stringify(response.body));

    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
}


async function getAccessToken(config) {
  try {
    if (config.accessToken) {
      return config.accessToken;
    }

    const response = await request({
      method: 'GET',
      uri: `${secretServiceApiEndpoint}/secrets/${config.secret}`,
      headers: {
        'x-auth-type': 'basic',
        authorization: `Bearer ${config.iamToken}`,
      },
      json: true,
    });

    const { value } = response.body;
    return value.accessToken;
  } catch (e) {
    console.log(e);
    return e;
  }
}


module.exports = {
  upsertReceiver, getReceivers, getReceiversByGroupId, getAccessToken, secretServiceApiEndpoint,
};
