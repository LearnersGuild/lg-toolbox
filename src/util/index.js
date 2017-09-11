const autoloader = require('auto-loader')

function sleep(fn, time) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fn()), time)
  })
}

function autoloadFunctions(directoryPath) {
  const moduleExports = autoloader.load(directoryPath)
  return Object.keys(moduleExports).reduce((result, key) => {
    if (typeof moduleExports[key] === 'function') {
      result[key] = moduleExports[key]
    }
    return result
  }, {})
}

function truncateTables(r) {
  return r.tableList()
    .then(tables => tables.filter(table => !table.startsWith('_')))
    .then(tablesToTruncate => Promise.all(tablesToTruncate.map(table =>
      r.table(table).delete().run())))
}

module.exports = {
  sleep,
  truncateTables,
  autoloadFunctions,
}
