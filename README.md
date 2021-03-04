# CleverReach Connector

![alpha](https://img.shields.io/badge/Status-Alpha-yellow.svg)

With this **connector** you are able to create different application flows. It supports **"Triggers"** (e.g. ``getReceiversPolling``, ``getReceiversByGroupIdPolling``) as well as **"Actions"** (e.g. ``upsertReceiver``), therefore with this **connector** you could both read and fetch data from CleverReach and write and save data in CleverReach.

## Usage

1. Create Oauth2 App in your CleverReach Account (My account > Extras > Rest API)
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
  - Get Receivers by GroupId or groupName - polling (```getReceiversByGroupIdPolling.js```)

  All triggers are of type '*polling'* which means that the **trigger** will be scheduled to execute periodically. It will fetch only these objects from the database that have been modified or created since the previous execution. Then it will emit one message per object that changes or is added since the last polling interval. For this case at the very beginning we just create an empty `snapshot` object. Later on we attach ``lastUpdated`` to it. At the end the entire object should be emitted as the message body.

#### Actions:
  - Upsert Receiver (```upsertReceiver.js```)


##### Get Receivers

Get Receivers trigger (```getPersonsPolling.js```) performs a request which fetches all Receivers in all Groups.

##### Get Receivers by GroupId or groupName

Gets Receivers by GroupId trigger (```getOrganizationsPolling.js```) performs a request which fetches all Receivers which are in the Group with the provided GroupId.

The groupId has to be set in the step data as a field. Alternatively the groupName can per set then the connector will match the provided name to the existent groups.

##### Upsert Receiver

Upsert Receiver action (``upsertReceiver.js``) updates an existing receiver if it already exists. Otherwise it creates a new one.

The groupId has to be set in the step data as a field. If the groupId is not set then the endpoint will try to match the categories of then entry to an existing receiver group.

## Integrated Transformations

Transformations to and from the OIH contact master data model are integrated into the relevant actions/triggers by default. This means that it is no longer necessary to run a separate SnazzyContacts Transformer in flows containing this Adapter.

If you would like to use the old behaviour without integrated transformations, simply set `skipTransformation: true` in the `fields` object of your flow configuration. Alternatively, you can also inject a valid, stringified JSONata expression in the `customMapping` key of the `fields` object, which will be used instead of the integrated transformation.


## License

Apache-2.0 © [Wice GmbH](https://wice.de/)
