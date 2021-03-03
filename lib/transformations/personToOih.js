/* eslint "max-len":  ["error", { "code": 170 }] */
/**
 * Copyright 2018 Wice GmbH

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

module.exports.personToOih = (msg) => {
  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  // [
  //   {"id":"279","email":"a@b.de",
  //   "imported":1598960975,"bounced":1627283954,
  //   "group_id":"1123825",
  //   "activated":1598960975,
  //   "registered":1598960975,
  //   "deactivated":0,
  //   "last_ip":"",
  //   "last_location":"",
  //   "last_client":"","points":0,"stars":0,"source":"User Import",
  //   "attributes":{"firstname":"Stefan","name":"Meyer","salutation":"Herr","serial_salutation":"Sehr geehrter Herr Meyer"},
  //   "global_attributes":{"serienbriefanrede":"","firstname":"Stefan","lastname":"","name":"Meyer","phone":""},
  //   "active":false,
  //   "conversion_rate":0,"open_rate":0,"click_rate":0}
  // ]

  const contactData = [
    {
      type: 'email',
      value: msg.data.email,
    },
  ];

  if (msg.data.global_attributes && 'phone' in msg.data.global_attributes) {
    contactData.push({
      type: 'phone',
      value: msg.data.global_attributes.phone,
    });
  }

  // eslint-di
  const attributes = (msg.data.attributes) ? msg.data.attributes : {};

  let firstname = (msg.data.attributes && msg.data.attributes.name) ? msg.data.attributes.firstname : '';

  let lastname = '';
  if (msg.data.attributes && msg.data.attributes.name) {
    lastname = msg.data.attributes.name;
  } else {
    // eslint-disable-next-line prefer-destructuring
    lastname = msg.data.email.split('@')[0];
    lastname = lastname.trim().replace(/[-_\s]+/uim, ' ');
    lastname = lastname.split(' ');
    // eslint-disable-next-line prefer-destructuring
    lastname = lastname[0];
    if (lastname.length > 1 && firstname === '') firstname = lastname.splice(1);
    // eslint-disable-next-line prefer-destructuring
    lastname = lastname[0];
  }

  const expression = {
    metadata: {
      recordUid: msg.metadata.recordUid,
      operation: msg.operation,
      applicationUid: (msg.metadata.applicationUid !== undefined && msg.metadata.applicationUid !== null) ? msg.metadata.applicationUid : 'appUid not set yet',
      iamToken: (msg.metadata.iamToken !== undefined && msg.metadata.iamToken !== null) ? msg.metadata.iamToken : undefined,
      domainId: (msg.metadata.domainId !== undefined && msg.metadata.domainId !== null) ? msg.metadata.domainId : undefined,
      schema: (msg.metadata.schema !== undefined && msg.metadata.schema !== null) ? msg.metadata.schema : undefined,
    },
    data: {
      firstName: firstname,
      lastName: lastname,
      salutation: attributes.salutation,
      contactData,
    },
  };

  // Remove null values
  Object.keys(expression.data).forEach(
    key => (expression.data[key] == null || expression.data[key] === undefined)
  && delete expression.data[key],
  );

  return expression;
};
