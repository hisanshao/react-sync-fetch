/* global fetch */

import assign from 'lodash/assign'
/* istanbul ignore else */
if (typeof fetch === 'undefined') {
  require('es6-promise').polyfill()
  require('isomorphic-fetch')
}

const STATUS_REQUEST = 'request'
const STATUS_SUCCESS = 'success'
const STATUS_FAILURE = 'failure'

function url (api) {
  api += '?t=' + +new Date()
  return api
}

function fetchError (dispatch, action, error) {
  if (error && error.code && error.message) {
    if (!dispatchErrorMiddleware(error)) {
      dispatch(assign({}, action, {
        status: STATUS_FAILURE,
        error: error
      }))
    }
  } else {
    dispatch(assign({}, action, {
      status: STATUS_FAILURE,
      error: {code: -1, message: JSON.stringify(error)}
    }))
  }
}

function fetchSuccess (dispatch, action, response) {
  if (!response.success) {
    let err = {code: response.code, message: response.message}
    throw err
  }
  dispatch(assign({}, action, {
    status: STATUS_SUCCESS,
    payload: response.data
  }))
  return response.data
}
let createSyncFetchMiddleware = () => {
  return ({ dispatch, getState }) => next => async (action) => {
    if (!action || (!action.endpoint && !action.syncEvents) || action.status) return next(action)
    if (action && action.syncEvents) {
      let results = []
      for (let i = 0; i < action.syncEvents.length; i++) {
        dispatch(assign({}, action, {
          status: STATUS_REQUEST
        }))
        let response, childAction
        childAction = action.syncEvents[i]
        try {
          childAction.requestData = childAction.mergeRequestData(i === 0 ? {} : results[i - 1])
          response = await fetch(`${url(childAction.endpoint)}&data=${encodeURIComponent(JSON.stringify(childAction.requestData || {}))}`, childAction)
          if (response && response.status >= 400) {
            let err = {code: response.status, message: response.statusText}
            throw err
          }
          response = await response.json()
          results.push(fetchSuccess(dispatch, childAction, response))
        } catch (error) {
          fetchError(dispatch, childAction, error)
        }
      }
    } else if (action && action.endpoint) {
      dispatch(assign({}, action, {
        status: STATUS_REQUEST
      }))
      let response
      try {
        response = await fetch(`${url(action.endpoint)}&data=${encodeURIComponent(JSON.stringify(action.requestData || {}))}`, action)
        if (response && response.status >= 400) {
          let err = {code: response.status, message: response.statusText}
          throw err
        }
        response = await response.json()
        fetchSuccess(dispatch, action, response)
      } catch (error) {
        fetchError(dispatch, action, error)
      }
    }
  }
}

let fetchMiddleware = createSyncFetchMiddleware()
let dispatchErrorMiddleware = () => { return false }
let dispatchError = (callback) => {
  dispatchErrorMiddleware = callback
}

export default fetchMiddleware
export {
  STATUS_REQUEST,
  STATUS_SUCCESS,
  STATUS_FAILURE,
  dispatchError
}
