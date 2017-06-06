/* global describe, it */

import chai from 'chai'
import assign from 'lodash/assign'
import fetchMiddleware, {
  STATUS_REQUEST,
  STATUS_SUCCESS,
  STATUS_FAILURE,
  dispatchError
} from '../src/'

const assert = chai.assert

describe('redux-fetch middleware', () => {
  describe('exports', () => {
    it('typeof function', () => {
      assert.typeOf(fetchMiddleware, 'function')
    })

    describe('constant STATUS_REQUEST', () => {
      it('typeof string', () => {
        assert.typeOf(STATUS_REQUEST, 'string')
      })
      it('equal "request"', () => {
        assert.equal(STATUS_REQUEST, 'request')
      })
    })

    describe('constant STATUS_SUCCESS', () => {
      it('typeof string', () => {
        assert.typeOf(STATUS_SUCCESS, 'string')
      })
      it('equal "success"', () => {
        assert.equal(STATUS_SUCCESS, 'success')
      })
    })

    describe('constant STATUS_FAILURE', () => {
      it('typeof string', () => {
        assert.typeOf(STATUS_FAILURE, 'string')
      })
      it('equal "failure"', () => {
        assert.equal(STATUS_FAILURE, 'failure')
      })
    })
  })

  describe('dispatchError function', () => {
    it('typeof string', () => {
      assert.typeOf(dispatchError, 'function')
    })
    it('dispatchError() equal false', () => {
      assert.equal(dispatchError(function () { return false }, false))
    })
    it('dispatchError() equal true', () => {
      assert.equal(dispatchError(function () { return true }, true))
    })
  })

  describe('fetch middleware', () => {
    const doDispatch = () => {}
    const doGetState = () => {}
    const nextHandler = fetchMiddleware({dispatch: doDispatch, getState: doGetState})

    it('must return a function to handle next', () => {
      assert.isFunction(nextHandler)
      assert.strictEqual(nextHandler.length, 1)
    })

    describe('handle next', () => {
      it('must return a function to handle action', () => {
        const actionHandler = nextHandler()

        assert.isFunction(actionHandler)
        assert.strictEqual(actionHandler.length, 1)
      })

      describe('handle action', () => {
        it('must pass action to next if not a fetch type object', done => {
          const actionObj = {}

          const actionHandler = nextHandler(action => {
            chai.assert.strictEqual(action, actionObj)
            done()
          })

          actionHandler(actionObj)
        })

        it('must return the return value of next if not a type object', () => {
          const expected = 'redux'
          const actionHandler = nextHandler(() => expected)

          const outcome = actionHandler()
          assert.strictEqual(outcome + '', '[object Promise]')
        })

        describe('handle fetch type action', function () {
          const doGetState = () => {}

          it('must dispatch success status action', (done) => {
            const ACTION_TYPE = 'fetchDataSuccess'
            const doDispatch = (action) => {
              assert.equal(action.type, ACTION_TYPE)
              assert.typeOf(action, 'object')
              assert.typeOf(action.status, 'string')

              switch (action.status) {
                case STATUS_SUCCESS:
                  assert.typeOf(action.payload, 'object')
                  done()
                  break
              }
            }
            const nextHandler = fetchMiddleware({dispatch: doDispatch, getState: doGetState})
            const actionHandler = nextHandler()
            actionHandler({
              type: ACTION_TYPE,
              endpoint: 'http://mock.avosapps.com/leo/1.0/h5/contract/get',
              method: 'GET',
              requestData: {time: ''}
            })
          })

          it('must dispatch failure status action', done => {
            dispatchError(function () { return false })
            const ACTION_TYPE = 'fetchDataFailure'
            const doDispatch = (action) => {
              assert.equal(action.type, ACTION_TYPE)
              assert.typeOf(action, 'object')
              assert.typeOf(action.status, 'string')

              switch (action.status) {
                case STATUS_FAILURE:
                  assert.typeOf(action.error, 'object')
                  done()
                  break
              }
            }
            const nextHandler = fetchMiddleware({dispatch: doDispatch, getState: doGetState})
            const actionHandler = nextHandler()
            actionHandler({
              type: ACTION_TYPE,
              endpoint: 'http://mock.avosapps.com/test',
              method: 'GET',
              requestData: {deviceNo: ''}
            })
          })
        })
        describe('handle fetch sync type action', function () {
          const doGetState = () => {}

          it('must dispatch success status action', (done) => {
            let count = 0
            const ACTION_TYPE = 'fetchDataSuccess'
            const ACTION_TYPE1 = 'fetchDataSuccess1'
            const doDispatch = (action) => {
              assert.typeOf(action.type, 'string')
              assert.typeOf(action, 'object')
              assert.typeOf(action.status, 'string')

              switch (action.status) {
                case STATUS_SUCCESS:
                  assert.typeOf(action.payload, 'object')
                  count++
                  if (count === 4) done()
                  break
              }
            }
            const nextHandler = fetchMiddleware({dispatch: doDispatch, getState: doGetState})
            const actionHandler = nextHandler()
            actionHandler({
              type: 'fetch',
              funcs: [
                [{
                  type: ACTION_TYPE,
                  endpoint: 'http://mock.avosapps.com/leo/1.0/h5/contract/get',
                  mergeRequestData: (lastResult) => {
                    let requestData = assign({time: ''}, lastResult)
                    return requestData
                  },
                  method: 'GET'
                }],
                [{
                  type: ACTION_TYPE,
                  endpoint: 'http://mock.avosapps.com/leo/1.0/h5/contract/get',
                  mergeRequestData: (lastResult) => {
                    let requestData = assign({time: ''}, lastResult)
                    return requestData
                  },
                  method: 'GET'
                }, {
                  type: ACTION_TYPE,
                  endpoint: 'http://mock.avosapps.com/leo/1.0/h5/contract/get',
                  mergeRequestData: (lastResult) => {
                    let requestData = assign({time: ''}, lastResult)
                    return requestData
                  },
                  method: 'GET'
                }],
                [{
                  type: ACTION_TYPE1,
                  mergeRequestData: (lastResult) => {
                    let requestData = assign({time: ''}, lastResult[0])
                    return requestData
                  },
                  method: 'GET',
                  endpoint: 'http://mock.avosapps.com/leo/1.0/h5/contract/get'
                }]
              ]
            })
          })

          it('must dispatch failure status action', done => {
            dispatchError(function () { return false })
            const ACTION_TYPE = 'fetchDataFailure'
            const ACTION_TYPE1 = 'fetchDataFailure1'
            const doDispatch = (action) => {
              assert.typeOf(action.type, 'string')
              assert.typeOf(action.status, 'string')
              assert.typeOf(action, 'object')

              switch (action.status) {
                case STATUS_FAILURE:
                  assert.typeOf(action.error, 'object')
                  done()
                  break
              }
            }
            const nextHandler = fetchMiddleware({dispatch: doDispatch, getState: doGetState})
            const actionHandler = nextHandler()
            actionHandler({
              type: 'fetch',
              funcs: [
                [{
                  type: ACTION_TYPE,
                  endpoint: 'http://mock.avosapps.com/leo/1.0/h5/contract/get',
                  mergeRequestData: (lastResult) => {
                    let requestData = assign({time: ''}, lastResult)
                    return requestData
                  },
                  method: 'GET'
                }],
                [{
                  type: ACTION_TYPE1,
                  mergeRequestData: (lastResult) => {
                    let requestData = assign({deviceNo: 'xd1701034119'}, lastResult)
                    return requestData
                  },
                  method: 'GET',
                  endpoint: 'http://mock.avosapps.com/test'
                }]
              ]
            })
          })
        })
      })
    })

    describe('handle error', () => {
      it('must throw if argument is non-object', done => {
        try {
          fetchMiddleware()
        } catch (err) {
          done()
        }
      })
    })
  })
})
