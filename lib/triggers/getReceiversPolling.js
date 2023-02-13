/* eslint no-param-reassign: "off" */

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

const {
  getReceivers, getAccessToken, dataAndSnapshot, getMetadata, getElementDataFromResponse,
} = require('./../utils/helpers');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processAction(msg, cfg, snapshot = {}) {
  try {
    const isVerbose = process.env.debug || cfg.verbose;
    const {
      snapshotKey, arraySplittingKey, skipSnapshot,
    } = cfg.nodeSettings;

    cfg.accessToken = await getAccessToken(cfg);

    if (isVerbose) {
      console.log(`---MSG: ${JSON.stringify(msg)}`);
      console.log(`---CFG: ${JSON.stringify(cfg)}`);
      console.log(`---ENV: ${JSON.stringify(process.env)}`);
    }

    // Set the snapshot if it is not provided
    snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime();

    /** Create an OIH meta object which is required
    * to make the Hub and Spoke architecture work properly
    */

    const result = await getReceivers(cfg, snapshot);

    console.log(`Found ${result.length} new records.`);

    const newElement = {};

    // let newest = 0;
    // if (persons.length > 0) {
    //   persons.forEach((elem) => {
    //     if (elem.registered > newest) newest = elem.registered;
    //     if (elem.activated > newest) newest = elem.activated;
    //
    //     const newElement = { data: elem };
    //
    //     const transformedElement = transform(newElement, cfg, personToOih);
    //
    //     this.emit('data', transformedElement);
    //   });
    //   // Add newest date to snapshot
    //   snapshot.lastUpdated = newest;
    //   console.error(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
    //   this.emit('snapshot', snapshot);
    // }
    newElement.metadata = getMetadata(msg.metadata);
    newElement.data = getElementDataFromResponse(arraySplittingKey, result);
    if (skipSnapshot) {
      return newElement.data;
    }
    return await dataAndSnapshot(newElement, snapshot, snapshotKey, '', this);
  } catch (e) {
    console.log(`ERROR: ${e}`);
    return this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
