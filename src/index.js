/* global fetch */

import assign from 'lodash/assign'

const STATUS_REQUEST = 'request'
const STATUS_SUCCESS = 'success'
const STATUS_FAILURE = 'failure'

let createSyncFetchMiddleware = () => {
  return ({ dispatch, getState }) => next => async (action) => {
    if (!action || (!action.endpoint && !action.syncEvents) || action.status) return next(action)
    if (action && action.syncEvents && action.action) {
      action.action(getState, action.syncEvents, (syncEvent) => {
        dispatch(assign({}, syncEvent, {
          status: STATUS_REQUEST
        }))
      }, (syncEvent, payload) => {
        if (payload && payload.code && payload.message) {
          if (!dispatchErrorMiddleware(payload)) {
            dispatch(assign({}, syncEvent, {
              status: STATUS_FAILURE,
              error: payload
            }))
          }
        } else {
          dispatch(assign({}, syncEvent, {
            status: STATUS_SUCCESS,
            payload: payload
          }))
        }
      })
    } else if (action && action.endpoint) {
      dispatch(assign({}, action, {
        status: STATUS_REQUEST
      }))
      let response
      try {
        response = await fetch(action.endpoint, action)
        if (response && response.status >= 400) {
          let err = {code: response.status, message: response.statusText}
          throw err
        }
        response = await response.json()
        if (!response.success) {
          let err = {code: response.code, message: response.msg}
          throw err
        }
        dispatch(assign({}, action, {
          status: STATUS_SUCCESS,
          payload: response.data
        }))
      } catch (error) {
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
    }
  }
}

const fetchMiddleware = createSyncFetchMiddleware()
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
