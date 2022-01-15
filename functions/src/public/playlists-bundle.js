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

/***/ "./node_modules/interactjs/dist/interact.min.js":
/*!******************************************************!*\
  !*** ./node_modules/interactjs/dist/interact.min.js ***!
  \******************************************************/
/***/ ((module) => {

/* interact.js 1.10.11 | https://interactjs.io/license */
!function(t){ true?module.exports=t():0}((function(){var t={};Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,t.default=function(t){return!(!t||!t.Window)&&t instanceof t.Window};var e={};Object.defineProperty(e,"__esModule",{value:!0}),e.init=o,e.getWindow=function(e){return(0,t.default)(e)?e:(e.ownerDocument||e).defaultView||r.window},e.window=e.realWindow=void 0;var n=void 0;e.realWindow=n;var r=void 0;function o(t){e.realWindow=n=t;var o=t.document.createTextNode("");o.ownerDocument!==t.document&&"function"==typeof t.wrap&&t.wrap(o)===o&&(t=t.wrap(t)),e.window=r=t}e.window=r,"undefined"!=typeof window&&window&&o(window);var i={};function a(t){return(a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}Object.defineProperty(i,"__esModule",{value:!0}),i.default=void 0;var s=function(t){return!!t&&"object"===a(t)},l=function(t){return"function"==typeof t},u={window:function(n){return n===e.window||(0,t.default)(n)},docFrag:function(t){return s(t)&&11===t.nodeType},object:s,func:l,number:function(t){return"number"==typeof t},bool:function(t){return"boolean"==typeof t},string:function(t){return"string"==typeof t},element:function(t){if(!t||"object"!==a(t))return!1;var n=e.getWindow(t)||e.window;return/object|function/.test(a(n.Element))?t instanceof n.Element:1===t.nodeType&&"string"==typeof t.nodeName},plainObject:function(t){return s(t)&&!!t.constructor&&/function Object\b/.test(t.constructor.toString())},array:function(t){return s(t)&&void 0!==t.length&&l(t.splice)}};i.default=u;var c={};function f(t){var e=t.interaction;if("drag"===e.prepared.name){var n=e.prepared.axis;"x"===n?(e.coords.cur.page.y=e.coords.start.page.y,e.coords.cur.client.y=e.coords.start.client.y,e.coords.velocity.client.y=0,e.coords.velocity.page.y=0):"y"===n&&(e.coords.cur.page.x=e.coords.start.page.x,e.coords.cur.client.x=e.coords.start.client.x,e.coords.velocity.client.x=0,e.coords.velocity.page.x=0)}}function d(t){var e=t.iEvent,n=t.interaction;if("drag"===n.prepared.name){var r=n.prepared.axis;if("x"===r||"y"===r){var o="x"===r?"y":"x";e.page[o]=n.coords.start.page[o],e.client[o]=n.coords.start.client[o],e.delta[o]=0}}}Object.defineProperty(c,"__esModule",{value:!0}),c.default=void 0;var p={id:"actions/drag",install:function(t){var e=t.actions,n=t.Interactable,r=t.defaults;n.prototype.draggable=p.draggable,e.map.drag=p,e.methodDict.drag="draggable",r.actions.drag=p.defaults},listeners:{"interactions:before-action-move":f,"interactions:action-resume":f,"interactions:action-move":d,"auto-start:check":function(t){var e=t.interaction,n=t.interactable,r=t.buttons,o=n.options.drag;if(o&&o.enabled&&(!e.pointerIsDown||!/mouse|pointer/.test(e.pointerType)||0!=(r&n.options.drag.mouseButtons)))return t.action={name:"drag",axis:"start"===o.lockAxis?o.startAxis:o.lockAxis},!1}},draggable:function(t){return i.default.object(t)?(this.options.drag.enabled=!1!==t.enabled,this.setPerAction("drag",t),this.setOnEvents("drag",t),/^(xy|x|y|start)$/.test(t.lockAxis)&&(this.options.drag.lockAxis=t.lockAxis),/^(xy|x|y)$/.test(t.startAxis)&&(this.options.drag.startAxis=t.startAxis),this):i.default.bool(t)?(this.options.drag.enabled=t,this):this.options.drag},beforeMove:f,move:d,defaults:{startAxis:"xy",lockAxis:"xy"},getCursor:function(){return"move"}},v=p;c.default=v;var h={};Object.defineProperty(h,"__esModule",{value:!0}),h.default=void 0;var g={init:function(t){var e=t;g.document=e.document,g.DocumentFragment=e.DocumentFragment||y,g.SVGElement=e.SVGElement||y,g.SVGSVGElement=e.SVGSVGElement||y,g.SVGElementInstance=e.SVGElementInstance||y,g.Element=e.Element||y,g.HTMLElement=e.HTMLElement||g.Element,g.Event=e.Event,g.Touch=e.Touch||y,g.PointerEvent=e.PointerEvent||e.MSPointerEvent},document:null,DocumentFragment:null,SVGElement:null,SVGSVGElement:null,SVGElementInstance:null,Element:null,HTMLElement:null,Event:null,Touch:null,PointerEvent:null};function y(){}var m=g;h.default=m;var b={};Object.defineProperty(b,"__esModule",{value:!0}),b.default=void 0;var x={init:function(t){var e=h.default.Element,n=t.navigator||{};x.supportsTouch="ontouchstart"in t||i.default.func(t.DocumentTouch)&&h.default.document instanceof t.DocumentTouch,x.supportsPointerEvent=!1!==n.pointerEnabled&&!!h.default.PointerEvent,x.isIOS=/iP(hone|od|ad)/.test(n.platform),x.isIOS7=/iP(hone|od|ad)/.test(n.platform)&&/OS 7[^\d]/.test(n.appVersion),x.isIe9=/MSIE 9/.test(n.userAgent),x.isOperaMobile="Opera"===n.appName&&x.supportsTouch&&/Presto/.test(n.userAgent),x.prefixedMatchesSelector="matches"in e.prototype?"matches":"webkitMatchesSelector"in e.prototype?"webkitMatchesSelector":"mozMatchesSelector"in e.prototype?"mozMatchesSelector":"oMatchesSelector"in e.prototype?"oMatchesSelector":"msMatchesSelector",x.pEventTypes=x.supportsPointerEvent?h.default.PointerEvent===t.MSPointerEvent?{up:"MSPointerUp",down:"MSPointerDown",over:"mouseover",out:"mouseout",move:"MSPointerMove",cancel:"MSPointerCancel"}:{up:"pointerup",down:"pointerdown",over:"pointerover",out:"pointerout",move:"pointermove",cancel:"pointercancel"}:null,x.wheelEvent=h.default.document&&"onmousewheel"in h.default.document?"mousewheel":"wheel"},supportsTouch:null,supportsPointerEvent:null,isIOS7:null,isIOS:null,isIe9:null,isOperaMobile:null,prefixedMatchesSelector:null,pEventTypes:null,wheelEvent:null},w=x;b.default=w;var _={};function P(t){var e=t.parentNode;if(i.default.docFrag(e)){for(;(e=e.host)&&i.default.docFrag(e););return e}return e}function O(t,n){return e.window!==e.realWindow&&(n=n.replace(/\/deep\//g," ")),t[b.default.prefixedMatchesSelector](n)}Object.defineProperty(_,"__esModule",{value:!0}),_.nodeContains=function(t,e){if(t.contains)return t.contains(e);for(;e;){if(e===t)return!0;e=e.parentNode}return!1},_.closest=function(t,e){for(;i.default.element(t);){if(O(t,e))return t;t=P(t)}return null},_.parentNode=P,_.matchesSelector=O,_.indexOfDeepestElement=function(t){for(var n,r=[],o=0;o<t.length;o++){var i=t[o],a=t[n];if(i&&o!==n)if(a){var s=S(i),l=S(a);if(s!==i.ownerDocument)if(l!==i.ownerDocument)if(s!==l){r=r.length?r:E(a);var u=void 0;if(a instanceof h.default.HTMLElement&&i instanceof h.default.SVGElement&&!(i instanceof h.default.SVGSVGElement)){if(i===l)continue;u=i.ownerSVGElement}else u=i;for(var c=E(u,a.ownerDocument),f=0;c[f]&&c[f]===r[f];)f++;var d=[c[f-1],c[f],r[f]];if(d[0])for(var p=d[0].lastChild;p;){if(p===d[1]){n=o,r=c;break}if(p===d[2])break;p=p.previousSibling}}else v=i,g=a,void 0,void 0,(parseInt(e.getWindow(v).getComputedStyle(v).zIndex,10)||0)>=(parseInt(e.getWindow(g).getComputedStyle(g).zIndex,10)||0)&&(n=o);else n=o}else n=o}var v,g;return n},_.matchesUpTo=function(t,e,n){for(;i.default.element(t);){if(O(t,e))return!0;if((t=P(t))===n)return O(t,e)}return!1},_.getActualElement=function(t){return t.correspondingUseElement||t},_.getScrollXY=T,_.getElementClientRect=M,_.getElementRect=function(t){var n=M(t);if(!b.default.isIOS7&&n){var r=T(e.getWindow(t));n.left+=r.x,n.right+=r.x,n.top+=r.y,n.bottom+=r.y}return n},_.getPath=function(t){for(var e=[];t;)e.push(t),t=P(t);return e},_.trySelector=function(t){return!!i.default.string(t)&&(h.default.document.querySelector(t),!0)};var S=function(t){return t.parentNode||t.host};function E(t,e){for(var n,r=[],o=t;(n=S(o))&&o!==e&&n!==o.ownerDocument;)r.unshift(o),o=n;return r}function T(t){return{x:(t=t||e.window).scrollX||t.document.documentElement.scrollLeft,y:t.scrollY||t.document.documentElement.scrollTop}}function M(t){var e=t instanceof h.default.SVGElement?t.getBoundingClientRect():t.getClientRects()[0];return e&&{left:e.left,right:e.right,top:e.top,bottom:e.bottom,width:e.width||e.right-e.left,height:e.height||e.bottom-e.top}}var j={};Object.defineProperty(j,"__esModule",{value:!0}),j.default=function(t,e){for(var n in e)t[n]=e[n];return t};var k={};function I(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=Array(e);n<e;n++)r[n]=t[n];return r}function D(t,e,n){return"parent"===t?(0,_.parentNode)(n):"self"===t?e.getRect(n):(0,_.closest)(n,t)}Object.defineProperty(k,"__esModule",{value:!0}),k.getStringOptionResult=D,k.resolveRectLike=function(t,e,n,r){var o,a=t;return i.default.string(a)?a=D(a,e,n):i.default.func(a)&&(a=a.apply(void 0,function(t){if(Array.isArray(t))return I(t)}(o=r)||function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)}(o)||function(t,e){if(t){if("string"==typeof t)return I(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?I(t,e):void 0}}(o)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())),i.default.element(a)&&(a=(0,_.getElementRect)(a)),a},k.rectToXY=function(t){return t&&{x:"x"in t?t.x:t.left,y:"y"in t?t.y:t.top}},k.xywhToTlbr=function(t){return!t||"left"in t&&"top"in t||((t=(0,j.default)({},t)).left=t.x||0,t.top=t.y||0,t.right=t.right||t.left+t.width,t.bottom=t.bottom||t.top+t.height),t},k.tlbrToXywh=function(t){return!t||"x"in t&&"y"in t||((t=(0,j.default)({},t)).x=t.left||0,t.y=t.top||0,t.width=t.width||(t.right||0)-t.x,t.height=t.height||(t.bottom||0)-t.y),t},k.addEdges=function(t,e,n){t.left&&(e.left+=n.x),t.right&&(e.right+=n.x),t.top&&(e.top+=n.y),t.bottom&&(e.bottom+=n.y),e.width=e.right-e.left,e.height=e.bottom-e.top};var A={};Object.defineProperty(A,"__esModule",{value:!0}),A.default=function(t,e,n){var r=t.options[n],o=r&&r.origin||t.options.origin,i=(0,k.resolveRectLike)(o,t,e,[t&&e]);return(0,k.rectToXY)(i)||{x:0,y:0}};var R={};function z(t){return t.trim().split(/ +/)}Object.defineProperty(R,"__esModule",{value:!0}),R.default=function t(e,n,r){if(r=r||{},i.default.string(e)&&-1!==e.search(" ")&&(e=z(e)),i.default.array(e))return e.reduce((function(e,o){return(0,j.default)(e,t(o,n,r))}),r);if(i.default.object(e)&&(n=e,e=""),i.default.func(n))r[e]=r[e]||[],r[e].push(n);else if(i.default.array(n))for(var o=0;o<n.length;o++){var a;a=n[o],t(e,a,r)}else if(i.default.object(n))for(var s in n){var l=z(s).map((function(t){return"".concat(e).concat(t)}));t(l,n[s],r)}return r};var C={};Object.defineProperty(C,"__esModule",{value:!0}),C.default=void 0,C.default=function(t,e){return Math.sqrt(t*t+e*e)};var F={};function X(t,e){for(var n in e){var r=X.prefixedPropREs,o=!1;for(var i in r)if(0===n.indexOf(i)&&r[i].test(n)){o=!0;break}o||"function"==typeof e[n]||(t[n]=e[n])}return t}Object.defineProperty(F,"__esModule",{value:!0}),F.default=void 0,X.prefixedPropREs={webkit:/(Movement[XY]|Radius[XY]|RotationAngle|Force)$/,moz:/(Pressure)$/};var Y=X;F.default=Y;var B={};function W(t){return t instanceof h.default.Event||t instanceof h.default.Touch}function L(t,e,n){return t=t||"page",(n=n||{}).x=e[t+"X"],n.y=e[t+"Y"],n}function U(t,e){return e=e||{x:0,y:0},b.default.isOperaMobile&&W(t)?(L("screen",t,e),e.x+=window.scrollX,e.y+=window.scrollY):L("page",t,e),e}function V(t,e){return e=e||{},b.default.isOperaMobile&&W(t)?L("screen",t,e):L("client",t,e),e}function N(t){var e=[];return i.default.array(t)?(e[0]=t[0],e[1]=t[1]):"touchend"===t.type?1===t.touches.length?(e[0]=t.touches[0],e[1]=t.changedTouches[0]):0===t.touches.length&&(e[0]=t.changedTouches[0],e[1]=t.changedTouches[1]):(e[0]=t.touches[0],e[1]=t.touches[1]),e}function q(t){for(var e={pageX:0,pageY:0,clientX:0,clientY:0,screenX:0,screenY:0},n=0;n<t.length;n++){var r=t[n];for(var o in e)e[o]+=r[o]}for(var i in e)e[i]/=t.length;return e}Object.defineProperty(B,"__esModule",{value:!0}),B.copyCoords=function(t,e){t.page=t.page||{},t.page.x=e.page.x,t.page.y=e.page.y,t.client=t.client||{},t.client.x=e.client.x,t.client.y=e.client.y,t.timeStamp=e.timeStamp},B.setCoordDeltas=function(t,e,n){t.page.x=n.page.x-e.page.x,t.page.y=n.page.y-e.page.y,t.client.x=n.client.x-e.client.x,t.client.y=n.client.y-e.client.y,t.timeStamp=n.timeStamp-e.timeStamp},B.setCoordVelocity=function(t,e){var n=Math.max(e.timeStamp/1e3,.001);t.page.x=e.page.x/n,t.page.y=e.page.y/n,t.client.x=e.client.x/n,t.client.y=e.client.y/n,t.timeStamp=n},B.setZeroCoords=function(t){t.page.x=0,t.page.y=0,t.client.x=0,t.client.y=0},B.isNativePointer=W,B.getXY=L,B.getPageXY=U,B.getClientXY=V,B.getPointerId=function(t){return i.default.number(t.pointerId)?t.pointerId:t.identifier},B.setCoords=function(t,e,n){var r=e.length>1?q(e):e[0];U(r,t.page),V(r,t.client),t.timeStamp=n},B.getTouchPair=N,B.pointerAverage=q,B.touchBBox=function(t){if(!t.length)return null;var e=N(t),n=Math.min(e[0].pageX,e[1].pageX),r=Math.min(e[0].pageY,e[1].pageY),o=Math.max(e[0].pageX,e[1].pageX),i=Math.max(e[0].pageY,e[1].pageY);return{x:n,y:r,left:n,top:r,right:o,bottom:i,width:o-n,height:i-r}},B.touchDistance=function(t,e){var n=e+"X",r=e+"Y",o=N(t),i=o[0][n]-o[1][n],a=o[0][r]-o[1][r];return(0,C.default)(i,a)},B.touchAngle=function(t,e){var n=e+"X",r=e+"Y",o=N(t),i=o[1][n]-o[0][n],a=o[1][r]-o[0][r];return 180*Math.atan2(a,i)/Math.PI},B.getPointerType=function(t){return i.default.string(t.pointerType)?t.pointerType:i.default.number(t.pointerType)?[void 0,void 0,"touch","pen","mouse"][t.pointerType]:/touch/.test(t.type||"")||t instanceof h.default.Touch?"touch":"mouse"},B.getEventTargets=function(t){var e=i.default.func(t.composedPath)?t.composedPath():t.path;return[_.getActualElement(e?e[0]:t.target),_.getActualElement(t.currentTarget)]},B.newCoords=function(){return{page:{x:0,y:0},client:{x:0,y:0},timeStamp:0}},B.coordsToEvent=function(t){return{coords:t,get page(){return this.coords.page},get client(){return this.coords.client},get timeStamp(){return this.coords.timeStamp},get pageX(){return this.coords.page.x},get pageY(){return this.coords.page.y},get clientX(){return this.coords.client.x},get clientY(){return this.coords.client.y},get pointerId(){return this.coords.pointerId},get target(){return this.coords.target},get type(){return this.coords.type},get pointerType(){return this.coords.pointerType},get buttons(){return this.coords.buttons},preventDefault:function(){}}},Object.defineProperty(B,"pointerExtend",{enumerable:!0,get:function(){return F.default}});var $={};function G(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function H(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty($,"__esModule",{value:!0}),$.BaseEvent=void 0;var K=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),H(this,"type",void 0),H(this,"target",void 0),H(this,"currentTarget",void 0),H(this,"interactable",void 0),H(this,"_interaction",void 0),H(this,"timeStamp",void 0),H(this,"immediatePropagationStopped",!1),H(this,"propagationStopped",!1),this._interaction=e}var e,n;return e=t,(n=[{key:"preventDefault",value:function(){}},{key:"stopPropagation",value:function(){this.propagationStopped=!0}},{key:"stopImmediatePropagation",value:function(){this.immediatePropagationStopped=this.propagationStopped=!0}}])&&G(e.prototype,n),t}();$.BaseEvent=K,Object.defineProperty(K.prototype,"interaction",{get:function(){return this._interaction._proxy},set:function(){}});var Z={};Object.defineProperty(Z,"__esModule",{value:!0}),Z.find=Z.findIndex=Z.from=Z.merge=Z.remove=Z.contains=void 0,Z.contains=function(t,e){return-1!==t.indexOf(e)},Z.remove=function(t,e){return t.splice(t.indexOf(e),1)};var J=function(t,e){for(var n=0;n<e.length;n++){var r=e[n];t.push(r)}return t};Z.merge=J,Z.from=function(t){return J([],t)};var Q=function(t,e){for(var n=0;n<t.length;n++)if(e(t[n],n,t))return n;return-1};Z.findIndex=Q,Z.find=function(t,e){return t[Q(t,e)]};var tt={};function et(t){return(et="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function nt(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function rt(t,e){return(rt=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function ot(t,e){return!e||"object"!==et(e)&&"function"!=typeof e?it(t):e}function it(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function at(t){return(at=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function st(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(tt,"__esModule",{value:!0}),tt.DropEvent=void 0;var lt=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&rt(t,e)}(a,t);var e,n,r,o,i=(r=a,o=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}(),function(){var t,e=at(r);if(o){var n=at(this).constructor;t=Reflect.construct(e,arguments,n)}else t=e.apply(this,arguments);return ot(this,t)});function a(t,e,n){var r;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,a),st(it(r=i.call(this,e._interaction)),"target",void 0),st(it(r),"dropzone",void 0),st(it(r),"dragEvent",void 0),st(it(r),"relatedTarget",void 0),st(it(r),"draggable",void 0),st(it(r),"timeStamp",void 0),st(it(r),"propagationStopped",!1),st(it(r),"immediatePropagationStopped",!1);var o="dragleave"===n?t.prev:t.cur,s=o.element,l=o.dropzone;return r.type=n,r.target=s,r.currentTarget=s,r.dropzone=l,r.dragEvent=e,r.relatedTarget=e.target,r.draggable=e.interactable,r.timeStamp=e.timeStamp,r}return e=a,(n=[{key:"reject",value:function(){var t=this,e=this._interaction.dropState;if("dropactivate"===this.type||this.dropzone&&e.cur.dropzone===this.dropzone&&e.cur.element===this.target)if(e.prev.dropzone=this.dropzone,e.prev.element=this.target,e.rejected=!0,e.events.enter=null,this.stopImmediatePropagation(),"dropactivate"===this.type){var n=e.activeDrops,r=Z.findIndex(n,(function(e){var n=e.dropzone,r=e.element;return n===t.dropzone&&r===t.target}));e.activeDrops.splice(r,1);var o=new a(e,this.dragEvent,"dropdeactivate");o.dropzone=this.dropzone,o.target=this.target,this.dropzone.fire(o)}else this.dropzone.fire(new a(e,this.dragEvent,"dragleave"))}},{key:"preventDefault",value:function(){}},{key:"stopPropagation",value:function(){this.propagationStopped=!0}},{key:"stopImmediatePropagation",value:function(){this.immediatePropagationStopped=this.propagationStopped=!0}}])&&nt(e.prototype,n),a}($.BaseEvent);tt.DropEvent=lt;var ut={};function ct(t,e){for(var n=0;n<t.slice().length;n++){var r=t.slice()[n],o=r.dropzone,i=r.element;e.dropzone=o,e.target=i,o.fire(e),e.propagationStopped=e.immediatePropagationStopped=!1}}function ft(t,e){for(var n=function(t,e){for(var n=t.interactables,r=[],o=0;o<n.list.length;o++){var a=n.list[o];if(a.options.drop.enabled){var s=a.options.drop.accept;if(!(i.default.element(s)&&s!==e||i.default.string(s)&&!_.matchesSelector(e,s)||i.default.func(s)&&!s({dropzone:a,draggableElement:e})))for(var l=i.default.string(a.target)?a._context.querySelectorAll(a.target):i.default.array(a.target)?a.target:[a.target],u=0;u<l.length;u++){var c=l[u];c!==e&&r.push({dropzone:a,element:c,rect:a.getRect(c)})}}}return r}(t,e),r=0;r<n.length;r++){var o=n[r];o.rect=o.dropzone.getRect(o.element)}return n}function dt(t,e,n){for(var r=t.dropState,o=t.interactable,i=t.element,a=[],s=0;s<r.activeDrops.length;s++){var l=r.activeDrops[s],u=l.dropzone,c=l.element,f=l.rect;a.push(u.dropCheck(e,n,o,i,c,f)?c:null)}var d=_.indexOfDeepestElement(a);return r.activeDrops[d]||null}function pt(t,e,n){var r=t.dropState,o={enter:null,leave:null,activate:null,deactivate:null,move:null,drop:null};return"dragstart"===n.type&&(o.activate=new tt.DropEvent(r,n,"dropactivate"),o.activate.target=null,o.activate.dropzone=null),"dragend"===n.type&&(o.deactivate=new tt.DropEvent(r,n,"dropdeactivate"),o.deactivate.target=null,o.deactivate.dropzone=null),r.rejected||(r.cur.element!==r.prev.element&&(r.prev.dropzone&&(o.leave=new tt.DropEvent(r,n,"dragleave"),n.dragLeave=o.leave.target=r.prev.element,n.prevDropzone=o.leave.dropzone=r.prev.dropzone),r.cur.dropzone&&(o.enter=new tt.DropEvent(r,n,"dragenter"),n.dragEnter=r.cur.element,n.dropzone=r.cur.dropzone)),"dragend"===n.type&&r.cur.dropzone&&(o.drop=new tt.DropEvent(r,n,"drop"),n.dropzone=r.cur.dropzone,n.relatedTarget=r.cur.element),"dragmove"===n.type&&r.cur.dropzone&&(o.move=new tt.DropEvent(r,n,"dropmove"),o.move.dragmove=n,n.dropzone=r.cur.dropzone)),o}function vt(t,e){var n=t.dropState,r=n.activeDrops,o=n.cur,i=n.prev;e.leave&&i.dropzone.fire(e.leave),e.enter&&o.dropzone.fire(e.enter),e.move&&o.dropzone.fire(e.move),e.drop&&o.dropzone.fire(e.drop),e.deactivate&&ct(r,e.deactivate),n.prev.dropzone=o.dropzone,n.prev.element=o.element}function ht(t,e){var n=t.interaction,r=t.iEvent,o=t.event;if("dragmove"===r.type||"dragend"===r.type){var i=n.dropState;e.dynamicDrop&&(i.activeDrops=ft(e,n.element));var a=r,s=dt(n,a,o);i.rejected=i.rejected&&!!s&&s.dropzone===i.cur.dropzone&&s.element===i.cur.element,i.cur.dropzone=s&&s.dropzone,i.cur.element=s&&s.element,i.events=pt(n,0,a)}}Object.defineProperty(ut,"__esModule",{value:!0}),ut.default=void 0;var gt={id:"actions/drop",install:function(t){var e=t.actions,n=t.interactStatic,r=t.Interactable,o=t.defaults;t.usePlugin(c.default),r.prototype.dropzone=function(t){return function(t,e){if(i.default.object(e)){if(t.options.drop.enabled=!1!==e.enabled,e.listeners){var n=(0,R.default)(e.listeners),r=Object.keys(n).reduce((function(t,e){return t[/^(enter|leave)/.test(e)?"drag".concat(e):/^(activate|deactivate|move)/.test(e)?"drop".concat(e):e]=n[e],t}),{});t.off(t.options.drop.listeners),t.on(r),t.options.drop.listeners=r}return i.default.func(e.ondrop)&&t.on("drop",e.ondrop),i.default.func(e.ondropactivate)&&t.on("dropactivate",e.ondropactivate),i.default.func(e.ondropdeactivate)&&t.on("dropdeactivate",e.ondropdeactivate),i.default.func(e.ondragenter)&&t.on("dragenter",e.ondragenter),i.default.func(e.ondragleave)&&t.on("dragleave",e.ondragleave),i.default.func(e.ondropmove)&&t.on("dropmove",e.ondropmove),/^(pointer|center)$/.test(e.overlap)?t.options.drop.overlap=e.overlap:i.default.number(e.overlap)&&(t.options.drop.overlap=Math.max(Math.min(1,e.overlap),0)),"accept"in e&&(t.options.drop.accept=e.accept),"checker"in e&&(t.options.drop.checker=e.checker),t}return i.default.bool(e)?(t.options.drop.enabled=e,t):t.options.drop}(this,t)},r.prototype.dropCheck=function(t,e,n,r,o,a){return function(t,e,n,r,o,a,s){var l=!1;if(!(s=s||t.getRect(a)))return!!t.options.drop.checker&&t.options.drop.checker(e,n,l,t,a,r,o);var u=t.options.drop.overlap;if("pointer"===u){var c=(0,A.default)(r,o,"drag"),f=B.getPageXY(e);f.x+=c.x,f.y+=c.y;var d=f.x>s.left&&f.x<s.right,p=f.y>s.top&&f.y<s.bottom;l=d&&p}var v=r.getRect(o);if(v&&"center"===u){var h=v.left+v.width/2,g=v.top+v.height/2;l=h>=s.left&&h<=s.right&&g>=s.top&&g<=s.bottom}return v&&i.default.number(u)&&(l=Math.max(0,Math.min(s.right,v.right)-Math.max(s.left,v.left))*Math.max(0,Math.min(s.bottom,v.bottom)-Math.max(s.top,v.top))/(v.width*v.height)>=u),t.options.drop.checker&&(l=t.options.drop.checker(e,n,l,t,a,r,o)),l}(this,t,e,n,r,o,a)},n.dynamicDrop=function(e){return i.default.bool(e)?(t.dynamicDrop=e,n):t.dynamicDrop},(0,j.default)(e.phaselessTypes,{dragenter:!0,dragleave:!0,dropactivate:!0,dropdeactivate:!0,dropmove:!0,drop:!0}),e.methodDict.drop="dropzone",t.dynamicDrop=!1,o.actions.drop=gt.defaults},listeners:{"interactions:before-action-start":function(t){var e=t.interaction;"drag"===e.prepared.name&&(e.dropState={cur:{dropzone:null,element:null},prev:{dropzone:null,element:null},rejected:null,events:null,activeDrops:[]})},"interactions:after-action-start":function(t,e){var n=t.interaction,r=(t.event,t.iEvent);if("drag"===n.prepared.name){var o=n.dropState;o.activeDrops=null,o.events=null,o.activeDrops=ft(e,n.element),o.events=pt(n,0,r),o.events.activate&&(ct(o.activeDrops,o.events.activate),e.fire("actions/drop:start",{interaction:n,dragEvent:r}))}},"interactions:action-move":ht,"interactions:after-action-move":function(t,e){var n=t.interaction,r=t.iEvent;"drag"===n.prepared.name&&(vt(n,n.dropState.events),e.fire("actions/drop:move",{interaction:n,dragEvent:r}),n.dropState.events={})},"interactions:action-end":function(t,e){if("drag"===t.interaction.prepared.name){var n=t.interaction,r=t.iEvent;ht(t,e),vt(n,n.dropState.events),e.fire("actions/drop:end",{interaction:n,dragEvent:r})}},"interactions:stop":function(t){var e=t.interaction;if("drag"===e.prepared.name){var n=e.dropState;n&&(n.activeDrops=null,n.events=null,n.cur.dropzone=null,n.cur.element=null,n.prev.dropzone=null,n.prev.element=null,n.rejected=!1)}}},getActiveDrops:ft,getDrop:dt,getDropEvents:pt,fireDropEvents:vt,defaults:{enabled:!1,accept:null,overlap:"pointer"}},yt=gt;ut.default=yt;var mt={};function bt(t){var e=t.interaction,n=t.iEvent,r=t.phase;if("gesture"===e.prepared.name){var o=e.pointers.map((function(t){return t.pointer})),a="start"===r,s="end"===r,l=e.interactable.options.deltaSource;if(n.touches=[o[0],o[1]],a)n.distance=B.touchDistance(o,l),n.box=B.touchBBox(o),n.scale=1,n.ds=0,n.angle=B.touchAngle(o,l),n.da=0,e.gesture.startDistance=n.distance,e.gesture.startAngle=n.angle;else if(s){var u=e.prevEvent;n.distance=u.distance,n.box=u.box,n.scale=u.scale,n.ds=0,n.angle=u.angle,n.da=0}else n.distance=B.touchDistance(o,l),n.box=B.touchBBox(o),n.scale=n.distance/e.gesture.startDistance,n.angle=B.touchAngle(o,l),n.ds=n.scale-e.gesture.scale,n.da=n.angle-e.gesture.angle;e.gesture.distance=n.distance,e.gesture.angle=n.angle,i.default.number(n.scale)&&n.scale!==1/0&&!isNaN(n.scale)&&(e.gesture.scale=n.scale)}}Object.defineProperty(mt,"__esModule",{value:!0}),mt.default=void 0;var xt={id:"actions/gesture",before:["actions/drag","actions/resize"],install:function(t){var e=t.actions,n=t.Interactable,r=t.defaults;n.prototype.gesturable=function(t){return i.default.object(t)?(this.options.gesture.enabled=!1!==t.enabled,this.setPerAction("gesture",t),this.setOnEvents("gesture",t),this):i.default.bool(t)?(this.options.gesture.enabled=t,this):this.options.gesture},e.map.gesture=xt,e.methodDict.gesture="gesturable",r.actions.gesture=xt.defaults},listeners:{"interactions:action-start":bt,"interactions:action-move":bt,"interactions:action-end":bt,"interactions:new":function(t){t.interaction.gesture={angle:0,distance:0,scale:1,startAngle:0,startDistance:0}},"auto-start:check":function(t){if(!(t.interaction.pointers.length<2)){var e=t.interactable.options.gesture;if(e&&e.enabled)return t.action={name:"gesture"},!1}}},defaults:{},getCursor:function(){return""}},wt=xt;mt.default=wt;var _t={};function Pt(t,e,n,r,o,a,s){if(!e)return!1;if(!0===e){var l=i.default.number(a.width)?a.width:a.right-a.left,u=i.default.number(a.height)?a.height:a.bottom-a.top;if(s=Math.min(s,Math.abs(("left"===t||"right"===t?l:u)/2)),l<0&&("left"===t?t="right":"right"===t&&(t="left")),u<0&&("top"===t?t="bottom":"bottom"===t&&(t="top")),"left"===t)return n.x<(l>=0?a.left:a.right)+s;if("top"===t)return n.y<(u>=0?a.top:a.bottom)+s;if("right"===t)return n.x>(l>=0?a.right:a.left)-s;if("bottom"===t)return n.y>(u>=0?a.bottom:a.top)-s}return!!i.default.element(r)&&(i.default.element(e)?e===r:_.matchesUpTo(r,e,o))}function Ot(t){var e=t.iEvent,n=t.interaction;if("resize"===n.prepared.name&&n.resizeAxes){var r=e;n.interactable.options.resize.square?("y"===n.resizeAxes?r.delta.x=r.delta.y:r.delta.y=r.delta.x,r.axes="xy"):(r.axes=n.resizeAxes,"x"===n.resizeAxes?r.delta.y=0:"y"===n.resizeAxes&&(r.delta.x=0))}}Object.defineProperty(_t,"__esModule",{value:!0}),_t.default=void 0;var St={id:"actions/resize",before:["actions/drag"],install:function(t){var e=t.actions,n=t.browser,r=t.Interactable,o=t.defaults;St.cursors=function(t){return t.isIe9?{x:"e-resize",y:"s-resize",xy:"se-resize",top:"n-resize",left:"w-resize",bottom:"s-resize",right:"e-resize",topleft:"se-resize",bottomright:"se-resize",topright:"ne-resize",bottomleft:"ne-resize"}:{x:"ew-resize",y:"ns-resize",xy:"nwse-resize",top:"ns-resize",left:"ew-resize",bottom:"ns-resize",right:"ew-resize",topleft:"nwse-resize",bottomright:"nwse-resize",topright:"nesw-resize",bottomleft:"nesw-resize"}}(n),St.defaultMargin=n.supportsTouch||n.supportsPointerEvent?20:10,r.prototype.resizable=function(e){return function(t,e,n){return i.default.object(e)?(t.options.resize.enabled=!1!==e.enabled,t.setPerAction("resize",e),t.setOnEvents("resize",e),i.default.string(e.axis)&&/^x$|^y$|^xy$/.test(e.axis)?t.options.resize.axis=e.axis:null===e.axis&&(t.options.resize.axis=n.defaults.actions.resize.axis),i.default.bool(e.preserveAspectRatio)?t.options.resize.preserveAspectRatio=e.preserveAspectRatio:i.default.bool(e.square)&&(t.options.resize.square=e.square),t):i.default.bool(e)?(t.options.resize.enabled=e,t):t.options.resize}(this,e,t)},e.map.resize=St,e.methodDict.resize="resizable",o.actions.resize=St.defaults},listeners:{"interactions:new":function(t){t.interaction.resizeAxes="xy"},"interactions:action-start":function(t){!function(t){var e=t.iEvent,n=t.interaction;if("resize"===n.prepared.name&&n.prepared.edges){var r=e,o=n.rect;n._rects={start:(0,j.default)({},o),corrected:(0,j.default)({},o),previous:(0,j.default)({},o),delta:{left:0,right:0,width:0,top:0,bottom:0,height:0}},r.edges=n.prepared.edges,r.rect=n._rects.corrected,r.deltaRect=n._rects.delta}}(t),Ot(t)},"interactions:action-move":function(t){!function(t){var e=t.iEvent,n=t.interaction;if("resize"===n.prepared.name&&n.prepared.edges){var r=e,o=n.interactable.options.resize.invert,i="reposition"===o||"negate"===o,a=n.rect,s=n._rects,l=s.start,u=s.corrected,c=s.delta,f=s.previous;if((0,j.default)(f,u),i){if((0,j.default)(u,a),"reposition"===o){if(u.top>u.bottom){var d=u.top;u.top=u.bottom,u.bottom=d}if(u.left>u.right){var p=u.left;u.left=u.right,u.right=p}}}else u.top=Math.min(a.top,l.bottom),u.bottom=Math.max(a.bottom,l.top),u.left=Math.min(a.left,l.right),u.right=Math.max(a.right,l.left);for(var v in u.width=u.right-u.left,u.height=u.bottom-u.top,u)c[v]=u[v]-f[v];r.edges=n.prepared.edges,r.rect=u,r.deltaRect=c}}(t),Ot(t)},"interactions:action-end":function(t){var e=t.iEvent,n=t.interaction;if("resize"===n.prepared.name&&n.prepared.edges){var r=e;r.edges=n.prepared.edges,r.rect=n._rects.corrected,r.deltaRect=n._rects.delta}},"auto-start:check":function(t){var e=t.interaction,n=t.interactable,r=t.element,o=t.rect,a=t.buttons;if(o){var s=(0,j.default)({},e.coords.cur.page),l=n.options.resize;if(l&&l.enabled&&(!e.pointerIsDown||!/mouse|pointer/.test(e.pointerType)||0!=(a&l.mouseButtons))){if(i.default.object(l.edges)){var u={left:!1,right:!1,top:!1,bottom:!1};for(var c in u)u[c]=Pt(c,l.edges[c],s,e._latestPointer.eventTarget,r,o,l.margin||St.defaultMargin);u.left=u.left&&!u.right,u.top=u.top&&!u.bottom,(u.left||u.right||u.top||u.bottom)&&(t.action={name:"resize",edges:u})}else{var f="y"!==l.axis&&s.x>o.right-St.defaultMargin,d="x"!==l.axis&&s.y>o.bottom-St.defaultMargin;(f||d)&&(t.action={name:"resize",axes:(f?"x":"")+(d?"y":"")})}return!t.action&&void 0}}}},defaults:{square:!1,preserveAspectRatio:!1,axis:"xy",margin:NaN,edges:null,invert:"none"},cursors:null,getCursor:function(t){var e=t.edges,n=t.axis,r=t.name,o=St.cursors,i=null;if(n)i=o[r+n];else if(e){for(var a="",s=["top","bottom","left","right"],l=0;l<s.length;l++){var u=s[l];e[u]&&(a+=u)}i=o[a]}return i},defaultMargin:null},Et=St;_t.default=Et;var Tt={};Object.defineProperty(Tt,"__esModule",{value:!0}),Tt.default=void 0;var Mt={id:"actions",install:function(t){t.usePlugin(mt.default),t.usePlugin(_t.default),t.usePlugin(c.default),t.usePlugin(ut.default)}};Tt.default=Mt;var jt={};Object.defineProperty(jt,"__esModule",{value:!0}),jt.default=void 0;var kt,It,Dt=0,At={request:function(t){return kt(t)},cancel:function(t){return It(t)},init:function(t){if(kt=t.requestAnimationFrame,It=t.cancelAnimationFrame,!kt)for(var e=["ms","moz","webkit","o"],n=0;n<e.length;n++){var r=e[n];kt=t["".concat(r,"RequestAnimationFrame")],It=t["".concat(r,"CancelAnimationFrame")]||t["".concat(r,"CancelRequestAnimationFrame")]}kt=kt&&kt.bind(t),It=It&&It.bind(t),kt||(kt=function(e){var n=Date.now(),r=Math.max(0,16-(n-Dt)),o=t.setTimeout((function(){e(n+r)}),r);return Dt=n+r,o},It=function(t){return clearTimeout(t)})}};jt.default=At;var Rt={};Object.defineProperty(Rt,"__esModule",{value:!0}),Rt.getContainer=Ct,Rt.getScroll=Ft,Rt.getScrollSize=function(t){return i.default.window(t)&&(t=window.document.body),{x:t.scrollWidth,y:t.scrollHeight}},Rt.getScrollSizeDelta=function(t,e){var n=t.interaction,r=t.element,o=n&&n.interactable.options[n.prepared.name].autoScroll;if(!o||!o.enabled)return e(),{x:0,y:0};var i=Ct(o.container,n.interactable,r),a=Ft(i);e();var s=Ft(i);return{x:s.x-a.x,y:s.y-a.y}},Rt.default=void 0;var zt={defaults:{enabled:!1,margin:60,container:null,speed:300},now:Date.now,interaction:null,i:0,x:0,y:0,isScrolling:!1,prevTime:0,margin:0,speed:0,start:function(t){zt.isScrolling=!0,jt.default.cancel(zt.i),t.autoScroll=zt,zt.interaction=t,zt.prevTime=zt.now(),zt.i=jt.default.request(zt.scroll)},stop:function(){zt.isScrolling=!1,zt.interaction&&(zt.interaction.autoScroll=null),jt.default.cancel(zt.i)},scroll:function(){var t=zt.interaction,e=t.interactable,n=t.element,r=t.prepared.name,o=e.options[r].autoScroll,a=Ct(o.container,e,n),s=zt.now(),l=(s-zt.prevTime)/1e3,u=o.speed*l;if(u>=1){var c={x:zt.x*u,y:zt.y*u};if(c.x||c.y){var f=Ft(a);i.default.window(a)?a.scrollBy(c.x,c.y):a&&(a.scrollLeft+=c.x,a.scrollTop+=c.y);var d=Ft(a),p={x:d.x-f.x,y:d.y-f.y};(p.x||p.y)&&e.fire({type:"autoscroll",target:n,interactable:e,delta:p,interaction:t,container:a})}zt.prevTime=s}zt.isScrolling&&(jt.default.cancel(zt.i),zt.i=jt.default.request(zt.scroll))},check:function(t,e){var n;return null==(n=t.options[e].autoScroll)?void 0:n.enabled},onInteractionMove:function(t){var e=t.interaction,n=t.pointer;if(e.interacting()&&zt.check(e.interactable,e.prepared.name))if(e.simulation)zt.x=zt.y=0;else{var r,o,a,s,l=e.interactable,u=e.element,c=e.prepared.name,f=l.options[c].autoScroll,d=Ct(f.container,l,u);if(i.default.window(d))s=n.clientX<zt.margin,r=n.clientY<zt.margin,o=n.clientX>d.innerWidth-zt.margin,a=n.clientY>d.innerHeight-zt.margin;else{var p=_.getElementClientRect(d);s=n.clientX<p.left+zt.margin,r=n.clientY<p.top+zt.margin,o=n.clientX>p.right-zt.margin,a=n.clientY>p.bottom-zt.margin}zt.x=o?1:s?-1:0,zt.y=a?1:r?-1:0,zt.isScrolling||(zt.margin=f.margin,zt.speed=f.speed,zt.start(e))}}};function Ct(t,n,r){return(i.default.string(t)?(0,k.getStringOptionResult)(t,n,r):t)||(0,e.getWindow)(r)}function Ft(t){return i.default.window(t)&&(t=window.document.body),{x:t.scrollLeft,y:t.scrollTop}}var Xt={id:"auto-scroll",install:function(t){var e=t.defaults,n=t.actions;t.autoScroll=zt,zt.now=function(){return t.now()},n.phaselessTypes.autoscroll=!0,e.perAction.autoScroll=zt.defaults},listeners:{"interactions:new":function(t){t.interaction.autoScroll=null},"interactions:destroy":function(t){t.interaction.autoScroll=null,zt.stop(),zt.interaction&&(zt.interaction=null)},"interactions:stop":zt.stop,"interactions:action-move":function(t){return zt.onInteractionMove(t)}}};Rt.default=Xt;var Yt={};Object.defineProperty(Yt,"__esModule",{value:!0}),Yt.warnOnce=function(t,n){var r=!1;return function(){return r||(e.window.console.warn(n),r=!0),t.apply(this,arguments)}},Yt.copyAction=function(t,e){return t.name=e.name,t.axis=e.axis,t.edges=e.edges,t},Yt.sign=void 0,Yt.sign=function(t){return t>=0?1:-1};var Bt={};function Wt(t){return i.default.bool(t)?(this.options.styleCursor=t,this):null===t?(delete this.options.styleCursor,this):this.options.styleCursor}function Lt(t){return i.default.func(t)?(this.options.actionChecker=t,this):null===t?(delete this.options.actionChecker,this):this.options.actionChecker}Object.defineProperty(Bt,"__esModule",{value:!0}),Bt.default=void 0;var Ut={id:"auto-start/interactableMethods",install:function(t){var e=t.Interactable;e.prototype.getAction=function(e,n,r,o){var i=function(t,e,n,r,o){var i=t.getRect(r),a={action:null,interactable:t,interaction:n,element:r,rect:i,buttons:e.buttons||{0:1,1:4,3:8,4:16}[e.button]};return o.fire("auto-start:check",a),a.action}(this,n,r,o,t);return this.options.actionChecker?this.options.actionChecker(e,n,i,this,o,r):i},e.prototype.ignoreFrom=(0,Yt.warnOnce)((function(t){return this._backCompatOption("ignoreFrom",t)}),"Interactable.ignoreFrom() has been deprecated. Use Interactble.draggable({ignoreFrom: newValue})."),e.prototype.allowFrom=(0,Yt.warnOnce)((function(t){return this._backCompatOption("allowFrom",t)}),"Interactable.allowFrom() has been deprecated. Use Interactble.draggable({allowFrom: newValue})."),e.prototype.actionChecker=Lt,e.prototype.styleCursor=Wt}};Bt.default=Ut;var Vt={};function Nt(t,e,n,r,o){return e.testIgnoreAllow(e.options[t.name],n,r)&&e.options[t.name].enabled&&Ht(e,n,t,o)?t:null}function qt(t,e,n,r,o,i,a){for(var s=0,l=r.length;s<l;s++){var u=r[s],c=o[s],f=u.getAction(e,n,t,c);if(f){var d=Nt(f,u,c,i,a);if(d)return{action:d,interactable:u,element:c}}}return{action:null,interactable:null,element:null}}function $t(t,e,n,r,o){var a=[],s=[],l=r;function u(t){a.push(t),s.push(l)}for(;i.default.element(l);){a=[],s=[],o.interactables.forEachMatch(l,u);var c=qt(t,e,n,a,s,r,o);if(c.action&&!c.interactable.options[c.action.name].manualStart)return c;l=_.parentNode(l)}return{action:null,interactable:null,element:null}}function Gt(t,e,n){var r=e.action,o=e.interactable,i=e.element;r=r||{name:null},t.interactable=o,t.element=i,(0,Yt.copyAction)(t.prepared,r),t.rect=o&&r.name?o.getRect(i):null,Jt(t,n),n.fire("autoStart:prepared",{interaction:t})}function Ht(t,e,n,r){var o=t.options,i=o[n.name].max,a=o[n.name].maxPerElement,s=r.autoStart.maxInteractions,l=0,u=0,c=0;if(!(i&&a&&s))return!1;for(var f=0;f<r.interactions.list.length;f++){var d=r.interactions.list[f],p=d.prepared.name;if(d.interacting()){if(++l>=s)return!1;if(d.interactable===t){if((u+=p===n.name?1:0)>=i)return!1;if(d.element===e&&(c++,p===n.name&&c>=a))return!1}}}return s>0}function Kt(t,e){return i.default.number(t)?(e.autoStart.maxInteractions=t,this):e.autoStart.maxInteractions}function Zt(t,e,n){var r=n.autoStart.cursorElement;r&&r!==t&&(r.style.cursor=""),t.ownerDocument.documentElement.style.cursor=e,t.style.cursor=e,n.autoStart.cursorElement=e?t:null}function Jt(t,e){var n=t.interactable,r=t.element,o=t.prepared;if("mouse"===t.pointerType&&n&&n.options.styleCursor){var a="";if(o.name){var s=n.options[o.name].cursorChecker;a=i.default.func(s)?s(o,n,r,t._interacting):e.actions.map[o.name].getCursor(o)}Zt(t.element,a||"",e)}else e.autoStart.cursorElement&&Zt(e.autoStart.cursorElement,"",e)}Object.defineProperty(Vt,"__esModule",{value:!0}),Vt.default=void 0;var Qt={id:"auto-start/base",before:["actions"],install:function(t){var e=t.interactStatic,n=t.defaults;t.usePlugin(Bt.default),n.base.actionChecker=null,n.base.styleCursor=!0,(0,j.default)(n.perAction,{manualStart:!1,max:1/0,maxPerElement:1,allowFrom:null,ignoreFrom:null,mouseButtons:1}),e.maxInteractions=function(e){return Kt(e,t)},t.autoStart={maxInteractions:1/0,withinInteractionLimit:Ht,cursorElement:null}},listeners:{"interactions:down":function(t,e){var n=t.interaction,r=t.pointer,o=t.event,i=t.eventTarget;n.interacting()||Gt(n,$t(n,r,o,i,e),e)},"interactions:move":function(t,e){!function(t,e){var n=t.interaction,r=t.pointer,o=t.event,i=t.eventTarget;"mouse"!==n.pointerType||n.pointerIsDown||n.interacting()||Gt(n,$t(n,r,o,i,e),e)}(t,e),function(t,e){var n=t.interaction;if(n.pointerIsDown&&!n.interacting()&&n.pointerWasMoved&&n.prepared.name){e.fire("autoStart:before-start",t);var r=n.interactable,o=n.prepared.name;o&&r&&(r.options[o].manualStart||!Ht(r,n.element,n.prepared,e)?n.stop():(n.start(n.prepared,r,n.element),Jt(n,e)))}}(t,e)},"interactions:stop":function(t,e){var n=t.interaction,r=n.interactable;r&&r.options.styleCursor&&Zt(n.element,"",e)}},maxInteractions:Kt,withinInteractionLimit:Ht,validateAction:Nt};Vt.default=Qt;var te={};Object.defineProperty(te,"__esModule",{value:!0}),te.default=void 0;var ee={id:"auto-start/dragAxis",listeners:{"autoStart:before-start":function(t,e){var n=t.interaction,r=t.eventTarget,o=t.dx,a=t.dy;if("drag"===n.prepared.name){var s=Math.abs(o),l=Math.abs(a),u=n.interactable.options.drag,c=u.startAxis,f=s>l?"x":s<l?"y":"xy";if(n.prepared.axis="start"===u.lockAxis?f[0]:u.lockAxis,"xy"!==f&&"xy"!==c&&c!==f){n.prepared.name=null;for(var d=r,p=function(t){if(t!==n.interactable){var o=n.interactable.options.drag;if(!o.manualStart&&t.testIgnoreAllow(o,d,r)){var i=t.getAction(n.downPointer,n.downEvent,n,d);if(i&&"drag"===i.name&&function(t,e){if(!e)return!1;var n=e.options.drag.startAxis;return"xy"===t||"xy"===n||n===t}(f,t)&&Vt.default.validateAction(i,t,d,r,e))return t}}};i.default.element(d);){var v=e.interactables.forEachMatch(d,p);if(v){n.prepared.name="drag",n.interactable=v,n.element=d;break}d=(0,_.parentNode)(d)}}}}}};te.default=ee;var ne={};function re(t){var e=t.prepared&&t.prepared.name;if(!e)return null;var n=t.interactable.options;return n[e].hold||n[e].delay}Object.defineProperty(ne,"__esModule",{value:!0}),ne.default=void 0;var oe={id:"auto-start/hold",install:function(t){var e=t.defaults;t.usePlugin(Vt.default),e.perAction.hold=0,e.perAction.delay=0},listeners:{"interactions:new":function(t){t.interaction.autoStartHoldTimer=null},"autoStart:prepared":function(t){var e=t.interaction,n=re(e);n>0&&(e.autoStartHoldTimer=setTimeout((function(){e.start(e.prepared,e.interactable,e.element)}),n))},"interactions:move":function(t){var e=t.interaction,n=t.duplicate;e.autoStartHoldTimer&&e.pointerWasMoved&&!n&&(clearTimeout(e.autoStartHoldTimer),e.autoStartHoldTimer=null)},"autoStart:before-start":function(t){var e=t.interaction;re(e)>0&&(e.prepared.name=null)}},getHoldDuration:re};ne.default=oe;var ie={};Object.defineProperty(ie,"__esModule",{value:!0}),ie.default=void 0;var ae={id:"auto-start",install:function(t){t.usePlugin(Vt.default),t.usePlugin(ne.default),t.usePlugin(te.default)}};ie.default=ae;var se={};function le(t){return/^(always|never|auto)$/.test(t)?(this.options.preventDefault=t,this):i.default.bool(t)?(this.options.preventDefault=t?"always":"never",this):this.options.preventDefault}function ue(t){var e=t.interaction,n=t.event;e.interactable&&e.interactable.checkAndPreventDefault(n)}function ce(t){var n=t.Interactable;n.prototype.preventDefault=le,n.prototype.checkAndPreventDefault=function(n){return function(t,n,r){var o=t.options.preventDefault;if("never"!==o)if("always"!==o){if(n.events.supportsPassive&&/^touch(start|move)$/.test(r.type)){var a=(0,e.getWindow)(r.target).document,s=n.getDocOptions(a);if(!s||!s.events||!1!==s.events.passive)return}/^(mouse|pointer|touch)*(down|start)/i.test(r.type)||i.default.element(r.target)&&(0,_.matchesSelector)(r.target,"input,select,textarea,[contenteditable=true],[contenteditable=true] *")||r.preventDefault()}else r.preventDefault()}(this,t,n)},t.interactions.docEvents.push({type:"dragstart",listener:function(e){for(var n=0;n<t.interactions.list.length;n++){var r=t.interactions.list[n];if(r.element&&(r.element===e.target||(0,_.nodeContains)(r.element,e.target)))return void r.interactable.checkAndPreventDefault(e)}}})}Object.defineProperty(se,"__esModule",{value:!0}),se.install=ce,se.default=void 0;var fe={id:"core/interactablePreventDefault",install:ce,listeners:["down","move","up","cancel"].reduce((function(t,e){return t["interactions:".concat(e)]=ue,t}),{})};se.default=fe;var de={};Object.defineProperty(de,"__esModule",{value:!0}),de.default=void 0,de.default={};var pe,ve={};Object.defineProperty(ve,"__esModule",{value:!0}),ve.default=void 0,function(t){t.touchAction="touchAction",t.boxSizing="boxSizing",t.noListeners="noListeners"}(pe||(pe={}));pe.touchAction,pe.boxSizing,pe.noListeners;var he={id:"dev-tools",install:function(){}};ve.default=he;var ge={};Object.defineProperty(ge,"__esModule",{value:!0}),ge.default=function t(e){var n={};for(var r in e){var o=e[r];i.default.plainObject(o)?n[r]=t(o):i.default.array(o)?n[r]=Z.from(o):n[r]=o}return n};var ye={};function me(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}return n}}(t,e)||function(t,e){if(t){if("string"==typeof t)return be(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?be(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function be(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=Array(e);n<e;n++)r[n]=t[n];return r}function xe(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function we(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(ye,"__esModule",{value:!0}),ye.getRectOffset=Oe,ye.default=void 0;var _e=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),we(this,"states",[]),we(this,"startOffset",{left:0,right:0,top:0,bottom:0}),we(this,"startDelta",void 0),we(this,"result",void 0),we(this,"endResult",void 0),we(this,"edges",void 0),we(this,"interaction",void 0),this.interaction=e,this.result=Pe()}var e,n;return e=t,(n=[{key:"start",value:function(t,e){var n=t.phase,r=this.interaction,o=function(t){var e=t.interactable.options[t.prepared.name],n=e.modifiers;return n&&n.length?n:["snap","snapSize","snapEdges","restrict","restrictEdges","restrictSize"].map((function(t){var n=e[t];return n&&n.enabled&&{options:n,methods:n._methods}})).filter((function(t){return!!t}))}(r);this.prepareStates(o),this.edges=(0,j.default)({},r.edges),this.startOffset=Oe(r.rect,e),this.startDelta={x:0,y:0};var i=this.fillArg({phase:n,pageCoords:e,preEnd:!1});return this.result=Pe(),this.startAll(i),this.result=this.setAll(i)}},{key:"fillArg",value:function(t){var e=this.interaction;return t.interaction=e,t.interactable=e.interactable,t.element=e.element,t.rect=t.rect||e.rect,t.edges=this.edges,t.startOffset=this.startOffset,t}},{key:"startAll",value:function(t){for(var e=0;e<this.states.length;e++){var n=this.states[e];n.methods.start&&(t.state=n,n.methods.start(t))}}},{key:"setAll",value:function(t){var e=t.phase,n=t.preEnd,r=t.skipModifiers,o=t.rect;t.coords=(0,j.default)({},t.pageCoords),t.rect=(0,j.default)({},o);for(var i=r?this.states.slice(r):this.states,a=Pe(t.coords,t.rect),s=0;s<i.length;s++){var l,u=i[s],c=u.options,f=(0,j.default)({},t.coords),d=null;null!=(l=u.methods)&&l.set&&this.shouldDo(c,n,e)&&(t.state=u,d=u.methods.set(t),k.addEdges(this.interaction.edges,t.rect,{x:t.coords.x-f.x,y:t.coords.y-f.y})),a.eventProps.push(d)}a.delta.x=t.coords.x-t.pageCoords.x,a.delta.y=t.coords.y-t.pageCoords.y,a.rectDelta.left=t.rect.left-o.left,a.rectDelta.right=t.rect.right-o.right,a.rectDelta.top=t.rect.top-o.top,a.rectDelta.bottom=t.rect.bottom-o.bottom;var p=this.result.coords,v=this.result.rect;if(p&&v){var h=a.rect.left!==v.left||a.rect.right!==v.right||a.rect.top!==v.top||a.rect.bottom!==v.bottom;a.changed=h||p.x!==a.coords.x||p.y!==a.coords.y}return a}},{key:"applyToInteraction",value:function(t){var e=this.interaction,n=t.phase,r=e.coords.cur,o=e.coords.start,i=this.result,a=this.startDelta,s=i.delta;"start"===n&&(0,j.default)(this.startDelta,i.delta);for(var l=0;l<[[o,a],[r,s]].length;l++){var u=me([[o,a],[r,s]][l],2),c=u[0],f=u[1];c.page.x+=f.x,c.page.y+=f.y,c.client.x+=f.x,c.client.y+=f.y}var d=this.result.rectDelta,p=t.rect||e.rect;p.left+=d.left,p.right+=d.right,p.top+=d.top,p.bottom+=d.bottom,p.width=p.right-p.left,p.height=p.bottom-p.top}},{key:"setAndApply",value:function(t){var e=this.interaction,n=t.phase,r=t.preEnd,o=t.skipModifiers,i=this.setAll(this.fillArg({preEnd:r,phase:n,pageCoords:t.modifiedCoords||e.coords.cur.page}));if(this.result=i,!i.changed&&(!o||o<this.states.length)&&e.interacting())return!1;if(t.modifiedCoords){var a=e.coords.cur.page,s={x:t.modifiedCoords.x-a.x,y:t.modifiedCoords.y-a.y};i.coords.x+=s.x,i.coords.y+=s.y,i.delta.x+=s.x,i.delta.y+=s.y}this.applyToInteraction(t)}},{key:"beforeEnd",value:function(t){var e=t.interaction,n=t.event,r=this.states;if(r&&r.length){for(var o=!1,i=0;i<r.length;i++){var a=r[i];t.state=a;var s=a.options,l=a.methods,u=l.beforeEnd&&l.beforeEnd(t);if(u)return this.endResult=u,!1;o=o||!o&&this.shouldDo(s,!0,t.phase,!0)}o&&e.move({event:n,preEnd:!0})}}},{key:"stop",value:function(t){var e=t.interaction;if(this.states&&this.states.length){var n=(0,j.default)({states:this.states,interactable:e.interactable,element:e.element,rect:null},t);this.fillArg(n);for(var r=0;r<this.states.length;r++){var o=this.states[r];n.state=o,o.methods.stop&&o.methods.stop(n)}this.states=null,this.endResult=null}}},{key:"prepareStates",value:function(t){this.states=[];for(var e=0;e<t.length;e++){var n=t[e],r=n.options,o=n.methods,i=n.name;this.states.push({options:r,methods:o,index:e,name:i})}return this.states}},{key:"restoreInteractionCoords",value:function(t){var e=t.interaction,n=e.coords,r=e.rect,o=e.modification;if(o.result){for(var i=o.startDelta,a=o.result,s=a.delta,l=a.rectDelta,u=[[n.start,i],[n.cur,s]],c=0;c<u.length;c++){var f=me(u[c],2),d=f[0],p=f[1];d.page.x-=p.x,d.page.y-=p.y,d.client.x-=p.x,d.client.y-=p.y}r.left-=l.left,r.right-=l.right,r.top-=l.top,r.bottom-=l.bottom}}},{key:"shouldDo",value:function(t,e,n,r){return!(!t||!1===t.enabled||r&&!t.endOnly||t.endOnly&&!e||"start"===n&&!t.setStart)}},{key:"copyFrom",value:function(t){this.startOffset=t.startOffset,this.startDelta=t.startDelta,this.edges=t.edges,this.states=t.states.map((function(t){return(0,ge.default)(t)})),this.result=Pe((0,j.default)({},t.result.coords),(0,j.default)({},t.result.rect))}},{key:"destroy",value:function(){for(var t in this)this[t]=null}}])&&xe(e.prototype,n),t}();function Pe(t,e){return{rect:e,coords:t,delta:{x:0,y:0},rectDelta:{left:0,right:0,top:0,bottom:0},eventProps:[],changed:!0}}function Oe(t,e){return t?{left:e.x-t.left,top:e.y-t.top,right:t.right-e.x,bottom:t.bottom-e.y}:{left:0,top:0,right:0,bottom:0}}ye.default=_e;var Se={};function Ee(t){var e=t.iEvent,n=t.interaction.modification.result;n&&(e.modifiers=n.eventProps)}Object.defineProperty(Se,"__esModule",{value:!0}),Se.makeModifier=function(t,e){var n=t.defaults,r={start:t.start,set:t.set,beforeEnd:t.beforeEnd,stop:t.stop},o=function(t){var o=t||{};for(var i in o.enabled=!1!==o.enabled,n)i in o||(o[i]=n[i]);var a={options:o,methods:r,name:e,enable:function(){return o.enabled=!0,a},disable:function(){return o.enabled=!1,a}};return a};return e&&"string"==typeof e&&(o._defaults=n,o._methods=r),o},Se.addEventModifiers=Ee,Se.default=void 0;var Te={id:"modifiers/base",before:["actions"],install:function(t){t.defaults.perAction.modifiers=[]},listeners:{"interactions:new":function(t){var e=t.interaction;e.modification=new ye.default(e)},"interactions:before-action-start":function(t){var e=t.interaction.modification;e.start(t,t.interaction.coords.start.page),t.interaction.edges=e.edges,e.applyToInteraction(t)},"interactions:before-action-move":function(t){return t.interaction.modification.setAndApply(t)},"interactions:before-action-end":function(t){return t.interaction.modification.beforeEnd(t)},"interactions:action-start":Ee,"interactions:action-move":Ee,"interactions:action-end":Ee,"interactions:after-action-start":function(t){return t.interaction.modification.restoreInteractionCoords(t)},"interactions:after-action-move":function(t){return t.interaction.modification.restoreInteractionCoords(t)},"interactions:stop":function(t){return t.interaction.modification.stop(t)}}};Se.default=Te;var Me={};Object.defineProperty(Me,"__esModule",{value:!0}),Me.defaults=void 0,Me.defaults={base:{preventDefault:"auto",deltaSource:"page"},perAction:{enabled:!1,origin:{x:0,y:0}},actions:{}};var je={};function ke(t){return(ke="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Ie(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function De(t,e){return(De=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function Ae(t,e){return!e||"object"!==ke(e)&&"function"!=typeof e?Re(t):e}function Re(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function ze(t){return(ze=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function Ce(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(je,"__esModule",{value:!0}),je.InteractEvent=void 0;var Fe=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&De(t,e)}(a,t);var e,n,r,o,i=(r=a,o=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}(),function(){var t,e=ze(r);if(o){var n=ze(this).constructor;t=Reflect.construct(e,arguments,n)}else t=e.apply(this,arguments);return Ae(this,t)});function a(t,e,n,r,o,s,l){var u;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,a),Ce(Re(u=i.call(this,t)),"target",void 0),Ce(Re(u),"currentTarget",void 0),Ce(Re(u),"relatedTarget",null),Ce(Re(u),"screenX",void 0),Ce(Re(u),"screenY",void 0),Ce(Re(u),"button",void 0),Ce(Re(u),"buttons",void 0),Ce(Re(u),"ctrlKey",void 0),Ce(Re(u),"shiftKey",void 0),Ce(Re(u),"altKey",void 0),Ce(Re(u),"metaKey",void 0),Ce(Re(u),"page",void 0),Ce(Re(u),"client",void 0),Ce(Re(u),"delta",void 0),Ce(Re(u),"rect",void 0),Ce(Re(u),"x0",void 0),Ce(Re(u),"y0",void 0),Ce(Re(u),"t0",void 0),Ce(Re(u),"dt",void 0),Ce(Re(u),"duration",void 0),Ce(Re(u),"clientX0",void 0),Ce(Re(u),"clientY0",void 0),Ce(Re(u),"velocity",void 0),Ce(Re(u),"speed",void 0),Ce(Re(u),"swipe",void 0),Ce(Re(u),"timeStamp",void 0),Ce(Re(u),"axes",void 0),Ce(Re(u),"preEnd",void 0),o=o||t.element;var c=t.interactable,f=(c&&c.options||Me.defaults).deltaSource,d=(0,A.default)(c,o,n),p="start"===r,v="end"===r,h=p?Re(u):t.prevEvent,g=p?t.coords.start:v?{page:h.page,client:h.client,timeStamp:t.coords.cur.timeStamp}:t.coords.cur;return u.page=(0,j.default)({},g.page),u.client=(0,j.default)({},g.client),u.rect=(0,j.default)({},t.rect),u.timeStamp=g.timeStamp,v||(u.page.x-=d.x,u.page.y-=d.y,u.client.x-=d.x,u.client.y-=d.y),u.ctrlKey=e.ctrlKey,u.altKey=e.altKey,u.shiftKey=e.shiftKey,u.metaKey=e.metaKey,u.button=e.button,u.buttons=e.buttons,u.target=o,u.currentTarget=o,u.preEnd=s,u.type=l||n+(r||""),u.interactable=c,u.t0=p?t.pointers[t.pointers.length-1].downTime:h.t0,u.x0=t.coords.start.page.x-d.x,u.y0=t.coords.start.page.y-d.y,u.clientX0=t.coords.start.client.x-d.x,u.clientY0=t.coords.start.client.y-d.y,u.delta=p||v?{x:0,y:0}:{x:u[f].x-h[f].x,y:u[f].y-h[f].y},u.dt=t.coords.delta.timeStamp,u.duration=u.timeStamp-u.t0,u.velocity=(0,j.default)({},t.coords.velocity[f]),u.speed=(0,C.default)(u.velocity.x,u.velocity.y),u.swipe=v||"inertiastart"===r?u.getSwipe():null,u}return e=a,(n=[{key:"getSwipe",value:function(){var t=this._interaction;if(t.prevEvent.speed<600||this.timeStamp-t.prevEvent.timeStamp>150)return null;var e=180*Math.atan2(t.prevEvent.velocityY,t.prevEvent.velocityX)/Math.PI;e<0&&(e+=360);var n=112.5<=e&&e<247.5,r=202.5<=e&&e<337.5;return{up:r,down:!r&&22.5<=e&&e<157.5,left:n,right:!n&&(292.5<=e||e<67.5),angle:e,speed:t.prevEvent.speed,velocity:{x:t.prevEvent.velocityX,y:t.prevEvent.velocityY}}}},{key:"preventDefault",value:function(){}},{key:"stopImmediatePropagation",value:function(){this.immediatePropagationStopped=this.propagationStopped=!0}},{key:"stopPropagation",value:function(){this.propagationStopped=!0}}])&&Ie(e.prototype,n),a}($.BaseEvent);je.InteractEvent=Fe,Object.defineProperties(Fe.prototype,{pageX:{get:function(){return this.page.x},set:function(t){this.page.x=t}},pageY:{get:function(){return this.page.y},set:function(t){this.page.y=t}},clientX:{get:function(){return this.client.x},set:function(t){this.client.x=t}},clientY:{get:function(){return this.client.y},set:function(t){this.client.y=t}},dx:{get:function(){return this.delta.x},set:function(t){this.delta.x=t}},dy:{get:function(){return this.delta.y},set:function(t){this.delta.y=t}},velocityX:{get:function(){return this.velocity.x},set:function(t){this.velocity.x=t}},velocityY:{get:function(){return this.velocity.y},set:function(t){this.velocity.y=t}}});var Xe={};function Ye(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(Xe,"__esModule",{value:!0}),Xe.PointerInfo=void 0,Xe.PointerInfo=function t(e,n,r,o,i){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),Ye(this,"id",void 0),Ye(this,"pointer",void 0),Ye(this,"event",void 0),Ye(this,"downTime",void 0),Ye(this,"downTarget",void 0),this.id=e,this.pointer=n,this.event=r,this.downTime=o,this.downTarget=i};var Be,We,Le={};function Ue(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function Ve(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(Le,"__esModule",{value:!0}),Object.defineProperty(Le,"PointerInfo",{enumerable:!0,get:function(){return Xe.PointerInfo}}),Le.default=Le.Interaction=Le._ProxyMethods=Le._ProxyValues=void 0,Le._ProxyValues=Be,function(t){t.interactable="",t.element="",t.prepared="",t.pointerIsDown="",t.pointerWasMoved="",t._proxy=""}(Be||(Le._ProxyValues=Be={})),Le._ProxyMethods=We,function(t){t.start="",t.move="",t.end="",t.stop="",t.interacting=""}(We||(Le._ProxyMethods=We={}));var Ne=0,qe=function(){function t(e){var n=this,r=e.pointerType,o=e.scopeFire;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),Ve(this,"interactable",null),Ve(this,"element",null),Ve(this,"rect",void 0),Ve(this,"_rects",void 0),Ve(this,"edges",void 0),Ve(this,"_scopeFire",void 0),Ve(this,"prepared",{name:null,axis:null,edges:null}),Ve(this,"pointerType",void 0),Ve(this,"pointers",[]),Ve(this,"downEvent",null),Ve(this,"downPointer",{}),Ve(this,"_latestPointer",{pointer:null,event:null,eventTarget:null}),Ve(this,"prevEvent",null),Ve(this,"pointerIsDown",!1),Ve(this,"pointerWasMoved",!1),Ve(this,"_interacting",!1),Ve(this,"_ending",!1),Ve(this,"_stopped",!0),Ve(this,"_proxy",null),Ve(this,"simulation",null),Ve(this,"doMove",(0,Yt.warnOnce)((function(t){this.move(t)}),"The interaction.doMove() method has been renamed to interaction.move()")),Ve(this,"coords",{start:B.newCoords(),prev:B.newCoords(),cur:B.newCoords(),delta:B.newCoords(),velocity:B.newCoords()}),Ve(this,"_id",Ne++),this._scopeFire=o,this.pointerType=r;var i=this;this._proxy={};var a=function(t){Object.defineProperty(n._proxy,t,{get:function(){return i[t]}})};for(var s in Be)a(s);var l=function(t){Object.defineProperty(n._proxy,t,{value:function(){return i[t].apply(i,arguments)}})};for(var u in We)l(u);this._scopeFire("interactions:new",{interaction:this})}var e,n;return e=t,(n=[{key:"pointerMoveTolerance",get:function(){return 1}},{key:"pointerDown",value:function(t,e,n){var r=this.updatePointer(t,e,n,!0),o=this.pointers[r];this._scopeFire("interactions:down",{pointer:t,event:e,eventTarget:n,pointerIndex:r,pointerInfo:o,type:"down",interaction:this})}},{key:"start",value:function(t,e,n){return!(this.interacting()||!this.pointerIsDown||this.pointers.length<("gesture"===t.name?2:1)||!e.options[t.name].enabled)&&((0,Yt.copyAction)(this.prepared,t),this.interactable=e,this.element=n,this.rect=e.getRect(n),this.edges=this.prepared.edges?(0,j.default)({},this.prepared.edges):{left:!0,right:!0,top:!0,bottom:!0},this._stopped=!1,this._interacting=this._doPhase({interaction:this,event:this.downEvent,phase:"start"})&&!this._stopped,this._interacting)}},{key:"pointerMove",value:function(t,e,n){this.simulation||this.modification&&this.modification.endResult||this.updatePointer(t,e,n,!1);var r,o,i=this.coords.cur.page.x===this.coords.prev.page.x&&this.coords.cur.page.y===this.coords.prev.page.y&&this.coords.cur.client.x===this.coords.prev.client.x&&this.coords.cur.client.y===this.coords.prev.client.y;this.pointerIsDown&&!this.pointerWasMoved&&(r=this.coords.cur.client.x-this.coords.start.client.x,o=this.coords.cur.client.y-this.coords.start.client.y,this.pointerWasMoved=(0,C.default)(r,o)>this.pointerMoveTolerance);var a=this.getPointerIndex(t),s={pointer:t,pointerIndex:a,pointerInfo:this.pointers[a],event:e,type:"move",eventTarget:n,dx:r,dy:o,duplicate:i,interaction:this};i||B.setCoordVelocity(this.coords.velocity,this.coords.delta),this._scopeFire("interactions:move",s),i||this.simulation||(this.interacting()&&(s.type=null,this.move(s)),this.pointerWasMoved&&B.copyCoords(this.coords.prev,this.coords.cur))}},{key:"move",value:function(t){t&&t.event||B.setZeroCoords(this.coords.delta),(t=(0,j.default)({pointer:this._latestPointer.pointer,event:this._latestPointer.event,eventTarget:this._latestPointer.eventTarget,interaction:this},t||{})).phase="move",this._doPhase(t)}},{key:"pointerUp",value:function(t,e,n,r){var o=this.getPointerIndex(t);-1===o&&(o=this.updatePointer(t,e,n,!1));var i=/cancel$/i.test(e.type)?"cancel":"up";this._scopeFire("interactions:".concat(i),{pointer:t,pointerIndex:o,pointerInfo:this.pointers[o],event:e,eventTarget:n,type:i,curEventTarget:r,interaction:this}),this.simulation||this.end(e),this.removePointer(t,e)}},{key:"documentBlur",value:function(t){this.end(t),this._scopeFire("interactions:blur",{event:t,type:"blur",interaction:this})}},{key:"end",value:function(t){var e;this._ending=!0,t=t||this._latestPointer.event,this.interacting()&&(e=this._doPhase({event:t,interaction:this,phase:"end"})),this._ending=!1,!0===e&&this.stop()}},{key:"currentAction",value:function(){return this._interacting?this.prepared.name:null}},{key:"interacting",value:function(){return this._interacting}},{key:"stop",value:function(){this._scopeFire("interactions:stop",{interaction:this}),this.interactable=this.element=null,this._interacting=!1,this._stopped=!0,this.prepared.name=this.prevEvent=null}},{key:"getPointerIndex",value:function(t){var e=B.getPointerId(t);return"mouse"===this.pointerType||"pen"===this.pointerType?this.pointers.length-1:Z.findIndex(this.pointers,(function(t){return t.id===e}))}},{key:"getPointerInfo",value:function(t){return this.pointers[this.getPointerIndex(t)]}},{key:"updatePointer",value:function(t,e,n,r){var o=B.getPointerId(t),i=this.getPointerIndex(t),a=this.pointers[i];return r=!1!==r&&(r||/(down|start)$/i.test(e.type)),a?a.pointer=t:(a=new Xe.PointerInfo(o,t,e,null,null),i=this.pointers.length,this.pointers.push(a)),B.setCoords(this.coords.cur,this.pointers.map((function(t){return t.pointer})),this._now()),B.setCoordDeltas(this.coords.delta,this.coords.prev,this.coords.cur),r&&(this.pointerIsDown=!0,a.downTime=this.coords.cur.timeStamp,a.downTarget=n,B.pointerExtend(this.downPointer,t),this.interacting()||(B.copyCoords(this.coords.start,this.coords.cur),B.copyCoords(this.coords.prev,this.coords.cur),this.downEvent=e,this.pointerWasMoved=!1)),this._updateLatestPointer(t,e,n),this._scopeFire("interactions:update-pointer",{pointer:t,event:e,eventTarget:n,down:r,pointerInfo:a,pointerIndex:i,interaction:this}),i}},{key:"removePointer",value:function(t,e){var n=this.getPointerIndex(t);if(-1!==n){var r=this.pointers[n];this._scopeFire("interactions:remove-pointer",{pointer:t,event:e,eventTarget:null,pointerIndex:n,pointerInfo:r,interaction:this}),this.pointers.splice(n,1),this.pointerIsDown=!1}}},{key:"_updateLatestPointer",value:function(t,e,n){this._latestPointer.pointer=t,this._latestPointer.event=e,this._latestPointer.eventTarget=n}},{key:"destroy",value:function(){this._latestPointer.pointer=null,this._latestPointer.event=null,this._latestPointer.eventTarget=null}},{key:"_createPreparedEvent",value:function(t,e,n,r){return new je.InteractEvent(this,t,this.prepared.name,e,this.element,n,r)}},{key:"_fireEvent",value:function(t){this.interactable.fire(t),(!this.prevEvent||t.timeStamp>=this.prevEvent.timeStamp)&&(this.prevEvent=t)}},{key:"_doPhase",value:function(t){var e=t.event,n=t.phase,r=t.preEnd,o=t.type,i=this.rect;if(i&&"move"===n&&(k.addEdges(this.edges,i,this.coords.delta[this.interactable.options.deltaSource]),i.width=i.right-i.left,i.height=i.bottom-i.top),!1===this._scopeFire("interactions:before-action-".concat(n),t))return!1;var a=t.iEvent=this._createPreparedEvent(e,n,r,o);return this._scopeFire("interactions:action-".concat(n),t),"start"===n&&(this.prevEvent=a),this._fireEvent(a),this._scopeFire("interactions:after-action-".concat(n),t),!0}},{key:"_now",value:function(){return Date.now()}}])&&Ue(e.prototype,n),t}();Le.Interaction=qe;var $e=qe;Le.default=$e;var Ge={};function He(t){t.pointerIsDown&&(Qe(t.coords.cur,t.offset.total),t.offset.pending.x=0,t.offset.pending.y=0)}function Ke(t){Ze(t.interaction)}function Ze(t){if(!function(t){return!(!t.offset.pending.x&&!t.offset.pending.y)}(t))return!1;var e=t.offset.pending;return Qe(t.coords.cur,e),Qe(t.coords.delta,e),k.addEdges(t.edges,t.rect,e),e.x=0,e.y=0,!0}function Je(t){var e=t.x,n=t.y;this.offset.pending.x+=e,this.offset.pending.y+=n,this.offset.total.x+=e,this.offset.total.y+=n}function Qe(t,e){var n=t.page,r=t.client,o=e.x,i=e.y;n.x+=o,n.y+=i,r.x+=o,r.y+=i}Object.defineProperty(Ge,"__esModule",{value:!0}),Ge.addTotal=He,Ge.applyPending=Ze,Ge.default=void 0,Le._ProxyMethods.offsetBy="";var tn={id:"offset",before:["modifiers","pointer-events","actions","inertia"],install:function(t){t.Interaction.prototype.offsetBy=Je},listeners:{"interactions:new":function(t){t.interaction.offset={total:{x:0,y:0},pending:{x:0,y:0}}},"interactions:update-pointer":function(t){return He(t.interaction)},"interactions:before-action-start":Ke,"interactions:before-action-move":Ke,"interactions:before-action-end":function(t){var e=t.interaction;if(Ze(e))return e.move({offset:!0}),e.end(),!1},"interactions:stop":function(t){var e=t.interaction;e.offset.total.x=0,e.offset.total.y=0,e.offset.pending.x=0,e.offset.pending.y=0}}};Ge.default=tn;var en={};function nn(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function rn(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(en,"__esModule",{value:!0}),en.default=en.InertiaState=void 0;var on=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),rn(this,"active",!1),rn(this,"isModified",!1),rn(this,"smoothEnd",!1),rn(this,"allowResume",!1),rn(this,"modification",void 0),rn(this,"modifierCount",0),rn(this,"modifierArg",void 0),rn(this,"startCoords",void 0),rn(this,"t0",0),rn(this,"v0",0),rn(this,"te",0),rn(this,"targetOffset",void 0),rn(this,"modifiedOffset",void 0),rn(this,"currentOffset",void 0),rn(this,"lambda_v0",0),rn(this,"one_ve_v0",0),rn(this,"timeout",void 0),rn(this,"interaction",void 0),this.interaction=e}var e,n;return e=t,(n=[{key:"start",value:function(t){var e=this.interaction,n=an(e);if(!n||!n.enabled)return!1;var r=e.coords.velocity.client,o=(0,C.default)(r.x,r.y),i=this.modification||(this.modification=new ye.default(e));if(i.copyFrom(e.modification),this.t0=e._now(),this.allowResume=n.allowResume,this.v0=o,this.currentOffset={x:0,y:0},this.startCoords=e.coords.cur.page,this.modifierArg=i.fillArg({pageCoords:this.startCoords,preEnd:!0,phase:"inertiastart"}),this.t0-e.coords.cur.timeStamp<50&&o>n.minSpeed&&o>n.endSpeed)this.startInertia();else{if(i.result=i.setAll(this.modifierArg),!i.result.changed)return!1;this.startSmoothEnd()}return e.modification.result.rect=null,e.offsetBy(this.targetOffset),e._doPhase({interaction:e,event:t,phase:"inertiastart"}),e.offsetBy({x:-this.targetOffset.x,y:-this.targetOffset.y}),e.modification.result.rect=null,this.active=!0,e.simulation=this,!0}},{key:"startInertia",value:function(){var t=this,e=this.interaction.coords.velocity.client,n=an(this.interaction),r=n.resistance,o=-Math.log(n.endSpeed/this.v0)/r;this.targetOffset={x:(e.x-o)/r,y:(e.y-o)/r},this.te=o,this.lambda_v0=r/this.v0,this.one_ve_v0=1-n.endSpeed/this.v0;var i=this.modification,a=this.modifierArg;a.pageCoords={x:this.startCoords.x+this.targetOffset.x,y:this.startCoords.y+this.targetOffset.y},i.result=i.setAll(a),i.result.changed&&(this.isModified=!0,this.modifiedOffset={x:this.targetOffset.x+i.result.delta.x,y:this.targetOffset.y+i.result.delta.y}),this.onNextFrame((function(){return t.inertiaTick()}))}},{key:"startSmoothEnd",value:function(){var t=this;this.smoothEnd=!0,this.isModified=!0,this.targetOffset={x:this.modification.result.delta.x,y:this.modification.result.delta.y},this.onNextFrame((function(){return t.smoothEndTick()}))}},{key:"onNextFrame",value:function(t){var e=this;this.timeout=jt.default.request((function(){e.active&&t()}))}},{key:"inertiaTick",value:function(){var t,e,n,r,o,i=this,a=this.interaction,s=an(a).resistance,l=(a._now()-this.t0)/1e3;if(l<this.te){var u,c=1-(Math.exp(-s*l)-this.lambda_v0)/this.one_ve_v0;this.isModified?(0,0,t=this.targetOffset.x,e=this.targetOffset.y,n=this.modifiedOffset.x,r=this.modifiedOffset.y,u={x:sn(o=c,0,t,n),y:sn(o,0,e,r)}):u={x:this.targetOffset.x*c,y:this.targetOffset.y*c};var f={x:u.x-this.currentOffset.x,y:u.y-this.currentOffset.y};this.currentOffset.x+=f.x,this.currentOffset.y+=f.y,a.offsetBy(f),a.move(),this.onNextFrame((function(){return i.inertiaTick()}))}else a.offsetBy({x:this.modifiedOffset.x-this.currentOffset.x,y:this.modifiedOffset.y-this.currentOffset.y}),this.end()}},{key:"smoothEndTick",value:function(){var t=this,e=this.interaction,n=e._now()-this.t0,r=an(e).smoothEndDuration;if(n<r){var o={x:ln(n,0,this.targetOffset.x,r),y:ln(n,0,this.targetOffset.y,r)},i={x:o.x-this.currentOffset.x,y:o.y-this.currentOffset.y};this.currentOffset.x+=i.x,this.currentOffset.y+=i.y,e.offsetBy(i),e.move({skipModifiers:this.modifierCount}),this.onNextFrame((function(){return t.smoothEndTick()}))}else e.offsetBy({x:this.targetOffset.x-this.currentOffset.x,y:this.targetOffset.y-this.currentOffset.y}),this.end()}},{key:"resume",value:function(t){var e=t.pointer,n=t.event,r=t.eventTarget,o=this.interaction;o.offsetBy({x:-this.currentOffset.x,y:-this.currentOffset.y}),o.updatePointer(e,n,r,!0),o._doPhase({interaction:o,event:n,phase:"resume"}),(0,B.copyCoords)(o.coords.prev,o.coords.cur),this.stop()}},{key:"end",value:function(){this.interaction.move(),this.interaction.end(),this.stop()}},{key:"stop",value:function(){this.active=this.smoothEnd=!1,this.interaction.simulation=null,jt.default.cancel(this.timeout)}}])&&nn(e.prototype,n),t}();function an(t){var e=t.interactable,n=t.prepared;return e&&e.options&&n.name&&e.options[n.name].inertia}function sn(t,e,n,r){var o=1-t;return o*o*e+2*o*t*n+t*t*r}function ln(t,e,n,r){return-n*(t/=r)*(t-2)+e}en.InertiaState=on;var un={id:"inertia",before:["modifiers","actions"],install:function(t){var e=t.defaults;t.usePlugin(Ge.default),t.usePlugin(Se.default),t.actions.phases.inertiastart=!0,t.actions.phases.resume=!0,e.perAction.inertia={enabled:!1,resistance:10,minSpeed:100,endSpeed:10,allowResume:!0,smoothEndDuration:300}},listeners:{"interactions:new":function(t){var e=t.interaction;e.inertia=new on(e)},"interactions:before-action-end":function(t){var e=t.interaction,n=t.event;return(!e._interacting||e.simulation||!e.inertia.start(n))&&null},"interactions:down":function(t){var e=t.interaction,n=t.eventTarget,r=e.inertia;if(r.active)for(var o=n;i.default.element(o);){if(o===e.element){r.resume(t);break}o=_.parentNode(o)}},"interactions:stop":function(t){var e=t.interaction.inertia;e.active&&e.stop()},"interactions:before-action-resume":function(t){var e=t.interaction.modification;e.stop(t),e.start(t,t.interaction.coords.cur.page),e.applyToInteraction(t)},"interactions:before-action-inertiastart":function(t){return t.interaction.modification.setAndApply(t)},"interactions:action-resume":Se.addEventModifiers,"interactions:action-inertiastart":Se.addEventModifiers,"interactions:after-action-inertiastart":function(t){return t.interaction.modification.restoreInteractionCoords(t)},"interactions:after-action-resume":function(t){return t.interaction.modification.restoreInteractionCoords(t)}}};en.default=un;var cn={};function fn(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function dn(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function pn(t,e){for(var n=0;n<e.length;n++){var r=e[n];if(t.immediatePropagationStopped)break;r(t)}}Object.defineProperty(cn,"__esModule",{value:!0}),cn.Eventable=void 0;var vn=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),dn(this,"options",void 0),dn(this,"types",{}),dn(this,"propagationStopped",!1),dn(this,"immediatePropagationStopped",!1),dn(this,"global",void 0),this.options=(0,j.default)({},e||{})}var e,n;return e=t,(n=[{key:"fire",value:function(t){var e,n=this.global;(e=this.types[t.type])&&pn(t,e),!t.propagationStopped&&n&&(e=n[t.type])&&pn(t,e)}},{key:"on",value:function(t,e){var n=(0,R.default)(t,e);for(t in n)this.types[t]=Z.merge(this.types[t]||[],n[t])}},{key:"off",value:function(t,e){var n=(0,R.default)(t,e);for(t in n){var r=this.types[t];if(r&&r.length)for(var o=0;o<n[t].length;o++){var i=n[t][o],a=r.indexOf(i);-1!==a&&r.splice(a,1)}}}},{key:"getRect",value:function(t){return null}}])&&fn(e.prototype,n),t}();cn.Eventable=vn;var hn={};Object.defineProperty(hn,"__esModule",{value:!0}),hn.default=function(t,e){if(e.phaselessTypes[t])return!0;for(var n in e.map)if(0===t.indexOf(n)&&t.substr(n.length)in e.phases)return!0;return!1};var gn={};Object.defineProperty(gn,"__esModule",{value:!0}),gn.createInteractStatic=function(t){var e=function e(n,r){var o=t.interactables.get(n,r);return o||((o=t.interactables.new(n,r)).events.global=e.globalEvents),o};return e.getPointerAverage=B.pointerAverage,e.getTouchBBox=B.touchBBox,e.getTouchDistance=B.touchDistance,e.getTouchAngle=B.touchAngle,e.getElementRect=_.getElementRect,e.getElementClientRect=_.getElementClientRect,e.matchesSelector=_.matchesSelector,e.closest=_.closest,e.globalEvents={},e.version="1.10.11",e.scope=t,e.use=function(t,e){return this.scope.usePlugin(t,e),this},e.isSet=function(t,e){return!!this.scope.interactables.get(t,e&&e.context)},e.on=(0,Yt.warnOnce)((function(t,e,n){if(i.default.string(t)&&-1!==t.search(" ")&&(t=t.trim().split(/ +/)),i.default.array(t)){for(var r=0;r<t.length;r++){var o=t[r];this.on(o,e,n)}return this}if(i.default.object(t)){for(var a in t)this.on(a,t[a],e);return this}return(0,hn.default)(t,this.scope.actions)?this.globalEvents[t]?this.globalEvents[t].push(e):this.globalEvents[t]=[e]:this.scope.events.add(this.scope.document,t,e,{options:n}),this}),"The interact.on() method is being deprecated"),e.off=(0,Yt.warnOnce)((function(t,e,n){if(i.default.string(t)&&-1!==t.search(" ")&&(t=t.trim().split(/ +/)),i.default.array(t)){for(var r=0;r<t.length;r++){var o=t[r];this.off(o,e,n)}return this}if(i.default.object(t)){for(var a in t)this.off(a,t[a],e);return this}var s;return(0,hn.default)(t,this.scope.actions)?t in this.globalEvents&&-1!==(s=this.globalEvents[t].indexOf(e))&&this.globalEvents[t].splice(s,1):this.scope.events.remove(this.scope.document,t,e,n),this}),"The interact.off() method is being deprecated"),e.debug=function(){return this.scope},e.supportsTouch=function(){return b.default.supportsTouch},e.supportsPointerEvent=function(){return b.default.supportsPointerEvent},e.stop=function(){for(var t=0;t<this.scope.interactions.list.length;t++)this.scope.interactions.list[t].stop();return this},e.pointerMoveTolerance=function(t){return i.default.number(t)?(this.scope.interactions.pointerMoveTolerance=t,this):this.scope.interactions.pointerMoveTolerance},e.addDocument=function(t,e){this.scope.addDocument(t,e)},e.removeDocument=function(t){this.scope.removeDocument(t)},e};var yn={};function mn(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function bn(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(yn,"__esModule",{value:!0}),yn.Interactable=void 0;var xn=function(){function t(n,r,o,i){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),bn(this,"options",void 0),bn(this,"_actions",void 0),bn(this,"target",void 0),bn(this,"events",new cn.Eventable),bn(this,"_context",void 0),bn(this,"_win",void 0),bn(this,"_doc",void 0),bn(this,"_scopeEvents",void 0),bn(this,"_rectChecker",void 0),this._actions=r.actions,this.target=n,this._context=r.context||o,this._win=(0,e.getWindow)((0,_.trySelector)(n)?this._context:n),this._doc=this._win.document,this._scopeEvents=i,this.set(r)}var n,r;return n=t,(r=[{key:"_defaults",get:function(){return{base:{},perAction:{},actions:{}}}},{key:"setOnEvents",value:function(t,e){return i.default.func(e.onstart)&&this.on("".concat(t,"start"),e.onstart),i.default.func(e.onmove)&&this.on("".concat(t,"move"),e.onmove),i.default.func(e.onend)&&this.on("".concat(t,"end"),e.onend),i.default.func(e.oninertiastart)&&this.on("".concat(t,"inertiastart"),e.oninertiastart),this}},{key:"updatePerActionListeners",value:function(t,e,n){(i.default.array(e)||i.default.object(e))&&this.off(t,e),(i.default.array(n)||i.default.object(n))&&this.on(t,n)}},{key:"setPerAction",value:function(t,e){var n=this._defaults;for(var r in e){var o=r,a=this.options[t],s=e[o];"listeners"===o&&this.updatePerActionListeners(t,a.listeners,s),i.default.array(s)?a[o]=Z.from(s):i.default.plainObject(s)?(a[o]=(0,j.default)(a[o]||{},(0,ge.default)(s)),i.default.object(n.perAction[o])&&"enabled"in n.perAction[o]&&(a[o].enabled=!1!==s.enabled)):i.default.bool(s)&&i.default.object(n.perAction[o])?a[o].enabled=s:a[o]=s}}},{key:"getRect",value:function(t){return t=t||(i.default.element(this.target)?this.target:null),i.default.string(this.target)&&(t=t||this._context.querySelector(this.target)),(0,_.getElementRect)(t)}},{key:"rectChecker",value:function(t){var e=this;return i.default.func(t)?(this._rectChecker=t,this.getRect=function(t){var n=(0,j.default)({},e._rectChecker(t));return"width"in n||(n.width=n.right-n.left,n.height=n.bottom-n.top),n},this):null===t?(delete this.getRect,delete this._rectChecker,this):this.getRect}},{key:"_backCompatOption",value:function(t,e){if((0,_.trySelector)(e)||i.default.object(e)){for(var n in this.options[t]=e,this._actions.map)this.options[n][t]=e;return this}return this.options[t]}},{key:"origin",value:function(t){return this._backCompatOption("origin",t)}},{key:"deltaSource",value:function(t){return"page"===t||"client"===t?(this.options.deltaSource=t,this):this.options.deltaSource}},{key:"context",value:function(){return this._context}},{key:"inContext",value:function(t){return this._context===t.ownerDocument||(0,_.nodeContains)(this._context,t)}},{key:"testIgnoreAllow",value:function(t,e,n){return!this.testIgnore(t.ignoreFrom,e,n)&&this.testAllow(t.allowFrom,e,n)}},{key:"testAllow",value:function(t,e,n){return!t||!!i.default.element(n)&&(i.default.string(t)?(0,_.matchesUpTo)(n,t,e):!!i.default.element(t)&&(0,_.nodeContains)(t,n))}},{key:"testIgnore",value:function(t,e,n){return!(!t||!i.default.element(n))&&(i.default.string(t)?(0,_.matchesUpTo)(n,t,e):!!i.default.element(t)&&(0,_.nodeContains)(t,n))}},{key:"fire",value:function(t){return this.events.fire(t),this}},{key:"_onOff",value:function(t,e,n,r){i.default.object(e)&&!i.default.array(e)&&(r=n,n=null);var o="on"===t?"add":"remove",a=(0,R.default)(e,n);for(var s in a){"wheel"===s&&(s=b.default.wheelEvent);for(var l=0;l<a[s].length;l++){var u=a[s][l];(0,hn.default)(s,this._actions)?this.events[t](s,u):i.default.string(this.target)?this._scopeEvents["".concat(o,"Delegate")](this.target,this._context,s,u,r):this._scopeEvents[o](this.target,s,u,r)}}return this}},{key:"on",value:function(t,e,n){return this._onOff("on",t,e,n)}},{key:"off",value:function(t,e,n){return this._onOff("off",t,e,n)}},{key:"set",value:function(t){var e=this._defaults;for(var n in i.default.object(t)||(t={}),this.options=(0,ge.default)(e.base),this._actions.methodDict){var r=n,o=this._actions.methodDict[r];this.options[r]={},this.setPerAction(r,(0,j.default)((0,j.default)({},e.perAction),e.actions[r])),this[o](t[r])}for(var a in t)i.default.func(this[a])&&this[a](t[a]);return this}},{key:"unset",value:function(){if(i.default.string(this.target))for(var t in this._scopeEvents.delegatedEvents)for(var e=this._scopeEvents.delegatedEvents[t],n=e.length-1;n>=0;n--){var r=e[n],o=r.selector,a=r.context,s=r.listeners;o===this.target&&a===this._context&&e.splice(n,1);for(var l=s.length-1;l>=0;l--)this._scopeEvents.removeDelegate(this.target,this._context,t,s[l][0],s[l][1])}else this._scopeEvents.remove(this.target,"all")}}])&&mn(n.prototype,r),t}();yn.Interactable=xn;var wn={};function _n(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function Pn(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(wn,"__esModule",{value:!0}),wn.InteractableSet=void 0;var On=function(){function t(e){var n=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),Pn(this,"list",[]),Pn(this,"selectorMap",{}),Pn(this,"scope",void 0),this.scope=e,e.addListeners({"interactable:unset":function(t){var e=t.interactable,r=e.target,o=e._context,a=i.default.string(r)?n.selectorMap[r]:r[n.scope.id],s=Z.findIndex(a,(function(t){return t.context===o}));a[s]&&(a[s].context=null,a[s].interactable=null),a.splice(s,1)}})}var e,n;return e=t,(n=[{key:"new",value:function(t,e){e=(0,j.default)(e||{},{actions:this.scope.actions});var n=new this.scope.Interactable(t,e,this.scope.document,this.scope.events),r={context:n._context,interactable:n};return this.scope.addDocument(n._doc),this.list.push(n),i.default.string(t)?(this.selectorMap[t]||(this.selectorMap[t]=[]),this.selectorMap[t].push(r)):(n.target[this.scope.id]||Object.defineProperty(t,this.scope.id,{value:[],configurable:!0}),t[this.scope.id].push(r)),this.scope.fire("interactable:new",{target:t,options:e,interactable:n,win:this.scope._win}),n}},{key:"get",value:function(t,e){var n=e&&e.context||this.scope.document,r=i.default.string(t),o=r?this.selectorMap[t]:t[this.scope.id];if(!o)return null;var a=Z.find(o,(function(e){return e.context===n&&(r||e.interactable.inContext(t))}));return a&&a.interactable}},{key:"forEachMatch",value:function(t,e){for(var n=0;n<this.list.length;n++){var r=this.list[n],o=void 0;if((i.default.string(r.target)?i.default.element(t)&&_.matchesSelector(t,r.target):t===r.target)&&r.inContext(t)&&(o=e(r)),void 0!==o)return o}}}])&&_n(e.prototype,n),t}();wn.InteractableSet=On;var Sn={};function En(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function Tn(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function Mn(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}return n}}(t,e)||function(t,e){if(t){if("string"==typeof t)return jn(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?jn(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function jn(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=Array(e);n<e;n++)r[n]=t[n];return r}Object.defineProperty(Sn,"__esModule",{value:!0}),Sn.default=void 0;var kn=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),Tn(this,"currentTarget",void 0),Tn(this,"originalEvent",void 0),Tn(this,"type",void 0),this.originalEvent=e,(0,F.default)(this,e)}var e,n;return e=t,(n=[{key:"preventOriginalDefault",value:function(){this.originalEvent.preventDefault()}},{key:"stopPropagation",value:function(){this.originalEvent.stopPropagation()}},{key:"stopImmediatePropagation",value:function(){this.originalEvent.stopImmediatePropagation()}}])&&En(e.prototype,n),t}();function In(t){if(!i.default.object(t))return{capture:!!t,passive:!1};var e=(0,j.default)({},t);return e.capture=!!t.capture,e.passive=!!t.passive,e}var Dn={id:"events",install:function(t){var e,n=[],r={},o=[],a={add:s,remove:l,addDelegate:function(t,e,n,i,a){var l=In(a);if(!r[n]){r[n]=[];for(var f=0;f<o.length;f++){var d=o[f];s(d,n,u),s(d,n,c,!0)}}var p=r[n],v=Z.find(p,(function(n){return n.selector===t&&n.context===e}));v||(v={selector:t,context:e,listeners:[]},p.push(v)),v.listeners.push([i,l])},removeDelegate:function(t,e,n,o,i){var a,s=In(i),f=r[n],d=!1;if(f)for(a=f.length-1;a>=0;a--){var p=f[a];if(p.selector===t&&p.context===e){for(var v=p.listeners,h=v.length-1;h>=0;h--){var g=Mn(v[h],2),y=g[0],m=g[1],b=m.capture,x=m.passive;if(y===o&&b===s.capture&&x===s.passive){v.splice(h,1),v.length||(f.splice(a,1),l(e,n,u),l(e,n,c,!0)),d=!0;break}}if(d)break}}},delegateListener:u,delegateUseCapture:c,delegatedEvents:r,documents:o,targets:n,supportsOptions:!1,supportsPassive:!1};function s(t,e,r,o){var i=In(o),s=Z.find(n,(function(e){return e.eventTarget===t}));s||(s={eventTarget:t,events:{}},n.push(s)),s.events[e]||(s.events[e]=[]),t.addEventListener&&!Z.contains(s.events[e],r)&&(t.addEventListener(e,r,a.supportsOptions?i:i.capture),s.events[e].push(r))}function l(t,e,r,o){var i=In(o),s=Z.findIndex(n,(function(e){return e.eventTarget===t})),u=n[s];if(u&&u.events)if("all"!==e){var c=!1,f=u.events[e];if(f){if("all"===r){for(var d=f.length-1;d>=0;d--)l(t,e,f[d],i);return}for(var p=0;p<f.length;p++)if(f[p]===r){t.removeEventListener(e,r,a.supportsOptions?i:i.capture),f.splice(p,1),0===f.length&&(delete u.events[e],c=!0);break}}c&&!Object.keys(u.events).length&&n.splice(s,1)}else for(e in u.events)u.events.hasOwnProperty(e)&&l(t,e,"all")}function u(t,e){for(var n=In(e),o=new kn(t),a=r[t.type],s=Mn(B.getEventTargets(t),1)[0],l=s;i.default.element(l);){for(var u=0;u<a.length;u++){var c=a[u],f=c.selector,d=c.context;if(_.matchesSelector(l,f)&&_.nodeContains(d,s)&&_.nodeContains(d,l)){var p=c.listeners;o.currentTarget=l;for(var v=0;v<p.length;v++){var h=Mn(p[v],2),g=h[0],y=h[1],m=y.capture,b=y.passive;m===n.capture&&b===n.passive&&g(o)}}}l=_.parentNode(l)}}function c(t){return u(t,!0)}return null==(e=t.document)||e.createElement("div").addEventListener("test",null,{get capture(){return a.supportsOptions=!0},get passive(){return a.supportsPassive=!0}}),t.events=a,a}};Sn.default=Dn;var An={};Object.defineProperty(An,"__esModule",{value:!0}),An.default=void 0;var Rn={methodOrder:["simulationResume","mouseOrPen","hasPointer","idle"],search:function(t){for(var e=0;e<Rn.methodOrder.length;e++){var n;n=Rn.methodOrder[e];var r=Rn[n](t);if(r)return r}return null},simulationResume:function(t){var e=t.pointerType,n=t.eventType,r=t.eventTarget,o=t.scope;if(!/down|start/i.test(n))return null;for(var i=0;i<o.interactions.list.length;i++){var a=o.interactions.list[i],s=r;if(a.simulation&&a.simulation.allowResume&&a.pointerType===e)for(;s;){if(s===a.element)return a;s=_.parentNode(s)}}return null},mouseOrPen:function(t){var e,n=t.pointerId,r=t.pointerType,o=t.eventType,i=t.scope;if("mouse"!==r&&"pen"!==r)return null;for(var a=0;a<i.interactions.list.length;a++){var s=i.interactions.list[a];if(s.pointerType===r){if(s.simulation&&!zn(s,n))continue;if(s.interacting())return s;e||(e=s)}}if(e)return e;for(var l=0;l<i.interactions.list.length;l++){var u=i.interactions.list[l];if(!(u.pointerType!==r||/down/i.test(o)&&u.simulation))return u}return null},hasPointer:function(t){for(var e=t.pointerId,n=t.scope,r=0;r<n.interactions.list.length;r++){var o=n.interactions.list[r];if(zn(o,e))return o}return null},idle:function(t){for(var e=t.pointerType,n=t.scope,r=0;r<n.interactions.list.length;r++){var o=n.interactions.list[r];if(1===o.pointers.length){var i=o.interactable;if(i&&(!i.options.gesture||!i.options.gesture.enabled))continue}else if(o.pointers.length>=2)continue;if(!o.interacting()&&e===o.pointerType)return o}return null}};function zn(t,e){return t.pointers.some((function(t){return t.id===e}))}var Cn=Rn;An.default=Cn;var Fn={};function Xn(t){return(Xn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Yn(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}return n}}(t,e)||function(t,e){if(t){if("string"==typeof t)return Bn(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Bn(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Bn(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=Array(e);n<e;n++)r[n]=t[n];return r}function Wn(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function Ln(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function Un(t,e){return(Un=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function Vn(t,e){return!e||"object"!==Xn(e)&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function Nn(t){return(Nn=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}Object.defineProperty(Fn,"__esModule",{value:!0}),Fn.default=void 0;var qn=["pointerDown","pointerMove","pointerUp","updatePointer","removePointer","windowBlur"];function $n(t,e){return function(n){var r=e.interactions.list,o=B.getPointerType(n),i=Yn(B.getEventTargets(n),2),a=i[0],s=i[1],l=[];if(/^touch/.test(n.type)){e.prevTouchTime=e.now();for(var u=0;u<n.changedTouches.length;u++){var c=n.changedTouches[u],f={pointer:c,pointerId:B.getPointerId(c),pointerType:o,eventType:n.type,eventTarget:a,curEventTarget:s,scope:e},d=Gn(f);l.push([f.pointer,f.eventTarget,f.curEventTarget,d])}}else{var p=!1;if(!b.default.supportsPointerEvent&&/mouse/.test(n.type)){for(var v=0;v<r.length&&!p;v++)p="mouse"!==r[v].pointerType&&r[v].pointerIsDown;p=p||e.now()-e.prevTouchTime<500||0===n.timeStamp}if(!p){var h={pointer:n,pointerId:B.getPointerId(n),pointerType:o,eventType:n.type,curEventTarget:s,eventTarget:a,scope:e},g=Gn(h);l.push([h.pointer,h.eventTarget,h.curEventTarget,g])}}for(var y=0;y<l.length;y++){var m=Yn(l[y],4),x=m[0],w=m[1],_=m[2];m[3][t](x,n,w,_)}}}function Gn(t){var e=t.pointerType,n=t.scope,r={interaction:An.default.search(t),searchDetails:t};return n.fire("interactions:find",r),r.interaction||n.interactions.new({pointerType:e})}function Hn(t,e){var n=t.doc,r=t.scope,o=t.options,i=r.interactions.docEvents,a=r.events,s=a[e];for(var l in r.browser.isIOS&&!o.events&&(o.events={passive:!1}),a.delegatedEvents)s(n,l,a.delegateListener),s(n,l,a.delegateUseCapture,!0);for(var u=o&&o.events,c=0;c<i.length;c++){var f=i[c];s(n,f.type,f.listener,u)}}var Kn={id:"core/interactions",install:function(t){for(var e={},n=0;n<qn.length;n++){var r=qn[n];e[r]=$n(r,t)}var o,i=b.default.pEventTypes;function a(){for(var e=0;e<t.interactions.list.length;e++){var n=t.interactions.list[e];if(n.pointerIsDown&&"touch"===n.pointerType&&!n._interacting)for(var r=function(){var e=n.pointers[o];t.documents.some((function(t){var n=t.doc;return(0,_.nodeContains)(n,e.downTarget)}))||n.removePointer(e.pointer,e.event)},o=0;o<n.pointers.length;o++)r()}}(o=h.default.PointerEvent?[{type:i.down,listener:a},{type:i.down,listener:e.pointerDown},{type:i.move,listener:e.pointerMove},{type:i.up,listener:e.pointerUp},{type:i.cancel,listener:e.pointerUp}]:[{type:"mousedown",listener:e.pointerDown},{type:"mousemove",listener:e.pointerMove},{type:"mouseup",listener:e.pointerUp},{type:"touchstart",listener:a},{type:"touchstart",listener:e.pointerDown},{type:"touchmove",listener:e.pointerMove},{type:"touchend",listener:e.pointerUp},{type:"touchcancel",listener:e.pointerUp}]).push({type:"blur",listener:function(e){for(var n=0;n<t.interactions.list.length;n++)t.interactions.list[n].documentBlur(e)}}),t.prevTouchTime=0,t.Interaction=function(e){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&Un(t,e)}(s,e);var n,r,o,i,a=(o=s,i=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}(),function(){var t,e=Nn(o);if(i){var n=Nn(this).constructor;t=Reflect.construct(e,arguments,n)}else t=e.apply(this,arguments);return Vn(this,t)});function s(){return Wn(this,s),a.apply(this,arguments)}return n=s,(r=[{key:"pointerMoveTolerance",get:function(){return t.interactions.pointerMoveTolerance},set:function(e){t.interactions.pointerMoveTolerance=e}},{key:"_now",value:function(){return t.now()}}])&&Ln(n.prototype,r),s}(Le.default),t.interactions={list:[],new:function(e){e.scopeFire=function(e,n){return t.fire(e,n)};var n=new t.Interaction(e);return t.interactions.list.push(n),n},listeners:e,docEvents:o,pointerMoveTolerance:1},t.usePlugin(se.default)},listeners:{"scope:add-document":function(t){return Hn(t,"add")},"scope:remove-document":function(t){return Hn(t,"remove")},"interactable:unset":function(t,e){for(var n=t.interactable,r=e.interactions.list.length-1;r>=0;r--){var o=e.interactions.list[r];o.interactable===n&&(o.stop(),e.fire("interactions:destroy",{interaction:o}),o.destroy(),e.interactions.list.length>2&&e.interactions.list.splice(r,1))}}},onDocSignal:Hn,doOnInteractions:$n,methodNames:qn};Fn.default=Kn;var Zn={};function Jn(t){return(Jn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Qn(t,e,n){return(Qn="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=nr(t)););return t}(t,e);if(r){var o=Object.getOwnPropertyDescriptor(r,e);return o.get?o.get.call(n):o.value}})(t,e,n||t)}function tr(t,e){return(tr=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function er(t,e){return!e||"object"!==Jn(e)&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function nr(t){return(nr=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function rr(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function or(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function ir(t,e,n){return e&&or(t.prototype,e),n&&or(t,n),t}function ar(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(Zn,"__esModule",{value:!0}),Zn.initScope=lr,Zn.Scope=void 0;var sr=function(){function t(){var e=this;rr(this,t),ar(this,"id","__interact_scope_".concat(Math.floor(100*Math.random()))),ar(this,"isInitialized",!1),ar(this,"listenerMaps",[]),ar(this,"browser",b.default),ar(this,"defaults",(0,ge.default)(Me.defaults)),ar(this,"Eventable",cn.Eventable),ar(this,"actions",{map:{},phases:{start:!0,move:!0,end:!0},methodDict:{},phaselessTypes:{}}),ar(this,"interactStatic",(0,gn.createInteractStatic)(this)),ar(this,"InteractEvent",je.InteractEvent),ar(this,"Interactable",void 0),ar(this,"interactables",new wn.InteractableSet(this)),ar(this,"_win",void 0),ar(this,"document",void 0),ar(this,"window",void 0),ar(this,"documents",[]),ar(this,"_plugins",{list:[],map:{}}),ar(this,"onWindowUnload",(function(t){return e.removeDocument(t.target)}));var n=this;this.Interactable=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&tr(t,e)}(i,t);var e,r,o=(e=i,r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}(),function(){var t,n=nr(e);if(r){var o=nr(this).constructor;t=Reflect.construct(n,arguments,o)}else t=n.apply(this,arguments);return er(this,t)});function i(){return rr(this,i),o.apply(this,arguments)}return ir(i,[{key:"_defaults",get:function(){return n.defaults}},{key:"set",value:function(t){return Qn(nr(i.prototype),"set",this).call(this,t),n.fire("interactable:set",{options:t,interactable:this}),this}},{key:"unset",value:function(){Qn(nr(i.prototype),"unset",this).call(this),n.interactables.list.splice(n.interactables.list.indexOf(this),1),n.fire("interactable:unset",{interactable:this})}}]),i}(yn.Interactable)}return ir(t,[{key:"addListeners",value:function(t,e){this.listenerMaps.push({id:e,map:t})}},{key:"fire",value:function(t,e){for(var n=0;n<this.listenerMaps.length;n++){var r=this.listenerMaps[n].map[t];if(r&&!1===r(e,this,t))return!1}}},{key:"init",value:function(t){return this.isInitialized?this:lr(this,t)}},{key:"pluginIsInstalled",value:function(t){return this._plugins.map[t.id]||-1!==this._plugins.list.indexOf(t)}},{key:"usePlugin",value:function(t,e){if(!this.isInitialized)return this;if(this.pluginIsInstalled(t))return this;if(t.id&&(this._plugins.map[t.id]=t),this._plugins.list.push(t),t.install&&t.install(this,e),t.listeners&&t.before){for(var n=0,r=this.listenerMaps.length,o=t.before.reduce((function(t,e){return t[e]=!0,t[ur(e)]=!0,t}),{});n<r;n++){var i=this.listenerMaps[n].id;if(o[i]||o[ur(i)])break}this.listenerMaps.splice(n,0,{id:t.id,map:t.listeners})}else t.listeners&&this.listenerMaps.push({id:t.id,map:t.listeners});return this}},{key:"addDocument",value:function(t,n){if(-1!==this.getDocIndex(t))return!1;var r=e.getWindow(t);n=n?(0,j.default)({},n):{},this.documents.push({doc:t,options:n}),this.events.documents.push(t),t!==this.document&&this.events.add(r,"unload",this.onWindowUnload),this.fire("scope:add-document",{doc:t,window:r,scope:this,options:n})}},{key:"removeDocument",value:function(t){var n=this.getDocIndex(t),r=e.getWindow(t),o=this.documents[n].options;this.events.remove(r,"unload",this.onWindowUnload),this.documents.splice(n,1),this.events.documents.splice(n,1),this.fire("scope:remove-document",{doc:t,window:r,scope:this,options:o})}},{key:"getDocIndex",value:function(t){for(var e=0;e<this.documents.length;e++)if(this.documents[e].doc===t)return e;return-1}},{key:"getDocOptions",value:function(t){var e=this.getDocIndex(t);return-1===e?null:this.documents[e].options}},{key:"now",value:function(){return(this.window.Date||Date).now()}}]),t}();function lr(t,n){return t.isInitialized=!0,i.default.window(n)&&e.init(n),h.default.init(n),b.default.init(n),jt.default.init(n),t.window=n,t.document=n.document,t.usePlugin(Fn.default),t.usePlugin(Sn.default),t}function ur(t){return t&&t.replace(/\/.*$/,"")}Zn.Scope=sr;var cr={};Object.defineProperty(cr,"__esModule",{value:!0}),cr.default=void 0;var fr=new Zn.Scope,dr=fr.interactStatic;cr.default=dr;var pr="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:void 0;fr.init(pr);var vr={};Object.defineProperty(vr,"__esModule",{value:!0}),vr.default=void 0,vr.default=function(){};var hr={};Object.defineProperty(hr,"__esModule",{value:!0}),hr.default=void 0,hr.default=function(){};var gr={};function yr(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}return n}}(t,e)||function(t,e){if(t){if("string"==typeof t)return mr(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?mr(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function mr(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=Array(e);n<e;n++)r[n]=t[n];return r}Object.defineProperty(gr,"__esModule",{value:!0}),gr.default=void 0,gr.default=function(t){var e=[["x","y"],["left","top"],["right","bottom"],["width","height"]].filter((function(e){var n=yr(e,2),r=n[0],o=n[1];return r in t||o in t})),n=function(n,r){for(var o=t.range,i=t.limits,a=void 0===i?{left:-1/0,right:1/0,top:-1/0,bottom:1/0}:i,s=t.offset,l=void 0===s?{x:0,y:0}:s,u={range:o,grid:t,x:null,y:null},c=0;c<e.length;c++){var f=yr(e[c],2),d=f[0],p=f[1],v=Math.round((n-l.x)/t[d]),h=Math.round((r-l.y)/t[p]);u[d]=Math.max(a.left,Math.min(a.right,v*t[d]+l.x)),u[p]=Math.max(a.top,Math.min(a.bottom,h*t[p]+l.y))}return u};return n.grid=t,n.coordFields=e,n};var br={};Object.defineProperty(br,"__esModule",{value:!0}),Object.defineProperty(br,"edgeTarget",{enumerable:!0,get:function(){return vr.default}}),Object.defineProperty(br,"elements",{enumerable:!0,get:function(){return hr.default}}),Object.defineProperty(br,"grid",{enumerable:!0,get:function(){return gr.default}});var xr={};Object.defineProperty(xr,"__esModule",{value:!0}),xr.default=void 0;var wr={id:"snappers",install:function(t){var e=t.interactStatic;e.snappers=(0,j.default)(e.snappers||{},br),e.createSnapGrid=e.snappers.grid}};xr.default=wr;var _r={};function Pr(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function Or(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?Pr(Object(n),!0).forEach((function(e){Sr(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):Pr(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function Sr(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(_r,"__esModule",{value:!0}),_r.aspectRatio=_r.default=void 0;var Er={start:function(t){var e=t.state,n=t.rect,r=t.edges,o=t.pageCoords,i=e.options.ratio,a=e.options,s=a.equalDelta,l=a.modifiers;"preserve"===i&&(i=n.width/n.height),e.startCoords=(0,j.default)({},o),e.startRect=(0,j.default)({},n),e.ratio=i,e.equalDelta=s;var u=e.linkedEdges={top:r.top||r.left&&!r.bottom,left:r.left||r.top&&!r.right,bottom:r.bottom||r.right&&!r.top,right:r.right||r.bottom&&!r.left};if(e.xIsPrimaryAxis=!(!r.left&&!r.right),e.equalDelta)e.edgeSign=(u.left?1:-1)*(u.top?1:-1);else{var c=e.xIsPrimaryAxis?u.top:u.left;e.edgeSign=c?-1:1}if((0,j.default)(t.edges,u),l&&l.length){var f=new ye.default(t.interaction);f.copyFrom(t.interaction.modification),f.prepareStates(l),e.subModification=f,f.startAll(Or({},t))}},set:function(t){var e=t.state,n=t.rect,r=t.coords,o=(0,j.default)({},r),i=e.equalDelta?Tr:Mr;if(i(e,e.xIsPrimaryAxis,r,n),!e.subModification)return null;var a=(0,j.default)({},n);(0,k.addEdges)(e.linkedEdges,a,{x:r.x-o.x,y:r.y-o.y});var s=e.subModification.setAll(Or(Or({},t),{},{rect:a,edges:e.linkedEdges,pageCoords:r,prevCoords:r,prevRect:a})),l=s.delta;return s.changed&&(i(e,Math.abs(l.x)>Math.abs(l.y),s.coords,s.rect),(0,j.default)(r,s.coords)),s.eventProps},defaults:{ratio:"preserve",equalDelta:!1,modifiers:[],enabled:!1}};function Tr(t,e,n){var r=t.startCoords,o=t.edgeSign;e?n.y=r.y+(n.x-r.x)*o:n.x=r.x+(n.y-r.y)*o}function Mr(t,e,n,r){var o=t.startRect,i=t.startCoords,a=t.ratio,s=t.edgeSign;if(e){var l=r.width/a;n.y=i.y+(l-o.height)*s}else{var u=r.height*a;n.x=i.x+(u-o.width)*s}}_r.aspectRatio=Er;var jr=(0,Se.makeModifier)(Er,"aspectRatio");_r.default=jr;var kr={};Object.defineProperty(kr,"__esModule",{value:!0}),kr.default=void 0;var Ir=function(){};Ir._defaults={};var Dr=Ir;kr.default=Dr;var Ar={};Object.defineProperty(Ar,"__esModule",{value:!0}),Object.defineProperty(Ar,"default",{enumerable:!0,get:function(){return kr.default}});var Rr={};function zr(t,e,n){return i.default.func(t)?k.resolveRectLike(t,e.interactable,e.element,[n.x,n.y,e]):k.resolveRectLike(t,e.interactable,e.element)}Object.defineProperty(Rr,"__esModule",{value:!0}),Rr.getRestrictionRect=zr,Rr.restrict=Rr.default=void 0;var Cr={start:function(t){var e=t.rect,n=t.startOffset,r=t.state,o=t.interaction,i=t.pageCoords,a=r.options,s=a.elementRect,l=(0,j.default)({left:0,top:0,right:0,bottom:0},a.offset||{});if(e&&s){var u=zr(a.restriction,o,i);if(u){var c=u.right-u.left-e.width,f=u.bottom-u.top-e.height;c<0&&(l.left+=c,l.right+=c),f<0&&(l.top+=f,l.bottom+=f)}l.left+=n.left-e.width*s.left,l.top+=n.top-e.height*s.top,l.right+=n.right-e.width*(1-s.right),l.bottom+=n.bottom-e.height*(1-s.bottom)}r.offset=l},set:function(t){var e=t.coords,n=t.interaction,r=t.state,o=r.options,i=r.offset,a=zr(o.restriction,n,e);if(a){var s=k.xywhToTlbr(a);e.x=Math.max(Math.min(s.right-i.right,e.x),s.left+i.left),e.y=Math.max(Math.min(s.bottom-i.bottom,e.y),s.top+i.top)}},defaults:{restriction:null,elementRect:null,offset:null,endOnly:!1,enabled:!1}};Rr.restrict=Cr;var Fr=(0,Se.makeModifier)(Cr,"restrict");Rr.default=Fr;var Xr={};Object.defineProperty(Xr,"__esModule",{value:!0}),Xr.restrictEdges=Xr.default=void 0;var Yr={top:1/0,left:1/0,bottom:-1/0,right:-1/0},Br={top:-1/0,left:-1/0,bottom:1/0,right:1/0};function Wr(t,e){for(var n=["top","left","bottom","right"],r=0;r<n.length;r++){var o=n[r];o in t||(t[o]=e[o])}return t}var Lr={noInner:Yr,noOuter:Br,start:function(t){var e,n=t.interaction,r=t.startOffset,o=t.state,i=o.options;if(i){var a=(0,Rr.getRestrictionRect)(i.offset,n,n.coords.start.page);e=k.rectToXY(a)}e=e||{x:0,y:0},o.offset={top:e.y+r.top,left:e.x+r.left,bottom:e.y-r.bottom,right:e.x-r.right}},set:function(t){var e=t.coords,n=t.edges,r=t.interaction,o=t.state,i=o.offset,a=o.options;if(n){var s=(0,j.default)({},e),l=(0,Rr.getRestrictionRect)(a.inner,r,s)||{},u=(0,Rr.getRestrictionRect)(a.outer,r,s)||{};Wr(l,Yr),Wr(u,Br),n.top?e.y=Math.min(Math.max(u.top+i.top,s.y),l.top+i.top):n.bottom&&(e.y=Math.max(Math.min(u.bottom+i.bottom,s.y),l.bottom+i.bottom)),n.left?e.x=Math.min(Math.max(u.left+i.left,s.x),l.left+i.left):n.right&&(e.x=Math.max(Math.min(u.right+i.right,s.x),l.right+i.right))}},defaults:{inner:null,outer:null,offset:null,endOnly:!1,enabled:!1}};Xr.restrictEdges=Lr;var Ur=(0,Se.makeModifier)(Lr,"restrictEdges");Xr.default=Ur;var Vr={};Object.defineProperty(Vr,"__esModule",{value:!0}),Vr.restrictRect=Vr.default=void 0;var Nr=(0,j.default)({get elementRect(){return{top:0,left:0,bottom:1,right:1}},set elementRect(t){}},Rr.restrict.defaults),qr={start:Rr.restrict.start,set:Rr.restrict.set,defaults:Nr};Vr.restrictRect=qr;var $r=(0,Se.makeModifier)(qr,"restrictRect");Vr.default=$r;var Gr={};Object.defineProperty(Gr,"__esModule",{value:!0}),Gr.restrictSize=Gr.default=void 0;var Hr={width:-1/0,height:-1/0},Kr={width:1/0,height:1/0},Zr={start:function(t){return Xr.restrictEdges.start(t)},set:function(t){var e=t.interaction,n=t.state,r=t.rect,o=t.edges,i=n.options;if(o){var a=k.tlbrToXywh((0,Rr.getRestrictionRect)(i.min,e,t.coords))||Hr,s=k.tlbrToXywh((0,Rr.getRestrictionRect)(i.max,e,t.coords))||Kr;n.options={endOnly:i.endOnly,inner:(0,j.default)({},Xr.restrictEdges.noInner),outer:(0,j.default)({},Xr.restrictEdges.noOuter)},o.top?(n.options.inner.top=r.bottom-a.height,n.options.outer.top=r.bottom-s.height):o.bottom&&(n.options.inner.bottom=r.top+a.height,n.options.outer.bottom=r.top+s.height),o.left?(n.options.inner.left=r.right-a.width,n.options.outer.left=r.right-s.width):o.right&&(n.options.inner.right=r.left+a.width,n.options.outer.right=r.left+s.width),Xr.restrictEdges.set(t),n.options=i}},defaults:{min:null,max:null,endOnly:!1,enabled:!1}};Gr.restrictSize=Zr;var Jr=(0,Se.makeModifier)(Zr,"restrictSize");Gr.default=Jr;var Qr={};Object.defineProperty(Qr,"__esModule",{value:!0}),Object.defineProperty(Qr,"default",{enumerable:!0,get:function(){return kr.default}});var to={};Object.defineProperty(to,"__esModule",{value:!0}),to.snap=to.default=void 0;var eo={start:function(t){var e,n=t.interaction,r=t.interactable,o=t.element,i=t.rect,a=t.state,s=t.startOffset,l=a.options,u=l.offsetWithOrigin?function(t){var e=t.interaction.element;return(0,k.rectToXY)((0,k.resolveRectLike)(t.state.options.origin,null,null,[e]))||(0,A.default)(t.interactable,e,t.interaction.prepared.name)}(t):{x:0,y:0};if("startCoords"===l.offset)e={x:n.coords.start.page.x,y:n.coords.start.page.y};else{var c=(0,k.resolveRectLike)(l.offset,r,o,[n]);(e=(0,k.rectToXY)(c)||{x:0,y:0}).x+=u.x,e.y+=u.y}var f=l.relativePoints;a.offsets=i&&f&&f.length?f.map((function(t,n){return{index:n,relativePoint:t,x:s.left-i.width*t.x+e.x,y:s.top-i.height*t.y+e.y}})):[{index:0,relativePoint:null,x:e.x,y:e.y}]},set:function(t){var e=t.interaction,n=t.coords,r=t.state,o=r.options,a=r.offsets,s=(0,A.default)(e.interactable,e.element,e.prepared.name),l=(0,j.default)({},n),u=[];o.offsetWithOrigin||(l.x-=s.x,l.y-=s.y);for(var c=0;c<a.length;c++)for(var f=a[c],d=l.x-f.x,p=l.y-f.y,v=0,h=o.targets.length;v<h;v++){var g,y=o.targets[v];(g=i.default.func(y)?y(d,p,e._proxy,f,v):y)&&u.push({x:(i.default.number(g.x)?g.x:d)+f.x,y:(i.default.number(g.y)?g.y:p)+f.y,range:i.default.number(g.range)?g.range:o.range,source:y,index:v,offset:f})}for(var m={target:null,inRange:!1,distance:0,range:0,delta:{x:0,y:0}},b=0;b<u.length;b++){var x=u[b],w=x.range,_=x.x-l.x,P=x.y-l.y,O=(0,C.default)(_,P),S=O<=w;w===1/0&&m.inRange&&m.range!==1/0&&(S=!1),m.target&&!(S?m.inRange&&w!==1/0?O/w<m.distance/m.range:w===1/0&&m.range!==1/0||O<m.distance:!m.inRange&&O<m.distance)||(m.target=x,m.distance=O,m.range=w,m.inRange=S,m.delta.x=_,m.delta.y=P)}return m.inRange&&(n.x=m.target.x,n.y=m.target.y),r.closest=m,m},defaults:{range:1/0,targets:null,offset:null,offsetWithOrigin:!0,origin:null,relativePoints:null,endOnly:!1,enabled:!1}};to.snap=eo;var no=(0,Se.makeModifier)(eo,"snap");to.default=no;var ro={};function oo(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=Array(e);n<e;n++)r[n]=t[n];return r}Object.defineProperty(ro,"__esModule",{value:!0}),ro.snapSize=ro.default=void 0;var io={start:function(t){var e=t.state,n=t.edges,r=e.options;if(!n)return null;t.state={options:{targets:null,relativePoints:[{x:n.left?0:1,y:n.top?0:1}],offset:r.offset||"self",origin:{x:0,y:0},range:r.range}},e.targetFields=e.targetFields||[["width","height"],["x","y"]],to.snap.start(t),e.offsets=t.state.offsets,t.state=e},set:function(t){var e,n,r=t.interaction,o=t.state,a=t.coords,s=o.options,l=o.offsets,u={x:a.x-l[0].x,y:a.y-l[0].y};o.options=(0,j.default)({},s),o.options.targets=[];for(var c=0;c<(s.targets||[]).length;c++){var f=(s.targets||[])[c],d=void 0;if(d=i.default.func(f)?f(u.x,u.y,r):f){for(var p=0;p<o.targetFields.length;p++){var v=(e=o.targetFields[p],n=2,function(t){if(Array.isArray(t))return t}(e)||function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}return n}}(e,n)||function(t,e){if(t){if("string"==typeof t)return oo(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?oo(t,e):void 0}}(e,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()),h=v[0],g=v[1];if(h in d||g in d){d.x=d[h],d.y=d[g];break}}o.options.targets.push(d)}}var y=to.snap.set(t);return o.options=s,y},defaults:{range:1/0,targets:null,offset:null,endOnly:!1,enabled:!1}};ro.snapSize=io;var ao=(0,Se.makeModifier)(io,"snapSize");ro.default=ao;var so={};Object.defineProperty(so,"__esModule",{value:!0}),so.snapEdges=so.default=void 0;var lo={start:function(t){var e=t.edges;return e?(t.state.targetFields=t.state.targetFields||[[e.left?"left":"right",e.top?"top":"bottom"]],ro.snapSize.start(t)):null},set:ro.snapSize.set,defaults:(0,j.default)((0,ge.default)(ro.snapSize.defaults),{targets:null,range:null,offset:{x:0,y:0}})};so.snapEdges=lo;var uo=(0,Se.makeModifier)(lo,"snapEdges");so.default=uo;var co={};Object.defineProperty(co,"__esModule",{value:!0}),Object.defineProperty(co,"default",{enumerable:!0,get:function(){return kr.default}});var fo={};Object.defineProperty(fo,"__esModule",{value:!0}),Object.defineProperty(fo,"default",{enumerable:!0,get:function(){return kr.default}});var po={};Object.defineProperty(po,"__esModule",{value:!0}),po.default=void 0;var vo={aspectRatio:_r.default,restrictEdges:Xr.default,restrict:Rr.default,restrictRect:Vr.default,restrictSize:Gr.default,snapEdges:so.default,snap:to.default,snapSize:ro.default,spring:co.default,avoid:Ar.default,transform:fo.default,rubberband:Qr.default};po.default=vo;var ho={};Object.defineProperty(ho,"__esModule",{value:!0}),ho.default=void 0;var go={id:"modifiers",install:function(t){var e=t.interactStatic;for(var n in t.usePlugin(Se.default),t.usePlugin(xr.default),e.modifiers=po.default,po.default){var r=po.default[n],o=r._defaults,i=r._methods;o._methods=i,t.defaults.perAction[n]=o}}};ho.default=go;var yo={};function mo(t){return(mo="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function bo(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function xo(t,e){return(xo=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function wo(t,e){return!e||"object"!==mo(e)&&"function"!=typeof e?_o(t):e}function _o(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function Po(t){return(Po=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function Oo(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(yo,"__esModule",{value:!0}),yo.PointerEvent=yo.default=void 0;var So=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&xo(t,e)}(a,t);var e,n,r,o,i=(r=a,o=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}(),function(){var t,e=Po(r);if(o){var n=Po(this).constructor;t=Reflect.construct(e,arguments,n)}else t=e.apply(this,arguments);return wo(this,t)});function a(t,e,n,r,o,s){var l;if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,a),Oo(_o(l=i.call(this,o)),"type",void 0),Oo(_o(l),"originalEvent",void 0),Oo(_o(l),"pointerId",void 0),Oo(_o(l),"pointerType",void 0),Oo(_o(l),"double",void 0),Oo(_o(l),"pageX",void 0),Oo(_o(l),"pageY",void 0),Oo(_o(l),"clientX",void 0),Oo(_o(l),"clientY",void 0),Oo(_o(l),"dt",void 0),Oo(_o(l),"eventable",void 0),B.pointerExtend(_o(l),n),n!==e&&B.pointerExtend(_o(l),e),l.timeStamp=s,l.originalEvent=n,l.type=t,l.pointerId=B.getPointerId(e),l.pointerType=B.getPointerType(e),l.target=r,l.currentTarget=null,"tap"===t){var u=o.getPointerIndex(e);l.dt=l.timeStamp-o.pointers[u].downTime;var c=l.timeStamp-o.tapTime;l.double=!!(o.prevTap&&"doubletap"!==o.prevTap.type&&o.prevTap.target===l.target&&c<500)}else"doubletap"===t&&(l.dt=e.timeStamp-o.tapTime);return l}return e=a,(n=[{key:"_subtractOrigin",value:function(t){var e=t.x,n=t.y;return this.pageX-=e,this.pageY-=n,this.clientX-=e,this.clientY-=n,this}},{key:"_addOrigin",value:function(t){var e=t.x,n=t.y;return this.pageX+=e,this.pageY+=n,this.clientX+=e,this.clientY+=n,this}},{key:"preventDefault",value:function(){this.originalEvent.preventDefault()}}])&&bo(e.prototype,n),a}($.BaseEvent);yo.PointerEvent=yo.default=So;var Eo={};Object.defineProperty(Eo,"__esModule",{value:!0}),Eo.default=void 0;var To={id:"pointer-events/base",before:["inertia","modifiers","auto-start","actions"],install:function(t){t.pointerEvents=To,t.defaults.actions.pointerEvents=To.defaults,(0,j.default)(t.actions.phaselessTypes,To.types)},listeners:{"interactions:new":function(t){var e=t.interaction;e.prevTap=null,e.tapTime=0},"interactions:update-pointer":function(t){var e=t.down,n=t.pointerInfo;!e&&n.hold||(n.hold={duration:1/0,timeout:null})},"interactions:move":function(t,e){var n=t.interaction,r=t.pointer,o=t.event,i=t.eventTarget;t.duplicate||n.pointerIsDown&&!n.pointerWasMoved||(n.pointerIsDown&&ko(t),Mo({interaction:n,pointer:r,event:o,eventTarget:i,type:"move"},e))},"interactions:down":function(t,e){!function(t,e){for(var n=t.interaction,r=t.pointer,o=t.event,i=t.eventTarget,a=t.pointerIndex,s=n.pointers[a].hold,l=_.getPath(i),u={interaction:n,pointer:r,event:o,eventTarget:i,type:"hold",targets:[],path:l,node:null},c=0;c<l.length;c++){var f=l[c];u.node=f,e.fire("pointerEvents:collect-targets",u)}if(u.targets.length){for(var d=1/0,p=0;p<u.targets.length;p++){var v=u.targets[p].eventable.options.holdDuration;v<d&&(d=v)}s.duration=d,s.timeout=setTimeout((function(){Mo({interaction:n,eventTarget:i,pointer:r,event:o,type:"hold"},e)}),d)}}(t,e),Mo(t,e)},"interactions:up":function(t,e){ko(t),Mo(t,e),function(t,e){var n=t.interaction,r=t.pointer,o=t.event,i=t.eventTarget;n.pointerWasMoved||Mo({interaction:n,eventTarget:i,pointer:r,event:o,type:"tap"},e)}(t,e)},"interactions:cancel":function(t,e){ko(t),Mo(t,e)}},PointerEvent:yo.PointerEvent,fire:Mo,collectEventTargets:jo,defaults:{holdDuration:600,ignoreFrom:null,allowFrom:null,origin:{x:0,y:0}},types:{down:!0,move:!0,up:!0,cancel:!0,tap:!0,doubletap:!0,hold:!0}};function Mo(t,e){var n=t.interaction,r=t.pointer,o=t.event,i=t.eventTarget,a=t.type,s=t.targets,l=void 0===s?jo(t,e):s,u=new yo.PointerEvent(a,r,o,i,n,e.now());e.fire("pointerEvents:new",{pointerEvent:u});for(var c={interaction:n,pointer:r,event:o,eventTarget:i,targets:l,type:a,pointerEvent:u},f=0;f<l.length;f++){var d=l[f];for(var p in d.props||{})u[p]=d.props[p];var v=(0,A.default)(d.eventable,d.node);if(u._subtractOrigin(v),u.eventable=d.eventable,u.currentTarget=d.node,d.eventable.fire(u),u._addOrigin(v),u.immediatePropagationStopped||u.propagationStopped&&f+1<l.length&&l[f+1].node!==u.currentTarget)break}if(e.fire("pointerEvents:fired",c),"tap"===a){var h=u.double?Mo({interaction:n,pointer:r,event:o,eventTarget:i,type:"doubletap"},e):u;n.prevTap=h,n.tapTime=h.timeStamp}return u}function jo(t,e){var n=t.interaction,r=t.pointer,o=t.event,i=t.eventTarget,a=t.type,s=n.getPointerIndex(r),l=n.pointers[s];if("tap"===a&&(n.pointerWasMoved||!l||l.downTarget!==i))return[];for(var u=_.getPath(i),c={interaction:n,pointer:r,event:o,eventTarget:i,type:a,path:u,targets:[],node:null},f=0;f<u.length;f++){var d=u[f];c.node=d,e.fire("pointerEvents:collect-targets",c)}return"hold"===a&&(c.targets=c.targets.filter((function(t){var e;return t.eventable.options.holdDuration===(null==(e=n.pointers[s])?void 0:e.hold.duration)}))),c.targets}function ko(t){var e=t.interaction,n=t.pointerIndex,r=e.pointers[n].hold;r&&r.timeout&&(clearTimeout(r.timeout),r.timeout=null)}var Io=To;Eo.default=Io;var Do={};function Ao(t){var e=t.interaction;e.holdIntervalHandle&&(clearInterval(e.holdIntervalHandle),e.holdIntervalHandle=null)}Object.defineProperty(Do,"__esModule",{value:!0}),Do.default=void 0;var Ro={id:"pointer-events/holdRepeat",install:function(t){t.usePlugin(Eo.default);var e=t.pointerEvents;e.defaults.holdRepeatInterval=0,e.types.holdrepeat=t.actions.phaselessTypes.holdrepeat=!0},listeners:["move","up","cancel","endall"].reduce((function(t,e){return t["pointerEvents:".concat(e)]=Ao,t}),{"pointerEvents:new":function(t){var e=t.pointerEvent;"hold"===e.type&&(e.count=(e.count||0)+1)},"pointerEvents:fired":function(t,e){var n=t.interaction,r=t.pointerEvent,o=t.eventTarget,i=t.targets;if("hold"===r.type&&i.length){var a=i[0].eventable.options.holdRepeatInterval;a<=0||(n.holdIntervalHandle=setTimeout((function(){e.pointerEvents.fire({interaction:n,eventTarget:o,type:"hold",pointer:r,event:r},e)}),a))}}})};Do.default=Ro;var zo={};function Co(t){return(0,j.default)(this.events.options,t),this}Object.defineProperty(zo,"__esModule",{value:!0}),zo.default=void 0;var Fo={id:"pointer-events/interactableTargets",install:function(t){var e=t.Interactable;e.prototype.pointerEvents=Co;var n=e.prototype._backCompatOption;e.prototype._backCompatOption=function(t,e){var r=n.call(this,t,e);return r===this&&(this.events.options[t]=e),r}},listeners:{"pointerEvents:collect-targets":function(t,e){var n=t.targets,r=t.node,o=t.type,i=t.eventTarget;e.interactables.forEachMatch(r,(function(t){var e=t.events,a=e.options;e.types[o]&&e.types[o].length&&t.testIgnoreAllow(a,r,i)&&n.push({node:r,eventable:e,props:{interactable:t}})}))},"interactable:new":function(t){var e=t.interactable;e.events.getRect=function(t){return e.getRect(t)}},"interactable:set":function(t,e){var n=t.interactable,r=t.options;(0,j.default)(n.events.options,e.pointerEvents.defaults),(0,j.default)(n.events.options,r.pointerEvents||{})}}};zo.default=Fo;var Xo={};Object.defineProperty(Xo,"__esModule",{value:!0}),Xo.default=void 0;var Yo={id:"pointer-events",install:function(t){t.usePlugin(Eo),t.usePlugin(Do.default),t.usePlugin(zo.default)}};Xo.default=Yo;var Bo={};function Wo(t){var e=t.Interactable;t.actions.phases.reflow=!0,e.prototype.reflow=function(e){return function(t,e,n){for(var r=i.default.string(t.target)?Z.from(t._context.querySelectorAll(t.target)):[t.target],o=n.window.Promise,a=o?[]:null,s=function(){var i=r[l],s=t.getRect(i);if(!s)return"break";var u=Z.find(n.interactions.list,(function(n){return n.interacting()&&n.interactable===t&&n.element===i&&n.prepared.name===e.name})),c=void 0;if(u)u.move(),a&&(c=u._reflowPromise||new o((function(t){u._reflowResolve=t})));else{var f=(0,k.tlbrToXywh)(s),d={page:{x:f.x,y:f.y},client:{x:f.x,y:f.y},timeStamp:n.now()},p=B.coordsToEvent(d);c=function(t,e,n,r,o){var i=t.interactions.new({pointerType:"reflow"}),a={interaction:i,event:o,pointer:o,eventTarget:n,phase:"reflow"};i.interactable=e,i.element=n,i.prevEvent=o,i.updatePointer(o,o,n,!0),B.setZeroCoords(i.coords.delta),(0,Yt.copyAction)(i.prepared,r),i._doPhase(a);var s=t.window.Promise,l=s?new s((function(t){i._reflowResolve=t})):void 0;return i._reflowPromise=l,i.start(r,e,n),i._interacting?(i.move(a),i.end(o)):(i.stop(),i._reflowResolve()),i.removePointer(o,o),l}(n,t,i,e,p)}a&&a.push(c)},l=0;l<r.length&&"break"!==s();l++);return a&&o.all(a).then((function(){return t}))}(this,e,t)}}Object.defineProperty(Bo,"__esModule",{value:!0}),Bo.install=Wo,Bo.default=void 0;var Lo={id:"reflow",install:Wo,listeners:{"interactions:stop":function(t,e){var n=t.interaction;"reflow"===n.pointerType&&(n._reflowResolve&&n._reflowResolve(),Z.remove(e.interactions.list,n))}}};Bo.default=Lo;var Uo={exports:{}};function Vo(t){return(Vo="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}Object.defineProperty(Uo.exports,"__esModule",{value:!0}),Uo.exports.default=void 0,cr.default.use(se.default),cr.default.use(Ge.default),cr.default.use(Xo.default),cr.default.use(en.default),cr.default.use(ho.default),cr.default.use(ie.default),cr.default.use(Tt.default),cr.default.use(Rt.default),cr.default.use(Bo.default);var No=cr.default;if(Uo.exports.default=No,"object"===Vo(Uo)&&Uo)try{Uo.exports=cr.default}catch(t){}cr.default.default=cr.default,Uo=Uo.exports;var qo={exports:{}};function $o(t){return($o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}Object.defineProperty(qo.exports,"__esModule",{value:!0}),qo.exports.default=void 0;var Go=Uo.default;if(qo.exports.default=Go,"object"===$o(qo)&&qo)try{qo.exports=Uo.default}catch(t){}return Uo.default.default=Uo.default,qo.exports}));
//# sourceMappingURL=interact.min.js.map


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

/***/ "./src/public/components/card-actions.ts":
/*!***********************************************!*\
  !*** ./src/public/components/card-actions.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
class CardActionsHandler {
    constructor(maxLength) {
        this.storedSelEls = new Array(maxLength);
        this.currScrollingAnim = null;
    }
    /** Manages selecting a card and deselecting the previous selected one
     * when a cards on click event listener is triggered.
     *
     * @param {Element} selCardEl - the card that executed this function when clicked
     * @param {Array<Card>} corrObjList - the list of objects that contains one that corrosponds to the selected card,
     * each ***object must have the cardId attribute.
     * @param {Function} callback - function to run when selected object has changed
     * @param {Boolean} allowUnselSelected - whether to allow unselecting of the selected card by clicking on it again
     * @param {Boolean} unselectPrevious - whether to unselect the previously selected card
     */
    onCardClick(selCardEl, corrObjList, callback, allowUnselSelected = false, unselectPrevious = true) {
        // if the selected card is selected, and we can unselect it, do so.
        if (this.storedSelEls.includes(selCardEl)) {
            if (allowUnselSelected) {
                const selCard = this.storedSelEls[this.storedSelEls.indexOf(selCardEl)];
                selCard.classList.remove(config_1.config.CSS.CLASSES.selected);
                this.storedSelEls.splice(this.storedSelEls.indexOf(selCardEl), 1);
            }
            return;
        }
        // get corrosponding object using the cardEl id
        const selObj = corrObjList.find((x) => {
            const xCard = x;
            return xCard.getCardId() === selCardEl.id;
        });
        // error if there is no corrosponding object
        if (!selObj) {
            throw new Error(`There is no corrosponding object to the selected card, meaning the id of the card element \
      does not match any of the corrosponding 'cardId' attribtues. Ensure that the cardId attribute \
      is assigned as the card elements HTML 'id' when the card is created.`);
        }
        // unselect the previously selected card if it exists and if we are allowed too
        if (Object.keys(this.storedSelEls).length > 0 && unselectPrevious) {
            const storedEl = this.storedSelEls.pop();
            if (storedEl !== undefined) {
                storedEl.classList.remove(config_1.config.CSS.CLASSES.selected);
            }
        }
        // on click add the 'selected' class onto the element which runs a transition
        selCardEl.classList.add(config_1.config.CSS.CLASSES.selected);
        this.storedSelEls.push(selCardEl);
        if (callback != null) {
            callback(selObj);
        }
    }
    /** Manages adding certain properties realting to scrolling text when entering
     * a card element. We assume there is only one scrolling text on the card.
     *
     * @param {Element} enteringCardEl - element you are entering, that contains the scrolling text
     */
    scrollTextOnCardEnter(enteringCardEl) {
        const scrollingText = enteringCardEl.getElementsByClassName(config_1.config.CSS.CLASSES.scrollingText)[0];
        const parent = scrollingText.parentElement;
        if ((0, config_1.isEllipsisActive)(scrollingText)) {
            parent === null || parent === void 0 ? void 0 : parent.classList.add(config_1.config.CSS.CLASSES.scrollLeft);
            scrollingText.classList.remove(config_1.config.CSS.CLASSES.ellipsisWrap);
            this.runScrollingTextAnim(scrollingText, enteringCardEl);
        }
    }
    /** Starts to scroll text from left to right.
     *
     * @param {Element} scrollingText - element containing the text that will scroll
     * @param {Element} cardEl - card element that contains the scrolling text
     */
    runScrollingTextAnim(scrollingText, cardEl) {
        const LINGER_AMT = 20;
        const font = window
            .getComputedStyle(scrollingText, null)
            .getPropertyValue('font');
        if (scrollingText.textContent === null) {
            throw new Error('Scrolling text element does not contain any text content');
        }
        this.currScrollingAnim = scrollingText.animate([
            // keyframes
            { transform: 'translateX(0px)' },
            {
                transform: `translateX(${-(0, config_1.getTextWidth)(scrollingText.textContent, font) - LINGER_AMT}px)`
            }
        ], {
            // timing options
            duration: 5000,
            iterations: 1
        });
        this.currScrollingAnim.onfinish = () => this.scrollTextOnCardLeave(cardEl);
    }
    /** Manages removing certain properties relating to scrolling text once leaving
     * a card element. We assume there is only one scrolling text on the card.
     *
     * @param {HTML} leavingCardEl - element you are leaving, that contains the scrolling text
     */
    scrollTextOnCardLeave(leavingCardEl) {
        var _a;
        const scrollingText = leavingCardEl.getElementsByClassName(config_1.config.CSS.CLASSES.scrollingText)[0];
        const parent = scrollingText.parentElement;
        parent === null || parent === void 0 ? void 0 : parent.classList.remove(config_1.config.CSS.CLASSES.scrollLeft);
        scrollingText.classList.add(config_1.config.CSS.CLASSES.ellipsisWrap);
        (_a = this.currScrollingAnim) === null || _a === void 0 ? void 0 : _a.cancel();
    }
    clearSelectedEls() {
        this.storedSelEls.splice(0, this.storedSelEls.length);
    }
    addAllEventListeners(cards, objArr, clickCallBack, allowUnselected, unselectPrevious) {
        this.clearSelectedEls();
        cards.forEach((trackCard) => {
            trackCard.addEventListener('click', (evt) => {
                var _a;
                // if the element restricts flip on click then dont flip the card
                if ((_a = evt.target) === null || _a === void 0 ? void 0 : _a.getAttribute(config_1.config.CSS.ATTRIBUTES.restrictFlipOnClick)) {
                    return;
                }
                this.onCardClick(trackCard, objArr, clickCallBack, allowUnselected, unselectPrevious);
            });
            trackCard.addEventListener('mouseenter', () => {
                this.scrollTextOnCardEnter(trackCard);
            });
            trackCard.addEventListener('mouseleave', () => {
                this.scrollTextOnCardLeave(trackCard);
            });
        });
    }
}
exports["default"] = CardActionsHandler;


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
function loadVolume() {
    return __awaiter(this, void 0, void 0, function* () {
        const { res, err } = yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getPlayerVolumeData));
        if (err) {
            return 0;
        }
        else {
            return res.data;
        }
    });
}
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
                    volume: volume
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
                        volume: volume
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

/***/ "./src/public/components/playlist.ts":
/*!*******************************************!*\
  !*** ./src/public/components/playlist.ts ***!
  \*******************************************/
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
exports.getPlaylistTracksFromDatas = void 0;
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
const track_1 = __webpack_require__(/*! ./track */ "./src/public/components/track.ts");
const card_1 = __importDefault(__webpack_require__(/*! ./card */ "./src/public/components/card.ts"));
const doubly_linked_list_1 = __importDefault(__webpack_require__(/*! ./doubly-linked-list */ "./src/public/components/doubly-linked-list.ts"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
class Playlist extends card_1.default {
    constructor(name, images, id) {
        super();
        this.name = name;
        this.id = id;
        this.undoStack = [];
        this.order = 'custom-order'; // set it as the initial order
        this.trackList = undefined;
        // the id of the playlist card element
        this.imageUrl = (0, config_1.getValidImage)(images);
    }
    addToUndoStack(tracks) {
        this.undoStack.push(tracks);
    }
    /**
     * Produces the card element of this playlist.
     *
     * @param {Number} idx The card index to use for the elements id suffix
     * @returns {ChildNode} The converted html string to an element
     */
    getPlaylistCardHtml(idx, inTextForm, isSelected = false) {
        const id = `${config_1.config.CSS.IDs.playlistPrefix}${idx}`;
        const expandOnHover = inTextForm ? '' : config_1.config.CSS.CLASSES.expandOnHover;
        this.cardId = id;
        const html = `
        <div class="${expandOnHover}">
          <button class="${config_1.config.CSS.CLASSES.fadeIn} ${config_1.config.CSS.CLASSES.card} ${config_1.config.CSS.CLASSES.playlist} ${config_1.config.CSS.CLASSES.noSelect} ${isSelected ? config_1.config.CSS.CLASSES.selected : ''}" id="${this.getCardId()}" title="Click to View Tracks">
              <img src="${this.imageUrl}" alt="Playlist Cover"></img>
              <h4 class="${config_1.config.CSS.CLASSES.scrollingText} ${config_1.config.CSS.CLASSES.ellipsisWrap}">${this.name}</h4>
          </button>
        </div>
      `;
        return (0, config_1.htmlToEl)(html);
    }
    /**
     * Produces list of Track class instances using track datas from spotify web api.
     *
     * @returns {DoublyLinkedList<Track>} List of track classes created using the obtained track datas.
     */
    loadTracks() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield axios_1.default.request({ method: 'get', url: `${config_1.config.URLs.getPlaylistTracks + this.id}` })
                .catch((err) => {
                throw new Error(err);
            });
            if (!res) {
                return null;
            }
            const trackList = new doubly_linked_list_1.default();
            // map each track data in the playlist data to an array.
            let tracksData = res.data.map((data) => data.track);
            // filter any data that has a null id as the track would not be unplayable
            tracksData = tracksData.filter((data) => data.id !== null);
            getPlaylistTracksFromDatas(tracksData, res.data, trackList);
            // define track objects
            this.trackList = trackList;
            return trackList;
        });
    }
    hasLoadedTracks() {
        return this.trackList !== undefined;
    }
}
/**
 * Gets playlist tracks from data. This also initializes the date added.
 *
 * @param {Array<TrackData>} tracksData an array of containing each track's data
 * @param {Array<PlaylistTrackData>} dateAddedObjects The object that contains the added_at variable.
 * @param {DoublyLinkedList<Track>} tracksList the doubly linked list to put the tracks into.
 */
function getPlaylistTracksFromDatas(tracksData, dateAddedObjects, trackList) {
    (0, track_1.generateTracksFromData)(tracksData, trackList);
    let i = 0;
    // set the dates added
    for (const trackOut of trackList.values()) {
        const dateAddedObj = dateAddedObjects[i];
        const track = trackOut;
        track.setDateAddedToPlaylist(dateAddedObj.added_at);
        i++;
    }
}
exports.getPlaylistTracksFromDatas = getPlaylistTracksFromDatas;
exports["default"] = Playlist;


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
    addEventListeners() {
        this.addMouseEvents();
        this.addTouchEvents();
    }
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
     * @param playPrevFunc the function to run when the play previous button is pressed on the web player.
     * @param pauseFunc the function to run when the pause/play button is pressed on the web player.
     * @param playNextFunc the function to run when the play next button is pressed on the web player.
     * @param onSeekStart - on drag start event for song progress slider
     * @param seekSong - on drag end event to seek song for song progress slider
     * @param onSeeking - on dragging event for song progress slider
     * @param setVolume - on dragging and on drag end event for volume slider
     * @param initialVolume - the initial volume to set the slider at
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
     * @param percentDone the percent of the song that has been completed
     * @param position the current position in ms that has been completed
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
     * @param onSeekStart - on drag start event for song progress slider
     * @param seekSong - on drag end event to seek song for song progress slider
     * @param onSeeking - on dragging event for song progress slider
     * @param setVolume - on dragging and on drag end event for volume slider
     * @param initialVolume - the initial volume to set the slider at
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
     * @param playPrevFunc function to run when play previous button is pressed
     * @param pauseFunc function to run when play/pause button is pressed
     * @param playNextFunc function to run when play next button is pressed
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
                    <img src="${this.imageUrl}" alt="Album Cover"></img>
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
              <button id="${playPauseId}" class="${config_1.config.CSS.CLASSES.playBtn} ${(0, playback_sdk_1.isSamePlayingURIWithEl)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}">
              </button>
              <img class="${config_1.config.CSS.CLASSES.noSelect}" src="${this.imageUrl}"></img>
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
              <img class="${config_1.config.CSS.CLASSES.noSelect}" src="${this.imageUrl}"></img>
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
        siteUrl: 'http://localhost:5000',
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
     * @param {String} elementsToAnimate - comma separated string containing the classes or ids of elements to animate including prefix char.
     * @param {String} classToTransitionToo - The class that all the transitioning elements will add
     * @param {Number} animationInterval - The interval to wait between animation of elements
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
/** Generate a login/change account link. Defaults to appending it onto the nav bar.
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

/***/ "./src/public/pages/playlists-page/playlists.ts":
/*!******************************************************!*\
  !*** ./src/public/pages/playlists-page/playlists.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const playlist_1 = __importDefault(__webpack_require__(/*! ../../components/playlist */ "./src/public/components/playlist.ts"));
const asyncSelectionVerif_1 = __importDefault(__webpack_require__(/*! ../../components/asyncSelectionVerif */ "./src/public/components/asyncSelectionVerif.ts"));
const config_1 = __webpack_require__(/*! ../../config */ "./src/public/config.ts");
const manage_tokens_1 = __webpack_require__(/*! ../../manage-tokens */ "./src/public/manage-tokens.ts");
const card_actions_1 = __importDefault(__webpack_require__(/*! ../../components/card-actions */ "./src/public/components/card-actions.ts"));
const doubly_linked_list_1 = __importStar(__webpack_require__(/*! ../../components/doubly-linked-list */ "./src/public/components/doubly-linked-list.ts"));
const interactjs_1 = __importDefault(__webpack_require__(/*! interactjs */ "./node_modules/interactjs/dist/interact.min.js"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const expandedPlaylistMods = document.getElementById(config_1.config.CSS.IDs.expandedPlaylistMods);
const playlistHeaderArea = document.getElementById(config_1.config.CSS.IDs.playlistHeaderArea);
// add on change event listener to the order selection element of the mods expanded playlist
const playlistOrder = expandedPlaylistMods === null || expandedPlaylistMods === void 0 ? void 0 : expandedPlaylistMods.getElementsByClassName(config_1.config.CSS.CLASSES.playlistOrder)[0];
const trackUl = expandedPlaylistMods === null || expandedPlaylistMods === void 0 ? void 0 : expandedPlaylistMods.getElementsByTagName('ul')[0];
const playlistSearchInput = expandedPlaylistMods === null || expandedPlaylistMods === void 0 ? void 0 : expandedPlaylistMods.getElementsByClassName(config_1.config.CSS.CLASSES.playlistSearch)[0];
const playlistsCardContainer = document.getElementById(config_1.config.CSS.IDs.playlistCardsContainer);
const cardResizeContainer = (_a = document
    .getElementById(config_1.config.CSS.IDs.playlistsSection)) === null || _a === void 0 ? void 0 : _a.getElementsByClassName(config_1.config.CSS.CLASSES.resizeContainer)[0];
// min viewport before playlist cards convert to text form automatically (equivalent to the media query in playlists.less that changes .card)
const VIEWPORT_MIN = 600;
// will resize the playlist card container to the size wanted when screen is <= VIEWPORT_MIN
const restrictResizeWidth = () => (cardResizeContainer.style.width = VIEWPORT_MIN / 2.5 + 'px');
const resizeActions = (function () {
    // id of resize container used to set interaction through interactjs
    const resizeId = '#' +
        config_1.config.CSS.IDs.playlistsSection +
        '>.' +
        config_1.config.CSS.CLASSES.resizeContainer;
    function enableResize() {
        (0, interactjs_1.default)(resizeId)
            .resizable({
            // only resize from the right
            edges: { top: false, left: false, bottom: false, right: true },
            listeners: {
                move: function (event) {
                    Object.assign(event.target.style, {
                        width: `${event.rect.width}px`
                    });
                }
            }
        })
            .on('resizeend', saves.saveResizeWidth);
        // once we renable the resize we must set its width to be what the user last set it too.
        initialLoads.loadResizeWidth();
    }
    function disableResize() {
        (0, interactjs_1.default)(resizeId).unset();
        // once we disable the resize we must restrict the width to fit within VIEWPORT_MIN pixels.
        restrictResizeWidth();
    }
    return {
        enableResize,
        disableResize
    };
})();
// order of items should never change as all other orderings are based off this one, and the only way to return back to this custom order is to retain it.
// only access this when tracks have loaded.
const selPlaylistTracks = () => {
    if (playlistActions.playlistSelVerif.currSelectedValNoNull === null || playlistActions.playlistSelVerif.currSelectedValNoNull.trackList === undefined) {
        throw new Error('Attempted to access selection verif doubly linked tracks list before it was loaded');
    }
    return playlistActions.playlistSelVerif.currSelectedValNoNull.trackList;
};
const playlistActions = (function () {
    const playlistSelVerif = new asyncSelectionVerif_1.default();
    const cardActionsHandler = new card_actions_1.default(1);
    const playlistTitleh2 = expandedPlaylistMods === null || expandedPlaylistMods === void 0 ? void 0 : expandedPlaylistMods.getElementsByTagName('h2')[0];
    /** Asynchronously load a playlists tracks and replace the track ul html once it loads
     *
     * @param {Playlist} playlistObj - a Playlist instance whose tracks will be loaded
     * @param {Function} callback - callback function to run when loading was succesful
     */
    function loadPlaylistTracks(playlistObj, callback) {
        playlistObj
            .loadTracks()
            .then(() => {
            // because .then() can run when the currently selected playlist has already changed we need to verify
            if (!playlistSelVerif.isValid(playlistObj)) {
                return;
            }
            callback();
        })
            .catch((err) => {
            console.log('Error when getting tracks');
            console.error(err);
        });
    }
    function whenTracksLoading() {
        // hide header while loading tracks
        playlistHeaderArea === null || playlistHeaderArea === void 0 ? void 0 : playlistHeaderArea.classList.add(config_1.config.CSS.CLASSES.hide);
        playlistSearchInput.value = '';
        trackUl.scrollTop = 0;
    }
    function onTracksLoadingDone() {
        // show them once tracks have loaded
        playlistHeaderArea === null || playlistHeaderArea === void 0 ? void 0 : playlistHeaderArea.classList.remove(config_1.config.CSS.CLASSES.hide);
    }
    /** Empty the track li and replace it with newly loaded track li.
     *
     * @param {Playlist} playlistObj - a Playlist instance whose tracks will be loaded
     */
    function showPlaylistTracks(playlistObj) {
        if (playlistTitleh2 !== undefined && playlistTitleh2.textContent !== null) {
            playlistTitleh2.textContent = playlistObj.name;
        }
        // empty the track li
        removeAllChildNodes(trackUl);
        // initially show the playlist with the loading spinner
        const htmlString = `
            <li>
              <img src="${config_1.config.PATHS.spinner}" />
            </li>`;
        const spinnerEl = (0, config_1.htmlToEl)(htmlString);
        trackUl.appendChild(spinnerEl);
        playlistSelVerif.selectionChanged(playlistObj);
        saves.savePlaylistId(playlistObj.id);
        // tracks are already loaded so show them
        if (playlistObj.hasLoadedTracks()) {
            whenTracksLoading();
            onTracksLoadingDone();
            manageTracks.sortExpandedTracksToOrder(playlistObj.order === playlistOrder.value);
        }
        else {
            // tracks aren't loaded so lazy load them then show them
            whenTracksLoading();
            loadPlaylistTracks(playlistObj, () => {
                // indexed when loaded so no need to re-index them
                manageTracks.sortExpandedTracksToOrder(true);
                onTracksLoadingDone();
            });
        }
    }
    /** When a card is clicked run the standard CardActionsHandler onClick then show its tracks on callback.
     *
     * @param {Array<Playlist>} playlistObjs
     * @param {HTMLElement} playlistCard
     */
    function clickCard(playlistObjs, playlistCard) {
        cardActionsHandler.onCardClick(playlistCard, playlistObjs, (selObj) => {
            showPlaylistTracks(selObj);
        });
    }
    /** Add event listeners to each playlist card.
     *
     * @param {Array<Playlist>} playlistObjs - playlists that will be used for the events.
     */
    function addOnPlaylistCardListeners(playlistObjs) {
        const playlistCards = Array.from(document.getElementsByClassName(config_1.config.CSS.CLASSES.playlist));
        playlistCards.forEach((playlistCard) => {
            playlistCard.addEventListener('click', () => {
                clickCard(playlistObjs, playlistCard);
            });
            playlistCard.addEventListener('mouseenter', () => {
                cardActionsHandler.scrollTextOnCardEnter(playlistCard);
            });
            playlistCard.addEventListener('mouseleave', () => {
                cardActionsHandler.scrollTextOnCardLeave(playlistCard);
            });
        });
    }
    return {
        clickCard,
        addOnPlaylistCardListeners,
        showPlaylistTracks,
        playlistSelVerif
    };
})();
/**
 * Contains the array of Playlist objects.
 */
const infoRetrieval = (function () {
    const playlistObjs = [];
    /** Obtains playlist info from web api and displays their cards.
     *
     */
    function getInitialInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            function onSuccesful(res) {
                // remove the info loading spinners as info has been loaded
                const infoSpinners = Array.from(document.getElementsByClassName(config_1.config.CSS.CLASSES.infoLoadingSpinners));
                infoSpinners.forEach((spinner) => {
                    var _a;
                    (_a = spinner === null || spinner === void 0 ? void 0 : spinner.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(spinner);
                });
                const playlistDatas = res.data;
                // generate Playlist instances from the data
                playlistDatas.forEach((data) => {
                    // deleted playlists will have no name, but will still show the songs (spotify api thing), so just don't show them
                    if (data.name === '') {
                        return;
                    }
                    playlistObjs.push(new playlist_1.default(data.name, data.images, data.id));
                });
                displayCardInfo.displayPlaylistCards(playlistObjs);
            }
            // get playlists data and execute call back on succesful
            yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getPlaylists), onSuccesful);
            yield loadPlaylist();
        });
    }
    return {
        getInitialInfo,
        playlistObjs
    };
})();
const displayCardInfo = (function () {
    function determineResizeActiveness() {
        // allow resizing only when viewport is large enough to allow cards.
        if (window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches) {
            resizeActions.disableResize();
        }
        else {
            resizeActions.enableResize();
        }
    }
    /** Displays the playlist cards from a given array of playlists.
     *
     * @param {Array<Playlist>} playlistObjs
     */
    function displayPlaylistCards(playlistObjs) {
        var _a;
        removeAllChildNodes(playlistsCardContainer);
        const isInTextForm = (playlistsCardContainer === null || playlistsCardContainer === void 0 ? void 0 : playlistsCardContainer.classList.contains(config_1.config.CSS.CLASSES.textForm)) ||
            window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches;
        determineResizeActiveness();
        const selectedCard = playlistActions.playlistSelVerif.currSelectedVal;
        // add card htmls to container element
        playlistObjs.forEach((playlistObj, idx) => {
            playlistsCardContainer === null || playlistsCardContainer === void 0 ? void 0 : playlistsCardContainer.appendChild(playlistObj.getPlaylistCardHtml(idx, isInTextForm));
            // if before the form change this playlist was selected, simulate a click on it in order to select it in the new form
            if (playlistObj === selectedCard) {
                playlistActions.clickCard(playlistObjs, document.getElementById(selectedCard.cardId));
            }
        });
        // if there is a selected card scroll down to it.
        if (selectedCard) {
            (_a = document.getElementById(selectedCard.cardId)) === null || _a === void 0 ? void 0 : _a.scrollIntoView();
        }
        // add event listener to cards
        playlistActions.addOnPlaylistCardListeners(playlistObjs);
        // animate the cards(show the cards)
        config_1.animationControl.addClassOnInterval('.playlist', config_1.config.CSS.CLASSES.appear, 0);
    }
    return {
        displayPlaylistCards
    };
})();
function removeAllChildNodes(parent) {
    if (!parent) {
        throw new Error('parent is undefined and has no child nodes to remove');
    }
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
const manageTracks = (function () {
    /** Sorts the tracks order depending on what the user sets it too and re-indexes the tracks order if order has changed.
     *
     * @param isSameOrder - whether the order is the same or not as before.
     */
    function sortExpandedTracksToOrder(isSameOrder) {
        let newOrderTracks = new doubly_linked_list_1.default();
        let newOrderTracksArr = [];
        if (playlistOrder.value === 'custom-order') {
            newOrderTracks = selPlaylistTracks();
        }
        else if (playlistOrder.value === 'name') {
            newOrderTracksArr = orderTracksByName(selPlaylistTracks());
            newOrderTracks = (0, doubly_linked_list_1.arrayToDoublyLinkedList)(newOrderTracksArr);
        }
        else if (playlistOrder.value === 'date-added') {
            newOrderTracksArr = orderTracksByDateAdded(selPlaylistTracks());
            newOrderTracks = (0, doubly_linked_list_1.arrayToDoublyLinkedList)(newOrderTracksArr);
        }
        if (!isSameOrder) {
            // set the order of the playlist as the new order
            playlistActions.playlistSelVerif.currSelectedValNoNull.order =
                playlistOrder.value;
        }
        rerenderPlaylistTracks(newOrderTracks, trackUl);
    }
    function orderTracksByName(trackList) {
        // shallow copy just so we dont modify the original order
        const tracksCopy = [...trackList];
        tracksCopy.sort(function (a, b) {
            // -1 precedes, 1 suceeds, 0 is equal
            return a.title.toUpperCase() === b.title.toUpperCase()
                ? 0
                : a.title.toUpperCase() < b.title.toUpperCase()
                    ? -1
                    : 1;
        });
        return tracksCopy;
    }
    function orderTracksByDateAdded(trackList) {
        // shallow copy just so we dont modify the original order
        const tracksCopy = [...trackList];
        tracksCopy.sort(function (a, b) {
            // -1 'a' precedes 'b', 1 'a' suceeds 'b', 0 is 'a' equal 'b'
            return a.dateAddedToPlaylist === b.dateAddedToPlaylist
                ? 0
                : a.dateAddedToPlaylist < b.dateAddedToPlaylist
                    ? -1
                    : 1;
        });
        return tracksCopy;
    }
    function rerenderPlaylistTracks(trackList, trackArrUl) {
        removeAllChildNodes(trackArrUl);
        for (const track of trackList.values()) {
            trackArrUl.appendChild(track.getPlaylistTrackHtml(trackList, true));
        }
    }
    return {
        sortExpandedTracksToOrder,
        orderTracksByDateAdded
    };
})();
const addEventListeners = (function () {
    function addExpandedPlaylistModsSearchbarEvent() {
        var _a;
        // add key up event to the mods expanded playlist's search bar element
        (_a = expandedPlaylistMods === null || expandedPlaylistMods === void 0 ? void 0 : expandedPlaylistMods.getElementsByClassName(config_1.config.CSS.CLASSES.playlistSearch)[0]) === null || _a === void 0 ? void 0 : _a.addEventListener('keyup', () => {
            (0, config_1.searchUl)(trackUl, playlistSearchInput);
        });
    }
    function addExpandedPlaylistModsOrderEvent() {
        // add on change event listener to the order selection element of the mods expanded playlist
        playlistOrder.addEventListener('change', () => {
            manageTracks.sortExpandedTracksToOrder(false);
        });
    }
    function addConvertCards() {
        const convertBtn = document.getElementById(config_1.config.CSS.IDs.convertCard);
        const convertImg = convertBtn === null || convertBtn === void 0 ? void 0 : convertBtn.getElementsByTagName('img')[0];
        function onClick() {
            if (convertImg === undefined) {
                throw new Error('convert cards to text form buttons image is not found');
            }
            playlistsCardContainer === null || playlistsCardContainer === void 0 ? void 0 : playlistsCardContainer.classList.toggle(config_1.config.CSS.CLASSES.textForm);
            displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs);
            if (playlistsCardContainer === null || playlistsCardContainer === void 0 ? void 0 : playlistsCardContainer.classList.contains(config_1.config.CSS.CLASSES.textForm)) {
                saves.savePlaylistForm(true);
                convertImg.src = config_1.config.PATHS.gridView;
            }
            else {
                saves.savePlaylistForm(false);
                convertImg.src = config_1.config.PATHS.listView;
            }
        }
        convertBtn === null || convertBtn === void 0 ? void 0 : convertBtn.addEventListener('click', () => onClick());
    }
    /**
     * Add event listener onto
     */
    function addHideShowPlaylistTxt() {
        const toggleBtn = document.getElementById(config_1.config.CSS.IDs.hideShowPlaylistTxt);
        function onClick() {
            toggleBtn === null || toggleBtn === void 0 ? void 0 : toggleBtn.classList.toggle(config_1.config.CSS.CLASSES.selected);
            // if its selected we hide the cards otherwise we show them. This occurs when screen width is a certain size and a menu sliding from the left appears
            if (toggleBtn === null || toggleBtn === void 0 ? void 0 : toggleBtn.classList.contains(config_1.config.CSS.CLASSES.selected)) {
                cardResizeContainer.style.width = '0';
            }
            else {
                restrictResizeWidth();
            }
            updateHideShowPlaylistTxtIcon();
        }
        toggleBtn === null || toggleBtn === void 0 ? void 0 : toggleBtn.addEventListener('click', () => onClick());
    }
    return {
        addExpandedPlaylistModsSearchbarEvent,
        addExpandedPlaylistModsOrderEvent,
        addConvertCards,
        addHideShowPlaylistTxt
    };
})();
const saves = (function () {
    function saveResizeWidth() {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlaylistResizeData(cardResizeContainer.getBoundingClientRect().width.toString())));
    }
    function savePlaylistForm(isInTextForm) {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlaylistIsInTextFormData(String(isInTextForm))));
    }
    function savePlaylistId(id) {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putCurrPlaylistId(id)));
    }
    return {
        saveResizeWidth,
        savePlaylistForm,
        savePlaylistId
    };
})();
/**
 * update the icon to show a chevron left or chevron right depending on whether the playlist text is shown or not.
 */
function updateHideShowPlaylistTxtIcon() {
    const toggleBtn = document.getElementById(config_1.config.CSS.IDs.hideShowPlaylistTxt);
    const btnIcon = toggleBtn === null || toggleBtn === void 0 ? void 0 : toggleBtn.getElementsByTagName('img')[0];
    if (btnIcon === undefined) {
        throw new Error('img to show and hide the text form cards is not found');
    }
    // if its selected we hide the cards otherwise we show them.
    if (toggleBtn === null || toggleBtn === void 0 ? void 0 : toggleBtn.classList.contains(config_1.config.CSS.CLASSES.selected)) {
        btnIcon.src = config_1.config.PATHS.chevronRight;
    }
    else {
        btnIcon.src = config_1.config.PATHS.chevronLeft;
    }
}
function checkIfCardFormChangeOnResize() {
    const prev = {
        vwIsSmall: window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches
    };
    window.addEventListener('resize', function () {
        const wasBigNowSmall = window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches &&
            !prev.vwIsSmall;
        const wasSmallNowBig = prev.vwIsSmall &&
            window.matchMedia(`(min-width: ${VIEWPORT_MIN}px)`).matches;
        if (wasBigNowSmall || wasSmallNowBig) {
            if (wasSmallNowBig) {
                const toggleBtn = document.getElementById(config_1.config.CSS.IDs.hideShowPlaylistTxt);
                toggleBtn === null || toggleBtn === void 0 ? void 0 : toggleBtn.classList.remove(config_1.config.CSS.CLASSES.selected);
                updateHideShowPlaylistTxtIcon();
            }
            // card form has changed on window resize
            displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs);
            prev.vwIsSmall = window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches;
        }
    });
}
function loadPlaylist() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, config_1.promiseHandler)(axios_1.default
            .get(config_1.config.URLs.getCurrPlaylistId), (res) => {
            const loadedPlaylistId = res.data;
            const playlistToLoad = infoRetrieval.playlistObjs.find((playlist) => playlist.id === loadedPlaylistId);
            if (playlistToLoad) {
                playlistActions.showPlaylistTracks(playlistToLoad);
                const playlistCard = document.getElementById(playlistToLoad.getCardId());
                if (playlistCard) {
                    playlistActions.clickCard(infoRetrieval.playlistObjs, playlistCard);
                }
            }
        });
    });
}
const initialLoads = (function () {
    function loadPlaylistForm() {
        (0, config_1.promiseHandler)(axios_1.default
            .get(config_1.config.URLs.getPlaylistIsInTextFormData)
            .then((res) => {
            if (res.data === true) {
                const convertBtn = document.getElementById(config_1.config.CSS.IDs.convertCard);
                const convertImg = convertBtn === null || convertBtn === void 0 ? void 0 : convertBtn.getElementsByTagName('img')[0];
                if (convertImg === undefined) {
                    throw new Error('convert cards to text form buttons image is not found');
                }
                playlistsCardContainer === null || playlistsCardContainer === void 0 ? void 0 : playlistsCardContainer.classList.add(config_1.config.CSS.CLASSES.textForm);
                displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs);
                convertImg.src = config_1.config.PATHS.gridView;
            }
            // else it is in card form which is the default.
        }));
    }
    function loadResizeWidth() {
        (0, config_1.promiseHandler)(axios_1.default
            .get(config_1.config.URLs.getPlaylistResizeData)
            .then((res) => {
            cardResizeContainer.style.width = res.data + 'px';
        }));
    }
    return {
        loadPlaylistForm,
        loadResizeWidth
    };
})();
(function () {
    (0, config_1.promiseHandler)((0, manage_tokens_1.checkIfHasTokens)(), (hasToken) => {
        (0, manage_tokens_1.onSuccessfulTokenCall)(hasToken, () => {
            // get information and onSuccess animate the elements
            (0, config_1.promiseHandler)(infoRetrieval.getInitialInfo(), () => config_1.animationControl.addClassOnInterval('.playlist,#expanded-playlist-mods', config_1.config.CSS.CLASSES.appear, 25), () => console.log('Problem when getting information'));
        });
    });
    Object.entries(addEventListeners).forEach(([, addEventListener]) => {
        addEventListener();
    });
    checkIfCardFormChangeOnResize();
    Object.entries(initialLoads).forEach(([, loader]) => {
        loader();
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/public/pages/playlists-page/playlists.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2Vudi9kYXRhLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3ZhbGlkYXRvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvaW50ZXJhY3Rqcy9kaXN0L2ludGVyYWN0Lm1pbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9hbGJ1bS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9hc3luY1NlbGVjdGlvblZlcmlmLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2NhcmQtYWN0aW9ucy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9jYXJkLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wbGF5YmFjay1zZGsudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcGxheWxpc3QudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL2FnZ3JlZ2F0b3IudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3B1YnN1Yi9zdWJzY3JpcHRpb24udHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvc3BvdGlmeS1wbGF5YmFjay1lbGVtZW50LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3RyYWNrLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb25maWcudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL21hbmFnZS10b2tlbnMudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL3BhZ2VzL3BsYXlsaXN0cy1wYWdlL3BsYXlsaXN0cy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvdXNlci1kYXRhLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIHZhciBvbkNhbmNlbGVkO1xuICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi51bnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUoZnVuY3Rpb24gX3Jlc29sdmUodmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIGZ1bmN0aW9uIF9yZWplY3QoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dCA/ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcgOiAndGltZW91dCBleGNlZWRlZCc7XG4gICAgICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuIHx8IGNvbmZpZy5zaWduYWwpIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgICBvbkNhbmNlbGVkID0gZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoIWNhbmNlbCB8fCAoY2FuY2VsICYmIGNhbmNlbC50eXBlKSA/IG5ldyBDYW5jZWwoJ2NhbmNlbGVkJykgOiBjYW5jZWwpO1xuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfTtcblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuICYmIGNvbmZpZy5jYW5jZWxUb2tlbi5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLmFib3J0ZWQgPyBvbkNhbmNlbGVkKCkgOiBjb25maWcuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuICBpbnN0YW5jZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoZGVmYXVsdENvbmZpZywgaW5zdGFuY2VDb25maWcpKTtcbiAgfTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5heGlvcy5WRVJTSU9OID0gcmVxdWlyZSgnLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcblxuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbihmdW5jdGlvbihjYW5jZWwpIHtcbiAgICBpZiAoIXRva2VuLl9saXN0ZW5lcnMpIHJldHVybjtcblxuICAgIHZhciBpO1xuICAgIHZhciBsID0gdG9rZW4uX2xpc3RlbmVycy5sZW5ndGg7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbi5fbGlzdGVuZXJzW2ldKGNhbmNlbCk7XG4gICAgfVxuICAgIHRva2VuLl9saXN0ZW5lcnMgPSBudWxsO1xuICB9KTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbiA9IGZ1bmN0aW9uKG9uZnVsZmlsbGVkKSB7XG4gICAgdmFyIF9yZXNvbHZlO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICB0b2tlbi5zdWJzY3JpYmUocmVzb2x2ZSk7XG4gICAgICBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgfSkudGhlbihvbmZ1bGZpbGxlZCk7XG5cbiAgICBwcm9taXNlLmNhbmNlbCA9IGZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgICAgIHRva2VuLnVuc3Vic2NyaWJlKF9yZXNvbHZlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH07XG5cbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICBsaXN0ZW5lcih0aGlzLnJlYXNvbik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuX2xpc3RlbmVycykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBbbGlzdGVuZXJdO1xuICB9XG59O1xuXG4vKipcbiAqIFVuc3Vic2NyaWJlIGZyb20gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiB1bnN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAoIXRoaXMuX2xpc3RlbmVycykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSB0aGlzLl9saXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cblxuICBpZiAoY29uZmlnLnNpZ25hbCAmJiBjb25maWcuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgc3RhdHVzOiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc3RhdHVzID8gdGhpcy5yZXNwb25zZS5zdGF0dXMgOiBudWxsXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURpcmVjdEtleXMocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1lcmdlTWFwID0ge1xuICAgICd1cmwnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdtZXRob2QnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdkYXRhJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnYmFzZVVSTCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlcXVlc3QnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXNwb25zZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3BhcmFtc1NlcmlhbGl6ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dE1lc3NhZ2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd3aXRoQ3JlZGVudGlhbHMnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdhZGFwdGVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VUeXBlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkNvb2tpZU5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmSGVhZGVyTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uVXBsb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvbkRvd25sb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdkZWNvbXByZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Q29udGVudExlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heEJvZHlMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc3BvcnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwc0FnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnY2FuY2VsVG9rZW4nOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdzb2NrZXRQYXRoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VFbmNvZGluZyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3ZhbGlkYXRlU3RhdHVzJzogbWVyZ2VEaXJlY3RLZXlzXG4gIH07XG5cbiAgdXRpbHMuZm9yRWFjaChPYmplY3Qua2V5cyhjb25maWcxKS5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpLCBmdW5jdGlvbiBjb21wdXRlQ29uZmlnVmFsdWUocHJvcCkge1xuICAgIHZhciBtZXJnZSA9IG1lcmdlTWFwW3Byb3BdIHx8IG1lcmdlRGVlcFByb3BlcnRpZXM7XG4gICAgdmFyIGNvbmZpZ1ZhbHVlID0gbWVyZ2UocHJvcCk7XG4gICAgKHV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZ1ZhbHVlKSAmJiBtZXJnZSAhPT0gbWVyZ2VEaXJlY3RLZXlzKSB8fCAoY29uZmlnW3Byb3BdID0gY29uZmlnVmFsdWUpO1xuICB9KTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH0sXG5cbiAgaGVhZGVyczoge1xuICAgIGNvbW1vbjoge1xuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gICAgfVxuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwidmVyc2lvblwiOiBcIjAuMjQuMFwiXG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBWRVJTSU9OID0gcmVxdWlyZSgnLi4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3IgLSBzZXQgdG8gZmFsc2UgaWYgdGhlIHRyYW5zaXRpb25hbCBvcHRpb24gaGFzIGJlZW4gcmVtb3ZlZFxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uIC0gZGVwcmVjYXRlZCB2ZXJzaW9uIC8gcmVtb3ZlZCBzaW5jZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IG1lc3NhZ2UgLSBzb21lIG1lc3NhZ2Ugd2l0aCBhZGRpdGlvbmFsIGluZm9cbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBWRVJTSU9OICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkJyArICh2ZXJzaW9uID8gJyBpbiAnICsgdmVyc2lvbiA6ICcnKSkpO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiLyogaW50ZXJhY3QuanMgMS4xMC4xMSB8IGh0dHBzOi8vaW50ZXJhY3Rqcy5pby9saWNlbnNlICovXG4hZnVuY3Rpb24odCl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9dCgpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sdCk6KFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3NlbGY6dGhpcykuaW50ZXJhY3Q9dCgpfSgoZnVuY3Rpb24oKXt2YXIgdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9dm9pZCAwLHQuZGVmYXVsdD1mdW5jdGlvbih0KXtyZXR1cm4hKCF0fHwhdC5XaW5kb3cpJiZ0IGluc3RhbmNlb2YgdC5XaW5kb3d9O3ZhciBlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGUuaW5pdD1vLGUuZ2V0V2luZG93PWZ1bmN0aW9uKGUpe3JldHVybigwLHQuZGVmYXVsdCkoZSk/ZTooZS5vd25lckRvY3VtZW50fHxlKS5kZWZhdWx0Vmlld3x8ci53aW5kb3d9LGUud2luZG93PWUucmVhbFdpbmRvdz12b2lkIDA7dmFyIG49dm9pZCAwO2UucmVhbFdpbmRvdz1uO3ZhciByPXZvaWQgMDtmdW5jdGlvbiBvKHQpe2UucmVhbFdpbmRvdz1uPXQ7dmFyIG89dC5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtvLm93bmVyRG9jdW1lbnQhPT10LmRvY3VtZW50JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiB0LndyYXAmJnQud3JhcChvKT09PW8mJih0PXQud3JhcCh0KSksZS53aW5kb3c9cj10fWUud2luZG93PXIsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyYmd2luZG93JiZvKHdpbmRvdyk7dmFyIGk9e307ZnVuY3Rpb24gYSh0KXtyZXR1cm4oYT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KGksXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaS5kZWZhdWx0PXZvaWQgMDt2YXIgcz1mdW5jdGlvbih0KXtyZXR1cm4hIXQmJlwib2JqZWN0XCI9PT1hKHQpfSxsPWZ1bmN0aW9uKHQpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHR9LHU9e3dpbmRvdzpmdW5jdGlvbihuKXtyZXR1cm4gbj09PWUud2luZG93fHwoMCx0LmRlZmF1bHQpKG4pfSxkb2NGcmFnOmZ1bmN0aW9uKHQpe3JldHVybiBzKHQpJiYxMT09PXQubm9kZVR5cGV9LG9iamVjdDpzLGZ1bmM6bCxudW1iZXI6ZnVuY3Rpb24odCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHR9LGJvb2w6ZnVuY3Rpb24odCl7cmV0dXJuXCJib29sZWFuXCI9PXR5cGVvZiB0fSxzdHJpbmc6ZnVuY3Rpb24odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHR9LGVsZW1lbnQ6ZnVuY3Rpb24odCl7aWYoIXR8fFwib2JqZWN0XCIhPT1hKHQpKXJldHVybiExO3ZhciBuPWUuZ2V0V2luZG93KHQpfHxlLndpbmRvdztyZXR1cm4vb2JqZWN0fGZ1bmN0aW9uLy50ZXN0KGEobi5FbGVtZW50KSk/dCBpbnN0YW5jZW9mIG4uRWxlbWVudDoxPT09dC5ub2RlVHlwZSYmXCJzdHJpbmdcIj09dHlwZW9mIHQubm9kZU5hbWV9LHBsYWluT2JqZWN0OmZ1bmN0aW9uKHQpe3JldHVybiBzKHQpJiYhIXQuY29uc3RydWN0b3ImJi9mdW5jdGlvbiBPYmplY3RcXGIvLnRlc3QodC5jb25zdHJ1Y3Rvci50b1N0cmluZygpKX0sYXJyYXk6ZnVuY3Rpb24odCl7cmV0dXJuIHModCkmJnZvaWQgMCE9PXQubGVuZ3RoJiZsKHQuc3BsaWNlKX19O2kuZGVmYXVsdD11O3ZhciBjPXt9O2Z1bmN0aW9uIGYodCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtpZihcImRyYWdcIj09PWUucHJlcGFyZWQubmFtZSl7dmFyIG49ZS5wcmVwYXJlZC5heGlzO1wieFwiPT09bj8oZS5jb29yZHMuY3VyLnBhZ2UueT1lLmNvb3Jkcy5zdGFydC5wYWdlLnksZS5jb29yZHMuY3VyLmNsaWVudC55PWUuY29vcmRzLnN0YXJ0LmNsaWVudC55LGUuY29vcmRzLnZlbG9jaXR5LmNsaWVudC55PTAsZS5jb29yZHMudmVsb2NpdHkucGFnZS55PTApOlwieVwiPT09biYmKGUuY29vcmRzLmN1ci5wYWdlLng9ZS5jb29yZHMuc3RhcnQucGFnZS54LGUuY29vcmRzLmN1ci5jbGllbnQueD1lLmNvb3Jkcy5zdGFydC5jbGllbnQueCxlLmNvb3Jkcy52ZWxvY2l0eS5jbGllbnQueD0wLGUuY29vcmRzLnZlbG9jaXR5LnBhZ2UueD0wKX19ZnVuY3Rpb24gZCh0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb247aWYoXCJkcmFnXCI9PT1uLnByZXBhcmVkLm5hbWUpe3ZhciByPW4ucHJlcGFyZWQuYXhpcztpZihcInhcIj09PXJ8fFwieVwiPT09cil7dmFyIG89XCJ4XCI9PT1yP1wieVwiOlwieFwiO2UucGFnZVtvXT1uLmNvb3Jkcy5zdGFydC5wYWdlW29dLGUuY2xpZW50W29dPW4uY29vcmRzLnN0YXJ0LmNsaWVudFtvXSxlLmRlbHRhW29dPTB9fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoYyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxjLmRlZmF1bHQ9dm9pZCAwO3ZhciBwPXtpZDpcImFjdGlvbnMvZHJhZ1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5hY3Rpb25zLG49dC5JbnRlcmFjdGFibGUscj10LmRlZmF1bHRzO24ucHJvdG90eXBlLmRyYWdnYWJsZT1wLmRyYWdnYWJsZSxlLm1hcC5kcmFnPXAsZS5tZXRob2REaWN0LmRyYWc9XCJkcmFnZ2FibGVcIixyLmFjdGlvbnMuZHJhZz1wLmRlZmF1bHRzfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tbW92ZVwiOmYsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLXJlc3VtZVwiOmYsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpkLFwiYXV0by1zdGFydDpjaGVja1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmludGVyYWN0YWJsZSxyPXQuYnV0dG9ucyxvPW4ub3B0aW9ucy5kcmFnO2lmKG8mJm8uZW5hYmxlZCYmKCFlLnBvaW50ZXJJc0Rvd258fCEvbW91c2V8cG9pbnRlci8udGVzdChlLnBvaW50ZXJUeXBlKXx8MCE9KHImbi5vcHRpb25zLmRyYWcubW91c2VCdXR0b25zKSkpcmV0dXJuIHQuYWN0aW9uPXtuYW1lOlwiZHJhZ1wiLGF4aXM6XCJzdGFydFwiPT09by5sb2NrQXhpcz9vLnN0YXJ0QXhpczpvLmxvY2tBeGlzfSwhMX19LGRyYWdnYWJsZTpmdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0Lm9iamVjdCh0KT8odGhpcy5vcHRpb25zLmRyYWcuZW5hYmxlZD0hMSE9PXQuZW5hYmxlZCx0aGlzLnNldFBlckFjdGlvbihcImRyYWdcIix0KSx0aGlzLnNldE9uRXZlbnRzKFwiZHJhZ1wiLHQpLC9eKHh5fHh8eXxzdGFydCkkLy50ZXN0KHQubG9ja0F4aXMpJiYodGhpcy5vcHRpb25zLmRyYWcubG9ja0F4aXM9dC5sb2NrQXhpcyksL14oeHl8eHx5KSQvLnRlc3QodC5zdGFydEF4aXMpJiYodGhpcy5vcHRpb25zLmRyYWcuc3RhcnRBeGlzPXQuc3RhcnRBeGlzKSx0aGlzKTppLmRlZmF1bHQuYm9vbCh0KT8odGhpcy5vcHRpb25zLmRyYWcuZW5hYmxlZD10LHRoaXMpOnRoaXMub3B0aW9ucy5kcmFnfSxiZWZvcmVNb3ZlOmYsbW92ZTpkLGRlZmF1bHRzOntzdGFydEF4aXM6XCJ4eVwiLGxvY2tBeGlzOlwieHlcIn0sZ2V0Q3Vyc29yOmZ1bmN0aW9uKCl7cmV0dXJuXCJtb3ZlXCJ9fSx2PXA7Yy5kZWZhdWx0PXY7dmFyIGg9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGgsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaC5kZWZhdWx0PXZvaWQgMDt2YXIgZz17aW5pdDpmdW5jdGlvbih0KXt2YXIgZT10O2cuZG9jdW1lbnQ9ZS5kb2N1bWVudCxnLkRvY3VtZW50RnJhZ21lbnQ9ZS5Eb2N1bWVudEZyYWdtZW50fHx5LGcuU1ZHRWxlbWVudD1lLlNWR0VsZW1lbnR8fHksZy5TVkdTVkdFbGVtZW50PWUuU1ZHU1ZHRWxlbWVudHx8eSxnLlNWR0VsZW1lbnRJbnN0YW5jZT1lLlNWR0VsZW1lbnRJbnN0YW5jZXx8eSxnLkVsZW1lbnQ9ZS5FbGVtZW50fHx5LGcuSFRNTEVsZW1lbnQ9ZS5IVE1MRWxlbWVudHx8Zy5FbGVtZW50LGcuRXZlbnQ9ZS5FdmVudCxnLlRvdWNoPWUuVG91Y2h8fHksZy5Qb2ludGVyRXZlbnQ9ZS5Qb2ludGVyRXZlbnR8fGUuTVNQb2ludGVyRXZlbnR9LGRvY3VtZW50Om51bGwsRG9jdW1lbnRGcmFnbWVudDpudWxsLFNWR0VsZW1lbnQ6bnVsbCxTVkdTVkdFbGVtZW50Om51bGwsU1ZHRWxlbWVudEluc3RhbmNlOm51bGwsRWxlbWVudDpudWxsLEhUTUxFbGVtZW50Om51bGwsRXZlbnQ6bnVsbCxUb3VjaDpudWxsLFBvaW50ZXJFdmVudDpudWxsfTtmdW5jdGlvbiB5KCl7fXZhciBtPWc7aC5kZWZhdWx0PW07dmFyIGI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksYi5kZWZhdWx0PXZvaWQgMDt2YXIgeD17aW5pdDpmdW5jdGlvbih0KXt2YXIgZT1oLmRlZmF1bHQuRWxlbWVudCxuPXQubmF2aWdhdG9yfHx7fTt4LnN1cHBvcnRzVG91Y2g9XCJvbnRvdWNoc3RhcnRcImluIHR8fGkuZGVmYXVsdC5mdW5jKHQuRG9jdW1lbnRUb3VjaCkmJmguZGVmYXVsdC5kb2N1bWVudCBpbnN0YW5jZW9mIHQuRG9jdW1lbnRUb3VjaCx4LnN1cHBvcnRzUG9pbnRlckV2ZW50PSExIT09bi5wb2ludGVyRW5hYmxlZCYmISFoLmRlZmF1bHQuUG9pbnRlckV2ZW50LHguaXNJT1M9L2lQKGhvbmV8b2R8YWQpLy50ZXN0KG4ucGxhdGZvcm0pLHguaXNJT1M3PS9pUChob25lfG9kfGFkKS8udGVzdChuLnBsYXRmb3JtKSYmL09TIDdbXlxcZF0vLnRlc3Qobi5hcHBWZXJzaW9uKSx4LmlzSWU5PS9NU0lFIDkvLnRlc3Qobi51c2VyQWdlbnQpLHguaXNPcGVyYU1vYmlsZT1cIk9wZXJhXCI9PT1uLmFwcE5hbWUmJnguc3VwcG9ydHNUb3VjaCYmL1ByZXN0by8udGVzdChuLnVzZXJBZ2VudCkseC5wcmVmaXhlZE1hdGNoZXNTZWxlY3Rvcj1cIm1hdGNoZXNcImluIGUucHJvdG90eXBlP1wibWF0Y2hlc1wiOlwid2Via2l0TWF0Y2hlc1NlbGVjdG9yXCJpbiBlLnByb3RvdHlwZT9cIndlYmtpdE1hdGNoZXNTZWxlY3RvclwiOlwibW96TWF0Y2hlc1NlbGVjdG9yXCJpbiBlLnByb3RvdHlwZT9cIm1vek1hdGNoZXNTZWxlY3RvclwiOlwib01hdGNoZXNTZWxlY3RvclwiaW4gZS5wcm90b3R5cGU/XCJvTWF0Y2hlc1NlbGVjdG9yXCI6XCJtc01hdGNoZXNTZWxlY3RvclwiLHgucEV2ZW50VHlwZXM9eC5zdXBwb3J0c1BvaW50ZXJFdmVudD9oLmRlZmF1bHQuUG9pbnRlckV2ZW50PT09dC5NU1BvaW50ZXJFdmVudD97dXA6XCJNU1BvaW50ZXJVcFwiLGRvd246XCJNU1BvaW50ZXJEb3duXCIsb3ZlcjpcIm1vdXNlb3ZlclwiLG91dDpcIm1vdXNlb3V0XCIsbW92ZTpcIk1TUG9pbnRlck1vdmVcIixjYW5jZWw6XCJNU1BvaW50ZXJDYW5jZWxcIn06e3VwOlwicG9pbnRlcnVwXCIsZG93bjpcInBvaW50ZXJkb3duXCIsb3ZlcjpcInBvaW50ZXJvdmVyXCIsb3V0OlwicG9pbnRlcm91dFwiLG1vdmU6XCJwb2ludGVybW92ZVwiLGNhbmNlbDpcInBvaW50ZXJjYW5jZWxcIn06bnVsbCx4LndoZWVsRXZlbnQ9aC5kZWZhdWx0LmRvY3VtZW50JiZcIm9ubW91c2V3aGVlbFwiaW4gaC5kZWZhdWx0LmRvY3VtZW50P1wibW91c2V3aGVlbFwiOlwid2hlZWxcIn0sc3VwcG9ydHNUb3VjaDpudWxsLHN1cHBvcnRzUG9pbnRlckV2ZW50Om51bGwsaXNJT1M3Om51bGwsaXNJT1M6bnVsbCxpc0llOTpudWxsLGlzT3BlcmFNb2JpbGU6bnVsbCxwcmVmaXhlZE1hdGNoZXNTZWxlY3RvcjpudWxsLHBFdmVudFR5cGVzOm51bGwsd2hlZWxFdmVudDpudWxsfSx3PXg7Yi5kZWZhdWx0PXc7dmFyIF89e307ZnVuY3Rpb24gUCh0KXt2YXIgZT10LnBhcmVudE5vZGU7aWYoaS5kZWZhdWx0LmRvY0ZyYWcoZSkpe2Zvcig7KGU9ZS5ob3N0KSYmaS5kZWZhdWx0LmRvY0ZyYWcoZSk7KTtyZXR1cm4gZX1yZXR1cm4gZX1mdW5jdGlvbiBPKHQsbil7cmV0dXJuIGUud2luZG93IT09ZS5yZWFsV2luZG93JiYobj1uLnJlcGxhY2UoL1xcL2RlZXBcXC8vZyxcIiBcIikpLHRbYi5kZWZhdWx0LnByZWZpeGVkTWF0Y2hlc1NlbGVjdG9yXShuKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoXyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxfLm5vZGVDb250YWlucz1mdW5jdGlvbih0LGUpe2lmKHQuY29udGFpbnMpcmV0dXJuIHQuY29udGFpbnMoZSk7Zm9yKDtlOyl7aWYoZT09PXQpcmV0dXJuITA7ZT1lLnBhcmVudE5vZGV9cmV0dXJuITF9LF8uY2xvc2VzdD1mdW5jdGlvbih0LGUpe2Zvcig7aS5kZWZhdWx0LmVsZW1lbnQodCk7KXtpZihPKHQsZSkpcmV0dXJuIHQ7dD1QKHQpfXJldHVybiBudWxsfSxfLnBhcmVudE5vZGU9UCxfLm1hdGNoZXNTZWxlY3Rvcj1PLF8uaW5kZXhPZkRlZXBlc3RFbGVtZW50PWZ1bmN0aW9uKHQpe2Zvcih2YXIgbixyPVtdLG89MDtvPHQubGVuZ3RoO28rKyl7dmFyIGk9dFtvXSxhPXRbbl07aWYoaSYmbyE9PW4paWYoYSl7dmFyIHM9UyhpKSxsPVMoYSk7aWYocyE9PWkub3duZXJEb2N1bWVudClpZihsIT09aS5vd25lckRvY3VtZW50KWlmKHMhPT1sKXtyPXIubGVuZ3RoP3I6RShhKTt2YXIgdT12b2lkIDA7aWYoYSBpbnN0YW5jZW9mIGguZGVmYXVsdC5IVE1MRWxlbWVudCYmaSBpbnN0YW5jZW9mIGguZGVmYXVsdC5TVkdFbGVtZW50JiYhKGkgaW5zdGFuY2VvZiBoLmRlZmF1bHQuU1ZHU1ZHRWxlbWVudCkpe2lmKGk9PT1sKWNvbnRpbnVlO3U9aS5vd25lclNWR0VsZW1lbnR9ZWxzZSB1PWk7Zm9yKHZhciBjPUUodSxhLm93bmVyRG9jdW1lbnQpLGY9MDtjW2ZdJiZjW2ZdPT09cltmXTspZisrO3ZhciBkPVtjW2YtMV0sY1tmXSxyW2ZdXTtpZihkWzBdKWZvcih2YXIgcD1kWzBdLmxhc3RDaGlsZDtwOyl7aWYocD09PWRbMV0pe249byxyPWM7YnJlYWt9aWYocD09PWRbMl0pYnJlYWs7cD1wLnByZXZpb3VzU2libGluZ319ZWxzZSB2PWksZz1hLHZvaWQgMCx2b2lkIDAsKHBhcnNlSW50KGUuZ2V0V2luZG93KHYpLmdldENvbXB1dGVkU3R5bGUodikuekluZGV4LDEwKXx8MCk+PShwYXJzZUludChlLmdldFdpbmRvdyhnKS5nZXRDb21wdXRlZFN0eWxlKGcpLnpJbmRleCwxMCl8fDApJiYobj1vKTtlbHNlIG49b31lbHNlIG49b312YXIgdixnO3JldHVybiBufSxfLm1hdGNoZXNVcFRvPWZ1bmN0aW9uKHQsZSxuKXtmb3IoO2kuZGVmYXVsdC5lbGVtZW50KHQpOyl7aWYoTyh0LGUpKXJldHVybiEwO2lmKCh0PVAodCkpPT09bilyZXR1cm4gTyh0LGUpfXJldHVybiExfSxfLmdldEFjdHVhbEVsZW1lbnQ9ZnVuY3Rpb24odCl7cmV0dXJuIHQuY29ycmVzcG9uZGluZ1VzZUVsZW1lbnR8fHR9LF8uZ2V0U2Nyb2xsWFk9VCxfLmdldEVsZW1lbnRDbGllbnRSZWN0PU0sXy5nZXRFbGVtZW50UmVjdD1mdW5jdGlvbih0KXt2YXIgbj1NKHQpO2lmKCFiLmRlZmF1bHQuaXNJT1M3JiZuKXt2YXIgcj1UKGUuZ2V0V2luZG93KHQpKTtuLmxlZnQrPXIueCxuLnJpZ2h0Kz1yLngsbi50b3ArPXIueSxuLmJvdHRvbSs9ci55fXJldHVybiBufSxfLmdldFBhdGg9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPVtdO3Q7KWUucHVzaCh0KSx0PVAodCk7cmV0dXJuIGV9LF8udHJ5U2VsZWN0b3I9ZnVuY3Rpb24odCl7cmV0dXJuISFpLmRlZmF1bHQuc3RyaW5nKHQpJiYoaC5kZWZhdWx0LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodCksITApfTt2YXIgUz1mdW5jdGlvbih0KXtyZXR1cm4gdC5wYXJlbnROb2RlfHx0Lmhvc3R9O2Z1bmN0aW9uIEUodCxlKXtmb3IodmFyIG4scj1bXSxvPXQ7KG49UyhvKSkmJm8hPT1lJiZuIT09by5vd25lckRvY3VtZW50OylyLnVuc2hpZnQobyksbz1uO3JldHVybiByfWZ1bmN0aW9uIFQodCl7cmV0dXJue3g6KHQ9dHx8ZS53aW5kb3cpLnNjcm9sbFh8fHQuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQseTp0LnNjcm9sbFl8fHQuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcH19ZnVuY3Rpb24gTSh0KXt2YXIgZT10IGluc3RhbmNlb2YgaC5kZWZhdWx0LlNWR0VsZW1lbnQ/dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTp0LmdldENsaWVudFJlY3RzKClbMF07cmV0dXJuIGUmJntsZWZ0OmUubGVmdCxyaWdodDplLnJpZ2h0LHRvcDplLnRvcCxib3R0b206ZS5ib3R0b20sd2lkdGg6ZS53aWR0aHx8ZS5yaWdodC1lLmxlZnQsaGVpZ2h0OmUuaGVpZ2h0fHxlLmJvdHRvbS1lLnRvcH19dmFyIGo9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGosXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksai5kZWZhdWx0PWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuIGluIGUpdFtuXT1lW25dO3JldHVybiB0fTt2YXIgaz17fTtmdW5jdGlvbiBJKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1mdW5jdGlvbiBEKHQsZSxuKXtyZXR1cm5cInBhcmVudFwiPT09dD8oMCxfLnBhcmVudE5vZGUpKG4pOlwic2VsZlwiPT09dD9lLmdldFJlY3Qobik6KDAsXy5jbG9zZXN0KShuLHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShrLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGsuZ2V0U3RyaW5nT3B0aW9uUmVzdWx0PUQsay5yZXNvbHZlUmVjdExpa2U9ZnVuY3Rpb24odCxlLG4scil7dmFyIG8sYT10O3JldHVybiBpLmRlZmF1bHQuc3RyaW5nKGEpP2E9RChhLGUsbik6aS5kZWZhdWx0LmZ1bmMoYSkmJihhPWEuYXBwbHkodm9pZCAwLGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIEkodCl9KG89cil8fGZ1bmN0aW9uKHQpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpcmV0dXJuIEFycmF5LmZyb20odCl9KG8pfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBJKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9JKHQsZSk6dm9pZCAwfX0obyl8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBzcHJlYWQgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCkpKSxpLmRlZmF1bHQuZWxlbWVudChhKSYmKGE9KDAsXy5nZXRFbGVtZW50UmVjdCkoYSkpLGF9LGsucmVjdFRvWFk9ZnVuY3Rpb24odCl7cmV0dXJuIHQmJnt4OlwieFwiaW4gdD90Lng6dC5sZWZ0LHk6XCJ5XCJpbiB0P3QueTp0LnRvcH19LGsueHl3aFRvVGxicj1mdW5jdGlvbih0KXtyZXR1cm4hdHx8XCJsZWZ0XCJpbiB0JiZcInRvcFwiaW4gdHx8KCh0PSgwLGouZGVmYXVsdCkoe30sdCkpLmxlZnQ9dC54fHwwLHQudG9wPXQueXx8MCx0LnJpZ2h0PXQucmlnaHR8fHQubGVmdCt0LndpZHRoLHQuYm90dG9tPXQuYm90dG9tfHx0LnRvcCt0LmhlaWdodCksdH0say50bGJyVG9YeXdoPWZ1bmN0aW9uKHQpe3JldHVybiF0fHxcInhcImluIHQmJlwieVwiaW4gdHx8KCh0PSgwLGouZGVmYXVsdCkoe30sdCkpLng9dC5sZWZ0fHwwLHQueT10LnRvcHx8MCx0LndpZHRoPXQud2lkdGh8fCh0LnJpZ2h0fHwwKS10LngsdC5oZWlnaHQ9dC5oZWlnaHR8fCh0LmJvdHRvbXx8MCktdC55KSx0fSxrLmFkZEVkZ2VzPWZ1bmN0aW9uKHQsZSxuKXt0LmxlZnQmJihlLmxlZnQrPW4ueCksdC5yaWdodCYmKGUucmlnaHQrPW4ueCksdC50b3AmJihlLnRvcCs9bi55KSx0LmJvdHRvbSYmKGUuYm90dG9tKz1uLnkpLGUud2lkdGg9ZS5yaWdodC1lLmxlZnQsZS5oZWlnaHQ9ZS5ib3R0b20tZS50b3B9O3ZhciBBPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShBLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEEuZGVmYXVsdD1mdW5jdGlvbih0LGUsbil7dmFyIHI9dC5vcHRpb25zW25dLG89ciYmci5vcmlnaW58fHQub3B0aW9ucy5vcmlnaW4saT0oMCxrLnJlc29sdmVSZWN0TGlrZSkobyx0LGUsW3QmJmVdKTtyZXR1cm4oMCxrLnJlY3RUb1hZKShpKXx8e3g6MCx5OjB9fTt2YXIgUj17fTtmdW5jdGlvbiB6KHQpe3JldHVybiB0LnRyaW0oKS5zcGxpdCgvICsvKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoUixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxSLmRlZmF1bHQ9ZnVuY3Rpb24gdChlLG4scil7aWYocj1yfHx7fSxpLmRlZmF1bHQuc3RyaW5nKGUpJiYtMSE9PWUuc2VhcmNoKFwiIFwiKSYmKGU9eihlKSksaS5kZWZhdWx0LmFycmF5KGUpKXJldHVybiBlLnJlZHVjZSgoZnVuY3Rpb24oZSxvKXtyZXR1cm4oMCxqLmRlZmF1bHQpKGUsdChvLG4scikpfSkscik7aWYoaS5kZWZhdWx0Lm9iamVjdChlKSYmKG49ZSxlPVwiXCIpLGkuZGVmYXVsdC5mdW5jKG4pKXJbZV09cltlXXx8W10scltlXS5wdXNoKG4pO2Vsc2UgaWYoaS5kZWZhdWx0LmFycmF5KG4pKWZvcih2YXIgbz0wO288bi5sZW5ndGg7bysrKXt2YXIgYTthPW5bb10sdChlLGEscil9ZWxzZSBpZihpLmRlZmF1bHQub2JqZWN0KG4pKWZvcih2YXIgcyBpbiBuKXt2YXIgbD16KHMpLm1hcCgoZnVuY3Rpb24odCl7cmV0dXJuXCJcIi5jb25jYXQoZSkuY29uY2F0KHQpfSkpO3QobCxuW3NdLHIpfXJldHVybiByfTt2YXIgQz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoQyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxDLmRlZmF1bHQ9dm9pZCAwLEMuZGVmYXVsdD1mdW5jdGlvbih0LGUpe3JldHVybiBNYXRoLnNxcnQodCp0K2UqZSl9O3ZhciBGPXt9O2Z1bmN0aW9uIFgodCxlKXtmb3IodmFyIG4gaW4gZSl7dmFyIHI9WC5wcmVmaXhlZFByb3BSRXMsbz0hMTtmb3IodmFyIGkgaW4gcilpZigwPT09bi5pbmRleE9mKGkpJiZyW2ldLnRlc3Qobikpe289ITA7YnJlYWt9b3x8XCJmdW5jdGlvblwiPT10eXBlb2YgZVtuXXx8KHRbbl09ZVtuXSl9cmV0dXJuIHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KEYsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksRi5kZWZhdWx0PXZvaWQgMCxYLnByZWZpeGVkUHJvcFJFcz17d2Via2l0Oi8oTW92ZW1lbnRbWFldfFJhZGl1c1tYWV18Um90YXRpb25BbmdsZXxGb3JjZSkkLyxtb3o6LyhQcmVzc3VyZSkkL307dmFyIFk9WDtGLmRlZmF1bHQ9WTt2YXIgQj17fTtmdW5jdGlvbiBXKHQpe3JldHVybiB0IGluc3RhbmNlb2YgaC5kZWZhdWx0LkV2ZW50fHx0IGluc3RhbmNlb2YgaC5kZWZhdWx0LlRvdWNofWZ1bmN0aW9uIEwodCxlLG4pe3JldHVybiB0PXR8fFwicGFnZVwiLChuPW58fHt9KS54PWVbdCtcIlhcIl0sbi55PWVbdCtcIllcIl0sbn1mdW5jdGlvbiBVKHQsZSl7cmV0dXJuIGU9ZXx8e3g6MCx5OjB9LGIuZGVmYXVsdC5pc09wZXJhTW9iaWxlJiZXKHQpPyhMKFwic2NyZWVuXCIsdCxlKSxlLngrPXdpbmRvdy5zY3JvbGxYLGUueSs9d2luZG93LnNjcm9sbFkpOkwoXCJwYWdlXCIsdCxlKSxlfWZ1bmN0aW9uIFYodCxlKXtyZXR1cm4gZT1lfHx7fSxiLmRlZmF1bHQuaXNPcGVyYU1vYmlsZSYmVyh0KT9MKFwic2NyZWVuXCIsdCxlKTpMKFwiY2xpZW50XCIsdCxlKSxlfWZ1bmN0aW9uIE4odCl7dmFyIGU9W107cmV0dXJuIGkuZGVmYXVsdC5hcnJheSh0KT8oZVswXT10WzBdLGVbMV09dFsxXSk6XCJ0b3VjaGVuZFwiPT09dC50eXBlPzE9PT10LnRvdWNoZXMubGVuZ3RoPyhlWzBdPXQudG91Y2hlc1swXSxlWzFdPXQuY2hhbmdlZFRvdWNoZXNbMF0pOjA9PT10LnRvdWNoZXMubGVuZ3RoJiYoZVswXT10LmNoYW5nZWRUb3VjaGVzWzBdLGVbMV09dC5jaGFuZ2VkVG91Y2hlc1sxXSk6KGVbMF09dC50b3VjaGVzWzBdLGVbMV09dC50b3VjaGVzWzFdKSxlfWZ1bmN0aW9uIHEodCl7Zm9yKHZhciBlPXtwYWdlWDowLHBhZ2VZOjAsY2xpZW50WDowLGNsaWVudFk6MCxzY3JlZW5YOjAsc2NyZWVuWTowfSxuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07Zm9yKHZhciBvIGluIGUpZVtvXSs9cltvXX1mb3IodmFyIGkgaW4gZSllW2ldLz10Lmxlbmd0aDtyZXR1cm4gZX1PYmplY3QuZGVmaW5lUHJvcGVydHkoQixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxCLmNvcHlDb29yZHM9ZnVuY3Rpb24odCxlKXt0LnBhZ2U9dC5wYWdlfHx7fSx0LnBhZ2UueD1lLnBhZ2UueCx0LnBhZ2UueT1lLnBhZ2UueSx0LmNsaWVudD10LmNsaWVudHx8e30sdC5jbGllbnQueD1lLmNsaWVudC54LHQuY2xpZW50Lnk9ZS5jbGllbnQueSx0LnRpbWVTdGFtcD1lLnRpbWVTdGFtcH0sQi5zZXRDb29yZERlbHRhcz1mdW5jdGlvbih0LGUsbil7dC5wYWdlLng9bi5wYWdlLngtZS5wYWdlLngsdC5wYWdlLnk9bi5wYWdlLnktZS5wYWdlLnksdC5jbGllbnQueD1uLmNsaWVudC54LWUuY2xpZW50LngsdC5jbGllbnQueT1uLmNsaWVudC55LWUuY2xpZW50LnksdC50aW1lU3RhbXA9bi50aW1lU3RhbXAtZS50aW1lU3RhbXB9LEIuc2V0Q29vcmRWZWxvY2l0eT1mdW5jdGlvbih0LGUpe3ZhciBuPU1hdGgubWF4KGUudGltZVN0YW1wLzFlMywuMDAxKTt0LnBhZ2UueD1lLnBhZ2UueC9uLHQucGFnZS55PWUucGFnZS55L24sdC5jbGllbnQueD1lLmNsaWVudC54L24sdC5jbGllbnQueT1lLmNsaWVudC55L24sdC50aW1lU3RhbXA9bn0sQi5zZXRaZXJvQ29vcmRzPWZ1bmN0aW9uKHQpe3QucGFnZS54PTAsdC5wYWdlLnk9MCx0LmNsaWVudC54PTAsdC5jbGllbnQueT0wfSxCLmlzTmF0aXZlUG9pbnRlcj1XLEIuZ2V0WFk9TCxCLmdldFBhZ2VYWT1VLEIuZ2V0Q2xpZW50WFk9VixCLmdldFBvaW50ZXJJZD1mdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0Lm51bWJlcih0LnBvaW50ZXJJZCk/dC5wb2ludGVySWQ6dC5pZGVudGlmaWVyfSxCLnNldENvb3Jkcz1mdW5jdGlvbih0LGUsbil7dmFyIHI9ZS5sZW5ndGg+MT9xKGUpOmVbMF07VShyLHQucGFnZSksVihyLHQuY2xpZW50KSx0LnRpbWVTdGFtcD1ufSxCLmdldFRvdWNoUGFpcj1OLEIucG9pbnRlckF2ZXJhZ2U9cSxCLnRvdWNoQkJveD1mdW5jdGlvbih0KXtpZighdC5sZW5ndGgpcmV0dXJuIG51bGw7dmFyIGU9Tih0KSxuPU1hdGgubWluKGVbMF0ucGFnZVgsZVsxXS5wYWdlWCkscj1NYXRoLm1pbihlWzBdLnBhZ2VZLGVbMV0ucGFnZVkpLG89TWF0aC5tYXgoZVswXS5wYWdlWCxlWzFdLnBhZ2VYKSxpPU1hdGgubWF4KGVbMF0ucGFnZVksZVsxXS5wYWdlWSk7cmV0dXJue3g6bix5OnIsbGVmdDpuLHRvcDpyLHJpZ2h0Om8sYm90dG9tOmksd2lkdGg6by1uLGhlaWdodDppLXJ9fSxCLnRvdWNoRGlzdGFuY2U9ZnVuY3Rpb24odCxlKXt2YXIgbj1lK1wiWFwiLHI9ZStcIllcIixvPU4odCksaT1vWzBdW25dLW9bMV1bbl0sYT1vWzBdW3JdLW9bMV1bcl07cmV0dXJuKDAsQy5kZWZhdWx0KShpLGEpfSxCLnRvdWNoQW5nbGU9ZnVuY3Rpb24odCxlKXt2YXIgbj1lK1wiWFwiLHI9ZStcIllcIixvPU4odCksaT1vWzFdW25dLW9bMF1bbl0sYT1vWzFdW3JdLW9bMF1bcl07cmV0dXJuIDE4MCpNYXRoLmF0YW4yKGEsaSkvTWF0aC5QSX0sQi5nZXRQb2ludGVyVHlwZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0LnN0cmluZyh0LnBvaW50ZXJUeXBlKT90LnBvaW50ZXJUeXBlOmkuZGVmYXVsdC5udW1iZXIodC5wb2ludGVyVHlwZSk/W3ZvaWQgMCx2b2lkIDAsXCJ0b3VjaFwiLFwicGVuXCIsXCJtb3VzZVwiXVt0LnBvaW50ZXJUeXBlXTovdG91Y2gvLnRlc3QodC50eXBlfHxcIlwiKXx8dCBpbnN0YW5jZW9mIGguZGVmYXVsdC5Ub3VjaD9cInRvdWNoXCI6XCJtb3VzZVwifSxCLmdldEV2ZW50VGFyZ2V0cz1mdW5jdGlvbih0KXt2YXIgZT1pLmRlZmF1bHQuZnVuYyh0LmNvbXBvc2VkUGF0aCk/dC5jb21wb3NlZFBhdGgoKTp0LnBhdGg7cmV0dXJuW18uZ2V0QWN0dWFsRWxlbWVudChlP2VbMF06dC50YXJnZXQpLF8uZ2V0QWN0dWFsRWxlbWVudCh0LmN1cnJlbnRUYXJnZXQpXX0sQi5uZXdDb29yZHM9ZnVuY3Rpb24oKXtyZXR1cm57cGFnZTp7eDowLHk6MH0sY2xpZW50Ont4OjAseTowfSx0aW1lU3RhbXA6MH19LEIuY29vcmRzVG9FdmVudD1mdW5jdGlvbih0KXtyZXR1cm57Y29vcmRzOnQsZ2V0IHBhZ2UoKXtyZXR1cm4gdGhpcy5jb29yZHMucGFnZX0sZ2V0IGNsaWVudCgpe3JldHVybiB0aGlzLmNvb3Jkcy5jbGllbnR9LGdldCB0aW1lU3RhbXAoKXtyZXR1cm4gdGhpcy5jb29yZHMudGltZVN0YW1wfSxnZXQgcGFnZVgoKXtyZXR1cm4gdGhpcy5jb29yZHMucGFnZS54fSxnZXQgcGFnZVkoKXtyZXR1cm4gdGhpcy5jb29yZHMucGFnZS55fSxnZXQgY2xpZW50WCgpe3JldHVybiB0aGlzLmNvb3Jkcy5jbGllbnQueH0sZ2V0IGNsaWVudFkoKXtyZXR1cm4gdGhpcy5jb29yZHMuY2xpZW50Lnl9LGdldCBwb2ludGVySWQoKXtyZXR1cm4gdGhpcy5jb29yZHMucG9pbnRlcklkfSxnZXQgdGFyZ2V0KCl7cmV0dXJuIHRoaXMuY29vcmRzLnRhcmdldH0sZ2V0IHR5cGUoKXtyZXR1cm4gdGhpcy5jb29yZHMudHlwZX0sZ2V0IHBvaW50ZXJUeXBlKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBvaW50ZXJUeXBlfSxnZXQgYnV0dG9ucygpe3JldHVybiB0aGlzLmNvb3Jkcy5idXR0b25zfSxwcmV2ZW50RGVmYXVsdDpmdW5jdGlvbigpe319fSxPYmplY3QuZGVmaW5lUHJvcGVydHkoQixcInBvaW50ZXJFeHRlbmRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gRi5kZWZhdWx0fX0pO3ZhciAkPXt9O2Z1bmN0aW9uIEcodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIEgodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLCQuQmFzZUV2ZW50PXZvaWQgMDt2YXIgSz1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxIKHRoaXMsXCJ0eXBlXCIsdm9pZCAwKSxIKHRoaXMsXCJ0YXJnZXRcIix2b2lkIDApLEgodGhpcyxcImN1cnJlbnRUYXJnZXRcIix2b2lkIDApLEgodGhpcyxcImludGVyYWN0YWJsZVwiLHZvaWQgMCksSCh0aGlzLFwiX2ludGVyYWN0aW9uXCIsdm9pZCAwKSxIKHRoaXMsXCJ0aW1lU3RhbXBcIix2b2lkIDApLEgodGhpcyxcImltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKSxIKHRoaXMsXCJwcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksdGhpcy5faW50ZXJhY3Rpb249ZX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJwcmV2ZW50RGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInN0b3BQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fSx7a2V5Olwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZD10aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19XSkmJkcoZS5wcm90b3R5cGUsbiksdH0oKTskLkJhc2VFdmVudD1LLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShLLnByb3RvdHlwZSxcImludGVyYWN0aW9uXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pbnRlcmFjdGlvbi5fcHJveHl9LHNldDpmdW5jdGlvbigpe319KTt2YXIgWj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoWixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxaLmZpbmQ9Wi5maW5kSW5kZXg9Wi5mcm9tPVoubWVyZ2U9Wi5yZW1vdmU9Wi5jb250YWlucz12b2lkIDAsWi5jb250YWlucz1mdW5jdGlvbih0LGUpe3JldHVybi0xIT09dC5pbmRleE9mKGUpfSxaLnJlbW92ZT1mdW5jdGlvbih0LGUpe3JldHVybiB0LnNwbGljZSh0LmluZGV4T2YoZSksMSl9O3ZhciBKPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07dC5wdXNoKHIpfXJldHVybiB0fTtaLm1lcmdlPUosWi5mcm9tPWZ1bmN0aW9uKHQpe3JldHVybiBKKFtdLHQpfTt2YXIgUT1mdW5jdGlvbih0LGUpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKWlmKGUodFtuXSxuLHQpKXJldHVybiBuO3JldHVybi0xfTtaLmZpbmRJbmRleD1RLFouZmluZD1mdW5jdGlvbih0LGUpe3JldHVybiB0W1EodCxlKV19O3ZhciB0dD17fTtmdW5jdGlvbiBldCh0KXtyZXR1cm4oZXQ9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIG50KHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBydCh0LGUpe3JldHVybihydD1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gb3QodCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PWV0KGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP2l0KHQpOmV9ZnVuY3Rpb24gaXQodCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9ZnVuY3Rpb24gYXQodCl7cmV0dXJuKGF0PU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1mdW5jdGlvbiBzdCh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHR0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHR0LkRyb3BFdmVudD12b2lkIDA7dmFyIGx0PWZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmcnQodCxlKX0oYSx0KTt2YXIgZSxuLHIsbyxpPShyPWEsbz1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBSZWZsZWN0fHwhUmVmbGVjdC5jb25zdHJ1Y3QpcmV0dXJuITE7aWYoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSlyZXR1cm4hMTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm94eSlyZXR1cm4hMDt0cnl7cmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLFtdLChmdW5jdGlvbigpe30pKSksITB9Y2F0Y2godCl7cmV0dXJuITF9fSgpLGZ1bmN0aW9uKCl7dmFyIHQsZT1hdChyKTtpZihvKXt2YXIgbj1hdCh0aGlzKS5jb25zdHJ1Y3Rvcjt0PVJlZmxlY3QuY29uc3RydWN0KGUsYXJndW1lbnRzLG4pfWVsc2UgdD1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gb3QodGhpcyx0KX0pO2Z1bmN0aW9uIGEodCxlLG4pe3ZhciByOyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsYSksc3QoaXQocj1pLmNhbGwodGhpcyxlLl9pbnRlcmFjdGlvbikpLFwidGFyZ2V0XCIsdm9pZCAwKSxzdChpdChyKSxcImRyb3B6b25lXCIsdm9pZCAwKSxzdChpdChyKSxcImRyYWdFdmVudFwiLHZvaWQgMCksc3QoaXQociksXCJyZWxhdGVkVGFyZ2V0XCIsdm9pZCAwKSxzdChpdChyKSxcImRyYWdnYWJsZVwiLHZvaWQgMCksc3QoaXQociksXCJ0aW1lU3RhbXBcIix2b2lkIDApLHN0KGl0KHIpLFwicHJvcGFnYXRpb25TdG9wcGVkXCIsITEpLHN0KGl0KHIpLFwiaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkXCIsITEpO3ZhciBvPVwiZHJhZ2xlYXZlXCI9PT1uP3QucHJldjp0LmN1cixzPW8uZWxlbWVudCxsPW8uZHJvcHpvbmU7cmV0dXJuIHIudHlwZT1uLHIudGFyZ2V0PXMsci5jdXJyZW50VGFyZ2V0PXMsci5kcm9wem9uZT1sLHIuZHJhZ0V2ZW50PWUsci5yZWxhdGVkVGFyZ2V0PWUudGFyZ2V0LHIuZHJhZ2dhYmxlPWUuaW50ZXJhY3RhYmxlLHIudGltZVN0YW1wPWUudGltZVN0YW1wLHJ9cmV0dXJuIGU9YSwobj1be2tleTpcInJlamVjdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxlPXRoaXMuX2ludGVyYWN0aW9uLmRyb3BTdGF0ZTtpZihcImRyb3BhY3RpdmF0ZVwiPT09dGhpcy50eXBlfHx0aGlzLmRyb3B6b25lJiZlLmN1ci5kcm9wem9uZT09PXRoaXMuZHJvcHpvbmUmJmUuY3VyLmVsZW1lbnQ9PT10aGlzLnRhcmdldClpZihlLnByZXYuZHJvcHpvbmU9dGhpcy5kcm9wem9uZSxlLnByZXYuZWxlbWVudD10aGlzLnRhcmdldCxlLnJlamVjdGVkPSEwLGUuZXZlbnRzLmVudGVyPW51bGwsdGhpcy5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSxcImRyb3BhY3RpdmF0ZVwiPT09dGhpcy50eXBlKXt2YXIgbj1lLmFjdGl2ZURyb3BzLHI9Wi5maW5kSW5kZXgobiwoZnVuY3Rpb24oZSl7dmFyIG49ZS5kcm9wem9uZSxyPWUuZWxlbWVudDtyZXR1cm4gbj09PXQuZHJvcHpvbmUmJnI9PT10LnRhcmdldH0pKTtlLmFjdGl2ZURyb3BzLnNwbGljZShyLDEpO3ZhciBvPW5ldyBhKGUsdGhpcy5kcmFnRXZlbnQsXCJkcm9wZGVhY3RpdmF0ZVwiKTtvLmRyb3B6b25lPXRoaXMuZHJvcHpvbmUsby50YXJnZXQ9dGhpcy50YXJnZXQsdGhpcy5kcm9wem9uZS5maXJlKG8pfWVsc2UgdGhpcy5kcm9wem9uZS5maXJlKG5ldyBhKGUsdGhpcy5kcmFnRXZlbnQsXCJkcmFnbGVhdmVcIikpfX0se2tleTpcInByZXZlbnREZWZhdWx0XCIsdmFsdWU6ZnVuY3Rpb24oKXt9fSx7a2V5Olwic3RvcFByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19LHtrZXk6XCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkPXRoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX1dKSYmbnQoZS5wcm90b3R5cGUsbiksYX0oJC5CYXNlRXZlbnQpO3R0LkRyb3BFdmVudD1sdDt2YXIgdXQ9e307ZnVuY3Rpb24gY3QodCxlKXtmb3IodmFyIG49MDtuPHQuc2xpY2UoKS5sZW5ndGg7bisrKXt2YXIgcj10LnNsaWNlKClbbl0sbz1yLmRyb3B6b25lLGk9ci5lbGVtZW50O2UuZHJvcHpvbmU9byxlLnRhcmdldD1pLG8uZmlyZShlKSxlLnByb3BhZ2F0aW9uU3RvcHBlZD1lLmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZD0hMX19ZnVuY3Rpb24gZnQodCxlKXtmb3IodmFyIG49ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49dC5pbnRlcmFjdGFibGVzLHI9W10sbz0wO288bi5saXN0Lmxlbmd0aDtvKyspe3ZhciBhPW4ubGlzdFtvXTtpZihhLm9wdGlvbnMuZHJvcC5lbmFibGVkKXt2YXIgcz1hLm9wdGlvbnMuZHJvcC5hY2NlcHQ7aWYoIShpLmRlZmF1bHQuZWxlbWVudChzKSYmcyE9PWV8fGkuZGVmYXVsdC5zdHJpbmcocykmJiFfLm1hdGNoZXNTZWxlY3RvcihlLHMpfHxpLmRlZmF1bHQuZnVuYyhzKSYmIXMoe2Ryb3B6b25lOmEsZHJhZ2dhYmxlRWxlbWVudDplfSkpKWZvcih2YXIgbD1pLmRlZmF1bHQuc3RyaW5nKGEudGFyZ2V0KT9hLl9jb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoYS50YXJnZXQpOmkuZGVmYXVsdC5hcnJheShhLnRhcmdldCk/YS50YXJnZXQ6W2EudGFyZ2V0XSx1PTA7dTxsLmxlbmd0aDt1Kyspe3ZhciBjPWxbdV07YyE9PWUmJnIucHVzaCh7ZHJvcHpvbmU6YSxlbGVtZW50OmMscmVjdDphLmdldFJlY3QoYyl9KX19fXJldHVybiByfSh0LGUpLHI9MDtyPG4ubGVuZ3RoO3IrKyl7dmFyIG89bltyXTtvLnJlY3Q9by5kcm9wem9uZS5nZXRSZWN0KG8uZWxlbWVudCl9cmV0dXJuIG59ZnVuY3Rpb24gZHQodCxlLG4pe2Zvcih2YXIgcj10LmRyb3BTdGF0ZSxvPXQuaW50ZXJhY3RhYmxlLGk9dC5lbGVtZW50LGE9W10scz0wO3M8ci5hY3RpdmVEcm9wcy5sZW5ndGg7cysrKXt2YXIgbD1yLmFjdGl2ZURyb3BzW3NdLHU9bC5kcm9wem9uZSxjPWwuZWxlbWVudCxmPWwucmVjdDthLnB1c2godS5kcm9wQ2hlY2soZSxuLG8saSxjLGYpP2M6bnVsbCl9dmFyIGQ9Xy5pbmRleE9mRGVlcGVzdEVsZW1lbnQoYSk7cmV0dXJuIHIuYWN0aXZlRHJvcHNbZF18fG51bGx9ZnVuY3Rpb24gcHQodCxlLG4pe3ZhciByPXQuZHJvcFN0YXRlLG89e2VudGVyOm51bGwsbGVhdmU6bnVsbCxhY3RpdmF0ZTpudWxsLGRlYWN0aXZhdGU6bnVsbCxtb3ZlOm51bGwsZHJvcDpudWxsfTtyZXR1cm5cImRyYWdzdGFydFwiPT09bi50eXBlJiYoby5hY3RpdmF0ZT1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyb3BhY3RpdmF0ZVwiKSxvLmFjdGl2YXRlLnRhcmdldD1udWxsLG8uYWN0aXZhdGUuZHJvcHpvbmU9bnVsbCksXCJkcmFnZW5kXCI9PT1uLnR5cGUmJihvLmRlYWN0aXZhdGU9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcm9wZGVhY3RpdmF0ZVwiKSxvLmRlYWN0aXZhdGUudGFyZ2V0PW51bGwsby5kZWFjdGl2YXRlLmRyb3B6b25lPW51bGwpLHIucmVqZWN0ZWR8fChyLmN1ci5lbGVtZW50IT09ci5wcmV2LmVsZW1lbnQmJihyLnByZXYuZHJvcHpvbmUmJihvLmxlYXZlPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJhZ2xlYXZlXCIpLG4uZHJhZ0xlYXZlPW8ubGVhdmUudGFyZ2V0PXIucHJldi5lbGVtZW50LG4ucHJldkRyb3B6b25lPW8ubGVhdmUuZHJvcHpvbmU9ci5wcmV2LmRyb3B6b25lKSxyLmN1ci5kcm9wem9uZSYmKG8uZW50ZXI9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcmFnZW50ZXJcIiksbi5kcmFnRW50ZXI9ci5jdXIuZWxlbWVudCxuLmRyb3B6b25lPXIuY3VyLmRyb3B6b25lKSksXCJkcmFnZW5kXCI9PT1uLnR5cGUmJnIuY3VyLmRyb3B6b25lJiYoby5kcm9wPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJvcFwiKSxuLmRyb3B6b25lPXIuY3VyLmRyb3B6b25lLG4ucmVsYXRlZFRhcmdldD1yLmN1ci5lbGVtZW50KSxcImRyYWdtb3ZlXCI9PT1uLnR5cGUmJnIuY3VyLmRyb3B6b25lJiYoby5tb3ZlPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJvcG1vdmVcIiksby5tb3ZlLmRyYWdtb3ZlPW4sbi5kcm9wem9uZT1yLmN1ci5kcm9wem9uZSkpLG99ZnVuY3Rpb24gdnQodCxlKXt2YXIgbj10LmRyb3BTdGF0ZSxyPW4uYWN0aXZlRHJvcHMsbz1uLmN1cixpPW4ucHJldjtlLmxlYXZlJiZpLmRyb3B6b25lLmZpcmUoZS5sZWF2ZSksZS5lbnRlciYmby5kcm9wem9uZS5maXJlKGUuZW50ZXIpLGUubW92ZSYmby5kcm9wem9uZS5maXJlKGUubW92ZSksZS5kcm9wJiZvLmRyb3B6b25lLmZpcmUoZS5kcm9wKSxlLmRlYWN0aXZhdGUmJmN0KHIsZS5kZWFjdGl2YXRlKSxuLnByZXYuZHJvcHpvbmU9by5kcm9wem9uZSxuLnByZXYuZWxlbWVudD1vLmVsZW1lbnR9ZnVuY3Rpb24gaHQodCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5pRXZlbnQsbz10LmV2ZW50O2lmKFwiZHJhZ21vdmVcIj09PXIudHlwZXx8XCJkcmFnZW5kXCI9PT1yLnR5cGUpe3ZhciBpPW4uZHJvcFN0YXRlO2UuZHluYW1pY0Ryb3AmJihpLmFjdGl2ZURyb3BzPWZ0KGUsbi5lbGVtZW50KSk7dmFyIGE9cixzPWR0KG4sYSxvKTtpLnJlamVjdGVkPWkucmVqZWN0ZWQmJiEhcyYmcy5kcm9wem9uZT09PWkuY3VyLmRyb3B6b25lJiZzLmVsZW1lbnQ9PT1pLmN1ci5lbGVtZW50LGkuY3VyLmRyb3B6b25lPXMmJnMuZHJvcHpvbmUsaS5jdXIuZWxlbWVudD1zJiZzLmVsZW1lbnQsaS5ldmVudHM9cHQobiwwLGEpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodXQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdXQuZGVmYXVsdD12b2lkIDA7dmFyIGd0PXtpZDpcImFjdGlvbnMvZHJvcFwiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5hY3Rpb25zLG49dC5pbnRlcmFjdFN0YXRpYyxyPXQuSW50ZXJhY3RhYmxlLG89dC5kZWZhdWx0czt0LnVzZVBsdWdpbihjLmRlZmF1bHQpLHIucHJvdG90eXBlLmRyb3B6b25lPWZ1bmN0aW9uKHQpe3JldHVybiBmdW5jdGlvbih0LGUpe2lmKGkuZGVmYXVsdC5vYmplY3QoZSkpe2lmKHQub3B0aW9ucy5kcm9wLmVuYWJsZWQ9ITEhPT1lLmVuYWJsZWQsZS5saXN0ZW5lcnMpe3ZhciBuPSgwLFIuZGVmYXVsdCkoZS5saXN0ZW5lcnMpLHI9T2JqZWN0LmtleXMobikucmVkdWNlKChmdW5jdGlvbih0LGUpe3JldHVybiB0Wy9eKGVudGVyfGxlYXZlKS8udGVzdChlKT9cImRyYWdcIi5jb25jYXQoZSk6L14oYWN0aXZhdGV8ZGVhY3RpdmF0ZXxtb3ZlKS8udGVzdChlKT9cImRyb3BcIi5jb25jYXQoZSk6ZV09bltlXSx0fSkse30pO3Qub2ZmKHQub3B0aW9ucy5kcm9wLmxpc3RlbmVycyksdC5vbihyKSx0Lm9wdGlvbnMuZHJvcC5saXN0ZW5lcnM9cn1yZXR1cm4gaS5kZWZhdWx0LmZ1bmMoZS5vbmRyb3ApJiZ0Lm9uKFwiZHJvcFwiLGUub25kcm9wKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJvcGFjdGl2YXRlKSYmdC5vbihcImRyb3BhY3RpdmF0ZVwiLGUub25kcm9wYWN0aXZhdGUpLGkuZGVmYXVsdC5mdW5jKGUub25kcm9wZGVhY3RpdmF0ZSkmJnQub24oXCJkcm9wZGVhY3RpdmF0ZVwiLGUub25kcm9wZGVhY3RpdmF0ZSksaS5kZWZhdWx0LmZ1bmMoZS5vbmRyYWdlbnRlcikmJnQub24oXCJkcmFnZW50ZXJcIixlLm9uZHJhZ2VudGVyKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJhZ2xlYXZlKSYmdC5vbihcImRyYWdsZWF2ZVwiLGUub25kcmFnbGVhdmUpLGkuZGVmYXVsdC5mdW5jKGUub25kcm9wbW92ZSkmJnQub24oXCJkcm9wbW92ZVwiLGUub25kcm9wbW92ZSksL14ocG9pbnRlcnxjZW50ZXIpJC8udGVzdChlLm92ZXJsYXApP3Qub3B0aW9ucy5kcm9wLm92ZXJsYXA9ZS5vdmVybGFwOmkuZGVmYXVsdC5udW1iZXIoZS5vdmVybGFwKSYmKHQub3B0aW9ucy5kcm9wLm92ZXJsYXA9TWF0aC5tYXgoTWF0aC5taW4oMSxlLm92ZXJsYXApLDApKSxcImFjY2VwdFwiaW4gZSYmKHQub3B0aW9ucy5kcm9wLmFjY2VwdD1lLmFjY2VwdCksXCJjaGVja2VyXCJpbiBlJiYodC5vcHRpb25zLmRyb3AuY2hlY2tlcj1lLmNoZWNrZXIpLHR9cmV0dXJuIGkuZGVmYXVsdC5ib29sKGUpPyh0Lm9wdGlvbnMuZHJvcC5lbmFibGVkPWUsdCk6dC5vcHRpb25zLmRyb3B9KHRoaXMsdCl9LHIucHJvdG90eXBlLmRyb3BDaGVjaz1mdW5jdGlvbih0LGUsbixyLG8sYSl7cmV0dXJuIGZ1bmN0aW9uKHQsZSxuLHIsbyxhLHMpe3ZhciBsPSExO2lmKCEocz1zfHx0LmdldFJlY3QoYSkpKXJldHVybiEhdC5vcHRpb25zLmRyb3AuY2hlY2tlciYmdC5vcHRpb25zLmRyb3AuY2hlY2tlcihlLG4sbCx0LGEscixvKTt2YXIgdT10Lm9wdGlvbnMuZHJvcC5vdmVybGFwO2lmKFwicG9pbnRlclwiPT09dSl7dmFyIGM9KDAsQS5kZWZhdWx0KShyLG8sXCJkcmFnXCIpLGY9Qi5nZXRQYWdlWFkoZSk7Zi54Kz1jLngsZi55Kz1jLnk7dmFyIGQ9Zi54PnMubGVmdCYmZi54PHMucmlnaHQscD1mLnk+cy50b3AmJmYueTxzLmJvdHRvbTtsPWQmJnB9dmFyIHY9ci5nZXRSZWN0KG8pO2lmKHYmJlwiY2VudGVyXCI9PT11KXt2YXIgaD12LmxlZnQrdi53aWR0aC8yLGc9di50b3Ardi5oZWlnaHQvMjtsPWg+PXMubGVmdCYmaDw9cy5yaWdodCYmZz49cy50b3AmJmc8PXMuYm90dG9tfXJldHVybiB2JiZpLmRlZmF1bHQubnVtYmVyKHUpJiYobD1NYXRoLm1heCgwLE1hdGgubWluKHMucmlnaHQsdi5yaWdodCktTWF0aC5tYXgocy5sZWZ0LHYubGVmdCkpKk1hdGgubWF4KDAsTWF0aC5taW4ocy5ib3R0b20sdi5ib3R0b20pLU1hdGgubWF4KHMudG9wLHYudG9wKSkvKHYud2lkdGgqdi5oZWlnaHQpPj11KSx0Lm9wdGlvbnMuZHJvcC5jaGVja2VyJiYobD10Lm9wdGlvbnMuZHJvcC5jaGVja2VyKGUsbixsLHQsYSxyLG8pKSxsfSh0aGlzLHQsZSxuLHIsbyxhKX0sbi5keW5hbWljRHJvcD1mdW5jdGlvbihlKXtyZXR1cm4gaS5kZWZhdWx0LmJvb2woZSk/KHQuZHluYW1pY0Ryb3A9ZSxuKTp0LmR5bmFtaWNEcm9wfSwoMCxqLmRlZmF1bHQpKGUucGhhc2VsZXNzVHlwZXMse2RyYWdlbnRlcjohMCxkcmFnbGVhdmU6ITAsZHJvcGFjdGl2YXRlOiEwLGRyb3BkZWFjdGl2YXRlOiEwLGRyb3Btb3ZlOiEwLGRyb3A6ITB9KSxlLm1ldGhvZERpY3QuZHJvcD1cImRyb3B6b25lXCIsdC5keW5hbWljRHJvcD0hMSxvLmFjdGlvbnMuZHJvcD1ndC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLXN0YXJ0XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtcImRyYWdcIj09PWUucHJlcGFyZWQubmFtZSYmKGUuZHJvcFN0YXRlPXtjdXI6e2Ryb3B6b25lOm51bGwsZWxlbWVudDpudWxsfSxwcmV2Ontkcm9wem9uZTpudWxsLGVsZW1lbnQ6bnVsbH0scmVqZWN0ZWQ6bnVsbCxldmVudHM6bnVsbCxhY3RpdmVEcm9wczpbXX0pfSxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj0odC5ldmVudCx0LmlFdmVudCk7aWYoXCJkcmFnXCI9PT1uLnByZXBhcmVkLm5hbWUpe3ZhciBvPW4uZHJvcFN0YXRlO28uYWN0aXZlRHJvcHM9bnVsbCxvLmV2ZW50cz1udWxsLG8uYWN0aXZlRHJvcHM9ZnQoZSxuLmVsZW1lbnQpLG8uZXZlbnRzPXB0KG4sMCxyKSxvLmV2ZW50cy5hY3RpdmF0ZSYmKGN0KG8uYWN0aXZlRHJvcHMsby5ldmVudHMuYWN0aXZhdGUpLGUuZmlyZShcImFjdGlvbnMvZHJvcDpzdGFydFwiLHtpbnRlcmFjdGlvbjpuLGRyYWdFdmVudDpyfSkpfX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpodCxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQuaUV2ZW50O1wiZHJhZ1wiPT09bi5wcmVwYXJlZC5uYW1lJiYodnQobixuLmRyb3BTdGF0ZS5ldmVudHMpLGUuZmlyZShcImFjdGlvbnMvZHJvcDptb3ZlXCIse2ludGVyYWN0aW9uOm4sZHJhZ0V2ZW50OnJ9KSxuLmRyb3BTdGF0ZS5ldmVudHM9e30pfSxcImludGVyYWN0aW9uczphY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCxlKXtpZihcImRyYWdcIj09PXQuaW50ZXJhY3Rpb24ucHJlcGFyZWQubmFtZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQuaUV2ZW50O2h0KHQsZSksdnQobixuLmRyb3BTdGF0ZS5ldmVudHMpLGUuZmlyZShcImFjdGlvbnMvZHJvcDplbmRcIix7aW50ZXJhY3Rpb246bixkcmFnRXZlbnQ6cn0pfX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247aWYoXCJkcmFnXCI9PT1lLnByZXBhcmVkLm5hbWUpe3ZhciBuPWUuZHJvcFN0YXRlO24mJihuLmFjdGl2ZURyb3BzPW51bGwsbi5ldmVudHM9bnVsbCxuLmN1ci5kcm9wem9uZT1udWxsLG4uY3VyLmVsZW1lbnQ9bnVsbCxuLnByZXYuZHJvcHpvbmU9bnVsbCxuLnByZXYuZWxlbWVudD1udWxsLG4ucmVqZWN0ZWQ9ITEpfX19LGdldEFjdGl2ZURyb3BzOmZ0LGdldERyb3A6ZHQsZ2V0RHJvcEV2ZW50czpwdCxmaXJlRHJvcEV2ZW50czp2dCxkZWZhdWx0czp7ZW5hYmxlZDohMSxhY2NlcHQ6bnVsbCxvdmVybGFwOlwicG9pbnRlclwifX0seXQ9Z3Q7dXQuZGVmYXVsdD15dDt2YXIgbXQ9e307ZnVuY3Rpb24gYnQodCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuaUV2ZW50LHI9dC5waGFzZTtpZihcImdlc3R1cmVcIj09PWUucHJlcGFyZWQubmFtZSl7dmFyIG89ZS5wb2ludGVycy5tYXAoKGZ1bmN0aW9uKHQpe3JldHVybiB0LnBvaW50ZXJ9KSksYT1cInN0YXJ0XCI9PT1yLHM9XCJlbmRcIj09PXIsbD1lLmludGVyYWN0YWJsZS5vcHRpb25zLmRlbHRhU291cmNlO2lmKG4udG91Y2hlcz1bb1swXSxvWzFdXSxhKW4uZGlzdGFuY2U9Qi50b3VjaERpc3RhbmNlKG8sbCksbi5ib3g9Qi50b3VjaEJCb3gobyksbi5zY2FsZT0xLG4uZHM9MCxuLmFuZ2xlPUIudG91Y2hBbmdsZShvLGwpLG4uZGE9MCxlLmdlc3R1cmUuc3RhcnREaXN0YW5jZT1uLmRpc3RhbmNlLGUuZ2VzdHVyZS5zdGFydEFuZ2xlPW4uYW5nbGU7ZWxzZSBpZihzKXt2YXIgdT1lLnByZXZFdmVudDtuLmRpc3RhbmNlPXUuZGlzdGFuY2Usbi5ib3g9dS5ib3gsbi5zY2FsZT11LnNjYWxlLG4uZHM9MCxuLmFuZ2xlPXUuYW5nbGUsbi5kYT0wfWVsc2Ugbi5kaXN0YW5jZT1CLnRvdWNoRGlzdGFuY2UobyxsKSxuLmJveD1CLnRvdWNoQkJveChvKSxuLnNjYWxlPW4uZGlzdGFuY2UvZS5nZXN0dXJlLnN0YXJ0RGlzdGFuY2Usbi5hbmdsZT1CLnRvdWNoQW5nbGUobyxsKSxuLmRzPW4uc2NhbGUtZS5nZXN0dXJlLnNjYWxlLG4uZGE9bi5hbmdsZS1lLmdlc3R1cmUuYW5nbGU7ZS5nZXN0dXJlLmRpc3RhbmNlPW4uZGlzdGFuY2UsZS5nZXN0dXJlLmFuZ2xlPW4uYW5nbGUsaS5kZWZhdWx0Lm51bWJlcihuLnNjYWxlKSYmbi5zY2FsZSE9PTEvMCYmIWlzTmFOKG4uc2NhbGUpJiYoZS5nZXN0dXJlLnNjYWxlPW4uc2NhbGUpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkobXQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksbXQuZGVmYXVsdD12b2lkIDA7dmFyIHh0PXtpZDpcImFjdGlvbnMvZ2VzdHVyZVwiLGJlZm9yZTpbXCJhY3Rpb25zL2RyYWdcIixcImFjdGlvbnMvcmVzaXplXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5hY3Rpb25zLG49dC5JbnRlcmFjdGFibGUscj10LmRlZmF1bHRzO24ucHJvdG90eXBlLmdlc3R1cmFibGU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5vYmplY3QodCk/KHRoaXMub3B0aW9ucy5nZXN0dXJlLmVuYWJsZWQ9ITEhPT10LmVuYWJsZWQsdGhpcy5zZXRQZXJBY3Rpb24oXCJnZXN0dXJlXCIsdCksdGhpcy5zZXRPbkV2ZW50cyhcImdlc3R1cmVcIix0KSx0aGlzKTppLmRlZmF1bHQuYm9vbCh0KT8odGhpcy5vcHRpb25zLmdlc3R1cmUuZW5hYmxlZD10LHRoaXMpOnRoaXMub3B0aW9ucy5nZXN0dXJlfSxlLm1hcC5nZXN0dXJlPXh0LGUubWV0aG9kRGljdC5nZXN0dXJlPVwiZ2VzdHVyYWJsZVwiLHIuYWN0aW9ucy5nZXN0dXJlPXh0LmRlZmF1bHRzfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOmFjdGlvbi1zdGFydFwiOmJ0LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6YnQsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLWVuZFwiOmJ0LFwiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24uZ2VzdHVyZT17YW5nbGU6MCxkaXN0YW5jZTowLHNjYWxlOjEsc3RhcnRBbmdsZTowLHN0YXJ0RGlzdGFuY2U6MH19LFwiYXV0by1zdGFydDpjaGVja1wiOmZ1bmN0aW9uKHQpe2lmKCEodC5pbnRlcmFjdGlvbi5wb2ludGVycy5sZW5ndGg8Mikpe3ZhciBlPXQuaW50ZXJhY3RhYmxlLm9wdGlvbnMuZ2VzdHVyZTtpZihlJiZlLmVuYWJsZWQpcmV0dXJuIHQuYWN0aW9uPXtuYW1lOlwiZ2VzdHVyZVwifSwhMX19fSxkZWZhdWx0czp7fSxnZXRDdXJzb3I6ZnVuY3Rpb24oKXtyZXR1cm5cIlwifX0sd3Q9eHQ7bXQuZGVmYXVsdD13dDt2YXIgX3Q9e307ZnVuY3Rpb24gUHQodCxlLG4scixvLGEscyl7aWYoIWUpcmV0dXJuITE7aWYoITA9PT1lKXt2YXIgbD1pLmRlZmF1bHQubnVtYmVyKGEud2lkdGgpP2Eud2lkdGg6YS5yaWdodC1hLmxlZnQsdT1pLmRlZmF1bHQubnVtYmVyKGEuaGVpZ2h0KT9hLmhlaWdodDphLmJvdHRvbS1hLnRvcDtpZihzPU1hdGgubWluKHMsTWF0aC5hYnMoKFwibGVmdFwiPT09dHx8XCJyaWdodFwiPT09dD9sOnUpLzIpKSxsPDAmJihcImxlZnRcIj09PXQ/dD1cInJpZ2h0XCI6XCJyaWdodFwiPT09dCYmKHQ9XCJsZWZ0XCIpKSx1PDAmJihcInRvcFwiPT09dD90PVwiYm90dG9tXCI6XCJib3R0b21cIj09PXQmJih0PVwidG9wXCIpKSxcImxlZnRcIj09PXQpcmV0dXJuIG4ueDwobD49MD9hLmxlZnQ6YS5yaWdodCkrcztpZihcInRvcFwiPT09dClyZXR1cm4gbi55PCh1Pj0wP2EudG9wOmEuYm90dG9tKStzO2lmKFwicmlnaHRcIj09PXQpcmV0dXJuIG4ueD4obD49MD9hLnJpZ2h0OmEubGVmdCktcztpZihcImJvdHRvbVwiPT09dClyZXR1cm4gbi55Pih1Pj0wP2EuYm90dG9tOmEudG9wKS1zfXJldHVybiEhaS5kZWZhdWx0LmVsZW1lbnQocikmJihpLmRlZmF1bHQuZWxlbWVudChlKT9lPT09cjpfLm1hdGNoZXNVcFRvKHIsZSxvKSl9ZnVuY3Rpb24gT3QodCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwicmVzaXplXCI9PT1uLnByZXBhcmVkLm5hbWUmJm4ucmVzaXplQXhlcyl7dmFyIHI9ZTtuLmludGVyYWN0YWJsZS5vcHRpb25zLnJlc2l6ZS5zcXVhcmU/KFwieVwiPT09bi5yZXNpemVBeGVzP3IuZGVsdGEueD1yLmRlbHRhLnk6ci5kZWx0YS55PXIuZGVsdGEueCxyLmF4ZXM9XCJ4eVwiKTooci5heGVzPW4ucmVzaXplQXhlcyxcInhcIj09PW4ucmVzaXplQXhlcz9yLmRlbHRhLnk9MDpcInlcIj09PW4ucmVzaXplQXhlcyYmKHIuZGVsdGEueD0wKSl9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShfdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxfdC5kZWZhdWx0PXZvaWQgMDt2YXIgU3Q9e2lkOlwiYWN0aW9ucy9yZXNpemVcIixiZWZvcmU6W1wiYWN0aW9ucy9kcmFnXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5hY3Rpb25zLG49dC5icm93c2VyLHI9dC5JbnRlcmFjdGFibGUsbz10LmRlZmF1bHRzO1N0LmN1cnNvcnM9ZnVuY3Rpb24odCl7cmV0dXJuIHQuaXNJZTk/e3g6XCJlLXJlc2l6ZVwiLHk6XCJzLXJlc2l6ZVwiLHh5Olwic2UtcmVzaXplXCIsdG9wOlwibi1yZXNpemVcIixsZWZ0Olwidy1yZXNpemVcIixib3R0b206XCJzLXJlc2l6ZVwiLHJpZ2h0OlwiZS1yZXNpemVcIix0b3BsZWZ0Olwic2UtcmVzaXplXCIsYm90dG9tcmlnaHQ6XCJzZS1yZXNpemVcIix0b3ByaWdodDpcIm5lLXJlc2l6ZVwiLGJvdHRvbWxlZnQ6XCJuZS1yZXNpemVcIn06e3g6XCJldy1yZXNpemVcIix5OlwibnMtcmVzaXplXCIseHk6XCJud3NlLXJlc2l6ZVwiLHRvcDpcIm5zLXJlc2l6ZVwiLGxlZnQ6XCJldy1yZXNpemVcIixib3R0b206XCJucy1yZXNpemVcIixyaWdodDpcImV3LXJlc2l6ZVwiLHRvcGxlZnQ6XCJud3NlLXJlc2l6ZVwiLGJvdHRvbXJpZ2h0OlwibndzZS1yZXNpemVcIix0b3ByaWdodDpcIm5lc3ctcmVzaXplXCIsYm90dG9tbGVmdDpcIm5lc3ctcmVzaXplXCJ9fShuKSxTdC5kZWZhdWx0TWFyZ2luPW4uc3VwcG9ydHNUb3VjaHx8bi5zdXBwb3J0c1BvaW50ZXJFdmVudD8yMDoxMCxyLnByb3RvdHlwZS5yZXNpemFibGU9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4gaS5kZWZhdWx0Lm9iamVjdChlKT8odC5vcHRpb25zLnJlc2l6ZS5lbmFibGVkPSExIT09ZS5lbmFibGVkLHQuc2V0UGVyQWN0aW9uKFwicmVzaXplXCIsZSksdC5zZXRPbkV2ZW50cyhcInJlc2l6ZVwiLGUpLGkuZGVmYXVsdC5zdHJpbmcoZS5heGlzKSYmL154JHxeeSR8Xnh5JC8udGVzdChlLmF4aXMpP3Qub3B0aW9ucy5yZXNpemUuYXhpcz1lLmF4aXM6bnVsbD09PWUuYXhpcyYmKHQub3B0aW9ucy5yZXNpemUuYXhpcz1uLmRlZmF1bHRzLmFjdGlvbnMucmVzaXplLmF4aXMpLGkuZGVmYXVsdC5ib29sKGUucHJlc2VydmVBc3BlY3RSYXRpbyk/dC5vcHRpb25zLnJlc2l6ZS5wcmVzZXJ2ZUFzcGVjdFJhdGlvPWUucHJlc2VydmVBc3BlY3RSYXRpbzppLmRlZmF1bHQuYm9vbChlLnNxdWFyZSkmJih0Lm9wdGlvbnMucmVzaXplLnNxdWFyZT1lLnNxdWFyZSksdCk6aS5kZWZhdWx0LmJvb2woZSk/KHQub3B0aW9ucy5yZXNpemUuZW5hYmxlZD1lLHQpOnQub3B0aW9ucy5yZXNpemV9KHRoaXMsZSx0KX0sZS5tYXAucmVzaXplPVN0LGUubWV0aG9kRGljdC5yZXNpemU9XCJyZXNpemFibGVcIixvLmFjdGlvbnMucmVzaXplPVN0LmRlZmF1bHRzfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24ucmVzaXplQXhlcz1cInh5XCJ9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1zdGFydFwiOmZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb247aWYoXCJyZXNpemVcIj09PW4ucHJlcGFyZWQubmFtZSYmbi5wcmVwYXJlZC5lZGdlcyl7dmFyIHI9ZSxvPW4ucmVjdDtuLl9yZWN0cz17c3RhcnQ6KDAsai5kZWZhdWx0KSh7fSxvKSxjb3JyZWN0ZWQ6KDAsai5kZWZhdWx0KSh7fSxvKSxwcmV2aW91czooMCxqLmRlZmF1bHQpKHt9LG8pLGRlbHRhOntsZWZ0OjAscmlnaHQ6MCx3aWR0aDowLHRvcDowLGJvdHRvbTowLGhlaWdodDowfX0sci5lZGdlcz1uLnByZXBhcmVkLmVkZ2VzLHIucmVjdD1uLl9yZWN0cy5jb3JyZWN0ZWQsci5kZWx0YVJlY3Q9bi5fcmVjdHMuZGVsdGF9fSh0KSxPdCh0KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0KXshZnVuY3Rpb24odCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwicmVzaXplXCI9PT1uLnByZXBhcmVkLm5hbWUmJm4ucHJlcGFyZWQuZWRnZXMpe3ZhciByPWUsbz1uLmludGVyYWN0YWJsZS5vcHRpb25zLnJlc2l6ZS5pbnZlcnQsaT1cInJlcG9zaXRpb25cIj09PW98fFwibmVnYXRlXCI9PT1vLGE9bi5yZWN0LHM9bi5fcmVjdHMsbD1zLnN0YXJ0LHU9cy5jb3JyZWN0ZWQsYz1zLmRlbHRhLGY9cy5wcmV2aW91cztpZigoMCxqLmRlZmF1bHQpKGYsdSksaSl7aWYoKDAsai5kZWZhdWx0KSh1LGEpLFwicmVwb3NpdGlvblwiPT09byl7aWYodS50b3A+dS5ib3R0b20pe3ZhciBkPXUudG9wO3UudG9wPXUuYm90dG9tLHUuYm90dG9tPWR9aWYodS5sZWZ0PnUucmlnaHQpe3ZhciBwPXUubGVmdDt1LmxlZnQ9dS5yaWdodCx1LnJpZ2h0PXB9fX1lbHNlIHUudG9wPU1hdGgubWluKGEudG9wLGwuYm90dG9tKSx1LmJvdHRvbT1NYXRoLm1heChhLmJvdHRvbSxsLnRvcCksdS5sZWZ0PU1hdGgubWluKGEubGVmdCxsLnJpZ2h0KSx1LnJpZ2h0PU1hdGgubWF4KGEucmlnaHQsbC5sZWZ0KTtmb3IodmFyIHYgaW4gdS53aWR0aD11LnJpZ2h0LXUubGVmdCx1LmhlaWdodD11LmJvdHRvbS11LnRvcCx1KWNbdl09dVt2XS1mW3ZdO3IuZWRnZXM9bi5wcmVwYXJlZC5lZGdlcyxyLnJlY3Q9dSxyLmRlbHRhUmVjdD1jfX0odCksT3QodCl9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1lbmRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb247aWYoXCJyZXNpemVcIj09PW4ucHJlcGFyZWQubmFtZSYmbi5wcmVwYXJlZC5lZGdlcyl7dmFyIHI9ZTtyLmVkZ2VzPW4ucHJlcGFyZWQuZWRnZXMsci5yZWN0PW4uX3JlY3RzLmNvcnJlY3RlZCxyLmRlbHRhUmVjdD1uLl9yZWN0cy5kZWx0YX19LFwiYXV0by1zdGFydDpjaGVja1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmludGVyYWN0YWJsZSxyPXQuZWxlbWVudCxvPXQucmVjdCxhPXQuYnV0dG9ucztpZihvKXt2YXIgcz0oMCxqLmRlZmF1bHQpKHt9LGUuY29vcmRzLmN1ci5wYWdlKSxsPW4ub3B0aW9ucy5yZXNpemU7aWYobCYmbC5lbmFibGVkJiYoIWUucG9pbnRlcklzRG93bnx8IS9tb3VzZXxwb2ludGVyLy50ZXN0KGUucG9pbnRlclR5cGUpfHwwIT0oYSZsLm1vdXNlQnV0dG9ucykpKXtpZihpLmRlZmF1bHQub2JqZWN0KGwuZWRnZXMpKXt2YXIgdT17bGVmdDohMSxyaWdodDohMSx0b3A6ITEsYm90dG9tOiExfTtmb3IodmFyIGMgaW4gdSl1W2NdPVB0KGMsbC5lZGdlc1tjXSxzLGUuX2xhdGVzdFBvaW50ZXIuZXZlbnRUYXJnZXQscixvLGwubWFyZ2lufHxTdC5kZWZhdWx0TWFyZ2luKTt1LmxlZnQ9dS5sZWZ0JiYhdS5yaWdodCx1LnRvcD11LnRvcCYmIXUuYm90dG9tLCh1LmxlZnR8fHUucmlnaHR8fHUudG9wfHx1LmJvdHRvbSkmJih0LmFjdGlvbj17bmFtZTpcInJlc2l6ZVwiLGVkZ2VzOnV9KX1lbHNle3ZhciBmPVwieVwiIT09bC5heGlzJiZzLng+by5yaWdodC1TdC5kZWZhdWx0TWFyZ2luLGQ9XCJ4XCIhPT1sLmF4aXMmJnMueT5vLmJvdHRvbS1TdC5kZWZhdWx0TWFyZ2luOyhmfHxkKSYmKHQuYWN0aW9uPXtuYW1lOlwicmVzaXplXCIsYXhlczooZj9cInhcIjpcIlwiKSsoZD9cInlcIjpcIlwiKX0pfXJldHVybiF0LmFjdGlvbiYmdm9pZCAwfX19fSxkZWZhdWx0czp7c3F1YXJlOiExLHByZXNlcnZlQXNwZWN0UmF0aW86ITEsYXhpczpcInh5XCIsbWFyZ2luOk5hTixlZGdlczpudWxsLGludmVydDpcIm5vbmVcIn0sY3Vyc29yczpudWxsLGdldEN1cnNvcjpmdW5jdGlvbih0KXt2YXIgZT10LmVkZ2VzLG49dC5heGlzLHI9dC5uYW1lLG89U3QuY3Vyc29ycyxpPW51bGw7aWYobilpPW9bcituXTtlbHNlIGlmKGUpe2Zvcih2YXIgYT1cIlwiLHM9W1widG9wXCIsXCJib3R0b21cIixcImxlZnRcIixcInJpZ2h0XCJdLGw9MDtsPHMubGVuZ3RoO2wrKyl7dmFyIHU9c1tsXTtlW3VdJiYoYSs9dSl9aT1vW2FdfXJldHVybiBpfSxkZWZhdWx0TWFyZ2luOm51bGx9LEV0PVN0O190LmRlZmF1bHQ9RXQ7dmFyIFR0PXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShUdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxUdC5kZWZhdWx0PXZvaWQgMDt2YXIgTXQ9e2lkOlwiYWN0aW9uc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dC51c2VQbHVnaW4obXQuZGVmYXVsdCksdC51c2VQbHVnaW4oX3QuZGVmYXVsdCksdC51c2VQbHVnaW4oYy5kZWZhdWx0KSx0LnVzZVBsdWdpbih1dC5kZWZhdWx0KX19O1R0LmRlZmF1bHQ9TXQ7dmFyIGp0PXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShqdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxqdC5kZWZhdWx0PXZvaWQgMDt2YXIga3QsSXQsRHQ9MCxBdD17cmVxdWVzdDpmdW5jdGlvbih0KXtyZXR1cm4ga3QodCl9LGNhbmNlbDpmdW5jdGlvbih0KXtyZXR1cm4gSXQodCl9LGluaXQ6ZnVuY3Rpb24odCl7aWYoa3Q9dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUsSXQ9dC5jYW5jZWxBbmltYXRpb25GcmFtZSwha3QpZm9yKHZhciBlPVtcIm1zXCIsXCJtb3pcIixcIndlYmtpdFwiLFwib1wiXSxuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07a3Q9dFtcIlwiLmNvbmNhdChyLFwiUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpXSxJdD10W1wiXCIuY29uY2F0KHIsXCJDYW5jZWxBbmltYXRpb25GcmFtZVwiKV18fHRbXCJcIi5jb25jYXQocixcIkNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVwiKV19a3Q9a3QmJmt0LmJpbmQodCksSXQ9SXQmJkl0LmJpbmQodCksa3R8fChrdD1mdW5jdGlvbihlKXt2YXIgbj1EYXRlLm5vdygpLHI9TWF0aC5tYXgoMCwxNi0obi1EdCkpLG89dC5zZXRUaW1lb3V0KChmdW5jdGlvbigpe2UobityKX0pLHIpO3JldHVybiBEdD1uK3Isb30sSXQ9ZnVuY3Rpb24odCl7cmV0dXJuIGNsZWFyVGltZW91dCh0KX0pfX07anQuZGVmYXVsdD1BdDt2YXIgUnQ9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFJ0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFJ0LmdldENvbnRhaW5lcj1DdCxSdC5nZXRTY3JvbGw9RnQsUnQuZ2V0U2Nyb2xsU2l6ZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0LndpbmRvdyh0KSYmKHQ9d2luZG93LmRvY3VtZW50LmJvZHkpLHt4OnQuc2Nyb2xsV2lkdGgseTp0LnNjcm9sbEhlaWdodH19LFJ0LmdldFNjcm9sbFNpemVEZWx0YT1mdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmVsZW1lbnQsbz1uJiZuLmludGVyYWN0YWJsZS5vcHRpb25zW24ucHJlcGFyZWQubmFtZV0uYXV0b1Njcm9sbDtpZighb3x8IW8uZW5hYmxlZClyZXR1cm4gZSgpLHt4OjAseTowfTt2YXIgaT1DdChvLmNvbnRhaW5lcixuLmludGVyYWN0YWJsZSxyKSxhPUZ0KGkpO2UoKTt2YXIgcz1GdChpKTtyZXR1cm57eDpzLngtYS54LHk6cy55LWEueX19LFJ0LmRlZmF1bHQ9dm9pZCAwO3ZhciB6dD17ZGVmYXVsdHM6e2VuYWJsZWQ6ITEsbWFyZ2luOjYwLGNvbnRhaW5lcjpudWxsLHNwZWVkOjMwMH0sbm93OkRhdGUubm93LGludGVyYWN0aW9uOm51bGwsaTowLHg6MCx5OjAsaXNTY3JvbGxpbmc6ITEscHJldlRpbWU6MCxtYXJnaW46MCxzcGVlZDowLHN0YXJ0OmZ1bmN0aW9uKHQpe3p0LmlzU2Nyb2xsaW5nPSEwLGp0LmRlZmF1bHQuY2FuY2VsKHp0LmkpLHQuYXV0b1Njcm9sbD16dCx6dC5pbnRlcmFjdGlvbj10LHp0LnByZXZUaW1lPXp0Lm5vdygpLHp0Lmk9anQuZGVmYXVsdC5yZXF1ZXN0KHp0LnNjcm9sbCl9LHN0b3A6ZnVuY3Rpb24oKXt6dC5pc1Njcm9sbGluZz0hMSx6dC5pbnRlcmFjdGlvbiYmKHp0LmludGVyYWN0aW9uLmF1dG9TY3JvbGw9bnVsbCksanQuZGVmYXVsdC5jYW5jZWwoenQuaSl9LHNjcm9sbDpmdW5jdGlvbigpe3ZhciB0PXp0LmludGVyYWN0aW9uLGU9dC5pbnRlcmFjdGFibGUsbj10LmVsZW1lbnQscj10LnByZXBhcmVkLm5hbWUsbz1lLm9wdGlvbnNbcl0uYXV0b1Njcm9sbCxhPUN0KG8uY29udGFpbmVyLGUsbikscz16dC5ub3coKSxsPShzLXp0LnByZXZUaW1lKS8xZTMsdT1vLnNwZWVkKmw7aWYodT49MSl7dmFyIGM9e3g6enQueCp1LHk6enQueSp1fTtpZihjLnh8fGMueSl7dmFyIGY9RnQoYSk7aS5kZWZhdWx0LndpbmRvdyhhKT9hLnNjcm9sbEJ5KGMueCxjLnkpOmEmJihhLnNjcm9sbExlZnQrPWMueCxhLnNjcm9sbFRvcCs9Yy55KTt2YXIgZD1GdChhKSxwPXt4OmQueC1mLngseTpkLnktZi55fTsocC54fHxwLnkpJiZlLmZpcmUoe3R5cGU6XCJhdXRvc2Nyb2xsXCIsdGFyZ2V0Om4saW50ZXJhY3RhYmxlOmUsZGVsdGE6cCxpbnRlcmFjdGlvbjp0LGNvbnRhaW5lcjphfSl9enQucHJldlRpbWU9c316dC5pc1Njcm9sbGluZyYmKGp0LmRlZmF1bHQuY2FuY2VsKHp0LmkpLHp0Lmk9anQuZGVmYXVsdC5yZXF1ZXN0KHp0LnNjcm9sbCkpfSxjaGVjazpmdW5jdGlvbih0LGUpe3ZhciBuO3JldHVybiBudWxsPT0obj10Lm9wdGlvbnNbZV0uYXV0b1Njcm9sbCk/dm9pZCAwOm4uZW5hYmxlZH0sb25JbnRlcmFjdGlvbk1vdmU6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQucG9pbnRlcjtpZihlLmludGVyYWN0aW5nKCkmJnp0LmNoZWNrKGUuaW50ZXJhY3RhYmxlLGUucHJlcGFyZWQubmFtZSkpaWYoZS5zaW11bGF0aW9uKXp0Lng9enQueT0wO2Vsc2V7dmFyIHIsbyxhLHMsbD1lLmludGVyYWN0YWJsZSx1PWUuZWxlbWVudCxjPWUucHJlcGFyZWQubmFtZSxmPWwub3B0aW9uc1tjXS5hdXRvU2Nyb2xsLGQ9Q3QoZi5jb250YWluZXIsbCx1KTtpZihpLmRlZmF1bHQud2luZG93KGQpKXM9bi5jbGllbnRYPHp0Lm1hcmdpbixyPW4uY2xpZW50WTx6dC5tYXJnaW4sbz1uLmNsaWVudFg+ZC5pbm5lcldpZHRoLXp0Lm1hcmdpbixhPW4uY2xpZW50WT5kLmlubmVySGVpZ2h0LXp0Lm1hcmdpbjtlbHNle3ZhciBwPV8uZ2V0RWxlbWVudENsaWVudFJlY3QoZCk7cz1uLmNsaWVudFg8cC5sZWZ0K3p0Lm1hcmdpbixyPW4uY2xpZW50WTxwLnRvcCt6dC5tYXJnaW4sbz1uLmNsaWVudFg+cC5yaWdodC16dC5tYXJnaW4sYT1uLmNsaWVudFk+cC5ib3R0b20tenQubWFyZ2lufXp0Lng9bz8xOnM/LTE6MCx6dC55PWE/MTpyPy0xOjAsenQuaXNTY3JvbGxpbmd8fCh6dC5tYXJnaW49Zi5tYXJnaW4senQuc3BlZWQ9Zi5zcGVlZCx6dC5zdGFydChlKSl9fX07ZnVuY3Rpb24gQ3QodCxuLHIpe3JldHVybihpLmRlZmF1bHQuc3RyaW5nKHQpPygwLGsuZ2V0U3RyaW5nT3B0aW9uUmVzdWx0KSh0LG4scik6dCl8fCgwLGUuZ2V0V2luZG93KShyKX1mdW5jdGlvbiBGdCh0KXtyZXR1cm4gaS5kZWZhdWx0LndpbmRvdyh0KSYmKHQ9d2luZG93LmRvY3VtZW50LmJvZHkpLHt4OnQuc2Nyb2xsTGVmdCx5OnQuc2Nyb2xsVG9wfX12YXIgWHQ9e2lkOlwiYXV0by1zY3JvbGxcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVmYXVsdHMsbj10LmFjdGlvbnM7dC5hdXRvU2Nyb2xsPXp0LHp0Lm5vdz1mdW5jdGlvbigpe3JldHVybiB0Lm5vdygpfSxuLnBoYXNlbGVzc1R5cGVzLmF1dG9zY3JvbGw9ITAsZS5wZXJBY3Rpb24uYXV0b1Njcm9sbD16dC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLmF1dG9TY3JvbGw9bnVsbH0sXCJpbnRlcmFjdGlvbnM6ZGVzdHJveVwiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24uYXV0b1Njcm9sbD1udWxsLHp0LnN0b3AoKSx6dC5pbnRlcmFjdGlvbiYmKHp0LmludGVyYWN0aW9uPW51bGwpfSxcImludGVyYWN0aW9uczpzdG9wXCI6enQuc3RvcCxcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQpe3JldHVybiB6dC5vbkludGVyYWN0aW9uTW92ZSh0KX19fTtSdC5kZWZhdWx0PVh0O3ZhciBZdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoWXQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWXQud2Fybk9uY2U9ZnVuY3Rpb24odCxuKXt2YXIgcj0hMTtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gcnx8KGUud2luZG93LmNvbnNvbGUud2FybihuKSxyPSEwKSx0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX19LFl0LmNvcHlBY3Rpb249ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5uYW1lPWUubmFtZSx0LmF4aXM9ZS5heGlzLHQuZWRnZXM9ZS5lZGdlcyx0fSxZdC5zaWduPXZvaWQgMCxZdC5zaWduPWZ1bmN0aW9uKHQpe3JldHVybiB0Pj0wPzE6LTF9O3ZhciBCdD17fTtmdW5jdGlvbiBXdCh0KXtyZXR1cm4gaS5kZWZhdWx0LmJvb2wodCk/KHRoaXMub3B0aW9ucy5zdHlsZUN1cnNvcj10LHRoaXMpOm51bGw9PT10PyhkZWxldGUgdGhpcy5vcHRpb25zLnN0eWxlQ3Vyc29yLHRoaXMpOnRoaXMub3B0aW9ucy5zdHlsZUN1cnNvcn1mdW5jdGlvbiBMdCh0KXtyZXR1cm4gaS5kZWZhdWx0LmZ1bmModCk/KHRoaXMub3B0aW9ucy5hY3Rpb25DaGVja2VyPXQsdGhpcyk6bnVsbD09PXQ/KGRlbGV0ZSB0aGlzLm9wdGlvbnMuYWN0aW9uQ2hlY2tlcix0aGlzKTp0aGlzLm9wdGlvbnMuYWN0aW9uQ2hlY2tlcn1PYmplY3QuZGVmaW5lUHJvcGVydHkoQnQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQnQuZGVmYXVsdD12b2lkIDA7dmFyIFV0PXtpZDpcImF1dG8tc3RhcnQvaW50ZXJhY3RhYmxlTWV0aG9kc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5JbnRlcmFjdGFibGU7ZS5wcm90b3R5cGUuZ2V0QWN0aW9uPWZ1bmN0aW9uKGUsbixyLG8pe3ZhciBpPWZ1bmN0aW9uKHQsZSxuLHIsbyl7dmFyIGk9dC5nZXRSZWN0KHIpLGE9e2FjdGlvbjpudWxsLGludGVyYWN0YWJsZTp0LGludGVyYWN0aW9uOm4sZWxlbWVudDpyLHJlY3Q6aSxidXR0b25zOmUuYnV0dG9uc3x8ezA6MSwxOjQsMzo4LDQ6MTZ9W2UuYnV0dG9uXX07cmV0dXJuIG8uZmlyZShcImF1dG8tc3RhcnQ6Y2hlY2tcIixhKSxhLmFjdGlvbn0odGhpcyxuLHIsbyx0KTtyZXR1cm4gdGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXI/dGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXIoZSxuLGksdGhpcyxvLHIpOml9LGUucHJvdG90eXBlLmlnbm9yZUZyb209KDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fYmFja0NvbXBhdE9wdGlvbihcImlnbm9yZUZyb21cIix0KX0pLFwiSW50ZXJhY3RhYmxlLmlnbm9yZUZyb20oKSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgSW50ZXJhY3RibGUuZHJhZ2dhYmxlKHtpZ25vcmVGcm9tOiBuZXdWYWx1ZX0pLlwiKSxlLnByb3RvdHlwZS5hbGxvd0Zyb209KDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fYmFja0NvbXBhdE9wdGlvbihcImFsbG93RnJvbVwiLHQpfSksXCJJbnRlcmFjdGFibGUuYWxsb3dGcm9tKCkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIEludGVyYWN0YmxlLmRyYWdnYWJsZSh7YWxsb3dGcm9tOiBuZXdWYWx1ZX0pLlwiKSxlLnByb3RvdHlwZS5hY3Rpb25DaGVja2VyPUx0LGUucHJvdG90eXBlLnN0eWxlQ3Vyc29yPVd0fX07QnQuZGVmYXVsdD1VdDt2YXIgVnQ9e307ZnVuY3Rpb24gTnQodCxlLG4scixvKXtyZXR1cm4gZS50ZXN0SWdub3JlQWxsb3coZS5vcHRpb25zW3QubmFtZV0sbixyKSYmZS5vcHRpb25zW3QubmFtZV0uZW5hYmxlZCYmSHQoZSxuLHQsbyk/dDpudWxsfWZ1bmN0aW9uIHF0KHQsZSxuLHIsbyxpLGEpe2Zvcih2YXIgcz0wLGw9ci5sZW5ndGg7czxsO3MrKyl7dmFyIHU9cltzXSxjPW9bc10sZj11LmdldEFjdGlvbihlLG4sdCxjKTtpZihmKXt2YXIgZD1OdChmLHUsYyxpLGEpO2lmKGQpcmV0dXJue2FjdGlvbjpkLGludGVyYWN0YWJsZTp1LGVsZW1lbnQ6Y319fXJldHVybnthY3Rpb246bnVsbCxpbnRlcmFjdGFibGU6bnVsbCxlbGVtZW50Om51bGx9fWZ1bmN0aW9uICR0KHQsZSxuLHIsbyl7dmFyIGE9W10scz1bXSxsPXI7ZnVuY3Rpb24gdSh0KXthLnB1c2godCkscy5wdXNoKGwpfWZvcig7aS5kZWZhdWx0LmVsZW1lbnQobCk7KXthPVtdLHM9W10sby5pbnRlcmFjdGFibGVzLmZvckVhY2hNYXRjaChsLHUpO3ZhciBjPXF0KHQsZSxuLGEscyxyLG8pO2lmKGMuYWN0aW9uJiYhYy5pbnRlcmFjdGFibGUub3B0aW9uc1tjLmFjdGlvbi5uYW1lXS5tYW51YWxTdGFydClyZXR1cm4gYztsPV8ucGFyZW50Tm9kZShsKX1yZXR1cm57YWN0aW9uOm51bGwsaW50ZXJhY3RhYmxlOm51bGwsZWxlbWVudDpudWxsfX1mdW5jdGlvbiBHdCh0LGUsbil7dmFyIHI9ZS5hY3Rpb24sbz1lLmludGVyYWN0YWJsZSxpPWUuZWxlbWVudDtyPXJ8fHtuYW1lOm51bGx9LHQuaW50ZXJhY3RhYmxlPW8sdC5lbGVtZW50PWksKDAsWXQuY29weUFjdGlvbikodC5wcmVwYXJlZCxyKSx0LnJlY3Q9byYmci5uYW1lP28uZ2V0UmVjdChpKTpudWxsLEp0KHQsbiksbi5maXJlKFwiYXV0b1N0YXJ0OnByZXBhcmVkXCIse2ludGVyYWN0aW9uOnR9KX1mdW5jdGlvbiBIdCh0LGUsbixyKXt2YXIgbz10Lm9wdGlvbnMsaT1vW24ubmFtZV0ubWF4LGE9b1tuLm5hbWVdLm1heFBlckVsZW1lbnQscz1yLmF1dG9TdGFydC5tYXhJbnRlcmFjdGlvbnMsbD0wLHU9MCxjPTA7aWYoIShpJiZhJiZzKSlyZXR1cm4hMTtmb3IodmFyIGY9MDtmPHIuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO2YrKyl7dmFyIGQ9ci5pbnRlcmFjdGlvbnMubGlzdFtmXSxwPWQucHJlcGFyZWQubmFtZTtpZihkLmludGVyYWN0aW5nKCkpe2lmKCsrbD49cylyZXR1cm4hMTtpZihkLmludGVyYWN0YWJsZT09PXQpe2lmKCh1Kz1wPT09bi5uYW1lPzE6MCk+PWkpcmV0dXJuITE7aWYoZC5lbGVtZW50PT09ZSYmKGMrKyxwPT09bi5uYW1lJiZjPj1hKSlyZXR1cm4hMX19fXJldHVybiBzPjB9ZnVuY3Rpb24gS3QodCxlKXtyZXR1cm4gaS5kZWZhdWx0Lm51bWJlcih0KT8oZS5hdXRvU3RhcnQubWF4SW50ZXJhY3Rpb25zPXQsdGhpcyk6ZS5hdXRvU3RhcnQubWF4SW50ZXJhY3Rpb25zfWZ1bmN0aW9uIFp0KHQsZSxuKXt2YXIgcj1uLmF1dG9TdGFydC5jdXJzb3JFbGVtZW50O3ImJnIhPT10JiYoci5zdHlsZS5jdXJzb3I9XCJcIiksdC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5jdXJzb3I9ZSx0LnN0eWxlLmN1cnNvcj1lLG4uYXV0b1N0YXJ0LmN1cnNvckVsZW1lbnQ9ZT90Om51bGx9ZnVuY3Rpb24gSnQodCxlKXt2YXIgbj10LmludGVyYWN0YWJsZSxyPXQuZWxlbWVudCxvPXQucHJlcGFyZWQ7aWYoXCJtb3VzZVwiPT09dC5wb2ludGVyVHlwZSYmbiYmbi5vcHRpb25zLnN0eWxlQ3Vyc29yKXt2YXIgYT1cIlwiO2lmKG8ubmFtZSl7dmFyIHM9bi5vcHRpb25zW28ubmFtZV0uY3Vyc29yQ2hlY2tlcjthPWkuZGVmYXVsdC5mdW5jKHMpP3MobyxuLHIsdC5faW50ZXJhY3RpbmcpOmUuYWN0aW9ucy5tYXBbby5uYW1lXS5nZXRDdXJzb3Iobyl9WnQodC5lbGVtZW50LGF8fFwiXCIsZSl9ZWxzZSBlLmF1dG9TdGFydC5jdXJzb3JFbGVtZW50JiZadChlLmF1dG9TdGFydC5jdXJzb3JFbGVtZW50LFwiXCIsZSl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFZ0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFZ0LmRlZmF1bHQ9dm9pZCAwO3ZhciBRdD17aWQ6XCJhdXRvLXN0YXJ0L2Jhc2VcIixiZWZvcmU6W1wiYWN0aW9uc1wiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RTdGF0aWMsbj10LmRlZmF1bHRzO3QudXNlUGx1Z2luKEJ0LmRlZmF1bHQpLG4uYmFzZS5hY3Rpb25DaGVja2VyPW51bGwsbi5iYXNlLnN0eWxlQ3Vyc29yPSEwLCgwLGouZGVmYXVsdCkobi5wZXJBY3Rpb24se21hbnVhbFN0YXJ0OiExLG1heDoxLzAsbWF4UGVyRWxlbWVudDoxLGFsbG93RnJvbTpudWxsLGlnbm9yZUZyb206bnVsbCxtb3VzZUJ1dHRvbnM6MX0pLGUubWF4SW50ZXJhY3Rpb25zPWZ1bmN0aW9uKGUpe3JldHVybiBLdChlLHQpfSx0LmF1dG9TdGFydD17bWF4SW50ZXJhY3Rpb25zOjEvMCx3aXRoaW5JbnRlcmFjdGlvbkxpbWl0Okh0LGN1cnNvckVsZW1lbnQ6bnVsbH19LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6ZG93blwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0O24uaW50ZXJhY3RpbmcoKXx8R3QobiwkdChuLHIsbyxpLGUpLGUpfSxcImludGVyYWN0aW9uczptb3ZlXCI6ZnVuY3Rpb24odCxlKXshZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQ7XCJtb3VzZVwiIT09bi5wb2ludGVyVHlwZXx8bi5wb2ludGVySXNEb3dufHxuLmludGVyYWN0aW5nKCl8fEd0KG4sJHQobixyLG8saSxlKSxlKX0odCxlKSxmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb247aWYobi5wb2ludGVySXNEb3duJiYhbi5pbnRlcmFjdGluZygpJiZuLnBvaW50ZXJXYXNNb3ZlZCYmbi5wcmVwYXJlZC5uYW1lKXtlLmZpcmUoXCJhdXRvU3RhcnQ6YmVmb3JlLXN0YXJ0XCIsdCk7dmFyIHI9bi5pbnRlcmFjdGFibGUsbz1uLnByZXBhcmVkLm5hbWU7byYmciYmKHIub3B0aW9uc1tvXS5tYW51YWxTdGFydHx8IUh0KHIsbi5lbGVtZW50LG4ucHJlcGFyZWQsZSk/bi5zdG9wKCk6KG4uc3RhcnQobi5wcmVwYXJlZCxyLG4uZWxlbWVudCksSnQobixlKSkpfX0odCxlKX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPW4uaW50ZXJhY3RhYmxlO3ImJnIub3B0aW9ucy5zdHlsZUN1cnNvciYmWnQobi5lbGVtZW50LFwiXCIsZSl9fSxtYXhJbnRlcmFjdGlvbnM6S3Qsd2l0aGluSW50ZXJhY3Rpb25MaW1pdDpIdCx2YWxpZGF0ZUFjdGlvbjpOdH07VnQuZGVmYXVsdD1RdDt2YXIgdGU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHRlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHRlLmRlZmF1bHQ9dm9pZCAwO3ZhciBlZT17aWQ6XCJhdXRvLXN0YXJ0L2RyYWdBeGlzXCIsbGlzdGVuZXJzOntcImF1dG9TdGFydDpiZWZvcmUtc3RhcnRcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmV2ZW50VGFyZ2V0LG89dC5keCxhPXQuZHk7aWYoXCJkcmFnXCI9PT1uLnByZXBhcmVkLm5hbWUpe3ZhciBzPU1hdGguYWJzKG8pLGw9TWF0aC5hYnMoYSksdT1uLmludGVyYWN0YWJsZS5vcHRpb25zLmRyYWcsYz11LnN0YXJ0QXhpcyxmPXM+bD9cInhcIjpzPGw/XCJ5XCI6XCJ4eVwiO2lmKG4ucHJlcGFyZWQuYXhpcz1cInN0YXJ0XCI9PT11LmxvY2tBeGlzP2ZbMF06dS5sb2NrQXhpcyxcInh5XCIhPT1mJiZcInh5XCIhPT1jJiZjIT09Zil7bi5wcmVwYXJlZC5uYW1lPW51bGw7Zm9yKHZhciBkPXIscD1mdW5jdGlvbih0KXtpZih0IT09bi5pbnRlcmFjdGFibGUpe3ZhciBvPW4uaW50ZXJhY3RhYmxlLm9wdGlvbnMuZHJhZztpZighby5tYW51YWxTdGFydCYmdC50ZXN0SWdub3JlQWxsb3cobyxkLHIpKXt2YXIgaT10LmdldEFjdGlvbihuLmRvd25Qb2ludGVyLG4uZG93bkV2ZW50LG4sZCk7aWYoaSYmXCJkcmFnXCI9PT1pLm5hbWUmJmZ1bmN0aW9uKHQsZSl7aWYoIWUpcmV0dXJuITE7dmFyIG49ZS5vcHRpb25zLmRyYWcuc3RhcnRBeGlzO3JldHVyblwieHlcIj09PXR8fFwieHlcIj09PW58fG49PT10fShmLHQpJiZWdC5kZWZhdWx0LnZhbGlkYXRlQWN0aW9uKGksdCxkLHIsZSkpcmV0dXJuIHR9fX07aS5kZWZhdWx0LmVsZW1lbnQoZCk7KXt2YXIgdj1lLmludGVyYWN0YWJsZXMuZm9yRWFjaE1hdGNoKGQscCk7aWYodil7bi5wcmVwYXJlZC5uYW1lPVwiZHJhZ1wiLG4uaW50ZXJhY3RhYmxlPXYsbi5lbGVtZW50PWQ7YnJlYWt9ZD0oMCxfLnBhcmVudE5vZGUpKGQpfX19fX19O3RlLmRlZmF1bHQ9ZWU7dmFyIG5lPXt9O2Z1bmN0aW9uIHJlKHQpe3ZhciBlPXQucHJlcGFyZWQmJnQucHJlcGFyZWQubmFtZTtpZighZSlyZXR1cm4gbnVsbDt2YXIgbj10LmludGVyYWN0YWJsZS5vcHRpb25zO3JldHVybiBuW2VdLmhvbGR8fG5bZV0uZGVsYXl9T2JqZWN0LmRlZmluZVByb3BlcnR5KG5lLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLG5lLmRlZmF1bHQ9dm9pZCAwO3ZhciBvZT17aWQ6XCJhdXRvLXN0YXJ0L2hvbGRcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVmYXVsdHM7dC51c2VQbHVnaW4oVnQuZGVmYXVsdCksZS5wZXJBY3Rpb24uaG9sZD0wLGUucGVyQWN0aW9uLmRlbGF5PTB9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dC5pbnRlcmFjdGlvbi5hdXRvU3RhcnRIb2xkVGltZXI9bnVsbH0sXCJhdXRvU3RhcnQ6cHJlcGFyZWRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49cmUoZSk7bj4wJiYoZS5hdXRvU3RhcnRIb2xkVGltZXI9c2V0VGltZW91dCgoZnVuY3Rpb24oKXtlLnN0YXJ0KGUucHJlcGFyZWQsZS5pbnRlcmFjdGFibGUsZS5lbGVtZW50KX0pLG4pKX0sXCJpbnRlcmFjdGlvbnM6bW92ZVwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmR1cGxpY2F0ZTtlLmF1dG9TdGFydEhvbGRUaW1lciYmZS5wb2ludGVyV2FzTW92ZWQmJiFuJiYoY2xlYXJUaW1lb3V0KGUuYXV0b1N0YXJ0SG9sZFRpbWVyKSxlLmF1dG9TdGFydEhvbGRUaW1lcj1udWxsKX0sXCJhdXRvU3RhcnQ6YmVmb3JlLXN0YXJ0XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtyZShlKT4wJiYoZS5wcmVwYXJlZC5uYW1lPW51bGwpfX0sZ2V0SG9sZER1cmF0aW9uOnJlfTtuZS5kZWZhdWx0PW9lO3ZhciBpZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoaWUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaWUuZGVmYXVsdD12b2lkIDA7dmFyIGFlPXtpZDpcImF1dG8tc3RhcnRcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3QudXNlUGx1Z2luKFZ0LmRlZmF1bHQpLHQudXNlUGx1Z2luKG5lLmRlZmF1bHQpLHQudXNlUGx1Z2luKHRlLmRlZmF1bHQpfX07aWUuZGVmYXVsdD1hZTt2YXIgc2U9e307ZnVuY3Rpb24gbGUodCl7cmV0dXJuL14oYWx3YXlzfG5ldmVyfGF1dG8pJC8udGVzdCh0KT8odGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0PXQsdGhpcyk6aS5kZWZhdWx0LmJvb2wodCk/KHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdD10P1wiYWx3YXlzXCI6XCJuZXZlclwiLHRoaXMpOnRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdH1mdW5jdGlvbiB1ZSh0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5ldmVudDtlLmludGVyYWN0YWJsZSYmZS5pbnRlcmFjdGFibGUuY2hlY2tBbmRQcmV2ZW50RGVmYXVsdChuKX1mdW5jdGlvbiBjZSh0KXt2YXIgbj10LkludGVyYWN0YWJsZTtuLnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdD1sZSxuLnByb3RvdHlwZS5jaGVja0FuZFByZXZlbnREZWZhdWx0PWZ1bmN0aW9uKG4pe3JldHVybiBmdW5jdGlvbih0LG4scil7dmFyIG89dC5vcHRpb25zLnByZXZlbnREZWZhdWx0O2lmKFwibmV2ZXJcIiE9PW8paWYoXCJhbHdheXNcIiE9PW8pe2lmKG4uZXZlbnRzLnN1cHBvcnRzUGFzc2l2ZSYmL150b3VjaChzdGFydHxtb3ZlKSQvLnRlc3Qoci50eXBlKSl7dmFyIGE9KDAsZS5nZXRXaW5kb3cpKHIudGFyZ2V0KS5kb2N1bWVudCxzPW4uZ2V0RG9jT3B0aW9ucyhhKTtpZighc3x8IXMuZXZlbnRzfHwhMSE9PXMuZXZlbnRzLnBhc3NpdmUpcmV0dXJufS9eKG1vdXNlfHBvaW50ZXJ8dG91Y2gpKihkb3dufHN0YXJ0KS9pLnRlc3Qoci50eXBlKXx8aS5kZWZhdWx0LmVsZW1lbnQoci50YXJnZXQpJiYoMCxfLm1hdGNoZXNTZWxlY3Rvcikoci50YXJnZXQsXCJpbnB1dCxzZWxlY3QsdGV4dGFyZWEsW2NvbnRlbnRlZGl0YWJsZT10cnVlXSxbY29udGVudGVkaXRhYmxlPXRydWVdICpcIil8fHIucHJldmVudERlZmF1bHQoKX1lbHNlIHIucHJldmVudERlZmF1bHQoKX0odGhpcyx0LG4pfSx0LmludGVyYWN0aW9ucy5kb2NFdmVudHMucHVzaCh7dHlwZTpcImRyYWdzdGFydFwiLGxpc3RlbmVyOmZ1bmN0aW9uKGUpe2Zvcih2YXIgbj0wO248dC5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7bisrKXt2YXIgcj10LmludGVyYWN0aW9ucy5saXN0W25dO2lmKHIuZWxlbWVudCYmKHIuZWxlbWVudD09PWUudGFyZ2V0fHwoMCxfLm5vZGVDb250YWlucykoci5lbGVtZW50LGUudGFyZ2V0KSkpcmV0dXJuIHZvaWQgci5pbnRlcmFjdGFibGUuY2hlY2tBbmRQcmV2ZW50RGVmYXVsdChlKX19fSl9T2JqZWN0LmRlZmluZVByb3BlcnR5KHNlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHNlLmluc3RhbGw9Y2Usc2UuZGVmYXVsdD12b2lkIDA7dmFyIGZlPXtpZDpcImNvcmUvaW50ZXJhY3RhYmxlUHJldmVudERlZmF1bHRcIixpbnN0YWxsOmNlLGxpc3RlbmVyczpbXCJkb3duXCIsXCJtb3ZlXCIsXCJ1cFwiLFwiY2FuY2VsXCJdLnJlZHVjZSgoZnVuY3Rpb24odCxlKXtyZXR1cm4gdFtcImludGVyYWN0aW9uczpcIi5jb25jYXQoZSldPXVlLHR9KSx7fSl9O3NlLmRlZmF1bHQ9ZmU7dmFyIGRlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShkZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxkZS5kZWZhdWx0PXZvaWQgMCxkZS5kZWZhdWx0PXt9O3ZhciBwZSx2ZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodmUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdmUuZGVmYXVsdD12b2lkIDAsZnVuY3Rpb24odCl7dC50b3VjaEFjdGlvbj1cInRvdWNoQWN0aW9uXCIsdC5ib3hTaXppbmc9XCJib3hTaXppbmdcIix0Lm5vTGlzdGVuZXJzPVwibm9MaXN0ZW5lcnNcIn0ocGV8fChwZT17fSkpO3BlLnRvdWNoQWN0aW9uLHBlLmJveFNpemluZyxwZS5ub0xpc3RlbmVyczt2YXIgaGU9e2lkOlwiZGV2LXRvb2xzXCIsaW5zdGFsbDpmdW5jdGlvbigpe319O3ZlLmRlZmF1bHQ9aGU7dmFyIGdlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShnZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxnZS5kZWZhdWx0PWZ1bmN0aW9uIHQoZSl7dmFyIG49e307Zm9yKHZhciByIGluIGUpe3ZhciBvPWVbcl07aS5kZWZhdWx0LnBsYWluT2JqZWN0KG8pP25bcl09dChvKTppLmRlZmF1bHQuYXJyYXkobyk/bltyXT1aLmZyb20obyk6bltyXT1vfXJldHVybiBufTt2YXIgeWU9e307ZnVuY3Rpb24gbWUodCxlKXtyZXR1cm4gZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0odCl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fSh0LGUpfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBiZSh0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/YmUodCxlKTp2b2lkIDB9fSh0LGUpfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCl9ZnVuY3Rpb24gYmUodCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfWZ1bmN0aW9uIHhlKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiB3ZSh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHllLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHllLmdldFJlY3RPZmZzZXQ9T2UseWUuZGVmYXVsdD12b2lkIDA7dmFyIF9lPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLHdlKHRoaXMsXCJzdGF0ZXNcIixbXSksd2UodGhpcyxcInN0YXJ0T2Zmc2V0XCIse2xlZnQ6MCxyaWdodDowLHRvcDowLGJvdHRvbTowfSksd2UodGhpcyxcInN0YXJ0RGVsdGFcIix2b2lkIDApLHdlKHRoaXMsXCJyZXN1bHRcIix2b2lkIDApLHdlKHRoaXMsXCJlbmRSZXN1bHRcIix2b2lkIDApLHdlKHRoaXMsXCJlZGdlc1wiLHZvaWQgMCksd2UodGhpcyxcImludGVyYWN0aW9uXCIsdm9pZCAwKSx0aGlzLmludGVyYWN0aW9uPWUsdGhpcy5yZXN1bHQ9UGUoKX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJzdGFydFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5waGFzZSxyPXRoaXMuaW50ZXJhY3Rpb24sbz1mdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0YWJsZS5vcHRpb25zW3QucHJlcGFyZWQubmFtZV0sbj1lLm1vZGlmaWVycztyZXR1cm4gbiYmbi5sZW5ndGg/bjpbXCJzbmFwXCIsXCJzbmFwU2l6ZVwiLFwic25hcEVkZ2VzXCIsXCJyZXN0cmljdFwiLFwicmVzdHJpY3RFZGdlc1wiLFwicmVzdHJpY3RTaXplXCJdLm1hcCgoZnVuY3Rpb24odCl7dmFyIG49ZVt0XTtyZXR1cm4gbiYmbi5lbmFibGVkJiZ7b3B0aW9uczpuLG1ldGhvZHM6bi5fbWV0aG9kc319KSkuZmlsdGVyKChmdW5jdGlvbih0KXtyZXR1cm4hIXR9KSl9KHIpO3RoaXMucHJlcGFyZVN0YXRlcyhvKSx0aGlzLmVkZ2VzPSgwLGouZGVmYXVsdCkoe30sci5lZGdlcyksdGhpcy5zdGFydE9mZnNldD1PZShyLnJlY3QsZSksdGhpcy5zdGFydERlbHRhPXt4OjAseTowfTt2YXIgaT10aGlzLmZpbGxBcmcoe3BoYXNlOm4scGFnZUNvb3JkczplLHByZUVuZDohMX0pO3JldHVybiB0aGlzLnJlc3VsdD1QZSgpLHRoaXMuc3RhcnRBbGwoaSksdGhpcy5yZXN1bHQ9dGhpcy5zZXRBbGwoaSl9fSx7a2V5OlwiZmlsbEFyZ1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuaW50ZXJhY3Rpb247cmV0dXJuIHQuaW50ZXJhY3Rpb249ZSx0LmludGVyYWN0YWJsZT1lLmludGVyYWN0YWJsZSx0LmVsZW1lbnQ9ZS5lbGVtZW50LHQucmVjdD10LnJlY3R8fGUucmVjdCx0LmVkZ2VzPXRoaXMuZWRnZXMsdC5zdGFydE9mZnNldD10aGlzLnN0YXJ0T2Zmc2V0LHR9fSx7a2V5Olwic3RhcnRBbGxcIix2YWx1ZTpmdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHRoaXMuc3RhdGVzLmxlbmd0aDtlKyspe3ZhciBuPXRoaXMuc3RhdGVzW2VdO24ubWV0aG9kcy5zdGFydCYmKHQuc3RhdGU9bixuLm1ldGhvZHMuc3RhcnQodCkpfX19LHtrZXk6XCJzZXRBbGxcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LnBoYXNlLG49dC5wcmVFbmQscj10LnNraXBNb2RpZmllcnMsbz10LnJlY3Q7dC5jb29yZHM9KDAsai5kZWZhdWx0KSh7fSx0LnBhZ2VDb29yZHMpLHQucmVjdD0oMCxqLmRlZmF1bHQpKHt9LG8pO2Zvcih2YXIgaT1yP3RoaXMuc3RhdGVzLnNsaWNlKHIpOnRoaXMuc3RhdGVzLGE9UGUodC5jb29yZHMsdC5yZWN0KSxzPTA7czxpLmxlbmd0aDtzKyspe3ZhciBsLHU9aVtzXSxjPXUub3B0aW9ucyxmPSgwLGouZGVmYXVsdCkoe30sdC5jb29yZHMpLGQ9bnVsbDtudWxsIT0obD11Lm1ldGhvZHMpJiZsLnNldCYmdGhpcy5zaG91bGREbyhjLG4sZSkmJih0LnN0YXRlPXUsZD11Lm1ldGhvZHMuc2V0KHQpLGsuYWRkRWRnZXModGhpcy5pbnRlcmFjdGlvbi5lZGdlcyx0LnJlY3Qse3g6dC5jb29yZHMueC1mLngseTp0LmNvb3Jkcy55LWYueX0pKSxhLmV2ZW50UHJvcHMucHVzaChkKX1hLmRlbHRhLng9dC5jb29yZHMueC10LnBhZ2VDb29yZHMueCxhLmRlbHRhLnk9dC5jb29yZHMueS10LnBhZ2VDb29yZHMueSxhLnJlY3REZWx0YS5sZWZ0PXQucmVjdC5sZWZ0LW8ubGVmdCxhLnJlY3REZWx0YS5yaWdodD10LnJlY3QucmlnaHQtby5yaWdodCxhLnJlY3REZWx0YS50b3A9dC5yZWN0LnRvcC1vLnRvcCxhLnJlY3REZWx0YS5ib3R0b209dC5yZWN0LmJvdHRvbS1vLmJvdHRvbTt2YXIgcD10aGlzLnJlc3VsdC5jb29yZHMsdj10aGlzLnJlc3VsdC5yZWN0O2lmKHAmJnYpe3ZhciBoPWEucmVjdC5sZWZ0IT09di5sZWZ0fHxhLnJlY3QucmlnaHQhPT12LnJpZ2h0fHxhLnJlY3QudG9wIT09di50b3B8fGEucmVjdC5ib3R0b20hPT12LmJvdHRvbTthLmNoYW5nZWQ9aHx8cC54IT09YS5jb29yZHMueHx8cC55IT09YS5jb29yZHMueX1yZXR1cm4gYX19LHtrZXk6XCJhcHBseVRvSW50ZXJhY3Rpb25cIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmludGVyYWN0aW9uLG49dC5waGFzZSxyPWUuY29vcmRzLmN1cixvPWUuY29vcmRzLnN0YXJ0LGk9dGhpcy5yZXN1bHQsYT10aGlzLnN0YXJ0RGVsdGEscz1pLmRlbHRhO1wic3RhcnRcIj09PW4mJigwLGouZGVmYXVsdCkodGhpcy5zdGFydERlbHRhLGkuZGVsdGEpO2Zvcih2YXIgbD0wO2w8W1tvLGFdLFtyLHNdXS5sZW5ndGg7bCsrKXt2YXIgdT1tZShbW28sYV0sW3Isc11dW2xdLDIpLGM9dVswXSxmPXVbMV07Yy5wYWdlLngrPWYueCxjLnBhZ2UueSs9Zi55LGMuY2xpZW50LngrPWYueCxjLmNsaWVudC55Kz1mLnl9dmFyIGQ9dGhpcy5yZXN1bHQucmVjdERlbHRhLHA9dC5yZWN0fHxlLnJlY3Q7cC5sZWZ0Kz1kLmxlZnQscC5yaWdodCs9ZC5yaWdodCxwLnRvcCs9ZC50b3AscC5ib3R0b20rPWQuYm90dG9tLHAud2lkdGg9cC5yaWdodC1wLmxlZnQscC5oZWlnaHQ9cC5ib3R0b20tcC50b3B9fSx7a2V5Olwic2V0QW5kQXBwbHlcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmludGVyYWN0aW9uLG49dC5waGFzZSxyPXQucHJlRW5kLG89dC5za2lwTW9kaWZpZXJzLGk9dGhpcy5zZXRBbGwodGhpcy5maWxsQXJnKHtwcmVFbmQ6cixwaGFzZTpuLHBhZ2VDb29yZHM6dC5tb2RpZmllZENvb3Jkc3x8ZS5jb29yZHMuY3VyLnBhZ2V9KSk7aWYodGhpcy5yZXN1bHQ9aSwhaS5jaGFuZ2VkJiYoIW98fG88dGhpcy5zdGF0ZXMubGVuZ3RoKSYmZS5pbnRlcmFjdGluZygpKXJldHVybiExO2lmKHQubW9kaWZpZWRDb29yZHMpe3ZhciBhPWUuY29vcmRzLmN1ci5wYWdlLHM9e3g6dC5tb2RpZmllZENvb3Jkcy54LWEueCx5OnQubW9kaWZpZWRDb29yZHMueS1hLnl9O2kuY29vcmRzLngrPXMueCxpLmNvb3Jkcy55Kz1zLnksaS5kZWx0YS54Kz1zLngsaS5kZWx0YS55Kz1zLnl9dGhpcy5hcHBseVRvSW50ZXJhY3Rpb24odCl9fSx7a2V5OlwiYmVmb3JlRW5kXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZXZlbnQscj10aGlzLnN0YXRlcztpZihyJiZyLmxlbmd0aCl7Zm9yKHZhciBvPSExLGk9MDtpPHIubGVuZ3RoO2krKyl7dmFyIGE9cltpXTt0LnN0YXRlPWE7dmFyIHM9YS5vcHRpb25zLGw9YS5tZXRob2RzLHU9bC5iZWZvcmVFbmQmJmwuYmVmb3JlRW5kKHQpO2lmKHUpcmV0dXJuIHRoaXMuZW5kUmVzdWx0PXUsITE7bz1vfHwhbyYmdGhpcy5zaG91bGREbyhzLCEwLHQucGhhc2UsITApfW8mJmUubW92ZSh7ZXZlbnQ6bixwcmVFbmQ6ITB9KX19fSx7a2V5Olwic3RvcFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247aWYodGhpcy5zdGF0ZXMmJnRoaXMuc3RhdGVzLmxlbmd0aCl7dmFyIG49KDAsai5kZWZhdWx0KSh7c3RhdGVzOnRoaXMuc3RhdGVzLGludGVyYWN0YWJsZTplLmludGVyYWN0YWJsZSxlbGVtZW50OmUuZWxlbWVudCxyZWN0Om51bGx9LHQpO3RoaXMuZmlsbEFyZyhuKTtmb3IodmFyIHI9MDtyPHRoaXMuc3RhdGVzLmxlbmd0aDtyKyspe3ZhciBvPXRoaXMuc3RhdGVzW3JdO24uc3RhdGU9byxvLm1ldGhvZHMuc3RvcCYmby5tZXRob2RzLnN0b3Aobil9dGhpcy5zdGF0ZXM9bnVsbCx0aGlzLmVuZFJlc3VsdD1udWxsfX19LHtrZXk6XCJwcmVwYXJlU3RhdGVzXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5zdGF0ZXM9W107Zm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspe3ZhciBuPXRbZV0scj1uLm9wdGlvbnMsbz1uLm1ldGhvZHMsaT1uLm5hbWU7dGhpcy5zdGF0ZXMucHVzaCh7b3B0aW9uczpyLG1ldGhvZHM6byxpbmRleDplLG5hbWU6aX0pfXJldHVybiB0aGlzLnN0YXRlc319LHtrZXk6XCJyZXN0b3JlSW50ZXJhY3Rpb25Db29yZHNcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49ZS5jb29yZHMscj1lLnJlY3Qsbz1lLm1vZGlmaWNhdGlvbjtpZihvLnJlc3VsdCl7Zm9yKHZhciBpPW8uc3RhcnREZWx0YSxhPW8ucmVzdWx0LHM9YS5kZWx0YSxsPWEucmVjdERlbHRhLHU9W1tuLnN0YXJ0LGldLFtuLmN1cixzXV0sYz0wO2M8dS5sZW5ndGg7YysrKXt2YXIgZj1tZSh1W2NdLDIpLGQ9ZlswXSxwPWZbMV07ZC5wYWdlLngtPXAueCxkLnBhZ2UueS09cC55LGQuY2xpZW50LngtPXAueCxkLmNsaWVudC55LT1wLnl9ci5sZWZ0LT1sLmxlZnQsci5yaWdodC09bC5yaWdodCxyLnRvcC09bC50b3Asci5ib3R0b20tPWwuYm90dG9tfX19LHtrZXk6XCJzaG91bGREb1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuLHIpe3JldHVybiEoIXR8fCExPT09dC5lbmFibGVkfHxyJiYhdC5lbmRPbmx5fHx0LmVuZE9ubHkmJiFlfHxcInN0YXJ0XCI9PT1uJiYhdC5zZXRTdGFydCl9fSx7a2V5OlwiY29weUZyb21cIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLnN0YXJ0T2Zmc2V0PXQuc3RhcnRPZmZzZXQsdGhpcy5zdGFydERlbHRhPXQuc3RhcnREZWx0YSx0aGlzLmVkZ2VzPXQuZWRnZXMsdGhpcy5zdGF0ZXM9dC5zdGF0ZXMubWFwKChmdW5jdGlvbih0KXtyZXR1cm4oMCxnZS5kZWZhdWx0KSh0KX0pKSx0aGlzLnJlc3VsdD1QZSgoMCxqLmRlZmF1bHQpKHt9LHQucmVzdWx0LmNvb3JkcyksKDAsai5kZWZhdWx0KSh7fSx0LnJlc3VsdC5yZWN0KSl9fSx7a2V5OlwiZGVzdHJveVwiLHZhbHVlOmZ1bmN0aW9uKCl7Zm9yKHZhciB0IGluIHRoaXMpdGhpc1t0XT1udWxsfX1dKSYmeGUoZS5wcm90b3R5cGUsbiksdH0oKTtmdW5jdGlvbiBQZSh0LGUpe3JldHVybntyZWN0OmUsY29vcmRzOnQsZGVsdGE6e3g6MCx5OjB9LHJlY3REZWx0YTp7bGVmdDowLHJpZ2h0OjAsdG9wOjAsYm90dG9tOjB9LGV2ZW50UHJvcHM6W10sY2hhbmdlZDohMH19ZnVuY3Rpb24gT2UodCxlKXtyZXR1cm4gdD97bGVmdDplLngtdC5sZWZ0LHRvcDplLnktdC50b3AscmlnaHQ6dC5yaWdodC1lLngsYm90dG9tOnQuYm90dG9tLWUueX06e2xlZnQ6MCx0b3A6MCxyaWdodDowLGJvdHRvbTowfX15ZS5kZWZhdWx0PV9lO3ZhciBTZT17fTtmdW5jdGlvbiBFZSh0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnJlc3VsdDtuJiYoZS5tb2RpZmllcnM9bi5ldmVudFByb3BzKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoU2UsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksU2UubWFrZU1vZGlmaWVyPWZ1bmN0aW9uKHQsZSl7dmFyIG49dC5kZWZhdWx0cyxyPXtzdGFydDp0LnN0YXJ0LHNldDp0LnNldCxiZWZvcmVFbmQ6dC5iZWZvcmVFbmQsc3RvcDp0LnN0b3B9LG89ZnVuY3Rpb24odCl7dmFyIG89dHx8e307Zm9yKHZhciBpIGluIG8uZW5hYmxlZD0hMSE9PW8uZW5hYmxlZCxuKWkgaW4gb3x8KG9baV09bltpXSk7dmFyIGE9e29wdGlvbnM6byxtZXRob2RzOnIsbmFtZTplLGVuYWJsZTpmdW5jdGlvbigpe3JldHVybiBvLmVuYWJsZWQ9ITAsYX0sZGlzYWJsZTpmdW5jdGlvbigpe3JldHVybiBvLmVuYWJsZWQ9ITEsYX19O3JldHVybiBhfTtyZXR1cm4gZSYmXCJzdHJpbmdcIj09dHlwZW9mIGUmJihvLl9kZWZhdWx0cz1uLG8uX21ldGhvZHM9ciksb30sU2UuYWRkRXZlbnRNb2RpZmllcnM9RWUsU2UuZGVmYXVsdD12b2lkIDA7dmFyIFRlPXtpZDpcIm1vZGlmaWVycy9iYXNlXCIsYmVmb3JlOltcImFjdGlvbnNcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt0LmRlZmF1bHRzLnBlckFjdGlvbi5tb2RpZmllcnM9W119LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtlLm1vZGlmaWNhdGlvbj1uZXcgeWUuZGVmYXVsdChlKX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1zdGFydFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uO2Uuc3RhcnQodCx0LmludGVyYWN0aW9uLmNvb3Jkcy5zdGFydC5wYWdlKSx0LmludGVyYWN0aW9uLmVkZ2VzPWUuZWRnZXMsZS5hcHBseVRvSW50ZXJhY3Rpb24odCl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5zZXRBbmRBcHBseSh0KX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1lbmRcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24uYmVmb3JlRW5kKHQpfSxcImludGVyYWN0aW9uczphY3Rpb24tc3RhcnRcIjpFZSxcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOkVlLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1lbmRcIjpFZSxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24ucmVzdG9yZUludGVyYWN0aW9uQ29vcmRzKHQpfSxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN0b3JlSW50ZXJhY3Rpb25Db29yZHModCl9LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24uc3RvcCh0KX19fTtTZS5kZWZhdWx0PVRlO3ZhciBNZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoTWUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksTWUuZGVmYXVsdHM9dm9pZCAwLE1lLmRlZmF1bHRzPXtiYXNlOntwcmV2ZW50RGVmYXVsdDpcImF1dG9cIixkZWx0YVNvdXJjZTpcInBhZ2VcIn0scGVyQWN0aW9uOntlbmFibGVkOiExLG9yaWdpbjp7eDowLHk6MH19LGFjdGlvbnM6e319O3ZhciBqZT17fTtmdW5jdGlvbiBrZSh0KXtyZXR1cm4oa2U9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIEllKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBEZSh0LGUpe3JldHVybihEZT1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gQWUodCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PWtlKGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP1JlKHQpOmV9ZnVuY3Rpb24gUmUodCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9ZnVuY3Rpb24gemUodCl7cmV0dXJuKHplPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1mdW5jdGlvbiBDZSh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KGplLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGplLkludGVyYWN0RXZlbnQ9dm9pZCAwO3ZhciBGZT1mdW5jdGlvbih0KXshZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7dC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLGUmJkRlKHQsZSl9KGEsdCk7dmFyIGUsbixyLG8saT0ocj1hLG89ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LGU9emUocik7aWYobyl7dmFyIG49emUodGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChlLGFyZ3VtZW50cyxuKX1lbHNlIHQ9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIEFlKHRoaXMsdCl9KTtmdW5jdGlvbiBhKHQsZSxuLHIsbyxzLGwpe3ZhciB1OyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsYSksQ2UoUmUodT1pLmNhbGwodGhpcyx0KSksXCJ0YXJnZXRcIix2b2lkIDApLENlKFJlKHUpLFwiY3VycmVudFRhcmdldFwiLHZvaWQgMCksQ2UoUmUodSksXCJyZWxhdGVkVGFyZ2V0XCIsbnVsbCksQ2UoUmUodSksXCJzY3JlZW5YXCIsdm9pZCAwKSxDZShSZSh1KSxcInNjcmVlbllcIix2b2lkIDApLENlKFJlKHUpLFwiYnV0dG9uXCIsdm9pZCAwKSxDZShSZSh1KSxcImJ1dHRvbnNcIix2b2lkIDApLENlKFJlKHUpLFwiY3RybEtleVwiLHZvaWQgMCksQ2UoUmUodSksXCJzaGlmdEtleVwiLHZvaWQgMCksQ2UoUmUodSksXCJhbHRLZXlcIix2b2lkIDApLENlKFJlKHUpLFwibWV0YUtleVwiLHZvaWQgMCksQ2UoUmUodSksXCJwYWdlXCIsdm9pZCAwKSxDZShSZSh1KSxcImNsaWVudFwiLHZvaWQgMCksQ2UoUmUodSksXCJkZWx0YVwiLHZvaWQgMCksQ2UoUmUodSksXCJyZWN0XCIsdm9pZCAwKSxDZShSZSh1KSxcIngwXCIsdm9pZCAwKSxDZShSZSh1KSxcInkwXCIsdm9pZCAwKSxDZShSZSh1KSxcInQwXCIsdm9pZCAwKSxDZShSZSh1KSxcImR0XCIsdm9pZCAwKSxDZShSZSh1KSxcImR1cmF0aW9uXCIsdm9pZCAwKSxDZShSZSh1KSxcImNsaWVudFgwXCIsdm9pZCAwKSxDZShSZSh1KSxcImNsaWVudFkwXCIsdm9pZCAwKSxDZShSZSh1KSxcInZlbG9jaXR5XCIsdm9pZCAwKSxDZShSZSh1KSxcInNwZWVkXCIsdm9pZCAwKSxDZShSZSh1KSxcInN3aXBlXCIsdm9pZCAwKSxDZShSZSh1KSxcInRpbWVTdGFtcFwiLHZvaWQgMCksQ2UoUmUodSksXCJheGVzXCIsdm9pZCAwKSxDZShSZSh1KSxcInByZUVuZFwiLHZvaWQgMCksbz1vfHx0LmVsZW1lbnQ7dmFyIGM9dC5pbnRlcmFjdGFibGUsZj0oYyYmYy5vcHRpb25zfHxNZS5kZWZhdWx0cykuZGVsdGFTb3VyY2UsZD0oMCxBLmRlZmF1bHQpKGMsbyxuKSxwPVwic3RhcnRcIj09PXIsdj1cImVuZFwiPT09cixoPXA/UmUodSk6dC5wcmV2RXZlbnQsZz1wP3QuY29vcmRzLnN0YXJ0OnY/e3BhZ2U6aC5wYWdlLGNsaWVudDpoLmNsaWVudCx0aW1lU3RhbXA6dC5jb29yZHMuY3VyLnRpbWVTdGFtcH06dC5jb29yZHMuY3VyO3JldHVybiB1LnBhZ2U9KDAsai5kZWZhdWx0KSh7fSxnLnBhZ2UpLHUuY2xpZW50PSgwLGouZGVmYXVsdCkoe30sZy5jbGllbnQpLHUucmVjdD0oMCxqLmRlZmF1bHQpKHt9LHQucmVjdCksdS50aW1lU3RhbXA9Zy50aW1lU3RhbXAsdnx8KHUucGFnZS54LT1kLngsdS5wYWdlLnktPWQueSx1LmNsaWVudC54LT1kLngsdS5jbGllbnQueS09ZC55KSx1LmN0cmxLZXk9ZS5jdHJsS2V5LHUuYWx0S2V5PWUuYWx0S2V5LHUuc2hpZnRLZXk9ZS5zaGlmdEtleSx1Lm1ldGFLZXk9ZS5tZXRhS2V5LHUuYnV0dG9uPWUuYnV0dG9uLHUuYnV0dG9ucz1lLmJ1dHRvbnMsdS50YXJnZXQ9byx1LmN1cnJlbnRUYXJnZXQ9byx1LnByZUVuZD1zLHUudHlwZT1sfHxuKyhyfHxcIlwiKSx1LmludGVyYWN0YWJsZT1jLHUudDA9cD90LnBvaW50ZXJzW3QucG9pbnRlcnMubGVuZ3RoLTFdLmRvd25UaW1lOmgudDAsdS54MD10LmNvb3Jkcy5zdGFydC5wYWdlLngtZC54LHUueTA9dC5jb29yZHMuc3RhcnQucGFnZS55LWQueSx1LmNsaWVudFgwPXQuY29vcmRzLnN0YXJ0LmNsaWVudC54LWQueCx1LmNsaWVudFkwPXQuY29vcmRzLnN0YXJ0LmNsaWVudC55LWQueSx1LmRlbHRhPXB8fHY/e3g6MCx5OjB9Ont4OnVbZl0ueC1oW2ZdLngseTp1W2ZdLnktaFtmXS55fSx1LmR0PXQuY29vcmRzLmRlbHRhLnRpbWVTdGFtcCx1LmR1cmF0aW9uPXUudGltZVN0YW1wLXUudDAsdS52ZWxvY2l0eT0oMCxqLmRlZmF1bHQpKHt9LHQuY29vcmRzLnZlbG9jaXR5W2ZdKSx1LnNwZWVkPSgwLEMuZGVmYXVsdCkodS52ZWxvY2l0eS54LHUudmVsb2NpdHkueSksdS5zd2lwZT12fHxcImluZXJ0aWFzdGFydFwiPT09cj91LmdldFN3aXBlKCk6bnVsbCx1fXJldHVybiBlPWEsKG49W3trZXk6XCJnZXRTd2lwZVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5faW50ZXJhY3Rpb247aWYodC5wcmV2RXZlbnQuc3BlZWQ8NjAwfHx0aGlzLnRpbWVTdGFtcC10LnByZXZFdmVudC50aW1lU3RhbXA+MTUwKXJldHVybiBudWxsO3ZhciBlPTE4MCpNYXRoLmF0YW4yKHQucHJldkV2ZW50LnZlbG9jaXR5WSx0LnByZXZFdmVudC52ZWxvY2l0eVgpL01hdGguUEk7ZTwwJiYoZSs9MzYwKTt2YXIgbj0xMTIuNTw9ZSYmZTwyNDcuNSxyPTIwMi41PD1lJiZlPDMzNy41O3JldHVybnt1cDpyLGRvd246IXImJjIyLjU8PWUmJmU8MTU3LjUsbGVmdDpuLHJpZ2h0OiFuJiYoMjkyLjU8PWV8fGU8NjcuNSksYW5nbGU6ZSxzcGVlZDp0LnByZXZFdmVudC5zcGVlZCx2ZWxvY2l0eTp7eDp0LnByZXZFdmVudC52ZWxvY2l0eVgseTp0LnByZXZFdmVudC52ZWxvY2l0eVl9fX19LHtrZXk6XCJwcmV2ZW50RGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQ9dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fSx7a2V5Olwic3RvcFByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19XSkmJkllKGUucHJvdG90eXBlLG4pLGF9KCQuQmFzZUV2ZW50KTtqZS5JbnRlcmFjdEV2ZW50PUZlLE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZlLnByb3RvdHlwZSx7cGFnZVg6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnBhZ2UueH0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMucGFnZS54PXR9fSxwYWdlWTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucGFnZS55fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5wYWdlLnk9dH19LGNsaWVudFg6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNsaWVudC54fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5jbGllbnQueD10fX0sY2xpZW50WTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2xpZW50Lnl9LHNldDpmdW5jdGlvbih0KXt0aGlzLmNsaWVudC55PXR9fSxkeDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGVsdGEueH0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMuZGVsdGEueD10fX0sZHk6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmRlbHRhLnl9LHNldDpmdW5jdGlvbih0KXt0aGlzLmRlbHRhLnk9dH19LHZlbG9jaXR5WDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmVsb2NpdHkueH0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMudmVsb2NpdHkueD10fX0sdmVsb2NpdHlZOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52ZWxvY2l0eS55fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy52ZWxvY2l0eS55PXR9fX0pO3ZhciBYZT17fTtmdW5jdGlvbiBZZSh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KFhlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFhlLlBvaW50ZXJJbmZvPXZvaWQgMCxYZS5Qb2ludGVySW5mbz1mdW5jdGlvbiB0KGUsbixyLG8saSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxZZSh0aGlzLFwiaWRcIix2b2lkIDApLFllKHRoaXMsXCJwb2ludGVyXCIsdm9pZCAwKSxZZSh0aGlzLFwiZXZlbnRcIix2b2lkIDApLFllKHRoaXMsXCJkb3duVGltZVwiLHZvaWQgMCksWWUodGhpcyxcImRvd25UYXJnZXRcIix2b2lkIDApLHRoaXMuaWQ9ZSx0aGlzLnBvaW50ZXI9bix0aGlzLmV2ZW50PXIsdGhpcy5kb3duVGltZT1vLHRoaXMuZG93blRhcmdldD1pfTt2YXIgQmUsV2UsTGU9e307ZnVuY3Rpb24gVWUodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIFZlKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoTGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KExlLFwiUG9pbnRlckluZm9cIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gWGUuUG9pbnRlckluZm99fSksTGUuZGVmYXVsdD1MZS5JbnRlcmFjdGlvbj1MZS5fUHJveHlNZXRob2RzPUxlLl9Qcm94eVZhbHVlcz12b2lkIDAsTGUuX1Byb3h5VmFsdWVzPUJlLGZ1bmN0aW9uKHQpe3QuaW50ZXJhY3RhYmxlPVwiXCIsdC5lbGVtZW50PVwiXCIsdC5wcmVwYXJlZD1cIlwiLHQucG9pbnRlcklzRG93bj1cIlwiLHQucG9pbnRlcldhc01vdmVkPVwiXCIsdC5fcHJveHk9XCJcIn0oQmV8fChMZS5fUHJveHlWYWx1ZXM9QmU9e30pKSxMZS5fUHJveHlNZXRob2RzPVdlLGZ1bmN0aW9uKHQpe3Quc3RhcnQ9XCJcIix0Lm1vdmU9XCJcIix0LmVuZD1cIlwiLHQuc3RvcD1cIlwiLHQuaW50ZXJhY3Rpbmc9XCJcIn0oV2V8fChMZS5fUHJveHlNZXRob2RzPVdlPXt9KSk7dmFyIE5lPTAscWU9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpe3ZhciBuPXRoaXMscj1lLnBvaW50ZXJUeXBlLG89ZS5zY29wZUZpcmU7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxWZSh0aGlzLFwiaW50ZXJhY3RhYmxlXCIsbnVsbCksVmUodGhpcyxcImVsZW1lbnRcIixudWxsKSxWZSh0aGlzLFwicmVjdFwiLHZvaWQgMCksVmUodGhpcyxcIl9yZWN0c1wiLHZvaWQgMCksVmUodGhpcyxcImVkZ2VzXCIsdm9pZCAwKSxWZSh0aGlzLFwiX3Njb3BlRmlyZVwiLHZvaWQgMCksVmUodGhpcyxcInByZXBhcmVkXCIse25hbWU6bnVsbCxheGlzOm51bGwsZWRnZXM6bnVsbH0pLFZlKHRoaXMsXCJwb2ludGVyVHlwZVwiLHZvaWQgMCksVmUodGhpcyxcInBvaW50ZXJzXCIsW10pLFZlKHRoaXMsXCJkb3duRXZlbnRcIixudWxsKSxWZSh0aGlzLFwiZG93blBvaW50ZXJcIix7fSksVmUodGhpcyxcIl9sYXRlc3RQb2ludGVyXCIse3BvaW50ZXI6bnVsbCxldmVudDpudWxsLGV2ZW50VGFyZ2V0Om51bGx9KSxWZSh0aGlzLFwicHJldkV2ZW50XCIsbnVsbCksVmUodGhpcyxcInBvaW50ZXJJc0Rvd25cIiwhMSksVmUodGhpcyxcInBvaW50ZXJXYXNNb3ZlZFwiLCExKSxWZSh0aGlzLFwiX2ludGVyYWN0aW5nXCIsITEpLFZlKHRoaXMsXCJfZW5kaW5nXCIsITEpLFZlKHRoaXMsXCJfc3RvcHBlZFwiLCEwKSxWZSh0aGlzLFwiX3Byb3h5XCIsbnVsbCksVmUodGhpcyxcInNpbXVsYXRpb25cIixudWxsKSxWZSh0aGlzLFwiZG9Nb3ZlXCIsKDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0KXt0aGlzLm1vdmUodCl9KSxcIlRoZSBpbnRlcmFjdGlvbi5kb01vdmUoKSBtZXRob2QgaGFzIGJlZW4gcmVuYW1lZCB0byBpbnRlcmFjdGlvbi5tb3ZlKClcIikpLFZlKHRoaXMsXCJjb29yZHNcIix7c3RhcnQ6Qi5uZXdDb29yZHMoKSxwcmV2OkIubmV3Q29vcmRzKCksY3VyOkIubmV3Q29vcmRzKCksZGVsdGE6Qi5uZXdDb29yZHMoKSx2ZWxvY2l0eTpCLm5ld0Nvb3JkcygpfSksVmUodGhpcyxcIl9pZFwiLE5lKyspLHRoaXMuX3Njb3BlRmlyZT1vLHRoaXMucG9pbnRlclR5cGU9cjt2YXIgaT10aGlzO3RoaXMuX3Byb3h5PXt9O3ZhciBhPWZ1bmN0aW9uKHQpe09iamVjdC5kZWZpbmVQcm9wZXJ0eShuLl9wcm94eSx0LHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gaVt0XX19KX07Zm9yKHZhciBzIGluIEJlKWEocyk7dmFyIGw9ZnVuY3Rpb24odCl7T2JqZWN0LmRlZmluZVByb3BlcnR5KG4uX3Byb3h5LHQse3ZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIGlbdF0uYXBwbHkoaSxhcmd1bWVudHMpfX0pfTtmb3IodmFyIHUgaW4gV2UpbCh1KTt0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6bmV3XCIse2ludGVyYWN0aW9uOnRoaXN9KX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJwb2ludGVyTW92ZVRvbGVyYW5jZVwiLGdldDpmdW5jdGlvbigpe3JldHVybiAxfX0se2tleTpcInBvaW50ZXJEb3duXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3ZhciByPXRoaXMudXBkYXRlUG9pbnRlcih0LGUsbiwhMCksbz10aGlzLnBvaW50ZXJzW3JdO3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpkb3duXCIse3BvaW50ZXI6dCxldmVudDplLGV2ZW50VGFyZ2V0Om4scG9pbnRlckluZGV4OnIscG9pbnRlckluZm86byx0eXBlOlwiZG93blwiLGludGVyYWN0aW9uOnRoaXN9KX19LHtrZXk6XCJzdGFydFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4hKHRoaXMuaW50ZXJhY3RpbmcoKXx8IXRoaXMucG9pbnRlcklzRG93bnx8dGhpcy5wb2ludGVycy5sZW5ndGg8KFwiZ2VzdHVyZVwiPT09dC5uYW1lPzI6MSl8fCFlLm9wdGlvbnNbdC5uYW1lXS5lbmFibGVkKSYmKCgwLFl0LmNvcHlBY3Rpb24pKHRoaXMucHJlcGFyZWQsdCksdGhpcy5pbnRlcmFjdGFibGU9ZSx0aGlzLmVsZW1lbnQ9bix0aGlzLnJlY3Q9ZS5nZXRSZWN0KG4pLHRoaXMuZWRnZXM9dGhpcy5wcmVwYXJlZC5lZGdlcz8oMCxqLmRlZmF1bHQpKHt9LHRoaXMucHJlcGFyZWQuZWRnZXMpOntsZWZ0OiEwLHJpZ2h0OiEwLHRvcDohMCxib3R0b206ITB9LHRoaXMuX3N0b3BwZWQ9ITEsdGhpcy5faW50ZXJhY3Rpbmc9dGhpcy5fZG9QaGFzZSh7aW50ZXJhY3Rpb246dGhpcyxldmVudDp0aGlzLmRvd25FdmVudCxwaGFzZTpcInN0YXJ0XCJ9KSYmIXRoaXMuX3N0b3BwZWQsdGhpcy5faW50ZXJhY3RpbmcpfX0se2tleTpcInBvaW50ZXJNb3ZlXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3RoaXMuc2ltdWxhdGlvbnx8dGhpcy5tb2RpZmljYXRpb24mJnRoaXMubW9kaWZpY2F0aW9uLmVuZFJlc3VsdHx8dGhpcy51cGRhdGVQb2ludGVyKHQsZSxuLCExKTt2YXIgcixvLGk9dGhpcy5jb29yZHMuY3VyLnBhZ2UueD09PXRoaXMuY29vcmRzLnByZXYucGFnZS54JiZ0aGlzLmNvb3Jkcy5jdXIucGFnZS55PT09dGhpcy5jb29yZHMucHJldi5wYWdlLnkmJnRoaXMuY29vcmRzLmN1ci5jbGllbnQueD09PXRoaXMuY29vcmRzLnByZXYuY2xpZW50LngmJnRoaXMuY29vcmRzLmN1ci5jbGllbnQueT09PXRoaXMuY29vcmRzLnByZXYuY2xpZW50Lnk7dGhpcy5wb2ludGVySXNEb3duJiYhdGhpcy5wb2ludGVyV2FzTW92ZWQmJihyPXRoaXMuY29vcmRzLmN1ci5jbGllbnQueC10aGlzLmNvb3Jkcy5zdGFydC5jbGllbnQueCxvPXRoaXMuY29vcmRzLmN1ci5jbGllbnQueS10aGlzLmNvb3Jkcy5zdGFydC5jbGllbnQueSx0aGlzLnBvaW50ZXJXYXNNb3ZlZD0oMCxDLmRlZmF1bHQpKHIsbyk+dGhpcy5wb2ludGVyTW92ZVRvbGVyYW5jZSk7dmFyIGE9dGhpcy5nZXRQb2ludGVySW5kZXgodCkscz17cG9pbnRlcjp0LHBvaW50ZXJJbmRleDphLHBvaW50ZXJJbmZvOnRoaXMucG9pbnRlcnNbYV0sZXZlbnQ6ZSx0eXBlOlwibW92ZVwiLGV2ZW50VGFyZ2V0Om4sZHg6cixkeTpvLGR1cGxpY2F0ZTppLGludGVyYWN0aW9uOnRoaXN9O2l8fEIuc2V0Q29vcmRWZWxvY2l0eSh0aGlzLmNvb3Jkcy52ZWxvY2l0eSx0aGlzLmNvb3Jkcy5kZWx0YSksdGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOm1vdmVcIixzKSxpfHx0aGlzLnNpbXVsYXRpb258fCh0aGlzLmludGVyYWN0aW5nKCkmJihzLnR5cGU9bnVsbCx0aGlzLm1vdmUocykpLHRoaXMucG9pbnRlcldhc01vdmVkJiZCLmNvcHlDb29yZHModGhpcy5jb29yZHMucHJldix0aGlzLmNvb3Jkcy5jdXIpKX19LHtrZXk6XCJtb3ZlXCIsdmFsdWU6ZnVuY3Rpb24odCl7dCYmdC5ldmVudHx8Qi5zZXRaZXJvQ29vcmRzKHRoaXMuY29vcmRzLmRlbHRhKSwodD0oMCxqLmRlZmF1bHQpKHtwb2ludGVyOnRoaXMuX2xhdGVzdFBvaW50ZXIucG9pbnRlcixldmVudDp0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50LGV2ZW50VGFyZ2V0OnRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnRUYXJnZXQsaW50ZXJhY3Rpb246dGhpc30sdHx8e30pKS5waGFzZT1cIm1vdmVcIix0aGlzLl9kb1BoYXNlKHQpfX0se2tleTpcInBvaW50ZXJVcFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuLHIpe3ZhciBvPXRoaXMuZ2V0UG9pbnRlckluZGV4KHQpOy0xPT09byYmKG89dGhpcy51cGRhdGVQb2ludGVyKHQsZSxuLCExKSk7dmFyIGk9L2NhbmNlbCQvaS50ZXN0KGUudHlwZSk/XCJjYW5jZWxcIjpcInVwXCI7dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOlwiLmNvbmNhdChpKSx7cG9pbnRlcjp0LHBvaW50ZXJJbmRleDpvLHBvaW50ZXJJbmZvOnRoaXMucG9pbnRlcnNbb10sZXZlbnQ6ZSxldmVudFRhcmdldDpuLHR5cGU6aSxjdXJFdmVudFRhcmdldDpyLGludGVyYWN0aW9uOnRoaXN9KSx0aGlzLnNpbXVsYXRpb258fHRoaXMuZW5kKGUpLHRoaXMucmVtb3ZlUG9pbnRlcih0LGUpfX0se2tleTpcImRvY3VtZW50Qmx1clwiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuZW5kKHQpLHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpibHVyXCIse2V2ZW50OnQsdHlwZTpcImJsdXJcIixpbnRlcmFjdGlvbjp0aGlzfSl9fSx7a2V5OlwiZW5kXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU7dGhpcy5fZW5kaW5nPSEwLHQ9dHx8dGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudCx0aGlzLmludGVyYWN0aW5nKCkmJihlPXRoaXMuX2RvUGhhc2Uoe2V2ZW50OnQsaW50ZXJhY3Rpb246dGhpcyxwaGFzZTpcImVuZFwifSkpLHRoaXMuX2VuZGluZz0hMSwhMD09PWUmJnRoaXMuc3RvcCgpfX0se2tleTpcImN1cnJlbnRBY3Rpb25cIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pbnRlcmFjdGluZz90aGlzLnByZXBhcmVkLm5hbWU6bnVsbH19LHtrZXk6XCJpbnRlcmFjdGluZ1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2ludGVyYWN0aW5nfX0se2tleTpcInN0b3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpzdG9wXCIse2ludGVyYWN0aW9uOnRoaXN9KSx0aGlzLmludGVyYWN0YWJsZT10aGlzLmVsZW1lbnQ9bnVsbCx0aGlzLl9pbnRlcmFjdGluZz0hMSx0aGlzLl9zdG9wcGVkPSEwLHRoaXMucHJlcGFyZWQubmFtZT10aGlzLnByZXZFdmVudD1udWxsfX0se2tleTpcImdldFBvaW50ZXJJbmRleFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPUIuZ2V0UG9pbnRlcklkKHQpO3JldHVyblwibW91c2VcIj09PXRoaXMucG9pbnRlclR5cGV8fFwicGVuXCI9PT10aGlzLnBvaW50ZXJUeXBlP3RoaXMucG9pbnRlcnMubGVuZ3RoLTE6Wi5maW5kSW5kZXgodGhpcy5wb2ludGVycywoZnVuY3Rpb24odCl7cmV0dXJuIHQuaWQ9PT1lfSkpfX0se2tleTpcImdldFBvaW50ZXJJbmZvXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMucG9pbnRlcnNbdGhpcy5nZXRQb2ludGVySW5kZXgodCldfX0se2tleTpcInVwZGF0ZVBvaW50ZXJcIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXt2YXIgbz1CLmdldFBvaW50ZXJJZCh0KSxpPXRoaXMuZ2V0UG9pbnRlckluZGV4KHQpLGE9dGhpcy5wb2ludGVyc1tpXTtyZXR1cm4gcj0hMSE9PXImJihyfHwvKGRvd258c3RhcnQpJC9pLnRlc3QoZS50eXBlKSksYT9hLnBvaW50ZXI9dDooYT1uZXcgWGUuUG9pbnRlckluZm8obyx0LGUsbnVsbCxudWxsKSxpPXRoaXMucG9pbnRlcnMubGVuZ3RoLHRoaXMucG9pbnRlcnMucHVzaChhKSksQi5zZXRDb29yZHModGhpcy5jb29yZHMuY3VyLHRoaXMucG9pbnRlcnMubWFwKChmdW5jdGlvbih0KXtyZXR1cm4gdC5wb2ludGVyfSkpLHRoaXMuX25vdygpKSxCLnNldENvb3JkRGVsdGFzKHRoaXMuY29vcmRzLmRlbHRhLHRoaXMuY29vcmRzLnByZXYsdGhpcy5jb29yZHMuY3VyKSxyJiYodGhpcy5wb2ludGVySXNEb3duPSEwLGEuZG93blRpbWU9dGhpcy5jb29yZHMuY3VyLnRpbWVTdGFtcCxhLmRvd25UYXJnZXQ9bixCLnBvaW50ZXJFeHRlbmQodGhpcy5kb3duUG9pbnRlcix0KSx0aGlzLmludGVyYWN0aW5nKCl8fChCLmNvcHlDb29yZHModGhpcy5jb29yZHMuc3RhcnQsdGhpcy5jb29yZHMuY3VyKSxCLmNvcHlDb29yZHModGhpcy5jb29yZHMucHJldix0aGlzLmNvb3Jkcy5jdXIpLHRoaXMuZG93bkV2ZW50PWUsdGhpcy5wb2ludGVyV2FzTW92ZWQ9ITEpKSx0aGlzLl91cGRhdGVMYXRlc3RQb2ludGVyKHQsZSxuKSx0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6dXBkYXRlLXBvaW50ZXJcIix7cG9pbnRlcjp0LGV2ZW50OmUsZXZlbnRUYXJnZXQ6bixkb3duOnIscG9pbnRlckluZm86YSxwb2ludGVySW5kZXg6aSxpbnRlcmFjdGlvbjp0aGlzfSksaX19LHtrZXk6XCJyZW1vdmVQb2ludGVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj10aGlzLmdldFBvaW50ZXJJbmRleCh0KTtpZigtMSE9PW4pe3ZhciByPXRoaXMucG9pbnRlcnNbbl07dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOnJlbW92ZS1wb2ludGVyXCIse3BvaW50ZXI6dCxldmVudDplLGV2ZW50VGFyZ2V0Om51bGwscG9pbnRlckluZGV4Om4scG9pbnRlckluZm86cixpbnRlcmFjdGlvbjp0aGlzfSksdGhpcy5wb2ludGVycy5zcGxpY2UobiwxKSx0aGlzLnBvaW50ZXJJc0Rvd249ITF9fX0se2tleTpcIl91cGRhdGVMYXRlc3RQb2ludGVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3RoaXMuX2xhdGVzdFBvaW50ZXIucG9pbnRlcj10LHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnQ9ZSx0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50VGFyZ2V0PW59fSx7a2V5OlwiZGVzdHJveVwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fbGF0ZXN0UG9pbnRlci5wb2ludGVyPW51bGwsdGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudD1udWxsLHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnRUYXJnZXQ9bnVsbH19LHtrZXk6XCJfY3JlYXRlUHJlcGFyZWRFdmVudFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuLHIpe3JldHVybiBuZXcgamUuSW50ZXJhY3RFdmVudCh0aGlzLHQsdGhpcy5wcmVwYXJlZC5uYW1lLGUsdGhpcy5lbGVtZW50LG4scil9fSx7a2V5OlwiX2ZpcmVFdmVudFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuaW50ZXJhY3RhYmxlLmZpcmUodCksKCF0aGlzLnByZXZFdmVudHx8dC50aW1lU3RhbXA+PXRoaXMucHJldkV2ZW50LnRpbWVTdGFtcCkmJih0aGlzLnByZXZFdmVudD10KX19LHtrZXk6XCJfZG9QaGFzZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZXZlbnQsbj10LnBoYXNlLHI9dC5wcmVFbmQsbz10LnR5cGUsaT10aGlzLnJlY3Q7aWYoaSYmXCJtb3ZlXCI9PT1uJiYoay5hZGRFZGdlcyh0aGlzLmVkZ2VzLGksdGhpcy5jb29yZHMuZGVsdGFbdGhpcy5pbnRlcmFjdGFibGUub3B0aW9ucy5kZWx0YVNvdXJjZV0pLGkud2lkdGg9aS5yaWdodC1pLmxlZnQsaS5oZWlnaHQ9aS5ib3R0b20taS50b3ApLCExPT09dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tXCIuY29uY2F0KG4pLHQpKXJldHVybiExO3ZhciBhPXQuaUV2ZW50PXRoaXMuX2NyZWF0ZVByZXBhcmVkRXZlbnQoZSxuLHIsbyk7cmV0dXJuIHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczphY3Rpb24tXCIuY29uY2F0KG4pLHQpLFwic3RhcnRcIj09PW4mJih0aGlzLnByZXZFdmVudD1hKSx0aGlzLl9maXJlRXZlbnQoYSksdGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1cIi5jb25jYXQobiksdCksITB9fSx7a2V5OlwiX25vd1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIERhdGUubm93KCl9fV0pJiZVZShlLnByb3RvdHlwZSxuKSx0fSgpO0xlLkludGVyYWN0aW9uPXFlO3ZhciAkZT1xZTtMZS5kZWZhdWx0PSRlO3ZhciBHZT17fTtmdW5jdGlvbiBIZSh0KXt0LnBvaW50ZXJJc0Rvd24mJihRZSh0LmNvb3Jkcy5jdXIsdC5vZmZzZXQudG90YWwpLHQub2Zmc2V0LnBlbmRpbmcueD0wLHQub2Zmc2V0LnBlbmRpbmcueT0wKX1mdW5jdGlvbiBLZSh0KXtaZSh0LmludGVyYWN0aW9uKX1mdW5jdGlvbiBaZSh0KXtpZighZnVuY3Rpb24odCl7cmV0dXJuISghdC5vZmZzZXQucGVuZGluZy54JiYhdC5vZmZzZXQucGVuZGluZy55KX0odCkpcmV0dXJuITE7dmFyIGU9dC5vZmZzZXQucGVuZGluZztyZXR1cm4gUWUodC5jb29yZHMuY3VyLGUpLFFlKHQuY29vcmRzLmRlbHRhLGUpLGsuYWRkRWRnZXModC5lZGdlcyx0LnJlY3QsZSksZS54PTAsZS55PTAsITB9ZnVuY3Rpb24gSmUodCl7dmFyIGU9dC54LG49dC55O3RoaXMub2Zmc2V0LnBlbmRpbmcueCs9ZSx0aGlzLm9mZnNldC5wZW5kaW5nLnkrPW4sdGhpcy5vZmZzZXQudG90YWwueCs9ZSx0aGlzLm9mZnNldC50b3RhbC55Kz1ufWZ1bmN0aW9uIFFlKHQsZSl7dmFyIG49dC5wYWdlLHI9dC5jbGllbnQsbz1lLngsaT1lLnk7bi54Kz1vLG4ueSs9aSxyLngrPW8sci55Kz1pfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShHZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxHZS5hZGRUb3RhbD1IZSxHZS5hcHBseVBlbmRpbmc9WmUsR2UuZGVmYXVsdD12b2lkIDAsTGUuX1Byb3h5TWV0aG9kcy5vZmZzZXRCeT1cIlwiO3ZhciB0bj17aWQ6XCJvZmZzZXRcIixiZWZvcmU6W1wibW9kaWZpZXJzXCIsXCJwb2ludGVyLWV2ZW50c1wiLFwiYWN0aW9uc1wiLFwiaW5lcnRpYVwiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3QuSW50ZXJhY3Rpb24ucHJvdG90eXBlLm9mZnNldEJ5PUplfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24ub2Zmc2V0PXt0b3RhbDp7eDowLHk6MH0scGVuZGluZzp7eDowLHk6MH19fSxcImludGVyYWN0aW9uczp1cGRhdGUtcG9pbnRlclwiOmZ1bmN0aW9uKHQpe3JldHVybiBIZSh0LmludGVyYWN0aW9uKX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1zdGFydFwiOktlLFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tbW92ZVwiOktlLFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtpZihaZShlKSlyZXR1cm4gZS5tb3ZlKHtvZmZzZXQ6ITB9KSxlLmVuZCgpLCExfSxcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtlLm9mZnNldC50b3RhbC54PTAsZS5vZmZzZXQudG90YWwueT0wLGUub2Zmc2V0LnBlbmRpbmcueD0wLGUub2Zmc2V0LnBlbmRpbmcueT0wfX19O0dlLmRlZmF1bHQ9dG47dmFyIGVuPXt9O2Z1bmN0aW9uIG5uKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBybih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KGVuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGVuLmRlZmF1bHQ9ZW4uSW5lcnRpYVN0YXRlPXZvaWQgMDt2YXIgb249ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCkscm4odGhpcyxcImFjdGl2ZVwiLCExKSxybih0aGlzLFwiaXNNb2RpZmllZFwiLCExKSxybih0aGlzLFwic21vb3RoRW5kXCIsITEpLHJuKHRoaXMsXCJhbGxvd1Jlc3VtZVwiLCExKSxybih0aGlzLFwibW9kaWZpY2F0aW9uXCIsdm9pZCAwKSxybih0aGlzLFwibW9kaWZpZXJDb3VudFwiLDApLHJuKHRoaXMsXCJtb2RpZmllckFyZ1wiLHZvaWQgMCkscm4odGhpcyxcInN0YXJ0Q29vcmRzXCIsdm9pZCAwKSxybih0aGlzLFwidDBcIiwwKSxybih0aGlzLFwidjBcIiwwKSxybih0aGlzLFwidGVcIiwwKSxybih0aGlzLFwidGFyZ2V0T2Zmc2V0XCIsdm9pZCAwKSxybih0aGlzLFwibW9kaWZpZWRPZmZzZXRcIix2b2lkIDApLHJuKHRoaXMsXCJjdXJyZW50T2Zmc2V0XCIsdm9pZCAwKSxybih0aGlzLFwibGFtYmRhX3YwXCIsMCkscm4odGhpcyxcIm9uZV92ZV92MFwiLDApLHJuKHRoaXMsXCJ0aW1lb3V0XCIsdm9pZCAwKSxybih0aGlzLFwiaW50ZXJhY3Rpb25cIix2b2lkIDApLHRoaXMuaW50ZXJhY3Rpb249ZX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJzdGFydFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuaW50ZXJhY3Rpb24sbj1hbihlKTtpZighbnx8IW4uZW5hYmxlZClyZXR1cm4hMTt2YXIgcj1lLmNvb3Jkcy52ZWxvY2l0eS5jbGllbnQsbz0oMCxDLmRlZmF1bHQpKHIueCxyLnkpLGk9dGhpcy5tb2RpZmljYXRpb258fCh0aGlzLm1vZGlmaWNhdGlvbj1uZXcgeWUuZGVmYXVsdChlKSk7aWYoaS5jb3B5RnJvbShlLm1vZGlmaWNhdGlvbiksdGhpcy50MD1lLl9ub3coKSx0aGlzLmFsbG93UmVzdW1lPW4uYWxsb3dSZXN1bWUsdGhpcy52MD1vLHRoaXMuY3VycmVudE9mZnNldD17eDowLHk6MH0sdGhpcy5zdGFydENvb3Jkcz1lLmNvb3Jkcy5jdXIucGFnZSx0aGlzLm1vZGlmaWVyQXJnPWkuZmlsbEFyZyh7cGFnZUNvb3Jkczp0aGlzLnN0YXJ0Q29vcmRzLHByZUVuZDohMCxwaGFzZTpcImluZXJ0aWFzdGFydFwifSksdGhpcy50MC1lLmNvb3Jkcy5jdXIudGltZVN0YW1wPDUwJiZvPm4ubWluU3BlZWQmJm8+bi5lbmRTcGVlZCl0aGlzLnN0YXJ0SW5lcnRpYSgpO2Vsc2V7aWYoaS5yZXN1bHQ9aS5zZXRBbGwodGhpcy5tb2RpZmllckFyZyksIWkucmVzdWx0LmNoYW5nZWQpcmV0dXJuITE7dGhpcy5zdGFydFNtb290aEVuZCgpfXJldHVybiBlLm1vZGlmaWNhdGlvbi5yZXN1bHQucmVjdD1udWxsLGUub2Zmc2V0QnkodGhpcy50YXJnZXRPZmZzZXQpLGUuX2RvUGhhc2Uoe2ludGVyYWN0aW9uOmUsZXZlbnQ6dCxwaGFzZTpcImluZXJ0aWFzdGFydFwifSksZS5vZmZzZXRCeSh7eDotdGhpcy50YXJnZXRPZmZzZXQueCx5Oi10aGlzLnRhcmdldE9mZnNldC55fSksZS5tb2RpZmljYXRpb24ucmVzdWx0LnJlY3Q9bnVsbCx0aGlzLmFjdGl2ZT0hMCxlLnNpbXVsYXRpb249dGhpcywhMH19LHtrZXk6XCJzdGFydEluZXJ0aWFcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMsZT10aGlzLmludGVyYWN0aW9uLmNvb3Jkcy52ZWxvY2l0eS5jbGllbnQsbj1hbih0aGlzLmludGVyYWN0aW9uKSxyPW4ucmVzaXN0YW5jZSxvPS1NYXRoLmxvZyhuLmVuZFNwZWVkL3RoaXMudjApL3I7dGhpcy50YXJnZXRPZmZzZXQ9e3g6KGUueC1vKS9yLHk6KGUueS1vKS9yfSx0aGlzLnRlPW8sdGhpcy5sYW1iZGFfdjA9ci90aGlzLnYwLHRoaXMub25lX3ZlX3YwPTEtbi5lbmRTcGVlZC90aGlzLnYwO3ZhciBpPXRoaXMubW9kaWZpY2F0aW9uLGE9dGhpcy5tb2RpZmllckFyZzthLnBhZ2VDb29yZHM9e3g6dGhpcy5zdGFydENvb3Jkcy54K3RoaXMudGFyZ2V0T2Zmc2V0LngseTp0aGlzLnN0YXJ0Q29vcmRzLnkrdGhpcy50YXJnZXRPZmZzZXQueX0saS5yZXN1bHQ9aS5zZXRBbGwoYSksaS5yZXN1bHQuY2hhbmdlZCYmKHRoaXMuaXNNb2RpZmllZD0hMCx0aGlzLm1vZGlmaWVkT2Zmc2V0PXt4OnRoaXMudGFyZ2V0T2Zmc2V0LngraS5yZXN1bHQuZGVsdGEueCx5OnRoaXMudGFyZ2V0T2Zmc2V0LnkraS5yZXN1bHQuZGVsdGEueX0pLHRoaXMub25OZXh0RnJhbWUoKGZ1bmN0aW9uKCl7cmV0dXJuIHQuaW5lcnRpYVRpY2soKX0pKX19LHtrZXk6XCJzdGFydFNtb290aEVuZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpczt0aGlzLnNtb290aEVuZD0hMCx0aGlzLmlzTW9kaWZpZWQ9ITAsdGhpcy50YXJnZXRPZmZzZXQ9e3g6dGhpcy5tb2RpZmljYXRpb24ucmVzdWx0LmRlbHRhLngseTp0aGlzLm1vZGlmaWNhdGlvbi5yZXN1bHQuZGVsdGEueX0sdGhpcy5vbk5leHRGcmFtZSgoZnVuY3Rpb24oKXtyZXR1cm4gdC5zbW9vdGhFbmRUaWNrKCl9KSl9fSx7a2V5Olwib25OZXh0RnJhbWVcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzO3RoaXMudGltZW91dD1qdC5kZWZhdWx0LnJlcXVlc3QoKGZ1bmN0aW9uKCl7ZS5hY3RpdmUmJnQoKX0pKX19LHtrZXk6XCJpbmVydGlhVGlja1wiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQsZSxuLHIsbyxpPXRoaXMsYT10aGlzLmludGVyYWN0aW9uLHM9YW4oYSkucmVzaXN0YW5jZSxsPShhLl9ub3coKS10aGlzLnQwKS8xZTM7aWYobDx0aGlzLnRlKXt2YXIgdSxjPTEtKE1hdGguZXhwKC1zKmwpLXRoaXMubGFtYmRhX3YwKS90aGlzLm9uZV92ZV92MDt0aGlzLmlzTW9kaWZpZWQ/KDAsMCx0PXRoaXMudGFyZ2V0T2Zmc2V0LngsZT10aGlzLnRhcmdldE9mZnNldC55LG49dGhpcy5tb2RpZmllZE9mZnNldC54LHI9dGhpcy5tb2RpZmllZE9mZnNldC55LHU9e3g6c24obz1jLDAsdCxuKSx5OnNuKG8sMCxlLHIpfSk6dT17eDp0aGlzLnRhcmdldE9mZnNldC54KmMseTp0aGlzLnRhcmdldE9mZnNldC55KmN9O3ZhciBmPXt4OnUueC10aGlzLmN1cnJlbnRPZmZzZXQueCx5OnUueS10aGlzLmN1cnJlbnRPZmZzZXQueX07dGhpcy5jdXJyZW50T2Zmc2V0LngrPWYueCx0aGlzLmN1cnJlbnRPZmZzZXQueSs9Zi55LGEub2Zmc2V0QnkoZiksYS5tb3ZlKCksdGhpcy5vbk5leHRGcmFtZSgoZnVuY3Rpb24oKXtyZXR1cm4gaS5pbmVydGlhVGljaygpfSkpfWVsc2UgYS5vZmZzZXRCeSh7eDp0aGlzLm1vZGlmaWVkT2Zmc2V0LngtdGhpcy5jdXJyZW50T2Zmc2V0LngseTp0aGlzLm1vZGlmaWVkT2Zmc2V0LnktdGhpcy5jdXJyZW50T2Zmc2V0Lnl9KSx0aGlzLmVuZCgpfX0se2tleTpcInNtb290aEVuZFRpY2tcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMsZT10aGlzLmludGVyYWN0aW9uLG49ZS5fbm93KCktdGhpcy50MCxyPWFuKGUpLnNtb290aEVuZER1cmF0aW9uO2lmKG48cil7dmFyIG89e3g6bG4obiwwLHRoaXMudGFyZ2V0T2Zmc2V0LngscikseTpsbihuLDAsdGhpcy50YXJnZXRPZmZzZXQueSxyKX0saT17eDpvLngtdGhpcy5jdXJyZW50T2Zmc2V0LngseTpvLnktdGhpcy5jdXJyZW50T2Zmc2V0Lnl9O3RoaXMuY3VycmVudE9mZnNldC54Kz1pLngsdGhpcy5jdXJyZW50T2Zmc2V0LnkrPWkueSxlLm9mZnNldEJ5KGkpLGUubW92ZSh7c2tpcE1vZGlmaWVyczp0aGlzLm1vZGlmaWVyQ291bnR9KSx0aGlzLm9uTmV4dEZyYW1lKChmdW5jdGlvbigpe3JldHVybiB0LnNtb290aEVuZFRpY2soKX0pKX1lbHNlIGUub2Zmc2V0Qnkoe3g6dGhpcy50YXJnZXRPZmZzZXQueC10aGlzLmN1cnJlbnRPZmZzZXQueCx5OnRoaXMudGFyZ2V0T2Zmc2V0LnktdGhpcy5jdXJyZW50T2Zmc2V0Lnl9KSx0aGlzLmVuZCgpfX0se2tleTpcInJlc3VtZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQucG9pbnRlcixuPXQuZXZlbnQscj10LmV2ZW50VGFyZ2V0LG89dGhpcy5pbnRlcmFjdGlvbjtvLm9mZnNldEJ5KHt4Oi10aGlzLmN1cnJlbnRPZmZzZXQueCx5Oi10aGlzLmN1cnJlbnRPZmZzZXQueX0pLG8udXBkYXRlUG9pbnRlcihlLG4sciwhMCksby5fZG9QaGFzZSh7aW50ZXJhY3Rpb246byxldmVudDpuLHBoYXNlOlwicmVzdW1lXCJ9KSwoMCxCLmNvcHlDb29yZHMpKG8uY29vcmRzLnByZXYsby5jb29yZHMuY3VyKSx0aGlzLnN0b3AoKX19LHtrZXk6XCJlbmRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuaW50ZXJhY3Rpb24ubW92ZSgpLHRoaXMuaW50ZXJhY3Rpb24uZW5kKCksdGhpcy5zdG9wKCl9fSx7a2V5Olwic3RvcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5hY3RpdmU9dGhpcy5zbW9vdGhFbmQ9ITEsdGhpcy5pbnRlcmFjdGlvbi5zaW11bGF0aW9uPW51bGwsanQuZGVmYXVsdC5jYW5jZWwodGhpcy50aW1lb3V0KX19XSkmJm5uKGUucHJvdG90eXBlLG4pLHR9KCk7ZnVuY3Rpb24gYW4odCl7dmFyIGU9dC5pbnRlcmFjdGFibGUsbj10LnByZXBhcmVkO3JldHVybiBlJiZlLm9wdGlvbnMmJm4ubmFtZSYmZS5vcHRpb25zW24ubmFtZV0uaW5lcnRpYX1mdW5jdGlvbiBzbih0LGUsbixyKXt2YXIgbz0xLXQ7cmV0dXJuIG8qbyplKzIqbyp0Km4rdCp0KnJ9ZnVuY3Rpb24gbG4odCxlLG4scil7cmV0dXJuLW4qKHQvPXIpKih0LTIpK2V9ZW4uSW5lcnRpYVN0YXRlPW9uO3ZhciB1bj17aWQ6XCJpbmVydGlhXCIsYmVmb3JlOltcIm1vZGlmaWVyc1wiLFwiYWN0aW9uc1wiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVmYXVsdHM7dC51c2VQbHVnaW4oR2UuZGVmYXVsdCksdC51c2VQbHVnaW4oU2UuZGVmYXVsdCksdC5hY3Rpb25zLnBoYXNlcy5pbmVydGlhc3RhcnQ9ITAsdC5hY3Rpb25zLnBoYXNlcy5yZXN1bWU9ITAsZS5wZXJBY3Rpb24uaW5lcnRpYT17ZW5hYmxlZDohMSxyZXNpc3RhbmNlOjEwLG1pblNwZWVkOjEwMCxlbmRTcGVlZDoxMCxhbGxvd1Jlc3VtZTohMCxzbW9vdGhFbmREdXJhdGlvbjozMDB9fSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5pbmVydGlhPW5ldyBvbihlKX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1lbmRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5ldmVudDtyZXR1cm4oIWUuX2ludGVyYWN0aW5nfHxlLnNpbXVsYXRpb258fCFlLmluZXJ0aWEuc3RhcnQobikpJiZudWxsfSxcImludGVyYWN0aW9uczpkb3duXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZXZlbnRUYXJnZXQscj1lLmluZXJ0aWE7aWYoci5hY3RpdmUpZm9yKHZhciBvPW47aS5kZWZhdWx0LmVsZW1lbnQobyk7KXtpZihvPT09ZS5lbGVtZW50KXtyLnJlc3VtZSh0KTticmVha31vPV8ucGFyZW50Tm9kZShvKX19LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLmluZXJ0aWE7ZS5hY3RpdmUmJmUuc3RvcCgpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLXJlc3VtZVwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uO2Uuc3RvcCh0KSxlLnN0YXJ0KHQsdC5pbnRlcmFjdGlvbi5jb29yZHMuY3VyLnBhZ2UpLGUuYXBwbHlUb0ludGVyYWN0aW9uKHQpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLWluZXJ0aWFzdGFydFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5zZXRBbmRBcHBseSh0KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLXJlc3VtZVwiOlNlLmFkZEV2ZW50TW9kaWZpZXJzLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1pbmVydGlhc3RhcnRcIjpTZS5hZGRFdmVudE1vZGlmaWVycyxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24taW5lcnRpYXN0YXJ0XCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnJlc3RvcmVJbnRlcmFjdGlvbkNvb3Jkcyh0KX0sXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLXJlc3VtZVwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN0b3JlSW50ZXJhY3Rpb25Db29yZHModCl9fX07ZW4uZGVmYXVsdD11bjt2YXIgY249e307ZnVuY3Rpb24gZm4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIGRuKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1mdW5jdGlvbiBwbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO2lmKHQuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkKWJyZWFrO3IodCl9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxjbi5FdmVudGFibGU9dm9pZCAwO3ZhciB2bj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxkbih0aGlzLFwib3B0aW9uc1wiLHZvaWQgMCksZG4odGhpcyxcInR5cGVzXCIse30pLGRuKHRoaXMsXCJwcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksZG4odGhpcyxcImltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKSxkbih0aGlzLFwiZ2xvYmFsXCIsdm9pZCAwKSx0aGlzLm9wdGlvbnM9KDAsai5kZWZhdWx0KSh7fSxlfHx7fSl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwiZmlyZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlLG49dGhpcy5nbG9iYWw7KGU9dGhpcy50eXBlc1t0LnR5cGVdKSYmcG4odCxlKSwhdC5wcm9wYWdhdGlvblN0b3BwZWQmJm4mJihlPW5bdC50eXBlXSkmJnBuKHQsZSl9fSx7a2V5Olwib25cIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPSgwLFIuZGVmYXVsdCkodCxlKTtmb3IodCBpbiBuKXRoaXMudHlwZXNbdF09Wi5tZXJnZSh0aGlzLnR5cGVzW3RdfHxbXSxuW3RdKX19LHtrZXk6XCJvZmZcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPSgwLFIuZGVmYXVsdCkodCxlKTtmb3IodCBpbiBuKXt2YXIgcj10aGlzLnR5cGVzW3RdO2lmKHImJnIubGVuZ3RoKWZvcih2YXIgbz0wO288blt0XS5sZW5ndGg7bysrKXt2YXIgaT1uW3RdW29dLGE9ci5pbmRleE9mKGkpOy0xIT09YSYmci5zcGxpY2UoYSwxKX19fX0se2tleTpcImdldFJlY3RcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gbnVsbH19XSkmJmZuKGUucHJvdG90eXBlLG4pLHR9KCk7Y24uRXZlbnRhYmxlPXZuO3ZhciBobj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoaG4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaG4uZGVmYXVsdD1mdW5jdGlvbih0LGUpe2lmKGUucGhhc2VsZXNzVHlwZXNbdF0pcmV0dXJuITA7Zm9yKHZhciBuIGluIGUubWFwKWlmKDA9PT10LmluZGV4T2YobikmJnQuc3Vic3RyKG4ubGVuZ3RoKWluIGUucGhhc2VzKXJldHVybiEwO3JldHVybiExfTt2YXIgZ249e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGduLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGduLmNyZWF0ZUludGVyYWN0U3RhdGljPWZ1bmN0aW9uKHQpe3ZhciBlPWZ1bmN0aW9uIGUobixyKXt2YXIgbz10LmludGVyYWN0YWJsZXMuZ2V0KG4scik7cmV0dXJuIG98fCgobz10LmludGVyYWN0YWJsZXMubmV3KG4scikpLmV2ZW50cy5nbG9iYWw9ZS5nbG9iYWxFdmVudHMpLG99O3JldHVybiBlLmdldFBvaW50ZXJBdmVyYWdlPUIucG9pbnRlckF2ZXJhZ2UsZS5nZXRUb3VjaEJCb3g9Qi50b3VjaEJCb3gsZS5nZXRUb3VjaERpc3RhbmNlPUIudG91Y2hEaXN0YW5jZSxlLmdldFRvdWNoQW5nbGU9Qi50b3VjaEFuZ2xlLGUuZ2V0RWxlbWVudFJlY3Q9Xy5nZXRFbGVtZW50UmVjdCxlLmdldEVsZW1lbnRDbGllbnRSZWN0PV8uZ2V0RWxlbWVudENsaWVudFJlY3QsZS5tYXRjaGVzU2VsZWN0b3I9Xy5tYXRjaGVzU2VsZWN0b3IsZS5jbG9zZXN0PV8uY2xvc2VzdCxlLmdsb2JhbEV2ZW50cz17fSxlLnZlcnNpb249XCIxLjEwLjExXCIsZS5zY29wZT10LGUudXNlPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuc2NvcGUudXNlUGx1Z2luKHQsZSksdGhpc30sZS5pc1NldD1mdW5jdGlvbih0LGUpe3JldHVybiEhdGhpcy5zY29wZS5pbnRlcmFjdGFibGVzLmdldCh0LGUmJmUuY29udGV4dCl9LGUub249KDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0LGUsbil7aWYoaS5kZWZhdWx0LnN0cmluZyh0KSYmLTEhPT10LnNlYXJjaChcIiBcIikmJih0PXQudHJpbSgpLnNwbGl0KC8gKy8pKSxpLmRlZmF1bHQuYXJyYXkodCkpe2Zvcih2YXIgcj0wO3I8dC5sZW5ndGg7cisrKXt2YXIgbz10W3JdO3RoaXMub24obyxlLG4pfXJldHVybiB0aGlzfWlmKGkuZGVmYXVsdC5vYmplY3QodCkpe2Zvcih2YXIgYSBpbiB0KXRoaXMub24oYSx0W2FdLGUpO3JldHVybiB0aGlzfXJldHVybigwLGhuLmRlZmF1bHQpKHQsdGhpcy5zY29wZS5hY3Rpb25zKT90aGlzLmdsb2JhbEV2ZW50c1t0XT90aGlzLmdsb2JhbEV2ZW50c1t0XS5wdXNoKGUpOnRoaXMuZ2xvYmFsRXZlbnRzW3RdPVtlXTp0aGlzLnNjb3BlLmV2ZW50cy5hZGQodGhpcy5zY29wZS5kb2N1bWVudCx0LGUse29wdGlvbnM6bn0pLHRoaXN9KSxcIlRoZSBpbnRlcmFjdC5vbigpIG1ldGhvZCBpcyBiZWluZyBkZXByZWNhdGVkXCIpLGUub2ZmPSgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCxlLG4pe2lmKGkuZGVmYXVsdC5zdHJpbmcodCkmJi0xIT09dC5zZWFyY2goXCIgXCIpJiYodD10LnRyaW0oKS5zcGxpdCgvICsvKSksaS5kZWZhdWx0LmFycmF5KHQpKXtmb3IodmFyIHI9MDtyPHQubGVuZ3RoO3IrKyl7dmFyIG89dFtyXTt0aGlzLm9mZihvLGUsbil9cmV0dXJuIHRoaXN9aWYoaS5kZWZhdWx0Lm9iamVjdCh0KSl7Zm9yKHZhciBhIGluIHQpdGhpcy5vZmYoYSx0W2FdLGUpO3JldHVybiB0aGlzfXZhciBzO3JldHVybigwLGhuLmRlZmF1bHQpKHQsdGhpcy5zY29wZS5hY3Rpb25zKT90IGluIHRoaXMuZ2xvYmFsRXZlbnRzJiYtMSE9PShzPXRoaXMuZ2xvYmFsRXZlbnRzW3RdLmluZGV4T2YoZSkpJiZ0aGlzLmdsb2JhbEV2ZW50c1t0XS5zcGxpY2UocywxKTp0aGlzLnNjb3BlLmV2ZW50cy5yZW1vdmUodGhpcy5zY29wZS5kb2N1bWVudCx0LGUsbiksdGhpc30pLFwiVGhlIGludGVyYWN0Lm9mZigpIG1ldGhvZCBpcyBiZWluZyBkZXByZWNhdGVkXCIpLGUuZGVidWc9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zY29wZX0sZS5zdXBwb3J0c1RvdWNoPWZ1bmN0aW9uKCl7cmV0dXJuIGIuZGVmYXVsdC5zdXBwb3J0c1RvdWNofSxlLnN1cHBvcnRzUG9pbnRlckV2ZW50PWZ1bmN0aW9uKCl7cmV0dXJuIGIuZGVmYXVsdC5zdXBwb3J0c1BvaW50ZXJFdmVudH0sZS5zdG9wPWZ1bmN0aW9uKCl7Zm9yKHZhciB0PTA7dDx0aGlzLnNjb3BlLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDt0KyspdGhpcy5zY29wZS5pbnRlcmFjdGlvbnMubGlzdFt0XS5zdG9wKCk7cmV0dXJuIHRoaXN9LGUucG9pbnRlck1vdmVUb2xlcmFuY2U9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5udW1iZXIodCk/KHRoaXMuc2NvcGUuaW50ZXJhY3Rpb25zLnBvaW50ZXJNb3ZlVG9sZXJhbmNlPXQsdGhpcyk6dGhpcy5zY29wZS5pbnRlcmFjdGlvbnMucG9pbnRlck1vdmVUb2xlcmFuY2V9LGUuYWRkRG9jdW1lbnQ9ZnVuY3Rpb24odCxlKXt0aGlzLnNjb3BlLmFkZERvY3VtZW50KHQsZSl9LGUucmVtb3ZlRG9jdW1lbnQ9ZnVuY3Rpb24odCl7dGhpcy5zY29wZS5yZW1vdmVEb2N1bWVudCh0KX0sZX07dmFyIHluPXt9O2Z1bmN0aW9uIG1uKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBibih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHluLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHluLkludGVyYWN0YWJsZT12b2lkIDA7dmFyIHhuPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChuLHIsbyxpKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLGJuKHRoaXMsXCJvcHRpb25zXCIsdm9pZCAwKSxibih0aGlzLFwiX2FjdGlvbnNcIix2b2lkIDApLGJuKHRoaXMsXCJ0YXJnZXRcIix2b2lkIDApLGJuKHRoaXMsXCJldmVudHNcIixuZXcgY24uRXZlbnRhYmxlKSxibih0aGlzLFwiX2NvbnRleHRcIix2b2lkIDApLGJuKHRoaXMsXCJfd2luXCIsdm9pZCAwKSxibih0aGlzLFwiX2RvY1wiLHZvaWQgMCksYm4odGhpcyxcIl9zY29wZUV2ZW50c1wiLHZvaWQgMCksYm4odGhpcyxcIl9yZWN0Q2hlY2tlclwiLHZvaWQgMCksdGhpcy5fYWN0aW9ucz1yLmFjdGlvbnMsdGhpcy50YXJnZXQ9bix0aGlzLl9jb250ZXh0PXIuY29udGV4dHx8byx0aGlzLl93aW49KDAsZS5nZXRXaW5kb3cpKCgwLF8udHJ5U2VsZWN0b3IpKG4pP3RoaXMuX2NvbnRleHQ6biksdGhpcy5fZG9jPXRoaXMuX3dpbi5kb2N1bWVudCx0aGlzLl9zY29wZUV2ZW50cz1pLHRoaXMuc2V0KHIpfXZhciBuLHI7cmV0dXJuIG49dCwocj1be2tleTpcIl9kZWZhdWx0c1wiLGdldDpmdW5jdGlvbigpe3JldHVybntiYXNlOnt9LHBlckFjdGlvbjp7fSxhY3Rpb25zOnt9fX19LHtrZXk6XCJzZXRPbkV2ZW50c1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIGkuZGVmYXVsdC5mdW5jKGUub25zdGFydCkmJnRoaXMub24oXCJcIi5jb25jYXQodCxcInN0YXJ0XCIpLGUub25zdGFydCksaS5kZWZhdWx0LmZ1bmMoZS5vbm1vdmUpJiZ0aGlzLm9uKFwiXCIuY29uY2F0KHQsXCJtb3ZlXCIpLGUub25tb3ZlKSxpLmRlZmF1bHQuZnVuYyhlLm9uZW5kKSYmdGhpcy5vbihcIlwiLmNvbmNhdCh0LFwiZW5kXCIpLGUub25lbmQpLGkuZGVmYXVsdC5mdW5jKGUub25pbmVydGlhc3RhcnQpJiZ0aGlzLm9uKFwiXCIuY29uY2F0KHQsXCJpbmVydGlhc3RhcnRcIiksZS5vbmluZXJ0aWFzdGFydCksdGhpc319LHtrZXk6XCJ1cGRhdGVQZXJBY3Rpb25MaXN0ZW5lcnNcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7KGkuZGVmYXVsdC5hcnJheShlKXx8aS5kZWZhdWx0Lm9iamVjdChlKSkmJnRoaXMub2ZmKHQsZSksKGkuZGVmYXVsdC5hcnJheShuKXx8aS5kZWZhdWx0Lm9iamVjdChuKSkmJnRoaXMub24odCxuKX19LHtrZXk6XCJzZXRQZXJBY3Rpb25cIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPXRoaXMuX2RlZmF1bHRzO2Zvcih2YXIgciBpbiBlKXt2YXIgbz1yLGE9dGhpcy5vcHRpb25zW3RdLHM9ZVtvXTtcImxpc3RlbmVyc1wiPT09byYmdGhpcy51cGRhdGVQZXJBY3Rpb25MaXN0ZW5lcnModCxhLmxpc3RlbmVycyxzKSxpLmRlZmF1bHQuYXJyYXkocyk/YVtvXT1aLmZyb20ocyk6aS5kZWZhdWx0LnBsYWluT2JqZWN0KHMpPyhhW29dPSgwLGouZGVmYXVsdCkoYVtvXXx8e30sKDAsZ2UuZGVmYXVsdCkocykpLGkuZGVmYXVsdC5vYmplY3Qobi5wZXJBY3Rpb25bb10pJiZcImVuYWJsZWRcImluIG4ucGVyQWN0aW9uW29dJiYoYVtvXS5lbmFibGVkPSExIT09cy5lbmFibGVkKSk6aS5kZWZhdWx0LmJvb2wocykmJmkuZGVmYXVsdC5vYmplY3Qobi5wZXJBY3Rpb25bb10pP2Fbb10uZW5hYmxlZD1zOmFbb109c319fSx7a2V5OlwiZ2V0UmVjdFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0PXR8fChpLmRlZmF1bHQuZWxlbWVudCh0aGlzLnRhcmdldCk/dGhpcy50YXJnZXQ6bnVsbCksaS5kZWZhdWx0LnN0cmluZyh0aGlzLnRhcmdldCkmJih0PXR8fHRoaXMuX2NvbnRleHQucXVlcnlTZWxlY3Rvcih0aGlzLnRhcmdldCkpLCgwLF8uZ2V0RWxlbWVudFJlY3QpKHQpfX0se2tleTpcInJlY3RDaGVja2VyXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcztyZXR1cm4gaS5kZWZhdWx0LmZ1bmModCk/KHRoaXMuX3JlY3RDaGVja2VyPXQsdGhpcy5nZXRSZWN0PWZ1bmN0aW9uKHQpe3ZhciBuPSgwLGouZGVmYXVsdCkoe30sZS5fcmVjdENoZWNrZXIodCkpO3JldHVyblwid2lkdGhcImluIG58fChuLndpZHRoPW4ucmlnaHQtbi5sZWZ0LG4uaGVpZ2h0PW4uYm90dG9tLW4udG9wKSxufSx0aGlzKTpudWxsPT09dD8oZGVsZXRlIHRoaXMuZ2V0UmVjdCxkZWxldGUgdGhpcy5fcmVjdENoZWNrZXIsdGhpcyk6dGhpcy5nZXRSZWN0fX0se2tleTpcIl9iYWNrQ29tcGF0T3B0aW9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtpZigoMCxfLnRyeVNlbGVjdG9yKShlKXx8aS5kZWZhdWx0Lm9iamVjdChlKSl7Zm9yKHZhciBuIGluIHRoaXMub3B0aW9uc1t0XT1lLHRoaXMuX2FjdGlvbnMubWFwKXRoaXMub3B0aW9uc1tuXVt0XT1lO3JldHVybiB0aGlzfXJldHVybiB0aGlzLm9wdGlvbnNbdF19fSx7a2V5Olwib3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2JhY2tDb21wYXRPcHRpb24oXCJvcmlnaW5cIix0KX19LHtrZXk6XCJkZWx0YVNvdXJjZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVyblwicGFnZVwiPT09dHx8XCJjbGllbnRcIj09PXQ/KHRoaXMub3B0aW9ucy5kZWx0YVNvdXJjZT10LHRoaXMpOnRoaXMub3B0aW9ucy5kZWx0YVNvdXJjZX19LHtrZXk6XCJjb250ZXh0XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY29udGV4dH19LHtrZXk6XCJpbkNvbnRleHRcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fY29udGV4dD09PXQub3duZXJEb2N1bWVudHx8KDAsXy5ub2RlQ29udGFpbnMpKHRoaXMuX2NvbnRleHQsdCl9fSx7a2V5OlwidGVzdElnbm9yZUFsbG93XCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiF0aGlzLnRlc3RJZ25vcmUodC5pZ25vcmVGcm9tLGUsbikmJnRoaXMudGVzdEFsbG93KHQuYWxsb3dGcm9tLGUsbil9fSx7a2V5OlwidGVzdEFsbG93XCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiF0fHwhIWkuZGVmYXVsdC5lbGVtZW50KG4pJiYoaS5kZWZhdWx0LnN0cmluZyh0KT8oMCxfLm1hdGNoZXNVcFRvKShuLHQsZSk6ISFpLmRlZmF1bHQuZWxlbWVudCh0KSYmKDAsXy5ub2RlQ29udGFpbnMpKHQsbikpfX0se2tleTpcInRlc3RJZ25vcmVcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuISghdHx8IWkuZGVmYXVsdC5lbGVtZW50KG4pKSYmKGkuZGVmYXVsdC5zdHJpbmcodCk/KDAsXy5tYXRjaGVzVXBUbykobix0LGUpOiEhaS5kZWZhdWx0LmVsZW1lbnQodCkmJigwLF8ubm9kZUNvbnRhaW5zKSh0LG4pKX19LHtrZXk6XCJmaXJlXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuZXZlbnRzLmZpcmUodCksdGhpc319LHtrZXk6XCJfb25PZmZcIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXtpLmRlZmF1bHQub2JqZWN0KGUpJiYhaS5kZWZhdWx0LmFycmF5KGUpJiYocj1uLG49bnVsbCk7dmFyIG89XCJvblwiPT09dD9cImFkZFwiOlwicmVtb3ZlXCIsYT0oMCxSLmRlZmF1bHQpKGUsbik7Zm9yKHZhciBzIGluIGEpe1wid2hlZWxcIj09PXMmJihzPWIuZGVmYXVsdC53aGVlbEV2ZW50KTtmb3IodmFyIGw9MDtsPGFbc10ubGVuZ3RoO2wrKyl7dmFyIHU9YVtzXVtsXTsoMCxobi5kZWZhdWx0KShzLHRoaXMuX2FjdGlvbnMpP3RoaXMuZXZlbnRzW3RdKHMsdSk6aS5kZWZhdWx0LnN0cmluZyh0aGlzLnRhcmdldCk/dGhpcy5fc2NvcGVFdmVudHNbXCJcIi5jb25jYXQobyxcIkRlbGVnYXRlXCIpXSh0aGlzLnRhcmdldCx0aGlzLl9jb250ZXh0LHMsdSxyKTp0aGlzLl9zY29wZUV2ZW50c1tvXSh0aGlzLnRhcmdldCxzLHUscil9fXJldHVybiB0aGlzfX0se2tleTpcIm9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiB0aGlzLl9vbk9mZihcIm9uXCIsdCxlLG4pfX0se2tleTpcIm9mZlwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4gdGhpcy5fb25PZmYoXCJvZmZcIix0LGUsbil9fSx7a2V5Olwic2V0XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZGVmYXVsdHM7Zm9yKHZhciBuIGluIGkuZGVmYXVsdC5vYmplY3QodCl8fCh0PXt9KSx0aGlzLm9wdGlvbnM9KDAsZ2UuZGVmYXVsdCkoZS5iYXNlKSx0aGlzLl9hY3Rpb25zLm1ldGhvZERpY3Qpe3ZhciByPW4sbz10aGlzLl9hY3Rpb25zLm1ldGhvZERpY3Rbcl07dGhpcy5vcHRpb25zW3JdPXt9LHRoaXMuc2V0UGVyQWN0aW9uKHIsKDAsai5kZWZhdWx0KSgoMCxqLmRlZmF1bHQpKHt9LGUucGVyQWN0aW9uKSxlLmFjdGlvbnNbcl0pKSx0aGlzW29dKHRbcl0pfWZvcih2YXIgYSBpbiB0KWkuZGVmYXVsdC5mdW5jKHRoaXNbYV0pJiZ0aGlzW2FdKHRbYV0pO3JldHVybiB0aGlzfX0se2tleTpcInVuc2V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtpZihpLmRlZmF1bHQuc3RyaW5nKHRoaXMudGFyZ2V0KSlmb3IodmFyIHQgaW4gdGhpcy5fc2NvcGVFdmVudHMuZGVsZWdhdGVkRXZlbnRzKWZvcih2YXIgZT10aGlzLl9zY29wZUV2ZW50cy5kZWxlZ2F0ZWRFdmVudHNbdF0sbj1lLmxlbmd0aC0xO24+PTA7bi0tKXt2YXIgcj1lW25dLG89ci5zZWxlY3RvcixhPXIuY29udGV4dCxzPXIubGlzdGVuZXJzO289PT10aGlzLnRhcmdldCYmYT09PXRoaXMuX2NvbnRleHQmJmUuc3BsaWNlKG4sMSk7Zm9yKHZhciBsPXMubGVuZ3RoLTE7bD49MDtsLS0pdGhpcy5fc2NvcGVFdmVudHMucmVtb3ZlRGVsZWdhdGUodGhpcy50YXJnZXQsdGhpcy5fY29udGV4dCx0LHNbbF1bMF0sc1tsXVsxXSl9ZWxzZSB0aGlzLl9zY29wZUV2ZW50cy5yZW1vdmUodGhpcy50YXJnZXQsXCJhbGxcIil9fV0pJiZtbihuLnByb3RvdHlwZSxyKSx0fSgpO3luLkludGVyYWN0YWJsZT14bjt2YXIgd249e307ZnVuY3Rpb24gX24odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIFBuKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkod24sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksd24uSW50ZXJhY3RhYmxlU2V0PXZvaWQgMDt2YXIgT249ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpe3ZhciBuPXRoaXM7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxQbih0aGlzLFwibGlzdFwiLFtdKSxQbih0aGlzLFwic2VsZWN0b3JNYXBcIix7fSksUG4odGhpcyxcInNjb3BlXCIsdm9pZCAwKSx0aGlzLnNjb3BlPWUsZS5hZGRMaXN0ZW5lcnMoe1wiaW50ZXJhY3RhYmxlOnVuc2V0XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGFibGUscj1lLnRhcmdldCxvPWUuX2NvbnRleHQsYT1pLmRlZmF1bHQuc3RyaW5nKHIpP24uc2VsZWN0b3JNYXBbcl06cltuLnNjb3BlLmlkXSxzPVouZmluZEluZGV4KGEsKGZ1bmN0aW9uKHQpe3JldHVybiB0LmNvbnRleHQ9PT1vfSkpO2Fbc10mJihhW3NdLmNvbnRleHQ9bnVsbCxhW3NdLmludGVyYWN0YWJsZT1udWxsKSxhLnNwbGljZShzLDEpfX0pfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcIm5ld1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7ZT0oMCxqLmRlZmF1bHQpKGV8fHt9LHthY3Rpb25zOnRoaXMuc2NvcGUuYWN0aW9uc30pO3ZhciBuPW5ldyB0aGlzLnNjb3BlLkludGVyYWN0YWJsZSh0LGUsdGhpcy5zY29wZS5kb2N1bWVudCx0aGlzLnNjb3BlLmV2ZW50cykscj17Y29udGV4dDpuLl9jb250ZXh0LGludGVyYWN0YWJsZTpufTtyZXR1cm4gdGhpcy5zY29wZS5hZGREb2N1bWVudChuLl9kb2MpLHRoaXMubGlzdC5wdXNoKG4pLGkuZGVmYXVsdC5zdHJpbmcodCk/KHRoaXMuc2VsZWN0b3JNYXBbdF18fCh0aGlzLnNlbGVjdG9yTWFwW3RdPVtdKSx0aGlzLnNlbGVjdG9yTWFwW3RdLnB1c2gocikpOihuLnRhcmdldFt0aGlzLnNjb3BlLmlkXXx8T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsdGhpcy5zY29wZS5pZCx7dmFsdWU6W10sY29uZmlndXJhYmxlOiEwfSksdFt0aGlzLnNjb3BlLmlkXS5wdXNoKHIpKSx0aGlzLnNjb3BlLmZpcmUoXCJpbnRlcmFjdGFibGU6bmV3XCIse3RhcmdldDp0LG9wdGlvbnM6ZSxpbnRlcmFjdGFibGU6bix3aW46dGhpcy5zY29wZS5fd2lufSksbn19LHtrZXk6XCJnZXRcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPWUmJmUuY29udGV4dHx8dGhpcy5zY29wZS5kb2N1bWVudCxyPWkuZGVmYXVsdC5zdHJpbmcodCksbz1yP3RoaXMuc2VsZWN0b3JNYXBbdF06dFt0aGlzLnNjb3BlLmlkXTtpZighbylyZXR1cm4gbnVsbDt2YXIgYT1aLmZpbmQobywoZnVuY3Rpb24oZSl7cmV0dXJuIGUuY29udGV4dD09PW4mJihyfHxlLmludGVyYWN0YWJsZS5pbkNvbnRleHQodCkpfSkpO3JldHVybiBhJiZhLmludGVyYWN0YWJsZX19LHtrZXk6XCJmb3JFYWNoTWF0Y2hcIix2YWx1ZTpmdW5jdGlvbih0LGUpe2Zvcih2YXIgbj0wO248dGhpcy5saXN0Lmxlbmd0aDtuKyspe3ZhciByPXRoaXMubGlzdFtuXSxvPXZvaWQgMDtpZigoaS5kZWZhdWx0LnN0cmluZyhyLnRhcmdldCk/aS5kZWZhdWx0LmVsZW1lbnQodCkmJl8ubWF0Y2hlc1NlbGVjdG9yKHQsci50YXJnZXQpOnQ9PT1yLnRhcmdldCkmJnIuaW5Db250ZXh0KHQpJiYobz1lKHIpKSx2b2lkIDAhPT1vKXJldHVybiBvfX19XSkmJl9uKGUucHJvdG90eXBlLG4pLHR9KCk7d24uSW50ZXJhY3RhYmxlU2V0PU9uO3ZhciBTbj17fTtmdW5jdGlvbiBFbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gVG4odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fWZ1bmN0aW9uIE1uKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KHQpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0odCxlKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gam4odCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP2puKHQsZSk6dm9pZCAwfX0odCxlKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpfWZ1bmN0aW9uIGpuKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1PYmplY3QuZGVmaW5lUHJvcGVydHkoU24sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksU24uZGVmYXVsdD12b2lkIDA7dmFyIGtuPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLFRuKHRoaXMsXCJjdXJyZW50VGFyZ2V0XCIsdm9pZCAwKSxUbih0aGlzLFwib3JpZ2luYWxFdmVudFwiLHZvaWQgMCksVG4odGhpcyxcInR5cGVcIix2b2lkIDApLHRoaXMub3JpZ2luYWxFdmVudD1lLCgwLEYuZGVmYXVsdCkodGhpcyxlKX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJwcmV2ZW50T3JpZ2luYWxEZWZhdWx0XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKX19LHtrZXk6XCJzdG9wUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMub3JpZ2luYWxFdmVudC5zdG9wUHJvcGFnYXRpb24oKX19LHtrZXk6XCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMub3JpZ2luYWxFdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKX19XSkmJkVuKGUucHJvdG90eXBlLG4pLHR9KCk7ZnVuY3Rpb24gSW4odCl7aWYoIWkuZGVmYXVsdC5vYmplY3QodCkpcmV0dXJue2NhcHR1cmU6ISF0LHBhc3NpdmU6ITF9O3ZhciBlPSgwLGouZGVmYXVsdCkoe30sdCk7cmV0dXJuIGUuY2FwdHVyZT0hIXQuY2FwdHVyZSxlLnBhc3NpdmU9ISF0LnBhc3NpdmUsZX12YXIgRG49e2lkOlwiZXZlbnRzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZSxuPVtdLHI9e30sbz1bXSxhPXthZGQ6cyxyZW1vdmU6bCxhZGREZWxlZ2F0ZTpmdW5jdGlvbih0LGUsbixpLGEpe3ZhciBsPUluKGEpO2lmKCFyW25dKXtyW25dPVtdO2Zvcih2YXIgZj0wO2Y8by5sZW5ndGg7ZisrKXt2YXIgZD1vW2ZdO3MoZCxuLHUpLHMoZCxuLGMsITApfX12YXIgcD1yW25dLHY9Wi5maW5kKHAsKGZ1bmN0aW9uKG4pe3JldHVybiBuLnNlbGVjdG9yPT09dCYmbi5jb250ZXh0PT09ZX0pKTt2fHwodj17c2VsZWN0b3I6dCxjb250ZXh0OmUsbGlzdGVuZXJzOltdfSxwLnB1c2godikpLHYubGlzdGVuZXJzLnB1c2goW2ksbF0pfSxyZW1vdmVEZWxlZ2F0ZTpmdW5jdGlvbih0LGUsbixvLGkpe3ZhciBhLHM9SW4oaSksZj1yW25dLGQ9ITE7aWYoZilmb3IoYT1mLmxlbmd0aC0xO2E+PTA7YS0tKXt2YXIgcD1mW2FdO2lmKHAuc2VsZWN0b3I9PT10JiZwLmNvbnRleHQ9PT1lKXtmb3IodmFyIHY9cC5saXN0ZW5lcnMsaD12Lmxlbmd0aC0xO2g+PTA7aC0tKXt2YXIgZz1Nbih2W2hdLDIpLHk9Z1swXSxtPWdbMV0sYj1tLmNhcHR1cmUseD1tLnBhc3NpdmU7aWYoeT09PW8mJmI9PT1zLmNhcHR1cmUmJng9PT1zLnBhc3NpdmUpe3Yuc3BsaWNlKGgsMSksdi5sZW5ndGh8fChmLnNwbGljZShhLDEpLGwoZSxuLHUpLGwoZSxuLGMsITApKSxkPSEwO2JyZWFrfX1pZihkKWJyZWFrfX19LGRlbGVnYXRlTGlzdGVuZXI6dSxkZWxlZ2F0ZVVzZUNhcHR1cmU6YyxkZWxlZ2F0ZWRFdmVudHM6cixkb2N1bWVudHM6byx0YXJnZXRzOm4sc3VwcG9ydHNPcHRpb25zOiExLHN1cHBvcnRzUGFzc2l2ZTohMX07ZnVuY3Rpb24gcyh0LGUscixvKXt2YXIgaT1JbihvKSxzPVouZmluZChuLChmdW5jdGlvbihlKXtyZXR1cm4gZS5ldmVudFRhcmdldD09PXR9KSk7c3x8KHM9e2V2ZW50VGFyZ2V0OnQsZXZlbnRzOnt9fSxuLnB1c2gocykpLHMuZXZlbnRzW2VdfHwocy5ldmVudHNbZV09W10pLHQuYWRkRXZlbnRMaXN0ZW5lciYmIVouY29udGFpbnMocy5ldmVudHNbZV0scikmJih0LmFkZEV2ZW50TGlzdGVuZXIoZSxyLGEuc3VwcG9ydHNPcHRpb25zP2k6aS5jYXB0dXJlKSxzLmV2ZW50c1tlXS5wdXNoKHIpKX1mdW5jdGlvbiBsKHQsZSxyLG8pe3ZhciBpPUluKG8pLHM9Wi5maW5kSW5kZXgobiwoZnVuY3Rpb24oZSl7cmV0dXJuIGUuZXZlbnRUYXJnZXQ9PT10fSkpLHU9bltzXTtpZih1JiZ1LmV2ZW50cylpZihcImFsbFwiIT09ZSl7dmFyIGM9ITEsZj11LmV2ZW50c1tlXTtpZihmKXtpZihcImFsbFwiPT09cil7Zm9yKHZhciBkPWYubGVuZ3RoLTE7ZD49MDtkLS0pbCh0LGUsZltkXSxpKTtyZXR1cm59Zm9yKHZhciBwPTA7cDxmLmxlbmd0aDtwKyspaWYoZltwXT09PXIpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLHIsYS5zdXBwb3J0c09wdGlvbnM/aTppLmNhcHR1cmUpLGYuc3BsaWNlKHAsMSksMD09PWYubGVuZ3RoJiYoZGVsZXRlIHUuZXZlbnRzW2VdLGM9ITApO2JyZWFrfX1jJiYhT2JqZWN0LmtleXModS5ldmVudHMpLmxlbmd0aCYmbi5zcGxpY2UocywxKX1lbHNlIGZvcihlIGluIHUuZXZlbnRzKXUuZXZlbnRzLmhhc093blByb3BlcnR5KGUpJiZsKHQsZSxcImFsbFwiKX1mdW5jdGlvbiB1KHQsZSl7Zm9yKHZhciBuPUluKGUpLG89bmV3IGtuKHQpLGE9clt0LnR5cGVdLHM9TW4oQi5nZXRFdmVudFRhcmdldHModCksMSlbMF0sbD1zO2kuZGVmYXVsdC5lbGVtZW50KGwpOyl7Zm9yKHZhciB1PTA7dTxhLmxlbmd0aDt1Kyspe3ZhciBjPWFbdV0sZj1jLnNlbGVjdG9yLGQ9Yy5jb250ZXh0O2lmKF8ubWF0Y2hlc1NlbGVjdG9yKGwsZikmJl8ubm9kZUNvbnRhaW5zKGQscykmJl8ubm9kZUNvbnRhaW5zKGQsbCkpe3ZhciBwPWMubGlzdGVuZXJzO28uY3VycmVudFRhcmdldD1sO2Zvcih2YXIgdj0wO3Y8cC5sZW5ndGg7disrKXt2YXIgaD1NbihwW3ZdLDIpLGc9aFswXSx5PWhbMV0sbT15LmNhcHR1cmUsYj15LnBhc3NpdmU7bT09PW4uY2FwdHVyZSYmYj09PW4ucGFzc2l2ZSYmZyhvKX19fWw9Xy5wYXJlbnROb2RlKGwpfX1mdW5jdGlvbiBjKHQpe3JldHVybiB1KHQsITApfXJldHVybiBudWxsPT0oZT10LmRvY3VtZW50KXx8ZS5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJ0ZXN0XCIsbnVsbCx7Z2V0IGNhcHR1cmUoKXtyZXR1cm4gYS5zdXBwb3J0c09wdGlvbnM9ITB9LGdldCBwYXNzaXZlKCl7cmV0dXJuIGEuc3VwcG9ydHNQYXNzaXZlPSEwfX0pLHQuZXZlbnRzPWEsYX19O1NuLmRlZmF1bHQ9RG47dmFyIEFuPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShBbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxBbi5kZWZhdWx0PXZvaWQgMDt2YXIgUm49e21ldGhvZE9yZGVyOltcInNpbXVsYXRpb25SZXN1bWVcIixcIm1vdXNlT3JQZW5cIixcImhhc1BvaW50ZXJcIixcImlkbGVcIl0sc2VhcmNoOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8Um4ubWV0aG9kT3JkZXIubGVuZ3RoO2UrKyl7dmFyIG47bj1Sbi5tZXRob2RPcmRlcltlXTt2YXIgcj1SbltuXSh0KTtpZihyKXJldHVybiByfXJldHVybiBudWxsfSxzaW11bGF0aW9uUmVzdW1lOmZ1bmN0aW9uKHQpe3ZhciBlPXQucG9pbnRlclR5cGUsbj10LmV2ZW50VHlwZSxyPXQuZXZlbnRUYXJnZXQsbz10LnNjb3BlO2lmKCEvZG93bnxzdGFydC9pLnRlc3QobikpcmV0dXJuIG51bGw7Zm9yKHZhciBpPTA7aTxvLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtpKyspe3ZhciBhPW8uaW50ZXJhY3Rpb25zLmxpc3RbaV0scz1yO2lmKGEuc2ltdWxhdGlvbiYmYS5zaW11bGF0aW9uLmFsbG93UmVzdW1lJiZhLnBvaW50ZXJUeXBlPT09ZSlmb3IoO3M7KXtpZihzPT09YS5lbGVtZW50KXJldHVybiBhO3M9Xy5wYXJlbnROb2RlKHMpfX1yZXR1cm4gbnVsbH0sbW91c2VPclBlbjpmdW5jdGlvbih0KXt2YXIgZSxuPXQucG9pbnRlcklkLHI9dC5wb2ludGVyVHlwZSxvPXQuZXZlbnRUeXBlLGk9dC5zY29wZTtpZihcIm1vdXNlXCIhPT1yJiZcInBlblwiIT09cilyZXR1cm4gbnVsbDtmb3IodmFyIGE9MDthPGkuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO2ErKyl7dmFyIHM9aS5pbnRlcmFjdGlvbnMubGlzdFthXTtpZihzLnBvaW50ZXJUeXBlPT09cil7aWYocy5zaW11bGF0aW9uJiYhem4ocyxuKSljb250aW51ZTtpZihzLmludGVyYWN0aW5nKCkpcmV0dXJuIHM7ZXx8KGU9cyl9fWlmKGUpcmV0dXJuIGU7Zm9yKHZhciBsPTA7bDxpLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtsKyspe3ZhciB1PWkuaW50ZXJhY3Rpb25zLmxpc3RbbF07aWYoISh1LnBvaW50ZXJUeXBlIT09cnx8L2Rvd24vaS50ZXN0KG8pJiZ1LnNpbXVsYXRpb24pKXJldHVybiB1fXJldHVybiBudWxsfSxoYXNQb2ludGVyOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT10LnBvaW50ZXJJZCxuPXQuc2NvcGUscj0wO3I8bi5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7cisrKXt2YXIgbz1uLmludGVyYWN0aW9ucy5saXN0W3JdO2lmKHpuKG8sZSkpcmV0dXJuIG99cmV0dXJuIG51bGx9LGlkbGU6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXQucG9pbnRlclR5cGUsbj10LnNjb3BlLHI9MDtyPG4uaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO3IrKyl7dmFyIG89bi5pbnRlcmFjdGlvbnMubGlzdFtyXTtpZigxPT09by5wb2ludGVycy5sZW5ndGgpe3ZhciBpPW8uaW50ZXJhY3RhYmxlO2lmKGkmJighaS5vcHRpb25zLmdlc3R1cmV8fCFpLm9wdGlvbnMuZ2VzdHVyZS5lbmFibGVkKSljb250aW51ZX1lbHNlIGlmKG8ucG9pbnRlcnMubGVuZ3RoPj0yKWNvbnRpbnVlO2lmKCFvLmludGVyYWN0aW5nKCkmJmU9PT1vLnBvaW50ZXJUeXBlKXJldHVybiBvfXJldHVybiBudWxsfX07ZnVuY3Rpb24gem4odCxlKXtyZXR1cm4gdC5wb2ludGVycy5zb21lKChmdW5jdGlvbih0KXtyZXR1cm4gdC5pZD09PWV9KSl9dmFyIENuPVJuO0FuLmRlZmF1bHQ9Q247dmFyIEZuPXt9O2Z1bmN0aW9uIFhuKHQpe3JldHVybihYbj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9ZnVuY3Rpb24gWW4odCxlKXtyZXR1cm4gZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0odCl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fSh0LGUpfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBCbih0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/Qm4odCxlKTp2b2lkIDB9fSh0LGUpfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCl9ZnVuY3Rpb24gQm4odCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfWZ1bmN0aW9uIFduKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiBMbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gVW4odCxlKXtyZXR1cm4oVW49T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIFZuKHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1YbihlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9mdW5jdGlvbih0KXtpZih2b2lkIDA9PT10KXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4gdH0odCk6ZX1mdW5jdGlvbiBObih0KXtyZXR1cm4oTm49T2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5nZXRQcm90b3R5cGVPZjpmdW5jdGlvbih0KXtyZXR1cm4gdC5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0KX0pKHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShGbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxGbi5kZWZhdWx0PXZvaWQgMDt2YXIgcW49W1wicG9pbnRlckRvd25cIixcInBvaW50ZXJNb3ZlXCIsXCJwb2ludGVyVXBcIixcInVwZGF0ZVBvaW50ZXJcIixcInJlbW92ZVBvaW50ZXJcIixcIndpbmRvd0JsdXJcIl07ZnVuY3Rpb24gJG4odCxlKXtyZXR1cm4gZnVuY3Rpb24obil7dmFyIHI9ZS5pbnRlcmFjdGlvbnMubGlzdCxvPUIuZ2V0UG9pbnRlclR5cGUobiksaT1ZbihCLmdldEV2ZW50VGFyZ2V0cyhuKSwyKSxhPWlbMF0scz1pWzFdLGw9W107aWYoL150b3VjaC8udGVzdChuLnR5cGUpKXtlLnByZXZUb3VjaFRpbWU9ZS5ub3coKTtmb3IodmFyIHU9MDt1PG4uY2hhbmdlZFRvdWNoZXMubGVuZ3RoO3UrKyl7dmFyIGM9bi5jaGFuZ2VkVG91Y2hlc1t1XSxmPXtwb2ludGVyOmMscG9pbnRlcklkOkIuZ2V0UG9pbnRlcklkKGMpLHBvaW50ZXJUeXBlOm8sZXZlbnRUeXBlOm4udHlwZSxldmVudFRhcmdldDphLGN1ckV2ZW50VGFyZ2V0OnMsc2NvcGU6ZX0sZD1HbihmKTtsLnB1c2goW2YucG9pbnRlcixmLmV2ZW50VGFyZ2V0LGYuY3VyRXZlbnRUYXJnZXQsZF0pfX1lbHNle3ZhciBwPSExO2lmKCFiLmRlZmF1bHQuc3VwcG9ydHNQb2ludGVyRXZlbnQmJi9tb3VzZS8udGVzdChuLnR5cGUpKXtmb3IodmFyIHY9MDt2PHIubGVuZ3RoJiYhcDt2KyspcD1cIm1vdXNlXCIhPT1yW3ZdLnBvaW50ZXJUeXBlJiZyW3ZdLnBvaW50ZXJJc0Rvd247cD1wfHxlLm5vdygpLWUucHJldlRvdWNoVGltZTw1MDB8fDA9PT1uLnRpbWVTdGFtcH1pZighcCl7dmFyIGg9e3BvaW50ZXI6bixwb2ludGVySWQ6Qi5nZXRQb2ludGVySWQobikscG9pbnRlclR5cGU6byxldmVudFR5cGU6bi50eXBlLGN1ckV2ZW50VGFyZ2V0OnMsZXZlbnRUYXJnZXQ6YSxzY29wZTplfSxnPUduKGgpO2wucHVzaChbaC5wb2ludGVyLGguZXZlbnRUYXJnZXQsaC5jdXJFdmVudFRhcmdldCxnXSl9fWZvcih2YXIgeT0wO3k8bC5sZW5ndGg7eSsrKXt2YXIgbT1ZbihsW3ldLDQpLHg9bVswXSx3PW1bMV0sXz1tWzJdO21bM11bdF0oeCxuLHcsXyl9fX1mdW5jdGlvbiBHbih0KXt2YXIgZT10LnBvaW50ZXJUeXBlLG49dC5zY29wZSxyPXtpbnRlcmFjdGlvbjpBbi5kZWZhdWx0LnNlYXJjaCh0KSxzZWFyY2hEZXRhaWxzOnR9O3JldHVybiBuLmZpcmUoXCJpbnRlcmFjdGlvbnM6ZmluZFwiLHIpLHIuaW50ZXJhY3Rpb258fG4uaW50ZXJhY3Rpb25zLm5ldyh7cG9pbnRlclR5cGU6ZX0pfWZ1bmN0aW9uIEhuKHQsZSl7dmFyIG49dC5kb2Mscj10LnNjb3BlLG89dC5vcHRpb25zLGk9ci5pbnRlcmFjdGlvbnMuZG9jRXZlbnRzLGE9ci5ldmVudHMscz1hW2VdO2Zvcih2YXIgbCBpbiByLmJyb3dzZXIuaXNJT1MmJiFvLmV2ZW50cyYmKG8uZXZlbnRzPXtwYXNzaXZlOiExfSksYS5kZWxlZ2F0ZWRFdmVudHMpcyhuLGwsYS5kZWxlZ2F0ZUxpc3RlbmVyKSxzKG4sbCxhLmRlbGVnYXRlVXNlQ2FwdHVyZSwhMCk7Zm9yKHZhciB1PW8mJm8uZXZlbnRzLGM9MDtjPGkubGVuZ3RoO2MrKyl7dmFyIGY9aVtjXTtzKG4sZi50eXBlLGYubGlzdGVuZXIsdSl9fXZhciBLbj17aWQ6XCJjb3JlL2ludGVyYWN0aW9uc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXt9LG49MDtuPHFuLmxlbmd0aDtuKyspe3ZhciByPXFuW25dO2Vbcl09JG4ocix0KX12YXIgbyxpPWIuZGVmYXVsdC5wRXZlbnRUeXBlcztmdW5jdGlvbiBhKCl7Zm9yKHZhciBlPTA7ZTx0LmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtlKyspe3ZhciBuPXQuaW50ZXJhY3Rpb25zLmxpc3RbZV07aWYobi5wb2ludGVySXNEb3duJiZcInRvdWNoXCI9PT1uLnBvaW50ZXJUeXBlJiYhbi5faW50ZXJhY3RpbmcpZm9yKHZhciByPWZ1bmN0aW9uKCl7dmFyIGU9bi5wb2ludGVyc1tvXTt0LmRvY3VtZW50cy5zb21lKChmdW5jdGlvbih0KXt2YXIgbj10LmRvYztyZXR1cm4oMCxfLm5vZGVDb250YWlucykobixlLmRvd25UYXJnZXQpfSkpfHxuLnJlbW92ZVBvaW50ZXIoZS5wb2ludGVyLGUuZXZlbnQpfSxvPTA7bzxuLnBvaW50ZXJzLmxlbmd0aDtvKyspcigpfX0obz1oLmRlZmF1bHQuUG9pbnRlckV2ZW50P1t7dHlwZTppLmRvd24sbGlzdGVuZXI6YX0se3R5cGU6aS5kb3duLGxpc3RlbmVyOmUucG9pbnRlckRvd259LHt0eXBlOmkubW92ZSxsaXN0ZW5lcjplLnBvaW50ZXJNb3ZlfSx7dHlwZTppLnVwLGxpc3RlbmVyOmUucG9pbnRlclVwfSx7dHlwZTppLmNhbmNlbCxsaXN0ZW5lcjplLnBvaW50ZXJVcH1dOlt7dHlwZTpcIm1vdXNlZG93blwiLGxpc3RlbmVyOmUucG9pbnRlckRvd259LHt0eXBlOlwibW91c2Vtb3ZlXCIsbGlzdGVuZXI6ZS5wb2ludGVyTW92ZX0se3R5cGU6XCJtb3VzZXVwXCIsbGlzdGVuZXI6ZS5wb2ludGVyVXB9LHt0eXBlOlwidG91Y2hzdGFydFwiLGxpc3RlbmVyOmF9LHt0eXBlOlwidG91Y2hzdGFydFwiLGxpc3RlbmVyOmUucG9pbnRlckRvd259LHt0eXBlOlwidG91Y2htb3ZlXCIsbGlzdGVuZXI6ZS5wb2ludGVyTW92ZX0se3R5cGU6XCJ0b3VjaGVuZFwiLGxpc3RlbmVyOmUucG9pbnRlclVwfSx7dHlwZTpcInRvdWNoY2FuY2VsXCIsbGlzdGVuZXI6ZS5wb2ludGVyVXB9XSkucHVzaCh7dHlwZTpcImJsdXJcIixsaXN0ZW5lcjpmdW5jdGlvbihlKXtmb3IodmFyIG49MDtuPHQuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO24rKyl0LmludGVyYWN0aW9ucy5saXN0W25dLmRvY3VtZW50Qmx1cihlKX19KSx0LnByZXZUb3VjaFRpbWU9MCx0LkludGVyYWN0aW9uPWZ1bmN0aW9uKGUpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmVW4odCxlKX0ocyxlKTt2YXIgbixyLG8saSxhPShvPXMsaT1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBSZWZsZWN0fHwhUmVmbGVjdC5jb25zdHJ1Y3QpcmV0dXJuITE7aWYoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSlyZXR1cm4hMTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm94eSlyZXR1cm4hMDt0cnl7cmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLFtdLChmdW5jdGlvbigpe30pKSksITB9Y2F0Y2godCl7cmV0dXJuITF9fSgpLGZ1bmN0aW9uKCl7dmFyIHQsZT1ObihvKTtpZihpKXt2YXIgbj1Obih0aGlzKS5jb25zdHJ1Y3Rvcjt0PVJlZmxlY3QuY29uc3RydWN0KGUsYXJndW1lbnRzLG4pfWVsc2UgdD1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gVm4odGhpcyx0KX0pO2Z1bmN0aW9uIHMoKXtyZXR1cm4gV24odGhpcyxzKSxhLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gbj1zLChyPVt7a2V5OlwicG9pbnRlck1vdmVUb2xlcmFuY2VcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdC5pbnRlcmFjdGlvbnMucG9pbnRlck1vdmVUb2xlcmFuY2V9LHNldDpmdW5jdGlvbihlKXt0LmludGVyYWN0aW9ucy5wb2ludGVyTW92ZVRvbGVyYW5jZT1lfX0se2tleTpcIl9ub3dcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0Lm5vdygpfX1dKSYmTG4obi5wcm90b3R5cGUsciksc30oTGUuZGVmYXVsdCksdC5pbnRlcmFjdGlvbnM9e2xpc3Q6W10sbmV3OmZ1bmN0aW9uKGUpe2Uuc2NvcGVGaXJlPWZ1bmN0aW9uKGUsbil7cmV0dXJuIHQuZmlyZShlLG4pfTt2YXIgbj1uZXcgdC5JbnRlcmFjdGlvbihlKTtyZXR1cm4gdC5pbnRlcmFjdGlvbnMubGlzdC5wdXNoKG4pLG59LGxpc3RlbmVyczplLGRvY0V2ZW50czpvLHBvaW50ZXJNb3ZlVG9sZXJhbmNlOjF9LHQudXNlUGx1Z2luKHNlLmRlZmF1bHQpfSxsaXN0ZW5lcnM6e1wic2NvcGU6YWRkLWRvY3VtZW50XCI6ZnVuY3Rpb24odCl7cmV0dXJuIEhuKHQsXCJhZGRcIil9LFwic2NvcGU6cmVtb3ZlLWRvY3VtZW50XCI6ZnVuY3Rpb24odCl7cmV0dXJuIEhuKHQsXCJyZW1vdmVcIil9LFwiaW50ZXJhY3RhYmxlOnVuc2V0XCI6ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49dC5pbnRlcmFjdGFibGUscj1lLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aC0xO3I+PTA7ci0tKXt2YXIgbz1lLmludGVyYWN0aW9ucy5saXN0W3JdO28uaW50ZXJhY3RhYmxlPT09biYmKG8uc3RvcCgpLGUuZmlyZShcImludGVyYWN0aW9uczpkZXN0cm95XCIse2ludGVyYWN0aW9uOm99KSxvLmRlc3Ryb3koKSxlLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aD4yJiZlLmludGVyYWN0aW9ucy5saXN0LnNwbGljZShyLDEpKX19fSxvbkRvY1NpZ25hbDpIbixkb09uSW50ZXJhY3Rpb25zOiRuLG1ldGhvZE5hbWVzOnFufTtGbi5kZWZhdWx0PUtuO3ZhciBabj17fTtmdW5jdGlvbiBKbih0KXtyZXR1cm4oSm49XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIFFuKHQsZSxuKXtyZXR1cm4oUW49XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFJlZmxlY3QmJlJlZmxlY3QuZ2V0P1JlZmxlY3QuZ2V0OmZ1bmN0aW9uKHQsZSxuKXt2YXIgcj1mdW5jdGlvbih0LGUpe2Zvcig7IU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0LGUpJiZudWxsIT09KHQ9bnIodCkpOyk7cmV0dXJuIHR9KHQsZSk7aWYocil7dmFyIG89T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihyLGUpO3JldHVybiBvLmdldD9vLmdldC5jYWxsKG4pOm8udmFsdWV9fSkodCxlLG58fHQpfWZ1bmN0aW9uIHRyKHQsZSl7cmV0dXJuKHRyPU9iamVjdC5zZXRQcm90b3R5cGVPZnx8ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5fX3Byb3RvX189ZSx0fSkodCxlKX1mdW5jdGlvbiBlcih0LGUpe3JldHVybiFlfHxcIm9iamVjdFwiIT09Sm4oZSkmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGU/ZnVuY3Rpb24odCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9KHQpOmV9ZnVuY3Rpb24gbnIodCl7cmV0dXJuKG5yPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1mdW5jdGlvbiBycih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gb3IodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIGlyKHQsZSxuKXtyZXR1cm4gZSYmb3IodC5wcm90b3R5cGUsZSksbiYmb3IodCxuKSx0fWZ1bmN0aW9uIGFyKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoWm4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWm4uaW5pdFNjb3BlPWxyLFpuLlNjb3BlPXZvaWQgMDt2YXIgc3I9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7dmFyIGU9dGhpcztycih0aGlzLHQpLGFyKHRoaXMsXCJpZFwiLFwiX19pbnRlcmFjdF9zY29wZV9cIi5jb25jYXQoTWF0aC5mbG9vcigxMDAqTWF0aC5yYW5kb20oKSkpKSxhcih0aGlzLFwiaXNJbml0aWFsaXplZFwiLCExKSxhcih0aGlzLFwibGlzdGVuZXJNYXBzXCIsW10pLGFyKHRoaXMsXCJicm93c2VyXCIsYi5kZWZhdWx0KSxhcih0aGlzLFwiZGVmYXVsdHNcIiwoMCxnZS5kZWZhdWx0KShNZS5kZWZhdWx0cykpLGFyKHRoaXMsXCJFdmVudGFibGVcIixjbi5FdmVudGFibGUpLGFyKHRoaXMsXCJhY3Rpb25zXCIse21hcDp7fSxwaGFzZXM6e3N0YXJ0OiEwLG1vdmU6ITAsZW5kOiEwfSxtZXRob2REaWN0Ont9LHBoYXNlbGVzc1R5cGVzOnt9fSksYXIodGhpcyxcImludGVyYWN0U3RhdGljXCIsKDAsZ24uY3JlYXRlSW50ZXJhY3RTdGF0aWMpKHRoaXMpKSxhcih0aGlzLFwiSW50ZXJhY3RFdmVudFwiLGplLkludGVyYWN0RXZlbnQpLGFyKHRoaXMsXCJJbnRlcmFjdGFibGVcIix2b2lkIDApLGFyKHRoaXMsXCJpbnRlcmFjdGFibGVzXCIsbmV3IHduLkludGVyYWN0YWJsZVNldCh0aGlzKSksYXIodGhpcyxcIl93aW5cIix2b2lkIDApLGFyKHRoaXMsXCJkb2N1bWVudFwiLHZvaWQgMCksYXIodGhpcyxcIndpbmRvd1wiLHZvaWQgMCksYXIodGhpcyxcImRvY3VtZW50c1wiLFtdKSxhcih0aGlzLFwiX3BsdWdpbnNcIix7bGlzdDpbXSxtYXA6e319KSxhcih0aGlzLFwib25XaW5kb3dVbmxvYWRcIiwoZnVuY3Rpb24odCl7cmV0dXJuIGUucmVtb3ZlRG9jdW1lbnQodC50YXJnZXQpfSkpO3ZhciBuPXRoaXM7dGhpcy5JbnRlcmFjdGFibGU9ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZSYmZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp0LHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSxlJiZ0cih0LGUpfShpLHQpO3ZhciBlLHIsbz0oZT1pLHI9ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LG49bnIoZSk7aWYocil7dmFyIG89bnIodGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChuLGFyZ3VtZW50cyxvKX1lbHNlIHQ9bi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIGVyKHRoaXMsdCl9KTtmdW5jdGlvbiBpKCl7cmV0dXJuIHJyKHRoaXMsaSksby5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIGlyKGksW3trZXk6XCJfZGVmYXVsdHNcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gbi5kZWZhdWx0c319LHtrZXk6XCJzZXRcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gUW4obnIoaS5wcm90b3R5cGUpLFwic2V0XCIsdGhpcykuY2FsbCh0aGlzLHQpLG4uZmlyZShcImludGVyYWN0YWJsZTpzZXRcIix7b3B0aW9uczp0LGludGVyYWN0YWJsZTp0aGlzfSksdGhpc319LHtrZXk6XCJ1bnNldFwiLHZhbHVlOmZ1bmN0aW9uKCl7UW4obnIoaS5wcm90b3R5cGUpLFwidW5zZXRcIix0aGlzKS5jYWxsKHRoaXMpLG4uaW50ZXJhY3RhYmxlcy5saXN0LnNwbGljZShuLmludGVyYWN0YWJsZXMubGlzdC5pbmRleE9mKHRoaXMpLDEpLG4uZmlyZShcImludGVyYWN0YWJsZTp1bnNldFwiLHtpbnRlcmFjdGFibGU6dGhpc30pfX1dKSxpfSh5bi5JbnRlcmFjdGFibGUpfXJldHVybiBpcih0LFt7a2V5OlwiYWRkTGlzdGVuZXJzXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt0aGlzLmxpc3RlbmVyTWFwcy5wdXNoKHtpZDplLG1hcDp0fSl9fSx7a2V5OlwiZmlyZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPTA7bjx0aGlzLmxpc3RlbmVyTWFwcy5sZW5ndGg7bisrKXt2YXIgcj10aGlzLmxpc3RlbmVyTWFwc1tuXS5tYXBbdF07aWYociYmITE9PT1yKGUsdGhpcyx0KSlyZXR1cm4hMX19fSx7a2V5OlwiaW5pdFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmlzSW5pdGlhbGl6ZWQ/dGhpczpscih0aGlzLHQpfX0se2tleTpcInBsdWdpbklzSW5zdGFsbGVkXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX3BsdWdpbnMubWFwW3QuaWRdfHwtMSE9PXRoaXMuX3BsdWdpbnMubGlzdC5pbmRleE9mKHQpfX0se2tleTpcInVzZVBsdWdpblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7aWYoIXRoaXMuaXNJbml0aWFsaXplZClyZXR1cm4gdGhpcztpZih0aGlzLnBsdWdpbklzSW5zdGFsbGVkKHQpKXJldHVybiB0aGlzO2lmKHQuaWQmJih0aGlzLl9wbHVnaW5zLm1hcFt0LmlkXT10KSx0aGlzLl9wbHVnaW5zLmxpc3QucHVzaCh0KSx0Lmluc3RhbGwmJnQuaW5zdGFsbCh0aGlzLGUpLHQubGlzdGVuZXJzJiZ0LmJlZm9yZSl7Zm9yKHZhciBuPTAscj10aGlzLmxpc3RlbmVyTWFwcy5sZW5ndGgsbz10LmJlZm9yZS5yZWR1Y2UoKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbZV09ITAsdFt1cihlKV09ITAsdH0pLHt9KTtuPHI7bisrKXt2YXIgaT10aGlzLmxpc3RlbmVyTWFwc1tuXS5pZDtpZihvW2ldfHxvW3VyKGkpXSlicmVha310aGlzLmxpc3RlbmVyTWFwcy5zcGxpY2UobiwwLHtpZDp0LmlkLG1hcDp0Lmxpc3RlbmVyc30pfWVsc2UgdC5saXN0ZW5lcnMmJnRoaXMubGlzdGVuZXJNYXBzLnB1c2goe2lkOnQuaWQsbWFwOnQubGlzdGVuZXJzfSk7cmV0dXJuIHRoaXN9fSx7a2V5OlwiYWRkRG9jdW1lbnRcIix2YWx1ZTpmdW5jdGlvbih0LG4pe2lmKC0xIT09dGhpcy5nZXREb2NJbmRleCh0KSlyZXR1cm4hMTt2YXIgcj1lLmdldFdpbmRvdyh0KTtuPW4/KDAsai5kZWZhdWx0KSh7fSxuKTp7fSx0aGlzLmRvY3VtZW50cy5wdXNoKHtkb2M6dCxvcHRpb25zOm59KSx0aGlzLmV2ZW50cy5kb2N1bWVudHMucHVzaCh0KSx0IT09dGhpcy5kb2N1bWVudCYmdGhpcy5ldmVudHMuYWRkKHIsXCJ1bmxvYWRcIix0aGlzLm9uV2luZG93VW5sb2FkKSx0aGlzLmZpcmUoXCJzY29wZTphZGQtZG9jdW1lbnRcIix7ZG9jOnQsd2luZG93OnIsc2NvcGU6dGhpcyxvcHRpb25zOm59KX19LHtrZXk6XCJyZW1vdmVEb2N1bWVudFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMuZ2V0RG9jSW5kZXgodCkscj1lLmdldFdpbmRvdyh0KSxvPXRoaXMuZG9jdW1lbnRzW25dLm9wdGlvbnM7dGhpcy5ldmVudHMucmVtb3ZlKHIsXCJ1bmxvYWRcIix0aGlzLm9uV2luZG93VW5sb2FkKSx0aGlzLmRvY3VtZW50cy5zcGxpY2UobiwxKSx0aGlzLmV2ZW50cy5kb2N1bWVudHMuc3BsaWNlKG4sMSksdGhpcy5maXJlKFwic2NvcGU6cmVtb3ZlLWRvY3VtZW50XCIse2RvYzp0LHdpbmRvdzpyLHNjb3BlOnRoaXMsb3B0aW9uczpvfSl9fSx7a2V5OlwiZ2V0RG9jSW5kZXhcIix2YWx1ZTpmdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHRoaXMuZG9jdW1lbnRzLmxlbmd0aDtlKyspaWYodGhpcy5kb2N1bWVudHNbZV0uZG9jPT09dClyZXR1cm4gZTtyZXR1cm4tMX19LHtrZXk6XCJnZXREb2NPcHRpb25zXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXREb2NJbmRleCh0KTtyZXR1cm4tMT09PWU/bnVsbDp0aGlzLmRvY3VtZW50c1tlXS5vcHRpb25zfX0se2tleTpcIm5vd1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMud2luZG93LkRhdGV8fERhdGUpLm5vdygpfX1dKSx0fSgpO2Z1bmN0aW9uIGxyKHQsbil7cmV0dXJuIHQuaXNJbml0aWFsaXplZD0hMCxpLmRlZmF1bHQud2luZG93KG4pJiZlLmluaXQobiksaC5kZWZhdWx0LmluaXQobiksYi5kZWZhdWx0LmluaXQobiksanQuZGVmYXVsdC5pbml0KG4pLHQud2luZG93PW4sdC5kb2N1bWVudD1uLmRvY3VtZW50LHQudXNlUGx1Z2luKEZuLmRlZmF1bHQpLHQudXNlUGx1Z2luKFNuLmRlZmF1bHQpLHR9ZnVuY3Rpb24gdXIodCl7cmV0dXJuIHQmJnQucmVwbGFjZSgvXFwvLiokLyxcIlwiKX1abi5TY29wZT1zcjt2YXIgY3I9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGNyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGNyLmRlZmF1bHQ9dm9pZCAwO3ZhciBmcj1uZXcgWm4uU2NvcGUsZHI9ZnIuaW50ZXJhY3RTdGF0aWM7Y3IuZGVmYXVsdD1kcjt2YXIgcHI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczpcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp2b2lkIDA7ZnIuaW5pdChwcik7dmFyIHZyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh2cixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx2ci5kZWZhdWx0PXZvaWQgMCx2ci5kZWZhdWx0PWZ1bmN0aW9uKCl7fTt2YXIgaHI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGhyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGhyLmRlZmF1bHQ9dm9pZCAwLGhyLmRlZmF1bHQ9ZnVuY3Rpb24oKXt9O3ZhciBncj17fTtmdW5jdGlvbiB5cih0LGUpe3JldHVybiBmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0fSh0KXx8ZnVuY3Rpb24odCxlKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXt2YXIgbj1bXSxyPSEwLG89ITEsaT12b2lkIDA7dHJ5e2Zvcih2YXIgYSxzPXRbU3ltYm9sLml0ZXJhdG9yXSgpOyEocj0oYT1zLm5leHQoKSkuZG9uZSkmJihuLnB1c2goYS52YWx1ZSksIWV8fG4ubGVuZ3RoIT09ZSk7cj0hMCk7fWNhdGNoKHQpe289ITAsaT10fWZpbmFsbHl7dHJ5e3J8fG51bGw9PXMucmV0dXJufHxzLnJldHVybigpfWZpbmFsbHl7aWYobyl0aHJvdyBpfX1yZXR1cm4gbn19KHQsZSl8fGZ1bmN0aW9uKHQsZSl7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIG1yKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9tcih0LGUpOnZvaWQgMH19KHQsZSl8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX0oKX1mdW5jdGlvbiBtcih0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9T2JqZWN0LmRlZmluZVByb3BlcnR5KGdyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGdyLmRlZmF1bHQ9dm9pZCAwLGdyLmRlZmF1bHQ9ZnVuY3Rpb24odCl7dmFyIGU9W1tcInhcIixcInlcIl0sW1wibGVmdFwiLFwidG9wXCJdLFtcInJpZ2h0XCIsXCJib3R0b21cIl0sW1wid2lkdGhcIixcImhlaWdodFwiXV0uZmlsdGVyKChmdW5jdGlvbihlKXt2YXIgbj15cihlLDIpLHI9blswXSxvPW5bMV07cmV0dXJuIHIgaW4gdHx8byBpbiB0fSkpLG49ZnVuY3Rpb24obixyKXtmb3IodmFyIG89dC5yYW5nZSxpPXQubGltaXRzLGE9dm9pZCAwPT09aT97bGVmdDotMS8wLHJpZ2h0OjEvMCx0b3A6LTEvMCxib3R0b206MS8wfTppLHM9dC5vZmZzZXQsbD12b2lkIDA9PT1zP3t4OjAseTowfTpzLHU9e3JhbmdlOm8sZ3JpZDp0LHg6bnVsbCx5Om51bGx9LGM9MDtjPGUubGVuZ3RoO2MrKyl7dmFyIGY9eXIoZVtjXSwyKSxkPWZbMF0scD1mWzFdLHY9TWF0aC5yb3VuZCgobi1sLngpL3RbZF0pLGg9TWF0aC5yb3VuZCgoci1sLnkpL3RbcF0pO3VbZF09TWF0aC5tYXgoYS5sZWZ0LE1hdGgubWluKGEucmlnaHQsdip0W2RdK2wueCkpLHVbcF09TWF0aC5tYXgoYS50b3AsTWF0aC5taW4oYS5ib3R0b20saCp0W3BdK2wueSkpfXJldHVybiB1fTtyZXR1cm4gbi5ncmlkPXQsbi5jb29yZEZpZWxkcz1lLG59O3ZhciBicj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoYnIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGJyLFwiZWRnZVRhcmdldFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiB2ci5kZWZhdWx0fX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicixcImVsZW1lbnRzXCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGhyLmRlZmF1bHR9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGJyLFwiZ3JpZFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBnci5kZWZhdWx0fX0pO3ZhciB4cj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoeHIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkseHIuZGVmYXVsdD12b2lkIDA7dmFyIHdyPXtpZDpcInNuYXBwZXJzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0U3RhdGljO2Uuc25hcHBlcnM9KDAsai5kZWZhdWx0KShlLnNuYXBwZXJzfHx7fSxiciksZS5jcmVhdGVTbmFwR3JpZD1lLnNuYXBwZXJzLmdyaWR9fTt4ci5kZWZhdWx0PXdyO3ZhciBfcj17fTtmdW5jdGlvbiBQcih0LGUpe3ZhciBuPU9iamVjdC5rZXlzKHQpO2lmKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpe3ZhciByPU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHModCk7ZSYmKHI9ci5maWx0ZXIoKGZ1bmN0aW9uKGUpe3JldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsZSkuZW51bWVyYWJsZX0pKSksbi5wdXNoLmFwcGx5KG4scil9cmV0dXJuIG59ZnVuY3Rpb24gT3IodCl7Zm9yKHZhciBlPTE7ZTxhcmd1bWVudHMubGVuZ3RoO2UrKyl7dmFyIG49bnVsbCE9YXJndW1lbnRzW2VdP2FyZ3VtZW50c1tlXTp7fTtlJTI/UHIoT2JqZWN0KG4pLCEwKS5mb3JFYWNoKChmdW5jdGlvbihlKXtTcih0LGUsbltlXSl9KSk6T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnM/T2JqZWN0LmRlZmluZVByb3BlcnRpZXModCxPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhuKSk6UHIoT2JqZWN0KG4pKS5mb3JFYWNoKChmdW5jdGlvbihlKXtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobixlKSl9KSl9cmV0dXJuIHR9ZnVuY3Rpb24gU3IodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShfcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxfci5hc3BlY3RSYXRpbz1fci5kZWZhdWx0PXZvaWQgMDt2YXIgRXI9e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuc3RhdGUsbj10LnJlY3Qscj10LmVkZ2VzLG89dC5wYWdlQ29vcmRzLGk9ZS5vcHRpb25zLnJhdGlvLGE9ZS5vcHRpb25zLHM9YS5lcXVhbERlbHRhLGw9YS5tb2RpZmllcnM7XCJwcmVzZXJ2ZVwiPT09aSYmKGk9bi53aWR0aC9uLmhlaWdodCksZS5zdGFydENvb3Jkcz0oMCxqLmRlZmF1bHQpKHt9LG8pLGUuc3RhcnRSZWN0PSgwLGouZGVmYXVsdCkoe30sbiksZS5yYXRpbz1pLGUuZXF1YWxEZWx0YT1zO3ZhciB1PWUubGlua2VkRWRnZXM9e3RvcDpyLnRvcHx8ci5sZWZ0JiYhci5ib3R0b20sbGVmdDpyLmxlZnR8fHIudG9wJiYhci5yaWdodCxib3R0b206ci5ib3R0b218fHIucmlnaHQmJiFyLnRvcCxyaWdodDpyLnJpZ2h0fHxyLmJvdHRvbSYmIXIubGVmdH07aWYoZS54SXNQcmltYXJ5QXhpcz0hKCFyLmxlZnQmJiFyLnJpZ2h0KSxlLmVxdWFsRGVsdGEpZS5lZGdlU2lnbj0odS5sZWZ0PzE6LTEpKih1LnRvcD8xOi0xKTtlbHNle3ZhciBjPWUueElzUHJpbWFyeUF4aXM/dS50b3A6dS5sZWZ0O2UuZWRnZVNpZ249Yz8tMToxfWlmKCgwLGouZGVmYXVsdCkodC5lZGdlcyx1KSxsJiZsLmxlbmd0aCl7dmFyIGY9bmV3IHllLmRlZmF1bHQodC5pbnRlcmFjdGlvbik7Zi5jb3B5RnJvbSh0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbiksZi5wcmVwYXJlU3RhdGVzKGwpLGUuc3ViTW9kaWZpY2F0aW9uPWYsZi5zdGFydEFsbChPcih7fSx0KSl9fSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5zdGF0ZSxuPXQucmVjdCxyPXQuY29vcmRzLG89KDAsai5kZWZhdWx0KSh7fSxyKSxpPWUuZXF1YWxEZWx0YT9UcjpNcjtpZihpKGUsZS54SXNQcmltYXJ5QXhpcyxyLG4pLCFlLnN1Yk1vZGlmaWNhdGlvbilyZXR1cm4gbnVsbDt2YXIgYT0oMCxqLmRlZmF1bHQpKHt9LG4pOygwLGsuYWRkRWRnZXMpKGUubGlua2VkRWRnZXMsYSx7eDpyLngtby54LHk6ci55LW8ueX0pO3ZhciBzPWUuc3ViTW9kaWZpY2F0aW9uLnNldEFsbChPcihPcih7fSx0KSx7fSx7cmVjdDphLGVkZ2VzOmUubGlua2VkRWRnZXMscGFnZUNvb3JkczpyLHByZXZDb29yZHM6cixwcmV2UmVjdDphfSkpLGw9cy5kZWx0YTtyZXR1cm4gcy5jaGFuZ2VkJiYoaShlLE1hdGguYWJzKGwueCk+TWF0aC5hYnMobC55KSxzLmNvb3JkcyxzLnJlY3QpLCgwLGouZGVmYXVsdCkocixzLmNvb3JkcykpLHMuZXZlbnRQcm9wc30sZGVmYXVsdHM6e3JhdGlvOlwicHJlc2VydmVcIixlcXVhbERlbHRhOiExLG1vZGlmaWVyczpbXSxlbmFibGVkOiExfX07ZnVuY3Rpb24gVHIodCxlLG4pe3ZhciByPXQuc3RhcnRDb29yZHMsbz10LmVkZ2VTaWduO2U/bi55PXIueSsobi54LXIueCkqbzpuLng9ci54KyhuLnktci55KSpvfWZ1bmN0aW9uIE1yKHQsZSxuLHIpe3ZhciBvPXQuc3RhcnRSZWN0LGk9dC5zdGFydENvb3JkcyxhPXQucmF0aW8scz10LmVkZ2VTaWduO2lmKGUpe3ZhciBsPXIud2lkdGgvYTtuLnk9aS55KyhsLW8uaGVpZ2h0KSpzfWVsc2V7dmFyIHU9ci5oZWlnaHQqYTtuLng9aS54Kyh1LW8ud2lkdGgpKnN9fV9yLmFzcGVjdFJhdGlvPUVyO3ZhciBqcj0oMCxTZS5tYWtlTW9kaWZpZXIpKEVyLFwiYXNwZWN0UmF0aW9cIik7X3IuZGVmYXVsdD1qcjt2YXIga3I9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGtyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGtyLmRlZmF1bHQ9dm9pZCAwO3ZhciBJcj1mdW5jdGlvbigpe307SXIuX2RlZmF1bHRzPXt9O3ZhciBEcj1Jcjtrci5kZWZhdWx0PURyO3ZhciBBcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoQXIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KEFyLFwiZGVmYXVsdFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBrci5kZWZhdWx0fX0pO3ZhciBScj17fTtmdW5jdGlvbiB6cih0LGUsbil7cmV0dXJuIGkuZGVmYXVsdC5mdW5jKHQpP2sucmVzb2x2ZVJlY3RMaWtlKHQsZS5pbnRlcmFjdGFibGUsZS5lbGVtZW50LFtuLngsbi55LGVdKTprLnJlc29sdmVSZWN0TGlrZSh0LGUuaW50ZXJhY3RhYmxlLGUuZWxlbWVudCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFJyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFJyLmdldFJlc3RyaWN0aW9uUmVjdD16cixSci5yZXN0cmljdD1Sci5kZWZhdWx0PXZvaWQgMDt2YXIgQ3I9e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlPXQucmVjdCxuPXQuc3RhcnRPZmZzZXQscj10LnN0YXRlLG89dC5pbnRlcmFjdGlvbixpPXQucGFnZUNvb3JkcyxhPXIub3B0aW9ucyxzPWEuZWxlbWVudFJlY3QsbD0oMCxqLmRlZmF1bHQpKHtsZWZ0OjAsdG9wOjAscmlnaHQ6MCxib3R0b206MH0sYS5vZmZzZXR8fHt9KTtpZihlJiZzKXt2YXIgdT16cihhLnJlc3RyaWN0aW9uLG8saSk7aWYodSl7dmFyIGM9dS5yaWdodC11LmxlZnQtZS53aWR0aCxmPXUuYm90dG9tLXUudG9wLWUuaGVpZ2h0O2M8MCYmKGwubGVmdCs9YyxsLnJpZ2h0Kz1jKSxmPDAmJihsLnRvcCs9ZixsLmJvdHRvbSs9Zil9bC5sZWZ0Kz1uLmxlZnQtZS53aWR0aCpzLmxlZnQsbC50b3ArPW4udG9wLWUuaGVpZ2h0KnMudG9wLGwucmlnaHQrPW4ucmlnaHQtZS53aWR0aCooMS1zLnJpZ2h0KSxsLmJvdHRvbSs9bi5ib3R0b20tZS5oZWlnaHQqKDEtcy5ib3R0b20pfXIub2Zmc2V0PWx9LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LmNvb3JkcyxuPXQuaW50ZXJhY3Rpb24scj10LnN0YXRlLG89ci5vcHRpb25zLGk9ci5vZmZzZXQsYT16cihvLnJlc3RyaWN0aW9uLG4sZSk7aWYoYSl7dmFyIHM9ay54eXdoVG9UbGJyKGEpO2UueD1NYXRoLm1heChNYXRoLm1pbihzLnJpZ2h0LWkucmlnaHQsZS54KSxzLmxlZnQraS5sZWZ0KSxlLnk9TWF0aC5tYXgoTWF0aC5taW4ocy5ib3R0b20taS5ib3R0b20sZS55KSxzLnRvcCtpLnRvcCl9fSxkZWZhdWx0czp7cmVzdHJpY3Rpb246bnVsbCxlbGVtZW50UmVjdDpudWxsLG9mZnNldDpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O1JyLnJlc3RyaWN0PUNyO3ZhciBGcj0oMCxTZS5tYWtlTW9kaWZpZXIpKENyLFwicmVzdHJpY3RcIik7UnIuZGVmYXVsdD1Gcjt2YXIgWHI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFhyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFhyLnJlc3RyaWN0RWRnZXM9WHIuZGVmYXVsdD12b2lkIDA7dmFyIFlyPXt0b3A6MS8wLGxlZnQ6MS8wLGJvdHRvbTotMS8wLHJpZ2h0Oi0xLzB9LEJyPXt0b3A6LTEvMCxsZWZ0Oi0xLzAsYm90dG9tOjEvMCxyaWdodDoxLzB9O2Z1bmN0aW9uIFdyKHQsZSl7Zm9yKHZhciBuPVtcInRvcFwiLFwibGVmdFwiLFwiYm90dG9tXCIsXCJyaWdodFwiXSxyPTA7cjxuLmxlbmd0aDtyKyspe3ZhciBvPW5bcl07byBpbiB0fHwodFtvXT1lW29dKX1yZXR1cm4gdH12YXIgTHI9e25vSW5uZXI6WXIsbm9PdXRlcjpCcixzdGFydDpmdW5jdGlvbih0KXt2YXIgZSxuPXQuaW50ZXJhY3Rpb24scj10LnN0YXJ0T2Zmc2V0LG89dC5zdGF0ZSxpPW8ub3B0aW9ucztpZihpKXt2YXIgYT0oMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGkub2Zmc2V0LG4sbi5jb29yZHMuc3RhcnQucGFnZSk7ZT1rLnJlY3RUb1hZKGEpfWU9ZXx8e3g6MCx5OjB9LG8ub2Zmc2V0PXt0b3A6ZS55K3IudG9wLGxlZnQ6ZS54K3IubGVmdCxib3R0b206ZS55LXIuYm90dG9tLHJpZ2h0OmUueC1yLnJpZ2h0fX0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuY29vcmRzLG49dC5lZGdlcyxyPXQuaW50ZXJhY3Rpb24sbz10LnN0YXRlLGk9by5vZmZzZXQsYT1vLm9wdGlvbnM7aWYobil7dmFyIHM9KDAsai5kZWZhdWx0KSh7fSxlKSxsPSgwLFJyLmdldFJlc3RyaWN0aW9uUmVjdCkoYS5pbm5lcixyLHMpfHx7fSx1PSgwLFJyLmdldFJlc3RyaWN0aW9uUmVjdCkoYS5vdXRlcixyLHMpfHx7fTtXcihsLFlyKSxXcih1LEJyKSxuLnRvcD9lLnk9TWF0aC5taW4oTWF0aC5tYXgodS50b3AraS50b3Ascy55KSxsLnRvcCtpLnRvcCk6bi5ib3R0b20mJihlLnk9TWF0aC5tYXgoTWF0aC5taW4odS5ib3R0b20raS5ib3R0b20scy55KSxsLmJvdHRvbStpLmJvdHRvbSkpLG4ubGVmdD9lLng9TWF0aC5taW4oTWF0aC5tYXgodS5sZWZ0K2kubGVmdCxzLngpLGwubGVmdCtpLmxlZnQpOm4ucmlnaHQmJihlLng9TWF0aC5tYXgoTWF0aC5taW4odS5yaWdodCtpLnJpZ2h0LHMueCksbC5yaWdodCtpLnJpZ2h0KSl9fSxkZWZhdWx0czp7aW5uZXI6bnVsbCxvdXRlcjpudWxsLG9mZnNldDpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O1hyLnJlc3RyaWN0RWRnZXM9THI7dmFyIFVyPSgwLFNlLm1ha2VNb2RpZmllcikoTHIsXCJyZXN0cmljdEVkZ2VzXCIpO1hyLmRlZmF1bHQ9VXI7dmFyIFZyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShWcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxWci5yZXN0cmljdFJlY3Q9VnIuZGVmYXVsdD12b2lkIDA7dmFyIE5yPSgwLGouZGVmYXVsdCkoe2dldCBlbGVtZW50UmVjdCgpe3JldHVybnt0b3A6MCxsZWZ0OjAsYm90dG9tOjEscmlnaHQ6MX19LHNldCBlbGVtZW50UmVjdCh0KXt9fSxSci5yZXN0cmljdC5kZWZhdWx0cykscXI9e3N0YXJ0OlJyLnJlc3RyaWN0LnN0YXJ0LHNldDpSci5yZXN0cmljdC5zZXQsZGVmYXVsdHM6TnJ9O1ZyLnJlc3RyaWN0UmVjdD1xcjt2YXIgJHI9KDAsU2UubWFrZU1vZGlmaWVyKShxcixcInJlc3RyaWN0UmVjdFwiKTtWci5kZWZhdWx0PSRyO3ZhciBHcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoR3IsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksR3IucmVzdHJpY3RTaXplPUdyLmRlZmF1bHQ9dm9pZCAwO3ZhciBIcj17d2lkdGg6LTEvMCxoZWlnaHQ6LTEvMH0sS3I9e3dpZHRoOjEvMCxoZWlnaHQ6MS8wfSxacj17c3RhcnQ6ZnVuY3Rpb24odCl7cmV0dXJuIFhyLnJlc3RyaWN0RWRnZXMuc3RhcnQodCl9LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5zdGF0ZSxyPXQucmVjdCxvPXQuZWRnZXMsaT1uLm9wdGlvbnM7aWYobyl7dmFyIGE9ay50bGJyVG9YeXdoKCgwLFJyLmdldFJlc3RyaWN0aW9uUmVjdCkoaS5taW4sZSx0LmNvb3JkcykpfHxIcixzPWsudGxiclRvWHl3aCgoMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGkubWF4LGUsdC5jb29yZHMpKXx8S3I7bi5vcHRpb25zPXtlbmRPbmx5OmkuZW5kT25seSxpbm5lcjooMCxqLmRlZmF1bHQpKHt9LFhyLnJlc3RyaWN0RWRnZXMubm9Jbm5lciksb3V0ZXI6KDAsai5kZWZhdWx0KSh7fSxYci5yZXN0cmljdEVkZ2VzLm5vT3V0ZXIpfSxvLnRvcD8obi5vcHRpb25zLmlubmVyLnRvcD1yLmJvdHRvbS1hLmhlaWdodCxuLm9wdGlvbnMub3V0ZXIudG9wPXIuYm90dG9tLXMuaGVpZ2h0KTpvLmJvdHRvbSYmKG4ub3B0aW9ucy5pbm5lci5ib3R0b209ci50b3ArYS5oZWlnaHQsbi5vcHRpb25zLm91dGVyLmJvdHRvbT1yLnRvcCtzLmhlaWdodCksby5sZWZ0PyhuLm9wdGlvbnMuaW5uZXIubGVmdD1yLnJpZ2h0LWEud2lkdGgsbi5vcHRpb25zLm91dGVyLmxlZnQ9ci5yaWdodC1zLndpZHRoKTpvLnJpZ2h0JiYobi5vcHRpb25zLmlubmVyLnJpZ2h0PXIubGVmdCthLndpZHRoLG4ub3B0aW9ucy5vdXRlci5yaWdodD1yLmxlZnQrcy53aWR0aCksWHIucmVzdHJpY3RFZGdlcy5zZXQodCksbi5vcHRpb25zPWl9fSxkZWZhdWx0czp7bWluOm51bGwsbWF4Om51bGwsZW5kT25seTohMSxlbmFibGVkOiExfX07R3IucmVzdHJpY3RTaXplPVpyO3ZhciBKcj0oMCxTZS5tYWtlTW9kaWZpZXIpKFpyLFwicmVzdHJpY3RTaXplXCIpO0dyLmRlZmF1bHQ9SnI7dmFyIFFyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShRcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoUXIsXCJkZWZhdWx0XCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGtyLmRlZmF1bHR9fSk7dmFyIHRvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0byxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0by5zbmFwPXRvLmRlZmF1bHQ9dm9pZCAwO3ZhciBlbz17c3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGUsbj10LmludGVyYWN0aW9uLHI9dC5pbnRlcmFjdGFibGUsbz10LmVsZW1lbnQsaT10LnJlY3QsYT10LnN0YXRlLHM9dC5zdGFydE9mZnNldCxsPWEub3B0aW9ucyx1PWwub2Zmc2V0V2l0aE9yaWdpbj9mdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLmVsZW1lbnQ7cmV0dXJuKDAsay5yZWN0VG9YWSkoKDAsay5yZXNvbHZlUmVjdExpa2UpKHQuc3RhdGUub3B0aW9ucy5vcmlnaW4sbnVsbCxudWxsLFtlXSkpfHwoMCxBLmRlZmF1bHQpKHQuaW50ZXJhY3RhYmxlLGUsdC5pbnRlcmFjdGlvbi5wcmVwYXJlZC5uYW1lKX0odCk6e3g6MCx5OjB9O2lmKFwic3RhcnRDb29yZHNcIj09PWwub2Zmc2V0KWU9e3g6bi5jb29yZHMuc3RhcnQucGFnZS54LHk6bi5jb29yZHMuc3RhcnQucGFnZS55fTtlbHNle3ZhciBjPSgwLGsucmVzb2x2ZVJlY3RMaWtlKShsLm9mZnNldCxyLG8sW25dKTsoZT0oMCxrLnJlY3RUb1hZKShjKXx8e3g6MCx5OjB9KS54Kz11LngsZS55Kz11Lnl9dmFyIGY9bC5yZWxhdGl2ZVBvaW50czthLm9mZnNldHM9aSYmZiYmZi5sZW5ndGg/Zi5tYXAoKGZ1bmN0aW9uKHQsbil7cmV0dXJue2luZGV4Om4scmVsYXRpdmVQb2ludDp0LHg6cy5sZWZ0LWkud2lkdGgqdC54K2UueCx5OnMudG9wLWkuaGVpZ2h0KnQueStlLnl9fSkpOlt7aW5kZXg6MCxyZWxhdGl2ZVBvaW50Om51bGwseDplLngseTplLnl9XX0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmNvb3JkcyxyPXQuc3RhdGUsbz1yLm9wdGlvbnMsYT1yLm9mZnNldHMscz0oMCxBLmRlZmF1bHQpKGUuaW50ZXJhY3RhYmxlLGUuZWxlbWVudCxlLnByZXBhcmVkLm5hbWUpLGw9KDAsai5kZWZhdWx0KSh7fSxuKSx1PVtdO28ub2Zmc2V0V2l0aE9yaWdpbnx8KGwueC09cy54LGwueS09cy55KTtmb3IodmFyIGM9MDtjPGEubGVuZ3RoO2MrKylmb3IodmFyIGY9YVtjXSxkPWwueC1mLngscD1sLnktZi55LHY9MCxoPW8udGFyZ2V0cy5sZW5ndGg7djxoO3YrKyl7dmFyIGcseT1vLnRhcmdldHNbdl07KGc9aS5kZWZhdWx0LmZ1bmMoeSk/eShkLHAsZS5fcHJveHksZix2KTp5KSYmdS5wdXNoKHt4OihpLmRlZmF1bHQubnVtYmVyKGcueCk/Zy54OmQpK2YueCx5OihpLmRlZmF1bHQubnVtYmVyKGcueSk/Zy55OnApK2YueSxyYW5nZTppLmRlZmF1bHQubnVtYmVyKGcucmFuZ2UpP2cucmFuZ2U6by5yYW5nZSxzb3VyY2U6eSxpbmRleDp2LG9mZnNldDpmfSl9Zm9yKHZhciBtPXt0YXJnZXQ6bnVsbCxpblJhbmdlOiExLGRpc3RhbmNlOjAscmFuZ2U6MCxkZWx0YTp7eDowLHk6MH19LGI9MDtiPHUubGVuZ3RoO2IrKyl7dmFyIHg9dVtiXSx3PXgucmFuZ2UsXz14LngtbC54LFA9eC55LWwueSxPPSgwLEMuZGVmYXVsdCkoXyxQKSxTPU88PXc7dz09PTEvMCYmbS5pblJhbmdlJiZtLnJhbmdlIT09MS8wJiYoUz0hMSksbS50YXJnZXQmJiEoUz9tLmluUmFuZ2UmJnchPT0xLzA/Ty93PG0uZGlzdGFuY2UvbS5yYW5nZTp3PT09MS8wJiZtLnJhbmdlIT09MS8wfHxPPG0uZGlzdGFuY2U6IW0uaW5SYW5nZSYmTzxtLmRpc3RhbmNlKXx8KG0udGFyZ2V0PXgsbS5kaXN0YW5jZT1PLG0ucmFuZ2U9dyxtLmluUmFuZ2U9UyxtLmRlbHRhLng9XyxtLmRlbHRhLnk9UCl9cmV0dXJuIG0uaW5SYW5nZSYmKG4ueD1tLnRhcmdldC54LG4ueT1tLnRhcmdldC55KSxyLmNsb3Nlc3Q9bSxtfSxkZWZhdWx0czp7cmFuZ2U6MS8wLHRhcmdldHM6bnVsbCxvZmZzZXQ6bnVsbCxvZmZzZXRXaXRoT3JpZ2luOiEwLG9yaWdpbjpudWxsLHJlbGF0aXZlUG9pbnRzOm51bGwsZW5kT25seTohMSxlbmFibGVkOiExfX07dG8uc25hcD1lbzt2YXIgbm89KDAsU2UubWFrZU1vZGlmaWVyKShlbyxcInNuYXBcIik7dG8uZGVmYXVsdD1ubzt2YXIgcm89e307ZnVuY3Rpb24gb28odCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShybyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxyby5zbmFwU2l6ZT1yby5kZWZhdWx0PXZvaWQgMDt2YXIgaW89e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuc3RhdGUsbj10LmVkZ2VzLHI9ZS5vcHRpb25zO2lmKCFuKXJldHVybiBudWxsO3Quc3RhdGU9e29wdGlvbnM6e3RhcmdldHM6bnVsbCxyZWxhdGl2ZVBvaW50czpbe3g6bi5sZWZ0PzA6MSx5Om4udG9wPzA6MX1dLG9mZnNldDpyLm9mZnNldHx8XCJzZWxmXCIsb3JpZ2luOnt4OjAseTowfSxyYW5nZTpyLnJhbmdlfX0sZS50YXJnZXRGaWVsZHM9ZS50YXJnZXRGaWVsZHN8fFtbXCJ3aWR0aFwiLFwiaGVpZ2h0XCJdLFtcInhcIixcInlcIl1dLHRvLnNuYXAuc3RhcnQodCksZS5vZmZzZXRzPXQuc3RhdGUub2Zmc2V0cyx0LnN0YXRlPWV9LHNldDpmdW5jdGlvbih0KXt2YXIgZSxuLHI9dC5pbnRlcmFjdGlvbixvPXQuc3RhdGUsYT10LmNvb3JkcyxzPW8ub3B0aW9ucyxsPW8ub2Zmc2V0cyx1PXt4OmEueC1sWzBdLngseTphLnktbFswXS55fTtvLm9wdGlvbnM9KDAsai5kZWZhdWx0KSh7fSxzKSxvLm9wdGlvbnMudGFyZ2V0cz1bXTtmb3IodmFyIGM9MDtjPChzLnRhcmdldHN8fFtdKS5sZW5ndGg7YysrKXt2YXIgZj0ocy50YXJnZXRzfHxbXSlbY10sZD12b2lkIDA7aWYoZD1pLmRlZmF1bHQuZnVuYyhmKT9mKHUueCx1Lnkscik6Zil7Zm9yKHZhciBwPTA7cDxvLnRhcmdldEZpZWxkcy5sZW5ndGg7cCsrKXt2YXIgdj0oZT1vLnRhcmdldEZpZWxkc1twXSxuPTIsZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0oZSl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fShlLG4pfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBvbyh0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/b28odCxlKTp2b2lkIDB9fShlLG4pfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCkpLGg9dlswXSxnPXZbMV07aWYoaCBpbiBkfHxnIGluIGQpe2QueD1kW2hdLGQueT1kW2ddO2JyZWFrfX1vLm9wdGlvbnMudGFyZ2V0cy5wdXNoKGQpfX12YXIgeT10by5zbmFwLnNldCh0KTtyZXR1cm4gby5vcHRpb25zPXMseX0sZGVmYXVsdHM6e3JhbmdlOjEvMCx0YXJnZXRzOm51bGwsb2Zmc2V0Om51bGwsZW5kT25seTohMSxlbmFibGVkOiExfX07cm8uc25hcFNpemU9aW87dmFyIGFvPSgwLFNlLm1ha2VNb2RpZmllcikoaW8sXCJzbmFwU2l6ZVwiKTtyby5kZWZhdWx0PWFvO3ZhciBzbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoc28sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksc28uc25hcEVkZ2VzPXNvLmRlZmF1bHQ9dm9pZCAwO3ZhciBsbz17c3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5lZGdlcztyZXR1cm4gZT8odC5zdGF0ZS50YXJnZXRGaWVsZHM9dC5zdGF0ZS50YXJnZXRGaWVsZHN8fFtbZS5sZWZ0P1wibGVmdFwiOlwicmlnaHRcIixlLnRvcD9cInRvcFwiOlwiYm90dG9tXCJdXSxyby5zbmFwU2l6ZS5zdGFydCh0KSk6bnVsbH0sc2V0OnJvLnNuYXBTaXplLnNldCxkZWZhdWx0czooMCxqLmRlZmF1bHQpKCgwLGdlLmRlZmF1bHQpKHJvLnNuYXBTaXplLmRlZmF1bHRzKSx7dGFyZ2V0czpudWxsLHJhbmdlOm51bGwsb2Zmc2V0Ont4OjAseTowfX0pfTtzby5zbmFwRWRnZXM9bG87dmFyIHVvPSgwLFNlLm1ha2VNb2RpZmllcikobG8sXCJzbmFwRWRnZXNcIik7c28uZGVmYXVsdD11bzt2YXIgY289e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGNvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbyxcImRlZmF1bHRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4ga3IuZGVmYXVsdH19KTt2YXIgZm89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGZvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmbyxcImRlZmF1bHRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4ga3IuZGVmYXVsdH19KTt2YXIgcG89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHBvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHBvLmRlZmF1bHQ9dm9pZCAwO3ZhciB2bz17YXNwZWN0UmF0aW86X3IuZGVmYXVsdCxyZXN0cmljdEVkZ2VzOlhyLmRlZmF1bHQscmVzdHJpY3Q6UnIuZGVmYXVsdCxyZXN0cmljdFJlY3Q6VnIuZGVmYXVsdCxyZXN0cmljdFNpemU6R3IuZGVmYXVsdCxzbmFwRWRnZXM6c28uZGVmYXVsdCxzbmFwOnRvLmRlZmF1bHQsc25hcFNpemU6cm8uZGVmYXVsdCxzcHJpbmc6Y28uZGVmYXVsdCxhdm9pZDpBci5kZWZhdWx0LHRyYW5zZm9ybTpmby5kZWZhdWx0LHJ1YmJlcmJhbmQ6UXIuZGVmYXVsdH07cG8uZGVmYXVsdD12bzt2YXIgaG89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGhvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGhvLmRlZmF1bHQ9dm9pZCAwO3ZhciBnbz17aWQ6XCJtb2RpZmllcnNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RTdGF0aWM7Zm9yKHZhciBuIGluIHQudXNlUGx1Z2luKFNlLmRlZmF1bHQpLHQudXNlUGx1Z2luKHhyLmRlZmF1bHQpLGUubW9kaWZpZXJzPXBvLmRlZmF1bHQscG8uZGVmYXVsdCl7dmFyIHI9cG8uZGVmYXVsdFtuXSxvPXIuX2RlZmF1bHRzLGk9ci5fbWV0aG9kcztvLl9tZXRob2RzPWksdC5kZWZhdWx0cy5wZXJBY3Rpb25bbl09b319fTtoby5kZWZhdWx0PWdvO3ZhciB5bz17fTtmdW5jdGlvbiBtbyh0KXtyZXR1cm4obW89XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIGJvKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiB4byh0LGUpe3JldHVybih4bz1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gd28odCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PW1vKGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP19vKHQpOmV9ZnVuY3Rpb24gX28odCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9ZnVuY3Rpb24gUG8odCl7cmV0dXJuKFBvPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1mdW5jdGlvbiBPbyh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHlvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHlvLlBvaW50ZXJFdmVudD15by5kZWZhdWx0PXZvaWQgMDt2YXIgU289ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZSYmZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp0LHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSxlJiZ4byh0LGUpfShhLHQpO3ZhciBlLG4scixvLGk9KHI9YSxvPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sKGZ1bmN0aW9uKCl7fSkpKSwhMH1jYXRjaCh0KXtyZXR1cm4hMX19KCksZnVuY3Rpb24oKXt2YXIgdCxlPVBvKHIpO2lmKG8pe3ZhciBuPVBvKHRoaXMpLmNvbnN0cnVjdG9yO3Q9UmVmbGVjdC5jb25zdHJ1Y3QoZSxhcmd1bWVudHMsbil9ZWxzZSB0PWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiB3byh0aGlzLHQpfSk7ZnVuY3Rpb24gYSh0LGUsbixyLG8scyl7dmFyIGw7aWYoZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLGEpLE9vKF9vKGw9aS5jYWxsKHRoaXMsbykpLFwidHlwZVwiLHZvaWQgMCksT28oX28obCksXCJvcmlnaW5hbEV2ZW50XCIsdm9pZCAwKSxPbyhfbyhsKSxcInBvaW50ZXJJZFwiLHZvaWQgMCksT28oX28obCksXCJwb2ludGVyVHlwZVwiLHZvaWQgMCksT28oX28obCksXCJkb3VibGVcIix2b2lkIDApLE9vKF9vKGwpLFwicGFnZVhcIix2b2lkIDApLE9vKF9vKGwpLFwicGFnZVlcIix2b2lkIDApLE9vKF9vKGwpLFwiY2xpZW50WFwiLHZvaWQgMCksT28oX28obCksXCJjbGllbnRZXCIsdm9pZCAwKSxPbyhfbyhsKSxcImR0XCIsdm9pZCAwKSxPbyhfbyhsKSxcImV2ZW50YWJsZVwiLHZvaWQgMCksQi5wb2ludGVyRXh0ZW5kKF9vKGwpLG4pLG4hPT1lJiZCLnBvaW50ZXJFeHRlbmQoX28obCksZSksbC50aW1lU3RhbXA9cyxsLm9yaWdpbmFsRXZlbnQ9bixsLnR5cGU9dCxsLnBvaW50ZXJJZD1CLmdldFBvaW50ZXJJZChlKSxsLnBvaW50ZXJUeXBlPUIuZ2V0UG9pbnRlclR5cGUoZSksbC50YXJnZXQ9cixsLmN1cnJlbnRUYXJnZXQ9bnVsbCxcInRhcFwiPT09dCl7dmFyIHU9by5nZXRQb2ludGVySW5kZXgoZSk7bC5kdD1sLnRpbWVTdGFtcC1vLnBvaW50ZXJzW3VdLmRvd25UaW1lO3ZhciBjPWwudGltZVN0YW1wLW8udGFwVGltZTtsLmRvdWJsZT0hIShvLnByZXZUYXAmJlwiZG91YmxldGFwXCIhPT1vLnByZXZUYXAudHlwZSYmby5wcmV2VGFwLnRhcmdldD09PWwudGFyZ2V0JiZjPDUwMCl9ZWxzZVwiZG91YmxldGFwXCI9PT10JiYobC5kdD1lLnRpbWVTdGFtcC1vLnRhcFRpbWUpO3JldHVybiBsfXJldHVybiBlPWEsKG49W3trZXk6XCJfc3VidHJhY3RPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10Lngsbj10Lnk7cmV0dXJuIHRoaXMucGFnZVgtPWUsdGhpcy5wYWdlWS09bix0aGlzLmNsaWVudFgtPWUsdGhpcy5jbGllbnRZLT1uLHRoaXN9fSx7a2V5OlwiX2FkZE9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQueCxuPXQueTtyZXR1cm4gdGhpcy5wYWdlWCs9ZSx0aGlzLnBhZ2VZKz1uLHRoaXMuY2xpZW50WCs9ZSx0aGlzLmNsaWVudFkrPW4sdGhpc319LHtrZXk6XCJwcmV2ZW50RGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCl9fV0pJiZibyhlLnByb3RvdHlwZSxuKSxhfSgkLkJhc2VFdmVudCk7eW8uUG9pbnRlckV2ZW50PXlvLmRlZmF1bHQ9U287dmFyIEVvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShFbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxFby5kZWZhdWx0PXZvaWQgMDt2YXIgVG89e2lkOlwicG9pbnRlci1ldmVudHMvYmFzZVwiLGJlZm9yZTpbXCJpbmVydGlhXCIsXCJtb2RpZmllcnNcIixcImF1dG8tc3RhcnRcIixcImFjdGlvbnNcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt0LnBvaW50ZXJFdmVudHM9VG8sdC5kZWZhdWx0cy5hY3Rpb25zLnBvaW50ZXJFdmVudHM9VG8uZGVmYXVsdHMsKDAsai5kZWZhdWx0KSh0LmFjdGlvbnMucGhhc2VsZXNzVHlwZXMsVG8udHlwZXMpfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5wcmV2VGFwPW51bGwsZS50YXBUaW1lPTB9LFwiaW50ZXJhY3Rpb25zOnVwZGF0ZS1wb2ludGVyXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5kb3duLG49dC5wb2ludGVySW5mbzshZSYmbi5ob2xkfHwobi5ob2xkPXtkdXJhdGlvbjoxLzAsdGltZW91dDpudWxsfSl9LFwiaW50ZXJhY3Rpb25zOm1vdmVcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldDt0LmR1cGxpY2F0ZXx8bi5wb2ludGVySXNEb3duJiYhbi5wb2ludGVyV2FzTW92ZWR8fChuLnBvaW50ZXJJc0Rvd24mJmtvKHQpLE1vKHtpbnRlcmFjdGlvbjpuLHBvaW50ZXI6cixldmVudDpvLGV2ZW50VGFyZ2V0OmksdHlwZTpcIm1vdmVcIn0sZSkpfSxcImludGVyYWN0aW9uczpkb3duXCI6ZnVuY3Rpb24odCxlKXshZnVuY3Rpb24odCxlKXtmb3IodmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0LGE9dC5wb2ludGVySW5kZXgscz1uLnBvaW50ZXJzW2FdLmhvbGQsbD1fLmdldFBhdGgoaSksdT17aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHR5cGU6XCJob2xkXCIsdGFyZ2V0czpbXSxwYXRoOmwsbm9kZTpudWxsfSxjPTA7YzxsLmxlbmd0aDtjKyspe3ZhciBmPWxbY107dS5ub2RlPWYsZS5maXJlKFwicG9pbnRlckV2ZW50czpjb2xsZWN0LXRhcmdldHNcIix1KX1pZih1LnRhcmdldHMubGVuZ3RoKXtmb3IodmFyIGQ9MS8wLHA9MDtwPHUudGFyZ2V0cy5sZW5ndGg7cCsrKXt2YXIgdj11LnRhcmdldHNbcF0uZXZlbnRhYmxlLm9wdGlvbnMuaG9sZER1cmF0aW9uO3Y8ZCYmKGQ9dil9cy5kdXJhdGlvbj1kLHMudGltZW91dD1zZXRUaW1lb3V0KChmdW5jdGlvbigpe01vKHtpbnRlcmFjdGlvbjpuLGV2ZW50VGFyZ2V0OmkscG9pbnRlcjpyLGV2ZW50Om8sdHlwZTpcImhvbGRcIn0sZSl9KSxkKX19KHQsZSksTW8odCxlKX0sXCJpbnRlcmFjdGlvbnM6dXBcIjpmdW5jdGlvbih0LGUpe2tvKHQpLE1vKHQsZSksZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQ7bi5wb2ludGVyV2FzTW92ZWR8fE1vKHtpbnRlcmFjdGlvbjpuLGV2ZW50VGFyZ2V0OmkscG9pbnRlcjpyLGV2ZW50Om8sdHlwZTpcInRhcFwifSxlKX0odCxlKX0sXCJpbnRlcmFjdGlvbnM6Y2FuY2VsXCI6ZnVuY3Rpb24odCxlKXtrbyh0KSxNbyh0LGUpfX0sUG9pbnRlckV2ZW50OnlvLlBvaW50ZXJFdmVudCxmaXJlOk1vLGNvbGxlY3RFdmVudFRhcmdldHM6am8sZGVmYXVsdHM6e2hvbGREdXJhdGlvbjo2MDAsaWdub3JlRnJvbTpudWxsLGFsbG93RnJvbTpudWxsLG9yaWdpbjp7eDowLHk6MH19LHR5cGVzOntkb3duOiEwLG1vdmU6ITAsdXA6ITAsY2FuY2VsOiEwLHRhcDohMCxkb3VibGV0YXA6ITAsaG9sZDohMH19O2Z1bmN0aW9uIE1vKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0LGE9dC50eXBlLHM9dC50YXJnZXRzLGw9dm9pZCAwPT09cz9qbyh0LGUpOnMsdT1uZXcgeW8uUG9pbnRlckV2ZW50KGEscixvLGksbixlLm5vdygpKTtlLmZpcmUoXCJwb2ludGVyRXZlbnRzOm5ld1wiLHtwb2ludGVyRXZlbnQ6dX0pO2Zvcih2YXIgYz17aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHRhcmdldHM6bCx0eXBlOmEscG9pbnRlckV2ZW50OnV9LGY9MDtmPGwubGVuZ3RoO2YrKyl7dmFyIGQ9bFtmXTtmb3IodmFyIHAgaW4gZC5wcm9wc3x8e30pdVtwXT1kLnByb3BzW3BdO3ZhciB2PSgwLEEuZGVmYXVsdCkoZC5ldmVudGFibGUsZC5ub2RlKTtpZih1Ll9zdWJ0cmFjdE9yaWdpbih2KSx1LmV2ZW50YWJsZT1kLmV2ZW50YWJsZSx1LmN1cnJlbnRUYXJnZXQ9ZC5ub2RlLGQuZXZlbnRhYmxlLmZpcmUodSksdS5fYWRkT3JpZ2luKHYpLHUuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkfHx1LnByb3BhZ2F0aW9uU3RvcHBlZCYmZisxPGwubGVuZ3RoJiZsW2YrMV0ubm9kZSE9PXUuY3VycmVudFRhcmdldClicmVha31pZihlLmZpcmUoXCJwb2ludGVyRXZlbnRzOmZpcmVkXCIsYyksXCJ0YXBcIj09PWEpe3ZhciBoPXUuZG91YmxlP01vKHtpbnRlcmFjdGlvbjpuLHBvaW50ZXI6cixldmVudDpvLGV2ZW50VGFyZ2V0OmksdHlwZTpcImRvdWJsZXRhcFwifSxlKTp1O24ucHJldlRhcD1oLG4udGFwVGltZT1oLnRpbWVTdGFtcH1yZXR1cm4gdX1mdW5jdGlvbiBqbyh0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldCxhPXQudHlwZSxzPW4uZ2V0UG9pbnRlckluZGV4KHIpLGw9bi5wb2ludGVyc1tzXTtpZihcInRhcFwiPT09YSYmKG4ucG9pbnRlcldhc01vdmVkfHwhbHx8bC5kb3duVGFyZ2V0IT09aSkpcmV0dXJuW107Zm9yKHZhciB1PV8uZ2V0UGF0aChpKSxjPXtpbnRlcmFjdGlvbjpuLHBvaW50ZXI6cixldmVudDpvLGV2ZW50VGFyZ2V0OmksdHlwZTphLHBhdGg6dSx0YXJnZXRzOltdLG5vZGU6bnVsbH0sZj0wO2Y8dS5sZW5ndGg7ZisrKXt2YXIgZD11W2ZdO2Mubm9kZT1kLGUuZmlyZShcInBvaW50ZXJFdmVudHM6Y29sbGVjdC10YXJnZXRzXCIsYyl9cmV0dXJuXCJob2xkXCI9PT1hJiYoYy50YXJnZXRzPWMudGFyZ2V0cy5maWx0ZXIoKGZ1bmN0aW9uKHQpe3ZhciBlO3JldHVybiB0LmV2ZW50YWJsZS5vcHRpb25zLmhvbGREdXJhdGlvbj09PShudWxsPT0oZT1uLnBvaW50ZXJzW3NdKT92b2lkIDA6ZS5ob2xkLmR1cmF0aW9uKX0pKSksYy50YXJnZXRzfWZ1bmN0aW9uIGtvKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LnBvaW50ZXJJbmRleCxyPWUucG9pbnRlcnNbbl0uaG9sZDtyJiZyLnRpbWVvdXQmJihjbGVhclRpbWVvdXQoci50aW1lb3V0KSxyLnRpbWVvdXQ9bnVsbCl9dmFyIElvPVRvO0VvLmRlZmF1bHQ9SW87dmFyIERvPXt9O2Z1bmN0aW9uIEFvKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5ob2xkSW50ZXJ2YWxIYW5kbGUmJihjbGVhckludGVydmFsKGUuaG9sZEludGVydmFsSGFuZGxlKSxlLmhvbGRJbnRlcnZhbEhhbmRsZT1udWxsKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoRG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksRG8uZGVmYXVsdD12b2lkIDA7dmFyIFJvPXtpZDpcInBvaW50ZXItZXZlbnRzL2hvbGRSZXBlYXRcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3QudXNlUGx1Z2luKEVvLmRlZmF1bHQpO3ZhciBlPXQucG9pbnRlckV2ZW50cztlLmRlZmF1bHRzLmhvbGRSZXBlYXRJbnRlcnZhbD0wLGUudHlwZXMuaG9sZHJlcGVhdD10LmFjdGlvbnMucGhhc2VsZXNzVHlwZXMuaG9sZHJlcGVhdD0hMH0sbGlzdGVuZXJzOltcIm1vdmVcIixcInVwXCIsXCJjYW5jZWxcIixcImVuZGFsbFwiXS5yZWR1Y2UoKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbXCJwb2ludGVyRXZlbnRzOlwiLmNvbmNhdChlKV09QW8sdH0pLHtcInBvaW50ZXJFdmVudHM6bmV3XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5wb2ludGVyRXZlbnQ7XCJob2xkXCI9PT1lLnR5cGUmJihlLmNvdW50PShlLmNvdW50fHwwKSsxKX0sXCJwb2ludGVyRXZlbnRzOmZpcmVkXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyRXZlbnQsbz10LmV2ZW50VGFyZ2V0LGk9dC50YXJnZXRzO2lmKFwiaG9sZFwiPT09ci50eXBlJiZpLmxlbmd0aCl7dmFyIGE9aVswXS5ldmVudGFibGUub3B0aW9ucy5ob2xkUmVwZWF0SW50ZXJ2YWw7YTw9MHx8KG4uaG9sZEludGVydmFsSGFuZGxlPXNldFRpbWVvdXQoKGZ1bmN0aW9uKCl7ZS5wb2ludGVyRXZlbnRzLmZpcmUoe2ludGVyYWN0aW9uOm4sZXZlbnRUYXJnZXQ6byx0eXBlOlwiaG9sZFwiLHBvaW50ZXI6cixldmVudDpyfSxlKX0pLGEpKX19fSl9O0RvLmRlZmF1bHQ9Um87dmFyIHpvPXt9O2Z1bmN0aW9uIENvKHQpe3JldHVybigwLGouZGVmYXVsdCkodGhpcy5ldmVudHMub3B0aW9ucyx0KSx0aGlzfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh6byxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx6by5kZWZhdWx0PXZvaWQgMDt2YXIgRm89e2lkOlwicG9pbnRlci1ldmVudHMvaW50ZXJhY3RhYmxlVGFyZ2V0c1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5JbnRlcmFjdGFibGU7ZS5wcm90b3R5cGUucG9pbnRlckV2ZW50cz1Dbzt2YXIgbj1lLnByb3RvdHlwZS5fYmFja0NvbXBhdE9wdGlvbjtlLnByb3RvdHlwZS5fYmFja0NvbXBhdE9wdGlvbj1mdW5jdGlvbih0LGUpe3ZhciByPW4uY2FsbCh0aGlzLHQsZSk7cmV0dXJuIHI9PT10aGlzJiYodGhpcy5ldmVudHMub3B0aW9uc1t0XT1lKSxyfX0sbGlzdGVuZXJzOntcInBvaW50ZXJFdmVudHM6Y29sbGVjdC10YXJnZXRzXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LnRhcmdldHMscj10Lm5vZGUsbz10LnR5cGUsaT10LmV2ZW50VGFyZ2V0O2UuaW50ZXJhY3RhYmxlcy5mb3JFYWNoTWF0Y2gociwoZnVuY3Rpb24odCl7dmFyIGU9dC5ldmVudHMsYT1lLm9wdGlvbnM7ZS50eXBlc1tvXSYmZS50eXBlc1tvXS5sZW5ndGgmJnQudGVzdElnbm9yZUFsbG93KGEscixpKSYmbi5wdXNoKHtub2RlOnIsZXZlbnRhYmxlOmUscHJvcHM6e2ludGVyYWN0YWJsZTp0fX0pfSkpfSxcImludGVyYWN0YWJsZTpuZXdcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0YWJsZTtlLmV2ZW50cy5nZXRSZWN0PWZ1bmN0aW9uKHQpe3JldHVybiBlLmdldFJlY3QodCl9fSxcImludGVyYWN0YWJsZTpzZXRcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3RhYmxlLHI9dC5vcHRpb25zOygwLGouZGVmYXVsdCkobi5ldmVudHMub3B0aW9ucyxlLnBvaW50ZXJFdmVudHMuZGVmYXVsdHMpLCgwLGouZGVmYXVsdCkobi5ldmVudHMub3B0aW9ucyxyLnBvaW50ZXJFdmVudHN8fHt9KX19fTt6by5kZWZhdWx0PUZvO3ZhciBYbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoWG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWG8uZGVmYXVsdD12b2lkIDA7dmFyIFlvPXtpZDpcInBvaW50ZXItZXZlbnRzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt0LnVzZVBsdWdpbihFbyksdC51c2VQbHVnaW4oRG8uZGVmYXVsdCksdC51c2VQbHVnaW4oem8uZGVmYXVsdCl9fTtYby5kZWZhdWx0PVlvO3ZhciBCbz17fTtmdW5jdGlvbiBXbyh0KXt2YXIgZT10LkludGVyYWN0YWJsZTt0LmFjdGlvbnMucGhhc2VzLnJlZmxvdz0hMCxlLnByb3RvdHlwZS5yZWZsb3c9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsZSxuKXtmb3IodmFyIHI9aS5kZWZhdWx0LnN0cmluZyh0LnRhcmdldCk/Wi5mcm9tKHQuX2NvbnRleHQucXVlcnlTZWxlY3RvckFsbCh0LnRhcmdldCkpOlt0LnRhcmdldF0sbz1uLndpbmRvdy5Qcm9taXNlLGE9bz9bXTpudWxsLHM9ZnVuY3Rpb24oKXt2YXIgaT1yW2xdLHM9dC5nZXRSZWN0KGkpO2lmKCFzKXJldHVyblwiYnJlYWtcIjt2YXIgdT1aLmZpbmQobi5pbnRlcmFjdGlvbnMubGlzdCwoZnVuY3Rpb24obil7cmV0dXJuIG4uaW50ZXJhY3RpbmcoKSYmbi5pbnRlcmFjdGFibGU9PT10JiZuLmVsZW1lbnQ9PT1pJiZuLnByZXBhcmVkLm5hbWU9PT1lLm5hbWV9KSksYz12b2lkIDA7aWYodSl1Lm1vdmUoKSxhJiYoYz11Ll9yZWZsb3dQcm9taXNlfHxuZXcgbygoZnVuY3Rpb24odCl7dS5fcmVmbG93UmVzb2x2ZT10fSkpKTtlbHNle3ZhciBmPSgwLGsudGxiclRvWHl3aCkocyksZD17cGFnZTp7eDpmLngseTpmLnl9LGNsaWVudDp7eDpmLngseTpmLnl9LHRpbWVTdGFtcDpuLm5vdygpfSxwPUIuY29vcmRzVG9FdmVudChkKTtjPWZ1bmN0aW9uKHQsZSxuLHIsbyl7dmFyIGk9dC5pbnRlcmFjdGlvbnMubmV3KHtwb2ludGVyVHlwZTpcInJlZmxvd1wifSksYT17aW50ZXJhY3Rpb246aSxldmVudDpvLHBvaW50ZXI6byxldmVudFRhcmdldDpuLHBoYXNlOlwicmVmbG93XCJ9O2kuaW50ZXJhY3RhYmxlPWUsaS5lbGVtZW50PW4saS5wcmV2RXZlbnQ9byxpLnVwZGF0ZVBvaW50ZXIobyxvLG4sITApLEIuc2V0WmVyb0Nvb3JkcyhpLmNvb3Jkcy5kZWx0YSksKDAsWXQuY29weUFjdGlvbikoaS5wcmVwYXJlZCxyKSxpLl9kb1BoYXNlKGEpO3ZhciBzPXQud2luZG93LlByb21pc2UsbD1zP25ldyBzKChmdW5jdGlvbih0KXtpLl9yZWZsb3dSZXNvbHZlPXR9KSk6dm9pZCAwO3JldHVybiBpLl9yZWZsb3dQcm9taXNlPWwsaS5zdGFydChyLGUsbiksaS5faW50ZXJhY3Rpbmc/KGkubW92ZShhKSxpLmVuZChvKSk6KGkuc3RvcCgpLGkuX3JlZmxvd1Jlc29sdmUoKSksaS5yZW1vdmVQb2ludGVyKG8sbyksbH0obix0LGksZSxwKX1hJiZhLnB1c2goYyl9LGw9MDtsPHIubGVuZ3RoJiZcImJyZWFrXCIhPT1zKCk7bCsrKTtyZXR1cm4gYSYmby5hbGwoYSkudGhlbigoZnVuY3Rpb24oKXtyZXR1cm4gdH0pKX0odGhpcyxlLHQpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkoQm8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQm8uaW5zdGFsbD1XbyxCby5kZWZhdWx0PXZvaWQgMDt2YXIgTG89e2lkOlwicmVmbG93XCIsaW5zdGFsbDpXbyxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb247XCJyZWZsb3dcIj09PW4ucG9pbnRlclR5cGUmJihuLl9yZWZsb3dSZXNvbHZlJiZuLl9yZWZsb3dSZXNvbHZlKCksWi5yZW1vdmUoZS5pbnRlcmFjdGlvbnMubGlzdCxuKSl9fX07Qm8uZGVmYXVsdD1Mbzt2YXIgVW89e2V4cG9ydHM6e319O2Z1bmN0aW9uIFZvKHQpe3JldHVybihWbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFVvLmV4cG9ydHMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksVW8uZXhwb3J0cy5kZWZhdWx0PXZvaWQgMCxjci5kZWZhdWx0LnVzZShzZS5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShHZS5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShYby5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShlbi5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShoby5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShpZS5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShUdC5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShSdC5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShCby5kZWZhdWx0KTt2YXIgTm89Y3IuZGVmYXVsdDtpZihVby5leHBvcnRzLmRlZmF1bHQ9Tm8sXCJvYmplY3RcIj09PVZvKFVvKSYmVW8pdHJ5e1VvLmV4cG9ydHM9Y3IuZGVmYXVsdH1jYXRjaCh0KXt9Y3IuZGVmYXVsdC5kZWZhdWx0PWNyLmRlZmF1bHQsVW89VW8uZXhwb3J0czt2YXIgcW89e2V4cG9ydHM6e319O2Z1bmN0aW9uICRvKHQpe3JldHVybigkbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KHFvLmV4cG9ydHMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkscW8uZXhwb3J0cy5kZWZhdWx0PXZvaWQgMDt2YXIgR289VW8uZGVmYXVsdDtpZihxby5leHBvcnRzLmRlZmF1bHQ9R28sXCJvYmplY3RcIj09PSRvKHFvKSYmcW8pdHJ5e3FvLmV4cG9ydHM9VW8uZGVmYXVsdH1jYXRjaCh0KXt9cmV0dXJuIFVvLmRlZmF1bHQuZGVmYXVsdD1Vby5kZWZhdWx0LHFvLmV4cG9ydHN9KSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnRlcmFjdC5taW4uanMubWFwXG4iLCJjbGFzcyBBbGJ1bSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGV4dGVybmFsVXJsOiBzdHJpbmc7XHJcbiAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgZXh0ZXJuYWxVcmw6IHN0cmluZykge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5leHRlcm5hbFVybCA9IGV4dGVybmFsVXJsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBbGJ1bVxyXG4iLCJjbGFzcyBBc3luY1NlbGVjdGlvblZlcmlmPFQ+IHtcclxuICBwcml2YXRlIF9jdXJyU2VsZWN0ZWRWYWw6IFQgfCBudWxsO1xyXG4gIGhhc0xvYWRlZEN1cnJTZWxlY3RlZDogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5fY3VyclNlbGVjdGVkVmFsID0gbnVsbFxyXG5cclxuICAgIC8vIHVzZWQgdG8gZW5zdXJlIHRoYXQgYW4gb2JqZWN0IHRoYXQgaGFzIGxvYWRlZCB3aWxsIG5vdCBiZSBsb2FkZWQgYWdhaW5cclxuICAgIHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkID0gZmFsc2VcclxuICB9XHJcblxyXG4gIGdldCBjdXJyU2VsZWN0ZWRWYWxOb051bGwgKCk6IFQge1xyXG4gICAgaWYgKCF0aGlzLl9jdXJyU2VsZWN0ZWRWYWwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgaXMgYWNjZXNzZWQgd2l0aG91dCBiZWluZyBhc3NpZ25lZCcpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5fY3VyclNlbGVjdGVkVmFsXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXQgY3VyclNlbGVjdGVkVmFsICgpOiBUIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3VyclNlbGVjdGVkVmFsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGFuZ2UgdGhlIHZhbHVlIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgYW5kIHJlc2V0IHRoZSBoYXMgbG9hZGVkIGJvb2xlYW4uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1R9IGN1cnJTZWxlY3RlZFZhbCB0aGUgdmFsdWUgdG8gY2hhbmdlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgdG9vLlxyXG4gICAqL1xyXG4gIHNlbGVjdGlvbkNoYW5nZWQgKGN1cnJTZWxlY3RlZFZhbDogVCkge1xyXG4gICAgdGhpcy5fY3VyclNlbGVjdGVkVmFsID0gY3VyclNlbGVjdGVkVmFsXHJcbiAgICB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgdG8gc2VlIGlmIGEgc2VsZWN0ZWQgdmFsdWUgcG9zdCBsb2FkIGlzIHZhbGlkIGJ5XHJcbiAgICogY29tcGFyaW5nIGl0IHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgYW5kIHZlcmlmeWluZyB0aGF0XHJcbiAgICogdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBoYXMgbm90IGFscmVhZHkgYmVlbiBsb2FkZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1R9IHBvc3RMb2FkVmFsIGRhdGEgdGhhdCBoYXMgYmVlbiBsb2FkZWRcclxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gd2hldGhlciB0aGUgbG9hZGVkIHNlbGVjdGlvbiBpcyB2YWxpZFxyXG4gICAqL1xyXG4gIGlzVmFsaWQgKHBvc3RMb2FkVmFsOiBUKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodGhpcy5fY3VyclNlbGVjdGVkVmFsICE9PSBwb3N0TG9hZFZhbCB8fCB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGlmIGlzIHZhbGlkIHRoZW4gd2UgYXNzdW1lIHRoYXQgdGhpcyB2YWx1ZSB3aWxsIGJlIGxvYWRlZFxyXG4gICAgICB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCA9IHRydWVcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFzeW5jU2VsZWN0aW9uVmVyaWZcclxuIiwiaW1wb3J0IHsgY29uZmlnLCBpc0VsbGlwc2lzQWN0aXZlLCBnZXRUZXh0V2lkdGggfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhcmRBY3Rpb25zSGFuZGxlciB7XHJcbiAgc3RvcmVkU2VsRWxzOiBBcnJheTxFbGVtZW50PjtcclxuICBjdXJyU2Nyb2xsaW5nQW5pbTogQW5pbWF0aW9uIHwgbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IgKG1heExlbmd0aDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnN0b3JlZFNlbEVscyA9IG5ldyBBcnJheShtYXhMZW5ndGgpXHJcbiAgICB0aGlzLmN1cnJTY3JvbGxpbmdBbmltID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqIE1hbmFnZXMgc2VsZWN0aW5nIGEgY2FyZCBhbmQgZGVzZWxlY3RpbmcgdGhlIHByZXZpb3VzIHNlbGVjdGVkIG9uZVxyXG4gICAqIHdoZW4gYSBjYXJkcyBvbiBjbGljayBldmVudCBsaXN0ZW5lciBpcyB0cmlnZ2VyZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHNlbENhcmRFbCAtIHRoZSBjYXJkIHRoYXQgZXhlY3V0ZWQgdGhpcyBmdW5jdGlvbiB3aGVuIGNsaWNrZWRcclxuICAgKiBAcGFyYW0ge0FycmF5PENhcmQ+fSBjb3JyT2JqTGlzdCAtIHRoZSBsaXN0IG9mIG9iamVjdHMgdGhhdCBjb250YWlucyBvbmUgdGhhdCBjb3Jyb3Nwb25kcyB0byB0aGUgc2VsZWN0ZWQgY2FyZCxcclxuICAgKiBlYWNoICoqKm9iamVjdCBtdXN0IGhhdmUgdGhlIGNhcmRJZCBhdHRyaWJ1dGUuXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBmdW5jdGlvbiB0byBydW4gd2hlbiBzZWxlY3RlZCBvYmplY3QgaGFzIGNoYW5nZWRcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGFsbG93VW5zZWxTZWxlY3RlZCAtIHdoZXRoZXIgdG8gYWxsb3cgdW5zZWxlY3Rpbmcgb2YgdGhlIHNlbGVjdGVkIGNhcmQgYnkgY2xpY2tpbmcgb24gaXQgYWdhaW5cclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHVuc2VsZWN0UHJldmlvdXMgLSB3aGV0aGVyIHRvIHVuc2VsZWN0IHRoZSBwcmV2aW91c2x5IHNlbGVjdGVkIGNhcmRcclxuICAgKi9cclxuICBvbkNhcmRDbGljayAoXHJcbiAgICBzZWxDYXJkRWw6IEVsZW1lbnQsXHJcbiAgICBjb3JyT2JqTGlzdDogQXJyYXk8Q2FyZD4sXHJcbiAgICBjYWxsYmFjazogRnVuY3Rpb24gfCBudWxsLFxyXG4gICAgYWxsb3dVbnNlbFNlbGVjdGVkOiBib29sZWFuID0gZmFsc2UsXHJcbiAgICB1bnNlbGVjdFByZXZpb3VzOiBib29sZWFuID0gdHJ1ZVxyXG4gICkge1xyXG4gICAgLy8gaWYgdGhlIHNlbGVjdGVkIGNhcmQgaXMgc2VsZWN0ZWQsIGFuZCB3ZSBjYW4gdW5zZWxlY3QgaXQsIGRvIHNvLlxyXG4gICAgaWYgKHRoaXMuc3RvcmVkU2VsRWxzLmluY2x1ZGVzKHNlbENhcmRFbCkpIHtcclxuICAgICAgaWYgKGFsbG93VW5zZWxTZWxlY3RlZCkge1xyXG4gICAgICAgIGNvbnN0IHNlbENhcmQgPSB0aGlzLnN0b3JlZFNlbEVsc1t0aGlzLnN0b3JlZFNlbEVscy5pbmRleE9mKHNlbENhcmRFbCldXHJcbiAgICAgICAgc2VsQ2FyZC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgICAgICB0aGlzLnN0b3JlZFNlbEVscy5zcGxpY2UodGhpcy5zdG9yZWRTZWxFbHMuaW5kZXhPZihzZWxDYXJkRWwpLCAxKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgLy8gZ2V0IGNvcnJvc3BvbmRpbmcgb2JqZWN0IHVzaW5nIHRoZSBjYXJkRWwgaWRcclxuICAgIGNvbnN0IHNlbE9iaiA9IGNvcnJPYmpMaXN0LmZpbmQoKHgpID0+IHtcclxuICAgICAgY29uc3QgeENhcmQgPSB4IGFzIENhcmRcclxuICAgICAgcmV0dXJuIHhDYXJkLmdldENhcmRJZCgpID09PSBzZWxDYXJkRWwuaWRcclxuICAgIH0pXHJcblxyXG4gICAgLy8gZXJyb3IgaWYgdGhlcmUgaXMgbm8gY29ycm9zcG9uZGluZyBvYmplY3RcclxuICAgIGlmICghc2VsT2JqKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICBgVGhlcmUgaXMgbm8gY29ycm9zcG9uZGluZyBvYmplY3QgdG8gdGhlIHNlbGVjdGVkIGNhcmQsIG1lYW5pbmcgdGhlIGlkIG9mIHRoZSBjYXJkIGVsZW1lbnQgXFxcclxuICAgICAgZG9lcyBub3QgbWF0Y2ggYW55IG9mIHRoZSBjb3Jyb3Nwb25kaW5nICdjYXJkSWQnIGF0dHJpYnR1ZXMuIEVuc3VyZSB0aGF0IHRoZSBjYXJkSWQgYXR0cmlidXRlIFxcXHJcbiAgICAgIGlzIGFzc2lnbmVkIGFzIHRoZSBjYXJkIGVsZW1lbnRzIEhUTUwgJ2lkJyB3aGVuIHRoZSBjYXJkIGlzIGNyZWF0ZWQuYFxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gdW5zZWxlY3QgdGhlIHByZXZpb3VzbHkgc2VsZWN0ZWQgY2FyZCBpZiBpdCBleGlzdHMgYW5kIGlmIHdlIGFyZSBhbGxvd2VkIHRvb1xyXG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuc3RvcmVkU2VsRWxzKS5sZW5ndGggPiAwICYmIHVuc2VsZWN0UHJldmlvdXMpIHtcclxuICAgICAgY29uc3Qgc3RvcmVkRWwgPSB0aGlzLnN0b3JlZFNlbEVscy5wb3AoKVxyXG4gICAgICBpZiAoc3RvcmVkRWwgIT09IHVuZGVmaW5lZCkgeyBzdG9yZWRFbC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCkgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG9uIGNsaWNrIGFkZCB0aGUgJ3NlbGVjdGVkJyBjbGFzcyBvbnRvIHRoZSBlbGVtZW50IHdoaWNoIHJ1bnMgYSB0cmFuc2l0aW9uXHJcbiAgICBzZWxDYXJkRWwuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnN0b3JlZFNlbEVscy5wdXNoKHNlbENhcmRFbClcclxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XHJcbiAgICAgIGNhbGxiYWNrKHNlbE9iailcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBNYW5hZ2VzIGFkZGluZyBjZXJ0YWluIHByb3BlcnRpZXMgcmVhbHRpbmcgdG8gc2Nyb2xsaW5nIHRleHQgd2hlbiBlbnRlcmluZ1xyXG4gICAqIGEgY2FyZCBlbGVtZW50LiBXZSBhc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgc2Nyb2xsaW5nIHRleHQgb24gdGhlIGNhcmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVudGVyaW5nQ2FyZEVsIC0gZWxlbWVudCB5b3UgYXJlIGVudGVyaW5nLCB0aGF0IGNvbnRhaW5zIHRoZSBzY3JvbGxpbmcgdGV4dFxyXG4gICAqL1xyXG4gIHNjcm9sbFRleHRPbkNhcmRFbnRlciAoZW50ZXJpbmdDYXJkRWw6IEVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHNjcm9sbGluZ1RleHQgPSBlbnRlcmluZ0NhcmRFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFxyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgKVswXSBhcyBIVE1MRWxlbWVudFxyXG4gICAgY29uc3QgcGFyZW50ID0gc2Nyb2xsaW5nVGV4dC5wYXJlbnRFbGVtZW50XHJcblxyXG4gICAgaWYgKGlzRWxsaXBzaXNBY3RpdmUoc2Nyb2xsaW5nVGV4dCkpIHtcclxuICAgICAgcGFyZW50Py5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxMZWZ0KVxyXG4gICAgICBzY3JvbGxpbmdUZXh0LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcClcclxuICAgICAgdGhpcy5ydW5TY3JvbGxpbmdUZXh0QW5pbShzY3JvbGxpbmdUZXh0LCBlbnRlcmluZ0NhcmRFbClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBTdGFydHMgdG8gc2Nyb2xsIHRleHQgZnJvbSBsZWZ0IHRvIHJpZ2h0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBzY3JvbGxpbmdUZXh0IC0gZWxlbWVudCBjb250YWluaW5nIHRoZSB0ZXh0IHRoYXQgd2lsbCBzY3JvbGxcclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGNhcmRFbCAtIGNhcmQgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBzY3JvbGxpbmcgdGV4dFxyXG4gICAqL1xyXG4gIHJ1blNjcm9sbGluZ1RleHRBbmltIChzY3JvbGxpbmdUZXh0OiBFbGVtZW50LCBjYXJkRWw6IEVsZW1lbnQpIHtcclxuICAgIGNvbnN0IExJTkdFUl9BTVQgPSAyMFxyXG4gICAgY29uc3QgZm9udCA9IHdpbmRvd1xyXG4gICAgICAuZ2V0Q29tcHV0ZWRTdHlsZShzY3JvbGxpbmdUZXh0LCBudWxsKVxyXG4gICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnZm9udCcpXHJcblxyXG4gICAgaWYgKHNjcm9sbGluZ1RleHQudGV4dENvbnRlbnQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTY3JvbGxpbmcgdGV4dCBlbGVtZW50IGRvZXMgbm90IGNvbnRhaW4gYW55IHRleHQgY29udGVudCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLmN1cnJTY3JvbGxpbmdBbmltID0gc2Nyb2xsaW5nVGV4dC5hbmltYXRlKFxyXG4gICAgICBbXHJcbiAgICAgICAgLy8ga2V5ZnJhbWVzXHJcbiAgICAgICAgeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDBweCknIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlWCgke1xyXG4gICAgICAgICAgICAtZ2V0VGV4dFdpZHRoKHNjcm9sbGluZ1RleHQudGV4dENvbnRlbnQsIGZvbnQpIC0gTElOR0VSX0FNVFxyXG4gICAgICAgICAgfXB4KWBcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHtcclxuICAgICAgICAvLyB0aW1pbmcgb3B0aW9uc1xyXG4gICAgICAgIGR1cmF0aW9uOiA1MDAwLFxyXG4gICAgICAgIGl0ZXJhdGlvbnM6IDFcclxuICAgICAgfVxyXG4gICAgKVxyXG5cclxuICAgIHRoaXMuY3VyclNjcm9sbGluZ0FuaW0ub25maW5pc2ggPSAoKSA9PiB0aGlzLnNjcm9sbFRleHRPbkNhcmRMZWF2ZShjYXJkRWwpXHJcbiAgfVxyXG5cclxuICAvKiogTWFuYWdlcyByZW1vdmluZyBjZXJ0YWluIHByb3BlcnRpZXMgcmVsYXRpbmcgdG8gc2Nyb2xsaW5nIHRleHQgb25jZSBsZWF2aW5nXHJcbiAgICogYSBjYXJkIGVsZW1lbnQuIFdlIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSBzY3JvbGxpbmcgdGV4dCBvbiB0aGUgY2FyZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SFRNTH0gbGVhdmluZ0NhcmRFbCAtIGVsZW1lbnQgeW91IGFyZSBsZWF2aW5nLCB0aGF0IGNvbnRhaW5zIHRoZSBzY3JvbGxpbmcgdGV4dFxyXG4gICAqL1xyXG4gIHNjcm9sbFRleHRPbkNhcmRMZWF2ZSAobGVhdmluZ0NhcmRFbDogRWxlbWVudCkge1xyXG4gICAgY29uc3Qgc2Nyb2xsaW5nVGV4dCA9IGxlYXZpbmdDYXJkRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIClbMF1cclxuICAgIGNvbnN0IHBhcmVudCA9IHNjcm9sbGluZ1RleHQucGFyZW50RWxlbWVudFxyXG5cclxuICAgIHBhcmVudD8uY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsTGVmdClcclxuICAgIHNjcm9sbGluZ1RleHQuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwKVxyXG4gICAgdGhpcy5jdXJyU2Nyb2xsaW5nQW5pbT8uY2FuY2VsKClcclxuICB9XHJcblxyXG4gIGNsZWFyU2VsZWN0ZWRFbHMgKCkge1xyXG4gICAgdGhpcy5zdG9yZWRTZWxFbHMuc3BsaWNlKDAsIHRoaXMuc3RvcmVkU2VsRWxzLmxlbmd0aClcclxuICB9XHJcblxyXG4gIGFkZEFsbEV2ZW50TGlzdGVuZXJzIChcclxuICAgIGNhcmRzOiBBcnJheTxFbGVtZW50PixcclxuICAgIG9iakFycjogQXJyYXk8Q2FyZD4sXHJcbiAgICBjbGlja0NhbGxCYWNrOiBudWxsIHwgKChzZWxPYmo6IHVua25vd24pID0+IHZvaWQpLFxyXG4gICAgYWxsb3dVbnNlbGVjdGVkOiBib29sZWFuLFxyXG4gICAgdW5zZWxlY3RQcmV2aW91czogYm9vbGVhblxyXG4gICkge1xyXG4gICAgdGhpcy5jbGVhclNlbGVjdGVkRWxzKClcclxuXHJcbiAgICBjYXJkcy5mb3JFYWNoKCh0cmFja0NhcmQpID0+IHtcclxuICAgICAgdHJhY2tDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2dCkgPT4ge1xyXG4gICAgICAgIC8vIGlmIHRoZSBlbGVtZW50IHJlc3RyaWN0cyBmbGlwIG9uIGNsaWNrIHRoZW4gZG9udCBmbGlwIHRoZSBjYXJkXHJcbiAgICAgICAgaWYgKChldnQhLnRhcmdldCBhcyBIVE1MRWxlbWVudCk/LmdldEF0dHJpYnV0ZShjb25maWcuQ1NTLkFUVFJJQlVURVMucmVzdHJpY3RGbGlwT25DbGljaykpIHtcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9uQ2FyZENsaWNrKFxyXG4gICAgICAgICAgdHJhY2tDYXJkLFxyXG4gICAgICAgICAgb2JqQXJyLFxyXG4gICAgICAgICAgY2xpY2tDYWxsQmFjayxcclxuICAgICAgICAgIGFsbG93VW5zZWxlY3RlZCxcclxuICAgICAgICAgIHVuc2VsZWN0UHJldmlvdXNcclxuICAgICAgICApXHJcbiAgICAgIH1cclxuICAgICAgKVxyXG4gICAgICB0cmFja0NhcmQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcclxuICAgICAgICB0aGlzLnNjcm9sbFRleHRPbkNhcmRFbnRlcih0cmFja0NhcmQpXHJcbiAgICAgIH0pXHJcbiAgICAgIHRyYWNrQ2FyZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsVGV4dE9uQ2FyZExlYXZlKHRyYWNrQ2FyZClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcbiIsImNsYXNzIENhcmQge1xyXG4gIGNhcmRJZDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLmNhcmRJZCA9ICcnXHJcbiAgfVxyXG5cclxuICBnZXRDYXJkSWQgKCkge1xyXG4gICAgaWYgKHRoaXMuY2FyZElkID09PSAnbnVsbCcpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYXJkIGlkIHdhcyBhc2tpbmcgdG8gYmUgcmV0cmlldmVkIGJ1dCBpcyBudWxsJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNhcmRJZFxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FyZFxyXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMDkgTmljaG9sYXMgQy4gWmFrYXMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuICovXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHNpbmdsZSBub2RlIGluIGEgRG91Ymx5TGlua2VkTGlzdC5cclxuICogQGNsYXNzIERvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4ge1xyXG4gIGRhdGE6IFQ7XHJcbiAgbmV4dDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgcHJldmlvdXM6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIERvdWJseUxpbmtlZExpc3ROb2RlLlxyXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBzdG9yZSBpbiB0aGUgbm9kZS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciAoZGF0YTogVCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGF0YSB0aGF0IHRoaXMgbm9kZSBzdG9yZXMuXHJcbiAgICAgKiBAcHJvcGVydHkgZGF0YVxyXG4gICAgICogQHR5cGUgKlxyXG4gICAgICovXHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgRG91Ymx5TGlua2VkTGlzdC5cclxuICAgICAqIEBwcm9wZXJ0eSBuZXh0XHJcbiAgICAgKiBAdHlwZSA/RG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5uZXh0ID0gbnVsbFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBwb2ludGVyIHRvIHRoZSBwcmV2aW91cyBub2RlIGluIHRoZSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gICAgICogQHByb3BlcnR5IHByZXZpb3VzXHJcbiAgICAgKiBAdHlwZSA/RG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5wcmV2aW91cyA9IG51bGxcclxuICB9XHJcbn1cclxuLyoqXHJcbiAqIEEgZG91Ymx5IGxpbmtlZCBsaXN0IGltcGxlbWVudGF0aW9uIGluIEphdmFTY3JpcHQuXHJcbiAqIEBjbGFzcyBEb3VibHlMaW5rZWRMaXN0XHJcbiAqL1xyXG5jbGFzcyBEb3VibHlMaW5rZWRMaXN0PFQ+IHtcclxuICBoZWFkOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuICB0YWlsOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIERvdWJseUxpbmtlZExpc3RcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAvLyBwb2ludGVyIHRvIGZpcnN0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgIHRoaXMuaGVhZCA9IG51bGxcclxuXHJcbiAgICAvLyBwb2ludGVyIHRvIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdCB3aGljaCBwb2ludHMgdG8gbnVsbFxyXG4gICAgdGhpcy50YWlsID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwZW5kcyBzb21lIGRhdGEgdG8gdGhlIGVuZCBvZiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqL1xyXG4gIGFkZCAoZGF0YTogVCk6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4oZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBCZWNhdXNlIHRoZXJlIGFyZSBubyBub2RlcyBpbiB0aGUgbGlzdCwganVzdCBzZXQgdGhlXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIHBvaW50ZXIgdG8gdGhlIG5ldyBub2RlLlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogVW5saWtlIGluIGEgc2luZ2x5IGxpbmtlZCBsaXN0LCB3ZSBoYXZlIGEgZGlyZWN0IHJlZmVyZW5jZSB0b1xyXG4gICAgICAgKiB0aGUgbGFzdCBub2RlIGluIHRoZSBsaXN0LiBTZXQgdGhlIGBuZXh0YCBwb2ludGVyIG9mIHRoZVxyXG4gICAgICAgKiBjdXJyZW50IGxhc3Qgbm9kZSB0byBgbmV3Tm9kZWAgaW4gb3JkZXIgdG8gYXBwZW5kIHRoZSBuZXcgZGF0YVxyXG4gICAgICAgKiB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LiBUaGVuLCBzZXQgYG5ld05vZGUucHJldmlvdXNgIHRvIHRoZSBjdXJyZW50XHJcbiAgICAgICAqIHRhaWwgdG8gZW5zdXJlIGJhY2t3YXJkcyB0cmFja2luZyB3b3JrLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKHRoaXMudGFpbCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMudGFpbC5uZXh0ID0gbmV3Tm9kZVxyXG4gICAgICB9XHJcbiAgICAgIG5ld05vZGUucHJldmlvdXMgPSB0aGlzLnRhaWxcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogTGFzdCwgcmVzZXQgYHRoaXMudGFpbGAgdG8gYG5ld05vZGVgIHRvIGVuc3VyZSB3ZSBhcmUgc3RpbGxcclxuICAgICAqIHRyYWNraW5nIHRoZSBsYXN0IG5vZGUgY29ycmVjdGx5LlxyXG4gICAgICovXHJcbiAgICB0aGlzLnRhaWwgPSBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnNlcnRzIHNvbWUgZGF0YSBpbnRvIHRoZSBtaWRkbGUgb2YgdGhlIGxpc3QuIFRoaXMgbWV0aG9kIHRyYXZlcnNlc1xyXG4gICAqIHRoZSBleGlzdGluZyBsaXN0IGFuZCBwbGFjZXMgdGhlIGRhdGEgaW4gYSBuZXcgbm9kZSBhdCBhIHNwZWNpZmljIGluZGV4LlxyXG4gICAqIEBwYXJhbSB7VH0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIGluc2VydCB0aGUgZGF0YS5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiB0aGUgaW5kZXggZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBpbnNlcnRCZWZvcmUgKGRhdGE6IFQsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlKGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFNwZWNpYWwgY2FzZTogaWYgYGluZGV4YCBpcyBgMGAsIHRoZW4gbm8gdHJhdmVyc2FsIGlzIG5lZWRlZFxyXG4gICAgICogYW5kIHdlIG5lZWQgdG8gdXBkYXRlIGB0aGlzLmhlYWRgIHRvIHBvaW50IHRvIGBuZXdOb2RlYC5cclxuICAgICAqL1xyXG4gICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEVuc3VyZSB0aGUgbmV3IG5vZGUncyBgbmV4dGAgcHJvcGVydHkgaXMgcG9pbnRlZCB0byB0aGUgY3VycmVudFxyXG4gICAgICAgKiBoZWFkLlxyXG4gICAgICAgKi9cclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgY3VycmVudCBoZWFkJ3MgYHByZXZpb3VzYCBwcm9wZXJ0eSBuZWVkcyB0byBwb2ludCB0byB0aGUgbmV3XHJcbiAgICAgICAqIG5vZGUgdG8gZW5zdXJlIHRoZSBsaXN0IGlzIHRyYXZlcnNhYmxlIGJhY2t3YXJkcy5cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaGVhZC5wcmV2aW91cyA9IG5ld05vZGVcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIE5vdyBpdCdzIHNhZmUgdG8gc2V0IGB0aGlzLmhlYWRgIHRvIHRoZSBuZXcgbm9kZSwgZWZmZWN0aXZlbHlcclxuICAgICAgICogbWFraW5nIHRoZSBuZXcgbm9kZSB0aGUgZmlyc3Qgbm9kZSBpbiB0aGUgbGlzdC5cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaGVhZCA9IG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAgICogZ29uZS4gVGhpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGkgPSAwXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcyB1c2luZyBgbmV4dGAgcG9pbnRlcnMsIGFuZCBtYWtlXHJcbiAgICAgICAqIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC4gV2hlblxyXG4gICAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgICAqIGluc2VydCB0aGUgbmV3IGRhdGEuXHJcbiAgICAgICAqL1xyXG4gICAgICB3aGlsZSAoY3VycmVudC5uZXh0ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgICAgICBpKytcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIGlzIGVpdGhlciB0aGUgbm9kZSB0byBpbnNlcnQgdGhlIG5ldyBkYXRhXHJcbiAgICAgICAqIGJlZm9yZSwgb3IgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gVGhlIG9ubHkgd2F5IHRvIHRlbGwgaXMgaWZcclxuICAgICAgICogYGlgIGlzIHN0aWxsIGxlc3MgdGhhbiBgaW5kZXhgLCB0aGF0IG1lYW5zIHRoZSBpbmRleCBpcyBvdXQgb2YgcmFuZ2VcclxuICAgICAgICogYW5kIGFuIGVycm9yIHNob3VsZCBiZSB0aHJvd24uXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoaSA8IGluZGV4KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIElmIGNvZGUgY29udGludWVzIHRvIGV4ZWN1dGUgaGVyZSwgaXQgbWVhbnMgYGN1cnJlbnRgIGlzIHRoZSBub2RlXHJcbiAgICAgICAqIHRvIGluc2VydCBuZXcgZGF0YSBiZWZvcmUuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEZpcnN0LCBpbnNlcnQgYG5ld05vZGVgIGFmdGVyIGBjdXJyZW50LnByZXZpb3VzYCBieSB1cGRhdGluZ1xyXG4gICAgICAgKiBgY3VycmVudC5wcmV2aW91cy5uZXh0YCBhbmQgYG5ld05vZGUucHJldmlvdXNgLlxyXG4gICAgICAgKi9cclxuICAgICAgY3VycmVudCEucHJldmlvdXMhLm5leHQgPSBuZXdOb2RlXHJcbiAgICAgIG5ld05vZGUhLnByZXZpb3VzID0gY3VycmVudC5wcmV2aW91c1xyXG5cclxuICAgICAgLypcclxuICAgICAgICogTmV4dCwgaW5zZXJ0IGBjdXJyZW50YCBhZnRlciBgbmV3Tm9kZWAgYnkgdXBkYXRpbmcgYG5ld05vZGUubmV4dGAgYW5kXHJcbiAgICAgICAqIGBjdXJyZW50LnByZXZpb3VzYC5cclxuICAgICAgICovXHJcbiAgICAgIG5ld05vZGUubmV4dCA9IGN1cnJlbnRcclxuICAgICAgY3VycmVudC5wcmV2aW91cyA9IG5ld05vZGVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc2VydHMgc29tZSBkYXRhIGludG8gdGhlIG1pZGRsZSBvZiB0aGUgbGlzdC4gVGhpcyBtZXRob2QgdHJhdmVyc2VzXHJcbiAgICogdGhlIGV4aXN0aW5nIGxpc3QgYW5kIHBsYWNlcyB0aGUgZGF0YSBpbiBhIG5ldyBub2RlIGFmdGVyIGEgc3BlY2lmaWMgaW5kZXguXHJcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggYWZ0ZXIgd2hpY2ggdG8gaW5zZXJ0IHRoZSBkYXRhLlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIHRoZSBpbmRleCBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGluc2VydEFmdGVyIChkYXRhOiBULCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgaW5zZXJ0ZWQgaW50byB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZShkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICogdXNlZCBpbnNpZGUgb2YgdGhlIGxvb3AgYmVsb3cuIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG9cclxuICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gaW5zZXJ0IGludG8uXHJcbiAgICAgKi9cclxuICAgIGxldCBpID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcyBzaW1pbGFyIHRvIHRoZSBgYWRkKClgIG1ldGhvZCwgYnV0IG1ha2VcclxuICAgICAqIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZCBhbmQgdXBkYXRlXHJcbiAgICAgKiB0aGUgYHByZXZpb3VzYCBwb2ludGVyIGluIGFkZGl0aW9uIHRvIGBjdXJyZW50YC4gV2hlblxyXG4gICAgICogYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0b1xyXG4gICAgICogaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgICAgaSsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIEF0IHRoaXMgcG9pbnQsIGBjdXJyZW50YCBpcyBlaXRoZXIgdGhlIG5vZGUgdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YVxyXG4gICAgICogYmVmb3JlLCBvciB0aGUgbGFzdCBub2RlIGluIHRoZSBsaXN0LiBUaGUgb25seSB3YXkgdG8gdGVsbCBpcyBpZlxyXG4gICAgICogYGlgIGlzIHN0aWxsIGxlc3MgdGhhbiBgaW5kZXhgLCB0aGF0IG1lYW5zIHRoZSBpbmRleCBpcyBvdXQgb2YgcmFuZ2VcclxuICAgICAqIGFuZCBhbiBlcnJvciBzaG91bGQgYmUgdGhyb3duLlxyXG4gICAgICovXHJcbiAgICBpZiAoaSA8IGluZGV4KSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBjb2RlIGNvbnRpbnVlcyB0byBleGVjdXRlIGhlcmUsIGl0IG1lYW5zIGBjdXJyZW50YCBpcyB0aGUgbm9kZVxyXG4gICAgICogdG8gaW5zZXJ0IG5ldyBkYXRhIGFmdGVyLlxyXG4gICAgICovXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBgY3VycmVudGAgaXMgdGhlIHRhaWwsIHNvIHJlc2V0IGB0aGlzLnRhaWxgXHJcbiAgICBpZiAodGhpcy50YWlsID09PSBjdXJyZW50KSB7XHJcbiAgICAgIHRoaXMudGFpbCA9IG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIE90aGVyd2lzZSwgaW5zZXJ0IGBuZXdOb2RlYCBiZWZvcmUgYGN1cnJlbnQubmV4dGAgYnkgdXBkYXRpbmdcclxuICAgICAgICogYGN1cnJlbnQubmV4dC5wcmV2aW91c2AgYW5kIGBuZXdOb2RlLm5vZGVgLlxyXG4gICAgICAgKi9cclxuICAgICAgY3VycmVudCEubmV4dCEucHJldmlvdXMgPSBuZXdOb2RlXHJcbiAgICAgIG5ld05vZGUubmV4dCA9IGN1cnJlbnQhLm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogTmV4dCwgaW5zZXJ0IGBuZXdOb2RlYCBhZnRlciBgY3VycmVudGAgYnkgdXBkYXRpbmcgYG5ld05vZGUucHJldmlvdXNgIGFuZFxyXG4gICAgICogYGN1cnJlbnQubmV4dGAuXHJcbiAgICAgKi9cclxuICAgIG5ld05vZGUucHJldmlvdXMgPSBjdXJyZW50XHJcbiAgICBjdXJyZW50IS5uZXh0ID0gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBkYXRhIGluIHRoZSBnaXZlbiBwb3NpdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG5vZGUgd2hvc2UgZGF0YVxyXG4gICAqICAgICAgc2hvdWxkIGJlIHJldHVybmVkLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZGF0YSBpbiB0aGUgXCJkYXRhXCIgcG9ydGlvbiBvZiB0aGUgZ2l2ZW4gbm9kZVxyXG4gICAqICAgICAgb3IgdW5kZWZpbmVkIGlmIHRoZSBub2RlIGRvZXNuJ3QgZXhpc3QuXHJcbiAgICovXHJcbiAgZ2V0IChpbmRleDogbnVtYmVyLCBhc05vZGU6IGJvb2xlYW4pOiBUIHwgRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4ge1xyXG4gICAgLy8gZW5zdXJlIGBpbmRleGAgaXMgYSBwb3NpdGl2ZSB2YWx1ZVxyXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAgICogdXNlZCBpbnNpZGUgb2YgdGhlIGxvb3AgYmVsb3cuIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG9cclxuICAgICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gaW5zZXJ0IGludG8uXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzLCBidXQgbWFrZSBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnlcclxuICAgICAgICogbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQgYW5kIHVwZGF0ZSB0aGUgYHByZXZpb3VzYCBwb2ludGVyIGluXHJcbiAgICAgICAqIGFkZGl0aW9uIHRvIGBjdXJyZW50YC4gV2hlbiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnNcclxuICAgICAgICogd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvIGluc2VydCB0aGUgbmV3IGRhdGEuXHJcbiAgICAgICAqL1xyXG4gICAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgICAgaSsrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEF0IHRoaXMgcG9pbnQsIGBjdXJyZW50YCBtaWdodCBiZSBudWxsIGlmIHdlJ3ZlIGdvbmUgcGFzdCB0aGVcclxuICAgICAgICogZW5kIG9mIHRoZSBsaXN0LiBJbiB0aGF0IGNhc2UsIHdlIHJldHVybiBgdW5kZWZpbmVkYCB0byBpbmRpY2F0ZVxyXG4gICAgICAgKiB0aGF0IHRoZSBub2RlIGF0IGBpbmRleGAgd2FzIG5vdCBmb3VuZC4gSWYgYGN1cnJlbnRgIGlzIG5vdFxyXG4gICAgICAgKiBgbnVsbGAsIHRoZW4gaXQncyBzYWZlIHRvIHJldHVybiBgY3VycmVudC5kYXRhYC5cclxuICAgICAgICovXHJcbiAgICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgICAgaWYgKGFzTm9kZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnQuZGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW5kZXggJHtpbmRleH0gb3V0IG9mIHJhbmdlYClcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGluZGV4ICR7aW5kZXh9IG91dCBvZiByYW5nZWApXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIGluZGV4IG9mIHRoZSBkYXRhIGluIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7VH0gZGF0YSBUaGUgZGF0YSB0byBzZWFyY2ggZm9yLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGRhdGEgaW4gdGhlIGxpc3RcclxuICAgKiAgICAgIG9yIC0xIGlmIG5vdCBmb3VuZC5cclxuICAgKi9cclxuICBpbmRleE9mIChkYXRhOiBUKTogbnVtYmVyIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGluZGV4YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdGhpcyBpcyB0aGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZFxyXG4gICAgICogZnJvbSB0aGlzIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgbGV0IGluZGV4ID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGlzIGxvb3AgY2hlY2tzIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCB0byBzZWUgaWYgaXQgbWF0Y2hlcyBgZGF0YWAuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIGBpbmRleGAgaW1tZWRpYXRlbHksIGV4aXRpbmcgdGhlXHJcbiAgICAgKiBsb29wIGJlY2F1c2UgdGhlcmUncyBubyByZWFzb24gdG8ga2VlcCBzZWFyY2hpbmcuIFRoZSBzZWFyY2hcclxuICAgICAqIGNvbnRpbnVlcyB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBub2RlcyB0byBzZWFyY2ggKHdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCkuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGlmIChjdXJyZW50LmRhdGEgPT09IGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gaW5kZXhcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvLyBrZWVwIHRyYWNrIG9mIHdoZXJlIHdlIGFyZVxyXG4gICAgICBpbmRleCsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gLTEgYXMgdGhlIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiAtMVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXRjaGVyIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgd2hlbiBhbiBpdGVtIG1hdGNoZXNcclxuICAgKiAgICAgIGFuZCBmYWxzZSB3aGVuIGFuIGl0ZW0gZG9lc24ndCBtYXRjaC5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGZpcnN0IGl0ZW0gdGhhdCByZXR1cm5zIHRydWUgZnJvbSB0aGUgbWF0Y2hlciwgdW5kZWZpbmVkXHJcbiAgICogICAgICBpZiBubyBpdGVtcyBtYXRjaC5cclxuICAgKi9cclxuICBmaW5kIChtYXRjaGVyOiAoYXJnMDogVCkgPT4gYm9vbGVhbiwgYXNOb2RlID0gZmFsc2UpIDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBUIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIHRoZSBkYXRhIGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAobWF0Y2hlcihjdXJyZW50LmRhdGEpKSB7XHJcbiAgICAgICAgaWYgKGFzTm9kZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQuZGF0YVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiBgdW5kZWZpbmVkYCBhcyB0aGVcclxuICAgICAqIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdObyBtYXRjaGluZyBkYXRhIGZvdW5kJylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpdGVtIHRoYXQgbWF0Y2hlcyBhIGdpdmVuIGZ1bmN0aW9uLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1hdGNoZXIgQSBmdW5jdGlvbiByZXR1cm5pbmcgdHJ1ZSB3aGVuIGFuIGl0ZW0gbWF0Y2hlc1xyXG4gICAqICAgICAgYW5kIGZhbHNlIHdoZW4gYW4gaXRlbSBkb2Vzbid0IG1hdGNoLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvblxyXG4gICAqICAgICAgb3IgLTEgaWYgdGhlcmUgYXJlIG5vIG1hdGNoaW5nIGl0ZW1zLlxyXG4gICAqL1xyXG4gIGZpbmRJbmRleCAobWF0Y2hlcjogKGFyZzA6IFQpID0+IGJvb2xlYW4pOiBudW1iZXIge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGluZGV4YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdGhpcyBpcyB0aGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZFxyXG4gICAgICogZnJvbSB0aGlzIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgbGV0IGluZGV4ID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGlzIGxvb3AgY2hlY2tzIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCB0byBzZWUgaWYgaXQgbWF0Y2hlcy5cclxuICAgICAqIElmIGEgbWF0Y2ggaXMgZm91bmQsIGl0IHJldHVybnMgdGhlIGluZGV4IGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAobWF0Y2hlcihjdXJyZW50LmRhdGEpKSB7XHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8ga2VlcCB0cmFjayBvZiB3aGVyZSB3ZSBhcmVcclxuICAgICAgaW5kZXgrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIC0xIGFzIHRoZVxyXG4gICAgICogXCJub3QgZm91bmRcIiB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgcmV0dXJuIC0xXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHRoZSBub2RlIGZyb20gdGhlIGdpdmVuIGxvY2F0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgbm9kZSB0byByZW1vdmUuXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBkYXRhIGluIHRoZSBnaXZlbiBwb3NpdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiBpbmRleCBpcyBvdXQgb2YgcmFuZ2UuXHJcbiAgICovXHJcbiAgcmVtb3ZlIChpbmRleDogbnVtYmVyKSA6IFQge1xyXG4gICAgLy8gc3BlY2lhbCBjYXNlczogbm8gbm9kZXMgaW4gdGhlIGxpc3Qgb3IgYGluZGV4YCBpcyBuZWdhdGl2ZVxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCB8fCBpbmRleCA8IDApIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiByZW1vdmluZyB0aGUgZmlyc3Qgbm9kZVxyXG4gICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgIC8vIHN0b3JlIHRoZSBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaGVhZFxyXG4gICAgICBjb25zdCBkYXRhOiBUID0gdGhpcy5oZWFkLmRhdGFcclxuXHJcbiAgICAgIC8vIGp1c3QgcmVwbGFjZSB0aGUgaGVhZCB3aXRoIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgdGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHRcclxuXHJcbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogdGhlcmUgd2FzIG9ubHkgb25lIG5vZGUsIHNvIGFsc28gcmVzZXQgYHRoaXMudGFpbGBcclxuICAgICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMudGFpbCA9IG51bGxcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmhlYWQucHJldmlvdXMgPSBudWxsXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJldHVybiB0aGUgZGF0YSBhdCB0aGUgcHJldmlvdXMgaGVhZCBvZiB0aGUgbGlzdFxyXG4gICAgICByZXR1cm4gZGF0YVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIGxldCBpID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcyBzaW1pbGFyIHRvIHRoZSBgZ2V0KClgIG1ldGhvZCwgYnV0IG1ha2VcclxuICAgICAqIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC4gV2hlblxyXG4gICAgICogYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0b1xyXG4gICAgICogcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvLyBpbmNyZW1lbnQgdGhlIGNvdW50XHJcbiAgICAgIGkrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBgY3VycmVudGAgaXNuJ3QgYG51bGxgLCB0aGVuIHRoYXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIG5vZGVcclxuICAgICAqIHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgaWYgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgLy8gc2tpcCBvdmVyIHRoZSBub2RlIHRvIHJlbW92ZVxyXG4gICAgICBjdXJyZW50IS5wcmV2aW91cyEubmV4dCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogSWYgd2UgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QsIHRoZW4gdXBkYXRlIGB0aGlzLnRhaWxgLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBJZiB3ZSBhcmUgbm90IGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QsIHRoZW4gdXBkYXRlIHRoZSBiYWNrd2FyZHNcclxuICAgICAgICogcG9pbnRlciBmb3IgYGN1cnJlbnQubmV4dGAgdG8gcHJlc2VydmUgcmV2ZXJzZSB0cmF2ZXJzYWwuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAodGhpcy50YWlsID09PSBjdXJyZW50KSB7XHJcbiAgICAgICAgdGhpcy50YWlsID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGN1cnJlbnQhLm5leHQhLnByZXZpb3VzID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdGhlIHZhbHVlIHRoYXQgd2FzIGp1c3QgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0XHJcbiAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgd2UndmUgbWFkZSBpdCB0aGlzIGZhciwgaXQgbWVhbnMgYGluZGV4YCBpcyBhIHZhbHVlIHRoYXRcclxuICAgICAqIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QsIHNvIHRocm93IGFuIGVycm9yLlxyXG4gICAgICovXHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYWxsIG5vZGVzIGZyb20gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICovXHJcbiAgY2xlYXIgKCk6IHZvaWQge1xyXG4gICAgLy8ganVzdCByZXNldCBib3RoIHRoZSBoZWFkIGFuZCB0YWlsIHBvaW50ZXIgdG8gbnVsbFxyXG4gICAgdGhpcy5oZWFkID0gbnVsbFxyXG4gICAgdGhpcy50YWlsID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIG5vZGVzIGluIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgZ2V0IHNpemUgKCk6IG51bWJlciB7XHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IHRoZSBsaXN0IGlzIGVtcHR5XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiAwXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY291bnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBub2RlcyBoYXZlXHJcbiAgICAgKiBiZWVuIHZpc2l0ZWQgaW5zaWRlIHRoZSBsb29wIGJlbG93LiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXNcclxuICAgICAqIGlzIHRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGlzIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgbGV0IGNvdW50ID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGF0IG1lYW5zIHdlJ3JlIG5vdCB5ZXQgYXQgdGhlXHJcbiAgICAgKiBlbmQgb2YgdGhlIGxpc3QsIHNvIGFkZGluZyAxIHRvIGBjb3VudGAgYW5kIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGNvdW50KytcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBXaGVuIGBjdXJyZW50YCBpcyBgbnVsbGAsIHRoZSBsb29wIGlzIGV4aXRlZCBhdCB0aGUgdmFsdWUgb2YgYGNvdW50YFxyXG4gICAgICogaXMgdGhlIG51bWJlciBvZiBub2RlcyB0aGF0IHdlcmUgY291bnRlZCBpbiB0aGUgbG9vcC5cclxuICAgICAqL1xyXG4gICAgcmV0dXJuIGNvdW50XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgZGVmYXVsdCBpdGVyYXRvciBmb3IgdGhlIGNsYXNzLlxyXG4gICAqIEByZXR1cm5zIHtJdGVyYXRvcn0gQW4gaXRlcmF0b3IgZm9yIHRoZSBjbGFzcy5cclxuICAgKi9cclxuICBbU3ltYm9sLml0ZXJhdG9yXSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy52YWx1ZXMoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuIGl0ZXJhdG9yIHRoYXQgcmV0dXJucyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge0dlbmVyYXRvcn0gQW4gaXRlcmF0b3Igb24gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgKiB2YWx1ZXMgKCk6IEdlbmVyYXRvcjxULCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoZXJlIGlzIGEgcGllY2Ugb2YgZGF0YVxyXG4gICAgICogdG8geWllbGQuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIHlpZWxkIGN1cnJlbnQuZGF0YVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gaXRlcmF0b3IgdGhhdCByZXR1cm5zIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCBpbiByZXZlcnNlIG9yZGVyLlxyXG4gICAqIEByZXR1cm5zIHtHZW5lcmF0b3J9IEFuIGl0ZXJhdG9yIG9uIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gICogcmV2ZXJzZSAoKTogR2VuZXJhdG9yPFQsIHZvaWQsIHVua25vd24+IHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgdGFpbCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLnRhaWxcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhlcmUgaXMgYSBwaWVjZSBvZiBkYXRhXHJcbiAgICAgKiB0byB5aWVsZC5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgeWllbGQgY3VycmVudC5kYXRhXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnByZXZpb3VzXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyB0aGUgbGlzdCBpbnRvIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIHRvU3RyaW5nICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIFsuLi50aGlzXS50b1N0cmluZygpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyB0aGUgZG91Ymx5IGxpbmtlZCBsaXN0IHRvIGFuIGFycmF5LlxyXG4gICAqIEByZXR1cm5zIHtBcnJheTxUPn0gQW4gYXJyYXkgb2YgdGhlIGRhdGEgZnJvbSB0aGUgbGlua2VkIGxpc3QuXHJcbiAgICovXHJcbiAgdG9BcnJheSAoKTogQXJyYXk8VD4ge1xyXG4gICAgcmV0dXJuIFsuLi50aGlzXVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG91Ymx5TGlua2VkTGlzdFxyXG5leHBvcnQgZnVuY3Rpb25cclxuYXJyYXlUb0RvdWJseUxpbmtlZExpc3QgPFQ+IChhcnI6IEFycmF5PFQ+KSB7XHJcbiAgY29uc3QgbGlzdCA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFQ+KClcclxuICBhcnIuZm9yRWFjaCgoZGF0YSkgPT4ge1xyXG4gICAgbGlzdC5hZGQoZGF0YSlcclxuICB9KVxyXG5cclxuICByZXR1cm4gbGlzdFxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIHByb21pc2VIYW5kbGVyLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgaHRtbFRvRWwsXHJcbiAgc2h1ZmZsZVxyXG59IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHsgYXJyYXlUb0RvdWJseUxpbmtlZExpc3QsIERvdWJseUxpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCBQbGF5YWJsZUV2ZW50QXJnIGZyb20gJy4vcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzJ1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vcHVic3ViL2FnZ3JlZ2F0b3InXHJcbmltcG9ydCB7IElQbGF5YWJsZSB9IGZyb20gJy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgU3BvdGlmeVBsYXliYWNrRWxlbWVudCBmcm9tICcuL3Nwb3RpZnktcGxheWJhY2stZWxlbWVudCdcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRWb2x1bWUgKCkge1xyXG4gIGNvbnN0IHsgcmVzLCBlcnIgfSA9IGF3YWl0IHByb21pc2VIYW5kbGVyKGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRQbGF5ZXJWb2x1bWVEYXRhKSlcclxuXHJcbiAgaWYgKGVycikge1xyXG4gICAgcmV0dXJuIDBcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIHJlcyEuZGF0YVxyXG4gIH1cclxufVxyXG5hc3luYyBmdW5jdGlvbiBzYXZlVm9sdW1lICh2b2x1bWU6IHN0cmluZykge1xyXG4gIHByb21pc2VIYW5kbGVyKGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRQbGF5ZXJWb2x1bWVEYXRhKHZvbHVtZSkpKVxyXG59XHJcbmV4cG9ydCBjb25zdCBwbGF5ZXJQdWJsaWNWYXJzID0ge1xyXG4gIGlzU2h1ZmZsZTogZmFsc2UsXHJcbiAgaXNMb29wOiBmYWxzZVxyXG59XHJcbmNsYXNzIFNwb3RpZnlQbGF5YmFjayB7XHJcbiAgcHJpdmF0ZSBwbGF5ZXI6IGFueTtcclxuICAvLyBjb250cm9scyB0aW1pbmcgb2YgYXN5bmMgYWN0aW9ucyB3aGVuIHdvcmtpbmcgd2l0aCB3ZWJwbGF5ZXIgc2RrXHJcbiAgcHJpdmF0ZSBpc0V4ZWN1dGluZ0FjdGlvbjogYm9vbGVhbjtcclxuICBwcml2YXRlIGRldmljZV9pZDogc3RyaW5nO1xyXG4gIHB1YmxpYyBzZWxQbGF5aW5nOiB7XHJcbiAgICBlbGVtZW50OiBudWxsIHwgRWxlbWVudFxyXG4gICAgdHJhY2tfdXJpOiBzdHJpbmdcclxuICAgIC8vIHRoaXMgbm9kZSBtYXkgYmUgYSBzaHVmZmxlZCBvciB1bnNodWZmbGVkIG5vZGVcclxuICAgIHBsYXlhYmxlTm9kZTogbnVsbCB8IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIC8vIHRoaXMgYXJyYXkgaXMgYWx3YXlzIGluIHN0YW5kYXJkIG9yZGVyIGFuZCBuZXZlciBzaHVmZmxlZC5cclxuICAgIHBsYXlhYmxlQXJyOiBudWxsIHwgQXJyYXk8SVBsYXlhYmxlPlxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTdGF0ZUludGVydmFsOiBOb2RlSlMuVGltZW91dCB8IG51bGw7XHJcbiAgcHJpdmF0ZSB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudDtcclxuICBwcml2YXRlIHBsYXllcklzUmVhZHk6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSB3YXNJblNodWZmbGUgPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICB0aGlzLnBsYXllciA9IG51bGxcclxuICAgIHRoaXMuZGV2aWNlX2lkID0gJydcclxuICAgIHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCA9IG51bGxcclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcgPSB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgIHRyYWNrX3VyaTogJycsXHJcbiAgICAgIHBsYXlhYmxlTm9kZTogbnVsbCxcclxuICAgICAgcGxheWFibGVBcnI6IG51bGxcclxuICAgIH1cclxuICAgIHRoaXMucGxheWVySXNSZWFkeSA9IGZhbHNlXHJcblxyXG4gICAgLy8gcmVsb2FkIHBsYXllciBldmVyeSAzMCBtaW4gdG8gYXZvaWQgdGltZW91dCdzXHJcbiAgICB0aGlzLl9sb2FkV2ViUGxheWVyKClcclxuXHJcbiAgICAvLyBwYXNzIGl0IHRoZSBcInRoaXMuXCIgYXR0cmlidXRlcyBpbiB0aGlzIHNjb3BlIGJlY2F1c2Ugd2hlbiBhIGZ1bmN0aW9uIGlzIGNhbGxlZCBmcm9tIGEgZGlmZmVyZW50IGNsYXNzIHRoZSBcInRoaXMuXCIgYXR0cmlidXRlcyBhcmUgdW5kZWZpbmVkLlxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbCA9IG5ldyBTcG90aWZ5UGxheWJhY2tFbGVtZW50KClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0Vm9sdW1lIChwZXJjZW50YWdlOiBudW1iZXIsIHBsYXllcjogYW55LCBzYXZlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IG5ld1ZvbHVtZSA9IHBlcmNlbnRhZ2UgLyAxMDBcclxuICAgIHBsYXllci5zZXRWb2x1bWUobmV3Vm9sdW1lKVxyXG5cclxuICAgIGlmIChzYXZlKSB7XHJcbiAgICAgIHNhdmVWb2x1bWUobmV3Vm9sdW1lLnRvU3RyaW5nKCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHRpbWUgc2hvd24gd2hlbiBzZWVraW5nLlxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFRoZSBwZXJjZW50IHRoYXQgdGhlIGJhciBoYXMgZmlsbGVkIHdpdGggcmVzcGVjdCB0byB0aGUgZW50aXJlIGJhclxyXG4gICAqIEBwYXJhbSB3ZWJQbGF5ZXJFbCBUaGUgd2VicGxheWVyIGVsZW1lbnQgdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblNlZWtpbmcgKHBlcmNlbnRhZ2U6IG51bWJlciwgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQpIHtcclxuICAgIC8vIGdldCB0aGUgcG9zaXRpb24gYnkgdXNpbmcgdGhlIHBlcmNlbnQgdGhlIHByb2dyZXNzIGJhci5cclxuICAgIGNvbnN0IHNlZWtQb3NpdGlvbiA9IHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4ICogKHBlcmNlbnRhZ2UgLyAxMDApXHJcbiAgICBpZiAod2ViUGxheWVyRWwuY3VyclRpbWUgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgdGltZSBlbGVtZW50IGlzIG51bGwnKVxyXG4gICAgfVxyXG4gICAgLy8gdXBkYXRlIHRoZSB0ZXh0IGNvbnRlbnQgdG8gc2hvdyB0aGUgdGltZSB0aGUgdXNlciB3aWxsIGJlIHNlZWtpbmcgdG9vIG9ubW91c2V1cC5cclxuICAgIHdlYlBsYXllckVsLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhzZWVrUG9zaXRpb24pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgc2Vla2luZyBhY3Rpb24gYmVnaW5zXHJcbiAgICogQHBhcmFtIHBsYXllciBUaGUgc3BvdGlmeSBzZGsgcGxheWVyIHdob3NlIHN0YXRlIHdlIHdpbGwgdXNlIHRvIGNoYW5nZSB0aGUgc29uZydzIHByb2dyZXNzIGJhcidzIG1heCB2YWx1ZSB0byB0aGUgZHVyYXRpb24gb2YgdGhlIHNvbmcuXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIFRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdGhhdCB3aWxsIGFsbG93IHVzIHRvIG1vZGlmeSB0aGUgcHJvZ3Jlc3MgYmFycyBtYXggYXR0cmlidXRlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25TZWVrU3RhcnQgKHBsYXllcjogYW55LCB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudCkge1xyXG4gICAgcGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IGR1cmF0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICdVc2VyIGlzIG5vdCBwbGF5aW5nIG11c2ljIHRocm91Z2ggdGhlIFdlYiBQbGF5YmFjayBTREsnXHJcbiAgICAgICAgKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIC8vIHdoZW4gZmlyc3Qgc2Vla2luZywgdXBkYXRlIHRoZSBtYXggYXR0cmlidXRlIHdpdGggdGhlIGR1cmF0aW9uIG9mIHRoZSBzb25nIGZvciB1c2Ugd2hlbiBzZWVraW5nLlxyXG4gICAgICB3ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLm1heCA9IHN0YXRlLmR1cmF0aW9uXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gcnVuIHdoZW4geW91IHdpc2ggdG8gc2VlayB0byBhIGNlcnRhaW4gcG9zaXRpb24gaW4gYSBzb25nLlxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFRoZSBwZXJjZW50IHRoYXQgdGhlIGJhciBoYXMgZmlsbGVkIHdpdGggcmVzcGVjdCB0byB0aGUgZW50aXJlIGJhclxyXG4gICAqIEBwYXJhbSBwbGF5ZXIgdGhlIHNwb3RpZnkgc2RrIHBsYXllciB0aGF0IHdpbGwgc2VlayB0aGUgc29uZyB0byBhIGdpdmVuIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2Vla1NvbmcgKHBlcmNlbnRhZ2U6IG51bWJlciwgcGxheWVyOiBhbnksIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24pIHtcclxuICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuICAgICAgLy8gb2J0YWluIHRoZSBmaW5hbCBwb3NpdGlvbiB0aGUgdXNlciB3aXNoZXMgdG8gc2VlayBvbmNlIG1vdXNlIGlzIHVwLlxyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IChwZXJjZW50YWdlIC8gMTAwKSAqIHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4XHJcblxyXG4gICAgICAvLyBzZWVrIHRvIHRoZSBjaG9zZW4gcG9zaXRpb24uXHJcbiAgICAgIHBsYXllci5zZWVrKHBvc2l0aW9uKS50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgX2xvYWRXZWJQbGF5ZXIgKCkge1xyXG4gICAgLy8gbG9hZCB0aGUgdXNlcnMgc2F2ZWQgdm9sdW1lIGlmIHRoZXJlIGlzbnQgdGhlbiBsb2FkIDAuNCBhcyBkZWZhdWx0LlxyXG4gICAgY29uc3Qgdm9sdW1lID0gYXdhaXQgbG9hZFZvbHVtZSgpXHJcblxyXG4gICAgY29uc3QgTk9fQ09OVEVOVCA9IDIwNFxyXG4gICAgaWYgKHdpbmRvdy5TcG90aWZ5KSB7XHJcbiAgICAgIC8vIGlmIHRoZSBzcG90aWZ5IHNkayBpcyBhbHJlYWR5IGRlZmluZWQgc2V0IHBsYXllciB3aXRob3V0IHNldHRpbmcgb25TcG90aWZ5V2ViUGxheWJhY2tTREtSZWFkeSBtZWFuaW5nIHRoZSB3aW5kb3c6IFdpbmRvdyBpcyBpbiBhIGRpZmZlcmVudCBzY29wZVxyXG4gICAgICAvLyB1c2Ugd2luZG93LlNwb3RpZnkuUGxheWVyIGFzIHNwb3RpZnkgbmFtZXNwYWNlIGlzIGRlY2xhcmVkIGluIHRoZSBXaW5kb3cgaW50ZXJmYWNlIGFzIHBlciBEZWZpbml0ZWx5VHlwZWQgLT4gc3BvdGlmeS13ZWItcGxheWJhY2stc2RrIC0+IGluZGV4LmQudHMgaHR0cHM6Ly9naXRodWIuY29tL0RlZmluaXRlbHlUeXBlZC9EZWZpbml0ZWx5VHlwZWQvdHJlZS9tYXN0ZXIvdHlwZXMvc3BvdGlmeS13ZWItcGxheWJhY2stc2RrXHJcbiAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgbmFtZTogJ1Nwb3RpZnkgSW5mbyBXZWIgUGxheWVyJyxcclxuICAgICAgICBnZXRPQXV0aFRva2VuOiAoY2IpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXQgYXV0aCB0b2tlbicpXHJcbiAgICAgICAgICBwcm9taXNlSGFuZGxlcihheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0UmVmcmVzaEFjY2Vzc1Rva2VuKSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBwcm9taXNlSGFuZGxlcjxBeGlvc1Jlc3BvbnNlPHN0cmluZyB8IG51bGw+PihheGlvcy5yZXF1ZXN0PHN0cmluZyB8IG51bGw+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRBY2Nlc3NUb2tlbiB9KSwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzID09PSBOT19DT05URU5UIHx8IHJlcy5kYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FjY2VzcyB0b2tlbiBoYXMgbm8gY29udGVudCcpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAgY2IocmVzLmRhdGEpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdm9sdW1lOiB2b2x1bWVcclxuICAgICAgfSlcclxuICAgICAgdGhpcy5fYWRkTGlzdGVuZXJzKHZvbHVtZSlcclxuICAgICAgdGhpcy5wbGF5ZXIuY29ubmVjdCgpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBvZiBzcG90aWZ5IHNkayBpcyB1bmRlZmluZWRcclxuICAgICAgd2luZG93Lm9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgLy8gaWYgZ2V0dGluZyB0b2tlbiB3YXMgc3VjY2VzZnVsIGNyZWF0ZSBzcG90aWZ5IHBsYXllciB1c2luZyB0aGUgd2luZG93IGluIHRoaXMgc2NvcGVcclxuICAgICAgICB0aGlzLnBsYXllciA9IG5ldyB3aW5kb3cuU3BvdGlmeS5QbGF5ZXIoe1xyXG4gICAgICAgICAgbmFtZTogJ1Nwb3RpZnkgSW5mbyBXZWIgUGxheWVyJyxcclxuICAgICAgICAgIGdldE9BdXRoVG9rZW46IChjYikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ2V0IGF1dGggdG9rZW4nKVxyXG4gICAgICAgICAgICBwcm9taXNlSGFuZGxlcihheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0UmVmcmVzaEFjY2Vzc1Rva2VuKSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHByb21pc2VIYW5kbGVyPEF4aW9zUmVzcG9uc2U8c3RyaW5nIHwgbnVsbD4+KGF4aW9zLnJlcXVlc3Q8c3RyaW5nIHwgbnVsbD4oeyBtZXRob2Q6ICdHRVQnLCB1cmw6IGNvbmZpZy5VUkxzLmdldEFjY2Vzc1Rva2VuIH0pLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gTk9fQ09OVEVOVCB8fCByZXMuZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FjY2VzcyB0b2tlbiBoYXMgbm8gY29udGVudCcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBnaXZlIHRoZSB0b2tlbiB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgICAgY2IocmVzLmRhdGEpXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB2b2x1bWU6IHZvbHVtZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5fYWRkTGlzdGVuZXJzKHZvbHVtZSlcclxuICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfYWRkTGlzdGVuZXJzIChsb2FkZWRWb2x1bWU6IHN0cmluZykge1xyXG4gICAgLy8gRXJyb3IgaGFuZGxpbmdcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdpbml0aWFsaXphdGlvbl9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdhdXRoZW50aWNhdGlvbl9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgICBjb25zb2xlLmxvZygncGxheWJhY2sgY291bGRudCBzdGFydCcpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2FjY291bnRfZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcigncGxheWJhY2tfZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gUGxheWJhY2sgc3RhdHVzIHVwZGF0ZXNcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdwbGF5ZXJfc3RhdGVfY2hhbmdlZCcsIChzdGF0ZTogU3BvdGlmeS5QbGF5YmFja1N0YXRlIHwgbnVsbCkgPT4geyB9KVxyXG5cclxuICAgIC8vIFJlYWR5XHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcigncmVhZHknLCAoeyBkZXZpY2VfaWQgfTogeyBkZXZpY2VfaWQ6IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdSZWFkeSB3aXRoIERldmljZSBJRCcsIGRldmljZV9pZClcclxuICAgICAgdGhpcy5kZXZpY2VfaWQgPSBkZXZpY2VfaWRcclxuXHJcbiAgICAgIC8vIGFwcGVuZCB3ZWIgcGxheWVyIGVsZW1lbnQgdG8gRE9NXHJcbiAgICAgIHRoaXMud2ViUGxheWVyRWwuYXBwZW5kV2ViUGxheWVySHRtbChcclxuICAgICAgICAoKSA9PiB0aGlzLnRyeVBsYXlQcmV2KHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUpLFxyXG4gICAgICAgICgpID0+IHRoaXMudHJ5V2ViUGxheWVyUGF1c2UodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKSxcclxuICAgICAgICAoKSA9PiB0aGlzLm9uU2Vla1N0YXJ0KHRoaXMucGxheWVyLCB0aGlzLndlYlBsYXllckVsKSxcclxuICAgICAgICAocGVyY2VudGFnZSkgPT4gdGhpcy5zZWVrU29uZyhwZXJjZW50YWdlLCB0aGlzLnBsYXllciwgdGhpcy53ZWJQbGF5ZXJFbCksXHJcbiAgICAgICAgKHBlcmNlbnRhZ2UpID0+IHRoaXMub25TZWVraW5nKHBlcmNlbnRhZ2UsIHRoaXMud2ViUGxheWVyRWwpLFxyXG4gICAgICAgIChwZXJjZW50YWdlLCBzYXZlKSA9PiB0aGlzLnNldFZvbHVtZShwZXJjZW50YWdlLCB0aGlzLnBsYXllciwgc2F2ZSksXHJcbiAgICAgICAgcGFyc2VGbG9hdChsb2FkZWRWb2x1bWUpXHJcbiAgICAgIClcclxuICAgICAgdGhpcy5wbGF5ZXJJc1JlYWR5ID0gdHJ1ZVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBOb3QgUmVhZHlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdub3RfcmVhZHknLCAoeyBkZXZpY2VfaWQgfTogeyBkZXZpY2VfaWQ6IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdEZXZpY2UgSUQgaGFzIGdvbmUgb2ZmbGluZScsIGRldmljZV9pZClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0RHVyYXRpb24gKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSB0cnVlXHJcbiAgICAgIHRoaXMucGxheWVyLnNlZWsoMCkudGhlbigoKSA9PiB7IHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZSB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZXMgdG8gcGF1c2UgdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZSBmcm9tIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5V2ViUGxheWVyUGF1c2UgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgdGhlIGZpcnN0IG5vZGUgb3IgaWYgYW4gYWN0aW9uIGlzIHByb2Nlc3NpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiAmJiBjdXJyTm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICBjb25zdCBwcmV2VHJhY2sgPSBjdXJyTm9kZS5kYXRhXHJcbiAgICAgIGNvbnNvbGUubG9nKCdUcnkgcGxheWVyIHBhdXNlJylcclxuICAgICAgdGhpcy5zZXRTZWxQbGF5aW5nRWwobmV3IFBsYXlhYmxlRXZlbnRBcmcocHJldlRyYWNrLCBjdXJyTm9kZSwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIHBsYXkgdGhlIHByZXZpb3VzIElQbGF5YWJsZSBnaXZlbiB0aGUgY3VycmVudCBwbGF5aW5nIElQbGF5YWJsZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5UGxheVByZXYgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgaWYgKGN1cnJOb2RlID09PSBudWxsKSB7XHJcbiAgICAgIC8vIChpZiB0aGUgcGxheWVyIGhhcyBqdXN0IGJlZW4gcHV0IGludG8gc2h1ZmZsZSBtb2RlIHRoZW4gdGhlcmUgc2hvdWxkIGJlIG5vIHByZXZpb3VzIHBsYXlhYmxlcyB0byBnbyBiYWNrIHRvbylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBsYXllclB1YmxpY1ZhcnMuaXNMb29wKSB7XHJcbiAgICAgIHRoaXMucmVzZXREdXJhdGlvbigpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nIHdlIGNhbm5vdCBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IHBvc2l0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICAgIGlmIChzdGF0ZS5wb3NpdGlvbiA+IDEwMDApIHtcclxuICAgICAgICAgIHRoaXMucmVzZXREdXJhdGlvbigpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGlmIHRoZSBwbGF5ZXIgSVMgaW4gc2h1ZmZsZSBtb2RlXHJcbiAgICAgICAgICBpZiAocGxheWVyUHVibGljVmFycy5pc1NodWZmbGUgJiYgIXRoaXMud2FzSW5TaHVmZmxlKSB7IHJldHVybiB9XHJcbiAgICAgICAgICBsZXQgcHJldlRyYWNrTm9kZSA9IGN1cnJOb2RlLnByZXZpb3VzXHJcblxyXG4gICAgICAgICAgLy8gaWYgdGhlIHBsYXllciBXQVMgaW4gc2h1ZmZsZSBtb2RlXHJcbiAgICAgICAgICBpZiAoIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlICYmIHRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgICAgICAgIHByZXZUcmFja05vZGUgPSB0aGlzLnVuU2h1ZmZsZSgtMSlcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAocHJldlRyYWNrTm9kZSA9PT0gbnVsbCkgeyByZXR1cm4gfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHByZXZUcmFjayA9IHByZXZUcmFja05vZGUuZGF0YVxyXG4gICAgICAgICAgdGhpcy5zZXRTZWxQbGF5aW5nRWwobmV3IFBsYXlhYmxlRXZlbnRBcmcocHJldlRyYWNrLCBwcmV2VHJhY2tOb2RlLCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIHBsYXkgdGhlIG5leHQgSVBsYXlhYmxlIGdpdmVuIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY3Vyck5vZGUgLSB0aGUgY3VycmVudCBJUGxheWFibGUgbm9kZSB0aGF0IHdhcy9pcyBwbGF5aW5nXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlQbGF5TmV4dCAoY3Vyck5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICBpZiAoY3Vyck5vZGUgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gb25jZSBhIHRyYWNrIGF1dG9tYXRpY2FsbHkgZmluaXNoZXMgd2UgY2Fubm90IHJlc2V0IGl0cyBkdXJhdGlvbiBzbyB3ZSBwbGF5IHRoZSB0cmFjayBhZ2FpbiBpbnN0ZWFkXHJcbiAgICBpZiAocGxheWVyUHVibGljVmFycy5pc0xvb3ApIHtcclxuICAgICAgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucGxheShjdXJyTm9kZS5kYXRhLnVyaSksIG5ldyBQbGF5YWJsZUV2ZW50QXJnKGN1cnJOb2RlLmRhdGEsIGN1cnJOb2RlLCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpLCB0cnVlKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBhbiBhY3Rpb24gaXMgcHJvY2Vzc2luZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIGxldCBuZXh0VHJhY2tOb2RlID0gY3Vyck5vZGUubmV4dFxyXG5cclxuICAgICAgaWYgKCF0aGlzLndhc0luU2h1ZmZsZSAmJiBwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSkge1xyXG4gICAgICAgIC8vIGJ5IGNhbGxpbmcgdGhpcyBiZWZvcmUgYXNzaWduaW5nIHRoZSBuZXh0IG5vZGUsIHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpIG11c3QgcmV0dXJuIGJhY2sgdGhlIG5leHQgbm9kZVxyXG4gICAgICAgIG5leHRUcmFja05vZGUgPSB0aGlzLnNodWZmbGVQbGF5YWJsZXMoKVxyXG5cclxuICAgICAgICAvLyBjYWxsIGFmdGVyIHRvIGVuc3VyZSB0aGF0IHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpIHJ1bnMgdGhlIGlmIHN0YXRlbWVudCB0aGF0IHJldHVybnMgdGhlIG5leHQgbm9kZVxyXG4gICAgICAgIHRoaXMud2FzSW5TaHVmZmxlID0gdHJ1ZVxyXG4gICAgICB9IGVsc2UgaWYgKCFwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSAmJiB0aGlzLndhc0luU2h1ZmZsZSkge1xyXG4gICAgICAgIG5leHRUcmFja05vZGUgPSB0aGlzLnVuU2h1ZmZsZSgxKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiBzaHVmZmxlIGlzIG5vdCBvbmUgYW5kIHRoaXMgbm9kZSBpcyBudWxsLCB0aGVuIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBwbGF5bGlzdCBhbmQgY2Fubm90IHBsYXkgbmV4dC5cclxuICAgICAgaWYgKG5leHRUcmFja05vZGUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zZXRTZWxQbGF5aW5nRWwobmV3IFBsYXlhYmxlRXZlbnRBcmcobmV4dFRyYWNrTm9kZS5kYXRhLCBuZXh0VHJhY2tOb2RlLCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21wbGV0ZWx5RGVzZWxlY3RUcmFjayAoKSB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWxlY3RlZCBwbGF5aW5nIGVsZW1lbnQgd2FzIG51bGwgYmVmb3JlIGRlc2VsZWN0aW9uIG9uIHNvbmcgZmluaXNoJylcclxuICAgIH1cclxuICAgIHRoaXMucGF1c2VEZXNlbGVjdFRyYWNrKClcclxuICAgIHRoaXMuc2VsUGxheWluZy50cmFja191cmkgPSAnJ1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXVzZURlc2VsZWN0VHJhY2sgKCkge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VsZWN0ZWQgcGxheWluZyBlbGVtZW50IHdhcyBudWxsIGJlZm9yZSBkZXNlbGVjdGlvbiBvbiBzb25nIGZpbmlzaCcpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZT8uZGF0YS5vblN0b3BwZWQoKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnBsYXlQYXVzZT8uY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IG51bGxcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2VsZWN0VHJhY2sgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcjogYm9vbGVhbikge1xyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9IGV2ZW50QXJnLnBsYXlhYmxlTm9kZVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyID0gZXZlbnRBcmcucGxheWFibGVBcnJcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMuc2VsUGxheWluZy50cmFja191cmkgPSBldmVudEFyZy5jdXJyUGxheWFibGUudXJpXHJcblxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5wbGF5UGF1c2U/LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5zZXRUaXRsZShldmVudEFyZy5jdXJyUGxheWFibGUudGl0bGUsIGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmkpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNldEltZ1NyYyhldmVudEFyZy5jdXJyUGxheWFibGUuaW1hZ2VVcmwpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNldEFydGlzdHMoZXZlbnRBcmcuY3VyclBsYXlhYmxlLmFydGlzdHNIdG1sKVxyXG5cclxuICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGU/LmRhdGEub25QbGF5aW5nKClcclxuXHJcbiAgICAvLyB3ZSBjYW4gY2FsbCBhZnRlciBhc3NpZ25pbmcgcGxheWFibGUgbm9kZSBhcyBpdCBkb2VzIG5vdCBjaGFuZ2Ugd2hpY2ggbm9kZSBpcyBwbGF5ZWRcclxuICAgIGlmICghcGxheVRocnVXZWJQbGF5ZXIgJiYgcGxheWVyUHVibGljVmFycy5pc1NodWZmbGUpIHtcclxuICAgICAgdGhpcy5zaHVmZmxlUGxheWFibGVzKClcclxuICAgIH0gZWxzZSBpZiAoIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlICYmIHRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSB0aGlzLnVuU2h1ZmZsZSgwKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvblRyYWNrRmluaXNoICgpIHtcclxuICAgIHRoaXMuY29tcGxldGVseURlc2VsZWN0VHJhY2soKVxyXG5cclxuICAgIHRoaXMud2ViUGxheWVyRWwuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSAnMTAwJSdcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsIGFzIE5vZGVKUy5UaW1lb3V0KVxyXG4gICAgdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhbiBpbnRlcnZhbCB0aGF0IG9idGFpbnMgdGhlIHN0YXRlIG9mIHRoZSBwbGF5ZXIgZXZlcnkgc2Vjb25kLlxyXG4gICAqIFNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIGEgc29uZyBpcyBwbGF5aW5nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0R2V0U3RhdGVJbnRlcnZhbCAoKSB7XHJcbiAgICBsZXQgZHVyYXRpb25NaW5TZWMgPSAnJ1xyXG4gICAgaWYgKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbClcclxuICAgIH1cclxuICAgIC8vIHNldCB0aGUgaW50ZXJ2YWwgdG8gcnVuIGV2ZXJ5IHNlY29uZCBhbmQgb2J0YWluIHRoZSBzdGF0ZVxyXG4gICAgdGhpcy5nZXRTdGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICB0aGlzLnBsYXllci5nZXRDdXJyZW50U3RhdGUoKS50aGVuKChzdGF0ZTogeyBwb3NpdGlvbjogYW55OyBkdXJhdGlvbjogYW55IH0pID0+IHtcclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAnVXNlciBpcyBub3QgcGxheWluZyBtdXNpYyB0aHJvdWdoIHRoZSBXZWIgUGxheWJhY2sgU0RLJ1xyXG4gICAgICAgICAgKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHsgcG9zaXRpb24sIGR1cmF0aW9uIH0gPSBzdGF0ZVxyXG5cclxuICAgICAgICAvLyBpZiB0aGVyZSBpc250IGEgZHVyYXRpb24gc2V0IGZvciB0aGlzIHNvbmcgc2V0IGl0LlxyXG4gICAgICAgIGlmIChkdXJhdGlvbk1pblNlYyA9PT0gJycpIHtcclxuICAgICAgICAgIGR1cmF0aW9uTWluU2VjID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhkdXJhdGlvbilcclxuICAgICAgICAgIHRoaXMud2ViUGxheWVyRWwhLmR1cmF0aW9uIS50ZXh0Q29udGVudCA9IGR1cmF0aW9uTWluU2VjXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwZXJjZW50RG9uZSA9IChwb3NpdGlvbiAvIGR1cmF0aW9uKSAqIDEwMFxyXG5cclxuICAgICAgICAvLyB0aGUgcG9zaXRpb24gZ2V0cyBzZXQgdG8gMCB3aGVuIHRoZSBzb25nIGlzIGZpbmlzaGVkXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLm9uVHJhY2tGaW5pc2goKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBpZiB0aGUgcG9zaXRpb24gaXNudCAwIHVwZGF0ZSB0aGUgd2ViIHBsYXllciBlbGVtZW50c1xyXG4gICAgICAgICAgdGhpcy53ZWJQbGF5ZXJFbC51cGRhdGVFbGVtZW50KHBlcmNlbnREb25lLCBwb3NpdGlvbilcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9LCA1MDApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWxlY3QgYSBjZXJ0YWluIHBsYXkvcGF1c2UgZWxlbWVudCBhbmQgcGxheSB0aGUgZ2l2ZW4gdHJhY2sgdXJpXHJcbiAgICogYW5kIHVuc2VsZWN0IHRoZSBwcmV2aW91cyBvbmUgdGhlbiBwYXVzZSB0aGUgcHJldmlvdXMgdHJhY2tfdXJpLlxyXG4gICAqXHJcbiAgICogVGhlIHJlYXNzaWduaW5nIG9mIGVsZW1lbnRzIGlzIGluIHRoZSBjYXNlIHRoYXQgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgdGhyb3VnaCB0aGUgd2ViIHBsYXllciBlbGVtZW50LFxyXG4gICAqIGFzIHRoZXJlIGlzIGEgY2hhbmNlIHRoYXQgdGhlIHNlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCBpcyBlaXRoZXIgbm9uLWV4aXN0ZW50LCBvciBpcyBkaWZmZXJlbnQgdGhlbiB0aGVuXHJcbiAgICogdGhlIHByZXZpb3VzIGkuZS4gcmVyZW5kZXJlZCwgb3IgaGFzIGFuIGVxdWl2YWxlbnQgZWxlbWVudCB3aGVuIG9uIGZvciBleGFtcGxlIGEgZGlmZmVyZW50IHRlcm0gdGFiLlxyXG4gICAqXHJcbiAgICogUmVhc3NpZ25pbmcgaXMgZG9uZSBzbyB0aGF0IHRoZSBwb3RlbnRpYWxseSBkaWZmZXJlbnQgZXF1aXZhbGVudCBlbGVtZW50IGNhbiBhY3QgYXMgdGhlIGluaXRpYWxseVxyXG4gICAqIHNlbGVjdGVkIGVsZW1lbnQsIGluIHNob3dpbmcgcGF1c2UvcGxheSBzeW1ib2xzIGluIGFjY29yZGFuY2UgdG8gd2hldGhlciB0aGVcclxuICAgKiBzb25nIHdhcyBwYXVzZWQvcGxheWVkIHRocm91Z2ggdGhlIHdlYiBwbGF5ZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BsYXlhYmxlRXZlbnRBcmd9IGV2ZW50QXJnIC0gYSBjbGFzcyB0aGF0IGNvbnRhaW5zIHRoZSBjdXJyZW50LCBuZXh0IGFuZCBwcmV2aW91cyB0cmFja3MgdG8gcGxheVxyXG4gICAqL1xyXG4gIHB1YmxpYyBhc3luYyBzZXRTZWxQbGF5aW5nRWwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllciA9IHRydWUpIHtcclxuICAgIC8vIGlmIHRoZSBwbGF5ZXIgaXNuJ3QgcmVhZHkgd2UgY2Fubm90IGNvbnRpbnVlLlxyXG4gICAgaWYgKCF0aGlzLnBsYXllcklzUmVhZHkpIHtcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXllciBpcyBub3QgcmVhZHknKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGlmICh0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuXHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgIT0gbnVsbCkge1xyXG4gICAgICAvLyBzdG9wIHRoZSBwcmV2aW91cyB0cmFjayB0aGF0IHdhcyBwbGF5aW5nXHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGU/LmRhdGEub25TdG9wcGVkKClcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwgYXMgTm9kZUpTLlRpbWVvdXQpXHJcblxyXG4gICAgICAvLyByZWFzc2lnbiB0aGUgZWxlbWVudCBpZiBpdCBleGlzdHMgYXMgaXQgbWF5IGhhdmUgYmVlbiByZXJlbmRlcmVkIGFuZCB0aGVyZWZvcmUgdGhlIHByZXZpb3VzIHZhbHVlIGlzIHBvaW50aW5nIHRvIG5vdGhpbmdcclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5pZCkgPz8gdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnRcclxuXHJcbiAgICAgIC8vIGlmIGl0cyB0aGUgc2FtZSBlbGVtZW50IHRoZW4gcGF1c2VcclxuICAgICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmlkID09PSBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwuaWQpIHtcclxuICAgICAgICB0aGlzLnBhdXNlRGVzZWxlY3RUcmFjaygpXHJcbiAgICAgICAgYXdhaXQgdGhpcy5wYXVzZSgpXHJcbiAgICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGNvbXBsZXRlbHkgZGVzZWxlY3QgdGhlIGN1cnJlbnQgdHJhY2sgYmVmb3JlIHNlbGVjdGluZyBhbm90aGVyIG9uZSB0byBwbGF5XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZWx5RGVzZWxlY3RUcmFjaygpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwcmV2IHRyYWNrIHVyaSBpcyB0aGUgc2FtZSB0aGVuIHJlc3VtZSB0aGUgc29uZyBpbnN0ZWFkIG9mIHJlcGxheWluZyBpdC5cclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID09PSBldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSB7XHJcbiAgICAgIC8vIHRoaXMgc2VsRWwgY291bGQgY29ycm9zcG9uZCB0byB0aGUgc2FtZSBzb25nIGJ1dCBpcyBhbiBlbGVtZW50IHRoYXQgaXMgbm9uLWV4aXN0ZW50LCBzbyByZWFzc2lnbiBpdCB0byBhIGVxdWl2YWxlbnQgZXhpc3RpbmcgZWxlbWVudCBpZiB0aGlzIGlzIHRoZSBjYXNlLlxyXG4gICAgICBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwuaWQpID8/IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbFxyXG5cclxuICAgICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucmVzdW1lKCksIGV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcilcclxuICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCdzdGFydCB0cmFjaycpXHJcbiAgICBhd2FpdCB0aGlzLnN0YXJ0VHJhY2soYXN5bmMgKCkgPT4gdGhpcy5wbGF5KGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmkpLCBldmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIpXHJcbiAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgc3RhcnRUcmFjayAocGxheWluZ0FzeW5jRnVuYzogRnVuY3Rpb24sIGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcjogYm9vbGVhbikge1xyXG4gICAgdGhpcy5zZWxlY3RUcmFjayhldmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIpXHJcblxyXG4gICAgYXdhaXQgcGxheWluZ0FzeW5jRnVuYygpXHJcblxyXG4gICAgLy8gc2V0IHBsYXlpbmcgc3RhdGUgb25jZSBzb25nIHN0YXJ0cyBwbGF5aW5nXHJcbiAgICB0aGlzLnNldEdldFN0YXRlSW50ZXJ2YWwoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2h1ZmZsZXMgdGhlIHBsYXlhYmxlcyBhbmQgZWl0aGVyIHJldHVybnMgdGhlIGN1cnJlbnQgbm9kZSBvciB0aGUgbmV4dCBub2RlIHRoYXQgYm90aCBwb2ludCB0byBhIHNodWZmbGVkIHZlcnNpb24gb2YgdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge0RvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT59IGVpdGhlciB0aGUgbmV4dCBvciBjdXJyZW50IG5vZGUgaW4gdGhlIHNodWZmbGVkIGxpc3QuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzaHVmZmxlUGxheWFibGVzICgpOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIgPT0gbnVsbCB8fCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlID09IG51bGwpIHRocm93IG5ldyBFcnJvcignbm8gc2VsIHBsYXlpbmcnKVxyXG4gICAgY29uc29sZS5sb2coJ3NodWZmbGUnKVxyXG4gICAgY29uc3Qgc2VsUGxheWFibGUgPSB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlLmRhdGFcclxuXHJcbiAgICAvLyBzaHVmZmxlIGFycmF5XHJcbiAgICBjb25zdCB0cmFja0FyciA9IHNodWZmbGUodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKVxyXG5cclxuICAgIC8vIHJlbW92ZSB0aGlzIHRyYWNrIGZyb20gdGhlIGFycmF5XHJcbiAgICBjb25zdCBpbmRleCA9IHRyYWNrQXJyLmluZGV4T2Yoc2VsUGxheWFibGUpXHJcbiAgICB0cmFja0Fyci5zcGxpY2UoaW5kZXgsIDEpXHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgYSBkb3VibHkgbGlua2VkIGxpc3RcclxuICAgIGNvbnN0IHNodWZmbGVkTGlzdCA9IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0KHRyYWNrQXJyKVxyXG5cclxuICAgIC8vIHBsYWNlIHRoaXMgdHJhY2sgYXQgdGhlIGZyb250IG9mIHRoZSBsaXN0XHJcbiAgICBzaHVmZmxlZExpc3QuaW5zZXJ0QmVmb3JlKHNlbFBsYXlhYmxlLCAwKVxyXG5cclxuICAgIGxldCBuZXdOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICBpZiAoIXRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbmV4dCBub2RlIGFzIHRoaXMgc2hvdWxkIHJ1biBiZWZvcmUgdGhlIG5leHQgbm9kZSBpcyBjaG9zZW4uXHJcbiAgICAgIG5ld05vZGUgPSBzaHVmZmxlZExpc3QuZ2V0KDEsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbmV3IG5vZGUgd2hpY2ggaGFzIGlkZW50aWNhbCBkYXRhIGFzIHRoZSBvbGQgb25lLCBidXQgaXMgbm93IHBhcnQgb2YgdGhlIHNodWZmbGVkIGRvdWJseSBsaW5rZWQgbGlzdFxyXG4gICAgICBuZXdOb2RlID0gc2h1ZmZsZWRMaXN0LmdldCgwLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSBuZXdOb2RlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW5zaHVmZmxlcyB0aGUgcGxheWFibGVzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXIgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSBpbmRleCB0byBhZGQgb3IgcmVtb3ZlIGZyb20gdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IHBsYXlpbmcgbm9kZS4gKDE6IGdldHNOZXh0LCAtMTogZ2V0c1ByZXYsIDA6IGdldHNDdXJyZW50KVxyXG4gICAqIEByZXR1cm5zIHtEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+fSB0aGUgbm9kZSB0aGF0IHBvaW50cyB0byB0aGUgdW5zaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBsaXN0LiBFaXRoZXIgdGhlIHByZXZpb3VzLCBjdXJyZW50LCBvciBuZXh0IG5vZGUgZnJvbSB0aGUgY3VycmVudCBwbGF5YWJsZS5cclxuICAgKi9cclxuICBwcml2YXRlIHVuU2h1ZmZsZSAoZGlyOiBudW1iZXIpOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyID09IG51bGwgfHwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ25vIHNlbCBwbGF5aW5nJylcclxuICAgIGNvbnN0IHNlbFBsYXlhYmxlID0gdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZS5kYXRhXHJcblxyXG4gICAgY29uc29sZS5sb2coJ3Vuc2h1ZmZsZScpXHJcbiAgICB0aGlzLndhc0luU2h1ZmZsZSA9IGZhbHNlXHJcbiAgICAvLyBvYnRhaW4gYW4gdW5zaHVmZmxlZCBsaW5rZWQgbGlzdFxyXG4gICAgY29uc3QgcGxheWFibGVMaXN0ID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKVxyXG5cclxuICAgIGNvbnN0IG5ld05vZGVJZHggPSBwbGF5YWJsZUxpc3QuZmluZEluZGV4KChwbGF5YWJsZSkgPT4gcGxheWFibGUuc2VsRWwuaWQgPT09IHNlbFBsYXlhYmxlLnNlbEVsLmlkKVxyXG5cclxuICAgIGxldCBuZXdOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCA9IG51bGxcclxuICAgIGlmIChwbGF5YWJsZUxpc3Quc2l6ZSA+IG5ld05vZGVJZHggKyBkaXIgJiYgbmV3Tm9kZUlkeCArIGRpciA+PSAwKSB7XHJcbiAgICAgIG5ld05vZGUgPSBwbGF5YWJsZUxpc3QuZ2V0KG5ld05vZGVJZHggKyBkaXIsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIH1cclxuICAgIHJldHVybiBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQbGF5cyBhIHRyYWNrIHRocm91Z2ggdGhpcyBkZXZpY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhY2tfdXJpIC0gdGhlIHRyYWNrIHVyaSB0byBwbGF5XHJcbiAgICogQHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHRyYWNrIGhhcyBiZWVuIHBsYXllZCBzdWNjZXNmdWxseS5cclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHBsYXkgKHRyYWNrX3VyaTogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXlUcmFjayh0aGlzLmRldmljZV9pZCwgdHJhY2tfdXJpKSlcclxuICAgIClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVzdW1lICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnJlc3VtZSgpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHBhdXNlICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnBhdXNlKClcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHNwb3RpZnlQbGF5YmFjayA9IG5ldyBTcG90aWZ5UGxheWJhY2soKVxyXG5cclxuaWYgKCh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgPT09IHVuZGVmaW5lZCkge1xyXG4gIC8vIGNyZWF0ZSBhIGdsb2JhbCB2YXJpYWJsZSB0byBiZSB1c2VkXHJcbiAgKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciA9IG5ldyBFdmVudEFnZ3JlZ2F0b3IoKVxyXG59XHJcbmNvbnN0IGV2ZW50QWdncmVnYXRvciA9ICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgYXMgRXZlbnRBZ2dyZWdhdG9yXHJcblxyXG4vLyBzdWJzY3JpYmUgdGhlIHNldFBsYXlpbmcgZWxlbWVudCBldmVudFxyXG5ldmVudEFnZ3JlZ2F0b3Iuc3Vic2NyaWJlKFBsYXlhYmxlRXZlbnRBcmcubmFtZSwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSA9PlxyXG4gIHNwb3RpZnlQbGF5YmFjay5zZXRTZWxQbGF5aW5nRWwoZXZlbnRBcmcsIGZhbHNlKVxyXG4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTYW1lUGxheWluZ1VSSVdpdGhFbCAodXJpOiBzdHJpbmcpIHtcclxuICByZXR1cm4gKFxyXG4gICAgdXJpID09PSBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy50cmFja191cmkgJiZcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLmVsZW1lbnQgIT0gbnVsbFxyXG4gIClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU2FtZVBsYXlpbmdVUkkgKHVyaTogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHVyaSA9PT0gc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcudHJhY2tfdXJpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyICh1cmk6IHN0cmluZywgc2VsRWw6IEVsZW1lbnQsIHRyYWNrRGF0YU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICBpZiAoaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh1cmkpKSB7XHJcbiAgICAvLyBUaGlzIGVsZW1lbnQgd2FzIHBsYXlpbmcgYmVmb3JlIHJlcmVuZGVyaW5nIHNvIHNldCBpdCB0byBiZSB0aGUgY3VycmVudGx5IHBsYXlpbmcgb25lIGFnYWluXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ID0gc2VsRWxcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9IHRyYWNrRGF0YU5vZGVcclxuICB9XHJcbn1cclxuXHJcbi8vIGFwcGVuZCBhbiBpbnZpc2libGUgZWxlbWVudCB0aGVuIGRlc3Ryb3kgaXQgYXMgYSB3YXkgdG8gbG9hZCB0aGUgcGxheSBhbmQgcGF1c2UgaW1hZ2VzIGZyb20gZXhwcmVzcy5cclxuY29uc3QgcHJlbG9hZFBsYXlQYXVzZUltZ3NIdG1sID0gYDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lXCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5SWNvbn1cIi8+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wYXVzZUljb259XCIvPjwvZGl2PmBcclxuY29uc3QgcHJlbG9hZFBsYXlQYXVzZUltZ3NFbCA9IGh0bWxUb0VsKHByZWxvYWRQbGF5UGF1c2VJbWdzSHRtbCkgYXMgTm9kZVxyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHByZWxvYWRQbGF5UGF1c2VJbWdzRWwpXHJcbmRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocHJlbG9hZFBsYXlQYXVzZUltZ3NFbClcclxuIiwiaW1wb3J0IHsgY29uZmlnLCBodG1sVG9FbCwgZ2V0VmFsaWRJbWFnZSB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IFRyYWNrLCB7IGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgfSBmcm9tICcuL3RyYWNrJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcbmltcG9ydCBEb3VibHlMaW5rZWRMaXN0IGZyb20gJy4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgeyBQbGF5bGlzdFRyYWNrRGF0YSwgU3BvdGlmeUltZywgVHJhY2tEYXRhIH0gZnJvbSAnLi4vLi4vdHlwZXMnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuXHJcbmNsYXNzIFBsYXlsaXN0IGV4dGVuZHMgQ2FyZCB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgdW5kb1N0YWNrOiBBcnJheTxBcnJheTxUcmFjaz4+O1xyXG4gIG9yZGVyOiBzdHJpbmc7XHJcbiAgdHJhY2tMaXN0OiB1bmRlZmluZWQgfCBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPjtcclxuICBpbWFnZVVybDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvciAobmFtZTogc3RyaW5nLCBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+LCBpZDogc3RyaW5nKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICB0aGlzLmlkID0gaWRcclxuICAgIHRoaXMudW5kb1N0YWNrID0gW11cclxuICAgIHRoaXMub3JkZXIgPSAnY3VzdG9tLW9yZGVyJyAvLyBzZXQgaXQgYXMgdGhlIGluaXRpYWwgb3JkZXJcclxuICAgIHRoaXMudHJhY2tMaXN0ID0gdW5kZWZpbmVkXHJcblxyXG4gICAgLy8gdGhlIGlkIG9mIHRoZSBwbGF5bGlzdCBjYXJkIGVsZW1lbnRcclxuICAgIHRoaXMuaW1hZ2VVcmwgPSBnZXRWYWxpZEltYWdlKGltYWdlcylcclxuICB9XHJcblxyXG4gIGFkZFRvVW5kb1N0YWNrICh0cmFja3M6IEFycmF5PFRyYWNrPikge1xyXG4gICAgdGhpcy51bmRvU3RhY2sucHVzaCh0cmFja3MpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgcGxheWxpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIGdldFBsYXlsaXN0Q2FyZEh0bWwgKGlkeDogbnVtYmVyLCBpblRleHRGb3JtOiBib29sZWFuLCBpc1NlbGVjdGVkID0gZmFsc2UpOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMucGxheWxpc3RQcmVmaXh9JHtpZHh9YFxyXG5cclxuICAgIGNvbnN0IGV4cGFuZE9uSG92ZXIgPSBpblRleHRGb3JtID8gJycgOiBjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3ZlclxyXG5cclxuICAgIHRoaXMuY2FyZElkID0gaWRcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7ZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW59ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkXHJcbiAgICB9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0fSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH0gJHtcclxuICAgICAgaXNTZWxlY3RlZCA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICB9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCIgdGl0bGU9XCJDbGljayB0byBWaWV3IFRyYWNrc1wiPlxyXG4gICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlVXJsfVwiIGFsdD1cIlBsYXlsaXN0IENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcFxyXG4gICAgfVwiPiR7dGhpcy5uYW1lfTwvaDQ+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2R1Y2VzIGxpc3Qgb2YgVHJhY2sgY2xhc3MgaW5zdGFuY2VzIHVzaW5nIHRyYWNrIGRhdGFzIGZyb20gc3BvdGlmeSB3ZWIgYXBpLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+fSBMaXN0IG9mIHRyYWNrIGNsYXNzZXMgY3JlYXRlZCB1c2luZyB0aGUgb2J0YWluZWQgdHJhY2sgZGF0YXMuXHJcbiAgICovXHJcbiAgYXN5bmMgbG9hZFRyYWNrcyAoKTogUHJvbWlzZTxEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IG51bGw+IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zLnJlcXVlc3Q8QXJyYXk8UGxheWxpc3RUcmFja0RhdGE+Pih7IG1ldGhvZDogJ2dldCcsIHVybDogYCR7Y29uZmlnLlVSTHMuZ2V0UGxheWxpc3RUcmFja3MgKyB0aGlzLmlkfWAgfSlcclxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKVxyXG4gICAgICB9KVxyXG5cclxuICAgIGlmICghcmVzKSB7XHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcbiAgICBjb25zdCB0cmFja0xpc3QgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4oKVxyXG5cclxuICAgIC8vIG1hcCBlYWNoIHRyYWNrIGRhdGEgaW4gdGhlIHBsYXlsaXN0IGRhdGEgdG8gYW4gYXJyYXkuXHJcbiAgICBsZXQgdHJhY2tzRGF0YSA9IHJlcy5kYXRhLm1hcCgoZGF0YSkgPT4gZGF0YS50cmFjaykgYXMgQXJyYXk8VHJhY2tEYXRhPlxyXG5cclxuICAgIC8vIGZpbHRlciBhbnkgZGF0YSB0aGF0IGhhcyBhIG51bGwgaWQgYXMgdGhlIHRyYWNrIHdvdWxkIG5vdCBiZSB1bnBsYXlhYmxlXHJcbiAgICB0cmFja3NEYXRhID0gdHJhY2tzRGF0YS5maWx0ZXIoKGRhdGEpID0+IGRhdGEuaWQgIT09IG51bGwpXHJcblxyXG4gICAgZ2V0UGxheWxpc3RUcmFja3NGcm9tRGF0YXModHJhY2tzRGF0YSwgcmVzLmRhdGEsIHRyYWNrTGlzdClcclxuXHJcbiAgICAvLyBkZWZpbmUgdHJhY2sgb2JqZWN0c1xyXG4gICAgdGhpcy50cmFja0xpc3QgPSB0cmFja0xpc3RcclxuICAgIHJldHVybiB0cmFja0xpc3RcclxuICB9XHJcblxyXG4gIGhhc0xvYWRlZFRyYWNrcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFja0xpc3QgIT09IHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgcGxheWxpc3QgdHJhY2tzIGZyb20gZGF0YS4gVGhpcyBhbHNvIGluaXRpYWxpemVzIHRoZSBkYXRlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFRyYWNrRGF0YT59IHRyYWNrc0RhdGEgYW4gYXJyYXkgb2YgY29udGFpbmluZyBlYWNoIHRyYWNrJ3MgZGF0YVxyXG4gKiBAcGFyYW0ge0FycmF5PFBsYXlsaXN0VHJhY2tEYXRhPn0gZGF0ZUFkZGVkT2JqZWN0cyBUaGUgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGFkZGVkX2F0IHZhcmlhYmxlLlxyXG4gKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+fSB0cmFja3NMaXN0IHRoZSBkb3VibHkgbGlua2VkIGxpc3QgdG8gcHV0IHRoZSB0cmFja3MgaW50by5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQbGF5bGlzdFRyYWNrc0Zyb21EYXRhcyAoXHJcbiAgdHJhY2tzRGF0YTogQXJyYXk8VHJhY2tEYXRhPixcclxuICBkYXRlQWRkZWRPYmplY3RzOiBBcnJheTxQbGF5bGlzdFRyYWNrRGF0YT4sXHJcbiAgdHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPlxyXG4pIHtcclxuICBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhKHRyYWNrc0RhdGEsIHRyYWNrTGlzdClcclxuXHJcbiAgbGV0IGkgPSAwXHJcbiAgLy8gc2V0IHRoZSBkYXRlcyBhZGRlZFxyXG4gIGZvciAoY29uc3QgdHJhY2tPdXQgb2YgdHJhY2tMaXN0LnZhbHVlcygpKSB7XHJcbiAgICBjb25zdCBkYXRlQWRkZWRPYmogPSBkYXRlQWRkZWRPYmplY3RzW2ldXHJcbiAgICBjb25zdCB0cmFjazogVHJhY2sgPSB0cmFja091dFxyXG5cclxuICAgIHRyYWNrLnNldERhdGVBZGRlZFRvUGxheWxpc3QoZGF0ZUFkZGVkT2JqLmFkZGVkX2F0KVxyXG4gICAgaSsrXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5bGlzdFxyXG4iLCJpbXBvcnQgU3Vic2NyaXB0aW9uIGZyb20gJy4vc3Vic2NyaXB0aW9uJ1xyXG5cclxuLyoqIExldHMgc2F5IHlvdSBoYXZlIHR3byBkb29ycyB0aGF0IHdpbGwgb3BlbiB0aHJvdWdoIHRoZSBwdWIgc3ViIHN5c3RlbS4gV2hhdCB3aWxsIGhhcHBlbiBpcyB0aGF0IHdlIHdpbGwgc3Vic2NyaWJlIG9uZVxyXG4gKiBvbiBkb29yIG9wZW4gZXZlbnQuIFdlIHdpbGwgdGhlbiBoYXZlIHR3byBwdWJsaXNoZXJzIHRoYXQgd2lsbCBlYWNoIHByb3BhZ2F0ZSBhIGRpZmZlcmVudCBkb29yIHRocm91Z2ggdGhlIGFnZ3JlZ2F0b3IgYXQgZGlmZmVyZW50IHBvaW50cy5cclxuICogVGhlIGFnZ3JlZ2F0b3Igd2lsbCB0aGVuIGV4ZWN1dGUgdGhlIG9uIGRvb3Igb3BlbiBzdWJzY3JpYmVyIGFuZCBwYXNzIGluIHRoZSBkb29yIGdpdmVuIGJ5IGVpdGhlciBwdWJsaXNoZXIuXHJcbiAqL1xyXG5cclxuLyoqIE1hbmFnZXMgc3Vic2NyaWJpbmcgYW5kIHB1Ymxpc2hpbmcgb2YgZXZlbnRzLlxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqIEFuIGFyZ1R5cGUgaXMgb2J0YWluZWQgYnkgdGFraW5nIHRoZSAnQ2xhc3NJbnN0YW5jZScuY29udHJ1Y3Rvci5uYW1lIG9yICdDbGFzcycubmFtZS5cclxuICogU3Vic2NyaXB0aW9ucyBhcmUgZ3JvdXBlZCB0b2dldGhlciBieSBhcmdUeXBlIGFuZCB0aGVpciBldnQgdGFrZXMgYW4gYXJndW1lbnQgdGhhdCBpcyBhXHJcbiAqIGNsYXNzIHdpdGggdGhlIGNvbnN0cnVjdG9yLm5hbWUgb2YgYXJnVHlwZS5cclxuICpcclxuICovXHJcbmNsYXNzIEV2ZW50QWdncmVnYXRvciB7XHJcbiAgc3Vic2NyaWJlcnM6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8U3Vic2NyaXB0aW9uPiB9O1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIC8vIGtleSAtIHR5cGUsIHZhbHVlIC0gW10gb2YgZnVuY3Rpb25zIHRoYXQgdGFrZSBhIGNlcnRhaW4gdmFsdWUgZGVwZW5kaW5nIG9uIHRoZSB0eXBlXHJcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge31cclxuICB9XHJcblxyXG4gIC8qKiBTdWJzY3JpYmVzIGEgdHlwZSBvZiBldmVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhcmdUeXBlIC0gdGhlIHR5cGUgdGhhdCB0aGlzIHN1YnNjcmliZXIgYmVsb25ncyB0b28uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXZlbnQgLSB0aGUgZXZlbnQgdGhhdCB0YWtlcyB0aGUgc2FtZSBhcmdzIGFzIGFsbCBvdGhlciBldmVudHMgb2YgdGhlIGdpdmVuIHR5cGUuXHJcbiAgICovXHJcbiAgc3Vic2NyaWJlIChhcmdUeXBlOiBzdHJpbmcsIGV2dDogRnVuY3Rpb24pIHtcclxuICAgIGNvbnN0IHN1YnNjcmliZXIgPSBuZXcgU3Vic2NyaXB0aW9uKHRoaXMsIGV2dCwgYXJnVHlwZSlcclxuXHJcbiAgICBpZiAoYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbYXJnVHlwZV0ucHVzaChzdWJzY3JpYmVyKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXSA9IFtzdWJzY3JpYmVyXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFVuc3Vic2NyaWJlcyBhIGdpdmVuIHN1YnNjcmlwdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3Vic2NyaXB0aW9ufSBzdWJzY3JpcHRpb25cclxuICAgKi9cclxuICB1bnN1YnNjcmliZSAoc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24pIHtcclxuICAgIGlmIChzdWJzY3JpcHRpb24uYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIC8vIGZpbHRlciBvdXQgdGhlIHN1YnNjcmlwdGlvbiBnaXZlbiBmcm9tIHRoZSBzdWJzY3JpYmVycyBkaWN0aW9uYXJ5XHJcbiAgICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5zdWJzY3JpYmVyc1tzdWJzY3JpcHRpb24uYXJnVHlwZV0uZmlsdGVyKGZ1bmN0aW9uIChzdWIpIHtcclxuICAgICAgICByZXR1cm4gc3ViLmlkICE9PSBzdWJzY3JpcHRpb24uaWRcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbc3Vic2NyaXB0aW9uLmFyZ1R5cGVdID0gZmlsdGVyZWRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoZXMgYWxsIHN1YnNjcmliZXJzIHRoYXQgdGFrZSBhcmd1bWVudHMgb2YgYSBnaXZlbiB0eXBlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBhIGNsYXNzIHRoYXQgY29udGFpbnMgYXJndW1lbnRzIGZvciB0aGUgZXZlbnQuIE11c3QgYmUgYSBjbGFzcyBhcyBzdWJzY3JpYmVycyBhcmUgZ3JvdXBlZCBieSB0eXBlLlxyXG4gICAqL1xyXG4gIHB1Ymxpc2ggKGFyZ3M6IE9iamVjdCkge1xyXG4gICAgY29uc3QgYXJnVHlwZSA9IGFyZ3MuY29uc3RydWN0b3IubmFtZVxyXG5cclxuICAgIGlmIChhcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXS5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHtcclxuICAgICAgICBzdWJzY3JpcHRpb24uZXZ0KGFyZ3MpXHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdubyB0eXBlIGZvdW5kIGZvciBwdWJsaXNoaW5nJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNsZWFyU3Vic2NyaXB0aW9ucyAoKSB7XHJcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge31cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEV2ZW50QWdncmVnYXRvclxyXG4iLCJpbXBvcnQgeyBJUGxheWFibGUgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcydcclxuaW1wb3J0IHsgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi8uLi9kb3VibHktbGlua2VkLWxpc3QnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5YWJsZUV2ZW50QXJnIHtcclxuICBjdXJyUGxheWFibGU6IElQbGF5YWJsZTtcclxuICBwbGF5YWJsZU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICBwbGF5YWJsZUFycjogQXJyYXk8SVBsYXlhYmxlPiB8IG51bGxcclxuXHJcbiAgLyoqIFRha2VzIGluIHRoZSBjdXJyZW50IHRyYWNrIHRvIHBsYXkgYXMgd2VsbCBhcyB0aGUgcHJldiB0cmFja3MgYW5kIG5leHQgdHJhY2tzIGZyb20gaXQuXHJcbiAgICogTm90ZSB0aGF0IGl0IGRvZXMgbm90IHRha2UgVHJhY2sgaW5zdGFuY2VzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJUGxheWFibGV9IGN1cnJUcmFjayAtIG9iamVjdCBjb250YWluaW5nIGVsZW1lbnQgdG8gc2VsZWN0LCB0cmFja191cmksIGFuZCB0cmFjayB0aXRsZS5cclxuICAgKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT59IHRyYWNrTm9kZSAtIG5vZGUgdGhhdCBhbGxvd3MgdXMgdG8gdHJhdmVyc2UgdG8gbmV4dCBhbmQgcHJldmlvdXMgdHJhY2sgZGF0YXMuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKGN1cnJUcmFjazogSVBsYXlhYmxlLCB0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4sIHBsYXlhYmxlQXJyOiBBcnJheTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgdGhpcy5jdXJyUGxheWFibGUgPSBjdXJyVHJhY2tcclxuICAgIHRoaXMucGxheWFibGVOb2RlID0gdHJhY2tOb2RlXHJcbiAgICB0aGlzLnBsYXlhYmxlQXJyID0gcGxheWFibGVBcnJcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL2FnZ3JlZ2F0b3InXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdWJzY3JpcHRpb24ge1xyXG4gIGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yO1xyXG4gIGV2dDogRnVuY3Rpb247XHJcbiAgYXJnVHlwZTogc3RyaW5nO1xyXG4gIGlkOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChldmVudEFnZ3JlZ2F0b3I6IEV2ZW50QWdncmVnYXRvciwgZXZ0OiBGdW5jdGlvbiwgYXJnVHlwZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmV2ZW50QWdncmVnYXRvciA9IGV2ZW50QWdncmVnYXRvclxyXG4gICAgdGhpcy5ldnQgPSBldnRcclxuICAgIHRoaXMuYXJnVHlwZSA9IGFyZ1R5cGVcclxuICAgIHRoaXMuaWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBodG1sVG9FbCxcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIHRocm93RXhwcmVzc2lvbixcclxuICByZW1vdmVBbGxDaGlsZE5vZGVzXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgeyBwbGF5ZXJQdWJsaWNWYXJzIH0gZnJvbSAnLi9wbGF5YmFjay1zZGsnXHJcblxyXG5jbGFzcyBTbGlkZXIge1xyXG4gIHB1YmxpYyBkcmFnOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIHNsaWRlckVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBzbGlkZXJQcm9ncmVzczogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIHBlcmNlbnRhZ2U6IG51bWJlciA9IDA7XHJcbiAgcHVibGljIG1heDogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIHRvcFRvQm90dG9tOiBib29sZWFuO1xyXG4gIHByaXZhdGUgb25EcmFnU3RhcnQ6ICgpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBvbkRyYWdTdG9wOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgb25EcmFnZ2luZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IgKHN0YXJ0UGVyY2VudGFnZTogbnVtYmVyLCBvbkRyYWdTdG9wOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLCB0b3BUb0JvdHRvbTogYm9vbGVhbiwgb25EcmFnU3RhcnQgPSAoKSA9PiB7fSwgb25EcmFnZ2luZyA9IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHt9LCBzbGlkZXJFbDogSFRNTEVsZW1lbnQpIHtcclxuICAgIHRoaXMub25EcmFnU3RvcCA9IG9uRHJhZ1N0b3BcclxuICAgIHRoaXMub25EcmFnU3RhcnQgPSBvbkRyYWdTdGFydFxyXG4gICAgdGhpcy5vbkRyYWdnaW5nID0gb25EcmFnZ2luZ1xyXG4gICAgdGhpcy50b3BUb0JvdHRvbSA9IHRvcFRvQm90dG9tXHJcbiAgICB0aGlzLnBlcmNlbnRhZ2UgPSBzdGFydFBlcmNlbnRhZ2VcclxuXHJcbiAgICB0aGlzLnNsaWRlckVsID0gc2xpZGVyRWxcclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MgPSBzbGlkZXJFbD8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3MpWzBdIGFzIEhUTUxFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignTm8gcHJvZ3Jlc3MgYmFyIGZvdW5kJylcclxuXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAvLyBpZiBpdHMgdG9wIHRvIGJvdHRvbSB3ZSBtdXN0IHJvdGF0ZSB0aGUgZWxlbWVudCBkdWUgcmV2ZXJzZWQgaGVpZ2h0IGNoYW5naW5nXHJcbiAgICAgIHRoaXMuc2xpZGVyRWwhLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGV4KDE4MGRlZyknXHJcbiAgICAgIHRoaXMuc2xpZGVyRWwhLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9ICd0cmFuc2Zvcm0tb3JpZ2luOiB0b3AnXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jaGFuZ2VCYXJMZW5ndGgoKVxyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JhY2tncm91bmQtY29sb3InKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVCYXIgKG1vc1Bvc1ZhbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgcG9zaXRpb25cclxuICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgIHBvc2l0aW9uID0gbW9zUG9zVmFsIC0gdGhpcy5zbGlkZXJFbCEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkueVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcG9zaXRpb24gPSBtb3NQb3NWYWwgLSB0aGlzLnNsaWRlckVsIS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS54XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgLy8gbWludXMgMTAwIGJlY2F1c2UgbW9kaWZ5aW5nIGhlaWdodCBpcyByZXZlcnNlZFxyXG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAxMDAgLSAoMTAwICogKHBvc2l0aW9uIC8gdGhpcy5zbGlkZXJFbCEuY2xpZW50SGVpZ2h0KSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDEwMCAqIChwb3NpdGlvbiAvIHRoaXMuc2xpZGVyRWwhLmNsaWVudFdpZHRoKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnBlcmNlbnRhZ2UgPiAxMDApIHtcclxuICAgICAgdGhpcy5wZXJjZW50YWdlID0gMTAwXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5wZXJjZW50YWdlIDwgMCkge1xyXG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAwXHJcbiAgICB9XHJcbiAgICB0aGlzLmNoYW5nZUJhckxlbmd0aCgpXHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBjaGFuZ2VCYXJMZW5ndGggKCkge1xyXG4gICAgLy8gc2V0IGJhY2tncm91bmQgY29sb3Igb2YgYWxsIG1vdmluZyBzbGlkZXJzIHByb2dyZXNzIGFzIHRoZSBzcG90aWZ5IGdyZWVuXHJcbiAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzFkYjk1NCdcclxuICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLmhlaWdodCA9IHRoaXMucGVyY2VudGFnZSArICclJ1xyXG4gICAgfSBlbHNlIHtcclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLndpZHRoID0gdGhpcy5wZXJjZW50YWdlICsgJyUnXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcnMgKCkge1xyXG4gICAgdGhpcy5hZGRNb3VzZUV2ZW50cygpXHJcbiAgICB0aGlzLmFkZFRvdWNoRXZlbnRzKClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkVG91Y2hFdmVudHMgKCkge1xyXG4gICAgdGhpcy5zbGlkZXJFbD8uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChldnQpID0+IHtcclxuICAgICAgdGhpcy5kcmFnID0gdHJ1ZVxyXG4gICAgICBpZiAodGhpcy5vbkRyYWdTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RhcnQoKVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMudXBkYXRlQmFyKGV2dC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYKVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChldnQpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnZ2luZyh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RvcCh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmxpbmUgY3NzIHNvIHRoYXQgaXRzIG9yaWdpbmFsIGJhY2tncm91bmQgY29sb3IgcmV0dXJuc1xyXG4gICAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJylcclxuICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRNb3VzZUV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLnNsaWRlckVsPy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZXZ0KSA9PiB7XHJcbiAgICAgIHRoaXMuZHJhZyA9IHRydWVcclxuICAgICAgaWYgKHRoaXMub25EcmFnU3RhcnQgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0KClcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlQmFyKGV2dC5jbGllbnRZKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudXBkYXRlQmFyKGV2dC5jbGllbnRYKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGV2dCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdnaW5nKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFkpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlQmFyKGV2dC5jbGllbnRYKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ1N0b3AodGhpcy5wZXJjZW50YWdlKVxyXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgaW5saW5lIGNzcyBzbyB0aGF0IGl0cyBvcmlnaW5hbCBiYWNrZ3JvdW5kIGNvbG9yIHJldHVybnNcclxuICAgICAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnYmFja2dyb3VuZC1jb2xvcicpXHJcbiAgICAgICAgdGhpcy5kcmFnID0gZmFsc2VcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwb3RpZnlQbGF5YmFja0VsZW1lbnQge1xyXG4gIHByaXZhdGUgdGl0bGU6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbDtcclxuICBwdWJsaWMgY3VyclRpbWU6IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBkdXJhdGlvbjogRWxlbWVudCB8IG51bGw7XHJcbiAgcHVibGljIHBsYXlQYXVzZTogRWxlbWVudCB8IG51bGw7XHJcbiAgcHVibGljIHNvbmdQcm9ncmVzczogU2xpZGVyIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSB2b2x1bWVCYXI6IFNsaWRlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLnRpdGxlID0gbnVsbFxyXG4gICAgdGhpcy5jdXJyVGltZSA9IG51bGxcclxuICAgIHRoaXMuZHVyYXRpb24gPSBudWxsXHJcbiAgICB0aGlzLnBsYXlQYXVzZSA9IG51bGxcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRBcnRpc3RzIChhcnRpc3RIdG1sOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGFydGlzdE5hbWVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllckFydGlzdHMpXHJcbiAgICBpZiAoYXJ0aXN0TmFtZUVsKSB7XHJcbiAgICAgIHJlbW92ZUFsbENoaWxkTm9kZXMoYXJ0aXN0TmFtZUVsKVxyXG4gICAgICBhcnRpc3ROYW1lRWwuaW5uZXJIVE1MICs9IGFydGlzdEh0bWxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRJbWdTcmMgKGltZ1NyYzogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBwbGF5ZXJUcmFja0ltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXllclRyYWNrSW1nKSBhcyBIVE1MSW1hZ2VFbGVtZW50XHJcbiAgICBpZiAocGxheWVyVHJhY2tJbWcpIHtcclxuICAgICAgcGxheWVyVHJhY2tJbWcuc3JjID0gaW1nU3JjXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0VGl0bGUgKHRpdGxlOiBzdHJpbmcsIHRyYWNrVXJpOiBzdHJpbmcpIHtcclxuICAgIGlmICh0aGlzLnRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIHNldCB0aXRsZSBiZWZvcmUgaXQgaXMgYXNzaWduZWQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy50aXRsZSEudGV4dENvbnRlbnQgPSB0aXRsZVxyXG4gICAgdGhpcy50aXRsZSEuaHJlZiA9IHRyYWNrVXJpXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0VGl0bGUgKCk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBzZXQgdGl0bGUgYmVmb3JlIGl0IGlzIGFzc2lnbmVkJylcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnRpdGxlLnRleHRDb250ZW50IGFzIHN0cmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwZW5kIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdG8gdGhlIERPTSBhbG9uZyB3aXRoIHRoZSBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBidXR0b25zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBsYXlQcmV2RnVuYyB0aGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIHBsYXkgcHJldmlvdXMgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlIHdlYiBwbGF5ZXIuXHJcbiAgICogQHBhcmFtIHBhdXNlRnVuYyB0aGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIHBhdXNlL3BsYXkgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlIHdlYiBwbGF5ZXIuXHJcbiAgICogQHBhcmFtIHBsYXlOZXh0RnVuYyB0aGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIHBsYXkgbmV4dCBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gb25TZWVrU3RhcnQgLSBvbiBkcmFnIHN0YXJ0IGV2ZW50IGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBzZWVrU29uZyAtIG9uIGRyYWcgZW5kIGV2ZW50IHRvIHNlZWsgc29uZyBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gb25TZWVraW5nIC0gb24gZHJhZ2dpbmcgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNldFZvbHVtZSAtIG9uIGRyYWdnaW5nIGFuZCBvbiBkcmFnIGVuZCBldmVudCBmb3Igdm9sdW1lIHNsaWRlclxyXG4gICAqIEBwYXJhbSBpbml0aWFsVm9sdW1lIC0gdGhlIGluaXRpYWwgdm9sdW1lIHRvIHNldCB0aGUgc2xpZGVyIGF0XHJcbiAgICovXHJcbiAgcHVibGljIGFwcGVuZFdlYlBsYXllckh0bWwgKFxyXG4gICAgcGxheVByZXZGdW5jOiAoKSA9PiB2b2lkLFxyXG4gICAgcGF1c2VGdW5jOiAoKSA9PiB2b2lkLFxyXG4gICAgcGxheU5leHRGdW5jOiAoKSA9PiB2b2lkLFxyXG4gICAgb25TZWVrU3RhcnQ6ICgpID0+IHZvaWQsXHJcbiAgICBzZWVrU29uZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIG9uU2Vla2luZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIHNldFZvbHVtZTogKHBlcmNlbnRhZ2U6IG51bWJlciwgc2F2ZTogYm9vbGVhbikgPT4gdm9pZCxcclxuICAgIGluaXRpYWxWb2x1bWU6IG51bWJlcikge1xyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgIDxhcnRpY2xlIGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJ9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIj5cclxuICAgICAgPGltZyBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNvbHVtbn1cIiBzcmM9XCIke2NvbmZpZy5QQVRIUy5wcm9maWxlVXNlcn1cIiBhbHQ9XCJ0cmFja1wiIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5ZXJUcmFja0ltZ31cIi8+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCIgc3R5bGU9XCJmbGV4LWJhc2lzOiAzMCU7IG1heC13aWR0aDogMTguNXZ3O1wiPlxyXG4gICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj48YSBocmVmPVwiXCIgdGFyZ2V0PVwiX2JsYW5rXCI+U2VsZWN0IGEgU29uZzwvYT48L2g0PlxyXG4gICAgICAgIDxzcGFuIGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJBcnRpc3RzfVwiPjwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy53ZWJQbGF5ZXJDb250cm9sc30gJHtjb25maWcuQ1NTLkNMQVNTRVMuY29sdW1ufVwiPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8YXJ0aWNsZSBpZD1cIndlYi1wbGF5ZXItYnV0dG9uc1wiPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5zaHVmZmxlfVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMuc2h1ZmZsZUljb259XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5UHJldn1cIiBjbGFzcz1cIm5leHQtcHJldlwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGxheVByZXZ9XCIgYWx0PVwicHJldmlvdXNcIi8+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZX1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59XCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXlOZXh0fVwiIGNsYXNzPVwibmV4dC1wcmV2XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5TmV4dH1cIiBhbHQ9XCJuZXh0XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5sb29wfVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMubG9vcEljb259XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9hcnRpY2xlPlxyXG4gICAgICAgICAgPGRpdiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyVm9sdW1lfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2xpZGVyfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3N9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcn1cIj5cclxuICAgICAgICAgIDxwPjA6MDA8L3A+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzc31cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNsaWRlcn1cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnByb2dyZXNzfVwiPjwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvYXJ0aWNsZT5cclxuICAgIGBcclxuXHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGh0bWxUb0VsKGh0bWwpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh3ZWJQbGF5ZXJFbCBhcyBOb2RlKVxyXG4gICAgdGhpcy5nZXRXZWJQbGF5ZXJFbHMoXHJcbiAgICAgIG9uU2Vla1N0YXJ0LFxyXG4gICAgICBzZWVrU29uZyxcclxuICAgICAgb25TZWVraW5nLFxyXG4gICAgICBzZXRWb2x1bWUsXHJcbiAgICAgIGluaXRpYWxWb2x1bWUpXHJcbiAgICB0aGlzLmFzc2lnbkV2ZW50TGlzdGVuZXJzKFxyXG4gICAgICBwbGF5UHJldkZ1bmMsXHJcbiAgICAgIHBhdXNlRnVuYyxcclxuICAgICAgcGxheU5leHRGdW5jXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGVyY2VudERvbmUgdGhlIHBlcmNlbnQgb2YgdGhlIHNvbmcgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gdGhlIGN1cnJlbnQgcG9zaXRpb24gaW4gbXMgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlRWxlbWVudCAocGVyY2VudERvbmU6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikge1xyXG4gICAgLy8gaWYgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyIGRvbid0IGF1dG8gdXBkYXRlXHJcbiAgICBpZiAocG9zaXRpb24gIT09IDAgJiYgIXRoaXMuc29uZ1Byb2dyZXNzIS5kcmFnKSB7XHJcbiAgICAgIC8vIHJvdW5kIGVhY2ggaW50ZXJ2YWwgdG8gdGhlIG5lYXJlc3Qgc2Vjb25kIHNvIHRoYXQgdGhlIG1vdmVtZW50IG9mIHByb2dyZXNzIGJhciBpcyBieSBzZWNvbmQuXHJcbiAgICAgIHRoaXMuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50RG9uZX0lYFxyXG4gICAgICBpZiAodGhpcy5jdXJyVGltZSA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHRpbWUgZWxlbWVudCBpcyBudWxsJylcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhwb3NpdGlvbilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzIG9uY2UgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCBoYXMgYmVlbiBhcHBlbmVkZWQgdG8gdGhlIERPTS4gSW5pdGlhbGl6ZXMgU2xpZGVycy5cclxuICAgKiBAcGFyYW0gb25TZWVrU3RhcnQgLSBvbiBkcmFnIHN0YXJ0IGV2ZW50IGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBzZWVrU29uZyAtIG9uIGRyYWcgZW5kIGV2ZW50IHRvIHNlZWsgc29uZyBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gb25TZWVraW5nIC0gb24gZHJhZ2dpbmcgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNldFZvbHVtZSAtIG9uIGRyYWdnaW5nIGFuZCBvbiBkcmFnIGVuZCBldmVudCBmb3Igdm9sdW1lIHNsaWRlclxyXG4gICAqIEBwYXJhbSBpbml0aWFsVm9sdW1lIC0gdGhlIGluaXRpYWwgdm9sdW1lIHRvIHNldCB0aGUgc2xpZGVyIGF0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRXZWJQbGF5ZXJFbHMgKFxyXG4gICAgb25TZWVrU3RhcnQ6ICgpID0+IHZvaWQsXHJcbiAgICBzZWVrU29uZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIG9uU2Vla2luZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIHNldFZvbHVtZTogKHBlcmNlbnRhZ2U6IG51bWJlciwgc2F2ZTogYm9vbGVhbikgPT4gdm9pZCxcclxuICAgIGluaXRpYWxWb2x1bWU6IG51bWJlcikge1xyXG4gICAgY29uc3Qgd2ViUGxheWVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXIpID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHBsYXlUaW1lQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVRpbWVCYXIpID8/IHRocm93RXhwcmVzc2lvbigncGxheSB0aW1lIGJhciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICBjb25zdCBzb25nU2xpZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzcykgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHByb2dyZXNzIGJhciBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCB2b2x1bWVTbGlkZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclZvbHVtZSkgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHZvbHVtZSBiYXIgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICAgIHRoaXMuc29uZ1Byb2dyZXNzID0gbmV3IFNsaWRlcigwLCBzZWVrU29uZywgZmFsc2UsIG9uU2Vla1N0YXJ0LCBvblNlZWtpbmcsIHNvbmdTbGlkZXJFbClcclxuICAgIHRoaXMudm9sdW1lQmFyID0gbmV3IFNsaWRlcihpbml0aWFsVm9sdW1lICogMTAwLCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIGZhbHNlKSwgZmFsc2UsICgpID0+IHt9LCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIHRydWUpLCB2b2x1bWVTbGlkZXJFbClcclxuXHJcbiAgICB0aGlzLnRpdGxlID0gd2ViUGxheWVyRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2g0JylbMF0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVswXSBhcyBIVE1MQW5jaG9yRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgdGl0bGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXl0aW1lIGJhciBlbGVtZW50c1xyXG4gICAgdGhpcy5jdXJyVGltZSA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgY3VycmVudCB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgdGhpcy5kdXJhdGlvbiA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMV0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgZHVyYXRpb24gdGltZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICB0aGlzLnBsYXlQYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc2lnbnMgdGhlIGV2ZW50cyB0byBydW4gb24gZWFjaCBidXR0b24gcHJlc3MgdGhhdCBleGlzdHMgb24gdGhlIHdlYiBwbGF5ZXIgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwbGF5UHJldkZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwYXVzZUZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheS9wYXVzZSBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwbGF5TmV4dEZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3NpZ25FdmVudExpc3RlbmVycyAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQpIHtcclxuICAgIGNvbnN0IHBsYXlQcmV2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVByZXYpXHJcbiAgICBjb25zdCBwbGF5TmV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlOZXh0KVxyXG4gICAgY29uc3Qgc2h1ZmZsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnNodWZmbGUpXHJcbiAgICBjb25zdCBsb29wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMubG9vcClcclxuXHJcbiAgICBsb29wPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgcGxheWVyUHVibGljVmFycy5pc0xvb3AgPSAhcGxheWVyUHVibGljVmFycy5pc0xvb3BcclxuICAgICAgbG9vcC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJylbMF0uY2xhc3NMaXN0LnRvZ2dsZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB9KVxyXG4gICAgc2h1ZmZsZT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlID0gIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlXHJcbiAgICAgIHNodWZmbGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdLmNsYXNzTGlzdC50b2dnbGUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgfSlcclxuXHJcbiAgICBwbGF5UHJldj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwbGF5UHJldkZ1bmMpXHJcbiAgICBwbGF5TmV4dD8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwbGF5TmV4dEZ1bmMpXHJcblxyXG4gICAgdGhpcy5wbGF5UGF1c2U/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGF1c2VGdW5jKVxyXG4gICAgdGhpcy5zb25nUHJvZ3Jlc3M/LmFkZEV2ZW50TGlzdGVuZXJzKClcclxuICAgIHRoaXMudm9sdW1lQmFyPy5hZGRFdmVudExpc3RlbmVycygpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgaHRtbFRvRWwsXHJcbiAgZ2V0VmFsaWRJbWFnZSxcclxuICBzaHVmZmxlXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQge1xyXG4gIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIsXHJcbiAgaXNTYW1lUGxheWluZ1VSSSxcclxuICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsLFxyXG4gIHBsYXllclB1YmxpY1ZhcnNcclxufSBmcm9tICcuL3BsYXliYWNrLXNkaydcclxuaW1wb3J0IEFsYnVtIGZyb20gJy4vYWxidW0nXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IFBsYXlhYmxlRXZlbnRBcmcgZnJvbSAnLi9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MnXHJcbmltcG9ydCB7IFNwb3RpZnlJbWcsIEZlYXR1cmVzRGF0YSwgSUFydGlzdFRyYWNrRGF0YSwgSVBsYXlhYmxlLCBFeHRlcm5hbFVybHMsIFRyYWNrRGF0YSB9IGZyb20gJy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCwgeyBhcnJheVRvRG91Ymx5TGlua2VkTGlzdCwgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vcHVic3ViL2FnZ3JlZ2F0b3InXHJcblxyXG5jb25zdCBldmVudEFnZ3JlZ2F0b3IgPSAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yIGFzIEV2ZW50QWdncmVnYXRvclxyXG5cclxuY2xhc3MgVHJhY2sgZXh0ZW5kcyBDYXJkIGltcGxlbWVudHMgSVBsYXlhYmxlIHtcclxuICBwcml2YXRlIGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzO1xyXG4gIHByaXZhdGUgX2lkOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfdGl0bGU6IHN0cmluZztcclxuICBwcml2YXRlIF9kdXJhdGlvbjogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3VyaTogc3RyaW5nO1xyXG4gIHByaXZhdGUgX2RhdGVBZGRlZFRvUGxheWxpc3Q6IERhdGU7XHJcblxyXG4gIHBvcHVsYXJpdHk6IHN0cmluZztcclxuICByZWxlYXNlRGF0ZTogRGF0ZTtcclxuICBhbGJ1bTogQWxidW07XHJcbiAgZmVhdHVyZXM6IEZlYXR1cmVzRGF0YSB8IHVuZGVmaW5lZDtcclxuICBpbWFnZVVybDogc3RyaW5nO1xyXG4gIHNlbEVsOiBFbGVtZW50O1xyXG4gIG9uUGxheWluZzogRnVuY3Rpb25cclxuICBvblN0b3BwZWQ6IEZ1bmN0aW9uXHJcbiAgYXJ0aXN0c0h0bWw6IHN0cmluZ1xyXG5cclxuICBwdWJsaWMgZ2V0IGlkICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lkXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRpdGxlICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RpdGxlXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHVyaSAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl91cmlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZGF0ZUFkZGVkVG9QbGF5bGlzdCAoKTogRGF0ZSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdFxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldERhdGVBZGRlZFRvUGxheWxpc3QgKHZhbDogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSkge1xyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKHZhbClcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChwcm9wczogeyB0aXRsZTogc3RyaW5nOyBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+OyBkdXJhdGlvbjogbnVtYmVyOyB1cmk6IHN0cmluZzsgcG9wdWxhcml0eTogc3RyaW5nOyByZWxlYXNlRGF0ZTogc3RyaW5nOyBpZDogc3RyaW5nOyBhbGJ1bTogQWxidW07IGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzOyBhcnRpc3RzOiBBcnJheTx1bmtub3duPjsgaWR4OiBudW1iZXIgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgY29uc3Qge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgaW1hZ2VzLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgICAgdXJpLFxyXG4gICAgICBwb3B1bGFyaXR5LFxyXG4gICAgICByZWxlYXNlRGF0ZSxcclxuICAgICAgaWQsXHJcbiAgICAgIGFsYnVtLFxyXG4gICAgICBleHRlcm5hbFVybHMsXHJcbiAgICAgIGFydGlzdHNcclxuICAgIH0gPSBwcm9wc1xyXG5cclxuICAgIHRoaXMuZXh0ZXJuYWxVcmxzID0gZXh0ZXJuYWxVcmxzXHJcbiAgICB0aGlzLl9pZCA9IGlkXHJcbiAgICB0aGlzLl90aXRsZSA9IHRpdGxlXHJcbiAgICB0aGlzLmFydGlzdHNIdG1sID0gdGhpcy5nZW5lcmF0ZUhUTUxBcnRpc3ROYW1lcyhhcnRpc3RzKVxyXG4gICAgdGhpcy5fZHVyYXRpb24gPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKGR1cmF0aW9uKVxyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKClcclxuXHJcbiAgICAvLyBlaXRoZXIgdGhlIG5vcm1hbCB1cmksIG9yIHRoZSBsaW5rZWRfZnJvbS51cmlcclxuICAgIHRoaXMuX3VyaSA9IHVyaVxyXG4gICAgdGhpcy5wb3B1bGFyaXR5ID0gcG9wdWxhcml0eVxyXG4gICAgdGhpcy5yZWxlYXNlRGF0ZSA9IG5ldyBEYXRlKHJlbGVhc2VEYXRlKVxyXG4gICAgdGhpcy5hbGJ1bSA9IGFsYnVtXHJcbiAgICB0aGlzLmZlYXR1cmVzID0gdW5kZWZpbmVkXHJcblxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy5zZWxFbCA9IGh0bWxUb0VsKCc8PjwvPicpIGFzIEVsZW1lbnRcclxuXHJcbiAgICB0aGlzLm9uUGxheWluZyA9ICgpID0+IHt9XHJcbiAgICB0aGlzLm9uU3RvcHBlZCA9ICgpID0+IHt9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZpbHRlckRhdGFGcm9tQXJ0aXN0cyAoYXJ0aXN0czogQXJyYXk8dW5rbm93bj4pIHtcclxuICAgIHJldHVybiBhcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiBhcnRpc3QgYXMgSUFydGlzdFRyYWNrRGF0YSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMgKGFydGlzdHM6IEFycmF5PHVua25vd24+KSB7XHJcbiAgICBjb25zdCBhcnRpc3RzRGF0YXMgPSB0aGlzLmZpbHRlckRhdGFGcm9tQXJ0aXN0cyhhcnRpc3RzKVxyXG4gICAgbGV0IGFydGlzdE5hbWVzID0gJydcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJ0aXN0c0RhdGFzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGFydGlzdCA9IGFydGlzdHNEYXRhc1tpXVxyXG4gICAgICBhcnRpc3ROYW1lcyArPSBgPGEgaHJlZj1cIiR7YXJ0aXN0LmV4dGVybmFsX3VybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FydGlzdC5uYW1lfTwvYT5gXHJcblxyXG4gICAgICBpZiAoaSA8IGFydGlzdHNEYXRhcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgYXJ0aXN0TmFtZXMgKz0gJywgJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJ0aXN0TmFtZXNcclxuICB9XHJcblxyXG4gIC8qKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgdHJhY2suXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhY2tDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSkgOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMudHJhY2tQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnJhbmtDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUluXHJcbiAgICB9ICR7YXBwZWFyQ2xhc3N9XCI+XHJcbiAgICAgICAgICAgICAgPGg0IGlkPVwiJHtjb25maWcuQ1NTLklEcy5yYW5rfVwiPiR7aWR4ICsgMX0uPC9oND5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja31cIiBpZD1cIiR7dGhpcy5nZXRDYXJkSWQoKX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkRnJvbnRcclxuICAgICAgICAgICAgICAgICAgfVwiICB0aXRsZT1cIkNsaWNrIHRvIHZpZXcgbW9yZSBJbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiAke2NvbmZpZy5DU1MuQVRUUklCVVRFUy5yZXN0cmljdEZsaXBPbkNsaWNrfT1cInRydWVcIiBpZD1cIiR7dGhpcy5fdXJpfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCIgdGl0bGU9XCJDbGljayB0byBwbGF5IHNvbmdcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZVVybH1cIiBhbHQ9XCJBbGJ1bSBDb3ZlclwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxpbmdUZXh0XHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfTwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkQmFja30+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkR1cmF0aW9uOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+JHt0aGlzLl9kdXJhdGlvbn08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPlJlbGVhc2UgRGF0ZTo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5yZWxlYXNlRGF0ZS50b0RhdGVTdHJpbmcoKX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkFsYnVtIE5hbWU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiIHRhcmdldD1cIl9ibGFua1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHAgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMucmVzdHJpY3RGbGlwT25DbGlja309XCJ0cnVlXCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+JHtcclxuICAgICAgdGhpcy5hbGJ1bS5uYW1lXHJcbiAgICB9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKSBhcyBIVE1MRWxlbWVudFxyXG4gICAgY29uc3QgcGxheUJ0biA9IGVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG4pWzBdXHJcblxyXG4gICAgdGhpcy5zZWxFbCA9IHBsYXlCdG5cclxuXHJcbiAgICBwbGF5QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFja05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPih0aGlzKVxyXG4gICAgICB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSlcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGxheVBhdXNlQ2xpY2sgKHRyYWNrTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiwgdHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4gfCBudWxsID0gbnVsbCkge1xyXG4gICAgY29uc3QgdHJhY2sgPSB0aGlzIGFzIElQbGF5YWJsZVxyXG4gICAgbGV0IHRyYWNrQXJyID0gbnVsbFxyXG5cclxuICAgIGlmICh0cmFja0xpc3QpIHtcclxuICAgICAgdHJhY2tBcnIgPSB0cmFja0xpc3QudG9BcnJheSgpXHJcbiAgICB9XHJcbiAgICBldmVudEFnZ3JlZ2F0b3IucHVibGlzaChuZXcgUGxheWFibGVFdmVudEFyZyh0cmFjaywgdHJhY2tOb2RlLCB0cmFja0FycikpXHJcbiAgfVxyXG5cclxuICAvKiogR2V0IGEgdHJhY2sgaHRtbCB0byBiZSBwbGFjZWQgYXMgYSBsaXN0IGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRpc3BsYXlEYXRlIC0gd2hldGhlciB0byBkaXNwbGF5IHRoZSBkYXRlLlxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFBsYXlsaXN0VHJhY2tIdG1sICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8SVBsYXlhYmxlPiwgZGlzcGxheURhdGU6IGJvb2xlYW4gPSB0cnVlKTogTm9kZSB7XHJcbiAgICBjb25zdCB0cmFja05vZGUgPSB0cmFja0xpc3QuZmluZCgoeCkgPT4geC51cmkgPT09IHRoaXMudXJpLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICAvLyBmb3IgdGhlIHVuaXF1ZSBwbGF5IHBhdXNlIElEIGFsc28gdXNlIHRoZSBkYXRlIGFkZGVkIHRvIHBsYXlsaXN0IGFzIHRoZXJlIGNhbiBiZSBkdXBsaWNhdGVzIG9mIGEgc29uZyBpbiBhIHBsYXlsaXN0LlxyXG4gICAgY29uc3QgcGxheVBhdXNlSWQgPSB0aGlzLl91cmkgKyB0aGlzLmRhdGVBZGRlZFRvUGxheWxpc3RcclxuXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFRyYWNrfVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke3BsYXlQYXVzZUlkfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0fVwiIHNyYz1cIiR7XHJcbiAgICAgIHRoaXMuaW1hZ2VVcmxcclxuICAgIH1cIj48L2ltZz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubGlua3N9XCI+XHJcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiIHRhcmdldD1cIl9ibGFua1wiPlxyXG4gICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lXHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfVxyXG4gICAgICAgICAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgICAgICAgPGEvPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj5cclxuICAgICAgICAgICAgICAgICAgJHt0aGlzLmFydGlzdHNIdG1sfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGg1PiR7dGhpcy5fZHVyYXRpb259PC9oNT5cclxuICAgICAgICAgICAgICAke1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheURhdGVcclxuICAgICAgICAgICAgICAgICAgPyBgPGg1PiR7dGhpcy5kYXRlQWRkZWRUb1BsYXlsaXN0LnRvTG9jYWxlRGF0ZVN0cmluZygpfTwvaDU+YFxyXG4gICAgICAgICAgICAgICAgICA6ICcnXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKVxyXG5cclxuICAgIC8vIGdldCBwbGF5IHBhdXNlIGJ1dHRvblxyXG4gICAgY29uc3QgcGxheVBhdXNlQnRuID0gZWw/LmNoaWxkTm9kZXNbMV1cclxuICAgIGlmIChwbGF5UGF1c2VCdG4gPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGF5IHBhdXNlIGJ1dHRvbiBvbiB0cmFjayB3YXMgbm90IGZvdW5kJylcclxuICAgIH1cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudFxyXG4gICAgcGxheVBhdXNlQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMucGxheVBhdXNlQ2xpY2sodHJhY2tOb2RlLCB0cmFja0xpc3QpKVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBHZXQgYSB0cmFjayBodG1sIHRvIGJlIHBsYWNlZCBhcyBhIGxpc3QgZWxlbWVudCBvbiBhIHJhbmtlZCBsaXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEb3VibHlMaW5rZWRMaXN0PFRyYWNrPn0gdHJhY2tMaXN0IC0gbGlzdCBvZiB0cmFja3MgdGhhdCBjb250YWlucyB0aGlzIHRyYWNrLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYW5rIC0gdGhlIHJhbmsgb2YgdGhpcyBjYXJkXHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmFua2VkVHJhY2tIdG1sICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+LCByYW5rOiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IHRyYWNrTm9kZSA9IHRyYWNrTGlzdC5maW5kKCh4KSA9PiB4LnVyaSA9PT0gdGhpcy51cmksIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0VHJhY2t9XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rZWRUcmFja0ludGVyYWN0fSAke1xyXG4gICAgICAgICAgICAgICAgaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh0aGlzLnVyaSkgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHt0aGlzLl91cml9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRufSAke1xyXG4gICAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPHA+JHtyYW5rfS48L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIiBzcmM9XCIke1xyXG4gICAgICB0aGlzLmltYWdlVXJsXHJcbiAgICB9XCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmxpbmtzfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubmFtZVxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX1cclxuICAgICAgICAgICAgICAgICAgPC9oND5cclxuICAgICAgICAgICAgICAgIDxhLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dGhpcy5hcnRpc3RzSHRtbH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgIGBcclxuXHJcbiAgICBjb25zdCBlbCA9IGh0bWxUb0VsKGh0bWwpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXkgcGF1c2UgYnV0dG9uXHJcbiAgICBjb25zdCBwbGF5UGF1c2VCdG4gPSBlbD8uY2hpbGROb2Rlc1sxXS5jaGlsZE5vZGVzWzFdXHJcblxyXG4gICAgaWYgKHBsYXlQYXVzZUJ0biA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsYXkgcGF1c2UgYnV0dG9uIG9uIHRyYWNrIHdhcyBub3QgZm91bmQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5zZWxFbCA9IHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50XHJcblxyXG4gICAgLy8gc2VsZWN0IHRoZSByYW5rIGFyZWEgYXMgdG8ga2VlcCB0aGUgcGxheS9wYXVzZSBpY29uIHNob3duXHJcbiAgICBjb25zdCByYW5rZWRJbnRlcmFjdCA9IChlbCBhcyBIVE1MRWxlbWVudCkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMucmFua2VkVHJhY2tJbnRlcmFjdClbMF1cclxuICAgIHRoaXMub25QbGF5aW5nID0gKCkgPT4gcmFua2VkSW50ZXJhY3QuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLm9uU3RvcHBlZCA9ICgpID0+IHJhbmtlZEludGVyYWN0LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG5cclxuICAgIHBsYXlQYXVzZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGxheVBhdXNlQ2xpY2sodHJhY2tOb2RlLCB0cmFja0xpc3QpXHJcbiAgICB9KVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIHRoZSBmZWF0dXJlcyBvZiB0aGlzIHRyYWNrIGZyb20gdGhlIHNwb3RpZnkgd2ViIGFwaS4gKi9cclxuICBwdWJsaWMgYXN5bmMgbG9hZEZlYXR1cmVzICgpIHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zXHJcbiAgICAgIC5nZXQoY29uZmlnLlVSTHMuZ2V0VHJhY2tGZWF0dXJlcyArIHRoaXMuaWQpXHJcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgZXJyXHJcbiAgICAgIH0pXHJcbiAgICBjb25zdCBmZWF0cyA9IHJlcy5kYXRhLmF1ZGlvX2ZlYXR1cmVzXHJcbiAgICB0aGlzLmZlYXR1cmVzID0ge1xyXG4gICAgICBkYW5jZWFiaWxpdHk6IGZlYXRzLmRhbmNlYWJpbGl0eSxcclxuICAgICAgYWNvdXN0aWNuZXNzOiBmZWF0cy5hY291c3RpY25lc3MsXHJcbiAgICAgIGluc3RydW1lbnRhbG5lc3M6IGZlYXRzLmluc3RydW1lbnRhbG5lc3MsXHJcbiAgICAgIHZhbGVuY2U6IGZlYXRzLnZhbGVuY2UsXHJcbiAgICAgIGVuZXJneTogZmVhdHMuZW5lcmd5XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNcclxuICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmF0ZSB0cmFja3MgZnJvbSBkYXRhIGV4Y2x1ZGluZyBkYXRlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFRyYWNrRGF0YT59IGRhdGFzXHJcbiAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBBcnJheTxUcmFjaz59IHRyYWNrcyAtIGRvdWJsZSBsaW5rZWQgbGlzdFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgKGRhdGFzOiBBcnJheTxUcmFja0RhdGE+LCB0cmFja3M6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgQXJyYXk8VHJhY2s+KSB7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgZGF0YSA9IGRhdGFzW2ldXHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICBjb25zdCBwcm9wcyA9IHtcclxuICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgIGltYWdlczogZGF0YS5hbGJ1bS5pbWFnZXMsXHJcbiAgICAgICAgZHVyYXRpb246IGRhdGEuZHVyYXRpb25fbXMsXHJcbiAgICAgICAgdXJpOiBkYXRhLmxpbmtlZF9mcm9tICE9PSB1bmRlZmluZWQgPyBkYXRhLmxpbmtlZF9mcm9tLnVyaSA6IGRhdGEudXJpLFxyXG4gICAgICAgIHBvcHVsYXJpdHk6IGRhdGEucG9wdWxhcml0eSxcclxuICAgICAgICByZWxlYXNlRGF0ZTogZGF0YS5hbGJ1bS5yZWxlYXNlX2RhdGUsXHJcbiAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgYWxidW06IG5ldyBBbGJ1bShkYXRhLmFsYnVtLm5hbWUsIGRhdGEuYWxidW0uZXh0ZXJuYWxfdXJscy5zcG90aWZ5KSxcclxuICAgICAgICBleHRlcm5hbFVybHM6IGRhdGEuZXh0ZXJuYWxfdXJscyxcclxuICAgICAgICBhcnRpc3RzOiBkYXRhLmFydGlzdHMsXHJcbiAgICAgICAgaWR4OiBpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodHJhY2tzKSkge1xyXG4gICAgICAgIHRyYWNrcy5wdXNoKG5ldyBUcmFjayhwcm9wcykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdHJhY2tzLmFkZChuZXcgVHJhY2socHJvcHMpKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cmFja3NcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJhY2tcclxuIiwiXHJcbmltcG9ydCB7IElQcm9taXNlSGFuZGxlclJldHVybiwgU3BvdGlmeUltZyB9IGZyb20gJy4uL3R5cGVzJ1xyXG5pbXBvcnQgeyBURVJNUywgVEVSTV9UWVBFIH0gZnJvbSAnLi9jb21wb25lbnRzL3NhdmUtbG9hZC10ZXJtJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5jb25zdCBhdXRoRW5kcG9pbnQgPSAnaHR0cHM6Ly9hY2NvdW50cy5zcG90aWZ5LmNvbS9hdXRob3JpemUnXHJcbi8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFwcCdzIGNsaWVudCBJRCwgcmVkaXJlY3QgVVJJIGFuZCBkZXNpcmVkIHNjb3Blc1xyXG5leHBvcnQgY29uc3QgcmVkaXJlY3RVcmkgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ1xyXG5jb25zdCBjbGllbnRJZCA9ICc0MzRmNWU5ZjQ0MmE0ZTQ1ODZlMDg5YTMzZjY1Yzg1NydcclxuY29uc3Qgc2NvcGVzID0gW1xyXG4gICd1c2VyLXJlYWQtcGxheWJhY2stc3RhdGUnLFxyXG4gICd1c2VyLW1vZGlmeS1wbGF5YmFjay1zdGF0ZScsXHJcbiAgJ3VzZXItcmVhZC1jdXJyZW50bHktcGxheWluZycsXHJcbiAgJ3N0cmVhbWluZycsXHJcbiAgJ3VzZXItcmVhZC1lbWFpbCcsXHJcbiAgJ3VzZXItcmVhZC1wcml2YXRlJyxcclxuICAncGxheWxpc3QtcmVhZC1jb2xsYWJvcmF0aXZlJyxcclxuICAncGxheWxpc3QtcmVhZC1wcml2YXRlJyxcclxuICAncGxheWxpc3QtbW9kaWZ5LXByaXZhdGUnLFxyXG4gICd1c2VyLWxpYnJhcnktcmVhZCcsXHJcbiAgJ3VzZXItdG9wLXJlYWQnLFxyXG4gICd1c2VyLXJlYWQtcmVjZW50bHktcGxheWVkJyxcclxuICAndXNlci1mb2xsb3ctcmVhZCdcclxuXVxyXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xyXG4gIENTUzoge1xyXG4gICAgSURzOiB7XHJcbiAgICAgIGdldFRva2VuTG9hZGluZ1NwaW5uZXI6ICdnZXQtdG9rZW4tbG9hZGluZy1zcGlubmVyJyxcclxuICAgICAgcGxheWxpc3RDYXJkc0NvbnRhaW5lcjogJ3BsYXlsaXN0LWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIHRyYWNrQ2FyZHNDb250YWluZXI6ICd0cmFjay1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICBwbGF5bGlzdFByZWZpeDogJ3BsYXlsaXN0LScsXHJcbiAgICAgIHRyYWNrUHJlZml4OiAndHJhY2stJyxcclxuICAgICAgc3BvdGlmeUNvbnRhaW5lcjogJ3Nwb3RpZnktY29udGFpbmVyJyxcclxuICAgICAgaW5mb0NvbnRhaW5lcjogJ2luZm8tY29udGFpbmVyJyxcclxuICAgICAgYWxsb3dBY2Nlc3NIZWFkZXI6ICdhbGxvdy1hY2Nlc3MtaGVhZGVyJyxcclxuICAgICAgZXhwYW5kZWRQbGF5bGlzdE1vZHM6ICdleHBhbmRlZC1wbGF5bGlzdC1tb2RzJyxcclxuICAgICAgdHJhY2tzRGF0YTogJ3RyYWNrcy1kYXRhJyxcclxuICAgICAgdHJhY2tzQ2hhcnQ6ICd0cmFja3MtY2hhcnQnLFxyXG4gICAgICB0cmFja3NUZXJtU2VsZWN0aW9uczogJ3RyYWNrcy10ZXJtLXNlbGVjdGlvbnMnLFxyXG4gICAgICBmZWF0dXJlU2VsZWN0aW9uczogJ2ZlYXR1cmUtc2VsZWN0aW9ucycsXHJcbiAgICAgIHBsYXlsaXN0c1NlY3Rpb246ICdwbGF5bGlzdHMtc2VjdGlvbicsXHJcbiAgICAgIGZlYXREZWY6ICdmZWF0LWRlZmluaXRpb24nLFxyXG4gICAgICBmZWF0QXZlcmFnZTogJ2ZlYXQtYXZlcmFnZScsXHJcbiAgICAgIHJhbms6ICdyYW5rJyxcclxuICAgICAgdmlld0FsbFRvcFRyYWNrczogJ3ZpZXctYWxsLXRvcC10cmFja3MnLFxyXG4gICAgICBlbW9qaXM6ICdlbW9qaXMnLFxyXG4gICAgICBhcnRpc3RDYXJkc0NvbnRhaW5lcjogJ2FydGlzdC1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICBhcnRpc3RQcmVmaXg6ICdhcnRpc3QtJyxcclxuICAgICAgaW5pdGlhbENhcmQ6ICdpbml0aWFsLWNhcmQnLFxyXG4gICAgICBjb252ZXJ0Q2FyZDogJ2NvbnZlcnQtY2FyZCcsXHJcbiAgICAgIGFydGlzdFRlcm1TZWxlY3Rpb25zOiAnYXJ0aXN0cy10ZXJtLXNlbGVjdGlvbnMnLFxyXG4gICAgICBwcm9maWxlSGVhZGVyOiAncHJvZmlsZS1oZWFkZXInLFxyXG4gICAgICBjbGVhckRhdGE6ICdjbGVhci1kYXRhJyxcclxuICAgICAgbGlrZWRUcmFja3M6ICdsaWtlZC10cmFja3MnLFxyXG4gICAgICBmb2xsb3dlZEFydGlzdHM6ICdmb2xsb3dlZC1hcnRpc3RzJyxcclxuICAgICAgd2ViUGxheWVyOiAnd2ViLXBsYXllcicsXHJcbiAgICAgIHBsYXlUaW1lQmFyOiAncGxheXRpbWUtYmFyJyxcclxuICAgICAgcGxheWxpc3RIZWFkZXJBcmVhOiAncGxheWxpc3QtbWFpbi1oZWFkZXItYXJlYScsXHJcbiAgICAgIHBsYXlOZXh0OiAncGxheS1uZXh0JyxcclxuICAgICAgcGxheVByZXY6ICdwbGF5LXByZXYnLFxyXG4gICAgICB3ZWJQbGF5ZXJQbGF5UGF1c2U6ICdwbGF5LXBhdXNlLXBsYXllcicsXHJcbiAgICAgIHdlYlBsYXllclZvbHVtZTogJ3dlYi1wbGF5ZXItdm9sdW1lLWJhcicsXHJcbiAgICAgIHdlYlBsYXllclByb2dyZXNzOiAnd2ViLXBsYXllci1wcm9ncmVzcy1iYXInLFxyXG4gICAgICBwbGF5ZXJUcmFja0ltZzogJ3BsYXllci10cmFjay1pbWcnLFxyXG4gICAgICB3ZWJQbGF5ZXJBcnRpc3RzOiAnd2ViLXBsYXllci1hcnRpc3RzJyxcclxuICAgICAgZ2VuZXJhdGVQbGF5bGlzdDogJ2dlbmVyYXRlLXBsYXlsaXN0JyxcclxuICAgICAgaGlkZVNob3dQbGF5bGlzdFR4dDogJ2hpZGUtc2hvdy1wbGF5bGlzdC10eHQnLFxyXG4gICAgICB0b3BUcmFja3NUZXh0Rm9ybUNvbnRhaW5lcjogJ3Rlcm0tdGV4dC1mb3JtLWNvbnRhaW5lcicsXHJcbiAgICAgIHVzZXJuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgICB0b3BOYXZNb2JpbGU6ICd0b3BuYXYtbW9iaWxlJyxcclxuICAgICAgc2h1ZmZsZTogJ3NodWZmbGUnLFxyXG4gICAgICBob21lSGVhZGVyOiAnaG9tZS1oZWFkZXInLFxyXG4gICAgICBsb29wOiAnbG9vcCdcclxuICAgIH0sXHJcbiAgICBDTEFTU0VTOiB7XHJcbiAgICAgIGdsb3c6ICdnbG93JyxcclxuICAgICAgcGxheWxpc3Q6ICdwbGF5bGlzdCcsXHJcbiAgICAgIHRyYWNrOiAndHJhY2snLFxyXG4gICAgICBhcnRpc3Q6ICdhcnRpc3QnLFxyXG4gICAgICByYW5rQ2FyZDogJ3JhbmstY2FyZCcsXHJcbiAgICAgIHBsYXlsaXN0VHJhY2s6ICdwbGF5bGlzdC10cmFjaycsXHJcbiAgICAgIGluZm9Mb2FkaW5nU3Bpbm5lcnM6ICdpbmZvLWxvYWRpbmctc3Bpbm5lcicsXHJcbiAgICAgIGFwcGVhcjogJ2FwcGVhcicsXHJcbiAgICAgIGhpZGU6ICdoaWRlJyxcclxuICAgICAgc2VsZWN0ZWQ6ICdzZWxlY3RlZCcsXHJcbiAgICAgIGNhcmQ6ICdjYXJkJyxcclxuICAgICAgcGxheWxpc3RTZWFyY2g6ICdwbGF5bGlzdC1zZWFyY2gnLFxyXG4gICAgICBlbGxpcHNpc1dyYXA6ICdlbGxpcHNpcy13cmFwJyxcclxuICAgICAgbmFtZTogJ25hbWUnLFxyXG4gICAgICBwbGF5bGlzdE9yZGVyOiAncGxheWxpc3Qtb3JkZXInLFxyXG4gICAgICBjaGFydEluZm86ICdjaGFydC1pbmZvJyxcclxuICAgICAgZmxpcENhcmRJbm5lcjogJ2ZsaXAtY2FyZC1pbm5lcicsXHJcbiAgICAgIGZsaXBDYXJkRnJvbnQ6ICdmbGlwLWNhcmQtZnJvbnQnLFxyXG4gICAgICBmbGlwQ2FyZEJhY2s6ICdmbGlwLWNhcmQtYmFjaycsXHJcbiAgICAgIGZsaXBDYXJkOiAnZmxpcC1jYXJkJyxcclxuICAgICAgcmVzaXplQ29udGFpbmVyOiAncmVzaXplLWNvbnRhaW5lcicsXHJcbiAgICAgIHNjcm9sbExlZnQ6ICdzY3JvbGwtbGVmdCcsXHJcbiAgICAgIHNjcm9sbGluZ1RleHQ6ICdzY3JvbGxpbmctdGV4dCcsXHJcbiAgICAgIG5vU2VsZWN0OiAnbm8tc2VsZWN0JyxcclxuICAgICAgZHJvcERvd246ICdkcm9wLWRvd24nLFxyXG4gICAgICBleHBhbmRhYmxlVHh0Q29udGFpbmVyOiAnZXhwYW5kYWJsZS10ZXh0LWNvbnRhaW5lcicsXHJcbiAgICAgIGJvcmRlckNvdmVyOiAnYm9yZGVyLWNvdmVyJyxcclxuICAgICAgZmlyc3RFeHBhbnNpb246ICdmaXJzdC1leHBhbnNpb24nLFxyXG4gICAgICBzZWNvbmRFeHBhbnNpb246ICdzZWNvbmQtZXhwYW5zaW9uJyxcclxuICAgICAgaW52aXNpYmxlOiAnaW52aXNpYmxlJyxcclxuICAgICAgZmFkZUluOiAnZmFkZS1pbicsXHJcbiAgICAgIGZyb21Ub3A6ICdmcm9tLXRvcCcsXHJcbiAgICAgIGV4cGFuZE9uSG92ZXI6ICdleHBhbmQtb24taG92ZXInLFxyXG4gICAgICB0cmFja3NBcmVhOiAndHJhY2tzLWFyZWEnLFxyXG4gICAgICBzY3JvbGxCYXI6ICdzY3JvbGwtYmFyJyxcclxuICAgICAgdHJhY2tMaXN0OiAndHJhY2stbGlzdCcsXHJcbiAgICAgIGFydGlzdFRvcFRyYWNrczogJ2FydGlzdC10b3AtdHJhY2tzJyxcclxuICAgICAgdGV4dEZvcm06ICd0ZXh0LWZvcm0nLFxyXG4gICAgICBjb250ZW50OiAnY29udGVudCcsXHJcbiAgICAgIGxpbmtzOiAnbGlua3MnLFxyXG4gICAgICBwcm9ncmVzczogJ3Byb2dyZXNzJyxcclxuICAgICAgcGxheVBhdXNlOiAncGxheS1wYXVzZScsXHJcbiAgICAgIHJhbmtlZFRyYWNrSW50ZXJhY3Q6ICdyYW5rZWQtaW50ZXJhY3Rpb24tYXJlYScsXHJcbiAgICAgIHNsaWRlcjogJ3NsaWRlcicsXHJcbiAgICAgIHBsYXlCdG46ICdwbGF5LWJ0bicsXHJcbiAgICAgIGRpc3BsYXlOb25lOiAnZGlzcGxheS1ub25lJyxcclxuICAgICAgY29sdW1uOiAnY29sdW1uJyxcclxuICAgICAgd2ViUGxheWVyQ29udHJvbHM6ICd3ZWItcGxheWVyLWNvbnRyb2xzJ1xyXG4gICAgfSxcclxuICAgIEFUVFJJQlVURVM6IHtcclxuICAgICAgZGF0YVNlbGVjdGlvbjogJ2RhdGEtc2VsZWN0aW9uJyxcclxuICAgICAgcmVzdHJpY3RGbGlwT25DbGljazogJ2RhdGEtcmVzdHJpY3QtZmxpcC1vbi1jbGljaydcclxuICAgIH1cclxuICB9LFxyXG4gIFVSTHM6IHtcclxuICAgIHNpdGVVcmw6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAnLFxyXG4gICAgYXV0aDogYCR7YXV0aEVuZHBvaW50fT9jbGllbnRfaWQ9JHtjbGllbnRJZH0mcmVkaXJlY3RfdXJpPSR7cmVkaXJlY3RVcml9JnNjb3BlPSR7c2NvcGVzLmpvaW4oXHJcbiAgICAgICclMjAnXHJcbiAgICApfSZyZXNwb25zZV90eXBlPWNvZGUmc2hvd19kaWFsb2c9dHJ1ZWAsXHJcbiAgICBnZXRIYXNUb2tlbnM6ICcvdG9rZW5zL2hhcy10b2tlbnMnLFxyXG4gICAgZ2V0QWNjZXNzVG9rZW46ICcvdG9rZW5zL2dldC1hY2Nlc3MtdG9rZW4nLFxyXG4gICAgZ2V0T2J0YWluVG9rZW5zUHJlZml4OiAoY29kZTogc3RyaW5nKSA9PiBgL3Rva2Vucy9vYnRhaW4tdG9rZW5zP2NvZGU9JHtjb2RlfWAsXHJcbiAgICBnZXRUb3BBcnRpc3RzOiAnL3Nwb3RpZnkvZ2V0LXRvcC1hcnRpc3RzP3RpbWVfcmFuZ2U9JyxcclxuICAgIGdldFRvcFRyYWNrczogJy9zcG90aWZ5L2dldC10b3AtdHJhY2tzP3RpbWVfcmFuZ2U9JyxcclxuICAgIGdldFBsYXlsaXN0czogJy9zcG90aWZ5L2dldC1wbGF5bGlzdHMnLFxyXG4gICAgZ2V0UGxheWxpc3RUcmFja3M6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3QtdHJhY2tzP3BsYXlsaXN0X2lkPScsXHJcbiAgICBwdXRDbGVhclRva2VuczogJy90b2tlbnMvY2xlYXItdG9rZW5zJyxcclxuICAgIGRlbGV0ZVBsYXlsaXN0VHJhY2tzOiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvZGVsZXRlLXBsYXlsaXN0LWl0ZW1zP3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgcG9zdFBsYXlsaXN0VHJhY2tzOiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1wbGF5bGlzdC1pdGVtcz9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIGdldFRyYWNrRmVhdHVyZXM6ICcvc3BvdGlmeS9nZXQtdHJhY2tzLWZlYXR1cmVzP3RyYWNrX2lkcz0nLFxyXG4gICAgcHV0UmVmcmVzaEFjY2Vzc1Rva2VuOiAnL3Rva2Vucy9yZWZyZXNoLXRva2VuJyxcclxuICAgIHB1dFNlc3Npb25EYXRhOiAnL3Nwb3RpZnkvcHV0LXNlc3Npb24tZGF0YT9hdHRyPScsXHJcbiAgICBwdXRQbGF5bGlzdFJlc2l6ZURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5bGlzdC1yZXNpemUtZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXlsaXN0UmVzaXplRGF0YTogJy91c2VyL2dldC1wbGF5bGlzdC1yZXNpemUtZGF0YScsXHJcbiAgICBwdXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5bGlzdC10ZXh0LWZvcm0tZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXlsaXN0SXNJblRleHRGb3JtRGF0YTogJy91c2VyL2dldC1wbGF5bGlzdC10ZXh0LWZvcm0tZGF0YScsXHJcbiAgICBwdXRUb3BUcmFja3NJc0luVGV4dEZvcm1EYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtdG9wLXRyYWNrcy10ZXh0LWZvcm0tZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFRvcFRyYWNrc0lzSW5UZXh0Rm9ybURhdGE6ICcvdXNlci9nZXQtdG9wLXRyYWNrcy10ZXh0LWZvcm0tZGF0YScsXHJcbiAgICBnZXRBcnRpc3RUb3BUcmFja3M6IChpZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvZ2V0LWFydGlzdC10b3AtdHJhY2tzP2lkPSR7aWR9YCxcclxuICAgIGdldEN1cnJlbnRVc2VyUHJvZmlsZTogJy9zcG90aWZ5L2dldC1jdXJyZW50LXVzZXItcHJvZmlsZScsXHJcbiAgICBwdXRDbGVhclNlc3Npb246ICcvY2xlYXItc2Vzc2lvbicsXHJcbiAgICBnZXRDdXJyZW50VXNlclNhdmVkVHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LWN1cnJlbnQtdXNlci1zYXZlZC10cmFja3MnLFxyXG4gICAgZ2V0Rm9sbG93ZWRBcnRpc3RzOiAnL3Nwb3RpZnkvZ2V0LWZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgcHV0UGxheVRyYWNrOiAoZGV2aWNlX2lkOiBzdHJpbmcsIHRyYWNrX3VyaTogc3RyaW5nKSA9PlxyXG4gICAgICBgL3Nwb3RpZnkvcGxheS10cmFjaz9kZXZpY2VfaWQ9JHtkZXZpY2VfaWR9JnRyYWNrX3VyaT0ke3RyYWNrX3VyaX1gLFxyXG4gICAgcHV0UGxheWVyVm9sdW1lRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXBsYXllci12b2x1bWU/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5ZXJWb2x1bWVEYXRhOiAnL3VzZXIvZ2V0LXBsYXllci12b2x1bWUnLFxyXG4gICAgcHV0VGVybTogKHRlcm06IFRFUk1TLCB0ZXJtVHlwZTogVEVSTV9UWVBFKSA9PiBgL3VzZXIvcHV0LXRvcC0ke3Rlcm1UeXBlfS10ZXJtP3Rlcm09JHt0ZXJtfWAsXHJcbiAgICBnZXRUZXJtOiAodGVybVR5cGU6IFRFUk1fVFlQRSkgPT4gYC91c2VyL2dldC10b3AtJHt0ZXJtVHlwZX0tdGVybWAsXHJcbiAgICBwdXRDdXJyUGxheWxpc3RJZDogKGlkOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtY3VycmVudC1wbGF5bGlzdC1pZD9pZD0ke2lkfWAsXHJcbiAgICBnZXRDdXJyUGxheWxpc3RJZDogJy91c2VyL2dldC1jdXJyZW50LXBsYXlsaXN0LWlkJyxcclxuICAgIHBvc3RQbGF5bGlzdDogKG5hbWU6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtcGxheWxpc3Q/bmFtZT0ke25hbWV9YCxcclxuICAgIHBvc3RJdGVtc1RvUGxheWxpc3Q6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LWl0ZW1zLXRvLXBsYXlsaXN0P3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgZ2V0VXNlcm5hbWU6ICcvdXNlci9nZXQtdXNlcm5hbWUnXHJcbiAgfSxcclxuICBQQVRIUzoge1xyXG4gICAgc3Bpbm5lcjogJy9pbWFnZXMvMjAwcHhMb2FkaW5nU3Bpbm5lci5zdmcnLFxyXG4gICAgZ3JpZFZpZXc6ICcvaW1hZ2VzL2dyaWQtdmlldy1pY29uLnBuZycsXHJcbiAgICBsaXN0VmlldzogJy9pbWFnZXMvbGlzdC12aWV3LWljb24ucG5nJyxcclxuICAgIGNoZXZyb25MZWZ0OiAnL2ltYWdlcy9jaGV2cm9uLWxlZnQucG5nJyxcclxuICAgIGNoZXZyb25SaWdodDogJy9pbWFnZXMvY2hldnJvbi1yaWdodC5wbmcnLFxyXG4gICAgcGxheUljb246ICcvaW1hZ2VzL3BsYXktMzBweC5wbmcnLFxyXG4gICAgcGF1c2VJY29uOiAnL2ltYWdlcy9wYXVzZS0zMHB4LnBuZycsXHJcbiAgICBwbGF5QmxhY2tJY29uOiAnL2ltYWdlcy9wbGF5LWJsYWNrLTMwcHgucG5nJyxcclxuICAgIHBhdXNlQmxhY2tJY29uOiAnL2ltYWdlcy9wYXVzZS1ibGFjay0zMHB4LnBuZycsXHJcbiAgICBwbGF5TmV4dDogJy9pbWFnZXMvbmV4dC0zMHB4LnBuZycsXHJcbiAgICBwbGF5UHJldjogJy9pbWFnZXMvcHJldmlvdXMtMzBweC5wbmcnLFxyXG4gICAgcHJvZmlsZVVzZXI6ICcvaW1hZ2VzL3Byb2ZpbGUtdXNlci5wbmcnLFxyXG4gICAgc2h1ZmZsZUljb246ICcvaW1hZ2VzL3NodWZmbGUtaWNvbi5wbmcnLFxyXG4gICAgc2h1ZmZsZUljb25HcmVlbjogJy9pbWFnZXMvc2h1ZmZsZS1pY29uLWdyZWVuLnBuZycsXHJcbiAgICBsb29wSWNvbjogJy9pbWFnZXMvbG9vcC1pY29uLnBuZycsXHJcbiAgICBsb29wSWNvbkdyZWVuOiAnL2ltYWdlcy9sb29wLWljb24tZ3JlZW4ucG5nJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMgKG1pbGxpczogbnVtYmVyKSB7XHJcbiAgY29uc3QgbWludXRlczogbnVtYmVyID0gTWF0aC5mbG9vcihtaWxsaXMgLyA2MDAwMClcclxuICBjb25zdCBzZWNvbmRzOiBudW1iZXIgPSBwYXJzZUludCgoKG1pbGxpcyAlIDYwMDAwKSAvIDEwMDApLnRvRml4ZWQoMCkpXHJcbiAgcmV0dXJuIHNlY29uZHMgPT09IDYwXHJcbiAgICA/IG1pbnV0ZXMgKyAxICsgJzowMCdcclxuICAgIDogbWludXRlcyArICc6JyArIChzZWNvbmRzIDwgMTAgPyAnMCcgOiAnJykgKyBzZWNvbmRzXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGh0bWxUb0VsIChodG1sOiBzdHJpbmcpIHtcclxuICBjb25zdCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKVxyXG4gIGh0bWwgPSBodG1sLnRyaW0oKSAvLyBOZXZlciByZXR1cm4gYSBzcGFjZSB0ZXh0IG5vZGUgYXMgYSByZXN1bHRcclxuICB0ZW1wLmlubmVySFRNTCA9IGh0bWxcclxuICByZXR1cm4gdGVtcC5jb250ZW50LmZpcnN0Q2hpbGRcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21pc2VIYW5kbGVyPFQ+IChcclxuICBwcm9taXNlOiBQcm9taXNlPFQ+LFxyXG4gIG9uU3VjY2VzZnVsID0gKHJlczogVCkgPT4geyB9LFxyXG4gIG9uRmFpbHVyZSA9IChlcnI6IHVua25vd24pID0+IHtcclxuICAgIGlmIChlcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlcnIpXHJcbiAgICB9XHJcbiAgfVxyXG4pIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgcHJvbWlzZVxyXG4gICAgb25TdWNjZXNmdWwocmVzIGFzIFQpXHJcbiAgICByZXR1cm4geyByZXM6IHJlcywgZXJyOiBudWxsIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XHJcbiAgICBvbkZhaWx1cmUoZXJyKVxyXG4gICAgcmV0dXJuIHsgcmVzOiBudWxsLCBlcnI6IGVyciB9IGFzIElQcm9taXNlSGFuZGxlclJldHVybjxUPlxyXG4gIH1cclxufVxyXG5cclxuLyoqIEZpbHRlcnMgJ2xpJyBlbGVtZW50cyB0byBlaXRoZXIgYmUgaGlkZGVuIG9yIG5vdCBkZXBlbmRpbmcgb24gaWZcclxuICogdGhleSBjb250YWluIHNvbWUgZ2l2ZW4gaW5wdXQgdGV4dC5cclxuICpcclxuICogQHBhcmFtIHtIVE1MfSB1bCAtIHVub3JkZXJlZCBsaXN0IGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgJ2xpJyB0byBiZSBmaWx0ZXJlZFxyXG4gKiBAcGFyYW0ge0hUTUx9IGlucHV0IC0gaW5wdXQgZWxlbWVudCB3aG9zZSB2YWx1ZSB3aWxsIGJlIHVzZWQgdG8gZmlsdGVyXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdGREaXNwbGF5IC0gdGhlIHN0YW5kYXJkIGRpc3BsYXkgdGhlICdsaScgc2hvdWxkIGhhdmUgd2hlbiBub3QgJ25vbmUnXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoVWwgKHVsOiBIVE1MVUxpc3RFbGVtZW50LCBpbnB1dDogSFRNTElucHV0RWxlbWVudCwgc3RkRGlzcGxheTogc3RyaW5nID0gJ2ZsZXgnKTogdm9pZCB7XHJcbiAgY29uc3QgbGlFbHMgPSB1bC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKVxyXG4gIGNvbnN0IGZpbHRlciA9IGlucHV0LnZhbHVlLnRvVXBwZXJDYXNlKClcclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaUVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gZ2V0IHRoZSBuYW1lIGNoaWxkIGVsIGluIHRoZSBsaSBlbFxyXG4gICAgY29uc3QgbmFtZSA9IGxpRWxzW2ldLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLm5hbWUpWzBdXHJcbiAgICBjb25zdCBuYW1lVHh0ID0gbmFtZS50ZXh0Q29udGVudCB8fCBuYW1lLmlubmVySFRNTFxyXG5cclxuICAgIGlmIChuYW1lVHh0ICYmIG5hbWVUeHQudG9VcHBlckNhc2UoKS5pbmRleE9mKGZpbHRlcikgPiAtMSkge1xyXG4gICAgICAvLyBzaG93IGxpJ3Mgd2hvc2UgbmFtZSBjb250YWlucyB0aGUgdGhlIGVudGVyZWQgc3RyaW5nXHJcbiAgICAgIGxpRWxzW2ldLnN0eWxlLmRpc3BsYXkgPSBzdGREaXNwbGF5XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBvdGhlcndpc2UgaGlkZSBpdFxyXG4gICAgICBsaUVsc1tpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVXNlcyBjYW52YXMubWVhc3VyZVRleHQgdG8gY29tcHV0ZSBhbmQgcmV0dXJuIHRoZSB3aWR0aCBvZiB0aGUgZ2l2ZW4gdGV4dCBvZiBnaXZlbiBmb250IGluIHBpeGVscy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IHRleHQgVGhlIHRleHQgdG8gYmUgcmVuZGVyZWQuXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmb250IFRoZSBjc3MgZm9udCBkZXNjcmlwdG9yIHRoYXQgdGV4dCBpcyB0byBiZSByZW5kZXJlZCB3aXRoIChlLmcuIFwiYm9sZCAxNHB4IHZlcmRhbmFcIikuXHJcbiAqXHJcbiAqIEBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTE4MjQxL2NhbGN1bGF0ZS10ZXh0LXdpZHRoLXdpdGgtamF2YXNjcmlwdC8yMTAxNTM5MyMyMTAxNTM5M1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRleHRXaWR0aCAodGV4dDogc3RyaW5nLCBmb250OiBzdHJpbmcpIHtcclxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxyXG4gIGxldCBtZXRyaWNzOiBUZXh0TWV0cmljc1xyXG4gIGlmIChjb250ZXh0KSB7XHJcbiAgICBjb250ZXh0LmZvbnQgPSBmb250XHJcbiAgICBtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dCh0ZXh0KVxyXG4gICAgcmV0dXJuIG1ldHJpY3Mud2lkdGhcclxuICB9XHJcblxyXG4gIHRocm93IG5ldyBFcnJvcignTm8gY29udGV4dCBvbiBjcmVhdGVkIGNhbnZhcyB3YXMgZm91bmQnKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNFbGxpcHNpc0FjdGl2ZSAoZWw6IEhUTUxFbGVtZW50KSB7XHJcbiAgcmV0dXJuIGVsLm9mZnNldFdpZHRoIDwgZWwuc2Nyb2xsV2lkdGhcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemVGaXJzdExldHRlciAoc3RyaW5nOiBzdHJpbmcpIHtcclxuICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRWYWxpZEltYWdlIChpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+LCBpZHggPSAwKSB7XHJcbiAgLy8gb2J0YWluIHRoZSBjb3JyZWN0IGltYWdlXHJcbiAgaWYgKGltYWdlcy5sZW5ndGggPiBpZHgpIHtcclxuICAgIGNvbnN0IGltZyA9IGltYWdlc1tpZHhdXHJcbiAgICByZXR1cm4gaW1nLnVybFxyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gJydcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVBbGxDaGlsZE5vZGVzIChwYXJlbnQ6IE5vZGUpIHtcclxuICB3aGlsZSAocGFyZW50LmZpcnN0Q2hpbGQpIHtcclxuICAgIHBhcmVudC5yZW1vdmVDaGlsZChwYXJlbnQuZmlyc3RDaGlsZClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBhbmltYXRpb25Db250cm9sID0gKGZ1bmN0aW9uICgpIHtcclxuICAvKiogQWRkcyBhIGNsYXNzIHRvIGVhY2ggZWxlbWVudCBjYXVzaW5nIGEgdHJhbnNpdGlvbiB0byB0aGUgY2hhbmdlZCBjc3MgdmFsdWVzLlxyXG4gICAqIFRoaXMgaXMgZG9uZSBvbiBzZXQgaW50ZXJ2YWxzLlxyXG4gICAqXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gZWxlbWVudHNUb0FuaW1hdGUgLSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNsYXNzZXMgb3IgaWRzIG9mIGVsZW1lbnRzIHRvIGFuaW1hdGUgaW5jbHVkaW5nIHByZWZpeCBjaGFyLlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc1RvVHJhbnNpdGlvblRvbyAtIFRoZSBjbGFzcyB0aGF0IGFsbCB0aGUgdHJhbnNpdGlvbmluZyBlbGVtZW50cyB3aWxsIGFkZFxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBhbmltYXRpb25JbnRlcnZhbCAtIFRoZSBpbnRlcnZhbCB0byB3YWl0IGJldHdlZW4gYW5pbWF0aW9uIG9mIGVsZW1lbnRzXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYWRkQ2xhc3NPbkludGVydmFsIChcclxuICAgIGVsZW1lbnRzVG9BbmltYXRlOiBzdHJpbmcsXHJcbiAgICBjbGFzc1RvVHJhbnNpdGlvblRvbzogc3RyaW5nLFxyXG4gICAgYW5pbWF0aW9uSW50ZXJ2YWw6IG51bWJlclxyXG4gICkge1xyXG4gICAgLy8gYXJyIG9mIGh0bWwgc2VsZWN0b3JzIHRoYXQgcG9pbnQgdG8gZWxlbWVudHMgdG8gYW5pbWF0ZVxyXG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGVsZW1lbnRzVG9BbmltYXRlLnNwbGl0KCcsJylcclxuXHJcbiAgICBhdHRyaWJ1dGVzLmZvckVhY2goKGF0dHIpID0+IHtcclxuICAgICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGF0dHIpXHJcbiAgICAgIGxldCBpZHggPSAwXHJcbiAgICAgIC8vIGluIGludGVydmFscyBwbGF5IHRoZWlyIGluaXRpYWwgYW5pbWF0aW9uc1xyXG4gICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICBpZiAoaWR4ID09PSBlbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRzW2lkeF1cclxuICAgICAgICAvLyBhZGQgdGhlIGNsYXNzIHRvIHRoZSBlbGVtZW50cyBjbGFzc2VzIGluIG9yZGVyIHRvIHJ1biB0aGUgdHJhbnNpdGlvblxyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc1RvVHJhbnNpdGlvblRvbylcclxuICAgICAgICBpZHggKz0gMVxyXG4gICAgICB9LCBhbmltYXRpb25JbnRlcnZhbClcclxuICAgIH0pXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBhZGRDbGFzc09uSW50ZXJ2YWxcclxuICB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQaXhlbFBvc0luRWxPbkNsaWNrIChtb3VzZUV2dDogTW91c2VFdmVudCk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XHJcbiAgY29uc3QgcmVjdCA9IChtb3VzZUV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgY29uc3QgeCA9IG1vdXNlRXZ0LmNsaWVudFggLSByZWN0LmxlZnQgLy8geCBwb3NpdGlvbiB3aXRoaW4gdGhlIGVsZW1lbnQuXHJcbiAgY29uc3QgeSA9IG1vdXNlRXZ0LmNsaWVudFkgLSByZWN0LnRvcCAvLyB5IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICByZXR1cm4geyB4LCB5IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXhwcmVzc2lvbiAoZXJyb3JNZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSlcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEl0ZW1zVG9QbGF5bGlzdCAocGxheWxpc3RJZDogc3RyaW5nLCB1cmlzOiBBcnJheTxzdHJpbmc+KSB7XHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcyh7XHJcbiAgICAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgICB1cmw6IGNvbmZpZy5VUkxzLnBvc3RJdGVtc1RvUGxheWxpc3QocGxheWxpc3RJZCksXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB1cmlzOiB1cmlzXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgKCkgPT4ge30sICgpID0+IHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJc3N1ZSBhZGRpbmcgaXRlbXMgdG8gcGxheWxpc3QnKVxyXG4gICAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFNodWZmbGVzIGEgZ2l2ZW4gYXJyYXkgYW5kIHJldHVybnMgdGhlIHNodWZmbGVkIHZlcnNpb24uXHJcbiAqIEBwYXJhbSB7QXJyYXk8VD59IGFycmF5IFRoZSBhcnJheSB0byBzaHVmZmxlIGJ1dCBub3QgbXV0YXRlLlxyXG4gKiBAcmV0dXJucyB7QXJyYXk8VD59IGEgc2h1ZmZsZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gYXJyYXkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZTxUPiAoYXJyYXk6IEFycmF5PFQ+KSB7XHJcbiAgY29uc3QgY2xvbmVBcnIgPSBbLi4uYXJyYXldXHJcbiAgbGV0IGN1cnJlbnRJbmRleCA9IGFycmF5Lmxlbmd0aFxyXG4gIGxldCByYW5kb21JbmRleFxyXG5cclxuICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gIHdoaWxlIChjdXJyZW50SW5kZXggIT09IDApIHtcclxuICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpXHJcbiAgICBjdXJyZW50SW5kZXgtLTtcclxuXHJcbiAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICBbY2xvbmVBcnJbY3VycmVudEluZGV4XSwgY2xvbmVBcnJbcmFuZG9tSW5kZXhdXSA9IFtcclxuICAgICAgY2xvbmVBcnJbcmFuZG9tSW5kZXhdLCBjbG9uZUFycltjdXJyZW50SW5kZXhdXVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNsb25lQXJyXHJcbn1cclxuIiwiaW1wb3J0IHsgY29uZmlnLCBwcm9taXNlSGFuZGxlciwgdGhyb3dFeHByZXNzaW9uIH0gZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgZGlzcGxheVVzZXJuYW1lIH0gZnJvbSAnLi91c2VyLWRhdGEnXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tJZkhhc1Rva2VucyAoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBhd2FpdCBwcm9taXNlIHJlc29sdmUgdGhhdCByZXR1cm5zIHdoZXRoZXIgdGhlIHNlc3Npb24gaGFzIHRva2Vucy5cclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRIYXNUb2tlbnMpLFxyXG4gICAgKHJlcykgPT4ge1xyXG4gICAgICBoYXNUb2tlbiA9IHJlcy5kYXRhXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICByZXR1cm4gaGFzVG9rZW5cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VucyAoKSB7XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBjcmVhdGUgYSBwYXJhbWV0ZXIgc2VhcmNoZXIgaW4gdGhlIFVSTCBhZnRlciAnPycgd2hpY2ggaG9sZHMgdGhlIHJlcXVlc3RzIGJvZHkgcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcclxuXHJcbiAgLy8gR2V0IHRoZSBjb2RlIGZyb20gdGhlIHBhcmFtZXRlciBjYWxsZWQgJ2NvZGUnIGluIHRoZSB1cmwgd2hpY2hcclxuICAvLyBob3BlZnVsbHkgY2FtZSBiYWNrIGZyb20gdGhlIHNwb3RpZnkgR0VUIHJlcXVlc3Qgb3RoZXJ3aXNlIGl0IGlzIG51bGxcclxuICBsZXQgYXV0aENvZGUgPSB1cmxQYXJhbXMuZ2V0KCdjb2RlJylcclxuXHJcbiAgaWYgKGF1dGhDb2RlKSB7XHJcbiAgICAvLyBvYnRhaW4gdG9rZW5zXHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldE9idGFpblRva2Vuc1ByZWZpeChhdXRoQ29kZSkpLFxyXG5cclxuICAgICAgLy8gaWYgdGhlIHJlcXVlc3Qgd2FzIHN1Y2Nlc2Z1bCB3ZSBoYXZlIHJlY2lldmVkIGEgdG9rZW5cclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIGhhc1Rva2VuID0gdHJ1ZVxyXG4gICAgICB9XHJcbiAgICApXHJcbiAgICBhdXRoQ29kZSA9ICcnXHJcblxyXG4gICAgLy8gZ2V0IHVzZXIgaW5mbyBmcm9tIHNwb3RpZnlcclxuICAgIGF3YWl0IHByb21pc2VIYW5kbGVyKGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRDdXJyZW50VXNlclByb2ZpbGUpKVxyXG4gIH1cclxuXHJcbiAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsICcnLCAnLycpXHJcbiAgcmV0dXJuIGhhc1Rva2VuXHJcbn1cclxuXHJcbi8qKiBHZW5lcmF0ZSBhIGxvZ2luL2NoYW5nZSBhY2NvdW50IGxpbmsuIERlZmF1bHRzIHRvIGFwcGVuZGluZyBpdCBvbnRvIHRoZSBuYXYgYmFyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFN0cmluZz59IGNsYXNzZXNUb0FkZCAtIHRoZSBjbGFzc2VzIHRvIGFkZCBvbnRvIHRoZSBsaW5rLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNoYW5nZUFjY291bnQgLSBXaGV0aGVyIHRoZSBsaW5rIHNob3VsZCBiZSBmb3IgY2hhbmdpbmcgYWNjb3VudCwgb3IgZm9yIGxvZ2dpbmcgaW4uIChkZWZhdWx0cyB0byB0cnVlKVxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJlbnRFbCAtIHRoZSBwYXJlbnQgZWxlbWVudCB0byBhcHBlbmQgdGhlIGxpbmsgb250by4gKGRlZmF1bHRzIHRvIG5hdmJhcilcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUxvZ2luICh7XHJcbiAgY2xhc3Nlc1RvQWRkID0gWydyaWdodCddLFxyXG4gIGNoYW5nZUFjY291bnQgPSB0cnVlLFxyXG4gIHBhcmVudEVsID0gZG9jdW1lbnRcclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd0b3BuYXYnKVswXVxyXG4gICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3JpZ2h0JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkcm9wZG93bi1jb250ZW50JylbMF1cclxufSA9IHt9KSB7XHJcbiAgLy8gQ3JlYXRlIGFuY2hvciBlbGVtZW50LlxyXG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcclxuICBhLmhyZWYgPSBjb25maWcuVVJMcy5hdXRoXHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgdGV4dCBub2RlIGZvciBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICBjaGFuZ2VBY2NvdW50ID8gJ0NoYW5nZSBBY2NvdW50JyA6ICdMb2dpbiBUbyBTcG90aWZ5J1xyXG4gIClcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSB0ZXh0IG5vZGUgdG8gYW5jaG9yIGVsZW1lbnQuXHJcbiAgYS5hcHBlbmRDaGlsZChsaW5rKVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlc1RvQWRkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBjbGFzc1RvQWRkID0gY2xhc3Nlc1RvQWRkW2ldXHJcbiAgICBhLmNsYXNzTGlzdC5hZGQoY2xhc3NUb0FkZClcclxuICB9XHJcblxyXG4gIC8vIGNsZWFyIGN1cnJlbnQgdG9rZW5zIHdoZW4gY2xpY2tlZFxyXG4gIGEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0Q2xlYXJUb2tlbnMpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSlcclxuICB9KVxyXG5cclxuICAvLyBBcHBlbmQgdGhlIGFuY2hvciBlbGVtZW50IHRvIHRoZSBwYXJlbnQuXHJcbiAgcGFyZW50RWwuYXBwZW5kQ2hpbGQoYSlcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gb25TdWNjZXNzZnVsVG9rZW5DYWxsIChcclxuICBoYXNUb2tlbjogYm9vbGVhbixcclxuICBoYXNUb2tlbkNhbGxiYWNrID0gKCkgPT4geyB9LFxyXG4gIG5vVG9rZW5DYWxsQmFjayA9ICgpID0+IHsgfSxcclxuICByZWRpcmVjdEhvbWUgPSB0cnVlXHJcbikge1xyXG4gIGNvbnN0IGdldFRva2Vuc1NwaW5uZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgIGNvbmZpZy5DU1MuSURzLmdldFRva2VuTG9hZGluZ1NwaW5uZXJcclxuICApXHJcblxyXG4gIC8vIHJlbW92ZSB0b2tlbiBzcGlubmVyIGJlY2F1c2UgYnkgdGhpcyBsaW5lIHdlIGhhdmUgb2J0YWluZWQgdGhlIHRva2VuXHJcbiAgZ2V0VG9rZW5zU3Bpbm5lcj8ucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZ2V0VG9rZW5zU3Bpbm5lcilcclxuXHJcbiAgY29uc3QgaW5mb0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmluZm9Db250YWluZXIpXHJcblxyXG4gIC8vIGdlbmVyYXRlIHRoZSBuYXYgbG9naW5cclxuICBnZW5lcmF0ZUxvZ2luKHsgY2hhbmdlQWNjb3VudDogaGFzVG9rZW4sIHBhcmVudEVsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy50b3BOYXZNb2JpbGUpID8/IHRocm93RXhwcmVzc2lvbignTm8gdG9wIG5hdiBtb2JpbGUgZWxlbWVudCBmb3VuZCcpIH0pXHJcbiAgZ2VuZXJhdGVMb2dpbih7IGNoYW5nZUFjY291bnQ6IGhhc1Rva2VuIH0pXHJcbiAgaWYgKGhhc1Rva2VuKSB7XHJcbiAgICBpZiAoaW5mb0NvbnRhaW5lciA9PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5mbyBjb250YWluZXIgRWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICB9XHJcbiAgICBpbmZvQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICBkaXNwbGF5VXNlcm5hbWUoKVxyXG4gICAgY29uc29sZS5sb2coJ2Rpc3BsYXkgdXNlcm5hbWUnKVxyXG4gICAgaGFzVG9rZW5DYWxsYmFjaygpXHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIHRva2VuIHJlZGlyZWN0IHRvIGFsbG93IGFjY2VzcyBwYWdlXHJcbiAgICBpZiAocmVkaXJlY3RIb21lKSB7IHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gY29uZmlnLlVSTHMuc2l0ZVVybCB9XHJcbiAgICBub1Rva2VuQ2FsbEJhY2soKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgUGxheWxpc3QgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9wbGF5bGlzdCdcclxuaW1wb3J0IEFzeW5jU2VsZWN0aW9uVmVyaWYgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hc3luY1NlbGVjdGlvblZlcmlmJ1xyXG5pbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBodG1sVG9FbCxcclxuICBwcm9taXNlSGFuZGxlcixcclxuICBzZWFyY2hVbCxcclxuICBhbmltYXRpb25Db250cm9sLFxyXG4gIHRocm93RXhwcmVzc2lvblxyXG59IGZyb20gJy4uLy4uL2NvbmZpZydcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSGFzVG9rZW5zLFxyXG4gIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbFxyXG59IGZyb20gJy4uLy4uL21hbmFnZS10b2tlbnMnXHJcbmltcG9ydCBDYXJkQWN0aW9uc0hhbmRsZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9jYXJkLWFjdGlvbnMnXHJcbmltcG9ydCBEb3VibHlMaW5rZWRMaXN0LCB7IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCBpbnRlcmFjdCBmcm9tICdpbnRlcmFjdGpzJ1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBQbGF5bGlzdERhdGEsIFNwb3RpZnlJbWcgfSBmcm9tICcuLi8uLi8uLi90eXBlcydcclxuaW1wb3J0IFRyYWNrIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvdHJhY2snXHJcblxyXG5jb25zdCBleHBhbmRlZFBsYXlsaXN0TW9kcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gIGNvbmZpZy5DU1MuSURzLmV4cGFuZGVkUGxheWxpc3RNb2RzXHJcbilcclxuY29uc3QgcGxheWxpc3RIZWFkZXJBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgY29uZmlnLkNTUy5JRHMucGxheWxpc3RIZWFkZXJBcmVhXHJcbilcclxuLy8gYWRkIG9uIGNoYW5nZSBldmVudCBsaXN0ZW5lciB0byB0aGUgb3JkZXIgc2VsZWN0aW9uIGVsZW1lbnQgb2YgdGhlIG1vZHMgZXhwYW5kZWQgcGxheWxpc3RcclxuY29uc3QgcGxheWxpc3RPcmRlciA9IGV4cGFuZGVkUGxheWxpc3RNb2RzPy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFxyXG4gIGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdE9yZGVyXHJcbilbMF0gYXMgSFRNTElucHV0RWxlbWVudFxyXG5cclxuY29uc3QgdHJhY2tVbCA9IGV4cGFuZGVkUGxheWxpc3RNb2RzPy5nZXRFbGVtZW50c0J5VGFnTmFtZSgndWwnKVswXVxyXG5jb25zdCBwbGF5bGlzdFNlYXJjaElucHV0ID0gZXhwYW5kZWRQbGF5bGlzdE1vZHM/LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXHJcbiAgY29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0U2VhcmNoXHJcbilbMF0gYXMgSFRNTElucHV0RWxlbWVudFxyXG5jb25zdCBwbGF5bGlzdHNDYXJkQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgY29uZmlnLkNTUy5JRHMucGxheWxpc3RDYXJkc0NvbnRhaW5lclxyXG4pXHJcbmNvbnN0IGNhcmRSZXNpemVDb250YWluZXIgPSBkb2N1bWVudFxyXG4gIC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5bGlzdHNTZWN0aW9uKVxyXG4gID8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMucmVzaXplQ29udGFpbmVyKVswXSBhcyBIVE1MRWxlbWVudFxyXG5cclxuLy8gbWluIHZpZXdwb3J0IGJlZm9yZSBwbGF5bGlzdCBjYXJkcyBjb252ZXJ0IHRvIHRleHQgZm9ybSBhdXRvbWF0aWNhbGx5IChlcXVpdmFsZW50IHRvIHRoZSBtZWRpYSBxdWVyeSBpbiBwbGF5bGlzdHMubGVzcyB0aGF0IGNoYW5nZXMgLmNhcmQpXHJcbmNvbnN0IFZJRVdQT1JUX01JTiA9IDYwMFxyXG5cclxuLy8gd2lsbCByZXNpemUgdGhlIHBsYXlsaXN0IGNhcmQgY29udGFpbmVyIHRvIHRoZSBzaXplIHdhbnRlZCB3aGVuIHNjcmVlbiBpcyA8PSBWSUVXUE9SVF9NSU5cclxuY29uc3QgcmVzdHJpY3RSZXNpemVXaWR0aCA9ICgpID0+XHJcbiAgKGNhcmRSZXNpemVDb250YWluZXIuc3R5bGUud2lkdGggPSBWSUVXUE9SVF9NSU4gLyAyLjUgKyAncHgnKVxyXG5cclxuY29uc3QgcmVzaXplQWN0aW9ucyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgLy8gaWQgb2YgcmVzaXplIGNvbnRhaW5lciB1c2VkIHRvIHNldCBpbnRlcmFjdGlvbiB0aHJvdWdoIGludGVyYWN0anNcclxuICBjb25zdCByZXNpemVJZCA9XHJcbiAgICAnIycgK1xyXG4gICAgY29uZmlnLkNTUy5JRHMucGxheWxpc3RzU2VjdGlvbiArXHJcbiAgICAnPi4nICtcclxuICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5yZXNpemVDb250YWluZXJcclxuXHJcbiAgZnVuY3Rpb24gZW5hYmxlUmVzaXplICgpIHtcclxuICAgIGludGVyYWN0KHJlc2l6ZUlkKVxyXG4gICAgICAucmVzaXphYmxlKHtcclxuICAgICAgICAvLyBvbmx5IHJlc2l6ZSBmcm9tIHRoZSByaWdodFxyXG4gICAgICAgIGVkZ2VzOiB7IHRvcDogZmFsc2UsIGxlZnQ6IGZhbHNlLCBib3R0b206IGZhbHNlLCByaWdodDogdHJ1ZSB9LFxyXG4gICAgICAgIGxpc3RlbmVyczoge1xyXG4gICAgICAgICAgbW92ZTogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZXZlbnQudGFyZ2V0LnN0eWxlLCB7XHJcbiAgICAgICAgICAgICAgd2lkdGg6IGAke2V2ZW50LnJlY3Qud2lkdGh9cHhgXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAub24oJ3Jlc2l6ZWVuZCcsIHNhdmVzLnNhdmVSZXNpemVXaWR0aClcclxuXHJcbiAgICAvLyBvbmNlIHdlIHJlbmFibGUgdGhlIHJlc2l6ZSB3ZSBtdXN0IHNldCBpdHMgd2lkdGggdG8gYmUgd2hhdCB0aGUgdXNlciBsYXN0IHNldCBpdCB0b28uXHJcbiAgICBpbml0aWFsTG9hZHMubG9hZFJlc2l6ZVdpZHRoKClcclxuICB9XHJcbiAgZnVuY3Rpb24gZGlzYWJsZVJlc2l6ZSAoKSB7XHJcbiAgICBpbnRlcmFjdChyZXNpemVJZCkudW5zZXQoKVxyXG4gICAgLy8gb25jZSB3ZSBkaXNhYmxlIHRoZSByZXNpemUgd2UgbXVzdCByZXN0cmljdCB0aGUgd2lkdGggdG8gZml0IHdpdGhpbiBWSUVXUE9SVF9NSU4gcGl4ZWxzLlxyXG4gICAgcmVzdHJpY3RSZXNpemVXaWR0aCgpXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZW5hYmxlUmVzaXplLFxyXG4gICAgZGlzYWJsZVJlc2l6ZVxyXG4gIH1cclxufSkoKVxyXG4vLyBvcmRlciBvZiBpdGVtcyBzaG91bGQgbmV2ZXIgY2hhbmdlIGFzIGFsbCBvdGhlciBvcmRlcmluZ3MgYXJlIGJhc2VkIG9mZiB0aGlzIG9uZSwgYW5kIHRoZSBvbmx5IHdheSB0byByZXR1cm4gYmFjayB0byB0aGlzIGN1c3RvbSBvcmRlciBpcyB0byByZXRhaW4gaXQuXHJcbi8vIG9ubHkgYWNjZXNzIHRoaXMgd2hlbiB0cmFja3MgaGF2ZSBsb2FkZWQuXHJcbmNvbnN0IHNlbFBsYXlsaXN0VHJhY2tzID0gKCkgPT4ge1xyXG4gIGlmIChwbGF5bGlzdEFjdGlvbnMucGxheWxpc3RTZWxWZXJpZi5jdXJyU2VsZWN0ZWRWYWxOb051bGwgPT09IG51bGwgfHwgcGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsLnRyYWNrTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byBhY2Nlc3Mgc2VsZWN0aW9uIHZlcmlmIGRvdWJseSBsaW5rZWQgdHJhY2tzIGxpc3QgYmVmb3JlIGl0IHdhcyBsb2FkZWQnKVxyXG4gIH1cclxuICByZXR1cm4gcGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsLnRyYWNrTGlzdFxyXG59XHJcblxyXG5jb25zdCBwbGF5bGlzdEFjdGlvbnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGNvbnN0IHBsYXlsaXN0U2VsVmVyaWYgPSBuZXcgQXN5bmNTZWxlY3Rpb25WZXJpZjxQbGF5bGlzdD4oKVxyXG4gIGNvbnN0IGNhcmRBY3Rpb25zSGFuZGxlciA9IG5ldyBDYXJkQWN0aW9uc0hhbmRsZXIoMSlcclxuICBjb25zdCBwbGF5bGlzdFRpdGxlaDIgPSBleHBhbmRlZFBsYXlsaXN0TW9kcz8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2gyJylbMF1cclxuXHJcbiAgLyoqIEFzeW5jaHJvbm91c2x5IGxvYWQgYSBwbGF5bGlzdHMgdHJhY2tzIGFuZCByZXBsYWNlIHRoZSB0cmFjayB1bCBodG1sIG9uY2UgaXQgbG9hZHNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGxheWxpc3R9IHBsYXlsaXN0T2JqIC0gYSBQbGF5bGlzdCBpbnN0YW5jZSB3aG9zZSB0cmFja3Mgd2lsbCBiZSBsb2FkZWRcclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIGxvYWRpbmcgd2FzIHN1Y2Nlc2Z1bFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGxvYWRQbGF5bGlzdFRyYWNrcyAocGxheWxpc3RPYmo6IFBsYXlsaXN0LCBjYWxsYmFjazogRnVuY3Rpb24pIHtcclxuICAgIHBsYXlsaXN0T2JqXHJcbiAgICAgIC5sb2FkVHJhY2tzKClcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIC8vIGJlY2F1c2UgLnRoZW4oKSBjYW4gcnVuIHdoZW4gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBwbGF5bGlzdCBoYXMgYWxyZWFkeSBjaGFuZ2VkIHdlIG5lZWQgdG8gdmVyaWZ5XHJcbiAgICAgICAgaWYgKCFwbGF5bGlzdFNlbFZlcmlmLmlzVmFsaWQocGxheWxpc3RPYmopKSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY2FsbGJhY2soKVxyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGVuIGdldHRpbmcgdHJhY2tzJylcclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgICAgfSlcclxuICB9XHJcbiAgZnVuY3Rpb24gd2hlblRyYWNrc0xvYWRpbmcgKCkge1xyXG4gICAgLy8gaGlkZSBoZWFkZXIgd2hpbGUgbG9hZGluZyB0cmFja3NcclxuICAgIHBsYXlsaXN0SGVhZGVyQXJlYT8uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuaGlkZSlcclxuICAgIHBsYXlsaXN0U2VhcmNoSW5wdXQudmFsdWUgPSAnJztcclxuICAgICh0cmFja1VsIGFzIEVsZW1lbnQpLnNjcm9sbFRvcCA9IDBcclxuICB9XHJcbiAgZnVuY3Rpb24gb25UcmFja3NMb2FkaW5nRG9uZSAoKSB7XHJcbiAgICAvLyBzaG93IHRoZW0gb25jZSB0cmFja3MgaGF2ZSBsb2FkZWRcclxuICAgIHBsYXlsaXN0SGVhZGVyQXJlYT8uY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuaGlkZSlcclxuICB9XHJcbiAgLyoqIEVtcHR5IHRoZSB0cmFjayBsaSBhbmQgcmVwbGFjZSBpdCB3aXRoIG5ld2x5IGxvYWRlZCB0cmFjayBsaS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGxheWxpc3R9IHBsYXlsaXN0T2JqIC0gYSBQbGF5bGlzdCBpbnN0YW5jZSB3aG9zZSB0cmFja3Mgd2lsbCBiZSBsb2FkZWRcclxuICAgKi9cclxuICBmdW5jdGlvbiBzaG93UGxheWxpc3RUcmFja3MgKHBsYXlsaXN0T2JqOiBQbGF5bGlzdCkge1xyXG4gICAgaWYgKHBsYXlsaXN0VGl0bGVoMiAhPT0gdW5kZWZpbmVkICYmIHBsYXlsaXN0VGl0bGVoMi50ZXh0Q29udGVudCAhPT0gbnVsbCkge1xyXG4gICAgICBwbGF5bGlzdFRpdGxlaDIudGV4dENvbnRlbnQgPSBwbGF5bGlzdE9iai5uYW1lXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZW1wdHkgdGhlIHRyYWNrIGxpXHJcbiAgICByZW1vdmVBbGxDaGlsZE5vZGVzKHRyYWNrVWwpXHJcblxyXG4gICAgLy8gaW5pdGlhbGx5IHNob3cgdGhlIHBsYXlsaXN0IHdpdGggdGhlIGxvYWRpbmcgc3Bpbm5lclxyXG4gICAgY29uc3QgaHRtbFN0cmluZyA9IGBcclxuICAgICAgICAgICAgPGxpPlxyXG4gICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMuc3Bpbm5lcn1cIiAvPlxyXG4gICAgICAgICAgICA8L2xpPmBcclxuICAgIGNvbnN0IHNwaW5uZXJFbCA9IGh0bWxUb0VsKGh0bWxTdHJpbmcpO1xyXG4gICAgKHRyYWNrVWwgYXMgRWxlbWVudCkuYXBwZW5kQ2hpbGQoc3Bpbm5lckVsIGFzIE5vZGUpXHJcblxyXG4gICAgcGxheWxpc3RTZWxWZXJpZi5zZWxlY3Rpb25DaGFuZ2VkKHBsYXlsaXN0T2JqKVxyXG5cclxuICAgIHNhdmVzLnNhdmVQbGF5bGlzdElkKHBsYXlsaXN0T2JqLmlkKVxyXG5cclxuICAgIC8vIHRyYWNrcyBhcmUgYWxyZWFkeSBsb2FkZWQgc28gc2hvdyB0aGVtXHJcbiAgICBpZiAocGxheWxpc3RPYmouaGFzTG9hZGVkVHJhY2tzKCkpIHtcclxuICAgICAgd2hlblRyYWNrc0xvYWRpbmcoKVxyXG4gICAgICBvblRyYWNrc0xvYWRpbmdEb25lKClcclxuXHJcbiAgICAgIG1hbmFnZVRyYWNrcy5zb3J0RXhwYW5kZWRUcmFja3NUb09yZGVyKFxyXG4gICAgICAgIHBsYXlsaXN0T2JqLm9yZGVyID09PSBwbGF5bGlzdE9yZGVyLnZhbHVlXHJcbiAgICAgIClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHRyYWNrcyBhcmVuJ3QgbG9hZGVkIHNvIGxhenkgbG9hZCB0aGVtIHRoZW4gc2hvdyB0aGVtXHJcbiAgICAgIHdoZW5UcmFja3NMb2FkaW5nKClcclxuICAgICAgbG9hZFBsYXlsaXN0VHJhY2tzKHBsYXlsaXN0T2JqLCAoKSA9PiB7XHJcbiAgICAgICAgLy8gaW5kZXhlZCB3aGVuIGxvYWRlZCBzbyBubyBuZWVkIHRvIHJlLWluZGV4IHRoZW1cclxuICAgICAgICBtYW5hZ2VUcmFja3Muc29ydEV4cGFuZGVkVHJhY2tzVG9PcmRlcih0cnVlKVxyXG4gICAgICAgIG9uVHJhY2tzTG9hZGluZ0RvbmUoKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFdoZW4gYSBjYXJkIGlzIGNsaWNrZWQgcnVuIHRoZSBzdGFuZGFyZCBDYXJkQWN0aW9uc0hhbmRsZXIgb25DbGljayB0aGVuIHNob3cgaXRzIHRyYWNrcyBvbiBjYWxsYmFjay5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXk8UGxheWxpc3Q+fSBwbGF5bGlzdE9ianNcclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwbGF5bGlzdENhcmRcclxuICAgKi9cclxuICBmdW5jdGlvbiBjbGlja0NhcmQgKHBsYXlsaXN0T2JqczogQXJyYXk8UGxheWxpc3Q+LCBwbGF5bGlzdENhcmQ6IEVsZW1lbnQpIHtcclxuICAgIGNhcmRBY3Rpb25zSGFuZGxlci5vbkNhcmRDbGljayhwbGF5bGlzdENhcmQsIHBsYXlsaXN0T2JqcywgKHNlbE9iajogUGxheWxpc3QpID0+IHtcclxuICAgICAgc2hvd1BsYXlsaXN0VHJhY2tzKHNlbE9iailcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKiogQWRkIGV2ZW50IGxpc3RlbmVycyB0byBlYWNoIHBsYXlsaXN0IGNhcmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5PFBsYXlsaXN0Pn0gcGxheWxpc3RPYmpzIC0gcGxheWxpc3RzIHRoYXQgd2lsbCBiZSB1c2VkIGZvciB0aGUgZXZlbnRzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZE9uUGxheWxpc3RDYXJkTGlzdGVuZXJzIChwbGF5bGlzdE9ianM6IEFycmF5PFBsYXlsaXN0Pikge1xyXG4gICAgY29uc3QgcGxheWxpc3RDYXJkcyA9IEFycmF5LmZyb20oXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0KVxyXG4gICAgKVxyXG5cclxuICAgIHBsYXlsaXN0Q2FyZHMuZm9yRWFjaCgocGxheWxpc3RDYXJkKSA9PiB7XHJcbiAgICAgIHBsYXlsaXN0Q2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBjbGlja0NhcmQocGxheWxpc3RPYmpzLCBwbGF5bGlzdENhcmQpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBwbGF5bGlzdENhcmQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcclxuICAgICAgICBjYXJkQWN0aW9uc0hhbmRsZXIuc2Nyb2xsVGV4dE9uQ2FyZEVudGVyKHBsYXlsaXN0Q2FyZClcclxuICAgICAgfSlcclxuICAgICAgcGxheWxpc3RDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgY2FyZEFjdGlvbnNIYW5kbGVyLnNjcm9sbFRleHRPbkNhcmRMZWF2ZShwbGF5bGlzdENhcmQpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGNsaWNrQ2FyZCxcclxuICAgIGFkZE9uUGxheWxpc3RDYXJkTGlzdGVuZXJzLFxyXG4gICAgc2hvd1BsYXlsaXN0VHJhY2tzLFxyXG4gICAgcGxheWxpc3RTZWxWZXJpZlxyXG4gIH1cclxufSkoKVxyXG5cclxuLyoqXHJcbiAqIENvbnRhaW5zIHRoZSBhcnJheSBvZiBQbGF5bGlzdCBvYmplY3RzLlxyXG4gKi9cclxuY29uc3QgaW5mb1JldHJpZXZhbCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgY29uc3QgcGxheWxpc3RPYmpzOiBBcnJheTxQbGF5bGlzdD4gPSBbXVxyXG5cclxuICAvKiogT2J0YWlucyBwbGF5bGlzdCBpbmZvIGZyb20gd2ViIGFwaSBhbmQgZGlzcGxheXMgdGhlaXIgY2FyZHMuXHJcbiAgICpcclxuICAgKi9cclxuICBhc3luYyBmdW5jdGlvbiBnZXRJbml0aWFsSW5mbyAoKSB7XHJcbiAgICBmdW5jdGlvbiBvblN1Y2Nlc2Z1bCAocmVzOiBBeGlvc1Jlc3BvbnNlPEFycmF5PFBsYXlsaXN0RGF0YT4+KSB7XHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgaW5mbyBsb2FkaW5nIHNwaW5uZXJzIGFzIGluZm8gaGFzIGJlZW4gbG9hZGVkXHJcbiAgICAgIGNvbnN0IGluZm9TcGlubmVycyA9IEFycmF5LmZyb20oXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMuaW5mb0xvYWRpbmdTcGlubmVycylcclxuICAgICAgKVxyXG4gICAgICBpbmZvU3Bpbm5lcnMuZm9yRWFjaCgoc3Bpbm5lcikgPT4ge1xyXG4gICAgICAgIHNwaW5uZXI/LnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKHNwaW5uZXIpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBjb25zdCBwbGF5bGlzdERhdGFzID0gcmVzLmRhdGFcclxuXHJcbiAgICAgIC8vIGdlbmVyYXRlIFBsYXlsaXN0IGluc3RhbmNlcyBmcm9tIHRoZSBkYXRhXHJcbiAgICAgIHBsYXlsaXN0RGF0YXMuZm9yRWFjaCgoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIGRlbGV0ZWQgcGxheWxpc3RzIHdpbGwgaGF2ZSBubyBuYW1lLCBidXQgd2lsbCBzdGlsbCBzaG93IHRoZSBzb25ncyAoc3BvdGlmeSBhcGkgdGhpbmcpLCBzbyBqdXN0IGRvbid0IHNob3cgdGhlbVxyXG4gICAgICAgIGlmIChkYXRhLm5hbWUgPT09ICcnKSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgcGxheWxpc3RPYmpzLnB1c2gobmV3IFBsYXlsaXN0KGRhdGEubmFtZSwgZGF0YS5pbWFnZXMsIGRhdGEuaWQpKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgZGlzcGxheUNhcmRJbmZvLmRpc3BsYXlQbGF5bGlzdENhcmRzKHBsYXlsaXN0T2JqcylcclxuICAgIH1cclxuXHJcbiAgICAvLyBnZXQgcGxheWxpc3RzIGRhdGEgYW5kIGV4ZWN1dGUgY2FsbCBiYWNrIG9uIHN1Y2Nlc2Z1bFxyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxBcnJheTxQbGF5bGlzdERhdGE+Pj4oXHJcbiAgICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRQbGF5bGlzdHMpLFxyXG4gICAgICBvblN1Y2Nlc2Z1bFxyXG4gICAgKVxyXG5cclxuICAgIGF3YWl0IGxvYWRQbGF5bGlzdCgpXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBnZXRJbml0aWFsSW5mbyxcclxuICAgIHBsYXlsaXN0T2Jqc1xyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgZGlzcGxheUNhcmRJbmZvID0gKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBkZXRlcm1pbmVSZXNpemVBY3RpdmVuZXNzICgpIHtcclxuICAgIC8vIGFsbG93IHJlc2l6aW5nIG9ubHkgd2hlbiB2aWV3cG9ydCBpcyBsYXJnZSBlbm91Z2ggdG8gYWxsb3cgY2FyZHMuXHJcbiAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoYChtYXgtd2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWApLm1hdGNoZXMpIHtcclxuICAgICAgcmVzaXplQWN0aW9ucy5kaXNhYmxlUmVzaXplKClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlc2l6ZUFjdGlvbnMuZW5hYmxlUmVzaXplKClcclxuICAgIH1cclxuICB9XHJcbiAgLyoqIERpc3BsYXlzIHRoZSBwbGF5bGlzdCBjYXJkcyBmcm9tIGEgZ2l2ZW4gYXJyYXkgb2YgcGxheWxpc3RzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheTxQbGF5bGlzdD59IHBsYXlsaXN0T2Jqc1xyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGRpc3BsYXlQbGF5bGlzdENhcmRzIChwbGF5bGlzdE9ianM6IEFycmF5PFBsYXlsaXN0Pikge1xyXG4gICAgcmVtb3ZlQWxsQ2hpbGROb2RlcyhwbGF5bGlzdHNDYXJkQ29udGFpbmVyKVxyXG4gICAgY29uc3QgaXNJblRleHRGb3JtID1cclxuICAgICAgcGxheWxpc3RzQ2FyZENvbnRhaW5lcj8uY2xhc3NMaXN0LmNvbnRhaW5zKGNvbmZpZy5DU1MuQ0xBU1NFUy50ZXh0Rm9ybSkgfHxcclxuICAgICAgd2luZG93Lm1hdGNoTWVkaWEoYChtYXgtd2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWApLm1hdGNoZXNcclxuXHJcbiAgICBkZXRlcm1pbmVSZXNpemVBY3RpdmVuZXNzKClcclxuICAgIGNvbnN0IHNlbGVjdGVkQ2FyZCA9IHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbFxyXG5cclxuICAgIC8vIGFkZCBjYXJkIGh0bWxzIHRvIGNvbnRhaW5lciBlbGVtZW50XHJcbiAgICBwbGF5bGlzdE9ianMuZm9yRWFjaCgocGxheWxpc3RPYmosIGlkeCkgPT4ge1xyXG4gICAgICBwbGF5bGlzdHNDYXJkQ29udGFpbmVyPy5hcHBlbmRDaGlsZChcclxuICAgICAgICBwbGF5bGlzdE9iai5nZXRQbGF5bGlzdENhcmRIdG1sKGlkeCwgaXNJblRleHRGb3JtKVxyXG4gICAgICApXHJcblxyXG4gICAgICAvLyBpZiBiZWZvcmUgdGhlIGZvcm0gY2hhbmdlIHRoaXMgcGxheWxpc3Qgd2FzIHNlbGVjdGVkLCBzaW11bGF0ZSBhIGNsaWNrIG9uIGl0IGluIG9yZGVyIHRvIHNlbGVjdCBpdCBpbiB0aGUgbmV3IGZvcm1cclxuICAgICAgaWYgKHBsYXlsaXN0T2JqID09PSBzZWxlY3RlZENhcmQpIHtcclxuICAgICAgICBwbGF5bGlzdEFjdGlvbnMuY2xpY2tDYXJkKFxyXG4gICAgICAgICAgcGxheWxpc3RPYmpzLFxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0ZWRDYXJkLmNhcmRJZCkgYXMgRWxlbWVudFxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBhIHNlbGVjdGVkIGNhcmQgc2Nyb2xsIGRvd24gdG8gaXQuXHJcbiAgICBpZiAoc2VsZWN0ZWRDYXJkKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdGVkQ2FyZC5jYXJkSWQpPy5zY3JvbGxJbnRvVmlldygpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIGV2ZW50IGxpc3RlbmVyIHRvIGNhcmRzXHJcbiAgICBwbGF5bGlzdEFjdGlvbnMuYWRkT25QbGF5bGlzdENhcmRMaXN0ZW5lcnMocGxheWxpc3RPYmpzKVxyXG4gICAgLy8gYW5pbWF0ZSB0aGUgY2FyZHMoc2hvdyB0aGUgY2FyZHMpXHJcbiAgICBhbmltYXRpb25Db250cm9sLmFkZENsYXNzT25JbnRlcnZhbCgnLnBsYXlsaXN0JywgY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciwgMClcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkaXNwbGF5UGxheWxpc3RDYXJkc1xyXG4gIH1cclxufSkoKVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlQWxsQ2hpbGROb2RlcyAocGFyZW50OiBOb2RlIHwgbnVsbCB8IHVuZGVmaW5lZCkge1xyXG4gIGlmICghcGFyZW50KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3BhcmVudCBpcyB1bmRlZmluZWQgYW5kIGhhcyBubyBjaGlsZCBub2RlcyB0byByZW1vdmUnKVxyXG4gIH1cclxuICB3aGlsZSAocGFyZW50LmZpcnN0Q2hpbGQpIHtcclxuICAgIHBhcmVudC5yZW1vdmVDaGlsZChwYXJlbnQuZmlyc3RDaGlsZClcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IG1hbmFnZVRyYWNrcyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgLyoqIFNvcnRzIHRoZSB0cmFja3Mgb3JkZXIgZGVwZW5kaW5nIG9uIHdoYXQgdGhlIHVzZXIgc2V0cyBpdCB0b28gYW5kIHJlLWluZGV4ZXMgdGhlIHRyYWNrcyBvcmRlciBpZiBvcmRlciBoYXMgY2hhbmdlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBpc1NhbWVPcmRlciAtIHdoZXRoZXIgdGhlIG9yZGVyIGlzIHRoZSBzYW1lIG9yIG5vdCBhcyBiZWZvcmUuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc29ydEV4cGFuZGVkVHJhY2tzVG9PcmRlciAoaXNTYW1lT3JkZXI6IGJvb2xlYW4pIHtcclxuICAgIGxldCBuZXdPcmRlclRyYWNrczogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4oKVxyXG4gICAgbGV0IG5ld09yZGVyVHJhY2tzQXJyOiBBcnJheTxUcmFjaz4gPSBbXVxyXG4gICAgaWYgKHBsYXlsaXN0T3JkZXIudmFsdWUgPT09ICdjdXN0b20tb3JkZXInKSB7XHJcbiAgICAgIG5ld09yZGVyVHJhY2tzID0gc2VsUGxheWxpc3RUcmFja3MoKVxyXG4gICAgfSBlbHNlIGlmIChwbGF5bGlzdE9yZGVyLnZhbHVlID09PSAnbmFtZScpIHtcclxuICAgICAgbmV3T3JkZXJUcmFja3NBcnIgPSBvcmRlclRyYWNrc0J5TmFtZShzZWxQbGF5bGlzdFRyYWNrcygpKVxyXG4gICAgICBuZXdPcmRlclRyYWNrcyA9IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0KG5ld09yZGVyVHJhY2tzQXJyKVxyXG4gICAgfSBlbHNlIGlmIChwbGF5bGlzdE9yZGVyLnZhbHVlID09PSAnZGF0ZS1hZGRlZCcpIHtcclxuICAgICAgbmV3T3JkZXJUcmFja3NBcnIgPSBvcmRlclRyYWNrc0J5RGF0ZUFkZGVkKHNlbFBsYXlsaXN0VHJhY2tzKCkpXHJcbiAgICAgIG5ld09yZGVyVHJhY2tzID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QobmV3T3JkZXJUcmFja3NBcnIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc1NhbWVPcmRlcikge1xyXG4gICAgICAvLyBzZXQgdGhlIG9yZGVyIG9mIHRoZSBwbGF5bGlzdCBhcyB0aGUgbmV3IG9yZGVyXHJcbiAgICAgIHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbC5vcmRlciA9XHJcbiAgICAgICAgcGxheWxpc3RPcmRlci52YWx1ZVxyXG4gICAgfVxyXG4gICAgcmVyZW5kZXJQbGF5bGlzdFRyYWNrcyhuZXdPcmRlclRyYWNrcywgdHJhY2tVbCBhcyBIVE1MVUxpc3RFbGVtZW50KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb3JkZXJUcmFja3NCeU5hbWUgKHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4pOiBBcnJheTxUcmFjaz4ge1xyXG4gICAgLy8gc2hhbGxvdyBjb3B5IGp1c3Qgc28gd2UgZG9udCBtb2RpZnkgdGhlIG9yaWdpbmFsIG9yZGVyXHJcbiAgICBjb25zdCB0cmFja3NDb3B5ID0gWy4uLnRyYWNrTGlzdF1cclxuICAgIHRyYWNrc0NvcHkuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAvLyAtMSBwcmVjZWRlcywgMSBzdWNlZWRzLCAwIGlzIGVxdWFsXHJcbiAgICAgIHJldHVybiBhLnRpdGxlLnRvVXBwZXJDYXNlKCkgPT09IGIudGl0bGUudG9VcHBlckNhc2UoKVxyXG4gICAgICAgID8gMFxyXG4gICAgICAgIDogYS50aXRsZS50b1VwcGVyQ2FzZSgpIDwgYi50aXRsZS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICA/IC0xXHJcbiAgICAgICAgICA6IDFcclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJhY2tzQ29weVxyXG4gIH1cclxuICBmdW5jdGlvbiBvcmRlclRyYWNrc0J5RGF0ZUFkZGVkICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+KSB7XHJcbiAgICAvLyBzaGFsbG93IGNvcHkganVzdCBzbyB3ZSBkb250IG1vZGlmeSB0aGUgb3JpZ2luYWwgb3JkZXJcclxuICAgIGNvbnN0IHRyYWNrc0NvcHkgPSBbLi4udHJhY2tMaXN0XVxyXG4gICAgdHJhY2tzQ29weS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgIC8vIC0xICdhJyBwcmVjZWRlcyAnYicsIDEgJ2EnIHN1Y2VlZHMgJ2InLCAwIGlzICdhJyBlcXVhbCAnYidcclxuICAgICAgcmV0dXJuIGEuZGF0ZUFkZGVkVG9QbGF5bGlzdCA9PT0gYi5kYXRlQWRkZWRUb1BsYXlsaXN0XHJcbiAgICAgICAgPyAwXHJcbiAgICAgICAgOiBhLmRhdGVBZGRlZFRvUGxheWxpc3QgPCBiLmRhdGVBZGRlZFRvUGxheWxpc3RcclxuICAgICAgICAgID8gLTFcclxuICAgICAgICAgIDogMVxyXG4gICAgfSlcclxuICAgIHJldHVybiB0cmFja3NDb3B5XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXJlbmRlclBsYXlsaXN0VHJhY2tzICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+LCB0cmFja0FyclVsOiBIVE1MVUxpc3RFbGVtZW50KSB7XHJcbiAgICByZW1vdmVBbGxDaGlsZE5vZGVzKHRyYWNrQXJyVWwpXHJcbiAgICBmb3IgKGNvbnN0IHRyYWNrIG9mIHRyYWNrTGlzdC52YWx1ZXMoKSkge1xyXG4gICAgICB0cmFja0FyclVsLmFwcGVuZENoaWxkKHRyYWNrLmdldFBsYXlsaXN0VHJhY2tIdG1sKHRyYWNrTGlzdCwgdHJ1ZSkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc29ydEV4cGFuZGVkVHJhY2tzVG9PcmRlcixcclxuICAgIG9yZGVyVHJhY2tzQnlEYXRlQWRkZWRcclxuICB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGFkZEV2ZW50TGlzdGVuZXJzID0gKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBhZGRFeHBhbmRlZFBsYXlsaXN0TW9kc1NlYXJjaGJhckV2ZW50ICgpIHtcclxuICAgIC8vIGFkZCBrZXkgdXAgZXZlbnQgdG8gdGhlIG1vZHMgZXhwYW5kZWQgcGxheWxpc3QncyBzZWFyY2ggYmFyIGVsZW1lbnRcclxuICAgIGV4cGFuZGVkUGxheWxpc3RNb2RzXHJcbiAgICAgID8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RTZWFyY2gpWzBdXHJcbiAgICAgID8uYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoKSA9PiB7XHJcbiAgICAgICAgc2VhcmNoVWwodHJhY2tVbCBhcyBIVE1MVUxpc3RFbGVtZW50LCBwbGF5bGlzdFNlYXJjaElucHV0KVxyXG4gICAgICB9KVxyXG4gIH1cclxuICBmdW5jdGlvbiBhZGRFeHBhbmRlZFBsYXlsaXN0TW9kc09yZGVyRXZlbnQgKCkge1xyXG4gICAgLy8gYWRkIG9uIGNoYW5nZSBldmVudCBsaXN0ZW5lciB0byB0aGUgb3JkZXIgc2VsZWN0aW9uIGVsZW1lbnQgb2YgdGhlIG1vZHMgZXhwYW5kZWQgcGxheWxpc3RcclxuICAgIHBsYXlsaXN0T3JkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICBtYW5hZ2VUcmFja3Muc29ydEV4cGFuZGVkVHJhY2tzVG9PcmRlcihmYWxzZSlcclxuICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGFkZENvbnZlcnRDYXJkcyAoKSB7XHJcbiAgICBjb25zdCBjb252ZXJ0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuY29udmVydENhcmQpXHJcbiAgICBjb25zdCBjb252ZXJ0SW1nID0gY29udmVydEJ0bj8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdXHJcblxyXG4gICAgZnVuY3Rpb24gb25DbGljayAoKSB7XHJcbiAgICAgIGlmIChjb252ZXJ0SW1nID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbnZlcnQgY2FyZHMgdG8gdGV4dCBmb3JtIGJ1dHRvbnMgaW1hZ2UgaXMgbm90IGZvdW5kJylcclxuICAgICAgfVxyXG4gICAgICBwbGF5bGlzdHNDYXJkQ29udGFpbmVyPy5jbGFzc0xpc3QudG9nZ2xlKGNvbmZpZy5DU1MuQ0xBU1NFUy50ZXh0Rm9ybSlcclxuICAgICAgZGlzcGxheUNhcmRJbmZvLmRpc3BsYXlQbGF5bGlzdENhcmRzKGluZm9SZXRyaWV2YWwucGxheWxpc3RPYmpzKVxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgcGxheWxpc3RzQ2FyZENvbnRhaW5lcj8uY2xhc3NMaXN0LmNvbnRhaW5zKGNvbmZpZy5DU1MuQ0xBU1NFUy50ZXh0Rm9ybSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgc2F2ZXMuc2F2ZVBsYXlsaXN0Rm9ybSh0cnVlKVxyXG4gICAgICAgIGNvbnZlcnRJbWcuc3JjID0gY29uZmlnLlBBVEhTLmdyaWRWaWV3XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2F2ZXMuc2F2ZVBsYXlsaXN0Rm9ybShmYWxzZSlcclxuICAgICAgICBjb252ZXJ0SW1nLnNyYyA9IGNvbmZpZy5QQVRIUy5saXN0Vmlld1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29udmVydEJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvbkNsaWNrKCkpXHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEFkZCBldmVudCBsaXN0ZW5lciBvbnRvXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYWRkSGlkZVNob3dQbGF5bGlzdFR4dCAoKSB7XHJcbiAgICBjb25zdCB0b2dnbGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5oaWRlU2hvd1BsYXlsaXN0VHh0KVxyXG4gICAgZnVuY3Rpb24gb25DbGljayAoKSB7XHJcbiAgICAgIHRvZ2dsZUJ0bj8uY2xhc3NMaXN0LnRvZ2dsZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgIC8vIGlmIGl0cyBzZWxlY3RlZCB3ZSBoaWRlIHRoZSBjYXJkcyBvdGhlcndpc2Ugd2Ugc2hvdyB0aGVtLiBUaGlzIG9jY3VycyB3aGVuIHNjcmVlbiB3aWR0aCBpcyBhIGNlcnRhaW4gc2l6ZSBhbmQgYSBtZW51IHNsaWRpbmcgZnJvbSB0aGUgbGVmdCBhcHBlYXJzXHJcbiAgICAgIGlmICh0b2dnbGVCdG4/LmNsYXNzTGlzdC5jb250YWlucyhjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpKSB7XHJcbiAgICAgICAgY2FyZFJlc2l6ZUNvbnRhaW5lci5zdHlsZS53aWR0aCA9ICcwJ1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3RyaWN0UmVzaXplV2lkdGgoKVxyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZUhpZGVTaG93UGxheWxpc3RUeHRJY29uKClcclxuICAgIH1cclxuICAgIHRvZ2dsZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvbkNsaWNrKCkpXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBhZGRFeHBhbmRlZFBsYXlsaXN0TW9kc1NlYXJjaGJhckV2ZW50LFxyXG4gICAgYWRkRXhwYW5kZWRQbGF5bGlzdE1vZHNPcmRlckV2ZW50LFxyXG4gICAgYWRkQ29udmVydENhcmRzLFxyXG4gICAgYWRkSGlkZVNob3dQbGF5bGlzdFR4dFxyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3Qgc2F2ZXMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIHNhdmVSZXNpemVXaWR0aCAoKSB7XHJcbiAgICBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KFxyXG4gICAgICAgIGNvbmZpZy5VUkxzLnB1dFBsYXlsaXN0UmVzaXplRGF0YShjYXJkUmVzaXplQ29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoLnRvU3RyaW5nKCkpKVxyXG4gICAgKVxyXG4gIH1cclxuICBmdW5jdGlvbiBzYXZlUGxheWxpc3RGb3JtIChpc0luVGV4dEZvcm06IGJvb2xlYW4pIHtcclxuICAgIHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvcy5wdXQoXHJcbiAgICAgICAgY29uZmlnLlVSTHMucHV0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhKFN0cmluZyhpc0luVGV4dEZvcm0pKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHNhdmVQbGF5bGlzdElkIChpZDogc3RyaW5nKSB7XHJcbiAgICBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dEN1cnJQbGF5bGlzdElkKGlkKSlcclxuICAgIClcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBzYXZlUmVzaXplV2lkdGgsXHJcbiAgICBzYXZlUGxheWxpc3RGb3JtLFxyXG4gICAgc2F2ZVBsYXlsaXN0SWRcclxuICB9XHJcbn0pKClcclxuXHJcbi8qKlxyXG4gKiB1cGRhdGUgdGhlIGljb24gdG8gc2hvdyBhIGNoZXZyb24gbGVmdCBvciBjaGV2cm9uIHJpZ2h0IGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBwbGF5bGlzdCB0ZXh0IGlzIHNob3duIG9yIG5vdC5cclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZUhpZGVTaG93UGxheWxpc3RUeHRJY29uICgpIHtcclxuICBjb25zdCB0b2dnbGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5oaWRlU2hvd1BsYXlsaXN0VHh0KVxyXG4gIGNvbnN0IGJ0bkljb24gPSB0b2dnbGVCdG4/LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKVswXVxyXG5cclxuICBpZiAoYnRuSWNvbiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ltZyB0byBzaG93IGFuZCBoaWRlIHRoZSB0ZXh0IGZvcm0gY2FyZHMgaXMgbm90IGZvdW5kJylcclxuICB9XHJcbiAgLy8gaWYgaXRzIHNlbGVjdGVkIHdlIGhpZGUgdGhlIGNhcmRzIG90aGVyd2lzZSB3ZSBzaG93IHRoZW0uXHJcbiAgaWYgKHRvZ2dsZUJ0bj8uY2xhc3NMaXN0LmNvbnRhaW5zKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCkpIHtcclxuICAgIGJ0bkljb24uc3JjID0gY29uZmlnLlBBVEhTLmNoZXZyb25SaWdodFxyXG4gIH0gZWxzZSB7XHJcbiAgICBidG5JY29uLnNyYyA9IGNvbmZpZy5QQVRIUy5jaGV2cm9uTGVmdFxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2hlY2tJZkNhcmRGb3JtQ2hhbmdlT25SZXNpemUgKCkge1xyXG4gIGNvbnN0IHByZXYgPSB7XHJcbiAgICB2d0lzU21hbGw6IHdpbmRvdy5tYXRjaE1lZGlhKGAobWF4LXdpZHRoOiAke1ZJRVdQT1JUX01JTn1weClgKS5tYXRjaGVzXHJcbiAgfVxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zdCB3YXNCaWdOb3dTbWFsbCA9XHJcbiAgICAgIHdpbmRvdy5tYXRjaE1lZGlhKGAobWF4LXdpZHRoOiAke1ZJRVdQT1JUX01JTn1weClgKS5tYXRjaGVzICYmXHJcbiAgICAgICFwcmV2LnZ3SXNTbWFsbFxyXG5cclxuICAgIGNvbnN0IHdhc1NtYWxsTm93QmlnID1cclxuICAgICAgcHJldi52d0lzU21hbGwgJiZcclxuICAgICAgd2luZG93Lm1hdGNoTWVkaWEoYChtaW4td2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWApLm1hdGNoZXNcclxuXHJcbiAgICBpZiAod2FzQmlnTm93U21hbGwgfHwgd2FzU21hbGxOb3dCaWcpIHtcclxuICAgICAgaWYgKHdhc1NtYWxsTm93QmlnKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuaGlkZVNob3dQbGF5bGlzdFR4dClcclxuICAgICAgICB0b2dnbGVCdG4/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgICAgIHVwZGF0ZUhpZGVTaG93UGxheWxpc3RUeHRJY29uKClcclxuICAgICAgfVxyXG4gICAgICAvLyBjYXJkIGZvcm0gaGFzIGNoYW5nZWQgb24gd2luZG93IHJlc2l6ZVxyXG4gICAgICBkaXNwbGF5Q2FyZEluZm8uZGlzcGxheVBsYXlsaXN0Q2FyZHMoaW5mb1JldHJpZXZhbC5wbGF5bGlzdE9ianMpXHJcbiAgICAgIHByZXYudndJc1NtYWxsID0gd2luZG93Lm1hdGNoTWVkaWEoXHJcbiAgICAgICAgYChtYXgtd2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWBcclxuICAgICAgKS5tYXRjaGVzXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZFBsYXlsaXN0ICgpIHtcclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgIGF4aW9zXHJcbiAgICAgIC5nZXQoY29uZmlnLlVSTHMuZ2V0Q3VyclBsYXlsaXN0SWQpLFxyXG4gICAgKHJlcykgPT4ge1xyXG4gICAgICBjb25zdCBsb2FkZWRQbGF5bGlzdElkID0gcmVzLmRhdGFcclxuICAgICAgY29uc3QgcGxheWxpc3RUb0xvYWQgPSBpbmZvUmV0cmlldmFsLnBsYXlsaXN0T2Jqcy5maW5kKChwbGF5bGlzdCkgPT4gcGxheWxpc3QuaWQgPT09IGxvYWRlZFBsYXlsaXN0SWQpXHJcblxyXG4gICAgICBpZiAocGxheWxpc3RUb0xvYWQpIHtcclxuICAgICAgICBwbGF5bGlzdEFjdGlvbnMuc2hvd1BsYXlsaXN0VHJhY2tzKHBsYXlsaXN0VG9Mb2FkKVxyXG5cclxuICAgICAgICBjb25zdCBwbGF5bGlzdENhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbGF5bGlzdFRvTG9hZC5nZXRDYXJkSWQoKSlcclxuICAgICAgICBpZiAocGxheWxpc3RDYXJkKSB7IHBsYXlsaXN0QWN0aW9ucy5jbGlja0NhcmQoaW5mb1JldHJpZXZhbC5wbGF5bGlzdE9ianMsIHBsYXlsaXN0Q2FyZCkgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgKVxyXG59XHJcblxyXG5jb25zdCBpbml0aWFsTG9hZHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGxvYWRQbGF5bGlzdEZvcm0gKCkge1xyXG4gICAgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zXHJcbiAgICAgICAgLmdldChjb25maWcuVVJMcy5nZXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGEpXHJcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlcy5kYXRhID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgICAgICAgICAgICBjb25maWcuQ1NTLklEcy5jb252ZXJ0Q2FyZFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRJbWcgPSBjb252ZXJ0QnRuPy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJylbMF1cclxuICAgICAgICAgICAgaWYgKGNvbnZlcnRJbWcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29udmVydCBjYXJkcyB0byB0ZXh0IGZvcm0gYnV0dG9ucyBpbWFnZSBpcyBub3QgZm91bmQnKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBsYXlsaXN0c0NhcmRDb250YWluZXI/LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnRleHRGb3JtKVxyXG4gICAgICAgICAgICBkaXNwbGF5Q2FyZEluZm8uZGlzcGxheVBsYXlsaXN0Q2FyZHMoaW5mb1JldHJpZXZhbC5wbGF5bGlzdE9ianMpXHJcbiAgICAgICAgICAgIGNvbnZlcnRJbWcuc3JjID0gY29uZmlnLlBBVEhTLmdyaWRWaWV3XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBlbHNlIGl0IGlzIGluIGNhcmQgZm9ybSB3aGljaCBpcyB0aGUgZGVmYXVsdC5cclxuICAgICAgICB9KVxyXG4gICAgKVxyXG4gIH1cclxuICBmdW5jdGlvbiBsb2FkUmVzaXplV2lkdGggKCkge1xyXG4gICAgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zXHJcbiAgICAgICAgLmdldChjb25maWcuVVJMcy5nZXRQbGF5bGlzdFJlc2l6ZURhdGEpXHJcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgY2FyZFJlc2l6ZUNvbnRhaW5lci5zdHlsZS53aWR0aCA9IHJlcy5kYXRhICsgJ3B4J1xyXG4gICAgICAgIH0pXHJcbiAgICApXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBsb2FkUGxheWxpc3RGb3JtLFxyXG4gICAgbG9hZFJlc2l6ZVdpZHRoXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICBwcm9taXNlSGFuZGxlcjxib29sZWFuPihjaGVja0lmSGFzVG9rZW5zKCksIChoYXNUb2tlbikgPT4ge1xyXG4gICAgb25TdWNjZXNzZnVsVG9rZW5DYWxsKGhhc1Rva2VuLCAoKSA9PiB7XHJcbiAgICAgIC8vIGdldCBpbmZvcm1hdGlvbiBhbmQgb25TdWNjZXNzIGFuaW1hdGUgdGhlIGVsZW1lbnRzXHJcbiAgICAgIHByb21pc2VIYW5kbGVyKFxyXG4gICAgICAgIGluZm9SZXRyaWV2YWwuZ2V0SW5pdGlhbEluZm8oKSxcclxuICAgICAgICAoKSA9PlxyXG4gICAgICAgICAgYW5pbWF0aW9uQ29udHJvbC5hZGRDbGFzc09uSW50ZXJ2YWwoXHJcbiAgICAgICAgICAgICcucGxheWxpc3QsI2V4cGFuZGVkLXBsYXlsaXN0LW1vZHMnLFxyXG4gICAgICAgICAgICBjb25maWcuQ1NTLkNMQVNTRVMuYXBwZWFyLFxyXG4gICAgICAgICAgICAyNVxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAoKSA9PiBjb25zb2xlLmxvZygnUHJvYmxlbSB3aGVuIGdldHRpbmcgaW5mb3JtYXRpb24nKVxyXG4gICAgICApXHJcbiAgICB9KVxyXG4gIH0pXHJcblxyXG4gIE9iamVjdC5lbnRyaWVzKGFkZEV2ZW50TGlzdGVuZXJzKS5mb3JFYWNoKChbLCBhZGRFdmVudExpc3RlbmVyXSkgPT4ge1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcigpXHJcbiAgfSlcclxuICBjaGVja0lmQ2FyZEZvcm1DaGFuZ2VPblJlc2l6ZSgpXHJcbiAgT2JqZWN0LmVudHJpZXMoaW5pdGlhbExvYWRzKS5mb3JFYWNoKChbLCBsb2FkZXJdKSA9PiB7XHJcbiAgICBsb2FkZXIoKVxyXG4gIH0pXHJcbn0pKClcclxuIiwiaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgY29uZmlnLCBwcm9taXNlSGFuZGxlciB9IGZyb20gJy4vY29uZmlnJ1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlVc2VybmFtZSAoKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0VXNlcm5hbWUgfSksIChyZXMpID0+IHtcclxuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMudXNlcm5hbWUpXHJcbiAgICBpZiAodXNlcm5hbWUpIHtcclxuICAgICAgdXNlcm5hbWUudGV4dENvbnRlbnQgPSByZXMuZGF0YVxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3B1YmxpYy9wYWdlcy9wbGF5bGlzdHMtcGFnZS9wbGF5bGlzdHMudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=