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

/***/ "./src/public/components/profile.ts":
/*!******************************************!*\
  !*** ./src/public/components/profile.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
class Profile {
    constructor(displayName, country, email, images, followers, externalURL) {
        this.displayName = displayName;
        this.country = country;
        this.email = email;
        this.profileImgUrl = (0, config_1.getValidImage)(images);
        this.followers = followers;
        this.externalURL = externalURL;
    }
}
exports.default = Profile;


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

/***/ "./src/public/pages/profile-page/profile.ts":
/*!**************************************************!*\
  !*** ./src/public/pages/profile-page/profile.ts ***!
  \**************************************************/
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
const config_1 = __webpack_require__(/*! ../../config */ "./src/public/config.ts");
const profile_1 = __importDefault(__webpack_require__(/*! ../../components/profile */ "./src/public/components/profile.ts"));
const playlist_1 = __webpack_require__(/*! ../../components/playlist */ "./src/public/components/playlist.ts");
const manage_tokens_1 = __webpack_require__(/*! ../../manage-tokens */ "./src/public/manage-tokens.ts");
const artist_1 = __webpack_require__(/*! ../../components/artist */ "./src/public/components/artist.ts");
const card_actions_1 = __importDefault(__webpack_require__(/*! ../../components/card-actions */ "./src/public/components/card-actions.ts"));
const doubly_linked_list_1 = __importDefault(__webpack_require__(/*! ../../components/doubly-linked-list */ "./src/public/components/doubly-linked-list.ts"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
function displayProfile(profile) {
    var _a, _b, _c, _d;
    const profileHeader = (_a = document.getElementById(config_1.config.CSS.IDs.profileHeader)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)('profile header element does not exist');
    const displayName = (_b = profileHeader.getElementsByTagName('h1')[0]) !== null && _b !== void 0 ? _b : (0, config_1.throwExpression)('display name element does not exist');
    const followerCount = (_c = profileHeader.getElementsByTagName('h4')[0]) !== null && _c !== void 0 ? _c : (0, config_1.throwExpression)('follower element does not exist');
    const profileImage = (_d = profileHeader.getElementsByTagName('img')[0]) !== null && _d !== void 0 ? _d : (0, config_1.throwExpression)('profile image element does not exist');
    displayName.textContent = profile.displayName;
    followerCount.textContent = profile.followers + ' followers';
    profileImage.src =
        profile.profileImgUrl === ''
            ? '/images/profile-user.png'
            : profile.profileImgUrl;
}
function retrieveProfile() {
    return __awaiter(this, void 0, void 0, function* () {
        function onSuccesful(res) {
            const data = res.data;
            const profile = new profile_1.default(data.display_name, data.country, data.email, data.images, data.followers.total, data.external_urls.spotify);
            displayProfile(profile);
        }
        // get profile data from api
        yield (0, config_1.promiseHandler)(axios_1.default.request({ method: 'GET', url: config_1.config.URLs.getCurrentUserProfile }), onSuccesful);
    });
}
const addEventListeners = (function () {
    /** Adds the click event listener that clears session data and returns user back to home page.
     *
     */
    function addClearDataListener() {
        const clearDataEl = document.getElementById(config_1.config.CSS.IDs.clearData);
        clearDataEl.href = config_1.config.URLs.siteUrl;
        function onClick() {
            axios_1.default.put(config_1.config.URLs.putClearSession);
        }
        clearDataEl.addEventListener('click', onClick);
    }
    return { addClearDataListener };
})();
const savedTracksActions = (function () {
    function getSavedTracks() {
        (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getCurrentUserSavedTracks), (res) => {
            // if we retrieved the tracks succesfully, then display them
            const trackList = new doubly_linked_list_1.default();
            const tracksData = res.data.items.map((item) => item.track);
            (0, playlist_1.getPlaylistTracksFromDatas)(tracksData, res.data.items, trackList);
            displaySavedTracks(trackList);
        });
    }
    function displaySavedTracks(trackList) {
        var _a;
        const likedTracksUl = (_a = document.getElementById(config_1.config.CSS.IDs.likedTracks)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`liked tracks ul of id ${config_1.config.CSS.IDs.likedTracks} does not exist`);
        for (const track of trackList.values()) {
            likedTracksUl.append(track.getPlaylistTrackHtml(trackList));
        }
    }
    return { getSavedTracks };
})();
const followedArtistActions = (function () {
    const cardActionsHandler = new card_actions_1.default(50);
    function getFollowedArtists() {
        (0, config_1.promiseHandler)(axios_1.default.get(config_1.config.URLs.getFollowedArtists), (res) => {
            // if we retrieved the artists succesfully, then display them
            const artistArr = [];
            (0, artist_1.generateArtistsFromData)(res.data.artists.items, artistArr);
            displayFollowedArtists(artistArr);
        });
    }
    function displayFollowedArtists(followedArtists) {
        var _a;
        const cardGrid = (_a = document.getElementById(config_1.config.CSS.IDs.followedArtists)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`Card grid of id ${config_1.config.CSS.IDs.followedArtists} does not exist`);
        // display the cards
        let i = 0;
        followedArtists.forEach((artist) => {
            cardGrid.append(artist.getArtistCardHtml(i, true));
            i++;
        });
        const artistCards = Array.from(document.getElementsByClassName(config_1.config.CSS.CLASSES.artist));
        // add event listeners to the cards
        cardActionsHandler.addAllEventListeners(artistCards, followedArtists, null, true, false);
    }
    return { getFollowedArtists };
})();
(function () {
    (0, config_1.promiseHandler)((0, manage_tokens_1.checkIfHasTokens)(), (hasToken) => (0, manage_tokens_1.onSuccessfulTokenCall)(hasToken, () => {
        // get user profile
        (0, config_1.promiseHandler)(retrieveProfile(), () => {
            (0, manage_tokens_1.generateLogin)({
                classesToAdd: ['glow'],
                parentEl: document.getElementById('account-btns')
            });
        }, () => console.log('Problem when getting information'));
        savedTracksActions.getSavedTracks();
        followedArtistActions.getFollowedArtists();
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/public/pages/profile-page/profile.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FDdEQ7UUFFRCxrQkFBa0IsQ0FBQyxjQUFjLEVBQUU7UUFDbkMscUJBQXFCLENBQUMsa0JBQWtCLEVBQUU7SUFDNUMsQ0FBQyxDQUFDLENBQ0g7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLEVBQUUsRUFBRTtRQUNqRSxnQkFBZ0IsRUFBRTtJQUNwQixDQUFDLENBQUM7QUFDSixDQUFDLENBQUMsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcEpKLG1HQUE0QztBQUM1QywrRUFBaUQ7QUFFakQsU0FBc0IsZUFBZTs7UUFDbkMsMkJBQWMsRUFBK0IsZUFBSyxDQUFDLE9BQU8sQ0FBZ0IsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxlQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNsSSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUNqRSxJQUFJLFFBQVEsRUFBRTtnQkFDWixRQUFRLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJO2FBQ2hDO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUFBO0FBUEQsMENBT0M7Ozs7Ozs7VUNWRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9hbGJ1bS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9hcnRpc3QudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvY2FyZC1hY3Rpb25zLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2NhcmQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3BsYXliYWNrLXNkay50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wbGF5bGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wcm9maWxlLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3B1YnN1Yi9hZ2dyZWdhdG9yLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3B1YnN1Yi9ldmVudC1hcmdzL3RyYWNrLXBsYXktYXJncy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvc3Vic2NyaXB0aW9uLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3Nwb3RpZnktcGxheWJhY2stZWxlbWVudC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy90cmFjay50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29uZmlnLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9tYW5hZ2UtdG9rZW5zLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9wYWdlcy9wcm9maWxlLXBhZ2UvcHJvZmlsZS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvdXNlci1kYXRhLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogSWdub3JlICovIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCJjbGFzcyBBbGJ1bSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGV4dGVybmFsVXJsOiBzdHJpbmc7XHJcbiAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgZXh0ZXJuYWxVcmw6IHN0cmluZykge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5leHRlcm5hbFVybCA9IGV4dGVybmFsVXJsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBbGJ1bVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIGh0bWxUb0VsLCBnZXRWYWxpZEltYWdlIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgVHJhY2ssIHsgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSB9IGZyb20gJy4vdHJhY2snXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QgZnJvbSAnLi9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCB7IEFydGlzdERhdGEsIFNwb3RpZnlJbWcgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY2xhc3MgQXJ0aXN0IGV4dGVuZHMgQ2FyZCB7XHJcbiAgYXJ0aXN0SWQ6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgZ2VucmVzOiBBcnJheTxzdHJpbmc+O1xyXG4gIGZvbGxvd2VyQ291bnQ6IHN0cmluZztcclxuICBleHRlcm5hbFVybDogc3RyaW5nO1xyXG4gIGltYWdlVXJsOiBzdHJpbmc7XHJcbiAgdG9wVHJhY2tzOiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IHVuZGVmaW5lZDtcclxuXHJcbiAgY29uc3RydWN0b3IgKGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZ2VucmVzOiBBcnJheTxzdHJpbmc+LCBmb2xsb3dlckNvdW50OiBzdHJpbmcsIGV4dGVybmFsVXJsOiBzdHJpbmcsIGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuYXJ0aXN0SWQgPSBpZFxyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5nZW5yZXMgPSBnZW5yZXNcclxuICAgIHRoaXMuZm9sbG93ZXJDb3VudCA9IGZvbGxvd2VyQ291bnRcclxuICAgIHRoaXMuZXh0ZXJuYWxVcmwgPSBleHRlcm5hbFVybFxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqICBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgYXJ0aXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgZ2V0QXJ0aXN0SHRtbCAoaWR4OiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0UHJlZml4fSR7aWR4fWBcclxuXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBsZXQgZ2VucmVMaXN0ID0gJydcclxuICAgIHRoaXMuZ2VucmVzLmZvckVhY2goKGdlbnJlKSA9PiB7XHJcbiAgICAgIGdlbnJlTGlzdCArPSAnPGxpPicgKyBnZW5yZSArICc8L2xpPidcclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdH0gJHtjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUlufVwiIGlkPVwiJHt0aGlzLmNhcmRJZH1cIj5cclxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNvbnRlbnR9XCI+XHJcbiAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiYXJ0aXN0LWJhc2VcIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9JHt0aGlzLmltYWdlVXJsfSBhbHQ9XCJBcnRpc3RcIi8+XHJcbiAgICAgICAgICAgIDxoMz4ke3RoaXMubmFtZX08L2gzPlxyXG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJnZW5yZXNcIj5cclxuICAgICAgICAgICAgICAke2dlbnJlTGlzdH1cclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIDwvaGVhZGVyPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrc0FyZWF9XCI+XHJcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuYXJ0aXN0VG9wVHJhY2tzfVwiPlxyXG4gICAgICAgICAgICAgIDxoZWFkZXI+XHJcbiAgICAgICAgICAgICAgICA8aDQ+VG9wIFRyYWNrczwvaDQ+XHJcbiAgICAgICAgICAgICAgPC9oZWFkZXI+XHJcbiAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsQmFyfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja0xpc3R9XCI+XHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2R1Y2VzIHRoZSBjYXJkIGVsZW1lbnQgb2YgdGhpcyBhcnRpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRBcnRpc3RDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSk6IE5vZGUge1xyXG4gICAgY29uc3QgaWQgPSBgJHtjb25maWcuQ1NTLklEcy5hcnRpc3RQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucmFua0NhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW5cclxuICAgIH0gJHthcHBlYXJDbGFzc31cIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3R9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEZyb250XHJcbiAgICAgICAgICAgICAgICAgIH1cIiAgdGl0bGU9XCJDbGljayB0byB2aWV3IG1vcmUgSW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlVXJsfVwiIGFsdD1cIkFsYnVtIENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIH1cIj4ke3RoaXMubmFtZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5Gb2xsb3dlcnM6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMuZm9sbG93ZXJDb3VudH08L3A+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRUb3BUcmFja3MgKCkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEFydGlzdFRvcFRyYWNrcyh0aGlzLmFydGlzdElkKSlcclxuICAgIGNvbnN0IHRyYWNrc0RhdGEgPSByZXMuZGF0YS50cmFja3NcclxuICAgIGNvbnN0IHRyYWNrT2JqcyA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPigpXHJcblxyXG4gICAgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSh0cmFja3NEYXRhLCB0cmFja09ianMpXHJcblxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB0cmFja09ianNcclxuICAgIHJldHVybiB0cmFja09ianNcclxuICB9XHJcblxyXG4gIGhhc0xvYWRlZFRvcFRyYWNrcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b3BUcmFja3MgIT09IHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQXJ0aXN0c0Zyb21EYXRhIChkYXRhczogQXJyYXk8QXJ0aXN0RGF0YT4sIGFydGlzdEFycjogQXJyYXk8QXJ0aXN0Pikge1xyXG4gIGRhdGFzLmZvckVhY2goKGRhdGE6IEFydGlzdERhdGEpID0+IHtcclxuICAgIGFydGlzdEFyci5wdXNoKFxyXG4gICAgICBuZXcgQXJ0aXN0KFxyXG4gICAgICAgIGRhdGEuaWQsXHJcbiAgICAgICAgZGF0YS5uYW1lLFxyXG4gICAgICAgIGRhdGEuZ2VucmVzLFxyXG4gICAgICAgIGRhdGEuZm9sbG93ZXJzLnRvdGFsLFxyXG4gICAgICAgIGRhdGEuZXh0ZXJuYWxfdXJscy5zcG90aWZ5LFxyXG4gICAgICAgIGRhdGEuaW1hZ2VzXHJcbiAgICAgIClcclxuICAgIClcclxuICB9KVxyXG4gIHJldHVybiBhcnRpc3RBcnJcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0XHJcbiIsImltcG9ydCB7IGNvbmZpZywgaXNFbGxpcHNpc0FjdGl2ZSwgZ2V0VGV4dFdpZHRoIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYXJkQWN0aW9uc0hhbmRsZXIge1xyXG4gIHN0b3JlZFNlbEVsczogQXJyYXk8RWxlbWVudD47XHJcbiAgY3VyclNjcm9sbGluZ0FuaW06IEFuaW1hdGlvbiB8IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChtYXhMZW5ndGg6IG51bWJlcikge1xyXG4gICAgdGhpcy5zdG9yZWRTZWxFbHMgPSBuZXcgQXJyYXkobWF4TGVuZ3RoKVxyXG4gICAgdGhpcy5jdXJyU2Nyb2xsaW5nQW5pbSA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKiBNYW5hZ2VzIHNlbGVjdGluZyBhIGNhcmQgYW5kIGRlc2VsZWN0aW5nIHRoZSBwcmV2aW91cyBzZWxlY3RlZCBvbmVcclxuICAgKiB3aGVuIGEgY2FyZHMgb24gY2xpY2sgZXZlbnQgbGlzdGVuZXIgaXMgdHJpZ2dlcmVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBzZWxDYXJkRWwgLSB0aGUgY2FyZCB0aGF0IGV4ZWN1dGVkIHRoaXMgZnVuY3Rpb24gd2hlbiBjbGlja2VkXHJcbiAgICogQHBhcmFtIHtBcnJheTxDYXJkPn0gY29yck9iakxpc3QgLSB0aGUgbGlzdCBvZiBvYmplY3RzIHRoYXQgY29udGFpbnMgb25lIHRoYXQgY29ycm9zcG9uZHMgdG8gdGhlIHNlbGVjdGVkIGNhcmQsXHJcbiAgICogZWFjaCAqKipvYmplY3QgbXVzdCBoYXZlIHRoZSBjYXJkSWQgYXR0cmlidXRlLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gZnVuY3Rpb24gdG8gcnVuIHdoZW4gc2VsZWN0ZWQgb2JqZWN0IGhhcyBjaGFuZ2VkXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBhbGxvd1Vuc2VsU2VsZWN0ZWQgLSB3aGV0aGVyIHRvIGFsbG93IHVuc2VsZWN0aW5nIG9mIHRoZSBzZWxlY3RlZCBjYXJkIGJ5IGNsaWNraW5nIG9uIGl0IGFnYWluXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSB1bnNlbGVjdFByZXZpb3VzIC0gd2hldGhlciB0byB1bnNlbGVjdCB0aGUgcHJldmlvdXNseSBzZWxlY3RlZCBjYXJkXHJcbiAgICovXHJcbiAgb25DYXJkQ2xpY2sgKFxyXG4gICAgc2VsQ2FyZEVsOiBFbGVtZW50LFxyXG4gICAgY29yck9iakxpc3Q6IEFycmF5PENhcmQ+LFxyXG4gICAgY2FsbGJhY2s6IEZ1bmN0aW9uIHwgbnVsbCxcclxuICAgIGFsbG93VW5zZWxTZWxlY3RlZDogYm9vbGVhbiA9IGZhbHNlLFxyXG4gICAgdW5zZWxlY3RQcmV2aW91czogYm9vbGVhbiA9IHRydWVcclxuICApIHtcclxuICAgIC8vIGlmIHRoZSBzZWxlY3RlZCBjYXJkIGlzIHNlbGVjdGVkLCBhbmQgd2UgY2FuIHVuc2VsZWN0IGl0LCBkbyBzby5cclxuICAgIGlmICh0aGlzLnN0b3JlZFNlbEVscy5pbmNsdWRlcyhzZWxDYXJkRWwpKSB7XHJcbiAgICAgIGlmIChhbGxvd1Vuc2VsU2VsZWN0ZWQpIHtcclxuICAgICAgICBjb25zdCBzZWxDYXJkID0gdGhpcy5zdG9yZWRTZWxFbHNbdGhpcy5zdG9yZWRTZWxFbHMuaW5kZXhPZihzZWxDYXJkRWwpXVxyXG4gICAgICAgIHNlbENhcmQuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgICAgdGhpcy5zdG9yZWRTZWxFbHMuc3BsaWNlKHRoaXMuc3RvcmVkU2VsRWxzLmluZGV4T2Yoc2VsQ2FyZEVsKSwgMSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8vIGdldCBjb3Jyb3Nwb25kaW5nIG9iamVjdCB1c2luZyB0aGUgY2FyZEVsIGlkXHJcbiAgICBjb25zdCBzZWxPYmogPSBjb3JyT2JqTGlzdC5maW5kKCh4KSA9PiB7XHJcbiAgICAgIGNvbnN0IHhDYXJkID0geCBhcyBDYXJkXHJcbiAgICAgIHJldHVybiB4Q2FyZC5nZXRDYXJkSWQoKSA9PT0gc2VsQ2FyZEVsLmlkXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGVycm9yIGlmIHRoZXJlIGlzIG5vIGNvcnJvc3BvbmRpbmcgb2JqZWN0XHJcbiAgICBpZiAoIXNlbE9iaikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgYFRoZXJlIGlzIG5vIGNvcnJvc3BvbmRpbmcgb2JqZWN0IHRvIHRoZSBzZWxlY3RlZCBjYXJkLCBtZWFuaW5nIHRoZSBpZCBvZiB0aGUgY2FyZCBlbGVtZW50IFxcXHJcbiAgICAgIGRvZXMgbm90IG1hdGNoIGFueSBvZiB0aGUgY29ycm9zcG9uZGluZyAnY2FyZElkJyBhdHRyaWJ0dWVzLiBFbnN1cmUgdGhhdCB0aGUgY2FyZElkIGF0dHJpYnV0ZSBcXFxyXG4gICAgICBpcyBhc3NpZ25lZCBhcyB0aGUgY2FyZCBlbGVtZW50cyBIVE1MICdpZCcgd2hlbiB0aGUgY2FyZCBpcyBjcmVhdGVkLmBcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVuc2VsZWN0IHRoZSBwcmV2aW91c2x5IHNlbGVjdGVkIGNhcmQgaWYgaXQgZXhpc3RzIGFuZCBpZiB3ZSBhcmUgYWxsb3dlZCB0b29cclxuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnN0b3JlZFNlbEVscykubGVuZ3RoID4gMCAmJiB1bnNlbGVjdFByZXZpb3VzKSB7XHJcbiAgICAgIGNvbnN0IHN0b3JlZEVsID0gdGhpcy5zdG9yZWRTZWxFbHMucG9wKClcclxuICAgICAgaWYgKHN0b3JlZEVsICE9PSB1bmRlZmluZWQpIHsgc3RvcmVkRWwuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBvbiBjbGljayBhZGQgdGhlICdzZWxlY3RlZCcgY2xhc3Mgb250byB0aGUgZWxlbWVudCB3aGljaCBydW5zIGEgdHJhbnNpdGlvblxyXG4gICAgc2VsQ2FyZEVsLmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5zdG9yZWRTZWxFbHMucHVzaChzZWxDYXJkRWwpXHJcbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xyXG4gICAgICBjYWxsYmFjayhzZWxPYmopXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogTWFuYWdlcyBhZGRpbmcgY2VydGFpbiBwcm9wZXJ0aWVzIHJlYWx0aW5nIHRvIHNjcm9sbGluZyB0ZXh0IHdoZW4gZW50ZXJpbmdcclxuICAgKiBhIGNhcmQgZWxlbWVudC4gV2UgYXNzdW1lIHRoZXJlIGlzIG9ubHkgb25lIHNjcm9sbGluZyB0ZXh0IG9uIHRoZSBjYXJkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbnRlcmluZ0NhcmRFbCAtIGVsZW1lbnQgeW91IGFyZSBlbnRlcmluZywgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBzY3JvbGxUZXh0T25DYXJkRW50ZXIgKGVudGVyaW5nQ2FyZEVsOiBFbGVtZW50KSB7XHJcbiAgICBjb25zdCBzY3JvbGxpbmdUZXh0ID0gZW50ZXJpbmdDYXJkRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIClbMF0gYXMgSFRNTEVsZW1lbnRcclxuICAgIGNvbnN0IHBhcmVudCA9IHNjcm9sbGluZ1RleHQucGFyZW50RWxlbWVudFxyXG5cclxuICAgIGlmIChpc0VsbGlwc2lzQWN0aXZlKHNjcm9sbGluZ1RleHQpKSB7XHJcbiAgICAgIHBhcmVudD8uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsTGVmdClcclxuICAgICAgc2Nyb2xsaW5nVGV4dC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXApXHJcbiAgICAgIHRoaXMucnVuU2Nyb2xsaW5nVGV4dEFuaW0oc2Nyb2xsaW5nVGV4dCwgZW50ZXJpbmdDYXJkRWwpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogU3RhcnRzIHRvIHNjcm9sbCB0ZXh0IGZyb20gbGVmdCB0byByaWdodC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gc2Nyb2xsaW5nVGV4dCAtIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdGV4dCB0aGF0IHdpbGwgc2Nyb2xsXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBjYXJkRWwgLSBjYXJkIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBydW5TY3JvbGxpbmdUZXh0QW5pbSAoc2Nyb2xsaW5nVGV4dDogRWxlbWVudCwgY2FyZEVsOiBFbGVtZW50KSB7XHJcbiAgICBjb25zdCBMSU5HRVJfQU1UID0gMjBcclxuICAgIGNvbnN0IGZvbnQgPSB3aW5kb3dcclxuICAgICAgLmdldENvbXB1dGVkU3R5bGUoc2Nyb2xsaW5nVGV4dCwgbnVsbClcclxuICAgICAgLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQnKVxyXG5cclxuICAgIGlmIChzY3JvbGxpbmdUZXh0LnRleHRDb250ZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2Nyb2xsaW5nIHRleHQgZWxlbWVudCBkb2VzIG5vdCBjb250YWluIGFueSB0ZXh0IGNvbnRlbnQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdXJyU2Nyb2xsaW5nQW5pbSA9IHNjcm9sbGluZ1RleHQuYW5pbWF0ZShcclxuICAgICAgW1xyXG4gICAgICAgIC8vIGtleWZyYW1lc1xyXG4gICAgICAgIHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgwcHgpJyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZVgoJHtcclxuICAgICAgICAgICAgLWdldFRleHRXaWR0aChzY3JvbGxpbmdUZXh0LnRleHRDb250ZW50LCBmb250KSAtIExJTkdFUl9BTVRcclxuICAgICAgICAgIH1weClgXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICB7XHJcbiAgICAgICAgLy8gdGltaW5nIG9wdGlvbnNcclxuICAgICAgICBkdXJhdGlvbjogNTAwMCxcclxuICAgICAgICBpdGVyYXRpb25zOiAxXHJcbiAgICAgIH1cclxuICAgIClcclxuXHJcbiAgICB0aGlzLmN1cnJTY3JvbGxpbmdBbmltLm9uZmluaXNoID0gKCkgPT4gdGhpcy5zY3JvbGxUZXh0T25DYXJkTGVhdmUoY2FyZEVsKVxyXG4gIH1cclxuXHJcbiAgLyoqIE1hbmFnZXMgcmVtb3ZpbmcgY2VydGFpbiBwcm9wZXJ0aWVzIHJlbGF0aW5nIHRvIHNjcm9sbGluZyB0ZXh0IG9uY2UgbGVhdmluZ1xyXG4gICAqIGEgY2FyZCBlbGVtZW50LiBXZSBhc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgc2Nyb2xsaW5nIHRleHQgb24gdGhlIGNhcmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0hUTUx9IGxlYXZpbmdDYXJkRWwgLSBlbGVtZW50IHlvdSBhcmUgbGVhdmluZywgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBzY3JvbGxUZXh0T25DYXJkTGVhdmUgKGxlYXZpbmdDYXJkRWw6IEVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHNjcm9sbGluZ1RleHQgPSBsZWF2aW5nQ2FyZEVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxpbmdUZXh0XHJcbiAgICApWzBdXHJcbiAgICBjb25zdCBwYXJlbnQgPSBzY3JvbGxpbmdUZXh0LnBhcmVudEVsZW1lbnRcclxuXHJcbiAgICBwYXJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbExlZnQpXHJcbiAgICBzY3JvbGxpbmdUZXh0LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcClcclxuICAgIHRoaXMuY3VyclNjcm9sbGluZ0FuaW0/LmNhbmNlbCgpXHJcbiAgfVxyXG5cclxuICBjbGVhclNlbGVjdGVkRWxzICgpIHtcclxuICAgIHRoaXMuc3RvcmVkU2VsRWxzLnNwbGljZSgwLCB0aGlzLnN0b3JlZFNlbEVscy5sZW5ndGgpXHJcbiAgfVxyXG5cclxuICBhZGRBbGxFdmVudExpc3RlbmVycyAoXHJcbiAgICBjYXJkczogQXJyYXk8RWxlbWVudD4sXHJcbiAgICBvYmpBcnI6IEFycmF5PENhcmQ+LFxyXG4gICAgY2xpY2tDYWxsQmFjazogbnVsbCB8ICgoc2VsT2JqOiB1bmtub3duKSA9PiB2b2lkKSxcclxuICAgIGFsbG93VW5zZWxlY3RlZDogYm9vbGVhbixcclxuICAgIHVuc2VsZWN0UHJldmlvdXM6IGJvb2xlYW5cclxuICApIHtcclxuICAgIHRoaXMuY2xlYXJTZWxlY3RlZEVscygpXHJcblxyXG4gICAgY2FyZHMuZm9yRWFjaCgodHJhY2tDYXJkKSA9PiB7XHJcbiAgICAgIHRyYWNrQ2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldnQpID0+IHtcclxuICAgICAgICBpZiAoKGV2dCEudGFyZ2V0IGFzIEhUTUxFbGVtZW50KT8uZ2V0QXR0cmlidXRlKCdkYXRhLXJlc3RyaWN0LWZsaXAtb24tY2xpY2snKSkge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub25DYXJkQ2xpY2soXHJcbiAgICAgICAgICB0cmFja0NhcmQsXHJcbiAgICAgICAgICBvYmpBcnIsXHJcbiAgICAgICAgICBjbGlja0NhbGxCYWNrLFxyXG4gICAgICAgICAgYWxsb3dVbnNlbGVjdGVkLFxyXG4gICAgICAgICAgdW5zZWxlY3RQcmV2aW91c1xyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgICApXHJcbiAgICAgIHRyYWNrQ2FyZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsVGV4dE9uQ2FyZEVudGVyKHRyYWNrQ2FyZClcclxuICAgICAgfSlcclxuICAgICAgdHJhY2tDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxUZXh0T25DYXJkTGVhdmUodHJhY2tDYXJkKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuIiwiY2xhc3MgQ2FyZCB7XHJcbiAgY2FyZElkOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuY2FyZElkID0gJydcclxuICB9XHJcblxyXG4gIGdldENhcmRJZCAoKSB7XHJcbiAgICBpZiAodGhpcy5jYXJkSWQgPT09ICdudWxsJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhcmQgaWQgd2FzIGFza2luZyB0byBiZSByZXRyaWV2ZWQgYnV0IGlzIG51bGwnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY2FyZElkXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYXJkXHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAwOSBOaWNob2xhcyBDLiBaYWthcy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gKi9cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIG5vZGUgaW4gYSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcbiAgZGF0YTogVDtcclxuICBuZXh0OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuICBwcmV2aW91czogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG91Ymx5TGlua2VkTGlzdE5vZGUuXHJcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIHN0b3JlIGluIHRoZSBub2RlLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yIChkYXRhOiBUKSB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkYXRhIHRoYXQgdGhpcyBub2RlIHN0b3Jlcy5cclxuICAgICAqIEBwcm9wZXJ0eSBkYXRhXHJcbiAgICAgKiBAdHlwZSAqXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZGF0YSA9IGRhdGFcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcG9pbnRlciB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gICAgICogQHByb3BlcnR5IG5leHRcclxuICAgICAqIEB0eXBlID9Eb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gICAgICovXHJcbiAgICB0aGlzLm5leHQgPSBudWxsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIHByZXZpb3VzIG5vZGUgaW4gdGhlIERvdWJseUxpbmtlZExpc3QuXHJcbiAgICAgKiBAcHJvcGVydHkgcHJldmlvdXNcclxuICAgICAqIEB0eXBlID9Eb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnByZXZpb3VzID0gbnVsbFxyXG4gIH1cclxufVxyXG4vKipcclxuICogQSBkb3VibHkgbGlua2VkIGxpc3QgaW1wbGVtZW50YXRpb24gaW4gSmF2YVNjcmlwdC5cclxuICogQGNsYXNzIERvdWJseUxpbmtlZExpc3RcclxuICovXHJcbmNsYXNzIERvdWJseUxpbmtlZExpc3Q8VD4ge1xyXG4gIGhlYWQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIHRhaWw6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG91Ymx5TGlua2VkTGlzdFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIC8vIHBvaW50ZXIgdG8gZmlyc3Qgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgdGhpcy5oZWFkID0gbnVsbFxyXG5cclxuICAgIC8vIHBvaW50ZXIgdG8gbGFzdCBub2RlIGluIHRoZSBsaXN0IHdoaWNoIHBvaW50cyB0byBudWxsXHJcbiAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmRzIHNvbWUgZGF0YSB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7VH0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICovXHJcbiAgYWRkIChkYXRhOiBUKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPihkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEJlY2F1c2UgdGhlcmUgYXJlIG5vIG5vZGVzIGluIHRoZSBsaXN0LCBqdXN0IHNldCB0aGVcclxuICAgICAgICogYHRoaXMuaGVhZGAgcG9pbnRlciB0byB0aGUgbmV3IG5vZGUuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBVbmxpa2UgaW4gYSBzaW5nbHkgbGlua2VkIGxpc3QsIHdlIGhhdmUgYSBkaXJlY3QgcmVmZXJlbmNlIHRvXHJcbiAgICAgICAqIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFNldCB0aGUgYG5leHRgIHBvaW50ZXIgb2YgdGhlXHJcbiAgICAgICAqIGN1cnJlbnQgbGFzdCBub2RlIHRvIGBuZXdOb2RlYCBpbiBvcmRlciB0byBhcHBlbmQgdGhlIG5ldyBkYXRhXHJcbiAgICAgICAqIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuIFRoZW4sIHNldCBgbmV3Tm9kZS5wcmV2aW91c2AgdG8gdGhlIGN1cnJlbnRcclxuICAgICAgICogdGFpbCB0byBlbnN1cmUgYmFja3dhcmRzIHRyYWNraW5nIHdvcmsuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAodGhpcy50YWlsICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50YWlsLm5leHQgPSBuZXdOb2RlXHJcbiAgICAgIH1cclxuICAgICAgbmV3Tm9kZS5wcmV2aW91cyA9IHRoaXMudGFpbFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBMYXN0LCByZXNldCBgdGhpcy50YWlsYCB0byBgbmV3Tm9kZWAgdG8gZW5zdXJlIHdlIGFyZSBzdGlsbFxyXG4gICAgICogdHJhY2tpbmcgdGhlIGxhc3Qgbm9kZSBjb3JyZWN0bHkuXHJcbiAgICAgKi9cclxuICAgIHRoaXMudGFpbCA9IG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc2VydHMgc29tZSBkYXRhIGludG8gdGhlIG1pZGRsZSBvZiB0aGUgbGlzdC4gVGhpcyBtZXRob2QgdHJhdmVyc2VzXHJcbiAgICogdGhlIGV4aXN0aW5nIGxpc3QgYW5kIHBsYWNlcyB0aGUgZGF0YSBpbiBhIG5ldyBub2RlIGF0IGEgc3BlY2lmaWMgaW5kZXguXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSBkYXRhLlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIHRoZSBpbmRleCBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGluc2VydEJlZm9yZSAoZGF0YTogVCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGUoZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogU3BlY2lhbCBjYXNlOiBpZiBgaW5kZXhgIGlzIGAwYCwgdGhlbiBubyB0cmF2ZXJzYWwgaXMgbmVlZGVkXHJcbiAgICAgKiBhbmQgd2UgbmVlZCB0byB1cGRhdGUgYHRoaXMuaGVhZGAgdG8gcG9pbnQgdG8gYG5ld05vZGVgLlxyXG4gICAgICovXHJcbiAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgLypcclxuICAgICAgICogRW5zdXJlIHRoZSBuZXcgbm9kZSdzIGBuZXh0YCBwcm9wZXJ0eSBpcyBwb2ludGVkIHRvIHRoZSBjdXJyZW50XHJcbiAgICAgICAqIGhlYWQuXHJcbiAgICAgICAqL1xyXG4gICAgICBuZXdOb2RlLm5leHQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBjdXJyZW50IGhlYWQncyBgcHJldmlvdXNgIHByb3BlcnR5IG5lZWRzIHRvIHBvaW50IHRvIHRoZSBuZXdcclxuICAgICAgICogbm9kZSB0byBlbnN1cmUgdGhlIGxpc3QgaXMgdHJhdmVyc2FibGUgYmFja3dhcmRzLlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbmV3Tm9kZVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogTm93IGl0J3Mgc2FmZSB0byBzZXQgYHRoaXMuaGVhZGAgdG8gdGhlIG5ldyBub2RlLCBlZmZlY3RpdmVseVxyXG4gICAgICAgKiBtYWtpbmcgdGhlIG5ldyBub2RlIHRoZSBmaXJzdCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAgICogdXNlZCBpbnNpZGUgb2YgdGhlIGxvb3AgYmVsb3cuIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG9cclxuICAgICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICAgKiBnb25lLiBUaGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gaW5zZXJ0IGludG8uXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHVzaW5nIGBuZXh0YCBwb2ludGVycywgYW5kIG1ha2VcclxuICAgICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkLiBXaGVuXHJcbiAgICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAgICogaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAgICovXHJcbiAgICAgIHdoaWxlIChjdXJyZW50Lm5leHQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgaXMgZWl0aGVyIHRoZSBub2RlIHRvIGluc2VydCB0aGUgbmV3IGRhdGFcclxuICAgICAgICogYmVmb3JlLCBvciB0aGUgbGFzdCBub2RlIGluIHRoZSBsaXN0LiBUaGUgb25seSB3YXkgdG8gdGVsbCBpcyBpZlxyXG4gICAgICAgKiBgaWAgaXMgc3RpbGwgbGVzcyB0aGFuIGBpbmRleGAsIHRoYXQgbWVhbnMgdGhlIGluZGV4IGlzIG91dCBvZiByYW5nZVxyXG4gICAgICAgKiBhbmQgYW4gZXJyb3Igc2hvdWxkIGJlIHRocm93bi5cclxuICAgICAgICovXHJcbiAgICAgIGlmIChpIDwgaW5kZXgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogSWYgY29kZSBjb250aW51ZXMgdG8gZXhlY3V0ZSBoZXJlLCBpdCBtZWFucyBgY3VycmVudGAgaXMgdGhlIG5vZGVcclxuICAgICAgICogdG8gaW5zZXJ0IG5ldyBkYXRhIGJlZm9yZS5cclxuICAgICAgICpcclxuICAgICAgICogRmlyc3QsIGluc2VydCBgbmV3Tm9kZWAgYWZ0ZXIgYGN1cnJlbnQucHJldmlvdXNgIGJ5IHVwZGF0aW5nXHJcbiAgICAgICAqIGBjdXJyZW50LnByZXZpb3VzLm5leHRgIGFuZCBgbmV3Tm9kZS5wcmV2aW91c2AuXHJcbiAgICAgICAqL1xyXG4gICAgICBjdXJyZW50IS5wcmV2aW91cyEubmV4dCA9IG5ld05vZGVcclxuICAgICAgbmV3Tm9kZSEucHJldmlvdXMgPSBjdXJyZW50LnByZXZpb3VzXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBOZXh0LCBpbnNlcnQgYGN1cnJlbnRgIGFmdGVyIGBuZXdOb2RlYCBieSB1cGRhdGluZyBgbmV3Tm9kZS5uZXh0YCBhbmRcclxuICAgICAgICogYGN1cnJlbnQucHJldmlvdXNgLlxyXG4gICAgICAgKi9cclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gY3VycmVudFxyXG4gICAgICBjdXJyZW50LnByZXZpb3VzID0gbmV3Tm9kZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBzb21lIGRhdGEgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBsaXN0LiBUaGlzIG1ldGhvZCB0cmF2ZXJzZXNcclxuICAgKiB0aGUgZXhpc3RpbmcgbGlzdCBhbmQgcGxhY2VzIHRoZSBkYXRhIGluIGEgbmV3IG5vZGUgYWZ0ZXIgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBhZnRlciB3aGljaCB0byBpbnNlcnQgdGhlIGRhdGEuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGluZGV4IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgaW5zZXJ0QWZ0ZXIgKGRhdGE6IFQsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlKGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAqL1xyXG4gICAgbGV0IGkgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHNpbWlsYXIgdG8gdGhlIGBhZGQoKWAgbWV0aG9kLCBidXQgbWFrZVxyXG4gICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGVcclxuICAgICAqIHRoZSBgcHJldmlvdXNgIHBvaW50ZXIgaW4gYWRkaXRpb24gdG8gYGN1cnJlbnRgLiBXaGVuXHJcbiAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgKiBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIGlzIGVpdGhlciB0aGUgbm9kZSB0byBpbnNlcnQgdGhlIG5ldyBkYXRhXHJcbiAgICAgKiBiZWZvcmUsIG9yIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFRoZSBvbmx5IHdheSB0byB0ZWxsIGlzIGlmXHJcbiAgICAgKiBgaWAgaXMgc3RpbGwgbGVzcyB0aGFuIGBpbmRleGAsIHRoYXQgbWVhbnMgdGhlIGluZGV4IGlzIG91dCBvZiByYW5nZVxyXG4gICAgICogYW5kIGFuIGVycm9yIHNob3VsZCBiZSB0aHJvd24uXHJcbiAgICAgKi9cclxuICAgIGlmIChpIDwgaW5kZXgpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGNvZGUgY29udGludWVzIHRvIGV4ZWN1dGUgaGVyZSwgaXQgbWVhbnMgYGN1cnJlbnRgIGlzIHRoZSBub2RlXHJcbiAgICAgKiB0byBpbnNlcnQgbmV3IGRhdGEgYWZ0ZXIuXHJcbiAgICAgKi9cclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IGBjdXJyZW50YCBpcyB0aGUgdGFpbCwgc28gcmVzZXQgYHRoaXMudGFpbGBcclxuICAgIGlmICh0aGlzLnRhaWwgPT09IGN1cnJlbnQpIHtcclxuICAgICAgdGhpcy50YWlsID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogT3RoZXJ3aXNlLCBpbnNlcnQgYG5ld05vZGVgIGJlZm9yZSBgY3VycmVudC5uZXh0YCBieSB1cGRhdGluZ1xyXG4gICAgICAgKiBgY3VycmVudC5uZXh0LnByZXZpb3VzYCBhbmQgYG5ld05vZGUubm9kZWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IG5ld05vZGVcclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gY3VycmVudCEubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBOZXh0LCBpbnNlcnQgYG5ld05vZGVgIGFmdGVyIGBjdXJyZW50YCBieSB1cGRhdGluZyBgbmV3Tm9kZS5wcmV2aW91c2AgYW5kXHJcbiAgICAgKiBgY3VycmVudC5uZXh0YC5cclxuICAgICAqL1xyXG4gICAgbmV3Tm9kZS5wcmV2aW91cyA9IGN1cnJlbnRcclxuICAgIGN1cnJlbnQhLm5leHQgPSBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIGRhdGEgaW4gdGhlIGdpdmVuIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgbm9kZSB3aG9zZSBkYXRhXHJcbiAgICogICAgICBzaG91bGQgYmUgcmV0dXJuZWQuXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBkYXRhIGluIHRoZSBcImRhdGFcIiBwb3J0aW9uIG9mIHRoZSBnaXZlbiBub2RlXHJcbiAgICogICAgICBvciB1bmRlZmluZWQgaWYgdGhlIG5vZGUgZG9lc24ndCBleGlzdC5cclxuICAgKi9cclxuICBnZXQgKGluZGV4OiBudW1iZXIsIGFzTm9kZTogYm9vbGVhbik6IFQgfCBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcbiAgICAvLyBlbnN1cmUgYGluZGV4YCBpcyBhIHBvc2l0aXZlIHZhbHVlXHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBpID0gMFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMsIGJ1dCBtYWtlIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueVxyXG4gICAgICAgKiBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZCBhbmQgdXBkYXRlIHRoZSBgcHJldmlvdXNgIHBvaW50ZXIgaW5cclxuICAgICAgICogYWRkaXRpb24gdG8gYGN1cnJlbnRgLiBXaGVuIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFuc1xyXG4gICAgICAgKiB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAgICovXHJcbiAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgICAgICBpKytcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIG1pZ2h0IGJlIG51bGwgaWYgd2UndmUgZ29uZSBwYXN0IHRoZVxyXG4gICAgICAgKiBlbmQgb2YgdGhlIGxpc3QuIEluIHRoYXQgY2FzZSwgd2UgcmV0dXJuIGB1bmRlZmluZWRgIHRvIGluZGljYXRlXHJcbiAgICAgICAqIHRoYXQgdGhlIG5vZGUgYXQgYGluZGV4YCB3YXMgbm90IGZvdW5kLiBJZiBgY3VycmVudGAgaXMgbm90XHJcbiAgICAgICAqIGBudWxsYCwgdGhlbiBpdCdzIHNhZmUgdG8gcmV0dXJuIGBjdXJyZW50LmRhdGFgLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgICBpZiAoYXNOb2RlKSB7XHJcbiAgICAgICAgICByZXR1cm4gY3VycmVudFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbmRleCAke2luZGV4fSBvdXQgb2YgcmFuZ2VgKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW5kZXggJHtpbmRleH0gb3V0IG9mIHJhbmdlYClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgaW5kZXggb2YgdGhlIGRhdGEgaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIHNlYXJjaCBmb3IuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGUgZGF0YSBpbiB0aGUgbGlzdFxyXG4gICAqICAgICAgb3IgLTEgaWYgbm90IGZvdW5kLlxyXG4gICAqL1xyXG4gIGluZGV4T2YgKGRhdGE6IFQpOiBudW1iZXIge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaW5kZXhgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkXHJcbiAgICAgKiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgaW5kZXggPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzIGBkYXRhYC5cclxuICAgICAqIElmIGEgbWF0Y2ggaXMgZm91bmQsIGl0IHJldHVybnMgYGluZGV4YCBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKGN1cnJlbnQuZGF0YSA9PT0gZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hlcmUgd2UgYXJlXHJcbiAgICAgIGluZGV4KytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiAtMSBhcyB0aGUgXCJub3QgZm91bmRcIiB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgcmV0dXJuIC0xXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBpdGVtIHRoYXQgbWF0Y2hlcyBhIGdpdmVuIGZ1bmN0aW9uLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1hdGNoZXIgQSBmdW5jdGlvbiByZXR1cm5pbmcgdHJ1ZSB3aGVuIGFuIGl0ZW0gbWF0Y2hlc1xyXG4gICAqICAgICAgYW5kIGZhbHNlIHdoZW4gYW4gaXRlbSBkb2Vzbid0IG1hdGNoLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZmlyc3QgaXRlbSB0aGF0IHJldHVybnMgdHJ1ZSBmcm9tIHRoZSBtYXRjaGVyLCB1bmRlZmluZWRcclxuICAgKiAgICAgIGlmIG5vIGl0ZW1zIG1hdGNoLlxyXG4gICAqL1xyXG4gIGZpbmQgKG1hdGNoZXI6IChhcmcwOiBUKSA9PiBib29sZWFuLCBhc05vZGUgPSBmYWxzZSkgOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IFQge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGlzIGxvb3AgY2hlY2tzIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCB0byBzZWUgaWYgaXQgbWF0Y2hlcy5cclxuICAgICAqIElmIGEgbWF0Y2ggaXMgZm91bmQsIGl0IHJldHVybnMgdGhlIGRhdGEgaW1tZWRpYXRlbHksIGV4aXRpbmcgdGhlXHJcbiAgICAgKiBsb29wIGJlY2F1c2UgdGhlcmUncyBubyByZWFzb24gdG8ga2VlcCBzZWFyY2hpbmcuIFRoZSBzZWFyY2hcclxuICAgICAqIGNvbnRpbnVlcyB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBub2RlcyB0byBzZWFyY2ggKHdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCkuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGlmIChtYXRjaGVyKGN1cnJlbnQuZGF0YSkpIHtcclxuICAgICAgICBpZiAoYXNOb2RlKSB7XHJcbiAgICAgICAgICByZXR1cm4gY3VycmVudFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIGB1bmRlZmluZWRgIGFzIHRoZVxyXG4gICAgICogXCJub3QgZm91bmRcIiB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ05vIG1hdGNoaW5nIGRhdGEgZm91bmQnKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWF0Y2hlciBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIHdoZW4gYW4gaXRlbSBtYXRjaGVzXHJcbiAgICogICAgICBhbmQgZmFsc2Ugd2hlbiBhbiBpdGVtIGRvZXNuJ3QgbWF0Y2guXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpdGVtIHRoYXQgbWF0Y2hlcyBhIGdpdmVuIGZ1bmN0aW9uXHJcbiAgICogICAgICBvciAtMSBpZiB0aGVyZSBhcmUgbm8gbWF0Y2hpbmcgaXRlbXMuXHJcbiAgICovXHJcbiAgZmluZEluZGV4IChtYXRjaGVyOiAoYXJnMDogVCkgPT4gYm9vbGVhbik6IG51bWJlciB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaW5kZXhgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkXHJcbiAgICAgKiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgaW5kZXggPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgaW5kZXggaW1tZWRpYXRlbHksIGV4aXRpbmcgdGhlXHJcbiAgICAgKiBsb29wIGJlY2F1c2UgdGhlcmUncyBubyByZWFzb24gdG8ga2VlcCBzZWFyY2hpbmcuIFRoZSBzZWFyY2hcclxuICAgICAqIGNvbnRpbnVlcyB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBub2RlcyB0byBzZWFyY2ggKHdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCkuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGlmIChtYXRjaGVyKGN1cnJlbnQuZGF0YSkpIHtcclxuICAgICAgICByZXR1cm4gaW5kZXhcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvLyBrZWVwIHRyYWNrIG9mIHdoZXJlIHdlIGFyZVxyXG4gICAgICBpbmRleCsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gLTEgYXMgdGhlXHJcbiAgICAgKiBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gLTFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIG5vZGUgZnJvbSB0aGUgZ2l2ZW4gbG9jYXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBub2RlIHRvIHJlbW92ZS5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGRhdGEgaW4gdGhlIGdpdmVuIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIGluZGV4IGlzIG91dCBvZiByYW5nZS5cclxuICAgKi9cclxuICByZW1vdmUgKGluZGV4OiBudW1iZXIpIDogVCB7XHJcbiAgICAvLyBzcGVjaWFsIGNhc2VzOiBubyBub2RlcyBpbiB0aGUgbGlzdCBvciBgaW5kZXhgIGlzIG5lZ2F0aXZlXHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsIHx8IGluZGV4IDwgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IHJlbW92aW5nIHRoZSBmaXJzdCBub2RlXHJcbiAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgLy8gc3RvcmUgdGhlIGRhdGEgZnJvbSB0aGUgY3VycmVudCBoZWFkXHJcbiAgICAgIGNvbnN0IGRhdGE6IFQgPSB0aGlzLmhlYWQuZGF0YVxyXG5cclxuICAgICAgLy8ganVzdCByZXBsYWNlIHRoZSBoZWFkIHdpdGggdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICB0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV4dFxyXG5cclxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiB0aGVyZSB3YXMgb25seSBvbmUgbm9kZSwgc28gYWxzbyByZXNldCBgdGhpcy50YWlsYFxyXG4gICAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50YWlsID0gbnVsbFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaGVhZC5wcmV2aW91cyA9IG51bGxcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHRoZSBkYXRhIGF0IHRoZSBwcmV2aW91cyBoZWFkIG9mIHRoZSBsaXN0XHJcbiAgICAgIHJldHVybiBkYXRhXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgbGV0IGkgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHNpbWlsYXIgdG8gdGhlIGBnZXQoKWAgbWV0aG9kLCBidXQgbWFrZVxyXG4gICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkLiBXaGVuXHJcbiAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgKiByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGluY3JlbWVudCB0aGUgY291bnRcclxuICAgICAgaSsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGBjdXJyZW50YCBpc24ndCBgbnVsbGAsIHRoZW4gdGhhdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbm9kZVxyXG4gICAgICogdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAvLyBza2lwIG92ZXIgdGhlIG5vZGUgdG8gcmVtb3ZlXHJcbiAgICAgIGN1cnJlbnQhLnByZXZpb3VzIS5uZXh0ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBJZiB3ZSBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdCwgdGhlbiB1cGRhdGUgYHRoaXMudGFpbGAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIElmIHdlIGFyZSBub3QgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdCwgdGhlbiB1cGRhdGUgdGhlIGJhY2t3YXJkc1xyXG4gICAgICAgKiBwb2ludGVyIGZvciBgY3VycmVudC5uZXh0YCB0byBwcmVzZXJ2ZSByZXZlcnNlIHRyYXZlcnNhbC5cclxuICAgICAgICovXHJcbiAgICAgIGlmICh0aGlzLnRhaWwgPT09IGN1cnJlbnQpIHtcclxuICAgICAgICB0aGlzLnRhaWwgPSBjdXJyZW50LnByZXZpb3VzXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VycmVudCEubmV4dCEucHJldmlvdXMgPSBjdXJyZW50LnByZXZpb3VzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJldHVybiB0aGUgdmFsdWUgdGhhdCB3YXMganVzdCByZW1vdmVkIGZyb20gdGhlIGxpc3RcclxuICAgICAgcmV0dXJuIGN1cnJlbnQuZGF0YVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiB3ZSd2ZSBtYWRlIGl0IHRoaXMgZmFyLCBpdCBtZWFucyBgaW5kZXhgIGlzIGEgdmFsdWUgdGhhdFxyXG4gICAgICogZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdCwgc28gdGhyb3cgYW4gZXJyb3IuXHJcbiAgICAgKi9cclxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgbm9kZXMgZnJvbSB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKi9cclxuICBjbGVhciAoKTogdm9pZCB7XHJcbiAgICAvLyBqdXN0IHJlc2V0IGJvdGggdGhlIGhlYWQgYW5kIHRhaWwgcG9pbnRlciB0byBudWxsXHJcbiAgICB0aGlzLmhlYWQgPSBudWxsXHJcbiAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge251bWJlcn0gVGhlIG51bWJlciBvZiBub2RlcyBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBnZXQgc2l6ZSAoKTogbnVtYmVyIHtcclxuICAgIC8vIHNwZWNpYWwgY2FzZTogdGhlIGxpc3QgaXMgZW1wdHlcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIDBcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjb3VudGAgdmFyaWFibGUgaXMgdXNlZCB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmVcclxuICAgICAqIGJlZW4gdmlzaXRlZCBpbnNpZGUgdGhlIGxvb3AgYmVsb3cuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdGhpc1xyXG4gICAgICogaXMgdGhlIHZhbHVlIHRvIHJldHVybiBmcm9tIHRoaXMgbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBsZXQgY291bnQgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoYXQgbWVhbnMgd2UncmUgbm90IHlldCBhdCB0aGVcclxuICAgICAqIGVuZCBvZiB0aGUgbGlzdCwgc28gYWRkaW5nIDEgdG8gYGNvdW50YCBhbmQgdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgY291bnQrK1xyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCwgdGhlIGxvb3AgaXMgZXhpdGVkIGF0IHRoZSB2YWx1ZSBvZiBgY291bnRgXHJcbiAgICAgKiBpcyB0aGUgbnVtYmVyIG9mIG5vZGVzIHRoYXQgd2VyZSBjb3VudGVkIGluIHRoZSBsb29wLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gY291bnRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkZWZhdWx0IGl0ZXJhdG9yIGZvciB0aGUgY2xhc3MuXHJcbiAgICogQHJldHVybnMge0l0ZXJhdG9yfSBBbiBpdGVyYXRvciBmb3IgdGhlIGNsYXNzLlxyXG4gICAqL1xyXG4gIFtTeW1ib2wuaXRlcmF0b3JdICgpIHtcclxuICAgIHJldHVybiB0aGlzLnZhbHVlcygpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gaXRlcmF0b3IgdGhhdCByZXR1cm5zIGVhY2ggbm9kZSBpbiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7R2VuZXJhdG9yfSBBbiBpdGVyYXRvciBvbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICAqIHZhbHVlcyAoKTogR2VuZXJhdG9yPFQsIHZvaWQsIHVua25vd24+IHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhlcmUgaXMgYSBwaWVjZSBvZiBkYXRhXHJcbiAgICAgKiB0byB5aWVsZC5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgeWllbGQgY3VycmVudC5kYXRhXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpdGVyYXRvciB0aGF0IHJldHVybnMgZWFjaCBub2RlIGluIHRoZSBsaXN0IGluIHJldmVyc2Ugb3JkZXIuXHJcbiAgICogQHJldHVybnMge0dlbmVyYXRvcn0gQW4gaXRlcmF0b3Igb24gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgKiByZXZlcnNlICgpOiBHZW5lcmF0b3I8VCwgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSB0YWlsIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMudGFpbFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGVyZSBpcyBhIHBpZWNlIG9mIGRhdGFcclxuICAgICAqIHRvIHlpZWxkLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICB5aWVsZCBjdXJyZW50LmRhdGFcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoZSBsaXN0IGludG8gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXHJcbiAgICogQHJldHVybnMge3N0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgdG9TdHJpbmcgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gWy4uLnRoaXNdLnRvU3RyaW5nKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoZSBkb3VibHkgbGlua2VkIGxpc3QgdG8gYW4gYXJyYXkuXHJcbiAgICogQHJldHVybnMge0FycmF5PFQ+fSBBbiBhcnJheSBvZiB0aGUgZGF0YSBmcm9tIHRoZSBsaW5rZWQgbGlzdC5cclxuICAgKi9cclxuICB0b0FycmF5ICgpOiBBcnJheTxUPiB7XHJcbiAgICByZXR1cm4gWy4uLnRoaXNdXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEb3VibHlMaW5rZWRMaXN0XHJcbmV4cG9ydCBmdW5jdGlvblxyXG5hcnJheVRvRG91Ymx5TGlua2VkTGlzdCA8VD4gKGFycjogQXJyYXk8VD4pIHtcclxuICBjb25zdCBsaXN0ID0gbmV3IERvdWJseUxpbmtlZExpc3Q8VD4oKVxyXG4gIGFyci5mb3JFYWNoKChkYXRhKSA9PiB7XHJcbiAgICBsaXN0LmFkZChkYXRhKVxyXG4gIH0pXHJcblxyXG4gIHJldHVybiBsaXN0XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgcHJvbWlzZUhhbmRsZXIsXHJcbiAgbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyxcclxuICBodG1sVG9FbCxcclxuICBzaHVmZmxlXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgeyBhcnJheVRvRG91Ymx5TGlua2VkTGlzdCwgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IFBsYXlhYmxlRXZlbnRBcmcgZnJvbSAnLi9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MnXHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnXHJcbmltcG9ydCBFdmVudEFnZ3JlZ2F0b3IgZnJvbSAnLi9wdWJzdWIvYWdncmVnYXRvcidcclxuaW1wb3J0IHsgSVBsYXlhYmxlIH0gZnJvbSAnLi4vLi4vdHlwZXMnXHJcbmltcG9ydCBTcG90aWZ5UGxheWJhY2tFbGVtZW50IGZyb20gJy4vc3BvdGlmeS1wbGF5YmFjay1lbGVtZW50J1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZFZvbHVtZSAoKSB7XHJcbiAgY29uc3QgeyByZXMsIGVyciB9ID0gYXdhaXQgcHJvbWlzZUhhbmRsZXIoYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldFBsYXllclZvbHVtZURhdGEpKVxyXG5cclxuICBpZiAoZXJyKSB7XHJcbiAgICByZXR1cm4gMFxyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gcmVzIS5kYXRhXHJcbiAgfVxyXG59XHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVWb2x1bWUgKHZvbHVtZTogc3RyaW5nKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXllclZvbHVtZURhdGEodm9sdW1lKSkpXHJcbn1cclxuZXhwb3J0IGNvbnN0IHBsYXllclB1YmxpY1ZhcnMgPSB7XHJcbiAgaXNTaHVmZmxlOiBmYWxzZVxyXG59XHJcbmNsYXNzIFNwb3RpZnlQbGF5YmFjayB7XHJcbiAgcHJpdmF0ZSBwbGF5ZXI6IGFueTtcclxuICAvLyBjb250cm9scyB0aW1pbmcgb2YgYXN5bmMgYWN0aW9ucyB3aGVuIHdvcmtpbmcgd2l0aCB3ZWJwbGF5ZXIgc2RrXHJcbiAgcHJpdmF0ZSBpc0V4ZWN1dGluZ0FjdGlvbjogYm9vbGVhbjtcclxuICBwcml2YXRlIGRldmljZV9pZDogc3RyaW5nO1xyXG4gIHB1YmxpYyBzZWxQbGF5aW5nOiB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwgfCBFbGVtZW50XHJcbiAgICAgIHRyYWNrX3VyaTogc3RyaW5nXHJcbiAgICAgIC8vIHRoaXMgbm9kZSBtYXkgYmUgYSBzaHVmZmxlZCBvciB1bnNodWZmbGVkIG5vZGVcclxuICAgICAgcGxheWFibGVOb2RlOiBudWxsIHwgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgICAvLyB0aGlzIGFycmF5IGlzIGFsd2F5cyBpbiBzdGFuZGFyZCBvcmRlciBhbmQgbmV2ZXIgc2h1ZmZsZWQuXHJcbiAgICAgIHBsYXlhYmxlQXJyOiBudWxsIHwgQXJyYXk8SVBsYXlhYmxlPlxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTdGF0ZUludGVydmFsOiBOb2RlSlMuVGltZW91dCB8IG51bGw7XHJcbiAgcHJpdmF0ZSB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudDtcclxuICBwcml2YXRlIHBsYXllcklzUmVhZHk6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSB3YXNJblNodWZmbGUgPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICB0aGlzLnBsYXllciA9IG51bGxcclxuICAgIHRoaXMuZGV2aWNlX2lkID0gJydcclxuICAgIHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCA9IG51bGxcclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcgPSB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgIHRyYWNrX3VyaTogJycsXHJcbiAgICAgIHBsYXlhYmxlTm9kZTogbnVsbCxcclxuICAgICAgcGxheWFibGVBcnI6IG51bGxcclxuICAgIH1cclxuICAgIHRoaXMucGxheWVySXNSZWFkeSA9IGZhbHNlXHJcbiAgICB0aGlzLl9sb2FkV2ViUGxheWVyKClcclxuXHJcbiAgICAvLyBwYXNzIGl0IHRoZSBcInRoaXMuXCIgYXR0cmlidXRlcyBpbiB0aGlzIHNjb3BlIGJlY2F1c2Ugd2hlbiBhIGZ1bmN0aW9uIGlzIGNhbGxlZCBmcm9tIGEgZGlmZmVyZW50IGNsYXNzIHRoZSBcInRoaXMuXCIgYXR0cmlidXRlcyBhcmUgdW5kZWZpbmVkLlxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbCA9IG5ldyBTcG90aWZ5UGxheWJhY2tFbGVtZW50KClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0Vm9sdW1lIChwZXJjZW50YWdlOiBudW1iZXIsIHBsYXllcjogYW55LCBzYXZlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IG5ld1ZvbHVtZSA9IHBlcmNlbnRhZ2UgLyAxMDBcclxuICAgIHBsYXllci5zZXRWb2x1bWUobmV3Vm9sdW1lKVxyXG5cclxuICAgIGlmIChzYXZlKSB7XHJcbiAgICAgIHNhdmVWb2x1bWUobmV3Vm9sdW1lLnRvU3RyaW5nKCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHRpbWUgc2hvd24gd2hlbiBzZWVraW5nLlxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFRoZSBwZXJjZW50IHRoYXQgdGhlIGJhciBoYXMgZmlsbGVkIHdpdGggcmVzcGVjdCB0byB0aGUgZW50aXJlIGJhclxyXG4gICAqIEBwYXJhbSB3ZWJQbGF5ZXJFbCBUaGUgd2VicGxheWVyIGVsZW1lbnQgdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblNlZWtpbmcgKHBlcmNlbnRhZ2U6IG51bWJlciwgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQpIHtcclxuICAgIC8vIGdldCB0aGUgcG9zaXRpb24gYnkgdXNpbmcgdGhlIHBlcmNlbnQgdGhlIHByb2dyZXNzIGJhci5cclxuICAgIGNvbnN0IHNlZWtQb3NpdGlvbiA9IHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4ICogKHBlcmNlbnRhZ2UgLyAxMDApXHJcbiAgICBpZiAod2ViUGxheWVyRWwuY3VyclRpbWUgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgdGltZSBlbGVtZW50IGlzIG51bGwnKVxyXG4gICAgfVxyXG4gICAgLy8gdXBkYXRlIHRoZSB0ZXh0IGNvbnRlbnQgdG8gc2hvdyB0aGUgdGltZSB0aGUgdXNlciB3aWxsIGJlIHNlZWtpbmcgdG9vIG9ubW91c2V1cC5cclxuICAgIHdlYlBsYXllckVsLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhzZWVrUG9zaXRpb24pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgc2Vla2luZyBhY3Rpb24gYmVnaW5zXHJcbiAgICogQHBhcmFtIHBsYXllciBUaGUgc3BvdGlmeSBzZGsgcGxheWVyIHdob3NlIHN0YXRlIHdlIHdpbGwgdXNlIHRvIGNoYW5nZSB0aGUgc29uZydzIHByb2dyZXNzIGJhcidzIG1heCB2YWx1ZSB0byB0aGUgZHVyYXRpb24gb2YgdGhlIHNvbmcuXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIFRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdGhhdCB3aWxsIGFsbG93IHVzIHRvIG1vZGlmeSB0aGUgcHJvZ3Jlc3MgYmFycyBtYXggYXR0cmlidXRlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25TZWVrU3RhcnQgKHBsYXllcjogYW55LCB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudCkge1xyXG4gICAgcGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IGR1cmF0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICdVc2VyIGlzIG5vdCBwbGF5aW5nIG11c2ljIHRocm91Z2ggdGhlIFdlYiBQbGF5YmFjayBTREsnXHJcbiAgICAgICAgKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIC8vIHdoZW4gZmlyc3Qgc2Vla2luZywgdXBkYXRlIHRoZSBtYXggYXR0cmlidXRlIHdpdGggdGhlIGR1cmF0aW9uIG9mIHRoZSBzb25nIGZvciB1c2Ugd2hlbiBzZWVraW5nLlxyXG4gICAgICB3ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLm1heCA9IHN0YXRlLmR1cmF0aW9uXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gcnVuIHdoZW4geW91IHdpc2ggdG8gc2VlayB0byBhIGNlcnRhaW4gcG9zaXRpb24gaW4gYSBzb25nLlxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFRoZSBwZXJjZW50IHRoYXQgdGhlIGJhciBoYXMgZmlsbGVkIHdpdGggcmVzcGVjdCB0byB0aGUgZW50aXJlIGJhclxyXG4gICAqIEBwYXJhbSBwbGF5ZXIgdGhlIHNwb3RpZnkgc2RrIHBsYXllciB0aGF0IHdpbGwgc2VlayB0aGUgc29uZyB0byBhIGdpdmVuIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2Vla1NvbmcgKHBlcmNlbnRhZ2U6IG51bWJlciwgcGxheWVyOiBhbnksIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24pIHtcclxuICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuICAgICAgLy8gb2J0YWluIHRoZSBmaW5hbCBwb3NpdGlvbiB0aGUgdXNlciB3aXNoZXMgdG8gc2VlayBvbmNlIG1vdXNlIGlzIHVwLlxyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IChwZXJjZW50YWdlIC8gMTAwKSAqIHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4XHJcblxyXG4gICAgICAvLyBzZWVrIHRvIHRoZSBjaG9zZW4gcG9zaXRpb24uXHJcbiAgICAgIHBsYXllci5zZWVrKHBvc2l0aW9uKS50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgX2xvYWRXZWJQbGF5ZXIgKCkge1xyXG4gICAgLy8gbG9hZCB0aGUgdXNlcnMgc2F2ZWQgdm9sdW1lIGlmIHRoZXJlIGlzbnQgdGhlbiBsb2FkIDAuNCBhcyBkZWZhdWx0LlxyXG4gICAgY29uc3Qgdm9sdW1lID0gYXdhaXQgbG9hZFZvbHVtZSgpXHJcblxyXG4gICAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0QWNjZXNzVG9rZW4gfSksIChyZXMpID0+IHtcclxuICAgICAgLy8gdGhpcyB0YWtlcyB0b28gbG9uZyBhbmQgc3BvdGlmeSBzZGsgbmVlZHMgd2luZG93Lm9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgdG8gYmUgZGVmaW5lZCBxdWlja2VyLlxyXG4gICAgICBjb25zdCBOT19DT05URU5UID0gMjA0XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSBOT19DT05URU5UIHx8IHJlcy5kYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5TcG90aWZ5KSB7XHJcbiAgICAgICAgLy8gaWYgdGhlIHNwb3RpZnkgc2RrIGlzIGFscmVhZHkgZGVmaW5lZCBzZXQgcGxheWVyIHdpdGhvdXQgc2V0dGluZyBvblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5IG1lYW5pbmcgdGhlIHdpbmRvdzogV2luZG93IGlzIGluIGEgZGlmZmVyZW50IHNjb3BlXHJcbiAgICAgICAgLy8gdXNlIHdpbmRvdy5TcG90aWZ5LlBsYXllciBhcyBzcG90aWZ5IG5hbWVzcGFjZSBpcyBkZWNsYXJlZCBpbiB0aGUgV2luZG93IGludGVyZmFjZSBhcyBwZXIgRGVmaW5pdGVseVR5cGVkIC0+IHNwb3RpZnktd2ViLXBsYXliYWNrLXNkayAtPiBpbmRleC5kLnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9EZWZpbml0ZWx5VHlwZWQvRGVmaW5pdGVseVR5cGVkL3RyZWUvbWFzdGVyL3R5cGVzL3Nwb3RpZnktd2ViLXBsYXliYWNrLXNka1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZvbHVtZTogdm9sdW1lXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLl9hZGRMaXN0ZW5lcnModm9sdW1lKVxyXG4gICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIHBsYXllciFcclxuICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvZiBzcG90aWZ5IHNkayBpcyB1bmRlZmluZWRcclxuICAgICAgICB3aW5kb3cub25TcG90aWZ5V2ViUGxheWJhY2tTREtSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAgIC8vIGlmIGdldHRpbmcgdG9rZW4gd2FzIHN1Y2Nlc2Z1bCBjcmVhdGUgc3BvdGlmeSBwbGF5ZXIgdXNpbmcgdGhlIHdpbmRvdyBpbiB0aGlzIHNjb3BlXHJcbiAgICAgICAgICB0aGlzLnBsYXllciA9IG5ldyB3aW5kb3cuU3BvdGlmeS5QbGF5ZXIoe1xyXG4gICAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgICBnZXRPQXV0aFRva2VuOiAoY2IpID0+IHtcclxuICAgICAgICAgICAgICAvLyBnaXZlIHRoZSB0b2tlbiB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2b2x1bWU6IHZvbHVtZVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIHRoaXMuX2FkZExpc3RlbmVycyh2b2x1bWUpXHJcbiAgICAgICAgICAvLyBDb25uZWN0IHRvIHRoZSBwbGF5ZXIhXHJcbiAgICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hZGRMaXN0ZW5lcnMgKGxvYWRlZFZvbHVtZTogc3RyaW5nKSB7XHJcbiAgICAvLyBFcnJvciBoYW5kbGluZ1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2luaXRpYWxpemF0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2F1dGhlbnRpY2F0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdwbGF5YmFjayBjb3VsZG50IHN0YXJ0JylcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignYWNjb3VudF9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdwbGF5YmFja19lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBQbGF5YmFjayBzdGF0dXMgdXBkYXRlc1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3BsYXllcl9zdGF0ZV9jaGFuZ2VkJywgKHN0YXRlOiBTcG90aWZ5LlBsYXliYWNrU3RhdGUgfCBudWxsKSA9PiB7fSlcclxuXHJcbiAgICAvLyBSZWFkeVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUmVhZHkgd2l0aCBEZXZpY2UgSUQnLCBkZXZpY2VfaWQpXHJcbiAgICAgIHRoaXMuZGV2aWNlX2lkID0gZGV2aWNlX2lkXHJcblxyXG4gICAgICAvLyBhcHBlbmQgd2ViIHBsYXllciBlbGVtZW50IHRvIERPTVxyXG4gICAgICB0aGlzLndlYlBsYXllckVsLmFwcGVuZFdlYlBsYXllckh0bWwoXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlQbGF5UHJldih0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlKSxcclxuICAgICAgICAoKSA9PiB0aGlzLnRyeVdlYlBsYXllclBhdXNlKHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUpLFxyXG4gICAgICAgICgpID0+IHRoaXMudHJ5UGxheU5leHQodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy5vblNlZWtTdGFydCh0aGlzLnBsYXllciwgdGhpcy53ZWJQbGF5ZXJFbCksXHJcbiAgICAgICAgKHBlcmNlbnRhZ2UpID0+IHRoaXMuc2Vla1NvbmcocGVyY2VudGFnZSwgdGhpcy5wbGF5ZXIsIHRoaXMud2ViUGxheWVyRWwpLFxyXG4gICAgICAgIChwZXJjZW50YWdlKSA9PiB0aGlzLm9uU2Vla2luZyhwZXJjZW50YWdlLCB0aGlzLndlYlBsYXllckVsKSxcclxuICAgICAgICAocGVyY2VudGFnZSwgc2F2ZSkgPT4gdGhpcy5zZXRWb2x1bWUocGVyY2VudGFnZSwgdGhpcy5wbGF5ZXIsIHNhdmUpLFxyXG4gICAgICAgIHBhcnNlRmxvYXQobG9hZGVkVm9sdW1lKVxyXG4gICAgICApXHJcbiAgICAgIHRoaXMucGxheWVySXNSZWFkeSA9IHRydWVcclxuICAgIH0pXHJcblxyXG4gICAgLy8gTm90IFJlYWR5XHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignbm90X3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnRGV2aWNlIElEIGhhcyBnb25lIG9mZmxpbmUnLCBkZXZpY2VfaWQpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldER1cmF0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gdHJ1ZVxyXG4gICAgICB0aGlzLnBsYXllci5zZWVrKDApLnRoZW4oKCkgPT4geyB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2UgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIHBhdXNlIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUgZnJvbSB0aGUgd2ViIHBsYXllci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVdlYlBsYXllclBhdXNlIChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHRoZSBmaXJzdCBub2RlIG9yIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nXHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gJiYgY3Vyck5vZGUgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgcHJldlRyYWNrID0gY3Vyck5vZGUuZGF0YVxyXG4gICAgICBjb25zb2xlLmxvZygnVHJ5IHBsYXllciBwYXVzZScpXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgY3Vyck5vZGUsIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFycikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmllcyB0byBwbGF5IHRoZSBwcmV2aW91cyBJUGxheWFibGUgZ2l2ZW4gdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVBsYXlQcmV2IChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIC8vIHRoZXJlIGlzIG5vIGN1cnJlbnQgbm9kZSBvciB0aGUgcGxheWVyIGlzIGluIHNodWZmbGUgbW9kZVxyXG4gICAgaWYgKGN1cnJOb2RlID09PSBudWxsIHx8IChwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSAmJiAhdGhpcy53YXNJblNodWZmbGUpKSB7XHJcbiAgICAgIC8vIChpZiB0aGUgcGxheWVyIGhhcyBqdXN0IGJlZW4gcHV0IGludG8gc2h1ZmZsZSBtb2RlIHRoZW4gdGhlcmUgc2hvdWxkIGJlIG5vIHByZXZpb3VzIHBsYXlhYmxlcyB0byBnbyBiYWNrIHRvbylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgYW4gYWN0aW9uIGlzIHByb2Nlc3Npbmcgd2UgY2Fubm90IGRvIGFueXRoaW5nXHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24pIHtcclxuICAgICAgdGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCkudGhlbigoc3RhdGU6IHsgcG9zaXRpb246IGFueSB9KSA9PiB7XHJcbiAgICAgICAgaWYgKHN0YXRlLnBvc2l0aW9uID4gMTAwMCkge1xyXG4gICAgICAgICAgdGhpcy5yZXNldER1cmF0aW9uKClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGN1cnJOb2RlLnByZXZpb3VzID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxldCBwcmV2VHJhY2tOb2RlID0gY3Vyck5vZGUucHJldmlvdXNcclxuXHJcbiAgICAgICAgICBpZiAoIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlICYmIHRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgICAgICAgIHByZXZUcmFja05vZGUgPSB0aGlzLnVuU2h1ZmZsZSgtMSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IHByZXZUcmFjayA9IGN1cnJOb2RlLnByZXZpb3VzLmRhdGFcclxuICAgICAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgcHJldlRyYWNrTm9kZSwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmllcyB0byBwbGF5IHRoZSBuZXh0IElQbGF5YWJsZSBnaXZlbiB0aGUgY3VycmVudCBwbGF5aW5nIElQbGF5YWJsZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5UGxheU5leHQgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgaWYgKGN1cnJOb2RlID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgdGhlIGxhc3Qgbm9kZSBvciBpZiBhbiBhY3Rpb24gaXMgcHJvY2Vzc2luZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uICYmIGN1cnJOb2RlLm5leHQgIT09IG51bGwpIHtcclxuICAgICAgbGV0IG5leHRUcmFja05vZGUgPSBjdXJyTm9kZS5uZXh0XHJcblxyXG4gICAgICBpZiAoIXRoaXMud2FzSW5TaHVmZmxlICYmIHBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlKSB7XHJcbiAgICAgICAgLy8gYnkgY2FsbGluZyB0aGlzIGJlZm9yZSBhc3NpZ25pbmcgdGhlIG5leHQgbm9kZSwgdGhpcy5zaHVmZmxlUGxheWFibGVzKCkgbXVzdCByZXR1cm4gYmFjayB0aGUgbmV4dCBub2RlXHJcbiAgICAgICAgbmV4dFRyYWNrTm9kZSA9IHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpXHJcblxyXG4gICAgICAgIC8vIGNhbGwgYWZ0ZXIgdG8gZW5zdXJlIHRoYXQgdGhpcy5zaHVmZmxlUGxheWFibGVzKCkgcnVucyB0aGUgaWYgc3RhdGVtZW50IHRoYXQgcmV0dXJucyB0aGUgbmV4dCBub2RlXHJcbiAgICAgICAgdGhpcy53YXNJblNodWZmbGUgPSB0cnVlXHJcbiAgICAgIH0gZWxzZSBpZiAoIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlICYmIHRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgICAgbmV4dFRyYWNrTm9kZSA9IHRoaXMudW5TaHVmZmxlKDEpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKG5leHRUcmFja05vZGUuZGF0YSwgbmV4dFRyYWNrTm9kZSwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29tcGxldGVseURlc2VsZWN0VHJhY2sgKCkge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VsZWN0ZWQgcGxheWluZyBlbGVtZW50IHdhcyBudWxsIGJlZm9yZSBkZXNlbGVjdGlvbiBvbiBzb25nIGZpbmlzaCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnBhdXNlRGVzZWxlY3RUcmFjaygpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID0gJydcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGF1c2VEZXNlbGVjdFRyYWNrICgpIHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCB3YXMgbnVsbCBiZWZvcmUgZGVzZWxlY3Rpb24gb24gc29uZyBmaW5pc2gnKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGU/LmRhdGEub25TdG9wcGVkKClcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5wbGF5UGF1c2U/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBudWxsXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNlbGVjdFRyYWNrIChldmVudEFyZzogUGxheWFibGVFdmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXI6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSBldmVudEFyZy5wbGF5YWJsZU5vZGVcclxuICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFyciA9IGV2ZW50QXJnLnBsYXlhYmxlQXJyXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbFxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaVxyXG5cclxuICAgIHRoaXMud2ViUGxheWVyRWwucGxheVBhdXNlPy5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMud2ViUGxheWVyRWwuc2V0VGl0bGUoZXZlbnRBcmcuY3VyclBsYXlhYmxlLnRpdGxlKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5zZXRJbWdTcmMoZXZlbnRBcmcuY3VyclBsYXlhYmxlLmltYWdlVXJsKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbC5zZXRBcnRpc3RzKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5hcnRpc3RzSHRtbClcclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlPy5kYXRhLm9uUGxheWluZygpXHJcblxyXG4gICAgLy8gd2UgY2FuIGNhbGwgYWZ0ZXIgYXNzaWduaW5nIHBsYXlhYmxlIG5vZGUgYXMgaXQgZG9lcyBub3QgY2hhbmdlIHdoaWNoIG5vZGUgaXMgcGxheWVkXHJcbiAgICBpZiAoIXBsYXlUaHJ1V2ViUGxheWVyICYmIHBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlKSB7XHJcbiAgICAgIHRoaXMuc2h1ZmZsZVBsYXlhYmxlcygpXHJcbiAgICB9IGVsc2UgaWYgKCFwbGF5ZXJQdWJsaWNWYXJzLmlzU2h1ZmZsZSAmJiB0aGlzLndhc0luU2h1ZmZsZSkge1xyXG4gICAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlID0gdGhpcy51blNodWZmbGUoMClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25UcmFja0ZpbmlzaCAoKSB7XHJcbiAgICB0aGlzLmNvbXBsZXRlbHlEZXNlbGVjdFRyYWNrKClcclxuXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCBhcyBOb2RlSlMuVGltZW91dClcclxuICAgIHRoaXMudHJ5UGxheU5leHQodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgYW4gaW50ZXJ2YWwgdGhhdCBvYnRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgcGxheWVyIGV2ZXJ5IHNlY29uZC5cclxuICAgKiBTaG91bGQgb25seSBiZSBjYWxsZWQgd2hlbiBhIHNvbmcgaXMgcGxheWluZy5cclxuICAgKi9cclxuICBwcml2YXRlIHNldEdldFN0YXRlSW50ZXJ2YWwgKCkge1xyXG4gICAgbGV0IGR1cmF0aW9uTWluU2VjID0gJydcclxuICAgIGlmICh0aGlzLmdldFN0YXRlSW50ZXJ2YWwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwpXHJcbiAgICB9XHJcbiAgICAvLyBzZXQgdGhlIGludGVydmFsIHRvIHJ1biBldmVyeSBzZWNvbmQgYW5kIG9idGFpbiB0aGUgc3RhdGVcclxuICAgIHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCkudGhlbigoc3RhdGU6IHsgcG9zaXRpb246IGFueTsgZHVyYXRpb246IGFueSB9KSA9PiB7XHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgJ1VzZXIgaXMgbm90IHBsYXlpbmcgbXVzaWMgdGhyb3VnaCB0aGUgV2ViIFBsYXliYWNrIFNESydcclxuICAgICAgICAgIClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB7IHBvc2l0aW9uLCBkdXJhdGlvbiB9ID0gc3RhdGVcclxuXHJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXNudCBhIGR1cmF0aW9uIHNldCBmb3IgdGhpcyBzb25nIHNldCBpdC5cclxuICAgICAgICBpZiAoZHVyYXRpb25NaW5TZWMgPT09ICcnKSB7XHJcbiAgICAgICAgICBkdXJhdGlvbk1pblNlYyA9IG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMoZHVyYXRpb24pXHJcbiAgICAgICAgICB0aGlzLndlYlBsYXllckVsIS5kdXJhdGlvbiEudGV4dENvbnRlbnQgPSBkdXJhdGlvbk1pblNlY1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGVyY2VudERvbmUgPSAocG9zaXRpb24gLyBkdXJhdGlvbikgKiAxMDBcclxuXHJcbiAgICAgICAgLy8gdGhlIHBvc2l0aW9uIGdldHMgc2V0IHRvIDAgd2hlbiB0aGUgc29uZyBpcyBmaW5pc2hlZFxyXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMCkge1xyXG4gICAgICAgICAgdGhpcy5vblRyYWNrRmluaXNoKClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gaWYgdGhlIHBvc2l0aW9uIGlzbnQgMCB1cGRhdGUgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudHNcclxuICAgICAgICAgIHRoaXMud2ViUGxheWVyRWwudXBkYXRlRWxlbWVudChwZXJjZW50RG9uZSwgcG9zaXRpb24pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSwgNTAwKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VsZWN0IGEgY2VydGFpbiBwbGF5L3BhdXNlIGVsZW1lbnQgYW5kIHBsYXkgdGhlIGdpdmVuIHRyYWNrIHVyaVxyXG4gICAqIGFuZCB1bnNlbGVjdCB0aGUgcHJldmlvdXMgb25lIHRoZW4gcGF1c2UgdGhlIHByZXZpb3VzIHRyYWNrX3VyaS5cclxuICAgKlxyXG4gICAqIFRoZSByZWFzc2lnbmluZyBvZiBlbGVtZW50cyBpcyBpbiB0aGUgY2FzZSB0aGF0IHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHRocm91Z2ggdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCxcclxuICAgKiBhcyB0aGVyZSBpcyBhIGNoYW5jZSB0aGF0IHRoZSBzZWxlY3RlZCBwbGF5aW5nIGVsZW1lbnQgaXMgZWl0aGVyIG5vbi1leGlzdGVudCwgb3IgaXMgZGlmZmVyZW50IHRoZW4gdGhlblxyXG4gICAqIHRoZSBwcmV2aW91cyBpLmUuIHJlcmVuZGVyZWQsIG9yIGhhcyBhbiBlcXVpdmFsZW50IGVsZW1lbnQgd2hlbiBvbiBmb3IgZXhhbXBsZSBhIGRpZmZlcmVudCB0ZXJtIHRhYi5cclxuICAgKlxyXG4gICAqIFJlYXNzaWduaW5nIGlzIGRvbmUgc28gdGhhdCB0aGUgcG90ZW50aWFsbHkgZGlmZmVyZW50IGVxdWl2YWxlbnQgZWxlbWVudCBjYW4gYWN0IGFzIHRoZSBpbml0aWFsbHlcclxuICAgKiBzZWxlY3RlZCBlbGVtZW50LCBpbiBzaG93aW5nIHBhdXNlL3BsYXkgc3ltYm9scyBpbiBhY2NvcmRhbmNlIHRvIHdoZXRoZXIgdGhlXHJcbiAgICogc29uZyB3YXMgcGF1c2VkL3BsYXllZCB0aHJvdWdoIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQbGF5YWJsZUV2ZW50QXJnfSBldmVudEFyZyAtIGEgY2xhc3MgdGhhdCBjb250YWlucyB0aGUgY3VycmVudCwgbmV4dCBhbmQgcHJldmlvdXMgdHJhY2tzIHRvIHBsYXlcclxuICAgKi9cclxuICBwdWJsaWMgYXN5bmMgc2V0U2VsUGxheWluZ0VsIChldmVudEFyZzogUGxheWFibGVFdmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIgPSB0cnVlKSB7XHJcbiAgICAvLyBpZiB0aGUgcGxheWVyIGlzbid0IHJlYWR5IHdlIGNhbm5vdCBjb250aW51ZS5cclxuICAgIGlmICghdGhpcy5wbGF5ZXJJc1JlYWR5KSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdwbGF5ZXIgaXMgbm90IHJlYWR5JylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSB0cnVlXHJcblxyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ICE9IG51bGwpIHtcclxuICAgICAgLy8gc3RvcCB0aGUgcHJldmlvdXMgdHJhY2sgdGhhdCB3YXMgcGxheWluZ1xyXG4gICAgICB0aGlzLnNlbFBsYXlpbmcucGxheWFibGVOb2RlPy5kYXRhLm9uU3RvcHBlZCgpXHJcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsIGFzIE5vZGVKUy5UaW1lb3V0KVxyXG5cclxuICAgICAgLy8gcmVhc3NpZ24gdGhlIGVsZW1lbnQgaWYgaXQgZXhpc3RzIGFzIGl0IG1heSBoYXZlIGJlZW4gcmVyZW5kZXJlZCBhbmQgdGhlcmVmb3JlIHRoZSBwcmV2aW91cyB2YWx1ZSBpcyBwb2ludGluZyB0byBub3RoaW5nXHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuaWQpID8/IHRoaXMuc2VsUGxheWluZy5lbGVtZW50XHJcblxyXG4gICAgICAvLyBpZiBpdHMgdGhlIHNhbWUgZWxlbWVudCB0aGVuIHBhdXNlXHJcbiAgICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5pZCA9PT0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsLmlkKSB7XHJcbiAgICAgICAgdGhpcy5wYXVzZURlc2VsZWN0VHJhY2soKVxyXG4gICAgICAgIGF3YWl0IHRoaXMucGF1c2UoKVxyXG4gICAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSBjb21wbGV0ZWx5IGRlc2VsZWN0IHRoZSBjdXJyZW50IHRyYWNrIGJlZm9yZSBzZWxlY3RpbmcgYW5vdGhlciBvbmUgdG8gcGxheVxyXG4gICAgICAgIHRoaXMuY29tcGxldGVseURlc2VsZWN0VHJhY2soKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJldiB0cmFjayB1cmkgaXMgdGhlIHNhbWUgdGhlbiByZXN1bWUgdGhlIHNvbmcgaW5zdGVhZCBvZiByZXBsYXlpbmcgaXQuXHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9PT0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaSkge1xyXG4gICAgICAvLyB0aGlzIHNlbEVsIGNvdWxkIGNvcnJvc3BvbmQgdG8gdGhlIHNhbWUgc29uZyBidXQgaXMgYW4gZWxlbWVudCB0aGF0IGlzIG5vbi1leGlzdGVudCwgc28gcmVhc3NpZ24gaXQgdG8gYSBlcXVpdmFsZW50IGV4aXN0aW5nIGVsZW1lbnQgaWYgdGhpcyBpcyB0aGUgY2FzZS5cclxuICAgICAgZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsLmlkKSA/PyBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWxcclxuXHJcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRUcmFjayhhc3luYyAoKSA9PiB0aGlzLnJlc3VtZSgpLCBldmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXIpXHJcbiAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZygnc3RhcnQgdHJhY2snKVxyXG4gICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucGxheShldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSwgZXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyKVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHN0YXJ0VHJhY2sgKHBsYXlpbmdBc3luY0Z1bmM6IEZ1bmN0aW9uLCBldmVudEFyZzogUGxheWFibGVFdmVudEFyZywgcGxheVRocnVXZWJQbGF5ZXI6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuc2VsZWN0VHJhY2soZXZlbnRBcmcsIHBsYXlUaHJ1V2ViUGxheWVyKVxyXG5cclxuICAgIGF3YWl0IHBsYXlpbmdBc3luY0Z1bmMoKVxyXG5cclxuICAgIC8vIHNldCBwbGF5aW5nIHN0YXRlIG9uY2Ugc29uZyBzdGFydHMgcGxheWluZ1xyXG4gICAgdGhpcy5zZXRHZXRTdGF0ZUludGVydmFsKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNodWZmbGVzIHRoZSBwbGF5YWJsZXMgYW5kIGVpdGhlciByZXR1cm5zIHRoZSBjdXJyZW50IG5vZGUgb3IgdGhlIG5leHQgbm9kZSB0aGF0IGJvdGggcG9pbnQgdG8gYSBzaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+fSBlaXRoZXIgdGhlIG5leHQgb3IgY3VycmVudCBub2RlIGluIHRoZSBzaHVmZmxlZCBsaXN0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2h1ZmZsZVBsYXlhYmxlcyAoKSA6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4ge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZUFyciA9PSBudWxsIHx8IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdubyBzZWwgcGxheWluZycpXHJcbiAgICBjb25zb2xlLmxvZygnc2h1ZmZsZScpXHJcbiAgICBjb25zdCBzZWxQbGF5YWJsZSA9IHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUuZGF0YVxyXG5cclxuICAgIC8vIHNodWZmbGUgYXJyYXlcclxuICAgIGNvbnN0IHRyYWNrQXJyID0gc2h1ZmZsZSh0aGlzLnNlbFBsYXlpbmcucGxheWFibGVBcnIpXHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoaXMgdHJhY2sgZnJvbSB0aGUgYXJyYXlcclxuICAgIGNvbnN0IGluZGV4ID0gdHJhY2tBcnIuaW5kZXhPZihzZWxQbGF5YWJsZSlcclxuICAgIHRyYWNrQXJyLnNwbGljZShpbmRleCwgMSlcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBhIGRvdWJseSBsaW5rZWQgbGlzdFxyXG4gICAgY29uc3Qgc2h1ZmZsZWRMaXN0ID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QodHJhY2tBcnIpXHJcblxyXG4gICAgLy8gcGxhY2UgdGhpcyB0cmFjayBhdCB0aGUgZnJvbnQgb2YgdGhlIGxpc3RcclxuICAgIHNodWZmbGVkTGlzdC5pbnNlcnRCZWZvcmUoc2VsUGxheWFibGUsIDApXHJcblxyXG4gICAgbGV0IG5ld05vZGUgOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICBpZiAoIXRoaXMud2FzSW5TaHVmZmxlKSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbmV4dCBub2RlIGFzIHRoaXMgc2hvdWxkIHJ1biBiZWZvcmUgdGhlIG5leHQgbm9kZSBpcyBjaG9zZW4uXHJcbiAgICAgIG5ld05vZGUgPSBzaHVmZmxlZExpc3QuZ2V0KDEsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbmV3IG5vZGUgd2hpY2ggaGFzIGlkZW50aWNhbCBkYXRhIGFzIHRoZSBvbGQgb25lLCBidXQgaXMgbm93IHBhcnQgb2YgdGhlIHNodWZmbGVkIGRvdWJseSBsaW5rZWQgbGlzdFxyXG4gICAgICBuZXdOb2RlID0gc2h1ZmZsZWRMaXN0LmdldCgwLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICAgIHRoaXMuc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSBuZXdOb2RlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW5zaHVmZmxlcyB0aGUgcGxheWFibGVzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXIgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSBpbmRleCB0byBhZGQgb3IgcmVtb3ZlIGZyb20gdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IHBsYXlpbmcgbm9kZS4gKDE6IGdldHNOZXh0LCAtMTogZ2V0c1ByZXYsIDA6IGdldHNDdXJyZW50KVxyXG4gICAqIEByZXR1cm5zIHtEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+fSB0aGUgbm9kZSB0aGF0IHBvaW50cyB0byB0aGUgdW5zaHVmZmxlZCB2ZXJzaW9uIG9mIHRoZSBsaXN0LiBFaXRoZXIgdGhlIHByZXZpb3VzLCBjdXJyZW50LCBvciBuZXh0IG5vZGUgZnJvbSB0aGUgY3VycmVudCBwbGF5YWJsZS5cclxuICAgKi9cclxuICBwcml2YXRlIHVuU2h1ZmZsZSAoZGlyOiBudW1iZXIpIDogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyID09IG51bGwgfHwgdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZSA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ25vIHNlbCBwbGF5aW5nJylcclxuICAgIGNvbnN0IHNlbFBsYXlhYmxlID0gdGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlTm9kZS5kYXRhXHJcblxyXG4gICAgY29uc29sZS5sb2coJ3Vuc2h1ZmZsZScpXHJcbiAgICB0aGlzLndhc0luU2h1ZmZsZSA9IGZhbHNlXHJcbiAgICAvLyBvYnRhaW4gYW4gdW5zaHVmZmxlZCBsaW5rZWQgbGlzdFxyXG4gICAgY29uc3QgcGxheWFibGVMaXN0ID0gYXJyYXlUb0RvdWJseUxpbmtlZExpc3QodGhpcy5zZWxQbGF5aW5nLnBsYXlhYmxlQXJyKVxyXG5cclxuICAgIGNvbnN0IG5ld05vZGVJZHggPSBwbGF5YWJsZUxpc3QuZmluZEluZGV4KChwbGF5YWJsZSkgPT4gcGxheWFibGUuc2VsRWwuaWQgPT09IHNlbFBsYXlhYmxlLnNlbEVsLmlkKVxyXG4gICAgY29uc3QgbmV3Tm9kZSA9IHBsYXlhYmxlTGlzdC5nZXQobmV3Tm9kZUlkeCArIGRpciwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgcmV0dXJuIG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBsYXlzIGEgdHJhY2sgdGhyb3VnaCB0aGlzIGRldmljZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFja191cmkgLSB0aGUgdHJhY2sgdXJpIHRvIHBsYXlcclxuICAgKiBAcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdHJhY2sgaGFzIGJlZW4gcGxheWVkIHN1Y2Nlc2Z1bGx5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcGxheSAodHJhY2tfdXJpOiBzdHJpbmcpIHtcclxuICAgIGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvcy5wdXQoY29uZmlnLlVSTHMucHV0UGxheVRyYWNrKHRoaXMuZGV2aWNlX2lkLCB0cmFja191cmkpKVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyByZXN1bWUgKCkge1xyXG4gICAgYXdhaXQgdGhpcy5wbGF5ZXIucmVzdW1lKClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcGF1c2UgKCkge1xyXG4gICAgYXdhaXQgdGhpcy5wbGF5ZXIucGF1c2UoKVxyXG4gIH1cclxufVxyXG5cclxuY29uc3Qgc3BvdGlmeVBsYXliYWNrID0gbmV3IFNwb3RpZnlQbGF5YmFjaygpXHJcblxyXG5pZiAoKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgLy8gY3JlYXRlIGEgZ2xvYmFsIHZhcmlhYmxlIHRvIGJlIHVzZWRcclxuICAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yID0gbmV3IEV2ZW50QWdncmVnYXRvcigpXHJcbn1cclxuY29uc3QgZXZlbnRBZ2dyZWdhdG9yID0gKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciBhcyBFdmVudEFnZ3JlZ2F0b3JcclxuXHJcbi8vIHN1YnNjcmliZSB0aGUgc2V0UGxheWluZyBlbGVtZW50IGV2ZW50XHJcbmV2ZW50QWdncmVnYXRvci5zdWJzY3JpYmUoUGxheWFibGVFdmVudEFyZy5uYW1lLCAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcpID0+XHJcbiAgc3BvdGlmeVBsYXliYWNrLnNldFNlbFBsYXlpbmdFbChldmVudEFyZywgZmFsc2UpXHJcbilcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsICh1cmk6IHN0cmluZykge1xyXG4gIHJldHVybiAoXHJcbiAgICB1cmkgPT09IHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnRyYWNrX3VyaSAmJlxyXG4gICAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ICE9IG51bGxcclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1NhbWVQbGF5aW5nVVJJICh1cmk6IHN0cmluZykge1xyXG4gIHJldHVybiB1cmkgPT09IHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnRyYWNrX3VyaVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlciAodXJpOiBzdHJpbmcsIHNlbEVsOiBFbGVtZW50LCB0cmFja0RhdGFOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+KSB7XHJcbiAgaWYgKGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodXJpKSkge1xyXG4gICAgLy8gVGhpcyBlbGVtZW50IHdhcyBwbGF5aW5nIGJlZm9yZSByZXJlbmRlcmluZyBzbyBzZXQgaXQgdG8gYmUgdGhlIGN1cnJlbnRseSBwbGF5aW5nIG9uZSBhZ2FpblxyXG4gICAgc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcuZWxlbWVudCA9IHNlbEVsXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5wbGF5YWJsZU5vZGUgPSB0cmFja0RhdGFOb2RlXHJcbiAgfVxyXG59XHJcblxyXG4vLyBhcHBlbmQgYW4gaW52aXNpYmxlIGVsZW1lbnQgdGhlbiBkZXN0cm95IGl0IGFzIGEgd2F5IHRvIGxvYWQgdGhlIHBsYXkgYW5kIHBhdXNlIGltYWdlcyBmcm9tIGV4cHJlc3MuXHJcbmNvbnN0IHByZWxvYWRQbGF5UGF1c2VJbWdzSHRtbCA9IGA8ZGl2IHN0eWxlPVwiZGlzcGxheTogbm9uZVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGxheUljb259XCIvPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGF1c2VJY29ufVwiLz48L2Rpdj5gXHJcbmNvbnN0IHByZWxvYWRQbGF5UGF1c2VJbWdzRWwgPSBodG1sVG9FbChwcmVsb2FkUGxheVBhdXNlSW1nc0h0bWwpIGFzIE5vZGVcclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwcmVsb2FkUGxheVBhdXNlSW1nc0VsKVxyXG5kb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHByZWxvYWRQbGF5UGF1c2VJbWdzRWwpXHJcbiIsImltcG9ydCB7IGNvbmZpZywgaHRtbFRvRWwsIGdldFZhbGlkSW1hZ2UgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCBUcmFjaywgeyBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhIH0gZnJvbSAnLi90cmFjaydcclxuaW1wb3J0IENhcmQgZnJvbSAnLi9jYXJkJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCBmcm9tICcuL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IHsgUGxheWxpc3RUcmFja0RhdGEsIFNwb3RpZnlJbWcsIFRyYWNrRGF0YSB9IGZyb20gJy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5jbGFzcyBQbGF5bGlzdCBleHRlbmRzIENhcmQge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBpZDogc3RyaW5nO1xyXG4gIHVuZG9TdGFjazogQXJyYXk8QXJyYXk8VHJhY2s+PjtcclxuICBvcmRlcjogc3RyaW5nO1xyXG4gIHRyYWNrTGlzdDogdW5kZWZpbmVkIHwgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz47XHJcbiAgaW1hZ2VVcmw6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPiwgaWQ6IHN0cmluZykge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5pZCA9IGlkXHJcbiAgICB0aGlzLnVuZG9TdGFjayA9IFtdXHJcbiAgICB0aGlzLm9yZGVyID0gJ2N1c3RvbS1vcmRlcicgLy8gc2V0IGl0IGFzIHRoZSBpbml0aWFsIG9yZGVyXHJcbiAgICB0aGlzLnRyYWNrTGlzdCA9IHVuZGVmaW5lZFxyXG5cclxuICAgIC8vIHRoZSBpZCBvZiB0aGUgcGxheWxpc3QgY2FyZCBlbGVtZW50XHJcbiAgICB0aGlzLmltYWdlVXJsID0gZ2V0VmFsaWRJbWFnZShpbWFnZXMpXHJcbiAgfVxyXG5cclxuICBhZGRUb1VuZG9TdGFjayAodHJhY2tzOiBBcnJheTxUcmFjaz4pIHtcclxuICAgIHRoaXMudW5kb1N0YWNrLnB1c2godHJhY2tzKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIHBsYXlsaXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCBUaGUgY2FyZCBpbmRleCB0byB1c2UgZm9yIHRoZSBlbGVtZW50cyBpZCBzdWZmaXhcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRQbGF5bGlzdENhcmRIdG1sIChpZHg6IG51bWJlciwgaW5UZXh0Rm9ybTogYm9vbGVhbiwgaXNTZWxlY3RlZCA9IGZhbHNlKTogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLnBsYXlsaXN0UHJlZml4fSR7aWR4fWBcclxuXHJcbiAgICBjb25zdCBleHBhbmRPbkhvdmVyID0gaW5UZXh0Rm9ybSA/ICcnIDogY29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJcclxuXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIke2V4cGFuZE9uSG92ZXJ9XCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUlufSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuY2FyZFxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdH0gJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9ICR7XHJcbiAgICAgIGlzU2VsZWN0ZWQgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgfVwiIGlkPVwiJHt0aGlzLmdldENhcmRJZCgpfVwiIHRpdGxlPVwiQ2xpY2sgdG8gVmlldyBUcmFja3NcIj5cclxuICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZVVybH1cIiBhbHQ9XCJQbGF5bGlzdCBDb3ZlclwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXBcclxuICAgIH1cIj4ke3RoaXMubmFtZX08L2g0PlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGBcclxuICAgIHJldHVybiBodG1sVG9FbChodG1sKSBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcm9kdWNlcyBsaXN0IG9mIFRyYWNrIGNsYXNzIGluc3RhbmNlcyB1c2luZyB0cmFjayBkYXRhcyBmcm9tIHNwb3RpZnkgd2ViIGFwaS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtEb3VibHlMaW5rZWRMaXN0PFRyYWNrPn0gTGlzdCBvZiB0cmFjayBjbGFzc2VzIGNyZWF0ZWQgdXNpbmcgdGhlIG9idGFpbmVkIHRyYWNrIGRhdGFzLlxyXG4gICAqL1xyXG4gIGFzeW5jIGxvYWRUcmFja3MgKCk6IFByb21pc2U8RG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBudWxsPiB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcy5yZXF1ZXN0PEFycmF5PFBsYXlsaXN0VHJhY2tEYXRhPj4oeyBtZXRob2Q6ICdnZXQnLCB1cmw6IGAke2NvbmZpZy5VUkxzLmdldFBsYXlsaXN0VHJhY2tzICsgdGhpcy5pZH1gIH0pXHJcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycilcclxuICAgICAgfSlcclxuXHJcbiAgICBpZiAoIXJlcykge1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG4gICAgY29uc3QgdHJhY2tMaXN0ID0gbmV3IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+KClcclxuXHJcbiAgICAvLyBtYXAgZWFjaCB0cmFjayBkYXRhIGluIHRoZSBwbGF5bGlzdCBkYXRhIHRvIGFuIGFycmF5LlxyXG4gICAgY29uc3QgdHJhY2tzRGF0YSA9IHJlcy5kYXRhLm1hcCgoZGF0YSkgPT4gZGF0YS50cmFjaykgYXMgQXJyYXk8VHJhY2tEYXRhPlxyXG4gICAgZ2V0UGxheWxpc3RUcmFja3NGcm9tRGF0YXModHJhY2tzRGF0YSwgcmVzLmRhdGEsIHRyYWNrTGlzdClcclxuXHJcbiAgICAvLyBkZWZpbmUgdHJhY2sgb2JqZWN0c1xyXG4gICAgdGhpcy50cmFja0xpc3QgPSB0cmFja0xpc3RcclxuICAgIHJldHVybiB0cmFja0xpc3RcclxuICB9XHJcblxyXG4gIGhhc0xvYWRlZFRyYWNrcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFja0xpc3QgIT09IHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgcGxheWxpc3QgdHJhY2tzIGZyb20gZGF0YS4gVGhpcyBhbHNvIGluaXRpYWxpemVzIHRoZSBkYXRlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFRyYWNrRGF0YT59IHRyYWNrc0RhdGEgYW4gYXJyYXkgb2YgY29udGFpbmluZyBlYWNoIHRyYWNrJ3MgZGF0YVxyXG4gKiBAcGFyYW0ge0FycmF5PFBsYXlsaXN0VHJhY2tEYXRhPn0gZGF0ZUFkZGVkT2JqZWN0cyBUaGUgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGFkZGVkX2F0IHZhcmlhYmxlLlxyXG4gKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+fSB0cmFja3NMaXN0IHRoZSBkb3VibHkgbGlua2VkIGxpc3QgdG8gcHV0IHRoZSB0cmFja3MgaW50by5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQbGF5bGlzdFRyYWNrc0Zyb21EYXRhcyAoXHJcbiAgdHJhY2tzRGF0YTogQXJyYXk8VHJhY2tEYXRhPixcclxuICBkYXRlQWRkZWRPYmplY3RzOiBBcnJheTxQbGF5bGlzdFRyYWNrRGF0YT4sXHJcbiAgdHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPlxyXG4pIHtcclxuICBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhKHRyYWNrc0RhdGEsIHRyYWNrTGlzdClcclxuXHJcbiAgbGV0IGkgPSAwXHJcbiAgLy8gc2V0IHRoZSBkYXRlcyBhZGRlZFxyXG4gIGZvciAoY29uc3QgdHJhY2tPdXQgb2YgdHJhY2tMaXN0LnZhbHVlcygpKSB7XHJcbiAgICBjb25zdCBkYXRlQWRkZWRPYmogPSBkYXRlQWRkZWRPYmplY3RzW2ldXHJcbiAgICBjb25zdCB0cmFjazogVHJhY2sgPSB0cmFja091dFxyXG5cclxuICAgIHRyYWNrLnNldERhdGVBZGRlZFRvUGxheWxpc3QoZGF0ZUFkZGVkT2JqLmFkZGVkX2F0KVxyXG4gICAgaSsrXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5bGlzdFxyXG4iLCJpbXBvcnQgeyBnZXRWYWxpZEltYWdlIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgeyBTcG90aWZ5SW1nIH0gZnJvbSAnLi4vLi4vdHlwZXMnXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2ZpbGUge1xyXG4gIGRpc3BsYXlOYW1lOiBzdHJpbmc7XHJcbiAgY291bnRyeTogc3RyaW5nO1xyXG4gIGVtYWlsOiBzdHJpbmc7XHJcbiAgcHJvZmlsZUltZ1VybDogc3RyaW5nO1xyXG4gIGZvbGxvd2Vyczogc3RyaW5nO1xyXG4gIGV4dGVybmFsVVJMOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChkaXNwbGF5TmFtZTogc3RyaW5nLCBjb3VudHJ5OiBzdHJpbmcsIGVtYWlsOiBzdHJpbmcsIGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGZvbGxvd2Vyczogc3RyaW5nLCBleHRlcm5hbFVSTDogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmRpc3BsYXlOYW1lID0gZGlzcGxheU5hbWVcclxuICAgIHRoaXMuY291bnRyeSA9IGNvdW50cnlcclxuICAgIHRoaXMuZW1haWwgPSBlbWFpbFxyXG4gICAgdGhpcy5wcm9maWxlSW1nVXJsID0gZ2V0VmFsaWRJbWFnZShpbWFnZXMpXHJcbiAgICB0aGlzLmZvbGxvd2VycyA9IGZvbGxvd2Vyc1xyXG4gICAgdGhpcy5leHRlcm5hbFVSTCA9IGV4dGVybmFsVVJMXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBTdWJzY3JpcHRpb24gZnJvbSAnLi9zdWJzY3JpcHRpb24nXHJcblxyXG4vKiogTGV0cyBzYXkgeW91IGhhdmUgdHdvIGRvb3JzIHRoYXQgd2lsbCBvcGVuIHRocm91Z2ggdGhlIHB1YiBzdWIgc3lzdGVtLiBXaGF0IHdpbGwgaGFwcGVuIGlzIHRoYXQgd2Ugd2lsbCBzdWJzY3JpYmUgb25lXHJcbiAqIG9uIGRvb3Igb3BlbiBldmVudC4gV2Ugd2lsbCB0aGVuIGhhdmUgdHdvIHB1Ymxpc2hlcnMgdGhhdCB3aWxsIGVhY2ggcHJvcGFnYXRlIGEgZGlmZmVyZW50IGRvb3IgdGhyb3VnaCB0aGUgYWdncmVnYXRvciBhdCBkaWZmZXJlbnQgcG9pbnRzLlxyXG4gKiBUaGUgYWdncmVnYXRvciB3aWxsIHRoZW4gZXhlY3V0ZSB0aGUgb24gZG9vciBvcGVuIHN1YnNjcmliZXIgYW5kIHBhc3MgaW4gdGhlIGRvb3IgZ2l2ZW4gYnkgZWl0aGVyIHB1Ymxpc2hlci5cclxuICovXHJcblxyXG4vKiogTWFuYWdlcyBzdWJzY3JpYmluZyBhbmQgcHVibGlzaGluZyBvZiBldmVudHMuXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogQW4gYXJnVHlwZSBpcyBvYnRhaW5lZCBieSB0YWtpbmcgdGhlICdDbGFzc0luc3RhbmNlJy5jb250cnVjdG9yLm5hbWUgb3IgJ0NsYXNzJy5uYW1lLlxyXG4gKiBTdWJzY3JpcHRpb25zIGFyZSBncm91cGVkIHRvZ2V0aGVyIGJ5IGFyZ1R5cGUgYW5kIHRoZWlyIGV2dCB0YWtlcyBhbiBhcmd1bWVudCB0aGF0IGlzIGFcclxuICogY2xhc3Mgd2l0aCB0aGUgY29uc3RydWN0b3IubmFtZSBvZiBhcmdUeXBlLlxyXG4gKlxyXG4gKi9cclxuY2xhc3MgRXZlbnRBZ2dyZWdhdG9yIHtcclxuICBzdWJzY3JpYmVyczogeyBba2V5OiBzdHJpbmddOiBBcnJheTxTdWJzY3JpcHRpb24+IH07XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgLy8ga2V5IC0gdHlwZSwgdmFsdWUgLSBbXSBvZiBmdW5jdGlvbnMgdGhhdCB0YWtlIGEgY2VydGFpbiB2YWx1ZSBkZXBlbmRpbmcgb24gdGhlIHR5cGVcclxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fVxyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZXMgYSB0eXBlIG9mIGV2ZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFyZ1R5cGUgLSB0aGUgdHlwZSB0aGF0IHRoaXMgc3Vic2NyaWJlciBiZWxvbmdzIHRvby5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBldmVudCAtIHRoZSBldmVudCB0aGF0IHRha2VzIHRoZSBzYW1lIGFyZ3MgYXMgYWxsIG90aGVyIGV2ZW50cyBvZiB0aGUgZ2l2ZW4gdHlwZS5cclxuICAgKi9cclxuICBzdWJzY3JpYmUgKGFyZ1R5cGU6IHN0cmluZywgZXZ0OiBGdW5jdGlvbikge1xyXG4gICAgY29uc3Qgc3Vic2NyaWJlciA9IG5ldyBTdWJzY3JpcHRpb24odGhpcywgZXZ0LCBhcmdUeXBlKVxyXG5cclxuICAgIGlmIChhcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXS5wdXNoKHN1YnNjcmliZXIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdID0gW3N1YnNjcmliZXJdXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVW5zdWJzY3JpYmVzIGEgZ2l2ZW4gc3Vic2NyaXB0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdWJzY3JpcHRpb259IHN1YnNjcmlwdGlvblxyXG4gICAqL1xyXG4gIHVuc3Vic2NyaWJlIChzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbikge1xyXG4gICAgaWYgKHN1YnNjcmlwdGlvbi5hcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgLy8gZmlsdGVyIG91dCB0aGUgc3Vic2NyaXB0aW9uIGdpdmVuIGZyb20gdGhlIHN1YnNjcmliZXJzIGRpY3Rpb25hcnlcclxuICAgICAgY29uc3QgZmlsdGVyZWQgPSB0aGlzLnN1YnNjcmliZXJzW3N1YnNjcmlwdGlvbi5hcmdUeXBlXS5maWx0ZXIoZnVuY3Rpb24gKHN1Yikge1xyXG4gICAgICAgIHJldHVybiBzdWIuaWQgIT09IHN1YnNjcmlwdGlvbi5pZFxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1tzdWJzY3JpcHRpb24uYXJnVHlwZV0gPSBmaWx0ZXJlZFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2hlcyBhbGwgc3Vic2NyaWJlcnMgdGhhdCB0YWtlIGFyZ3VtZW50cyBvZiBhIGdpdmVuIHR5cGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gYXJncyAtIGEgY2xhc3MgdGhhdCBjb250YWlucyBhcmd1bWVudHMgZm9yIHRoZSBldmVudC4gTXVzdCBiZSBhIGNsYXNzIGFzIHN1YnNjcmliZXJzIGFyZSBncm91cGVkIGJ5IHR5cGUuXHJcbiAgICovXHJcbiAgcHVibGlzaCAoYXJnczogT2JqZWN0KSB7XHJcbiAgICBjb25zdCBhcmdUeXBlID0gYXJncy5jb25zdHJ1Y3Rvci5uYW1lXHJcblxyXG4gICAgaWYgKGFyZ1R5cGUgaW4gdGhpcy5zdWJzY3JpYmVycykge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4ge1xyXG4gICAgICAgIHN1YnNjcmlwdGlvbi5ldnQoYXJncylcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ25vIHR5cGUgZm91bmQgZm9yIHB1Ymxpc2hpbmcnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xlYXJTdWJzY3JpcHRpb25zICgpIHtcclxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRBZ2dyZWdhdG9yXHJcbiIsImltcG9ydCB7IElQbGF5YWJsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgeyBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4uLy4uL2RvdWJseS1saW5rZWQtbGlzdCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXlhYmxlRXZlbnRBcmcge1xyXG4gIGN1cnJQbGF5YWJsZTogSVBsYXlhYmxlO1xyXG4gIHBsYXlhYmxlTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gIHBsYXlhYmxlQXJyOiBBcnJheTxJUGxheWFibGU+IHwgbnVsbFxyXG5cclxuICAvKiogVGFrZXMgaW4gdGhlIGN1cnJlbnQgdHJhY2sgdG8gcGxheSBhcyB3ZWxsIGFzIHRoZSBwcmV2IHRyYWNrcyBhbmQgbmV4dCB0cmFja3MgZnJvbSBpdC5cclxuICAgKiBOb3RlIHRoYXQgaXQgZG9lcyBub3QgdGFrZSBUcmFjayBpbnN0YW5jZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0lQbGF5YWJsZX0gY3VyclRyYWNrIC0gb2JqZWN0IGNvbnRhaW5pbmcgZWxlbWVudCB0byBzZWxlY3QsIHRyYWNrX3VyaSwgYW5kIHRyYWNrIHRpdGxlLlxyXG4gICAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPn0gdHJhY2tOb2RlIC0gbm9kZSB0aGF0IGFsbG93cyB1cyB0byB0cmF2ZXJzZSB0byBuZXh0IGFuZCBwcmV2aW91cyB0cmFjayBkYXRhcy5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciAoY3VyclRyYWNrOiBJUGxheWFibGUsIHRyYWNrTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiwgcGxheWFibGVBcnI6IEFycmF5PElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICB0aGlzLmN1cnJQbGF5YWJsZSA9IGN1cnJUcmFja1xyXG4gICAgdGhpcy5wbGF5YWJsZU5vZGUgPSB0cmFja05vZGVcclxuICAgIHRoaXMucGxheWFibGVBcnIgPSBwbGF5YWJsZUFyclxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vYWdncmVnYXRvcidcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1YnNjcmlwdGlvbiB7XHJcbiAgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3I7XHJcbiAgZXZ0OiBGdW5jdGlvbjtcclxuICBhcmdUeXBlOiBzdHJpbmc7XHJcbiAgaWQ6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yLCBldnQ6IEZ1bmN0aW9uLCBhcmdUeXBlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yID0gZXZlbnRBZ2dyZWdhdG9yXHJcbiAgICB0aGlzLmV2dCA9IGV2dFxyXG4gICAgdGhpcy5hcmdUeXBlID0gYXJnVHlwZVxyXG4gICAgdGhpcy5pZCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIGh0bWxUb0VsLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgdGhyb3dFeHByZXNzaW9uLFxyXG4gIHJlbW92ZUFsbENoaWxkTm9kZXNcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IHBsYXllclB1YmxpY1ZhcnMgfSBmcm9tICcuL3BsYXliYWNrLXNkaydcclxuXHJcbmNsYXNzIFNsaWRlciB7XHJcbiAgcHVibGljIGRyYWc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgc2xpZGVyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIHNsaWRlclByb2dyZXNzOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgcGVyY2VudGFnZTogbnVtYmVyID0gMDtcclxuICBwdWJsaWMgbWF4OiBudW1iZXIgPSAwO1xyXG4gIHByaXZhdGUgdG9wVG9Cb3R0b206IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBvbkRyYWdTdGFydDogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBvbkRyYWdnaW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoc3RhcnRQZXJjZW50YWdlOiBudW1iZXIsIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQsIHRvcFRvQm90dG9tOiBib29sZWFuLCBvbkRyYWdTdGFydCA9ICgpID0+IHt9LCBvbkRyYWdnaW5nID0gKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4ge30sIHNsaWRlckVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgdGhpcy5vbkRyYWdTdG9wID0gb25EcmFnU3RvcFxyXG4gICAgdGhpcy5vbkRyYWdTdGFydCA9IG9uRHJhZ1N0YXJ0XHJcbiAgICB0aGlzLm9uRHJhZ2dpbmcgPSBvbkRyYWdnaW5nXHJcbiAgICB0aGlzLnRvcFRvQm90dG9tID0gdG9wVG9Cb3R0b21cclxuICAgIHRoaXMucGVyY2VudGFnZSA9IHN0YXJ0UGVyY2VudGFnZVxyXG5cclxuICAgIHRoaXMuc2xpZGVyRWwgPSBzbGlkZXJFbFxyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyA9IHNsaWRlckVsPy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzcylbMF0gYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCdObyBwcm9ncmVzcyBiYXIgZm91bmQnKVxyXG5cclxuICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgIC8vIGlmIGl0cyB0b3AgdG8gYm90dG9tIHdlIG11c3Qgcm90YXRlIHRoZSBlbGVtZW50IGR1ZSByZXZlcnNlZCBoZWlnaHQgY2hhbmdpbmdcclxuICAgICAgdGhpcy5zbGlkZXJFbCEuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZXgoMTgwZGVnKSdcclxuICAgICAgdGhpcy5zbGlkZXJFbCEuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ3RyYW5zZm9ybS1vcmlnaW46IHRvcCdcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNoYW5nZUJhckxlbmd0aCgpXHJcbiAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnYmFja2dyb3VuZC1jb2xvcicpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUJhciAobW9zUG9zVmFsOiBudW1iZXIpIHtcclxuICAgIGxldCBwb3NpdGlvblxyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgcG9zaXRpb24gPSBtb3NQb3NWYWwgLSB0aGlzLnNsaWRlckVsIS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS55XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwb3NpdGlvbiA9IG1vc1Bvc1ZhbCAtIHRoaXMuc2xpZGVyRWwhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnhcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAvLyBtaW51cyAxMDAgYmVjYXVzZSBtb2RpZnlpbmcgaGVpZ2h0IGlzIHJldmVyc2VkXHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDEwMCAtICgxMDAgKiAocG9zaXRpb24gLyB0aGlzLnNsaWRlckVsIS5jbGllbnRIZWlnaHQpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wZXJjZW50YWdlID0gMTAwICogKHBvc2l0aW9uIC8gdGhpcy5zbGlkZXJFbCEuY2xpZW50V2lkdGgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucGVyY2VudGFnZSA+IDEwMCkge1xyXG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAxMDBcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBlcmNlbnRhZ2UgPCAwKSB7XHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDBcclxuICAgIH1cclxuICAgIHRoaXMuY2hhbmdlQmFyTGVuZ3RoKClcclxuICB9O1xyXG5cclxuICBwcml2YXRlIGNoYW5nZUJhckxlbmd0aCAoKSB7XHJcbiAgICAvLyBzZXQgYmFja2dyb3VuZCBjb2xvciBvZiBhbGwgbW92aW5nIHNsaWRlcnMgcHJvZ3Jlc3MgYXMgdGhlIHNwb3RpZnkgZ3JlZW5cclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMWRiOTU0J1xyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUuaGVpZ2h0ID0gdGhpcy5wZXJjZW50YWdlICsgJyUnXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSB0aGlzLnBlcmNlbnRhZ2UgKyAnJSdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVycyAoKSB7XHJcbiAgICB0aGlzLmFkZE1vdXNlRXZlbnRzKClcclxuICAgIHRoaXMuYWRkVG91Y2hFdmVudHMoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRUb3VjaEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLnNsaWRlckVsPy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWcgPSB0cnVlXHJcbiAgICAgIGlmICh0aGlzLm9uRHJhZ1N0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdGFydCgpXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgpXHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgKGV2dCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdnaW5nKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdG9wKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICAvLyByZW1vdmUgdGhlIGlubGluZSBjc3Mgc28gdGhhdCBpdHMgb3JpZ2luYWwgYmFja2dyb3VuZCBjb2xvciByZXR1cm5zXHJcbiAgICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JhY2tncm91bmQtY29sb3InKVxyXG4gICAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZE1vdXNlRXZlbnRzICgpIHtcclxuICAgIHRoaXMuc2xpZGVyRWw/LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldnQpID0+IHtcclxuICAgICAgdGhpcy5kcmFnID0gdHJ1ZVxyXG4gICAgICBpZiAodGhpcy5vbkRyYWdTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RhcnQoKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFkpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ2dpbmcodGhpcy5wZXJjZW50YWdlKVxyXG4gICAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2xpZW50WSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RvcCh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmxpbmUgY3NzIHNvIHRoYXQgaXRzIG9yaWdpbmFsIGJhY2tncm91bmQgY29sb3IgcmV0dXJuc1xyXG4gICAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJylcclxuICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BvdGlmeVBsYXliYWNrRWxlbWVudCB7XHJcbiAgcHJpdmF0ZSB0aXRsZTogRWxlbWVudCB8IG51bGw7XHJcbiAgcHVibGljIGN1cnJUaW1lOiBFbGVtZW50IHwgbnVsbDtcclxuICBwdWJsaWMgZHVyYXRpb246IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBwbGF5UGF1c2U6IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBzb25nUHJvZ3Jlc3M6IFNsaWRlciB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgdm9sdW1lQmFyOiBTbGlkZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGxcclxuICAgIHRoaXMuY3VyclRpbWUgPSBudWxsXHJcbiAgICB0aGlzLmR1cmF0aW9uID0gbnVsbFxyXG4gICAgdGhpcy5wbGF5UGF1c2UgPSBudWxsXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0QXJ0aXN0cyAoYXJ0aXN0SHRtbDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBhcnRpc3ROYW1lRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJBcnRpc3RzKVxyXG4gICAgaWYgKGFydGlzdE5hbWVFbCkge1xyXG4gICAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdE5hbWVFbClcclxuICAgICAgYXJ0aXN0TmFtZUVsLmlubmVySFRNTCArPSBhcnRpc3RIdG1sXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0SW1nU3JjIChpbWdTcmM6IHN0cmluZykge1xyXG4gICAgY29uc3QgcGxheWVyVHJhY2tJbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5ZXJUcmFja0ltZykgYXMgSFRNTEltYWdlRWxlbWVudFxyXG4gICAgaWYgKHBsYXllclRyYWNrSW1nKSB7XHJcbiAgICAgIHBsYXllclRyYWNrSW1nLnNyYyA9IGltZ1NyY1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFRpdGxlICh0aXRsZTogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBzZXQgdGl0bGUgYmVmb3JlIGl0IGlzIGFzc2lnbmVkJylcclxuICAgIH1cclxuICAgIHRoaXMudGl0bGUhLnRleHRDb250ZW50ID0gdGl0bGVcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRUaXRsZSAoKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLnRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIHNldCB0aXRsZSBiZWZvcmUgaXQgaXMgYXNzaWduZWQnKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMudGl0bGUudGV4dENvbnRlbnQgYXMgc3RyaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmQgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCB0byB0aGUgRE9NIGFsb25nIHdpdGggdGhlIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGJ1dHRvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGxheVByZXZGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gcGF1c2VGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGF1c2UvcGxheSBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gcGxheU5leHRGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqIEBwYXJhbSBvblNlZWtTdGFydCAtIG9uIGRyYWcgc3RhcnQgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNlZWtTb25nIC0gb24gZHJhZyBlbmQgZXZlbnQgdG8gc2VlayBzb25nIGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBvblNlZWtpbmcgLSBvbiBkcmFnZ2luZyBldmVudCBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gc2V0Vm9sdW1lIC0gb24gZHJhZ2dpbmcgYW5kIG9uIGRyYWcgZW5kIGV2ZW50IGZvciB2b2x1bWUgc2xpZGVyXHJcbiAgICogQHBhcmFtIGluaXRpYWxWb2x1bWUgLSB0aGUgaW5pdGlhbCB2b2x1bWUgdG8gc2V0IHRoZSBzbGlkZXIgYXRcclxuICAgKi9cclxuICBwdWJsaWMgYXBwZW5kV2ViUGxheWVySHRtbCAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBvblNlZWtTdGFydDogKCkgPT4gdm9pZCxcclxuICAgIHNlZWtTb25nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgb25TZWVraW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgc2V0Vm9sdW1lOiAocGVyY2VudGFnZTogbnVtYmVyLCBzYXZlOiBib29sZWFuKSA9PiB2b2lkLFxyXG4gICAgaW5pdGlhbFZvbHVtZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgPGFydGljbGUgaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllcn1cIiBjbGFzcz1cInJlc2l6ZS1kcmFnXCI+XHJcbiAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCIgc3JjPVwiJHtjb25maWcuUEFUSFMucHJvZmlsZVVzZXJ9XCIgYWx0PVwidHJhY2tcIiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucGxheWVyVHJhY2tJbWd9XCIvPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY29sdW1ufVwiIHN0eWxlPVwiZmxleC1iYXNpczogMzAlOyBtYXgtd2lkdGg6IDE4LjV2dztcIj5cclxuICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+U2VsZWN0IGEgU29uZzwvaDQ+XHJcbiAgICAgICAgPHNwYW4gaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllckFydGlzdHN9XCI+PC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLndlYlBsYXllckNvbnRyb2xzfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCI+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxhcnRpY2xlIGlkPVwid2ViLXBsYXllci1idXR0b25zXCI+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnNodWZmbGV9XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5zaHVmZmxlSWNvbn1cIi8+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXlQcmV2fVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlQcmV2fVwiIGFsdD1cInByZXZpb3VzXCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQbGF5UGF1c2V9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRufVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5TmV4dH1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJ9XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5TmV4dH1cIiBhbHQ9XCJuZXh0XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9hcnRpY2xlPlxyXG4gICAgICAgICAgPGRpdiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyVm9sdW1lfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2xpZGVyfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3N9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcn1cIj5cclxuICAgICAgICAgIDxwPjA6MDA8L3A+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzc31cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNsaWRlcn1cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnByb2dyZXNzfVwiPjwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvYXJ0aWNsZT5cclxuICAgIGBcclxuXHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGh0bWxUb0VsKGh0bWwpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh3ZWJQbGF5ZXJFbCBhcyBOb2RlKVxyXG4gICAgdGhpcy5nZXRXZWJQbGF5ZXJFbHMoXHJcbiAgICAgIG9uU2Vla1N0YXJ0LFxyXG4gICAgICBzZWVrU29uZyxcclxuICAgICAgb25TZWVraW5nLFxyXG4gICAgICBzZXRWb2x1bWUsXHJcbiAgICAgIGluaXRpYWxWb2x1bWUpXHJcbiAgICB0aGlzLmFzc2lnbkV2ZW50TGlzdGVuZXJzKFxyXG4gICAgICBwbGF5UHJldkZ1bmMsXHJcbiAgICAgIHBhdXNlRnVuYyxcclxuICAgICAgcGxheU5leHRGdW5jXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGVyY2VudERvbmUgdGhlIHBlcmNlbnQgb2YgdGhlIHNvbmcgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gdGhlIGN1cnJlbnQgcG9zaXRpb24gaW4gbXMgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlRWxlbWVudCAocGVyY2VudERvbmU6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikge1xyXG4gICAgLy8gaWYgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyIGRvbid0IGF1dG8gdXBkYXRlXHJcbiAgICBpZiAocG9zaXRpb24gIT09IDAgJiYgIXRoaXMuc29uZ1Byb2dyZXNzIS5kcmFnKSB7XHJcbiAgICAgIC8vIHJvdW5kIGVhY2ggaW50ZXJ2YWwgdG8gdGhlIG5lYXJlc3Qgc2Vjb25kIHNvIHRoYXQgdGhlIG1vdmVtZW50IG9mIHByb2dyZXNzIGJhciBpcyBieSBzZWNvbmQuXHJcbiAgICAgIHRoaXMuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50RG9uZX0lYFxyXG4gICAgICBpZiAodGhpcy5jdXJyVGltZSA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHRpbWUgZWxlbWVudCBpcyBudWxsJylcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhwb3NpdGlvbilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzIG9uY2UgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCBoYXMgYmVlbiBhcHBlbmVkZWQgdG8gdGhlIERPTS4gSW5pdGlhbGl6ZXMgU2xpZGVycy5cclxuICAgKiBAcGFyYW0gb25TZWVrU3RhcnQgLSBvbiBkcmFnIHN0YXJ0IGV2ZW50IGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBzZWVrU29uZyAtIG9uIGRyYWcgZW5kIGV2ZW50IHRvIHNlZWsgc29uZyBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gb25TZWVraW5nIC0gb24gZHJhZ2dpbmcgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNldFZvbHVtZSAtIG9uIGRyYWdnaW5nIGFuZCBvbiBkcmFnIGVuZCBldmVudCBmb3Igdm9sdW1lIHNsaWRlclxyXG4gICAqIEBwYXJhbSBpbml0aWFsVm9sdW1lIC0gdGhlIGluaXRpYWwgdm9sdW1lIHRvIHNldCB0aGUgc2xpZGVyIGF0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRXZWJQbGF5ZXJFbHMgKFxyXG4gICAgb25TZWVrU3RhcnQ6ICgpID0+IHZvaWQsXHJcbiAgICBzZWVrU29uZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIG9uU2Vla2luZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIHNldFZvbHVtZTogKHBlcmNlbnRhZ2U6IG51bWJlciwgc2F2ZTogYm9vbGVhbikgPT4gdm9pZCxcclxuICAgIGluaXRpYWxWb2x1bWU6IG51bWJlcikge1xyXG4gICAgY29uc3Qgd2ViUGxheWVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXIpID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHBsYXlUaW1lQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVRpbWVCYXIpID8/IHRocm93RXhwcmVzc2lvbigncGxheSB0aW1lIGJhciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICBjb25zdCBzb25nU2xpZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzcykgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHByb2dyZXNzIGJhciBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCB2b2x1bWVTbGlkZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclZvbHVtZSkgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHZvbHVtZSBiYXIgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICAgIHRoaXMuc29uZ1Byb2dyZXNzID0gbmV3IFNsaWRlcigwLCBzZWVrU29uZywgZmFsc2UsIG9uU2Vla1N0YXJ0LCBvblNlZWtpbmcsIHNvbmdTbGlkZXJFbClcclxuICAgIHRoaXMudm9sdW1lQmFyID0gbmV3IFNsaWRlcihpbml0aWFsVm9sdW1lICogMTAwLCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIGZhbHNlKSwgZmFsc2UsICgpID0+IHt9LCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIHRydWUpLCB2b2x1bWVTbGlkZXJFbClcclxuXHJcbiAgICB0aGlzLnRpdGxlID0gd2ViUGxheWVyRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2g0JylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgdGl0bGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXl0aW1lIGJhciBlbGVtZW50c1xyXG4gICAgdGhpcy5jdXJyVGltZSA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgY3VycmVudCB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgdGhpcy5kdXJhdGlvbiA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMV0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgZHVyYXRpb24gdGltZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICB0aGlzLnBsYXlQYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc2lnbnMgdGhlIGV2ZW50cyB0byBydW4gb24gZWFjaCBidXR0b24gcHJlc3MgdGhhdCBleGlzdHMgb24gdGhlIHdlYiBwbGF5ZXIgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwbGF5UHJldkZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwYXVzZUZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheS9wYXVzZSBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwbGF5TmV4dEZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3NpZ25FdmVudExpc3RlbmVycyAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQpIHtcclxuICAgIGNvbnN0IHBsYXlQcmV2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVByZXYpXHJcbiAgICBjb25zdCBwbGF5TmV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlOZXh0KVxyXG4gICAgY29uc3Qgc2h1ZmZsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnNodWZmbGUpXHJcblxyXG4gICAgc2h1ZmZsZT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlID0gIXBsYXllclB1YmxpY1ZhcnMuaXNTaHVmZmxlXHJcbiAgICB9KVxyXG4gICAgcGxheVByZXY/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxheVByZXZGdW5jKVxyXG4gICAgcGxheU5leHQ/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGxheU5leHRGdW5jKVxyXG5cclxuICAgIHRoaXMucGxheVBhdXNlPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBhdXNlRnVuYylcclxuICAgIHRoaXMuc29uZ1Byb2dyZXNzPy5hZGRFdmVudExpc3RlbmVycygpXHJcbiAgICB0aGlzLnZvbHVtZUJhcj8uYWRkRXZlbnRMaXN0ZW5lcnMoKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGNvbmZpZyxcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIGh0bWxUb0VsLFxyXG4gIGdldFZhbGlkSW1hZ2UsXHJcbiAgc2h1ZmZsZVxyXG59IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyLFxyXG4gIGlzU2FtZVBsYXlpbmdVUkksXHJcbiAgaXNTYW1lUGxheWluZ1VSSVdpdGhFbCxcclxuICBwbGF5ZXJQdWJsaWNWYXJzXHJcbn0gZnJvbSAnLi9wbGF5YmFjay1zZGsnXHJcbmltcG9ydCBBbGJ1bSBmcm9tICcuL2FsYnVtJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcbmltcG9ydCBQbGF5YWJsZUV2ZW50QXJnIGZyb20gJy4vcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzJ1xyXG5pbXBvcnQgeyBTcG90aWZ5SW1nLCBGZWF0dXJlc0RhdGEsIElBcnRpc3RUcmFja0RhdGEsIElQbGF5YWJsZSwgRXh0ZXJuYWxVcmxzLCBUcmFja0RhdGEgfSBmcm9tICcuLi8uLi90eXBlcydcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QsIHsgYXJyYXlUb0RvdWJseUxpbmtlZExpc3QsIERvdWJseUxpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi4vY29tcG9uZW50cy9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL3B1YnN1Yi9hZ2dyZWdhdG9yJ1xyXG5cclxuY29uc3QgZXZlbnRBZ2dyZWdhdG9yID0gKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciBhcyBFdmVudEFnZ3JlZ2F0b3JcclxuXHJcbmNsYXNzIFRyYWNrIGV4dGVuZHMgQ2FyZCBpbXBsZW1lbnRzIElQbGF5YWJsZSB7XHJcbiAgcHJpdmF0ZSBleHRlcm5hbFVybHM6IEV4dGVybmFsVXJscztcclxuICBwcml2YXRlIF9pZDogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3RpdGxlOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfZHVyYXRpb246IHN0cmluZztcclxuICBwcml2YXRlIF91cmk6IHN0cmluZztcclxuICBwcml2YXRlIF9kYXRlQWRkZWRUb1BsYXlsaXN0OiBEYXRlO1xyXG5cclxuICBwb3B1bGFyaXR5OiBzdHJpbmc7XHJcbiAgcmVsZWFzZURhdGU6IERhdGU7XHJcbiAgYWxidW06IEFsYnVtO1xyXG4gIGZlYXR1cmVzOiBGZWF0dXJlc0RhdGEgfCB1bmRlZmluZWQ7XHJcbiAgaW1hZ2VVcmw6IHN0cmluZztcclxuICBzZWxFbDogRWxlbWVudDtcclxuICBvblBsYXlpbmc6IEZ1bmN0aW9uXHJcbiAgb25TdG9wcGVkOiBGdW5jdGlvblxyXG4gIGFydGlzdHNIdG1sOiBzdHJpbmdcclxuXHJcbiAgcHVibGljIGdldCBpZCAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9pZFxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB0aXRsZSAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl90aXRsZVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB1cmkgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fdXJpXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGRhdGVBZGRlZFRvUGxheWxpc3QgKCk6IERhdGUge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3RcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXREYXRlQWRkZWRUb1BsYXlsaXN0ICh2YWw6IHN0cmluZyB8IG51bWJlciB8IERhdGUpIHtcclxuICAgIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3QgPSBuZXcgRGF0ZSh2YWwpXHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvciAocHJvcHM6IHsgdGl0bGU6IHN0cmluZzsgaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPjsgZHVyYXRpb246IG51bWJlcjsgdXJpOiBzdHJpbmc7IHBvcHVsYXJpdHk6IHN0cmluZzsgcmVsZWFzZURhdGU6IHN0cmluZzsgaWQ6IHN0cmluZzsgYWxidW06IEFsYnVtOyBleHRlcm5hbFVybHM6IEV4dGVybmFsVXJsczsgYXJ0aXN0czogQXJyYXk8dW5rbm93bj47IGlkeDogbnVtYmVyIH0pIHtcclxuICAgIHN1cGVyKClcclxuICAgIGNvbnN0IHtcclxuICAgICAgdGl0bGUsXHJcbiAgICAgIGltYWdlcyxcclxuICAgICAgZHVyYXRpb24sXHJcbiAgICAgIHVyaSxcclxuICAgICAgcG9wdWxhcml0eSxcclxuICAgICAgcmVsZWFzZURhdGUsXHJcbiAgICAgIGlkLFxyXG4gICAgICBhbGJ1bSxcclxuICAgICAgZXh0ZXJuYWxVcmxzLFxyXG4gICAgICBhcnRpc3RzXHJcbiAgICB9ID0gcHJvcHNcclxuXHJcbiAgICB0aGlzLmV4dGVybmFsVXJscyA9IGV4dGVybmFsVXJsc1xyXG4gICAgdGhpcy5faWQgPSBpZFxyXG4gICAgdGhpcy5fdGl0bGUgPSB0aXRsZVxyXG4gICAgdGhpcy5hcnRpc3RzSHRtbCA9IHRoaXMuZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMoYXJ0aXN0cylcclxuICAgIHRoaXMuX2R1cmF0aW9uID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhkdXJhdGlvbilcclxuICAgIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3QgPSBuZXcgRGF0ZSgpXHJcblxyXG4gICAgLy8gZWl0aGVyIHRoZSBub3JtYWwgdXJpLCBvciB0aGUgbGlua2VkX2Zyb20udXJpXHJcbiAgICB0aGlzLl91cmkgPSB1cmlcclxuICAgIHRoaXMucG9wdWxhcml0eSA9IHBvcHVsYXJpdHlcclxuICAgIHRoaXMucmVsZWFzZURhdGUgPSBuZXcgRGF0ZShyZWxlYXNlRGF0ZSlcclxuICAgIHRoaXMuYWxidW0gPSBhbGJ1bVxyXG4gICAgdGhpcy5mZWF0dXJlcyA9IHVuZGVmaW5lZFxyXG5cclxuICAgIHRoaXMuaW1hZ2VVcmwgPSBnZXRWYWxpZEltYWdlKGltYWdlcylcclxuICAgIHRoaXMuc2VsRWwgPSBodG1sVG9FbCgnPD48Lz4nKSBhcyBFbGVtZW50XHJcblxyXG4gICAgdGhpcy5vblBsYXlpbmcgPSAoKSA9PiB7fVxyXG4gICAgdGhpcy5vblN0b3BwZWQgPSAoKSA9PiB7fVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaWx0ZXJEYXRhRnJvbUFydGlzdHMgKGFydGlzdHM6IEFycmF5PHVua25vd24+KSB7XHJcbiAgICByZXR1cm4gYXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4gYXJ0aXN0IGFzIElBcnRpc3RUcmFja0RhdGEpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdlbmVyYXRlSFRNTEFydGlzdE5hbWVzIChhcnRpc3RzOiBBcnJheTx1bmtub3duPikge1xyXG4gICAgY29uc3QgYXJ0aXN0c0RhdGFzID0gdGhpcy5maWx0ZXJEYXRhRnJvbUFydGlzdHMoYXJ0aXN0cylcclxuICAgIGxldCBhcnRpc3ROYW1lcyA9ICcnXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFydGlzdHNEYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBhcnRpc3QgPSBhcnRpc3RzRGF0YXNbaV1cclxuICAgICAgYXJ0aXN0TmFtZXMgKz0gYDxhIGhyZWY9XCIke2FydGlzdC5leHRlcm5hbF91cmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcnRpc3QubmFtZX08L2E+YFxyXG5cclxuICAgICAgaWYgKGkgPCBhcnRpc3RzRGF0YXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIGFydGlzdE5hbWVzICs9ICcsICdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFydGlzdE5hbWVzXHJcbiAgfVxyXG5cclxuICAvKiogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIHRyYWNrLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFRyYWNrQ2FyZEh0bWwgKGlkeDogbnVtYmVyLCB1bmFuaW1hdGVkQXBwZWFyID0gZmFsc2UpIDogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLnRyYWNrUHJlZml4fSR7aWR4fWBcclxuICAgIHRoaXMuY2FyZElkID0gaWRcclxuICAgIGNvbnN0IGFwcGVhckNsYXNzID0gdW5hbmltYXRlZEFwcGVhciA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIgOiAnJ1xyXG5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZhZGVJblxyXG4gICAgfSAke2FwcGVhckNsYXNzfVwiPlxyXG4gICAgICAgICAgICAgIDxoNCBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucmFua31cIj4ke2lkeCArIDF9LjwvaDQ+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3RcclxuICAgIH0gICR7Y29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJ9XCI+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkSW5uZXJcclxuICAgIH0gJHtjb25maWcuQ1NTLkNMQVNTRVMudHJhY2t9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEZyb250XHJcbiAgICAgICAgICAgICAgICAgIH1cIiAgdGl0bGU9XCJDbGljayB0byB2aWV3IG1vcmUgSW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMucmVzdHJpY3RGbGlwT25DbGlja309XCJ0cnVlXCIgaWQ9XCIke3RoaXMuX3VyaX1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiIHRpdGxlPVwiQ2xpY2sgdG8gcGxheSBzb25nXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMuaW1hZ2VVcmx9XCIgYWx0PVwiQWxidW0gQ292ZXJcIj48L2ltZz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5EdXJhdGlvbjo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5fZHVyYXRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5SZWxlYXNlIERhdGU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMucmVsZWFzZURhdGUudG9EYXRlU3RyaW5nKCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5BbGJ1bSBOYW1lOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwICR7Y29uZmlnLkNTUy5BVFRSSUJVVEVTLnJlc3RyaWN0RmxpcE9uQ2xpY2t9PVwidHJ1ZVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPiR7XHJcbiAgICAgIHRoaXMuYWxidW0ubmFtZVxyXG4gICAgfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbCkgYXMgSFRNTEVsZW1lbnRcclxuICAgIGNvbnN0IHBsYXlCdG4gPSBlbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRuKVswXVxyXG5cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5QnRuXHJcblxyXG4gICAgcGxheUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgdHJhY2tOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4odGhpcylcclxuICAgICAgdGhpcy5wbGF5UGF1c2VDbGljayh0cmFja05vZGUpXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBsYXlQYXVzZUNsaWNrICh0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4sIHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxJUGxheWFibGU+IHwgbnVsbCA9IG51bGwpIHtcclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcyBhcyBJUGxheWFibGVcclxuICAgIGxldCB0cmFja0FyciA9IG51bGxcclxuXHJcbiAgICBpZiAodHJhY2tMaXN0KSB7XHJcbiAgICAgIHRyYWNrQXJyID0gdHJhY2tMaXN0LnRvQXJyYXkoKVxyXG4gICAgfVxyXG4gICAgZXZlbnRBZ2dyZWdhdG9yLnB1Ymxpc2gobmV3IFBsYXlhYmxlRXZlbnRBcmcodHJhY2ssIHRyYWNrTm9kZSwgdHJhY2tBcnIpKVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldCBhIHRyYWNrIGh0bWwgdG8gYmUgcGxhY2VkIGFzIGEgbGlzdCBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5RGF0ZSAtIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgZGF0ZS5cclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQbGF5bGlzdFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4sIGRpc3BsYXlEYXRlOiBib29sZWFuID0gdHJ1ZSk6IE5vZGUge1xyXG4gICAgY29uc3QgdHJhY2tOb2RlID0gdHJhY2tMaXN0LmZpbmQoKHgpID0+IHgudXJpID09PSB0aGlzLnVyaSwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgLy8gZm9yIHRoZSB1bmlxdWUgcGxheSBwYXVzZSBJRCBhbHNvIHVzZSB0aGUgZGF0ZSBhZGRlZCB0byBwbGF5bGlzdCBhcyB0aGVyZSBjYW4gYmUgZHVwbGljYXRlcyBvZiBhIHNvbmcgaW4gYSBwbGF5bGlzdC5cclxuICAgIGNvbnN0IHBsYXlQYXVzZUlkID0gdGhpcy5fdXJpICsgdGhpcy5kYXRlQWRkZWRUb1BsYXlsaXN0XHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RUcmFja31cIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtwbGF5UGF1c2VJZH1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJV2l0aEVsKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIiBzcmM9XCIke1xyXG4gICAgICB0aGlzLmltYWdlVXJsXHJcbiAgICB9XCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmxpbmtzfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubmFtZVxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX1cclxuICAgICAgICAgICAgICAgICAgPC9oND5cclxuICAgICAgICAgICAgICAgIDxhLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dGhpcy5hcnRpc3RzSHRtbH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgICAgJHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlEYXRlXHJcbiAgICAgICAgICAgICAgICAgID8gYDxoNT4ke3RoaXMuZGF0ZUFkZGVkVG9QbGF5bGlzdC50b0xvY2FsZURhdGVTdHJpbmcoKX08L2g1PmBcclxuICAgICAgICAgICAgICAgICAgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbClcclxuXHJcbiAgICAvLyBnZXQgcGxheSBwYXVzZSBidXR0b25cclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ0biA9IGVsPy5jaGlsZE5vZGVzWzFdXHJcbiAgICBpZiAocGxheVBhdXNlQnRuID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxheSBwYXVzZSBidXR0b24gb24gdHJhY2sgd2FzIG5vdCBmb3VuZCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbEVsID0gcGxheVBhdXNlQnRuIGFzIEVsZW1lbnRcclxuICAgIHBsYXlQYXVzZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSwgdHJhY2tMaXN0KSlcclxuXHJcbiAgICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyKHRoaXMudXJpLCBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudCwgdHJhY2tOb2RlKVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICAvKiogR2V0IGEgdHJhY2sgaHRtbCB0byBiZSBwbGFjZWQgYXMgYSBsaXN0IGVsZW1lbnQgb24gYSByYW5rZWQgbGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz59IHRyYWNrTGlzdCAtIGxpc3Qgb2YgdHJhY2tzIHRoYXQgY29udGFpbnMgdGhpcyB0cmFjay5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFuayAtIHRoZSByYW5rIG9mIHRoaXMgY2FyZFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFJhbmtlZFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiwgcmFuazogbnVtYmVyKTogTm9kZSB7XHJcbiAgICBjb25zdCB0cmFja05vZGUgPSB0cmFja0xpc3QuZmluZCgoeCkgPT4geC51cmkgPT09IHRoaXMudXJpLCB0cnVlKSBhcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5bGlzdFRyYWNrfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucmFua2VkVHJhY2tJbnRlcmFjdH0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUklXaXRoRWwodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cIiR7dGhpcy5fdXJpfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheUJ0bn0gJHtcclxuICAgICAgICAgICAgICAgICAgaXNTYW1lUGxheWluZ1VSSVdpdGhFbCh0aGlzLnVyaSkgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgICAgICAgICAgICAgfVwiPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxwPiR7cmFua30uPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCIgc3JjPVwiJHtcclxuICAgICAgdGhpcy5pbWFnZVVybFxyXG4gICAgfVwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5saW5rc31cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3RoaXMuZXh0ZXJuYWxVcmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5hbWVcclxuICAgIH1cIj4ke3RoaXMudGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8YS8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlxyXG4gICAgICAgICAgICAgICAgICAke3RoaXMuYXJ0aXN0c0h0bWx9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aDU+JHt0aGlzLl9kdXJhdGlvbn08L2g1PlxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICBgXHJcblxyXG4gICAgY29uc3QgZWwgPSBodG1sVG9FbChodG1sKVxyXG5cclxuICAgIC8vIGdldCBwbGF5IHBhdXNlIGJ1dHRvblxyXG4gICAgY29uc3QgcGxheVBhdXNlQnRuID0gZWw/LmNoaWxkTm9kZXNbMV0uY2hpbGROb2Rlc1sxXVxyXG5cclxuICAgIGlmIChwbGF5UGF1c2VCdG4gPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGF5IHBhdXNlIGJ1dHRvbiBvbiB0cmFjayB3YXMgbm90IGZvdW5kJylcclxuICAgIH1cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudFxyXG5cclxuICAgIC8vIHNlbGVjdCB0aGUgcmFuayBhcmVhIGFzIHRvIGtlZXAgdGhlIHBsYXkvcGF1c2UgaWNvbiBzaG93blxyXG4gICAgY29uc3QgcmFua2VkSW50ZXJhY3QgPSAoZWwgYXMgSFRNTEVsZW1lbnQpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnJhbmtlZFRyYWNrSW50ZXJhY3QpWzBdXHJcbiAgICB0aGlzLm9uUGxheWluZyA9ICgpID0+IHJhbmtlZEludGVyYWN0LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5vblN0b3BwZWQgPSAoKSA9PiByYW5rZWRJbnRlcmFjdC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuXHJcbiAgICBwbGF5UGF1c2VCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSwgdHJhY2tMaXN0KVxyXG4gICAgfSlcclxuXHJcbiAgICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyKHRoaXMudXJpLCBwbGF5UGF1c2VCdG4gYXMgRWxlbWVudCwgdHJhY2tOb2RlKVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICAvKiogTG9hZCB0aGUgZmVhdHVyZXMgb2YgdGhpcyB0cmFjayBmcm9tIHRoZSBzcG90aWZ5IHdlYiBhcGkuICovXHJcbiAgcHVibGljIGFzeW5jIGxvYWRGZWF0dXJlcyAoKSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvc1xyXG4gICAgICAuZ2V0KGNvbmZpZy5VUkxzLmdldFRyYWNrRmVhdHVyZXMgKyB0aGlzLmlkKVxyXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgIHRocm93IGVyclxyXG4gICAgICB9KVxyXG4gICAgY29uc3QgZmVhdHMgPSByZXMuZGF0YS5hdWRpb19mZWF0dXJlc1xyXG4gICAgdGhpcy5mZWF0dXJlcyA9IHtcclxuICAgICAgZGFuY2VhYmlsaXR5OiBmZWF0cy5kYW5jZWFiaWxpdHksXHJcbiAgICAgIGFjb3VzdGljbmVzczogZmVhdHMuYWNvdXN0aWNuZXNzLFxyXG4gICAgICBpbnN0cnVtZW50YWxuZXNzOiBmZWF0cy5pbnN0cnVtZW50YWxuZXNzLFxyXG4gICAgICB2YWxlbmNlOiBmZWF0cy52YWxlbmNlLFxyXG4gICAgICBlbmVyZ3k6IGZlYXRzLmVuZXJneVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmZlYXR1cmVzXHJcbiAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJhdGUgdHJhY2tzIGZyb20gZGF0YSBleGNsdWRpbmcgZGF0ZSBhZGRlZC5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxUcmFja0RhdGE+fSBkYXRhc1xyXG4gKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgQXJyYXk8VHJhY2s+fSB0cmFja3MgLSBkb3VibGUgbGlua2VkIGxpc3RcclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhIChkYXRhczogQXJyYXk8VHJhY2tEYXRhPiwgdHJhY2tzOiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IEFycmF5PFRyYWNrPikge1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IGRhdGEgPSBkYXRhc1tpXVxyXG4gICAgaWYgKGRhdGEpIHtcclxuICAgICAgY29uc3QgcHJvcHMgPSB7XHJcbiAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICBpbWFnZXM6IGRhdGEuYWxidW0uaW1hZ2VzLFxyXG4gICAgICAgIGR1cmF0aW9uOiBkYXRhLmR1cmF0aW9uX21zLFxyXG4gICAgICAgIHVyaTogZGF0YS5saW5rZWRfZnJvbSAhPT0gdW5kZWZpbmVkID8gZGF0YS5saW5rZWRfZnJvbS51cmkgOiBkYXRhLnVyaSxcclxuICAgICAgICBwb3B1bGFyaXR5OiBkYXRhLnBvcHVsYXJpdHksXHJcbiAgICAgICAgcmVsZWFzZURhdGU6IGRhdGEuYWxidW0ucmVsZWFzZV9kYXRlLFxyXG4gICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgIGFsYnVtOiBuZXcgQWxidW0oZGF0YS5hbGJ1bS5uYW1lLCBkYXRhLmFsYnVtLmV4dGVybmFsX3VybHMuc3BvdGlmeSksXHJcbiAgICAgICAgZXh0ZXJuYWxVcmxzOiBkYXRhLmV4dGVybmFsX3VybHMsXHJcbiAgICAgICAgYXJ0aXN0czogZGF0YS5hcnRpc3RzLFxyXG4gICAgICAgIGlkeDogaVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRyYWNrcykpIHtcclxuICAgICAgICB0cmFja3MucHVzaChuZXcgVHJhY2socHJvcHMpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRyYWNrcy5hZGQobmV3IFRyYWNrKHByb3BzKSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHJhY2tzXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyYWNrXHJcbiIsIlxyXG5pbXBvcnQgeyBJUHJvbWlzZUhhbmRsZXJSZXR1cm4sIFNwb3RpZnlJbWcgfSBmcm9tICcuLi90eXBlcydcclxuaW1wb3J0IHsgVEVSTVMsIFRFUk1fVFlQRSB9IGZyb20gJy4vY29tcG9uZW50cy9zYXZlLWxvYWQtdGVybSdcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY29uc3QgYXV0aEVuZHBvaW50ID0gJ2h0dHBzOi8vYWNjb3VudHMuc3BvdGlmeS5jb20vYXV0aG9yaXplJ1xyXG4vLyBSZXBsYWNlIHdpdGggeW91ciBhcHAncyBjbGllbnQgSUQsIHJlZGlyZWN0IFVSSSBhbmQgZGVzaXJlZCBzY29wZXNcclxuY29uc3QgcmVkaXJlY3RVcmkgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ1xyXG5jb25zdCBjbGllbnRJZCA9ICc0MzRmNWU5ZjQ0MmE0ZTQ1ODZlMDg5YTMzZjY1Yzg1NydcclxuY29uc3Qgc2NvcGVzID0gW1xyXG4gICd1Z2MtaW1hZ2UtdXBsb2FkJyxcclxuICAndXNlci1yZWFkLXBsYXliYWNrLXN0YXRlJyxcclxuICAndXNlci1tb2RpZnktcGxheWJhY2stc3RhdGUnLFxyXG4gICd1c2VyLXJlYWQtY3VycmVudGx5LXBsYXlpbmcnLFxyXG4gICdzdHJlYW1pbmcnLFxyXG4gICdhcHAtcmVtb3RlLWNvbnRyb2wnLFxyXG4gICd1c2VyLXJlYWQtZW1haWwnLFxyXG4gICd1c2VyLXJlYWQtcHJpdmF0ZScsXHJcbiAgJ3BsYXlsaXN0LXJlYWQtY29sbGFib3JhdGl2ZScsXHJcbiAgJ3BsYXlsaXN0LW1vZGlmeS1wdWJsaWMnLFxyXG4gICdwbGF5bGlzdC1yZWFkLXByaXZhdGUnLFxyXG4gICdwbGF5bGlzdC1tb2RpZnktcHJpdmF0ZScsXHJcbiAgJ3VzZXItbGlicmFyeS1tb2RpZnknLFxyXG4gICd1c2VyLWxpYnJhcnktcmVhZCcsXHJcbiAgJ3VzZXItdG9wLXJlYWQnLFxyXG4gICd1c2VyLXJlYWQtcGxheWJhY2stcG9zaXRpb24nLFxyXG4gICd1c2VyLXJlYWQtcmVjZW50bHktcGxheWVkJyxcclxuICAndXNlci1mb2xsb3ctcmVhZCcsXHJcbiAgJ3VzZXItZm9sbG93LW1vZGlmeSdcclxuXVxyXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xyXG4gIENTUzoge1xyXG4gICAgSURzOiB7XHJcbiAgICAgIHJlbW92ZUVhcmx5QWRkZWQ6ICdyZW1vdmUtZWFybHktYWRkZWQnLFxyXG4gICAgICBnZXRUb2tlbkxvYWRpbmdTcGlubmVyOiAnZ2V0LXRva2VuLWxvYWRpbmctc3Bpbm5lcicsXHJcbiAgICAgIHBsYXlsaXN0Q2FyZHNDb250YWluZXI6ICdwbGF5bGlzdC1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICB0cmFja0NhcmRzQ29udGFpbmVyOiAndHJhY2stY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgcGxheWxpc3RQcmVmaXg6ICdwbGF5bGlzdC0nLFxyXG4gICAgICB0cmFja1ByZWZpeDogJ3RyYWNrLScsXHJcbiAgICAgIHNwb3RpZnlDb250YWluZXI6ICdzcG90aWZ5LWNvbnRhaW5lcicsXHJcbiAgICAgIGluZm9Db250YWluZXI6ICdpbmZvLWNvbnRhaW5lcicsXHJcbiAgICAgIGFsbG93QWNjZXNzSGVhZGVyOiAnYWxsb3ctYWNjZXNzLWhlYWRlcicsXHJcbiAgICAgIGV4cGFuZGVkUGxheWxpc3RNb2RzOiAnZXhwYW5kZWQtcGxheWxpc3QtbW9kcycsXHJcbiAgICAgIHBsYXlsaXN0TW9kczogJ3BsYXlsaXN0LW1vZHMnLFxyXG4gICAgICB0cmFja3NEYXRhOiAndHJhY2tzLWRhdGEnLFxyXG4gICAgICB0cmFja3NDaGFydDogJ3RyYWNrcy1jaGFydCcsXHJcbiAgICAgIHRyYWNrc1Rlcm1TZWxlY3Rpb25zOiAndHJhY2tzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIGZlYXR1cmVTZWxlY3Rpb25zOiAnZmVhdHVyZS1zZWxlY3Rpb25zJyxcclxuICAgICAgcGxheWxpc3RzU2VjdGlvbjogJ3BsYXlsaXN0cy1zZWN0aW9uJyxcclxuICAgICAgdW5kbzogJ3VuZG8nLFxyXG4gICAgICByZWRvOiAncmVkbycsXHJcbiAgICAgIG1vZHNPcGVuZXI6ICdtb2RzLW9wZW5lcicsXHJcbiAgICAgIGZlYXREZWY6ICdmZWF0LWRlZmluaXRpb24nLFxyXG4gICAgICBmZWF0QXZlcmFnZTogJ2ZlYXQtYXZlcmFnZScsXHJcbiAgICAgIHJhbms6ICdyYW5rJyxcclxuICAgICAgdmlld0FsbFRvcFRyYWNrczogJ3ZpZXctYWxsLXRvcC10cmFja3MnLFxyXG4gICAgICBlbW9qaXM6ICdlbW9qaXMnLFxyXG4gICAgICBhcnRpc3RDYXJkc0NvbnRhaW5lcjogJ2FydGlzdC1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICBhcnRpc3RQcmVmaXg6ICdhcnRpc3QtJyxcclxuICAgICAgaW5pdGlhbENhcmQ6ICdpbml0aWFsLWNhcmQnLFxyXG4gICAgICBjb252ZXJ0Q2FyZDogJ2NvbnZlcnQtY2FyZCcsXHJcbiAgICAgIGFydGlzdFRlcm1TZWxlY3Rpb25zOiAnYXJ0aXN0cy10ZXJtLXNlbGVjdGlvbnMnLFxyXG4gICAgICBwcm9maWxlSGVhZGVyOiAncHJvZmlsZS1oZWFkZXInLFxyXG4gICAgICBjbGVhckRhdGE6ICdjbGVhci1kYXRhJyxcclxuICAgICAgbGlrZWRUcmFja3M6ICdsaWtlZC10cmFja3MnLFxyXG4gICAgICBmb2xsb3dlZEFydGlzdHM6ICdmb2xsb3dlZC1hcnRpc3RzJyxcclxuICAgICAgd2ViUGxheWVyOiAnd2ViLXBsYXllcicsXHJcbiAgICAgIHBsYXlUaW1lQmFyOiAncGxheXRpbWUtYmFyJyxcclxuICAgICAgcGxheWxpc3RIZWFkZXJBcmVhOiAncGxheWxpc3QtbWFpbi1oZWFkZXItYXJlYScsXHJcbiAgICAgIHBsYXlOZXh0OiAncGxheS1uZXh0JyxcclxuICAgICAgcGxheVByZXY6ICdwbGF5LXByZXYnLFxyXG4gICAgICB3ZWJQbGF5ZXJQbGF5UGF1c2U6ICdwbGF5LXBhdXNlLXBsYXllcicsXHJcbiAgICAgIHdlYlBsYXllclZvbHVtZTogJ3dlYi1wbGF5ZXItdm9sdW1lLWJhcicsXHJcbiAgICAgIHdlYlBsYXllclByb2dyZXNzOiAnd2ViLXBsYXllci1wcm9ncmVzcy1iYXInLFxyXG4gICAgICBwbGF5ZXJUcmFja0ltZzogJ3BsYXllci10cmFjay1pbWcnLFxyXG4gICAgICB3ZWJQbGF5ZXJBcnRpc3RzOiAnd2ViLXBsYXllci1hcnRpc3RzJyxcclxuICAgICAgZ2VuZXJhdGVQbGF5bGlzdDogJ2dlbmVyYXRlLXBsYXlsaXN0JyxcclxuICAgICAgaGlkZVNob3dQbGF5bGlzdFR4dDogJ2hpZGUtc2hvdy1wbGF5bGlzdC10eHQnLFxyXG4gICAgICB0b3BUcmFja3NUZXh0Rm9ybUNvbnRhaW5lcjogJ3Rlcm0tdGV4dC1mb3JtLWNvbnRhaW5lcicsXHJcbiAgICAgIHVzZXJuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgICB0b3BOYXZNb2JpbGU6ICd0b3BuYXYtbW9iaWxlJyxcclxuICAgICAgc2h1ZmZsZTogJ3NodWZmbGUnXHJcbiAgICB9LFxyXG4gICAgQ0xBU1NFUzoge1xyXG4gICAgICBnbG93OiAnZ2xvdycsXHJcbiAgICAgIHBsYXlsaXN0OiAncGxheWxpc3QnLFxyXG4gICAgICB0cmFjazogJ3RyYWNrJyxcclxuICAgICAgYXJ0aXN0OiAnYXJ0aXN0JyxcclxuICAgICAgcmFua0NhcmQ6ICdyYW5rLWNhcmQnLFxyXG4gICAgICBwbGF5bGlzdFRyYWNrOiAncGxheWxpc3QtdHJhY2snLFxyXG4gICAgICBpbmZvTG9hZGluZ1NwaW5uZXJzOiAnaW5mby1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBhcHBlYXI6ICdhcHBlYXInLFxyXG4gICAgICBoaWRlOiAnaGlkZScsXHJcbiAgICAgIHNlbGVjdGVkOiAnc2VsZWN0ZWQnLFxyXG4gICAgICBjYXJkOiAnY2FyZCcsXHJcbiAgICAgIHBsYXlsaXN0U2VhcmNoOiAncGxheWxpc3Qtc2VhcmNoJyxcclxuICAgICAgZWxsaXBzaXNXcmFwOiAnZWxsaXBzaXMtd3JhcCcsXHJcbiAgICAgIG5hbWU6ICduYW1lJyxcclxuICAgICAgcGxheWxpc3RPcmRlcjogJ3BsYXlsaXN0LW9yZGVyJyxcclxuICAgICAgY2hhcnRJbmZvOiAnY2hhcnQtaW5mbycsXHJcbiAgICAgIGZsaXBDYXJkSW5uZXI6ICdmbGlwLWNhcmQtaW5uZXInLFxyXG4gICAgICBmbGlwQ2FyZEZyb250OiAnZmxpcC1jYXJkLWZyb250JyxcclxuICAgICAgZmxpcENhcmRCYWNrOiAnZmxpcC1jYXJkLWJhY2snLFxyXG4gICAgICBmbGlwQ2FyZDogJ2ZsaXAtY2FyZCcsXHJcbiAgICAgIHJlc2l6ZUNvbnRhaW5lcjogJ3Jlc2l6ZS1jb250YWluZXInLFxyXG4gICAgICBzY3JvbGxMZWZ0OiAnc2Nyb2xsLWxlZnQnLFxyXG4gICAgICBzY3JvbGxpbmdUZXh0OiAnc2Nyb2xsaW5nLXRleHQnLFxyXG4gICAgICBub1NlbGVjdDogJ25vLXNlbGVjdCcsXHJcbiAgICAgIGRyb3BEb3duOiAnZHJvcC1kb3duJyxcclxuICAgICAgZXhwYW5kYWJsZVR4dENvbnRhaW5lcjogJ2V4cGFuZGFibGUtdGV4dC1jb250YWluZXInLFxyXG4gICAgICBib3JkZXJDb3ZlcjogJ2JvcmRlci1jb3ZlcicsXHJcbiAgICAgIGZpcnN0RXhwYW5zaW9uOiAnZmlyc3QtZXhwYW5zaW9uJyxcclxuICAgICAgc2Vjb25kRXhwYW5zaW9uOiAnc2Vjb25kLWV4cGFuc2lvbicsXHJcbiAgICAgIGludmlzaWJsZTogJ2ludmlzaWJsZScsXHJcbiAgICAgIGZhZGVJbjogJ2ZhZGUtaW4nLFxyXG4gICAgICBmcm9tVG9wOiAnZnJvbS10b3AnLFxyXG4gICAgICBleHBhbmRPbkhvdmVyOiAnZXhwYW5kLW9uLWhvdmVyJyxcclxuICAgICAgdHJhY2tzQXJlYTogJ3RyYWNrcy1hcmVhJyxcclxuICAgICAgc2Nyb2xsQmFyOiAnc2Nyb2xsLWJhcicsXHJcbiAgICAgIHRyYWNrTGlzdDogJ3RyYWNrLWxpc3QnLFxyXG4gICAgICBhcnRpc3RUb3BUcmFja3M6ICdhcnRpc3QtdG9wLXRyYWNrcycsXHJcbiAgICAgIHRleHRGb3JtOiAndGV4dC1mb3JtJyxcclxuICAgICAgY29udGVudDogJ2NvbnRlbnQnLFxyXG4gICAgICBsaW5rczogJ2xpbmtzJyxcclxuICAgICAgcHJvZ3Jlc3M6ICdwcm9ncmVzcycsXHJcbiAgICAgIHBsYXlQYXVzZTogJ3BsYXktcGF1c2UnLFxyXG4gICAgICByYW5rZWRUcmFja0ludGVyYWN0OiAncmFua2VkLWludGVyYWN0aW9uLWFyZWEnLFxyXG4gICAgICBzbGlkZXI6ICdzbGlkZXInLFxyXG4gICAgICBwbGF5QnRuOiAncGxheS1idG4nLFxyXG4gICAgICBkaXNwbGF5Tm9uZTogJ2Rpc3BsYXktbm9uZScsXHJcbiAgICAgIGNvbHVtbjogJ2NvbHVtbicsXHJcbiAgICAgIHdlYlBsYXllckNvbnRyb2xzOiAnd2ViLXBsYXllci1jb250cm9scydcclxuICAgIH0sXHJcbiAgICBBVFRSSUJVVEVTOiB7XHJcbiAgICAgIGRhdGFTZWxlY3Rpb246ICdkYXRhLXNlbGVjdGlvbicsXHJcbiAgICAgIHJlc3RyaWN0RmxpcE9uQ2xpY2s6ICdkYXRhLXJlc3RyaWN0LWZsaXAtb24tY2xpY2snXHJcbiAgICB9XHJcbiAgfSxcclxuICBVUkxzOiB7XHJcbiAgICBzaXRlVXJsOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgIGF1dGg6IGAke2F1dGhFbmRwb2ludH0/Y2xpZW50X2lkPSR7Y2xpZW50SWR9JnJlZGlyZWN0X3VyaT0ke3JlZGlyZWN0VXJpfSZzY29wZT0ke3Njb3Blcy5qb2luKFxyXG4gICAgICAnJTIwJ1xyXG4gICAgKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNob3dfZGlhbG9nPXRydWVgLFxyXG4gICAgZ2V0SGFzVG9rZW5zOiAnL3Rva2Vucy9oYXMtdG9rZW5zJyxcclxuICAgIGdldEFjY2Vzc1Rva2VuOiAnL3Rva2Vucy9nZXQtYWNjZXNzLXRva2VuJyxcclxuICAgIGdldE9idGFpblRva2Vuc1ByZWZpeDogKGNvZGU6IHN0cmluZykgPT4gYC90b2tlbnMvb2J0YWluLXRva2Vucz9jb2RlPSR7Y29kZX1gLFxyXG4gICAgZ2V0VG9wQXJ0aXN0czogJy9zcG90aWZ5L2dldC10b3AtYXJ0aXN0cz90aW1lX3JhbmdlPScsXHJcbiAgICBnZXRUb3BUcmFja3M6ICcvc3BvdGlmeS9nZXQtdG9wLXRyYWNrcz90aW1lX3JhbmdlPScsXHJcbiAgICBnZXRQbGF5bGlzdHM6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3RzJyxcclxuICAgIGdldFBsYXlsaXN0VHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0LXRyYWNrcz9wbGF5bGlzdF9pZD0nLFxyXG4gICAgcHV0Q2xlYXJUb2tlbnM6ICcvdG9rZW5zL2NsZWFyLXRva2VucycsXHJcbiAgICBkZWxldGVQbGF5bGlzdFRyYWNrczogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L2RlbGV0ZS1wbGF5bGlzdC1pdGVtcz9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIHBvc3RQbGF5bGlzdFRyYWNrczogKHBsYXlsaXN0SWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtcGxheWxpc3QtaXRlbXM/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBnZXRUcmFja0ZlYXR1cmVzOiAnL3Nwb3RpZnkvZ2V0LXRyYWNrcy1mZWF0dXJlcz90cmFja19pZHM9JyxcclxuICAgIHB1dFJlZnJlc2hBY2Nlc3NUb2tlbjogJy90b2tlbnMvcmVmcmVzaC10b2tlbicsXHJcbiAgICBwdXRTZXNzaW9uRGF0YTogJy9zcG90aWZ5L3B1dC1zZXNzaW9uLWRhdGE/YXR0cj0nLFxyXG4gICAgcHV0UGxheWxpc3RSZXNpemVEYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtcGxheWxpc3QtcmVzaXplLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5bGlzdFJlc2l6ZURhdGE6ICcvdXNlci9nZXQtcGxheWxpc3QtcmVzaXplLWRhdGEnLFxyXG4gICAgcHV0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtcGxheWxpc3QtdGV4dC1mb3JtLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGE6ICcvdXNlci9nZXQtcGxheWxpc3QtdGV4dC1mb3JtLWRhdGEnLFxyXG4gICAgcHV0VG9wVHJhY2tzSXNJblRleHRGb3JtRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXRvcC10cmFja3MtdGV4dC1mb3JtLWRhdGE/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRUb3BUcmFja3NJc0luVGV4dEZvcm1EYXRhOiAnL3VzZXIvZ2V0LXRvcC10cmFja3MtdGV4dC1mb3JtLWRhdGEnLFxyXG4gICAgZ2V0QXJ0aXN0VG9wVHJhY2tzOiAoaWQ6IHN0cmluZykgPT4gYC9zcG90aWZ5L2dldC1hcnRpc3QtdG9wLXRyYWNrcz9pZD0ke2lkfWAsXHJcbiAgICBnZXRDdXJyZW50VXNlclByb2ZpbGU6ICcvc3BvdGlmeS9nZXQtY3VycmVudC11c2VyLXByb2ZpbGUnLFxyXG4gICAgcHV0Q2xlYXJTZXNzaW9uOiAnL2NsZWFyLXNlc3Npb24nLFxyXG4gICAgZ2V0Q3VycmVudFVzZXJTYXZlZFRyYWNrczogJy9zcG90aWZ5L2dldC1jdXJyZW50LXVzZXItc2F2ZWQtdHJhY2tzJyxcclxuICAgIGdldEZvbGxvd2VkQXJ0aXN0czogJy9zcG90aWZ5L2dldC1mb2xsb3dlZC1hcnRpc3RzJyxcclxuICAgIHB1dFBsYXlUcmFjazogKGRldmljZV9pZDogc3RyaW5nLCB0cmFja191cmk6IHN0cmluZykgPT5cclxuICAgICAgYC9zcG90aWZ5L3BsYXktdHJhY2s/ZGV2aWNlX2lkPSR7ZGV2aWNlX2lkfSZ0cmFja191cmk9JHt0cmFja191cml9YCxcclxuICAgIHB1dFBsYXllclZvbHVtZURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5ZXItdm9sdW1lP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWVyVm9sdW1lRGF0YTogJy91c2VyL2dldC1wbGF5ZXItdm9sdW1lJyxcclxuICAgIHB1dFRlcm06ICh0ZXJtOiBURVJNUywgdGVybVR5cGU6IFRFUk1fVFlQRSkgPT4gYC91c2VyL3B1dC10b3AtJHt0ZXJtVHlwZX0tdGVybT90ZXJtPSR7dGVybX1gLFxyXG4gICAgZ2V0VGVybTogKHRlcm1UeXBlOiBURVJNX1RZUEUpID0+IGAvdXNlci9nZXQtdG9wLSR7dGVybVR5cGV9LXRlcm1gLFxyXG4gICAgcHV0Q3VyclBsYXlsaXN0SWQ6IChpZDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LWN1cnJlbnQtcGxheWxpc3QtaWQ/aWQ9JHtpZH1gLFxyXG4gICAgZ2V0Q3VyclBsYXlsaXN0SWQ6ICcvdXNlci9nZXQtY3VycmVudC1wbGF5bGlzdC1pZCcsXHJcbiAgICBwb3N0UGxheWxpc3Q6IChuYW1lOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LXBsYXlsaXN0P25hbWU9JHtuYW1lfWAsXHJcbiAgICBwb3N0SXRlbXNUb1BsYXlsaXN0OiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1pdGVtcy10by1wbGF5bGlzdD9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIGdldFVzZXJuYW1lOiAnL3VzZXIvZ2V0LXVzZXJuYW1lJ1xyXG4gIH0sXHJcbiAgUEFUSFM6IHtcclxuICAgIHNwaW5uZXI6ICcvaW1hZ2VzLzIwMHB4TG9hZGluZ1NwaW5uZXIuc3ZnJyxcclxuICAgIGFjb3VzdGljRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9BY291c3RpY0Vtb2ppLnN2ZycsXHJcbiAgICBub25BY291c3RpY0Vtb2ppOiAnL2ltYWdlcy9FbW9qaXMvRWxlY3RyaWNHdWl0YXJFbW9qaS5zdmcnLFxyXG4gICAgaGFwcHlFbW9qaTogJy9pbWFnZXMvRW1vamlzL0hhcHB5RW1vamkuc3ZnJyxcclxuICAgIG5ldXRyYWxFbW9qaTogJy9pbWFnZXMvRW1vamlzL05ldXRyYWxFbW9qaS5zdmcnLFxyXG4gICAgc2FkRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9TYWRFbW9qaS5zdmcnLFxyXG4gICAgaW5zdHJ1bWVudEVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvSW5zdHJ1bWVudEVtb2ppLnN2ZycsXHJcbiAgICBzaW5nZXJFbW9qaTogJy9pbWFnZXMvRW1vamlzL1NpbmdlckVtb2ppLnN2ZycsXHJcbiAgICBkYW5jaW5nRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9EYW5jaW5nRW1vamkuc3ZnJyxcclxuICAgIHNoZWVwRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9TaGVlcEVtb2ppLnN2ZycsXHJcbiAgICB3b2xmRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9Xb2xmRW1vamkuc3ZnJyxcclxuICAgIGdyaWRWaWV3OiAnL2ltYWdlcy9ncmlkLXZpZXctaWNvbi5wbmcnLFxyXG4gICAgbGlzdFZpZXc6ICcvaW1hZ2VzL2xpc3Qtdmlldy1pY29uLnBuZycsXHJcbiAgICBjaGV2cm9uTGVmdDogJy9pbWFnZXMvY2hldnJvbi1sZWZ0LnBuZycsXHJcbiAgICBjaGV2cm9uUmlnaHQ6ICcvaW1hZ2VzL2NoZXZyb24tcmlnaHQucG5nJyxcclxuICAgIHBsYXlJY29uOiAnL2ltYWdlcy9wbGF5LTMwcHgucG5nJyxcclxuICAgIHBhdXNlSWNvbjogJy9pbWFnZXMvcGF1c2UtMzBweC5wbmcnLFxyXG4gICAgcGxheUJsYWNrSWNvbjogJy9pbWFnZXMvcGxheS1ibGFjay0zMHB4LnBuZycsXHJcbiAgICBwYXVzZUJsYWNrSWNvbjogJy9pbWFnZXMvcGF1c2UtYmxhY2stMzBweC5wbmcnLFxyXG4gICAgcGxheU5leHQ6ICcvaW1hZ2VzL25leHQtMzBweC5wbmcnLFxyXG4gICAgcGxheVByZXY6ICcvaW1hZ2VzL3ByZXZpb3VzLTMwcHgucG5nJyxcclxuICAgIHByb2ZpbGVVc2VyOiAnL2ltYWdlcy9wcm9maWxlLXVzZXIucG5nJyxcclxuICAgIHNodWZmbGVJY29uOiAnL2ltYWdlcy9zaHVmZmxlLWljb24ucG5nJyxcclxuICAgIHNodWZmbGVJY29uR3JlZW46ICcvaW1hZ2VzL3NodWZmbGUtaWNvbi1ncmVlbi5wbmcnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyAobWlsbGlzOiBudW1iZXIpIHtcclxuICBjb25zdCBtaW51dGVzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1pbGxpcyAvIDYwMDAwKVxyXG4gIGNvbnN0IHNlY29uZHM6IG51bWJlciA9IHBhcnNlSW50KCgobWlsbGlzICUgNjAwMDApIC8gMTAwMCkudG9GaXhlZCgwKSlcclxuICByZXR1cm4gc2Vjb25kcyA9PT0gNjBcclxuICAgID8gbWludXRlcyArIDEgKyAnOjAwJ1xyXG4gICAgOiBtaW51dGVzICsgJzonICsgKHNlY29uZHMgPCAxMCA/ICcwJyA6ICcnKSArIHNlY29uZHNcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaHRtbFRvRWwgKGh0bWw6IHN0cmluZykge1xyXG4gIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpXHJcbiAgaHRtbCA9IGh0bWwudHJpbSgpIC8vIE5ldmVyIHJldHVybiBhIHNwYWNlIHRleHQgbm9kZSBhcyBhIHJlc3VsdFxyXG4gIHRlbXAuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHJldHVybiB0ZW1wLmNvbnRlbnQuZmlyc3RDaGlsZFxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbWlzZUhhbmRsZXI8VD4gKFxyXG4gIHByb21pc2U6IFByb21pc2U8VD4sXHJcbiAgb25TdWNjZXNmdWwgPSAocmVzOiBUKSA9PiB7IH0sXHJcbiAgb25GYWlsdXJlID0gKGVycjogdW5rbm93bikgPT4ge1xyXG4gICAgaWYgKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgIH1cclxuICB9XHJcbikge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBwcm9taXNlXHJcbiAgICBvblN1Y2Nlc2Z1bChyZXMgYXMgVClcclxuICAgIHJldHVybiB7IHJlczogcmVzLCBlcnI6IG51bGwgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcclxuICAgIG9uRmFpbHVyZShlcnIpXHJcbiAgICByZXR1cm4geyByZXM6IG51bGwsIGVycjogZXJyIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRmlsdGVycyAnbGknIGVsZW1lbnRzIHRvIGVpdGhlciBiZSBoaWRkZW4gb3Igbm90IGRlcGVuZGluZyBvbiBpZlxyXG4gKiB0aGV5IGNvbnRhaW4gc29tZSBnaXZlbiBpbnB1dCB0ZXh0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge0hUTUx9IHVsIC0gdW5vcmRlcmVkIGxpc3QgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSAnbGknIHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7SFRNTH0gaW5wdXQgLSBpbnB1dCBlbGVtZW50IHdob3NlIHZhbHVlIHdpbGwgYmUgdXNlZCB0byBmaWx0ZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ZERpc3BsYXkgLSB0aGUgc3RhbmRhcmQgZGlzcGxheSB0aGUgJ2xpJyBzaG91bGQgaGF2ZSB3aGVuIG5vdCAnbm9uZSdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hVbCAodWw6IEhUTUxVTGlzdEVsZW1lbnQsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50LCBzdGREaXNwbGF5OiBzdHJpbmcgPSAnZmxleCcpOiB2b2lkIHtcclxuICBjb25zdCBsaUVscyA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpXHJcbiAgY29uc3QgZmlsdGVyID0gaW5wdXQudmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpRWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBnZXQgdGhlIG5hbWUgY2hpbGQgZWwgaW4gdGhlIGxpIGVsXHJcbiAgICBjb25zdCBuYW1lID0gbGlFbHNbaV0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMubmFtZSlbMF1cclxuICAgIGNvbnN0IG5hbWVUeHQgPSBuYW1lLnRleHRDb250ZW50IHx8IG5hbWUuaW5uZXJIVE1MXHJcblxyXG4gICAgaWYgKG5hbWVUeHQgJiYgbmFtZVR4dC50b1VwcGVyQ2FzZSgpLmluZGV4T2YoZmlsdGVyKSA+IC0xKSB7XHJcbiAgICAgIC8vIHNob3cgbGkncyB3aG9zZSBuYW1lIGNvbnRhaW5zIHRoZSB0aGUgZW50ZXJlZCBzdHJpbmdcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9IHN0ZERpc3BsYXlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG90aGVyd2lzZSBoaWRlIGl0XHJcbiAgICAgIGxpRWxzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cclxuICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cclxuICpcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoICh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgbGV0IG1ldHJpY3M6IFRleHRNZXRyaWNzXHJcbiAgaWYgKGNvbnRleHQpIHtcclxuICAgIGNvbnRleHQuZm9udCA9IGZvbnRcclxuICAgIG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpXHJcbiAgICByZXR1cm4gbWV0cmljcy53aWR0aFxyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdObyBjb250ZXh0IG9uIGNyZWF0ZWQgY2FudmFzIHdhcyBmb3VuZCcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsbGlwc2lzQWN0aXZlIChlbDogSFRNTEVsZW1lbnQpIHtcclxuICByZXR1cm4gZWwub2Zmc2V0V2lkdGggPCBlbC5zY3JvbGxXaWR0aFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyIChzdHJpbmc6IHN0cmluZykge1xyXG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbGlkSW1hZ2UgKGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGlkeCA9IDApIHtcclxuICAvLyBvYnRhaW4gdGhlIGNvcnJlY3QgaW1hZ2VcclxuICBpZiAoaW1hZ2VzLmxlbmd0aCA+IGlkeCkge1xyXG4gICAgY29uc3QgaW1nID0gaW1hZ2VzW2lkeF1cclxuICAgIHJldHVybiBpbWcudXJsXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUFsbENoaWxkTm9kZXMgKHBhcmVudDogTm9kZSkge1xyXG4gIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGFuaW1hdGlvbkNvbnRyb2wgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8qKiBBZGRzIGEgY2xhc3MgdG8gZWFjaCBlbGVtZW50IGNhdXNpbmcgYSB0cmFuc2l0aW9uIHRvIHRoZSBjaGFuZ2VkIGNzcyB2YWx1ZXMuXHJcbiAgICogVGhpcyBpcyBkb25lIG9uIHNldCBpbnRlcnZhbHMuXHJcbiAgICpcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBpbmNsdWRpbmcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzVG9UcmFuc2l0aW9uVG9vIC0gVGhlIGNsYXNzIHRoYXQgYWxsIHRoZSB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIHdpbGwgYWRkXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuaW1hdGlvbkludGVydmFsIC0gVGhlIGludGVydmFsIHRvIHdhaXQgYmV0d2VlbiBhbmltYXRpb24gb2YgZWxlbWVudHNcclxuICAgKi9cclxuICBmdW5jdGlvbiBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMgKFxyXG4gICAgZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZyxcclxuICAgIGNsYXNzVG9UcmFuc2l0aW9uVG9vOiBzdHJpbmcsXHJcbiAgICBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyXHJcbiAgKSB7XHJcbiAgICAvLyBhcnIgb2YgaHRtbCBzZWxlY3RvcnMgdGhhdCBwb2ludCB0byBlbGVtZW50cyB0byBhbmltYXRlXHJcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudHNUb0FuaW1hdGUuc3BsaXQoJywnKVxyXG5cclxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYXR0cilcclxuICAgICAgbGV0IGlkeCA9IDBcclxuICAgICAgLy8gaW4gaW50ZXJ2YWxzIHBsYXkgdGhlaXIgaW5pdGlhbCBhbmltYXRpb25zXHJcbiAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpZHggPT09IGVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaWR4XVxyXG4gICAgICAgIC8vIGFkZCB0aGUgY2xhc3MgdG8gdGhlIGVsZW1lbnRzIGNsYXNzZXMgaW4gb3JkZXIgdG8gcnVuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9UcmFuc2l0aW9uVG9vKVxyXG4gICAgICAgIGlkeCArPSAxXHJcbiAgICAgIH0sIGFuaW1hdGlvbkludGVydmFsKVxyXG4gICAgfSlcclxuICB9XHJcbiAgLyoqIEFuaW1hdGVzIGFsbCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYSBjZXJ0YWluIGNsYXNzIG9yIGlkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZWxlbWVudHNUb0FuaW1hdGUgLSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNsYXNzZXMgb3IgaWRzIG9mIGVsZW1lbnRzIHRvIGFuaW1hdGUgSU5DTFVESU5HIHByZWZpeCBjaGFyLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc1RvQWRkIC0gY2xhc3MgdG8gYWRkIEVYQ0xVRElORyB0aGUgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFuaW1hdGlvbkludGVydmFsIC0gdGhlIGludGVydmFsIHRvIGFuaW1hdGUgdGhlIGdpdmVuIGVsZW1lbnRzIGluIG1pbGxpc2Vjb25kcy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBhbmltYXRlQXR0cmlidXRlcyAoZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZywgY2xhc3NUb0FkZDogc3RyaW5nLCBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyKSB7XHJcbiAgICBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMoXHJcbiAgICAgIGVsZW1lbnRzVG9BbmltYXRlLFxyXG4gICAgICBjbGFzc1RvQWRkLFxyXG4gICAgICBhbmltYXRpb25JbnRlcnZhbFxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgYW5pbWF0ZUF0dHJpYnV0ZXNcclxuICB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQaXhlbFBvc0luRWxPbkNsaWNrIChtb3VzZUV2dDogTW91c2VFdmVudCk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XHJcbiAgY29uc3QgcmVjdCA9IChtb3VzZUV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgY29uc3QgeCA9IG1vdXNlRXZ0LmNsaWVudFggLSByZWN0LmxlZnQgLy8geCBwb3NpdGlvbiB3aXRoaW4gdGhlIGVsZW1lbnQuXHJcbiAgY29uc3QgeSA9IG1vdXNlRXZ0LmNsaWVudFkgLSByZWN0LnRvcCAvLyB5IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICByZXR1cm4geyB4LCB5IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXhwcmVzc2lvbiAoZXJyb3JNZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSlcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEl0ZW1zVG9QbGF5bGlzdCAocGxheWxpc3RJZDogc3RyaW5nLCB1cmlzOiBBcnJheTxzdHJpbmc+KSB7XHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcyh7XHJcbiAgICAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgICB1cmw6IGNvbmZpZy5VUkxzLnBvc3RJdGVtc1RvUGxheWxpc3QocGxheWxpc3RJZCksXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB1cmlzOiB1cmlzXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgKCkgPT4ge30sICgpID0+IHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJc3N1ZSBhZGRpbmcgaXRlbXMgdG8gcGxheWxpc3QnKVxyXG4gICAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFNodWZmbGVzIGEgZ2l2ZW4gYXJyYXkgYW5kIHJldHVybnMgdGhlIHNodWZmbGVkIHZlcnNpb24uXHJcbiAqIEBwYXJhbSB7QXJyYXk8VD59IGFycmF5IFRoZSBhcnJheSB0byBzaHVmZmxlIGJ1dCBub3QgbXV0YXRlLlxyXG4gKiBAcmV0dXJucyB7QXJyYXk8VD59IGEgc2h1ZmZsZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gYXJyYXkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZTxUPiAoYXJyYXk6IEFycmF5PFQ+KSB7XHJcbiAgY29uc3QgY2xvbmVBcnIgPSBbLi4uYXJyYXldXHJcbiAgbGV0IGN1cnJlbnRJbmRleCA9IGFycmF5Lmxlbmd0aFxyXG4gIGxldCByYW5kb21JbmRleFxyXG5cclxuICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gIHdoaWxlIChjdXJyZW50SW5kZXggIT09IDApIHtcclxuICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpXHJcbiAgICBjdXJyZW50SW5kZXgtLTtcclxuXHJcbiAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICBbY2xvbmVBcnJbY3VycmVudEluZGV4XSwgY2xvbmVBcnJbcmFuZG9tSW5kZXhdXSA9IFtcclxuICAgICAgY2xvbmVBcnJbcmFuZG9tSW5kZXhdLCBjbG9uZUFycltjdXJyZW50SW5kZXhdXVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNsb25lQXJyXHJcbn1cclxuIiwiaW1wb3J0IHsgY29uZmlnLCBwcm9taXNlSGFuZGxlciwgdGhyb3dFeHByZXNzaW9uIH0gZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgZGlzcGxheVVzZXJuYW1lIH0gZnJvbSAnLi91c2VyLWRhdGEnXHJcblxyXG5jb25zdCBIQUxGX0hPVVIgPSAxLjhlNiAvKiAzMCBtaW4gaW4gbXMgKi9cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0lmSGFzVG9rZW5zICgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAvLyBpZiB0aGUgdXNlciBzdGF5cyBvbiB0aGUgc2FtZSBwYWdlIGZvciAzMCBtaW4gcmVmcmVzaCB0aGUgdG9rZW4uXHJcbiAgY29uc3Qgc3RhcnRSZWZyZXNoSW50ZXJ2YWwgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnc3RhcnQgaW50ZXJ2YWwgcmVmcmVzaCcpXHJcbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIHByb21pc2VIYW5kbGVyKGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRSZWZyZXNoQWNjZXNzVG9rZW4pKVxyXG4gICAgICBjb25zb2xlLmxvZygncmVmcmVzaCBhc3luYycpXHJcbiAgICB9LCBIQUxGX0hPVVIpXHJcbiAgfVxyXG4gIGxldCBoYXNUb2tlbiA9IGZhbHNlXHJcbiAgLy8gYXdhaXQgcHJvbWlzZSByZXNvbHZlIHRoYXQgcmV0dXJucyB3aGV0aGVyIHRoZSBzZXNzaW9uIGhhcyB0b2tlbnMuXHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0SGFzVG9rZW5zKSxcclxuICAgIChyZXMpID0+IHtcclxuICAgICAgaGFzVG9rZW4gPSByZXMuZGF0YVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAgaWYgKGhhc1Rva2VuKSB7XHJcbiAgICBzdGFydFJlZnJlc2hJbnRlcnZhbCgpXHJcbiAgfVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VG9rZW5zICgpIHtcclxuICBsZXQgaGFzVG9rZW4gPSBmYWxzZVxyXG4gIC8vIGNyZWF0ZSBhIHBhcmFtZXRlciBzZWFyY2hlciBpbiB0aGUgVVJMIGFmdGVyICc/JyB3aGljaCBob2xkcyB0aGUgcmVxdWVzdHMgYm9keSBwYXJhbWV0ZXJzXHJcbiAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxyXG5cclxuICAvLyBHZXQgdGhlIGNvZGUgZnJvbSB0aGUgcGFyYW1ldGVyIGNhbGxlZCAnY29kZScgaW4gdGhlIHVybCB3aGljaFxyXG4gIC8vIGhvcGVmdWxseSBjYW1lIGJhY2sgZnJvbSB0aGUgc3BvdGlmeSBHRVQgcmVxdWVzdCBvdGhlcndpc2UgaXQgaXMgbnVsbFxyXG4gIGxldCBhdXRoQ29kZSA9IHVybFBhcmFtcy5nZXQoJ2NvZGUnKVxyXG5cclxuICBpZiAoYXV0aENvZGUpIHtcclxuICAgIC8vIG9idGFpbiB0b2tlbnNcclxuICAgIGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0T2J0YWluVG9rZW5zUHJlZml4KGF1dGhDb2RlKSksXHJcblxyXG4gICAgICAvLyBpZiB0aGUgcmVxdWVzdCB3YXMgc3VjY2VzZnVsIHdlIGhhdmUgcmVjaWV2ZWQgYSB0b2tlblxyXG4gICAgICAoKSA9PiAoaGFzVG9rZW4gPSB0cnVlKVxyXG4gICAgKVxyXG4gICAgYXV0aENvZGUgPSAnJ1xyXG5cclxuICAgIC8vIGdldCB1c2VyIGluZm8gZnJvbSBzcG90aWZ5XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0Q3VycmVudFVzZXJQcm9maWxlKSlcclxuICB9XHJcblxyXG4gIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCAnJywgJy8nKVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG4vKiogR2VuZXJhdGUgYSBsb2dpbi9jaGFuZ2UgYWNjb3VudCBsaW5rLiBEZWZhdWx0cyB0byBhcHBlbmRpbmcgaXQgb250byB0aGUgbmF2IGJhci5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSBjbGFzc2VzVG9BZGQgLSB0aGUgY2xhc3NlcyB0byBhZGQgb250byB0aGUgbGluay5cclxuICogQHBhcmFtIHtCb29sZWFufSBjaGFuZ2VBY2NvdW50IC0gV2hldGhlciB0aGUgbGluayBzaG91bGQgYmUgZm9yIGNoYW5naW5nIGFjY291bnQsIG9yIGZvciBsb2dnaW5nIGluLiAoZGVmYXVsdHMgdG8gdHJ1ZSlcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50RWwgLSB0aGUgcGFyZW50IGVsZW1lbnQgdG8gYXBwZW5kIHRoZSBsaW5rIG9udG8uIChkZWZhdWx0cyB0byBuYXZiYXIpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVMb2dpbiAoe1xyXG4gIGNsYXNzZXNUb0FkZCA9IFsncmlnaHQnXSxcclxuICBjaGFuZ2VBY2NvdW50ID0gdHJ1ZSxcclxuICBwYXJlbnRFbCA9IGRvY3VtZW50XHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndG9wbmF2JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyaWdodCcpWzBdXHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZHJvcGRvd24tY29udGVudCcpWzBdXHJcbn0gPSB7fSkge1xyXG4gIC8vIENyZWF0ZSBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXHJcbiAgYS5ocmVmID0gY29uZmlnLlVSTHMuYXV0aFxyXG5cclxuICAvLyBDcmVhdGUgdGhlIHRleHQgbm9kZSBmb3IgYW5jaG9yIGVsZW1lbnQuXHJcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgY2hhbmdlQWNjb3VudCA/ICdDaGFuZ2UgQWNjb3VudCcgOiAnTG9naW4gVG8gU3BvdGlmeSdcclxuICApXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgdGV4dCBub2RlIHRvIGFuY2hvciBlbGVtZW50LlxyXG4gIGEuYXBwZW5kQ2hpbGQobGluaylcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXNUb0FkZC5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2xhc3NUb0FkZCA9IGNsYXNzZXNUb0FkZFtpXVxyXG4gICAgYS5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQpXHJcbiAgfVxyXG5cclxuICAvLyBjbGVhciBjdXJyZW50IHRva2VucyB3aGVuIGNsaWNrZWRcclxuICBhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dENsZWFyVG9rZW5zKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpXHJcbiAgfSlcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSBhbmNob3IgZWxlbWVudCB0byB0aGUgcGFyZW50LlxyXG4gIHBhcmVudEVsLmFwcGVuZENoaWxkKGEpXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbCAoXHJcbiAgaGFzVG9rZW46IGJvb2xlYW4sXHJcbiAgaGFzVG9rZW5DYWxsYmFjayA9ICgpID0+IHsgfSxcclxuICBub1Rva2VuQ2FsbEJhY2sgPSAoKSA9PiB7IH0sXHJcbiAgcmVkaXJlY3RIb21lID0gdHJ1ZVxyXG4pIHtcclxuICBjb25zdCBnZXRUb2tlbnNTcGlubmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgICBjb25maWcuQ1NTLklEcy5nZXRUb2tlbkxvYWRpbmdTcGlubmVyXHJcbiAgKVxyXG5cclxuICAvLyByZW1vdmUgdG9rZW4gc3Bpbm5lciBiZWNhdXNlIGJ5IHRoaXMgbGluZSB3ZSBoYXZlIG9idGFpbmVkIHRoZSB0b2tlblxyXG4gIGdldFRva2Vuc1NwaW5uZXI/LnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGdldFRva2Vuc1NwaW5uZXIpXHJcblxyXG4gIGNvbnN0IGluZm9Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5pbmZvQ29udGFpbmVyKVxyXG5cclxuICAvLyBnZW5lcmF0ZSB0aGUgbmF2IGxvZ2luXHJcbiAgZ2VuZXJhdGVMb2dpbih7IGNoYW5nZUFjY291bnQ6IGhhc1Rva2VuLCBwYXJlbnRFbDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMudG9wTmF2TW9iaWxlKSA/PyB0aHJvd0V4cHJlc3Npb24oJ05vIHRvcCBuYXYgbW9iaWxlIGVsZW1lbnQgZm91bmQnKSB9KVxyXG4gIGdlbmVyYXRlTG9naW4oeyBjaGFuZ2VBY2NvdW50OiBoYXNUb2tlbiB9KVxyXG4gIGlmIChoYXNUb2tlbikge1xyXG4gICAgaWYgKGluZm9Db250YWluZXIgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZm8gY29udGFpbmVyIEVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgfVxyXG4gICAgaW5mb0NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gICAgZGlzcGxheVVzZXJuYW1lKClcclxuICAgIGNvbnNvbGUubG9nKCdkaXNwbGF5IHVzZXJuYW1lJylcclxuICAgIGhhc1Rva2VuQ2FsbGJhY2soKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBpZiB0aGVyZSBpcyBubyB0b2tlbiByZWRpcmVjdCB0byBhbGxvdyBhY2Nlc3MgcGFnZVxyXG4gICAgaWYgKHJlZGlyZWN0SG9tZSkgeyB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGNvbmZpZy5VUkxzLnNpdGVVcmwgfVxyXG4gICAgbm9Ub2tlbkNhbGxCYWNrKClcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgcHJvbWlzZUhhbmRsZXIsIGNvbmZpZywgdGhyb3dFeHByZXNzaW9uIH0gZnJvbSAnLi4vLi4vY29uZmlnJ1xyXG5pbXBvcnQgUHJvZmlsZSBmcm9tICcuLi8uLi9jb21wb25lbnRzL3Byb2ZpbGUnXHJcbmltcG9ydCB7IGdldFBsYXlsaXN0VHJhY2tzRnJvbURhdGFzIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9wbGF5bGlzdCdcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSGFzVG9rZW5zLFxyXG4gIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbCxcclxuICBnZW5lcmF0ZUxvZ2luXHJcbn0gZnJvbSAnLi4vLi4vbWFuYWdlLXRva2VucydcclxuaW1wb3J0IEFydGlzdCwgeyBnZW5lcmF0ZUFydGlzdHNGcm9tRGF0YSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXJ0aXN0J1xyXG5pbXBvcnQgQ2FyZEFjdGlvbnNIYW5kbGVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvY2FyZC1hY3Rpb25zJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCBmcm9tICcuLi8uLi9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IFRyYWNrIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvdHJhY2snXHJcbmltcG9ydCB7IFByb2ZpbGVEYXRhLCBUcmFja0RhdGEgfSBmcm9tICcuLi8uLi8uLi90eXBlcydcclxuXHJcbmZ1bmN0aW9uIGRpc3BsYXlQcm9maWxlIChwcm9maWxlOiBQcm9maWxlKSB7XHJcbiAgY29uc3QgcHJvZmlsZUhlYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnByb2ZpbGVIZWFkZXIpID8/IHRocm93RXhwcmVzc2lvbigncHJvZmlsZSBoZWFkZXIgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgY29uc3QgZGlzcGxheU5hbWUgPSBwcm9maWxlSGVhZGVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoMScpWzBdID8/IHRocm93RXhwcmVzc2lvbignZGlzcGxheSBuYW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gIGNvbnN0IGZvbGxvd2VyQ291bnQgPSBwcm9maWxlSGVhZGVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoNCcpWzBdID8/IHRocm93RXhwcmVzc2lvbignZm9sbG93ZXIgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgY29uc3QgcHJvZmlsZUltYWdlID0gcHJvZmlsZUhlYWRlci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJylbMF0gPz8gdGhyb3dFeHByZXNzaW9uKCdwcm9maWxlIGltYWdlIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICBkaXNwbGF5TmFtZS50ZXh0Q29udGVudCA9IHByb2ZpbGUuZGlzcGxheU5hbWVcclxuICBmb2xsb3dlckNvdW50LnRleHRDb250ZW50ID0gcHJvZmlsZS5mb2xsb3dlcnMgKyAnIGZvbGxvd2VycydcclxuICBwcm9maWxlSW1hZ2Uuc3JjID1cclxuICAgIHByb2ZpbGUucHJvZmlsZUltZ1VybCA9PT0gJydcclxuICAgICAgPyAnL2ltYWdlcy9wcm9maWxlLXVzZXIucG5nJ1xyXG4gICAgICA6IHByb2ZpbGUucHJvZmlsZUltZ1VybFxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZXRyaWV2ZVByb2ZpbGUgKCkge1xyXG4gIGZ1bmN0aW9uIG9uU3VjY2VzZnVsIChyZXM6IEF4aW9zUmVzcG9uc2U8UHJvZmlsZURhdGE+KSB7XHJcbiAgICBjb25zdCBkYXRhID0gcmVzLmRhdGFcclxuICAgIGNvbnN0IHByb2ZpbGUgPSBuZXcgUHJvZmlsZShcclxuICAgICAgZGF0YS5kaXNwbGF5X25hbWUsXHJcbiAgICAgIGRhdGEuY291bnRyeSxcclxuICAgICAgZGF0YS5lbWFpbCxcclxuICAgICAgZGF0YS5pbWFnZXMsXHJcbiAgICAgIGRhdGEuZm9sbG93ZXJzLnRvdGFsLFxyXG4gICAgICBkYXRhLmV4dGVybmFsX3VybHMuc3BvdGlmeVxyXG4gICAgKVxyXG5cclxuICAgIGRpc3BsYXlQcm9maWxlKHByb2ZpbGUpXHJcbiAgfVxyXG5cclxuICAvLyBnZXQgcHJvZmlsZSBkYXRhIGZyb20gYXBpXHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxQcm9maWxlRGF0YT4+KGF4aW9zLnJlcXVlc3Q8UHJvZmlsZURhdGE+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRDdXJyZW50VXNlclByb2ZpbGUgfSksXHJcbiAgICBvblN1Y2Nlc2Z1bFxyXG4gIClcclxufVxyXG5cclxuY29uc3QgYWRkRXZlbnRMaXN0ZW5lcnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8qKiBBZGRzIHRoZSBjbGljayBldmVudCBsaXN0ZW5lciB0aGF0IGNsZWFycyBzZXNzaW9uIGRhdGEgYW5kIHJldHVybnMgdXNlciBiYWNrIHRvIGhvbWUgcGFnZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZENsZWFyRGF0YUxpc3RlbmVyICgpIHtcclxuICAgIGNvbnN0IGNsZWFyRGF0YUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuY2xlYXJEYXRhKSBhcyBIVE1MTGlua0VsZW1lbnRcclxuICAgIGNsZWFyRGF0YUVsLmhyZWYgPSBjb25maWcuVVJMcy5zaXRlVXJsXHJcblxyXG4gICAgZnVuY3Rpb24gb25DbGljayAoKSB7XHJcbiAgICAgIGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRDbGVhclNlc3Npb24pXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJEYXRhRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKVxyXG4gIH1cclxuICByZXR1cm4geyBhZGRDbGVhckRhdGFMaXN0ZW5lciB9XHJcbn0pKClcclxuXHJcbmNvbnN0IHNhdmVkVHJhY2tzQWN0aW9ucyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gZ2V0U2F2ZWRUcmFja3MgKCkge1xyXG4gICAgcHJvbWlzZUhhbmRsZXIoYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEN1cnJlbnRVc2VyU2F2ZWRUcmFja3MpLCAocmVzKSA9PiB7XHJcbiAgICAgIC8vIGlmIHdlIHJldHJpZXZlZCB0aGUgdHJhY2tzIHN1Y2Nlc2Z1bGx5LCB0aGVuIGRpc3BsYXkgdGhlbVxyXG4gICAgICBjb25zdCB0cmFja0xpc3QgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4oKVxyXG4gICAgICBjb25zdCB0cmFja3NEYXRhID0gcmVzLmRhdGEuaXRlbXMubWFwKChpdGVtOiB7IHRyYWNrOiBUcmFja0RhdGEgfSkgPT4gaXRlbS50cmFjaylcclxuXHJcbiAgICAgIGdldFBsYXlsaXN0VHJhY2tzRnJvbURhdGFzKHRyYWNrc0RhdGEsIHJlcy5kYXRhLml0ZW1zLCB0cmFja0xpc3QpXHJcbiAgICAgIGRpc3BsYXlTYXZlZFRyYWNrcyh0cmFja0xpc3QpXHJcbiAgICB9KVxyXG4gIH1cclxuICBmdW5jdGlvbiBkaXNwbGF5U2F2ZWRUcmFja3MgKHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4pIHtcclxuICAgIGNvbnN0IGxpa2VkVHJhY2tzVWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5saWtlZFRyYWNrcykgPz8gdGhyb3dFeHByZXNzaW9uKGBsaWtlZCB0cmFja3MgdWwgb2YgaWQgJHtjb25maWcuQ1NTLklEcy5saWtlZFRyYWNrc30gZG9lcyBub3QgZXhpc3RgKVxyXG4gICAgZm9yIChjb25zdCB0cmFjayBvZiB0cmFja0xpc3QudmFsdWVzKCkpIHtcclxuICAgICAgbGlrZWRUcmFja3NVbC5hcHBlbmQodHJhY2suZ2V0UGxheWxpc3RUcmFja0h0bWwodHJhY2tMaXN0KSlcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHsgZ2V0U2F2ZWRUcmFja3MgfVxyXG59KSgpXHJcblxyXG5jb25zdCBmb2xsb3dlZEFydGlzdEFjdGlvbnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGNvbnN0IGNhcmRBY3Rpb25zSGFuZGxlciA9IG5ldyBDYXJkQWN0aW9uc0hhbmRsZXIoNTApXHJcblxyXG4gIGZ1bmN0aW9uIGdldEZvbGxvd2VkQXJ0aXN0cyAoKSB7XHJcbiAgICBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0Rm9sbG93ZWRBcnRpc3RzKSwgKHJlcykgPT4ge1xyXG4gICAgICAvLyBpZiB3ZSByZXRyaWV2ZWQgdGhlIGFydGlzdHMgc3VjY2VzZnVsbHksIHRoZW4gZGlzcGxheSB0aGVtXHJcbiAgICAgIGNvbnN0IGFydGlzdEFycjogQXJyYXk8QXJ0aXN0PiA9IFtdXHJcbiAgICAgIGdlbmVyYXRlQXJ0aXN0c0Zyb21EYXRhKHJlcy5kYXRhLmFydGlzdHMuaXRlbXMsIGFydGlzdEFycilcclxuICAgICAgZGlzcGxheUZvbGxvd2VkQXJ0aXN0cyhhcnRpc3RBcnIpXHJcbiAgICB9KVxyXG4gIH1cclxuICBmdW5jdGlvbiBkaXNwbGF5Rm9sbG93ZWRBcnRpc3RzIChmb2xsb3dlZEFydGlzdHM6IEFycmF5PEFydGlzdD4pIHtcclxuICAgIGNvbnN0IGNhcmRHcmlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuZm9sbG93ZWRBcnRpc3RzKSA/PyB0aHJvd0V4cHJlc3Npb24oYENhcmQgZ3JpZCBvZiBpZCAke2NvbmZpZy5DU1MuSURzLmZvbGxvd2VkQXJ0aXN0c30gZG9lcyBub3QgZXhpc3RgKVxyXG5cclxuICAgIC8vIGRpc3BsYXkgdGhlIGNhcmRzXHJcbiAgICBsZXQgaSA9IDBcclxuICAgIGZvbGxvd2VkQXJ0aXN0cy5mb3JFYWNoKChhcnRpc3Q6IEFydGlzdCkgPT4ge1xyXG4gICAgICBjYXJkR3JpZC5hcHBlbmQoYXJ0aXN0LmdldEFydGlzdENhcmRIdG1sKGksIHRydWUpKVxyXG4gICAgICBpKytcclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgYXJ0aXN0Q2FyZHMgPSBBcnJheS5mcm9tKFxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3QpXHJcbiAgICApXHJcblxyXG4gICAgLy8gYWRkIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgY2FyZHNcclxuICAgIGNhcmRBY3Rpb25zSGFuZGxlci5hZGRBbGxFdmVudExpc3RlbmVycyhcclxuICAgICAgYXJ0aXN0Q2FyZHMsXHJcbiAgICAgIGZvbGxvd2VkQXJ0aXN0cyxcclxuICAgICAgbnVsbCxcclxuICAgICAgdHJ1ZSxcclxuICAgICAgZmFsc2VcclxuICAgIClcclxuICB9XHJcblxyXG4gIHJldHVybiB7IGdldEZvbGxvd2VkQXJ0aXN0cyB9XHJcbn0pKCk7XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gIHByb21pc2VIYW5kbGVyPGJvb2xlYW4+KGNoZWNrSWZIYXNUb2tlbnMoKSwgKGhhc1Rva2VuKSA9PlxyXG4gICAgb25TdWNjZXNzZnVsVG9rZW5DYWxsKGhhc1Rva2VuLCAoKSA9PiB7XHJcbiAgICAgIC8vIGdldCB1c2VyIHByb2ZpbGVcclxuICAgICAgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgICAgcmV0cmlldmVQcm9maWxlKCksXHJcbiAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgZ2VuZXJhdGVMb2dpbih7XHJcbiAgICAgICAgICAgIGNsYXNzZXNUb0FkZDogWydnbG93J10sXHJcbiAgICAgICAgICAgIHBhcmVudEVsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWNjb3VudC1idG5zJykgYXMgRWxlbWVudFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgICgpID0+IGNvbnNvbGUubG9nKCdQcm9ibGVtIHdoZW4gZ2V0dGluZyBpbmZvcm1hdGlvbicpXHJcbiAgICAgIClcclxuXHJcbiAgICAgIHNhdmVkVHJhY2tzQWN0aW9ucy5nZXRTYXZlZFRyYWNrcygpXHJcbiAgICAgIGZvbGxvd2VkQXJ0aXN0QWN0aW9ucy5nZXRGb2xsb3dlZEFydGlzdHMoKVxyXG4gICAgfSlcclxuICApXHJcblxyXG4gIE9iamVjdC5lbnRyaWVzKGFkZEV2ZW50TGlzdGVuZXJzKS5mb3JFYWNoKChbLCBhZGRFdmVudExpc3RlbmVyXSkgPT4ge1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcigpXHJcbiAgfSlcclxufSkoKVxyXG4iLCJpbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyIH0gZnJvbSAnLi9jb25maWcnXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzcGxheVVzZXJuYW1lICgpIHtcclxuICBwcm9taXNlSGFuZGxlcjxBeGlvc1Jlc3BvbnNlPHN0cmluZyB8IG51bGw+PihheGlvcy5yZXF1ZXN0PHN0cmluZyB8IG51bGw+KHsgbWV0aG9kOiAnR0VUJywgdXJsOiBjb25maWcuVVJMcy5nZXRVc2VybmFtZSB9KSwgKHJlcykgPT4ge1xyXG4gICAgY29uc3QgdXNlcm5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy51c2VybmFtZSlcclxuICAgIGlmICh1c2VybmFtZSkge1xyXG4gICAgICB1c2VybmFtZS50ZXh0Q29udGVudCA9IHJlcy5kYXRhXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvcHVibGljL3BhZ2VzL3Byb2ZpbGUtcGFnZS9wcm9maWxlLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9