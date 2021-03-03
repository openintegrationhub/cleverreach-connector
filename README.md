# CleverReach Connector

![alpha](https://img.shields.io/badge/Status-Alpha-yellow.svg)

With this **connector** you are able to create different application flows. It supports **"Triggers"** (e.g. ``getReceiversPolling``, ``getReceiversByGroupIdPolling``) as well as **"Actions"** (e.g. ``upsertReceiver``), therefore with this **connector** you could both read and fetch data from CleverReach and write and save data in CleverReach.

## Usage

1. Create Oauth2 Client in your CleverReach Account
2. Set redirect uri to https://app.yourservice.com/callback/oauth2
3. Set register secret in secret service
4. Add secret to flow step

> Any attempt to reach the CleverReach Api endpoints without registration will not be successful!

## Authorization

Each request to CleverReach API requires an Oauth2 authorization.


## Actions and triggers
The **connector** supports the following **actions** and **triggers**:

#### Triggers:
  - Get Receivers - polling (```getReceiversPolling.js```)
  - Get Receivers by GroupId - polling (```getReceiversByGroupIdPolling.js```)

  All triggers are of type '*polling'* which means that the **trigger** will be scheduled to execute periodically. It will fetch only these objects from the database that have been modified or created since the previous execution. Then it will emit one message per object that changes or is added since the last polling interval. For this case at the very beginning we just create an empty `snapshot` object. Later on we attach ``lastUpdated`` to it. At the end the entire object should be emitted as the message body.

#### Actions:
  - Upsert Receiver (```upsertReceiver.js```)

In each trigger and action, before sending a request we get the token from [CleverReach](https://snazzycontacts.com) via calling the function ```getToken()``` from ```snazzy.js``` file, which is located in directory **utils**. This function returns a token which is used when we send a request to
[CleverReach](https://snazzycontacts.com).

##### Get Receivers

Get Receivers trigger (```getPersonsPolling.js```) performs a request which fetches all Receivers in all Groups.

##### Get Receivers by GroupId

Gets Receivers by GroupId trigger (```getOrganizationsPolling.js```) performs a request which fetches all Receivers which are in the Group with the provides GroupId.

##### Upsert Receiver

Upsert Receiver action (``upsertReceiver.js``) updates an existing reciver if it already exists. Otherwise it creates a new one.

## Integrated Transformations

Transformations to and from the OIH contact master data model are integrated into the relevant actions/triggers by default. This means that it is no longer necessary to run a separate SnazzyContacts Transformer in flows containing this Adapter.

If you would like to use the old behaviour without integrated transformations, simply set `skipTransformation: true` in the `fields` object of your flow configuration. Alternatively, you can also inject a valid, stringified JSONata expression in the `customMapping` key of the `fields` object, which will be used instead of the integrated transformation.


## License

Apache-2.0 © [Wice GmbH](https://wice.de/)
