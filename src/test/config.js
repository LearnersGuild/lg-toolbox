/* eslint-disable import/no-unassigned-import, prefer-arrow-callback,
import/no-extraneous-dependencies */
require('babel-core/register')
require('babel-polyfill')

const jsdom = require('jsdom')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinonChai = require('sinon-chai')

// jsdom setup
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
const win = doc.defaultView

global.document = doc
global.window = win
global.navigator = win.navigator
global.getComputedStyle = win.getComputedStyle

// helpers
global.testContext = function (filename) {
  return filename.slice(1).split('/').reduce(function (ret, curr) {
    const currWithoutTests = curr === '__tests__' ? null : String.toString(`/${curr}`)
    const value = ret.useCurr && currWithoutTests ? String(ret.value + currWithoutTests) : ret.value
    const useCurr = ret.useCurr || curr === 'echo'
    return {useCurr, value}
  }, {useCurr: false, value: ''}).value.replace('.test.js', '').slice(1)
}

// setup chai and make it available in all tests
chai.use(sinonChai)
chai.use(chaiAsPromised)
global.expect = chai.expect
global.assert = chai.assert
