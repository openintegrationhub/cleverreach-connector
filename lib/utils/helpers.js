/* eslint no-await-in-loop: "off" */
/* eslint consistent-return: "off" */

const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });

const dayjs = require('dayjs');

const secretServiceApiEndpoint = process.env.SECRET_SERVICE_ENDPOINT || 'https://secret-service.openintegrationhub.com';

const apiUrl = 'https://rest.cleverreach.com/v3';

function isSecondDateAfter(a, b) {
  return dayjs(a).isAfter(b);
}

async function getGroups(cfg) {
  const url = (cfg.apiUrl) ? cfg.apiUrl : apiUrl;

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

  let groups = [];
  if (groupResponse.statusCode === 200) {
    if (cfg.devMode) {
      console.log(JSON.stringify(groupResponse.body));
    }
    if (Array.isArray(groupResponse.body)) groups = groupResponse.body;
  } else {
    console.error(groupResponse.statusCode);
    console.error(groupResponse.text);
    console.log(JSON.stringify(groupResponse.body));
  }
  return groups;
}

// async function deleteReceiver(msg, cfg) {
//   try {
//     const url = (cfg.apiUrl) ? cfg.apiUrl : apiUrl;
//
//     if (!msg.metadata || !msg.metadata.recordUid) {
//       console.warn('Attempted delete but was not provided a recordUid');
//       return false;
//     }
//
//     const response = await request({
//       method: 'DELETE',
//       uri: `${url}/receivers.json/${msg.metadata.recordUid}`,
//       json: true,
//       headers: {
//         Authorization: `Bearer ${cfg.accessToken}`,
//       },
//     });
//
//     let status = 'failed';
//
//     if (response.statusCode === 200) {
//       status = 'confirmed';
//     } else if (response.statusCode === 403 || response.statusCode === 401) {
//       status = 'denied';
//     }
//
//     return {
//       status,
//       timestamp: Date.now(),
//     };
//   } catch (e) {
//     console.error(e);
//     return false;
//   }
// }

async function upsertReceiver(msg, cfg, categories) { // , recordUid
  try {
    const id = (msg.metadata.recordUid) ? msg.metadata.recordUid : false;

    const newMsg = {
      data: Object.assign({}, msg.data),
      metadata: Object.assign({}, msg.metadata),
    };
    // if (id) newMsg.data.id = id;

    const url = (cfg.apiUrl) ? cfg.apiUrl : apiUrl;

    let groupId;
    if (cfg.groupId) {
      // eslint-disable-next-line prefer-destructuring
      groupId = cfg.groupId;
    } else if (categories && categories.length > 0) {
      // No groupId provided trying to match category to group
      const categoriesLength = categories.length;
      const categoriesHash = {};
      for (let i = 0; i < categoriesLength; i += 1) {
        categoriesHash[categories[i].label.toLowerCase()] = 1;
      }
      const groups = await getGroups(cfg);

      const { length } = groups;
      for (let i = 0; i < length; i += 1) {
        if (groups[i].name.toLowerCase() in categoriesHash) {
          groupId = groups[i].id;
          break;
        }
      }
    }

    const options = {
      method: id ? 'PUT' : 'POST',
      uri: id ? `${url}/groups.json/${groupId}/receivers/${id}` : `${url}/groups.json/${groupId}/receivers`,
      json: true,
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
      },
      body: newMsg.data,
    };

    // if (cfg.devMode) console.log(options);

    let response = await request(options);

    // if (cfg.devMode) {
    //   console.log(response.statusCode);
    //   console.log(response.text);
    //   console.log(JSON.stringify(response.body));
    // }

    // If insert with ID failed create new one
    if (id && response.statusCode !== 200 && response.statusCode !== 201) {
      // Entry deleted or recordUid from other account
      // Trying normal insert
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
      // const newMeta = msg.metadata;
      // if (response.body.id) newMeta.recordUid = String(response.body.id);
      // return { metadata: newMeta };
      return response;
    }
    return false;
  } catch (e) {
    console.error(e);
    return {};
  }
}


