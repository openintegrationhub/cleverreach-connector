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

module.exports.personFromOih = (msg) => {
  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  // Mapping contact Data to fields, first entry for each type wins
  let phone = '';
  let email = '';
  if (msg.data.contactData) {
    for (let i = 0; i < msg.data.contactData.length; i += 1) {
      if (
        (msg.data.contactData[i].type === 'phone' || msg.data.contactData[i].type === 'mobile')
        && msg.data.contactData[i].value.trim() !== ''
      ) {
        if (phone === '') phone = msg.data.contactData[i].value.trim();
      } else if (msg.data.contactData[i].type === 'email' && msg.data.contactData[i].value.trim() !== '') {
        if (email === '') email = msg.data.contactData[i].value.trim();
      }
    }
  }

  const expression = {
    metadata: {
      operation: msg.operation,
      oihUid: msg.metadata.oihUid ? msg.metadata.oihUid : '',
      applicationUid: msg.metadata.applicationUid ? msg.metadata.applicationUid : '',
      iamToken: msg.metadata.iamToken ? msg.metadata.iamToken : undefined,
      recordUid: msg.metadata.recordUid,
    },
    data: {
      email,
      attributes: {
        firstname: msg.data.firstName,
        name: msg.data.lastName,
        salutation: msg.data.salutation,
      },
      global_attributes: {
        firstname: msg.data.firstName,
        name: msg.data.lastName,
        phone,
      },
    },
  };

  // Remove null values
  Object.keys(expression.data).forEach(
    key => (expression.data[key] == null || expression.data[key] === undefined)
  && delete expression.data[key],
  );

  // Remove value-less array items
  if (expression.contactData) expression.contactData.filter(cd => cd.value);
  if (expression.addresses) expression.addresses.filter(adr => Object.keys(adr).length > 0);

  return expression;
};
