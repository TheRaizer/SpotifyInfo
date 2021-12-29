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

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;

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

      settle(resolve, reject, response);

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
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
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

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
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

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


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
      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
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

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
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
      code: this.code
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

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

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

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

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
    var transitional = this.transitional;
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
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
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


var pkg = __webpack_require__(/*! ./../../package.json */ "./node_modules/axios/package.json");

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};
var currentVerArr = pkg.version.split('.');

/**
 * Compare package versions
 * @param {string} version
 * @param {string?} thanVersion
 * @returns {boolean}
 */
function isOlderVersion(version, thanVersion) {
  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
  var destVer = version.split('.');
  for (var i = 0; i < 3; i++) {
    if (pkgVersionArr[i] > destVer[i]) {
      return true;
    } else if (pkgVersionArr[i] < destVer[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Transitional option validator
 * @param {function|boolean?} validator
 * @param {string?} version
 * @param {string} message
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  var isDeprecated = version && isOlderVersion(version);

  function formatMessage(opt, desc) {
    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed in ' + version));
    }

    if (isDeprecated && !deprecatedWarnings[opt]) {
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
  isOlderVersion: isOlderVersion,
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

/***/ "./src/public/index.ts":
/*!*****************************!*\
  !*** ./src/public/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const config_1 = __webpack_require__(/*! ./config */ "./src/public/config.ts");
const manage_tokens_1 = __webpack_require__(/*! ./manage-tokens */ "./src/public/manage-tokens.ts");
const HALF_HOUR = 1.8e6; /* 30 min in ms */
// if the user stays on the same page for 30 min refresh the token.
// only refresh on home page as the web player will refresh token on other pages.
const startRefreshInterval = () => {
    console.log('start interval refresh');
    setInterval(() => {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putRefreshAccessToken));
        console.log('refresh async');
    }, HALF_HOUR);
};
function generateCustomLoginButton() {
    // Create anchor element.
    const a = document.createElement('a');
    a.href = config_1.config.URLs.auth;
    a.classList.add(config_1.config.CSS.CLASSES.glow);
    // Create the text node for anchor element.
    const link = document.createTextNode('Login To Spotify');
    // Append the text node to anchor element.
    a.appendChild(link);
    // clear current tokens when clicked
    a.addEventListener('click', () => {
        var _a;
        (_a = a === null || a === void 0 ? void 0 : a.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(a);
    });
    const parentEl = document.getElementById(config_1.config.CSS.IDs.homeHeader);
    // Append the anchor element to the parent.
    parentEl === null || parentEl === void 0 ? void 0 : parentEl.appendChild(a);
}
(function () {
    console.log('Interesting');
    (0, config_1.promiseHandler)((0, manage_tokens_1.checkIfHasTokens)(), (hasToken) => {
        console.log('redirect uri: ' + config_1.redirectUri);
        if (!hasToken) {
            (0, config_1.promiseHandler)((0, manage_tokens_1.getTokens)(), (obtainedToken) => {
                (0, manage_tokens_1.onSuccessfulTokenCall)(obtainedToken, () => {
                    startRefreshInterval();
                }, () => {
                    generateCustomLoginButton();
                }, false);
            });
        }
        else {
            startRefreshInterval();
            (0, manage_tokens_1.onSuccessfulTokenCall)(true);
        }
    });
})();
window.onload = function () {
    document.body.className += 'loaded';
    config_1.animationControl.addClassOnInterval('.feature-area', 'appear', 200);
};


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


/***/ }),

/***/ "./node_modules/axios/package.json":
/*!*****************************************!*\
  !*** ./node_modules/axios/package.json ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"_from":"axios@0.21.4","_id":"axios@0.21.4","_inBundle":false,"_integrity":"sha512-ut5vewkiu8jjGBdqpM44XxjuCjq9LAKeHVmoVfHVzy8eHgxxq8SbAVQNovDA8mVi05kP0Ea/n/UzcSHcTJQfNg==","_location":"/axios","_phantomChildren":{},"_requested":{"type":"version","registry":true,"raw":"axios@0.21.4","name":"axios","escapedName":"axios","rawSpec":"0.21.4","saveSpec":null,"fetchSpec":"0.21.4"},"_requiredBy":["#USER","/","/@types/axios"],"_resolved":"https://registry.npmjs.org/axios/-/axios-0.21.4.tgz","_shasum":"c67b90dc0568e5c1cf2b0b858c43ba28e2eda575","_spec":"axios@0.21.4","_where":"C:\\\\Users\\\\Admin\\\\WebDevProjects\\\\SpotifyInfo","author":{"name":"Matt Zabriskie"},"browser":{"./lib/adapters/http.js":"./lib/adapters/xhr.js"},"bugs":{"url":"https://github.com/axios/axios/issues"},"bundleDependencies":false,"bundlesize":[{"path":"./dist/axios.min.js","threshold":"5kB"}],"dependencies":{"follow-redirects":"^1.14.0"},"deprecated":false,"description":"Promise based HTTP client for the browser and node.js","devDependencies":{"coveralls":"^3.0.0","es6-promise":"^4.2.4","grunt":"^1.3.0","grunt-banner":"^0.6.0","grunt-cli":"^1.2.0","grunt-contrib-clean":"^1.1.0","grunt-contrib-watch":"^1.0.0","grunt-eslint":"^23.0.0","grunt-karma":"^4.0.0","grunt-mocha-test":"^0.13.3","grunt-ts":"^6.0.0-beta.19","grunt-webpack":"^4.0.2","istanbul-instrumenter-loader":"^1.0.0","jasmine-core":"^2.4.1","karma":"^6.3.2","karma-chrome-launcher":"^3.1.0","karma-firefox-launcher":"^2.1.0","karma-jasmine":"^1.1.1","karma-jasmine-ajax":"^0.1.13","karma-safari-launcher":"^1.0.0","karma-sauce-launcher":"^4.3.6","karma-sinon":"^1.0.5","karma-sourcemap-loader":"^0.3.8","karma-webpack":"^4.0.2","load-grunt-tasks":"^3.5.2","minimist":"^1.2.0","mocha":"^8.2.1","sinon":"^4.5.0","terser-webpack-plugin":"^4.2.3","typescript":"^4.0.5","url-search-params":"^0.10.0","webpack":"^4.44.2","webpack-dev-server":"^3.11.0"},"homepage":"https://axios-http.com","jsdelivr":"dist/axios.min.js","keywords":["xhr","http","ajax","promise","node"],"license":"MIT","main":"index.js","name":"axios","repository":{"type":"git","url":"git+https://github.com/axios/axios.git"},"scripts":{"build":"NODE_ENV=production grunt build","coveralls":"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js","examples":"node ./examples/server.js","fix":"eslint --fix lib/**/*.js","postversion":"git push && git push --tags","preversion":"npm test","start":"node ./sandbox/server.js","test":"grunt test","version":"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json"},"typings":"./index.d.ts","unpkg":"dist/axios.min.js","version":"0.21.4"}');

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/public/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QywrQkFBZSxHQUFFO1FBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUM7UUFDL0IsZ0JBQWdCLEVBQUU7S0FDbkI7U0FBTTtRQUNMLHFEQUFxRDtRQUNyRCxJQUFJLFlBQVksRUFBRTtZQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLGVBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTztTQUFFO1FBQ2hFLGVBQWUsRUFBRTtLQUNsQjtBQUNILENBQUM7QUEvQkQsc0RBK0JDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuSEQsbUdBQTRDO0FBQzVDLCtFQUFpRDtBQUVqRCxTQUFzQixlQUFlOztRQUNuQywyQkFBYyxFQUErQixlQUFLLENBQUMsT0FBTyxDQUFnQixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLGVBQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2xJLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQ2pFLElBQUksUUFBUSxFQUFFO2dCQUNaLFFBQVEsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLElBQUk7YUFDaEM7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0NBQUE7QUFQRCwwQ0FPQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDVkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb25maWcudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2luZGV4LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9tYW5hZ2UtdG9rZW5zLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy91c2VyLWRhdGEudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICBmdW5jdGlvbiBvbmxvYWRlbmQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhcmVzcG9uc2VUeXBlIHx8IHJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnIHx8ICByZXNwb25zZVR5cGUgPT09ICdqc29uJyA/XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCdvbmxvYWRlbmQnIGluIHJlcXVlc3QpIHtcbiAgICAgIC8vIFVzZSBvbmxvYWRlbmQgaWYgYXZhaWxhYmxlXG4gICAgICByZXF1ZXN0Lm9ubG9hZGVuZCA9IG9ubG9hZGVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZSB0byBlbXVsYXRlIG9ubG9hZGVuZFxuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlYWR5c3RhdGUgaGFuZGxlciBpcyBjYWxsaW5nIGJlZm9yZSBvbmVycm9yIG9yIG9udGltZW91dCBoYW5kbGVycyxcbiAgICAgICAgLy8gc28gd2Ugc2hvdWxkIGNhbGwgb25sb2FkZW5kIG9uIHRoZSBuZXh0ICd0aWNrJ1xuICAgICAgICBzZXRUaW1lb3V0KG9ubG9hZGVuZCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIGNvbmZpZy50cmFuc2l0aW9uYWwgJiYgY29uZmlnLnRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJylcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHtcbiAgICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxuICB9LFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JykgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHBrZyA9IHJlcXVpcmUoJy4vLi4vLi4vcGFja2FnZS5qc29uJyk7XG5cbnZhciB2YWxpZGF0b3JzID0ge307XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5bJ29iamVjdCcsICdib29sZWFuJywgJ251bWJlcicsICdmdW5jdGlvbicsICdzdHJpbmcnLCAnc3ltYm9sJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpKSB7XG4gIHZhbGlkYXRvcnNbdHlwZV0gPSBmdW5jdGlvbiB2YWxpZGF0b3IodGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSB0eXBlIHx8ICdhJyArIChpIDwgMSA/ICduICcgOiAnICcpICsgdHlwZTtcbiAgfTtcbn0pO1xuXG52YXIgZGVwcmVjYXRlZFdhcm5pbmdzID0ge307XG52YXIgY3VycmVudFZlckFyciA9IHBrZy52ZXJzaW9uLnNwbGl0KCcuJyk7XG5cbi8qKlxuICogQ29tcGFyZSBwYWNrYWdlIHZlcnNpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmc/fSB0aGFuVmVyc2lvblxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzT2xkZXJWZXJzaW9uKHZlcnNpb24sIHRoYW5WZXJzaW9uKSB7XG4gIHZhciBwa2dWZXJzaW9uQXJyID0gdGhhblZlcnNpb24gPyB0aGFuVmVyc2lvbi5zcGxpdCgnLicpIDogY3VycmVudFZlckFycjtcbiAgdmFyIGRlc3RWZXIgPSB2ZXJzaW9uLnNwbGl0KCcuJyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgaWYgKHBrZ1ZlcnNpb25BcnJbaV0gPiBkZXN0VmVyW2ldKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHBrZ1ZlcnNpb25BcnJbaV0gPCBkZXN0VmVyW2ldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBUcmFuc2l0aW9uYWwgb3B0aW9uIHZhbGlkYXRvclxuICogQHBhcmFtIHtmdW5jdGlvbnxib29sZWFuP30gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge3N0cmluZz99IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbnZhbGlkYXRvcnMudHJhbnNpdGlvbmFsID0gZnVuY3Rpb24gdHJhbnNpdGlvbmFsKHZhbGlkYXRvciwgdmVyc2lvbiwgbWVzc2FnZSkge1xuICB2YXIgaXNEZXByZWNhdGVkID0gdmVyc2lvbiAmJiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uKTtcblxuICBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlKG9wdCwgZGVzYykge1xuICAgIHJldHVybiAnW0F4aW9zIHYnICsgcGtnLnZlcnNpb24gKyAnXSBUcmFuc2l0aW9uYWwgb3B0aW9uIFxcJycgKyBvcHQgKyAnXFwnJyArIGRlc2MgKyAobWVzc2FnZSA/ICcuICcgKyBtZXNzYWdlIDogJycpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHQsIG9wdHMpIHtcbiAgICBpZiAodmFsaWRhdG9yID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdE1lc3NhZ2Uob3B0LCAnIGhhcyBiZWVuIHJlbW92ZWQgaW4gJyArIHZlcnNpb24pKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEZXByZWNhdGVkICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc09sZGVyVmVyc2lvbjogaXNPbGRlclZlcnNpb24sXG4gIGFzc2VydE9wdGlvbnM6IGFzc2VydE9wdGlvbnMsXG4gIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCJcclxuaW1wb3J0IHsgSVByb21pc2VIYW5kbGVyUmV0dXJuLCBTcG90aWZ5SW1nIH0gZnJvbSAnLi4vdHlwZXMnXHJcbmltcG9ydCB7IFRFUk1TLCBURVJNX1RZUEUgfSBmcm9tICcuL2NvbXBvbmVudHMvc2F2ZS1sb2FkLXRlcm0nXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuXHJcbmNvbnN0IGF1dGhFbmRwb2ludCA9ICdodHRwczovL2FjY291bnRzLnNwb3RpZnkuY29tL2F1dGhvcml6ZSdcclxuLy8gUmVwbGFjZSB3aXRoIHlvdXIgYXBwJ3MgY2xpZW50IElELCByZWRpcmVjdCBVUkkgYW5kIGRlc2lyZWQgc2NvcGVzXHJcbmV4cG9ydCBjb25zdCByZWRpcmVjdFVyaSA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXHJcbmNvbnN0IGNsaWVudElkID0gJzQzNGY1ZTlmNDQyYTRlNDU4NmUwODlhMzNmNjVjODU3J1xyXG5jb25zdCBzY29wZXMgPSBbXHJcbiAgJ3VzZXItcmVhZC1wbGF5YmFjay1zdGF0ZScsXHJcbiAgJ3VzZXItbW9kaWZ5LXBsYXliYWNrLXN0YXRlJyxcclxuICAndXNlci1yZWFkLWN1cnJlbnRseS1wbGF5aW5nJyxcclxuICAnc3RyZWFtaW5nJyxcclxuICAndXNlci1yZWFkLWVtYWlsJyxcclxuICAndXNlci1yZWFkLXByaXZhdGUnLFxyXG4gICdwbGF5bGlzdC1yZWFkLWNvbGxhYm9yYXRpdmUnLFxyXG4gICdwbGF5bGlzdC1yZWFkLXByaXZhdGUnLFxyXG4gICdwbGF5bGlzdC1tb2RpZnktcHJpdmF0ZScsXHJcbiAgJ3VzZXItbGlicmFyeS1yZWFkJyxcclxuICAndXNlci10b3AtcmVhZCcsXHJcbiAgJ3VzZXItcmVhZC1yZWNlbnRseS1wbGF5ZWQnLFxyXG4gICd1c2VyLWZvbGxvdy1yZWFkJ1xyXG5dXHJcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XHJcbiAgQ1NTOiB7XHJcbiAgICBJRHM6IHtcclxuICAgICAgZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lcjogJ2dldC10b2tlbi1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBwbGF5bGlzdENhcmRzQ29udGFpbmVyOiAncGxheWxpc3QtY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgdHJhY2tDYXJkc0NvbnRhaW5lcjogJ3RyYWNrLWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIHBsYXlsaXN0UHJlZml4OiAncGxheWxpc3QtJyxcclxuICAgICAgdHJhY2tQcmVmaXg6ICd0cmFjay0nLFxyXG4gICAgICBzcG90aWZ5Q29udGFpbmVyOiAnc3BvdGlmeS1jb250YWluZXInLFxyXG4gICAgICBpbmZvQ29udGFpbmVyOiAnaW5mby1jb250YWluZXInLFxyXG4gICAgICBhbGxvd0FjY2Vzc0hlYWRlcjogJ2FsbG93LWFjY2Vzcy1oZWFkZXInLFxyXG4gICAgICBleHBhbmRlZFBsYXlsaXN0TW9kczogJ2V4cGFuZGVkLXBsYXlsaXN0LW1vZHMnLFxyXG4gICAgICB0cmFja3NEYXRhOiAndHJhY2tzLWRhdGEnLFxyXG4gICAgICB0cmFja3NDaGFydDogJ3RyYWNrcy1jaGFydCcsXHJcbiAgICAgIHRyYWNrc1Rlcm1TZWxlY3Rpb25zOiAndHJhY2tzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIGZlYXR1cmVTZWxlY3Rpb25zOiAnZmVhdHVyZS1zZWxlY3Rpb25zJyxcclxuICAgICAgcGxheWxpc3RzU2VjdGlvbjogJ3BsYXlsaXN0cy1zZWN0aW9uJyxcclxuICAgICAgZmVhdERlZjogJ2ZlYXQtZGVmaW5pdGlvbicsXHJcbiAgICAgIGZlYXRBdmVyYWdlOiAnZmVhdC1hdmVyYWdlJyxcclxuICAgICAgcmFuazogJ3JhbmsnLFxyXG4gICAgICB2aWV3QWxsVG9wVHJhY2tzOiAndmlldy1hbGwtdG9wLXRyYWNrcycsXHJcbiAgICAgIGVtb2ppczogJ2Vtb2ppcycsXHJcbiAgICAgIGFydGlzdENhcmRzQ29udGFpbmVyOiAnYXJ0aXN0LWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIGFydGlzdFByZWZpeDogJ2FydGlzdC0nLFxyXG4gICAgICBpbml0aWFsQ2FyZDogJ2luaXRpYWwtY2FyZCcsXHJcbiAgICAgIGNvbnZlcnRDYXJkOiAnY29udmVydC1jYXJkJyxcclxuICAgICAgYXJ0aXN0VGVybVNlbGVjdGlvbnM6ICdhcnRpc3RzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIHByb2ZpbGVIZWFkZXI6ICdwcm9maWxlLWhlYWRlcicsXHJcbiAgICAgIGNsZWFyRGF0YTogJ2NsZWFyLWRhdGEnLFxyXG4gICAgICBsaWtlZFRyYWNrczogJ2xpa2VkLXRyYWNrcycsXHJcbiAgICAgIGZvbGxvd2VkQXJ0aXN0czogJ2ZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgICB3ZWJQbGF5ZXI6ICd3ZWItcGxheWVyJyxcclxuICAgICAgcGxheVRpbWVCYXI6ICdwbGF5dGltZS1iYXInLFxyXG4gICAgICBwbGF5bGlzdEhlYWRlckFyZWE6ICdwbGF5bGlzdC1tYWluLWhlYWRlci1hcmVhJyxcclxuICAgICAgcGxheU5leHQ6ICdwbGF5LW5leHQnLFxyXG4gICAgICBwbGF5UHJldjogJ3BsYXktcHJldicsXHJcbiAgICAgIHdlYlBsYXllclBsYXlQYXVzZTogJ3BsYXktcGF1c2UtcGxheWVyJyxcclxuICAgICAgd2ViUGxheWVyVm9sdW1lOiAnd2ViLXBsYXllci12b2x1bWUtYmFyJyxcclxuICAgICAgd2ViUGxheWVyUHJvZ3Jlc3M6ICd3ZWItcGxheWVyLXByb2dyZXNzLWJhcicsXHJcbiAgICAgIHBsYXllclRyYWNrSW1nOiAncGxheWVyLXRyYWNrLWltZycsXHJcbiAgICAgIHdlYlBsYXllckFydGlzdHM6ICd3ZWItcGxheWVyLWFydGlzdHMnLFxyXG4gICAgICBnZW5lcmF0ZVBsYXlsaXN0OiAnZ2VuZXJhdGUtcGxheWxpc3QnLFxyXG4gICAgICBoaWRlU2hvd1BsYXlsaXN0VHh0OiAnaGlkZS1zaG93LXBsYXlsaXN0LXR4dCcsXHJcbiAgICAgIHRvcFRyYWNrc1RleHRGb3JtQ29udGFpbmVyOiAndGVybS10ZXh0LWZvcm0tY29udGFpbmVyJyxcclxuICAgICAgdXNlcm5hbWU6ICd1c2VybmFtZScsXHJcbiAgICAgIHRvcE5hdk1vYmlsZTogJ3RvcG5hdi1tb2JpbGUnLFxyXG4gICAgICBzaHVmZmxlOiAnc2h1ZmZsZScsXHJcbiAgICAgIGhvbWVIZWFkZXI6ICdob21lLWhlYWRlcicsXHJcbiAgICAgIGxvb3A6ICdsb29wJ1xyXG4gICAgfSxcclxuICAgIENMQVNTRVM6IHtcclxuICAgICAgZ2xvdzogJ2dsb3cnLFxyXG4gICAgICBwbGF5bGlzdDogJ3BsYXlsaXN0JyxcclxuICAgICAgdHJhY2s6ICd0cmFjaycsXHJcbiAgICAgIGFydGlzdDogJ2FydGlzdCcsXHJcbiAgICAgIHJhbmtDYXJkOiAncmFuay1jYXJkJyxcclxuICAgICAgcGxheWxpc3RUcmFjazogJ3BsYXlsaXN0LXRyYWNrJyxcclxuICAgICAgaW5mb0xvYWRpbmdTcGlubmVyczogJ2luZm8tbG9hZGluZy1zcGlubmVyJyxcclxuICAgICAgYXBwZWFyOiAnYXBwZWFyJyxcclxuICAgICAgaGlkZTogJ2hpZGUnLFxyXG4gICAgICBzZWxlY3RlZDogJ3NlbGVjdGVkJyxcclxuICAgICAgY2FyZDogJ2NhcmQnLFxyXG4gICAgICBwbGF5bGlzdFNlYXJjaDogJ3BsYXlsaXN0LXNlYXJjaCcsXHJcbiAgICAgIGVsbGlwc2lzV3JhcDogJ2VsbGlwc2lzLXdyYXAnLFxyXG4gICAgICBuYW1lOiAnbmFtZScsXHJcbiAgICAgIHBsYXlsaXN0T3JkZXI6ICdwbGF5bGlzdC1vcmRlcicsXHJcbiAgICAgIGNoYXJ0SW5mbzogJ2NoYXJ0LWluZm8nLFxyXG4gICAgICBmbGlwQ2FyZElubmVyOiAnZmxpcC1jYXJkLWlubmVyJyxcclxuICAgICAgZmxpcENhcmRGcm9udDogJ2ZsaXAtY2FyZC1mcm9udCcsXHJcbiAgICAgIGZsaXBDYXJkQmFjazogJ2ZsaXAtY2FyZC1iYWNrJyxcclxuICAgICAgZmxpcENhcmQ6ICdmbGlwLWNhcmQnLFxyXG4gICAgICByZXNpemVDb250YWluZXI6ICdyZXNpemUtY29udGFpbmVyJyxcclxuICAgICAgc2Nyb2xsTGVmdDogJ3Njcm9sbC1sZWZ0JyxcclxuICAgICAgc2Nyb2xsaW5nVGV4dDogJ3Njcm9sbGluZy10ZXh0JyxcclxuICAgICAgbm9TZWxlY3Q6ICduby1zZWxlY3QnLFxyXG4gICAgICBkcm9wRG93bjogJ2Ryb3AtZG93bicsXHJcbiAgICAgIGV4cGFuZGFibGVUeHRDb250YWluZXI6ICdleHBhbmRhYmxlLXRleHQtY29udGFpbmVyJyxcclxuICAgICAgYm9yZGVyQ292ZXI6ICdib3JkZXItY292ZXInLFxyXG4gICAgICBmaXJzdEV4cGFuc2lvbjogJ2ZpcnN0LWV4cGFuc2lvbicsXHJcbiAgICAgIHNlY29uZEV4cGFuc2lvbjogJ3NlY29uZC1leHBhbnNpb24nLFxyXG4gICAgICBpbnZpc2libGU6ICdpbnZpc2libGUnLFxyXG4gICAgICBmYWRlSW46ICdmYWRlLWluJyxcclxuICAgICAgZnJvbVRvcDogJ2Zyb20tdG9wJyxcclxuICAgICAgZXhwYW5kT25Ib3ZlcjogJ2V4cGFuZC1vbi1ob3ZlcicsXHJcbiAgICAgIHRyYWNrc0FyZWE6ICd0cmFja3MtYXJlYScsXHJcbiAgICAgIHNjcm9sbEJhcjogJ3Njcm9sbC1iYXInLFxyXG4gICAgICB0cmFja0xpc3Q6ICd0cmFjay1saXN0JyxcclxuICAgICAgYXJ0aXN0VG9wVHJhY2tzOiAnYXJ0aXN0LXRvcC10cmFja3MnLFxyXG4gICAgICB0ZXh0Rm9ybTogJ3RleHQtZm9ybScsXHJcbiAgICAgIGNvbnRlbnQ6ICdjb250ZW50JyxcclxuICAgICAgbGlua3M6ICdsaW5rcycsXHJcbiAgICAgIHByb2dyZXNzOiAncHJvZ3Jlc3MnLFxyXG4gICAgICBwbGF5UGF1c2U6ICdwbGF5LXBhdXNlJyxcclxuICAgICAgcmFua2VkVHJhY2tJbnRlcmFjdDogJ3JhbmtlZC1pbnRlcmFjdGlvbi1hcmVhJyxcclxuICAgICAgc2xpZGVyOiAnc2xpZGVyJyxcclxuICAgICAgcGxheUJ0bjogJ3BsYXktYnRuJyxcclxuICAgICAgZGlzcGxheU5vbmU6ICdkaXNwbGF5LW5vbmUnLFxyXG4gICAgICBjb2x1bW46ICdjb2x1bW4nLFxyXG4gICAgICB3ZWJQbGF5ZXJDb250cm9sczogJ3dlYi1wbGF5ZXItY29udHJvbHMnXHJcbiAgICB9LFxyXG4gICAgQVRUUklCVVRFUzoge1xyXG4gICAgICBkYXRhU2VsZWN0aW9uOiAnZGF0YS1zZWxlY3Rpb24nLFxyXG4gICAgICByZXN0cmljdEZsaXBPbkNsaWNrOiAnZGF0YS1yZXN0cmljdC1mbGlwLW9uLWNsaWNrJ1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgVVJMczoge1xyXG4gICAgc2l0ZVVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsXHJcbiAgICBhdXRoOiBgJHthdXRoRW5kcG9pbnR9P2NsaWVudF9pZD0ke2NsaWVudElkfSZyZWRpcmVjdF91cmk9JHtyZWRpcmVjdFVyaX0mc2NvcGU9JHtzY29wZXMuam9pbihcclxuICAgICAgJyUyMCdcclxuICAgICl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzaG93X2RpYWxvZz10cnVlYCxcclxuICAgIGdldEhhc1Rva2VuczogJy90b2tlbnMvaGFzLXRva2VucycsXHJcbiAgICBnZXRBY2Nlc3NUb2tlbjogJy90b2tlbnMvZ2V0LWFjY2Vzcy10b2tlbicsXHJcbiAgICBnZXRPYnRhaW5Ub2tlbnNQcmVmaXg6IChjb2RlOiBzdHJpbmcpID0+IGAvdG9rZW5zL29idGFpbi10b2tlbnM/Y29kZT0ke2NvZGV9YCxcclxuICAgIGdldFRvcEFydGlzdHM6ICcvc3BvdGlmeS9nZXQtdG9wLWFydGlzdHM/dGltZV9yYW5nZT0nLFxyXG4gICAgZ2V0VG9wVHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LXRvcC10cmFja3M/dGltZV9yYW5nZT0nLFxyXG4gICAgZ2V0UGxheWxpc3RzOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0cycsXHJcbiAgICBnZXRQbGF5bGlzdFRyYWNrczogJy9zcG90aWZ5L2dldC1wbGF5bGlzdC10cmFja3M/cGxheWxpc3RfaWQ9JyxcclxuICAgIHB1dENsZWFyVG9rZW5zOiAnL3Rva2Vucy9jbGVhci10b2tlbnMnLFxyXG4gICAgZGVsZXRlUGxheWxpc3RUcmFja3M6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9kZWxldGUtcGxheWxpc3QtaXRlbXM/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBwb3N0UGxheWxpc3RUcmFja3M6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LXBsYXlsaXN0LWl0ZW1zP3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgZ2V0VHJhY2tGZWF0dXJlczogJy9zcG90aWZ5L2dldC10cmFja3MtZmVhdHVyZXM/dHJhY2tfaWRzPScsXHJcbiAgICBwdXRSZWZyZXNoQWNjZXNzVG9rZW46ICcvdG9rZW5zL3JlZnJlc2gtdG9rZW4nLFxyXG4gICAgcHV0U2Vzc2lvbkRhdGE6ICcvc3BvdGlmeS9wdXQtc2Vzc2lvbi1kYXRhP2F0dHI9JyxcclxuICAgIHB1dFBsYXlsaXN0UmVzaXplRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXBsYXlsaXN0LXJlc2l6ZS1kYXRhP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWxpc3RSZXNpemVEYXRhOiAnL3VzZXIvZ2V0LXBsYXlsaXN0LXJlc2l6ZS1kYXRhJyxcclxuICAgIHB1dFBsYXlsaXN0SXNJblRleHRGb3JtRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXBsYXlsaXN0LXRleHQtZm9ybS1kYXRhP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhOiAnL3VzZXIvZ2V0LXBsYXlsaXN0LXRleHQtZm9ybS1kYXRhJyxcclxuICAgIHB1dFRvcFRyYWNrc0lzSW5UZXh0Rm9ybURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC10b3AtdHJhY2tzLXRleHQtZm9ybS1kYXRhP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0VG9wVHJhY2tzSXNJblRleHRGb3JtRGF0YTogJy91c2VyL2dldC10b3AtdHJhY2tzLXRleHQtZm9ybS1kYXRhJyxcclxuICAgIGdldEFydGlzdFRvcFRyYWNrczogKGlkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9nZXQtYXJ0aXN0LXRvcC10cmFja3M/aWQ9JHtpZH1gLFxyXG4gICAgZ2V0Q3VycmVudFVzZXJQcm9maWxlOiAnL3Nwb3RpZnkvZ2V0LWN1cnJlbnQtdXNlci1wcm9maWxlJyxcclxuICAgIHB1dENsZWFyU2Vzc2lvbjogJy9jbGVhci1zZXNzaW9uJyxcclxuICAgIGdldEN1cnJlbnRVc2VyU2F2ZWRUcmFja3M6ICcvc3BvdGlmeS9nZXQtY3VycmVudC11c2VyLXNhdmVkLXRyYWNrcycsXHJcbiAgICBnZXRGb2xsb3dlZEFydGlzdHM6ICcvc3BvdGlmeS9nZXQtZm9sbG93ZWQtYXJ0aXN0cycsXHJcbiAgICBwdXRQbGF5VHJhY2s6IChkZXZpY2VfaWQ6IHN0cmluZywgdHJhY2tfdXJpOiBzdHJpbmcpID0+XHJcbiAgICAgIGAvc3BvdGlmeS9wbGF5LXRyYWNrP2RldmljZV9pZD0ke2RldmljZV9pZH0mdHJhY2tfdXJpPSR7dHJhY2tfdXJpfWAsXHJcbiAgICBwdXRQbGF5ZXJWb2x1bWVEYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtcGxheWVyLXZvbHVtZT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXllclZvbHVtZURhdGE6ICcvdXNlci9nZXQtcGxheWVyLXZvbHVtZScsXHJcbiAgICBwdXRUZXJtOiAodGVybTogVEVSTVMsIHRlcm1UeXBlOiBURVJNX1RZUEUpID0+IGAvdXNlci9wdXQtdG9wLSR7dGVybVR5cGV9LXRlcm0/dGVybT0ke3Rlcm19YCxcclxuICAgIGdldFRlcm06ICh0ZXJtVHlwZTogVEVSTV9UWVBFKSA9PiBgL3VzZXIvZ2V0LXRvcC0ke3Rlcm1UeXBlfS10ZXJtYCxcclxuICAgIHB1dEN1cnJQbGF5bGlzdElkOiAoaWQ6IHN0cmluZykgPT4gYC91c2VyL3B1dC1jdXJyZW50LXBsYXlsaXN0LWlkP2lkPSR7aWR9YCxcclxuICAgIGdldEN1cnJQbGF5bGlzdElkOiAnL3VzZXIvZ2V0LWN1cnJlbnQtcGxheWxpc3QtaWQnLFxyXG4gICAgcG9zdFBsYXlsaXN0OiAobmFtZTogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1wbGF5bGlzdD9uYW1lPSR7bmFtZX1gLFxyXG4gICAgcG9zdEl0ZW1zVG9QbGF5bGlzdDogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtaXRlbXMtdG8tcGxheWxpc3Q/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBnZXRVc2VybmFtZTogJy91c2VyL2dldC11c2VybmFtZSdcclxuICB9LFxyXG4gIFBBVEhTOiB7XHJcbiAgICBzcGlubmVyOiAnL2ltYWdlcy8yMDBweExvYWRpbmdTcGlubmVyLnN2ZycsXHJcbiAgICBncmlkVmlldzogJy9pbWFnZXMvZ3JpZC12aWV3LWljb24ucG5nJyxcclxuICAgIGxpc3RWaWV3OiAnL2ltYWdlcy9saXN0LXZpZXctaWNvbi5wbmcnLFxyXG4gICAgY2hldnJvbkxlZnQ6ICcvaW1hZ2VzL2NoZXZyb24tbGVmdC5wbmcnLFxyXG4gICAgY2hldnJvblJpZ2h0OiAnL2ltYWdlcy9jaGV2cm9uLXJpZ2h0LnBuZycsXHJcbiAgICBwbGF5SWNvbjogJy9pbWFnZXMvcGxheS0zMHB4LnBuZycsXHJcbiAgICBwYXVzZUljb246ICcvaW1hZ2VzL3BhdXNlLTMwcHgucG5nJyxcclxuICAgIHBsYXlCbGFja0ljb246ICcvaW1hZ2VzL3BsYXktYmxhY2stMzBweC5wbmcnLFxyXG4gICAgcGF1c2VCbGFja0ljb246ICcvaW1hZ2VzL3BhdXNlLWJsYWNrLTMwcHgucG5nJyxcclxuICAgIHBsYXlOZXh0OiAnL2ltYWdlcy9uZXh0LTMwcHgucG5nJyxcclxuICAgIHBsYXlQcmV2OiAnL2ltYWdlcy9wcmV2aW91cy0zMHB4LnBuZycsXHJcbiAgICBwcm9maWxlVXNlcjogJy9pbWFnZXMvcHJvZmlsZS11c2VyLnBuZycsXHJcbiAgICBzaHVmZmxlSWNvbjogJy9pbWFnZXMvc2h1ZmZsZS1pY29uLnBuZycsXHJcbiAgICBzaHVmZmxlSWNvbkdyZWVuOiAnL2ltYWdlcy9zaHVmZmxlLWljb24tZ3JlZW4ucG5nJyxcclxuICAgIGxvb3BJY29uOiAnL2ltYWdlcy9sb29wLWljb24ucG5nJyxcclxuICAgIGxvb3BJY29uR3JlZW46ICcvaW1hZ2VzL2xvb3AtaWNvbi1ncmVlbi5wbmcnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyAobWlsbGlzOiBudW1iZXIpIHtcclxuICBjb25zdCBtaW51dGVzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1pbGxpcyAvIDYwMDAwKVxyXG4gIGNvbnN0IHNlY29uZHM6IG51bWJlciA9IHBhcnNlSW50KCgobWlsbGlzICUgNjAwMDApIC8gMTAwMCkudG9GaXhlZCgwKSlcclxuICByZXR1cm4gc2Vjb25kcyA9PT0gNjBcclxuICAgID8gbWludXRlcyArIDEgKyAnOjAwJ1xyXG4gICAgOiBtaW51dGVzICsgJzonICsgKHNlY29uZHMgPCAxMCA/ICcwJyA6ICcnKSArIHNlY29uZHNcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaHRtbFRvRWwgKGh0bWw6IHN0cmluZykge1xyXG4gIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpXHJcbiAgaHRtbCA9IGh0bWwudHJpbSgpIC8vIE5ldmVyIHJldHVybiBhIHNwYWNlIHRleHQgbm9kZSBhcyBhIHJlc3VsdFxyXG4gIHRlbXAuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHJldHVybiB0ZW1wLmNvbnRlbnQuZmlyc3RDaGlsZFxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbWlzZUhhbmRsZXI8VD4gKFxyXG4gIHByb21pc2U6IFByb21pc2U8VD4sXHJcbiAgb25TdWNjZXNmdWwgPSAocmVzOiBUKSA9PiB7IH0sXHJcbiAgb25GYWlsdXJlID0gKGVycjogdW5rbm93bikgPT4ge1xyXG4gICAgaWYgKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgIH1cclxuICB9XHJcbikge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBwcm9taXNlXHJcbiAgICBvblN1Y2Nlc2Z1bChyZXMgYXMgVClcclxuICAgIHJldHVybiB7IHJlczogcmVzLCBlcnI6IG51bGwgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcclxuICAgIG9uRmFpbHVyZShlcnIpXHJcbiAgICByZXR1cm4geyByZXM6IG51bGwsIGVycjogZXJyIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRmlsdGVycyAnbGknIGVsZW1lbnRzIHRvIGVpdGhlciBiZSBoaWRkZW4gb3Igbm90IGRlcGVuZGluZyBvbiBpZlxyXG4gKiB0aGV5IGNvbnRhaW4gc29tZSBnaXZlbiBpbnB1dCB0ZXh0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge0hUTUx9IHVsIC0gdW5vcmRlcmVkIGxpc3QgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSAnbGknIHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7SFRNTH0gaW5wdXQgLSBpbnB1dCBlbGVtZW50IHdob3NlIHZhbHVlIHdpbGwgYmUgdXNlZCB0byBmaWx0ZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ZERpc3BsYXkgLSB0aGUgc3RhbmRhcmQgZGlzcGxheSB0aGUgJ2xpJyBzaG91bGQgaGF2ZSB3aGVuIG5vdCAnbm9uZSdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hVbCAodWw6IEhUTUxVTGlzdEVsZW1lbnQsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50LCBzdGREaXNwbGF5OiBzdHJpbmcgPSAnZmxleCcpOiB2b2lkIHtcclxuICBjb25zdCBsaUVscyA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpXHJcbiAgY29uc3QgZmlsdGVyID0gaW5wdXQudmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpRWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBnZXQgdGhlIG5hbWUgY2hpbGQgZWwgaW4gdGhlIGxpIGVsXHJcbiAgICBjb25zdCBuYW1lID0gbGlFbHNbaV0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMubmFtZSlbMF1cclxuICAgIGNvbnN0IG5hbWVUeHQgPSBuYW1lLnRleHRDb250ZW50IHx8IG5hbWUuaW5uZXJIVE1MXHJcblxyXG4gICAgaWYgKG5hbWVUeHQgJiYgbmFtZVR4dC50b1VwcGVyQ2FzZSgpLmluZGV4T2YoZmlsdGVyKSA+IC0xKSB7XHJcbiAgICAgIC8vIHNob3cgbGkncyB3aG9zZSBuYW1lIGNvbnRhaW5zIHRoZSB0aGUgZW50ZXJlZCBzdHJpbmdcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9IHN0ZERpc3BsYXlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG90aGVyd2lzZSBoaWRlIGl0XHJcbiAgICAgIGxpRWxzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cclxuICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cclxuICpcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoICh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgbGV0IG1ldHJpY3M6IFRleHRNZXRyaWNzXHJcbiAgaWYgKGNvbnRleHQpIHtcclxuICAgIGNvbnRleHQuZm9udCA9IGZvbnRcclxuICAgIG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpXHJcbiAgICByZXR1cm4gbWV0cmljcy53aWR0aFxyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdObyBjb250ZXh0IG9uIGNyZWF0ZWQgY2FudmFzIHdhcyBmb3VuZCcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsbGlwc2lzQWN0aXZlIChlbDogSFRNTEVsZW1lbnQpIHtcclxuICByZXR1cm4gZWwub2Zmc2V0V2lkdGggPCBlbC5zY3JvbGxXaWR0aFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyIChzdHJpbmc6IHN0cmluZykge1xyXG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbGlkSW1hZ2UgKGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGlkeCA9IDApIHtcclxuICAvLyBvYnRhaW4gdGhlIGNvcnJlY3QgaW1hZ2VcclxuICBpZiAoaW1hZ2VzLmxlbmd0aCA+IGlkeCkge1xyXG4gICAgY29uc3QgaW1nID0gaW1hZ2VzW2lkeF1cclxuICAgIHJldHVybiBpbWcudXJsXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUFsbENoaWxkTm9kZXMgKHBhcmVudDogTm9kZSkge1xyXG4gIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGFuaW1hdGlvbkNvbnRyb2wgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8qKiBBZGRzIGEgY2xhc3MgdG8gZWFjaCBlbGVtZW50IGNhdXNpbmcgYSB0cmFuc2l0aW9uIHRvIHRoZSBjaGFuZ2VkIGNzcyB2YWx1ZXMuXHJcbiAgICogVGhpcyBpcyBkb25lIG9uIHNldCBpbnRlcnZhbHMuXHJcbiAgICpcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBpbmNsdWRpbmcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzVG9UcmFuc2l0aW9uVG9vIC0gVGhlIGNsYXNzIHRoYXQgYWxsIHRoZSB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIHdpbGwgYWRkXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuaW1hdGlvbkludGVydmFsIC0gVGhlIGludGVydmFsIHRvIHdhaXQgYmV0d2VlbiBhbmltYXRpb24gb2YgZWxlbWVudHNcclxuICAgKi9cclxuICBmdW5jdGlvbiBhZGRDbGFzc09uSW50ZXJ2YWwgKFxyXG4gICAgZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZyxcclxuICAgIGNsYXNzVG9UcmFuc2l0aW9uVG9vOiBzdHJpbmcsXHJcbiAgICBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyXHJcbiAgKSB7XHJcbiAgICAvLyBhcnIgb2YgaHRtbCBzZWxlY3RvcnMgdGhhdCBwb2ludCB0byBlbGVtZW50cyB0byBhbmltYXRlXHJcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudHNUb0FuaW1hdGUuc3BsaXQoJywnKVxyXG5cclxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYXR0cilcclxuICAgICAgbGV0IGlkeCA9IDBcclxuICAgICAgLy8gaW4gaW50ZXJ2YWxzIHBsYXkgdGhlaXIgaW5pdGlhbCBhbmltYXRpb25zXHJcbiAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpZHggPT09IGVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaWR4XVxyXG4gICAgICAgIC8vIGFkZCB0aGUgY2xhc3MgdG8gdGhlIGVsZW1lbnRzIGNsYXNzZXMgaW4gb3JkZXIgdG8gcnVuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9UcmFuc2l0aW9uVG9vKVxyXG4gICAgICAgIGlkeCArPSAxXHJcbiAgICAgIH0sIGFuaW1hdGlvbkludGVydmFsKVxyXG4gICAgfSlcclxuICB9XHJcbiAgcmV0dXJuIHtcclxuICAgIGFkZENsYXNzT25JbnRlcnZhbFxyXG4gIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBpeGVsUG9zSW5FbE9uQ2xpY2sgKG1vdXNlRXZ0OiBNb3VzZUV2ZW50KTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHtcclxuICBjb25zdCByZWN0ID0gKG1vdXNlRXZ0LnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICBjb25zdCB4ID0gbW91c2VFdnQuY2xpZW50WCAtIHJlY3QubGVmdCAvLyB4IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICBjb25zdCB5ID0gbW91c2VFdnQuY2xpZW50WSAtIHJlY3QudG9wIC8vIHkgcG9zaXRpb24gd2l0aGluIHRoZSBlbGVtZW50LlxyXG4gIHJldHVybiB7IHgsIHkgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFeHByZXNzaW9uIChlcnJvck1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkSXRlbXNUb1BsYXlsaXN0IChwbGF5bGlzdElkOiBzdHJpbmcsIHVyaXM6IEFycmF5PHN0cmluZz4pIHtcclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgIGF4aW9zKHtcclxuICAgICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICAgIHVybDogY29uZmlnLlVSTHMucG9zdEl0ZW1zVG9QbGF5bGlzdChwbGF5bGlzdElkKSxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHVyaXM6IHVyaXNcclxuICAgICAgfVxyXG4gICAgfSksXHJcbiAgICAoKSA9PiB7fSwgKCkgPT4ge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lzc3VlIGFkZGluZyBpdGVtcyB0byBwbGF5bGlzdCcpXHJcbiAgICB9KVxyXG59XHJcblxyXG4vKipcclxuICogU2h1ZmZsZXMgYSBnaXZlbiBhcnJheSBhbmQgcmV0dXJucyB0aGUgc2h1ZmZsZWQgdmVyc2lvbi5cclxuICogQHBhcmFtIHtBcnJheTxUPn0gYXJyYXkgVGhlIGFycmF5IHRvIHNodWZmbGUgYnV0IG5vdCBtdXRhdGUuXHJcbiAqIEByZXR1cm5zIHtBcnJheTxUPn0gYSBzaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBhcnJheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlPFQ+IChhcnJheTogQXJyYXk8VD4pIHtcclxuICBjb25zdCBjbG9uZUFyciA9IFsuLi5hcnJheV1cclxuICBsZXQgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoXHJcbiAgbGV0IHJhbmRvbUluZGV4XHJcblxyXG4gIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgd2hpbGUgKGN1cnJlbnRJbmRleCAhPT0gMCkge1xyXG4gICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleClcclxuICAgIGN1cnJlbnRJbmRleC0tO1xyXG5cclxuICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgIFtjbG9uZUFycltjdXJyZW50SW5kZXhdLCBjbG9uZUFycltyYW5kb21JbmRleF1dID0gW1xyXG4gICAgICBjbG9uZUFycltyYW5kb21JbmRleF0sIGNsb25lQXJyW2N1cnJlbnRJbmRleF1dXHJcbiAgfVxyXG5cclxuICByZXR1cm4gY2xvbmVBcnJcclxufVxyXG4iLCJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcbmltcG9ydCB7IGFuaW1hdGlvbkNvbnRyb2wsIGNvbmZpZywgcHJvbWlzZUhhbmRsZXIsIHJlZGlyZWN0VXJpIH0gZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCB7IGNoZWNrSWZIYXNUb2tlbnMsIGdldFRva2Vucywgb25TdWNjZXNzZnVsVG9rZW5DYWxsIH0gZnJvbSAnLi9tYW5hZ2UtdG9rZW5zJ1xyXG5cclxuY29uc3QgSEFMRl9IT1VSID0gMS44ZTYgLyogMzAgbWluIGluIG1zICovXHJcblxyXG4vLyBpZiB0aGUgdXNlciBzdGF5cyBvbiB0aGUgc2FtZSBwYWdlIGZvciAzMCBtaW4gcmVmcmVzaCB0aGUgdG9rZW4uXHJcbi8vIG9ubHkgcmVmcmVzaCBvbiBob21lIHBhZ2UgYXMgdGhlIHdlYiBwbGF5ZXIgd2lsbCByZWZyZXNoIHRva2VuIG9uIG90aGVyIHBhZ2VzLlxyXG5jb25zdCBzdGFydFJlZnJlc2hJbnRlcnZhbCA9ICgpID0+IHtcclxuICBjb25zb2xlLmxvZygnc3RhcnQgaW50ZXJ2YWwgcmVmcmVzaCcpXHJcbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFJlZnJlc2hBY2Nlc3NUb2tlbikpXHJcbiAgICBjb25zb2xlLmxvZygncmVmcmVzaCBhc3luYycpXHJcbiAgfSwgSEFMRl9IT1VSKVxyXG59XHJcbmZ1bmN0aW9uIGdlbmVyYXRlQ3VzdG9tTG9naW5CdXR0b24gKCkge1xyXG4gIC8vIENyZWF0ZSBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXHJcbiAgYS5ocmVmID0gY29uZmlnLlVSTHMuYXV0aFxyXG4gIGEuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuZ2xvdylcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSB0ZXh0IG5vZGUgZm9yIGFuY2hvciBlbGVtZW50LlxyXG4gIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnTG9naW4gVG8gU3BvdGlmeScpXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgdGV4dCBub2RlIHRvIGFuY2hvciBlbGVtZW50LlxyXG4gIGEuYXBwZW5kQ2hpbGQobGluaylcclxuXHJcbiAgLy8gY2xlYXIgY3VycmVudCB0b2tlbnMgd2hlbiBjbGlja2VkXHJcbiAgYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGE/LnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGEpXHJcbiAgfSlcclxuICBjb25zdCBwYXJlbnRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmhvbWVIZWFkZXIpXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgYW5jaG9yIGVsZW1lbnQgdG8gdGhlIHBhcmVudC5cclxuICBwYXJlbnRFbD8uYXBwZW5kQ2hpbGQoYSlcclxufVxyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICBjb25zb2xlLmxvZygnSW50ZXJlc3RpbmcnKVxyXG4gIHByb21pc2VIYW5kbGVyPGJvb2xlYW4+KGNoZWNrSWZIYXNUb2tlbnMoKSwgKGhhc1Rva2VuKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygncmVkaXJlY3QgdXJpOiAnICsgcmVkaXJlY3RVcmkpXHJcbiAgICBpZiAoIWhhc1Rva2VuKSB7XHJcbiAgICAgIHByb21pc2VIYW5kbGVyPGJvb2xlYW4+KGdldFRva2VucygpLCAob2J0YWluZWRUb2tlbikgPT4ge1xyXG4gICAgICAgIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbChvYnRhaW5lZFRva2VuLCAoKSA9PiB7XHJcbiAgICAgICAgICBzdGFydFJlZnJlc2hJbnRlcnZhbCgpXHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgZ2VuZXJhdGVDdXN0b21Mb2dpbkJ1dHRvbigpXHJcbiAgICAgICAgfSwgZmFsc2UpXHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGFydFJlZnJlc2hJbnRlcnZhbCgpXHJcbiAgICAgIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbCh0cnVlKVxyXG4gICAgfVxyXG4gIH0pXHJcbn0pKClcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgKz0gJ2xvYWRlZCdcclxuICBhbmltYXRpb25Db250cm9sLmFkZENsYXNzT25JbnRlcnZhbCgnLmZlYXR1cmUtYXJlYScsICdhcHBlYXInLCAyMDApXHJcbn1cclxuIiwiaW1wb3J0IHsgY29uZmlnLCBwcm9taXNlSGFuZGxlciwgdGhyb3dFeHByZXNzaW9uIH0gZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgZGlzcGxheVVzZXJuYW1lIH0gZnJvbSAnLi91c2VyLWRhdGEnXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tJZkhhc1Rva2VucyAoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBhd2FpdCBwcm9taXNlIHJlc29sdmUgdGhhdCByZXR1cm5zIHdoZXRoZXIgdGhlIHNlc3Npb24gaGFzIHRva2Vucy5cclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRIYXNUb2tlbnMpLFxyXG4gICAgKHJlcykgPT4ge1xyXG4gICAgICBoYXNUb2tlbiA9IHJlcy5kYXRhXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICByZXR1cm4gaGFzVG9rZW5cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VucyAoKSB7XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBjcmVhdGUgYSBwYXJhbWV0ZXIgc2VhcmNoZXIgaW4gdGhlIFVSTCBhZnRlciAnPycgd2hpY2ggaG9sZHMgdGhlIHJlcXVlc3RzIGJvZHkgcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcclxuXHJcbiAgLy8gR2V0IHRoZSBjb2RlIGZyb20gdGhlIHBhcmFtZXRlciBjYWxsZWQgJ2NvZGUnIGluIHRoZSB1cmwgd2hpY2hcclxuICAvLyBob3BlZnVsbHkgY2FtZSBiYWNrIGZyb20gdGhlIHNwb3RpZnkgR0VUIHJlcXVlc3Qgb3RoZXJ3aXNlIGl0IGlzIG51bGxcclxuICBsZXQgYXV0aENvZGUgPSB1cmxQYXJhbXMuZ2V0KCdjb2RlJylcclxuXHJcbiAgaWYgKGF1dGhDb2RlKSB7XHJcbiAgICAvLyBvYnRhaW4gdG9rZW5zXHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldE9idGFpblRva2Vuc1ByZWZpeChhdXRoQ29kZSkpLFxyXG5cclxuICAgICAgLy8gaWYgdGhlIHJlcXVlc3Qgd2FzIHN1Y2Nlc2Z1bCB3ZSBoYXZlIHJlY2lldmVkIGEgdG9rZW5cclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIGhhc1Rva2VuID0gdHJ1ZVxyXG4gICAgICB9XHJcbiAgICApXHJcbiAgICBhdXRoQ29kZSA9ICcnXHJcblxyXG4gICAgLy8gZ2V0IHVzZXIgaW5mbyBmcm9tIHNwb3RpZnlcclxuICAgIGF3YWl0IHByb21pc2VIYW5kbGVyKGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRDdXJyZW50VXNlclByb2ZpbGUpKVxyXG4gIH1cclxuXHJcbiAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsICcnLCAnLycpXHJcbiAgcmV0dXJuIGhhc1Rva2VuXHJcbn1cclxuXHJcbi8qKiBHZW5lcmF0ZSBhIGxvZ2luL2NoYW5nZSBhY2NvdW50IGxpbmsuIERlZmF1bHRzIHRvIGFwcGVuZGluZyBpdCBvbnRvIHRoZSBuYXYgYmFyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFN0cmluZz59IGNsYXNzZXNUb0FkZCAtIHRoZSBjbGFzc2VzIHRvIGFkZCBvbnRvIHRoZSBsaW5rLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNoYW5nZUFjY291bnQgLSBXaGV0aGVyIHRoZSBsaW5rIHNob3VsZCBiZSBmb3IgY2hhbmdpbmcgYWNjb3VudCwgb3IgZm9yIGxvZ2dpbmcgaW4uIChkZWZhdWx0cyB0byB0cnVlKVxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJlbnRFbCAtIHRoZSBwYXJlbnQgZWxlbWVudCB0byBhcHBlbmQgdGhlIGxpbmsgb250by4gKGRlZmF1bHRzIHRvIG5hdmJhcilcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUxvZ2luICh7XHJcbiAgY2xhc3Nlc1RvQWRkID0gWydyaWdodCddLFxyXG4gIGNoYW5nZUFjY291bnQgPSB0cnVlLFxyXG4gIHBhcmVudEVsID0gZG9jdW1lbnRcclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd0b3BuYXYnKVswXVxyXG4gICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3JpZ2h0JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkcm9wZG93bi1jb250ZW50JylbMF1cclxufSA9IHt9KSB7XHJcbiAgLy8gQ3JlYXRlIGFuY2hvciBlbGVtZW50LlxyXG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcclxuICBhLmhyZWYgPSBjb25maWcuVVJMcy5hdXRoXHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgdGV4dCBub2RlIGZvciBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICBjaGFuZ2VBY2NvdW50ID8gJ0NoYW5nZSBBY2NvdW50JyA6ICdMb2dpbiBUbyBTcG90aWZ5J1xyXG4gIClcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSB0ZXh0IG5vZGUgdG8gYW5jaG9yIGVsZW1lbnQuXHJcbiAgYS5hcHBlbmRDaGlsZChsaW5rKVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlc1RvQWRkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBjbGFzc1RvQWRkID0gY2xhc3Nlc1RvQWRkW2ldXHJcbiAgICBhLmNsYXNzTGlzdC5hZGQoY2xhc3NUb0FkZClcclxuICB9XHJcblxyXG4gIC8vIGNsZWFyIGN1cnJlbnQgdG9rZW5zIHdoZW4gY2xpY2tlZFxyXG4gIGEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0Q2xlYXJUb2tlbnMpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSlcclxuICB9KVxyXG5cclxuICAvLyBBcHBlbmQgdGhlIGFuY2hvciBlbGVtZW50IHRvIHRoZSBwYXJlbnQuXHJcbiAgcGFyZW50RWwuYXBwZW5kQ2hpbGQoYSlcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gb25TdWNjZXNzZnVsVG9rZW5DYWxsIChcclxuICBoYXNUb2tlbjogYm9vbGVhbixcclxuICBoYXNUb2tlbkNhbGxiYWNrID0gKCkgPT4geyB9LFxyXG4gIG5vVG9rZW5DYWxsQmFjayA9ICgpID0+IHsgfSxcclxuICByZWRpcmVjdEhvbWUgPSB0cnVlXHJcbikge1xyXG4gIGNvbnN0IGdldFRva2Vuc1NwaW5uZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgIGNvbmZpZy5DU1MuSURzLmdldFRva2VuTG9hZGluZ1NwaW5uZXJcclxuICApXHJcblxyXG4gIC8vIHJlbW92ZSB0b2tlbiBzcGlubmVyIGJlY2F1c2UgYnkgdGhpcyBsaW5lIHdlIGhhdmUgb2J0YWluZWQgdGhlIHRva2VuXHJcbiAgZ2V0VG9rZW5zU3Bpbm5lcj8ucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoZ2V0VG9rZW5zU3Bpbm5lcilcclxuXHJcbiAgY29uc3QgaW5mb0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmluZm9Db250YWluZXIpXHJcblxyXG4gIC8vIGdlbmVyYXRlIHRoZSBuYXYgbG9naW5cclxuICBnZW5lcmF0ZUxvZ2luKHsgY2hhbmdlQWNjb3VudDogaGFzVG9rZW4sIHBhcmVudEVsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy50b3BOYXZNb2JpbGUpID8/IHRocm93RXhwcmVzc2lvbignTm8gdG9wIG5hdiBtb2JpbGUgZWxlbWVudCBmb3VuZCcpIH0pXHJcbiAgZ2VuZXJhdGVMb2dpbih7IGNoYW5nZUFjY291bnQ6IGhhc1Rva2VuIH0pXHJcbiAgaWYgKGhhc1Rva2VuKSB7XHJcbiAgICBpZiAoaW5mb0NvbnRhaW5lciA9PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5mbyBjb250YWluZXIgRWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICB9XHJcbiAgICBpbmZvQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICBkaXNwbGF5VXNlcm5hbWUoKVxyXG4gICAgY29uc29sZS5sb2coJ2Rpc3BsYXkgdXNlcm5hbWUnKVxyXG4gICAgaGFzVG9rZW5DYWxsYmFjaygpXHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIHRva2VuIHJlZGlyZWN0IHRvIGFsbG93IGFjY2VzcyBwYWdlXHJcbiAgICBpZiAocmVkaXJlY3RIb21lKSB7IHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gY29uZmlnLlVSTHMuc2l0ZVVybCB9XHJcbiAgICBub1Rva2VuQ2FsbEJhY2soKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyIH0gZnJvbSAnLi9jb25maWcnXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzcGxheVVzZXJuYW1lICgpIHtcclxuICBwcm9taXNlSGFuZGxlcjxBeGlvc1Jlc3BvbnNlPHN0cmluZyB8IG51bGw+PihheGlvcy5yZXF1ZXN0PHN0cmluZyB8IG51bGw+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRVc2VybmFtZSB9KSwgKHJlcykgPT4ge1xyXG4gICAgY29uc3QgdXNlcm5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy51c2VybmFtZSlcclxuICAgIGlmICh1c2VybmFtZSkge1xyXG4gICAgICB1c2VybmFtZS50ZXh0Q29udGVudCA9IHJlcy5kYXRhXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvcHVibGljL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9