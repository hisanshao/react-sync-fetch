'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dispatchError = exports.STATUS_FAILURE = exports.STATUS_SUCCESS = exports.STATUS_REQUEST = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STATUS_REQUEST = 'request'; /* global fetch */

var STATUS_SUCCESS = 'success';
var STATUS_FAILURE = 'failure';
var fetchMiddleware = createSyncFetchMiddleware();
var dispatchErrorMiddleware = function dispatchErrorMiddleware() {
  return false;
};
var dispatchError = function dispatchError(callback) {
  dispatchErrorMiddleware = callback;
};

var createSyncFetchMiddleware = function createSyncFetchMiddleware() {
  return function (_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;
    return function (next) {
      return function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(action) {
          var response, err, _err;

          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!(!action || !action.endpoint && !action.syncEvents || action.status)) {
                    _context.next = 2;
                    break;
                  }

                  return _context.abrupt('return', next(action));

                case 2:
                  if (!(action && action.syncEvents && action.action)) {
                    _context.next = 6;
                    break;
                  }

                  action.action(getState, action.syncEvents, function (syncEvent) {
                    dispatch((0, _assign2.default)({}, syncEvent, {
                      status: STATUS_REQUEST
                    }));
                  }, function (syncEvent, payload) {
                    if (payload && payload.code && payload.message) {
                      if (!dispatchErrorMiddleware(payload)) {
                        dispatch((0, _assign2.default)({}, syncEvent, {
                          status: STATUS_FAILURE,
                          error: payload
                        }));
                      }
                    } else {
                      dispatch((0, _assign2.default)({}, syncEvent, {
                        status: STATUS_SUCCESS,
                        payload: payload
                      }));
                    }
                  });
                  _context.next = 28;
                  break;

                case 6:
                  if (!(action && action.endpoint)) {
                    _context.next = 28;
                    break;
                  }

                  dispatch((0, _assign2.default)({}, action, {
                    status: STATUS_REQUEST
                  }));
                  response = void 0;
                  _context.prev = 9;
                  _context.next = 12;
                  return fetch(action.endpoint, action);

                case 12:
                  response = _context.sent;

                  if (!(response && response.status >= 400)) {
                    _context.next = 16;
                    break;
                  }

                  err = { code: response.status, message: response.statusText };
                  throw err;

                case 16:
                  _context.next = 18;
                  return response.json();

                case 18:
                  response = _context.sent;

                  if (response.success) {
                    _context.next = 22;
                    break;
                  }

                  _err = { code: response.code, message: response.msg };
                  throw _err;

                case 22:
                  dispatch((0, _assign2.default)({}, action, {
                    status: STATUS_SUCCESS,
                    payload: response.data
                  }));
                  _context.next = 28;
                  break;

                case 25:
                  _context.prev = 25;
                  _context.t0 = _context['catch'](9);

                  if (_context.t0 && _context.t0.code && _context.t0.message) {
                    if (!dispatchErrorMiddleware(response.data)) {
                      dispatch((0, _assign2.default)({}, action, {
                        status: STATUS_FAILURE,
                        error: response.data
                      }));
                    }
                  } else {
                    dispatch((0, _assign2.default)({}, action, {
                      status: STATUS_FAILURE,
                      error: { code: -1, message: JSON.stringify(_context.t0) }
                    }));
                  }

                case 28:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[9, 25]]);
        }));

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      }();
    };
  };
};

exports.default = fetchMiddleware;
exports.STATUS_REQUEST = STATUS_REQUEST;
exports.STATUS_SUCCESS = STATUS_SUCCESS;
exports.STATUS_FAILURE = STATUS_FAILURE;
exports.dispatchError = dispatchError;
//# sourceMappingURL=index.js.map