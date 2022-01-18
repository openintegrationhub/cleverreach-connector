/* eslint no-param-reassign: "off" */
/* eslint consistent-return: "off" */

/**
 * Copyright 2021 Wice GmbH
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

const { transform } = require('@openintegrationhub/ferryman');

const {
  upsertReceiver, deleteReceiver,
} = require('./../utils/helpers');
const { personFromOih } = require('../transformations/personFromOih');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  try {
    if (cfg.devMode) {
      console.log('Message received:');
      console.log(JSON.stringify(msg));
    }

    if (msg.data.deleteRequested) {
      if (cfg.deletes) {
        const res = await deleteReceiver(msg, cfg);

        if (!res) return false;

        const response = {
          metadata: msg.metadata,
          data: {
            delete: res.status,
            timestamp: res.timestamp,
          },
        };

        return this.emit('data', response);
      }
      return console.warn('Delete requested but component is not configured to allow deletes');
    }


    const transformedMessage = transform(msg, cfg, personFromOih);

    const oihUid = (transformedMessage.metadata) ? transformedMessage.metadata.oihUid : null;
    const recordUid = (transformedMessage.metadata) ? transformedMessage.metadata.recordUid : null;

    /** Create an OIH metadata object which is required
    * to make the Hub and Spoke architecture work properly
    */
    const newElement = {};
    const oihMeta = {
      oihUid,
      recordUid,
    };

    // Upsert the object
    const reply = await upsertReceiver(transformedMessage, cfg, msg.data.categories, recordUid);

    if (reply.body && reply.body.id) {
      oihMeta.recordUid = reply.body.id;
      newElement.metadata = oihMeta;
    }

    this.emit('data', newElement);
  } catch (e) {
    console.error('ERROR: ', e);
    console.log('Oops! Error occurred');
    this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
