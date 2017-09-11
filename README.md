# Lg-Toolbox

This is the Lg-Toolbox, a set of tools that can be used across multiple services of the LOS.

## Install

  ```
    npm install lg-toolbox --save

    yarn add lg-toolbox
  ```

## Usage

- In Ecmascript 6:
  ```javascript
  import {dataService} from 'lg-toolbox'
  ```
- In Ecmascript 5 or lower:
  ```javascript
  const toolbox = require('lg-toolbox')
  toolbox.dataService(rethinkdb, options)
  ```
  If rethinkdbdash is already currently instantiated:
  ```javascript
  const rethinkDashInstance = rethinkdbdash()

  const ds = dataService(rethinkDashInstance)
```
- If config object is provided, dataService will return a rethinkdbdash instance with the given config:
```javascript
  const config = {
    host: hostname,
    port: port,
    db: pathname,
    authKey: auth,
    ssl: dbCert,
    relativeTo: DATA_SERVICE_DIR,
    migrationsDirectory: directory name,
  }

  const ds = dataService(config)
```
- When adding optional Thinky Models and/or Queries:
```javascript
  const options = {
    models: [array-of-models] || relative directoryPath,
    queries: [array-of-queries] || relative directoryPath
  }
  
  const ds = dataService(config, options)

  ds will contain:
    r: { rethinkdbdash instance },
    models: [ array of thinky models ],
    queries: [ array of query functions ]

  const { r, models, queries } = ds

  ```
## Includes

  - dataService

## Third Party modules

  - auto-loader
  - rethinkdb
  - rethinkdbdash
  - thinky

## Contributing

  Create Github issues for all bugs, features & requests. Pull requests are welcome. Make sure tests are included.

## License

See the [LICENSE](./LICENSE) file.
