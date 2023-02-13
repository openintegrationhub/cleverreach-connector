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

const { upsertReceiver, getAccessToken, getMetadata } = require('./../utils/helpers');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  try {
    const isVerbose = process.env.debug || cfg.verbose;
    cfg.accessToken = await getAccessToken(cfg);

    if (isVerbose) {
      console.log(`---MSG: ${JSON.stringify(msg)}`);
      console.log(`---CFG: ${JSON.stringify(cfg)}`);
      console.log(`---ENV: ${JSON.stringify(process.env)}`);
    }

    const newElement = {};

    const response = await upsertReceiver(msg.data, cfg, msg.data.categories);

    newElement.metadata = getMetadata(msg.metadata);
    newElement.data = response;
    this.emit('data', newElement);
  } catch (e) {
    console.error('ERROR: ', e);
    return this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
