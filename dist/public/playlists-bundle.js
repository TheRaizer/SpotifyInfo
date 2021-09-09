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

/***/ "./src/public/card-actions.ts":
/*!************************************!*\
  !*** ./src/public/card-actions.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ./config */ "./src/public/config.ts");
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
        // unselect the previously selected card if it exists
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
            trackCard.addEventListener('click', () => this.onCardClick(trackCard, objArr, clickCallBack, allowUnselected, unselectPrevious));
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
    /* Change the value of the currently selected and reset the has loaded boolean.
     *
     * @param {Any} - data that has been selected
     */
    selectionChanged(currSelectedVal) {
        this._currSelectedVal = currSelectedVal;
        this.hasLoadedCurrSelected = false;
    }
    /** Checks to see if a selected value post load is valid by
     * comparing it to the currently selected value and verifying that
     * the currently selected has not already been loaded.
     *
     * @param {T} - data that has been loaded
     * @returns {Boolean} - whether the loaded selection is valid
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
    get(index) {
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
                return current.data;
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
     * @returns {String} A string representation of the list.
     */
    toString() {
        return [...this].toString();
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
exports.checkIfIsPlayingElAfterRerender = exports.isSamePlayingURI = void 0;
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
const track_play_args_1 = __importDefault(__webpack_require__(/*! ./pubsub/event-args/track-play-args */ "./src/public/components/pubsub/event-args/track-play-args.ts"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const aggregator_1 = __importDefault(__webpack_require__(/*! ./pubsub/aggregator */ "./src/public/components/pubsub/aggregator.ts"));
class SpotifyPlayback {
    constructor() {
        this.isExecutingAction = false;
        this.player = null;
        this.device_id = '';
        this.getStateInterval = null;
        this.webPlayerEls = {
            title: null,
            progress: null,
            currTime: null,
            duration: null
        };
        this.selPlaying = {
            element: null,
            track_uri: '',
            trackDataNode: null
        };
        this.playerIsReady = false;
        this._loadWebPlayer();
    }
    _loadWebPlayer() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, config_1.promiseHandler)(axios_1.default.request({ method: 'GET', url: config_1.config.URLs.getAccessToken }), (res) => {
                // this takes too long and spotify sdk needs window.onSpotifyWebPlaybackSDKReady to be defined quicker.
                console.log('request player');
                const NO_CONTENT = 204;
                if (res.status === NO_CONTENT || res.data === null) {
                    throw new Error('access token has no content');
                }
                else if (window.Spotify) {
                    console.log('is defined so create');
                    // if the spotify sdk is already defined set player without setting onSpotifyWebPlaybackSDKReady meaning the window: Window is in a different scope
                    // use window.Spotify.Player as spotify namespace is declared in the Window interface as per DefinitelyTyped -> spotify-web-playback-sdk -> index.d.ts https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/spotify-web-playback-sdk
                    this.player = new window.Spotify.Player({
                        name: 'Spotify Info Web Player',
                        getOAuthToken: (cb) => {
                            // give the token to callback
                            cb(res.data);
                        },
                        volume: 0.4
                    });
                    this._addListeners();
                    // Connect to the player!
                    this.player.connect();
                }
                else {
                    // of spotify sdk is undefined
                    window.onSpotifyWebPlaybackSDKReady = () => {
                        console.log('create when undefined');
                        // if getting token was succesful create spotify player using the window in this scope
                        this.player = new window.Spotify.Player({
                            name: 'Spotify Info Web Player',
                            getOAuthToken: (cb) => {
                                // give the token to callback
                                cb(res.data);
                            },
                            volume: 0.1
                        });
                        this._addListeners();
                        // Connect to the player!
                        this.player.connect();
                    };
                }
            });
        });
    }
    _addListeners() {
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
            this.appendWebPlayerHtml();
            this.playerIsReady = true;
        });
        // Not Ready
        this.player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });
    }
    getWebPlayerEls() {
        var _a, _b, _c, _d, _e, _f;
        const webPlayerEl = (_a = document.getElementById(config_1.config.CSS.IDs.webPlayer)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('web player element does not exist');
        const playTimeBar = (_b = document.getElementById(config_1.config.CSS.IDs.playTimeBar)) !== null && _b !== void 0 ? _b : (0, config_1.throwExpression)('play time bar element does not exist');
        this.webPlayerEls.progress = (_c = webPlayerEl.getElementsByClassName(config_1.config.CSS.CLASSES.progress)[0]) !== null && _c !== void 0 ? _c : (0, config_1.throwExpression)('web player progress bar does not exist');
        this.webPlayerEls.title = (_d = webPlayerEl.getElementsByTagName('h4')[0]) !== null && _d !== void 0 ? _d : (0, config_1.throwExpression)('web player title element does not exist');
        // get playtime bar elements
        this.webPlayerEls.currTime = (_e = playTimeBar.getElementsByTagName('p')[0]) !== null && _e !== void 0 ? _e : (0, config_1.throwExpression)('web player current time element does not exist');
        this.webPlayerEls.duration = (_f = playTimeBar.getElementsByTagName('p')[1]) !== null && _f !== void 0 ? _f : (0, config_1.throwExpression)('web player duration time element does not exist');
    }
    appendWebPlayerHtml() {
        const html = `
    <article id="${config_1.config.CSS.IDs.webPlayer}" class="resize-drag">
      <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap}">Title</h4>
      <div>
        <button id="${config_1.config.CSS.IDs.playPrev}"><img src="${config_1.config.PATHS.playPrev}" alt="previous"/></button>
        <button id="${config_1.config.CSS.CLASSES.playPause}"><img src="${config_1.config.PATHS.pauseIcon}" alt="play/pause"/></button>
        <button id="${config_1.config.CSS.IDs.playNext}"><img src="${config_1.config.PATHS.playNext}" alt="next"/></button>
      </div>
      <div id="${config_1.config.CSS.IDs.playTimeBar}">
        <p>0:00</p>
        <div class="${config_1.config.CSS.CLASSES.progressBar}">
          <div class="${config_1.config.CSS.CLASSES.progress}"></div>
        </div>
        <p>0:00</p>
      </div>
    </article>
    `;
        const webPlayerEl = (0, config_1.htmlToEl)(html);
        document.body.append(webPlayerEl);
        this.assignEventListeners();
        this.getWebPlayerEls();
    }
    assignEventListeners() {
        const webPlayer = document.getElementById(config_1.config.CSS.IDs.webPlayer);
        if (webPlayer === null) {
            throw new Error('Web player element does not exist');
        }
        const playPrev = document.getElementById(config_1.config.CSS.IDs.playPrev);
        const playPause = webPlayer.getElementsByClassName(config_1.config.CSS.CLASSES.playPause)[0];
        const playNext = document.getElementById(config_1.config.CSS.IDs.playNext);
        playPrev === null || playPrev === void 0 ? void 0 : playPrev.addEventListener('click', () => this.tryPlayPrev(this.selPlaying.trackDataNode));
        playNext === null || playNext === void 0 ? void 0 : playNext.addEventListener('click', () => this.tryPlayNext(this.selPlaying.trackDataNode));
    }
    updateWebPlayer(percentDone, position) {
        if (position !== 0) {
            this.webPlayerEls.progress.style.width = `${percentDone}%`;
            if (this.webPlayerEls.currTime == null) {
                throw new Error('Current time element is null');
            }
            this.webPlayerEls.currTime.textContent =
                (0, config_1.millisToMinutesAndSeconds)(position);
        }
    }
    /** Tries to play the previous IPlayable given the current playing IPlayable node.
     *
     * @param currNode - the current IPlayable node that was/is playing
     */
    tryPlayPrev(currNode) {
        if (currNode === null) {
            return;
        }
        // check to see if this is the first node or if an action is processing
        if (!this.isExecutingAction && currNode.previous !== null) {
            console.log('play prev');
            const prevTrack = currNode.previous.data;
            this.setSelPlayingEl(new track_play_args_1.default(prevTrack, currNode.previous));
        }
    }
    /** Tries to play the next IPlayable given the current playing IPlayable node.
     *
     * @param currNode - the current IPlayable node that was/is playing
     */
    tryPlayNext(currNode) {
        if (currNode === null) {
            return;
        }
        // check to see if this is the last node or if an action is processing
        if (!this.isExecutingAction && currNode.next !== null) {
            console.log('play next');
            const nextTrack = currNode.next.data;
            this.setSelPlayingEl(new track_play_args_1.default(nextTrack, currNode.next));
        }
    }
    onTrackFinish() {
        if (this.selPlaying.element === null) {
            throw new Error('Selected playing element was null before deselection on song finish');
        }
        this.selPlaying.element.classList.remove(config_1.config.CSS.CLASSES.selected);
        this.selPlaying.element = null;
        this.selPlaying.track_uri = '';
        this.webPlayerEls.progress.style.width = '100%';
        clearInterval(this.getStateInterval);
        console.log(this.selPlaying.trackDataNode);
        this.tryPlayNext(this.selPlaying.trackDataNode);
    }
    /** Sets an interval that obtains the state of the player every second.
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
                    this.webPlayerEls.duration.textContent = durationMinSec;
                }
                const percentDone = (position / duration) * 100;
                // the position gets set to 0 when the song is finished
                if (position === 0) {
                    this.onTrackFinish();
                }
                else {
                    // if the position isnt 0 update the web player elements
                    this.updateWebPlayer(percentDone, position);
                }
            });
        }, 1000);
    }
    /** Select a certain play/pause element and play the given track uri
     * and unselect the previous one then pause the previous track_uri.
     *
     * @param {PlayableEventArg} eventArg - a class that contains the current, next and previous tracks to play
     */
    setSelPlayingEl(eventArg) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(eventArg.playableNode);
            // if the player isn't ready we cannot continue.
            if (!this.playerIsReady) {
                console.log('player is not ready');
                return;
            }
            if (this.isExecutingAction) {
                console.log('is currently executing action');
                return;
            }
            this.isExecutingAction = true;
            console.log('Start Action');
            if (this.selPlaying.element != null) {
                // if there already is a selected element unselect it
                this.selPlaying.element.classList.remove(config_1.config.CSS.CLASSES.selected);
                yield this.pause();
                clearInterval(this.getStateInterval);
                // if the selected el is the same as the prev then null it and return so we do not end up reselecting it right after deselecting.
                if (this.selPlaying.element === eventArg.currPlayable.selEl) {
                    this.selPlaying.element = null;
                    this.isExecutingAction = false;
                    console.log('Action Ended');
                    return;
                }
            }
            // prev track uri is the same then resume the song instead of replaying it.
            if (this.selPlaying.track_uri === eventArg.currPlayable.uri) {
                yield this.startTrack(eventArg.currPlayable.selEl, eventArg.currPlayable.uri, () => __awaiter(this, void 0, void 0, function* () { return this.resume(); }), eventArg.currPlayable.title, eventArg.playableNode);
                console.log('Action Ended');
                this.isExecutingAction = false;
                return;
            }
            yield this.startTrack(eventArg.currPlayable.selEl, eventArg.currPlayable.uri, () => __awaiter(this, void 0, void 0, function* () { return this.play(eventArg.currPlayable.uri); }), eventArg.currPlayable.title, eventArg.playableNode);
            console.log('Action Ended');
            this.isExecutingAction = false;
        });
    }
    startTrack(selEl, track_uri, playingAsyncFunc, title, trackNode) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Start');
            this.selPlaying.trackDataNode = trackNode;
            this.selPlaying.element = selEl;
            this.selPlaying.element.classList.add(config_1.config.CSS.CLASSES.selected);
            this.selPlaying.track_uri = track_uri;
            this.webPlayerEls.title.textContent = title;
            yield playingAsyncFunc();
            // set playing state once song starts playing
            this.setGetStateInterval();
        });
    }
    /** Plays a track through this device.
     *
     * @param {string} track_uri - the track uri to play
     * @returns whether or not the track has been played succesfully.
     */
    play(track_uri) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlayTrack(this.device_id, track_uri)));
            console.log('play');
        });
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.player.resume();
            console.log('resume');
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.player.pause();
            console.log('paused');
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
eventAggregator.subscribe(track_play_args_1.default.name, (eventArg) => spotifyPlayback.setSelPlayingEl(eventArg));
(0, config_1.addResizeDrag)();
function isSamePlayingURI(uri) {
    return (uri === spotifyPlayback.selPlaying.track_uri &&
        spotifyPlayback.selPlaying.element != null);
}
exports.isSamePlayingURI = isSamePlayingURI;
function checkIfIsPlayingElAfterRerender(uri, selEl, trackDataNode) {
    if (isSamePlayingURI(uri)) {
        // This element was playing before rerendering so set it to be the currently playing one again
        spotifyPlayback.selPlaying.element = selEl;
        spotifyPlayback.selPlaying.trackDataNode = trackDataNode;
    }
}
exports.checkIfIsPlayingElAfterRerender = checkIfIsPlayingElAfterRerender;


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
    /** Produces the card element of this playlist.
     *
     * @param {Number} idx - The card index to use for the elements id suffix
     * @returns {ChildNode} - The converted html string to an element
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
    /** Produces list of Track class instances using track datas from spotify web api.
     *
     * @returns {DoublyLinkedList<Track>} - List of track classes created using the obtained track datas.
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
/** Gets playlist tracks from data. This also initializes the date added.
 *
 * @param {Array<TrackData>} tracksData
 * @param {Array<PlaylistTrackData>} dateAddedObjects - The object that contains the added_at variable.
 * @param {DoublyLinkedList<Track>} tracksList
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
    constructor(currTrack, trackNode) {
        this.currPlayable = currTrack;
        this.playableNode = trackNode;
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
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const eventAggregator = window.eventAggregator;
class Track extends card_1.default {
    constructor(props) {
        super();
        const { title, images, duration, uri, popularity, releaseDate, id, album, externalUrls, artists } = props;
        this.externalUrls = externalUrls;
        this._id = id;
        this._title = title;
        this.artistsDatas = this.filterDataFromArtists(artists);
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
    generateHTMLArtistNames() {
        let artistNames = '';
        for (let i = 0; i < this.artistsDatas.length; i++) {
            const artist = this.artistsDatas[i];
            artistNames += `<a href="${artist.external_urls.spotify}" target="_blank">${artist.name}</a>`;
            if (i < this.artistsDatas.length - 1) {
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
                    <a href="${this.album.externalUrl}">
                      <p class="${config_1.config.CSS.CLASSES.ellipsisWrap}">${this.album.name}</p>
                    </a>
                  </div>
                </button>
              </div>
            </div>
          `;
        return (0, config_1.htmlToEl)(html);
    }
    /** Get a track html to be placed as a list element.
     *
     * @param {Boolean} displayDate - whether to display the date.
     * @returns {ChildNode} - The converted html string to an element
     */
    getPlaylistTrackHtml(trackList, displayDate = true) {
        // cast tracks as an IPlayable in order to reduce errors due to exessive accessability if logging it will log all Track attributes. But in code we can only access IPlayable attributes.
        const track = this;
        const trackNode = trackList.find((x) => x.uri === this.uri, true);
        function playPauseClick() {
            // select this track to play or pause by publishing the track play event arg
            eventAggregator.publish(new track_play_args_1.default(track, trackNode));
        }
        const html = `
            <li class="${config_1.config.CSS.CLASSES.playlistTrack}">
              <button class="${config_1.config.CSS.CLASSES.playPause} ${(0, playback_sdk_1.isSamePlayingURI)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}"><img src="" alt="play/pause" 
              class="${config_1.config.CSS.CLASSES.noSelect}"/></button>
              <img class="${config_1.config.CSS.CLASSES.noSelect}" src="${this.imageUrl}"></img>
              <div class="${config_1.config.CSS.CLASSES.links}">
                <a href="${this.externalUrls.spotify}" target="_blank">
                  <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap} ${config_1.config.CSS.CLASSES.name}">${this.title}
                  </h4>
                <a/>
                <div class="${config_1.config.CSS.CLASSES.ellipsisWrap}">
                  ${this.generateHTMLArtistNames()}
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
        playPauseBtn === null || playPauseBtn === void 0 ? void 0 : playPauseBtn.addEventListener('click', () => playPauseClick());
        (0, playback_sdk_1.checkIfIsPlayingElAfterRerender)(this.uri, playPauseBtn, trackNode);
        return el;
    }
    /** Get a track html to be placed as a list element on a ranked list.
     *
     * @returns {ChildNode} - The converted html string to an element
     */
    getRankedTrackHtml(rank) {
        const html = `
            <li class="${config_1.config.CSS.CLASSES.playlistTrack}">
              <p>${rank}.</p>
              <img class="${config_1.config.CSS.CLASSES.noSelect}" src="${this.imageUrl}"></img>
              <div class="${config_1.config.CSS.CLASSES.links}">
                <a href="${this.externalUrls.spotify}" target="_blank">
                  <h4 class="${config_1.config.CSS.CLASSES.ellipsisWrap} ${config_1.config.CSS.CLASSES.name}">${this.title}
                  </h4>
                <a/>
                <div class="${config_1.config.CSS.CLASSES.ellipsisWrap}">
                  ${this.generateHTMLArtistNames()}
                </div>
              </div>
              <h5>${this._duration}</h5>
            </li>
            `;
        return (0, config_1.htmlToEl)(html);
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
exports.throwExpression = exports.addResizeDrag = exports.getPixelPosInElOnClick = exports.animationControl = exports.removeAllChildNodes = exports.getValidImage = exports.capitalizeFirstLetter = exports.isEllipsisActive = exports.getTextWidth = exports.searchUl = exports.promiseHandler = exports.htmlToEl = exports.millisToMinutesAndSeconds = exports.config = void 0;
const interactjs_1 = __importDefault(__webpack_require__(/*! interactjs */ "./node_modules/interactjs/dist/interact.min.js"));
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
            playPrev: 'play-prev'
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
            progressBar: 'progress-bar',
            playPause: 'play-pause'
        },
        ATTRIBUTES: {
            dataSelection: 'data-selection'
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
        putPlaylistResizeData: (val) => `/spotify/put-playlist-resize-data?val=${val}`,
        getPlaylistResizeData: '/spotify/get-playlist-resize-data',
        putPlaylistIsInTextFormData: (val) => `/spotify/put-playlist-text-form-data?val=${val}`,
        getPlaylistIsInTextFormData: '/spotify/get-playlist-text-form-data',
        getArtistTopTracks: (id) => `/spotify/get-artist-top-tracks?id=${id}`,
        getCurrentUserProfile: '/spotify/get-current-user-profile',
        putClearSession: '/clear-session',
        getCurrentUserSavedTracks: '/spotify/get-current-user-saved-tracks',
        getFollowedArtists: '/spotify/get-followed-artists',
        putPlayTrack: (device_id, track_uri) => `/spotify/play-track?device_id=${device_id}&track_uri=${track_uri}`
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
        playNext: '/images/next-30px.png',
        playPrev: '/images/previous-30px.png'
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
        throw new Error();
    }
}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield promise;
            onSuccesful(res);
            return { res: res, err: null };
        }
        catch (err) {
            console.error(err);
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
function dragMoveListener(evt) {
    const target = evt.target;
    // keep the dragged position in the data-x/data-y attributes
    if (target === null) {
        throw new Error('Interactjs Event does not contain target');
    }
    let x = 0;
    let y = 0;
    const dataX = target.getAttribute('data-x');
    const dataY = target.getAttribute('data-y');
    if (typeof dataX === 'string' && typeof dataY === 'string') {
        x = parseFloat(dataX) + evt.dx;
        y = parseFloat(dataY) + evt.dy;
    }
    else {
        x += evt.dx;
        y += evt.dy;
    }
    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    target.setAttribute('data-x', x.toString());
    target.setAttribute('data-y', y.toString());
}
function addResizeDrag() {
    (0, interactjs_1.default)('.resize-drag')
        .resizable({
        // resize from all edges and corners
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
            move(evt) {
                const target = evt.target;
                let x = parseFloat(target.getAttribute('data-x')) || 0;
                let y = parseFloat(target.getAttribute('data-y')) || 0;
                // update the element's style
                target.style.width = evt.rect.width + 'px';
                target.style.height = evt.rect.height + 'px';
                // translate when resizing from top or left edges
                x += evt.deltaRect.left;
                y += evt.deltaRect.top;
                target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            }
        },
        modifiers: [
            // keep the edges inside the parent
            interactjs_1.default.modifiers.restrictEdges({
                outer: 'parent'
            }),
            // minimum size
            interactjs_1.default.modifiers.restrictSize({
                min: { width: 100, height: 50 }
            })
        ],
        inertia: false
    })
        .draggable({
        listeners: { move: dragMoveListener },
        inertia: true,
        modifiers: [
            interactjs_1.default.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: false
            })
        ]
    });
}
exports.addResizeDrag = addResizeDrag;
function throwExpression(errorMessage) {
    throw new Error(errorMessage);
}
exports.throwExpression = throwExpression;


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
const HALF_HOUR = 1.8e6; /* 30 min in ms */
function isTokenRes(res) {
    return typeof res.data === 'boolean';
}
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
        // because token is stored in session we need to reassign 'hasToken' to the client so we do not need to run this method again on refresh
        yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getHasTokens), (res) => {
            if (!isTokenRes(res)) {
                throw new Error('Invalid has token response');
            }
            hasToken = res.data;
        });
        if (hasToken) {
            startRefreshInterval();
        }
        return hasToken;
    });
}
exports.checkIfHasTokens = checkIfHasTokens;
function getTokens(onNoToken) {
    return __awaiter(this, void 0, void 0, function* () {
        let hasToken = false;
        // create a parameter searcher in the URL after '?' which holds the requests body parameters
        const urlParams = new URLSearchParams(window.location.search);
        // Get the code from the parameter called 'code' in the url which
        // hopefully came back from the spotify GET request otherwise it is null
        let authCode = urlParams.get('code');
        if (authCode) {
            yield (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getObtainTokensPrefix(authCode)), // no need to specify type as no type value is used.
            // if the request was succesful we have recieved a token
            () => (hasToken = true));
            authCode = '';
        }
        else {
            onNoToken();
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
function onSuccessfulTokenCall(hasToken, hasTokenCallback = () => { }, noTokenCallBack = () => { }) {
    var _a;
    const getTokensSpinner = document.getElementById(config_1.config.CSS.IDs.getTokenLoadingSpinner);
    // remove token spinner because by this line we have obtained the token
    (_a = getTokensSpinner === null || getTokensSpinner === void 0 ? void 0 : getTokensSpinner.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(getTokensSpinner);
    const infoContainer = document.getElementById(config_1.config.CSS.IDs.infoContainer);
    if (hasToken) {
        // generate the nav login
        generateLogin();
        if (infoContainer == null) {
            throw new Error('Info container Element does not exist');
        }
        infoContainer.style.display = 'block';
        hasTokenCallback();
    }
    else {
        // if there is no token redirect to allow access page
        window.location.href = config_1.config.URLs.siteUrl;
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
const card_actions_1 = __importDefault(__webpack_require__(/*! ../../card-actions */ "./src/public/card-actions.ts"));
const doubly_linked_list_1 = __importStar(__webpack_require__(/*! ../../components/doubly-linked-list */ "./src/public/components/doubly-linked-list.ts"));
const interactjs_1 = __importDefault(__webpack_require__(/*! interactjs */ "./node_modules/interactjs/dist/interact.min.js"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const expandedPlaylistMods = document.getElementById(config_1.config.CSS.IDs.expandedPlaylistMods);
const playlistHeaderArea = document.getElementById(config_1.config.CSS.IDs.playlistHeaderArea);
// add on change event listener to the order selection element of the mods expanded playlist
const playlistOrder = expandedPlaylistMods === null || expandedPlaylistMods === void 0 ? void 0 : expandedPlaylistMods.getElementsByClassName(config_1.config.CSS.CLASSES.playlistOrder)[0];
// TEST
const val = document.getElementById('ELEMENT DOES NOT EXIST');
console.log(val === null || val === void 0 ? void 0 : val.getElementsByClassName(config_1.config.CSS.CLASSES.playlistOrder)[0]); // this will log as undefined because 'val' is undefined
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
            .on('resizeend', saveResizeWidth);
        // once we renable the resize we must set its width to be what the user last set it too.
        initialLoads.loadResizeWidth();
    }
    function disableResize() {
        if (interactjs_1.default.isSet(cardResizeContainer)) {
            (0, interactjs_1.default)(cardResizeContainer).unset();
        }
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
    function savePlaylistForm(isInTextForm) {
        // save whether the playlist is in text form or not.
        (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlaylistIsInTextFormData(String(isInTextForm))));
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
                savePlaylistForm(true);
                convertImg.src = config_1.config.PATHS.gridView;
            }
            else {
                savePlaylistForm(false);
                convertImg.src = config_1.config.PATHS.listView;
            }
        }
        convertBtn === null || convertBtn === void 0 ? void 0 : convertBtn.addEventListener('click', () => onClick());
    }
    function addHideShowCards() {
        const hideShowCards = document.getElementById('hide-show-cards');
        function onClick() {
            hideShowCards === null || hideShowCards === void 0 ? void 0 : hideShowCards.classList.toggle(config_1.config.CSS.CLASSES.selected);
            // if its selected we hide the cards otherwise we show them. This occurs when screen width is a certain size and a menu sliding from the left appears
            if (hideShowCards === null || hideShowCards === void 0 ? void 0 : hideShowCards.classList.contains(config_1.config.CSS.CLASSES.selected)) {
                cardResizeContainer.style.width = '0';
            }
            else {
                restrictResizeWidth();
            }
            updateHideShowCardsImg();
        }
        hideShowCards === null || hideShowCards === void 0 ? void 0 : hideShowCards.addEventListener('click', () => onClick());
    }
    return {
        addExpandedPlaylistModsSearchbarEvent,
        addExpandedPlaylistModsOrderEvent,
        addDeleteRecentlyAddedTrackEvent,
        addUndoPlaylistTrackDeleteEvent,
        addModsOpenerEvent,
        addConvertCards,
        addHideShowCards
    };
})();
function saveResizeWidth() {
    (0, config_1.promiseHandler)(axios_1.default.put(config_1.config.URLs.putPlaylistResizeData(cardResizeContainer.getBoundingClientRect().width.toString())));
    console.log('end resize');
}
function updateHideShowCardsImg() {
    const hideShowCards = document.getElementById('hide-show-cards');
    const hideShowImg = hideShowCards === null || hideShowCards === void 0 ? void 0 : hideShowCards.getElementsByTagName('img')[0];
    if (hideShowImg === undefined) {
        throw new Error('img to show and hide the text form cards is not found');
    }
    // if its selected we hide the cards otherwise we show them.
    if (hideShowCards === null || hideShowCards === void 0 ? void 0 : hideShowCards.classList.contains(config_1.config.CSS.CLASSES.selected)) {
        hideShowImg.src = config_1.config.PATHS.chevronRight;
    }
    else {
        hideShowImg.src = config_1.config.PATHS.chevronLeft;
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
                const hideShowCards = document.getElementById('hide-show-cards');
                hideShowCards === null || hideShowCards === void 0 ? void 0 : hideShowCards.classList.remove(config_1.config.CSS.CLASSES.selected);
                updateHideShowCardsImg();
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
                // if its in text form change it to be so.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFDOUIsR0FBRyxFQUFFLENBQ0gseUJBQWdCLENBQUMsaUJBQWlCLENBQ2hDLG1DQUFtQyxFQUNuQyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQ3pCLEVBQUUsQ0FDSCxFQUNILEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FDdEQ7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLEVBQUUsRUFBRTtRQUNqRSxnQkFBZ0IsRUFBRTtJQUNwQixDQUFDLENBQUM7SUFDRiw2QkFBNkIsRUFBRTtJQUMvQixNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFO1FBQ2xELE1BQU0sRUFBRTtJQUNWLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyxFQUFFOzs7Ozs7O1VDM3BCSjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9pbnRlcmFjdGpzL2Rpc3QvaW50ZXJhY3QubWluLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jYXJkLWFjdGlvbnMudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvYWxidW0udHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvYXN5bmNTZWxlY3Rpb25WZXJpZi50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9jYXJkLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wbGF5YmFjay1zZGsudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcGxheWxpc3QudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL2FnZ3JlZ2F0b3IudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3B1YnN1Yi9zdWJzY3JpcHRpb24udHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvdHJhY2sudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbmZpZy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvbWFuYWdlLXRva2Vucy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvcGFnZXMvcGxheWxpc3RzLXBhZ2UvcGxheWxpc3RzLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogSWdub3JlICovIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIvKiBpbnRlcmFjdC5qcyAxLjEwLjExIHwgaHR0cHM6Ly9pbnRlcmFjdGpzLmlvL2xpY2Vuc2UgKi9cbiFmdW5jdGlvbih0KXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz10KCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSx0KTooXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjp0aGlzKS5pbnRlcmFjdD10KCl9KChmdW5jdGlvbigpe3ZhciB0PXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZGVmYXVsdD12b2lkIDAsdC5kZWZhdWx0PWZ1bmN0aW9uKHQpe3JldHVybiEoIXR8fCF0LldpbmRvdykmJnQgaW5zdGFuY2VvZiB0LldpbmRvd307dmFyIGU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZS5pbml0PW8sZS5nZXRXaW5kb3c9ZnVuY3Rpb24oZSl7cmV0dXJuKDAsdC5kZWZhdWx0KShlKT9lOihlLm93bmVyRG9jdW1lbnR8fGUpLmRlZmF1bHRWaWV3fHxyLndpbmRvd30sZS53aW5kb3c9ZS5yZWFsV2luZG93PXZvaWQgMDt2YXIgbj12b2lkIDA7ZS5yZWFsV2luZG93PW47dmFyIHI9dm9pZCAwO2Z1bmN0aW9uIG8odCl7ZS5yZWFsV2luZG93PW49dDt2YXIgbz10LmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO28ub3duZXJEb2N1bWVudCE9PXQuZG9jdW1lbnQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIHQud3JhcCYmdC53cmFwKG8pPT09byYmKHQ9dC53cmFwKHQpKSxlLndpbmRvdz1yPXR9ZS53aW5kb3c9cixcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93JiZ3aW5kb3cmJm8od2luZG93KTt2YXIgaT17fTtmdW5jdGlvbiBhKHQpe3JldHVybihhPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1PYmplY3QuZGVmaW5lUHJvcGVydHkoaSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxpLmRlZmF1bHQ9dm9pZCAwO3ZhciBzPWZ1bmN0aW9uKHQpe3JldHVybiEhdCYmXCJvYmplY3RcIj09PWEodCl9LGw9ZnVuY3Rpb24odCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdH0sdT17d2luZG93OmZ1bmN0aW9uKG4pe3JldHVybiBuPT09ZS53aW5kb3d8fCgwLHQuZGVmYXVsdCkobil9LGRvY0ZyYWc6ZnVuY3Rpb24odCl7cmV0dXJuIHModCkmJjExPT09dC5ub2RlVHlwZX0sb2JqZWN0OnMsZnVuYzpsLG51bWJlcjpmdW5jdGlvbih0KXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgdH0sYm9vbDpmdW5jdGlvbih0KXtyZXR1cm5cImJvb2xlYW5cIj09dHlwZW9mIHR9LHN0cmluZzpmdW5jdGlvbih0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdH0sZWxlbWVudDpmdW5jdGlvbih0KXtpZighdHx8XCJvYmplY3RcIiE9PWEodCkpcmV0dXJuITE7dmFyIG49ZS5nZXRXaW5kb3codCl8fGUud2luZG93O3JldHVybi9vYmplY3R8ZnVuY3Rpb24vLnRlc3QoYShuLkVsZW1lbnQpKT90IGluc3RhbmNlb2Ygbi5FbGVtZW50OjE9PT10Lm5vZGVUeXBlJiZcInN0cmluZ1wiPT10eXBlb2YgdC5ub2RlTmFtZX0scGxhaW5PYmplY3Q6ZnVuY3Rpb24odCl7cmV0dXJuIHModCkmJiEhdC5jb25zdHJ1Y3RvciYmL2Z1bmN0aW9uIE9iamVjdFxcYi8udGVzdCh0LmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpfSxhcnJheTpmdW5jdGlvbih0KXtyZXR1cm4gcyh0KSYmdm9pZCAwIT09dC5sZW5ndGgmJmwodC5zcGxpY2UpfX07aS5kZWZhdWx0PXU7dmFyIGM9e307ZnVuY3Rpb24gZih0KXt2YXIgZT10LmludGVyYWN0aW9uO2lmKFwiZHJhZ1wiPT09ZS5wcmVwYXJlZC5uYW1lKXt2YXIgbj1lLnByZXBhcmVkLmF4aXM7XCJ4XCI9PT1uPyhlLmNvb3Jkcy5jdXIucGFnZS55PWUuY29vcmRzLnN0YXJ0LnBhZ2UueSxlLmNvb3Jkcy5jdXIuY2xpZW50Lnk9ZS5jb29yZHMuc3RhcnQuY2xpZW50LnksZS5jb29yZHMudmVsb2NpdHkuY2xpZW50Lnk9MCxlLmNvb3Jkcy52ZWxvY2l0eS5wYWdlLnk9MCk6XCJ5XCI9PT1uJiYoZS5jb29yZHMuY3VyLnBhZ2UueD1lLmNvb3Jkcy5zdGFydC5wYWdlLngsZS5jb29yZHMuY3VyLmNsaWVudC54PWUuY29vcmRzLnN0YXJ0LmNsaWVudC54LGUuY29vcmRzLnZlbG9jaXR5LmNsaWVudC54PTAsZS5jb29yZHMudmVsb2NpdHkucGFnZS54PTApfX1mdW5jdGlvbiBkKHQpe3ZhciBlPXQuaUV2ZW50LG49dC5pbnRlcmFjdGlvbjtpZihcImRyYWdcIj09PW4ucHJlcGFyZWQubmFtZSl7dmFyIHI9bi5wcmVwYXJlZC5heGlzO2lmKFwieFwiPT09cnx8XCJ5XCI9PT1yKXt2YXIgbz1cInhcIj09PXI/XCJ5XCI6XCJ4XCI7ZS5wYWdlW29dPW4uY29vcmRzLnN0YXJ0LnBhZ2Vbb10sZS5jbGllbnRbb109bi5jb29yZHMuc3RhcnQuY2xpZW50W29dLGUuZGVsdGFbb109MH19fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShjLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGMuZGVmYXVsdD12b2lkIDA7dmFyIHA9e2lkOlwiYWN0aW9ucy9kcmFnXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmFjdGlvbnMsbj10LkludGVyYWN0YWJsZSxyPXQuZGVmYXVsdHM7bi5wcm90b3R5cGUuZHJhZ2dhYmxlPXAuZHJhZ2dhYmxlLGUubWFwLmRyYWc9cCxlLm1ldGhvZERpY3QuZHJhZz1cImRyYWdnYWJsZVwiLHIuYWN0aW9ucy5kcmFnPXAuZGVmYXVsdHN9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1tb3ZlXCI6ZixcImludGVyYWN0aW9uczphY3Rpb24tcmVzdW1lXCI6ZixcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOmQsXCJhdXRvLXN0YXJ0OmNoZWNrXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuaW50ZXJhY3RhYmxlLHI9dC5idXR0b25zLG89bi5vcHRpb25zLmRyYWc7aWYobyYmby5lbmFibGVkJiYoIWUucG9pbnRlcklzRG93bnx8IS9tb3VzZXxwb2ludGVyLy50ZXN0KGUucG9pbnRlclR5cGUpfHwwIT0ociZuLm9wdGlvbnMuZHJhZy5tb3VzZUJ1dHRvbnMpKSlyZXR1cm4gdC5hY3Rpb249e25hbWU6XCJkcmFnXCIsYXhpczpcInN0YXJ0XCI9PT1vLmxvY2tBeGlzP28uc3RhcnRBeGlzOm8ubG9ja0F4aXN9LCExfX0sZHJhZ2dhYmxlOmZ1bmN0aW9uKHQpe3JldHVybiBpLmRlZmF1bHQub2JqZWN0KHQpPyh0aGlzLm9wdGlvbnMuZHJhZy5lbmFibGVkPSExIT09dC5lbmFibGVkLHRoaXMuc2V0UGVyQWN0aW9uKFwiZHJhZ1wiLHQpLHRoaXMuc2V0T25FdmVudHMoXCJkcmFnXCIsdCksL14oeHl8eHx5fHN0YXJ0KSQvLnRlc3QodC5sb2NrQXhpcykmJih0aGlzLm9wdGlvbnMuZHJhZy5sb2NrQXhpcz10LmxvY2tBeGlzKSwvXih4eXx4fHkpJC8udGVzdCh0LnN0YXJ0QXhpcykmJih0aGlzLm9wdGlvbnMuZHJhZy5zdGFydEF4aXM9dC5zdGFydEF4aXMpLHRoaXMpOmkuZGVmYXVsdC5ib29sKHQpPyh0aGlzLm9wdGlvbnMuZHJhZy5lbmFibGVkPXQsdGhpcyk6dGhpcy5vcHRpb25zLmRyYWd9LGJlZm9yZU1vdmU6Zixtb3ZlOmQsZGVmYXVsdHM6e3N0YXJ0QXhpczpcInh5XCIsbG9ja0F4aXM6XCJ4eVwifSxnZXRDdXJzb3I6ZnVuY3Rpb24oKXtyZXR1cm5cIm1vdmVcIn19LHY9cDtjLmRlZmF1bHQ9djt2YXIgaD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoaCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxoLmRlZmF1bHQ9dm9pZCAwO3ZhciBnPXtpbml0OmZ1bmN0aW9uKHQpe3ZhciBlPXQ7Zy5kb2N1bWVudD1lLmRvY3VtZW50LGcuRG9jdW1lbnRGcmFnbWVudD1lLkRvY3VtZW50RnJhZ21lbnR8fHksZy5TVkdFbGVtZW50PWUuU1ZHRWxlbWVudHx8eSxnLlNWR1NWR0VsZW1lbnQ9ZS5TVkdTVkdFbGVtZW50fHx5LGcuU1ZHRWxlbWVudEluc3RhbmNlPWUuU1ZHRWxlbWVudEluc3RhbmNlfHx5LGcuRWxlbWVudD1lLkVsZW1lbnR8fHksZy5IVE1MRWxlbWVudD1lLkhUTUxFbGVtZW50fHxnLkVsZW1lbnQsZy5FdmVudD1lLkV2ZW50LGcuVG91Y2g9ZS5Ub3VjaHx8eSxnLlBvaW50ZXJFdmVudD1lLlBvaW50ZXJFdmVudHx8ZS5NU1BvaW50ZXJFdmVudH0sZG9jdW1lbnQ6bnVsbCxEb2N1bWVudEZyYWdtZW50Om51bGwsU1ZHRWxlbWVudDpudWxsLFNWR1NWR0VsZW1lbnQ6bnVsbCxTVkdFbGVtZW50SW5zdGFuY2U6bnVsbCxFbGVtZW50Om51bGwsSFRNTEVsZW1lbnQ6bnVsbCxFdmVudDpudWxsLFRvdWNoOm51bGwsUG9pbnRlckV2ZW50Om51bGx9O2Z1bmN0aW9uIHkoKXt9dmFyIG09ZztoLmRlZmF1bHQ9bTt2YXIgYj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoYixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxiLmRlZmF1bHQ9dm9pZCAwO3ZhciB4PXtpbml0OmZ1bmN0aW9uKHQpe3ZhciBlPWguZGVmYXVsdC5FbGVtZW50LG49dC5uYXZpZ2F0b3J8fHt9O3guc3VwcG9ydHNUb3VjaD1cIm9udG91Y2hzdGFydFwiaW4gdHx8aS5kZWZhdWx0LmZ1bmModC5Eb2N1bWVudFRvdWNoKSYmaC5kZWZhdWx0LmRvY3VtZW50IGluc3RhbmNlb2YgdC5Eb2N1bWVudFRvdWNoLHguc3VwcG9ydHNQb2ludGVyRXZlbnQ9ITEhPT1uLnBvaW50ZXJFbmFibGVkJiYhIWguZGVmYXVsdC5Qb2ludGVyRXZlbnQseC5pc0lPUz0vaVAoaG9uZXxvZHxhZCkvLnRlc3Qobi5wbGF0Zm9ybSkseC5pc0lPUzc9L2lQKGhvbmV8b2R8YWQpLy50ZXN0KG4ucGxhdGZvcm0pJiYvT1MgN1teXFxkXS8udGVzdChuLmFwcFZlcnNpb24pLHguaXNJZTk9L01TSUUgOS8udGVzdChuLnVzZXJBZ2VudCkseC5pc09wZXJhTW9iaWxlPVwiT3BlcmFcIj09PW4uYXBwTmFtZSYmeC5zdXBwb3J0c1RvdWNoJiYvUHJlc3RvLy50ZXN0KG4udXNlckFnZW50KSx4LnByZWZpeGVkTWF0Y2hlc1NlbGVjdG9yPVwibWF0Y2hlc1wiaW4gZS5wcm90b3R5cGU/XCJtYXRjaGVzXCI6XCJ3ZWJraXRNYXRjaGVzU2VsZWN0b3JcImluIGUucHJvdG90eXBlP1wid2Via2l0TWF0Y2hlc1NlbGVjdG9yXCI6XCJtb3pNYXRjaGVzU2VsZWN0b3JcImluIGUucHJvdG90eXBlP1wibW96TWF0Y2hlc1NlbGVjdG9yXCI6XCJvTWF0Y2hlc1NlbGVjdG9yXCJpbiBlLnByb3RvdHlwZT9cIm9NYXRjaGVzU2VsZWN0b3JcIjpcIm1zTWF0Y2hlc1NlbGVjdG9yXCIseC5wRXZlbnRUeXBlcz14LnN1cHBvcnRzUG9pbnRlckV2ZW50P2guZGVmYXVsdC5Qb2ludGVyRXZlbnQ9PT10Lk1TUG9pbnRlckV2ZW50P3t1cDpcIk1TUG9pbnRlclVwXCIsZG93bjpcIk1TUG9pbnRlckRvd25cIixvdmVyOlwibW91c2VvdmVyXCIsb3V0OlwibW91c2VvdXRcIixtb3ZlOlwiTVNQb2ludGVyTW92ZVwiLGNhbmNlbDpcIk1TUG9pbnRlckNhbmNlbFwifTp7dXA6XCJwb2ludGVydXBcIixkb3duOlwicG9pbnRlcmRvd25cIixvdmVyOlwicG9pbnRlcm92ZXJcIixvdXQ6XCJwb2ludGVyb3V0XCIsbW92ZTpcInBvaW50ZXJtb3ZlXCIsY2FuY2VsOlwicG9pbnRlcmNhbmNlbFwifTpudWxsLHgud2hlZWxFdmVudD1oLmRlZmF1bHQuZG9jdW1lbnQmJlwib25tb3VzZXdoZWVsXCJpbiBoLmRlZmF1bHQuZG9jdW1lbnQ/XCJtb3VzZXdoZWVsXCI6XCJ3aGVlbFwifSxzdXBwb3J0c1RvdWNoOm51bGwsc3VwcG9ydHNQb2ludGVyRXZlbnQ6bnVsbCxpc0lPUzc6bnVsbCxpc0lPUzpudWxsLGlzSWU5Om51bGwsaXNPcGVyYU1vYmlsZTpudWxsLHByZWZpeGVkTWF0Y2hlc1NlbGVjdG9yOm51bGwscEV2ZW50VHlwZXM6bnVsbCx3aGVlbEV2ZW50Om51bGx9LHc9eDtiLmRlZmF1bHQ9dzt2YXIgXz17fTtmdW5jdGlvbiBQKHQpe3ZhciBlPXQucGFyZW50Tm9kZTtpZihpLmRlZmF1bHQuZG9jRnJhZyhlKSl7Zm9yKDsoZT1lLmhvc3QpJiZpLmRlZmF1bHQuZG9jRnJhZyhlKTspO3JldHVybiBlfXJldHVybiBlfWZ1bmN0aW9uIE8odCxuKXtyZXR1cm4gZS53aW5kb3chPT1lLnJlYWxXaW5kb3cmJihuPW4ucmVwbGFjZSgvXFwvZGVlcFxcLy9nLFwiIFwiKSksdFtiLmRlZmF1bHQucHJlZml4ZWRNYXRjaGVzU2VsZWN0b3JdKG4pfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShfLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLF8ubm9kZUNvbnRhaW5zPWZ1bmN0aW9uKHQsZSl7aWYodC5jb250YWlucylyZXR1cm4gdC5jb250YWlucyhlKTtmb3IoO2U7KXtpZihlPT09dClyZXR1cm4hMDtlPWUucGFyZW50Tm9kZX1yZXR1cm4hMX0sXy5jbG9zZXN0PWZ1bmN0aW9uKHQsZSl7Zm9yKDtpLmRlZmF1bHQuZWxlbWVudCh0KTspe2lmKE8odCxlKSlyZXR1cm4gdDt0PVAodCl9cmV0dXJuIG51bGx9LF8ucGFyZW50Tm9kZT1QLF8ubWF0Y2hlc1NlbGVjdG9yPU8sXy5pbmRleE9mRGVlcGVzdEVsZW1lbnQ9ZnVuY3Rpb24odCl7Zm9yKHZhciBuLHI9W10sbz0wO288dC5sZW5ndGg7bysrKXt2YXIgaT10W29dLGE9dFtuXTtpZihpJiZvIT09bilpZihhKXt2YXIgcz1TKGkpLGw9UyhhKTtpZihzIT09aS5vd25lckRvY3VtZW50KWlmKGwhPT1pLm93bmVyRG9jdW1lbnQpaWYocyE9PWwpe3I9ci5sZW5ndGg/cjpFKGEpO3ZhciB1PXZvaWQgMDtpZihhIGluc3RhbmNlb2YgaC5kZWZhdWx0LkhUTUxFbGVtZW50JiZpIGluc3RhbmNlb2YgaC5kZWZhdWx0LlNWR0VsZW1lbnQmJiEoaSBpbnN0YW5jZW9mIGguZGVmYXVsdC5TVkdTVkdFbGVtZW50KSl7aWYoaT09PWwpY29udGludWU7dT1pLm93bmVyU1ZHRWxlbWVudH1lbHNlIHU9aTtmb3IodmFyIGM9RSh1LGEub3duZXJEb2N1bWVudCksZj0wO2NbZl0mJmNbZl09PT1yW2ZdOylmKys7dmFyIGQ9W2NbZi0xXSxjW2ZdLHJbZl1dO2lmKGRbMF0pZm9yKHZhciBwPWRbMF0ubGFzdENoaWxkO3A7KXtpZihwPT09ZFsxXSl7bj1vLHI9YzticmVha31pZihwPT09ZFsyXSlicmVhaztwPXAucHJldmlvdXNTaWJsaW5nfX1lbHNlIHY9aSxnPWEsdm9pZCAwLHZvaWQgMCwocGFyc2VJbnQoZS5nZXRXaW5kb3codikuZ2V0Q29tcHV0ZWRTdHlsZSh2KS56SW5kZXgsMTApfHwwKT49KHBhcnNlSW50KGUuZ2V0V2luZG93KGcpLmdldENvbXB1dGVkU3R5bGUoZykuekluZGV4LDEwKXx8MCkmJihuPW8pO2Vsc2Ugbj1vfWVsc2Ugbj1vfXZhciB2LGc7cmV0dXJuIG59LF8ubWF0Y2hlc1VwVG89ZnVuY3Rpb24odCxlLG4pe2Zvcig7aS5kZWZhdWx0LmVsZW1lbnQodCk7KXtpZihPKHQsZSkpcmV0dXJuITA7aWYoKHQ9UCh0KSk9PT1uKXJldHVybiBPKHQsZSl9cmV0dXJuITF9LF8uZ2V0QWN0dWFsRWxlbWVudD1mdW5jdGlvbih0KXtyZXR1cm4gdC5jb3JyZXNwb25kaW5nVXNlRWxlbWVudHx8dH0sXy5nZXRTY3JvbGxYWT1ULF8uZ2V0RWxlbWVudENsaWVudFJlY3Q9TSxfLmdldEVsZW1lbnRSZWN0PWZ1bmN0aW9uKHQpe3ZhciBuPU0odCk7aWYoIWIuZGVmYXVsdC5pc0lPUzcmJm4pe3ZhciByPVQoZS5nZXRXaW5kb3codCkpO24ubGVmdCs9ci54LG4ucmlnaHQrPXIueCxuLnRvcCs9ci55LG4uYm90dG9tKz1yLnl9cmV0dXJuIG59LF8uZ2V0UGF0aD1mdW5jdGlvbih0KXtmb3IodmFyIGU9W107dDspZS5wdXNoKHQpLHQ9UCh0KTtyZXR1cm4gZX0sXy50cnlTZWxlY3Rvcj1mdW5jdGlvbih0KXtyZXR1cm4hIWkuZGVmYXVsdC5zdHJpbmcodCkmJihoLmRlZmF1bHQuZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0KSwhMCl9O3ZhciBTPWZ1bmN0aW9uKHQpe3JldHVybiB0LnBhcmVudE5vZGV8fHQuaG9zdH07ZnVuY3Rpb24gRSh0LGUpe2Zvcih2YXIgbixyPVtdLG89dDsobj1TKG8pKSYmbyE9PWUmJm4hPT1vLm93bmVyRG9jdW1lbnQ7KXIudW5zaGlmdChvKSxvPW47cmV0dXJuIHJ9ZnVuY3Rpb24gVCh0KXtyZXR1cm57eDoodD10fHxlLndpbmRvdykuc2Nyb2xsWHx8dC5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCx5OnQuc2Nyb2xsWXx8dC5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wfX1mdW5jdGlvbiBNKHQpe3ZhciBlPXQgaW5zdGFuY2VvZiBoLmRlZmF1bHQuU1ZHRWxlbWVudD90LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOnQuZ2V0Q2xpZW50UmVjdHMoKVswXTtyZXR1cm4gZSYme2xlZnQ6ZS5sZWZ0LHJpZ2h0OmUucmlnaHQsdG9wOmUudG9wLGJvdHRvbTplLmJvdHRvbSx3aWR0aDplLndpZHRofHxlLnJpZ2h0LWUubGVmdCxoZWlnaHQ6ZS5oZWlnaHR8fGUuYm90dG9tLWUudG9wfX12YXIgaj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoaixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxqLmRlZmF1bHQ9ZnVuY3Rpb24odCxlKXtmb3IodmFyIG4gaW4gZSl0W25dPWVbbl07cmV0dXJuIHR9O3ZhciBrPXt9O2Z1bmN0aW9uIEkodCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfWZ1bmN0aW9uIEQodCxlLG4pe3JldHVyblwicGFyZW50XCI9PT10PygwLF8ucGFyZW50Tm9kZSkobik6XCJzZWxmXCI9PT10P2UuZ2V0UmVjdChuKTooMCxfLmNsb3Nlc3QpKG4sdCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KGssXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksay5nZXRTdHJpbmdPcHRpb25SZXN1bHQ9RCxrLnJlc29sdmVSZWN0TGlrZT1mdW5jdGlvbih0LGUsbixyKXt2YXIgbyxhPXQ7cmV0dXJuIGkuZGVmYXVsdC5zdHJpbmcoYSk/YT1EKGEsZSxuKTppLmRlZmF1bHQuZnVuYyhhKSYmKGE9YS5hcHBseSh2b2lkIDAsZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gSSh0KX0obz1yKXx8ZnVuY3Rpb24odCl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSlyZXR1cm4gQXJyYXkuZnJvbSh0KX0obyl8fGZ1bmN0aW9uKHQsZSl7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIEkodCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP0kodCxlKTp2b2lkIDB9fShvKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX0oKSkpLGkuZGVmYXVsdC5lbGVtZW50KGEpJiYoYT0oMCxfLmdldEVsZW1lbnRSZWN0KShhKSksYX0say5yZWN0VG9YWT1mdW5jdGlvbih0KXtyZXR1cm4gdCYme3g6XCJ4XCJpbiB0P3QueDp0LmxlZnQseTpcInlcImluIHQ/dC55OnQudG9wfX0say54eXdoVG9UbGJyPWZ1bmN0aW9uKHQpe3JldHVybiF0fHxcImxlZnRcImluIHQmJlwidG9wXCJpbiB0fHwoKHQ9KDAsai5kZWZhdWx0KSh7fSx0KSkubGVmdD10Lnh8fDAsdC50b3A9dC55fHwwLHQucmlnaHQ9dC5yaWdodHx8dC5sZWZ0K3Qud2lkdGgsdC5ib3R0b209dC5ib3R0b218fHQudG9wK3QuaGVpZ2h0KSx0fSxrLnRsYnJUb1h5d2g9ZnVuY3Rpb24odCl7cmV0dXJuIXR8fFwieFwiaW4gdCYmXCJ5XCJpbiB0fHwoKHQ9KDAsai5kZWZhdWx0KSh7fSx0KSkueD10LmxlZnR8fDAsdC55PXQudG9wfHwwLHQud2lkdGg9dC53aWR0aHx8KHQucmlnaHR8fDApLXQueCx0LmhlaWdodD10LmhlaWdodHx8KHQuYm90dG9tfHwwKS10LnkpLHR9LGsuYWRkRWRnZXM9ZnVuY3Rpb24odCxlLG4pe3QubGVmdCYmKGUubGVmdCs9bi54KSx0LnJpZ2h0JiYoZS5yaWdodCs9bi54KSx0LnRvcCYmKGUudG9wKz1uLnkpLHQuYm90dG9tJiYoZS5ib3R0b20rPW4ueSksZS53aWR0aD1lLnJpZ2h0LWUubGVmdCxlLmhlaWdodD1lLmJvdHRvbS1lLnRvcH07dmFyIEE9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEEsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQS5kZWZhdWx0PWZ1bmN0aW9uKHQsZSxuKXt2YXIgcj10Lm9wdGlvbnNbbl0sbz1yJiZyLm9yaWdpbnx8dC5vcHRpb25zLm9yaWdpbixpPSgwLGsucmVzb2x2ZVJlY3RMaWtlKShvLHQsZSxbdCYmZV0pO3JldHVybigwLGsucmVjdFRvWFkpKGkpfHx7eDowLHk6MH19O3ZhciBSPXt9O2Z1bmN0aW9uIHoodCl7cmV0dXJuIHQudHJpbSgpLnNwbGl0KC8gKy8pfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShSLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFIuZGVmYXVsdD1mdW5jdGlvbiB0KGUsbixyKXtpZihyPXJ8fHt9LGkuZGVmYXVsdC5zdHJpbmcoZSkmJi0xIT09ZS5zZWFyY2goXCIgXCIpJiYoZT16KGUpKSxpLmRlZmF1bHQuYXJyYXkoZSkpcmV0dXJuIGUucmVkdWNlKChmdW5jdGlvbihlLG8pe3JldHVybigwLGouZGVmYXVsdCkoZSx0KG8sbixyKSl9KSxyKTtpZihpLmRlZmF1bHQub2JqZWN0KGUpJiYobj1lLGU9XCJcIiksaS5kZWZhdWx0LmZ1bmMobikpcltlXT1yW2VdfHxbXSxyW2VdLnB1c2gobik7ZWxzZSBpZihpLmRlZmF1bHQuYXJyYXkobikpZm9yKHZhciBvPTA7bzxuLmxlbmd0aDtvKyspe3ZhciBhO2E9bltvXSx0KGUsYSxyKX1lbHNlIGlmKGkuZGVmYXVsdC5vYmplY3QobikpZm9yKHZhciBzIGluIG4pe3ZhciBsPXoocykubWFwKChmdW5jdGlvbih0KXtyZXR1cm5cIlwiLmNvbmNhdChlKS5jb25jYXQodCl9KSk7dChsLG5bc10scil9cmV0dXJuIHJ9O3ZhciBDPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShDLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEMuZGVmYXVsdD12b2lkIDAsQy5kZWZhdWx0PWZ1bmN0aW9uKHQsZSl7cmV0dXJuIE1hdGguc3FydCh0KnQrZSplKX07dmFyIEY9e307ZnVuY3Rpb24gWCh0LGUpe2Zvcih2YXIgbiBpbiBlKXt2YXIgcj1YLnByZWZpeGVkUHJvcFJFcyxvPSExO2Zvcih2YXIgaSBpbiByKWlmKDA9PT1uLmluZGV4T2YoaSkmJnJbaV0udGVzdChuKSl7bz0hMDticmVha31vfHxcImZ1bmN0aW9uXCI9PXR5cGVvZiBlW25dfHwodFtuXT1lW25dKX1yZXR1cm4gdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoRixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxGLmRlZmF1bHQ9dm9pZCAwLFgucHJlZml4ZWRQcm9wUkVzPXt3ZWJraXQ6LyhNb3ZlbWVudFtYWV18UmFkaXVzW1hZXXxSb3RhdGlvbkFuZ2xlfEZvcmNlKSQvLG1vejovKFByZXNzdXJlKSQvfTt2YXIgWT1YO0YuZGVmYXVsdD1ZO3ZhciBCPXt9O2Z1bmN0aW9uIFcodCl7cmV0dXJuIHQgaW5zdGFuY2VvZiBoLmRlZmF1bHQuRXZlbnR8fHQgaW5zdGFuY2VvZiBoLmRlZmF1bHQuVG91Y2h9ZnVuY3Rpb24gTCh0LGUsbil7cmV0dXJuIHQ9dHx8XCJwYWdlXCIsKG49bnx8e30pLng9ZVt0K1wiWFwiXSxuLnk9ZVt0K1wiWVwiXSxufWZ1bmN0aW9uIFUodCxlKXtyZXR1cm4gZT1lfHx7eDowLHk6MH0sYi5kZWZhdWx0LmlzT3BlcmFNb2JpbGUmJlcodCk/KEwoXCJzY3JlZW5cIix0LGUpLGUueCs9d2luZG93LnNjcm9sbFgsZS55Kz13aW5kb3cuc2Nyb2xsWSk6TChcInBhZ2VcIix0LGUpLGV9ZnVuY3Rpb24gVih0LGUpe3JldHVybiBlPWV8fHt9LGIuZGVmYXVsdC5pc09wZXJhTW9iaWxlJiZXKHQpP0woXCJzY3JlZW5cIix0LGUpOkwoXCJjbGllbnRcIix0LGUpLGV9ZnVuY3Rpb24gTih0KXt2YXIgZT1bXTtyZXR1cm4gaS5kZWZhdWx0LmFycmF5KHQpPyhlWzBdPXRbMF0sZVsxXT10WzFdKTpcInRvdWNoZW5kXCI9PT10LnR5cGU/MT09PXQudG91Y2hlcy5sZW5ndGg/KGVbMF09dC50b3VjaGVzWzBdLGVbMV09dC5jaGFuZ2VkVG91Y2hlc1swXSk6MD09PXQudG91Y2hlcy5sZW5ndGgmJihlWzBdPXQuY2hhbmdlZFRvdWNoZXNbMF0sZVsxXT10LmNoYW5nZWRUb3VjaGVzWzFdKTooZVswXT10LnRvdWNoZXNbMF0sZVsxXT10LnRvdWNoZXNbMV0pLGV9ZnVuY3Rpb24gcSh0KXtmb3IodmFyIGU9e3BhZ2VYOjAscGFnZVk6MCxjbGllbnRYOjAsY2xpZW50WTowLHNjcmVlblg6MCxzY3JlZW5ZOjB9LG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtmb3IodmFyIG8gaW4gZSllW29dKz1yW29dfWZvcih2YXIgaSBpbiBlKWVbaV0vPXQubGVuZ3RoO3JldHVybiBlfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShCLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEIuY29weUNvb3Jkcz1mdW5jdGlvbih0LGUpe3QucGFnZT10LnBhZ2V8fHt9LHQucGFnZS54PWUucGFnZS54LHQucGFnZS55PWUucGFnZS55LHQuY2xpZW50PXQuY2xpZW50fHx7fSx0LmNsaWVudC54PWUuY2xpZW50LngsdC5jbGllbnQueT1lLmNsaWVudC55LHQudGltZVN0YW1wPWUudGltZVN0YW1wfSxCLnNldENvb3JkRGVsdGFzPWZ1bmN0aW9uKHQsZSxuKXt0LnBhZ2UueD1uLnBhZ2UueC1lLnBhZ2UueCx0LnBhZ2UueT1uLnBhZ2UueS1lLnBhZ2UueSx0LmNsaWVudC54PW4uY2xpZW50LngtZS5jbGllbnQueCx0LmNsaWVudC55PW4uY2xpZW50LnktZS5jbGllbnQueSx0LnRpbWVTdGFtcD1uLnRpbWVTdGFtcC1lLnRpbWVTdGFtcH0sQi5zZXRDb29yZFZlbG9jaXR5PWZ1bmN0aW9uKHQsZSl7dmFyIG49TWF0aC5tYXgoZS50aW1lU3RhbXAvMWUzLC4wMDEpO3QucGFnZS54PWUucGFnZS54L24sdC5wYWdlLnk9ZS5wYWdlLnkvbix0LmNsaWVudC54PWUuY2xpZW50Lngvbix0LmNsaWVudC55PWUuY2xpZW50Lnkvbix0LnRpbWVTdGFtcD1ufSxCLnNldFplcm9Db29yZHM9ZnVuY3Rpb24odCl7dC5wYWdlLng9MCx0LnBhZ2UueT0wLHQuY2xpZW50Lng9MCx0LmNsaWVudC55PTB9LEIuaXNOYXRpdmVQb2ludGVyPVcsQi5nZXRYWT1MLEIuZ2V0UGFnZVhZPVUsQi5nZXRDbGllbnRYWT1WLEIuZ2V0UG9pbnRlcklkPWZ1bmN0aW9uKHQpe3JldHVybiBpLmRlZmF1bHQubnVtYmVyKHQucG9pbnRlcklkKT90LnBvaW50ZXJJZDp0LmlkZW50aWZpZXJ9LEIuc2V0Q29vcmRzPWZ1bmN0aW9uKHQsZSxuKXt2YXIgcj1lLmxlbmd0aD4xP3EoZSk6ZVswXTtVKHIsdC5wYWdlKSxWKHIsdC5jbGllbnQpLHQudGltZVN0YW1wPW59LEIuZ2V0VG91Y2hQYWlyPU4sQi5wb2ludGVyQXZlcmFnZT1xLEIudG91Y2hCQm94PWZ1bmN0aW9uKHQpe2lmKCF0Lmxlbmd0aClyZXR1cm4gbnVsbDt2YXIgZT1OKHQpLG49TWF0aC5taW4oZVswXS5wYWdlWCxlWzFdLnBhZ2VYKSxyPU1hdGgubWluKGVbMF0ucGFnZVksZVsxXS5wYWdlWSksbz1NYXRoLm1heChlWzBdLnBhZ2VYLGVbMV0ucGFnZVgpLGk9TWF0aC5tYXgoZVswXS5wYWdlWSxlWzFdLnBhZ2VZKTtyZXR1cm57eDpuLHk6cixsZWZ0Om4sdG9wOnIscmlnaHQ6byxib3R0b206aSx3aWR0aDpvLW4saGVpZ2h0Omktcn19LEIudG91Y2hEaXN0YW5jZT1mdW5jdGlvbih0LGUpe3ZhciBuPWUrXCJYXCIscj1lK1wiWVwiLG89Tih0KSxpPW9bMF1bbl0tb1sxXVtuXSxhPW9bMF1bcl0tb1sxXVtyXTtyZXR1cm4oMCxDLmRlZmF1bHQpKGksYSl9LEIudG91Y2hBbmdsZT1mdW5jdGlvbih0LGUpe3ZhciBuPWUrXCJYXCIscj1lK1wiWVwiLG89Tih0KSxpPW9bMV1bbl0tb1swXVtuXSxhPW9bMV1bcl0tb1swXVtyXTtyZXR1cm4gMTgwKk1hdGguYXRhbjIoYSxpKS9NYXRoLlBJfSxCLmdldFBvaW50ZXJUeXBlPWZ1bmN0aW9uKHQpe3JldHVybiBpLmRlZmF1bHQuc3RyaW5nKHQucG9pbnRlclR5cGUpP3QucG9pbnRlclR5cGU6aS5kZWZhdWx0Lm51bWJlcih0LnBvaW50ZXJUeXBlKT9bdm9pZCAwLHZvaWQgMCxcInRvdWNoXCIsXCJwZW5cIixcIm1vdXNlXCJdW3QucG9pbnRlclR5cGVdOi90b3VjaC8udGVzdCh0LnR5cGV8fFwiXCIpfHx0IGluc3RhbmNlb2YgaC5kZWZhdWx0LlRvdWNoP1widG91Y2hcIjpcIm1vdXNlXCJ9LEIuZ2V0RXZlbnRUYXJnZXRzPWZ1bmN0aW9uKHQpe3ZhciBlPWkuZGVmYXVsdC5mdW5jKHQuY29tcG9zZWRQYXRoKT90LmNvbXBvc2VkUGF0aCgpOnQucGF0aDtyZXR1cm5bXy5nZXRBY3R1YWxFbGVtZW50KGU/ZVswXTp0LnRhcmdldCksXy5nZXRBY3R1YWxFbGVtZW50KHQuY3VycmVudFRhcmdldCldfSxCLm5ld0Nvb3Jkcz1mdW5jdGlvbigpe3JldHVybntwYWdlOnt4OjAseTowfSxjbGllbnQ6e3g6MCx5OjB9LHRpbWVTdGFtcDowfX0sQi5jb29yZHNUb0V2ZW50PWZ1bmN0aW9uKHQpe3JldHVybntjb29yZHM6dCxnZXQgcGFnZSgpe3JldHVybiB0aGlzLmNvb3Jkcy5wYWdlfSxnZXQgY2xpZW50KCl7cmV0dXJuIHRoaXMuY29vcmRzLmNsaWVudH0sZ2V0IHRpbWVTdGFtcCgpe3JldHVybiB0aGlzLmNvb3Jkcy50aW1lU3RhbXB9LGdldCBwYWdlWCgpe3JldHVybiB0aGlzLmNvb3Jkcy5wYWdlLnh9LGdldCBwYWdlWSgpe3JldHVybiB0aGlzLmNvb3Jkcy5wYWdlLnl9LGdldCBjbGllbnRYKCl7cmV0dXJuIHRoaXMuY29vcmRzLmNsaWVudC54fSxnZXQgY2xpZW50WSgpe3JldHVybiB0aGlzLmNvb3Jkcy5jbGllbnQueX0sZ2V0IHBvaW50ZXJJZCgpe3JldHVybiB0aGlzLmNvb3Jkcy5wb2ludGVySWR9LGdldCB0YXJnZXQoKXtyZXR1cm4gdGhpcy5jb29yZHMudGFyZ2V0fSxnZXQgdHlwZSgpe3JldHVybiB0aGlzLmNvb3Jkcy50eXBlfSxnZXQgcG9pbnRlclR5cGUoKXtyZXR1cm4gdGhpcy5jb29yZHMucG9pbnRlclR5cGV9LGdldCBidXR0b25zKCl7cmV0dXJuIHRoaXMuY29vcmRzLmJ1dHRvbnN9LHByZXZlbnREZWZhdWx0OmZ1bmN0aW9uKCl7fX19LE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCLFwicG9pbnRlckV4dGVuZFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBGLmRlZmF1bHR9fSk7dmFyICQ9e307ZnVuY3Rpb24gRyh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gSCh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KCQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksJC5CYXNlRXZlbnQ9dm9pZCAwO3ZhciBLPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLEgodGhpcyxcInR5cGVcIix2b2lkIDApLEgodGhpcyxcInRhcmdldFwiLHZvaWQgMCksSCh0aGlzLFwiY3VycmVudFRhcmdldFwiLHZvaWQgMCksSCh0aGlzLFwiaW50ZXJhY3RhYmxlXCIsdm9pZCAwKSxIKHRoaXMsXCJfaW50ZXJhY3Rpb25cIix2b2lkIDApLEgodGhpcyxcInRpbWVTdGFtcFwiLHZvaWQgMCksSCh0aGlzLFwiaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkXCIsITEpLEgodGhpcyxcInByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKSx0aGlzLl9pbnRlcmFjdGlvbj1lfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcInByZXZlbnREZWZhdWx0XCIsdmFsdWU6ZnVuY3Rpb24oKXt9fSx7a2V5Olwic3RvcFByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19LHtrZXk6XCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkPXRoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX1dKSYmRyhlLnByb3RvdHlwZSxuKSx0fSgpOyQuQmFzZUV2ZW50PUssT2JqZWN0LmRlZmluZVByb3BlcnR5KEsucHJvdG90eXBlLFwiaW50ZXJhY3Rpb25cIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2ludGVyYWN0aW9uLl9wcm94eX0sc2V0OmZ1bmN0aW9uKCl7fX0pO3ZhciBaPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShaLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFouZmluZD1aLmZpbmRJbmRleD1aLmZyb209Wi5tZXJnZT1aLnJlbW92ZT1aLmNvbnRhaW5zPXZvaWQgMCxaLmNvbnRhaW5zPWZ1bmN0aW9uKHQsZSl7cmV0dXJuLTEhPT10LmluZGV4T2YoZSl9LFoucmVtb3ZlPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuc3BsaWNlKHQuaW5kZXhPZihlKSwxKX07dmFyIEo9ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTt0LnB1c2gocil9cmV0dXJuIHR9O1oubWVyZ2U9SixaLmZyb209ZnVuY3Rpb24odCl7cmV0dXJuIEooW10sdCl9O3ZhciBRPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspaWYoZSh0W25dLG4sdCkpcmV0dXJuIG47cmV0dXJuLTF9O1ouZmluZEluZGV4PVEsWi5maW5kPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbUSh0LGUpXX07dmFyIHR0PXt9O2Z1bmN0aW9uIGV0KHQpe3JldHVybihldD1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9ZnVuY3Rpb24gbnQodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIHJ0KHQsZSl7cmV0dXJuKHJ0PU9iamVjdC5zZXRQcm90b3R5cGVPZnx8ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5fX3Byb3RvX189ZSx0fSkodCxlKX1mdW5jdGlvbiBvdCh0LGUpe3JldHVybiFlfHxcIm9iamVjdFwiIT09ZXQoZSkmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGU/aXQodCk6ZX1mdW5jdGlvbiBpdCh0KXtpZih2b2lkIDA9PT10KXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4gdH1mdW5jdGlvbiBhdCh0KXtyZXR1cm4oYXQ9T2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5nZXRQcm90b3R5cGVPZjpmdW5jdGlvbih0KXtyZXR1cm4gdC5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0KX0pKHQpfWZ1bmN0aW9uIHN0KHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkodHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdHQuRHJvcEV2ZW50PXZvaWQgMDt2YXIgbHQ9ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZSYmZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp0LHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSxlJiZydCh0LGUpfShhLHQpO3ZhciBlLG4scixvLGk9KHI9YSxvPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sKGZ1bmN0aW9uKCl7fSkpKSwhMH1jYXRjaCh0KXtyZXR1cm4hMX19KCksZnVuY3Rpb24oKXt2YXIgdCxlPWF0KHIpO2lmKG8pe3ZhciBuPWF0KHRoaXMpLmNvbnN0cnVjdG9yO3Q9UmVmbGVjdC5jb25zdHJ1Y3QoZSxhcmd1bWVudHMsbil9ZWxzZSB0PWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBvdCh0aGlzLHQpfSk7ZnVuY3Rpb24gYSh0LGUsbil7dmFyIHI7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyxhKSxzdChpdChyPWkuY2FsbCh0aGlzLGUuX2ludGVyYWN0aW9uKSksXCJ0YXJnZXRcIix2b2lkIDApLHN0KGl0KHIpLFwiZHJvcHpvbmVcIix2b2lkIDApLHN0KGl0KHIpLFwiZHJhZ0V2ZW50XCIsdm9pZCAwKSxzdChpdChyKSxcInJlbGF0ZWRUYXJnZXRcIix2b2lkIDApLHN0KGl0KHIpLFwiZHJhZ2dhYmxlXCIsdm9pZCAwKSxzdChpdChyKSxcInRpbWVTdGFtcFwiLHZvaWQgMCksc3QoaXQociksXCJwcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksc3QoaXQociksXCJpbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWRcIiwhMSk7dmFyIG89XCJkcmFnbGVhdmVcIj09PW4/dC5wcmV2OnQuY3VyLHM9by5lbGVtZW50LGw9by5kcm9wem9uZTtyZXR1cm4gci50eXBlPW4sci50YXJnZXQ9cyxyLmN1cnJlbnRUYXJnZXQ9cyxyLmRyb3B6b25lPWwsci5kcmFnRXZlbnQ9ZSxyLnJlbGF0ZWRUYXJnZXQ9ZS50YXJnZXQsci5kcmFnZ2FibGU9ZS5pbnRlcmFjdGFibGUsci50aW1lU3RhbXA9ZS50aW1lU3RhbXAscn1yZXR1cm4gZT1hLChuPVt7a2V5OlwicmVqZWN0XCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLGU9dGhpcy5faW50ZXJhY3Rpb24uZHJvcFN0YXRlO2lmKFwiZHJvcGFjdGl2YXRlXCI9PT10aGlzLnR5cGV8fHRoaXMuZHJvcHpvbmUmJmUuY3VyLmRyb3B6b25lPT09dGhpcy5kcm9wem9uZSYmZS5jdXIuZWxlbWVudD09PXRoaXMudGFyZ2V0KWlmKGUucHJldi5kcm9wem9uZT10aGlzLmRyb3B6b25lLGUucHJldi5lbGVtZW50PXRoaXMudGFyZ2V0LGUucmVqZWN0ZWQ9ITAsZS5ldmVudHMuZW50ZXI9bnVsbCx0aGlzLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpLFwiZHJvcGFjdGl2YXRlXCI9PT10aGlzLnR5cGUpe3ZhciBuPWUuYWN0aXZlRHJvcHMscj1aLmZpbmRJbmRleChuLChmdW5jdGlvbihlKXt2YXIgbj1lLmRyb3B6b25lLHI9ZS5lbGVtZW50O3JldHVybiBuPT09dC5kcm9wem9uZSYmcj09PXQudGFyZ2V0fSkpO2UuYWN0aXZlRHJvcHMuc3BsaWNlKHIsMSk7dmFyIG89bmV3IGEoZSx0aGlzLmRyYWdFdmVudCxcImRyb3BkZWFjdGl2YXRlXCIpO28uZHJvcHpvbmU9dGhpcy5kcm9wem9uZSxvLnRhcmdldD10aGlzLnRhcmdldCx0aGlzLmRyb3B6b25lLmZpcmUobyl9ZWxzZSB0aGlzLmRyb3B6b25lLmZpcmUobmV3IGEoZSx0aGlzLmRyYWdFdmVudCxcImRyYWdsZWF2ZVwiKSl9fSx7a2V5OlwicHJldmVudERlZmF1bHRcIix2YWx1ZTpmdW5jdGlvbigpe319LHtrZXk6XCJzdG9wUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX0se2tleTpcInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQ9dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fV0pJiZudChlLnByb3RvdHlwZSxuKSxhfSgkLkJhc2VFdmVudCk7dHQuRHJvcEV2ZW50PWx0O3ZhciB1dD17fTtmdW5jdGlvbiBjdCh0LGUpe2Zvcih2YXIgbj0wO248dC5zbGljZSgpLmxlbmd0aDtuKyspe3ZhciByPXQuc2xpY2UoKVtuXSxvPXIuZHJvcHpvbmUsaT1yLmVsZW1lbnQ7ZS5kcm9wem9uZT1vLGUudGFyZ2V0PWksby5maXJlKGUpLGUucHJvcGFnYXRpb25TdG9wcGVkPWUuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkPSExfX1mdW5jdGlvbiBmdCh0LGUpe2Zvcih2YXIgbj1mdW5jdGlvbih0LGUpe2Zvcih2YXIgbj10LmludGVyYWN0YWJsZXMscj1bXSxvPTA7bzxuLmxpc3QubGVuZ3RoO28rKyl7dmFyIGE9bi5saXN0W29dO2lmKGEub3B0aW9ucy5kcm9wLmVuYWJsZWQpe3ZhciBzPWEub3B0aW9ucy5kcm9wLmFjY2VwdDtpZighKGkuZGVmYXVsdC5lbGVtZW50KHMpJiZzIT09ZXx8aS5kZWZhdWx0LnN0cmluZyhzKSYmIV8ubWF0Y2hlc1NlbGVjdG9yKGUscyl8fGkuZGVmYXVsdC5mdW5jKHMpJiYhcyh7ZHJvcHpvbmU6YSxkcmFnZ2FibGVFbGVtZW50OmV9KSkpZm9yKHZhciBsPWkuZGVmYXVsdC5zdHJpbmcoYS50YXJnZXQpP2EuX2NvbnRleHQucXVlcnlTZWxlY3RvckFsbChhLnRhcmdldCk6aS5kZWZhdWx0LmFycmF5KGEudGFyZ2V0KT9hLnRhcmdldDpbYS50YXJnZXRdLHU9MDt1PGwubGVuZ3RoO3UrKyl7dmFyIGM9bFt1XTtjIT09ZSYmci5wdXNoKHtkcm9wem9uZTphLGVsZW1lbnQ6YyxyZWN0OmEuZ2V0UmVjdChjKX0pfX19cmV0dXJuIHJ9KHQsZSkscj0wO3I8bi5sZW5ndGg7cisrKXt2YXIgbz1uW3JdO28ucmVjdD1vLmRyb3B6b25lLmdldFJlY3Qoby5lbGVtZW50KX1yZXR1cm4gbn1mdW5jdGlvbiBkdCh0LGUsbil7Zm9yKHZhciByPXQuZHJvcFN0YXRlLG89dC5pbnRlcmFjdGFibGUsaT10LmVsZW1lbnQsYT1bXSxzPTA7czxyLmFjdGl2ZURyb3BzLmxlbmd0aDtzKyspe3ZhciBsPXIuYWN0aXZlRHJvcHNbc10sdT1sLmRyb3B6b25lLGM9bC5lbGVtZW50LGY9bC5yZWN0O2EucHVzaCh1LmRyb3BDaGVjayhlLG4sbyxpLGMsZik/YzpudWxsKX12YXIgZD1fLmluZGV4T2ZEZWVwZXN0RWxlbWVudChhKTtyZXR1cm4gci5hY3RpdmVEcm9wc1tkXXx8bnVsbH1mdW5jdGlvbiBwdCh0LGUsbil7dmFyIHI9dC5kcm9wU3RhdGUsbz17ZW50ZXI6bnVsbCxsZWF2ZTpudWxsLGFjdGl2YXRlOm51bGwsZGVhY3RpdmF0ZTpudWxsLG1vdmU6bnVsbCxkcm9wOm51bGx9O3JldHVyblwiZHJhZ3N0YXJ0XCI9PT1uLnR5cGUmJihvLmFjdGl2YXRlPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJvcGFjdGl2YXRlXCIpLG8uYWN0aXZhdGUudGFyZ2V0PW51bGwsby5hY3RpdmF0ZS5kcm9wem9uZT1udWxsKSxcImRyYWdlbmRcIj09PW4udHlwZSYmKG8uZGVhY3RpdmF0ZT1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyb3BkZWFjdGl2YXRlXCIpLG8uZGVhY3RpdmF0ZS50YXJnZXQ9bnVsbCxvLmRlYWN0aXZhdGUuZHJvcHpvbmU9bnVsbCksci5yZWplY3RlZHx8KHIuY3VyLmVsZW1lbnQhPT1yLnByZXYuZWxlbWVudCYmKHIucHJldi5kcm9wem9uZSYmKG8ubGVhdmU9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcmFnbGVhdmVcIiksbi5kcmFnTGVhdmU9by5sZWF2ZS50YXJnZXQ9ci5wcmV2LmVsZW1lbnQsbi5wcmV2RHJvcHpvbmU9by5sZWF2ZS5kcm9wem9uZT1yLnByZXYuZHJvcHpvbmUpLHIuY3VyLmRyb3B6b25lJiYoby5lbnRlcj1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyYWdlbnRlclwiKSxuLmRyYWdFbnRlcj1yLmN1ci5lbGVtZW50LG4uZHJvcHpvbmU9ci5jdXIuZHJvcHpvbmUpKSxcImRyYWdlbmRcIj09PW4udHlwZSYmci5jdXIuZHJvcHpvbmUmJihvLmRyb3A9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcm9wXCIpLG4uZHJvcHpvbmU9ci5jdXIuZHJvcHpvbmUsbi5yZWxhdGVkVGFyZ2V0PXIuY3VyLmVsZW1lbnQpLFwiZHJhZ21vdmVcIj09PW4udHlwZSYmci5jdXIuZHJvcHpvbmUmJihvLm1vdmU9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcm9wbW92ZVwiKSxvLm1vdmUuZHJhZ21vdmU9bixuLmRyb3B6b25lPXIuY3VyLmRyb3B6b25lKSksb31mdW5jdGlvbiB2dCh0LGUpe3ZhciBuPXQuZHJvcFN0YXRlLHI9bi5hY3RpdmVEcm9wcyxvPW4uY3VyLGk9bi5wcmV2O2UubGVhdmUmJmkuZHJvcHpvbmUuZmlyZShlLmxlYXZlKSxlLmVudGVyJiZvLmRyb3B6b25lLmZpcmUoZS5lbnRlciksZS5tb3ZlJiZvLmRyb3B6b25lLmZpcmUoZS5tb3ZlKSxlLmRyb3AmJm8uZHJvcHpvbmUuZmlyZShlLmRyb3ApLGUuZGVhY3RpdmF0ZSYmY3QocixlLmRlYWN0aXZhdGUpLG4ucHJldi5kcm9wem9uZT1vLmRyb3B6b25lLG4ucHJldi5lbGVtZW50PW8uZWxlbWVudH1mdW5jdGlvbiBodCh0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmlFdmVudCxvPXQuZXZlbnQ7aWYoXCJkcmFnbW92ZVwiPT09ci50eXBlfHxcImRyYWdlbmRcIj09PXIudHlwZSl7dmFyIGk9bi5kcm9wU3RhdGU7ZS5keW5hbWljRHJvcCYmKGkuYWN0aXZlRHJvcHM9ZnQoZSxuLmVsZW1lbnQpKTt2YXIgYT1yLHM9ZHQobixhLG8pO2kucmVqZWN0ZWQ9aS5yZWplY3RlZCYmISFzJiZzLmRyb3B6b25lPT09aS5jdXIuZHJvcHpvbmUmJnMuZWxlbWVudD09PWkuY3VyLmVsZW1lbnQsaS5jdXIuZHJvcHpvbmU9cyYmcy5kcm9wem9uZSxpLmN1ci5lbGVtZW50PXMmJnMuZWxlbWVudCxpLmV2ZW50cz1wdChuLDAsYSl9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1dCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx1dC5kZWZhdWx0PXZvaWQgMDt2YXIgZ3Q9e2lkOlwiYWN0aW9ucy9kcm9wXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmFjdGlvbnMsbj10LmludGVyYWN0U3RhdGljLHI9dC5JbnRlcmFjdGFibGUsbz10LmRlZmF1bHRzO3QudXNlUGx1Z2luKGMuZGVmYXVsdCksci5wcm90b3R5cGUuZHJvcHpvbmU9ZnVuY3Rpb24odCl7cmV0dXJuIGZ1bmN0aW9uKHQsZSl7aWYoaS5kZWZhdWx0Lm9iamVjdChlKSl7aWYodC5vcHRpb25zLmRyb3AuZW5hYmxlZD0hMSE9PWUuZW5hYmxlZCxlLmxpc3RlbmVycyl7dmFyIG49KDAsUi5kZWZhdWx0KShlLmxpc3RlbmVycykscj1PYmplY3Qua2V5cyhuKS5yZWR1Y2UoKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbL14oZW50ZXJ8bGVhdmUpLy50ZXN0KGUpP1wiZHJhZ1wiLmNvbmNhdChlKTovXihhY3RpdmF0ZXxkZWFjdGl2YXRlfG1vdmUpLy50ZXN0KGUpP1wiZHJvcFwiLmNvbmNhdChlKTplXT1uW2VdLHR9KSx7fSk7dC5vZmYodC5vcHRpb25zLmRyb3AubGlzdGVuZXJzKSx0Lm9uKHIpLHQub3B0aW9ucy5kcm9wLmxpc3RlbmVycz1yfXJldHVybiBpLmRlZmF1bHQuZnVuYyhlLm9uZHJvcCkmJnQub24oXCJkcm9wXCIsZS5vbmRyb3ApLGkuZGVmYXVsdC5mdW5jKGUub25kcm9wYWN0aXZhdGUpJiZ0Lm9uKFwiZHJvcGFjdGl2YXRlXCIsZS5vbmRyb3BhY3RpdmF0ZSksaS5kZWZhdWx0LmZ1bmMoZS5vbmRyb3BkZWFjdGl2YXRlKSYmdC5vbihcImRyb3BkZWFjdGl2YXRlXCIsZS5vbmRyb3BkZWFjdGl2YXRlKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJhZ2VudGVyKSYmdC5vbihcImRyYWdlbnRlclwiLGUub25kcmFnZW50ZXIpLGkuZGVmYXVsdC5mdW5jKGUub25kcmFnbGVhdmUpJiZ0Lm9uKFwiZHJhZ2xlYXZlXCIsZS5vbmRyYWdsZWF2ZSksaS5kZWZhdWx0LmZ1bmMoZS5vbmRyb3Btb3ZlKSYmdC5vbihcImRyb3Btb3ZlXCIsZS5vbmRyb3Btb3ZlKSwvXihwb2ludGVyfGNlbnRlcikkLy50ZXN0KGUub3ZlcmxhcCk/dC5vcHRpb25zLmRyb3Aub3ZlcmxhcD1lLm92ZXJsYXA6aS5kZWZhdWx0Lm51bWJlcihlLm92ZXJsYXApJiYodC5vcHRpb25zLmRyb3Aub3ZlcmxhcD1NYXRoLm1heChNYXRoLm1pbigxLGUub3ZlcmxhcCksMCkpLFwiYWNjZXB0XCJpbiBlJiYodC5vcHRpb25zLmRyb3AuYWNjZXB0PWUuYWNjZXB0KSxcImNoZWNrZXJcImluIGUmJih0Lm9wdGlvbnMuZHJvcC5jaGVja2VyPWUuY2hlY2tlciksdH1yZXR1cm4gaS5kZWZhdWx0LmJvb2woZSk/KHQub3B0aW9ucy5kcm9wLmVuYWJsZWQ9ZSx0KTp0Lm9wdGlvbnMuZHJvcH0odGhpcyx0KX0sci5wcm90b3R5cGUuZHJvcENoZWNrPWZ1bmN0aW9uKHQsZSxuLHIsbyxhKXtyZXR1cm4gZnVuY3Rpb24odCxlLG4scixvLGEscyl7dmFyIGw9ITE7aWYoIShzPXN8fHQuZ2V0UmVjdChhKSkpcmV0dXJuISF0Lm9wdGlvbnMuZHJvcC5jaGVja2VyJiZ0Lm9wdGlvbnMuZHJvcC5jaGVja2VyKGUsbixsLHQsYSxyLG8pO3ZhciB1PXQub3B0aW9ucy5kcm9wLm92ZXJsYXA7aWYoXCJwb2ludGVyXCI9PT11KXt2YXIgYz0oMCxBLmRlZmF1bHQpKHIsbyxcImRyYWdcIiksZj1CLmdldFBhZ2VYWShlKTtmLngrPWMueCxmLnkrPWMueTt2YXIgZD1mLng+cy5sZWZ0JiZmLng8cy5yaWdodCxwPWYueT5zLnRvcCYmZi55PHMuYm90dG9tO2w9ZCYmcH12YXIgdj1yLmdldFJlY3Qobyk7aWYodiYmXCJjZW50ZXJcIj09PXUpe3ZhciBoPXYubGVmdCt2LndpZHRoLzIsZz12LnRvcCt2LmhlaWdodC8yO2w9aD49cy5sZWZ0JiZoPD1zLnJpZ2h0JiZnPj1zLnRvcCYmZzw9cy5ib3R0b219cmV0dXJuIHYmJmkuZGVmYXVsdC5udW1iZXIodSkmJihsPU1hdGgubWF4KDAsTWF0aC5taW4ocy5yaWdodCx2LnJpZ2h0KS1NYXRoLm1heChzLmxlZnQsdi5sZWZ0KSkqTWF0aC5tYXgoMCxNYXRoLm1pbihzLmJvdHRvbSx2LmJvdHRvbSktTWF0aC5tYXgocy50b3Asdi50b3ApKS8odi53aWR0aCp2LmhlaWdodCk+PXUpLHQub3B0aW9ucy5kcm9wLmNoZWNrZXImJihsPXQub3B0aW9ucy5kcm9wLmNoZWNrZXIoZSxuLGwsdCxhLHIsbykpLGx9KHRoaXMsdCxlLG4scixvLGEpfSxuLmR5bmFtaWNEcm9wPWZ1bmN0aW9uKGUpe3JldHVybiBpLmRlZmF1bHQuYm9vbChlKT8odC5keW5hbWljRHJvcD1lLG4pOnQuZHluYW1pY0Ryb3B9LCgwLGouZGVmYXVsdCkoZS5waGFzZWxlc3NUeXBlcyx7ZHJhZ2VudGVyOiEwLGRyYWdsZWF2ZTohMCxkcm9wYWN0aXZhdGU6ITAsZHJvcGRlYWN0aXZhdGU6ITAsZHJvcG1vdmU6ITAsZHJvcDohMH0pLGUubWV0aG9kRGljdC5kcm9wPVwiZHJvcHpvbmVcIix0LmR5bmFtaWNEcm9wPSExLG8uYWN0aW9ucy5kcm9wPWd0LmRlZmF1bHRzfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO1wiZHJhZ1wiPT09ZS5wcmVwYXJlZC5uYW1lJiYoZS5kcm9wU3RhdGU9e2N1cjp7ZHJvcHpvbmU6bnVsbCxlbGVtZW50Om51bGx9LHByZXY6e2Ryb3B6b25lOm51bGwsZWxlbWVudDpudWxsfSxyZWplY3RlZDpudWxsLGV2ZW50czpudWxsLGFjdGl2ZURyb3BzOltdfSl9LFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1zdGFydFwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPSh0LmV2ZW50LHQuaUV2ZW50KTtpZihcImRyYWdcIj09PW4ucHJlcGFyZWQubmFtZSl7dmFyIG89bi5kcm9wU3RhdGU7by5hY3RpdmVEcm9wcz1udWxsLG8uZXZlbnRzPW51bGwsby5hY3RpdmVEcm9wcz1mdChlLG4uZWxlbWVudCksby5ldmVudHM9cHQobiwwLHIpLG8uZXZlbnRzLmFjdGl2YXRlJiYoY3Qoby5hY3RpdmVEcm9wcyxvLmV2ZW50cy5hY3RpdmF0ZSksZS5maXJlKFwiYWN0aW9ucy9kcm9wOnN0YXJ0XCIse2ludGVyYWN0aW9uOm4sZHJhZ0V2ZW50OnJ9KSl9fSxcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOmh0LFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1tb3ZlXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5pRXZlbnQ7XCJkcmFnXCI9PT1uLnByZXBhcmVkLm5hbWUmJih2dChuLG4uZHJvcFN0YXRlLmV2ZW50cyksZS5maXJlKFwiYWN0aW9ucy9kcm9wOm1vdmVcIix7aW50ZXJhY3Rpb246bixkcmFnRXZlbnQ6cn0pLG4uZHJvcFN0YXRlLmV2ZW50cz17fSl9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1lbmRcIjpmdW5jdGlvbih0LGUpe2lmKFwiZHJhZ1wiPT09dC5pbnRlcmFjdGlvbi5wcmVwYXJlZC5uYW1lKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5pRXZlbnQ7aHQodCxlKSx2dChuLG4uZHJvcFN0YXRlLmV2ZW50cyksZS5maXJlKFwiYWN0aW9ucy9kcm9wOmVuZFwiLHtpbnRlcmFjdGlvbjpuLGRyYWdFdmVudDpyfSl9fSxcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtpZihcImRyYWdcIj09PWUucHJlcGFyZWQubmFtZSl7dmFyIG49ZS5kcm9wU3RhdGU7biYmKG4uYWN0aXZlRHJvcHM9bnVsbCxuLmV2ZW50cz1udWxsLG4uY3VyLmRyb3B6b25lPW51bGwsbi5jdXIuZWxlbWVudD1udWxsLG4ucHJldi5kcm9wem9uZT1udWxsLG4ucHJldi5lbGVtZW50PW51bGwsbi5yZWplY3RlZD0hMSl9fX0sZ2V0QWN0aXZlRHJvcHM6ZnQsZ2V0RHJvcDpkdCxnZXREcm9wRXZlbnRzOnB0LGZpcmVEcm9wRXZlbnRzOnZ0LGRlZmF1bHRzOntlbmFibGVkOiExLGFjY2VwdDpudWxsLG92ZXJsYXA6XCJwb2ludGVyXCJ9fSx5dD1ndDt1dC5kZWZhdWx0PXl0O3ZhciBtdD17fTtmdW5jdGlvbiBidCh0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5pRXZlbnQscj10LnBoYXNlO2lmKFwiZ2VzdHVyZVwiPT09ZS5wcmVwYXJlZC5uYW1lKXt2YXIgbz1lLnBvaW50ZXJzLm1hcCgoZnVuY3Rpb24odCl7cmV0dXJuIHQucG9pbnRlcn0pKSxhPVwic3RhcnRcIj09PXIscz1cImVuZFwiPT09cixsPWUuaW50ZXJhY3RhYmxlLm9wdGlvbnMuZGVsdGFTb3VyY2U7aWYobi50b3VjaGVzPVtvWzBdLG9bMV1dLGEpbi5kaXN0YW5jZT1CLnRvdWNoRGlzdGFuY2UobyxsKSxuLmJveD1CLnRvdWNoQkJveChvKSxuLnNjYWxlPTEsbi5kcz0wLG4uYW5nbGU9Qi50b3VjaEFuZ2xlKG8sbCksbi5kYT0wLGUuZ2VzdHVyZS5zdGFydERpc3RhbmNlPW4uZGlzdGFuY2UsZS5nZXN0dXJlLnN0YXJ0QW5nbGU9bi5hbmdsZTtlbHNlIGlmKHMpe3ZhciB1PWUucHJldkV2ZW50O24uZGlzdGFuY2U9dS5kaXN0YW5jZSxuLmJveD11LmJveCxuLnNjYWxlPXUuc2NhbGUsbi5kcz0wLG4uYW5nbGU9dS5hbmdsZSxuLmRhPTB9ZWxzZSBuLmRpc3RhbmNlPUIudG91Y2hEaXN0YW5jZShvLGwpLG4uYm94PUIudG91Y2hCQm94KG8pLG4uc2NhbGU9bi5kaXN0YW5jZS9lLmdlc3R1cmUuc3RhcnREaXN0YW5jZSxuLmFuZ2xlPUIudG91Y2hBbmdsZShvLGwpLG4uZHM9bi5zY2FsZS1lLmdlc3R1cmUuc2NhbGUsbi5kYT1uLmFuZ2xlLWUuZ2VzdHVyZS5hbmdsZTtlLmdlc3R1cmUuZGlzdGFuY2U9bi5kaXN0YW5jZSxlLmdlc3R1cmUuYW5nbGU9bi5hbmdsZSxpLmRlZmF1bHQubnVtYmVyKG4uc2NhbGUpJiZuLnNjYWxlIT09MS8wJiYhaXNOYU4obi5zY2FsZSkmJihlLmdlc3R1cmUuc2NhbGU9bi5zY2FsZSl9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShtdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxtdC5kZWZhdWx0PXZvaWQgMDt2YXIgeHQ9e2lkOlwiYWN0aW9ucy9nZXN0dXJlXCIsYmVmb3JlOltcImFjdGlvbnMvZHJhZ1wiLFwiYWN0aW9ucy9yZXNpemVcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmFjdGlvbnMsbj10LkludGVyYWN0YWJsZSxyPXQuZGVmYXVsdHM7bi5wcm90b3R5cGUuZ2VzdHVyYWJsZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0Lm9iamVjdCh0KT8odGhpcy5vcHRpb25zLmdlc3R1cmUuZW5hYmxlZD0hMSE9PXQuZW5hYmxlZCx0aGlzLnNldFBlckFjdGlvbihcImdlc3R1cmVcIix0KSx0aGlzLnNldE9uRXZlbnRzKFwiZ2VzdHVyZVwiLHQpLHRoaXMpOmkuZGVmYXVsdC5ib29sKHQpPyh0aGlzLm9wdGlvbnMuZ2VzdHVyZS5lbmFibGVkPXQsdGhpcyk6dGhpcy5vcHRpb25zLmdlc3R1cmV9LGUubWFwLmdlc3R1cmU9eHQsZS5tZXRob2REaWN0Lmdlc3R1cmU9XCJnZXN0dXJhYmxlXCIsci5hY3Rpb25zLmdlc3R1cmU9eHQuZGVmYXVsdHN9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6YWN0aW9uLXN0YXJ0XCI6YnQsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpidCxcImludGVyYWN0aW9uczphY3Rpb24tZW5kXCI6YnQsXCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dC5pbnRlcmFjdGlvbi5nZXN0dXJlPXthbmdsZTowLGRpc3RhbmNlOjAsc2NhbGU6MSxzdGFydEFuZ2xlOjAsc3RhcnREaXN0YW5jZTowfX0sXCJhdXRvLXN0YXJ0OmNoZWNrXCI6ZnVuY3Rpb24odCl7aWYoISh0LmludGVyYWN0aW9uLnBvaW50ZXJzLmxlbmd0aDwyKSl7dmFyIGU9dC5pbnRlcmFjdGFibGUub3B0aW9ucy5nZXN0dXJlO2lmKGUmJmUuZW5hYmxlZClyZXR1cm4gdC5hY3Rpb249e25hbWU6XCJnZXN0dXJlXCJ9LCExfX19LGRlZmF1bHRzOnt9LGdldEN1cnNvcjpmdW5jdGlvbigpe3JldHVyblwiXCJ9fSx3dD14dDttdC5kZWZhdWx0PXd0O3ZhciBfdD17fTtmdW5jdGlvbiBQdCh0LGUsbixyLG8sYSxzKXtpZighZSlyZXR1cm4hMTtpZighMD09PWUpe3ZhciBsPWkuZGVmYXVsdC5udW1iZXIoYS53aWR0aCk/YS53aWR0aDphLnJpZ2h0LWEubGVmdCx1PWkuZGVmYXVsdC5udW1iZXIoYS5oZWlnaHQpP2EuaGVpZ2h0OmEuYm90dG9tLWEudG9wO2lmKHM9TWF0aC5taW4ocyxNYXRoLmFicygoXCJsZWZ0XCI9PT10fHxcInJpZ2h0XCI9PT10P2w6dSkvMikpLGw8MCYmKFwibGVmdFwiPT09dD90PVwicmlnaHRcIjpcInJpZ2h0XCI9PT10JiYodD1cImxlZnRcIikpLHU8MCYmKFwidG9wXCI9PT10P3Q9XCJib3R0b21cIjpcImJvdHRvbVwiPT09dCYmKHQ9XCJ0b3BcIikpLFwibGVmdFwiPT09dClyZXR1cm4gbi54PChsPj0wP2EubGVmdDphLnJpZ2h0KStzO2lmKFwidG9wXCI9PT10KXJldHVybiBuLnk8KHU+PTA/YS50b3A6YS5ib3R0b20pK3M7aWYoXCJyaWdodFwiPT09dClyZXR1cm4gbi54PihsPj0wP2EucmlnaHQ6YS5sZWZ0KS1zO2lmKFwiYm90dG9tXCI9PT10KXJldHVybiBuLnk+KHU+PTA/YS5ib3R0b206YS50b3ApLXN9cmV0dXJuISFpLmRlZmF1bHQuZWxlbWVudChyKSYmKGkuZGVmYXVsdC5lbGVtZW50KGUpP2U9PT1yOl8ubWF0Y2hlc1VwVG8ocixlLG8pKX1mdW5jdGlvbiBPdCh0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb247aWYoXCJyZXNpemVcIj09PW4ucHJlcGFyZWQubmFtZSYmbi5yZXNpemVBeGVzKXt2YXIgcj1lO24uaW50ZXJhY3RhYmxlLm9wdGlvbnMucmVzaXplLnNxdWFyZT8oXCJ5XCI9PT1uLnJlc2l6ZUF4ZXM/ci5kZWx0YS54PXIuZGVsdGEueTpyLmRlbHRhLnk9ci5kZWx0YS54LHIuYXhlcz1cInh5XCIpOihyLmF4ZXM9bi5yZXNpemVBeGVzLFwieFwiPT09bi5yZXNpemVBeGVzP3IuZGVsdGEueT0wOlwieVwiPT09bi5yZXNpemVBeGVzJiYoci5kZWx0YS54PTApKX19T2JqZWN0LmRlZmluZVByb3BlcnR5KF90LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLF90LmRlZmF1bHQ9dm9pZCAwO3ZhciBTdD17aWQ6XCJhY3Rpb25zL3Jlc2l6ZVwiLGJlZm9yZTpbXCJhY3Rpb25zL2RyYWdcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmFjdGlvbnMsbj10LmJyb3dzZXIscj10LkludGVyYWN0YWJsZSxvPXQuZGVmYXVsdHM7U3QuY3Vyc29ycz1mdW5jdGlvbih0KXtyZXR1cm4gdC5pc0llOT97eDpcImUtcmVzaXplXCIseTpcInMtcmVzaXplXCIseHk6XCJzZS1yZXNpemVcIix0b3A6XCJuLXJlc2l6ZVwiLGxlZnQ6XCJ3LXJlc2l6ZVwiLGJvdHRvbTpcInMtcmVzaXplXCIscmlnaHQ6XCJlLXJlc2l6ZVwiLHRvcGxlZnQ6XCJzZS1yZXNpemVcIixib3R0b21yaWdodDpcInNlLXJlc2l6ZVwiLHRvcHJpZ2h0OlwibmUtcmVzaXplXCIsYm90dG9tbGVmdDpcIm5lLXJlc2l6ZVwifTp7eDpcImV3LXJlc2l6ZVwiLHk6XCJucy1yZXNpemVcIix4eTpcIm53c2UtcmVzaXplXCIsdG9wOlwibnMtcmVzaXplXCIsbGVmdDpcImV3LXJlc2l6ZVwiLGJvdHRvbTpcIm5zLXJlc2l6ZVwiLHJpZ2h0OlwiZXctcmVzaXplXCIsdG9wbGVmdDpcIm53c2UtcmVzaXplXCIsYm90dG9tcmlnaHQ6XCJud3NlLXJlc2l6ZVwiLHRvcHJpZ2h0OlwibmVzdy1yZXNpemVcIixib3R0b21sZWZ0OlwibmVzdy1yZXNpemVcIn19KG4pLFN0LmRlZmF1bHRNYXJnaW49bi5zdXBwb3J0c1RvdWNofHxuLnN1cHBvcnRzUG9pbnRlckV2ZW50PzIwOjEwLHIucHJvdG90eXBlLnJlc2l6YWJsZT1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24odCxlLG4pe3JldHVybiBpLmRlZmF1bHQub2JqZWN0KGUpPyh0Lm9wdGlvbnMucmVzaXplLmVuYWJsZWQ9ITEhPT1lLmVuYWJsZWQsdC5zZXRQZXJBY3Rpb24oXCJyZXNpemVcIixlKSx0LnNldE9uRXZlbnRzKFwicmVzaXplXCIsZSksaS5kZWZhdWx0LnN0cmluZyhlLmF4aXMpJiYvXngkfF55JHxeeHkkLy50ZXN0KGUuYXhpcyk/dC5vcHRpb25zLnJlc2l6ZS5heGlzPWUuYXhpczpudWxsPT09ZS5heGlzJiYodC5vcHRpb25zLnJlc2l6ZS5heGlzPW4uZGVmYXVsdHMuYWN0aW9ucy5yZXNpemUuYXhpcyksaS5kZWZhdWx0LmJvb2woZS5wcmVzZXJ2ZUFzcGVjdFJhdGlvKT90Lm9wdGlvbnMucmVzaXplLnByZXNlcnZlQXNwZWN0UmF0aW89ZS5wcmVzZXJ2ZUFzcGVjdFJhdGlvOmkuZGVmYXVsdC5ib29sKGUuc3F1YXJlKSYmKHQub3B0aW9ucy5yZXNpemUuc3F1YXJlPWUuc3F1YXJlKSx0KTppLmRlZmF1bHQuYm9vbChlKT8odC5vcHRpb25zLnJlc2l6ZS5lbmFibGVkPWUsdCk6dC5vcHRpb25zLnJlc2l6ZX0odGhpcyxlLHQpfSxlLm1hcC5yZXNpemU9U3QsZS5tZXRob2REaWN0LnJlc2l6ZT1cInJlc2l6YWJsZVwiLG8uYWN0aW9ucy5yZXNpemU9U3QuZGVmYXVsdHN9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dC5pbnRlcmFjdGlvbi5yZXNpemVBeGVzPVwieHlcIn0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLXN0YXJ0XCI6ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQpe3ZhciBlPXQuaUV2ZW50LG49dC5pbnRlcmFjdGlvbjtpZihcInJlc2l6ZVwiPT09bi5wcmVwYXJlZC5uYW1lJiZuLnByZXBhcmVkLmVkZ2VzKXt2YXIgcj1lLG89bi5yZWN0O24uX3JlY3RzPXtzdGFydDooMCxqLmRlZmF1bHQpKHt9LG8pLGNvcnJlY3RlZDooMCxqLmRlZmF1bHQpKHt9LG8pLHByZXZpb3VzOigwLGouZGVmYXVsdCkoe30sbyksZGVsdGE6e2xlZnQ6MCxyaWdodDowLHdpZHRoOjAsdG9wOjAsYm90dG9tOjAsaGVpZ2h0OjB9fSxyLmVkZ2VzPW4ucHJlcGFyZWQuZWRnZXMsci5yZWN0PW4uX3JlY3RzLmNvcnJlY3RlZCxyLmRlbHRhUmVjdD1uLl9yZWN0cy5kZWx0YX19KHQpLE90KHQpfSxcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb247aWYoXCJyZXNpemVcIj09PW4ucHJlcGFyZWQubmFtZSYmbi5wcmVwYXJlZC5lZGdlcyl7dmFyIHI9ZSxvPW4uaW50ZXJhY3RhYmxlLm9wdGlvbnMucmVzaXplLmludmVydCxpPVwicmVwb3NpdGlvblwiPT09b3x8XCJuZWdhdGVcIj09PW8sYT1uLnJlY3Qscz1uLl9yZWN0cyxsPXMuc3RhcnQsdT1zLmNvcnJlY3RlZCxjPXMuZGVsdGEsZj1zLnByZXZpb3VzO2lmKCgwLGouZGVmYXVsdCkoZix1KSxpKXtpZigoMCxqLmRlZmF1bHQpKHUsYSksXCJyZXBvc2l0aW9uXCI9PT1vKXtpZih1LnRvcD51LmJvdHRvbSl7dmFyIGQ9dS50b3A7dS50b3A9dS5ib3R0b20sdS5ib3R0b209ZH1pZih1LmxlZnQ+dS5yaWdodCl7dmFyIHA9dS5sZWZ0O3UubGVmdD11LnJpZ2h0LHUucmlnaHQ9cH19fWVsc2UgdS50b3A9TWF0aC5taW4oYS50b3AsbC5ib3R0b20pLHUuYm90dG9tPU1hdGgubWF4KGEuYm90dG9tLGwudG9wKSx1LmxlZnQ9TWF0aC5taW4oYS5sZWZ0LGwucmlnaHQpLHUucmlnaHQ9TWF0aC5tYXgoYS5yaWdodCxsLmxlZnQpO2Zvcih2YXIgdiBpbiB1LndpZHRoPXUucmlnaHQtdS5sZWZ0LHUuaGVpZ2h0PXUuYm90dG9tLXUudG9wLHUpY1t2XT11W3ZdLWZbdl07ci5lZGdlcz1uLnByZXBhcmVkLmVkZ2VzLHIucmVjdD11LHIuZGVsdGFSZWN0PWN9fSh0KSxPdCh0KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLWVuZFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaUV2ZW50LG49dC5pbnRlcmFjdGlvbjtpZihcInJlc2l6ZVwiPT09bi5wcmVwYXJlZC5uYW1lJiZuLnByZXBhcmVkLmVkZ2VzKXt2YXIgcj1lO3IuZWRnZXM9bi5wcmVwYXJlZC5lZGdlcyxyLnJlY3Q9bi5fcmVjdHMuY29ycmVjdGVkLHIuZGVsdGFSZWN0PW4uX3JlY3RzLmRlbHRhfX0sXCJhdXRvLXN0YXJ0OmNoZWNrXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuaW50ZXJhY3RhYmxlLHI9dC5lbGVtZW50LG89dC5yZWN0LGE9dC5idXR0b25zO2lmKG8pe3ZhciBzPSgwLGouZGVmYXVsdCkoe30sZS5jb29yZHMuY3VyLnBhZ2UpLGw9bi5vcHRpb25zLnJlc2l6ZTtpZihsJiZsLmVuYWJsZWQmJighZS5wb2ludGVySXNEb3dufHwhL21vdXNlfHBvaW50ZXIvLnRlc3QoZS5wb2ludGVyVHlwZSl8fDAhPShhJmwubW91c2VCdXR0b25zKSkpe2lmKGkuZGVmYXVsdC5vYmplY3QobC5lZGdlcykpe3ZhciB1PXtsZWZ0OiExLHJpZ2h0OiExLHRvcDohMSxib3R0b206ITF9O2Zvcih2YXIgYyBpbiB1KXVbY109UHQoYyxsLmVkZ2VzW2NdLHMsZS5fbGF0ZXN0UG9pbnRlci5ldmVudFRhcmdldCxyLG8sbC5tYXJnaW58fFN0LmRlZmF1bHRNYXJnaW4pO3UubGVmdD11LmxlZnQmJiF1LnJpZ2h0LHUudG9wPXUudG9wJiYhdS5ib3R0b20sKHUubGVmdHx8dS5yaWdodHx8dS50b3B8fHUuYm90dG9tKSYmKHQuYWN0aW9uPXtuYW1lOlwicmVzaXplXCIsZWRnZXM6dX0pfWVsc2V7dmFyIGY9XCJ5XCIhPT1sLmF4aXMmJnMueD5vLnJpZ2h0LVN0LmRlZmF1bHRNYXJnaW4sZD1cInhcIiE9PWwuYXhpcyYmcy55Pm8uYm90dG9tLVN0LmRlZmF1bHRNYXJnaW47KGZ8fGQpJiYodC5hY3Rpb249e25hbWU6XCJyZXNpemVcIixheGVzOihmP1wieFwiOlwiXCIpKyhkP1wieVwiOlwiXCIpfSl9cmV0dXJuIXQuYWN0aW9uJiZ2b2lkIDB9fX19LGRlZmF1bHRzOntzcXVhcmU6ITEscHJlc2VydmVBc3BlY3RSYXRpbzohMSxheGlzOlwieHlcIixtYXJnaW46TmFOLGVkZ2VzOm51bGwsaW52ZXJ0Olwibm9uZVwifSxjdXJzb3JzOm51bGwsZ2V0Q3Vyc29yOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZWRnZXMsbj10LmF4aXMscj10Lm5hbWUsbz1TdC5jdXJzb3JzLGk9bnVsbDtpZihuKWk9b1tyK25dO2Vsc2UgaWYoZSl7Zm9yKHZhciBhPVwiXCIscz1bXCJ0b3BcIixcImJvdHRvbVwiLFwibGVmdFwiLFwicmlnaHRcIl0sbD0wO2w8cy5sZW5ndGg7bCsrKXt2YXIgdT1zW2xdO2VbdV0mJihhKz11KX1pPW9bYV19cmV0dXJuIGl9LGRlZmF1bHRNYXJnaW46bnVsbH0sRXQ9U3Q7X3QuZGVmYXVsdD1FdDt2YXIgVHQ9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFR0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFR0LmRlZmF1bHQ9dm9pZCAwO3ZhciBNdD17aWQ6XCJhY3Rpb25zXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt0LnVzZVBsdWdpbihtdC5kZWZhdWx0KSx0LnVzZVBsdWdpbihfdC5kZWZhdWx0KSx0LnVzZVBsdWdpbihjLmRlZmF1bHQpLHQudXNlUGx1Z2luKHV0LmRlZmF1bHQpfX07VHQuZGVmYXVsdD1NdDt2YXIganQ9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGp0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGp0LmRlZmF1bHQ9dm9pZCAwO3ZhciBrdCxJdCxEdD0wLEF0PXtyZXF1ZXN0OmZ1bmN0aW9uKHQpe3JldHVybiBrdCh0KX0sY2FuY2VsOmZ1bmN0aW9uKHQpe3JldHVybiBJdCh0KX0saW5pdDpmdW5jdGlvbih0KXtpZihrdD10LnJlcXVlc3RBbmltYXRpb25GcmFtZSxJdD10LmNhbmNlbEFuaW1hdGlvbkZyYW1lLCFrdClmb3IodmFyIGU9W1wibXNcIixcIm1velwiLFwid2Via2l0XCIsXCJvXCJdLG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtrdD10W1wiXCIuY29uY2F0KHIsXCJSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIildLEl0PXRbXCJcIi5jb25jYXQocixcIkNhbmNlbEFuaW1hdGlvbkZyYW1lXCIpXXx8dFtcIlwiLmNvbmNhdChyLFwiQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpXX1rdD1rdCYma3QuYmluZCh0KSxJdD1JdCYmSXQuYmluZCh0KSxrdHx8KGt0PWZ1bmN0aW9uKGUpe3ZhciBuPURhdGUubm93KCkscj1NYXRoLm1heCgwLDE2LShuLUR0KSksbz10LnNldFRpbWVvdXQoKGZ1bmN0aW9uKCl7ZShuK3IpfSkscik7cmV0dXJuIER0PW4rcixvfSxJdD1mdW5jdGlvbih0KXtyZXR1cm4gY2xlYXJUaW1lb3V0KHQpfSl9fTtqdC5kZWZhdWx0PUF0O3ZhciBSdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoUnQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksUnQuZ2V0Q29udGFpbmVyPUN0LFJ0LmdldFNjcm9sbD1GdCxSdC5nZXRTY3JvbGxTaXplPWZ1bmN0aW9uKHQpe3JldHVybiBpLmRlZmF1bHQud2luZG93KHQpJiYodD13aW5kb3cuZG9jdW1lbnQuYm9keSkse3g6dC5zY3JvbGxXaWR0aCx5OnQuc2Nyb2xsSGVpZ2h0fX0sUnQuZ2V0U2Nyb2xsU2l6ZURlbHRhPWZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQuZWxlbWVudCxvPW4mJm4uaW50ZXJhY3RhYmxlLm9wdGlvbnNbbi5wcmVwYXJlZC5uYW1lXS5hdXRvU2Nyb2xsO2lmKCFvfHwhby5lbmFibGVkKXJldHVybiBlKCkse3g6MCx5OjB9O3ZhciBpPUN0KG8uY29udGFpbmVyLG4uaW50ZXJhY3RhYmxlLHIpLGE9RnQoaSk7ZSgpO3ZhciBzPUZ0KGkpO3JldHVybnt4OnMueC1hLngseTpzLnktYS55fX0sUnQuZGVmYXVsdD12b2lkIDA7dmFyIHp0PXtkZWZhdWx0czp7ZW5hYmxlZDohMSxtYXJnaW46NjAsY29udGFpbmVyOm51bGwsc3BlZWQ6MzAwfSxub3c6RGF0ZS5ub3csaW50ZXJhY3Rpb246bnVsbCxpOjAseDowLHk6MCxpc1Njcm9sbGluZzohMSxwcmV2VGltZTowLG1hcmdpbjowLHNwZWVkOjAsc3RhcnQ6ZnVuY3Rpb24odCl7enQuaXNTY3JvbGxpbmc9ITAsanQuZGVmYXVsdC5jYW5jZWwoenQuaSksdC5hdXRvU2Nyb2xsPXp0LHp0LmludGVyYWN0aW9uPXQsenQucHJldlRpbWU9enQubm93KCksenQuaT1qdC5kZWZhdWx0LnJlcXVlc3QoenQuc2Nyb2xsKX0sc3RvcDpmdW5jdGlvbigpe3p0LmlzU2Nyb2xsaW5nPSExLHp0LmludGVyYWN0aW9uJiYoenQuaW50ZXJhY3Rpb24uYXV0b1Njcm9sbD1udWxsKSxqdC5kZWZhdWx0LmNhbmNlbCh6dC5pKX0sc2Nyb2xsOmZ1bmN0aW9uKCl7dmFyIHQ9enQuaW50ZXJhY3Rpb24sZT10LmludGVyYWN0YWJsZSxuPXQuZWxlbWVudCxyPXQucHJlcGFyZWQubmFtZSxvPWUub3B0aW9uc1tyXS5hdXRvU2Nyb2xsLGE9Q3Qoby5jb250YWluZXIsZSxuKSxzPXp0Lm5vdygpLGw9KHMtenQucHJldlRpbWUpLzFlMyx1PW8uc3BlZWQqbDtpZih1Pj0xKXt2YXIgYz17eDp6dC54KnUseTp6dC55KnV9O2lmKGMueHx8Yy55KXt2YXIgZj1GdChhKTtpLmRlZmF1bHQud2luZG93KGEpP2Euc2Nyb2xsQnkoYy54LGMueSk6YSYmKGEuc2Nyb2xsTGVmdCs9Yy54LGEuc2Nyb2xsVG9wKz1jLnkpO3ZhciBkPUZ0KGEpLHA9e3g6ZC54LWYueCx5OmQueS1mLnl9OyhwLnh8fHAueSkmJmUuZmlyZSh7dHlwZTpcImF1dG9zY3JvbGxcIix0YXJnZXQ6bixpbnRlcmFjdGFibGU6ZSxkZWx0YTpwLGludGVyYWN0aW9uOnQsY29udGFpbmVyOmF9KX16dC5wcmV2VGltZT1zfXp0LmlzU2Nyb2xsaW5nJiYoanQuZGVmYXVsdC5jYW5jZWwoenQuaSksenQuaT1qdC5kZWZhdWx0LnJlcXVlc3QoenQuc2Nyb2xsKSl9LGNoZWNrOmZ1bmN0aW9uKHQsZSl7dmFyIG47cmV0dXJuIG51bGw9PShuPXQub3B0aW9uc1tlXS5hdXRvU2Nyb2xsKT92b2lkIDA6bi5lbmFibGVkfSxvbkludGVyYWN0aW9uTW92ZTpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5wb2ludGVyO2lmKGUuaW50ZXJhY3RpbmcoKSYmenQuY2hlY2soZS5pbnRlcmFjdGFibGUsZS5wcmVwYXJlZC5uYW1lKSlpZihlLnNpbXVsYXRpb24penQueD16dC55PTA7ZWxzZXt2YXIgcixvLGEscyxsPWUuaW50ZXJhY3RhYmxlLHU9ZS5lbGVtZW50LGM9ZS5wcmVwYXJlZC5uYW1lLGY9bC5vcHRpb25zW2NdLmF1dG9TY3JvbGwsZD1DdChmLmNvbnRhaW5lcixsLHUpO2lmKGkuZGVmYXVsdC53aW5kb3coZCkpcz1uLmNsaWVudFg8enQubWFyZ2luLHI9bi5jbGllbnRZPHp0Lm1hcmdpbixvPW4uY2xpZW50WD5kLmlubmVyV2lkdGgtenQubWFyZ2luLGE9bi5jbGllbnRZPmQuaW5uZXJIZWlnaHQtenQubWFyZ2luO2Vsc2V7dmFyIHA9Xy5nZXRFbGVtZW50Q2xpZW50UmVjdChkKTtzPW4uY2xpZW50WDxwLmxlZnQrenQubWFyZ2luLHI9bi5jbGllbnRZPHAudG9wK3p0Lm1hcmdpbixvPW4uY2xpZW50WD5wLnJpZ2h0LXp0Lm1hcmdpbixhPW4uY2xpZW50WT5wLmJvdHRvbS16dC5tYXJnaW59enQueD1vPzE6cz8tMTowLHp0Lnk9YT8xOnI/LTE6MCx6dC5pc1Njcm9sbGluZ3x8KHp0Lm1hcmdpbj1mLm1hcmdpbix6dC5zcGVlZD1mLnNwZWVkLHp0LnN0YXJ0KGUpKX19fTtmdW5jdGlvbiBDdCh0LG4scil7cmV0dXJuKGkuZGVmYXVsdC5zdHJpbmcodCk/KDAsay5nZXRTdHJpbmdPcHRpb25SZXN1bHQpKHQsbixyKTp0KXx8KDAsZS5nZXRXaW5kb3cpKHIpfWZ1bmN0aW9uIEZ0KHQpe3JldHVybiBpLmRlZmF1bHQud2luZG93KHQpJiYodD13aW5kb3cuZG9jdW1lbnQuYm9keSkse3g6dC5zY3JvbGxMZWZ0LHk6dC5zY3JvbGxUb3B9fXZhciBYdD17aWQ6XCJhdXRvLXNjcm9sbFwiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5kZWZhdWx0cyxuPXQuYWN0aW9uczt0LmF1dG9TY3JvbGw9enQsenQubm93PWZ1bmN0aW9uKCl7cmV0dXJuIHQubm93KCl9LG4ucGhhc2VsZXNzVHlwZXMuYXV0b3Njcm9sbD0hMCxlLnBlckFjdGlvbi5hdXRvU2Nyb2xsPXp0LmRlZmF1bHRzfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24uYXV0b1Njcm9sbD1udWxsfSxcImludGVyYWN0aW9uczpkZXN0cm95XCI6ZnVuY3Rpb24odCl7dC5pbnRlcmFjdGlvbi5hdXRvU2Nyb2xsPW51bGwsenQuc3RvcCgpLHp0LmludGVyYWN0aW9uJiYoenQuaW50ZXJhY3Rpb249bnVsbCl9LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjp6dC5zdG9wLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHp0Lm9uSW50ZXJhY3Rpb25Nb3ZlKHQpfX19O1J0LmRlZmF1bHQ9WHQ7dmFyIFl0PXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShZdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxZdC53YXJuT25jZT1mdW5jdGlvbih0LG4pe3ZhciByPSExO3JldHVybiBmdW5jdGlvbigpe3JldHVybiByfHwoZS53aW5kb3cuY29uc29sZS53YXJuKG4pLHI9ITApLHQuYXBwbHkodGhpcyxhcmd1bWVudHMpfX0sWXQuY29weUFjdGlvbj1mdW5jdGlvbih0LGUpe3JldHVybiB0Lm5hbWU9ZS5uYW1lLHQuYXhpcz1lLmF4aXMsdC5lZGdlcz1lLmVkZ2VzLHR9LFl0LnNpZ249dm9pZCAwLFl0LnNpZ249ZnVuY3Rpb24odCl7cmV0dXJuIHQ+PTA/MTotMX07dmFyIEJ0PXt9O2Z1bmN0aW9uIFd0KHQpe3JldHVybiBpLmRlZmF1bHQuYm9vbCh0KT8odGhpcy5vcHRpb25zLnN0eWxlQ3Vyc29yPXQsdGhpcyk6bnVsbD09PXQ/KGRlbGV0ZSB0aGlzLm9wdGlvbnMuc3R5bGVDdXJzb3IsdGhpcyk6dGhpcy5vcHRpb25zLnN0eWxlQ3Vyc29yfWZ1bmN0aW9uIEx0KHQpe3JldHVybiBpLmRlZmF1bHQuZnVuYyh0KT8odGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXI9dCx0aGlzKTpudWxsPT09dD8oZGVsZXRlIHRoaXMub3B0aW9ucy5hY3Rpb25DaGVja2VyLHRoaXMpOnRoaXMub3B0aW9ucy5hY3Rpb25DaGVja2VyfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxCdC5kZWZhdWx0PXZvaWQgMDt2YXIgVXQ9e2lkOlwiYXV0by1zdGFydC9pbnRlcmFjdGFibGVNZXRob2RzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LkludGVyYWN0YWJsZTtlLnByb3RvdHlwZS5nZXRBY3Rpb249ZnVuY3Rpb24oZSxuLHIsbyl7dmFyIGk9ZnVuY3Rpb24odCxlLG4scixvKXt2YXIgaT10LmdldFJlY3QociksYT17YWN0aW9uOm51bGwsaW50ZXJhY3RhYmxlOnQsaW50ZXJhY3Rpb246bixlbGVtZW50OnIscmVjdDppLGJ1dHRvbnM6ZS5idXR0b25zfHx7MDoxLDE6NCwzOjgsNDoxNn1bZS5idXR0b25dfTtyZXR1cm4gby5maXJlKFwiYXV0by1zdGFydDpjaGVja1wiLGEpLGEuYWN0aW9ufSh0aGlzLG4scixvLHQpO3JldHVybiB0aGlzLm9wdGlvbnMuYWN0aW9uQ2hlY2tlcj90aGlzLm9wdGlvbnMuYWN0aW9uQ2hlY2tlcihlLG4saSx0aGlzLG8scik6aX0sZS5wcm90b3R5cGUuaWdub3JlRnJvbT0oMCxZdC53YXJuT25jZSkoKGZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9iYWNrQ29tcGF0T3B0aW9uKFwiaWdub3JlRnJvbVwiLHQpfSksXCJJbnRlcmFjdGFibGUuaWdub3JlRnJvbSgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBJbnRlcmFjdGJsZS5kcmFnZ2FibGUoe2lnbm9yZUZyb206IG5ld1ZhbHVlfSkuXCIpLGUucHJvdG90eXBlLmFsbG93RnJvbT0oMCxZdC53YXJuT25jZSkoKGZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9iYWNrQ29tcGF0T3B0aW9uKFwiYWxsb3dGcm9tXCIsdCl9KSxcIkludGVyYWN0YWJsZS5hbGxvd0Zyb20oKSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgSW50ZXJhY3RibGUuZHJhZ2dhYmxlKHthbGxvd0Zyb206IG5ld1ZhbHVlfSkuXCIpLGUucHJvdG90eXBlLmFjdGlvbkNoZWNrZXI9THQsZS5wcm90b3R5cGUuc3R5bGVDdXJzb3I9V3R9fTtCdC5kZWZhdWx0PVV0O3ZhciBWdD17fTtmdW5jdGlvbiBOdCh0LGUsbixyLG8pe3JldHVybiBlLnRlc3RJZ25vcmVBbGxvdyhlLm9wdGlvbnNbdC5uYW1lXSxuLHIpJiZlLm9wdGlvbnNbdC5uYW1lXS5lbmFibGVkJiZIdChlLG4sdCxvKT90Om51bGx9ZnVuY3Rpb24gcXQodCxlLG4scixvLGksYSl7Zm9yKHZhciBzPTAsbD1yLmxlbmd0aDtzPGw7cysrKXt2YXIgdT1yW3NdLGM9b1tzXSxmPXUuZ2V0QWN0aW9uKGUsbix0LGMpO2lmKGYpe3ZhciBkPU50KGYsdSxjLGksYSk7aWYoZClyZXR1cm57YWN0aW9uOmQsaW50ZXJhY3RhYmxlOnUsZWxlbWVudDpjfX19cmV0dXJue2FjdGlvbjpudWxsLGludGVyYWN0YWJsZTpudWxsLGVsZW1lbnQ6bnVsbH19ZnVuY3Rpb24gJHQodCxlLG4scixvKXt2YXIgYT1bXSxzPVtdLGw9cjtmdW5jdGlvbiB1KHQpe2EucHVzaCh0KSxzLnB1c2gobCl9Zm9yKDtpLmRlZmF1bHQuZWxlbWVudChsKTspe2E9W10scz1bXSxvLmludGVyYWN0YWJsZXMuZm9yRWFjaE1hdGNoKGwsdSk7dmFyIGM9cXQodCxlLG4sYSxzLHIsbyk7aWYoYy5hY3Rpb24mJiFjLmludGVyYWN0YWJsZS5vcHRpb25zW2MuYWN0aW9uLm5hbWVdLm1hbnVhbFN0YXJ0KXJldHVybiBjO2w9Xy5wYXJlbnROb2RlKGwpfXJldHVybnthY3Rpb246bnVsbCxpbnRlcmFjdGFibGU6bnVsbCxlbGVtZW50Om51bGx9fWZ1bmN0aW9uIEd0KHQsZSxuKXt2YXIgcj1lLmFjdGlvbixvPWUuaW50ZXJhY3RhYmxlLGk9ZS5lbGVtZW50O3I9cnx8e25hbWU6bnVsbH0sdC5pbnRlcmFjdGFibGU9byx0LmVsZW1lbnQ9aSwoMCxZdC5jb3B5QWN0aW9uKSh0LnByZXBhcmVkLHIpLHQucmVjdD1vJiZyLm5hbWU/by5nZXRSZWN0KGkpOm51bGwsSnQodCxuKSxuLmZpcmUoXCJhdXRvU3RhcnQ6cHJlcGFyZWRcIix7aW50ZXJhY3Rpb246dH0pfWZ1bmN0aW9uIEh0KHQsZSxuLHIpe3ZhciBvPXQub3B0aW9ucyxpPW9bbi5uYW1lXS5tYXgsYT1vW24ubmFtZV0ubWF4UGVyRWxlbWVudCxzPXIuYXV0b1N0YXJ0Lm1heEludGVyYWN0aW9ucyxsPTAsdT0wLGM9MDtpZighKGkmJmEmJnMpKXJldHVybiExO2Zvcih2YXIgZj0wO2Y8ci5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7ZisrKXt2YXIgZD1yLmludGVyYWN0aW9ucy5saXN0W2ZdLHA9ZC5wcmVwYXJlZC5uYW1lO2lmKGQuaW50ZXJhY3RpbmcoKSl7aWYoKytsPj1zKXJldHVybiExO2lmKGQuaW50ZXJhY3RhYmxlPT09dCl7aWYoKHUrPXA9PT1uLm5hbWU/MTowKT49aSlyZXR1cm4hMTtpZihkLmVsZW1lbnQ9PT1lJiYoYysrLHA9PT1uLm5hbWUmJmM+PWEpKXJldHVybiExfX19cmV0dXJuIHM+MH1mdW5jdGlvbiBLdCh0LGUpe3JldHVybiBpLmRlZmF1bHQubnVtYmVyKHQpPyhlLmF1dG9TdGFydC5tYXhJbnRlcmFjdGlvbnM9dCx0aGlzKTplLmF1dG9TdGFydC5tYXhJbnRlcmFjdGlvbnN9ZnVuY3Rpb24gWnQodCxlLG4pe3ZhciByPW4uYXV0b1N0YXJ0LmN1cnNvckVsZW1lbnQ7ciYmciE9PXQmJihyLnN0eWxlLmN1cnNvcj1cIlwiKSx0Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmN1cnNvcj1lLHQuc3R5bGUuY3Vyc29yPWUsbi5hdXRvU3RhcnQuY3Vyc29yRWxlbWVudD1lP3Q6bnVsbH1mdW5jdGlvbiBKdCh0LGUpe3ZhciBuPXQuaW50ZXJhY3RhYmxlLHI9dC5lbGVtZW50LG89dC5wcmVwYXJlZDtpZihcIm1vdXNlXCI9PT10LnBvaW50ZXJUeXBlJiZuJiZuLm9wdGlvbnMuc3R5bGVDdXJzb3Ipe3ZhciBhPVwiXCI7aWYoby5uYW1lKXt2YXIgcz1uLm9wdGlvbnNbby5uYW1lXS5jdXJzb3JDaGVja2VyO2E9aS5kZWZhdWx0LmZ1bmMocyk/cyhvLG4scix0Ll9pbnRlcmFjdGluZyk6ZS5hY3Rpb25zLm1hcFtvLm5hbWVdLmdldEN1cnNvcihvKX1adCh0LmVsZW1lbnQsYXx8XCJcIixlKX1lbHNlIGUuYXV0b1N0YXJ0LmN1cnNvckVsZW1lbnQmJlp0KGUuYXV0b1N0YXJ0LmN1cnNvckVsZW1lbnQsXCJcIixlKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoVnQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksVnQuZGVmYXVsdD12b2lkIDA7dmFyIFF0PXtpZDpcImF1dG8tc3RhcnQvYmFzZVwiLGJlZm9yZTpbXCJhY3Rpb25zXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdFN0YXRpYyxuPXQuZGVmYXVsdHM7dC51c2VQbHVnaW4oQnQuZGVmYXVsdCksbi5iYXNlLmFjdGlvbkNoZWNrZXI9bnVsbCxuLmJhc2Uuc3R5bGVDdXJzb3I9ITAsKDAsai5kZWZhdWx0KShuLnBlckFjdGlvbix7bWFudWFsU3RhcnQ6ITEsbWF4OjEvMCxtYXhQZXJFbGVtZW50OjEsYWxsb3dGcm9tOm51bGwsaWdub3JlRnJvbTpudWxsLG1vdXNlQnV0dG9uczoxfSksZS5tYXhJbnRlcmFjdGlvbnM9ZnVuY3Rpb24oZSl7cmV0dXJuIEt0KGUsdCl9LHQuYXV0b1N0YXJ0PXttYXhJbnRlcmFjdGlvbnM6MS8wLHdpdGhpbkludGVyYWN0aW9uTGltaXQ6SHQsY3Vyc29yRWxlbWVudDpudWxsfX0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpkb3duXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQ7bi5pbnRlcmFjdGluZygpfHxHdChuLCR0KG4scixvLGksZSksZSl9LFwiaW50ZXJhY3Rpb25zOm1vdmVcIjpmdW5jdGlvbih0LGUpeyFmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldDtcIm1vdXNlXCIhPT1uLnBvaW50ZXJUeXBlfHxuLnBvaW50ZXJJc0Rvd258fG4uaW50ZXJhY3RpbmcoKXx8R3QobiwkdChuLHIsbyxpLGUpLGUpfSh0LGUpLGZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbjtpZihuLnBvaW50ZXJJc0Rvd24mJiFuLmludGVyYWN0aW5nKCkmJm4ucG9pbnRlcldhc01vdmVkJiZuLnByZXBhcmVkLm5hbWUpe2UuZmlyZShcImF1dG9TdGFydDpiZWZvcmUtc3RhcnRcIix0KTt2YXIgcj1uLmludGVyYWN0YWJsZSxvPW4ucHJlcGFyZWQubmFtZTtvJiZyJiYoci5vcHRpb25zW29dLm1hbnVhbFN0YXJ0fHwhSHQocixuLmVsZW1lbnQsbi5wcmVwYXJlZCxlKT9uLnN0b3AoKToobi5zdGFydChuLnByZXBhcmVkLHIsbi5lbGVtZW50KSxKdChuLGUpKSl9fSh0LGUpfSxcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9bi5pbnRlcmFjdGFibGU7ciYmci5vcHRpb25zLnN0eWxlQ3Vyc29yJiZadChuLmVsZW1lbnQsXCJcIixlKX19LG1heEludGVyYWN0aW9uczpLdCx3aXRoaW5JbnRlcmFjdGlvbkxpbWl0Okh0LHZhbGlkYXRlQWN0aW9uOk50fTtWdC5kZWZhdWx0PVF0O3ZhciB0ZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdGUuZGVmYXVsdD12b2lkIDA7dmFyIGVlPXtpZDpcImF1dG8tc3RhcnQvZHJhZ0F4aXNcIixsaXN0ZW5lcnM6e1wiYXV0b1N0YXJ0OmJlZm9yZS1zdGFydFwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQuZXZlbnRUYXJnZXQsbz10LmR4LGE9dC5keTtpZihcImRyYWdcIj09PW4ucHJlcGFyZWQubmFtZSl7dmFyIHM9TWF0aC5hYnMobyksbD1NYXRoLmFicyhhKSx1PW4uaW50ZXJhY3RhYmxlLm9wdGlvbnMuZHJhZyxjPXUuc3RhcnRBeGlzLGY9cz5sP1wieFwiOnM8bD9cInlcIjpcInh5XCI7aWYobi5wcmVwYXJlZC5heGlzPVwic3RhcnRcIj09PXUubG9ja0F4aXM/ZlswXTp1LmxvY2tBeGlzLFwieHlcIiE9PWYmJlwieHlcIiE9PWMmJmMhPT1mKXtuLnByZXBhcmVkLm5hbWU9bnVsbDtmb3IodmFyIGQ9cixwPWZ1bmN0aW9uKHQpe2lmKHQhPT1uLmludGVyYWN0YWJsZSl7dmFyIG89bi5pbnRlcmFjdGFibGUub3B0aW9ucy5kcmFnO2lmKCFvLm1hbnVhbFN0YXJ0JiZ0LnRlc3RJZ25vcmVBbGxvdyhvLGQscikpe3ZhciBpPXQuZ2V0QWN0aW9uKG4uZG93blBvaW50ZXIsbi5kb3duRXZlbnQsbixkKTtpZihpJiZcImRyYWdcIj09PWkubmFtZSYmZnVuY3Rpb24odCxlKXtpZighZSlyZXR1cm4hMTt2YXIgbj1lLm9wdGlvbnMuZHJhZy5zdGFydEF4aXM7cmV0dXJuXCJ4eVwiPT09dHx8XCJ4eVwiPT09bnx8bj09PXR9KGYsdCkmJlZ0LmRlZmF1bHQudmFsaWRhdGVBY3Rpb24oaSx0LGQscixlKSlyZXR1cm4gdH19fTtpLmRlZmF1bHQuZWxlbWVudChkKTspe3ZhciB2PWUuaW50ZXJhY3RhYmxlcy5mb3JFYWNoTWF0Y2goZCxwKTtpZih2KXtuLnByZXBhcmVkLm5hbWU9XCJkcmFnXCIsbi5pbnRlcmFjdGFibGU9dixuLmVsZW1lbnQ9ZDticmVha31kPSgwLF8ucGFyZW50Tm9kZSkoZCl9fX19fX07dGUuZGVmYXVsdD1lZTt2YXIgbmU9e307ZnVuY3Rpb24gcmUodCl7dmFyIGU9dC5wcmVwYXJlZCYmdC5wcmVwYXJlZC5uYW1lO2lmKCFlKXJldHVybiBudWxsO3ZhciBuPXQuaW50ZXJhY3RhYmxlLm9wdGlvbnM7cmV0dXJuIG5bZV0uaG9sZHx8bltlXS5kZWxheX1PYmplY3QuZGVmaW5lUHJvcGVydHkobmUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksbmUuZGVmYXVsdD12b2lkIDA7dmFyIG9lPXtpZDpcImF1dG8tc3RhcnQvaG9sZFwiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5kZWZhdWx0czt0LnVzZVBsdWdpbihWdC5kZWZhdWx0KSxlLnBlckFjdGlvbi5ob2xkPTAsZS5wZXJBY3Rpb24uZGVsYXk9MH0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLmF1dG9TdGFydEhvbGRUaW1lcj1udWxsfSxcImF1dG9TdGFydDpwcmVwYXJlZFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj1yZShlKTtuPjAmJihlLmF1dG9TdGFydEhvbGRUaW1lcj1zZXRUaW1lb3V0KChmdW5jdGlvbigpe2Uuc3RhcnQoZS5wcmVwYXJlZCxlLmludGVyYWN0YWJsZSxlLmVsZW1lbnQpfSksbikpfSxcImludGVyYWN0aW9uczptb3ZlXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZHVwbGljYXRlO2UuYXV0b1N0YXJ0SG9sZFRpbWVyJiZlLnBvaW50ZXJXYXNNb3ZlZCYmIW4mJihjbGVhclRpbWVvdXQoZS5hdXRvU3RhcnRIb2xkVGltZXIpLGUuYXV0b1N0YXJ0SG9sZFRpbWVyPW51bGwpfSxcImF1dG9TdGFydDpiZWZvcmUtc3RhcnRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO3JlKGUpPjAmJihlLnByZXBhcmVkLm5hbWU9bnVsbCl9fSxnZXRIb2xkRHVyYXRpb246cmV9O25lLmRlZmF1bHQ9b2U7dmFyIGllPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShpZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxpZS5kZWZhdWx0PXZvaWQgMDt2YXIgYWU9e2lkOlwiYXV0by1zdGFydFwiLGluc3RhbGw6ZnVuY3Rpb24odCl7dC51c2VQbHVnaW4oVnQuZGVmYXVsdCksdC51c2VQbHVnaW4obmUuZGVmYXVsdCksdC51c2VQbHVnaW4odGUuZGVmYXVsdCl9fTtpZS5kZWZhdWx0PWFlO3ZhciBzZT17fTtmdW5jdGlvbiBsZSh0KXtyZXR1cm4vXihhbHdheXN8bmV2ZXJ8YXV0bykkLy50ZXN0KHQpPyh0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHQ9dCx0aGlzKTppLmRlZmF1bHQuYm9vbCh0KT8odGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0PXQ/XCJhbHdheXNcIjpcIm5ldmVyXCIsdGhpcyk6dGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0fWZ1bmN0aW9uIHVlKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmV2ZW50O2UuaW50ZXJhY3RhYmxlJiZlLmludGVyYWN0YWJsZS5jaGVja0FuZFByZXZlbnREZWZhdWx0KG4pfWZ1bmN0aW9uIGNlKHQpe3ZhciBuPXQuSW50ZXJhY3RhYmxlO24ucHJvdG90eXBlLnByZXZlbnREZWZhdWx0PWxlLG4ucHJvdG90eXBlLmNoZWNrQW5kUHJldmVudERlZmF1bHQ9ZnVuY3Rpb24obil7cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXt2YXIgbz10Lm9wdGlvbnMucHJldmVudERlZmF1bHQ7aWYoXCJuZXZlclwiIT09bylpZihcImFsd2F5c1wiIT09byl7aWYobi5ldmVudHMuc3VwcG9ydHNQYXNzaXZlJiYvXnRvdWNoKHN0YXJ0fG1vdmUpJC8udGVzdChyLnR5cGUpKXt2YXIgYT0oMCxlLmdldFdpbmRvdykoci50YXJnZXQpLmRvY3VtZW50LHM9bi5nZXREb2NPcHRpb25zKGEpO2lmKCFzfHwhcy5ldmVudHN8fCExIT09cy5ldmVudHMucGFzc2l2ZSlyZXR1cm59L14obW91c2V8cG9pbnRlcnx0b3VjaCkqKGRvd258c3RhcnQpL2kudGVzdChyLnR5cGUpfHxpLmRlZmF1bHQuZWxlbWVudChyLnRhcmdldCkmJigwLF8ubWF0Y2hlc1NlbGVjdG9yKShyLnRhcmdldCxcImlucHV0LHNlbGVjdCx0ZXh0YXJlYSxbY29udGVudGVkaXRhYmxlPXRydWVdLFtjb250ZW50ZWRpdGFibGU9dHJ1ZV0gKlwiKXx8ci5wcmV2ZW50RGVmYXVsdCgpfWVsc2Ugci5wcmV2ZW50RGVmYXVsdCgpfSh0aGlzLHQsbil9LHQuaW50ZXJhY3Rpb25zLmRvY0V2ZW50cy5wdXNoKHt0eXBlOlwiZHJhZ3N0YXJ0XCIsbGlzdGVuZXI6ZnVuY3Rpb24oZSl7Zm9yKHZhciBuPTA7bjx0LmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtuKyspe3ZhciByPXQuaW50ZXJhY3Rpb25zLmxpc3Rbbl07aWYoci5lbGVtZW50JiYoci5lbGVtZW50PT09ZS50YXJnZXR8fCgwLF8ubm9kZUNvbnRhaW5zKShyLmVsZW1lbnQsZS50YXJnZXQpKSlyZXR1cm4gdm9pZCByLmludGVyYWN0YWJsZS5jaGVja0FuZFByZXZlbnREZWZhdWx0KGUpfX19KX1PYmplY3QuZGVmaW5lUHJvcGVydHkoc2UsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksc2UuaW5zdGFsbD1jZSxzZS5kZWZhdWx0PXZvaWQgMDt2YXIgZmU9e2lkOlwiY29yZS9pbnRlcmFjdGFibGVQcmV2ZW50RGVmYXVsdFwiLGluc3RhbGw6Y2UsbGlzdGVuZXJzOltcImRvd25cIixcIm1vdmVcIixcInVwXCIsXCJjYW5jZWxcIl0ucmVkdWNlKChmdW5jdGlvbih0LGUpe3JldHVybiB0W1wiaW50ZXJhY3Rpb25zOlwiLmNvbmNhdChlKV09dWUsdH0pLHt9KX07c2UuZGVmYXVsdD1mZTt2YXIgZGU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGRlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGRlLmRlZmF1bHQ9dm9pZCAwLGRlLmRlZmF1bHQ9e307dmFyIHBlLHZlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh2ZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx2ZS5kZWZhdWx0PXZvaWQgMCxmdW5jdGlvbih0KXt0LnRvdWNoQWN0aW9uPVwidG91Y2hBY3Rpb25cIix0LmJveFNpemluZz1cImJveFNpemluZ1wiLHQubm9MaXN0ZW5lcnM9XCJub0xpc3RlbmVyc1wifShwZXx8KHBlPXt9KSk7cGUudG91Y2hBY3Rpb24scGUuYm94U2l6aW5nLHBlLm5vTGlzdGVuZXJzO3ZhciBoZT17aWQ6XCJkZXYtdG9vbHNcIixpbnN0YWxsOmZ1bmN0aW9uKCl7fX07dmUuZGVmYXVsdD1oZTt2YXIgZ2U9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGdlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGdlLmRlZmF1bHQ9ZnVuY3Rpb24gdChlKXt2YXIgbj17fTtmb3IodmFyIHIgaW4gZSl7dmFyIG89ZVtyXTtpLmRlZmF1bHQucGxhaW5PYmplY3Qobyk/bltyXT10KG8pOmkuZGVmYXVsdC5hcnJheShvKT9uW3JdPVouZnJvbShvKTpuW3JdPW99cmV0dXJuIG59O3ZhciB5ZT17fTtmdW5jdGlvbiBtZSh0LGUpe3JldHVybiBmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0fSh0KXx8ZnVuY3Rpb24odCxlKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXt2YXIgbj1bXSxyPSEwLG89ITEsaT12b2lkIDA7dHJ5e2Zvcih2YXIgYSxzPXRbU3ltYm9sLml0ZXJhdG9yXSgpOyEocj0oYT1zLm5leHQoKSkuZG9uZSkmJihuLnB1c2goYS52YWx1ZSksIWV8fG4ubGVuZ3RoIT09ZSk7cj0hMCk7fWNhdGNoKHQpe289ITAsaT10fWZpbmFsbHl7dHJ5e3J8fG51bGw9PXMucmV0dXJufHxzLnJldHVybigpfWZpbmFsbHl7aWYobyl0aHJvdyBpfX1yZXR1cm4gbn19KHQsZSl8fGZ1bmN0aW9uKHQsZSl7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIGJlKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9iZSh0LGUpOnZvaWQgMH19KHQsZSl8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX0oKX1mdW5jdGlvbiBiZSh0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9ZnVuY3Rpb24geGUodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIHdlKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoeWUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkseWUuZ2V0UmVjdE9mZnNldD1PZSx5ZS5kZWZhdWx0PXZvaWQgMDt2YXIgX2U9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksd2UodGhpcyxcInN0YXRlc1wiLFtdKSx3ZSh0aGlzLFwic3RhcnRPZmZzZXRcIix7bGVmdDowLHJpZ2h0OjAsdG9wOjAsYm90dG9tOjB9KSx3ZSh0aGlzLFwic3RhcnREZWx0YVwiLHZvaWQgMCksd2UodGhpcyxcInJlc3VsdFwiLHZvaWQgMCksd2UodGhpcyxcImVuZFJlc3VsdFwiLHZvaWQgMCksd2UodGhpcyxcImVkZ2VzXCIsdm9pZCAwKSx3ZSh0aGlzLFwiaW50ZXJhY3Rpb25cIix2b2lkIDApLHRoaXMuaW50ZXJhY3Rpb249ZSx0aGlzLnJlc3VsdD1QZSgpfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcInN0YXJ0XCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj10LnBoYXNlLHI9dGhpcy5pbnRlcmFjdGlvbixvPWZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RhYmxlLm9wdGlvbnNbdC5wcmVwYXJlZC5uYW1lXSxuPWUubW9kaWZpZXJzO3JldHVybiBuJiZuLmxlbmd0aD9uOltcInNuYXBcIixcInNuYXBTaXplXCIsXCJzbmFwRWRnZXNcIixcInJlc3RyaWN0XCIsXCJyZXN0cmljdEVkZ2VzXCIsXCJyZXN0cmljdFNpemVcIl0ubWFwKChmdW5jdGlvbih0KXt2YXIgbj1lW3RdO3JldHVybiBuJiZuLmVuYWJsZWQmJntvcHRpb25zOm4sbWV0aG9kczpuLl9tZXRob2RzfX0pKS5maWx0ZXIoKGZ1bmN0aW9uKHQpe3JldHVybiEhdH0pKX0ocik7dGhpcy5wcmVwYXJlU3RhdGVzKG8pLHRoaXMuZWRnZXM9KDAsai5kZWZhdWx0KSh7fSxyLmVkZ2VzKSx0aGlzLnN0YXJ0T2Zmc2V0PU9lKHIucmVjdCxlKSx0aGlzLnN0YXJ0RGVsdGE9e3g6MCx5OjB9O3ZhciBpPXRoaXMuZmlsbEFyZyh7cGhhc2U6bixwYWdlQ29vcmRzOmUscHJlRW5kOiExfSk7cmV0dXJuIHRoaXMucmVzdWx0PVBlKCksdGhpcy5zdGFydEFsbChpKSx0aGlzLnJlc3VsdD10aGlzLnNldEFsbChpKX19LHtrZXk6XCJmaWxsQXJnXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5pbnRlcmFjdGlvbjtyZXR1cm4gdC5pbnRlcmFjdGlvbj1lLHQuaW50ZXJhY3RhYmxlPWUuaW50ZXJhY3RhYmxlLHQuZWxlbWVudD1lLmVsZW1lbnQsdC5yZWN0PXQucmVjdHx8ZS5yZWN0LHQuZWRnZXM9dGhpcy5lZGdlcyx0LnN0YXJ0T2Zmc2V0PXRoaXMuc3RhcnRPZmZzZXQsdH19LHtrZXk6XCJzdGFydEFsbFwiLHZhbHVlOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dGhpcy5zdGF0ZXMubGVuZ3RoO2UrKyl7dmFyIG49dGhpcy5zdGF0ZXNbZV07bi5tZXRob2RzLnN0YXJ0JiYodC5zdGF0ZT1uLG4ubWV0aG9kcy5zdGFydCh0KSl9fX0se2tleTpcInNldEFsbFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQucGhhc2Usbj10LnByZUVuZCxyPXQuc2tpcE1vZGlmaWVycyxvPXQucmVjdDt0LmNvb3Jkcz0oMCxqLmRlZmF1bHQpKHt9LHQucGFnZUNvb3JkcyksdC5yZWN0PSgwLGouZGVmYXVsdCkoe30sbyk7Zm9yKHZhciBpPXI/dGhpcy5zdGF0ZXMuc2xpY2Uocik6dGhpcy5zdGF0ZXMsYT1QZSh0LmNvb3Jkcyx0LnJlY3QpLHM9MDtzPGkubGVuZ3RoO3MrKyl7dmFyIGwsdT1pW3NdLGM9dS5vcHRpb25zLGY9KDAsai5kZWZhdWx0KSh7fSx0LmNvb3JkcyksZD1udWxsO251bGwhPShsPXUubWV0aG9kcykmJmwuc2V0JiZ0aGlzLnNob3VsZERvKGMsbixlKSYmKHQuc3RhdGU9dSxkPXUubWV0aG9kcy5zZXQodCksay5hZGRFZGdlcyh0aGlzLmludGVyYWN0aW9uLmVkZ2VzLHQucmVjdCx7eDp0LmNvb3Jkcy54LWYueCx5OnQuY29vcmRzLnktZi55fSkpLGEuZXZlbnRQcm9wcy5wdXNoKGQpfWEuZGVsdGEueD10LmNvb3Jkcy54LXQucGFnZUNvb3Jkcy54LGEuZGVsdGEueT10LmNvb3Jkcy55LXQucGFnZUNvb3Jkcy55LGEucmVjdERlbHRhLmxlZnQ9dC5yZWN0LmxlZnQtby5sZWZ0LGEucmVjdERlbHRhLnJpZ2h0PXQucmVjdC5yaWdodC1vLnJpZ2h0LGEucmVjdERlbHRhLnRvcD10LnJlY3QudG9wLW8udG9wLGEucmVjdERlbHRhLmJvdHRvbT10LnJlY3QuYm90dG9tLW8uYm90dG9tO3ZhciBwPXRoaXMucmVzdWx0LmNvb3Jkcyx2PXRoaXMucmVzdWx0LnJlY3Q7aWYocCYmdil7dmFyIGg9YS5yZWN0LmxlZnQhPT12LmxlZnR8fGEucmVjdC5yaWdodCE9PXYucmlnaHR8fGEucmVjdC50b3AhPT12LnRvcHx8YS5yZWN0LmJvdHRvbSE9PXYuYm90dG9tO2EuY2hhbmdlZD1ofHxwLnghPT1hLmNvb3Jkcy54fHxwLnkhPT1hLmNvb3Jkcy55fXJldHVybiBhfX0se2tleTpcImFwcGx5VG9JbnRlcmFjdGlvblwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuaW50ZXJhY3Rpb24sbj10LnBoYXNlLHI9ZS5jb29yZHMuY3VyLG89ZS5jb29yZHMuc3RhcnQsaT10aGlzLnJlc3VsdCxhPXRoaXMuc3RhcnREZWx0YSxzPWkuZGVsdGE7XCJzdGFydFwiPT09biYmKDAsai5kZWZhdWx0KSh0aGlzLnN0YXJ0RGVsdGEsaS5kZWx0YSk7Zm9yKHZhciBsPTA7bDxbW28sYV0sW3Isc11dLmxlbmd0aDtsKyspe3ZhciB1PW1lKFtbbyxhXSxbcixzXV1bbF0sMiksYz11WzBdLGY9dVsxXTtjLnBhZ2UueCs9Zi54LGMucGFnZS55Kz1mLnksYy5jbGllbnQueCs9Zi54LGMuY2xpZW50LnkrPWYueX12YXIgZD10aGlzLnJlc3VsdC5yZWN0RGVsdGEscD10LnJlY3R8fGUucmVjdDtwLmxlZnQrPWQubGVmdCxwLnJpZ2h0Kz1kLnJpZ2h0LHAudG9wKz1kLnRvcCxwLmJvdHRvbSs9ZC5ib3R0b20scC53aWR0aD1wLnJpZ2h0LXAubGVmdCxwLmhlaWdodD1wLmJvdHRvbS1wLnRvcH19LHtrZXk6XCJzZXRBbmRBcHBseVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuaW50ZXJhY3Rpb24sbj10LnBoYXNlLHI9dC5wcmVFbmQsbz10LnNraXBNb2RpZmllcnMsaT10aGlzLnNldEFsbCh0aGlzLmZpbGxBcmcoe3ByZUVuZDpyLHBoYXNlOm4scGFnZUNvb3Jkczp0Lm1vZGlmaWVkQ29vcmRzfHxlLmNvb3Jkcy5jdXIucGFnZX0pKTtpZih0aGlzLnJlc3VsdD1pLCFpLmNoYW5nZWQmJighb3x8bzx0aGlzLnN0YXRlcy5sZW5ndGgpJiZlLmludGVyYWN0aW5nKCkpcmV0dXJuITE7aWYodC5tb2RpZmllZENvb3Jkcyl7dmFyIGE9ZS5jb29yZHMuY3VyLnBhZ2Uscz17eDp0Lm1vZGlmaWVkQ29vcmRzLngtYS54LHk6dC5tb2RpZmllZENvb3Jkcy55LWEueX07aS5jb29yZHMueCs9cy54LGkuY29vcmRzLnkrPXMueSxpLmRlbHRhLngrPXMueCxpLmRlbHRhLnkrPXMueX10aGlzLmFwcGx5VG9JbnRlcmFjdGlvbih0KX19LHtrZXk6XCJiZWZvcmVFbmRcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5ldmVudCxyPXRoaXMuc3RhdGVzO2lmKHImJnIubGVuZ3RoKXtmb3IodmFyIG89ITEsaT0wO2k8ci5sZW5ndGg7aSsrKXt2YXIgYT1yW2ldO3Quc3RhdGU9YTt2YXIgcz1hLm9wdGlvbnMsbD1hLm1ldGhvZHMsdT1sLmJlZm9yZUVuZCYmbC5iZWZvcmVFbmQodCk7aWYodSlyZXR1cm4gdGhpcy5lbmRSZXN1bHQ9dSwhMTtvPW98fCFvJiZ0aGlzLnNob3VsZERvKHMsITAsdC5waGFzZSwhMCl9byYmZS5tb3ZlKHtldmVudDpuLHByZUVuZDohMH0pfX19LHtrZXk6XCJzdG9wXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtpZih0aGlzLnN0YXRlcyYmdGhpcy5zdGF0ZXMubGVuZ3RoKXt2YXIgbj0oMCxqLmRlZmF1bHQpKHtzdGF0ZXM6dGhpcy5zdGF0ZXMsaW50ZXJhY3RhYmxlOmUuaW50ZXJhY3RhYmxlLGVsZW1lbnQ6ZS5lbGVtZW50LHJlY3Q6bnVsbH0sdCk7dGhpcy5maWxsQXJnKG4pO2Zvcih2YXIgcj0wO3I8dGhpcy5zdGF0ZXMubGVuZ3RoO3IrKyl7dmFyIG89dGhpcy5zdGF0ZXNbcl07bi5zdGF0ZT1vLG8ubWV0aG9kcy5zdG9wJiZvLm1ldGhvZHMuc3RvcChuKX10aGlzLnN0YXRlcz1udWxsLHRoaXMuZW5kUmVzdWx0PW51bGx9fX0se2tleTpcInByZXBhcmVTdGF0ZXNcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLnN0YXRlcz1bXTtmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl7dmFyIG49dFtlXSxyPW4ub3B0aW9ucyxvPW4ubWV0aG9kcyxpPW4ubmFtZTt0aGlzLnN0YXRlcy5wdXNoKHtvcHRpb25zOnIsbWV0aG9kczpvLGluZGV4OmUsbmFtZTppfSl9cmV0dXJuIHRoaXMuc3RhdGVzfX0se2tleTpcInJlc3RvcmVJbnRlcmFjdGlvbkNvb3Jkc1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj1lLmNvb3JkcyxyPWUucmVjdCxvPWUubW9kaWZpY2F0aW9uO2lmKG8ucmVzdWx0KXtmb3IodmFyIGk9by5zdGFydERlbHRhLGE9by5yZXN1bHQscz1hLmRlbHRhLGw9YS5yZWN0RGVsdGEsdT1bW24uc3RhcnQsaV0sW24uY3VyLHNdXSxjPTA7Yzx1Lmxlbmd0aDtjKyspe3ZhciBmPW1lKHVbY10sMiksZD1mWzBdLHA9ZlsxXTtkLnBhZ2UueC09cC54LGQucGFnZS55LT1wLnksZC5jbGllbnQueC09cC54LGQuY2xpZW50LnktPXAueX1yLmxlZnQtPWwubGVmdCxyLnJpZ2h0LT1sLnJpZ2h0LHIudG9wLT1sLnRvcCxyLmJvdHRvbS09bC5ib3R0b219fX0se2tleTpcInNob3VsZERvXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4scil7cmV0dXJuISghdHx8ITE9PT10LmVuYWJsZWR8fHImJiF0LmVuZE9ubHl8fHQuZW5kT25seSYmIWV8fFwic3RhcnRcIj09PW4mJiF0LnNldFN0YXJ0KX19LHtrZXk6XCJjb3B5RnJvbVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuc3RhcnRPZmZzZXQ9dC5zdGFydE9mZnNldCx0aGlzLnN0YXJ0RGVsdGE9dC5zdGFydERlbHRhLHRoaXMuZWRnZXM9dC5lZGdlcyx0aGlzLnN0YXRlcz10LnN0YXRlcy5tYXAoKGZ1bmN0aW9uKHQpe3JldHVybigwLGdlLmRlZmF1bHQpKHQpfSkpLHRoaXMucmVzdWx0PVBlKCgwLGouZGVmYXVsdCkoe30sdC5yZXN1bHQuY29vcmRzKSwoMCxqLmRlZmF1bHQpKHt9LHQucmVzdWx0LnJlY3QpKX19LHtrZXk6XCJkZXN0cm95XCIsdmFsdWU6ZnVuY3Rpb24oKXtmb3IodmFyIHQgaW4gdGhpcyl0aGlzW3RdPW51bGx9fV0pJiZ4ZShlLnByb3RvdHlwZSxuKSx0fSgpO2Z1bmN0aW9uIFBlKHQsZSl7cmV0dXJue3JlY3Q6ZSxjb29yZHM6dCxkZWx0YTp7eDowLHk6MH0scmVjdERlbHRhOntsZWZ0OjAscmlnaHQ6MCx0b3A6MCxib3R0b206MH0sZXZlbnRQcm9wczpbXSxjaGFuZ2VkOiEwfX1mdW5jdGlvbiBPZSh0LGUpe3JldHVybiB0P3tsZWZ0OmUueC10LmxlZnQsdG9wOmUueS10LnRvcCxyaWdodDp0LnJpZ2h0LWUueCxib3R0b206dC5ib3R0b20tZS55fTp7bGVmdDowLHRvcDowLHJpZ2h0OjAsYm90dG9tOjB9fXllLmRlZmF1bHQ9X2U7dmFyIFNlPXt9O2Z1bmN0aW9uIEVlKHQpe3ZhciBlPXQuaUV2ZW50LG49dC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24ucmVzdWx0O24mJihlLm1vZGlmaWVycz1uLmV2ZW50UHJvcHMpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxTZS5tYWtlTW9kaWZpZXI9ZnVuY3Rpb24odCxlKXt2YXIgbj10LmRlZmF1bHRzLHI9e3N0YXJ0OnQuc3RhcnQsc2V0OnQuc2V0LGJlZm9yZUVuZDp0LmJlZm9yZUVuZCxzdG9wOnQuc3RvcH0sbz1mdW5jdGlvbih0KXt2YXIgbz10fHx7fTtmb3IodmFyIGkgaW4gby5lbmFibGVkPSExIT09by5lbmFibGVkLG4paSBpbiBvfHwob1tpXT1uW2ldKTt2YXIgYT17b3B0aW9uczpvLG1ldGhvZHM6cixuYW1lOmUsZW5hYmxlOmZ1bmN0aW9uKCl7cmV0dXJuIG8uZW5hYmxlZD0hMCxhfSxkaXNhYmxlOmZ1bmN0aW9uKCl7cmV0dXJuIG8uZW5hYmxlZD0hMSxhfX07cmV0dXJuIGF9O3JldHVybiBlJiZcInN0cmluZ1wiPT10eXBlb2YgZSYmKG8uX2RlZmF1bHRzPW4sby5fbWV0aG9kcz1yKSxvfSxTZS5hZGRFdmVudE1vZGlmaWVycz1FZSxTZS5kZWZhdWx0PXZvaWQgMDt2YXIgVGU9e2lkOlwibW9kaWZpZXJzL2Jhc2VcIixiZWZvcmU6W1wiYWN0aW9uc1wiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3QuZGVmYXVsdHMucGVyQWN0aW9uLm1vZGlmaWVycz1bXX0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2UubW9kaWZpY2F0aW9uPW5ldyB5ZS5kZWZhdWx0KGUpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLXN0YXJ0XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb247ZS5zdGFydCh0LHQuaW50ZXJhY3Rpb24uY29vcmRzLnN0YXJ0LnBhZ2UpLHQuaW50ZXJhY3Rpb24uZWRnZXM9ZS5lZGdlcyxlLmFwcGx5VG9JbnRlcmFjdGlvbih0KX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1tb3ZlXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnNldEFuZEFwcGx5KHQpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLWVuZFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5iZWZvcmVFbmQodCl9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1zdGFydFwiOkVlLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6RWUsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLWVuZFwiOkVlLFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1zdGFydFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN0b3JlSW50ZXJhY3Rpb25Db29yZHModCl9LFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1tb3ZlXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnJlc3RvcmVJbnRlcmFjdGlvbkNvb3Jkcyh0KX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5zdG9wKHQpfX19O1NlLmRlZmF1bHQ9VGU7dmFyIE1lPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShNZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxNZS5kZWZhdWx0cz12b2lkIDAsTWUuZGVmYXVsdHM9e2Jhc2U6e3ByZXZlbnREZWZhdWx0OlwiYXV0b1wiLGRlbHRhU291cmNlOlwicGFnZVwifSxwZXJBY3Rpb246e2VuYWJsZWQ6ITEsb3JpZ2luOnt4OjAseTowfX0sYWN0aW9uczp7fX07dmFyIGplPXt9O2Z1bmN0aW9uIGtlKHQpe3JldHVybihrZT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9ZnVuY3Rpb24gSWUodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIERlKHQsZSl7cmV0dXJuKERlPU9iamVjdC5zZXRQcm90b3R5cGVPZnx8ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5fX3Byb3RvX189ZSx0fSkodCxlKX1mdW5jdGlvbiBBZSh0LGUpe3JldHVybiFlfHxcIm9iamVjdFwiIT09a2UoZSkmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGU/UmUodCk6ZX1mdW5jdGlvbiBSZSh0KXtpZih2b2lkIDA9PT10KXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4gdH1mdW5jdGlvbiB6ZSh0KXtyZXR1cm4oemU9T2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5nZXRQcm90b3R5cGVPZjpmdW5jdGlvbih0KXtyZXR1cm4gdC5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0KX0pKHQpfWZ1bmN0aW9uIENlKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoamUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksamUuSW50ZXJhY3RFdmVudD12b2lkIDA7dmFyIEZlPWZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmRGUodCxlKX0oYSx0KTt2YXIgZSxuLHIsbyxpPShyPWEsbz1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBSZWZsZWN0fHwhUmVmbGVjdC5jb25zdHJ1Y3QpcmV0dXJuITE7aWYoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSlyZXR1cm4hMTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm94eSlyZXR1cm4hMDt0cnl7cmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLFtdLChmdW5jdGlvbigpe30pKSksITB9Y2F0Y2godCl7cmV0dXJuITF9fSgpLGZ1bmN0aW9uKCl7dmFyIHQsZT16ZShyKTtpZihvKXt2YXIgbj16ZSh0aGlzKS5jb25zdHJ1Y3Rvcjt0PVJlZmxlY3QuY29uc3RydWN0KGUsYXJndW1lbnRzLG4pfWVsc2UgdD1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gQWUodGhpcyx0KX0pO2Z1bmN0aW9uIGEodCxlLG4scixvLHMsbCl7dmFyIHU7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyxhKSxDZShSZSh1PWkuY2FsbCh0aGlzLHQpKSxcInRhcmdldFwiLHZvaWQgMCksQ2UoUmUodSksXCJjdXJyZW50VGFyZ2V0XCIsdm9pZCAwKSxDZShSZSh1KSxcInJlbGF0ZWRUYXJnZXRcIixudWxsKSxDZShSZSh1KSxcInNjcmVlblhcIix2b2lkIDApLENlKFJlKHUpLFwic2NyZWVuWVwiLHZvaWQgMCksQ2UoUmUodSksXCJidXR0b25cIix2b2lkIDApLENlKFJlKHUpLFwiYnV0dG9uc1wiLHZvaWQgMCksQ2UoUmUodSksXCJjdHJsS2V5XCIsdm9pZCAwKSxDZShSZSh1KSxcInNoaWZ0S2V5XCIsdm9pZCAwKSxDZShSZSh1KSxcImFsdEtleVwiLHZvaWQgMCksQ2UoUmUodSksXCJtZXRhS2V5XCIsdm9pZCAwKSxDZShSZSh1KSxcInBhZ2VcIix2b2lkIDApLENlKFJlKHUpLFwiY2xpZW50XCIsdm9pZCAwKSxDZShSZSh1KSxcImRlbHRhXCIsdm9pZCAwKSxDZShSZSh1KSxcInJlY3RcIix2b2lkIDApLENlKFJlKHUpLFwieDBcIix2b2lkIDApLENlKFJlKHUpLFwieTBcIix2b2lkIDApLENlKFJlKHUpLFwidDBcIix2b2lkIDApLENlKFJlKHUpLFwiZHRcIix2b2lkIDApLENlKFJlKHUpLFwiZHVyYXRpb25cIix2b2lkIDApLENlKFJlKHUpLFwiY2xpZW50WDBcIix2b2lkIDApLENlKFJlKHUpLFwiY2xpZW50WTBcIix2b2lkIDApLENlKFJlKHUpLFwidmVsb2NpdHlcIix2b2lkIDApLENlKFJlKHUpLFwic3BlZWRcIix2b2lkIDApLENlKFJlKHUpLFwic3dpcGVcIix2b2lkIDApLENlKFJlKHUpLFwidGltZVN0YW1wXCIsdm9pZCAwKSxDZShSZSh1KSxcImF4ZXNcIix2b2lkIDApLENlKFJlKHUpLFwicHJlRW5kXCIsdm9pZCAwKSxvPW98fHQuZWxlbWVudDt2YXIgYz10LmludGVyYWN0YWJsZSxmPShjJiZjLm9wdGlvbnN8fE1lLmRlZmF1bHRzKS5kZWx0YVNvdXJjZSxkPSgwLEEuZGVmYXVsdCkoYyxvLG4pLHA9XCJzdGFydFwiPT09cix2PVwiZW5kXCI9PT1yLGg9cD9SZSh1KTp0LnByZXZFdmVudCxnPXA/dC5jb29yZHMuc3RhcnQ6dj97cGFnZTpoLnBhZ2UsY2xpZW50OmguY2xpZW50LHRpbWVTdGFtcDp0LmNvb3Jkcy5jdXIudGltZVN0YW1wfTp0LmNvb3Jkcy5jdXI7cmV0dXJuIHUucGFnZT0oMCxqLmRlZmF1bHQpKHt9LGcucGFnZSksdS5jbGllbnQ9KDAsai5kZWZhdWx0KSh7fSxnLmNsaWVudCksdS5yZWN0PSgwLGouZGVmYXVsdCkoe30sdC5yZWN0KSx1LnRpbWVTdGFtcD1nLnRpbWVTdGFtcCx2fHwodS5wYWdlLngtPWQueCx1LnBhZ2UueS09ZC55LHUuY2xpZW50LngtPWQueCx1LmNsaWVudC55LT1kLnkpLHUuY3RybEtleT1lLmN0cmxLZXksdS5hbHRLZXk9ZS5hbHRLZXksdS5zaGlmdEtleT1lLnNoaWZ0S2V5LHUubWV0YUtleT1lLm1ldGFLZXksdS5idXR0b249ZS5idXR0b24sdS5idXR0b25zPWUuYnV0dG9ucyx1LnRhcmdldD1vLHUuY3VycmVudFRhcmdldD1vLHUucHJlRW5kPXMsdS50eXBlPWx8fG4rKHJ8fFwiXCIpLHUuaW50ZXJhY3RhYmxlPWMsdS50MD1wP3QucG9pbnRlcnNbdC5wb2ludGVycy5sZW5ndGgtMV0uZG93blRpbWU6aC50MCx1LngwPXQuY29vcmRzLnN0YXJ0LnBhZ2UueC1kLngsdS55MD10LmNvb3Jkcy5zdGFydC5wYWdlLnktZC55LHUuY2xpZW50WDA9dC5jb29yZHMuc3RhcnQuY2xpZW50LngtZC54LHUuY2xpZW50WTA9dC5jb29yZHMuc3RhcnQuY2xpZW50LnktZC55LHUuZGVsdGE9cHx8dj97eDowLHk6MH06e3g6dVtmXS54LWhbZl0ueCx5OnVbZl0ueS1oW2ZdLnl9LHUuZHQ9dC5jb29yZHMuZGVsdGEudGltZVN0YW1wLHUuZHVyYXRpb249dS50aW1lU3RhbXAtdS50MCx1LnZlbG9jaXR5PSgwLGouZGVmYXVsdCkoe30sdC5jb29yZHMudmVsb2NpdHlbZl0pLHUuc3BlZWQ9KDAsQy5kZWZhdWx0KSh1LnZlbG9jaXR5LngsdS52ZWxvY2l0eS55KSx1LnN3aXBlPXZ8fFwiaW5lcnRpYXN0YXJ0XCI9PT1yP3UuZ2V0U3dpcGUoKTpudWxsLHV9cmV0dXJuIGU9YSwobj1be2tleTpcImdldFN3aXBlXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLl9pbnRlcmFjdGlvbjtpZih0LnByZXZFdmVudC5zcGVlZDw2MDB8fHRoaXMudGltZVN0YW1wLXQucHJldkV2ZW50LnRpbWVTdGFtcD4xNTApcmV0dXJuIG51bGw7dmFyIGU9MTgwKk1hdGguYXRhbjIodC5wcmV2RXZlbnQudmVsb2NpdHlZLHQucHJldkV2ZW50LnZlbG9jaXR5WCkvTWF0aC5QSTtlPDAmJihlKz0zNjApO3ZhciBuPTExMi41PD1lJiZlPDI0Ny41LHI9MjAyLjU8PWUmJmU8MzM3LjU7cmV0dXJue3VwOnIsZG93bjohciYmMjIuNTw9ZSYmZTwxNTcuNSxsZWZ0Om4scmlnaHQ6IW4mJigyOTIuNTw9ZXx8ZTw2Ny41KSxhbmdsZTplLHNwZWVkOnQucHJldkV2ZW50LnNwZWVkLHZlbG9jaXR5Ont4OnQucHJldkV2ZW50LnZlbG9jaXR5WCx5OnQucHJldkV2ZW50LnZlbG9jaXR5WX19fX0se2tleTpcInByZXZlbnREZWZhdWx0XCIsdmFsdWU6ZnVuY3Rpb24oKXt9fSx7a2V5Olwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZD10aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19LHtrZXk6XCJzdG9wUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX1dKSYmSWUoZS5wcm90b3R5cGUsbiksYX0oJC5CYXNlRXZlbnQpO2plLkludGVyYWN0RXZlbnQ9RmUsT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRmUucHJvdG90eXBlLHtwYWdlWDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucGFnZS54fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5wYWdlLng9dH19LHBhZ2VZOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5wYWdlLnl9LHNldDpmdW5jdGlvbih0KXt0aGlzLnBhZ2UueT10fX0sY2xpZW50WDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2xpZW50Lnh9LHNldDpmdW5jdGlvbih0KXt0aGlzLmNsaWVudC54PXR9fSxjbGllbnRZOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jbGllbnQueX0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMuY2xpZW50Lnk9dH19LGR4OntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kZWx0YS54fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5kZWx0YS54PXR9fSxkeTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGVsdGEueX0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMuZGVsdGEueT10fX0sdmVsb2NpdHlYOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52ZWxvY2l0eS54fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy52ZWxvY2l0eS54PXR9fSx2ZWxvY2l0eVk6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnZlbG9jaXR5Lnl9LHNldDpmdW5jdGlvbih0KXt0aGlzLnZlbG9jaXR5Lnk9dH19fSk7dmFyIFhlPXt9O2Z1bmN0aW9uIFllKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoWGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWGUuUG9pbnRlckluZm89dm9pZCAwLFhlLlBvaW50ZXJJbmZvPWZ1bmN0aW9uIHQoZSxuLHIsbyxpKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLFllKHRoaXMsXCJpZFwiLHZvaWQgMCksWWUodGhpcyxcInBvaW50ZXJcIix2b2lkIDApLFllKHRoaXMsXCJldmVudFwiLHZvaWQgMCksWWUodGhpcyxcImRvd25UaW1lXCIsdm9pZCAwKSxZZSh0aGlzLFwiZG93blRhcmdldFwiLHZvaWQgMCksdGhpcy5pZD1lLHRoaXMucG9pbnRlcj1uLHRoaXMuZXZlbnQ9cix0aGlzLmRvd25UaW1lPW8sdGhpcy5kb3duVGFyZ2V0PWl9O3ZhciBCZSxXZSxMZT17fTtmdW5jdGlvbiBVZSh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gVmUodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShMZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoTGUsXCJQb2ludGVySW5mb1wiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBYZS5Qb2ludGVySW5mb319KSxMZS5kZWZhdWx0PUxlLkludGVyYWN0aW9uPUxlLl9Qcm94eU1ldGhvZHM9TGUuX1Byb3h5VmFsdWVzPXZvaWQgMCxMZS5fUHJveHlWYWx1ZXM9QmUsZnVuY3Rpb24odCl7dC5pbnRlcmFjdGFibGU9XCJcIix0LmVsZW1lbnQ9XCJcIix0LnByZXBhcmVkPVwiXCIsdC5wb2ludGVySXNEb3duPVwiXCIsdC5wb2ludGVyV2FzTW92ZWQ9XCJcIix0Ll9wcm94eT1cIlwifShCZXx8KExlLl9Qcm94eVZhbHVlcz1CZT17fSkpLExlLl9Qcm94eU1ldGhvZHM9V2UsZnVuY3Rpb24odCl7dC5zdGFydD1cIlwiLHQubW92ZT1cIlwiLHQuZW5kPVwiXCIsdC5zdG9wPVwiXCIsdC5pbnRlcmFjdGluZz1cIlwifShXZXx8KExlLl9Qcm94eU1ldGhvZHM9V2U9e30pKTt2YXIgTmU9MCxxZT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7dmFyIG49dGhpcyxyPWUucG9pbnRlclR5cGUsbz1lLnNjb3BlRmlyZTshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLFZlKHRoaXMsXCJpbnRlcmFjdGFibGVcIixudWxsKSxWZSh0aGlzLFwiZWxlbWVudFwiLG51bGwpLFZlKHRoaXMsXCJyZWN0XCIsdm9pZCAwKSxWZSh0aGlzLFwiX3JlY3RzXCIsdm9pZCAwKSxWZSh0aGlzLFwiZWRnZXNcIix2b2lkIDApLFZlKHRoaXMsXCJfc2NvcGVGaXJlXCIsdm9pZCAwKSxWZSh0aGlzLFwicHJlcGFyZWRcIix7bmFtZTpudWxsLGF4aXM6bnVsbCxlZGdlczpudWxsfSksVmUodGhpcyxcInBvaW50ZXJUeXBlXCIsdm9pZCAwKSxWZSh0aGlzLFwicG9pbnRlcnNcIixbXSksVmUodGhpcyxcImRvd25FdmVudFwiLG51bGwpLFZlKHRoaXMsXCJkb3duUG9pbnRlclwiLHt9KSxWZSh0aGlzLFwiX2xhdGVzdFBvaW50ZXJcIix7cG9pbnRlcjpudWxsLGV2ZW50Om51bGwsZXZlbnRUYXJnZXQ6bnVsbH0pLFZlKHRoaXMsXCJwcmV2RXZlbnRcIixudWxsKSxWZSh0aGlzLFwicG9pbnRlcklzRG93blwiLCExKSxWZSh0aGlzLFwicG9pbnRlcldhc01vdmVkXCIsITEpLFZlKHRoaXMsXCJfaW50ZXJhY3RpbmdcIiwhMSksVmUodGhpcyxcIl9lbmRpbmdcIiwhMSksVmUodGhpcyxcIl9zdG9wcGVkXCIsITApLFZlKHRoaXMsXCJfcHJveHlcIixudWxsKSxWZSh0aGlzLFwic2ltdWxhdGlvblwiLG51bGwpLFZlKHRoaXMsXCJkb01vdmVcIiwoMCxZdC53YXJuT25jZSkoKGZ1bmN0aW9uKHQpe3RoaXMubW92ZSh0KX0pLFwiVGhlIGludGVyYWN0aW9uLmRvTW92ZSgpIG1ldGhvZCBoYXMgYmVlbiByZW5hbWVkIHRvIGludGVyYWN0aW9uLm1vdmUoKVwiKSksVmUodGhpcyxcImNvb3Jkc1wiLHtzdGFydDpCLm5ld0Nvb3JkcygpLHByZXY6Qi5uZXdDb29yZHMoKSxjdXI6Qi5uZXdDb29yZHMoKSxkZWx0YTpCLm5ld0Nvb3JkcygpLHZlbG9jaXR5OkIubmV3Q29vcmRzKCl9KSxWZSh0aGlzLFwiX2lkXCIsTmUrKyksdGhpcy5fc2NvcGVGaXJlPW8sdGhpcy5wb2ludGVyVHlwZT1yO3ZhciBpPXRoaXM7dGhpcy5fcHJveHk9e307dmFyIGE9ZnVuY3Rpb24odCl7T2JqZWN0LmRlZmluZVByb3BlcnR5KG4uX3Byb3h5LHQse2dldDpmdW5jdGlvbigpe3JldHVybiBpW3RdfX0pfTtmb3IodmFyIHMgaW4gQmUpYShzKTt2YXIgbD1mdW5jdGlvbih0KXtPYmplY3QuZGVmaW5lUHJvcGVydHkobi5fcHJveHksdCx7dmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gaVt0XS5hcHBseShpLGFyZ3VtZW50cyl9fSl9O2Zvcih2YXIgdSBpbiBXZSlsKHUpO3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpuZXdcIix7aW50ZXJhY3Rpb246dGhpc30pfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcInBvaW50ZXJNb3ZlVG9sZXJhbmNlXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIDF9fSx7a2V5OlwicG9pbnRlckRvd25cIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7dmFyIHI9dGhpcy51cGRhdGVQb2ludGVyKHQsZSxuLCEwKSxvPXRoaXMucG9pbnRlcnNbcl07dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOmRvd25cIix7cG9pbnRlcjp0LGV2ZW50OmUsZXZlbnRUYXJnZXQ6bixwb2ludGVySW5kZXg6cixwb2ludGVySW5mbzpvLHR5cGU6XCJkb3duXCIsaW50ZXJhY3Rpb246dGhpc30pfX0se2tleTpcInN0YXJ0XCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiEodGhpcy5pbnRlcmFjdGluZygpfHwhdGhpcy5wb2ludGVySXNEb3dufHx0aGlzLnBvaW50ZXJzLmxlbmd0aDwoXCJnZXN0dXJlXCI9PT10Lm5hbWU/MjoxKXx8IWUub3B0aW9uc1t0Lm5hbWVdLmVuYWJsZWQpJiYoKDAsWXQuY29weUFjdGlvbikodGhpcy5wcmVwYXJlZCx0KSx0aGlzLmludGVyYWN0YWJsZT1lLHRoaXMuZWxlbWVudD1uLHRoaXMucmVjdD1lLmdldFJlY3QobiksdGhpcy5lZGdlcz10aGlzLnByZXBhcmVkLmVkZ2VzPygwLGouZGVmYXVsdCkoe30sdGhpcy5wcmVwYXJlZC5lZGdlcyk6e2xlZnQ6ITAscmlnaHQ6ITAsdG9wOiEwLGJvdHRvbTohMH0sdGhpcy5fc3RvcHBlZD0hMSx0aGlzLl9pbnRlcmFjdGluZz10aGlzLl9kb1BoYXNlKHtpbnRlcmFjdGlvbjp0aGlzLGV2ZW50OnRoaXMuZG93bkV2ZW50LHBoYXNlOlwic3RhcnRcIn0pJiYhdGhpcy5fc3RvcHBlZCx0aGlzLl9pbnRlcmFjdGluZyl9fSx7a2V5OlwicG9pbnRlck1vdmVcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7dGhpcy5zaW11bGF0aW9ufHx0aGlzLm1vZGlmaWNhdGlvbiYmdGhpcy5tb2RpZmljYXRpb24uZW5kUmVzdWx0fHx0aGlzLnVwZGF0ZVBvaW50ZXIodCxlLG4sITEpO3ZhciByLG8saT10aGlzLmNvb3Jkcy5jdXIucGFnZS54PT09dGhpcy5jb29yZHMucHJldi5wYWdlLngmJnRoaXMuY29vcmRzLmN1ci5wYWdlLnk9PT10aGlzLmNvb3Jkcy5wcmV2LnBhZ2UueSYmdGhpcy5jb29yZHMuY3VyLmNsaWVudC54PT09dGhpcy5jb29yZHMucHJldi5jbGllbnQueCYmdGhpcy5jb29yZHMuY3VyLmNsaWVudC55PT09dGhpcy5jb29yZHMucHJldi5jbGllbnQueTt0aGlzLnBvaW50ZXJJc0Rvd24mJiF0aGlzLnBvaW50ZXJXYXNNb3ZlZCYmKHI9dGhpcy5jb29yZHMuY3VyLmNsaWVudC54LXRoaXMuY29vcmRzLnN0YXJ0LmNsaWVudC54LG89dGhpcy5jb29yZHMuY3VyLmNsaWVudC55LXRoaXMuY29vcmRzLnN0YXJ0LmNsaWVudC55LHRoaXMucG9pbnRlcldhc01vdmVkPSgwLEMuZGVmYXVsdCkocixvKT50aGlzLnBvaW50ZXJNb3ZlVG9sZXJhbmNlKTt2YXIgYT10aGlzLmdldFBvaW50ZXJJbmRleCh0KSxzPXtwb2ludGVyOnQscG9pbnRlckluZGV4OmEscG9pbnRlckluZm86dGhpcy5wb2ludGVyc1thXSxldmVudDplLHR5cGU6XCJtb3ZlXCIsZXZlbnRUYXJnZXQ6bixkeDpyLGR5Om8sZHVwbGljYXRlOmksaW50ZXJhY3Rpb246dGhpc307aXx8Qi5zZXRDb29yZFZlbG9jaXR5KHRoaXMuY29vcmRzLnZlbG9jaXR5LHRoaXMuY29vcmRzLmRlbHRhKSx0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6bW92ZVwiLHMpLGl8fHRoaXMuc2ltdWxhdGlvbnx8KHRoaXMuaW50ZXJhY3RpbmcoKSYmKHMudHlwZT1udWxsLHRoaXMubW92ZShzKSksdGhpcy5wb2ludGVyV2FzTW92ZWQmJkIuY29weUNvb3Jkcyh0aGlzLmNvb3Jkcy5wcmV2LHRoaXMuY29vcmRzLmN1cikpfX0se2tleTpcIm1vdmVcIix2YWx1ZTpmdW5jdGlvbih0KXt0JiZ0LmV2ZW50fHxCLnNldFplcm9Db29yZHModGhpcy5jb29yZHMuZGVsdGEpLCh0PSgwLGouZGVmYXVsdCkoe3BvaW50ZXI6dGhpcy5fbGF0ZXN0UG9pbnRlci5wb2ludGVyLGV2ZW50OnRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnQsZXZlbnRUYXJnZXQ6dGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudFRhcmdldCxpbnRlcmFjdGlvbjp0aGlzfSx0fHx7fSkpLnBoYXNlPVwibW92ZVwiLHRoaXMuX2RvUGhhc2UodCl9fSx7a2V5OlwicG9pbnRlclVwXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4scil7dmFyIG89dGhpcy5nZXRQb2ludGVySW5kZXgodCk7LTE9PT1vJiYobz10aGlzLnVwZGF0ZVBvaW50ZXIodCxlLG4sITEpKTt2YXIgaT0vY2FuY2VsJC9pLnRlc3QoZS50eXBlKT9cImNhbmNlbFwiOlwidXBcIjt0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6XCIuY29uY2F0KGkpLHtwb2ludGVyOnQscG9pbnRlckluZGV4Om8scG9pbnRlckluZm86dGhpcy5wb2ludGVyc1tvXSxldmVudDplLGV2ZW50VGFyZ2V0Om4sdHlwZTppLGN1ckV2ZW50VGFyZ2V0OnIsaW50ZXJhY3Rpb246dGhpc30pLHRoaXMuc2ltdWxhdGlvbnx8dGhpcy5lbmQoZSksdGhpcy5yZW1vdmVQb2ludGVyKHQsZSl9fSx7a2V5OlwiZG9jdW1lbnRCbHVyXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5lbmQodCksdGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOmJsdXJcIix7ZXZlbnQ6dCx0eXBlOlwiYmx1clwiLGludGVyYWN0aW9uOnRoaXN9KX19LHtrZXk6XCJlbmRcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZTt0aGlzLl9lbmRpbmc9ITAsdD10fHx0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50LHRoaXMuaW50ZXJhY3RpbmcoKSYmKGU9dGhpcy5fZG9QaGFzZSh7ZXZlbnQ6dCxpbnRlcmFjdGlvbjp0aGlzLHBoYXNlOlwiZW5kXCJ9KSksdGhpcy5fZW5kaW5nPSExLCEwPT09ZSYmdGhpcy5zdG9wKCl9fSx7a2V5OlwiY3VycmVudEFjdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2ludGVyYWN0aW5nP3RoaXMucHJlcGFyZWQubmFtZTpudWxsfX0se2tleTpcImludGVyYWN0aW5nXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faW50ZXJhY3Rpbmd9fSx7a2V5Olwic3RvcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOnN0b3BcIix7aW50ZXJhY3Rpb246dGhpc30pLHRoaXMuaW50ZXJhY3RhYmxlPXRoaXMuZWxlbWVudD1udWxsLHRoaXMuX2ludGVyYWN0aW5nPSExLHRoaXMuX3N0b3BwZWQ9ITAsdGhpcy5wcmVwYXJlZC5uYW1lPXRoaXMucHJldkV2ZW50PW51bGx9fSx7a2V5OlwiZ2V0UG9pbnRlckluZGV4XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9Qi5nZXRQb2ludGVySWQodCk7cmV0dXJuXCJtb3VzZVwiPT09dGhpcy5wb2ludGVyVHlwZXx8XCJwZW5cIj09PXRoaXMucG9pbnRlclR5cGU/dGhpcy5wb2ludGVycy5sZW5ndGgtMTpaLmZpbmRJbmRleCh0aGlzLnBvaW50ZXJzLChmdW5jdGlvbih0KXtyZXR1cm4gdC5pZD09PWV9KSl9fSx7a2V5OlwiZ2V0UG9pbnRlckluZm9cIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5wb2ludGVyc1t0aGlzLmdldFBvaW50ZXJJbmRleCh0KV19fSx7a2V5OlwidXBkYXRlUG9pbnRlclwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuLHIpe3ZhciBvPUIuZ2V0UG9pbnRlcklkKHQpLGk9dGhpcy5nZXRQb2ludGVySW5kZXgodCksYT10aGlzLnBvaW50ZXJzW2ldO3JldHVybiByPSExIT09ciYmKHJ8fC8oZG93bnxzdGFydCkkL2kudGVzdChlLnR5cGUpKSxhP2EucG9pbnRlcj10OihhPW5ldyBYZS5Qb2ludGVySW5mbyhvLHQsZSxudWxsLG51bGwpLGk9dGhpcy5wb2ludGVycy5sZW5ndGgsdGhpcy5wb2ludGVycy5wdXNoKGEpKSxCLnNldENvb3Jkcyh0aGlzLmNvb3Jkcy5jdXIsdGhpcy5wb2ludGVycy5tYXAoKGZ1bmN0aW9uKHQpe3JldHVybiB0LnBvaW50ZXJ9KSksdGhpcy5fbm93KCkpLEIuc2V0Q29vcmREZWx0YXModGhpcy5jb29yZHMuZGVsdGEsdGhpcy5jb29yZHMucHJldix0aGlzLmNvb3Jkcy5jdXIpLHImJih0aGlzLnBvaW50ZXJJc0Rvd249ITAsYS5kb3duVGltZT10aGlzLmNvb3Jkcy5jdXIudGltZVN0YW1wLGEuZG93blRhcmdldD1uLEIucG9pbnRlckV4dGVuZCh0aGlzLmRvd25Qb2ludGVyLHQpLHRoaXMuaW50ZXJhY3RpbmcoKXx8KEIuY29weUNvb3Jkcyh0aGlzLmNvb3Jkcy5zdGFydCx0aGlzLmNvb3Jkcy5jdXIpLEIuY29weUNvb3Jkcyh0aGlzLmNvb3Jkcy5wcmV2LHRoaXMuY29vcmRzLmN1ciksdGhpcy5kb3duRXZlbnQ9ZSx0aGlzLnBvaW50ZXJXYXNNb3ZlZD0hMSkpLHRoaXMuX3VwZGF0ZUxhdGVzdFBvaW50ZXIodCxlLG4pLHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczp1cGRhdGUtcG9pbnRlclwiLHtwb2ludGVyOnQsZXZlbnQ6ZSxldmVudFRhcmdldDpuLGRvd246cixwb2ludGVySW5mbzphLHBvaW50ZXJJbmRleDppLGludGVyYWN0aW9uOnRoaXN9KSxpfX0se2tleTpcInJlbW92ZVBvaW50ZXJcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPXRoaXMuZ2V0UG9pbnRlckluZGV4KHQpO2lmKC0xIT09bil7dmFyIHI9dGhpcy5wb2ludGVyc1tuXTt0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6cmVtb3ZlLXBvaW50ZXJcIix7cG9pbnRlcjp0LGV2ZW50OmUsZXZlbnRUYXJnZXQ6bnVsbCxwb2ludGVySW5kZXg6bixwb2ludGVySW5mbzpyLGludGVyYWN0aW9uOnRoaXN9KSx0aGlzLnBvaW50ZXJzLnNwbGljZShuLDEpLHRoaXMucG9pbnRlcklzRG93bj0hMX19fSx7a2V5OlwiX3VwZGF0ZUxhdGVzdFBvaW50ZXJcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7dGhpcy5fbGF0ZXN0UG9pbnRlci5wb2ludGVyPXQsdGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudD1lLHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnRUYXJnZXQ9bn19LHtrZXk6XCJkZXN0cm95XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9sYXRlc3RQb2ludGVyLnBvaW50ZXI9bnVsbCx0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50PW51bGwsdGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudFRhcmdldD1udWxsfX0se2tleTpcIl9jcmVhdGVQcmVwYXJlZEV2ZW50XCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4scil7cmV0dXJuIG5ldyBqZS5JbnRlcmFjdEV2ZW50KHRoaXMsdCx0aGlzLnByZXBhcmVkLm5hbWUsZSx0aGlzLmVsZW1lbnQsbixyKX19LHtrZXk6XCJfZmlyZUV2ZW50XCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5pbnRlcmFjdGFibGUuZmlyZSh0KSwoIXRoaXMucHJldkV2ZW50fHx0LnRpbWVTdGFtcD49dGhpcy5wcmV2RXZlbnQudGltZVN0YW1wKSYmKHRoaXMucHJldkV2ZW50PXQpfX0se2tleTpcIl9kb1BoYXNlXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5ldmVudCxuPXQucGhhc2Uscj10LnByZUVuZCxvPXQudHlwZSxpPXRoaXMucmVjdDtpZihpJiZcIm1vdmVcIj09PW4mJihrLmFkZEVkZ2VzKHRoaXMuZWRnZXMsaSx0aGlzLmNvb3Jkcy5kZWx0YVt0aGlzLmludGVyYWN0YWJsZS5vcHRpb25zLmRlbHRhU291cmNlXSksaS53aWR0aD1pLnJpZ2h0LWkubGVmdCxpLmhlaWdodD1pLmJvdHRvbS1pLnRvcCksITE9PT10aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1cIi5jb25jYXQobiksdCkpcmV0dXJuITE7dmFyIGE9dC5pRXZlbnQ9dGhpcy5fY3JlYXRlUHJlcGFyZWRFdmVudChlLG4scixvKTtyZXR1cm4gdGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1cIi5jb25jYXQobiksdCksXCJzdGFydFwiPT09biYmKHRoaXMucHJldkV2ZW50PWEpLHRoaXMuX2ZpcmVFdmVudChhKSx0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLVwiLmNvbmNhdChuKSx0KSwhMH19LHtrZXk6XCJfbm93XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX19XSkmJlVlKGUucHJvdG90eXBlLG4pLHR9KCk7TGUuSW50ZXJhY3Rpb249cWU7dmFyICRlPXFlO0xlLmRlZmF1bHQ9JGU7dmFyIEdlPXt9O2Z1bmN0aW9uIEhlKHQpe3QucG9pbnRlcklzRG93biYmKFFlKHQuY29vcmRzLmN1cix0Lm9mZnNldC50b3RhbCksdC5vZmZzZXQucGVuZGluZy54PTAsdC5vZmZzZXQucGVuZGluZy55PTApfWZ1bmN0aW9uIEtlKHQpe1plKHQuaW50ZXJhY3Rpb24pfWZ1bmN0aW9uIFplKHQpe2lmKCFmdW5jdGlvbih0KXtyZXR1cm4hKCF0Lm9mZnNldC5wZW5kaW5nLngmJiF0Lm9mZnNldC5wZW5kaW5nLnkpfSh0KSlyZXR1cm4hMTt2YXIgZT10Lm9mZnNldC5wZW5kaW5nO3JldHVybiBRZSh0LmNvb3Jkcy5jdXIsZSksUWUodC5jb29yZHMuZGVsdGEsZSksay5hZGRFZGdlcyh0LmVkZ2VzLHQucmVjdCxlKSxlLng9MCxlLnk9MCwhMH1mdW5jdGlvbiBKZSh0KXt2YXIgZT10Lngsbj10Lnk7dGhpcy5vZmZzZXQucGVuZGluZy54Kz1lLHRoaXMub2Zmc2V0LnBlbmRpbmcueSs9bix0aGlzLm9mZnNldC50b3RhbC54Kz1lLHRoaXMub2Zmc2V0LnRvdGFsLnkrPW59ZnVuY3Rpb24gUWUodCxlKXt2YXIgbj10LnBhZ2Uscj10LmNsaWVudCxvPWUueCxpPWUueTtuLngrPW8sbi55Kz1pLHIueCs9byxyLnkrPWl9T2JqZWN0LmRlZmluZVByb3BlcnR5KEdlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEdlLmFkZFRvdGFsPUhlLEdlLmFwcGx5UGVuZGluZz1aZSxHZS5kZWZhdWx0PXZvaWQgMCxMZS5fUHJveHlNZXRob2RzLm9mZnNldEJ5PVwiXCI7dmFyIHRuPXtpZDpcIm9mZnNldFwiLGJlZm9yZTpbXCJtb2RpZmllcnNcIixcInBvaW50ZXItZXZlbnRzXCIsXCJhY3Rpb25zXCIsXCJpbmVydGlhXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dC5JbnRlcmFjdGlvbi5wcm90b3R5cGUub2Zmc2V0Qnk9SmV9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dC5pbnRlcmFjdGlvbi5vZmZzZXQ9e3RvdGFsOnt4OjAseTowfSxwZW5kaW5nOnt4OjAseTowfX19LFwiaW50ZXJhY3Rpb25zOnVwZGF0ZS1wb2ludGVyXCI6ZnVuY3Rpb24odCl7cmV0dXJuIEhlKHQuaW50ZXJhY3Rpb24pfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLXN0YXJ0XCI6S2UsXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1tb3ZlXCI6S2UsXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1lbmRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2lmKFplKGUpKXJldHVybiBlLm1vdmUoe29mZnNldDohMH0pLGUuZW5kKCksITF9LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2Uub2Zmc2V0LnRvdGFsLng9MCxlLm9mZnNldC50b3RhbC55PTAsZS5vZmZzZXQucGVuZGluZy54PTAsZS5vZmZzZXQucGVuZGluZy55PTB9fX07R2UuZGVmYXVsdD10bjt2YXIgZW49e307ZnVuY3Rpb24gbm4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIHJuKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoZW4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZW4uZGVmYXVsdD1lbi5JbmVydGlhU3RhdGU9dm9pZCAwO3ZhciBvbj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxybih0aGlzLFwiYWN0aXZlXCIsITEpLHJuKHRoaXMsXCJpc01vZGlmaWVkXCIsITEpLHJuKHRoaXMsXCJzbW9vdGhFbmRcIiwhMSkscm4odGhpcyxcImFsbG93UmVzdW1lXCIsITEpLHJuKHRoaXMsXCJtb2RpZmljYXRpb25cIix2b2lkIDApLHJuKHRoaXMsXCJtb2RpZmllckNvdW50XCIsMCkscm4odGhpcyxcIm1vZGlmaWVyQXJnXCIsdm9pZCAwKSxybih0aGlzLFwic3RhcnRDb29yZHNcIix2b2lkIDApLHJuKHRoaXMsXCJ0MFwiLDApLHJuKHRoaXMsXCJ2MFwiLDApLHJuKHRoaXMsXCJ0ZVwiLDApLHJuKHRoaXMsXCJ0YXJnZXRPZmZzZXRcIix2b2lkIDApLHJuKHRoaXMsXCJtb2RpZmllZE9mZnNldFwiLHZvaWQgMCkscm4odGhpcyxcImN1cnJlbnRPZmZzZXRcIix2b2lkIDApLHJuKHRoaXMsXCJsYW1iZGFfdjBcIiwwKSxybih0aGlzLFwib25lX3ZlX3YwXCIsMCkscm4odGhpcyxcInRpbWVvdXRcIix2b2lkIDApLHJuKHRoaXMsXCJpbnRlcmFjdGlvblwiLHZvaWQgMCksdGhpcy5pbnRlcmFjdGlvbj1lfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcInN0YXJ0XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5pbnRlcmFjdGlvbixuPWFuKGUpO2lmKCFufHwhbi5lbmFibGVkKXJldHVybiExO3ZhciByPWUuY29vcmRzLnZlbG9jaXR5LmNsaWVudCxvPSgwLEMuZGVmYXVsdCkoci54LHIueSksaT10aGlzLm1vZGlmaWNhdGlvbnx8KHRoaXMubW9kaWZpY2F0aW9uPW5ldyB5ZS5kZWZhdWx0KGUpKTtpZihpLmNvcHlGcm9tKGUubW9kaWZpY2F0aW9uKSx0aGlzLnQwPWUuX25vdygpLHRoaXMuYWxsb3dSZXN1bWU9bi5hbGxvd1Jlc3VtZSx0aGlzLnYwPW8sdGhpcy5jdXJyZW50T2Zmc2V0PXt4OjAseTowfSx0aGlzLnN0YXJ0Q29vcmRzPWUuY29vcmRzLmN1ci5wYWdlLHRoaXMubW9kaWZpZXJBcmc9aS5maWxsQXJnKHtwYWdlQ29vcmRzOnRoaXMuc3RhcnRDb29yZHMscHJlRW5kOiEwLHBoYXNlOlwiaW5lcnRpYXN0YXJ0XCJ9KSx0aGlzLnQwLWUuY29vcmRzLmN1ci50aW1lU3RhbXA8NTAmJm8+bi5taW5TcGVlZCYmbz5uLmVuZFNwZWVkKXRoaXMuc3RhcnRJbmVydGlhKCk7ZWxzZXtpZihpLnJlc3VsdD1pLnNldEFsbCh0aGlzLm1vZGlmaWVyQXJnKSwhaS5yZXN1bHQuY2hhbmdlZClyZXR1cm4hMTt0aGlzLnN0YXJ0U21vb3RoRW5kKCl9cmV0dXJuIGUubW9kaWZpY2F0aW9uLnJlc3VsdC5yZWN0PW51bGwsZS5vZmZzZXRCeSh0aGlzLnRhcmdldE9mZnNldCksZS5fZG9QaGFzZSh7aW50ZXJhY3Rpb246ZSxldmVudDp0LHBoYXNlOlwiaW5lcnRpYXN0YXJ0XCJ9KSxlLm9mZnNldEJ5KHt4Oi10aGlzLnRhcmdldE9mZnNldC54LHk6LXRoaXMudGFyZ2V0T2Zmc2V0Lnl9KSxlLm1vZGlmaWNhdGlvbi5yZXN1bHQucmVjdD1udWxsLHRoaXMuYWN0aXZlPSEwLGUuc2ltdWxhdGlvbj10aGlzLCEwfX0se2tleTpcInN0YXJ0SW5lcnRpYVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxlPXRoaXMuaW50ZXJhY3Rpb24uY29vcmRzLnZlbG9jaXR5LmNsaWVudCxuPWFuKHRoaXMuaW50ZXJhY3Rpb24pLHI9bi5yZXNpc3RhbmNlLG89LU1hdGgubG9nKG4uZW5kU3BlZWQvdGhpcy52MCkvcjt0aGlzLnRhcmdldE9mZnNldD17eDooZS54LW8pL3IseTooZS55LW8pL3J9LHRoaXMudGU9byx0aGlzLmxhbWJkYV92MD1yL3RoaXMudjAsdGhpcy5vbmVfdmVfdjA9MS1uLmVuZFNwZWVkL3RoaXMudjA7dmFyIGk9dGhpcy5tb2RpZmljYXRpb24sYT10aGlzLm1vZGlmaWVyQXJnO2EucGFnZUNvb3Jkcz17eDp0aGlzLnN0YXJ0Q29vcmRzLngrdGhpcy50YXJnZXRPZmZzZXQueCx5OnRoaXMuc3RhcnRDb29yZHMueSt0aGlzLnRhcmdldE9mZnNldC55fSxpLnJlc3VsdD1pLnNldEFsbChhKSxpLnJlc3VsdC5jaGFuZ2VkJiYodGhpcy5pc01vZGlmaWVkPSEwLHRoaXMubW9kaWZpZWRPZmZzZXQ9e3g6dGhpcy50YXJnZXRPZmZzZXQueCtpLnJlc3VsdC5kZWx0YS54LHk6dGhpcy50YXJnZXRPZmZzZXQueStpLnJlc3VsdC5kZWx0YS55fSksdGhpcy5vbk5leHRGcmFtZSgoZnVuY3Rpb24oKXtyZXR1cm4gdC5pbmVydGlhVGljaygpfSkpfX0se2tleTpcInN0YXJ0U21vb3RoRW5kXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzO3RoaXMuc21vb3RoRW5kPSEwLHRoaXMuaXNNb2RpZmllZD0hMCx0aGlzLnRhcmdldE9mZnNldD17eDp0aGlzLm1vZGlmaWNhdGlvbi5yZXN1bHQuZGVsdGEueCx5OnRoaXMubW9kaWZpY2F0aW9uLnJlc3VsdC5kZWx0YS55fSx0aGlzLm9uTmV4dEZyYW1lKChmdW5jdGlvbigpe3JldHVybiB0LnNtb290aEVuZFRpY2soKX0pKX19LHtrZXk6XCJvbk5leHRGcmFtZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXM7dGhpcy50aW1lb3V0PWp0LmRlZmF1bHQucmVxdWVzdCgoZnVuY3Rpb24oKXtlLmFjdGl2ZSYmdCgpfSkpfX0se2tleTpcImluZXJ0aWFUaWNrXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdCxlLG4scixvLGk9dGhpcyxhPXRoaXMuaW50ZXJhY3Rpb24scz1hbihhKS5yZXNpc3RhbmNlLGw9KGEuX25vdygpLXRoaXMudDApLzFlMztpZihsPHRoaXMudGUpe3ZhciB1LGM9MS0oTWF0aC5leHAoLXMqbCktdGhpcy5sYW1iZGFfdjApL3RoaXMub25lX3ZlX3YwO3RoaXMuaXNNb2RpZmllZD8oMCwwLHQ9dGhpcy50YXJnZXRPZmZzZXQueCxlPXRoaXMudGFyZ2V0T2Zmc2V0Lnksbj10aGlzLm1vZGlmaWVkT2Zmc2V0Lngscj10aGlzLm1vZGlmaWVkT2Zmc2V0LnksdT17eDpzbihvPWMsMCx0LG4pLHk6c24obywwLGUscil9KTp1PXt4OnRoaXMudGFyZ2V0T2Zmc2V0LngqYyx5OnRoaXMudGFyZ2V0T2Zmc2V0LnkqY307dmFyIGY9e3g6dS54LXRoaXMuY3VycmVudE9mZnNldC54LHk6dS55LXRoaXMuY3VycmVudE9mZnNldC55fTt0aGlzLmN1cnJlbnRPZmZzZXQueCs9Zi54LHRoaXMuY3VycmVudE9mZnNldC55Kz1mLnksYS5vZmZzZXRCeShmKSxhLm1vdmUoKSx0aGlzLm9uTmV4dEZyYW1lKChmdW5jdGlvbigpe3JldHVybiBpLmluZXJ0aWFUaWNrKCl9KSl9ZWxzZSBhLm9mZnNldEJ5KHt4OnRoaXMubW9kaWZpZWRPZmZzZXQueC10aGlzLmN1cnJlbnRPZmZzZXQueCx5OnRoaXMubW9kaWZpZWRPZmZzZXQueS10aGlzLmN1cnJlbnRPZmZzZXQueX0pLHRoaXMuZW5kKCl9fSx7a2V5Olwic21vb3RoRW5kVGlja1wiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxlPXRoaXMuaW50ZXJhY3Rpb24sbj1lLl9ub3coKS10aGlzLnQwLHI9YW4oZSkuc21vb3RoRW5kRHVyYXRpb247aWYobjxyKXt2YXIgbz17eDpsbihuLDAsdGhpcy50YXJnZXRPZmZzZXQueCxyKSx5OmxuKG4sMCx0aGlzLnRhcmdldE9mZnNldC55LHIpfSxpPXt4Om8ueC10aGlzLmN1cnJlbnRPZmZzZXQueCx5Om8ueS10aGlzLmN1cnJlbnRPZmZzZXQueX07dGhpcy5jdXJyZW50T2Zmc2V0LngrPWkueCx0aGlzLmN1cnJlbnRPZmZzZXQueSs9aS55LGUub2Zmc2V0QnkoaSksZS5tb3ZlKHtza2lwTW9kaWZpZXJzOnRoaXMubW9kaWZpZXJDb3VudH0pLHRoaXMub25OZXh0RnJhbWUoKGZ1bmN0aW9uKCl7cmV0dXJuIHQuc21vb3RoRW5kVGljaygpfSkpfWVsc2UgZS5vZmZzZXRCeSh7eDp0aGlzLnRhcmdldE9mZnNldC54LXRoaXMuY3VycmVudE9mZnNldC54LHk6dGhpcy50YXJnZXRPZmZzZXQueS10aGlzLmN1cnJlbnRPZmZzZXQueX0pLHRoaXMuZW5kKCl9fSx7a2V5OlwicmVzdW1lXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5wb2ludGVyLG49dC5ldmVudCxyPXQuZXZlbnRUYXJnZXQsbz10aGlzLmludGVyYWN0aW9uO28ub2Zmc2V0Qnkoe3g6LXRoaXMuY3VycmVudE9mZnNldC54LHk6LXRoaXMuY3VycmVudE9mZnNldC55fSksby51cGRhdGVQb2ludGVyKGUsbixyLCEwKSxvLl9kb1BoYXNlKHtpbnRlcmFjdGlvbjpvLGV2ZW50Om4scGhhc2U6XCJyZXN1bWVcIn0pLCgwLEIuY29weUNvb3Jkcykoby5jb29yZHMucHJldixvLmNvb3Jkcy5jdXIpLHRoaXMuc3RvcCgpfX0se2tleTpcImVuZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pbnRlcmFjdGlvbi5tb3ZlKCksdGhpcy5pbnRlcmFjdGlvbi5lbmQoKSx0aGlzLnN0b3AoKX19LHtrZXk6XCJzdG9wXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmFjdGl2ZT10aGlzLnNtb290aEVuZD0hMSx0aGlzLmludGVyYWN0aW9uLnNpbXVsYXRpb249bnVsbCxqdC5kZWZhdWx0LmNhbmNlbCh0aGlzLnRpbWVvdXQpfX1dKSYmbm4oZS5wcm90b3R5cGUsbiksdH0oKTtmdW5jdGlvbiBhbih0KXt2YXIgZT10LmludGVyYWN0YWJsZSxuPXQucHJlcGFyZWQ7cmV0dXJuIGUmJmUub3B0aW9ucyYmbi5uYW1lJiZlLm9wdGlvbnNbbi5uYW1lXS5pbmVydGlhfWZ1bmN0aW9uIHNuKHQsZSxuLHIpe3ZhciBvPTEtdDtyZXR1cm4gbypvKmUrMipvKnQqbit0KnQqcn1mdW5jdGlvbiBsbih0LGUsbixyKXtyZXR1cm4tbioodC89cikqKHQtMikrZX1lbi5JbmVydGlhU3RhdGU9b247dmFyIHVuPXtpZDpcImluZXJ0aWFcIixiZWZvcmU6W1wibW9kaWZpZXJzXCIsXCJhY3Rpb25zXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5kZWZhdWx0czt0LnVzZVBsdWdpbihHZS5kZWZhdWx0KSx0LnVzZVBsdWdpbihTZS5kZWZhdWx0KSx0LmFjdGlvbnMucGhhc2VzLmluZXJ0aWFzdGFydD0hMCx0LmFjdGlvbnMucGhhc2VzLnJlc3VtZT0hMCxlLnBlckFjdGlvbi5pbmVydGlhPXtlbmFibGVkOiExLHJlc2lzdGFuY2U6MTAsbWluU3BlZWQ6MTAwLGVuZFNwZWVkOjEwLGFsbG93UmVzdW1lOiEwLHNtb290aEVuZER1cmF0aW9uOjMwMH19LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtlLmluZXJ0aWE9bmV3IG9uKGUpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLWVuZFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmV2ZW50O3JldHVybighZS5faW50ZXJhY3Rpbmd8fGUuc2ltdWxhdGlvbnx8IWUuaW5lcnRpYS5zdGFydChuKSkmJm51bGx9LFwiaW50ZXJhY3Rpb25zOmRvd25cIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5ldmVudFRhcmdldCxyPWUuaW5lcnRpYTtpZihyLmFjdGl2ZSlmb3IodmFyIG89bjtpLmRlZmF1bHQuZWxlbWVudChvKTspe2lmKG89PT1lLmVsZW1lbnQpe3IucmVzdW1lKHQpO2JyZWFrfW89Xy5wYXJlbnROb2RlKG8pfX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24uaW5lcnRpYTtlLmFjdGl2ZSYmZS5zdG9wKCl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tcmVzdW1lXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb247ZS5zdG9wKHQpLGUuc3RhcnQodCx0LmludGVyYWN0aW9uLmNvb3Jkcy5jdXIucGFnZSksZS5hcHBseVRvSW50ZXJhY3Rpb24odCl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24taW5lcnRpYXN0YXJ0XCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnNldEFuZEFwcGx5KHQpfSxcImludGVyYWN0aW9uczphY3Rpb24tcmVzdW1lXCI6U2UuYWRkRXZlbnRNb2RpZmllcnMsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLWluZXJ0aWFzdGFydFwiOlNlLmFkZEV2ZW50TW9kaWZpZXJzLFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1pbmVydGlhc3RhcnRcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24ucmVzdG9yZUludGVyYWN0aW9uQ29vcmRzKHQpfSxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tcmVzdW1lXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnJlc3RvcmVJbnRlcmFjdGlvbkNvb3Jkcyh0KX19fTtlbi5kZWZhdWx0PXVuO3ZhciBjbj17fTtmdW5jdGlvbiBmbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gZG4odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fWZ1bmN0aW9uIHBuKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07aWYodC5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQpYnJlYWs7cih0KX19T2JqZWN0LmRlZmluZVByb3BlcnR5KGNuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGNuLkV2ZW50YWJsZT12b2lkIDA7dmFyIHZuPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLGRuKHRoaXMsXCJvcHRpb25zXCIsdm9pZCAwKSxkbih0aGlzLFwidHlwZXNcIix7fSksZG4odGhpcyxcInByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKSxkbih0aGlzLFwiaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkXCIsITEpLGRuKHRoaXMsXCJnbG9iYWxcIix2b2lkIDApLHRoaXMub3B0aW9ucz0oMCxqLmRlZmF1bHQpKHt9LGV8fHt9KX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJmaXJlXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGUsbj10aGlzLmdsb2JhbDsoZT10aGlzLnR5cGVzW3QudHlwZV0pJiZwbih0LGUpLCF0LnByb3BhZ2F0aW9uU3RvcHBlZCYmbiYmKGU9blt0LnR5cGVdKSYmcG4odCxlKX19LHtrZXk6XCJvblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49KDAsUi5kZWZhdWx0KSh0LGUpO2Zvcih0IGluIG4pdGhpcy50eXBlc1t0XT1aLm1lcmdlKHRoaXMudHlwZXNbdF18fFtdLG5bdF0pfX0se2tleTpcIm9mZlwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49KDAsUi5kZWZhdWx0KSh0LGUpO2Zvcih0IGluIG4pe3ZhciByPXRoaXMudHlwZXNbdF07aWYociYmci5sZW5ndGgpZm9yKHZhciBvPTA7bzxuW3RdLmxlbmd0aDtvKyspe3ZhciBpPW5bdF1bb10sYT1yLmluZGV4T2YoaSk7LTEhPT1hJiZyLnNwbGljZShhLDEpfX19fSx7a2V5OlwiZ2V0UmVjdFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiBudWxsfX1dKSYmZm4oZS5wcm90b3R5cGUsbiksdH0oKTtjbi5FdmVudGFibGU9dm47dmFyIGhuPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShobixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxobi5kZWZhdWx0PWZ1bmN0aW9uKHQsZSl7aWYoZS5waGFzZWxlc3NUeXBlc1t0XSlyZXR1cm4hMDtmb3IodmFyIG4gaW4gZS5tYXApaWYoMD09PXQuaW5kZXhPZihuKSYmdC5zdWJzdHIobi5sZW5ndGgpaW4gZS5waGFzZXMpcmV0dXJuITA7cmV0dXJuITF9O3ZhciBnbj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZ24sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZ24uY3JlYXRlSW50ZXJhY3RTdGF0aWM9ZnVuY3Rpb24odCl7dmFyIGU9ZnVuY3Rpb24gZShuLHIpe3ZhciBvPXQuaW50ZXJhY3RhYmxlcy5nZXQobixyKTtyZXR1cm4gb3x8KChvPXQuaW50ZXJhY3RhYmxlcy5uZXcobixyKSkuZXZlbnRzLmdsb2JhbD1lLmdsb2JhbEV2ZW50cyksb307cmV0dXJuIGUuZ2V0UG9pbnRlckF2ZXJhZ2U9Qi5wb2ludGVyQXZlcmFnZSxlLmdldFRvdWNoQkJveD1CLnRvdWNoQkJveCxlLmdldFRvdWNoRGlzdGFuY2U9Qi50b3VjaERpc3RhbmNlLGUuZ2V0VG91Y2hBbmdsZT1CLnRvdWNoQW5nbGUsZS5nZXRFbGVtZW50UmVjdD1fLmdldEVsZW1lbnRSZWN0LGUuZ2V0RWxlbWVudENsaWVudFJlY3Q9Xy5nZXRFbGVtZW50Q2xpZW50UmVjdCxlLm1hdGNoZXNTZWxlY3Rvcj1fLm1hdGNoZXNTZWxlY3RvcixlLmNsb3Nlc3Q9Xy5jbG9zZXN0LGUuZ2xvYmFsRXZlbnRzPXt9LGUudmVyc2lvbj1cIjEuMTAuMTFcIixlLnNjb3BlPXQsZS51c2U9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5zY29wZS51c2VQbHVnaW4odCxlKSx0aGlzfSxlLmlzU2V0PWZ1bmN0aW9uKHQsZSl7cmV0dXJuISF0aGlzLnNjb3BlLmludGVyYWN0YWJsZXMuZ2V0KHQsZSYmZS5jb250ZXh0KX0sZS5vbj0oMCxZdC53YXJuT25jZSkoKGZ1bmN0aW9uKHQsZSxuKXtpZihpLmRlZmF1bHQuc3RyaW5nKHQpJiYtMSE9PXQuc2VhcmNoKFwiIFwiKSYmKHQ9dC50cmltKCkuc3BsaXQoLyArLykpLGkuZGVmYXVsdC5hcnJheSh0KSl7Zm9yKHZhciByPTA7cjx0Lmxlbmd0aDtyKyspe3ZhciBvPXRbcl07dGhpcy5vbihvLGUsbil9cmV0dXJuIHRoaXN9aWYoaS5kZWZhdWx0Lm9iamVjdCh0KSl7Zm9yKHZhciBhIGluIHQpdGhpcy5vbihhLHRbYV0sZSk7cmV0dXJuIHRoaXN9cmV0dXJuKDAsaG4uZGVmYXVsdCkodCx0aGlzLnNjb3BlLmFjdGlvbnMpP3RoaXMuZ2xvYmFsRXZlbnRzW3RdP3RoaXMuZ2xvYmFsRXZlbnRzW3RdLnB1c2goZSk6dGhpcy5nbG9iYWxFdmVudHNbdF09W2VdOnRoaXMuc2NvcGUuZXZlbnRzLmFkZCh0aGlzLnNjb3BlLmRvY3VtZW50LHQsZSx7b3B0aW9uczpufSksdGhpc30pLFwiVGhlIGludGVyYWN0Lm9uKCkgbWV0aG9kIGlzIGJlaW5nIGRlcHJlY2F0ZWRcIiksZS5vZmY9KDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0LGUsbil7aWYoaS5kZWZhdWx0LnN0cmluZyh0KSYmLTEhPT10LnNlYXJjaChcIiBcIikmJih0PXQudHJpbSgpLnNwbGl0KC8gKy8pKSxpLmRlZmF1bHQuYXJyYXkodCkpe2Zvcih2YXIgcj0wO3I8dC5sZW5ndGg7cisrKXt2YXIgbz10W3JdO3RoaXMub2ZmKG8sZSxuKX1yZXR1cm4gdGhpc31pZihpLmRlZmF1bHQub2JqZWN0KHQpKXtmb3IodmFyIGEgaW4gdCl0aGlzLm9mZihhLHRbYV0sZSk7cmV0dXJuIHRoaXN9dmFyIHM7cmV0dXJuKDAsaG4uZGVmYXVsdCkodCx0aGlzLnNjb3BlLmFjdGlvbnMpP3QgaW4gdGhpcy5nbG9iYWxFdmVudHMmJi0xIT09KHM9dGhpcy5nbG9iYWxFdmVudHNbdF0uaW5kZXhPZihlKSkmJnRoaXMuZ2xvYmFsRXZlbnRzW3RdLnNwbGljZShzLDEpOnRoaXMuc2NvcGUuZXZlbnRzLnJlbW92ZSh0aGlzLnNjb3BlLmRvY3VtZW50LHQsZSxuKSx0aGlzfSksXCJUaGUgaW50ZXJhY3Qub2ZmKCkgbWV0aG9kIGlzIGJlaW5nIGRlcHJlY2F0ZWRcIiksZS5kZWJ1Zz1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNjb3BlfSxlLnN1cHBvcnRzVG91Y2g9ZnVuY3Rpb24oKXtyZXR1cm4gYi5kZWZhdWx0LnN1cHBvcnRzVG91Y2h9LGUuc3VwcG9ydHNQb2ludGVyRXZlbnQ9ZnVuY3Rpb24oKXtyZXR1cm4gYi5kZWZhdWx0LnN1cHBvcnRzUG9pbnRlckV2ZW50fSxlLnN0b3A9ZnVuY3Rpb24oKXtmb3IodmFyIHQ9MDt0PHRoaXMuc2NvcGUuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO3QrKyl0aGlzLnNjb3BlLmludGVyYWN0aW9ucy5saXN0W3RdLnN0b3AoKTtyZXR1cm4gdGhpc30sZS5wb2ludGVyTW92ZVRvbGVyYW5jZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0Lm51bWJlcih0KT8odGhpcy5zY29wZS5pbnRlcmFjdGlvbnMucG9pbnRlck1vdmVUb2xlcmFuY2U9dCx0aGlzKTp0aGlzLnNjb3BlLmludGVyYWN0aW9ucy5wb2ludGVyTW92ZVRvbGVyYW5jZX0sZS5hZGREb2N1bWVudD1mdW5jdGlvbih0LGUpe3RoaXMuc2NvcGUuYWRkRG9jdW1lbnQodCxlKX0sZS5yZW1vdmVEb2N1bWVudD1mdW5jdGlvbih0KXt0aGlzLnNjb3BlLnJlbW92ZURvY3VtZW50KHQpfSxlfTt2YXIgeW49e307ZnVuY3Rpb24gbW4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIGJuKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoeW4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkseW4uSW50ZXJhY3RhYmxlPXZvaWQgMDt2YXIgeG49ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KG4scixvLGkpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksYm4odGhpcyxcIm9wdGlvbnNcIix2b2lkIDApLGJuKHRoaXMsXCJfYWN0aW9uc1wiLHZvaWQgMCksYm4odGhpcyxcInRhcmdldFwiLHZvaWQgMCksYm4odGhpcyxcImV2ZW50c1wiLG5ldyBjbi5FdmVudGFibGUpLGJuKHRoaXMsXCJfY29udGV4dFwiLHZvaWQgMCksYm4odGhpcyxcIl93aW5cIix2b2lkIDApLGJuKHRoaXMsXCJfZG9jXCIsdm9pZCAwKSxibih0aGlzLFwiX3Njb3BlRXZlbnRzXCIsdm9pZCAwKSxibih0aGlzLFwiX3JlY3RDaGVja2VyXCIsdm9pZCAwKSx0aGlzLl9hY3Rpb25zPXIuYWN0aW9ucyx0aGlzLnRhcmdldD1uLHRoaXMuX2NvbnRleHQ9ci5jb250ZXh0fHxvLHRoaXMuX3dpbj0oMCxlLmdldFdpbmRvdykoKDAsXy50cnlTZWxlY3Rvcikobik/dGhpcy5fY29udGV4dDpuKSx0aGlzLl9kb2M9dGhpcy5fd2luLmRvY3VtZW50LHRoaXMuX3Njb3BlRXZlbnRzPWksdGhpcy5zZXQocil9dmFyIG4scjtyZXR1cm4gbj10LChyPVt7a2V5OlwiX2RlZmF1bHRzXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJue2Jhc2U6e30scGVyQWN0aW9uOnt9LGFjdGlvbnM6e319fX0se2tleTpcInNldE9uRXZlbnRzXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gaS5kZWZhdWx0LmZ1bmMoZS5vbnN0YXJ0KSYmdGhpcy5vbihcIlwiLmNvbmNhdCh0LFwic3RhcnRcIiksZS5vbnN0YXJ0KSxpLmRlZmF1bHQuZnVuYyhlLm9ubW92ZSkmJnRoaXMub24oXCJcIi5jb25jYXQodCxcIm1vdmVcIiksZS5vbm1vdmUpLGkuZGVmYXVsdC5mdW5jKGUub25lbmQpJiZ0aGlzLm9uKFwiXCIuY29uY2F0KHQsXCJlbmRcIiksZS5vbmVuZCksaS5kZWZhdWx0LmZ1bmMoZS5vbmluZXJ0aWFzdGFydCkmJnRoaXMub24oXCJcIi5jb25jYXQodCxcImluZXJ0aWFzdGFydFwiKSxlLm9uaW5lcnRpYXN0YXJ0KSx0aGlzfX0se2tleTpcInVwZGF0ZVBlckFjdGlvbkxpc3RlbmVyc1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXsoaS5kZWZhdWx0LmFycmF5KGUpfHxpLmRlZmF1bHQub2JqZWN0KGUpKSYmdGhpcy5vZmYodCxlKSwoaS5kZWZhdWx0LmFycmF5KG4pfHxpLmRlZmF1bHQub2JqZWN0KG4pKSYmdGhpcy5vbih0LG4pfX0se2tleTpcInNldFBlckFjdGlvblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49dGhpcy5fZGVmYXVsdHM7Zm9yKHZhciByIGluIGUpe3ZhciBvPXIsYT10aGlzLm9wdGlvbnNbdF0scz1lW29dO1wibGlzdGVuZXJzXCI9PT1vJiZ0aGlzLnVwZGF0ZVBlckFjdGlvbkxpc3RlbmVycyh0LGEubGlzdGVuZXJzLHMpLGkuZGVmYXVsdC5hcnJheShzKT9hW29dPVouZnJvbShzKTppLmRlZmF1bHQucGxhaW5PYmplY3Qocyk/KGFbb109KDAsai5kZWZhdWx0KShhW29dfHx7fSwoMCxnZS5kZWZhdWx0KShzKSksaS5kZWZhdWx0Lm9iamVjdChuLnBlckFjdGlvbltvXSkmJlwiZW5hYmxlZFwiaW4gbi5wZXJBY3Rpb25bb10mJihhW29dLmVuYWJsZWQ9ITEhPT1zLmVuYWJsZWQpKTppLmRlZmF1bHQuYm9vbChzKSYmaS5kZWZhdWx0Lm9iamVjdChuLnBlckFjdGlvbltvXSk/YVtvXS5lbmFibGVkPXM6YVtvXT1zfX19LHtrZXk6XCJnZXRSZWN0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHQ9dHx8KGkuZGVmYXVsdC5lbGVtZW50KHRoaXMudGFyZ2V0KT90aGlzLnRhcmdldDpudWxsKSxpLmRlZmF1bHQuc3RyaW5nKHRoaXMudGFyZ2V0KSYmKHQ9dHx8dGhpcy5fY29udGV4dC5xdWVyeVNlbGVjdG9yKHRoaXMudGFyZ2V0KSksKDAsXy5nZXRFbGVtZW50UmVjdCkodCl9fSx7a2V5OlwicmVjdENoZWNrZXJcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzO3JldHVybiBpLmRlZmF1bHQuZnVuYyh0KT8odGhpcy5fcmVjdENoZWNrZXI9dCx0aGlzLmdldFJlY3Q9ZnVuY3Rpb24odCl7dmFyIG49KDAsai5kZWZhdWx0KSh7fSxlLl9yZWN0Q2hlY2tlcih0KSk7cmV0dXJuXCJ3aWR0aFwiaW4gbnx8KG4ud2lkdGg9bi5yaWdodC1uLmxlZnQsbi5oZWlnaHQ9bi5ib3R0b20tbi50b3ApLG59LHRoaXMpOm51bGw9PT10PyhkZWxldGUgdGhpcy5nZXRSZWN0LGRlbGV0ZSB0aGlzLl9yZWN0Q2hlY2tlcix0aGlzKTp0aGlzLmdldFJlY3R9fSx7a2V5OlwiX2JhY2tDb21wYXRPcHRpb25cIix2YWx1ZTpmdW5jdGlvbih0LGUpe2lmKCgwLF8udHJ5U2VsZWN0b3IpKGUpfHxpLmRlZmF1bHQub2JqZWN0KGUpKXtmb3IodmFyIG4gaW4gdGhpcy5vcHRpb25zW3RdPWUsdGhpcy5fYWN0aW9ucy5tYXApdGhpcy5vcHRpb25zW25dW3RdPWU7cmV0dXJuIHRoaXN9cmV0dXJuIHRoaXMub3B0aW9uc1t0XX19LHtrZXk6XCJvcmlnaW5cIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fYmFja0NvbXBhdE9wdGlvbihcIm9yaWdpblwiLHQpfX0se2tleTpcImRlbHRhU291cmNlXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuXCJwYWdlXCI9PT10fHxcImNsaWVudFwiPT09dD8odGhpcy5vcHRpb25zLmRlbHRhU291cmNlPXQsdGhpcyk6dGhpcy5vcHRpb25zLmRlbHRhU291cmNlfX0se2tleTpcImNvbnRleHRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9jb250ZXh0fX0se2tleTpcImluQ29udGV4dFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9jb250ZXh0PT09dC5vd25lckRvY3VtZW50fHwoMCxfLm5vZGVDb250YWlucykodGhpcy5fY29udGV4dCx0KX19LHtrZXk6XCJ0ZXN0SWdub3JlQWxsb3dcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuIXRoaXMudGVzdElnbm9yZSh0Lmlnbm9yZUZyb20sZSxuKSYmdGhpcy50ZXN0QWxsb3codC5hbGxvd0Zyb20sZSxuKX19LHtrZXk6XCJ0ZXN0QWxsb3dcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuIXR8fCEhaS5kZWZhdWx0LmVsZW1lbnQobikmJihpLmRlZmF1bHQuc3RyaW5nKHQpPygwLF8ubWF0Y2hlc1VwVG8pKG4sdCxlKTohIWkuZGVmYXVsdC5lbGVtZW50KHQpJiYoMCxfLm5vZGVDb250YWlucykodCxuKSl9fSx7a2V5OlwidGVzdElnbm9yZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4hKCF0fHwhaS5kZWZhdWx0LmVsZW1lbnQobikpJiYoaS5kZWZhdWx0LnN0cmluZyh0KT8oMCxfLm1hdGNoZXNVcFRvKShuLHQsZSk6ISFpLmRlZmF1bHQuZWxlbWVudCh0KSYmKDAsXy5ub2RlQ29udGFpbnMpKHQsbikpfX0se2tleTpcImZpcmVcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5ldmVudHMuZmlyZSh0KSx0aGlzfX0se2tleTpcIl9vbk9mZlwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuLHIpe2kuZGVmYXVsdC5vYmplY3QoZSkmJiFpLmRlZmF1bHQuYXJyYXkoZSkmJihyPW4sbj1udWxsKTt2YXIgbz1cIm9uXCI9PT10P1wiYWRkXCI6XCJyZW1vdmVcIixhPSgwLFIuZGVmYXVsdCkoZSxuKTtmb3IodmFyIHMgaW4gYSl7XCJ3aGVlbFwiPT09cyYmKHM9Yi5kZWZhdWx0LndoZWVsRXZlbnQpO2Zvcih2YXIgbD0wO2w8YVtzXS5sZW5ndGg7bCsrKXt2YXIgdT1hW3NdW2xdOygwLGhuLmRlZmF1bHQpKHMsdGhpcy5fYWN0aW9ucyk/dGhpcy5ldmVudHNbdF0ocyx1KTppLmRlZmF1bHQuc3RyaW5nKHRoaXMudGFyZ2V0KT90aGlzLl9zY29wZUV2ZW50c1tcIlwiLmNvbmNhdChvLFwiRGVsZWdhdGVcIildKHRoaXMudGFyZ2V0LHRoaXMuX2NvbnRleHQscyx1LHIpOnRoaXMuX3Njb3BlRXZlbnRzW29dKHRoaXMudGFyZ2V0LHMsdSxyKX19cmV0dXJuIHRoaXN9fSx7a2V5Olwib25cIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuIHRoaXMuX29uT2ZmKFwib25cIix0LGUsbil9fSx7a2V5Olwib2ZmXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiB0aGlzLl9vbk9mZihcIm9mZlwiLHQsZSxuKX19LHtrZXk6XCJzZXRcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLl9kZWZhdWx0cztmb3IodmFyIG4gaW4gaS5kZWZhdWx0Lm9iamVjdCh0KXx8KHQ9e30pLHRoaXMub3B0aW9ucz0oMCxnZS5kZWZhdWx0KShlLmJhc2UpLHRoaXMuX2FjdGlvbnMubWV0aG9kRGljdCl7dmFyIHI9bixvPXRoaXMuX2FjdGlvbnMubWV0aG9kRGljdFtyXTt0aGlzLm9wdGlvbnNbcl09e30sdGhpcy5zZXRQZXJBY3Rpb24ociwoMCxqLmRlZmF1bHQpKCgwLGouZGVmYXVsdCkoe30sZS5wZXJBY3Rpb24pLGUuYWN0aW9uc1tyXSkpLHRoaXNbb10odFtyXSl9Zm9yKHZhciBhIGluIHQpaS5kZWZhdWx0LmZ1bmModGhpc1thXSkmJnRoaXNbYV0odFthXSk7cmV0dXJuIHRoaXN9fSx7a2V5OlwidW5zZXRcIix2YWx1ZTpmdW5jdGlvbigpe2lmKGkuZGVmYXVsdC5zdHJpbmcodGhpcy50YXJnZXQpKWZvcih2YXIgdCBpbiB0aGlzLl9zY29wZUV2ZW50cy5kZWxlZ2F0ZWRFdmVudHMpZm9yKHZhciBlPXRoaXMuX3Njb3BlRXZlbnRzLmRlbGVnYXRlZEV2ZW50c1t0XSxuPWUubGVuZ3RoLTE7bj49MDtuLS0pe3ZhciByPWVbbl0sbz1yLnNlbGVjdG9yLGE9ci5jb250ZXh0LHM9ci5saXN0ZW5lcnM7bz09PXRoaXMudGFyZ2V0JiZhPT09dGhpcy5fY29udGV4dCYmZS5zcGxpY2UobiwxKTtmb3IodmFyIGw9cy5sZW5ndGgtMTtsPj0wO2wtLSl0aGlzLl9zY29wZUV2ZW50cy5yZW1vdmVEZWxlZ2F0ZSh0aGlzLnRhcmdldCx0aGlzLl9jb250ZXh0LHQsc1tsXVswXSxzW2xdWzFdKX1lbHNlIHRoaXMuX3Njb3BlRXZlbnRzLnJlbW92ZSh0aGlzLnRhcmdldCxcImFsbFwiKX19XSkmJm1uKG4ucHJvdG90eXBlLHIpLHR9KCk7eW4uSW50ZXJhY3RhYmxlPXhuO3ZhciB3bj17fTtmdW5jdGlvbiBfbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gUG4odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3bixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx3bi5JbnRlcmFjdGFibGVTZXQ9dm9pZCAwO3ZhciBPbj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7dmFyIG49dGhpczshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLFBuKHRoaXMsXCJsaXN0XCIsW10pLFBuKHRoaXMsXCJzZWxlY3Rvck1hcFwiLHt9KSxQbih0aGlzLFwic2NvcGVcIix2b2lkIDApLHRoaXMuc2NvcGU9ZSxlLmFkZExpc3RlbmVycyh7XCJpbnRlcmFjdGFibGU6dW5zZXRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0YWJsZSxyPWUudGFyZ2V0LG89ZS5fY29udGV4dCxhPWkuZGVmYXVsdC5zdHJpbmcocik/bi5zZWxlY3Rvck1hcFtyXTpyW24uc2NvcGUuaWRdLHM9Wi5maW5kSW5kZXgoYSwoZnVuY3Rpb24odCl7cmV0dXJuIHQuY29udGV4dD09PW99KSk7YVtzXSYmKGFbc10uY29udGV4dD1udWxsLGFbc10uaW50ZXJhY3RhYmxlPW51bGwpLGEuc3BsaWNlKHMsMSl9fSl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwibmV3XCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtlPSgwLGouZGVmYXVsdCkoZXx8e30se2FjdGlvbnM6dGhpcy5zY29wZS5hY3Rpb25zfSk7dmFyIG49bmV3IHRoaXMuc2NvcGUuSW50ZXJhY3RhYmxlKHQsZSx0aGlzLnNjb3BlLmRvY3VtZW50LHRoaXMuc2NvcGUuZXZlbnRzKSxyPXtjb250ZXh0Om4uX2NvbnRleHQsaW50ZXJhY3RhYmxlOm59O3JldHVybiB0aGlzLnNjb3BlLmFkZERvY3VtZW50KG4uX2RvYyksdGhpcy5saXN0LnB1c2gobiksaS5kZWZhdWx0LnN0cmluZyh0KT8odGhpcy5zZWxlY3Rvck1hcFt0XXx8KHRoaXMuc2VsZWN0b3JNYXBbdF09W10pLHRoaXMuc2VsZWN0b3JNYXBbdF0ucHVzaChyKSk6KG4udGFyZ2V0W3RoaXMuc2NvcGUuaWRdfHxPYmplY3QuZGVmaW5lUHJvcGVydHkodCx0aGlzLnNjb3BlLmlkLHt2YWx1ZTpbXSxjb25maWd1cmFibGU6ITB9KSx0W3RoaXMuc2NvcGUuaWRdLnB1c2gocikpLHRoaXMuc2NvcGUuZmlyZShcImludGVyYWN0YWJsZTpuZXdcIix7dGFyZ2V0OnQsb3B0aW9uczplLGludGVyYWN0YWJsZTpuLHdpbjp0aGlzLnNjb3BlLl93aW59KSxufX0se2tleTpcImdldFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49ZSYmZS5jb250ZXh0fHx0aGlzLnNjb3BlLmRvY3VtZW50LHI9aS5kZWZhdWx0LnN0cmluZyh0KSxvPXI/dGhpcy5zZWxlY3Rvck1hcFt0XTp0W3RoaXMuc2NvcGUuaWRdO2lmKCFvKXJldHVybiBudWxsO3ZhciBhPVouZmluZChvLChmdW5jdGlvbihlKXtyZXR1cm4gZS5jb250ZXh0PT09biYmKHJ8fGUuaW50ZXJhY3RhYmxlLmluQ29udGV4dCh0KSl9KSk7cmV0dXJuIGEmJmEuaW50ZXJhY3RhYmxlfX0se2tleTpcImZvckVhY2hNYXRjaFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPTA7bjx0aGlzLmxpc3QubGVuZ3RoO24rKyl7dmFyIHI9dGhpcy5saXN0W25dLG89dm9pZCAwO2lmKChpLmRlZmF1bHQuc3RyaW5nKHIudGFyZ2V0KT9pLmRlZmF1bHQuZWxlbWVudCh0KSYmXy5tYXRjaGVzU2VsZWN0b3IodCxyLnRhcmdldCk6dD09PXIudGFyZ2V0KSYmci5pbkNvbnRleHQodCkmJihvPWUocikpLHZvaWQgMCE9PW8pcmV0dXJuIG99fX1dKSYmX24oZS5wcm90b3R5cGUsbiksdH0oKTt3bi5JbnRlcmFjdGFibGVTZXQ9T247dmFyIFNuPXt9O2Z1bmN0aW9uIEVuKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBUbih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9ZnVuY3Rpb24gTW4odCxlKXtyZXR1cm4gZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0odCl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fSh0LGUpfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBqbih0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/am4odCxlKTp2b2lkIDB9fSh0LGUpfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCl9ZnVuY3Rpb24gam4odCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxTbi5kZWZhdWx0PXZvaWQgMDt2YXIga249ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksVG4odGhpcyxcImN1cnJlbnRUYXJnZXRcIix2b2lkIDApLFRuKHRoaXMsXCJvcmlnaW5hbEV2ZW50XCIsdm9pZCAwKSxUbih0aGlzLFwidHlwZVwiLHZvaWQgMCksdGhpcy5vcmlnaW5hbEV2ZW50PWUsKDAsRi5kZWZhdWx0KSh0aGlzLGUpfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcInByZXZlbnRPcmlnaW5hbERlZmF1bHRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpfX0se2tleTpcInN0b3BQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5vcmlnaW5hbEV2ZW50LnN0b3BQcm9wYWdhdGlvbigpfX0se2tleTpcInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5vcmlnaW5hbEV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpfX1dKSYmRW4oZS5wcm90b3R5cGUsbiksdH0oKTtmdW5jdGlvbiBJbih0KXtpZighaS5kZWZhdWx0Lm9iamVjdCh0KSlyZXR1cm57Y2FwdHVyZTohIXQscGFzc2l2ZTohMX07dmFyIGU9KDAsai5kZWZhdWx0KSh7fSx0KTtyZXR1cm4gZS5jYXB0dXJlPSEhdC5jYXB0dXJlLGUucGFzc2l2ZT0hIXQucGFzc2l2ZSxlfXZhciBEbj17aWQ6XCJldmVudHNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlLG49W10scj17fSxvPVtdLGE9e2FkZDpzLHJlbW92ZTpsLGFkZERlbGVnYXRlOmZ1bmN0aW9uKHQsZSxuLGksYSl7dmFyIGw9SW4oYSk7aWYoIXJbbl0pe3Jbbl09W107Zm9yKHZhciBmPTA7ZjxvLmxlbmd0aDtmKyspe3ZhciBkPW9bZl07cyhkLG4sdSkscyhkLG4sYywhMCl9fXZhciBwPXJbbl0sdj1aLmZpbmQocCwoZnVuY3Rpb24obil7cmV0dXJuIG4uc2VsZWN0b3I9PT10JiZuLmNvbnRleHQ9PT1lfSkpO3Z8fCh2PXtzZWxlY3Rvcjp0LGNvbnRleHQ6ZSxsaXN0ZW5lcnM6W119LHAucHVzaCh2KSksdi5saXN0ZW5lcnMucHVzaChbaSxsXSl9LHJlbW92ZURlbGVnYXRlOmZ1bmN0aW9uKHQsZSxuLG8saSl7dmFyIGEscz1JbihpKSxmPXJbbl0sZD0hMTtpZihmKWZvcihhPWYubGVuZ3RoLTE7YT49MDthLS0pe3ZhciBwPWZbYV07aWYocC5zZWxlY3Rvcj09PXQmJnAuY29udGV4dD09PWUpe2Zvcih2YXIgdj1wLmxpc3RlbmVycyxoPXYubGVuZ3RoLTE7aD49MDtoLS0pe3ZhciBnPU1uKHZbaF0sMikseT1nWzBdLG09Z1sxXSxiPW0uY2FwdHVyZSx4PW0ucGFzc2l2ZTtpZih5PT09byYmYj09PXMuY2FwdHVyZSYmeD09PXMucGFzc2l2ZSl7di5zcGxpY2UoaCwxKSx2Lmxlbmd0aHx8KGYuc3BsaWNlKGEsMSksbChlLG4sdSksbChlLG4sYywhMCkpLGQ9ITA7YnJlYWt9fWlmKGQpYnJlYWt9fX0sZGVsZWdhdGVMaXN0ZW5lcjp1LGRlbGVnYXRlVXNlQ2FwdHVyZTpjLGRlbGVnYXRlZEV2ZW50czpyLGRvY3VtZW50czpvLHRhcmdldHM6bixzdXBwb3J0c09wdGlvbnM6ITEsc3VwcG9ydHNQYXNzaXZlOiExfTtmdW5jdGlvbiBzKHQsZSxyLG8pe3ZhciBpPUluKG8pLHM9Wi5maW5kKG4sKGZ1bmN0aW9uKGUpe3JldHVybiBlLmV2ZW50VGFyZ2V0PT09dH0pKTtzfHwocz17ZXZlbnRUYXJnZXQ6dCxldmVudHM6e319LG4ucHVzaChzKSkscy5ldmVudHNbZV18fChzLmV2ZW50c1tlXT1bXSksdC5hZGRFdmVudExpc3RlbmVyJiYhWi5jb250YWlucyhzLmV2ZW50c1tlXSxyKSYmKHQuYWRkRXZlbnRMaXN0ZW5lcihlLHIsYS5zdXBwb3J0c09wdGlvbnM/aTppLmNhcHR1cmUpLHMuZXZlbnRzW2VdLnB1c2gocikpfWZ1bmN0aW9uIGwodCxlLHIsbyl7dmFyIGk9SW4obykscz1aLmZpbmRJbmRleChuLChmdW5jdGlvbihlKXtyZXR1cm4gZS5ldmVudFRhcmdldD09PXR9KSksdT1uW3NdO2lmKHUmJnUuZXZlbnRzKWlmKFwiYWxsXCIhPT1lKXt2YXIgYz0hMSxmPXUuZXZlbnRzW2VdO2lmKGYpe2lmKFwiYWxsXCI9PT1yKXtmb3IodmFyIGQ9Zi5sZW5ndGgtMTtkPj0wO2QtLSlsKHQsZSxmW2RdLGkpO3JldHVybn1mb3IodmFyIHA9MDtwPGYubGVuZ3RoO3ArKylpZihmW3BdPT09cil7dC5yZW1vdmVFdmVudExpc3RlbmVyKGUscixhLnN1cHBvcnRzT3B0aW9ucz9pOmkuY2FwdHVyZSksZi5zcGxpY2UocCwxKSwwPT09Zi5sZW5ndGgmJihkZWxldGUgdS5ldmVudHNbZV0sYz0hMCk7YnJlYWt9fWMmJiFPYmplY3Qua2V5cyh1LmV2ZW50cykubGVuZ3RoJiZuLnNwbGljZShzLDEpfWVsc2UgZm9yKGUgaW4gdS5ldmVudHMpdS5ldmVudHMuaGFzT3duUHJvcGVydHkoZSkmJmwodCxlLFwiYWxsXCIpfWZ1bmN0aW9uIHUodCxlKXtmb3IodmFyIG49SW4oZSksbz1uZXcga24odCksYT1yW3QudHlwZV0scz1NbihCLmdldEV2ZW50VGFyZ2V0cyh0KSwxKVswXSxsPXM7aS5kZWZhdWx0LmVsZW1lbnQobCk7KXtmb3IodmFyIHU9MDt1PGEubGVuZ3RoO3UrKyl7dmFyIGM9YVt1XSxmPWMuc2VsZWN0b3IsZD1jLmNvbnRleHQ7aWYoXy5tYXRjaGVzU2VsZWN0b3IobCxmKSYmXy5ub2RlQ29udGFpbnMoZCxzKSYmXy5ub2RlQ29udGFpbnMoZCxsKSl7dmFyIHA9Yy5saXN0ZW5lcnM7by5jdXJyZW50VGFyZ2V0PWw7Zm9yKHZhciB2PTA7djxwLmxlbmd0aDt2Kyspe3ZhciBoPU1uKHBbdl0sMiksZz1oWzBdLHk9aFsxXSxtPXkuY2FwdHVyZSxiPXkucGFzc2l2ZTttPT09bi5jYXB0dXJlJiZiPT09bi5wYXNzaXZlJiZnKG8pfX19bD1fLnBhcmVudE5vZGUobCl9fWZ1bmN0aW9uIGModCl7cmV0dXJuIHUodCwhMCl9cmV0dXJuIG51bGw9PShlPXQuZG9jdW1lbnQpfHxlLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikuYWRkRXZlbnRMaXN0ZW5lcihcInRlc3RcIixudWxsLHtnZXQgY2FwdHVyZSgpe3JldHVybiBhLnN1cHBvcnRzT3B0aW9ucz0hMH0sZ2V0IHBhc3NpdmUoKXtyZXR1cm4gYS5zdXBwb3J0c1Bhc3NpdmU9ITB9fSksdC5ldmVudHM9YSxhfX07U24uZGVmYXVsdD1Ebjt2YXIgQW49e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEFuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEFuLmRlZmF1bHQ9dm9pZCAwO3ZhciBSbj17bWV0aG9kT3JkZXI6W1wic2ltdWxhdGlvblJlc3VtZVwiLFwibW91c2VPclBlblwiLFwiaGFzUG9pbnRlclwiLFwiaWRsZVwiXSxzZWFyY2g6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTxSbi5tZXRob2RPcmRlci5sZW5ndGg7ZSsrKXt2YXIgbjtuPVJuLm1ldGhvZE9yZGVyW2VdO3ZhciByPVJuW25dKHQpO2lmKHIpcmV0dXJuIHJ9cmV0dXJuIG51bGx9LHNpbXVsYXRpb25SZXN1bWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5wb2ludGVyVHlwZSxuPXQuZXZlbnRUeXBlLHI9dC5ldmVudFRhcmdldCxvPXQuc2NvcGU7aWYoIS9kb3dufHN0YXJ0L2kudGVzdChuKSlyZXR1cm4gbnVsbDtmb3IodmFyIGk9MDtpPG8uaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO2krKyl7dmFyIGE9by5pbnRlcmFjdGlvbnMubGlzdFtpXSxzPXI7aWYoYS5zaW11bGF0aW9uJiZhLnNpbXVsYXRpb24uYWxsb3dSZXN1bWUmJmEucG9pbnRlclR5cGU9PT1lKWZvcig7czspe2lmKHM9PT1hLmVsZW1lbnQpcmV0dXJuIGE7cz1fLnBhcmVudE5vZGUocyl9fXJldHVybiBudWxsfSxtb3VzZU9yUGVuOmZ1bmN0aW9uKHQpe3ZhciBlLG49dC5wb2ludGVySWQscj10LnBvaW50ZXJUeXBlLG89dC5ldmVudFR5cGUsaT10LnNjb3BlO2lmKFwibW91c2VcIiE9PXImJlwicGVuXCIhPT1yKXJldHVybiBudWxsO2Zvcih2YXIgYT0wO2E8aS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7YSsrKXt2YXIgcz1pLmludGVyYWN0aW9ucy5saXN0W2FdO2lmKHMucG9pbnRlclR5cGU9PT1yKXtpZihzLnNpbXVsYXRpb24mJiF6bihzLG4pKWNvbnRpbnVlO2lmKHMuaW50ZXJhY3RpbmcoKSlyZXR1cm4gcztlfHwoZT1zKX19aWYoZSlyZXR1cm4gZTtmb3IodmFyIGw9MDtsPGkuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO2wrKyl7dmFyIHU9aS5pbnRlcmFjdGlvbnMubGlzdFtsXTtpZighKHUucG9pbnRlclR5cGUhPT1yfHwvZG93bi9pLnRlc3QobykmJnUuc2ltdWxhdGlvbikpcmV0dXJuIHV9cmV0dXJuIG51bGx9LGhhc1BvaW50ZXI6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXQucG9pbnRlcklkLG49dC5zY29wZSxyPTA7cjxuLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtyKyspe3ZhciBvPW4uaW50ZXJhY3Rpb25zLmxpc3Rbcl07aWYoem4obyxlKSlyZXR1cm4gb31yZXR1cm4gbnVsbH0saWRsZTpmdW5jdGlvbih0KXtmb3IodmFyIGU9dC5wb2ludGVyVHlwZSxuPXQuc2NvcGUscj0wO3I8bi5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7cisrKXt2YXIgbz1uLmludGVyYWN0aW9ucy5saXN0W3JdO2lmKDE9PT1vLnBvaW50ZXJzLmxlbmd0aCl7dmFyIGk9by5pbnRlcmFjdGFibGU7aWYoaSYmKCFpLm9wdGlvbnMuZ2VzdHVyZXx8IWkub3B0aW9ucy5nZXN0dXJlLmVuYWJsZWQpKWNvbnRpbnVlfWVsc2UgaWYoby5wb2ludGVycy5sZW5ndGg+PTIpY29udGludWU7aWYoIW8uaW50ZXJhY3RpbmcoKSYmZT09PW8ucG9pbnRlclR5cGUpcmV0dXJuIG99cmV0dXJuIG51bGx9fTtmdW5jdGlvbiB6bih0LGUpe3JldHVybiB0LnBvaW50ZXJzLnNvbWUoKGZ1bmN0aW9uKHQpe3JldHVybiB0LmlkPT09ZX0pKX12YXIgQ249Um47QW4uZGVmYXVsdD1Dbjt2YXIgRm49e307ZnVuY3Rpb24gWG4odCl7cmV0dXJuKFhuPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBZbih0LGUpe3JldHVybiBmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0fSh0KXx8ZnVuY3Rpb24odCxlKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXt2YXIgbj1bXSxyPSEwLG89ITEsaT12b2lkIDA7dHJ5e2Zvcih2YXIgYSxzPXRbU3ltYm9sLml0ZXJhdG9yXSgpOyEocj0oYT1zLm5leHQoKSkuZG9uZSkmJihuLnB1c2goYS52YWx1ZSksIWV8fG4ubGVuZ3RoIT09ZSk7cj0hMCk7fWNhdGNoKHQpe289ITAsaT10fWZpbmFsbHl7dHJ5e3J8fG51bGw9PXMucmV0dXJufHxzLnJldHVybigpfWZpbmFsbHl7aWYobyl0aHJvdyBpfX1yZXR1cm4gbn19KHQsZSl8fGZ1bmN0aW9uKHQsZSl7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIEJuKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9Cbih0LGUpOnZvaWQgMH19KHQsZSl8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX0oKX1mdW5jdGlvbiBCbih0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9ZnVuY3Rpb24gV24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfWZ1bmN0aW9uIExuKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBVbih0LGUpe3JldHVybihVbj1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gVm4odCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PVhuKGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP2Z1bmN0aW9uKHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fSh0KTplfWZ1bmN0aW9uIE5uKHQpe3JldHVybihObj1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KEZuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEZuLmRlZmF1bHQ9dm9pZCAwO3ZhciBxbj1bXCJwb2ludGVyRG93blwiLFwicG9pbnRlck1vdmVcIixcInBvaW50ZXJVcFwiLFwidXBkYXRlUG9pbnRlclwiLFwicmVtb3ZlUG9pbnRlclwiLFwid2luZG93Qmx1clwiXTtmdW5jdGlvbiAkbih0LGUpe3JldHVybiBmdW5jdGlvbihuKXt2YXIgcj1lLmludGVyYWN0aW9ucy5saXN0LG89Qi5nZXRQb2ludGVyVHlwZShuKSxpPVluKEIuZ2V0RXZlbnRUYXJnZXRzKG4pLDIpLGE9aVswXSxzPWlbMV0sbD1bXTtpZigvXnRvdWNoLy50ZXN0KG4udHlwZSkpe2UucHJldlRvdWNoVGltZT1lLm5vdygpO2Zvcih2YXIgdT0wO3U8bi5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7dSsrKXt2YXIgYz1uLmNoYW5nZWRUb3VjaGVzW3VdLGY9e3BvaW50ZXI6Yyxwb2ludGVySWQ6Qi5nZXRQb2ludGVySWQoYykscG9pbnRlclR5cGU6byxldmVudFR5cGU6bi50eXBlLGV2ZW50VGFyZ2V0OmEsY3VyRXZlbnRUYXJnZXQ6cyxzY29wZTplfSxkPUduKGYpO2wucHVzaChbZi5wb2ludGVyLGYuZXZlbnRUYXJnZXQsZi5jdXJFdmVudFRhcmdldCxkXSl9fWVsc2V7dmFyIHA9ITE7aWYoIWIuZGVmYXVsdC5zdXBwb3J0c1BvaW50ZXJFdmVudCYmL21vdXNlLy50ZXN0KG4udHlwZSkpe2Zvcih2YXIgdj0wO3Y8ci5sZW5ndGgmJiFwO3YrKylwPVwibW91c2VcIiE9PXJbdl0ucG9pbnRlclR5cGUmJnJbdl0ucG9pbnRlcklzRG93bjtwPXB8fGUubm93KCktZS5wcmV2VG91Y2hUaW1lPDUwMHx8MD09PW4udGltZVN0YW1wfWlmKCFwKXt2YXIgaD17cG9pbnRlcjpuLHBvaW50ZXJJZDpCLmdldFBvaW50ZXJJZChuKSxwb2ludGVyVHlwZTpvLGV2ZW50VHlwZTpuLnR5cGUsY3VyRXZlbnRUYXJnZXQ6cyxldmVudFRhcmdldDphLHNjb3BlOmV9LGc9R24oaCk7bC5wdXNoKFtoLnBvaW50ZXIsaC5ldmVudFRhcmdldCxoLmN1ckV2ZW50VGFyZ2V0LGddKX19Zm9yKHZhciB5PTA7eTxsLmxlbmd0aDt5Kyspe3ZhciBtPVluKGxbeV0sNCkseD1tWzBdLHc9bVsxXSxfPW1bMl07bVszXVt0XSh4LG4sdyxfKX19fWZ1bmN0aW9uIEduKHQpe3ZhciBlPXQucG9pbnRlclR5cGUsbj10LnNjb3BlLHI9e2ludGVyYWN0aW9uOkFuLmRlZmF1bHQuc2VhcmNoKHQpLHNlYXJjaERldGFpbHM6dH07cmV0dXJuIG4uZmlyZShcImludGVyYWN0aW9uczpmaW5kXCIsciksci5pbnRlcmFjdGlvbnx8bi5pbnRlcmFjdGlvbnMubmV3KHtwb2ludGVyVHlwZTplfSl9ZnVuY3Rpb24gSG4odCxlKXt2YXIgbj10LmRvYyxyPXQuc2NvcGUsbz10Lm9wdGlvbnMsaT1yLmludGVyYWN0aW9ucy5kb2NFdmVudHMsYT1yLmV2ZW50cyxzPWFbZV07Zm9yKHZhciBsIGluIHIuYnJvd3Nlci5pc0lPUyYmIW8uZXZlbnRzJiYoby5ldmVudHM9e3Bhc3NpdmU6ITF9KSxhLmRlbGVnYXRlZEV2ZW50cylzKG4sbCxhLmRlbGVnYXRlTGlzdGVuZXIpLHMobixsLGEuZGVsZWdhdGVVc2VDYXB0dXJlLCEwKTtmb3IodmFyIHU9byYmby5ldmVudHMsYz0wO2M8aS5sZW5ndGg7YysrKXt2YXIgZj1pW2NdO3MobixmLnR5cGUsZi5saXN0ZW5lcix1KX19dmFyIEtuPXtpZDpcImNvcmUvaW50ZXJhY3Rpb25zXCIsaW5zdGFsbDpmdW5jdGlvbih0KXtmb3IodmFyIGU9e30sbj0wO248cW4ubGVuZ3RoO24rKyl7dmFyIHI9cW5bbl07ZVtyXT0kbihyLHQpfXZhciBvLGk9Yi5kZWZhdWx0LnBFdmVudFR5cGVzO2Z1bmN0aW9uIGEoKXtmb3IodmFyIGU9MDtlPHQuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO2UrKyl7dmFyIG49dC5pbnRlcmFjdGlvbnMubGlzdFtlXTtpZihuLnBvaW50ZXJJc0Rvd24mJlwidG91Y2hcIj09PW4ucG9pbnRlclR5cGUmJiFuLl9pbnRlcmFjdGluZylmb3IodmFyIHI9ZnVuY3Rpb24oKXt2YXIgZT1uLnBvaW50ZXJzW29dO3QuZG9jdW1lbnRzLnNvbWUoKGZ1bmN0aW9uKHQpe3ZhciBuPXQuZG9jO3JldHVybigwLF8ubm9kZUNvbnRhaW5zKShuLGUuZG93blRhcmdldCl9KSl8fG4ucmVtb3ZlUG9pbnRlcihlLnBvaW50ZXIsZS5ldmVudCl9LG89MDtvPG4ucG9pbnRlcnMubGVuZ3RoO28rKylyKCl9fShvPWguZGVmYXVsdC5Qb2ludGVyRXZlbnQ/W3t0eXBlOmkuZG93bixsaXN0ZW5lcjphfSx7dHlwZTppLmRvd24sbGlzdGVuZXI6ZS5wb2ludGVyRG93bn0se3R5cGU6aS5tb3ZlLGxpc3RlbmVyOmUucG9pbnRlck1vdmV9LHt0eXBlOmkudXAsbGlzdGVuZXI6ZS5wb2ludGVyVXB9LHt0eXBlOmkuY2FuY2VsLGxpc3RlbmVyOmUucG9pbnRlclVwfV06W3t0eXBlOlwibW91c2Vkb3duXCIsbGlzdGVuZXI6ZS5wb2ludGVyRG93bn0se3R5cGU6XCJtb3VzZW1vdmVcIixsaXN0ZW5lcjplLnBvaW50ZXJNb3ZlfSx7dHlwZTpcIm1vdXNldXBcIixsaXN0ZW5lcjplLnBvaW50ZXJVcH0se3R5cGU6XCJ0b3VjaHN0YXJ0XCIsbGlzdGVuZXI6YX0se3R5cGU6XCJ0b3VjaHN0YXJ0XCIsbGlzdGVuZXI6ZS5wb2ludGVyRG93bn0se3R5cGU6XCJ0b3VjaG1vdmVcIixsaXN0ZW5lcjplLnBvaW50ZXJNb3ZlfSx7dHlwZTpcInRvdWNoZW5kXCIsbGlzdGVuZXI6ZS5wb2ludGVyVXB9LHt0eXBlOlwidG91Y2hjYW5jZWxcIixsaXN0ZW5lcjplLnBvaW50ZXJVcH1dKS5wdXNoKHt0eXBlOlwiYmx1clwiLGxpc3RlbmVyOmZ1bmN0aW9uKGUpe2Zvcih2YXIgbj0wO248dC5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7bisrKXQuaW50ZXJhY3Rpb25zLmxpc3Rbbl0uZG9jdW1lbnRCbHVyKGUpfX0pLHQucHJldlRvdWNoVGltZT0wLHQuSW50ZXJhY3Rpb249ZnVuY3Rpb24oZSl7IWZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZSYmZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp0LHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSxlJiZVbih0LGUpfShzLGUpO3ZhciBuLHIsbyxpLGE9KG89cyxpPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sKGZ1bmN0aW9uKCl7fSkpKSwhMH1jYXRjaCh0KXtyZXR1cm4hMX19KCksZnVuY3Rpb24oKXt2YXIgdCxlPU5uKG8pO2lmKGkpe3ZhciBuPU5uKHRoaXMpLmNvbnN0cnVjdG9yO3Q9UmVmbGVjdC5jb25zdHJ1Y3QoZSxhcmd1bWVudHMsbil9ZWxzZSB0PWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBWbih0aGlzLHQpfSk7ZnVuY3Rpb24gcygpe3JldHVybiBXbih0aGlzLHMpLGEuYXBwbHkodGhpcyxhcmd1bWVudHMpfXJldHVybiBuPXMsKHI9W3trZXk6XCJwb2ludGVyTW92ZVRvbGVyYW5jZVwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0LmludGVyYWN0aW9ucy5wb2ludGVyTW92ZVRvbGVyYW5jZX0sc2V0OmZ1bmN0aW9uKGUpe3QuaW50ZXJhY3Rpb25zLnBvaW50ZXJNb3ZlVG9sZXJhbmNlPWV9fSx7a2V5OlwiX25vd1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHQubm93KCl9fV0pJiZMbihuLnByb3RvdHlwZSxyKSxzfShMZS5kZWZhdWx0KSx0LmludGVyYWN0aW9ucz17bGlzdDpbXSxuZXc6ZnVuY3Rpb24oZSl7ZS5zY29wZUZpcmU9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gdC5maXJlKGUsbil9O3ZhciBuPW5ldyB0LkludGVyYWN0aW9uKGUpO3JldHVybiB0LmludGVyYWN0aW9ucy5saXN0LnB1c2gobiksbn0sbGlzdGVuZXJzOmUsZG9jRXZlbnRzOm8scG9pbnRlck1vdmVUb2xlcmFuY2U6MX0sdC51c2VQbHVnaW4oc2UuZGVmYXVsdCl9LGxpc3RlbmVyczp7XCJzY29wZTphZGQtZG9jdW1lbnRcIjpmdW5jdGlvbih0KXtyZXR1cm4gSG4odCxcImFkZFwiKX0sXCJzY29wZTpyZW1vdmUtZG9jdW1lbnRcIjpmdW5jdGlvbih0KXtyZXR1cm4gSG4odCxcInJlbW92ZVwiKX0sXCJpbnRlcmFjdGFibGU6dW5zZXRcIjpmdW5jdGlvbih0LGUpe2Zvcih2YXIgbj10LmludGVyYWN0YWJsZSxyPWUuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoLTE7cj49MDtyLS0pe3ZhciBvPWUuaW50ZXJhY3Rpb25zLmxpc3Rbcl07by5pbnRlcmFjdGFibGU9PT1uJiYoby5zdG9wKCksZS5maXJlKFwiaW50ZXJhY3Rpb25zOmRlc3Ryb3lcIix7aW50ZXJhY3Rpb246b30pLG8uZGVzdHJveSgpLGUuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoPjImJmUuaW50ZXJhY3Rpb25zLmxpc3Quc3BsaWNlKHIsMSkpfX19LG9uRG9jU2lnbmFsOkhuLGRvT25JbnRlcmFjdGlvbnM6JG4sbWV0aG9kTmFtZXM6cW59O0ZuLmRlZmF1bHQ9S247dmFyIFpuPXt9O2Z1bmN0aW9uIEpuKHQpe3JldHVybihKbj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9ZnVuY3Rpb24gUW4odCxlLG4pe3JldHVybihRbj1cInVuZGVmaW5lZFwiIT10eXBlb2YgUmVmbGVjdCYmUmVmbGVjdC5nZXQ/UmVmbGVjdC5nZXQ6ZnVuY3Rpb24odCxlLG4pe3ZhciByPWZ1bmN0aW9uKHQsZSl7Zm9yKDshT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsZSkmJm51bGwhPT0odD1ucih0KSk7KTtyZXR1cm4gdH0odCxlKTtpZihyKXt2YXIgbz1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHIsZSk7cmV0dXJuIG8uZ2V0P28uZ2V0LmNhbGwobik6by52YWx1ZX19KSh0LGUsbnx8dCl9ZnVuY3Rpb24gdHIodCxlKXtyZXR1cm4odHI9T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIGVyKHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1KbihlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9mdW5jdGlvbih0KXtpZih2b2lkIDA9PT10KXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4gdH0odCk6ZX1mdW5jdGlvbiBucih0KXtyZXR1cm4obnI9T2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5nZXRQcm90b3R5cGVPZjpmdW5jdGlvbih0KXtyZXR1cm4gdC5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0KX0pKHQpfWZ1bmN0aW9uIHJyKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiBvcih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gaXIodCxlLG4pe3JldHVybiBlJiZvcih0LnByb3RvdHlwZSxlKSxuJiZvcih0LG4pLHR9ZnVuY3Rpb24gYXIodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShabixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxabi5pbml0U2NvcGU9bHIsWm4uU2NvcGU9dm9pZCAwO3ZhciBzcj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt2YXIgZT10aGlzO3JyKHRoaXMsdCksYXIodGhpcyxcImlkXCIsXCJfX2ludGVyYWN0X3Njb3BlX1wiLmNvbmNhdChNYXRoLmZsb29yKDEwMCpNYXRoLnJhbmRvbSgpKSkpLGFyKHRoaXMsXCJpc0luaXRpYWxpemVkXCIsITEpLGFyKHRoaXMsXCJsaXN0ZW5lck1hcHNcIixbXSksYXIodGhpcyxcImJyb3dzZXJcIixiLmRlZmF1bHQpLGFyKHRoaXMsXCJkZWZhdWx0c1wiLCgwLGdlLmRlZmF1bHQpKE1lLmRlZmF1bHRzKSksYXIodGhpcyxcIkV2ZW50YWJsZVwiLGNuLkV2ZW50YWJsZSksYXIodGhpcyxcImFjdGlvbnNcIix7bWFwOnt9LHBoYXNlczp7c3RhcnQ6ITAsbW92ZTohMCxlbmQ6ITB9LG1ldGhvZERpY3Q6e30scGhhc2VsZXNzVHlwZXM6e319KSxhcih0aGlzLFwiaW50ZXJhY3RTdGF0aWNcIiwoMCxnbi5jcmVhdGVJbnRlcmFjdFN0YXRpYykodGhpcykpLGFyKHRoaXMsXCJJbnRlcmFjdEV2ZW50XCIsamUuSW50ZXJhY3RFdmVudCksYXIodGhpcyxcIkludGVyYWN0YWJsZVwiLHZvaWQgMCksYXIodGhpcyxcImludGVyYWN0YWJsZXNcIixuZXcgd24uSW50ZXJhY3RhYmxlU2V0KHRoaXMpKSxhcih0aGlzLFwiX3dpblwiLHZvaWQgMCksYXIodGhpcyxcImRvY3VtZW50XCIsdm9pZCAwKSxhcih0aGlzLFwid2luZG93XCIsdm9pZCAwKSxhcih0aGlzLFwiZG9jdW1lbnRzXCIsW10pLGFyKHRoaXMsXCJfcGx1Z2luc1wiLHtsaXN0OltdLG1hcDp7fX0pLGFyKHRoaXMsXCJvbldpbmRvd1VubG9hZFwiLChmdW5jdGlvbih0KXtyZXR1cm4gZS5yZW1vdmVEb2N1bWVudCh0LnRhcmdldCl9KSk7dmFyIG49dGhpczt0aGlzLkludGVyYWN0YWJsZT1mdW5jdGlvbih0KXshZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7dC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLGUmJnRyKHQsZSl9KGksdCk7dmFyIGUscixvPShlPWkscj1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBSZWZsZWN0fHwhUmVmbGVjdC5jb25zdHJ1Y3QpcmV0dXJuITE7aWYoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSlyZXR1cm4hMTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm94eSlyZXR1cm4hMDt0cnl7cmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLFtdLChmdW5jdGlvbigpe30pKSksITB9Y2F0Y2godCl7cmV0dXJuITF9fSgpLGZ1bmN0aW9uKCl7dmFyIHQsbj1ucihlKTtpZihyKXt2YXIgbz1ucih0aGlzKS5jb25zdHJ1Y3Rvcjt0PVJlZmxlY3QuY29uc3RydWN0KG4sYXJndW1lbnRzLG8pfWVsc2UgdD1uLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gZXIodGhpcyx0KX0pO2Z1bmN0aW9uIGkoKXtyZXR1cm4gcnIodGhpcyxpKSxvLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gaXIoaSxbe2tleTpcIl9kZWZhdWx0c1wiLGdldDpmdW5jdGlvbigpe3JldHVybiBuLmRlZmF1bHRzfX0se2tleTpcInNldFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiBRbihucihpLnByb3RvdHlwZSksXCJzZXRcIix0aGlzKS5jYWxsKHRoaXMsdCksbi5maXJlKFwiaW50ZXJhY3RhYmxlOnNldFwiLHtvcHRpb25zOnQsaW50ZXJhY3RhYmxlOnRoaXN9KSx0aGlzfX0se2tleTpcInVuc2V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtRbihucihpLnByb3RvdHlwZSksXCJ1bnNldFwiLHRoaXMpLmNhbGwodGhpcyksbi5pbnRlcmFjdGFibGVzLmxpc3Quc3BsaWNlKG4uaW50ZXJhY3RhYmxlcy5saXN0LmluZGV4T2YodGhpcyksMSksbi5maXJlKFwiaW50ZXJhY3RhYmxlOnVuc2V0XCIse2ludGVyYWN0YWJsZTp0aGlzfSl9fV0pLGl9KHluLkludGVyYWN0YWJsZSl9cmV0dXJuIGlyKHQsW3trZXk6XCJhZGRMaXN0ZW5lcnNcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3RoaXMubGlzdGVuZXJNYXBzLnB1c2goe2lkOmUsbWFwOnR9KX19LHtrZXk6XCJmaXJlXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49MDtuPHRoaXMubGlzdGVuZXJNYXBzLmxlbmd0aDtuKyspe3ZhciByPXRoaXMubGlzdGVuZXJNYXBzW25dLm1hcFt0XTtpZihyJiYhMT09PXIoZSx0aGlzLHQpKXJldHVybiExfX19LHtrZXk6XCJpbml0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuaXNJbml0aWFsaXplZD90aGlzOmxyKHRoaXMsdCl9fSx7a2V5OlwicGx1Z2luSXNJbnN0YWxsZWRcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fcGx1Z2lucy5tYXBbdC5pZF18fC0xIT09dGhpcy5fcGx1Z2lucy5saXN0LmluZGV4T2YodCl9fSx7a2V5OlwidXNlUGx1Z2luXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtpZighdGhpcy5pc0luaXRpYWxpemVkKXJldHVybiB0aGlzO2lmKHRoaXMucGx1Z2luSXNJbnN0YWxsZWQodCkpcmV0dXJuIHRoaXM7aWYodC5pZCYmKHRoaXMuX3BsdWdpbnMubWFwW3QuaWRdPXQpLHRoaXMuX3BsdWdpbnMubGlzdC5wdXNoKHQpLHQuaW5zdGFsbCYmdC5pbnN0YWxsKHRoaXMsZSksdC5saXN0ZW5lcnMmJnQuYmVmb3JlKXtmb3IodmFyIG49MCxyPXRoaXMubGlzdGVuZXJNYXBzLmxlbmd0aCxvPXQuYmVmb3JlLnJlZHVjZSgoZnVuY3Rpb24odCxlKXtyZXR1cm4gdFtlXT0hMCx0W3VyKGUpXT0hMCx0fSkse30pO248cjtuKyspe3ZhciBpPXRoaXMubGlzdGVuZXJNYXBzW25dLmlkO2lmKG9baV18fG9bdXIoaSldKWJyZWFrfXRoaXMubGlzdGVuZXJNYXBzLnNwbGljZShuLDAse2lkOnQuaWQsbWFwOnQubGlzdGVuZXJzfSl9ZWxzZSB0Lmxpc3RlbmVycyYmdGhpcy5saXN0ZW5lck1hcHMucHVzaCh7aWQ6dC5pZCxtYXA6dC5saXN0ZW5lcnN9KTtyZXR1cm4gdGhpc319LHtrZXk6XCJhZGREb2N1bWVudFwiLHZhbHVlOmZ1bmN0aW9uKHQsbil7aWYoLTEhPT10aGlzLmdldERvY0luZGV4KHQpKXJldHVybiExO3ZhciByPWUuZ2V0V2luZG93KHQpO249bj8oMCxqLmRlZmF1bHQpKHt9LG4pOnt9LHRoaXMuZG9jdW1lbnRzLnB1c2goe2RvYzp0LG9wdGlvbnM6bn0pLHRoaXMuZXZlbnRzLmRvY3VtZW50cy5wdXNoKHQpLHQhPT10aGlzLmRvY3VtZW50JiZ0aGlzLmV2ZW50cy5hZGQocixcInVubG9hZFwiLHRoaXMub25XaW5kb3dVbmxvYWQpLHRoaXMuZmlyZShcInNjb3BlOmFkZC1kb2N1bWVudFwiLHtkb2M6dCx3aW5kb3c6cixzY29wZTp0aGlzLG9wdGlvbnM6bn0pfX0se2tleTpcInJlbW92ZURvY3VtZW50XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIG49dGhpcy5nZXREb2NJbmRleCh0KSxyPWUuZ2V0V2luZG93KHQpLG89dGhpcy5kb2N1bWVudHNbbl0ub3B0aW9uczt0aGlzLmV2ZW50cy5yZW1vdmUocixcInVubG9hZFwiLHRoaXMub25XaW5kb3dVbmxvYWQpLHRoaXMuZG9jdW1lbnRzLnNwbGljZShuLDEpLHRoaXMuZXZlbnRzLmRvY3VtZW50cy5zcGxpY2UobiwxKSx0aGlzLmZpcmUoXCJzY29wZTpyZW1vdmUtZG9jdW1lbnRcIix7ZG9jOnQsd2luZG93OnIsc2NvcGU6dGhpcyxvcHRpb25zOm99KX19LHtrZXk6XCJnZXREb2NJbmRleFwiLHZhbHVlOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dGhpcy5kb2N1bWVudHMubGVuZ3RoO2UrKylpZih0aGlzLmRvY3VtZW50c1tlXS5kb2M9PT10KXJldHVybiBlO3JldHVybi0xfX0se2tleTpcImdldERvY09wdGlvbnNcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldERvY0luZGV4KHQpO3JldHVybi0xPT09ZT9udWxsOnRoaXMuZG9jdW1lbnRzW2VdLm9wdGlvbnN9fSx7a2V5Olwibm93XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy53aW5kb3cuRGF0ZXx8RGF0ZSkubm93KCl9fV0pLHR9KCk7ZnVuY3Rpb24gbHIodCxuKXtyZXR1cm4gdC5pc0luaXRpYWxpemVkPSEwLGkuZGVmYXVsdC53aW5kb3cobikmJmUuaW5pdChuKSxoLmRlZmF1bHQuaW5pdChuKSxiLmRlZmF1bHQuaW5pdChuKSxqdC5kZWZhdWx0LmluaXQobiksdC53aW5kb3c9bix0LmRvY3VtZW50PW4uZG9jdW1lbnQsdC51c2VQbHVnaW4oRm4uZGVmYXVsdCksdC51c2VQbHVnaW4oU24uZGVmYXVsdCksdH1mdW5jdGlvbiB1cih0KXtyZXR1cm4gdCYmdC5yZXBsYWNlKC9cXC8uKiQvLFwiXCIpfVpuLlNjb3BlPXNyO3ZhciBjcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoY3IsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksY3IuZGVmYXVsdD12b2lkIDA7dmFyIGZyPW5ldyBabi5TY29wZSxkcj1mci5pbnRlcmFjdFN0YXRpYztjci5kZWZhdWx0PWRyO3ZhciBwcj1cInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsVGhpcz9nbG9iYWxUaGlzOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnZvaWQgMDtmci5pbml0KHByKTt2YXIgdnI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHZyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHZyLmRlZmF1bHQ9dm9pZCAwLHZyLmRlZmF1bHQ9ZnVuY3Rpb24oKXt9O3ZhciBocj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoaHIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaHIuZGVmYXVsdD12b2lkIDAsaHIuZGVmYXVsdD1mdW5jdGlvbigpe307dmFyIGdyPXt9O2Z1bmN0aW9uIHlyKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KHQpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0odCxlKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gbXIodCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP21yKHQsZSk6dm9pZCAwfX0odCxlKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpfWZ1bmN0aW9uIG1yKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1PYmplY3QuZGVmaW5lUHJvcGVydHkoZ3IsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZ3IuZGVmYXVsdD12b2lkIDAsZ3IuZGVmYXVsdD1mdW5jdGlvbih0KXt2YXIgZT1bW1wieFwiLFwieVwiXSxbXCJsZWZ0XCIsXCJ0b3BcIl0sW1wicmlnaHRcIixcImJvdHRvbVwiXSxbXCJ3aWR0aFwiLFwiaGVpZ2h0XCJdXS5maWx0ZXIoKGZ1bmN0aW9uKGUpe3ZhciBuPXlyKGUsMikscj1uWzBdLG89blsxXTtyZXR1cm4gciBpbiB0fHxvIGluIHR9KSksbj1mdW5jdGlvbihuLHIpe2Zvcih2YXIgbz10LnJhbmdlLGk9dC5saW1pdHMsYT12b2lkIDA9PT1pP3tsZWZ0Oi0xLzAscmlnaHQ6MS8wLHRvcDotMS8wLGJvdHRvbToxLzB9Omkscz10Lm9mZnNldCxsPXZvaWQgMD09PXM/e3g6MCx5OjB9OnMsdT17cmFuZ2U6byxncmlkOnQseDpudWxsLHk6bnVsbH0sYz0wO2M8ZS5sZW5ndGg7YysrKXt2YXIgZj15cihlW2NdLDIpLGQ9ZlswXSxwPWZbMV0sdj1NYXRoLnJvdW5kKChuLWwueCkvdFtkXSksaD1NYXRoLnJvdW5kKChyLWwueSkvdFtwXSk7dVtkXT1NYXRoLm1heChhLmxlZnQsTWF0aC5taW4oYS5yaWdodCx2KnRbZF0rbC54KSksdVtwXT1NYXRoLm1heChhLnRvcCxNYXRoLm1pbihhLmJvdHRvbSxoKnRbcF0rbC55KSl9cmV0dXJuIHV9O3JldHVybiBuLmdyaWQ9dCxuLmNvb3JkRmllbGRzPWUsbn07dmFyIGJyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShicixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYnIsXCJlZGdlVGFyZ2V0XCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHZyLmRlZmF1bHR9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGJyLFwiZWxlbWVudHNcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gaHIuZGVmYXVsdH19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYnIsXCJncmlkXCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGdyLmRlZmF1bHR9fSk7dmFyIHhyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh4cixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx4ci5kZWZhdWx0PXZvaWQgMDt2YXIgd3I9e2lkOlwic25hcHBlcnNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RTdGF0aWM7ZS5zbmFwcGVycz0oMCxqLmRlZmF1bHQpKGUuc25hcHBlcnN8fHt9LGJyKSxlLmNyZWF0ZVNuYXBHcmlkPWUuc25hcHBlcnMuZ3JpZH19O3hyLmRlZmF1bHQ9d3I7dmFyIF9yPXt9O2Z1bmN0aW9uIFByKHQsZSl7dmFyIG49T2JqZWN0LmtleXModCk7aWYoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyl7dmFyIHI9T2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyh0KTtlJiYocj1yLmZpbHRlcigoZnVuY3Rpb24oZSl7cmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCxlKS5lbnVtZXJhYmxlfSkpKSxuLnB1c2guYXBwbHkobixyKX1yZXR1cm4gbn1mdW5jdGlvbiBPcih0KXtmb3IodmFyIGU9MTtlPGFyZ3VtZW50cy5sZW5ndGg7ZSsrKXt2YXIgbj1udWxsIT1hcmd1bWVudHNbZV0/YXJndW1lbnRzW2VdOnt9O2UlMj9QcihPYmplY3QobiksITApLmZvckVhY2goKGZ1bmN0aW9uKGUpe1NyKHQsZSxuW2VdKX0pKTpPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycz9PYmplY3QuZGVmaW5lUHJvcGVydGllcyh0LE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG4pKTpQcihPYmplY3QobikpLmZvckVhY2goKGZ1bmN0aW9uKGUpe09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUsT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuLGUpKX0pKX1yZXR1cm4gdH1mdW5jdGlvbiBTcih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KF9yLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLF9yLmFzcGVjdFJhdGlvPV9yLmRlZmF1bHQ9dm9pZCAwO3ZhciBFcj17c3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5zdGF0ZSxuPXQucmVjdCxyPXQuZWRnZXMsbz10LnBhZ2VDb29yZHMsaT1lLm9wdGlvbnMucmF0aW8sYT1lLm9wdGlvbnMscz1hLmVxdWFsRGVsdGEsbD1hLm1vZGlmaWVycztcInByZXNlcnZlXCI9PT1pJiYoaT1uLndpZHRoL24uaGVpZ2h0KSxlLnN0YXJ0Q29vcmRzPSgwLGouZGVmYXVsdCkoe30sbyksZS5zdGFydFJlY3Q9KDAsai5kZWZhdWx0KSh7fSxuKSxlLnJhdGlvPWksZS5lcXVhbERlbHRhPXM7dmFyIHU9ZS5saW5rZWRFZGdlcz17dG9wOnIudG9wfHxyLmxlZnQmJiFyLmJvdHRvbSxsZWZ0OnIubGVmdHx8ci50b3AmJiFyLnJpZ2h0LGJvdHRvbTpyLmJvdHRvbXx8ci5yaWdodCYmIXIudG9wLHJpZ2h0OnIucmlnaHR8fHIuYm90dG9tJiYhci5sZWZ0fTtpZihlLnhJc1ByaW1hcnlBeGlzPSEoIXIubGVmdCYmIXIucmlnaHQpLGUuZXF1YWxEZWx0YSllLmVkZ2VTaWduPSh1LmxlZnQ/MTotMSkqKHUudG9wPzE6LTEpO2Vsc2V7dmFyIGM9ZS54SXNQcmltYXJ5QXhpcz91LnRvcDp1LmxlZnQ7ZS5lZGdlU2lnbj1jPy0xOjF9aWYoKDAsai5kZWZhdWx0KSh0LmVkZ2VzLHUpLGwmJmwubGVuZ3RoKXt2YXIgZj1uZXcgeWUuZGVmYXVsdCh0LmludGVyYWN0aW9uKTtmLmNvcHlGcm9tKHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uKSxmLnByZXBhcmVTdGF0ZXMobCksZS5zdWJNb2RpZmljYXRpb249ZixmLnN0YXJ0QWxsKE9yKHt9LHQpKX19LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LnN0YXRlLG49dC5yZWN0LHI9dC5jb29yZHMsbz0oMCxqLmRlZmF1bHQpKHt9LHIpLGk9ZS5lcXVhbERlbHRhP1RyOk1yO2lmKGkoZSxlLnhJc1ByaW1hcnlBeGlzLHIsbiksIWUuc3ViTW9kaWZpY2F0aW9uKXJldHVybiBudWxsO3ZhciBhPSgwLGouZGVmYXVsdCkoe30sbik7KDAsay5hZGRFZGdlcykoZS5saW5rZWRFZGdlcyxhLHt4OnIueC1vLngseTpyLnktby55fSk7dmFyIHM9ZS5zdWJNb2RpZmljYXRpb24uc2V0QWxsKE9yKE9yKHt9LHQpLHt9LHtyZWN0OmEsZWRnZXM6ZS5saW5rZWRFZGdlcyxwYWdlQ29vcmRzOnIscHJldkNvb3JkczpyLHByZXZSZWN0OmF9KSksbD1zLmRlbHRhO3JldHVybiBzLmNoYW5nZWQmJihpKGUsTWF0aC5hYnMobC54KT5NYXRoLmFicyhsLnkpLHMuY29vcmRzLHMucmVjdCksKDAsai5kZWZhdWx0KShyLHMuY29vcmRzKSkscy5ldmVudFByb3BzfSxkZWZhdWx0czp7cmF0aW86XCJwcmVzZXJ2ZVwiLGVxdWFsRGVsdGE6ITEsbW9kaWZpZXJzOltdLGVuYWJsZWQ6ITF9fTtmdW5jdGlvbiBUcih0LGUsbil7dmFyIHI9dC5zdGFydENvb3JkcyxvPXQuZWRnZVNpZ247ZT9uLnk9ci55KyhuLngtci54KSpvOm4ueD1yLngrKG4ueS1yLnkpKm99ZnVuY3Rpb24gTXIodCxlLG4scil7dmFyIG89dC5zdGFydFJlY3QsaT10LnN0YXJ0Q29vcmRzLGE9dC5yYXRpbyxzPXQuZWRnZVNpZ247aWYoZSl7dmFyIGw9ci53aWR0aC9hO24ueT1pLnkrKGwtby5oZWlnaHQpKnN9ZWxzZXt2YXIgdT1yLmhlaWdodCphO24ueD1pLngrKHUtby53aWR0aCkqc319X3IuYXNwZWN0UmF0aW89RXI7dmFyIGpyPSgwLFNlLm1ha2VNb2RpZmllcikoRXIsXCJhc3BlY3RSYXRpb1wiKTtfci5kZWZhdWx0PWpyO3ZhciBrcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoa3IsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksa3IuZGVmYXVsdD12b2lkIDA7dmFyIElyPWZ1bmN0aW9uKCl7fTtJci5fZGVmYXVsdHM9e307dmFyIERyPUlyO2tyLmRlZmF1bHQ9RHI7dmFyIEFyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShBcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoQXIsXCJkZWZhdWx0XCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGtyLmRlZmF1bHR9fSk7dmFyIFJyPXt9O2Z1bmN0aW9uIHpyKHQsZSxuKXtyZXR1cm4gaS5kZWZhdWx0LmZ1bmModCk/ay5yZXNvbHZlUmVjdExpa2UodCxlLmludGVyYWN0YWJsZSxlLmVsZW1lbnQsW24ueCxuLnksZV0pOmsucmVzb2x2ZVJlY3RMaWtlKHQsZS5pbnRlcmFjdGFibGUsZS5lbGVtZW50KX1PYmplY3QuZGVmaW5lUHJvcGVydHkoUnIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksUnIuZ2V0UmVzdHJpY3Rpb25SZWN0PXpyLFJyLnJlc3RyaWN0PVJyLmRlZmF1bHQ9dm9pZCAwO3ZhciBDcj17c3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5yZWN0LG49dC5zdGFydE9mZnNldCxyPXQuc3RhdGUsbz10LmludGVyYWN0aW9uLGk9dC5wYWdlQ29vcmRzLGE9ci5vcHRpb25zLHM9YS5lbGVtZW50UmVjdCxsPSgwLGouZGVmYXVsdCkoe2xlZnQ6MCx0b3A6MCxyaWdodDowLGJvdHRvbTowfSxhLm9mZnNldHx8e30pO2lmKGUmJnMpe3ZhciB1PXpyKGEucmVzdHJpY3Rpb24sbyxpKTtpZih1KXt2YXIgYz11LnJpZ2h0LXUubGVmdC1lLndpZHRoLGY9dS5ib3R0b20tdS50b3AtZS5oZWlnaHQ7YzwwJiYobC5sZWZ0Kz1jLGwucmlnaHQrPWMpLGY8MCYmKGwudG9wKz1mLGwuYm90dG9tKz1mKX1sLmxlZnQrPW4ubGVmdC1lLndpZHRoKnMubGVmdCxsLnRvcCs9bi50b3AtZS5oZWlnaHQqcy50b3AsbC5yaWdodCs9bi5yaWdodC1lLndpZHRoKigxLXMucmlnaHQpLGwuYm90dG9tKz1uLmJvdHRvbS1lLmhlaWdodCooMS1zLmJvdHRvbSl9ci5vZmZzZXQ9bH0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuY29vcmRzLG49dC5pbnRlcmFjdGlvbixyPXQuc3RhdGUsbz1yLm9wdGlvbnMsaT1yLm9mZnNldCxhPXpyKG8ucmVzdHJpY3Rpb24sbixlKTtpZihhKXt2YXIgcz1rLnh5d2hUb1RsYnIoYSk7ZS54PU1hdGgubWF4KE1hdGgubWluKHMucmlnaHQtaS5yaWdodCxlLngpLHMubGVmdCtpLmxlZnQpLGUueT1NYXRoLm1heChNYXRoLm1pbihzLmJvdHRvbS1pLmJvdHRvbSxlLnkpLHMudG9wK2kudG9wKX19LGRlZmF1bHRzOntyZXN0cmljdGlvbjpudWxsLGVsZW1lbnRSZWN0Om51bGwsb2Zmc2V0Om51bGwsZW5kT25seTohMSxlbmFibGVkOiExfX07UnIucmVzdHJpY3Q9Q3I7dmFyIEZyPSgwLFNlLm1ha2VNb2RpZmllcikoQ3IsXCJyZXN0cmljdFwiKTtSci5kZWZhdWx0PUZyO3ZhciBYcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoWHIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWHIucmVzdHJpY3RFZGdlcz1Yci5kZWZhdWx0PXZvaWQgMDt2YXIgWXI9e3RvcDoxLzAsbGVmdDoxLzAsYm90dG9tOi0xLzAscmlnaHQ6LTEvMH0sQnI9e3RvcDotMS8wLGxlZnQ6LTEvMCxib3R0b206MS8wLHJpZ2h0OjEvMH07ZnVuY3Rpb24gV3IodCxlKXtmb3IodmFyIG49W1widG9wXCIsXCJsZWZ0XCIsXCJib3R0b21cIixcInJpZ2h0XCJdLHI9MDtyPG4ubGVuZ3RoO3IrKyl7dmFyIG89bltyXTtvIGluIHR8fCh0W29dPWVbb10pfXJldHVybiB0fXZhciBMcj17bm9Jbm5lcjpZcixub091dGVyOkJyLHN0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlLG49dC5pbnRlcmFjdGlvbixyPXQuc3RhcnRPZmZzZXQsbz10LnN0YXRlLGk9by5vcHRpb25zO2lmKGkpe3ZhciBhPSgwLFJyLmdldFJlc3RyaWN0aW9uUmVjdCkoaS5vZmZzZXQsbixuLmNvb3Jkcy5zdGFydC5wYWdlKTtlPWsucmVjdFRvWFkoYSl9ZT1lfHx7eDowLHk6MH0sby5vZmZzZXQ9e3RvcDplLnkrci50b3AsbGVmdDplLngrci5sZWZ0LGJvdHRvbTplLnktci5ib3R0b20scmlnaHQ6ZS54LXIucmlnaHR9fSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5jb29yZHMsbj10LmVkZ2VzLHI9dC5pbnRlcmFjdGlvbixvPXQuc3RhdGUsaT1vLm9mZnNldCxhPW8ub3B0aW9ucztpZihuKXt2YXIgcz0oMCxqLmRlZmF1bHQpKHt9LGUpLGw9KDAsUnIuZ2V0UmVzdHJpY3Rpb25SZWN0KShhLmlubmVyLHIscyl8fHt9LHU9KDAsUnIuZ2V0UmVzdHJpY3Rpb25SZWN0KShhLm91dGVyLHIscyl8fHt9O1dyKGwsWXIpLFdyKHUsQnIpLG4udG9wP2UueT1NYXRoLm1pbihNYXRoLm1heCh1LnRvcCtpLnRvcCxzLnkpLGwudG9wK2kudG9wKTpuLmJvdHRvbSYmKGUueT1NYXRoLm1heChNYXRoLm1pbih1LmJvdHRvbStpLmJvdHRvbSxzLnkpLGwuYm90dG9tK2kuYm90dG9tKSksbi5sZWZ0P2UueD1NYXRoLm1pbihNYXRoLm1heCh1LmxlZnQraS5sZWZ0LHMueCksbC5sZWZ0K2kubGVmdCk6bi5yaWdodCYmKGUueD1NYXRoLm1heChNYXRoLm1pbih1LnJpZ2h0K2kucmlnaHQscy54KSxsLnJpZ2h0K2kucmlnaHQpKX19LGRlZmF1bHRzOntpbm5lcjpudWxsLG91dGVyOm51bGwsb2Zmc2V0Om51bGwsZW5kT25seTohMSxlbmFibGVkOiExfX07WHIucmVzdHJpY3RFZGdlcz1Mcjt2YXIgVXI9KDAsU2UubWFrZU1vZGlmaWVyKShMcixcInJlc3RyaWN0RWRnZXNcIik7WHIuZGVmYXVsdD1Vcjt2YXIgVnI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFZyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFZyLnJlc3RyaWN0UmVjdD1Wci5kZWZhdWx0PXZvaWQgMDt2YXIgTnI9KDAsai5kZWZhdWx0KSh7Z2V0IGVsZW1lbnRSZWN0KCl7cmV0dXJue3RvcDowLGxlZnQ6MCxib3R0b206MSxyaWdodDoxfX0sc2V0IGVsZW1lbnRSZWN0KHQpe319LFJyLnJlc3RyaWN0LmRlZmF1bHRzKSxxcj17c3RhcnQ6UnIucmVzdHJpY3Quc3RhcnQsc2V0OlJyLnJlc3RyaWN0LnNldCxkZWZhdWx0czpOcn07VnIucmVzdHJpY3RSZWN0PXFyO3ZhciAkcj0oMCxTZS5tYWtlTW9kaWZpZXIpKHFyLFwicmVzdHJpY3RSZWN0XCIpO1ZyLmRlZmF1bHQ9JHI7dmFyIEdyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShHcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxHci5yZXN0cmljdFNpemU9R3IuZGVmYXVsdD12b2lkIDA7dmFyIEhyPXt3aWR0aDotMS8wLGhlaWdodDotMS8wfSxLcj17d2lkdGg6MS8wLGhlaWdodDoxLzB9LFpyPXtzdGFydDpmdW5jdGlvbih0KXtyZXR1cm4gWHIucmVzdHJpY3RFZGdlcy5zdGFydCh0KX0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LnN0YXRlLHI9dC5yZWN0LG89dC5lZGdlcyxpPW4ub3B0aW9ucztpZihvKXt2YXIgYT1rLnRsYnJUb1h5d2goKDAsUnIuZ2V0UmVzdHJpY3Rpb25SZWN0KShpLm1pbixlLHQuY29vcmRzKSl8fEhyLHM9ay50bGJyVG9YeXdoKCgwLFJyLmdldFJlc3RyaWN0aW9uUmVjdCkoaS5tYXgsZSx0LmNvb3JkcykpfHxLcjtuLm9wdGlvbnM9e2VuZE9ubHk6aS5lbmRPbmx5LGlubmVyOigwLGouZGVmYXVsdCkoe30sWHIucmVzdHJpY3RFZGdlcy5ub0lubmVyKSxvdXRlcjooMCxqLmRlZmF1bHQpKHt9LFhyLnJlc3RyaWN0RWRnZXMubm9PdXRlcil9LG8udG9wPyhuLm9wdGlvbnMuaW5uZXIudG9wPXIuYm90dG9tLWEuaGVpZ2h0LG4ub3B0aW9ucy5vdXRlci50b3A9ci5ib3R0b20tcy5oZWlnaHQpOm8uYm90dG9tJiYobi5vcHRpb25zLmlubmVyLmJvdHRvbT1yLnRvcCthLmhlaWdodCxuLm9wdGlvbnMub3V0ZXIuYm90dG9tPXIudG9wK3MuaGVpZ2h0KSxvLmxlZnQ/KG4ub3B0aW9ucy5pbm5lci5sZWZ0PXIucmlnaHQtYS53aWR0aCxuLm9wdGlvbnMub3V0ZXIubGVmdD1yLnJpZ2h0LXMud2lkdGgpOm8ucmlnaHQmJihuLm9wdGlvbnMuaW5uZXIucmlnaHQ9ci5sZWZ0K2Eud2lkdGgsbi5vcHRpb25zLm91dGVyLnJpZ2h0PXIubGVmdCtzLndpZHRoKSxYci5yZXN0cmljdEVkZ2VzLnNldCh0KSxuLm9wdGlvbnM9aX19LGRlZmF1bHRzOnttaW46bnVsbCxtYXg6bnVsbCxlbmRPbmx5OiExLGVuYWJsZWQ6ITF9fTtHci5yZXN0cmljdFNpemU9WnI7dmFyIEpyPSgwLFNlLm1ha2VNb2RpZmllcikoWnIsXCJyZXN0cmljdFNpemVcIik7R3IuZGVmYXVsdD1Kcjt2YXIgUXI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFFyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShRcixcImRlZmF1bHRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4ga3IuZGVmYXVsdH19KTt2YXIgdG89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHRvLnNuYXA9dG8uZGVmYXVsdD12b2lkIDA7dmFyIGVvPXtzdGFydDpmdW5jdGlvbih0KXt2YXIgZSxuPXQuaW50ZXJhY3Rpb24scj10LmludGVyYWN0YWJsZSxvPXQuZWxlbWVudCxpPXQucmVjdCxhPXQuc3RhdGUscz10LnN0YXJ0T2Zmc2V0LGw9YS5vcHRpb25zLHU9bC5vZmZzZXRXaXRoT3JpZ2luP2Z1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24uZWxlbWVudDtyZXR1cm4oMCxrLnJlY3RUb1hZKSgoMCxrLnJlc29sdmVSZWN0TGlrZSkodC5zdGF0ZS5vcHRpb25zLm9yaWdpbixudWxsLG51bGwsW2VdKSl8fCgwLEEuZGVmYXVsdCkodC5pbnRlcmFjdGFibGUsZSx0LmludGVyYWN0aW9uLnByZXBhcmVkLm5hbWUpfSh0KTp7eDowLHk6MH07aWYoXCJzdGFydENvb3Jkc1wiPT09bC5vZmZzZXQpZT17eDpuLmNvb3Jkcy5zdGFydC5wYWdlLngseTpuLmNvb3Jkcy5zdGFydC5wYWdlLnl9O2Vsc2V7dmFyIGM9KDAsay5yZXNvbHZlUmVjdExpa2UpKGwub2Zmc2V0LHIsbyxbbl0pOyhlPSgwLGsucmVjdFRvWFkpKGMpfHx7eDowLHk6MH0pLngrPXUueCxlLnkrPXUueX12YXIgZj1sLnJlbGF0aXZlUG9pbnRzO2Eub2Zmc2V0cz1pJiZmJiZmLmxlbmd0aD9mLm1hcCgoZnVuY3Rpb24odCxuKXtyZXR1cm57aW5kZXg6bixyZWxhdGl2ZVBvaW50OnQseDpzLmxlZnQtaS53aWR0aCp0LngrZS54LHk6cy50b3AtaS5oZWlnaHQqdC55K2UueX19KSk6W3tpbmRleDowLHJlbGF0aXZlUG9pbnQ6bnVsbCx4OmUueCx5OmUueX1dfSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuY29vcmRzLHI9dC5zdGF0ZSxvPXIub3B0aW9ucyxhPXIub2Zmc2V0cyxzPSgwLEEuZGVmYXVsdCkoZS5pbnRlcmFjdGFibGUsZS5lbGVtZW50LGUucHJlcGFyZWQubmFtZSksbD0oMCxqLmRlZmF1bHQpKHt9LG4pLHU9W107by5vZmZzZXRXaXRoT3JpZ2lufHwobC54LT1zLngsbC55LT1zLnkpO2Zvcih2YXIgYz0wO2M8YS5sZW5ndGg7YysrKWZvcih2YXIgZj1hW2NdLGQ9bC54LWYueCxwPWwueS1mLnksdj0wLGg9by50YXJnZXRzLmxlbmd0aDt2PGg7disrKXt2YXIgZyx5PW8udGFyZ2V0c1t2XTsoZz1pLmRlZmF1bHQuZnVuYyh5KT95KGQscCxlLl9wcm94eSxmLHYpOnkpJiZ1LnB1c2goe3g6KGkuZGVmYXVsdC5udW1iZXIoZy54KT9nLng6ZCkrZi54LHk6KGkuZGVmYXVsdC5udW1iZXIoZy55KT9nLnk6cCkrZi55LHJhbmdlOmkuZGVmYXVsdC5udW1iZXIoZy5yYW5nZSk/Zy5yYW5nZTpvLnJhbmdlLHNvdXJjZTp5LGluZGV4OnYsb2Zmc2V0OmZ9KX1mb3IodmFyIG09e3RhcmdldDpudWxsLGluUmFuZ2U6ITEsZGlzdGFuY2U6MCxyYW5nZTowLGRlbHRhOnt4OjAseTowfX0sYj0wO2I8dS5sZW5ndGg7YisrKXt2YXIgeD11W2JdLHc9eC5yYW5nZSxfPXgueC1sLngsUD14LnktbC55LE89KDAsQy5kZWZhdWx0KShfLFApLFM9Tzw9dzt3PT09MS8wJiZtLmluUmFuZ2UmJm0ucmFuZ2UhPT0xLzAmJihTPSExKSxtLnRhcmdldCYmIShTP20uaW5SYW5nZSYmdyE9PTEvMD9PL3c8bS5kaXN0YW5jZS9tLnJhbmdlOnc9PT0xLzAmJm0ucmFuZ2UhPT0xLzB8fE88bS5kaXN0YW5jZTohbS5pblJhbmdlJiZPPG0uZGlzdGFuY2UpfHwobS50YXJnZXQ9eCxtLmRpc3RhbmNlPU8sbS5yYW5nZT13LG0uaW5SYW5nZT1TLG0uZGVsdGEueD1fLG0uZGVsdGEueT1QKX1yZXR1cm4gbS5pblJhbmdlJiYobi54PW0udGFyZ2V0Lngsbi55PW0udGFyZ2V0LnkpLHIuY2xvc2VzdD1tLG19LGRlZmF1bHRzOntyYW5nZToxLzAsdGFyZ2V0czpudWxsLG9mZnNldDpudWxsLG9mZnNldFdpdGhPcmlnaW46ITAsb3JpZ2luOm51bGwscmVsYXRpdmVQb2ludHM6bnVsbCxlbmRPbmx5OiExLGVuYWJsZWQ6ITF9fTt0by5zbmFwPWVvO3ZhciBubz0oMCxTZS5tYWtlTW9kaWZpZXIpKGVvLFwic25hcFwiKTt0by5kZWZhdWx0PW5vO3ZhciBybz17fTtmdW5jdGlvbiBvbyh0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9T2JqZWN0LmRlZmluZVByb3BlcnR5KHJvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHJvLnNuYXBTaXplPXJvLmRlZmF1bHQ9dm9pZCAwO3ZhciBpbz17c3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5zdGF0ZSxuPXQuZWRnZXMscj1lLm9wdGlvbnM7aWYoIW4pcmV0dXJuIG51bGw7dC5zdGF0ZT17b3B0aW9uczp7dGFyZ2V0czpudWxsLHJlbGF0aXZlUG9pbnRzOlt7eDpuLmxlZnQ/MDoxLHk6bi50b3A/MDoxfV0sb2Zmc2V0OnIub2Zmc2V0fHxcInNlbGZcIixvcmlnaW46e3g6MCx5OjB9LHJhbmdlOnIucmFuZ2V9fSxlLnRhcmdldEZpZWxkcz1lLnRhcmdldEZpZWxkc3x8W1tcIndpZHRoXCIsXCJoZWlnaHRcIl0sW1wieFwiLFwieVwiXV0sdG8uc25hcC5zdGFydCh0KSxlLm9mZnNldHM9dC5zdGF0ZS5vZmZzZXRzLHQuc3RhdGU9ZX0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlLG4scj10LmludGVyYWN0aW9uLG89dC5zdGF0ZSxhPXQuY29vcmRzLHM9by5vcHRpb25zLGw9by5vZmZzZXRzLHU9e3g6YS54LWxbMF0ueCx5OmEueS1sWzBdLnl9O28ub3B0aW9ucz0oMCxqLmRlZmF1bHQpKHt9LHMpLG8ub3B0aW9ucy50YXJnZXRzPVtdO2Zvcih2YXIgYz0wO2M8KHMudGFyZ2V0c3x8W10pLmxlbmd0aDtjKyspe3ZhciBmPShzLnRhcmdldHN8fFtdKVtjXSxkPXZvaWQgMDtpZihkPWkuZGVmYXVsdC5mdW5jKGYpP2YodS54LHUueSxyKTpmKXtmb3IodmFyIHA9MDtwPG8udGFyZ2V0RmllbGRzLmxlbmd0aDtwKyspe3ZhciB2PShlPW8udGFyZ2V0RmllbGRzW3BdLG49MixmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0fShlKXx8ZnVuY3Rpb24odCxlKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXt2YXIgbj1bXSxyPSEwLG89ITEsaT12b2lkIDA7dHJ5e2Zvcih2YXIgYSxzPXRbU3ltYm9sLml0ZXJhdG9yXSgpOyEocj0oYT1zLm5leHQoKSkuZG9uZSkmJihuLnB1c2goYS52YWx1ZSksIWV8fG4ubGVuZ3RoIT09ZSk7cj0hMCk7fWNhdGNoKHQpe289ITAsaT10fWZpbmFsbHl7dHJ5e3J8fG51bGw9PXMucmV0dXJufHxzLnJldHVybigpfWZpbmFsbHl7aWYobyl0aHJvdyBpfX1yZXR1cm4gbn19KGUsbil8fGZ1bmN0aW9uKHQsZSl7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIG9vKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9vbyh0LGUpOnZvaWQgMH19KGUsbil8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX0oKSksaD12WzBdLGc9dlsxXTtpZihoIGluIGR8fGcgaW4gZCl7ZC54PWRbaF0sZC55PWRbZ107YnJlYWt9fW8ub3B0aW9ucy50YXJnZXRzLnB1c2goZCl9fXZhciB5PXRvLnNuYXAuc2V0KHQpO3JldHVybiBvLm9wdGlvbnM9cyx5fSxkZWZhdWx0czp7cmFuZ2U6MS8wLHRhcmdldHM6bnVsbCxvZmZzZXQ6bnVsbCxlbmRPbmx5OiExLGVuYWJsZWQ6ITF9fTtyby5zbmFwU2l6ZT1pbzt2YXIgYW89KDAsU2UubWFrZU1vZGlmaWVyKShpbyxcInNuYXBTaXplXCIpO3JvLmRlZmF1bHQ9YW87dmFyIHNvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShzbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxzby5zbmFwRWRnZXM9c28uZGVmYXVsdD12b2lkIDA7dmFyIGxvPXtzdGFydDpmdW5jdGlvbih0KXt2YXIgZT10LmVkZ2VzO3JldHVybiBlPyh0LnN0YXRlLnRhcmdldEZpZWxkcz10LnN0YXRlLnRhcmdldEZpZWxkc3x8W1tlLmxlZnQ/XCJsZWZ0XCI6XCJyaWdodFwiLGUudG9wP1widG9wXCI6XCJib3R0b21cIl1dLHJvLnNuYXBTaXplLnN0YXJ0KHQpKTpudWxsfSxzZXQ6cm8uc25hcFNpemUuc2V0LGRlZmF1bHRzOigwLGouZGVmYXVsdCkoKDAsZ2UuZGVmYXVsdCkocm8uc25hcFNpemUuZGVmYXVsdHMpLHt0YXJnZXRzOm51bGwscmFuZ2U6bnVsbCxvZmZzZXQ6e3g6MCx5OjB9fSl9O3NvLnNuYXBFZGdlcz1sbzt2YXIgdW89KDAsU2UubWFrZU1vZGlmaWVyKShsbyxcInNuYXBFZGdlc1wiKTtzby5kZWZhdWx0PXVvO3ZhciBjbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoY28sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvLFwiZGVmYXVsdFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBrci5kZWZhdWx0fX0pO3ZhciBmbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZm8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGZvLFwiZGVmYXVsdFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBrci5kZWZhdWx0fX0pO3ZhciBwbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkocG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkscG8uZGVmYXVsdD12b2lkIDA7dmFyIHZvPXthc3BlY3RSYXRpbzpfci5kZWZhdWx0LHJlc3RyaWN0RWRnZXM6WHIuZGVmYXVsdCxyZXN0cmljdDpSci5kZWZhdWx0LHJlc3RyaWN0UmVjdDpWci5kZWZhdWx0LHJlc3RyaWN0U2l6ZTpHci5kZWZhdWx0LHNuYXBFZGdlczpzby5kZWZhdWx0LHNuYXA6dG8uZGVmYXVsdCxzbmFwU2l6ZTpyby5kZWZhdWx0LHNwcmluZzpjby5kZWZhdWx0LGF2b2lkOkFyLmRlZmF1bHQsdHJhbnNmb3JtOmZvLmRlZmF1bHQscnViYmVyYmFuZDpRci5kZWZhdWx0fTtwby5kZWZhdWx0PXZvO3ZhciBobz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoaG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaG8uZGVmYXVsdD12b2lkIDA7dmFyIGdvPXtpZDpcIm1vZGlmaWVyc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdFN0YXRpYztmb3IodmFyIG4gaW4gdC51c2VQbHVnaW4oU2UuZGVmYXVsdCksdC51c2VQbHVnaW4oeHIuZGVmYXVsdCksZS5tb2RpZmllcnM9cG8uZGVmYXVsdCxwby5kZWZhdWx0KXt2YXIgcj1wby5kZWZhdWx0W25dLG89ci5fZGVmYXVsdHMsaT1yLl9tZXRob2RzO28uX21ldGhvZHM9aSx0LmRlZmF1bHRzLnBlckFjdGlvbltuXT1vfX19O2hvLmRlZmF1bHQ9Z287dmFyIHlvPXt9O2Z1bmN0aW9uIG1vKHQpe3JldHVybihtbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9ZnVuY3Rpb24gYm8odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIHhvKHQsZSl7cmV0dXJuKHhvPU9iamVjdC5zZXRQcm90b3R5cGVPZnx8ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5fX3Byb3RvX189ZSx0fSkodCxlKX1mdW5jdGlvbiB3byh0LGUpe3JldHVybiFlfHxcIm9iamVjdFwiIT09bW8oZSkmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGU/X28odCk6ZX1mdW5jdGlvbiBfbyh0KXtpZih2b2lkIDA9PT10KXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4gdH1mdW5jdGlvbiBQbyh0KXtyZXR1cm4oUG89T2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5nZXRQcm90b3R5cGVPZjpmdW5jdGlvbih0KXtyZXR1cm4gdC5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0KX0pKHQpfWZ1bmN0aW9uIE9vKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoeW8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkseW8uUG9pbnRlckV2ZW50PXlvLmRlZmF1bHQ9dm9pZCAwO3ZhciBTbz1mdW5jdGlvbih0KXshZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7dC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLGUmJnhvKHQsZSl9KGEsdCk7dmFyIGUsbixyLG8saT0ocj1hLG89ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LGU9UG8ocik7aWYobyl7dmFyIG49UG8odGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChlLGFyZ3VtZW50cyxuKX1lbHNlIHQ9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIHdvKHRoaXMsdCl9KTtmdW5jdGlvbiBhKHQsZSxuLHIsbyxzKXt2YXIgbDtpZihmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsYSksT28oX28obD1pLmNhbGwodGhpcyxvKSksXCJ0eXBlXCIsdm9pZCAwKSxPbyhfbyhsKSxcIm9yaWdpbmFsRXZlbnRcIix2b2lkIDApLE9vKF9vKGwpLFwicG9pbnRlcklkXCIsdm9pZCAwKSxPbyhfbyhsKSxcInBvaW50ZXJUeXBlXCIsdm9pZCAwKSxPbyhfbyhsKSxcImRvdWJsZVwiLHZvaWQgMCksT28oX28obCksXCJwYWdlWFwiLHZvaWQgMCksT28oX28obCksXCJwYWdlWVwiLHZvaWQgMCksT28oX28obCksXCJjbGllbnRYXCIsdm9pZCAwKSxPbyhfbyhsKSxcImNsaWVudFlcIix2b2lkIDApLE9vKF9vKGwpLFwiZHRcIix2b2lkIDApLE9vKF9vKGwpLFwiZXZlbnRhYmxlXCIsdm9pZCAwKSxCLnBvaW50ZXJFeHRlbmQoX28obCksbiksbiE9PWUmJkIucG9pbnRlckV4dGVuZChfbyhsKSxlKSxsLnRpbWVTdGFtcD1zLGwub3JpZ2luYWxFdmVudD1uLGwudHlwZT10LGwucG9pbnRlcklkPUIuZ2V0UG9pbnRlcklkKGUpLGwucG9pbnRlclR5cGU9Qi5nZXRQb2ludGVyVHlwZShlKSxsLnRhcmdldD1yLGwuY3VycmVudFRhcmdldD1udWxsLFwidGFwXCI9PT10KXt2YXIgdT1vLmdldFBvaW50ZXJJbmRleChlKTtsLmR0PWwudGltZVN0YW1wLW8ucG9pbnRlcnNbdV0uZG93blRpbWU7dmFyIGM9bC50aW1lU3RhbXAtby50YXBUaW1lO2wuZG91YmxlPSEhKG8ucHJldlRhcCYmXCJkb3VibGV0YXBcIiE9PW8ucHJldlRhcC50eXBlJiZvLnByZXZUYXAudGFyZ2V0PT09bC50YXJnZXQmJmM8NTAwKX1lbHNlXCJkb3VibGV0YXBcIj09PXQmJihsLmR0PWUudGltZVN0YW1wLW8udGFwVGltZSk7cmV0dXJuIGx9cmV0dXJuIGU9YSwobj1be2tleTpcIl9zdWJ0cmFjdE9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQueCxuPXQueTtyZXR1cm4gdGhpcy5wYWdlWC09ZSx0aGlzLnBhZ2VZLT1uLHRoaXMuY2xpZW50WC09ZSx0aGlzLmNsaWVudFktPW4sdGhpc319LHtrZXk6XCJfYWRkT3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC54LG49dC55O3JldHVybiB0aGlzLnBhZ2VYKz1lLHRoaXMucGFnZVkrPW4sdGhpcy5jbGllbnRYKz1lLHRoaXMuY2xpZW50WSs9bix0aGlzfX0se2tleTpcInByZXZlbnREZWZhdWx0XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKX19XSkmJmJvKGUucHJvdG90eXBlLG4pLGF9KCQuQmFzZUV2ZW50KTt5by5Qb2ludGVyRXZlbnQ9eW8uZGVmYXVsdD1Tbzt2YXIgRW89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEVvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEVvLmRlZmF1bHQ9dm9pZCAwO3ZhciBUbz17aWQ6XCJwb2ludGVyLWV2ZW50cy9iYXNlXCIsYmVmb3JlOltcImluZXJ0aWFcIixcIm1vZGlmaWVyc1wiLFwiYXV0by1zdGFydFwiLFwiYWN0aW9uc1wiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3QucG9pbnRlckV2ZW50cz1Ubyx0LmRlZmF1bHRzLmFjdGlvbnMucG9pbnRlckV2ZW50cz1Uby5kZWZhdWx0cywoMCxqLmRlZmF1bHQpKHQuYWN0aW9ucy5waGFzZWxlc3NUeXBlcyxUby50eXBlcyl9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtlLnByZXZUYXA9bnVsbCxlLnRhcFRpbWU9MH0sXCJpbnRlcmFjdGlvbnM6dXBkYXRlLXBvaW50ZXJcIjpmdW5jdGlvbih0KXt2YXIgZT10LmRvd24sbj10LnBvaW50ZXJJbmZvOyFlJiZuLmhvbGR8fChuLmhvbGQ9e2R1cmF0aW9uOjEvMCx0aW1lb3V0Om51bGx9KX0sXCJpbnRlcmFjdGlvbnM6bW92ZVwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0O3QuZHVwbGljYXRlfHxuLnBvaW50ZXJJc0Rvd24mJiFuLnBvaW50ZXJXYXNNb3ZlZHx8KG4ucG9pbnRlcklzRG93biYma28odCksTW8oe2ludGVyYWN0aW9uOm4scG9pbnRlcjpyLGV2ZW50Om8sZXZlbnRUYXJnZXQ6aSx0eXBlOlwibW92ZVwifSxlKSl9LFwiaW50ZXJhY3Rpb25zOmRvd25cIjpmdW5jdGlvbih0LGUpeyFmdW5jdGlvbih0LGUpe2Zvcih2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQsYT10LnBvaW50ZXJJbmRleCxzPW4ucG9pbnRlcnNbYV0uaG9sZCxsPV8uZ2V0UGF0aChpKSx1PXtpbnRlcmFjdGlvbjpuLHBvaW50ZXI6cixldmVudDpvLGV2ZW50VGFyZ2V0OmksdHlwZTpcImhvbGRcIix0YXJnZXRzOltdLHBhdGg6bCxub2RlOm51bGx9LGM9MDtjPGwubGVuZ3RoO2MrKyl7dmFyIGY9bFtjXTt1Lm5vZGU9ZixlLmZpcmUoXCJwb2ludGVyRXZlbnRzOmNvbGxlY3QtdGFyZ2V0c1wiLHUpfWlmKHUudGFyZ2V0cy5sZW5ndGgpe2Zvcih2YXIgZD0xLzAscD0wO3A8dS50YXJnZXRzLmxlbmd0aDtwKyspe3ZhciB2PXUudGFyZ2V0c1twXS5ldmVudGFibGUub3B0aW9ucy5ob2xkRHVyYXRpb247djxkJiYoZD12KX1zLmR1cmF0aW9uPWQscy50aW1lb3V0PXNldFRpbWVvdXQoKGZ1bmN0aW9uKCl7TW8oe2ludGVyYWN0aW9uOm4sZXZlbnRUYXJnZXQ6aSxwb2ludGVyOnIsZXZlbnQ6byx0eXBlOlwiaG9sZFwifSxlKX0pLGQpfX0odCxlKSxNbyh0LGUpfSxcImludGVyYWN0aW9uczp1cFwiOmZ1bmN0aW9uKHQsZSl7a28odCksTW8odCxlKSxmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldDtuLnBvaW50ZXJXYXNNb3ZlZHx8TW8oe2ludGVyYWN0aW9uOm4sZXZlbnRUYXJnZXQ6aSxwb2ludGVyOnIsZXZlbnQ6byx0eXBlOlwidGFwXCJ9LGUpfSh0LGUpfSxcImludGVyYWN0aW9uczpjYW5jZWxcIjpmdW5jdGlvbih0LGUpe2tvKHQpLE1vKHQsZSl9fSxQb2ludGVyRXZlbnQ6eW8uUG9pbnRlckV2ZW50LGZpcmU6TW8sY29sbGVjdEV2ZW50VGFyZ2V0czpqbyxkZWZhdWx0czp7aG9sZER1cmF0aW9uOjYwMCxpZ25vcmVGcm9tOm51bGwsYWxsb3dGcm9tOm51bGwsb3JpZ2luOnt4OjAseTowfX0sdHlwZXM6e2Rvd246ITAsbW92ZTohMCx1cDohMCxjYW5jZWw6ITAsdGFwOiEwLGRvdWJsZXRhcDohMCxob2xkOiEwfX07ZnVuY3Rpb24gTW8odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQsYT10LnR5cGUscz10LnRhcmdldHMsbD12b2lkIDA9PT1zP2pvKHQsZSk6cyx1PW5ldyB5by5Qb2ludGVyRXZlbnQoYSxyLG8saSxuLGUubm93KCkpO2UuZmlyZShcInBvaW50ZXJFdmVudHM6bmV3XCIse3BvaW50ZXJFdmVudDp1fSk7Zm9yKHZhciBjPXtpbnRlcmFjdGlvbjpuLHBvaW50ZXI6cixldmVudDpvLGV2ZW50VGFyZ2V0OmksdGFyZ2V0czpsLHR5cGU6YSxwb2ludGVyRXZlbnQ6dX0sZj0wO2Y8bC5sZW5ndGg7ZisrKXt2YXIgZD1sW2ZdO2Zvcih2YXIgcCBpbiBkLnByb3BzfHx7fSl1W3BdPWQucHJvcHNbcF07dmFyIHY9KDAsQS5kZWZhdWx0KShkLmV2ZW50YWJsZSxkLm5vZGUpO2lmKHUuX3N1YnRyYWN0T3JpZ2luKHYpLHUuZXZlbnRhYmxlPWQuZXZlbnRhYmxlLHUuY3VycmVudFRhcmdldD1kLm5vZGUsZC5ldmVudGFibGUuZmlyZSh1KSx1Ll9hZGRPcmlnaW4odiksdS5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWR8fHUucHJvcGFnYXRpb25TdG9wcGVkJiZmKzE8bC5sZW5ndGgmJmxbZisxXS5ub2RlIT09dS5jdXJyZW50VGFyZ2V0KWJyZWFrfWlmKGUuZmlyZShcInBvaW50ZXJFdmVudHM6ZmlyZWRcIixjKSxcInRhcFwiPT09YSl7dmFyIGg9dS5kb3VibGU/TW8oe2ludGVyYWN0aW9uOm4scG9pbnRlcjpyLGV2ZW50Om8sZXZlbnRUYXJnZXQ6aSx0eXBlOlwiZG91YmxldGFwXCJ9LGUpOnU7bi5wcmV2VGFwPWgsbi50YXBUaW1lPWgudGltZVN0YW1wfXJldHVybiB1fWZ1bmN0aW9uIGpvKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0LGE9dC50eXBlLHM9bi5nZXRQb2ludGVySW5kZXgociksbD1uLnBvaW50ZXJzW3NdO2lmKFwidGFwXCI9PT1hJiYobi5wb2ludGVyV2FzTW92ZWR8fCFsfHxsLmRvd25UYXJnZXQhPT1pKSlyZXR1cm5bXTtmb3IodmFyIHU9Xy5nZXRQYXRoKGkpLGM9e2ludGVyYWN0aW9uOm4scG9pbnRlcjpyLGV2ZW50Om8sZXZlbnRUYXJnZXQ6aSx0eXBlOmEscGF0aDp1LHRhcmdldHM6W10sbm9kZTpudWxsfSxmPTA7Zjx1Lmxlbmd0aDtmKyspe3ZhciBkPXVbZl07Yy5ub2RlPWQsZS5maXJlKFwicG9pbnRlckV2ZW50czpjb2xsZWN0LXRhcmdldHNcIixjKX1yZXR1cm5cImhvbGRcIj09PWEmJihjLnRhcmdldHM9Yy50YXJnZXRzLmZpbHRlcigoZnVuY3Rpb24odCl7dmFyIGU7cmV0dXJuIHQuZXZlbnRhYmxlLm9wdGlvbnMuaG9sZER1cmF0aW9uPT09KG51bGw9PShlPW4ucG9pbnRlcnNbc10pP3ZvaWQgMDplLmhvbGQuZHVyYXRpb24pfSkpKSxjLnRhcmdldHN9ZnVuY3Rpb24ga28odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQucG9pbnRlckluZGV4LHI9ZS5wb2ludGVyc1tuXS5ob2xkO3ImJnIudGltZW91dCYmKGNsZWFyVGltZW91dChyLnRpbWVvdXQpLHIudGltZW91dD1udWxsKX12YXIgSW89VG87RW8uZGVmYXVsdD1Jbzt2YXIgRG89e307ZnVuY3Rpb24gQW8odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtlLmhvbGRJbnRlcnZhbEhhbmRsZSYmKGNsZWFySW50ZXJ2YWwoZS5ob2xkSW50ZXJ2YWxIYW5kbGUpLGUuaG9sZEludGVydmFsSGFuZGxlPW51bGwpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShEbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxEby5kZWZhdWx0PXZvaWQgMDt2YXIgUm89e2lkOlwicG9pbnRlci1ldmVudHMvaG9sZFJlcGVhdFwiLGluc3RhbGw6ZnVuY3Rpb24odCl7dC51c2VQbHVnaW4oRW8uZGVmYXVsdCk7dmFyIGU9dC5wb2ludGVyRXZlbnRzO2UuZGVmYXVsdHMuaG9sZFJlcGVhdEludGVydmFsPTAsZS50eXBlcy5ob2xkcmVwZWF0PXQuYWN0aW9ucy5waGFzZWxlc3NUeXBlcy5ob2xkcmVwZWF0PSEwfSxsaXN0ZW5lcnM6W1wibW92ZVwiLFwidXBcIixcImNhbmNlbFwiLFwiZW5kYWxsXCJdLnJlZHVjZSgoZnVuY3Rpb24odCxlKXtyZXR1cm4gdFtcInBvaW50ZXJFdmVudHM6XCIuY29uY2F0KGUpXT1Bbyx0fSkse1wicG9pbnRlckV2ZW50czpuZXdcIjpmdW5jdGlvbih0KXt2YXIgZT10LnBvaW50ZXJFdmVudDtcImhvbGRcIj09PWUudHlwZSYmKGUuY291bnQ9KGUuY291bnR8fDApKzEpfSxcInBvaW50ZXJFdmVudHM6ZmlyZWRcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXJFdmVudCxvPXQuZXZlbnRUYXJnZXQsaT10LnRhcmdldHM7aWYoXCJob2xkXCI9PT1yLnR5cGUmJmkubGVuZ3RoKXt2YXIgYT1pWzBdLmV2ZW50YWJsZS5vcHRpb25zLmhvbGRSZXBlYXRJbnRlcnZhbDthPD0wfHwobi5ob2xkSW50ZXJ2YWxIYW5kbGU9c2V0VGltZW91dCgoZnVuY3Rpb24oKXtlLnBvaW50ZXJFdmVudHMuZmlyZSh7aW50ZXJhY3Rpb246bixldmVudFRhcmdldDpvLHR5cGU6XCJob2xkXCIscG9pbnRlcjpyLGV2ZW50OnJ9LGUpfSksYSkpfX19KX07RG8uZGVmYXVsdD1Sbzt2YXIgem89e307ZnVuY3Rpb24gQ28odCl7cmV0dXJuKDAsai5kZWZhdWx0KSh0aGlzLmV2ZW50cy5vcHRpb25zLHQpLHRoaXN9T2JqZWN0LmRlZmluZVByb3BlcnR5KHpvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHpvLmRlZmF1bHQ9dm9pZCAwO3ZhciBGbz17aWQ6XCJwb2ludGVyLWV2ZW50cy9pbnRlcmFjdGFibGVUYXJnZXRzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LkludGVyYWN0YWJsZTtlLnByb3RvdHlwZS5wb2ludGVyRXZlbnRzPUNvO3ZhciBuPWUucHJvdG90eXBlLl9iYWNrQ29tcGF0T3B0aW9uO2UucHJvdG90eXBlLl9iYWNrQ29tcGF0T3B0aW9uPWZ1bmN0aW9uKHQsZSl7dmFyIHI9bi5jYWxsKHRoaXMsdCxlKTtyZXR1cm4gcj09PXRoaXMmJih0aGlzLmV2ZW50cy5vcHRpb25zW3RdPWUpLHJ9fSxsaXN0ZW5lcnM6e1wicG9pbnRlckV2ZW50czpjb2xsZWN0LXRhcmdldHNcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQudGFyZ2V0cyxyPXQubm9kZSxvPXQudHlwZSxpPXQuZXZlbnRUYXJnZXQ7ZS5pbnRlcmFjdGFibGVzLmZvckVhY2hNYXRjaChyLChmdW5jdGlvbih0KXt2YXIgZT10LmV2ZW50cyxhPWUub3B0aW9ucztlLnR5cGVzW29dJiZlLnR5cGVzW29dLmxlbmd0aCYmdC50ZXN0SWdub3JlQWxsb3coYSxyLGkpJiZuLnB1c2goe25vZGU6cixldmVudGFibGU6ZSxwcm9wczp7aW50ZXJhY3RhYmxlOnR9fSl9KSl9LFwiaW50ZXJhY3RhYmxlOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RhYmxlO2UuZXZlbnRzLmdldFJlY3Q9ZnVuY3Rpb24odCl7cmV0dXJuIGUuZ2V0UmVjdCh0KX19LFwiaW50ZXJhY3RhYmxlOnNldFwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGFibGUscj10Lm9wdGlvbnM7KDAsai5kZWZhdWx0KShuLmV2ZW50cy5vcHRpb25zLGUucG9pbnRlckV2ZW50cy5kZWZhdWx0cyksKDAsai5kZWZhdWx0KShuLmV2ZW50cy5vcHRpb25zLHIucG9pbnRlckV2ZW50c3x8e30pfX19O3pvLmRlZmF1bHQ9Rm87dmFyIFhvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShYbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxYby5kZWZhdWx0PXZvaWQgMDt2YXIgWW89e2lkOlwicG9pbnRlci1ldmVudHNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3QudXNlUGx1Z2luKEVvKSx0LnVzZVBsdWdpbihEby5kZWZhdWx0KSx0LnVzZVBsdWdpbih6by5kZWZhdWx0KX19O1hvLmRlZmF1bHQ9WW87dmFyIEJvPXt9O2Z1bmN0aW9uIFdvKHQpe3ZhciBlPXQuSW50ZXJhY3RhYmxlO3QuYWN0aW9ucy5waGFzZXMucmVmbG93PSEwLGUucHJvdG90eXBlLnJlZmxvdz1mdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24odCxlLG4pe2Zvcih2YXIgcj1pLmRlZmF1bHQuc3RyaW5nKHQudGFyZ2V0KT9aLmZyb20odC5fY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHQudGFyZ2V0KSk6W3QudGFyZ2V0XSxvPW4ud2luZG93LlByb21pc2UsYT1vP1tdOm51bGwscz1mdW5jdGlvbigpe3ZhciBpPXJbbF0scz10LmdldFJlY3QoaSk7aWYoIXMpcmV0dXJuXCJicmVha1wiO3ZhciB1PVouZmluZChuLmludGVyYWN0aW9ucy5saXN0LChmdW5jdGlvbihuKXtyZXR1cm4gbi5pbnRlcmFjdGluZygpJiZuLmludGVyYWN0YWJsZT09PXQmJm4uZWxlbWVudD09PWkmJm4ucHJlcGFyZWQubmFtZT09PWUubmFtZX0pKSxjPXZvaWQgMDtpZih1KXUubW92ZSgpLGEmJihjPXUuX3JlZmxvd1Byb21pc2V8fG5ldyBvKChmdW5jdGlvbih0KXt1Ll9yZWZsb3dSZXNvbHZlPXR9KSkpO2Vsc2V7dmFyIGY9KDAsay50bGJyVG9YeXdoKShzKSxkPXtwYWdlOnt4OmYueCx5OmYueX0sY2xpZW50Ont4OmYueCx5OmYueX0sdGltZVN0YW1wOm4ubm93KCl9LHA9Qi5jb29yZHNUb0V2ZW50KGQpO2M9ZnVuY3Rpb24odCxlLG4scixvKXt2YXIgaT10LmludGVyYWN0aW9ucy5uZXcoe3BvaW50ZXJUeXBlOlwicmVmbG93XCJ9KSxhPXtpbnRlcmFjdGlvbjppLGV2ZW50Om8scG9pbnRlcjpvLGV2ZW50VGFyZ2V0Om4scGhhc2U6XCJyZWZsb3dcIn07aS5pbnRlcmFjdGFibGU9ZSxpLmVsZW1lbnQ9bixpLnByZXZFdmVudD1vLGkudXBkYXRlUG9pbnRlcihvLG8sbiwhMCksQi5zZXRaZXJvQ29vcmRzKGkuY29vcmRzLmRlbHRhKSwoMCxZdC5jb3B5QWN0aW9uKShpLnByZXBhcmVkLHIpLGkuX2RvUGhhc2UoYSk7dmFyIHM9dC53aW5kb3cuUHJvbWlzZSxsPXM/bmV3IHMoKGZ1bmN0aW9uKHQpe2kuX3JlZmxvd1Jlc29sdmU9dH0pKTp2b2lkIDA7cmV0dXJuIGkuX3JlZmxvd1Byb21pc2U9bCxpLnN0YXJ0KHIsZSxuKSxpLl9pbnRlcmFjdGluZz8oaS5tb3ZlKGEpLGkuZW5kKG8pKTooaS5zdG9wKCksaS5fcmVmbG93UmVzb2x2ZSgpKSxpLnJlbW92ZVBvaW50ZXIobyxvKSxsfShuLHQsaSxlLHApfWEmJmEucHVzaChjKX0sbD0wO2w8ci5sZW5ndGgmJlwiYnJlYWtcIiE9PXMoKTtsKyspO3JldHVybiBhJiZvLmFsbChhKS50aGVuKChmdW5jdGlvbigpe3JldHVybiB0fSkpfSh0aGlzLGUsdCl9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShCbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxCby5pbnN0YWxsPVdvLEJvLmRlZmF1bHQ9dm9pZCAwO3ZhciBMbz17aWQ6XCJyZWZsb3dcIixpbnN0YWxsOldvLGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbjtcInJlZmxvd1wiPT09bi5wb2ludGVyVHlwZSYmKG4uX3JlZmxvd1Jlc29sdmUmJm4uX3JlZmxvd1Jlc29sdmUoKSxaLnJlbW92ZShlLmludGVyYWN0aW9ucy5saXN0LG4pKX19fTtCby5kZWZhdWx0PUxvO3ZhciBVbz17ZXhwb3J0czp7fX07ZnVuY3Rpb24gVm8odCl7cmV0dXJuKFZvPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1PYmplY3QuZGVmaW5lUHJvcGVydHkoVW8uZXhwb3J0cyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxVby5leHBvcnRzLmRlZmF1bHQ9dm9pZCAwLGNyLmRlZmF1bHQudXNlKHNlLmRlZmF1bHQpLGNyLmRlZmF1bHQudXNlKEdlLmRlZmF1bHQpLGNyLmRlZmF1bHQudXNlKFhvLmRlZmF1bHQpLGNyLmRlZmF1bHQudXNlKGVuLmRlZmF1bHQpLGNyLmRlZmF1bHQudXNlKGhvLmRlZmF1bHQpLGNyLmRlZmF1bHQudXNlKGllLmRlZmF1bHQpLGNyLmRlZmF1bHQudXNlKFR0LmRlZmF1bHQpLGNyLmRlZmF1bHQudXNlKFJ0LmRlZmF1bHQpLGNyLmRlZmF1bHQudXNlKEJvLmRlZmF1bHQpO3ZhciBObz1jci5kZWZhdWx0O2lmKFVvLmV4cG9ydHMuZGVmYXVsdD1ObyxcIm9iamVjdFwiPT09Vm8oVW8pJiZVbyl0cnl7VW8uZXhwb3J0cz1jci5kZWZhdWx0fWNhdGNoKHQpe31jci5kZWZhdWx0LmRlZmF1bHQ9Y3IuZGVmYXVsdCxVbz1Vby5leHBvcnRzO3ZhciBxbz17ZXhwb3J0czp7fX07ZnVuY3Rpb24gJG8odCl7cmV0dXJuKCRvPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1PYmplY3QuZGVmaW5lUHJvcGVydHkocW8uZXhwb3J0cyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxxby5leHBvcnRzLmRlZmF1bHQ9dm9pZCAwO3ZhciBHbz1Vby5kZWZhdWx0O2lmKHFvLmV4cG9ydHMuZGVmYXVsdD1HbyxcIm9iamVjdFwiPT09JG8ocW8pJiZxbyl0cnl7cW8uZXhwb3J0cz1Vby5kZWZhdWx0fWNhdGNoKHQpe31yZXR1cm4gVW8uZGVmYXVsdC5kZWZhdWx0PVVvLmRlZmF1bHQscW8uZXhwb3J0c30pKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWludGVyYWN0Lm1pbi5qcy5tYXBcbiIsImltcG9ydCB7IGNvbmZpZywgaXNFbGxpcHNpc0FjdGl2ZSwgZ2V0VGV4dFdpZHRoIH0gZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY29tcG9uZW50cy9jYXJkJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FyZEFjdGlvbnNIYW5kbGVyIHtcclxuICBzdG9yZWRTZWxFbHM6IEFycmF5PEVsZW1lbnQ+O1xyXG4gIGN1cnJTY3JvbGxpbmdBbmltOiBBbmltYXRpb24gfCBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvciAobWF4TGVuZ3RoOiBudW1iZXIpIHtcclxuICAgIHRoaXMuc3RvcmVkU2VsRWxzID0gbmV3IEFycmF5KG1heExlbmd0aClcclxuICAgIHRoaXMuY3VyclNjcm9sbGluZ0FuaW0gPSBudWxsXHJcbiAgfVxyXG5cclxuICAvKiogTWFuYWdlcyBzZWxlY3RpbmcgYSBjYXJkIGFuZCBkZXNlbGVjdGluZyB0aGUgcHJldmlvdXMgc2VsZWN0ZWQgb25lXHJcbiAgICogd2hlbiBhIGNhcmRzIG9uIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGlzIHRyaWdnZXJlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gc2VsQ2FyZEVsIC0gdGhlIGNhcmQgdGhhdCBleGVjdXRlZCB0aGlzIGZ1bmN0aW9uIHdoZW4gY2xpY2tlZFxyXG4gICAqIEBwYXJhbSB7QXJyYXk8Q2FyZD59IGNvcnJPYmpMaXN0IC0gdGhlIGxpc3Qgb2Ygb2JqZWN0cyB0aGF0IGNvbnRhaW5zIG9uZSB0aGF0IGNvcnJvc3BvbmRzIHRvIHRoZSBzZWxlY3RlZCBjYXJkLFxyXG4gICAqIGVhY2ggKioqb2JqZWN0IG11c3QgaGF2ZSB0aGUgY2FyZElkIGF0dHJpYnV0ZS5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHNlbGVjdGVkIG9iamVjdCBoYXMgY2hhbmdlZFxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gYWxsb3dVbnNlbFNlbGVjdGVkIC0gd2hldGhlciB0byBhbGxvdyB1bnNlbGVjdGluZyBvZiB0aGUgc2VsZWN0ZWQgY2FyZCBieSBjbGlja2luZyBvbiBpdCBhZ2FpblxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gdW5zZWxlY3RQcmV2aW91cyAtIHdoZXRoZXIgdG8gdW5zZWxlY3QgdGhlIHByZXZpb3VzbHkgc2VsZWN0ZWQgY2FyZFxyXG4gICAqL1xyXG4gIG9uQ2FyZENsaWNrIChcclxuICAgIHNlbENhcmRFbDogRWxlbWVudCxcclxuICAgIGNvcnJPYmpMaXN0OiBBcnJheTxDYXJkPixcclxuICAgIGNhbGxiYWNrOiBGdW5jdGlvbiB8IG51bGwsXHJcbiAgICBhbGxvd1Vuc2VsU2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSxcclxuICAgIHVuc2VsZWN0UHJldmlvdXM6IGJvb2xlYW4gPSB0cnVlXHJcbiAgKSB7XHJcbiAgICBpZiAodGhpcy5zdG9yZWRTZWxFbHMuaW5jbHVkZXMoc2VsQ2FyZEVsKSkge1xyXG4gICAgICBpZiAoYWxsb3dVbnNlbFNlbGVjdGVkKSB7XHJcbiAgICAgICAgY29uc3Qgc2VsQ2FyZCA9IHRoaXMuc3RvcmVkU2VsRWxzW3RoaXMuc3RvcmVkU2VsRWxzLmluZGV4T2Yoc2VsQ2FyZEVsKV1cclxuICAgICAgICBzZWxDYXJkLmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgICAgIHRoaXMuc3RvcmVkU2VsRWxzLnNwbGljZSh0aGlzLnN0b3JlZFNlbEVscy5pbmRleE9mKHNlbENhcmRFbCksIDEpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICAvLyBnZXQgY29ycm9zcG9uZGluZyBvYmplY3QgdXNpbmcgdGhlIGNhcmRFbCBpZFxyXG4gICAgY29uc3Qgc2VsT2JqID0gY29yck9iakxpc3QuZmluZCgoeCkgPT4ge1xyXG4gICAgICBjb25zdCB4Q2FyZCA9IHggYXMgQ2FyZFxyXG4gICAgICByZXR1cm4geENhcmQuZ2V0Q2FyZElkKCkgPT09IHNlbENhcmRFbC5pZFxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBlcnJvciBpZiB0aGVyZSBpcyBubyBjb3Jyb3Nwb25kaW5nIG9iamVjdFxyXG4gICAgaWYgKCFzZWxPYmopIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgIGBUaGVyZSBpcyBubyBjb3Jyb3Nwb25kaW5nIG9iamVjdCB0byB0aGUgc2VsZWN0ZWQgY2FyZCwgbWVhbmluZyB0aGUgaWQgb2YgdGhlIGNhcmQgZWxlbWVudCBcXFxyXG4gICAgICBkb2VzIG5vdCBtYXRjaCBhbnkgb2YgdGhlIGNvcnJvc3BvbmRpbmcgJ2NhcmRJZCcgYXR0cmlidHVlcy4gRW5zdXJlIHRoYXQgdGhlIGNhcmRJZCBhdHRyaWJ1dGUgXFxcclxuICAgICAgaXMgYXNzaWduZWQgYXMgdGhlIGNhcmQgZWxlbWVudHMgSFRNTCAnaWQnIHdoZW4gdGhlIGNhcmQgaXMgY3JlYXRlZC5gXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICAvLyB1bnNlbGVjdCB0aGUgcHJldmlvdXNseSBzZWxlY3RlZCBjYXJkIGlmIGl0IGV4aXN0c1xyXG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuc3RvcmVkU2VsRWxzKS5sZW5ndGggPiAwICYmIHVuc2VsZWN0UHJldmlvdXMpIHtcclxuICAgICAgY29uc3Qgc3RvcmVkRWwgPSB0aGlzLnN0b3JlZFNlbEVscy5wb3AoKVxyXG4gICAgICBpZiAoc3RvcmVkRWwgIT09IHVuZGVmaW5lZCkgeyBzdG9yZWRFbC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCkgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG9uIGNsaWNrIGFkZCB0aGUgJ3NlbGVjdGVkJyBjbGFzcyBvbnRvIHRoZSBlbGVtZW50IHdoaWNoIHJ1bnMgYSB0cmFuc2l0aW9uXHJcbiAgICBzZWxDYXJkRWwuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnN0b3JlZFNlbEVscy5wdXNoKHNlbENhcmRFbClcclxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XHJcbiAgICAgIGNhbGxiYWNrKHNlbE9iailcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBNYW5hZ2VzIGFkZGluZyBjZXJ0YWluIHByb3BlcnRpZXMgcmVhbHRpbmcgdG8gc2Nyb2xsaW5nIHRleHQgd2hlbiBlbnRlcmluZ1xyXG4gICAqIGEgY2FyZCBlbGVtZW50LiBXZSBhc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgc2Nyb2xsaW5nIHRleHQgb24gdGhlIGNhcmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVudGVyaW5nQ2FyZEVsIC0gZWxlbWVudCB5b3UgYXJlIGVudGVyaW5nLCB0aGF0IGNvbnRhaW5zIHRoZSBzY3JvbGxpbmcgdGV4dFxyXG4gICAqL1xyXG4gIHNjcm9sbFRleHRPbkNhcmRFbnRlciAoZW50ZXJpbmdDYXJkRWw6IEVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHNjcm9sbGluZ1RleHQgPSBlbnRlcmluZ0NhcmRFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFxyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgKVswXSBhcyBIVE1MRWxlbWVudFxyXG4gICAgY29uc3QgcGFyZW50ID0gc2Nyb2xsaW5nVGV4dC5wYXJlbnRFbGVtZW50XHJcblxyXG4gICAgaWYgKGlzRWxsaXBzaXNBY3RpdmUoc2Nyb2xsaW5nVGV4dCkpIHtcclxuICAgICAgcGFyZW50Py5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxMZWZ0KVxyXG4gICAgICBzY3JvbGxpbmdUZXh0LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcClcclxuICAgICAgdGhpcy5ydW5TY3JvbGxpbmdUZXh0QW5pbShzY3JvbGxpbmdUZXh0LCBlbnRlcmluZ0NhcmRFbClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBTdGFydHMgdG8gc2Nyb2xsIHRleHQgZnJvbSBsZWZ0IHRvIHJpZ2h0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBzY3JvbGxpbmdUZXh0IC0gZWxlbWVudCBjb250YWluaW5nIHRoZSB0ZXh0IHRoYXQgd2lsbCBzY3JvbGxcclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGNhcmRFbCAtIGNhcmQgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBzY3JvbGxpbmcgdGV4dFxyXG4gICAqL1xyXG4gIHJ1blNjcm9sbGluZ1RleHRBbmltIChzY3JvbGxpbmdUZXh0OiBFbGVtZW50LCBjYXJkRWw6IEVsZW1lbnQpIHtcclxuICAgIGNvbnN0IExJTkdFUl9BTVQgPSAyMFxyXG4gICAgY29uc3QgZm9udCA9IHdpbmRvd1xyXG4gICAgICAuZ2V0Q29tcHV0ZWRTdHlsZShzY3JvbGxpbmdUZXh0LCBudWxsKVxyXG4gICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnZm9udCcpXHJcblxyXG4gICAgaWYgKHNjcm9sbGluZ1RleHQudGV4dENvbnRlbnQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTY3JvbGxpbmcgdGV4dCBlbGVtZW50IGRvZXMgbm90IGNvbnRhaW4gYW55IHRleHQgY29udGVudCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLmN1cnJTY3JvbGxpbmdBbmltID0gc2Nyb2xsaW5nVGV4dC5hbmltYXRlKFxyXG4gICAgICBbXHJcbiAgICAgICAgLy8ga2V5ZnJhbWVzXHJcbiAgICAgICAgeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDBweCknIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlWCgke1xyXG4gICAgICAgICAgICAtZ2V0VGV4dFdpZHRoKHNjcm9sbGluZ1RleHQudGV4dENvbnRlbnQsIGZvbnQpIC0gTElOR0VSX0FNVFxyXG4gICAgICAgICAgfXB4KWBcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHtcclxuICAgICAgICAvLyB0aW1pbmcgb3B0aW9uc1xyXG4gICAgICAgIGR1cmF0aW9uOiA1MDAwLFxyXG4gICAgICAgIGl0ZXJhdGlvbnM6IDFcclxuICAgICAgfVxyXG4gICAgKVxyXG5cclxuICAgIHRoaXMuY3VyclNjcm9sbGluZ0FuaW0ub25maW5pc2ggPSAoKSA9PiB0aGlzLnNjcm9sbFRleHRPbkNhcmRMZWF2ZShjYXJkRWwpXHJcbiAgfVxyXG5cclxuICAvKiogTWFuYWdlcyByZW1vdmluZyBjZXJ0YWluIHByb3BlcnRpZXMgcmVsYXRpbmcgdG8gc2Nyb2xsaW5nIHRleHQgb25jZSBsZWF2aW5nXHJcbiAgICogYSBjYXJkIGVsZW1lbnQuIFdlIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSBzY3JvbGxpbmcgdGV4dCBvbiB0aGUgY2FyZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SFRNTH0gbGVhdmluZ0NhcmRFbCAtIGVsZW1lbnQgeW91IGFyZSBsZWF2aW5nLCB0aGF0IGNvbnRhaW5zIHRoZSBzY3JvbGxpbmcgdGV4dFxyXG4gICAqL1xyXG4gIHNjcm9sbFRleHRPbkNhcmRMZWF2ZSAobGVhdmluZ0NhcmRFbDogRWxlbWVudCkge1xyXG4gICAgY29uc3Qgc2Nyb2xsaW5nVGV4dCA9IGxlYXZpbmdDYXJkRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIClbMF1cclxuICAgIGNvbnN0IHBhcmVudCA9IHNjcm9sbGluZ1RleHQucGFyZW50RWxlbWVudFxyXG5cclxuICAgIHBhcmVudD8uY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsTGVmdClcclxuICAgIHNjcm9sbGluZ1RleHQuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwKVxyXG4gICAgdGhpcy5jdXJyU2Nyb2xsaW5nQW5pbT8uY2FuY2VsKClcclxuICB9XHJcblxyXG4gIGNsZWFyU2VsZWN0ZWRFbHMgKCkge1xyXG4gICAgdGhpcy5zdG9yZWRTZWxFbHMuc3BsaWNlKDAsIHRoaXMuc3RvcmVkU2VsRWxzLmxlbmd0aClcclxuICB9XHJcblxyXG4gIGFkZEFsbEV2ZW50TGlzdGVuZXJzIChcclxuICAgIGNhcmRzOiBBcnJheTxFbGVtZW50PixcclxuICAgIG9iakFycjogQXJyYXk8Q2FyZD4sXHJcbiAgICBjbGlja0NhbGxCYWNrOiBudWxsIHwgKChzZWxPYmo6IHVua25vd24pID0+IHZvaWQpLFxyXG4gICAgYWxsb3dVbnNlbGVjdGVkOiBib29sZWFuLFxyXG4gICAgdW5zZWxlY3RQcmV2aW91czogYm9vbGVhblxyXG4gICkge1xyXG4gICAgdGhpcy5jbGVhclNlbGVjdGVkRWxzKClcclxuXHJcbiAgICBjYXJkcy5mb3JFYWNoKCh0cmFja0NhcmQpID0+IHtcclxuICAgICAgdHJhY2tDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT5cclxuICAgICAgICB0aGlzLm9uQ2FyZENsaWNrKFxyXG4gICAgICAgICAgdHJhY2tDYXJkLFxyXG4gICAgICAgICAgb2JqQXJyLFxyXG4gICAgICAgICAgY2xpY2tDYWxsQmFjayxcclxuICAgICAgICAgIGFsbG93VW5zZWxlY3RlZCxcclxuICAgICAgICAgIHVuc2VsZWN0UHJldmlvdXNcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgICAgdHJhY2tDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxUZXh0T25DYXJkRW50ZXIodHJhY2tDYXJkKVxyXG4gICAgICB9KVxyXG4gICAgICB0cmFja0NhcmQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcclxuICAgICAgICB0aGlzLnNjcm9sbFRleHRPbkNhcmRMZWF2ZSh0cmFja0NhcmQpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG4iLCJjbGFzcyBBbGJ1bSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGV4dGVybmFsVXJsOiBzdHJpbmc7XHJcbiAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgZXh0ZXJuYWxVcmw6IHN0cmluZykge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5leHRlcm5hbFVybCA9IGV4dGVybmFsVXJsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBbGJ1bVxyXG4iLCJjbGFzcyBBc3luY1NlbGVjdGlvblZlcmlmPFQ+IHtcclxuICBwcml2YXRlIF9jdXJyU2VsZWN0ZWRWYWw6IFQgfCBudWxsO1xyXG4gIGhhc0xvYWRlZEN1cnJTZWxlY3RlZDogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5fY3VyclNlbGVjdGVkVmFsID0gbnVsbFxyXG5cclxuICAgIC8vIHVzZWQgdG8gZW5zdXJlIHRoYXQgYW4gb2JqZWN0IHRoYXQgaGFzIGxvYWRlZCB3aWxsIG5vdCBiZSBsb2FkZWQgYWdhaW5cclxuICAgIHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkID0gZmFsc2VcclxuICB9XHJcblxyXG4gIGdldCBjdXJyU2VsZWN0ZWRWYWxOb051bGwgKCk6IFQge1xyXG4gICAgaWYgKCF0aGlzLl9jdXJyU2VsZWN0ZWRWYWwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgaXMgYWNjZXNzZWQgd2l0aG91dCBiZWluZyBhc3NpZ25lZCcpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5fY3VyclNlbGVjdGVkVmFsXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXQgY3VyclNlbGVjdGVkVmFsICgpOiBUIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3VyclNlbGVjdGVkVmFsXHJcbiAgfVxyXG5cclxuICAvKiBDaGFuZ2UgdGhlIHZhbHVlIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgYW5kIHJlc2V0IHRoZSBoYXMgbG9hZGVkIGJvb2xlYW4uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FueX0gLSBkYXRhIHRoYXQgaGFzIGJlZW4gc2VsZWN0ZWRcclxuICAgKi9cclxuICBzZWxlY3Rpb25DaGFuZ2VkIChjdXJyU2VsZWN0ZWRWYWw6IFQpIHtcclxuICAgIHRoaXMuX2N1cnJTZWxlY3RlZFZhbCA9IGN1cnJTZWxlY3RlZFZhbFxyXG4gICAgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgLyoqIENoZWNrcyB0byBzZWUgaWYgYSBzZWxlY3RlZCB2YWx1ZSBwb3N0IGxvYWQgaXMgdmFsaWQgYnlcclxuICAgKiBjb21wYXJpbmcgaXQgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZSBhbmQgdmVyaWZ5aW5nIHRoYXRcclxuICAgKiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGhhcyBub3QgYWxyZWFkeSBiZWVuIGxvYWRlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VH0gLSBkYXRhIHRoYXQgaGFzIGJlZW4gbG9hZGVkXHJcbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gd2hldGhlciB0aGUgbG9hZGVkIHNlbGVjdGlvbiBpcyB2YWxpZFxyXG4gICAqL1xyXG4gIGlzVmFsaWQgKHBvc3RMb2FkVmFsOiBUKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodGhpcy5fY3VyclNlbGVjdGVkVmFsICE9PSBwb3N0TG9hZFZhbCB8fCB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGlmIGlzIHZhbGlkIHRoZW4gd2UgYXNzdW1lIHRoYXQgdGhpcyB2YWx1ZSB3aWxsIGJlIGxvYWRlZFxyXG4gICAgICB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCA9IHRydWVcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFzeW5jU2VsZWN0aW9uVmVyaWZcclxuIiwiY2xhc3MgQ2FyZCB7XHJcbiAgY2FyZElkOiBzdHJpbmc7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5jYXJkSWQgPSAnJ1xyXG4gIH1cclxuXHJcbiAgZ2V0Q2FyZElkICgpIHtcclxuICAgIGlmICh0aGlzLmNhcmRJZCA9PT0gJ251bGwnKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FyZCBpZCB3YXMgYXNraW5nIHRvIGJlIHJldHJpZXZlZCBidXQgaXMgbnVsbCcpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5jYXJkSWRcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhcmRcclxuIiwiLyogQ29weXJpZ2h0IChjKSAyMDA5IE5pY2hvbGFzIEMuIFpha2FzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiAqL1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBzaW5nbGUgbm9kZSBpbiBhIERvdWJseUxpbmtlZExpc3QuXHJcbiAqIEBjbGFzcyBEb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHtcclxuICBkYXRhOiBUO1xyXG4gIG5leHQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIHByZXZpb3VzOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb3VibHlMaW5rZWRMaXN0Tm9kZS5cclxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgdG8gc3RvcmUgaW4gdGhlIG5vZGUuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKGRhdGE6IFQpIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRhdGEgdGhhdCB0aGlzIG5vZGUgc3RvcmVzLlxyXG4gICAgICogQHByb3BlcnR5IGRhdGFcclxuICAgICAqIEB0eXBlICpcclxuICAgICAqL1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBwb2ludGVyIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIERvdWJseUxpbmtlZExpc3QuXHJcbiAgICAgKiBAcHJvcGVydHkgbmV4dFxyXG4gICAgICogQHR5cGUgP0RvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAgICAgKi9cclxuICAgIHRoaXMubmV4dCA9IG51bGxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcG9pbnRlciB0byB0aGUgcHJldmlvdXMgbm9kZSBpbiB0aGUgRG91Ymx5TGlua2VkTGlzdC5cclxuICAgICAqIEBwcm9wZXJ0eSBwcmV2aW91c1xyXG4gICAgICogQHR5cGUgP0RvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAgICAgKi9cclxuICAgIHRoaXMucHJldmlvdXMgPSBudWxsXHJcbiAgfVxyXG59XHJcbi8qKlxyXG4gKiBBIGRvdWJseSBsaW5rZWQgbGlzdCBpbXBsZW1lbnRhdGlvbiBpbiBKYXZhU2NyaXB0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdFxyXG4gKi9cclxuY2xhc3MgRG91Ymx5TGlua2VkTGlzdDxUPiB7XHJcbiAgaGVhZDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgdGFpbDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEb3VibHlMaW5rZWRMaXN0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgLy8gcG9pbnRlciB0byBmaXJzdCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICB0aGlzLmhlYWQgPSBudWxsXHJcblxyXG4gICAgLy8gcG9pbnRlciB0byBsYXN0IG5vZGUgaW4gdGhlIGxpc3Qgd2hpY2ggcG9pbnRzIHRvIG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZHMgc29tZSBkYXRhIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKi9cclxuICBhZGQgKGRhdGE6IFQpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+KGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgLypcclxuICAgICAgICogQmVjYXVzZSB0aGVyZSBhcmUgbm8gbm9kZXMgaW4gdGhlIGxpc3QsIGp1c3Qgc2V0IHRoZVxyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBwb2ludGVyIHRvIHRoZSBuZXcgbm9kZS5cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaGVhZCA9IG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFVubGlrZSBpbiBhIHNpbmdseSBsaW5rZWQgbGlzdCwgd2UgaGF2ZSBhIGRpcmVjdCByZWZlcmVuY2UgdG9cclxuICAgICAgICogdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gU2V0IHRoZSBgbmV4dGAgcG9pbnRlciBvZiB0aGVcclxuICAgICAgICogY3VycmVudCBsYXN0IG5vZGUgdG8gYG5ld05vZGVgIGluIG9yZGVyIHRvIGFwcGVuZCB0aGUgbmV3IGRhdGFcclxuICAgICAgICogdG8gdGhlIGVuZCBvZiB0aGUgbGlzdC4gVGhlbiwgc2V0IGBuZXdOb2RlLnByZXZpb3VzYCB0byB0aGUgY3VycmVudFxyXG4gICAgICAgKiB0YWlsIHRvIGVuc3VyZSBiYWNrd2FyZHMgdHJhY2tpbmcgd29yay5cclxuICAgICAgICovXHJcbiAgICAgIGlmICh0aGlzLnRhaWwgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwubmV4dCA9IG5ld05vZGVcclxuICAgICAgfVxyXG4gICAgICBuZXdOb2RlLnByZXZpb3VzID0gdGhpcy50YWlsXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIExhc3QsIHJlc2V0IGB0aGlzLnRhaWxgIHRvIGBuZXdOb2RlYCB0byBlbnN1cmUgd2UgYXJlIHN0aWxsXHJcbiAgICAgKiB0cmFja2luZyB0aGUgbGFzdCBub2RlIGNvcnJlY3RseS5cclxuICAgICAqL1xyXG4gICAgdGhpcy50YWlsID0gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBzb21lIGRhdGEgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBsaXN0LiBUaGlzIG1ldGhvZCB0cmF2ZXJzZXNcclxuICAgKiB0aGUgZXhpc3RpbmcgbGlzdCBhbmQgcGxhY2VzIHRoZSBkYXRhIGluIGEgbmV3IG5vZGUgYXQgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBhdCB3aGljaCB0byBpbnNlcnQgdGhlIGRhdGEuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGluZGV4IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgaW5zZXJ0QmVmb3JlIChkYXRhOiBULCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgaW5zZXJ0ZWQgaW50byB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZShkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBTcGVjaWFsIGNhc2U6IGlmIGBpbmRleGAgaXMgYDBgLCB0aGVuIG5vIHRyYXZlcnNhbCBpcyBuZWVkZWRcclxuICAgICAqIGFuZCB3ZSBuZWVkIHRvIHVwZGF0ZSBgdGhpcy5oZWFkYCB0byBwb2ludCB0byBgbmV3Tm9kZWAuXHJcbiAgICAgKi9cclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBFbnN1cmUgdGhlIG5ldyBub2RlJ3MgYG5leHRgIHByb3BlcnR5IGlzIHBvaW50ZWQgdG8gdGhlIGN1cnJlbnRcclxuICAgICAgICogaGVhZC5cclxuICAgICAgICovXHJcbiAgICAgIG5ld05vZGUubmV4dCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGN1cnJlbnQgaGVhZCdzIGBwcmV2aW91c2AgcHJvcGVydHkgbmVlZHMgdG8gcG9pbnQgdG8gdGhlIG5ld1xyXG4gICAgICAgKiBub2RlIHRvIGVuc3VyZSB0aGUgbGlzdCBpcyB0cmF2ZXJzYWJsZSBiYWNrd2FyZHMuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQucHJldmlvdXMgPSBuZXdOb2RlXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBOb3cgaXQncyBzYWZlIHRvIHNldCBgdGhpcy5oZWFkYCB0byB0aGUgbmV3IG5vZGUsIGVmZmVjdGl2ZWx5XHJcbiAgICAgICAqIG1ha2luZyB0aGUgbmV3IG5vZGUgdGhlIGZpcnN0IG5vZGUgaW4gdGhlIGxpc3QuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgICAqIGdvbmUuIFRoaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBpID0gMFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgdXNpbmcgYG5leHRgIHBvaW50ZXJzLCBhbmQgbWFrZVxyXG4gICAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAgICogYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0b1xyXG4gICAgICAgKiBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQubmV4dCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgICAgaSsrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEF0IHRoaXMgcG9pbnQsIGBjdXJyZW50YCBpcyBlaXRoZXIgdGhlIG5vZGUgdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YVxyXG4gICAgICAgKiBiZWZvcmUsIG9yIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFRoZSBvbmx5IHdheSB0byB0ZWxsIGlzIGlmXHJcbiAgICAgICAqIGBpYCBpcyBzdGlsbCBsZXNzIHRoYW4gYGluZGV4YCwgdGhhdCBtZWFucyB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlXHJcbiAgICAgICAqIGFuZCBhbiBlcnJvciBzaG91bGQgYmUgdGhyb3duLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKGkgPCBpbmRleCkge1xyXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBJZiBjb2RlIGNvbnRpbnVlcyB0byBleGVjdXRlIGhlcmUsIGl0IG1lYW5zIGBjdXJyZW50YCBpcyB0aGUgbm9kZVxyXG4gICAgICAgKiB0byBpbnNlcnQgbmV3IGRhdGEgYmVmb3JlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBGaXJzdCwgaW5zZXJ0IGBuZXdOb2RlYCBhZnRlciBgY3VycmVudC5wcmV2aW91c2AgYnkgdXBkYXRpbmdcclxuICAgICAgICogYGN1cnJlbnQucHJldmlvdXMubmV4dGAgYW5kIGBuZXdOb2RlLnByZXZpb3VzYC5cclxuICAgICAgICovXHJcbiAgICAgIGN1cnJlbnQhLnByZXZpb3VzIS5uZXh0ID0gbmV3Tm9kZVxyXG4gICAgICBuZXdOb2RlIS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIE5leHQsIGluc2VydCBgY3VycmVudGAgYWZ0ZXIgYG5ld05vZGVgIGJ5IHVwZGF0aW5nIGBuZXdOb2RlLm5leHRgIGFuZFxyXG4gICAgICAgKiBgY3VycmVudC5wcmV2aW91c2AuXHJcbiAgICAgICAqL1xyXG4gICAgICBuZXdOb2RlLm5leHQgPSBjdXJyZW50XHJcbiAgICAgIGN1cnJlbnQucHJldmlvdXMgPSBuZXdOb2RlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnNlcnRzIHNvbWUgZGF0YSBpbnRvIHRoZSBtaWRkbGUgb2YgdGhlIGxpc3QuIFRoaXMgbWV0aG9kIHRyYXZlcnNlc1xyXG4gICAqIHRoZSBleGlzdGluZyBsaXN0IGFuZCBwbGFjZXMgdGhlIGRhdGEgaW4gYSBuZXcgbm9kZSBhZnRlciBhIHNwZWNpZmljIGluZGV4LlxyXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IGFmdGVyIHdoaWNoIHRvIGluc2VydCB0aGUgZGF0YS5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiB0aGUgaW5kZXggZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBpbnNlcnRBZnRlciAoZGF0YTogVCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGUoZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGFkZCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQgYW5kIHVwZGF0ZVxyXG4gICAgICogdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpbiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIGluc2VydCB0aGUgbmV3IGRhdGEuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgIGkrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgaXMgZWl0aGVyIHRoZSBub2RlIHRvIGluc2VydCB0aGUgbmV3IGRhdGFcclxuICAgICAqIGJlZm9yZSwgb3IgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gVGhlIG9ubHkgd2F5IHRvIHRlbGwgaXMgaWZcclxuICAgICAqIGBpYCBpcyBzdGlsbCBsZXNzIHRoYW4gYGluZGV4YCwgdGhhdCBtZWFucyB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlXHJcbiAgICAgKiBhbmQgYW4gZXJyb3Igc2hvdWxkIGJlIHRocm93bi5cclxuICAgICAqL1xyXG4gICAgaWYgKGkgPCBpbmRleCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgY29kZSBjb250aW51ZXMgdG8gZXhlY3V0ZSBoZXJlLCBpdCBtZWFucyBgY3VycmVudGAgaXMgdGhlIG5vZGVcclxuICAgICAqIHRvIGluc2VydCBuZXcgZGF0YSBhZnRlci5cclxuICAgICAqL1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogYGN1cnJlbnRgIGlzIHRoZSB0YWlsLCBzbyByZXNldCBgdGhpcy50YWlsYFxyXG4gICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICB0aGlzLnRhaWwgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBPdGhlcndpc2UsIGluc2VydCBgbmV3Tm9kZWAgYmVmb3JlIGBjdXJyZW50Lm5leHRgIGJ5IHVwZGF0aW5nXHJcbiAgICAgICAqIGBjdXJyZW50Lm5leHQucHJldmlvdXNgIGFuZCBgbmV3Tm9kZS5ub2RlYC5cclxuICAgICAgICovXHJcbiAgICAgIGN1cnJlbnQhLm5leHQhLnByZXZpb3VzID0gbmV3Tm9kZVxyXG4gICAgICBuZXdOb2RlLm5leHQgPSBjdXJyZW50IS5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIE5leHQsIGluc2VydCBgbmV3Tm9kZWAgYWZ0ZXIgYGN1cnJlbnRgIGJ5IHVwZGF0aW5nIGBuZXdOb2RlLnByZXZpb3VzYCBhbmRcclxuICAgICAqIGBjdXJyZW50Lm5leHRgLlxyXG4gICAgICovXHJcbiAgICBuZXdOb2RlLnByZXZpb3VzID0gY3VycmVudFxyXG4gICAgY3VycmVudCEubmV4dCA9IG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBub2RlIHdob3NlIGRhdGFcclxuICAgKiAgICAgIHNob3VsZCBiZSByZXR1cm5lZC5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGRhdGEgaW4gdGhlIFwiZGF0YVwiIHBvcnRpb24gb2YgdGhlIGdpdmVuIG5vZGVcclxuICAgKiAgICAgIG9yIHVuZGVmaW5lZCBpZiB0aGUgbm9kZSBkb2Vzbid0IGV4aXN0LlxyXG4gICAqL1xyXG4gIGdldCAoaW5kZXg6IG51bWJlcik6IFQge1xyXG4gICAgLy8gZW5zdXJlIGBpbmRleGAgaXMgYSBwb3NpdGl2ZSB2YWx1ZVxyXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAgICogdXNlZCBpbnNpZGUgb2YgdGhlIGxvb3AgYmVsb3cuIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG9cclxuICAgICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gaW5zZXJ0IGludG8uXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzLCBidXQgbWFrZSBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnlcclxuICAgICAgICogbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQgYW5kIHVwZGF0ZSB0aGUgYHByZXZpb3VzYCBwb2ludGVyIGluXHJcbiAgICAgICAqIGFkZGl0aW9uIHRvIGBjdXJyZW50YC4gV2hlbiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnNcclxuICAgICAgICogd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvIGluc2VydCB0aGUgbmV3IGRhdGEuXHJcbiAgICAgICAqL1xyXG4gICAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICAgICAgaSsrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEF0IHRoaXMgcG9pbnQsIGBjdXJyZW50YCBtaWdodCBiZSBudWxsIGlmIHdlJ3ZlIGdvbmUgcGFzdCB0aGVcclxuICAgICAgICogZW5kIG9mIHRoZSBsaXN0LiBJbiB0aGF0IGNhc2UsIHdlIHJldHVybiBgdW5kZWZpbmVkYCB0byBpbmRpY2F0ZVxyXG4gICAgICAgKiB0aGF0IHRoZSBub2RlIGF0IGBpbmRleGAgd2FzIG5vdCBmb3VuZC4gSWYgYGN1cnJlbnRgIGlzIG5vdFxyXG4gICAgICAgKiBgbnVsbGAsIHRoZW4gaXQncyBzYWZlIHRvIHJldHVybiBgY3VycmVudC5kYXRhYC5cclxuICAgICAgICovXHJcbiAgICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQuZGF0YVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbmRleCAke2luZGV4fSBvdXQgb2YgcmFuZ2VgKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW5kZXggJHtpbmRleH0gb3V0IG9mIHJhbmdlYClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgaW5kZXggb2YgdGhlIGRhdGEgaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIHNlYXJjaCBmb3IuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZGF0YSBpbiB0aGUgbGlzdFxyXG4gICAqICAgICAgb3IgLTEgaWYgbm90IGZvdW5kLlxyXG4gICAqL1xyXG4gIGluZGV4T2YgKGRhdGE6IFQpOiBudW1iZXIge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaW5kZXhgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkXHJcbiAgICAgKiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgaW5kZXggPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzIGBkYXRhYC5cclxuICAgICAqIElmIGEgbWF0Y2ggaXMgZm91bmQsIGl0IHJldHVybnMgYGluZGV4YCBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKGN1cnJlbnQuZGF0YSA9PT0gZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hlcmUgd2UgYXJlXHJcbiAgICAgIGluZGV4KytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiAtMSBhcyB0aGUgXCJub3QgZm91bmRcIiB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgcmV0dXJuIC0xXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBpdGVtIHRoYXQgbWF0Y2hlcyBhIGdpdmVuIGZ1bmN0aW9uLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1hdGNoZXIgQSBmdW5jdGlvbiByZXR1cm5pbmcgdHJ1ZSB3aGVuIGFuIGl0ZW0gbWF0Y2hlc1xyXG4gICAqICAgICAgYW5kIGZhbHNlIHdoZW4gYW4gaXRlbSBkb2Vzbid0IG1hdGNoLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZmlyc3QgaXRlbSB0aGF0IHJldHVybnMgdHJ1ZSBmcm9tIHRoZSBtYXRjaGVyLCB1bmRlZmluZWRcclxuICAgKiAgICAgIGlmIG5vIGl0ZW1zIG1hdGNoLlxyXG4gICAqL1xyXG4gIGZpbmQgKG1hdGNoZXI6IChhcmcwOiBUKSA9PiBib29sZWFuLCBhc05vZGUgPSBmYWxzZSkgOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IFQge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGlzIGxvb3AgY2hlY2tzIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCB0byBzZWUgaWYgaXQgbWF0Y2hlcy5cclxuICAgICAqIElmIGEgbWF0Y2ggaXMgZm91bmQsIGl0IHJldHVybnMgdGhlIGRhdGEgaW1tZWRpYXRlbHksIGV4aXRpbmcgdGhlXHJcbiAgICAgKiBsb29wIGJlY2F1c2UgdGhlcmUncyBubyByZWFzb24gdG8ga2VlcCBzZWFyY2hpbmcuIFRoZSBzZWFyY2hcclxuICAgICAqIGNvbnRpbnVlcyB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBub2RlcyB0byBzZWFyY2ggKHdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCkuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGlmIChtYXRjaGVyKGN1cnJlbnQuZGF0YSkpIHtcclxuICAgICAgICBpZiAoYXNOb2RlKSB7XHJcbiAgICAgICAgICByZXR1cm4gY3VycmVudFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIGB1bmRlZmluZWRgIGFzIHRoZVxyXG4gICAgICogXCJub3QgZm91bmRcIiB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ05vIG1hdGNoaW5nIGRhdGEgZm91bmQnKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWF0Y2hlciBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIHdoZW4gYW4gaXRlbSBtYXRjaGVzXHJcbiAgICogICAgICBhbmQgZmFsc2Ugd2hlbiBhbiBpdGVtIGRvZXNuJ3QgbWF0Y2guXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpdGVtIHRoYXQgbWF0Y2hlcyBhIGdpdmVuIGZ1bmN0aW9uXHJcbiAgICogICAgICBvciAtMSBpZiB0aGVyZSBhcmUgbm8gbWF0Y2hpbmcgaXRlbXMuXHJcbiAgICovXHJcbiAgZmluZEluZGV4IChtYXRjaGVyOiAoYXJnMDogVCkgPT4gYm9vbGVhbik6IG51bWJlciB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaW5kZXhgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkXHJcbiAgICAgKiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgaW5kZXggPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgaW5kZXggaW1tZWRpYXRlbHksIGV4aXRpbmcgdGhlXHJcbiAgICAgKiBsb29wIGJlY2F1c2UgdGhlcmUncyBubyByZWFzb24gdG8ga2VlcCBzZWFyY2hpbmcuIFRoZSBzZWFyY2hcclxuICAgICAqIGNvbnRpbnVlcyB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBub2RlcyB0byBzZWFyY2ggKHdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCkuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGlmIChtYXRjaGVyKGN1cnJlbnQuZGF0YSkpIHtcclxuICAgICAgICByZXR1cm4gaW5kZXhcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvLyBrZWVwIHRyYWNrIG9mIHdoZXJlIHdlIGFyZVxyXG4gICAgICBpbmRleCsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gLTEgYXMgdGhlXHJcbiAgICAgKiBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gLTFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIG5vZGUgZnJvbSB0aGUgZ2l2ZW4gbG9jYXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBub2RlIHRvIHJlbW92ZS5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGRhdGEgaW4gdGhlIGdpdmVuIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIGluZGV4IGlzIG91dCBvZiByYW5nZS5cclxuICAgKi9cclxuICByZW1vdmUgKGluZGV4OiBudW1iZXIpIDogVCB7XHJcbiAgICAvLyBzcGVjaWFsIGNhc2VzOiBubyBub2RlcyBpbiB0aGUgbGlzdCBvciBgaW5kZXhgIGlzIG5lZ2F0aXZlXHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsIHx8IGluZGV4IDwgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IHJlbW92aW5nIHRoZSBmaXJzdCBub2RlXHJcbiAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgLy8gc3RvcmUgdGhlIGRhdGEgZnJvbSB0aGUgY3VycmVudCBoZWFkXHJcbiAgICAgIGNvbnN0IGRhdGE6IFQgPSB0aGlzLmhlYWQuZGF0YVxyXG5cclxuICAgICAgLy8ganVzdCByZXBsYWNlIHRoZSBoZWFkIHdpdGggdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICB0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV4dFxyXG5cclxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiB0aGVyZSB3YXMgb25seSBvbmUgbm9kZSwgc28gYWxzbyByZXNldCBgdGhpcy50YWlsYFxyXG4gICAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50YWlsID0gbnVsbFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaGVhZC5wcmV2aW91cyA9IG51bGxcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHRoZSBkYXRhIGF0IHRoZSBwcmV2aW91cyBoZWFkIG9mIHRoZSBsaXN0XHJcbiAgICAgIHJldHVybiBkYXRhXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgbGV0IGkgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHNpbWlsYXIgdG8gdGhlIGBnZXQoKWAgbWV0aG9kLCBidXQgbWFrZVxyXG4gICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkLiBXaGVuXHJcbiAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgKiByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGluY3JlbWVudCB0aGUgY291bnRcclxuICAgICAgaSsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGBjdXJyZW50YCBpc24ndCBgbnVsbGAsIHRoZW4gdGhhdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbm9kZVxyXG4gICAgICogdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBza2lwIG92ZXIgdGhlIG5vZGUgdG8gcmVtb3ZlXHJcbiAgICAgIGN1cnJlbnQhLnByZXZpb3VzIS5uZXh0ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBJZiB3ZSBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdCwgdGhlbiB1cGRhdGUgYHRoaXMudGFpbGAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIElmIHdlIGFyZSBub3QgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdCwgdGhlbiB1cGRhdGUgdGhlIGJhY2t3YXJkc1xyXG4gICAgICAgKiBwb2ludGVyIGZvciBgY3VycmVudC5uZXh0YCB0byBwcmVzZXJ2ZSByZXZlcnNlIHRyYXZlcnNhbC5cclxuICAgICAgICovXHJcbiAgICAgIGlmICh0aGlzLnRhaWwgPT09IGN1cnJlbnQpIHtcclxuICAgICAgICB0aGlzLnRhaWwgPSBjdXJyZW50LnByZXZpb3VzXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VycmVudCEubmV4dCEucHJldmlvdXMgPSBjdXJyZW50LnByZXZpb3VzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJldHVybiB0aGUgdmFsdWUgdGhhdCB3YXMganVzdCByZW1vdmVkIGZyb20gdGhlIGxpc3RcclxuICAgICAgcmV0dXJuIGN1cnJlbnQuZGF0YVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiB3ZSd2ZSBtYWRlIGl0IHRoaXMgZmFyLCBpdCBtZWFucyBgaW5kZXhgIGlzIGEgdmFsdWUgdGhhdFxyXG4gICAgICogZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdCwgc28gdGhyb3cgYW4gZXJyb3IuXHJcbiAgICAgKi9cclxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgbm9kZXMgZnJvbSB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKi9cclxuICBjbGVhciAoKTogdm9pZCB7XHJcbiAgICAvLyBqdXN0IHJlc2V0IGJvdGggdGhlIGhlYWQgYW5kIHRhaWwgcG9pbnRlciB0byBudWxsXHJcbiAgICB0aGlzLmhlYWQgPSBudWxsXHJcbiAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIG51bWJlciBvZiBub2RlcyBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBnZXQgc2l6ZSAoKTogbnVtYmVyIHtcclxuICAgIC8vIHNwZWNpYWwgY2FzZTogdGhlIGxpc3QgaXMgZW1wdHlcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIDBcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjb3VudGAgdmFyaWFibGUgaXMgdXNlZCB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmVcclxuICAgICAqIGJlZW4gdmlzaXRlZCBpbnNpZGUgdGhlIGxvb3AgYmVsb3cuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdGhpc1xyXG4gICAgICogaXMgdGhlIHZhbHVlIHRvIHJldHVybiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgY291bnQgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoYXQgbWVhbnMgd2UncmUgbm90IHlldCBhdCB0aGVcclxuICAgICAqIGVuZCBvZiB0aGUgbGlzdCwgc28gYWRkaW5nIDEgdG8gYGNvdW50YCBhbmQgdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgY291bnQrK1xyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCwgdGhlIGxvb3AgaXMgZXhpdGVkIGF0IHRoZSB2YWx1ZSBvZiBgY291bnRgXHJcbiAgICAgKiBpcyB0aGUgbnVtYmVyIG9mIG5vZGVzIHRoYXQgd2VyZSBjb3VudGVkIGluIHRoZSBsb29wLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gY291bnRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkZWZhdWx0IGl0ZXJhdG9yIGZvciB0aGUgY2xhc3MuXHJcbiAgICogQHJldHVybnMge0l0ZXJhdG9yfSBBbiBpdGVyYXRvciBmb3IgdGhlIGNsYXNzLlxyXG4gICAqL1xyXG4gIFtTeW1ib2wuaXRlcmF0b3JdICgpIHtcclxuICAgIHJldHVybiB0aGlzLnZhbHVlcygpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gaXRlcmF0b3IgdGhhdCByZXR1cm5zIGVhY2ggbm9kZSBpbiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7R2VuZXJhdG9yfSBBbiBpdGVyYXRvciBvbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICAqIHZhbHVlcyAoKTogR2VuZXJhdG9yPFQsIHZvaWQsIHVua25vd24+IHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhlcmUgaXMgYSBwaWVjZSBvZiBkYXRhXHJcbiAgICAgKiB0byB5aWVsZC5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgeWllbGQgY3VycmVudC5kYXRhXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpdGVyYXRvciB0aGF0IHJldHVybnMgZWFjaCBub2RlIGluIHRoZSBsaXN0IGluIHJldmVyc2Ugb3JkZXIuXHJcbiAgICogQHJldHVybnMge0dlbmVyYXRvcn0gQW4gaXRlcmF0b3Igb24gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgKiByZXZlcnNlICgpOiBHZW5lcmF0b3I8VCwgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSB0YWlsIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMudGFpbFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGVyZSBpcyBhIHBpZWNlIG9mIGRhdGFcclxuICAgICAqIHRvIHlpZWxkLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICB5aWVsZCBjdXJyZW50LmRhdGFcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoZSBsaXN0IGludG8gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXHJcbiAgICogQHJldHVybnMge1N0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgdG9TdHJpbmcgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gWy4uLnRoaXNdLnRvU3RyaW5nKClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERvdWJseUxpbmtlZExpc3RcclxuZXhwb3J0IGZ1bmN0aW9uXHJcbmFycmF5VG9Eb3VibHlMaW5rZWRMaXN0IDxUPiAoYXJyOiBBcnJheTxUPikge1xyXG4gIGNvbnN0IGxpc3QgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUPigpXHJcbiAgYXJyLmZvckVhY2goKGRhdGEpID0+IHtcclxuICAgIGxpc3QuYWRkKGRhdGEpXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIGxpc3RcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBwcm9taXNlSGFuZGxlcixcclxuICBodG1sVG9FbCxcclxuICBhZGRSZXNpemVEcmFnLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgdGhyb3dFeHByZXNzaW9uXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgeyBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgUGxheWFibGVFdmVudEFyZyBmcm9tICcuL3B1YnN1Yi9ldmVudC1hcmdzL3RyYWNrLXBsYXktYXJncydcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL3B1YnN1Yi9hZ2dyZWdhdG9yJ1xyXG5pbXBvcnQgeyBJUGxheWFibGUgfSBmcm9tICcuLi90eXBlcydcclxuXHJcbmNsYXNzIFNwb3RpZnlQbGF5YmFjayB7XHJcbiAgcGxheWVyOiBhbnk7XHJcbiAgaXNFeGVjdXRpbmdBY3Rpb246IGJvb2xlYW47XHJcbiAgZGV2aWNlX2lkOiBzdHJpbmc7XHJcbiAgc2VsUGxheWluZzoge1xyXG4gICAgICBlbGVtZW50OiBudWxsIHwgRWxlbWVudFxyXG4gICAgICB0cmFja191cmk6IHN0cmluZ1xyXG4gICAgICB0cmFja0RhdGFOb2RlOiBudWxsIHwgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gIH1cclxuXHJcbiAgZ2V0U3RhdGVJbnRlcnZhbDogTm9kZUpTLlRpbWVvdXQgfCBudWxsO1xyXG5cclxuICB3ZWJQbGF5ZXJFbHM6IHtcclxuICAgIHRpdGxlOiBFbGVtZW50IHwgbnVsbFxyXG4gICAgcHJvZ3Jlc3M6IEVsZW1lbnQgfCBudWxsXHJcbiAgICBjdXJyVGltZTogRWxlbWVudCB8IG51bGxcclxuICAgIGR1cmF0aW9uOiBFbGVtZW50IHwgbnVsbFxyXG4gIH07XHJcblxyXG4gIHBsYXllcklzUmVhZHk6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgdGhpcy5wbGF5ZXIgPSBudWxsXHJcbiAgICB0aGlzLmRldmljZV9pZCA9ICcnXHJcbiAgICB0aGlzLmdldFN0YXRlSW50ZXJ2YWwgPSBudWxsXHJcblxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMgPSB7XHJcbiAgICAgIHRpdGxlOiBudWxsLFxyXG4gICAgICBwcm9ncmVzczogbnVsbCxcclxuICAgICAgY3VyclRpbWU6IG51bGwsXHJcbiAgICAgIGR1cmF0aW9uOiBudWxsXHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbFBsYXlpbmcgPSB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgIHRyYWNrX3VyaTogJycsXHJcbiAgICAgIHRyYWNrRGF0YU5vZGU6IG51bGxcclxuICAgIH1cclxuICAgIHRoaXMucGxheWVySXNSZWFkeSA9IGZhbHNlXHJcbiAgICB0aGlzLl9sb2FkV2ViUGxheWVyKClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgX2xvYWRXZWJQbGF5ZXIgKCkge1xyXG4gICAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0QWNjZXNzVG9rZW4gfSksIChyZXMpID0+IHtcclxuICAgICAgLy8gdGhpcyB0YWtlcyB0b28gbG9uZyBhbmQgc3BvdGlmeSBzZGsgbmVlZHMgd2luZG93Lm9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgdG8gYmUgZGVmaW5lZCBxdWlja2VyLlxyXG4gICAgICBjb25zb2xlLmxvZygncmVxdWVzdCBwbGF5ZXInKVxyXG4gICAgICBjb25zdCBOT19DT05URU5UID0gMjA0XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSBOT19DT05URU5UIHx8IHJlcy5kYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5TcG90aWZ5KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2lzIGRlZmluZWQgc28gY3JlYXRlJylcclxuICAgICAgICAvLyBpZiB0aGUgc3BvdGlmeSBzZGsgaXMgYWxyZWFkeSBkZWZpbmVkIHNldCBwbGF5ZXIgd2l0aG91dCBzZXR0aW5nIG9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgbWVhbmluZyB0aGUgd2luZG93OiBXaW5kb3cgaXMgaW4gYSBkaWZmZXJlbnQgc2NvcGVcclxuICAgICAgICAvLyB1c2Ugd2luZG93LlNwb3RpZnkuUGxheWVyIGFzIHNwb3RpZnkgbmFtZXNwYWNlIGlzIGRlY2xhcmVkIGluIHRoZSBXaW5kb3cgaW50ZXJmYWNlIGFzIHBlciBEZWZpbml0ZWx5VHlwZWQgLT4gc3BvdGlmeS13ZWItcGxheWJhY2stc2RrIC0+IGluZGV4LmQudHMgaHR0cHM6Ly9naXRodWIuY29tL0RlZmluaXRlbHlUeXBlZC9EZWZpbml0ZWx5VHlwZWQvdHJlZS9tYXN0ZXIvdHlwZXMvc3BvdGlmeS13ZWItcGxheWJhY2stc2RrXHJcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgd2luZG93LlNwb3RpZnkuUGxheWVyKHtcclxuICAgICAgICAgIG5hbWU6ICdTcG90aWZ5IEluZm8gV2ViIFBsYXllcicsXHJcbiAgICAgICAgICBnZXRPQXV0aFRva2VuOiAoY2IpID0+IHtcclxuICAgICAgICAgICAgLy8gZ2l2ZSB0aGUgdG9rZW4gdG8gY2FsbGJhY2tcclxuICAgICAgICAgICAgY2IocmVzLmRhdGEpXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdm9sdW1lOiAwLjRcclxuICAgICAgICB9KVxyXG4gICAgICAgIHRoaXMuX2FkZExpc3RlbmVycygpXHJcbiAgICAgICAgLy8gQ29ubmVjdCB0byB0aGUgcGxheWVyIVxyXG4gICAgICAgIHRoaXMucGxheWVyLmNvbm5lY3QoKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG9mIHNwb3RpZnkgc2RrIGlzIHVuZGVmaW5lZFxyXG4gICAgICAgIHdpbmRvdy5vblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5ID0gKCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2NyZWF0ZSB3aGVuIHVuZGVmaW5lZCcpXHJcbiAgICAgICAgICAvLyBpZiBnZXR0aW5nIHRva2VuIHdhcyBzdWNjZXNmdWwgY3JlYXRlIHNwb3RpZnkgcGxheWVyIHVzaW5nIHRoZSB3aW5kb3cgaW4gdGhpcyBzY29wZVxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgd2luZG93LlNwb3RpZnkuUGxheWVyKHtcclxuICAgICAgICAgICAgbmFtZTogJ1Nwb3RpZnkgSW5mbyBXZWIgUGxheWVyJyxcclxuICAgICAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gZ2l2ZSB0aGUgdG9rZW4gdG8gY2FsbGJhY2tcclxuICAgICAgICAgICAgICBjYihyZXMuZGF0YSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdm9sdW1lOiAwLjFcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICB0aGlzLl9hZGRMaXN0ZW5lcnMoKVxyXG4gICAgICAgICAgLy8gQ29ubmVjdCB0byB0aGUgcGxheWVyIVxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXIuY29ubmVjdCgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfYWRkTGlzdGVuZXJzICgpIHtcclxuICAgIC8vIEVycm9yIGhhbmRsaW5nXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignaW5pdGlhbGl6YXRpb25fZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignYXV0aGVudGljYXRpb25fZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXliYWNrIGNvdWxkbnQgc3RhcnQnKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdhY2NvdW50X2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3BsYXliYWNrX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIFBsYXliYWNrIHN0YXR1cyB1cGRhdGVzXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcigncGxheWVyX3N0YXRlX2NoYW5nZWQnLCAoc3RhdGU6IFNwb3RpZnkuUGxheWJhY2tTdGF0ZSB8IG51bGwpID0+IHt9KVxyXG5cclxuICAgIC8vIFJlYWR5XHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcigncmVhZHknLCAoeyBkZXZpY2VfaWQgfTogeyBkZXZpY2VfaWQ6IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdSZWFkeSB3aXRoIERldmljZSBJRCcsIGRldmljZV9pZClcclxuICAgICAgdGhpcy5kZXZpY2VfaWQgPSBkZXZpY2VfaWRcclxuICAgICAgdGhpcy5hcHBlbmRXZWJQbGF5ZXJIdG1sKClcclxuICAgICAgdGhpcy5wbGF5ZXJJc1JlYWR5ID0gdHJ1ZVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBOb3QgUmVhZHlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdub3RfcmVhZHknLCAoeyBkZXZpY2VfaWQgfTogeyBkZXZpY2VfaWQ6IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdEZXZpY2UgSUQgaGFzIGdvbmUgb2ZmbGluZScsIGRldmljZV9pZClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBnZXRXZWJQbGF5ZXJFbHMgKCkge1xyXG4gICAgY29uc3Qgd2ViUGxheWVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXIpID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHBsYXlUaW1lQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVRpbWVCYXIpID8/IHRocm93RXhwcmVzc2lvbigncGxheSB0aW1lIGJhciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICB0aGlzLndlYlBsYXllckVscy5wcm9ncmVzcyA9IHdlYlBsYXllckVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzc1xyXG4gICAgKVswXSBhcyBFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBwcm9ncmVzcyBiYXIgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMudGl0bGUgPSB3ZWJQbGF5ZXJFbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaDQnKVswXSBhcyBFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciB0aXRsZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICAvLyBnZXQgcGxheXRpbWUgYmFyIGVsZW1lbnRzXHJcbiAgICB0aGlzLndlYlBsYXllckVscy5jdXJyVGltZSA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgY3VycmVudCB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMuZHVyYXRpb24gPSBwbGF5VGltZUJhci5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpWzFdIGFzIEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIGR1cmF0aW9uIHRpbWUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgfVxyXG5cclxuICBhcHBlbmRXZWJQbGF5ZXJIdG1sICgpIHtcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICA8YXJ0aWNsZSBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyfVwiIGNsYXNzPVwicmVzaXplLWRyYWdcIj5cclxuICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlRpdGxlPC9oND5cclxuICAgICAgPGRpdj5cclxuICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5UHJldn1cIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlQcmV2fVwiIGFsdD1cInByZXZpb3VzXCIvPjwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5UGF1c2V9XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wYXVzZUljb259XCIgYWx0PVwicGxheS9wYXVzZVwiLz48L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5TmV4dH1cIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlOZXh0fVwiIGFsdD1cIm5leHRcIi8+PC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcn1cIj5cclxuICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzc0Jhcn1cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzc31cIj48L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvYXJ0aWNsZT5cclxuICAgIGBcclxuXHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGh0bWxUb0VsKGh0bWwpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh3ZWJQbGF5ZXJFbCBhcyBOb2RlKVxyXG4gICAgdGhpcy5hc3NpZ25FdmVudExpc3RlbmVycygpXHJcbiAgICB0aGlzLmdldFdlYlBsYXllckVscygpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzc2lnbkV2ZW50TGlzdGVuZXJzICgpIHtcclxuICAgIGNvbnN0IHdlYlBsYXllciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllcilcclxuICAgIGlmICh3ZWJQbGF5ZXIgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWIgcGxheWVyIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgfVxyXG4gICAgY29uc3QgcGxheVByZXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5UHJldilcclxuICAgIGNvbnN0IHBsYXlQYXVzZSA9IHdlYlBsYXllci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5UGF1c2UpWzBdXHJcbiAgICBjb25zdCBwbGF5TmV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlOZXh0KVxyXG5cclxuICAgIHBsYXlQcmV2Py5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJ5UGxheVByZXYodGhpcy5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGUpKVxyXG4gICAgcGxheU5leHQ/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSkpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVXZWJQbGF5ZXIgKHBlcmNlbnREb25lOiBudW1iZXIsIHBvc2l0aW9uOiBudW1iZXIpIHtcclxuICAgIGlmIChwb3NpdGlvbiAhPT0gMCkge1xyXG4gICAgICAodGhpcy53ZWJQbGF5ZXJFbHMucHJvZ3Jlc3MgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLndpZHRoID0gYCR7cGVyY2VudERvbmV9JWBcclxuICAgICAgaWYgKHRoaXMud2ViUGxheWVyRWxzLmN1cnJUaW1lID09IG51bGwpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgdGltZSBlbGVtZW50IGlzIG51bGwnKVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMud2ViUGxheWVyRWxzLmN1cnJUaW1lLnRleHRDb250ZW50ID1cclxuICAgICAgICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKHBvc2l0aW9uKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFRyaWVzIHRvIHBsYXkgdGhlIHByZXZpb3VzIElQbGF5YWJsZSBnaXZlbiB0aGUgY3VycmVudCBwbGF5aW5nIElQbGF5YWJsZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHRyeVBsYXlQcmV2IChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIGlmIChjdXJyTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHRoZSBmaXJzdCBub2RlIG9yIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nXHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gJiYgY3Vyck5vZGUucHJldmlvdXMgIT09IG51bGwpIHtcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXkgcHJldicpXHJcbiAgICAgIGNvbnN0IHByZXZUcmFjayA9IGN1cnJOb2RlLnByZXZpb3VzLmRhdGFcclxuICAgICAgdGhpcy5zZXRTZWxQbGF5aW5nRWwobmV3IFBsYXlhYmxlRXZlbnRBcmcocHJldlRyYWNrLCBjdXJyTm9kZS5wcmV2aW91cykpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVHJpZXMgdG8gcGxheSB0aGUgbmV4dCBJUGxheWFibGUgZ2l2ZW4gdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICB0cnlQbGF5TmV4dCAoY3Vyck5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICBpZiAoY3Vyck5vZGUgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhpcyBpcyB0aGUgbGFzdCBub2RlIG9yIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nXHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gJiYgY3Vyck5vZGUubmV4dCAhPT0gbnVsbCkge1xyXG4gICAgICBjb25zb2xlLmxvZygncGxheSBuZXh0JylcclxuICAgICAgY29uc3QgbmV4dFRyYWNrID0gY3Vyck5vZGUubmV4dC5kYXRhXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKG5leHRUcmFjaywgY3Vyck5vZGUubmV4dCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBvblRyYWNrRmluaXNoICgpIHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCB3YXMgbnVsbCBiZWZvcmUgZGVzZWxlY3Rpb24gb24gc29uZyBmaW5pc2gnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IG51bGxcclxuICAgIHRoaXMuc2VsUGxheWluZy50cmFja191cmkgPSAnJztcclxuXHJcbiAgICAodGhpcy53ZWJQbGF5ZXJFbHMucHJvZ3Jlc3MgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCBhcyBOb2RlSlMuVGltZW91dClcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuc2VsUGxheWluZyEudHJhY2tEYXRhTm9kZSlcclxuICAgIHRoaXMudHJ5UGxheU5leHQodGhpcy5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGUpXHJcbiAgfVxyXG5cclxuICAvKiogU2V0cyBhbiBpbnRlcnZhbCB0aGF0IG9idGFpbnMgdGhlIHN0YXRlIG9mIHRoZSBwbGF5ZXIgZXZlcnkgc2Vjb25kLlxyXG4gICAqIFNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIGEgc29uZyBpcyBwbGF5aW5nLlxyXG4gICAqL1xyXG4gIHNldEdldFN0YXRlSW50ZXJ2YWwgKCkge1xyXG4gICAgbGV0IGR1cmF0aW9uTWluU2VjID0gJydcclxuICAgIGlmICh0aGlzLmdldFN0YXRlSW50ZXJ2YWwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwpXHJcbiAgICB9XHJcbiAgICAvLyBzZXQgdGhlIGludGVydmFsIHRvIHJ1biBldmVyeSBzZWNvbmQgYW5kIG9idGFpbiB0aGUgc3RhdGVcclxuICAgIHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCkudGhlbigoc3RhdGU6IHsgcG9zaXRpb246IGFueTsgZHVyYXRpb246IGFueSB9KSA9PiB7XHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgJ1VzZXIgaXMgbm90IHBsYXlpbmcgbXVzaWMgdGhyb3VnaCB0aGUgV2ViIFBsYXliYWNrIFNESydcclxuICAgICAgICAgIClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB7IHBvc2l0aW9uLCBkdXJhdGlvbiB9ID0gc3RhdGVcclxuXHJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXNudCBhIGR1cmF0aW9uIHNldCBmb3IgdGhpcyBzb25nIHNldCBpdC5cclxuICAgICAgICBpZiAoZHVyYXRpb25NaW5TZWMgPT09ICcnKSB7XHJcbiAgICAgICAgICBkdXJhdGlvbk1pblNlYyA9IG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMoZHVyYXRpb24pXHJcbiAgICAgICAgICB0aGlzLndlYlBsYXllckVscyEuZHVyYXRpb24hLnRleHRDb250ZW50ID0gZHVyYXRpb25NaW5TZWNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBlcmNlbnREb25lID0gKHBvc2l0aW9uIC8gZHVyYXRpb24pICogMTAwXHJcblxyXG4gICAgICAgIC8vIHRoZSBwb3NpdGlvbiBnZXRzIHNldCB0byAwIHdoZW4gdGhlIHNvbmcgaXMgZmluaXNoZWRcclxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApIHtcclxuICAgICAgICAgIHRoaXMub25UcmFja0ZpbmlzaCgpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGlmIHRoZSBwb3NpdGlvbiBpc250IDAgdXBkYXRlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVdlYlBsYXllcihwZXJjZW50RG9uZSwgcG9zaXRpb24pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSwgMTAwMClcclxuICB9XHJcblxyXG4gIC8qKiBTZWxlY3QgYSBjZXJ0YWluIHBsYXkvcGF1c2UgZWxlbWVudCBhbmQgcGxheSB0aGUgZ2l2ZW4gdHJhY2sgdXJpXHJcbiAgICogYW5kIHVuc2VsZWN0IHRoZSBwcmV2aW91cyBvbmUgdGhlbiBwYXVzZSB0aGUgcHJldmlvdXMgdHJhY2tfdXJpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQbGF5YWJsZUV2ZW50QXJnfSBldmVudEFyZyAtIGEgY2xhc3MgdGhhdCBjb250YWlucyB0aGUgY3VycmVudCwgbmV4dCBhbmQgcHJldmlvdXMgdHJhY2tzIHRvIHBsYXlcclxuICAgKi9cclxuICBhc3luYyBzZXRTZWxQbGF5aW5nRWwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSB7XHJcbiAgICBjb25zb2xlLmxvZyhldmVudEFyZy5wbGF5YWJsZU5vZGUpXHJcbiAgICAvLyBpZiB0aGUgcGxheWVyIGlzbid0IHJlYWR5IHdlIGNhbm5vdCBjb250aW51ZS5cclxuICAgIGlmICghdGhpcy5wbGF5ZXJJc1JlYWR5KSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdwbGF5ZXIgaXMgbm90IHJlYWR5JylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICBjb25zb2xlLmxvZygnaXMgY3VycmVudGx5IGV4ZWN1dGluZyBhY3Rpb24nKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSB0cnVlXHJcbiAgICBjb25zb2xlLmxvZygnU3RhcnQgQWN0aW9uJylcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCAhPSBudWxsKSB7XHJcbiAgICAgIC8vIGlmIHRoZXJlIGFscmVhZHkgaXMgYSBzZWxlY3RlZCBlbGVtZW50IHVuc2VsZWN0IGl0XHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG5cclxuICAgICAgYXdhaXQgdGhpcy5wYXVzZSgpXHJcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsIGFzIE5vZGVKUy5UaW1lb3V0KVxyXG4gICAgICAvLyBpZiB0aGUgc2VsZWN0ZWQgZWwgaXMgdGhlIHNhbWUgYXMgdGhlIHByZXYgdGhlbiBudWxsIGl0IGFuZCByZXR1cm4gc28gd2UgZG8gbm90IGVuZCB1cCByZXNlbGVjdGluZyBpdCByaWdodCBhZnRlciBkZXNlbGVjdGluZy5cclxuICAgICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID09PSBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwpIHtcclxuICAgICAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IG51bGxcclxuICAgICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgICBjb25zb2xlLmxvZygnQWN0aW9uIEVuZGVkJylcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHByZXYgdHJhY2sgdXJpIGlzIHRoZSBzYW1lIHRoZW4gcmVzdW1lIHRoZSBzb25nIGluc3RlYWQgb2YgcmVwbGF5aW5nIGl0LlxyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy50cmFja191cmkgPT09IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmkpIHtcclxuICAgICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKFxyXG4gICAgICAgIGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbCxcclxuICAgICAgICBldmVudEFyZy5jdXJyUGxheWFibGUudXJpLFxyXG4gICAgICAgIGFzeW5jICgpID0+IHRoaXMucmVzdW1lKCksXHJcbiAgICAgICAgZXZlbnRBcmcuY3VyclBsYXlhYmxlLnRpdGxlLFxyXG4gICAgICAgIGV2ZW50QXJnLnBsYXlhYmxlTm9kZVxyXG4gICAgICApXHJcbiAgICAgIGNvbnNvbGUubG9nKCdBY3Rpb24gRW5kZWQnKVxyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKFxyXG4gICAgICBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwsXHJcbiAgICAgIGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmksXHJcbiAgICAgIGFzeW5jICgpID0+IHRoaXMucGxheShldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSxcclxuICAgICAgZXZlbnRBcmcuY3VyclBsYXlhYmxlLnRpdGxlLFxyXG4gICAgICBldmVudEFyZy5wbGF5YWJsZU5vZGVcclxuICAgIClcclxuICAgIGNvbnNvbGUubG9nKCdBY3Rpb24gRW5kZWQnKVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBhc3luYyBzdGFydFRyYWNrIChzZWxFbDogRWxlbWVudCwgdHJhY2tfdXJpOiBzdHJpbmcsIHBsYXlpbmdBc3luY0Z1bmM6IEZ1bmN0aW9uLCB0aXRsZTogc3RyaW5nLCB0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICAgIGNvbnNvbGUubG9nKCdTdGFydCcpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSA9IHRyYWNrTm9kZVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBzZWxFbFxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID0gdHJhY2tfdXJpXHJcblxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMhLnRpdGxlIS50ZXh0Q29udGVudCA9IHRpdGxlXHJcblxyXG4gICAgYXdhaXQgcGxheWluZ0FzeW5jRnVuYygpXHJcblxyXG4gICAgLy8gc2V0IHBsYXlpbmcgc3RhdGUgb25jZSBzb25nIHN0YXJ0cyBwbGF5aW5nXHJcbiAgICB0aGlzLnNldEdldFN0YXRlSW50ZXJ2YWwoKVxyXG4gIH1cclxuXHJcbiAgLyoqIFBsYXlzIGEgdHJhY2sgdGhyb3VnaCB0aGlzIGRldmljZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFja191cmkgLSB0aGUgdHJhY2sgdXJpIHRvIHBsYXlcclxuICAgKiBAcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdHJhY2sgaGFzIGJlZW4gcGxheWVkIHN1Y2Nlc2Z1bGx5LlxyXG4gICAqL1xyXG4gIGFzeW5jIHBsYXkgKHRyYWNrX3VyaTogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXlUcmFjayh0aGlzLmRldmljZV9pZCwgdHJhY2tfdXJpKSlcclxuICAgIClcclxuICAgIGNvbnNvbGUubG9nKCdwbGF5JylcclxuICB9XHJcblxyXG4gIGFzeW5jIHJlc3VtZSAoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnBsYXllci5yZXN1bWUoKVxyXG4gICAgY29uc29sZS5sb2coJ3Jlc3VtZScpXHJcbiAgfVxyXG5cclxuICBhc3luYyBwYXVzZSAoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnBsYXllci5wYXVzZSgpXHJcbiAgICBjb25zb2xlLmxvZygncGF1c2VkJylcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHNwb3RpZnlQbGF5YmFjayA9IG5ldyBTcG90aWZ5UGxheWJhY2soKVxyXG5cclxuaWYgKCh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgPT09IHVuZGVmaW5lZCkge1xyXG4gIC8vIGNyZWF0ZSBhIGdsb2JhbCB2YXJpYWJsZSB0byBiZSB1c2VkXHJcbiAgKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciA9IG5ldyBFdmVudEFnZ3JlZ2F0b3IoKVxyXG59XHJcbmNvbnN0IGV2ZW50QWdncmVnYXRvciA9ICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgYXMgRXZlbnRBZ2dyZWdhdG9yXHJcblxyXG4vLyBzdWJzY3JpYmUgdGhlIHNldFBsYXlpbmcgZWxlbWVudCBldmVudFxyXG5ldmVudEFnZ3JlZ2F0b3Iuc3Vic2NyaWJlKFBsYXlhYmxlRXZlbnRBcmcubmFtZSwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSA9PlxyXG4gIHNwb3RpZnlQbGF5YmFjay5zZXRTZWxQbGF5aW5nRWwoZXZlbnRBcmcpXHJcbilcclxuYWRkUmVzaXplRHJhZygpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTYW1lUGxheWluZ1VSSSAodXJpOiBzdHJpbmcpIHtcclxuICByZXR1cm4gKFxyXG4gICAgdXJpID09PSBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy50cmFja191cmkgJiZcclxuICAgICAgc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcuZWxlbWVudCAhPSBudWxsXHJcbiAgKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlciAodXJpOiBzdHJpbmcsIHNlbEVsOiBFbGVtZW50LCB0cmFja0RhdGFOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+KSB7XHJcbiAgaWYgKGlzU2FtZVBsYXlpbmdVUkkodXJpKSkge1xyXG4gICAgLy8gVGhpcyBlbGVtZW50IHdhcyBwbGF5aW5nIGJlZm9yZSByZXJlbmRlcmluZyBzbyBzZXQgaXQgdG8gYmUgdGhlIGN1cnJlbnRseSBwbGF5aW5nIG9uZSBhZ2FpblxyXG4gICAgc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcuZWxlbWVudCA9IHNlbEVsXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy50cmFja0RhdGFOb2RlID0gdHJhY2tEYXRhTm9kZVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIGh0bWxUb0VsLCBnZXRWYWxpZEltYWdlIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgVHJhY2ssIHsgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSB9IGZyb20gJy4vdHJhY2snXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QgZnJvbSAnLi9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCB7IFBsYXlsaXN0VHJhY2tEYXRhLCBTcG90aWZ5SW1nLCBUcmFja0RhdGEgfSBmcm9tICcuLi90eXBlcydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY2xhc3MgUGxheWxpc3QgZXh0ZW5kcyBDYXJkIHtcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgaWQ6IHN0cmluZztcclxuICB1bmRvU3RhY2s6IEFycmF5PEFycmF5PFRyYWNrPj47XHJcbiAgb3JkZXI6IHN0cmluZztcclxuICB0cmFja0xpc3Q6IHVuZGVmaW5lZCB8IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+O1xyXG4gIGltYWdlVXJsOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChuYW1lOiBzdHJpbmcsIGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGlkOiBzdHJpbmcpIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgIHRoaXMuaWQgPSBpZFxyXG4gICAgdGhpcy51bmRvU3RhY2sgPSBbXVxyXG4gICAgdGhpcy5vcmRlciA9ICdjdXN0b20tb3JkZXInIC8vIHNldCBpdCBhcyB0aGUgaW5pdGlhbCBvcmRlclxyXG4gICAgdGhpcy50cmFja0xpc3QgPSB1bmRlZmluZWRcclxuXHJcbiAgICAvLyB0aGUgaWQgb2YgdGhlIHBsYXlsaXN0IGNhcmQgZWxlbWVudFxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gIH1cclxuXHJcbiAgYWRkVG9VbmRvU3RhY2sgKHRyYWNrczogQXJyYXk8VHJhY2s+KSB7XHJcbiAgICB0aGlzLnVuZG9TdGFjay5wdXNoKHRyYWNrcylcclxuICB9XHJcblxyXG4gIC8qKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgcGxheWxpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRQbGF5bGlzdENhcmRIdG1sIChpZHg6IG51bWJlciwgaW5UZXh0Rm9ybTogYm9vbGVhbiwgaXNTZWxlY3RlZCA9IGZhbHNlKTogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLnBsYXlsaXN0UHJlZml4fSR7aWR4fWBcclxuXHJcbiAgICBjb25zdCBleHBhbmRPbkhvdmVyID0gaW5UZXh0Rm9ybSA/ICcnIDogY29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJcclxuXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIke2V4cGFuZE9uSG92ZXJ9XCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUlufSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuY2FyZFxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdH0gJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9ICR7XHJcbiAgICAgIGlzU2VsZWN0ZWQgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgfVwiIGlkPVwiJHt0aGlzLmdldENhcmRJZCgpfVwiIHRpdGxlPVwiQ2xpY2sgdG8gVmlldyBUcmFja3NcIj5cclxuICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZVVybH1cIiBhbHQ9XCJQbGF5bGlzdCBDb3ZlclwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXBcclxuICAgIH1cIj4ke3RoaXMubmFtZX08L2g0PlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGBcclxuICAgIHJldHVybiBodG1sVG9FbChodG1sKSBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICAvKiogUHJvZHVjZXMgbGlzdCBvZiBUcmFjayBjbGFzcyBpbnN0YW5jZXMgdXNpbmcgdHJhY2sgZGF0YXMgZnJvbSBzcG90aWZ5IHdlYiBhcGkuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz59IC0gTGlzdCBvZiB0cmFjayBjbGFzc2VzIGNyZWF0ZWQgdXNpbmcgdGhlIG9idGFpbmVkIHRyYWNrIGRhdGFzLlxyXG4gICAqL1xyXG4gIGFzeW5jIGxvYWRUcmFja3MgKCk6IFByb21pc2U8RG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBudWxsPiB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcy5yZXF1ZXN0PEFycmF5PFBsYXlsaXN0VHJhY2tEYXRhPj4oeyBtZXRob2Q6ICdnZXQnLCB1cmw6IGAke2NvbmZpZy5VUkxzLmdldFBsYXlsaXN0VHJhY2tzICsgdGhpcy5pZH1gIH0pXHJcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycilcclxuICAgICAgfSlcclxuXHJcbiAgICBpZiAoIXJlcykge1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG4gICAgY29uc3QgdHJhY2tMaXN0ID0gbmV3IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+KClcclxuXHJcbiAgICAvLyBtYXAgZWFjaCB0cmFjayBkYXRhIGluIHRoZSBwbGF5bGlzdCBkYXRhIHRvIGFuIGFycmF5LlxyXG4gICAgY29uc3QgdHJhY2tzRGF0YSA9IHJlcy5kYXRhLm1hcCgoZGF0YSkgPT4gZGF0YS50cmFjaykgYXMgQXJyYXk8VHJhY2tEYXRhPlxyXG4gICAgZ2V0UGxheWxpc3RUcmFja3NGcm9tRGF0YXModHJhY2tzRGF0YSwgcmVzLmRhdGEsIHRyYWNrTGlzdClcclxuXHJcbiAgICAvLyBkZWZpbmUgdHJhY2sgb2JqZWN0c1xyXG4gICAgdGhpcy50cmFja0xpc3QgPSB0cmFja0xpc3RcclxuICAgIHJldHVybiB0cmFja0xpc3RcclxuICB9XHJcblxyXG4gIGhhc0xvYWRlZFRyYWNrcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFja0xpc3QgIT09IHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuLyoqIEdldHMgcGxheWxpc3QgdHJhY2tzIGZyb20gZGF0YS4gVGhpcyBhbHNvIGluaXRpYWxpemVzIHRoZSBkYXRlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFRyYWNrRGF0YT59IHRyYWNrc0RhdGFcclxuICogQHBhcmFtIHtBcnJheTxQbGF5bGlzdFRyYWNrRGF0YT59IGRhdGVBZGRlZE9iamVjdHMgLSBUaGUgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGFkZGVkX2F0IHZhcmlhYmxlLlxyXG4gKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+fSB0cmFja3NMaXN0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGxheWxpc3RUcmFja3NGcm9tRGF0YXMgKFxyXG4gIHRyYWNrc0RhdGE6IEFycmF5PFRyYWNrRGF0YT4sXHJcbiAgZGF0ZUFkZGVkT2JqZWN0czogQXJyYXk8UGxheWxpc3RUcmFja0RhdGE+LFxyXG4gIHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz5cclxuKSB7XHJcbiAgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSh0cmFja3NEYXRhLCB0cmFja0xpc3QpXHJcblxyXG4gIGxldCBpID0gMFxyXG4gIC8vIHNldCB0aGUgZGF0ZXMgYWRkZWRcclxuICBmb3IgKGNvbnN0IHRyYWNrT3V0IG9mIHRyYWNrTGlzdC52YWx1ZXMoKSkge1xyXG4gICAgY29uc3QgZGF0ZUFkZGVkT2JqID0gZGF0ZUFkZGVkT2JqZWN0c1tpXVxyXG4gICAgY29uc3QgdHJhY2s6IFRyYWNrID0gdHJhY2tPdXRcclxuXHJcbiAgICB0cmFjay5zZXREYXRlQWRkZWRUb1BsYXlsaXN0KGRhdGVBZGRlZE9iai5hZGRlZF9hdClcclxuICAgIGkrK1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxheWxpc3RcclxuIiwiaW1wb3J0IFN1YnNjcmlwdGlvbiBmcm9tICcuL3N1YnNjcmlwdGlvbidcclxuXHJcbi8qKiBMZXRzIHNheSB5b3UgaGF2ZSB0d28gZG9vcnMgdGhhdCB3aWxsIG9wZW4gdGhyb3VnaCB0aGUgcHViIHN1YiBzeXN0ZW0uIFdoYXQgd2lsbCBoYXBwZW4gaXMgdGhhdCB3ZSB3aWxsIHN1YnNjcmliZSBvbmVcclxuICogb24gZG9vciBvcGVuIGV2ZW50LiBXZSB3aWxsIHRoZW4gaGF2ZSB0d28gcHVibGlzaGVycyB0aGF0IHdpbGwgZWFjaCBwcm9wYWdhdGUgYSBkaWZmZXJlbnQgZG9vciB0aHJvdWdoIHRoZSBhZ2dyZWdhdG9yIGF0IGRpZmZlcmVudCBwb2ludHMuXHJcbiAqIFRoZSBhZ2dyZWdhdG9yIHdpbGwgdGhlbiBleGVjdXRlIHRoZSBvbiBkb29yIG9wZW4gc3Vic2NyaWJlciBhbmQgcGFzcyBpbiB0aGUgZG9vciBnaXZlbiBieSBlaXRoZXIgcHVibGlzaGVyLlxyXG4gKi9cclxuXHJcbi8qKiBNYW5hZ2VzIHN1YnNjcmliaW5nIGFuZCBwdWJsaXNoaW5nIG9mIGV2ZW50cy5cclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiBBbiBhcmdUeXBlIGlzIG9idGFpbmVkIGJ5IHRha2luZyB0aGUgJ0NsYXNzSW5zdGFuY2UnLmNvbnRydWN0b3IubmFtZSBvciAnQ2xhc3MnLm5hbWUuXHJcbiAqIFN1YnNjcmlwdGlvbnMgYXJlIGdyb3VwZWQgdG9nZXRoZXIgYnkgYXJnVHlwZSBhbmQgdGhlaXIgZXZ0IHRha2VzIGFuIGFyZ3VtZW50IHRoYXQgaXMgYVxyXG4gKiBjbGFzcyB3aXRoIHRoZSBjb25zdHJ1Y3Rvci5uYW1lIG9mIGFyZ1R5cGUuXHJcbiAqXHJcbiAqL1xyXG5jbGFzcyBFdmVudEFnZ3JlZ2F0b3Ige1xyXG4gIHN1YnNjcmliZXJzOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PFN1YnNjcmlwdGlvbj4gfTtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAvLyBrZXkgLSB0eXBlLCB2YWx1ZSAtIFtdIG9mIGZ1bmN0aW9ucyB0aGF0IHRha2UgYSBjZXJ0YWluIHZhbHVlIGRlcGVuZGluZyBvbiB0aGUgdHlwZVxyXG4gICAgdGhpcy5zdWJzY3JpYmVycyA9IHt9XHJcbiAgfVxyXG5cclxuICAvKiogU3Vic2NyaWJlcyBhIHR5cGUgb2YgZXZlbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gYXJnVHlwZSAtIHRoZSB0eXBlIHRoYXQgdGhpcyBzdWJzY3JpYmVyIGJlbG9uZ3MgdG9vLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGV2ZW50IC0gdGhlIGV2ZW50IHRoYXQgdGFrZXMgdGhlIHNhbWUgYXJncyBhcyBhbGwgb3RoZXIgZXZlbnRzIG9mIHRoZSBnaXZlbiB0eXBlLlxyXG4gICAqL1xyXG4gIHN1YnNjcmliZSAoYXJnVHlwZTogc3RyaW5nLCBldnQ6IEZ1bmN0aW9uKSB7XHJcbiAgICBjb25zdCBzdWJzY3JpYmVyID0gbmV3IFN1YnNjcmlwdGlvbih0aGlzLCBldnQsIGFyZ1R5cGUpXHJcblxyXG4gICAgaWYgKGFyZ1R5cGUgaW4gdGhpcy5zdWJzY3JpYmVycykge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdLnB1c2goc3Vic2NyaWJlcilcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbYXJnVHlwZV0gPSBbc3Vic2NyaWJlcl1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBVbnN1YnNjcmliZXMgYSBnaXZlbiBzdWJzY3JpcHRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1N1YnNjcmlwdGlvbn0gc3Vic2NyaXB0aW9uXHJcbiAgICovXHJcbiAgdW5zdWJzY3JpYmUgKHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uKSB7XHJcbiAgICBpZiAoc3Vic2NyaXB0aW9uLmFyZ1R5cGUgaW4gdGhpcy5zdWJzY3JpYmVycykge1xyXG4gICAgICAvLyBmaWx0ZXIgb3V0IHRoZSBzdWJzY3JpcHRpb24gZ2l2ZW4gZnJvbSB0aGUgc3Vic2NyaWJlcnMgZGljdGlvbmFyeVxyXG4gICAgICBjb25zdCBmaWx0ZXJlZCA9IHRoaXMuc3Vic2NyaWJlcnNbc3Vic2NyaXB0aW9uLmFyZ1R5cGVdLmZpbHRlcihmdW5jdGlvbiAoc3ViKSB7XHJcbiAgICAgICAgcmV0dXJuIHN1Yi5pZCAhPT0gc3Vic2NyaXB0aW9uLmlkXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW3N1YnNjcmlwdGlvbi5hcmdUeXBlXSA9IGZpbHRlcmVkXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaGVzIGFsbCBzdWJzY3JpYmVycyB0aGF0IHRha2UgYXJndW1lbnRzIG9mIGEgZ2l2ZW4gdHlwZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzIC0gYSBjbGFzcyB0aGF0IGNvbnRhaW5zIGFyZ3VtZW50cyBmb3IgdGhlIGV2ZW50LiBNdXN0IGJlIGEgY2xhc3MgYXMgc3Vic2NyaWJlcnMgYXJlIGdyb3VwZWQgYnkgdHlwZS5cclxuICAgKi9cclxuICBwdWJsaXNoIChhcmdzOiBPYmplY3QpIHtcclxuICAgIGNvbnN0IGFyZ1R5cGUgPSBhcmdzLmNvbnN0cnVjdG9yLm5hbWVcclxuXHJcbiAgICBpZiAoYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbYXJnVHlwZV0uZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiB7XHJcbiAgICAgICAgc3Vic2NyaXB0aW9uLmV2dChhcmdzKVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5lcnJvcignbm8gdHlwZSBmb3VuZCBmb3IgcHVibGlzaGluZycpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGVhclN1YnNjcmlwdGlvbnMgKCkge1xyXG4gICAgdGhpcy5zdWJzY3JpYmVycyA9IHt9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFdmVudEFnZ3JlZ2F0b3JcclxuIiwiaW1wb3J0IHsgSVBsYXlhYmxlIH0gZnJvbSAnLi4vLi4vLi4vdHlwZXMnXHJcbmltcG9ydCB7IERvdWJseUxpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi4vLi4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWFibGVFdmVudEFyZyB7XHJcbiAgY3VyclBsYXlhYmxlOiBJUGxheWFibGU7XHJcbiAgcGxheWFibGVOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcblxyXG4gIC8qKiBUYWtlcyBpbiB0aGUgY3VycmVudCB0cmFjayB0byBwbGF5IGFzIHdlbGwgYXMgdGhlIHByZXYgdHJhY2tzIGFuZCBuZXh0IHRyYWNrcyBmcm9tIGl0LlxyXG4gICAqIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB0YWtlIFRyYWNrIGluc3RhbmNlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SVBsYXlhYmxlfSBjdXJyVHJhY2sgLSBvYmplY3QgY29udGFpbmluZyBlbGVtZW50IHRvIHNlbGVjdCwgdHJhY2tfdXJpLCBhbmQgdHJhY2sgdGl0bGUuXHJcbiAgICogQHBhcmFtIHtEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+fSB0cmFja05vZGUgLSBub2RlIHRoYXQgYWxsb3dzIHVzIHRvIHRyYXZlcnNlIHRvIG5leHQgYW5kIHByZXZpb3VzIHRyYWNrIGRhdGFzLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yIChjdXJyVHJhY2s6IElQbGF5YWJsZSwgdHJhY2tOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+KSB7XHJcbiAgICB0aGlzLmN1cnJQbGF5YWJsZSA9IGN1cnJUcmFja1xyXG4gICAgdGhpcy5wbGF5YWJsZU5vZGUgPSB0cmFja05vZGVcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL2FnZ3JlZ2F0b3InXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdWJzY3JpcHRpb24ge1xyXG4gIGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yO1xyXG4gIGV2dDogRnVuY3Rpb247XHJcbiAgYXJnVHlwZTogc3RyaW5nO1xyXG4gIGlkOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChldmVudEFnZ3JlZ2F0b3I6IEV2ZW50QWdncmVnYXRvciwgZXZ0OiBGdW5jdGlvbiwgYXJnVHlwZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmV2ZW50QWdncmVnYXRvciA9IGV2ZW50QWdncmVnYXRvclxyXG4gICAgdGhpcy5ldnQgPSBldnRcclxuICAgIHRoaXMuYXJnVHlwZSA9IGFyZ1R5cGVcclxuICAgIHRoaXMuaWQgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIGh0bWxUb0VsLFxyXG4gIGdldFZhbGlkSW1hZ2VcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7XHJcbiAgY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlcixcclxuICBpc1NhbWVQbGF5aW5nVVJJXHJcbn0gZnJvbSAnLi9wbGF5YmFjay1zZGsnXHJcbmltcG9ydCBBbGJ1bSBmcm9tICcuL2FsYnVtJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcbmltcG9ydCBQbGF5YWJsZUV2ZW50QXJnIGZyb20gJy4vcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzJ1xyXG5pbXBvcnQgeyBTcG90aWZ5SW1nLCBGZWF0dXJlc0RhdGEsIElBcnRpc3RUcmFja0RhdGEsIElQbGF5YWJsZSwgRXh0ZXJuYWxVcmxzLCBUcmFja0RhdGEgfSBmcm9tICcuLi90eXBlcydcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QsIHsgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vcHVic3ViL2FnZ3JlZ2F0b3InXHJcblxyXG5jb25zdCBldmVudEFnZ3JlZ2F0b3IgPSAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yIGFzIEV2ZW50QWdncmVnYXRvclxyXG5cclxuY2xhc3MgVHJhY2sgZXh0ZW5kcyBDYXJkIGltcGxlbWVudHMgSVBsYXlhYmxlIHtcclxuICBwcml2YXRlIGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzO1xyXG4gIHByaXZhdGUgX2lkOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfdGl0bGU6IHN0cmluZztcclxuICBwcml2YXRlIF9kdXJhdGlvbjogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3VyaTogc3RyaW5nO1xyXG4gIHBvcHVsYXJpdHk6IHN0cmluZztcclxuICBwcml2YXRlIF9kYXRlQWRkZWRUb1BsYXlsaXN0OiBEYXRlO1xyXG4gIHJlbGVhc2VEYXRlOiBEYXRlO1xyXG4gIGFsYnVtOiBBbGJ1bTtcclxuICBmZWF0dXJlczogRmVhdHVyZXNEYXRhIHwgdW5kZWZpbmVkO1xyXG4gIGltYWdlVXJsOiBzdHJpbmc7XHJcbiAgc2VsRWw6IEVsZW1lbnQ7XHJcbiAgYXJ0aXN0c0RhdGFzOiBBcnJheTxJQXJ0aXN0VHJhY2tEYXRhPlxyXG5cclxuICBwdWJsaWMgZ2V0IGlkICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lkXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRpdGxlICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RpdGxlXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHVyaSAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl91cmlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZGF0ZUFkZGVkVG9QbGF5bGlzdCAoKTogRGF0ZSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdFxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldERhdGVBZGRlZFRvUGxheWxpc3QgKHZhbDogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSkge1xyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKHZhbClcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChwcm9wczogeyB0aXRsZTogc3RyaW5nOyBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+OyBkdXJhdGlvbjogbnVtYmVyOyB1cmk6IHN0cmluZzsgcG9wdWxhcml0eTogc3RyaW5nOyByZWxlYXNlRGF0ZTogc3RyaW5nOyBpZDogc3RyaW5nOyBhbGJ1bTogQWxidW07IGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzOyBhcnRpc3RzOiBBcnJheTx1bmtub3duPjsgaWR4OiBudW1iZXIgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgY29uc3Qge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgaW1hZ2VzLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgICAgdXJpLFxyXG4gICAgICBwb3B1bGFyaXR5LFxyXG4gICAgICByZWxlYXNlRGF0ZSxcclxuICAgICAgaWQsXHJcbiAgICAgIGFsYnVtLFxyXG4gICAgICBleHRlcm5hbFVybHMsXHJcbiAgICAgIGFydGlzdHNcclxuICAgIH0gPSBwcm9wc1xyXG5cclxuICAgIHRoaXMuZXh0ZXJuYWxVcmxzID0gZXh0ZXJuYWxVcmxzXHJcbiAgICB0aGlzLl9pZCA9IGlkXHJcbiAgICB0aGlzLl90aXRsZSA9IHRpdGxlXHJcbiAgICB0aGlzLmFydGlzdHNEYXRhcyA9IHRoaXMuZmlsdGVyRGF0YUZyb21BcnRpc3RzKGFydGlzdHMpXHJcbiAgICB0aGlzLl9kdXJhdGlvbiA9IG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMoZHVyYXRpb24pXHJcbiAgICB0aGlzLl9kYXRlQWRkZWRUb1BsYXlsaXN0ID0gbmV3IERhdGUoKVxyXG5cclxuICAgIC8vIGVpdGhlciB0aGUgbm9ybWFsIHVyaSwgb3IgdGhlIGxpbmtlZF9mcm9tLnVyaVxyXG4gICAgdGhpcy5fdXJpID0gdXJpXHJcbiAgICB0aGlzLnBvcHVsYXJpdHkgPSBwb3B1bGFyaXR5XHJcbiAgICB0aGlzLnJlbGVhc2VEYXRlID0gbmV3IERhdGUocmVsZWFzZURhdGUpXHJcbiAgICB0aGlzLmFsYnVtID0gYWxidW1cclxuICAgIHRoaXMuZmVhdHVyZXMgPSB1bmRlZmluZWRcclxuXHJcbiAgICB0aGlzLmltYWdlVXJsID0gZ2V0VmFsaWRJbWFnZShpbWFnZXMpXHJcbiAgICB0aGlzLnNlbEVsID0gaHRtbFRvRWwoJzw+PC8+JykgYXMgRWxlbWVudFxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaWx0ZXJEYXRhRnJvbUFydGlzdHMgKGFydGlzdHM6IEFycmF5PHVua25vd24+KSB7XHJcbiAgICByZXR1cm4gYXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4gYXJ0aXN0IGFzIElBcnRpc3RUcmFja0RhdGEpXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMgKCkge1xyXG4gICAgbGV0IGFydGlzdE5hbWVzID0gJydcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hcnRpc3RzRGF0YXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgYXJ0aXN0ID0gdGhpcy5hcnRpc3RzRGF0YXNbaV1cclxuICAgICAgYXJ0aXN0TmFtZXMgKz0gYDxhIGhyZWY9XCIke2FydGlzdC5leHRlcm5hbF91cmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcnRpc3QubmFtZX08L2E+YFxyXG5cclxuICAgICAgaWYgKGkgPCB0aGlzLmFydGlzdHNEYXRhcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgYXJ0aXN0TmFtZXMgKz0gJywgJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJ0aXN0TmFtZXNcclxuICB9XHJcblxyXG4gIC8qKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgdHJhY2suXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhY2tDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSkgOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMudHJhY2tQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucmFua0NhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW5cclxuICAgIH0gJHthcHBlYXJDbGFzc31cIj5cclxuICAgICAgICAgICAgICA8aDQgaWQ9XCIke2NvbmZpZy5DU1MuSURzLnJhbmt9XCI+JHtpZHggKyAxfS48L2g0PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0XHJcbiAgICB9ICAke2NvbmZpZy5DU1MuQ0xBU1NFUy5leHBhbmRPbkhvdmVyfVwiPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZElubmVyXHJcbiAgICB9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrfVwiIGlkPVwiJHt0aGlzLmdldENhcmRJZCgpfVwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRGcm9udFxyXG4gICAgICAgICAgICAgICAgICB9XCIgIHRpdGxlPVwiQ2xpY2sgdG8gdmlldyBtb3JlIEluZm9cIj5cclxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZVVybH1cIiBhbHQ9XCJBbGJ1bSBDb3ZlclwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxpbmdUZXh0XHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfTwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkQmFja30+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkR1cmF0aW9uOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+JHt0aGlzLl9kdXJhdGlvbn08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPlJlbGVhc2UgRGF0ZTo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5yZWxlYXNlRGF0ZS50b0RhdGVTdHJpbmcoKX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkFsYnVtIE5hbWU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmFsYnVtLmV4dGVybmFsVXJsfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+JHtcclxuICAgICAgdGhpcy5hbGJ1bS5uYW1lXHJcbiAgICB9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBgXHJcbiAgICByZXR1cm4gaHRtbFRvRWwoaHRtbCkgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldCBhIHRyYWNrIGh0bWwgdG8gYmUgcGxhY2VkIGFzIGEgbGlzdCBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5RGF0ZSAtIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgZGF0ZS5cclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQbGF5bGlzdFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4sIGRpc3BsYXlEYXRlOiBib29sZWFuID0gdHJ1ZSk6IE5vZGUge1xyXG4gICAgLy8gY2FzdCB0cmFja3MgYXMgYW4gSVBsYXlhYmxlIGluIG9yZGVyIHRvIHJlZHVjZSBlcnJvcnMgZHVlIHRvIGV4ZXNzaXZlIGFjY2Vzc2FiaWxpdHkgaWYgbG9nZ2luZyBpdCB3aWxsIGxvZyBhbGwgVHJhY2sgYXR0cmlidXRlcy4gQnV0IGluIGNvZGUgd2UgY2FuIG9ubHkgYWNjZXNzIElQbGF5YWJsZSBhdHRyaWJ1dGVzLlxyXG4gICAgY29uc3QgdHJhY2sgPSB0aGlzIGFzIElQbGF5YWJsZVxyXG4gICAgY29uc3QgdHJhY2tOb2RlID0gdHJhY2tMaXN0LmZpbmQoKHgpID0+IHgudXJpID09PSB0aGlzLnVyaSwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG5cclxuICAgIGZ1bmN0aW9uIHBsYXlQYXVzZUNsaWNrICgpIHtcclxuICAgICAgLy8gc2VsZWN0IHRoaXMgdHJhY2sgdG8gcGxheSBvciBwYXVzZSBieSBwdWJsaXNoaW5nIHRoZSB0cmFjayBwbGF5IGV2ZW50IGFyZ1xyXG4gICAgICBldmVudEFnZ3JlZ2F0b3IucHVibGlzaChuZXcgUGxheWFibGVFdmVudEFyZyh0cmFjaywgdHJhY2tOb2RlKSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFRyYWNrfVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5UGF1c2V9ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiPjxpbWcgc3JjPVwiXCIgYWx0PVwicGxheS9wYXVzZVwiIFxyXG4gICAgICAgICAgICAgIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIiBzcmM9XCIke1xyXG4gICAgICB0aGlzLmltYWdlVXJsXHJcbiAgICB9XCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmxpbmtzfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubmFtZVxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX1cclxuICAgICAgICAgICAgICAgICAgPC9oND5cclxuICAgICAgICAgICAgICAgIDxhLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dGhpcy5nZW5lcmF0ZUhUTUxBcnRpc3ROYW1lcygpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGg1PiR7dGhpcy5fZHVyYXRpb259PC9oNT5cclxuICAgICAgICAgICAgICAke1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheURhdGVcclxuICAgICAgICAgICAgICAgICAgPyBgPGg1PiR7dGhpcy5kYXRlQWRkZWRUb1BsYXlsaXN0LnRvTG9jYWxlRGF0ZVN0cmluZygpfTwvaDU+YFxyXG4gICAgICAgICAgICAgICAgICA6ICcnXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKVxyXG5cclxuICAgIC8vIGdldCBwbGF5IHBhdXNlIGJ1dHRvblxyXG4gICAgY29uc3QgcGxheVBhdXNlQnRuID0gZWw/LmNoaWxkTm9kZXNbMV1cclxuICAgIGlmIChwbGF5UGF1c2VCdG4gPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGF5IHBhdXNlIGJ1dHRvbiBvbiB0cmFjayB3YXMgbm90IGZvdW5kJylcclxuICAgIH1cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudFxyXG4gICAgcGxheVBhdXNlQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHBsYXlQYXVzZUNsaWNrKCkpXHJcblxyXG4gICAgY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlcih0aGlzLnVyaSwgcGxheVBhdXNlQnRuIGFzIEVsZW1lbnQsIHRyYWNrTm9kZSlcclxuXHJcbiAgICByZXR1cm4gZWwgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldCBhIHRyYWNrIGh0bWwgdG8gYmUgcGxhY2VkIGFzIGEgbGlzdCBlbGVtZW50IG9uIGEgcmFua2VkIGxpc3QuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSYW5rZWRUcmFja0h0bWwgKHJhbms6IG51bWJlcik6IE5vZGUge1xyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RUcmFja31cIj5cclxuICAgICAgICAgICAgICA8cD4ke3Jhbmt9LjwvcD5cclxuICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCIgc3JjPVwiJHtcclxuICAgICAgdGhpcy5pbWFnZVVybFxyXG4gICAgfVwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5saW5rc31cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3RoaXMuZXh0ZXJuYWxVcmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5hbWVcclxuICAgIH1cIj4ke3RoaXMudGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8YS8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlxyXG4gICAgICAgICAgICAgICAgICAke3RoaXMuZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgIGBcclxuXHJcbiAgICByZXR1cm4gaHRtbFRvRWwoaHRtbCkgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqIExvYWQgdGhlIGZlYXR1cmVzIG9mIHRoaXMgdHJhY2sgZnJvbSB0aGUgc3BvdGlmeSB3ZWIgYXBpLiAqL1xyXG4gIHB1YmxpYyBhc3luYyBsb2FkRmVhdHVyZXMgKCkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3NcclxuICAgICAgLmdldChjb25maWcuVVJMcy5nZXRUcmFja0ZlYXR1cmVzICsgdGhpcy5pZClcclxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICB0aHJvdyBlcnJcclxuICAgICAgfSlcclxuICAgIGNvbnN0IGZlYXRzID0gcmVzLmRhdGEuYXVkaW9fZmVhdHVyZXNcclxuICAgIHRoaXMuZmVhdHVyZXMgPSB7XHJcbiAgICAgIGRhbmNlYWJpbGl0eTogZmVhdHMuZGFuY2VhYmlsaXR5LFxyXG4gICAgICBhY291c3RpY25lc3M6IGZlYXRzLmFjb3VzdGljbmVzcyxcclxuICAgICAgaW5zdHJ1bWVudGFsbmVzczogZmVhdHMuaW5zdHJ1bWVudGFsbmVzcyxcclxuICAgICAgdmFsZW5jZTogZmVhdHMudmFsZW5jZSxcclxuICAgICAgZW5lcmd5OiBmZWF0cy5lbmVyZ3lcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5mZWF0dXJlc1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEdlbmVyYXRlIHRyYWNrcyBmcm9tIGRhdGEgZXhjbHVkaW5nIGRhdGUgYWRkZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXk8VHJhY2tEYXRhPn0gZGF0YXNcclxuICogQHBhcmFtIHtEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IEFycmF5PFRyYWNrPn0gdHJhY2tzIC0gZG91YmxlIGxpbmtlZCBsaXN0XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSAoZGF0YXM6IEFycmF5PFRyYWNrRGF0YT4sIHRyYWNrczogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBBcnJheTxUcmFjaz4pIHtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGFzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBkYXRhID0gZGF0YXNbaV1cclxuICAgIGlmIChkYXRhKSB7XHJcbiAgICAgIGNvbnN0IHByb3BzID0ge1xyXG4gICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgaW1hZ2VzOiBkYXRhLmFsYnVtLmltYWdlcyxcclxuICAgICAgICBkdXJhdGlvbjogZGF0YS5kdXJhdGlvbl9tcyxcclxuICAgICAgICB1cmk6IGRhdGEubGlua2VkX2Zyb20gIT09IHVuZGVmaW5lZCA/IGRhdGEubGlua2VkX2Zyb20udXJpIDogZGF0YS51cmksXHJcbiAgICAgICAgcG9wdWxhcml0eTogZGF0YS5wb3B1bGFyaXR5LFxyXG4gICAgICAgIHJlbGVhc2VEYXRlOiBkYXRhLmFsYnVtLnJlbGVhc2VfZGF0ZSxcclxuICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICBhbGJ1bTogbmV3IEFsYnVtKGRhdGEuYWxidW0ubmFtZSwgZGF0YS5hbGJ1bS5leHRlcm5hbF91cmxzLnNwb3RpZnkpLFxyXG4gICAgICAgIGV4dGVybmFsVXJsczogZGF0YS5leHRlcm5hbF91cmxzLFxyXG4gICAgICAgIGFydGlzdHM6IGRhdGEuYXJ0aXN0cyxcclxuICAgICAgICBpZHg6IGlcclxuICAgICAgfVxyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0cmFja3MpKSB7XHJcbiAgICAgICAgdHJhY2tzLnB1c2gobmV3IFRyYWNrKHByb3BzKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0cmFja3MuYWRkKG5ldyBUcmFjayhwcm9wcykpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHRyYWNrc1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmFja1xyXG4iLCJcclxuaW1wb3J0IGludGVyYWN0IGZyb20gJ2ludGVyYWN0anMnXHJcbmltcG9ydCBJbnRlcmFjdCBmcm9tICdAaW50ZXJhY3Rqcy90eXBlcydcclxuaW1wb3J0IHsgSVByb21pc2VIYW5kbGVyUmV0dXJuLCBTcG90aWZ5SW1nIH0gZnJvbSAnLi90eXBlcydcclxuXHJcbmNvbnN0IGF1dGhFbmRwb2ludCA9ICdodHRwczovL2FjY291bnRzLnNwb3RpZnkuY29tL2F1dGhvcml6ZSdcclxuLy8gUmVwbGFjZSB3aXRoIHlvdXIgYXBwJ3MgY2xpZW50IElELCByZWRpcmVjdCBVUkkgYW5kIGRlc2lyZWQgc2NvcGVzXHJcbmNvbnN0IHJlZGlyZWN0VXJpID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCdcclxuY29uc3QgY2xpZW50SWQgPSAnNDM0ZjVlOWY0NDJhNGU0NTg2ZTA4OWEzM2Y2NWM4NTcnXHJcbmNvbnN0IHNjb3BlcyA9IFtcclxuICAndWdjLWltYWdlLXVwbG9hZCcsXHJcbiAgJ3VzZXItcmVhZC1wbGF5YmFjay1zdGF0ZScsXHJcbiAgJ3VzZXItbW9kaWZ5LXBsYXliYWNrLXN0YXRlJyxcclxuICAndXNlci1yZWFkLWN1cnJlbnRseS1wbGF5aW5nJyxcclxuICAnc3RyZWFtaW5nJyxcclxuICAnYXBwLXJlbW90ZS1jb250cm9sJyxcclxuICAndXNlci1yZWFkLWVtYWlsJyxcclxuICAndXNlci1yZWFkLXByaXZhdGUnLFxyXG4gICdwbGF5bGlzdC1yZWFkLWNvbGxhYm9yYXRpdmUnLFxyXG4gICdwbGF5bGlzdC1tb2RpZnktcHVibGljJyxcclxuICAncGxheWxpc3QtcmVhZC1wcml2YXRlJyxcclxuICAncGxheWxpc3QtbW9kaWZ5LXByaXZhdGUnLFxyXG4gICd1c2VyLWxpYnJhcnktbW9kaWZ5JyxcclxuICAndXNlci1saWJyYXJ5LXJlYWQnLFxyXG4gICd1c2VyLXRvcC1yZWFkJyxcclxuICAndXNlci1yZWFkLXBsYXliYWNrLXBvc2l0aW9uJyxcclxuICAndXNlci1yZWFkLXJlY2VudGx5LXBsYXllZCcsXHJcbiAgJ3VzZXItZm9sbG93LXJlYWQnLFxyXG4gICd1c2VyLWZvbGxvdy1tb2RpZnknXHJcbl1cclxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcclxuICBDU1M6IHtcclxuICAgIElEczoge1xyXG4gICAgICByZW1vdmVFYXJseUFkZGVkOiAncmVtb3ZlLWVhcmx5LWFkZGVkJyxcclxuICAgICAgZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lcjogJ2dldC10b2tlbi1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBwbGF5bGlzdENhcmRzQ29udGFpbmVyOiAncGxheWxpc3QtY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgdHJhY2tDYXJkc0NvbnRhaW5lcjogJ3RyYWNrLWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIHBsYXlsaXN0UHJlZml4OiAncGxheWxpc3QtJyxcclxuICAgICAgdHJhY2tQcmVmaXg6ICd0cmFjay0nLFxyXG4gICAgICBzcG90aWZ5Q29udGFpbmVyOiAnc3BvdGlmeS1jb250YWluZXInLFxyXG4gICAgICBpbmZvQ29udGFpbmVyOiAnaW5mby1jb250YWluZXInLFxyXG4gICAgICBhbGxvd0FjY2Vzc0hlYWRlcjogJ2FsbG93LWFjY2Vzcy1oZWFkZXInLFxyXG4gICAgICBleHBhbmRlZFBsYXlsaXN0TW9kczogJ2V4cGFuZGVkLXBsYXlsaXN0LW1vZHMnLFxyXG4gICAgICBwbGF5bGlzdE1vZHM6ICdwbGF5bGlzdC1tb2RzJyxcclxuICAgICAgdHJhY2tzRGF0YTogJ3RyYWNrcy1kYXRhJyxcclxuICAgICAgdHJhY2tzQ2hhcnQ6ICd0cmFja3MtY2hhcnQnLFxyXG4gICAgICB0cmFja3NUZXJtU2VsZWN0aW9uczogJ3RyYWNrcy10ZXJtLXNlbGVjdGlvbnMnLFxyXG4gICAgICBmZWF0dXJlU2VsZWN0aW9uczogJ2ZlYXR1cmUtc2VsZWN0aW9ucycsXHJcbiAgICAgIHBsYXlsaXN0c1NlY3Rpb246ICdwbGF5bGlzdHMtc2VjdGlvbicsXHJcbiAgICAgIHVuZG86ICd1bmRvJyxcclxuICAgICAgcmVkbzogJ3JlZG8nLFxyXG4gICAgICBtb2RzT3BlbmVyOiAnbW9kcy1vcGVuZXInLFxyXG4gICAgICBmZWF0RGVmOiAnZmVhdC1kZWZpbml0aW9uJyxcclxuICAgICAgZmVhdEF2ZXJhZ2U6ICdmZWF0LWF2ZXJhZ2UnLFxyXG4gICAgICByYW5rOiAncmFuaycsXHJcbiAgICAgIHZpZXdBbGxUb3BUcmFja3M6ICd2aWV3LWFsbC10b3AtdHJhY2tzJyxcclxuICAgICAgZW1vamlzOiAnZW1vamlzJyxcclxuICAgICAgYXJ0aXN0Q2FyZHNDb250YWluZXI6ICdhcnRpc3QtY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgYXJ0aXN0UHJlZml4OiAnYXJ0aXN0LScsXHJcbiAgICAgIGluaXRpYWxDYXJkOiAnaW5pdGlhbC1jYXJkJyxcclxuICAgICAgY29udmVydENhcmQ6ICdjb252ZXJ0LWNhcmQnLFxyXG4gICAgICBhcnRpc3RUZXJtU2VsZWN0aW9uczogJ2FydGlzdHMtdGVybS1zZWxlY3Rpb25zJyxcclxuICAgICAgcHJvZmlsZUhlYWRlcjogJ3Byb2ZpbGUtaGVhZGVyJyxcclxuICAgICAgY2xlYXJEYXRhOiAnY2xlYXItZGF0YScsXHJcbiAgICAgIGxpa2VkVHJhY2tzOiAnbGlrZWQtdHJhY2tzJyxcclxuICAgICAgZm9sbG93ZWRBcnRpc3RzOiAnZm9sbG93ZWQtYXJ0aXN0cycsXHJcbiAgICAgIHdlYlBsYXllcjogJ3dlYi1wbGF5ZXInLFxyXG4gICAgICBwbGF5VGltZUJhcjogJ3BsYXl0aW1lLWJhcicsXHJcbiAgICAgIHBsYXlsaXN0SGVhZGVyQXJlYTogJ3BsYXlsaXN0LW1haW4taGVhZGVyLWFyZWEnLFxyXG4gICAgICBwbGF5TmV4dDogJ3BsYXktbmV4dCcsXHJcbiAgICAgIHBsYXlQcmV2OiAncGxheS1wcmV2J1xyXG4gICAgfSxcclxuICAgIENMQVNTRVM6IHtcclxuICAgICAgZ2xvdzogJ2dsb3cnLFxyXG4gICAgICBwbGF5bGlzdDogJ3BsYXlsaXN0JyxcclxuICAgICAgdHJhY2s6ICd0cmFjaycsXHJcbiAgICAgIGFydGlzdDogJ2FydGlzdCcsXHJcbiAgICAgIHJhbmtDYXJkOiAncmFuay1jYXJkJyxcclxuICAgICAgcGxheWxpc3RUcmFjazogJ3BsYXlsaXN0LXRyYWNrJyxcclxuICAgICAgaW5mb0xvYWRpbmdTcGlubmVyczogJ2luZm8tbG9hZGluZy1zcGlubmVyJyxcclxuICAgICAgYXBwZWFyOiAnYXBwZWFyJyxcclxuICAgICAgaGlkZTogJ2hpZGUnLFxyXG4gICAgICBzZWxlY3RlZDogJ3NlbGVjdGVkJyxcclxuICAgICAgY2FyZDogJ2NhcmQnLFxyXG4gICAgICBwbGF5bGlzdFNlYXJjaDogJ3BsYXlsaXN0LXNlYXJjaCcsXHJcbiAgICAgIGVsbGlwc2lzV3JhcDogJ2VsbGlwc2lzLXdyYXAnLFxyXG4gICAgICBuYW1lOiAnbmFtZScsXHJcbiAgICAgIHBsYXlsaXN0T3JkZXI6ICdwbGF5bGlzdC1vcmRlcicsXHJcbiAgICAgIGNoYXJ0SW5mbzogJ2NoYXJ0LWluZm8nLFxyXG4gICAgICBmbGlwQ2FyZElubmVyOiAnZmxpcC1jYXJkLWlubmVyJyxcclxuICAgICAgZmxpcENhcmRGcm9udDogJ2ZsaXAtY2FyZC1mcm9udCcsXHJcbiAgICAgIGZsaXBDYXJkQmFjazogJ2ZsaXAtY2FyZC1iYWNrJyxcclxuICAgICAgZmxpcENhcmQ6ICdmbGlwLWNhcmQnLFxyXG4gICAgICByZXNpemVDb250YWluZXI6ICdyZXNpemUtY29udGFpbmVyJyxcclxuICAgICAgc2Nyb2xsTGVmdDogJ3Njcm9sbC1sZWZ0JyxcclxuICAgICAgc2Nyb2xsaW5nVGV4dDogJ3Njcm9sbGluZy10ZXh0JyxcclxuICAgICAgbm9TZWxlY3Q6ICduby1zZWxlY3QnLFxyXG4gICAgICBkcm9wRG93bjogJ2Ryb3AtZG93bicsXHJcbiAgICAgIGV4cGFuZGFibGVUeHRDb250YWluZXI6ICdleHBhbmRhYmxlLXRleHQtY29udGFpbmVyJyxcclxuICAgICAgYm9yZGVyQ292ZXI6ICdib3JkZXItY292ZXInLFxyXG4gICAgICBmaXJzdEV4cGFuc2lvbjogJ2ZpcnN0LWV4cGFuc2lvbicsXHJcbiAgICAgIHNlY29uZEV4cGFuc2lvbjogJ3NlY29uZC1leHBhbnNpb24nLFxyXG4gICAgICBpbnZpc2libGU6ICdpbnZpc2libGUnLFxyXG4gICAgICBmYWRlSW46ICdmYWRlLWluJyxcclxuICAgICAgZnJvbVRvcDogJ2Zyb20tdG9wJyxcclxuICAgICAgZXhwYW5kT25Ib3ZlcjogJ2V4cGFuZC1vbi1ob3ZlcicsXHJcbiAgICAgIHRyYWNrc0FyZWE6ICd0cmFja3MtYXJlYScsXHJcbiAgICAgIHNjcm9sbEJhcjogJ3Njcm9sbC1iYXInLFxyXG4gICAgICB0cmFja0xpc3Q6ICd0cmFjay1saXN0JyxcclxuICAgICAgYXJ0aXN0VG9wVHJhY2tzOiAnYXJ0aXN0LXRvcC10cmFja3MnLFxyXG4gICAgICB0ZXh0Rm9ybTogJ3RleHQtZm9ybScsXHJcbiAgICAgIGNvbnRlbnQ6ICdjb250ZW50JyxcclxuICAgICAgbGlua3M6ICdsaW5rcycsXHJcbiAgICAgIHByb2dyZXNzOiAncHJvZ3Jlc3MnLFxyXG4gICAgICBwcm9ncmVzc0JhcjogJ3Byb2dyZXNzLWJhcicsXHJcbiAgICAgIHBsYXlQYXVzZTogJ3BsYXktcGF1c2UnXHJcbiAgICB9LFxyXG4gICAgQVRUUklCVVRFUzoge1xyXG4gICAgICBkYXRhU2VsZWN0aW9uOiAnZGF0YS1zZWxlY3Rpb24nXHJcbiAgICB9XHJcbiAgfSxcclxuICBVUkxzOiB7XHJcbiAgICBzaXRlVXJsOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgIGF1dGg6IGAke2F1dGhFbmRwb2ludH0/Y2xpZW50X2lkPSR7Y2xpZW50SWR9JnJlZGlyZWN0X3VyaT0ke3JlZGlyZWN0VXJpfSZzY29wZT0ke3Njb3Blcy5qb2luKFxyXG4gICAgICAnJTIwJ1xyXG4gICAgKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNob3dfZGlhbG9nPXRydWVgLFxyXG4gICAgZ2V0SGFzVG9rZW5zOiAnL3Rva2Vucy9oYXMtdG9rZW5zJyxcclxuICAgIGdldEFjY2Vzc1Rva2VuOiAnL3Rva2Vucy9nZXQtYWNjZXNzLXRva2VuJyxcclxuICAgIGdldE9idGFpblRva2Vuc1ByZWZpeDogKGNvZGU6IHN0cmluZykgPT4gYC90b2tlbnMvb2J0YWluLXRva2Vucz9jb2RlPSR7Y29kZX1gLFxyXG4gICAgZ2V0VG9wQXJ0aXN0czogJy9zcG90aWZ5L2dldC10b3AtYXJ0aXN0cz90aW1lX3JhbmdlPScsXHJcbiAgICBnZXRUb3BUcmFja3M6ICcvc3BvdGlmeS9nZXQtdG9wLXRyYWNrcz90aW1lX3JhbmdlPScsXHJcbiAgICBnZXRQbGF5bGlzdHM6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3RzJyxcclxuICAgIGdldFBsYXlsaXN0VHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0LXRyYWNrcz9wbGF5bGlzdF9pZD0nLFxyXG4gICAgcHV0Q2xlYXJUb2tlbnM6ICcvdG9rZW5zL2NsZWFyLXRva2VucycsXHJcbiAgICBkZWxldGVQbGF5bGlzdFRyYWNrczogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L2RlbGV0ZS1wbGF5bGlzdC1pdGVtcz9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIHBvc3RQbGF5bGlzdFRyYWNrczogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtcGxheWxpc3QtaXRlbXM/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBnZXRUcmFja0ZlYXR1cmVzOiAnL3Nwb3RpZnkvZ2V0LXRyYWNrcy1mZWF0dXJlcz90cmFja19pZHM9JyxcclxuICAgIHB1dFJlZnJlc2hBY2Nlc3NUb2tlbjogJy90b2tlbnMvcmVmcmVzaC10b2tlbicsXHJcbiAgICBwdXRTZXNzaW9uRGF0YTogJy9zcG90aWZ5L3B1dC1zZXNzaW9uLWRhdGE/YXR0cj0nLFxyXG4gICAgcHV0UGxheWxpc3RSZXNpemVEYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wdXQtcGxheWxpc3QtcmVzaXplLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5bGlzdFJlc2l6ZURhdGE6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3QtcmVzaXplLWRhdGEnLFxyXG4gICAgcHV0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wdXQtcGxheWxpc3QtdGV4dC1mb3JtLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGE6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3QtdGV4dC1mb3JtLWRhdGEnLFxyXG4gICAgZ2V0QXJ0aXN0VG9wVHJhY2tzOiAoaWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L2dldC1hcnRpc3QtdG9wLXRyYWNrcz9pZD0ke2lkfWAsXHJcbiAgICBnZXRDdXJyZW50VXNlclByb2ZpbGU6ICcvc3BvdGlmeS9nZXQtY3VycmVudC11c2VyLXByb2ZpbGUnLFxyXG4gICAgcHV0Q2xlYXJTZXNzaW9uOiAnL2NsZWFyLXNlc3Npb24nLFxyXG4gICAgZ2V0Q3VycmVudFVzZXJTYXZlZFRyYWNrczogJy9zcG90aWZ5L2dldC1jdXJyZW50LXVzZXItc2F2ZWQtdHJhY2tzJyxcclxuICAgIGdldEZvbGxvd2VkQXJ0aXN0czogJy9zcG90aWZ5L2dldC1mb2xsb3dlZC1hcnRpc3RzJyxcclxuICAgIHB1dFBsYXlUcmFjazogKGRldmljZV9pZDogc3RyaW5nLCB0cmFja191cmk6IHN0cmluZykgPT5cclxuICAgICAgYC9zcG90aWZ5L3BsYXktdHJhY2s/ZGV2aWNlX2lkPSR7ZGV2aWNlX2lkfSZ0cmFja191cmk9JHt0cmFja191cml9YFxyXG4gIH0sXHJcbiAgUEFUSFM6IHtcclxuICAgIHNwaW5uZXI6ICcvaW1hZ2VzLzIwMHB4TG9hZGluZ1NwaW5uZXIuc3ZnJyxcclxuICAgIGFjb3VzdGljRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9BY291c3RpY0Vtb2ppLnN2ZycsXHJcbiAgICBub25BY291c3RpY0Vtb2ppOiAnL2ltYWdlcy9FbW9qaXMvRWxlY3RyaWNHdWl0YXJFbW9qaS5zdmcnLFxyXG4gICAgaGFwcHlFbW9qaTogJy9pbWFnZXMvRW1vamlzL0hhcHB5RW1vamkuc3ZnJyxcclxuICAgIG5ldXRyYWxFbW9qaTogJy9pbWFnZXMvRW1vamlzL05ldXRyYWxFbW9qaS5zdmcnLFxyXG4gICAgc2FkRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9TYWRFbW9qaS5zdmcnLFxyXG4gICAgaW5zdHJ1bWVudEVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvSW5zdHJ1bWVudEVtb2ppLnN2ZycsXHJcbiAgICBzaW5nZXJFbW9qaTogJy9pbWFnZXMvRW1vamlzL1NpbmdlckVtb2ppLnN2ZycsXHJcbiAgICBkYW5jaW5nRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9EYW5jaW5nRW1vamkuc3ZnJyxcclxuICAgIHNoZWVwRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9TaGVlcEVtb2ppLnN2ZycsXHJcbiAgICB3b2xmRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9Xb2xmRW1vamkuc3ZnJyxcclxuICAgIGdyaWRWaWV3OiAnL2ltYWdlcy9ncmlkLXZpZXctaWNvbi5wbmcnLFxyXG4gICAgbGlzdFZpZXc6ICcvaW1hZ2VzL2xpc3Qtdmlldy1pY29uLnBuZycsXHJcbiAgICBjaGV2cm9uTGVmdDogJy9pbWFnZXMvY2hldnJvbi1sZWZ0LnBuZycsXHJcbiAgICBjaGV2cm9uUmlnaHQ6ICcvaW1hZ2VzL2NoZXZyb24tcmlnaHQucG5nJyxcclxuICAgIHBsYXlJY29uOiAnL2ltYWdlcy9wbGF5LTMwcHgucG5nJyxcclxuICAgIHBhdXNlSWNvbjogJy9pbWFnZXMvcGF1c2UtMzBweC5wbmcnLFxyXG4gICAgcGxheU5leHQ6ICcvaW1hZ2VzL25leHQtMzBweC5wbmcnLFxyXG4gICAgcGxheVByZXY6ICcvaW1hZ2VzL3ByZXZpb3VzLTMwcHgucG5nJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMgKG1pbGxpczogbnVtYmVyKSB7XHJcbiAgY29uc3QgbWludXRlczogbnVtYmVyID0gTWF0aC5mbG9vcihtaWxsaXMgLyA2MDAwMClcclxuICBjb25zdCBzZWNvbmRzOiBudW1iZXIgPSBwYXJzZUludCgoKG1pbGxpcyAlIDYwMDAwKSAvIDEwMDApLnRvRml4ZWQoMCkpXHJcbiAgcmV0dXJuIHNlY29uZHMgPT09IDYwXHJcbiAgICA/IG1pbnV0ZXMgKyAxICsgJzowMCdcclxuICAgIDogbWludXRlcyArICc6JyArIChzZWNvbmRzIDwgMTAgPyAnMCcgOiAnJykgKyBzZWNvbmRzXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGh0bWxUb0VsIChodG1sOiBzdHJpbmcpIHtcclxuICBjb25zdCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKVxyXG4gIGh0bWwgPSBodG1sLnRyaW0oKSAvLyBOZXZlciByZXR1cm4gYSBzcGFjZSB0ZXh0IG5vZGUgYXMgYSByZXN1bHRcclxuICB0ZW1wLmlubmVySFRNTCA9IGh0bWxcclxuICByZXR1cm4gdGVtcC5jb250ZW50LmZpcnN0Q2hpbGRcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21pc2VIYW5kbGVyPFQ+IChcclxuICBwcm9taXNlOiBQcm9taXNlPFQ+LFxyXG4gIG9uU3VjY2VzZnVsID0gKHJlczogVCkgPT4geyB9LFxyXG4gIG9uRmFpbHVyZSA9IChlcnI6IHVua25vd24pID0+IHtcclxuICAgIGlmIChlcnIpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKClcclxuICAgIH1cclxuICB9XHJcbikge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBwcm9taXNlXHJcbiAgICBvblN1Y2Nlc2Z1bChyZXMgYXMgVClcclxuICAgIHJldHVybiB7IHJlczogcmVzLCBlcnI6IG51bGwgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxyXG4gICAgb25GYWlsdXJlKGVycilcclxuICAgIHJldHVybiB7IHJlczogbnVsbCwgZXJyOiBlcnIgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9XHJcbn1cclxuXHJcbi8qKiBGaWx0ZXJzICdsaScgZWxlbWVudHMgdG8gZWl0aGVyIGJlIGhpZGRlbiBvciBub3QgZGVwZW5kaW5nIG9uIGlmXHJcbiAqIHRoZXkgY29udGFpbiBzb21lIGdpdmVuIGlucHV0IHRleHQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7SFRNTH0gdWwgLSB1bm9yZGVyZWQgbGlzdCBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlICdsaScgdG8gYmUgZmlsdGVyZWRcclxuICogQHBhcmFtIHtIVE1MfSBpbnB1dCAtIGlucHV0IGVsZW1lbnQgd2hvc2UgdmFsdWUgd2lsbCBiZSB1c2VkIHRvIGZpbHRlclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RkRGlzcGxheSAtIHRoZSBzdGFuZGFyZCBkaXNwbGF5IHRoZSAnbGknIHNob3VsZCBoYXZlIHdoZW4gbm90ICdub25lJ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFVsICh1bDogSFRNTFVMaXN0RWxlbWVudCwgaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQsIHN0ZERpc3BsYXk6IHN0cmluZyA9ICdmbGV4Jyk6IHZvaWQge1xyXG4gIGNvbnN0IGxpRWxzID0gdWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJylcclxuICBjb25zdCBmaWx0ZXIgPSBpbnB1dC52YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGlFbHMubGVuZ3RoOyBpKyspIHtcclxuICAgIC8vIGdldCB0aGUgbmFtZSBjaGlsZCBlbCBpbiB0aGUgbGkgZWxcclxuICAgIGNvbnN0IG5hbWUgPSBsaUVsc1tpXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lKVswXVxyXG4gICAgY29uc3QgbmFtZVR4dCA9IG5hbWUudGV4dENvbnRlbnQgfHwgbmFtZS5pbm5lckhUTUxcclxuXHJcbiAgICBpZiAobmFtZVR4dCAmJiBuYW1lVHh0LnRvVXBwZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXIpID4gLTEpIHtcclxuICAgICAgLy8gc2hvdyBsaSdzIHdob3NlIG5hbWUgY29udGFpbnMgdGhlIHRoZSBlbnRlcmVkIHN0cmluZ1xyXG4gICAgICBsaUVsc1tpXS5zdHlsZS5kaXNwbGF5ID0gc3RkRGlzcGxheVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gb3RoZXJ3aXNlIGhpZGUgaXRcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFVzZXMgY2FudmFzLm1lYXN1cmVUZXh0IHRvIGNvbXB1dGUgYW5kIHJldHVybiB0aGUgd2lkdGggb2YgdGhlIGdpdmVuIHRleHQgb2YgZ2l2ZW4gZm9udCBpbiBwaXhlbHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IHRvIGJlIHJlbmRlcmVkLlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZm9udCBUaGUgY3NzIGZvbnQgZGVzY3JpcHRvciB0aGF0IHRleHQgaXMgdG8gYmUgcmVuZGVyZWQgd2l0aCAoZS5nLiBcImJvbGQgMTRweCB2ZXJkYW5hXCIpLlxyXG4gKlxyXG4gKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExODI0MS9jYWxjdWxhdGUtdGV4dC13aWR0aC13aXRoLWphdmFzY3JpcHQvMjEwMTUzOTMjMjEwMTUzOTNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXh0V2lkdGggKHRleHQ6IHN0cmluZywgZm9udDogc3RyaW5nKSB7XHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuICBsZXQgbWV0cmljczogVGV4dE1ldHJpY3NcclxuICBpZiAoY29udGV4dCkge1xyXG4gICAgY29udGV4dC5mb250ID0gZm9udFxyXG4gICAgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQodGV4dClcclxuICAgIHJldHVybiBtZXRyaWNzLndpZHRoXHJcbiAgfVxyXG5cclxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbnRleHQgb24gY3JlYXRlZCBjYW52YXMgd2FzIGZvdW5kJylcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRWxsaXBzaXNBY3RpdmUgKGVsOiBIVE1MRWxlbWVudCkge1xyXG4gIHJldHVybiBlbC5vZmZzZXRXaWR0aCA8IGVsLnNjcm9sbFdpZHRoXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYXBpdGFsaXplRmlyc3RMZXR0ZXIgKHN0cmluZzogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsaWRJbWFnZSAoaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPiwgaWR4ID0gMCkge1xyXG4gIC8vIG9idGFpbiB0aGUgY29ycmVjdCBpbWFnZVxyXG4gIGlmIChpbWFnZXMubGVuZ3RoID4gaWR4KSB7XHJcbiAgICBjb25zdCBpbWcgPSBpbWFnZXNbaWR4XVxyXG4gICAgcmV0dXJuIGltZy51cmxcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuICcnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQWxsQ2hpbGROb2RlcyAocGFyZW50OiBOb2RlKSB7XHJcbiAgd2hpbGUgKHBhcmVudC5maXJzdENoaWxkKSB7XHJcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50LmZpcnN0Q2hpbGQpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYW5pbWF0aW9uQ29udHJvbCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgLyoqIEFkZHMgYSBjbGFzcyB0byBlYWNoIGVsZW1lbnQgY2F1c2luZyBhIHRyYW5zaXRpb24gdG8gdGhlIGNoYW5nZWQgY3NzIHZhbHVlcy5cclxuICAgKiBUaGlzIGlzIGRvbmUgb24gc2V0IGludGVydmFscy5cclxuICAgKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGVsZW1lbnRzVG9BbmltYXRlIC0gY29tbWEgc2VwYXJhdGVkIHN0cmluZyBjb250YWluaW5nIHRoZSBjbGFzc2VzIG9yIGlkcyBvZiBlbGVtZW50cyB0byBhbmltYXRlIGluY2x1ZGluZyBwcmVmaXggY2hhci5cclxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NUb1RyYW5zaXRpb25Ub28gLSBUaGUgY2xhc3MgdGhhdCBhbGwgdGhlIHRyYW5zaXRpb25pbmcgZWxlbWVudHMgd2lsbCBhZGRcclxuICAgKiBAcGFyYW0ge051bWJlcn0gYW5pbWF0aW9uSW50ZXJ2YWwgLSBUaGUgaW50ZXJ2YWwgdG8gd2FpdCBiZXR3ZWVuIGFuaW1hdGlvbiBvZiBlbGVtZW50c1xyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGludGVydmFsRWxlbWVudHNUcmFuc2l0aW9ucyAoXHJcbiAgICBlbGVtZW50c1RvQW5pbWF0ZTogc3RyaW5nLFxyXG4gICAgY2xhc3NUb1RyYW5zaXRpb25Ub286IHN0cmluZyxcclxuICAgIGFuaW1hdGlvbkludGVydmFsOiBudW1iZXJcclxuICApIHtcclxuICAgIC8vIGFyciBvZiBodG1sIHNlbGVjdG9ycyB0aGF0IHBvaW50IHRvIGVsZW1lbnRzIHRvIGFuaW1hdGVcclxuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBlbGVtZW50c1RvQW5pbWF0ZS5zcGxpdCgnLCcpXHJcblxyXG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyKSA9PiB7XHJcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChhdHRyKVxyXG4gICAgICBsZXQgaWR4ID0gMFxyXG4gICAgICAvLyBpbiBpbnRlcnZhbHMgcGxheSB0aGVpciBpbml0aWFsIGFuaW1hdGlvbnNcclxuICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKGlkeCA9PT0gZWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50c1tpZHhdXHJcbiAgICAgICAgLy8gYWRkIHRoZSBjbGFzcyB0byB0aGUgZWxlbWVudHMgY2xhc3NlcyBpbiBvcmRlciB0byBydW4gdGhlIHRyYW5zaXRpb25cclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NUb1RyYW5zaXRpb25Ub28pXHJcbiAgICAgICAgaWR4ICs9IDFcclxuICAgICAgfSwgYW5pbWF0aW9uSW50ZXJ2YWwpXHJcbiAgICB9KVxyXG4gIH1cclxuICAvKiogQW5pbWF0ZXMgYWxsIGVsZW1lbnRzIHRoYXQgY29udGFpbiBhIGNlcnRhaW4gY2xhc3Mgb3IgaWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBJTkNMVURJTkcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzVG9BZGQgLSBjbGFzcyB0byBhZGQgRVhDTFVESU5HIHRoZSBwcmVmaXggY2hhci5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYW5pbWF0aW9uSW50ZXJ2YWwgLSB0aGUgaW50ZXJ2YWwgdG8gYW5pbWF0ZSB0aGUgZ2l2ZW4gZWxlbWVudHMgaW4gbWlsbGlzZWNvbmRzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFuaW1hdGVBdHRyaWJ1dGVzIChlbGVtZW50c1RvQW5pbWF0ZTogc3RyaW5nLCBjbGFzc1RvQWRkOiBzdHJpbmcsIGFuaW1hdGlvbkludGVydmFsOiBudW1iZXIpIHtcclxuICAgIGludGVydmFsRWxlbWVudHNUcmFuc2l0aW9ucyhcclxuICAgICAgZWxlbWVudHNUb0FuaW1hdGUsXHJcbiAgICAgIGNsYXNzVG9BZGQsXHJcbiAgICAgIGFuaW1hdGlvbkludGVydmFsXHJcbiAgICApXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBhbmltYXRlQXR0cmlidXRlc1xyXG4gIH1cclxufSkoKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBpeGVsUG9zSW5FbE9uQ2xpY2sgKG1vdXNlRXZ0OiBNb3VzZUV2ZW50KTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHtcclxuICBjb25zdCByZWN0ID0gKG1vdXNlRXZ0LnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICBjb25zdCB4ID0gbW91c2VFdnQuY2xpZW50WCAtIHJlY3QubGVmdCAvLyB4IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICBjb25zdCB5ID0gbW91c2VFdnQuY2xpZW50WSAtIHJlY3QudG9wIC8vIHkgcG9zaXRpb24gd2l0aGluIHRoZSBlbGVtZW50LlxyXG4gIHJldHVybiB7IHgsIHkgfVxyXG59XHJcbmZ1bmN0aW9uIGRyYWdNb3ZlTGlzdGVuZXIgKGV2dDogSW50ZXJhY3QuSW50ZXJhY3RFdmVudCkge1xyXG4gIGNvbnN0IHRhcmdldCA9IGV2dC50YXJnZXRcclxuICAvLyBrZWVwIHRoZSBkcmFnZ2VkIHBvc2l0aW9uIGluIHRoZSBkYXRhLXgvZGF0YS15IGF0dHJpYnV0ZXNcclxuICBpZiAodGFyZ2V0ID09PSBudWxsKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludGVyYWN0anMgRXZlbnQgZG9lcyBub3QgY29udGFpbiB0YXJnZXQnKVxyXG4gIH1cclxuICBsZXQgeCA9IDBcclxuICBsZXQgeSA9IDBcclxuXHJcbiAgY29uc3QgZGF0YVggPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKVxyXG4gIGNvbnN0IGRhdGFZID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JylcclxuXHJcbiAgaWYgKHR5cGVvZiBkYXRhWCA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGRhdGFZID09PSAnc3RyaW5nJykge1xyXG4gICAgeCA9IHBhcnNlRmxvYXQoZGF0YVgpICsgZXZ0LmR4XHJcbiAgICB5ID0gcGFyc2VGbG9hdChkYXRhWSkgKyBldnQuZHlcclxuICB9IGVsc2Uge1xyXG4gICAgeCArPSBldnQuZHhcclxuICAgIHkgKz0gZXZ0LmR5XHJcbiAgfVxyXG5cclxuICAvLyB0cmFuc2xhdGUgdGhlIGVsZW1lbnRcclxuICB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgeCArICdweCwgJyArIHkgKyAncHgpJ1xyXG5cclxuICAvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xyXG4gIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgudG9TdHJpbmcoKSlcclxuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5LnRvU3RyaW5nKCkpXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlc2l6ZURyYWcgKCkge1xyXG4gIGludGVyYWN0KCcucmVzaXplLWRyYWcnKVxyXG4gICAgLnJlc2l6YWJsZSh7XHJcbiAgICAgIC8vIHJlc2l6ZSBmcm9tIGFsbCBlZGdlcyBhbmQgY29ybmVyc1xyXG4gICAgICBlZGdlczogeyBsZWZ0OiB0cnVlLCByaWdodDogdHJ1ZSwgYm90dG9tOiB0cnVlLCB0b3A6IHRydWUgfSxcclxuXHJcbiAgICAgIGxpc3RlbmVyczoge1xyXG4gICAgICAgIG1vdmUgKGV2dCkge1xyXG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZ0LnRhcmdldFxyXG4gICAgICAgICAgbGV0IHggPSBwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwXHJcbiAgICAgICAgICBsZXQgeSA9IHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDBcclxuXHJcbiAgICAgICAgICAvLyB1cGRhdGUgdGhlIGVsZW1lbnQncyBzdHlsZVxyXG4gICAgICAgICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gZXZ0LnJlY3Qud2lkdGggKyAncHgnXHJcbiAgICAgICAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gZXZ0LnJlY3QuaGVpZ2h0ICsgJ3B4J1xyXG5cclxuICAgICAgICAgIC8vIHRyYW5zbGF0ZSB3aGVuIHJlc2l6aW5nIGZyb20gdG9wIG9yIGxlZnQgZWRnZXNcclxuICAgICAgICAgIHggKz0gZXZ0LmRlbHRhUmVjdC5sZWZ0XHJcbiAgICAgICAgICB5ICs9IGV2dC5kZWx0YVJlY3QudG9wXHJcblxyXG4gICAgICAgICAgdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHggKyAncHgsJyArIHkgKyAncHgpJ1xyXG5cclxuICAgICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpXHJcbiAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbW9kaWZpZXJzOiBbXHJcbiAgICAgICAgLy8ga2VlcCB0aGUgZWRnZXMgaW5zaWRlIHRoZSBwYXJlbnRcclxuICAgICAgICBpbnRlcmFjdC5tb2RpZmllcnMucmVzdHJpY3RFZGdlcyh7XHJcbiAgICAgICAgICBvdXRlcjogJ3BhcmVudCdcclxuICAgICAgICB9KSxcclxuXHJcbiAgICAgICAgLy8gbWluaW11bSBzaXplXHJcbiAgICAgICAgaW50ZXJhY3QubW9kaWZpZXJzLnJlc3RyaWN0U2l6ZSh7XHJcbiAgICAgICAgICBtaW46IHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiA1MCB9XHJcbiAgICAgICAgfSlcclxuICAgICAgXSxcclxuXHJcbiAgICAgIGluZXJ0aWE6IGZhbHNlXHJcbiAgICB9KVxyXG4gICAgLmRyYWdnYWJsZSh7XHJcbiAgICAgIGxpc3RlbmVyczogeyBtb3ZlOiBkcmFnTW92ZUxpc3RlbmVyIH0sXHJcbiAgICAgIGluZXJ0aWE6IHRydWUsXHJcbiAgICAgIG1vZGlmaWVyczogW1xyXG4gICAgICAgIGludGVyYWN0Lm1vZGlmaWVycy5yZXN0cmljdFJlY3Qoe1xyXG4gICAgICAgICAgcmVzdHJpY3Rpb246ICdwYXJlbnQnLFxyXG4gICAgICAgICAgZW5kT25seTogZmFsc2VcclxuICAgICAgICB9KVxyXG4gICAgICBdXHJcbiAgICB9KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFeHByZXNzaW9uIChlcnJvck1lc3NhZ2U6IHN0cmluZyk6IG5ldmVyIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKVxyXG59XHJcbiIsImltcG9ydCB7IGNvbmZpZywgcHJvbWlzZUhhbmRsZXIgfSBmcm9tICcuL2NvbmZpZydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY29uc3QgSEFMRl9IT1VSID0gMS44ZTYgLyogMzAgbWluIGluIG1zICovXHJcblxyXG50eXBlIEhhc1Rva2VuUmVzID0ge1xyXG4gIGRhdGE6IGJvb2xlYW5cclxufVxyXG5cclxuZnVuY3Rpb24gaXNUb2tlblJlcyAocmVzOiBhbnkpOiByZXMgaXMgSGFzVG9rZW5SZXMge1xyXG4gIHJldHVybiB0eXBlb2YgcmVzLmRhdGEgPT09ICdib29sZWFuJ1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tJZkhhc1Rva2VucyAoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgLy8gaWYgdGhlIHVzZXIgc3RheXMgb24gdGhlIHNhbWUgcGFnZSBmb3IgMzAgbWluIHJlZnJlc2ggdGhlIHRva2VuLlxyXG4gIGNvbnN0IHN0YXJ0UmVmcmVzaEludGVydmFsID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ3N0YXJ0IGludGVydmFsIHJlZnJlc2gnKVxyXG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICBwcm9taXNlSGFuZGxlcihheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0UmVmcmVzaEFjY2Vzc1Rva2VuKSlcclxuICAgICAgY29uc29sZS5sb2coJ3JlZnJlc2ggYXN5bmMnKVxyXG4gICAgfSwgSEFMRl9IT1VSKVxyXG4gIH1cclxuICBsZXQgaGFzVG9rZW4gPSBmYWxzZVxyXG4gIC8vIGF3YWl0IHByb21pc2UgcmVzb2x2ZSB0aGF0IHJldHVybnMgd2hldGhlciB0aGUgc2Vzc2lvbiBoYXMgdG9rZW5zLlxyXG4gIC8vIGJlY2F1c2UgdG9rZW4gaXMgc3RvcmVkIGluIHNlc3Npb24gd2UgbmVlZCB0byByZWFzc2lnbiAnaGFzVG9rZW4nIHRvIHRoZSBjbGllbnQgc28gd2UgZG8gbm90IG5lZWQgdG8gcnVuIHRoaXMgbWV0aG9kIGFnYWluIG9uIHJlZnJlc2hcclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRIYXNUb2tlbnMpLFxyXG4gICAgKHJlcykgPT4ge1xyXG4gICAgICBpZiAoIWlzVG9rZW5SZXMocmVzKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoYXMgdG9rZW4gcmVzcG9uc2UnKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBoYXNUb2tlbiA9IHJlcy5kYXRhXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBpZiAoaGFzVG9rZW4pIHtcclxuICAgIHN0YXJ0UmVmcmVzaEludGVydmFsKClcclxuICB9XHJcbiAgcmV0dXJuIGhhc1Rva2VuXHJcbn1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRva2VucyAob25Ob1Rva2VuOiAoKSA9PiB2b2lkKSB7XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBjcmVhdGUgYSBwYXJhbWV0ZXIgc2VhcmNoZXIgaW4gdGhlIFVSTCBhZnRlciAnPycgd2hpY2ggaG9sZHMgdGhlIHJlcXVlc3RzIGJvZHkgcGFyYW1ldGVyc1xyXG4gIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcclxuXHJcbiAgLy8gR2V0IHRoZSBjb2RlIGZyb20gdGhlIHBhcmFtZXRlciBjYWxsZWQgJ2NvZGUnIGluIHRoZSB1cmwgd2hpY2hcclxuICAvLyBob3BlZnVsbHkgY2FtZSBiYWNrIGZyb20gdGhlIHNwb3RpZnkgR0VUIHJlcXVlc3Qgb3RoZXJ3aXNlIGl0IGlzIG51bGxcclxuICBsZXQgYXV0aENvZGUgPSB1cmxQYXJhbXMuZ2V0KCdjb2RlJylcclxuXHJcbiAgaWYgKGF1dGhDb2RlKSB7XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldE9idGFpblRva2Vuc1ByZWZpeChhdXRoQ29kZSkpLCAvLyBubyBuZWVkIHRvIHNwZWNpZnkgdHlwZSBhcyBubyB0eXBlIHZhbHVlIGlzIHVzZWQuXHJcblxyXG4gICAgICAvLyBpZiB0aGUgcmVxdWVzdCB3YXMgc3VjY2VzZnVsIHdlIGhhdmUgcmVjaWV2ZWQgYSB0b2tlblxyXG4gICAgICAoKSA9PiAoaGFzVG9rZW4gPSB0cnVlKVxyXG4gICAgKVxyXG4gICAgYXV0aENvZGUgPSAnJ1xyXG4gIH0gZWxzZSB7XHJcbiAgICBvbk5vVG9rZW4oKVxyXG4gIH1cclxuXHJcbiAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsICcnLCAnLycpXHJcbiAgcmV0dXJuIGhhc1Rva2VuXHJcbn1cclxuXHJcbi8qKiBHZW5lcmF0ZSBhIGxvZ2luL2NoYW5nZSBhY2NvdW50IGxpbmsuIERlZmF1bHRzIHRvIGFwcGVuZGluZyBpdCBvbnRvIHRoZSBuYXYgYmFyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFN0cmluZz59IGNsYXNzZXNUb0FkZCAtIHRoZSBjbGFzc2VzIHRvIGFkZCBvbnRvIHRoZSBsaW5rLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNoYW5nZUFjY291bnQgLSBXaGV0aGVyIHRoZSBsaW5rIHNob3VsZCBiZSBmb3IgY2hhbmdpbmcgYWNjb3VudCwgb3IgZm9yIGxvZ2dpbmcgaW4uIChkZWZhdWx0cyB0byB0cnVlKVxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJlbnRFbCAtIHRoZSBwYXJlbnQgZWxlbWVudCB0byBhcHBlbmQgdGhlIGxpbmsgb250by4gKGRlZmF1bHRzIHRvIG5hdmJhcilcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUxvZ2luICh7XHJcbiAgY2xhc3Nlc1RvQWRkID0gWydyaWdodCddLFxyXG4gIGNoYW5nZUFjY291bnQgPSB0cnVlLFxyXG4gIHBhcmVudEVsID0gZG9jdW1lbnRcclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd0b3BuYXYnKVswXVxyXG4gICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3JpZ2h0JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkcm9wZG93bi1jb250ZW50JylbMF1cclxufSA9IHt9KSB7XHJcbiAgLy8gQ3JlYXRlIGFuY2hvciBlbGVtZW50LlxyXG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcclxuICBhLmhyZWYgPSBjb25maWcuVVJMcy5hdXRoXHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgdGV4dCBub2RlIGZvciBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICBjaGFuZ2VBY2NvdW50ID8gJ0NoYW5nZSBBY2NvdW50JyA6ICdMb2dpbiBUbyBTcG90aWZ5J1xyXG4gIClcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSB0ZXh0IG5vZGUgdG8gYW5jaG9yIGVsZW1lbnQuXHJcbiAgYS5hcHBlbmRDaGlsZChsaW5rKVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlc1RvQWRkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBjbGFzc1RvQWRkID0gY2xhc3Nlc1RvQWRkW2ldXHJcbiAgICBhLmNsYXNzTGlzdC5hZGQoY2xhc3NUb0FkZClcclxuICB9XHJcblxyXG4gIC8vIGNsZWFyIGN1cnJlbnQgdG9rZW5zIHdoZW4gY2xpY2tlZFxyXG4gIGEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0Q2xlYXJUb2tlbnMpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSlcclxuICB9KVxyXG5cclxuICAvLyBBcHBlbmQgdGhlIGFuY2hvciBlbGVtZW50IHRvIHRoZSBwYXJlbnQuXHJcbiAgcGFyZW50RWwuYXBwZW5kQ2hpbGQoYSlcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gb25TdWNjZXNzZnVsVG9rZW5DYWxsIChcclxuICBoYXNUb2tlbjogYm9vbGVhbixcclxuICBoYXNUb2tlbkNhbGxiYWNrID0gKCkgPT4geyB9LFxyXG4gIG5vVG9rZW5DYWxsQmFjayA9ICgpID0+IHsgfVxyXG4pIHtcclxuICBjb25zdCBnZXRUb2tlbnNTcGlubmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgICBjb25maWcuQ1NTLklEcy5nZXRUb2tlbkxvYWRpbmdTcGlubmVyXHJcbiAgKVxyXG5cclxuICAvLyByZW1vdmUgdG9rZW4gc3Bpbm5lciBiZWNhdXNlIGJ5IHRoaXMgbGluZSB3ZSBoYXZlIG9idGFpbmVkIHRoZSB0b2tlblxyXG4gIGdldFRva2Vuc1NwaW5uZXI/LnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGdldFRva2Vuc1NwaW5uZXIpXHJcblxyXG4gIGNvbnN0IGluZm9Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5pbmZvQ29udGFpbmVyKVxyXG4gIGlmIChoYXNUb2tlbikge1xyXG4gICAgLy8gZ2VuZXJhdGUgdGhlIG5hdiBsb2dpblxyXG4gICAgZ2VuZXJhdGVMb2dpbigpXHJcbiAgICBpZiAoaW5mb0NvbnRhaW5lciA9PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5mbyBjb250YWluZXIgRWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICB9XHJcbiAgICBpbmZvQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICBoYXNUb2tlbkNhbGxiYWNrKClcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gdG9rZW4gcmVkaXJlY3QgdG8gYWxsb3cgYWNjZXNzIHBhZ2VcclxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gY29uZmlnLlVSTHMuc2l0ZVVybFxyXG4gICAgbm9Ub2tlbkNhbGxCYWNrKClcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IFBsYXlsaXN0IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvcGxheWxpc3QnXHJcbmltcG9ydCBBc3luY1NlbGVjdGlvblZlcmlmIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXN5bmNTZWxlY3Rpb25WZXJpZidcclxuaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgaHRtbFRvRWwsXHJcbiAgcHJvbWlzZUhhbmRsZXIsXHJcbiAgc2VhcmNoVWwsXHJcbiAgYW5pbWF0aW9uQ29udHJvbFxyXG59IGZyb20gJy4uLy4uL2NvbmZpZydcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSGFzVG9rZW5zLFxyXG4gIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbFxyXG59IGZyb20gJy4uLy4uL21hbmFnZS10b2tlbnMnXHJcbmltcG9ydCBDYXJkQWN0aW9uc0hhbmRsZXIgZnJvbSAnLi4vLi4vY2FyZC1hY3Rpb25zJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCwgeyBhcnJheVRvRG91Ymx5TGlua2VkTGlzdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgaW50ZXJhY3QgZnJvbSAnaW50ZXJhY3RqcydcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgUGxheWxpc3REYXRhIH0gZnJvbSAnLi4vLi4vdHlwZXMnXHJcbmltcG9ydCBUcmFjayBmcm9tICcuLi8uLi9jb21wb25lbnRzL3RyYWNrJ1xyXG5cclxuY29uc3QgZXhwYW5kZWRQbGF5bGlzdE1vZHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICBjb25maWcuQ1NTLklEcy5leHBhbmRlZFBsYXlsaXN0TW9kc1xyXG4pXHJcbmNvbnN0IHBsYXlsaXN0SGVhZGVyQXJlYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gIGNvbmZpZy5DU1MuSURzLnBsYXlsaXN0SGVhZGVyQXJlYVxyXG4pXHJcbi8vIGFkZCBvbiBjaGFuZ2UgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIG9yZGVyIHNlbGVjdGlvbiBlbGVtZW50IG9mIHRoZSBtb2RzIGV4cGFuZGVkIHBsYXlsaXN0XHJcbmNvbnN0IHBsYXlsaXN0T3JkZXIgPSBleHBhbmRlZFBsYXlsaXN0TW9kcz8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcclxuICBjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RPcmRlclxyXG4pWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuXHJcbi8vIFRFU1RcclxuY29uc3QgdmFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ0VMRU1FTlQgRE9FUyBOT1QgRVhJU1QnKVxyXG5jb25zb2xlLmxvZyh2YWw/LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXHJcbiAgY29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0T3JkZXJcclxuKVswXSkgLy8gdGhpcyB3aWxsIGxvZyBhcyB1bmRlZmluZWQgYmVjYXVzZSAndmFsJyBpcyB1bmRlZmluZWRcclxuXHJcbmNvbnN0IHRyYWNrVWwgPSBleHBhbmRlZFBsYXlsaXN0TW9kcz8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3VsJylbMF1cclxuY29uc3QgcGxheWxpc3RTZWFyY2hJbnB1dCA9IGV4cGFuZGVkUGxheWxpc3RNb2RzPy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFxyXG4gIGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFNlYXJjaFxyXG4pWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuY29uc3QgcGxheWxpc3RzQ2FyZENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gIGNvbmZpZy5DU1MuSURzLnBsYXlsaXN0Q2FyZHNDb250YWluZXJcclxuKVxyXG5jb25zdCBjYXJkUmVzaXplQ29udGFpbmVyID0gZG9jdW1lbnRcclxuICAuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheWxpc3RzU2VjdGlvbilcclxuICA/LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnJlc2l6ZUNvbnRhaW5lcilbMF0gYXMgSFRNTEVsZW1lbnRcclxuXHJcbi8vIG1pbiB2aWV3cG9ydCBiZWZvcmUgcGxheWxpc3QgY2FyZHMgY29udmVydCB0byB0ZXh0IGZvcm0gYXV0b21hdGljYWxseSAoZXF1aXZhbGVudCB0byB0aGUgbWVkaWEgcXVlcnkgaW4gcGxheWxpc3RzLmxlc3MgdGhhdCBjaGFuZ2VzIC5jYXJkKVxyXG5jb25zdCBWSUVXUE9SVF9NSU4gPSA2MDBcclxuXHJcbi8vIHdpbGwgcmVzaXplIHRoZSBwbGF5bGlzdCBjYXJkIGNvbnRhaW5lciB0byB0aGUgc2l6ZSB3YW50ZWQgd2hlbiBzY3JlZW4gaXMgPD0gVklFV1BPUlRfTUlOXHJcbmNvbnN0IHJlc3RyaWN0UmVzaXplV2lkdGggPSAoKSA9PlxyXG4gIChjYXJkUmVzaXplQ29udGFpbmVyLnN0eWxlLndpZHRoID0gVklFV1BPUlRfTUlOIC8gMi41ICsgJ3B4JylcclxuXHJcbmNvbnN0IHJlc2l6ZUFjdGlvbnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8vIGlkIG9mIHJlc2l6ZSBjb250YWluZXIgdXNlZCB0byBzZXQgaW50ZXJhY3Rpb24gdGhyb3VnaCBpbnRlcmFjdGpzXHJcbiAgY29uc3QgcmVzaXplSWQgPVxyXG4gICAgJyMnICtcclxuICAgIGNvbmZpZy5DU1MuSURzLnBsYXlsaXN0c1NlY3Rpb24gK1xyXG4gICAgJz4uJyArXHJcbiAgICBjb25maWcuQ1NTLkNMQVNTRVMucmVzaXplQ29udGFpbmVyXHJcblxyXG4gIGZ1bmN0aW9uIGVuYWJsZVJlc2l6ZSAoKSB7XHJcbiAgICBpbnRlcmFjdChyZXNpemVJZClcclxuICAgICAgLnJlc2l6YWJsZSh7XHJcbiAgICAgICAgLy8gb25seSByZXNpemUgZnJvbSB0aGUgcmlnaHRcclxuICAgICAgICBlZGdlczogeyB0b3A6IGZhbHNlLCBsZWZ0OiBmYWxzZSwgYm90dG9tOiBmYWxzZSwgcmlnaHQ6IHRydWUgfSxcclxuICAgICAgICBsaXN0ZW5lcnM6IHtcclxuICAgICAgICAgIG1vdmU6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGV2ZW50LnRhcmdldC5zdHlsZSwge1xyXG4gICAgICAgICAgICAgIHdpZHRoOiBgJHtldmVudC5yZWN0LndpZHRofXB4YFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgLm9uKCdyZXNpemVlbmQnLCBzYXZlUmVzaXplV2lkdGgpXHJcblxyXG4gICAgLy8gb25jZSB3ZSByZW5hYmxlIHRoZSByZXNpemUgd2UgbXVzdCBzZXQgaXRzIHdpZHRoIHRvIGJlIHdoYXQgdGhlIHVzZXIgbGFzdCBzZXQgaXQgdG9vLlxyXG4gICAgaW5pdGlhbExvYWRzLmxvYWRSZXNpemVXaWR0aCgpXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGRpc2FibGVSZXNpemUgKCkge1xyXG4gICAgaWYgKGludGVyYWN0LmlzU2V0KGNhcmRSZXNpemVDb250YWluZXIpKSB7XHJcbiAgICAgIGludGVyYWN0KGNhcmRSZXNpemVDb250YWluZXIpLnVuc2V0KClcclxuICAgIH1cclxuICAgIC8vIG9uY2Ugd2UgZGlzYWJsZSB0aGUgcmVzaXplIHdlIG11c3QgcmVzdHJpY3QgdGhlIHdpZHRoIHRvIGZpdCB3aXRoaW4gVklFV1BPUlRfTUlOIHBpeGVscy5cclxuICAgIHJlc3RyaWN0UmVzaXplV2lkdGgoKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGVuYWJsZVJlc2l6ZSxcclxuICAgIGRpc2FibGVSZXNpemVcclxuICB9XHJcbn0pKClcclxuLy8gb3JkZXIgb2YgaXRlbXMgc2hvdWxkIG5ldmVyIGNoYW5nZSBhcyBhbGwgb3RoZXIgb3JkZXJpbmdzIGFyZSBiYXNlZCBvZmYgdGhpcyBvbmUsIGFuZCB0aGUgb25seSB3YXkgdG8gcmV0dXJuIGJhY2sgdG8gdGhpcyBjdXN0b20gb3JkZXIgaXMgdG8gcmV0YWluIGl0LlxyXG4vLyBvbmx5IGFjY2VzcyB0aGlzIHdoZW4gdHJhY2tzIGhhdmUgbG9hZGVkLlxyXG5jb25zdCBzZWxQbGF5bGlzdFRyYWNrcyA9ICgpID0+IHtcclxuICBpZiAocGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsID09PSBudWxsIHx8IHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbC50cmFja0xpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0ZWQgdG8gYWNjZXNzIHNlbGVjdGlvbiB2ZXJpZiBkb3VibHkgbGlua2VkIHRyYWNrcyBsaXN0IGJlZm9yZSBpdCB3YXMgbG9hZGVkJylcclxuICB9XHJcbiAgcmV0dXJuIHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbC50cmFja0xpc3RcclxufVxyXG5cclxuY29uc3QgcGxheWxpc3RBY3Rpb25zID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCBwbGF5bGlzdFNlbFZlcmlmID0gbmV3IEFzeW5jU2VsZWN0aW9uVmVyaWY8UGxheWxpc3Q+KClcclxuICBjb25zdCBjYXJkQWN0aW9uc0hhbmRsZXIgPSBuZXcgQ2FyZEFjdGlvbnNIYW5kbGVyKDEpXHJcbiAgY29uc3QgcGxheWxpc3RUaXRsZWgyID0gZXhwYW5kZWRQbGF5bGlzdE1vZHM/LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoMicpWzBdXHJcblxyXG4gIC8qKiBBc3luY2hyb25vdXNseSBsb2FkIGEgcGxheWxpc3RzIHRyYWNrcyBhbmQgcmVwbGFjZSB0aGUgdHJhY2sgdWwgaHRtbCBvbmNlIGl0IGxvYWRzXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BsYXlsaXN0fSBwbGF5bGlzdE9iaiAtIGEgUGxheWxpc3QgaW5zdGFuY2Ugd2hvc2UgdHJhY2tzIHdpbGwgYmUgbG9hZGVkXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBjYWxsYmFjayBmdW5jdGlvbiB0byBydW4gd2hlbiBsb2FkaW5nIHdhcyBzdWNjZXNmdWxcclxuICAgKi9cclxuICBmdW5jdGlvbiBsb2FkUGxheWxpc3RUcmFja3MgKHBsYXlsaXN0T2JqOiBQbGF5bGlzdCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XHJcbiAgICBwbGF5bGlzdE9ialxyXG4gICAgICAubG9hZFRyYWNrcygpXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAvLyBiZWNhdXNlIC50aGVuKCkgY2FuIHJ1biB3aGVuIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgcGxheWxpc3QgaGFzIGFscmVhZHkgY2hhbmdlZCB3ZSBuZWVkIHRvIHZlcmlmeVxyXG4gICAgICAgIGlmICghcGxheWxpc3RTZWxWZXJpZi5pc1ZhbGlkKHBsYXlsaXN0T2JqKSkge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhbGxiYWNrKClcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hlbiBnZXR0aW5nIHRyYWNrcycpXHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXHJcbiAgICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHdoZW5UcmFja3NMb2FkaW5nICgpIHtcclxuICAgIC8vIGhpZGUgaGVhZGVyIHdoaWxlIGxvYWRpbmcgdHJhY2tzXHJcbiAgICBwbGF5bGlzdEhlYWRlckFyZWE/LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLmhpZGUpXHJcbiAgICBwbGF5bGlzdFNlYXJjaElucHV0LnZhbHVlID0gJyc7XHJcbiAgICAodHJhY2tVbCBhcyBFbGVtZW50KS5zY3JvbGxUb3AgPSAwXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIG9uVHJhY2tzTG9hZGluZ0RvbmUgKCkge1xyXG4gICAgLy8gc2hvdyB0aGVtIG9uY2UgdHJhY2tzIGhhdmUgbG9hZGVkXHJcbiAgICBwbGF5bGlzdEhlYWRlckFyZWE/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLmhpZGUpXHJcbiAgfVxyXG4gIC8qKiBFbXB0eSB0aGUgdHJhY2sgbGkgYW5kIHJlcGxhY2UgaXQgd2l0aCBuZXdseSBsb2FkZWQgdHJhY2sgbGkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BsYXlsaXN0fSBwbGF5bGlzdE9iaiAtIGEgUGxheWxpc3QgaW5zdGFuY2Ugd2hvc2UgdHJhY2tzIHdpbGwgYmUgbG9hZGVkXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc2hvd1BsYXlsaXN0VHJhY2tzIChwbGF5bGlzdE9iajogUGxheWxpc3QpIHtcclxuICAgIGlmIChwbGF5bGlzdFRpdGxlaDIgIT09IHVuZGVmaW5lZCAmJiBwbGF5bGlzdFRpdGxlaDIudGV4dENvbnRlbnQgIT09IG51bGwpIHtcclxuICAgICAgcGxheWxpc3RUaXRsZWgyLnRleHRDb250ZW50ID0gcGxheWxpc3RPYmoubmFtZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGVtcHR5IHRoZSB0cmFjayBsaVxyXG4gICAgcmVtb3ZlQWxsQ2hpbGROb2Rlcyh0cmFja1VsKVxyXG5cclxuICAgIC8vIGluaXRpYWxseSBzaG93IHRoZSBwbGF5bGlzdCB3aXRoIHRoZSBsb2FkaW5nIHNwaW5uZXJcclxuICAgIGNvbnN0IGh0bWxTdHJpbmcgPSBgXHJcbiAgICAgICAgICAgIDxsaT5cclxuICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnNwaW5uZXJ9XCIgLz5cclxuICAgICAgICAgICAgPC9saT5gXHJcbiAgICBjb25zdCBzcGlubmVyRWwgPSBodG1sVG9FbChodG1sU3RyaW5nKTtcclxuICAgICh0cmFja1VsIGFzIEVsZW1lbnQpLmFwcGVuZENoaWxkKHNwaW5uZXJFbCBhcyBOb2RlKVxyXG5cclxuICAgIHBsYXlsaXN0U2VsVmVyaWYuc2VsZWN0aW9uQ2hhbmdlZChwbGF5bGlzdE9iailcclxuXHJcbiAgICAvLyB0cmFja3MgYXJlIGFscmVhZHkgbG9hZGVkIHNvIHNob3cgdGhlbVxyXG4gICAgaWYgKHBsYXlsaXN0T2JqLmhhc0xvYWRlZFRyYWNrcygpKSB7XHJcbiAgICAgIHdoZW5UcmFja3NMb2FkaW5nKClcclxuICAgICAgb25UcmFja3NMb2FkaW5nRG9uZSgpXHJcbiAgICAgIG1hbmFnZVRyYWNrcy5zb3J0RXhwYW5kZWRUcmFja3NUb09yZGVyKFxyXG4gICAgICAgIHBsYXlsaXN0T2JqLm9yZGVyID09PSBwbGF5bGlzdE9yZGVyLnZhbHVlXHJcbiAgICAgIClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAvLyB0cmFja3MgYXJlbid0IGxvYWRlZCBzbyBsYXp5IGxvYWQgdGhlbSB0aGVuIHNob3cgdGhlbVxyXG5cclxuICAgICAgd2hlblRyYWNrc0xvYWRpbmcoKVxyXG4gICAgICBsb2FkUGxheWxpc3RUcmFja3MocGxheWxpc3RPYmosICgpID0+IHtcclxuICAgICAgICAvLyBpbmRleGVkIHdoZW4gbG9hZGVkIHNvIG5vIG5lZWQgdG8gcmUtaW5kZXggdGhlbVxyXG4gICAgICAgIG1hbmFnZVRyYWNrcy5zb3J0RXhwYW5kZWRUcmFja3NUb09yZGVyKHRydWUpXHJcbiAgICAgICAgb25UcmFja3NMb2FkaW5nRG9uZSgpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogV2hlbiBhIGNhcmQgaXMgY2xpY2tlZCBydW4gdGhlIHN0YW5kYXJkIENhcmRBY3Rpb25zSGFuZGxlciBvbkNsaWNrIHRoZW4gc2hvdyBpdHMgdHJhY2tzIG9uIGNhbGxiYWNrLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheTxQbGF5bGlzdD59IHBsYXlsaXN0T2Jqc1xyXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBsYXlsaXN0Q2FyZFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNsaWNrQ2FyZCAocGxheWxpc3RPYmpzOiBBcnJheTxQbGF5bGlzdD4sIHBsYXlsaXN0Q2FyZDogRWxlbWVudCkge1xyXG4gICAgY2FyZEFjdGlvbnNIYW5kbGVyLm9uQ2FyZENsaWNrKHBsYXlsaXN0Q2FyZCwgcGxheWxpc3RPYmpzLCAoc2VsT2JqOiBQbGF5bGlzdCkgPT4ge1xyXG4gICAgICBzaG93UGxheWxpc3RUcmFja3Moc2VsT2JqKVxyXG4gICAgfVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gZWFjaCBwbGF5bGlzdCBjYXJkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheTxQbGF5bGlzdD59IHBsYXlsaXN0T2JqcyAtIHBsYXlsaXN0cyB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgdGhlIGV2ZW50cy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBhZGRPblBsYXlsaXN0Q2FyZExpc3RlbmVycyAocGxheWxpc3RPYmpzOiBBcnJheTxQbGF5bGlzdD4pIHtcclxuICAgIGNvbnN0IHBsYXlsaXN0Q2FyZHMgPSBBcnJheS5mcm9tKFxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdClcclxuICAgIClcclxuXHJcbiAgICBwbGF5bGlzdENhcmRzLmZvckVhY2goKHBsYXlsaXN0Q2FyZCkgPT4ge1xyXG4gICAgICBwbGF5bGlzdENhcmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY2xpY2tDYXJkKHBsYXlsaXN0T2JqcywgcGxheWxpc3RDYXJkKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgcGxheWxpc3RDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgICAgY2FyZEFjdGlvbnNIYW5kbGVyLnNjcm9sbFRleHRPbkNhcmRFbnRlcihwbGF5bGlzdENhcmQpXHJcbiAgICAgIH0pXHJcbiAgICAgIHBsYXlsaXN0Q2FyZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xyXG4gICAgICAgIGNhcmRBY3Rpb25zSGFuZGxlci5zY3JvbGxUZXh0T25DYXJkTGVhdmUocGxheWxpc3RDYXJkKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBjbGlja0NhcmQsXHJcbiAgICBhZGRPblBsYXlsaXN0Q2FyZExpc3RlbmVycyxcclxuICAgIHNob3dQbGF5bGlzdFRyYWNrcyxcclxuICAgIHBsYXlsaXN0U2VsVmVyaWZcclxuICB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGluZm9SZXRyaWV2YWwgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGNvbnN0IHBsYXlsaXN0T2JqczogQXJyYXk8UGxheWxpc3Q+ID0gW11cclxuXHJcbiAgLyoqIE9idGFpbnMgcGxheWxpc3QgaW5mbyBmcm9tIHdlYiBhcGkgYW5kIGRpc3BsYXlzIHRoZWlyIGNhcmRzLlxyXG4gICAqXHJcbiAgICovXHJcbiAgYXN5bmMgZnVuY3Rpb24gZ2V0SW5pdGlhbEluZm8gKCkge1xyXG4gICAgZnVuY3Rpb24gb25TdWNjZXNmdWwgKHJlczogQXhpb3NSZXNwb25zZTxBcnJheTxQbGF5bGlzdERhdGE+Pikge1xyXG4gICAgICAvLyByZW1vdmUgdGhlIGluZm8gbG9hZGluZyBzcGlubmVycyBhcyBpbmZvIGhhcyBiZWVuIGxvYWRlZFxyXG4gICAgICBjb25zdCBpbmZvU3Bpbm5lcnMgPSBBcnJheS5mcm9tKFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLmluZm9Mb2FkaW5nU3Bpbm5lcnMpXHJcbiAgICAgIClcclxuICAgICAgaW5mb1NwaW5uZXJzLmZvckVhY2goKHNwaW5uZXIpID0+IHtcclxuICAgICAgICBzcGlubmVyPy5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChzcGlubmVyKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgY29uc3QgcGxheWxpc3REYXRhcyA9IHJlcy5kYXRhXHJcblxyXG4gICAgICAvLyBnZW5lcmF0ZSBQbGF5bGlzdCBpbnN0YW5jZXMgZnJvbSB0aGUgZGF0YVxyXG4gICAgICBwbGF5bGlzdERhdGFzLmZvckVhY2goKGRhdGEpID0+IHtcclxuICAgICAgICBwbGF5bGlzdE9ianMucHVzaChuZXcgUGxheWxpc3QoZGF0YS5uYW1lLCBkYXRhLmltYWdlcywgZGF0YS5pZCkpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBkaXNwbGF5Q2FyZEluZm8uZGlzcGxheVBsYXlsaXN0Q2FyZHMocGxheWxpc3RPYmpzKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGdldCBwbGF5bGlzdHMgZGF0YSBhbmQgZXhlY3V0ZSBjYWxsIGJhY2sgb24gc3VjY2VzZnVsXHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcjxBeGlvc1Jlc3BvbnNlPEFycmF5PFBsYXlsaXN0RGF0YT4+PihcclxuICAgICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldFBsYXlsaXN0cyksXHJcbiAgICAgIG9uU3VjY2VzZnVsXHJcbiAgICApXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBnZXRJbml0aWFsSW5mbyxcclxuICAgIHBsYXlsaXN0T2Jqc1xyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgZGlzcGxheUNhcmRJbmZvID0gKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBkZXRlcm1pbmVSZXNpemVBY3RpdmVuZXNzICgpIHtcclxuICAgIC8vIGFsbG93IHJlc2l6aW5nIG9ubHkgd2hlbiB2aWV3cG9ydCBpcyBsYXJnZSBlbm91Z2ggdG8gYWxsb3cgY2FyZHMuXHJcbiAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoYChtYXgtd2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWApLm1hdGNoZXMpIHtcclxuICAgICAgcmVzaXplQWN0aW9ucy5kaXNhYmxlUmVzaXplKClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlc2l6ZUFjdGlvbnMuZW5hYmxlUmVzaXplKClcclxuICAgIH1cclxuICB9XHJcbiAgLyoqIERpc3BsYXlzIHRoZSBwbGF5bGlzdCBjYXJkcyBmcm9tIGEgZ2l2ZW4gYXJyYXkgb2YgcGxheWxpc3RzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheTxQbGF5bGlzdD59IHBsYXlsaXN0T2Jqc1xyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGRpc3BsYXlQbGF5bGlzdENhcmRzIChwbGF5bGlzdE9ianM6IEFycmF5PFBsYXlsaXN0Pikge1xyXG4gICAgcmVtb3ZlQWxsQ2hpbGROb2RlcyhwbGF5bGlzdHNDYXJkQ29udGFpbmVyKVxyXG4gICAgY29uc3QgaXNJblRleHRGb3JtID1cclxuICAgICAgcGxheWxpc3RzQ2FyZENvbnRhaW5lcj8uY2xhc3NMaXN0LmNvbnRhaW5zKGNvbmZpZy5DU1MuQ0xBU1NFUy50ZXh0Rm9ybSkgfHxcclxuICAgICAgd2luZG93Lm1hdGNoTWVkaWEoYChtYXgtd2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWApLm1hdGNoZXNcclxuXHJcbiAgICBkZXRlcm1pbmVSZXNpemVBY3RpdmVuZXNzKClcclxuICAgIGNvbnN0IHNlbGVjdGVkQ2FyZCA9IHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbFxyXG5cclxuICAgIC8vIGFkZCBjYXJkIGh0bWxzIHRvIGNvbnRhaW5lciBlbGVtZW50XHJcbiAgICBwbGF5bGlzdE9ianMuZm9yRWFjaCgocGxheWxpc3RPYmosIGlkeCkgPT4ge1xyXG4gICAgICBwbGF5bGlzdHNDYXJkQ29udGFpbmVyPy5hcHBlbmRDaGlsZChcclxuICAgICAgICBwbGF5bGlzdE9iai5nZXRQbGF5bGlzdENhcmRIdG1sKGlkeCwgaXNJblRleHRGb3JtKVxyXG4gICAgICApXHJcblxyXG4gICAgICAvLyBpZiBiZWZvcmUgdGhlIGZvcm0gY2hhbmdlIHRoaXMgcGxheWxpc3Qgd2FzIHNlbGVjdGVkLCBzaW11bGF0ZSBhIGNsaWNrIG9uIGl0IGluIG9yZGVyIHRvIHNlbGVjdCBpdCBpbiB0aGUgbmV3IGZvcm1cclxuICAgICAgaWYgKHBsYXlsaXN0T2JqID09PSBzZWxlY3RlZENhcmQpIHtcclxuICAgICAgICBwbGF5bGlzdEFjdGlvbnMuY2xpY2tDYXJkKFxyXG4gICAgICAgICAgcGxheWxpc3RPYmpzLFxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0ZWRDYXJkLmNhcmRJZCkgYXMgRWxlbWVudFxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBhIHNlbGVjdGVkIGNhcmQgc2Nyb2xsIGRvd24gdG8gaXQuXHJcbiAgICBpZiAoc2VsZWN0ZWRDYXJkKSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdGVkQ2FyZC5jYXJkSWQpPy5zY3JvbGxJbnRvVmlldygpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIGV2ZW50IGxpc3RlbmVyIHRvIGNhcmRzXHJcbiAgICBwbGF5bGlzdEFjdGlvbnMuYWRkT25QbGF5bGlzdENhcmRMaXN0ZW5lcnMocGxheWxpc3RPYmpzKVxyXG4gICAgLy8gYW5pbWF0ZSB0aGUgY2FyZHMoc2hvdyB0aGUgY2FyZHMpXHJcbiAgICBhbmltYXRpb25Db250cm9sLmFuaW1hdGVBdHRyaWJ1dGVzKCcucGxheWxpc3QnLCBjb25maWcuQ1NTLkNMQVNTRVMuYXBwZWFyLCAwKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGRpc3BsYXlQbGF5bGlzdENhcmRzXHJcbiAgfVxyXG59KSgpXHJcblxyXG5mdW5jdGlvbiByZW1vdmVBbGxDaGlsZE5vZGVzIChwYXJlbnQ6IE5vZGUgfCBudWxsIHwgdW5kZWZpbmVkKSB7XHJcbiAgaWYgKCFwYXJlbnQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigncGFyZW50IGlzIHVuZGVmaW5lZCBhbmQgaGFzIG5vIGNoaWxkIG5vZGVzIHRvIHJlbW92ZScpXHJcbiAgfVxyXG4gIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuY29uc3QgbWFuYWdlVHJhY2tzID0gKGZ1bmN0aW9uICgpIHtcclxuICAvKiogU29ydHMgdGhlIHRyYWNrcyBvcmRlciBkZXBlbmRpbmcgb24gd2hhdCB0aGUgdXNlciBzZXRzIGl0IHRvbyBhbmQgcmUtaW5kZXhlcyB0aGUgdHJhY2tzIG9yZGVyIGlmIG9yZGVyIGhhcyBjaGFuZ2VkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGlzU2FtZU9yZGVyIC0gd2hldGhlciB0aGUgb3JkZXIgaXMgdGhlIHNhbWUgb3Igbm90IGFzIGJlZm9yZS5cclxuICAgKi9cclxuICBmdW5jdGlvbiBzb3J0RXhwYW5kZWRUcmFja3NUb09yZGVyIChpc1NhbWVPcmRlcjogYm9vbGVhbikge1xyXG4gICAgbGV0IG5ld09yZGVyVHJhY2tzOiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPigpXHJcbiAgICBsZXQgbmV3T3JkZXJUcmFja3NBcnI6IEFycmF5PFRyYWNrPiA9IFtdXHJcbiAgICBpZiAocGxheWxpc3RPcmRlci52YWx1ZSA9PT0gJ2N1c3RvbS1vcmRlcicpIHtcclxuICAgICAgbmV3T3JkZXJUcmFja3MgPSBzZWxQbGF5bGlzdFRyYWNrcygpXHJcbiAgICB9IGVsc2UgaWYgKHBsYXlsaXN0T3JkZXIudmFsdWUgPT09ICduYW1lJykge1xyXG4gICAgICBuZXdPcmRlclRyYWNrc0FyciA9IG9yZGVyVHJhY2tzQnlOYW1lKHNlbFBsYXlsaXN0VHJhY2tzKCkpXHJcbiAgICAgIG5ld09yZGVyVHJhY2tzID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QobmV3T3JkZXJUcmFja3NBcnIpXHJcbiAgICB9IGVsc2UgaWYgKHBsYXlsaXN0T3JkZXIudmFsdWUgPT09ICdkYXRlLWFkZGVkJykge1xyXG4gICAgICBuZXdPcmRlclRyYWNrc0FyciA9IG9yZGVyVHJhY2tzQnlEYXRlQWRkZWQoc2VsUGxheWxpc3RUcmFja3MoKSlcclxuICAgICAgbmV3T3JkZXJUcmFja3MgPSBhcnJheVRvRG91Ymx5TGlua2VkTGlzdChuZXdPcmRlclRyYWNrc0FycilcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzU2FtZU9yZGVyKSB7XHJcbiAgICAgIC8vIHNldCB0aGUgb3JkZXIgb2YgdGhlIHBsYXlsaXN0IGFzIHRoZSBuZXcgb3JkZXJcclxuICAgICAgcGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsLm9yZGVyID1cclxuICAgICAgICBwbGF5bGlzdE9yZGVyLnZhbHVlXHJcbiAgICB9XHJcbiAgICByZXJlbmRlclBsYXlsaXN0VHJhY2tzKG5ld09yZGVyVHJhY2tzLCB0cmFja1VsIGFzIEhUTUxVTGlzdEVsZW1lbnQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvcmRlclRyYWNrc0J5TmFtZSAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPik6IEFycmF5PFRyYWNrPiB7XHJcbiAgICAvLyBzaGFsbG93IGNvcHkganVzdCBzbyB3ZSBkb250IG1vZGlmeSB0aGUgb3JpZ2luYWwgb3JkZXJcclxuICAgIGNvbnN0IHRyYWNrc0NvcHkgPSBbLi4udHJhY2tMaXN0XVxyXG4gICAgdHJhY2tzQ29weS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgIC8vIC0xIHByZWNlZGVzLCAxIHN1Y2VlZHMsIDAgaXMgZXF1YWxcclxuICAgICAgcmV0dXJuIGEudGl0bGUudG9VcHBlckNhc2UoKSA9PT0gYi50aXRsZS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgPyAwXHJcbiAgICAgICAgOiBhLnRpdGxlLnRvVXBwZXJDYXNlKCkgPCBiLnRpdGxlLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgID8gLTFcclxuICAgICAgICAgIDogMVxyXG4gICAgfSlcclxuICAgIHJldHVybiB0cmFja3NDb3B5XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIG9yZGVyVHJhY2tzQnlEYXRlQWRkZWQgKHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4pIHtcclxuICAgIC8vIHNoYWxsb3cgY29weSBqdXN0IHNvIHdlIGRvbnQgbW9kaWZ5IHRoZSBvcmlnaW5hbCBvcmRlclxyXG4gICAgY29uc3QgdHJhY2tzQ29weSA9IFsuLi50cmFja0xpc3RdXHJcbiAgICB0cmFja3NDb3B5LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgLy8gLTEgJ2EnIHByZWNlZGVzICdiJywgMSAnYScgc3VjZWVkcyAnYicsIDAgaXMgJ2EnIGVxdWFsICdiJ1xyXG4gICAgICByZXR1cm4gYS5kYXRlQWRkZWRUb1BsYXlsaXN0ID09PSBiLmRhdGVBZGRlZFRvUGxheWxpc3RcclxuICAgICAgICA/IDBcclxuICAgICAgICA6IGEuZGF0ZUFkZGVkVG9QbGF5bGlzdCA8IGIuZGF0ZUFkZGVkVG9QbGF5bGlzdFxyXG4gICAgICAgICAgPyAtMVxyXG4gICAgICAgICAgOiAxXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIHRyYWNrc0NvcHlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlcmVuZGVyUGxheWxpc3RUcmFja3MgKHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4sIHRyYWNrQXJyVWw6IEhUTUxVTGlzdEVsZW1lbnQpIHtcclxuICAgIHJlbW92ZUFsbENoaWxkTm9kZXModHJhY2tBcnJVbClcclxuICAgIGZvciAoY29uc3QgdHJhY2sgb2YgdHJhY2tMaXN0LnZhbHVlcygpKSB7XHJcbiAgICAgIHRyYWNrQXJyVWwuYXBwZW5kQ2hpbGQodHJhY2suZ2V0UGxheWxpc3RUcmFja0h0bWwodHJhY2tMaXN0LCB0cnVlKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBzb3J0RXhwYW5kZWRUcmFja3NUb09yZGVyLFxyXG4gICAgb3JkZXJUcmFja3NCeURhdGVBZGRlZFxyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgYWRkRXZlbnRMaXN0ZW5lcnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGFkZEV4cGFuZGVkUGxheWxpc3RNb2RzU2VhcmNoYmFyRXZlbnQgKCkge1xyXG4gICAgLy8gYWRkIGtleSB1cCBldmVudCB0byB0aGUgbW9kcyBleHBhbmRlZCBwbGF5bGlzdCdzIHNlYXJjaCBiYXIgZWxlbWVudFxyXG4gICAgZXhwYW5kZWRQbGF5bGlzdE1vZHNcclxuICAgICAgPy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFNlYXJjaClbMF1cclxuICAgICAgPy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsICgpID0+IHtcclxuICAgICAgICBzZWFyY2hVbCh0cmFja1VsIGFzIEhUTUxVTGlzdEVsZW1lbnQsIHBsYXlsaXN0U2VhcmNoSW5wdXQpXHJcbiAgICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGFkZEV4cGFuZGVkUGxheWxpc3RNb2RzT3JkZXJFdmVudCAoKSB7XHJcbiAgICAvLyBhZGQgb24gY2hhbmdlIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBvcmRlciBzZWxlY3Rpb24gZWxlbWVudCBvZiB0aGUgbW9kcyBleHBhbmRlZCBwbGF5bGlzdFxyXG4gICAgcGxheWxpc3RPcmRlci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgIG1hbmFnZVRyYWNrcy5zb3J0RXhwYW5kZWRUcmFja3NUb09yZGVyKGZhbHNlKVxyXG4gICAgfSlcclxuICB9XHJcbiAgZnVuY3Rpb24gYWRkRGVsZXRlUmVjZW50bHlBZGRlZFRyYWNrRXZlbnQgKCkge1xyXG4gICAgZnVuY3Rpb24gb25DbGljayAoKSB7XHJcbiAgICAgIGlmIChudW1Ub1JlbW92ZUlucHV0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ251bWJlciB0byByZW1vdmUgaW5wdXQgaXMgbm90IGZvdW5kJylcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBudW1Ub1JlbW92ZSA9IHBhcnNlSW50KG51bVRvUmVtb3ZlSW5wdXQudmFsdWUpXHJcbiAgICAgIGlmIChcclxuICAgICAgICBudW1Ub1JlbW92ZSA+IHNlbFBsYXlsaXN0VHJhY2tzKCkuc2l6ZSB8fFxyXG4gICAgICAgICBudW1Ub1JlbW92ZSA9PT0gMFxyXG4gICAgICApIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnY2FudCByZW1vdmUgdGhpcyBtYW55JylcclxuICAgICAgICAvLyB0aGUgdXNlciBpcyB0cnlpbmcgdG8gZGVsZXRlIG1vcmUgc29uZ3MgdGhlbiB0aGVyZSBhcmUgYXZhaWxhYmxlLCB5b3UgbWF5IHdhbnQgdG8gYWxsb3cgdGhpc1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG9yZGVyZWRUcmFja3MgPSBtYW5hZ2VUcmFja3Mub3JkZXJUcmFja3NCeURhdGVBZGRlZChcclxuICAgICAgICBzZWxQbGF5bGlzdFRyYWNrcygpXHJcbiAgICAgIClcclxuICAgICAgY29uc3QgdHJhY2tzVG9SZW1vdmUgPSBvcmRlcmVkVHJhY2tzLnNsaWNlKDAsIG51bVRvUmVtb3ZlKVxyXG5cclxuICAgICAgLy8gcmVtb3ZlIHNvbmdzIGNvbnRhaW5lZCBpbiB0cmFja3NUb1JlbW92ZSBmcm9tIGV4cGFuZGFibGVQbGF5bGlzdFRyYWNrc1xyXG4gICAgICB0cmFja3NUb1JlbW92ZS5mb3JFYWNoKCh0cmFja1RvUmVtb3ZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWR4ID0gc2VsUGxheWxpc3RUcmFja3MoKS5maW5kSW5kZXgoXHJcbiAgICAgICAgICAodHJhY2spID0+IHRyYWNrLmlkID09PSB0cmFja1RvUmVtb3ZlLmlkXHJcbiAgICAgICAgKVxyXG4gICAgICAgIHNlbFBsYXlsaXN0VHJhY2tzKCkucmVtb3ZlKGlkeClcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHBsYXlsaXN0QWN0aW9ucy5wbGF5bGlzdFNlbFZlcmlmLmN1cnJTZWxlY3RlZFZhbE5vTnVsbC5hZGRUb1VuZG9TdGFjayhcclxuICAgICAgICB0cmFja3NUb1JlbW92ZVxyXG4gICAgICApXHJcblxyXG4gICAgICAvLyBub3Qgc2FtZSBvcmRlciBhcyBzb21lIGhhdmUgYmVlbiBkZWxldGVkXHJcbiAgICAgIG1hbmFnZVRyYWNrcy5zb3J0RXhwYW5kZWRUcmFja3NUb09yZGVyKGZhbHNlKVxyXG4gICAgICBjb25zdCB0cmFja1VyaXMgPSB0cmFja3NUb1JlbW92ZS5tYXAoKHRyYWNrKSA9PiB7IHJldHVybiB7IHVyaTogdHJhY2sudXJpIH0gfSlcclxuXHJcbiAgICAgIHByb21pc2VIYW5kbGVyKFxyXG4gICAgICAgIGF4aW9zLmRlbGV0ZShjb25maWcuVVJMcy5kZWxldGVQbGF5bGlzdFRyYWNrcyhwbGF5bGlzdEFjdGlvbnMucGxheWxpc3RTZWxWZXJpZi5jdXJyU2VsZWN0ZWRWYWxOb051bGwuaWQpLCB7XHJcbiAgICAgICAgICBkYXRhOiB7IHRyYWNrX3VyaXM6IHRyYWNrVXJpcyB9XHJcbiAgICAgICAgfSlcclxuICAgICAgKVxyXG4gICAgfVxyXG4gICAgY29uc3QgbnVtVG9SZW1vdmVJbnB1dCA9IGRvY3VtZW50XHJcbiAgICAgIC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5yZW1vdmVFYXJseUFkZGVkKVxyXG4gICAgICA/LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpWzBdXHJcblxyXG4gICAgY29uc3QgcmVtb3ZlQnRuID0gZG9jdW1lbnRcclxuICAgICAgLmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnJlbW92ZUVhcmx5QWRkZWQpXHJcbiAgICAgID8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2J1dHRvbicpWzBdXHJcblxyXG4gICAgcmVtb3ZlQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9uQ2xpY2soKSlcclxuICB9XHJcbiAgZnVuY3Rpb24gYWRkVW5kb1BsYXlsaXN0VHJhY2tEZWxldGVFdmVudCAoKSB7XHJcbiAgICBmdW5jdGlvbiBvbkNsaWNrICgpIHtcclxuICAgICAgY29uc3QgY3VyclBsYXlsaXN0ID0gcGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsXHJcbiAgICAgIGlmICghY3VyclBsYXlsaXN0IHx8IGN1cnJQbGF5bGlzdC51bmRvU3RhY2subGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgdW5kb25lUGxheWxpc3RJZCA9IGN1cnJQbGF5bGlzdC5pZFxyXG4gICAgICBjb25zdCB0cmFja3NSZW1vdmVkID0gY3VyclBsYXlsaXN0LnVuZG9TdGFjay5wb3AoKVxyXG5cclxuICAgICAgY29uc3QgdHJhY2tVcmlzID0gdHJhY2tzUmVtb3ZlZCEubWFwKCh0cmFjaykgPT4gdHJhY2sudXJpKVxyXG4gICAgICBwcm9taXNlSGFuZGxlcihcclxuICAgICAgICBheGlvcy5wb3N0KGNvbmZpZy5VUkxzLnBvc3RQbGF5bGlzdFRyYWNrcyhjdXJyUGxheWxpc3QuaWQpLCB7XHJcbiAgICAgICAgICB0cmFja191cmlzOiB0cmFja1VyaXNcclxuICAgICAgICB9KSxcclxuICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAvLyBpZiB0aGUgcmVxdWVzdCB3YXMgc3VjY2VzZnVsIGFuZCB0aGUgdXNlciBpc1xyXG4gICAgICAgICAgLy8gc3RpbGwgbG9va2luZyBhdCB0aGUgcGxheWxpc3QgdGhhdCB3YXMgdW5kb25lIGJhY2ssIHJlbG9hZCBpdC5cclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgdW5kb25lUGxheWxpc3RJZCA9PT1cclxuICAgICAgICAgICAgcGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsLmlkXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgLy8gcmVsb2FkIHRoZSBwbGF5bGlzdCBhZnRlciBhZGRpbmcgdHJhY2tzIGluIG9yZGVyIHRvIHNob3cgdGhlIHRyYWNrcyBhZGRlZCBiYWNrXHJcbiAgICAgICAgICAgIHBsYXlsaXN0QWN0aW9ucy5zaG93UGxheWxpc3RUcmFja3MoXHJcbiAgICAgICAgICAgICAgcGxheWxpc3RBY3Rpb25zLnBsYXlsaXN0U2VsVmVyaWYuY3VyclNlbGVjdGVkVmFsTm9OdWxsXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIH1cclxuICAgIGNvbnN0IHVuZG9CdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy51bmRvKVxyXG5cclxuICAgIHVuZG9CdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb25DbGljaygpKVxyXG4gIH1cclxuICBmdW5jdGlvbiBhZGRNb2RzT3BlbmVyRXZlbnQgKCkge1xyXG4gICAgY29uc3QgbW9kc1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5bGlzdE1vZHMpXHJcbiAgICBjb25zdCBvcGVuTW9kc1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5tb2RzT3BlbmVyKVxyXG4gICAgY29uc3Qgd3JlbmNoSWNvbiA9IG9wZW5Nb2RzU2VjdGlvbj8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdXHJcbiAgICBvcGVuTW9kc1NlY3Rpb24/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAvLyBleHBhbmQgbW9kcyBzZWN0aW9uXHJcbiAgICAgIG1vZHNTZWN0aW9uPy5jbGFzc0xpc3QudG9nZ2xlKGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIpXHJcbiAgICAgIC8vIHNlbGVjdCB0aGUgd3JlbmNoIGltYWdlXHJcbiAgICAgIHdyZW5jaEljb24/LmNsYXNzTGlzdC50b2dnbGUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgfSlcclxuICB9XHJcbiAgZnVuY3Rpb24gc2F2ZVBsYXlsaXN0Rm9ybSAoaXNJblRleHRGb3JtOiBib29sZWFuKSB7XHJcbiAgICAvLyBzYXZlIHdoZXRoZXIgdGhlIHBsYXlsaXN0IGlzIGluIHRleHQgZm9ybSBvciBub3QuXHJcbiAgICBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KFxyXG4gICAgICAgIGNvbmZpZy5VUkxzLnB1dFBsYXlsaXN0SXNJblRleHRGb3JtRGF0YShTdHJpbmcoaXNJblRleHRGb3JtKSlcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxuICBmdW5jdGlvbiBhZGRDb252ZXJ0Q2FyZHMgKCkge1xyXG4gICAgY29uc3QgY29udmVydEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmNvbnZlcnRDYXJkKVxyXG4gICAgY29uc3QgY29udmVydEltZyA9IGNvbnZlcnRCdG4/LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKVswXVxyXG5cclxuICAgIGZ1bmN0aW9uIG9uQ2xpY2sgKCkge1xyXG4gICAgICBpZiAoY29udmVydEltZyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb252ZXJ0IGNhcmRzIHRvIHRleHQgZm9ybSBidXR0b25zIGltYWdlIGlzIG5vdCBmb3VuZCcpXHJcbiAgICAgIH1cclxuICAgICAgcGxheWxpc3RzQ2FyZENvbnRhaW5lcj8uY2xhc3NMaXN0LnRvZ2dsZShjb25maWcuQ1NTLkNMQVNTRVMudGV4dEZvcm0pXHJcbiAgICAgIGRpc3BsYXlDYXJkSW5mby5kaXNwbGF5UGxheWxpc3RDYXJkcyhpbmZvUmV0cmlldmFsLnBsYXlsaXN0T2JqcylcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHBsYXlsaXN0c0NhcmRDb250YWluZXI/LmNsYXNzTGlzdC5jb250YWlucyhjb25maWcuQ1NTLkNMQVNTRVMudGV4dEZvcm0pXHJcbiAgICAgICkge1xyXG4gICAgICAgIHNhdmVQbGF5bGlzdEZvcm0odHJ1ZSlcclxuICAgICAgICBjb252ZXJ0SW1nLnNyYyA9IGNvbmZpZy5QQVRIUy5ncmlkVmlld1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNhdmVQbGF5bGlzdEZvcm0oZmFsc2UpXHJcbiAgICAgICAgY29udmVydEltZy5zcmMgPSBjb25maWcuUEFUSFMubGlzdFZpZXdcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnZlcnRCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb25DbGljaygpKVxyXG4gIH1cclxuICBmdW5jdGlvbiBhZGRIaWRlU2hvd0NhcmRzICgpIHtcclxuICAgIGNvbnN0IGhpZGVTaG93Q2FyZHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGlkZS1zaG93LWNhcmRzJylcclxuICAgIGZ1bmN0aW9uIG9uQ2xpY2sgKCkge1xyXG4gICAgICBoaWRlU2hvd0NhcmRzPy5jbGFzc0xpc3QudG9nZ2xlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgICAgLy8gaWYgaXRzIHNlbGVjdGVkIHdlIGhpZGUgdGhlIGNhcmRzIG90aGVyd2lzZSB3ZSBzaG93IHRoZW0uIFRoaXMgb2NjdXJzIHdoZW4gc2NyZWVuIHdpZHRoIGlzIGEgY2VydGFpbiBzaXplIGFuZCBhIG1lbnUgc2xpZGluZyBmcm9tIHRoZSBsZWZ0IGFwcGVhcnNcclxuICAgICAgaWYgKGhpZGVTaG93Q2FyZHM/LmNsYXNzTGlzdC5jb250YWlucyhjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpKSB7XHJcbiAgICAgICAgY2FyZFJlc2l6ZUNvbnRhaW5lci5zdHlsZS53aWR0aCA9ICcwJ1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3RyaWN0UmVzaXplV2lkdGgoKVxyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZUhpZGVTaG93Q2FyZHNJbWcoKVxyXG4gICAgfVxyXG4gICAgaGlkZVNob3dDYXJkcz8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBvbkNsaWNrKCkpXHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBhZGRFeHBhbmRlZFBsYXlsaXN0TW9kc1NlYXJjaGJhckV2ZW50LFxyXG4gICAgYWRkRXhwYW5kZWRQbGF5bGlzdE1vZHNPcmRlckV2ZW50LFxyXG4gICAgYWRkRGVsZXRlUmVjZW50bHlBZGRlZFRyYWNrRXZlbnQsXHJcbiAgICBhZGRVbmRvUGxheWxpc3RUcmFja0RlbGV0ZUV2ZW50LFxyXG4gICAgYWRkTW9kc09wZW5lckV2ZW50LFxyXG4gICAgYWRkQ29udmVydENhcmRzLFxyXG4gICAgYWRkSGlkZVNob3dDYXJkc1xyXG4gIH1cclxufSkoKVxyXG5cclxuZnVuY3Rpb24gc2F2ZVJlc2l6ZVdpZHRoICgpIHtcclxuICBwcm9taXNlSGFuZGxlcihcclxuICAgIGF4aW9zLnB1dChcclxuICAgICAgY29uZmlnLlVSTHMucHV0UGxheWxpc3RSZXNpemVEYXRhKGNhcmRSZXNpemVDb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgudG9TdHJpbmcoKSkpXHJcbiAgKVxyXG4gIGNvbnNvbGUubG9nKCdlbmQgcmVzaXplJylcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlSGlkZVNob3dDYXJkc0ltZyAoKSB7XHJcbiAgY29uc3QgaGlkZVNob3dDYXJkcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRlLXNob3ctY2FyZHMnKVxyXG4gIGNvbnN0IGhpZGVTaG93SW1nID0gaGlkZVNob3dDYXJkcz8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdXHJcblxyXG4gIGlmIChoaWRlU2hvd0ltZyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ltZyB0byBzaG93IGFuZCBoaWRlIHRoZSB0ZXh0IGZvcm0gY2FyZHMgaXMgbm90IGZvdW5kJylcclxuICB9XHJcbiAgLy8gaWYgaXRzIHNlbGVjdGVkIHdlIGhpZGUgdGhlIGNhcmRzIG90aGVyd2lzZSB3ZSBzaG93IHRoZW0uXHJcbiAgaWYgKGhpZGVTaG93Q2FyZHM/LmNsYXNzTGlzdC5jb250YWlucyhjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpKSB7XHJcbiAgICBoaWRlU2hvd0ltZy5zcmMgPSBjb25maWcuUEFUSFMuY2hldnJvblJpZ2h0XHJcbiAgfSBlbHNlIHtcclxuICAgIGhpZGVTaG93SW1nLnNyYyA9IGNvbmZpZy5QQVRIUy5jaGV2cm9uTGVmdFxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2hlY2tJZkNhcmRGb3JtQ2hhbmdlT25SZXNpemUgKCkge1xyXG4gIGNvbnN0IHByZXYgPSB7XHJcbiAgICB2d0lzU21hbGw6IHdpbmRvdy5tYXRjaE1lZGlhKGAobWF4LXdpZHRoOiAke1ZJRVdQT1JUX01JTn1weClgKS5tYXRjaGVzXHJcbiAgfVxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zdCB3YXNCaWdOb3dTbWFsbCA9XHJcbiAgICAgIHdpbmRvdy5tYXRjaE1lZGlhKGAobWF4LXdpZHRoOiAke1ZJRVdQT1JUX01JTn1weClgKS5tYXRjaGVzICYmXHJcbiAgICAgICFwcmV2LnZ3SXNTbWFsbFxyXG5cclxuICAgIGNvbnN0IHdhc1NtYWxsTm93QmlnID1cclxuICAgICAgcHJldi52d0lzU21hbGwgJiZcclxuICAgICAgd2luZG93Lm1hdGNoTWVkaWEoYChtaW4td2lkdGg6ICR7VklFV1BPUlRfTUlOfXB4KWApLm1hdGNoZXNcclxuXHJcbiAgICBpZiAod2FzQmlnTm93U21hbGwgfHwgd2FzU21hbGxOb3dCaWcpIHtcclxuICAgICAgaWYgKHdhc1NtYWxsTm93QmlnKSB7XHJcbiAgICAgICAgY29uc3QgaGlkZVNob3dDYXJkcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRlLXNob3ctY2FyZHMnKVxyXG4gICAgICAgIGhpZGVTaG93Q2FyZHM/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgICAgIHVwZGF0ZUhpZGVTaG93Q2FyZHNJbWcoKVxyXG4gICAgICB9XHJcbiAgICAgIC8vIGNhcmQgZm9ybSBoYXMgY2hhbmdlZCBvbiB3aW5kb3cgcmVzaXplXHJcbiAgICAgIGRpc3BsYXlDYXJkSW5mby5kaXNwbGF5UGxheWxpc3RDYXJkcyhpbmZvUmV0cmlldmFsLnBsYXlsaXN0T2JqcylcclxuICAgICAgcHJldi52d0lzU21hbGwgPSB3aW5kb3cubWF0Y2hNZWRpYShcclxuICAgICAgICBgKG1heC13aWR0aDogJHtWSUVXUE9SVF9NSU59cHgpYFxyXG4gICAgICApLm1hdGNoZXNcclxuICAgIH1cclxuICB9KVxyXG59XHJcblxyXG5jb25zdCBpbml0aWFsTG9hZHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGxvYWRQbGF5bGlzdEZvcm0gKCkge1xyXG4gICAgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zXHJcbiAgICAgICAgLmdldChjb25maWcuVVJMcy5nZXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGEpXHJcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlcy5kYXRhID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIGl0cyBpbiB0ZXh0IGZvcm0gY2hhbmdlIGl0IHRvIGJlIHNvLlxyXG4gICAgICAgICAgICBjb25zdCBjb252ZXJ0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgICAgICAgICAgICAgY29uZmlnLkNTUy5JRHMuY29udmVydENhcmRcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBjb25zdCBjb252ZXJ0SW1nID0gY29udmVydEJ0bj8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpWzBdXHJcbiAgICAgICAgICAgIGlmIChjb252ZXJ0SW1nID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbnZlcnQgY2FyZHMgdG8gdGV4dCBmb3JtIGJ1dHRvbnMgaW1hZ2UgaXMgbm90IGZvdW5kJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwbGF5bGlzdHNDYXJkQ29udGFpbmVyPy5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy50ZXh0Rm9ybSlcclxuICAgICAgICAgICAgZGlzcGxheUNhcmRJbmZvLmRpc3BsYXlQbGF5bGlzdENhcmRzKGluZm9SZXRyaWV2YWwucGxheWxpc3RPYmpzKVxyXG4gICAgICAgICAgICBjb252ZXJ0SW1nLnNyYyA9IGNvbmZpZy5QQVRIUy5ncmlkVmlld1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gZWxzZSBpdCBpcyBpbiBjYXJkIGZvcm0gd2hpY2ggaXMgdGhlIGRlZmF1bHQuXHJcbiAgICAgICAgfSlcclxuICAgIClcclxuICB9XHJcbiAgZnVuY3Rpb24gbG9hZFJlc2l6ZVdpZHRoICgpIHtcclxuICAgIHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvc1xyXG4gICAgICAgIC5nZXQoY29uZmlnLlVSTHMuZ2V0UGxheWxpc3RSZXNpemVEYXRhKVxyXG4gICAgICAgIC50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgIGNhcmRSZXNpemVDb250YWluZXIuc3R5bGUud2lkdGggPSByZXMuZGF0YSArICdweCdcclxuICAgICAgICB9KVxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgbG9hZFBsYXlsaXN0Rm9ybSxcclxuICAgIGxvYWRSZXNpemVXaWR0aFxyXG4gIH1cclxufSkoKTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXI8Ym9vbGVhbj4oY2hlY2tJZkhhc1Rva2VucygpLCAoaGFzVG9rZW4pID0+IHtcclxuICAgIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbChoYXNUb2tlbiwgKCkgPT4ge1xyXG4gICAgICAvLyBnZXQgaW5mb3JtYXRpb24gYW5kIG9uU3VjY2VzcyBhbmltYXRlIHRoZSBlbGVtZW50c1xyXG4gICAgICBwcm9taXNlSGFuZGxlcihcclxuICAgICAgICBpbmZvUmV0cmlldmFsLmdldEluaXRpYWxJbmZvKCksXHJcbiAgICAgICAgKCkgPT5cclxuICAgICAgICAgIGFuaW1hdGlvbkNvbnRyb2wuYW5pbWF0ZUF0dHJpYnV0ZXMoXHJcbiAgICAgICAgICAgICcucGxheWxpc3QsI2V4cGFuZGVkLXBsYXlsaXN0LW1vZHMnLFxyXG4gICAgICAgICAgICBjb25maWcuQ1NTLkNMQVNTRVMuYXBwZWFyLFxyXG4gICAgICAgICAgICAyNVxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAoKSA9PiBjb25zb2xlLmxvZygnUHJvYmxlbSB3aGVuIGdldHRpbmcgaW5mb3JtYXRpb24nKVxyXG4gICAgICApXHJcbiAgICB9KVxyXG4gIH0pXHJcblxyXG4gIE9iamVjdC5lbnRyaWVzKGFkZEV2ZW50TGlzdGVuZXJzKS5mb3JFYWNoKChbLCBhZGRFdmVudExpc3RlbmVyXSkgPT4ge1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcigpXHJcbiAgfSlcclxuICBjaGVja0lmQ2FyZEZvcm1DaGFuZ2VPblJlc2l6ZSgpXHJcbiAgT2JqZWN0LmVudHJpZXMoaW5pdGlhbExvYWRzKS5mb3JFYWNoKChbLCBsb2FkZXJdKSA9PiB7XHJcbiAgICBsb2FkZXIoKVxyXG4gIH0pXHJcbn0pKClcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3B1YmxpYy9wYWdlcy9wbGF5bGlzdHMtcGFnZS9wbGF5bGlzdHMudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=