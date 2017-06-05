# react-sync-fetch

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)[![Build Status](https://travis-ci.org/hisanshao/react-sync-fetch.svg?branch=master)](https://travis-ci.org/hisanshao/react-sync-fetch)

simple fetch with async/await feature

# Install
```
npm install --save react-sync-fetch
```

# Example Usage
```
## configureStore.js

import Redux, {
  createStore,
  applyMiddleware,
  compose
} from 'redux'
import fetchMiddleware, {
  STATUS_REQUEST,
  STATUS_SUCCESS,
  STATUS_FAILURE,
  dispatchError
} from 'react-sync-fetch'
const API_CODE_NEED_LOGIN = 206

dispatchError((error = { code: -1, message: 'unknown error' }) => {
  if (error.code && error.code === API_CODE_NEED_LOGIN) {
    location.href = '/login' + encodeURIComponent(location.href)
    return true
  }
  return false
})

const composeArray = [
  applyMiddleware(fetchMiddleware)
]
const store = compose.apply(Redux, composeArray)(createStore)(reducer)

## utils/fetch.js

import { url } from 'utils'
import assign from 'lodash/assign'

const wrapAction = (action) => {
  return assign(action, { credentials: 'same-origin' }, action.method.toUpperCase() === 'POST' ? {
    endpoint: url(action.endpoint),
    body: 'data=' + encodeURIComponent(JSON.stringify(action.body) || {}),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  } : {
    endpoint: url(action.endpoint) + ('&data=' + encodeURIComponent(JSON.stringify(action.requestData || {})))
  })
}

const fetchAction = async (api, params) => {
  let response
  try {
    if (params.method.toUpperCase() === 'POST') {
      response = await fetch(url(api), {
        credentials: 'same-origin',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(JSON.stringify(params.requestData))
      })
    } else {
      response = await fetch(`${url(api)}&data=${encodeURIComponent(JSON.stringify(params.requestData || {}))}`, {
        credentials: 'same-origin'
      })
    }
    if (response && response.status >= 400) {
      return {code: response.status, message: response.statusText}
    }
    response = await response.json()
  } catch (error) {
    return {code: -1, message: JSON.stringify(error)}
  }
  if (!response.success) {
    return {code: response.code, message: response.msg}
  }
  return response.data
}

export {
  wrapAction,
  fetchAction
}

## action
import { fetchAction, wrapAction } from 'utils/fetch'
const FETCH_SOMETHING = 'fetch_something'
const activityActivilegeFetchGetPromotion = (params) => {
  return wrapAction({
    type: FETCH_SOMETHING,
    endpoint: '/api',
    requestData: params,
    method: 'GET' // 'GET', 'POST'
  })
}

const test = (params) => {
  return {
    type: 'fetch',
    syncEvents: [{
      type: FETCH_SOMETHING,
      endpoint: '/api1',
      requestData: params,
      method: 'GET' // 'GET', 'POST'
    }, {
      type: FETCH_SOMETHING,
      endpoint: '/api2',
      requestData: params,
      method: 'GET' // 'GET', 'POST'
    }],
    action: async (getState, syncEvents, dispatchRequest, dispatchComplete) => {
      let data1, data2
      if (!getState().data1) {
        dispatchRequest(syncEvents[0])
        data1 = await fetchAction(syncEvents[0].endpoint, syncEvents[0])
        dispatchComplete(syncEvents[0], data1)
      }
      if (!getState().data2) {
        dispatchRequest(syncEvents[1])
        data2 = await fetchAction(syncEvents[1].endpoint, syncEvents[1])
        dispatchComplete(syncEvents[1], data2)
      }
    }
  }
}

## reducer

const FETCH_SOMETHING = 'fetch_something'

function reducer(state, action) {
  if (action.type === FETCH_SOMETHING) {
    switch (state.status) {
      case STATUS_REQUEST
        // fetch start
        break
      case STATUS_SUCCESS:
        // fetch success
        break
      case STATUS_FAILURE:
        // fetch error
        break
    }
  }
}
```