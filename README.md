# loopback-component-fixtures-syncgateway
----------------------------
## Notes

This is a couchbase version of JonathanPrince's [loopback-component-fixtures](https://github.com/JonathanPrince/loopback-component-fixtures). This module is intended to go together with [loopback-rest-connector-syncgateway](https://github.com/minho814/loopback-rest-connector-syncgateway).

## Usage

**Installation**

1. Install in you loopback project:

  `npm install --save loopback-component-fixtures-syncgateway`

2. Create a component-config.json file in your server folder (if you don't already have one)

3. Configure options inside `component-config.json`. *(see configuration section)*

  ```json
  {
    "loopback-component-fixtures-syncgateway": {
      "{option}": "{value}"
    }
  }
  ```

4. Create a folder for storing test fixtures.

  The default location is `/server/test-fixtures`. This can be set in `component-config.json` (see below)

5. Create `datasources.{env}.json` file. This is the datasources definition that will be used depending on the value of NODE_ENV where you want to use fixture data. Example:
  ```json
  {
    "db": {
      "name": "db",
      "connector": "memory"
    }
  }
  ```

**Configuration**

Options:

 - `loadFixturesOnStartup`

  [Boolean] : Defines whether the fixture data should be loaded on startup. *(default: false)*

 - `errorOnSetupFailure`

  [Boolean] : Defines whether the API shows/throws an error when fixtures fail to load.  *(default: false)*

  If **true**:
    - Bad fixtures loaded on startup will cause the application to fail with an error.
    - Bad fixtures loaded via the REST endpoint will return a `500` status code and an `error` object with details about the specific fixture failures.

  If **false**:
    - App will continue running (but log an error) if bad fixtures are loaded on startup
    - App will return a 200 with no error details if bad fixtures are loaded when calling the fixture setup REST endpoint, but will log an error to the console.

 - `environments`

  [String/Array] : The name(s) of the environment(s) where the fixtures should be used. *(default: 'test')*

 - `fixturesPath`

  [String] : The location of of the fixture definitions relative to the project root. *(default: '/server/test-fixtures/')*


**Fixture Files**

Fixtures are stored in .json files and should have the same name as the loopback model definitions they correspond to. The content should be either an object (for a single item) or an array of objects for multiple items.

**Setup/Teardown Fixtures**

Fixtures can be setup at startup by setting `loadFixturesOnStartup` to `true` in the component-config file. The fixtures can be setup manually by making a GET request to the endpoint `<api-root>/fixtures/setup` and a GET request to `<api-root>/fixtures/teardown` will clear all data.

These actions are also available on the server as `app.setupFixtures(callback)` and `app.teardownFixtures(callback)`.