async function getReceivers(cfg, snapshot) {
  try {
    const url = (cfg.apiUrl) ? cfg.apiUrl : apiUrl;

    // First get all groups
    const groups = await getGroups(cfg);

    // Then get all entries for each group
    let entries = [];
    const { length } = groups;
    for (let i = 0; i < length; i += 1) {
      let page = 0;
      let nextPage = true;
      while (nextPage) {
        const options = {
          method: 'GET',
          uri: `${url}/groups.json/${groups[i].id}/receivers`,
          json: true,
          qs: {
            page,
            pagesize: 5000,
            type: 'all',
            detail: 2,
            order_by: 'registered DESC',
          },
          headers: {
            Authorization: `Bearer ${cfg.accessToken}`,
          },
        };
        page += 1;
        const response = await request(options);
        if (response.statusCode === 200) {
          if (cfg.devMode) {
            console.log(JSON.stringify(response.body));
          }

          if (Array.isArray(response.body)) {
            const entriesLength = response.body.length;
            if (entriesLength < 5000) nextPage = false;
            for (let j = 0; j < entriesLength; j += 1) {
              const entry = response.body[j];

              if (
                entry.registered <= snapshot.lastUpdated
                || entry.activated <= snapshot.lastUpdated
              ) {
                nextPage = false;
                break;
              }

              entry.category = groups[i].name;
              entries.push(entry);
            }
          } else {
            nextPage = false;
          }
        } else {
          nextPage = false;
          console.error(response.statusCode);
          console.error(response.text);
          console.log(JSON.stringify(response.body));
        }
      }
    }

    // @todo: Consider duplicates?
    if (snapshot) entries = entries.filter(entry => (entry.last_changed ? entry.last_changed : Date.now()) > snapshot.lastUpdated);

    return entries;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getReceiversByGroupId(cfg, snapshot) {
  try {
    // First get all groups because we also need the group name
    const groups = await getGroups(cfg);
    const groupsLength = groups.length;

    let groupName = 'NoGroupName';

    let { groupId } = cfg;

    if (cfg.groupId) {
      for (let i = 0; i < groupsLength; i += 1) {
        if (groups[i].id === cfg.groupId) {
          groupName = groups[i].name;
          break;
        }
      }
    } else if (cfg.groupName) {
      const nameKey = cfg.groupName.toLowerCase();
      // eslint-disable-next-line prefer-destructuring
      groupName = cfg.groupName;
      for (let i = 0; i < groupsLength; i += 1) {
        if (groups[i].name.toLowerCase() === nameKey) {
          groupId = groups[i].id;
          break;
        }
      }
    }

    // Fetch entries in group
    const url = (cfg.apiUrl) ? cfg.apiUrl : apiUrl;

    let entries = [];

    let page = 0;
    let nextPage = true;

    while (nextPage) {
      const options = {
        method: 'GET',
        uri: `${url}/groups.json/${groupId}/receivers`,
        json: true,
        qs: {
          page,
          pagesize: 5000,
          type: 'all',
          detail: 2,
          order_by: 'registered DESC',
        },
        headers: {
          Authorization: `Bearer ${cfg.accessToken}`,
        },
      };
      page += 1;

      const response = await request(options);

      if (response.statusCode === 200) {
        if (cfg.devMode) {
          console.log(JSON.stringify(response.body));
        }

        if (Array.isArray(response.body)) {
          const { length } = response.body;
          if (length < 5000) nextPage = false;
          for (let i = 0; i < length; i += 1) {
            const entry = response.body[i];

            if (
              entry.registered <= snapshot.lastUpdated
              || entry.activated <= snapshot.lastUpdated
            ) {
              nextPage = false;
              break;
            }

            entry.category = groupName;
            entries.push(entry);
          }
        } else {
          nextPage = false;
        }
      } else {
        nextPage = false;
        console.error(response.statusCode);
        console.error(response.text);
        console.log(JSON.stringify(response.body));
      }
    }
    if (snapshot) entries = entries.filter(entry => (entry.last_changed ? entry.last_changed : Date.now()) > snapshot.lastUpdated);
    return entries;
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

async function dataAndSnapshot(newElement, passedSnapshot, snapshotKey, standardSnapshot, self) {
  const snapshot = Object.assign(passedSnapshot);
  if (Array.isArray(newElement.data)) {
    let lastElement = 0;
    for (let i = 0; i < newElement.data.length; i += 1) {
      const newObject = { ...newElement, data: newElement.data[i] };
      const currentObjectDate = newObject.data[snapshotKey]
        ? newObject.data[snapshotKey]
        : newObject.data[standardSnapshot];
      if (snapshot.lastUpdated === 0) {
        if (isSecondDateAfter(currentObjectDate, lastElement)) {
          lastElement = currentObjectDate;
        }
        await self.emit('data', newObject);
      } else if (isSecondDateAfter(currentObjectDate, snapshot.lastUpdated)) {
        if (isSecondDateAfter(currentObjectDate, lastElement)) {
          lastElement = currentObjectDate;
        }
        await self.emit('data', newObject);
      }
    }
    snapshot.lastUpdated = lastElement !== 0 ? lastElement : snapshot.lastUpdated;
    console.log('returned a new snapshot', snapshot);
    await self.emit('snapshot', snapshot);
  } else {
    await self.emit('data', newElement);
  }
}

function getElementDataFromResponse(splittingKey, res) {
  if (!splittingKey) {
    return res;
  }
  return splittingKey.split('.').reduce((p, c) => (p && p[c]) || null, res);
}

function getMetadata(metadata) {
  const metadataKeys = ['oihUid', 'recordUid', 'applicationUid'];
  const newMetadata = {};
  for (let i = 0; i < metadataKeys.length; i += 1) {
    newMetadata[metadataKeys[i]] = metadata !== undefined && metadata[metadataKeys[i]] !== undefined
      ? metadata[metadataKeys[i]]
      : `${metadataKeys[i]} not set yet`;
  }
  return newMetadata;
}


module.exports = {
  upsertReceiver,
  getReceivers,
  getReceiversByGroupId,
  getAccessToken,
  secretServiceApiEndpoint,
  // deleteReceiver,
  dataAndSnapshot,
  getElementDataFromResponse,
  getMetadata,
};
