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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RTtnQkFDWixRQUFRLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJO2FBQ2hDO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUFBO0FBUEQsMENBT0M7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQ1ZEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9TZWxlY3RhYmxlVGFiRWxzLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FsYnVtLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FydGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9hc3luY1NlbGVjdGlvblZlcmlmLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2NhcmQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3BsYXliYWNrLXNkay50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvYWdncmVnYXRvci50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL3N1YnNjcmlwdGlvbi50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zYXZlLWxvYWQtdGVybS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXliYWNrLWVsZW1lbnQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvdHJhY2sudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbmZpZy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvbWFuYWdlLXRva2Vucy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvcGFnZXMvdG9wLWFydGlzdHMtcGFnZS90b3AtYXJ0aXN0cy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvdXNlci1kYXRhLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBjb25maWcudHJhbnNpdGlvbmFsICYmIGNvbmZpZy50cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbDtcblxuICBpZiAodHJhbnNpdGlvbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWxpZGF0b3IuYXNzZXJ0T3B0aW9ucyh0cmFuc2l0aW9uYWwsIHtcbiAgICAgIHNpbGVudEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgZm9yY2VkSlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBjbGFyaWZ5VGltZW91dEVycm9yOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpXG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBza2lwcGVkIGludGVyY2VwdG9yc1xuICB2YXIgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdmFyIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHRydWU7XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGlmICh0eXBlb2YgaW50ZXJjZXB0b3IucnVuV2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnRlcmNlcHRvci5ydW5XaGVuKGNvbmZpZykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9yLnN5bmNocm9ub3VzO1xuXG4gICAgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoIXN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycykge1xuICAgIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG5cbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjaGFpbiwgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4pO1xuICAgIGNoYWluID0gY2hhaW4uY29uY2F0KHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbik7XG5cbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG5cbiAgdmFyIG5ld0NvbmZpZyA9IGNvbmZpZztcbiAgd2hpbGUgKHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHZhciBvbkZ1bGZpbGxlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdmFyIG9uUmVqZWN0ZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHRyeSB7XG4gICAgICBuZXdDb25maWcgPSBvbkZ1bGZpbGxlZChuZXdDb25maWcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvblJlamVjdGVkKGVycm9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcHJvbWlzZSA9IGRpc3BhdGNoUmVxdWVzdChuZXdDb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cblxuICB3aGlsZSAocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4ocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCksIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgIGNvbmZpZyxcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgY29uZmlnLFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIHZhciBjb250ZXh0ID0gdGhpcyB8fCBkZWZhdWx0cztcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4uY2FsbChjb250ZXh0LCBkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9jb3JlL2VuaGFuY2VFcnJvcicpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVNhZmVseShyYXdWYWx1ZSwgcGFyc2VyLCBlbmNvZGVyKSB7XG4gIGlmICh1dGlscy5pc1N0cmluZyhyYXdWYWx1ZSkpIHtcbiAgICB0cnkge1xuICAgICAgKHBhcnNlciB8fCBKU09OLnBhcnNlKShyYXdWYWx1ZSk7XG4gICAgICByZXR1cm4gdXRpbHMudHJpbShyYXdWYWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubmFtZSAhPT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoZW5jb2RlciB8fCBKU09OLnN0cmluZ2lmeSkocmF3VmFsdWUpO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cbiAgdHJhbnNpdGlvbmFsOiB7XG4gICAgc2lsZW50SlNPTlBhcnNpbmc6IHRydWUsXG4gICAgZm9yY2VkSlNPTlBhcnNpbmc6IHRydWUsXG4gICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogZmFsc2VcbiAgfSxcblxuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpIHx8IChoZWFkZXJzICYmIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID09PSAnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHJldHVybiBzdHJpbmdpZnlTYWZlbHkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICB2YXIgdHJhbnNpdGlvbmFsID0gdGhpcy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwa2cgPSByZXF1aXJlKCcuLy4uLy4uL3BhY2thZ2UuanNvbicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xudmFyIGN1cnJlbnRWZXJBcnIgPSBwa2cudmVyc2lvbi5zcGxpdCgnLicpO1xuXG4vKipcbiAqIENvbXBhcmUgcGFja2FnZSB2ZXJzaW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gdGhhblZlcnNpb25cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uLCB0aGFuVmVyc2lvbikge1xuICB2YXIgcGtnVmVyc2lvbkFyciA9IHRoYW5WZXJzaW9uID8gdGhhblZlcnNpb24uc3BsaXQoJy4nKSA6IGN1cnJlbnRWZXJBcnI7XG4gIHZhciBkZXN0VmVyID0gdmVyc2lvbi5zcGxpdCgnLicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGlmIChwa2dWZXJzaW9uQXJyW2ldID4gZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChwa2dWZXJzaW9uQXJyW2ldIDwgZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvclxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgdmFyIGlzRGVwcmVjYXRlZCA9IHZlcnNpb24gJiYgaXNPbGRlclZlcnNpb24odmVyc2lvbik7XG5cbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIHBrZy52ZXJzaW9uICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkIGluICcgKyB2ZXJzaW9uKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGVwcmVjYXRlZCAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNPbGRlclZlcnNpb246IGlzT2xkZXJWZXJzaW9uLFxuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5cclxuY2xhc3MgU2VsZWN0YWJsZVRhYkVscyB7XHJcbiAgYnRuOiBFbGVtZW50IHwgdW5kZWZpbmVkO1xyXG4gIGJvcmRlckNvdmVyOiBFbGVtZW50IHwgdW5kZWZpbmVkO1xyXG5cclxuICBwcml2YXRlIHVuc2VsZWN0RWxzICgpIHtcclxuICAgIGlmICh0aGlzLmJ0biAmJiB0aGlzLmJvcmRlckNvdmVyKSB7XHJcbiAgICAgIHRoaXMuYnRuLmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgICB0aGlzLmJvcmRlckNvdmVyLmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZWxlY3RFbHMgKCkge1xyXG4gICAgaWYgKHRoaXMuYnRuICYmIHRoaXMuYm9yZGVyQ292ZXIpIHtcclxuICAgICAgdGhpcy5idG4uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgIHRoaXMuYm9yZGVyQ292ZXIuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2VsZWN0TmV3VGFiIChidG46IEVsZW1lbnQsIGJvcmRlckNvdmVyOiBFbGVtZW50KSB7XHJcbiAgICAvLyB1bnNlbGVjdCB0aGUgcHJldmlvdXMgdGFiXHJcbiAgICB0aGlzLnVuc2VsZWN0RWxzKClcclxuXHJcbiAgICAvLyByZWFzc2lnbiB0aGUgbmV3IHRhYiBlbGVtZW50c1xyXG4gICAgdGhpcy5idG4gPSBidG5cclxuICAgIHRoaXMuYm9yZGVyQ292ZXIgPSBib3JkZXJDb3ZlclxyXG5cclxuICAgIC8vIHNlbGVjdCB0aGUgbmV3IHRhYlxyXG4gICAgdGhpcy5zZWxlY3RFbHMoKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2VsZWN0YWJsZVRhYkVsc1xyXG4iLCJjbGFzcyBBbGJ1bSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGV4dGVybmFsVXJsOiBzdHJpbmc7XHJcbiAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgZXh0ZXJuYWxVcmw6IHN0cmluZykge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5leHRlcm5hbFVybCA9IGV4dGVybmFsVXJsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBbGJ1bVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIGh0bWxUb0VsLCBnZXRWYWxpZEltYWdlIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgVHJhY2ssIHsgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSB9IGZyb20gJy4vdHJhY2snXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QgZnJvbSAnLi9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCB7IEFydGlzdERhdGEsIFNwb3RpZnlJbWcgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY2xhc3MgQXJ0aXN0IGV4dGVuZHMgQ2FyZCB7XHJcbiAgYXJ0aXN0SWQ6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgZ2VucmVzOiBBcnJheTxzdHJpbmc+O1xyXG4gIGZvbGxvd2VyQ291bnQ6IHN0cmluZztcclxuICBleHRlcm5hbFVybDogc3RyaW5nO1xyXG4gIGltYWdlVXJsOiBzdHJpbmc7XHJcbiAgdG9wVHJhY2tzOiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IHVuZGVmaW5lZDtcclxuXHJcbiAgY29uc3RydWN0b3IgKGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZ2VucmVzOiBBcnJheTxzdHJpbmc+LCBmb2xsb3dlckNvdW50OiBzdHJpbmcsIGV4dGVybmFsVXJsOiBzdHJpbmcsIGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuYXJ0aXN0SWQgPSBpZFxyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5nZW5yZXMgPSBnZW5yZXNcclxuICAgIHRoaXMuZm9sbG93ZXJDb3VudCA9IGZvbGxvd2VyQ291bnRcclxuICAgIHRoaXMuZXh0ZXJuYWxVcmwgPSBleHRlcm5hbFVybFxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqICBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgYXJ0aXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgZ2V0QXJ0aXN0SHRtbCAoaWR4OiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0UHJlZml4fSR7aWR4fWBcclxuXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBsZXQgZ2VucmVMaXN0ID0gJydcclxuICAgIHRoaXMuZ2VucmVzLmZvckVhY2goKGdlbnJlKSA9PiB7XHJcbiAgICAgIGdlbnJlTGlzdCArPSAnPGxpPicgKyBnZW5yZSArICc8L2xpPidcclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdH0gJHtjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUlufVwiIGlkPVwiJHt0aGlzLmNhcmRJZH1cIj5cclxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNvbnRlbnR9XCI+XHJcbiAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiYXJ0aXN0LWJhc2VcIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9JHt0aGlzLmltYWdlVXJsfSBhbHQ9XCJBcnRpc3RcIi8+XHJcbiAgICAgICAgICAgIDxoMz4ke3RoaXMubmFtZX08L2gzPlxyXG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJnZW5yZXNcIj5cclxuICAgICAgICAgICAgICAke2dlbnJlTGlzdH1cclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIDwvaGVhZGVyPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrc0FyZWF9XCI+XHJcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuYXJ0aXN0VG9wVHJhY2tzfVwiPlxyXG4gICAgICAgICAgICAgIDxoZWFkZXI+XHJcbiAgICAgICAgICAgICAgICA8aDQ+VG9wIFRyYWNrczwvaDQ+XHJcbiAgICAgICAgICAgICAgPC9oZWFkZXI+XHJcbiAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsQmFyfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja0xpc3R9XCI+XHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2R1Y2VzIHRoZSBjYXJkIGVsZW1lbnQgb2YgdGhpcyBhcnRpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRBcnRpc3RDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSk6IE5vZGUge1xyXG4gICAgY29uc3QgaWQgPSBgJHtjb25maWcuQ1NTLklEcy5hcnRpc3RQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucmFua0NhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW5cclxuICAgIH0gJHthcHBlYXJDbGFzc31cIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3R9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEZyb250XHJcbiAgICAgICAgICAgICAgICAgIH1cIiAgdGl0bGU9XCJDbGljayB0byB2aWV3IG1vcmUgSW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlVXJsfVwiIGFsdD1cIkFsYnVtIENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIH1cIj4ke3RoaXMubmFtZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5Gb2xsb3dlcnM6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMuZm9sbG93ZXJDb3VudH08L3A+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRUb3BUcmFja3MgKCkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEFydGlzdFRvcFRyYWNrcyh0aGlzLmFydGlzdElkKSlcclxuICAgIGNvbnN0IHRyYWNrc0RhdGEgPSByZXMuZGF0YS50cmFja3NcclxuICAgIGNvbnN0IHRyYWNrT2JqcyA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPigpXHJcblxyXG4gICAgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSh0cmFja3NEYXRhLCB0cmFja09ianMpXHJcblxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB0cmFja09ianNcclxuICAgIHJldHVybiB0cmFja09ianNcclxuICB9XHJcblxyXG4gIGhhc0xvYWRlZFRvcFRyYWNrcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b3BUcmFja3MgIT09IHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQXJ0aXN0c0Zyb21EYXRhIChkYXRhczogQXJyYXk8QXJ0aXN0RGF0YT4sIGFydGlzdEFycjogQXJyYXk8QXJ0aXN0Pikge1xyXG4gIGRhdGFzLmZvckVhY2goKGRhdGE6IEFydGlzdERhdGEpID0+IHtcclxuICAgIGFydGlzdEFyci5wdXNoKFxyXG4gICAgICBuZXcgQXJ0aXN0KFxyXG4gICAgICAgIGRhdGEuaWQsXHJcbiAgICAgICAgZGF0YS5uYW1lLFxyXG4gICAgICAgIGRhdGEuZ2VucmVzLFxyXG4gICAgICAgIGRhdGEuZm9sbG93ZXJzLnRvdGFsLFxyXG4gICAgICAgIGRhdGEuZXh0ZXJuYWxfdXJscy5zcG90aWZ5LFxyXG4gICAgICAgIGRhdGEuaW1hZ2VzXHJcbiAgICAgIClcclxuICAgIClcclxuICB9KVxyXG4gIHJldHVybiBhcnRpc3RBcnJcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0XHJcbiIsImNsYXNzIEFzeW5jU2VsZWN0aW9uVmVyaWY8VD4ge1xyXG4gIHByaXZhdGUgX2N1cnJTZWxlY3RlZFZhbDogVCB8IG51bGw7XHJcbiAgaGFzTG9hZGVkQ3VyclNlbGVjdGVkOiBib29sZWFuO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLl9jdXJyU2VsZWN0ZWRWYWwgPSBudWxsXHJcblxyXG4gICAgLy8gdXNlZCB0byBlbnN1cmUgdGhhdCBhbiBvYmplY3QgdGhhdCBoYXMgbG9hZGVkIHdpbGwgbm90IGJlIGxvYWRlZCBhZ2FpblxyXG4gICAgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnJTZWxlY3RlZFZhbE5vTnVsbCAoKTogVCB7XHJcbiAgICBpZiAoIXRoaXMuX2N1cnJTZWxlY3RlZFZhbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZSBpcyBhY2Nlc3NlZCB3aXRob3V0IGJlaW5nIGFzc2lnbmVkJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9jdXJyU2VsZWN0ZWRWYWxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldCBjdXJyU2VsZWN0ZWRWYWwgKCk6IFQgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9jdXJyU2VsZWN0ZWRWYWxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZSB0aGUgdmFsdWUgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBhbmQgcmVzZXQgdGhlIGhhcyBsb2FkZWQgYm9vbGVhbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VH0gY3VyclNlbGVjdGVkVmFsIHRoZSB2YWx1ZSB0byBjaGFuZ2UgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZSB0b28uXHJcbiAgICovXHJcbiAgc2VsZWN0aW9uQ2hhbmdlZCAoY3VyclNlbGVjdGVkVmFsOiBUKSB7XHJcbiAgICB0aGlzLl9jdXJyU2VsZWN0ZWRWYWwgPSBjdXJyU2VsZWN0ZWRWYWxcclxuICAgIHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkID0gZmFsc2VcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyB0byBzZWUgaWYgYSBzZWxlY3RlZCB2YWx1ZSBwb3N0IGxvYWQgaXMgdmFsaWQgYnlcclxuICAgKiBjb21wYXJpbmcgaXQgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZSBhbmQgdmVyaWZ5aW5nIHRoYXRcclxuICAgKiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGhhcyBub3QgYWxyZWFkeSBiZWVuIGxvYWRlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VH0gcG9zdExvYWRWYWwgZGF0YSB0aGF0IGhhcyBiZWVuIGxvYWRlZFxyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSB3aGV0aGVyIHRoZSBsb2FkZWQgc2VsZWN0aW9uIGlzIHZhbGlkXHJcbiAgICovXHJcbiAgaXNWYWxpZCAocG9zdExvYWRWYWw6IFQpOiBib29sZWFuIHtcclxuICAgIGlmICh0aGlzLl9jdXJyU2VsZWN0ZWRWYWwgIT09IHBvc3RMb2FkVmFsIHx8IHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gaWYgaXMgdmFsaWQgdGhlbiB3ZSBhc3N1bWUgdGhhdCB0aGlzIHZhbHVlIHdpbGwgYmUgbG9hZGVkXHJcbiAgICAgIHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkID0gdHJ1ZVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXN5bmNTZWxlY3Rpb25WZXJpZlxyXG4iLCJjbGFzcyBDYXJkIHtcclxuICBjYXJkSWQ6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5jYXJkSWQgPSAnJ1xyXG4gIH1cclxuXHJcbiAgZ2V0Q2FyZElkICgpIHtcclxuICAgIGlmICh0aGlzLmNhcmRJZCA9PT0gJ251bGwnKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FyZCBpZCB3YXMgYXNraW5nIHRvIGJlIHJldHJpZXZlZCBidXQgaXMgbnVsbCcpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5jYXJkSWRcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhcmRcclxuIiwiLyogQ29weXJpZ2h0IChjKSAyMDA5IE5pY2hvbGFzIEMuIFpha2FzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAqL1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBzaW5nbGUgbm9kZSBpbiBhIERvdWJseUxpbmtlZExpc3QuXHJcbiAqIEBjbGFzcyBEb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHtcclxuICBkYXRhOiBUO1xyXG4gIG5leHQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIHByZXZpb3VzOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb3VibHlMaW5rZWRMaXN0Tm9kZS5cclxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgdG8gc3RvcmUgaW4gdGhlIG5vZGUuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKGRhdGE6IFQpIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRhdGEgdGhhdCB0aGlzIG5vZGUgc3RvcmVzLlxyXG4gICAgICogQHByb3BlcnR5IGRhdGFcclxuICAgICAqIEB0eXBlICpcclxuICAgICAqL1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBwb2ludGVyIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIERvdWJseUxpbmtlZExpc3QuXHJcbiAgICAgKiBAcHJvcGVydHkgbmV4dFxyXG4gICAgICogQHR5cGUgP0RvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAgICAgKi9cclxuICAgIHRoaXMubmV4dCA9IG51bGxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcG9pbnRlciB0byB0aGUgcHJldmlvdXMgbm9kZSBpbiB0aGUgRG91Ymx5TGlua2VkTGlzdC5cclxuICAgICAqIEBwcm9wZXJ0eSBwcmV2aW91c1xyXG4gICAgICogQHR5cGUgP0RvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAgICAgKi9cclxuICAgIHRoaXMucHJldmlvdXMgPSBudWxsXHJcbiAgfVxyXG59XHJcbi8qKlxyXG4gKiBBIGRvdWJseSBsaW5rZWQgbGlzdCBpbXBsZW1lbnRhdGlvbiBpbiBKYXZhU2NyaXB0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdFxyXG4gKi9cclxuY2xhc3MgRG91Ymx5TGlua2VkTGlzdDxUPiB7XHJcbiAgaGVhZDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgdGFpbDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb3VibHlMaW5rZWRMaXN0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgLy8gcG9pbnRlciB0byBmaXJzdCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICB0aGlzLmhlYWQgPSBudWxsXHJcblxyXG4gICAgLy8gcG9pbnRlciB0byBsYXN0IG5vZGUgaW4gdGhlIGxpc3Qgd2hpY2ggcG9pbnRzIHRvIG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZHMgc29tZSBkYXRhIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKi9cclxuICBhZGQgKGRhdGE6IFQpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+KGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgLypcclxuICAgICAgICogQmVjYXVzZSB0aGVyZSBhcmUgbm8gbm9kZXMgaW4gdGhlIGxpc3QsIGp1c3Qgc2V0IHRoZVxyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBwb2ludGVyIHRvIHRoZSBuZXcgbm9kZS5cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaGVhZCA9IG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFVubGlrZSBpbiBhIHNpbmdseSBsaW5rZWQgbGlzdCwgd2UgaGF2ZSBhIGRpcmVjdCByZWZlcmVuY2UgdG9cclxuICAgICAgICogdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gU2V0IHRoZSBgbmV4dGAgcG9pbnRlciBvZiB0aGVcclxuICAgICAgICogY3VycmVudCBsYXN0IG5vZGUgdG8gYG5ld05vZGVgIGluIG9yZGVyIHRvIGFwcGVuZCB0aGUgbmV3IGRhdGFcclxuICAgICAgICogdG8gdGhlIGVuZCBvZiB0aGUgbGlzdC4gVGhlbiwgc2V0IGBuZXdOb2RlLnByZXZpb3VzYCB0byB0aGUgY3VycmVudFxyXG4gICAgICAgKiB0YWlsIHRvIGVuc3VyZSBiYWNrd2FyZHMgdHJhY2tpbmcgd29yay5cclxuICAgICAgICovXHJcbiAgICAgIGlmICh0aGlzLnRhaWwgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwubmV4dCA9IG5ld05vZGVcclxuICAgICAgfVxyXG4gICAgICBuZXdOb2RlLnByZXZpb3VzID0gdGhpcy50YWlsXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIExhc3QsIHJlc2V0IGB0aGlzLnRhaWxgIHRvIGBuZXdOb2RlYCB0byBlbnN1cmUgd2UgYXJlIHN0aWxsXHJcbiAgICAgKiB0cmFja2luZyB0aGUgbGFzdCBub2RlIGNvcnJlY3RseS5cclxuICAgICAqL1xyXG4gICAgdGhpcy50YWlsID0gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBzb21lIGRhdGEgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBsaXN0LiBUaGlzIG1ldGhvZCB0cmF2ZXJzZXNcclxuICAgKiB0aGUgZXhpc3RpbmcgbGlzdCBhbmQgcGxhY2VzIHRoZSBkYXRhIGluIGEgbmV3IG5vZGUgYXQgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBhdCB3aGljaCB0byBpbnNlcnQgdGhlIGRhdGEuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGluZGV4IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgaW5zZXJ0QmVmb3JlIChkYXRhOiBULCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgaW5zZXJ0ZWQgaW50byB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZShkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBTcGVjaWFsIGNhc2U6IGlmIGBpbmRleGAgaXMgYDBgLCB0aGVuIG5vIHRyYXZlcnNhbCBpcyBuZWVkZWRcclxuICAgICAqIGFuZCB3ZSBuZWVkIHRvIHVwZGF0ZSBgdGhpcy5oZWFkYCB0byBwb2ludCB0byBgbmV3Tm9kZWAuXHJcbiAgICAgKi9cclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBFbnN1cmUgdGhlIG5ldyBub2RlJ3MgYG5leHRgIHByb3BlcnR5IGlzIHBvaW50ZWQgdG8gdGhlIGN1cnJlbnRcclxuICAgICAgICogaGVhZC5cclxuICAgICAgICovXHJcbiAgICAgIG5ld05vZGUubmV4dCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGN1cnJlbnQgaGVhZCdzIGBwcmV2aW91c2AgcHJvcGVydHkgbmVlZHMgdG8gcG9pbnQgdG8gdGhlIG5ld1xyXG4gICAgICAgKiBub2RlIHRvIGVuc3VyZSB0aGUgbGlzdCBpcyB0cmF2ZXJzYWJsZSBiYWNrd2FyZHMuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQucHJldmlvdXMgPSBuZXdOb2RlXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBOb3cgaXQncyBzYWZlIHRvIHNldCBgdGhpcy5oZWFkYCB0byB0aGUgbmV3IG5vZGUsIGVmZmVjdGl2ZWx5XHJcbiAgICAgICAqIG1ha2luZyB0aGUgbmV3IG5vZGUgdGhlIGZpcnN0IG5vZGUgaW4gdGhlIGxpc3QuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgICAqIGdvbmUuIFRoaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBpID0gMFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgdXNpbmcgYG5leHRgIHBvaW50ZXJzLCBhbmQgbWFrZVxyXG4gICAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAgICogYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0b1xyXG4gICAgICAgKiBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQubmV4dCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgICAgaSsrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEF0IHRoaXMgcG9pbnQsIGBjdXJyZW50YCBpcyBlaXRoZXIgdGhlIG5vZGUgdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YVxyXG4gICAgICAgKiBiZWZvcmUsIG9yIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFRoZSBvbmx5IHdheSB0byB0ZWxsIGlzIGlmXHJcbiAgICAgICAqIGBpYCBpcyBzdGlsbCBsZXNzIHRoYW4gYGluZGV4YCwgdGhhdCBtZWFucyB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlXHJcbiAgICAgICAqIGFuZCBhbiBlcnJvciBzaG91bGQgYmUgdGhyb3duLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKGkgPCBpbmRleCkge1xyXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBJZiBjb2RlIGNvbnRpbnVlcyB0byBleGVjdXRlIGhlcmUsIGl0IG1lYW5zIGBjdXJyZW50YCBpcyB0aGUgbm9kZVxyXG4gICAgICAgKiB0byBpbnNlcnQgbmV3IGRhdGEgYmVmb3JlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBGaXJzdCwgaW5zZXJ0IGBuZXdOb2RlYCBhZnRlciBgY3VycmVudC5wcmV2aW91c2AgYnkgdXBkYXRpbmdcclxuICAgICAgICogYGN1cnJlbnQucHJldmlvdXMubmV4dGAgYW5kIGBuZXdOb2RlLnByZXZpb3VzYC5cclxuICAgICAgICovXHJcbiAgICAgIGN1cnJlbnQhLnByZXZpb3VzIS5uZXh0ID0gbmV3Tm9kZVxyXG4gICAgICBuZXdOb2RlIS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIE5leHQsIGluc2VydCBgY3VycmVudGAgYWZ0ZXIgYG5ld05vZGVgIGJ5IHVwZGF0aW5nIGBuZXdOb2RlLm5leHRgIGFuZFxyXG4gICAgICAgKiBgY3VycmVudC5wcmV2aW91c2AuXHJcbiAgICAgICAqL1xyXG4gICAgICBuZXdOb2RlLm5leHQgPSBjdXJyZW50XHJcbiAgICAgIGN1cnJlbnQucHJldmlvdXMgPSBuZXdOb2RlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnNlcnRzIHNvbWUgZGF0YSBpbnRvIHRoZSBtaWRkbGUgb2YgdGhlIGxpc3QuIFRoaXMgbWV0aG9kIHRyYXZlcnNlc1xyXG4gICAqIHRoZSBleGlzdGluZyBsaXN0IGFuZCBwbGFjZXMgdGhlIGRhdGEgaW4gYSBuZXcgbm9kZSBhZnRlciBhIHNwZWNpZmljIGluZGV4LlxyXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IGFmdGVyIHdoaWNoIHRvIGluc2VydCB0aGUgZGF0YS5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiB0aGUgaW5kZXggZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBpbnNlcnRBZnRlciAoZGF0YTogVCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGUoZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGFkZCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQgYW5kIHVwZGF0ZVxyXG4gICAgICogdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpbiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIGluc2VydCB0aGUgbmV3IGRhdGEuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgIGkrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgaXMgZWl0aGVyIHRoZSBub2RlIHRvIGluc2VydCB0aGUgbmV3IGRhdGFcclxuICAgICAqIGJlZm9yZSwgb3IgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gVGhlIG9ubHkgd2F5IHRvIHRlbGwgaXMgaWZcclxuICAgICAqIGBpYCBpcyBzdGlsbCBsZXNzIHRoYW4gYGluZGV4YCwgdGhhdCBtZWFucyB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlXHJcbiAgICAgKiBhbmQgYW4gZXJyb3Igc2hvdWxkIGJlIHRocm93bi5cclxuICAgICAqL1xyXG4gICAgaWYgKGkgPCBpbmRleCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgY29kZSBjb250aW51ZXMgdG8gZXhlY3V0ZSBoZXJlLCBpdCBtZWFucyBgY3VycmVudGAgaXMgdGhlIG5vZGVcclxuICAgICAqIHRvIGluc2VydCBuZXcgZGF0YSBhZnRlci5cclxuICAgICAqL1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogYGN1cnJlbnRgIGlzIHRoZSB0YWlsLCBzbyByZXNldCBgdGhpcy50YWlsYFxyXG4gICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICB0aGlzLnRhaWwgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBPdGhlcndpc2UsIGluc2VydCBgbmV3Tm9kZWAgYmVmb3JlIGBjdXJyZW50Lm5leHRgIGJ5IHVwZGF0aW5nXHJcbiAgICAgICAqIGBjdXJyZW50Lm5leHQucHJldmlvdXNgIGFuZCBgbmV3Tm9kZS5ub2RlYC5cclxuICAgICAgICovXHJcbiAgICAgIGN1cnJlbnQhLm5leHQhLnByZXZpb3VzID0gbmV3Tm9kZVxyXG4gICAgICBuZXdOb2RlLm5leHQgPSBjdXJyZW50IS5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIE5leHQsIGluc2VydCBgbmV3Tm9kZWAgYWZ0ZXIgYGN1cnJlbnRgIGJ5IHVwZGF0aW5nIGBuZXdOb2RlLnByZXZpb3VzYCBhbmRcclxuICAgICAqIGBjdXJyZW50Lm5leHRgLlxyXG4gICAgICovXHJcbiAgICBuZXdOb2RlLnByZXZpb3VzID0gY3VycmVudFxyXG4gICAgY3VycmVudCEubmV4dCA9IG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBub2RlIHdob3NlIGRhdGFcclxuICAgKiAgICAgIHNob3VsZCBiZSByZXR1cm5lZC5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGRhdGEgaW4gdGhlIFwiZGF0YVwiIHBvcnRpb24gb2YgdGhlIGdpdmVuIG5vZGVcclxuICAgKiAgICAgIG9yIHVuZGVmaW5lZCBpZiB0aGUgbm9kZSBkb2Vzbid0IGV4aXN0LlxyXG4gICAqL1xyXG4gIGdldCAoaW5kZXg6IG51bWJlciwgYXNOb2RlOiBib29sZWFuKTogVCB8IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHtcclxuICAgIC8vIGVuc3VyZSBgaW5kZXhgIGlzIGEgcG9zaXRpdmUgdmFsdWVcclxuICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGkgPSAwXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcywgYnV0IG1ha2Ugc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55XHJcbiAgICAgICAqIG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGUgdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpblxyXG4gICAgICAgKiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW4gYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zXHJcbiAgICAgICAqIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0byBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgbWlnaHQgYmUgbnVsbCBpZiB3ZSd2ZSBnb25lIHBhc3QgdGhlXHJcbiAgICAgICAqIGVuZCBvZiB0aGUgbGlzdC4gSW4gdGhhdCBjYXNlLCB3ZSByZXR1cm4gYHVuZGVmaW5lZGAgdG8gaW5kaWNhdGVcclxuICAgICAgICogdGhhdCB0aGUgbm9kZSBhdCBgaW5kZXhgIHdhcyBub3QgZm91bmQuIElmIGBjdXJyZW50YCBpcyBub3RcclxuICAgICAgICogYG51bGxgLCB0aGVuIGl0J3Mgc2FmZSB0byByZXR1cm4gYGN1cnJlbnQuZGF0YWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgIGlmIChhc05vZGUpIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGluZGV4ICR7aW5kZXh9IG91dCBvZiByYW5nZWApXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbmRleCAke2luZGV4fSBvdXQgb2YgcmFuZ2VgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBpbmRleCBvZiB0aGUgZGF0YSBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gc2VhcmNoIGZvci5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBkYXRhIGluIHRoZSBsaXN0XHJcbiAgICogICAgICBvciAtMSBpZiBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgaW5kZXhPZiAoZGF0YTogVCk6IG51bWJlciB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMgYGRhdGFgLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyBgaW5kZXhgIGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoY3VycmVudC5kYXRhID09PSBkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8ga2VlcCB0cmFjayBvZiB3aGVyZSB3ZSBhcmVcclxuICAgICAgaW5kZXgrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIC0xIGFzIHRoZSBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gLTFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWF0Y2hlciBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIHdoZW4gYW4gaXRlbSBtYXRjaGVzXHJcbiAgICogICAgICBhbmQgZmFsc2Ugd2hlbiBhbiBpdGVtIGRvZXNuJ3QgbWF0Y2guXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBmaXJzdCBpdGVtIHRoYXQgcmV0dXJucyB0cnVlIGZyb20gdGhlIG1hdGNoZXIsIHVuZGVmaW5lZFxyXG4gICAqICAgICAgaWYgbm8gaXRlbXMgbWF0Y2guXHJcbiAgICovXHJcbiAgZmluZCAobWF0Y2hlcjogKGFyZzA6IFQpID0+IGJvb2xlYW4sIGFzTm9kZSA9IGZhbHNlKSA6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgVCB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgZGF0YSBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIGlmIChhc05vZGUpIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gYHVuZGVmaW5lZGAgYXMgdGhlXHJcbiAgICAgKiBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignTm8gbWF0Y2hpbmcgZGF0YSBmb3VuZCcpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXRjaGVyIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgd2hlbiBhbiBpdGVtIG1hdGNoZXNcclxuICAgKiAgICAgIGFuZCBmYWxzZSB3aGVuIGFuIGl0ZW0gZG9lc24ndCBtYXRjaC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb25cclxuICAgKiAgICAgIG9yIC0xIGlmIHRoZXJlIGFyZSBubyBtYXRjaGluZyBpdGVtcy5cclxuICAgKi9cclxuICBmaW5kSW5kZXggKG1hdGNoZXI6IChhcmcwOiBUKSA9PiBib29sZWFuKTogbnVtYmVyIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIHRoZSBpbmRleCBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hlcmUgd2UgYXJlXHJcbiAgICAgIGluZGV4KytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiAtMSBhcyB0aGVcclxuICAgICAqIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiAtMVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB0aGUgbm9kZSBmcm9tIHRoZSBnaXZlbiBsb2NhdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG5vZGUgdG8gcmVtb3ZlLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgaW5kZXggaXMgb3V0IG9mIHJhbmdlLlxyXG4gICAqL1xyXG4gIHJlbW92ZSAoaW5kZXg6IG51bWJlcikgOiBUIHtcclxuICAgIC8vIHNwZWNpYWwgY2FzZXM6IG5vIG5vZGVzIGluIHRoZSBsaXN0IG9yIGBpbmRleGAgaXMgbmVnYXRpdmVcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwgfHwgaW5kZXggPCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogcmVtb3ZpbmcgdGhlIGZpcnN0IG5vZGVcclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvLyBzdG9yZSB0aGUgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGhlYWRcclxuICAgICAgY29uc3QgZGF0YTogVCA9IHRoaXMuaGVhZC5kYXRhXHJcblxyXG4gICAgICAvLyBqdXN0IHJlcGxhY2UgdGhlIGhlYWQgd2l0aCB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXh0XHJcblxyXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHRoZXJlIHdhcyBvbmx5IG9uZSBub2RlLCBzbyBhbHNvIHJlc2V0IGB0aGlzLnRhaWxgXHJcbiAgICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbnVsbFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdGhlIGRhdGEgYXQgdGhlIHByZXZpb3VzIGhlYWQgb2YgdGhlIGxpc3RcclxuICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGdldCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGVcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8gaW5jcmVtZW50IHRoZSBjb3VudFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgYGN1cnJlbnRgIGlzbid0IGBudWxsYCwgdGhlbiB0aGF0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBub2RlXHJcbiAgICAgKiB0byByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIHNraXAgb3ZlciB0aGUgbm9kZSB0byByZW1vdmVcclxuICAgICAgY3VycmVudCEucHJldmlvdXMhLm5leHQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIElmIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSBgdGhpcy50YWlsYC5cclxuICAgICAgICpcclxuICAgICAgICogSWYgd2UgYXJlIG5vdCBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSB0aGUgYmFja3dhcmRzXHJcbiAgICAgICAqIHBvaW50ZXIgZm9yIGBjdXJyZW50Lm5leHRgIHRvIHByZXNlcnZlIHJldmVyc2UgdHJhdmVyc2FsLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICAgIHRoaXMudGFpbCA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHRoZSB2YWx1ZSB0aGF0IHdhcyBqdXN0IHJlbW92ZWQgZnJvbSB0aGUgbGlzdFxyXG4gICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIHdlJ3ZlIG1hZGUgaXQgdGhpcyBmYXIsIGl0IG1lYW5zIGBpbmRleGAgaXMgYSB2YWx1ZSB0aGF0XHJcbiAgICAgKiBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LCBzbyB0aHJvdyBhbiBlcnJvci5cclxuICAgICAqL1xyXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFsbCBub2RlcyBmcm9tIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqL1xyXG4gIGNsZWFyICgpOiB2b2lkIHtcclxuICAgIC8vIGp1c3QgcmVzZXQgYm90aCB0aGUgaGVhZCBhbmQgdGFpbCBwb2ludGVyIHRvIG51bGxcclxuICAgIHRoaXMuaGVhZCA9IG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBub2RlcyBpbiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIG5vZGVzIGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGdldCBzaXplICgpOiBudW1iZXIge1xyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiB0aGUgbGlzdCBpcyBlbXB0eVxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gMFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGNvdW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZVxyXG4gICAgICogYmVlbiB2aXNpdGVkIGluc2lkZSB0aGUgbG9vcCBiZWxvdy4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzXHJcbiAgICAgKiBpcyB0aGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBjb3VudCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhhdCBtZWFucyB3ZSdyZSBub3QgeWV0IGF0IHRoZVxyXG4gICAgICogZW5kIG9mIHRoZSBsaXN0LCBzbyBhZGRpbmcgMSB0byBgY291bnRgIGFuZCB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBjb3VudCsrXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogV2hlbiBgY3VycmVudGAgaXMgYG51bGxgLCB0aGUgbG9vcCBpcyBleGl0ZWQgYXQgdGhlIHZhbHVlIG9mIGBjb3VudGBcclxuICAgICAqIGlzIHRoZSBudW1iZXIgb2Ygbm9kZXMgdGhhdCB3ZXJlIGNvdW50ZWQgaW4gdGhlIGxvb3AuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiBjb3VudFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRlZmF1bHQgaXRlcmF0b3IgZm9yIHRoZSBjbGFzcy5cclxuICAgKiBAcmV0dXJucyB7SXRlcmF0b3J9IEFuIGl0ZXJhdG9yIGZvciB0aGUgY2xhc3MuXHJcbiAgICovXHJcbiAgW1N5bWJvbC5pdGVyYXRvcl0gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpdGVyYXRvciB0aGF0IHJldHVybnMgZWFjaCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtHZW5lcmF0b3J9IEFuIGl0ZXJhdG9yIG9uIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gICogdmFsdWVzICgpOiBHZW5lcmF0b3I8VCwgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGVyZSBpcyBhIHBpZWNlIG9mIGRhdGFcclxuICAgICAqIHRvIHlpZWxkLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICB5aWVsZCBjdXJyZW50LmRhdGFcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuIGl0ZXJhdG9yIHRoYXQgcmV0dXJucyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgaW4gcmV2ZXJzZSBvcmRlci5cclxuICAgKiBAcmV0dXJucyB7R2VuZXJhdG9yfSBBbiBpdGVyYXRvciBvbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICAqIHJldmVyc2UgKCk6IEdlbmVyYXRvcjxULCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIHRhaWwgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy50YWlsXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoZXJlIGlzIGEgcGllY2Ugb2YgZGF0YVxyXG4gICAgICogdG8geWllbGQuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIHlpZWxkIGN1cnJlbnQuZGF0YVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhlIGxpc3QgaW50byBhIHN0cmluZyByZXByZXNlbnRhdGlvbi5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGlzdC5cclxuICAgKi9cclxuICB0b1N0cmluZyAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBbLi4udGhpc10udG9TdHJpbmcoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhlIGRvdWJseSBsaW5rZWQgbGlzdCB0byBhbiBhcnJheS5cclxuICAgKiBAcmV0dXJucyB7QXJyYXk8VD59IEFuIGFycmF5IG9mIHRoZSBkYXRhIGZyb20gdGhlIGxpbmtlZCBsaXN0LlxyXG4gICAqL1xyXG4gIHRvQXJyYXkgKCk6IEFycmF5PFQ+IHtcclxuICAgIHJldHVybiBbLi4udGhpc11cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERvdWJseUxpbmtlZExpc3RcclxuZXhwb3J0IGZ1bmN0aW9uXHJcbmFycmF5VG9Eb3VibHlMaW5rZWRMaXN0IDxUPiAoYXJyOiBBcnJheTxUPikge1xyXG4gIGNvbnN0IGxpc3QgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUPigpXHJcbiAgYXJyLmZvckVhY2goKGRhdGEpID0+IHtcclxuICAgIGxpc3QuYWRkKGRhdGEpXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIGxpc3RcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBwcm9taXNlSGFuZGxlcixcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIGh0bWxUb0VsLFxyXG4gIHNodWZmbGVcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0LCBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgUGxheWFibGVFdmVudEFyZyBmcm9tICcuL3B1YnN1Yi9ldmVudC1hcmdzL3RyYWNrLXBsYXktYXJncydcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL3B1YnN1Yi9hZ2dyZWdhdG9yJ1xyXG5pbXBvcnQgeyBJUGxheWFibGUgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQgZnJvbSAnLi9zcG90aWZ5LXBsYXliYWNrLWVsZW1lbnQnXHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkVm9sdW1lICgpIHtcclxuICBjb25zdCB7IHJlcywgZXJyIH0gPSBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0UGxheWVyVm9sdW1lRGF0YSkpXHJcblxyXG4gIGlmIChlcnIpIHtcclxuICAgIHJldHVybiAwXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiByZXMhLmRhdGFcclxuICB9XHJcbn1cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZVZvbHVtZSAodm9sdW1lOiBzdHJpbmcpIHtcclxuICBwcm9taXNlSGFuZGxlcihheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0UGxheWVyVm9sdW1lRGF0YSh2b2x1bWUpKSlcclxufVxyXG5leHBvcnQgY29uc3QgcGxheWVyUHVibGljVmFycyA9IHtcclxuICBpc1NodWZmbGU6IGZhbHNlLFxyXG4gIGlzTG9vcDogZmFsc2VcclxufVxyXG5jbGFzcyBTcG90aWZ5UGxheWJhY2sge1xyXG4gIHByaXZhdGUgcGxheWVyOiBhbnk7XHJcbiAgLy8gY29udHJvbHMgdGltaW5nIG9mIGFzeW5jIGFjdGlvbnMgd2hlbiB3b3JraW5nIHdpdGggd2VicGxheWVyIHNka1xyXG4gIHByaXZhdGUgaXNFeGVjdXRpbmdBY3Rpb246IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBkZXZpY2VfaWQ6IHN0cmluZztcclxuICBwdWJsaWMgc2VsUGxheWluZzoge1xyXG4gICAgZWxlbWVudDogbnVsbCB8IEVsZW1lbnRcclxuICAgIHRyYWNrX3VyaTogc3RyaW5nXHJcbiAgICAvLyB0aGlzIG5vZGUgbWF5IGJlIGEgc2h1ZmZsZWQgb3IgdW5zaHVmZmxlZCBub2RlXHJcbiAgICBwbGF5YWJsZU5vZGU6IG51bGwgfCBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICAvLyB0aGlzIGFycmF5IGlzIGFsd2F5cyBpbiBzdGFuZGFyZCBvcmRlciBhbmQgbmV2ZXIgc2h1ZmZsZWQuXHJcbiAgICBwbGF5YWJsZUFycjogbnVsbCB8IEFycmF5PElQbGF5YWJsZT5cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U3RhdGVJbnRlcnZhbDogTm9kZUpTLlRpbWVvdXQgfCBudWxsO1xyXG4gIHByaXZhdGUgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBwbGF5ZXJJc1JlYWR5OiBib29sZWFuO1xyXG4gIHByaXZhdGUgd2FzSW5TaHVmZmxlID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgdGhpcy5wbGF5ZXIgPSBudWxsXHJcbiAgICB0aGlzLmRldmljZV9pZCA9ICcnXHJcbiAgICB0aGlzLmdldFN0YXRlSW50ZXJ2YWwgPSBudWxsXHJcblxyXG4gICAgdGhpcy5zZWxQbGF5aW5nID0ge1xyXG4gICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICB0cmFja191cmk6ICcnLFxyXG4gICAgICBwbGF5YWJsZU5vZGU6IG51bGwsXHJcbiAgICAgIHBsYXlhYmxlQXJyOiBudWxsXHJcbiAgICB9XHJcbiAgICB0aGlzLnBsYXllcklzUmVhZHkgPSBmYWxzZVxyXG5cclxuICAgIC8vIHJlbG9hZCBwbGF5ZXIgZXZlcnkgMzAgbWluIHRvIGF2b2lkIHRpbWVvdXQnc1xyXG4gICAgdGhpcy5fbG9hZFdlYlBsYXllcigpXHJcblxyXG4gICAgLy8gcGFzcyBpdCB0aGUgXCJ0aGlzLlwiIGF0dHJpYnV0ZXMgaW4gdGhpcyBzY29wZSBiZWNhdXNlIHdoZW4gYSBmdW5jdGlvbiBpcyBjYWxsZWQgZnJvbSBhIGRpZmZlcmVudCBjbGFzcyB0aGUgXCJ0aGlzLlwiIGF0dHJpYnV0ZXMgYXJlIHVuZGVmaW5lZC5cclxuICAgIHRoaXMud2ViUGxheWVyRWwgPSBuZXcgU3BvdGlmeVBsYXliYWNrRWxlbWVudCgpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldFZvbHVtZSAocGVyY2VudGFnZTogbnVtYmVyLCBwbGF5ZXI6IGFueSwgc2F2ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICBjb25zdCBuZXdWb2x1bWUgPSBwZXJjZW50YWdlIC8gMTAwXHJcbiAgICBwbGF5ZXIuc2V0Vm9sdW1lKG5ld1ZvbHVtZSlcclxuXHJcbiAgICBpZiAoc2F2ZSkge1xyXG4gICAgICBzYXZlVm9sdW1lKG5ld1ZvbHVtZS50b1N0cmluZygpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSB0aW1lIHNob3duIHdoZW4gc2Vla2luZy5cclxuICAgKiBAcGFyYW0gcGVyY2VudGFnZSBUaGUgcGVyY2VudCB0aGF0IHRoZSBiYXIgaGFzIGZpbGxlZCB3aXRoIHJlc3BlY3QgdG8gdGhlIGVudGlyZSBiYXJcclxuICAgKiBAcGFyYW0gd2ViUGxheWVyRWwgVGhlIHdlYnBsYXllciBlbGVtZW50IHRoYXQgZ2l2ZXMgdXMgYWNjZXNzIHRvIHRoZSBzb25nIHByb2dyZXNzIGJhclxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25TZWVraW5nIChwZXJjZW50YWdlOiBudW1iZXIsIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50KSB7XHJcbiAgICAvLyBnZXQgdGhlIHBvc2l0aW9uIGJ5IHVzaW5nIHRoZSBwZXJjZW50IHRoZSBwcm9ncmVzcyBiYXIuXHJcbiAgICBjb25zdCBzZWVrUG9zaXRpb24gPSB3ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLm1heCAqIChwZXJjZW50YWdlIC8gMTAwKVxyXG4gICAgaWYgKHdlYlBsYXllckVsLmN1cnJUaW1lID09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHRpbWUgZWxlbWVudCBpcyBudWxsJylcclxuICAgIH1cclxuICAgIC8vIHVwZGF0ZSB0aGUgdGV4dCBjb250ZW50IHRvIHNob3cgdGhlIHRpbWUgdGhlIHVzZXIgd2lsbCBiZSBzZWVraW5nIHRvbyBvbm1vdXNldXAuXHJcbiAgICB3ZWJQbGF5ZXJFbC5jdXJyVGltZS50ZXh0Q29udGVudCA9IG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMoc2Vla1Bvc2l0aW9uKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIHNlZWtpbmcgYWN0aW9uIGJlZ2luc1xyXG4gICAqIEBwYXJhbSBwbGF5ZXIgVGhlIHNwb3RpZnkgc2RrIHBsYXllciB3aG9zZSBzdGF0ZSB3ZSB3aWxsIHVzZSB0byBjaGFuZ2UgdGhlIHNvbmcncyBwcm9ncmVzcyBiYXIncyBtYXggdmFsdWUgdG8gdGhlIGR1cmF0aW9uIG9mIHRoZSBzb25nLlxyXG4gICAqIEBwYXJhbSB3ZWJQbGF5ZXJFbCBUaGUgd2ViIHBsYXllciBlbGVtZW50IHRoYXQgd2lsbCBhbGxvdyB1cyB0byBtb2RpZnkgdGhlIHByb2dyZXNzIGJhcnMgbWF4IGF0dHJpYnV0ZS5cclxuICAgKi9cclxuICBwcml2YXRlIG9uU2Vla1N0YXJ0IChwbGF5ZXI6IGFueSwgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQpIHtcclxuICAgIHBsYXllci5nZXRDdXJyZW50U3RhdGUoKS50aGVuKChzdGF0ZTogeyBkdXJhdGlvbjogYW55IH0pID0+IHtcclxuICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAnVXNlciBpcyBub3QgcGxheWluZyBtdXNpYyB0aHJvdWdoIHRoZSBXZWIgUGxheWJhY2sgU0RLJ1xyXG4gICAgICAgIClcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICAvLyB3aGVuIGZpcnN0IHNlZWtpbmcsIHVwZGF0ZSB0aGUgbWF4IGF0dHJpYnV0ZSB3aXRoIHRoZSBkdXJhdGlvbiBvZiB0aGUgc29uZyBmb3IgdXNlIHdoZW4gc2Vla2luZy5cclxuICAgICAgd2ViUGxheWVyRWwuc29uZ1Byb2dyZXNzIS5tYXggPSBzdGF0ZS5kdXJhdGlvblxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRvIHJ1biB3aGVuIHlvdSB3aXNoIHRvIHNlZWsgdG8gYSBjZXJ0YWluIHBvc2l0aW9uIGluIGEgc29uZy5cclxuICAgKiBAcGFyYW0gcGVyY2VudGFnZSBUaGUgcGVyY2VudCB0aGF0IHRoZSBiYXIgaGFzIGZpbGxlZCB3aXRoIHJlc3BlY3QgdG8gdGhlIGVudGlyZSBiYXJcclxuICAgKiBAcGFyYW0gcGxheWVyIHRoZSBzcG90aWZ5IHNkayBwbGF5ZXIgdGhhdCB3aWxsIHNlZWsgdGhlIHNvbmcgdG8gYSBnaXZlbiBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB3ZWJQbGF5ZXJFbCB0aGUgd2ViIHBsYXllciBlbGVtZW50IHRoYXQgZ2l2ZXMgdXMgYWNjZXNzIHRvIHRoZSBzb25nIHByb2dyZXNzIGJhci5cclxuICAgKi9cclxuICBwcml2YXRlIHNlZWtTb25nIChwZXJjZW50YWdlOiBudW1iZXIsIHBsYXllcjogYW55LCB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudCkge1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSB0cnVlXHJcbiAgICAgIC8vIG9idGFpbiB0aGUgZmluYWwgcG9zaXRpb24gdGhlIHVzZXIgd2lzaGVzIHRvIHNlZWsgb25jZSBtb3VzZSBpcyB1cC5cclxuICAgICAgY29uc3QgcG9zaXRpb24gPSAocGVyY2VudGFnZSAvIDEwMCkgKiB3ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLm1heFxyXG5cclxuICAgICAgLy8gc2VlayB0byB0aGUgY2hvc2VuIHBvc2l0aW9uLlxyXG4gICAgICBwbGF5ZXIuc2Vlayhwb3NpdGlvbikudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIF9sb2FkV2ViUGxheWVyICgpIHtcclxuICAgIC8vIGxvYWQgdGhlIHVzZXJzIHNhdmVkIHZvbHVtZSBpZiB0aGVyZSBpc250IHRoZW4gbG9hZCAwLjQgYXMgZGVmYXVsdC5cclxuICAgIGNvbnN0IHZvbHVtZSA9IGF3YWl0IGxvYWRWb2x1bWUoKVxyXG5cclxuICAgIGNvbnN0IE5PX0NPTlRFTlQgPSAyMDRcclxuICAgIGlmICh3aW5kb3cuU3BvdGlmeSkge1xyXG4gICAgICAvLyBpZiB0aGUgc3BvdGlmeSBzZGsgaXMgYWxyZWFkeSBkZWZpbmVkIHNldCBwbGF5ZXIgd2l0aG91dCBzZXR0aW5nIG9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgbWVhbmluZyB0aGUgd2luZG93OiBXaW5kb3cgaXMgaW4gYSBkaWZmZXJlbnQgc2NvcGVcclxuICAgICAgLy8gdXNlIHdpbmRvdy5TcG90aWZ5LlBsYXllciBhcyBzcG90aWZ5IG5hbWVzcGFjZSBpcyBkZWNsYXJlZCBpbiB0aGUgV2luZG93IGludGVyZmFjZSBhcyBwZXIgRGVmaW5pdGVseVR5cGVkIC0+IHNwb3RpZnktd2ViLXBsYXliYWNrLXNkayAtPiBpbmRleC5kLnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9EZWZpbml0ZWx5VHlwZWQvRGVmaW5pdGVseVR5cGVkL3RyZWUvbWFzdGVyL3R5cGVzL3Nwb3RpZnktd2ViLXBsYXliYWNrLXNka1xyXG4gICAgICB0aGlzLnBsYXllciA9IG5ldyB3aW5kb3cuU3BvdGlmeS5QbGF5ZXIoe1xyXG4gICAgICAgIG5hbWU6ICdTcG90aWZ5IEluZm8gV2ViIFBsYXllcicsXHJcbiAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnZ2V0IGF1dGggdG9rZW4nKVxyXG4gICAgICAgICAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFJlZnJlc2hBY2Nlc3NUb2tlbiksICgpID0+IHtcclxuICAgICAgICAgICAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0QWNjZXNzVG9rZW4gfSksIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gTk9fQ09OVEVOVCB8fCByZXMuZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBnaXZlIHRoZSB0b2tlbiB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZvbHVtZTogdm9sdW1lXHJcbiAgICAgIH0pXHJcbiAgICAgIHRoaXMuX2FkZExpc3RlbmVycyh2b2x1bWUpXHJcbiAgICAgIHRoaXMucGxheWVyLmNvbm5lY3QoKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gb2Ygc3BvdGlmeSBzZGsgaXMgdW5kZWZpbmVkXHJcbiAgICAgIHdpbmRvdy5vblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5ID0gKCkgPT4ge1xyXG4gICAgICAgIC8vIGlmIGdldHRpbmcgdG9rZW4gd2FzIHN1Y2Nlc2Z1bCBjcmVhdGUgc3BvdGlmeSBwbGF5ZXIgdXNpbmcgdGhlIHdpbmRvdyBpbiB0aGlzIHNjb3BlXHJcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgd2luZG93LlNwb3RpZnkuUGxheWVyKHtcclxuICAgICAgICAgIG5hbWU6ICdTcG90aWZ5IEluZm8gV2ViIFBsYXllcicsXHJcbiAgICAgICAgICBnZXRPQXV0aFRva2VuOiAoY2IpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dldCBhdXRoIHRva2VuJylcclxuICAgICAgICAgICAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFJlZnJlc2hBY2Nlc3NUb2tlbiksICgpID0+IHtcclxuICAgICAgICAgICAgICBwcm9taXNlSGFuZGxlcjxBeGlvc1Jlc3BvbnNlPHN0cmluZyB8IG51bGw+PihheGlvcy5yZXF1ZXN0PHN0cmluZyB8IG51bGw+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRBY2Nlc3NUb2tlbiB9KSwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IE5PX0NPTlRFTlQgfHwgcmVzLmRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gZ2l2ZSB0aGUgdG9rZW4gdG8gY2FsbGJhY2tcclxuICAgICAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdm9sdW1lOiB2b2x1bWVcclxuICAgICAgICB9KVxyXG4gICAgICAgIHRoaXMuX2FkZExpc3RlbmVycyh2b2x1bWUpXHJcbiAgICAgICAgdGhpcy5wbGF5ZXIuY29ubmVjdCgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2FkZExpc3RlbmVycyAobG9hZGVkVm9sdW1lOiBzdHJpbmcpIHtcclxuICAgIC8vIEVycm9yIGhhbmRsaW5nXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignaW5pdGlhbGl6YXRpb25fZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignYXV0aGVudGljYXRpb25fZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXliYWNrIGNvdWxkbnQgc3RhcnQnKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdhY2NvdW50X2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3BsYXliYWNrX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIFBsYXliYWNrIHN0YXR1cyB1cGRhdGVzXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcigncGxheWVyX3N0YXRlX2NoYW5nZWQnLCAoc3RhdGU6IFNwb3RpZnkuUGxheWJhY2tTdGF0ZSB8IG51bGwpID0+IHsgfSlcclxuXHJcbiAgICAvLyBSZWFkeVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUmVhZHkgd2l0aCBEZXZpY2UgSUQnLCBkZXZpY2VfaWQpXHJcbiAgICAgIHRoaXMuZGV2aWNlX2lkID0gZGV2aWNlX2lkXHJcblxyXG4gICAgICAvLyBhcHBlbmQgd2ViIHBsYXllciBlbGVtZW50IHRvIERPTVxyXG4gICAgICB0aGlzLndlYlBsYXllckVsLmFwcGVuZFdlYlBsYXllckh0bWwoXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlQbGF5UHJldih0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKSxcclxuICAgICAgICAoKSA9PiB0aGlzLnRyeVdlYlBsYXllclBhdXNlKHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUpLFxyXG4gICAgICAgICgpID0+IHRoaXMudHJ5UGxheU5leHQodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy5vblNlZWtTdGFydCh0aGlzLnBsYXllciwgdGhpcy53ZWJQbGF5ZXJFbCksXHJcbiAgICAgICAgKHBlcmNlbnRhZ2UpID0+IHRoaXMuc2Vla1NvbmcocGVyY2VudGFnZSwgdGhpcy5wbGF5ZXIsIHRoaXMud2ViUGxheWVyRWwpLFxyXG4gICAgICAgIChwZXJjZW50YWdlKSA9PiB0aGlzLm9uU2Vla2luZyhwZXJjZW50YWdlLCB0aGlzLndlYlBsYXllckVsKSxcclxuICAgICAgICAocGVyY2VudGFnZSwgc2F2ZSkgPT4gdGhpcy5zZXRWb2x1bWUocGVyY2VudGFnZSwgdGhpcy5wbGF5ZXIsIHNhdmUpLFxyXG4gICAgICAgIHBhcnNlRmxvYXQobG9hZGVkVm9sdW1lKVxyXG4gICAgICApXHJcbiAgICAgIHRoaXMucGxheWVySXNSZWFkeSA9IHRydWVcclxuICAgIH0pXHJcblxyXG4gICAgLy8gTm90IFJlYWR5XHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignbm90X3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnRGV2aWNlIElEIGhhcyBnb25lIG9mZmxpbmUnLCBkZXZpY2VfaWQpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldER1cmF0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gdHJ1ZVxyXG4gICAgICB0aGlzLnBsYXllci5zZWVrKDApLnRoZW4oKCkgPT4geyB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2UgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIHBhdXNlIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUgZnJvbSB0aGUgd2ViIHBsYXllci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVdlYlBsYXllclBhdXNlIChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHRoZSBmaXJzdCBub2RlIG9yIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nXHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gJiYgY3Vyck5vZGUgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgcHJldlRyYWNrID0gY3Vyck5vZGUuZGF0YVxyXG4gICAgICBjb25zb2xlLmxvZygnVHJ5IHBsYXllciBwYXVzZScpXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgY3Vyck5vZGUsIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmllcyB0byBwbGF5IHRoZSBwcmV2aW91cyBJUGxheWFibGUgZ2l2ZW4gdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVBsYXlQcmV2IChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIGlmIChjdXJyTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAvLyAoaWYgdGhlIHBsYXllciBoYXMganVzdCBiZWVuIHB1dCBpbnRvIHNodWZmbGUgbW9kZSB0aGVuIHRoZXJlIHNob3VsZCBiZSBubyBwcmV2aW91cyBwbGF5YWJsZXMgdG8gZ28gYmFjayB0b28pXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChwbGF5ZXJQdWJsaWNWYXJzLmlzTG9vcCkge1xyXG4gICAgICB0aGlzLnJlc2V0RHVyYXRpb24oKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBhbiBhY3Rpb24gaXMgcHJvY2Vzc2luZyB3ZSBjYW5ub3QgZG8gYW55dGhpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICB0aGlzLnBsYXllci5nZXRDdXJyZW50U3RhdGUoKS50aGVuKChzdGF0ZTogeyBwb3NpdGlvbjogYW55IH0pID0+IHtcclxuICAgICAgICBpZiAoc3RhdGUucG9zaXRpb24gPiAxMDAwKSB7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0RHVyYXRpb24oKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBpZiB0aGUgcGxheWVyIElTIGluIHNodWZmbGUgbW9kZVxyXG4gICAgICAgICAgaWYgKHBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlICYmICF0aGlzLndhc0luU2h1ZmZsZSkgeyByZXR1cm4gfVxyXG4gICAgICAgICAgbGV0IHByZXZUcmFja05vZGUgPSBjdXJyTm9kZS5wcmV2aW91c1xyXG5cclxuICAgICAgICAgIC8vIGlmIHRoZSBwbGF5ZXIgV0FTIGluIHNodWZmbGUgbW9kZVxyXG4gICAgICAgICAgaWYgKCFwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSAmJiB0aGlzLndhc0luU2h1ZmZsZSkge1xyXG4gICAgICAgICAgICBwcmV2VHJhY2tOb2RlID0gdGhpcy51blNodWZmbGUoLTEpXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHByZXZUcmFja05vZGUgPT09IG51bGwpIHsgcmV0dXJuIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBwcmV2VHJhY2sgPSBwcmV2VHJhY2tOb2RlLmRhdGFcclxuICAgICAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgcHJldlRyYWNrTm9kZSwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmllcyB0byBwbGF5IHRoZSBuZXh0IElQbGF5YWJsZSBnaXZlbiB0aGUgY3VycmVudCBwbGF5aW5nIElQbGF5YWJsZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5UGxheU5leHQgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgaWYgKGN1cnJOb2RlID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgaWYgKHBsYXllclB1YmxpY1ZhcnMuaXNMb29wKSB7XHJcbiAgICAgIHRoaXMuc3RhcnRUcmFjayhhc3luYyAoKSA9PiB0aGlzLnBsYXkoY3Vyck5vZGUuZGF0YS51cmkpLCBuZXcgUGxheWFibGVFdmVudEFyZyhjdXJyTm9kZS5kYXRhLCBjdXJyTm9kZSwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKSwgdHJ1ZSlcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICAvLyBjaGVjayB0byBzZWUgaWYgYW4gYWN0aW9uIGlzIHByb2Nlc3NpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICBsZXQgbmV4dFRyYWNrTm9kZSA9IGN1cnJOb2RlLm5leHRcclxuXHJcbiAgICAgIGlmICghdGhpcy53YXNJblNodWZmbGUgJiYgcGxheWVyUHVibGljVmFycy5pc1NodWZmbGUpIHtcclxuICAgICAgICAvLyBieSBjYWxsaW5nIHRoaXMgYmVmb3JlIGFzc2lnbmluZyB0aGUgbmV4dCBub2RlLCB0aGlzLnNodWZmbGVQbGF5YWJsZXMoKSBtdXN0IHJldHVybiBiYWNrIHRoZSBuZXh0IG5vZGVcclxuICAgICAgICBuZXh0VHJhY2tOb2RlID0gdGhpcy5zaHVmZmxlUGxheWFibGVzKClcclxuXHJcbiAgICAgICAgLy8gY2FsbCBhZnRlciB0byBlbnN1cmUgdGhhdCB0aGlzLnNodWZmbGVQbGF5YWJsZXMoKSBydW5zIHRoZSBpZiBzdGF0ZW1lbnQgdGhhdCByZXR1cm5zIHRoZSBuZXh0IG5vZGVcclxuICAgICAgICB0aGlzLndhc0luU2h1ZmZsZSA9IHRydWVcclxuICAgICAgfSBlbHNlIGlmICghcGxheWVyUHVibGljVmFycy5pc1NodWZmbGUgJiYgdGhpcy53YXNJblNodWZmbGUpIHtcclxuICAgICAgICBuZXh0VHJhY2tOb2RlID0gdGhpcy51blNodWZmbGUoMSlcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgc2h1ZmZsZSBpcyBub3Qgb25lIGFuZCB0aGlzIG5vZGUgaXMgbnVsbCwgdGhlbiB3ZSBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgcGxheWxpc3QgYW5kIGNhbm5vdCBwbGF5IG5leHQuXHJcbiAgICAgIGlmIChuZXh0VHJhY2tOb2RlID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKG5leHRUcmFja05vZGUuZGF0YSwgbmV4dFRyYWNrTm9kZSwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29tcGxldGVseURlc2VsZWN0VHJhY2sgKCkge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VsZWN0ZWQgcGxheWluZyBlbGVtZW50IHdhcyBudWxsIGJlZm9yZSBkZXNlbGVjdGlvbiBvbiBzb25nIGZpbmlzaCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnBhdXNlRGVzZWxlY3RUcmFjaygpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID0gJydcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGF1c2VEZXNlbGVjdFRyYWNrICgpIHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCB3YXMgbnVsbCBiZWZvcmUgZGVzZWxlY3Rpb24gb24gc29uZyBmaW5pc2gnKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGU/LmRhdGEub25TdG9wcGVkKClcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5wbGF5UGF1c2U/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBudWxsXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNlbGVjdFRyYWNrIChldmVudEFyZzogUGxheWFibGVFdmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXI6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSBldmVudEFyZy5wbGF5YWJsZU5vZGVcclxuICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFyciA9IGV2ZW50QXJnLnBsYXlhYmxlQXJyXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbFxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaVxyXG5cclxuICAgIHRoaXMud2ViUGxheWVyRWwucGxheVBhdXNlPy5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMud2ViUGxheWVyRWwuc2V0VGl0bGUoZXZlbnRBcmcuY3VyclBsYXlhYmxlLnRpdGxlKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5zZXRJbWdTcmMoZXZlbnRBcmcuY3VyclBsYXlhYmxlLmltYWdlVXJsKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5zZXRBcnRpc3RzKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5hcnRpc3RzSHRtbClcclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlPy5kYXRhLm9uUGxheWluZygpXHJcblxyXG4gICAgLy8gd2UgY2FuIGNhbGwgYWZ0ZXIgYXNzaWduaW5nIHBsYXlhYmxlIG5vZGUgYXMgaXQgZG9lcyBub3QgY2hhbmdlIHdoaWNoIG5vZGUgaXMgcGxheWVkXHJcbiAgICBpZiAoIXBsYXlUaHJ1V2ViUGxheWVyICYmIHBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlKSB7XHJcbiAgICAgIHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpXHJcbiAgICB9IGVsc2UgaWYgKCFwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSAmJiB0aGlzLndhc0luU2h1ZmZsZSkge1xyXG4gICAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlID0gdGhpcy51blNodWZmbGUoMClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25UcmFja0ZpbmlzaCAoKSB7XHJcbiAgICB0aGlzLmNvbXBsZXRlbHlEZXNlbGVjdFRyYWNrKClcclxuXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCBhcyBOb2RlSlMuVGltZW91dClcclxuICAgIHRoaXMudHJ5UGxheU5leHQodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgYW4gaW50ZXJ2YWwgdGhhdCBvYnRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgcGxheWVyIGV2ZXJ5IHNlY29uZC5cclxuICAgKiBTaG91bGQgb25seSBiZSBjYWxsZWQgd2hlbiBhIHNvbmcgaXMgcGxheWluZy5cclxuICAgKi9cclxuICBwcml2YXRlIHNldEdldFN0YXRlSW50ZXJ2YWwgKCkge1xyXG4gICAgbGV0IGR1cmF0aW9uTWluU2VjID0gJydcclxuICAgIGlmICh0aGlzLmdldFN0YXRlSW50ZXJ2YWwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwpXHJcbiAgICB9XHJcbiAgICAvLyBzZXQgdGhlIGludGVydmFsIHRvIHJ1biBldmVyeSBzZWNvbmQgYW5kIG9idGFpbiB0aGUgc3RhdGVcclxuICAgIHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCkudGhlbigoc3RhdGU6IHsgcG9zaXRpb246IGFueTsgZHVyYXRpb246IGFueSB9KSA9PiB7XHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgJ1VzZXIgaXMgbm90IHBsYXlpbmcgbXVzaWMgdGhyb3VnaCB0aGUgV2ViIFBsYXliYWNrIFNESydcclxuICAgICAgICAgIClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB7IHBvc2l0aW9uLCBkdXJhdGlvbiB9ID0gc3RhdGVcclxuXHJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXNudCBhIGR1cmF0aW9uIHNldCBmb3IgdGhpcyBzb25nIHNldCBpdC5cclxuICAgICAgICBpZiAoZHVyYXRpb25NaW5TZWMgPT09ICcnKSB7XHJcbiAgICAgICAgICBkdXJhdGlvbk1pblNlYyA9IG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMoZHVyYXRpb24pXHJcbiAgICAgICAgICB0aGlzLndlYlBsYXllckVsIS5kdXJhdGlvbiEudGV4dENvbnRlbnQgPSBkdXJhdGlvbk1pblNlY1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGVyY2VudERvbmUgPSAocG9zaXRpb24gLyBkdXJhdGlvbikgKiAxMDBcclxuXHJcbiAgICAgICAgLy8gdGhlIHBvc2l0aW9uIGdldHMgc2V0IHRvIDAgd2hlbiB0aGUgc29uZyBpcyBmaW5pc2hlZFxyXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMCkge1xyXG4gICAgICAgICAgdGhpcy5vblRyYWNrRmluaXNoKClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gaWYgdGhlIHBvc2l0aW9uIGlzbnQgMCB1cGRhdGUgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudHNcclxuICAgICAgICAgIHRoaXMud2ViUGxheWVyRWwudXBkYXRlRWxlbWVudChwZXJjZW50RG9uZSwgcG9zaXRpb24pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSwgNTAwKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VsZWN0IGEgY2VydGFpbiBwbGF5L3BhdXNlIGVsZW1lbnQgYW5kIHBsYXkgdGhlIGdpdmVuIHRyYWNrIHVyaVxyXG4gICAqIGFuZCB1bnNlbGVjdCB0aGUgcHJldmlvdXMgb25lIHRoZW4gcGF1c2UgdGhlIHByZXZpb3VzIHRyYWNrX3VyaS5cclxuICAgKlxyXG4gICAqIFRoZSByZWFzc2lnbmluZyBvZiBlbGVtZW50cyBpcyBpbiB0aGUgY2FzZSB0aGF0IHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHRocm91Z2ggdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCxcclxuICAgKiBhcyB0aGVyZSBpcyBhIGNoYW5jZSB0aGF0IHRoZSBzZWxlY3RlZCBwbGF5aW5nIGVsZW1lbnQgaXMgZWl0aGVyIG5vbi1leGlzdGVudCwgb3IgaXMgZGlmZmVyZW50IHRoZW4gdGhlblxyXG4gICAqIHRoZSBwcmV2aW91cyBpLmUuIHJlcmVuZGVyZWQsIG9yIGhhcyBhbiBlcXVpdmFsZW50IGVsZW1lbnQgd2hlbiBvbiBmb3IgZXhhbXBsZSBhIGRpZmZlcmVudCB0ZXJtIHRhYi5cclxuICAgKlxyXG4gICAqIFJlYXNzaWduaW5nIGlzIGRvbmUgc28gdGhhdCB0aGUgcG90ZW50aWFsbHkgZGlmZmVyZW50IGVxdWl2YWxlbnQgZWxlbWVudCBjYW4gYWN0IGFzIHRoZSBpbml0aWFsbHlcclxuICAgKiBzZWxlY3RlZCBlbGVtZW50LCBpbiBzaG93aW5nIHBhdXNlL3BsYXkgc3ltYm9scyBpbiBhY2NvcmRhbmNlIHRvIHdoZXRoZXIgdGhlXHJcbiAgICogc29uZyB3YXMgcGF1c2VkL3BsYXllZCB0aHJvdWdoIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQbGF5YWJsZUV2ZW50QXJnfSBldmVudEFyZyAtIGEgY2xhc3MgdGhhdCBjb250YWlucyB0aGUgY3VycmVudCwgbmV4dCBhbmQgcHJldmlvdXMgdHJhY2tzIHRvIHBsYXlcclxuICAgKi9cclxuICBwdWJsaWMgYXN5bmMgc2V0U2VsUGxheWluZ0VsIChldmVudEFyZzogUGxheWFibGVFdmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIgPSB0cnVlKSB7XHJcbiAgICAvLyBpZiB0aGUgcGxheWVyIGlzbid0IHJlYWR5IHdlIGNhbm5vdCBjb250aW51ZS5cclxuICAgIGlmICghdGhpcy5wbGF5ZXJJc1JlYWR5KSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdwbGF5ZXIgaXMgbm90IHJlYWR5JylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSB0cnVlXHJcblxyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ICE9IG51bGwpIHtcclxuICAgICAgLy8gc3RvcCB0aGUgcHJldmlvdXMgdHJhY2sgdGhhdCB3YXMgcGxheWluZ1xyXG4gICAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlPy5kYXRhLm9uU3RvcHBlZCgpXHJcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsIGFzIE5vZGVKUy5UaW1lb3V0KVxyXG5cclxuICAgICAgLy8gcmVhc3NpZ24gdGhlIGVsZW1lbnQgaWYgaXQgZXhpc3RzIGFzIGl0IG1heSBoYXZlIGJlZW4gcmVyZW5kZXJlZCBhbmQgdGhlcmVmb3JlIHRoZSBwcmV2aW91cyB2YWx1ZSBpcyBwb2ludGluZyB0byBub3RoaW5nXHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuaWQpID8/IHRoaXMuc2VsUGxheWluZy5lbGVtZW50XHJcblxyXG4gICAgICAvLyBpZiBpdHMgdGhlIHNhbWUgZWxlbWVudCB0aGVuIHBhdXNlXHJcbiAgICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5pZCA9PT0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsLmlkKSB7XHJcbiAgICAgICAgdGhpcy5wYXVzZURlc2VsZWN0VHJhY2soKVxyXG4gICAgICAgIGF3YWl0IHRoaXMucGF1c2UoKVxyXG4gICAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSBjb21wbGV0ZWx5IGRlc2VsZWN0IHRoZSBjdXJyZW50IHRyYWNrIGJlZm9yZSBzZWxlY3RpbmcgYW5vdGhlciBvbmUgdG8gcGxheVxyXG4gICAgICAgIHRoaXMuY29tcGxldGVseURlc2VsZWN0VHJhY2soKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJldiB0cmFjayB1cmkgaXMgdGhlIHNhbWUgdGhlbiByZXN1bWUgdGhlIHNvbmcgaW5zdGVhZCBvZiByZXBsYXlpbmcgaXQuXHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9PT0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaSkge1xyXG4gICAgICAvLyB0aGlzIHNlbEVsIGNvdWxkIGNvcnJvc3BvbmQgdG8gdGhlIHNhbWUgc29uZyBidXQgaXMgYW4gZWxlbWVudCB0aGF0IGlzIG5vbi1leGlzdGVudCwgc28gcmVhc3NpZ24gaXQgdG8gYSBlcXVpdmFsZW50IGV4aXN0aW5nIGVsZW1lbnQgaWYgdGhpcyBpcyB0aGUgY2FzZS5cclxuICAgICAgZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsLmlkKSA/PyBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWxcclxuXHJcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRUcmFjayhhc3luYyAoKSA9PiB0aGlzLnJlc3VtZSgpLCBldmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIpXHJcbiAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZygnc3RhcnQgdHJhY2snKVxyXG4gICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucGxheShldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSwgZXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyKVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHN0YXJ0VHJhY2sgKHBsYXlpbmdBc3luY0Z1bmM6IEZ1bmN0aW9uLCBldmVudEFyZzogUGxheWFibGVFdmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXI6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuc2VsZWN0VHJhY2soZXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyKVxyXG5cclxuICAgIGF3YWl0IHBsYXlpbmdBc3luY0Z1bmMoKVxyXG5cclxuICAgIC8vIHNldCBwbGF5aW5nIHN0YXRlIG9uY2Ugc29uZyBzdGFydHMgcGxheWluZ1xyXG4gICAgdGhpcy5zZXRHZXRTdGF0ZUludGVydmFsKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNodWZmbGVzIHRoZSBwbGF5YWJsZXMgYW5kIGVpdGhlciByZXR1cm5zIHRoZSBjdXJyZW50IG5vZGUgb3IgdGhlIG5leHQgbm9kZSB0aGF0IGJvdGggcG9pbnQgdG8gYSBzaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+fSBlaXRoZXIgdGhlIG5leHQgb3IgY3VycmVudCBub2RlIGluIHRoZSBzaHVmZmxlZCBsaXN0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2h1ZmZsZVBsYXlhYmxlcyAoKTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyID09IG51bGwgfHwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ25vIHNlbCBwbGF5aW5nJylcclxuICAgIGNvbnNvbGUubG9nKCdzaHVmZmxlJylcclxuICAgIGNvbnN0IHNlbFBsYXlhYmxlID0gdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZS5kYXRhXHJcblxyXG4gICAgLy8gc2h1ZmZsZSBhcnJheVxyXG4gICAgY29uc3QgdHJhY2tBcnIgPSBzaHVmZmxlKHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycilcclxuXHJcbiAgICAvLyByZW1vdmUgdGhpcyB0cmFjayBmcm9tIHRoZSBhcnJheVxyXG4gICAgY29uc3QgaW5kZXggPSB0cmFja0Fyci5pbmRleE9mKHNlbFBsYXlhYmxlKVxyXG4gICAgdHJhY2tBcnIuc3BsaWNlKGluZGV4LCAxKVxyXG5cclxuICAgIC8vIGdlbmVyYXRlIGEgZG91Ymx5IGxpbmtlZCBsaXN0XHJcbiAgICBjb25zdCBzaHVmZmxlZExpc3QgPSBhcnJheVRvRG91Ymx5TGlua2VkTGlzdCh0cmFja0FycilcclxuXHJcbiAgICAvLyBwbGFjZSB0aGlzIHRyYWNrIGF0IHRoZSBmcm9udCBvZiB0aGUgbGlzdFxyXG4gICAgc2h1ZmZsZWRMaXN0Lmluc2VydEJlZm9yZShzZWxQbGF5YWJsZSwgMClcclxuXHJcbiAgICBsZXQgbmV3Tm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgaWYgKCF0aGlzLndhc0luU2h1ZmZsZSkge1xyXG4gICAgICAvLyBnZXQgdGhlIG5leHQgbm9kZSBhcyB0aGlzIHNob3VsZCBydW4gYmVmb3JlIHRoZSBuZXh0IG5vZGUgaXMgY2hvc2VuLlxyXG4gICAgICBuZXdOb2RlID0gc2h1ZmZsZWRMaXN0LmdldCgxLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBnZXQgdGhlIG5ldyBub2RlIHdoaWNoIGhhcyBpZGVudGljYWwgZGF0YSBhcyB0aGUgb2xkIG9uZSwgYnV0IGlzIG5vdyBwYXJ0IG9mIHRoZSBzaHVmZmxlZCBkb3VibHkgbGlua2VkIGxpc3RcclxuICAgICAgbmV3Tm9kZSA9IHNodWZmbGVkTGlzdC5nZXQoMCwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlID0gbmV3Tm9kZVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVuc2h1ZmZsZXMgdGhlIHBsYXlhYmxlcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGlyIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgaW5kZXggdG8gYWRkIG9yIHJlbW92ZSBmcm9tIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBwbGF5aW5nIG5vZGUuICgxOiBnZXRzTmV4dCwgLTE6IGdldHNQcmV2LCAwOiBnZXRzQ3VycmVudClcclxuICAgKiBAcmV0dXJucyB7RG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPn0gdGhlIG5vZGUgdGhhdCBwb2ludHMgdG8gdGhlIHVuc2h1ZmZsZWQgdmVyc2lvbiBvZiB0aGUgbGlzdC4gRWl0aGVyIHRoZSBwcmV2aW91cywgY3VycmVudCwgb3IgbmV4dCBub2RlIGZyb20gdGhlIGN1cnJlbnQgcGxheWFibGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1blNodWZmbGUgKGRpcjogbnVtYmVyKTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFyciA9PSBudWxsIHx8IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdubyBzZWwgcGxheWluZycpXHJcbiAgICBjb25zdCBzZWxQbGF5YWJsZSA9IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUuZGF0YVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCd1bnNodWZmbGUnKVxyXG4gICAgdGhpcy53YXNJblNodWZmbGUgPSBmYWxzZVxyXG4gICAgLy8gb2J0YWluIGFuIHVuc2h1ZmZsZWQgbGlua2VkIGxpc3RcclxuICAgIGNvbnN0IHBsYXlhYmxlTGlzdCA9IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0KHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycilcclxuXHJcbiAgICBjb25zdCBuZXdOb2RlSWR4ID0gcGxheWFibGVMaXN0LmZpbmRJbmRleCgocGxheWFibGUpID0+IHBsYXlhYmxlLnNlbEVsLmlkID09PSBzZWxQbGF5YWJsZS5zZWxFbC5pZClcclxuXHJcbiAgICBsZXQgbmV3Tm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwgPSBudWxsXHJcbiAgICBpZiAocGxheWFibGVMaXN0LnNpemUgPiBuZXdOb2RlSWR4ICsgZGlyICYmIG5ld05vZGVJZHggKyBkaXIgPj0gMCkge1xyXG4gICAgICBuZXdOb2RlID0gcGxheWFibGVMaXN0LmdldChuZXdOb2RlSWR4ICsgZGlyLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGxheXMgYSB0cmFjayB0aHJvdWdoIHRoaXMgZGV2aWNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRyYWNrX3VyaSAtIHRoZSB0cmFjayB1cmkgdG8gcGxheVxyXG4gICAqIEByZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB0cmFjayBoYXMgYmVlbiBwbGF5ZWQgc3VjY2VzZnVsbHkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwbGF5ICh0cmFja191cmk6IHN0cmluZykge1xyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRQbGF5VHJhY2sodGhpcy5kZXZpY2VfaWQsIHRyYWNrX3VyaSkpXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHJlc3VtZSAoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnBsYXllci5yZXN1bWUoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBwYXVzZSAoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnBsYXllci5wYXVzZSgpXHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBzcG90aWZ5UGxheWJhY2sgPSBuZXcgU3BvdGlmeVBsYXliYWNrKClcclxuXHJcbmlmICgod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yID09PSB1bmRlZmluZWQpIHtcclxuICAvLyBjcmVhdGUgYSBnbG9iYWwgdmFyaWFibGUgdG8gYmUgdXNlZFxyXG4gICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgPSBuZXcgRXZlbnRBZ2dyZWdhdG9yKClcclxufVxyXG5jb25zdCBldmVudEFnZ3JlZ2F0b3IgPSAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yIGFzIEV2ZW50QWdncmVnYXRvclxyXG5cclxuLy8gc3Vic2NyaWJlIHRoZSBzZXRQbGF5aW5nIGVsZW1lbnQgZXZlbnRcclxuZXZlbnRBZ2dyZWdhdG9yLnN1YnNjcmliZShQbGF5YWJsZUV2ZW50QXJnLm5hbWUsIChldmVudEFyZzogUGxheWFibGVFdmVudEFyZykgPT5cclxuICBzcG90aWZ5UGxheWJhY2suc2V0U2VsUGxheWluZ0VsKGV2ZW50QXJnLCBmYWxzZSlcclxuKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwgKHVyaTogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIChcclxuICAgIHVyaSA9PT0gc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcudHJhY2tfdXJpICYmXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ICE9IG51bGxcclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1NhbWVQbGF5aW5nVVJJICh1cmk6IHN0cmluZykge1xyXG4gIHJldHVybiB1cmkgPT09IHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnRyYWNrX3VyaVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlciAodXJpOiBzdHJpbmcsIHNlbEVsOiBFbGVtZW50LCB0cmFja0RhdGFOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+KSB7XHJcbiAgaWYgKGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodXJpKSkge1xyXG4gICAgLy8gVGhpcyBlbGVtZW50IHdhcyBwbGF5aW5nIGJlZm9yZSByZXJlbmRlcmluZyBzbyBzZXQgaXQgdG8gYmUgdGhlIGN1cnJlbnRseSBwbGF5aW5nIG9uZSBhZ2FpblxyXG4gICAgc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcuZWxlbWVudCA9IHNlbEVsXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSB0cmFja0RhdGFOb2RlXHJcbiAgfVxyXG59XHJcblxyXG4vLyBhcHBlbmQgYW4gaW52aXNpYmxlIGVsZW1lbnQgdGhlbiBkZXN0cm95IGl0IGFzIGEgd2F5IHRvIGxvYWQgdGhlIHBsYXkgYW5kIHBhdXNlIGltYWdlcyBmcm9tIGV4cHJlc3MuXHJcbmNvbnN0IHByZWxvYWRQbGF5UGF1c2VJbWdzSHRtbCA9IGA8ZGl2IHN0eWxlPVwiZGlzcGxheTogbm9uZVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGxheUljb259XCIvPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGF1c2VJY29ufVwiLz48L2Rpdj5gXHJcbmNvbnN0IHByZWxvYWRQbGF5UGF1c2VJbWdzRWwgPSBodG1sVG9FbChwcmVsb2FkUGxheVBhdXNlSW1nc0h0bWwpIGFzIE5vZGVcclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwcmVsb2FkUGxheVBhdXNlSW1nc0VsKVxyXG5kb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHByZWxvYWRQbGF5UGF1c2VJbWdzRWwpXHJcbiIsImltcG9ydCBTdWJzY3JpcHRpb24gZnJvbSAnLi9zdWJzY3JpcHRpb24nXHJcblxyXG4vKiogTGV0cyBzYXkgeW91IGhhdmUgdHdvIGRvb3JzIHRoYXQgd2lsbCBvcGVuIHRocm91Z2ggdGhlIHB1YiBzdWIgc3lzdGVtLiBXaGF0IHdpbGwgaGFwcGVuIGlzIHRoYXQgd2Ugd2lsbCBzdWJzY3JpYmUgb25lXHJcbiAqIG9uIGRvb3Igb3BlbiBldmVudC4gV2Ugd2lsbCB0aGVuIGhhdmUgdHdvIHB1Ymxpc2hlcnMgdGhhdCB3aWxsIGVhY2ggcHJvcGFnYXRlIGEgZGlmZmVyZW50IGRvb3IgdGhyb3VnaCB0aGUgYWdncmVnYXRvciBhdCBkaWZmZXJlbnQgcG9pbnRzLlxyXG4gKiBUaGUgYWdncmVnYXRvciB3aWxsIHRoZW4gZXhlY3V0ZSB0aGUgb24gZG9vciBvcGVuIHN1YnNjcmliZXIgYW5kIHBhc3MgaW4gdGhlIGRvb3IgZ2l2ZW4gYnkgZWl0aGVyIHB1Ymxpc2hlci5cclxuICovXHJcblxyXG4vKiogTWFuYWdlcyBzdWJzY3JpYmluZyBhbmQgcHVibGlzaGluZyBvZiBldmVudHMuXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogQW4gYXJnVHlwZSBpcyBvYnRhaW5lZCBieSB0YWtpbmcgdGhlICdDbGFzc0luc3RhbmNlJy5jb250cnVjdG9yLm5hbWUgb3IgJ0NsYXNzJy5uYW1lLlxyXG4gKiBTdWJzY3JpcHRpb25zIGFyZSBncm91cGVkIHRvZ2V0aGVyIGJ5IGFyZ1R5cGUgYW5kIHRoZWlyIGV2dCB0YWtlcyBhbiBhcmd1bWVudCB0aGF0IGlzIGFcclxuICogY2xhc3Mgd2l0aCB0aGUgY29uc3RydWN0b3IubmFtZSBvZiBhcmdUeXBlLlxyXG4gKlxyXG4gKi9cclxuY2xhc3MgRXZlbnRBZ2dyZWdhdG9yIHtcclxuICBzdWJzY3JpYmVyczogeyBba2V5OiBzdHJpbmddOiBBcnJheTxTdWJzY3JpcHRpb24+IH07XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgLy8ga2V5IC0gdHlwZSwgdmFsdWUgLSBbXSBvZiBmdW5jdGlvbnMgdGhhdCB0YWtlIGEgY2VydGFpbiB2YWx1ZSBkZXBlbmRpbmcgb24gdGhlIHR5cGVcclxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fVxyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZXMgYSB0eXBlIG9mIGV2ZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFyZ1R5cGUgLSB0aGUgdHlwZSB0aGF0IHRoaXMgc3Vic2NyaWJlciBiZWxvbmdzIHRvby5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBldmVudCAtIHRoZSBldmVudCB0aGF0IHRha2VzIHRoZSBzYW1lIGFyZ3MgYXMgYWxsIG90aGVyIGV2ZW50cyBvZiB0aGUgZ2l2ZW4gdHlwZS5cclxuICAgKi9cclxuICBzdWJzY3JpYmUgKGFyZ1R5cGU6IHN0cmluZywgZXZ0OiBGdW5jdGlvbikge1xyXG4gICAgY29uc3Qgc3Vic2NyaWJlciA9IG5ldyBTdWJzY3JpcHRpb24odGhpcywgZXZ0LCBhcmdUeXBlKVxyXG5cclxuICAgIGlmIChhcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXS5wdXNoKHN1YnNjcmliZXIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdID0gW3N1YnNjcmliZXJdXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVW5zdWJzY3JpYmVzIGEgZ2l2ZW4gc3Vic2NyaXB0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdWJzY3JpcHRpb259IHN1YnNjcmlwdGlvblxyXG4gICAqL1xyXG4gIHVuc3Vic2NyaWJlIChzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbikge1xyXG4gICAgaWYgKHN1YnNjcmlwdGlvbi5hcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgLy8gZmlsdGVyIG91dCB0aGUgc3Vic2NyaXB0aW9uIGdpdmVuIGZyb20gdGhlIHN1YnNjcmliZXJzIGRpY3Rpb25hcnlcclxuICAgICAgY29uc3QgZmlsdGVyZWQgPSB0aGlzLnN1YnNjcmliZXJzW3N1YnNjcmlwdGlvbi5hcmdUeXBlXS5maWx0ZXIoZnVuY3Rpb24gKHN1Yikge1xyXG4gICAgICAgIHJldHVybiBzdWIuaWQgIT09IHN1YnNjcmlwdGlvbi5pZFxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1tzdWJzY3JpcHRpb24uYXJnVHlwZV0gPSBmaWx0ZXJlZFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2hlcyBhbGwgc3Vic2NyaWJlcnMgdGhhdCB0YWtlIGFyZ3VtZW50cyBvZiBhIGdpdmVuIHR5cGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gYXJncyAtIGEgY2xhc3MgdGhhdCBjb250YWlucyBhcmd1bWVudHMgZm9yIHRoZSBldmVudC4gTXVzdCBiZSBhIGNsYXNzIGFzIHN1YnNjcmliZXJzIGFyZSBncm91cGVkIGJ5IHR5cGUuXHJcbiAgICovXHJcbiAgcHVibGlzaCAoYXJnczogT2JqZWN0KSB7XHJcbiAgICBjb25zdCBhcmdUeXBlID0gYXJncy5jb25zdHJ1Y3Rvci5uYW1lXHJcblxyXG4gICAgaWYgKGFyZ1R5cGUgaW4gdGhpcy5zdWJzY3JpYmVycykge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4ge1xyXG4gICAgICAgIHN1YnNjcmlwdGlvbi5ldnQoYXJncylcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ25vIHR5cGUgZm91bmQgZm9yIHB1Ymxpc2hpbmcnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xlYXJTdWJzY3JpcHRpb25zICgpIHtcclxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRBZ2dyZWdhdG9yXHJcbiIsImltcG9ydCB7IElQbGF5YWJsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgeyBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4uLy4uL2RvdWJseS1saW5rZWQtbGlzdCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXlhYmxlRXZlbnRBcmcge1xyXG4gIGN1cnJQbGF5YWJsZTogSVBsYXlhYmxlO1xyXG4gIHBsYXlhYmxlTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gIHBsYXlhYmxlQXJyOiBBcnJheTxJUGxheWFibGU+IHwgbnVsbFxyXG5cclxuICAvKiogVGFrZXMgaW4gdGhlIGN1cnJlbnQgdHJhY2sgdG8gcGxheSBhcyB3ZWxsIGFzIHRoZSBwcmV2IHRyYWNrcyBhbmQgbmV4dCB0cmFja3MgZnJvbSBpdC5cclxuICAgKiBOb3RlIHRoYXQgaXQgZG9lcyBub3QgdGFrZSBUcmFjayBpbnN0YW5jZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0lQbGF5YWJsZX0gY3VyclRyYWNrIC0gb2JqZWN0IGNvbnRhaW5pbmcgZWxlbWVudCB0byBzZWxlY3QsIHRyYWNrX3VyaSwgYW5kIHRyYWNrIHRpdGxlLlxyXG4gICAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPn0gdHJhY2tOb2RlIC0gbm9kZSB0aGF0IGFsbG93cyB1cyB0byB0cmF2ZXJzZSB0byBuZXh0IGFuZCBwcmV2aW91cyB0cmFjayBkYXRhcy5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciAoY3VyclRyYWNrOiBJUGxheWFibGUsIHRyYWNrTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiwgcGxheWFibGVBcnI6IEFycmF5PElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICB0aGlzLmN1cnJQbGF5YWJsZSA9IGN1cnJUcmFja1xyXG4gICAgdGhpcy5wbGF5YWJsZU5vZGUgPSB0cmFja05vZGVcclxuICAgIHRoaXMucGxheWFibGVBcnIgPSBwbGF5YWJsZUFyclxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vYWdncmVnYXRvcidcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1YnNjcmlwdGlvbiB7XHJcbiAgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3I7XHJcbiAgZXZ0OiBGdW5jdGlvbjtcclxuICBhcmdUeXBlOiBzdHJpbmc7XHJcbiAgaWQ6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yLCBldnQ6IEZ1bmN0aW9uLCBhcmdUeXBlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yID0gZXZlbnRBZ2dyZWdhdG9yXHJcbiAgICB0aGlzLmV2dCA9IGV2dFxyXG4gICAgdGhpcy5hcmdUeXBlID0gYXJnVHlwZVxyXG4gICAgdGhpcy5pZCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBheGlvcywgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnXHJcbmltcG9ydCB7IGNvbmZpZywgcHJvbWlzZUhhbmRsZXIgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCBTZWxlY3RhYmxlVGFiRWxzIGZyb20gJy4vU2VsZWN0YWJsZVRhYkVscydcclxuXHJcbmV4cG9ydCBlbnVtIFRFUk1TIHtcclxuICAgIFNIT1JUX1RFUk0gPSAnc2hvcnRfdGVybScsXHJcbiAgICBNSURfVEVSTSA9ICdtZWRpdW1fdGVybScsXHJcbiAgICBMT05HX1RFUk0gPSAnbG9uZ190ZXJtJ1xyXG59XHJcblxyXG5leHBvcnQgZW51bSBURVJNX1RZUEUge1xyXG4gICAgQVJUSVNUUyA9ICdhcnRpc3RzJyxcclxuICAgIFRSQUNLUyA9ICd0cmFja3MnXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmVUZXJtICh2YWw6IHN0cmluZykgOiBURVJNUyB7XHJcbiAgc3dpdGNoICh2YWwpIHtcclxuICAgIGNhc2UgVEVSTVMuU0hPUlRfVEVSTTpcclxuICAgICAgcmV0dXJuIFRFUk1TLlNIT1JUX1RFUk1cclxuICAgIGNhc2UgVEVSTVMuTUlEX1RFUk06XHJcbiAgICAgIHJldHVybiBURVJNUy5NSURfVEVSTVxyXG4gICAgY2FzZSBURVJNUy5MT05HX1RFUk06XHJcbiAgICAgIHJldHVybiBURVJNUy5MT05HX1RFUk1cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignTk8gQ09SUkVDVCBURVJNIFdBUyBGT1VORCcpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRlcm0gKHRlcm1UeXBlOiBURVJNX1RZUEUpIDogUHJvbWlzZTxURVJNUz4ge1xyXG4gIGNvbnN0IHsgcmVzLCBlcnIgfSA9IGF3YWl0IHByb21pc2VIYW5kbGVyPEF4aW9zUmVzcG9uc2U8c3RyaW5nIHwgbnVsbD4+KChheGlvcy5yZXF1ZXN0PHN0cmluZyB8IG51bGw+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRUZXJtKHRlcm1UeXBlKSB9KSkpXHJcbiAgaWYgKGVycikge1xyXG4gICAgcmV0dXJuIFRFUk1TLlNIT1JUX1RFUk1cclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGRldGVybWluZVRlcm0ocmVzPy5kYXRhIGFzIHN0cmluZylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlVGVybSAodGVybTogVEVSTVMsIHRlcm1UeXBlOiBURVJNX1RZUEUpIHtcclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0VGVybSh0ZXJtLCB0ZXJtVHlwZSkpKVxyXG59XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBpbmRleCB0aGF0IHBvaW50cyB0byB0aGUgdGFiIGVsZW1lbnRzXHJcbiAqIEBwYXJhbSB0ZXJtIHRoZSB0ZXJtIHJlbGF0aW5nIHRvIHRoZSB0YWIgZWxlbWVudHNcclxuICogQHJldHVybnMgdGhlIGluZGV4IHRvIGZpbmQgdGhlIHRhYiBlbGVtZW50c1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIElkeEZyb21UZXJtICh0ZXJtOiBURVJNUykge1xyXG4gIHN3aXRjaCAodGVybSkge1xyXG4gICAgY2FzZSBURVJNUy5TSE9SVF9URVJNOlxyXG4gICAgICByZXR1cm4gMFxyXG4gICAgY2FzZSBURVJNUy5NSURfVEVSTTpcclxuICAgICAgcmV0dXJuIDFcclxuICAgIGNhc2UgVEVSTVMuTE9OR19URVJNOlxyXG4gICAgICByZXR1cm4gMlxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFN0YXJ0VGVybVRhYiAodGVybTogVEVSTVMsIHRlcm1UYWI6IFNlbGVjdGFibGVUYWJFbHMsIHRhYlBhcmVudDogRWxlbWVudCkge1xyXG4gIGNvbnN0IGlkeCA9IElkeEZyb21UZXJtKHRlcm0pXHJcbiAgY29uc3QgYnRuID0gdGFiUGFyZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdidXR0b24nKVtpZHhdXHJcbiAgY29uc3QgYm9yZGVyID0gdGFiUGFyZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLmJvcmRlckNvdmVyKVtpZHhdXHJcblxyXG4gIHRlcm1UYWIuc2VsZWN0TmV3VGFiKGJ0biwgYm9yZGVyKVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIGh0bWxUb0VsLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgdGhyb3dFeHByZXNzaW9uLFxyXG4gIHJlbW92ZUFsbENoaWxkTm9kZXNcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IHBsYXllclB1YmxpY1ZhcnMgfSBmcm9tICcuL3BsYXliYWNrLXNkaydcclxuXHJcbmNsYXNzIFNsaWRlciB7XHJcbiAgcHVibGljIGRyYWc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgc2xpZGVyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIHNsaWRlclByb2dyZXNzOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgcGVyY2VudGFnZTogbnVtYmVyID0gMDtcclxuICBwdWJsaWMgbWF4OiBudW1iZXIgPSAwO1xyXG4gIHByaXZhdGUgdG9wVG9Cb3R0b206IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBvbkRyYWdTdGFydDogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBvbkRyYWdnaW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoc3RhcnRQZXJjZW50YWdlOiBudW1iZXIsIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQsIHRvcFRvQm90dG9tOiBib29sZWFuLCBvbkRyYWdTdGFydCA9ICgpID0+IHt9LCBvbkRyYWdnaW5nID0gKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4ge30sIHNsaWRlckVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgdGhpcy5vbkRyYWdTdG9wID0gb25EcmFnU3RvcFxyXG4gICAgdGhpcy5vbkRyYWdTdGFydCA9IG9uRHJhZ1N0YXJ0XHJcbiAgICB0aGlzLm9uRHJhZ2dpbmcgPSBvbkRyYWdnaW5nXHJcbiAgICB0aGlzLnRvcFRvQm90dG9tID0gdG9wVG9Cb3R0b21cclxuICAgIHRoaXMucGVyY2VudGFnZSA9IHN0YXJ0UGVyY2VudGFnZVxyXG5cclxuICAgIHRoaXMuc2xpZGVyRWwgPSBzbGlkZXJFbFxyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyA9IHNsaWRlckVsPy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzcylbMF0gYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCdObyBwcm9ncmVzcyBiYXIgZm91bmQnKVxyXG5cclxuICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgIC8vIGlmIGl0cyB0b3AgdG8gYm90dG9tIHdlIG11c3Qgcm90YXRlIHRoZSBlbGVtZW50IGR1ZSByZXZlcnNlZCBoZWlnaHQgY2hhbmdpbmdcclxuICAgICAgdGhpcy5zbGlkZXJFbCEuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZXgoMTgwZGVnKSdcclxuICAgICAgdGhpcy5zbGlkZXJFbCEuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ3RyYW5zZm9ybS1vcmlnaW46IHRvcCdcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNoYW5nZUJhckxlbmd0aCgpXHJcbiAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnYmFja2dyb3VuZC1jb2xvcicpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUJhciAobW9zUG9zVmFsOiBudW1iZXIpIHtcclxuICAgIGxldCBwb3NpdGlvblxyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgcG9zaXRpb24gPSBtb3NQb3NWYWwgLSB0aGlzLnNsaWRlckVsIS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS55XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwb3NpdGlvbiA9IG1vc1Bvc1ZhbCAtIHRoaXMuc2xpZGVyRWwhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnhcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAvLyBtaW51cyAxMDAgYmVjYXVzZSBtb2RpZnlpbmcgaGVpZ2h0IGlzIHJldmVyc2VkXHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDEwMCAtICgxMDAgKiAocG9zaXRpb24gLyB0aGlzLnNsaWRlckVsIS5jbGllbnRIZWlnaHQpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wZXJjZW50YWdlID0gMTAwICogKHBvc2l0aW9uIC8gdGhpcy5zbGlkZXJFbCEuY2xpZW50V2lkdGgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucGVyY2VudGFnZSA+IDEwMCkge1xyXG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAxMDBcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBlcmNlbnRhZ2UgPCAwKSB7XHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDBcclxuICAgIH1cclxuICAgIHRoaXMuY2hhbmdlQmFyTGVuZ3RoKClcclxuICB9O1xyXG5cclxuICBwcml2YXRlIGNoYW5nZUJhckxlbmd0aCAoKSB7XHJcbiAgICAvLyBzZXQgYmFja2dyb3VuZCBjb2xvciBvZiBhbGwgbW92aW5nIHNsaWRlcnMgcHJvZ3Jlc3MgYXMgdGhlIHNwb3RpZnkgZ3JlZW5cclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMWRiOTU0J1xyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUuaGVpZ2h0ID0gdGhpcy5wZXJjZW50YWdlICsgJyUnXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSB0aGlzLnBlcmNlbnRhZ2UgKyAnJSdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVycyAoKSB7XHJcbiAgICB0aGlzLmFkZE1vdXNlRXZlbnRzKClcclxuICAgIHRoaXMuYWRkVG91Y2hFdmVudHMoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRUb3VjaEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLnNsaWRlckVsPy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWcgPSB0cnVlXHJcbiAgICAgIGlmICh0aGlzLm9uRHJhZ1N0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdGFydCgpXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgpXHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgKGV2dCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdnaW5nKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdG9wKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICAvLyByZW1vdmUgdGhlIGlubGluZSBjc3Mgc28gdGhhdCBpdHMgb3JpZ2luYWwgYmFja2dyb3VuZCBjb2xvciByZXR1cm5zXHJcbiAgICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JhY2tncm91bmQtY29sb3InKVxyXG4gICAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZE1vdXNlRXZlbnRzICgpIHtcclxuICAgIHRoaXMuc2xpZGVyRWw/LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldnQpID0+IHtcclxuICAgICAgdGhpcy5kcmFnID0gdHJ1ZVxyXG4gICAgICBpZiAodGhpcy5vbkRyYWdTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RhcnQoKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFkpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ2dpbmcodGhpcy5wZXJjZW50YWdlKVxyXG4gICAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2xpZW50WSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RvcCh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmxpbmUgY3NzIHNvIHRoYXQgaXRzIG9yaWdpbmFsIGJhY2tncm91bmQgY29sb3IgcmV0dXJuc1xyXG4gICAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJylcclxuICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BvdGlmeVBsYXliYWNrRWxlbWVudCB7XHJcbiAgcHJpdmF0ZSB0aXRsZTogRWxlbWVudCB8IG51bGw7XHJcbiAgcHVibGljIGN1cnJUaW1lOiBFbGVtZW50IHwgbnVsbDtcclxuICBwdWJsaWMgZHVyYXRpb246IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBwbGF5UGF1c2U6IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBzb25nUHJvZ3Jlc3M6IFNsaWRlciB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgdm9sdW1lQmFyOiBTbGlkZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGxcclxuICAgIHRoaXMuY3VyclRpbWUgPSBudWxsXHJcbiAgICB0aGlzLmR1cmF0aW9uID0gbnVsbFxyXG4gICAgdGhpcy5wbGF5UGF1c2UgPSBudWxsXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0QXJ0aXN0cyAoYXJ0aXN0SHRtbDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBhcnRpc3ROYW1lRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJBcnRpc3RzKVxyXG4gICAgaWYgKGFydGlzdE5hbWVFbCkge1xyXG4gICAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdE5hbWVFbClcclxuICAgICAgYXJ0aXN0TmFtZUVsLmlubmVySFRNTCArPSBhcnRpc3RIdG1sXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0SW1nU3JjIChpbWdTcmM6IHN0cmluZykge1xyXG4gICAgY29uc3QgcGxheWVyVHJhY2tJbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5ZXJUcmFja0ltZykgYXMgSFRNTEltYWdlRWxlbWVudFxyXG4gICAgaWYgKHBsYXllclRyYWNrSW1nKSB7XHJcbiAgICAgIHBsYXllclRyYWNrSW1nLnNyYyA9IGltZ1NyY1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFRpdGxlICh0aXRsZTogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBzZXQgdGl0bGUgYmVmb3JlIGl0IGlzIGFzc2lnbmVkJylcclxuICAgIH1cclxuICAgIHRoaXMudGl0bGUhLnRleHRDb250ZW50ID0gdGl0bGVcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRUaXRsZSAoKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLnRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIHNldCB0aXRsZSBiZWZvcmUgaXQgaXMgYXNzaWduZWQnKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMudGl0bGUudGV4dENvbnRlbnQgYXMgc3RyaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmQgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCB0byB0aGUgRE9NIGFsb25nIHdpdGggdGhlIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGJ1dHRvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGxheVByZXZGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gcGF1c2VGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGF1c2UvcGxheSBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gcGxheU5leHRGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqIEBwYXJhbSBvblNlZWtTdGFydCAtIG9uIGRyYWcgc3RhcnQgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNlZWtTb25nIC0gb24gZHJhZyBlbmQgZXZlbnQgdG8gc2VlayBzb25nIGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBvblNlZWtpbmcgLSBvbiBkcmFnZ2luZyBldmVudCBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gc2V0Vm9sdW1lIC0gb24gZHJhZ2dpbmcgYW5kIG9uIGRyYWcgZW5kIGV2ZW50IGZvciB2b2x1bWUgc2xpZGVyXHJcbiAgICogQHBhcmFtIGluaXRpYWxWb2x1bWUgLSB0aGUgaW5pdGlhbCB2b2x1bWUgdG8gc2V0IHRoZSBzbGlkZXIgYXRcclxuICAgKi9cclxuICBwdWJsaWMgYXBwZW5kV2ViUGxheWVySHRtbCAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBvblNlZWtTdGFydDogKCkgPT4gdm9pZCxcclxuICAgIHNlZWtTb25nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgb25TZWVraW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgc2V0Vm9sdW1lOiAocGVyY2VudGFnZTogbnVtYmVyLCBzYXZlOiBib29sZWFuKSA9PiB2b2lkLFxyXG4gICAgaW5pdGlhbFZvbHVtZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgPGFydGljbGUgaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllcn1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0fVwiPlxyXG4gICAgICA8aW1nIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY29sdW1ufVwiIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnByb2ZpbGVVc2VyfVwiIGFsdD1cInRyYWNrXCIgaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXllclRyYWNrSW1nfVwiLz5cclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNvbHVtbn1cIiBzdHlsZT1cImZsZXgtYmFzaXM6IDMwJTsgbWF4LXdpZHRoOiAxOC41dnc7XCI+XHJcbiAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlNlbGVjdCBhIFNvbmc8L2g0PlxyXG4gICAgICAgIDxzcGFuIGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJBcnRpc3RzfVwiPjwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy53ZWJQbGF5ZXJDb250cm9sc30gJHtjb25maWcuQ1NTLkNMQVNTRVMuY29sdW1ufVwiPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8YXJ0aWNsZSBpZD1cIndlYi1wbGF5ZXItYnV0dG9uc1wiPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5zaHVmZmxlfVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMuc2h1ZmZsZUljb259XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5UHJldn1cIiBjbGFzcz1cIm5leHQtcHJldlwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGxheVByZXZ9XCIgYWx0PVwicHJldmlvdXNcIi8+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZX1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59XCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXlOZXh0fVwiIGNsYXNzPVwibmV4dC1wcmV2XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5TmV4dH1cIiBhbHQ9XCJuZXh0XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5sb29wfVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMubG9vcEljb259XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9hcnRpY2xlPlxyXG4gICAgICAgICAgPGRpdiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyVm9sdW1lfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2xpZGVyfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3N9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcn1cIj5cclxuICAgICAgICAgIDxwPjA6MDA8L3A+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzc31cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNsaWRlcn1cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnByb2dyZXNzfVwiPjwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvYXJ0aWNsZT5cclxuICAgIGBcclxuXHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGh0bWxUb0VsKGh0bWwpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh3ZWJQbGF5ZXJFbCBhcyBOb2RlKVxyXG4gICAgdGhpcy5nZXRXZWJQbGF5ZXJFbHMoXHJcbiAgICAgIG9uU2Vla1N0YXJ0LFxyXG4gICAgICBzZWVrU29uZyxcclxuICAgICAgb25TZWVraW5nLFxyXG4gICAgICBzZXRWb2x1bWUsXHJcbiAgICAgIGluaXRpYWxWb2x1bWUpXHJcbiAgICB0aGlzLmFzc2lnbkV2ZW50TGlzdGVuZXJzKFxyXG4gICAgICBwbGF5UHJldkZ1bmMsXHJcbiAgICAgIHBhdXNlRnVuYyxcclxuICAgICAgcGxheU5leHRGdW5jXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGVyY2VudERvbmUgdGhlIHBlcmNlbnQgb2YgdGhlIHNvbmcgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gdGhlIGN1cnJlbnQgcG9zaXRpb24gaW4gbXMgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlRWxlbWVudCAocGVyY2VudERvbmU6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikge1xyXG4gICAgLy8gaWYgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyIGRvbid0IGF1dG8gdXBkYXRlXHJcbiAgICBpZiAocG9zaXRpb24gIT09IDAgJiYgIXRoaXMuc29uZ1Byb2dyZXNzIS5kcmFnKSB7XHJcbiAgICAgIC8vIHJvdW5kIGVhY2ggaW50ZXJ2YWwgdG8gdGhlIG5lYXJlc3Qgc2Vjb25kIHNvIHRoYXQgdGhlIG1vdmVtZW50IG9mIHByb2dyZXNzIGJhciBpcyBieSBzZWNvbmQuXHJcbiAgICAgIHRoaXMuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50RG9uZX0lYFxyXG4gICAgICBpZiAodGhpcy5jdXJyVGltZSA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHRpbWUgZWxlbWVudCBpcyBudWxsJylcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhwb3NpdGlvbilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzIG9uY2UgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCBoYXMgYmVlbiBhcHBlbmVkZWQgdG8gdGhlIERPTS4gSW5pdGlhbGl6ZXMgU2xpZGVycy5cclxuICAgKiBAcGFyYW0gb25TZWVrU3RhcnQgLSBvbiBkcmFnIHN0YXJ0IGV2ZW50IGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBzZWVrU29uZyAtIG9uIGRyYWcgZW5kIGV2ZW50IHRvIHNlZWsgc29uZyBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gb25TZWVraW5nIC0gb24gZHJhZ2dpbmcgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNldFZvbHVtZSAtIG9uIGRyYWdnaW5nIGFuZCBvbiBkcmFnIGVuZCBldmVudCBmb3Igdm9sdW1lIHNsaWRlclxyXG4gICAqIEBwYXJhbSBpbml0aWFsVm9sdW1lIC0gdGhlIGluaXRpYWwgdm9sdW1lIHRvIHNldCB0aGUgc2xpZGVyIGF0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRXZWJQbGF5ZXJFbHMgKFxyXG4gICAgb25TZWVrU3RhcnQ6ICgpID0+IHZvaWQsXHJcbiAgICBzZWVrU29uZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIG9uU2Vla2luZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIHNldFZvbHVtZTogKHBlcmNlbnRhZ2U6IG51bWJlciwgc2F2ZTogYm9vbGVhbikgPT4gdm9pZCxcclxuICAgIGluaXRpYWxWb2x1bWU6IG51bWJlcikge1xyXG4gICAgY29uc3Qgd2ViUGxheWVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXIpID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHBsYXlUaW1lQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVRpbWVCYXIpID8/IHRocm93RXhwcmVzc2lvbigncGxheSB0aW1lIGJhciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICBjb25zdCBzb25nU2xpZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzcykgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHByb2dyZXNzIGJhciBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCB2b2x1bWVTbGlkZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclZvbHVtZSkgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHZvbHVtZSBiYXIgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICAgIHRoaXMuc29uZ1Byb2dyZXNzID0gbmV3IFNsaWRlcigwLCBzZWVrU29uZywgZmFsc2UsIG9uU2Vla1N0YXJ0LCBvblNlZWtpbmcsIHNvbmdTbGlkZXJFbClcclxuICAgIHRoaXMudm9sdW1lQmFyID0gbmV3IFNsaWRlcihpbml0aWFsVm9sdW1lICogMTAwLCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIGZhbHNlKSwgZmFsc2UsICgpID0+IHt9LCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIHRydWUpLCB2b2x1bWVTbGlkZXJFbClcclxuXHJcbiAgICB0aGlzLnRpdGxlID0gd2ViUGxheWVyRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2g0JylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgdGl0bGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXl0aW1lIGJhciBlbGVtZW50c1xyXG4gICAgdGhpcy5jdXJyVGltZSA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgY3VycmVudCB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgdGhpcy5kdXJhdGlvbiA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMV0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgZHVyYXRpb24gdGltZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICB0aGlzLnBsYXlQYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc2lnbnMgdGhlIGV2ZW50cyB0byBydW4gb24gZWFjaCBidXR0b24gcHJlc3MgdGhhdCBleGlzdHMgb24gdGhlIHdlYiBwbGF5ZXIgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwbGF5UHJldkZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwYXVzZUZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheS9wYXVzZSBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwbGF5TmV4dEZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3NpZ25FdmVudExpc3RlbmVycyAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQpIHtcclxuICAgIGNvbnN0IHBsYXlQcmV2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVByZXYpXHJcbiAgICBjb25zdCBwbGF5TmV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlOZXh0KVxyXG4gICAgY29uc3Qgc2h1ZmZsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnNodWZmbGUpXHJcbiAgICBjb25zdCBsb29wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMubG9vcClcclxuXHJcbiAgICBsb29wPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgcGxheWVyUHVibGljVmFycy5pc0xvb3AgPSAhcGxheWVyUHVibGljVmFycy5pc0xvb3BcclxuICAgICAgbG9vcC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJylbMF0uY2xhc3NMaXN0LnRvZ2dsZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB9KVxyXG4gICAgc2h1ZmZsZT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlID0gIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlXHJcbiAgICAgIHNodWZmbGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdLmNsYXNzTGlzdC50b2dnbGUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgfSlcclxuXHJcbiAgICBwbGF5UHJldj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwbGF5UHJldkZ1bmMpXHJcbiAgICBwbGF5TmV4dD8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwbGF5TmV4dEZ1bmMpXHJcblxyXG4gICAgdGhpcy5wbGF5UGF1c2U/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGF1c2VGdW5jKVxyXG4gICAgdGhpcy5zb25nUHJvZ3Jlc3M/LmFkZEV2ZW50TGlzdGVuZXJzKClcclxuICAgIHRoaXMudm9sdW1lQmFyPy5hZGRFdmVudExpc3RlbmVycygpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgaHRtbFRvRWwsXHJcbiAgZ2V0VmFsaWRJbWFnZSxcclxuICBzaHVmZmxlXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQge1xyXG4gIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIsXHJcbiAgaXNTYW1lUGxheWluZ1VSSSxcclxuICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsLFxyXG4gIHBsYXllclB1YmxpY1ZhcnNcclxufSBmcm9tICcuL3BsYXliYWNrLXNkaydcclxuaW1wb3J0IEFsYnVtIGZyb20gJy4vYWxidW0nXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IFBsYXlhYmxlRXZlbnRBcmcgZnJvbSAnLi9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MnXHJcbmltcG9ydCB7IFNwb3RpZnlJbWcsIEZlYXR1cmVzRGF0YSwgSUFydGlzdFRyYWNrRGF0YSwgSVBsYXlhYmxlLCBFeHRlcm5hbFVybHMsIFRyYWNrRGF0YSB9IGZyb20gJy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCwgeyBhcnJheVRvRG91Ymx5TGlua2VkTGlzdCwgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vcHVic3ViL2FnZ3JlZ2F0b3InXHJcblxyXG5jb25zdCBldmVudEFnZ3JlZ2F0b3IgPSAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yIGFzIEV2ZW50QWdncmVnYXRvclxyXG5cclxuY2xhc3MgVHJhY2sgZXh0ZW5kcyBDYXJkIGltcGxlbWVudHMgSVBsYXlhYmxlIHtcclxuICBwcml2YXRlIGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzO1xyXG4gIHByaXZhdGUgX2lkOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfdGl0bGU6IHN0cmluZztcclxuICBwcml2YXRlIF9kdXJhdGlvbjogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3VyaTogc3RyaW5nO1xyXG4gIHByaXZhdGUgX2RhdGVBZGRlZFRvUGxheWxpc3Q6IERhdGU7XHJcblxyXG4gIHBvcHVsYXJpdHk6IHN0cmluZztcclxuICByZWxlYXNlRGF0ZTogRGF0ZTtcclxuICBhbGJ1bTogQWxidW07XHJcbiAgZmVhdHVyZXM6IEZlYXR1cmVzRGF0YSB8IHVuZGVmaW5lZDtcclxuICBpbWFnZVVybDogc3RyaW5nO1xyXG4gIHNlbEVsOiBFbGVtZW50O1xyXG4gIG9uUGxheWluZzogRnVuY3Rpb25cclxuICBvblN0b3BwZWQ6IEZ1bmN0aW9uXHJcbiAgYXJ0aXN0c0h0bWw6IHN0cmluZ1xyXG5cclxuICBwdWJsaWMgZ2V0IGlkICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lkXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRpdGxlICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RpdGxlXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHVyaSAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl91cmlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZGF0ZUFkZGVkVG9QbGF5bGlzdCAoKTogRGF0ZSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdFxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldERhdGVBZGRlZFRvUGxheWxpc3QgKHZhbDogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSkge1xyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKHZhbClcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChwcm9wczogeyB0aXRsZTogc3RyaW5nOyBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+OyBkdXJhdGlvbjogbnVtYmVyOyB1cmk6IHN0cmluZzsgcG9wdWxhcml0eTogc3RyaW5nOyByZWxlYXNlRGF0ZTogc3RyaW5nOyBpZDogc3RyaW5nOyBhbGJ1bTogQWxidW07IGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzOyBhcnRpc3RzOiBBcnJheTx1bmtub3duPjsgaWR4OiBudW1iZXIgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgY29uc3Qge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgaW1hZ2VzLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgICAgdXJpLFxyXG4gICAgICBwb3B1bGFyaXR5LFxyXG4gICAgICByZWxlYXNlRGF0ZSxcclxuICAgICAgaWQsXHJcbiAgICAgIGFsYnVtLFxyXG4gICAgICBleHRlcm5hbFVybHMsXHJcbiAgICAgIGFydGlzdHNcclxuICAgIH0gPSBwcm9wc1xyXG5cclxuICAgIHRoaXMuZXh0ZXJuYWxVcmxzID0gZXh0ZXJuYWxVcmxzXHJcbiAgICB0aGlzLl9pZCA9IGlkXHJcbiAgICB0aGlzLl90aXRsZSA9IHRpdGxlXHJcbiAgICB0aGlzLmFydGlzdHNIdG1sID0gdGhpcy5nZW5lcmF0ZUhUTUxBcnRpc3ROYW1lcyhhcnRpc3RzKVxyXG4gICAgdGhpcy5fZHVyYXRpb24gPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKGR1cmF0aW9uKVxyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKClcclxuXHJcbiAgICAvLyBlaXRoZXIgdGhlIG5vcm1hbCB1cmksIG9yIHRoZSBsaW5rZWRfZnJvbS51cmlcclxuICAgIHRoaXMuX3VyaSA9IHVyaVxyXG4gICAgdGhpcy5wb3B1bGFyaXR5ID0gcG9wdWxhcml0eVxyXG4gICAgdGhpcy5yZWxlYXNlRGF0ZSA9IG5ldyBEYXRlKHJlbGVhc2VEYXRlKVxyXG4gICAgdGhpcy5hbGJ1bSA9IGFsYnVtXHJcbiAgICB0aGlzLmZlYXR1cmVzID0gdW5kZWZpbmVkXHJcblxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy5zZWxFbCA9IGh0bWxUb0VsKCc8PjwvPicpIGFzIEVsZW1lbnRcclxuXHJcbiAgICB0aGlzLm9uUGxheWluZyA9ICgpID0+IHt9XHJcbiAgICB0aGlzLm9uU3RvcHBlZCA9ICgpID0+IHt9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZpbHRlckRhdGFGcm9tQXJ0aXN0cyAoYXJ0aXN0czogQXJyYXk8dW5rbm93bj4pIHtcclxuICAgIHJldHVybiBhcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiBhcnRpc3QgYXMgSUFydGlzdFRyYWNrRGF0YSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMgKGFydGlzdHM6IEFycmF5PHVua25vd24+KSB7XHJcbiAgICBjb25zdCBhcnRpc3RzRGF0YXMgPSB0aGlzLmZpbHRlckRhdGFGcm9tQXJ0aXN0cyhhcnRpc3RzKVxyXG4gICAgbGV0IGFydGlzdE5hbWVzID0gJydcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJ0aXN0c0RhdGFzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGFydGlzdCA9IGFydGlzdHNEYXRhc1tpXVxyXG4gICAgICBhcnRpc3ROYW1lcyArPSBgPGEgaHJlZj1cIiR7YXJ0aXN0LmV4dGVybmFsX3VybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FydGlzdC5uYW1lfTwvYT5gXHJcblxyXG4gICAgICBpZiAoaSA8IGFydGlzdHNEYXRhcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgYXJ0aXN0TmFtZXMgKz0gJywgJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJ0aXN0TmFtZXNcclxuICB9XHJcblxyXG4gIC8qKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgdHJhY2suXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhY2tDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSkgOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMudHJhY2tQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnJhbmtDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUluXHJcbiAgICB9ICR7YXBwZWFyQ2xhc3N9XCI+XHJcbiAgICAgICAgICAgICAgPGg0IGlkPVwiJHtjb25maWcuQ1NTLklEcy5yYW5rfVwiPiR7aWR4ICsgMX0uPC9oND5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja31cIiBpZD1cIiR7dGhpcy5nZXRDYXJkSWQoKX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkRnJvbnRcclxuICAgICAgICAgICAgICAgICAgfVwiICB0aXRsZT1cIkNsaWNrIHRvIHZpZXcgbW9yZSBJbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiAke2NvbmZpZy5DU1MuQVRUUklCVVRFUy5yZXN0cmljdEZsaXBPbkNsaWNrfT1cInRydWVcIiBpZD1cIiR7dGhpcy5fdXJpfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCIgdGl0bGU9XCJDbGljayB0byBwbGF5IHNvbmdcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZVVybH1cIiBhbHQ9XCJBbGJ1bSBDb3ZlclwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxpbmdUZXh0XHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfTwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkQmFja30+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkR1cmF0aW9uOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+JHt0aGlzLl9kdXJhdGlvbn08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPlJlbGVhc2UgRGF0ZTo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5yZWxlYXNlRGF0ZS50b0RhdGVTdHJpbmcoKX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkFsYnVtIE5hbWU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHAgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMucmVzdHJpY3RGbGlwT25DbGlja309XCJ0cnVlXCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+JHtcclxuICAgICAgdGhpcy5hbGJ1bS5uYW1lXHJcbiAgICB9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKSBhcyBIVE1MRWxlbWVudFxyXG4gICAgY29uc3QgcGxheUJ0biA9IGVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG4pWzBdXHJcblxyXG4gICAgdGhpcy5zZWxFbCA9IHBsYXlCdG5cclxuXHJcbiAgICBwbGF5QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFja05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPih0aGlzKVxyXG4gICAgICB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSlcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGxheVBhdXNlQ2xpY2sgKHRyYWNrTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiwgdHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4gfCBudWxsID0gbnVsbCkge1xyXG4gICAgY29uc3QgdHJhY2sgPSB0aGlzIGFzIElQbGF5YWJsZVxyXG4gICAgbGV0IHRyYWNrQXJyID0gbnVsbFxyXG5cclxuICAgIGlmICh0cmFja0xpc3QpIHtcclxuICAgICAgdHJhY2tBcnIgPSB0cmFja0xpc3QudG9BcnJheSgpXHJcbiAgICB9XHJcbiAgICBldmVudEFnZ3JlZ2F0b3IucHVibGlzaChuZXcgUGxheWFibGVFdmVudEFyZyh0cmFjaywgdHJhY2tOb2RlLCB0cmFja0FycikpXHJcbiAgfVxyXG5cclxuICAvKiogR2V0IGEgdHJhY2sgaHRtbCB0byBiZSBwbGFjZWQgYXMgYSBsaXN0IGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRpc3BsYXlEYXRlIC0gd2hldGhlciB0byBkaXNwbGF5IHRoZSBkYXRlLlxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFBsYXlsaXN0VHJhY2tIdG1sICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8SVBsYXlhYmxlPiwgZGlzcGxheURhdGU6IGJvb2xlYW4gPSB0cnVlKTogTm9kZSB7XHJcbiAgICBjb25zdCB0cmFja05vZGUgPSB0cmFja0xpc3QuZmluZCgoeCkgPT4geC51cmkgPT09IHRoaXMudXJpLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICAvLyBmb3IgdGhlIHVuaXF1ZSBwbGF5IHBhdXNlIElEIGFsc28gdXNlIHRoZSBkYXRlIGFkZGVkIHRvIHBsYXlsaXN0IGFzIHRoZXJlIGNhbiBiZSBkdXBsaWNhdGVzIG9mIGEgc29uZyBpbiBhIHBsYXlsaXN0LlxyXG4gICAgY29uc3QgcGxheVBhdXNlSWQgPSB0aGlzLl91cmkgKyB0aGlzLmRhdGVBZGRlZFRvUGxheWxpc3RcclxuXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFRyYWNrfVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke3BsYXlQYXVzZUlkfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0fVwiIHNyYz1cIiR7XHJcbiAgICAgIHRoaXMuaW1hZ2VVcmxcclxuICAgIH1cIj48L2ltZz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubGlua3N9XCI+XHJcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiIHRhcmdldD1cIl9ibGFua1wiPlxyXG4gICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lXHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfVxyXG4gICAgICAgICAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgICAgICAgPGEvPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj5cclxuICAgICAgICAgICAgICAgICAgJHt0aGlzLmFydGlzdHNIdG1sfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGg1PiR7dGhpcy5fZHVyYXRpb259PC9oNT5cclxuICAgICAgICAgICAgICAke1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheURhdGVcclxuICAgICAgICAgICAgICAgICAgPyBgPGg1PiR7dGhpcy5kYXRlQWRkZWRUb1BsYXlsaXN0LnRvTG9jYWxlRGF0ZVN0cmluZygpfTwvaDU+YFxyXG4gICAgICAgICAgICAgICAgICA6ICcnXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKVxyXG5cclxuICAgIC8vIGdldCBwbGF5IHBhdXNlIGJ1dHRvblxyXG4gICAgY29uc3QgcGxheVBhdXNlQnRuID0gZWw/LmNoaWxkTm9kZXNbMV1cclxuICAgIGlmIChwbGF5UGF1c2VCdG4gPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGF5IHBhdXNlIGJ1dHRvbiBvbiB0cmFjayB3YXMgbm90IGZvdW5kJylcclxuICAgIH1cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudFxyXG4gICAgcGxheVBhdXNlQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMucGxheVBhdXNlQ2xpY2sodHJhY2tOb2RlLCB0cmFja0xpc3QpKVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBHZXQgYSB0cmFjayBodG1sIHRvIGJlIHBsYWNlZCBhcyBhIGxpc3QgZWxlbWVudCBvbiBhIHJhbmtlZCBsaXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEb3VibHlMaW5rZWRMaXN0PFRyYWNrPn0gdHJhY2tMaXN0IC0gbGlzdCBvZiB0cmFja3MgdGhhdCBjb250YWlucyB0aGlzIHRyYWNrLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYW5rIC0gdGhlIHJhbmsgb2YgdGhpcyBjYXJkXHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmFua2VkVHJhY2tIdG1sICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+LCByYW5rOiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IHRyYWNrTm9kZSA9IHRyYWNrTGlzdC5maW5kKCh4KSA9PiB4LnVyaSA9PT0gdGhpcy51cmksIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0VHJhY2t9XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rZWRUcmFja0ludGVyYWN0fSAke1xyXG4gICAgICAgICAgICAgICAgaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh0aGlzLnVyaSkgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHt0aGlzLl91cml9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRufSAke1xyXG4gICAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPHA+JHtyYW5rfS48L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIiBzcmM9XCIke1xyXG4gICAgICB0aGlzLmltYWdlVXJsXHJcbiAgICB9XCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmxpbmtzfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubmFtZVxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX1cclxuICAgICAgICAgICAgICAgICAgPC9oND5cclxuICAgICAgICAgICAgICAgIDxhLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dGhpcy5hcnRpc3RzSHRtbH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgIGBcclxuXHJcbiAgICBjb25zdCBlbCA9IGh0bWxUb0VsKGh0bWwpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXkgcGF1c2UgYnV0dG9uXHJcbiAgICBjb25zdCBwbGF5UGF1c2VCdG4gPSBlbD8uY2hpbGROb2Rlc1sxXS5jaGlsZE5vZGVzWzFdXHJcblxyXG4gICAgaWYgKHBsYXlQYXVzZUJ0biA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsYXkgcGF1c2UgYnV0dG9uIG9uIHRyYWNrIHdhcyBub3QgZm91bmQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5zZWxFbCA9IHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50XHJcblxyXG4gICAgLy8gc2VsZWN0IHRoZSByYW5rIGFyZWEgYXMgdG8ga2VlcCB0aGUgcGxheS9wYXVzZSBpY29uIHNob3duXHJcbiAgICBjb25zdCByYW5rZWRJbnRlcmFjdCA9IChlbCBhcyBIVE1MRWxlbWVudCkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMucmFua2VkVHJhY2tJbnRlcmFjdClbMF1cclxuICAgIHRoaXMub25QbGF5aW5nID0gKCkgPT4gcmFua2VkSW50ZXJhY3QuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLm9uU3RvcHBlZCA9ICgpID0+IHJhbmtlZEludGVyYWN0LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG5cclxuICAgIHBsYXlQYXVzZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGxheVBhdXNlQ2xpY2sodHJhY2tOb2RlLCB0cmFja0xpc3QpXHJcbiAgICB9KVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIHRoZSBmZWF0dXJlcyBvZiB0aGlzIHRyYWNrIGZyb20gdGhlIHNwb3RpZnkgd2ViIGFwaS4gKi9cclxuICBwdWJsaWMgYXN5bmMgbG9hZEZlYXR1cmVzICgpIHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zXHJcbiAgICAgIC5nZXQoY29uZmlnLlVSTHMuZ2V0VHJhY2tGZWF0dXJlcyArIHRoaXMuaWQpXHJcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgZXJyXHJcbiAgICAgIH0pXHJcbiAgICBjb25zdCBmZWF0cyA9IHJlcy5kYXRhLmF1ZGlvX2ZlYXR1cmVzXHJcbiAgICB0aGlzLmZlYXR1cmVzID0ge1xyXG4gICAgICBkYW5jZWFiaWxpdHk6IGZlYXRzLmRhbmNlYWJpbGl0eSxcclxuICAgICAgYWNvdXN0aWNuZXNzOiBmZWF0cy5hY291c3RpY25lc3MsXHJcbiAgICAgIGluc3RydW1lbnRhbG5lc3M6IGZlYXRzLmluc3RydW1lbnRhbG5lc3MsXHJcbiAgICAgIHZhbGVuY2U6IGZlYXRzLnZhbGVuY2UsXHJcbiAgICAgIGVuZXJneTogZmVhdHMuZW5lcmd5XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNcclxuICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmF0ZSB0cmFja3MgZnJvbSBkYXRhIGV4Y2x1ZGluZyBkYXRlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFRyYWNrRGF0YT59IGRhdGFzXHJcbiAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBBcnJheTxUcmFjaz59IHRyYWNrcyAtIGRvdWJsZSBsaW5rZWQgbGlzdFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgKGRhdGFzOiBBcnJheTxUcmFja0RhdGE+LCB0cmFja3M6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgQXJyYXk8VHJhY2s+KSB7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgZGF0YSA9IGRhdGFzW2ldXHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICBjb25zdCBwcm9wcyA9IHtcclxuICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgIGltYWdlczogZGF0YS5hbGJ1bS5pbWFnZXMsXHJcbiAgICAgICAgZHVyYXRpb246IGRhdGEuZHVyYXRpb25fbXMsXHJcbiAgICAgICAgdXJpOiBkYXRhLmxpbmtlZF9mcm9tICE9PSB1bmRlZmluZWQgPyBkYXRhLmxpbmtlZF9mcm9tLnVyaSA6IGRhdGEudXJpLFxyXG4gICAgICAgIHBvcHVsYXJpdHk6IGRhdGEucG9wdWxhcml0eSxcclxuICAgICAgICByZWxlYXNlRGF0ZTogZGF0YS5hbGJ1bS5yZWxlYXNlX2RhdGUsXHJcbiAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgYWxidW06IG5ldyBBbGJ1bShkYXRhLmFsYnVtLm5hbWUsIGRhdGEuYWxidW0uZXh0ZXJuYWxfdXJscy5zcG90aWZ5KSxcclxuICAgICAgICBleHRlcm5hbFVybHM6IGRhdGEuZXh0ZXJuYWxfdXJscyxcclxuICAgICAgICBhcnRpc3RzOiBkYXRhLmFydGlzdHMsXHJcbiAgICAgICAgaWR4OiBpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodHJhY2tzKSkge1xyXG4gICAgICAgIHRyYWNrcy5wdXNoKG5ldyBUcmFjayhwcm9wcykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdHJhY2tzLmFkZChuZXcgVHJhY2socHJvcHMpKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cmFja3NcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJhY2tcclxuIiwiXHJcbmltcG9ydCB7IElQcm9taXNlSGFuZGxlclJldHVybiwgU3BvdGlmeUltZyB9IGZyb20gJy4uL3R5cGVzJ1xyXG5pbXBvcnQgeyBURVJNUywgVEVSTV9UWVBFIH0gZnJvbSAnLi9jb21wb25lbnRzL3NhdmUtbG9hZC10ZXJtJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5jb25zdCBhdXRoRW5kcG9pbnQgPSAnaHR0cHM6Ly9hY2NvdW50cy5zcG90aWZ5LmNvbS9hdXRob3JpemUnXHJcbi8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFwcCdzIGNsaWVudCBJRCwgcmVkaXJlY3QgVVJJIGFuZCBkZXNpcmVkIHNjb3Blc1xyXG5jb25zdCByZWRpcmVjdFVyaSA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXHJcbmNvbnN0IGNsaWVudElkID0gJzQzNGY1ZTlmNDQyYTRlNDU4NmUwODlhMzNmNjVjODU3J1xyXG5jb25zdCBzY29wZXMgPSBbXHJcbiAgJ3VzZXItcmVhZC1wbGF5YmFjay1zdGF0ZScsXHJcbiAgJ3VzZXItbW9kaWZ5LXBsYXliYWNrLXN0YXRlJyxcclxuICAndXNlci1yZWFkLWN1cnJlbnRseS1wbGF5aW5nJyxcclxuICAnc3RyZWFtaW5nJyxcclxuICAndXNlci1yZWFkLWVtYWlsJyxcclxuICAndXNlci1yZWFkLXByaXZhdGUnLFxyXG4gICdwbGF5bGlzdC1yZWFkLWNvbGxhYm9yYXRpdmUnLFxyXG4gICdwbGF5bGlzdC1yZWFkLXByaXZhdGUnLFxyXG4gICdwbGF5bGlzdC1tb2RpZnktcHJpdmF0ZScsXHJcbiAgJ3VzZXItbGlicmFyeS1yZWFkJyxcclxuICAndXNlci10b3AtcmVhZCcsXHJcbiAgJ3VzZXItcmVhZC1yZWNlbnRseS1wbGF5ZWQnLFxyXG4gICd1c2VyLWZvbGxvdy1yZWFkJ1xyXG5dXHJcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XHJcbiAgQ1NTOiB7XHJcbiAgICBJRHM6IHtcclxuICAgICAgZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lcjogJ2dldC10b2tlbi1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBwbGF5bGlzdENhcmRzQ29udGFpbmVyOiAncGxheWxpc3QtY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgdHJhY2tDYXJkc0NvbnRhaW5lcjogJ3RyYWNrLWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIHBsYXlsaXN0UHJlZml4OiAncGxheWxpc3QtJyxcclxuICAgICAgdHJhY2tQcmVmaXg6ICd0cmFjay0nLFxyXG4gICAgICBzcG90aWZ5Q29udGFpbmVyOiAnc3BvdGlmeS1jb250YWluZXInLFxyXG4gICAgICBpbmZvQ29udGFpbmVyOiAnaW5mby1jb250YWluZXInLFxyXG4gICAgICBhbGxvd0FjY2Vzc0hlYWRlcjogJ2FsbG93LWFjY2Vzcy1oZWFkZXInLFxyXG4gICAgICBleHBhbmRlZFBsYXlsaXN0TW9kczogJ2V4cGFuZGVkLXBsYXlsaXN0LW1vZHMnLFxyXG4gICAgICB0cmFja3NEYXRhOiAndHJhY2tzLWRhdGEnLFxyXG4gICAgICB0cmFja3NDaGFydDogJ3RyYWNrcy1jaGFydCcsXHJcbiAgICAgIHRyYWNrc1Rlcm1TZWxlY3Rpb25zOiAndHJhY2tzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIGZlYXR1cmVTZWxlY3Rpb25zOiAnZmVhdHVyZS1zZWxlY3Rpb25zJyxcclxuICAgICAgcGxheWxpc3RzU2VjdGlvbjogJ3BsYXlsaXN0cy1zZWN0aW9uJyxcclxuICAgICAgZmVhdERlZjogJ2ZlYXQtZGVmaW5pdGlvbicsXHJcbiAgICAgIGZlYXRBdmVyYWdlOiAnZmVhdC1hdmVyYWdlJyxcclxuICAgICAgcmFuazogJ3JhbmsnLFxyXG4gICAgICB2aWV3QWxsVG9wVHJhY2tzOiAndmlldy1hbGwtdG9wLXRyYWNrcycsXHJcbiAgICAgIGVtb2ppczogJ2Vtb2ppcycsXHJcbiAgICAgIGFydGlzdENhcmRzQ29udGFpbmVyOiAnYXJ0aXN0LWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIGFydGlzdFByZWZpeDogJ2FydGlzdC0nLFxyXG4gICAgICBpbml0aWFsQ2FyZDogJ2luaXRpYWwtY2FyZCcsXHJcbiAgICAgIGNvbnZlcnRDYXJkOiAnY29udmVydC1jYXJkJyxcclxuICAgICAgYXJ0aXN0VGVybVNlbGVjdGlvbnM6ICdhcnRpc3RzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIHByb2ZpbGVIZWFkZXI6ICdwcm9maWxlLWhlYWRlcicsXHJcbiAgICAgIGNsZWFyRGF0YTogJ2NsZWFyLWRhdGEnLFxyXG4gICAgICBsaWtlZFRyYWNrczogJ2xpa2VkLXRyYWNrcycsXHJcbiAgICAgIGZvbGxvd2VkQXJ0aXN0czogJ2ZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgICB3ZWJQbGF5ZXI6ICd3ZWItcGxheWVyJyxcclxuICAgICAgcGxheVRpbWVCYXI6ICdwbGF5dGltZS1iYXInLFxyXG4gICAgICBwbGF5bGlzdEhlYWRlckFyZWE6ICdwbGF5bGlzdC1tYWluLWhlYWRlci1hcmVhJyxcclxuICAgICAgcGxheU5leHQ6ICdwbGF5LW5leHQnLFxyXG4gICAgICBwbGF5UHJldjogJ3BsYXktcHJldicsXHJcbiAgICAgIHdlYlBsYXllclBsYXlQYXVzZTogJ3BsYXktcGF1c2UtcGxheWVyJyxcclxuICAgICAgd2ViUGxheWVyVm9sdW1lOiAnd2ViLXBsYXllci12b2x1bWUtYmFyJyxcclxuICAgICAgd2ViUGxheWVyUHJvZ3Jlc3M6ICd3ZWItcGxheWVyLXByb2dyZXNzLWJhcicsXHJcbiAgICAgIHBsYXllclRyYWNrSW1nOiAncGxheWVyLXRyYWNrLWltZycsXHJcbiAgICAgIHdlYlBsYXllckFydGlzdHM6ICd3ZWItcGxheWVyLWFydGlzdHMnLFxyXG4gICAgICBnZW5lcmF0ZVBsYXlsaXN0OiAnZ2VuZXJhdGUtcGxheWxpc3QnLFxyXG4gICAgICBoaWRlU2hvd1BsYXlsaXN0VHh0OiAnaGlkZS1zaG93LXBsYXlsaXN0LXR4dCcsXHJcbiAgICAgIHRvcFRyYWNrc1RleHRGb3JtQ29udGFpbmVyOiAndGVybS10ZXh0LWZvcm0tY29udGFpbmVyJyxcclxuICAgICAgdXNlcm5hbWU6ICd1c2VybmFtZScsXHJcbiAgICAgIHRvcE5hdk1vYmlsZTogJ3RvcG5hdi1tb2JpbGUnLFxyXG4gICAgICBzaHVmZmxlOiAnc2h1ZmZsZScsXHJcbiAgICAgIGhvbWVIZWFkZXI6ICdob21lLWhlYWRlcicsXHJcbiAgICAgIGxvb3A6ICdsb29wJ1xyXG4gICAgfSxcclxuICAgIENMQVNTRVM6IHtcclxuICAgICAgZ2xvdzogJ2dsb3cnLFxyXG4gICAgICBwbGF5bGlzdDogJ3BsYXlsaXN0JyxcclxuICAgICAgdHJhY2s6ICd0cmFjaycsXHJcbiAgICAgIGFydGlzdDogJ2FydGlzdCcsXHJcbiAgICAgIHJhbmtDYXJkOiAncmFuay1jYXJkJyxcclxuICAgICAgcGxheWxpc3RUcmFjazogJ3BsYXlsaXN0LXRyYWNrJyxcclxuICAgICAgaW5mb0xvYWRpbmdTcGlubmVyczogJ2luZm8tbG9hZGluZy1zcGlubmVyJyxcclxuICAgICAgYXBwZWFyOiAnYXBwZWFyJyxcclxuICAgICAgaGlkZTogJ2hpZGUnLFxyXG4gICAgICBzZWxlY3RlZDogJ3NlbGVjdGVkJyxcclxuICAgICAgY2FyZDogJ2NhcmQnLFxyXG4gICAgICBwbGF5bGlzdFNlYXJjaDogJ3BsYXlsaXN0LXNlYXJjaCcsXHJcbiAgICAgIGVsbGlwc2lzV3JhcDogJ2VsbGlwc2lzLXdyYXAnLFxyXG4gICAgICBuYW1lOiAnbmFtZScsXHJcbiAgICAgIHBsYXlsaXN0T3JkZXI6ICdwbGF5bGlzdC1vcmRlcicsXHJcbiAgICAgIGNoYXJ0SW5mbzogJ2NoYXJ0LWluZm8nLFxyXG4gICAgICBmbGlwQ2FyZElubmVyOiAnZmxpcC1jYXJkLWlubmVyJyxcclxuICAgICAgZmxpcENhcmRGcm9udDogJ2ZsaXAtY2FyZC1mcm9udCcsXHJcbiAgICAgIGZsaXBDYXJkQmFjazogJ2ZsaXAtY2FyZC1iYWNrJyxcclxuICAgICAgZmxpcENhcmQ6ICdmbGlwLWNhcmQnLFxyXG4gICAgICByZXNpemVDb250YWluZXI6ICdyZXNpemUtY29udGFpbmVyJyxcclxuICAgICAgc2Nyb2xsTGVmdDogJ3Njcm9sbC1sZWZ0JyxcclxuICAgICAgc2Nyb2xsaW5nVGV4dDogJ3Njcm9sbGluZy10ZXh0JyxcclxuICAgICAgbm9TZWxlY3Q6ICduby1zZWxlY3QnLFxyXG4gICAgICBkcm9wRG93bjogJ2Ryb3AtZG93bicsXHJcbiAgICAgIGV4cGFuZGFibGVUeHRDb250YWluZXI6ICdleHBhbmRhYmxlLXRleHQtY29udGFpbmVyJyxcclxuICAgICAgYm9yZGVyQ292ZXI6ICdib3JkZXItY292ZXInLFxyXG4gICAgICBmaXJzdEV4cGFuc2lvbjogJ2ZpcnN0LWV4cGFuc2lvbicsXHJcbiAgICAgIHNlY29uZEV4cGFuc2lvbjogJ3NlY29uZC1leHBhbnNpb24nLFxyXG4gICAgICBpbnZpc2libGU6ICdpbnZpc2libGUnLFxyXG4gICAgICBmYWRlSW46ICdmYWRlLWluJyxcclxuICAgICAgZnJvbVRvcDogJ2Zyb20tdG9wJyxcclxuICAgICAgZXhwYW5kT25Ib3ZlcjogJ2V4cGFuZC1vbi1ob3ZlcicsXHJcbiAgICAgIHRyYWNrc0FyZWE6ICd0cmFja3MtYXJlYScsXHJcbiAgICAgIHNjcm9sbEJhcjogJ3Njcm9sbC1iYXInLFxyXG4gICAgICB0cmFja0xpc3Q6ICd0cmFjay1saXN0JyxcclxuICAgICAgYXJ0aXN0VG9wVHJhY2tzOiAnYXJ0aXN0LXRvcC10cmFja3MnLFxyXG4gICAgICB0ZXh0Rm9ybTogJ3RleHQtZm9ybScsXHJcbiAgICAgIGNvbnRlbnQ6ICdjb250ZW50JyxcclxuICAgICAgbGlua3M6ICdsaW5rcycsXHJcbiAgICAgIHByb2dyZXNzOiAncHJvZ3Jlc3MnLFxyXG4gICAgICBwbGF5UGF1c2U6ICdwbGF5LXBhdXNlJyxcclxuICAgICAgcmFua2VkVHJhY2tJbnRlcmFjdDogJ3JhbmtlZC1pbnRlcmFjdGlvbi1hcmVhJyxcclxuICAgICAgc2xpZGVyOiAnc2xpZGVyJyxcclxuICAgICAgcGxheUJ0bjogJ3BsYXktYnRuJyxcclxuICAgICAgZGlzcGxheU5vbmU6ICdkaXNwbGF5LW5vbmUnLFxyXG4gICAgICBjb2x1bW46ICdjb2x1bW4nLFxyXG4gICAgICB3ZWJQbGF5ZXJDb250cm9sczogJ3dlYi1wbGF5ZXItY29udHJvbHMnXHJcbiAgICB9LFxyXG4gICAgQVRUUklCVVRFUzoge1xyXG4gICAgICBkYXRhU2VsZWN0aW9uOiAnZGF0YS1zZWxlY3Rpb24nLFxyXG4gICAgICByZXN0cmljdEZsaXBPbkNsaWNrOiAnZGF0YS1yZXN0cmljdC1mbGlwLW9uLWNsaWNrJ1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgVVJMczoge1xyXG4gICAgc2l0ZVVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXHJcbiAgICBhdXRoOiBgJHthdXRoRW5kcG9pbnR9P2NsaWVudF9pZD0ke2NsaWVudElkfSZyZWRpcmVjdF91cmk9JHtyZWRpcmVjdFVyaX0mc2NvcGU9JHtzY29wZXMuam9pbihcclxuICAgICAgJyUyMCdcclxuICAgICl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzaG93X2RpYWxvZz10cnVlYCxcclxuICAgIGdldEhhc1Rva2VuczogJy90b2tlbnMvaGFzLXRva2VucycsXHJcbiAgICBnZXRBY2Nlc3NUb2tlbjogJy90b2tlbnMvZ2V0LWFjY2Vzcy10b2tlbicsXHJcbiAgICBnZXRPYnRhaW5Ub2tlbnNQcmVmaXg6IChjb2RlOiBzdHJpbmcpID0+IGAvdG9rZW5zL29idGFpbi10b2tlbnM/Y29kZT0ke2NvZGV9YCxcclxuICAgIGdldFRvcEFydGlzdHM6ICcvc3BvdGlmeS9nZXQtdG9wLWFydGlzdHM/dGltZV9yYW5nZT0nLFxyXG4gICAgZ2V0VG9wVHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LXRvcC10cmFja3M/dGltZV9yYW5nZT0nLFxyXG4gICAgZ2V0UGxheWxpc3RzOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0cycsXHJcbiAgICBnZXRQbGF5bGlzdFRyYWNrczogJy9zcG90aWZ5L2dldC1wbGF5bGlzdC10cmFja3M/cGxheWxpc3RfaWQ9JyxcclxuICAgIHB1dENsZWFyVG9rZW5zOiAnL3Rva2Vucy9jbGVhci10b2tlbnMnLFxyXG4gICAgZGVsZXRlUGxheWxpc3RUcmFja3M6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9kZWxldGUtcGxheWxpc3QtaXRlbXM/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBwb3N0UGxheWxpc3RUcmFja3M6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LXBsYXlsaXN0LWl0ZW1zP3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgZ2V0VHJhY2tGZWF0dXJlczogJy9zcG90aWZ5L2dldC10cmFja3MtZmVhdHVyZXM/dHJhY2tfaWRzPScsXHJcbiAgICBwdXRSZWZyZXNoQWNjZXNzVG9rZW46ICcvdG9rZW5zL3JlZnJlc2gtdG9rZW4nLFxyXG4gICAgcHV0U2Vzc2lvbkRhdGE6ICcvc3BvdGlmeS9wdXQtc2Vzc2lvbi1kYXRhP2F0dHI9JyxcclxuICAgIHB1dFBsYXlsaXN0UmVzaXplRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXBsYXlsaXN0LXJlc2l6ZS1kYXRhP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWxpc3RSZXNpemVEYXRhOiAnL3VzZXIvZ2V0LXBsYXlsaXN0LXJlc2l6ZS1kYXRhJyxcclxuICAgIHB1dFBsYXlsaXN0SXNJblRleHRGb3JtRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXBsYXlsaXN0LXRleHQtZm9ybS1kYXRhP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhOiAnL3VzZXIvZ2V0LXBsYXlsaXN0LXRleHQtZm9ybS1kYXRhJyxcclxuICAgIHB1dFRvcFRyYWNrc0lzSW5UZXh0Rm9ybURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC10b3AtdHJhY2tzLXRleHQtZm9ybS1kYXRhP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0VG9wVHJhY2tzSXNJblRleHRGb3JtRGF0YTogJy91c2VyL2dldC10b3AtdHJhY2tzLXRleHQtZm9ybS1kYXRhJyxcclxuICAgIGdldEFydGlzdFRvcFRyYWNrczogKGlkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9nZXQtYXJ0aXN0LXRvcC10cmFja3M/aWQ9JHtpZH1gLFxyXG4gICAgZ2V0Q3VycmVudFVzZXJQcm9maWxlOiAnL3Nwb3RpZnkvZ2V0LWN1cnJlbnQtdXNlci1wcm9maWxlJyxcclxuICAgIHB1dENsZWFyU2Vzc2lvbjogJy9jbGVhci1zZXNzaW9uJyxcclxuICAgIGdldEN1cnJlbnRVc2VyU2F2ZWRUcmFja3M6ICcvc3BvdGlmeS9nZXQtY3VycmVudC11c2VyLXNhdmVkLXRyYWNrcycsXHJcbiAgICBnZXRGb2xsb3dlZEFydGlzdHM6ICcvc3BvdGlmeS9nZXQtZm9sbG93ZWQtYXJ0aXN0cycsXHJcbiAgICBwdXRQbGF5VHJhY2s6IChkZXZpY2VfaWQ6IHN0cmluZywgdHJhY2tfdXJpOiBzdHJpbmcpID0+XHJcbiAgICAgIGAvc3BvdGlmeS9wbGF5LXRyYWNrP2RldmljZV9pZD0ke2RldmljZV9pZH0mdHJhY2tfdXJpPSR7dHJhY2tfdXJpfWAsXHJcbiAgICBwdXRQbGF5ZXJWb2x1bWVEYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtcGxheWVyLXZvbHVtZT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXllclZvbHVtZURhdGE6ICcvdXNlci9nZXQtcGxheWVyLXZvbHVtZScsXHJcbiAgICBwdXRUZXJtOiAodGVybTogVEVSTVMsIHRlcm1UeXBlOiBURVJNX1RZUEUpID0+IGAvdXNlci9wdXQtdG9wLSR7dGVybVR5cGV9LXRlcm0/dGVybT0ke3Rlcm19YCxcclxuICAgIGdldFRlcm06ICh0ZXJtVHlwZTogVEVSTV9UWVBFKSA9PiBgL3VzZXIvZ2V0LXRvcC0ke3Rlcm1UeXBlfS10ZXJtYCxcclxuICAgIHB1dEN1cnJQbGF5bGlzdElkOiAoaWQ6IHN0cmluZykgPT4gYC91c2VyL3B1dC1jdXJyZW50LXBsYXlsaXN0LWlkP2lkPSR7aWR9YCxcclxuICAgIGdldEN1cnJQbGF5bGlzdElkOiAnL3VzZXIvZ2V0LWN1cnJlbnQtcGxheWxpc3QtaWQnLFxyXG4gICAgcG9zdFBsYXlsaXN0OiAobmFtZTogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1wbGF5bGlzdD9uYW1lPSR7bmFtZX1gLFxyXG4gICAgcG9zdEl0ZW1zVG9QbGF5bGlzdDogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtaXRlbXMtdG8tcGxheWxpc3Q/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBnZXRVc2VybmFtZTogJy91c2VyL2dldC11c2VybmFtZSdcclxuICB9LFxyXG4gIFBBVEhTOiB7XHJcbiAgICBzcGlubmVyOiAnL2ltYWdlcy8yMDBweExvYWRpbmdTcGlubmVyLnN2ZycsXHJcbiAgICBncmlkVmlldzogJy9pbWFnZXMvZ3JpZC12aWV3LWljb24ucG5nJyxcclxuICAgIGxpc3RWaWV3OiAnL2ltYWdlcy9saXN0LXZpZXctaWNvbi5wbmcnLFxyXG4gICAgY2hldnJvbkxlZnQ6ICcvaW1hZ2VzL2NoZXZyb24tbGVmdC5wbmcnLFxyXG4gICAgY2hldnJvblJpZ2h0OiAnL2ltYWdlcy9jaGV2cm9uLXJpZ2h0LnBuZycsXHJcbiAgICBwbGF5SWNvbjogJy9pbWFnZXMvcGxheS0zMHB4LnBuZycsXHJcbiAgICBwYXVzZUljb246ICcvaW1hZ2VzL3BhdXNlLTMwcHgucG5nJyxcclxuICAgIHBsYXlCbGFja0ljb246ICcvaW1hZ2VzL3BsYXktYmxhY2stMzBweC5wbmcnLFxyXG4gICAgcGF1c2VCbGFja0ljb246ICcvaW1hZ2VzL3BhdXNlLWJsYWNrLTMwcHgucG5nJyxcclxuICAgIHBsYXlOZXh0OiAnL2ltYWdlcy9uZXh0LTMwcHgucG5nJyxcclxuICAgIHBsYXlQcmV2OiAnL2ltYWdlcy9wcmV2aW91cy0zMHB4LnBuZycsXHJcbiAgICBwcm9maWxlVXNlcjogJy9pbWFnZXMvcHJvZmlsZS11c2VyLnBuZycsXHJcbiAgICBzaHVmZmxlSWNvbjogJy9pbWFnZXMvc2h1ZmZsZS1pY29uLnBuZycsXHJcbiAgICBzaHVmZmxlSWNvbkdyZWVuOiAnL2ltYWdlcy9zaHVmZmxlLWljb24tZ3JlZW4ucG5nJyxcclxuICAgIGxvb3BJY29uOiAnL2ltYWdlcy9sb29wLWljb24ucG5nJyxcclxuICAgIGxvb3BJY29uR3JlZW46ICcvaW1hZ2VzL2xvb3AtaWNvbi1ncmVlbi5wbmcnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyAobWlsbGlzOiBudW1iZXIpIHtcclxuICBjb25zdCBtaW51dGVzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1pbGxpcyAvIDYwMDAwKVxyXG4gIGNvbnN0IHNlY29uZHM6IG51bWJlciA9IHBhcnNlSW50KCgobWlsbGlzICUgNjAwMDApIC8gMTAwMCkudG9GaXhlZCgwKSlcclxuICByZXR1cm4gc2Vjb25kcyA9PT0gNjBcclxuICAgID8gbWludXRlcyArIDEgKyAnOjAwJ1xyXG4gICAgOiBtaW51dGVzICsgJzonICsgKHNlY29uZHMgPCAxMCA/ICcwJyA6ICcnKSArIHNlY29uZHNcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaHRtbFRvRWwgKGh0bWw6IHN0cmluZykge1xyXG4gIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpXHJcbiAgaHRtbCA9IGh0bWwudHJpbSgpIC8vIE5ldmVyIHJldHVybiBhIHNwYWNlIHRleHQgbm9kZSBhcyBhIHJlc3VsdFxyXG4gIHRlbXAuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHJldHVybiB0ZW1wLmNvbnRlbnQuZmlyc3RDaGlsZFxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbWlzZUhhbmRsZXI8VD4gKFxyXG4gIHByb21pc2U6IFByb21pc2U8VD4sXHJcbiAgb25TdWNjZXNmdWwgPSAocmVzOiBUKSA9PiB7IH0sXHJcbiAgb25GYWlsdXJlID0gKGVycjogdW5rbm93bikgPT4ge1xyXG4gICAgaWYgKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgIH1cclxuICB9XHJcbikge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBwcm9taXNlXHJcbiAgICBvblN1Y2Nlc2Z1bChyZXMgYXMgVClcclxuICAgIHJldHVybiB7IHJlczogcmVzLCBlcnI6IG51bGwgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcclxuICAgIG9uRmFpbHVyZShlcnIpXHJcbiAgICByZXR1cm4geyByZXM6IG51bGwsIGVycjogZXJyIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRmlsdGVycyAnbGknIGVsZW1lbnRzIHRvIGVpdGhlciBiZSBoaWRkZW4gb3Igbm90IGRlcGVuZGluZyBvbiBpZlxyXG4gKiB0aGV5IGNvbnRhaW4gc29tZSBnaXZlbiBpbnB1dCB0ZXh0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge0hUTUx9IHVsIC0gdW5vcmRlcmVkIGxpc3QgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSAnbGknIHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7SFRNTH0gaW5wdXQgLSBpbnB1dCBlbGVtZW50IHdob3NlIHZhbHVlIHdpbGwgYmUgdXNlZCB0byBmaWx0ZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ZERpc3BsYXkgLSB0aGUgc3RhbmRhcmQgZGlzcGxheSB0aGUgJ2xpJyBzaG91bGQgaGF2ZSB3aGVuIG5vdCAnbm9uZSdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hVbCAodWw6IEhUTUxVTGlzdEVsZW1lbnQsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50LCBzdGREaXNwbGF5OiBzdHJpbmcgPSAnZmxleCcpOiB2b2lkIHtcclxuICBjb25zdCBsaUVscyA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpXHJcbiAgY29uc3QgZmlsdGVyID0gaW5wdXQudmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpRWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBnZXQgdGhlIG5hbWUgY2hpbGQgZWwgaW4gdGhlIGxpIGVsXHJcbiAgICBjb25zdCBuYW1lID0gbGlFbHNbaV0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMubmFtZSlbMF1cclxuICAgIGNvbnN0IG5hbWVUeHQgPSBuYW1lLnRleHRDb250ZW50IHx8IG5hbWUuaW5uZXJIVE1MXHJcblxyXG4gICAgaWYgKG5hbWVUeHQgJiYgbmFtZVR4dC50b1VwcGVyQ2FzZSgpLmluZGV4T2YoZmlsdGVyKSA+IC0xKSB7XHJcbiAgICAgIC8vIHNob3cgbGkncyB3aG9zZSBuYW1lIGNvbnRhaW5zIHRoZSB0aGUgZW50ZXJlZCBzdHJpbmdcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9IHN0ZERpc3BsYXlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG90aGVyd2lzZSBoaWRlIGl0XHJcbiAgICAgIGxpRWxzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cclxuICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cclxuICpcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoICh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgbGV0IG1ldHJpY3M6IFRleHRNZXRyaWNzXHJcbiAgaWYgKGNvbnRleHQpIHtcclxuICAgIGNvbnRleHQuZm9udCA9IGZvbnRcclxuICAgIG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpXHJcbiAgICByZXR1cm4gbWV0cmljcy53aWR0aFxyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdObyBjb250ZXh0IG9uIGNyZWF0ZWQgY2FudmFzIHdhcyBmb3VuZCcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsbGlwc2lzQWN0aXZlIChlbDogSFRNTEVsZW1lbnQpIHtcclxuICByZXR1cm4gZWwub2Zmc2V0V2lkdGggPCBlbC5zY3JvbGxXaWR0aFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyIChzdHJpbmc6IHN0cmluZykge1xyXG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbGlkSW1hZ2UgKGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGlkeCA9IDApIHtcclxuICAvLyBvYnRhaW4gdGhlIGNvcnJlY3QgaW1hZ2VcclxuICBpZiAoaW1hZ2VzLmxlbmd0aCA+IGlkeCkge1xyXG4gICAgY29uc3QgaW1nID0gaW1hZ2VzW2lkeF1cclxuICAgIHJldHVybiBpbWcudXJsXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUFsbENoaWxkTm9kZXMgKHBhcmVudDogTm9kZSkge1xyXG4gIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGFuaW1hdGlvbkNvbnRyb2wgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8qKiBBZGRzIGEgY2xhc3MgdG8gZWFjaCBlbGVtZW50IGNhdXNpbmcgYSB0cmFuc2l0aW9uIHRvIHRoZSBjaGFuZ2VkIGNzcyB2YWx1ZXMuXHJcbiAgICogVGhpcyBpcyBkb25lIG9uIHNldCBpbnRlcnZhbHMuXHJcbiAgICpcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBpbmNsdWRpbmcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzVG9UcmFuc2l0aW9uVG9vIC0gVGhlIGNsYXNzIHRoYXQgYWxsIHRoZSB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIHdpbGwgYWRkXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuaW1hdGlvbkludGVydmFsIC0gVGhlIGludGVydmFsIHRvIHdhaXQgYmV0d2VlbiBhbmltYXRpb24gb2YgZWxlbWVudHNcclxuICAgKi9cclxuICBmdW5jdGlvbiBhZGRDbGFzc09uSW50ZXJ2YWwgKFxyXG4gICAgZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZyxcclxuICAgIGNsYXNzVG9UcmFuc2l0aW9uVG9vOiBzdHJpbmcsXHJcbiAgICBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyXHJcbiAgKSB7XHJcbiAgICAvLyBhcnIgb2YgaHRtbCBzZWxlY3RvcnMgdGhhdCBwb2ludCB0byBlbGVtZW50cyB0byBhbmltYXRlXHJcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudHNUb0FuaW1hdGUuc3BsaXQoJywnKVxyXG5cclxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYXR0cilcclxuICAgICAgbGV0IGlkeCA9IDBcclxuICAgICAgLy8gaW4gaW50ZXJ2YWxzIHBsYXkgdGhlaXIgaW5pdGlhbCBhbmltYXRpb25zXHJcbiAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpZHggPT09IGVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaWR4XVxyXG4gICAgICAgIC8vIGFkZCB0aGUgY2xhc3MgdG8gdGhlIGVsZW1lbnRzIGNsYXNzZXMgaW4gb3JkZXIgdG8gcnVuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9UcmFuc2l0aW9uVG9vKVxyXG4gICAgICAgIGlkeCArPSAxXHJcbiAgICAgIH0sIGFuaW1hdGlvbkludGVydmFsKVxyXG4gICAgfSlcclxuICB9XHJcbiAgcmV0dXJuIHtcclxuICAgIGFkZENsYXNzT25JbnRlcnZhbFxyXG4gIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBpeGVsUG9zSW5FbE9uQ2xpY2sgKG1vdXNlRXZ0OiBNb3VzZUV2ZW50KTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHtcclxuICBjb25zdCByZWN0ID0gKG1vdXNlRXZ0LnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICBjb25zdCB4ID0gbW91c2VFdnQuY2xpZW50WCAtIHJlY3QubGVmdCAvLyB4IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICBjb25zdCB5ID0gbW91c2VFdnQuY2xpZW50WSAtIHJlY3QudG9wIC8vIHkgcG9zaXRpb24gd2l0aGluIHRoZSBlbGVtZW50LlxyXG4gIHJldHVybiB7IHgsIHkgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFeHByZXNzaW9uIChlcnJvck1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkSXRlbXNUb1BsYXlsaXN0IChwbGF5bGlzdElkOiBzdHJpbmcsIHVyaXM6IEFycmF5PHN0cmluZz4pIHtcclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgIGF4aW9zKHtcclxuICAgICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICAgIHVybDogY29uZmlnLlVSTHMucG9zdEl0ZW1zVG9QbGF5bGlzdChwbGF5bGlzdElkKSxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHVyaXM6IHVyaXNcclxuICAgICAgfVxyXG4gICAgfSksXHJcbiAgICAoKSA9PiB7fSwgKCkgPT4ge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lzc3VlIGFkZGluZyBpdGVtcyB0byBwbGF5bGlzdCcpXHJcbiAgICB9KVxyXG59XHJcblxyXG4vKipcclxuICogU2h1ZmZsZXMgYSBnaXZlbiBhcnJheSBhbmQgcmV0dXJucyB0aGUgc2h1ZmZsZWQgdmVyc2lvbi5cclxuICogQHBhcmFtIHtBcnJheTxUPn0gYXJyYXkgVGhlIGFycmF5IHRvIHNodWZmbGUgYnV0IG5vdCBtdXRhdGUuXHJcbiAqIEByZXR1cm5zIHtBcnJheTxUPn0gYSBzaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBhcnJheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlPFQ+IChhcnJheTogQXJyYXk8VD4pIHtcclxuICBjb25zdCBjbG9uZUFyciA9IFsuLi5hcnJheV1cclxuICBsZXQgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoXHJcbiAgbGV0IHJhbmRvbUluZGV4XHJcblxyXG4gIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgd2hpbGUgKGN1cnJlbnRJbmRleCAhPT0gMCkge1xyXG4gICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleClcclxuICAgIGN1cnJlbnRJbmRleC0tO1xyXG5cclxuICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgIFtjbG9uZUFycltjdXJyZW50SW5kZXhdLCBjbG9uZUFycltyYW5kb21JbmRleF1dID0gW1xyXG4gICAgICBjbG9uZUFycltyYW5kb21JbmRleF0sIGNsb25lQXJyW2N1cnJlbnRJbmRleF1dXHJcbiAgfVxyXG5cclxuICByZXR1cm4gY2xvbmVBcnJcclxufVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyLCB0aHJvd0V4cHJlc3Npb24gfSBmcm9tICcuL2NvbmZpZydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBkaXNwbGF5VXNlcm5hbWUgfSBmcm9tICcuL3VzZXItZGF0YSdcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0lmSGFzVG9rZW5zICgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICBsZXQgaGFzVG9rZW4gPSBmYWxzZVxyXG4gIC8vIGF3YWl0IHByb21pc2UgcmVzb2x2ZSB0aGF0IHJldHVybnMgd2hldGhlciB0aGUgc2Vzc2lvbiBoYXMgdG9rZW5zLlxyXG4gIGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEhhc1Rva2VucyksXHJcbiAgICAocmVzKSA9PiB7XHJcbiAgICAgIGhhc1Rva2VuID0gcmVzLmRhdGFcclxuICAgIH1cclxuICApXHJcblxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VG9rZW5zICgpIHtcclxuICBsZXQgaGFzVG9rZW4gPSBmYWxzZVxyXG4gIC8vIGNyZWF0ZSBhIHBhcmFtZXRlciBzZWFyY2hlciBpbiB0aGUgVVJMIGFmdGVyICc/JyB3aGljaCBob2xkcyB0aGUgcmVxdWVzdHMgYm9keSBwYXJhbWV0ZXJzXHJcbiAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxyXG5cclxuICAvLyBHZXQgdGhlIGNvZGUgZnJvbSB0aGUgcGFyYW1ldGVyIGNhbGxlZCAnY29kZScgaW4gdGhlIHVybCB3aGljaFxyXG4gIC8vIGhvcGVmdWxseSBjYW1lIGJhY2sgZnJvbSB0aGUgc3BvdGlmeSBHRVQgcmVxdWVzdCBvdGhlcndpc2UgaXQgaXMgbnVsbFxyXG4gIGxldCBhdXRoQ29kZSA9IHVybFBhcmFtcy5nZXQoJ2NvZGUnKVxyXG5cclxuICBpZiAoYXV0aENvZGUpIHtcclxuICAgIC8vIG9idGFpbiB0b2tlbnNcclxuICAgIGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0T2J0YWluVG9rZW5zUHJlZml4KGF1dGhDb2RlKSksXHJcblxyXG4gICAgICAvLyBpZiB0aGUgcmVxdWVzdCB3YXMgc3VjY2VzZnVsIHdlIGhhdmUgcmVjaWV2ZWQgYSB0b2tlblxyXG4gICAgICAoKSA9PiB7XHJcbiAgICAgICAgaGFzVG9rZW4gPSB0cnVlXHJcbiAgICAgIH1cclxuICAgIClcclxuICAgIGF1dGhDb2RlID0gJydcclxuXHJcbiAgICAvLyBnZXQgdXNlciBpbmZvIGZyb20gc3BvdGlmeVxyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEN1cnJlbnRVc2VyUHJvZmlsZSkpXHJcbiAgfVxyXG5cclxuICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgJycsICcvJylcclxuICByZXR1cm4gaGFzVG9rZW5cclxufVxyXG5cclxuLyoqIEdlbmVyYXRlIGEgbG9naW4vY2hhbmdlIGFjY291bnQgbGluay4gRGVmYXVsdHMgdG8gYXBwZW5kaW5nIGl0IG9udG8gdGhlIG5hdiBiYXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gY2xhc3Nlc1RvQWRkIC0gdGhlIGNsYXNzZXMgdG8gYWRkIG9udG8gdGhlIGxpbmsuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2hhbmdlQWNjb3VudCAtIFdoZXRoZXIgdGhlIGxpbmsgc2hvdWxkIGJlIGZvciBjaGFuZ2luZyBhY2NvdW50LCBvciBmb3IgbG9nZ2luZyBpbi4gKGRlZmF1bHRzIHRvIHRydWUpXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmVudEVsIC0gdGhlIHBhcmVudCBlbGVtZW50IHRvIGFwcGVuZCB0aGUgbGluayBvbnRvLiAoZGVmYXVsdHMgdG8gbmF2YmFyKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlTG9naW4gKHtcclxuICBjbGFzc2VzVG9BZGQgPSBbJ3JpZ2h0J10sXHJcbiAgY2hhbmdlQWNjb3VudCA9IHRydWUsXHJcbiAgcGFyZW50RWwgPSBkb2N1bWVudFxyXG4gICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RvcG5hdicpWzBdXHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncmlnaHQnKVswXVxyXG4gICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Ryb3Bkb3duLWNvbnRlbnQnKVswXVxyXG59ID0ge30pIHtcclxuICAvLyBDcmVhdGUgYW5jaG9yIGVsZW1lbnQuXHJcbiAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxyXG4gIGEuaHJlZiA9IGNvbmZpZy5VUkxzLmF1dGhcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSB0ZXh0IG5vZGUgZm9yIGFuY2hvciBlbGVtZW50LlxyXG4gIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgIGNoYW5nZUFjY291bnQgPyAnQ2hhbmdlIEFjY291bnQnIDogJ0xvZ2luIFRvIFNwb3RpZnknXHJcbiAgKVxyXG5cclxuICAvLyBBcHBlbmQgdGhlIHRleHQgbm9kZSB0byBhbmNob3IgZWxlbWVudC5cclxuICBhLmFwcGVuZENoaWxkKGxpbmspXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzVG9BZGQubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IGNsYXNzVG9BZGQgPSBjbGFzc2VzVG9BZGRbaV1cclxuICAgIGEuY2xhc3NMaXN0LmFkZChjbGFzc1RvQWRkKVxyXG4gIH1cclxuXHJcbiAgLy8gY2xlYXIgY3VycmVudCB0b2tlbnMgd2hlbiBjbGlja2VkXHJcbiAgYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRDbGVhclRva2VucykuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKVxyXG4gIH0pXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgYW5jaG9yIGVsZW1lbnQgdG8gdGhlIHBhcmVudC5cclxuICBwYXJlbnRFbC5hcHBlbmRDaGlsZChhKVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxUb2tlbkNhbGwgKFxyXG4gIGhhc1Rva2VuOiBib29sZWFuLFxyXG4gIGhhc1Rva2VuQ2FsbGJhY2sgPSAoKSA9PiB7IH0sXHJcbiAgbm9Ub2tlbkNhbGxCYWNrID0gKCkgPT4geyB9LFxyXG4gIHJlZGlyZWN0SG9tZSA9IHRydWVcclxuKSB7XHJcbiAgY29uc3QgZ2V0VG9rZW5zU3Bpbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gICAgY29uZmlnLkNTUy5JRHMuZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lclxyXG4gIClcclxuXHJcbiAgLy8gcmVtb3ZlIHRva2VuIHNwaW5uZXIgYmVjYXVzZSBieSB0aGlzIGxpbmUgd2UgaGF2ZSBvYnRhaW5lZCB0aGUgdG9rZW5cclxuICBnZXRUb2tlbnNTcGlubmVyPy5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChnZXRUb2tlbnNTcGlubmVyKVxyXG5cclxuICBjb25zdCBpbmZvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuaW5mb0NvbnRhaW5lcilcclxuXHJcbiAgLy8gZ2VuZXJhdGUgdGhlIG5hdiBsb2dpblxyXG4gIGdlbmVyYXRlTG9naW4oeyBjaGFuZ2VBY2NvdW50OiBoYXNUb2tlbiwgcGFyZW50RWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnRvcE5hdk1vYmlsZSkgPz8gdGhyb3dFeHByZXNzaW9uKCdObyB0b3AgbmF2IG1vYmlsZSBlbGVtZW50IGZvdW5kJykgfSlcclxuICBnZW5lcmF0ZUxvZ2luKHsgY2hhbmdlQWNjb3VudDogaGFzVG9rZW4gfSlcclxuICBpZiAoaGFzVG9rZW4pIHtcclxuICAgIGlmIChpbmZvQ29udGFpbmVyID09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZvIGNvbnRhaW5lciBFbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIH1cclxuICAgIGluZm9Db250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgIGRpc3BsYXlVc2VybmFtZSgpXHJcbiAgICBjb25zb2xlLmxvZygnZGlzcGxheSB1c2VybmFtZScpXHJcbiAgICBoYXNUb2tlbkNhbGxiYWNrKClcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gdG9rZW4gcmVkaXJlY3QgdG8gYWxsb3cgYWNjZXNzIHBhZ2VcclxuICAgIGlmIChyZWRpcmVjdEhvbWUpIHsgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBjb25maWcuVVJMcy5zaXRlVXJsIH1cclxuICAgIG5vVG9rZW5DYWxsQmFjaygpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBBcnRpc3QsIHsgZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2FydGlzdCdcclxuaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgcHJvbWlzZUhhbmRsZXIsXHJcbiAgaHRtbFRvRWwsXHJcbiAgcmVtb3ZlQWxsQ2hpbGROb2RlcyxcclxuICBhbmltYXRpb25Db250cm9sLFxyXG4gIHRocm93RXhwcmVzc2lvblxyXG59IGZyb20gJy4uLy4uL2NvbmZpZydcclxuaW1wb3J0IFNlbGVjdGFibGVUYWJFbHMgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9TZWxlY3RhYmxlVGFiRWxzJ1xyXG5pbXBvcnQge1xyXG4gIGNoZWNrSWZIYXNUb2tlbnMsXHJcbiAgb25TdWNjZXNzZnVsVG9rZW5DYWxsXHJcbn0gZnJvbSAnLi4vLi4vbWFuYWdlLXRva2VucydcclxuaW1wb3J0IEFzeW5jU2VsZWN0aW9uVmVyaWYgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hc3luY1NlbGVjdGlvblZlcmlmJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcbmltcG9ydCB7IGRldGVybWluZVRlcm0sIGxvYWRUZXJtLCBzYXZlVGVybSwgc2VsZWN0U3RhcnRUZXJtVGFiLCBURVJNUywgVEVSTV9UWVBFIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9zYXZlLWxvYWQtdGVybSdcclxuXHJcbmNvbnN0IE1BWF9WSUVXQUJMRV9DQVJEUyA9IDVcclxuXHJcbmNvbnN0IGFydGlzdEFjdGlvbnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGNvbnN0IHNlbGVjdGlvbnMgPSB7XHJcbiAgICBudW1WaWV3YWJsZUNhcmRzOiBNQVhfVklFV0FCTEVfQ0FSRFMsXHJcbiAgICB0ZXJtOiBURVJNUy5TSE9SVF9URVJNXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGxvYWRBcnRpc3RUb3BUcmFja3MgKGFydGlzdE9iajogQXJ0aXN0LCBjYWxsYmFjazogRnVuY3Rpb24pIHtcclxuICAgIGFydGlzdE9ialxyXG4gICAgICAubG9hZFRvcFRyYWNrcygpXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBjYWxsYmFjaygpXHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaCgoZXJyOiB1bmtub3duKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoZW4gbG9hZGluZyBhcnRpc3RzJylcclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgICAgfSlcclxuICB9XHJcbiAgZnVuY3Rpb24gc2hvd1RvcFRyYWNrcyAoYXJ0aXN0T2JqOiBBcnRpc3QpIHtcclxuICAgIGxvYWRBcnRpc3RUb3BUcmFja3MoYXJ0aXN0T2JqLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRyYWNrTGlzdCA9IGdldFRvcFRyYWNrc1VsRnJvbUFydGlzdChhcnRpc3RPYmopXHJcbiAgICAgIGxldCByYW5rID0gMVxyXG4gICAgICBpZiAoYXJ0aXN0T2JqLnRvcFRyYWNrcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhyb3dFeHByZXNzaW9uKCdhcnRpc3QgZG9lcyBub3QgaGF2ZSB0b3AgdHJhY2tzIGxvYWRlZCBvbiByZXF1ZXN0IHRvIHNob3cgdGhlbScpXHJcbiAgICAgIH1cclxuICAgICAgZm9yIChjb25zdCB0cmFjayBvZiBhcnRpc3RPYmoudG9wVHJhY2tzLnZhbHVlcygpKSB7XHJcbiAgICAgICAgdHJhY2tMaXN0LmFwcGVuZENoaWxkKHRyYWNrLmdldFJhbmtlZFRyYWNrSHRtbChhcnRpc3RPYmoudG9wVHJhY2tzLCByYW5rKSlcclxuICAgICAgICByYW5rKytcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFRvcFRyYWNrc1VsRnJvbUFydGlzdCAoYXJ0aXN0T2JqOiBBcnRpc3QpIHtcclxuICAgIGNvbnN0IGFydGlzdENhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhcnRpc3RPYmouY2FyZElkKSA/PyB0aHJvd0V4cHJlc3Npb24oJ2FydGlzdCBjYXJkIGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHRyYWNrTGlzdCA9IGFydGlzdENhcmQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMudHJhY2tMaXN0KVswXVxyXG5cclxuICAgIGlmICh0cmFja0xpc3QgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3dFeHByZXNzaW9uKGB0cmFjayB1bCBvbiBhcnRpc3QgZWxlbWVudCB3aXRoIGlkICR7YXJ0aXN0T2JqLmNhcmRJZH0gZG9lcyBub3QgZXhpc3RgKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRyYWNrTGlzdFxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gcmV0cmlldmVBcnRpc3RzIChhcnRpc3RBcnI6IEFycmF5PEFydGlzdD4pIHtcclxuICAgIGNvbnN0IHsgcmVzLCBlcnIgfSA9IGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0VG9wQXJ0aXN0cyArIHNlbGVjdGlvbnMudGVybSlcclxuICAgIClcclxuICAgIGlmIChlcnIpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICAvLyB3ZSBrbm93IHJlcyBpcyBub3QgbnVsbCBiZWNhdXNlIGl0IGlzIG9ubHkgbnVsbCBpZiBhbiBlcnJvciBleGlzdHMgaW4gd2hpY2ggd2UgaGF2ZSBhbHJlYWR5IHJldHVybmVkXHJcbiAgICBnZW5lcmF0ZUFydGlzdHNGcm9tRGF0YShyZXMhLmRhdGEsIGFydGlzdEFycilcclxuICB9XHJcbiAgZnVuY3Rpb24gZ2V0Q3VyclNlbFRvcEFydGlzdHMgKCkge1xyXG4gICAgaWYgKHNlbGVjdGlvbnMudGVybSA9PT0gVEVSTVMuU0hPUlRfVEVSTSkge1xyXG4gICAgICByZXR1cm4gYXJ0aXN0QXJycy50b3BBcnRpc3RPYmpzU2hvcnRUZXJtXHJcbiAgICB9IGVsc2UgaWYgKHNlbGVjdGlvbnMudGVybSA9PT0gVEVSTVMuTUlEX1RFUk0pIHtcclxuICAgICAgcmV0dXJuIGFydGlzdEFycnMudG9wQXJ0aXN0T2Jqc01pZFRlcm1cclxuICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9ucy50ZXJtID09PSBURVJNUy5MT05HX1RFUk0pIHtcclxuICAgICAgcmV0dXJuIGFydGlzdEFycnMudG9wQXJ0aXN0T2Jqc0xvbmdUZXJtXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHRyYWNrIHRlcm0gaXMgaW52YWxpZCAnICsgc2VsZWN0aW9ucy50ZXJtKVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgc2hvd1RvcFRyYWNrcyxcclxuICAgIHJldHJpZXZlQXJ0aXN0cyxcclxuICAgIHNlbGVjdGlvbnMsXHJcbiAgICBnZXRDdXJyU2VsVG9wQXJ0aXN0c1xyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgYXJ0aXN0Q2FyZHNIYW5kbGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCBzZWxlY3Rpb25WZXJpZiA9IG5ldyBBc3luY1NlbGVjdGlvblZlcmlmPEFycmF5PEFydGlzdD4+KClcclxuICBjb25zdCBhcnRpc3RDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgIGNvbmZpZy5DU1MuSURzLmFydGlzdENhcmRzQ29udGFpbmVyXHJcbiAgKSA/PyB0aHJvd0V4cHJlc3Npb24oYGFydGlzdCBjb250YWluZXIgb2YgaWQgJHtjb25maWcuQ1NTLklEcy5hcnRpc3RDYXJkc0NvbnRhaW5lcn0gZG9lcyBub3QgZXhpc3RgKVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZXMgdGhlIGNhcmRzIHRvIHRoZSBET00gdGhlbiBtYWtlcyB0aGVtIHZpc2libGVcclxuICAgKiBAcGFyYW0ge0FycmF5PEFydGlzdD59IGFydGlzdEFyciBhcnJheSBvZiB0cmFjayBvYmplY3RzIHdob3NlIGNhcmRzIHNob3VsZCBiZSBnZW5lcmF0ZWQuXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBhdXRvQXBwZWFyIHdoZXRoZXIgdG8gc2hvdyB0aGUgY2FyZCB3aXRob3V0IGFuaW1hdGlvbiBvciB3aXRoIGFuaW1hdGlvbi5cclxuICAgKiBAcmV0dXJucyB7QXJyYXk8SFRNTEVsZW1lbnQ+fSBhcnJheSBvZiB0aGUgY2FyZCBlbGVtZW50cy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBnZW5lcmF0ZUNhcmRzIChhcnRpc3RBcnI6IEFycmF5PEFydGlzdD4sIGF1dG9BcHBlYXI6IEJvb2xlYW4pIHtcclxuICAgIHJlbW92ZUFsbENoaWxkTm9kZXMoYXJ0aXN0Q29udGFpbmVyKVxyXG4gICAgLy8gZmlsbCBhcnIgb2YgY2FyZCBlbGVtZW50cyBhbmQgYXBwZW5kIHRoZW0gdG8gRE9NXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFydGlzdEFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoaSA8IGFydGlzdEFjdGlvbnMuc2VsZWN0aW9ucy5udW1WaWV3YWJsZUNhcmRzKSB7XHJcbiAgICAgICAgY29uc3QgYXJ0aXN0T2JqID0gYXJ0aXN0QXJyW2ldXHJcbiAgICAgICAgY29uc3QgY2FyZEh0bWwgPSBhcnRpc3RPYmouZ2V0QXJ0aXN0SHRtbChpKVxyXG5cclxuICAgICAgICBhcnRpc3RDb250YWluZXIuYXBwZW5kQ2hpbGQoY2FyZEh0bWwpXHJcblxyXG4gICAgICAgIGFydGlzdEFjdGlvbnMuc2hvd1RvcFRyYWNrcyhhcnRpc3RPYmopXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCFhdXRvQXBwZWFyKSB7XHJcbiAgICAgIGFuaW1hdGlvbkNvbnRyb2wuYWRkQ2xhc3NPbkludGVydmFsKFxyXG4gICAgICAgICcuJyArIGNvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3QsXHJcbiAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhcixcclxuICAgICAgICAyNVxyXG4gICAgICApXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCZWdpbnMgcmV0cmlldmluZyBhcnRpc3RzIHRoZW4gd2hlbiBkb25lIHZlcmlmaWVzIGl0IGlzIHRoZSBjb3JyZWN0IHNlbGVjdGVkIGFydGlzdC5cclxuICAgKiBAcGFyYW0ge0FycmF5PEFydGlzdD59IGFydGlzdEFyciBhcnJheSB0byBsb2FkIGFydGlzdHMgaW50by5cclxuICAgKi9cclxuICBmdW5jdGlvbiBzdGFydExvYWRpbmdBcnRpc3RzIChhcnRpc3RBcnI6IEFycmF5PEFydGlzdD4pIHtcclxuICAgIC8vIGluaXRpYWxseSBzaG93IHRoZSBsb2FkaW5nIHNwaW5uZXJcclxuICAgIGNvbnN0IGh0bWxTdHJpbmcgPSBgXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5zcGlubmVyfVwiIGFsdD1cIkxvYWRpbmcuLi5cIiAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5gXHJcbiAgICBjb25zdCBzcGlubmVyRWwgPSBodG1sVG9FbChodG1sU3RyaW5nKVxyXG5cclxuICAgIHJlbW92ZUFsbENoaWxkTm9kZXMoYXJ0aXN0Q29udGFpbmVyKVxyXG4gICAgYXJ0aXN0Q29udGFpbmVyLmFwcGVuZENoaWxkKHNwaW5uZXJFbCBhcyBOb2RlKVxyXG5cclxuICAgIGFydGlzdEFjdGlvbnMucmV0cmlldmVBcnRpc3RzKGFydGlzdEFycikudGhlbigoKSA9PiB7XHJcbiAgICAgIC8vIGFmdGVyIHJldHJpZXZpbmcgYXN5bmMgdmVyaWZ5IGlmIGl0IGlzIHRoZSBzYW1lIGFyciBvZiBBcnRpc3QncyBhcyB3aGF0IHdhcyBzZWxlY3RlZFxyXG4gICAgICBpZiAoIXNlbGVjdGlvblZlcmlmLmlzVmFsaWQoYXJ0aXN0QXJyKSkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBnZW5lcmF0ZUNhcmRzKGFydGlzdEFyciwgZmFsc2UpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqIExvYWQgYXJ0aXN0IG9iamVjdHMgaWYgbm90IGxvYWRlZCwgdGhlbiBnZW5lcmF0ZSBjYXJkcyB3aXRoIHRoZSBvYmplY3RzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheTxBcnRpc3Q+fSBhcnRpc3RBcnIgLSBMaXN0IG9mIHRyYWNrIG9iamVjdHMgd2hvc2UgY2FyZHMgc2hvdWxkIGJlIGdlbmVyYXRlZCBvclxyXG4gICAqIGVtcHR5IGxpc3QgdGhhdCBzaG91bGQgYmUgZmlsbGVkIHdoZW4gbG9hZGluZyB0cmFja3MuXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBhdXRvQXBwZWFyIHdoZXRoZXIgdG8gc2hvdyB0aGUgY2FyZHMgd2l0aG91dCBhbmltYXRpb24uXHJcbiAgICogQHJldHVybnMge0FycmF5PEhUTUxFbGVtZW50Pn0gbGlzdCBvZiBDYXJkIEhUTUxFbGVtZW50J3MuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZGlzcGxheUFydGlzdENhcmRzIChhcnRpc3RBcnI6IEFycmF5PEFydGlzdD4sIGF1dG9BcHBlYXIgPSBmYWxzZSkge1xyXG4gICAgc2VsZWN0aW9uVmVyaWYuc2VsZWN0aW9uQ2hhbmdlZChhcnRpc3RBcnIpXHJcbiAgICBpZiAoYXJ0aXN0QXJyLmxlbmd0aCA+IDApIHtcclxuICAgICAgZ2VuZXJhdGVDYXJkcyhhcnRpc3RBcnIsIGF1dG9BcHBlYXIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGFydExvYWRpbmdBcnRpc3RzKGFydGlzdEFycilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkaXNwbGF5QXJ0aXN0Q2FyZHNcclxuICB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGFydGlzdEFycnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGNvbnN0IHRvcEFydGlzdE9ianNTaG9ydFRlcm06IEFycmF5PEFydGlzdD4gPSBbXVxyXG4gIGNvbnN0IHRvcEFydGlzdE9ianNNaWRUZXJtOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuICBjb25zdCB0b3BBcnRpc3RPYmpzTG9uZ1Rlcm06IEFycmF5PEFydGlzdD4gPSBbXVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdG9wQXJ0aXN0T2Jqc1Nob3J0VGVybSxcclxuICAgIHRvcEFydGlzdE9ianNNaWRUZXJtLFxyXG4gICAgdG9wQXJ0aXN0T2Jqc0xvbmdUZXJtXHJcbiAgfVxyXG59KSgpXHJcblxyXG5jb25zdCBhcnRpc3RUZXJtU2VsZWN0aW9ucyA9IGRvY3VtZW50XHJcbiAgLmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmFydGlzdFRlcm1TZWxlY3Rpb25zKSA/PyB0aHJvd0V4cHJlc3Npb24oYHRlcm0gc2VsZWN0aW9uIG9mIGlkICR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0VGVybVNlbGVjdGlvbnN9IGRvZXMgbm90IGV4aXN0YClcclxuY29uc3Qgc2VsZWN0aW9ucyA9IHtcclxuICB0ZXJtVGFiTWFuYWdlcjogbmV3IFNlbGVjdGFibGVUYWJFbHMoKVxyXG59XHJcblxyXG5jb25zdCBhZGRFdmVudExpc3RlbmVycyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gYWRkQXJ0aXN0VGVybUJ1dHRvbkV2ZW50cyAoKSB7XHJcbiAgICBmdW5jdGlvbiBvbkNsaWNrIChidG46IEVsZW1lbnQsIGJvcmRlckNvdmVyOiBFbGVtZW50KSB7XHJcbiAgICAgIGNvbnN0IGF0dHIgPSBidG4uZ2V0QXR0cmlidXRlKFxyXG4gICAgICAgIGNvbmZpZy5DU1MuQVRUUklCVVRFUy5kYXRhU2VsZWN0aW9uXHJcbiAgICAgICkgPz8gdGhyb3dFeHByZXNzaW9uKGBhdHRyaWJ1dGUgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMuZGF0YVNlbGVjdGlvbn0gZG9lcyBub3QgZXhpc3Qgb24gdGVybSBidXR0b25gKVxyXG5cclxuICAgICAgYXJ0aXN0QWN0aW9ucy5zZWxlY3Rpb25zLnRlcm0gPSBkZXRlcm1pbmVUZXJtKGF0dHIpXHJcblxyXG4gICAgICBzYXZlVGVybShhcnRpc3RBY3Rpb25zLnNlbGVjdGlvbnMudGVybSwgVEVSTV9UWVBFLkFSVElTVFMpXHJcbiAgICAgIHNlbGVjdGlvbnMudGVybVRhYk1hbmFnZXIuc2VsZWN0TmV3VGFiKGJ0biwgYm9yZGVyQ292ZXIpXHJcblxyXG4gICAgICBjb25zdCBjdXJyQXJ0aXN0cyA9IGFydGlzdEFjdGlvbnMuZ2V0Q3VyclNlbFRvcEFydGlzdHMoKVxyXG4gICAgICBhcnRpc3RDYXJkc0hhbmRsZXIuZGlzcGxheUFydGlzdENhcmRzKGN1cnJBcnRpc3RzKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFydGlzdFRlcm1CdG5zID0gYXJ0aXN0VGVybVNlbGVjdGlvbnMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2J1dHRvbicpXHJcbiAgICBjb25zdCB0cmFja1Rlcm1Cb3JkZXJDb3ZlcnMgPSBhcnRpc3RUZXJtU2VsZWN0aW9ucy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5ib3JkZXJDb3ZlcilcclxuXHJcbiAgICBpZiAodHJhY2tUZXJtQm9yZGVyQ292ZXJzLmxlbmd0aCAhPT0gYXJ0aXN0VGVybUJ0bnMubGVuZ3RoKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhbGwgdHJhY2sgdGVybSBidXR0b25zIGNvbnRhaW4gYSBib3JkZXIgY292ZXInKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJ0aXN0VGVybUJ0bnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgYnRuID0gYXJ0aXN0VGVybUJ0bnNbaV1cclxuICAgICAgY29uc3QgYm9yZGVyQ292ZXIgPSB0cmFja1Rlcm1Cb3JkZXJDb3ZlcnNbaV1cclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb25DbGljayhidG4sIGJvcmRlckNvdmVyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhZGRBcnRpc3RUZXJtQnV0dG9uRXZlbnRzXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICBwcm9taXNlSGFuZGxlcjxib29sZWFuPihjaGVja0lmSGFzVG9rZW5zKCksIChoYXNUb2tlbikgPT5cclxuICAgIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbChoYXNUb2tlbiwgKCkgPT4ge1xyXG4gICAgICBsb2FkVGVybShURVJNX1RZUEUuQVJUSVNUUykudGhlbih0ZXJtID0+IHtcclxuICAgICAgICBhcnRpc3RBY3Rpb25zLnNlbGVjdGlvbnMudGVybSA9IHRlcm1cclxuICAgICAgICBhcnRpc3RDYXJkc0hhbmRsZXIuZGlzcGxheUFydGlzdENhcmRzKGFydGlzdEFjdGlvbnMuZ2V0Q3VyclNlbFRvcEFydGlzdHMoKSlcclxuICAgICAgICBzZWxlY3RTdGFydFRlcm1UYWIodGVybSwgc2VsZWN0aW9ucy50ZXJtVGFiTWFuYWdlciwgYXJ0aXN0VGVybVNlbGVjdGlvbnMpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIClcclxuICBPYmplY3QuZW50cmllcyhhZGRFdmVudExpc3RlbmVycykuZm9yRWFjaCgoWywgYWRkRXZlbnRMaXN0ZW5lcl0pID0+IHtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoKVxyXG4gIH0pXHJcbn0pKClcclxuIiwiaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgY29uZmlnLCBwcm9taXNlSGFuZGxlciB9IGZyb20gJy4vY29uZmlnJ1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlVc2VybmFtZSAoKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0VXNlcm5hbWUgfSksIChyZXMpID0+IHtcclxuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMudXNlcm5hbWUpXHJcbiAgICBpZiAodXNlcm5hbWUpIHtcclxuICAgICAgdXNlcm5hbWUudGV4dENvbnRlbnQgPSByZXMuZGF0YVxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3B1YmxpYy9wYWdlcy90b3AtYXJ0aXN0cy1wYWdlL3RvcC1hcnRpc3RzLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9