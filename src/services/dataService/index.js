const thinky = require('thinky')
const rethinkdbdash = require('rethinkdbdash')

const autoloadFunctions = require('../../util').autoloadFunctions

function dataService(rethinkdb, options) {
  if (!rethinkdb) {
    throw new Error('rethinkdb parameter config or client is required')
  }
  if (typeof rethinkdb !== 'function' && typeof rethinkdb !== 'object') {
    throw new Error('first parameter must be a config object or client')
  }

  const r = typeof rethinkdb === 'function' ?
    rethinkdb : rethinkdbdash(rethinkdb)

  const ds = {r}
  const {models: modelDefinitions, queries: queryFunctions} = options || {}
  if (modelDefinitions) {
    let models
    if (Array.isArray(modelDefinitions)) {
      models = _loadModels(modelDefinitions, r)
    } else if (typeof modelDefinitions === 'string') {
      models = _loadModels(autoloadFunctions(modelDefinitions), r)
    } else {
      throw new Error('options.models must be a path to directory or array of model definition functions')
    }
    Object.assign(ds, models)
  }

  if (queryFunctions) {
    let queries
    if (Array.isArray(queryFunctions)) {
      queries = _transmuteFunctionArrayToObject(queryFunctions)
    } else if (typeof queryFunctions === 'string') {
      queries = autoloadFunctions(queryFunctions)
    } else {
      throw new Error('options.queries must be a path to directory or array of query functions')
    }
    Object.assign(ds, queries)
  }

  return ds
}

function _transmuteFunctionArrayToObject(arr) {
  return Object.keys(arr).reduce((result, key) => {
    if (typeof arr[key] === 'function') {
      result[arr[key].name] = arr[key]
    }
    return result
  }, {})
}

function _loadModels(modelDefinitions, r) {
  const t = thinky({r, createDatabase: false})
  const errors = t.Errors
  // initiate models
  const models = {r, errors}
  const modelDefs = {}

  Object.values(modelDefinitions).forEach((getModel) => {
    const modelDefinition = getModel(t) || {}
    const {name} = modelDefinition
    modelDefs[name] = modelDefinition

    const model = _createModel(modelDefinition, t)

    models[name] = model
  })
  // set associations now that all models have been instantiated
  _associateModels(models, modelDefs)

  return models
}

function _createModel(modelDefinition, t) {
  const {table, schema, pk} = modelDefinition
  const errors = t.Errors

  const model = t.createModel(table, schema, {
    pk: pk || 'id',
    table: {replicas: 1},
    enforce_extra: 'remove', // eslint-disable-line camelcase
    init: false,
  })

  model.docOn('saving', (doc) => {
    _updateTimestamps(doc)
  })
  model.defineStatic('updateWithTimestamp', function (values = {}) {
    return this.update(_updateTimestamps(values))
  })
  model.defineStatic('upsert', function (values = {}) {
    const {id} = values || {}
    if (!id) {
      return this.save(values)
    }
    // {conflict: 'update'} option doesn't work when using .save() to update
    // https://github.com/neumino/thinky/issues/454
    return this
      .get(id)
      .updateWithTimestamp(values)
      .catch(errors.DocumentNotFound, () => this.save(values))
  })

  if (modelDefinition.static) {
    Object.keys(modelDefinition.static).forEach((staticFnName) => {
      model.defineStatic(staticFnName, modelDefinition.static[staticFnName])
    })
  }
  return model
}

function _associateModels(models, modelDefs) {
  Object.values(modelDefs).forEach((modelDef) => {
    if (typeof modelDef.associate === 'function') {
      const model = models[modelDef.name]
      modelDef.associate(model, models)
    }
  })
}

function _updateTimestamps(values = {}) {
  if (!values.updatedAt && typeof values !== 'function') {
    values.updatedAt = new Date()
  }
  return values
}

module.exports = dataService
