const path = require('path')

const rethinkdbdash = require('rethinkdbdash')

const dataService = require('../index')
const truncateTables = require('../../../util/index').truncateTables
const dummyModelModel = require('./models/dummyModel')
const dummyModelModelTwo = require('./models/dummyModelTwo')
const dummyQuery = require('./queries/dummyQuery')
const dummyQueryTwo = require('./queries/dummyQueryTwo')

const dbName = 'lgToolboxTest'
const rethinkdb = rethinkdbdash({db: dbName})

describe('data service', () => {
  describe('rethinkdb param', () => {
    describe('is a config object', () => {
      it('returns a rethinkdb instance with provided config', () => {
        const ds = dataService({})
        expect(ds.r).to.be.a('function')
      })
    })
    describe('it is a rethinkdb client', () => {
      it('returns the same rethinkdb instance', () => {
        const ds = dataService(rethinkdb)
        expect(ds.r).to.be.a('function')
        expect(ds.r).to.be.eql(rethinkdb)
      })
    })
    it('throws an error if null', () => {
      expect(dataService).to.throw('rethinkdb parameter config or client is required')
    })
    it('throws an error if not a config object or a rethinkdb client', () => {
      expect(() => dataService('I\'m a random string')).to.throw('first parameter must be a config object or client')
    })
  })

  describe('options param', () => {
    describe('models', () => {
      it('throws an error if not file path or array', () => {
        expect(() => dataService(rethinkdb, {models: 5})).to.throw('options.models must be a path to directory or array of model definition functions')
      })
      describe('is a file path', () => {
        it('returns thinky models', () => {
          const options = {models: path.join(__dirname, '/models')}
          const ds = dataService(rethinkdb, options)
          expect(ds).to.have.own.property('DummyModel')
          expect(ds).to.have.own.property('DummyModelTwo')
        })
      })
      describe('is an array', () => {
        it('returns thinky models', () => {
          const options = {models: [dummyModelModel, dummyModelModelTwo]}
          const ds = dataService(rethinkdb, options)
          expect(ds).to.have.own.property('DummyModel')
          expect(ds).to.have.own.property('DummyModelTwo')
        })
      })
    })
    describe('queries', () => {
      it('throws an error if not file path or array', () => {
        expect(() => dataService(rethinkdb, {queries: 5})).to.throw('options.queries must be a path to directory or array of query functions')
      })
      describe('is a file path', () => {
        it('returns query functions contained within the data service object', () => {
          const options = {queries: path.join(__dirname, '/queries')}
          const ds = dataService(rethinkdb, options)
          expect(ds).to.have.own.property('dummyQuery')
          expect(ds).to.have.own.property('dummyQueryTwo')
        })
      })
      describe('is an array', () => {
        it('returns query functions contained within the data service object', () => {
          const options = {queries: [dummyQuery, dummyQueryTwo]}
          const ds = dataService(rethinkdb, options)
          expect(ds).to.have.own.property('dummyQuery')
          expect(ds).to.have.own.property('dummyQueryTwo')
        })
      })
    })
  })
  describe('thinky models', async () => {
    const options = {models: [dummyModelModel, dummyModelModelTwo]}
    const ds = dataService(rethinkdb, options)
    const {DummyModel} = ds

    let dummy
    beforeEach(async () => {
      await truncateTables(rethinkdb)
      dummy = await DummyModel.save({})
    })
    it('save method sets updatedAt property', async () => {
      expect(dummy).to.be.an('object')
      expect(dummy).to.have.own.property('id')
      expect(dummy).to.have.own.property('updatedAt')
      expect(dummy.id).to.be.a('string')
      expect(dummy.updatedAt).to.be.an.instanceof(Date)
    })
    it('updateWithTimestamp sets updatedAt property to current time', async () => {
      const updatedDummy = await DummyModel
        .get(dummy.id)
        .updateWithTimestamp()
      expect(dummy.id).to.be.equal(updatedDummy.id)
      expect(dummy.updatedAt).to.be.an.instanceof(Date)
      expect(updatedDummy.updatedAt).to.be.an.instanceof(Date)
      expect(dummy.updatedAt).to.not.be.equal(updatedDummy.updatedAt)
    })
    it('upsert either saves or updates rows based on whether instance exists', async () => {
      const savedDummy = await DummyModel.upsert()
      expect(savedDummy).to.be.an('object')
      expect(savedDummy).to.have.own.property('id')
      expect(savedDummy).to.have.own.property('updatedAt')
      const updatedDummy = await DummyModel.upsert(dummy)
      expect(dummy.id).to.be.equal(updatedDummy.id)
      expect(dummy.updatedAt).to.not.be.equal(updatedDummy.updatedAt)
    })
    it('creates thinky model associations', async () => {
      const {DummyModelTwo} = ds
      const dummyTwo = await DummyModelTwo.save({
        dummyModelId: dummy.id,
        name: 'My Name is DummyTwo and I belong to Dummy',
      })
      const dummyTwoJoined = await DummyModelTwo.get(dummyTwo.id)
        .getJoin()
        .run()
      expect(dummyTwoJoined).has.own.property('dummys')
    })
  })
})
