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

    // Listen for ready state
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

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
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
    };

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
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
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
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
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

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
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
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
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
  config.data = transformData(
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
    response.data = transformData(
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
        reason.response.data = transformData(
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

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
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

var defaults = {
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
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
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

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

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
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
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
exports.default = Album;


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
                if ((_a = evt.target) === null || _a === void 0 ? void 0 : _a.getAttribute('data-restrict-flip-on-click')) {
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
exports.default = CardActionsHandler;


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
                // this takes too long and spotify sdk needs window.onSpotifyWebPlaybackSDKReady to be defined quicker.
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
        if (currNode === null) {
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
                    const prevTrack = currNode.previous.data;
                    this.setSelPlayingEl(new track_play_args_1.default(prevTrack, currNode.previous, this.selPlaying.playableArr));
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
    shufflePlayables() {
        if (this.selPlaying.playableArr == null || this.selPlaying.playableNode == null)
            throw new Error('no sel playing');
        const selPlayable = this.selPlaying.playableNode.data;
        console.log('shuffle');
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
            // assign the new node that points to a shuffled version of the current playlist as the current node
            return newNode;
        }
        else {
            // get the new node which has identical data as the old one, but is now part of the shuffled doubly linked list
            newNode = shuffledList.get(0, true);
            this.selPlaying.playableNode = newNode;
            return newNode;
        }
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
            const tracksData = res.data.map((data) => data.track);
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
exports.default = Playlist;


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
    <article id="${config_1.config.CSS.IDs.webPlayer}" class="resize-drag">
      <img class="${config_1.config.CSS.CLASSES.column}" src="${config_1.config.PATHS.profileUser}" alt="track" id="${config_1.config.CSS.IDs.playerTrackImg}"/>
      <div class="${config_1.config.CSS.CLASSES.column}" style="flex-basis: 30%; max-width: 18.5vw;">
        <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap}">Select a Song</h4>
        <span id="${config_1.config.CSS.IDs.webPlayerArtists}"></span>
      </div>
      <div class="${config_1.config.CSS.CLASSES.webPlayerControls} ${config_1.config.CSS.CLASSES.column}">
        <div>
          <article id="web-player-buttons">
            <button id="${config_1.config.CSS.IDs.shuffle}"><img src="${config_1.config.PATHS.shuffleIcon}"/></button>
            <button id="${config_1.config.CSS.IDs.playPrev}" class="${config_1.config.CSS.CLASSES.expandOnHover}"><img src="${config_1.config.PATHS.playPrev}" alt="previous"/></button>
            <button id="${config_1.config.CSS.IDs.webPlayerPlayPause}" class="${config_1.config.CSS.CLASSES.playBtn}"></button>
            <button id="${config_1.config.CSS.IDs.playNext}" class="${config_1.config.CSS.CLASSES.expandOnHover}"><img src="${config_1.config.PATHS.playNext}" alt="next"/></button>
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
            removeEarlyAdded: 'remove-early-added',
            getTokenLoadingSpinner: 'get-token-loading-spinner',
            playlistCardsContainer: 'playlist-cards-container',
            trackCardsContainer: 'track-cards-container',
            playlistPrefix: 'playlist-',
            trackPrefix: 'track-',
            spotifyContainer: 'spotify-container',
            infoContainer: 'info-container',
            allowAccessHeader: 'allow-access-header',
            expandedPlaylistMods: 'expanded-playlist-mods',
            playlistMods: 'playlist-mods',
            tracksData: 'tracks-data',
            tracksChart: 'tracks-chart',
            tracksTermSelections: 'tracks-term-selections',
            featureSelections: 'feature-selections',
            playlistsSection: 'playlists-section',
            undo: 'undo',
            redo: 'redo',
            modsOpener: 'mods-opener',
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
        acousticEmoji: '/images/Emojis/AcousticEmoji.svg',
        nonAcousticEmoji: '/images/Emojis/ElectricGuitarEmoji.svg',
        happyEmoji: '/images/Emojis/HappyEmoji.svg',
        neutralEmoji: '/images/Emojis/NeutralEmoji.svg',
        sadEmoji: '/images/Emojis/SadEmoji.svg',
        instrumentEmoji: '/images/Emojis/InstrumentEmoji.svg',
        singerEmoji: '/images/Emojis/SingerEmoji.svg',
        dancingEmoji: '/images/Emojis/DancingEmoji.svg',
        sheepEmoji: '/images/Emojis/SheepEmoji.svg',
        wolfEmoji: '/images/Emojis/WolfEmoji.svg',
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
function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
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
function checkIfHasTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        // if the user stays on the same page for 30 min refresh the token.
        const startRefreshInterval = () => {
            console.log('start interval refresh');
            setInterval(() => {
                (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putRefreshAccessToken));
                console.log('refresh async');
            }, HALF_HOUR);
        };
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
            () => (hasToken = true));
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
            .on('resizeend', saveLoad.saveResizeWidth);
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
        config_1.animationControl.animateAttributes('.playlist', config_1.config.CSS.CLASSES.appear, 0);
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
    function addDeleteRecentlyAddedTrackEvent() {
        var _a, _b;
        function onClick() {
            if (numToRemoveInput === undefined) {
                throw new Error('number to remove input is not found');
            }
            const numToRemove = parseInt(numToRemoveInput.value);
            if (numToRemove > selPlaylistTracks().size ||
                numToRemove === 0) {
                console.log('cant remove this many');
                // the user is trying to delete more songs then there are available, you may want to allow this
                return;
            }
            const orderedTracks = manageTracks.orderTracksByDateAdded(selPlaylistTracks());
            const tracksToRemove = orderedTracks.slice(0, numToRemove);
            // remove songs contained in tracksToRemove from expandablePlaylistTracks
            tracksToRemove.forEach((trackToRemove) => {
                const idx = selPlaylistTracks().findIndex((track) => track.id === trackToRemove.id);
                selPlaylistTracks().remove(idx);
            });
            playlistActions.playlistSelVerif.currSelectedValNoNull.addToUndoStack(tracksToRemove);
            // not same order as some have been deleted
            manageTracks.sortExpandedTracksToOrder(false);
            const trackUris = tracksToRemove.map((track) => { return { uri: track.uri }; });
            (0, config_1.promiseHandler)(axios_1.default.delete(config_1.config.URLs.deletePlaylistTracks(playlistActions.playlistSelVerif.currSelectedValNoNull.id), {
                data: { track_uris: trackUris }
            }));
        }
        const numToRemoveInput = (_a = document
            .getElementById(config_1.config.CSS.IDs.removeEarlyAdded)) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('input')[0];
        const removeBtn = (_b = document
            .getElementById(config_1.config.CSS.IDs.removeEarlyAdded)) === null || _b === void 0 ? void 0 : _b.getElementsByTagName('button')[0];
        removeBtn === null || removeBtn === void 0 ? void 0 : removeBtn.addEventListener('click', () => onClick());
    }
    function addUndoPlaylistTrackDeleteEvent() {
        function onClick() {
            const currPlaylist = playlistActions.playlistSelVerif.currSelectedValNoNull;
            if (!currPlaylist || currPlaylist.undoStack.length === 0) {
                return;
            }
            const undonePlaylistId = currPlaylist.id;
            const tracksRemoved = currPlaylist.undoStack.pop();
            const trackUris = tracksRemoved.map((track) => track.uri);
            (0, config_1.promiseHandler)(axios_1.default.post(config_1.config.URLs.postPlaylistTracks(currPlaylist.id), {
                track_uris: trackUris
            }), () => {
                // if the request was succesful and the user is
                // still looking at the playlist that was undone back, reload it.
                if (undonePlaylistId ===
                    playlistActions.playlistSelVerif.currSelectedValNoNull.id) {
                    // reload the playlist after adding tracks in order to show the tracks added back
                    playlistActions.showPlaylistTracks(playlistActions.playlistSelVerif.currSelectedValNoNull);
                }
            });
        }
        const undoBtn = document.getElementById(config_1.config.CSS.IDs.undo);
        undoBtn === null || undoBtn === void 0 ? void 0 : undoBtn.addEventListener('click', () => onClick());
    }
    function addModsOpenerEvent() {
        const modsSection = document.getElementById(config_1.config.CSS.IDs.playlistMods);
        const openModsSection = document.getElementById(config_1.config.CSS.IDs.modsOpener);
        const wrenchIcon = openModsSection === null || openModsSection === void 0 ? void 0 : openModsSection.getElementsByTagName('img')[0];
        openModsSection === null || openModsSection === void 0 ? void 0 : openModsSection.addEventListener('click', () => {
            // expand mods section
            modsSection === null || modsSection === void 0 ? void 0 : modsSection.classList.toggle(config_1.config.CSS.CLASSES.appear);
            // select the wrench image
            wrenchIcon === null || wrenchIcon === void 0 ? void 0 : wrenchIcon.classList.toggle(config_1.config.CSS.CLASSES.selected);
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
                saveLoad.savePlaylistForm(true);
                convertImg.src = config_1.config.PATHS.gridView;
            }
            else {
                saveLoad.savePlaylistForm(false);
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
        addDeleteRecentlyAddedTrackEvent,
        addUndoPlaylistTrackDeleteEvent,
        addModsOpenerEvent,
        addConvertCards,
        addHideShowPlaylistTxt
    };
})();
const saveLoad = (function () {
    function saveResizeWidth() {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlaylistResizeData(cardResizeContainer.getBoundingClientRect().width.toString())));
    }
    function savePlaylistForm(isInTextForm) {
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlaylistIsInTextFormData(String(isInTextForm))));
    }
    return {
        saveResizeWidth,
        savePlaylistForm
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
            (0, config_1.promiseHandler)(infoRetrieval.getInitialInfo(), () => config_1.animationControl.animateAttributes('.playlist,#expanded-playlist-mods', config_1.config.CSS.CLASSES.appear, 25), () => console.log('Problem when getting information'));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxlQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNsSSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUNqRSxJQUFJLFFBQVEsRUFBRTtnQkFDWixRQUFRLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJO2FBQ2hDO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUFBO0FBUEQsMENBT0M7Ozs7Ozs7VUNWRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9pbnRlcmFjdGpzL2Rpc3QvaW50ZXJhY3QubWluLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FsYnVtLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FzeW5jU2VsZWN0aW9uVmVyaWYudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvY2FyZC1hY3Rpb25zLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2NhcmQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3BsYXliYWNrLXNkay50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wbGF5bGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvYWdncmVnYXRvci50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL3N1YnNjcmlwdGlvbi50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXliYWNrLWVsZW1lbnQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvdHJhY2sudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbmZpZy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvbWFuYWdlLXRva2Vucy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvcGFnZXMvcGxheWxpc3RzLXBhZ2UvcGxheWxpc3RzLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy91c2VyLWRhdGEudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JykgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8qIGludGVyYWN0LmpzIDEuMTAuMTEgfCBodHRwczovL2ludGVyYWN0anMuaW8vbGljZW5zZSAqL1xuIWZ1bmN0aW9uKHQpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPXQoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLHQpOihcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOnRoaXMpLmludGVyYWN0PXQoKX0oKGZ1bmN0aW9uKCl7dmFyIHQ9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5kZWZhdWx0PXZvaWQgMCx0LmRlZmF1bHQ9ZnVuY3Rpb24odCl7cmV0dXJuISghdHx8IXQuV2luZG93KSYmdCBpbnN0YW5jZW9mIHQuV2luZG93fTt2YXIgZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlLmluaXQ9byxlLmdldFdpbmRvdz1mdW5jdGlvbihlKXtyZXR1cm4oMCx0LmRlZmF1bHQpKGUpP2U6KGUub3duZXJEb2N1bWVudHx8ZSkuZGVmYXVsdFZpZXd8fHIud2luZG93fSxlLndpbmRvdz1lLnJlYWxXaW5kb3c9dm9pZCAwO3ZhciBuPXZvaWQgMDtlLnJlYWxXaW5kb3c9bjt2YXIgcj12b2lkIDA7ZnVuY3Rpb24gbyh0KXtlLnJlYWxXaW5kb3c9bj10O3ZhciBvPXQuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIik7by5vd25lckRvY3VtZW50IT09dC5kb2N1bWVudCYmXCJmdW5jdGlvblwiPT10eXBlb2YgdC53cmFwJiZ0LndyYXAobyk9PT1vJiYodD10LndyYXAodCkpLGUud2luZG93PXI9dH1lLndpbmRvdz1yLFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3cmJndpbmRvdyYmbyh3aW5kb3cpO3ZhciBpPXt9O2Z1bmN0aW9uIGEodCl7cmV0dXJuKGE9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShpLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGkuZGVmYXVsdD12b2lkIDA7dmFyIHM9ZnVuY3Rpb24odCl7cmV0dXJuISF0JiZcIm9iamVjdFwiPT09YSh0KX0sbD1mdW5jdGlvbih0KXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0fSx1PXt3aW5kb3c6ZnVuY3Rpb24obil7cmV0dXJuIG49PT1lLndpbmRvd3x8KDAsdC5kZWZhdWx0KShuKX0sZG9jRnJhZzpmdW5jdGlvbih0KXtyZXR1cm4gcyh0KSYmMTE9PT10Lm5vZGVUeXBlfSxvYmplY3Q6cyxmdW5jOmwsbnVtYmVyOmZ1bmN0aW9uKHQpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiB0fSxib29sOmZ1bmN0aW9uKHQpe3JldHVyblwiYm9vbGVhblwiPT10eXBlb2YgdH0sc3RyaW5nOmZ1bmN0aW9uKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0fSxlbGVtZW50OmZ1bmN0aW9uKHQpe2lmKCF0fHxcIm9iamVjdFwiIT09YSh0KSlyZXR1cm4hMTt2YXIgbj1lLmdldFdpbmRvdyh0KXx8ZS53aW5kb3c7cmV0dXJuL29iamVjdHxmdW5jdGlvbi8udGVzdChhKG4uRWxlbWVudCkpP3QgaW5zdGFuY2VvZiBuLkVsZW1lbnQ6MT09PXQubm9kZVR5cGUmJlwic3RyaW5nXCI9PXR5cGVvZiB0Lm5vZGVOYW1lfSxwbGFpbk9iamVjdDpmdW5jdGlvbih0KXtyZXR1cm4gcyh0KSYmISF0LmNvbnN0cnVjdG9yJiYvZnVuY3Rpb24gT2JqZWN0XFxiLy50ZXN0KHQuY29uc3RydWN0b3IudG9TdHJpbmcoKSl9LGFycmF5OmZ1bmN0aW9uKHQpe3JldHVybiBzKHQpJiZ2b2lkIDAhPT10Lmxlbmd0aCYmbCh0LnNwbGljZSl9fTtpLmRlZmF1bHQ9dTt2YXIgYz17fTtmdW5jdGlvbiBmKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247aWYoXCJkcmFnXCI9PT1lLnByZXBhcmVkLm5hbWUpe3ZhciBuPWUucHJlcGFyZWQuYXhpcztcInhcIj09PW4/KGUuY29vcmRzLmN1ci5wYWdlLnk9ZS5jb29yZHMuc3RhcnQucGFnZS55LGUuY29vcmRzLmN1ci5jbGllbnQueT1lLmNvb3Jkcy5zdGFydC5jbGllbnQueSxlLmNvb3Jkcy52ZWxvY2l0eS5jbGllbnQueT0wLGUuY29vcmRzLnZlbG9jaXR5LnBhZ2UueT0wKTpcInlcIj09PW4mJihlLmNvb3Jkcy5jdXIucGFnZS54PWUuY29vcmRzLnN0YXJ0LnBhZ2UueCxlLmNvb3Jkcy5jdXIuY2xpZW50Lng9ZS5jb29yZHMuc3RhcnQuY2xpZW50LngsZS5jb29yZHMudmVsb2NpdHkuY2xpZW50Lng9MCxlLmNvb3Jkcy52ZWxvY2l0eS5wYWdlLng9MCl9fWZ1bmN0aW9uIGQodCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwiZHJhZ1wiPT09bi5wcmVwYXJlZC5uYW1lKXt2YXIgcj1uLnByZXBhcmVkLmF4aXM7aWYoXCJ4XCI9PT1yfHxcInlcIj09PXIpe3ZhciBvPVwieFwiPT09cj9cInlcIjpcInhcIjtlLnBhZ2Vbb109bi5jb29yZHMuc3RhcnQucGFnZVtvXSxlLmNsaWVudFtvXT1uLmNvb3Jkcy5zdGFydC5jbGllbnRbb10sZS5kZWx0YVtvXT0wfX19T2JqZWN0LmRlZmluZVByb3BlcnR5KGMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksYy5kZWZhdWx0PXZvaWQgMDt2YXIgcD17aWQ6XCJhY3Rpb25zL2RyYWdcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuYWN0aW9ucyxuPXQuSW50ZXJhY3RhYmxlLHI9dC5kZWZhdWx0cztuLnByb3RvdHlwZS5kcmFnZ2FibGU9cC5kcmFnZ2FibGUsZS5tYXAuZHJhZz1wLGUubWV0aG9kRGljdC5kcmFnPVwiZHJhZ2dhYmxlXCIsci5hY3Rpb25zLmRyYWc9cC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLW1vdmVcIjpmLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1yZXN1bWVcIjpmLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6ZCxcImF1dG8tc3RhcnQ6Y2hlY2tcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5pbnRlcmFjdGFibGUscj10LmJ1dHRvbnMsbz1uLm9wdGlvbnMuZHJhZztpZihvJiZvLmVuYWJsZWQmJighZS5wb2ludGVySXNEb3dufHwhL21vdXNlfHBvaW50ZXIvLnRlc3QoZS5wb2ludGVyVHlwZSl8fDAhPShyJm4ub3B0aW9ucy5kcmFnLm1vdXNlQnV0dG9ucykpKXJldHVybiB0LmFjdGlvbj17bmFtZTpcImRyYWdcIixheGlzOlwic3RhcnRcIj09PW8ubG9ja0F4aXM/by5zdGFydEF4aXM6by5sb2NrQXhpc30sITF9fSxkcmFnZ2FibGU6ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5vYmplY3QodCk/KHRoaXMub3B0aW9ucy5kcmFnLmVuYWJsZWQ9ITEhPT10LmVuYWJsZWQsdGhpcy5zZXRQZXJBY3Rpb24oXCJkcmFnXCIsdCksdGhpcy5zZXRPbkV2ZW50cyhcImRyYWdcIix0KSwvXih4eXx4fHl8c3RhcnQpJC8udGVzdCh0LmxvY2tBeGlzKSYmKHRoaXMub3B0aW9ucy5kcmFnLmxvY2tBeGlzPXQubG9ja0F4aXMpLC9eKHh5fHh8eSkkLy50ZXN0KHQuc3RhcnRBeGlzKSYmKHRoaXMub3B0aW9ucy5kcmFnLnN0YXJ0QXhpcz10LnN0YXJ0QXhpcyksdGhpcyk6aS5kZWZhdWx0LmJvb2wodCk/KHRoaXMub3B0aW9ucy5kcmFnLmVuYWJsZWQ9dCx0aGlzKTp0aGlzLm9wdGlvbnMuZHJhZ30sYmVmb3JlTW92ZTpmLG1vdmU6ZCxkZWZhdWx0czp7c3RhcnRBeGlzOlwieHlcIixsb2NrQXhpczpcInh5XCJ9LGdldEN1cnNvcjpmdW5jdGlvbigpe3JldHVyblwibW92ZVwifX0sdj1wO2MuZGVmYXVsdD12O3ZhciBoPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShoLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGguZGVmYXVsdD12b2lkIDA7dmFyIGc9e2luaXQ6ZnVuY3Rpb24odCl7dmFyIGU9dDtnLmRvY3VtZW50PWUuZG9jdW1lbnQsZy5Eb2N1bWVudEZyYWdtZW50PWUuRG9jdW1lbnRGcmFnbWVudHx8eSxnLlNWR0VsZW1lbnQ9ZS5TVkdFbGVtZW50fHx5LGcuU1ZHU1ZHRWxlbWVudD1lLlNWR1NWR0VsZW1lbnR8fHksZy5TVkdFbGVtZW50SW5zdGFuY2U9ZS5TVkdFbGVtZW50SW5zdGFuY2V8fHksZy5FbGVtZW50PWUuRWxlbWVudHx8eSxnLkhUTUxFbGVtZW50PWUuSFRNTEVsZW1lbnR8fGcuRWxlbWVudCxnLkV2ZW50PWUuRXZlbnQsZy5Ub3VjaD1lLlRvdWNofHx5LGcuUG9pbnRlckV2ZW50PWUuUG9pbnRlckV2ZW50fHxlLk1TUG9pbnRlckV2ZW50fSxkb2N1bWVudDpudWxsLERvY3VtZW50RnJhZ21lbnQ6bnVsbCxTVkdFbGVtZW50Om51bGwsU1ZHU1ZHRWxlbWVudDpudWxsLFNWR0VsZW1lbnRJbnN0YW5jZTpudWxsLEVsZW1lbnQ6bnVsbCxIVE1MRWxlbWVudDpudWxsLEV2ZW50Om51bGwsVG91Y2g6bnVsbCxQb2ludGVyRXZlbnQ6bnVsbH07ZnVuY3Rpb24geSgpe312YXIgbT1nO2guZGVmYXVsdD1tO3ZhciBiPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShiLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGIuZGVmYXVsdD12b2lkIDA7dmFyIHg9e2luaXQ6ZnVuY3Rpb24odCl7dmFyIGU9aC5kZWZhdWx0LkVsZW1lbnQsbj10Lm5hdmlnYXRvcnx8e307eC5zdXBwb3J0c1RvdWNoPVwib250b3VjaHN0YXJ0XCJpbiB0fHxpLmRlZmF1bHQuZnVuYyh0LkRvY3VtZW50VG91Y2gpJiZoLmRlZmF1bHQuZG9jdW1lbnQgaW5zdGFuY2VvZiB0LkRvY3VtZW50VG91Y2gseC5zdXBwb3J0c1BvaW50ZXJFdmVudD0hMSE9PW4ucG9pbnRlckVuYWJsZWQmJiEhaC5kZWZhdWx0LlBvaW50ZXJFdmVudCx4LmlzSU9TPS9pUChob25lfG9kfGFkKS8udGVzdChuLnBsYXRmb3JtKSx4LmlzSU9TNz0vaVAoaG9uZXxvZHxhZCkvLnRlc3Qobi5wbGF0Zm9ybSkmJi9PUyA3W15cXGRdLy50ZXN0KG4uYXBwVmVyc2lvbikseC5pc0llOT0vTVNJRSA5Ly50ZXN0KG4udXNlckFnZW50KSx4LmlzT3BlcmFNb2JpbGU9XCJPcGVyYVwiPT09bi5hcHBOYW1lJiZ4LnN1cHBvcnRzVG91Y2gmJi9QcmVzdG8vLnRlc3Qobi51c2VyQWdlbnQpLHgucHJlZml4ZWRNYXRjaGVzU2VsZWN0b3I9XCJtYXRjaGVzXCJpbiBlLnByb3RvdHlwZT9cIm1hdGNoZXNcIjpcIndlYmtpdE1hdGNoZXNTZWxlY3RvclwiaW4gZS5wcm90b3R5cGU/XCJ3ZWJraXRNYXRjaGVzU2VsZWN0b3JcIjpcIm1vek1hdGNoZXNTZWxlY3RvclwiaW4gZS5wcm90b3R5cGU/XCJtb3pNYXRjaGVzU2VsZWN0b3JcIjpcIm9NYXRjaGVzU2VsZWN0b3JcImluIGUucHJvdG90eXBlP1wib01hdGNoZXNTZWxlY3RvclwiOlwibXNNYXRjaGVzU2VsZWN0b3JcIix4LnBFdmVudFR5cGVzPXguc3VwcG9ydHNQb2ludGVyRXZlbnQ/aC5kZWZhdWx0LlBvaW50ZXJFdmVudD09PXQuTVNQb2ludGVyRXZlbnQ/e3VwOlwiTVNQb2ludGVyVXBcIixkb3duOlwiTVNQb2ludGVyRG93blwiLG92ZXI6XCJtb3VzZW92ZXJcIixvdXQ6XCJtb3VzZW91dFwiLG1vdmU6XCJNU1BvaW50ZXJNb3ZlXCIsY2FuY2VsOlwiTVNQb2ludGVyQ2FuY2VsXCJ9Ont1cDpcInBvaW50ZXJ1cFwiLGRvd246XCJwb2ludGVyZG93blwiLG92ZXI6XCJwb2ludGVyb3ZlclwiLG91dDpcInBvaW50ZXJvdXRcIixtb3ZlOlwicG9pbnRlcm1vdmVcIixjYW5jZWw6XCJwb2ludGVyY2FuY2VsXCJ9Om51bGwseC53aGVlbEV2ZW50PWguZGVmYXVsdC5kb2N1bWVudCYmXCJvbm1vdXNld2hlZWxcImluIGguZGVmYXVsdC5kb2N1bWVudD9cIm1vdXNld2hlZWxcIjpcIndoZWVsXCJ9LHN1cHBvcnRzVG91Y2g6bnVsbCxzdXBwb3J0c1BvaW50ZXJFdmVudDpudWxsLGlzSU9TNzpudWxsLGlzSU9TOm51bGwsaXNJZTk6bnVsbCxpc09wZXJhTW9iaWxlOm51bGwscHJlZml4ZWRNYXRjaGVzU2VsZWN0b3I6bnVsbCxwRXZlbnRUeXBlczpudWxsLHdoZWVsRXZlbnQ6bnVsbH0sdz14O2IuZGVmYXVsdD13O3ZhciBfPXt9O2Z1bmN0aW9uIFAodCl7dmFyIGU9dC5wYXJlbnROb2RlO2lmKGkuZGVmYXVsdC5kb2NGcmFnKGUpKXtmb3IoOyhlPWUuaG9zdCkmJmkuZGVmYXVsdC5kb2NGcmFnKGUpOyk7cmV0dXJuIGV9cmV0dXJuIGV9ZnVuY3Rpb24gTyh0LG4pe3JldHVybiBlLndpbmRvdyE9PWUucmVhbFdpbmRvdyYmKG49bi5yZXBsYWNlKC9cXC9kZWVwXFwvL2csXCIgXCIpKSx0W2IuZGVmYXVsdC5wcmVmaXhlZE1hdGNoZXNTZWxlY3Rvcl0obil9T2JqZWN0LmRlZmluZVByb3BlcnR5KF8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksXy5ub2RlQ29udGFpbnM9ZnVuY3Rpb24odCxlKXtpZih0LmNvbnRhaW5zKXJldHVybiB0LmNvbnRhaW5zKGUpO2Zvcig7ZTspe2lmKGU9PT10KXJldHVybiEwO2U9ZS5wYXJlbnROb2RlfXJldHVybiExfSxfLmNsb3Nlc3Q9ZnVuY3Rpb24odCxlKXtmb3IoO2kuZGVmYXVsdC5lbGVtZW50KHQpOyl7aWYoTyh0LGUpKXJldHVybiB0O3Q9UCh0KX1yZXR1cm4gbnVsbH0sXy5wYXJlbnROb2RlPVAsXy5tYXRjaGVzU2VsZWN0b3I9TyxfLmluZGV4T2ZEZWVwZXN0RWxlbWVudD1mdW5jdGlvbih0KXtmb3IodmFyIG4scj1bXSxvPTA7bzx0Lmxlbmd0aDtvKyspe3ZhciBpPXRbb10sYT10W25dO2lmKGkmJm8hPT1uKWlmKGEpe3ZhciBzPVMoaSksbD1TKGEpO2lmKHMhPT1pLm93bmVyRG9jdW1lbnQpaWYobCE9PWkub3duZXJEb2N1bWVudClpZihzIT09bCl7cj1yLmxlbmd0aD9yOkUoYSk7dmFyIHU9dm9pZCAwO2lmKGEgaW5zdGFuY2VvZiBoLmRlZmF1bHQuSFRNTEVsZW1lbnQmJmkgaW5zdGFuY2VvZiBoLmRlZmF1bHQuU1ZHRWxlbWVudCYmIShpIGluc3RhbmNlb2YgaC5kZWZhdWx0LlNWR1NWR0VsZW1lbnQpKXtpZihpPT09bCljb250aW51ZTt1PWkub3duZXJTVkdFbGVtZW50fWVsc2UgdT1pO2Zvcih2YXIgYz1FKHUsYS5vd25lckRvY3VtZW50KSxmPTA7Y1tmXSYmY1tmXT09PXJbZl07KWYrKzt2YXIgZD1bY1tmLTFdLGNbZl0scltmXV07aWYoZFswXSlmb3IodmFyIHA9ZFswXS5sYXN0Q2hpbGQ7cDspe2lmKHA9PT1kWzFdKXtuPW8scj1jO2JyZWFrfWlmKHA9PT1kWzJdKWJyZWFrO3A9cC5wcmV2aW91c1NpYmxpbmd9fWVsc2Ugdj1pLGc9YSx2b2lkIDAsdm9pZCAwLChwYXJzZUludChlLmdldFdpbmRvdyh2KS5nZXRDb21wdXRlZFN0eWxlKHYpLnpJbmRleCwxMCl8fDApPj0ocGFyc2VJbnQoZS5nZXRXaW5kb3coZykuZ2V0Q29tcHV0ZWRTdHlsZShnKS56SW5kZXgsMTApfHwwKSYmKG49byk7ZWxzZSBuPW99ZWxzZSBuPW99dmFyIHYsZztyZXR1cm4gbn0sXy5tYXRjaGVzVXBUbz1mdW5jdGlvbih0LGUsbil7Zm9yKDtpLmRlZmF1bHQuZWxlbWVudCh0KTspe2lmKE8odCxlKSlyZXR1cm4hMDtpZigodD1QKHQpKT09PW4pcmV0dXJuIE8odCxlKX1yZXR1cm4hMX0sXy5nZXRBY3R1YWxFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVybiB0LmNvcnJlc3BvbmRpbmdVc2VFbGVtZW50fHx0fSxfLmdldFNjcm9sbFhZPVQsXy5nZXRFbGVtZW50Q2xpZW50UmVjdD1NLF8uZ2V0RWxlbWVudFJlY3Q9ZnVuY3Rpb24odCl7dmFyIG49TSh0KTtpZighYi5kZWZhdWx0LmlzSU9TNyYmbil7dmFyIHI9VChlLmdldFdpbmRvdyh0KSk7bi5sZWZ0Kz1yLngsbi5yaWdodCs9ci54LG4udG9wKz1yLnksbi5ib3R0b20rPXIueX1yZXR1cm4gbn0sXy5nZXRQYXRoPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT1bXTt0OyllLnB1c2godCksdD1QKHQpO3JldHVybiBlfSxfLnRyeVNlbGVjdG9yPWZ1bmN0aW9uKHQpe3JldHVybiEhaS5kZWZhdWx0LnN0cmluZyh0KSYmKGguZGVmYXVsdC5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHQpLCEwKX07dmFyIFM9ZnVuY3Rpb24odCl7cmV0dXJuIHQucGFyZW50Tm9kZXx8dC5ob3N0fTtmdW5jdGlvbiBFKHQsZSl7Zm9yKHZhciBuLHI9W10sbz10OyhuPVMobykpJiZvIT09ZSYmbiE9PW8ub3duZXJEb2N1bWVudDspci51bnNoaWZ0KG8pLG89bjtyZXR1cm4gcn1mdW5jdGlvbiBUKHQpe3JldHVybnt4Oih0PXR8fGUud2luZG93KS5zY3JvbGxYfHx0LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0LHk6dC5zY3JvbGxZfHx0LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3B9fWZ1bmN0aW9uIE0odCl7dmFyIGU9dCBpbnN0YW5jZW9mIGguZGVmYXVsdC5TVkdFbGVtZW50P3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk6dC5nZXRDbGllbnRSZWN0cygpWzBdO3JldHVybiBlJiZ7bGVmdDplLmxlZnQscmlnaHQ6ZS5yaWdodCx0b3A6ZS50b3AsYm90dG9tOmUuYm90dG9tLHdpZHRoOmUud2lkdGh8fGUucmlnaHQtZS5sZWZ0LGhlaWdodDplLmhlaWdodHx8ZS5ib3R0b20tZS50b3B9fXZhciBqPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShqLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGouZGVmYXVsdD1mdW5jdGlvbih0LGUpe2Zvcih2YXIgbiBpbiBlKXRbbl09ZVtuXTtyZXR1cm4gdH07dmFyIGs9e307ZnVuY3Rpb24gSSh0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9ZnVuY3Rpb24gRCh0LGUsbil7cmV0dXJuXCJwYXJlbnRcIj09PXQ/KDAsXy5wYXJlbnROb2RlKShuKTpcInNlbGZcIj09PXQ/ZS5nZXRSZWN0KG4pOigwLF8uY2xvc2VzdCkobix0KX1PYmplY3QuZGVmaW5lUHJvcGVydHkoayxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxrLmdldFN0cmluZ09wdGlvblJlc3VsdD1ELGsucmVzb2x2ZVJlY3RMaWtlPWZ1bmN0aW9uKHQsZSxuLHIpe3ZhciBvLGE9dDtyZXR1cm4gaS5kZWZhdWx0LnN0cmluZyhhKT9hPUQoYSxlLG4pOmkuZGVmYXVsdC5mdW5jKGEpJiYoYT1hLmFwcGx5KHZvaWQgMCxmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiBJKHQpfShvPXIpfHxmdW5jdGlvbih0KXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXJldHVybiBBcnJheS5mcm9tKHQpfShvKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gSSh0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/SSh0LGUpOnZvaWQgMH19KG8pfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gc3ByZWFkIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpKSksaS5kZWZhdWx0LmVsZW1lbnQoYSkmJihhPSgwLF8uZ2V0RWxlbWVudFJlY3QpKGEpKSxhfSxrLnJlY3RUb1hZPWZ1bmN0aW9uKHQpe3JldHVybiB0JiZ7eDpcInhcImluIHQ/dC54OnQubGVmdCx5OlwieVwiaW4gdD90Lnk6dC50b3B9fSxrLnh5d2hUb1RsYnI9ZnVuY3Rpb24odCl7cmV0dXJuIXR8fFwibGVmdFwiaW4gdCYmXCJ0b3BcImluIHR8fCgodD0oMCxqLmRlZmF1bHQpKHt9LHQpKS5sZWZ0PXQueHx8MCx0LnRvcD10Lnl8fDAsdC5yaWdodD10LnJpZ2h0fHx0LmxlZnQrdC53aWR0aCx0LmJvdHRvbT10LmJvdHRvbXx8dC50b3ArdC5oZWlnaHQpLHR9LGsudGxiclRvWHl3aD1mdW5jdGlvbih0KXtyZXR1cm4hdHx8XCJ4XCJpbiB0JiZcInlcImluIHR8fCgodD0oMCxqLmRlZmF1bHQpKHt9LHQpKS54PXQubGVmdHx8MCx0Lnk9dC50b3B8fDAsdC53aWR0aD10LndpZHRofHwodC5yaWdodHx8MCktdC54LHQuaGVpZ2h0PXQuaGVpZ2h0fHwodC5ib3R0b218fDApLXQueSksdH0say5hZGRFZGdlcz1mdW5jdGlvbih0LGUsbil7dC5sZWZ0JiYoZS5sZWZ0Kz1uLngpLHQucmlnaHQmJihlLnJpZ2h0Kz1uLngpLHQudG9wJiYoZS50b3ArPW4ueSksdC5ib3R0b20mJihlLmJvdHRvbSs9bi55KSxlLndpZHRoPWUucmlnaHQtZS5sZWZ0LGUuaGVpZ2h0PWUuYm90dG9tLWUudG9wfTt2YXIgQT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoQSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxBLmRlZmF1bHQ9ZnVuY3Rpb24odCxlLG4pe3ZhciByPXQub3B0aW9uc1tuXSxvPXImJnIub3JpZ2lufHx0Lm9wdGlvbnMub3JpZ2luLGk9KDAsay5yZXNvbHZlUmVjdExpa2UpKG8sdCxlLFt0JiZlXSk7cmV0dXJuKDAsay5yZWN0VG9YWSkoaSl8fHt4OjAseTowfX07dmFyIFI9e307ZnVuY3Rpb24geih0KXtyZXR1cm4gdC50cmltKCkuc3BsaXQoLyArLyl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksUi5kZWZhdWx0PWZ1bmN0aW9uIHQoZSxuLHIpe2lmKHI9cnx8e30saS5kZWZhdWx0LnN0cmluZyhlKSYmLTEhPT1lLnNlYXJjaChcIiBcIikmJihlPXooZSkpLGkuZGVmYXVsdC5hcnJheShlKSlyZXR1cm4gZS5yZWR1Y2UoKGZ1bmN0aW9uKGUsbyl7cmV0dXJuKDAsai5kZWZhdWx0KShlLHQobyxuLHIpKX0pLHIpO2lmKGkuZGVmYXVsdC5vYmplY3QoZSkmJihuPWUsZT1cIlwiKSxpLmRlZmF1bHQuZnVuYyhuKSlyW2VdPXJbZV18fFtdLHJbZV0ucHVzaChuKTtlbHNlIGlmKGkuZGVmYXVsdC5hcnJheShuKSlmb3IodmFyIG89MDtvPG4ubGVuZ3RoO28rKyl7dmFyIGE7YT1uW29dLHQoZSxhLHIpfWVsc2UgaWYoaS5kZWZhdWx0Lm9iamVjdChuKSlmb3IodmFyIHMgaW4gbil7dmFyIGw9eihzKS5tYXAoKGZ1bmN0aW9uKHQpe3JldHVyblwiXCIuY29uY2F0KGUpLmNvbmNhdCh0KX0pKTt0KGwsbltzXSxyKX1yZXR1cm4gcn07dmFyIEM9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQy5kZWZhdWx0PXZvaWQgMCxDLmRlZmF1bHQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtlKmUpfTt2YXIgRj17fTtmdW5jdGlvbiBYKHQsZSl7Zm9yKHZhciBuIGluIGUpe3ZhciByPVgucHJlZml4ZWRQcm9wUkVzLG89ITE7Zm9yKHZhciBpIGluIHIpaWYoMD09PW4uaW5kZXhPZihpKSYmcltpXS50ZXN0KG4pKXtvPSEwO2JyZWFrfW98fFwiZnVuY3Rpb25cIj09dHlwZW9mIGVbbl18fCh0W25dPWVbbl0pfXJldHVybiB0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShGLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEYuZGVmYXVsdD12b2lkIDAsWC5wcmVmaXhlZFByb3BSRXM9e3dlYmtpdDovKE1vdmVtZW50W1hZXXxSYWRpdXNbWFldfFJvdGF0aW9uQW5nbGV8Rm9yY2UpJC8sbW96Oi8oUHJlc3N1cmUpJC99O3ZhciBZPVg7Ri5kZWZhdWx0PVk7dmFyIEI9e307ZnVuY3Rpb24gVyh0KXtyZXR1cm4gdCBpbnN0YW5jZW9mIGguZGVmYXVsdC5FdmVudHx8dCBpbnN0YW5jZW9mIGguZGVmYXVsdC5Ub3VjaH1mdW5jdGlvbiBMKHQsZSxuKXtyZXR1cm4gdD10fHxcInBhZ2VcIiwobj1ufHx7fSkueD1lW3QrXCJYXCJdLG4ueT1lW3QrXCJZXCJdLG59ZnVuY3Rpb24gVSh0LGUpe3JldHVybiBlPWV8fHt4OjAseTowfSxiLmRlZmF1bHQuaXNPcGVyYU1vYmlsZSYmVyh0KT8oTChcInNjcmVlblwiLHQsZSksZS54Kz13aW5kb3cuc2Nyb2xsWCxlLnkrPXdpbmRvdy5zY3JvbGxZKTpMKFwicGFnZVwiLHQsZSksZX1mdW5jdGlvbiBWKHQsZSl7cmV0dXJuIGU9ZXx8e30sYi5kZWZhdWx0LmlzT3BlcmFNb2JpbGUmJlcodCk/TChcInNjcmVlblwiLHQsZSk6TChcImNsaWVudFwiLHQsZSksZX1mdW5jdGlvbiBOKHQpe3ZhciBlPVtdO3JldHVybiBpLmRlZmF1bHQuYXJyYXkodCk/KGVbMF09dFswXSxlWzFdPXRbMV0pOlwidG91Y2hlbmRcIj09PXQudHlwZT8xPT09dC50b3VjaGVzLmxlbmd0aD8oZVswXT10LnRvdWNoZXNbMF0sZVsxXT10LmNoYW5nZWRUb3VjaGVzWzBdKTowPT09dC50b3VjaGVzLmxlbmd0aCYmKGVbMF09dC5jaGFuZ2VkVG91Y2hlc1swXSxlWzFdPXQuY2hhbmdlZFRvdWNoZXNbMV0pOihlWzBdPXQudG91Y2hlc1swXSxlWzFdPXQudG91Y2hlc1sxXSksZX1mdW5jdGlvbiBxKHQpe2Zvcih2YXIgZT17cGFnZVg6MCxwYWdlWTowLGNsaWVudFg6MCxjbGllbnRZOjAsc2NyZWVuWDowLHNjcmVlblk6MH0sbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO2Zvcih2YXIgbyBpbiBlKWVbb10rPXJbb119Zm9yKHZhciBpIGluIGUpZVtpXS89dC5sZW5ndGg7cmV0dXJuIGV9T2JqZWN0LmRlZmluZVByb3BlcnR5KEIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQi5jb3B5Q29vcmRzPWZ1bmN0aW9uKHQsZSl7dC5wYWdlPXQucGFnZXx8e30sdC5wYWdlLng9ZS5wYWdlLngsdC5wYWdlLnk9ZS5wYWdlLnksdC5jbGllbnQ9dC5jbGllbnR8fHt9LHQuY2xpZW50Lng9ZS5jbGllbnQueCx0LmNsaWVudC55PWUuY2xpZW50LnksdC50aW1lU3RhbXA9ZS50aW1lU3RhbXB9LEIuc2V0Q29vcmREZWx0YXM9ZnVuY3Rpb24odCxlLG4pe3QucGFnZS54PW4ucGFnZS54LWUucGFnZS54LHQucGFnZS55PW4ucGFnZS55LWUucGFnZS55LHQuY2xpZW50Lng9bi5jbGllbnQueC1lLmNsaWVudC54LHQuY2xpZW50Lnk9bi5jbGllbnQueS1lLmNsaWVudC55LHQudGltZVN0YW1wPW4udGltZVN0YW1wLWUudGltZVN0YW1wfSxCLnNldENvb3JkVmVsb2NpdHk9ZnVuY3Rpb24odCxlKXt2YXIgbj1NYXRoLm1heChlLnRpbWVTdGFtcC8xZTMsLjAwMSk7dC5wYWdlLng9ZS5wYWdlLngvbix0LnBhZ2UueT1lLnBhZ2UueS9uLHQuY2xpZW50Lng9ZS5jbGllbnQueC9uLHQuY2xpZW50Lnk9ZS5jbGllbnQueS9uLHQudGltZVN0YW1wPW59LEIuc2V0WmVyb0Nvb3Jkcz1mdW5jdGlvbih0KXt0LnBhZ2UueD0wLHQucGFnZS55PTAsdC5jbGllbnQueD0wLHQuY2xpZW50Lnk9MH0sQi5pc05hdGl2ZVBvaW50ZXI9VyxCLmdldFhZPUwsQi5nZXRQYWdlWFk9VSxCLmdldENsaWVudFhZPVYsQi5nZXRQb2ludGVySWQ9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5udW1iZXIodC5wb2ludGVySWQpP3QucG9pbnRlcklkOnQuaWRlbnRpZmllcn0sQi5zZXRDb29yZHM9ZnVuY3Rpb24odCxlLG4pe3ZhciByPWUubGVuZ3RoPjE/cShlKTplWzBdO1Uocix0LnBhZ2UpLFYocix0LmNsaWVudCksdC50aW1lU3RhbXA9bn0sQi5nZXRUb3VjaFBhaXI9TixCLnBvaW50ZXJBdmVyYWdlPXEsQi50b3VjaEJCb3g9ZnVuY3Rpb24odCl7aWYoIXQubGVuZ3RoKXJldHVybiBudWxsO3ZhciBlPU4odCksbj1NYXRoLm1pbihlWzBdLnBhZ2VYLGVbMV0ucGFnZVgpLHI9TWF0aC5taW4oZVswXS5wYWdlWSxlWzFdLnBhZ2VZKSxvPU1hdGgubWF4KGVbMF0ucGFnZVgsZVsxXS5wYWdlWCksaT1NYXRoLm1heChlWzBdLnBhZ2VZLGVbMV0ucGFnZVkpO3JldHVybnt4Om4seTpyLGxlZnQ6bix0b3A6cixyaWdodDpvLGJvdHRvbTppLHdpZHRoOm8tbixoZWlnaHQ6aS1yfX0sQi50b3VjaERpc3RhbmNlPWZ1bmN0aW9uKHQsZSl7dmFyIG49ZStcIlhcIixyPWUrXCJZXCIsbz1OKHQpLGk9b1swXVtuXS1vWzFdW25dLGE9b1swXVtyXS1vWzFdW3JdO3JldHVybigwLEMuZGVmYXVsdCkoaSxhKX0sQi50b3VjaEFuZ2xlPWZ1bmN0aW9uKHQsZSl7dmFyIG49ZStcIlhcIixyPWUrXCJZXCIsbz1OKHQpLGk9b1sxXVtuXS1vWzBdW25dLGE9b1sxXVtyXS1vWzBdW3JdO3JldHVybiAxODAqTWF0aC5hdGFuMihhLGkpL01hdGguUEl9LEIuZ2V0UG9pbnRlclR5cGU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5zdHJpbmcodC5wb2ludGVyVHlwZSk/dC5wb2ludGVyVHlwZTppLmRlZmF1bHQubnVtYmVyKHQucG9pbnRlclR5cGUpP1t2b2lkIDAsdm9pZCAwLFwidG91Y2hcIixcInBlblwiLFwibW91c2VcIl1bdC5wb2ludGVyVHlwZV06L3RvdWNoLy50ZXN0KHQudHlwZXx8XCJcIil8fHQgaW5zdGFuY2VvZiBoLmRlZmF1bHQuVG91Y2g/XCJ0b3VjaFwiOlwibW91c2VcIn0sQi5nZXRFdmVudFRhcmdldHM9ZnVuY3Rpb24odCl7dmFyIGU9aS5kZWZhdWx0LmZ1bmModC5jb21wb3NlZFBhdGgpP3QuY29tcG9zZWRQYXRoKCk6dC5wYXRoO3JldHVybltfLmdldEFjdHVhbEVsZW1lbnQoZT9lWzBdOnQudGFyZ2V0KSxfLmdldEFjdHVhbEVsZW1lbnQodC5jdXJyZW50VGFyZ2V0KV19LEIubmV3Q29vcmRzPWZ1bmN0aW9uKCl7cmV0dXJue3BhZ2U6e3g6MCx5OjB9LGNsaWVudDp7eDowLHk6MH0sdGltZVN0YW1wOjB9fSxCLmNvb3Jkc1RvRXZlbnQ9ZnVuY3Rpb24odCl7cmV0dXJue2Nvb3Jkczp0LGdldCBwYWdlKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBhZ2V9LGdldCBjbGllbnQoKXtyZXR1cm4gdGhpcy5jb29yZHMuY2xpZW50fSxnZXQgdGltZVN0YW1wKCl7cmV0dXJuIHRoaXMuY29vcmRzLnRpbWVTdGFtcH0sZ2V0IHBhZ2VYKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBhZ2UueH0sZ2V0IHBhZ2VZKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBhZ2UueX0sZ2V0IGNsaWVudFgoKXtyZXR1cm4gdGhpcy5jb29yZHMuY2xpZW50Lnh9LGdldCBjbGllbnRZKCl7cmV0dXJuIHRoaXMuY29vcmRzLmNsaWVudC55fSxnZXQgcG9pbnRlcklkKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBvaW50ZXJJZH0sZ2V0IHRhcmdldCgpe3JldHVybiB0aGlzLmNvb3Jkcy50YXJnZXR9LGdldCB0eXBlKCl7cmV0dXJuIHRoaXMuY29vcmRzLnR5cGV9LGdldCBwb2ludGVyVHlwZSgpe3JldHVybiB0aGlzLmNvb3Jkcy5wb2ludGVyVHlwZX0sZ2V0IGJ1dHRvbnMoKXtyZXR1cm4gdGhpcy5jb29yZHMuYnV0dG9uc30scHJldmVudERlZmF1bHQ6ZnVuY3Rpb24oKXt9fX0sT2JqZWN0LmRlZmluZVByb3BlcnR5KEIsXCJwb2ludGVyRXh0ZW5kXCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIEYuZGVmYXVsdH19KTt2YXIgJD17fTtmdW5jdGlvbiBHKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBIKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoJCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSwkLkJhc2VFdmVudD12b2lkIDA7dmFyIEs9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksSCh0aGlzLFwidHlwZVwiLHZvaWQgMCksSCh0aGlzLFwidGFyZ2V0XCIsdm9pZCAwKSxIKHRoaXMsXCJjdXJyZW50VGFyZ2V0XCIsdm9pZCAwKSxIKHRoaXMsXCJpbnRlcmFjdGFibGVcIix2b2lkIDApLEgodGhpcyxcIl9pbnRlcmFjdGlvblwiLHZvaWQgMCksSCh0aGlzLFwidGltZVN0YW1wXCIsdm9pZCAwKSxIKHRoaXMsXCJpbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksSCh0aGlzLFwicHJvcGFnYXRpb25TdG9wcGVkXCIsITEpLHRoaXMuX2ludGVyYWN0aW9uPWV9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwicHJldmVudERlZmF1bHRcIix2YWx1ZTpmdW5jdGlvbigpe319LHtrZXk6XCJzdG9wUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX0se2tleTpcInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQ9dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fV0pJiZHKGUucHJvdG90eXBlLG4pLHR9KCk7JC5CYXNlRXZlbnQ9SyxPYmplY3QuZGVmaW5lUHJvcGVydHkoSy5wcm90b3R5cGUsXCJpbnRlcmFjdGlvblwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faW50ZXJhY3Rpb24uX3Byb3h5fSxzZXQ6ZnVuY3Rpb24oKXt9fSk7dmFyIFo9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFosXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWi5maW5kPVouZmluZEluZGV4PVouZnJvbT1aLm1lcmdlPVoucmVtb3ZlPVouY29udGFpbnM9dm9pZCAwLFouY29udGFpbnM9ZnVuY3Rpb24odCxlKXtyZXR1cm4tMSE9PXQuaW5kZXhPZihlKX0sWi5yZW1vdmU9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5zcGxpY2UodC5pbmRleE9mKGUpLDEpfTt2YXIgSj1mdW5jdGlvbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3QucHVzaChyKX1yZXR1cm4gdH07Wi5tZXJnZT1KLFouZnJvbT1mdW5jdGlvbih0KXtyZXR1cm4gSihbXSx0KX07dmFyIFE9ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKylpZihlKHRbbl0sbix0KSlyZXR1cm4gbjtyZXR1cm4tMX07Wi5maW5kSW5kZXg9USxaLmZpbmQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFtRKHQsZSldfTt2YXIgdHQ9e307ZnVuY3Rpb24gZXQodCl7cmV0dXJuKGV0PVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBudCh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gcnQodCxlKXtyZXR1cm4ocnQ9T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIG90KHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1ldChlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9pdCh0KTplfWZ1bmN0aW9uIGl0KHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fWZ1bmN0aW9uIGF0KHQpe3JldHVybihhdD1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9ZnVuY3Rpb24gc3QodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0dCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0dC5Ecm9wRXZlbnQ9dm9pZCAwO3ZhciBsdD1mdW5jdGlvbih0KXshZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7dC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLGUmJnJ0KHQsZSl9KGEsdCk7dmFyIGUsbixyLG8saT0ocj1hLG89ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LGU9YXQocik7aWYobyl7dmFyIG49YXQodGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChlLGFyZ3VtZW50cyxuKX1lbHNlIHQ9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIG90KHRoaXMsdCl9KTtmdW5jdGlvbiBhKHQsZSxuKXt2YXIgcjshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLGEpLHN0KGl0KHI9aS5jYWxsKHRoaXMsZS5faW50ZXJhY3Rpb24pKSxcInRhcmdldFwiLHZvaWQgMCksc3QoaXQociksXCJkcm9wem9uZVwiLHZvaWQgMCksc3QoaXQociksXCJkcmFnRXZlbnRcIix2b2lkIDApLHN0KGl0KHIpLFwicmVsYXRlZFRhcmdldFwiLHZvaWQgMCksc3QoaXQociksXCJkcmFnZ2FibGVcIix2b2lkIDApLHN0KGl0KHIpLFwidGltZVN0YW1wXCIsdm9pZCAwKSxzdChpdChyKSxcInByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKSxzdChpdChyKSxcImltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKTt2YXIgbz1cImRyYWdsZWF2ZVwiPT09bj90LnByZXY6dC5jdXIscz1vLmVsZW1lbnQsbD1vLmRyb3B6b25lO3JldHVybiByLnR5cGU9bixyLnRhcmdldD1zLHIuY3VycmVudFRhcmdldD1zLHIuZHJvcHpvbmU9bCxyLmRyYWdFdmVudD1lLHIucmVsYXRlZFRhcmdldD1lLnRhcmdldCxyLmRyYWdnYWJsZT1lLmludGVyYWN0YWJsZSxyLnRpbWVTdGFtcD1lLnRpbWVTdGFtcCxyfXJldHVybiBlPWEsKG49W3trZXk6XCJyZWplY3RcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMsZT10aGlzLl9pbnRlcmFjdGlvbi5kcm9wU3RhdGU7aWYoXCJkcm9wYWN0aXZhdGVcIj09PXRoaXMudHlwZXx8dGhpcy5kcm9wem9uZSYmZS5jdXIuZHJvcHpvbmU9PT10aGlzLmRyb3B6b25lJiZlLmN1ci5lbGVtZW50PT09dGhpcy50YXJnZXQpaWYoZS5wcmV2LmRyb3B6b25lPXRoaXMuZHJvcHpvbmUsZS5wcmV2LmVsZW1lbnQ9dGhpcy50YXJnZXQsZS5yZWplY3RlZD0hMCxlLmV2ZW50cy5lbnRlcj1udWxsLHRoaXMuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCksXCJkcm9wYWN0aXZhdGVcIj09PXRoaXMudHlwZSl7dmFyIG49ZS5hY3RpdmVEcm9wcyxyPVouZmluZEluZGV4KG4sKGZ1bmN0aW9uKGUpe3ZhciBuPWUuZHJvcHpvbmUscj1lLmVsZW1lbnQ7cmV0dXJuIG49PT10LmRyb3B6b25lJiZyPT09dC50YXJnZXR9KSk7ZS5hY3RpdmVEcm9wcy5zcGxpY2UociwxKTt2YXIgbz1uZXcgYShlLHRoaXMuZHJhZ0V2ZW50LFwiZHJvcGRlYWN0aXZhdGVcIik7by5kcm9wem9uZT10aGlzLmRyb3B6b25lLG8udGFyZ2V0PXRoaXMudGFyZ2V0LHRoaXMuZHJvcHpvbmUuZmlyZShvKX1lbHNlIHRoaXMuZHJvcHpvbmUuZmlyZShuZXcgYShlLHRoaXMuZHJhZ0V2ZW50LFwiZHJhZ2xlYXZlXCIpKX19LHtrZXk6XCJwcmV2ZW50RGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInN0b3BQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fSx7a2V5Olwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZD10aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19XSkmJm50KGUucHJvdG90eXBlLG4pLGF9KCQuQmFzZUV2ZW50KTt0dC5Ecm9wRXZlbnQ9bHQ7dmFyIHV0PXt9O2Z1bmN0aW9uIGN0KHQsZSl7Zm9yKHZhciBuPTA7bjx0LnNsaWNlKCkubGVuZ3RoO24rKyl7dmFyIHI9dC5zbGljZSgpW25dLG89ci5kcm9wem9uZSxpPXIuZWxlbWVudDtlLmRyb3B6b25lPW8sZS50YXJnZXQ9aSxvLmZpcmUoZSksZS5wcm9wYWdhdGlvblN0b3BwZWQ9ZS5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQ9ITF9fWZ1bmN0aW9uIGZ0KHQsZSl7Zm9yKHZhciBuPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPXQuaW50ZXJhY3RhYmxlcyxyPVtdLG89MDtvPG4ubGlzdC5sZW5ndGg7bysrKXt2YXIgYT1uLmxpc3Rbb107aWYoYS5vcHRpb25zLmRyb3AuZW5hYmxlZCl7dmFyIHM9YS5vcHRpb25zLmRyb3AuYWNjZXB0O2lmKCEoaS5kZWZhdWx0LmVsZW1lbnQocykmJnMhPT1lfHxpLmRlZmF1bHQuc3RyaW5nKHMpJiYhXy5tYXRjaGVzU2VsZWN0b3IoZSxzKXx8aS5kZWZhdWx0LmZ1bmMocykmJiFzKHtkcm9wem9uZTphLGRyYWdnYWJsZUVsZW1lbnQ6ZX0pKSlmb3IodmFyIGw9aS5kZWZhdWx0LnN0cmluZyhhLnRhcmdldCk/YS5fY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKGEudGFyZ2V0KTppLmRlZmF1bHQuYXJyYXkoYS50YXJnZXQpP2EudGFyZ2V0OlthLnRhcmdldF0sdT0wO3U8bC5sZW5ndGg7dSsrKXt2YXIgYz1sW3VdO2MhPT1lJiZyLnB1c2goe2Ryb3B6b25lOmEsZWxlbWVudDpjLHJlY3Q6YS5nZXRSZWN0KGMpfSl9fX1yZXR1cm4gcn0odCxlKSxyPTA7cjxuLmxlbmd0aDtyKyspe3ZhciBvPW5bcl07by5yZWN0PW8uZHJvcHpvbmUuZ2V0UmVjdChvLmVsZW1lbnQpfXJldHVybiBufWZ1bmN0aW9uIGR0KHQsZSxuKXtmb3IodmFyIHI9dC5kcm9wU3RhdGUsbz10LmludGVyYWN0YWJsZSxpPXQuZWxlbWVudCxhPVtdLHM9MDtzPHIuYWN0aXZlRHJvcHMubGVuZ3RoO3MrKyl7dmFyIGw9ci5hY3RpdmVEcm9wc1tzXSx1PWwuZHJvcHpvbmUsYz1sLmVsZW1lbnQsZj1sLnJlY3Q7YS5wdXNoKHUuZHJvcENoZWNrKGUsbixvLGksYyxmKT9jOm51bGwpfXZhciBkPV8uaW5kZXhPZkRlZXBlc3RFbGVtZW50KGEpO3JldHVybiByLmFjdGl2ZURyb3BzW2RdfHxudWxsfWZ1bmN0aW9uIHB0KHQsZSxuKXt2YXIgcj10LmRyb3BTdGF0ZSxvPXtlbnRlcjpudWxsLGxlYXZlOm51bGwsYWN0aXZhdGU6bnVsbCxkZWFjdGl2YXRlOm51bGwsbW92ZTpudWxsLGRyb3A6bnVsbH07cmV0dXJuXCJkcmFnc3RhcnRcIj09PW4udHlwZSYmKG8uYWN0aXZhdGU9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcm9wYWN0aXZhdGVcIiksby5hY3RpdmF0ZS50YXJnZXQ9bnVsbCxvLmFjdGl2YXRlLmRyb3B6b25lPW51bGwpLFwiZHJhZ2VuZFwiPT09bi50eXBlJiYoby5kZWFjdGl2YXRlPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJvcGRlYWN0aXZhdGVcIiksby5kZWFjdGl2YXRlLnRhcmdldD1udWxsLG8uZGVhY3RpdmF0ZS5kcm9wem9uZT1udWxsKSxyLnJlamVjdGVkfHwoci5jdXIuZWxlbWVudCE9PXIucHJldi5lbGVtZW50JiYoci5wcmV2LmRyb3B6b25lJiYoby5sZWF2ZT1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyYWdsZWF2ZVwiKSxuLmRyYWdMZWF2ZT1vLmxlYXZlLnRhcmdldD1yLnByZXYuZWxlbWVudCxuLnByZXZEcm9wem9uZT1vLmxlYXZlLmRyb3B6b25lPXIucHJldi5kcm9wem9uZSksci5jdXIuZHJvcHpvbmUmJihvLmVudGVyPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJhZ2VudGVyXCIpLG4uZHJhZ0VudGVyPXIuY3VyLmVsZW1lbnQsbi5kcm9wem9uZT1yLmN1ci5kcm9wem9uZSkpLFwiZHJhZ2VuZFwiPT09bi50eXBlJiZyLmN1ci5kcm9wem9uZSYmKG8uZHJvcD1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyb3BcIiksbi5kcm9wem9uZT1yLmN1ci5kcm9wem9uZSxuLnJlbGF0ZWRUYXJnZXQ9ci5jdXIuZWxlbWVudCksXCJkcmFnbW92ZVwiPT09bi50eXBlJiZyLmN1ci5kcm9wem9uZSYmKG8ubW92ZT1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyb3Btb3ZlXCIpLG8ubW92ZS5kcmFnbW92ZT1uLG4uZHJvcHpvbmU9ci5jdXIuZHJvcHpvbmUpKSxvfWZ1bmN0aW9uIHZ0KHQsZSl7dmFyIG49dC5kcm9wU3RhdGUscj1uLmFjdGl2ZURyb3BzLG89bi5jdXIsaT1uLnByZXY7ZS5sZWF2ZSYmaS5kcm9wem9uZS5maXJlKGUubGVhdmUpLGUuZW50ZXImJm8uZHJvcHpvbmUuZmlyZShlLmVudGVyKSxlLm1vdmUmJm8uZHJvcHpvbmUuZmlyZShlLm1vdmUpLGUuZHJvcCYmby5kcm9wem9uZS5maXJlKGUuZHJvcCksZS5kZWFjdGl2YXRlJiZjdChyLGUuZGVhY3RpdmF0ZSksbi5wcmV2LmRyb3B6b25lPW8uZHJvcHpvbmUsbi5wcmV2LmVsZW1lbnQ9by5lbGVtZW50fWZ1bmN0aW9uIGh0KHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQuaUV2ZW50LG89dC5ldmVudDtpZihcImRyYWdtb3ZlXCI9PT1yLnR5cGV8fFwiZHJhZ2VuZFwiPT09ci50eXBlKXt2YXIgaT1uLmRyb3BTdGF0ZTtlLmR5bmFtaWNEcm9wJiYoaS5hY3RpdmVEcm9wcz1mdChlLG4uZWxlbWVudCkpO3ZhciBhPXIscz1kdChuLGEsbyk7aS5yZWplY3RlZD1pLnJlamVjdGVkJiYhIXMmJnMuZHJvcHpvbmU9PT1pLmN1ci5kcm9wem9uZSYmcy5lbGVtZW50PT09aS5jdXIuZWxlbWVudCxpLmN1ci5kcm9wem9uZT1zJiZzLmRyb3B6b25lLGkuY3VyLmVsZW1lbnQ9cyYmcy5lbGVtZW50LGkuZXZlbnRzPXB0KG4sMCxhKX19T2JqZWN0LmRlZmluZVByb3BlcnR5KHV0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHV0LmRlZmF1bHQ9dm9pZCAwO3ZhciBndD17aWQ6XCJhY3Rpb25zL2Ryb3BcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuYWN0aW9ucyxuPXQuaW50ZXJhY3RTdGF0aWMscj10LkludGVyYWN0YWJsZSxvPXQuZGVmYXVsdHM7dC51c2VQbHVnaW4oYy5kZWZhdWx0KSxyLnByb3RvdHlwZS5kcm9wem9uZT1mdW5jdGlvbih0KXtyZXR1cm4gZnVuY3Rpb24odCxlKXtpZihpLmRlZmF1bHQub2JqZWN0KGUpKXtpZih0Lm9wdGlvbnMuZHJvcC5lbmFibGVkPSExIT09ZS5lbmFibGVkLGUubGlzdGVuZXJzKXt2YXIgbj0oMCxSLmRlZmF1bHQpKGUubGlzdGVuZXJzKSxyPU9iamVjdC5rZXlzKG4pLnJlZHVjZSgoZnVuY3Rpb24odCxlKXtyZXR1cm4gdFsvXihlbnRlcnxsZWF2ZSkvLnRlc3QoZSk/XCJkcmFnXCIuY29uY2F0KGUpOi9eKGFjdGl2YXRlfGRlYWN0aXZhdGV8bW92ZSkvLnRlc3QoZSk/XCJkcm9wXCIuY29uY2F0KGUpOmVdPW5bZV0sdH0pLHt9KTt0Lm9mZih0Lm9wdGlvbnMuZHJvcC5saXN0ZW5lcnMpLHQub24ociksdC5vcHRpb25zLmRyb3AubGlzdGVuZXJzPXJ9cmV0dXJuIGkuZGVmYXVsdC5mdW5jKGUub25kcm9wKSYmdC5vbihcImRyb3BcIixlLm9uZHJvcCksaS5kZWZhdWx0LmZ1bmMoZS5vbmRyb3BhY3RpdmF0ZSkmJnQub24oXCJkcm9wYWN0aXZhdGVcIixlLm9uZHJvcGFjdGl2YXRlKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJvcGRlYWN0aXZhdGUpJiZ0Lm9uKFwiZHJvcGRlYWN0aXZhdGVcIixlLm9uZHJvcGRlYWN0aXZhdGUpLGkuZGVmYXVsdC5mdW5jKGUub25kcmFnZW50ZXIpJiZ0Lm9uKFwiZHJhZ2VudGVyXCIsZS5vbmRyYWdlbnRlciksaS5kZWZhdWx0LmZ1bmMoZS5vbmRyYWdsZWF2ZSkmJnQub24oXCJkcmFnbGVhdmVcIixlLm9uZHJhZ2xlYXZlKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJvcG1vdmUpJiZ0Lm9uKFwiZHJvcG1vdmVcIixlLm9uZHJvcG1vdmUpLC9eKHBvaW50ZXJ8Y2VudGVyKSQvLnRlc3QoZS5vdmVybGFwKT90Lm9wdGlvbnMuZHJvcC5vdmVybGFwPWUub3ZlcmxhcDppLmRlZmF1bHQubnVtYmVyKGUub3ZlcmxhcCkmJih0Lm9wdGlvbnMuZHJvcC5vdmVybGFwPU1hdGgubWF4KE1hdGgubWluKDEsZS5vdmVybGFwKSwwKSksXCJhY2NlcHRcImluIGUmJih0Lm9wdGlvbnMuZHJvcC5hY2NlcHQ9ZS5hY2NlcHQpLFwiY2hlY2tlclwiaW4gZSYmKHQub3B0aW9ucy5kcm9wLmNoZWNrZXI9ZS5jaGVja2VyKSx0fXJldHVybiBpLmRlZmF1bHQuYm9vbChlKT8odC5vcHRpb25zLmRyb3AuZW5hYmxlZD1lLHQpOnQub3B0aW9ucy5kcm9wfSh0aGlzLHQpfSxyLnByb3RvdHlwZS5kcm9wQ2hlY2s9ZnVuY3Rpb24odCxlLG4scixvLGEpe3JldHVybiBmdW5jdGlvbih0LGUsbixyLG8sYSxzKXt2YXIgbD0hMTtpZighKHM9c3x8dC5nZXRSZWN0KGEpKSlyZXR1cm4hIXQub3B0aW9ucy5kcm9wLmNoZWNrZXImJnQub3B0aW9ucy5kcm9wLmNoZWNrZXIoZSxuLGwsdCxhLHIsbyk7dmFyIHU9dC5vcHRpb25zLmRyb3Aub3ZlcmxhcDtpZihcInBvaW50ZXJcIj09PXUpe3ZhciBjPSgwLEEuZGVmYXVsdCkocixvLFwiZHJhZ1wiKSxmPUIuZ2V0UGFnZVhZKGUpO2YueCs9Yy54LGYueSs9Yy55O3ZhciBkPWYueD5zLmxlZnQmJmYueDxzLnJpZ2h0LHA9Zi55PnMudG9wJiZmLnk8cy5ib3R0b207bD1kJiZwfXZhciB2PXIuZ2V0UmVjdChvKTtpZih2JiZcImNlbnRlclwiPT09dSl7dmFyIGg9di5sZWZ0K3Yud2lkdGgvMixnPXYudG9wK3YuaGVpZ2h0LzI7bD1oPj1zLmxlZnQmJmg8PXMucmlnaHQmJmc+PXMudG9wJiZnPD1zLmJvdHRvbX1yZXR1cm4gdiYmaS5kZWZhdWx0Lm51bWJlcih1KSYmKGw9TWF0aC5tYXgoMCxNYXRoLm1pbihzLnJpZ2h0LHYucmlnaHQpLU1hdGgubWF4KHMubGVmdCx2LmxlZnQpKSpNYXRoLm1heCgwLE1hdGgubWluKHMuYm90dG9tLHYuYm90dG9tKS1NYXRoLm1heChzLnRvcCx2LnRvcCkpLyh2LndpZHRoKnYuaGVpZ2h0KT49dSksdC5vcHRpb25zLmRyb3AuY2hlY2tlciYmKGw9dC5vcHRpb25zLmRyb3AuY2hlY2tlcihlLG4sbCx0LGEscixvKSksbH0odGhpcyx0LGUsbixyLG8sYSl9LG4uZHluYW1pY0Ryb3A9ZnVuY3Rpb24oZSl7cmV0dXJuIGkuZGVmYXVsdC5ib29sKGUpPyh0LmR5bmFtaWNEcm9wPWUsbik6dC5keW5hbWljRHJvcH0sKDAsai5kZWZhdWx0KShlLnBoYXNlbGVzc1R5cGVzLHtkcmFnZW50ZXI6ITAsZHJhZ2xlYXZlOiEwLGRyb3BhY3RpdmF0ZTohMCxkcm9wZGVhY3RpdmF0ZTohMCxkcm9wbW92ZTohMCxkcm9wOiEwfSksZS5tZXRob2REaWN0LmRyb3A9XCJkcm9wem9uZVwiLHQuZHluYW1pY0Ryb3A9ITEsby5hY3Rpb25zLmRyb3A9Z3QuZGVmYXVsdHN9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1zdGFydFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247XCJkcmFnXCI9PT1lLnByZXBhcmVkLm5hbWUmJihlLmRyb3BTdGF0ZT17Y3VyOntkcm9wem9uZTpudWxsLGVsZW1lbnQ6bnVsbH0scHJldjp7ZHJvcHpvbmU6bnVsbCxlbGVtZW50Om51bGx9LHJlamVjdGVkOm51bGwsZXZlbnRzOm51bGwsYWN0aXZlRHJvcHM6W119KX0sXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLXN0YXJ0XCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9KHQuZXZlbnQsdC5pRXZlbnQpO2lmKFwiZHJhZ1wiPT09bi5wcmVwYXJlZC5uYW1lKXt2YXIgbz1uLmRyb3BTdGF0ZTtvLmFjdGl2ZURyb3BzPW51bGwsby5ldmVudHM9bnVsbCxvLmFjdGl2ZURyb3BzPWZ0KGUsbi5lbGVtZW50KSxvLmV2ZW50cz1wdChuLDAsciksby5ldmVudHMuYWN0aXZhdGUmJihjdChvLmFjdGl2ZURyb3BzLG8uZXZlbnRzLmFjdGl2YXRlKSxlLmZpcmUoXCJhY3Rpb25zL2Ryb3A6c3RhcnRcIix7aW50ZXJhY3Rpb246bixkcmFnRXZlbnQ6cn0pKX19LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6aHQsXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmlFdmVudDtcImRyYWdcIj09PW4ucHJlcGFyZWQubmFtZSYmKHZ0KG4sbi5kcm9wU3RhdGUuZXZlbnRzKSxlLmZpcmUoXCJhY3Rpb25zL2Ryb3A6bW92ZVwiLHtpbnRlcmFjdGlvbjpuLGRyYWdFdmVudDpyfSksbi5kcm9wU3RhdGUuZXZlbnRzPXt9KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLWVuZFwiOmZ1bmN0aW9uKHQsZSl7aWYoXCJkcmFnXCI9PT10LmludGVyYWN0aW9uLnByZXBhcmVkLm5hbWUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmlFdmVudDtodCh0LGUpLHZ0KG4sbi5kcm9wU3RhdGUuZXZlbnRzKSxlLmZpcmUoXCJhY3Rpb25zL2Ryb3A6ZW5kXCIse2ludGVyYWN0aW9uOm4sZHJhZ0V2ZW50OnJ9KX19LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2lmKFwiZHJhZ1wiPT09ZS5wcmVwYXJlZC5uYW1lKXt2YXIgbj1lLmRyb3BTdGF0ZTtuJiYobi5hY3RpdmVEcm9wcz1udWxsLG4uZXZlbnRzPW51bGwsbi5jdXIuZHJvcHpvbmU9bnVsbCxuLmN1ci5lbGVtZW50PW51bGwsbi5wcmV2LmRyb3B6b25lPW51bGwsbi5wcmV2LmVsZW1lbnQ9bnVsbCxuLnJlamVjdGVkPSExKX19fSxnZXRBY3RpdmVEcm9wczpmdCxnZXREcm9wOmR0LGdldERyb3BFdmVudHM6cHQsZmlyZURyb3BFdmVudHM6dnQsZGVmYXVsdHM6e2VuYWJsZWQ6ITEsYWNjZXB0Om51bGwsb3ZlcmxhcDpcInBvaW50ZXJcIn19LHl0PWd0O3V0LmRlZmF1bHQ9eXQ7dmFyIG10PXt9O2Z1bmN0aW9uIGJ0KHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmlFdmVudCxyPXQucGhhc2U7aWYoXCJnZXN0dXJlXCI9PT1lLnByZXBhcmVkLm5hbWUpe3ZhciBvPWUucG9pbnRlcnMubWFwKChmdW5jdGlvbih0KXtyZXR1cm4gdC5wb2ludGVyfSkpLGE9XCJzdGFydFwiPT09cixzPVwiZW5kXCI9PT1yLGw9ZS5pbnRlcmFjdGFibGUub3B0aW9ucy5kZWx0YVNvdXJjZTtpZihuLnRvdWNoZXM9W29bMF0sb1sxXV0sYSluLmRpc3RhbmNlPUIudG91Y2hEaXN0YW5jZShvLGwpLG4uYm94PUIudG91Y2hCQm94KG8pLG4uc2NhbGU9MSxuLmRzPTAsbi5hbmdsZT1CLnRvdWNoQW5nbGUobyxsKSxuLmRhPTAsZS5nZXN0dXJlLnN0YXJ0RGlzdGFuY2U9bi5kaXN0YW5jZSxlLmdlc3R1cmUuc3RhcnRBbmdsZT1uLmFuZ2xlO2Vsc2UgaWYocyl7dmFyIHU9ZS5wcmV2RXZlbnQ7bi5kaXN0YW5jZT11LmRpc3RhbmNlLG4uYm94PXUuYm94LG4uc2NhbGU9dS5zY2FsZSxuLmRzPTAsbi5hbmdsZT11LmFuZ2xlLG4uZGE9MH1lbHNlIG4uZGlzdGFuY2U9Qi50b3VjaERpc3RhbmNlKG8sbCksbi5ib3g9Qi50b3VjaEJCb3gobyksbi5zY2FsZT1uLmRpc3RhbmNlL2UuZ2VzdHVyZS5zdGFydERpc3RhbmNlLG4uYW5nbGU9Qi50b3VjaEFuZ2xlKG8sbCksbi5kcz1uLnNjYWxlLWUuZ2VzdHVyZS5zY2FsZSxuLmRhPW4uYW5nbGUtZS5nZXN0dXJlLmFuZ2xlO2UuZ2VzdHVyZS5kaXN0YW5jZT1uLmRpc3RhbmNlLGUuZ2VzdHVyZS5hbmdsZT1uLmFuZ2xlLGkuZGVmYXVsdC5udW1iZXIobi5zY2FsZSkmJm4uc2NhbGUhPT0xLzAmJiFpc05hTihuLnNjYWxlKSYmKGUuZ2VzdHVyZS5zY2FsZT1uLnNjYWxlKX19T2JqZWN0LmRlZmluZVByb3BlcnR5KG10LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLG10LmRlZmF1bHQ9dm9pZCAwO3ZhciB4dD17aWQ6XCJhY3Rpb25zL2dlc3R1cmVcIixiZWZvcmU6W1wiYWN0aW9ucy9kcmFnXCIsXCJhY3Rpb25zL3Jlc2l6ZVwiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuYWN0aW9ucyxuPXQuSW50ZXJhY3RhYmxlLHI9dC5kZWZhdWx0cztuLnByb3RvdHlwZS5nZXN0dXJhYmxlPWZ1bmN0aW9uKHQpe3JldHVybiBpLmRlZmF1bHQub2JqZWN0KHQpPyh0aGlzLm9wdGlvbnMuZ2VzdHVyZS5lbmFibGVkPSExIT09dC5lbmFibGVkLHRoaXMuc2V0UGVyQWN0aW9uKFwiZ2VzdHVyZVwiLHQpLHRoaXMuc2V0T25FdmVudHMoXCJnZXN0dXJlXCIsdCksdGhpcyk6aS5kZWZhdWx0LmJvb2wodCk/KHRoaXMub3B0aW9ucy5nZXN0dXJlLmVuYWJsZWQ9dCx0aGlzKTp0aGlzLm9wdGlvbnMuZ2VzdHVyZX0sZS5tYXAuZ2VzdHVyZT14dCxlLm1ldGhvZERpY3QuZ2VzdHVyZT1cImdlc3R1cmFibGVcIixyLmFjdGlvbnMuZ2VzdHVyZT14dC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczphY3Rpb24tc3RhcnRcIjpidCxcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOmJ0LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1lbmRcIjpidCxcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLmdlc3R1cmU9e2FuZ2xlOjAsZGlzdGFuY2U6MCxzY2FsZToxLHN0YXJ0QW5nbGU6MCxzdGFydERpc3RhbmNlOjB9fSxcImF1dG8tc3RhcnQ6Y2hlY2tcIjpmdW5jdGlvbih0KXtpZighKHQuaW50ZXJhY3Rpb24ucG9pbnRlcnMubGVuZ3RoPDIpKXt2YXIgZT10LmludGVyYWN0YWJsZS5vcHRpb25zLmdlc3R1cmU7aWYoZSYmZS5lbmFibGVkKXJldHVybiB0LmFjdGlvbj17bmFtZTpcImdlc3R1cmVcIn0sITF9fX0sZGVmYXVsdHM6e30sZ2V0Q3Vyc29yOmZ1bmN0aW9uKCl7cmV0dXJuXCJcIn19LHd0PXh0O210LmRlZmF1bHQ9d3Q7dmFyIF90PXt9O2Z1bmN0aW9uIFB0KHQsZSxuLHIsbyxhLHMpe2lmKCFlKXJldHVybiExO2lmKCEwPT09ZSl7dmFyIGw9aS5kZWZhdWx0Lm51bWJlcihhLndpZHRoKT9hLndpZHRoOmEucmlnaHQtYS5sZWZ0LHU9aS5kZWZhdWx0Lm51bWJlcihhLmhlaWdodCk/YS5oZWlnaHQ6YS5ib3R0b20tYS50b3A7aWYocz1NYXRoLm1pbihzLE1hdGguYWJzKChcImxlZnRcIj09PXR8fFwicmlnaHRcIj09PXQ/bDp1KS8yKSksbDwwJiYoXCJsZWZ0XCI9PT10P3Q9XCJyaWdodFwiOlwicmlnaHRcIj09PXQmJih0PVwibGVmdFwiKSksdTwwJiYoXCJ0b3BcIj09PXQ/dD1cImJvdHRvbVwiOlwiYm90dG9tXCI9PT10JiYodD1cInRvcFwiKSksXCJsZWZ0XCI9PT10KXJldHVybiBuLng8KGw+PTA/YS5sZWZ0OmEucmlnaHQpK3M7aWYoXCJ0b3BcIj09PXQpcmV0dXJuIG4ueTwodT49MD9hLnRvcDphLmJvdHRvbSkrcztpZihcInJpZ2h0XCI9PT10KXJldHVybiBuLng+KGw+PTA/YS5yaWdodDphLmxlZnQpLXM7aWYoXCJib3R0b21cIj09PXQpcmV0dXJuIG4ueT4odT49MD9hLmJvdHRvbTphLnRvcCktc31yZXR1cm4hIWkuZGVmYXVsdC5lbGVtZW50KHIpJiYoaS5kZWZhdWx0LmVsZW1lbnQoZSk/ZT09PXI6Xy5tYXRjaGVzVXBUbyhyLGUsbykpfWZ1bmN0aW9uIE90KHQpe3ZhciBlPXQuaUV2ZW50LG49dC5pbnRlcmFjdGlvbjtpZihcInJlc2l6ZVwiPT09bi5wcmVwYXJlZC5uYW1lJiZuLnJlc2l6ZUF4ZXMpe3ZhciByPWU7bi5pbnRlcmFjdGFibGUub3B0aW9ucy5yZXNpemUuc3F1YXJlPyhcInlcIj09PW4ucmVzaXplQXhlcz9yLmRlbHRhLng9ci5kZWx0YS55OnIuZGVsdGEueT1yLmRlbHRhLngsci5heGVzPVwieHlcIik6KHIuYXhlcz1uLnJlc2l6ZUF4ZXMsXCJ4XCI9PT1uLnJlc2l6ZUF4ZXM/ci5kZWx0YS55PTA6XCJ5XCI9PT1uLnJlc2l6ZUF4ZXMmJihyLmRlbHRhLng9MCkpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkoX3QsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksX3QuZGVmYXVsdD12b2lkIDA7dmFyIFN0PXtpZDpcImFjdGlvbnMvcmVzaXplXCIsYmVmb3JlOltcImFjdGlvbnMvZHJhZ1wiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuYWN0aW9ucyxuPXQuYnJvd3NlcixyPXQuSW50ZXJhY3RhYmxlLG89dC5kZWZhdWx0cztTdC5jdXJzb3JzPWZ1bmN0aW9uKHQpe3JldHVybiB0LmlzSWU5P3t4OlwiZS1yZXNpemVcIix5Olwicy1yZXNpemVcIix4eTpcInNlLXJlc2l6ZVwiLHRvcDpcIm4tcmVzaXplXCIsbGVmdDpcInctcmVzaXplXCIsYm90dG9tOlwicy1yZXNpemVcIixyaWdodDpcImUtcmVzaXplXCIsdG9wbGVmdDpcInNlLXJlc2l6ZVwiLGJvdHRvbXJpZ2h0Olwic2UtcmVzaXplXCIsdG9wcmlnaHQ6XCJuZS1yZXNpemVcIixib3R0b21sZWZ0OlwibmUtcmVzaXplXCJ9Ont4OlwiZXctcmVzaXplXCIseTpcIm5zLXJlc2l6ZVwiLHh5OlwibndzZS1yZXNpemVcIix0b3A6XCJucy1yZXNpemVcIixsZWZ0OlwiZXctcmVzaXplXCIsYm90dG9tOlwibnMtcmVzaXplXCIscmlnaHQ6XCJldy1yZXNpemVcIix0b3BsZWZ0OlwibndzZS1yZXNpemVcIixib3R0b21yaWdodDpcIm53c2UtcmVzaXplXCIsdG9wcmlnaHQ6XCJuZXN3LXJlc2l6ZVwiLGJvdHRvbWxlZnQ6XCJuZXN3LXJlc2l6ZVwifX0obiksU3QuZGVmYXVsdE1hcmdpbj1uLnN1cHBvcnRzVG91Y2h8fG4uc3VwcG9ydHNQb2ludGVyRXZlbnQ/MjA6MTAsci5wcm90b3R5cGUucmVzaXphYmxlPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0LGUsbil7cmV0dXJuIGkuZGVmYXVsdC5vYmplY3QoZSk/KHQub3B0aW9ucy5yZXNpemUuZW5hYmxlZD0hMSE9PWUuZW5hYmxlZCx0LnNldFBlckFjdGlvbihcInJlc2l6ZVwiLGUpLHQuc2V0T25FdmVudHMoXCJyZXNpemVcIixlKSxpLmRlZmF1bHQuc3RyaW5nKGUuYXhpcykmJi9eeCR8XnkkfF54eSQvLnRlc3QoZS5heGlzKT90Lm9wdGlvbnMucmVzaXplLmF4aXM9ZS5heGlzOm51bGw9PT1lLmF4aXMmJih0Lm9wdGlvbnMucmVzaXplLmF4aXM9bi5kZWZhdWx0cy5hY3Rpb25zLnJlc2l6ZS5heGlzKSxpLmRlZmF1bHQuYm9vbChlLnByZXNlcnZlQXNwZWN0UmF0aW8pP3Qub3B0aW9ucy5yZXNpemUucHJlc2VydmVBc3BlY3RSYXRpbz1lLnByZXNlcnZlQXNwZWN0UmF0aW86aS5kZWZhdWx0LmJvb2woZS5zcXVhcmUpJiYodC5vcHRpb25zLnJlc2l6ZS5zcXVhcmU9ZS5zcXVhcmUpLHQpOmkuZGVmYXVsdC5ib29sKGUpPyh0Lm9wdGlvbnMucmVzaXplLmVuYWJsZWQ9ZSx0KTp0Lm9wdGlvbnMucmVzaXplfSh0aGlzLGUsdCl9LGUubWFwLnJlc2l6ZT1TdCxlLm1ldGhvZERpY3QucmVzaXplPVwicmVzaXphYmxlXCIsby5hY3Rpb25zLnJlc2l6ZT1TdC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLnJlc2l6ZUF4ZXM9XCJ4eVwifSxcImludGVyYWN0aW9uczphY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0KXshZnVuY3Rpb24odCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwicmVzaXplXCI9PT1uLnByZXBhcmVkLm5hbWUmJm4ucHJlcGFyZWQuZWRnZXMpe3ZhciByPWUsbz1uLnJlY3Q7bi5fcmVjdHM9e3N0YXJ0OigwLGouZGVmYXVsdCkoe30sbyksY29ycmVjdGVkOigwLGouZGVmYXVsdCkoe30sbykscHJldmlvdXM6KDAsai5kZWZhdWx0KSh7fSxvKSxkZWx0YTp7bGVmdDowLHJpZ2h0OjAsd2lkdGg6MCx0b3A6MCxib3R0b206MCxoZWlnaHQ6MH19LHIuZWRnZXM9bi5wcmVwYXJlZC5lZGdlcyxyLnJlY3Q9bi5fcmVjdHMuY29ycmVjdGVkLHIuZGVsdGFSZWN0PW4uX3JlY3RzLmRlbHRhfX0odCksT3QodCl9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQpe3ZhciBlPXQuaUV2ZW50LG49dC5pbnRlcmFjdGlvbjtpZihcInJlc2l6ZVwiPT09bi5wcmVwYXJlZC5uYW1lJiZuLnByZXBhcmVkLmVkZ2VzKXt2YXIgcj1lLG89bi5pbnRlcmFjdGFibGUub3B0aW9ucy5yZXNpemUuaW52ZXJ0LGk9XCJyZXBvc2l0aW9uXCI9PT1vfHxcIm5lZ2F0ZVwiPT09byxhPW4ucmVjdCxzPW4uX3JlY3RzLGw9cy5zdGFydCx1PXMuY29ycmVjdGVkLGM9cy5kZWx0YSxmPXMucHJldmlvdXM7aWYoKDAsai5kZWZhdWx0KShmLHUpLGkpe2lmKCgwLGouZGVmYXVsdCkodSxhKSxcInJlcG9zaXRpb25cIj09PW8pe2lmKHUudG9wPnUuYm90dG9tKXt2YXIgZD11LnRvcDt1LnRvcD11LmJvdHRvbSx1LmJvdHRvbT1kfWlmKHUubGVmdD51LnJpZ2h0KXt2YXIgcD11LmxlZnQ7dS5sZWZ0PXUucmlnaHQsdS5yaWdodD1wfX19ZWxzZSB1LnRvcD1NYXRoLm1pbihhLnRvcCxsLmJvdHRvbSksdS5ib3R0b209TWF0aC5tYXgoYS5ib3R0b20sbC50b3ApLHUubGVmdD1NYXRoLm1pbihhLmxlZnQsbC5yaWdodCksdS5yaWdodD1NYXRoLm1heChhLnJpZ2h0LGwubGVmdCk7Zm9yKHZhciB2IGluIHUud2lkdGg9dS5yaWdodC11LmxlZnQsdS5oZWlnaHQ9dS5ib3R0b20tdS50b3AsdSljW3ZdPXVbdl0tZlt2XTtyLmVkZ2VzPW4ucHJlcGFyZWQuZWRnZXMsci5yZWN0PXUsci5kZWx0YVJlY3Q9Y319KHQpLE90KHQpfSxcImludGVyYWN0aW9uczphY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwicmVzaXplXCI9PT1uLnByZXBhcmVkLm5hbWUmJm4ucHJlcGFyZWQuZWRnZXMpe3ZhciByPWU7ci5lZGdlcz1uLnByZXBhcmVkLmVkZ2VzLHIucmVjdD1uLl9yZWN0cy5jb3JyZWN0ZWQsci5kZWx0YVJlY3Q9bi5fcmVjdHMuZGVsdGF9fSxcImF1dG8tc3RhcnQ6Y2hlY2tcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5pbnRlcmFjdGFibGUscj10LmVsZW1lbnQsbz10LnJlY3QsYT10LmJ1dHRvbnM7aWYobyl7dmFyIHM9KDAsai5kZWZhdWx0KSh7fSxlLmNvb3Jkcy5jdXIucGFnZSksbD1uLm9wdGlvbnMucmVzaXplO2lmKGwmJmwuZW5hYmxlZCYmKCFlLnBvaW50ZXJJc0Rvd258fCEvbW91c2V8cG9pbnRlci8udGVzdChlLnBvaW50ZXJUeXBlKXx8MCE9KGEmbC5tb3VzZUJ1dHRvbnMpKSl7aWYoaS5kZWZhdWx0Lm9iamVjdChsLmVkZ2VzKSl7dmFyIHU9e2xlZnQ6ITEscmlnaHQ6ITEsdG9wOiExLGJvdHRvbTohMX07Zm9yKHZhciBjIGluIHUpdVtjXT1QdChjLGwuZWRnZXNbY10scyxlLl9sYXRlc3RQb2ludGVyLmV2ZW50VGFyZ2V0LHIsbyxsLm1hcmdpbnx8U3QuZGVmYXVsdE1hcmdpbik7dS5sZWZ0PXUubGVmdCYmIXUucmlnaHQsdS50b3A9dS50b3AmJiF1LmJvdHRvbSwodS5sZWZ0fHx1LnJpZ2h0fHx1LnRvcHx8dS5ib3R0b20pJiYodC5hY3Rpb249e25hbWU6XCJyZXNpemVcIixlZGdlczp1fSl9ZWxzZXt2YXIgZj1cInlcIiE9PWwuYXhpcyYmcy54Pm8ucmlnaHQtU3QuZGVmYXVsdE1hcmdpbixkPVwieFwiIT09bC5heGlzJiZzLnk+by5ib3R0b20tU3QuZGVmYXVsdE1hcmdpbjsoZnx8ZCkmJih0LmFjdGlvbj17bmFtZTpcInJlc2l6ZVwiLGF4ZXM6KGY/XCJ4XCI6XCJcIikrKGQ/XCJ5XCI6XCJcIil9KX1yZXR1cm4hdC5hY3Rpb24mJnZvaWQgMH19fX0sZGVmYXVsdHM6e3NxdWFyZTohMSxwcmVzZXJ2ZUFzcGVjdFJhdGlvOiExLGF4aXM6XCJ4eVwiLG1hcmdpbjpOYU4sZWRnZXM6bnVsbCxpbnZlcnQ6XCJub25lXCJ9LGN1cnNvcnM6bnVsbCxnZXRDdXJzb3I6ZnVuY3Rpb24odCl7dmFyIGU9dC5lZGdlcyxuPXQuYXhpcyxyPXQubmFtZSxvPVN0LmN1cnNvcnMsaT1udWxsO2lmKG4paT1vW3Irbl07ZWxzZSBpZihlKXtmb3IodmFyIGE9XCJcIixzPVtcInRvcFwiLFwiYm90dG9tXCIsXCJsZWZ0XCIsXCJyaWdodFwiXSxsPTA7bDxzLmxlbmd0aDtsKyspe3ZhciB1PXNbbF07ZVt1XSYmKGErPXUpfWk9b1thXX1yZXR1cm4gaX0sZGVmYXVsdE1hcmdpbjpudWxsfSxFdD1TdDtfdC5kZWZhdWx0PUV0O3ZhciBUdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoVHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksVHQuZGVmYXVsdD12b2lkIDA7dmFyIE10PXtpZDpcImFjdGlvbnNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3QudXNlUGx1Z2luKG10LmRlZmF1bHQpLHQudXNlUGx1Z2luKF90LmRlZmF1bHQpLHQudXNlUGx1Z2luKGMuZGVmYXVsdCksdC51c2VQbHVnaW4odXQuZGVmYXVsdCl9fTtUdC5kZWZhdWx0PU10O3ZhciBqdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoanQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksanQuZGVmYXVsdD12b2lkIDA7dmFyIGt0LEl0LER0PTAsQXQ9e3JlcXVlc3Q6ZnVuY3Rpb24odCl7cmV0dXJuIGt0KHQpfSxjYW5jZWw6ZnVuY3Rpb24odCl7cmV0dXJuIEl0KHQpfSxpbml0OmZ1bmN0aW9uKHQpe2lmKGt0PXQucmVxdWVzdEFuaW1hdGlvbkZyYW1lLEl0PXQuY2FuY2VsQW5pbWF0aW9uRnJhbWUsIWt0KWZvcih2YXIgZT1bXCJtc1wiLFwibW96XCIsXCJ3ZWJraXRcIixcIm9cIl0sbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO2t0PXRbXCJcIi5jb25jYXQocixcIlJlcXVlc3RBbmltYXRpb25GcmFtZVwiKV0sSXQ9dFtcIlwiLmNvbmNhdChyLFwiQ2FuY2VsQW5pbWF0aW9uRnJhbWVcIildfHx0W1wiXCIuY29uY2F0KHIsXCJDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIildfWt0PWt0JiZrdC5iaW5kKHQpLEl0PUl0JiZJdC5iaW5kKHQpLGt0fHwoa3Q9ZnVuY3Rpb24oZSl7dmFyIG49RGF0ZS5ub3coKSxyPU1hdGgubWF4KDAsMTYtKG4tRHQpKSxvPXQuc2V0VGltZW91dCgoZnVuY3Rpb24oKXtlKG4rcil9KSxyKTtyZXR1cm4gRHQ9bityLG99LEl0PWZ1bmN0aW9uKHQpe3JldHVybiBjbGVhclRpbWVvdXQodCl9KX19O2p0LmRlZmF1bHQ9QXQ7dmFyIFJ0PXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShSdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxSdC5nZXRDb250YWluZXI9Q3QsUnQuZ2V0U2Nyb2xsPUZ0LFJ0LmdldFNjcm9sbFNpemU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC53aW5kb3codCkmJih0PXdpbmRvdy5kb2N1bWVudC5ib2R5KSx7eDp0LnNjcm9sbFdpZHRoLHk6dC5zY3JvbGxIZWlnaHR9fSxSdC5nZXRTY3JvbGxTaXplRGVsdGE9ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5lbGVtZW50LG89biYmbi5pbnRlcmFjdGFibGUub3B0aW9uc1tuLnByZXBhcmVkLm5hbWVdLmF1dG9TY3JvbGw7aWYoIW98fCFvLmVuYWJsZWQpcmV0dXJuIGUoKSx7eDowLHk6MH07dmFyIGk9Q3Qoby5jb250YWluZXIsbi5pbnRlcmFjdGFibGUsciksYT1GdChpKTtlKCk7dmFyIHM9RnQoaSk7cmV0dXJue3g6cy54LWEueCx5OnMueS1hLnl9fSxSdC5kZWZhdWx0PXZvaWQgMDt2YXIgenQ9e2RlZmF1bHRzOntlbmFibGVkOiExLG1hcmdpbjo2MCxjb250YWluZXI6bnVsbCxzcGVlZDozMDB9LG5vdzpEYXRlLm5vdyxpbnRlcmFjdGlvbjpudWxsLGk6MCx4OjAseTowLGlzU2Nyb2xsaW5nOiExLHByZXZUaW1lOjAsbWFyZ2luOjAsc3BlZWQ6MCxzdGFydDpmdW5jdGlvbih0KXt6dC5pc1Njcm9sbGluZz0hMCxqdC5kZWZhdWx0LmNhbmNlbCh6dC5pKSx0LmF1dG9TY3JvbGw9enQsenQuaW50ZXJhY3Rpb249dCx6dC5wcmV2VGltZT16dC5ub3coKSx6dC5pPWp0LmRlZmF1bHQucmVxdWVzdCh6dC5zY3JvbGwpfSxzdG9wOmZ1bmN0aW9uKCl7enQuaXNTY3JvbGxpbmc9ITEsenQuaW50ZXJhY3Rpb24mJih6dC5pbnRlcmFjdGlvbi5hdXRvU2Nyb2xsPW51bGwpLGp0LmRlZmF1bHQuY2FuY2VsKHp0LmkpfSxzY3JvbGw6ZnVuY3Rpb24oKXt2YXIgdD16dC5pbnRlcmFjdGlvbixlPXQuaW50ZXJhY3RhYmxlLG49dC5lbGVtZW50LHI9dC5wcmVwYXJlZC5uYW1lLG89ZS5vcHRpb25zW3JdLmF1dG9TY3JvbGwsYT1DdChvLmNvbnRhaW5lcixlLG4pLHM9enQubm93KCksbD0ocy16dC5wcmV2VGltZSkvMWUzLHU9by5zcGVlZCpsO2lmKHU+PTEpe3ZhciBjPXt4Onp0LngqdSx5Onp0LnkqdX07aWYoYy54fHxjLnkpe3ZhciBmPUZ0KGEpO2kuZGVmYXVsdC53aW5kb3coYSk/YS5zY3JvbGxCeShjLngsYy55KTphJiYoYS5zY3JvbGxMZWZ0Kz1jLngsYS5zY3JvbGxUb3ArPWMueSk7dmFyIGQ9RnQoYSkscD17eDpkLngtZi54LHk6ZC55LWYueX07KHAueHx8cC55KSYmZS5maXJlKHt0eXBlOlwiYXV0b3Njcm9sbFwiLHRhcmdldDpuLGludGVyYWN0YWJsZTplLGRlbHRhOnAsaW50ZXJhY3Rpb246dCxjb250YWluZXI6YX0pfXp0LnByZXZUaW1lPXN9enQuaXNTY3JvbGxpbmcmJihqdC5kZWZhdWx0LmNhbmNlbCh6dC5pKSx6dC5pPWp0LmRlZmF1bHQucmVxdWVzdCh6dC5zY3JvbGwpKX0sY2hlY2s6ZnVuY3Rpb24odCxlKXt2YXIgbjtyZXR1cm4gbnVsbD09KG49dC5vcHRpb25zW2VdLmF1dG9TY3JvbGwpP3ZvaWQgMDpuLmVuYWJsZWR9LG9uSW50ZXJhY3Rpb25Nb3ZlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LnBvaW50ZXI7aWYoZS5pbnRlcmFjdGluZygpJiZ6dC5jaGVjayhlLmludGVyYWN0YWJsZSxlLnByZXBhcmVkLm5hbWUpKWlmKGUuc2ltdWxhdGlvbil6dC54PXp0Lnk9MDtlbHNle3ZhciByLG8sYSxzLGw9ZS5pbnRlcmFjdGFibGUsdT1lLmVsZW1lbnQsYz1lLnByZXBhcmVkLm5hbWUsZj1sLm9wdGlvbnNbY10uYXV0b1Njcm9sbCxkPUN0KGYuY29udGFpbmVyLGwsdSk7aWYoaS5kZWZhdWx0LndpbmRvdyhkKSlzPW4uY2xpZW50WDx6dC5tYXJnaW4scj1uLmNsaWVudFk8enQubWFyZ2luLG89bi5jbGllbnRYPmQuaW5uZXJXaWR0aC16dC5tYXJnaW4sYT1uLmNsaWVudFk+ZC5pbm5lckhlaWdodC16dC5tYXJnaW47ZWxzZXt2YXIgcD1fLmdldEVsZW1lbnRDbGllbnRSZWN0KGQpO3M9bi5jbGllbnRYPHAubGVmdCt6dC5tYXJnaW4scj1uLmNsaWVudFk8cC50b3ArenQubWFyZ2luLG89bi5jbGllbnRYPnAucmlnaHQtenQubWFyZ2luLGE9bi5jbGllbnRZPnAuYm90dG9tLXp0Lm1hcmdpbn16dC54PW8/MTpzPy0xOjAsenQueT1hPzE6cj8tMTowLHp0LmlzU2Nyb2xsaW5nfHwoenQubWFyZ2luPWYubWFyZ2luLHp0LnNwZWVkPWYuc3BlZWQsenQuc3RhcnQoZSkpfX19O2Z1bmN0aW9uIEN0KHQsbixyKXtyZXR1cm4oaS5kZWZhdWx0LnN0cmluZyh0KT8oMCxrLmdldFN0cmluZ09wdGlvblJlc3VsdCkodCxuLHIpOnQpfHwoMCxlLmdldFdpbmRvdykocil9ZnVuY3Rpb24gRnQodCl7cmV0dXJuIGkuZGVmYXVsdC53aW5kb3codCkmJih0PXdpbmRvdy5kb2N1bWVudC5ib2R5KSx7eDp0LnNjcm9sbExlZnQseTp0LnNjcm9sbFRvcH19dmFyIFh0PXtpZDpcImF1dG8tc2Nyb2xsXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmRlZmF1bHRzLG49dC5hY3Rpb25zO3QuYXV0b1Njcm9sbD16dCx6dC5ub3c9ZnVuY3Rpb24oKXtyZXR1cm4gdC5ub3coKX0sbi5waGFzZWxlc3NUeXBlcy5hdXRvc2Nyb2xsPSEwLGUucGVyQWN0aW9uLmF1dG9TY3JvbGw9enQuZGVmYXVsdHN9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dC5pbnRlcmFjdGlvbi5hdXRvU2Nyb2xsPW51bGx9LFwiaW50ZXJhY3Rpb25zOmRlc3Ryb3lcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLmF1dG9TY3JvbGw9bnVsbCx6dC5zdG9wKCksenQuaW50ZXJhY3Rpb24mJih6dC5pbnRlcmFjdGlvbj1udWxsKX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOnp0LnN0b3AsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0KXtyZXR1cm4genQub25JbnRlcmFjdGlvbk1vdmUodCl9fX07UnQuZGVmYXVsdD1YdDt2YXIgWXQ9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFl0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFl0Lndhcm5PbmNlPWZ1bmN0aW9uKHQsbil7dmFyIHI9ITE7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHJ8fChlLndpbmRvdy5jb25zb2xlLndhcm4obikscj0hMCksdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fSxZdC5jb3B5QWN0aW9uPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQubmFtZT1lLm5hbWUsdC5heGlzPWUuYXhpcyx0LmVkZ2VzPWUuZWRnZXMsdH0sWXQuc2lnbj12b2lkIDAsWXQuc2lnbj1mdW5jdGlvbih0KXtyZXR1cm4gdD49MD8xOi0xfTt2YXIgQnQ9e307ZnVuY3Rpb24gV3QodCl7cmV0dXJuIGkuZGVmYXVsdC5ib29sKHQpPyh0aGlzLm9wdGlvbnMuc3R5bGVDdXJzb3I9dCx0aGlzKTpudWxsPT09dD8oZGVsZXRlIHRoaXMub3B0aW9ucy5zdHlsZUN1cnNvcix0aGlzKTp0aGlzLm9wdGlvbnMuc3R5bGVDdXJzb3J9ZnVuY3Rpb24gTHQodCl7cmV0dXJuIGkuZGVmYXVsdC5mdW5jKHQpPyh0aGlzLm9wdGlvbnMuYWN0aW9uQ2hlY2tlcj10LHRoaXMpOm51bGw9PT10PyhkZWxldGUgdGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXIsdGhpcyk6dGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXJ9T2JqZWN0LmRlZmluZVByb3BlcnR5KEJ0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEJ0LmRlZmF1bHQ9dm9pZCAwO3ZhciBVdD17aWQ6XCJhdXRvLXN0YXJ0L2ludGVyYWN0YWJsZU1ldGhvZHNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuSW50ZXJhY3RhYmxlO2UucHJvdG90eXBlLmdldEFjdGlvbj1mdW5jdGlvbihlLG4scixvKXt2YXIgaT1mdW5jdGlvbih0LGUsbixyLG8pe3ZhciBpPXQuZ2V0UmVjdChyKSxhPXthY3Rpb246bnVsbCxpbnRlcmFjdGFibGU6dCxpbnRlcmFjdGlvbjpuLGVsZW1lbnQ6cixyZWN0OmksYnV0dG9uczplLmJ1dHRvbnN8fHswOjEsMTo0LDM6OCw0OjE2fVtlLmJ1dHRvbl19O3JldHVybiBvLmZpcmUoXCJhdXRvLXN0YXJ0OmNoZWNrXCIsYSksYS5hY3Rpb259KHRoaXMsbixyLG8sdCk7cmV0dXJuIHRoaXMub3B0aW9ucy5hY3Rpb25DaGVja2VyP3RoaXMub3B0aW9ucy5hY3Rpb25DaGVja2VyKGUsbixpLHRoaXMsbyxyKTppfSxlLnByb3RvdHlwZS5pZ25vcmVGcm9tPSgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2JhY2tDb21wYXRPcHRpb24oXCJpZ25vcmVGcm9tXCIsdCl9KSxcIkludGVyYWN0YWJsZS5pZ25vcmVGcm9tKCkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIEludGVyYWN0YmxlLmRyYWdnYWJsZSh7aWdub3JlRnJvbTogbmV3VmFsdWV9KS5cIiksZS5wcm90b3R5cGUuYWxsb3dGcm9tPSgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2JhY2tDb21wYXRPcHRpb24oXCJhbGxvd0Zyb21cIix0KX0pLFwiSW50ZXJhY3RhYmxlLmFsbG93RnJvbSgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBJbnRlcmFjdGJsZS5kcmFnZ2FibGUoe2FsbG93RnJvbTogbmV3VmFsdWV9KS5cIiksZS5wcm90b3R5cGUuYWN0aW9uQ2hlY2tlcj1MdCxlLnByb3RvdHlwZS5zdHlsZUN1cnNvcj1XdH19O0J0LmRlZmF1bHQ9VXQ7dmFyIFZ0PXt9O2Z1bmN0aW9uIE50KHQsZSxuLHIsbyl7cmV0dXJuIGUudGVzdElnbm9yZUFsbG93KGUub3B0aW9uc1t0Lm5hbWVdLG4scikmJmUub3B0aW9uc1t0Lm5hbWVdLmVuYWJsZWQmJkh0KGUsbix0LG8pP3Q6bnVsbH1mdW5jdGlvbiBxdCh0LGUsbixyLG8saSxhKXtmb3IodmFyIHM9MCxsPXIubGVuZ3RoO3M8bDtzKyspe3ZhciB1PXJbc10sYz1vW3NdLGY9dS5nZXRBY3Rpb24oZSxuLHQsYyk7aWYoZil7dmFyIGQ9TnQoZix1LGMsaSxhKTtpZihkKXJldHVybnthY3Rpb246ZCxpbnRlcmFjdGFibGU6dSxlbGVtZW50OmN9fX1yZXR1cm57YWN0aW9uOm51bGwsaW50ZXJhY3RhYmxlOm51bGwsZWxlbWVudDpudWxsfX1mdW5jdGlvbiAkdCh0LGUsbixyLG8pe3ZhciBhPVtdLHM9W10sbD1yO2Z1bmN0aW9uIHUodCl7YS5wdXNoKHQpLHMucHVzaChsKX1mb3IoO2kuZGVmYXVsdC5lbGVtZW50KGwpOyl7YT1bXSxzPVtdLG8uaW50ZXJhY3RhYmxlcy5mb3JFYWNoTWF0Y2gobCx1KTt2YXIgYz1xdCh0LGUsbixhLHMscixvKTtpZihjLmFjdGlvbiYmIWMuaW50ZXJhY3RhYmxlLm9wdGlvbnNbYy5hY3Rpb24ubmFtZV0ubWFudWFsU3RhcnQpcmV0dXJuIGM7bD1fLnBhcmVudE5vZGUobCl9cmV0dXJue2FjdGlvbjpudWxsLGludGVyYWN0YWJsZTpudWxsLGVsZW1lbnQ6bnVsbH19ZnVuY3Rpb24gR3QodCxlLG4pe3ZhciByPWUuYWN0aW9uLG89ZS5pbnRlcmFjdGFibGUsaT1lLmVsZW1lbnQ7cj1yfHx7bmFtZTpudWxsfSx0LmludGVyYWN0YWJsZT1vLHQuZWxlbWVudD1pLCgwLFl0LmNvcHlBY3Rpb24pKHQucHJlcGFyZWQsciksdC5yZWN0PW8mJnIubmFtZT9vLmdldFJlY3QoaSk6bnVsbCxKdCh0LG4pLG4uZmlyZShcImF1dG9TdGFydDpwcmVwYXJlZFwiLHtpbnRlcmFjdGlvbjp0fSl9ZnVuY3Rpb24gSHQodCxlLG4scil7dmFyIG89dC5vcHRpb25zLGk9b1tuLm5hbWVdLm1heCxhPW9bbi5uYW1lXS5tYXhQZXJFbGVtZW50LHM9ci5hdXRvU3RhcnQubWF4SW50ZXJhY3Rpb25zLGw9MCx1PTAsYz0wO2lmKCEoaSYmYSYmcykpcmV0dXJuITE7Zm9yKHZhciBmPTA7ZjxyLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtmKyspe3ZhciBkPXIuaW50ZXJhY3Rpb25zLmxpc3RbZl0scD1kLnByZXBhcmVkLm5hbWU7aWYoZC5pbnRlcmFjdGluZygpKXtpZigrK2w+PXMpcmV0dXJuITE7aWYoZC5pbnRlcmFjdGFibGU9PT10KXtpZigodSs9cD09PW4ubmFtZT8xOjApPj1pKXJldHVybiExO2lmKGQuZWxlbWVudD09PWUmJihjKysscD09PW4ubmFtZSYmYz49YSkpcmV0dXJuITF9fX1yZXR1cm4gcz4wfWZ1bmN0aW9uIEt0KHQsZSl7cmV0dXJuIGkuZGVmYXVsdC5udW1iZXIodCk/KGUuYXV0b1N0YXJ0Lm1heEludGVyYWN0aW9ucz10LHRoaXMpOmUuYXV0b1N0YXJ0Lm1heEludGVyYWN0aW9uc31mdW5jdGlvbiBadCh0LGUsbil7dmFyIHI9bi5hdXRvU3RhcnQuY3Vyc29yRWxlbWVudDtyJiZyIT09dCYmKHIuc3R5bGUuY3Vyc29yPVwiXCIpLHQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY3Vyc29yPWUsdC5zdHlsZS5jdXJzb3I9ZSxuLmF1dG9TdGFydC5jdXJzb3JFbGVtZW50PWU/dDpudWxsfWZ1bmN0aW9uIEp0KHQsZSl7dmFyIG49dC5pbnRlcmFjdGFibGUscj10LmVsZW1lbnQsbz10LnByZXBhcmVkO2lmKFwibW91c2VcIj09PXQucG9pbnRlclR5cGUmJm4mJm4ub3B0aW9ucy5zdHlsZUN1cnNvcil7dmFyIGE9XCJcIjtpZihvLm5hbWUpe3ZhciBzPW4ub3B0aW9uc1tvLm5hbWVdLmN1cnNvckNoZWNrZXI7YT1pLmRlZmF1bHQuZnVuYyhzKT9zKG8sbixyLHQuX2ludGVyYWN0aW5nKTplLmFjdGlvbnMubWFwW28ubmFtZV0uZ2V0Q3Vyc29yKG8pfVp0KHQuZWxlbWVudCxhfHxcIlwiLGUpfWVsc2UgZS5hdXRvU3RhcnQuY3Vyc29yRWxlbWVudCYmWnQoZS5hdXRvU3RhcnQuY3Vyc29yRWxlbWVudCxcIlwiLGUpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxWdC5kZWZhdWx0PXZvaWQgMDt2YXIgUXQ9e2lkOlwiYXV0by1zdGFydC9iYXNlXCIsYmVmb3JlOltcImFjdGlvbnNcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0U3RhdGljLG49dC5kZWZhdWx0czt0LnVzZVBsdWdpbihCdC5kZWZhdWx0KSxuLmJhc2UuYWN0aW9uQ2hlY2tlcj1udWxsLG4uYmFzZS5zdHlsZUN1cnNvcj0hMCwoMCxqLmRlZmF1bHQpKG4ucGVyQWN0aW9uLHttYW51YWxTdGFydDohMSxtYXg6MS8wLG1heFBlckVsZW1lbnQ6MSxhbGxvd0Zyb206bnVsbCxpZ25vcmVGcm9tOm51bGwsbW91c2VCdXR0b25zOjF9KSxlLm1heEludGVyYWN0aW9ucz1mdW5jdGlvbihlKXtyZXR1cm4gS3QoZSx0KX0sdC5hdXRvU3RhcnQ9e21heEludGVyYWN0aW9uczoxLzAsd2l0aGluSW50ZXJhY3Rpb25MaW1pdDpIdCxjdXJzb3JFbGVtZW50Om51bGx9fSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOmRvd25cIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldDtuLmludGVyYWN0aW5nKCl8fEd0KG4sJHQobixyLG8saSxlKSxlKX0sXCJpbnRlcmFjdGlvbnM6bW92ZVwiOmZ1bmN0aW9uKHQsZSl7IWZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0O1wibW91c2VcIiE9PW4ucG9pbnRlclR5cGV8fG4ucG9pbnRlcklzRG93bnx8bi5pbnRlcmFjdGluZygpfHxHdChuLCR0KG4scixvLGksZSksZSl9KHQsZSksZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uO2lmKG4ucG9pbnRlcklzRG93biYmIW4uaW50ZXJhY3RpbmcoKSYmbi5wb2ludGVyV2FzTW92ZWQmJm4ucHJlcGFyZWQubmFtZSl7ZS5maXJlKFwiYXV0b1N0YXJ0OmJlZm9yZS1zdGFydFwiLHQpO3ZhciByPW4uaW50ZXJhY3RhYmxlLG89bi5wcmVwYXJlZC5uYW1lO28mJnImJihyLm9wdGlvbnNbb10ubWFudWFsU3RhcnR8fCFIdChyLG4uZWxlbWVudCxuLnByZXBhcmVkLGUpP24uc3RvcCgpOihuLnN0YXJ0KG4ucHJlcGFyZWQscixuLmVsZW1lbnQpLEp0KG4sZSkpKX19KHQsZSl9LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj1uLmludGVyYWN0YWJsZTtyJiZyLm9wdGlvbnMuc3R5bGVDdXJzb3ImJlp0KG4uZWxlbWVudCxcIlwiLGUpfX0sbWF4SW50ZXJhY3Rpb25zOkt0LHdpdGhpbkludGVyYWN0aW9uTGltaXQ6SHQsdmFsaWRhdGVBY3Rpb246TnR9O1Z0LmRlZmF1bHQ9UXQ7dmFyIHRlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0ZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0ZS5kZWZhdWx0PXZvaWQgMDt2YXIgZWU9e2lkOlwiYXV0by1zdGFydC9kcmFnQXhpc1wiLGxpc3RlbmVyczp7XCJhdXRvU3RhcnQ6YmVmb3JlLXN0YXJ0XCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5ldmVudFRhcmdldCxvPXQuZHgsYT10LmR5O2lmKFwiZHJhZ1wiPT09bi5wcmVwYXJlZC5uYW1lKXt2YXIgcz1NYXRoLmFicyhvKSxsPU1hdGguYWJzKGEpLHU9bi5pbnRlcmFjdGFibGUub3B0aW9ucy5kcmFnLGM9dS5zdGFydEF4aXMsZj1zPmw/XCJ4XCI6czxsP1wieVwiOlwieHlcIjtpZihuLnByZXBhcmVkLmF4aXM9XCJzdGFydFwiPT09dS5sb2NrQXhpcz9mWzBdOnUubG9ja0F4aXMsXCJ4eVwiIT09ZiYmXCJ4eVwiIT09YyYmYyE9PWYpe24ucHJlcGFyZWQubmFtZT1udWxsO2Zvcih2YXIgZD1yLHA9ZnVuY3Rpb24odCl7aWYodCE9PW4uaW50ZXJhY3RhYmxlKXt2YXIgbz1uLmludGVyYWN0YWJsZS5vcHRpb25zLmRyYWc7aWYoIW8ubWFudWFsU3RhcnQmJnQudGVzdElnbm9yZUFsbG93KG8sZCxyKSl7dmFyIGk9dC5nZXRBY3Rpb24obi5kb3duUG9pbnRlcixuLmRvd25FdmVudCxuLGQpO2lmKGkmJlwiZHJhZ1wiPT09aS5uYW1lJiZmdW5jdGlvbih0LGUpe2lmKCFlKXJldHVybiExO3ZhciBuPWUub3B0aW9ucy5kcmFnLnN0YXJ0QXhpcztyZXR1cm5cInh5XCI9PT10fHxcInh5XCI9PT1ufHxuPT09dH0oZix0KSYmVnQuZGVmYXVsdC52YWxpZGF0ZUFjdGlvbihpLHQsZCxyLGUpKXJldHVybiB0fX19O2kuZGVmYXVsdC5lbGVtZW50KGQpOyl7dmFyIHY9ZS5pbnRlcmFjdGFibGVzLmZvckVhY2hNYXRjaChkLHApO2lmKHYpe24ucHJlcGFyZWQubmFtZT1cImRyYWdcIixuLmludGVyYWN0YWJsZT12LG4uZWxlbWVudD1kO2JyZWFrfWQ9KDAsXy5wYXJlbnROb2RlKShkKX19fX19fTt0ZS5kZWZhdWx0PWVlO3ZhciBuZT17fTtmdW5jdGlvbiByZSh0KXt2YXIgZT10LnByZXBhcmVkJiZ0LnByZXBhcmVkLm5hbWU7aWYoIWUpcmV0dXJuIG51bGw7dmFyIG49dC5pbnRlcmFjdGFibGUub3B0aW9ucztyZXR1cm4gbltlXS5ob2xkfHxuW2VdLmRlbGF5fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxuZS5kZWZhdWx0PXZvaWQgMDt2YXIgb2U9e2lkOlwiYXV0by1zdGFydC9ob2xkXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmRlZmF1bHRzO3QudXNlUGx1Z2luKFZ0LmRlZmF1bHQpLGUucGVyQWN0aW9uLmhvbGQ9MCxlLnBlckFjdGlvbi5kZWxheT0wfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24uYXV0b1N0YXJ0SG9sZFRpbWVyPW51bGx9LFwiYXV0b1N0YXJ0OnByZXBhcmVkXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXJlKGUpO24+MCYmKGUuYXV0b1N0YXJ0SG9sZFRpbWVyPXNldFRpbWVvdXQoKGZ1bmN0aW9uKCl7ZS5zdGFydChlLnByZXBhcmVkLGUuaW50ZXJhY3RhYmxlLGUuZWxlbWVudCl9KSxuKSl9LFwiaW50ZXJhY3Rpb25zOm1vdmVcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5kdXBsaWNhdGU7ZS5hdXRvU3RhcnRIb2xkVGltZXImJmUucG9pbnRlcldhc01vdmVkJiYhbiYmKGNsZWFyVGltZW91dChlLmF1dG9TdGFydEhvbGRUaW1lciksZS5hdXRvU3RhcnRIb2xkVGltZXI9bnVsbCl9LFwiYXV0b1N0YXJ0OmJlZm9yZS1zdGFydFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247cmUoZSk+MCYmKGUucHJlcGFyZWQubmFtZT1udWxsKX19LGdldEhvbGREdXJhdGlvbjpyZX07bmUuZGVmYXVsdD1vZTt2YXIgaWU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGllLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGllLmRlZmF1bHQ9dm9pZCAwO3ZhciBhZT17aWQ6XCJhdXRvLXN0YXJ0XCIsaW5zdGFsbDpmdW5jdGlvbih0KXt0LnVzZVBsdWdpbihWdC5kZWZhdWx0KSx0LnVzZVBsdWdpbihuZS5kZWZhdWx0KSx0LnVzZVBsdWdpbih0ZS5kZWZhdWx0KX19O2llLmRlZmF1bHQ9YWU7dmFyIHNlPXt9O2Z1bmN0aW9uIGxlKHQpe3JldHVybi9eKGFsd2F5c3xuZXZlcnxhdXRvKSQvLnRlc3QodCk/KHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdD10LHRoaXMpOmkuZGVmYXVsdC5ib29sKHQpPyh0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHQ9dD9cImFsd2F5c1wiOlwibmV2ZXJcIix0aGlzKTp0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHR9ZnVuY3Rpb24gdWUodCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZXZlbnQ7ZS5pbnRlcmFjdGFibGUmJmUuaW50ZXJhY3RhYmxlLmNoZWNrQW5kUHJldmVudERlZmF1bHQobil9ZnVuY3Rpb24gY2UodCl7dmFyIG49dC5JbnRlcmFjdGFibGU7bi5wcm90b3R5cGUucHJldmVudERlZmF1bHQ9bGUsbi5wcm90b3R5cGUuY2hlY2tBbmRQcmV2ZW50RGVmYXVsdD1mdW5jdGlvbihuKXtyZXR1cm4gZnVuY3Rpb24odCxuLHIpe3ZhciBvPXQub3B0aW9ucy5wcmV2ZW50RGVmYXVsdDtpZihcIm5ldmVyXCIhPT1vKWlmKFwiYWx3YXlzXCIhPT1vKXtpZihuLmV2ZW50cy5zdXBwb3J0c1Bhc3NpdmUmJi9edG91Y2goc3RhcnR8bW92ZSkkLy50ZXN0KHIudHlwZSkpe3ZhciBhPSgwLGUuZ2V0V2luZG93KShyLnRhcmdldCkuZG9jdW1lbnQscz1uLmdldERvY09wdGlvbnMoYSk7aWYoIXN8fCFzLmV2ZW50c3x8ITEhPT1zLmV2ZW50cy5wYXNzaXZlKXJldHVybn0vXihtb3VzZXxwb2ludGVyfHRvdWNoKSooZG93bnxzdGFydCkvaS50ZXN0KHIudHlwZSl8fGkuZGVmYXVsdC5lbGVtZW50KHIudGFyZ2V0KSYmKDAsXy5tYXRjaGVzU2VsZWN0b3IpKHIudGFyZ2V0LFwiaW5wdXQsc2VsZWN0LHRleHRhcmVhLFtjb250ZW50ZWRpdGFibGU9dHJ1ZV0sW2NvbnRlbnRlZGl0YWJsZT10cnVlXSAqXCIpfHxyLnByZXZlbnREZWZhdWx0KCl9ZWxzZSByLnByZXZlbnREZWZhdWx0KCl9KHRoaXMsdCxuKX0sdC5pbnRlcmFjdGlvbnMuZG9jRXZlbnRzLnB1c2goe3R5cGU6XCJkcmFnc3RhcnRcIixsaXN0ZW5lcjpmdW5jdGlvbihlKXtmb3IodmFyIG49MDtuPHQuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO24rKyl7dmFyIHI9dC5pbnRlcmFjdGlvbnMubGlzdFtuXTtpZihyLmVsZW1lbnQmJihyLmVsZW1lbnQ9PT1lLnRhcmdldHx8KDAsXy5ub2RlQ29udGFpbnMpKHIuZWxlbWVudCxlLnRhcmdldCkpKXJldHVybiB2b2lkIHIuaW50ZXJhY3RhYmxlLmNoZWNrQW5kUHJldmVudERlZmF1bHQoZSl9fX0pfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxzZS5pbnN0YWxsPWNlLHNlLmRlZmF1bHQ9dm9pZCAwO3ZhciBmZT17aWQ6XCJjb3JlL2ludGVyYWN0YWJsZVByZXZlbnREZWZhdWx0XCIsaW5zdGFsbDpjZSxsaXN0ZW5lcnM6W1wiZG93blwiLFwibW92ZVwiLFwidXBcIixcImNhbmNlbFwiXS5yZWR1Y2UoKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbXCJpbnRlcmFjdGlvbnM6XCIuY29uY2F0KGUpXT11ZSx0fSkse30pfTtzZS5kZWZhdWx0PWZlO3ZhciBkZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZGUuZGVmYXVsdD12b2lkIDAsZGUuZGVmYXVsdD17fTt2YXIgcGUsdmU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHZlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHZlLmRlZmF1bHQ9dm9pZCAwLGZ1bmN0aW9uKHQpe3QudG91Y2hBY3Rpb249XCJ0b3VjaEFjdGlvblwiLHQuYm94U2l6aW5nPVwiYm94U2l6aW5nXCIsdC5ub0xpc3RlbmVycz1cIm5vTGlzdGVuZXJzXCJ9KHBlfHwocGU9e30pKTtwZS50b3VjaEFjdGlvbixwZS5ib3hTaXppbmcscGUubm9MaXN0ZW5lcnM7dmFyIGhlPXtpZDpcImRldi10b29sc1wiLGluc3RhbGw6ZnVuY3Rpb24oKXt9fTt2ZS5kZWZhdWx0PWhlO3ZhciBnZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2UsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZ2UuZGVmYXVsdD1mdW5jdGlvbiB0KGUpe3ZhciBuPXt9O2Zvcih2YXIgciBpbiBlKXt2YXIgbz1lW3JdO2kuZGVmYXVsdC5wbGFpbk9iamVjdChvKT9uW3JdPXQobyk6aS5kZWZhdWx0LmFycmF5KG8pP25bcl09Wi5mcm9tKG8pOm5bcl09b31yZXR1cm4gbn07dmFyIHllPXt9O2Z1bmN0aW9uIG1lKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KHQpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0odCxlKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gYmUodCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP2JlKHQsZSk6dm9pZCAwfX0odCxlKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpfWZ1bmN0aW9uIGJlKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1mdW5jdGlvbiB4ZSh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gd2UodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh5ZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx5ZS5nZXRSZWN0T2Zmc2V0PU9lLHllLmRlZmF1bHQ9dm9pZCAwO3ZhciBfZT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSx3ZSh0aGlzLFwic3RhdGVzXCIsW10pLHdlKHRoaXMsXCJzdGFydE9mZnNldFwiLHtsZWZ0OjAscmlnaHQ6MCx0b3A6MCxib3R0b206MH0pLHdlKHRoaXMsXCJzdGFydERlbHRhXCIsdm9pZCAwKSx3ZSh0aGlzLFwicmVzdWx0XCIsdm9pZCAwKSx3ZSh0aGlzLFwiZW5kUmVzdWx0XCIsdm9pZCAwKSx3ZSh0aGlzLFwiZWRnZXNcIix2b2lkIDApLHdlKHRoaXMsXCJpbnRlcmFjdGlvblwiLHZvaWQgMCksdGhpcy5pbnRlcmFjdGlvbj1lLHRoaXMucmVzdWx0PVBlKCl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5Olwic3RhcnRcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPXQucGhhc2Uscj10aGlzLmludGVyYWN0aW9uLG89ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGFibGUub3B0aW9uc1t0LnByZXBhcmVkLm5hbWVdLG49ZS5tb2RpZmllcnM7cmV0dXJuIG4mJm4ubGVuZ3RoP246W1wic25hcFwiLFwic25hcFNpemVcIixcInNuYXBFZGdlc1wiLFwicmVzdHJpY3RcIixcInJlc3RyaWN0RWRnZXNcIixcInJlc3RyaWN0U2l6ZVwiXS5tYXAoKGZ1bmN0aW9uKHQpe3ZhciBuPWVbdF07cmV0dXJuIG4mJm4uZW5hYmxlZCYme29wdGlvbnM6bixtZXRob2RzOm4uX21ldGhvZHN9fSkpLmZpbHRlcigoZnVuY3Rpb24odCl7cmV0dXJuISF0fSkpfShyKTt0aGlzLnByZXBhcmVTdGF0ZXMobyksdGhpcy5lZGdlcz0oMCxqLmRlZmF1bHQpKHt9LHIuZWRnZXMpLHRoaXMuc3RhcnRPZmZzZXQ9T2Uoci5yZWN0LGUpLHRoaXMuc3RhcnREZWx0YT17eDowLHk6MH07dmFyIGk9dGhpcy5maWxsQXJnKHtwaGFzZTpuLHBhZ2VDb29yZHM6ZSxwcmVFbmQ6ITF9KTtyZXR1cm4gdGhpcy5yZXN1bHQ9UGUoKSx0aGlzLnN0YXJ0QWxsKGkpLHRoaXMucmVzdWx0PXRoaXMuc2V0QWxsKGkpfX0se2tleTpcImZpbGxBcmdcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmludGVyYWN0aW9uO3JldHVybiB0LmludGVyYWN0aW9uPWUsdC5pbnRlcmFjdGFibGU9ZS5pbnRlcmFjdGFibGUsdC5lbGVtZW50PWUuZWxlbWVudCx0LnJlY3Q9dC5yZWN0fHxlLnJlY3QsdC5lZGdlcz10aGlzLmVkZ2VzLHQuc3RhcnRPZmZzZXQ9dGhpcy5zdGFydE9mZnNldCx0fX0se2tleTpcInN0YXJ0QWxsXCIsdmFsdWU6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0aGlzLnN0YXRlcy5sZW5ndGg7ZSsrKXt2YXIgbj10aGlzLnN0YXRlc1tlXTtuLm1ldGhvZHMuc3RhcnQmJih0LnN0YXRlPW4sbi5tZXRob2RzLnN0YXJ0KHQpKX19fSx7a2V5Olwic2V0QWxsXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5waGFzZSxuPXQucHJlRW5kLHI9dC5za2lwTW9kaWZpZXJzLG89dC5yZWN0O3QuY29vcmRzPSgwLGouZGVmYXVsdCkoe30sdC5wYWdlQ29vcmRzKSx0LnJlY3Q9KDAsai5kZWZhdWx0KSh7fSxvKTtmb3IodmFyIGk9cj90aGlzLnN0YXRlcy5zbGljZShyKTp0aGlzLnN0YXRlcyxhPVBlKHQuY29vcmRzLHQucmVjdCkscz0wO3M8aS5sZW5ndGg7cysrKXt2YXIgbCx1PWlbc10sYz11Lm9wdGlvbnMsZj0oMCxqLmRlZmF1bHQpKHt9LHQuY29vcmRzKSxkPW51bGw7bnVsbCE9KGw9dS5tZXRob2RzKSYmbC5zZXQmJnRoaXMuc2hvdWxkRG8oYyxuLGUpJiYodC5zdGF0ZT11LGQ9dS5tZXRob2RzLnNldCh0KSxrLmFkZEVkZ2VzKHRoaXMuaW50ZXJhY3Rpb24uZWRnZXMsdC5yZWN0LHt4OnQuY29vcmRzLngtZi54LHk6dC5jb29yZHMueS1mLnl9KSksYS5ldmVudFByb3BzLnB1c2goZCl9YS5kZWx0YS54PXQuY29vcmRzLngtdC5wYWdlQ29vcmRzLngsYS5kZWx0YS55PXQuY29vcmRzLnktdC5wYWdlQ29vcmRzLnksYS5yZWN0RGVsdGEubGVmdD10LnJlY3QubGVmdC1vLmxlZnQsYS5yZWN0RGVsdGEucmlnaHQ9dC5yZWN0LnJpZ2h0LW8ucmlnaHQsYS5yZWN0RGVsdGEudG9wPXQucmVjdC50b3Atby50b3AsYS5yZWN0RGVsdGEuYm90dG9tPXQucmVjdC5ib3R0b20tby5ib3R0b207dmFyIHA9dGhpcy5yZXN1bHQuY29vcmRzLHY9dGhpcy5yZXN1bHQucmVjdDtpZihwJiZ2KXt2YXIgaD1hLnJlY3QubGVmdCE9PXYubGVmdHx8YS5yZWN0LnJpZ2h0IT09di5yaWdodHx8YS5yZWN0LnRvcCE9PXYudG9wfHxhLnJlY3QuYm90dG9tIT09di5ib3R0b207YS5jaGFuZ2VkPWh8fHAueCE9PWEuY29vcmRzLnh8fHAueSE9PWEuY29vcmRzLnl9cmV0dXJuIGF9fSx7a2V5OlwiYXBwbHlUb0ludGVyYWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5pbnRlcmFjdGlvbixuPXQucGhhc2Uscj1lLmNvb3Jkcy5jdXIsbz1lLmNvb3Jkcy5zdGFydCxpPXRoaXMucmVzdWx0LGE9dGhpcy5zdGFydERlbHRhLHM9aS5kZWx0YTtcInN0YXJ0XCI9PT1uJiYoMCxqLmRlZmF1bHQpKHRoaXMuc3RhcnREZWx0YSxpLmRlbHRhKTtmb3IodmFyIGw9MDtsPFtbbyxhXSxbcixzXV0ubGVuZ3RoO2wrKyl7dmFyIHU9bWUoW1tvLGFdLFtyLHNdXVtsXSwyKSxjPXVbMF0sZj11WzFdO2MucGFnZS54Kz1mLngsYy5wYWdlLnkrPWYueSxjLmNsaWVudC54Kz1mLngsYy5jbGllbnQueSs9Zi55fXZhciBkPXRoaXMucmVzdWx0LnJlY3REZWx0YSxwPXQucmVjdHx8ZS5yZWN0O3AubGVmdCs9ZC5sZWZ0LHAucmlnaHQrPWQucmlnaHQscC50b3ArPWQudG9wLHAuYm90dG9tKz1kLmJvdHRvbSxwLndpZHRoPXAucmlnaHQtcC5sZWZ0LHAuaGVpZ2h0PXAuYm90dG9tLXAudG9wfX0se2tleTpcInNldEFuZEFwcGx5XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5pbnRlcmFjdGlvbixuPXQucGhhc2Uscj10LnByZUVuZCxvPXQuc2tpcE1vZGlmaWVycyxpPXRoaXMuc2V0QWxsKHRoaXMuZmlsbEFyZyh7cHJlRW5kOnIscGhhc2U6bixwYWdlQ29vcmRzOnQubW9kaWZpZWRDb29yZHN8fGUuY29vcmRzLmN1ci5wYWdlfSkpO2lmKHRoaXMucmVzdWx0PWksIWkuY2hhbmdlZCYmKCFvfHxvPHRoaXMuc3RhdGVzLmxlbmd0aCkmJmUuaW50ZXJhY3RpbmcoKSlyZXR1cm4hMTtpZih0Lm1vZGlmaWVkQ29vcmRzKXt2YXIgYT1lLmNvb3Jkcy5jdXIucGFnZSxzPXt4OnQubW9kaWZpZWRDb29yZHMueC1hLngseTp0Lm1vZGlmaWVkQ29vcmRzLnktYS55fTtpLmNvb3Jkcy54Kz1zLngsaS5jb29yZHMueSs9cy55LGkuZGVsdGEueCs9cy54LGkuZGVsdGEueSs9cy55fXRoaXMuYXBwbHlUb0ludGVyYWN0aW9uKHQpfX0se2tleTpcImJlZm9yZUVuZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmV2ZW50LHI9dGhpcy5zdGF0ZXM7aWYociYmci5sZW5ndGgpe2Zvcih2YXIgbz0hMSxpPTA7aTxyLmxlbmd0aDtpKyspe3ZhciBhPXJbaV07dC5zdGF0ZT1hO3ZhciBzPWEub3B0aW9ucyxsPWEubWV0aG9kcyx1PWwuYmVmb3JlRW5kJiZsLmJlZm9yZUVuZCh0KTtpZih1KXJldHVybiB0aGlzLmVuZFJlc3VsdD11LCExO289b3x8IW8mJnRoaXMuc2hvdWxkRG8ocywhMCx0LnBoYXNlLCEwKX1vJiZlLm1vdmUoe2V2ZW50Om4scHJlRW5kOiEwfSl9fX0se2tleTpcInN0b3BcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2lmKHRoaXMuc3RhdGVzJiZ0aGlzLnN0YXRlcy5sZW5ndGgpe3ZhciBuPSgwLGouZGVmYXVsdCkoe3N0YXRlczp0aGlzLnN0YXRlcyxpbnRlcmFjdGFibGU6ZS5pbnRlcmFjdGFibGUsZWxlbWVudDplLmVsZW1lbnQscmVjdDpudWxsfSx0KTt0aGlzLmZpbGxBcmcobik7Zm9yKHZhciByPTA7cjx0aGlzLnN0YXRlcy5sZW5ndGg7cisrKXt2YXIgbz10aGlzLnN0YXRlc1tyXTtuLnN0YXRlPW8sby5tZXRob2RzLnN0b3AmJm8ubWV0aG9kcy5zdG9wKG4pfXRoaXMuc3RhdGVzPW51bGwsdGhpcy5lbmRSZXN1bHQ9bnVsbH19fSx7a2V5OlwicHJlcGFyZVN0YXRlc1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuc3RhdGVzPVtdO2Zvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXt2YXIgbj10W2VdLHI9bi5vcHRpb25zLG89bi5tZXRob2RzLGk9bi5uYW1lO3RoaXMuc3RhdGVzLnB1c2goe29wdGlvbnM6cixtZXRob2RzOm8saW5kZXg6ZSxuYW1lOml9KX1yZXR1cm4gdGhpcy5zdGF0ZXN9fSx7a2V5OlwicmVzdG9yZUludGVyYWN0aW9uQ29vcmRzXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPWUuY29vcmRzLHI9ZS5yZWN0LG89ZS5tb2RpZmljYXRpb247aWYoby5yZXN1bHQpe2Zvcih2YXIgaT1vLnN0YXJ0RGVsdGEsYT1vLnJlc3VsdCxzPWEuZGVsdGEsbD1hLnJlY3REZWx0YSx1PVtbbi5zdGFydCxpXSxbbi5jdXIsc11dLGM9MDtjPHUubGVuZ3RoO2MrKyl7dmFyIGY9bWUodVtjXSwyKSxkPWZbMF0scD1mWzFdO2QucGFnZS54LT1wLngsZC5wYWdlLnktPXAueSxkLmNsaWVudC54LT1wLngsZC5jbGllbnQueS09cC55fXIubGVmdC09bC5sZWZ0LHIucmlnaHQtPWwucmlnaHQsci50b3AtPWwudG9wLHIuYm90dG9tLT1sLmJvdHRvbX19fSx7a2V5Olwic2hvdWxkRG9cIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXtyZXR1cm4hKCF0fHwhMT09PXQuZW5hYmxlZHx8ciYmIXQuZW5kT25seXx8dC5lbmRPbmx5JiYhZXx8XCJzdGFydFwiPT09biYmIXQuc2V0U3RhcnQpfX0se2tleTpcImNvcHlGcm9tXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5zdGFydE9mZnNldD10LnN0YXJ0T2Zmc2V0LHRoaXMuc3RhcnREZWx0YT10LnN0YXJ0RGVsdGEsdGhpcy5lZGdlcz10LmVkZ2VzLHRoaXMuc3RhdGVzPXQuc3RhdGVzLm1hcCgoZnVuY3Rpb24odCl7cmV0dXJuKDAsZ2UuZGVmYXVsdCkodCl9KSksdGhpcy5yZXN1bHQ9UGUoKDAsai5kZWZhdWx0KSh7fSx0LnJlc3VsdC5jb29yZHMpLCgwLGouZGVmYXVsdCkoe30sdC5yZXN1bHQucmVjdCkpfX0se2tleTpcImRlc3Ryb3lcIix2YWx1ZTpmdW5jdGlvbigpe2Zvcih2YXIgdCBpbiB0aGlzKXRoaXNbdF09bnVsbH19XSkmJnhlKGUucHJvdG90eXBlLG4pLHR9KCk7ZnVuY3Rpb24gUGUodCxlKXtyZXR1cm57cmVjdDplLGNvb3Jkczp0LGRlbHRhOnt4OjAseTowfSxyZWN0RGVsdGE6e2xlZnQ6MCxyaWdodDowLHRvcDowLGJvdHRvbTowfSxldmVudFByb3BzOltdLGNoYW5nZWQ6ITB9fWZ1bmN0aW9uIE9lKHQsZSl7cmV0dXJuIHQ/e2xlZnQ6ZS54LXQubGVmdCx0b3A6ZS55LXQudG9wLHJpZ2h0OnQucmlnaHQtZS54LGJvdHRvbTp0LmJvdHRvbS1lLnl9OntsZWZ0OjAsdG9wOjAscmlnaHQ6MCxib3R0b206MH19eWUuZGVmYXVsdD1fZTt2YXIgU2U9e307ZnVuY3Rpb24gRWUodCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN1bHQ7biYmKGUubW9kaWZpZXJzPW4uZXZlbnRQcm9wcyl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFNlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFNlLm1ha2VNb2RpZmllcj1mdW5jdGlvbih0LGUpe3ZhciBuPXQuZGVmYXVsdHMscj17c3RhcnQ6dC5zdGFydCxzZXQ6dC5zZXQsYmVmb3JlRW5kOnQuYmVmb3JlRW5kLHN0b3A6dC5zdG9wfSxvPWZ1bmN0aW9uKHQpe3ZhciBvPXR8fHt9O2Zvcih2YXIgaSBpbiBvLmVuYWJsZWQ9ITEhPT1vLmVuYWJsZWQsbilpIGluIG98fChvW2ldPW5baV0pO3ZhciBhPXtvcHRpb25zOm8sbWV0aG9kczpyLG5hbWU6ZSxlbmFibGU6ZnVuY3Rpb24oKXtyZXR1cm4gby5lbmFibGVkPSEwLGF9LGRpc2FibGU6ZnVuY3Rpb24oKXtyZXR1cm4gby5lbmFibGVkPSExLGF9fTtyZXR1cm4gYX07cmV0dXJuIGUmJlwic3RyaW5nXCI9PXR5cGVvZiBlJiYoby5fZGVmYXVsdHM9bixvLl9tZXRob2RzPXIpLG99LFNlLmFkZEV2ZW50TW9kaWZpZXJzPUVlLFNlLmRlZmF1bHQ9dm9pZCAwO3ZhciBUZT17aWQ6XCJtb2RpZmllcnMvYmFzZVwiLGJlZm9yZTpbXCJhY3Rpb25zXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dC5kZWZhdWx0cy5wZXJBY3Rpb24ubW9kaWZpZXJzPVtdfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5tb2RpZmljYXRpb249bmV3IHllLmRlZmF1bHQoZSl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbjtlLnN0YXJ0KHQsdC5pbnRlcmFjdGlvbi5jb29yZHMuc3RhcnQucGFnZSksdC5pbnRlcmFjdGlvbi5lZGdlcz1lLmVkZ2VzLGUuYXBwbHlUb0ludGVyYWN0aW9uKHQpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24uc2V0QW5kQXBwbHkodCl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLmJlZm9yZUVuZCh0KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLXN0YXJ0XCI6RWUsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpFZSxcImludGVyYWN0aW9uczphY3Rpb24tZW5kXCI6RWUsXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLXN0YXJ0XCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnJlc3RvcmVJbnRlcmFjdGlvbkNvb3Jkcyh0KX0sXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24ucmVzdG9yZUludGVyYWN0aW9uQ29vcmRzKHQpfSxcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnN0b3AodCl9fX07U2UuZGVmYXVsdD1UZTt2YXIgTWU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KE1lLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE1lLmRlZmF1bHRzPXZvaWQgMCxNZS5kZWZhdWx0cz17YmFzZTp7cHJldmVudERlZmF1bHQ6XCJhdXRvXCIsZGVsdGFTb3VyY2U6XCJwYWdlXCJ9LHBlckFjdGlvbjp7ZW5hYmxlZDohMSxvcmlnaW46e3g6MCx5OjB9fSxhY3Rpb25zOnt9fTt2YXIgamU9e307ZnVuY3Rpb24ga2UodCl7cmV0dXJuKGtlPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBJZSh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gRGUodCxlKXtyZXR1cm4oRGU9T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIEFlKHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1rZShlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9SZSh0KTplfWZ1bmN0aW9uIFJlKHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fWZ1bmN0aW9uIHplKHQpe3JldHVybih6ZT1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9ZnVuY3Rpb24gQ2UodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShqZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxqZS5JbnRlcmFjdEV2ZW50PXZvaWQgMDt2YXIgRmU9ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZSYmZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp0LHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSxlJiZEZSh0LGUpfShhLHQpO3ZhciBlLG4scixvLGk9KHI9YSxvPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sKGZ1bmN0aW9uKCl7fSkpKSwhMH1jYXRjaCh0KXtyZXR1cm4hMX19KCksZnVuY3Rpb24oKXt2YXIgdCxlPXplKHIpO2lmKG8pe3ZhciBuPXplKHRoaXMpLmNvbnN0cnVjdG9yO3Q9UmVmbGVjdC5jb25zdHJ1Y3QoZSxhcmd1bWVudHMsbil9ZWxzZSB0PWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBBZSh0aGlzLHQpfSk7ZnVuY3Rpb24gYSh0LGUsbixyLG8scyxsKXt2YXIgdTshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLGEpLENlKFJlKHU9aS5jYWxsKHRoaXMsdCkpLFwidGFyZ2V0XCIsdm9pZCAwKSxDZShSZSh1KSxcImN1cnJlbnRUYXJnZXRcIix2b2lkIDApLENlKFJlKHUpLFwicmVsYXRlZFRhcmdldFwiLG51bGwpLENlKFJlKHUpLFwic2NyZWVuWFwiLHZvaWQgMCksQ2UoUmUodSksXCJzY3JlZW5ZXCIsdm9pZCAwKSxDZShSZSh1KSxcImJ1dHRvblwiLHZvaWQgMCksQ2UoUmUodSksXCJidXR0b25zXCIsdm9pZCAwKSxDZShSZSh1KSxcImN0cmxLZXlcIix2b2lkIDApLENlKFJlKHUpLFwic2hpZnRLZXlcIix2b2lkIDApLENlKFJlKHUpLFwiYWx0S2V5XCIsdm9pZCAwKSxDZShSZSh1KSxcIm1ldGFLZXlcIix2b2lkIDApLENlKFJlKHUpLFwicGFnZVwiLHZvaWQgMCksQ2UoUmUodSksXCJjbGllbnRcIix2b2lkIDApLENlKFJlKHUpLFwiZGVsdGFcIix2b2lkIDApLENlKFJlKHUpLFwicmVjdFwiLHZvaWQgMCksQ2UoUmUodSksXCJ4MFwiLHZvaWQgMCksQ2UoUmUodSksXCJ5MFwiLHZvaWQgMCksQ2UoUmUodSksXCJ0MFwiLHZvaWQgMCksQ2UoUmUodSksXCJkdFwiLHZvaWQgMCksQ2UoUmUodSksXCJkdXJhdGlvblwiLHZvaWQgMCksQ2UoUmUodSksXCJjbGllbnRYMFwiLHZvaWQgMCksQ2UoUmUodSksXCJjbGllbnRZMFwiLHZvaWQgMCksQ2UoUmUodSksXCJ2ZWxvY2l0eVwiLHZvaWQgMCksQ2UoUmUodSksXCJzcGVlZFwiLHZvaWQgMCksQ2UoUmUodSksXCJzd2lwZVwiLHZvaWQgMCksQ2UoUmUodSksXCJ0aW1lU3RhbXBcIix2b2lkIDApLENlKFJlKHUpLFwiYXhlc1wiLHZvaWQgMCksQ2UoUmUodSksXCJwcmVFbmRcIix2b2lkIDApLG89b3x8dC5lbGVtZW50O3ZhciBjPXQuaW50ZXJhY3RhYmxlLGY9KGMmJmMub3B0aW9uc3x8TWUuZGVmYXVsdHMpLmRlbHRhU291cmNlLGQ9KDAsQS5kZWZhdWx0KShjLG8sbikscD1cInN0YXJ0XCI9PT1yLHY9XCJlbmRcIj09PXIsaD1wP1JlKHUpOnQucHJldkV2ZW50LGc9cD90LmNvb3Jkcy5zdGFydDp2P3twYWdlOmgucGFnZSxjbGllbnQ6aC5jbGllbnQsdGltZVN0YW1wOnQuY29vcmRzLmN1ci50aW1lU3RhbXB9OnQuY29vcmRzLmN1cjtyZXR1cm4gdS5wYWdlPSgwLGouZGVmYXVsdCkoe30sZy5wYWdlKSx1LmNsaWVudD0oMCxqLmRlZmF1bHQpKHt9LGcuY2xpZW50KSx1LnJlY3Q9KDAsai5kZWZhdWx0KSh7fSx0LnJlY3QpLHUudGltZVN0YW1wPWcudGltZVN0YW1wLHZ8fCh1LnBhZ2UueC09ZC54LHUucGFnZS55LT1kLnksdS5jbGllbnQueC09ZC54LHUuY2xpZW50LnktPWQueSksdS5jdHJsS2V5PWUuY3RybEtleSx1LmFsdEtleT1lLmFsdEtleSx1LnNoaWZ0S2V5PWUuc2hpZnRLZXksdS5tZXRhS2V5PWUubWV0YUtleSx1LmJ1dHRvbj1lLmJ1dHRvbix1LmJ1dHRvbnM9ZS5idXR0b25zLHUudGFyZ2V0PW8sdS5jdXJyZW50VGFyZ2V0PW8sdS5wcmVFbmQ9cyx1LnR5cGU9bHx8bisocnx8XCJcIiksdS5pbnRlcmFjdGFibGU9Yyx1LnQwPXA/dC5wb2ludGVyc1t0LnBvaW50ZXJzLmxlbmd0aC0xXS5kb3duVGltZTpoLnQwLHUueDA9dC5jb29yZHMuc3RhcnQucGFnZS54LWQueCx1LnkwPXQuY29vcmRzLnN0YXJ0LnBhZ2UueS1kLnksdS5jbGllbnRYMD10LmNvb3Jkcy5zdGFydC5jbGllbnQueC1kLngsdS5jbGllbnRZMD10LmNvb3Jkcy5zdGFydC5jbGllbnQueS1kLnksdS5kZWx0YT1wfHx2P3t4OjAseTowfTp7eDp1W2ZdLngtaFtmXS54LHk6dVtmXS55LWhbZl0ueX0sdS5kdD10LmNvb3Jkcy5kZWx0YS50aW1lU3RhbXAsdS5kdXJhdGlvbj11LnRpbWVTdGFtcC11LnQwLHUudmVsb2NpdHk9KDAsai5kZWZhdWx0KSh7fSx0LmNvb3Jkcy52ZWxvY2l0eVtmXSksdS5zcGVlZD0oMCxDLmRlZmF1bHQpKHUudmVsb2NpdHkueCx1LnZlbG9jaXR5LnkpLHUuc3dpcGU9dnx8XCJpbmVydGlhc3RhcnRcIj09PXI/dS5nZXRTd2lwZSgpOm51bGwsdX1yZXR1cm4gZT1hLChuPVt7a2V5OlwiZ2V0U3dpcGVcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX2ludGVyYWN0aW9uO2lmKHQucHJldkV2ZW50LnNwZWVkPDYwMHx8dGhpcy50aW1lU3RhbXAtdC5wcmV2RXZlbnQudGltZVN0YW1wPjE1MClyZXR1cm4gbnVsbDt2YXIgZT0xODAqTWF0aC5hdGFuMih0LnByZXZFdmVudC52ZWxvY2l0eVksdC5wcmV2RXZlbnQudmVsb2NpdHlYKS9NYXRoLlBJO2U8MCYmKGUrPTM2MCk7dmFyIG49MTEyLjU8PWUmJmU8MjQ3LjUscj0yMDIuNTw9ZSYmZTwzMzcuNTtyZXR1cm57dXA6cixkb3duOiFyJiYyMi41PD1lJiZlPDE1Ny41LGxlZnQ6bixyaWdodDohbiYmKDI5Mi41PD1lfHxlPDY3LjUpLGFuZ2xlOmUsc3BlZWQ6dC5wcmV2RXZlbnQuc3BlZWQsdmVsb2NpdHk6e3g6dC5wcmV2RXZlbnQudmVsb2NpdHlYLHk6dC5wcmV2RXZlbnQudmVsb2NpdHlZfX19fSx7a2V5OlwicHJldmVudERlZmF1bHRcIix2YWx1ZTpmdW5jdGlvbigpe319LHtrZXk6XCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkPXRoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX0se2tleTpcInN0b3BQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fV0pJiZJZShlLnByb3RvdHlwZSxuKSxhfSgkLkJhc2VFdmVudCk7amUuSW50ZXJhY3RFdmVudD1GZSxPYmplY3QuZGVmaW5lUHJvcGVydGllcyhGZS5wcm90b3R5cGUse3BhZ2VYOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5wYWdlLnh9LHNldDpmdW5jdGlvbih0KXt0aGlzLnBhZ2UueD10fX0scGFnZVk6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnBhZ2UueX0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMucGFnZS55PXR9fSxjbGllbnRYOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jbGllbnQueH0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMuY2xpZW50Lng9dH19LGNsaWVudFk6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNsaWVudC55fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5jbGllbnQueT10fX0sZHg6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmRlbHRhLnh9LHNldDpmdW5jdGlvbih0KXt0aGlzLmRlbHRhLng9dH19LGR5OntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kZWx0YS55fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5kZWx0YS55PXR9fSx2ZWxvY2l0eVg6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnZlbG9jaXR5Lnh9LHNldDpmdW5jdGlvbih0KXt0aGlzLnZlbG9jaXR5Lng9dH19LHZlbG9jaXR5WTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmVsb2NpdHkueX0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMudmVsb2NpdHkueT10fX19KTt2YXIgWGU9e307ZnVuY3Rpb24gWWUodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShYZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxYZS5Qb2ludGVySW5mbz12b2lkIDAsWGUuUG9pbnRlckluZm89ZnVuY3Rpb24gdChlLG4scixvLGkpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksWWUodGhpcyxcImlkXCIsdm9pZCAwKSxZZSh0aGlzLFwicG9pbnRlclwiLHZvaWQgMCksWWUodGhpcyxcImV2ZW50XCIsdm9pZCAwKSxZZSh0aGlzLFwiZG93blRpbWVcIix2b2lkIDApLFllKHRoaXMsXCJkb3duVGFyZ2V0XCIsdm9pZCAwKSx0aGlzLmlkPWUsdGhpcy5wb2ludGVyPW4sdGhpcy5ldmVudD1yLHRoaXMuZG93blRpbWU9byx0aGlzLmRvd25UYXJnZXQ9aX07dmFyIEJlLFdlLExlPXt9O2Z1bmN0aW9uIFVlKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBWZSh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KExlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMZSxcIlBvaW50ZXJJbmZvXCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIFhlLlBvaW50ZXJJbmZvfX0pLExlLmRlZmF1bHQ9TGUuSW50ZXJhY3Rpb249TGUuX1Byb3h5TWV0aG9kcz1MZS5fUHJveHlWYWx1ZXM9dm9pZCAwLExlLl9Qcm94eVZhbHVlcz1CZSxmdW5jdGlvbih0KXt0LmludGVyYWN0YWJsZT1cIlwiLHQuZWxlbWVudD1cIlwiLHQucHJlcGFyZWQ9XCJcIix0LnBvaW50ZXJJc0Rvd249XCJcIix0LnBvaW50ZXJXYXNNb3ZlZD1cIlwiLHQuX3Byb3h5PVwiXCJ9KEJlfHwoTGUuX1Byb3h5VmFsdWVzPUJlPXt9KSksTGUuX1Byb3h5TWV0aG9kcz1XZSxmdW5jdGlvbih0KXt0LnN0YXJ0PVwiXCIsdC5tb3ZlPVwiXCIsdC5lbmQ9XCJcIix0LnN0b3A9XCJcIix0LmludGVyYWN0aW5nPVwiXCJ9KFdlfHwoTGUuX1Byb3h5TWV0aG9kcz1XZT17fSkpO3ZhciBOZT0wLHFlPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXt2YXIgbj10aGlzLHI9ZS5wb2ludGVyVHlwZSxvPWUuc2NvcGVGaXJlOyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksVmUodGhpcyxcImludGVyYWN0YWJsZVwiLG51bGwpLFZlKHRoaXMsXCJlbGVtZW50XCIsbnVsbCksVmUodGhpcyxcInJlY3RcIix2b2lkIDApLFZlKHRoaXMsXCJfcmVjdHNcIix2b2lkIDApLFZlKHRoaXMsXCJlZGdlc1wiLHZvaWQgMCksVmUodGhpcyxcIl9zY29wZUZpcmVcIix2b2lkIDApLFZlKHRoaXMsXCJwcmVwYXJlZFwiLHtuYW1lOm51bGwsYXhpczpudWxsLGVkZ2VzOm51bGx9KSxWZSh0aGlzLFwicG9pbnRlclR5cGVcIix2b2lkIDApLFZlKHRoaXMsXCJwb2ludGVyc1wiLFtdKSxWZSh0aGlzLFwiZG93bkV2ZW50XCIsbnVsbCksVmUodGhpcyxcImRvd25Qb2ludGVyXCIse30pLFZlKHRoaXMsXCJfbGF0ZXN0UG9pbnRlclwiLHtwb2ludGVyOm51bGwsZXZlbnQ6bnVsbCxldmVudFRhcmdldDpudWxsfSksVmUodGhpcyxcInByZXZFdmVudFwiLG51bGwpLFZlKHRoaXMsXCJwb2ludGVySXNEb3duXCIsITEpLFZlKHRoaXMsXCJwb2ludGVyV2FzTW92ZWRcIiwhMSksVmUodGhpcyxcIl9pbnRlcmFjdGluZ1wiLCExKSxWZSh0aGlzLFwiX2VuZGluZ1wiLCExKSxWZSh0aGlzLFwiX3N0b3BwZWRcIiwhMCksVmUodGhpcyxcIl9wcm94eVwiLG51bGwpLFZlKHRoaXMsXCJzaW11bGF0aW9uXCIsbnVsbCksVmUodGhpcyxcImRvTW92ZVwiLCgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCl7dGhpcy5tb3ZlKHQpfSksXCJUaGUgaW50ZXJhY3Rpb24uZG9Nb3ZlKCkgbWV0aG9kIGhhcyBiZWVuIHJlbmFtZWQgdG8gaW50ZXJhY3Rpb24ubW92ZSgpXCIpKSxWZSh0aGlzLFwiY29vcmRzXCIse3N0YXJ0OkIubmV3Q29vcmRzKCkscHJldjpCLm5ld0Nvb3JkcygpLGN1cjpCLm5ld0Nvb3JkcygpLGRlbHRhOkIubmV3Q29vcmRzKCksdmVsb2NpdHk6Qi5uZXdDb29yZHMoKX0pLFZlKHRoaXMsXCJfaWRcIixOZSsrKSx0aGlzLl9zY29wZUZpcmU9byx0aGlzLnBvaW50ZXJUeXBlPXI7dmFyIGk9dGhpczt0aGlzLl9wcm94eT17fTt2YXIgYT1mdW5jdGlvbih0KXtPYmplY3QuZGVmaW5lUHJvcGVydHkobi5fcHJveHksdCx7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGlbdF19fSl9O2Zvcih2YXIgcyBpbiBCZSlhKHMpO3ZhciBsPWZ1bmN0aW9uKHQpe09iamVjdC5kZWZpbmVQcm9wZXJ0eShuLl9wcm94eSx0LHt2YWx1ZTpmdW5jdGlvbigpe3JldHVybiBpW3RdLmFwcGx5KGksYXJndW1lbnRzKX19KX07Zm9yKHZhciB1IGluIFdlKWwodSk7dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOm5ld1wiLHtpbnRlcmFjdGlvbjp0aGlzfSl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwicG9pbnRlck1vdmVUb2xlcmFuY2VcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gMX19LHtrZXk6XCJwb2ludGVyRG93blwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXt2YXIgcj10aGlzLnVwZGF0ZVBvaW50ZXIodCxlLG4sITApLG89dGhpcy5wb2ludGVyc1tyXTt0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6ZG93blwiLHtwb2ludGVyOnQsZXZlbnQ6ZSxldmVudFRhcmdldDpuLHBvaW50ZXJJbmRleDpyLHBvaW50ZXJJbmZvOm8sdHlwZTpcImRvd25cIixpbnRlcmFjdGlvbjp0aGlzfSl9fSx7a2V5Olwic3RhcnRcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuISh0aGlzLmludGVyYWN0aW5nKCl8fCF0aGlzLnBvaW50ZXJJc0Rvd258fHRoaXMucG9pbnRlcnMubGVuZ3RoPChcImdlc3R1cmVcIj09PXQubmFtZT8yOjEpfHwhZS5vcHRpb25zW3QubmFtZV0uZW5hYmxlZCkmJigoMCxZdC5jb3B5QWN0aW9uKSh0aGlzLnByZXBhcmVkLHQpLHRoaXMuaW50ZXJhY3RhYmxlPWUsdGhpcy5lbGVtZW50PW4sdGhpcy5yZWN0PWUuZ2V0UmVjdChuKSx0aGlzLmVkZ2VzPXRoaXMucHJlcGFyZWQuZWRnZXM/KDAsai5kZWZhdWx0KSh7fSx0aGlzLnByZXBhcmVkLmVkZ2VzKTp7bGVmdDohMCxyaWdodDohMCx0b3A6ITAsYm90dG9tOiEwfSx0aGlzLl9zdG9wcGVkPSExLHRoaXMuX2ludGVyYWN0aW5nPXRoaXMuX2RvUGhhc2Uoe2ludGVyYWN0aW9uOnRoaXMsZXZlbnQ6dGhpcy5kb3duRXZlbnQscGhhc2U6XCJzdGFydFwifSkmJiF0aGlzLl9zdG9wcGVkLHRoaXMuX2ludGVyYWN0aW5nKX19LHtrZXk6XCJwb2ludGVyTW92ZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXt0aGlzLnNpbXVsYXRpb258fHRoaXMubW9kaWZpY2F0aW9uJiZ0aGlzLm1vZGlmaWNhdGlvbi5lbmRSZXN1bHR8fHRoaXMudXBkYXRlUG9pbnRlcih0LGUsbiwhMSk7dmFyIHIsbyxpPXRoaXMuY29vcmRzLmN1ci5wYWdlLng9PT10aGlzLmNvb3Jkcy5wcmV2LnBhZ2UueCYmdGhpcy5jb29yZHMuY3VyLnBhZ2UueT09PXRoaXMuY29vcmRzLnByZXYucGFnZS55JiZ0aGlzLmNvb3Jkcy5jdXIuY2xpZW50Lng9PT10aGlzLmNvb3Jkcy5wcmV2LmNsaWVudC54JiZ0aGlzLmNvb3Jkcy5jdXIuY2xpZW50Lnk9PT10aGlzLmNvb3Jkcy5wcmV2LmNsaWVudC55O3RoaXMucG9pbnRlcklzRG93biYmIXRoaXMucG9pbnRlcldhc01vdmVkJiYocj10aGlzLmNvb3Jkcy5jdXIuY2xpZW50LngtdGhpcy5jb29yZHMuc3RhcnQuY2xpZW50Lngsbz10aGlzLmNvb3Jkcy5jdXIuY2xpZW50LnktdGhpcy5jb29yZHMuc3RhcnQuY2xpZW50LnksdGhpcy5wb2ludGVyV2FzTW92ZWQ9KDAsQy5kZWZhdWx0KShyLG8pPnRoaXMucG9pbnRlck1vdmVUb2xlcmFuY2UpO3ZhciBhPXRoaXMuZ2V0UG9pbnRlckluZGV4KHQpLHM9e3BvaW50ZXI6dCxwb2ludGVySW5kZXg6YSxwb2ludGVySW5mbzp0aGlzLnBvaW50ZXJzW2FdLGV2ZW50OmUsdHlwZTpcIm1vdmVcIixldmVudFRhcmdldDpuLGR4OnIsZHk6byxkdXBsaWNhdGU6aSxpbnRlcmFjdGlvbjp0aGlzfTtpfHxCLnNldENvb3JkVmVsb2NpdHkodGhpcy5jb29yZHMudmVsb2NpdHksdGhpcy5jb29yZHMuZGVsdGEpLHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczptb3ZlXCIscyksaXx8dGhpcy5zaW11bGF0aW9ufHwodGhpcy5pbnRlcmFjdGluZygpJiYocy50eXBlPW51bGwsdGhpcy5tb3ZlKHMpKSx0aGlzLnBvaW50ZXJXYXNNb3ZlZCYmQi5jb3B5Q29vcmRzKHRoaXMuY29vcmRzLnByZXYsdGhpcy5jb29yZHMuY3VyKSl9fSx7a2V5OlwibW92ZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3QmJnQuZXZlbnR8fEIuc2V0WmVyb0Nvb3Jkcyh0aGlzLmNvb3Jkcy5kZWx0YSksKHQ9KDAsai5kZWZhdWx0KSh7cG9pbnRlcjp0aGlzLl9sYXRlc3RQb2ludGVyLnBvaW50ZXIsZXZlbnQ6dGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudCxldmVudFRhcmdldDp0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50VGFyZ2V0LGludGVyYWN0aW9uOnRoaXN9LHR8fHt9KSkucGhhc2U9XCJtb3ZlXCIsdGhpcy5fZG9QaGFzZSh0KX19LHtrZXk6XCJwb2ludGVyVXBcIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXt2YXIgbz10aGlzLmdldFBvaW50ZXJJbmRleCh0KTstMT09PW8mJihvPXRoaXMudXBkYXRlUG9pbnRlcih0LGUsbiwhMSkpO3ZhciBpPS9jYW5jZWwkL2kudGVzdChlLnR5cGUpP1wiY2FuY2VsXCI6XCJ1cFwiO3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpcIi5jb25jYXQoaSkse3BvaW50ZXI6dCxwb2ludGVySW5kZXg6byxwb2ludGVySW5mbzp0aGlzLnBvaW50ZXJzW29dLGV2ZW50OmUsZXZlbnRUYXJnZXQ6bix0eXBlOmksY3VyRXZlbnRUYXJnZXQ6cixpbnRlcmFjdGlvbjp0aGlzfSksdGhpcy5zaW11bGF0aW9ufHx0aGlzLmVuZChlKSx0aGlzLnJlbW92ZVBvaW50ZXIodCxlKX19LHtrZXk6XCJkb2N1bWVudEJsdXJcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLmVuZCh0KSx0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6Ymx1clwiLHtldmVudDp0LHR5cGU6XCJibHVyXCIsaW50ZXJhY3Rpb246dGhpc30pfX0se2tleTpcImVuZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlO3RoaXMuX2VuZGluZz0hMCx0PXR8fHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnQsdGhpcy5pbnRlcmFjdGluZygpJiYoZT10aGlzLl9kb1BoYXNlKHtldmVudDp0LGludGVyYWN0aW9uOnRoaXMscGhhc2U6XCJlbmRcIn0pKSx0aGlzLl9lbmRpbmc9ITEsITA9PT1lJiZ0aGlzLnN0b3AoKX19LHtrZXk6XCJjdXJyZW50QWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faW50ZXJhY3Rpbmc/dGhpcy5wcmVwYXJlZC5uYW1lOm51bGx9fSx7a2V5OlwiaW50ZXJhY3RpbmdcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pbnRlcmFjdGluZ319LHtrZXk6XCJzdG9wXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6c3RvcFwiLHtpbnRlcmFjdGlvbjp0aGlzfSksdGhpcy5pbnRlcmFjdGFibGU9dGhpcy5lbGVtZW50PW51bGwsdGhpcy5faW50ZXJhY3Rpbmc9ITEsdGhpcy5fc3RvcHBlZD0hMCx0aGlzLnByZXBhcmVkLm5hbWU9dGhpcy5wcmV2RXZlbnQ9bnVsbH19LHtrZXk6XCJnZXRQb2ludGVySW5kZXhcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT1CLmdldFBvaW50ZXJJZCh0KTtyZXR1cm5cIm1vdXNlXCI9PT10aGlzLnBvaW50ZXJUeXBlfHxcInBlblwiPT09dGhpcy5wb2ludGVyVHlwZT90aGlzLnBvaW50ZXJzLmxlbmd0aC0xOlouZmluZEluZGV4KHRoaXMucG9pbnRlcnMsKGZ1bmN0aW9uKHQpe3JldHVybiB0LmlkPT09ZX0pKX19LHtrZXk6XCJnZXRQb2ludGVySW5mb1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnBvaW50ZXJzW3RoaXMuZ2V0UG9pbnRlckluZGV4KHQpXX19LHtrZXk6XCJ1cGRhdGVQb2ludGVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4scil7dmFyIG89Qi5nZXRQb2ludGVySWQodCksaT10aGlzLmdldFBvaW50ZXJJbmRleCh0KSxhPXRoaXMucG9pbnRlcnNbaV07cmV0dXJuIHI9ITEhPT1yJiYocnx8Lyhkb3dufHN0YXJ0KSQvaS50ZXN0KGUudHlwZSkpLGE/YS5wb2ludGVyPXQ6KGE9bmV3IFhlLlBvaW50ZXJJbmZvKG8sdCxlLG51bGwsbnVsbCksaT10aGlzLnBvaW50ZXJzLmxlbmd0aCx0aGlzLnBvaW50ZXJzLnB1c2goYSkpLEIuc2V0Q29vcmRzKHRoaXMuY29vcmRzLmN1cix0aGlzLnBvaW50ZXJzLm1hcCgoZnVuY3Rpb24odCl7cmV0dXJuIHQucG9pbnRlcn0pKSx0aGlzLl9ub3coKSksQi5zZXRDb29yZERlbHRhcyh0aGlzLmNvb3Jkcy5kZWx0YSx0aGlzLmNvb3Jkcy5wcmV2LHRoaXMuY29vcmRzLmN1ciksciYmKHRoaXMucG9pbnRlcklzRG93bj0hMCxhLmRvd25UaW1lPXRoaXMuY29vcmRzLmN1ci50aW1lU3RhbXAsYS5kb3duVGFyZ2V0PW4sQi5wb2ludGVyRXh0ZW5kKHRoaXMuZG93blBvaW50ZXIsdCksdGhpcy5pbnRlcmFjdGluZygpfHwoQi5jb3B5Q29vcmRzKHRoaXMuY29vcmRzLnN0YXJ0LHRoaXMuY29vcmRzLmN1ciksQi5jb3B5Q29vcmRzKHRoaXMuY29vcmRzLnByZXYsdGhpcy5jb29yZHMuY3VyKSx0aGlzLmRvd25FdmVudD1lLHRoaXMucG9pbnRlcldhc01vdmVkPSExKSksdGhpcy5fdXBkYXRlTGF0ZXN0UG9pbnRlcih0LGUsbiksdGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOnVwZGF0ZS1wb2ludGVyXCIse3BvaW50ZXI6dCxldmVudDplLGV2ZW50VGFyZ2V0Om4sZG93bjpyLHBvaW50ZXJJbmZvOmEscG9pbnRlckluZGV4OmksaW50ZXJhY3Rpb246dGhpc30pLGl9fSx7a2V5OlwicmVtb3ZlUG9pbnRlclwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49dGhpcy5nZXRQb2ludGVySW5kZXgodCk7aWYoLTEhPT1uKXt2YXIgcj10aGlzLnBvaW50ZXJzW25dO3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpyZW1vdmUtcG9pbnRlclwiLHtwb2ludGVyOnQsZXZlbnQ6ZSxldmVudFRhcmdldDpudWxsLHBvaW50ZXJJbmRleDpuLHBvaW50ZXJJbmZvOnIsaW50ZXJhY3Rpb246dGhpc30pLHRoaXMucG9pbnRlcnMuc3BsaWNlKG4sMSksdGhpcy5wb2ludGVySXNEb3duPSExfX19LHtrZXk6XCJfdXBkYXRlTGF0ZXN0UG9pbnRlclwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXt0aGlzLl9sYXRlc3RQb2ludGVyLnBvaW50ZXI9dCx0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50PWUsdGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudFRhcmdldD1ufX0se2tleTpcImRlc3Ryb3lcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX2xhdGVzdFBvaW50ZXIucG9pbnRlcj1udWxsLHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnQ9bnVsbCx0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50VGFyZ2V0PW51bGx9fSx7a2V5OlwiX2NyZWF0ZVByZXBhcmVkRXZlbnRcIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXtyZXR1cm4gbmV3IGplLkludGVyYWN0RXZlbnQodGhpcyx0LHRoaXMucHJlcGFyZWQubmFtZSxlLHRoaXMuZWxlbWVudCxuLHIpfX0se2tleTpcIl9maXJlRXZlbnRcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLmludGVyYWN0YWJsZS5maXJlKHQpLCghdGhpcy5wcmV2RXZlbnR8fHQudGltZVN0YW1wPj10aGlzLnByZXZFdmVudC50aW1lU3RhbXApJiYodGhpcy5wcmV2RXZlbnQ9dCl9fSx7a2V5OlwiX2RvUGhhc2VcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LmV2ZW50LG49dC5waGFzZSxyPXQucHJlRW5kLG89dC50eXBlLGk9dGhpcy5yZWN0O2lmKGkmJlwibW92ZVwiPT09biYmKGsuYWRkRWRnZXModGhpcy5lZGdlcyxpLHRoaXMuY29vcmRzLmRlbHRhW3RoaXMuaW50ZXJhY3RhYmxlLm9wdGlvbnMuZGVsdGFTb3VyY2VdKSxpLndpZHRoPWkucmlnaHQtaS5sZWZ0LGkuaGVpZ2h0PWkuYm90dG9tLWkudG9wKSwhMT09PXRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLVwiLmNvbmNhdChuKSx0KSlyZXR1cm4hMTt2YXIgYT10LmlFdmVudD10aGlzLl9jcmVhdGVQcmVwYXJlZEV2ZW50KGUsbixyLG8pO3JldHVybiB0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6YWN0aW9uLVwiLmNvbmNhdChuKSx0KSxcInN0YXJ0XCI9PT1uJiYodGhpcy5wcmV2RXZlbnQ9YSksdGhpcy5fZmlyZUV2ZW50KGEpLHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tXCIuY29uY2F0KG4pLHQpLCEwfX0se2tleTpcIl9ub3dcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiBEYXRlLm5vdygpfX1dKSYmVWUoZS5wcm90b3R5cGUsbiksdH0oKTtMZS5JbnRlcmFjdGlvbj1xZTt2YXIgJGU9cWU7TGUuZGVmYXVsdD0kZTt2YXIgR2U9e307ZnVuY3Rpb24gSGUodCl7dC5wb2ludGVySXNEb3duJiYoUWUodC5jb29yZHMuY3VyLHQub2Zmc2V0LnRvdGFsKSx0Lm9mZnNldC5wZW5kaW5nLng9MCx0Lm9mZnNldC5wZW5kaW5nLnk9MCl9ZnVuY3Rpb24gS2UodCl7WmUodC5pbnRlcmFjdGlvbil9ZnVuY3Rpb24gWmUodCl7aWYoIWZ1bmN0aW9uKHQpe3JldHVybiEoIXQub2Zmc2V0LnBlbmRpbmcueCYmIXQub2Zmc2V0LnBlbmRpbmcueSl9KHQpKXJldHVybiExO3ZhciBlPXQub2Zmc2V0LnBlbmRpbmc7cmV0dXJuIFFlKHQuY29vcmRzLmN1cixlKSxRZSh0LmNvb3Jkcy5kZWx0YSxlKSxrLmFkZEVkZ2VzKHQuZWRnZXMsdC5yZWN0LGUpLGUueD0wLGUueT0wLCEwfWZ1bmN0aW9uIEplKHQpe3ZhciBlPXQueCxuPXQueTt0aGlzLm9mZnNldC5wZW5kaW5nLngrPWUsdGhpcy5vZmZzZXQucGVuZGluZy55Kz1uLHRoaXMub2Zmc2V0LnRvdGFsLngrPWUsdGhpcy5vZmZzZXQudG90YWwueSs9bn1mdW5jdGlvbiBRZSh0LGUpe3ZhciBuPXQucGFnZSxyPXQuY2xpZW50LG89ZS54LGk9ZS55O24ueCs9byxuLnkrPWksci54Kz1vLHIueSs9aX1PYmplY3QuZGVmaW5lUHJvcGVydHkoR2UsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksR2UuYWRkVG90YWw9SGUsR2UuYXBwbHlQZW5kaW5nPVplLEdlLmRlZmF1bHQ9dm9pZCAwLExlLl9Qcm94eU1ldGhvZHMub2Zmc2V0Qnk9XCJcIjt2YXIgdG49e2lkOlwib2Zmc2V0XCIsYmVmb3JlOltcIm1vZGlmaWVyc1wiLFwicG9pbnRlci1ldmVudHNcIixcImFjdGlvbnNcIixcImluZXJ0aWFcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt0LkludGVyYWN0aW9uLnByb3RvdHlwZS5vZmZzZXRCeT1KZX0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLm9mZnNldD17dG90YWw6e3g6MCx5OjB9LHBlbmRpbmc6e3g6MCx5OjB9fX0sXCJpbnRlcmFjdGlvbnM6dXBkYXRlLXBvaW50ZXJcIjpmdW5jdGlvbih0KXtyZXR1cm4gSGUodC5pbnRlcmFjdGlvbil9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tc3RhcnRcIjpLZSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLW1vdmVcIjpLZSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLWVuZFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247aWYoWmUoZSkpcmV0dXJuIGUubW92ZSh7b2Zmc2V0OiEwfSksZS5lbmQoKSwhMX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5vZmZzZXQudG90YWwueD0wLGUub2Zmc2V0LnRvdGFsLnk9MCxlLm9mZnNldC5wZW5kaW5nLng9MCxlLm9mZnNldC5wZW5kaW5nLnk9MH19fTtHZS5kZWZhdWx0PXRuO3ZhciBlbj17fTtmdW5jdGlvbiBubih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gcm4odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlbi5kZWZhdWx0PWVuLkluZXJ0aWFTdGF0ZT12b2lkIDA7dmFyIG9uPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLHJuKHRoaXMsXCJhY3RpdmVcIiwhMSkscm4odGhpcyxcImlzTW9kaWZpZWRcIiwhMSkscm4odGhpcyxcInNtb290aEVuZFwiLCExKSxybih0aGlzLFwiYWxsb3dSZXN1bWVcIiwhMSkscm4odGhpcyxcIm1vZGlmaWNhdGlvblwiLHZvaWQgMCkscm4odGhpcyxcIm1vZGlmaWVyQ291bnRcIiwwKSxybih0aGlzLFwibW9kaWZpZXJBcmdcIix2b2lkIDApLHJuKHRoaXMsXCJzdGFydENvb3Jkc1wiLHZvaWQgMCkscm4odGhpcyxcInQwXCIsMCkscm4odGhpcyxcInYwXCIsMCkscm4odGhpcyxcInRlXCIsMCkscm4odGhpcyxcInRhcmdldE9mZnNldFwiLHZvaWQgMCkscm4odGhpcyxcIm1vZGlmaWVkT2Zmc2V0XCIsdm9pZCAwKSxybih0aGlzLFwiY3VycmVudE9mZnNldFwiLHZvaWQgMCkscm4odGhpcyxcImxhbWJkYV92MFwiLDApLHJuKHRoaXMsXCJvbmVfdmVfdjBcIiwwKSxybih0aGlzLFwidGltZW91dFwiLHZvaWQgMCkscm4odGhpcyxcImludGVyYWN0aW9uXCIsdm9pZCAwKSx0aGlzLmludGVyYWN0aW9uPWV9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5Olwic3RhcnRcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmludGVyYWN0aW9uLG49YW4oZSk7aWYoIW58fCFuLmVuYWJsZWQpcmV0dXJuITE7dmFyIHI9ZS5jb29yZHMudmVsb2NpdHkuY2xpZW50LG89KDAsQy5kZWZhdWx0KShyLngsci55KSxpPXRoaXMubW9kaWZpY2F0aW9ufHwodGhpcy5tb2RpZmljYXRpb249bmV3IHllLmRlZmF1bHQoZSkpO2lmKGkuY29weUZyb20oZS5tb2RpZmljYXRpb24pLHRoaXMudDA9ZS5fbm93KCksdGhpcy5hbGxvd1Jlc3VtZT1uLmFsbG93UmVzdW1lLHRoaXMudjA9byx0aGlzLmN1cnJlbnRPZmZzZXQ9e3g6MCx5OjB9LHRoaXMuc3RhcnRDb29yZHM9ZS5jb29yZHMuY3VyLnBhZ2UsdGhpcy5tb2RpZmllckFyZz1pLmZpbGxBcmcoe3BhZ2VDb29yZHM6dGhpcy5zdGFydENvb3JkcyxwcmVFbmQ6ITAscGhhc2U6XCJpbmVydGlhc3RhcnRcIn0pLHRoaXMudDAtZS5jb29yZHMuY3VyLnRpbWVTdGFtcDw1MCYmbz5uLm1pblNwZWVkJiZvPm4uZW5kU3BlZWQpdGhpcy5zdGFydEluZXJ0aWEoKTtlbHNle2lmKGkucmVzdWx0PWkuc2V0QWxsKHRoaXMubW9kaWZpZXJBcmcpLCFpLnJlc3VsdC5jaGFuZ2VkKXJldHVybiExO3RoaXMuc3RhcnRTbW9vdGhFbmQoKX1yZXR1cm4gZS5tb2RpZmljYXRpb24ucmVzdWx0LnJlY3Q9bnVsbCxlLm9mZnNldEJ5KHRoaXMudGFyZ2V0T2Zmc2V0KSxlLl9kb1BoYXNlKHtpbnRlcmFjdGlvbjplLGV2ZW50OnQscGhhc2U6XCJpbmVydGlhc3RhcnRcIn0pLGUub2Zmc2V0Qnkoe3g6LXRoaXMudGFyZ2V0T2Zmc2V0LngseTotdGhpcy50YXJnZXRPZmZzZXQueX0pLGUubW9kaWZpY2F0aW9uLnJlc3VsdC5yZWN0PW51bGwsdGhpcy5hY3RpdmU9ITAsZS5zaW11bGF0aW9uPXRoaXMsITB9fSx7a2V5Olwic3RhcnRJbmVydGlhXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLGU9dGhpcy5pbnRlcmFjdGlvbi5jb29yZHMudmVsb2NpdHkuY2xpZW50LG49YW4odGhpcy5pbnRlcmFjdGlvbikscj1uLnJlc2lzdGFuY2Usbz0tTWF0aC5sb2cobi5lbmRTcGVlZC90aGlzLnYwKS9yO3RoaXMudGFyZ2V0T2Zmc2V0PXt4OihlLngtbykvcix5OihlLnktbykvcn0sdGhpcy50ZT1vLHRoaXMubGFtYmRhX3YwPXIvdGhpcy52MCx0aGlzLm9uZV92ZV92MD0xLW4uZW5kU3BlZWQvdGhpcy52MDt2YXIgaT10aGlzLm1vZGlmaWNhdGlvbixhPXRoaXMubW9kaWZpZXJBcmc7YS5wYWdlQ29vcmRzPXt4OnRoaXMuc3RhcnRDb29yZHMueCt0aGlzLnRhcmdldE9mZnNldC54LHk6dGhpcy5zdGFydENvb3Jkcy55K3RoaXMudGFyZ2V0T2Zmc2V0Lnl9LGkucmVzdWx0PWkuc2V0QWxsKGEpLGkucmVzdWx0LmNoYW5nZWQmJih0aGlzLmlzTW9kaWZpZWQ9ITAsdGhpcy5tb2RpZmllZE9mZnNldD17eDp0aGlzLnRhcmdldE9mZnNldC54K2kucmVzdWx0LmRlbHRhLngseTp0aGlzLnRhcmdldE9mZnNldC55K2kucmVzdWx0LmRlbHRhLnl9KSx0aGlzLm9uTmV4dEZyYW1lKChmdW5jdGlvbigpe3JldHVybiB0LmluZXJ0aWFUaWNrKCl9KSl9fSx7a2V5Olwic3RhcnRTbW9vdGhFbmRcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXM7dGhpcy5zbW9vdGhFbmQ9ITAsdGhpcy5pc01vZGlmaWVkPSEwLHRoaXMudGFyZ2V0T2Zmc2V0PXt4OnRoaXMubW9kaWZpY2F0aW9uLnJlc3VsdC5kZWx0YS54LHk6dGhpcy5tb2RpZmljYXRpb24ucmVzdWx0LmRlbHRhLnl9LHRoaXMub25OZXh0RnJhbWUoKGZ1bmN0aW9uKCl7cmV0dXJuIHQuc21vb3RoRW5kVGljaygpfSkpfX0se2tleTpcIm9uTmV4dEZyYW1lXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpczt0aGlzLnRpbWVvdXQ9anQuZGVmYXVsdC5yZXF1ZXN0KChmdW5jdGlvbigpe2UuYWN0aXZlJiZ0KCl9KSl9fSx7a2V5OlwiaW5lcnRpYVRpY2tcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0LGUsbixyLG8saT10aGlzLGE9dGhpcy5pbnRlcmFjdGlvbixzPWFuKGEpLnJlc2lzdGFuY2UsbD0oYS5fbm93KCktdGhpcy50MCkvMWUzO2lmKGw8dGhpcy50ZSl7dmFyIHUsYz0xLShNYXRoLmV4cCgtcypsKS10aGlzLmxhbWJkYV92MCkvdGhpcy5vbmVfdmVfdjA7dGhpcy5pc01vZGlmaWVkPygwLDAsdD10aGlzLnRhcmdldE9mZnNldC54LGU9dGhpcy50YXJnZXRPZmZzZXQueSxuPXRoaXMubW9kaWZpZWRPZmZzZXQueCxyPXRoaXMubW9kaWZpZWRPZmZzZXQueSx1PXt4OnNuKG89YywwLHQsbikseTpzbihvLDAsZSxyKX0pOnU9e3g6dGhpcy50YXJnZXRPZmZzZXQueCpjLHk6dGhpcy50YXJnZXRPZmZzZXQueSpjfTt2YXIgZj17eDp1LngtdGhpcy5jdXJyZW50T2Zmc2V0LngseTp1LnktdGhpcy5jdXJyZW50T2Zmc2V0Lnl9O3RoaXMuY3VycmVudE9mZnNldC54Kz1mLngsdGhpcy5jdXJyZW50T2Zmc2V0LnkrPWYueSxhLm9mZnNldEJ5KGYpLGEubW92ZSgpLHRoaXMub25OZXh0RnJhbWUoKGZ1bmN0aW9uKCl7cmV0dXJuIGkuaW5lcnRpYVRpY2soKX0pKX1lbHNlIGEub2Zmc2V0Qnkoe3g6dGhpcy5tb2RpZmllZE9mZnNldC54LXRoaXMuY3VycmVudE9mZnNldC54LHk6dGhpcy5tb2RpZmllZE9mZnNldC55LXRoaXMuY3VycmVudE9mZnNldC55fSksdGhpcy5lbmQoKX19LHtrZXk6XCJzbW9vdGhFbmRUaWNrXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLGU9dGhpcy5pbnRlcmFjdGlvbixuPWUuX25vdygpLXRoaXMudDAscj1hbihlKS5zbW9vdGhFbmREdXJhdGlvbjtpZihuPHIpe3ZhciBvPXt4OmxuKG4sMCx0aGlzLnRhcmdldE9mZnNldC54LHIpLHk6bG4obiwwLHRoaXMudGFyZ2V0T2Zmc2V0Lnkscil9LGk9e3g6by54LXRoaXMuY3VycmVudE9mZnNldC54LHk6by55LXRoaXMuY3VycmVudE9mZnNldC55fTt0aGlzLmN1cnJlbnRPZmZzZXQueCs9aS54LHRoaXMuY3VycmVudE9mZnNldC55Kz1pLnksZS5vZmZzZXRCeShpKSxlLm1vdmUoe3NraXBNb2RpZmllcnM6dGhpcy5tb2RpZmllckNvdW50fSksdGhpcy5vbk5leHRGcmFtZSgoZnVuY3Rpb24oKXtyZXR1cm4gdC5zbW9vdGhFbmRUaWNrKCl9KSl9ZWxzZSBlLm9mZnNldEJ5KHt4OnRoaXMudGFyZ2V0T2Zmc2V0LngtdGhpcy5jdXJyZW50T2Zmc2V0LngseTp0aGlzLnRhcmdldE9mZnNldC55LXRoaXMuY3VycmVudE9mZnNldC55fSksdGhpcy5lbmQoKX19LHtrZXk6XCJyZXN1bWVcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LnBvaW50ZXIsbj10LmV2ZW50LHI9dC5ldmVudFRhcmdldCxvPXRoaXMuaW50ZXJhY3Rpb247by5vZmZzZXRCeSh7eDotdGhpcy5jdXJyZW50T2Zmc2V0LngseTotdGhpcy5jdXJyZW50T2Zmc2V0Lnl9KSxvLnVwZGF0ZVBvaW50ZXIoZSxuLHIsITApLG8uX2RvUGhhc2Uoe2ludGVyYWN0aW9uOm8sZXZlbnQ6bixwaGFzZTpcInJlc3VtZVwifSksKDAsQi5jb3B5Q29vcmRzKShvLmNvb3Jkcy5wcmV2LG8uY29vcmRzLmN1ciksdGhpcy5zdG9wKCl9fSx7a2V5OlwiZW5kXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmludGVyYWN0aW9uLm1vdmUoKSx0aGlzLmludGVyYWN0aW9uLmVuZCgpLHRoaXMuc3RvcCgpfX0se2tleTpcInN0b3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuYWN0aXZlPXRoaXMuc21vb3RoRW5kPSExLHRoaXMuaW50ZXJhY3Rpb24uc2ltdWxhdGlvbj1udWxsLGp0LmRlZmF1bHQuY2FuY2VsKHRoaXMudGltZW91dCl9fV0pJiZubihlLnByb3RvdHlwZSxuKSx0fSgpO2Z1bmN0aW9uIGFuKHQpe3ZhciBlPXQuaW50ZXJhY3RhYmxlLG49dC5wcmVwYXJlZDtyZXR1cm4gZSYmZS5vcHRpb25zJiZuLm5hbWUmJmUub3B0aW9uc1tuLm5hbWVdLmluZXJ0aWF9ZnVuY3Rpb24gc24odCxlLG4scil7dmFyIG89MS10O3JldHVybiBvKm8qZSsyKm8qdCpuK3QqdCpyfWZ1bmN0aW9uIGxuKHQsZSxuLHIpe3JldHVybi1uKih0Lz1yKSoodC0yKStlfWVuLkluZXJ0aWFTdGF0ZT1vbjt2YXIgdW49e2lkOlwiaW5lcnRpYVwiLGJlZm9yZTpbXCJtb2RpZmllcnNcIixcImFjdGlvbnNcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmRlZmF1bHRzO3QudXNlUGx1Z2luKEdlLmRlZmF1bHQpLHQudXNlUGx1Z2luKFNlLmRlZmF1bHQpLHQuYWN0aW9ucy5waGFzZXMuaW5lcnRpYXN0YXJ0PSEwLHQuYWN0aW9ucy5waGFzZXMucmVzdW1lPSEwLGUucGVyQWN0aW9uLmluZXJ0aWE9e2VuYWJsZWQ6ITEscmVzaXN0YW5jZToxMCxtaW5TcGVlZDoxMDAsZW5kU3BlZWQ6MTAsYWxsb3dSZXN1bWU6ITAsc21vb3RoRW5kRHVyYXRpb246MzAwfX0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2UuaW5lcnRpYT1uZXcgb24oZSl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZXZlbnQ7cmV0dXJuKCFlLl9pbnRlcmFjdGluZ3x8ZS5zaW11bGF0aW9ufHwhZS5pbmVydGlhLnN0YXJ0KG4pKSYmbnVsbH0sXCJpbnRlcmFjdGlvbnM6ZG93blwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmV2ZW50VGFyZ2V0LHI9ZS5pbmVydGlhO2lmKHIuYWN0aXZlKWZvcih2YXIgbz1uO2kuZGVmYXVsdC5lbGVtZW50KG8pOyl7aWYobz09PWUuZWxlbWVudCl7ci5yZXN1bWUodCk7YnJlYWt9bz1fLnBhcmVudE5vZGUobyl9fSxcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbi5pbmVydGlhO2UuYWN0aXZlJiZlLnN0b3AoKX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1yZXN1bWVcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbjtlLnN0b3AodCksZS5zdGFydCh0LHQuaW50ZXJhY3Rpb24uY29vcmRzLmN1ci5wYWdlKSxlLmFwcGx5VG9JbnRlcmFjdGlvbih0KX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1pbmVydGlhc3RhcnRcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24uc2V0QW5kQXBwbHkodCl9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1yZXN1bWVcIjpTZS5hZGRFdmVudE1vZGlmaWVycyxcImludGVyYWN0aW9uczphY3Rpb24taW5lcnRpYXN0YXJ0XCI6U2UuYWRkRXZlbnRNb2RpZmllcnMsXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLWluZXJ0aWFzdGFydFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN0b3JlSW50ZXJhY3Rpb25Db29yZHModCl9LFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1yZXN1bWVcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24ucmVzdG9yZUludGVyYWN0aW9uQ29vcmRzKHQpfX19O2VuLmRlZmF1bHQ9dW47dmFyIGNuPXt9O2Z1bmN0aW9uIGZuKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBkbih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9ZnVuY3Rpb24gcG4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtpZih0LmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZClicmVhaztyKHQpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkoY24sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksY24uRXZlbnRhYmxlPXZvaWQgMDt2YXIgdm49ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksZG4odGhpcyxcIm9wdGlvbnNcIix2b2lkIDApLGRuKHRoaXMsXCJ0eXBlc1wiLHt9KSxkbih0aGlzLFwicHJvcGFnYXRpb25TdG9wcGVkXCIsITEpLGRuKHRoaXMsXCJpbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksZG4odGhpcyxcImdsb2JhbFwiLHZvaWQgMCksdGhpcy5vcHRpb25zPSgwLGouZGVmYXVsdCkoe30sZXx8e30pfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcImZpcmVcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZSxuPXRoaXMuZ2xvYmFsOyhlPXRoaXMudHlwZXNbdC50eXBlXSkmJnBuKHQsZSksIXQucHJvcGFnYXRpb25TdG9wcGVkJiZuJiYoZT1uW3QudHlwZV0pJiZwbih0LGUpfX0se2tleTpcIm9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj0oMCxSLmRlZmF1bHQpKHQsZSk7Zm9yKHQgaW4gbil0aGlzLnR5cGVzW3RdPVoubWVyZ2UodGhpcy50eXBlc1t0XXx8W10sblt0XSl9fSx7a2V5Olwib2ZmXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj0oMCxSLmRlZmF1bHQpKHQsZSk7Zm9yKHQgaW4gbil7dmFyIHI9dGhpcy50eXBlc1t0XTtpZihyJiZyLmxlbmd0aClmb3IodmFyIG89MDtvPG5bdF0ubGVuZ3RoO28rKyl7dmFyIGk9blt0XVtvXSxhPXIuaW5kZXhPZihpKTstMSE9PWEmJnIuc3BsaWNlKGEsMSl9fX19LHtrZXk6XCJnZXRSZWN0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIG51bGx9fV0pJiZmbihlLnByb3RvdHlwZSxuKSx0fSgpO2NuLkV2ZW50YWJsZT12bjt2YXIgaG49e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGhuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGhuLmRlZmF1bHQ9ZnVuY3Rpb24odCxlKXtpZihlLnBoYXNlbGVzc1R5cGVzW3RdKXJldHVybiEwO2Zvcih2YXIgbiBpbiBlLm1hcClpZigwPT09dC5pbmRleE9mKG4pJiZ0LnN1YnN0cihuLmxlbmd0aClpbiBlLnBoYXNlcylyZXR1cm4hMDtyZXR1cm4hMX07dmFyIGduPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShnbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxnbi5jcmVhdGVJbnRlcmFjdFN0YXRpYz1mdW5jdGlvbih0KXt2YXIgZT1mdW5jdGlvbiBlKG4scil7dmFyIG89dC5pbnRlcmFjdGFibGVzLmdldChuLHIpO3JldHVybiBvfHwoKG89dC5pbnRlcmFjdGFibGVzLm5ldyhuLHIpKS5ldmVudHMuZ2xvYmFsPWUuZ2xvYmFsRXZlbnRzKSxvfTtyZXR1cm4gZS5nZXRQb2ludGVyQXZlcmFnZT1CLnBvaW50ZXJBdmVyYWdlLGUuZ2V0VG91Y2hCQm94PUIudG91Y2hCQm94LGUuZ2V0VG91Y2hEaXN0YW5jZT1CLnRvdWNoRGlzdGFuY2UsZS5nZXRUb3VjaEFuZ2xlPUIudG91Y2hBbmdsZSxlLmdldEVsZW1lbnRSZWN0PV8uZ2V0RWxlbWVudFJlY3QsZS5nZXRFbGVtZW50Q2xpZW50UmVjdD1fLmdldEVsZW1lbnRDbGllbnRSZWN0LGUubWF0Y2hlc1NlbGVjdG9yPV8ubWF0Y2hlc1NlbGVjdG9yLGUuY2xvc2VzdD1fLmNsb3Nlc3QsZS5nbG9iYWxFdmVudHM9e30sZS52ZXJzaW9uPVwiMS4xMC4xMVwiLGUuc2NvcGU9dCxlLnVzZT1mdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLnNjb3BlLnVzZVBsdWdpbih0LGUpLHRoaXN9LGUuaXNTZXQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4hIXRoaXMuc2NvcGUuaW50ZXJhY3RhYmxlcy5nZXQodCxlJiZlLmNvbnRleHQpfSxlLm9uPSgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCxlLG4pe2lmKGkuZGVmYXVsdC5zdHJpbmcodCkmJi0xIT09dC5zZWFyY2goXCIgXCIpJiYodD10LnRyaW0oKS5zcGxpdCgvICsvKSksaS5kZWZhdWx0LmFycmF5KHQpKXtmb3IodmFyIHI9MDtyPHQubGVuZ3RoO3IrKyl7dmFyIG89dFtyXTt0aGlzLm9uKG8sZSxuKX1yZXR1cm4gdGhpc31pZihpLmRlZmF1bHQub2JqZWN0KHQpKXtmb3IodmFyIGEgaW4gdCl0aGlzLm9uKGEsdFthXSxlKTtyZXR1cm4gdGhpc31yZXR1cm4oMCxobi5kZWZhdWx0KSh0LHRoaXMuc2NvcGUuYWN0aW9ucyk/dGhpcy5nbG9iYWxFdmVudHNbdF0/dGhpcy5nbG9iYWxFdmVudHNbdF0ucHVzaChlKTp0aGlzLmdsb2JhbEV2ZW50c1t0XT1bZV06dGhpcy5zY29wZS5ldmVudHMuYWRkKHRoaXMuc2NvcGUuZG9jdW1lbnQsdCxlLHtvcHRpb25zOm59KSx0aGlzfSksXCJUaGUgaW50ZXJhY3Qub24oKSBtZXRob2QgaXMgYmVpbmcgZGVwcmVjYXRlZFwiKSxlLm9mZj0oMCxZdC53YXJuT25jZSkoKGZ1bmN0aW9uKHQsZSxuKXtpZihpLmRlZmF1bHQuc3RyaW5nKHQpJiYtMSE9PXQuc2VhcmNoKFwiIFwiKSYmKHQ9dC50cmltKCkuc3BsaXQoLyArLykpLGkuZGVmYXVsdC5hcnJheSh0KSl7Zm9yKHZhciByPTA7cjx0Lmxlbmd0aDtyKyspe3ZhciBvPXRbcl07dGhpcy5vZmYobyxlLG4pfXJldHVybiB0aGlzfWlmKGkuZGVmYXVsdC5vYmplY3QodCkpe2Zvcih2YXIgYSBpbiB0KXRoaXMub2ZmKGEsdFthXSxlKTtyZXR1cm4gdGhpc312YXIgcztyZXR1cm4oMCxobi5kZWZhdWx0KSh0LHRoaXMuc2NvcGUuYWN0aW9ucyk/dCBpbiB0aGlzLmdsb2JhbEV2ZW50cyYmLTEhPT0ocz10aGlzLmdsb2JhbEV2ZW50c1t0XS5pbmRleE9mKGUpKSYmdGhpcy5nbG9iYWxFdmVudHNbdF0uc3BsaWNlKHMsMSk6dGhpcy5zY29wZS5ldmVudHMucmVtb3ZlKHRoaXMuc2NvcGUuZG9jdW1lbnQsdCxlLG4pLHRoaXN9KSxcIlRoZSBpbnRlcmFjdC5vZmYoKSBtZXRob2QgaXMgYmVpbmcgZGVwcmVjYXRlZFwiKSxlLmRlYnVnPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2NvcGV9LGUuc3VwcG9ydHNUb3VjaD1mdW5jdGlvbigpe3JldHVybiBiLmRlZmF1bHQuc3VwcG9ydHNUb3VjaH0sZS5zdXBwb3J0c1BvaW50ZXJFdmVudD1mdW5jdGlvbigpe3JldHVybiBiLmRlZmF1bHQuc3VwcG9ydHNQb2ludGVyRXZlbnR9LGUuc3RvcD1mdW5jdGlvbigpe2Zvcih2YXIgdD0wO3Q8dGhpcy5zY29wZS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7dCsrKXRoaXMuc2NvcGUuaW50ZXJhY3Rpb25zLmxpc3RbdF0uc3RvcCgpO3JldHVybiB0aGlzfSxlLnBvaW50ZXJNb3ZlVG9sZXJhbmNlPWZ1bmN0aW9uKHQpe3JldHVybiBpLmRlZmF1bHQubnVtYmVyKHQpPyh0aGlzLnNjb3BlLmludGVyYWN0aW9ucy5wb2ludGVyTW92ZVRvbGVyYW5jZT10LHRoaXMpOnRoaXMuc2NvcGUuaW50ZXJhY3Rpb25zLnBvaW50ZXJNb3ZlVG9sZXJhbmNlfSxlLmFkZERvY3VtZW50PWZ1bmN0aW9uKHQsZSl7dGhpcy5zY29wZS5hZGREb2N1bWVudCh0LGUpfSxlLnJlbW92ZURvY3VtZW50PWZ1bmN0aW9uKHQpe3RoaXMuc2NvcGUucmVtb3ZlRG9jdW1lbnQodCl9LGV9O3ZhciB5bj17fTtmdW5jdGlvbiBtbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gYm4odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh5bixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx5bi5JbnRlcmFjdGFibGU9dm9pZCAwO3ZhciB4bj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQobixyLG8saSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxibih0aGlzLFwib3B0aW9uc1wiLHZvaWQgMCksYm4odGhpcyxcIl9hY3Rpb25zXCIsdm9pZCAwKSxibih0aGlzLFwidGFyZ2V0XCIsdm9pZCAwKSxibih0aGlzLFwiZXZlbnRzXCIsbmV3IGNuLkV2ZW50YWJsZSksYm4odGhpcyxcIl9jb250ZXh0XCIsdm9pZCAwKSxibih0aGlzLFwiX3dpblwiLHZvaWQgMCksYm4odGhpcyxcIl9kb2NcIix2b2lkIDApLGJuKHRoaXMsXCJfc2NvcGVFdmVudHNcIix2b2lkIDApLGJuKHRoaXMsXCJfcmVjdENoZWNrZXJcIix2b2lkIDApLHRoaXMuX2FjdGlvbnM9ci5hY3Rpb25zLHRoaXMudGFyZ2V0PW4sdGhpcy5fY29udGV4dD1yLmNvbnRleHR8fG8sdGhpcy5fd2luPSgwLGUuZ2V0V2luZG93KSgoMCxfLnRyeVNlbGVjdG9yKShuKT90aGlzLl9jb250ZXh0Om4pLHRoaXMuX2RvYz10aGlzLl93aW4uZG9jdW1lbnQsdGhpcy5fc2NvcGVFdmVudHM9aSx0aGlzLnNldChyKX12YXIgbixyO3JldHVybiBuPXQsKHI9W3trZXk6XCJfZGVmYXVsdHNcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm57YmFzZTp7fSxwZXJBY3Rpb246e30sYWN0aW9uczp7fX19fSx7a2V5Olwic2V0T25FdmVudHNcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3JldHVybiBpLmRlZmF1bHQuZnVuYyhlLm9uc3RhcnQpJiZ0aGlzLm9uKFwiXCIuY29uY2F0KHQsXCJzdGFydFwiKSxlLm9uc3RhcnQpLGkuZGVmYXVsdC5mdW5jKGUub25tb3ZlKSYmdGhpcy5vbihcIlwiLmNvbmNhdCh0LFwibW92ZVwiKSxlLm9ubW92ZSksaS5kZWZhdWx0LmZ1bmMoZS5vbmVuZCkmJnRoaXMub24oXCJcIi5jb25jYXQodCxcImVuZFwiKSxlLm9uZW5kKSxpLmRlZmF1bHQuZnVuYyhlLm9uaW5lcnRpYXN0YXJ0KSYmdGhpcy5vbihcIlwiLmNvbmNhdCh0LFwiaW5lcnRpYXN0YXJ0XCIpLGUub25pbmVydGlhc3RhcnQpLHRoaXN9fSx7a2V5OlwidXBkYXRlUGVyQWN0aW9uTGlzdGVuZXJzXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4peyhpLmRlZmF1bHQuYXJyYXkoZSl8fGkuZGVmYXVsdC5vYmplY3QoZSkpJiZ0aGlzLm9mZih0LGUpLChpLmRlZmF1bHQuYXJyYXkobil8fGkuZGVmYXVsdC5vYmplY3QobikpJiZ0aGlzLm9uKHQsbil9fSx7a2V5Olwic2V0UGVyQWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj10aGlzLl9kZWZhdWx0cztmb3IodmFyIHIgaW4gZSl7dmFyIG89cixhPXRoaXMub3B0aW9uc1t0XSxzPWVbb107XCJsaXN0ZW5lcnNcIj09PW8mJnRoaXMudXBkYXRlUGVyQWN0aW9uTGlzdGVuZXJzKHQsYS5saXN0ZW5lcnMscyksaS5kZWZhdWx0LmFycmF5KHMpP2Fbb109Wi5mcm9tKHMpOmkuZGVmYXVsdC5wbGFpbk9iamVjdChzKT8oYVtvXT0oMCxqLmRlZmF1bHQpKGFbb118fHt9LCgwLGdlLmRlZmF1bHQpKHMpKSxpLmRlZmF1bHQub2JqZWN0KG4ucGVyQWN0aW9uW29dKSYmXCJlbmFibGVkXCJpbiBuLnBlckFjdGlvbltvXSYmKGFbb10uZW5hYmxlZD0hMSE9PXMuZW5hYmxlZCkpOmkuZGVmYXVsdC5ib29sKHMpJiZpLmRlZmF1bHQub2JqZWN0KG4ucGVyQWN0aW9uW29dKT9hW29dLmVuYWJsZWQ9czphW29dPXN9fX0se2tleTpcImdldFJlY3RcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdD10fHwoaS5kZWZhdWx0LmVsZW1lbnQodGhpcy50YXJnZXQpP3RoaXMudGFyZ2V0Om51bGwpLGkuZGVmYXVsdC5zdHJpbmcodGhpcy50YXJnZXQpJiYodD10fHx0aGlzLl9jb250ZXh0LnF1ZXJ5U2VsZWN0b3IodGhpcy50YXJnZXQpKSwoMCxfLmdldEVsZW1lbnRSZWN0KSh0KX19LHtrZXk6XCJyZWN0Q2hlY2tlclwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXM7cmV0dXJuIGkuZGVmYXVsdC5mdW5jKHQpPyh0aGlzLl9yZWN0Q2hlY2tlcj10LHRoaXMuZ2V0UmVjdD1mdW5jdGlvbih0KXt2YXIgbj0oMCxqLmRlZmF1bHQpKHt9LGUuX3JlY3RDaGVja2VyKHQpKTtyZXR1cm5cIndpZHRoXCJpbiBufHwobi53aWR0aD1uLnJpZ2h0LW4ubGVmdCxuLmhlaWdodD1uLmJvdHRvbS1uLnRvcCksbn0sdGhpcyk6bnVsbD09PXQ/KGRlbGV0ZSB0aGlzLmdldFJlY3QsZGVsZXRlIHRoaXMuX3JlY3RDaGVja2VyLHRoaXMpOnRoaXMuZ2V0UmVjdH19LHtrZXk6XCJfYmFja0NvbXBhdE9wdGlvblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7aWYoKDAsXy50cnlTZWxlY3RvcikoZSl8fGkuZGVmYXVsdC5vYmplY3QoZSkpe2Zvcih2YXIgbiBpbiB0aGlzLm9wdGlvbnNbdF09ZSx0aGlzLl9hY3Rpb25zLm1hcCl0aGlzLm9wdGlvbnNbbl1bdF09ZTtyZXR1cm4gdGhpc31yZXR1cm4gdGhpcy5vcHRpb25zW3RdfX0se2tleTpcIm9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9iYWNrQ29tcGF0T3B0aW9uKFwib3JpZ2luXCIsdCl9fSx7a2V5OlwiZGVsdGFTb3VyY2VcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm5cInBhZ2VcIj09PXR8fFwiY2xpZW50XCI9PT10Pyh0aGlzLm9wdGlvbnMuZGVsdGFTb3VyY2U9dCx0aGlzKTp0aGlzLm9wdGlvbnMuZGVsdGFTb3VyY2V9fSx7a2V5OlwiY29udGV4dFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2NvbnRleHR9fSx7a2V5OlwiaW5Db250ZXh0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2NvbnRleHQ9PT10Lm93bmVyRG9jdW1lbnR8fCgwLF8ubm9kZUNvbnRhaW5zKSh0aGlzLl9jb250ZXh0LHQpfX0se2tleTpcInRlc3RJZ25vcmVBbGxvd1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4hdGhpcy50ZXN0SWdub3JlKHQuaWdub3JlRnJvbSxlLG4pJiZ0aGlzLnRlc3RBbGxvdyh0LmFsbG93RnJvbSxlLG4pfX0se2tleTpcInRlc3RBbGxvd1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4hdHx8ISFpLmRlZmF1bHQuZWxlbWVudChuKSYmKGkuZGVmYXVsdC5zdHJpbmcodCk/KDAsXy5tYXRjaGVzVXBUbykobix0LGUpOiEhaS5kZWZhdWx0LmVsZW1lbnQodCkmJigwLF8ubm9kZUNvbnRhaW5zKSh0LG4pKX19LHtrZXk6XCJ0ZXN0SWdub3JlXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiEoIXR8fCFpLmRlZmF1bHQuZWxlbWVudChuKSkmJihpLmRlZmF1bHQuc3RyaW5nKHQpPygwLF8ubWF0Y2hlc1VwVG8pKG4sdCxlKTohIWkuZGVmYXVsdC5lbGVtZW50KHQpJiYoMCxfLm5vZGVDb250YWlucykodCxuKSl9fSx7a2V5OlwiZmlyZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmV2ZW50cy5maXJlKHQpLHRoaXN9fSx7a2V5OlwiX29uT2ZmXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4scil7aS5kZWZhdWx0Lm9iamVjdChlKSYmIWkuZGVmYXVsdC5hcnJheShlKSYmKHI9bixuPW51bGwpO3ZhciBvPVwib25cIj09PXQ/XCJhZGRcIjpcInJlbW92ZVwiLGE9KDAsUi5kZWZhdWx0KShlLG4pO2Zvcih2YXIgcyBpbiBhKXtcIndoZWVsXCI9PT1zJiYocz1iLmRlZmF1bHQud2hlZWxFdmVudCk7Zm9yKHZhciBsPTA7bDxhW3NdLmxlbmd0aDtsKyspe3ZhciB1PWFbc11bbF07KDAsaG4uZGVmYXVsdCkocyx0aGlzLl9hY3Rpb25zKT90aGlzLmV2ZW50c1t0XShzLHUpOmkuZGVmYXVsdC5zdHJpbmcodGhpcy50YXJnZXQpP3RoaXMuX3Njb3BlRXZlbnRzW1wiXCIuY29uY2F0KG8sXCJEZWxlZ2F0ZVwiKV0odGhpcy50YXJnZXQsdGhpcy5fY29udGV4dCxzLHUscik6dGhpcy5fc2NvcGVFdmVudHNbb10odGhpcy50YXJnZXQscyx1LHIpfX1yZXR1cm4gdGhpc319LHtrZXk6XCJvblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4gdGhpcy5fb25PZmYoXCJvblwiLHQsZSxuKX19LHtrZXk6XCJvZmZcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuIHRoaXMuX29uT2ZmKFwib2ZmXCIsdCxlLG4pfX0se2tleTpcInNldFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2RlZmF1bHRzO2Zvcih2YXIgbiBpbiBpLmRlZmF1bHQub2JqZWN0KHQpfHwodD17fSksdGhpcy5vcHRpb25zPSgwLGdlLmRlZmF1bHQpKGUuYmFzZSksdGhpcy5fYWN0aW9ucy5tZXRob2REaWN0KXt2YXIgcj1uLG89dGhpcy5fYWN0aW9ucy5tZXRob2REaWN0W3JdO3RoaXMub3B0aW9uc1tyXT17fSx0aGlzLnNldFBlckFjdGlvbihyLCgwLGouZGVmYXVsdCkoKDAsai5kZWZhdWx0KSh7fSxlLnBlckFjdGlvbiksZS5hY3Rpb25zW3JdKSksdGhpc1tvXSh0W3JdKX1mb3IodmFyIGEgaW4gdClpLmRlZmF1bHQuZnVuYyh0aGlzW2FdKSYmdGhpc1thXSh0W2FdKTtyZXR1cm4gdGhpc319LHtrZXk6XCJ1bnNldFwiLHZhbHVlOmZ1bmN0aW9uKCl7aWYoaS5kZWZhdWx0LnN0cmluZyh0aGlzLnRhcmdldCkpZm9yKHZhciB0IGluIHRoaXMuX3Njb3BlRXZlbnRzLmRlbGVnYXRlZEV2ZW50cylmb3IodmFyIGU9dGhpcy5fc2NvcGVFdmVudHMuZGVsZWdhdGVkRXZlbnRzW3RdLG49ZS5sZW5ndGgtMTtuPj0wO24tLSl7dmFyIHI9ZVtuXSxvPXIuc2VsZWN0b3IsYT1yLmNvbnRleHQscz1yLmxpc3RlbmVycztvPT09dGhpcy50YXJnZXQmJmE9PT10aGlzLl9jb250ZXh0JiZlLnNwbGljZShuLDEpO2Zvcih2YXIgbD1zLmxlbmd0aC0xO2w+PTA7bC0tKXRoaXMuX3Njb3BlRXZlbnRzLnJlbW92ZURlbGVnYXRlKHRoaXMudGFyZ2V0LHRoaXMuX2NvbnRleHQsdCxzW2xdWzBdLHNbbF1bMV0pfWVsc2UgdGhpcy5fc2NvcGVFdmVudHMucmVtb3ZlKHRoaXMudGFyZ2V0LFwiYWxsXCIpfX1dKSYmbW4obi5wcm90b3R5cGUsciksdH0oKTt5bi5JbnRlcmFjdGFibGU9eG47dmFyIHduPXt9O2Z1bmN0aW9uIF9uKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBQbih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHduLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHduLkludGVyYWN0YWJsZVNldD12b2lkIDA7dmFyIE9uPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXt2YXIgbj10aGlzOyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksUG4odGhpcyxcImxpc3RcIixbXSksUG4odGhpcyxcInNlbGVjdG9yTWFwXCIse30pLFBuKHRoaXMsXCJzY29wZVwiLHZvaWQgMCksdGhpcy5zY29wZT1lLGUuYWRkTGlzdGVuZXJzKHtcImludGVyYWN0YWJsZTp1bnNldFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RhYmxlLHI9ZS50YXJnZXQsbz1lLl9jb250ZXh0LGE9aS5kZWZhdWx0LnN0cmluZyhyKT9uLnNlbGVjdG9yTWFwW3JdOnJbbi5zY29wZS5pZF0scz1aLmZpbmRJbmRleChhLChmdW5jdGlvbih0KXtyZXR1cm4gdC5jb250ZXh0PT09b30pKTthW3NdJiYoYVtzXS5jb250ZXh0PW51bGwsYVtzXS5pbnRlcmFjdGFibGU9bnVsbCksYS5zcGxpY2UocywxKX19KX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJuZXdcIix2YWx1ZTpmdW5jdGlvbih0LGUpe2U9KDAsai5kZWZhdWx0KShlfHx7fSx7YWN0aW9uczp0aGlzLnNjb3BlLmFjdGlvbnN9KTt2YXIgbj1uZXcgdGhpcy5zY29wZS5JbnRlcmFjdGFibGUodCxlLHRoaXMuc2NvcGUuZG9jdW1lbnQsdGhpcy5zY29wZS5ldmVudHMpLHI9e2NvbnRleHQ6bi5fY29udGV4dCxpbnRlcmFjdGFibGU6bn07cmV0dXJuIHRoaXMuc2NvcGUuYWRkRG9jdW1lbnQobi5fZG9jKSx0aGlzLmxpc3QucHVzaChuKSxpLmRlZmF1bHQuc3RyaW5nKHQpPyh0aGlzLnNlbGVjdG9yTWFwW3RdfHwodGhpcy5zZWxlY3Rvck1hcFt0XT1bXSksdGhpcy5zZWxlY3Rvck1hcFt0XS5wdXNoKHIpKToobi50YXJnZXRbdGhpcy5zY29wZS5pZF18fE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHRoaXMuc2NvcGUuaWQse3ZhbHVlOltdLGNvbmZpZ3VyYWJsZTohMH0pLHRbdGhpcy5zY29wZS5pZF0ucHVzaChyKSksdGhpcy5zY29wZS5maXJlKFwiaW50ZXJhY3RhYmxlOm5ld1wiLHt0YXJnZXQ6dCxvcHRpb25zOmUsaW50ZXJhY3RhYmxlOm4sd2luOnRoaXMuc2NvcGUuX3dpbn0pLG59fSx7a2V5OlwiZ2V0XCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj1lJiZlLmNvbnRleHR8fHRoaXMuc2NvcGUuZG9jdW1lbnQscj1pLmRlZmF1bHQuc3RyaW5nKHQpLG89cj90aGlzLnNlbGVjdG9yTWFwW3RdOnRbdGhpcy5zY29wZS5pZF07aWYoIW8pcmV0dXJuIG51bGw7dmFyIGE9Wi5maW5kKG8sKGZ1bmN0aW9uKGUpe3JldHVybiBlLmNvbnRleHQ9PT1uJiYocnx8ZS5pbnRlcmFjdGFibGUuaW5Db250ZXh0KHQpKX0pKTtyZXR1cm4gYSYmYS5pbnRlcmFjdGFibGV9fSx7a2V5OlwiZm9yRWFjaE1hdGNoXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49MDtuPHRoaXMubGlzdC5sZW5ndGg7bisrKXt2YXIgcj10aGlzLmxpc3Rbbl0sbz12b2lkIDA7aWYoKGkuZGVmYXVsdC5zdHJpbmcoci50YXJnZXQpP2kuZGVmYXVsdC5lbGVtZW50KHQpJiZfLm1hdGNoZXNTZWxlY3Rvcih0LHIudGFyZ2V0KTp0PT09ci50YXJnZXQpJiZyLmluQ29udGV4dCh0KSYmKG89ZShyKSksdm9pZCAwIT09bylyZXR1cm4gb319fV0pJiZfbihlLnByb3RvdHlwZSxuKSx0fSgpO3duLkludGVyYWN0YWJsZVNldD1Pbjt2YXIgU249e307ZnVuY3Rpb24gRW4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIFRuKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1mdW5jdGlvbiBNbih0LGUpe3JldHVybiBmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0fSh0KXx8ZnVuY3Rpb24odCxlKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXt2YXIgbj1bXSxyPSEwLG89ITEsaT12b2lkIDA7dHJ5e2Zvcih2YXIgYSxzPXRbU3ltYm9sLml0ZXJhdG9yXSgpOyEocj0oYT1zLm5leHQoKSkuZG9uZSkmJihuLnB1c2goYS52YWx1ZSksIWV8fG4ubGVuZ3RoIT09ZSk7cj0hMCk7fWNhdGNoKHQpe289ITAsaT10fWZpbmFsbHl7dHJ5e3J8fG51bGw9PXMucmV0dXJufHxzLnJldHVybigpfWZpbmFsbHl7aWYobyl0aHJvdyBpfX1yZXR1cm4gbn19KHQsZSl8fGZ1bmN0aW9uKHQsZSl7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIGpuKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9qbih0LGUpOnZvaWQgMH19KHQsZSl8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX0oKX1mdW5jdGlvbiBqbih0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9T2JqZWN0LmRlZmluZVByb3BlcnR5KFNuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFNuLmRlZmF1bHQ9dm9pZCAwO3ZhciBrbj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxUbih0aGlzLFwiY3VycmVudFRhcmdldFwiLHZvaWQgMCksVG4odGhpcyxcIm9yaWdpbmFsRXZlbnRcIix2b2lkIDApLFRuKHRoaXMsXCJ0eXBlXCIsdm9pZCAwKSx0aGlzLm9yaWdpbmFsRXZlbnQ9ZSwoMCxGLmRlZmF1bHQpKHRoaXMsZSl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwicHJldmVudE9yaWdpbmFsRGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCl9fSx7a2V5Olwic3RvcFByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLm9yaWdpbmFsRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9fSx7a2V5Olwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLm9yaWdpbmFsRXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCl9fV0pJiZFbihlLnByb3RvdHlwZSxuKSx0fSgpO2Z1bmN0aW9uIEluKHQpe2lmKCFpLmRlZmF1bHQub2JqZWN0KHQpKXJldHVybntjYXB0dXJlOiEhdCxwYXNzaXZlOiExfTt2YXIgZT0oMCxqLmRlZmF1bHQpKHt9LHQpO3JldHVybiBlLmNhcHR1cmU9ISF0LmNhcHR1cmUsZS5wYXNzaXZlPSEhdC5wYXNzaXZlLGV9dmFyIERuPXtpZDpcImV2ZW50c1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGUsbj1bXSxyPXt9LG89W10sYT17YWRkOnMscmVtb3ZlOmwsYWRkRGVsZWdhdGU6ZnVuY3Rpb24odCxlLG4saSxhKXt2YXIgbD1JbihhKTtpZighcltuXSl7cltuXT1bXTtmb3IodmFyIGY9MDtmPG8ubGVuZ3RoO2YrKyl7dmFyIGQ9b1tmXTtzKGQsbix1KSxzKGQsbixjLCEwKX19dmFyIHA9cltuXSx2PVouZmluZChwLChmdW5jdGlvbihuKXtyZXR1cm4gbi5zZWxlY3Rvcj09PXQmJm4uY29udGV4dD09PWV9KSk7dnx8KHY9e3NlbGVjdG9yOnQsY29udGV4dDplLGxpc3RlbmVyczpbXX0scC5wdXNoKHYpKSx2Lmxpc3RlbmVycy5wdXNoKFtpLGxdKX0scmVtb3ZlRGVsZWdhdGU6ZnVuY3Rpb24odCxlLG4sbyxpKXt2YXIgYSxzPUluKGkpLGY9cltuXSxkPSExO2lmKGYpZm9yKGE9Zi5sZW5ndGgtMTthPj0wO2EtLSl7dmFyIHA9ZlthXTtpZihwLnNlbGVjdG9yPT09dCYmcC5jb250ZXh0PT09ZSl7Zm9yKHZhciB2PXAubGlzdGVuZXJzLGg9di5sZW5ndGgtMTtoPj0wO2gtLSl7dmFyIGc9TW4odltoXSwyKSx5PWdbMF0sbT1nWzFdLGI9bS5jYXB0dXJlLHg9bS5wYXNzaXZlO2lmKHk9PT1vJiZiPT09cy5jYXB0dXJlJiZ4PT09cy5wYXNzaXZlKXt2LnNwbGljZShoLDEpLHYubGVuZ3RofHwoZi5zcGxpY2UoYSwxKSxsKGUsbix1KSxsKGUsbixjLCEwKSksZD0hMDticmVha319aWYoZClicmVha319fSxkZWxlZ2F0ZUxpc3RlbmVyOnUsZGVsZWdhdGVVc2VDYXB0dXJlOmMsZGVsZWdhdGVkRXZlbnRzOnIsZG9jdW1lbnRzOm8sdGFyZ2V0czpuLHN1cHBvcnRzT3B0aW9uczohMSxzdXBwb3J0c1Bhc3NpdmU6ITF9O2Z1bmN0aW9uIHModCxlLHIsbyl7dmFyIGk9SW4obykscz1aLmZpbmQobiwoZnVuY3Rpb24oZSl7cmV0dXJuIGUuZXZlbnRUYXJnZXQ9PT10fSkpO3N8fChzPXtldmVudFRhcmdldDp0LGV2ZW50czp7fX0sbi5wdXNoKHMpKSxzLmV2ZW50c1tlXXx8KHMuZXZlbnRzW2VdPVtdKSx0LmFkZEV2ZW50TGlzdGVuZXImJiFaLmNvbnRhaW5zKHMuZXZlbnRzW2VdLHIpJiYodC5hZGRFdmVudExpc3RlbmVyKGUscixhLnN1cHBvcnRzT3B0aW9ucz9pOmkuY2FwdHVyZSkscy5ldmVudHNbZV0ucHVzaChyKSl9ZnVuY3Rpb24gbCh0LGUscixvKXt2YXIgaT1JbihvKSxzPVouZmluZEluZGV4KG4sKGZ1bmN0aW9uKGUpe3JldHVybiBlLmV2ZW50VGFyZ2V0PT09dH0pKSx1PW5bc107aWYodSYmdS5ldmVudHMpaWYoXCJhbGxcIiE9PWUpe3ZhciBjPSExLGY9dS5ldmVudHNbZV07aWYoZil7aWYoXCJhbGxcIj09PXIpe2Zvcih2YXIgZD1mLmxlbmd0aC0xO2Q+PTA7ZC0tKWwodCxlLGZbZF0saSk7cmV0dXJufWZvcih2YXIgcD0wO3A8Zi5sZW5ndGg7cCsrKWlmKGZbcF09PT1yKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZSxyLGEuc3VwcG9ydHNPcHRpb25zP2k6aS5jYXB0dXJlKSxmLnNwbGljZShwLDEpLDA9PT1mLmxlbmd0aCYmKGRlbGV0ZSB1LmV2ZW50c1tlXSxjPSEwKTticmVha319YyYmIU9iamVjdC5rZXlzKHUuZXZlbnRzKS5sZW5ndGgmJm4uc3BsaWNlKHMsMSl9ZWxzZSBmb3IoZSBpbiB1LmV2ZW50cyl1LmV2ZW50cy5oYXNPd25Qcm9wZXJ0eShlKSYmbCh0LGUsXCJhbGxcIil9ZnVuY3Rpb24gdSh0LGUpe2Zvcih2YXIgbj1JbihlKSxvPW5ldyBrbih0KSxhPXJbdC50eXBlXSxzPU1uKEIuZ2V0RXZlbnRUYXJnZXRzKHQpLDEpWzBdLGw9cztpLmRlZmF1bHQuZWxlbWVudChsKTspe2Zvcih2YXIgdT0wO3U8YS5sZW5ndGg7dSsrKXt2YXIgYz1hW3VdLGY9Yy5zZWxlY3RvcixkPWMuY29udGV4dDtpZihfLm1hdGNoZXNTZWxlY3RvcihsLGYpJiZfLm5vZGVDb250YWlucyhkLHMpJiZfLm5vZGVDb250YWlucyhkLGwpKXt2YXIgcD1jLmxpc3RlbmVycztvLmN1cnJlbnRUYXJnZXQ9bDtmb3IodmFyIHY9MDt2PHAubGVuZ3RoO3YrKyl7dmFyIGg9TW4ocFt2XSwyKSxnPWhbMF0seT1oWzFdLG09eS5jYXB0dXJlLGI9eS5wYXNzaXZlO209PT1uLmNhcHR1cmUmJmI9PT1uLnBhc3NpdmUmJmcobyl9fX1sPV8ucGFyZW50Tm9kZShsKX19ZnVuY3Rpb24gYyh0KXtyZXR1cm4gdSh0LCEwKX1yZXR1cm4gbnVsbD09KGU9dC5kb2N1bWVudCl8fGUuY3JlYXRlRWxlbWVudChcImRpdlwiKS5hZGRFdmVudExpc3RlbmVyKFwidGVzdFwiLG51bGwse2dldCBjYXB0dXJlKCl7cmV0dXJuIGEuc3VwcG9ydHNPcHRpb25zPSEwfSxnZXQgcGFzc2l2ZSgpe3JldHVybiBhLnN1cHBvcnRzUGFzc2l2ZT0hMH19KSx0LmV2ZW50cz1hLGF9fTtTbi5kZWZhdWx0PURuO3ZhciBBbj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoQW4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQW4uZGVmYXVsdD12b2lkIDA7dmFyIFJuPXttZXRob2RPcmRlcjpbXCJzaW11bGF0aW9uUmVzdW1lXCIsXCJtb3VzZU9yUGVuXCIsXCJoYXNQb2ludGVyXCIsXCJpZGxlXCJdLHNlYXJjaDpmdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPFJuLm1ldGhvZE9yZGVyLmxlbmd0aDtlKyspe3ZhciBuO249Um4ubWV0aG9kT3JkZXJbZV07dmFyIHI9Um5bbl0odCk7aWYocilyZXR1cm4gcn1yZXR1cm4gbnVsbH0sc2ltdWxhdGlvblJlc3VtZTpmdW5jdGlvbih0KXt2YXIgZT10LnBvaW50ZXJUeXBlLG49dC5ldmVudFR5cGUscj10LmV2ZW50VGFyZ2V0LG89dC5zY29wZTtpZighL2Rvd258c3RhcnQvaS50ZXN0KG4pKXJldHVybiBudWxsO2Zvcih2YXIgaT0wO2k8by5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7aSsrKXt2YXIgYT1vLmludGVyYWN0aW9ucy5saXN0W2ldLHM9cjtpZihhLnNpbXVsYXRpb24mJmEuc2ltdWxhdGlvbi5hbGxvd1Jlc3VtZSYmYS5wb2ludGVyVHlwZT09PWUpZm9yKDtzOyl7aWYocz09PWEuZWxlbWVudClyZXR1cm4gYTtzPV8ucGFyZW50Tm9kZShzKX19cmV0dXJuIG51bGx9LG1vdXNlT3JQZW46ZnVuY3Rpb24odCl7dmFyIGUsbj10LnBvaW50ZXJJZCxyPXQucG9pbnRlclR5cGUsbz10LmV2ZW50VHlwZSxpPXQuc2NvcGU7aWYoXCJtb3VzZVwiIT09ciYmXCJwZW5cIiE9PXIpcmV0dXJuIG51bGw7Zm9yKHZhciBhPTA7YTxpLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDthKyspe3ZhciBzPWkuaW50ZXJhY3Rpb25zLmxpc3RbYV07aWYocy5wb2ludGVyVHlwZT09PXIpe2lmKHMuc2ltdWxhdGlvbiYmIXpuKHMsbikpY29udGludWU7aWYocy5pbnRlcmFjdGluZygpKXJldHVybiBzO2V8fChlPXMpfX1pZihlKXJldHVybiBlO2Zvcih2YXIgbD0wO2w8aS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7bCsrKXt2YXIgdT1pLmludGVyYWN0aW9ucy5saXN0W2xdO2lmKCEodS5wb2ludGVyVHlwZSE9PXJ8fC9kb3duL2kudGVzdChvKSYmdS5zaW11bGF0aW9uKSlyZXR1cm4gdX1yZXR1cm4gbnVsbH0saGFzUG9pbnRlcjpmdW5jdGlvbih0KXtmb3IodmFyIGU9dC5wb2ludGVySWQsbj10LnNjb3BlLHI9MDtyPG4uaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO3IrKyl7dmFyIG89bi5pbnRlcmFjdGlvbnMubGlzdFtyXTtpZih6bihvLGUpKXJldHVybiBvfXJldHVybiBudWxsfSxpZGxlOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT10LnBvaW50ZXJUeXBlLG49dC5zY29wZSxyPTA7cjxuLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtyKyspe3ZhciBvPW4uaW50ZXJhY3Rpb25zLmxpc3Rbcl07aWYoMT09PW8ucG9pbnRlcnMubGVuZ3RoKXt2YXIgaT1vLmludGVyYWN0YWJsZTtpZihpJiYoIWkub3B0aW9ucy5nZXN0dXJlfHwhaS5vcHRpb25zLmdlc3R1cmUuZW5hYmxlZCkpY29udGludWV9ZWxzZSBpZihvLnBvaW50ZXJzLmxlbmd0aD49Miljb250aW51ZTtpZighby5pbnRlcmFjdGluZygpJiZlPT09by5wb2ludGVyVHlwZSlyZXR1cm4gb31yZXR1cm4gbnVsbH19O2Z1bmN0aW9uIHpuKHQsZSl7cmV0dXJuIHQucG9pbnRlcnMuc29tZSgoZnVuY3Rpb24odCl7cmV0dXJuIHQuaWQ9PT1lfSkpfXZhciBDbj1SbjtBbi5kZWZhdWx0PUNuO3ZhciBGbj17fTtmdW5jdGlvbiBYbih0KXtyZXR1cm4oWG49XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIFluKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KHQpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0odCxlKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gQm4odCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP0JuKHQsZSk6dm9pZCAwfX0odCxlKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpfWZ1bmN0aW9uIEJuKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1mdW5jdGlvbiBXbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gTG4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIFVuKHQsZSl7cmV0dXJuKFVuPU9iamVjdC5zZXRQcm90b3R5cGVPZnx8ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5fX3Byb3RvX189ZSx0fSkodCxlKX1mdW5jdGlvbiBWbih0LGUpe3JldHVybiFlfHxcIm9iamVjdFwiIT09WG4oZSkmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGU/ZnVuY3Rpb24odCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9KHQpOmV9ZnVuY3Rpb24gTm4odCl7cmV0dXJuKE5uPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1PYmplY3QuZGVmaW5lUHJvcGVydHkoRm4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksRm4uZGVmYXVsdD12b2lkIDA7dmFyIHFuPVtcInBvaW50ZXJEb3duXCIsXCJwb2ludGVyTW92ZVwiLFwicG9pbnRlclVwXCIsXCJ1cGRhdGVQb2ludGVyXCIsXCJyZW1vdmVQb2ludGVyXCIsXCJ3aW5kb3dCbHVyXCJdO2Z1bmN0aW9uICRuKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKG4pe3ZhciByPWUuaW50ZXJhY3Rpb25zLmxpc3Qsbz1CLmdldFBvaW50ZXJUeXBlKG4pLGk9WW4oQi5nZXRFdmVudFRhcmdldHMobiksMiksYT1pWzBdLHM9aVsxXSxsPVtdO2lmKC9edG91Y2gvLnRlc3Qobi50eXBlKSl7ZS5wcmV2VG91Y2hUaW1lPWUubm93KCk7Zm9yKHZhciB1PTA7dTxuLmNoYW5nZWRUb3VjaGVzLmxlbmd0aDt1Kyspe3ZhciBjPW4uY2hhbmdlZFRvdWNoZXNbdV0sZj17cG9pbnRlcjpjLHBvaW50ZXJJZDpCLmdldFBvaW50ZXJJZChjKSxwb2ludGVyVHlwZTpvLGV2ZW50VHlwZTpuLnR5cGUsZXZlbnRUYXJnZXQ6YSxjdXJFdmVudFRhcmdldDpzLHNjb3BlOmV9LGQ9R24oZik7bC5wdXNoKFtmLnBvaW50ZXIsZi5ldmVudFRhcmdldCxmLmN1ckV2ZW50VGFyZ2V0LGRdKX19ZWxzZXt2YXIgcD0hMTtpZighYi5kZWZhdWx0LnN1cHBvcnRzUG9pbnRlckV2ZW50JiYvbW91c2UvLnRlc3Qobi50eXBlKSl7Zm9yKHZhciB2PTA7djxyLmxlbmd0aCYmIXA7disrKXA9XCJtb3VzZVwiIT09clt2XS5wb2ludGVyVHlwZSYmclt2XS5wb2ludGVySXNEb3duO3A9cHx8ZS5ub3coKS1lLnByZXZUb3VjaFRpbWU8NTAwfHwwPT09bi50aW1lU3RhbXB9aWYoIXApe3ZhciBoPXtwb2ludGVyOm4scG9pbnRlcklkOkIuZ2V0UG9pbnRlcklkKG4pLHBvaW50ZXJUeXBlOm8sZXZlbnRUeXBlOm4udHlwZSxjdXJFdmVudFRhcmdldDpzLGV2ZW50VGFyZ2V0OmEsc2NvcGU6ZX0sZz1HbihoKTtsLnB1c2goW2gucG9pbnRlcixoLmV2ZW50VGFyZ2V0LGguY3VyRXZlbnRUYXJnZXQsZ10pfX1mb3IodmFyIHk9MDt5PGwubGVuZ3RoO3krKyl7dmFyIG09WW4obFt5XSw0KSx4PW1bMF0sdz1tWzFdLF89bVsyXTttWzNdW3RdKHgsbix3LF8pfX19ZnVuY3Rpb24gR24odCl7dmFyIGU9dC5wb2ludGVyVHlwZSxuPXQuc2NvcGUscj17aW50ZXJhY3Rpb246QW4uZGVmYXVsdC5zZWFyY2godCksc2VhcmNoRGV0YWlsczp0fTtyZXR1cm4gbi5maXJlKFwiaW50ZXJhY3Rpb25zOmZpbmRcIixyKSxyLmludGVyYWN0aW9ufHxuLmludGVyYWN0aW9ucy5uZXcoe3BvaW50ZXJUeXBlOmV9KX1mdW5jdGlvbiBIbih0LGUpe3ZhciBuPXQuZG9jLHI9dC5zY29wZSxvPXQub3B0aW9ucyxpPXIuaW50ZXJhY3Rpb25zLmRvY0V2ZW50cyxhPXIuZXZlbnRzLHM9YVtlXTtmb3IodmFyIGwgaW4gci5icm93c2VyLmlzSU9TJiYhby5ldmVudHMmJihvLmV2ZW50cz17cGFzc2l2ZTohMX0pLGEuZGVsZWdhdGVkRXZlbnRzKXMobixsLGEuZGVsZWdhdGVMaXN0ZW5lcikscyhuLGwsYS5kZWxlZ2F0ZVVzZUNhcHR1cmUsITApO2Zvcih2YXIgdT1vJiZvLmV2ZW50cyxjPTA7YzxpLmxlbmd0aDtjKyspe3ZhciBmPWlbY107cyhuLGYudHlwZSxmLmxpc3RlbmVyLHUpfX12YXIgS249e2lkOlwiY29yZS9pbnRlcmFjdGlvbnNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT17fSxuPTA7bjxxbi5sZW5ndGg7bisrKXt2YXIgcj1xbltuXTtlW3JdPSRuKHIsdCl9dmFyIG8saT1iLmRlZmF1bHQucEV2ZW50VHlwZXM7ZnVuY3Rpb24gYSgpe2Zvcih2YXIgZT0wO2U8dC5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7ZSsrKXt2YXIgbj10LmludGVyYWN0aW9ucy5saXN0W2VdO2lmKG4ucG9pbnRlcklzRG93biYmXCJ0b3VjaFwiPT09bi5wb2ludGVyVHlwZSYmIW4uX2ludGVyYWN0aW5nKWZvcih2YXIgcj1mdW5jdGlvbigpe3ZhciBlPW4ucG9pbnRlcnNbb107dC5kb2N1bWVudHMuc29tZSgoZnVuY3Rpb24odCl7dmFyIG49dC5kb2M7cmV0dXJuKDAsXy5ub2RlQ29udGFpbnMpKG4sZS5kb3duVGFyZ2V0KX0pKXx8bi5yZW1vdmVQb2ludGVyKGUucG9pbnRlcixlLmV2ZW50KX0sbz0wO288bi5wb2ludGVycy5sZW5ndGg7bysrKXIoKX19KG89aC5kZWZhdWx0LlBvaW50ZXJFdmVudD9be3R5cGU6aS5kb3duLGxpc3RlbmVyOmF9LHt0eXBlOmkuZG93bixsaXN0ZW5lcjplLnBvaW50ZXJEb3dufSx7dHlwZTppLm1vdmUsbGlzdGVuZXI6ZS5wb2ludGVyTW92ZX0se3R5cGU6aS51cCxsaXN0ZW5lcjplLnBvaW50ZXJVcH0se3R5cGU6aS5jYW5jZWwsbGlzdGVuZXI6ZS5wb2ludGVyVXB9XTpbe3R5cGU6XCJtb3VzZWRvd25cIixsaXN0ZW5lcjplLnBvaW50ZXJEb3dufSx7dHlwZTpcIm1vdXNlbW92ZVwiLGxpc3RlbmVyOmUucG9pbnRlck1vdmV9LHt0eXBlOlwibW91c2V1cFwiLGxpc3RlbmVyOmUucG9pbnRlclVwfSx7dHlwZTpcInRvdWNoc3RhcnRcIixsaXN0ZW5lcjphfSx7dHlwZTpcInRvdWNoc3RhcnRcIixsaXN0ZW5lcjplLnBvaW50ZXJEb3dufSx7dHlwZTpcInRvdWNobW92ZVwiLGxpc3RlbmVyOmUucG9pbnRlck1vdmV9LHt0eXBlOlwidG91Y2hlbmRcIixsaXN0ZW5lcjplLnBvaW50ZXJVcH0se3R5cGU6XCJ0b3VjaGNhbmNlbFwiLGxpc3RlbmVyOmUucG9pbnRlclVwfV0pLnB1c2goe3R5cGU6XCJibHVyXCIsbGlzdGVuZXI6ZnVuY3Rpb24oZSl7Zm9yKHZhciBuPTA7bjx0LmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtuKyspdC5pbnRlcmFjdGlvbnMubGlzdFtuXS5kb2N1bWVudEJsdXIoZSl9fSksdC5wcmV2VG91Y2hUaW1lPTAsdC5JbnRlcmFjdGlvbj1mdW5jdGlvbihlKXshZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7dC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLGUmJlVuKHQsZSl9KHMsZSk7dmFyIG4scixvLGksYT0obz1zLGk9ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LGU9Tm4obyk7aWYoaSl7dmFyIG49Tm4odGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChlLGFyZ3VtZW50cyxuKX1lbHNlIHQ9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIFZuKHRoaXMsdCl9KTtmdW5jdGlvbiBzKCl7cmV0dXJuIFduKHRoaXMscyksYS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIG49cywocj1be2tleTpcInBvaW50ZXJNb3ZlVG9sZXJhbmNlXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHQuaW50ZXJhY3Rpb25zLnBvaW50ZXJNb3ZlVG9sZXJhbmNlfSxzZXQ6ZnVuY3Rpb24oZSl7dC5pbnRlcmFjdGlvbnMucG9pbnRlck1vdmVUb2xlcmFuY2U9ZX19LHtrZXk6XCJfbm93XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdC5ub3coKX19XSkmJkxuKG4ucHJvdG90eXBlLHIpLHN9KExlLmRlZmF1bHQpLHQuaW50ZXJhY3Rpb25zPXtsaXN0OltdLG5ldzpmdW5jdGlvbihlKXtlLnNjb3BlRmlyZT1mdW5jdGlvbihlLG4pe3JldHVybiB0LmZpcmUoZSxuKX07dmFyIG49bmV3IHQuSW50ZXJhY3Rpb24oZSk7cmV0dXJuIHQuaW50ZXJhY3Rpb25zLmxpc3QucHVzaChuKSxufSxsaXN0ZW5lcnM6ZSxkb2NFdmVudHM6byxwb2ludGVyTW92ZVRvbGVyYW5jZToxfSx0LnVzZVBsdWdpbihzZS5kZWZhdWx0KX0sbGlzdGVuZXJzOntcInNjb3BlOmFkZC1kb2N1bWVudFwiOmZ1bmN0aW9uKHQpe3JldHVybiBIbih0LFwiYWRkXCIpfSxcInNjb3BlOnJlbW92ZS1kb2N1bWVudFwiOmZ1bmN0aW9uKHQpe3JldHVybiBIbih0LFwicmVtb3ZlXCIpfSxcImludGVyYWN0YWJsZTp1bnNldFwiOmZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPXQuaW50ZXJhY3RhYmxlLHI9ZS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGgtMTtyPj0wO3ItLSl7dmFyIG89ZS5pbnRlcmFjdGlvbnMubGlzdFtyXTtvLmludGVyYWN0YWJsZT09PW4mJihvLnN0b3AoKSxlLmZpcmUoXCJpbnRlcmFjdGlvbnM6ZGVzdHJveVwiLHtpbnRlcmFjdGlvbjpvfSksby5kZXN0cm95KCksZS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg+MiYmZS5pbnRlcmFjdGlvbnMubGlzdC5zcGxpY2UociwxKSl9fX0sb25Eb2NTaWduYWw6SG4sZG9PbkludGVyYWN0aW9uczokbixtZXRob2ROYW1lczpxbn07Rm4uZGVmYXVsdD1Lbjt2YXIgWm49e307ZnVuY3Rpb24gSm4odCl7cmV0dXJuKEpuPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBRbih0LGUsbil7cmV0dXJuKFFuPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBSZWZsZWN0JiZSZWZsZWN0LmdldD9SZWZsZWN0LmdldDpmdW5jdGlvbih0LGUsbil7dmFyIHI9ZnVuY3Rpb24odCxlKXtmb3IoOyFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodCxlKSYmbnVsbCE9PSh0PW5yKHQpKTspO3JldHVybiB0fSh0LGUpO2lmKHIpe3ZhciBvPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocixlKTtyZXR1cm4gby5nZXQ/by5nZXQuY2FsbChuKTpvLnZhbHVlfX0pKHQsZSxufHx0KX1mdW5jdGlvbiB0cih0LGUpe3JldHVybih0cj1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gZXIodCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PUpuKGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP2Z1bmN0aW9uKHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fSh0KTplfWZ1bmN0aW9uIG5yKHQpe3JldHVybihucj1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9ZnVuY3Rpb24gcnIodCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfWZ1bmN0aW9uIG9yKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBpcih0LGUsbil7cmV0dXJuIGUmJm9yKHQucHJvdG90eXBlLGUpLG4mJm9yKHQsbiksdH1mdW5jdGlvbiBhcih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KFpuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFpuLmluaXRTY29wZT1scixabi5TY29wZT12b2lkIDA7dmFyIHNyPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe3ZhciBlPXRoaXM7cnIodGhpcyx0KSxhcih0aGlzLFwiaWRcIixcIl9faW50ZXJhY3Rfc2NvcGVfXCIuY29uY2F0KE1hdGguZmxvb3IoMTAwKk1hdGgucmFuZG9tKCkpKSksYXIodGhpcyxcImlzSW5pdGlhbGl6ZWRcIiwhMSksYXIodGhpcyxcImxpc3RlbmVyTWFwc1wiLFtdKSxhcih0aGlzLFwiYnJvd3NlclwiLGIuZGVmYXVsdCksYXIodGhpcyxcImRlZmF1bHRzXCIsKDAsZ2UuZGVmYXVsdCkoTWUuZGVmYXVsdHMpKSxhcih0aGlzLFwiRXZlbnRhYmxlXCIsY24uRXZlbnRhYmxlKSxhcih0aGlzLFwiYWN0aW9uc1wiLHttYXA6e30scGhhc2VzOntzdGFydDohMCxtb3ZlOiEwLGVuZDohMH0sbWV0aG9kRGljdDp7fSxwaGFzZWxlc3NUeXBlczp7fX0pLGFyKHRoaXMsXCJpbnRlcmFjdFN0YXRpY1wiLCgwLGduLmNyZWF0ZUludGVyYWN0U3RhdGljKSh0aGlzKSksYXIodGhpcyxcIkludGVyYWN0RXZlbnRcIixqZS5JbnRlcmFjdEV2ZW50KSxhcih0aGlzLFwiSW50ZXJhY3RhYmxlXCIsdm9pZCAwKSxhcih0aGlzLFwiaW50ZXJhY3RhYmxlc1wiLG5ldyB3bi5JbnRlcmFjdGFibGVTZXQodGhpcykpLGFyKHRoaXMsXCJfd2luXCIsdm9pZCAwKSxhcih0aGlzLFwiZG9jdW1lbnRcIix2b2lkIDApLGFyKHRoaXMsXCJ3aW5kb3dcIix2b2lkIDApLGFyKHRoaXMsXCJkb2N1bWVudHNcIixbXSksYXIodGhpcyxcIl9wbHVnaW5zXCIse2xpc3Q6W10sbWFwOnt9fSksYXIodGhpcyxcIm9uV2luZG93VW5sb2FkXCIsKGZ1bmN0aW9uKHQpe3JldHVybiBlLnJlbW92ZURvY3VtZW50KHQudGFyZ2V0KX0pKTt2YXIgbj10aGlzO3RoaXMuSW50ZXJhY3RhYmxlPWZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmdHIodCxlKX0oaSx0KTt2YXIgZSxyLG89KGU9aSxyPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sKGZ1bmN0aW9uKCl7fSkpKSwhMH1jYXRjaCh0KXtyZXR1cm4hMX19KCksZnVuY3Rpb24oKXt2YXIgdCxuPW5yKGUpO2lmKHIpe3ZhciBvPW5yKHRoaXMpLmNvbnN0cnVjdG9yO3Q9UmVmbGVjdC5jb25zdHJ1Y3Qobixhcmd1bWVudHMsbyl9ZWxzZSB0PW4uYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBlcih0aGlzLHQpfSk7ZnVuY3Rpb24gaSgpe3JldHVybiBycih0aGlzLGkpLG8uYXBwbHkodGhpcyxhcmd1bWVudHMpfXJldHVybiBpcihpLFt7a2V5OlwiX2RlZmF1bHRzXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIG4uZGVmYXVsdHN9fSx7a2V5Olwic2V0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIFFuKG5yKGkucHJvdG90eXBlKSxcInNldFwiLHRoaXMpLmNhbGwodGhpcyx0KSxuLmZpcmUoXCJpbnRlcmFjdGFibGU6c2V0XCIse29wdGlvbnM6dCxpbnRlcmFjdGFibGU6dGhpc30pLHRoaXN9fSx7a2V5OlwidW5zZXRcIix2YWx1ZTpmdW5jdGlvbigpe1FuKG5yKGkucHJvdG90eXBlKSxcInVuc2V0XCIsdGhpcykuY2FsbCh0aGlzKSxuLmludGVyYWN0YWJsZXMubGlzdC5zcGxpY2Uobi5pbnRlcmFjdGFibGVzLmxpc3QuaW5kZXhPZih0aGlzKSwxKSxuLmZpcmUoXCJpbnRlcmFjdGFibGU6dW5zZXRcIix7aW50ZXJhY3RhYmxlOnRoaXN9KX19XSksaX0oeW4uSW50ZXJhY3RhYmxlKX1yZXR1cm4gaXIodCxbe2tleTpcImFkZExpc3RlbmVyc1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dGhpcy5saXN0ZW5lck1hcHMucHVzaCh7aWQ6ZSxtYXA6dH0pfX0se2tleTpcImZpcmVcIix2YWx1ZTpmdW5jdGlvbih0LGUpe2Zvcih2YXIgbj0wO248dGhpcy5saXN0ZW5lck1hcHMubGVuZ3RoO24rKyl7dmFyIHI9dGhpcy5saXN0ZW5lck1hcHNbbl0ubWFwW3RdO2lmKHImJiExPT09cihlLHRoaXMsdCkpcmV0dXJuITF9fX0se2tleTpcImluaXRcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5pc0luaXRpYWxpemVkP3RoaXM6bHIodGhpcyx0KX19LHtrZXk6XCJwbHVnaW5Jc0luc3RhbGxlZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9wbHVnaW5zLm1hcFt0LmlkXXx8LTEhPT10aGlzLl9wbHVnaW5zLmxpc3QuaW5kZXhPZih0KX19LHtrZXk6XCJ1c2VQbHVnaW5cIix2YWx1ZTpmdW5jdGlvbih0LGUpe2lmKCF0aGlzLmlzSW5pdGlhbGl6ZWQpcmV0dXJuIHRoaXM7aWYodGhpcy5wbHVnaW5Jc0luc3RhbGxlZCh0KSlyZXR1cm4gdGhpcztpZih0LmlkJiYodGhpcy5fcGx1Z2lucy5tYXBbdC5pZF09dCksdGhpcy5fcGx1Z2lucy5saXN0LnB1c2godCksdC5pbnN0YWxsJiZ0Lmluc3RhbGwodGhpcyxlKSx0Lmxpc3RlbmVycyYmdC5iZWZvcmUpe2Zvcih2YXIgbj0wLHI9dGhpcy5saXN0ZW5lck1hcHMubGVuZ3RoLG89dC5iZWZvcmUucmVkdWNlKChmdW5jdGlvbih0LGUpe3JldHVybiB0W2VdPSEwLHRbdXIoZSldPSEwLHR9KSx7fSk7bjxyO24rKyl7dmFyIGk9dGhpcy5saXN0ZW5lck1hcHNbbl0uaWQ7aWYob1tpXXx8b1t1cihpKV0pYnJlYWt9dGhpcy5saXN0ZW5lck1hcHMuc3BsaWNlKG4sMCx7aWQ6dC5pZCxtYXA6dC5saXN0ZW5lcnN9KX1lbHNlIHQubGlzdGVuZXJzJiZ0aGlzLmxpc3RlbmVyTWFwcy5wdXNoKHtpZDp0LmlkLG1hcDp0Lmxpc3RlbmVyc30pO3JldHVybiB0aGlzfX0se2tleTpcImFkZERvY3VtZW50XCIsdmFsdWU6ZnVuY3Rpb24odCxuKXtpZigtMSE9PXRoaXMuZ2V0RG9jSW5kZXgodCkpcmV0dXJuITE7dmFyIHI9ZS5nZXRXaW5kb3codCk7bj1uPygwLGouZGVmYXVsdCkoe30sbik6e30sdGhpcy5kb2N1bWVudHMucHVzaCh7ZG9jOnQsb3B0aW9uczpufSksdGhpcy5ldmVudHMuZG9jdW1lbnRzLnB1c2godCksdCE9PXRoaXMuZG9jdW1lbnQmJnRoaXMuZXZlbnRzLmFkZChyLFwidW5sb2FkXCIsdGhpcy5vbldpbmRvd1VubG9hZCksdGhpcy5maXJlKFwic2NvcGU6YWRkLWRvY3VtZW50XCIse2RvYzp0LHdpbmRvdzpyLHNjb3BlOnRoaXMsb3B0aW9uczpufSl9fSx7a2V5OlwicmVtb3ZlRG9jdW1lbnRcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgbj10aGlzLmdldERvY0luZGV4KHQpLHI9ZS5nZXRXaW5kb3codCksbz10aGlzLmRvY3VtZW50c1tuXS5vcHRpb25zO3RoaXMuZXZlbnRzLnJlbW92ZShyLFwidW5sb2FkXCIsdGhpcy5vbldpbmRvd1VubG9hZCksdGhpcy5kb2N1bWVudHMuc3BsaWNlKG4sMSksdGhpcy5ldmVudHMuZG9jdW1lbnRzLnNwbGljZShuLDEpLHRoaXMuZmlyZShcInNjb3BlOnJlbW92ZS1kb2N1bWVudFwiLHtkb2M6dCx3aW5kb3c6cixzY29wZTp0aGlzLG9wdGlvbnM6b30pfX0se2tleTpcImdldERvY0luZGV4XCIsdmFsdWU6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0aGlzLmRvY3VtZW50cy5sZW5ndGg7ZSsrKWlmKHRoaXMuZG9jdW1lbnRzW2VdLmRvYz09PXQpcmV0dXJuIGU7cmV0dXJuLTF9fSx7a2V5OlwiZ2V0RG9jT3B0aW9uc1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0RG9jSW5kZXgodCk7cmV0dXJuLTE9PT1lP251bGw6dGhpcy5kb2N1bWVudHNbZV0ub3B0aW9uc319LHtrZXk6XCJub3dcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybih0aGlzLndpbmRvdy5EYXRlfHxEYXRlKS5ub3coKX19XSksdH0oKTtmdW5jdGlvbiBscih0LG4pe3JldHVybiB0LmlzSW5pdGlhbGl6ZWQ9ITAsaS5kZWZhdWx0LndpbmRvdyhuKSYmZS5pbml0KG4pLGguZGVmYXVsdC5pbml0KG4pLGIuZGVmYXVsdC5pbml0KG4pLGp0LmRlZmF1bHQuaW5pdChuKSx0LndpbmRvdz1uLHQuZG9jdW1lbnQ9bi5kb2N1bWVudCx0LnVzZVBsdWdpbihGbi5kZWZhdWx0KSx0LnVzZVBsdWdpbihTbi5kZWZhdWx0KSx0fWZ1bmN0aW9uIHVyKHQpe3JldHVybiB0JiZ0LnJlcGxhY2UoL1xcLy4qJC8sXCJcIil9Wm4uU2NvcGU9c3I7dmFyIGNyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShjcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxjci5kZWZhdWx0PXZvaWQgMDt2YXIgZnI9bmV3IFpuLlNjb3BlLGRyPWZyLmludGVyYWN0U3RhdGljO2NyLmRlZmF1bHQ9ZHI7dmFyIHByPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWxUaGlzP2dsb2JhbFRoaXM6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dm9pZCAwO2ZyLmluaXQocHIpO3ZhciB2cj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodnIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdnIuZGVmYXVsdD12b2lkIDAsdnIuZGVmYXVsdD1mdW5jdGlvbigpe307dmFyIGhyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShocixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxoci5kZWZhdWx0PXZvaWQgMCxoci5kZWZhdWx0PWZ1bmN0aW9uKCl7fTt2YXIgZ3I9e307ZnVuY3Rpb24geXIodCxlKXtyZXR1cm4gZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0odCl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fSh0LGUpfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBtcih0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/bXIodCxlKTp2b2lkIDB9fSh0LGUpfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCl9ZnVuY3Rpb24gbXIodCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShncixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxnci5kZWZhdWx0PXZvaWQgMCxnci5kZWZhdWx0PWZ1bmN0aW9uKHQpe3ZhciBlPVtbXCJ4XCIsXCJ5XCJdLFtcImxlZnRcIixcInRvcFwiXSxbXCJyaWdodFwiLFwiYm90dG9tXCJdLFtcIndpZHRoXCIsXCJoZWlnaHRcIl1dLmZpbHRlcigoZnVuY3Rpb24oZSl7dmFyIG49eXIoZSwyKSxyPW5bMF0sbz1uWzFdO3JldHVybiByIGluIHR8fG8gaW4gdH0pKSxuPWZ1bmN0aW9uKG4scil7Zm9yKHZhciBvPXQucmFuZ2UsaT10LmxpbWl0cyxhPXZvaWQgMD09PWk/e2xlZnQ6LTEvMCxyaWdodDoxLzAsdG9wOi0xLzAsYm90dG9tOjEvMH06aSxzPXQub2Zmc2V0LGw9dm9pZCAwPT09cz97eDowLHk6MH06cyx1PXtyYW5nZTpvLGdyaWQ6dCx4Om51bGwseTpudWxsfSxjPTA7YzxlLmxlbmd0aDtjKyspe3ZhciBmPXlyKGVbY10sMiksZD1mWzBdLHA9ZlsxXSx2PU1hdGgucm91bmQoKG4tbC54KS90W2RdKSxoPU1hdGgucm91bmQoKHItbC55KS90W3BdKTt1W2RdPU1hdGgubWF4KGEubGVmdCxNYXRoLm1pbihhLnJpZ2h0LHYqdFtkXStsLngpKSx1W3BdPU1hdGgubWF4KGEudG9wLE1hdGgubWluKGEuYm90dG9tLGgqdFtwXStsLnkpKX1yZXR1cm4gdX07cmV0dXJuIG4uZ3JpZD10LG4uY29vcmRGaWVsZHM9ZSxufTt2YXIgYnI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGJyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicixcImVkZ2VUYXJnZXRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdnIuZGVmYXVsdH19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYnIsXCJlbGVtZW50c1wiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBoci5kZWZhdWx0fX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicixcImdyaWRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gZ3IuZGVmYXVsdH19KTt2YXIgeHI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHhyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHhyLmRlZmF1bHQ9dm9pZCAwO3ZhciB3cj17aWQ6XCJzbmFwcGVyc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdFN0YXRpYztlLnNuYXBwZXJzPSgwLGouZGVmYXVsdCkoZS5zbmFwcGVyc3x8e30sYnIpLGUuY3JlYXRlU25hcEdyaWQ9ZS5zbmFwcGVycy5ncmlkfX07eHIuZGVmYXVsdD13cjt2YXIgX3I9e307ZnVuY3Rpb24gUHIodCxlKXt2YXIgbj1PYmplY3Qua2V5cyh0KTtpZihPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKXt2YXIgcj1PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHQpO2UmJihyPXIuZmlsdGVyKChmdW5jdGlvbihlKXtyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LGUpLmVudW1lcmFibGV9KSkpLG4ucHVzaC5hcHBseShuLHIpfXJldHVybiBufWZ1bmN0aW9uIE9yKHQpe2Zvcih2YXIgZT0xO2U8YXJndW1lbnRzLmxlbmd0aDtlKyspe3ZhciBuPW51bGwhPWFyZ3VtZW50c1tlXT9hcmd1bWVudHNbZV06e307ZSUyP1ByKE9iamVjdChuKSwhMCkuZm9yRWFjaCgoZnVuY3Rpb24oZSl7U3IodCxlLG5bZV0pfSkpOk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzP09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHQsT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMobikpOlByKE9iamVjdChuKSkuZm9yRWFjaCgoZnVuY3Rpb24oZSl7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSxPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG4sZSkpfSkpfXJldHVybiB0fWZ1bmN0aW9uIFNyKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoX3IsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksX3IuYXNwZWN0UmF0aW89X3IuZGVmYXVsdD12b2lkIDA7dmFyIEVyPXtzdGFydDpmdW5jdGlvbih0KXt2YXIgZT10LnN0YXRlLG49dC5yZWN0LHI9dC5lZGdlcyxvPXQucGFnZUNvb3JkcyxpPWUub3B0aW9ucy5yYXRpbyxhPWUub3B0aW9ucyxzPWEuZXF1YWxEZWx0YSxsPWEubW9kaWZpZXJzO1wicHJlc2VydmVcIj09PWkmJihpPW4ud2lkdGgvbi5oZWlnaHQpLGUuc3RhcnRDb29yZHM9KDAsai5kZWZhdWx0KSh7fSxvKSxlLnN0YXJ0UmVjdD0oMCxqLmRlZmF1bHQpKHt9LG4pLGUucmF0aW89aSxlLmVxdWFsRGVsdGE9czt2YXIgdT1lLmxpbmtlZEVkZ2VzPXt0b3A6ci50b3B8fHIubGVmdCYmIXIuYm90dG9tLGxlZnQ6ci5sZWZ0fHxyLnRvcCYmIXIucmlnaHQsYm90dG9tOnIuYm90dG9tfHxyLnJpZ2h0JiYhci50b3AscmlnaHQ6ci5yaWdodHx8ci5ib3R0b20mJiFyLmxlZnR9O2lmKGUueElzUHJpbWFyeUF4aXM9ISghci5sZWZ0JiYhci5yaWdodCksZS5lcXVhbERlbHRhKWUuZWRnZVNpZ249KHUubGVmdD8xOi0xKSoodS50b3A/MTotMSk7ZWxzZXt2YXIgYz1lLnhJc1ByaW1hcnlBeGlzP3UudG9wOnUubGVmdDtlLmVkZ2VTaWduPWM/LTE6MX1pZigoMCxqLmRlZmF1bHQpKHQuZWRnZXMsdSksbCYmbC5sZW5ndGgpe3ZhciBmPW5ldyB5ZS5kZWZhdWx0KHQuaW50ZXJhY3Rpb24pO2YuY29weUZyb20odC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24pLGYucHJlcGFyZVN0YXRlcyhsKSxlLnN1Yk1vZGlmaWNhdGlvbj1mLGYuc3RhcnRBbGwoT3Ioe30sdCkpfX0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuc3RhdGUsbj10LnJlY3Qscj10LmNvb3JkcyxvPSgwLGouZGVmYXVsdCkoe30sciksaT1lLmVxdWFsRGVsdGE/VHI6TXI7aWYoaShlLGUueElzUHJpbWFyeUF4aXMscixuKSwhZS5zdWJNb2RpZmljYXRpb24pcmV0dXJuIG51bGw7dmFyIGE9KDAsai5kZWZhdWx0KSh7fSxuKTsoMCxrLmFkZEVkZ2VzKShlLmxpbmtlZEVkZ2VzLGEse3g6ci54LW8ueCx5OnIueS1vLnl9KTt2YXIgcz1lLnN1Yk1vZGlmaWNhdGlvbi5zZXRBbGwoT3IoT3Ioe30sdCkse30se3JlY3Q6YSxlZGdlczplLmxpbmtlZEVkZ2VzLHBhZ2VDb29yZHM6cixwcmV2Q29vcmRzOnIscHJldlJlY3Q6YX0pKSxsPXMuZGVsdGE7cmV0dXJuIHMuY2hhbmdlZCYmKGkoZSxNYXRoLmFicyhsLngpPk1hdGguYWJzKGwueSkscy5jb29yZHMscy5yZWN0KSwoMCxqLmRlZmF1bHQpKHIscy5jb29yZHMpKSxzLmV2ZW50UHJvcHN9LGRlZmF1bHRzOntyYXRpbzpcInByZXNlcnZlXCIsZXF1YWxEZWx0YTohMSxtb2RpZmllcnM6W10sZW5hYmxlZDohMX19O2Z1bmN0aW9uIFRyKHQsZSxuKXt2YXIgcj10LnN0YXJ0Q29vcmRzLG89dC5lZGdlU2lnbjtlP24ueT1yLnkrKG4ueC1yLngpKm86bi54PXIueCsobi55LXIueSkqb31mdW5jdGlvbiBNcih0LGUsbixyKXt2YXIgbz10LnN0YXJ0UmVjdCxpPXQuc3RhcnRDb29yZHMsYT10LnJhdGlvLHM9dC5lZGdlU2lnbjtpZihlKXt2YXIgbD1yLndpZHRoL2E7bi55PWkueSsobC1vLmhlaWdodCkqc31lbHNle3ZhciB1PXIuaGVpZ2h0KmE7bi54PWkueCsodS1vLndpZHRoKSpzfX1fci5hc3BlY3RSYXRpbz1Fcjt2YXIganI9KDAsU2UubWFrZU1vZGlmaWVyKShFcixcImFzcGVjdFJhdGlvXCIpO19yLmRlZmF1bHQ9anI7dmFyIGtyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShrcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxrci5kZWZhdWx0PXZvaWQgMDt2YXIgSXI9ZnVuY3Rpb24oKXt9O0lyLl9kZWZhdWx0cz17fTt2YXIgRHI9SXI7a3IuZGVmYXVsdD1Ecjt2YXIgQXI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEFyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcixcImRlZmF1bHRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4ga3IuZGVmYXVsdH19KTt2YXIgUnI9e307ZnVuY3Rpb24genIodCxlLG4pe3JldHVybiBpLmRlZmF1bHQuZnVuYyh0KT9rLnJlc29sdmVSZWN0TGlrZSh0LGUuaW50ZXJhY3RhYmxlLGUuZWxlbWVudCxbbi54LG4ueSxlXSk6ay5yZXNvbHZlUmVjdExpa2UodCxlLmludGVyYWN0YWJsZSxlLmVsZW1lbnQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShScixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxSci5nZXRSZXN0cmljdGlvblJlY3Q9enIsUnIucmVzdHJpY3Q9UnIuZGVmYXVsdD12b2lkIDA7dmFyIENyPXtzdGFydDpmdW5jdGlvbih0KXt2YXIgZT10LnJlY3Qsbj10LnN0YXJ0T2Zmc2V0LHI9dC5zdGF0ZSxvPXQuaW50ZXJhY3Rpb24saT10LnBhZ2VDb29yZHMsYT1yLm9wdGlvbnMscz1hLmVsZW1lbnRSZWN0LGw9KDAsai5kZWZhdWx0KSh7bGVmdDowLHRvcDowLHJpZ2h0OjAsYm90dG9tOjB9LGEub2Zmc2V0fHx7fSk7aWYoZSYmcyl7dmFyIHU9enIoYS5yZXN0cmljdGlvbixvLGkpO2lmKHUpe3ZhciBjPXUucmlnaHQtdS5sZWZ0LWUud2lkdGgsZj11LmJvdHRvbS11LnRvcC1lLmhlaWdodDtjPDAmJihsLmxlZnQrPWMsbC5yaWdodCs9YyksZjwwJiYobC50b3ArPWYsbC5ib3R0b20rPWYpfWwubGVmdCs9bi5sZWZ0LWUud2lkdGgqcy5sZWZ0LGwudG9wKz1uLnRvcC1lLmhlaWdodCpzLnRvcCxsLnJpZ2h0Kz1uLnJpZ2h0LWUud2lkdGgqKDEtcy5yaWdodCksbC5ib3R0b20rPW4uYm90dG9tLWUuaGVpZ2h0KigxLXMuYm90dG9tKX1yLm9mZnNldD1sfSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5jb29yZHMsbj10LmludGVyYWN0aW9uLHI9dC5zdGF0ZSxvPXIub3B0aW9ucyxpPXIub2Zmc2V0LGE9enIoby5yZXN0cmljdGlvbixuLGUpO2lmKGEpe3ZhciBzPWsueHl3aFRvVGxicihhKTtlLng9TWF0aC5tYXgoTWF0aC5taW4ocy5yaWdodC1pLnJpZ2h0LGUueCkscy5sZWZ0K2kubGVmdCksZS55PU1hdGgubWF4KE1hdGgubWluKHMuYm90dG9tLWkuYm90dG9tLGUueSkscy50b3AraS50b3ApfX0sZGVmYXVsdHM6e3Jlc3RyaWN0aW9uOm51bGwsZWxlbWVudFJlY3Q6bnVsbCxvZmZzZXQ6bnVsbCxlbmRPbmx5OiExLGVuYWJsZWQ6ITF9fTtSci5yZXN0cmljdD1Dcjt2YXIgRnI9KDAsU2UubWFrZU1vZGlmaWVyKShDcixcInJlc3RyaWN0XCIpO1JyLmRlZmF1bHQ9RnI7dmFyIFhyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShYcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxYci5yZXN0cmljdEVkZ2VzPVhyLmRlZmF1bHQ9dm9pZCAwO3ZhciBZcj17dG9wOjEvMCxsZWZ0OjEvMCxib3R0b206LTEvMCxyaWdodDotMS8wfSxCcj17dG9wOi0xLzAsbGVmdDotMS8wLGJvdHRvbToxLzAscmlnaHQ6MS8wfTtmdW5jdGlvbiBXcih0LGUpe2Zvcih2YXIgbj1bXCJ0b3BcIixcImxlZnRcIixcImJvdHRvbVwiLFwicmlnaHRcIl0scj0wO3I8bi5sZW5ndGg7cisrKXt2YXIgbz1uW3JdO28gaW4gdHx8KHRbb109ZVtvXSl9cmV0dXJuIHR9dmFyIExyPXtub0lubmVyOllyLG5vT3V0ZXI6QnIsc3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGUsbj10LmludGVyYWN0aW9uLHI9dC5zdGFydE9mZnNldCxvPXQuc3RhdGUsaT1vLm9wdGlvbnM7aWYoaSl7dmFyIGE9KDAsUnIuZ2V0UmVzdHJpY3Rpb25SZWN0KShpLm9mZnNldCxuLG4uY29vcmRzLnN0YXJ0LnBhZ2UpO2U9ay5yZWN0VG9YWShhKX1lPWV8fHt4OjAseTowfSxvLm9mZnNldD17dG9wOmUueStyLnRvcCxsZWZ0OmUueCtyLmxlZnQsYm90dG9tOmUueS1yLmJvdHRvbSxyaWdodDplLngtci5yaWdodH19LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LmNvb3JkcyxuPXQuZWRnZXMscj10LmludGVyYWN0aW9uLG89dC5zdGF0ZSxpPW8ub2Zmc2V0LGE9by5vcHRpb25zO2lmKG4pe3ZhciBzPSgwLGouZGVmYXVsdCkoe30sZSksbD0oMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGEuaW5uZXIscixzKXx8e30sdT0oMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGEub3V0ZXIscixzKXx8e307V3IobCxZciksV3IodSxCciksbi50b3A/ZS55PU1hdGgubWluKE1hdGgubWF4KHUudG9wK2kudG9wLHMueSksbC50b3AraS50b3ApOm4uYm90dG9tJiYoZS55PU1hdGgubWF4KE1hdGgubWluKHUuYm90dG9tK2kuYm90dG9tLHMueSksbC5ib3R0b20raS5ib3R0b20pKSxuLmxlZnQ/ZS54PU1hdGgubWluKE1hdGgubWF4KHUubGVmdCtpLmxlZnQscy54KSxsLmxlZnQraS5sZWZ0KTpuLnJpZ2h0JiYoZS54PU1hdGgubWF4KE1hdGgubWluKHUucmlnaHQraS5yaWdodCxzLngpLGwucmlnaHQraS5yaWdodCkpfX0sZGVmYXVsdHM6e2lubmVyOm51bGwsb3V0ZXI6bnVsbCxvZmZzZXQ6bnVsbCxlbmRPbmx5OiExLGVuYWJsZWQ6ITF9fTtYci5yZXN0cmljdEVkZ2VzPUxyO3ZhciBVcj0oMCxTZS5tYWtlTW9kaWZpZXIpKExyLFwicmVzdHJpY3RFZGdlc1wiKTtYci5kZWZhdWx0PVVyO3ZhciBWcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoVnIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksVnIucmVzdHJpY3RSZWN0PVZyLmRlZmF1bHQ9dm9pZCAwO3ZhciBOcj0oMCxqLmRlZmF1bHQpKHtnZXQgZWxlbWVudFJlY3QoKXtyZXR1cm57dG9wOjAsbGVmdDowLGJvdHRvbToxLHJpZ2h0OjF9fSxzZXQgZWxlbWVudFJlY3QodCl7fX0sUnIucmVzdHJpY3QuZGVmYXVsdHMpLHFyPXtzdGFydDpSci5yZXN0cmljdC5zdGFydCxzZXQ6UnIucmVzdHJpY3Quc2V0LGRlZmF1bHRzOk5yfTtWci5yZXN0cmljdFJlY3Q9cXI7dmFyICRyPSgwLFNlLm1ha2VNb2RpZmllcikocXIsXCJyZXN0cmljdFJlY3RcIik7VnIuZGVmYXVsdD0kcjt2YXIgR3I9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEdyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEdyLnJlc3RyaWN0U2l6ZT1Hci5kZWZhdWx0PXZvaWQgMDt2YXIgSHI9e3dpZHRoOi0xLzAsaGVpZ2h0Oi0xLzB9LEtyPXt3aWR0aDoxLzAsaGVpZ2h0OjEvMH0sWnI9e3N0YXJ0OmZ1bmN0aW9uKHQpe3JldHVybiBYci5yZXN0cmljdEVkZ2VzLnN0YXJ0KHQpfSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuc3RhdGUscj10LnJlY3Qsbz10LmVkZ2VzLGk9bi5vcHRpb25zO2lmKG8pe3ZhciBhPWsudGxiclRvWHl3aCgoMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGkubWluLGUsdC5jb29yZHMpKXx8SHIscz1rLnRsYnJUb1h5d2goKDAsUnIuZ2V0UmVzdHJpY3Rpb25SZWN0KShpLm1heCxlLHQuY29vcmRzKSl8fEtyO24ub3B0aW9ucz17ZW5kT25seTppLmVuZE9ubHksaW5uZXI6KDAsai5kZWZhdWx0KSh7fSxYci5yZXN0cmljdEVkZ2VzLm5vSW5uZXIpLG91dGVyOigwLGouZGVmYXVsdCkoe30sWHIucmVzdHJpY3RFZGdlcy5ub091dGVyKX0sby50b3A/KG4ub3B0aW9ucy5pbm5lci50b3A9ci5ib3R0b20tYS5oZWlnaHQsbi5vcHRpb25zLm91dGVyLnRvcD1yLmJvdHRvbS1zLmhlaWdodCk6by5ib3R0b20mJihuLm9wdGlvbnMuaW5uZXIuYm90dG9tPXIudG9wK2EuaGVpZ2h0LG4ub3B0aW9ucy5vdXRlci5ib3R0b209ci50b3Arcy5oZWlnaHQpLG8ubGVmdD8obi5vcHRpb25zLmlubmVyLmxlZnQ9ci5yaWdodC1hLndpZHRoLG4ub3B0aW9ucy5vdXRlci5sZWZ0PXIucmlnaHQtcy53aWR0aCk6by5yaWdodCYmKG4ub3B0aW9ucy5pbm5lci5yaWdodD1yLmxlZnQrYS53aWR0aCxuLm9wdGlvbnMub3V0ZXIucmlnaHQ9ci5sZWZ0K3Mud2lkdGgpLFhyLnJlc3RyaWN0RWRnZXMuc2V0KHQpLG4ub3B0aW9ucz1pfX0sZGVmYXVsdHM6e21pbjpudWxsLG1heDpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O0dyLnJlc3RyaWN0U2l6ZT1acjt2YXIgSnI9KDAsU2UubWFrZU1vZGlmaWVyKShacixcInJlc3RyaWN0U2l6ZVwiKTtHci5kZWZhdWx0PUpyO3ZhciBRcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoUXIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KFFyLFwiZGVmYXVsdFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBrci5kZWZhdWx0fX0pO3ZhciB0bz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdG8uc25hcD10by5kZWZhdWx0PXZvaWQgMDt2YXIgZW89e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlLG49dC5pbnRlcmFjdGlvbixyPXQuaW50ZXJhY3RhYmxlLG89dC5lbGVtZW50LGk9dC5yZWN0LGE9dC5zdGF0ZSxzPXQuc3RhcnRPZmZzZXQsbD1hLm9wdGlvbnMsdT1sLm9mZnNldFdpdGhPcmlnaW4/ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbi5lbGVtZW50O3JldHVybigwLGsucmVjdFRvWFkpKCgwLGsucmVzb2x2ZVJlY3RMaWtlKSh0LnN0YXRlLm9wdGlvbnMub3JpZ2luLG51bGwsbnVsbCxbZV0pKXx8KDAsQS5kZWZhdWx0KSh0LmludGVyYWN0YWJsZSxlLHQuaW50ZXJhY3Rpb24ucHJlcGFyZWQubmFtZSl9KHQpOnt4OjAseTowfTtpZihcInN0YXJ0Q29vcmRzXCI9PT1sLm9mZnNldCllPXt4Om4uY29vcmRzLnN0YXJ0LnBhZ2UueCx5Om4uY29vcmRzLnN0YXJ0LnBhZ2UueX07ZWxzZXt2YXIgYz0oMCxrLnJlc29sdmVSZWN0TGlrZSkobC5vZmZzZXQscixvLFtuXSk7KGU9KDAsay5yZWN0VG9YWSkoYyl8fHt4OjAseTowfSkueCs9dS54LGUueSs9dS55fXZhciBmPWwucmVsYXRpdmVQb2ludHM7YS5vZmZzZXRzPWkmJmYmJmYubGVuZ3RoP2YubWFwKChmdW5jdGlvbih0LG4pe3JldHVybntpbmRleDpuLHJlbGF0aXZlUG9pbnQ6dCx4OnMubGVmdC1pLndpZHRoKnQueCtlLngseTpzLnRvcC1pLmhlaWdodCp0LnkrZS55fX0pKTpbe2luZGV4OjAscmVsYXRpdmVQb2ludDpudWxsLHg6ZS54LHk6ZS55fV19LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5jb29yZHMscj10LnN0YXRlLG89ci5vcHRpb25zLGE9ci5vZmZzZXRzLHM9KDAsQS5kZWZhdWx0KShlLmludGVyYWN0YWJsZSxlLmVsZW1lbnQsZS5wcmVwYXJlZC5uYW1lKSxsPSgwLGouZGVmYXVsdCkoe30sbiksdT1bXTtvLm9mZnNldFdpdGhPcmlnaW58fChsLngtPXMueCxsLnktPXMueSk7Zm9yKHZhciBjPTA7YzxhLmxlbmd0aDtjKyspZm9yKHZhciBmPWFbY10sZD1sLngtZi54LHA9bC55LWYueSx2PTAsaD1vLnRhcmdldHMubGVuZ3RoO3Y8aDt2Kyspe3ZhciBnLHk9by50YXJnZXRzW3ZdOyhnPWkuZGVmYXVsdC5mdW5jKHkpP3koZCxwLGUuX3Byb3h5LGYsdik6eSkmJnUucHVzaCh7eDooaS5kZWZhdWx0Lm51bWJlcihnLngpP2cueDpkKStmLngseTooaS5kZWZhdWx0Lm51bWJlcihnLnkpP2cueTpwKStmLnkscmFuZ2U6aS5kZWZhdWx0Lm51bWJlcihnLnJhbmdlKT9nLnJhbmdlOm8ucmFuZ2Usc291cmNlOnksaW5kZXg6dixvZmZzZXQ6Zn0pfWZvcih2YXIgbT17dGFyZ2V0Om51bGwsaW5SYW5nZTohMSxkaXN0YW5jZTowLHJhbmdlOjAsZGVsdGE6e3g6MCx5OjB9fSxiPTA7Yjx1Lmxlbmd0aDtiKyspe3ZhciB4PXVbYl0sdz14LnJhbmdlLF89eC54LWwueCxQPXgueS1sLnksTz0oMCxDLmRlZmF1bHQpKF8sUCksUz1PPD13O3c9PT0xLzAmJm0uaW5SYW5nZSYmbS5yYW5nZSE9PTEvMCYmKFM9ITEpLG0udGFyZ2V0JiYhKFM/bS5pblJhbmdlJiZ3IT09MS8wP08vdzxtLmRpc3RhbmNlL20ucmFuZ2U6dz09PTEvMCYmbS5yYW5nZSE9PTEvMHx8TzxtLmRpc3RhbmNlOiFtLmluUmFuZ2UmJk88bS5kaXN0YW5jZSl8fChtLnRhcmdldD14LG0uZGlzdGFuY2U9TyxtLnJhbmdlPXcsbS5pblJhbmdlPVMsbS5kZWx0YS54PV8sbS5kZWx0YS55PVApfXJldHVybiBtLmluUmFuZ2UmJihuLng9bS50YXJnZXQueCxuLnk9bS50YXJnZXQueSksci5jbG9zZXN0PW0sbX0sZGVmYXVsdHM6e3JhbmdlOjEvMCx0YXJnZXRzOm51bGwsb2Zmc2V0Om51bGwsb2Zmc2V0V2l0aE9yaWdpbjohMCxvcmlnaW46bnVsbCxyZWxhdGl2ZVBvaW50czpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O3RvLnNuYXA9ZW87dmFyIG5vPSgwLFNlLm1ha2VNb2RpZmllcikoZW8sXCJzbmFwXCIpO3RvLmRlZmF1bHQ9bm87dmFyIHJvPXt9O2Z1bmN0aW9uIG9vKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1PYmplY3QuZGVmaW5lUHJvcGVydHkocm8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkscm8uc25hcFNpemU9cm8uZGVmYXVsdD12b2lkIDA7dmFyIGlvPXtzdGFydDpmdW5jdGlvbih0KXt2YXIgZT10LnN0YXRlLG49dC5lZGdlcyxyPWUub3B0aW9ucztpZighbilyZXR1cm4gbnVsbDt0LnN0YXRlPXtvcHRpb25zOnt0YXJnZXRzOm51bGwscmVsYXRpdmVQb2ludHM6W3t4Om4ubGVmdD8wOjEseTpuLnRvcD8wOjF9XSxvZmZzZXQ6ci5vZmZzZXR8fFwic2VsZlwiLG9yaWdpbjp7eDowLHk6MH0scmFuZ2U6ci5yYW5nZX19LGUudGFyZ2V0RmllbGRzPWUudGFyZ2V0RmllbGRzfHxbW1wid2lkdGhcIixcImhlaWdodFwiXSxbXCJ4XCIsXCJ5XCJdXSx0by5zbmFwLnN0YXJ0KHQpLGUub2Zmc2V0cz10LnN0YXRlLm9mZnNldHMsdC5zdGF0ZT1lfSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGUsbixyPXQuaW50ZXJhY3Rpb24sbz10LnN0YXRlLGE9dC5jb29yZHMscz1vLm9wdGlvbnMsbD1vLm9mZnNldHMsdT17eDphLngtbFswXS54LHk6YS55LWxbMF0ueX07by5vcHRpb25zPSgwLGouZGVmYXVsdCkoe30scyksby5vcHRpb25zLnRhcmdldHM9W107Zm9yKHZhciBjPTA7Yzwocy50YXJnZXRzfHxbXSkubGVuZ3RoO2MrKyl7dmFyIGY9KHMudGFyZ2V0c3x8W10pW2NdLGQ9dm9pZCAwO2lmKGQ9aS5kZWZhdWx0LmZ1bmMoZik/Zih1LngsdS55LHIpOmYpe2Zvcih2YXIgcD0wO3A8by50YXJnZXRGaWVsZHMubGVuZ3RoO3ArKyl7dmFyIHY9KGU9by50YXJnZXRGaWVsZHNbcF0sbj0yLGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KGUpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0oZSxuKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gb28odCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP29vKHQsZSk6dm9pZCAwfX0oZSxuKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpKSxoPXZbMF0sZz12WzFdO2lmKGggaW4gZHx8ZyBpbiBkKXtkLng9ZFtoXSxkLnk9ZFtnXTticmVha319by5vcHRpb25zLnRhcmdldHMucHVzaChkKX19dmFyIHk9dG8uc25hcC5zZXQodCk7cmV0dXJuIG8ub3B0aW9ucz1zLHl9LGRlZmF1bHRzOntyYW5nZToxLzAsdGFyZ2V0czpudWxsLG9mZnNldDpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O3JvLnNuYXBTaXplPWlvO3ZhciBhbz0oMCxTZS5tYWtlTW9kaWZpZXIpKGlvLFwic25hcFNpemVcIik7cm8uZGVmYXVsdD1hbzt2YXIgc289e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHNvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHNvLnNuYXBFZGdlcz1zby5kZWZhdWx0PXZvaWQgMDt2YXIgbG89e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuZWRnZXM7cmV0dXJuIGU/KHQuc3RhdGUudGFyZ2V0RmllbGRzPXQuc3RhdGUudGFyZ2V0RmllbGRzfHxbW2UubGVmdD9cImxlZnRcIjpcInJpZ2h0XCIsZS50b3A/XCJ0b3BcIjpcImJvdHRvbVwiXV0scm8uc25hcFNpemUuc3RhcnQodCkpOm51bGx9LHNldDpyby5zbmFwU2l6ZS5zZXQsZGVmYXVsdHM6KDAsai5kZWZhdWx0KSgoMCxnZS5kZWZhdWx0KShyby5zbmFwU2l6ZS5kZWZhdWx0cykse3RhcmdldHM6bnVsbCxyYW5nZTpudWxsLG9mZnNldDp7eDowLHk6MH19KX07c28uc25hcEVkZ2VzPWxvO3ZhciB1bz0oMCxTZS5tYWtlTW9kaWZpZXIpKGxvLFwic25hcEVkZ2VzXCIpO3NvLmRlZmF1bHQ9dW87dmFyIGNvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShjbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoY28sXCJkZWZhdWx0XCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGtyLmRlZmF1bHR9fSk7dmFyIGZvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShmbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZm8sXCJkZWZhdWx0XCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGtyLmRlZmF1bHR9fSk7dmFyIHBvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShwbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxwby5kZWZhdWx0PXZvaWQgMDt2YXIgdm89e2FzcGVjdFJhdGlvOl9yLmRlZmF1bHQscmVzdHJpY3RFZGdlczpYci5kZWZhdWx0LHJlc3RyaWN0OlJyLmRlZmF1bHQscmVzdHJpY3RSZWN0OlZyLmRlZmF1bHQscmVzdHJpY3RTaXplOkdyLmRlZmF1bHQsc25hcEVkZ2VzOnNvLmRlZmF1bHQsc25hcDp0by5kZWZhdWx0LHNuYXBTaXplOnJvLmRlZmF1bHQsc3ByaW5nOmNvLmRlZmF1bHQsYXZvaWQ6QXIuZGVmYXVsdCx0cmFuc2Zvcm06Zm8uZGVmYXVsdCxydWJiZXJiYW5kOlFyLmRlZmF1bHR9O3BvLmRlZmF1bHQ9dm87dmFyIGhvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShobyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxoby5kZWZhdWx0PXZvaWQgMDt2YXIgZ289e2lkOlwibW9kaWZpZXJzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0U3RhdGljO2Zvcih2YXIgbiBpbiB0LnVzZVBsdWdpbihTZS5kZWZhdWx0KSx0LnVzZVBsdWdpbih4ci5kZWZhdWx0KSxlLm1vZGlmaWVycz1wby5kZWZhdWx0LHBvLmRlZmF1bHQpe3ZhciByPXBvLmRlZmF1bHRbbl0sbz1yLl9kZWZhdWx0cyxpPXIuX21ldGhvZHM7by5fbWV0aG9kcz1pLHQuZGVmYXVsdHMucGVyQWN0aW9uW25dPW99fX07aG8uZGVmYXVsdD1nbzt2YXIgeW89e307ZnVuY3Rpb24gbW8odCl7cmV0dXJuKG1vPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBibyh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24geG8odCxlKXtyZXR1cm4oeG89T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIHdvKHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1tbyhlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9fbyh0KTplfWZ1bmN0aW9uIF9vKHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fWZ1bmN0aW9uIFBvKHQpe3JldHVybihQbz1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9ZnVuY3Rpb24gT28odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh5byxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx5by5Qb2ludGVyRXZlbnQ9eW8uZGVmYXVsdD12b2lkIDA7dmFyIFNvPWZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmeG8odCxlKX0oYSx0KTt2YXIgZSxuLHIsbyxpPShyPWEsbz1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBSZWZsZWN0fHwhUmVmbGVjdC5jb25zdHJ1Y3QpcmV0dXJuITE7aWYoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSlyZXR1cm4hMTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm94eSlyZXR1cm4hMDt0cnl7cmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLFtdLChmdW5jdGlvbigpe30pKSksITB9Y2F0Y2godCl7cmV0dXJuITF9fSgpLGZ1bmN0aW9uKCl7dmFyIHQsZT1QbyhyKTtpZihvKXt2YXIgbj1Qbyh0aGlzKS5jb25zdHJ1Y3Rvcjt0PVJlZmxlY3QuY29uc3RydWN0KGUsYXJndW1lbnRzLG4pfWVsc2UgdD1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gd28odGhpcyx0KX0pO2Z1bmN0aW9uIGEodCxlLG4scixvLHMpe3ZhciBsO2lmKGZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyxhKSxPbyhfbyhsPWkuY2FsbCh0aGlzLG8pKSxcInR5cGVcIix2b2lkIDApLE9vKF9vKGwpLFwib3JpZ2luYWxFdmVudFwiLHZvaWQgMCksT28oX28obCksXCJwb2ludGVySWRcIix2b2lkIDApLE9vKF9vKGwpLFwicG9pbnRlclR5cGVcIix2b2lkIDApLE9vKF9vKGwpLFwiZG91YmxlXCIsdm9pZCAwKSxPbyhfbyhsKSxcInBhZ2VYXCIsdm9pZCAwKSxPbyhfbyhsKSxcInBhZ2VZXCIsdm9pZCAwKSxPbyhfbyhsKSxcImNsaWVudFhcIix2b2lkIDApLE9vKF9vKGwpLFwiY2xpZW50WVwiLHZvaWQgMCksT28oX28obCksXCJkdFwiLHZvaWQgMCksT28oX28obCksXCJldmVudGFibGVcIix2b2lkIDApLEIucG9pbnRlckV4dGVuZChfbyhsKSxuKSxuIT09ZSYmQi5wb2ludGVyRXh0ZW5kKF9vKGwpLGUpLGwudGltZVN0YW1wPXMsbC5vcmlnaW5hbEV2ZW50PW4sbC50eXBlPXQsbC5wb2ludGVySWQ9Qi5nZXRQb2ludGVySWQoZSksbC5wb2ludGVyVHlwZT1CLmdldFBvaW50ZXJUeXBlKGUpLGwudGFyZ2V0PXIsbC5jdXJyZW50VGFyZ2V0PW51bGwsXCJ0YXBcIj09PXQpe3ZhciB1PW8uZ2V0UG9pbnRlckluZGV4KGUpO2wuZHQ9bC50aW1lU3RhbXAtby5wb2ludGVyc1t1XS5kb3duVGltZTt2YXIgYz1sLnRpbWVTdGFtcC1vLnRhcFRpbWU7bC5kb3VibGU9ISEoby5wcmV2VGFwJiZcImRvdWJsZXRhcFwiIT09by5wcmV2VGFwLnR5cGUmJm8ucHJldlRhcC50YXJnZXQ9PT1sLnRhcmdldCYmYzw1MDApfWVsc2VcImRvdWJsZXRhcFwiPT09dCYmKGwuZHQ9ZS50aW1lU3RhbXAtby50YXBUaW1lKTtyZXR1cm4gbH1yZXR1cm4gZT1hLChuPVt7a2V5OlwiX3N1YnRyYWN0T3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC54LG49dC55O3JldHVybiB0aGlzLnBhZ2VYLT1lLHRoaXMucGFnZVktPW4sdGhpcy5jbGllbnRYLT1lLHRoaXMuY2xpZW50WS09bix0aGlzfX0se2tleTpcIl9hZGRPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10Lngsbj10Lnk7cmV0dXJuIHRoaXMucGFnZVgrPWUsdGhpcy5wYWdlWSs9bix0aGlzLmNsaWVudFgrPWUsdGhpcy5jbGllbnRZKz1uLHRoaXN9fSx7a2V5OlwicHJldmVudERlZmF1bHRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpfX1dKSYmYm8oZS5wcm90b3R5cGUsbiksYX0oJC5CYXNlRXZlbnQpO3lvLlBvaW50ZXJFdmVudD15by5kZWZhdWx0PVNvO3ZhciBFbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoRW8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksRW8uZGVmYXVsdD12b2lkIDA7dmFyIFRvPXtpZDpcInBvaW50ZXItZXZlbnRzL2Jhc2VcIixiZWZvcmU6W1wiaW5lcnRpYVwiLFwibW9kaWZpZXJzXCIsXCJhdXRvLXN0YXJ0XCIsXCJhY3Rpb25zXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dC5wb2ludGVyRXZlbnRzPVRvLHQuZGVmYXVsdHMuYWN0aW9ucy5wb2ludGVyRXZlbnRzPVRvLmRlZmF1bHRzLCgwLGouZGVmYXVsdCkodC5hY3Rpb25zLnBoYXNlbGVzc1R5cGVzLFRvLnR5cGVzKX0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2UucHJldlRhcD1udWxsLGUudGFwVGltZT0wfSxcImludGVyYWN0aW9uczp1cGRhdGUtcG9pbnRlclwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZG93bixuPXQucG9pbnRlckluZm87IWUmJm4uaG9sZHx8KG4uaG9sZD17ZHVyYXRpb246MS8wLHRpbWVvdXQ6bnVsbH0pfSxcImludGVyYWN0aW9uczptb3ZlXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQ7dC5kdXBsaWNhdGV8fG4ucG9pbnRlcklzRG93biYmIW4ucG9pbnRlcldhc01vdmVkfHwobi5wb2ludGVySXNEb3duJiZrbyh0KSxNbyh7aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHR5cGU6XCJtb3ZlXCJ9LGUpKX0sXCJpbnRlcmFjdGlvbnM6ZG93blwiOmZ1bmN0aW9uKHQsZSl7IWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldCxhPXQucG9pbnRlckluZGV4LHM9bi5wb2ludGVyc1thXS5ob2xkLGw9Xy5nZXRQYXRoKGkpLHU9e2ludGVyYWN0aW9uOm4scG9pbnRlcjpyLGV2ZW50Om8sZXZlbnRUYXJnZXQ6aSx0eXBlOlwiaG9sZFwiLHRhcmdldHM6W10scGF0aDpsLG5vZGU6bnVsbH0sYz0wO2M8bC5sZW5ndGg7YysrKXt2YXIgZj1sW2NdO3Uubm9kZT1mLGUuZmlyZShcInBvaW50ZXJFdmVudHM6Y29sbGVjdC10YXJnZXRzXCIsdSl9aWYodS50YXJnZXRzLmxlbmd0aCl7Zm9yKHZhciBkPTEvMCxwPTA7cDx1LnRhcmdldHMubGVuZ3RoO3ArKyl7dmFyIHY9dS50YXJnZXRzW3BdLmV2ZW50YWJsZS5vcHRpb25zLmhvbGREdXJhdGlvbjt2PGQmJihkPXYpfXMuZHVyYXRpb249ZCxzLnRpbWVvdXQ9c2V0VGltZW91dCgoZnVuY3Rpb24oKXtNbyh7aW50ZXJhY3Rpb246bixldmVudFRhcmdldDppLHBvaW50ZXI6cixldmVudDpvLHR5cGU6XCJob2xkXCJ9LGUpfSksZCl9fSh0LGUpLE1vKHQsZSl9LFwiaW50ZXJhY3Rpb25zOnVwXCI6ZnVuY3Rpb24odCxlKXtrbyh0KSxNbyh0LGUpLGZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0O24ucG9pbnRlcldhc01vdmVkfHxNbyh7aW50ZXJhY3Rpb246bixldmVudFRhcmdldDppLHBvaW50ZXI6cixldmVudDpvLHR5cGU6XCJ0YXBcIn0sZSl9KHQsZSl9LFwiaW50ZXJhY3Rpb25zOmNhbmNlbFwiOmZ1bmN0aW9uKHQsZSl7a28odCksTW8odCxlKX19LFBvaW50ZXJFdmVudDp5by5Qb2ludGVyRXZlbnQsZmlyZTpNbyxjb2xsZWN0RXZlbnRUYXJnZXRzOmpvLGRlZmF1bHRzOntob2xkRHVyYXRpb246NjAwLGlnbm9yZUZyb206bnVsbCxhbGxvd0Zyb206bnVsbCxvcmlnaW46e3g6MCx5OjB9fSx0eXBlczp7ZG93bjohMCxtb3ZlOiEwLHVwOiEwLGNhbmNlbDohMCx0YXA6ITAsZG91YmxldGFwOiEwLGhvbGQ6ITB9fTtmdW5jdGlvbiBNbyh0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldCxhPXQudHlwZSxzPXQudGFyZ2V0cyxsPXZvaWQgMD09PXM/am8odCxlKTpzLHU9bmV3IHlvLlBvaW50ZXJFdmVudChhLHIsbyxpLG4sZS5ub3coKSk7ZS5maXJlKFwicG9pbnRlckV2ZW50czpuZXdcIix7cG9pbnRlckV2ZW50OnV9KTtmb3IodmFyIGM9e2ludGVyYWN0aW9uOm4scG9pbnRlcjpyLGV2ZW50Om8sZXZlbnRUYXJnZXQ6aSx0YXJnZXRzOmwsdHlwZTphLHBvaW50ZXJFdmVudDp1fSxmPTA7ZjxsLmxlbmd0aDtmKyspe3ZhciBkPWxbZl07Zm9yKHZhciBwIGluIGQucHJvcHN8fHt9KXVbcF09ZC5wcm9wc1twXTt2YXIgdj0oMCxBLmRlZmF1bHQpKGQuZXZlbnRhYmxlLGQubm9kZSk7aWYodS5fc3VidHJhY3RPcmlnaW4odiksdS5ldmVudGFibGU9ZC5ldmVudGFibGUsdS5jdXJyZW50VGFyZ2V0PWQubm9kZSxkLmV2ZW50YWJsZS5maXJlKHUpLHUuX2FkZE9yaWdpbih2KSx1LmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZHx8dS5wcm9wYWdhdGlvblN0b3BwZWQmJmYrMTxsLmxlbmd0aCYmbFtmKzFdLm5vZGUhPT11LmN1cnJlbnRUYXJnZXQpYnJlYWt9aWYoZS5maXJlKFwicG9pbnRlckV2ZW50czpmaXJlZFwiLGMpLFwidGFwXCI9PT1hKXt2YXIgaD11LmRvdWJsZT9Nbyh7aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHR5cGU6XCJkb3VibGV0YXBcIn0sZSk6dTtuLnByZXZUYXA9aCxuLnRhcFRpbWU9aC50aW1lU3RhbXB9cmV0dXJuIHV9ZnVuY3Rpb24gam8odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQsYT10LnR5cGUscz1uLmdldFBvaW50ZXJJbmRleChyKSxsPW4ucG9pbnRlcnNbc107aWYoXCJ0YXBcIj09PWEmJihuLnBvaW50ZXJXYXNNb3ZlZHx8IWx8fGwuZG93blRhcmdldCE9PWkpKXJldHVybltdO2Zvcih2YXIgdT1fLmdldFBhdGgoaSksYz17aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHR5cGU6YSxwYXRoOnUsdGFyZ2V0czpbXSxub2RlOm51bGx9LGY9MDtmPHUubGVuZ3RoO2YrKyl7dmFyIGQ9dVtmXTtjLm5vZGU9ZCxlLmZpcmUoXCJwb2ludGVyRXZlbnRzOmNvbGxlY3QtdGFyZ2V0c1wiLGMpfXJldHVyblwiaG9sZFwiPT09YSYmKGMudGFyZ2V0cz1jLnRhcmdldHMuZmlsdGVyKChmdW5jdGlvbih0KXt2YXIgZTtyZXR1cm4gdC5ldmVudGFibGUub3B0aW9ucy5ob2xkRHVyYXRpb249PT0obnVsbD09KGU9bi5wb2ludGVyc1tzXSk/dm9pZCAwOmUuaG9sZC5kdXJhdGlvbil9KSkpLGMudGFyZ2V0c31mdW5jdGlvbiBrbyh0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5wb2ludGVySW5kZXgscj1lLnBvaW50ZXJzW25dLmhvbGQ7ciYmci50aW1lb3V0JiYoY2xlYXJUaW1lb3V0KHIudGltZW91dCksci50aW1lb3V0PW51bGwpfXZhciBJbz1UbztFby5kZWZhdWx0PUlvO3ZhciBEbz17fTtmdW5jdGlvbiBBbyh0KXt2YXIgZT10LmludGVyYWN0aW9uO2UuaG9sZEludGVydmFsSGFuZGxlJiYoY2xlYXJJbnRlcnZhbChlLmhvbGRJbnRlcnZhbEhhbmRsZSksZS5ob2xkSW50ZXJ2YWxIYW5kbGU9bnVsbCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KERvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLERvLmRlZmF1bHQ9dm9pZCAwO3ZhciBSbz17aWQ6XCJwb2ludGVyLWV2ZW50cy9ob2xkUmVwZWF0XCIsaW5zdGFsbDpmdW5jdGlvbih0KXt0LnVzZVBsdWdpbihFby5kZWZhdWx0KTt2YXIgZT10LnBvaW50ZXJFdmVudHM7ZS5kZWZhdWx0cy5ob2xkUmVwZWF0SW50ZXJ2YWw9MCxlLnR5cGVzLmhvbGRyZXBlYXQ9dC5hY3Rpb25zLnBoYXNlbGVzc1R5cGVzLmhvbGRyZXBlYXQ9ITB9LGxpc3RlbmVyczpbXCJtb3ZlXCIsXCJ1cFwiLFwiY2FuY2VsXCIsXCJlbmRhbGxcIl0ucmVkdWNlKChmdW5jdGlvbih0LGUpe3JldHVybiB0W1wicG9pbnRlckV2ZW50czpcIi5jb25jYXQoZSldPUFvLHR9KSx7XCJwb2ludGVyRXZlbnRzOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQucG9pbnRlckV2ZW50O1wiaG9sZFwiPT09ZS50eXBlJiYoZS5jb3VudD0oZS5jb3VudHx8MCkrMSl9LFwicG9pbnRlckV2ZW50czpmaXJlZFwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlckV2ZW50LG89dC5ldmVudFRhcmdldCxpPXQudGFyZ2V0cztpZihcImhvbGRcIj09PXIudHlwZSYmaS5sZW5ndGgpe3ZhciBhPWlbMF0uZXZlbnRhYmxlLm9wdGlvbnMuaG9sZFJlcGVhdEludGVydmFsO2E8PTB8fChuLmhvbGRJbnRlcnZhbEhhbmRsZT1zZXRUaW1lb3V0KChmdW5jdGlvbigpe2UucG9pbnRlckV2ZW50cy5maXJlKHtpbnRlcmFjdGlvbjpuLGV2ZW50VGFyZ2V0Om8sdHlwZTpcImhvbGRcIixwb2ludGVyOnIsZXZlbnQ6cn0sZSl9KSxhKSl9fX0pfTtEby5kZWZhdWx0PVJvO3ZhciB6bz17fTtmdW5jdGlvbiBDbyh0KXtyZXR1cm4oMCxqLmRlZmF1bHQpKHRoaXMuZXZlbnRzLm9wdGlvbnMsdCksdGhpc31PYmplY3QuZGVmaW5lUHJvcGVydHkoem8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksem8uZGVmYXVsdD12b2lkIDA7dmFyIEZvPXtpZDpcInBvaW50ZXItZXZlbnRzL2ludGVyYWN0YWJsZVRhcmdldHNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuSW50ZXJhY3RhYmxlO2UucHJvdG90eXBlLnBvaW50ZXJFdmVudHM9Q287dmFyIG49ZS5wcm90b3R5cGUuX2JhY2tDb21wYXRPcHRpb247ZS5wcm90b3R5cGUuX2JhY2tDb21wYXRPcHRpb249ZnVuY3Rpb24odCxlKXt2YXIgcj1uLmNhbGwodGhpcyx0LGUpO3JldHVybiByPT09dGhpcyYmKHRoaXMuZXZlbnRzLm9wdGlvbnNbdF09ZSkscn19LGxpc3RlbmVyczp7XCJwb2ludGVyRXZlbnRzOmNvbGxlY3QtdGFyZ2V0c1wiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC50YXJnZXRzLHI9dC5ub2RlLG89dC50eXBlLGk9dC5ldmVudFRhcmdldDtlLmludGVyYWN0YWJsZXMuZm9yRWFjaE1hdGNoKHIsKGZ1bmN0aW9uKHQpe3ZhciBlPXQuZXZlbnRzLGE9ZS5vcHRpb25zO2UudHlwZXNbb10mJmUudHlwZXNbb10ubGVuZ3RoJiZ0LnRlc3RJZ25vcmVBbGxvdyhhLHIsaSkmJm4ucHVzaCh7bm9kZTpyLGV2ZW50YWJsZTplLHByb3BzOntpbnRlcmFjdGFibGU6dH19KX0pKX0sXCJpbnRlcmFjdGFibGU6bmV3XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGFibGU7ZS5ldmVudHMuZ2V0UmVjdD1mdW5jdGlvbih0KXtyZXR1cm4gZS5nZXRSZWN0KHQpfX0sXCJpbnRlcmFjdGFibGU6c2V0XCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0YWJsZSxyPXQub3B0aW9uczsoMCxqLmRlZmF1bHQpKG4uZXZlbnRzLm9wdGlvbnMsZS5wb2ludGVyRXZlbnRzLmRlZmF1bHRzKSwoMCxqLmRlZmF1bHQpKG4uZXZlbnRzLm9wdGlvbnMsci5wb2ludGVyRXZlbnRzfHx7fSl9fX07em8uZGVmYXVsdD1Gbzt2YXIgWG89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFhvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFhvLmRlZmF1bHQ9dm9pZCAwO3ZhciBZbz17aWQ6XCJwb2ludGVyLWV2ZW50c1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dC51c2VQbHVnaW4oRW8pLHQudXNlUGx1Z2luKERvLmRlZmF1bHQpLHQudXNlUGx1Z2luKHpvLmRlZmF1bHQpfX07WG8uZGVmYXVsdD1Zbzt2YXIgQm89e307ZnVuY3Rpb24gV28odCl7dmFyIGU9dC5JbnRlcmFjdGFibGU7dC5hY3Rpb25zLnBoYXNlcy5yZWZsb3c9ITAsZS5wcm90b3R5cGUucmVmbG93PWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0LGUsbil7Zm9yKHZhciByPWkuZGVmYXVsdC5zdHJpbmcodC50YXJnZXQpP1ouZnJvbSh0Ll9jb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwodC50YXJnZXQpKTpbdC50YXJnZXRdLG89bi53aW5kb3cuUHJvbWlzZSxhPW8/W106bnVsbCxzPWZ1bmN0aW9uKCl7dmFyIGk9cltsXSxzPXQuZ2V0UmVjdChpKTtpZighcylyZXR1cm5cImJyZWFrXCI7dmFyIHU9Wi5maW5kKG4uaW50ZXJhY3Rpb25zLmxpc3QsKGZ1bmN0aW9uKG4pe3JldHVybiBuLmludGVyYWN0aW5nKCkmJm4uaW50ZXJhY3RhYmxlPT09dCYmbi5lbGVtZW50PT09aSYmbi5wcmVwYXJlZC5uYW1lPT09ZS5uYW1lfSkpLGM9dm9pZCAwO2lmKHUpdS5tb3ZlKCksYSYmKGM9dS5fcmVmbG93UHJvbWlzZXx8bmV3IG8oKGZ1bmN0aW9uKHQpe3UuX3JlZmxvd1Jlc29sdmU9dH0pKSk7ZWxzZXt2YXIgZj0oMCxrLnRsYnJUb1h5d2gpKHMpLGQ9e3BhZ2U6e3g6Zi54LHk6Zi55fSxjbGllbnQ6e3g6Zi54LHk6Zi55fSx0aW1lU3RhbXA6bi5ub3coKX0scD1CLmNvb3Jkc1RvRXZlbnQoZCk7Yz1mdW5jdGlvbih0LGUsbixyLG8pe3ZhciBpPXQuaW50ZXJhY3Rpb25zLm5ldyh7cG9pbnRlclR5cGU6XCJyZWZsb3dcIn0pLGE9e2ludGVyYWN0aW9uOmksZXZlbnQ6byxwb2ludGVyOm8sZXZlbnRUYXJnZXQ6bixwaGFzZTpcInJlZmxvd1wifTtpLmludGVyYWN0YWJsZT1lLGkuZWxlbWVudD1uLGkucHJldkV2ZW50PW8saS51cGRhdGVQb2ludGVyKG8sbyxuLCEwKSxCLnNldFplcm9Db29yZHMoaS5jb29yZHMuZGVsdGEpLCgwLFl0LmNvcHlBY3Rpb24pKGkucHJlcGFyZWQsciksaS5fZG9QaGFzZShhKTt2YXIgcz10LndpbmRvdy5Qcm9taXNlLGw9cz9uZXcgcygoZnVuY3Rpb24odCl7aS5fcmVmbG93UmVzb2x2ZT10fSkpOnZvaWQgMDtyZXR1cm4gaS5fcmVmbG93UHJvbWlzZT1sLGkuc3RhcnQocixlLG4pLGkuX2ludGVyYWN0aW5nPyhpLm1vdmUoYSksaS5lbmQobykpOihpLnN0b3AoKSxpLl9yZWZsb3dSZXNvbHZlKCkpLGkucmVtb3ZlUG9pbnRlcihvLG8pLGx9KG4sdCxpLGUscCl9YSYmYS5wdXNoKGMpfSxsPTA7bDxyLmxlbmd0aCYmXCJicmVha1wiIT09cygpO2wrKyk7cmV0dXJuIGEmJm8uYWxsKGEpLnRoZW4oKGZ1bmN0aW9uKCl7cmV0dXJuIHR9KSl9KHRoaXMsZSx0KX19T2JqZWN0LmRlZmluZVByb3BlcnR5KEJvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEJvLmluc3RhbGw9V28sQm8uZGVmYXVsdD12b2lkIDA7dmFyIExvPXtpZDpcInJlZmxvd1wiLGluc3RhbGw6V28sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uO1wicmVmbG93XCI9PT1uLnBvaW50ZXJUeXBlJiYobi5fcmVmbG93UmVzb2x2ZSYmbi5fcmVmbG93UmVzb2x2ZSgpLFoucmVtb3ZlKGUuaW50ZXJhY3Rpb25zLmxpc3QsbikpfX19O0JvLmRlZmF1bHQ9TG87dmFyIFVvPXtleHBvcnRzOnt9fTtmdW5jdGlvbiBWbyh0KXtyZXR1cm4oVm89XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShVby5leHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFVvLmV4cG9ydHMuZGVmYXVsdD12b2lkIDAsY3IuZGVmYXVsdC51c2Uoc2UuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoR2UuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoWG8uZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoZW4uZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoaG8uZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoaWUuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoVHQuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoUnQuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoQm8uZGVmYXVsdCk7dmFyIE5vPWNyLmRlZmF1bHQ7aWYoVW8uZXhwb3J0cy5kZWZhdWx0PU5vLFwib2JqZWN0XCI9PT1WbyhVbykmJlVvKXRyeXtVby5leHBvcnRzPWNyLmRlZmF1bHR9Y2F0Y2godCl7fWNyLmRlZmF1bHQuZGVmYXVsdD1jci5kZWZhdWx0LFVvPVVvLmV4cG9ydHM7dmFyIHFvPXtleHBvcnRzOnt9fTtmdW5jdGlvbiAkbyh0KXtyZXR1cm4oJG89XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShxby5leHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHFvLmV4cG9ydHMuZGVmYXVsdD12b2lkIDA7dmFyIEdvPVVvLmRlZmF1bHQ7aWYocW8uZXhwb3J0cy5kZWZhdWx0PUdvLFwib2JqZWN0XCI9PT0kbyhxbykmJnFvKXRyeXtxby5leHBvcnRzPVVvLmRlZmF1bHR9Y2F0Y2godCl7fXJldHVybiBVby5kZWZhdWx0LmRlZmF1bHQ9VW8uZGVmYXVsdCxxby5leHBvcnRzfSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW50ZXJhY3QubWluLmpzLm1hcFxuIiwiY2xhc3MgQWxidW0ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBleHRlcm5hbFVybDogc3RyaW5nO1xyXG4gIGNvbnN0cnVjdG9yIChuYW1lOiBzdHJpbmcsIGV4dGVybmFsVXJsOiBzdHJpbmcpIHtcclxuICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgIHRoaXMuZXh0ZXJuYWxVcmwgPSBleHRlcm5hbFVybFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQWxidW1cclxuIiwiY2xhc3MgQXN5bmNTZWxlY3Rpb25WZXJpZjxUPiB7XHJcbiAgcHJpdmF0ZSBfY3VyclNlbGVjdGVkVmFsOiBUIHwgbnVsbDtcclxuICBoYXNMb2FkZWRDdXJyU2VsZWN0ZWQ6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuX2N1cnJTZWxlY3RlZFZhbCA9IG51bGxcclxuXHJcbiAgICAvLyB1c2VkIHRvIGVuc3VyZSB0aGF0IGFuIG9iamVjdCB0aGF0IGhhcyBsb2FkZWQgd2lsbCBub3QgYmUgbG9hZGVkIGFnYWluXHJcbiAgICB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBnZXQgY3VyclNlbGVjdGVkVmFsTm9OdWxsICgpOiBUIHtcclxuICAgIGlmICghdGhpcy5fY3VyclNlbGVjdGVkVmFsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIGlzIGFjY2Vzc2VkIHdpdGhvdXQgYmVpbmcgYXNzaWduZWQnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2N1cnJTZWxlY3RlZFZhbFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnJTZWxlY3RlZFZhbCAoKTogVCB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnJTZWxlY3RlZFZhbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hhbmdlIHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGFuZCByZXNldCB0aGUgaGFzIGxvYWRlZCBib29sZWFuLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUfSBjdXJyU2VsZWN0ZWRWYWwgdGhlIHZhbHVlIHRvIGNoYW5nZSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIHRvby5cclxuICAgKi9cclxuICBzZWxlY3Rpb25DaGFuZ2VkIChjdXJyU2VsZWN0ZWRWYWw6IFQpIHtcclxuICAgIHRoaXMuX2N1cnJTZWxlY3RlZFZhbCA9IGN1cnJTZWxlY3RlZFZhbFxyXG4gICAgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRvIHNlZSBpZiBhIHNlbGVjdGVkIHZhbHVlIHBvc3QgbG9hZCBpcyB2YWxpZCBieVxyXG4gICAqIGNvbXBhcmluZyBpdCB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIGFuZCB2ZXJpZnlpbmcgdGhhdFxyXG4gICAqIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaGFzIG5vdCBhbHJlYWR5IGJlZW4gbG9hZGVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUfSBwb3N0TG9hZFZhbCBkYXRhIHRoYXQgaGFzIGJlZW4gbG9hZGVkXHJcbiAgICogQHJldHVybnMge0Jvb2xlYW59IHdoZXRoZXIgdGhlIGxvYWRlZCBzZWxlY3Rpb24gaXMgdmFsaWRcclxuICAgKi9cclxuICBpc1ZhbGlkIChwb3N0TG9hZFZhbDogVCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHRoaXMuX2N1cnJTZWxlY3RlZFZhbCAhPT0gcG9zdExvYWRWYWwgfHwgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBpZiBpcyB2YWxpZCB0aGVuIHdlIGFzc3VtZSB0aGF0IHRoaXMgdmFsdWUgd2lsbCBiZSBsb2FkZWRcclxuICAgICAgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQgPSB0cnVlXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBc3luY1NlbGVjdGlvblZlcmlmXHJcbiIsImltcG9ydCB7IGNvbmZpZywgaXNFbGxpcHNpc0FjdGl2ZSwgZ2V0VGV4dFdpZHRoIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYXJkQWN0aW9uc0hhbmRsZXIge1xyXG4gIHN0b3JlZFNlbEVsczogQXJyYXk8RWxlbWVudD47XHJcbiAgY3VyclNjcm9sbGluZ0FuaW06IEFuaW1hdGlvbiB8IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChtYXhMZW5ndGg6IG51bWJlcikge1xyXG4gICAgdGhpcy5zdG9yZWRTZWxFbHMgPSBuZXcgQXJyYXkobWF4TGVuZ3RoKVxyXG4gICAgdGhpcy5jdXJyU2Nyb2xsaW5nQW5pbSA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKiBNYW5hZ2VzIHNlbGVjdGluZyBhIGNhcmQgYW5kIGRlc2VsZWN0aW5nIHRoZSBwcmV2aW91cyBzZWxlY3RlZCBvbmVcclxuICAgKiB3aGVuIGEgY2FyZHMgb24gY2xpY2sgZXZlbnQgbGlzdGVuZXIgaXMgdHJpZ2dlcmVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBzZWxDYXJkRWwgLSB0aGUgY2FyZCB0aGF0IGV4ZWN1dGVkIHRoaXMgZnVuY3Rpb24gd2hlbiBjbGlja2VkXHJcbiAgICogQHBhcmFtIHtBcnJheTxDYXJkPn0gY29yck9iakxpc3QgLSB0aGUgbGlzdCBvZiBvYmplY3RzIHRoYXQgY29udGFpbnMgb25lIHRoYXQgY29ycm9zcG9uZHMgdG8gdGhlIHNlbGVjdGVkIGNhcmQsXHJcbiAgICogZWFjaCAqKipvYmplY3QgbXVzdCBoYXZlIHRoZSBjYXJkSWQgYXR0cmlidXRlLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gZnVuY3Rpb24gdG8gcnVuIHdoZW4gc2VsZWN0ZWQgb2JqZWN0IGhhcyBjaGFuZ2VkXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBhbGxvd1Vuc2VsU2VsZWN0ZWQgLSB3aGV0aGVyIHRvIGFsbG93IHVuc2VsZWN0aW5nIG9mIHRoZSBzZWxlY3RlZCBjYXJkIGJ5IGNsaWNraW5nIG9uIGl0IGFnYWluXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSB1bnNlbGVjdFByZXZpb3VzIC0gd2hldGhlciB0byB1bnNlbGVjdCB0aGUgcHJldmlvdXNseSBzZWxlY3RlZCBjYXJkXHJcbiAgICovXHJcbiAgb25DYXJkQ2xpY2sgKFxyXG4gICAgc2VsQ2FyZEVsOiBFbGVtZW50LFxyXG4gICAgY29yck9iakxpc3Q6IEFycmF5PENhcmQ+LFxyXG4gICAgY2FsbGJhY2s6IEZ1bmN0aW9uIHwgbnVsbCxcclxuICAgIGFsbG93VW5zZWxTZWxlY3RlZDogYm9vbGVhbiA9IGZhbHNlLFxyXG4gICAgdW5zZWxlY3RQcmV2aW91czogYm9vbGVhbiA9IHRydWVcclxuICApIHtcclxuICAgIC8vIGlmIHRoZSBzZWxlY3RlZCBjYXJkIGlzIHNlbGVjdGVkLCBhbmQgd2UgY2FuIHVuc2VsZWN0IGl0LCBkbyBzby5cclxuICAgIGlmICh0aGlzLnN0b3JlZFNlbEVscy5pbmNsdWRlcyhzZWxDYXJkRWwpKSB7XHJcbiAgICAgIGlmIChhbGxvd1Vuc2VsU2VsZWN0ZWQpIHtcclxuICAgICAgICBjb25zdCBzZWxDYXJkID0gdGhpcy5zdG9yZWRTZWxFbHNbdGhpcy5zdG9yZWRTZWxFbHMuaW5kZXhPZihzZWxDYXJkRWwpXVxyXG4gICAgICAgIHNlbENhcmQuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgICAgdGhpcy5zdG9yZWRTZWxFbHMuc3BsaWNlKHRoaXMuc3RvcmVkU2VsRWxzLmluZGV4T2Yoc2VsQ2FyZEVsKSwgMSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIGdldCBjb3Jyb3Nwb25kaW5nIG9iamVjdCB1c2luZyB0aGUgY2FyZEVsIGlkXHJcbiAgICBjb25zdCBzZWxPYmogPSBjb3JyT2JqTGlzdC5maW5kKCh4KSA9PiB7XHJcbiAgICAgIGNvbnN0IHhDYXJkID0geCBhcyBDYXJkXHJcbiAgICAgIHJldHVybiB4Q2FyZC5nZXRDYXJkSWQoKSA9PT0gc2VsQ2FyZEVsLmlkXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGVycm9yIGlmIHRoZXJlIGlzIG5vIGNvcnJvc3BvbmRpbmcgb2JqZWN0XHJcbiAgICBpZiAoIXNlbE9iaikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgYFRoZXJlIGlzIG5vIGNvcnJvc3BvbmRpbmcgb2JqZWN0IHRvIHRoZSBzZWxlY3RlZCBjYXJkLCBtZWFuaW5nIHRoZSBpZCBvZiB0aGUgY2FyZCBlbGVtZW50IFxcXHJcbiAgICAgIGRvZXMgbm90IG1hdGNoIGFueSBvZiB0aGUgY29ycm9zcG9uZGluZyAnY2FyZElkJyBhdHRyaWJ0dWVzLiBFbnN1cmUgdGhhdCB0aGUgY2FyZElkIGF0dHJpYnV0ZSBcXFxyXG4gICAgICBpcyBhc3NpZ25lZCBhcyB0aGUgY2FyZCBlbGVtZW50cyBIVE1MICdpZCcgd2hlbiB0aGUgY2FyZCBpcyBjcmVhdGVkLmBcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVuc2VsZWN0IHRoZSBwcmV2aW91c2x5IHNlbGVjdGVkIGNhcmQgaWYgaXQgZXhpc3RzIGFuZCBpZiB3ZSBhcmUgYWxsb3dlZCB0b29cclxuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnN0b3JlZFNlbEVscykubGVuZ3RoID4gMCAmJiB1bnNlbGVjdFByZXZpb3VzKSB7XHJcbiAgICAgIGNvbnN0IHN0b3JlZEVsID0gdGhpcy5zdG9yZWRTZWxFbHMucG9wKClcclxuICAgICAgaWYgKHN0b3JlZEVsICE9PSB1bmRlZmluZWQpIHsgc3RvcmVkRWwuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBvbiBjbGljayBhZGQgdGhlICdzZWxlY3RlZCcgY2xhc3Mgb250byB0aGUgZWxlbWVudCB3aGljaCBydW5zIGEgdHJhbnNpdGlvblxyXG4gICAgc2VsQ2FyZEVsLmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5zdG9yZWRTZWxFbHMucHVzaChzZWxDYXJkRWwpXHJcbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xyXG4gICAgICBjYWxsYmFjayhzZWxPYmopXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogTWFuYWdlcyBhZGRpbmcgY2VydGFpbiBwcm9wZXJ0aWVzIHJlYWx0aW5nIHRvIHNjcm9sbGluZyB0ZXh0IHdoZW4gZW50ZXJpbmdcclxuICAgKiBhIGNhcmQgZWxlbWVudC4gV2UgYXNzdW1lIHRoZXJlIGlzIG9ubHkgb25lIHNjcm9sbGluZyB0ZXh0IG9uIHRoZSBjYXJkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbnRlcmluZ0NhcmRFbCAtIGVsZW1lbnQgeW91IGFyZSBlbnRlcmluZywgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBzY3JvbGxUZXh0T25DYXJkRW50ZXIgKGVudGVyaW5nQ2FyZEVsOiBFbGVtZW50KSB7XHJcbiAgICBjb25zdCBzY3JvbGxpbmdUZXh0ID0gZW50ZXJpbmdDYXJkRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIClbMF0gYXMgSFRNTEVsZW1lbnRcclxuICAgIGNvbnN0IHBhcmVudCA9IHNjcm9sbGluZ1RleHQucGFyZW50RWxlbWVudFxyXG5cclxuICAgIGlmIChpc0VsbGlwc2lzQWN0aXZlKHNjcm9sbGluZ1RleHQpKSB7XHJcbiAgICAgIHBhcmVudD8uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsTGVmdClcclxuICAgICAgc2Nyb2xsaW5nVGV4dC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXApXHJcbiAgICAgIHRoaXMucnVuU2Nyb2xsaW5nVGV4dEFuaW0oc2Nyb2xsaW5nVGV4dCwgZW50ZXJpbmdDYXJkRWwpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogU3RhcnRzIHRvIHNjcm9sbCB0ZXh0IGZyb20gbGVmdCB0byByaWdodC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gc2Nyb2xsaW5nVGV4dCAtIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdGV4dCB0aGF0IHdpbGwgc2Nyb2xsXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBjYXJkRWwgLSBjYXJkIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBydW5TY3JvbGxpbmdUZXh0QW5pbSAoc2Nyb2xsaW5nVGV4dDogRWxlbWVudCwgY2FyZEVsOiBFbGVtZW50KSB7XHJcbiAgICBjb25zdCBMSU5HRVJfQU1UID0gMjBcclxuICAgIGNvbnN0IGZvbnQgPSB3aW5kb3dcclxuICAgICAgLmdldENvbXB1dGVkU3R5bGUoc2Nyb2xsaW5nVGV4dCwgbnVsbClcclxuICAgICAgLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQnKVxyXG5cclxuICAgIGlmIChzY3JvbGxpbmdUZXh0LnRleHRDb250ZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2Nyb2xsaW5nIHRleHQgZWxlbWVudCBkb2VzIG5vdCBjb250YWluIGFueSB0ZXh0IGNvbnRlbnQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdXJyU2Nyb2xsaW5nQW5pbSA9IHNjcm9sbGluZ1RleHQuYW5pbWF0ZShcclxuICAgICAgW1xyXG4gICAgICAgIC8vIGtleWZyYW1lc1xyXG4gICAgICAgIHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgwcHgpJyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZVgoJHtcclxuICAgICAgICAgICAgLWdldFRleHRXaWR0aChzY3JvbGxpbmdUZXh0LnRleHRDb250ZW50LCBmb250KSAtIExJTkdFUl9BTVRcclxuICAgICAgICAgIH1weClgXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICB7XHJcbiAgICAgICAgLy8gdGltaW5nIG9wdGlvbnNcclxuICAgICAgICBkdXJhdGlvbjogNTAwMCxcclxuICAgICAgICBpdGVyYXRpb25zOiAxXHJcbiAgICAgIH1cclxuICAgIClcclxuXHJcbiAgICB0aGlzLmN1cnJTY3JvbGxpbmdBbmltLm9uZmluaXNoID0gKCkgPT4gdGhpcy5zY3JvbGxUZXh0T25DYXJkTGVhdmUoY2FyZEVsKVxyXG4gIH1cclxuXHJcbiAgLyoqIE1hbmFnZXMgcmVtb3ZpbmcgY2VydGFpbiBwcm9wZXJ0aWVzIHJlbGF0aW5nIHRvIHNjcm9sbGluZyB0ZXh0IG9uY2UgbGVhdmluZ1xyXG4gICAqIGEgY2FyZCBlbGVtZW50LiBXZSBhc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgc2Nyb2xsaW5nIHRleHQgb24gdGhlIGNhcmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0hUTUx9IGxlYXZpbmdDYXJkRWwgLSBlbGVtZW50IHlvdSBhcmUgbGVhdmluZywgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBzY3JvbGxUZXh0T25DYXJkTGVhdmUgKGxlYXZpbmdDYXJkRWw6IEVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHNjcm9sbGluZ1RleHQgPSBsZWF2aW5nQ2FyZEVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxpbmdUZXh0XHJcbiAgICApWzBdXHJcbiAgICBjb25zdCBwYXJlbnQgPSBzY3JvbGxpbmdUZXh0LnBhcmVudEVsZW1lbnRcclxuXHJcbiAgICBwYXJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbExlZnQpXHJcbiAgICBzY3JvbGxpbmdUZXh0LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcClcclxuICAgIHRoaXMuY3VyclNjcm9sbGluZ0FuaW0/LmNhbmNlbCgpXHJcbiAgfVxyXG5cclxuICBjbGVhclNlbGVjdGVkRWxzICgpIHtcclxuICAgIHRoaXMuc3RvcmVkU2VsRWxzLnNwbGljZSgwLCB0aGlzLnN0b3JlZFNlbEVscy5sZW5ndGgpXHJcbiAgfVxyXG5cclxuICBhZGRBbGxFdmVudExpc3RlbmVycyAoXHJcbiAgICBjYXJkczogQXJyYXk8RWxlbWVudD4sXHJcbiAgICBvYmpBcnI6IEFycmF5PENhcmQ+LFxyXG4gICAgY2xpY2tDYWxsQmFjazogbnVsbCB8ICgoc2VsT2JqOiB1bmtub3duKSA9PiB2b2lkKSxcclxuICAgIGFsbG93VW5zZWxlY3RlZDogYm9vbGVhbixcclxuICAgIHVuc2VsZWN0UHJldmlvdXM6IGJvb2xlYW5cclxuICApIHtcclxuICAgIHRoaXMuY2xlYXJTZWxlY3RlZEVscygpXHJcblxyXG4gICAgY2FyZHMuZm9yRWFjaCgodHJhY2tDYXJkKSA9PiB7XHJcbiAgICAgIHRyYWNrQ2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldnQpID0+IHtcclxuICAgICAgICBpZiAoKGV2dCEudGFyZ2V0IGFzIEhUTUxFbGVtZW50KT8uZ2V0QXR0cmlidXRlKCdkYXRhLXJlc3RyaWN0LWZsaXAtb24tY2xpY2snKSkge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub25DYXJkQ2xpY2soXHJcbiAgICAgICAgICB0cmFja0NhcmQsXHJcbiAgICAgICAgICBvYmpBcnIsXHJcbiAgICAgICAgICBjbGlja0NhbGxCYWNrLFxyXG4gICAgICAgICAgYWxsb3dVbnNlbGVjdGVkLFxyXG4gICAgICAgICAgdW5zZWxlY3RQcmV2aW91c1xyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgICApXHJcbiAgICAgIHRyYWNrQ2FyZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsVGV4dE9uQ2FyZEVudGVyKHRyYWNrQ2FyZClcclxuICAgICAgfSlcclxuICAgICAgdHJhY2tDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxUZXh0T25DYXJkTGVhdmUodHJhY2tDYXJkKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuIiwiY2xhc3MgQ2FyZCB7XHJcbiAgY2FyZElkOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuY2FyZElkID0gJydcclxuICB9XHJcblxyXG4gIGdldENhcmRJZCAoKSB7XHJcbiAgICBpZiAodGhpcy5jYXJkSWQgPT09ICdudWxsJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhcmQgaWQgd2FzIGFza2luZyB0byBiZSByZXRyaWV2ZWQgYnV0IGlzIG51bGwnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY2FyZElkXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYXJkXHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAwOSBOaWNob2xhcyBDLiBaYWthcy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gKi9cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIG5vZGUgaW4gYSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcbiAgZGF0YTogVDtcclxuICBuZXh0OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuICBwcmV2aW91czogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG91Ymx5TGlua2VkTGlzdE5vZGUuXHJcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIHN0b3JlIGluIHRoZSBub2RlLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yIChkYXRhOiBUKSB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkYXRhIHRoYXQgdGhpcyBub2RlIHN0b3Jlcy5cclxuICAgICAqIEBwcm9wZXJ0eSBkYXRhXHJcbiAgICAgKiBAdHlwZSAqXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZGF0YSA9IGRhdGFcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcG9pbnRlciB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gICAgICogQHByb3BlcnR5IG5leHRcclxuICAgICAqIEB0eXBlID9Eb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gICAgICovXHJcbiAgICB0aGlzLm5leHQgPSBudWxsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIHByZXZpb3VzIG5vZGUgaW4gdGhlIERvdWJseUxpbmtlZExpc3QuXHJcbiAgICAgKiBAcHJvcGVydHkgcHJldmlvdXNcclxuICAgICAqIEB0eXBlID9Eb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnByZXZpb3VzID0gbnVsbFxyXG4gIH1cclxufVxyXG4vKipcclxuICogQSBkb3VibHkgbGlua2VkIGxpc3QgaW1wbGVtZW50YXRpb24gaW4gSmF2YVNjcmlwdC5cclxuICogQGNsYXNzIERvdWJseUxpbmtlZExpc3RcclxuICovXHJcbmNsYXNzIERvdWJseUxpbmtlZExpc3Q8VD4ge1xyXG4gIGhlYWQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIHRhaWw6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG91Ymx5TGlua2VkTGlzdFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIC8vIHBvaW50ZXIgdG8gZmlyc3Qgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgdGhpcy5oZWFkID0gbnVsbFxyXG5cclxuICAgIC8vIHBvaW50ZXIgdG8gbGFzdCBub2RlIGluIHRoZSBsaXN0IHdoaWNoIHBvaW50cyB0byBudWxsXHJcbiAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmRzIHNvbWUgZGF0YSB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7VH0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICovXHJcbiAgYWRkIChkYXRhOiBUKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPihkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEJlY2F1c2UgdGhlcmUgYXJlIG5vIG5vZGVzIGluIHRoZSBsaXN0LCBqdXN0IHNldCB0aGVcclxuICAgICAgICogYHRoaXMuaGVhZGAgcG9pbnRlciB0byB0aGUgbmV3IG5vZGUuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBVbmxpa2UgaW4gYSBzaW5nbHkgbGlua2VkIGxpc3QsIHdlIGhhdmUgYSBkaXJlY3QgcmVmZXJlbmNlIHRvXHJcbiAgICAgICAqIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFNldCB0aGUgYG5leHRgIHBvaW50ZXIgb2YgdGhlXHJcbiAgICAgICAqIGN1cnJlbnQgbGFzdCBub2RlIHRvIGBuZXdOb2RlYCBpbiBvcmRlciB0byBhcHBlbmQgdGhlIG5ldyBkYXRhXHJcbiAgICAgICAqIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuIFRoZW4sIHNldCBgbmV3Tm9kZS5wcmV2aW91c2AgdG8gdGhlIGN1cnJlbnRcclxuICAgICAgICogdGFpbCB0byBlbnN1cmUgYmFja3dhcmRzIHRyYWNraW5nIHdvcmsuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAodGhpcy50YWlsICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50YWlsLm5leHQgPSBuZXdOb2RlXHJcbiAgICAgIH1cclxuICAgICAgbmV3Tm9kZS5wcmV2aW91cyA9IHRoaXMudGFpbFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBMYXN0LCByZXNldCBgdGhpcy50YWlsYCB0byBgbmV3Tm9kZWAgdG8gZW5zdXJlIHdlIGFyZSBzdGlsbFxyXG4gICAgICogdHJhY2tpbmcgdGhlIGxhc3Qgbm9kZSBjb3JyZWN0bHkuXHJcbiAgICAgKi9cclxuICAgIHRoaXMudGFpbCA9IG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc2VydHMgc29tZSBkYXRhIGludG8gdGhlIG1pZGRsZSBvZiB0aGUgbGlzdC4gVGhpcyBtZXRob2QgdHJhdmVyc2VzXHJcbiAgICogdGhlIGV4aXN0aW5nIGxpc3QgYW5kIHBsYWNlcyB0aGUgZGF0YSBpbiBhIG5ldyBub2RlIGF0IGEgc3BlY2lmaWMgaW5kZXguXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSBkYXRhLlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIHRoZSBpbmRleCBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGluc2VydEJlZm9yZSAoZGF0YTogVCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGUoZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogU3BlY2lhbCBjYXNlOiBpZiBgaW5kZXhgIGlzIGAwYCwgdGhlbiBubyB0cmF2ZXJzYWwgaXMgbmVlZGVkXHJcbiAgICAgKiBhbmQgd2UgbmVlZCB0byB1cGRhdGUgYHRoaXMuaGVhZGAgdG8gcG9pbnQgdG8gYG5ld05vZGVgLlxyXG4gICAgICovXHJcbiAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgLypcclxuICAgICAgICogRW5zdXJlIHRoZSBuZXcgbm9kZSdzIGBuZXh0YCBwcm9wZXJ0eSBpcyBwb2ludGVkIHRvIHRoZSBjdXJyZW50XHJcbiAgICAgICAqIGhlYWQuXHJcbiAgICAgICAqL1xyXG4gICAgICBuZXdOb2RlLm5leHQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBjdXJyZW50IGhlYWQncyBgcHJldmlvdXNgIHByb3BlcnR5IG5lZWRzIHRvIHBvaW50IHRvIHRoZSBuZXdcclxuICAgICAgICogbm9kZSB0byBlbnN1cmUgdGhlIGxpc3QgaXMgdHJhdmVyc2FibGUgYmFja3dhcmRzLlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbmV3Tm9kZVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogTm93IGl0J3Mgc2FmZSB0byBzZXQgYHRoaXMuaGVhZGAgdG8gdGhlIG5ldyBub2RlLCBlZmZlY3RpdmVseVxyXG4gICAgICAgKiBtYWtpbmcgdGhlIG5ldyBub2RlIHRoZSBmaXJzdCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAgICogdXNlZCBpbnNpZGUgb2YgdGhlIGxvb3AgYmVsb3cuIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG9cclxuICAgICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICAgKiBnb25lLiBUaGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gaW5zZXJ0IGludG8uXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHVzaW5nIGBuZXh0YCBwb2ludGVycywgYW5kIG1ha2VcclxuICAgICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkLiBXaGVuXHJcbiAgICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAgICogaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAgICovXHJcbiAgICAgIHdoaWxlIChjdXJyZW50Lm5leHQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgaXMgZWl0aGVyIHRoZSBub2RlIHRvIGluc2VydCB0aGUgbmV3IGRhdGFcclxuICAgICAgICogYmVmb3JlLCBvciB0aGUgbGFzdCBub2RlIGluIHRoZSBsaXN0LiBUaGUgb25seSB3YXkgdG8gdGVsbCBpcyBpZlxyXG4gICAgICAgKiBgaWAgaXMgc3RpbGwgbGVzcyB0aGFuIGBpbmRleGAsIHRoYXQgbWVhbnMgdGhlIGluZGV4IGlzIG91dCBvZiByYW5nZVxyXG4gICAgICAgKiBhbmQgYW4gZXJyb3Igc2hvdWxkIGJlIHRocm93bi5cclxuICAgICAgICovXHJcbiAgICAgIGlmIChpIDwgaW5kZXgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogSWYgY29kZSBjb250aW51ZXMgdG8gZXhlY3V0ZSBoZXJlLCBpdCBtZWFucyBgY3VycmVudGAgaXMgdGhlIG5vZGVcclxuICAgICAgICogdG8gaW5zZXJ0IG5ldyBkYXRhIGJlZm9yZS5cclxuICAgICAgICpcclxuICAgICAgICogRmlyc3QsIGluc2VydCBgbmV3Tm9kZWAgYWZ0ZXIgYGN1cnJlbnQucHJldmlvdXNgIGJ5IHVwZGF0aW5nXHJcbiAgICAgICAqIGBjdXJyZW50LnByZXZpb3VzLm5leHRgIGFuZCBgbmV3Tm9kZS5wcmV2aW91c2AuXHJcbiAgICAgICAqL1xyXG4gICAgICBjdXJyZW50IS5wcmV2aW91cyEubmV4dCA9IG5ld05vZGVcclxuICAgICAgbmV3Tm9kZSEucHJldmlvdXMgPSBjdXJyZW50LnByZXZpb3VzXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBOZXh0LCBpbnNlcnQgYGN1cnJlbnRgIGFmdGVyIGBuZXdOb2RlYCBieSB1cGRhdGluZyBgbmV3Tm9kZS5uZXh0YCBhbmRcclxuICAgICAgICogYGN1cnJlbnQucHJldmlvdXNgLlxyXG4gICAgICAgKi9cclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gY3VycmVudFxyXG4gICAgICBjdXJyZW50LnByZXZpb3VzID0gbmV3Tm9kZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBzb21lIGRhdGEgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBsaXN0LiBUaGlzIG1ldGhvZCB0cmF2ZXJzZXNcclxuICAgKiB0aGUgZXhpc3RpbmcgbGlzdCBhbmQgcGxhY2VzIHRoZSBkYXRhIGluIGEgbmV3IG5vZGUgYWZ0ZXIgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBhZnRlciB3aGljaCB0byBpbnNlcnQgdGhlIGRhdGEuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGluZGV4IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgaW5zZXJ0QWZ0ZXIgKGRhdGE6IFQsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlKGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAqL1xyXG4gICAgbGV0IGkgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHNpbWlsYXIgdG8gdGhlIGBhZGQoKWAgbWV0aG9kLCBidXQgbWFrZVxyXG4gICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGVcclxuICAgICAqIHRoZSBgcHJldmlvdXNgIHBvaW50ZXIgaW4gYWRkaXRpb24gdG8gYGN1cnJlbnRgLiBXaGVuXHJcbiAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgKiBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIGlzIGVpdGhlciB0aGUgbm9kZSB0byBpbnNlcnQgdGhlIG5ldyBkYXRhXHJcbiAgICAgKiBiZWZvcmUsIG9yIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFRoZSBvbmx5IHdheSB0byB0ZWxsIGlzIGlmXHJcbiAgICAgKiBgaWAgaXMgc3RpbGwgbGVzcyB0aGFuIGBpbmRleGAsIHRoYXQgbWVhbnMgdGhlIGluZGV4IGlzIG91dCBvZiByYW5nZVxyXG4gICAgICogYW5kIGFuIGVycm9yIHNob3VsZCBiZSB0aHJvd24uXHJcbiAgICAgKi9cclxuICAgIGlmIChpIDwgaW5kZXgpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGNvZGUgY29udGludWVzIHRvIGV4ZWN1dGUgaGVyZSwgaXQgbWVhbnMgYGN1cnJlbnRgIGlzIHRoZSBub2RlXHJcbiAgICAgKiB0byBpbnNlcnQgbmV3IGRhdGEgYWZ0ZXIuXHJcbiAgICAgKi9cclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IGBjdXJyZW50YCBpcyB0aGUgdGFpbCwgc28gcmVzZXQgYHRoaXMudGFpbGBcclxuICAgIGlmICh0aGlzLnRhaWwgPT09IGN1cnJlbnQpIHtcclxuICAgICAgdGhpcy50YWlsID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogT3RoZXJ3aXNlLCBpbnNlcnQgYG5ld05vZGVgIGJlZm9yZSBgY3VycmVudC5uZXh0YCBieSB1cGRhdGluZ1xyXG4gICAgICAgKiBgY3VycmVudC5uZXh0LnByZXZpb3VzYCBhbmQgYG5ld05vZGUubm9kZWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IG5ld05vZGVcclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gY3VycmVudCEubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBOZXh0LCBpbnNlcnQgYG5ld05vZGVgIGFmdGVyIGBjdXJyZW50YCBieSB1cGRhdGluZyBgbmV3Tm9kZS5wcmV2aW91c2AgYW5kXHJcbiAgICAgKiBgY3VycmVudC5uZXh0YC5cclxuICAgICAqL1xyXG4gICAgbmV3Tm9kZS5wcmV2aW91cyA9IGN1cnJlbnRcclxuICAgIGN1cnJlbnQhLm5leHQgPSBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIGRhdGEgaW4gdGhlIGdpdmVuIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgbm9kZSB3aG9zZSBkYXRhXHJcbiAgICogICAgICBzaG91bGQgYmUgcmV0dXJuZWQuXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBkYXRhIGluIHRoZSBcImRhdGFcIiBwb3J0aW9uIG9mIHRoZSBnaXZlbiBub2RlXHJcbiAgICogICAgICBvciB1bmRlZmluZWQgaWYgdGhlIG5vZGUgZG9lc24ndCBleGlzdC5cclxuICAgKi9cclxuICBnZXQgKGluZGV4OiBudW1iZXIsIGFzTm9kZTogYm9vbGVhbik6IFQgfCBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcbiAgICAvLyBlbnN1cmUgYGluZGV4YCBpcyBhIHBvc2l0aXZlIHZhbHVlXHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBpID0gMFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMsIGJ1dCBtYWtlIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueVxyXG4gICAgICAgKiBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZCBhbmQgdXBkYXRlIHRoZSBgcHJldmlvdXNgIHBvaW50ZXIgaW5cclxuICAgICAgICogYWRkaXRpb24gdG8gYGN1cnJlbnRgLiBXaGVuIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFuc1xyXG4gICAgICAgKiB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAgICovXHJcbiAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgICAgICBpKytcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIG1pZ2h0IGJlIG51bGwgaWYgd2UndmUgZ29uZSBwYXN0IHRoZVxyXG4gICAgICAgKiBlbmQgb2YgdGhlIGxpc3QuIEluIHRoYXQgY2FzZSwgd2UgcmV0dXJuIGB1bmRlZmluZWRgIHRvIGluZGljYXRlXHJcbiAgICAgICAqIHRoYXQgdGhlIG5vZGUgYXQgYGluZGV4YCB3YXMgbm90IGZvdW5kLiBJZiBgY3VycmVudGAgaXMgbm90XHJcbiAgICAgICAqIGBudWxsYCwgdGhlbiBpdCdzIHNhZmUgdG8gcmV0dXJuIGBjdXJyZW50LmRhdGFgLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgICBpZiAoYXNOb2RlKSB7XHJcbiAgICAgICAgICByZXR1cm4gY3VycmVudFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbmRleCAke2luZGV4fSBvdXQgb2YgcmFuZ2VgKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW5kZXggJHtpbmRleH0gb3V0IG9mIHJhbmdlYClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgaW5kZXggb2YgdGhlIGRhdGEgaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIHNlYXJjaCBmb3IuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZGF0YSBpbiB0aGUgbGlzdFxyXG4gICAqICAgICAgb3IgLTEgaWYgbm90IGZvdW5kLlxyXG4gICAqL1xyXG4gIGluZGV4T2YgKGRhdGE6IFQpOiBudW1iZXIge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaW5kZXhgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkXHJcbiAgICAgKiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgaW5kZXggPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzIGBkYXRhYC5cclxuICAgICAqIElmIGEgbWF0Y2ggaXMgZm91bmQsIGl0IHJldHVybnMgYGluZGV4YCBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKGN1cnJlbnQuZGF0YSA9PT0gZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hlcmUgd2UgYXJlXHJcbiAgICAgIGluZGV4KytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiAtMSBhcyB0aGUgXCJub3QgZm91bmRcIiB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgcmV0dXJuIC0xXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBpdGVtIHRoYXQgbWF0Y2hlcyBhIGdpdmVuIGZ1bmN0aW9uLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1hdGNoZXIgQSBmdW5jdGlvbiByZXR1cm5pbmcgdHJ1ZSB3aGVuIGFuIGl0ZW0gbWF0Y2hlc1xyXG4gICAqICAgICAgYW5kIGZhbHNlIHdoZW4gYW4gaXRlbSBkb2Vzbid0IG1hdGNoLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZmlyc3QgaXRlbSB0aGF0IHJldHVybnMgdHJ1ZSBmcm9tIHRoZSBtYXRjaGVyLCB1bmRlZmluZWRcclxuICAgKiAgICAgIGlmIG5vIGl0ZW1zIG1hdGNoLlxyXG4gICAqL1xyXG4gIGZpbmQgKG1hdGNoZXI6IChhcmcwOiBUKSA9PiBib29sZWFuLCBhc05vZGUgPSBmYWxzZSkgOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IFQge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGlzIGxvb3AgY2hlY2tzIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCB0byBzZWUgaWYgaXQgbWF0Y2hlcy5cclxuICAgICAqIElmIGEgbWF0Y2ggaXMgZm91bmQsIGl0IHJldHVybnMgdGhlIGRhdGEgaW1tZWRpYXRlbHksIGV4aXRpbmcgdGhlXHJcbiAgICAgKiBsb29wIGJlY2F1c2UgdGhlcmUncyBubyByZWFzb24gdG8ga2VlcCBzZWFyY2hpbmcuIFRoZSBzZWFyY2hcclxuICAgICAqIGNvbnRpbnVlcyB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBub2RlcyB0byBzZWFyY2ggKHdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCkuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGlmIChtYXRjaGVyKGN1cnJlbnQuZGF0YSkpIHtcclxuICAgICAgICBpZiAoYXNOb2RlKSB7XHJcbiAgICAgICAgICByZXR1cm4gY3VycmVudFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIGB1bmRlZmluZWRgIGFzIHRoZVxyXG4gICAgICogXCJub3QgZm91bmRcIiB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ05vIG1hdGNoaW5nIGRhdGEgZm91bmQnKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWF0Y2hlciBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIHdoZW4gYW4gaXRlbSBtYXRjaGVzXHJcbiAgICogICAgICBhbmQgZmFsc2Ugd2hlbiBhbiBpdGVtIGRvZXNuJ3QgbWF0Y2guXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpdGVtIHRoYXQgbWF0Y2hlcyBhIGdpdmVuIGZ1bmN0aW9uXHJcbiAgICogICAgICBvciAtMSBpZiB0aGVyZSBhcmUgbm8gbWF0Y2hpbmcgaXRlbXMuXHJcbiAgICovXHJcbiAgZmluZEluZGV4IChtYXRjaGVyOiAoYXJnMDogVCkgPT4gYm9vbGVhbik6IG51bWJlciB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaW5kZXhgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkXHJcbiAgICAgKiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgaW5kZXggPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgaW5kZXggaW1tZWRpYXRlbHksIGV4aXRpbmcgdGhlXHJcbiAgICAgKiBsb29wIGJlY2F1c2UgdGhlcmUncyBubyByZWFzb24gdG8ga2VlcCBzZWFyY2hpbmcuIFRoZSBzZWFyY2hcclxuICAgICAqIGNvbnRpbnVlcyB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBub2RlcyB0byBzZWFyY2ggKHdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCkuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGlmIChtYXRjaGVyKGN1cnJlbnQuZGF0YSkpIHtcclxuICAgICAgICByZXR1cm4gaW5kZXhcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvLyBrZWVwIHRyYWNrIG9mIHdoZXJlIHdlIGFyZVxyXG4gICAgICBpbmRleCsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gLTEgYXMgdGhlXHJcbiAgICAgKiBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gLTFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIG5vZGUgZnJvbSB0aGUgZ2l2ZW4gbG9jYXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBub2RlIHRvIHJlbW92ZS5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGRhdGEgaW4gdGhlIGdpdmVuIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIGluZGV4IGlzIG91dCBvZiByYW5nZS5cclxuICAgKi9cclxuICByZW1vdmUgKGluZGV4OiBudW1iZXIpIDogVCB7XHJcbiAgICAvLyBzcGVjaWFsIGNhc2VzOiBubyBub2RlcyBpbiB0aGUgbGlzdCBvciBgaW5kZXhgIGlzIG5lZ2F0aXZlXHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsIHx8IGluZGV4IDwgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IHJlbW92aW5nIHRoZSBmaXJzdCBub2RlXHJcbiAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgLy8gc3RvcmUgdGhlIGRhdGEgZnJvbSB0aGUgY3VycmVudCBoZWFkXHJcbiAgICAgIGNvbnN0IGRhdGE6IFQgPSB0aGlzLmhlYWQuZGF0YVxyXG5cclxuICAgICAgLy8ganVzdCByZXBsYWNlIHRoZSBoZWFkIHdpdGggdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICB0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV4dFxyXG5cclxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiB0aGVyZSB3YXMgb25seSBvbmUgbm9kZSwgc28gYWxzbyByZXNldCBgdGhpcy50YWlsYFxyXG4gICAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50YWlsID0gbnVsbFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaGVhZC5wcmV2aW91cyA9IG51bGxcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHRoZSBkYXRhIGF0IHRoZSBwcmV2aW91cyBoZWFkIG9mIHRoZSBsaXN0XHJcbiAgICAgIHJldHVybiBkYXRhXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgbGV0IGkgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHNpbWlsYXIgdG8gdGhlIGBnZXQoKWAgbWV0aG9kLCBidXQgbWFrZVxyXG4gICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkLiBXaGVuXHJcbiAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgKiByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGluY3JlbWVudCB0aGUgY291bnRcclxuICAgICAgaSsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGBjdXJyZW50YCBpc24ndCBgbnVsbGAsIHRoZW4gdGhhdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbm9kZVxyXG4gICAgICogdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBza2lwIG92ZXIgdGhlIG5vZGUgdG8gcmVtb3ZlXHJcbiAgICAgIGN1cnJlbnQhLnByZXZpb3VzIS5uZXh0ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBJZiB3ZSBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdCwgdGhlbiB1cGRhdGUgYHRoaXMudGFpbGAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIElmIHdlIGFyZSBub3QgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdCwgdGhlbiB1cGRhdGUgdGhlIGJhY2t3YXJkc1xyXG4gICAgICAgKiBwb2ludGVyIGZvciBgY3VycmVudC5uZXh0YCB0byBwcmVzZXJ2ZSByZXZlcnNlIHRyYXZlcnNhbC5cclxuICAgICAgICovXHJcbiAgICAgIGlmICh0aGlzLnRhaWwgPT09IGN1cnJlbnQpIHtcclxuICAgICAgICB0aGlzLnRhaWwgPSBjdXJyZW50LnByZXZpb3VzXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VycmVudCEubmV4dCEucHJldmlvdXMgPSBjdXJyZW50LnByZXZpb3VzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJldHVybiB0aGUgdmFsdWUgdGhhdCB3YXMganVzdCByZW1vdmVkIGZyb20gdGhlIGxpc3RcclxuICAgICAgcmV0dXJuIGN1cnJlbnQuZGF0YVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiB3ZSd2ZSBtYWRlIGl0IHRoaXMgZmFyLCBpdCBtZWFucyBgaW5kZXhgIGlzIGEgdmFsdWUgdGhhdFxyXG4gICAgICogZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdCwgc28gdGhyb3cgYW4gZXJyb3IuXHJcbiAgICAgKi9cclxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgbm9kZXMgZnJvbSB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKi9cclxuICBjbGVhciAoKTogdm9pZCB7XHJcbiAgICAvLyBqdXN0IHJlc2V0IGJvdGggdGhlIGhlYWQgYW5kIHRhaWwgcG9pbnRlciB0byBudWxsXHJcbiAgICB0aGlzLmhlYWQgPSBudWxsXHJcbiAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIG51bWJlciBvZiBub2RlcyBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBnZXQgc2l6ZSAoKTogbnVtYmVyIHtcclxuICAgIC8vIHNwZWNpYWwgY2FzZTogdGhlIGxpc3QgaXMgZW1wdHlcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIDBcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjb3VudGAgdmFyaWFibGUgaXMgdXNlZCB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmVcclxuICAgICAqIGJlZW4gdmlzaXRlZCBpbnNpZGUgdGhlIGxvb3AgYmVsb3cuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdGhpc1xyXG4gICAgICogaXMgdGhlIHZhbHVlIHRvIHJldHVybiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgY291bnQgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoYXQgbWVhbnMgd2UncmUgbm90IHlldCBhdCB0aGVcclxuICAgICAqIGVuZCBvZiB0aGUgbGlzdCwgc28gYWRkaW5nIDEgdG8gYGNvdW50YCBhbmQgdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgY291bnQrK1xyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCwgdGhlIGxvb3AgaXMgZXhpdGVkIGF0IHRoZSB2YWx1ZSBvZiBgY291bnRgXHJcbiAgICAgKiBpcyB0aGUgbnVtYmVyIG9mIG5vZGVzIHRoYXQgd2VyZSBjb3VudGVkIGluIHRoZSBsb29wLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gY291bnRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkZWZhdWx0IGl0ZXJhdG9yIGZvciB0aGUgY2xhc3MuXHJcbiAgICogQHJldHVybnMge0l0ZXJhdG9yfSBBbiBpdGVyYXRvciBmb3IgdGhlIGNsYXNzLlxyXG4gICAqL1xyXG4gIFtTeW1ib2wuaXRlcmF0b3JdICgpIHtcclxuICAgIHJldHVybiB0aGlzLnZhbHVlcygpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gaXRlcmF0b3IgdGhhdCByZXR1cm5zIGVhY2ggbm9kZSBpbiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7R2VuZXJhdG9yfSBBbiBpdGVyYXRvciBvbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICAqIHZhbHVlcyAoKTogR2VuZXJhdG9yPFQsIHZvaWQsIHVua25vd24+IHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhlcmUgaXMgYSBwaWVjZSBvZiBkYXRhXHJcbiAgICAgKiB0byB5aWVsZC5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgeWllbGQgY3VycmVudC5kYXRhXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpdGVyYXRvciB0aGF0IHJldHVybnMgZWFjaCBub2RlIGluIHRoZSBsaXN0IGluIHJldmVyc2Ugb3JkZXIuXHJcbiAgICogQHJldHVybnMge0dlbmVyYXRvcn0gQW4gaXRlcmF0b3Igb24gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgKiByZXZlcnNlICgpOiBHZW5lcmF0b3I8VCwgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSB0YWlsIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMudGFpbFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGVyZSBpcyBhIHBpZWNlIG9mIGRhdGFcclxuICAgICAqIHRvIHlpZWxkLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICB5aWVsZCBjdXJyZW50LmRhdGFcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoZSBsaXN0IGludG8gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXHJcbiAgICogQHJldHVybnMge3N0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgdG9TdHJpbmcgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gWy4uLnRoaXNdLnRvU3RyaW5nKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoZSBkb3VibHkgbGlua2VkIGxpc3QgdG8gYW4gYXJyYXkuXHJcbiAgICogQHJldHVybnMge0FycmF5PFQ+fSBBbiBhcnJheSBvZiB0aGUgZGF0YSBmcm9tIHRoZSBsaW5rZWQgbGlzdC5cclxuICAgKi9cclxuICB0b0FycmF5ICgpOiBBcnJheTxUPiB7XHJcbiAgICByZXR1cm4gWy4uLnRoaXNdXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEb3VibHlMaW5rZWRMaXN0XHJcbmV4cG9ydCBmdW5jdGlvblxyXG5hcnJheVRvRG91Ymx5TGlua2VkTGlzdCA8VD4gKGFycjogQXJyYXk8VD4pIHtcclxuICBjb25zdCBsaXN0ID0gbmV3IERvdWJseUxpbmtlZExpc3Q8VD4oKVxyXG4gIGFyci5mb3JFYWNoKChkYXRhKSA9PiB7XHJcbiAgICBsaXN0LmFkZChkYXRhKVxyXG4gIH0pXHJcblxyXG4gIHJldHVybiBsaXN0XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgcHJvbWlzZUhhbmRsZXIsXHJcbiAgbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyxcclxuICBodG1sVG9FbCxcclxuICBzaHVmZmxlXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgeyBhcnJheVRvRG91Ymx5TGlua2VkTGlzdCwgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IFBsYXlhYmxlRXZlbnRBcmcgZnJvbSAnLi9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MnXHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnXHJcbmltcG9ydCBFdmVudEFnZ3JlZ2F0b3IgZnJvbSAnLi9wdWJzdWIvYWdncmVnYXRvcidcclxuaW1wb3J0IHsgSVBsYXlhYmxlIH0gZnJvbSAnLi4vLi4vdHlwZXMnXHJcbmltcG9ydCBTcG90aWZ5UGxheWJhY2tFbGVtZW50IGZyb20gJy4vc3BvdGlmeS1wbGF5YmFjay1lbGVtZW50J1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZFZvbHVtZSAoKSB7XHJcbiAgY29uc3QgeyByZXMsIGVyciB9ID0gYXdhaXQgcHJvbWlzZUhhbmRsZXIoYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldFBsYXllclZvbHVtZURhdGEpKVxyXG5cclxuICBpZiAoZXJyKSB7XHJcbiAgICByZXR1cm4gMFxyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gcmVzIS5kYXRhXHJcbiAgfVxyXG59XHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVWb2x1bWUgKHZvbHVtZTogc3RyaW5nKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXllclZvbHVtZURhdGEodm9sdW1lKSkpXHJcbn1cclxuZXhwb3J0IGNvbnN0IHBsYXllclB1YmxpY1ZhcnMgPSB7XHJcbiAgaXNTaHVmZmxlOiBmYWxzZVxyXG59XHJcbmNsYXNzIFNwb3RpZnlQbGF5YmFjayB7XHJcbiAgcHJpdmF0ZSBwbGF5ZXI6IGFueTtcclxuICAvLyBjb250cm9scyB0aW1pbmcgb2YgYXN5bmMgYWN0aW9ucyB3aGVuIHdvcmtpbmcgd2l0aCB3ZWJwbGF5ZXIgc2RrXHJcbiAgcHJpdmF0ZSBpc0V4ZWN1dGluZ0FjdGlvbjogYm9vbGVhbjtcclxuICBwcml2YXRlIGRldmljZV9pZDogc3RyaW5nO1xyXG4gIHB1YmxpYyBzZWxQbGF5aW5nOiB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwgfCBFbGVtZW50XHJcbiAgICAgIHRyYWNrX3VyaTogc3RyaW5nXHJcbiAgICAgIC8vIHRoaXMgbm9kZSBtYXkgYmUgYSBzaHVmZmxlZCBvciB1bnNodWZmbGVkIG5vZGVcclxuICAgICAgcGxheWFibGVOb2RlOiBudWxsIHwgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgICAvLyB0aGlzIGFycmF5IGlzIGFsd2F5cyBpbiBzdGFuZGFyZCBvcmRlciBhbmQgbmV2ZXIgc2h1ZmZsZWQuXHJcbiAgICAgIHBsYXlhYmxlQXJyOiBudWxsIHwgQXJyYXk8SVBsYXlhYmxlPlxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTdGF0ZUludGVydmFsOiBOb2RlSlMuVGltZW91dCB8IG51bGw7XHJcbiAgcHJpdmF0ZSB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudDtcclxuICBwcml2YXRlIHBsYXllcklzUmVhZHk6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSB3YXNJblNodWZmbGUgPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICB0aGlzLnBsYXllciA9IG51bGxcclxuICAgIHRoaXMuZGV2aWNlX2lkID0gJydcclxuICAgIHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCA9IG51bGxcclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcgPSB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgIHRyYWNrX3VyaTogJycsXHJcbiAgICAgIHBsYXlhYmxlTm9kZTogbnVsbCxcclxuICAgICAgcGxheWFibGVBcnI6IG51bGxcclxuICAgIH1cclxuICAgIHRoaXMucGxheWVySXNSZWFkeSA9IGZhbHNlXHJcbiAgICB0aGlzLl9sb2FkV2ViUGxheWVyKClcclxuXHJcbiAgICAvLyBwYXNzIGl0IHRoZSBcInRoaXMuXCIgYXR0cmlidXRlcyBpbiB0aGlzIHNjb3BlIGJlY2F1c2Ugd2hlbiBhIGZ1bmN0aW9uIGlzIGNhbGxlZCBmcm9tIGEgZGlmZmVyZW50IGNsYXNzIHRoZSBcInRoaXMuXCIgYXR0cmlidXRlcyBhcmUgdW5kZWZpbmVkLlxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbCA9IG5ldyBTcG90aWZ5UGxheWJhY2tFbGVtZW50KClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0Vm9sdW1lIChwZXJjZW50YWdlOiBudW1iZXIsIHBsYXllcjogYW55LCBzYXZlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IG5ld1ZvbHVtZSA9IHBlcmNlbnRhZ2UgLyAxMDBcclxuICAgIHBsYXllci5zZXRWb2x1bWUobmV3Vm9sdW1lKVxyXG5cclxuICAgIGlmIChzYXZlKSB7XHJcbiAgICAgIHNhdmVWb2x1bWUobmV3Vm9sdW1lLnRvU3RyaW5nKCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHRpbWUgc2hvd24gd2hlbiBzZWVraW5nLlxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFRoZSBwZXJjZW50IHRoYXQgdGhlIGJhciBoYXMgZmlsbGVkIHdpdGggcmVzcGVjdCB0byB0aGUgZW50aXJlIGJhclxyXG4gICAqIEBwYXJhbSB3ZWJQbGF5ZXJFbCBUaGUgd2VicGxheWVyIGVsZW1lbnQgdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblNlZWtpbmcgKHBlcmNlbnRhZ2U6IG51bWJlciwgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQpIHtcclxuICAgIC8vIGdldCB0aGUgcG9zaXRpb24gYnkgdXNpbmcgdGhlIHBlcmNlbnQgdGhlIHByb2dyZXNzIGJhci5cclxuICAgIGNvbnN0IHNlZWtQb3NpdGlvbiA9IHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4ICogKHBlcmNlbnRhZ2UgLyAxMDApXHJcbiAgICBpZiAod2ViUGxheWVyRWwuY3VyclRpbWUgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgdGltZSBlbGVtZW50IGlzIG51bGwnKVxyXG4gICAgfVxyXG4gICAgLy8gdXBkYXRlIHRoZSB0ZXh0IGNvbnRlbnQgdG8gc2hvdyB0aGUgdGltZSB0aGUgdXNlciB3aWxsIGJlIHNlZWtpbmcgdG9vIG9ubW91c2V1cC5cclxuICAgIHdlYlBsYXllckVsLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhzZWVrUG9zaXRpb24pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgc2Vla2luZyBhY3Rpb24gYmVnaW5zXHJcbiAgICogQHBhcmFtIHBsYXllciBUaGUgc3BvdGlmeSBzZGsgcGxheWVyIHdob3NlIHN0YXRlIHdlIHdpbGwgdXNlIHRvIGNoYW5nZSB0aGUgc29uZydzIHByb2dyZXNzIGJhcidzIG1heCB2YWx1ZSB0byB0aGUgZHVyYXRpb24gb2YgdGhlIHNvbmcuXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIFRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdGhhdCB3aWxsIGFsbG93IHVzIHRvIG1vZGlmeSB0aGUgcHJvZ3Jlc3MgYmFycyBtYXggYXR0cmlidXRlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25TZWVrU3RhcnQgKHBsYXllcjogYW55LCB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudCkge1xyXG4gICAgcGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IGR1cmF0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICdVc2VyIGlzIG5vdCBwbGF5aW5nIG11c2ljIHRocm91Z2ggdGhlIFdlYiBQbGF5YmFjayBTREsnXHJcbiAgICAgICAgKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIC8vIHdoZW4gZmlyc3Qgc2Vla2luZywgdXBkYXRlIHRoZSBtYXggYXR0cmlidXRlIHdpdGggdGhlIGR1cmF0aW9uIG9mIHRoZSBzb25nIGZvciB1c2Ugd2hlbiBzZWVraW5nLlxyXG4gICAgICB3ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLm1heCA9IHN0YXRlLmR1cmF0aW9uXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gcnVuIHdoZW4geW91IHdpc2ggdG8gc2VlayB0byBhIGNlcnRhaW4gcG9zaXRpb24gaW4gYSBzb25nLlxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFRoZSBwZXJjZW50IHRoYXQgdGhlIGJhciBoYXMgZmlsbGVkIHdpdGggcmVzcGVjdCB0byB0aGUgZW50aXJlIGJhclxyXG4gICAqIEBwYXJhbSBwbGF5ZXIgdGhlIHNwb3RpZnkgc2RrIHBsYXllciB0aGF0IHdpbGwgc2VlayB0aGUgc29uZyB0byBhIGdpdmVuIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2Vla1NvbmcgKHBlcmNlbnRhZ2U6IG51bWJlciwgcGxheWVyOiBhbnksIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24pIHtcclxuICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuICAgICAgLy8gb2J0YWluIHRoZSBmaW5hbCBwb3NpdGlvbiB0aGUgdXNlciB3aXNoZXMgdG8gc2VlayBvbmNlIG1vdXNlIGlzIHVwLlxyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IChwZXJjZW50YWdlIC8gMTAwKSAqIHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4XHJcblxyXG4gICAgICAvLyBzZWVrIHRvIHRoZSBjaG9zZW4gcG9zaXRpb24uXHJcbiAgICAgIHBsYXllci5zZWVrKHBvc2l0aW9uKS50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgX2xvYWRXZWJQbGF5ZXIgKCkge1xyXG4gICAgLy8gbG9hZCB0aGUgdXNlcnMgc2F2ZWQgdm9sdW1lIGlmIHRoZXJlIGlzbnQgdGhlbiBsb2FkIDAuNCBhcyBkZWZhdWx0LlxyXG4gICAgY29uc3Qgdm9sdW1lID0gYXdhaXQgbG9hZFZvbHVtZSgpXHJcblxyXG4gICAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0QWNjZXNzVG9rZW4gfSksIChyZXMpID0+IHtcclxuICAgICAgLy8gdGhpcyB0YWtlcyB0b28gbG9uZyBhbmQgc3BvdGlmeSBzZGsgbmVlZHMgd2luZG93Lm9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgdG8gYmUgZGVmaW5lZCBxdWlja2VyLlxyXG4gICAgICBjb25zdCBOT19DT05URU5UID0gMjA0XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSBOT19DT05URU5UIHx8IHJlcy5kYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5TcG90aWZ5KSB7XHJcbiAgICAgICAgLy8gaWYgdGhlIHNwb3RpZnkgc2RrIGlzIGFscmVhZHkgZGVmaW5lZCBzZXQgcGxheWVyIHdpdGhvdXQgc2V0dGluZyBvblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5IG1lYW5pbmcgdGhlIHdpbmRvdzogV2luZG93IGlzIGluIGEgZGlmZmVyZW50IHNjb3BlXHJcbiAgICAgICAgLy8gdXNlIHdpbmRvdy5TcG90aWZ5LlBsYXllciBhcyBzcG90aWZ5IG5hbWVzcGFjZSBpcyBkZWNsYXJlZCBpbiB0aGUgV2luZG93IGludGVyZmFjZSBhcyBwZXIgRGVmaW5pdGVseVR5cGVkIC0+IHNwb3RpZnktd2ViLXBsYXliYWNrLXNkayAtPiBpbmRleC5kLnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9EZWZpbml0ZWx5VHlwZWQvRGVmaW5pdGVseVR5cGVkL3RyZWUvbWFzdGVyL3R5cGVzL3Nwb3RpZnktd2ViLXBsYXliYWNrLXNka1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZvbHVtZTogdm9sdW1lXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLl9hZGRMaXN0ZW5lcnModm9sdW1lKVxyXG4gICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIHBsYXllciFcclxuICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvZiBzcG90aWZ5IHNkayBpcyB1bmRlZmluZWRcclxuICAgICAgICB3aW5kb3cub25TcG90aWZ5V2ViUGxheWJhY2tTREtSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAgIC8vIGlmIGdldHRpbmcgdG9rZW4gd2FzIHN1Y2Nlc2Z1bCBjcmVhdGUgc3BvdGlmeSBwbGF5ZXIgdXNpbmcgdGhlIHdpbmRvdyBpbiB0aGlzIHNjb3BlXHJcbiAgICAgICAgICB0aGlzLnBsYXllciA9IG5ldyB3aW5kb3cuU3BvdGlmeS5QbGF5ZXIoe1xyXG4gICAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgICBnZXRPQXV0aFRva2VuOiAoY2IpID0+IHtcclxuICAgICAgICAgICAgICAvLyBnaXZlIHRoZSB0b2tlbiB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2b2x1bWU6IHZvbHVtZVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIHRoaXMuX2FkZExpc3RlbmVycyh2b2x1bWUpXHJcbiAgICAgICAgICAvLyBDb25uZWN0IHRvIHRoZSBwbGF5ZXIhXHJcbiAgICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hZGRMaXN0ZW5lcnMgKGxvYWRlZFZvbHVtZTogc3RyaW5nKSB7XHJcbiAgICAvLyBFcnJvciBoYW5kbGluZ1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2luaXRpYWxpemF0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2F1dGhlbnRpY2F0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdwbGF5YmFjayBjb3VsZG50IHN0YXJ0JylcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignYWNjb3VudF9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdwbGF5YmFja19lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBQbGF5YmFjayBzdGF0dXMgdXBkYXRlc1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3BsYXllcl9zdGF0ZV9jaGFuZ2VkJywgKHN0YXRlOiBTcG90aWZ5LlBsYXliYWNrU3RhdGUgfCBudWxsKSA9PiB7fSlcclxuXHJcbiAgICAvLyBSZWFkeVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUmVhZHkgd2l0aCBEZXZpY2UgSUQnLCBkZXZpY2VfaWQpXHJcbiAgICAgIHRoaXMuZGV2aWNlX2lkID0gZGV2aWNlX2lkXHJcblxyXG4gICAgICAvLyBhcHBlbmQgd2ViIHBsYXllciBlbGVtZW50IHRvIERPTVxyXG4gICAgICB0aGlzLndlYlBsYXllckVsLmFwcGVuZFdlYlBsYXllckh0bWwoXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlQbGF5UHJldih0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKSxcclxuICAgICAgICAoKSA9PiB0aGlzLnRyeVdlYlBsYXllclBhdXNlKHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUpLFxyXG4gICAgICAgICgpID0+IHRoaXMudHJ5UGxheU5leHQodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy5vblNlZWtTdGFydCh0aGlzLnBsYXllciwgdGhpcy53ZWJQbGF5ZXJFbCksXHJcbiAgICAgICAgKHBlcmNlbnRhZ2UpID0+IHRoaXMuc2Vla1NvbmcocGVyY2VudGFnZSwgdGhpcy5wbGF5ZXIsIHRoaXMud2ViUGxheWVyRWwpLFxyXG4gICAgICAgIChwZXJjZW50YWdlKSA9PiB0aGlzLm9uU2Vla2luZyhwZXJjZW50YWdlLCB0aGlzLndlYlBsYXllckVsKSxcclxuICAgICAgICAocGVyY2VudGFnZSwgc2F2ZSkgPT4gdGhpcy5zZXRWb2x1bWUocGVyY2VudGFnZSwgdGhpcy5wbGF5ZXIsIHNhdmUpLFxyXG4gICAgICAgIHBhcnNlRmxvYXQobG9hZGVkVm9sdW1lKVxyXG4gICAgICApXHJcbiAgICAgIHRoaXMucGxheWVySXNSZWFkeSA9IHRydWVcclxuICAgIH0pXHJcblxyXG4gICAgLy8gTm90IFJlYWR5XHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignbm90X3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnRGV2aWNlIElEIGhhcyBnb25lIG9mZmxpbmUnLCBkZXZpY2VfaWQpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldER1cmF0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gdHJ1ZVxyXG4gICAgICB0aGlzLnBsYXllci5zZWVrKDApLnRoZW4oKCkgPT4geyB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2UgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIHBhdXNlIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUgZnJvbSB0aGUgd2ViIHBsYXllci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVdlYlBsYXllclBhdXNlIChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHRoZSBmaXJzdCBub2RlIG9yIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nXHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gJiYgY3Vyck5vZGUgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgcHJldlRyYWNrID0gY3Vyck5vZGUuZGF0YVxyXG4gICAgICBjb25zb2xlLmxvZygnVHJ5IHBsYXllciBwYXVzZScpXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgY3Vyck5vZGUsIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmllcyB0byBwbGF5IHRoZSBwcmV2aW91cyBJUGxheWFibGUgZ2l2ZW4gdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVBsYXlQcmV2IChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIGlmIChjdXJyTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nIHdlIGNhbm5vdCBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IHBvc2l0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICAgIGlmIChzdGF0ZS5wb3NpdGlvbiA+IDEwMDApIHtcclxuICAgICAgICAgIHRoaXMucmVzZXREdXJhdGlvbigpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChjdXJyTm9kZS5wcmV2aW91cyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IHByZXZUcmFjayA9IGN1cnJOb2RlLnByZXZpb3VzLmRhdGFcclxuICAgICAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgY3Vyck5vZGUucHJldmlvdXMsIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycikpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZXMgdG8gcGxheSB0aGUgbmV4dCBJUGxheWFibGUgZ2l2ZW4gdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVBsYXlOZXh0IChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIGlmIChjdXJyTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHRoZSBsYXN0IG5vZGUgb3IgaWYgYW4gYWN0aW9uIGlzIHByb2Nlc3NpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiAmJiBjdXJyTm9kZS5uZXh0ICE9PSBudWxsKSB7XHJcbiAgICAgIGxldCBuZXh0VHJhY2tOb2RlID0gY3Vyck5vZGUubmV4dFxyXG5cclxuICAgICAgaWYgKCF0aGlzLndhc0luU2h1ZmZsZSAmJiBwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSkge1xyXG4gICAgICAgIC8vIGJ5IGNhbGxpbmcgdGhpcyBiZWZvcmUgYXNzaWduaW5nIHRoZSBuZXh0IG5vZGUsIHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpIG11c3QgcmV0dXJuIGJhY2sgdGhlIG5leHQgbm9kZVxyXG4gICAgICAgIG5leHRUcmFja05vZGUgPSB0aGlzLnNodWZmbGVQbGF5YWJsZXMoKVxyXG5cclxuICAgICAgICAvLyBjYWxsIGFmdGVyIHRvIGVuc3VyZSB0aGF0IHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpIHJ1bnMgdGhlIGlmIHN0YXRlbWVudCB0aGF0IHJldHVybnMgdGhlIG5leHQgbm9kZVxyXG4gICAgICAgIHRoaXMud2FzSW5TaHVmZmxlID0gdHJ1ZVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldFNlbFBsYXlpbmdFbChuZXcgUGxheWFibGVFdmVudEFyZyhuZXh0VHJhY2tOb2RlLmRhdGEsIG5leHRUcmFja05vZGUsIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbXBsZXRlbHlEZXNlbGVjdFRyYWNrICgpIHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCB3YXMgbnVsbCBiZWZvcmUgZGVzZWxlY3Rpb24gb24gc29uZyBmaW5pc2gnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5wYXVzZURlc2VsZWN0VHJhY2soKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9ICcnXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhdXNlRGVzZWxlY3RUcmFjayAoKSB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWxlY3RlZCBwbGF5aW5nIGVsZW1lbnQgd2FzIG51bGwgYmVmb3JlIGRlc2VsZWN0aW9uIG9uIHNvbmcgZmluaXNoJylcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlPy5kYXRhLm9uU3RvcHBlZCgpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMud2ViUGxheWVyRWwucGxheVBhdXNlPy5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZWxlY3RUcmFjayAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlID0gZXZlbnRBcmcucGxheWFibGVOb2RlXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIgPSBldmVudEFyZy5wbGF5YWJsZUFyclxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWxcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmlcclxuXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnBsYXlQYXVzZT8uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNldFRpdGxlKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS50aXRsZSlcclxuICAgIHRoaXMud2ViUGxheWVyRWwuc2V0SW1nU3JjKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5pbWFnZVVybClcclxuICAgIHRoaXMud2ViUGxheWVyRWwuc2V0QXJ0aXN0cyhldmVudEFyZy5jdXJyUGxheWFibGUuYXJ0aXN0c0h0bWwpXHJcblxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZT8uZGF0YS5vblBsYXlpbmcoKVxyXG5cclxuICAgIC8vIHdlIGNhbiBjYWxsIGFmdGVyIGFzc2lnbmluZyBwbGF5YWJsZSBub2RlIGFzIGl0IGRvZXMgbm90IGNoYW5nZSB3aGljaCBub2RlIGlzIHBsYXllZFxyXG4gICAgaWYgKCFwbGF5VGhydVdlYlBsYXllciAmJiBwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSkge1xyXG4gICAgICB0aGlzLnNodWZmbGVQbGF5YWJsZXMoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvblRyYWNrRmluaXNoICgpIHtcclxuICAgIHRoaXMuY29tcGxldGVseURlc2VsZWN0VHJhY2soKVxyXG5cclxuICAgIHRoaXMud2ViUGxheWVyRWwuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSAnMTAwJSdcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsIGFzIE5vZGVKUy5UaW1lb3V0KVxyXG4gICAgdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhbiBpbnRlcnZhbCB0aGF0IG9idGFpbnMgdGhlIHN0YXRlIG9mIHRoZSBwbGF5ZXIgZXZlcnkgc2Vjb25kLlxyXG4gICAqIFNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIGEgc29uZyBpcyBwbGF5aW5nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0R2V0U3RhdGVJbnRlcnZhbCAoKSB7XHJcbiAgICBsZXQgZHVyYXRpb25NaW5TZWMgPSAnJ1xyXG4gICAgaWYgKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbClcclxuICAgIH1cclxuICAgIC8vIHNldCB0aGUgaW50ZXJ2YWwgdG8gcnVuIGV2ZXJ5IHNlY29uZCBhbmQgb2J0YWluIHRoZSBzdGF0ZVxyXG4gICAgdGhpcy5nZXRTdGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICB0aGlzLnBsYXllci5nZXRDdXJyZW50U3RhdGUoKS50aGVuKChzdGF0ZTogeyBwb3NpdGlvbjogYW55OyBkdXJhdGlvbjogYW55IH0pID0+IHtcclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAnVXNlciBpcyBub3QgcGxheWluZyBtdXNpYyB0aHJvdWdoIHRoZSBXZWIgUGxheWJhY2sgU0RLJ1xyXG4gICAgICAgICAgKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHsgcG9zaXRpb24sIGR1cmF0aW9uIH0gPSBzdGF0ZVxyXG5cclxuICAgICAgICAvLyBpZiB0aGVyZSBpc250IGEgZHVyYXRpb24gc2V0IGZvciB0aGlzIHNvbmcgc2V0IGl0LlxyXG4gICAgICAgIGlmIChkdXJhdGlvbk1pblNlYyA9PT0gJycpIHtcclxuICAgICAgICAgIGR1cmF0aW9uTWluU2VjID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhkdXJhdGlvbilcclxuICAgICAgICAgIHRoaXMud2ViUGxheWVyRWwhLmR1cmF0aW9uIS50ZXh0Q29udGVudCA9IGR1cmF0aW9uTWluU2VjXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwZXJjZW50RG9uZSA9IChwb3NpdGlvbiAvIGR1cmF0aW9uKSAqIDEwMFxyXG5cclxuICAgICAgICAvLyB0aGUgcG9zaXRpb24gZ2V0cyBzZXQgdG8gMCB3aGVuIHRoZSBzb25nIGlzIGZpbmlzaGVkXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLm9uVHJhY2tGaW5pc2goKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBpZiB0aGUgcG9zaXRpb24gaXNudCAwIHVwZGF0ZSB0aGUgd2ViIHBsYXllciBlbGVtZW50c1xyXG4gICAgICAgICAgdGhpcy53ZWJQbGF5ZXJFbC51cGRhdGVFbGVtZW50KHBlcmNlbnREb25lLCBwb3NpdGlvbilcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9LCA1MDApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWxlY3QgYSBjZXJ0YWluIHBsYXkvcGF1c2UgZWxlbWVudCBhbmQgcGxheSB0aGUgZ2l2ZW4gdHJhY2sgdXJpXHJcbiAgICogYW5kIHVuc2VsZWN0IHRoZSBwcmV2aW91cyBvbmUgdGhlbiBwYXVzZSB0aGUgcHJldmlvdXMgdHJhY2tfdXJpLlxyXG4gICAqXHJcbiAgICogVGhlIHJlYXNzaWduaW5nIG9mIGVsZW1lbnRzIGlzIGluIHRoZSBjYXNlIHRoYXQgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgdGhyb3VnaCB0aGUgd2ViIHBsYXllciBlbGVtZW50LFxyXG4gICAqIGFzIHRoZXJlIGlzIGEgY2hhbmNlIHRoYXQgdGhlIHNlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCBpcyBlaXRoZXIgbm9uLWV4aXN0ZW50LCBvciBpcyBkaWZmZXJlbnQgdGhlbiB0aGVuXHJcbiAgICogdGhlIHByZXZpb3VzIGkuZS4gcmVyZW5kZXJlZCwgb3IgaGFzIGFuIGVxdWl2YWxlbnQgZWxlbWVudCB3aGVuIG9uIGZvciBleGFtcGxlIGEgZGlmZmVyZW50IHRlcm0gdGFiLlxyXG4gICAqXHJcbiAgICogUmVhc3NpZ25pbmcgaXMgZG9uZSBzbyB0aGF0IHRoZSBwb3RlbnRpYWxseSBkaWZmZXJlbnQgZXF1aXZhbGVudCBlbGVtZW50IGNhbiBhY3QgYXMgdGhlIGluaXRpYWxseVxyXG4gICAqIHNlbGVjdGVkIGVsZW1lbnQsIGluIHNob3dpbmcgcGF1c2UvcGxheSBzeW1ib2xzIGluIGFjY29yZGFuY2UgdG8gd2hldGhlciB0aGVcclxuICAgKiBzb25nIHdhcyBwYXVzZWQvcGxheWVkIHRocm91Z2ggdGhlIHdlYiBwbGF5ZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BsYXlhYmxlRXZlbnRBcmd9IGV2ZW50QXJnIC0gYSBjbGFzcyB0aGF0IGNvbnRhaW5zIHRoZSBjdXJyZW50LCBuZXh0IGFuZCBwcmV2aW91cyB0cmFja3MgdG8gcGxheVxyXG4gICAqL1xyXG4gIHB1YmxpYyBhc3luYyBzZXRTZWxQbGF5aW5nRWwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllciA9IHRydWUpIHtcclxuICAgIC8vIGlmIHRoZSBwbGF5ZXIgaXNuJ3QgcmVhZHkgd2UgY2Fubm90IGNvbnRpbnVlLlxyXG4gICAgaWYgKCF0aGlzLnBsYXllcklzUmVhZHkpIHtcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXllciBpcyBub3QgcmVhZHknKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGlmICh0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuXHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgIT0gbnVsbCkge1xyXG4gICAgICAvLyBzdG9wIHRoZSBwcmV2aW91cyB0cmFjayB0aGF0IHdhcyBwbGF5aW5nXHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGU/LmRhdGEub25TdG9wcGVkKClcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwgYXMgTm9kZUpTLlRpbWVvdXQpXHJcblxyXG4gICAgICAvLyByZWFzc2lnbiB0aGUgZWxlbWVudCBpZiBpdCBleGlzdHMgYXMgaXQgbWF5IGhhdmUgYmVlbiByZXJlbmRlcmVkIGFuZCB0aGVyZWZvcmUgdGhlIHByZXZpb3VzIHZhbHVlIGlzIHBvaW50aW5nIHRvIG5vdGhpbmdcclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5pZCkgPz8gdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnRcclxuXHJcbiAgICAgIC8vIGlmIGl0cyB0aGUgc2FtZSBlbGVtZW50IHRoZW4gcGF1c2VcclxuICAgICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmlkID09PSBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwuaWQpIHtcclxuICAgICAgICB0aGlzLnBhdXNlRGVzZWxlY3RUcmFjaygpXHJcbiAgICAgICAgYXdhaXQgdGhpcy5wYXVzZSgpXHJcbiAgICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGNvbXBsZXRlbHkgZGVzZWxlY3QgdGhlIGN1cnJlbnQgdHJhY2sgYmVmb3JlIHNlbGVjdGluZyBhbm90aGVyIG9uZSB0byBwbGF5XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZWx5RGVzZWxlY3RUcmFjaygpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwcmV2IHRyYWNrIHVyaSBpcyB0aGUgc2FtZSB0aGVuIHJlc3VtZSB0aGUgc29uZyBpbnN0ZWFkIG9mIHJlcGxheWluZyBpdC5cclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID09PSBldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSB7XHJcbiAgICAgIC8vIHRoaXMgc2VsRWwgY291bGQgY29ycm9zcG9uZCB0byB0aGUgc2FtZSBzb25nIGJ1dCBpcyBhbiBlbGVtZW50IHRoYXQgaXMgbm9uLWV4aXN0ZW50LCBzbyByZWFzc2lnbiBpdCB0byBhIGVxdWl2YWxlbnQgZXhpc3RpbmcgZWxlbWVudCBpZiB0aGlzIGlzIHRoZSBjYXNlLlxyXG4gICAgICBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwuaWQpID8/IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbFxyXG5cclxuICAgICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucmVzdW1lKCksIGV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcilcclxuICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCdzdGFydCB0cmFjaycpXHJcbiAgICBhd2FpdCB0aGlzLnN0YXJ0VHJhY2soYXN5bmMgKCkgPT4gdGhpcy5wbGF5KGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmkpLCBldmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIpXHJcbiAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgc3RhcnRUcmFjayAocGxheWluZ0FzeW5jRnVuYzogRnVuY3Rpb24sIGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnLCBwbGF5VGhydVdlYlBsYXllcjogYm9vbGVhbikge1xyXG4gICAgdGhpcy5zZWxlY3RUcmFjayhldmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIpXHJcblxyXG4gICAgYXdhaXQgcGxheWluZ0FzeW5jRnVuYygpXHJcblxyXG4gICAgLy8gc2V0IHBsYXlpbmcgc3RhdGUgb25jZSBzb25nIHN0YXJ0cyBwbGF5aW5nXHJcbiAgICB0aGlzLnNldEdldFN0YXRlSW50ZXJ2YWwoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaHVmZmxlUGxheWFibGVzICgpIDogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyID09IG51bGwgfHwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ25vIHNlbCBwbGF5aW5nJylcclxuXHJcbiAgICBjb25zdCBzZWxQbGF5YWJsZSA9IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUuZGF0YVxyXG4gICAgY29uc29sZS5sb2coJ3NodWZmbGUnKVxyXG5cclxuICAgIC8vIHNodWZmbGUgYXJyYXlcclxuICAgIGNvbnN0IHRyYWNrQXJyID0gc2h1ZmZsZSh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpXHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoaXMgdHJhY2sgZnJvbSB0aGUgYXJyYXlcclxuICAgIGNvbnN0IGluZGV4ID0gdHJhY2tBcnIuaW5kZXhPZihzZWxQbGF5YWJsZSlcclxuICAgIHRyYWNrQXJyLnNwbGljZShpbmRleCwgMSlcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBhIGRvdWJseSBsaW5rZWQgbGlzdFxyXG4gICAgY29uc3Qgc2h1ZmZsZWRMaXN0ID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QodHJhY2tBcnIpXHJcblxyXG4gICAgLy8gcGxhY2UgdGhpcyB0cmFjayBhdCB0aGUgZnJvbnQgb2YgdGhlIGxpc3RcclxuICAgIHNodWZmbGVkTGlzdC5pbnNlcnRCZWZvcmUoc2VsUGxheWFibGUsIDApXHJcblxyXG4gICAgbGV0IG5ld05vZGUgOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICBpZiAoIXRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbmV4dCBub2RlIGFzIHRoaXMgc2hvdWxkIHJ1biBiZWZvcmUgdGhlIG5leHQgbm9kZSBpcyBjaG9zZW4uXHJcbiAgICAgIG5ld05vZGUgPSBzaHVmZmxlZExpc3QuZ2V0KDEsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuXHJcbiAgICAgIC8vIGFzc2lnbiB0aGUgbmV3IG5vZGUgdGhhdCBwb2ludHMgdG8gYSBzaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBjdXJyZW50IHBsYXlsaXN0IGFzIHRoZSBjdXJyZW50IG5vZGVcclxuICAgICAgcmV0dXJuIG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbmV3IG5vZGUgd2hpY2ggaGFzIGlkZW50aWNhbCBkYXRhIGFzIHRoZSBvbGQgb25lLCBidXQgaXMgbm93IHBhcnQgb2YgdGhlIHNodWZmbGVkIGRvdWJseSBsaW5rZWQgbGlzdFxyXG4gICAgICBuZXdOb2RlID0gc2h1ZmZsZWRMaXN0LmdldCgwLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSBuZXdOb2RlXHJcblxyXG4gICAgICByZXR1cm4gbmV3Tm9kZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGxheXMgYSB0cmFjayB0aHJvdWdoIHRoaXMgZGV2aWNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRyYWNrX3VyaSAtIHRoZSB0cmFjayB1cmkgdG8gcGxheVxyXG4gICAqIEByZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB0cmFjayBoYXMgYmVlbiBwbGF5ZWQgc3VjY2VzZnVsbHkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwbGF5ICh0cmFja191cmk6IHN0cmluZykge1xyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRQbGF5VHJhY2sodGhpcy5kZXZpY2VfaWQsIHRyYWNrX3VyaSkpXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHJlc3VtZSAoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnBsYXllci5yZXN1bWUoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBwYXVzZSAoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnBsYXllci5wYXVzZSgpXHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBzcG90aWZ5UGxheWJhY2sgPSBuZXcgU3BvdGlmeVBsYXliYWNrKClcclxuXHJcbmlmICgod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yID09PSB1bmRlZmluZWQpIHtcclxuICAvLyBjcmVhdGUgYSBnbG9iYWwgdmFyaWFibGUgdG8gYmUgdXNlZFxyXG4gICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgPSBuZXcgRXZlbnRBZ2dyZWdhdG9yKClcclxufVxyXG5jb25zdCBldmVudEFnZ3JlZ2F0b3IgPSAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yIGFzIEV2ZW50QWdncmVnYXRvclxyXG5cclxuLy8gc3Vic2NyaWJlIHRoZSBzZXRQbGF5aW5nIGVsZW1lbnQgZXZlbnRcclxuZXZlbnRBZ2dyZWdhdG9yLnN1YnNjcmliZShQbGF5YWJsZUV2ZW50QXJnLm5hbWUsIChldmVudEFyZzogUGxheWFibGVFdmVudEFyZykgPT5cclxuICBzcG90aWZ5UGxheWJhY2suc2V0U2VsUGxheWluZ0VsKGV2ZW50QXJnLCBmYWxzZSlcclxuKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwgKHVyaTogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIChcclxuICAgIHVyaSA9PT0gc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcudHJhY2tfdXJpICYmXHJcbiAgICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLmVsZW1lbnQgIT0gbnVsbFxyXG4gIClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU2FtZVBsYXlpbmdVUkkgKHVyaTogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHVyaSA9PT0gc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcudHJhY2tfdXJpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyICh1cmk6IHN0cmluZywgc2VsRWw6IEVsZW1lbnQsIHRyYWNrRGF0YU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICBpZiAoaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh1cmkpKSB7XHJcbiAgICAvLyBUaGlzIGVsZW1lbnQgd2FzIHBsYXlpbmcgYmVmb3JlIHJlcmVuZGVyaW5nIHNvIHNldCBpdCB0byBiZSB0aGUgY3VycmVudGx5IHBsYXlpbmcgb25lIGFnYWluXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ID0gc2VsRWxcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9IHRyYWNrRGF0YU5vZGVcclxuICB9XHJcbn1cclxuXHJcbi8vIGFwcGVuZCBhbiBpbnZpc2libGUgZWxlbWVudCB0aGVuIGRlc3Ryb3kgaXQgYXMgYSB3YXkgdG8gbG9hZCB0aGUgcGxheSBhbmQgcGF1c2UgaW1hZ2VzIGZyb20gZXhwcmVzcy5cclxuY29uc3QgcHJlbG9hZFBsYXlQYXVzZUltZ3NIdG1sID0gYDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lXCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5SWNvbn1cIi8+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wYXVzZUljb259XCIvPjwvZGl2PmBcclxuY29uc3QgcHJlbG9hZFBsYXlQYXVzZUltZ3NFbCA9IGh0bWxUb0VsKHByZWxvYWRQbGF5UGF1c2VJbWdzSHRtbCkgYXMgTm9kZVxyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHByZWxvYWRQbGF5UGF1c2VJbWdzRWwpXHJcbmRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocHJlbG9hZFBsYXlQYXVzZUltZ3NFbClcclxuIiwiaW1wb3J0IHsgY29uZmlnLCBodG1sVG9FbCwgZ2V0VmFsaWRJbWFnZSB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IFRyYWNrLCB7IGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgfSBmcm9tICcuL3RyYWNrJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcbmltcG9ydCBEb3VibHlMaW5rZWRMaXN0IGZyb20gJy4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgeyBQbGF5bGlzdFRyYWNrRGF0YSwgU3BvdGlmeUltZywgVHJhY2tEYXRhIH0gZnJvbSAnLi4vLi4vdHlwZXMnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuXHJcbmNsYXNzIFBsYXlsaXN0IGV4dGVuZHMgQ2FyZCB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgdW5kb1N0YWNrOiBBcnJheTxBcnJheTxUcmFjaz4+O1xyXG4gIG9yZGVyOiBzdHJpbmc7XHJcbiAgdHJhY2tMaXN0OiB1bmRlZmluZWQgfCBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPjtcclxuICBpbWFnZVVybDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvciAobmFtZTogc3RyaW5nLCBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+LCBpZDogc3RyaW5nKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICB0aGlzLmlkID0gaWRcclxuICAgIHRoaXMudW5kb1N0YWNrID0gW11cclxuICAgIHRoaXMub3JkZXIgPSAnY3VzdG9tLW9yZGVyJyAvLyBzZXQgaXQgYXMgdGhlIGluaXRpYWwgb3JkZXJcclxuICAgIHRoaXMudHJhY2tMaXN0ID0gdW5kZWZpbmVkXHJcblxyXG4gICAgLy8gdGhlIGlkIG9mIHRoZSBwbGF5bGlzdCBjYXJkIGVsZW1lbnRcclxuICAgIHRoaXMuaW1hZ2VVcmwgPSBnZXRWYWxpZEltYWdlKGltYWdlcylcclxuICB9XHJcblxyXG4gIGFkZFRvVW5kb1N0YWNrICh0cmFja3M6IEFycmF5PFRyYWNrPikge1xyXG4gICAgdGhpcy51bmRvU3RhY2sucHVzaCh0cmFja3MpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgcGxheWxpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIGdldFBsYXlsaXN0Q2FyZEh0bWwgKGlkeDogbnVtYmVyLCBpblRleHRGb3JtOiBib29sZWFuLCBpc1NlbGVjdGVkID0gZmFsc2UpOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMucGxheWxpc3RQcmVmaXh9JHtpZHh9YFxyXG5cclxuICAgIGNvbnN0IGV4cGFuZE9uSG92ZXIgPSBpblRleHRGb3JtID8gJycgOiBjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3ZlclxyXG5cclxuICAgIHRoaXMuY2FyZElkID0gaWRcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7ZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW59ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkXHJcbiAgICB9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0fSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH0gJHtcclxuICAgICAgaXNTZWxlY3RlZCA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICB9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCIgdGl0bGU9XCJDbGljayB0byBWaWV3IFRyYWNrc1wiPlxyXG4gICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlVXJsfVwiIGFsdD1cIlBsYXlsaXN0IENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcFxyXG4gICAgfVwiPiR7dGhpcy5uYW1lfTwvaDQ+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2R1Y2VzIGxpc3Qgb2YgVHJhY2sgY2xhc3MgaW5zdGFuY2VzIHVzaW5nIHRyYWNrIGRhdGFzIGZyb20gc3BvdGlmeSB3ZWIgYXBpLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+fSBMaXN0IG9mIHRyYWNrIGNsYXNzZXMgY3JlYXRlZCB1c2luZyB0aGUgb2J0YWluZWQgdHJhY2sgZGF0YXMuXHJcbiAgICovXHJcbiAgYXN5bmMgbG9hZFRyYWNrcyAoKTogUHJvbWlzZTxEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IG51bGw+IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zLnJlcXVlc3Q8QXJyYXk8UGxheWxpc3RUcmFja0RhdGE+Pih7IG1ldGhvZDogJ2dldCcsIHVybDogYCR7Y29uZmlnLlVSTHMuZ2V0UGxheWxpc3RUcmFja3MgKyB0aGlzLmlkfWAgfSlcclxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKVxyXG4gICAgICB9KVxyXG5cclxuICAgIGlmICghcmVzKSB7XHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcbiAgICBjb25zdCB0cmFja0xpc3QgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4oKVxyXG5cclxuICAgIC8vIG1hcCBlYWNoIHRyYWNrIGRhdGEgaW4gdGhlIHBsYXlsaXN0IGRhdGEgdG8gYW4gYXJyYXkuXHJcbiAgICBjb25zdCB0cmFja3NEYXRhID0gcmVzLmRhdGEubWFwKChkYXRhKSA9PiBkYXRhLnRyYWNrKSBhcyBBcnJheTxUcmFja0RhdGE+XHJcbiAgICBnZXRQbGF5bGlzdFRyYWNrc0Zyb21EYXRhcyh0cmFja3NEYXRhLCByZXMuZGF0YSwgdHJhY2tMaXN0KVxyXG5cclxuICAgIC8vIGRlZmluZSB0cmFjayBvYmplY3RzXHJcbiAgICB0aGlzLnRyYWNrTGlzdCA9IHRyYWNrTGlzdFxyXG4gICAgcmV0dXJuIHRyYWNrTGlzdFxyXG4gIH1cclxuXHJcbiAgaGFzTG9hZGVkVHJhY2tzICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRyYWNrTGlzdCAhPT0gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBwbGF5bGlzdCB0cmFja3MgZnJvbSBkYXRhLiBUaGlzIGFsc28gaW5pdGlhbGl6ZXMgdGhlIGRhdGUgYWRkZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXk8VHJhY2tEYXRhPn0gdHJhY2tzRGF0YSBhbiBhcnJheSBvZiBjb250YWluaW5nIGVhY2ggdHJhY2sncyBkYXRhXHJcbiAqIEBwYXJhbSB7QXJyYXk8UGxheWxpc3RUcmFja0RhdGE+fSBkYXRlQWRkZWRPYmplY3RzIFRoZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgYWRkZWRfYXQgdmFyaWFibGUuXHJcbiAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz59IHRyYWNrc0xpc3QgdGhlIGRvdWJseSBsaW5rZWQgbGlzdCB0byBwdXQgdGhlIHRyYWNrcyBpbnRvLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXlsaXN0VHJhY2tzRnJvbURhdGFzIChcclxuICB0cmFja3NEYXRhOiBBcnJheTxUcmFja0RhdGE+LFxyXG4gIGRhdGVBZGRlZE9iamVjdHM6IEFycmF5PFBsYXlsaXN0VHJhY2tEYXRhPixcclxuICB0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+XHJcbikge1xyXG4gIGdlbmVyYXRlVHJhY2tzRnJvbURhdGEodHJhY2tzRGF0YSwgdHJhY2tMaXN0KVxyXG5cclxuICBsZXQgaSA9IDBcclxuICAvLyBzZXQgdGhlIGRhdGVzIGFkZGVkXHJcbiAgZm9yIChjb25zdCB0cmFja091dCBvZiB0cmFja0xpc3QudmFsdWVzKCkpIHtcclxuICAgIGNvbnN0IGRhdGVBZGRlZE9iaiA9IGRhdGVBZGRlZE9iamVjdHNbaV1cclxuICAgIGNvbnN0IHRyYWNrOiBUcmFjayA9IHRyYWNrT3V0XHJcblxyXG4gICAgdHJhY2suc2V0RGF0ZUFkZGVkVG9QbGF5bGlzdChkYXRlQWRkZWRPYmouYWRkZWRfYXQpXHJcbiAgICBpKytcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYXlsaXN0XHJcbiIsImltcG9ydCBTdWJzY3JpcHRpb24gZnJvbSAnLi9zdWJzY3JpcHRpb24nXHJcblxyXG4vKiogTGV0cyBzYXkgeW91IGhhdmUgdHdvIGRvb3JzIHRoYXQgd2lsbCBvcGVuIHRocm91Z2ggdGhlIHB1YiBzdWIgc3lzdGVtLiBXaGF0IHdpbGwgaGFwcGVuIGlzIHRoYXQgd2Ugd2lsbCBzdWJzY3JpYmUgb25lXHJcbiAqIG9uIGRvb3Igb3BlbiBldmVudC4gV2Ugd2lsbCB0aGVuIGhhdmUgdHdvIHB1Ymxpc2hlcnMgdGhhdCB3aWxsIGVhY2ggcHJvcGFnYXRlIGEgZGlmZmVyZW50IGRvb3IgdGhyb3VnaCB0aGUgYWdncmVnYXRvciBhdCBkaWZmZXJlbnQgcG9pbnRzLlxyXG4gKiBUaGUgYWdncmVnYXRvciB3aWxsIHRoZW4gZXhlY3V0ZSB0aGUgb24gZG9vciBvcGVuIHN1YnNjcmliZXIgYW5kIHBhc3MgaW4gdGhlIGRvb3IgZ2l2ZW4gYnkgZWl0aGVyIHB1Ymxpc2hlci5cclxuICovXHJcblxyXG4vKiogTWFuYWdlcyBzdWJzY3JpYmluZyBhbmQgcHVibGlzaGluZyBvZiBldmVudHMuXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogQW4gYXJnVHlwZSBpcyBvYnRhaW5lZCBieSB0YWtpbmcgdGhlICdDbGFzc0luc3RhbmNlJy5jb250cnVjdG9yLm5hbWUgb3IgJ0NsYXNzJy5uYW1lLlxyXG4gKiBTdWJzY3JpcHRpb25zIGFyZSBncm91cGVkIHRvZ2V0aGVyIGJ5IGFyZ1R5cGUgYW5kIHRoZWlyIGV2dCB0YWtlcyBhbiBhcmd1bWVudCB0aGF0IGlzIGFcclxuICogY2xhc3Mgd2l0aCB0aGUgY29uc3RydWN0b3IubmFtZSBvZiBhcmdUeXBlLlxyXG4gKlxyXG4gKi9cclxuY2xhc3MgRXZlbnRBZ2dyZWdhdG9yIHtcclxuICBzdWJzY3JpYmVyczogeyBba2V5OiBzdHJpbmddOiBBcnJheTxTdWJzY3JpcHRpb24+IH07XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgLy8ga2V5IC0gdHlwZSwgdmFsdWUgLSBbXSBvZiBmdW5jdGlvbnMgdGhhdCB0YWtlIGEgY2VydGFpbiB2YWx1ZSBkZXBlbmRpbmcgb24gdGhlIHR5cGVcclxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fVxyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZXMgYSB0eXBlIG9mIGV2ZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFyZ1R5cGUgLSB0aGUgdHlwZSB0aGF0IHRoaXMgc3Vic2NyaWJlciBiZWxvbmdzIHRvby5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBldmVudCAtIHRoZSBldmVudCB0aGF0IHRha2VzIHRoZSBzYW1lIGFyZ3MgYXMgYWxsIG90aGVyIGV2ZW50cyBvZiB0aGUgZ2l2ZW4gdHlwZS5cclxuICAgKi9cclxuICBzdWJzY3JpYmUgKGFyZ1R5cGU6IHN0cmluZywgZXZ0OiBGdW5jdGlvbikge1xyXG4gICAgY29uc3Qgc3Vic2NyaWJlciA9IG5ldyBTdWJzY3JpcHRpb24odGhpcywgZXZ0LCBhcmdUeXBlKVxyXG5cclxuICAgIGlmIChhcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXS5wdXNoKHN1YnNjcmliZXIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdID0gW3N1YnNjcmliZXJdXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVW5zdWJzY3JpYmVzIGEgZ2l2ZW4gc3Vic2NyaXB0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdWJzY3JpcHRpb259IHN1YnNjcmlwdGlvblxyXG4gICAqL1xyXG4gIHVuc3Vic2NyaWJlIChzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbikge1xyXG4gICAgaWYgKHN1YnNjcmlwdGlvbi5hcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgLy8gZmlsdGVyIG91dCB0aGUgc3Vic2NyaXB0aW9uIGdpdmVuIGZyb20gdGhlIHN1YnNjcmliZXJzIGRpY3Rpb25hcnlcclxuICAgICAgY29uc3QgZmlsdGVyZWQgPSB0aGlzLnN1YnNjcmliZXJzW3N1YnNjcmlwdGlvbi5hcmdUeXBlXS5maWx0ZXIoZnVuY3Rpb24gKHN1Yikge1xyXG4gICAgICAgIHJldHVybiBzdWIuaWQgIT09IHN1YnNjcmlwdGlvbi5pZFxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1tzdWJzY3JpcHRpb24uYXJnVHlwZV0gPSBmaWx0ZXJlZFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2hlcyBhbGwgc3Vic2NyaWJlcnMgdGhhdCB0YWtlIGFyZ3VtZW50cyBvZiBhIGdpdmVuIHR5cGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gYXJncyAtIGEgY2xhc3MgdGhhdCBjb250YWlucyBhcmd1bWVudHMgZm9yIHRoZSBldmVudC4gTXVzdCBiZSBhIGNsYXNzIGFzIHN1YnNjcmliZXJzIGFyZSBncm91cGVkIGJ5IHR5cGUuXHJcbiAgICovXHJcbiAgcHVibGlzaCAoYXJnczogT2JqZWN0KSB7XHJcbiAgICBjb25zdCBhcmdUeXBlID0gYXJncy5jb25zdHJ1Y3Rvci5uYW1lXHJcblxyXG4gICAgaWYgKGFyZ1R5cGUgaW4gdGhpcy5zdWJzY3JpYmVycykge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4ge1xyXG4gICAgICAgIHN1YnNjcmlwdGlvbi5ldnQoYXJncylcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ25vIHR5cGUgZm91bmQgZm9yIHB1Ymxpc2hpbmcnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xlYXJTdWJzY3JpcHRpb25zICgpIHtcclxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRBZ2dyZWdhdG9yXHJcbiIsImltcG9ydCB7IElQbGF5YWJsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgeyBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4uLy4uL2RvdWJseS1saW5rZWQtbGlzdCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXlhYmxlRXZlbnRBcmcge1xyXG4gIGN1cnJQbGF5YWJsZTogSVBsYXlhYmxlO1xyXG4gIHBsYXlhYmxlTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gIHBsYXlhYmxlQXJyOiBBcnJheTxJUGxheWFibGU+IHwgbnVsbFxyXG5cclxuICAvKiogVGFrZXMgaW4gdGhlIGN1cnJlbnQgdHJhY2sgdG8gcGxheSBhcyB3ZWxsIGFzIHRoZSBwcmV2IHRyYWNrcyBhbmQgbmV4dCB0cmFja3MgZnJvbSBpdC5cclxuICAgKiBOb3RlIHRoYXQgaXQgZG9lcyBub3QgdGFrZSBUcmFjayBpbnN0YW5jZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0lQbGF5YWJsZX0gY3VyclRyYWNrIC0gb2JqZWN0IGNvbnRhaW5pbmcgZWxlbWVudCB0byBzZWxlY3QsIHRyYWNrX3VyaSwgYW5kIHRyYWNrIHRpdGxlLlxyXG4gICAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPn0gdHJhY2tOb2RlIC0gbm9kZSB0aGF0IGFsbG93cyB1cyB0byB0cmF2ZXJzZSB0byBuZXh0IGFuZCBwcmV2aW91cyB0cmFjayBkYXRhcy5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciAoY3VyclRyYWNrOiBJUGxheWFibGUsIHRyYWNrTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiwgcGxheWFibGVBcnI6IEFycmF5PElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICB0aGlzLmN1cnJQbGF5YWJsZSA9IGN1cnJUcmFja1xyXG4gICAgdGhpcy5wbGF5YWJsZU5vZGUgPSB0cmFja05vZGVcclxuICAgIHRoaXMucGxheWFibGVBcnIgPSBwbGF5YWJsZUFyclxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vYWdncmVnYXRvcidcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1YnNjcmlwdGlvbiB7XHJcbiAgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3I7XHJcbiAgZXZ0OiBGdW5jdGlvbjtcclxuICBhcmdUeXBlOiBzdHJpbmc7XHJcbiAgaWQ6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yLCBldnQ6IEZ1bmN0aW9uLCBhcmdUeXBlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yID0gZXZlbnRBZ2dyZWdhdG9yXHJcbiAgICB0aGlzLmV2dCA9IGV2dFxyXG4gICAgdGhpcy5hcmdUeXBlID0gYXJnVHlwZVxyXG4gICAgdGhpcy5pZCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIGh0bWxUb0VsLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgdGhyb3dFeHByZXNzaW9uLFxyXG4gIHJlbW92ZUFsbENoaWxkTm9kZXNcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IHBsYXllclB1YmxpY1ZhcnMgfSBmcm9tICcuL3BsYXliYWNrLXNkaydcclxuXHJcbmNsYXNzIFNsaWRlciB7XHJcbiAgcHVibGljIGRyYWc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgc2xpZGVyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIHNsaWRlclByb2dyZXNzOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgcGVyY2VudGFnZTogbnVtYmVyID0gMDtcclxuICBwdWJsaWMgbWF4OiBudW1iZXIgPSAwO1xyXG4gIHByaXZhdGUgdG9wVG9Cb3R0b206IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBvbkRyYWdTdGFydDogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBvbkRyYWdnaW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoc3RhcnRQZXJjZW50YWdlOiBudW1iZXIsIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQsIHRvcFRvQm90dG9tOiBib29sZWFuLCBvbkRyYWdTdGFydCA9ICgpID0+IHt9LCBvbkRyYWdnaW5nID0gKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4ge30sIHNsaWRlckVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgdGhpcy5vbkRyYWdTdG9wID0gb25EcmFnU3RvcFxyXG4gICAgdGhpcy5vbkRyYWdTdGFydCA9IG9uRHJhZ1N0YXJ0XHJcbiAgICB0aGlzLm9uRHJhZ2dpbmcgPSBvbkRyYWdnaW5nXHJcbiAgICB0aGlzLnRvcFRvQm90dG9tID0gdG9wVG9Cb3R0b21cclxuICAgIHRoaXMucGVyY2VudGFnZSA9IHN0YXJ0UGVyY2VudGFnZVxyXG5cclxuICAgIHRoaXMuc2xpZGVyRWwgPSBzbGlkZXJFbFxyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyA9IHNsaWRlckVsPy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzcylbMF0gYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCdObyBwcm9ncmVzcyBiYXIgZm91bmQnKVxyXG5cclxuICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgIC8vIGlmIGl0cyB0b3AgdG8gYm90dG9tIHdlIG11c3Qgcm90YXRlIHRoZSBlbGVtZW50IGR1ZSByZXZlcnNlZCBoZWlnaHQgY2hhbmdpbmdcclxuICAgICAgdGhpcy5zbGlkZXJFbCEuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZXgoMTgwZGVnKSdcclxuICAgICAgdGhpcy5zbGlkZXJFbCEuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ3RyYW5zZm9ybS1vcmlnaW46IHRvcCdcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNoYW5nZUJhckxlbmd0aCgpXHJcbiAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnYmFja2dyb3VuZC1jb2xvcicpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUJhciAobW9zUG9zVmFsOiBudW1iZXIpIHtcclxuICAgIGxldCBwb3NpdGlvblxyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgcG9zaXRpb24gPSBtb3NQb3NWYWwgLSB0aGlzLnNsaWRlckVsIS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS55XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwb3NpdGlvbiA9IG1vc1Bvc1ZhbCAtIHRoaXMuc2xpZGVyRWwhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnhcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAvLyBtaW51cyAxMDAgYmVjYXVzZSBtb2RpZnlpbmcgaGVpZ2h0IGlzIHJldmVyc2VkXHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDEwMCAtICgxMDAgKiAocG9zaXRpb24gLyB0aGlzLnNsaWRlckVsIS5jbGllbnRIZWlnaHQpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wZXJjZW50YWdlID0gMTAwICogKHBvc2l0aW9uIC8gdGhpcy5zbGlkZXJFbCEuY2xpZW50V2lkdGgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucGVyY2VudGFnZSA+IDEwMCkge1xyXG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAxMDBcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBlcmNlbnRhZ2UgPCAwKSB7XHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDBcclxuICAgIH1cclxuICAgIHRoaXMuY2hhbmdlQmFyTGVuZ3RoKClcclxuICB9O1xyXG5cclxuICBwcml2YXRlIGNoYW5nZUJhckxlbmd0aCAoKSB7XHJcbiAgICAvLyBzZXQgYmFja2dyb3VuZCBjb2xvciBvZiBhbGwgbW92aW5nIHNsaWRlcnMgcHJvZ3Jlc3MgYXMgdGhlIHNwb3RpZnkgZ3JlZW5cclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMWRiOTU0J1xyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUuaGVpZ2h0ID0gdGhpcy5wZXJjZW50YWdlICsgJyUnXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSB0aGlzLnBlcmNlbnRhZ2UgKyAnJSdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVycyAoKSB7XHJcbiAgICB0aGlzLmFkZE1vdXNlRXZlbnRzKClcclxuICAgIHRoaXMuYWRkVG91Y2hFdmVudHMoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRUb3VjaEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLnNsaWRlckVsPy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWcgPSB0cnVlXHJcbiAgICAgIGlmICh0aGlzLm9uRHJhZ1N0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdGFydCgpXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgpXHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgKGV2dCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdnaW5nKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdG9wKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICAvLyByZW1vdmUgdGhlIGlubGluZSBjc3Mgc28gdGhhdCBpdHMgb3JpZ2luYWwgYmFja2dyb3VuZCBjb2xvciByZXR1cm5zXHJcbiAgICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JhY2tncm91bmQtY29sb3InKVxyXG4gICAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZE1vdXNlRXZlbnRzICgpIHtcclxuICAgIHRoaXMuc2xpZGVyRWw/LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldnQpID0+IHtcclxuICAgICAgdGhpcy5kcmFnID0gdHJ1ZVxyXG4gICAgICBpZiAodGhpcy5vbkRyYWdTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RhcnQoKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFkpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ2dpbmcodGhpcy5wZXJjZW50YWdlKVxyXG4gICAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2xpZW50WSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RvcCh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmxpbmUgY3NzIHNvIHRoYXQgaXRzIG9yaWdpbmFsIGJhY2tncm91bmQgY29sb3IgcmV0dXJuc1xyXG4gICAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJylcclxuICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BvdGlmeVBsYXliYWNrRWxlbWVudCB7XHJcbiAgcHJpdmF0ZSB0aXRsZTogRWxlbWVudCB8IG51bGw7XHJcbiAgcHVibGljIGN1cnJUaW1lOiBFbGVtZW50IHwgbnVsbDtcclxuICBwdWJsaWMgZHVyYXRpb246IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBwbGF5UGF1c2U6IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBzb25nUHJvZ3Jlc3M6IFNsaWRlciB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgdm9sdW1lQmFyOiBTbGlkZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGxcclxuICAgIHRoaXMuY3VyclRpbWUgPSBudWxsXHJcbiAgICB0aGlzLmR1cmF0aW9uID0gbnVsbFxyXG4gICAgdGhpcy5wbGF5UGF1c2UgPSBudWxsXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0QXJ0aXN0cyAoYXJ0aXN0SHRtbDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBhcnRpc3ROYW1lRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJBcnRpc3RzKVxyXG4gICAgaWYgKGFydGlzdE5hbWVFbCkge1xyXG4gICAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdE5hbWVFbClcclxuICAgICAgYXJ0aXN0TmFtZUVsLmlubmVySFRNTCArPSBhcnRpc3RIdG1sXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0SW1nU3JjIChpbWdTcmM6IHN0cmluZykge1xyXG4gICAgY29uc3QgcGxheWVyVHJhY2tJbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5ZXJUcmFja0ltZykgYXMgSFRNTEltYWdlRWxlbWVudFxyXG4gICAgaWYgKHBsYXllclRyYWNrSW1nKSB7XHJcbiAgICAgIHBsYXllclRyYWNrSW1nLnNyYyA9IGltZ1NyY1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFRpdGxlICh0aXRsZTogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBzZXQgdGl0bGUgYmVmb3JlIGl0IGlzIGFzc2lnbmVkJylcclxuICAgIH1cclxuICAgIHRoaXMudGl0bGUhLnRleHRDb250ZW50ID0gdGl0bGVcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRUaXRsZSAoKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLnRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIHNldCB0aXRsZSBiZWZvcmUgaXQgaXMgYXNzaWduZWQnKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMudGl0bGUudGV4dENvbnRlbnQgYXMgc3RyaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmQgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCB0byB0aGUgRE9NIGFsb25nIHdpdGggdGhlIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGJ1dHRvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGxheVByZXZGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gcGF1c2VGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGF1c2UvcGxheSBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gcGxheU5leHRGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqIEBwYXJhbSBvblNlZWtTdGFydCAtIG9uIGRyYWcgc3RhcnQgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNlZWtTb25nIC0gb24gZHJhZyBlbmQgZXZlbnQgdG8gc2VlayBzb25nIGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBvblNlZWtpbmcgLSBvbiBkcmFnZ2luZyBldmVudCBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gc2V0Vm9sdW1lIC0gb24gZHJhZ2dpbmcgYW5kIG9uIGRyYWcgZW5kIGV2ZW50IGZvciB2b2x1bWUgc2xpZGVyXHJcbiAgICogQHBhcmFtIGluaXRpYWxWb2x1bWUgLSB0aGUgaW5pdGlhbCB2b2x1bWUgdG8gc2V0IHRoZSBzbGlkZXIgYXRcclxuICAgKi9cclxuICBwdWJsaWMgYXBwZW5kV2ViUGxheWVySHRtbCAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBvblNlZWtTdGFydDogKCkgPT4gdm9pZCxcclxuICAgIHNlZWtTb25nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgb25TZWVraW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgc2V0Vm9sdW1lOiAocGVyY2VudGFnZTogbnVtYmVyLCBzYXZlOiBib29sZWFuKSA9PiB2b2lkLFxyXG4gICAgaW5pdGlhbFZvbHVtZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgPGFydGljbGUgaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllcn1cIiBjbGFzcz1cInJlc2l6ZS1kcmFnXCI+XHJcbiAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCIgc3JjPVwiJHtjb25maWcuUEFUSFMucHJvZmlsZVVzZXJ9XCIgYWx0PVwidHJhY2tcIiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucGxheWVyVHJhY2tJbWd9XCIvPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY29sdW1ufVwiIHN0eWxlPVwiZmxleC1iYXNpczogMzAlOyBtYXgtd2lkdGg6IDE4LjV2dztcIj5cclxuICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+U2VsZWN0IGEgU29uZzwvaDQ+XHJcbiAgICAgICAgPHNwYW4gaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllckFydGlzdHN9XCI+PC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLndlYlBsYXllckNvbnRyb2xzfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCI+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxhcnRpY2xlIGlkPVwid2ViLXBsYXllci1idXR0b25zXCI+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnNodWZmbGV9XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5zaHVmZmxlSWNvbn1cIi8+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXlQcmV2fVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlQcmV2fVwiIGFsdD1cInByZXZpb3VzXCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQbGF5UGF1c2V9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRufVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5TmV4dH1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJ9XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5TmV4dH1cIiBhbHQ9XCJuZXh0XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9hcnRpY2xlPlxyXG4gICAgICAgICAgPGRpdiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyVm9sdW1lfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2xpZGVyfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3N9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcn1cIj5cclxuICAgICAgICAgIDxwPjA6MDA8L3A+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzc31cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNsaWRlcn1cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnByb2dyZXNzfVwiPjwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvYXJ0aWNsZT5cclxuICAgIGBcclxuXHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGh0bWxUb0VsKGh0bWwpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh3ZWJQbGF5ZXJFbCBhcyBOb2RlKVxyXG4gICAgdGhpcy5nZXRXZWJQbGF5ZXJFbHMoXHJcbiAgICAgIG9uU2Vla1N0YXJ0LFxyXG4gICAgICBzZWVrU29uZyxcclxuICAgICAgb25TZWVraW5nLFxyXG4gICAgICBzZXRWb2x1bWUsXHJcbiAgICAgIGluaXRpYWxWb2x1bWUpXHJcbiAgICB0aGlzLmFzc2lnbkV2ZW50TGlzdGVuZXJzKFxyXG4gICAgICBwbGF5UHJldkZ1bmMsXHJcbiAgICAgIHBhdXNlRnVuYyxcclxuICAgICAgcGxheU5leHRGdW5jXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGVyY2VudERvbmUgdGhlIHBlcmNlbnQgb2YgdGhlIHNvbmcgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gdGhlIGN1cnJlbnQgcG9zaXRpb24gaW4gbXMgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlRWxlbWVudCAocGVyY2VudERvbmU6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikge1xyXG4gICAgLy8gaWYgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyIGRvbid0IGF1dG8gdXBkYXRlXHJcbiAgICBpZiAocG9zaXRpb24gIT09IDAgJiYgIXRoaXMuc29uZ1Byb2dyZXNzIS5kcmFnKSB7XHJcbiAgICAgIC8vIHJvdW5kIGVhY2ggaW50ZXJ2YWwgdG8gdGhlIG5lYXJlc3Qgc2Vjb25kIHNvIHRoYXQgdGhlIG1vdmVtZW50IG9mIHByb2dyZXNzIGJhciBpcyBieSBzZWNvbmQuXHJcbiAgICAgIHRoaXMuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50RG9uZX0lYFxyXG4gICAgICBpZiAodGhpcy5jdXJyVGltZSA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHRpbWUgZWxlbWVudCBpcyBudWxsJylcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhwb3NpdGlvbilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzIG9uY2UgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCBoYXMgYmVlbiBhcHBlbmVkZWQgdG8gdGhlIERPTS4gSW5pdGlhbGl6ZXMgU2xpZGVycy5cclxuICAgKiBAcGFyYW0gb25TZWVrU3RhcnQgLSBvbiBkcmFnIHN0YXJ0IGV2ZW50IGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBzZWVrU29uZyAtIG9uIGRyYWcgZW5kIGV2ZW50IHRvIHNlZWsgc29uZyBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gb25TZWVraW5nIC0gb24gZHJhZ2dpbmcgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNldFZvbHVtZSAtIG9uIGRyYWdnaW5nIGFuZCBvbiBkcmFnIGVuZCBldmVudCBmb3Igdm9sdW1lIHNsaWRlclxyXG4gICAqIEBwYXJhbSBpbml0aWFsVm9sdW1lIC0gdGhlIGluaXRpYWwgdm9sdW1lIHRvIHNldCB0aGUgc2xpZGVyIGF0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRXZWJQbGF5ZXJFbHMgKFxyXG4gICAgb25TZWVrU3RhcnQ6ICgpID0+IHZvaWQsXHJcbiAgICBzZWVrU29uZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIG9uU2Vla2luZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIHNldFZvbHVtZTogKHBlcmNlbnRhZ2U6IG51bWJlciwgc2F2ZTogYm9vbGVhbikgPT4gdm9pZCxcclxuICAgIGluaXRpYWxWb2x1bWU6IG51bWJlcikge1xyXG4gICAgY29uc3Qgd2ViUGxheWVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXIpID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHBsYXlUaW1lQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVRpbWVCYXIpID8/IHRocm93RXhwcmVzc2lvbigncGxheSB0aW1lIGJhciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICBjb25zdCBzb25nU2xpZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzcykgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHByb2dyZXNzIGJhciBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCB2b2x1bWVTbGlkZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclZvbHVtZSkgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHZvbHVtZSBiYXIgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICAgIHRoaXMuc29uZ1Byb2dyZXNzID0gbmV3IFNsaWRlcigwLCBzZWVrU29uZywgZmFsc2UsIG9uU2Vla1N0YXJ0LCBvblNlZWtpbmcsIHNvbmdTbGlkZXJFbClcclxuICAgIHRoaXMudm9sdW1lQmFyID0gbmV3IFNsaWRlcihpbml0aWFsVm9sdW1lICogMTAwLCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIGZhbHNlKSwgZmFsc2UsICgpID0+IHt9LCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIHRydWUpLCB2b2x1bWVTbGlkZXJFbClcclxuXHJcbiAgICB0aGlzLnRpdGxlID0gd2ViUGxheWVyRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2g0JylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgdGl0bGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXl0aW1lIGJhciBlbGVtZW50c1xyXG4gICAgdGhpcy5jdXJyVGltZSA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgY3VycmVudCB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgdGhpcy5kdXJhdGlvbiA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMV0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgZHVyYXRpb24gdGltZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICB0aGlzLnBsYXlQYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc2lnbnMgdGhlIGV2ZW50cyB0byBydW4gb24gZWFjaCBidXR0b24gcHJlc3MgdGhhdCBleGlzdHMgb24gdGhlIHdlYiBwbGF5ZXIgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwbGF5UHJldkZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwYXVzZUZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheS9wYXVzZSBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwbGF5TmV4dEZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3NpZ25FdmVudExpc3RlbmVycyAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQpIHtcclxuICAgIGNvbnN0IHBsYXlQcmV2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVByZXYpXHJcbiAgICBjb25zdCBwbGF5TmV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlOZXh0KVxyXG4gICAgY29uc3Qgc2h1ZmZsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnNodWZmbGUpXHJcblxyXG4gICAgc2h1ZmZsZT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlID0gIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlXHJcbiAgICB9KVxyXG4gICAgcGxheVByZXY/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxheVByZXZGdW5jKVxyXG4gICAgcGxheU5leHQ/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxheU5leHRGdW5jKVxyXG5cclxuICAgIHRoaXMucGxheVBhdXNlPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBhdXNlRnVuYylcclxuICAgIHRoaXMuc29uZ1Byb2dyZXNzPy5hZGRFdmVudExpc3RlbmVycygpXHJcbiAgICB0aGlzLnZvbHVtZUJhcj8uYWRkRXZlbnRMaXN0ZW5lcnMoKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIGh0bWxUb0VsLFxyXG4gIGdldFZhbGlkSW1hZ2UsXHJcbiAgc2h1ZmZsZVxyXG59IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyLFxyXG4gIGlzU2FtZVBsYXlpbmdVUkksXHJcbiAgaXNTYW1lUGxheWluZ1VSSVdpdGhFbCxcclxuICBwbGF5ZXJQdWJsaWNWYXJzXHJcbn0gZnJvbSAnLi9wbGF5YmFjay1zZGsnXHJcbmltcG9ydCBBbGJ1bSBmcm9tICcuL2FsYnVtJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcbmltcG9ydCBQbGF5YWJsZUV2ZW50QXJnIGZyb20gJy4vcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzJ1xyXG5pbXBvcnQgeyBTcG90aWZ5SW1nLCBGZWF0dXJlc0RhdGEsIElBcnRpc3RUcmFja0RhdGEsIElQbGF5YWJsZSwgRXh0ZXJuYWxVcmxzLCBUcmFja0RhdGEgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QsIHsgYXJyYXlUb0RvdWJseUxpbmtlZExpc3QsIERvdWJseUxpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi4vY29tcG9uZW50cy9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL3B1YnN1Yi9hZ2dyZWdhdG9yJ1xyXG5cclxuY29uc3QgZXZlbnRBZ2dyZWdhdG9yID0gKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciBhcyBFdmVudEFnZ3JlZ2F0b3JcclxuXHJcbmNsYXNzIFRyYWNrIGV4dGVuZHMgQ2FyZCBpbXBsZW1lbnRzIElQbGF5YWJsZSB7XHJcbiAgcHJpdmF0ZSBleHRlcm5hbFVybHM6IEV4dGVybmFsVXJscztcclxuICBwcml2YXRlIF9pZDogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3RpdGxlOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfZHVyYXRpb246IHN0cmluZztcclxuICBwcml2YXRlIF91cmk6IHN0cmluZztcclxuICBwcml2YXRlIF9kYXRlQWRkZWRUb1BsYXlsaXN0OiBEYXRlO1xyXG5cclxuICBwb3B1bGFyaXR5OiBzdHJpbmc7XHJcbiAgcmVsZWFzZURhdGU6IERhdGU7XHJcbiAgYWxidW06IEFsYnVtO1xyXG4gIGZlYXR1cmVzOiBGZWF0dXJlc0RhdGEgfCB1bmRlZmluZWQ7XHJcbiAgaW1hZ2VVcmw6IHN0cmluZztcclxuICBzZWxFbDogRWxlbWVudDtcclxuICBvblBsYXlpbmc6IEZ1bmN0aW9uXHJcbiAgb25TdG9wcGVkOiBGdW5jdGlvblxyXG4gIGFydGlzdHNIdG1sOiBzdHJpbmdcclxuXHJcbiAgcHVibGljIGdldCBpZCAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9pZFxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB0aXRsZSAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl90aXRsZVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB1cmkgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fdXJpXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGRhdGVBZGRlZFRvUGxheWxpc3QgKCk6IERhdGUge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3RcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXREYXRlQWRkZWRUb1BsYXlsaXN0ICh2YWw6IHN0cmluZyB8IG51bWJlciB8IERhdGUpIHtcclxuICAgIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3QgPSBuZXcgRGF0ZSh2YWwpXHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvciAocHJvcHM6IHsgdGl0bGU6IHN0cmluZzsgaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPjsgZHVyYXRpb246IG51bWJlcjsgdXJpOiBzdHJpbmc7IHBvcHVsYXJpdHk6IHN0cmluZzsgcmVsZWFzZURhdGU6IHN0cmluZzsgaWQ6IHN0cmluZzsgYWxidW06IEFsYnVtOyBleHRlcm5hbFVybHM6IEV4dGVybmFsVXJsczsgYXJ0aXN0czogQXJyYXk8dW5rbm93bj47IGlkeDogbnVtYmVyIH0pIHtcclxuICAgIHN1cGVyKClcclxuICAgIGNvbnN0IHtcclxuICAgICAgdGl0bGUsXHJcbiAgICAgIGltYWdlcyxcclxuICAgICAgZHVyYXRpb24sXHJcbiAgICAgIHVyaSxcclxuICAgICAgcG9wdWxhcml0eSxcclxuICAgICAgcmVsZWFzZURhdGUsXHJcbiAgICAgIGlkLFxyXG4gICAgICBhbGJ1bSxcclxuICAgICAgZXh0ZXJuYWxVcmxzLFxyXG4gICAgICBhcnRpc3RzXHJcbiAgICB9ID0gcHJvcHNcclxuXHJcbiAgICB0aGlzLmV4dGVybmFsVXJscyA9IGV4dGVybmFsVXJsc1xyXG4gICAgdGhpcy5faWQgPSBpZFxyXG4gICAgdGhpcy5fdGl0bGUgPSB0aXRsZVxyXG4gICAgdGhpcy5hcnRpc3RzSHRtbCA9IHRoaXMuZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMoYXJ0aXN0cylcclxuICAgIHRoaXMuX2R1cmF0aW9uID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhkdXJhdGlvbilcclxuICAgIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3QgPSBuZXcgRGF0ZSgpXHJcblxyXG4gICAgLy8gZWl0aGVyIHRoZSBub3JtYWwgdXJpLCBvciB0aGUgbGlua2VkX2Zyb20udXJpXHJcbiAgICB0aGlzLl91cmkgPSB1cmlcclxuICAgIHRoaXMucG9wdWxhcml0eSA9IHBvcHVsYXJpdHlcclxuICAgIHRoaXMucmVsZWFzZURhdGUgPSBuZXcgRGF0ZShyZWxlYXNlRGF0ZSlcclxuICAgIHRoaXMuYWxidW0gPSBhbGJ1bVxyXG4gICAgdGhpcy5mZWF0dXJlcyA9IHVuZGVmaW5lZFxyXG5cclxuICAgIHRoaXMuaW1hZ2VVcmwgPSBnZXRWYWxpZEltYWdlKGltYWdlcylcclxuICAgIHRoaXMuc2VsRWwgPSBodG1sVG9FbCgnPD48Lz4nKSBhcyBFbGVtZW50XHJcblxyXG4gICAgdGhpcy5vblBsYXlpbmcgPSAoKSA9PiB7fVxyXG4gICAgdGhpcy5vblN0b3BwZWQgPSAoKSA9PiB7fVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaWx0ZXJEYXRhRnJvbUFydGlzdHMgKGFydGlzdHM6IEFycmF5PHVua25vd24+KSB7XHJcbiAgICByZXR1cm4gYXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4gYXJ0aXN0IGFzIElBcnRpc3RUcmFja0RhdGEpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdlbmVyYXRlSFRNTEFydGlzdE5hbWVzIChhcnRpc3RzOiBBcnJheTx1bmtub3duPikge1xyXG4gICAgY29uc3QgYXJ0aXN0c0RhdGFzID0gdGhpcy5maWx0ZXJEYXRhRnJvbUFydGlzdHMoYXJ0aXN0cylcclxuICAgIGxldCBhcnRpc3ROYW1lcyA9ICcnXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFydGlzdHNEYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBhcnRpc3QgPSBhcnRpc3RzRGF0YXNbaV1cclxuICAgICAgYXJ0aXN0TmFtZXMgKz0gYDxhIGhyZWY9XCIke2FydGlzdC5leHRlcm5hbF91cmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcnRpc3QubmFtZX08L2E+YFxyXG5cclxuICAgICAgaWYgKGkgPCBhcnRpc3RzRGF0YXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIGFydGlzdE5hbWVzICs9ICcsICdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFydGlzdE5hbWVzXHJcbiAgfVxyXG5cclxuICAvKiogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIHRyYWNrLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFRyYWNrQ2FyZEh0bWwgKGlkeDogbnVtYmVyLCB1bmFuaW1hdGVkQXBwZWFyID0gZmFsc2UpIDogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLnRyYWNrUHJlZml4fSR7aWR4fWBcclxuICAgIHRoaXMuY2FyZElkID0gaWRcclxuICAgIGNvbnN0IGFwcGVhckNsYXNzID0gdW5hbmltYXRlZEFwcGVhciA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIgOiAnJ1xyXG5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZhZGVJblxyXG4gICAgfSAke2FwcGVhckNsYXNzfVwiPlxyXG4gICAgICAgICAgICAgIDxoNCBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucmFua31cIj4ke2lkeCArIDF9LjwvaDQ+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3RcclxuICAgIH0gICR7Y29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJ9XCI+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkSW5uZXJcclxuICAgIH0gJHtjb25maWcuQ1NTLkNMQVNTRVMudHJhY2t9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEZyb250XHJcbiAgICAgICAgICAgICAgICAgIH1cIiAgdGl0bGU9XCJDbGljayB0byB2aWV3IG1vcmUgSW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMucmVzdHJpY3RGbGlwT25DbGlja309XCJ0cnVlXCIgaWQ9XCIke3RoaXMuX3VyaX1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiIHRpdGxlPVwiQ2xpY2sgdG8gcGxheSBzb25nXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMuaW1hZ2VVcmx9XCIgYWx0PVwiQWxidW0gQ292ZXJcIj48L2ltZz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5EdXJhdGlvbjo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5fZHVyYXRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5SZWxlYXNlIERhdGU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMucmVsZWFzZURhdGUudG9EYXRlU3RyaW5nKCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5BbGJ1bSBOYW1lOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwICR7Y29uZmlnLkNTUy5BVFRSSUJVVEVTLnJlc3RyaWN0RmxpcE9uQ2xpY2t9PVwidHJ1ZVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPiR7XHJcbiAgICAgIHRoaXMuYWxidW0ubmFtZVxyXG4gICAgfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbCkgYXMgSFRNTEVsZW1lbnRcclxuICAgIGNvbnN0IHBsYXlCdG4gPSBlbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRuKVswXVxyXG5cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5QnRuXHJcblxyXG4gICAgcGxheUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgdHJhY2tOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4odGhpcylcclxuICAgICAgdGhpcy5wbGF5UGF1c2VDbGljayh0cmFja05vZGUpXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBsYXlQYXVzZUNsaWNrICh0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4sIHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxJUGxheWFibGU+IHwgbnVsbCA9IG51bGwpIHtcclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcyBhcyBJUGxheWFibGVcclxuICAgIGxldCB0cmFja0FyciA9IG51bGxcclxuXHJcbiAgICBpZiAodHJhY2tMaXN0KSB7XHJcbiAgICAgIHRyYWNrQXJyID0gdHJhY2tMaXN0LnRvQXJyYXkoKVxyXG4gICAgfVxyXG4gICAgZXZlbnRBZ2dyZWdhdG9yLnB1Ymxpc2gobmV3IFBsYXlhYmxlRXZlbnRBcmcodHJhY2ssIHRyYWNrTm9kZSwgdHJhY2tBcnIpKVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldCBhIHRyYWNrIGh0bWwgdG8gYmUgcGxhY2VkIGFzIGEgbGlzdCBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5RGF0ZSAtIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgZGF0ZS5cclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQbGF5bGlzdFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4sIGRpc3BsYXlEYXRlOiBib29sZWFuID0gdHJ1ZSk6IE5vZGUge1xyXG4gICAgY29uc3QgdHJhY2tOb2RlID0gdHJhY2tMaXN0LmZpbmQoKHgpID0+IHgudXJpID09PSB0aGlzLnVyaSwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgLy8gZm9yIHRoZSB1bmlxdWUgcGxheSBwYXVzZSBJRCBhbHNvIHVzZSB0aGUgZGF0ZSBhZGRlZCB0byBwbGF5bGlzdCBhcyB0aGVyZSBjYW4gYmUgZHVwbGljYXRlcyBvZiBhIHNvbmcgaW4gYSBwbGF5bGlzdC5cclxuICAgIGNvbnN0IHBsYXlQYXVzZUlkID0gdGhpcy5fdXJpICsgdGhpcy5kYXRlQWRkZWRUb1BsYXlsaXN0XHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RUcmFja31cIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtwbGF5UGF1c2VJZH1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIiBzcmM9XCIke1xyXG4gICAgICB0aGlzLmltYWdlVXJsXHJcbiAgICB9XCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmxpbmtzfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubmFtZVxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX1cclxuICAgICAgICAgICAgICAgICAgPC9oND5cclxuICAgICAgICAgICAgICAgIDxhLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dGhpcy5hcnRpc3RzSHRtbH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgICAgJHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlEYXRlXHJcbiAgICAgICAgICAgICAgICAgID8gYDxoNT4ke3RoaXMuZGF0ZUFkZGVkVG9QbGF5bGlzdC50b0xvY2FsZURhdGVTdHJpbmcoKX08L2g1PmBcclxuICAgICAgICAgICAgICAgICAgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbClcclxuXHJcbiAgICAvLyBnZXQgcGxheSBwYXVzZSBidXR0b25cclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ0biA9IGVsPy5jaGlsZE5vZGVzWzFdXHJcbiAgICBpZiAocGxheVBhdXNlQnRuID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxheSBwYXVzZSBidXR0b24gb24gdHJhY2sgd2FzIG5vdCBmb3VuZCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbEVsID0gcGxheVBhdXNlQnRuIGFzIEVsZW1lbnRcclxuICAgIHBsYXlQYXVzZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSwgdHJhY2tMaXN0KSlcclxuXHJcbiAgICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyKHRoaXMudXJpLCBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudCwgdHJhY2tOb2RlKVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICAvKiogR2V0IGEgdHJhY2sgaHRtbCB0byBiZSBwbGFjZWQgYXMgYSBsaXN0IGVsZW1lbnQgb24gYSByYW5rZWQgbGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz59IHRyYWNrTGlzdCAtIGxpc3Qgb2YgdHJhY2tzIHRoYXQgY29udGFpbnMgdGhpcyB0cmFjay5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFuayAtIHRoZSByYW5rIG9mIHRoaXMgY2FyZFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFJhbmtlZFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiwgcmFuazogbnVtYmVyKTogTm9kZSB7XHJcbiAgICBjb25zdCB0cmFja05vZGUgPSB0cmFja0xpc3QuZmluZCgoeCkgPT4geC51cmkgPT09IHRoaXMudXJpLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFRyYWNrfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucmFua2VkVHJhY2tJbnRlcmFjdH0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cIiR7dGhpcy5fdXJpfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgICAgaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh0aGlzLnVyaSkgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgICAgICAgICAgICAgfVwiPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxwPiR7cmFua30uPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCIgc3JjPVwiJHtcclxuICAgICAgdGhpcy5pbWFnZVVybFxyXG4gICAgfVwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5saW5rc31cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3RoaXMuZXh0ZXJuYWxVcmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5hbWVcclxuICAgIH1cIj4ke3RoaXMudGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8YS8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlxyXG4gICAgICAgICAgICAgICAgICAke3RoaXMuYXJ0aXN0c0h0bWx9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aDU+JHt0aGlzLl9kdXJhdGlvbn08L2g1PlxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKVxyXG5cclxuICAgIC8vIGdldCBwbGF5IHBhdXNlIGJ1dHRvblxyXG4gICAgY29uc3QgcGxheVBhdXNlQnRuID0gZWw/LmNoaWxkTm9kZXNbMV0uY2hpbGROb2Rlc1sxXVxyXG5cclxuICAgIGlmIChwbGF5UGF1c2VCdG4gPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGF5IHBhdXNlIGJ1dHRvbiBvbiB0cmFjayB3YXMgbm90IGZvdW5kJylcclxuICAgIH1cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudFxyXG5cclxuICAgIC8vIHNlbGVjdCB0aGUgcmFuayBhcmVhIGFzIHRvIGtlZXAgdGhlIHBsYXkvcGF1c2UgaWNvbiBzaG93blxyXG4gICAgY29uc3QgcmFua2VkSW50ZXJhY3QgPSAoZWwgYXMgSFRNTEVsZW1lbnQpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnJhbmtlZFRyYWNrSW50ZXJhY3QpWzBdXHJcbiAgICB0aGlzLm9uUGxheWluZyA9ICgpID0+IHJhbmtlZEludGVyYWN0LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5vblN0b3BwZWQgPSAoKSA9PiByYW5rZWRJbnRlcmFjdC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuXHJcbiAgICBwbGF5UGF1c2VCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSwgdHJhY2tMaXN0KVxyXG4gICAgfSlcclxuXHJcbiAgICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyKHRoaXMudXJpLCBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudCwgdHJhY2tOb2RlKVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICAvKiogTG9hZCB0aGUgZmVhdHVyZXMgb2YgdGhpcyB0cmFjayBmcm9tIHRoZSBzcG90aWZ5IHdlYiBhcGkuICovXHJcbiAgcHVibGljIGFzeW5jIGxvYWRGZWF0dXJlcyAoKSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvc1xyXG4gICAgICAuZ2V0KGNvbmZpZy5VUkxzLmdldFRyYWNrRmVhdHVyZXMgKyB0aGlzLmlkKVxyXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgIHRocm93IGVyclxyXG4gICAgICB9KVxyXG4gICAgY29uc3QgZmVhdHMgPSByZXMuZGF0YS5hdWRpb19mZWF0dXJlc1xyXG4gICAgdGhpcy5mZWF0dXJlcyA9IHtcclxuICAgICAgZGFuY2VhYmlsaXR5OiBmZWF0cy5kYW5jZWFiaWxpdHksXHJcbiAgICAgIGFjb3VzdGljbmVzczogZmVhdHMuYWNvdXN0aWNuZXNzLFxyXG4gICAgICBpbnN0cnVtZW50YWxuZXNzOiBmZWF0cy5pbnN0cnVtZW50YWxuZXNzLFxyXG4gICAgICB2YWxlbmNlOiBmZWF0cy52YWxlbmNlLFxyXG4gICAgICBlbmVyZ3k6IGZlYXRzLmVuZXJneVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmZlYXR1cmVzXHJcbiAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJhdGUgdHJhY2tzIGZyb20gZGF0YSBleGNsdWRpbmcgZGF0ZSBhZGRlZC5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxUcmFja0RhdGE+fSBkYXRhc1xyXG4gKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgQXJyYXk8VHJhY2s+fSB0cmFja3MgLSBkb3VibGUgbGlua2VkIGxpc3RcclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhIChkYXRhczogQXJyYXk8VHJhY2tEYXRhPiwgdHJhY2tzOiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IEFycmF5PFRyYWNrPikge1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IGRhdGEgPSBkYXRhc1tpXVxyXG4gICAgaWYgKGRhdGEpIHtcclxuICAgICAgY29uc3QgcHJvcHMgPSB7XHJcbiAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICBpbWFnZXM6IGRhdGEuYWxidW0uaW1hZ2VzLFxyXG4gICAgICAgIGR1cmF0aW9uOiBkYXRhLmR1cmF0aW9uX21zLFxyXG4gICAgICAgIHVyaTogZGF0YS5saW5rZWRfZnJvbSAhPT0gdW5kZWZpbmVkID8gZGF0YS5saW5rZWRfZnJvbS51cmkgOiBkYXRhLnVyaSxcclxuICAgICAgICBwb3B1bGFyaXR5OiBkYXRhLnBvcHVsYXJpdHksXHJcbiAgICAgICAgcmVsZWFzZURhdGU6IGRhdGEuYWxidW0ucmVsZWFzZV9kYXRlLFxyXG4gICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgIGFsYnVtOiBuZXcgQWxidW0oZGF0YS5hbGJ1bS5uYW1lLCBkYXRhLmFsYnVtLmV4dGVybmFsX3VybHMuc3BvdGlmeSksXHJcbiAgICAgICAgZXh0ZXJuYWxVcmxzOiBkYXRhLmV4dGVybmFsX3VybHMsXHJcbiAgICAgICAgYXJ0aXN0czogZGF0YS5hcnRpc3RzLFxyXG4gICAgICAgIGlkeDogaVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRyYWNrcykpIHtcclxuICAgICAgICB0cmFja3MucHVzaChuZXcgVHJhY2socHJvcHMpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRyYWNrcy5hZGQobmV3IFRyYWNrKHByb3BzKSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHJhY2tzXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyYWNrXHJcbiIsIlxyXG5pbXBvcnQgeyBJUHJvbWlzZUhhbmRsZXJSZXR1cm4sIFNwb3RpZnlJbWcgfSBmcm9tICcuLi90eXBlcydcclxuaW1wb3J0IHsgVEVSTVMsIFRFUk1fVFlQRSB9IGZyb20gJy4vY29tcG9uZW50cy9zYXZlLWxvYWQtdGVybSdcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY29uc3QgYXV0aEVuZHBvaW50ID0gJ2h0dHBzOi8vYWNjb3VudHMuc3BvdGlmeS5jb20vYXV0aG9yaXplJ1xyXG4vLyBSZXBsYWNlIHdpdGggeW91ciBhcHAncyBjbGllbnQgSUQsIHJlZGlyZWN0IFVSSSBhbmQgZGVzaXJlZCBzY29wZXNcclxuY29uc3QgcmVkaXJlY3RVcmkgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ1xyXG5jb25zdCBjbGllbnRJZCA9ICc0MzRmNWU5ZjQ0MmE0ZTQ1ODZlMDg5YTMzZjY1Yzg1NydcclxuY29uc3Qgc2NvcGVzID0gW1xyXG4gICd1Z2MtaW1hZ2UtdXBsb2FkJyxcclxuICAndXNlci1yZWFkLXBsYXliYWNrLXN0YXRlJyxcclxuICAndXNlci1tb2RpZnktcGxheWJhY2stc3RhdGUnLFxyXG4gICd1c2VyLXJlYWQtY3VycmVudGx5LXBsYXlpbmcnLFxyXG4gICdzdHJlYW1pbmcnLFxyXG4gICdhcHAtcmVtb3RlLWNvbnRyb2wnLFxyXG4gICd1c2VyLXJlYWQtZW1haWwnLFxyXG4gICd1c2VyLXJlYWQtcHJpdmF0ZScsXHJcbiAgJ3BsYXlsaXN0LXJlYWQtY29sbGFib3JhdGl2ZScsXHJcbiAgJ3BsYXlsaXN0LW1vZGlmeS1wdWJsaWMnLFxyXG4gICdwbGF5bGlzdC1yZWFkLXByaXZhdGUnLFxyXG4gICdwbGF5bGlzdC1tb2RpZnktcHJpdmF0ZScsXHJcbiAgJ3VzZXItbGlicmFyeS1tb2RpZnknLFxyXG4gICd1c2VyLWxpYnJhcnktcmVhZCcsXHJcbiAgJ3VzZXItdG9wLXJlYWQnLFxyXG4gICd1c2VyLXJlYWQtcGxheWJhY2stcG9zaXRpb24nLFxyXG4gICd1c2VyLXJlYWQtcmVjZW50bHktcGxheWVkJyxcclxuICAndXNlci1mb2xsb3ctcmVhZCcsXHJcbiAgJ3VzZXItZm9sbG93LW1vZGlmeSdcclxuXVxyXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xyXG4gIENTUzoge1xyXG4gICAgSURzOiB7XHJcbiAgICAgIHJlbW92ZUVhcmx5QWRkZWQ6ICdyZW1vdmUtZWFybHktYWRkZWQnLFxyXG4gICAgICBnZXRUb2tlbkxvYWRpbmdTcGlubmVyOiAnZ2V0LXRva2VuLWxvYWRpbmctc3Bpbm5lcicsXHJcbiAgICAgIHBsYXlsaXN0Q2FyZHNDb250YWluZXI6ICdwbGF5bGlzdC1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICB0cmFja0NhcmRzQ29udGFpbmVyOiAndHJhY2stY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgcGxheWxpc3RQcmVmaXg6ICdwbGF5bGlzdC0nLFxyXG4gICAgICB0cmFja1ByZWZpeDogJ3RyYWNrLScsXHJcbiAgICAgIHNwb3RpZnlDb250YWluZXI6ICdzcG90aWZ5LWNvbnRhaW5lcicsXHJcbiAgICAgIGluZm9Db250YWluZXI6ICdpbmZvLWNvbnRhaW5lcicsXHJcbiAgICAgIGFsbG93QWNjZXNzSGVhZGVyOiAnYWxsb3ctYWNjZXNzLWhlYWRlcicsXHJcbiAgICAgIGV4cGFuZGVkUGxheWxpc3RNb2RzOiAnZXhwYW5kZWQtcGxheWxpc3QtbW9kcycsXHJcbiAgICAgIHBsYXlsaXN0TW9kczogJ3BsYXlsaXN0LW1vZHMnLFxyXG4gICAgICB0cmFja3NEYXRhOiAndHJhY2tzLWRhdGEnLFxyXG4gICAgICB0cmFja3NDaGFydDogJ3RyYWNrcy1jaGFydCcsXHJcbiAgICAgIHRyYWNrc1Rlcm1TZWxlY3Rpb25zOiAndHJhY2tzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIGZlYXR1cmVTZWxlY3Rpb25zOiAnZmVhdHVyZS1zZWxlY3Rpb25zJyxcclxuICAgICAgcGxheWxpc3RzU2VjdGlvbjogJ3BsYXlsaXN0cy1zZWN0aW9uJyxcclxuICAgICAgdW5kbzogJ3VuZG8nLFxyXG4gICAgICByZWRvOiAncmVkbycsXHJcbiAgICAgIG1vZHNPcGVuZXI6ICdtb2RzLW9wZW5lcicsXHJcbiAgICAgIGZlYXREZWY6ICdmZWF0LWRlZmluaXRpb24nLFxyXG4gICAgICBmZWF0QXZlcmFnZTogJ2ZlYXQtYXZlcmFnZScsXHJcbiAgICAgIHJhbms6ICdyYW5rJyxcclxuICAgICAgdmlld0FsbFRvcFRyYWNrczogJ3ZpZXctYWxsLXRvcC10cmFja3MnLFxyXG4gICAgICBlbW9qaXM6ICdlbW9qaXMnLFxyXG4gICAgICBhcnRpc3RDYXJkc0NvbnRhaW5lcjogJ2FydGlzdC1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICBhcnRpc3RQcmVmaXg6ICdhcnRpc3QtJyxcclxuICAgICAgaW5pdGlhbENhcmQ6ICdpbml0aWFsLWNhcmQnLFxyXG4gICAgICBjb252ZXJ0Q2FyZDogJ2NvbnZlcnQtY2FyZCcsXHJcbiAgICAgIGFydGlzdFRlcm1TZWxlY3Rpb25zOiAnYXJ0aXN0cy10ZXJtLXNlbGVjdGlvbnMnLFxyXG4gICAgICBwcm9maWxlSGVhZGVyOiAncHJvZmlsZS1oZWFkZXInLFxyXG4gICAgICBjbGVhckRhdGE6ICdjbGVhci1kYXRhJyxcclxuICAgICAgbGlrZWRUcmFja3M6ICdsaWtlZC10cmFja3MnLFxyXG4gICAgICBmb2xsb3dlZEFydGlzdHM6ICdmb2xsb3dlZC1hcnRpc3RzJyxcclxuICAgICAgd2ViUGxheWVyOiAnd2ViLXBsYXllcicsXHJcbiAgICAgIHBsYXlUaW1lQmFyOiAncGxheXRpbWUtYmFyJyxcclxuICAgICAgcGxheWxpc3RIZWFkZXJBcmVhOiAncGxheWxpc3QtbWFpbi1oZWFkZXItYXJlYScsXHJcbiAgICAgIHBsYXlOZXh0OiAncGxheS1uZXh0JyxcclxuICAgICAgcGxheVByZXY6ICdwbGF5LXByZXYnLFxyXG4gICAgICB3ZWJQbGF5ZXJQbGF5UGF1c2U6ICdwbGF5LXBhdXNlLXBsYXllcicsXHJcbiAgICAgIHdlYlBsYXllclZvbHVtZTogJ3dlYi1wbGF5ZXItdm9sdW1lLWJhcicsXHJcbiAgICAgIHdlYlBsYXllclByb2dyZXNzOiAnd2ViLXBsYXllci1wcm9ncmVzcy1iYXInLFxyXG4gICAgICBwbGF5ZXJUcmFja0ltZzogJ3BsYXllci10cmFjay1pbWcnLFxyXG4gICAgICB3ZWJQbGF5ZXJBcnRpc3RzOiAnd2ViLXBsYXllci1hcnRpc3RzJyxcclxuICAgICAgZ2VuZXJhdGVQbGF5bGlzdDogJ2dlbmVyYXRlLXBsYXlsaXN0JyxcclxuICAgICAgaGlkZVNob3dQbGF5bGlzdFR4dDogJ2hpZGUtc2hvdy1wbGF5bGlzdC10eHQnLFxyXG4gICAgICB0b3BUcmFja3NUZXh0Rm9ybUNvbnRhaW5lcjogJ3Rlcm0tdGV4dC1mb3JtLWNvbnRhaW5lcicsXHJcbiAgICAgIHVzZXJuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgICB0b3BOYXZNb2JpbGU6ICd0b3BuYXYtbW9iaWxlJyxcclxuICAgICAgc2h1ZmZsZTogJ3NodWZmbGUnXHJcbiAgICB9LFxyXG4gICAgQ0xBU1NFUzoge1xyXG4gICAgICBnbG93OiAnZ2xvdycsXHJcbiAgICAgIHBsYXlsaXN0OiAncGxheWxpc3QnLFxyXG4gICAgICB0cmFjazogJ3RyYWNrJyxcclxuICAgICAgYXJ0aXN0OiAnYXJ0aXN0JyxcclxuICAgICAgcmFua0NhcmQ6ICdyYW5rLWNhcmQnLFxyXG4gICAgICBwbGF5bGlzdFRyYWNrOiAncGxheWxpc3QtdHJhY2snLFxyXG4gICAgICBpbmZvTG9hZGluZ1NwaW5uZXJzOiAnaW5mby1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBhcHBlYXI6ICdhcHBlYXInLFxyXG4gICAgICBoaWRlOiAnaGlkZScsXHJcbiAgICAgIHNlbGVjdGVkOiAnc2VsZWN0ZWQnLFxyXG4gICAgICBjYXJkOiAnY2FyZCcsXHJcbiAgICAgIHBsYXlsaXN0U2VhcmNoOiAncGxheWxpc3Qtc2VhcmNoJyxcclxuICAgICAgZWxsaXBzaXNXcmFwOiAnZWxsaXBzaXMtd3JhcCcsXHJcbiAgICAgIG5hbWU6ICduYW1lJyxcclxuICAgICAgcGxheWxpc3RPcmRlcjogJ3BsYXlsaXN0LW9yZGVyJyxcclxuICAgICAgY2hhcnRJbmZvOiAnY2hhcnQtaW5mbycsXHJcbiAgICAgIGZsaXBDYXJkSW5uZXI6ICdmbGlwLWNhcmQtaW5uZXInLFxyXG4gICAgICBmbGlwQ2FyZEZyb250OiAnZmxpcC1jYXJkLWZyb250JyxcclxuICAgICAgZmxpcENhcmRCYWNrOiAnZmxpcC1jYXJkLWJhY2snLFxyXG4gICAgICBmbGlwQ2FyZDogJ2ZsaXAtY2FyZCcsXHJcbiAgICAgIHJlc2l6ZUNvbnRhaW5lcjogJ3Jlc2l6ZS1jb250YWluZXInLFxyXG4gICAgICBzY3JvbGxMZWZ0OiAnc2Nyb2xsLWxlZnQnLFxyXG4gICAgICBzY3JvbGxpbmdUZXh0OiAnc2Nyb2xsaW5nLXRleHQnLFxyXG4gICAgICBub1NlbGVjdDogJ25vLXNlbGVjdCcsXHJcbiAgICAgIGRyb3BEb3duOiAnZHJvcC1kb3duJyxcclxuICAgICAgZXhwYW5kYWJsZVR4dENvbnRhaW5lcjogJ2V4cGFuZGFibGUtdGV4dC1jb250YWluZXInLFxyXG4gICAgICBib3JkZXJDb3ZlcjogJ2JvcmRlci1jb3ZlcicsXHJcbiAgICAgIGZpcnN0RXhwYW5zaW9uOiAnZmlyc3QtZXhwYW5zaW9uJyxcclxuICAgICAgc2Vjb25kRXhwYW5zaW9uOiAnc2Vjb25kLWV4cGFuc2lvbicsXHJcbiAgICAgIGludmlzaWJsZTogJ2ludmlzaWJsZScsXHJcbiAgICAgIGZhZGVJbjogJ2ZhZGUtaW4nLFxyXG4gICAgICBmcm9tVG9wOiAnZnJvbS10b3AnLFxyXG4gICAgICBleHBhbmRPbkhvdmVyOiAnZXhwYW5kLW9uLWhvdmVyJyxcclxuICAgICAgdHJhY2tzQXJlYTogJ3RyYWNrcy1hcmVhJyxcclxuICAgICAgc2Nyb2xsQmFyOiAnc2Nyb2xsLWJhcicsXHJcbiAgICAgIHRyYWNrTGlzdDogJ3RyYWNrLWxpc3QnLFxyXG4gICAgICBhcnRpc3RUb3BUcmFja3M6ICdhcnRpc3QtdG9wLXRyYWNrcycsXHJcbiAgICAgIHRleHRGb3JtOiAndGV4dC1mb3JtJyxcclxuICAgICAgY29udGVudDogJ2NvbnRlbnQnLFxyXG4gICAgICBsaW5rczogJ2xpbmtzJyxcclxuICAgICAgcHJvZ3Jlc3M6ICdwcm9ncmVzcycsXHJcbiAgICAgIHBsYXlQYXVzZTogJ3BsYXktcGF1c2UnLFxyXG4gICAgICByYW5rZWRUcmFja0ludGVyYWN0OiAncmFua2VkLWludGVyYWN0aW9uLWFyZWEnLFxyXG4gICAgICBzbGlkZXI6ICdzbGlkZXInLFxyXG4gICAgICBwbGF5QnRuOiAncGxheS1idG4nLFxyXG4gICAgICBkaXNwbGF5Tm9uZTogJ2Rpc3BsYXktbm9uZScsXHJcbiAgICAgIGNvbHVtbjogJ2NvbHVtbicsXHJcbiAgICAgIHdlYlBsYXllckNvbnRyb2xzOiAnd2ViLXBsYXllci1jb250cm9scydcclxuICAgIH0sXHJcbiAgICBBVFRSSUJVVEVTOiB7XHJcbiAgICAgIGRhdGFTZWxlY3Rpb246ICdkYXRhLXNlbGVjdGlvbicsXHJcbiAgICAgIHJlc3RyaWN0RmxpcE9uQ2xpY2s6ICdkYXRhLXJlc3RyaWN0LWZsaXAtb24tY2xpY2snXHJcbiAgICB9XHJcbiAgfSxcclxuICBVUkxzOiB7XHJcbiAgICBzaXRlVXJsOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgIGF1dGg6IGAke2F1dGhFbmRwb2ludH0/Y2xpZW50X2lkPSR7Y2xpZW50SWR9JnJlZGlyZWN0X3VyaT0ke3JlZGlyZWN0VXJpfSZzY29wZT0ke3Njb3Blcy5qb2luKFxyXG4gICAgICAnJTIwJ1xyXG4gICAgKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNob3dfZGlhbG9nPXRydWVgLFxyXG4gICAgZ2V0SGFzVG9rZW5zOiAnL3Rva2Vucy9oYXMtdG9rZW5zJyxcclxuICAgIGdldEFjY2Vzc1Rva2VuOiAnL3Rva2Vucy9nZXQtYWNjZXNzLXRva2VuJyxcclxuICAgIGdldE9idGFpblRva2Vuc1ByZWZpeDogKGNvZGU6IHN0cmluZykgPT4gYC90b2tlbnMvb2J0YWluLXRva2Vucz9jb2RlPSR7Y29kZX1gLFxyXG4gICAgZ2V0VG9wQXJ0aXN0czogJy9zcG90aWZ5L2dldC10b3AtYXJ0aXN0cz90aW1lX3JhbmdlPScsXHJcbiAgICBnZXRUb3BUcmFja3M6ICcvc3BvdGlmeS9nZXQtdG9wLXRyYWNrcz90aW1lX3JhbmdlPScsXHJcbiAgICBnZXRQbGF5bGlzdHM6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3RzJyxcclxuICAgIGdldFBsYXlsaXN0VHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0LXRyYWNrcz9wbGF5bGlzdF9pZD0nLFxyXG4gICAgcHV0Q2xlYXJUb2tlbnM6ICcvdG9rZW5zL2NsZWFyLXRva2VucycsXHJcbiAgICBkZWxldGVQbGF5bGlzdFRyYWNrczogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L2RlbGV0ZS1wbGF5bGlzdC1pdGVtcz9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIHBvc3RQbGF5bGlzdFRyYWNrczogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtcGxheWxpc3QtaXRlbXM/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBnZXRUcmFja0ZlYXR1cmVzOiAnL3Nwb3RpZnkvZ2V0LXRyYWNrcy1mZWF0dXJlcz90cmFja19pZHM9JyxcclxuICAgIHB1dFJlZnJlc2hBY2Nlc3NUb2tlbjogJy90b2tlbnMvcmVmcmVzaC10b2tlbicsXHJcbiAgICBwdXRTZXNzaW9uRGF0YTogJy9zcG90aWZ5L3B1dC1zZXNzaW9uLWRhdGE/YXR0cj0nLFxyXG4gICAgcHV0UGxheWxpc3RSZXNpemVEYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtcGxheWxpc3QtcmVzaXplLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5bGlzdFJlc2l6ZURhdGE6ICcvdXNlci9nZXQtcGxheWxpc3QtcmVzaXplLWRhdGEnLFxyXG4gICAgcHV0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtcGxheWxpc3QtdGV4dC1mb3JtLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGE6ICcvdXNlci9nZXQtcGxheWxpc3QtdGV4dC1mb3JtLWRhdGEnLFxyXG4gICAgcHV0VG9wVHJhY2tzSXNJblRleHRGb3JtRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXRvcC10cmFja3MtdGV4dC1mb3JtLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRUb3BUcmFja3NJc0luVGV4dEZvcm1EYXRhOiAnL3VzZXIvZ2V0LXRvcC10cmFja3MtdGV4dC1mb3JtLWRhdGEnLFxyXG4gICAgZ2V0QXJ0aXN0VG9wVHJhY2tzOiAoaWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L2dldC1hcnRpc3QtdG9wLXRyYWNrcz9pZD0ke2lkfWAsXHJcbiAgICBnZXRDdXJyZW50VXNlclByb2ZpbGU6ICcvc3BvdGlmeS9nZXQtY3VycmVudC11c2VyLXByb2ZpbGUnLFxyXG4gICAgcHV0Q2xlYXJTZXNzaW9uOiAnL2NsZWFyLXNlc3Npb24nLFxyXG4gICAgZ2V0Q3VycmVudFVzZXJTYXZlZFRyYWNrczogJy9zcG90aWZ5L2dldC1jdXJyZW50LXVzZXItc2F2ZWQtdHJhY2tzJyxcclxuICAgIGdldEZvbGxvd2VkQXJ0aXN0czogJy9zcG90aWZ5L2dldC1mb2xsb3dlZC1hcnRpc3RzJyxcclxuICAgIHB1dFBsYXlUcmFjazogKGRldmljZV9pZDogc3RyaW5nLCB0cmFja191cmk6IHN0cmluZykgPT5cclxuICAgICAgYC9zcG90aWZ5L3BsYXktdHJhY2s/ZGV2aWNlX2lkPSR7ZGV2aWNlX2lkfSZ0cmFja191cmk9JHt0cmFja191cml9YCxcclxuICAgIHB1dFBsYXllclZvbHVtZURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5ZXItdm9sdW1lP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWVyVm9sdW1lRGF0YTogJy91c2VyL2dldC1wbGF5ZXItdm9sdW1lJyxcclxuICAgIHB1dFRlcm06ICh0ZXJtOiBURVJNUywgdGVybVR5cGU6IFRFUk1fVFlQRSkgPT4gYC91c2VyL3B1dC10b3AtJHt0ZXJtVHlwZX0tdGVybT90ZXJtPSR7dGVybX1gLFxyXG4gICAgZ2V0VGVybTogKHRlcm1UeXBlOiBURVJNX1RZUEUpID0+IGAvdXNlci9nZXQtdG9wLSR7dGVybVR5cGV9LXRlcm1gLFxyXG4gICAgcHV0Q3VyclBsYXlsaXN0SWQ6IChpZDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LWN1cnJlbnQtcGxheWxpc3QtaWQ/aWQ9JHtpZH1gLFxyXG4gICAgZ2V0Q3VyclBsYXlsaXN0SWQ6ICcvdXNlci9nZXQtY3VycmVudC1wbGF5bGlzdC1pZCcsXHJcbiAgICBwb3N0UGxheWxpc3Q6IChuYW1lOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LXBsYXlsaXN0P25hbWU9JHtuYW1lfWAsXHJcbiAgICBwb3N0SXRlbXNUb1BsYXlsaXN0OiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1pdGVtcy10by1wbGF5bGlzdD9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIGdldFVzZXJuYW1lOiAnL3VzZXIvZ2V0LXVzZXJuYW1lJ1xyXG4gIH0sXHJcbiAgUEFUSFM6IHtcclxuICAgIHNwaW5uZXI6ICcvaW1hZ2VzLzIwMHB4TG9hZGluZ1NwaW5uZXIuc3ZnJyxcclxuICAgIGFjb3VzdGljRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9BY291c3RpY0Vtb2ppLnN2ZycsXHJcbiAgICBub25BY291c3RpY0Vtb2ppOiAnL2ltYWdlcy9FbW9qaXMvRWxlY3RyaWNHdWl0YXJFbW9qaS5zdmcnLFxyXG4gICAgaGFwcHlFbW9qaTogJy9pbWFnZXMvRW1vamlzL0hhcHB5RW1vamkuc3ZnJyxcclxuICAgIG5ldXRyYWxFbW9qaTogJy9pbWFnZXMvRW1vamlzL05ldXRyYWxFbW9qaS5zdmcnLFxyXG4gICAgc2FkRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9TYWRFbW9qaS5zdmcnLFxyXG4gICAgaW5zdHJ1bWVudEVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvSW5zdHJ1bWVudEVtb2ppLnN2ZycsXHJcbiAgICBzaW5nZXJFbW9qaTogJy9pbWFnZXMvRW1vamlzL1NpbmdlckVtb2ppLnN2ZycsXHJcbiAgICBkYW5jaW5nRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9EYW5jaW5nRW1vamkuc3ZnJyxcclxuICAgIHNoZWVwRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9TaGVlcEVtb2ppLnN2ZycsXHJcbiAgICB3b2xmRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9Xb2xmRW1vamkuc3ZnJyxcclxuICAgIGdyaWRWaWV3OiAnL2ltYWdlcy9ncmlkLXZpZXctaWNvbi5wbmcnLFxyXG4gICAgbGlzdFZpZXc6ICcvaW1hZ2VzL2xpc3Qtdmlldy1pY29uLnBuZycsXHJcbiAgICBjaGV2cm9uTGVmdDogJy9pbWFnZXMvY2hldnJvbi1sZWZ0LnBuZycsXHJcbiAgICBjaGV2cm9uUmlnaHQ6ICcvaW1hZ2VzL2NoZXZyb24tcmlnaHQucG5nJyxcclxuICAgIHBsYXlJY29uOiAnL2ltYWdlcy9wbGF5LTMwcHgucG5nJyxcclxuICAgIHBhdXNlSWNvbjogJy9pbWFnZXMvcGF1c2UtMzBweC5wbmcnLFxyXG4gICAgcGxheUJsYWNrSWNvbjogJy9pbWFnZXMvcGxheS1ibGFjay0zMHB4LnBuZycsXHJcbiAgICBwYXVzZUJsYWNrSWNvbjogJy9pbWFnZXMvcGF1c2UtYmxhY2stMzBweC5wbmcnLFxyXG4gICAgcGxheU5leHQ6ICcvaW1hZ2VzL25leHQtMzBweC5wbmcnLFxyXG4gICAgcGxheVByZXY6ICcvaW1hZ2VzL3ByZXZpb3VzLTMwcHgucG5nJyxcclxuICAgIHByb2ZpbGVVc2VyOiAnL2ltYWdlcy9wcm9maWxlLXVzZXIucG5nJyxcclxuICAgIHNodWZmbGVJY29uOiAnL2ltYWdlcy9zaHVmZmxlLWljb24ucG5nJyxcclxuICAgIHNodWZmbGVJY29uR3JlZW46ICcvaW1hZ2VzL3NodWZmbGUtaWNvbi1ncmVlbi5wbmcnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyAobWlsbGlzOiBudW1iZXIpIHtcclxuICBjb25zdCBtaW51dGVzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1pbGxpcyAvIDYwMDAwKVxyXG4gIGNvbnN0IHNlY29uZHM6IG51bWJlciA9IHBhcnNlSW50KCgobWlsbGlzICUgNjAwMDApIC8gMTAwMCkudG9GaXhlZCgwKSlcclxuICByZXR1cm4gc2Vjb25kcyA9PT0gNjBcclxuICAgID8gbWludXRlcyArIDEgKyAnOjAwJ1xyXG4gICAgOiBtaW51dGVzICsgJzonICsgKHNlY29uZHMgPCAxMCA/ICcwJyA6ICcnKSArIHNlY29uZHNcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaHRtbFRvRWwgKGh0bWw6IHN0cmluZykge1xyXG4gIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpXHJcbiAgaHRtbCA9IGh0bWwudHJpbSgpIC8vIE5ldmVyIHJldHVybiBhIHNwYWNlIHRleHQgbm9kZSBhcyBhIHJlc3VsdFxyXG4gIHRlbXAuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHJldHVybiB0ZW1wLmNvbnRlbnQuZmlyc3RDaGlsZFxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbWlzZUhhbmRsZXI8VD4gKFxyXG4gIHByb21pc2U6IFByb21pc2U8VD4sXHJcbiAgb25TdWNjZXNmdWwgPSAocmVzOiBUKSA9PiB7IH0sXHJcbiAgb25GYWlsdXJlID0gKGVycjogdW5rbm93bikgPT4ge1xyXG4gICAgaWYgKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgIH1cclxuICB9XHJcbikge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBwcm9taXNlXHJcbiAgICBvblN1Y2Nlc2Z1bChyZXMgYXMgVClcclxuICAgIHJldHVybiB7IHJlczogcmVzLCBlcnI6IG51bGwgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcclxuICAgIG9uRmFpbHVyZShlcnIpXHJcbiAgICByZXR1cm4geyByZXM6IG51bGwsIGVycjogZXJyIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRmlsdGVycyAnbGknIGVsZW1lbnRzIHRvIGVpdGhlciBiZSBoaWRkZW4gb3Igbm90IGRlcGVuZGluZyBvbiBpZlxyXG4gKiB0aGV5IGNvbnRhaW4gc29tZSBnaXZlbiBpbnB1dCB0ZXh0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge0hUTUx9IHVsIC0gdW5vcmRlcmVkIGxpc3QgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSAnbGknIHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7SFRNTH0gaW5wdXQgLSBpbnB1dCBlbGVtZW50IHdob3NlIHZhbHVlIHdpbGwgYmUgdXNlZCB0byBmaWx0ZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ZERpc3BsYXkgLSB0aGUgc3RhbmRhcmQgZGlzcGxheSB0aGUgJ2xpJyBzaG91bGQgaGF2ZSB3aGVuIG5vdCAnbm9uZSdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hVbCAodWw6IEhUTUxVTGlzdEVsZW1lbnQsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50LCBzdGREaXNwbGF5OiBzdHJpbmcgPSAnZmxleCcpOiB2b2lkIHtcclxuICBjb25zdCBsaUVscyA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpXHJcbiAgY29uc3QgZmlsdGVyID0gaW5wdXQudmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpRWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBnZXQgdGhlIG5hbWUgY2hpbGQgZWwgaW4gdGhlIGxpIGVsXHJcbiAgICBjb25zdCBuYW1lID0gbGlFbHNbaV0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMubmFtZSlbMF1cclxuICAgIGNvbnN0IG5hbWVUeHQgPSBuYW1lLnRleHRDb250ZW50IHx8IG5hbWUuaW5uZXJIVE1MXHJcblxyXG4gICAgaWYgKG5hbWVUeHQgJiYgbmFtZVR4dC50b1VwcGVyQ2FzZSgpLmluZGV4T2YoZmlsdGVyKSA+IC0xKSB7XHJcbiAgICAgIC8vIHNob3cgbGkncyB3aG9zZSBuYW1lIGNvbnRhaW5zIHRoZSB0aGUgZW50ZXJlZCBzdHJpbmdcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9IHN0ZERpc3BsYXlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG90aGVyd2lzZSBoaWRlIGl0XHJcbiAgICAgIGxpRWxzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cclxuICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cclxuICpcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoICh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgbGV0IG1ldHJpY3M6IFRleHRNZXRyaWNzXHJcbiAgaWYgKGNvbnRleHQpIHtcclxuICAgIGNvbnRleHQuZm9udCA9IGZvbnRcclxuICAgIG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpXHJcbiAgICByZXR1cm4gbWV0cmljcy53aWR0aFxyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdObyBjb250ZXh0IG9uIGNyZWF0ZWQgY2FudmFzIHdhcyBmb3VuZCcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsbGlwc2lzQWN0aXZlIChlbDogSFRNTEVsZW1lbnQpIHtcclxuICByZXR1cm4gZWwub2Zmc2V0V2lkdGggPCBlbC5zY3JvbGxXaWR0aFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyIChzdHJpbmc6IHN0cmluZykge1xyXG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbGlkSW1hZ2UgKGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGlkeCA9IDApIHtcclxuICAvLyBvYnRhaW4gdGhlIGNvcnJlY3QgaW1hZ2VcclxuICBpZiAoaW1hZ2VzLmxlbmd0aCA+IGlkeCkge1xyXG4gICAgY29uc3QgaW1nID0gaW1hZ2VzW2lkeF1cclxuICAgIHJldHVybiBpbWcudXJsXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUFsbENoaWxkTm9kZXMgKHBhcmVudDogTm9kZSkge1xyXG4gIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGFuaW1hdGlvbkNvbnRyb2wgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8qKiBBZGRzIGEgY2xhc3MgdG8gZWFjaCBlbGVtZW50IGNhdXNpbmcgYSB0cmFuc2l0aW9uIHRvIHRoZSBjaGFuZ2VkIGNzcyB2YWx1ZXMuXHJcbiAgICogVGhpcyBpcyBkb25lIG9uIHNldCBpbnRlcnZhbHMuXHJcbiAgICpcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBpbmNsdWRpbmcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzVG9UcmFuc2l0aW9uVG9vIC0gVGhlIGNsYXNzIHRoYXQgYWxsIHRoZSB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIHdpbGwgYWRkXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuaW1hdGlvbkludGVydmFsIC0gVGhlIGludGVydmFsIHRvIHdhaXQgYmV0d2VlbiBhbmltYXRpb24gb2YgZWxlbWVudHNcclxuICAgKi9cclxuICBmdW5jdGlvbiBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMgKFxyXG4gICAgZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZyxcclxuICAgIGNsYXNzVG9UcmFuc2l0aW9uVG9vOiBzdHJpbmcsXHJcbiAgICBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyXHJcbiAgKSB7XHJcbiAgICAvLyBhcnIgb2YgaHRtbCBzZWxlY3RvcnMgdGhhdCBwb2ludCB0byBlbGVtZW50cyB0byBhbmltYXRlXHJcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudHNUb0FuaW1hdGUuc3BsaXQoJywnKVxyXG5cclxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYXR0cilcclxuICAgICAgbGV0IGlkeCA9IDBcclxuICAgICAgLy8gaW4gaW50ZXJ2YWxzIHBsYXkgdGhlaXIgaW5pdGlhbCBhbmltYXRpb25zXHJcbiAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpZHggPT09IGVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaWR4XVxyXG4gICAgICAgIC8vIGFkZCB0aGUgY2xhc3MgdG8gdGhlIGVsZW1lbnRzIGNsYXNzZXMgaW4gb3JkZXIgdG8gcnVuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9UcmFuc2l0aW9uVG9vKVxyXG4gICAgICAgIGlkeCArPSAxXHJcbiAgICAgIH0sIGFuaW1hdGlvbkludGVydmFsKVxyXG4gICAgfSlcclxuICB9XHJcbiAgLyoqIEFuaW1hdGVzIGFsbCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYSBjZXJ0YWluIGNsYXNzIG9yIGlkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZWxlbWVudHNUb0FuaW1hdGUgLSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNsYXNzZXMgb3IgaWRzIG9mIGVsZW1lbnRzIHRvIGFuaW1hdGUgSU5DTFVESU5HIHByZWZpeCBjaGFyLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc1RvQWRkIC0gY2xhc3MgdG8gYWRkIEVYQ0xVRElORyB0aGUgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFuaW1hdGlvbkludGVydmFsIC0gdGhlIGludGVydmFsIHRvIGFuaW1hdGUgdGhlIGdpdmVuIGVsZW1lbnRzIGluIG1pbGxpc2Vjb25kcy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBhbmltYXRlQXR0cmlidXRlcyAoZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZywgY2xhc3NUb0FkZDogc3RyaW5nLCBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyKSB7XHJcbiAgICBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMoXHJcbiAgICAgIGVsZW1lbnRzVG9BbmltYXRlLFxyXG4gICAgICBjbGFzc1RvQWRkLFxyXG4gICAgICBhbmltYXRpb25JbnRlcnZhbFxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgYW5pbWF0ZUF0dHJpYnV0ZXNcclxuICB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQaXhlbFBvc0luRWxPbkNsaWNrIChtb3VzZUV2dDogTW91c2VFdmVudCk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XHJcbiAgY29uc3QgcmVjdCA9IChtb3VzZUV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgY29uc3QgeCA9IG1vdXNlRXZ0LmNsaWVudFggLSByZWN0LmxlZnQgLy8geCBwb3NpdGlvbiB3aXRoaW4gdGhlIGVsZW1lbnQuXHJcbiAgY29uc3QgeSA9IG1vdXNlRXZ0LmNsaWVudFkgLSByZWN0LnRvcCAvLyB5IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICByZXR1cm4geyB4LCB5IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXhwcmVzc2lvbiAoZXJyb3JNZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSlcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEl0ZW1zVG9QbGF5bGlzdCAocGxheWxpc3RJZDogc3RyaW5nLCB1cmlzOiBBcnJheTxzdHJpbmc+KSB7XHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcyh7XHJcbiAgICAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgICB1cmw6IGNvbmZpZy5VUkxzLnBvc3RJdGVtc1RvUGxheWxpc3QocGxheWxpc3RJZCksXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB1cmlzOiB1cmlzXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgKCkgPT4ge30sICgpID0+IHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJc3N1ZSBhZGRpbmcgaXRlbXMgdG8gcGxheWxpc3QnKVxyXG4gICAgfSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGU8VD4gKGFycmF5OiBBcnJheTxUPikge1xyXG4gIGxldCBjdXJyZW50SW5kZXggPSBhcnJheS5sZW5ndGhcclxuICBsZXQgcmFuZG9tSW5kZXhcclxuXHJcbiAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICB3aGlsZSAoY3VycmVudEluZGV4ICE9PSAwKSB7XHJcbiAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KVxyXG4gICAgY3VycmVudEluZGV4LS07XHJcblxyXG4gICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxyXG4gICAgW2FycmF5W2N1cnJlbnRJbmRleF0sIGFycmF5W3JhbmRvbUluZGV4XV0gPSBbXHJcbiAgICAgIGFycmF5W3JhbmRvbUluZGV4XSwgYXJyYXlbY3VycmVudEluZGV4XV1cclxuICB9XHJcblxyXG4gIHJldHVybiBhcnJheVxyXG59XHJcbiIsImltcG9ydCB7IGNvbmZpZywgcHJvbWlzZUhhbmRsZXIsIHRocm93RXhwcmVzc2lvbiB9IGZyb20gJy4vY29uZmlnJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcbmltcG9ydCB7IGRpc3BsYXlVc2VybmFtZSB9IGZyb20gJy4vdXNlci1kYXRhJ1xyXG5cclxuY29uc3QgSEFMRl9IT1VSID0gMS44ZTYgLyogMzAgbWluIGluIG1zICovXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tJZkhhc1Rva2VucyAoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgLy8gaWYgdGhlIHVzZXIgc3RheXMgb24gdGhlIHNhbWUgcGFnZSBmb3IgMzAgbWluIHJlZnJlc2ggdGhlIHRva2VuLlxyXG4gIGNvbnN0IHN0YXJ0UmVmcmVzaEludGVydmFsID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ3N0YXJ0IGludGVydmFsIHJlZnJlc2gnKVxyXG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICBwcm9taXNlSGFuZGxlcihheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0UmVmcmVzaEFjY2Vzc1Rva2VuKSlcclxuICAgICAgY29uc29sZS5sb2coJ3JlZnJlc2ggYXN5bmMnKVxyXG4gICAgfSwgSEFMRl9IT1VSKVxyXG4gIH1cclxuICBsZXQgaGFzVG9rZW4gPSBmYWxzZVxyXG4gIC8vIGF3YWl0IHByb21pc2UgcmVzb2x2ZSB0aGF0IHJldHVybnMgd2hldGhlciB0aGUgc2Vzc2lvbiBoYXMgdG9rZW5zLlxyXG4gIGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEhhc1Rva2VucyksXHJcbiAgICAocmVzKSA9PiB7XHJcbiAgICAgIGhhc1Rva2VuID0gcmVzLmRhdGFcclxuICAgIH1cclxuICApXHJcblxyXG4gIGlmIChoYXNUb2tlbikge1xyXG4gICAgc3RhcnRSZWZyZXNoSW50ZXJ2YWwoKVxyXG4gIH1cclxuICByZXR1cm4gaGFzVG9rZW5cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VucyAoKSB7XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBjcmVhdGUgYSBwYXJhbWV0ZXIgc2VhcmNoZXIgaW4gdGhlIFVSTCBhZnRlciAnPycgd2hpY2ggaG9sZHMgdGhlIHJlcXVlc3RzIGJvZHkgcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcclxuXHJcbiAgLy8gR2V0IHRoZSBjb2RlIGZyb20gdGhlIHBhcmFtZXRlciBjYWxsZWQgJ2NvZGUnIGluIHRoZSB1cmwgd2hpY2hcclxuICAvLyBob3BlZnVsbHkgY2FtZSBiYWNrIGZyb20gdGhlIHNwb3RpZnkgR0VUIHJlcXVlc3Qgb3RoZXJ3aXNlIGl0IGlzIG51bGxcclxuICBsZXQgYXV0aENvZGUgPSB1cmxQYXJhbXMuZ2V0KCdjb2RlJylcclxuXHJcbiAgaWYgKGF1dGhDb2RlKSB7XHJcbiAgICAvLyBvYnRhaW4gdG9rZW5zXHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldE9idGFpblRva2Vuc1ByZWZpeChhdXRoQ29kZSkpLFxyXG5cclxuICAgICAgLy8gaWYgdGhlIHJlcXVlc3Qgd2FzIHN1Y2Nlc2Z1bCB3ZSBoYXZlIHJlY2lldmVkIGEgdG9rZW5cclxuICAgICAgKCkgPT4gKGhhc1Rva2VuID0gdHJ1ZSlcclxuICAgIClcclxuICAgIGF1dGhDb2RlID0gJydcclxuXHJcbiAgICAvLyBnZXQgdXNlciBpbmZvIGZyb20gc3BvdGlmeVxyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEN1cnJlbnRVc2VyUHJvZmlsZSkpXHJcbiAgfVxyXG5cclxuICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgJycsICcvJylcclxuICByZXR1cm4gaGFzVG9rZW5cclxufVxyXG5cclxuLyoqIEdlbmVyYXRlIGEgbG9naW4vY2hhbmdlIGFjY291bnQgbGluay4gRGVmYXVsdHMgdG8gYXBwZW5kaW5nIGl0IG9udG8gdGhlIG5hdiBiYXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gY2xhc3Nlc1RvQWRkIC0gdGhlIGNsYXNzZXMgdG8gYWRkIG9udG8gdGhlIGxpbmsuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2hhbmdlQWNjb3VudCAtIFdoZXRoZXIgdGhlIGxpbmsgc2hvdWxkIGJlIGZvciBjaGFuZ2luZyBhY2NvdW50LCBvciBmb3IgbG9nZ2luZyBpbi4gKGRlZmF1bHRzIHRvIHRydWUpXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmVudEVsIC0gdGhlIHBhcmVudCBlbGVtZW50IHRvIGFwcGVuZCB0aGUgbGluayBvbnRvLiAoZGVmYXVsdHMgdG8gbmF2YmFyKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlTG9naW4gKHtcclxuICBjbGFzc2VzVG9BZGQgPSBbJ3JpZ2h0J10sXHJcbiAgY2hhbmdlQWNjb3VudCA9IHRydWUsXHJcbiAgcGFyZW50RWwgPSBkb2N1bWVudFxyXG4gICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RvcG5hdicpWzBdXHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncmlnaHQnKVswXVxyXG4gICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Ryb3Bkb3duLWNvbnRlbnQnKVswXVxyXG59ID0ge30pIHtcclxuICAvLyBDcmVhdGUgYW5jaG9yIGVsZW1lbnQuXHJcbiAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxyXG4gIGEuaHJlZiA9IGNvbmZpZy5VUkxzLmF1dGhcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSB0ZXh0IG5vZGUgZm9yIGFuY2hvciBlbGVtZW50LlxyXG4gIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgIGNoYW5nZUFjY291bnQgPyAnQ2hhbmdlIEFjY291bnQnIDogJ0xvZ2luIFRvIFNwb3RpZnknXHJcbiAgKVxyXG5cclxuICAvLyBBcHBlbmQgdGhlIHRleHQgbm9kZSB0byBhbmNob3IgZWxlbWVudC5cclxuICBhLmFwcGVuZENoaWxkKGxpbmspXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzVG9BZGQubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IGNsYXNzVG9BZGQgPSBjbGFzc2VzVG9BZGRbaV1cclxuICAgIGEuY2xhc3NMaXN0LmFkZChjbGFzc1RvQWRkKVxyXG4gIH1cclxuXHJcbiAgLy8gY2xlYXIgY3VycmVudCB0b2tlbnMgd2hlbiBjbGlja2VkXHJcbiAgYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRDbGVhclRva2VucykuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKVxyXG4gIH0pXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgYW5jaG9yIGVsZW1lbnQgdG8gdGhlIHBhcmVudC5cclxuICBwYXJlbnRFbC5hcHBlbmRDaGlsZChhKVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxUb2tlbkNhbGwgKFxyXG4gIGhhc1Rva2VuOiBib29sZWFuLFxyXG4gIGhhc1Rva2VuQ2FsbGJhY2sgPSAoKSA9PiB7IH0sXHJcbiAgbm9Ub2tlbkNhbGxCYWNrID0gKCkgPT4geyB9LFxyXG4gIHJlZGlyZWN0SG9tZSA9IHRydWVcclxuKSB7XHJcbiAgY29uc3QgZ2V0VG9rZW5zU3Bpbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gICAgY29uZmlnLkNTUy5JRHMuZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lclxyXG4gIClcclxuXHJcbiAgLy8gcmVtb3ZlIHRva2VuIHNwaW5uZXIgYmVjYXVzZSBieSB0aGlzIGxpbmUgd2UgaGF2ZSBvYnRhaW5lZCB0aGUgdG9rZW5cclxuICBnZXRUb2tlbnNTcGlubmVyPy5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChnZXRUb2tlbnNTcGlubmVyKVxyXG5cclxuICBjb25zdCBpbmZvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuaW5mb0NvbnRhaW5lcilcclxuXHJcbiAgLy8gZ2VuZXJhdGUgdGhlIG5hdiBsb2dpblxyXG4gIGdlbmVyYXRlTG9naW4oeyBjaGFuZ2VBY2NvdW50OiBoYXNUb2tlbiwgcGFyZW50RWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnRvcE5hdk1vYmlsZSkgPz8gdGhyb3dFeHByZXNzaW9uKCdObyB0b3AgbmF2IG1vYmlsZSBlbGVtZW50IGZvdW5kJykgfSlcclxuICBnZW5lcmF0ZUxvZ2luKHsgY2hhbmdlQWNjb3VudDogaGFzVG9rZW4gfSlcclxuICBpZiAoaGFzVG9rZW4pIHtcclxuICAgIGlmIChpbmZvQ29udGFpbmVyID09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZvIGNvbnRhaW5lciBFbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIH1cclxuICAgIGluZm9Db250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgIGRpc3BsYXlVc2VybmFtZSgpXHJcbiAgICBjb25zb2xlLmxvZygnZGlzcGxheSB1c2VybmFtZScpXHJcbiAgICBoYXNUb2tlbkNhbGxiYWNrKClcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gdG9rZW4gcmVkaXJlY3QgdG8gYWxsb3cgYWNjZXNzIHBhZ2VcclxuICAgIGlmIChyZWRpcmVjdEhvbWUpIHsgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBjb25maWcuVVJMcy5zaXRlVXJsIH1cclxuICAgIG5vVG9rZW5DYWxsQmFjaygpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBQbGF5bGlzdCBmcm9tICcuLi8uLi9jb21wb25lbnRzL3BsYXlsaXN0J1xyXG5pbXBvcnQgQXN5bmNTZWxlY3Rpb25WZXJpZiBmcm9tICcuLi8uLi9jb21wb25lbnRzL2FzeW5jU2VsZWN0aW9uVmVyaWYnXHJcbmltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIGh0bWxUb0VsLFxyXG4gIHByb21pc2VIYW5kbGVyLFxyXG4gIHNlYXJjaFVsLFxyXG4gIGFuaW1hdGlvbkNvbnRyb2xcclxufSBmcm9tICcuLi8uLi9jb25maWcnXHJcbmltcG9ydCB7XHJcbiAgY2hlY2tJZkhhc1Rva2VucyxcclxuICBvblN1Y2Nlc3NmdWxUb2tlbkNhbGxcclxufSBmcm9tICcuLi8uLi9tYW5hZ2UtdG9rZW5zJ1xyXG5pbXBvcnQgQ2FyZEFjdGlvbnNIYW5kbGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvY2FyZC1hY3Rpb25zJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCwgeyBhcnJheVRvRG91Ymx5TGlua2VkTGlzdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgaW50ZXJhY3QgZnJvbSAnaW50ZXJhY3RqcydcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgUGxheWxpc3REYXRhIH0gZnJvbSAnLi4vLi4vLi4vdHlwZXMnXHJcbmltcG9ydCBUcmFjayBmcm9tICcuLi8uLi9jb21wb25lbnRzL3RyYWNrJ1xyXG5cclxuY29uc3QgZXhwYW5kZWRQbGF5bGlzdE1vZHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICBjb25maWcuQ1NTLklEcy5leHBhbmRlZFBsYXlsaXN0TW9kc1xyXG4pXHJcbmNvbnN0IHBsYXlsaXN0SGVhZGVyQXJlYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gIGNvbmZpZy5DU1MuSURzLnBsYXlsaXN0SGVhZGVyQXJlYVxyXG4pXHJcbi8vIGFkZCBvbiBjaGFuZ2UgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIG9yZGVyIHNlbGVjdGlvbiBlbGVtZW50IG9mIHRoZSBtb2RzIGV4cGFuZGVkIHBsYXlsaXN0XHJcbmNvbnN0IHBsYXlsaXN0T3JkZXIgPSBleHBhbmRlZFBsYXlsaXN0TW9kcz8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcclxuICBjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RPcmRlclxyXG4pWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuXHJcbmNvbnN0IHRyYWNrVWwgPSBleHBhbmRlZFBsYXlsaXN0TW9kcz8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3VsJylbMF1cclxuY29uc3QgcGxheWxpc3RTZWFyY2hJbnB1dCA9IGV4cGFuZGVkUGxheWxpc3RNb2RzPy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFxyXG4gIGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFNlYXJjaFxyXG4pWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuY29uc3QgcGxheWxpc3RzQ2FyZENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gIGNvbmZpZy5DU1MuSURzLnBsYXlsaXN0Q2FyZHNDb250YWluZXJcclxuKVxyXG5jb25zdCBjYXJkUmVzaXplQ29udGFpbmVyID0gZG9jdW1lbnRcclxuICAuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheWxpc3RzU2VjdGlvbilcclxuICA/LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnJlc2l6ZUNvbnRhaW5lcilbMF0gYXMgSFRNTEVsZW1lbnRcclxuXHJcbi8vIG1pbiB2aWV3cG9ydCBiZWZvcmUgcGxheWxpc3QgY2FyZHMgY29udmVydCB0byB0ZXh0IGZvcm0gYXV0b21hdGljYWxseSAoZXF1aXZhbGVudCB0byB0aGUgbWVkaWEgcXVlcnkgaW4gcGxheWxpc3RzLmxlc3MgdGhhdCBjaGFuZ2VzIC5jYXJkKVxyXG5jb25zdCBWSUVXUE9SVF9NSU4gPSA2MDBcclxuXHJcbi8vIHdpbGwgcmVzaXplIHRoZSBwbGF5bGlzdCBjYXJkIGNvbnRhaW5lciB0byB0aGUgc2l6ZSB3YW50ZWQgd2hlbiBzY3JlZW4gaXMgPD0gVklFV1BPUlRfTUlOXHJcbmNvbnN0IHJlc3RyaWN0UmVzaXplV2lkdGggPSAoKSA9PlxyXG4gIChjYXJkUmVzaXplQ29udGFpbmVyLnN0eWxlLndpZHRoID0gVklFV1BPUlRfTUlOIC8gMi41ICsgJ3B4JylcclxuXHJcbmNvbnN0IHJlc2l6ZUFjdGlvbnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8vIGlkIG9mIHJlc2l6ZSBjb250YWluZXIgdXNlZCB0byBzZXQgaW50ZXJhY3Rpb24gdGhyb3VnaCBpbnRlcmFjdGpzXHJcbiAgY29uc3QgcmVzaXplSWQgPVxyXG4gICAgJyMnICtcclxuICAgIGNvbmZpZy5DU1MuSURzLnBsYXlsaXN0c1NlY3Rpb24gK1xyXG4gICAgJz4uJyArXHJcbiAgICBjb25maWcuQ1NTLkNMQVNTRVMucmVzaXplQ29udGFpbmVyXHJcblxyXG4gIGZ1bmN0aW9uIGVuYWJsZVJlc2l6ZSAoKSB7XHJcbiAgICBpbnRlcmFjdChyZXNpemVJZClcclxuICAgICAgLnJlc2l6YWJsZSh7XHJcbiAgICAgICAgLy8gb25seSByZXNpemUgZnJvbSB0aGUgcmlnaHRcclxuICAgICAgICBlZGdlczogeyB0b3A6IGZhbHNlLCBsZWZ0OiBmYWxzZSwgYm90dG9tOiBmYWxzZSwgcmlnaHQ6IHRydWUgfSxcclxuICAgICAgICBsaXN0ZW5lcnM6IHtcclxuICAgICAgICAgIG1vdmU6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGV2ZW50LnRhcmdldC5zdHlsZSwge1xyXG4gICAgICAgICAgICAgIHdpZHRoOiBgJHtldmVudC5yZWN0LndpZHRofXB4YFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgLm9uKCdyZXNpemVlbmQnLCBzYXZlTG9hZC5zYXZlUmVzaXplV2lkdGgpXHJcblxyXG4gICAgLy8gb25jZSB3ZSByZW5hYmxlIHRoZSByZXNpemUgd2UgbXVzdCBzZXQgaXRzIHdpZHRoIHRvIGJlIHdoYXQgdGhlIHVzZXIgbGFzdCBzZXQgaXQgdG9vLlxyXG4gICAgaW5pdGlhbExvYWRzLmxvYWRSZXNpemVXaWR0aCgpXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGRpc2FibGVSZXNpemUgKCkge1xyXG4gICAgaW50ZXJhY3QocmVzaXplSWQpLnVuc2V0KClcclxuICAgIC8vIG9uY2Ugd2UgZGlzYWJsZSB0aGUgcmVzaXplIHdlIG11c3QgcmVzdHJpY3QgdGhlIHdpZHRoIHRvIGZpdCB3aXRoaW4gVklFV1BPUlRfTUlOIHBpeGVscy5cclxuICAgIHJlc3RyaWN0UmVzaXplV2lkdGgoKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGVuYWJsZVJlc2l6ZSxcclxuICAgIGRpc2FibGVSZXNpemVcclxuICB9XHJcbn0pKClcclxuLy8gb3JkZXIgb2YgaXRlbXMgc2hvdWxkIG5ldmVyIGNoYW5nZSBhcyBhbGwgb3RoZXIgb3JkZXJpbmdzIGFyZSBiYXNlZCBvZmYgdGhpcyBvbmUsIGFuZCB0aGUgb25seSB3YXkgdG8gcmV0dXJuIGJhY2sgdG8gdGhpcyBjdXN0b20gb3JkZXIgaXMgdG8gcmV0YWluIGl0LlxyXG4vLyBvbmx5IGFjY2VzcyB0aGlzIHdoZW4gdHJhY2tzIGhhdmUgbG9hZGVkLlxyXG5jb25zdCBzZWxQbGF5bGlzdFRyYWNrcyA9ICgpID0+IHtcclxuICBpZiAocGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsID09PSBudWxsIHx8IHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbC50cmFja0xpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0ZWQgdG8gYWNjZXNzIHNlbGVjdGlvbiB2ZXJpZiBkb3VibHkgbGlua2VkIHRyYWNrcyBsaXN0IGJlZm9yZSBpdCB3YXMgbG9hZGVkJylcclxuICB9XHJcbiAgcmV0dXJuIHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbC50cmFja0xpc3RcclxufVxyXG5cclxuY29uc3QgcGxheWxpc3RBY3Rpb25zID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCBwbGF5bGlzdFNlbFZlcmlmID0gbmV3IEFzeW5jU2VsZWN0aW9uVmVyaWY8UGxheWxpc3Q+KClcclxuICBjb25zdCBjYXJkQWN0aW9uc0hhbmRsZXIgPSBuZXcgQ2FyZEFjdGlvbnNIYW5kbGVyKDEpXHJcbiAgY29uc3QgcGxheWxpc3RUaXRsZWgyID0gZXhwYW5kZWRQbGF5bGlzdE1vZHM/LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoMicpWzBdXHJcblxyXG4gIC8qKiBBc3luY2hyb25vdXNseSBsb2FkIGEgcGxheWxpc3RzIHRyYWNrcyBhbmQgcmVwbGFjZSB0aGUgdHJhY2sgdWwgaHRtbCBvbmNlIGl0IGxvYWRzXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BsYXlsaXN0fSBwbGF5bGlzdE9iaiAtIGEgUGxheWxpc3QgaW5zdGFuY2Ugd2hvc2UgdHJhY2tzIHdpbGwgYmUgbG9hZGVkXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBjYWxsYmFjayBmdW5jdGlvbiB0byBydW4gd2hlbiBsb2FkaW5nIHdhcyBzdWNjZXNmdWxcclxuICAgKi9cclxuICBmdW5jdGlvbiBsb2FkUGxheWxpc3RUcmFja3MgKHBsYXlsaXN0T2JqOiBQbGF5bGlzdCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XHJcbiAgICBwbGF5bGlzdE9ialxyXG4gICAgICAubG9hZFRyYWNrcygpXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAvLyBiZWNhdXNlIC50aGVuKCkgY2FuIHJ1biB3aGVuIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgcGxheWxpc3QgaGFzIGFscmVhZHkgY2hhbmdlZCB3ZSBuZWVkIHRvIHZlcmlmeVxyXG4gICAgICAgIGlmICghcGxheWxpc3RTZWxWZXJpZi5pc1ZhbGlkKHBsYXlsaXN0T2JqKSkge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhbGxiYWNrKClcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hlbiBnZXR0aW5nIHRyYWNrcycpXHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXHJcbiAgICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHdoZW5UcmFja3NMb2FkaW5nICgpIHtcclxuICAgIC8vIGhpZGUgaGVhZGVyIHdoaWxlIGxvYWRpbmcgdHJhY2tzXHJcbiAgICBwbGF5bGlzdEhlYWRlckFyZWE/LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLmhpZGUpXHJcbiAgICBwbGF5bGlzdFNlYXJjaElucHV0LnZhbHVlID0gJyc7XHJcbiAgICAodHJhY2tVbCBhcyBFbGVtZW50KS5zY3JvbGxUb3AgPSAwXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIG9uVHJhY2tzTG9hZGluZ0RvbmUgKCkge1xyXG4gICAgLy8gc2hvdyB0aGVtIG9uY2UgdHJhY2tzIGhhdmUgbG9hZGVkXHJcbiAgICBwbGF5bGlzdEhlYWRlckFyZWE/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLmhpZGUpXHJcbiAgfVxyXG4gIC8qKiBFbXB0eSB0aGUgdHJhY2sgbGkgYW5kIHJlcGxhY2UgaXQgd2l0aCBuZXdseSBsb2FkZWQgdHJhY2sgbGkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BsYXlsaXN0fSBwbGF5bGlzdE9iaiAtIGEgUGxheWxpc3QgaW5zdGFuY2Ugd2hvc2UgdHJhY2tzIHdpbGwgYmUgbG9hZGVkXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc2hvd1BsYXlsaXN0VHJhY2tzIChwbGF5bGlzdE9iajogUGxheWxpc3QpIHtcclxuICAgIGlmIChwbGF5bGlzdFRpdGxlaDIgIT09IHVuZGVmaW5lZCAmJiBwbGF5bGlzdFRpdGxlaDIudGV4dENvbnRlbnQgIT09IG51bGwpIHtcclxuICAgICAgcGxheWxpc3RUaXRsZWgyLnRleHRDb250ZW50ID0gcGxheWxpc3RPYmoubmFtZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGVtcHR5IHRoZSB0cmFjayBsaVxyXG4gICAgcmVtb3ZlQWxsQ2hpbGROb2Rlcyh0cmFja1VsKVxyXG5cclxuICAgIC8vIGluaXRpYWxseSBzaG93IHRoZSBwbGF5bGlzdCB3aXRoIHRoZSBsb2FkaW5nIHNwaW5uZXJcclxuICAgIGNvbnN0IGh0bWxTdHJpbmcgPSBgXHJcbiAgICAgICAgICAgIDxsaT5cclxuICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnNwaW5uZXJ9XCIgLz5cclxuICAgICAgICAgICAgPC9saT5gXHJcbiAgICBjb25zdCBzcGlubmVyRWwgPSBodG1sVG9FbChodG1sU3RyaW5nKTtcclxuICAgICh0cmFja1VsIGFzIEVsZW1lbnQpLmFwcGVuZENoaWxkKHNwaW5uZXJFbCBhcyBOb2RlKVxyXG5cclxuICAgIHBsYXlsaXN0U2VsVmVyaWYuc2VsZWN0aW9uQ2hhbmdlZChwbGF5bGlzdE9iailcclxuXHJcbiAgICAvLyB0cmFja3MgYXJlIGFscmVhZHkgbG9hZGVkIHNvIHNob3cgdGhlbVxyXG4gICAgaWYgKHBsYXlsaXN0T2JqLmhhc0xvYWRlZFRyYWNrcygpKSB7XHJcbiAgICAgIHdoZW5UcmFja3NMb2FkaW5nKClcclxuICAgICAgb25UcmFja3NMb2FkaW5nRG9uZSgpXHJcbiAgICAgIG1hbmFnZVRyYWNrcy5zb3J0RXhwYW5kZWRUcmFja3NUb09yZGVyKFxyXG4gICAgICAgIHBsYXlsaXN0T2JqLm9yZGVyID09PSBwbGF5bGlzdE9yZGVyLnZhbHVlXHJcbiAgICAgIClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHRyYWNrcyBhcmVuJ3QgbG9hZGVkIHNvIGxhenkgbG9hZCB0aGVtIHRoZW4gc2hvdyB0aGVtXHJcblxyXG4gICAgICB3aGVuVHJhY2tzTG9hZGluZygpXHJcbiAgICAgIGxvYWRQbGF5bGlzdFRyYWNrcyhwbGF5bGlzdE9iaiwgKCkgPT4ge1xyXG4gICAgICAgIC8vIGluZGV4ZWQgd2hlbiBsb2FkZWQgc28gbm8gbmVlZCB0byByZS1pbmRleCB0aGVtXHJcbiAgICAgICAgbWFuYWdlVHJhY2tzLnNvcnRFeHBhbmRlZFRyYWNrc1RvT3JkZXIodHJ1ZSlcclxuICAgICAgICBvblRyYWNrc0xvYWRpbmdEb25lKClcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBXaGVuIGEgY2FyZCBpcyBjbGlja2VkIHJ1biB0aGUgc3RhbmRhcmQgQ2FyZEFjdGlvbnNIYW5kbGVyIG9uQ2xpY2sgdGhlbiBzaG93IGl0cyB0cmFja3Mgb24gY2FsbGJhY2suXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5PFBsYXlsaXN0Pn0gcGxheWxpc3RPYmpzXHJcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGxheWxpc3RDYXJkXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY2xpY2tDYXJkIChwbGF5bGlzdE9ianM6IEFycmF5PFBsYXlsaXN0PiwgcGxheWxpc3RDYXJkOiBFbGVtZW50KSB7XHJcbiAgICBjYXJkQWN0aW9uc0hhbmRsZXIub25DYXJkQ2xpY2socGxheWxpc3RDYXJkLCBwbGF5bGlzdE9ianMsIChzZWxPYmo6IFBsYXlsaXN0KSA9PiB7XHJcbiAgICAgIHNob3dQbGF5bGlzdFRyYWNrcyhzZWxPYmopXHJcbiAgICB9XHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKiogQWRkIGV2ZW50IGxpc3RlbmVycyB0byBlYWNoIHBsYXlsaXN0IGNhcmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5PFBsYXlsaXN0Pn0gcGxheWxpc3RPYmpzIC0gcGxheWxpc3RzIHRoYXQgd2lsbCBiZSB1c2VkIGZvciB0aGUgZXZlbnRzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZE9uUGxheWxpc3RDYXJkTGlzdGVuZXJzIChwbGF5bGlzdE9ianM6IEFycmF5PFBsYXlsaXN0Pikge1xyXG4gICAgY29uc3QgcGxheWxpc3RDYXJkcyA9IEFycmF5LmZyb20oXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0KVxyXG4gICAgKVxyXG5cclxuICAgIHBsYXlsaXN0Q2FyZHMuZm9yRWFjaCgocGxheWxpc3RDYXJkKSA9PiB7XHJcbiAgICAgIHBsYXlsaXN0Q2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBjbGlja0NhcmQocGxheWxpc3RPYmpzLCBwbGF5bGlzdENhcmQpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBwbGF5bGlzdENhcmQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcclxuICAgICAgICBjYXJkQWN0aW9uc0hhbmRsZXIuc2Nyb2xsVGV4dE9uQ2FyZEVudGVyKHBsYXlsaXN0Q2FyZClcclxuICAgICAgfSlcclxuICAgICAgcGxheWxpc3RDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgY2FyZEFjdGlvbnNIYW5kbGVyLnNjcm9sbFRleHRPbkNhcmRMZWF2ZShwbGF5bGlzdENhcmQpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGNsaWNrQ2FyZCxcclxuICAgIGFkZE9uUGxheWxpc3RDYXJkTGlzdGVuZXJzLFxyXG4gICAgc2hvd1BsYXlsaXN0VHJhY2tzLFxyXG4gICAgcGxheWxpc3RTZWxWZXJpZlxyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgaW5mb1JldHJpZXZhbCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgY29uc3QgcGxheWxpc3RPYmpzOiBBcnJheTxQbGF5bGlzdD4gPSBbXVxyXG5cclxuICAvKiogT2J0YWlucyBwbGF5bGlzdCBpbmZvIGZyb20gd2ViIGFwaSBhbmQgZGlzcGxheXMgdGhlaXIgY2FyZHMuXHJcbiAgICpcclxuICAgKi9cclxuICBhc3luYyBmdW5jdGlvbiBnZXRJbml0aWFsSW5mbyAoKSB7XHJcbiAgICBmdW5jdGlvbiBvblN1Y2Nlc2Z1bCAocmVzOiBBeGlvc1Jlc3BvbnNlPEFycmF5PFBsYXlsaXN0RGF0YT4+KSB7XHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgaW5mbyBsb2FkaW5nIHNwaW5uZXJzIGFzIGluZm8gaGFzIGJlZW4gbG9hZGVkXHJcbiAgICAgIGNvbnN0IGluZm9TcGlubmVycyA9IEFycmF5LmZyb20oXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMuaW5mb0xvYWRpbmdTcGlubmVycylcclxuICAgICAgKVxyXG4gICAgICBpbmZvU3Bpbm5lcnMuZm9yRWFjaCgoc3Bpbm5lcikgPT4ge1xyXG4gICAgICAgIHNwaW5uZXI/LnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKHNwaW5uZXIpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBjb25zdCBwbGF5bGlzdERhdGFzID0gcmVzLmRhdGFcclxuXHJcbiAgICAgIC8vIGdlbmVyYXRlIFBsYXlsaXN0IGluc3RhbmNlcyBmcm9tIHRoZSBkYXRhXHJcbiAgICAgIHBsYXlsaXN0RGF0YXMuZm9yRWFjaCgoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIGRlbGV0ZWQgcGxheWxpc3RzIHdpbGwgaGF2ZSBubyBuYW1lLCBidXQgd2lsbCBzdGlsbCBzaG93IHRoZSBzb25ncyAoc3BvdGlmeSBhcGkgdGhpbmcpLCBzbyBqdXN0IGRvbid0IHNob3cgdGhlbVxyXG4gICAgICAgIGlmIChkYXRhLm5hbWUgPT09ICcnKSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgcGxheWxpc3RPYmpzLnB1c2gobmV3IFBsYXlsaXN0KGRhdGEubmFtZSwgZGF0YS5pbWFnZXMsIGRhdGEuaWQpKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgZGlzcGxheUNhcmRJbmZvLmRpc3BsYXlQbGF5bGlzdENhcmRzKHBsYXlsaXN0T2JqcylcclxuICAgIH1cclxuXHJcbiAgICAvLyBnZXQgcGxheWxpc3RzIGRhdGEgYW5kIGV4ZWN1dGUgY2FsbCBiYWNrIG9uIHN1Y2Nlc2Z1bFxyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxBcnJheTxQbGF5bGlzdERhdGE+Pj4oXHJcbiAgICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRQbGF5bGlzdHMpLFxyXG4gICAgICBvblN1Y2Nlc2Z1bFxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgZ2V0SW5pdGlhbEluZm8sXHJcbiAgICBwbGF5bGlzdE9ianNcclxuICB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGRpc3BsYXlDYXJkSW5mbyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gZGV0ZXJtaW5lUmVzaXplQWN0aXZlbmVzcyAoKSB7XHJcbiAgICAvLyBhbGxvdyByZXNpemluZyBvbmx5IHdoZW4gdmlld3BvcnQgaXMgbGFyZ2UgZW5vdWdoIHRvIGFsbG93IGNhcmRzLlxyXG4gICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKGAobWF4LXdpZHRoOiAke1ZJRVdQT1JUX01JTn1weClgKS5tYXRjaGVzKSB7XHJcbiAgICAgIHJlc2l6ZUFjdGlvbnMuZGlzYWJsZVJlc2l6ZSgpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXNpemVBY3Rpb25zLmVuYWJsZVJlc2l6ZSgpXHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKiBEaXNwbGF5cyB0aGUgcGxheWxpc3QgY2FyZHMgZnJvbSBhIGdpdmVuIGFycmF5IG9mIHBsYXlsaXN0cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXk8UGxheWxpc3Q+fSBwbGF5bGlzdE9ianNcclxuICAgKi9cclxuICBmdW5jdGlvbiBkaXNwbGF5UGxheWxpc3RDYXJkcyAocGxheWxpc3RPYmpzOiBBcnJheTxQbGF5bGlzdD4pIHtcclxuICAgIHJlbW92ZUFsbENoaWxkTm9kZXMocGxheWxpc3RzQ2FyZENvbnRhaW5lcilcclxuICAgIGNvbnN0IGlzSW5UZXh0Rm9ybSA9XHJcbiAgICAgIHBsYXlsaXN0c0NhcmRDb250YWluZXI/LmNsYXNzTGlzdC5jb250YWlucyhjb25maWcuQ1NTLkNMQVNTRVMudGV4dEZvcm0pIHx8XHJcbiAgICAgIHdpbmRvdy5tYXRjaE1lZGlhKGAobWF4LXdpZHRoOiAke1ZJRVdQT1JUX01JTn1weClgKS5tYXRjaGVzXHJcblxyXG4gICAgZGV0ZXJtaW5lUmVzaXplQWN0aXZlbmVzcygpXHJcbiAgICBjb25zdCBzZWxlY3RlZENhcmQgPSBwbGF5bGlzdEFjdGlvbnMucGxheWxpc3RTZWxWZXJpZi5jdXJyU2VsZWN0ZWRWYWxcclxuXHJcbiAgICAvLyBhZGQgY2FyZCBodG1scyB0byBjb250YWluZXIgZWxlbWVudFxyXG4gICAgcGxheWxpc3RPYmpzLmZvckVhY2goKHBsYXlsaXN0T2JqLCBpZHgpID0+IHtcclxuICAgICAgcGxheWxpc3RzQ2FyZENvbnRhaW5lcj8uYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgcGxheWxpc3RPYmouZ2V0UGxheWxpc3RDYXJkSHRtbChpZHgsIGlzSW5UZXh0Rm9ybSlcclxuICAgICAgKVxyXG5cclxuICAgICAgLy8gaWYgYmVmb3JlIHRoZSBmb3JtIGNoYW5nZSB0aGlzIHBsYXlsaXN0IHdhcyBzZWxlY3RlZCwgc2ltdWxhdGUgYSBjbGljayBvbiBpdCBpbiBvcmRlciB0byBzZWxlY3QgaXQgaW4gdGhlIG5ldyBmb3JtXHJcbiAgICAgIGlmIChwbGF5bGlzdE9iaiA9PT0gc2VsZWN0ZWRDYXJkKSB7XHJcbiAgICAgICAgcGxheWxpc3RBY3Rpb25zLmNsaWNrQ2FyZChcclxuICAgICAgICAgIHBsYXlsaXN0T2JqcyxcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdGVkQ2FyZC5jYXJkSWQpIGFzIEVsZW1lbnRcclxuICAgICAgICApXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLy8gaWYgdGhlcmUgaXMgYSBzZWxlY3RlZCBjYXJkIHNjcm9sbCBkb3duIHRvIGl0LlxyXG4gICAgaWYgKHNlbGVjdGVkQ2FyZCkge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RlZENhcmQuY2FyZElkKT8uc2Nyb2xsSW50b1ZpZXcoKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCBldmVudCBsaXN0ZW5lciB0byBjYXJkc1xyXG4gICAgcGxheWxpc3RBY3Rpb25zLmFkZE9uUGxheWxpc3RDYXJkTGlzdGVuZXJzKHBsYXlsaXN0T2JqcylcclxuICAgIC8vIGFuaW1hdGUgdGhlIGNhcmRzKHNob3cgdGhlIGNhcmRzKVxyXG4gICAgYW5pbWF0aW9uQ29udHJvbC5hbmltYXRlQXR0cmlidXRlcygnLnBsYXlsaXN0JywgY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciwgMClcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkaXNwbGF5UGxheWxpc3RDYXJkc1xyXG4gIH1cclxufSkoKVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlQWxsQ2hpbGROb2RlcyAocGFyZW50OiBOb2RlIHwgbnVsbCB8IHVuZGVmaW5lZCkge1xyXG4gIGlmICghcGFyZW50KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3BhcmVudCBpcyB1bmRlZmluZWQgYW5kIGhhcyBubyBjaGlsZCBub2RlcyB0byByZW1vdmUnKVxyXG4gIH1cclxuICB3aGlsZSAocGFyZW50LmZpcnN0Q2hpbGQpIHtcclxuICAgIHBhcmVudC5yZW1vdmVDaGlsZChwYXJlbnQuZmlyc3RDaGlsZClcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IG1hbmFnZVRyYWNrcyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgLyoqIFNvcnRzIHRoZSB0cmFja3Mgb3JkZXIgZGVwZW5kaW5nIG9uIHdoYXQgdGhlIHVzZXIgc2V0cyBpdCB0b28gYW5kIHJlLWluZGV4ZXMgdGhlIHRyYWNrcyBvcmRlciBpZiBvcmRlciBoYXMgY2hhbmdlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBpc1NhbWVPcmRlciAtIHdoZXRoZXIgdGhlIG9yZGVyIGlzIHRoZSBzYW1lIG9yIG5vdCBhcyBiZWZvcmUuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc29ydEV4cGFuZGVkVHJhY2tzVG9PcmRlciAoaXNTYW1lT3JkZXI6IGJvb2xlYW4pIHtcclxuICAgIGxldCBuZXdPcmRlclRyYWNrczogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4oKVxyXG4gICAgbGV0IG5ld09yZGVyVHJhY2tzQXJyOiBBcnJheTxUcmFjaz4gPSBbXVxyXG4gICAgaWYgKHBsYXlsaXN0T3JkZXIudmFsdWUgPT09ICdjdXN0b20tb3JkZXInKSB7XHJcbiAgICAgIG5ld09yZGVyVHJhY2tzID0gc2VsUGxheWxpc3RUcmFja3MoKVxyXG4gICAgfSBlbHNlIGlmIChwbGF5bGlzdE9yZGVyLnZhbHVlID09PSAnbmFtZScpIHtcclxuICAgICAgbmV3T3JkZXJUcmFja3NBcnIgPSBvcmRlclRyYWNrc0J5TmFtZShzZWxQbGF5bGlzdFRyYWNrcygpKVxyXG4gICAgICBuZXdPcmRlclRyYWNrcyA9IGFycmF5VG9Eb3VibHlMaW5rZWRMaXN0KG5ld09yZGVyVHJhY2tzQXJyKVxyXG4gICAgfSBlbHNlIGlmIChwbGF5bGlzdE9yZGVyLnZhbHVlID09PSAnZGF0ZS1hZGRlZCcpIHtcclxuICAgICAgbmV3T3JkZXJUcmFja3NBcnIgPSBvcmRlclRyYWNrc0J5RGF0ZUFkZGVkKHNlbFBsYXlsaXN0VHJhY2tzKCkpXHJcbiAgICAgIG5ld09yZGVyVHJhY2tzID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QobmV3T3JkZXJUcmFja3NBcnIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc1NhbWVPcmRlcikge1xyXG4gICAgICAvLyBzZXQgdGhlIG9yZGVyIG9mIHRoZSBwbGF5bGlzdCBhcyB0aGUgbmV3IG9yZGVyXHJcbiAgICAgIHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbC5vcmRlciA9XHJcbiAgICAgICAgcGxheWxpc3RPcmRlci52YWx1ZVxyXG4gICAgfVxyXG4gICAgcmVyZW5kZXJQbGF5bGlzdFRyYWNrcyhuZXdPcmRlclRyYWNrcywgdHJhY2tVbCBhcyBIVE1MVUxpc3RFbGVtZW50KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb3JkZXJUcmFja3NCeU5hbWUgKHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4pOiBBcnJheTxUcmFjaz4ge1xyXG4gICAgLy8gc2hhbGxvdyBjb3B5IGp1c3Qgc28gd2UgZG9udCBtb2RpZnkgdGhlIG9yaWdpbmFsIG9yZGVyXHJcbiAgICBjb25zdCB0cmFja3NDb3B5ID0gWy4uLnRyYWNrTGlzdF1cclxuICAgIHRyYWNrc0NvcHkuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAvLyAtMSBwcmVjZWRlcywgMSBzdWNlZWRzLCAwIGlzIGVxdWFsXHJcbiAgICAgIHJldHVybiBhLnRpdGxlLnRvVXBwZXJDYXNlKCkgPT09IGIudGl0bGUudG9VcHBlckNhc2UoKVxyXG4gICAgICAgID8gMFxyXG4gICAgICAgIDogYS50aXRsZS50b1VwcGVyQ2FzZSgpIDwgYi50aXRsZS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICA/IC0xXHJcbiAgICAgICAgICA6IDFcclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJhY2tzQ29weVxyXG4gIH1cclxuICBmdW5jdGlvbiBvcmRlclRyYWNrc0J5RGF0ZUFkZGVkICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+KSB7XHJcbiAgICAvLyBzaGFsbG93IGNvcHkganVzdCBzbyB3ZSBkb250IG1vZGlmeSB0aGUgb3JpZ2luYWwgb3JkZXJcclxuICAgIGNvbnN0IHRyYWNrc0NvcHkgPSBbLi4udHJhY2tMaXN0XVxyXG4gICAgdHJhY2tzQ29weS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgIC8vIC0xICdhJyBwcmVjZWRlcyAnYicsIDEgJ2EnIHN1Y2VlZHMgJ2InLCAwIGlzICdhJyBlcXVhbCAnYidcclxuICAgICAgcmV0dXJuIGEuZGF0ZUFkZGVkVG9QbGF5bGlzdCA9PT0gYi5kYXRlQWRkZWRUb1BsYXlsaXN0XHJcbiAgICAgICAgPyAwXHJcbiAgICAgICAgOiBhLmRhdGVBZGRlZFRvUGxheWxpc3QgPCBiLmRhdGVBZGRlZFRvUGxheWxpc3RcclxuICAgICAgICAgID8gLTFcclxuICAgICAgICAgIDogMVxyXG4gICAgfSlcclxuICAgIHJldHVybiB0cmFja3NDb3B5XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXJlbmRlclBsYXlsaXN0VHJhY2tzICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+LCB0cmFja0FyclVsOiBIVE1MVUxpc3RFbGVtZW50KSB7XHJcbiAgICByZW1vdmVBbGxDaGlsZE5vZGVzKHRyYWNrQXJyVWwpXHJcbiAgICBmb3IgKGNvbnN0IHRyYWNrIG9mIHRyYWNrTGlzdC52YWx1ZXMoKSkge1xyXG4gICAgICB0cmFja0FyclVsLmFwcGVuZENoaWxkKHRyYWNrLmdldFBsYXlsaXN0VHJhY2tIdG1sKHRyYWNrTGlzdCwgdHJ1ZSkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc29ydEV4cGFuZGVkVHJhY2tzVG9PcmRlcixcclxuICAgIG9yZGVyVHJhY2tzQnlEYXRlQWRkZWRcclxuICB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGFkZEV2ZW50TGlzdGVuZXJzID0gKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBhZGRFeHBhbmRlZFBsYXlsaXN0TW9kc1NlYXJjaGJhckV2ZW50ICgpIHtcclxuICAgIC8vIGFkZCBrZXkgdXAgZXZlbnQgdG8gdGhlIG1vZHMgZXhwYW5kZWQgcGxheWxpc3QncyBzZWFyY2ggYmFyIGVsZW1lbnRcclxuICAgIGV4cGFuZGVkUGxheWxpc3RNb2RzXHJcbiAgICAgID8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RTZWFyY2gpWzBdXHJcbiAgICAgID8uYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoKSA9PiB7XHJcbiAgICAgICAgc2VhcmNoVWwodHJhY2tVbCBhcyBIVE1MVUxpc3RFbGVtZW50LCBwbGF5bGlzdFNlYXJjaElucHV0KVxyXG4gICAgICB9KVxyXG4gIH1cclxuICBmdW5jdGlvbiBhZGRFeHBhbmRlZFBsYXlsaXN0TW9kc09yZGVyRXZlbnQgKCkge1xyXG4gICAgLy8gYWRkIG9uIGNoYW5nZSBldmVudCBsaXN0ZW5lciB0byB0aGUgb3JkZXIgc2VsZWN0aW9uIGVsZW1lbnQgb2YgdGhlIG1vZHMgZXhwYW5kZWQgcGxheWxpc3RcclxuICAgIHBsYXlsaXN0T3JkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICBtYW5hZ2VUcmFja3Muc29ydEV4cGFuZGVkVHJhY2tzVG9PcmRlcihmYWxzZSlcclxuICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGFkZERlbGV0ZVJlY2VudGx5QWRkZWRUcmFja0V2ZW50ICgpIHtcclxuICAgIGZ1bmN0aW9uIG9uQ2xpY2sgKCkge1xyXG4gICAgICBpZiAobnVtVG9SZW1vdmVJbnB1dCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdudW1iZXIgdG8gcmVtb3ZlIGlucHV0IGlzIG5vdCBmb3VuZCcpXHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbnVtVG9SZW1vdmUgPSBwYXJzZUludChudW1Ub1JlbW92ZUlucHV0LnZhbHVlKVxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgbnVtVG9SZW1vdmUgPiBzZWxQbGF5bGlzdFRyYWNrcygpLnNpemUgfHxcclxuICAgICAgICAgbnVtVG9SZW1vdmUgPT09IDBcclxuICAgICAgKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2NhbnQgcmVtb3ZlIHRoaXMgbWFueScpXHJcbiAgICAgICAgLy8gdGhlIHVzZXIgaXMgdHJ5aW5nIHRvIGRlbGV0ZSBtb3JlIHNvbmdzIHRoZW4gdGhlcmUgYXJlIGF2YWlsYWJsZSwgeW91IG1heSB3YW50IHRvIGFsbG93IHRoaXNcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBjb25zdCBvcmRlcmVkVHJhY2tzID0gbWFuYWdlVHJhY2tzLm9yZGVyVHJhY2tzQnlEYXRlQWRkZWQoXHJcbiAgICAgICAgc2VsUGxheWxpc3RUcmFja3MoKVxyXG4gICAgICApXHJcbiAgICAgIGNvbnN0IHRyYWNrc1RvUmVtb3ZlID0gb3JkZXJlZFRyYWNrcy5zbGljZSgwLCBudW1Ub1JlbW92ZSlcclxuXHJcbiAgICAgIC8vIHJlbW92ZSBzb25ncyBjb250YWluZWQgaW4gdHJhY2tzVG9SZW1vdmUgZnJvbSBleHBhbmRhYmxlUGxheWxpc3RUcmFja3NcclxuICAgICAgdHJhY2tzVG9SZW1vdmUuZm9yRWFjaCgodHJhY2tUb1JlbW92ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkeCA9IHNlbFBsYXlsaXN0VHJhY2tzKCkuZmluZEluZGV4KFxyXG4gICAgICAgICAgKHRyYWNrKSA9PiB0cmFjay5pZCA9PT0gdHJhY2tUb1JlbW92ZS5pZFxyXG4gICAgICAgIClcclxuICAgICAgICBzZWxQbGF5bGlzdFRyYWNrcygpLnJlbW92ZShpZHgpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBwbGF5bGlzdEFjdGlvbnMucGxheWxpc3RTZWxWZXJpZi5jdXJyU2VsZWN0ZWRWYWxOb051bGwuYWRkVG9VbmRvU3RhY2soXHJcbiAgICAgICAgdHJhY2tzVG9SZW1vdmVcclxuICAgICAgKVxyXG5cclxuICAgICAgLy8gbm90IHNhbWUgb3JkZXIgYXMgc29tZSBoYXZlIGJlZW4gZGVsZXRlZFxyXG4gICAgICBtYW5hZ2VUcmFja3Muc29ydEV4cGFuZGVkVHJhY2tzVG9PcmRlcihmYWxzZSlcclxuICAgICAgY29uc3QgdHJhY2tVcmlzID0gdHJhY2tzVG9SZW1vdmUubWFwKCh0cmFjaykgPT4geyByZXR1cm4geyB1cmk6IHRyYWNrLnVyaSB9IH0pXHJcblxyXG4gICAgICBwcm9taXNlSGFuZGxlcihcclxuICAgICAgICBheGlvcy5kZWxldGUoY29uZmlnLlVSTHMuZGVsZXRlUGxheWxpc3RUcmFja3MocGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsLmlkKSwge1xyXG4gICAgICAgICAgZGF0YTogeyB0cmFja191cmlzOiB0cmFja1VyaXMgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgIClcclxuICAgIH1cclxuICAgIGNvbnN0IG51bVRvUmVtb3ZlSW5wdXQgPSBkb2N1bWVudFxyXG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucmVtb3ZlRWFybHlBZGRlZClcclxuICAgICAgPy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKVswXVxyXG5cclxuICAgIGNvbnN0IHJlbW92ZUJ0biA9IGRvY3VtZW50XHJcbiAgICAgIC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5yZW1vdmVFYXJseUFkZGVkKVxyXG4gICAgICA/LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdidXR0b24nKVswXVxyXG5cclxuICAgIHJlbW92ZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvbkNsaWNrKCkpXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGFkZFVuZG9QbGF5bGlzdFRyYWNrRGVsZXRlRXZlbnQgKCkge1xyXG4gICAgZnVuY3Rpb24gb25DbGljayAoKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJQbGF5bGlzdCA9IHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbFxyXG4gICAgICBpZiAoIWN1cnJQbGF5bGlzdCB8fCBjdXJyUGxheWxpc3QudW5kb1N0YWNrLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHVuZG9uZVBsYXlsaXN0SWQgPSBjdXJyUGxheWxpc3QuaWRcclxuICAgICAgY29uc3QgdHJhY2tzUmVtb3ZlZCA9IGN1cnJQbGF5bGlzdC51bmRvU3RhY2sucG9wKClcclxuXHJcbiAgICAgIGNvbnN0IHRyYWNrVXJpcyA9IHRyYWNrc1JlbW92ZWQhLm1hcCgodHJhY2spID0+IHRyYWNrLnVyaSlcclxuICAgICAgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgICAgYXhpb3MucG9zdChjb25maWcuVVJMcy5wb3N0UGxheWxpc3RUcmFja3MoY3VyclBsYXlsaXN0LmlkKSwge1xyXG4gICAgICAgICAgdHJhY2tfdXJpczogdHJhY2tVcmlzXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgLy8gaWYgdGhlIHJlcXVlc3Qgd2FzIHN1Y2Nlc2Z1bCBhbmQgdGhlIHVzZXIgaXNcclxuICAgICAgICAgIC8vIHN0aWxsIGxvb2tpbmcgYXQgdGhlIHBsYXlsaXN0IHRoYXQgd2FzIHVuZG9uZSBiYWNrLCByZWxvYWQgaXQuXHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHVuZG9uZVBsYXlsaXN0SWQgPT09XHJcbiAgICAgICAgICAgIHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbC5pZFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIC8vIHJlbG9hZCB0aGUgcGxheWxpc3QgYWZ0ZXIgYWRkaW5nIHRyYWNrcyBpbiBvcmRlciB0byBzaG93IHRoZSB0cmFja3MgYWRkZWQgYmFja1xyXG4gICAgICAgICAgICBwbGF5bGlzdEFjdGlvbnMuc2hvd1BsYXlsaXN0VHJhY2tzKFxyXG4gICAgICAgICAgICAgIHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICApXHJcbiAgICB9XHJcbiAgICBjb25zdCB1bmRvQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMudW5kbylcclxuXHJcbiAgICB1bmRvQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9uQ2xpY2soKSlcclxuICB9XHJcbiAgZnVuY3Rpb24gYWRkTW9kc09wZW5lckV2ZW50ICgpIHtcclxuICAgIGNvbnN0IG1vZHNTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheWxpc3RNb2RzKVxyXG4gICAgY29uc3Qgb3Blbk1vZHNTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMubW9kc09wZW5lcilcclxuICAgIGNvbnN0IHdyZW5jaEljb24gPSBvcGVuTW9kc1NlY3Rpb24/LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKVswXVxyXG4gICAgb3Blbk1vZHNTZWN0aW9uPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgLy8gZXhwYW5kIG1vZHMgc2VjdGlvblxyXG4gICAgICBtb2RzU2VjdGlvbj8uY2xhc3NMaXN0LnRvZ2dsZShjb25maWcuQ1NTLkNMQVNTRVMuYXBwZWFyKVxyXG4gICAgICAvLyBzZWxlY3QgdGhlIHdyZW5jaCBpbWFnZVxyXG4gICAgICB3cmVuY2hJY29uPy5jbGFzc0xpc3QudG9nZ2xlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGFkZENvbnZlcnRDYXJkcyAoKSB7XHJcbiAgICBjb25zdCBjb252ZXJ0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuY29udmVydENhcmQpXHJcbiAgICBjb25zdCBjb252ZXJ0SW1nID0gY29udmVydEJ0bj8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdXHJcblxyXG4gICAgZnVuY3Rpb24gb25DbGljayAoKSB7XHJcbiAgICAgIGlmIChjb252ZXJ0SW1nID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbnZlcnQgY2FyZHMgdG8gdGV4dCBmb3JtIGJ1dHRvbnMgaW1hZ2UgaXMgbm90IGZvdW5kJylcclxuICAgICAgfVxyXG4gICAgICBwbGF5bGlzdHNDYXJkQ29udGFpbmVyPy5jbGFzc0xpc3QudG9nZ2xlKGNvbmZpZy5DU1MuQ0xBU1NFUy50ZXh0Rm9ybSlcclxuICAgICAgZGlzcGxheUNhcmRJbmZvLmRpc3BsYXlQbGF5bGlzdENhcmRzKGluZm9SZXRyaWV2YWwucGxheWxpc3RPYmpzKVxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgcGxheWxpc3RzQ2FyZENvbnRhaW5lcj8uY2xhc3NMaXN0LmNvbnRhaW5zKGNvbmZpZy5DU1MuQ0xBU1NFUy50ZXh0Rm9ybSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgc2F2ZUxvYWQuc2F2ZVBsYXlsaXN0Rm9ybSh0cnVlKVxyXG4gICAgICAgIGNvbnZlcnRJbWcuc3JjID0gY29uZmlnLlBBVEhTLmdyaWRWaWV3XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2F2ZUxvYWQuc2F2ZVBsYXlsaXN0Rm9ybShmYWxzZSlcclxuICAgICAgICBjb252ZXJ0SW1nLnNyYyA9IGNvbmZpZy5QQVRIUy5saXN0Vmlld1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29udmVydEJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvbkNsaWNrKCkpXHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEFkZCBldmVudCBsaXN0ZW5lciBvbnRvXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYWRkSGlkZVNob3dQbGF5bGlzdFR4dCAoKSB7XHJcbiAgICBjb25zdCB0b2dnbGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5oaWRlU2hvd1BsYXlsaXN0VHh0KVxyXG4gICAgZnVuY3Rpb24gb25DbGljayAoKSB7XHJcbiAgICAgIHRvZ2dsZUJ0bj8uY2xhc3NMaXN0LnRvZ2dsZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgIC8vIGlmIGl0cyBzZWxlY3RlZCB3ZSBoaWRlIHRoZSBjYXJkcyBvdGhlcndpc2Ugd2Ugc2hvdyB0aGVtLiBUaGlzIG9jY3VycyB3aGVuIHNjcmVlbiB3aWR0aCBpcyBhIGNlcnRhaW4gc2l6ZSBhbmQgYSBtZW51IHNsaWRpbmcgZnJvbSB0aGUgbGVmdCBhcHBlYXJzXHJcbiAgICAgIGlmICh0b2dnbGVCdG4/LmNsYXNzTGlzdC5jb250YWlucyhjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpKSB7XHJcbiAgICAgICAgY2FyZFJlc2l6ZUNvbnRhaW5lci5zdHlsZS53aWR0aCA9ICcwJ1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3RyaWN0UmVzaXplV2lkdGgoKVxyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZUhpZGVTaG93UGxheWxpc3RUeHRJY29uKClcclxuICAgIH1cclxuICAgIHRvZ2dsZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvbkNsaWNrKCkpXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBhZGRFeHBhbmRlZFBsYXlsaXN0TW9kc1NlYXJjaGJhckV2ZW50LFxyXG4gICAgYWRkRXhwYW5kZWRQbGF5bGlzdE1vZHNPcmRlckV2ZW50LFxyXG4gICAgYWRkRGVsZXRlUmVjZW50bHlBZGRlZFRyYWNrRXZlbnQsXHJcbiAgICBhZGRVbmRvUGxheWxpc3RUcmFja0RlbGV0ZUV2ZW50LFxyXG4gICAgYWRkTW9kc09wZW5lckV2ZW50LFxyXG4gICAgYWRkQ29udmVydENhcmRzLFxyXG4gICAgYWRkSGlkZVNob3dQbGF5bGlzdFR4dFxyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3Qgc2F2ZUxvYWQgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIHNhdmVSZXNpemVXaWR0aCAoKSB7XHJcbiAgICBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KFxyXG4gICAgICAgIGNvbmZpZy5VUkxzLnB1dFBsYXlsaXN0UmVzaXplRGF0YShjYXJkUmVzaXplQ29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoLnRvU3RyaW5nKCkpKVxyXG4gICAgKVxyXG4gIH1cclxuICBmdW5jdGlvbiBzYXZlUGxheWxpc3RGb3JtIChpc0luVGV4dEZvcm06IGJvb2xlYW4pIHtcclxuICAgIHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvcy5wdXQoXHJcbiAgICAgICAgY29uZmlnLlVSTHMucHV0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhKFN0cmluZyhpc0luVGV4dEZvcm0pKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc2F2ZVJlc2l6ZVdpZHRoLFxyXG4gICAgc2F2ZVBsYXlsaXN0Rm9ybVxyXG4gIH1cclxufSkoKVxyXG5cclxuLyoqXHJcbiAqIHVwZGF0ZSB0aGUgaWNvbiB0byBzaG93IGEgY2hldnJvbiBsZWZ0IG9yIGNoZXZyb24gcmlnaHQgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIHBsYXlsaXN0IHRleHQgaXMgc2hvd24gb3Igbm90LlxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlSGlkZVNob3dQbGF5bGlzdFR4dEljb24gKCkge1xyXG4gIGNvbnN0IHRvZ2dsZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmhpZGVTaG93UGxheWxpc3RUeHQpXHJcbiAgY29uc3QgYnRuSWNvbiA9IHRvZ2dsZUJ0bj8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdXHJcblxyXG4gIGlmIChidG5JY29uID09PSB1bmRlZmluZWQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignaW1nIHRvIHNob3cgYW5kIGhpZGUgdGhlIHRleHQgZm9ybSBjYXJkcyBpcyBub3QgZm91bmQnKVxyXG4gIH1cclxuICAvLyBpZiBpdHMgc2VsZWN0ZWQgd2UgaGlkZSB0aGUgY2FyZHMgb3RoZXJ3aXNlIHdlIHNob3cgdGhlbS5cclxuICBpZiAodG9nZ2xlQnRuPy5jbGFzc0xpc3QuY29udGFpbnMoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKSkge1xyXG4gICAgYnRuSWNvbi5zcmMgPSBjb25maWcuUEFUSFMuY2hldnJvblJpZ2h0XHJcbiAgfSBlbHNlIHtcclxuICAgIGJ0bkljb24uc3JjID0gY29uZmlnLlBBVEhTLmNoZXZyb25MZWZ0XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjaGVja0lmQ2FyZEZvcm1DaGFuZ2VPblJlc2l6ZSAoKSB7XHJcbiAgY29uc3QgcHJldiA9IHtcclxuICAgIHZ3SXNTbWFsbDogd2luZG93Lm1hdGNoTWVkaWEoYChtYXgtd2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWApLm1hdGNoZXNcclxuICB9XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IHdhc0JpZ05vd1NtYWxsID1cclxuICAgICAgd2luZG93Lm1hdGNoTWVkaWEoYChtYXgtd2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWApLm1hdGNoZXMgJiZcclxuICAgICAgIXByZXYudndJc1NtYWxsXHJcblxyXG4gICAgY29uc3Qgd2FzU21hbGxOb3dCaWcgPVxyXG4gICAgICBwcmV2LnZ3SXNTbWFsbCAmJlxyXG4gICAgICB3aW5kb3cubWF0Y2hNZWRpYShgKG1pbi13aWR0aDogJHtWSUVXUE9SVF9NSU59cHgpYCkubWF0Y2hlc1xyXG5cclxuICAgIGlmICh3YXNCaWdOb3dTbWFsbCB8fCB3YXNTbWFsbE5vd0JpZykge1xyXG4gICAgICBpZiAod2FzU21hbGxOb3dCaWcpIHtcclxuICAgICAgICBjb25zdCB0b2dnbGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5oaWRlU2hvd1BsYXlsaXN0VHh0KVxyXG4gICAgICAgIHRvZ2dsZUJ0bj8uY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgICAgdXBkYXRlSGlkZVNob3dQbGF5bGlzdFR4dEljb24oKVxyXG4gICAgICB9XHJcbiAgICAgIC8vIGNhcmQgZm9ybSBoYXMgY2hhbmdlZCBvbiB3aW5kb3cgcmVzaXplXHJcbiAgICAgIGRpc3BsYXlDYXJkSW5mby5kaXNwbGF5UGxheWxpc3RDYXJkcyhpbmZvUmV0cmlldmFsLnBsYXlsaXN0T2JqcylcclxuICAgICAgcHJldi52d0lzU21hbGwgPSB3aW5kb3cubWF0Y2hNZWRpYShcclxuICAgICAgICBgKG1heC13aWR0aDogJHtWSUVXUE9SVF9NSU59cHgpYFxyXG4gICAgICApLm1hdGNoZXNcclxuICAgIH1cclxuICB9KVxyXG59XHJcblxyXG5jb25zdCBpbml0aWFsTG9hZHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGxvYWRQbGF5bGlzdEZvcm0gKCkge1xyXG4gICAgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zXHJcbiAgICAgICAgLmdldChjb25maWcuVVJMcy5nZXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGEpXHJcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlcy5kYXRhID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgICAgICAgICAgICBjb25maWcuQ1NTLklEcy5jb252ZXJ0Q2FyZFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRJbWcgPSBjb252ZXJ0QnRuPy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJylbMF1cclxuICAgICAgICAgICAgaWYgKGNvbnZlcnRJbWcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29udmVydCBjYXJkcyB0byB0ZXh0IGZvcm0gYnV0dG9ucyBpbWFnZSBpcyBub3QgZm91bmQnKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBsYXlsaXN0c0NhcmRDb250YWluZXI/LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnRleHRGb3JtKVxyXG4gICAgICAgICAgICBkaXNwbGF5Q2FyZEluZm8uZGlzcGxheVBsYXlsaXN0Q2FyZHMoaW5mb1JldHJpZXZhbC5wbGF5bGlzdE9ianMpXHJcbiAgICAgICAgICAgIGNvbnZlcnRJbWcuc3JjID0gY29uZmlnLlBBVEhTLmdyaWRWaWV3XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBlbHNlIGl0IGlzIGluIGNhcmQgZm9ybSB3aGljaCBpcyB0aGUgZGVmYXVsdC5cclxuICAgICAgICB9KVxyXG4gICAgKVxyXG4gIH1cclxuICBmdW5jdGlvbiBsb2FkUmVzaXplV2lkdGggKCkge1xyXG4gICAgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zXHJcbiAgICAgICAgLmdldChjb25maWcuVVJMcy5nZXRQbGF5bGlzdFJlc2l6ZURhdGEpXHJcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgY2FyZFJlc2l6ZUNvbnRhaW5lci5zdHlsZS53aWR0aCA9IHJlcy5kYXRhICsgJ3B4J1xyXG4gICAgICAgIH0pXHJcbiAgICApXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBsb2FkUGxheWxpc3RGb3JtLFxyXG4gICAgbG9hZFJlc2l6ZVdpZHRoXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICBwcm9taXNlSGFuZGxlcjxib29sZWFuPihjaGVja0lmSGFzVG9rZW5zKCksIChoYXNUb2tlbikgPT4ge1xyXG4gICAgb25TdWNjZXNzZnVsVG9rZW5DYWxsKGhhc1Rva2VuLCAoKSA9PiB7XHJcbiAgICAgIC8vIGdldCBpbmZvcm1hdGlvbiBhbmQgb25TdWNjZXNzIGFuaW1hdGUgdGhlIGVsZW1lbnRzXHJcbiAgICAgIHByb21pc2VIYW5kbGVyKFxyXG4gICAgICAgIGluZm9SZXRyaWV2YWwuZ2V0SW5pdGlhbEluZm8oKSxcclxuICAgICAgICAoKSA9PlxyXG4gICAgICAgICAgYW5pbWF0aW9uQ29udHJvbC5hbmltYXRlQXR0cmlidXRlcyhcclxuICAgICAgICAgICAgJy5wbGF5bGlzdCwjZXhwYW5kZWQtcGxheWxpc3QtbW9kcycsXHJcbiAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIsXHJcbiAgICAgICAgICAgIDI1XHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICgpID0+IGNvbnNvbGUubG9nKCdQcm9ibGVtIHdoZW4gZ2V0dGluZyBpbmZvcm1hdGlvbicpXHJcbiAgICAgIClcclxuICAgIH0pXHJcbiAgfSlcclxuXHJcbiAgT2JqZWN0LmVudHJpZXMoYWRkRXZlbnRMaXN0ZW5lcnMpLmZvckVhY2goKFssIGFkZEV2ZW50TGlzdGVuZXJdKSA9PiB7XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKClcclxuICB9KVxyXG4gIGNoZWNrSWZDYXJkRm9ybUNoYW5nZU9uUmVzaXplKClcclxuICBPYmplY3QuZW50cmllcyhpbml0aWFsTG9hZHMpLmZvckVhY2goKFssIGxvYWRlcl0pID0+IHtcclxuICAgIGxvYWRlcigpXHJcbiAgfSlcclxufSkoKVxyXG4iLCJpbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyIH0gZnJvbSAnLi9jb25maWcnXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzcGxheVVzZXJuYW1lICgpIHtcclxuICBwcm9taXNlSGFuZGxlcjxBeGlvc1Jlc3BvbnNlPHN0cmluZyB8IG51bGw+PihheGlvcy5yZXF1ZXN0PHN0cmluZyB8IG51bGw+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRVc2VybmFtZSB9KSwgKHJlcykgPT4ge1xyXG4gICAgY29uc3QgdXNlcm5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy51c2VybmFtZSlcclxuICAgIGlmICh1c2VybmFtZSkge1xyXG4gICAgICB1c2VybmFtZS50ZXh0Q29udGVudCA9IHJlcy5kYXRhXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvcHVibGljL3BhZ2VzL3BsYXlsaXN0cy1wYWdlL3BsYXlsaXN0cy50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==