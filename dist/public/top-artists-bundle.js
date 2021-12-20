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

/***/ "./src/public/components/SelectableTabEls.ts":
/*!***************************************************!*\
  !*** ./src/public/components/SelectableTabEls.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
class SelectableTabEls {
    unselectEls() {
        if (this.btn && this.borderCover) {
            this.btn.classList.remove(config_1.config.CSS.CLASSES.selected);
            this.borderCover.classList.remove(config_1.config.CSS.CLASSES.selected);
        }
    }
    selectEls() {
        if (this.btn && this.borderCover) {
            this.btn.classList.add(config_1.config.CSS.CLASSES.selected);
            this.borderCover.classList.add(config_1.config.CSS.CLASSES.selected);
        }
    }
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
exports.default = SelectableTabEls;


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
exports.default = Album;


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
            <h3>${this.name}</h3>
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
                    <h3>Followers:</h3>
                    <p>${this.followerCount}</p>
                  </div>
                </button>
              </div>
            </div>
          `;
        return (0, config_1.htmlToEl)(html);
    }
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
    hasLoadedTopTracks() {
        return this.topTracks !== undefined;
    }
}
function generateArtistsFromData(datas, artistArr) {
    datas.forEach((data) => {
        artistArr.push(new Artist(data.id, data.name, data.genres, data.followers.total, data.external_urls.spotify, data.images));
    });
    return artistArr;
}
exports.generateArtistsFromData = generateArtistsFromData;
exports.default = Artist;


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
exports.default = AsyncSelectionVerif;


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
exports.default = Card;


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
exports.default = DoublyLinkedList;
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
    isShuffle: false
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
            (0, config_1.promiseHandler)(axios_1.default.request({ method: 'GET', url: config_1.config.URLs.getAccessToken }), (res) => {
                const NO_CONTENT = 204;
                if (res.status === NO_CONTENT || res.data === null) {
                    throw new Error('access token has no content');
                }
                else if (window.Spotify) {
                    // if the spotify sdk is already defined set player without setting onSpotifyWebPlaybackSDKReady meaning the window: Window is in a different scope
                    // use window.Spotify.Player as spotify namespace is declared in the Window interface as per DefinitelyTyped -> spotify-web-playback-sdk -> index.d.ts https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/spotify-web-playback-sdk
                    this.player = new window.Spotify.Player({
                        name: 'Spotify Info Web Player',
                        getOAuthToken: (cb) => {
                            // give the token to callback
                            cb(res.data);
                        },
                        volume: volume
                    });
                    this._addListeners(volume);
                    // Connect to the player!
                    this.player.connect();
                }
                else {
                    // of spotify sdk is undefined
                    window.onSpotifyWebPlaybackSDKReady = () => {
                        // if getting token was succesful create spotify player using the window in this scope
                        this.player = new window.Spotify.Player({
                            name: 'Spotify Info Web Player',
                            getOAuthToken: (cb) => {
                                // give the token to callback
                                cb(res.data);
                            },
                            volume: volume
                        });
                        this._addListeners(volume);
                        // Connect to the player!
                        this.player.connect();
                    };
                }
            });
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
        // there is no current node or the player is in shuffle mode
        if (currNode === null || (exports.playerPublicVars.isShuffle && !this.wasInShuffle)) {
            // (if the player has just been put into shuffle mode then there should be no previous playables to go back too)
            return;
        }
        // if an action is processing we cannot do anything
        if (!this.isExecutingAction) {
            this.player.getCurrentState().then((state) => {
                if (state.position > 1000) {
                    this.resetDuration();
                }
                else {
                    if (currNode.previous === null) {
                        return;
                    }
                    let prevTrackNode = currNode.previous;
                    if (!exports.playerPublicVars.isShuffle && this.wasInShuffle) {
                        prevTrackNode = this.unShuffle(-1);
                    }
                    const prevTrack = currNode.previous.data;
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
        // check to see if this is the last node or if an action is processing
        if (!this.isExecutingAction && currNode.next !== null) {
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
        this.webPlayerEl.setTitle(eventArg.currPlayable.title);
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
        const newNode = playableList.get(newNodeIdx + dir, true);
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
exports.default = EventAggregator;


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
exports.default = PlayableEventArg;


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
exports.default = Subscription;


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
function saveTerm(term, termType) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putTerm(term, termType)));
    });
}
exports.saveTerm = saveTerm;
/**
 * Get the index that points to the tab elements
 * @param term the term relating to the tab elements
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
    setTitle(title) {
        if (this.title === null) {
            throw new Error('Trying to set title before it is assigned');
        }
        this.title.textContent = title;
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
        <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap}">Select a Song</h4>
        <span id="${config_1.config.CSS.IDs.webPlayerArtists}"></span>
      </div>
      <div class="${config_1.config.CSS.CLASSES.webPlayerControls} ${config_1.config.CSS.CLASSES.column}">
        <div>
          <article id="web-player-buttons">
            <button id="${config_1.config.CSS.IDs.shuffle}"><img src="${config_1.config.PATHS.shuffleIcon}"/></button>
            <button id="${config_1.config.CSS.IDs.playPrev}" class="next-prev"><img src="${config_1.config.PATHS.playPrev}" alt="previous"/></button>
            <button id="${config_1.config.CSS.IDs.webPlayerPlayPause}" class="${config_1.config.CSS.CLASSES.playBtn}"></button>
            <button id="${config_1.config.CSS.IDs.playNext}" class="next-prev"><img src="${config_1.config.PATHS.playNext}" alt="next"/></button>
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
        this.title = (_e = webPlayerEl.getElementsByTagName('h4')[0]) !== null && _e !== void 0 ? _e : (0, config_1.throwExpression)('web player title element does not exist');
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
        shuffle === null || shuffle === void 0 ? void 0 : shuffle.addEventListener('click', () => {
            playback_sdk_1.playerPublicVars.isShuffle = !playback_sdk_1.playerPublicVars.isShuffle;
        });
        playPrev === null || playPrev === void 0 ? void 0 : playPrev.addEventListener('click', playPrevFunc);
        playNext === null || playNext === void 0 ? void 0 : playNext.addEventListener('click', playNextFunc);
        (_a = this.playPause) === null || _a === void 0 ? void 0 : _a.addEventListener('click', pauseFunc);
        (_b = this.songProgress) === null || _b === void 0 ? void 0 : _b.addEventListeners();
        (_c = this.volumeBar) === null || _c === void 0 ? void 0 : _c.addEventListeners();
    }
}
exports.default = SpotifyPlaybackElement;


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
                    <a href="${this.externalUrls.spotify}">
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
exports.default = Track;


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
exports.shuffle = exports.addItemsToPlaylist = exports.throwExpression = exports.getPixelPosInElOnClick = exports.animationControl = exports.removeAllChildNodes = exports.getValidImage = exports.capitalizeFirstLetter = exports.isEllipsisActive = exports.getTextWidth = exports.searchUl = exports.promiseHandler = exports.htmlToEl = exports.millisToMinutesAndSeconds = exports.config = void 0;
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const authEndpoint = 'https://accounts.spotify.com/authorize';
// Replace with your app's client ID, redirect URI and desired scopes
const redirectUri = 'http://localhost:3000';
const clientId = '434f5e9f442a4e4586e089a33f65c857';
const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
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
            shuffle: 'shuffle'
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
        auth: `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=code&show_dialog=true`,
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
        shuffleIconGreen: '/images/shuffle-icon-green.png'
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
    function intervalElementsTransitions(elementsToAnimate, classToTransitionToo, animationInterval) {
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
    /** Animates all elements that contain a certain class or id
     *
     * @param {string} elementsToAnimate - comma separated string containing the classes or ids of elements to animate INCLUDING prefix char.
     * @param {string} classToAdd - class to add EXCLUDING the prefix char.
     * @param {string} animationInterval - the interval to animate the given elements in milliseconds.
     */
    function animateAttributes(elementsToAnimate, classToAdd, animationInterval) {
        intervalElementsTransitions(elementsToAnimate, classToAdd, animationInterval);
    }
    return {
        animateAttributes
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
const HALF_HOUR = 1.8e6; /* 30 min in ms */
// if the user stays on the same page for 30 min refresh the token.
const startRefreshInterval = () => {
    console.log('start interval refresh');
    setInterval(() => {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putRefreshAccessToken));
        console.log('refresh async');
    }, HALF_HOUR);
};
function checkIfHasTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        let hasToken = false;
        // await promise resolve that returns whether the session has tokens.
        yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getHasTokens), (res) => {
            hasToken = res.data;
        });
        if (hasToken) {
            startRefreshInterval();
        }
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
                startRefreshInterval();
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
            config_1.animationControl.animateAttributes('.' + config_1.config.CSS.CLASSES.artist, config_1.config.CSS.CLASSES.appear, 25);
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/public/pages/top-artists-page/top-artists.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9TZWxlY3RhYmxlVGFiRWxzLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FsYnVtLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FydGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9hc3luY1NlbGVjdGlvblZlcmlmLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2NhcmQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3BsYXliYWNrLXNkay50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvYWdncmVnYXRvci50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL3N1YnNjcmlwdGlvbi50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zYXZlLWxvYWQtdGVybS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXliYWNrLWVsZW1lbnQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvdHJhY2sudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbmZpZy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvbWFuYWdlLXRva2Vucy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvcGFnZXMvdG9wLWFydGlzdHMtcGFnZS90b3AtYXJ0aXN0cy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvdXNlci1kYXRhLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBjb25maWcudHJhbnNpdGlvbmFsICYmIGNvbmZpZy50cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbDtcblxuICBpZiAodHJhbnNpdGlvbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWxpZGF0b3IuYXNzZXJ0T3B0aW9ucyh0cmFuc2l0aW9uYWwsIHtcbiAgICAgIHNpbGVudEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgZm9yY2VkSlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBjbGFyaWZ5VGltZW91dEVycm9yOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpXG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBza2lwcGVkIGludGVyY2VwdG9yc1xuICB2YXIgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdmFyIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHRydWU7XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGlmICh0eXBlb2YgaW50ZXJjZXB0b3IucnVuV2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnRlcmNlcHRvci5ydW5XaGVuKGNvbmZpZykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9yLnN5bmNocm9ub3VzO1xuXG4gICAgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoIXN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycykge1xuICAgIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG5cbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjaGFpbiwgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4pO1xuICAgIGNoYWluID0gY2hhaW4uY29uY2F0KHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbik7XG5cbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG5cbiAgdmFyIG5ld0NvbmZpZyA9IGNvbmZpZztcbiAgd2hpbGUgKHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHZhciBvbkZ1bGZpbGxlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdmFyIG9uUmVqZWN0ZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHRyeSB7XG4gICAgICBuZXdDb25maWcgPSBvbkZ1bGZpbGxlZChuZXdDb25maWcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvblJlamVjdGVkKGVycm9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcHJvbWlzZSA9IGRpc3BhdGNoUmVxdWVzdChuZXdDb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cblxuICB3aGlsZSAocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4ocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCksIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgIGNvbmZpZyxcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgY29uZmlnLFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIHZhciBjb250ZXh0ID0gdGhpcyB8fCBkZWZhdWx0cztcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4uY2FsbChjb250ZXh0LCBkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9jb3JlL2VuaGFuY2VFcnJvcicpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVNhZmVseShyYXdWYWx1ZSwgcGFyc2VyLCBlbmNvZGVyKSB7XG4gIGlmICh1dGlscy5pc1N0cmluZyhyYXdWYWx1ZSkpIHtcbiAgICB0cnkge1xuICAgICAgKHBhcnNlciB8fCBKU09OLnBhcnNlKShyYXdWYWx1ZSk7XG4gICAgICByZXR1cm4gdXRpbHMudHJpbShyYXdWYWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubmFtZSAhPT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoZW5jb2RlciB8fCBKU09OLnN0cmluZ2lmeSkocmF3VmFsdWUpO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cbiAgdHJhbnNpdGlvbmFsOiB7XG4gICAgc2lsZW50SlNPTlBhcnNpbmc6IHRydWUsXG4gICAgZm9yY2VkSlNPTlBhcnNpbmc6IHRydWUsXG4gICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogZmFsc2VcbiAgfSxcblxuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpIHx8IChoZWFkZXJzICYmIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID09PSAnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHJldHVybiBzdHJpbmdpZnlTYWZlbHkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICB2YXIgdHJhbnNpdGlvbmFsID0gdGhpcy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwa2cgPSByZXF1aXJlKCcuLy4uLy4uL3BhY2thZ2UuanNvbicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xudmFyIGN1cnJlbnRWZXJBcnIgPSBwa2cudmVyc2lvbi5zcGxpdCgnLicpO1xuXG4vKipcbiAqIENvbXBhcmUgcGFja2FnZSB2ZXJzaW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gdGhhblZlcnNpb25cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uLCB0aGFuVmVyc2lvbikge1xuICB2YXIgcGtnVmVyc2lvbkFyciA9IHRoYW5WZXJzaW9uID8gdGhhblZlcnNpb24uc3BsaXQoJy4nKSA6IGN1cnJlbnRWZXJBcnI7XG4gIHZhciBkZXN0VmVyID0gdmVyc2lvbi5zcGxpdCgnLicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGlmIChwa2dWZXJzaW9uQXJyW2ldID4gZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChwa2dWZXJzaW9uQXJyW2ldIDwgZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvclxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgdmFyIGlzRGVwcmVjYXRlZCA9IHZlcnNpb24gJiYgaXNPbGRlclZlcnNpb24odmVyc2lvbik7XG5cbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIHBrZy52ZXJzaW9uICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkIGluICcgKyB2ZXJzaW9uKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGVwcmVjYXRlZCAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNPbGRlclZlcnNpb246IGlzT2xkZXJWZXJzaW9uLFxuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5cclxuY2xhc3MgU2VsZWN0YWJsZVRhYkVscyB7XHJcbiAgYnRuOiBFbGVtZW50IHwgdW5kZWZpbmVkO1xyXG4gIGJvcmRlckNvdmVyOiBFbGVtZW50IHwgdW5kZWZpbmVkO1xyXG5cclxuICBwcml2YXRlIHVuc2VsZWN0RWxzICgpIHtcclxuICAgIGlmICh0aGlzLmJ0biAmJiB0aGlzLmJvcmRlckNvdmVyKSB7XHJcbiAgICAgIHRoaXMuYnRuLmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgICB0aGlzLmJvcmRlckNvdmVyLmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZWxlY3RFbHMgKCkge1xyXG4gICAgaWYgKHRoaXMuYnRuICYmIHRoaXMuYm9yZGVyQ292ZXIpIHtcclxuICAgICAgdGhpcy5idG4uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgIHRoaXMuYm9yZGVyQ292ZXIuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2VsZWN0TmV3VGFiIChidG46IEVsZW1lbnQsIGJvcmRlckNvdmVyOiBFbGVtZW50KSB7XHJcbiAgICAvLyB1bnNlbGVjdCB0aGUgcHJldmlvdXMgdGFiXHJcbiAgICB0aGlzLnVuc2VsZWN0RWxzKClcclxuXHJcbiAgICAvLyByZWFzc2lnbiB0aGUgbmV3IHRhYiBlbGVtZW50c1xyXG4gICAgdGhpcy5idG4gPSBidG5cclxuICAgIHRoaXMuYm9yZGVyQ292ZXIgPSBib3JkZXJDb3ZlclxyXG5cclxuICAgIC8vIHNlbGVjdCB0aGUgbmV3IHRhYlxyXG4gICAgdGhpcy5zZWxlY3RFbHMoKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2VsZWN0YWJsZVRhYkVsc1xyXG4iLCJjbGFzcyBBbGJ1bSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGV4dGVybmFsVXJsOiBzdHJpbmc7XHJcbiAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgZXh0ZXJuYWxVcmw6IHN0cmluZykge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5leHRlcm5hbFVybCA9IGV4dGVybmFsVXJsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBbGJ1bVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIGh0bWxUb0VsLCBnZXRWYWxpZEltYWdlIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgVHJhY2ssIHsgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSB9IGZyb20gJy4vdHJhY2snXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QgZnJvbSAnLi9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCB7IEFydGlzdERhdGEsIFNwb3RpZnlJbWcgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY2xhc3MgQXJ0aXN0IGV4dGVuZHMgQ2FyZCB7XHJcbiAgYXJ0aXN0SWQ6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgZ2VucmVzOiBBcnJheTxzdHJpbmc+O1xyXG4gIGZvbGxvd2VyQ291bnQ6IHN0cmluZztcclxuICBleHRlcm5hbFVybDogc3RyaW5nO1xyXG4gIGltYWdlVXJsOiBzdHJpbmc7XHJcbiAgdG9wVHJhY2tzOiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IHVuZGVmaW5lZDtcclxuXHJcbiAgY29uc3RydWN0b3IgKGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZ2VucmVzOiBBcnJheTxzdHJpbmc+LCBmb2xsb3dlckNvdW50OiBzdHJpbmcsIGV4dGVybmFsVXJsOiBzdHJpbmcsIGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuYXJ0aXN0SWQgPSBpZFxyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5nZW5yZXMgPSBnZW5yZXNcclxuICAgIHRoaXMuZm9sbG93ZXJDb3VudCA9IGZvbGxvd2VyQ291bnRcclxuICAgIHRoaXMuZXh0ZXJuYWxVcmwgPSBleHRlcm5hbFVybFxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqICBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgYXJ0aXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgZ2V0QXJ0aXN0SHRtbCAoaWR4OiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0UHJlZml4fSR7aWR4fWBcclxuXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBsZXQgZ2VucmVMaXN0ID0gJydcclxuICAgIHRoaXMuZ2VucmVzLmZvckVhY2goKGdlbnJlKSA9PiB7XHJcbiAgICAgIGdlbnJlTGlzdCArPSAnPGxpPicgKyBnZW5yZSArICc8L2xpPidcclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdH0gJHtjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUlufVwiIGlkPVwiJHt0aGlzLmNhcmRJZH1cIj5cclxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNvbnRlbnR9XCI+XHJcbiAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiYXJ0aXN0LWJhc2VcIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9JHt0aGlzLmltYWdlVXJsfSBhbHQ9XCJBcnRpc3RcIi8+XHJcbiAgICAgICAgICAgIDxoMz4ke3RoaXMubmFtZX08L2gzPlxyXG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJnZW5yZXNcIj5cclxuICAgICAgICAgICAgICAke2dlbnJlTGlzdH1cclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIDwvaGVhZGVyPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrc0FyZWF9XCI+XHJcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuYXJ0aXN0VG9wVHJhY2tzfVwiPlxyXG4gICAgICAgICAgICAgIDxoZWFkZXI+XHJcbiAgICAgICAgICAgICAgICA8aDQ+VG9wIFRyYWNrczwvaDQ+XHJcbiAgICAgICAgICAgICAgPC9oZWFkZXI+XHJcbiAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsQmFyfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja0xpc3R9XCI+XHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2R1Y2VzIHRoZSBjYXJkIGVsZW1lbnQgb2YgdGhpcyBhcnRpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRBcnRpc3RDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSk6IE5vZGUge1xyXG4gICAgY29uc3QgaWQgPSBgJHtjb25maWcuQ1NTLklEcy5hcnRpc3RQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucmFua0NhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW5cclxuICAgIH0gJHthcHBlYXJDbGFzc31cIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3R9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEZyb250XHJcbiAgICAgICAgICAgICAgICAgIH1cIiAgdGl0bGU9XCJDbGljayB0byB2aWV3IG1vcmUgSW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlVXJsfVwiIGFsdD1cIkFsYnVtIENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIH1cIj4ke3RoaXMubmFtZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5Gb2xsb3dlcnM6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMuZm9sbG93ZXJDb3VudH08L3A+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRUb3BUcmFja3MgKCkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEFydGlzdFRvcFRyYWNrcyh0aGlzLmFydGlzdElkKSlcclxuICAgIGNvbnN0IHRyYWNrc0RhdGEgPSByZXMuZGF0YS50cmFja3NcclxuICAgIGNvbnN0IHRyYWNrT2JqcyA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPigpXHJcblxyXG4gICAgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSh0cmFja3NEYXRhLCB0cmFja09ianMpXHJcblxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB0cmFja09ianNcclxuICAgIHJldHVybiB0cmFja09ianNcclxuICB9XHJcblxyXG4gIGhhc0xvYWRlZFRvcFRyYWNrcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b3BUcmFja3MgIT09IHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQXJ0aXN0c0Zyb21EYXRhIChkYXRhczogQXJyYXk8QXJ0aXN0RGF0YT4sIGFydGlzdEFycjogQXJyYXk8QXJ0aXN0Pikge1xyXG4gIGRhdGFzLmZvckVhY2goKGRhdGE6IEFydGlzdERhdGEpID0+IHtcclxuICAgIGFydGlzdEFyci5wdXNoKFxyXG4gICAgICBuZXcgQXJ0aXN0KFxyXG4gICAgICAgIGRhdGEuaWQsXHJcbiAgICAgICAgZGF0YS5uYW1lLFxyXG4gICAgICAgIGRhdGEuZ2VucmVzLFxyXG4gICAgICAgIGRhdGEuZm9sbG93ZXJzLnRvdGFsLFxyXG4gICAgICAgIGRhdGEuZXh0ZXJuYWxfdXJscy5zcG90aWZ5LFxyXG4gICAgICAgIGRhdGEuaW1hZ2VzXHJcbiAgICAgIClcclxuICAgIClcclxuICB9KVxyXG4gIHJldHVybiBhcnRpc3RBcnJcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0XHJcbiIsImNsYXNzIEFzeW5jU2VsZWN0aW9uVmVyaWY8VD4ge1xyXG4gIHByaXZhdGUgX2N1cnJTZWxlY3RlZFZhbDogVCB8IG51bGw7XHJcbiAgaGFzTG9hZGVkQ3VyclNlbGVjdGVkOiBib29sZWFuO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLl9jdXJyU2VsZWN0ZWRWYWwgPSBudWxsXHJcblxyXG4gICAgLy8gdXNlZCB0byBlbnN1cmUgdGhhdCBhbiBvYmplY3QgdGhhdCBoYXMgbG9hZGVkIHdpbGwgbm90IGJlIGxvYWRlZCBhZ2FpblxyXG4gICAgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnJTZWxlY3RlZFZhbE5vTnVsbCAoKTogVCB7XHJcbiAgICBpZiAoIXRoaXMuX2N1cnJTZWxlY3RlZFZhbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZSBpcyBhY2Nlc3NlZCB3aXRob3V0IGJlaW5nIGFzc2lnbmVkJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9jdXJyU2VsZWN0ZWRWYWxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldCBjdXJyU2VsZWN0ZWRWYWwgKCk6IFQgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9jdXJyU2VsZWN0ZWRWYWxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZSB0aGUgdmFsdWUgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBhbmQgcmVzZXQgdGhlIGhhcyBsb2FkZWQgYm9vbGVhbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VH0gY3VyclNlbGVjdGVkVmFsIHRoZSB2YWx1ZSB0byBjaGFuZ2UgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZSB0b28uXHJcbiAgICovXHJcbiAgc2VsZWN0aW9uQ2hhbmdlZCAoY3VyclNlbGVjdGVkVmFsOiBUKSB7XHJcbiAgICB0aGlzLl9jdXJyU2VsZWN0ZWRWYWwgPSBjdXJyU2VsZWN0ZWRWYWxcclxuICAgIHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkID0gZmFsc2VcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyB0byBzZWUgaWYgYSBzZWxlY3RlZCB2YWx1ZSBwb3N0IGxvYWQgaXMgdmFsaWQgYnlcclxuICAgKiBjb21wYXJpbmcgaXQgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZSBhbmQgdmVyaWZ5aW5nIHRoYXRcclxuICAgKiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGhhcyBub3QgYWxyZWFkeSBiZWVuIGxvYWRlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VH0gcG9zdExvYWRWYWwgZGF0YSB0aGF0IGhhcyBiZWVuIGxvYWRlZFxyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSB3aGV0aGVyIHRoZSBsb2FkZWQgc2VsZWN0aW9uIGlzIHZhbGlkXHJcbiAgICovXHJcbiAgaXNWYWxpZCAocG9zdExvYWRWYWw6IFQpOiBib29sZWFuIHtcclxuICAgIGlmICh0aGlzLl9jdXJyU2VsZWN0ZWRWYWwgIT09IHBvc3RMb2FkVmFsIHx8IHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gaWYgaXMgdmFsaWQgdGhlbiB3ZSBhc3N1bWUgdGhhdCB0aGlzIHZhbHVlIHdpbGwgYmUgbG9hZGVkXHJcbiAgICAgIHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkID0gdHJ1ZVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXN5bmNTZWxlY3Rpb25WZXJpZlxyXG4iLCJjbGFzcyBDYXJkIHtcclxuICBjYXJkSWQ6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5jYXJkSWQgPSAnJ1xyXG4gIH1cclxuXHJcbiAgZ2V0Q2FyZElkICgpIHtcclxuICAgIGlmICh0aGlzLmNhcmRJZCA9PT0gJ251bGwnKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FyZCBpZCB3YXMgYXNraW5nIHRvIGJlIHJldHJpZXZlZCBidXQgaXMgbnVsbCcpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5jYXJkSWRcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhcmRcclxuIiwiLyogQ29weXJpZ2h0IChjKSAyMDA5IE5pY2hvbGFzIEMuIFpha2FzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAqL1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBzaW5nbGUgbm9kZSBpbiBhIERvdWJseUxpbmtlZExpc3QuXHJcbiAqIEBjbGFzcyBEb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHtcclxuICBkYXRhOiBUO1xyXG4gIG5leHQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIHByZXZpb3VzOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb3VibHlMaW5rZWRMaXN0Tm9kZS5cclxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgdG8gc3RvcmUgaW4gdGhlIG5vZGUuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKGRhdGE6IFQpIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRhdGEgdGhhdCB0aGlzIG5vZGUgc3RvcmVzLlxyXG4gICAgICogQHByb3BlcnR5IGRhdGFcclxuICAgICAqIEB0eXBlICpcclxuICAgICAqL1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBwb2ludGVyIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIERvdWJseUxpbmtlZExpc3QuXHJcbiAgICAgKiBAcHJvcGVydHkgbmV4dFxyXG4gICAgICogQHR5cGUgP0RvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAgICAgKi9cclxuICAgIHRoaXMubmV4dCA9IG51bGxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcG9pbnRlciB0byB0aGUgcHJldmlvdXMgbm9kZSBpbiB0aGUgRG91Ymx5TGlua2VkTGlzdC5cclxuICAgICAqIEBwcm9wZXJ0eSBwcmV2aW91c1xyXG4gICAgICogQHR5cGUgP0RvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAgICAgKi9cclxuICAgIHRoaXMucHJldmlvdXMgPSBudWxsXHJcbiAgfVxyXG59XHJcbi8qKlxyXG4gKiBBIGRvdWJseSBsaW5rZWQgbGlzdCBpbXBsZW1lbnRhdGlvbiBpbiBKYXZhU2NyaXB0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdFxyXG4gKi9cclxuY2xhc3MgRG91Ymx5TGlua2VkTGlzdDxUPiB7XHJcbiAgaGVhZDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgdGFpbDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb3VibHlMaW5rZWRMaXN0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgLy8gcG9pbnRlciB0byBmaXJzdCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICB0aGlzLmhlYWQgPSBudWxsXHJcblxyXG4gICAgLy8gcG9pbnRlciB0byBsYXN0IG5vZGUgaW4gdGhlIGxpc3Qgd2hpY2ggcG9pbnRzIHRvIG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZHMgc29tZSBkYXRhIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKi9cclxuICBhZGQgKGRhdGE6IFQpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+KGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgLypcclxuICAgICAgICogQmVjYXVzZSB0aGVyZSBhcmUgbm8gbm9kZXMgaW4gdGhlIGxpc3QsIGp1c3Qgc2V0IHRoZVxyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBwb2ludGVyIHRvIHRoZSBuZXcgbm9kZS5cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaGVhZCA9IG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFVubGlrZSBpbiBhIHNpbmdseSBsaW5rZWQgbGlzdCwgd2UgaGF2ZSBhIGRpcmVjdCByZWZlcmVuY2UgdG9cclxuICAgICAgICogdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gU2V0IHRoZSBgbmV4dGAgcG9pbnRlciBvZiB0aGVcclxuICAgICAgICogY3VycmVudCBsYXN0IG5vZGUgdG8gYG5ld05vZGVgIGluIG9yZGVyIHRvIGFwcGVuZCB0aGUgbmV3IGRhdGFcclxuICAgICAgICogdG8gdGhlIGVuZCBvZiB0aGUgbGlzdC4gVGhlbiwgc2V0IGBuZXdOb2RlLnByZXZpb3VzYCB0byB0aGUgY3VycmVudFxyXG4gICAgICAgKiB0YWlsIHRvIGVuc3VyZSBiYWNrd2FyZHMgdHJhY2tpbmcgd29yay5cclxuICAgICAgICovXHJcbiAgICAgIGlmICh0aGlzLnRhaWwgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwubmV4dCA9IG5ld05vZGVcclxuICAgICAgfVxyXG4gICAgICBuZXdOb2RlLnByZXZpb3VzID0gdGhpcy50YWlsXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIExhc3QsIHJlc2V0IGB0aGlzLnRhaWxgIHRvIGBuZXdOb2RlYCB0byBlbnN1cmUgd2UgYXJlIHN0aWxsXHJcbiAgICAgKiB0cmFja2luZyB0aGUgbGFzdCBub2RlIGNvcnJlY3RseS5cclxuICAgICAqL1xyXG4gICAgdGhpcy50YWlsID0gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBzb21lIGRhdGEgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBsaXN0LiBUaGlzIG1ldGhvZCB0cmF2ZXJzZXNcclxuICAgKiB0aGUgZXhpc3RpbmcgbGlzdCBhbmQgcGxhY2VzIHRoZSBkYXRhIGluIGEgbmV3IG5vZGUgYXQgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBhdCB3aGljaCB0byBpbnNlcnQgdGhlIGRhdGEuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGluZGV4IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgaW5zZXJ0QmVmb3JlIChkYXRhOiBULCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgaW5zZXJ0ZWQgaW50byB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZShkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBTcGVjaWFsIGNhc2U6IGlmIGBpbmRleGAgaXMgYDBgLCB0aGVuIG5vIHRyYXZlcnNhbCBpcyBuZWVkZWRcclxuICAgICAqIGFuZCB3ZSBuZWVkIHRvIHVwZGF0ZSBgdGhpcy5oZWFkYCB0byBwb2ludCB0byBgbmV3Tm9kZWAuXHJcbiAgICAgKi9cclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBFbnN1cmUgdGhlIG5ldyBub2RlJ3MgYG5leHRgIHByb3BlcnR5IGlzIHBvaW50ZWQgdG8gdGhlIGN1cnJlbnRcclxuICAgICAgICogaGVhZC5cclxuICAgICAgICovXHJcbiAgICAgIG5ld05vZGUubmV4dCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGN1cnJlbnQgaGVhZCdzIGBwcmV2aW91c2AgcHJvcGVydHkgbmVlZHMgdG8gcG9pbnQgdG8gdGhlIG5ld1xyXG4gICAgICAgKiBub2RlIHRvIGVuc3VyZSB0aGUgbGlzdCBpcyB0cmF2ZXJzYWJsZSBiYWNrd2FyZHMuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQucHJldmlvdXMgPSBuZXdOb2RlXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBOb3cgaXQncyBzYWZlIHRvIHNldCBgdGhpcy5oZWFkYCB0byB0aGUgbmV3IG5vZGUsIGVmZmVjdGl2ZWx5XHJcbiAgICAgICAqIG1ha2luZyB0aGUgbmV3IG5vZGUgdGhlIGZpcnN0IG5vZGUgaW4gdGhlIGxpc3QuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgICAqIGdvbmUuIFRoaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBpID0gMFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgdXNpbmcgYG5leHRgIHBvaW50ZXJzLCBhbmQgbWFrZVxyXG4gICAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAgICogYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0b1xyXG4gICAgICAgKiBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQubmV4dCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgICAgaSsrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEF0IHRoaXMgcG9pbnQsIGBjdXJyZW50YCBpcyBlaXRoZXIgdGhlIG5vZGUgdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YVxyXG4gICAgICAgKiBiZWZvcmUsIG9yIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFRoZSBvbmx5IHdheSB0byB0ZWxsIGlzIGlmXHJcbiAgICAgICAqIGBpYCBpcyBzdGlsbCBsZXNzIHRoYW4gYGluZGV4YCwgdGhhdCBtZWFucyB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlXHJcbiAgICAgICAqIGFuZCBhbiBlcnJvciBzaG91bGQgYmUgdGhyb3duLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKGkgPCBpbmRleCkge1xyXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBJZiBjb2RlIGNvbnRpbnVlcyB0byBleGVjdXRlIGhlcmUsIGl0IG1lYW5zIGBjdXJyZW50YCBpcyB0aGUgbm9kZVxyXG4gICAgICAgKiB0byBpbnNlcnQgbmV3IGRhdGEgYmVmb3JlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBGaXJzdCwgaW5zZXJ0IGBuZXdOb2RlYCBhZnRlciBgY3VycmVudC5wcmV2aW91c2AgYnkgdXBkYXRpbmdcclxuICAgICAgICogYGN1cnJlbnQucHJldmlvdXMubmV4dGAgYW5kIGBuZXdOb2RlLnByZXZpb3VzYC5cclxuICAgICAgICovXHJcbiAgICAgIGN1cnJlbnQhLnByZXZpb3VzIS5uZXh0ID0gbmV3Tm9kZVxyXG4gICAgICBuZXdOb2RlIS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIE5leHQsIGluc2VydCBgY3VycmVudGAgYWZ0ZXIgYG5ld05vZGVgIGJ5IHVwZGF0aW5nIGBuZXdOb2RlLm5leHRgIGFuZFxyXG4gICAgICAgKiBgY3VycmVudC5wcmV2aW91c2AuXHJcbiAgICAgICAqL1xyXG4gICAgICBuZXdOb2RlLm5leHQgPSBjdXJyZW50XHJcbiAgICAgIGN1cnJlbnQucHJldmlvdXMgPSBuZXdOb2RlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnNlcnRzIHNvbWUgZGF0YSBpbnRvIHRoZSBtaWRkbGUgb2YgdGhlIGxpc3QuIFRoaXMgbWV0aG9kIHRyYXZlcnNlc1xyXG4gICAqIHRoZSBleGlzdGluZyBsaXN0IGFuZCBwbGFjZXMgdGhlIGRhdGEgaW4gYSBuZXcgbm9kZSBhZnRlciBhIHNwZWNpZmljIGluZGV4LlxyXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IGFmdGVyIHdoaWNoIHRvIGluc2VydCB0aGUgZGF0YS5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiB0aGUgaW5kZXggZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBpbnNlcnRBZnRlciAoZGF0YTogVCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGUoZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGFkZCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQgYW5kIHVwZGF0ZVxyXG4gICAgICogdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpbiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIGluc2VydCB0aGUgbmV3IGRhdGEuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgIGkrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgaXMgZWl0aGVyIHRoZSBub2RlIHRvIGluc2VydCB0aGUgbmV3IGRhdGFcclxuICAgICAqIGJlZm9yZSwgb3IgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gVGhlIG9ubHkgd2F5IHRvIHRlbGwgaXMgaWZcclxuICAgICAqIGBpYCBpcyBzdGlsbCBsZXNzIHRoYW4gYGluZGV4YCwgdGhhdCBtZWFucyB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlXHJcbiAgICAgKiBhbmQgYW4gZXJyb3Igc2hvdWxkIGJlIHRocm93bi5cclxuICAgICAqL1xyXG4gICAgaWYgKGkgPCBpbmRleCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgY29kZSBjb250aW51ZXMgdG8gZXhlY3V0ZSBoZXJlLCBpdCBtZWFucyBgY3VycmVudGAgaXMgdGhlIG5vZGVcclxuICAgICAqIHRvIGluc2VydCBuZXcgZGF0YSBhZnRlci5cclxuICAgICAqL1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogYGN1cnJlbnRgIGlzIHRoZSB0YWlsLCBzbyByZXNldCBgdGhpcy50YWlsYFxyXG4gICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICB0aGlzLnRhaWwgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBPdGhlcndpc2UsIGluc2VydCBgbmV3Tm9kZWAgYmVmb3JlIGBjdXJyZW50Lm5leHRgIGJ5IHVwZGF0aW5nXHJcbiAgICAgICAqIGBjdXJyZW50Lm5leHQucHJldmlvdXNgIGFuZCBgbmV3Tm9kZS5ub2RlYC5cclxuICAgICAgICovXHJcbiAgICAgIGN1cnJlbnQhLm5leHQhLnByZXZpb3VzID0gbmV3Tm9kZVxyXG4gICAgICBuZXdOb2RlLm5leHQgPSBjdXJyZW50IS5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIE5leHQsIGluc2VydCBgbmV3Tm9kZWAgYWZ0ZXIgYGN1cnJlbnRgIGJ5IHVwZGF0aW5nIGBuZXdOb2RlLnByZXZpb3VzYCBhbmRcclxuICAgICAqIGBjdXJyZW50Lm5leHRgLlxyXG4gICAgICovXHJcbiAgICBuZXdOb2RlLnByZXZpb3VzID0gY3VycmVudFxyXG4gICAgY3VycmVudCEubmV4dCA9IG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBub2RlIHdob3NlIGRhdGFcclxuICAgKiAgICAgIHNob3VsZCBiZSByZXR1cm5lZC5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGRhdGEgaW4gdGhlIFwiZGF0YVwiIHBvcnRpb24gb2YgdGhlIGdpdmVuIG5vZGVcclxuICAgKiAgICAgIG9yIHVuZGVmaW5lZCBpZiB0aGUgbm9kZSBkb2Vzbid0IGV4aXN0LlxyXG4gICAqL1xyXG4gIGdldCAoaW5kZXg6IG51bWJlciwgYXNOb2RlOiBib29sZWFuKTogVCB8IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHtcclxuICAgIC8vIGVuc3VyZSBgaW5kZXhgIGlzIGEgcG9zaXRpdmUgdmFsdWVcclxuICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGkgPSAwXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcywgYnV0IG1ha2Ugc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55XHJcbiAgICAgICAqIG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGUgdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpblxyXG4gICAgICAgKiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW4gYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zXHJcbiAgICAgICAqIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0byBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgbWlnaHQgYmUgbnVsbCBpZiB3ZSd2ZSBnb25lIHBhc3QgdGhlXHJcbiAgICAgICAqIGVuZCBvZiB0aGUgbGlzdC4gSW4gdGhhdCBjYXNlLCB3ZSByZXR1cm4gYHVuZGVmaW5lZGAgdG8gaW5kaWNhdGVcclxuICAgICAgICogdGhhdCB0aGUgbm9kZSBhdCBgaW5kZXhgIHdhcyBub3QgZm91bmQuIElmIGBjdXJyZW50YCBpcyBub3RcclxuICAgICAgICogYG51bGxgLCB0aGVuIGl0J3Mgc2FmZSB0byByZXR1cm4gYGN1cnJlbnQuZGF0YWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgIGlmIChhc05vZGUpIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGluZGV4ICR7aW5kZXh9IG91dCBvZiByYW5nZWApXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbmRleCAke2luZGV4fSBvdXQgb2YgcmFuZ2VgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBpbmRleCBvZiB0aGUgZGF0YSBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gc2VhcmNoIGZvci5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBkYXRhIGluIHRoZSBsaXN0XHJcbiAgICogICAgICBvciAtMSBpZiBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgaW5kZXhPZiAoZGF0YTogVCk6IG51bWJlciB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMgYGRhdGFgLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyBgaW5kZXhgIGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoY3VycmVudC5kYXRhID09PSBkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8ga2VlcCB0cmFjayBvZiB3aGVyZSB3ZSBhcmVcclxuICAgICAgaW5kZXgrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIC0xIGFzIHRoZSBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gLTFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWF0Y2hlciBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIHdoZW4gYW4gaXRlbSBtYXRjaGVzXHJcbiAgICogICAgICBhbmQgZmFsc2Ugd2hlbiBhbiBpdGVtIGRvZXNuJ3QgbWF0Y2guXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBmaXJzdCBpdGVtIHRoYXQgcmV0dXJucyB0cnVlIGZyb20gdGhlIG1hdGNoZXIsIHVuZGVmaW5lZFxyXG4gICAqICAgICAgaWYgbm8gaXRlbXMgbWF0Y2guXHJcbiAgICovXHJcbiAgZmluZCAobWF0Y2hlcjogKGFyZzA6IFQpID0+IGJvb2xlYW4sIGFzTm9kZSA9IGZhbHNlKSA6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgVCB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgZGF0YSBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIGlmIChhc05vZGUpIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gYHVuZGVmaW5lZGAgYXMgdGhlXHJcbiAgICAgKiBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignTm8gbWF0Y2hpbmcgZGF0YSBmb3VuZCcpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXRjaGVyIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgd2hlbiBhbiBpdGVtIG1hdGNoZXNcclxuICAgKiAgICAgIGFuZCBmYWxzZSB3aGVuIGFuIGl0ZW0gZG9lc24ndCBtYXRjaC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb25cclxuICAgKiAgICAgIG9yIC0xIGlmIHRoZXJlIGFyZSBubyBtYXRjaGluZyBpdGVtcy5cclxuICAgKi9cclxuICBmaW5kSW5kZXggKG1hdGNoZXI6IChhcmcwOiBUKSA9PiBib29sZWFuKTogbnVtYmVyIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIHRoZSBpbmRleCBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hlcmUgd2UgYXJlXHJcbiAgICAgIGluZGV4KytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiAtMSBhcyB0aGVcclxuICAgICAqIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiAtMVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB0aGUgbm9kZSBmcm9tIHRoZSBnaXZlbiBsb2NhdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG5vZGUgdG8gcmVtb3ZlLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgaW5kZXggaXMgb3V0IG9mIHJhbmdlLlxyXG4gICAqL1xyXG4gIHJlbW92ZSAoaW5kZXg6IG51bWJlcikgOiBUIHtcclxuICAgIC8vIHNwZWNpYWwgY2FzZXM6IG5vIG5vZGVzIGluIHRoZSBsaXN0IG9yIGBpbmRleGAgaXMgbmVnYXRpdmVcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwgfHwgaW5kZXggPCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogcmVtb3ZpbmcgdGhlIGZpcnN0IG5vZGVcclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvLyBzdG9yZSB0aGUgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGhlYWRcclxuICAgICAgY29uc3QgZGF0YTogVCA9IHRoaXMuaGVhZC5kYXRhXHJcblxyXG4gICAgICAvLyBqdXN0IHJlcGxhY2UgdGhlIGhlYWQgd2l0aCB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXh0XHJcblxyXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHRoZXJlIHdhcyBvbmx5IG9uZSBub2RlLCBzbyBhbHNvIHJlc2V0IGB0aGlzLnRhaWxgXHJcbiAgICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbnVsbFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdGhlIGRhdGEgYXQgdGhlIHByZXZpb3VzIGhlYWQgb2YgdGhlIGxpc3RcclxuICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGdldCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGVcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8gaW5jcmVtZW50IHRoZSBjb3VudFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgYGN1cnJlbnRgIGlzbid0IGBudWxsYCwgdGhlbiB0aGF0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBub2RlXHJcbiAgICAgKiB0byByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIHNraXAgb3ZlciB0aGUgbm9kZSB0byByZW1vdmVcclxuICAgICAgY3VycmVudCEucHJldmlvdXMhLm5leHQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIElmIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSBgdGhpcy50YWlsYC5cclxuICAgICAgICpcclxuICAgICAgICogSWYgd2UgYXJlIG5vdCBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSB0aGUgYmFja3dhcmRzXHJcbiAgICAgICAqIHBvaW50ZXIgZm9yIGBjdXJyZW50Lm5leHRgIHRvIHByZXNlcnZlIHJldmVyc2UgdHJhdmVyc2FsLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICAgIHRoaXMudGFpbCA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHRoZSB2YWx1ZSB0aGF0IHdhcyBqdXN0IHJlbW92ZWQgZnJvbSB0aGUgbGlzdFxyXG4gICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIHdlJ3ZlIG1hZGUgaXQgdGhpcyBmYXIsIGl0IG1lYW5zIGBpbmRleGAgaXMgYSB2YWx1ZSB0aGF0XHJcbiAgICAgKiBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LCBzbyB0aHJvdyBhbiBlcnJvci5cclxuICAgICAqL1xyXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFsbCBub2RlcyBmcm9tIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqL1xyXG4gIGNsZWFyICgpOiB2b2lkIHtcclxuICAgIC8vIGp1c3QgcmVzZXQgYm90aCB0aGUgaGVhZCBhbmQgdGFpbCBwb2ludGVyIHRvIG51bGxcclxuICAgIHRoaXMuaGVhZCA9IG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBub2RlcyBpbiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIG5vZGVzIGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGdldCBzaXplICgpOiBudW1iZXIge1xyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiB0aGUgbGlzdCBpcyBlbXB0eVxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gMFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGNvdW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZVxyXG4gICAgICogYmVlbiB2aXNpdGVkIGluc2lkZSB0aGUgbG9vcCBiZWxvdy4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzXHJcbiAgICAgKiBpcyB0aGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBjb3VudCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhhdCBtZWFucyB3ZSdyZSBub3QgeWV0IGF0IHRoZVxyXG4gICAgICogZW5kIG9mIHRoZSBsaXN0LCBzbyBhZGRpbmcgMSB0byBgY291bnRgIGFuZCB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBjb3VudCsrXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogV2hlbiBgY3VycmVudGAgaXMgYG51bGxgLCB0aGUgbG9vcCBpcyBleGl0ZWQgYXQgdGhlIHZhbHVlIG9mIGBjb3VudGBcclxuICAgICAqIGlzIHRoZSBudW1iZXIgb2Ygbm9kZXMgdGhhdCB3ZXJlIGNvdW50ZWQgaW4gdGhlIGxvb3AuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiBjb3VudFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRlZmF1bHQgaXRlcmF0b3IgZm9yIHRoZSBjbGFzcy5cclxuICAgKiBAcmV0dXJucyB7SXRlcmF0b3J9IEFuIGl0ZXJhdG9yIGZvciB0aGUgY2xhc3MuXHJcbiAgICovXHJcbiAgW1N5bWJvbC5pdGVyYXRvcl0gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpdGVyYXRvciB0aGF0IHJldHVybnMgZWFjaCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtHZW5lcmF0b3J9IEFuIGl0ZXJhdG9yIG9uIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gICogdmFsdWVzICgpOiBHZW5lcmF0b3I8VCwgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGVyZSBpcyBhIHBpZWNlIG9mIGRhdGFcclxuICAgICAqIHRvIHlpZWxkLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICB5aWVsZCBjdXJyZW50LmRhdGFcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuIGl0ZXJhdG9yIHRoYXQgcmV0dXJucyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgaW4gcmV2ZXJzZSBvcmRlci5cclxuICAgKiBAcmV0dXJucyB7R2VuZXJhdG9yfSBBbiBpdGVyYXRvciBvbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICAqIHJldmVyc2UgKCk6IEdlbmVyYXRvcjxULCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIHRhaWwgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy50YWlsXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoZXJlIGlzIGEgcGllY2Ugb2YgZGF0YVxyXG4gICAgICogdG8geWllbGQuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIHlpZWxkIGN1cnJlbnQuZGF0YVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhlIGxpc3QgaW50byBhIHN0cmluZyByZXByZXNlbnRhdGlvbi5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGlzdC5cclxuICAgKi9cclxuICB0b1N0cmluZyAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBbLi4udGhpc10udG9TdHJpbmcoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhlIGRvdWJseSBsaW5rZWQgbGlzdCB0byBhbiBhcnJheS5cclxuICAgKiBAcmV0dXJucyB7QXJyYXk8VD59IEFuIGFycmF5IG9mIHRoZSBkYXRhIGZyb20gdGhlIGxpbmtlZCBsaXN0LlxyXG4gICAqL1xyXG4gIHRvQXJyYXkgKCk6IEFycmF5PFQ+IHtcclxuICAgIHJldHVybiBbLi4udGhpc11cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERvdWJseUxpbmtlZExpc3RcclxuZXhwb3J0IGZ1bmN0aW9uXHJcbmFycmF5VG9Eb3VibHlMaW5rZWRMaXN0IDxUPiAoYXJyOiBBcnJheTxUPikge1xyXG4gIGNvbnN0IGxpc3QgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUPigpXHJcbiAgYXJyLmZvckVhY2goKGRhdGEpID0+IHtcclxuICAgIGxpc3QuYWRkKGRhdGEpXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIGxpc3RcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBwcm9taXNlSGFuZGxlcixcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIGh0bWxUb0VsLFxyXG4gIHNodWZmbGVcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0LCBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgUGxheWFibGVFdmVudEFyZyBmcm9tICcuL3B1YnN1Yi9ldmVudC1hcmdzL3RyYWNrLXBsYXktYXJncydcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL3B1YnN1Yi9hZ2dyZWdhdG9yJ1xyXG5pbXBvcnQgeyBJUGxheWFibGUgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQgZnJvbSAnLi9zcG90aWZ5LXBsYXliYWNrLWVsZW1lbnQnXHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkVm9sdW1lICgpIHtcclxuICBjb25zdCB7IHJlcywgZXJyIH0gPSBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0UGxheWVyVm9sdW1lRGF0YSkpXHJcblxyXG4gIGlmIChlcnIpIHtcclxuICAgIHJldHVybiAwXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiByZXMhLmRhdGFcclxuICB9XHJcbn1cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZVZvbHVtZSAodm9sdW1lOiBzdHJpbmcpIHtcclxuICBwcm9taXNlSGFuZGxlcihheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0UGxheWVyVm9sdW1lRGF0YSh2b2x1bWUpKSlcclxufVxyXG5leHBvcnQgY29uc3QgcGxheWVyUHVibGljVmFycyA9IHtcclxuICBpc1NodWZmbGU6IGZhbHNlXHJcbn1cclxuY2xhc3MgU3BvdGlmeVBsYXliYWNrIHtcclxuICBwcml2YXRlIHBsYXllcjogYW55O1xyXG4gIC8vIGNvbnRyb2xzIHRpbWluZyBvZiBhc3luYyBhY3Rpb25zIHdoZW4gd29ya2luZyB3aXRoIHdlYnBsYXllciBzZGtcclxuICBwcml2YXRlIGlzRXhlY3V0aW5nQWN0aW9uOiBib29sZWFuO1xyXG4gIHByaXZhdGUgZGV2aWNlX2lkOiBzdHJpbmc7XHJcbiAgcHVibGljIHNlbFBsYXlpbmc6IHtcclxuICAgIGVsZW1lbnQ6IG51bGwgfCBFbGVtZW50XHJcbiAgICB0cmFja191cmk6IHN0cmluZ1xyXG4gICAgLy8gdGhpcyBub2RlIG1heSBiZSBhIHNodWZmbGVkIG9yIHVuc2h1ZmZsZWQgbm9kZVxyXG4gICAgcGxheWFibGVOb2RlOiBudWxsIHwgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgLy8gdGhpcyBhcnJheSBpcyBhbHdheXMgaW4gc3RhbmRhcmQgb3JkZXIgYW5kIG5ldmVyIHNodWZmbGVkLlxyXG4gICAgcGxheWFibGVBcnI6IG51bGwgfCBBcnJheTxJUGxheWFibGU+XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFN0YXRlSW50ZXJ2YWw6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbDtcclxuICBwcml2YXRlIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50O1xyXG4gIHByaXZhdGUgcGxheWVySXNSZWFkeTogYm9vbGVhbjtcclxuICBwcml2YXRlIHdhc0luU2h1ZmZsZSA9IGZhbHNlO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgIHRoaXMucGxheWVyID0gbnVsbFxyXG4gICAgdGhpcy5kZXZpY2VfaWQgPSAnJ1xyXG4gICAgdGhpcy5nZXRTdGF0ZUludGVydmFsID0gbnVsbFxyXG5cclxuICAgIHRoaXMuc2VsUGxheWluZyA9IHtcclxuICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgdHJhY2tfdXJpOiAnJyxcclxuICAgICAgcGxheWFibGVOb2RlOiBudWxsLFxyXG4gICAgICBwbGF5YWJsZUFycjogbnVsbFxyXG4gICAgfVxyXG4gICAgdGhpcy5wbGF5ZXJJc1JlYWR5ID0gZmFsc2VcclxuICAgIHRoaXMuX2xvYWRXZWJQbGF5ZXIoKVxyXG5cclxuICAgIC8vIHBhc3MgaXQgdGhlIFwidGhpcy5cIiBhdHRyaWJ1dGVzIGluIHRoaXMgc2NvcGUgYmVjYXVzZSB3aGVuIGEgZnVuY3Rpb24gaXMgY2FsbGVkIGZyb20gYSBkaWZmZXJlbnQgY2xhc3MgdGhlIFwidGhpcy5cIiBhdHRyaWJ1dGVzIGFyZSB1bmRlZmluZWQuXHJcbiAgICB0aGlzLndlYlBsYXllckVsID0gbmV3IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRWb2x1bWUgKHBlcmNlbnRhZ2U6IG51bWJlciwgcGxheWVyOiBhbnksIHNhdmU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgY29uc3QgbmV3Vm9sdW1lID0gcGVyY2VudGFnZSAvIDEwMFxyXG4gICAgcGxheWVyLnNldFZvbHVtZShuZXdWb2x1bWUpXHJcblxyXG4gICAgaWYgKHNhdmUpIHtcclxuICAgICAgc2F2ZVZvbHVtZShuZXdWb2x1bWUudG9TdHJpbmcoKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgdGltZSBzaG93biB3aGVuIHNlZWtpbmcuXHJcbiAgICogQHBhcmFtIHBlcmNlbnRhZ2UgVGhlIHBlcmNlbnQgdGhhdCB0aGUgYmFyIGhhcyBmaWxsZWQgd2l0aCByZXNwZWN0IHRvIHRoZSBlbnRpcmUgYmFyXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIFRoZSB3ZWJwbGF5ZXIgZWxlbWVudCB0aGF0IGdpdmVzIHVzIGFjY2VzcyB0byB0aGUgc29uZyBwcm9ncmVzcyBiYXJcclxuICAgKi9cclxuICBwcml2YXRlIG9uU2Vla2luZyAocGVyY2VudGFnZTogbnVtYmVyLCB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudCkge1xyXG4gICAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBieSB1c2luZyB0aGUgcGVyY2VudCB0aGUgcHJvZ3Jlc3MgYmFyLlxyXG4gICAgY29uc3Qgc2Vla1Bvc2l0aW9uID0gd2ViUGxheWVyRWwuc29uZ1Byb2dyZXNzIS5tYXggKiAocGVyY2VudGFnZSAvIDEwMClcclxuICAgIGlmICh3ZWJQbGF5ZXJFbC5jdXJyVGltZSA9PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudCB0aW1lIGVsZW1lbnQgaXMgbnVsbCcpXHJcbiAgICB9XHJcbiAgICAvLyB1cGRhdGUgdGhlIHRleHQgY29udGVudCB0byBzaG93IHRoZSB0aW1lIHRoZSB1c2VyIHdpbGwgYmUgc2Vla2luZyB0b28gb25tb3VzZXVwLlxyXG4gICAgd2ViUGxheWVyRWwuY3VyclRpbWUudGV4dENvbnRlbnQgPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKHNlZWtQb3NpdGlvbilcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBzZWVraW5nIGFjdGlvbiBiZWdpbnNcclxuICAgKiBAcGFyYW0gcGxheWVyIFRoZSBzcG90aWZ5IHNkayBwbGF5ZXIgd2hvc2Ugc3RhdGUgd2Ugd2lsbCB1c2UgdG8gY2hhbmdlIHRoZSBzb25nJ3MgcHJvZ3Jlc3MgYmFyJ3MgbWF4IHZhbHVlIHRvIHRoZSBkdXJhdGlvbiBvZiB0aGUgc29uZy5cclxuICAgKiBAcGFyYW0gd2ViUGxheWVyRWwgVGhlIHdlYiBwbGF5ZXIgZWxlbWVudCB0aGF0IHdpbGwgYWxsb3cgdXMgdG8gbW9kaWZ5IHRoZSBwcm9ncmVzcyBiYXJzIG1heCBhdHRyaWJ1dGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblNlZWtTdGFydCAocGxheWVyOiBhbnksIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50KSB7XHJcbiAgICBwbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCkudGhlbigoc3RhdGU6IHsgZHVyYXRpb246IGFueSB9KSA9PiB7XHJcbiAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgJ1VzZXIgaXMgbm90IHBsYXlpbmcgbXVzaWMgdGhyb3VnaCB0aGUgV2ViIFBsYXliYWNrIFNESydcclxuICAgICAgICApXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgLy8gd2hlbiBmaXJzdCBzZWVraW5nLCB1cGRhdGUgdGhlIG1heCBhdHRyaWJ1dGUgd2l0aCB0aGUgZHVyYXRpb24gb2YgdGhlIHNvbmcgZm9yIHVzZSB3aGVuIHNlZWtpbmcuXHJcbiAgICAgIHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4ID0gc3RhdGUuZHVyYXRpb25cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0byBydW4gd2hlbiB5b3Ugd2lzaCB0byBzZWVrIHRvIGEgY2VydGFpbiBwb3NpdGlvbiBpbiBhIHNvbmcuXHJcbiAgICogQHBhcmFtIHBlcmNlbnRhZ2UgVGhlIHBlcmNlbnQgdGhhdCB0aGUgYmFyIGhhcyBmaWxsZWQgd2l0aCByZXNwZWN0IHRvIHRoZSBlbnRpcmUgYmFyXHJcbiAgICogQHBhcmFtIHBsYXllciB0aGUgc3BvdGlmeSBzZGsgcGxheWVyIHRoYXQgd2lsbCBzZWVrIHRoZSBzb25nIHRvIGEgZ2l2ZW4gcG9zaXRpb25cclxuICAgKiBAcGFyYW0gd2ViUGxheWVyRWwgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCB0aGF0IGdpdmVzIHVzIGFjY2VzcyB0byB0aGUgc29uZyBwcm9ncmVzcyBiYXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZWVrU29uZyAocGVyY2VudGFnZTogbnVtYmVyLCBwbGF5ZXI6IGFueSwgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQpIHtcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gdHJ1ZVxyXG4gICAgICAvLyBvYnRhaW4gdGhlIGZpbmFsIHBvc2l0aW9uIHRoZSB1c2VyIHdpc2hlcyB0byBzZWVrIG9uY2UgbW91c2UgaXMgdXAuXHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gKHBlcmNlbnRhZ2UgLyAxMDApICogd2ViUGxheWVyRWwuc29uZ1Byb2dyZXNzIS5tYXhcclxuXHJcbiAgICAgIC8vIHNlZWsgdG8gdGhlIGNob3NlbiBwb3NpdGlvbi5cclxuICAgICAgcGxheWVyLnNlZWsocG9zaXRpb24pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBfbG9hZFdlYlBsYXllciAoKSB7XHJcbiAgICAvLyBsb2FkIHRoZSB1c2VycyBzYXZlZCB2b2x1bWUgaWYgdGhlcmUgaXNudCB0aGVuIGxvYWQgMC40IGFzIGRlZmF1bHQuXHJcbiAgICBjb25zdCB2b2x1bWUgPSBhd2FpdCBsb2FkVm9sdW1lKClcclxuXHJcbiAgICBwcm9taXNlSGFuZGxlcjxBeGlvc1Jlc3BvbnNlPHN0cmluZyB8IG51bGw+PihheGlvcy5yZXF1ZXN0PHN0cmluZyB8IG51bGw+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRBY2Nlc3NUb2tlbiB9KSwgKHJlcykgPT4ge1xyXG4gICAgICBjb25zdCBOT19DT05URU5UID0gMjA0XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSBOT19DT05URU5UIHx8IHJlcy5kYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5TcG90aWZ5KSB7XHJcbiAgICAgICAgLy8gaWYgdGhlIHNwb3RpZnkgc2RrIGlzIGFscmVhZHkgZGVmaW5lZCBzZXQgcGxheWVyIHdpdGhvdXQgc2V0dGluZyBvblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5IG1lYW5pbmcgdGhlIHdpbmRvdzogV2luZG93IGlzIGluIGEgZGlmZmVyZW50IHNjb3BlXHJcbiAgICAgICAgLy8gdXNlIHdpbmRvdy5TcG90aWZ5LlBsYXllciBhcyBzcG90aWZ5IG5hbWVzcGFjZSBpcyBkZWNsYXJlZCBpbiB0aGUgV2luZG93IGludGVyZmFjZSBhcyBwZXIgRGVmaW5pdGVseVR5cGVkIC0+IHNwb3RpZnktd2ViLXBsYXliYWNrLXNkayAtPiBpbmRleC5kLnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9EZWZpbml0ZWx5VHlwZWQvRGVmaW5pdGVseVR5cGVkL3RyZWUvbWFzdGVyL3R5cGVzL3Nwb3RpZnktd2ViLXBsYXliYWNrLXNka1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZvbHVtZTogdm9sdW1lXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLl9hZGRMaXN0ZW5lcnModm9sdW1lKVxyXG4gICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIHBsYXllciFcclxuICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvZiBzcG90aWZ5IHNkayBpcyB1bmRlZmluZWRcclxuICAgICAgICB3aW5kb3cub25TcG90aWZ5V2ViUGxheWJhY2tTREtSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAgIC8vIGlmIGdldHRpbmcgdG9rZW4gd2FzIHN1Y2Nlc2Z1bCBjcmVhdGUgc3BvdGlmeSBwbGF5ZXIgdXNpbmcgdGhlIHdpbmRvdyBpbiB0aGlzIHNjb3BlXHJcbiAgICAgICAgICB0aGlzLnBsYXllciA9IG5ldyB3aW5kb3cuU3BvdGlmeS5QbGF5ZXIoe1xyXG4gICAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgICBnZXRPQXV0aFRva2VuOiAoY2IpID0+IHtcclxuICAgICAgICAgICAgICAvLyBnaXZlIHRoZSB0b2tlbiB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2b2x1bWU6IHZvbHVtZVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIHRoaXMuX2FkZExpc3RlbmVycyh2b2x1bWUpXHJcbiAgICAgICAgICAvLyBDb25uZWN0IHRvIHRoZSBwbGF5ZXIhXHJcbiAgICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hZGRMaXN0ZW5lcnMgKGxvYWRlZFZvbHVtZTogc3RyaW5nKSB7XHJcbiAgICAvLyBFcnJvciBoYW5kbGluZ1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2luaXRpYWxpemF0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2F1dGhlbnRpY2F0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdwbGF5YmFjayBjb3VsZG50IHN0YXJ0JylcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignYWNjb3VudF9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdwbGF5YmFja19lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBQbGF5YmFjayBzdGF0dXMgdXBkYXRlc1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3BsYXllcl9zdGF0ZV9jaGFuZ2VkJywgKHN0YXRlOiBTcG90aWZ5LlBsYXliYWNrU3RhdGUgfCBudWxsKSA9PiB7IH0pXHJcblxyXG4gICAgLy8gUmVhZHlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdyZWFkeScsICh7IGRldmljZV9pZCB9OiB7IGRldmljZV9pZDogc3RyaW5nIH0pID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ1JlYWR5IHdpdGggRGV2aWNlIElEJywgZGV2aWNlX2lkKVxyXG4gICAgICB0aGlzLmRldmljZV9pZCA9IGRldmljZV9pZFxyXG5cclxuICAgICAgLy8gYXBwZW5kIHdlYiBwbGF5ZXIgZWxlbWVudCB0byBET01cclxuICAgICAgdGhpcy53ZWJQbGF5ZXJFbC5hcHBlbmRXZWJQbGF5ZXJIdG1sKFxyXG4gICAgICAgICgpID0+IHRoaXMudHJ5UGxheVByZXYodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlXZWJQbGF5ZXJQYXVzZSh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKSxcclxuICAgICAgICAoKSA9PiB0aGlzLnRyeVBsYXlOZXh0KHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUpLFxyXG4gICAgICAgICgpID0+IHRoaXMub25TZWVrU3RhcnQodGhpcy5wbGF5ZXIsIHRoaXMud2ViUGxheWVyRWwpLFxyXG4gICAgICAgIChwZXJjZW50YWdlKSA9PiB0aGlzLnNlZWtTb25nKHBlcmNlbnRhZ2UsIHRoaXMucGxheWVyLCB0aGlzLndlYlBsYXllckVsKSxcclxuICAgICAgICAocGVyY2VudGFnZSkgPT4gdGhpcy5vblNlZWtpbmcocGVyY2VudGFnZSwgdGhpcy53ZWJQbGF5ZXJFbCksXHJcbiAgICAgICAgKHBlcmNlbnRhZ2UsIHNhdmUpID0+IHRoaXMuc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIHRoaXMucGxheWVyLCBzYXZlKSxcclxuICAgICAgICBwYXJzZUZsb2F0KGxvYWRlZFZvbHVtZSlcclxuICAgICAgKVxyXG4gICAgICB0aGlzLnBsYXllcklzUmVhZHkgPSB0cnVlXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIE5vdCBSZWFkeVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ25vdF9yZWFkeScsICh7IGRldmljZV9pZCB9OiB7IGRldmljZV9pZDogc3RyaW5nIH0pID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ0RldmljZSBJRCBoYXMgZ29uZSBvZmZsaW5lJywgZGV2aWNlX2lkKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXREdXJhdGlvbiAoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24pIHtcclxuICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuICAgICAgdGhpcy5wbGF5ZXIuc2VlaygwKS50aGVuKCgpID0+IHsgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmllcyB0byBwYXVzZSB0aGUgY3VycmVudCBwbGF5aW5nIElQbGF5YWJsZSBub2RlIGZyb20gdGhlIHdlYiBwbGF5ZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY3Vyck5vZGUgLSB0aGUgY3VycmVudCBJUGxheWFibGUgbm9kZSB0aGF0IHdhcy9pcyBwbGF5aW5nXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlXZWJQbGF5ZXJQYXVzZSAoY3Vyck5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhpcyBpcyB0aGUgZmlyc3Qgbm9kZSBvciBpZiBhbiBhY3Rpb24gaXMgcHJvY2Vzc2luZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uICYmIGN1cnJOb2RlICE9PSBudWxsKSB7XHJcbiAgICAgIGNvbnN0IHByZXZUcmFjayA9IGN1cnJOb2RlLmRhdGFcclxuICAgICAgY29uc29sZS5sb2coJ1RyeSBwbGF5ZXIgcGF1c2UnKVxyXG4gICAgICB0aGlzLnNldFNlbFBsYXlpbmdFbChuZXcgUGxheWFibGVFdmVudEFyZyhwcmV2VHJhY2ssIGN1cnJOb2RlLCB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZXMgdG8gcGxheSB0aGUgcHJldmlvdXMgSVBsYXlhYmxlIGdpdmVuIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY3Vyck5vZGUgLSB0aGUgY3VycmVudCBJUGxheWFibGUgbm9kZSB0aGF0IHdhcy9pcyBwbGF5aW5nXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlQbGF5UHJldiAoY3Vyck5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICAvLyB0aGVyZSBpcyBubyBjdXJyZW50IG5vZGUgb3IgdGhlIHBsYXllciBpcyBpbiBzaHVmZmxlIG1vZGVcclxuICAgIGlmIChjdXJyTm9kZSA9PT0gbnVsbCB8fCAocGxheWVyUHVibGljVmFycy5pc1NodWZmbGUgJiYgIXRoaXMud2FzSW5TaHVmZmxlKSkge1xyXG4gICAgICAvLyAoaWYgdGhlIHBsYXllciBoYXMganVzdCBiZWVuIHB1dCBpbnRvIHNodWZmbGUgbW9kZSB0aGVuIHRoZXJlIHNob3VsZCBiZSBubyBwcmV2aW91cyBwbGF5YWJsZXMgdG8gZ28gYmFjayB0b28pXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nIHdlIGNhbm5vdCBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IHBvc2l0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICAgIGlmIChzdGF0ZS5wb3NpdGlvbiA+IDEwMDApIHtcclxuICAgICAgICAgIHRoaXMucmVzZXREdXJhdGlvbigpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChjdXJyTm9kZS5wcmV2aW91cyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsZXQgcHJldlRyYWNrTm9kZSA9IGN1cnJOb2RlLnByZXZpb3VzXHJcblxyXG4gICAgICAgICAgaWYgKCFwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSAmJiB0aGlzLndhc0luU2h1ZmZsZSkge1xyXG4gICAgICAgICAgICBwcmV2VHJhY2tOb2RlID0gdGhpcy51blNodWZmbGUoLTEpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBwcmV2VHJhY2sgPSBjdXJyTm9kZS5wcmV2aW91cy5kYXRhXHJcbiAgICAgICAgICB0aGlzLnNldFNlbFBsYXlpbmdFbChuZXcgUGxheWFibGVFdmVudEFyZyhwcmV2VHJhY2ssIHByZXZUcmFja05vZGUsIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycikpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZXMgdG8gcGxheSB0aGUgbmV4dCBJUGxheWFibGUgZ2l2ZW4gdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVBsYXlOZXh0IChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIGlmIChjdXJyTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHRoZSBsYXN0IG5vZGUgb3IgaWYgYW4gYWN0aW9uIGlzIHByb2Nlc3NpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiAmJiBjdXJyTm9kZS5uZXh0ICE9PSBudWxsKSB7XHJcbiAgICAgIGxldCBuZXh0VHJhY2tOb2RlID0gY3Vyck5vZGUubmV4dFxyXG5cclxuICAgICAgaWYgKCF0aGlzLndhc0luU2h1ZmZsZSAmJiBwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSkge1xyXG4gICAgICAgIC8vIGJ5IGNhbGxpbmcgdGhpcyBiZWZvcmUgYXNzaWduaW5nIHRoZSBuZXh0IG5vZGUsIHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpIG11c3QgcmV0dXJuIGJhY2sgdGhlIG5leHQgbm9kZVxyXG4gICAgICAgIG5leHRUcmFja05vZGUgPSB0aGlzLnNodWZmbGVQbGF5YWJsZXMoKVxyXG5cclxuICAgICAgICAvLyBjYWxsIGFmdGVyIHRvIGVuc3VyZSB0aGF0IHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpIHJ1bnMgdGhlIGlmIHN0YXRlbWVudCB0aGF0IHJldHVybnMgdGhlIG5leHQgbm9kZVxyXG4gICAgICAgIHRoaXMud2FzSW5TaHVmZmxlID0gdHJ1ZVxyXG4gICAgICB9IGVsc2UgaWYgKCFwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSAmJiB0aGlzLndhc0luU2h1ZmZsZSkge1xyXG4gICAgICAgIG5leHRUcmFja05vZGUgPSB0aGlzLnVuU2h1ZmZsZSgxKVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldFNlbFBsYXlpbmdFbChuZXcgUGxheWFibGVFdmVudEFyZyhuZXh0VHJhY2tOb2RlLmRhdGEsIG5leHRUcmFja05vZGUsIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbXBsZXRlbHlEZXNlbGVjdFRyYWNrICgpIHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCB3YXMgbnVsbCBiZWZvcmUgZGVzZWxlY3Rpb24gb24gc29uZyBmaW5pc2gnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5wYXVzZURlc2VsZWN0VHJhY2soKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9ICcnXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhdXNlRGVzZWxlY3RUcmFjayAoKSB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWxlY3RlZCBwbGF5aW5nIGVsZW1lbnQgd2FzIG51bGwgYmVmb3JlIGRlc2VsZWN0aW9uIG9uIHNvbmcgZmluaXNoJylcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlPy5kYXRhLm9uU3RvcHBlZCgpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMud2ViUGxheWVyRWwucGxheVBhdXNlPy5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZWxlY3RUcmFjayAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlID0gZXZlbnRBcmcucGxheWFibGVOb2RlXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIgPSBldmVudEFyZy5wbGF5YWJsZUFyclxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWxcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmlcclxuXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnBsYXlQYXVzZT8uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNldFRpdGxlKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS50aXRsZSlcclxuICAgIHRoaXMud2ViUGxheWVyRWwuc2V0SW1nU3JjKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5pbWFnZVVybClcclxuICAgIHRoaXMud2ViUGxheWVyRWwuc2V0QXJ0aXN0cyhldmVudEFyZy5jdXJyUGxheWFibGUuYXJ0aXN0c0h0bWwpXHJcblxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZT8uZGF0YS5vblBsYXlpbmcoKVxyXG5cclxuICAgIC8vIHdlIGNhbiBjYWxsIGFmdGVyIGFzc2lnbmluZyBwbGF5YWJsZSBub2RlIGFzIGl0IGRvZXMgbm90IGNoYW5nZSB3aGljaCBub2RlIGlzIHBsYXllZFxyXG4gICAgaWYgKCFwbGF5VGhydVdlYlBsYXllciAmJiBwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSkge1xyXG4gICAgICB0aGlzLnNodWZmbGVQbGF5YWJsZXMoKVxyXG4gICAgfSBlbHNlIGlmICghcGxheWVyUHVibGljVmFycy5pc1NodWZmbGUgJiYgdGhpcy53YXNJblNodWZmbGUpIHtcclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9IHRoaXMudW5TaHVmZmxlKDApXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uVHJhY2tGaW5pc2ggKCkge1xyXG4gICAgdGhpcy5jb21wbGV0ZWx5RGVzZWxlY3RUcmFjaygpXHJcblxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLnNsaWRlclByb2dyZXNzIS5zdHlsZS53aWR0aCA9ICcxMDAlJ1xyXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwgYXMgTm9kZUpTLlRpbWVvdXQpXHJcbiAgICB0aGlzLnRyeVBsYXlOZXh0KHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGFuIGludGVydmFsIHRoYXQgb2J0YWlucyB0aGUgc3RhdGUgb2YgdGhlIHBsYXllciBldmVyeSBzZWNvbmQuXHJcbiAgICogU2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW4gYSBzb25nIGlzIHBsYXlpbmcuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRHZXRTdGF0ZUludGVydmFsICgpIHtcclxuICAgIGxldCBkdXJhdGlvbk1pblNlYyA9ICcnXHJcbiAgICBpZiAodGhpcy5nZXRTdGF0ZUludGVydmFsKSB7XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsKVxyXG4gICAgfVxyXG4gICAgLy8gc2V0IHRoZSBpbnRlcnZhbCB0byBydW4gZXZlcnkgc2Vjb25kIGFuZCBvYnRhaW4gdGhlIHN0YXRlXHJcbiAgICB0aGlzLmdldFN0YXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IHBvc2l0aW9uOiBhbnk7IGR1cmF0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICdVc2VyIGlzIG5vdCBwbGF5aW5nIG11c2ljIHRocm91Z2ggdGhlIFdlYiBQbGF5YmFjayBTREsnXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgeyBwb3NpdGlvbiwgZHVyYXRpb24gfSA9IHN0YXRlXHJcblxyXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzbnQgYSBkdXJhdGlvbiBzZXQgZm9yIHRoaXMgc29uZyBzZXQgaXQuXHJcbiAgICAgICAgaWYgKGR1cmF0aW9uTWluU2VjID09PSAnJykge1xyXG4gICAgICAgICAgZHVyYXRpb25NaW5TZWMgPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKGR1cmF0aW9uKVxyXG4gICAgICAgICAgdGhpcy53ZWJQbGF5ZXJFbCEuZHVyYXRpb24hLnRleHRDb250ZW50ID0gZHVyYXRpb25NaW5TZWNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBlcmNlbnREb25lID0gKHBvc2l0aW9uIC8gZHVyYXRpb24pICogMTAwXHJcblxyXG4gICAgICAgIC8vIHRoZSBwb3NpdGlvbiBnZXRzIHNldCB0byAwIHdoZW4gdGhlIHNvbmcgaXMgZmluaXNoZWRcclxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApIHtcclxuICAgICAgICAgIHRoaXMub25UcmFja0ZpbmlzaCgpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGlmIHRoZSBwb3NpdGlvbiBpc250IDAgdXBkYXRlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzXHJcbiAgICAgICAgICB0aGlzLndlYlBsYXllckVsLnVwZGF0ZUVsZW1lbnQocGVyY2VudERvbmUsIHBvc2l0aW9uKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0sIDUwMClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbGVjdCBhIGNlcnRhaW4gcGxheS9wYXVzZSBlbGVtZW50IGFuZCBwbGF5IHRoZSBnaXZlbiB0cmFjayB1cmlcclxuICAgKiBhbmQgdW5zZWxlY3QgdGhlIHByZXZpb3VzIG9uZSB0aGVuIHBhdXNlIHRoZSBwcmV2aW91cyB0cmFja191cmkuXHJcbiAgICpcclxuICAgKiBUaGUgcmVhc3NpZ25pbmcgb2YgZWxlbWVudHMgaXMgaW4gdGhlIGNhc2UgdGhhdCB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB0aHJvdWdoIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQsXHJcbiAgICogYXMgdGhlcmUgaXMgYSBjaGFuY2UgdGhhdCB0aGUgc2VsZWN0ZWQgcGxheWluZyBlbGVtZW50IGlzIGVpdGhlciBub24tZXhpc3RlbnQsIG9yIGlzIGRpZmZlcmVudCB0aGVuIHRoZW5cclxuICAgKiB0aGUgcHJldmlvdXMgaS5lLiByZXJlbmRlcmVkLCBvciBoYXMgYW4gZXF1aXZhbGVudCBlbGVtZW50IHdoZW4gb24gZm9yIGV4YW1wbGUgYSBkaWZmZXJlbnQgdGVybSB0YWIuXHJcbiAgICpcclxuICAgKiBSZWFzc2lnbmluZyBpcyBkb25lIHNvIHRoYXQgdGhlIHBvdGVudGlhbGx5IGRpZmZlcmVudCBlcXVpdmFsZW50IGVsZW1lbnQgY2FuIGFjdCBhcyB0aGUgaW5pdGlhbGx5XHJcbiAgICogc2VsZWN0ZWQgZWxlbWVudCwgaW4gc2hvd2luZyBwYXVzZS9wbGF5IHN5bWJvbHMgaW4gYWNjb3JkYW5jZSB0byB3aGV0aGVyIHRoZVxyXG4gICAqIHNvbmcgd2FzIHBhdXNlZC9wbGF5ZWQgdGhyb3VnaCB0aGUgd2ViIHBsYXllci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGxheWFibGVFdmVudEFyZ30gZXZlbnRBcmcgLSBhIGNsYXNzIHRoYXQgY29udGFpbnMgdGhlIGN1cnJlbnQsIG5leHQgYW5kIHByZXZpb3VzIHRyYWNrcyB0byBwbGF5XHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIHNldFNlbFBsYXlpbmdFbCAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyID0gdHJ1ZSkge1xyXG4gICAgLy8gaWYgdGhlIHBsYXllciBpc24ndCByZWFkeSB3ZSBjYW5ub3QgY29udGludWUuXHJcbiAgICBpZiAoIXRoaXMucGxheWVySXNSZWFkeSkge1xyXG4gICAgICBjb25zb2xlLmxvZygncGxheWVyIGlzIG5vdCByZWFkeScpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24pIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gdHJ1ZVxyXG5cclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCAhPSBudWxsKSB7XHJcbiAgICAgIC8vIHN0b3AgdGhlIHByZXZpb3VzIHRyYWNrIHRoYXQgd2FzIHBsYXlpbmdcclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZT8uZGF0YS5vblN0b3BwZWQoKVxyXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCBhcyBOb2RlSlMuVGltZW91dClcclxuXHJcbiAgICAgIC8vIHJlYXNzaWduIHRoZSBlbGVtZW50IGlmIGl0IGV4aXN0cyBhcyBpdCBtYXkgaGF2ZSBiZWVuIHJlcmVuZGVyZWQgYW5kIHRoZXJlZm9yZSB0aGUgcHJldmlvdXMgdmFsdWUgaXMgcG9pbnRpbmcgdG8gbm90aGluZ1xyXG4gICAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmlkKSA/PyB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudFxyXG5cclxuICAgICAgLy8gaWYgaXRzIHRoZSBzYW1lIGVsZW1lbnQgdGhlbiBwYXVzZVxyXG4gICAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuaWQgPT09IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbC5pZCkge1xyXG4gICAgICAgIHRoaXMucGF1c2VEZXNlbGVjdFRyYWNrKClcclxuICAgICAgICBhd2FpdCB0aGlzLnBhdXNlKClcclxuICAgICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UgY29tcGxldGVseSBkZXNlbGVjdCB0aGUgY3VycmVudCB0cmFjayBiZWZvcmUgc2VsZWN0aW5nIGFub3RoZXIgb25lIHRvIHBsYXlcclxuICAgICAgICB0aGlzLmNvbXBsZXRlbHlEZXNlbGVjdFRyYWNrKClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHByZXYgdHJhY2sgdXJpIGlzIHRoZSBzYW1lIHRoZW4gcmVzdW1lIHRoZSBzb25nIGluc3RlYWQgb2YgcmVwbGF5aW5nIGl0LlxyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy50cmFja191cmkgPT09IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmkpIHtcclxuICAgICAgLy8gdGhpcyBzZWxFbCBjb3VsZCBjb3Jyb3Nwb25kIHRvIHRoZSBzYW1lIHNvbmcgYnV0IGlzIGFuIGVsZW1lbnQgdGhhdCBpcyBub24tZXhpc3RlbnQsIHNvIHJlYXNzaWduIGl0IHRvIGEgZXF1aXZhbGVudCBleGlzdGluZyBlbGVtZW50IGlmIHRoaXMgaXMgdGhlIGNhc2UuXHJcbiAgICAgIGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbC5pZCkgPz8gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsXHJcblxyXG4gICAgICBhd2FpdCB0aGlzLnN0YXJ0VHJhY2soYXN5bmMgKCkgPT4gdGhpcy5yZXN1bWUoKSwgZXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyKVxyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coJ3N0YXJ0IHRyYWNrJylcclxuICAgIGF3YWl0IHRoaXMuc3RhcnRUcmFjayhhc3luYyAoKSA9PiB0aGlzLnBsYXkoZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaSksIGV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcilcclxuICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBzdGFydFRyYWNrIChwbGF5aW5nQXN5bmNGdW5jOiBGdW5jdGlvbiwgZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLnNlbGVjdFRyYWNrKGV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcilcclxuXHJcbiAgICBhd2FpdCBwbGF5aW5nQXN5bmNGdW5jKClcclxuXHJcbiAgICAvLyBzZXQgcGxheWluZyBzdGF0ZSBvbmNlIHNvbmcgc3RhcnRzIHBsYXlpbmdcclxuICAgIHRoaXMuc2V0R2V0U3RhdGVJbnRlcnZhbCgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaHVmZmxlcyB0aGUgcGxheWFibGVzIGFuZCBlaXRoZXIgcmV0dXJucyB0aGUgY3VycmVudCBub2RlIG9yIHRoZSBuZXh0IG5vZGUgdGhhdCBib3RoIHBvaW50IHRvIGEgc2h1ZmZsZWQgdmVyc2lvbiBvZiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7RG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPn0gZWl0aGVyIHRoZSBuZXh0IG9yIGN1cnJlbnQgbm9kZSBpbiB0aGUgc2h1ZmZsZWQgbGlzdC5cclxuICAgKi9cclxuICBwcml2YXRlIHNodWZmbGVQbGF5YWJsZXMgKCk6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4ge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFyciA9PSBudWxsIHx8IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdubyBzZWwgcGxheWluZycpXHJcbiAgICBjb25zb2xlLmxvZygnc2h1ZmZsZScpXHJcbiAgICBjb25zdCBzZWxQbGF5YWJsZSA9IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUuZGF0YVxyXG5cclxuICAgIC8vIHNodWZmbGUgYXJyYXlcclxuICAgIGNvbnN0IHRyYWNrQXJyID0gc2h1ZmZsZSh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpXHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoaXMgdHJhY2sgZnJvbSB0aGUgYXJyYXlcclxuICAgIGNvbnN0IGluZGV4ID0gdHJhY2tBcnIuaW5kZXhPZihzZWxQbGF5YWJsZSlcclxuICAgIHRyYWNrQXJyLnNwbGljZShpbmRleCwgMSlcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBhIGRvdWJseSBsaW5rZWQgbGlzdFxyXG4gICAgY29uc3Qgc2h1ZmZsZWRMaXN0ID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QodHJhY2tBcnIpXHJcblxyXG4gICAgLy8gcGxhY2UgdGhpcyB0cmFjayBhdCB0aGUgZnJvbnQgb2YgdGhlIGxpc3RcclxuICAgIHNodWZmbGVkTGlzdC5pbnNlcnRCZWZvcmUoc2VsUGxheWFibGUsIDApXHJcblxyXG4gICAgbGV0IG5ld05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIGlmICghdGhpcy53YXNJblNodWZmbGUpIHtcclxuICAgICAgLy8gZ2V0IHRoZSBuZXh0IG5vZGUgYXMgdGhpcyBzaG91bGQgcnVuIGJlZm9yZSB0aGUgbmV4dCBub2RlIGlzIGNob3Nlbi5cclxuICAgICAgbmV3Tm9kZSA9IHNodWZmbGVkTGlzdC5nZXQoMSwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gZ2V0IHRoZSBuZXcgbm9kZSB3aGljaCBoYXMgaWRlbnRpY2FsIGRhdGEgYXMgdGhlIG9sZCBvbmUsIGJ1dCBpcyBub3cgcGFydCBvZiB0aGUgc2h1ZmZsZWQgZG91Ymx5IGxpbmtlZCBsaXN0XHJcbiAgICAgIG5ld05vZGUgPSBzaHVmZmxlZExpc3QuZ2V0KDAsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9IG5ld05vZGVcclxuICAgIH1cclxuICAgIHJldHVybiBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVbnNodWZmbGVzIHRoZSBwbGF5YWJsZXMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpciB2YWx1ZSByZXByZXNlbnRpbmcgdGhlIGluZGV4IHRvIGFkZCBvciByZW1vdmUgZnJvbSB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgcGxheWluZyBub2RlLiAoMTogZ2V0c05leHQsIC0xOiBnZXRzUHJldiwgMDogZ2V0c0N1cnJlbnQpXHJcbiAgICogQHJldHVybnMge0RvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT59IHRoZSBub2RlIHRoYXQgcG9pbnRzIHRvIHRoZSB1bnNodWZmbGVkIHZlcnNpb24gb2YgdGhlIGxpc3QuIEVpdGhlciB0aGUgcHJldmlvdXMsIGN1cnJlbnQsIG9yIG5leHQgbm9kZSBmcm9tIHRoZSBjdXJyZW50IHBsYXlhYmxlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdW5TaHVmZmxlIChkaXI6IG51bWJlcik6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4ge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFyciA9PSBudWxsIHx8IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdubyBzZWwgcGxheWluZycpXHJcbiAgICBjb25zdCBzZWxQbGF5YWJsZSA9IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUuZGF0YVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCd1bnNodWZmbGUnKVxyXG4gICAgdGhpcy53YXNJblNodWZmbGUgPSBmYWxzZVxyXG4gICAgLy8gb2J0YWluIGFuIHVuc2h1ZmZsZWQgbGlua2VkIGxpc3RcclxuICAgIGNvbnN0IHBsYXlhYmxlTGlzdCA9IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0KHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycilcclxuXHJcbiAgICBjb25zdCBuZXdOb2RlSWR4ID0gcGxheWFibGVMaXN0LmZpbmRJbmRleCgocGxheWFibGUpID0+IHBsYXlhYmxlLnNlbEVsLmlkID09PSBzZWxQbGF5YWJsZS5zZWxFbC5pZClcclxuICAgIGNvbnN0IG5ld05vZGUgPSBwbGF5YWJsZUxpc3QuZ2V0KG5ld05vZGVJZHggKyBkaXIsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIHJldHVybiBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQbGF5cyBhIHRyYWNrIHRocm91Z2ggdGhpcyBkZXZpY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhY2tfdXJpIC0gdGhlIHRyYWNrIHVyaSB0byBwbGF5XHJcbiAgICogQHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHRyYWNrIGhhcyBiZWVuIHBsYXllZCBzdWNjZXNmdWxseS5cclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHBsYXkgKHRyYWNrX3VyaTogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXlUcmFjayh0aGlzLmRldmljZV9pZCwgdHJhY2tfdXJpKSlcclxuICAgIClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVzdW1lICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnJlc3VtZSgpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHBhdXNlICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnBhdXNlKClcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHNwb3RpZnlQbGF5YmFjayA9IG5ldyBTcG90aWZ5UGxheWJhY2soKVxyXG5cclxuaWYgKCh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgPT09IHVuZGVmaW5lZCkge1xyXG4gIC8vIGNyZWF0ZSBhIGdsb2JhbCB2YXJpYWJsZSB0byBiZSB1c2VkXHJcbiAgKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciA9IG5ldyBFdmVudEFnZ3JlZ2F0b3IoKVxyXG59XHJcbmNvbnN0IGV2ZW50QWdncmVnYXRvciA9ICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgYXMgRXZlbnRBZ2dyZWdhdG9yXHJcblxyXG4vLyBzdWJzY3JpYmUgdGhlIHNldFBsYXlpbmcgZWxlbWVudCBldmVudFxyXG5ldmVudEFnZ3JlZ2F0b3Iuc3Vic2NyaWJlKFBsYXlhYmxlRXZlbnRBcmcubmFtZSwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSA9PlxyXG4gIHNwb3RpZnlQbGF5YmFjay5zZXRTZWxQbGF5aW5nRWwoZXZlbnRBcmcsIGZhbHNlKVxyXG4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTYW1lUGxheWluZ1VSSVdpdGhFbCAodXJpOiBzdHJpbmcpIHtcclxuICByZXR1cm4gKFxyXG4gICAgdXJpID09PSBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy50cmFja191cmkgJiZcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLmVsZW1lbnQgIT0gbnVsbFxyXG4gIClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU2FtZVBsYXlpbmdVUkkgKHVyaTogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHVyaSA9PT0gc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcudHJhY2tfdXJpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyICh1cmk6IHN0cmluZywgc2VsRWw6IEVsZW1lbnQsIHRyYWNrRGF0YU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICBpZiAoaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh1cmkpKSB7XHJcbiAgICAvLyBUaGlzIGVsZW1lbnQgd2FzIHBsYXlpbmcgYmVmb3JlIHJlcmVuZGVyaW5nIHNvIHNldCBpdCB0byBiZSB0aGUgY3VycmVudGx5IHBsYXlpbmcgb25lIGFnYWluXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ID0gc2VsRWxcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9IHRyYWNrRGF0YU5vZGVcclxuICB9XHJcbn1cclxuXHJcbi8vIGFwcGVuZCBhbiBpbnZpc2libGUgZWxlbWVudCB0aGVuIGRlc3Ryb3kgaXQgYXMgYSB3YXkgdG8gbG9hZCB0aGUgcGxheSBhbmQgcGF1c2UgaW1hZ2VzIGZyb20gZXhwcmVzcy5cclxuY29uc3QgcHJlbG9hZFBsYXlQYXVzZUltZ3NIdG1sID0gYDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lXCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5SWNvbn1cIi8+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wYXVzZUljb259XCIvPjwvZGl2PmBcclxuY29uc3QgcHJlbG9hZFBsYXlQYXVzZUltZ3NFbCA9IGh0bWxUb0VsKHByZWxvYWRQbGF5UGF1c2VJbWdzSHRtbCkgYXMgTm9kZVxyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHByZWxvYWRQbGF5UGF1c2VJbWdzRWwpXHJcbmRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocHJlbG9hZFBsYXlQYXVzZUltZ3NFbClcclxuIiwiaW1wb3J0IFN1YnNjcmlwdGlvbiBmcm9tICcuL3N1YnNjcmlwdGlvbidcclxuXHJcbi8qKiBMZXRzIHNheSB5b3UgaGF2ZSB0d28gZG9vcnMgdGhhdCB3aWxsIG9wZW4gdGhyb3VnaCB0aGUgcHViIHN1YiBzeXN0ZW0uIFdoYXQgd2lsbCBoYXBwZW4gaXMgdGhhdCB3ZSB3aWxsIHN1YnNjcmliZSBvbmVcclxuICogb24gZG9vciBvcGVuIGV2ZW50LiBXZSB3aWxsIHRoZW4gaGF2ZSB0d28gcHVibGlzaGVycyB0aGF0IHdpbGwgZWFjaCBwcm9wYWdhdGUgYSBkaWZmZXJlbnQgZG9vciB0aHJvdWdoIHRoZSBhZ2dyZWdhdG9yIGF0IGRpZmZlcmVudCBwb2ludHMuXHJcbiAqIFRoZSBhZ2dyZWdhdG9yIHdpbGwgdGhlbiBleGVjdXRlIHRoZSBvbiBkb29yIG9wZW4gc3Vic2NyaWJlciBhbmQgcGFzcyBpbiB0aGUgZG9vciBnaXZlbiBieSBlaXRoZXIgcHVibGlzaGVyLlxyXG4gKi9cclxuXHJcbi8qKiBNYW5hZ2VzIHN1YnNjcmliaW5nIGFuZCBwdWJsaXNoaW5nIG9mIGV2ZW50cy5cclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiBBbiBhcmdUeXBlIGlzIG9idGFpbmVkIGJ5IHRha2luZyB0aGUgJ0NsYXNzSW5zdGFuY2UnLmNvbnRydWN0b3IubmFtZSBvciAnQ2xhc3MnLm5hbWUuXHJcbiAqIFN1YnNjcmlwdGlvbnMgYXJlIGdyb3VwZWQgdG9nZXRoZXIgYnkgYXJnVHlwZSBhbmQgdGhlaXIgZXZ0IHRha2VzIGFuIGFyZ3VtZW50IHRoYXQgaXMgYVxyXG4gKiBjbGFzcyB3aXRoIHRoZSBjb25zdHJ1Y3Rvci5uYW1lIG9mIGFyZ1R5cGUuXHJcbiAqXHJcbiAqL1xyXG5jbGFzcyBFdmVudEFnZ3JlZ2F0b3Ige1xyXG4gIHN1YnNjcmliZXJzOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PFN1YnNjcmlwdGlvbj4gfTtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAvLyBrZXkgLSB0eXBlLCB2YWx1ZSAtIFtdIG9mIGZ1bmN0aW9ucyB0aGF0IHRha2UgYSBjZXJ0YWluIHZhbHVlIGRlcGVuZGluZyBvbiB0aGUgdHlwZVxyXG4gICAgdGhpcy5zdWJzY3JpYmVycyA9IHt9XHJcbiAgfVxyXG5cclxuICAvKiogU3Vic2NyaWJlcyBhIHR5cGUgb2YgZXZlbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gYXJnVHlwZSAtIHRoZSB0eXBlIHRoYXQgdGhpcyBzdWJzY3JpYmVyIGJlbG9uZ3MgdG9vLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGV2ZW50IC0gdGhlIGV2ZW50IHRoYXQgdGFrZXMgdGhlIHNhbWUgYXJncyBhcyBhbGwgb3RoZXIgZXZlbnRzIG9mIHRoZSBnaXZlbiB0eXBlLlxyXG4gICAqL1xyXG4gIHN1YnNjcmliZSAoYXJnVHlwZTogc3RyaW5nLCBldnQ6IEZ1bmN0aW9uKSB7XHJcbiAgICBjb25zdCBzdWJzY3JpYmVyID0gbmV3IFN1YnNjcmlwdGlvbih0aGlzLCBldnQsIGFyZ1R5cGUpXHJcblxyXG4gICAgaWYgKGFyZ1R5cGUgaW4gdGhpcy5zdWJzY3JpYmVycykge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdLnB1c2goc3Vic2NyaWJlcilcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbYXJnVHlwZV0gPSBbc3Vic2NyaWJlcl1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBVbnN1YnNjcmliZXMgYSBnaXZlbiBzdWJzY3JpcHRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1N1YnNjcmlwdGlvbn0gc3Vic2NyaXB0aW9uXHJcbiAgICovXHJcbiAgdW5zdWJzY3JpYmUgKHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uKSB7XHJcbiAgICBpZiAoc3Vic2NyaXB0aW9uLmFyZ1R5cGUgaW4gdGhpcy5zdWJzY3JpYmVycykge1xyXG4gICAgICAvLyBmaWx0ZXIgb3V0IHRoZSBzdWJzY3JpcHRpb24gZ2l2ZW4gZnJvbSB0aGUgc3Vic2NyaWJlcnMgZGljdGlvbmFyeVxyXG4gICAgICBjb25zdCBmaWx0ZXJlZCA9IHRoaXMuc3Vic2NyaWJlcnNbc3Vic2NyaXB0aW9uLmFyZ1R5cGVdLmZpbHRlcihmdW5jdGlvbiAoc3ViKSB7XHJcbiAgICAgICAgcmV0dXJuIHN1Yi5pZCAhPT0gc3Vic2NyaXB0aW9uLmlkXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW3N1YnNjcmlwdGlvbi5hcmdUeXBlXSA9IGZpbHRlcmVkXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaGVzIGFsbCBzdWJzY3JpYmVycyB0aGF0IHRha2UgYXJndW1lbnRzIG9mIGEgZ2l2ZW4gdHlwZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzIC0gYSBjbGFzcyB0aGF0IGNvbnRhaW5zIGFyZ3VtZW50cyBmb3IgdGhlIGV2ZW50LiBNdXN0IGJlIGEgY2xhc3MgYXMgc3Vic2NyaWJlcnMgYXJlIGdyb3VwZWQgYnkgdHlwZS5cclxuICAgKi9cclxuICBwdWJsaXNoIChhcmdzOiBPYmplY3QpIHtcclxuICAgIGNvbnN0IGFyZ1R5cGUgPSBhcmdzLmNvbnN0cnVjdG9yLm5hbWVcclxuXHJcbiAgICBpZiAoYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbYXJnVHlwZV0uZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiB7XHJcbiAgICAgICAgc3Vic2NyaXB0aW9uLmV2dChhcmdzKVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5lcnJvcignbm8gdHlwZSBmb3VuZCBmb3IgcHVibGlzaGluZycpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGVhclN1YnNjcmlwdGlvbnMgKCkge1xyXG4gICAgdGhpcy5zdWJzY3JpYmVycyA9IHt9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFdmVudEFnZ3JlZ2F0b3JcclxuIiwiaW1wb3J0IHsgSVBsYXlhYmxlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMnXHJcbmltcG9ydCB7IERvdWJseUxpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi4vLi4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWFibGVFdmVudEFyZyB7XHJcbiAgY3VyclBsYXlhYmxlOiBJUGxheWFibGU7XHJcbiAgcGxheWFibGVOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgcGxheWFibGVBcnI6IEFycmF5PElQbGF5YWJsZT4gfCBudWxsXHJcblxyXG4gIC8qKiBUYWtlcyBpbiB0aGUgY3VycmVudCB0cmFjayB0byBwbGF5IGFzIHdlbGwgYXMgdGhlIHByZXYgdHJhY2tzIGFuZCBuZXh0IHRyYWNrcyBmcm9tIGl0LlxyXG4gICAqIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB0YWtlIFRyYWNrIGluc3RhbmNlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SVBsYXlhYmxlfSBjdXJyVHJhY2sgLSBvYmplY3QgY29udGFpbmluZyBlbGVtZW50IHRvIHNlbGVjdCwgdHJhY2tfdXJpLCBhbmQgdHJhY2sgdGl0bGUuXHJcbiAgICogQHBhcmFtIHtEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+fSB0cmFja05vZGUgLSBub2RlIHRoYXQgYWxsb3dzIHVzIHRvIHRyYXZlcnNlIHRvIG5leHQgYW5kIHByZXZpb3VzIHRyYWNrIGRhdGFzLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yIChjdXJyVHJhY2s6IElQbGF5YWJsZSwgdHJhY2tOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+LCBwbGF5YWJsZUFycjogQXJyYXk8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIHRoaXMuY3VyclBsYXlhYmxlID0gY3VyclRyYWNrXHJcbiAgICB0aGlzLnBsYXlhYmxlTm9kZSA9IHRyYWNrTm9kZVxyXG4gICAgdGhpcy5wbGF5YWJsZUFyciA9IHBsYXlhYmxlQXJyXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBFdmVudEFnZ3JlZ2F0b3IgZnJvbSAnLi9hZ2dyZWdhdG9yJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3Vic2NyaXB0aW9uIHtcclxuICBldmVudEFnZ3JlZ2F0b3I6IEV2ZW50QWdncmVnYXRvcjtcclxuICBldnQ6IEZ1bmN0aW9uO1xyXG4gIGFyZ1R5cGU6IHN0cmluZztcclxuICBpZDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3IsIGV2dDogRnVuY3Rpb24sIGFyZ1R5cGU6IHN0cmluZykge1xyXG4gICAgdGhpcy5ldmVudEFnZ3JlZ2F0b3IgPSBldmVudEFnZ3JlZ2F0b3JcclxuICAgIHRoaXMuZXZ0ID0gZXZ0XHJcbiAgICB0aGlzLmFyZ1R5cGUgPSBhcmdUeXBlXHJcbiAgICB0aGlzLmlkID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMilcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgY29uZmlnLCBwcm9taXNlSGFuZGxlciB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IFNlbGVjdGFibGVUYWJFbHMgZnJvbSAnLi9TZWxlY3RhYmxlVGFiRWxzJ1xyXG5cclxuZXhwb3J0IGVudW0gVEVSTVMge1xyXG4gICAgU0hPUlRfVEVSTSA9ICdzaG9ydF90ZXJtJyxcclxuICAgIE1JRF9URVJNID0gJ21lZGl1bV90ZXJtJyxcclxuICAgIExPTkdfVEVSTSA9ICdsb25nX3Rlcm0nXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFRFUk1fVFlQRSB7XHJcbiAgICBBUlRJU1RTID0gJ2FydGlzdHMnLFxyXG4gICAgVFJBQ0tTID0gJ3RyYWNrcydcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluZVRlcm0gKHZhbDogc3RyaW5nKSA6IFRFUk1TIHtcclxuICBzd2l0Y2ggKHZhbCkge1xyXG4gICAgY2FzZSBURVJNUy5TSE9SVF9URVJNOlxyXG4gICAgICByZXR1cm4gVEVSTVMuU0hPUlRfVEVSTVxyXG4gICAgY2FzZSBURVJNUy5NSURfVEVSTTpcclxuICAgICAgcmV0dXJuIFRFUk1TLk1JRF9URVJNXHJcbiAgICBjYXNlIFRFUk1TLkxPTkdfVEVSTTpcclxuICAgICAgcmV0dXJuIFRFUk1TLkxPTkdfVEVSTVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOTyBDT1JSRUNUIFRFUk0gV0FTIEZPVU5EJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGVybSAodGVybVR5cGU6IFRFUk1fVFlQRSkgOiBQcm9taXNlPFRFUk1TPiB7XHJcbiAgY29uc3QgeyByZXMsIGVyciB9ID0gYXdhaXQgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oKGF4aW9zLnJlcXVlc3Q8c3RyaW5nIHwgbnVsbD4oeyBtZXRob2Q6ICdHRVQnLCB1cmw6IGNvbmZpZy5VUkxzLmdldFRlcm0odGVybVR5cGUpIH0pKSlcclxuICBpZiAoZXJyKSB7XHJcbiAgICByZXR1cm4gVEVSTVMuU0hPUlRfVEVSTVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gZGV0ZXJtaW5lVGVybShyZXM/LmRhdGEgYXMgc3RyaW5nKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVUZXJtICh0ZXJtOiBURVJNUywgdGVybVR5cGU6IFRFUk1fVFlQRSkge1xyXG4gIGF3YWl0IHByb21pc2VIYW5kbGVyKGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRUZXJtKHRlcm0sIHRlcm1UeXBlKSkpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGluZGV4IHRoYXQgcG9pbnRzIHRvIHRoZSB0YWIgZWxlbWVudHNcclxuICogQHBhcmFtIHRlcm0gdGhlIHRlcm0gcmVsYXRpbmcgdG8gdGhlIHRhYiBlbGVtZW50c1xyXG4gKiBAcmV0dXJucyB0aGUgaW5kZXggdG8gZmluZCB0aGUgdGFiIGVsZW1lbnRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSWR4RnJvbVRlcm0gKHRlcm06IFRFUk1TKSB7XHJcbiAgc3dpdGNoICh0ZXJtKSB7XHJcbiAgICBjYXNlIFRFUk1TLlNIT1JUX1RFUk06XHJcbiAgICAgIHJldHVybiAwXHJcbiAgICBjYXNlIFRFUk1TLk1JRF9URVJNOlxyXG4gICAgICByZXR1cm4gMVxyXG4gICAgY2FzZSBURVJNUy5MT05HX1RFUk06XHJcbiAgICAgIHJldHVybiAyXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0U3RhcnRUZXJtVGFiICh0ZXJtOiBURVJNUywgdGVybVRhYjogU2VsZWN0YWJsZVRhYkVscywgdGFiUGFyZW50OiBFbGVtZW50KSB7XHJcbiAgY29uc3QgaWR4ID0gSWR4RnJvbVRlcm0odGVybSlcclxuICBjb25zdCBidG4gPSB0YWJQYXJlbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2J1dHRvbicpW2lkeF1cclxuICBjb25zdCBib3JkZXIgPSB0YWJQYXJlbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMuYm9yZGVyQ292ZXIpW2lkeF1cclxuXHJcbiAgdGVybVRhYi5zZWxlY3ROZXdUYWIoYnRuLCBib3JkZXIpXHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgaHRtbFRvRWwsXHJcbiAgbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyxcclxuICB0aHJvd0V4cHJlc3Npb24sXHJcbiAgcmVtb3ZlQWxsQ2hpbGROb2Rlc1xyXG59IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHsgcGxheWVyUHVibGljVmFycyB9IGZyb20gJy4vcGxheWJhY2stc2RrJ1xyXG5cclxuY2xhc3MgU2xpZGVyIHtcclxuICBwdWJsaWMgZHJhZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBzbGlkZXJFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgc2xpZGVyUHJvZ3Jlc3M6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBwZXJjZW50YWdlOiBudW1iZXIgPSAwO1xyXG4gIHB1YmxpYyBtYXg6IG51bWJlciA9IDA7XHJcbiAgcHJpdmF0ZSB0b3BUb0JvdHRvbTogYm9vbGVhbjtcclxuICBwcml2YXRlIG9uRHJhZ1N0YXJ0OiAoKSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgb25EcmFnU3RvcDogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZDtcclxuICBwcml2YXRlIG9uRHJhZ2dpbmc6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChzdGFydFBlcmNlbnRhZ2U6IG51bWJlciwgb25EcmFnU3RvcDogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCwgdG9wVG9Cb3R0b206IGJvb2xlYW4sIG9uRHJhZ1N0YXJ0ID0gKCkgPT4ge30sIG9uRHJhZ2dpbmcgPSAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB7fSwgc2xpZGVyRWw6IEhUTUxFbGVtZW50KSB7XHJcbiAgICB0aGlzLm9uRHJhZ1N0b3AgPSBvbkRyYWdTdG9wXHJcbiAgICB0aGlzLm9uRHJhZ1N0YXJ0ID0gb25EcmFnU3RhcnRcclxuICAgIHRoaXMub25EcmFnZ2luZyA9IG9uRHJhZ2dpbmdcclxuICAgIHRoaXMudG9wVG9Cb3R0b20gPSB0b3BUb0JvdHRvbVxyXG4gICAgdGhpcy5wZXJjZW50YWdlID0gc3RhcnRQZXJjZW50YWdlXHJcblxyXG4gICAgdGhpcy5zbGlkZXJFbCA9IHNsaWRlckVsXHJcbiAgICB0aGlzLnNsaWRlclByb2dyZXNzID0gc2xpZGVyRWw/LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnByb2dyZXNzKVswXSBhcyBIVE1MRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ05vIHByb2dyZXNzIGJhciBmb3VuZCcpXHJcblxyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgLy8gaWYgaXRzIHRvcCB0byBib3R0b20gd2UgbXVzdCByb3RhdGUgdGhlIGVsZW1lbnQgZHVlIHJldmVyc2VkIGhlaWdodCBjaGFuZ2luZ1xyXG4gICAgICB0aGlzLnNsaWRlckVsIS5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRleCgxODBkZWcpJ1xyXG4gICAgICB0aGlzLnNsaWRlckVsIS5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAndHJhbnNmb3JtLW9yaWdpbjogdG9wJ1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2hhbmdlQmFyTGVuZ3RoKClcclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJylcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlQmFyIChtb3NQb3NWYWw6IG51bWJlcikge1xyXG4gICAgbGV0IHBvc2l0aW9uXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICBwb3NpdGlvbiA9IG1vc1Bvc1ZhbCAtIHRoaXMuc2xpZGVyRWwhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBvc2l0aW9uID0gbW9zUG9zVmFsIC0gdGhpcy5zbGlkZXJFbCEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkueFxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgIC8vIG1pbnVzIDEwMCBiZWNhdXNlIG1vZGlmeWluZyBoZWlnaHQgaXMgcmV2ZXJzZWRcclxuICAgICAgdGhpcy5wZXJjZW50YWdlID0gMTAwIC0gKDEwMCAqIChwb3NpdGlvbiAvIHRoaXMuc2xpZGVyRWwhLmNsaWVudEhlaWdodCkpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAxMDAgKiAocG9zaXRpb24gLyB0aGlzLnNsaWRlckVsIS5jbGllbnRXaWR0aClcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5wZXJjZW50YWdlID4gMTAwKSB7XHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDEwMFxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucGVyY2VudGFnZSA8IDApIHtcclxuICAgICAgdGhpcy5wZXJjZW50YWdlID0gMFxyXG4gICAgfVxyXG4gICAgdGhpcy5jaGFuZ2VCYXJMZW5ndGgoKVxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgY2hhbmdlQmFyTGVuZ3RoICgpIHtcclxuICAgIC8vIHNldCBiYWNrZ3JvdW5kIGNvbG9yIG9mIGFsbCBtb3Zpbmcgc2xpZGVycyBwcm9ncmVzcyBhcyB0aGUgc3BvdGlmeSBncmVlblxyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMxZGI5NTQnXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5oZWlnaHQgPSB0aGlzLnBlcmNlbnRhZ2UgKyAnJSdcclxuICAgIH0gZWxzZSB7XHJcbiAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS53aWR0aCA9IHRoaXMucGVyY2VudGFnZSArICclJ1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXJzICgpIHtcclxuICAgIHRoaXMuYWRkTW91c2VFdmVudHMoKVxyXG4gICAgdGhpcy5hZGRUb3VjaEV2ZW50cygpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZFRvdWNoRXZlbnRzICgpIHtcclxuICAgIHRoaXMuc2xpZGVyRWw/LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZXZ0KSA9PiB7XHJcbiAgICAgIHRoaXMuZHJhZyA9IHRydWVcclxuICAgICAgaWYgKHRoaXMub25EcmFnU3RhcnQgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0KClcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WClcclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ2dpbmcodGhpcy5wZXJjZW50YWdlKVxyXG4gICAgICAgIHRoaXMudXBkYXRlQmFyKGV2dC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ1N0b3AodGhpcy5wZXJjZW50YWdlKVxyXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgaW5saW5lIGNzcyBzbyB0aGF0IGl0cyBvcmlnaW5hbCBiYWNrZ3JvdW5kIGNvbG9yIHJldHVybnNcclxuICAgICAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnYmFja2dyb3VuZC1jb2xvcicpXHJcbiAgICAgICAgdGhpcy5kcmFnID0gZmFsc2VcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkTW91c2VFdmVudHMgKCkge1xyXG4gICAgdGhpcy5zbGlkZXJFbD8uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGV2dCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWcgPSB0cnVlXHJcbiAgICAgIGlmICh0aGlzLm9uRHJhZ1N0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdGFydCgpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2xpZW50WSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2xpZW50WClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChldnQpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnZ2luZyh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlQmFyKGV2dC5jbGllbnRZKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2xpZW50WClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdG9wKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICAvLyByZW1vdmUgdGhlIGlubGluZSBjc3Mgc28gdGhhdCBpdHMgb3JpZ2luYWwgYmFja2dyb3VuZCBjb2xvciByZXR1cm5zXHJcbiAgICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JhY2tncm91bmQtY29sb3InKVxyXG4gICAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcG90aWZ5UGxheWJhY2tFbGVtZW50IHtcclxuICBwcml2YXRlIHRpdGxlOiBFbGVtZW50IHwgbnVsbDtcclxuICBwdWJsaWMgY3VyclRpbWU6IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBkdXJhdGlvbjogRWxlbWVudCB8IG51bGw7XHJcbiAgcHVibGljIHBsYXlQYXVzZTogRWxlbWVudCB8IG51bGw7XHJcbiAgcHVibGljIHNvbmdQcm9ncmVzczogU2xpZGVyIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSB2b2x1bWVCYXI6IFNsaWRlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLnRpdGxlID0gbnVsbFxyXG4gICAgdGhpcy5jdXJyVGltZSA9IG51bGxcclxuICAgIHRoaXMuZHVyYXRpb24gPSBudWxsXHJcbiAgICB0aGlzLnBsYXlQYXVzZSA9IG51bGxcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRBcnRpc3RzIChhcnRpc3RIdG1sOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGFydGlzdE5hbWVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllckFydGlzdHMpXHJcbiAgICBpZiAoYXJ0aXN0TmFtZUVsKSB7XHJcbiAgICAgIHJlbW92ZUFsbENoaWxkTm9kZXMoYXJ0aXN0TmFtZUVsKVxyXG4gICAgICBhcnRpc3ROYW1lRWwuaW5uZXJIVE1MICs9IGFydGlzdEh0bWxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRJbWdTcmMgKGltZ1NyYzogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBwbGF5ZXJUcmFja0ltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXllclRyYWNrSW1nKSBhcyBIVE1MSW1hZ2VFbGVtZW50XHJcbiAgICBpZiAocGxheWVyVHJhY2tJbWcpIHtcclxuICAgICAgcGxheWVyVHJhY2tJbWcuc3JjID0gaW1nU3JjXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0VGl0bGUgKHRpdGxlOiBzdHJpbmcpIHtcclxuICAgIGlmICh0aGlzLnRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIHNldCB0aXRsZSBiZWZvcmUgaXQgaXMgYXNzaWduZWQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy50aXRsZSEudGV4dENvbnRlbnQgPSB0aXRsZVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFRpdGxlICgpOiBzdHJpbmcge1xyXG4gICAgaWYgKHRoaXMudGl0bGUgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUcnlpbmcgdG8gc2V0IHRpdGxlIGJlZm9yZSBpdCBpcyBhc3NpZ25lZCcpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy50aXRsZS50ZXh0Q29udGVudCBhcyBzdHJpbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZCB0aGUgd2ViIHBsYXllciBlbGVtZW50IHRvIHRoZSBET00gYWxvbmcgd2l0aCB0aGUgZXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgYnV0dG9ucy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwbGF5UHJldkZ1bmMgdGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBwbGF5IHByZXZpb3VzIGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqIEBwYXJhbSBwYXVzZUZ1bmMgdGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBwYXVzZS9wbGF5IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqIEBwYXJhbSBwbGF5TmV4dEZ1bmMgdGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBwbGF5IG5leHQgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlIHdlYiBwbGF5ZXIuXHJcbiAgICogQHBhcmFtIG9uU2Vla1N0YXJ0IC0gb24gZHJhZyBzdGFydCBldmVudCBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gc2Vla1NvbmcgLSBvbiBkcmFnIGVuZCBldmVudCB0byBzZWVrIHNvbmcgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIG9uU2Vla2luZyAtIG9uIGRyYWdnaW5nIGV2ZW50IGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBzZXRWb2x1bWUgLSBvbiBkcmFnZ2luZyBhbmQgb24gZHJhZyBlbmQgZXZlbnQgZm9yIHZvbHVtZSBzbGlkZXJcclxuICAgKiBAcGFyYW0gaW5pdGlhbFZvbHVtZSAtIHRoZSBpbml0aWFsIHZvbHVtZSB0byBzZXQgdGhlIHNsaWRlciBhdFxyXG4gICAqL1xyXG4gIHB1YmxpYyBhcHBlbmRXZWJQbGF5ZXJIdG1sIChcclxuICAgIHBsYXlQcmV2RnVuYzogKCkgPT4gdm9pZCxcclxuICAgIHBhdXNlRnVuYzogKCkgPT4gdm9pZCxcclxuICAgIHBsYXlOZXh0RnVuYzogKCkgPT4gdm9pZCxcclxuICAgIG9uU2Vla1N0YXJ0OiAoKSA9PiB2b2lkLFxyXG4gICAgc2Vla1Nvbmc6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQsXHJcbiAgICBvblNlZWtpbmc6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQsXHJcbiAgICBzZXRWb2x1bWU6IChwZXJjZW50YWdlOiBudW1iZXIsIHNhdmU6IGJvb2xlYW4pID0+IHZvaWQsXHJcbiAgICBpbml0aWFsVm9sdW1lOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICA8YXJ0aWNsZSBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCI+XHJcbiAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCIgc3JjPVwiJHtjb25maWcuUEFUSFMucHJvZmlsZVVzZXJ9XCIgYWx0PVwidHJhY2tcIiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucGxheWVyVHJhY2tJbWd9XCIvPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY29sdW1ufVwiIHN0eWxlPVwiZmxleC1iYXNpczogMzAlOyBtYXgtd2lkdGg6IDE4LjV2dztcIj5cclxuICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+U2VsZWN0IGEgU29uZzwvaDQ+XHJcbiAgICAgICAgPHNwYW4gaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllckFydGlzdHN9XCI+PC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLndlYlBsYXllckNvbnRyb2xzfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCI+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxhcnRpY2xlIGlkPVwid2ViLXBsYXllci1idXR0b25zXCI+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnNodWZmbGV9XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5zaHVmZmxlSWNvbn1cIi8+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXlQcmV2fVwiIGNsYXNzPVwibmV4dC1wcmV2XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5UHJldn1cIiBhbHQ9XCJwcmV2aW91c1wiLz48L2J1dHRvbj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyUGxheVBhdXNlfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn1cIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucGxheU5leHR9XCIgY2xhc3M9XCJuZXh0LXByZXZcIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlOZXh0fVwiIGFsdD1cIm5leHRcIi8+PC9idXR0b24+XHJcbiAgICAgICAgICA8L2FydGljbGU+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJWb2x1bWV9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5zbGlkZXJ9XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzc31cIj48L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXlUaW1lQmFyfVwiPlxyXG4gICAgICAgICAgPHA+MDowMDwvcD5cclxuICAgICAgICAgIDxkaXYgaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllclByb2dyZXNzfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2xpZGVyfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3N9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxwPjA6MDA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9hcnRpY2xlPlxyXG4gICAgYFxyXG5cclxuICAgIGNvbnN0IHdlYlBsYXllckVsID0gaHRtbFRvRWwoaHRtbClcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKHdlYlBsYXllckVsIGFzIE5vZGUpXHJcbiAgICB0aGlzLmdldFdlYlBsYXllckVscyhcclxuICAgICAgb25TZWVrU3RhcnQsXHJcbiAgICAgIHNlZWtTb25nLFxyXG4gICAgICBvblNlZWtpbmcsXHJcbiAgICAgIHNldFZvbHVtZSxcclxuICAgICAgaW5pdGlhbFZvbHVtZSlcclxuICAgIHRoaXMuYXNzaWduRXZlbnRMaXN0ZW5lcnMoXHJcbiAgICAgIHBsYXlQcmV2RnVuYyxcclxuICAgICAgcGF1c2VGdW5jLFxyXG4gICAgICBwbGF5TmV4dEZ1bmNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwZXJjZW50RG9uZSB0aGUgcGVyY2VudCBvZiB0aGUgc29uZyB0aGF0IGhhcyBiZWVuIGNvbXBsZXRlZFxyXG4gICAqIEBwYXJhbSBwb3NpdGlvbiB0aGUgY3VycmVudCBwb3NpdGlvbiBpbiBtcyB0aGF0IGhhcyBiZWVuIGNvbXBsZXRlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVFbGVtZW50IChwZXJjZW50RG9uZTogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAvLyBpZiB0aGUgdXNlciBpcyBkcmFnZ2luZyB0aGUgc29uZyBwcm9ncmVzcyBiYXIgZG9uJ3QgYXV0byB1cGRhdGVcclxuICAgIGlmIChwb3NpdGlvbiAhPT0gMCAmJiAhdGhpcy5zb25nUHJvZ3Jlc3MhLmRyYWcpIHtcclxuICAgICAgLy8gcm91bmQgZWFjaCBpbnRlcnZhbCB0byB0aGUgbmVhcmVzdCBzZWNvbmQgc28gdGhhdCB0aGUgbW92ZW1lbnQgb2YgcHJvZ3Jlc3MgYmFyIGlzIGJ5IHNlY29uZC5cclxuICAgICAgdGhpcy5zb25nUHJvZ3Jlc3MhLnNsaWRlclByb2dyZXNzIS5zdHlsZS53aWR0aCA9IGAke3BlcmNlbnREb25lfSVgXHJcbiAgICAgIGlmICh0aGlzLmN1cnJUaW1lID09IG51bGwpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgdGltZSBlbGVtZW50IGlzIG51bGwnKVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuY3VyclRpbWUudGV4dENvbnRlbnQgPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKHBvc2l0aW9uKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmUgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudHMgb25jZSB0aGUgd2ViIHBsYXllciBlbGVtZW50IGhhcyBiZWVuIGFwcGVuZWRlZCB0byB0aGUgRE9NLiBJbml0aWFsaXplcyBTbGlkZXJzLlxyXG4gICAqIEBwYXJhbSBvblNlZWtTdGFydCAtIG9uIGRyYWcgc3RhcnQgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNlZWtTb25nIC0gb24gZHJhZyBlbmQgZXZlbnQgdG8gc2VlayBzb25nIGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBvblNlZWtpbmcgLSBvbiBkcmFnZ2luZyBldmVudCBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gc2V0Vm9sdW1lIC0gb24gZHJhZ2dpbmcgYW5kIG9uIGRyYWcgZW5kIGV2ZW50IGZvciB2b2x1bWUgc2xpZGVyXHJcbiAgICogQHBhcmFtIGluaXRpYWxWb2x1bWUgLSB0aGUgaW5pdGlhbCB2b2x1bWUgdG8gc2V0IHRoZSBzbGlkZXIgYXRcclxuICAgKi9cclxuICBwcml2YXRlIGdldFdlYlBsYXllckVscyAoXHJcbiAgICBvblNlZWtTdGFydDogKCkgPT4gdm9pZCxcclxuICAgIHNlZWtTb25nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgb25TZWVraW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgc2V0Vm9sdW1lOiAocGVyY2VudGFnZTogbnVtYmVyLCBzYXZlOiBib29sZWFuKSA9PiB2b2lkLFxyXG4gICAgaW5pdGlhbFZvbHVtZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllcikgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgY29uc3QgcGxheVRpbWVCYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcikgPz8gdGhyb3dFeHByZXNzaW9uKCdwbGF5IHRpbWUgYmFyIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICAgIGNvbnN0IHNvbmdTbGlkZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclByb2dyZXNzKSBhcyBIVE1MRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgcHJvZ3Jlc3MgYmFyIGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHZvbHVtZVNsaWRlckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMud2ViUGxheWVyVm9sdW1lKSBhcyBIVE1MRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgdm9sdW1lIGJhciBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgdGhpcy5zb25nUHJvZ3Jlc3MgPSBuZXcgU2xpZGVyKDAsIHNlZWtTb25nLCBmYWxzZSwgb25TZWVrU3RhcnQsIG9uU2Vla2luZywgc29uZ1NsaWRlckVsKVxyXG4gICAgdGhpcy52b2x1bWVCYXIgPSBuZXcgU2xpZGVyKGluaXRpYWxWb2x1bWUgKiAxMDAsIChwZXJjZW50YWdlKSA9PiBzZXRWb2x1bWUocGVyY2VudGFnZSwgZmFsc2UpLCBmYWxzZSwgKCkgPT4ge30sIChwZXJjZW50YWdlKSA9PiBzZXRWb2x1bWUocGVyY2VudGFnZSwgdHJ1ZSksIHZvbHVtZVNsaWRlckVsKVxyXG5cclxuICAgIHRoaXMudGl0bGUgPSB3ZWJQbGF5ZXJFbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaDQnKVswXSBhcyBFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciB0aXRsZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICAvLyBnZXQgcGxheXRpbWUgYmFyIGVsZW1lbnRzXHJcbiAgICB0aGlzLmN1cnJUaW1lID0gcGxheVRpbWVCYXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3AnKVswXSBhcyBFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBjdXJyZW50IHRpbWUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICB0aGlzLmR1cmF0aW9uID0gcGxheVRpbWVCYXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3AnKVsxXSBhcyBFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBkdXJhdGlvbiB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICAgIHRoaXMucGxheVBhdXNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMud2ViUGxheWVyUGxheVBhdXNlKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXNzaWducyB0aGUgZXZlbnRzIHRvIHJ1biBvbiBlYWNoIGJ1dHRvbiBwcmVzcyB0aGF0IGV4aXN0cyBvbiB0aGUgd2ViIHBsYXllciBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBsYXlQcmV2RnVuYyBmdW5jdGlvbiB0byBydW4gd2hlbiBwbGF5IHByZXZpb3VzIGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICogQHBhcmFtIHBhdXNlRnVuYyBmdW5jdGlvbiB0byBydW4gd2hlbiBwbGF5L3BhdXNlIGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICogQHBhcmFtIHBsYXlOZXh0RnVuYyBmdW5jdGlvbiB0byBydW4gd2hlbiBwbGF5IG5leHQgYnV0dG9uIGlzIHByZXNzZWRcclxuICAgKi9cclxuICBwcml2YXRlIGFzc2lnbkV2ZW50TGlzdGVuZXJzIChcclxuICAgIHBsYXlQcmV2RnVuYzogKCkgPT4gdm9pZCxcclxuICAgIHBhdXNlRnVuYzogKCkgPT4gdm9pZCxcclxuICAgIHBsYXlOZXh0RnVuYzogKCkgPT4gdm9pZCkge1xyXG4gICAgY29uc3QgcGxheVByZXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5UHJldilcclxuICAgIGNvbnN0IHBsYXlOZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheU5leHQpXHJcbiAgICBjb25zdCBzaHVmZmxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuc2h1ZmZsZSlcclxuXHJcbiAgICBzaHVmZmxlPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgcGxheWVyUHVibGljVmFycy5pc1NodWZmbGUgPSAhcGxheWVyUHVibGljVmFycy5pc1NodWZmbGVcclxuICAgIH0pXHJcbiAgICBwbGF5UHJldj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwbGF5UHJldkZ1bmMpXHJcbiAgICBwbGF5TmV4dD8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwbGF5TmV4dEZ1bmMpXHJcblxyXG4gICAgdGhpcy5wbGF5UGF1c2U/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGF1c2VGdW5jKVxyXG4gICAgdGhpcy5zb25nUHJvZ3Jlc3M/LmFkZEV2ZW50TGlzdGVuZXJzKClcclxuICAgIHRoaXMudm9sdW1lQmFyPy5hZGRFdmVudExpc3RlbmVycygpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgaHRtbFRvRWwsXHJcbiAgZ2V0VmFsaWRJbWFnZSxcclxuICBzaHVmZmxlXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQge1xyXG4gIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIsXHJcbiAgaXNTYW1lUGxheWluZ1VSSSxcclxuICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsLFxyXG4gIHBsYXllclB1YmxpY1ZhcnNcclxufSBmcm9tICcuL3BsYXliYWNrLXNkaydcclxuaW1wb3J0IEFsYnVtIGZyb20gJy4vYWxidW0nXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IFBsYXlhYmxlRXZlbnRBcmcgZnJvbSAnLi9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MnXHJcbmltcG9ydCB7IFNwb3RpZnlJbWcsIEZlYXR1cmVzRGF0YSwgSUFydGlzdFRyYWNrRGF0YSwgSVBsYXlhYmxlLCBFeHRlcm5hbFVybHMsIFRyYWNrRGF0YSB9IGZyb20gJy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCwgeyBhcnJheVRvRG91Ymx5TGlua2VkTGlzdCwgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vcHVic3ViL2FnZ3JlZ2F0b3InXHJcblxyXG5jb25zdCBldmVudEFnZ3JlZ2F0b3IgPSAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yIGFzIEV2ZW50QWdncmVnYXRvclxyXG5cclxuY2xhc3MgVHJhY2sgZXh0ZW5kcyBDYXJkIGltcGxlbWVudHMgSVBsYXlhYmxlIHtcclxuICBwcml2YXRlIGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzO1xyXG4gIHByaXZhdGUgX2lkOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfdGl0bGU6IHN0cmluZztcclxuICBwcml2YXRlIF9kdXJhdGlvbjogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3VyaTogc3RyaW5nO1xyXG4gIHByaXZhdGUgX2RhdGVBZGRlZFRvUGxheWxpc3Q6IERhdGU7XHJcblxyXG4gIHBvcHVsYXJpdHk6IHN0cmluZztcclxuICByZWxlYXNlRGF0ZTogRGF0ZTtcclxuICBhbGJ1bTogQWxidW07XHJcbiAgZmVhdHVyZXM6IEZlYXR1cmVzRGF0YSB8IHVuZGVmaW5lZDtcclxuICBpbWFnZVVybDogc3RyaW5nO1xyXG4gIHNlbEVsOiBFbGVtZW50O1xyXG4gIG9uUGxheWluZzogRnVuY3Rpb25cclxuICBvblN0b3BwZWQ6IEZ1bmN0aW9uXHJcbiAgYXJ0aXN0c0h0bWw6IHN0cmluZ1xyXG5cclxuICBwdWJsaWMgZ2V0IGlkICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lkXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRpdGxlICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RpdGxlXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHVyaSAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl91cmlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZGF0ZUFkZGVkVG9QbGF5bGlzdCAoKTogRGF0ZSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdFxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldERhdGVBZGRlZFRvUGxheWxpc3QgKHZhbDogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSkge1xyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKHZhbClcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChwcm9wczogeyB0aXRsZTogc3RyaW5nOyBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+OyBkdXJhdGlvbjogbnVtYmVyOyB1cmk6IHN0cmluZzsgcG9wdWxhcml0eTogc3RyaW5nOyByZWxlYXNlRGF0ZTogc3RyaW5nOyBpZDogc3RyaW5nOyBhbGJ1bTogQWxidW07IGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzOyBhcnRpc3RzOiBBcnJheTx1bmtub3duPjsgaWR4OiBudW1iZXIgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgY29uc3Qge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgaW1hZ2VzLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgICAgdXJpLFxyXG4gICAgICBwb3B1bGFyaXR5LFxyXG4gICAgICByZWxlYXNlRGF0ZSxcclxuICAgICAgaWQsXHJcbiAgICAgIGFsYnVtLFxyXG4gICAgICBleHRlcm5hbFVybHMsXHJcbiAgICAgIGFydGlzdHNcclxuICAgIH0gPSBwcm9wc1xyXG5cclxuICAgIHRoaXMuZXh0ZXJuYWxVcmxzID0gZXh0ZXJuYWxVcmxzXHJcbiAgICB0aGlzLl9pZCA9IGlkXHJcbiAgICB0aGlzLl90aXRsZSA9IHRpdGxlXHJcbiAgICB0aGlzLmFydGlzdHNIdG1sID0gdGhpcy5nZW5lcmF0ZUhUTUxBcnRpc3ROYW1lcyhhcnRpc3RzKVxyXG4gICAgdGhpcy5fZHVyYXRpb24gPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKGR1cmF0aW9uKVxyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKClcclxuXHJcbiAgICAvLyBlaXRoZXIgdGhlIG5vcm1hbCB1cmksIG9yIHRoZSBsaW5rZWRfZnJvbS51cmlcclxuICAgIHRoaXMuX3VyaSA9IHVyaVxyXG4gICAgdGhpcy5wb3B1bGFyaXR5ID0gcG9wdWxhcml0eVxyXG4gICAgdGhpcy5yZWxlYXNlRGF0ZSA9IG5ldyBEYXRlKHJlbGVhc2VEYXRlKVxyXG4gICAgdGhpcy5hbGJ1bSA9IGFsYnVtXHJcbiAgICB0aGlzLmZlYXR1cmVzID0gdW5kZWZpbmVkXHJcblxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy5zZWxFbCA9IGh0bWxUb0VsKCc8PjwvPicpIGFzIEVsZW1lbnRcclxuXHJcbiAgICB0aGlzLm9uUGxheWluZyA9ICgpID0+IHt9XHJcbiAgICB0aGlzLm9uU3RvcHBlZCA9ICgpID0+IHt9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZpbHRlckRhdGFGcm9tQXJ0aXN0cyAoYXJ0aXN0czogQXJyYXk8dW5rbm93bj4pIHtcclxuICAgIHJldHVybiBhcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiBhcnRpc3QgYXMgSUFydGlzdFRyYWNrRGF0YSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMgKGFydGlzdHM6IEFycmF5PHVua25vd24+KSB7XHJcbiAgICBjb25zdCBhcnRpc3RzRGF0YXMgPSB0aGlzLmZpbHRlckRhdGFGcm9tQXJ0aXN0cyhhcnRpc3RzKVxyXG4gICAgbGV0IGFydGlzdE5hbWVzID0gJydcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJ0aXN0c0RhdGFzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGFydGlzdCA9IGFydGlzdHNEYXRhc1tpXVxyXG4gICAgICBhcnRpc3ROYW1lcyArPSBgPGEgaHJlZj1cIiR7YXJ0aXN0LmV4dGVybmFsX3VybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FydGlzdC5uYW1lfTwvYT5gXHJcblxyXG4gICAgICBpZiAoaSA8IGFydGlzdHNEYXRhcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgYXJ0aXN0TmFtZXMgKz0gJywgJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJ0aXN0TmFtZXNcclxuICB9XHJcblxyXG4gIC8qKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgdHJhY2suXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhY2tDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSkgOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMudHJhY2tQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnJhbmtDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUluXHJcbiAgICB9ICR7YXBwZWFyQ2xhc3N9XCI+XHJcbiAgICAgICAgICAgICAgPGg0IGlkPVwiJHtjb25maWcuQ1NTLklEcy5yYW5rfVwiPiR7aWR4ICsgMX0uPC9oND5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja31cIiBpZD1cIiR7dGhpcy5nZXRDYXJkSWQoKX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkRnJvbnRcclxuICAgICAgICAgICAgICAgICAgfVwiICB0aXRsZT1cIkNsaWNrIHRvIHZpZXcgbW9yZSBJbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiAke2NvbmZpZy5DU1MuQVRUUklCVVRFUy5yZXN0cmljdEZsaXBPbkNsaWNrfT1cInRydWVcIiBpZD1cIiR7dGhpcy5fdXJpfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCIgdGl0bGU9XCJDbGljayB0byBwbGF5IHNvbmdcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZVVybH1cIiBhbHQ9XCJBbGJ1bSBDb3ZlclwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxpbmdUZXh0XHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfTwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkQmFja30+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkR1cmF0aW9uOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+JHt0aGlzLl9kdXJhdGlvbn08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPlJlbGVhc2UgRGF0ZTo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5yZWxlYXNlRGF0ZS50b0RhdGVTdHJpbmcoKX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkFsYnVtIE5hbWU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHAgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMucmVzdHJpY3RGbGlwT25DbGlja309XCJ0cnVlXCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+JHtcclxuICAgICAgdGhpcy5hbGJ1bS5uYW1lXHJcbiAgICB9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKSBhcyBIVE1MRWxlbWVudFxyXG4gICAgY29uc3QgcGxheUJ0biA9IGVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG4pWzBdXHJcblxyXG4gICAgdGhpcy5zZWxFbCA9IHBsYXlCdG5cclxuXHJcbiAgICBwbGF5QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFja05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPih0aGlzKVxyXG4gICAgICB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSlcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGxheVBhdXNlQ2xpY2sgKHRyYWNrTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiwgdHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4gfCBudWxsID0gbnVsbCkge1xyXG4gICAgY29uc3QgdHJhY2sgPSB0aGlzIGFzIElQbGF5YWJsZVxyXG4gICAgbGV0IHRyYWNrQXJyID0gbnVsbFxyXG5cclxuICAgIGlmICh0cmFja0xpc3QpIHtcclxuICAgICAgdHJhY2tBcnIgPSB0cmFja0xpc3QudG9BcnJheSgpXHJcbiAgICB9XHJcbiAgICBldmVudEFnZ3JlZ2F0b3IucHVibGlzaChuZXcgUGxheWFibGVFdmVudEFyZyh0cmFjaywgdHJhY2tOb2RlLCB0cmFja0FycikpXHJcbiAgfVxyXG5cclxuICAvKiogR2V0IGEgdHJhY2sgaHRtbCB0byBiZSBwbGFjZWQgYXMgYSBsaXN0IGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRpc3BsYXlEYXRlIC0gd2hldGhlciB0byBkaXNwbGF5IHRoZSBkYXRlLlxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFBsYXlsaXN0VHJhY2tIdG1sICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8SVBsYXlhYmxlPiwgZGlzcGxheURhdGU6IGJvb2xlYW4gPSB0cnVlKTogTm9kZSB7XHJcbiAgICBjb25zdCB0cmFja05vZGUgPSB0cmFja0xpc3QuZmluZCgoeCkgPT4geC51cmkgPT09IHRoaXMudXJpLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICAvLyBmb3IgdGhlIHVuaXF1ZSBwbGF5IHBhdXNlIElEIGFsc28gdXNlIHRoZSBkYXRlIGFkZGVkIHRvIHBsYXlsaXN0IGFzIHRoZXJlIGNhbiBiZSBkdXBsaWNhdGVzIG9mIGEgc29uZyBpbiBhIHBsYXlsaXN0LlxyXG4gICAgY29uc3QgcGxheVBhdXNlSWQgPSB0aGlzLl91cmkgKyB0aGlzLmRhdGVBZGRlZFRvUGxheWxpc3RcclxuXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFRyYWNrfVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke3BsYXlQYXVzZUlkfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0fVwiIHNyYz1cIiR7XHJcbiAgICAgIHRoaXMuaW1hZ2VVcmxcclxuICAgIH1cIj48L2ltZz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubGlua3N9XCI+XHJcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiIHRhcmdldD1cIl9ibGFua1wiPlxyXG4gICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lXHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfVxyXG4gICAgICAgICAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgICAgICAgPGEvPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj5cclxuICAgICAgICAgICAgICAgICAgJHt0aGlzLmFydGlzdHNIdG1sfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGg1PiR7dGhpcy5fZHVyYXRpb259PC9oNT5cclxuICAgICAgICAgICAgICAke1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheURhdGVcclxuICAgICAgICAgICAgICAgICAgPyBgPGg1PiR7dGhpcy5kYXRlQWRkZWRUb1BsYXlsaXN0LnRvTG9jYWxlRGF0ZVN0cmluZygpfTwvaDU+YFxyXG4gICAgICAgICAgICAgICAgICA6ICcnXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKVxyXG5cclxuICAgIC8vIGdldCBwbGF5IHBhdXNlIGJ1dHRvblxyXG4gICAgY29uc3QgcGxheVBhdXNlQnRuID0gZWw/LmNoaWxkTm9kZXNbMV1cclxuICAgIGlmIChwbGF5UGF1c2VCdG4gPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGF5IHBhdXNlIGJ1dHRvbiBvbiB0cmFjayB3YXMgbm90IGZvdW5kJylcclxuICAgIH1cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudFxyXG4gICAgcGxheVBhdXNlQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMucGxheVBhdXNlQ2xpY2sodHJhY2tOb2RlLCB0cmFja0xpc3QpKVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBHZXQgYSB0cmFjayBodG1sIHRvIGJlIHBsYWNlZCBhcyBhIGxpc3QgZWxlbWVudCBvbiBhIHJhbmtlZCBsaXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEb3VibHlMaW5rZWRMaXN0PFRyYWNrPn0gdHJhY2tMaXN0IC0gbGlzdCBvZiB0cmFja3MgdGhhdCBjb250YWlucyB0aGlzIHRyYWNrLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYW5rIC0gdGhlIHJhbmsgb2YgdGhpcyBjYXJkXHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmFua2VkVHJhY2tIdG1sICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+LCByYW5rOiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IHRyYWNrTm9kZSA9IHRyYWNrTGlzdC5maW5kKCh4KSA9PiB4LnVyaSA9PT0gdGhpcy51cmksIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0VHJhY2t9XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rZWRUcmFja0ludGVyYWN0fSAke1xyXG4gICAgICAgICAgICAgICAgaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh0aGlzLnVyaSkgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHt0aGlzLl91cml9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRufSAke1xyXG4gICAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPHA+JHtyYW5rfS48L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIiBzcmM9XCIke1xyXG4gICAgICB0aGlzLmltYWdlVXJsXHJcbiAgICB9XCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmxpbmtzfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubmFtZVxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX1cclxuICAgICAgICAgICAgICAgICAgPC9oND5cclxuICAgICAgICAgICAgICAgIDxhLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dGhpcy5hcnRpc3RzSHRtbH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgIGBcclxuXHJcbiAgICBjb25zdCBlbCA9IGh0bWxUb0VsKGh0bWwpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXkgcGF1c2UgYnV0dG9uXHJcbiAgICBjb25zdCBwbGF5UGF1c2VCdG4gPSBlbD8uY2hpbGROb2Rlc1sxXS5jaGlsZE5vZGVzWzFdXHJcblxyXG4gICAgaWYgKHBsYXlQYXVzZUJ0biA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsYXkgcGF1c2UgYnV0dG9uIG9uIHRyYWNrIHdhcyBub3QgZm91bmQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5zZWxFbCA9IHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50XHJcblxyXG4gICAgLy8gc2VsZWN0IHRoZSByYW5rIGFyZWEgYXMgdG8ga2VlcCB0aGUgcGxheS9wYXVzZSBpY29uIHNob3duXHJcbiAgICBjb25zdCByYW5rZWRJbnRlcmFjdCA9IChlbCBhcyBIVE1MRWxlbWVudCkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMucmFua2VkVHJhY2tJbnRlcmFjdClbMF1cclxuICAgIHRoaXMub25QbGF5aW5nID0gKCkgPT4gcmFua2VkSW50ZXJhY3QuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLm9uU3RvcHBlZCA9ICgpID0+IHJhbmtlZEludGVyYWN0LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG5cclxuICAgIHBsYXlQYXVzZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGxheVBhdXNlQ2xpY2sodHJhY2tOb2RlLCB0cmFja0xpc3QpXHJcbiAgICB9KVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIHRoZSBmZWF0dXJlcyBvZiB0aGlzIHRyYWNrIGZyb20gdGhlIHNwb3RpZnkgd2ViIGFwaS4gKi9cclxuICBwdWJsaWMgYXN5bmMgbG9hZEZlYXR1cmVzICgpIHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zXHJcbiAgICAgIC5nZXQoY29uZmlnLlVSTHMuZ2V0VHJhY2tGZWF0dXJlcyArIHRoaXMuaWQpXHJcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgZXJyXHJcbiAgICAgIH0pXHJcbiAgICBjb25zdCBmZWF0cyA9IHJlcy5kYXRhLmF1ZGlvX2ZlYXR1cmVzXHJcbiAgICB0aGlzLmZlYXR1cmVzID0ge1xyXG4gICAgICBkYW5jZWFiaWxpdHk6IGZlYXRzLmRhbmNlYWJpbGl0eSxcclxuICAgICAgYWNvdXN0aWNuZXNzOiBmZWF0cy5hY291c3RpY25lc3MsXHJcbiAgICAgIGluc3RydW1lbnRhbG5lc3M6IGZlYXRzLmluc3RydW1lbnRhbG5lc3MsXHJcbiAgICAgIHZhbGVuY2U6IGZlYXRzLnZhbGVuY2UsXHJcbiAgICAgIGVuZXJneTogZmVhdHMuZW5lcmd5XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNcclxuICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmF0ZSB0cmFja3MgZnJvbSBkYXRhIGV4Y2x1ZGluZyBkYXRlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFRyYWNrRGF0YT59IGRhdGFzXHJcbiAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBBcnJheTxUcmFjaz59IHRyYWNrcyAtIGRvdWJsZSBsaW5rZWQgbGlzdFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgKGRhdGFzOiBBcnJheTxUcmFja0RhdGE+LCB0cmFja3M6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgQXJyYXk8VHJhY2s+KSB7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgZGF0YSA9IGRhdGFzW2ldXHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICBjb25zdCBwcm9wcyA9IHtcclxuICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgIGltYWdlczogZGF0YS5hbGJ1bS5pbWFnZXMsXHJcbiAgICAgICAgZHVyYXRpb246IGRhdGEuZHVyYXRpb25fbXMsXHJcbiAgICAgICAgdXJpOiBkYXRhLmxpbmtlZF9mcm9tICE9PSB1bmRlZmluZWQgPyBkYXRhLmxpbmtlZF9mcm9tLnVyaSA6IGRhdGEudXJpLFxyXG4gICAgICAgIHBvcHVsYXJpdHk6IGRhdGEucG9wdWxhcml0eSxcclxuICAgICAgICByZWxlYXNlRGF0ZTogZGF0YS5hbGJ1bS5yZWxlYXNlX2RhdGUsXHJcbiAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgYWxidW06IG5ldyBBbGJ1bShkYXRhLmFsYnVtLm5hbWUsIGRhdGEuYWxidW0uZXh0ZXJuYWxfdXJscy5zcG90aWZ5KSxcclxuICAgICAgICBleHRlcm5hbFVybHM6IGRhdGEuZXh0ZXJuYWxfdXJscyxcclxuICAgICAgICBhcnRpc3RzOiBkYXRhLmFydGlzdHMsXHJcbiAgICAgICAgaWR4OiBpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodHJhY2tzKSkge1xyXG4gICAgICAgIHRyYWNrcy5wdXNoKG5ldyBUcmFjayhwcm9wcykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdHJhY2tzLmFkZChuZXcgVHJhY2socHJvcHMpKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cmFja3NcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJhY2tcclxuIiwiXHJcbmltcG9ydCB7IElQcm9taXNlSGFuZGxlclJldHVybiwgU3BvdGlmeUltZyB9IGZyb20gJy4uL3R5cGVzJ1xyXG5pbXBvcnQgeyBURVJNUywgVEVSTV9UWVBFIH0gZnJvbSAnLi9jb21wb25lbnRzL3NhdmUtbG9hZC10ZXJtJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5jb25zdCBhdXRoRW5kcG9pbnQgPSAnaHR0cHM6Ly9hY2NvdW50cy5zcG90aWZ5LmNvbS9hdXRob3JpemUnXHJcbi8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFwcCdzIGNsaWVudCBJRCwgcmVkaXJlY3QgVVJJIGFuZCBkZXNpcmVkIHNjb3Blc1xyXG5jb25zdCByZWRpcmVjdFVyaSA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXHJcbmNvbnN0IGNsaWVudElkID0gJzQzNGY1ZTlmNDQyYTRlNDU4NmUwODlhMzNmNjVjODU3J1xyXG5jb25zdCBzY29wZXMgPSBbXHJcbiAgJ3VnYy1pbWFnZS11cGxvYWQnLFxyXG4gICd1c2VyLXJlYWQtcGxheWJhY2stc3RhdGUnLFxyXG4gICd1c2VyLW1vZGlmeS1wbGF5YmFjay1zdGF0ZScsXHJcbiAgJ3VzZXItcmVhZC1jdXJyZW50bHktcGxheWluZycsXHJcbiAgJ3N0cmVhbWluZycsXHJcbiAgJ2FwcC1yZW1vdGUtY29udHJvbCcsXHJcbiAgJ3VzZXItcmVhZC1lbWFpbCcsXHJcbiAgJ3VzZXItcmVhZC1wcml2YXRlJyxcclxuICAncGxheWxpc3QtcmVhZC1jb2xsYWJvcmF0aXZlJyxcclxuICAncGxheWxpc3QtbW9kaWZ5LXB1YmxpYycsXHJcbiAgJ3BsYXlsaXN0LXJlYWQtcHJpdmF0ZScsXHJcbiAgJ3BsYXlsaXN0LW1vZGlmeS1wcml2YXRlJyxcclxuICAndXNlci1saWJyYXJ5LW1vZGlmeScsXHJcbiAgJ3VzZXItbGlicmFyeS1yZWFkJyxcclxuICAndXNlci10b3AtcmVhZCcsXHJcbiAgJ3VzZXItcmVhZC1wbGF5YmFjay1wb3NpdGlvbicsXHJcbiAgJ3VzZXItcmVhZC1yZWNlbnRseS1wbGF5ZWQnLFxyXG4gICd1c2VyLWZvbGxvdy1yZWFkJyxcclxuICAndXNlci1mb2xsb3ctbW9kaWZ5J1xyXG5dXHJcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XHJcbiAgQ1NTOiB7XHJcbiAgICBJRHM6IHtcclxuICAgICAgZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lcjogJ2dldC10b2tlbi1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBwbGF5bGlzdENhcmRzQ29udGFpbmVyOiAncGxheWxpc3QtY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgdHJhY2tDYXJkc0NvbnRhaW5lcjogJ3RyYWNrLWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIHBsYXlsaXN0UHJlZml4OiAncGxheWxpc3QtJyxcclxuICAgICAgdHJhY2tQcmVmaXg6ICd0cmFjay0nLFxyXG4gICAgICBzcG90aWZ5Q29udGFpbmVyOiAnc3BvdGlmeS1jb250YWluZXInLFxyXG4gICAgICBpbmZvQ29udGFpbmVyOiAnaW5mby1jb250YWluZXInLFxyXG4gICAgICBhbGxvd0FjY2Vzc0hlYWRlcjogJ2FsbG93LWFjY2Vzcy1oZWFkZXInLFxyXG4gICAgICBleHBhbmRlZFBsYXlsaXN0TW9kczogJ2V4cGFuZGVkLXBsYXlsaXN0LW1vZHMnLFxyXG4gICAgICB0cmFja3NEYXRhOiAndHJhY2tzLWRhdGEnLFxyXG4gICAgICB0cmFja3NDaGFydDogJ3RyYWNrcy1jaGFydCcsXHJcbiAgICAgIHRyYWNrc1Rlcm1TZWxlY3Rpb25zOiAndHJhY2tzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIGZlYXR1cmVTZWxlY3Rpb25zOiAnZmVhdHVyZS1zZWxlY3Rpb25zJyxcclxuICAgICAgcGxheWxpc3RzU2VjdGlvbjogJ3BsYXlsaXN0cy1zZWN0aW9uJyxcclxuICAgICAgZmVhdERlZjogJ2ZlYXQtZGVmaW5pdGlvbicsXHJcbiAgICAgIGZlYXRBdmVyYWdlOiAnZmVhdC1hdmVyYWdlJyxcclxuICAgICAgcmFuazogJ3JhbmsnLFxyXG4gICAgICB2aWV3QWxsVG9wVHJhY2tzOiAndmlldy1hbGwtdG9wLXRyYWNrcycsXHJcbiAgICAgIGVtb2ppczogJ2Vtb2ppcycsXHJcbiAgICAgIGFydGlzdENhcmRzQ29udGFpbmVyOiAnYXJ0aXN0LWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIGFydGlzdFByZWZpeDogJ2FydGlzdC0nLFxyXG4gICAgICBpbml0aWFsQ2FyZDogJ2luaXRpYWwtY2FyZCcsXHJcbiAgICAgIGNvbnZlcnRDYXJkOiAnY29udmVydC1jYXJkJyxcclxuICAgICAgYXJ0aXN0VGVybVNlbGVjdGlvbnM6ICdhcnRpc3RzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIHByb2ZpbGVIZWFkZXI6ICdwcm9maWxlLWhlYWRlcicsXHJcbiAgICAgIGNsZWFyRGF0YTogJ2NsZWFyLWRhdGEnLFxyXG4gICAgICBsaWtlZFRyYWNrczogJ2xpa2VkLXRyYWNrcycsXHJcbiAgICAgIGZvbGxvd2VkQXJ0aXN0czogJ2ZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgICB3ZWJQbGF5ZXI6ICd3ZWItcGxheWVyJyxcclxuICAgICAgcGxheVRpbWVCYXI6ICdwbGF5dGltZS1iYXInLFxyXG4gICAgICBwbGF5bGlzdEhlYWRlckFyZWE6ICdwbGF5bGlzdC1tYWluLWhlYWRlci1hcmVhJyxcclxuICAgICAgcGxheU5leHQ6ICdwbGF5LW5leHQnLFxyXG4gICAgICBwbGF5UHJldjogJ3BsYXktcHJldicsXHJcbiAgICAgIHdlYlBsYXllclBsYXlQYXVzZTogJ3BsYXktcGF1c2UtcGxheWVyJyxcclxuICAgICAgd2ViUGxheWVyVm9sdW1lOiAnd2ViLXBsYXllci12b2x1bWUtYmFyJyxcclxuICAgICAgd2ViUGxheWVyUHJvZ3Jlc3M6ICd3ZWItcGxheWVyLXByb2dyZXNzLWJhcicsXHJcbiAgICAgIHBsYXllclRyYWNrSW1nOiAncGxheWVyLXRyYWNrLWltZycsXHJcbiAgICAgIHdlYlBsYXllckFydGlzdHM6ICd3ZWItcGxheWVyLWFydGlzdHMnLFxyXG4gICAgICBnZW5lcmF0ZVBsYXlsaXN0OiAnZ2VuZXJhdGUtcGxheWxpc3QnLFxyXG4gICAgICBoaWRlU2hvd1BsYXlsaXN0VHh0OiAnaGlkZS1zaG93LXBsYXlsaXN0LXR4dCcsXHJcbiAgICAgIHRvcFRyYWNrc1RleHRGb3JtQ29udGFpbmVyOiAndGVybS10ZXh0LWZvcm0tY29udGFpbmVyJyxcclxuICAgICAgdXNlcm5hbWU6ICd1c2VybmFtZScsXHJcbiAgICAgIHRvcE5hdk1vYmlsZTogJ3RvcG5hdi1tb2JpbGUnLFxyXG4gICAgICBzaHVmZmxlOiAnc2h1ZmZsZSdcclxuICAgIH0sXHJcbiAgICBDTEFTU0VTOiB7XHJcbiAgICAgIGdsb3c6ICdnbG93JyxcclxuICAgICAgcGxheWxpc3Q6ICdwbGF5bGlzdCcsXHJcbiAgICAgIHRyYWNrOiAndHJhY2snLFxyXG4gICAgICBhcnRpc3Q6ICdhcnRpc3QnLFxyXG4gICAgICByYW5rQ2FyZDogJ3JhbmstY2FyZCcsXHJcbiAgICAgIHBsYXlsaXN0VHJhY2s6ICdwbGF5bGlzdC10cmFjaycsXHJcbiAgICAgIGluZm9Mb2FkaW5nU3Bpbm5lcnM6ICdpbmZvLWxvYWRpbmctc3Bpbm5lcicsXHJcbiAgICAgIGFwcGVhcjogJ2FwcGVhcicsXHJcbiAgICAgIGhpZGU6ICdoaWRlJyxcclxuICAgICAgc2VsZWN0ZWQ6ICdzZWxlY3RlZCcsXHJcbiAgICAgIGNhcmQ6ICdjYXJkJyxcclxuICAgICAgcGxheWxpc3RTZWFyY2g6ICdwbGF5bGlzdC1zZWFyY2gnLFxyXG4gICAgICBlbGxpcHNpc1dyYXA6ICdlbGxpcHNpcy13cmFwJyxcclxuICAgICAgbmFtZTogJ25hbWUnLFxyXG4gICAgICBwbGF5bGlzdE9yZGVyOiAncGxheWxpc3Qtb3JkZXInLFxyXG4gICAgICBjaGFydEluZm86ICdjaGFydC1pbmZvJyxcclxuICAgICAgZmxpcENhcmRJbm5lcjogJ2ZsaXAtY2FyZC1pbm5lcicsXHJcbiAgICAgIGZsaXBDYXJkRnJvbnQ6ICdmbGlwLWNhcmQtZnJvbnQnLFxyXG4gICAgICBmbGlwQ2FyZEJhY2s6ICdmbGlwLWNhcmQtYmFjaycsXHJcbiAgICAgIGZsaXBDYXJkOiAnZmxpcC1jYXJkJyxcclxuICAgICAgcmVzaXplQ29udGFpbmVyOiAncmVzaXplLWNvbnRhaW5lcicsXHJcbiAgICAgIHNjcm9sbExlZnQ6ICdzY3JvbGwtbGVmdCcsXHJcbiAgICAgIHNjcm9sbGluZ1RleHQ6ICdzY3JvbGxpbmctdGV4dCcsXHJcbiAgICAgIG5vU2VsZWN0OiAnbm8tc2VsZWN0JyxcclxuICAgICAgZHJvcERvd246ICdkcm9wLWRvd24nLFxyXG4gICAgICBleHBhbmRhYmxlVHh0Q29udGFpbmVyOiAnZXhwYW5kYWJsZS10ZXh0LWNvbnRhaW5lcicsXHJcbiAgICAgIGJvcmRlckNvdmVyOiAnYm9yZGVyLWNvdmVyJyxcclxuICAgICAgZmlyc3RFeHBhbnNpb246ICdmaXJzdC1leHBhbnNpb24nLFxyXG4gICAgICBzZWNvbmRFeHBhbnNpb246ICdzZWNvbmQtZXhwYW5zaW9uJyxcclxuICAgICAgaW52aXNpYmxlOiAnaW52aXNpYmxlJyxcclxuICAgICAgZmFkZUluOiAnZmFkZS1pbicsXHJcbiAgICAgIGZyb21Ub3A6ICdmcm9tLXRvcCcsXHJcbiAgICAgIGV4cGFuZE9uSG92ZXI6ICdleHBhbmQtb24taG92ZXInLFxyXG4gICAgICB0cmFja3NBcmVhOiAndHJhY2tzLWFyZWEnLFxyXG4gICAgICBzY3JvbGxCYXI6ICdzY3JvbGwtYmFyJyxcclxuICAgICAgdHJhY2tMaXN0OiAndHJhY2stbGlzdCcsXHJcbiAgICAgIGFydGlzdFRvcFRyYWNrczogJ2FydGlzdC10b3AtdHJhY2tzJyxcclxuICAgICAgdGV4dEZvcm06ICd0ZXh0LWZvcm0nLFxyXG4gICAgICBjb250ZW50OiAnY29udGVudCcsXHJcbiAgICAgIGxpbmtzOiAnbGlua3MnLFxyXG4gICAgICBwcm9ncmVzczogJ3Byb2dyZXNzJyxcclxuICAgICAgcGxheVBhdXNlOiAncGxheS1wYXVzZScsXHJcbiAgICAgIHJhbmtlZFRyYWNrSW50ZXJhY3Q6ICdyYW5rZWQtaW50ZXJhY3Rpb24tYXJlYScsXHJcbiAgICAgIHNsaWRlcjogJ3NsaWRlcicsXHJcbiAgICAgIHBsYXlCdG46ICdwbGF5LWJ0bicsXHJcbiAgICAgIGRpc3BsYXlOb25lOiAnZGlzcGxheS1ub25lJyxcclxuICAgICAgY29sdW1uOiAnY29sdW1uJyxcclxuICAgICAgd2ViUGxheWVyQ29udHJvbHM6ICd3ZWItcGxheWVyLWNvbnRyb2xzJ1xyXG4gICAgfSxcclxuICAgIEFUVFJJQlVURVM6IHtcclxuICAgICAgZGF0YVNlbGVjdGlvbjogJ2RhdGEtc2VsZWN0aW9uJyxcclxuICAgICAgcmVzdHJpY3RGbGlwT25DbGljazogJ2RhdGEtcmVzdHJpY3QtZmxpcC1vbi1jbGljaydcclxuICAgIH1cclxuICB9LFxyXG4gIFVSTHM6IHtcclxuICAgIHNpdGVVcmw6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxyXG4gICAgYXV0aDogYCR7YXV0aEVuZHBvaW50fT9jbGllbnRfaWQ9JHtjbGllbnRJZH0mcmVkaXJlY3RfdXJpPSR7cmVkaXJlY3RVcml9JnNjb3BlPSR7c2NvcGVzLmpvaW4oXHJcbiAgICAgICclMjAnXHJcbiAgICApfSZyZXNwb25zZV90eXBlPWNvZGUmc2hvd19kaWFsb2c9dHJ1ZWAsXHJcbiAgICBnZXRIYXNUb2tlbnM6ICcvdG9rZW5zL2hhcy10b2tlbnMnLFxyXG4gICAgZ2V0QWNjZXNzVG9rZW46ICcvdG9rZW5zL2dldC1hY2Nlc3MtdG9rZW4nLFxyXG4gICAgZ2V0T2J0YWluVG9rZW5zUHJlZml4OiAoY29kZTogc3RyaW5nKSA9PiBgL3Rva2Vucy9vYnRhaW4tdG9rZW5zP2NvZGU9JHtjb2RlfWAsXHJcbiAgICBnZXRUb3BBcnRpc3RzOiAnL3Nwb3RpZnkvZ2V0LXRvcC1hcnRpc3RzP3RpbWVfcmFuZ2U9JyxcclxuICAgIGdldFRvcFRyYWNrczogJy9zcG90aWZ5L2dldC10b3AtdHJhY2tzP3RpbWVfcmFuZ2U9JyxcclxuICAgIGdldFBsYXlsaXN0czogJy9zcG90aWZ5L2dldC1wbGF5bGlzdHMnLFxyXG4gICAgZ2V0UGxheWxpc3RUcmFja3M6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3QtdHJhY2tzP3BsYXlsaXN0X2lkPScsXHJcbiAgICBwdXRDbGVhclRva2VuczogJy90b2tlbnMvY2xlYXItdG9rZW5zJyxcclxuICAgIGRlbGV0ZVBsYXlsaXN0VHJhY2tzOiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvZGVsZXRlLXBsYXlsaXN0LWl0ZW1zP3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgcG9zdFBsYXlsaXN0VHJhY2tzOiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1wbGF5bGlzdC1pdGVtcz9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIGdldFRyYWNrRmVhdHVyZXM6ICcvc3BvdGlmeS9nZXQtdHJhY2tzLWZlYXR1cmVzP3RyYWNrX2lkcz0nLFxyXG4gICAgcHV0UmVmcmVzaEFjY2Vzc1Rva2VuOiAnL3Rva2Vucy9yZWZyZXNoLXRva2VuJyxcclxuICAgIHB1dFNlc3Npb25EYXRhOiAnL3Nwb3RpZnkvcHV0LXNlc3Npb24tZGF0YT9hdHRyPScsXHJcbiAgICBwdXRQbGF5bGlzdFJlc2l6ZURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5bGlzdC1yZXNpemUtZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXlsaXN0UmVzaXplRGF0YTogJy91c2VyL2dldC1wbGF5bGlzdC1yZXNpemUtZGF0YScsXHJcbiAgICBwdXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5bGlzdC10ZXh0LWZvcm0tZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXlsaXN0SXNJblRleHRGb3JtRGF0YTogJy91c2VyL2dldC1wbGF5bGlzdC10ZXh0LWZvcm0tZGF0YScsXHJcbiAgICBwdXRUb3BUcmFja3NJc0luVGV4dEZvcm1EYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtdG9wLXRyYWNrcy10ZXh0LWZvcm0tZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFRvcFRyYWNrc0lzSW5UZXh0Rm9ybURhdGE6ICcvdXNlci9nZXQtdG9wLXRyYWNrcy10ZXh0LWZvcm0tZGF0YScsXHJcbiAgICBnZXRBcnRpc3RUb3BUcmFja3M6IChpZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvZ2V0LWFydGlzdC10b3AtdHJhY2tzP2lkPSR7aWR9YCxcclxuICAgIGdldEN1cnJlbnRVc2VyUHJvZmlsZTogJy9zcG90aWZ5L2dldC1jdXJyZW50LXVzZXItcHJvZmlsZScsXHJcbiAgICBwdXRDbGVhclNlc3Npb246ICcvY2xlYXItc2Vzc2lvbicsXHJcbiAgICBnZXRDdXJyZW50VXNlclNhdmVkVHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LWN1cnJlbnQtdXNlci1zYXZlZC10cmFja3MnLFxyXG4gICAgZ2V0Rm9sbG93ZWRBcnRpc3RzOiAnL3Nwb3RpZnkvZ2V0LWZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgcHV0UGxheVRyYWNrOiAoZGV2aWNlX2lkOiBzdHJpbmcsIHRyYWNrX3VyaTogc3RyaW5nKSA9PlxyXG4gICAgICBgL3Nwb3RpZnkvcGxheS10cmFjaz9kZXZpY2VfaWQ9JHtkZXZpY2VfaWR9JnRyYWNrX3VyaT0ke3RyYWNrX3VyaX1gLFxyXG4gICAgcHV0UGxheWVyVm9sdW1lRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXBsYXllci12b2x1bWU/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5ZXJWb2x1bWVEYXRhOiAnL3VzZXIvZ2V0LXBsYXllci12b2x1bWUnLFxyXG4gICAgcHV0VGVybTogKHRlcm06IFRFUk1TLCB0ZXJtVHlwZTogVEVSTV9UWVBFKSA9PiBgL3VzZXIvcHV0LXRvcC0ke3Rlcm1UeXBlfS10ZXJtP3Rlcm09JHt0ZXJtfWAsXHJcbiAgICBnZXRUZXJtOiAodGVybVR5cGU6IFRFUk1fVFlQRSkgPT4gYC91c2VyL2dldC10b3AtJHt0ZXJtVHlwZX0tdGVybWAsXHJcbiAgICBwdXRDdXJyUGxheWxpc3RJZDogKGlkOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtY3VycmVudC1wbGF5bGlzdC1pZD9pZD0ke2lkfWAsXHJcbiAgICBnZXRDdXJyUGxheWxpc3RJZDogJy91c2VyL2dldC1jdXJyZW50LXBsYXlsaXN0LWlkJyxcclxuICAgIHBvc3RQbGF5bGlzdDogKG5hbWU6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtcGxheWxpc3Q/bmFtZT0ke25hbWV9YCxcclxuICAgIHBvc3RJdGVtc1RvUGxheWxpc3Q6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LWl0ZW1zLXRvLXBsYXlsaXN0P3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgZ2V0VXNlcm5hbWU6ICcvdXNlci9nZXQtdXNlcm5hbWUnXHJcbiAgfSxcclxuICBQQVRIUzoge1xyXG4gICAgc3Bpbm5lcjogJy9pbWFnZXMvMjAwcHhMb2FkaW5nU3Bpbm5lci5zdmcnLFxyXG4gICAgZ3JpZFZpZXc6ICcvaW1hZ2VzL2dyaWQtdmlldy1pY29uLnBuZycsXHJcbiAgICBsaXN0VmlldzogJy9pbWFnZXMvbGlzdC12aWV3LWljb24ucG5nJyxcclxuICAgIGNoZXZyb25MZWZ0OiAnL2ltYWdlcy9jaGV2cm9uLWxlZnQucG5nJyxcclxuICAgIGNoZXZyb25SaWdodDogJy9pbWFnZXMvY2hldnJvbi1yaWdodC5wbmcnLFxyXG4gICAgcGxheUljb246ICcvaW1hZ2VzL3BsYXktMzBweC5wbmcnLFxyXG4gICAgcGF1c2VJY29uOiAnL2ltYWdlcy9wYXVzZS0zMHB4LnBuZycsXHJcbiAgICBwbGF5QmxhY2tJY29uOiAnL2ltYWdlcy9wbGF5LWJsYWNrLTMwcHgucG5nJyxcclxuICAgIHBhdXNlQmxhY2tJY29uOiAnL2ltYWdlcy9wYXVzZS1ibGFjay0zMHB4LnBuZycsXHJcbiAgICBwbGF5TmV4dDogJy9pbWFnZXMvbmV4dC0zMHB4LnBuZycsXHJcbiAgICBwbGF5UHJldjogJy9pbWFnZXMvcHJldmlvdXMtMzBweC5wbmcnLFxyXG4gICAgcHJvZmlsZVVzZXI6ICcvaW1hZ2VzL3Byb2ZpbGUtdXNlci5wbmcnLFxyXG4gICAgc2h1ZmZsZUljb246ICcvaW1hZ2VzL3NodWZmbGUtaWNvbi5wbmcnLFxyXG4gICAgc2h1ZmZsZUljb25HcmVlbjogJy9pbWFnZXMvc2h1ZmZsZS1pY29uLWdyZWVuLnBuZydcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzIChtaWxsaXM6IG51bWJlcikge1xyXG4gIGNvbnN0IG1pbnV0ZXM6IG51bWJlciA9IE1hdGguZmxvb3IobWlsbGlzIC8gNjAwMDApXHJcbiAgY29uc3Qgc2Vjb25kczogbnVtYmVyID0gcGFyc2VJbnQoKChtaWxsaXMgJSA2MDAwMCkgLyAxMDAwKS50b0ZpeGVkKDApKVxyXG4gIHJldHVybiBzZWNvbmRzID09PSA2MFxyXG4gICAgPyBtaW51dGVzICsgMSArICc6MDAnXHJcbiAgICA6IG1pbnV0ZXMgKyAnOicgKyAoc2Vjb25kcyA8IDEwID8gJzAnIDogJycpICsgc2Vjb25kc1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBodG1sVG9FbCAoaHRtbDogc3RyaW5nKSB7XHJcbiAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJylcclxuICBodG1sID0gaHRtbC50cmltKCkgLy8gTmV2ZXIgcmV0dXJuIGEgc3BhY2UgdGV4dCBub2RlIGFzIGEgcmVzdWx0XHJcbiAgdGVtcC5pbm5lckhUTUwgPSBodG1sXHJcbiAgcmV0dXJuIHRlbXAuY29udGVudC5maXJzdENoaWxkXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9taXNlSGFuZGxlcjxUPiAoXHJcbiAgcHJvbWlzZTogUHJvbWlzZTxUPixcclxuICBvblN1Y2Nlc2Z1bCA9IChyZXM6IFQpID0+IHsgfSxcclxuICBvbkZhaWx1cmUgPSAoZXJyOiB1bmtub3duKSA9PiB7XHJcbiAgICBpZiAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxyXG4gICAgfVxyXG4gIH1cclxuKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHByb21pc2VcclxuICAgIG9uU3VjY2VzZnVsKHJlcyBhcyBUKVxyXG4gICAgcmV0dXJuIHsgcmVzOiByZXMsIGVycjogbnVsbCB9IGFzIElQcm9taXNlSGFuZGxlclJldHVybjxUPlxyXG4gIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xyXG4gICAgb25GYWlsdXJlKGVycilcclxuICAgIHJldHVybiB7IHJlczogbnVsbCwgZXJyOiBlcnIgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9XHJcbn1cclxuXHJcbi8qKiBGaWx0ZXJzICdsaScgZWxlbWVudHMgdG8gZWl0aGVyIGJlIGhpZGRlbiBvciBub3QgZGVwZW5kaW5nIG9uIGlmXHJcbiAqIHRoZXkgY29udGFpbiBzb21lIGdpdmVuIGlucHV0IHRleHQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7SFRNTH0gdWwgLSB1bm9yZGVyZWQgbGlzdCBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlICdsaScgdG8gYmUgZmlsdGVyZWRcclxuICogQHBhcmFtIHtIVE1MfSBpbnB1dCAtIGlucHV0IGVsZW1lbnQgd2hvc2UgdmFsdWUgd2lsbCBiZSB1c2VkIHRvIGZpbHRlclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RkRGlzcGxheSAtIHRoZSBzdGFuZGFyZCBkaXNwbGF5IHRoZSAnbGknIHNob3VsZCBoYXZlIHdoZW4gbm90ICdub25lJ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFVsICh1bDogSFRNTFVMaXN0RWxlbWVudCwgaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQsIHN0ZERpc3BsYXk6IHN0cmluZyA9ICdmbGV4Jyk6IHZvaWQge1xyXG4gIGNvbnN0IGxpRWxzID0gdWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJylcclxuICBjb25zdCBmaWx0ZXIgPSBpbnB1dC52YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGlFbHMubGVuZ3RoOyBpKyspIHtcclxuICAgIC8vIGdldCB0aGUgbmFtZSBjaGlsZCBlbCBpbiB0aGUgbGkgZWxcclxuICAgIGNvbnN0IG5hbWUgPSBsaUVsc1tpXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lKVswXVxyXG4gICAgY29uc3QgbmFtZVR4dCA9IG5hbWUudGV4dENvbnRlbnQgfHwgbmFtZS5pbm5lckhUTUxcclxuXHJcbiAgICBpZiAobmFtZVR4dCAmJiBuYW1lVHh0LnRvVXBwZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXIpID4gLTEpIHtcclxuICAgICAgLy8gc2hvdyBsaSdzIHdob3NlIG5hbWUgY29udGFpbnMgdGhlIHRoZSBlbnRlcmVkIHN0cmluZ1xyXG4gICAgICBsaUVsc1tpXS5zdHlsZS5kaXNwbGF5ID0gc3RkRGlzcGxheVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gb3RoZXJ3aXNlIGhpZGUgaXRcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFVzZXMgY2FudmFzLm1lYXN1cmVUZXh0IHRvIGNvbXB1dGUgYW5kIHJldHVybiB0aGUgd2lkdGggb2YgdGhlIGdpdmVuIHRleHQgb2YgZ2l2ZW4gZm9udCBpbiBwaXhlbHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IHRvIGJlIHJlbmRlcmVkLlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZm9udCBUaGUgY3NzIGZvbnQgZGVzY3JpcHRvciB0aGF0IHRleHQgaXMgdG8gYmUgcmVuZGVyZWQgd2l0aCAoZS5nLiBcImJvbGQgMTRweCB2ZXJkYW5hXCIpLlxyXG4gKlxyXG4gKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExODI0MS9jYWxjdWxhdGUtdGV4dC13aWR0aC13aXRoLWphdmFzY3JpcHQvMjEwMTUzOTMjMjEwMTUzOTNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXh0V2lkdGggKHRleHQ6IHN0cmluZywgZm9udDogc3RyaW5nKSB7XHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuICBsZXQgbWV0cmljczogVGV4dE1ldHJpY3NcclxuICBpZiAoY29udGV4dCkge1xyXG4gICAgY29udGV4dC5mb250ID0gZm9udFxyXG4gICAgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQodGV4dClcclxuICAgIHJldHVybiBtZXRyaWNzLndpZHRoXHJcbiAgfVxyXG5cclxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbnRleHQgb24gY3JlYXRlZCBjYW52YXMgd2FzIGZvdW5kJylcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRWxsaXBzaXNBY3RpdmUgKGVsOiBIVE1MRWxlbWVudCkge1xyXG4gIHJldHVybiBlbC5vZmZzZXRXaWR0aCA8IGVsLnNjcm9sbFdpZHRoXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYXBpdGFsaXplRmlyc3RMZXR0ZXIgKHN0cmluZzogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsaWRJbWFnZSAoaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPiwgaWR4ID0gMCkge1xyXG4gIC8vIG9idGFpbiB0aGUgY29ycmVjdCBpbWFnZVxyXG4gIGlmIChpbWFnZXMubGVuZ3RoID4gaWR4KSB7XHJcbiAgICBjb25zdCBpbWcgPSBpbWFnZXNbaWR4XVxyXG4gICAgcmV0dXJuIGltZy51cmxcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuICcnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQWxsQ2hpbGROb2RlcyAocGFyZW50OiBOb2RlKSB7XHJcbiAgd2hpbGUgKHBhcmVudC5maXJzdENoaWxkKSB7XHJcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50LmZpcnN0Q2hpbGQpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYW5pbWF0aW9uQ29udHJvbCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgLyoqIEFkZHMgYSBjbGFzcyB0byBlYWNoIGVsZW1lbnQgY2F1c2luZyBhIHRyYW5zaXRpb24gdG8gdGhlIGNoYW5nZWQgY3NzIHZhbHVlcy5cclxuICAgKiBUaGlzIGlzIGRvbmUgb24gc2V0IGludGVydmFscy5cclxuICAgKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGVsZW1lbnRzVG9BbmltYXRlIC0gY29tbWEgc2VwYXJhdGVkIHN0cmluZyBjb250YWluaW5nIHRoZSBjbGFzc2VzIG9yIGlkcyBvZiBlbGVtZW50cyB0byBhbmltYXRlIGluY2x1ZGluZyBwcmVmaXggY2hhci5cclxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NUb1RyYW5zaXRpb25Ub28gLSBUaGUgY2xhc3MgdGhhdCBhbGwgdGhlIHRyYW5zaXRpb25pbmcgZWxlbWVudHMgd2lsbCBhZGRcclxuICAgKiBAcGFyYW0ge051bWJlcn0gYW5pbWF0aW9uSW50ZXJ2YWwgLSBUaGUgaW50ZXJ2YWwgdG8gd2FpdCBiZXR3ZWVuIGFuaW1hdGlvbiBvZiBlbGVtZW50c1xyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGludGVydmFsRWxlbWVudHNUcmFuc2l0aW9ucyAoXHJcbiAgICBlbGVtZW50c1RvQW5pbWF0ZTogc3RyaW5nLFxyXG4gICAgY2xhc3NUb1RyYW5zaXRpb25Ub286IHN0cmluZyxcclxuICAgIGFuaW1hdGlvbkludGVydmFsOiBudW1iZXJcclxuICApIHtcclxuICAgIC8vIGFyciBvZiBodG1sIHNlbGVjdG9ycyB0aGF0IHBvaW50IHRvIGVsZW1lbnRzIHRvIGFuaW1hdGVcclxuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBlbGVtZW50c1RvQW5pbWF0ZS5zcGxpdCgnLCcpXHJcblxyXG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyKSA9PiB7XHJcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChhdHRyKVxyXG4gICAgICBsZXQgaWR4ID0gMFxyXG4gICAgICAvLyBpbiBpbnRlcnZhbHMgcGxheSB0aGVpciBpbml0aWFsIGFuaW1hdGlvbnNcclxuICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKGlkeCA9PT0gZWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50c1tpZHhdXHJcbiAgICAgICAgLy8gYWRkIHRoZSBjbGFzcyB0byB0aGUgZWxlbWVudHMgY2xhc3NlcyBpbiBvcmRlciB0byBydW4gdGhlIHRyYW5zaXRpb25cclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NUb1RyYW5zaXRpb25Ub28pXHJcbiAgICAgICAgaWR4ICs9IDFcclxuICAgICAgfSwgYW5pbWF0aW9uSW50ZXJ2YWwpXHJcbiAgICB9KVxyXG4gIH1cclxuICAvKiogQW5pbWF0ZXMgYWxsIGVsZW1lbnRzIHRoYXQgY29udGFpbiBhIGNlcnRhaW4gY2xhc3Mgb3IgaWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBJTkNMVURJTkcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzVG9BZGQgLSBjbGFzcyB0byBhZGQgRVhDTFVESU5HIHRoZSBwcmVmaXggY2hhci5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYW5pbWF0aW9uSW50ZXJ2YWwgLSB0aGUgaW50ZXJ2YWwgdG8gYW5pbWF0ZSB0aGUgZ2l2ZW4gZWxlbWVudHMgaW4gbWlsbGlzZWNvbmRzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFuaW1hdGVBdHRyaWJ1dGVzIChlbGVtZW50c1RvQW5pbWF0ZTogc3RyaW5nLCBjbGFzc1RvQWRkOiBzdHJpbmcsIGFuaW1hdGlvbkludGVydmFsOiBudW1iZXIpIHtcclxuICAgIGludGVydmFsRWxlbWVudHNUcmFuc2l0aW9ucyhcclxuICAgICAgZWxlbWVudHNUb0FuaW1hdGUsXHJcbiAgICAgIGNsYXNzVG9BZGQsXHJcbiAgICAgIGFuaW1hdGlvbkludGVydmFsXHJcbiAgICApXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBhbmltYXRlQXR0cmlidXRlc1xyXG4gIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBpeGVsUG9zSW5FbE9uQ2xpY2sgKG1vdXNlRXZ0OiBNb3VzZUV2ZW50KTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHtcclxuICBjb25zdCByZWN0ID0gKG1vdXNlRXZ0LnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICBjb25zdCB4ID0gbW91c2VFdnQuY2xpZW50WCAtIHJlY3QubGVmdCAvLyB4IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICBjb25zdCB5ID0gbW91c2VFdnQuY2xpZW50WSAtIHJlY3QudG9wIC8vIHkgcG9zaXRpb24gd2l0aGluIHRoZSBlbGVtZW50LlxyXG4gIHJldHVybiB7IHgsIHkgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFeHByZXNzaW9uIChlcnJvck1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkSXRlbXNUb1BsYXlsaXN0IChwbGF5bGlzdElkOiBzdHJpbmcsIHVyaXM6IEFycmF5PHN0cmluZz4pIHtcclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgIGF4aW9zKHtcclxuICAgICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICAgIHVybDogY29uZmlnLlVSTHMucG9zdEl0ZW1zVG9QbGF5bGlzdChwbGF5bGlzdElkKSxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHVyaXM6IHVyaXNcclxuICAgICAgfVxyXG4gICAgfSksXHJcbiAgICAoKSA9PiB7fSwgKCkgPT4ge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lzc3VlIGFkZGluZyBpdGVtcyB0byBwbGF5bGlzdCcpXHJcbiAgICB9KVxyXG59XHJcblxyXG4vKipcclxuICogU2h1ZmZsZXMgYSBnaXZlbiBhcnJheSBhbmQgcmV0dXJucyB0aGUgc2h1ZmZsZWQgdmVyc2lvbi5cclxuICogQHBhcmFtIHtBcnJheTxUPn0gYXJyYXkgVGhlIGFycmF5IHRvIHNodWZmbGUgYnV0IG5vdCBtdXRhdGUuXHJcbiAqIEByZXR1cm5zIHtBcnJheTxUPn0gYSBzaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBhcnJheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlPFQ+IChhcnJheTogQXJyYXk8VD4pIHtcclxuICBjb25zdCBjbG9uZUFyciA9IFsuLi5hcnJheV1cclxuICBsZXQgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoXHJcbiAgbGV0IHJhbmRvbUluZGV4XHJcblxyXG4gIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgd2hpbGUgKGN1cnJlbnRJbmRleCAhPT0gMCkge1xyXG4gICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleClcclxuICAgIGN1cnJlbnRJbmRleC0tO1xyXG5cclxuICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgIFtjbG9uZUFycltjdXJyZW50SW5kZXhdLCBjbG9uZUFycltyYW5kb21JbmRleF1dID0gW1xyXG4gICAgICBjbG9uZUFycltyYW5kb21JbmRleF0sIGNsb25lQXJyW2N1cnJlbnRJbmRleF1dXHJcbiAgfVxyXG5cclxuICByZXR1cm4gY2xvbmVBcnJcclxufVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyLCB0aHJvd0V4cHJlc3Npb24gfSBmcm9tICcuL2NvbmZpZydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBkaXNwbGF5VXNlcm5hbWUgfSBmcm9tICcuL3VzZXItZGF0YSdcclxuXHJcbmNvbnN0IEhBTEZfSE9VUiA9IDEuOGU2IC8qIDMwIG1pbiBpbiBtcyAqL1xyXG5cclxuLy8gaWYgdGhlIHVzZXIgc3RheXMgb24gdGhlIHNhbWUgcGFnZSBmb3IgMzAgbWluIHJlZnJlc2ggdGhlIHRva2VuLlxyXG5jb25zdCBzdGFydFJlZnJlc2hJbnRlcnZhbCA9ICgpID0+IHtcclxuICBjb25zb2xlLmxvZygnc3RhcnQgaW50ZXJ2YWwgcmVmcmVzaCcpXHJcbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFJlZnJlc2hBY2Nlc3NUb2tlbikpXHJcbiAgICBjb25zb2xlLmxvZygncmVmcmVzaCBhc3luYycpXHJcbiAgfSwgSEFMRl9IT1VSKVxyXG59XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0lmSGFzVG9rZW5zICgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICBsZXQgaGFzVG9rZW4gPSBmYWxzZVxyXG4gIC8vIGF3YWl0IHByb21pc2UgcmVzb2x2ZSB0aGF0IHJldHVybnMgd2hldGhlciB0aGUgc2Vzc2lvbiBoYXMgdG9rZW5zLlxyXG4gIGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEhhc1Rva2VucyksXHJcbiAgICAocmVzKSA9PiB7XHJcbiAgICAgIGhhc1Rva2VuID0gcmVzLmRhdGFcclxuICAgIH1cclxuICApXHJcblxyXG4gIGlmIChoYXNUb2tlbikge1xyXG4gICAgc3RhcnRSZWZyZXNoSW50ZXJ2YWwoKVxyXG4gIH1cclxuICByZXR1cm4gaGFzVG9rZW5cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VucyAoKSB7XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBjcmVhdGUgYSBwYXJhbWV0ZXIgc2VhcmNoZXIgaW4gdGhlIFVSTCBhZnRlciAnPycgd2hpY2ggaG9sZHMgdGhlIHJlcXVlc3RzIGJvZHkgcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcclxuXHJcbiAgLy8gR2V0IHRoZSBjb2RlIGZyb20gdGhlIHBhcmFtZXRlciBjYWxsZWQgJ2NvZGUnIGluIHRoZSB1cmwgd2hpY2hcclxuICAvLyBob3BlZnVsbHkgY2FtZSBiYWNrIGZyb20gdGhlIHNwb3RpZnkgR0VUIHJlcXVlc3Qgb3RoZXJ3aXNlIGl0IGlzIG51bGxcclxuICBsZXQgYXV0aENvZGUgPSB1cmxQYXJhbXMuZ2V0KCdjb2RlJylcclxuXHJcbiAgaWYgKGF1dGhDb2RlKSB7XHJcbiAgICAvLyBvYnRhaW4gdG9rZW5zXHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldE9idGFpblRva2Vuc1ByZWZpeChhdXRoQ29kZSkpLFxyXG5cclxuICAgICAgLy8gaWYgdGhlIHJlcXVlc3Qgd2FzIHN1Y2Nlc2Z1bCB3ZSBoYXZlIHJlY2lldmVkIGEgdG9rZW5cclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIGhhc1Rva2VuID0gdHJ1ZVxyXG4gICAgICAgIHN0YXJ0UmVmcmVzaEludGVydmFsKClcclxuICAgICAgfVxyXG4gICAgKVxyXG4gICAgYXV0aENvZGUgPSAnJ1xyXG5cclxuICAgIC8vIGdldCB1c2VyIGluZm8gZnJvbSBzcG90aWZ5XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0Q3VycmVudFVzZXJQcm9maWxlKSlcclxuICB9XHJcblxyXG4gIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCAnJywgJy8nKVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG4vKiogR2VuZXJhdGUgYSBsb2dpbi9jaGFuZ2UgYWNjb3VudCBsaW5rLiBEZWZhdWx0cyB0byBhcHBlbmRpbmcgaXQgb250byB0aGUgbmF2IGJhci5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSBjbGFzc2VzVG9BZGQgLSB0aGUgY2xhc3NlcyB0byBhZGQgb250byB0aGUgbGluay5cclxuICogQHBhcmFtIHtCb29sZWFufSBjaGFuZ2VBY2NvdW50IC0gV2hldGhlciB0aGUgbGluayBzaG91bGQgYmUgZm9yIGNoYW5naW5nIGFjY291bnQsIG9yIGZvciBsb2dnaW5nIGluLiAoZGVmYXVsdHMgdG8gdHJ1ZSlcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50RWwgLSB0aGUgcGFyZW50IGVsZW1lbnQgdG8gYXBwZW5kIHRoZSBsaW5rIG9udG8uIChkZWZhdWx0cyB0byBuYXZiYXIpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVMb2dpbiAoe1xyXG4gIGNsYXNzZXNUb0FkZCA9IFsncmlnaHQnXSxcclxuICBjaGFuZ2VBY2NvdW50ID0gdHJ1ZSxcclxuICBwYXJlbnRFbCA9IGRvY3VtZW50XHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndG9wbmF2JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyaWdodCcpWzBdXHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZHJvcGRvd24tY29udGVudCcpWzBdXHJcbn0gPSB7fSkge1xyXG4gIC8vIENyZWF0ZSBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXHJcbiAgYS5ocmVmID0gY29uZmlnLlVSTHMuYXV0aFxyXG5cclxuICAvLyBDcmVhdGUgdGhlIHRleHQgbm9kZSBmb3IgYW5jaG9yIGVsZW1lbnQuXHJcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgY2hhbmdlQWNjb3VudCA/ICdDaGFuZ2UgQWNjb3VudCcgOiAnTG9naW4gVG8gU3BvdGlmeSdcclxuICApXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgdGV4dCBub2RlIHRvIGFuY2hvciBlbGVtZW50LlxyXG4gIGEuYXBwZW5kQ2hpbGQobGluaylcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXNUb0FkZC5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2xhc3NUb0FkZCA9IGNsYXNzZXNUb0FkZFtpXVxyXG4gICAgYS5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQpXHJcbiAgfVxyXG5cclxuICAvLyBjbGVhciBjdXJyZW50IHRva2VucyB3aGVuIGNsaWNrZWRcclxuICBhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dENsZWFyVG9rZW5zKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpXHJcbiAgfSlcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSBhbmNob3IgZWxlbWVudCB0byB0aGUgcGFyZW50LlxyXG4gIHBhcmVudEVsLmFwcGVuZENoaWxkKGEpXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbCAoXHJcbiAgaGFzVG9rZW46IGJvb2xlYW4sXHJcbiAgaGFzVG9rZW5DYWxsYmFjayA9ICgpID0+IHsgfSxcclxuICBub1Rva2VuQ2FsbEJhY2sgPSAoKSA9PiB7IH0sXHJcbiAgcmVkaXJlY3RIb21lID0gdHJ1ZVxyXG4pIHtcclxuICBjb25zdCBnZXRUb2tlbnNTcGlubmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgICBjb25maWcuQ1NTLklEcy5nZXRUb2tlbkxvYWRpbmdTcGlubmVyXHJcbiAgKVxyXG5cclxuICAvLyByZW1vdmUgdG9rZW4gc3Bpbm5lciBiZWNhdXNlIGJ5IHRoaXMgbGluZSB3ZSBoYXZlIG9idGFpbmVkIHRoZSB0b2tlblxyXG4gIGdldFRva2Vuc1NwaW5uZXI/LnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGdldFRva2Vuc1NwaW5uZXIpXHJcblxyXG4gIGNvbnN0IGluZm9Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5pbmZvQ29udGFpbmVyKVxyXG5cclxuICAvLyBnZW5lcmF0ZSB0aGUgbmF2IGxvZ2luXHJcbiAgZ2VuZXJhdGVMb2dpbih7IGNoYW5nZUFjY291bnQ6IGhhc1Rva2VuLCBwYXJlbnRFbDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMudG9wTmF2TW9iaWxlKSA/PyB0aHJvd0V4cHJlc3Npb24oJ05vIHRvcCBuYXYgbW9iaWxlIGVsZW1lbnQgZm91bmQnKSB9KVxyXG4gIGdlbmVyYXRlTG9naW4oeyBjaGFuZ2VBY2NvdW50OiBoYXNUb2tlbiB9KVxyXG4gIGlmIChoYXNUb2tlbikge1xyXG4gICAgaWYgKGluZm9Db250YWluZXIgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZm8gY29udGFpbmVyIEVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgfVxyXG4gICAgaW5mb0NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gICAgZGlzcGxheVVzZXJuYW1lKClcclxuICAgIGNvbnNvbGUubG9nKCdkaXNwbGF5IHVzZXJuYW1lJylcclxuICAgIGhhc1Rva2VuQ2FsbGJhY2soKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBpZiB0aGVyZSBpcyBubyB0b2tlbiByZWRpcmVjdCB0byBhbGxvdyBhY2Nlc3MgcGFnZVxyXG4gICAgaWYgKHJlZGlyZWN0SG9tZSkgeyB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGNvbmZpZy5VUkxzLnNpdGVVcmwgfVxyXG4gICAgbm9Ub2tlbkNhbGxCYWNrKClcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEFydGlzdCwgeyBnZW5lcmF0ZUFydGlzdHNGcm9tRGF0YSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXJ0aXN0J1xyXG5pbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBwcm9taXNlSGFuZGxlcixcclxuICBodG1sVG9FbCxcclxuICByZW1vdmVBbGxDaGlsZE5vZGVzLFxyXG4gIGFuaW1hdGlvbkNvbnRyb2wsXHJcbiAgdGhyb3dFeHByZXNzaW9uXHJcbn0gZnJvbSAnLi4vLi4vY29uZmlnJ1xyXG5pbXBvcnQgU2VsZWN0YWJsZVRhYkVscyBmcm9tICcuLi8uLi9jb21wb25lbnRzL1NlbGVjdGFibGVUYWJFbHMnXHJcbmltcG9ydCB7XHJcbiAgY2hlY2tJZkhhc1Rva2VucyxcclxuICBvblN1Y2Nlc3NmdWxUb2tlbkNhbGxcclxufSBmcm9tICcuLi8uLi9tYW5hZ2UtdG9rZW5zJ1xyXG5pbXBvcnQgQXN5bmNTZWxlY3Rpb25WZXJpZiBmcm9tICcuLi8uLi9jb21wb25lbnRzL2FzeW5jU2VsZWN0aW9uVmVyaWYnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgZGV0ZXJtaW5lVGVybSwgbG9hZFRlcm0sIHNhdmVUZXJtLCBzZWxlY3RTdGFydFRlcm1UYWIsIFRFUk1TLCBURVJNX1RZUEUgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL3NhdmUtbG9hZC10ZXJtJ1xyXG5cclxuY29uc3QgTUFYX1ZJRVdBQkxFX0NBUkRTID0gNVxyXG5cclxuY29uc3QgYXJ0aXN0QWN0aW9ucyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgY29uc3Qgc2VsZWN0aW9ucyA9IHtcclxuICAgIG51bVZpZXdhYmxlQ2FyZHM6IE1BWF9WSUVXQUJMRV9DQVJEUyxcclxuICAgIHRlcm06IFRFUk1TLlNIT1JUX1RFUk1cclxuICB9XHJcbiAgZnVuY3Rpb24gbG9hZEFydGlzdFRvcFRyYWNrcyAoYXJ0aXN0T2JqOiBBcnRpc3QsIGNhbGxiYWNrOiBGdW5jdGlvbikge1xyXG4gICAgYXJ0aXN0T2JqXHJcbiAgICAgIC5sb2FkVG9wVHJhY2tzKClcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIGNhbGxiYWNrKClcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKChlcnI6IHVua25vd24pID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hlbiBsb2FkaW5nIGFydGlzdHMnKVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxyXG4gICAgICB9KVxyXG4gIH1cclxuICBmdW5jdGlvbiBzaG93VG9wVHJhY2tzIChhcnRpc3RPYmo6IEFydGlzdCkge1xyXG4gICAgbG9hZEFydGlzdFRvcFRyYWNrcyhhcnRpc3RPYmosICgpID0+IHtcclxuICAgICAgY29uc3QgdHJhY2tMaXN0ID0gZ2V0VG9wVHJhY2tzVWxGcm9tQXJ0aXN0KGFydGlzdE9iailcclxuICAgICAgbGV0IHJhbmsgPSAxXHJcbiAgICAgIGlmIChhcnRpc3RPYmoudG9wVHJhY2tzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aHJvd0V4cHJlc3Npb24oJ2FydGlzdCBkb2VzIG5vdCBoYXZlIHRvcCB0cmFja3MgbG9hZGVkIG9uIHJlcXVlc3QgdG8gc2hvdyB0aGVtJylcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGNvbnN0IHRyYWNrIG9mIGFydGlzdE9iai50b3BUcmFja3MudmFsdWVzKCkpIHtcclxuICAgICAgICB0cmFja0xpc3QuYXBwZW5kQ2hpbGQodHJhY2suZ2V0UmFua2VkVHJhY2tIdG1sKGFydGlzdE9iai50b3BUcmFja3MsIHJhbmspKVxyXG4gICAgICAgIHJhbmsrK1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0VG9wVHJhY2tzVWxGcm9tQXJ0aXN0IChhcnRpc3RPYmo6IEFydGlzdCkge1xyXG4gICAgY29uc3QgYXJ0aXN0Q2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFydGlzdE9iai5jYXJkSWQpID8/IHRocm93RXhwcmVzc2lvbignYXJ0aXN0IGNhcmQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgY29uc3QgdHJhY2tMaXN0ID0gYXJ0aXN0Q2FyZC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy50cmFja0xpc3QpWzBdXHJcblxyXG4gICAgaWYgKHRyYWNrTGlzdCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvd0V4cHJlc3Npb24oYHRyYWNrIHVsIG9uIGFydGlzdCBlbGVtZW50IHdpdGggaWQgJHthcnRpc3RPYmouY2FyZElkfSBkb2VzIG5vdCBleGlzdGApXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJhY2tMaXN0XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiByZXRyaWV2ZUFydGlzdHMgKGFydGlzdEFycjogQXJyYXk8QXJ0aXN0Pikge1xyXG4gICAgY29uc3QgeyByZXMsIGVyciB9ID0gYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRUb3BBcnRpc3RzICsgc2VsZWN0aW9ucy50ZXJtKVxyXG4gICAgKVxyXG4gICAgaWYgKGVycikge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIHdlIGtub3cgcmVzIGlzIG5vdCBudWxsIGJlY2F1c2UgaXQgaXMgb25seSBudWxsIGlmIGFuIGVycm9yIGV4aXN0cyBpbiB3aGljaCB3ZSBoYXZlIGFscmVhZHkgcmV0dXJuZWRcclxuICAgIGdlbmVyYXRlQXJ0aXN0c0Zyb21EYXRhKHJlcyEuZGF0YSwgYXJ0aXN0QXJyKVxyXG4gIH1cclxuICBmdW5jdGlvbiBnZXRDdXJyU2VsVG9wQXJ0aXN0cyAoKSB7XHJcbiAgICBpZiAoc2VsZWN0aW9ucy50ZXJtID09PSBURVJNUy5TSE9SVF9URVJNKSB7XHJcbiAgICAgIHJldHVybiBhcnRpc3RBcnJzLnRvcEFydGlzdE9ianNTaG9ydFRlcm1cclxuICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9ucy50ZXJtID09PSBURVJNUy5NSURfVEVSTSkge1xyXG4gICAgICByZXR1cm4gYXJ0aXN0QXJycy50b3BBcnRpc3RPYmpzTWlkVGVybVxyXG4gICAgfSBlbHNlIGlmIChzZWxlY3Rpb25zLnRlcm0gPT09IFRFUk1TLkxPTkdfVEVSTSkge1xyXG4gICAgICByZXR1cm4gYXJ0aXN0QXJycy50b3BBcnRpc3RPYmpzTG9uZ1Rlcm1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VsZWN0ZWQgdHJhY2sgdGVybSBpcyBpbnZhbGlkICcgKyBzZWxlY3Rpb25zLnRlcm0pXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBzaG93VG9wVHJhY2tzLFxyXG4gICAgcmV0cmlldmVBcnRpc3RzLFxyXG4gICAgc2VsZWN0aW9ucyxcclxuICAgIGdldEN1cnJTZWxUb3BBcnRpc3RzXHJcbiAgfVxyXG59KSgpXHJcblxyXG5jb25zdCBhcnRpc3RDYXJkc0hhbmRsZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGNvbnN0IHNlbGVjdGlvblZlcmlmID0gbmV3IEFzeW5jU2VsZWN0aW9uVmVyaWY8QXJyYXk8QXJ0aXN0Pj4oKVxyXG4gIGNvbnN0IGFydGlzdENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gICAgY29uZmlnLkNTUy5JRHMuYXJ0aXN0Q2FyZHNDb250YWluZXJcclxuICApID8/IHRocm93RXhwcmVzc2lvbihgYXJ0aXN0IGNvbnRhaW5lciBvZiBpZCAke2NvbmZpZy5DU1MuSURzLmFydGlzdENhcmRzQ29udGFpbmVyfSBkb2VzIG5vdCBleGlzdGApXHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlcyB0aGUgY2FyZHMgdG8gdGhlIERPTSB0aGVuIG1ha2VzIHRoZW0gdmlzaWJsZVxyXG4gICAqIEBwYXJhbSB7QXJyYXk8QXJ0aXN0Pn0gYXJ0aXN0QXJyIGFycmF5IG9mIHRyYWNrIG9iamVjdHMgd2hvc2UgY2FyZHMgc2hvdWxkIGJlIGdlbmVyYXRlZC5cclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGF1dG9BcHBlYXIgd2hldGhlciB0byBzaG93IHRoZSBjYXJkIHdpdGhvdXQgYW5pbWF0aW9uIG9yIHdpdGggYW5pbWF0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtBcnJheTxIVE1MRWxlbWVudD59IGFycmF5IG9mIHRoZSBjYXJkIGVsZW1lbnRzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQ2FyZHMgKGFydGlzdEFycjogQXJyYXk8QXJ0aXN0PiwgYXV0b0FwcGVhcjogQm9vbGVhbikge1xyXG4gICAgcmVtb3ZlQWxsQ2hpbGROb2RlcyhhcnRpc3RDb250YWluZXIpXHJcbiAgICAvLyBmaWxsIGFyciBvZiBjYXJkIGVsZW1lbnRzIGFuZCBhcHBlbmQgdGhlbSB0byBET01cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJ0aXN0QXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChpIDwgYXJ0aXN0QWN0aW9ucy5zZWxlY3Rpb25zLm51bVZpZXdhYmxlQ2FyZHMpIHtcclxuICAgICAgICBjb25zdCBhcnRpc3RPYmogPSBhcnRpc3RBcnJbaV1cclxuICAgICAgICBjb25zdCBjYXJkSHRtbCA9IGFydGlzdE9iai5nZXRBcnRpc3RIdG1sKGkpXHJcblxyXG4gICAgICAgIGFydGlzdENvbnRhaW5lci5hcHBlbmRDaGlsZChjYXJkSHRtbClcclxuXHJcbiAgICAgICAgYXJ0aXN0QWN0aW9ucy5zaG93VG9wVHJhY2tzKGFydGlzdE9iailcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIWF1dG9BcHBlYXIpIHtcclxuICAgICAgYW5pbWF0aW9uQ29udHJvbC5hbmltYXRlQXR0cmlidXRlcyhcclxuICAgICAgICAnLicgKyBjb25maWcuQ1NTLkNMQVNTRVMuYXJ0aXN0LFxyXG4gICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIsXHJcbiAgICAgICAgMjVcclxuICAgICAgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQmVnaW5zIHJldHJpZXZpbmcgYXJ0aXN0cyB0aGVuIHdoZW4gZG9uZSB2ZXJpZmllcyBpdCBpcyB0aGUgY29ycmVjdCBzZWxlY3RlZCBhcnRpc3QuXHJcbiAgICogQHBhcmFtIHtBcnJheTxBcnRpc3Q+fSBhcnRpc3RBcnIgYXJyYXkgdG8gbG9hZCBhcnRpc3RzIGludG8uXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc3RhcnRMb2FkaW5nQXJ0aXN0cyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+KSB7XHJcbiAgICAvLyBpbml0aWFsbHkgc2hvdyB0aGUgbG9hZGluZyBzcGlubmVyXHJcbiAgICBjb25zdCBodG1sU3RyaW5nID0gYFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMuc3Bpbm5lcn1cIiBhbHQ9XCJMb2FkaW5nLi4uXCIgLz5cclxuICAgICAgICAgICAgPC9kaXY+YFxyXG4gICAgY29uc3Qgc3Bpbm5lckVsID0gaHRtbFRvRWwoaHRtbFN0cmluZylcclxuXHJcbiAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdENvbnRhaW5lcilcclxuICAgIGFydGlzdENvbnRhaW5lci5hcHBlbmRDaGlsZChzcGlubmVyRWwgYXMgTm9kZSlcclxuXHJcbiAgICBhcnRpc3RBY3Rpb25zLnJldHJpZXZlQXJ0aXN0cyhhcnRpc3RBcnIpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAvLyBhZnRlciByZXRyaWV2aW5nIGFzeW5jIHZlcmlmeSBpZiBpdCBpcyB0aGUgc2FtZSBhcnIgb2YgQXJ0aXN0J3MgYXMgd2hhdCB3YXMgc2VsZWN0ZWRcclxuICAgICAgaWYgKCFzZWxlY3Rpb25WZXJpZi5pc1ZhbGlkKGFydGlzdEFycikpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZ2VuZXJhdGVDYXJkcyhhcnRpc3RBcnIsIGZhbHNlKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIGFydGlzdCBvYmplY3RzIGlmIG5vdCBsb2FkZWQsIHRoZW4gZ2VuZXJhdGUgY2FyZHMgd2l0aCB0aGUgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXk8QXJ0aXN0Pn0gYXJ0aXN0QXJyIC0gTGlzdCBvZiB0cmFjayBvYmplY3RzIHdob3NlIGNhcmRzIHNob3VsZCBiZSBnZW5lcmF0ZWQgb3JcclxuICAgKiBlbXB0eSBsaXN0IHRoYXQgc2hvdWxkIGJlIGZpbGxlZCB3aGVuIGxvYWRpbmcgdHJhY2tzLlxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXV0b0FwcGVhciB3aGV0aGVyIHRvIHNob3cgdGhlIGNhcmRzIHdpdGhvdXQgYW5pbWF0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtBcnJheTxIVE1MRWxlbWVudD59IGxpc3Qgb2YgQ2FyZCBIVE1MRWxlbWVudCdzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGRpc3BsYXlBcnRpc3RDYXJkcyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+LCBhdXRvQXBwZWFyID0gZmFsc2UpIHtcclxuICAgIHNlbGVjdGlvblZlcmlmLnNlbGVjdGlvbkNoYW5nZWQoYXJ0aXN0QXJyKVxyXG4gICAgaWYgKGFydGlzdEFyci5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGdlbmVyYXRlQ2FyZHMoYXJ0aXN0QXJyLCBhdXRvQXBwZWFyKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnRMb2FkaW5nQXJ0aXN0cyhhcnRpc3RBcnIpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZGlzcGxheUFydGlzdENhcmRzXHJcbiAgfVxyXG59KSgpXHJcblxyXG5jb25zdCBhcnRpc3RBcnJzID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCB0b3BBcnRpc3RPYmpzU2hvcnRUZXJtOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuICBjb25zdCB0b3BBcnRpc3RPYmpzTWlkVGVybTogQXJyYXk8QXJ0aXN0PiA9IFtdXHJcbiAgY29uc3QgdG9wQXJ0aXN0T2Jqc0xvbmdUZXJtOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHRvcEFydGlzdE9ianNTaG9ydFRlcm0sXHJcbiAgICB0b3BBcnRpc3RPYmpzTWlkVGVybSxcclxuICAgIHRvcEFydGlzdE9ianNMb25nVGVybVxyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgYXJ0aXN0VGVybVNlbGVjdGlvbnMgPSBkb2N1bWVudFxyXG4gIC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5hcnRpc3RUZXJtU2VsZWN0aW9ucykgPz8gdGhyb3dFeHByZXNzaW9uKGB0ZXJtIHNlbGVjdGlvbiBvZiBpZCAke2NvbmZpZy5DU1MuSURzLmFydGlzdFRlcm1TZWxlY3Rpb25zfSBkb2VzIG5vdCBleGlzdGApXHJcbmNvbnN0IHNlbGVjdGlvbnMgPSB7XHJcbiAgdGVybVRhYk1hbmFnZXI6IG5ldyBTZWxlY3RhYmxlVGFiRWxzKClcclxufVxyXG5cclxuY29uc3QgYWRkRXZlbnRMaXN0ZW5lcnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGFkZEFydGlzdFRlcm1CdXR0b25FdmVudHMgKCkge1xyXG4gICAgZnVuY3Rpb24gb25DbGljayAoYnRuOiBFbGVtZW50LCBib3JkZXJDb3ZlcjogRWxlbWVudCkge1xyXG4gICAgICBjb25zdCBhdHRyID0gYnRuLmdldEF0dHJpYnV0ZShcclxuICAgICAgICBjb25maWcuQ1NTLkFUVFJJQlVURVMuZGF0YVNlbGVjdGlvblxyXG4gICAgICApID8/IHRocm93RXhwcmVzc2lvbihgYXR0cmlidXRlICR7Y29uZmlnLkNTUy5BVFRSSUJVVEVTLmRhdGFTZWxlY3Rpb259IGRvZXMgbm90IGV4aXN0IG9uIHRlcm0gYnV0dG9uYClcclxuXHJcbiAgICAgIGFydGlzdEFjdGlvbnMuc2VsZWN0aW9ucy50ZXJtID0gZGV0ZXJtaW5lVGVybShhdHRyKVxyXG5cclxuICAgICAgc2F2ZVRlcm0oYXJ0aXN0QWN0aW9ucy5zZWxlY3Rpb25zLnRlcm0sIFRFUk1fVFlQRS5BUlRJU1RTKVxyXG4gICAgICBzZWxlY3Rpb25zLnRlcm1UYWJNYW5hZ2VyLnNlbGVjdE5ld1RhYihidG4sIGJvcmRlckNvdmVyKVxyXG5cclxuICAgICAgY29uc3QgY3VyckFydGlzdHMgPSBhcnRpc3RBY3Rpb25zLmdldEN1cnJTZWxUb3BBcnRpc3RzKClcclxuICAgICAgYXJ0aXN0Q2FyZHNIYW5kbGVyLmRpc3BsYXlBcnRpc3RDYXJkcyhjdXJyQXJ0aXN0cylcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcnRpc3RUZXJtQnRucyA9IGFydGlzdFRlcm1TZWxlY3Rpb25zLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdidXR0b24nKVxyXG4gICAgY29uc3QgdHJhY2tUZXJtQm9yZGVyQ292ZXJzID0gYXJ0aXN0VGVybVNlbGVjdGlvbnMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMuYm9yZGVyQ292ZXIpXHJcblxyXG4gICAgaWYgKHRyYWNrVGVybUJvcmRlckNvdmVycy5sZW5ndGggIT09IGFydGlzdFRlcm1CdG5zLmxlbmd0aCkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdOb3QgYWxsIHRyYWNrIHRlcm0gYnV0dG9ucyBjb250YWluIGEgYm9yZGVyIGNvdmVyJylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFydGlzdFRlcm1CdG5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGFydGlzdFRlcm1CdG5zW2ldXHJcbiAgICAgIGNvbnN0IGJvcmRlckNvdmVyID0gdHJhY2tUZXJtQm9yZGVyQ292ZXJzW2ldXHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9uQ2xpY2soYnRuLCBib3JkZXJDb3ZlcikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWRkQXJ0aXN0VGVybUJ1dHRvbkV2ZW50c1xyXG4gIH1cclxufSkoKTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXI8Ym9vbGVhbj4oY2hlY2tJZkhhc1Rva2VucygpLCAoaGFzVG9rZW4pID0+XHJcbiAgICBvblN1Y2Nlc3NmdWxUb2tlbkNhbGwoaGFzVG9rZW4sICgpID0+IHtcclxuICAgICAgbG9hZFRlcm0oVEVSTV9UWVBFLkFSVElTVFMpLnRoZW4odGVybSA9PiB7XHJcbiAgICAgICAgYXJ0aXN0QWN0aW9ucy5zZWxlY3Rpb25zLnRlcm0gPSB0ZXJtXHJcbiAgICAgICAgYXJ0aXN0Q2FyZHNIYW5kbGVyLmRpc3BsYXlBcnRpc3RDYXJkcyhhcnRpc3RBY3Rpb25zLmdldEN1cnJTZWxUb3BBcnRpc3RzKCkpXHJcbiAgICAgICAgc2VsZWN0U3RhcnRUZXJtVGFiKHRlcm0sIHNlbGVjdGlvbnMudGVybVRhYk1hbmFnZXIsIGFydGlzdFRlcm1TZWxlY3Rpb25zKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICApXHJcbiAgT2JqZWN0LmVudHJpZXMoYWRkRXZlbnRMaXN0ZW5lcnMpLmZvckVhY2goKFssIGFkZEV2ZW50TGlzdGVuZXJdKSA9PiB7XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKClcclxuICB9KVxyXG59KSgpXHJcbiIsImltcG9ydCBheGlvcywgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnXHJcbmltcG9ydCB7IGNvbmZpZywgcHJvbWlzZUhhbmRsZXIgfSBmcm9tICcuL2NvbmZpZydcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkaXNwbGF5VXNlcm5hbWUgKCkge1xyXG4gIHByb21pc2VIYW5kbGVyPEF4aW9zUmVzcG9uc2U8c3RyaW5nIHwgbnVsbD4+KGF4aW9zLnJlcXVlc3Q8c3RyaW5nIHwgbnVsbD4oeyBtZXRob2Q6ICdHRVQnLCB1cmw6IGNvbmZpZy5VUkxzLmdldFVzZXJuYW1lIH0pLCAocmVzKSA9PiB7XHJcbiAgICBjb25zdCB1c2VybmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnVzZXJuYW1lKVxyXG4gICAgaWYgKHVzZXJuYW1lKSB7XHJcbiAgICAgIHVzZXJuYW1lLnRleHRDb250ZW50ID0gcmVzLmRhdGFcclxuICAgIH1cclxuICB9KVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9wdWJsaWMvcGFnZXMvdG9wLWFydGlzdHMtcGFnZS90b3AtYXJ0aXN0cy50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==