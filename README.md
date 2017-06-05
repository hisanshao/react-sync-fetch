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

## action
import { wrapAction } from 'react-sync-fetch'
const FETCH_SOMETHING = 'fetch_something'
const fetchGet = (params) => {
  return {
    type: FETCH_SOMETHING,
    endpoint: '/api',
    requestData: params,
    method: 'GET' // 'GET', 'POST'
  }
}

const fetchSyncGet = (params) => {
  return {
    type: 'fetch',
    syncEvents: [{
      type: FETCH_SOMETHING,
      endpoint: '/api1',
      mergeRequestData: (lastResult) => {
        let requestData = assign(params, lastResult)
        return requestData
      },
      method: 'GET' // 'GET', 'POST'
    }, {
      type: FETCH_SOMETHING,
      endpoint: '/api2',
      mergeRequestData: (lastResult) => {
        let requestData = assign(params, lastResult)
        return requestData
      },
      method: 'GET' // 'GET', 'POST'
    }]
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