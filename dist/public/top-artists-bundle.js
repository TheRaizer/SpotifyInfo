/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.24.0"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./src/public/components/SelectableTabEls.ts":
/*!***************************************************!*\
  !*** ./src/public/components/SelectableTabEls.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
class SelectableTabEls {
    /**
     * Removes the required CSS classes to the current elements.
     */
    unselectEls() {
        if (this.btn && this.borderCover) {
            this.btn.classList.remove(config_1.config.CSS.CLASSES.selected);
            this.borderCover.classList.remove(config_1.config.CSS.CLASSES.selected);
        }
    }
    /**
     * Adds the required CSS classes to the current elements.
     */
    selectEls() {
        if (this.btn && this.borderCover) {
            this.btn.classList.add(config_1.config.CSS.CLASSES.selected);
            this.borderCover.classList.add(config_1.config.CSS.CLASSES.selected);
        }
    }
    /**
     * Select new tab and unselect previous tab.
     * @param {Element} btn the button for the tab that will be selected.
     * @param {Element} borderCover the border cover for the tab that will be selected.
     */
    selectNewTab(btn, borderCover) {
        // unselect the previous tab
        this.unselectEls();
        // reassign the new tab elements
        this.btn = btn;
        this.borderCover = borderCover;
        // select the new tab
        this.selectEls();
    }
}
exports["default"] = SelectableTabEls;


/***/ }),

/***/ "./src/public/components/album.ts":
/*!****************************************!*\
  !*** ./src/public/components/album.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class Album {
    constructor(name, externalUrl) {
        this.name = name;
        this.externalUrl = externalUrl;
    }
}
exports["default"] = Album;


/***/ }),

/***/ "./src/public/components/artist.ts":
/*!*****************************************!*\
  !*** ./src/public/components/artist.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateArtistsFromData = void 0;
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
const track_1 = __webpack_require__(/*! ./track */ "./src/public/components/track.ts");
const card_1 = __importDefault(__webpack_require__(/*! ./card */ "./src/public/components/card.ts"));
const doubly_linked_list_1 = __importDefault(__webpack_require__(/*! ./doubly-linked-list */ "./src/public/components/doubly-linked-list.ts"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
class Artist extends card_1.default {
    constructor(id, name, genres, followerCount, externalUrl, images) {
        super();
        this.artistId = id;
        this.name = name;
        this.genres = genres;
        this.followerCount = followerCount;
        this.externalUrl = externalUrl;
        this.imageUrl = (0, config_1.getValidImage)(images);
        this.topTracks = undefined;
    }
    /**
     *  Produces the card element of this artist.
     *
     * @param {Number} idx - The card index to use for the elements id suffix
     * @returns {ChildNode} - The converted html string to an element
     */
    getArtistHtml(idx) {
        const id = `${config_1.config.CSS.IDs.artistPrefix}${idx}`;
        this.cardId = id;
        let genreList = '';
        this.genres.forEach((genre) => {
            genreList += '<li>' + genre + '</li>';
        });
        const html = `
      <div class="${config_1.config.CSS.CLASSES.artist} ${config_1.config.CSS.CLASSES.fadeIn}" id="${this.cardId}">
        <section class="${config_1.config.CSS.CLASSES.content}">
          <header class="artist-base">
            <img src=${this.imageUrl} alt="Artist"/>
            <h3><a href=${this.externalUrl} target="_blank">${this.name}</a></h3>
            <ul class="genres">
              ${genreList}
            </ul>
          </header>
          <div class="${config_1.config.CSS.CLASSES.tracksArea}">
            <section class="${config_1.config.CSS.CLASSES.artistTopTracks}">
              <header>
                <h4>Top Tracks</h4>
              </header>
              <ul class="${config_1.config.CSS.CLASSES.scrollBar} ${config_1.config.CSS.CLASSES.trackList}">
              </ul>
            </section>
          </div>
        </section>
      </div>
      `;
        return (0, config_1.htmlToEl)(html);
    }
    /**
     * Produces the card element of this artist.
     *
     * @param {Number} idx - The card index to use for the elements id suffix
     * @returns {ChildNode} - The converted html string to an element
     */
    getArtistCardHtml(idx, unanimatedAppear = false) {
        const id = `${config_1.config.CSS.IDs.artistPrefix}${idx}`;
        this.cardId = id;
        const appearClass = unanimatedAppear ? config_1.config.CSS.CLASSES.appear : '';
        const html = `
            <div class="${config_1.config.CSS.CLASSES.rankCard} ${config_1.config.CSS.CLASSES.fadeIn} ${appearClass}">
              <div class="${config_1.config.CSS.CLASSES.flipCard} ${config_1.config.CSS.CLASSES.noSelect}  ${config_1.config.CSS.CLASSES.expandOnHover}">
                <button class="${config_1.config.CSS.CLASSES.card} ${config_1.config.CSS.CLASSES.flipCardInner} ${config_1.config.CSS.CLASSES.artist}" id="${this.getCardId()}">
                  <div class="${config_1.config.CSS.CLASSES.flipCardFront}"  title="Click to view more Info">
                    <img src="${this.imageUrl}" alt="Album Cover"></img>
                    <div>
                      <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap} ${config_1.config.CSS.CLASSES.scrollingText}">${this.name}</h4>
                    </div>
                  </div>
                  <div class=${config_1.config.CSS.CLASSES.flipCardBack}>
                    <h3><a href="${this.externalUrl}" target="_blank" ${config_1.config.CSS.ATTRIBUTES.restrictFlipOnClick}="true">${this.name}</a></h3>
                    <h3>Followers:</h3>
                    <p>${this.followerCount}</p>
                    <h3>Genres:</h3>
                    <p>${this.genres}</p>
                  </div>
                </button>
              </div>
            </div>
          `;
        return (0, config_1.htmlToEl)(html);
    }
    /**
     * Load top tracks from the spotify API and convert the data into a DoublyLinkedList of Track instances.
     * @returns {DoublyLinkedList<Track>} list of Tracks obtained from the data.
     */
    loadTopTracks() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield axios_1.default.get(config_1.config.URLs.getArtistTopTracks(this.artistId));
            const tracksData = res.data.tracks;
            const trackObjs = new doubly_linked_list_1.default();
            (0, track_1.generateTracksFromData)(tracksData, trackObjs);
            this.topTracks = trackObjs;
            return trackObjs;
        });
    }
    /**
     * Whether the top tracks of this artist have been loaded depends on whether this.topTracks has been assigned.
     * @returns {boolean} Whether the top tracks have been loaded.
     */
    hasLoadedTopTracks() {
        return this.topTracks !== undefined;
    }
}
/**
 * Generates instances of the Artist class given an array of ArtistData.
 * @param {Array<ArtistData>} datas the data to be used to create the Artist instances.
 * @param {Array<Artist>} artistArr ref to the array that will store the created Artist instances.
 * @returns {Array<Artist>} the artist array that was given and has now been mutated.
 */
function generateArtistsFromData(datas, artistArr) {
    datas.forEach((data) => {
        artistArr.push(new Artist(data.id, data.name, data.genres, data.followers.total, data.external_urls.spotify, data.images));
    });
    return artistArr;
}
exports.generateArtistsFromData = generateArtistsFromData;
exports["default"] = Artist;


/***/ }),

/***/ "./src/public/components/asyncSelectionVerif.ts":
/*!******************************************************!*\
  !*** ./src/public/components/asyncSelectionVerif.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class AsyncSelectionVerif {
    constructor() {
        this._currSelectedVal = null;
        // used to ensure that an object that has loaded will not be loaded again
        this.hasLoadedCurrSelected = false;
    }
    get currSelectedValNoNull() {
        if (!this._currSelectedVal) {
            throw new Error('Currently selected value is accessed without being assigned');
        }
        else {
            return this._currSelectedVal;
        }
    }
    get currSelectedVal() {
        return this._currSelectedVal;
    }
    /**
     * Change the value of the currently selected and reset the has loaded boolean.
     *
     * @param {T} currSelectedVal the value to change the currently selected value too.
     */
    selectionChanged(currSelectedVal) {
        this._currSelectedVal = currSelectedVal;
        this.hasLoadedCurrSelected = false;
    }
    /**
     * Checks to see if a selected value post load is valid by
     * comparing it to the currently selected value and verifying that
     * the currently selected has not already been loaded.
     *
     * @param {T} postLoadVal data that has been loaded
     * @returns {Boolean} whether the loaded selection is valid
     */
    isValid(postLoadVal) {
        if (this._currSelectedVal !== postLoadVal || this.hasLoadedCurrSelected) {
            return false;
        }
        else {
            // if is valid then we assume that this value will be loaded
            this.hasLoadedCurrSelected = true;
            return true;
        }
    }
}
exports["default"] = AsyncSelectionVerif;


/***/ }),

/***/ "./src/public/components/card.ts":
/*!***************************************!*\
  !*** ./src/public/components/card.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class Card {
    constructor() {
        this.cardId = '';
    }
    /**
     * Get the id that corrosponds to an element id for the corrosponding card element.
     * @returns {string} the card element id.
     */
    getCardId() {
        if (this.cardId === 'null') {
            throw new Error('Card id was asking to be retrieved but is null');
        }
        else {
            return this.cardId;
        }
    }
}
exports["default"] = Card;


/***/ }),

/***/ "./src/public/components/doubly-linked-list.ts":
/*!*****************************************************!*\
  !*** ./src/public/components/doubly-linked-list.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/* Copyright (c) 2009 Nicholas C. Zakas. All rights reserved. */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.arrayToDoublyLinkedList = exports.DoublyLinkedListNode = void 0;
/**
 * Represents a single node in a DoublyLinkedList.
 * @class DoublyLinkedListNode
 */
class DoublyLinkedListNode {
    /**
     * Creates a new instance of DoublyLinkedListNode.
     * @param {*} data The data to store in the node.
     */
    constructor(data) {
        /**
         * The data that this node stores.
         * @property data
         * @type *
         */
        this.data = data;
        /**
         * A pointer to the next node in the DoublyLinkedList.
         * @property next
         * @type ?DoublyLinkedListNode
         */
        this.next = null;
        /**
         * A pointer to the previous node in the DoublyLinkedList.
         * @property previous
         * @type ?DoublyLinkedListNode
         */
        this.previous = null;
    }
}
exports.DoublyLinkedListNode = DoublyLinkedListNode;
/**
 * A doubly linked list implementation in JavaScript.
 * @class DoublyLinkedList
 */
class DoublyLinkedList {
    /**
     * Creates a new instance of DoublyLinkedList
     */
    constructor() {
        // pointer to first node in the list
        this.head = null;
        // pointer to last node in the list which points to null
        this.tail = null;
    }
    /**
     * Appends some data to the end of the list.
     * @param {T} data The data to add to the list.
     * @returns {void}
     */
    add(data) {
        /*
         * Create a new list node object and store the data in it.
         * This node will be added to the end of the existing list.
         */
        const newNode = new DoublyLinkedListNode(data);
        // special case: no nodes in the list yet
        if (this.head === null) {
            /*
             * Because there are no nodes in the list, just set the
             * `this.head` pointer to the new node.
             */
            this.head = newNode;
        }
        else {
            /*
             * Unlike in a singly linked list, we have a direct reference to
             * the last node in the list. Set the `next` pointer of the
             * current last node to `newNode` in order to append the new data
             * to the end of the list. Then, set `newNode.previous` to the current
             * tail to ensure backwards tracking work.
             */
            if (this.tail !== null) {
                this.tail.next = newNode;
            }
            newNode.previous = this.tail;
        }
        /*
         * Last, reset `this.tail` to `newNode` to ensure we are still
         * tracking the last node correctly.
         */
        this.tail = newNode;
    }
    /**
     * Inserts some data into the middle of the list. This method traverses
     * the existing list and places the data in a new node at a specific index.
     * @param {T} data The data to add to the list.
     * @param {number} index The zero-based index at which to insert the data.
     * @returns {void}
     * @throws {RangeError} If the index doesn't exist in the list.
     */
    insertBefore(data, index) {
        /*
         * Create a new list node object and store the data in it.
         * This node will be inserted into the existing list.
         */
        const newNode = new DoublyLinkedListNode(data);
        // special case: no nodes in the list yet
        if (this.head === null) {
            throw new RangeError(`Index ${index} does not exist in the list.`);
        }
        /*
         * Special case: if `index` is `0`, then no traversal is needed
         * and we need to update `this.head` to point to `newNode`.
         */
        if (index === 0) {
            /*
             * Ensure the new node's `next` property is pointed to the current
             * head.
             */
            newNode.next = this.head;
            /*
             * The current head's `previous` property needs to point to the new
             * node to ensure the list is traversable backwards.
             */
            this.head.previous = newNode;
            /*
             * Now it's safe to set `this.head` to the new node, effectively
             * making the new node the first node in the list.
             */
            this.head = newNode;
        }
        else {
            /*
             * The `current` variable is used to track the node that is being
             * used inside of the loop below. It starts out pointing to
             * `this.head` and is overwritten inside of the loop.
             */
            let current = this.head;
            /*
             * The `i` variable is used to track how deep into the list we've
             * gone. This important because it's the only way to know when
             * we've hit the `index` to insert into.
             */
            let i = 0;
            /*
             * Traverse the list nodes using `next` pointers, and make
             * sure to keep track of how many nodes have been visited. When
             * `i` is the same as `index`, it means we've found the location to
             * insert the new data.
             */
            while (current.next !== null && i < index) {
                current = current.next;
                i++;
            }
            /*
             * At this point, `current` is either the node to insert the new data
             * before, or the last node in the list. The only way to tell is if
             * `i` is still less than `index`, that means the index is out of range
             * and an error should be thrown.
             */
            if (i < index) {
                throw new RangeError(`Index ${index} does not exist in the list.`);
            }
            /*
             * If code continues to execute here, it means `current` is the node
             * to insert new data before.
             *
             * First, insert `newNode` after `current.previous` by updating
             * `current.previous.next` and `newNode.previous`.
             */
            current.previous.next = newNode;
            newNode.previous = current.previous;
            /*
             * Next, insert `current` after `newNode` by updating `newNode.next` and
             * `current.previous`.
             */
            newNode.next = current;
            current.previous = newNode;
        }
    }
    /**
     * Inserts some data into the middle of the list. This method traverses
     * the existing list and places the data in a new node after a specific index.
     * @param {*} data The data to add to the list.
     * @param {number} index The zero-based index after which to insert the data.
     * @returns {void}
     * @throws {RangeError} If the index doesn't exist in the list.
     */
    insertAfter(data, index) {
        /*
         * Create a new list node object and store the data in it.
         * This node will be inserted into the existing list.
         */
        const newNode = new DoublyLinkedListNode(data);
        // special case: no nodes in the list yet
        if (this.head === null) {
            throw new RangeError(`Index ${index} does not exist in the list.`);
        }
        /*
         * The `current` variable is used to track the node that is being
         * used inside of the loop below. It starts out pointing to
         * `this.head` and is overwritten inside of the loop.
         */
        let current = this.head;
        /*
         * The `i` variable is used to track how deep into the list we've
         * gone. This important because it's the only way to know when
         * we've hit the `index` to insert into.
         */
        let i = 0;
        /*
         * Traverse the list nodes similar to the `add()` method, but make
         * sure to keep track of how many nodes have been visited and update
         * the `previous` pointer in addition to `current`. When
         * `i` is the same as `index`, it means we've found the location to
         * insert the new data.
         */
        while (current !== null && i < index) {
            current = current.next;
            i++;
        }
        /*
         * At this point, `current` is either the node to insert the new data
         * before, or the last node in the list. The only way to tell is if
         * `i` is still less than `index`, that means the index is out of range
         * and an error should be thrown.
         */
        if (i < index) {
            throw new RangeError(`Index ${index} does not exist in the list.`);
        }
        /*
         * If code continues to execute here, it means `current` is the node
         * to insert new data after.
         */
        // special case: `current` is the tail, so reset `this.tail`
        if (this.tail === current) {
            this.tail = newNode;
        }
        else {
            /*
             * Otherwise, insert `newNode` before `current.next` by updating
             * `current.next.previous` and `newNode.node`.
             */
            current.next.previous = newNode;
            newNode.next = current.next;
        }
        /*
         * Next, insert `newNode` after `current` by updating `newNode.previous` and
         * `current.next`.
         */
        newNode.previous = current;
        current.next = newNode;
    }
    /**
     * Retrieves the data in the given position in the list.
     * @param {number} index The zero-based index of the node whose data
     *      should be returned.
     * @returns {*} The data in the "data" portion of the given node
     *      or undefined if the node doesn't exist.
     */
    get(index, asNode) {
        // ensure `index` is a positive value
        if (index > -1) {
            /*
             * The `current` variable is used to track the node that is being
             * used inside of the loop below. It starts out pointing to
             * `this.head` and is overwritten inside of the loop.
             */
            let current = this.head;
            /*
             * The `i` variable is used to track how deep into the list we've
             * gone. This is important because it's the only way to know when
             * we've hit the `index` to insert into.
             */
            let i = 0;
            /*
             * Traverse the list nodes, but make sure to keep track of how many
             * nodes have been visited and update the `previous` pointer in
             * addition to `current`. When `i` is the same as `index`, it means
             * we've found the location to insert the new data.
             */
            while (current !== null && i < index) {
                current = current.next;
                i++;
            }
            /*
             * At this point, `current` might be null if we've gone past the
             * end of the list. In that case, we return `undefined` to indicate
             * that the node at `index` was not found. If `current` is not
             * `null`, then it's safe to return `current.data`.
             */
            if (current !== null) {
                if (asNode) {
                    return current;
                }
                else {
                    return current.data;
                }
            }
            else {
                throw new RangeError(`index ${index} out of range`);
            }
        }
        else {
            throw new RangeError(`index ${index} out of range`);
        }
    }
    /**
     * Retrieves the index of the data in the list.
     * @param {T} data The data to search for.
     * @returns {number} The index of the first instance of the data in the list
     *      or -1 if not found.
     */
    indexOf(data) {
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the head and is overwritten inside
         * of the loop below.
         */
        let current = this.head;
        /*
         * The `index` variable is used to track how deep into the list we've
         * gone. This is important because this is the value that is returned
         * from this method.
         */
        let index = 0;
        /*
         * This loop checks each node in the list to see if it matches `data`.
         * If a match is found, it returns `index` immediately, exiting the
         * loop because there's no reason to keep searching. The search
         * continues until there are no more nodes to search (when `current` is `null`).
         */
        while (current !== null) {
            if (current.data === data) {
                return index;
            }
            // traverse to the next node in the list
            current = current.next;
            // keep track of where we are
            index++;
        }
        /*
         * If execution gets to this point, it means we reached the end of the
         * list and didn't find `data`. Just return -1 as the "not found" value.
         */
        return -1;
    }
    /**
     * Returns the first item that matches a given function.
     * @param {Function} matcher A function returning true when an item matches
     *      and false when an item doesn't match.
     * @returns {*} The first item that returns true from the matcher, undefined
     *      if no items match.
     */
    find(matcher, asNode = false) {
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the head and is overwritten inside
         * of the loop below.
         */
        let current = this.head;
        /*
         * This loop checks each node in the list to see if it matches.
         * If a match is found, it returns the data immediately, exiting the
         * loop because there's no reason to keep searching. The search
         * continues until there are no more nodes to search (when `current` is `null`).
         */
        while (current !== null) {
            if (matcher(current.data)) {
                if (asNode) {
                    return current;
                }
                return current.data;
            }
            // traverse to the next node in the list
            current = current.next;
        }
        /*
         * If execution gets to this point, it means we reached the end of the
         * list and didn't find `data`. Just return `undefined` as the
         * "not found" value.
         */
        throw new RangeError('No matching data found');
    }
    /**
     * Returns the index of the first item that matches a given function.
     * @param {Function} matcher A function returning true when an item matches
     *      and false when an item doesn't match.
     * @returns {number} The index of the first item that matches a given function
     *      or -1 if there are no matching items.
     */
    findIndex(matcher) {
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the head and is overwritten inside
         * of the loop below.
         */
        let current = this.head;
        /*
         * The `index` variable is used to track how deep into the list we've
         * gone. This is important because this is the value that is returned
         * from this method.
         */
        let index = 0;
        /*
         * This loop checks each node in the list to see if it matches.
         * If a match is found, it returns the index immediately, exiting the
         * loop because there's no reason to keep searching. The search
         * continues until there are no more nodes to search (when `current` is `null`).
         */
        while (current !== null) {
            if (matcher(current.data)) {
                return index;
            }
            // traverse to the next node in the list
            current = current.next;
            // keep track of where we are
            index++;
        }
        /*
         * If execution gets to this point, it means we reached the end of the
         * list and didn't find `data`. Just return -1 as the
         * "not found" value.
         */
        return -1;
    }
    /**
     * Removes the node from the given location in the list.
     * @param {number} index The zero-based index of the node to remove.
     * @returns {*} The data in the given position in the list.
     * @throws {RangeError} If index is out of range.
     */
    remove(index) {
        // special cases: no nodes in the list or `index` is negative
        if (this.head === null || index < 0) {
            throw new RangeError(`Index ${index} does not exist in the list.`);
        }
        // special case: removing the first node
        if (index === 0) {
            // store the data from the current head
            const data = this.head.data;
            // just replace the head with the next node in the list
            this.head = this.head.next;
            // special case: there was only one node, so also reset `this.tail`
            if (this.head === null) {
                this.tail = null;
            }
            else {
                this.head.previous = null;
            }
            // return the data at the previous head of the list
            return data;
        }
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the head and is overwritten inside
         * of the loop below.
         */
        let current = this.head;
        /*
         * The `i` variable is used to track how deep into the list we've
         * gone. This is important because it's the only way to know when
         * we've hit the `index` to remove.
         */
        let i = 0;
        /*
         * Traverse the list nodes similar to the `get()` method, but make
         * sure to keep track of how many nodes have been visited. When
         * `i` is the same as `index`, it means we've found the location to
         * remove.
         */
        while (current !== null && i < index) {
            // traverse to the next node
            current = current.next;
            // increment the count
            i++;
        }
        /*
         * If `current` isn't `null`, then that means we've found the node
         * to remove.
         */
        if (current !== null) {
            // skip over the node to remove
            current.previous.next = current.next;
            /*
             * If we are at the end of the list, then update `this.tail`.
             *
             * If we are not at the end of the list, then update the backwards
             * pointer for `current.next` to preserve reverse traversal.
             */
            if (this.tail === current) {
                this.tail = current.previous;
            }
            else {
                current.next.previous = current.previous;
            }
            // return the value that was just removed from the list
            return current.data;
        }
        /*
         * If we've made it this far, it means `index` is a value that
         * doesn't exist in the list, so throw an error.
         */
        throw new RangeError(`Index ${index} does not exist in the list.`);
    }
    /**
     * Removes all nodes from the list.
     * @returns {void}
     */
    clear() {
        // just reset both the head and tail pointer to null
        this.head = null;
        this.tail = null;
    }
    /**
     * Returns the number of nodes in the list.
     * @returns {number} The number of nodes in the list.
     */
    get size() {
        // special case: the list is empty
        if (this.head === null) {
            return 0;
        }
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the head and is overwritten inside
         * of the loop below.
         */
        let current = this.head;
        /*
         * The `count` variable is used to keep track of how many nodes have
         * been visited inside the loop below. This is important because this
         * is the value to return from this method.
         */
        let count = 0;
        /*
         * As long as `current` is not `null`, that means we're not yet at the
         * end of the list, so adding 1 to `count` and traverse to the next node.
         */
        while (current !== null) {
            count++;
            current = current.next;
        }
        /*
         * When `current` is `null`, the loop is exited at the value of `count`
         * is the number of nodes that were counted in the loop.
         */
        return count;
    }
    /**
     * The default iterator for the class.
     * @returns {Iterator} An iterator for the class.
     */
    [Symbol.iterator]() {
        return this.values();
    }
    /**
     * Create an iterator that returns each node in the list.
     * @returns {Generator} An iterator on the list.
     */
    *values() {
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the head and is overwritten inside
         * of the loop below.
         */
        let current = this.head;
        /*
         * As long as `current` is not `null`, there is a piece of data
         * to yield.
         */
        while (current !== null) {
            yield current.data;
            current = current.next;
        }
    }
    /**
     * Create an iterator that returns each node in the list in reverse order.
     * @returns {Generator} An iterator on the list.
     */
    *reverse() {
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the tail and is overwritten inside
         * of the loop below.
         */
        let current = this.tail;
        /*
         * As long as `current` is not `null`, there is a piece of data
         * to yield.
         */
        while (current !== null) {
            yield current.data;
            current = current.previous;
        }
    }
    /**
     * Converts the list into a string representation.
     * @returns {string} A string representation of the list.
     */
    toString() {
        return [...this].toString();
    }
    /**
     * Converts the doubly linked list to an array.
     * @returns {Array<T>} An array of the data from the linked list.
     */
    toArray() {
        return [...this];
    }
}
exports["default"] = DoublyLinkedList;
function arrayToDoublyLinkedList(arr) {
    const list = new DoublyLinkedList();
    arr.forEach((data) => {
        list.add(data);
    });
    return list;
}
exports.arrayToDoublyLinkedList = arrayToDoublyLinkedList;


/***/ }),

/***/ "./src/public/components/playback-sdk.ts":
/*!***********************************************!*\
  !*** ./src/public/components/playback-sdk.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkIfIsPlayingElAfterRerender = exports.isSamePlayingURI = exports.isSamePlayingURIWithEl = exports.playerPublicVars = void 0;
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
const doubly_linked_list_1 = __webpack_require__(/*! ./doubly-linked-list */ "./src/public/components/doubly-linked-list.ts");
const track_play_args_1 = __importDefault(__webpack_require__(/*! ./pubsub/event-args/track-play-args */ "./src/public/components/pubsub/event-args/track-play-args.ts"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const aggregator_1 = __importDefault(__webpack_require__(/*! ./pubsub/aggregator */ "./src/public/components/pubsub/aggregator.ts"));
const spotify_playback_element_1 = __importDefault(__webpack_require__(/*! ./spotify-playback-element */ "./src/public/components/spotify-playback-element.ts"));
/**
 * Load the volume from the redis session.
 * @returns {string} the value stored for volume 0-1.
 */
function loadVolume() {
    return __awaiter(this, void 0, void 0, function* () {
        const { res, err } = yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getPlayerVolumeData));
        if (err) {
            return '0';
        }
        else {
            return res.data;
        }
    });
}
/**
 * Save the volume to the redis session.
 */
function saveVolume(volume) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlayerVolumeData(volume)));
    });
}
exports.playerPublicVars = {
    isShuffle: false,
    isLoop: false
};
class SpotifyPlayback {
    constructor() {
        this.wasInShuffle = false;
        this.isExecutingAction = false;
        this.player = null;
        this.device_id = '';
        this.getStateInterval = null;
        this.selPlaying = {
            element: null,
            track_uri: '',
            playableNode: null,
            playableArr: null
        };
        this.playerIsReady = false;
        // reload player every 30 min to avoid timeout's
        this._loadWebPlayer();
        // pass it the "this." attributes in this scope because when a function is called from a different class the "this." attributes are undefined.
        this.webPlayerEl = new spotify_playback_element_1.default();
    }
    setVolume(percentage, player, save = false) {
        const newVolume = percentage / 100;
        player.setVolume(newVolume);
        if (save) {
            saveVolume(newVolume.toString());
        }
    }
    /**
     * Update the time shown when seeking.
     * @param percentage The percent that the bar has filled with respect to the entire bar
     * @param webPlayerEl The webplayer element that gives us access to the song progress bar
     */
    onSeeking(percentage, webPlayerEl) {
        // get the position by using the percent the progress bar.
        const seekPosition = webPlayerEl.songProgress.max * (percentage / 100);
        if (webPlayerEl.currTime == null) {
            throw new Error('Current time element is null');
        }
        // update the text content to show the time the user will be seeking too onmouseup.
        webPlayerEl.currTime.textContent = (0, config_1.millisToMinutesAndSeconds)(seekPosition);
    }
    /**
     * Function to run when the seeking action begins
     * @param player The spotify sdk player whose state we will use to change the song's progress bar's max value to the duration of the song.
     * @param webPlayerEl The web player element that will allow us to modify the progress bars max attribute.
     */
    onSeekStart(player, webPlayerEl) {
        player.getCurrentState().then((state) => {
            if (!state) {
                console.error('User is not playing music through the Web Playback SDK');
                return;
            }
            // when first seeking, update the max attribute with the duration of the song for use when seeking.
            webPlayerEl.songProgress.max = state.duration;
        });
    }
    /**
     * Function to run when you wish to seek to a certain position in a song.
     * @param percentage The percent that the bar has filled with respect to the entire bar
     * @param player the spotify sdk player that will seek the song to a given position
     * @param webPlayerEl the web player element that gives us access to the song progress bar.
     */
    seekSong(percentage, player, webPlayerEl) {
        if (!this.isExecutingAction) {
            this.isExecutingAction = true;
            // obtain the final position the user wishes to seek once mouse is up.
            const position = (percentage / 100) * webPlayerEl.songProgress.max;
            // seek to the chosen position.
            player.seek(position).then(() => {
                this.isExecutingAction = false;
            });
        }
    }
    _loadWebPlayer() {
        return __awaiter(this, void 0, void 0, function* () {
            // load the users saved volume if there isnt then load 0.4 as default.
            const volume = yield loadVolume();
            const NO_CONTENT = 204;
            if (window.Spotify) {
                // if the spotify sdk is already defined set player without setting onSpotifyWebPlaybackSDKReady meaning the window: Window is in a different scope
                // use window.Spotify.Player as spotify namespace is declared in the Window interface as per DefinitelyTyped -> spotify-web-playback-sdk -> index.d.ts https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/spotify-web-playback-sdk
                this.player = new window.Spotify.Player({
                    name: 'Spotify Info Web Player',
                    getOAuthToken: (cb) => {
                        console.log('get auth token');
                        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putRefreshAccessToken), () => {
                            (0, config_1.promiseHandler)(axios_1.default.request({ method: 'GET', url: config_1.config.URLs.getAccessToken }), (res) => {
                                if (res.status === NO_CONTENT || res.data === null) {
                                    throw new Error('access token has no content');
                                }
                                // give the token to callback
                                cb(res.data);
                            });
                        });
                    },
                    volume: parseInt(volume)
                });
                this._addListeners(volume);
                this.player.connect();
            }
            else {
                // of spotify sdk is undefined
                window.onSpotifyWebPlaybackSDKReady = () => {
                    // if getting token was succesful create spotify player using the window in this scope
                    this.player = new window.Spotify.Player({
                        name: 'Spotify Info Web Player',
                        getOAuthToken: (cb) => {
                            console.log('get auth token');
                            (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putRefreshAccessToken), () => {
                                (0, config_1.promiseHandler)(axios_1.default.request({ method: 'GET', url: config_1.config.URLs.getAccessToken }), (res) => {
                                    if (res.status === NO_CONTENT || res.data === null) {
                                        throw new Error('access token has no content');
                                    }
                                    // give the token to callback
                                    cb(res.data);
                                });
                            });
                        },
                        volume: parseInt(volume)
                    });
                    this._addListeners(volume);
                    this.player.connect();
                };
            }
        });
    }
    _addListeners(loadedVolume) {
        // Error handling
        this.player.addListener('initialization_error', ({ message }) => {
            console.error(message);
        });
        this.player.addListener('authentication_error', ({ message }) => {
            console.error(message);
            console.log('playback couldnt start');
        });
        this.player.addListener('account_error', ({ message }) => {
            console.error(message);
        });
        this.player.addListener('playback_error', ({ message }) => {
            console.error(message);
        });
        // Playback status updates
        this.player.addListener('player_state_changed', (state) => { });
        // Ready
        this.player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            this.device_id = device_id;
            // append web player element to DOM
            this.webPlayerEl.appendWebPlayerHtml(() => this.tryPlayPrev(this.selPlaying.playableNode), () => this.tryWebPlayerPause(this.selPlaying.playableNode), () => this.tryPlayNext(this.selPlaying.playableNode), () => this.onSeekStart(this.player, this.webPlayerEl), (percentage) => this.seekSong(percentage, this.player, this.webPlayerEl), (percentage) => this.onSeeking(percentage, this.webPlayerEl), (percentage, save) => this.setVolume(percentage, this.player, save), parseFloat(loadedVolume));
            this.playerIsReady = true;
        });
        // Not Ready
        this.player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });
    }
    resetDuration() {
        if (!this.isExecutingAction) {
            this.isExecutingAction = true;
            this.player.seek(0).then(() => { this.isExecutingAction = false; });
        }
    }
    /**
     * Tries to pause the current playing IPlayable node from the web player.
     *
     * @param currNode - the current IPlayable node that was/is playing
     */
    tryWebPlayerPause(currNode) {
        // check to see if this is the first node or if an action is processing
        if (!this.isExecutingAction && currNode !== null) {
            const prevTrack = currNode.data;
            console.log('Try player pause');
            this.setSelPlayingEl(new track_play_args_1.default(prevTrack, currNode, this.selPlaying.playableArr));
        }
    }
    /**
     * Tries to play the previous IPlayable given the current playing IPlayable node.
     *
     * @param currNode - the current IPlayable node that was/is playing
     */
    tryPlayPrev(currNode) {
        if (currNode === null) {
            // (if the player has just been put into shuffle mode then there should be no previous playables to go back too)
            return;
        }
        if (exports.playerPublicVars.isLoop) {
            this.resetDuration();
            return;
        }
        // if an action is processing we cannot do anything
        if (!this.isExecutingAction) {
            this.player.getCurrentState().then((state) => {
                if (state.position > 1000) {
                    this.resetDuration();
                }
                else {
                    // if the player IS in shuffle mode
                    if (exports.playerPublicVars.isShuffle && !this.wasInShuffle) {
                        return;
                    }
                    let prevTrackNode = currNode.previous;
                    // if the player WAS in shuffle mode
                    if (!exports.playerPublicVars.isShuffle && this.wasInShuffle) {
                        prevTrackNode = this.unShuffle(-1);
                    }
                    if (prevTrackNode === null) {
                        return;
                    }
                    const prevTrack = prevTrackNode.data;
                    this.setSelPlayingEl(new track_play_args_1.default(prevTrack, prevTrackNode, this.selPlaying.playableArr));
                }
            });
        }
    }
    /**
     * Tries to play the next IPlayable given the current playing IPlayable node.
     *
     * @param currNode - the current IPlayable node that was/is playing
     */
    tryPlayNext(currNode) {
        if (currNode === null) {
            return;
        }
        // once a track automatically finishes we cannot reset its duration so we play the track again instead
        if (exports.playerPublicVars.isLoop) {
            this.startTrack(() => __awaiter(this, void 0, void 0, function* () { return this.play(currNode.data.uri); }), new track_play_args_1.default(currNode.data, currNode, this.selPlaying.playableArr), true);
            return;
        }
        // check to see if an action is processing
        if (!this.isExecutingAction) {
            let nextTrackNode = currNode.next;
            if (!this.wasInShuffle && exports.playerPublicVars.isShuffle) {
                // by calling this before assigning the next node, this.shufflePlayables() must return back the next node
                nextTrackNode = this.shufflePlayables();
                // call after to ensure that this.shufflePlayables() runs the if statement that returns the next node
                this.wasInShuffle = true;
            }
            else if (!exports.playerPublicVars.isShuffle && this.wasInShuffle) {
                nextTrackNode = this.unShuffle(1);
            }
            // if shuffle is not one and this node is null, then we are at the end of the playlist and cannot play next.
            if (nextTrackNode === null) {
                return;
            }
            this.setSelPlayingEl(new track_play_args_1.default(nextTrackNode.data, nextTrackNode, this.selPlaying.playableArr));
        }
    }
    completelyDeselectTrack() {
        if (this.selPlaying.element === null) {
            throw new Error('Selected playing element was null before deselection on song finish');
        }
        this.pauseDeselectTrack();
        this.selPlaying.track_uri = '';
    }
    pauseDeselectTrack() {
        var _a, _b;
        if (this.selPlaying.element === null) {
            throw new Error('Selected playing element was null before deselection on song finish');
        }
        (_a = this.selPlaying.playableNode) === null || _a === void 0 ? void 0 : _a.data.onStopped();
        this.selPlaying.element.classList.remove(config_1.config.CSS.CLASSES.selected);
        (_b = this.webPlayerEl.playPause) === null || _b === void 0 ? void 0 : _b.classList.remove(config_1.config.CSS.CLASSES.selected);
        this.selPlaying.element = null;
    }
    selectTrack(eventArg, playThruWebPlayer) {
        var _a, _b;
        this.selPlaying.playableNode = eventArg.playableNode;
        this.selPlaying.playableArr = eventArg.playableArr;
        this.selPlaying.element = eventArg.currPlayable.selEl;
        this.selPlaying.element.classList.add(config_1.config.CSS.CLASSES.selected);
        this.selPlaying.track_uri = eventArg.currPlayable.uri;
        (_a = this.webPlayerEl.playPause) === null || _a === void 0 ? void 0 : _a.classList.add(config_1.config.CSS.CLASSES.selected);
        this.webPlayerEl.setTitle(eventArg.currPlayable.title, eventArg.currPlayable.uri);
        this.webPlayerEl.setImgSrc(eventArg.currPlayable.imageUrl);
        this.webPlayerEl.setArtists(eventArg.currPlayable.artistsHtml);
        (_b = this.selPlaying.playableNode) === null || _b === void 0 ? void 0 : _b.data.onPlaying();
        // we can call after assigning playable node as it does not change which node is played
        if (!playThruWebPlayer && exports.playerPublicVars.isShuffle) {
            this.shufflePlayables();
        }
        else if (!exports.playerPublicVars.isShuffle && this.wasInShuffle) {
            this.selPlaying.playableNode = this.unShuffle(0);
        }
    }
    onTrackFinish() {
        this.completelyDeselectTrack();
        this.webPlayerEl.songProgress.sliderProgress.style.width = '100%';
        clearInterval(this.getStateInterval);
        this.tryPlayNext(this.selPlaying.playableNode);
    }
    /**
     * Sets an interval that obtains the state of the player every second.
     * Should only be called when a song is playing.
     */
    setGetStateInterval() {
        let durationMinSec = '';
        if (this.getStateInterval) {
            clearInterval(this.getStateInterval);
        }
        // set the interval to run every second and obtain the state
        this.getStateInterval = setInterval(() => {
            this.player.getCurrentState().then((state) => {
                if (!state) {
                    console.error('User is not playing music through the Web Playback SDK');
                    return;
                }
                const { position, duration } = state;
                // if there isnt a duration set for this song set it.
                if (durationMinSec === '') {
                    durationMinSec = (0, config_1.millisToMinutesAndSeconds)(duration);
                    this.webPlayerEl.duration.textContent = durationMinSec;
                }
                const percentDone = (position / duration) * 100;
                // the position gets set to 0 when the song is finished
                if (position === 0) {
                    this.onTrackFinish();
                }
                else {
                    // if the position isnt 0 update the web player elements
                    this.webPlayerEl.updateElement(percentDone, position);
                }
            });
        }, 500);
    }
    /**
     * Select a certain play/pause element and play the given track uri
     * and unselect the previous one then pause the previous track_uri.
     *
     * The reassigning of elements is in the case that this function is called through the web player element,
     * as there is a chance that the selected playing element is either non-existent, or is different then then
     * the previous i.e. rerendered, or has an equivalent element when on for example a different term tab.
     *
     * Reassigning is done so that the potentially different equivalent element can act as the initially
     * selected element, in showing pause/play symbols in accordance to whether the
     * song was paused/played through the web player.
     *
     * @param {PlayableEventArg} eventArg - a class that contains the current, next and previous tracks to play
     */
    setSelPlayingEl(eventArg, playThruWebPlayer = true) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            // if the player isn't ready we cannot continue.
            if (!this.playerIsReady) {
                console.log('player is not ready');
                return;
            }
            if (this.isExecutingAction) {
                return;
            }
            this.isExecutingAction = true;
            if (this.selPlaying.element != null) {
                // stop the previous track that was playing
                (_a = this.selPlaying.playableNode) === null || _a === void 0 ? void 0 : _a.data.onStopped();
                clearInterval(this.getStateInterval);
                // reassign the element if it exists as it may have been rerendered and therefore the previous value is pointing to nothing
                this.selPlaying.element = (_b = document.getElementById(this.selPlaying.element.id)) !== null && _b !== void 0 ? _b : this.selPlaying.element;
                // if its the same element then pause
                if (this.selPlaying.element.id === eventArg.currPlayable.selEl.id) {
                    this.pauseDeselectTrack();
                    yield this.pause();
                    this.isExecutingAction = false;
                    return;
                }
                else {
                    // otherwise completely deselect the current track before selecting another one to play
                    this.completelyDeselectTrack();
                }
            }
            // prev track uri is the same then resume the song instead of replaying it.
            if (this.selPlaying.track_uri === eventArg.currPlayable.uri) {
                // this selEl could corrospond to the same song but is an element that is non-existent, so reassign it to a equivalent existing element if this is the case.
                eventArg.currPlayable.selEl = (_c = document.getElementById(eventArg.currPlayable.selEl.id)) !== null && _c !== void 0 ? _c : eventArg.currPlayable.selEl;
                yield this.startTrack(() => __awaiter(this, void 0, void 0, function* () { return this.resume(); }), eventArg, playThruWebPlayer);
                this.isExecutingAction = false;
                return;
            }
            console.log('start track');
            yield this.startTrack(() => __awaiter(this, void 0, void 0, function* () { return this.play(eventArg.currPlayable.uri); }), eventArg, playThruWebPlayer);
            this.isExecutingAction = false;
        });
    }
    startTrack(playingAsyncFunc, eventArg, playThruWebPlayer) {
        return __awaiter(this, void 0, void 0, function* () {
            this.selectTrack(eventArg, playThruWebPlayer);
            yield playingAsyncFunc();
            // set playing state once song starts playing
            this.setGetStateInterval();
        });
    }
    /**
     * Shuffles the playables and either returns the current node or the next node that both point to a shuffled version of the list.
     * @returns {DoublyLinkedListNode<IPlayable>} either the next or current node in the shuffled list.
     */
    shufflePlayables() {
        if (this.selPlaying.playableArr == null || this.selPlaying.playableNode == null)
            throw new Error('no sel playing');
        console.log('shuffle');
        const selPlayable = this.selPlaying.playableNode.data;
        // shuffle array
        const trackArr = (0, config_1.shuffle)(this.selPlaying.playableArr);
        // remove this track from the array
        const index = trackArr.indexOf(selPlayable);
        trackArr.splice(index, 1);
        // generate a doubly linked list
        const shuffledList = (0, doubly_linked_list_1.arrayToDoublyLinkedList)(trackArr);
        // place this track at the front of the list
        shuffledList.insertBefore(selPlayable, 0);
        let newNode;
        if (!this.wasInShuffle) {
            // get the next node as this should run before the next node is chosen.
            newNode = shuffledList.get(1, true);
        }
        else {
            // get the new node which has identical data as the old one, but is now part of the shuffled doubly linked list
            newNode = shuffledList.get(0, true);
            this.selPlaying.playableNode = newNode;
        }
        return newNode;
    }
    /**
     * Unshuffles the playables.
     * @param {number} dir value representing the index to add or remove from the index of the current playing node. (1: getsNext, -1: getsPrev, 0: getsCurrent)
     * @returns {DoublyLinkedListNode<IPlayable>} the node that points to the unshuffled version of the list. Either the previous, current, or next node from the current playable.
     */
    unShuffle(dir) {
        if (this.selPlaying.playableArr == null || this.selPlaying.playableNode == null)
            throw new Error('no sel playing');
        const selPlayable = this.selPlaying.playableNode.data;
        console.log('unshuffle');
        this.wasInShuffle = false;
        // obtain an unshuffled linked list
        const playableList = (0, doubly_linked_list_1.arrayToDoublyLinkedList)(this.selPlaying.playableArr);
        const newNodeIdx = playableList.findIndex((playable) => playable.selEl.id === selPlayable.selEl.id);
        let newNode = null;
        if (playableList.size > newNodeIdx + dir && newNodeIdx + dir >= 0) {
            newNode = playableList.get(newNodeIdx + dir, true);
        }
        return newNode;
    }
    /**
     * Plays a track through this device.
     *
     * @param {string} track_uri - the track uri to play
     * @returns whether or not the track has been played succesfully.
     */
    play(track_uri) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlayTrack(this.device_id, track_uri)));
        });
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.player.resume();
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.player.pause();
        });
    }
}
const spotifyPlayback = new SpotifyPlayback();
if (window.eventAggregator === undefined) {
    // create a global variable to be used
    window.eventAggregator = new aggregator_1.default();
}
const eventAggregator = window.eventAggregator;
// subscribe the setPlaying element event
eventAggregator.subscribe(track_play_args_1.default.name, (eventArg) => spotifyPlayback.setSelPlayingEl(eventArg, false));
function isSamePlayingURIWithEl(uri) {
    return (uri === spotifyPlayback.selPlaying.track_uri &&
        spotifyPlayback.selPlaying.element != null);
}
exports.isSamePlayingURIWithEl = isSamePlayingURIWithEl;
function isSamePlayingURI(uri) {
    return uri === spotifyPlayback.selPlaying.track_uri;
}
exports.isSamePlayingURI = isSamePlayingURI;
function checkIfIsPlayingElAfterRerender(uri, selEl, trackDataNode) {
    if (isSamePlayingURIWithEl(uri)) {
        // This element was playing before rerendering so set it to be the currently playing one again
        spotifyPlayback.selPlaying.element = selEl;
        spotifyPlayback.selPlaying.playableNode = trackDataNode;
    }
}
exports.checkIfIsPlayingElAfterRerender = checkIfIsPlayingElAfterRerender;
// append an invisible element then destroy it as a way to load the play and pause images from express.
const preloadPlayPauseImgsHtml = `<div style="display: none"><img src="${config_1.config.PATHS.playIcon}"/><img src="${config_1.config.PATHS.pauseIcon}"/></div>`;
const preloadPlayPauseImgsEl = (0, config_1.htmlToEl)(preloadPlayPauseImgsHtml);
document.body.appendChild(preloadPlayPauseImgsEl);
document.body.removeChild(preloadPlayPauseImgsEl);


/***/ }),

/***/ "./src/public/components/pubsub/aggregator.ts":
/*!****************************************************!*\
  !*** ./src/public/components/pubsub/aggregator.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const subscription_1 = __importDefault(__webpack_require__(/*! ./subscription */ "./src/public/components/pubsub/subscription.ts"));
/** Lets say you have two doors that will open through the pub sub system. What will happen is that we will subscribe one
 * on door open event. We will then have two publishers that will each propagate a different door through the aggregator at different points.
 * The aggregator will then execute the on door open subscriber and pass in the door given by either publisher.
 */
/** Manages subscribing and publishing of events.
 * ----------------------------------------------------------------
 * An argType is obtained by taking the 'ClassInstance'.contructor.name or 'Class'.name.
 * Subscriptions are grouped together by argType and their evt takes an argument that is a
 * class with the constructor.name of argType.
 *
 */
class EventAggregator {
    constructor() {
        // key - type, value - [] of functions that take a certain value depending on the type
        this.subscribers = {};
    }
    /** Subscribes a type of event.
     *
     * @param {String} argType - the type that this subscriber belongs too.
     * @param {Function} event - the event that takes the same args as all other events of the given type.
     */
    subscribe(argType, evt) {
        const subscriber = new subscription_1.default(this, evt, argType);
        if (argType in this.subscribers) {
            this.subscribers[argType].push(subscriber);
        }
        else {
            this.subscribers[argType] = [subscriber];
        }
    }
    /** Unsubscribes a given subscription.
     *
     * @param {Subscription} subscription
     */
    unsubscribe(subscription) {
        if (subscription.argType in this.subscribers) {
            // filter out the subscription given from the subscribers dictionary
            const filtered = this.subscribers[subscription.argType].filter(function (sub) {
                return sub.id !== subscription.id;
            });
            this.subscribers[subscription.argType] = filtered;
        }
    }
    /** Publishes all subscribers that take arguments of a given type.
     *
     * @param {Object} args - a class that contains arguments for the event. Must be a class as subscribers are grouped by type.
     */
    publish(args) {
        const argType = args.constructor.name;
        if (argType in this.subscribers) {
            this.subscribers[argType].forEach((subscription) => {
                subscription.evt(args);
            });
        }
        else {
            console.error('no type found for publishing');
        }
    }
    clearSubscriptions() {
        this.subscribers = {};
    }
}
exports["default"] = EventAggregator;


/***/ }),

/***/ "./src/public/components/pubsub/event-args/track-play-args.ts":
/*!********************************************************************!*\
  !*** ./src/public/components/pubsub/event-args/track-play-args.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class PlayableEventArg {
    /** Takes in the current track to play as well as the prev tracks and next tracks from it.
     * Note that it does not take Track instances.
     *
     * @param {IPlayable} currTrack - object containing element to select, track_uri, and track title.
     * @param {DoublyLinkedListNode<IPlayable>} trackNode - node that allows us to traverse to next and previous track datas.
     */
    constructor(currTrack, trackNode, playableArr) {
        this.currPlayable = currTrack;
        this.playableNode = trackNode;
        this.playableArr = playableArr;
    }
}
exports["default"] = PlayableEventArg;


/***/ }),

/***/ "./src/public/components/pubsub/subscription.ts":
/*!******************************************************!*\
  !*** ./src/public/components/pubsub/subscription.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class Subscription {
    constructor(eventAggregator, evt, argType) {
        this.eventAggregator = eventAggregator;
        this.evt = evt;
        this.argType = argType;
        this.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
exports["default"] = Subscription;


/***/ }),

/***/ "./src/public/components/save-load-term.ts":
/*!*************************************************!*\
  !*** ./src/public/components/save-load-term.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.selectStartTermTab = exports.IdxFromTerm = exports.saveTerm = exports.loadTerm = exports.determineTerm = exports.TERM_TYPE = exports.TERMS = void 0;
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
var TERMS;
(function (TERMS) {
    TERMS["SHORT_TERM"] = "short_term";
    TERMS["MID_TERM"] = "medium_term";
    TERMS["LONG_TERM"] = "long_term";
})(TERMS = exports.TERMS || (exports.TERMS = {}));
var TERM_TYPE;
(function (TERM_TYPE) {
    TERM_TYPE["ARTISTS"] = "artists";
    TERM_TYPE["TRACKS"] = "tracks";
})(TERM_TYPE = exports.TERM_TYPE || (exports.TERM_TYPE = {}));
/**
 * Determines the term given a string representation of the term.
 * @param {string} val the string corrosponding to a term.
 * @returns {TERMS} the term enum corrosponding to the given string.
 */
function determineTerm(val) {
    switch (val) {
        case TERMS.SHORT_TERM:
            return TERMS.SHORT_TERM;
        case TERMS.MID_TERM:
            return TERMS.MID_TERM;
        case TERMS.LONG_TERM:
            return TERMS.LONG_TERM;
        default:
            throw new Error('NO CORRECT TERM WAS FOUND');
    }
}
exports.determineTerm = determineTerm;
/**
 * Loads from redis the last term of a certain type that the user last left off at.
 *
 * @param {TERM_TYPE} termType the type of item whose term you want to load (eg. artists, tracks etc.)
 * @returns {Promise<TERMS>} the term that the user last left the page from.
 */
function loadTerm(termType) {
    return __awaiter(this, void 0, void 0, function* () {
        const { res, err } = yield (0, config_1.promiseHandler)((axios_1.default.request({ method: 'GET', url: config_1.config.URLs.getTerm(termType) })));
        if (err) {
            return TERMS.SHORT_TERM;
        }
        else {
            return determineTerm(res === null || res === void 0 ? void 0 : res.data);
        }
    });
}
exports.loadTerm = loadTerm;
/**
 * Saves to redis the term of a certain type.
 *
 * @param {TERMS} term the term to save.
 * @param {TERM_TYPE} termType the type of item whose term you want to save (eg. artists, tracks etc.)
 */
function saveTerm(term, termType) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putTerm(term, termType)));
    });
}
exports.saveTerm = saveTerm;
/**
 * Get the index that points to the tab elements
 * @param {TERMS} term the term relating to the tab elements
 * @returns the index to find the tab elements
 */
function IdxFromTerm(term) {
    switch (term) {
        case TERMS.SHORT_TERM:
            return 0;
        case TERMS.MID_TERM:
            return 1;
        case TERMS.LONG_TERM:
            return 2;
    }
}
exports.IdxFromTerm = IdxFromTerm;
/**
 * Selects the tab to start on when page loads.
 * @param {TERMS} term the term whose tab is to be selected.
 * @param {SelectableTabEls} termTab the tab elements handler.
 * @param {Element} tabParent the parent of all the tab elements
 */
function selectStartTermTab(term, termTab, tabParent) {
    const idx = IdxFromTerm(term);
    const btn = tabParent.getElementsByTagName('button')[idx];
    const border = tabParent.getElementsByClassName(config_1.config.CSS.CLASSES.borderCover)[idx];
    termTab.selectNewTab(btn, border);
}
exports.selectStartTermTab = selectStartTermTab;


/***/ }),

/***/ "./src/public/components/spotify-playback-element.ts":
/*!***********************************************************!*\
  !*** ./src/public/components/spotify-playback-element.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
const playback_sdk_1 = __webpack_require__(/*! ./playback-sdk */ "./src/public/components/playback-sdk.ts");
class Slider {
    constructor(startPercentage, onDragStop, topToBottom, onDragStart = () => { }, onDragging = (percentage) => { }, sliderEl) {
        var _a;
        this.drag = false;
        this.sliderEl = null;
        this.sliderProgress = null;
        this.percentage = 0;
        this.max = 0;
        this.onDragStop = onDragStop;
        this.onDragStart = onDragStart;
        this.onDragging = onDragging;
        this.topToBottom = topToBottom;
        this.percentage = startPercentage;
        this.sliderEl = sliderEl;
        this.sliderProgress = (_a = sliderEl === null || sliderEl === void 0 ? void 0 : sliderEl.getElementsByClassName(config_1.config.CSS.CLASSES.progress)[0]) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('No progress bar found');
        if (this.topToBottom) {
            // if its top to bottom we must rotate the element due reversed height changing
            this.sliderEl.style.transform = 'rotatex(180deg)';
            this.sliderEl.style.transformOrigin = 'transform-origin: top';
        }
        this.changeBarLength();
        this.sliderProgress.style.removeProperty('background-color');
    }
    /**
     * Updates the length of the bar according to where the mouse position is.
     * @param {number} mosPosVal the mouse position w.r.t. the client.
     */
    updateBar(mosPosVal) {
        let position;
        if (this.topToBottom) {
            position = mosPosVal - this.sliderEl.getBoundingClientRect().y;
        }
        else {
            position = mosPosVal - this.sliderEl.getBoundingClientRect().x;
        }
        if (this.topToBottom) {
            // minus 100 because modifying height is reversed
            this.percentage = 100 - (100 * (position / this.sliderEl.clientHeight));
        }
        else {
            this.percentage = 100 * (position / this.sliderEl.clientWidth);
        }
        if (this.percentage > 100) {
            this.percentage = 100;
        }
        if (this.percentage < 0) {
            this.percentage = 0;
        }
        this.changeBarLength();
    }
    ;
    /**
     * Changes the bar length by percent 0-100;
     */
    changeBarLength() {
        // set background color of all moving sliders progress as the spotify green
        this.sliderProgress.style.backgroundColor = '#1db954';
        if (this.topToBottom) {
            this.sliderProgress.style.height = this.percentage + '%';
        }
        else {
            this.sliderProgress.style.width = this.percentage + '%';
        }
    }
    /**
     * Adds both mouse and touch events for changing the slider bar length.
     */
    addEventListeners() {
        this.addMouseEvents();
        this.addTouchEvents();
    }
    /**
     * Add add touch events to change the bar length and color for mobile.
     */
    addTouchEvents() {
        var _a;
        (_a = this.sliderEl) === null || _a === void 0 ? void 0 : _a.addEventListener('touchstart', (evt) => {
            this.drag = true;
            if (this.onDragStart !== null) {
                this.onDragStart();
            }
            this.updateBar(evt.changedTouches[0].clientX);
        });
        document.addEventListener('touchmove', (evt) => {
            if (this.drag) {
                this.onDragging(this.percentage);
                this.updateBar(evt.changedTouches[0].clientX);
            }
        });
        document.addEventListener('touchend', () => {
            if (this.drag) {
                this.onDragStop(this.percentage);
                // remove the inline css so that its original background color returns
                this.sliderProgress.style.removeProperty('background-color');
                this.drag = false;
            }
        });
    }
    /**
     * Add add mouse events to change the bar length and color.
     */
    addMouseEvents() {
        var _a;
        (_a = this.sliderEl) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', (evt) => {
            this.drag = true;
            if (this.onDragStart !== null) {
                this.onDragStart();
            }
            if (this.topToBottom) {
                this.updateBar(evt.clientY);
            }
            else {
                this.updateBar(evt.clientX);
            }
        });
        document.addEventListener('mousemove', (evt) => {
            if (this.drag) {
                this.onDragging(this.percentage);
                if (this.topToBottom) {
                    this.updateBar(evt.clientY);
                }
                else {
                    this.updateBar(evt.clientX);
                }
            }
        });
        document.addEventListener('mouseup', () => {
            if (this.drag) {
                this.onDragStop(this.percentage);
                // remove the inline css so that its original background color returns
                this.sliderProgress.style.removeProperty('background-color');
                this.drag = false;
            }
        });
    }
}
class SpotifyPlaybackElement {
    constructor() {
        this.songProgress = null;
        this.volumeBar = null;
        this.title = null;
        this.currTime = null;
        this.duration = null;
        this.playPause = null;
    }
    setArtists(artistHtml) {
        const artistNameEl = document.getElementById(config_1.config.CSS.IDs.webPlayerArtists);
        if (artistNameEl) {
            (0, config_1.removeAllChildNodes)(artistNameEl);
            artistNameEl.innerHTML += artistHtml;
        }
    }
    setImgSrc(imgSrc) {
        const playerTrackImg = document.getElementById(config_1.config.CSS.IDs.playerTrackImg);
        if (playerTrackImg) {
            playerTrackImg.src = imgSrc;
        }
    }
    setTitle(title, trackUri) {
        if (this.title === null) {
            throw new Error('Trying to set title before it is assigned');
        }
        this.title.textContent = title;
        this.title.href = trackUri;
    }
    getTitle() {
        if (this.title === null) {
            throw new Error('Trying to set title before it is assigned');
        }
        return this.title.textContent;
    }
    /**
     * Append the web player element to the DOM along with the event listeners for the buttons.
     *
     * @param {() => void} playPrevFunc the function to run when the play previous button is pressed on the web player.
     * @param {() => void} pauseFunc the function to run when the pause/play button is pressed on the web player.
     * @param {() => void} playNextFunc the function to run when the play next button is pressed on the web player.
     * @param {() => void} onSeekStart - on drag start event for song progress slider
     * @param {(percentage: number) => void} seekSong - on drag end event to seek song for song progress slider
     * @param {(percentage: number) => void} onSeeking - on dragging event for song progress slider
     * @param {(percentage: number, save: boolean) => void} setVolume - on dragging and on drag end event for volume slider
     * @param {number} initialVolume - the initial volume to set the slider at
     */
    appendWebPlayerHtml(playPrevFunc, pauseFunc, playNextFunc, onSeekStart, seekSong, onSeeking, setVolume, initialVolume) {
        const html = `
    <article id="${config_1.config.CSS.IDs.webPlayer}" class="${config_1.config.CSS.CLASSES.noSelect}">
      <img class="${config_1.config.CSS.CLASSES.column}" src="${config_1.config.PATHS.profileUser}" alt="track" id="${config_1.config.CSS.IDs.playerTrackImg}"/>
      <div class="${config_1.config.CSS.CLASSES.column}" style="flex-basis: 30%; max-width: 18.5vw;">
        <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap}"><a href="" target="_blank">Select a Song</a></h4>
        <span id="${config_1.config.CSS.IDs.webPlayerArtists}"></span>
      </div>
      <div class="${config_1.config.CSS.CLASSES.webPlayerControls} ${config_1.config.CSS.CLASSES.column}">
        <div>
          <article id="web-player-buttons">
            <button id="${config_1.config.CSS.IDs.shuffle}"><img src="${config_1.config.PATHS.shuffleIcon}"/></button>
            <button id="${config_1.config.CSS.IDs.playPrev}" class="next-prev"><img src="${config_1.config.PATHS.playPrev}" alt="previous"/></button>
            <button id="${config_1.config.CSS.IDs.webPlayerPlayPause}" class="${config_1.config.CSS.CLASSES.playBtn}"></button>
            <button id="${config_1.config.CSS.IDs.playNext}" class="next-prev"><img src="${config_1.config.PATHS.playNext}" alt="next"/></button>
            <button id="${config_1.config.CSS.IDs.loop}"><img src="${config_1.config.PATHS.loopIcon}"/></button>
          </article>
          <div id="${config_1.config.CSS.IDs.webPlayerVolume}" class="${config_1.config.CSS.CLASSES.slider}">
            <div class="${config_1.config.CSS.CLASSES.progress}"></div>
          </div>
        </div>
        <div id="${config_1.config.CSS.IDs.playTimeBar}">
          <p>0:00</p>
          <div id="${config_1.config.CSS.IDs.webPlayerProgress}" class="${config_1.config.CSS.CLASSES.slider}">
            <div class="${config_1.config.CSS.CLASSES.progress}"></div>
          </div>
          <p>0:00</p>
        </div>
      </div>
    </article>
    `;
        const webPlayerEl = (0, config_1.htmlToEl)(html);
        document.body.append(webPlayerEl);
        this.getWebPlayerEls(onSeekStart, seekSong, onSeeking, setVolume, initialVolume);
        this.assignEventListeners(playPrevFunc, pauseFunc, playNextFunc);
    }
    /**
     * Updates the web player element.
     *
     * @param {number} percentDone the percent of the song that has been completed
     * @param {number} position the current position in ms that has been completed
     */
    updateElement(percentDone, position) {
        // if the user is dragging the song progress bar don't auto update
        if (position !== 0 && !this.songProgress.drag) {
            // round each interval to the nearest second so that the movement of progress bar is by second.
            this.songProgress.sliderProgress.style.width = `${percentDone}%`;
            if (this.currTime == null) {
                throw new Error('Current time element is null');
            }
            this.currTime.textContent = (0, config_1.millisToMinutesAndSeconds)(position);
        }
    }
    /**
     * Retrieve the web player elements once the web player element has been appeneded to the DOM. Initializes Sliders.
     * @param {() => void} onSeekStart - on drag start event for song progress slider
     * @param {(percentage: number) => void} seekSong - on drag end event to seek song for song progress slider
     * @param {(percentage: number) => void} onSeeking - on dragging event for song progress slider
     * @param {(percentage: number, save: boolean) => void} setVolume - on dragging and on drag end event for volume slider
     * @param {number} initialVolume - the initial volume to set the slider at
     */
    getWebPlayerEls(onSeekStart, seekSong, onSeeking, setVolume, initialVolume) {
        var _a, _b, _c, _d, _e, _f, _g;
        const webPlayerEl = (_a = document.getElementById(config_1.config.CSS.IDs.webPlayer)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('web player element does not exist');
        const playTimeBar = (_b = document.getElementById(config_1.config.CSS.IDs.playTimeBar)) !== null && _b !== void 0 ? _b : (0, config_1.throwExpression)('play time bar element does not exist');
        const songSliderEl = (_c = document.getElementById(config_1.config.CSS.IDs.webPlayerProgress)) !== null && _c !== void 0 ? _c : (0, config_1.throwExpression)('web player progress bar does not exist');
        const volumeSliderEl = (_d = document.getElementById(config_1.config.CSS.IDs.webPlayerVolume)) !== null && _d !== void 0 ? _d : (0, config_1.throwExpression)('web player volume bar does not exist');
        this.songProgress = new Slider(0, seekSong, false, onSeekStart, onSeeking, songSliderEl);
        this.volumeBar = new Slider(initialVolume * 100, (percentage) => setVolume(percentage, false), false, () => { }, (percentage) => setVolume(percentage, true), volumeSliderEl);
        this.title = (_e = webPlayerEl.getElementsByTagName('h4')[0].getElementsByTagName('a')[0]) !== null && _e !== void 0 ? _e : (0, config_1.throwExpression)('web player title element does not exist');
        // get playtime bar elements
        this.currTime = (_f = playTimeBar.getElementsByTagName('p')[0]) !== null && _f !== void 0 ? _f : (0, config_1.throwExpression)('web player current time element does not exist');
        this.duration = (_g = playTimeBar.getElementsByTagName('p')[1]) !== null && _g !== void 0 ? _g : (0, config_1.throwExpression)('web player duration time element does not exist');
        this.playPause = document.getElementById(config_1.config.CSS.IDs.webPlayerPlayPause);
    }
    /**
     * Assigns the events to run on each button press that exists on the web player element.
     *
     * @param {() => void} playPrevFunc function to run when play previous button is pressed
     * @param {() => void} pauseFunc function to run when play/pause button is pressed
     * @param {() => void} playNextFunc function to run when play next button is pressed
     */
    assignEventListeners(playPrevFunc, pauseFunc, playNextFunc) {
        var _a, _b, _c;
        const playPrev = document.getElementById(config_1.config.CSS.IDs.playPrev);
        const playNext = document.getElementById(config_1.config.CSS.IDs.playNext);
        const shuffle = document.getElementById(config_1.config.CSS.IDs.shuffle);
        const loop = document.getElementById(config_1.config.CSS.IDs.loop);
        loop === null || loop === void 0 ? void 0 : loop.addEventListener('click', () => {
            playback_sdk_1.playerPublicVars.isLoop = !playback_sdk_1.playerPublicVars.isLoop;
            loop.getElementsByTagName('img')[0].classList.toggle(config_1.config.CSS.CLASSES.selected);
        });
        shuffle === null || shuffle === void 0 ? void 0 : shuffle.addEventListener('click', () => {
            playback_sdk_1.playerPublicVars.isShuffle = !playback_sdk_1.playerPublicVars.isShuffle;
            shuffle.getElementsByTagName('img')[0].classList.toggle(config_1.config.CSS.CLASSES.selected);
        });
        playPrev === null || playPrev === void 0 ? void 0 : playPrev.addEventListener('click', playPrevFunc);
        playNext === null || playNext === void 0 ? void 0 : playNext.addEventListener('click', playNextFunc);
        (_a = this.playPause) === null || _a === void 0 ? void 0 : _a.addEventListener('click', pauseFunc);
        (_b = this.songProgress) === null || _b === void 0 ? void 0 : _b.addEventListeners();
        (_c = this.volumeBar) === null || _c === void 0 ? void 0 : _c.addEventListeners();
    }
}
exports["default"] = SpotifyPlaybackElement;


/***/ }),

/***/ "./src/public/components/track.ts":
/*!****************************************!*\
  !*** ./src/public/components/track.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateTracksFromData = void 0;
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
const playback_sdk_1 = __webpack_require__(/*! ./playback-sdk */ "./src/public/components/playback-sdk.ts");
const album_1 = __importDefault(__webpack_require__(/*! ./album */ "./src/public/components/album.ts"));
const card_1 = __importDefault(__webpack_require__(/*! ./card */ "./src/public/components/card.ts"));
const track_play_args_1 = __importDefault(__webpack_require__(/*! ./pubsub/event-args/track-play-args */ "./src/public/components/pubsub/event-args/track-play-args.ts"));
const doubly_linked_list_1 = __webpack_require__(/*! ../components/doubly-linked-list */ "./src/public/components/doubly-linked-list.ts");
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const eventAggregator = window.eventAggregator;
class Track extends card_1.default {
    constructor(props) {
        super();
        const { title, images, duration, uri, popularity, releaseDate, id, album, externalUrls, artists } = props;
        this.externalUrls = externalUrls;
        this._id = id;
        this._title = title;
        this.artistsHtml = this.generateHTMLArtistNames(artists);
        this._duration = (0, config_1.millisToMinutesAndSeconds)(duration);
        this._dateAddedToPlaylist = new Date();
        // either the normal uri, or the linked_from.uri
        this._uri = uri;
        this.popularity = popularity;
        this.releaseDate = new Date(releaseDate);
        this.album = album;
        this.features = undefined;
        this.imageUrl = (0, config_1.getValidImage)(images);
        this.selEl = (0, config_1.htmlToEl)('<></>');
        this.onPlaying = () => { };
        this.onStopped = () => { };
    }
    get id() {
        return this._id;
    }
    get title() {
        return this._title;
    }
    get uri() {
        return this._uri;
    }
    get dateAddedToPlaylist() {
        return this._dateAddedToPlaylist;
    }
    setDateAddedToPlaylist(val) {
        this._dateAddedToPlaylist = new Date(val);
    }
    filterDataFromArtists(artists) {
        return artists.map((artist) => artist);
    }
    generateHTMLArtistNames(artists) {
        const artistsDatas = this.filterDataFromArtists(artists);
        let artistNames = '';
        for (let i = 0; i < artistsDatas.length; i++) {
            const artist = artistsDatas[i];
            artistNames += `<a href="${artist.external_urls.spotify}" target="_blank">${artist.name}</a>`;
            if (i < artistsDatas.length - 1) {
                artistNames += ', ';
            }
        }
        return artistNames;
    }
    /** Produces the card element of this track.
     *
     * @param {Number} idx - The card index to use for the elements id suffix
     * @returns {ChildNode} - The converted html string to an element
     */
    getTrackCardHtml(idx, unanimatedAppear = false) {
        const id = `${config_1.config.CSS.IDs.trackPrefix}${idx}`;
        this.cardId = id;
        const appearClass = unanimatedAppear ? config_1.config.CSS.CLASSES.appear : '';
        const html = `
            <div class="${config_1.config.CSS.CLASSES.rankCard} ${config_1.config.CSS.CLASSES.fadeIn} ${appearClass}">
              <h4 id="${config_1.config.CSS.IDs.rank}">${idx + 1}.</h4>
              <div class="${config_1.config.CSS.CLASSES.flipCard} ${config_1.config.CSS.CLASSES.noSelect}  ${config_1.config.CSS.CLASSES.expandOnHover}">
                <button class="${config_1.config.CSS.CLASSES.card} ${config_1.config.CSS.CLASSES.flipCardInner} ${config_1.config.CSS.CLASSES.track}" id="${this.getCardId()}">
                  <div class="${config_1.config.CSS.CLASSES.flipCardFront}"  title="Click to view more Info">
                    <div ${config_1.config.CSS.ATTRIBUTES.restrictFlipOnClick}="true" id="${this._uri}" class="${config_1.config.CSS.CLASSES.playBtn} ${(0, playback_sdk_1.isSamePlayingURIWithEl)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}" title="Click to play song"></div>
                    <img src="${this.imageUrl}" alt="Album Cover" title="Album Cover"></img>
                    <div>
                      <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap} ${config_1.config.CSS.CLASSES.scrollingText}">${this.title}</h4>
                    </div>
                  </div>
                  <div class=${config_1.config.CSS.CLASSES.flipCardBack}>
                    <h3>Duration:</h3>
                    <p>${this._duration}</p>
                    <h3>Release Date:</h3>
                    <p>${this.releaseDate.toDateString()}</p>
                    <h3>Album Name:</h3>
                    <a href="${this.externalUrls.spotify}" target="_blank">
                      <p ${config_1.config.CSS.ATTRIBUTES.restrictFlipOnClick}="true" class="${config_1.config.CSS.CLASSES.ellipsisWrap}">${this.album.name}</p>
                    </a>
                  </div>
                </button>
              </div>
            </div>
          `;
        const el = (0, config_1.htmlToEl)(html);
        const playBtn = el.getElementsByClassName(config_1.config.CSS.CLASSES.playBtn)[0];
        this.selEl = playBtn;
        playBtn.addEventListener('click', () => {
            const trackNode = new doubly_linked_list_1.DoublyLinkedListNode(this);
            this.playPauseClick(trackNode);
        });
        return el;
    }
    playPauseClick(trackNode, trackList = null) {
        const track = this;
        let trackArr = null;
        if (trackList) {
            trackArr = trackList.toArray();
        }
        eventAggregator.publish(new track_play_args_1.default(track, trackNode, trackArr));
    }
    /** Get a track html to be placed as a list element.
     *
     * @param {Boolean} displayDate - whether to display the date.
     * @returns {ChildNode} - The converted html string to an element
     */
    getPlaylistTrackHtml(trackList, displayDate = true) {
        const trackNode = trackList.find((x) => x.uri === this.uri, true);
        // for the unique play pause ID also use the date added to playlist as there can be duplicates of a song in a playlist.
        const playPauseId = this._uri + this.dateAddedToPlaylist;
        const html = `
            <li class="${config_1.config.CSS.CLASSES.playlistTrack}">
              <button id="${playPauseId}" class="${config_1.config.CSS.CLASSES.playBtn} ${(0, playback_sdk_1.isSamePlayingURIWithEl)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}" title="play track">
              </button>
              <img class="${config_1.config.CSS.CLASSES.noSelect}" src="${this.imageUrl}" alt="Album Cover" title="Album Cover"></img>
              <div class="${config_1.config.CSS.CLASSES.links}">
                <a href="${this.externalUrls.spotify}" target="_blank">
                  <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap} ${config_1.config.CSS.CLASSES.name}">${this.title}
                  </h4>
                <a/>
                <div class="${config_1.config.CSS.CLASSES.ellipsisWrap}">
                  ${this.artistsHtml}
                </div>
              </div>
              <h5>${this._duration}</h5>
              ${displayDate
            ? `<h5>${this.dateAddedToPlaylist.toLocaleDateString()}</h5>`
            : ''}
            </li>
            `;
        const el = (0, config_1.htmlToEl)(html);
        // get play pause button
        const playPauseBtn = el === null || el === void 0 ? void 0 : el.childNodes[1];
        if (playPauseBtn === null) {
            throw new Error('Play pause button on track was not found');
        }
        this.selEl = playPauseBtn;
        playPauseBtn === null || playPauseBtn === void 0 ? void 0 : playPauseBtn.addEventListener('click', () => this.playPauseClick(trackNode, trackList));
        (0, playback_sdk_1.checkIfIsPlayingElAfterRerender)(this.uri, playPauseBtn, trackNode);
        return el;
    }
    /** Get a track html to be placed as a list element on a ranked list.
     *
     * @param {DoublyLinkedList<Track>} trackList - list of tracks that contains this track.
     * @param {number} rank - the rank of this card
     * @returns {ChildNode} - The converted html string to an element
     */
    getRankedTrackHtml(trackList, rank) {
        const trackNode = trackList.find((x) => x.uri === this.uri, true);
        const html = `
            <li class="${config_1.config.CSS.CLASSES.playlistTrack}">
            <div class="${config_1.config.CSS.CLASSES.rankedTrackInteract} ${(0, playback_sdk_1.isSamePlayingURIWithEl)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}">
              <button id="${this._uri}" class="${config_1.config.CSS.CLASSES.playBtn} ${(0, playback_sdk_1.isSamePlayingURIWithEl)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}">
              </button>
              <p>${rank}.</p>
            </div>
              <img class="${config_1.config.CSS.CLASSES.noSelect}" src="${this.imageUrl}" alt="Album Cover" title="Album Cover"></img>
              <div class="${config_1.config.CSS.CLASSES.links}">
                <a href="${this.externalUrls.spotify}" target="_blank">
                  <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap} ${config_1.config.CSS.CLASSES.name}">${this.title}
                  </h4>
                <a/>
                <div class="${config_1.config.CSS.CLASSES.ellipsisWrap}">
                  ${this.artistsHtml}
                </div>
              </div>
              <h5>${this._duration}</h5>
            </li>
            `;
        const el = (0, config_1.htmlToEl)(html);
        // get play pause button
        const playPauseBtn = el === null || el === void 0 ? void 0 : el.childNodes[1].childNodes[1];
        if (playPauseBtn === null) {
            throw new Error('Play pause button on track was not found');
        }
        this.selEl = playPauseBtn;
        // select the rank area as to keep the play/pause icon shown
        const rankedInteract = el.getElementsByClassName(config_1.config.CSS.CLASSES.rankedTrackInteract)[0];
        this.onPlaying = () => rankedInteract.classList.add(config_1.config.CSS.CLASSES.selected);
        this.onStopped = () => rankedInteract.classList.remove(config_1.config.CSS.CLASSES.selected);
        playPauseBtn === null || playPauseBtn === void 0 ? void 0 : playPauseBtn.addEventListener('click', () => {
            this.playPauseClick(trackNode, trackList);
        });
        (0, playback_sdk_1.checkIfIsPlayingElAfterRerender)(this.uri, playPauseBtn, trackNode);
        return el;
    }
    /** Load the features of this track from the spotify web api. */
    loadFeatures() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield axios_1.default
                .get(config_1.config.URLs.getTrackFeatures + this.id)
                .catch((err) => {
                throw err;
            });
            const feats = res.data.audio_features;
            this.features = {
                danceability: feats.danceability,
                acousticness: feats.acousticness,
                instrumentalness: feats.instrumentalness,
                valence: feats.valence,
                energy: feats.energy
            };
            return this.features;
        });
    }
}
/** Generate tracks from data excluding date added.
 *
 * @param {Array<TrackData>} datas
 * @param {DoublyLinkedList<Track> | Array<Track>} tracks - double linked list
 * @returns
 */
function generateTracksFromData(datas, tracks) {
    for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        if (data) {
            const props = {
                title: data.name,
                images: data.album.images,
                duration: data.duration_ms,
                uri: data.linked_from !== undefined ? data.linked_from.uri : data.uri,
                popularity: data.popularity,
                releaseDate: data.album.release_date,
                id: data.id,
                album: new album_1.default(data.album.name, data.album.external_urls.spotify),
                externalUrls: data.external_urls,
                artists: data.artists,
                idx: i
            };
            if (Array.isArray(tracks)) {
                tracks.push(new Track(props));
            }
            else {
                tracks.add(new Track(props));
            }
        }
    }
    return tracks;
}
exports.generateTracksFromData = generateTracksFromData;
exports["default"] = Track;


/***/ }),

/***/ "./src/public/config.ts":
/*!******************************!*\
  !*** ./src/public/config.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.shuffle = exports.addItemsToPlaylist = exports.throwExpression = exports.getPixelPosInElOnClick = exports.animationControl = exports.removeAllChildNodes = exports.getValidImage = exports.capitalizeFirstLetter = exports.isEllipsisActive = exports.getTextWidth = exports.searchUl = exports.promiseHandler = exports.htmlToEl = exports.millisToMinutesAndSeconds = exports.config = exports.redirectUri = void 0;
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const authEndpoint = 'https://accounts.spotify.com/authorize';
// Replace with your app's client ID, redirect URI and desired scopes
exports.redirectUri = 'http://localhost:3000';
const clientId = '434f5e9f442a4e4586e089a33f65c857';
const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-read',
    'user-top-read',
    'user-read-recently-played',
    'user-follow-read'
];
exports.config = {
    CSS: {
        IDs: {
            getTokenLoadingSpinner: 'get-token-loading-spinner',
            playlistCardsContainer: 'playlist-cards-container',
            trackCardsContainer: 'track-cards-container',
            playlistPrefix: 'playlist-',
            trackPrefix: 'track-',
            spotifyContainer: 'spotify-container',
            infoContainer: 'info-container',
            allowAccessHeader: 'allow-access-header',
            expandedPlaylistMods: 'expanded-playlist-mods',
            tracksData: 'tracks-data',
            tracksChart: 'tracks-chart',
            tracksTermSelections: 'tracks-term-selections',
            featureSelections: 'feature-selections',
            playlistsSection: 'playlists-section',
            featDef: 'feat-definition',
            featAverage: 'feat-average',
            rank: 'rank',
            viewAllTopTracks: 'view-all-top-tracks',
            emojis: 'emojis',
            artistCardsContainer: 'artist-cards-container',
            artistPrefix: 'artist-',
            initialCard: 'initial-card',
            convertCard: 'convert-card',
            artistTermSelections: 'artists-term-selections',
            profileHeader: 'profile-header',
            clearData: 'clear-data',
            likedTracks: 'liked-tracks',
            followedArtists: 'followed-artists',
            webPlayer: 'web-player',
            playTimeBar: 'playtime-bar',
            playlistHeaderArea: 'playlist-main-header-area',
            playNext: 'play-next',
            playPrev: 'play-prev',
            webPlayerPlayPause: 'play-pause-player',
            webPlayerVolume: 'web-player-volume-bar',
            webPlayerProgress: 'web-player-progress-bar',
            playerTrackImg: 'player-track-img',
            webPlayerArtists: 'web-player-artists',
            generatePlaylist: 'generate-playlist',
            hideShowPlaylistTxt: 'hide-show-playlist-txt',
            topTracksTextFormContainer: 'term-text-form-container',
            username: 'username',
            topNavMobile: 'topnav-mobile',
            shuffle: 'shuffle',
            homeHeader: 'home-header',
            loop: 'loop'
        },
        CLASSES: {
            glow: 'glow',
            playlist: 'playlist',
            track: 'track',
            artist: 'artist',
            rankCard: 'rank-card',
            playlistTrack: 'playlist-track',
            infoLoadingSpinners: 'info-loading-spinner',
            appear: 'appear',
            hide: 'hide',
            selected: 'selected',
            card: 'card',
            playlistSearch: 'playlist-search',
            ellipsisWrap: 'ellipsis-wrap',
            name: 'name',
            playlistOrder: 'playlist-order',
            chartInfo: 'chart-info',
            flipCardInner: 'flip-card-inner',
            flipCardFront: 'flip-card-front',
            flipCardBack: 'flip-card-back',
            flipCard: 'flip-card',
            resizeContainer: 'resize-container',
            scrollLeft: 'scroll-left',
            scrollingText: 'scrolling-text',
            noSelect: 'no-select',
            dropDown: 'drop-down',
            expandableTxtContainer: 'expandable-text-container',
            borderCover: 'border-cover',
            firstExpansion: 'first-expansion',
            secondExpansion: 'second-expansion',
            invisible: 'invisible',
            fadeIn: 'fade-in',
            fromTop: 'from-top',
            expandOnHover: 'expand-on-hover',
            tracksArea: 'tracks-area',
            scrollBar: 'scroll-bar',
            trackList: 'track-list',
            artistTopTracks: 'artist-top-tracks',
            textForm: 'text-form',
            content: 'content',
            links: 'links',
            progress: 'progress',
            playPause: 'play-pause',
            rankedTrackInteract: 'ranked-interaction-area',
            slider: 'slider',
            playBtn: 'play-btn',
            displayNone: 'display-none',
            column: 'column',
            webPlayerControls: 'web-player-controls'
        },
        ATTRIBUTES: {
            dataSelection: 'data-selection',
            restrictFlipOnClick: 'data-restrict-flip-on-click'
        }
    },
    URLs: {
        siteUrl: 'http://localhost:3000',
        auth: `${authEndpoint}?client_id=${clientId}&redirect_uri=${exports.redirectUri}&scope=${scopes.join('%20')}&response_type=code&show_dialog=true`,
        getHasTokens: '/tokens/has-tokens',
        getAccessToken: '/tokens/get-access-token',
        getObtainTokensPrefix: (code) => `/tokens/obtain-tokens?code=${code}`,
        getTopArtists: '/spotify/get-top-artists?time_range=',
        getTopTracks: '/spotify/get-top-tracks?time_range=',
        getPlaylists: '/spotify/get-playlists',
        getPlaylistTracks: '/spotify/get-playlist-tracks?playlist_id=',
        putClearTokens: '/tokens/clear-tokens',
        deletePlaylistTracks: (playlistId) => `/spotify/delete-playlist-items?playlist_id=${playlistId}`,
        postPlaylistTracks: (playlistId) => `/spotify/post-playlist-items?playlist_id=${playlistId}`,
        getTrackFeatures: '/spotify/get-tracks-features?track_ids=',
        putRefreshAccessToken: '/tokens/refresh-token',
        putSessionData: '/spotify/put-session-data?attr=',
        putPlaylistResizeData: (val) => `/user/put-playlist-resize-data?val=${val}`,
        getPlaylistResizeData: '/user/get-playlist-resize-data',
        putPlaylistIsInTextFormData: (val) => `/user/put-playlist-text-form-data?val=${val}`,
        getPlaylistIsInTextFormData: '/user/get-playlist-text-form-data',
        putTopTracksIsInTextFormData: (val) => `/user/put-top-tracks-text-form-data?val=${val}`,
        getTopTracksIsInTextFormData: '/user/get-top-tracks-text-form-data',
        getArtistTopTracks: (id) => `/spotify/get-artist-top-tracks?id=${id}`,
        getCurrentUserProfile: '/spotify/get-current-user-profile',
        putClearSession: '/clear-session',
        getCurrentUserSavedTracks: '/spotify/get-current-user-saved-tracks',
        getFollowedArtists: '/spotify/get-followed-artists',
        putPlayTrack: (device_id, track_uri) => `/spotify/play-track?device_id=${device_id}&track_uri=${track_uri}`,
        putPlayerVolumeData: (val) => `/user/put-player-volume?val=${val}`,
        getPlayerVolumeData: '/user/get-player-volume',
        putTerm: (term, termType) => `/user/put-top-${termType}-term?term=${term}`,
        getTerm: (termType) => `/user/get-top-${termType}-term`,
        putCurrPlaylistId: (id) => `/user/put-current-playlist-id?id=${id}`,
        getCurrPlaylistId: '/user/get-current-playlist-id',
        postPlaylist: (name) => `/spotify/post-playlist?name=${name}`,
        postItemsToPlaylist: (playlistId) => `/spotify/post-items-to-playlist?playlist_id=${playlistId}`,
        getUsername: '/user/get-username'
    },
    PATHS: {
        spinner: '/images/200pxLoadingSpinner.svg',
        gridView: '/images/grid-view-icon.png',
        listView: '/images/list-view-icon.png',
        chevronLeft: '/images/chevron-left.png',
        chevronRight: '/images/chevron-right.png',
        playIcon: '/images/play-30px.png',
        pauseIcon: '/images/pause-30px.png',
        playBlackIcon: '/images/play-black-30px.png',
        pauseBlackIcon: '/images/pause-black-30px.png',
        playNext: '/images/next-30px.png',
        playPrev: '/images/previous-30px.png',
        profileUser: '/images/profile-user.png',
        shuffleIcon: '/images/shuffle-icon.png',
        shuffleIconGreen: '/images/shuffle-icon-green.png',
        loopIcon: '/images/loop-icon.png',
        loopIconGreen: '/images/loop-icon-green.png'
    }
};
function millisToMinutesAndSeconds(millis) {
    const minutes = Math.floor(millis / 60000);
    const seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
    return seconds === 60
        ? minutes + 1 + ':00'
        : minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}
exports.millisToMinutesAndSeconds = millisToMinutesAndSeconds;
function htmlToEl(html) {
    const temp = document.createElement('template');
    html = html.trim(); // Never return a space text node as a result
    temp.innerHTML = html;
    return temp.content.firstChild;
}
exports.htmlToEl = htmlToEl;
function promiseHandler(promise, onSuccesful = (res) => { }, onFailure = (err) => {
    if (err) {
        console.error(err);
    }
}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield promise;
            onSuccesful(res);
            return { res: res, err: null };
        }
        catch (err) {
            onFailure(err);
            return { res: null, err: err };
        }
    });
}
exports.promiseHandler = promiseHandler;
/** Filters 'li' elements to either be hidden or not depending on if
 * they contain some given input text.
 *
 * @param {HTML} ul - unordered list element that contains the 'li' to be filtered
 * @param {HTML} input - input element whose value will be used to filter
 * @param {String} stdDisplay - the standard display the 'li' should have when not 'none'
 */
function searchUl(ul, input, stdDisplay = 'flex') {
    const liEls = ul.getElementsByTagName('li');
    const filter = input.value.toUpperCase();
    for (let i = 0; i < liEls.length; i++) {
        // get the name child el in the li el
        const name = liEls[i].getElementsByClassName(exports.config.CSS.CLASSES.name)[0];
        const nameTxt = name.textContent || name.innerHTML;
        if (nameTxt && nameTxt.toUpperCase().indexOf(filter) > -1) {
            // show li's whose name contains the the entered string
            liEls[i].style.display = stdDisplay;
        }
        else {
            // otherwise hide it
            liEls[i].style.display = 'none';
        }
    }
}
exports.searchUl = searchUl;
/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    let metrics;
    if (context) {
        context.font = font;
        metrics = context.measureText(text);
        return metrics.width;
    }
    throw new Error('No context on created canvas was found');
}
exports.getTextWidth = getTextWidth;
function isEllipsisActive(el) {
    return el.offsetWidth < el.scrollWidth;
}
exports.isEllipsisActive = isEllipsisActive;
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;
function getValidImage(images, idx = 0) {
    // obtain the correct image
    if (images.length > idx) {
        const img = images[idx];
        return img.url;
    }
    else {
        return '';
    }
}
exports.getValidImage = getValidImage;
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
exports.removeAllChildNodes = removeAllChildNodes;
exports.animationControl = (function () {
    /** Adds a class to each element causing a transition to the changed css values.
     * This is done on set intervals.
     *
     *
     * @param {string} elementsToAnimate - comma separated string containing the classes or ids of elements to animate including prefix char.
     * @param {string} classToTransitionToo - The class that all the transitioning elements will add
     * @param {number} animationInterval - The interval to wait between animation of elements
     */
    function addClassOnInterval(elementsToAnimate, classToTransitionToo, animationInterval) {
        // arr of html selectors that point to elements to animate
        const attributes = elementsToAnimate.split(',');
        attributes.forEach((attr) => {
            const elements = document.querySelectorAll(attr);
            let idx = 0;
            // in intervals play their initial animations
            const interval = setInterval(() => {
                if (idx === elements.length) {
                    clearInterval(interval);
                    return;
                }
                const element = elements[idx];
                // add the class to the elements classes in order to run the transition
                element.classList.add(classToTransitionToo);
                idx += 1;
            }, animationInterval);
        });
    }
    return {
        addClassOnInterval
    };
})();
function getPixelPosInElOnClick(mouseEvt) {
    const rect = mouseEvt.target.getBoundingClientRect();
    const x = mouseEvt.clientX - rect.left; // x position within the element.
    const y = mouseEvt.clientY - rect.top; // y position within the element.
    return { x, y };
}
exports.getPixelPosInElOnClick = getPixelPosInElOnClick;
function throwExpression(errorMessage) {
    throw new Error(errorMessage);
}
exports.throwExpression = throwExpression;
function addItemsToPlaylist(playlistId, uris) {
    return __awaiter(this, void 0, void 0, function* () {
        yield promiseHandler((0, axios_1.default)({
            method: 'post',
            url: exports.config.URLs.postItemsToPlaylist(playlistId),
            data: {
                uris: uris
            }
        }), () => { }, () => {
            throw new Error('Issue adding items to playlist');
        });
    });
}
exports.addItemsToPlaylist = addItemsToPlaylist;
/**
 * Shuffles a given array and returns the shuffled version.
 * @param {Array<T>} array The array to shuffle but not mutate.
 * @returns {Array<T>} a shuffled version of the given array.
 */
function shuffle(array) {
    const cloneArr = [...array];
    let currentIndex = array.length;
    let randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [cloneArr[currentIndex], cloneArr[randomIndex]] = [
            cloneArr[randomIndex], cloneArr[currentIndex]
        ];
    }
    return cloneArr;
}
exports.shuffle = shuffle;


/***/ }),

/***/ "./src/public/manage-tokens.ts":
/*!*************************************!*\
  !*** ./src/public/manage-tokens.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.onSuccessfulTokenCall = exports.generateLogin = exports.getTokens = exports.checkIfHasTokens = void 0;
const config_1 = __webpack_require__(/*! ./config */ "./src/public/config.ts");
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const user_data_1 = __webpack_require__(/*! ./user-data */ "./src/public/user-data.ts");
/**
 * Checks to see if this users redis session contains a valid access token to the spotify web api.
 *
 * @returns {boolean} whether the redis session contains a valid access token to the spotify web api.
 */
function checkIfHasTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        let hasToken = false;
        // await promise resolve that returns whether the session has tokens.
        yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getHasTokens), (res) => {
            hasToken = res.data;
        });
        return hasToken;
    });
}
exports.checkIfHasTokens = checkIfHasTokens;
/**
 * Attempts to obtain token from spotify api using the auth code retrieved from the url after a user login has been made.
 *
 * @returns {boolean} whether a valid token was retrieved.
 */
function getTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        let hasToken = false;
        // create a parameter searcher in the URL after '?' which holds the requests body parameters
        const urlParams = new URLSearchParams(window.location.search);
        // Get the code from the parameter called 'code' in the url which
        // hopefully came back from the spotify GET request otherwise it is null
        let authCode = urlParams.get('code');
        if (authCode) {
            // obtain tokens
            yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getObtainTokensPrefix(authCode)), 
            // if the request was succesful we have recieved a token
            () => {
                hasToken = true;
            });
            authCode = '';
            // get user info from spotify
            yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getCurrentUserProfile));
        }
        window.history.pushState(null, '', '/');
        return hasToken;
    });
}
exports.getTokens = getTokens;
/**
 * Generate a login/change account link. Defaults to appending it onto the nav bar.
 *
 * @param {Array<String>} classesToAdd - the classes to add onto the link.
 * @param {Boolean} changeAccount - Whether the link should be for changing account, or for logging in. (defaults to true)
 * @param {HTMLElement} parentEl - the parent element to append the link onto. (defaults to navbar)
 */
function generateLogin({ classesToAdd = ['right'], changeAccount = true, parentEl = document
    .getElementsByClassName('topnav')[0]
    .getElementsByClassName('right')[0]
    .getElementsByClassName('dropdown-content')[0] } = {}) {
    // Create anchor element.
    const a = document.createElement('a');
    a.href = config_1.config.URLs.auth;
    // Create the text node for anchor element.
    const link = document.createTextNode(changeAccount ? 'Change Account' : 'Login To Spotify');
    // Append the text node to anchor element.
    a.appendChild(link);
    for (let i = 0; i < classesToAdd.length; i++) {
        const classToAdd = classesToAdd[i];
        a.classList.add(classToAdd);
    }
    // clear current tokens when clicked
    a.addEventListener('click', () => {
        axios_1.default.put(config_1.config.URLs.putClearTokens).catch((err) => console.error(err));
    });
    // Append the anchor element to the parent.
    parentEl.appendChild(a);
}
exports.generateLogin = generateLogin;
/**
 * Called once the redis session has been checked for a valid token. If one does not exist this function will generate a login element.
 * Otherwise if a valid token does exist then this function display the username.
 *
 * @param hasToken whether the redis session has a valid access token to the spotify api.
 * @param hasTokenCallback callback to run if a valid token exists.
 * @param noTokenCallBack callhback to run if a valid token does not exist.
 * @param redirectHome whether to redirect back to the home page.
 */
function onSuccessfulTokenCall(hasToken, hasTokenCallback = () => { }, noTokenCallBack = () => { }, redirectHome = true) {
    var _a, _b;
    const getTokensSpinner = document.getElementById(config_1.config.CSS.IDs.getTokenLoadingSpinner);
    // remove token spinner because by this line we have obtained the token
    (_a = getTokensSpinner === null || getTokensSpinner === void 0 ? void 0 : getTokensSpinner.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(getTokensSpinner);
    const infoContainer = document.getElementById(config_1.config.CSS.IDs.infoContainer);
    // generate the nav login
    generateLogin({ changeAccount: hasToken, parentEl: (_b = document.getElementById(config_1.config.CSS.IDs.topNavMobile)) !== null && _b !== void 0 ? _b : (0, config_1.throwExpression)('No top nav mobile element found') });
    generateLogin({ changeAccount: hasToken });
    if (hasToken) {
        if (infoContainer == null) {
            throw new Error('Info container Element does not exist');
        }
        infoContainer.style.display = 'block';
        (0, user_data_1.displayUsername)();
        console.log('display username');
        hasTokenCallback();
    }
    else {
        // if there is no token redirect to allow access page
        if (redirectHome) {
            window.location.href = config_1.config.URLs.siteUrl;
        }
        noTokenCallBack();
    }
}
exports.onSuccessfulTokenCall = onSuccessfulTokenCall;


/***/ }),

/***/ "./src/public/pages/top-artists-page/top-artists.ts":
/*!**********************************************************!*\
  !*** ./src/public/pages/top-artists-page/top-artists.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const artist_1 = __webpack_require__(/*! ../../components/artist */ "./src/public/components/artist.ts");
const config_1 = __webpack_require__(/*! ../../config */ "./src/public/config.ts");
const SelectableTabEls_1 = __importDefault(__webpack_require__(/*! ../../components/SelectableTabEls */ "./src/public/components/SelectableTabEls.ts"));
const manage_tokens_1 = __webpack_require__(/*! ../../manage-tokens */ "./src/public/manage-tokens.ts");
const asyncSelectionVerif_1 = __importDefault(__webpack_require__(/*! ../../components/asyncSelectionVerif */ "./src/public/components/asyncSelectionVerif.ts"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const save_load_term_1 = __webpack_require__(/*! ../../components/save-load-term */ "./src/public/components/save-load-term.ts");
const MAX_VIEWABLE_CARDS = 5;
const artistActions = (function () {
    const selections = {
        numViewableCards: MAX_VIEWABLE_CARDS,
        term: save_load_term_1.TERMS.SHORT_TERM
    };
    function loadArtistTopTracks(artistObj, callback) {
        artistObj
            .loadTopTracks()
            .then(() => {
            callback();
        })
            .catch((err) => {
            console.log('Error when loading artists');
            console.error(err);
        });
    }
    function showTopTracks(artistObj) {
        loadArtistTopTracks(artistObj, () => {
            const trackList = getTopTracksUlFromArtist(artistObj);
            let rank = 1;
            if (artistObj.topTracks === undefined) {
                (0, config_1.throwExpression)('artist does not have top tracks loaded on request to show them');
            }
            for (const track of artistObj.topTracks.values()) {
                trackList.appendChild(track.getRankedTrackHtml(artistObj.topTracks, rank));
                rank++;
            }
        });
    }
    function getTopTracksUlFromArtist(artistObj) {
        var _a;
        const artistCard = (_a = document.getElementById(artistObj.cardId)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('artist card does not exist');
        const trackList = artistCard.getElementsByClassName(config_1.config.CSS.CLASSES.trackList)[0];
        if (trackList === null) {
            (0, config_1.throwExpression)(`track ul on artist element with id ${artistObj.cardId} does not exist`);
        }
        return trackList;
    }
    function retrieveArtists(artistArr) {
        return __awaiter(this, void 0, void 0, function* () {
            const { res, err } = yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getTopArtists + selections.term));
            if (err) {
                return;
            }
            // we know res is not null because it is only null if an error exists in which we have already returned
            (0, artist_1.generateArtistsFromData)(res.data, artistArr);
        });
    }
    function getCurrSelTopArtists() {
        if (selections.term === save_load_term_1.TERMS.SHORT_TERM) {
            return artistArrs.topArtistObjsShortTerm;
        }
        else if (selections.term === save_load_term_1.TERMS.MID_TERM) {
            return artistArrs.topArtistObjsMidTerm;
        }
        else if (selections.term === save_load_term_1.TERMS.LONG_TERM) {
            return artistArrs.topArtistObjsLongTerm;
        }
        else {
            throw new Error('Selected track term is invalid ' + selections.term);
        }
    }
    return {
        showTopTracks,
        retrieveArtists,
        selections,
        getCurrSelTopArtists
    };
})();
const artistCardsHandler = (function () {
    var _a;
    const selectionVerif = new asyncSelectionVerif_1.default();
    const artistContainer = (_a = document.getElementById(config_1.config.CSS.IDs.artistCardsContainer)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`artist container of id ${config_1.config.CSS.IDs.artistCardsContainer} does not exist`);
    /**
     * Generates the cards to the DOM then makes them visible
     * @param {Array<Artist>} artistArr array of track objects whose cards should be generated.
     * @param {Boolean} autoAppear whether to show the card without animation or with animation.
     * @returns {Array<HTMLElement>} array of the card elements.
     */
    function generateCards(artistArr, autoAppear) {
        (0, config_1.removeAllChildNodes)(artistContainer);
        // fill arr of card elements and append them to DOM
        for (let i = 0; i < artistArr.length; i++) {
            if (i < artistActions.selections.numViewableCards) {
                const artistObj = artistArr[i];
                const cardHtml = artistObj.getArtistHtml(i);
                artistContainer.appendChild(cardHtml);
                artistActions.showTopTracks(artistObj);
            }
            else {
                break;
            }
        }
        if (!autoAppear) {
            config_1.animationControl.addClassOnInterval('.' + config_1.config.CSS.CLASSES.artist, config_1.config.CSS.CLASSES.appear, 25);
        }
    }
    /**
     * Begins retrieving artists then when done verifies it is the correct selected artist.
     * @param {Array<Artist>} artistArr array to load artists into.
     */
    function startLoadingArtists(artistArr) {
        // initially show the loading spinner
        const htmlString = `
            <div>
              <img src="${config_1.config.PATHS.spinner}" alt="Loading..." />
            </div>`;
        const spinnerEl = (0, config_1.htmlToEl)(htmlString);
        (0, config_1.removeAllChildNodes)(artistContainer);
        artistContainer.appendChild(spinnerEl);
        artistActions.retrieveArtists(artistArr).then(() => {
            // after retrieving async verify if it is the same arr of Artist's as what was selected
            if (!selectionVerif.isValid(artistArr)) {
                return;
            }
            return generateCards(artistArr, false);
        });
    }
    /** Load artist objects if not loaded, then generate cards with the objects.
     *
     * @param {Array<Artist>} artistArr - List of track objects whose cards should be generated or
     * empty list that should be filled when loading tracks.
     * @param {Boolean} autoAppear whether to show the cards without animation.
     * @returns {Array<HTMLElement>} list of Card HTMLElement's.
     */
    function displayArtistCards(artistArr, autoAppear = false) {
        selectionVerif.selectionChanged(artistArr);
        if (artistArr.length > 0) {
            generateCards(artistArr, autoAppear);
        }
        else {
            startLoadingArtists(artistArr);
        }
    }
    return {
        displayArtistCards
    };
})();
const artistArrs = (function () {
    const topArtistObjsShortTerm = [];
    const topArtistObjsMidTerm = [];
    const topArtistObjsLongTerm = [];
    return {
        topArtistObjsShortTerm,
        topArtistObjsMidTerm,
        topArtistObjsLongTerm
    };
})();
const artistTermSelections = (_a = document
    .getElementById(config_1.config.CSS.IDs.artistTermSelections)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`term selection of id ${config_1.config.CSS.IDs.artistTermSelections} does not exist`);
const selections = {
    termTabManager: new SelectableTabEls_1.default()
};
const addEventListeners = (function () {
    function addArtistTermButtonEvents() {
        function onClick(btn, borderCover) {
            var _a;
            const attr = (_a = btn.getAttribute(config_1.config.CSS.ATTRIBUTES.dataSelection)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`attribute ${config_1.config.CSS.ATTRIBUTES.dataSelection} does not exist on term button`);
            artistActions.selections.term = (0, save_load_term_1.determineTerm)(attr);
            (0, save_load_term_1.saveTerm)(artistActions.selections.term, save_load_term_1.TERM_TYPE.ARTISTS);
            selections.termTabManager.selectNewTab(btn, borderCover);
            const currArtists = artistActions.getCurrSelTopArtists();
            artistCardsHandler.displayArtistCards(currArtists);
        }
        const artistTermBtns = artistTermSelections.getElementsByTagName('button');
        const trackTermBorderCovers = artistTermSelections.getElementsByClassName(config_1.config.CSS.CLASSES.borderCover);
        if (trackTermBorderCovers.length !== artistTermBtns.length) {
            console.error('Not all track term buttons contain a border cover');
            return;
        }
        for (let i = 0; i < artistTermBtns.length; i++) {
            const btn = artistTermBtns[i];
            const borderCover = trackTermBorderCovers[i];
            btn.addEventListener('click', () => onClick(btn, borderCover));
        }
    }
    return {
        addArtistTermButtonEvents
    };
})();
(function () {
    (0, config_1.promiseHandler)((0, manage_tokens_1.checkIfHasTokens)(), (hasToken) => (0, manage_tokens_1.onSuccessfulTokenCall)(hasToken, () => {
        (0, save_load_term_1.loadTerm)(save_load_term_1.TERM_TYPE.ARTISTS).then(term => {
            artistActions.selections.term = term;
            artistCardsHandler.displayArtistCards(artistActions.getCurrSelTopArtists());
            (0, save_load_term_1.selectStartTermTab)(term, selections.termTabManager, artistTermSelections);
        });
    }));
    Object.entries(addEventListeners).forEach(([, addEventListener]) => {
        addEventListener();
    });
})();


/***/ }),

/***/ "./src/public/user-data.ts":
/*!*********************************!*\
  !*** ./src/public/user-data.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.displayUsername = void 0;
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const config_1 = __webpack_require__(/*! ./config */ "./src/public/config.ts");
function displayUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, config_1.promiseHandler)(axios_1.default.request({ method: 'GET', url: config_1.config.URLs.getUsername }), (res) => {
            const username = document.getElementById(config_1.config.CSS.IDs.username);
            if (username) {
                username.textContent = res.data;
            }
        });
    });
}
exports.displayUsername = displayUsername;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/public/pages/top-artists-page/top-artists.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDakUsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osUUFBUSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSTthQUNoQztRQUNILENBQUMsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQVBELDBDQU9DOzs7Ozs7O1VDVkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZW52L2RhdGEuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9TZWxlY3RhYmxlVGFiRWxzLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FsYnVtLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FydGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9hc3luY1NlbGVjdGlvblZlcmlmLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2NhcmQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3BsYXliYWNrLXNkay50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvYWdncmVnYXRvci50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL3N1YnNjcmlwdGlvbi50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zYXZlLWxvYWQtdGVybS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXliYWNrLWVsZW1lbnQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvdHJhY2sudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbmZpZy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvbWFuYWdlLXRva2Vucy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvcGFnZXMvdG9wLWFydGlzdHMtcGFnZS90b3AtYXJ0aXN0cy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvdXNlci1kYXRhLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIHZhciBvbkNhbmNlbGVkO1xuICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi51bnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUoZnVuY3Rpb24gX3Jlc29sdmUodmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIGZ1bmN0aW9uIF9yZWplY3QoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dCA/ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcgOiAndGltZW91dCBleGNlZWRlZCc7XG4gICAgICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuIHx8IGNvbmZpZy5zaWduYWwpIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgICBvbkNhbmNlbGVkID0gZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoIWNhbmNlbCB8fCAoY2FuY2VsICYmIGNhbmNlbC50eXBlKSA/IG5ldyBDYW5jZWwoJ2NhbmNlbGVkJykgOiBjYW5jZWwpO1xuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfTtcblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuICYmIGNvbmZpZy5jYW5jZWxUb2tlbi5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLmFib3J0ZWQgPyBvbkNhbmNlbGVkKCkgOiBjb25maWcuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuICBpbnN0YW5jZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoZGVmYXVsdENvbmZpZywgaW5zdGFuY2VDb25maWcpKTtcbiAgfTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5heGlvcy5WRVJTSU9OID0gcmVxdWlyZSgnLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcblxuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbihmdW5jdGlvbihjYW5jZWwpIHtcbiAgICBpZiAoIXRva2VuLl9saXN0ZW5lcnMpIHJldHVybjtcblxuICAgIHZhciBpO1xuICAgIHZhciBsID0gdG9rZW4uX2xpc3RlbmVycy5sZW5ndGg7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbi5fbGlzdGVuZXJzW2ldKGNhbmNlbCk7XG4gICAgfVxuICAgIHRva2VuLl9saXN0ZW5lcnMgPSBudWxsO1xuICB9KTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbiA9IGZ1bmN0aW9uKG9uZnVsZmlsbGVkKSB7XG4gICAgdmFyIF9yZXNvbHZlO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICB0b2tlbi5zdWJzY3JpYmUocmVzb2x2ZSk7XG4gICAgICBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgfSkudGhlbihvbmZ1bGZpbGxlZCk7XG5cbiAgICBwcm9taXNlLmNhbmNlbCA9IGZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgICAgIHRva2VuLnVuc3Vic2NyaWJlKF9yZXNvbHZlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH07XG5cbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICBsaXN0ZW5lcih0aGlzLnJlYXNvbik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuX2xpc3RlbmVycykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBbbGlzdGVuZXJdO1xuICB9XG59O1xuXG4vKipcbiAqIFVuc3Vic2NyaWJlIGZyb20gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiB1bnN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAoIXRoaXMuX2xpc3RlbmVycykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSB0aGlzLl9saXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cblxuICBpZiAoY29uZmlnLnNpZ25hbCAmJiBjb25maWcuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgc3RhdHVzOiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc3RhdHVzID8gdGhpcy5yZXNwb25zZS5zdGF0dXMgOiBudWxsXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURpcmVjdEtleXMocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1lcmdlTWFwID0ge1xuICAgICd1cmwnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdtZXRob2QnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdkYXRhJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnYmFzZVVSTCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlcXVlc3QnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXNwb25zZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3BhcmFtc1NlcmlhbGl6ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dE1lc3NhZ2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd3aXRoQ3JlZGVudGlhbHMnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdhZGFwdGVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VUeXBlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkNvb2tpZU5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmSGVhZGVyTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uVXBsb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvbkRvd25sb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdkZWNvbXByZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Q29udGVudExlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heEJvZHlMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc3BvcnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwc0FnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnY2FuY2VsVG9rZW4nOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdzb2NrZXRQYXRoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VFbmNvZGluZyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3ZhbGlkYXRlU3RhdHVzJzogbWVyZ2VEaXJlY3RLZXlzXG4gIH07XG5cbiAgdXRpbHMuZm9yRWFjaChPYmplY3Qua2V5cyhjb25maWcxKS5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpLCBmdW5jdGlvbiBjb21wdXRlQ29uZmlnVmFsdWUocHJvcCkge1xuICAgIHZhciBtZXJnZSA9IG1lcmdlTWFwW3Byb3BdIHx8IG1lcmdlRGVlcFByb3BlcnRpZXM7XG4gICAgdmFyIGNvbmZpZ1ZhbHVlID0gbWVyZ2UocHJvcCk7XG4gICAgKHV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZ1ZhbHVlKSAmJiBtZXJnZSAhPT0gbWVyZ2VEaXJlY3RLZXlzKSB8fCAoY29uZmlnW3Byb3BdID0gY29uZmlnVmFsdWUpO1xuICB9KTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH0sXG5cbiAgaGVhZGVyczoge1xuICAgIGNvbW1vbjoge1xuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gICAgfVxuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwidmVyc2lvblwiOiBcIjAuMjQuMFwiXG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBWRVJTSU9OID0gcmVxdWlyZSgnLi4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3IgLSBzZXQgdG8gZmFsc2UgaWYgdGhlIHRyYW5zaXRpb25hbCBvcHRpb24gaGFzIGJlZW4gcmVtb3ZlZFxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uIC0gZGVwcmVjYXRlZCB2ZXJzaW9uIC8gcmVtb3ZlZCBzaW5jZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IG1lc3NhZ2UgLSBzb21lIG1lc3NhZ2Ugd2l0aCBhZGRpdGlvbmFsIGluZm9cbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBWRVJTSU9OICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkJyArICh2ZXJzaW9uID8gJyBpbiAnICsgdmVyc2lvbiA6ICcnKSkpO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5cclxuY2xhc3MgU2VsZWN0YWJsZVRhYkVscyB7XHJcbiAgYnRuOiBFbGVtZW50IHwgdW5kZWZpbmVkIC8vIGN1cnJlbnRseSBzZWxlY3RlZCB0YWIgYnV0dG9uXHJcbiAgYm9yZGVyQ292ZXI6IEVsZW1lbnQgfCB1bmRlZmluZWQgLy8gY3VycmVudGx5IHNlbGVjdGVkIHRhYiBib3JkZXIgY292ZXJcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB0aGUgcmVxdWlyZWQgQ1NTIGNsYXNzZXMgdG8gdGhlIGN1cnJlbnQgZWxlbWVudHMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1bnNlbGVjdEVscyAoKSB7XHJcbiAgICBpZiAodGhpcy5idG4gJiYgdGhpcy5ib3JkZXJDb3Zlcikge1xyXG4gICAgICB0aGlzLmJ0bi5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgICAgdGhpcy5ib3JkZXJDb3Zlci5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgdGhlIHJlcXVpcmVkIENTUyBjbGFzc2VzIHRvIHRoZSBjdXJyZW50IGVsZW1lbnRzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2VsZWN0RWxzICgpIHtcclxuICAgIGlmICh0aGlzLmJ0biAmJiB0aGlzLmJvcmRlckNvdmVyKSB7XHJcbiAgICAgIHRoaXMuYnRuLmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgICB0aGlzLmJvcmRlckNvdmVyLmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VsZWN0IG5ldyB0YWIgYW5kIHVuc2VsZWN0IHByZXZpb3VzIHRhYi5cclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGJ0biB0aGUgYnV0dG9uIGZvciB0aGUgdGFiIHRoYXQgd2lsbCBiZSBzZWxlY3RlZC5cclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGJvcmRlckNvdmVyIHRoZSBib3JkZXIgY292ZXIgZm9yIHRoZSB0YWIgdGhhdCB3aWxsIGJlIHNlbGVjdGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZWxlY3ROZXdUYWIgKGJ0bjogRWxlbWVudCwgYm9yZGVyQ292ZXI6IEVsZW1lbnQpIHtcclxuICAgIC8vIHVuc2VsZWN0IHRoZSBwcmV2aW91cyB0YWJcclxuICAgIHRoaXMudW5zZWxlY3RFbHMoKVxyXG5cclxuICAgIC8vIHJlYXNzaWduIHRoZSBuZXcgdGFiIGVsZW1lbnRzXHJcbiAgICB0aGlzLmJ0biA9IGJ0blxyXG4gICAgdGhpcy5ib3JkZXJDb3ZlciA9IGJvcmRlckNvdmVyXHJcblxyXG4gICAgLy8gc2VsZWN0IHRoZSBuZXcgdGFiXHJcbiAgICB0aGlzLnNlbGVjdEVscygpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTZWxlY3RhYmxlVGFiRWxzXHJcbiIsImNsYXNzIEFsYnVtIHtcclxuICBuYW1lOiBzdHJpbmdcclxuICBleHRlcm5hbFVybDogc3RyaW5nXHJcblxyXG4gIGNvbnN0cnVjdG9yIChuYW1lOiBzdHJpbmcsIGV4dGVybmFsVXJsOiBzdHJpbmcpIHtcclxuICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgIHRoaXMuZXh0ZXJuYWxVcmwgPSBleHRlcm5hbFVybFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQWxidW1cclxuIiwiaW1wb3J0IHsgY29uZmlnLCBodG1sVG9FbCwgZ2V0VmFsaWRJbWFnZSB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IFRyYWNrLCB7IGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgfSBmcm9tICcuL3RyYWNrJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcbmltcG9ydCBEb3VibHlMaW5rZWRMaXN0IGZyb20gJy4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgeyBBcnRpc3REYXRhLCBTcG90aWZ5SW1nIH0gZnJvbSAnLi4vLi4vdHlwZXMnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuXHJcbmNsYXNzIEFydGlzdCBleHRlbmRzIENhcmQge1xyXG4gIGFydGlzdElkOiBzdHJpbmdcclxuICBuYW1lOiBzdHJpbmdcclxuICBnZW5yZXM6IEFycmF5PHN0cmluZz5cclxuICBmb2xsb3dlckNvdW50OiBzdHJpbmdcclxuICBleHRlcm5hbFVybDogc3RyaW5nXHJcbiAgaW1hZ2VVcmw6IHN0cmluZ1xyXG4gIHRvcFRyYWNrczogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCB1bmRlZmluZWRcclxuXHJcbiAgY29uc3RydWN0b3IgKGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZ2VucmVzOiBBcnJheTxzdHJpbmc+LCBmb2xsb3dlckNvdW50OiBzdHJpbmcsIGV4dGVybmFsVXJsOiBzdHJpbmcsIGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuYXJ0aXN0SWQgPSBpZFxyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5nZW5yZXMgPSBnZW5yZXNcclxuICAgIHRoaXMuZm9sbG93ZXJDb3VudCA9IGZvbGxvd2VyQ291bnRcclxuICAgIHRoaXMuZXh0ZXJuYWxVcmwgPSBleHRlcm5hbFVybFxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqICBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgYXJ0aXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgZ2V0QXJ0aXN0SHRtbCAoaWR4OiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0UHJlZml4fSR7aWR4fWBcclxuXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBsZXQgZ2VucmVMaXN0ID0gJydcclxuICAgIHRoaXMuZ2VucmVzLmZvckVhY2goKGdlbnJlKSA9PiB7XHJcbiAgICAgIGdlbnJlTGlzdCArPSAnPGxpPicgKyBnZW5yZSArICc8L2xpPidcclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdH0gJHtjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUlufVwiIGlkPVwiJHt0aGlzLmNhcmRJZH1cIj5cclxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNvbnRlbnR9XCI+XHJcbiAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiYXJ0aXN0LWJhc2VcIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9JHt0aGlzLmltYWdlVXJsfSBhbHQ9XCJBcnRpc3RcIi8+XHJcbiAgICAgICAgICAgIDxoMz48YSBocmVmPSR7dGhpcy5leHRlcm5hbFVybH0gdGFyZ2V0PVwiX2JsYW5rXCI+JHt0aGlzLm5hbWV9PC9hPjwvaDM+XHJcbiAgICAgICAgICAgIDx1bCBjbGFzcz1cImdlbnJlc1wiPlxyXG4gICAgICAgICAgICAgICR7Z2VucmVMaXN0fVxyXG4gICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgPC9oZWFkZXI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMudHJhY2tzQXJlYX1cIj5cclxuICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3RUb3BUcmFja3N9XCI+XHJcbiAgICAgICAgICAgICAgPGhlYWRlcj5cclxuICAgICAgICAgICAgICAgIDxoND5Ub3AgVHJhY2tzPC9oND5cclxuICAgICAgICAgICAgICA8L2hlYWRlcj5cclxuICAgICAgICAgICAgICA8dWwgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxCYXJ9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrTGlzdH1cIj5cclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICA8L3NlY3Rpb24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L3NlY3Rpb24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICBgXHJcbiAgICByZXR1cm4gaHRtbFRvRWwoaHRtbCkgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIGFydGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBUaGUgY2FyZCBpbmRleCB0byB1c2UgZm9yIHRoZSBlbGVtZW50cyBpZCBzdWZmaXhcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIGdldEFydGlzdENhcmRIdG1sIChpZHg6IG51bWJlciwgdW5hbmltYXRlZEFwcGVhciA9IGZhbHNlKTogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLmFydGlzdFByZWZpeH0ke2lkeH1gXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBjb25zdCBhcHBlYXJDbGFzcyA9IHVuYW5pbWF0ZWRBcHBlYXIgPyBjb25maWcuQ1NTLkNMQVNTRVMuYXBwZWFyIDogJydcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZhZGVJblxyXG4gICAgfSAke2FwcGVhckNsYXNzfVwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0XHJcbiAgICB9ICAke2NvbmZpZy5DU1MuQ0xBU1NFUy5leHBhbmRPbkhvdmVyfVwiPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZElubmVyXHJcbiAgICB9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdH1cIiBpZD1cIiR7dGhpcy5nZXRDYXJkSWQoKX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkRnJvbnRcclxuICAgICAgICAgICAgICAgICAgfVwiICB0aXRsZT1cIkNsaWNrIHRvIHZpZXcgbW9yZSBJbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMuaW1hZ2VVcmx9XCIgYWx0PVwiQWxidW0gQ292ZXJcIj48L2ltZz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgfVwiPiR7dGhpcy5uYW1lfTwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkQmFja30+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPjxhIGhyZWY9XCIke3RoaXMuZXh0ZXJuYWxVcmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCIgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMucmVzdHJpY3RGbGlwT25DbGlja309XCJ0cnVlXCI+JHt0aGlzLm5hbWV9PC9hPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkZvbGxvd2Vyczo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5mb2xsb3dlckNvdW50fTwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8aDM+R2VucmVzOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+JHt0aGlzLmdlbnJlc308L3A+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExvYWQgdG9wIHRyYWNrcyBmcm9tIHRoZSBzcG90aWZ5IEFQSSBhbmQgY29udmVydCB0aGUgZGF0YSBpbnRvIGEgRG91Ymx5TGlua2VkTGlzdCBvZiBUcmFjayBpbnN0YW5jZXMuXHJcbiAgICogQHJldHVybnMge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+fSBsaXN0IG9mIFRyYWNrcyBvYnRhaW5lZCBmcm9tIHRoZSBkYXRhLlxyXG4gICAqL1xyXG4gIGFzeW5jIGxvYWRUb3BUcmFja3MgKCk6IFByb21pc2U8RG91Ymx5TGlua2VkTGlzdDxUcmFjaz4+IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRBcnRpc3RUb3BUcmFja3ModGhpcy5hcnRpc3RJZCkpXHJcbiAgICBjb25zdCB0cmFja3NEYXRhID0gcmVzLmRhdGEudHJhY2tzXHJcbiAgICBjb25zdCB0cmFja09ianMgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4oKVxyXG5cclxuICAgIGdlbmVyYXRlVHJhY2tzRnJvbURhdGEodHJhY2tzRGF0YSwgdHJhY2tPYmpzKVxyXG5cclxuICAgIHRoaXMudG9wVHJhY2tzID0gdHJhY2tPYmpzXHJcbiAgICByZXR1cm4gdHJhY2tPYmpzXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSB0b3AgdHJhY2tzIG9mIHRoaXMgYXJ0aXN0IGhhdmUgYmVlbiBsb2FkZWQgZGVwZW5kcyBvbiB3aGV0aGVyIHRoaXMudG9wVHJhY2tzIGhhcyBiZWVuIGFzc2lnbmVkLlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSB0b3AgdHJhY2tzIGhhdmUgYmVlbiBsb2FkZWQuXHJcbiAgICovXHJcbiAgaGFzTG9hZGVkVG9wVHJhY2tzICgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnRvcFRyYWNrcyAhPT0gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGluc3RhbmNlcyBvZiB0aGUgQXJ0aXN0IGNsYXNzIGdpdmVuIGFuIGFycmF5IG9mIEFydGlzdERhdGEuXHJcbiAqIEBwYXJhbSB7QXJyYXk8QXJ0aXN0RGF0YT59IGRhdGFzIHRoZSBkYXRhIHRvIGJlIHVzZWQgdG8gY3JlYXRlIHRoZSBBcnRpc3QgaW5zdGFuY2VzLlxyXG4gKiBAcGFyYW0ge0FycmF5PEFydGlzdD59IGFydGlzdEFyciByZWYgdG8gdGhlIGFycmF5IHRoYXQgd2lsbCBzdG9yZSB0aGUgY3JlYXRlZCBBcnRpc3QgaW5zdGFuY2VzLlxyXG4gKiBAcmV0dXJucyB7QXJyYXk8QXJ0aXN0Pn0gdGhlIGFydGlzdCBhcnJheSB0aGF0IHdhcyBnaXZlbiBhbmQgaGFzIG5vdyBiZWVuIG11dGF0ZWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEgKGRhdGFzOiBBcnJheTxBcnRpc3REYXRhPiwgYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+KSA6IEFycmF5PEFydGlzdD4ge1xyXG4gIGRhdGFzLmZvckVhY2goKGRhdGE6IEFydGlzdERhdGEpID0+IHtcclxuICAgIGFydGlzdEFyci5wdXNoKFxyXG4gICAgICBuZXcgQXJ0aXN0KFxyXG4gICAgICAgIGRhdGEuaWQsXHJcbiAgICAgICAgZGF0YS5uYW1lLFxyXG4gICAgICAgIGRhdGEuZ2VucmVzLFxyXG4gICAgICAgIGRhdGEuZm9sbG93ZXJzLnRvdGFsLFxyXG4gICAgICAgIGRhdGEuZXh0ZXJuYWxfdXJscy5zcG90aWZ5LFxyXG4gICAgICAgIGRhdGEuaW1hZ2VzXHJcbiAgICAgIClcclxuICAgIClcclxuICB9KVxyXG4gIHJldHVybiBhcnRpc3RBcnJcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0XHJcbiIsImNsYXNzIEFzeW5jU2VsZWN0aW9uVmVyaWY8VD4ge1xyXG4gIHByaXZhdGUgX2N1cnJTZWxlY3RlZFZhbDogVCB8IG51bGxcclxuICBoYXNMb2FkZWRDdXJyU2VsZWN0ZWQ6IGJvb2xlYW5cclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5fY3VyclNlbGVjdGVkVmFsID0gbnVsbFxyXG5cclxuICAgIC8vIHVzZWQgdG8gZW5zdXJlIHRoYXQgYW4gb2JqZWN0IHRoYXQgaGFzIGxvYWRlZCB3aWxsIG5vdCBiZSBsb2FkZWQgYWdhaW5cclxuICAgIHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkID0gZmFsc2VcclxuICB9XHJcblxyXG4gIGdldCBjdXJyU2VsZWN0ZWRWYWxOb051bGwgKCk6IFQge1xyXG4gICAgaWYgKCF0aGlzLl9jdXJyU2VsZWN0ZWRWYWwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgaXMgYWNjZXNzZWQgd2l0aG91dCBiZWluZyBhc3NpZ25lZCcpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5fY3VyclNlbGVjdGVkVmFsXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXQgY3VyclNlbGVjdGVkVmFsICgpOiBUIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3VyclNlbGVjdGVkVmFsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGFuZ2UgdGhlIHZhbHVlIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgYW5kIHJlc2V0IHRoZSBoYXMgbG9hZGVkIGJvb2xlYW4uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1R9IGN1cnJTZWxlY3RlZFZhbCB0aGUgdmFsdWUgdG8gY2hhbmdlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgdG9vLlxyXG4gICAqL1xyXG4gIHNlbGVjdGlvbkNoYW5nZWQgKGN1cnJTZWxlY3RlZFZhbDogVCkge1xyXG4gICAgdGhpcy5fY3VyclNlbGVjdGVkVmFsID0gY3VyclNlbGVjdGVkVmFsXHJcbiAgICB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgdG8gc2VlIGlmIGEgc2VsZWN0ZWQgdmFsdWUgcG9zdCBsb2FkIGlzIHZhbGlkIGJ5XHJcbiAgICogY29tcGFyaW5nIGl0IHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgYW5kIHZlcmlmeWluZyB0aGF0XHJcbiAgICogdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBoYXMgbm90IGFscmVhZHkgYmVlbiBsb2FkZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1R9IHBvc3RMb2FkVmFsIGRhdGEgdGhhdCBoYXMgYmVlbiBsb2FkZWRcclxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gd2hldGhlciB0aGUgbG9hZGVkIHNlbGVjdGlvbiBpcyB2YWxpZFxyXG4gICAqL1xyXG4gIGlzVmFsaWQgKHBvc3RMb2FkVmFsOiBUKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodGhpcy5fY3VyclNlbGVjdGVkVmFsICE9PSBwb3N0TG9hZFZhbCB8fCB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGlmIGlzIHZhbGlkIHRoZW4gd2UgYXNzdW1lIHRoYXQgdGhpcyB2YWx1ZSB3aWxsIGJlIGxvYWRlZFxyXG4gICAgICB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCA9IHRydWVcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFzeW5jU2VsZWN0aW9uVmVyaWZcclxuIiwiY2xhc3MgQ2FyZCB7XHJcbiAgY2FyZElkOiBzdHJpbmdcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5jYXJkSWQgPSAnJ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBpZCB0aGF0IGNvcnJvc3BvbmRzIHRvIGFuIGVsZW1lbnQgaWQgZm9yIHRoZSBjb3Jyb3Nwb25kaW5nIGNhcmQgZWxlbWVudC5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgY2FyZCBlbGVtZW50IGlkLlxyXG4gICAqL1xyXG4gIGdldENhcmRJZCAoKSB7XHJcbiAgICBpZiAodGhpcy5jYXJkSWQgPT09ICdudWxsJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhcmQgaWQgd2FzIGFza2luZyB0byBiZSByZXRyaWV2ZWQgYnV0IGlzIG51bGwnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY2FyZElkXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYXJkXHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAwOSBOaWNob2xhcyBDLiBaYWthcy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gKi9cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIG5vZGUgaW4gYSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcbiAgZGF0YTogVFxyXG4gIG5leHQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIHByZXZpb3VzOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb3VibHlMaW5rZWRMaXN0Tm9kZS5cclxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgdG8gc3RvcmUgaW4gdGhlIG5vZGUuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKGRhdGE6IFQpIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRhdGEgdGhhdCB0aGlzIG5vZGUgc3RvcmVzLlxyXG4gICAgICogQHByb3BlcnR5IGRhdGFcclxuICAgICAqIEB0eXBlICpcclxuICAgICAqL1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBwb2ludGVyIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIERvdWJseUxpbmtlZExpc3QuXHJcbiAgICAgKiBAcHJvcGVydHkgbmV4dFxyXG4gICAgICogQHR5cGUgP0RvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAgICAgKi9cclxuICAgIHRoaXMubmV4dCA9IG51bGxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcG9pbnRlciB0byB0aGUgcHJldmlvdXMgbm9kZSBpbiB0aGUgRG91Ymx5TGlua2VkTGlzdC5cclxuICAgICAqIEBwcm9wZXJ0eSBwcmV2aW91c1xyXG4gICAgICogQHR5cGUgP0RvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAgICAgKi9cclxuICAgIHRoaXMucHJldmlvdXMgPSBudWxsXHJcbiAgfVxyXG59XHJcbi8qKlxyXG4gKiBBIGRvdWJseSBsaW5rZWQgbGlzdCBpbXBsZW1lbnRhdGlvbiBpbiBKYXZhU2NyaXB0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdFxyXG4gKi9cclxuY2xhc3MgRG91Ymx5TGlua2VkTGlzdDxUPiB7XHJcbiAgaGVhZDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgdGFpbDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb3VibHlMaW5rZWRMaXN0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgLy8gcG9pbnRlciB0byBmaXJzdCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICB0aGlzLmhlYWQgPSBudWxsXHJcblxyXG4gICAgLy8gcG9pbnRlciB0byBsYXN0IG5vZGUgaW4gdGhlIGxpc3Qgd2hpY2ggcG9pbnRzIHRvIG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZHMgc29tZSBkYXRhIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKi9cclxuICBhZGQgKGRhdGE6IFQpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+KGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgLypcclxuICAgICAgICogQmVjYXVzZSB0aGVyZSBhcmUgbm8gbm9kZXMgaW4gdGhlIGxpc3QsIGp1c3Qgc2V0IHRoZVxyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBwb2ludGVyIHRvIHRoZSBuZXcgbm9kZS5cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaGVhZCA9IG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFVubGlrZSBpbiBhIHNpbmdseSBsaW5rZWQgbGlzdCwgd2UgaGF2ZSBhIGRpcmVjdCByZWZlcmVuY2UgdG9cclxuICAgICAgICogdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gU2V0IHRoZSBgbmV4dGAgcG9pbnRlciBvZiB0aGVcclxuICAgICAgICogY3VycmVudCBsYXN0IG5vZGUgdG8gYG5ld05vZGVgIGluIG9yZGVyIHRvIGFwcGVuZCB0aGUgbmV3IGRhdGFcclxuICAgICAgICogdG8gdGhlIGVuZCBvZiB0aGUgbGlzdC4gVGhlbiwgc2V0IGBuZXdOb2RlLnByZXZpb3VzYCB0byB0aGUgY3VycmVudFxyXG4gICAgICAgKiB0YWlsIHRvIGVuc3VyZSBiYWNrd2FyZHMgdHJhY2tpbmcgd29yay5cclxuICAgICAgICovXHJcbiAgICAgIGlmICh0aGlzLnRhaWwgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwubmV4dCA9IG5ld05vZGVcclxuICAgICAgfVxyXG4gICAgICBuZXdOb2RlLnByZXZpb3VzID0gdGhpcy50YWlsXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIExhc3QsIHJlc2V0IGB0aGlzLnRhaWxgIHRvIGBuZXdOb2RlYCB0byBlbnN1cmUgd2UgYXJlIHN0aWxsXHJcbiAgICAgKiB0cmFja2luZyB0aGUgbGFzdCBub2RlIGNvcnJlY3RseS5cclxuICAgICAqL1xyXG4gICAgdGhpcy50YWlsID0gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBzb21lIGRhdGEgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBsaXN0LiBUaGlzIG1ldGhvZCB0cmF2ZXJzZXNcclxuICAgKiB0aGUgZXhpc3RpbmcgbGlzdCBhbmQgcGxhY2VzIHRoZSBkYXRhIGluIGEgbmV3IG5vZGUgYXQgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBhdCB3aGljaCB0byBpbnNlcnQgdGhlIGRhdGEuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGluZGV4IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgaW5zZXJ0QmVmb3JlIChkYXRhOiBULCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgaW5zZXJ0ZWQgaW50byB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZShkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBTcGVjaWFsIGNhc2U6IGlmIGBpbmRleGAgaXMgYDBgLCB0aGVuIG5vIHRyYXZlcnNhbCBpcyBuZWVkZWRcclxuICAgICAqIGFuZCB3ZSBuZWVkIHRvIHVwZGF0ZSBgdGhpcy5oZWFkYCB0byBwb2ludCB0byBgbmV3Tm9kZWAuXHJcbiAgICAgKi9cclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBFbnN1cmUgdGhlIG5ldyBub2RlJ3MgYG5leHRgIHByb3BlcnR5IGlzIHBvaW50ZWQgdG8gdGhlIGN1cnJlbnRcclxuICAgICAgICogaGVhZC5cclxuICAgICAgICovXHJcbiAgICAgIG5ld05vZGUubmV4dCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGN1cnJlbnQgaGVhZCdzIGBwcmV2aW91c2AgcHJvcGVydHkgbmVlZHMgdG8gcG9pbnQgdG8gdGhlIG5ld1xyXG4gICAgICAgKiBub2RlIHRvIGVuc3VyZSB0aGUgbGlzdCBpcyB0cmF2ZXJzYWJsZSBiYWNrd2FyZHMuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQucHJldmlvdXMgPSBuZXdOb2RlXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBOb3cgaXQncyBzYWZlIHRvIHNldCBgdGhpcy5oZWFkYCB0byB0aGUgbmV3IG5vZGUsIGVmZmVjdGl2ZWx5XHJcbiAgICAgICAqIG1ha2luZyB0aGUgbmV3IG5vZGUgdGhlIGZpcnN0IG5vZGUgaW4gdGhlIGxpc3QuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgICAqIGdvbmUuIFRoaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBpID0gMFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgdXNpbmcgYG5leHRgIHBvaW50ZXJzLCBhbmQgbWFrZVxyXG4gICAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAgICogYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0b1xyXG4gICAgICAgKiBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQubmV4dCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgICAgaSsrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEF0IHRoaXMgcG9pbnQsIGBjdXJyZW50YCBpcyBlaXRoZXIgdGhlIG5vZGUgdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YVxyXG4gICAgICAgKiBiZWZvcmUsIG9yIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFRoZSBvbmx5IHdheSB0byB0ZWxsIGlzIGlmXHJcbiAgICAgICAqIGBpYCBpcyBzdGlsbCBsZXNzIHRoYW4gYGluZGV4YCwgdGhhdCBtZWFucyB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlXHJcbiAgICAgICAqIGFuZCBhbiBlcnJvciBzaG91bGQgYmUgdGhyb3duLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKGkgPCBpbmRleCkge1xyXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBJZiBjb2RlIGNvbnRpbnVlcyB0byBleGVjdXRlIGhlcmUsIGl0IG1lYW5zIGBjdXJyZW50YCBpcyB0aGUgbm9kZVxyXG4gICAgICAgKiB0byBpbnNlcnQgbmV3IGRhdGEgYmVmb3JlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBGaXJzdCwgaW5zZXJ0IGBuZXdOb2RlYCBhZnRlciBgY3VycmVudC5wcmV2aW91c2AgYnkgdXBkYXRpbmdcclxuICAgICAgICogYGN1cnJlbnQucHJldmlvdXMubmV4dGAgYW5kIGBuZXdOb2RlLnByZXZpb3VzYC5cclxuICAgICAgICovXHJcbiAgICAgIGN1cnJlbnQhLnByZXZpb3VzIS5uZXh0ID0gbmV3Tm9kZVxyXG4gICAgICBuZXdOb2RlIS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIE5leHQsIGluc2VydCBgY3VycmVudGAgYWZ0ZXIgYG5ld05vZGVgIGJ5IHVwZGF0aW5nIGBuZXdOb2RlLm5leHRgIGFuZFxyXG4gICAgICAgKiBgY3VycmVudC5wcmV2aW91c2AuXHJcbiAgICAgICAqL1xyXG4gICAgICBuZXdOb2RlLm5leHQgPSBjdXJyZW50XHJcbiAgICAgIGN1cnJlbnQucHJldmlvdXMgPSBuZXdOb2RlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnNlcnRzIHNvbWUgZGF0YSBpbnRvIHRoZSBtaWRkbGUgb2YgdGhlIGxpc3QuIFRoaXMgbWV0aG9kIHRyYXZlcnNlc1xyXG4gICAqIHRoZSBleGlzdGluZyBsaXN0IGFuZCBwbGFjZXMgdGhlIGRhdGEgaW4gYSBuZXcgbm9kZSBhZnRlciBhIHNwZWNpZmljIGluZGV4LlxyXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IGFmdGVyIHdoaWNoIHRvIGluc2VydCB0aGUgZGF0YS5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiB0aGUgaW5kZXggZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBpbnNlcnRBZnRlciAoZGF0YTogVCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGUoZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGFkZCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQgYW5kIHVwZGF0ZVxyXG4gICAgICogdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpbiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIGluc2VydCB0aGUgbmV3IGRhdGEuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgIGkrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgaXMgZWl0aGVyIHRoZSBub2RlIHRvIGluc2VydCB0aGUgbmV3IGRhdGFcclxuICAgICAqIGJlZm9yZSwgb3IgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gVGhlIG9ubHkgd2F5IHRvIHRlbGwgaXMgaWZcclxuICAgICAqIGBpYCBpcyBzdGlsbCBsZXNzIHRoYW4gYGluZGV4YCwgdGhhdCBtZWFucyB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlXHJcbiAgICAgKiBhbmQgYW4gZXJyb3Igc2hvdWxkIGJlIHRocm93bi5cclxuICAgICAqL1xyXG4gICAgaWYgKGkgPCBpbmRleCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgY29kZSBjb250aW51ZXMgdG8gZXhlY3V0ZSBoZXJlLCBpdCBtZWFucyBgY3VycmVudGAgaXMgdGhlIG5vZGVcclxuICAgICAqIHRvIGluc2VydCBuZXcgZGF0YSBhZnRlci5cclxuICAgICAqL1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogYGN1cnJlbnRgIGlzIHRoZSB0YWlsLCBzbyByZXNldCBgdGhpcy50YWlsYFxyXG4gICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICB0aGlzLnRhaWwgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBPdGhlcndpc2UsIGluc2VydCBgbmV3Tm9kZWAgYmVmb3JlIGBjdXJyZW50Lm5leHRgIGJ5IHVwZGF0aW5nXHJcbiAgICAgICAqIGBjdXJyZW50Lm5leHQucHJldmlvdXNgIGFuZCBgbmV3Tm9kZS5ub2RlYC5cclxuICAgICAgICovXHJcbiAgICAgIGN1cnJlbnQhLm5leHQhLnByZXZpb3VzID0gbmV3Tm9kZVxyXG4gICAgICBuZXdOb2RlLm5leHQgPSBjdXJyZW50IS5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIE5leHQsIGluc2VydCBgbmV3Tm9kZWAgYWZ0ZXIgYGN1cnJlbnRgIGJ5IHVwZGF0aW5nIGBuZXdOb2RlLnByZXZpb3VzYCBhbmRcclxuICAgICAqIGBjdXJyZW50Lm5leHRgLlxyXG4gICAgICovXHJcbiAgICBuZXdOb2RlLnByZXZpb3VzID0gY3VycmVudFxyXG4gICAgY3VycmVudCEubmV4dCA9IG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBub2RlIHdob3NlIGRhdGFcclxuICAgKiAgICAgIHNob3VsZCBiZSByZXR1cm5lZC5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGRhdGEgaW4gdGhlIFwiZGF0YVwiIHBvcnRpb24gb2YgdGhlIGdpdmVuIG5vZGVcclxuICAgKiAgICAgIG9yIHVuZGVmaW5lZCBpZiB0aGUgbm9kZSBkb2Vzbid0IGV4aXN0LlxyXG4gICAqL1xyXG4gIGdldCAoaW5kZXg6IG51bWJlciwgYXNOb2RlOiBib29sZWFuKTogVCB8IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHtcclxuICAgIC8vIGVuc3VyZSBgaW5kZXhgIGlzIGEgcG9zaXRpdmUgdmFsdWVcclxuICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGkgPSAwXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcywgYnV0IG1ha2Ugc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55XHJcbiAgICAgICAqIG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGUgdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpblxyXG4gICAgICAgKiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW4gYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zXHJcbiAgICAgICAqIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0byBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgbWlnaHQgYmUgbnVsbCBpZiB3ZSd2ZSBnb25lIHBhc3QgdGhlXHJcbiAgICAgICAqIGVuZCBvZiB0aGUgbGlzdC4gSW4gdGhhdCBjYXNlLCB3ZSByZXR1cm4gYHVuZGVmaW5lZGAgdG8gaW5kaWNhdGVcclxuICAgICAgICogdGhhdCB0aGUgbm9kZSBhdCBgaW5kZXhgIHdhcyBub3QgZm91bmQuIElmIGBjdXJyZW50YCBpcyBub3RcclxuICAgICAgICogYG51bGxgLCB0aGVuIGl0J3Mgc2FmZSB0byByZXR1cm4gYGN1cnJlbnQuZGF0YWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgIGlmIChhc05vZGUpIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGluZGV4ICR7aW5kZXh9IG91dCBvZiByYW5nZWApXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbmRleCAke2luZGV4fSBvdXQgb2YgcmFuZ2VgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBpbmRleCBvZiB0aGUgZGF0YSBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gc2VhcmNoIGZvci5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBkYXRhIGluIHRoZSBsaXN0XHJcbiAgICogICAgICBvciAtMSBpZiBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgaW5kZXhPZiAoZGF0YTogVCk6IG51bWJlciB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMgYGRhdGFgLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyBgaW5kZXhgIGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoY3VycmVudC5kYXRhID09PSBkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8ga2VlcCB0cmFjayBvZiB3aGVyZSB3ZSBhcmVcclxuICAgICAgaW5kZXgrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIC0xIGFzIHRoZSBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gLTFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWF0Y2hlciBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIHdoZW4gYW4gaXRlbSBtYXRjaGVzXHJcbiAgICogICAgICBhbmQgZmFsc2Ugd2hlbiBhbiBpdGVtIGRvZXNuJ3QgbWF0Y2guXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBmaXJzdCBpdGVtIHRoYXQgcmV0dXJucyB0cnVlIGZyb20gdGhlIG1hdGNoZXIsIHVuZGVmaW5lZFxyXG4gICAqICAgICAgaWYgbm8gaXRlbXMgbWF0Y2guXHJcbiAgICovXHJcbiAgZmluZCAobWF0Y2hlcjogKGFyZzA6IFQpID0+IGJvb2xlYW4sIGFzTm9kZSA9IGZhbHNlKSA6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgVCB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgZGF0YSBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIGlmIChhc05vZGUpIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gYHVuZGVmaW5lZGAgYXMgdGhlXHJcbiAgICAgKiBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignTm8gbWF0Y2hpbmcgZGF0YSBmb3VuZCcpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXRjaGVyIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgd2hlbiBhbiBpdGVtIG1hdGNoZXNcclxuICAgKiAgICAgIGFuZCBmYWxzZSB3aGVuIGFuIGl0ZW0gZG9lc24ndCBtYXRjaC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb25cclxuICAgKiAgICAgIG9yIC0xIGlmIHRoZXJlIGFyZSBubyBtYXRjaGluZyBpdGVtcy5cclxuICAgKi9cclxuICBmaW5kSW5kZXggKG1hdGNoZXI6IChhcmcwOiBUKSA9PiBib29sZWFuKTogbnVtYmVyIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIHRoZSBpbmRleCBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hlcmUgd2UgYXJlXHJcbiAgICAgIGluZGV4KytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiAtMSBhcyB0aGVcclxuICAgICAqIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiAtMVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB0aGUgbm9kZSBmcm9tIHRoZSBnaXZlbiBsb2NhdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG5vZGUgdG8gcmVtb3ZlLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgaW5kZXggaXMgb3V0IG9mIHJhbmdlLlxyXG4gICAqL1xyXG4gIHJlbW92ZSAoaW5kZXg6IG51bWJlcikgOiBUIHtcclxuICAgIC8vIHNwZWNpYWwgY2FzZXM6IG5vIG5vZGVzIGluIHRoZSBsaXN0IG9yIGBpbmRleGAgaXMgbmVnYXRpdmVcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwgfHwgaW5kZXggPCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogcmVtb3ZpbmcgdGhlIGZpcnN0IG5vZGVcclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvLyBzdG9yZSB0aGUgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGhlYWRcclxuICAgICAgY29uc3QgZGF0YTogVCA9IHRoaXMuaGVhZC5kYXRhXHJcblxyXG4gICAgICAvLyBqdXN0IHJlcGxhY2UgdGhlIGhlYWQgd2l0aCB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXh0XHJcblxyXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHRoZXJlIHdhcyBvbmx5IG9uZSBub2RlLCBzbyBhbHNvIHJlc2V0IGB0aGlzLnRhaWxgXHJcbiAgICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbnVsbFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdGhlIGRhdGEgYXQgdGhlIHByZXZpb3VzIGhlYWQgb2YgdGhlIGxpc3RcclxuICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGdldCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGVcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8gaW5jcmVtZW50IHRoZSBjb3VudFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgYGN1cnJlbnRgIGlzbid0IGBudWxsYCwgdGhlbiB0aGF0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBub2RlXHJcbiAgICAgKiB0byByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIHNraXAgb3ZlciB0aGUgbm9kZSB0byByZW1vdmVcclxuICAgICAgY3VycmVudCEucHJldmlvdXMhLm5leHQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIElmIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSBgdGhpcy50YWlsYC5cclxuICAgICAgICpcclxuICAgICAgICogSWYgd2UgYXJlIG5vdCBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSB0aGUgYmFja3dhcmRzXHJcbiAgICAgICAqIHBvaW50ZXIgZm9yIGBjdXJyZW50Lm5leHRgIHRvIHByZXNlcnZlIHJldmVyc2UgdHJhdmVyc2FsLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICAgIHRoaXMudGFpbCA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHRoZSB2YWx1ZSB0aGF0IHdhcyBqdXN0IHJlbW92ZWQgZnJvbSB0aGUgbGlzdFxyXG4gICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIHdlJ3ZlIG1hZGUgaXQgdGhpcyBmYXIsIGl0IG1lYW5zIGBpbmRleGAgaXMgYSB2YWx1ZSB0aGF0XHJcbiAgICAgKiBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LCBzbyB0aHJvdyBhbiBlcnJvci5cclxuICAgICAqL1xyXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFsbCBub2RlcyBmcm9tIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqL1xyXG4gIGNsZWFyICgpOiB2b2lkIHtcclxuICAgIC8vIGp1c3QgcmVzZXQgYm90aCB0aGUgaGVhZCBhbmQgdGFpbCBwb2ludGVyIHRvIG51bGxcclxuICAgIHRoaXMuaGVhZCA9IG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBub2RlcyBpbiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIG5vZGVzIGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGdldCBzaXplICgpOiBudW1iZXIge1xyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiB0aGUgbGlzdCBpcyBlbXB0eVxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gMFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGNvdW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZVxyXG4gICAgICogYmVlbiB2aXNpdGVkIGluc2lkZSB0aGUgbG9vcCBiZWxvdy4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzXHJcbiAgICAgKiBpcyB0aGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBjb3VudCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhhdCBtZWFucyB3ZSdyZSBub3QgeWV0IGF0IHRoZVxyXG4gICAgICogZW5kIG9mIHRoZSBsaXN0LCBzbyBhZGRpbmcgMSB0byBgY291bnRgIGFuZCB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBjb3VudCsrXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogV2hlbiBgY3VycmVudGAgaXMgYG51bGxgLCB0aGUgbG9vcCBpcyBleGl0ZWQgYXQgdGhlIHZhbHVlIG9mIGBjb3VudGBcclxuICAgICAqIGlzIHRoZSBudW1iZXIgb2Ygbm9kZXMgdGhhdCB3ZXJlIGNvdW50ZWQgaW4gdGhlIGxvb3AuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiBjb3VudFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRlZmF1bHQgaXRlcmF0b3IgZm9yIHRoZSBjbGFzcy5cclxuICAgKiBAcmV0dXJucyB7SXRlcmF0b3J9IEFuIGl0ZXJhdG9yIGZvciB0aGUgY2xhc3MuXHJcbiAgICovXHJcbiAgW1N5bWJvbC5pdGVyYXRvcl0gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpdGVyYXRvciB0aGF0IHJldHVybnMgZWFjaCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtHZW5lcmF0b3J9IEFuIGl0ZXJhdG9yIG9uIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gICogdmFsdWVzICgpOiBHZW5lcmF0b3I8VCwgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGVyZSBpcyBhIHBpZWNlIG9mIGRhdGFcclxuICAgICAqIHRvIHlpZWxkLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICB5aWVsZCBjdXJyZW50LmRhdGFcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuIGl0ZXJhdG9yIHRoYXQgcmV0dXJucyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgaW4gcmV2ZXJzZSBvcmRlci5cclxuICAgKiBAcmV0dXJucyB7R2VuZXJhdG9yfSBBbiBpdGVyYXRvciBvbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICAqIHJldmVyc2UgKCk6IEdlbmVyYXRvcjxULCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIHRhaWwgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy50YWlsXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoZXJlIGlzIGEgcGllY2Ugb2YgZGF0YVxyXG4gICAgICogdG8geWllbGQuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIHlpZWxkIGN1cnJlbnQuZGF0YVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhlIGxpc3QgaW50byBhIHN0cmluZyByZXByZXNlbnRhdGlvbi5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGlzdC5cclxuICAgKi9cclxuICB0b1N0cmluZyAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBbLi4udGhpc10udG9TdHJpbmcoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhlIGRvdWJseSBsaW5rZWQgbGlzdCB0byBhbiBhcnJheS5cclxuICAgKiBAcmV0dXJucyB7QXJyYXk8VD59IEFuIGFycmF5IG9mIHRoZSBkYXRhIGZyb20gdGhlIGxpbmtlZCBsaXN0LlxyXG4gICAqL1xyXG4gIHRvQXJyYXkgKCk6IEFycmF5PFQ+IHtcclxuICAgIHJldHVybiBbLi4udGhpc11cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERvdWJseUxpbmtlZExpc3RcclxuZXhwb3J0IGZ1bmN0aW9uXHJcbmFycmF5VG9Eb3VibHlMaW5rZWRMaXN0IDxUPiAoYXJyOiBBcnJheTxUPikge1xyXG4gIGNvbnN0IGxpc3QgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUPigpXHJcbiAgYXJyLmZvckVhY2goKGRhdGEpID0+IHtcclxuICAgIGxpc3QuYWRkKGRhdGEpXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIGxpc3RcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBwcm9taXNlSGFuZGxlcixcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIGh0bWxUb0VsLFxyXG4gIHNodWZmbGVcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0LCBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgUGxheWFibGVFdmVudEFyZyBmcm9tICcuL3B1YnN1Yi9ldmVudC1hcmdzL3RyYWNrLXBsYXktYXJncydcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL3B1YnN1Yi9hZ2dyZWdhdG9yJ1xyXG5pbXBvcnQgeyBJUGxheWFibGUgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQgZnJvbSAnLi9zcG90aWZ5LXBsYXliYWNrLWVsZW1lbnQnXHJcblxyXG4vKipcclxuICogTG9hZCB0aGUgdm9sdW1lIGZyb20gdGhlIHJlZGlzIHNlc3Npb24uXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSB2YWx1ZSBzdG9yZWQgZm9yIHZvbHVtZSAwLTEuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBsb2FkVm9sdW1lICgpIDogUHJvbWlzZTxzdHJpbmc+IHtcclxuICBjb25zdCB7IHJlcywgZXJyIH0gPSBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0UGxheWVyVm9sdW1lRGF0YSkpXHJcblxyXG4gIGlmIChlcnIpIHtcclxuICAgIHJldHVybiAnMCdcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIHJlcyEuZGF0YVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgdGhlIHZvbHVtZSB0byB0aGUgcmVkaXMgc2Vzc2lvbi5cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVWb2x1bWUgKHZvbHVtZTogc3RyaW5nKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXllclZvbHVtZURhdGEodm9sdW1lKSkpXHJcbn1cclxuZXhwb3J0IGNvbnN0IHBsYXllclB1YmxpY1ZhcnMgPSB7XHJcbiAgaXNTaHVmZmxlOiBmYWxzZSxcclxuICBpc0xvb3A6IGZhbHNlXHJcbn1cclxuY2xhc3MgU3BvdGlmeVBsYXliYWNrIHtcclxuICBwcml2YXRlIHBsYXllcjogYW55XHJcbiAgLy8gY29udHJvbHMgdGltaW5nIG9mIGFzeW5jIGFjdGlvbnMgd2hlbiB3b3JraW5nIHdpdGggd2VicGxheWVyIHNka1xyXG4gIHByaXZhdGUgaXNFeGVjdXRpbmdBY3Rpb246IGJvb2xlYW5cclxuICBwcml2YXRlIGRldmljZV9pZDogc3RyaW5nXHJcbiAgcHVibGljIHNlbFBsYXlpbmc6IHtcclxuICAgIGVsZW1lbnQ6IG51bGwgfCBFbGVtZW50XHJcbiAgICB0cmFja191cmk6IHN0cmluZ1xyXG4gICAgLy8gdGhpcyBub2RlIG1heSBiZSBhIHNodWZmbGVkIG9yIHVuc2h1ZmZsZWQgbm9kZVxyXG4gICAgcGxheWFibGVOb2RlOiBudWxsIHwgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgLy8gdGhpcyBhcnJheSBpcyBhbHdheXMgaW4gc3RhbmRhcmQgb3JkZXIgYW5kIG5ldmVyIHNodWZmbGVkLlxyXG4gICAgcGxheWFibGVBcnI6IG51bGwgfCBBcnJheTxJUGxheWFibGU+XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFN0YXRlSW50ZXJ2YWw6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbFxyXG4gIHByaXZhdGUgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnRcclxuICBwcml2YXRlIHBsYXllcklzUmVhZHk6IGJvb2xlYW5cclxuICBwcml2YXRlIHdhc0luU2h1ZmZsZSA9IGZhbHNlXHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgdGhpcy5wbGF5ZXIgPSBudWxsXHJcbiAgICB0aGlzLmRldmljZV9pZCA9ICcnXHJcbiAgICB0aGlzLmdldFN0YXRlSW50ZXJ2YWwgPSBudWxsXHJcblxyXG4gICAgdGhpcy5zZWxQbGF5aW5nID0ge1xyXG4gICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICB0cmFja191cmk6ICcnLFxyXG4gICAgICBwbGF5YWJsZU5vZGU6IG51bGwsXHJcbiAgICAgIHBsYXlhYmxlQXJyOiBudWxsXHJcbiAgICB9XHJcbiAgICB0aGlzLnBsYXllcklzUmVhZHkgPSBmYWxzZVxyXG5cclxuICAgIC8vIHJlbG9hZCBwbGF5ZXIgZXZlcnkgMzAgbWluIHRvIGF2b2lkIHRpbWVvdXQnc1xyXG4gICAgdGhpcy5fbG9hZFdlYlBsYXllcigpXHJcblxyXG4gICAgLy8gcGFzcyBpdCB0aGUgXCJ0aGlzLlwiIGF0dHJpYnV0ZXMgaW4gdGhpcyBzY29wZSBiZWNhdXNlIHdoZW4gYSBmdW5jdGlvbiBpcyBjYWxsZWQgZnJvbSBhIGRpZmZlcmVudCBjbGFzcyB0aGUgXCJ0aGlzLlwiIGF0dHJpYnV0ZXMgYXJlIHVuZGVmaW5lZC5cclxuICAgIHRoaXMud2ViUGxheWVyRWwgPSBuZXcgU3BvdGlmeVBsYXliYWNrRWxlbWVudCgpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldFZvbHVtZSAocGVyY2VudGFnZTogbnVtYmVyLCBwbGF5ZXI6IGFueSwgc2F2ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICBjb25zdCBuZXdWb2x1bWUgPSBwZXJjZW50YWdlIC8gMTAwXHJcbiAgICBwbGF5ZXIuc2V0Vm9sdW1lKG5ld1ZvbHVtZSlcclxuXHJcbiAgICBpZiAoc2F2ZSkge1xyXG4gICAgICBzYXZlVm9sdW1lKG5ld1ZvbHVtZS50b1N0cmluZygpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSB0aW1lIHNob3duIHdoZW4gc2Vla2luZy5cclxuICAgKiBAcGFyYW0gcGVyY2VudGFnZSBUaGUgcGVyY2VudCB0aGF0IHRoZSBiYXIgaGFzIGZpbGxlZCB3aXRoIHJlc3BlY3QgdG8gdGhlIGVudGlyZSBiYXJcclxuICAgKiBAcGFyYW0gd2ViUGxheWVyRWwgVGhlIHdlYnBsYXllciBlbGVtZW50IHRoYXQgZ2l2ZXMgdXMgYWNjZXNzIHRvIHRoZSBzb25nIHByb2dyZXNzIGJhclxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25TZWVraW5nIChwZXJjZW50YWdlOiBudW1iZXIsIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50KSB7XHJcbiAgICAvLyBnZXQgdGhlIHBvc2l0aW9uIGJ5IHVzaW5nIHRoZSBwZXJjZW50IHRoZSBwcm9ncmVzcyBiYXIuXHJcbiAgICBjb25zdCBzZWVrUG9zaXRpb24gPSB3ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLm1heCAqIChwZXJjZW50YWdlIC8gMTAwKVxyXG4gICAgaWYgKHdlYlBsYXllckVsLmN1cnJUaW1lID09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHRpbWUgZWxlbWVudCBpcyBudWxsJylcclxuICAgIH1cclxuICAgIC8vIHVwZGF0ZSB0aGUgdGV4dCBjb250ZW50IHRvIHNob3cgdGhlIHRpbWUgdGhlIHVzZXIgd2lsbCBiZSBzZWVraW5nIHRvbyBvbm1vdXNldXAuXHJcbiAgICB3ZWJQbGF5ZXJFbC5jdXJyVGltZS50ZXh0Q29udGVudCA9IG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMoc2Vla1Bvc2l0aW9uKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIHNlZWtpbmcgYWN0aW9uIGJlZ2luc1xyXG4gICAqIEBwYXJhbSBwbGF5ZXIgVGhlIHNwb3RpZnkgc2RrIHBsYXllciB3aG9zZSBzdGF0ZSB3ZSB3aWxsIHVzZSB0byBjaGFuZ2UgdGhlIHNvbmcncyBwcm9ncmVzcyBiYXIncyBtYXggdmFsdWUgdG8gdGhlIGR1cmF0aW9uIG9mIHRoZSBzb25nLlxyXG4gICAqIEBwYXJhbSB3ZWJQbGF5ZXJFbCBUaGUgd2ViIHBsYXllciBlbGVtZW50IHRoYXQgd2lsbCBhbGxvdyB1cyB0byBtb2RpZnkgdGhlIHByb2dyZXNzIGJhcnMgbWF4IGF0dHJpYnV0ZS5cclxuICAgKi9cclxuICBwcml2YXRlIG9uU2Vla1N0YXJ0IChwbGF5ZXI6IGFueSwgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQpIHtcclxuICAgIHBsYXllci5nZXRDdXJyZW50U3RhdGUoKS50aGVuKChzdGF0ZTogeyBkdXJhdGlvbjogYW55IH0pID0+IHtcclxuICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAnVXNlciBpcyBub3QgcGxheWluZyBtdXNpYyB0aHJvdWdoIHRoZSBXZWIgUGxheWJhY2sgU0RLJ1xyXG4gICAgICAgIClcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICAvLyB3aGVuIGZpcnN0IHNlZWtpbmcsIHVwZGF0ZSB0aGUgbWF4IGF0dHJpYnV0ZSB3aXRoIHRoZSBkdXJhdGlvbiBvZiB0aGUgc29uZyBmb3IgdXNlIHdoZW4gc2Vla2luZy5cclxuICAgICAgd2ViUGxheWVyRWwuc29uZ1Byb2dyZXNzIS5tYXggPSBzdGF0ZS5kdXJhdGlvblxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRvIHJ1biB3aGVuIHlvdSB3aXNoIHRvIHNlZWsgdG8gYSBjZXJ0YWluIHBvc2l0aW9uIGluIGEgc29uZy5cclxuICAgKiBAcGFyYW0gcGVyY2VudGFnZSBUaGUgcGVyY2VudCB0aGF0IHRoZSBiYXIgaGFzIGZpbGxlZCB3aXRoIHJlc3BlY3QgdG8gdGhlIGVudGlyZSBiYXJcclxuICAgKiBAcGFyYW0gcGxheWVyIHRoZSBzcG90aWZ5IHNkayBwbGF5ZXIgdGhhdCB3aWxsIHNlZWsgdGhlIHNvbmcgdG8gYSBnaXZlbiBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB3ZWJQbGF5ZXJFbCB0aGUgd2ViIHBsYXllciBlbGVtZW50IHRoYXQgZ2l2ZXMgdXMgYWNjZXNzIHRvIHRoZSBzb25nIHByb2dyZXNzIGJhci5cclxuICAgKi9cclxuICBwcml2YXRlIHNlZWtTb25nIChwZXJjZW50YWdlOiBudW1iZXIsIHBsYXllcjogYW55LCB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudCkge1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSB0cnVlXHJcbiAgICAgIC8vIG9idGFpbiB0aGUgZmluYWwgcG9zaXRpb24gdGhlIHVzZXIgd2lzaGVzIHRvIHNlZWsgb25jZSBtb3VzZSBpcyB1cC5cclxuICAgICAgY29uc3QgcG9zaXRpb24gPSAocGVyY2VudGFnZSAvIDEwMCkgKiB3ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLm1heFxyXG5cclxuICAgICAgLy8gc2VlayB0byB0aGUgY2hvc2VuIHBvc2l0aW9uLlxyXG4gICAgICBwbGF5ZXIuc2Vlayhwb3NpdGlvbikudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIF9sb2FkV2ViUGxheWVyICgpIHtcclxuICAgIC8vIGxvYWQgdGhlIHVzZXJzIHNhdmVkIHZvbHVtZSBpZiB0aGVyZSBpc250IHRoZW4gbG9hZCAwLjQgYXMgZGVmYXVsdC5cclxuICAgIGNvbnN0IHZvbHVtZSA9IGF3YWl0IGxvYWRWb2x1bWUoKVxyXG5cclxuICAgIGNvbnN0IE5PX0NPTlRFTlQgPSAyMDRcclxuICAgIGlmICh3aW5kb3cuU3BvdGlmeSkge1xyXG4gICAgICAvLyBpZiB0aGUgc3BvdGlmeSBzZGsgaXMgYWxyZWFkeSBkZWZpbmVkIHNldCBwbGF5ZXIgd2l0aG91dCBzZXR0aW5nIG9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgbWVhbmluZyB0aGUgd2luZG93OiBXaW5kb3cgaXMgaW4gYSBkaWZmZXJlbnQgc2NvcGVcclxuICAgICAgLy8gdXNlIHdpbmRvdy5TcG90aWZ5LlBsYXllciBhcyBzcG90aWZ5IG5hbWVzcGFjZSBpcyBkZWNsYXJlZCBpbiB0aGUgV2luZG93IGludGVyZmFjZSBhcyBwZXIgRGVmaW5pdGVseVR5cGVkIC0+IHNwb3RpZnktd2ViLXBsYXliYWNrLXNkayAtPiBpbmRleC5kLnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9EZWZpbml0ZWx5VHlwZWQvRGVmaW5pdGVseVR5cGVkL3RyZWUvbWFzdGVyL3R5cGVzL3Nwb3RpZnktd2ViLXBsYXliYWNrLXNka1xyXG4gICAgICB0aGlzLnBsYXllciA9IG5ldyB3aW5kb3cuU3BvdGlmeS5QbGF5ZXIoe1xyXG4gICAgICAgIG5hbWU6ICdTcG90aWZ5IEluZm8gV2ViIFBsYXllcicsXHJcbiAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnZ2V0IGF1dGggdG9rZW4nKVxyXG4gICAgICAgICAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFJlZnJlc2hBY2Nlc3NUb2tlbiksICgpID0+IHtcclxuICAgICAgICAgICAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0QWNjZXNzVG9rZW4gfSksIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gTk9fQ09OVEVOVCB8fCByZXMuZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBnaXZlIHRoZSB0b2tlbiB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZvbHVtZTogcGFyc2VJbnQodm9sdW1lKVxyXG4gICAgICB9KVxyXG4gICAgICB0aGlzLl9hZGRMaXN0ZW5lcnModm9sdW1lKVxyXG4gICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG9mIHNwb3RpZnkgc2RrIGlzIHVuZGVmaW5lZFxyXG4gICAgICB3aW5kb3cub25TcG90aWZ5V2ViUGxheWJhY2tTREtSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAvLyBpZiBnZXR0aW5nIHRva2VuIHdhcyBzdWNjZXNmdWwgY3JlYXRlIHNwb3RpZnkgcGxheWVyIHVzaW5nIHRoZSB3aW5kb3cgaW4gdGhpcyBzY29wZVxyXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXQgYXV0aCB0b2tlbicpXHJcbiAgICAgICAgICAgIHByb21pc2VIYW5kbGVyKGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRSZWZyZXNoQWNjZXNzVG9rZW4pLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0QWNjZXNzVG9rZW4gfSksIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzID09PSBOT19DT05URU5UIHx8IHJlcy5kYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYWNjZXNzIHRva2VuIGhhcyBubyBjb250ZW50JylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAgICBjYihyZXMuZGF0YSlcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZvbHVtZTogcGFyc2VJbnQodm9sdW1lKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5fYWRkTGlzdGVuZXJzKHZvbHVtZSlcclxuICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfYWRkTGlzdGVuZXJzIChsb2FkZWRWb2x1bWU6IHN0cmluZykge1xyXG4gICAgLy8gRXJyb3IgaGFuZGxpbmdcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdpbml0aWFsaXphdGlvbl9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdhdXRoZW50aWNhdGlvbl9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgICBjb25zb2xlLmxvZygncGxheWJhY2sgY291bGRudCBzdGFydCcpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2FjY291bnRfZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcigncGxheWJhY2tfZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gUGxheWJhY2sgc3RhdHVzIHVwZGF0ZXNcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdwbGF5ZXJfc3RhdGVfY2hhbmdlZCcsIChzdGF0ZTogU3BvdGlmeS5QbGF5YmFja1N0YXRlIHwgbnVsbCkgPT4geyB9KVxyXG5cclxuICAgIC8vIFJlYWR5XHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcigncmVhZHknLCAoeyBkZXZpY2VfaWQgfTogeyBkZXZpY2VfaWQ6IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdSZWFkeSB3aXRoIERldmljZSBJRCcsIGRldmljZV9pZClcclxuICAgICAgdGhpcy5kZXZpY2VfaWQgPSBkZXZpY2VfaWRcclxuXHJcbiAgICAgIC8vIGFwcGVuZCB3ZWIgcGxheWVyIGVsZW1lbnQgdG8gRE9NXHJcbiAgICAgIHRoaXMud2ViUGxheWVyRWwuYXBwZW5kV2ViUGxheWVySHRtbChcclxuICAgICAgICAoKSA9PiB0aGlzLnRyeVBsYXlQcmV2KHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUpLFxyXG4gICAgICAgICgpID0+IHRoaXMudHJ5V2ViUGxheWVyUGF1c2UodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKSxcclxuICAgICAgICAoKSA9PiB0aGlzLm9uU2Vla1N0YXJ0KHRoaXMucGxheWVyLCB0aGlzLndlYlBsYXllckVsKSxcclxuICAgICAgICAocGVyY2VudGFnZSkgPT4gdGhpcy5zZWVrU29uZyhwZXJjZW50YWdlLCB0aGlzLnBsYXllciwgdGhpcy53ZWJQbGF5ZXJFbCksXHJcbiAgICAgICAgKHBlcmNlbnRhZ2UpID0+IHRoaXMub25TZWVraW5nKHBlcmNlbnRhZ2UsIHRoaXMud2ViUGxheWVyRWwpLFxyXG4gICAgICAgIChwZXJjZW50YWdlLCBzYXZlKSA9PiB0aGlzLnNldFZvbHVtZShwZXJjZW50YWdlLCB0aGlzLnBsYXllciwgc2F2ZSksXHJcbiAgICAgICAgcGFyc2VGbG9hdChsb2FkZWRWb2x1bWUpXHJcbiAgICAgIClcclxuICAgICAgdGhpcy5wbGF5ZXJJc1JlYWR5ID0gdHJ1ZVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBOb3QgUmVhZHlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdub3RfcmVhZHknLCAoeyBkZXZpY2VfaWQgfTogeyBkZXZpY2VfaWQ6IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdEZXZpY2UgSUQgaGFzIGdvbmUgb2ZmbGluZScsIGRldmljZV9pZClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0RHVyYXRpb24gKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSB0cnVlXHJcbiAgICAgIHRoaXMucGxheWVyLnNlZWsoMCkudGhlbigoKSA9PiB7IHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZSB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZXMgdG8gcGF1c2UgdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZSBmcm9tIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5V2ViUGxheWVyUGF1c2UgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgdGhlIGZpcnN0IG5vZGUgb3IgaWYgYW4gYWN0aW9uIGlzIHByb2Nlc3NpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiAmJiBjdXJyTm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICBjb25zdCBwcmV2VHJhY2sgPSBjdXJyTm9kZS5kYXRhXHJcbiAgICAgIGNvbnNvbGUubG9nKCdUcnkgcGxheWVyIHBhdXNlJylcclxuICAgICAgdGhpcy5zZXRTZWxQbGF5aW5nRWwobmV3IFBsYXlhYmxlRXZlbnRBcmcocHJldlRyYWNrLCBjdXJyTm9kZSwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIHBsYXkgdGhlIHByZXZpb3VzIElQbGF5YWJsZSBnaXZlbiB0aGUgY3VycmVudCBwbGF5aW5nIElQbGF5YWJsZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5UGxheVByZXYgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgaWYgKGN1cnJOb2RlID09PSBudWxsKSB7XHJcbiAgICAgIC8vIChpZiB0aGUgcGxheWVyIGhhcyBqdXN0IGJlZW4gcHV0IGludG8gc2h1ZmZsZSBtb2RlIHRoZW4gdGhlcmUgc2hvdWxkIGJlIG5vIHByZXZpb3VzIHBsYXlhYmxlcyB0byBnbyBiYWNrIHRvbylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBsYXllclB1YmxpY1ZhcnMuaXNMb29wKSB7XHJcbiAgICAgIHRoaXMucmVzZXREdXJhdGlvbigpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nIHdlIGNhbm5vdCBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IHBvc2l0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICAgIGlmIChzdGF0ZS5wb3NpdGlvbiA+IDEwMDApIHtcclxuICAgICAgICAgIHRoaXMucmVzZXREdXJhdGlvbigpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGlmIHRoZSBwbGF5ZXIgSVMgaW4gc2h1ZmZsZSBtb2RlXHJcbiAgICAgICAgICBpZiAocGxheWVyUHVibGljVmFycy5pc1NodWZmbGUgJiYgIXRoaXMud2FzSW5TaHVmZmxlKSB7IHJldHVybiB9XHJcbiAgICAgICAgICBsZXQgcHJldlRyYWNrTm9kZSA9IGN1cnJOb2RlLnByZXZpb3VzXHJcblxyXG4gICAgICAgICAgLy8gaWYgdGhlIHBsYXllciBXQVMgaW4gc2h1ZmZsZSBtb2RlXHJcbiAgICAgICAgICBpZiAoIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlICYmIHRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgICAgICAgIHByZXZUcmFja05vZGUgPSB0aGlzLnVuU2h1ZmZsZSgtMSlcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAocHJldlRyYWNrTm9kZSA9PT0gbnVsbCkgeyByZXR1cm4gfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHByZXZUcmFjayA9IHByZXZUcmFja05vZGUuZGF0YVxyXG4gICAgICAgICAgdGhpcy5zZXRTZWxQbGF5aW5nRWwobmV3IFBsYXlhYmxlRXZlbnRBcmcocHJldlRyYWNrLCBwcmV2VHJhY2tOb2RlLCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIHBsYXkgdGhlIG5leHQgSVBsYXlhYmxlIGdpdmVuIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY3Vyck5vZGUgLSB0aGUgY3VycmVudCBJUGxheWFibGUgbm9kZSB0aGF0IHdhcy9pcyBwbGF5aW5nXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlQbGF5TmV4dCAoY3Vyck5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICBpZiAoY3Vyck5vZGUgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gb25jZSBhIHRyYWNrIGF1dG9tYXRpY2FsbHkgZmluaXNoZXMgd2UgY2Fubm90IHJlc2V0IGl0cyBkdXJhdGlvbiBzbyB3ZSBwbGF5IHRoZSB0cmFjayBhZ2FpbiBpbnN0ZWFkXHJcbiAgICBpZiAocGxheWVyUHVibGljVmFycy5pc0xvb3ApIHtcclxuICAgICAgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucGxheShjdXJyTm9kZS5kYXRhLnVyaSksIG5ldyBQbGF5YWJsZUV2ZW50QXJnKGN1cnJOb2RlLmRhdGEsIGN1cnJOb2RlLCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpLCB0cnVlKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBhbiBhY3Rpb24gaXMgcHJvY2Vzc2luZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIGxldCBuZXh0VHJhY2tOb2RlID0gY3Vyck5vZGUubmV4dFxyXG5cclxuICAgICAgaWYgKCF0aGlzLndhc0luU2h1ZmZsZSAmJiBwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSkge1xyXG4gICAgICAgIC8vIGJ5IGNhbGxpbmcgdGhpcyBiZWZvcmUgYXNzaWduaW5nIHRoZSBuZXh0IG5vZGUsIHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpIG11c3QgcmV0dXJuIGJhY2sgdGhlIG5leHQgbm9kZVxyXG4gICAgICAgIG5leHRUcmFja05vZGUgPSB0aGlzLnNodWZmbGVQbGF5YWJsZXMoKVxyXG5cclxuICAgICAgICAvLyBjYWxsIGFmdGVyIHRvIGVuc3VyZSB0aGF0IHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpIHJ1bnMgdGhlIGlmIHN0YXRlbWVudCB0aGF0IHJldHVybnMgdGhlIG5leHQgbm9kZVxyXG4gICAgICAgIHRoaXMud2FzSW5TaHVmZmxlID0gdHJ1ZVxyXG4gICAgICB9IGVsc2UgaWYgKCFwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSAmJiB0aGlzLndhc0luU2h1ZmZsZSkge1xyXG4gICAgICAgIG5leHRUcmFja05vZGUgPSB0aGlzLnVuU2h1ZmZsZSgxKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiBzaHVmZmxlIGlzIG5vdCBvbmUgYW5kIHRoaXMgbm9kZSBpcyBudWxsLCB0aGVuIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBwbGF5bGlzdCBhbmQgY2Fubm90IHBsYXkgbmV4dC5cclxuICAgICAgaWYgKG5leHRUcmFja05vZGUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zZXRTZWxQbGF5aW5nRWwobmV3IFBsYXlhYmxlRXZlbnRBcmcobmV4dFRyYWNrTm9kZS5kYXRhLCBuZXh0VHJhY2tOb2RlLCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21wbGV0ZWx5RGVzZWxlY3RUcmFjayAoKSB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWxlY3RlZCBwbGF5aW5nIGVsZW1lbnQgd2FzIG51bGwgYmVmb3JlIGRlc2VsZWN0aW9uIG9uIHNvbmcgZmluaXNoJylcclxuICAgIH1cclxuICAgIHRoaXMucGF1c2VEZXNlbGVjdFRyYWNrKClcclxuICAgIHRoaXMuc2VsUGxheWluZy50cmFja191cmkgPSAnJ1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXVzZURlc2VsZWN0VHJhY2sgKCkge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VsZWN0ZWQgcGxheWluZyBlbGVtZW50IHdhcyBudWxsIGJlZm9yZSBkZXNlbGVjdGlvbiBvbiBzb25nIGZpbmlzaCcpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZT8uZGF0YS5vblN0b3BwZWQoKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnBsYXlQYXVzZT8uY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IG51bGxcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2VsZWN0VHJhY2sgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcjogYm9vbGVhbikge1xyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9IGV2ZW50QXJnLnBsYXlhYmxlTm9kZVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyID0gZXZlbnRBcmcucGxheWFibGVBcnJcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMuc2VsUGxheWluZy50cmFja191cmkgPSBldmVudEFyZy5jdXJyUGxheWFibGUudXJpXHJcblxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5wbGF5UGF1c2U/LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5zZXRUaXRsZShldmVudEFyZy5jdXJyUGxheWFibGUudGl0bGUsIGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmkpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNldEltZ1NyYyhldmVudEFyZy5jdXJyUGxheWFibGUuaW1hZ2VVcmwpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNldEFydGlzdHMoZXZlbnRBcmcuY3VyclBsYXlhYmxlLmFydGlzdHNIdG1sKVxyXG5cclxuICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGU/LmRhdGEub25QbGF5aW5nKClcclxuXHJcbiAgICAvLyB3ZSBjYW4gY2FsbCBhZnRlciBhc3NpZ25pbmcgcGxheWFibGUgbm9kZSBhcyBpdCBkb2VzIG5vdCBjaGFuZ2Ugd2hpY2ggbm9kZSBpcyBwbGF5ZWRcclxuICAgIGlmICghcGxheVRocnVXZWJQbGF5ZXIgJiYgcGxheWVyUHVibGljVmFycy5pc1NodWZmbGUpIHtcclxuICAgICAgdGhpcy5zaHVmZmxlUGxheWFibGVzKClcclxuICAgIH0gZWxzZSBpZiAoIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlICYmIHRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSB0aGlzLnVuU2h1ZmZsZSgwKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvblRyYWNrRmluaXNoICgpIHtcclxuICAgIHRoaXMuY29tcGxldGVseURlc2VsZWN0VHJhY2soKVxyXG5cclxuICAgIHRoaXMud2ViUGxheWVyRWwuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSAnMTAwJSdcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsIGFzIE5vZGVKUy5UaW1lb3V0KVxyXG4gICAgdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhbiBpbnRlcnZhbCB0aGF0IG9idGFpbnMgdGhlIHN0YXRlIG9mIHRoZSBwbGF5ZXIgZXZlcnkgc2Vjb25kLlxyXG4gICAqIFNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIGEgc29uZyBpcyBwbGF5aW5nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0R2V0U3RhdGVJbnRlcnZhbCAoKSB7XHJcbiAgICBsZXQgZHVyYXRpb25NaW5TZWMgPSAnJ1xyXG4gICAgaWYgKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbClcclxuICAgIH1cclxuICAgIC8vIHNldCB0aGUgaW50ZXJ2YWwgdG8gcnVuIGV2ZXJ5IHNlY29uZCBhbmQgb2J0YWluIHRoZSBzdGF0ZVxyXG4gICAgdGhpcy5nZXRTdGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICB0aGlzLnBsYXllci5nZXRDdXJyZW50U3RhdGUoKS50aGVuKChzdGF0ZTogeyBwb3NpdGlvbjogYW55OyBkdXJhdGlvbjogYW55IH0pID0+IHtcclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAnVXNlciBpcyBub3QgcGxheWluZyBtdXNpYyB0aHJvdWdoIHRoZSBXZWIgUGxheWJhY2sgU0RLJ1xyXG4gICAgICAgICAgKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHsgcG9zaXRpb24sIGR1cmF0aW9uIH0gPSBzdGF0ZVxyXG5cclxuICAgICAgICAvLyBpZiB0aGVyZSBpc250IGEgZHVyYXRpb24gc2V0IGZvciB0aGlzIHNvbmcgc2V0IGl0LlxyXG4gICAgICAgIGlmIChkdXJhdGlvbk1pblNlYyA9PT0gJycpIHtcclxuICAgICAgICAgIGR1cmF0aW9uTWluU2VjID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhkdXJhdGlvbilcclxuICAgICAgICAgIHRoaXMud2ViUGxheWVyRWwhLmR1cmF0aW9uIS50ZXh0Q29udGVudCA9IGR1cmF0aW9uTWluU2VjXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwZXJjZW50RG9uZSA9IChwb3NpdGlvbiAvIGR1cmF0aW9uKSAqIDEwMFxyXG5cclxuICAgICAgICAvLyB0aGUgcG9zaXRpb24gZ2V0cyBzZXQgdG8gMCB3aGVuIHRoZSBzb25nIGlzIGZpbmlzaGVkXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLm9uVHJhY2tGaW5pc2goKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBpZiB0aGUgcG9zaXRpb24gaXNudCAwIHVwZGF0ZSB0aGUgd2ViIHBsYXllciBlbGVtZW50c1xyXG4gICAgICAgICAgdGhpcy53ZWJQbGF5ZXJFbC51cGRhdGVFbGVtZW50KHBlcmNlbnREb25lLCBwb3NpdGlvbilcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9LCA1MDApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWxlY3QgYSBjZXJ0YWluIHBsYXkvcGF1c2UgZWxlbWVudCBhbmQgcGxheSB0aGUgZ2l2ZW4gdHJhY2sgdXJpXHJcbiAgICogYW5kIHVuc2VsZWN0IHRoZSBwcmV2aW91cyBvbmUgdGhlbiBwYXVzZSB0aGUgcHJldmlvdXMgdHJhY2tfdXJpLlxyXG4gICAqXHJcbiAgICogVGhlIHJlYXNzaWduaW5nIG9mIGVsZW1lbnRzIGlzIGluIHRoZSBjYXNlIHRoYXQgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgdGhyb3VnaCB0aGUgd2ViIHBsYXllciBlbGVtZW50LFxyXG4gICAqIGFzIHRoZXJlIGlzIGEgY2hhbmNlIHRoYXQgdGhlIHNlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCBpcyBlaXRoZXIgbm9uLWV4aXN0ZW50LCBvciBpcyBkaWZmZXJlbnQgdGhlbiB0aGVuXHJcbiAgICogdGhlIHByZXZpb3VzIGkuZS4gcmVyZW5kZXJlZCwgb3IgaGFzIGFuIGVxdWl2YWxlbnQgZWxlbWVudCB3aGVuIG9uIGZvciBleGFtcGxlIGEgZGlmZmVyZW50IHRlcm0gdGFiLlxyXG4gICAqXHJcbiAgICogUmVhc3NpZ25pbmcgaXMgZG9uZSBzbyB0aGF0IHRoZSBwb3RlbnRpYWxseSBkaWZmZXJlbnQgZXF1aXZhbGVudCBlbGVtZW50IGNhbiBhY3QgYXMgdGhlIGluaXRpYWxseVxyXG4gICAqIHNlbGVjdGVkIGVsZW1lbnQsIGluIHNob3dpbmcgcGF1c2UvcGxheSBzeW1ib2xzIGluIGFjY29yZGFuY2UgdG8gd2hldGhlciB0aGVcclxuICAgKiBzb25nIHdhcyBwYXVzZWQvcGxheWVkIHRocm91Z2ggdGhlIHdlYiBwbGF5ZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BsYXlhYmxlRXZlbnRBcmd9IGV2ZW50QXJnIC0gYSBjbGFzcyB0aGF0IGNvbnRhaW5zIHRoZSBjdXJyZW50LCBuZXh0IGFuZCBwcmV2aW91cyB0cmFja3MgdG8gcGxheVxyXG4gICAqL1xyXG4gIHB1YmxpYyBhc3luYyBzZXRTZWxQbGF5aW5nRWwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllciA9IHRydWUpIHtcclxuICAgIC8vIGlmIHRoZSBwbGF5ZXIgaXNuJ3QgcmVhZHkgd2UgY2Fubm90IGNvbnRpbnVlLlxyXG4gICAgaWYgKCF0aGlzLnBsYXllcklzUmVhZHkpIHtcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXllciBpcyBub3QgcmVhZHknKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGlmICh0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuXHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgIT0gbnVsbCkge1xyXG4gICAgICAvLyBzdG9wIHRoZSBwcmV2aW91cyB0cmFjayB0aGF0IHdhcyBwbGF5aW5nXHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGU/LmRhdGEub25TdG9wcGVkKClcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwgYXMgTm9kZUpTLlRpbWVvdXQpXHJcblxyXG4gICAgICAvLyByZWFzc2lnbiB0aGUgZWxlbWVudCBpZiBpdCBleGlzdHMgYXMgaXQgbWF5IGhhdmUgYmVlbiByZXJlbmRlcmVkIGFuZCB0aGVyZWZvcmUgdGhlIHByZXZpb3VzIHZhbHVlIGlzIHBvaW50aW5nIHRvIG5vdGhpbmdcclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5pZCkgPz8gdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnRcclxuXHJcbiAgICAgIC8vIGlmIGl0cyB0aGUgc2FtZSBlbGVtZW50IHRoZW4gcGF1c2VcclxuICAgICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmlkID09PSBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwuaWQpIHtcclxuICAgICAgICB0aGlzLnBhdXNlRGVzZWxlY3RUcmFjaygpXHJcbiAgICAgICAgYXdhaXQgdGhpcy5wYXVzZSgpXHJcbiAgICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGNvbXBsZXRlbHkgZGVzZWxlY3QgdGhlIGN1cnJlbnQgdHJhY2sgYmVmb3JlIHNlbGVjdGluZyBhbm90aGVyIG9uZSB0byBwbGF5XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZWx5RGVzZWxlY3RUcmFjaygpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwcmV2IHRyYWNrIHVyaSBpcyB0aGUgc2FtZSB0aGVuIHJlc3VtZSB0aGUgc29uZyBpbnN0ZWFkIG9mIHJlcGxheWluZyBpdC5cclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID09PSBldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSB7XHJcbiAgICAgIC8vIHRoaXMgc2VsRWwgY291bGQgY29ycm9zcG9uZCB0byB0aGUgc2FtZSBzb25nIGJ1dCBpcyBhbiBlbGVtZW50IHRoYXQgaXMgbm9uLWV4aXN0ZW50LCBzbyByZWFzc2lnbiBpdCB0byBhIGVxdWl2YWxlbnQgZXhpc3RpbmcgZWxlbWVudCBpZiB0aGlzIGlzIHRoZSBjYXNlLlxyXG4gICAgICBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwuaWQpID8/IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbFxyXG5cclxuICAgICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucmVzdW1lKCksIGV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcilcclxuICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCdzdGFydCB0cmFjaycpXHJcbiAgICBhd2FpdCB0aGlzLnN0YXJ0VHJhY2soYXN5bmMgKCkgPT4gdGhpcy5wbGF5KGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmkpLCBldmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIpXHJcbiAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgc3RhcnRUcmFjayAocGxheWluZ0FzeW5jRnVuYzogRnVuY3Rpb24sIGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcjogYm9vbGVhbikge1xyXG4gICAgdGhpcy5zZWxlY3RUcmFjayhldmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIpXHJcblxyXG4gICAgYXdhaXQgcGxheWluZ0FzeW5jRnVuYygpXHJcblxyXG4gICAgLy8gc2V0IHBsYXlpbmcgc3RhdGUgb25jZSBzb25nIHN0YXJ0cyBwbGF5aW5nXHJcbiAgICB0aGlzLnNldEdldFN0YXRlSW50ZXJ2YWwoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2h1ZmZsZXMgdGhlIHBsYXlhYmxlcyBhbmQgZWl0aGVyIHJldHVybnMgdGhlIGN1cnJlbnQgbm9kZSBvciB0aGUgbmV4dCBub2RlIHRoYXQgYm90aCBwb2ludCB0byBhIHNodWZmbGVkIHZlcnNpb24gb2YgdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge0RvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT59IGVpdGhlciB0aGUgbmV4dCBvciBjdXJyZW50IG5vZGUgaW4gdGhlIHNodWZmbGVkIGxpc3QuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzaHVmZmxlUGxheWFibGVzICgpOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIgPT0gbnVsbCB8fCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlID09IG51bGwpIHRocm93IG5ldyBFcnJvcignbm8gc2VsIHBsYXlpbmcnKVxyXG4gICAgY29uc29sZS5sb2coJ3NodWZmbGUnKVxyXG4gICAgY29uc3Qgc2VsUGxheWFibGUgPSB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlLmRhdGFcclxuXHJcbiAgICAvLyBzaHVmZmxlIGFycmF5XHJcbiAgICBjb25zdCB0cmFja0FyciA9IHNodWZmbGUodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKVxyXG5cclxuICAgIC8vIHJlbW92ZSB0aGlzIHRyYWNrIGZyb20gdGhlIGFycmF5XHJcbiAgICBjb25zdCBpbmRleCA9IHRyYWNrQXJyLmluZGV4T2Yoc2VsUGxheWFibGUpXHJcbiAgICB0cmFja0Fyci5zcGxpY2UoaW5kZXgsIDEpXHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgYSBkb3VibHkgbGlua2VkIGxpc3RcclxuICAgIGNvbnN0IHNodWZmbGVkTGlzdCA9IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0KHRyYWNrQXJyKVxyXG5cclxuICAgIC8vIHBsYWNlIHRoaXMgdHJhY2sgYXQgdGhlIGZyb250IG9mIHRoZSBsaXN0XHJcbiAgICBzaHVmZmxlZExpc3QuaW5zZXJ0QmVmb3JlKHNlbFBsYXlhYmxlLCAwKVxyXG5cclxuICAgIGxldCBuZXdOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICBpZiAoIXRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbmV4dCBub2RlIGFzIHRoaXMgc2hvdWxkIHJ1biBiZWZvcmUgdGhlIG5leHQgbm9kZSBpcyBjaG9zZW4uXHJcbiAgICAgIG5ld05vZGUgPSBzaHVmZmxlZExpc3QuZ2V0KDEsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbmV3IG5vZGUgd2hpY2ggaGFzIGlkZW50aWNhbCBkYXRhIGFzIHRoZSBvbGQgb25lLCBidXQgaXMgbm93IHBhcnQgb2YgdGhlIHNodWZmbGVkIGRvdWJseSBsaW5rZWQgbGlzdFxyXG4gICAgICBuZXdOb2RlID0gc2h1ZmZsZWRMaXN0LmdldCgwLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSBuZXdOb2RlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW5zaHVmZmxlcyB0aGUgcGxheWFibGVzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXIgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSBpbmRleCB0byBhZGQgb3IgcmVtb3ZlIGZyb20gdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IHBsYXlpbmcgbm9kZS4gKDE6IGdldHNOZXh0LCAtMTogZ2V0c1ByZXYsIDA6IGdldHNDdXJyZW50KVxyXG4gICAqIEByZXR1cm5zIHtEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+fSB0aGUgbm9kZSB0aGF0IHBvaW50cyB0byB0aGUgdW5zaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBsaXN0LiBFaXRoZXIgdGhlIHByZXZpb3VzLCBjdXJyZW50LCBvciBuZXh0IG5vZGUgZnJvbSB0aGUgY3VycmVudCBwbGF5YWJsZS5cclxuICAgKi9cclxuICBwcml2YXRlIHVuU2h1ZmZsZSAoZGlyOiBudW1iZXIpOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyID09IG51bGwgfHwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ25vIHNlbCBwbGF5aW5nJylcclxuICAgIGNvbnN0IHNlbFBsYXlhYmxlID0gdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZS5kYXRhXHJcblxyXG4gICAgY29uc29sZS5sb2coJ3Vuc2h1ZmZsZScpXHJcbiAgICB0aGlzLndhc0luU2h1ZmZsZSA9IGZhbHNlXHJcbiAgICAvLyBvYnRhaW4gYW4gdW5zaHVmZmxlZCBsaW5rZWQgbGlzdFxyXG4gICAgY29uc3QgcGxheWFibGVMaXN0ID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKVxyXG5cclxuICAgIGNvbnN0IG5ld05vZGVJZHggPSBwbGF5YWJsZUxpc3QuZmluZEluZGV4KChwbGF5YWJsZSkgPT4gcGxheWFibGUuc2VsRWwuaWQgPT09IHNlbFBsYXlhYmxlLnNlbEVsLmlkKVxyXG5cclxuICAgIGxldCBuZXdOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCA9IG51bGxcclxuICAgIGlmIChwbGF5YWJsZUxpc3Quc2l6ZSA+IG5ld05vZGVJZHggKyBkaXIgJiYgbmV3Tm9kZUlkeCArIGRpciA+PSAwKSB7XHJcbiAgICAgIG5ld05vZGUgPSBwbGF5YWJsZUxpc3QuZ2V0KG5ld05vZGVJZHggKyBkaXIsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIH1cclxuICAgIHJldHVybiBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQbGF5cyBhIHRyYWNrIHRocm91Z2ggdGhpcyBkZXZpY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhY2tfdXJpIC0gdGhlIHRyYWNrIHVyaSB0byBwbGF5XHJcbiAgICogQHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHRyYWNrIGhhcyBiZWVuIHBsYXllZCBzdWNjZXNmdWxseS5cclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHBsYXkgKHRyYWNrX3VyaTogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXlUcmFjayh0aGlzLmRldmljZV9pZCwgdHJhY2tfdXJpKSlcclxuICAgIClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVzdW1lICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnJlc3VtZSgpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHBhdXNlICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnBhdXNlKClcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHNwb3RpZnlQbGF5YmFjayA9IG5ldyBTcG90aWZ5UGxheWJhY2soKVxyXG5cclxuaWYgKCh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgPT09IHVuZGVmaW5lZCkge1xyXG4gIC8vIGNyZWF0ZSBhIGdsb2JhbCB2YXJpYWJsZSB0byBiZSB1c2VkXHJcbiAgKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciA9IG5ldyBFdmVudEFnZ3JlZ2F0b3IoKVxyXG59XHJcbmNvbnN0IGV2ZW50QWdncmVnYXRvciA9ICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgYXMgRXZlbnRBZ2dyZWdhdG9yXHJcblxyXG4vLyBzdWJzY3JpYmUgdGhlIHNldFBsYXlpbmcgZWxlbWVudCBldmVudFxyXG5ldmVudEFnZ3JlZ2F0b3Iuc3Vic2NyaWJlKFBsYXlhYmxlRXZlbnRBcmcubmFtZSwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSA9PlxyXG4gIHNwb3RpZnlQbGF5YmFjay5zZXRTZWxQbGF5aW5nRWwoZXZlbnRBcmcsIGZhbHNlKVxyXG4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTYW1lUGxheWluZ1VSSVdpdGhFbCAodXJpOiBzdHJpbmcpIHtcclxuICByZXR1cm4gKFxyXG4gICAgdXJpID09PSBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy50cmFja191cmkgJiZcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLmVsZW1lbnQgIT0gbnVsbFxyXG4gIClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU2FtZVBsYXlpbmdVUkkgKHVyaTogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHVyaSA9PT0gc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcudHJhY2tfdXJpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyICh1cmk6IHN0cmluZywgc2VsRWw6IEVsZW1lbnQsIHRyYWNrRGF0YU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICBpZiAoaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh1cmkpKSB7XHJcbiAgICAvLyBUaGlzIGVsZW1lbnQgd2FzIHBsYXlpbmcgYmVmb3JlIHJlcmVuZGVyaW5nIHNvIHNldCBpdCB0byBiZSB0aGUgY3VycmVudGx5IHBsYXlpbmcgb25lIGFnYWluXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ID0gc2VsRWxcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9IHRyYWNrRGF0YU5vZGVcclxuICB9XHJcbn1cclxuXHJcbi8vIGFwcGVuZCBhbiBpbnZpc2libGUgZWxlbWVudCB0aGVuIGRlc3Ryb3kgaXQgYXMgYSB3YXkgdG8gbG9hZCB0aGUgcGxheSBhbmQgcGF1c2UgaW1hZ2VzIGZyb20gZXhwcmVzcy5cclxuY29uc3QgcHJlbG9hZFBsYXlQYXVzZUltZ3NIdG1sID0gYDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lXCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5SWNvbn1cIi8+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wYXVzZUljb259XCIvPjwvZGl2PmBcclxuY29uc3QgcHJlbG9hZFBsYXlQYXVzZUltZ3NFbCA9IGh0bWxUb0VsKHByZWxvYWRQbGF5UGF1c2VJbWdzSHRtbCkgYXMgTm9kZVxyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHByZWxvYWRQbGF5UGF1c2VJbWdzRWwpXHJcbmRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocHJlbG9hZFBsYXlQYXVzZUltZ3NFbClcclxuIiwiaW1wb3J0IFN1YnNjcmlwdGlvbiBmcm9tICcuL3N1YnNjcmlwdGlvbidcclxuXHJcbi8qKiBMZXRzIHNheSB5b3UgaGF2ZSB0d28gZG9vcnMgdGhhdCB3aWxsIG9wZW4gdGhyb3VnaCB0aGUgcHViIHN1YiBzeXN0ZW0uIFdoYXQgd2lsbCBoYXBwZW4gaXMgdGhhdCB3ZSB3aWxsIHN1YnNjcmliZSBvbmVcclxuICogb24gZG9vciBvcGVuIGV2ZW50LiBXZSB3aWxsIHRoZW4gaGF2ZSB0d28gcHVibGlzaGVycyB0aGF0IHdpbGwgZWFjaCBwcm9wYWdhdGUgYSBkaWZmZXJlbnQgZG9vciB0aHJvdWdoIHRoZSBhZ2dyZWdhdG9yIGF0IGRpZmZlcmVudCBwb2ludHMuXHJcbiAqIFRoZSBhZ2dyZWdhdG9yIHdpbGwgdGhlbiBleGVjdXRlIHRoZSBvbiBkb29yIG9wZW4gc3Vic2NyaWJlciBhbmQgcGFzcyBpbiB0aGUgZG9vciBnaXZlbiBieSBlaXRoZXIgcHVibGlzaGVyLlxyXG4gKi9cclxuXHJcbi8qKiBNYW5hZ2VzIHN1YnNjcmliaW5nIGFuZCBwdWJsaXNoaW5nIG9mIGV2ZW50cy5cclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiBBbiBhcmdUeXBlIGlzIG9idGFpbmVkIGJ5IHRha2luZyB0aGUgJ0NsYXNzSW5zdGFuY2UnLmNvbnRydWN0b3IubmFtZSBvciAnQ2xhc3MnLm5hbWUuXHJcbiAqIFN1YnNjcmlwdGlvbnMgYXJlIGdyb3VwZWQgdG9nZXRoZXIgYnkgYXJnVHlwZSBhbmQgdGhlaXIgZXZ0IHRha2VzIGFuIGFyZ3VtZW50IHRoYXQgaXMgYVxyXG4gKiBjbGFzcyB3aXRoIHRoZSBjb25zdHJ1Y3Rvci5uYW1lIG9mIGFyZ1R5cGUuXHJcbiAqXHJcbiAqL1xyXG5jbGFzcyBFdmVudEFnZ3JlZ2F0b3Ige1xyXG4gIHN1YnNjcmliZXJzOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PFN1YnNjcmlwdGlvbj4gfVxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIC8vIGtleSAtIHR5cGUsIHZhbHVlIC0gW10gb2YgZnVuY3Rpb25zIHRoYXQgdGFrZSBhIGNlcnRhaW4gdmFsdWUgZGVwZW5kaW5nIG9uIHRoZSB0eXBlXHJcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge31cclxuICB9XHJcblxyXG4gIC8qKiBTdWJzY3JpYmVzIGEgdHlwZSBvZiBldmVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhcmdUeXBlIC0gdGhlIHR5cGUgdGhhdCB0aGlzIHN1YnNjcmliZXIgYmVsb25ncyB0b28uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXZlbnQgLSB0aGUgZXZlbnQgdGhhdCB0YWtlcyB0aGUgc2FtZSBhcmdzIGFzIGFsbCBvdGhlciBldmVudHMgb2YgdGhlIGdpdmVuIHR5cGUuXHJcbiAgICovXHJcbiAgc3Vic2NyaWJlIChhcmdUeXBlOiBzdHJpbmcsIGV2dDogRnVuY3Rpb24pIHtcclxuICAgIGNvbnN0IHN1YnNjcmliZXIgPSBuZXcgU3Vic2NyaXB0aW9uKHRoaXMsIGV2dCwgYXJnVHlwZSlcclxuXHJcbiAgICBpZiAoYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbYXJnVHlwZV0ucHVzaChzdWJzY3JpYmVyKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXSA9IFtzdWJzY3JpYmVyXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFVuc3Vic2NyaWJlcyBhIGdpdmVuIHN1YnNjcmlwdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3Vic2NyaXB0aW9ufSBzdWJzY3JpcHRpb25cclxuICAgKi9cclxuICB1bnN1YnNjcmliZSAoc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24pIHtcclxuICAgIGlmIChzdWJzY3JpcHRpb24uYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIC8vIGZpbHRlciBvdXQgdGhlIHN1YnNjcmlwdGlvbiBnaXZlbiBmcm9tIHRoZSBzdWJzY3JpYmVycyBkaWN0aW9uYXJ5XHJcbiAgICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5zdWJzY3JpYmVyc1tzdWJzY3JpcHRpb24uYXJnVHlwZV0uZmlsdGVyKGZ1bmN0aW9uIChzdWIpIHtcclxuICAgICAgICByZXR1cm4gc3ViLmlkICE9PSBzdWJzY3JpcHRpb24uaWRcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbc3Vic2NyaXB0aW9uLmFyZ1R5cGVdID0gZmlsdGVyZWRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoZXMgYWxsIHN1YnNjcmliZXJzIHRoYXQgdGFrZSBhcmd1bWVudHMgb2YgYSBnaXZlbiB0eXBlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBhIGNsYXNzIHRoYXQgY29udGFpbnMgYXJndW1lbnRzIGZvciB0aGUgZXZlbnQuIE11c3QgYmUgYSBjbGFzcyBhcyBzdWJzY3JpYmVycyBhcmUgZ3JvdXBlZCBieSB0eXBlLlxyXG4gICAqL1xyXG4gIHB1Ymxpc2ggKGFyZ3M6IE9iamVjdCkge1xyXG4gICAgY29uc3QgYXJnVHlwZSA9IGFyZ3MuY29uc3RydWN0b3IubmFtZVxyXG5cclxuICAgIGlmIChhcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXS5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHtcclxuICAgICAgICBzdWJzY3JpcHRpb24uZXZ0KGFyZ3MpXHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdubyB0eXBlIGZvdW5kIGZvciBwdWJsaXNoaW5nJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNsZWFyU3Vic2NyaXB0aW9ucyAoKSB7XHJcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge31cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEV2ZW50QWdncmVnYXRvclxyXG4iLCJpbXBvcnQgeyBJUGxheWFibGUgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcydcclxuaW1wb3J0IHsgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi8uLi9kb3VibHktbGlua2VkLWxpc3QnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5YWJsZUV2ZW50QXJnIHtcclxuICBjdXJyUGxheWFibGU6IElQbGF5YWJsZTtcclxuICBwbGF5YWJsZU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICBwbGF5YWJsZUFycjogQXJyYXk8SVBsYXlhYmxlPiB8IG51bGxcclxuXHJcbiAgLyoqIFRha2VzIGluIHRoZSBjdXJyZW50IHRyYWNrIHRvIHBsYXkgYXMgd2VsbCBhcyB0aGUgcHJldiB0cmFja3MgYW5kIG5leHQgdHJhY2tzIGZyb20gaXQuXHJcbiAgICogTm90ZSB0aGF0IGl0IGRvZXMgbm90IHRha2UgVHJhY2sgaW5zdGFuY2VzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJUGxheWFibGV9IGN1cnJUcmFjayAtIG9iamVjdCBjb250YWluaW5nIGVsZW1lbnQgdG8gc2VsZWN0LCB0cmFja191cmksIGFuZCB0cmFjayB0aXRsZS5cclxuICAgKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT59IHRyYWNrTm9kZSAtIG5vZGUgdGhhdCBhbGxvd3MgdXMgdG8gdHJhdmVyc2UgdG8gbmV4dCBhbmQgcHJldmlvdXMgdHJhY2sgZGF0YXMuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKGN1cnJUcmFjazogSVBsYXlhYmxlLCB0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4sIHBsYXlhYmxlQXJyOiBBcnJheTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgdGhpcy5jdXJyUGxheWFibGUgPSBjdXJyVHJhY2tcclxuICAgIHRoaXMucGxheWFibGVOb2RlID0gdHJhY2tOb2RlXHJcbiAgICB0aGlzLnBsYXlhYmxlQXJyID0gcGxheWFibGVBcnJcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL2FnZ3JlZ2F0b3InXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdWJzY3JpcHRpb24ge1xyXG4gIGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yXHJcbiAgZXZ0OiBGdW5jdGlvblxyXG4gIGFyZ1R5cGU6IHN0cmluZ1xyXG4gIGlkOiBzdHJpbmdcclxuXHJcbiAgY29uc3RydWN0b3IgKGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yLCBldnQ6IEZ1bmN0aW9uLCBhcmdUeXBlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yID0gZXZlbnRBZ2dyZWdhdG9yXHJcbiAgICB0aGlzLmV2dCA9IGV2dFxyXG4gICAgdGhpcy5hcmdUeXBlID0gYXJnVHlwZVxyXG4gICAgdGhpcy5pZCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBheGlvcywgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnXHJcbmltcG9ydCB7IGNvbmZpZywgcHJvbWlzZUhhbmRsZXIgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCBTZWxlY3RhYmxlVGFiRWxzIGZyb20gJy4vU2VsZWN0YWJsZVRhYkVscydcclxuXHJcbmV4cG9ydCBlbnVtIFRFUk1TIHtcclxuICAgIFNIT1JUX1RFUk0gPSAnc2hvcnRfdGVybScsXHJcbiAgICBNSURfVEVSTSA9ICdtZWRpdW1fdGVybScsXHJcbiAgICBMT05HX1RFUk0gPSAnbG9uZ190ZXJtJ1xyXG59XHJcblxyXG5leHBvcnQgZW51bSBURVJNX1RZUEUge1xyXG4gICAgQVJUSVNUUyA9ICdhcnRpc3RzJyxcclxuICAgIFRSQUNLUyA9ICd0cmFja3MnXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZXRlcm1pbmVzIHRoZSB0ZXJtIGdpdmVuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0ZXJtLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsIHRoZSBzdHJpbmcgY29ycm9zcG9uZGluZyB0byBhIHRlcm0uXHJcbiAqIEByZXR1cm5zIHtURVJNU30gdGhlIHRlcm0gZW51bSBjb3Jyb3Nwb25kaW5nIHRvIHRoZSBnaXZlbiBzdHJpbmcuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5lVGVybSAodmFsOiBzdHJpbmcpIDogVEVSTVMge1xyXG4gIHN3aXRjaCAodmFsKSB7XHJcbiAgICBjYXNlIFRFUk1TLlNIT1JUX1RFUk06XHJcbiAgICAgIHJldHVybiBURVJNUy5TSE9SVF9URVJNXHJcbiAgICBjYXNlIFRFUk1TLk1JRF9URVJNOlxyXG4gICAgICByZXR1cm4gVEVSTVMuTUlEX1RFUk1cclxuICAgIGNhc2UgVEVSTVMuTE9OR19URVJNOlxyXG4gICAgICByZXR1cm4gVEVSTVMuTE9OR19URVJNXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05PIENPUlJFQ1QgVEVSTSBXQVMgRk9VTkQnKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIExvYWRzIGZyb20gcmVkaXMgdGhlIGxhc3QgdGVybSBvZiBhIGNlcnRhaW4gdHlwZSB0aGF0IHRoZSB1c2VyIGxhc3QgbGVmdCBvZmYgYXQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7VEVSTV9UWVBFfSB0ZXJtVHlwZSB0aGUgdHlwZSBvZiBpdGVtIHdob3NlIHRlcm0geW91IHdhbnQgdG8gbG9hZCAoZWcuIGFydGlzdHMsIHRyYWNrcyBldGMuKVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxURVJNUz59IHRoZSB0ZXJtIHRoYXQgdGhlIHVzZXIgbGFzdCBsZWZ0IHRoZSBwYWdlIGZyb20uXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRlcm0gKHRlcm1UeXBlOiBURVJNX1RZUEUpIDogUHJvbWlzZTxURVJNUz4ge1xyXG4gIGNvbnN0IHsgcmVzLCBlcnIgfSA9IGF3YWl0IHByb21pc2VIYW5kbGVyPEF4aW9zUmVzcG9uc2U8c3RyaW5nIHwgbnVsbD4+KChheGlvcy5yZXF1ZXN0PHN0cmluZyB8IG51bGw+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRUZXJtKHRlcm1UeXBlKSB9KSkpXHJcbiAgaWYgKGVycikge1xyXG4gICAgcmV0dXJuIFRFUk1TLlNIT1JUX1RFUk1cclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGRldGVybWluZVRlcm0ocmVzPy5kYXRhIGFzIHN0cmluZylcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYXZlcyB0byByZWRpcyB0aGUgdGVybSBvZiBhIGNlcnRhaW4gdHlwZS5cclxuICpcclxuICogQHBhcmFtIHtURVJNU30gdGVybSB0aGUgdGVybSB0byBzYXZlLlxyXG4gKiBAcGFyYW0ge1RFUk1fVFlQRX0gdGVybVR5cGUgdGhlIHR5cGUgb2YgaXRlbSB3aG9zZSB0ZXJtIHlvdSB3YW50IHRvIHNhdmUgKGVnLiBhcnRpc3RzLCB0cmFja3MgZXRjLilcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlVGVybSAodGVybTogVEVSTVMsIHRlcm1UeXBlOiBURVJNX1RZUEUpIHtcclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0VGVybSh0ZXJtLCB0ZXJtVHlwZSkpKVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBpbmRleCB0aGF0IHBvaW50cyB0byB0aGUgdGFiIGVsZW1lbnRzXHJcbiAqIEBwYXJhbSB7VEVSTVN9IHRlcm0gdGhlIHRlcm0gcmVsYXRpbmcgdG8gdGhlIHRhYiBlbGVtZW50c1xyXG4gKiBAcmV0dXJucyB0aGUgaW5kZXggdG8gZmluZCB0aGUgdGFiIGVsZW1lbnRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSWR4RnJvbVRlcm0gKHRlcm06IFRFUk1TKSB7XHJcbiAgc3dpdGNoICh0ZXJtKSB7XHJcbiAgICBjYXNlIFRFUk1TLlNIT1JUX1RFUk06XHJcbiAgICAgIHJldHVybiAwXHJcbiAgICBjYXNlIFRFUk1TLk1JRF9URVJNOlxyXG4gICAgICByZXR1cm4gMVxyXG4gICAgY2FzZSBURVJNUy5MT05HX1RFUk06XHJcbiAgICAgIHJldHVybiAyXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2VsZWN0cyB0aGUgdGFiIHRvIHN0YXJ0IG9uIHdoZW4gcGFnZSBsb2Fkcy5cclxuICogQHBhcmFtIHtURVJNU30gdGVybSB0aGUgdGVybSB3aG9zZSB0YWIgaXMgdG8gYmUgc2VsZWN0ZWQuXHJcbiAqIEBwYXJhbSB7U2VsZWN0YWJsZVRhYkVsc30gdGVybVRhYiB0aGUgdGFiIGVsZW1lbnRzIGhhbmRsZXIuXHJcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFiUGFyZW50IHRoZSBwYXJlbnQgb2YgYWxsIHRoZSB0YWIgZWxlbWVudHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTdGFydFRlcm1UYWIgKHRlcm06IFRFUk1TLCB0ZXJtVGFiOiBTZWxlY3RhYmxlVGFiRWxzLCB0YWJQYXJlbnQ6IEVsZW1lbnQpIHtcclxuICBjb25zdCBpZHggPSBJZHhGcm9tVGVybSh0ZXJtKVxyXG4gIGNvbnN0IGJ0biA9IHRhYlBhcmVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYnV0dG9uJylbaWR4XVxyXG4gIGNvbnN0IGJvcmRlciA9IHRhYlBhcmVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5ib3JkZXJDb3ZlcilbaWR4XVxyXG5cclxuICB0ZXJtVGFiLnNlbGVjdE5ld1RhYihidG4sIGJvcmRlcilcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBodG1sVG9FbCxcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIHRocm93RXhwcmVzc2lvbixcclxuICByZW1vdmVBbGxDaGlsZE5vZGVzXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgeyBwbGF5ZXJQdWJsaWNWYXJzIH0gZnJvbSAnLi9wbGF5YmFjay1zZGsnXHJcblxyXG5jbGFzcyBTbGlkZXIge1xyXG4gIHB1YmxpYyBkcmFnOiBib29sZWFuID0gZmFsc2VcclxuICBwdWJsaWMgc2xpZGVyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcclxuICBwdWJsaWMgc2xpZGVyUHJvZ3Jlc3M6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcclxuICBwcml2YXRlIHBlcmNlbnRhZ2U6IG51bWJlciA9IDBcclxuICBwdWJsaWMgbWF4OiBudW1iZXIgPSAwXHJcbiAgcHJpdmF0ZSB0b3BUb0JvdHRvbTogYm9vbGVhblxyXG4gIHByaXZhdGUgb25EcmFnU3RhcnQ6ICgpID0+IHZvaWRcclxuICBwcml2YXRlIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWRcclxuICBwcml2YXRlIG9uRHJhZ2dpbmc6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWRcclxuXHJcbiAgY29uc3RydWN0b3IgKHN0YXJ0UGVyY2VudGFnZTogbnVtYmVyLCBvbkRyYWdTdG9wOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLCB0b3BUb0JvdHRvbTogYm9vbGVhbiwgb25EcmFnU3RhcnQgPSAoKSA9PiB7fSwgb25EcmFnZ2luZyA9IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHt9LCBzbGlkZXJFbDogSFRNTEVsZW1lbnQpIHtcclxuICAgIHRoaXMub25EcmFnU3RvcCA9IG9uRHJhZ1N0b3BcclxuICAgIHRoaXMub25EcmFnU3RhcnQgPSBvbkRyYWdTdGFydFxyXG4gICAgdGhpcy5vbkRyYWdnaW5nID0gb25EcmFnZ2luZ1xyXG4gICAgdGhpcy50b3BUb0JvdHRvbSA9IHRvcFRvQm90dG9tXHJcbiAgICB0aGlzLnBlcmNlbnRhZ2UgPSBzdGFydFBlcmNlbnRhZ2VcclxuXHJcbiAgICB0aGlzLnNsaWRlckVsID0gc2xpZGVyRWxcclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MgPSBzbGlkZXJFbD8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3MpWzBdIGFzIEhUTUxFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignTm8gcHJvZ3Jlc3MgYmFyIGZvdW5kJylcclxuXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAvLyBpZiBpdHMgdG9wIHRvIGJvdHRvbSB3ZSBtdXN0IHJvdGF0ZSB0aGUgZWxlbWVudCBkdWUgcmV2ZXJzZWQgaGVpZ2h0IGNoYW5naW5nXHJcbiAgICAgIHRoaXMuc2xpZGVyRWwhLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGV4KDE4MGRlZyknXHJcbiAgICAgIHRoaXMuc2xpZGVyRWwhLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9ICd0cmFuc2Zvcm0tb3JpZ2luOiB0b3AnXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jaGFuZ2VCYXJMZW5ndGgoKVxyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JhY2tncm91bmQtY29sb3InKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgbGVuZ3RoIG9mIHRoZSBiYXIgYWNjb3JkaW5nIHRvIHdoZXJlIHRoZSBtb3VzZSBwb3NpdGlvbiBpcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbW9zUG9zVmFsIHRoZSBtb3VzZSBwb3NpdGlvbiB3LnIudC4gdGhlIGNsaWVudC5cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZUJhciAobW9zUG9zVmFsOiBudW1iZXIpIHtcclxuICAgIGxldCBwb3NpdGlvblxyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgcG9zaXRpb24gPSBtb3NQb3NWYWwgLSB0aGlzLnNsaWRlckVsIS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS55XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwb3NpdGlvbiA9IG1vc1Bvc1ZhbCAtIHRoaXMuc2xpZGVyRWwhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnhcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAvLyBtaW51cyAxMDAgYmVjYXVzZSBtb2RpZnlpbmcgaGVpZ2h0IGlzIHJldmVyc2VkXHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDEwMCAtICgxMDAgKiAocG9zaXRpb24gLyB0aGlzLnNsaWRlckVsIS5jbGllbnRIZWlnaHQpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wZXJjZW50YWdlID0gMTAwICogKHBvc2l0aW9uIC8gdGhpcy5zbGlkZXJFbCEuY2xpZW50V2lkdGgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucGVyY2VudGFnZSA+IDEwMCkge1xyXG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAxMDBcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBlcmNlbnRhZ2UgPCAwKSB7XHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDBcclxuICAgIH1cclxuICAgIHRoaXMuY2hhbmdlQmFyTGVuZ3RoKClcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDaGFuZ2VzIHRoZSBiYXIgbGVuZ3RoIGJ5IHBlcmNlbnQgMC0xMDA7XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjaGFuZ2VCYXJMZW5ndGggKCkge1xyXG4gICAgLy8gc2V0IGJhY2tncm91bmQgY29sb3Igb2YgYWxsIG1vdmluZyBzbGlkZXJzIHByb2dyZXNzIGFzIHRoZSBzcG90aWZ5IGdyZWVuXHJcbiAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzFkYjk1NCdcclxuICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLmhlaWdodCA9IHRoaXMucGVyY2VudGFnZSArICclJ1xyXG4gICAgfSBlbHNlIHtcclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLndpZHRoID0gdGhpcy5wZXJjZW50YWdlICsgJyUnXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGJvdGggbW91c2UgYW5kIHRvdWNoIGV2ZW50cyBmb3IgY2hhbmdpbmcgdGhlIHNsaWRlciBiYXIgbGVuZ3RoLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVycyAoKSB7XHJcbiAgICB0aGlzLmFkZE1vdXNlRXZlbnRzKClcclxuICAgIHRoaXMuYWRkVG91Y2hFdmVudHMoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGFkZCB0b3VjaCBldmVudHMgdG8gY2hhbmdlIHRoZSBiYXIgbGVuZ3RoIGFuZCBjb2xvciBmb3IgbW9iaWxlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWRkVG91Y2hFdmVudHMgKCkge1xyXG4gICAgdGhpcy5zbGlkZXJFbD8uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChldnQpID0+IHtcclxuICAgICAgdGhpcy5kcmFnID0gdHJ1ZVxyXG4gICAgICBpZiAodGhpcy5vbkRyYWdTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RhcnQoKVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMudXBkYXRlQmFyKGV2dC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYKVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChldnQpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnZ2luZyh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RvcCh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmxpbmUgY3NzIHNvIHRoYXQgaXRzIG9yaWdpbmFsIGJhY2tncm91bmQgY29sb3IgcmV0dXJuc1xyXG4gICAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJylcclxuICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGFkZCBtb3VzZSBldmVudHMgdG8gY2hhbmdlIHRoZSBiYXIgbGVuZ3RoIGFuZCBjb2xvci5cclxuICAgKi9cclxuICBwcml2YXRlIGFkZE1vdXNlRXZlbnRzICgpIHtcclxuICAgIHRoaXMuc2xpZGVyRWw/LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldnQpID0+IHtcclxuICAgICAgdGhpcy5kcmFnID0gdHJ1ZVxyXG4gICAgICBpZiAodGhpcy5vbkRyYWdTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RhcnQoKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFkpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ2dpbmcodGhpcy5wZXJjZW50YWdlKVxyXG4gICAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2xpZW50WSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RvcCh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmxpbmUgY3NzIHNvIHRoYXQgaXRzIG9yaWdpbmFsIGJhY2tncm91bmQgY29sb3IgcmV0dXJuc1xyXG4gICAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJylcclxuICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BvdGlmeVBsYXliYWNrRWxlbWVudCB7XHJcbiAgcHJpdmF0ZSB0aXRsZTogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsXHJcbiAgcHVibGljIGN1cnJUaW1lOiBFbGVtZW50IHwgbnVsbFxyXG4gIHB1YmxpYyBkdXJhdGlvbjogRWxlbWVudCB8IG51bGxcclxuICBwdWJsaWMgcGxheVBhdXNlOiBFbGVtZW50IHwgbnVsbFxyXG4gIHB1YmxpYyBzb25nUHJvZ3Jlc3M6IFNsaWRlciB8IG51bGwgPSBudWxsXHJcbiAgcHJpdmF0ZSB2b2x1bWVCYXI6IFNsaWRlciB8IG51bGwgPSBudWxsXHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMudGl0bGUgPSBudWxsXHJcbiAgICB0aGlzLmN1cnJUaW1lID0gbnVsbFxyXG4gICAgdGhpcy5kdXJhdGlvbiA9IG51bGxcclxuICAgIHRoaXMucGxheVBhdXNlID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldEFydGlzdHMgKGFydGlzdEh0bWw6IHN0cmluZykge1xyXG4gICAgY29uc3QgYXJ0aXN0TmFtZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMud2ViUGxheWVyQXJ0aXN0cylcclxuICAgIGlmIChhcnRpc3ROYW1lRWwpIHtcclxuICAgICAgcmVtb3ZlQWxsQ2hpbGROb2RlcyhhcnRpc3ROYW1lRWwpXHJcbiAgICAgIGFydGlzdE5hbWVFbC5pbm5lckhUTUwgKz0gYXJ0aXN0SHRtbFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldEltZ1NyYyAoaW1nU3JjOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHBsYXllclRyYWNrSW1nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheWVyVHJhY2tJbWcpIGFzIEhUTUxJbWFnZUVsZW1lbnRcclxuICAgIGlmIChwbGF5ZXJUcmFja0ltZykge1xyXG4gICAgICBwbGF5ZXJUcmFja0ltZy5zcmMgPSBpbWdTcmNcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRUaXRsZSAodGl0bGU6IHN0cmluZywgdHJhY2tVcmk6IHN0cmluZykge1xyXG4gICAgaWYgKHRoaXMudGl0bGUgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUcnlpbmcgdG8gc2V0IHRpdGxlIGJlZm9yZSBpdCBpcyBhc3NpZ25lZCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnRpdGxlIS50ZXh0Q29udGVudCA9IHRpdGxlXHJcbiAgICB0aGlzLnRpdGxlIS5ocmVmID0gdHJhY2tVcmlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRUaXRsZSAoKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLnRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIHNldCB0aXRsZSBiZWZvcmUgaXQgaXMgYXNzaWduZWQnKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMudGl0bGUudGV4dENvbnRlbnQgYXMgc3RyaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmQgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCB0byB0aGUgRE9NIGFsb25nIHdpdGggdGhlIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGJ1dHRvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0geygpID0+IHZvaWR9IHBsYXlQcmV2RnVuYyB0aGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIHBsYXkgcHJldmlvdXMgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlIHdlYiBwbGF5ZXIuXHJcbiAgICogQHBhcmFtIHsoKSA9PiB2b2lkfSBwYXVzZUZ1bmMgdGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBwYXVzZS9wbGF5IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqIEBwYXJhbSB7KCkgPT4gdm9pZH0gcGxheU5leHRGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqIEBwYXJhbSB7KCkgPT4gdm9pZH0gb25TZWVrU3RhcnQgLSBvbiBkcmFnIHN0YXJ0IGV2ZW50IGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSB7KHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZH0gc2Vla1NvbmcgLSBvbiBkcmFnIGVuZCBldmVudCB0byBzZWVrIHNvbmcgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHsocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkfSBvblNlZWtpbmcgLSBvbiBkcmFnZ2luZyBldmVudCBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0geyhwZXJjZW50YWdlOiBudW1iZXIsIHNhdmU6IGJvb2xlYW4pID0+IHZvaWR9IHNldFZvbHVtZSAtIG9uIGRyYWdnaW5nIGFuZCBvbiBkcmFnIGVuZCBldmVudCBmb3Igdm9sdW1lIHNsaWRlclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbml0aWFsVm9sdW1lIC0gdGhlIGluaXRpYWwgdm9sdW1lIHRvIHNldCB0aGUgc2xpZGVyIGF0XHJcbiAgICovXHJcbiAgcHVibGljIGFwcGVuZFdlYlBsYXllckh0bWwgKFxyXG4gICAgcGxheVByZXZGdW5jOiAoKSA9PiB2b2lkLFxyXG4gICAgcGF1c2VGdW5jOiAoKSA9PiB2b2lkLFxyXG4gICAgcGxheU5leHRGdW5jOiAoKSA9PiB2b2lkLFxyXG4gICAgb25TZWVrU3RhcnQ6ICgpID0+IHZvaWQsXHJcbiAgICBzZWVrU29uZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIG9uU2Vla2luZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIHNldFZvbHVtZTogKHBlcmNlbnRhZ2U6IG51bWJlciwgc2F2ZTogYm9vbGVhbikgPT4gdm9pZCxcclxuICAgIGluaXRpYWxWb2x1bWU6IG51bWJlcikge1xyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgIDxhcnRpY2xlIGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJ9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIj5cclxuICAgICAgPGltZyBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNvbHVtbn1cIiBzcmM9XCIke2NvbmZpZy5QQVRIUy5wcm9maWxlVXNlcn1cIiBhbHQ9XCJ0cmFja1wiIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5ZXJUcmFja0ltZ31cIi8+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCIgc3R5bGU9XCJmbGV4LWJhc2lzOiAzMCU7IG1heC13aWR0aDogMTguNXZ3O1wiPlxyXG4gICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj48YSBocmVmPVwiXCIgdGFyZ2V0PVwiX2JsYW5rXCI+U2VsZWN0IGEgU29uZzwvYT48L2g0PlxyXG4gICAgICAgIDxzcGFuIGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJBcnRpc3RzfVwiPjwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy53ZWJQbGF5ZXJDb250cm9sc30gJHtjb25maWcuQ1NTLkNMQVNTRVMuY29sdW1ufVwiPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8YXJ0aWNsZSBpZD1cIndlYi1wbGF5ZXItYnV0dG9uc1wiPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5zaHVmZmxlfVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMuc2h1ZmZsZUljb259XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5UHJldn1cIiBjbGFzcz1cIm5leHQtcHJldlwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGxheVByZXZ9XCIgYWx0PVwicHJldmlvdXNcIi8+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZX1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59XCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXlOZXh0fVwiIGNsYXNzPVwibmV4dC1wcmV2XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5TmV4dH1cIiBhbHQ9XCJuZXh0XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5sb29wfVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMubG9vcEljb259XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9hcnRpY2xlPlxyXG4gICAgICAgICAgPGRpdiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyVm9sdW1lfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2xpZGVyfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3N9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcn1cIj5cclxuICAgICAgICAgIDxwPjA6MDA8L3A+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzc31cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNsaWRlcn1cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnByb2dyZXNzfVwiPjwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvYXJ0aWNsZT5cclxuICAgIGBcclxuXHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGh0bWxUb0VsKGh0bWwpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh3ZWJQbGF5ZXJFbCBhcyBOb2RlKVxyXG4gICAgdGhpcy5nZXRXZWJQbGF5ZXJFbHMoXHJcbiAgICAgIG9uU2Vla1N0YXJ0LFxyXG4gICAgICBzZWVrU29uZyxcclxuICAgICAgb25TZWVraW5nLFxyXG4gICAgICBzZXRWb2x1bWUsXHJcbiAgICAgIGluaXRpYWxWb2x1bWUpXHJcbiAgICB0aGlzLmFzc2lnbkV2ZW50TGlzdGVuZXJzKFxyXG4gICAgICBwbGF5UHJldkZ1bmMsXHJcbiAgICAgIHBhdXNlRnVuYyxcclxuICAgICAgcGxheU5leHRGdW5jXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGVyY2VudERvbmUgdGhlIHBlcmNlbnQgb2YgdGhlIHNvbmcgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9zaXRpb24gdGhlIGN1cnJlbnQgcG9zaXRpb24gaW4gbXMgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlRWxlbWVudCAocGVyY2VudERvbmU6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikge1xyXG4gICAgLy8gaWYgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyIGRvbid0IGF1dG8gdXBkYXRlXHJcbiAgICBpZiAocG9zaXRpb24gIT09IDAgJiYgIXRoaXMuc29uZ1Byb2dyZXNzIS5kcmFnKSB7XHJcbiAgICAgIC8vIHJvdW5kIGVhY2ggaW50ZXJ2YWwgdG8gdGhlIG5lYXJlc3Qgc2Vjb25kIHNvIHRoYXQgdGhlIG1vdmVtZW50IG9mIHByb2dyZXNzIGJhciBpcyBieSBzZWNvbmQuXHJcbiAgICAgIHRoaXMuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50RG9uZX0lYFxyXG4gICAgICBpZiAodGhpcy5jdXJyVGltZSA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHRpbWUgZWxlbWVudCBpcyBudWxsJylcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhwb3NpdGlvbilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzIG9uY2UgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCBoYXMgYmVlbiBhcHBlbmVkZWQgdG8gdGhlIERPTS4gSW5pdGlhbGl6ZXMgU2xpZGVycy5cclxuICAgKiBAcGFyYW0geygpID0+IHZvaWR9IG9uU2Vla1N0YXJ0IC0gb24gZHJhZyBzdGFydCBldmVudCBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0geyhwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWR9IHNlZWtTb25nIC0gb24gZHJhZyBlbmQgZXZlbnQgdG8gc2VlayBzb25nIGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSB7KHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZH0gb25TZWVraW5nIC0gb24gZHJhZ2dpbmcgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHsocGVyY2VudGFnZTogbnVtYmVyLCBzYXZlOiBib29sZWFuKSA9PiB2b2lkfSBzZXRWb2x1bWUgLSBvbiBkcmFnZ2luZyBhbmQgb24gZHJhZyBlbmQgZXZlbnQgZm9yIHZvbHVtZSBzbGlkZXJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbFZvbHVtZSAtIHRoZSBpbml0aWFsIHZvbHVtZSB0byBzZXQgdGhlIHNsaWRlciBhdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0V2ViUGxheWVyRWxzIChcclxuICAgIG9uU2Vla1N0YXJ0OiAoKSA9PiB2b2lkLFxyXG4gICAgc2Vla1Nvbmc6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQsXHJcbiAgICBvblNlZWtpbmc6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQsXHJcbiAgICBzZXRWb2x1bWU6IChwZXJjZW50YWdlOiBudW1iZXIsIHNhdmU6IGJvb2xlYW4pID0+IHZvaWQsXHJcbiAgICBpbml0aWFsVm9sdW1lOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IHdlYlBsYXllckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMud2ViUGxheWVyKSA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCBwbGF5VGltZUJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlUaW1lQmFyKSA/PyB0aHJvd0V4cHJlc3Npb24oJ3BsYXkgdGltZSBiYXIgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgY29uc3Qgc29uZ1NsaWRlckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMud2ViUGxheWVyUHJvZ3Jlc3MpIGFzIEhUTUxFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBwcm9ncmVzcyBiYXIgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgY29uc3Qgdm9sdW1lU2xpZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJWb2x1bWUpIGFzIEhUTUxFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciB2b2x1bWUgYmFyIGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICB0aGlzLnNvbmdQcm9ncmVzcyA9IG5ldyBTbGlkZXIoMCwgc2Vla1NvbmcsIGZhbHNlLCBvblNlZWtTdGFydCwgb25TZWVraW5nLCBzb25nU2xpZGVyRWwpXHJcbiAgICB0aGlzLnZvbHVtZUJhciA9IG5ldyBTbGlkZXIoaW5pdGlhbFZvbHVtZSAqIDEwMCwgKHBlcmNlbnRhZ2UpID0+IHNldFZvbHVtZShwZXJjZW50YWdlLCBmYWxzZSksIGZhbHNlLCAoKSA9PiB7fSwgKHBlcmNlbnRhZ2UpID0+IHNldFZvbHVtZShwZXJjZW50YWdlLCB0cnVlKSwgdm9sdW1lU2xpZGVyRWwpXHJcblxyXG4gICAgdGhpcy50aXRsZSA9IHdlYlBsYXllckVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoNCcpWzBdLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJylbMF0gYXMgSFRNTEFuY2hvckVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHRpdGxlIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICAgIC8vIGdldCBwbGF5dGltZSBiYXIgZWxlbWVudHNcclxuICAgIHRoaXMuY3VyclRpbWUgPSBwbGF5VGltZUJhci5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpWzBdIGFzIEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIGN1cnJlbnQgdGltZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIHRoaXMuZHVyYXRpb24gPSBwbGF5VGltZUJhci5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpWzFdIGFzIEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIGR1cmF0aW9uIHRpbWUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgdGhpcy5wbGF5UGF1c2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQbGF5UGF1c2UpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBc3NpZ25zIHRoZSBldmVudHMgdG8gcnVuIG9uIGVhY2ggYnV0dG9uIHByZXNzIHRoYXQgZXhpc3RzIG9uIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0geygpID0+IHZvaWR9IHBsYXlQcmV2RnVuYyBmdW5jdGlvbiB0byBydW4gd2hlbiBwbGF5IHByZXZpb3VzIGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICogQHBhcmFtIHsoKSA9PiB2b2lkfSBwYXVzZUZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheS9wYXVzZSBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSB7KCkgPT4gdm9pZH0gcGxheU5leHRGdW5jIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHBsYXkgbmV4dCBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXNzaWduRXZlbnRMaXN0ZW5lcnMgKFxyXG4gICAgcGxheVByZXZGdW5jOiAoKSA9PiB2b2lkLFxyXG4gICAgcGF1c2VGdW5jOiAoKSA9PiB2b2lkLFxyXG4gICAgcGxheU5leHRGdW5jOiAoKSA9PiB2b2lkKSB7XHJcbiAgICBjb25zdCBwbGF5UHJldiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlQcmV2KVxyXG4gICAgY29uc3QgcGxheU5leHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5TmV4dClcclxuICAgIGNvbnN0IHNodWZmbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5zaHVmZmxlKVxyXG4gICAgY29uc3QgbG9vcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmxvb3ApXHJcblxyXG4gICAgbG9vcD8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHBsYXllclB1YmxpY1ZhcnMuaXNMb29wID0gIXBsYXllclB1YmxpY1ZhcnMuaXNMb29wXHJcbiAgICAgIGxvb3AuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdLmNsYXNzTGlzdC50b2dnbGUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgfSlcclxuICAgIHNodWZmbGU/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSA9ICFwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZVxyXG4gICAgICBzaHVmZmxlLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKVswXS5jbGFzc0xpc3QudG9nZ2xlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIH0pXHJcblxyXG4gICAgcGxheVByZXY/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxheVByZXZGdW5jKVxyXG4gICAgcGxheU5leHQ/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxheU5leHRGdW5jKVxyXG5cclxuICAgIHRoaXMucGxheVBhdXNlPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBhdXNlRnVuYylcclxuICAgIHRoaXMuc29uZ1Byb2dyZXNzPy5hZGRFdmVudExpc3RlbmVycygpXHJcbiAgICB0aGlzLnZvbHVtZUJhcj8uYWRkRXZlbnRMaXN0ZW5lcnMoKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIGh0bWxUb0VsLFxyXG4gIGdldFZhbGlkSW1hZ2VcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7XHJcbiAgY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlcixcclxuICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsXHJcbn0gZnJvbSAnLi9wbGF5YmFjay1zZGsnXHJcbmltcG9ydCBBbGJ1bSBmcm9tICcuL2FsYnVtJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcbmltcG9ydCBQbGF5YWJsZUV2ZW50QXJnIGZyb20gJy4vcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzJ1xyXG5pbXBvcnQgeyBTcG90aWZ5SW1nLCBGZWF0dXJlc0RhdGEsIElBcnRpc3RUcmFja0RhdGEsIElQbGF5YWJsZSwgRXh0ZXJuYWxVcmxzLCBUcmFja0RhdGEgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QsIHsgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vcHVic3ViL2FnZ3JlZ2F0b3InXHJcblxyXG5jb25zdCBldmVudEFnZ3JlZ2F0b3IgPSAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yIGFzIEV2ZW50QWdncmVnYXRvclxyXG5cclxuY2xhc3MgVHJhY2sgZXh0ZW5kcyBDYXJkIGltcGxlbWVudHMgSVBsYXlhYmxlIHtcclxuICBwcml2YXRlIGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzXHJcbiAgcHJpdmF0ZSBfaWQ6IHN0cmluZ1xyXG4gIHByaXZhdGUgX3RpdGxlOiBzdHJpbmdcclxuICBwcml2YXRlIF9kdXJhdGlvbjogc3RyaW5nXHJcbiAgcHJpdmF0ZSBfdXJpOiBzdHJpbmdcclxuICBwcml2YXRlIF9kYXRlQWRkZWRUb1BsYXlsaXN0OiBEYXRlXHJcblxyXG4gIHBvcHVsYXJpdHk6IHN0cmluZ1xyXG4gIHJlbGVhc2VEYXRlOiBEYXRlXHJcbiAgYWxidW06IEFsYnVtXHJcbiAgZmVhdHVyZXM6IEZlYXR1cmVzRGF0YSB8IHVuZGVmaW5lZFxyXG4gIGltYWdlVXJsOiBzdHJpbmdcclxuICBzZWxFbDogRWxlbWVudFxyXG4gIG9uUGxheWluZzogRnVuY3Rpb25cclxuICBvblN0b3BwZWQ6IEZ1bmN0aW9uXHJcbiAgYXJ0aXN0c0h0bWw6IHN0cmluZ1xyXG5cclxuICBwdWJsaWMgZ2V0IGlkICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lkXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRpdGxlICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RpdGxlXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHVyaSAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl91cmlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZGF0ZUFkZGVkVG9QbGF5bGlzdCAoKTogRGF0ZSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdFxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldERhdGVBZGRlZFRvUGxheWxpc3QgKHZhbDogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSkge1xyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKHZhbClcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChwcm9wczogeyB0aXRsZTogc3RyaW5nOyBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+OyBkdXJhdGlvbjogbnVtYmVyOyB1cmk6IHN0cmluZzsgcG9wdWxhcml0eTogc3RyaW5nOyByZWxlYXNlRGF0ZTogc3RyaW5nOyBpZDogc3RyaW5nOyBhbGJ1bTogQWxidW07IGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzOyBhcnRpc3RzOiBBcnJheTx1bmtub3duPjsgaWR4OiBudW1iZXIgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgY29uc3Qge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgaW1hZ2VzLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgICAgdXJpLFxyXG4gICAgICBwb3B1bGFyaXR5LFxyXG4gICAgICByZWxlYXNlRGF0ZSxcclxuICAgICAgaWQsXHJcbiAgICAgIGFsYnVtLFxyXG4gICAgICBleHRlcm5hbFVybHMsXHJcbiAgICAgIGFydGlzdHNcclxuICAgIH0gPSBwcm9wc1xyXG5cclxuICAgIHRoaXMuZXh0ZXJuYWxVcmxzID0gZXh0ZXJuYWxVcmxzXHJcbiAgICB0aGlzLl9pZCA9IGlkXHJcbiAgICB0aGlzLl90aXRsZSA9IHRpdGxlXHJcbiAgICB0aGlzLmFydGlzdHNIdG1sID0gdGhpcy5nZW5lcmF0ZUhUTUxBcnRpc3ROYW1lcyhhcnRpc3RzKVxyXG4gICAgdGhpcy5fZHVyYXRpb24gPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKGR1cmF0aW9uKVxyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKClcclxuXHJcbiAgICAvLyBlaXRoZXIgdGhlIG5vcm1hbCB1cmksIG9yIHRoZSBsaW5rZWRfZnJvbS51cmlcclxuICAgIHRoaXMuX3VyaSA9IHVyaVxyXG4gICAgdGhpcy5wb3B1bGFyaXR5ID0gcG9wdWxhcml0eVxyXG4gICAgdGhpcy5yZWxlYXNlRGF0ZSA9IG5ldyBEYXRlKHJlbGVhc2VEYXRlKVxyXG4gICAgdGhpcy5hbGJ1bSA9IGFsYnVtXHJcbiAgICB0aGlzLmZlYXR1cmVzID0gdW5kZWZpbmVkXHJcblxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy5zZWxFbCA9IGh0bWxUb0VsKCc8PjwvPicpIGFzIEVsZW1lbnRcclxuXHJcbiAgICB0aGlzLm9uUGxheWluZyA9ICgpID0+IHt9XHJcbiAgICB0aGlzLm9uU3RvcHBlZCA9ICgpID0+IHt9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZpbHRlckRhdGFGcm9tQXJ0aXN0cyAoYXJ0aXN0czogQXJyYXk8dW5rbm93bj4pIHtcclxuICAgIHJldHVybiBhcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiBhcnRpc3QgYXMgSUFydGlzdFRyYWNrRGF0YSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMgKGFydGlzdHM6IEFycmF5PHVua25vd24+KSB7XHJcbiAgICBjb25zdCBhcnRpc3RzRGF0YXMgPSB0aGlzLmZpbHRlckRhdGFGcm9tQXJ0aXN0cyhhcnRpc3RzKVxyXG4gICAgbGV0IGFydGlzdE5hbWVzID0gJydcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJ0aXN0c0RhdGFzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGFydGlzdCA9IGFydGlzdHNEYXRhc1tpXVxyXG4gICAgICBhcnRpc3ROYW1lcyArPSBgPGEgaHJlZj1cIiR7YXJ0aXN0LmV4dGVybmFsX3VybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FydGlzdC5uYW1lfTwvYT5gXHJcblxyXG4gICAgICBpZiAoaSA8IGFydGlzdHNEYXRhcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgYXJ0aXN0TmFtZXMgKz0gJywgJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJ0aXN0TmFtZXNcclxuICB9XHJcblxyXG4gIC8qKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgdHJhY2suXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhY2tDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSkgOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMudHJhY2tQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnJhbmtDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUluXHJcbiAgICB9ICR7YXBwZWFyQ2xhc3N9XCI+XHJcbiAgICAgICAgICAgICAgPGg0IGlkPVwiJHtjb25maWcuQ1NTLklEcy5yYW5rfVwiPiR7aWR4ICsgMX0uPC9oND5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja31cIiBpZD1cIiR7dGhpcy5nZXRDYXJkSWQoKX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkRnJvbnRcclxuICAgICAgICAgICAgICAgICAgfVwiICB0aXRsZT1cIkNsaWNrIHRvIHZpZXcgbW9yZSBJbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiAke2NvbmZpZy5DU1MuQVRUUklCVVRFUy5yZXN0cmljdEZsaXBPbkNsaWNrfT1cInRydWVcIiBpZD1cIiR7dGhpcy5fdXJpfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCIgdGl0bGU9XCJDbGljayB0byBwbGF5IHNvbmdcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZVVybH1cIiBhbHQ9XCJBbGJ1bSBDb3ZlclwiIHRpdGxlPVwiQWxidW0gQ292ZXJcIj48L2ltZz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5EdXJhdGlvbjo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5fZHVyYXRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5SZWxlYXNlIERhdGU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMucmVsZWFzZURhdGUudG9EYXRlU3RyaW5nKCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5BbGJ1bSBOYW1lOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwICR7Y29uZmlnLkNTUy5BVFRSSUJVVEVTLnJlc3RyaWN0RmxpcE9uQ2xpY2t9PVwidHJ1ZVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPiR7XHJcbiAgICAgIHRoaXMuYWxidW0ubmFtZVxyXG4gICAgfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbCkgYXMgSFRNTEVsZW1lbnRcclxuICAgIGNvbnN0IHBsYXlCdG4gPSBlbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRuKVswXVxyXG5cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5QnRuXHJcblxyXG4gICAgcGxheUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgdHJhY2tOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4odGhpcylcclxuICAgICAgdGhpcy5wbGF5UGF1c2VDbGljayh0cmFja05vZGUpXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBsYXlQYXVzZUNsaWNrICh0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4sIHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxJUGxheWFibGU+IHwgbnVsbCA9IG51bGwpIHtcclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcyBhcyBJUGxheWFibGVcclxuICAgIGxldCB0cmFja0FyciA9IG51bGxcclxuXHJcbiAgICBpZiAodHJhY2tMaXN0KSB7XHJcbiAgICAgIHRyYWNrQXJyID0gdHJhY2tMaXN0LnRvQXJyYXkoKVxyXG4gICAgfVxyXG4gICAgZXZlbnRBZ2dyZWdhdG9yLnB1Ymxpc2gobmV3IFBsYXlhYmxlRXZlbnRBcmcodHJhY2ssIHRyYWNrTm9kZSwgdHJhY2tBcnIpKVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldCBhIHRyYWNrIGh0bWwgdG8gYmUgcGxhY2VkIGFzIGEgbGlzdCBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5RGF0ZSAtIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgZGF0ZS5cclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQbGF5bGlzdFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4sIGRpc3BsYXlEYXRlOiBib29sZWFuID0gdHJ1ZSk6IE5vZGUge1xyXG4gICAgY29uc3QgdHJhY2tOb2RlID0gdHJhY2tMaXN0LmZpbmQoKHgpID0+IHgudXJpID09PSB0aGlzLnVyaSwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgLy8gZm9yIHRoZSB1bmlxdWUgcGxheSBwYXVzZSBJRCBhbHNvIHVzZSB0aGUgZGF0ZSBhZGRlZCB0byBwbGF5bGlzdCBhcyB0aGVyZSBjYW4gYmUgZHVwbGljYXRlcyBvZiBhIHNvbmcgaW4gYSBwbGF5bGlzdC5cclxuICAgIGNvbnN0IHBsYXlQYXVzZUlkID0gdGhpcy5fdXJpICsgdGhpcy5kYXRlQWRkZWRUb1BsYXlsaXN0XHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RUcmFja31cIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtwbGF5UGF1c2VJZH1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiIHRpdGxlPVwicGxheSB0cmFja1wiPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIiBzcmM9XCIke1xyXG4gICAgICB0aGlzLmltYWdlVXJsXHJcbiAgICB9XCIgYWx0PVwiQWxidW0gQ292ZXJcIiB0aXRsZT1cIkFsYnVtIENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmxpbmtzfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubmFtZVxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX1cclxuICAgICAgICAgICAgICAgICAgPC9oND5cclxuICAgICAgICAgICAgICAgIDxhLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dGhpcy5hcnRpc3RzSHRtbH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgICAgJHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlEYXRlXHJcbiAgICAgICAgICAgICAgICAgID8gYDxoNT4ke3RoaXMuZGF0ZUFkZGVkVG9QbGF5bGlzdC50b0xvY2FsZURhdGVTdHJpbmcoKX08L2g1PmBcclxuICAgICAgICAgICAgICAgICAgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbClcclxuXHJcbiAgICAvLyBnZXQgcGxheSBwYXVzZSBidXR0b25cclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ0biA9IGVsPy5jaGlsZE5vZGVzWzFdXHJcbiAgICBpZiAocGxheVBhdXNlQnRuID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxheSBwYXVzZSBidXR0b24gb24gdHJhY2sgd2FzIG5vdCBmb3VuZCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbEVsID0gcGxheVBhdXNlQnRuIGFzIEVsZW1lbnRcclxuICAgIHBsYXlQYXVzZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSwgdHJhY2tMaXN0KSlcclxuXHJcbiAgICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyKHRoaXMudXJpLCBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudCwgdHJhY2tOb2RlKVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICAvKiogR2V0IGEgdHJhY2sgaHRtbCB0byBiZSBwbGFjZWQgYXMgYSBsaXN0IGVsZW1lbnQgb24gYSByYW5rZWQgbGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz59IHRyYWNrTGlzdCAtIGxpc3Qgb2YgdHJhY2tzIHRoYXQgY29udGFpbnMgdGhpcyB0cmFjay5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFuayAtIHRoZSByYW5rIG9mIHRoaXMgY2FyZFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFJhbmtlZFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiwgcmFuazogbnVtYmVyKTogTm9kZSB7XHJcbiAgICBjb25zdCB0cmFja05vZGUgPSB0cmFja0xpc3QuZmluZCgoeCkgPT4geC51cmkgPT09IHRoaXMudXJpLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFRyYWNrfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucmFua2VkVHJhY2tJbnRlcmFjdH0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cIiR7dGhpcy5fdXJpfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgICAgaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh0aGlzLnVyaSkgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgICAgICAgICAgICAgfVwiPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxwPiR7cmFua30uPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCIgc3JjPVwiJHtcclxuICAgICAgdGhpcy5pbWFnZVVybFxyXG4gICAgfVwiIGFsdD1cIkFsYnVtIENvdmVyXCIgdGl0bGU9XCJBbGJ1bSBDb3ZlclwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5saW5rc31cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3RoaXMuZXh0ZXJuYWxVcmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5hbWVcclxuICAgIH1cIj4ke3RoaXMudGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8YS8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlxyXG4gICAgICAgICAgICAgICAgICAke3RoaXMuYXJ0aXN0c0h0bWx9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aDU+JHt0aGlzLl9kdXJhdGlvbn08L2g1PlxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKVxyXG5cclxuICAgIC8vIGdldCBwbGF5IHBhdXNlIGJ1dHRvblxyXG4gICAgY29uc3QgcGxheVBhdXNlQnRuID0gZWw/LmNoaWxkTm9kZXNbMV0uY2hpbGROb2Rlc1sxXVxyXG5cclxuICAgIGlmIChwbGF5UGF1c2VCdG4gPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGF5IHBhdXNlIGJ1dHRvbiBvbiB0cmFjayB3YXMgbm90IGZvdW5kJylcclxuICAgIH1cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudFxyXG5cclxuICAgIC8vIHNlbGVjdCB0aGUgcmFuayBhcmVhIGFzIHRvIGtlZXAgdGhlIHBsYXkvcGF1c2UgaWNvbiBzaG93blxyXG4gICAgY29uc3QgcmFua2VkSW50ZXJhY3QgPSAoZWwgYXMgSFRNTEVsZW1lbnQpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnJhbmtlZFRyYWNrSW50ZXJhY3QpWzBdXHJcbiAgICB0aGlzLm9uUGxheWluZyA9ICgpID0+IHJhbmtlZEludGVyYWN0LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5vblN0b3BwZWQgPSAoKSA9PiByYW5rZWRJbnRlcmFjdC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuXHJcbiAgICBwbGF5UGF1c2VCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSwgdHJhY2tMaXN0KVxyXG4gICAgfSlcclxuXHJcbiAgICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyKHRoaXMudXJpLCBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudCwgdHJhY2tOb2RlKVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICAvKiogTG9hZCB0aGUgZmVhdHVyZXMgb2YgdGhpcyB0cmFjayBmcm9tIHRoZSBzcG90aWZ5IHdlYiBhcGkuICovXHJcbiAgcHVibGljIGFzeW5jIGxvYWRGZWF0dXJlcyAoKSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvc1xyXG4gICAgICAuZ2V0KGNvbmZpZy5VUkxzLmdldFRyYWNrRmVhdHVyZXMgKyB0aGlzLmlkKVxyXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgIHRocm93IGVyclxyXG4gICAgICB9KVxyXG4gICAgY29uc3QgZmVhdHMgPSByZXMuZGF0YS5hdWRpb19mZWF0dXJlc1xyXG4gICAgdGhpcy5mZWF0dXJlcyA9IHtcclxuICAgICAgZGFuY2VhYmlsaXR5OiBmZWF0cy5kYW5jZWFiaWxpdHksXHJcbiAgICAgIGFjb3VzdGljbmVzczogZmVhdHMuYWNvdXN0aWNuZXNzLFxyXG4gICAgICBpbnN0cnVtZW50YWxuZXNzOiBmZWF0cy5pbnN0cnVtZW50YWxuZXNzLFxyXG4gICAgICB2YWxlbmNlOiBmZWF0cy52YWxlbmNlLFxyXG4gICAgICBlbmVyZ3k6IGZlYXRzLmVuZXJneVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmZlYXR1cmVzXHJcbiAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJhdGUgdHJhY2tzIGZyb20gZGF0YSBleGNsdWRpbmcgZGF0ZSBhZGRlZC5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxUcmFja0RhdGE+fSBkYXRhc1xyXG4gKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgQXJyYXk8VHJhY2s+fSB0cmFja3MgLSBkb3VibGUgbGlua2VkIGxpc3RcclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhIChkYXRhczogQXJyYXk8VHJhY2tEYXRhPiwgdHJhY2tzOiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IEFycmF5PFRyYWNrPikge1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IGRhdGEgPSBkYXRhc1tpXVxyXG4gICAgaWYgKGRhdGEpIHtcclxuICAgICAgY29uc3QgcHJvcHMgPSB7XHJcbiAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICBpbWFnZXM6IGRhdGEuYWxidW0uaW1hZ2VzLFxyXG4gICAgICAgIGR1cmF0aW9uOiBkYXRhLmR1cmF0aW9uX21zLFxyXG4gICAgICAgIHVyaTogZGF0YS5saW5rZWRfZnJvbSAhPT0gdW5kZWZpbmVkID8gZGF0YS5saW5rZWRfZnJvbS51cmkgOiBkYXRhLnVyaSxcclxuICAgICAgICBwb3B1bGFyaXR5OiBkYXRhLnBvcHVsYXJpdHksXHJcbiAgICAgICAgcmVsZWFzZURhdGU6IGRhdGEuYWxidW0ucmVsZWFzZV9kYXRlLFxyXG4gICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgIGFsYnVtOiBuZXcgQWxidW0oZGF0YS5hbGJ1bS5uYW1lLCBkYXRhLmFsYnVtLmV4dGVybmFsX3VybHMuc3BvdGlmeSksXHJcbiAgICAgICAgZXh0ZXJuYWxVcmxzOiBkYXRhLmV4dGVybmFsX3VybHMsXHJcbiAgICAgICAgYXJ0aXN0czogZGF0YS5hcnRpc3RzLFxyXG4gICAgICAgIGlkeDogaVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRyYWNrcykpIHtcclxuICAgICAgICB0cmFja3MucHVzaChuZXcgVHJhY2socHJvcHMpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRyYWNrcy5hZGQobmV3IFRyYWNrKHByb3BzKSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHJhY2tzXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyYWNrXHJcbiIsIlxyXG5pbXBvcnQgeyBJUHJvbWlzZUhhbmRsZXJSZXR1cm4sIFNwb3RpZnlJbWcgfSBmcm9tICcuLi90eXBlcydcclxuaW1wb3J0IHsgVEVSTVMsIFRFUk1fVFlQRSB9IGZyb20gJy4vY29tcG9uZW50cy9zYXZlLWxvYWQtdGVybSdcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY29uc3QgYXV0aEVuZHBvaW50ID0gJ2h0dHBzOi8vYWNjb3VudHMuc3BvdGlmeS5jb20vYXV0aG9yaXplJ1xyXG4vLyBSZXBsYWNlIHdpdGggeW91ciBhcHAncyBjbGllbnQgSUQsIHJlZGlyZWN0IFVSSSBhbmQgZGVzaXJlZCBzY29wZXNcclxuZXhwb3J0IGNvbnN0IHJlZGlyZWN0VXJpID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCdcclxuY29uc3QgY2xpZW50SWQgPSAnNDM0ZjVlOWY0NDJhNGU0NTg2ZTA4OWEzM2Y2NWM4NTcnXHJcbmNvbnN0IHNjb3BlcyA9IFtcclxuICAndXNlci1yZWFkLXBsYXliYWNrLXN0YXRlJyxcclxuICAndXNlci1tb2RpZnktcGxheWJhY2stc3RhdGUnLFxyXG4gICd1c2VyLXJlYWQtY3VycmVudGx5LXBsYXlpbmcnLFxyXG4gICdzdHJlYW1pbmcnLFxyXG4gICd1c2VyLXJlYWQtZW1haWwnLFxyXG4gICd1c2VyLXJlYWQtcHJpdmF0ZScsXHJcbiAgJ3BsYXlsaXN0LXJlYWQtY29sbGFib3JhdGl2ZScsXHJcbiAgJ3BsYXlsaXN0LXJlYWQtcHJpdmF0ZScsXHJcbiAgJ3BsYXlsaXN0LW1vZGlmeS1wcml2YXRlJyxcclxuICAndXNlci1saWJyYXJ5LXJlYWQnLFxyXG4gICd1c2VyLXRvcC1yZWFkJyxcclxuICAndXNlci1yZWFkLXJlY2VudGx5LXBsYXllZCcsXHJcbiAgJ3VzZXItZm9sbG93LXJlYWQnXHJcbl1cclxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcclxuICBDU1M6IHtcclxuICAgIElEczoge1xyXG4gICAgICBnZXRUb2tlbkxvYWRpbmdTcGlubmVyOiAnZ2V0LXRva2VuLWxvYWRpbmctc3Bpbm5lcicsXHJcbiAgICAgIHBsYXlsaXN0Q2FyZHNDb250YWluZXI6ICdwbGF5bGlzdC1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICB0cmFja0NhcmRzQ29udGFpbmVyOiAndHJhY2stY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgcGxheWxpc3RQcmVmaXg6ICdwbGF5bGlzdC0nLFxyXG4gICAgICB0cmFja1ByZWZpeDogJ3RyYWNrLScsXHJcbiAgICAgIHNwb3RpZnlDb250YWluZXI6ICdzcG90aWZ5LWNvbnRhaW5lcicsXHJcbiAgICAgIGluZm9Db250YWluZXI6ICdpbmZvLWNvbnRhaW5lcicsXHJcbiAgICAgIGFsbG93QWNjZXNzSGVhZGVyOiAnYWxsb3ctYWNjZXNzLWhlYWRlcicsXHJcbiAgICAgIGV4cGFuZGVkUGxheWxpc3RNb2RzOiAnZXhwYW5kZWQtcGxheWxpc3QtbW9kcycsXHJcbiAgICAgIHRyYWNrc0RhdGE6ICd0cmFja3MtZGF0YScsXHJcbiAgICAgIHRyYWNrc0NoYXJ0OiAndHJhY2tzLWNoYXJ0JyxcclxuICAgICAgdHJhY2tzVGVybVNlbGVjdGlvbnM6ICd0cmFja3MtdGVybS1zZWxlY3Rpb25zJyxcclxuICAgICAgZmVhdHVyZVNlbGVjdGlvbnM6ICdmZWF0dXJlLXNlbGVjdGlvbnMnLFxyXG4gICAgICBwbGF5bGlzdHNTZWN0aW9uOiAncGxheWxpc3RzLXNlY3Rpb24nLFxyXG4gICAgICBmZWF0RGVmOiAnZmVhdC1kZWZpbml0aW9uJyxcclxuICAgICAgZmVhdEF2ZXJhZ2U6ICdmZWF0LWF2ZXJhZ2UnLFxyXG4gICAgICByYW5rOiAncmFuaycsXHJcbiAgICAgIHZpZXdBbGxUb3BUcmFja3M6ICd2aWV3LWFsbC10b3AtdHJhY2tzJyxcclxuICAgICAgZW1vamlzOiAnZW1vamlzJyxcclxuICAgICAgYXJ0aXN0Q2FyZHNDb250YWluZXI6ICdhcnRpc3QtY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgYXJ0aXN0UHJlZml4OiAnYXJ0aXN0LScsXHJcbiAgICAgIGluaXRpYWxDYXJkOiAnaW5pdGlhbC1jYXJkJyxcclxuICAgICAgY29udmVydENhcmQ6ICdjb252ZXJ0LWNhcmQnLFxyXG4gICAgICBhcnRpc3RUZXJtU2VsZWN0aW9uczogJ2FydGlzdHMtdGVybS1zZWxlY3Rpb25zJyxcclxuICAgICAgcHJvZmlsZUhlYWRlcjogJ3Byb2ZpbGUtaGVhZGVyJyxcclxuICAgICAgY2xlYXJEYXRhOiAnY2xlYXItZGF0YScsXHJcbiAgICAgIGxpa2VkVHJhY2tzOiAnbGlrZWQtdHJhY2tzJyxcclxuICAgICAgZm9sbG93ZWRBcnRpc3RzOiAnZm9sbG93ZWQtYXJ0aXN0cycsXHJcbiAgICAgIHdlYlBsYXllcjogJ3dlYi1wbGF5ZXInLFxyXG4gICAgICBwbGF5VGltZUJhcjogJ3BsYXl0aW1lLWJhcicsXHJcbiAgICAgIHBsYXlsaXN0SGVhZGVyQXJlYTogJ3BsYXlsaXN0LW1haW4taGVhZGVyLWFyZWEnLFxyXG4gICAgICBwbGF5TmV4dDogJ3BsYXktbmV4dCcsXHJcbiAgICAgIHBsYXlQcmV2OiAncGxheS1wcmV2JyxcclxuICAgICAgd2ViUGxheWVyUGxheVBhdXNlOiAncGxheS1wYXVzZS1wbGF5ZXInLFxyXG4gICAgICB3ZWJQbGF5ZXJWb2x1bWU6ICd3ZWItcGxheWVyLXZvbHVtZS1iYXInLFxyXG4gICAgICB3ZWJQbGF5ZXJQcm9ncmVzczogJ3dlYi1wbGF5ZXItcHJvZ3Jlc3MtYmFyJyxcclxuICAgICAgcGxheWVyVHJhY2tJbWc6ICdwbGF5ZXItdHJhY2staW1nJyxcclxuICAgICAgd2ViUGxheWVyQXJ0aXN0czogJ3dlYi1wbGF5ZXItYXJ0aXN0cycsXHJcbiAgICAgIGdlbmVyYXRlUGxheWxpc3Q6ICdnZW5lcmF0ZS1wbGF5bGlzdCcsXHJcbiAgICAgIGhpZGVTaG93UGxheWxpc3RUeHQ6ICdoaWRlLXNob3ctcGxheWxpc3QtdHh0JyxcclxuICAgICAgdG9wVHJhY2tzVGV4dEZvcm1Db250YWluZXI6ICd0ZXJtLXRleHQtZm9ybS1jb250YWluZXInLFxyXG4gICAgICB1c2VybmFtZTogJ3VzZXJuYW1lJyxcclxuICAgICAgdG9wTmF2TW9iaWxlOiAndG9wbmF2LW1vYmlsZScsXHJcbiAgICAgIHNodWZmbGU6ICdzaHVmZmxlJyxcclxuICAgICAgaG9tZUhlYWRlcjogJ2hvbWUtaGVhZGVyJyxcclxuICAgICAgbG9vcDogJ2xvb3AnXHJcbiAgICB9LFxyXG4gICAgQ0xBU1NFUzoge1xyXG4gICAgICBnbG93OiAnZ2xvdycsXHJcbiAgICAgIHBsYXlsaXN0OiAncGxheWxpc3QnLFxyXG4gICAgICB0cmFjazogJ3RyYWNrJyxcclxuICAgICAgYXJ0aXN0OiAnYXJ0aXN0JyxcclxuICAgICAgcmFua0NhcmQ6ICdyYW5rLWNhcmQnLFxyXG4gICAgICBwbGF5bGlzdFRyYWNrOiAncGxheWxpc3QtdHJhY2snLFxyXG4gICAgICBpbmZvTG9hZGluZ1NwaW5uZXJzOiAnaW5mby1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBhcHBlYXI6ICdhcHBlYXInLFxyXG4gICAgICBoaWRlOiAnaGlkZScsXHJcbiAgICAgIHNlbGVjdGVkOiAnc2VsZWN0ZWQnLFxyXG4gICAgICBjYXJkOiAnY2FyZCcsXHJcbiAgICAgIHBsYXlsaXN0U2VhcmNoOiAncGxheWxpc3Qtc2VhcmNoJyxcclxuICAgICAgZWxsaXBzaXNXcmFwOiAnZWxsaXBzaXMtd3JhcCcsXHJcbiAgICAgIG5hbWU6ICduYW1lJyxcclxuICAgICAgcGxheWxpc3RPcmRlcjogJ3BsYXlsaXN0LW9yZGVyJyxcclxuICAgICAgY2hhcnRJbmZvOiAnY2hhcnQtaW5mbycsXHJcbiAgICAgIGZsaXBDYXJkSW5uZXI6ICdmbGlwLWNhcmQtaW5uZXInLFxyXG4gICAgICBmbGlwQ2FyZEZyb250OiAnZmxpcC1jYXJkLWZyb250JyxcclxuICAgICAgZmxpcENhcmRCYWNrOiAnZmxpcC1jYXJkLWJhY2snLFxyXG4gICAgICBmbGlwQ2FyZDogJ2ZsaXAtY2FyZCcsXHJcbiAgICAgIHJlc2l6ZUNvbnRhaW5lcjogJ3Jlc2l6ZS1jb250YWluZXInLFxyXG4gICAgICBzY3JvbGxMZWZ0OiAnc2Nyb2xsLWxlZnQnLFxyXG4gICAgICBzY3JvbGxpbmdUZXh0OiAnc2Nyb2xsaW5nLXRleHQnLFxyXG4gICAgICBub1NlbGVjdDogJ25vLXNlbGVjdCcsXHJcbiAgICAgIGRyb3BEb3duOiAnZHJvcC1kb3duJyxcclxuICAgICAgZXhwYW5kYWJsZVR4dENvbnRhaW5lcjogJ2V4cGFuZGFibGUtdGV4dC1jb250YWluZXInLFxyXG4gICAgICBib3JkZXJDb3ZlcjogJ2JvcmRlci1jb3ZlcicsXHJcbiAgICAgIGZpcnN0RXhwYW5zaW9uOiAnZmlyc3QtZXhwYW5zaW9uJyxcclxuICAgICAgc2Vjb25kRXhwYW5zaW9uOiAnc2Vjb25kLWV4cGFuc2lvbicsXHJcbiAgICAgIGludmlzaWJsZTogJ2ludmlzaWJsZScsXHJcbiAgICAgIGZhZGVJbjogJ2ZhZGUtaW4nLFxyXG4gICAgICBmcm9tVG9wOiAnZnJvbS10b3AnLFxyXG4gICAgICBleHBhbmRPbkhvdmVyOiAnZXhwYW5kLW9uLWhvdmVyJyxcclxuICAgICAgdHJhY2tzQXJlYTogJ3RyYWNrcy1hcmVhJyxcclxuICAgICAgc2Nyb2xsQmFyOiAnc2Nyb2xsLWJhcicsXHJcbiAgICAgIHRyYWNrTGlzdDogJ3RyYWNrLWxpc3QnLFxyXG4gICAgICBhcnRpc3RUb3BUcmFja3M6ICdhcnRpc3QtdG9wLXRyYWNrcycsXHJcbiAgICAgIHRleHRGb3JtOiAndGV4dC1mb3JtJyxcclxuICAgICAgY29udGVudDogJ2NvbnRlbnQnLFxyXG4gICAgICBsaW5rczogJ2xpbmtzJyxcclxuICAgICAgcHJvZ3Jlc3M6ICdwcm9ncmVzcycsXHJcbiAgICAgIHBsYXlQYXVzZTogJ3BsYXktcGF1c2UnLFxyXG4gICAgICByYW5rZWRUcmFja0ludGVyYWN0OiAncmFua2VkLWludGVyYWN0aW9uLWFyZWEnLFxyXG4gICAgICBzbGlkZXI6ICdzbGlkZXInLFxyXG4gICAgICBwbGF5QnRuOiAncGxheS1idG4nLFxyXG4gICAgICBkaXNwbGF5Tm9uZTogJ2Rpc3BsYXktbm9uZScsXHJcbiAgICAgIGNvbHVtbjogJ2NvbHVtbicsXHJcbiAgICAgIHdlYlBsYXllckNvbnRyb2xzOiAnd2ViLXBsYXllci1jb250cm9scydcclxuICAgIH0sXHJcbiAgICBBVFRSSUJVVEVTOiB7XHJcbiAgICAgIGRhdGFTZWxlY3Rpb246ICdkYXRhLXNlbGVjdGlvbicsXHJcbiAgICAgIHJlc3RyaWN0RmxpcE9uQ2xpY2s6ICdkYXRhLXJlc3RyaWN0LWZsaXAtb24tY2xpY2snXHJcbiAgICB9XHJcbiAgfSxcclxuICBVUkxzOiB7XHJcbiAgICBzaXRlVXJsOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgIGF1dGg6IGAke2F1dGhFbmRwb2ludH0/Y2xpZW50X2lkPSR7Y2xpZW50SWR9JnJlZGlyZWN0X3VyaT0ke3JlZGlyZWN0VXJpfSZzY29wZT0ke3Njb3Blcy5qb2luKFxyXG4gICAgICAnJTIwJ1xyXG4gICAgKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNob3dfZGlhbG9nPXRydWVgLFxyXG4gICAgZ2V0SGFzVG9rZW5zOiAnL3Rva2Vucy9oYXMtdG9rZW5zJyxcclxuICAgIGdldEFjY2Vzc1Rva2VuOiAnL3Rva2Vucy9nZXQtYWNjZXNzLXRva2VuJyxcclxuICAgIGdldE9idGFpblRva2Vuc1ByZWZpeDogKGNvZGU6IHN0cmluZykgPT4gYC90b2tlbnMvb2J0YWluLXRva2Vucz9jb2RlPSR7Y29kZX1gLFxyXG4gICAgZ2V0VG9wQXJ0aXN0czogJy9zcG90aWZ5L2dldC10b3AtYXJ0aXN0cz90aW1lX3JhbmdlPScsXHJcbiAgICBnZXRUb3BUcmFja3M6ICcvc3BvdGlmeS9nZXQtdG9wLXRyYWNrcz90aW1lX3JhbmdlPScsXHJcbiAgICBnZXRQbGF5bGlzdHM6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3RzJyxcclxuICAgIGdldFBsYXlsaXN0VHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0LXRyYWNrcz9wbGF5bGlzdF9pZD0nLFxyXG4gICAgcHV0Q2xlYXJUb2tlbnM6ICcvdG9rZW5zL2NsZWFyLXRva2VucycsXHJcbiAgICBkZWxldGVQbGF5bGlzdFRyYWNrczogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L2RlbGV0ZS1wbGF5bGlzdC1pdGVtcz9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIHBvc3RQbGF5bGlzdFRyYWNrczogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtcGxheWxpc3QtaXRlbXM/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBnZXRUcmFja0ZlYXR1cmVzOiAnL3Nwb3RpZnkvZ2V0LXRyYWNrcy1mZWF0dXJlcz90cmFja19pZHM9JyxcclxuICAgIHB1dFJlZnJlc2hBY2Nlc3NUb2tlbjogJy90b2tlbnMvcmVmcmVzaC10b2tlbicsXHJcbiAgICBwdXRTZXNzaW9uRGF0YTogJy9zcG90aWZ5L3B1dC1zZXNzaW9uLWRhdGE/YXR0cj0nLFxyXG4gICAgcHV0UGxheWxpc3RSZXNpemVEYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtcGxheWxpc3QtcmVzaXplLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5bGlzdFJlc2l6ZURhdGE6ICcvdXNlci9nZXQtcGxheWxpc3QtcmVzaXplLWRhdGEnLFxyXG4gICAgcHV0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtcGxheWxpc3QtdGV4dC1mb3JtLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGE6ICcvdXNlci9nZXQtcGxheWxpc3QtdGV4dC1mb3JtLWRhdGEnLFxyXG4gICAgcHV0VG9wVHJhY2tzSXNJblRleHRGb3JtRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXRvcC10cmFja3MtdGV4dC1mb3JtLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRUb3BUcmFja3NJc0luVGV4dEZvcm1EYXRhOiAnL3VzZXIvZ2V0LXRvcC10cmFja3MtdGV4dC1mb3JtLWRhdGEnLFxyXG4gICAgZ2V0QXJ0aXN0VG9wVHJhY2tzOiAoaWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L2dldC1hcnRpc3QtdG9wLXRyYWNrcz9pZD0ke2lkfWAsXHJcbiAgICBnZXRDdXJyZW50VXNlclByb2ZpbGU6ICcvc3BvdGlmeS9nZXQtY3VycmVudC11c2VyLXByb2ZpbGUnLFxyXG4gICAgcHV0Q2xlYXJTZXNzaW9uOiAnL2NsZWFyLXNlc3Npb24nLFxyXG4gICAgZ2V0Q3VycmVudFVzZXJTYXZlZFRyYWNrczogJy9zcG90aWZ5L2dldC1jdXJyZW50LXVzZXItc2F2ZWQtdHJhY2tzJyxcclxuICAgIGdldEZvbGxvd2VkQXJ0aXN0czogJy9zcG90aWZ5L2dldC1mb2xsb3dlZC1hcnRpc3RzJyxcclxuICAgIHB1dFBsYXlUcmFjazogKGRldmljZV9pZDogc3RyaW5nLCB0cmFja191cmk6IHN0cmluZykgPT5cclxuICAgICAgYC9zcG90aWZ5L3BsYXktdHJhY2s/ZGV2aWNlX2lkPSR7ZGV2aWNlX2lkfSZ0cmFja191cmk9JHt0cmFja191cml9YCxcclxuICAgIHB1dFBsYXllclZvbHVtZURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5ZXItdm9sdW1lP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWVyVm9sdW1lRGF0YTogJy91c2VyL2dldC1wbGF5ZXItdm9sdW1lJyxcclxuICAgIHB1dFRlcm06ICh0ZXJtOiBURVJNUywgdGVybVR5cGU6IFRFUk1fVFlQRSkgPT4gYC91c2VyL3B1dC10b3AtJHt0ZXJtVHlwZX0tdGVybT90ZXJtPSR7dGVybX1gLFxyXG4gICAgZ2V0VGVybTogKHRlcm1UeXBlOiBURVJNX1RZUEUpID0+IGAvdXNlci9nZXQtdG9wLSR7dGVybVR5cGV9LXRlcm1gLFxyXG4gICAgcHV0Q3VyclBsYXlsaXN0SWQ6IChpZDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LWN1cnJlbnQtcGxheWxpc3QtaWQ/aWQ9JHtpZH1gLFxyXG4gICAgZ2V0Q3VyclBsYXlsaXN0SWQ6ICcvdXNlci9nZXQtY3VycmVudC1wbGF5bGlzdC1pZCcsXHJcbiAgICBwb3N0UGxheWxpc3Q6IChuYW1lOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LXBsYXlsaXN0P25hbWU9JHtuYW1lfWAsXHJcbiAgICBwb3N0SXRlbXNUb1BsYXlsaXN0OiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1pdGVtcy10by1wbGF5bGlzdD9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIGdldFVzZXJuYW1lOiAnL3VzZXIvZ2V0LXVzZXJuYW1lJ1xyXG4gIH0sXHJcbiAgUEFUSFM6IHtcclxuICAgIHNwaW5uZXI6ICcvaW1hZ2VzLzIwMHB4TG9hZGluZ1NwaW5uZXIuc3ZnJyxcclxuICAgIGdyaWRWaWV3OiAnL2ltYWdlcy9ncmlkLXZpZXctaWNvbi5wbmcnLFxyXG4gICAgbGlzdFZpZXc6ICcvaW1hZ2VzL2xpc3Qtdmlldy1pY29uLnBuZycsXHJcbiAgICBjaGV2cm9uTGVmdDogJy9pbWFnZXMvY2hldnJvbi1sZWZ0LnBuZycsXHJcbiAgICBjaGV2cm9uUmlnaHQ6ICcvaW1hZ2VzL2NoZXZyb24tcmlnaHQucG5nJyxcclxuICAgIHBsYXlJY29uOiAnL2ltYWdlcy9wbGF5LTMwcHgucG5nJyxcclxuICAgIHBhdXNlSWNvbjogJy9pbWFnZXMvcGF1c2UtMzBweC5wbmcnLFxyXG4gICAgcGxheUJsYWNrSWNvbjogJy9pbWFnZXMvcGxheS1ibGFjay0zMHB4LnBuZycsXHJcbiAgICBwYXVzZUJsYWNrSWNvbjogJy9pbWFnZXMvcGF1c2UtYmxhY2stMzBweC5wbmcnLFxyXG4gICAgcGxheU5leHQ6ICcvaW1hZ2VzL25leHQtMzBweC5wbmcnLFxyXG4gICAgcGxheVByZXY6ICcvaW1hZ2VzL3ByZXZpb3VzLTMwcHgucG5nJyxcclxuICAgIHByb2ZpbGVVc2VyOiAnL2ltYWdlcy9wcm9maWxlLXVzZXIucG5nJyxcclxuICAgIHNodWZmbGVJY29uOiAnL2ltYWdlcy9zaHVmZmxlLWljb24ucG5nJyxcclxuICAgIHNodWZmbGVJY29uR3JlZW46ICcvaW1hZ2VzL3NodWZmbGUtaWNvbi1ncmVlbi5wbmcnLFxyXG4gICAgbG9vcEljb246ICcvaW1hZ2VzL2xvb3AtaWNvbi5wbmcnLFxyXG4gICAgbG9vcEljb25HcmVlbjogJy9pbWFnZXMvbG9vcC1pY29uLWdyZWVuLnBuZydcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzIChtaWxsaXM6IG51bWJlcikge1xyXG4gIGNvbnN0IG1pbnV0ZXM6IG51bWJlciA9IE1hdGguZmxvb3IobWlsbGlzIC8gNjAwMDApXHJcbiAgY29uc3Qgc2Vjb25kczogbnVtYmVyID0gcGFyc2VJbnQoKChtaWxsaXMgJSA2MDAwMCkgLyAxMDAwKS50b0ZpeGVkKDApKVxyXG4gIHJldHVybiBzZWNvbmRzID09PSA2MFxyXG4gICAgPyBtaW51dGVzICsgMSArICc6MDAnXHJcbiAgICA6IG1pbnV0ZXMgKyAnOicgKyAoc2Vjb25kcyA8IDEwID8gJzAnIDogJycpICsgc2Vjb25kc1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBodG1sVG9FbCAoaHRtbDogc3RyaW5nKSB7XHJcbiAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJylcclxuICBodG1sID0gaHRtbC50cmltKCkgLy8gTmV2ZXIgcmV0dXJuIGEgc3BhY2UgdGV4dCBub2RlIGFzIGEgcmVzdWx0XHJcbiAgdGVtcC5pbm5lckhUTUwgPSBodG1sXHJcbiAgcmV0dXJuIHRlbXAuY29udGVudC5maXJzdENoaWxkXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9taXNlSGFuZGxlcjxUPiAoXHJcbiAgcHJvbWlzZTogUHJvbWlzZTxUPixcclxuICBvblN1Y2Nlc2Z1bCA9IChyZXM6IFQpID0+IHsgfSxcclxuICBvbkZhaWx1cmUgPSAoZXJyOiB1bmtub3duKSA9PiB7XHJcbiAgICBpZiAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxyXG4gICAgfVxyXG4gIH1cclxuKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHByb21pc2VcclxuICAgIG9uU3VjY2VzZnVsKHJlcyBhcyBUKVxyXG4gICAgcmV0dXJuIHsgcmVzOiByZXMsIGVycjogbnVsbCB9IGFzIElQcm9taXNlSGFuZGxlclJldHVybjxUPlxyXG4gIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xyXG4gICAgb25GYWlsdXJlKGVycilcclxuICAgIHJldHVybiB7IHJlczogbnVsbCwgZXJyOiBlcnIgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9XHJcbn1cclxuXHJcbi8qKiBGaWx0ZXJzICdsaScgZWxlbWVudHMgdG8gZWl0aGVyIGJlIGhpZGRlbiBvciBub3QgZGVwZW5kaW5nIG9uIGlmXHJcbiAqIHRoZXkgY29udGFpbiBzb21lIGdpdmVuIGlucHV0IHRleHQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7SFRNTH0gdWwgLSB1bm9yZGVyZWQgbGlzdCBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlICdsaScgdG8gYmUgZmlsdGVyZWRcclxuICogQHBhcmFtIHtIVE1MfSBpbnB1dCAtIGlucHV0IGVsZW1lbnQgd2hvc2UgdmFsdWUgd2lsbCBiZSB1c2VkIHRvIGZpbHRlclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RkRGlzcGxheSAtIHRoZSBzdGFuZGFyZCBkaXNwbGF5IHRoZSAnbGknIHNob3VsZCBoYXZlIHdoZW4gbm90ICdub25lJ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFVsICh1bDogSFRNTFVMaXN0RWxlbWVudCwgaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQsIHN0ZERpc3BsYXk6IHN0cmluZyA9ICdmbGV4Jyk6IHZvaWQge1xyXG4gIGNvbnN0IGxpRWxzID0gdWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJylcclxuICBjb25zdCBmaWx0ZXIgPSBpbnB1dC52YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGlFbHMubGVuZ3RoOyBpKyspIHtcclxuICAgIC8vIGdldCB0aGUgbmFtZSBjaGlsZCBlbCBpbiB0aGUgbGkgZWxcclxuICAgIGNvbnN0IG5hbWUgPSBsaUVsc1tpXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lKVswXVxyXG4gICAgY29uc3QgbmFtZVR4dCA9IG5hbWUudGV4dENvbnRlbnQgfHwgbmFtZS5pbm5lckhUTUxcclxuXHJcbiAgICBpZiAobmFtZVR4dCAmJiBuYW1lVHh0LnRvVXBwZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXIpID4gLTEpIHtcclxuICAgICAgLy8gc2hvdyBsaSdzIHdob3NlIG5hbWUgY29udGFpbnMgdGhlIHRoZSBlbnRlcmVkIHN0cmluZ1xyXG4gICAgICBsaUVsc1tpXS5zdHlsZS5kaXNwbGF5ID0gc3RkRGlzcGxheVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gb3RoZXJ3aXNlIGhpZGUgaXRcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFVzZXMgY2FudmFzLm1lYXN1cmVUZXh0IHRvIGNvbXB1dGUgYW5kIHJldHVybiB0aGUgd2lkdGggb2YgdGhlIGdpdmVuIHRleHQgb2YgZ2l2ZW4gZm9udCBpbiBwaXhlbHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IHRvIGJlIHJlbmRlcmVkLlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZm9udCBUaGUgY3NzIGZvbnQgZGVzY3JpcHRvciB0aGF0IHRleHQgaXMgdG8gYmUgcmVuZGVyZWQgd2l0aCAoZS5nLiBcImJvbGQgMTRweCB2ZXJkYW5hXCIpLlxyXG4gKlxyXG4gKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExODI0MS9jYWxjdWxhdGUtdGV4dC13aWR0aC13aXRoLWphdmFzY3JpcHQvMjEwMTUzOTMjMjEwMTUzOTNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXh0V2lkdGggKHRleHQ6IHN0cmluZywgZm9udDogc3RyaW5nKSB7XHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuICBsZXQgbWV0cmljczogVGV4dE1ldHJpY3NcclxuICBpZiAoY29udGV4dCkge1xyXG4gICAgY29udGV4dC5mb250ID0gZm9udFxyXG4gICAgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQodGV4dClcclxuICAgIHJldHVybiBtZXRyaWNzLndpZHRoXHJcbiAgfVxyXG5cclxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbnRleHQgb24gY3JlYXRlZCBjYW52YXMgd2FzIGZvdW5kJylcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRWxsaXBzaXNBY3RpdmUgKGVsOiBIVE1MRWxlbWVudCkge1xyXG4gIHJldHVybiBlbC5vZmZzZXRXaWR0aCA8IGVsLnNjcm9sbFdpZHRoXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYXBpdGFsaXplRmlyc3RMZXR0ZXIgKHN0cmluZzogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsaWRJbWFnZSAoaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPiwgaWR4ID0gMCkge1xyXG4gIC8vIG9idGFpbiB0aGUgY29ycmVjdCBpbWFnZVxyXG4gIGlmIChpbWFnZXMubGVuZ3RoID4gaWR4KSB7XHJcbiAgICBjb25zdCBpbWcgPSBpbWFnZXNbaWR4XVxyXG4gICAgcmV0dXJuIGltZy51cmxcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuICcnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQWxsQ2hpbGROb2RlcyAocGFyZW50OiBOb2RlKSB7XHJcbiAgd2hpbGUgKHBhcmVudC5maXJzdENoaWxkKSB7XHJcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50LmZpcnN0Q2hpbGQpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYW5pbWF0aW9uQ29udHJvbCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgLyoqIEFkZHMgYSBjbGFzcyB0byBlYWNoIGVsZW1lbnQgY2F1c2luZyBhIHRyYW5zaXRpb24gdG8gdGhlIGNoYW5nZWQgY3NzIHZhbHVlcy5cclxuICAgKiBUaGlzIGlzIGRvbmUgb24gc2V0IGludGVydmFscy5cclxuICAgKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVsZW1lbnRzVG9BbmltYXRlIC0gY29tbWEgc2VwYXJhdGVkIHN0cmluZyBjb250YWluaW5nIHRoZSBjbGFzc2VzIG9yIGlkcyBvZiBlbGVtZW50cyB0byBhbmltYXRlIGluY2x1ZGluZyBwcmVmaXggY2hhci5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NUb1RyYW5zaXRpb25Ub28gLSBUaGUgY2xhc3MgdGhhdCBhbGwgdGhlIHRyYW5zaXRpb25pbmcgZWxlbWVudHMgd2lsbCBhZGRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5pbWF0aW9uSW50ZXJ2YWwgLSBUaGUgaW50ZXJ2YWwgdG8gd2FpdCBiZXR3ZWVuIGFuaW1hdGlvbiBvZiBlbGVtZW50c1xyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZENsYXNzT25JbnRlcnZhbCAoXHJcbiAgICBlbGVtZW50c1RvQW5pbWF0ZTogc3RyaW5nLFxyXG4gICAgY2xhc3NUb1RyYW5zaXRpb25Ub286IHN0cmluZyxcclxuICAgIGFuaW1hdGlvbkludGVydmFsOiBudW1iZXJcclxuICApIHtcclxuICAgIC8vIGFyciBvZiBodG1sIHNlbGVjdG9ycyB0aGF0IHBvaW50IHRvIGVsZW1lbnRzIHRvIGFuaW1hdGVcclxuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBlbGVtZW50c1RvQW5pbWF0ZS5zcGxpdCgnLCcpXHJcblxyXG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyKSA9PiB7XHJcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChhdHRyKVxyXG4gICAgICBsZXQgaWR4ID0gMFxyXG4gICAgICAvLyBpbiBpbnRlcnZhbHMgcGxheSB0aGVpciBpbml0aWFsIGFuaW1hdGlvbnNcclxuICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKGlkeCA9PT0gZWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50c1tpZHhdXHJcbiAgICAgICAgLy8gYWRkIHRoZSBjbGFzcyB0byB0aGUgZWxlbWVudHMgY2xhc3NlcyBpbiBvcmRlciB0byBydW4gdGhlIHRyYW5zaXRpb25cclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NUb1RyYW5zaXRpb25Ub28pXHJcbiAgICAgICAgaWR4ICs9IDFcclxuICAgICAgfSwgYW5pbWF0aW9uSW50ZXJ2YWwpXHJcbiAgICB9KVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgYWRkQ2xhc3NPbkludGVydmFsXHJcbiAgfVxyXG59KSgpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGl4ZWxQb3NJbkVsT25DbGljayAobW91c2VFdnQ6IE1vdXNlRXZlbnQpOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0ge1xyXG4gIGNvbnN0IHJlY3QgPSAobW91c2VFdnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gIGNvbnN0IHggPSBtb3VzZUV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0IC8vIHggcG9zaXRpb24gd2l0aGluIHRoZSBlbGVtZW50LlxyXG4gIGNvbnN0IHkgPSBtb3VzZUV2dC5jbGllbnRZIC0gcmVjdC50b3AgLy8geSBwb3NpdGlvbiB3aXRoaW4gdGhlIGVsZW1lbnQuXHJcbiAgcmV0dXJuIHsgeCwgeSB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0V4cHJlc3Npb24gKGVycm9yTWVzc2FnZTogc3RyaW5nKTogbmV2ZXIge1xyXG4gIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRJdGVtc1RvUGxheWxpc3QgKHBsYXlsaXN0SWQ6IHN0cmluZywgdXJpczogQXJyYXk8c3RyaW5nPikge1xyXG4gIGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgYXhpb3Moe1xyXG4gICAgICBtZXRob2Q6ICdwb3N0JyxcclxuICAgICAgdXJsOiBjb25maWcuVVJMcy5wb3N0SXRlbXNUb1BsYXlsaXN0KHBsYXlsaXN0SWQpLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgdXJpczogdXJpc1xyXG4gICAgICB9XHJcbiAgICB9KSxcclxuICAgICgpID0+IHt9LCAoKSA9PiB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXNzdWUgYWRkaW5nIGl0ZW1zIHRvIHBsYXlsaXN0JylcclxuICAgIH0pXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaHVmZmxlcyBhIGdpdmVuIGFycmF5IGFuZCByZXR1cm5zIHRoZSBzaHVmZmxlZCB2ZXJzaW9uLlxyXG4gKiBAcGFyYW0ge0FycmF5PFQ+fSBhcnJheSBUaGUgYXJyYXkgdG8gc2h1ZmZsZSBidXQgbm90IG11dGF0ZS5cclxuICogQHJldHVybnMge0FycmF5PFQ+fSBhIHNodWZmbGVkIHZlcnNpb24gb2YgdGhlIGdpdmVuIGFycmF5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGU8VD4gKGFycmF5OiBBcnJheTxUPik6IEFycmF5PFQ+IHtcclxuICBjb25zdCBjbG9uZUFyciA9IFsuLi5hcnJheV1cclxuICBsZXQgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoXHJcbiAgbGV0IHJhbmRvbUluZGV4XHJcblxyXG4gIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgd2hpbGUgKGN1cnJlbnRJbmRleCAhPT0gMCkge1xyXG4gICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleClcclxuICAgIGN1cnJlbnRJbmRleC0tO1xyXG5cclxuICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgIFtjbG9uZUFycltjdXJyZW50SW5kZXhdLCBjbG9uZUFycltyYW5kb21JbmRleF1dID0gW1xyXG4gICAgICBjbG9uZUFycltyYW5kb21JbmRleF0sIGNsb25lQXJyW2N1cnJlbnRJbmRleF1dXHJcbiAgfVxyXG5cclxuICByZXR1cm4gY2xvbmVBcnJcclxufVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyLCB0aHJvd0V4cHJlc3Npb24gfSBmcm9tICcuL2NvbmZpZydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBkaXNwbGF5VXNlcm5hbWUgfSBmcm9tICcuL3VzZXItZGF0YSdcclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgdG8gc2VlIGlmIHRoaXMgdXNlcnMgcmVkaXMgc2Vzc2lvbiBjb250YWlucyBhIHZhbGlkIGFjY2VzcyB0b2tlbiB0byB0aGUgc3BvdGlmeSB3ZWIgYXBpLlxyXG4gKlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gd2hldGhlciB0aGUgcmVkaXMgc2Vzc2lvbiBjb250YWlucyBhIHZhbGlkIGFjY2VzcyB0b2tlbiB0byB0aGUgc3BvdGlmeSB3ZWIgYXBpLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrSWZIYXNUb2tlbnMgKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIGxldCBoYXNUb2tlbiA9IGZhbHNlXHJcbiAgLy8gYXdhaXQgcHJvbWlzZSByZXNvbHZlIHRoYXQgcmV0dXJucyB3aGV0aGVyIHRoZSBzZXNzaW9uIGhhcyB0b2tlbnMuXHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0SGFzVG9rZW5zKSxcclxuICAgIChyZXMpID0+IHtcclxuICAgICAgaGFzVG9rZW4gPSByZXMuZGF0YVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAgcmV0dXJuIGhhc1Rva2VuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBdHRlbXB0cyB0byBvYnRhaW4gdG9rZW4gZnJvbSBzcG90aWZ5IGFwaSB1c2luZyB0aGUgYXV0aCBjb2RlIHJldHJpZXZlZCBmcm9tIHRoZSB1cmwgYWZ0ZXIgYSB1c2VyIGxvZ2luIGhhcyBiZWVuIG1hZGUuXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIGEgdmFsaWQgdG9rZW4gd2FzIHJldHJpZXZlZC5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbnMgKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIGxldCBoYXNUb2tlbiA9IGZhbHNlXHJcbiAgLy8gY3JlYXRlIGEgcGFyYW1ldGVyIHNlYXJjaGVyIGluIHRoZSBVUkwgYWZ0ZXIgJz8nIHdoaWNoIGhvbGRzIHRoZSByZXF1ZXN0cyBib2R5IHBhcmFtZXRlcnNcclxuICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpXHJcblxyXG4gIC8vIEdldCB0aGUgY29kZSBmcm9tIHRoZSBwYXJhbWV0ZXIgY2FsbGVkICdjb2RlJyBpbiB0aGUgdXJsIHdoaWNoXHJcbiAgLy8gaG9wZWZ1bGx5IGNhbWUgYmFjayBmcm9tIHRoZSBzcG90aWZ5IEdFVCByZXF1ZXN0IG90aGVyd2lzZSBpdCBpcyBudWxsXHJcbiAgbGV0IGF1dGhDb2RlID0gdXJsUGFyYW1zLmdldCgnY29kZScpXHJcblxyXG4gIGlmIChhdXRoQ29kZSkge1xyXG4gICAgLy8gb2J0YWluIHRva2Vuc1xyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRPYnRhaW5Ub2tlbnNQcmVmaXgoYXV0aENvZGUpKSxcclxuXHJcbiAgICAgIC8vIGlmIHRoZSByZXF1ZXN0IHdhcyBzdWNjZXNmdWwgd2UgaGF2ZSByZWNpZXZlZCBhIHRva2VuXHJcbiAgICAgICgpID0+IHtcclxuICAgICAgICBoYXNUb2tlbiA9IHRydWVcclxuICAgICAgfVxyXG4gICAgKVxyXG4gICAgYXV0aENvZGUgPSAnJ1xyXG5cclxuICAgIC8vIGdldCB1c2VyIGluZm8gZnJvbSBzcG90aWZ5XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0Q3VycmVudFVzZXJQcm9maWxlKSlcclxuICB9XHJcblxyXG4gIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCAnJywgJy8nKVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgYSBsb2dpbi9jaGFuZ2UgYWNjb3VudCBsaW5rLiBEZWZhdWx0cyB0byBhcHBlbmRpbmcgaXQgb250byB0aGUgbmF2IGJhci5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSBjbGFzc2VzVG9BZGQgLSB0aGUgY2xhc3NlcyB0byBhZGQgb250byB0aGUgbGluay5cclxuICogQHBhcmFtIHtCb29sZWFufSBjaGFuZ2VBY2NvdW50IC0gV2hldGhlciB0aGUgbGluayBzaG91bGQgYmUgZm9yIGNoYW5naW5nIGFjY291bnQsIG9yIGZvciBsb2dnaW5nIGluLiAoZGVmYXVsdHMgdG8gdHJ1ZSlcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50RWwgLSB0aGUgcGFyZW50IGVsZW1lbnQgdG8gYXBwZW5kIHRoZSBsaW5rIG9udG8uIChkZWZhdWx0cyB0byBuYXZiYXIpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVMb2dpbiAoe1xyXG4gIGNsYXNzZXNUb0FkZCA9IFsncmlnaHQnXSxcclxuICBjaGFuZ2VBY2NvdW50ID0gdHJ1ZSxcclxuICBwYXJlbnRFbCA9IGRvY3VtZW50XHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndG9wbmF2JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyaWdodCcpWzBdXHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZHJvcGRvd24tY29udGVudCcpWzBdXHJcbn0gPSB7fSkge1xyXG4gIC8vIENyZWF0ZSBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXHJcbiAgYS5ocmVmID0gY29uZmlnLlVSTHMuYXV0aFxyXG5cclxuICAvLyBDcmVhdGUgdGhlIHRleHQgbm9kZSBmb3IgYW5jaG9yIGVsZW1lbnQuXHJcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgY2hhbmdlQWNjb3VudCA/ICdDaGFuZ2UgQWNjb3VudCcgOiAnTG9naW4gVG8gU3BvdGlmeSdcclxuICApXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgdGV4dCBub2RlIHRvIGFuY2hvciBlbGVtZW50LlxyXG4gIGEuYXBwZW5kQ2hpbGQobGluaylcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXNUb0FkZC5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2xhc3NUb0FkZCA9IGNsYXNzZXNUb0FkZFtpXVxyXG4gICAgYS5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQpXHJcbiAgfVxyXG5cclxuICAvLyBjbGVhciBjdXJyZW50IHRva2VucyB3aGVuIGNsaWNrZWRcclxuICBhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dENsZWFyVG9rZW5zKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpXHJcbiAgfSlcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSBhbmNob3IgZWxlbWVudCB0byB0aGUgcGFyZW50LlxyXG4gIHBhcmVudEVsLmFwcGVuZENoaWxkKGEpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxsZWQgb25jZSB0aGUgcmVkaXMgc2Vzc2lvbiBoYXMgYmVlbiBjaGVja2VkIGZvciBhIHZhbGlkIHRva2VuLiBJZiBvbmUgZG9lcyBub3QgZXhpc3QgdGhpcyBmdW5jdGlvbiB3aWxsIGdlbmVyYXRlIGEgbG9naW4gZWxlbWVudC5cclxuICogT3RoZXJ3aXNlIGlmIGEgdmFsaWQgdG9rZW4gZG9lcyBleGlzdCB0aGVuIHRoaXMgZnVuY3Rpb24gZGlzcGxheSB0aGUgdXNlcm5hbWUuXHJcbiAqXHJcbiAqIEBwYXJhbSBoYXNUb2tlbiB3aGV0aGVyIHRoZSByZWRpcyBzZXNzaW9uIGhhcyBhIHZhbGlkIGFjY2VzcyB0b2tlbiB0byB0aGUgc3BvdGlmeSBhcGkuXHJcbiAqIEBwYXJhbSBoYXNUb2tlbkNhbGxiYWNrIGNhbGxiYWNrIHRvIHJ1biBpZiBhIHZhbGlkIHRva2VuIGV4aXN0cy5cclxuICogQHBhcmFtIG5vVG9rZW5DYWxsQmFjayBjYWxsaGJhY2sgdG8gcnVuIGlmIGEgdmFsaWQgdG9rZW4gZG9lcyBub3QgZXhpc3QuXHJcbiAqIEBwYXJhbSByZWRpcmVjdEhvbWUgd2hldGhlciB0byByZWRpcmVjdCBiYWNrIHRvIHRoZSBob21lIHBhZ2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gb25TdWNjZXNzZnVsVG9rZW5DYWxsIChcclxuICBoYXNUb2tlbjogYm9vbGVhbixcclxuICBoYXNUb2tlbkNhbGxiYWNrID0gKCkgPT4geyB9LFxyXG4gIG5vVG9rZW5DYWxsQmFjayA9ICgpID0+IHsgfSxcclxuICByZWRpcmVjdEhvbWUgPSB0cnVlXHJcbikge1xyXG4gIGNvbnN0IGdldFRva2Vuc1NwaW5uZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgIGNvbmZpZy5DU1MuSURzLmdldFRva2VuTG9hZGluZ1NwaW5uZXJcclxuICApXHJcblxyXG4gIC8vIHJlbW92ZSB0b2tlbiBzcGlubmVyIGJlY2F1c2UgYnkgdGhpcyBsaW5lIHdlIGhhdmUgb2J0YWluZWQgdGhlIHRva2VuXHJcbiAgZ2V0VG9rZW5zU3Bpbm5lcj8ucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZ2V0VG9rZW5zU3Bpbm5lcilcclxuXHJcbiAgY29uc3QgaW5mb0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmluZm9Db250YWluZXIpXHJcblxyXG4gIC8vIGdlbmVyYXRlIHRoZSBuYXYgbG9naW5cclxuICBnZW5lcmF0ZUxvZ2luKHsgY2hhbmdlQWNjb3VudDogaGFzVG9rZW4sIHBhcmVudEVsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy50b3BOYXZNb2JpbGUpID8/IHRocm93RXhwcmVzc2lvbignTm8gdG9wIG5hdiBtb2JpbGUgZWxlbWVudCBmb3VuZCcpIH0pXHJcbiAgZ2VuZXJhdGVMb2dpbih7IGNoYW5nZUFjY291bnQ6IGhhc1Rva2VuIH0pXHJcbiAgaWYgKGhhc1Rva2VuKSB7XHJcbiAgICBpZiAoaW5mb0NvbnRhaW5lciA9PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5mbyBjb250YWluZXIgRWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICB9XHJcbiAgICBpbmZvQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICBkaXNwbGF5VXNlcm5hbWUoKVxyXG4gICAgY29uc29sZS5sb2coJ2Rpc3BsYXkgdXNlcm5hbWUnKVxyXG4gICAgaGFzVG9rZW5DYWxsYmFjaygpXHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIHRva2VuIHJlZGlyZWN0IHRvIGFsbG93IGFjY2VzcyBwYWdlXHJcbiAgICBpZiAocmVkaXJlY3RIb21lKSB7IHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gY29uZmlnLlVSTHMuc2l0ZVVybCB9XHJcbiAgICBub1Rva2VuQ2FsbEJhY2soKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQXJ0aXN0LCB7IGdlbmVyYXRlQXJ0aXN0c0Zyb21EYXRhIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hcnRpc3QnXHJcbmltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIHByb21pc2VIYW5kbGVyLFxyXG4gIGh0bWxUb0VsLFxyXG4gIHJlbW92ZUFsbENoaWxkTm9kZXMsXHJcbiAgYW5pbWF0aW9uQ29udHJvbCxcclxuICB0aHJvd0V4cHJlc3Npb25cclxufSBmcm9tICcuLi8uLi9jb25maWcnXHJcbmltcG9ydCBTZWxlY3RhYmxlVGFiRWxzIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvU2VsZWN0YWJsZVRhYkVscydcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSGFzVG9rZW5zLFxyXG4gIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbFxyXG59IGZyb20gJy4uLy4uL21hbmFnZS10b2tlbnMnXHJcbmltcG9ydCBBc3luY1NlbGVjdGlvblZlcmlmIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXN5bmNTZWxlY3Rpb25WZXJpZidcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBkZXRlcm1pbmVUZXJtLCBsb2FkVGVybSwgc2F2ZVRlcm0sIHNlbGVjdFN0YXJ0VGVybVRhYiwgVEVSTVMsIFRFUk1fVFlQRSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvc2F2ZS1sb2FkLXRlcm0nXHJcblxyXG5jb25zdCBNQVhfVklFV0FCTEVfQ0FSRFMgPSA1XHJcblxyXG5jb25zdCBhcnRpc3RBY3Rpb25zID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCBzZWxlY3Rpb25zID0ge1xyXG4gICAgbnVtVmlld2FibGVDYXJkczogTUFYX1ZJRVdBQkxFX0NBUkRTLFxyXG4gICAgdGVybTogVEVSTVMuU0hPUlRfVEVSTVxyXG4gIH1cclxuICBmdW5jdGlvbiBsb2FkQXJ0aXN0VG9wVHJhY2tzIChhcnRpc3RPYmo6IEFydGlzdCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XHJcbiAgICBhcnRpc3RPYmpcclxuICAgICAgLmxvYWRUb3BUcmFja3MoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgY2FsbGJhY2soKVxyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKGVycjogdW5rbm93bikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGVuIGxvYWRpbmcgYXJ0aXN0cycpXHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXHJcbiAgICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHNob3dUb3BUcmFja3MgKGFydGlzdE9iajogQXJ0aXN0KSB7XHJcbiAgICBsb2FkQXJ0aXN0VG9wVHJhY2tzKGFydGlzdE9iaiwgKCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFja0xpc3QgPSBnZXRUb3BUcmFja3NVbEZyb21BcnRpc3QoYXJ0aXN0T2JqKVxyXG4gICAgICBsZXQgcmFuayA9IDFcclxuICAgICAgaWYgKGFydGlzdE9iai50b3BUcmFja3MgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRocm93RXhwcmVzc2lvbignYXJ0aXN0IGRvZXMgbm90IGhhdmUgdG9wIHRyYWNrcyBsb2FkZWQgb24gcmVxdWVzdCB0byBzaG93IHRoZW0nKVxyXG4gICAgICB9XHJcbiAgICAgIGZvciAoY29uc3QgdHJhY2sgb2YgYXJ0aXN0T2JqLnRvcFRyYWNrcy52YWx1ZXMoKSkge1xyXG4gICAgICAgIHRyYWNrTGlzdC5hcHBlbmRDaGlsZCh0cmFjay5nZXRSYW5rZWRUcmFja0h0bWwoYXJ0aXN0T2JqLnRvcFRyYWNrcywgcmFuaykpXHJcbiAgICAgICAgcmFuaysrXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRUb3BUcmFja3NVbEZyb21BcnRpc3QgKGFydGlzdE9iajogQXJ0aXN0KSB7XHJcbiAgICBjb25zdCBhcnRpc3RDYXJkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXJ0aXN0T2JqLmNhcmRJZCkgPz8gdGhyb3dFeHByZXNzaW9uKCdhcnRpc3QgY2FyZCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCB0cmFja0xpc3QgPSBhcnRpc3RDYXJkLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrTGlzdClbMF1cclxuXHJcbiAgICBpZiAodHJhY2tMaXN0ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93RXhwcmVzc2lvbihgdHJhY2sgdWwgb24gYXJ0aXN0IGVsZW1lbnQgd2l0aCBpZCAke2FydGlzdE9iai5jYXJkSWR9IGRvZXMgbm90IGV4aXN0YClcclxuICAgIH1cclxuICAgIHJldHVybiB0cmFja0xpc3RcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIHJldHJpZXZlQXJ0aXN0cyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+KSB7XHJcbiAgICBjb25zdCB7IHJlcywgZXJyIH0gPSBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldFRvcEFydGlzdHMgKyBzZWxlY3Rpb25zLnRlcm0pXHJcbiAgICApXHJcbiAgICBpZiAoZXJyKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgLy8gd2Uga25vdyByZXMgaXMgbm90IG51bGwgYmVjYXVzZSBpdCBpcyBvbmx5IG51bGwgaWYgYW4gZXJyb3IgZXhpc3RzIGluIHdoaWNoIHdlIGhhdmUgYWxyZWFkeSByZXR1cm5lZFxyXG4gICAgZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEocmVzIS5kYXRhLCBhcnRpc3RBcnIpXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGdldEN1cnJTZWxUb3BBcnRpc3RzICgpIHtcclxuICAgIGlmIChzZWxlY3Rpb25zLnRlcm0gPT09IFRFUk1TLlNIT1JUX1RFUk0pIHtcclxuICAgICAgcmV0dXJuIGFydGlzdEFycnMudG9wQXJ0aXN0T2Jqc1Nob3J0VGVybVxyXG4gICAgfSBlbHNlIGlmIChzZWxlY3Rpb25zLnRlcm0gPT09IFRFUk1TLk1JRF9URVJNKSB7XHJcbiAgICAgIHJldHVybiBhcnRpc3RBcnJzLnRvcEFydGlzdE9ianNNaWRUZXJtXHJcbiAgICB9IGVsc2UgaWYgKHNlbGVjdGlvbnMudGVybSA9PT0gVEVSTVMuTE9OR19URVJNKSB7XHJcbiAgICAgIHJldHVybiBhcnRpc3RBcnJzLnRvcEFydGlzdE9ianNMb25nVGVybVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWxlY3RlZCB0cmFjayB0ZXJtIGlzIGludmFsaWQgJyArIHNlbGVjdGlvbnMudGVybSlcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHtcclxuICAgIHNob3dUb3BUcmFja3MsXHJcbiAgICByZXRyaWV2ZUFydGlzdHMsXHJcbiAgICBzZWxlY3Rpb25zLFxyXG4gICAgZ2V0Q3VyclNlbFRvcEFydGlzdHNcclxuICB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGFydGlzdENhcmRzSGFuZGxlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgY29uc3Qgc2VsZWN0aW9uVmVyaWYgPSBuZXcgQXN5bmNTZWxlY3Rpb25WZXJpZjxBcnJheTxBcnRpc3Q+PigpXHJcbiAgY29uc3QgYXJ0aXN0Q29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgICBjb25maWcuQ1NTLklEcy5hcnRpc3RDYXJkc0NvbnRhaW5lclxyXG4gICkgPz8gdGhyb3dFeHByZXNzaW9uKGBhcnRpc3QgY29udGFpbmVyIG9mIGlkICR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0Q2FyZHNDb250YWluZXJ9IGRvZXMgbm90IGV4aXN0YClcclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGVzIHRoZSBjYXJkcyB0byB0aGUgRE9NIHRoZW4gbWFrZXMgdGhlbSB2aXNpYmxlXHJcbiAgICogQHBhcmFtIHtBcnJheTxBcnRpc3Q+fSBhcnRpc3RBcnIgYXJyYXkgb2YgdHJhY2sgb2JqZWN0cyB3aG9zZSBjYXJkcyBzaG91bGQgYmUgZ2VuZXJhdGVkLlxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXV0b0FwcGVhciB3aGV0aGVyIHRvIHNob3cgdGhlIGNhcmQgd2l0aG91dCBhbmltYXRpb24gb3Igd2l0aCBhbmltYXRpb24uXHJcbiAgICogQHJldHVybnMge0FycmF5PEhUTUxFbGVtZW50Pn0gYXJyYXkgb2YgdGhlIGNhcmQgZWxlbWVudHMuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVDYXJkcyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+LCBhdXRvQXBwZWFyOiBCb29sZWFuKSB7XHJcbiAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdENvbnRhaW5lcilcclxuICAgIC8vIGZpbGwgYXJyIG9mIGNhcmQgZWxlbWVudHMgYW5kIGFwcGVuZCB0aGVtIHRvIERPTVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnRpc3RBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGkgPCBhcnRpc3RBY3Rpb25zLnNlbGVjdGlvbnMubnVtVmlld2FibGVDYXJkcykge1xyXG4gICAgICAgIGNvbnN0IGFydGlzdE9iaiA9IGFydGlzdEFycltpXVxyXG4gICAgICAgIGNvbnN0IGNhcmRIdG1sID0gYXJ0aXN0T2JqLmdldEFydGlzdEh0bWwoaSlcclxuXHJcbiAgICAgICAgYXJ0aXN0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNhcmRIdG1sKVxyXG5cclxuICAgICAgICBhcnRpc3RBY3Rpb25zLnNob3dUb3BUcmFja3MoYXJ0aXN0T2JqKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghYXV0b0FwcGVhcikge1xyXG4gICAgICBhbmltYXRpb25Db250cm9sLmFkZENsYXNzT25JbnRlcnZhbChcclxuICAgICAgICAnLicgKyBjb25maWcuQ1NTLkNMQVNTRVMuYXJ0aXN0LFxyXG4gICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIsXHJcbiAgICAgICAgMjVcclxuICAgICAgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQmVnaW5zIHJldHJpZXZpbmcgYXJ0aXN0cyB0aGVuIHdoZW4gZG9uZSB2ZXJpZmllcyBpdCBpcyB0aGUgY29ycmVjdCBzZWxlY3RlZCBhcnRpc3QuXHJcbiAgICogQHBhcmFtIHtBcnJheTxBcnRpc3Q+fSBhcnRpc3RBcnIgYXJyYXkgdG8gbG9hZCBhcnRpc3RzIGludG8uXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc3RhcnRMb2FkaW5nQXJ0aXN0cyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+KSB7XHJcbiAgICAvLyBpbml0aWFsbHkgc2hvdyB0aGUgbG9hZGluZyBzcGlubmVyXHJcbiAgICBjb25zdCBodG1sU3RyaW5nID0gYFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMuc3Bpbm5lcn1cIiBhbHQ9XCJMb2FkaW5nLi4uXCIgLz5cclxuICAgICAgICAgICAgPC9kaXY+YFxyXG4gICAgY29uc3Qgc3Bpbm5lckVsID0gaHRtbFRvRWwoaHRtbFN0cmluZylcclxuXHJcbiAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdENvbnRhaW5lcilcclxuICAgIGFydGlzdENvbnRhaW5lci5hcHBlbmRDaGlsZChzcGlubmVyRWwgYXMgTm9kZSlcclxuXHJcbiAgICBhcnRpc3RBY3Rpb25zLnJldHJpZXZlQXJ0aXN0cyhhcnRpc3RBcnIpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAvLyBhZnRlciByZXRyaWV2aW5nIGFzeW5jIHZlcmlmeSBpZiBpdCBpcyB0aGUgc2FtZSBhcnIgb2YgQXJ0aXN0J3MgYXMgd2hhdCB3YXMgc2VsZWN0ZWRcclxuICAgICAgaWYgKCFzZWxlY3Rpb25WZXJpZi5pc1ZhbGlkKGFydGlzdEFycikpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZ2VuZXJhdGVDYXJkcyhhcnRpc3RBcnIsIGZhbHNlKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIGFydGlzdCBvYmplY3RzIGlmIG5vdCBsb2FkZWQsIHRoZW4gZ2VuZXJhdGUgY2FyZHMgd2l0aCB0aGUgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXk8QXJ0aXN0Pn0gYXJ0aXN0QXJyIC0gTGlzdCBvZiB0cmFjayBvYmplY3RzIHdob3NlIGNhcmRzIHNob3VsZCBiZSBnZW5lcmF0ZWQgb3JcclxuICAgKiBlbXB0eSBsaXN0IHRoYXQgc2hvdWxkIGJlIGZpbGxlZCB3aGVuIGxvYWRpbmcgdHJhY2tzLlxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXV0b0FwcGVhciB3aGV0aGVyIHRvIHNob3cgdGhlIGNhcmRzIHdpdGhvdXQgYW5pbWF0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtBcnJheTxIVE1MRWxlbWVudD59IGxpc3Qgb2YgQ2FyZCBIVE1MRWxlbWVudCdzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGRpc3BsYXlBcnRpc3RDYXJkcyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+LCBhdXRvQXBwZWFyID0gZmFsc2UpIHtcclxuICAgIHNlbGVjdGlvblZlcmlmLnNlbGVjdGlvbkNoYW5nZWQoYXJ0aXN0QXJyKVxyXG4gICAgaWYgKGFydGlzdEFyci5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGdlbmVyYXRlQ2FyZHMoYXJ0aXN0QXJyLCBhdXRvQXBwZWFyKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnRMb2FkaW5nQXJ0aXN0cyhhcnRpc3RBcnIpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZGlzcGxheUFydGlzdENhcmRzXHJcbiAgfVxyXG59KSgpXHJcblxyXG5jb25zdCBhcnRpc3RBcnJzID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCB0b3BBcnRpc3RPYmpzU2hvcnRUZXJtOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuICBjb25zdCB0b3BBcnRpc3RPYmpzTWlkVGVybTogQXJyYXk8QXJ0aXN0PiA9IFtdXHJcbiAgY29uc3QgdG9wQXJ0aXN0T2Jqc0xvbmdUZXJtOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHRvcEFydGlzdE9ianNTaG9ydFRlcm0sXHJcbiAgICB0b3BBcnRpc3RPYmpzTWlkVGVybSxcclxuICAgIHRvcEFydGlzdE9ianNMb25nVGVybVxyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgYXJ0aXN0VGVybVNlbGVjdGlvbnMgPSBkb2N1bWVudFxyXG4gIC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5hcnRpc3RUZXJtU2VsZWN0aW9ucykgPz8gdGhyb3dFeHByZXNzaW9uKGB0ZXJtIHNlbGVjdGlvbiBvZiBpZCAke2NvbmZpZy5DU1MuSURzLmFydGlzdFRlcm1TZWxlY3Rpb25zfSBkb2VzIG5vdCBleGlzdGApXHJcbmNvbnN0IHNlbGVjdGlvbnMgPSB7XHJcbiAgdGVybVRhYk1hbmFnZXI6IG5ldyBTZWxlY3RhYmxlVGFiRWxzKClcclxufVxyXG5cclxuY29uc3QgYWRkRXZlbnRMaXN0ZW5lcnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGFkZEFydGlzdFRlcm1CdXR0b25FdmVudHMgKCkge1xyXG4gICAgZnVuY3Rpb24gb25DbGljayAoYnRuOiBFbGVtZW50LCBib3JkZXJDb3ZlcjogRWxlbWVudCkge1xyXG4gICAgICBjb25zdCBhdHRyID0gYnRuLmdldEF0dHJpYnV0ZShcclxuICAgICAgICBjb25maWcuQ1NTLkFUVFJJQlVURVMuZGF0YVNlbGVjdGlvblxyXG4gICAgICApID8/IHRocm93RXhwcmVzc2lvbihgYXR0cmlidXRlICR7Y29uZmlnLkNTUy5BVFRSSUJVVEVTLmRhdGFTZWxlY3Rpb259IGRvZXMgbm90IGV4aXN0IG9uIHRlcm0gYnV0dG9uYClcclxuXHJcbiAgICAgIGFydGlzdEFjdGlvbnMuc2VsZWN0aW9ucy50ZXJtID0gZGV0ZXJtaW5lVGVybShhdHRyKVxyXG5cclxuICAgICAgc2F2ZVRlcm0oYXJ0aXN0QWN0aW9ucy5zZWxlY3Rpb25zLnRlcm0sIFRFUk1fVFlQRS5BUlRJU1RTKVxyXG4gICAgICBzZWxlY3Rpb25zLnRlcm1UYWJNYW5hZ2VyLnNlbGVjdE5ld1RhYihidG4sIGJvcmRlckNvdmVyKVxyXG5cclxuICAgICAgY29uc3QgY3VyckFydGlzdHMgPSBhcnRpc3RBY3Rpb25zLmdldEN1cnJTZWxUb3BBcnRpc3RzKClcclxuICAgICAgYXJ0aXN0Q2FyZHNIYW5kbGVyLmRpc3BsYXlBcnRpc3RDYXJkcyhjdXJyQXJ0aXN0cylcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcnRpc3RUZXJtQnRucyA9IGFydGlzdFRlcm1TZWxlY3Rpb25zLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdidXR0b24nKVxyXG4gICAgY29uc3QgdHJhY2tUZXJtQm9yZGVyQ292ZXJzID0gYXJ0aXN0VGVybVNlbGVjdGlvbnMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMuYm9yZGVyQ292ZXIpXHJcblxyXG4gICAgaWYgKHRyYWNrVGVybUJvcmRlckNvdmVycy5sZW5ndGggIT09IGFydGlzdFRlcm1CdG5zLmxlbmd0aCkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdOb3QgYWxsIHRyYWNrIHRlcm0gYnV0dG9ucyBjb250YWluIGEgYm9yZGVyIGNvdmVyJylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFydGlzdFRlcm1CdG5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGFydGlzdFRlcm1CdG5zW2ldXHJcbiAgICAgIGNvbnN0IGJvcmRlckNvdmVyID0gdHJhY2tUZXJtQm9yZGVyQ292ZXJzW2ldXHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9uQ2xpY2soYnRuLCBib3JkZXJDb3ZlcikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWRkQXJ0aXN0VGVybUJ1dHRvbkV2ZW50c1xyXG4gIH1cclxufSkoKTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXI8Ym9vbGVhbj4oY2hlY2tJZkhhc1Rva2VucygpLCAoaGFzVG9rZW4pID0+XHJcbiAgICBvblN1Y2Nlc3NmdWxUb2tlbkNhbGwoaGFzVG9rZW4sICgpID0+IHtcclxuICAgICAgbG9hZFRlcm0oVEVSTV9UWVBFLkFSVElTVFMpLnRoZW4odGVybSA9PiB7XHJcbiAgICAgICAgYXJ0aXN0QWN0aW9ucy5zZWxlY3Rpb25zLnRlcm0gPSB0ZXJtXHJcbiAgICAgICAgYXJ0aXN0Q2FyZHNIYW5kbGVyLmRpc3BsYXlBcnRpc3RDYXJkcyhhcnRpc3RBY3Rpb25zLmdldEN1cnJTZWxUb3BBcnRpc3RzKCkpXHJcbiAgICAgICAgc2VsZWN0U3RhcnRUZXJtVGFiKHRlcm0sIHNlbGVjdGlvbnMudGVybVRhYk1hbmFnZXIsIGFydGlzdFRlcm1TZWxlY3Rpb25zKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICApXHJcbiAgT2JqZWN0LmVudHJpZXMoYWRkRXZlbnRMaXN0ZW5lcnMpLmZvckVhY2goKFssIGFkZEV2ZW50TGlzdGVuZXJdKSA9PiB7XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKClcclxuICB9KVxyXG59KSgpXHJcbiIsImltcG9ydCBheGlvcywgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnXHJcbmltcG9ydCB7IGNvbmZpZywgcHJvbWlzZUhhbmRsZXIgfSBmcm9tICcuL2NvbmZpZydcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkaXNwbGF5VXNlcm5hbWUgKCkge1xyXG4gIHByb21pc2VIYW5kbGVyPEF4aW9zUmVzcG9uc2U8c3RyaW5nIHwgbnVsbD4+KGF4aW9zLnJlcXVlc3Q8c3RyaW5nIHwgbnVsbD4oeyBtZXRob2Q6ICdHRVQnLCB1cmw6IGNvbmZpZy5VUkxzLmdldFVzZXJuYW1lIH0pLCAocmVzKSA9PiB7XHJcbiAgICBjb25zdCB1c2VybmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnVzZXJuYW1lKVxyXG4gICAgaWYgKHVzZXJuYW1lKSB7XHJcbiAgICAgIHVzZXJuYW1lLnRleHRDb250ZW50ID0gcmVzLmRhdGFcclxuICAgIH1cclxuICB9KVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9wdWJsaWMvcGFnZXMvdG9wLWFydGlzdHMtcGFnZS90b3AtYXJ0aXN0cy50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==