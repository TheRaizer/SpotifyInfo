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
    /** Produces the card element of this artist.
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
    /** Produces the card element of this artist.
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
    get(index, asNode = false) {
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
    find(matcher) {
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
        this.selPlaying = {
            element: null,
            track_uri: '',
            trackDataNode: null
        };
        this.getStateInterval = null;
        this.webPlayerEls = {
            title: null,
            progress: null,
            currTime: null,
            duration: null
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
                        volume: 0.1
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
        this.getWebPlayerEls();
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
                    if (this.selPlaying.element === null) {
                        throw new Error('Selected playing element was null before deselection on song finish');
                    }
                    this.selPlaying.element.classList.remove(config_1.config.CSS.CLASSES.selected);
                    this.selPlaying = { element: null, track_uri: '', trackDataNode: null };
                    this.webPlayerEls.progress.style.width = '100%';
                    clearInterval(this.getStateInterval);
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
                yield this.startTrack(eventArg.currPlayable.selEl, eventArg.currPlayable.uri, () => __awaiter(this, void 0, void 0, function* () { return this.resume(eventArg.currPlayable.uri); }), eventArg.currPlayable.title, eventArg.playableNode);
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
    resume(track_uri) {
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
        track.dateAddedToPlaylist = dateAddedObj.added_at;
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
        const { title, images, duration, uri, popularity, releaseDate, id, album, externalUrls, artists, idx = -1 } = props;
        // This tracks index in an array if it is contained in one. (used to find previous and next tracks)
        this.idx = idx;
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
    set dateAddedToPlaylist(val) {
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
        const trackNode = trackList.get(this.idx, true);
        function playPauseClick() {
            // select this track to play or pause by publishing the track play event arg
            eventAggregator.publish(new track_play_args_1.default(track, trackNode));
        }
        const html = `
            <li class="${config_1.config.CSS.CLASSES.playlistTrack}">
              <button class="play-pause ${(0, playback_sdk_1.isSamePlayingURI)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}"><img src="" alt="play/pause" 
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
            playlistHeaderArea: 'playlist-main-header-area'
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
            progressBar: 'progress-bar'
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
        pauseIcon: '/images/pause-30px.png'
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
const card_actions_1 = __importDefault(__webpack_require__(/*! ../../card-actions */ "./src/public/card-actions.ts"));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljL3Byb2ZpbGUtYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDRGQUF1Qzs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyxpRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLHlFQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsMkVBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLDZFQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMseUZBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLHlFQUFxQjs7QUFFL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNkM7QUFDN0M7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7Ozs7OztBQ2xMYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsa0RBQVM7QUFDN0IsV0FBVyxtQkFBTyxDQUFDLGdFQUFnQjtBQUNuQyxZQUFZLG1CQUFPLENBQUMsNERBQWM7QUFDbEMsa0JBQWtCLG1CQUFPLENBQUMsd0VBQW9CO0FBQzlDLGVBQWUsbUJBQU8sQ0FBQyx3REFBWTs7QUFFbkM7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLG1CQUFPLENBQUMsa0VBQWlCO0FBQ3hDLG9CQUFvQixtQkFBTyxDQUFDLDRFQUFzQjtBQUNsRCxpQkFBaUIsbUJBQU8sQ0FBQyxzRUFBbUI7O0FBRTVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBTyxDQUFDLG9FQUFrQjs7QUFFekM7QUFDQSxxQkFBcUIsbUJBQU8sQ0FBQyxnRkFBd0I7O0FBRXJEOztBQUVBO0FBQ0Esc0JBQXNCOzs7Ozs7Ozs7Ozs7QUN2RFQ7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOzs7Ozs7Ozs7Ozs7QUNsQmE7O0FBRWIsYUFBYSxtQkFBTyxDQUFDLDJEQUFVOztBQUUvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQ3hEYTs7QUFFYjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ0phOztBQUViLFlBQVksbUJBQU8sQ0FBQyxxREFBWTtBQUNoQyxlQUFlLG1CQUFPLENBQUMseUVBQXFCO0FBQzVDLHlCQUF5QixtQkFBTyxDQUFDLGlGQUFzQjtBQUN2RCxzQkFBc0IsbUJBQU8sQ0FBQywyRUFBbUI7QUFDakQsa0JBQWtCLG1CQUFPLENBQUMsbUVBQWU7O0FBRXpDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCLEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQ7Ozs7Ozs7Ozs7OztBQzlGYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7O0FBRWhDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFVBQVU7QUFDckIsV0FBVyxVQUFVO0FBQ3JCO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7Ozs7Ozs7Ozs7OztBQ25EYTs7QUFFYixvQkFBb0IsbUJBQU8sQ0FBQyxtRkFBMEI7QUFDdEQsa0JBQWtCLG1CQUFPLENBQUMsK0VBQXdCOztBQUVsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ25CYTs7QUFFYixtQkFBbUIsbUJBQU8sQ0FBQyxxRUFBZ0I7O0FBRTNDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2pCYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7QUFDaEMsb0JBQW9CLG1CQUFPLENBQUMsdUVBQWlCO0FBQzdDLGVBQWUsbUJBQU8sQ0FBQyx1RUFBb0I7QUFDM0MsZUFBZSxtQkFBTyxDQUFDLHlEQUFhOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwrQkFBK0I7QUFDL0IsdUNBQXVDO0FBQ3ZDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7Ozs7QUM5RWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN6Q2E7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLG1EQUFVOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOLDJCQUEyQjtBQUMzQixNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN0RmE7O0FBRWIsa0JBQWtCLG1CQUFPLENBQUMsbUVBQWU7O0FBRXpDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQixXQUFXLFVBQVU7QUFDckIsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUN4QmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBO0FBQ0E7QUFDQSxXQUFXLGVBQWU7QUFDMUIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsZ0JBQWdCO0FBQzNCLGFBQWEsR0FBRztBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOzs7Ozs7Ozs7Ozs7QUNuQmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLGtEQUFTO0FBQzdCLDBCQUEwQixtQkFBTyxDQUFDLDhGQUErQjs7QUFFakU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLG1CQUFPLENBQUMsZ0VBQWdCO0FBQ3RDLElBQUk7QUFDSjtBQUNBLGNBQWMsbUJBQU8sQ0FBQyxpRUFBaUI7QUFDdkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RUFBd0U7QUFDeEU7QUFDQTtBQUNBO0FBQ0EsdURBQXVEO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsWUFBWTtBQUNwQjtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxDQUFDOztBQUVEOzs7Ozs7Ozs7Ozs7QUNqR2E7O0FBRWI7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGlCQUFpQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNWYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7O0FDckVhOztBQUViO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDYmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsMkNBQTJDO0FBQzNDLFNBQVM7O0FBRVQ7QUFDQSw0REFBNEQsd0JBQXdCO0FBQ3BGO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDLGdDQUFnQyxjQUFjO0FBQzlDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7OztBQ3BEYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNiYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ1ZhOztBQUViLFlBQVksbUJBQU8sQ0FBQyxxREFBWTs7QUFFaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYyxRQUFRO0FBQ3RCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsUUFBUTtBQUN0QixnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7OztBQ25FYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsbURBQVU7O0FBRTlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7Ozs7Ozs7O0FDWGE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCOztBQUVsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOzs7Ozs7Ozs7Ozs7QUNwRGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFCYTs7QUFFYixXQUFXLG1CQUFPLENBQUMsZ0VBQWdCOztBQUVuQzs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCLFdBQVcsVUFBVTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0NBQW9DLE9BQU87QUFDM0M7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFNBQVMsR0FBRyxTQUFTO0FBQzVDLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ04sNEJBQTRCO0FBQzVCLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUEsd0NBQXdDLE9BQU87QUFDL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQzlWQTtBQUNBLGFBQWEsS0FBb0Qsb0JBQW9CLENBQXdLLENBQUMsYUFBYSxTQUFTLHNDQUFzQyxTQUFTLHlDQUF5QywrQ0FBK0MsU0FBUyxzQ0FBc0MsU0FBUyxtQ0FBbUMsb0VBQW9FLDhCQUE4QixhQUFhLGVBQWUsYUFBYSxjQUFjLGlCQUFpQixvQ0FBb0MsbUdBQW1HLHlEQUF5RCxTQUFTLGNBQWMsaUZBQWlGLGdCQUFnQixhQUFhLG9HQUFvRyxLQUFLLHNDQUFzQyxTQUFTLG1CQUFtQixrQkFBa0IsMkJBQTJCLGVBQWUsMkJBQTJCLElBQUksbUJBQW1CLHNDQUFzQyxxQkFBcUIsNkJBQTZCLG9DQUFvQyx5QkFBeUIsa0JBQWtCLDBCQUEwQixvQkFBb0IseUJBQXlCLHFCQUFxQixnQ0FBZ0MsK0JBQStCLDhHQUE4Ryx5QkFBeUIsaUZBQWlGLG1CQUFtQiw4Q0FBOEMsWUFBWSxTQUFTLGNBQWMsb0JBQW9CLDZCQUE2QixzQkFBc0Isc1RBQXNULGNBQWMsK0JBQStCLDZCQUE2QixzQkFBc0IscUJBQXFCLHNCQUFzQixxRkFBcUYsc0NBQXNDLFNBQVMsbUJBQW1CLE9BQU8sc0NBQXNDLDhDQUE4Qyx1R0FBdUcsWUFBWSwrSEFBK0gsa0VBQWtFLCtIQUErSCw2REFBNkQsS0FBSyx1QkFBdUIsZ1dBQWdXLCtCQUErQiw2QkFBNkIsc0JBQXNCLGNBQWMsS0FBSyxZQUFZLFNBQVMsc0NBQXNDLFNBQVMsbUJBQW1CLE9BQU8saUJBQWlCLFFBQVEsNlRBQTZULHVLQUF1SyxjQUFjLFFBQVEsWUFBWSxTQUFTLHNDQUFzQyxTQUFTLG1CQUFtQixPQUFPLGlCQUFpQiwwQ0FBMEMsNnVCQUE2dUIsb0hBQW9ILEVBQUUsZ0hBQWdILGdHQUFnRyxpS0FBaUssS0FBSyxZQUFZLFNBQVMsY0FBYyxtQkFBbUIseUJBQXlCLEtBQUssaUNBQWlDLEVBQUUsU0FBUyxTQUFTLGdCQUFnQix1R0FBdUcsc0NBQXNDLFNBQVMsK0JBQStCLG1DQUFtQyxLQUFLLEVBQUUsRUFBRSxrQkFBa0IsZUFBZSxTQUFTLHlCQUF5QixLQUFLLHFCQUFxQixFQUFFLG1CQUFtQixPQUFPLFlBQVksd0VBQXdFLG1CQUFtQixXQUFXLEtBQUssa0JBQWtCLGtCQUFrQixrQkFBa0Isd0RBQXdELGtCQUFrQixhQUFhLG1IQUFtSCxrQkFBa0Isb0JBQW9CLFNBQVMsbUNBQW1DLGtCQUFrQixLQUFLLHlCQUF5QixpQ0FBaUMsRUFBRSxFQUFFLGFBQWEsUUFBUSxNQUFNLGtCQUFrQixxQkFBcUIsMkpBQTJKLFNBQVMsU0FBUyxRQUFRLFNBQVMsK0JBQStCLEtBQUsscUJBQXFCLEVBQUUsbUJBQW1CLDhCQUE4QixTQUFTLGdDQUFnQyxvQ0FBb0MsdUVBQXVFLFdBQVcseUJBQXlCLHdCQUF3QixrREFBa0QsU0FBUyx1QkFBdUIsYUFBYSxFQUFFLGtCQUFrQixTQUFTLDJCQUEyQix1RUFBdUUsa0JBQWtCLDZCQUE2QixnQkFBZ0IsbUJBQW1CLHFDQUFxQyxrQkFBa0IsU0FBUyxjQUFjLE9BQU8sb0hBQW9ILGNBQWMsd0ZBQXdGLFdBQVcsbUhBQW1ILFNBQVMsc0NBQXNDLFNBQVMsMEJBQTBCLHlCQUF5QixVQUFVLFNBQVMsZ0JBQWdCLG9DQUFvQyx1QkFBdUIsSUFBSSxjQUFjLFNBQVMsa0JBQWtCLGtGQUFrRixzQ0FBc0MsU0FBUyxnRUFBZ0UsVUFBVSx1RkFBdUYsZ0NBQWdDLG1CQUFtQixpRkFBaUYsbUJBQW1CLE1BQU0sb0NBQW9DLG9EQUFvRCxnTEFBZ0wsZ0JBQWdCLDRKQUE0Six5REFBeUQsd0JBQXdCLFdBQVcsMENBQTBDLDBCQUEwQixxREFBcUQsbUdBQW1HLDBCQUEwQixnREFBZ0Qsd0dBQXdHLDRCQUE0Qiw0SUFBNEksU0FBUyxzQ0FBc0MsU0FBUyw0QkFBNEIseUZBQXlGLDBCQUEwQixVQUFVLFNBQVMsY0FBYyw0QkFBNEIsc0NBQXNDLFNBQVMsOEJBQThCLFVBQVUscUdBQXFHLGdDQUFnQyxLQUFLLGdGQUFnRix1Q0FBdUMsV0FBVyxLQUFLLE1BQU0sZ0JBQWdCLDRDQUE0Qyw0QkFBNEIsNkJBQTZCLEdBQUcsWUFBWSxVQUFVLFNBQVMsc0NBQXNDLFNBQVMsMkNBQTJDLDJCQUEyQixTQUFTLGdCQUFnQixnQkFBZ0IsNkJBQTZCLGtEQUFrRCxLQUFLLE1BQU0sd0NBQXdDLFNBQVMsc0NBQXNDLFNBQVMsc0NBQXNDLDJFQUEyRSxRQUFRLFlBQVksU0FBUyxjQUFjLGtFQUFrRSxrQkFBa0IsMkJBQTJCLDRCQUE0QixnQkFBZ0IsYUFBYSxRQUFRLHlHQUF5RyxnQkFBZ0IsY0FBYyxpRUFBaUUsY0FBYyxTQUFTLHdQQUF3UCxjQUFjLFdBQVcsd0RBQXdELEtBQUssV0FBVyxLQUFLLFdBQVcsMEJBQTBCLDhCQUE4QixTQUFTLHNDQUFzQyxTQUFTLDZCQUE2QixpQkFBaUIsMERBQTBELHFFQUFxRSxrQ0FBa0MsNEpBQTRKLGtDQUFrQyxxQ0FBcUMsc0dBQXNHLDZCQUE2QixnREFBZ0Qsd0ZBQXdGLDhEQUE4RCw2QkFBNkIsMkJBQTJCLHdDQUF3Qyw2REFBNkQseUJBQXlCLG1KQUFtSixPQUFPLDREQUE0RCwrQkFBK0IsK0RBQStELHlCQUF5Qiw0QkFBNEIsK0RBQStELG1DQUFtQyw4QkFBOEIsaU5BQWlOLCtCQUErQiw2REFBNkQsZ0ZBQWdGLHdCQUF3QixPQUFPLE1BQU0sUUFBUSxTQUFTLFFBQVEsY0FBYyw2QkFBNkIsT0FBTyxvQkFBb0Isd0JBQXdCLGNBQWMsMEJBQTBCLGlCQUFpQiw2QkFBNkIsYUFBYSwwQkFBMEIsYUFBYSwwQkFBMEIsZUFBZSw0QkFBNEIsZUFBZSw0QkFBNEIsaUJBQWlCLDZCQUE2QixjQUFjLDBCQUEwQixZQUFZLHdCQUF3QixtQkFBbUIsK0JBQStCLGVBQWUsMkJBQTJCLDhCQUE4QiwwQ0FBMEMsNkJBQTZCLGtCQUFrQixFQUFFLFNBQVMsZ0JBQWdCLFlBQVksV0FBVyxLQUFLLFdBQVcsK0dBQStHLGtCQUFrQix5Q0FBeUMsa0RBQWtELFdBQVcsc0NBQXNDLFNBQVMscUJBQXFCLGlCQUFpQixjQUFjLGVBQWUsOEVBQThFLDBRQUEwUSxRQUFRLGdCQUFnQix3Q0FBd0MsRUFBRSx1Q0FBdUMsNEJBQTRCLEVBQUUsZ0RBQWdELDZEQUE2RCx1QkFBdUIsR0FBRywrREFBK0QsZUFBZSxnQ0FBZ0Msa0JBQWtCLEVBQUUsU0FBUyxzQ0FBc0MsU0FBUyx3RkFBd0Ysd0JBQXdCLHdCQUF3QixpQ0FBaUMsb0JBQW9CLFlBQVksV0FBVyxLQUFLLFdBQVcsVUFBVSxVQUFVLDZCQUE2QixnQkFBZ0Isb0JBQW9CLFlBQVksV0FBVyw0QkFBNEIsVUFBVSxtQ0FBbUMsa0JBQWtCLFVBQVUsZUFBZSxrRkFBa0YsZ0JBQWdCLGFBQWEsb0dBQW9HLEtBQUssaUJBQWlCLFlBQVksV0FBVyxLQUFLLFdBQVcsK0dBQStHLGlCQUFpQiwrQ0FBK0MsdUJBQXVCLE9BQU8saUJBQWlCLHlEQUF5RCxlQUFlLG9HQUFvRyxTQUFTLGVBQWUsa0VBQWtFLDZDQUE2QyxLQUFLLG1CQUFtQix5Q0FBeUMsa0RBQWtELFdBQVcsdUNBQXVDLFNBQVMsc0JBQXNCLG1CQUFtQixlQUFlLDRHQUE0RywwQ0FBMEMsYUFBYSxxQ0FBcUMsYUFBYSxNQUFNLGdDQUFnQyw0REFBNEQsbUNBQW1DLHFDQUFxQyxJQUFJLGdGQUFnRixPQUFPLFNBQVMsVUFBVSxjQUFjLGNBQWMsTUFBTSwyQkFBMkIsbUNBQW1DLCtCQUErQixrQkFBa0IsRUFBRSxrQkFBa0IsTUFBTSxlQUFlLDhFQUE4RSxnU0FBZ1MsNERBQTRELHNKQUFzSixnQkFBZ0IsOEJBQThCLHlDQUF5QyxvUUFBb1EsaURBQWlELDZCQUE2QixvQ0FBb0MsR0FBRywwQkFBMEIsK0NBQStDLG9FQUFvRSw4REFBOEQsRUFBRSx3Q0FBd0MsRUFBRSx1Q0FBdUMsNEJBQTRCLEVBQUUsZ0RBQWdELDZEQUE2RCx3QkFBd0IsY0FBYyxnQkFBZ0IsVUFBVSxpQkFBaUIsWUFBWSxtQkFBbUIsS0FBSyw0Q0FBNEMseUZBQXlGLGlCQUFpQix3QkFBd0IsbUNBQW1DLGdCQUFnQixLQUFLLGdCQUFnQiwyQkFBMkIsNEJBQTRCLHVHQUF1Ryw4QkFBOEIsZ0lBQWdJLFdBQVcsS0FBSyxXQUFXLGVBQWUsdUNBQXVDLElBQUksU0FBUyxVQUFVLFdBQVcsS0FBSyxXQUFXLHFDQUFxQyxTQUFTLG1CQUFtQiw0REFBNEQsdUJBQXVCLEtBQUsseURBQXlELHdDQUF3QyxpQ0FBaUMsOEJBQThCLG1CQUFtQixxQkFBcUIseUVBQXlFLGt6QkFBa3pCLGlCQUFpQixtREFBbUQseU5BQXlOLGlCQUFpQix5Q0FBeUMsNENBQTRDLGtCQUFrQiwrQ0FBK0Msb0JBQW9CLCtKQUErSix1Q0FBdUMsU0FBUyxvQkFBb0IsUUFBUSxzQ0FBc0MsaUVBQWlFLHdEQUF3RCxxQkFBcUIsd0JBQXdCLHNEQUFzRCx3RUFBd0Usb0hBQW9ILElBQUksRUFBRSxtRUFBbUUsd29CQUF3b0IscUVBQXFFLFNBQVMsNkNBQTZDLCtCQUErQixTQUFTLDhGQUE4Riw2QkFBNkIsa0JBQWtCLGlEQUFpRCxrQkFBa0Isd0RBQXdELE9BQU8sbUJBQW1CLG9CQUFvQiwwQ0FBMEMsK0NBQStDLHlQQUF5UCxtQkFBbUIsMkJBQTJCLDJEQUEyRCxpQ0FBaUMsZ0ZBQWdGLDJFQUEyRSxZQUFZLCtDQUErQyxvQkFBb0Isd0NBQXdDLEtBQUssMkJBQTJCLE9BQU8sMkJBQTJCLDBDQUEwQyxFQUFFLGlEQUFpRCx5Q0FBeUMsNkJBQTZCLGtCQUFrQix1S0FBdUssMEJBQTBCLElBQUksOEVBQThFLCtCQUErQixnRkFBZ0YsMEJBQTBCLHVCQUF1QixFQUFFLHlDQUF5Qyx5Q0FBeUMsK0JBQStCLDREQUE0RCwwQkFBMEIsR0FBRyxpQ0FBaUMsb0JBQW9CLDZCQUE2QixrQkFBa0Isc0lBQXNJLDJFQUEyRSwwQ0FBMEMsT0FBTyxjQUFjLFVBQVUsZUFBZSx5Q0FBeUMsZ0NBQWdDLGtDQUFrQyxpQkFBaUIsa0VBQWtFLGtNQUFrTSxXQUFXLGtCQUFrQixnRkFBZ0YseUxBQXlMLDRJQUE0SSx1Q0FBdUMsU0FBUyxvQkFBb0IsUUFBUSxrRkFBa0YsOENBQThDLG1DQUFtQyx3TkFBd04sa0ZBQWtGLFlBQVkseUhBQXlILHVCQUF1Qix5REFBeUQsZ0NBQWdDLHVDQUF1QyxxQ0FBcUMsaUNBQWlDLGVBQWUsTUFBTSxZQUFZLHNCQUFzQixVQUFVLE9BQU8sY0FBYyxVQUFVLDJCQUEyQixlQUFlLFdBQVcsNEdBQTRHLGlOQUFpTixnREFBZ0Qsa0RBQWtELG1EQUFtRCxnRkFBZ0YsZUFBZSwrQkFBK0IsNkNBQTZDLFFBQVEsc01BQXNNLHVDQUF1QyxTQUFTLG9CQUFvQixRQUFRLGdFQUFnRSwwREFBMEQsdUJBQXVCLGdCQUFnQixtTUFBbU0sRUFBRSxvTkFBb04scUdBQXFHLHVCQUF1QixxZkFBcWYsV0FBVyw4RUFBOEUsWUFBWSwrQkFBK0IsOEJBQThCLHlDQUF5QyxhQUFhLCtCQUErQixpREFBaUQsaUJBQWlCLFVBQVUsc0JBQXNCLDhCQUE4Qiw2QkFBNkIsV0FBVyxnREFBZ0QsZ0ZBQWdGLFVBQVUsd0NBQXdDLGFBQWEsK0JBQStCLGlEQUFpRCxtSkFBbUoseUJBQXlCLHdDQUF3QyxtQkFBbUIsWUFBWSwwQkFBMEIsbUJBQW1CLGFBQWEsMkJBQTJCLHVJQUF1SSw2RUFBNkUsaURBQWlELFVBQVUsdUNBQXVDLCtCQUErQixpREFBaUQsUUFBUSwrRUFBK0UsZ0NBQWdDLHNFQUFzRSxNQUFNLHNCQUFzQix1Q0FBdUMsa0dBQWtHLDhCQUE4QixPQUFPLG1DQUFtQyxtR0FBbUcsOEZBQThGLHNCQUFzQixFQUFFLEtBQUssK0ZBQStGLG1CQUFtQix5Q0FBeUMsRUFBRSwyQkFBMkIsV0FBVywrRUFBK0Usb0NBQW9DLG9EQUFvRCxjQUFjLFdBQVcsbURBQW1ELFdBQVcsS0FBSyxXQUFXLGFBQWEsT0FBTyxTQUFTLG9CQUFvQixPQUFPLGNBQWMsVUFBVSx1Q0FBdUMsU0FBUyxvQkFBb0IsUUFBUSxpQ0FBaUMsaUdBQWlHLGNBQWMsVUFBVSx1Q0FBdUMsU0FBUyxvQkFBb0IsbUJBQW1CLG9CQUFvQixhQUFhLG9CQUFvQixhQUFhLGtCQUFrQixvR0FBb0csV0FBVyxLQUFLLFdBQVcsb0lBQW9JLHdEQUF3RCxvRUFBb0UsT0FBTyxLQUFLLGdCQUFnQixnQkFBZ0IsdUJBQXVCLElBQUksY0FBYyxVQUFVLHVDQUF1QyxTQUFTLGtFQUFrRSxzREFBc0Qsa0NBQWtDLHFDQUFxQyx3RkFBd0YsOEJBQThCLFNBQVMsK0NBQStDLElBQUksWUFBWSxPQUFPLHFCQUFxQixtQkFBbUIsUUFBUSxVQUFVLDhDQUE4Qyx3R0FBd0csbUlBQW1JLGlCQUFpQiwyRkFBMkYsbUJBQW1CLGlLQUFpSyxTQUFTLE9BQU8sbUJBQW1CLGFBQWEsWUFBWSxnRkFBZ0YsZUFBZSxxQkFBcUIsb0JBQW9CLDRFQUE0RSxFQUFFLGNBQWMsNkVBQTZFLHFCQUFxQixNQUFNLDBEQUEwRCwrQkFBK0IsZ0NBQWdDLHlGQUF5RixLQUFLLDJHQUEyRywwSUFBMEksS0FBSyxnQ0FBZ0Msc0hBQXNILHFHQUFxRyxtQkFBbUIscUZBQXFGLGVBQWUsc0RBQXNELDhCQUE4QixRQUFRLHFDQUFxQyw2QkFBNkIsa0NBQWtDLGVBQWUsbUVBQW1FLFlBQVksK0JBQStCLDhCQUE4QixvQ0FBb0MsOEVBQThFLG9FQUFvRSxrQ0FBa0MsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLDRCQUE0QixTQUFTLGtCQUFrQixtRUFBbUUsNkJBQTZCLHFEQUFxRCxvQ0FBb0Msa0JBQWtCLFVBQVUsZUFBZSxvSUFBb0ksZUFBZSwwSUFBMEksdUNBQXVDLFNBQVMsb0JBQW9CLFFBQVEsd0RBQXdELHFCQUFxQix3Q0FBd0MsMEJBQTBCLHNCQUFzQiw4RUFBOEUsaUJBQWlCLFlBQVksNkNBQTZDLGVBQWUsK0VBQStFLHFEQUFxRCw4Q0FBOEMsNkVBQTZFLHFCQUFxQix3REFBd0QsNkNBQTZDLDRFQUE0RSxvQkFBb0IsK0RBQStELGNBQWMsVUFBVSx1QkFBdUIsK0ZBQStGLDJCQUEyQix1QkFBdUIsSUFBSSxLQUFLLHlDQUF5QyxNQUFNLG9CQUFvQixZQUFZLG9DQUFvQyxPQUFPLDRDQUE0Qyx1QkFBdUIsa0JBQWtCLGNBQWMsb0JBQW9CLEtBQUsscUJBQXFCLEVBQUUsNENBQTRDLHdCQUF3Qix5RUFBeUUsa0JBQWtCLE9BQU8sNENBQTRDLG1CQUFtQiw0Q0FBNEMsTUFBTSxVQUFVLHNJQUFzSSxjQUFjLEVBQUUscUJBQXFCLG9HQUFvRyx1QkFBdUIsWUFBWSw2QkFBNkIsS0FBSywrQ0FBK0Msb0JBQW9CLG1CQUFtQix1QkFBdUIsbUNBQW1DLG9EQUFvRCxXQUFXLGlCQUFpQiw0RkFBNEYsbUJBQW1CLGdDQUFnQyxpSUFBaUksaUJBQWlCLDhDQUE4QyxzREFBc0QsU0FBUyxXQUFXLHNDQUFzQywrRUFBK0Usc0JBQXNCLG1FQUFtRSx1Q0FBdUMsU0FBUyxvQkFBb0IsUUFBUSw0REFBNEQsb0NBQW9DLG1HQUFtRyxxRkFBcUYsZ0NBQWdDLGVBQWUsY0FBYyxrRUFBa0UsWUFBWSxrQ0FBa0MsMERBQTBELHVDQUF1QyxtQ0FBbUMsZUFBZSwwREFBMEQsaUZBQWlGLG9CQUFvQixvQkFBb0IsMEVBQTBFLG1DQUFtQyx1Q0FBdUMsb0hBQW9ILE1BQU0sbUNBQW1DLHFDQUFxQyw4Q0FBOEMsaUVBQWlFLGNBQWMsVUFBVSx1Q0FBdUMsU0FBUyxvQkFBb0IsUUFBUSxvQ0FBb0MsdUNBQXVDLGtEQUFrRCw2QkFBNkIsbUdBQW1HLG1GQUFtRixxQkFBcUIsMEJBQTBCLHVCQUF1QixrQ0FBa0MsNkNBQTZDLGlEQUFpRCxxQ0FBcUMsZUFBZSwrQkFBK0IsZ0NBQWdDLHdEQUF3RCxxQkFBcUIsRUFBRSx3Q0FBd0MsTUFBTSxvREFBb0QsTUFBTSw0QkFBNEIsY0FBYyxVQUFVLGVBQWUsa0NBQWtDLGtCQUFrQiw2QkFBNkIsNkJBQTZCLHVDQUF1QyxTQUFTLG9CQUFvQixRQUFRLHlDQUF5QyxpQkFBaUIsK0RBQStELFlBQVksK0JBQStCLHNDQUFzQyxrQ0FBa0MsNEJBQTRCLGtEQUFrRCw2Q0FBNkMsTUFBTSxpQ0FBaUMsa0NBQWtDLDRHQUE0RyxzQ0FBc0Msb0JBQW9CLGlDQUFpQyxxQkFBcUIsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLG9CQUFvQixRQUFRLG9DQUFvQywwRUFBMEUsY0FBYyxVQUFVLGVBQWUsK0tBQStLLGVBQWUsOEJBQThCLHlEQUF5RCxlQUFlLHFCQUFxQiw2RUFBNkUsdUJBQXVCLCtCQUErQixnQ0FBZ0MsaUVBQWlFLDhEQUE4RCwrQ0FBK0MsOE1BQThNLHdCQUF3QixXQUFXLGdDQUFnQyxzQ0FBc0MsWUFBWSw2QkFBNkIsS0FBSyw2QkFBNkIsb0lBQW9JLEVBQUUsdUNBQXVDLFNBQVMsa0NBQWtDLFFBQVEsOEdBQThHLHlDQUF5QyxJQUFJLEdBQUcsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLGtDQUFrQyxhQUFhLHVDQUF1QyxTQUFTLGdDQUFnQyxnRkFBZ0YsV0FBVyxHQUFHLDJDQUEyQyxRQUFRLHFDQUFxQyxjQUFjLFVBQVUsdUNBQXVDLFNBQVMsMkJBQTJCLFNBQVMsZ0JBQWdCLFdBQVcsNEVBQTRFLFVBQVUsVUFBVSxpQkFBaUIsbUJBQW1CLDZCQUE2QixtQkFBbUIsNkRBQTZELDRCQUE0QixJQUFJLGlDQUFpQywyREFBMkQsT0FBTyxTQUFTLFNBQVMsUUFBUSxJQUFJLDhCQUE4QixRQUFRLGNBQWMsVUFBVSxxQkFBcUIsTUFBTSxxQ0FBcUMsb0RBQW9ELGlMQUFpTCxrQkFBa0IsaUtBQWlLLEdBQUcsaUJBQWlCLG9DQUFvQyx1QkFBdUIsSUFBSSxjQUFjLFNBQVMsaUJBQWlCLFlBQVksV0FBVyxLQUFLLFdBQVcsK0dBQStHLG1CQUFtQix5Q0FBeUMsa0RBQWtELFdBQVcsdUNBQXVDLFNBQVMsd0NBQXdDLGtCQUFrQixjQUFjLGVBQWUsOEVBQThFLHFEQUFxRCw4QkFBOEIsOEtBQThLLFFBQVEsZ0JBQWdCLGdDQUFnQywrQ0FBK0MsNERBQTRELGdIQUFnSCxXQUFXLHNCQUFzQiw4QkFBOEIsdUJBQXVCLFVBQVUsR0FBRyxJQUFJLGlEQUFpRCx5REFBeUQsU0FBUyxvQkFBb0IsK0JBQStCLEVBQUUscUVBQXFFLEVBQUUsZ0NBQWdDLHVCQUF1QixvSkFBb0osRUFBRSxpQ0FBaUMsWUFBWSxxQkFBcUIsS0FBSyxxQkFBcUIsa0RBQWtELEVBQUUsK0JBQStCLG9EQUFvRCx5QkFBeUIsc0NBQXNDLElBQUksdUVBQXVFLFdBQVcsS0FBSywyQ0FBMkMsa0JBQWtCLDBIQUEwSCxrQ0FBa0Msd0JBQXdCLDhOQUE4Tiw0Q0FBNEMsU0FBUyxpR0FBaUcsZ0RBQWdELFVBQVUsRUFBRSwyQ0FBMkMsMkdBQTJHLG9EQUFvRCxZQUFZLHVCQUF1QixLQUFLLDJDQUEyQyw0REFBNEQsNkNBQTZDLGdIQUFnSCxFQUFFLG9DQUFvQywwRkFBMEYsZ0VBQWdFLEdBQUcsa0ZBQWtGLHFCQUFxQiwyQkFBMkIsbURBQW1ELDhEQUE4RCw0QkFBNEIsRUFBRSxrQ0FBa0MsNENBQTRDLGdCQUFnQixpQkFBaUIsV0FBVyxLQUFLLFdBQVcsVUFBVSwwREFBMEQsZ0NBQWdDLHdDQUF3QyxXQUFXLGtCQUFrQixJQUFJLEVBQUUsNkJBQTZCLG9CQUFvQixvQ0FBb0MscUJBQXFCLDJFQUEyRSxJQUFJLGdCQUFnQixZQUFZLHFCQUFxQixLQUFLLHFCQUFxQiw0Q0FBNEMsdUNBQXVDLEVBQUUsc0NBQXNDLGVBQWUsWUFBWSxXQUFXLEtBQUssNENBQTRDLGtCQUFrQixtQ0FBbUMsRUFBRSxvQkFBb0IsRUFBRSxpREFBaUQseURBQXlELGFBQWEsd0ZBQXdGLFdBQVcsS0FBSywrQkFBK0IsNERBQTRELGtFQUFrRSxFQUFFLHVDQUF1QyxxRkFBcUYsRUFBRSxpQ0FBaUMscUhBQXFILHdCQUF3QixrQ0FBa0Msa0NBQWtDLGtCQUFrQixFQUFFLCtCQUErQixnQ0FBZ0Msd0JBQXdCLEdBQUcsaUJBQWlCLE9BQU8sdUJBQXVCLFFBQVEsWUFBWSw4QkFBOEIsMkJBQTJCLGlCQUFpQixVQUFVLG9FQUFvRSxFQUFFLCtCQUErQixjQUFjLFVBQVUsZUFBZSxtREFBbUQsOEJBQThCLHVDQUF1QyxTQUFTLGdDQUFnQyxvQkFBb0IsMERBQTBELGVBQWUsWUFBWSw0REFBNEQsT0FBTyw2Q0FBNkMsc0JBQXNCLG9CQUFvQix3QkFBd0IsVUFBVSw2REFBNkQsMkNBQTJDLFFBQVEsMkRBQTJELGtDQUFrQyxZQUFZLCtCQUErQixvQkFBb0IsaUNBQWlDLGdEQUFnRCxpQ0FBaUMsK0ZBQStGLCtDQUErQyxpREFBaUQsOENBQThDLCtDQUErQyx5SUFBeUksOERBQThELDhDQUE4Qyw4REFBOEQsaUNBQWlDLDZDQUE2QyxjQUFjLFVBQVUsdUNBQXVDLFNBQVMsa0NBQWtDLE1BQU0seUNBQXlDLFlBQVksbUJBQW1CLFNBQVMsYUFBYSxVQUFVLGVBQWUsa0ZBQWtGLGdCQUFnQixhQUFhLG9HQUFvRyxLQUFLLGlCQUFpQixZQUFZLFdBQVcsS0FBSyxXQUFXLCtHQUErRyxpQkFBaUIsK0NBQStDLHVCQUF1QixPQUFPLGlCQUFpQix5REFBeUQsZUFBZSxvR0FBb0csU0FBUyxlQUFlLGtFQUFrRSw2Q0FBNkMsS0FBSyxtQkFBbUIseUNBQXlDLGtEQUFrRCxXQUFXLHVDQUF1QyxTQUFTLDBCQUEwQixtQkFBbUIsZUFBZSw0R0FBNEcsMENBQTBDLGFBQWEscUNBQXFDLGFBQWEsTUFBTSxnQ0FBZ0MsNERBQTRELG1DQUFtQyxxQ0FBcUMsSUFBSSxnRkFBZ0YsT0FBTyxTQUFTLFVBQVUsY0FBYyxjQUFjLE1BQU0sMkJBQTJCLG1DQUFtQywrQkFBK0Isa0JBQWtCLEVBQUUsMEJBQTBCLE1BQU0sZUFBZSw4RUFBOEUsb3dCQUFvd0IsNEpBQTRKLDZEQUE2RCxjQUFjLDhCQUE4QixrQ0FBa0Msa0NBQWtDLG9mQUFvZixRQUFRLEVBQUUsZ0NBQWdDLHNGQUFzRiwwSEFBMEgsZ0JBQWdCLGdDQUFnQyx3QkFBd0IsK0VBQStFLDBFQUEwRSxjQUFjLDRDQUE0QyxPQUFPLDZHQUE2RyxtREFBbUQsRUFBRSx3Q0FBd0MsRUFBRSxnREFBZ0QsNkRBQTZELEVBQUUsdUNBQXVDLDRCQUE0Qix3QkFBd0IsY0FBYywwREFBMEQsT0FBTyxlQUFlLG1CQUFtQixpQkFBaUIsZUFBZSxRQUFRLGVBQWUsbUJBQW1CLGlCQUFpQixlQUFlLFVBQVUsZUFBZSxxQkFBcUIsaUJBQWlCLGlCQUFpQixVQUFVLGVBQWUscUJBQXFCLGlCQUFpQixpQkFBaUIsS0FBSyxlQUFlLG9CQUFvQixpQkFBaUIsZ0JBQWdCLEtBQUssZUFBZSxvQkFBb0IsaUJBQWlCLGdCQUFnQixZQUFZLGVBQWUsdUJBQXVCLGlCQUFpQixtQkFBbUIsWUFBWSxlQUFlLHVCQUF1QixpQkFBaUIsb0JBQW9CLEVBQUUsVUFBVSxtQkFBbUIseUNBQXlDLGtEQUFrRCxXQUFXLHVDQUF1QyxTQUFTLDZEQUE2RCxlQUFlLDhFQUE4RSxpTkFBaU4sZ0JBQWdCLGlCQUFpQixZQUFZLFdBQVcsS0FBSyxXQUFXLCtHQUErRyxtQkFBbUIseUNBQXlDLGtEQUFrRCxXQUFXLHVDQUF1QyxTQUFTLDBDQUEwQyw2QkFBNkIsdUJBQXVCLG1HQUFtRyxpR0FBaUcsMkJBQTJCLG1DQUFtQyx5REFBeUQsNEJBQTRCLEdBQUcsdUJBQXVCLGNBQWMseUNBQXlDLGVBQWUsOEVBQThFLHVMQUF1TCwrQkFBK0IseUdBQXlHLDRCQUE0Qix5Q0FBeUMsOFBBQThQLGFBQWEsK0ZBQStGLG9HQUFvRywyREFBMkQsV0FBVyxlQUFlLGtCQUFrQixrQ0FBa0MsZUFBZSxhQUFhLEdBQUcscUJBQXFCLGtCQUFrQixrQ0FBa0MsaUJBQWlCLGdDQUFnQyxHQUFHLHFCQUFxQixvQ0FBb0MsaUJBQWlCLEVBQUUsUUFBUSxnQkFBZ0IsMENBQTBDLFVBQVUsRUFBRSx3Q0FBd0Msc0RBQXNELHFDQUFxQywwRkFBMEYsR0FBRyxFQUFFLGtDQUFrQywwUUFBMFEsdUJBQXVCLGtDQUFrQyxtREFBbUQsb0RBQW9ELHNDQUFzQyxFQUFFLHdDQUF3Qyw4RkFBOEYseU5BQXlOLDJOQUEyTixpQ0FBaUMsZ0lBQWdJLGdQQUFnUCxFQUFFLDZCQUE2QixpRUFBaUUsaUlBQWlJLE1BQU0sa0NBQWtDLEVBQUUsd0NBQXdDLDhCQUE4Qix5Q0FBeUMsNENBQTRDLDJDQUEyQyxxSEFBcUgsd0RBQXdELEVBQUUscUNBQXFDLGlEQUFpRCxxQ0FBcUMsR0FBRyxFQUFFLDRCQUE0QixNQUFNLHFGQUFxRixxQ0FBcUMsd0NBQXdDLEVBQUUscUNBQXFDLGtEQUFrRCxFQUFFLG1DQUFtQywwQkFBMEIsRUFBRSw0QkFBNEIscUNBQXFDLGlCQUFpQixvSEFBb0gsRUFBRSx3Q0FBd0Msd0JBQXdCLHlIQUF5SCxnQkFBZ0IsSUFBSSxFQUFFLHVDQUF1QywrQ0FBK0MsRUFBRSw0Q0FBNEMscUVBQXFFLGtOQUFrTixpQkFBaUIsc2JBQXNiLHFGQUFxRixLQUFLLEVBQUUsd0NBQXdDLDhCQUE4QixXQUFXLHVCQUF1QiwrQ0FBK0MsaUZBQWlGLG9EQUFvRCxFQUFFLGlEQUFpRCw2RkFBNkYsRUFBRSwrQkFBK0Isc0dBQXNHLEVBQUUsbURBQW1ELDJFQUEyRSxFQUFFLG1DQUFtQyx3R0FBd0csRUFBRSxpQ0FBaUMsd0RBQXdELDhOQUE4TixrREFBa0QsNEtBQTRLLEVBQUUsNEJBQTRCLG1CQUFtQix3QkFBd0IsR0FBRyxrQkFBa0IsVUFBVSxjQUFjLFVBQVUsZUFBZSw2RkFBNkYsZUFBZSxrQkFBa0IsZUFBZSxnQkFBZ0Isa0RBQWtELGFBQWEsdUJBQXVCLDJGQUEyRixlQUFlLGdCQUFnQixnR0FBZ0csaUJBQWlCLG9DQUFvQyw0QkFBNEIsdUNBQXVDLFNBQVMsbUZBQW1GLFFBQVEsMEZBQTBGLG9DQUFvQyxZQUFZLCtCQUErQixzQkFBc0IsT0FBTyxRQUFRLFVBQVUsVUFBVSwyQ0FBMkMseUJBQXlCLHlIQUF5SCxvQkFBb0Isd0JBQXdCLFVBQVUsYUFBYSxpQ0FBaUMsb0JBQW9CLG1GQUFtRixjQUFjLFVBQVUsaUJBQWlCLFlBQVksV0FBVyxLQUFLLFdBQVcsK0dBQStHLG1CQUFtQix5Q0FBeUMsa0RBQWtELFdBQVcsdUNBQXVDLFNBQVMsb0NBQW9DLGtCQUFrQixjQUFjLGVBQWUsOEVBQThFLHdlQUF3ZSxRQUFRLGdCQUFnQiw4QkFBOEIsK0JBQStCLDJCQUEyQixtSEFBbUgsNEdBQTRHLFFBQVEsZ0VBQWdFLDJEQUEyRCxvRkFBb0YsS0FBSyxrRUFBa0Usc0JBQXNCLGlGQUFpRiwyQ0FBMkMsY0FBYyw4Q0FBOEMsdUVBQXVFLEVBQUUsb0NBQW9DLDZIQUE2SCxtQkFBbUIsd0JBQXdCLHdFQUF3RSwyQ0FBMkMsY0FBYyxrRkFBa0YsaUZBQWlGLDhFQUE4RSwrQkFBK0IsdUJBQXVCLElBQUksRUFBRSxzQ0FBc0MsV0FBVyx3REFBd0Qsc0VBQXNFLDhCQUE4Qix5QkFBeUIsSUFBSSxFQUFFLG9DQUFvQyxXQUFXLDRDQUE0QyxjQUFjLElBQUksRUFBRSxtQ0FBbUMsb0ZBQW9GLGNBQWMseURBQXlELG9IQUFvSCw4QkFBOEIsS0FBSyxpREFBaUQsT0FBTyx1REFBdUQsd0dBQXdHLHVCQUF1QixHQUFHLGlCQUFpQiwwRkFBMEYsY0FBYyxFQUFFLHFDQUFxQywyRUFBMkUsUUFBUSxPQUFPLGdFQUFnRSxJQUFJLHVEQUF1RCwwRUFBMEUsaUNBQWlDLCtCQUErQix5QkFBeUIsR0FBRyxpQkFBaUIsc0ZBQXNGLGNBQWMsRUFBRSwrQkFBK0IsNkRBQTZELFlBQVksZ0RBQWdELHdDQUF3QyxxQ0FBcUMsNERBQTRELEVBQUUsMkJBQTJCLDREQUE0RCxFQUFFLDRCQUE0QixnR0FBZ0csd0JBQXdCLEdBQUcsZUFBZSxrQ0FBa0MsdURBQXVELHFCQUFxQixVQUFVLDJCQUEyQixxQkFBcUIsd0JBQXdCLG1CQUFtQixRQUFRLGdFQUFnRSxpQkFBaUIsaUlBQWlJLHdGQUF3RixZQUFZLCtCQUErQixvQkFBb0Isb0JBQW9CLDhDQUE4Qyw4QkFBOEIsaUVBQWlFLGlDQUFpQyxnREFBZ0Qsd0JBQXdCLHFCQUFxQixFQUFFLGtCQUFrQixZQUFZLE1BQU0sbUJBQW1CLGlDQUFpQyw0QkFBNEIsbUJBQW1CLGlEQUFpRCxpQ0FBaUMsMkVBQTJFLHVEQUF1RCxpREFBaUQsZ0tBQWdLLDhEQUE4RCxnREFBZ0QsaUVBQWlFLGNBQWMsVUFBVSxpQkFBaUIsWUFBWSxXQUFXLEtBQUssV0FBVywrR0FBK0csbUJBQW1CLHlDQUF5QyxrREFBa0QsV0FBVyxpQkFBaUIsWUFBWSxXQUFXLEtBQUssV0FBVyx1Q0FBdUMsTUFBTSx1Q0FBdUMsU0FBUyxzQkFBc0Isa0JBQWtCLGNBQWMsZUFBZSw4RUFBOEUscURBQXFELG1JQUFtSSxNQUFNLEVBQUUsUUFBUSxnQkFBZ0IsNkJBQTZCLG9CQUFvQixrRkFBa0YsRUFBRSw2QkFBNkIseUJBQXlCLDBEQUEwRCxFQUFFLDhCQUE4Qix5QkFBeUIsWUFBWSxvQkFBb0IsMkJBQTJCLGNBQWMsS0FBSyw2QkFBNkIseUJBQXlCLEVBQUUsZ0NBQWdDLGFBQWEsd0JBQXdCLEdBQUcsZ0JBQWdCLFVBQVUsdUNBQXVDLFNBQVMsMkJBQTJCLGdDQUFnQywrRUFBK0UsVUFBVSxVQUFVLHVDQUF1QyxTQUFTLHNDQUFzQyxzQkFBc0IsK0JBQStCLHlFQUF5RSxnU0FBZ1MsbURBQW1ELHNDQUFzQyx1QkFBdUIscURBQXFELHVDQUF1Qyx5RkFBeUYsWUFBWSxXQUFXLEtBQUssV0FBVyxlQUFlLFlBQVksd0JBQXdCLGlDQUFpQyxZQUFZLHFLQUFxSyxVQUFVLE9BQU8seUZBQXlGLHlGQUF5RixZQUFZLFdBQVcsS0FBSyxXQUFXLGdCQUFnQixZQUFZLHdCQUF3QixrQ0FBa0MsWUFBWSxNQUFNLHVNQUF1TSxzRUFBc0Usa0JBQWtCLDRCQUE0QiwrQkFBK0IsbUNBQW1DLHNDQUFzQyxtQkFBbUIsWUFBWSxzQ0FBc0MsMkNBQTJDLFlBQVksb0NBQW9DLDhIQUE4SCw2QkFBNkIsNEJBQTRCLDhCQUE4Qiw2QkFBNkIsSUFBSSxVQUFVLGlCQUFpQixZQUFZLFdBQVcsS0FBSyxXQUFXLCtHQUErRyxtQkFBbUIseUNBQXlDLGtEQUFrRCxXQUFXLHVDQUF1QyxTQUFTLHlCQUF5QixrQkFBa0Isb0JBQW9CLGVBQWUsOEVBQThFLCtiQUErYixRQUFRLGdCQUFnQiwrQkFBK0IsT0FBTyxPQUFPLGFBQWEsY0FBYyxFQUFFLHNDQUFzQyxxU0FBcVMsRUFBRSxxREFBcUQsa0hBQWtILEVBQUUsdUNBQXVDLHFCQUFxQixnQkFBZ0IsaUNBQWlDLHVKQUF1Siw2TEFBNkwsRUFBRSxnQ0FBZ0Msc0tBQXNLLEVBQUUsb0NBQW9DLFdBQVcsdUVBQXVFLHNCQUFzQixvQkFBb0Isc0VBQXNFLGtGQUFrRixFQUFFLDRDQUE0Qyw4Q0FBOEMsc0VBQXNFLFlBQVksd0JBQXdCLEVBQUUsK0JBQStCLDJDQUEyQyxFQUFFLG9DQUFvQywyRkFBMkYsRUFBRSwrQkFBK0Isc0JBQXNCLEVBQUUsa0NBQWtDLDZFQUE2RSxFQUFFLDRDQUE0QywyRUFBMkUsRUFBRSxzQ0FBc0Msa0lBQWtJLEVBQUUsdUNBQXVDLG9JQUFvSSxFQUFFLDZCQUE2QixpQ0FBaUMsRUFBRSxxQ0FBcUMsdURBQXVELG1EQUFtRCxnQkFBZ0Isc0NBQXNDLFlBQVksY0FBYyxLQUFLLGNBQWMsdU1BQXVNLGFBQWEsRUFBRSwrQkFBK0IsZ0NBQWdDLEVBQUUsZ0NBQWdDLGlDQUFpQyxFQUFFLDRCQUE0QixxQkFBcUIsdUNBQXVDLGdFQUFnRSxzQ0FBc0Msa0JBQWtCLG1EQUFtRCwyQ0FBMkMsc0RBQXNELGFBQWEsRUFBRSw2QkFBNkIsNElBQTRJLEtBQUssS0FBSyxrREFBa0Qsa0RBQWtELHFCQUFxQixLQUFLLGtGQUFrRixrREFBa0Qsd0JBQXdCLEdBQUcsbUJBQW1CLFVBQVUsaUJBQWlCLFlBQVksV0FBVyxLQUFLLFdBQVcsK0dBQStHLG1CQUFtQix5Q0FBeUMsa0RBQWtELFdBQVcsdUNBQXVDLFNBQVMsNEJBQTRCLGtCQUFrQixjQUFjLFdBQVcsZUFBZSw4RUFBOEUsb0RBQW9ELHVEQUF1RCxpQ0FBaUMsK0hBQStILHFCQUFxQixHQUFHLGdFQUFnRSxFQUFFLFFBQVEsZ0JBQWdCLDhCQUE4QixxQkFBcUIsRUFBRSwyQkFBMkIsRUFBRSxnRkFBZ0YsbUNBQW1DLHlOQUF5Tix5QkFBeUIsZ0VBQWdFLHNEQUFzRCxLQUFLLEVBQUUsOEJBQThCLHVHQUF1RyxrQkFBa0IsNEJBQTRCLHVEQUF1RCxHQUFHLDBCQUEwQixFQUFFLHVDQUF1QyxZQUFZLG1CQUFtQixLQUFLLDRCQUE0QixpSkFBaUosd0JBQXdCLEdBQUcsc0JBQXNCLFVBQVUsaUJBQWlCLFlBQVksV0FBVyxLQUFLLFdBQVcsK0dBQStHLG1CQUFtQix5Q0FBeUMsa0RBQWtELFdBQVcsaUJBQWlCLG1CQUFtQiw2QkFBNkIsbUJBQW1CLDZEQUE2RCw0QkFBNEIsSUFBSSxpQ0FBaUMsMkRBQTJELE9BQU8sU0FBUyxTQUFTLFFBQVEsSUFBSSw4QkFBOEIsUUFBUSxjQUFjLFVBQVUscUJBQXFCLE1BQU0scUNBQXFDLG9EQUFvRCxpTEFBaUwsa0JBQWtCLGlLQUFpSyxHQUFHLGlCQUFpQixvQ0FBb0MsdUJBQXVCLElBQUksY0FBYyxTQUFTLHVDQUF1QyxTQUFTLG9CQUFvQixrQkFBa0IsY0FBYyxlQUFlLDhFQUE4RSwySUFBMkksUUFBUSxnQkFBZ0IsOENBQThDLHFDQUFxQyxFQUFFLHVDQUF1QyxzQ0FBc0MsRUFBRSxnREFBZ0QsK0NBQStDLHdCQUF3QixHQUFHLGVBQWUsK0JBQStCLHdCQUF3QixzQkFBc0IsSUFBSSxxREFBcUQsUUFBUSxnQ0FBZ0MsZUFBZSxTQUFTLCtDQUErQyxZQUFZLFVBQVUsUUFBUSxZQUFZLFdBQVcsS0FBSyxXQUFXLHNCQUFzQixtQ0FBbUMscUNBQXFDLEdBQUcsT0FBTyxrQ0FBa0Msb0NBQW9DLG9DQUFvQywwQkFBMEIsc0JBQXNCLEtBQUssS0FBSyxXQUFXLGtDQUFrQyxtQ0FBbUMsS0FBSyxLQUFLLHVEQUF1RCx3Q0FBd0Msa0VBQWtFLE9BQU8sYUFBYSx3SEFBd0gsb0JBQW9CLG9DQUFvQyx5QkFBeUIsR0FBRyxPQUFPLHdCQUF3QixzS0FBc0ssb0JBQW9CLHlDQUF5Qyx5QkFBeUIsVUFBVSw2QkFBNkIsdUJBQXVCLE1BQU0sY0FBYyxxQkFBcUIsS0FBSyxrQkFBa0IsT0FBTyxZQUFZLFdBQVcsaUJBQWlCLCtHQUErRyxPQUFPLGdEQUFnRCxnRUFBZ0UsZ0JBQWdCLDRFQUE0RSxxQkFBcUIsRUFBRSxZQUFZLFdBQVcsS0FBSyxvQ0FBb0MscUVBQXFFLGtCQUFrQixrQkFBa0IsWUFBWSxXQUFXLEtBQUssdURBQXVELHFDQUFxQyxtQkFBbUIsY0FBYyxlQUFlLGtGQUFrRixjQUFjLDRCQUE0QixlQUFlLDZCQUE2QixpQkFBaUIsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLG9CQUFvQixRQUFRLHFGQUFxRixZQUFZLHdCQUF3QixLQUFLLE1BQU0sb0JBQW9CLGVBQWUsY0FBYyxZQUFZLDhCQUE4Qiw0REFBNEQsc0NBQXNDLFlBQVksNkJBQTZCLEtBQUssaUNBQWlDLGtFQUFrRSxFQUFFLEVBQUUsMEJBQTBCLG1CQUFtQixZQUFZLHdCQUF3Qiw0REFBNEQsc0NBQXNDLFlBQVksNkJBQTZCLEtBQUssNkJBQTZCLHNCQUFzQixtQ0FBbUMsNEJBQTRCLFVBQVUsY0FBYyxZQUFZLDZCQUE2QixLQUFLLDZCQUE2QixnRUFBZ0UsWUFBWSx3QkFBd0Isb0NBQW9DLDZCQUE2QixLQUFLLDZCQUE2QixvQkFBb0IsWUFBWSxrQkFBa0Isc0NBQXNDLDZCQUE2QixLQUFLLDZCQUE2QiwwQkFBMEIscUJBQXFCLGdFQUFnRSxzQ0FBc0MsZ0RBQWdELGNBQWMsaUJBQWlCLG9DQUFvQyxnQkFBZ0IsR0FBRyxVQUFVLGNBQWMsVUFBVSxlQUFlLGtGQUFrRixnQkFBZ0IsYUFBYSxvR0FBb0csS0FBSyxpQkFBaUIsbUJBQW1CLDZCQUE2QixtQkFBbUIsNkRBQTZELDRCQUE0QixJQUFJLGlDQUFpQywyREFBMkQsT0FBTyxTQUFTLFNBQVMsUUFBUSxJQUFJLDhCQUE4QixRQUFRLGNBQWMsVUFBVSxxQkFBcUIsTUFBTSxxQ0FBcUMsb0RBQW9ELGlMQUFpTCxrQkFBa0IsaUtBQWlLLEdBQUcsaUJBQWlCLG9DQUFvQyx1QkFBdUIsSUFBSSxjQUFjLFNBQVMsaUJBQWlCLDhFQUE4RSxpQkFBaUIsWUFBWSxXQUFXLEtBQUssV0FBVywrR0FBK0csaUJBQWlCLCtDQUErQyx1QkFBdUIsT0FBTyxpQkFBaUIsNkRBQTZELG9HQUFvRyxTQUFTLE1BQU0sZUFBZSxrRUFBa0UsNkNBQTZDLEtBQUssdUNBQXVDLFNBQVMsb0JBQW9CLDhGQUE4RixpQkFBaUIsbUJBQW1CLGdHQUFnRywwQkFBMEIsd0JBQXdCLFlBQVksMEJBQTBCLEtBQUssNkJBQTZCLDRHQUE0RyxTQUFTLHNEQUFzRCxLQUFLLFNBQVMsMERBQTBELFlBQVksZUFBZSxxREFBcUQsa0RBQWtELE9BQU8sT0FBTyw0R0FBNEcsU0FBUyxzREFBc0QsWUFBWSxXQUFXLEtBQUssc0NBQXNDLG1CQUFtQixlQUFlLGlDQUFpQyxrREFBa0Qsd0VBQXdFLGNBQWMsRUFBRSxpQkFBaUIsK0VBQStFLG9EQUFvRCxXQUFXLDZFQUE2RSwwQkFBMEIsV0FBVyxLQUFLLFdBQVcsMEJBQTBCLFFBQVEsMkNBQTJDLFlBQVksS0FBSyxZQUFZLEtBQUssWUFBWSxhQUFhLDhCQUE4QixhQUFhLFlBQVksNkJBQTZCLEtBQUssNkJBQTZCLGtGQUFrRixvQkFBb0IsOEJBQThCLFlBQVkseUNBQXlDLHVDQUF1QyxLQUFLLG9CQUFvQixTQUFTLDRCQUE0Qix1QkFBdUIsRUFBRSxtQ0FBbUMsRUFBRSxtQ0FBbUMsRUFBRSwrQkFBK0IsRUFBRSxtQ0FBbUMsSUFBSSx3Q0FBd0MsRUFBRSx3Q0FBd0MsRUFBRSxvQ0FBb0MsRUFBRSw2QkFBNkIsRUFBRSx5Q0FBeUMsRUFBRSx3Q0FBd0MsRUFBRSxxQ0FBcUMsRUFBRSx3Q0FBd0MsU0FBUyxpQ0FBaUMsWUFBWSw2QkFBNkIsNENBQTRDLDhDQUE4QyxlQUFlLDRHQUE0RywwQ0FBMEMsYUFBYSxxQ0FBcUMsYUFBYSxNQUFNLGdDQUFnQyw0REFBNEQsbUNBQW1DLHFDQUFxQyxJQUFJLGdGQUFnRixPQUFPLFNBQVMsVUFBVSxjQUFjLGNBQWMsTUFBTSwyQkFBMkIsbUNBQW1DLCtCQUErQixrQkFBa0IsRUFBRSxhQUFhLDBDQUEwQyxnQkFBZ0IsMENBQTBDLDJDQUEyQyxpQkFBaUIsdUNBQXVDLEVBQUUsNEJBQTRCLGdCQUFnQix3QkFBd0IsNkJBQTZCLHdCQUF3QiwwQkFBMEIsb0JBQW9CLDJCQUEyQixxQ0FBcUMsZ0RBQWdELHlCQUF5QixZQUFZLGlDQUFpQyxtQkFBbUIscUNBQXFDLHNCQUFzQixvQ0FBb0Msd0RBQXdELEtBQUssS0FBSyw2QkFBNkIsNkRBQTZELGNBQWMsK0VBQStFLG9EQUFvRCxjQUFjLFVBQVUsZUFBZSxrRkFBa0YsZ0JBQWdCLGFBQWEsb0dBQW9HLEtBQUssbUJBQW1CLCtFQUErRSxvQkFBb0IsS0FBSyw2REFBNkQsRUFBRSxTQUFTLE1BQU0sTUFBTSwyQ0FBMkMsb0NBQW9DLFlBQVksaUJBQWlCLCtDQUErQyx1QkFBdUIsT0FBTyxpQkFBaUIsNkRBQTZELG9HQUFvRyxTQUFTLE1BQU0sZUFBZSxrRUFBa0UsNkNBQTZDLEtBQUssaUJBQWlCLDhFQUE4RSxpQkFBaUIsWUFBWSxXQUFXLEtBQUssV0FBVywrR0FBK0csbUJBQW1CLHlDQUF5QyxtQkFBbUIseUNBQXlDLGtEQUFrRCxXQUFXLHVDQUF1QyxTQUFTLGtDQUFrQyxrQkFBa0IsYUFBYSxXQUFXLDRRQUE0USxNQUFNLFNBQVMsd0JBQXdCLGNBQWMsbUJBQW1CLG9UQUFvVCxlQUFlLHdDQUF3QyxrQ0FBa0MsR0FBRyxXQUFXLDhCQUE4QixlQUFlLDRHQUE0RywwQ0FBMEMsYUFBYSxxQ0FBcUMsYUFBYSxNQUFNLDRCQUE0Qiw0REFBNEQsbUNBQW1DLHFDQUFxQyxJQUFJLGdGQUFnRixPQUFPLFNBQVMsVUFBVSxjQUFjLGNBQWMsTUFBTSwyQkFBMkIsbUNBQW1DLCtCQUErQixrQkFBa0IsRUFBRSxhQUFhLDBDQUEwQyxjQUFjLCtCQUErQixtQkFBbUIsRUFBRSw0QkFBNEIsOEVBQThFLDRCQUE0QixRQUFRLEVBQUUsNkJBQTZCLDJJQUEySSxrQkFBa0IsR0FBRyxLQUFLLGtCQUFrQixjQUFjLHVDQUF1Qyx3QkFBd0IsV0FBVyxHQUFHLEVBQUUsK0JBQStCLFlBQVksMkJBQTJCLEtBQUssa0NBQWtDLGtDQUFrQyxFQUFFLDZCQUE2QiwyQ0FBMkMsRUFBRSwwQ0FBMEMsb0VBQW9FLEVBQUUsb0NBQW9DLG1DQUFtQyx5Q0FBeUMsb0hBQW9ILHdFQUF3RSw2QkFBNkIsSUFBSSxFQUFFLElBQUksS0FBSyw4QkFBOEIsd0JBQXdCLDhCQUE4Qix3QkFBd0IsRUFBRSwwQ0FBMEMsd0JBQXdCLEVBQUUsYUFBYSxFQUFFLHNDQUFzQyxxQ0FBcUMscUJBQXFCLG9CQUFvQixNQUFNLHNCQUFzQixnQkFBZ0IsbUlBQW1JLG9DQUFvQyxHQUFHLEVBQUUsdUNBQXVDLHVFQUF1RSxtSkFBbUosb0NBQW9DLEdBQUcsRUFBRSxvQ0FBb0MsWUFBWSx3QkFBd0IsMENBQTBDLFVBQVUsRUFBRSxzQ0FBc0MsMEJBQTBCLDZDQUE2QyxFQUFFLDJCQUEyQixzQ0FBc0MsS0FBSyxHQUFHLGlCQUFpQixtTUFBbU0sZUFBZSxnQ0FBZ0MsWUFBWSxVQUFVLHVDQUF1QyxTQUFTLG9CQUFvQix5Q0FBeUMsY0FBYywwRkFBMEYsWUFBWSxVQUFVLHVDQUF1QyxTQUFTLDRDQUE0QyxVQUFVLHVDQUF1QyxTQUFTLDRDQUE0QyxVQUFVLGlCQUFpQixtQkFBbUIsNkJBQTZCLG1CQUFtQiw2REFBNkQsNEJBQTRCLElBQUksaUNBQWlDLDJEQUEyRCxPQUFPLFNBQVMsU0FBUyxRQUFRLElBQUksOEJBQThCLFFBQVEsY0FBYyxVQUFVLHFCQUFxQixNQUFNLHFDQUFxQyxvREFBb0QsaUxBQWlMLGtCQUFrQixpS0FBaUssR0FBRyxpQkFBaUIsb0NBQW9DLHVCQUF1QixJQUFJLGNBQWMsU0FBUyx1Q0FBdUMsU0FBUywyQ0FBMkMsMkZBQTJGLDRCQUE0QixzQkFBc0IsbUJBQW1CLDJDQUEyQyx3Q0FBd0MsNEJBQTRCLFFBQVEsTUFBTSw2QkFBNkIsS0FBSyxXQUFXLEtBQUsscUZBQXFGLHNHQUFzRyxVQUFVLG1DQUFtQyxVQUFVLHVDQUF1QyxTQUFTLHlDQUF5Qyw2QkFBNkIsbUJBQW1CLHVDQUF1Qyw2QkFBNkIsbUJBQW1CLG1DQUFtQyw2QkFBNkIsbUJBQW1CLEVBQUUsVUFBVSx1Q0FBdUMsU0FBUyxvQkFBb0IsUUFBUSxrQ0FBa0MsdUJBQXVCLHVDQUF1Qyx3Q0FBd0MsY0FBYyxVQUFVLGlCQUFpQixxQkFBcUIsaUNBQWlDLHNDQUFzQyw0QkFBNEIsdURBQXVELHNCQUFzQixTQUFTLGVBQWUsWUFBWSxtQkFBbUIsS0FBSyx5Q0FBeUMsMENBQTBDLGFBQWEsc0lBQXNJLGdFQUFnRSxHQUFHLFNBQVMsbUJBQW1CLHlDQUF5QyxrREFBa0QsV0FBVyx1Q0FBdUMsU0FBUyxtQ0FBbUMsUUFBUSxrQkFBa0IsMkdBQTJHLG1FQUFtRSxnQ0FBZ0MsNkJBQTZCLHFCQUFxQiw2SEFBNkgsNEZBQTRGLEtBQUssb0NBQW9DLGtCQUFrQix5Q0FBeUMsb0NBQW9DLDhGQUE4RixNQUFNLGlCQUFpQixvREFBb0QseUJBQXlCLDREQUE0RCxzQkFBc0IsSUFBSSxnQ0FBZ0Msb0JBQW9CLEVBQUUsdUNBQXVDLE1BQU0sRUFBRSxnRUFBZ0UsYUFBYSw0R0FBNEcsV0FBVyx5REFBeUQsbUJBQW1CLGlDQUFpQywwQ0FBMEMscUJBQXFCLHlEQUF5RCxNQUFNLGdCQUFnQix1QkFBdUIsS0FBSyxpQkFBaUIsdUJBQXVCLGtCQUFrQiw2Q0FBNkMsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLG9CQUFvQixvQkFBb0IsZ0JBQWdCLFVBQVUsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLHNDQUFzQyw2QkFBNkIsbUJBQW1CLEVBQUUsVUFBVSxtQkFBbUIsaUlBQWlJLHVDQUF1QyxTQUFTLHlEQUF5RCxRQUFRLGtCQUFrQixtSEFBbUgsOEJBQThCLGFBQWEsRUFBRSxTQUFTLDRCQUE0QixNQUFNLHVEQUF1RCx3REFBd0Qsd0lBQXdJLFdBQVcsaUJBQWlCLHdGQUF3RixNQUFNLHNCQUFzQixxSEFBcUgsV0FBVyxzRUFBc0UsZUFBZSwwQ0FBMEMsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLHFDQUFxQyxRQUFRLHdDQUF3QyxLQUFLLHlDQUF5QyxpQkFBaUIsOENBQThDLFdBQVcsS0FBSyxXQUFXLG9CQUFvQixTQUFTLFFBQVEsd0NBQXdDLDREQUE0RCxNQUFNLGdFQUFnRSxnQkFBZ0IsTUFBTSxRQUFRLFdBQVcscUVBQXFFLGlCQUFpQiwwRUFBMEUsTUFBTSxzQkFBc0IsZ0RBQWdELDhDQUE4QywrUkFBK1IsV0FBVywwREFBMEQsb0JBQW9CLCtDQUErQyxjQUFjLFVBQVUsdUNBQXVDLFNBQVMsb0NBQW9DLHNCQUFzQixrQkFBa0IsT0FBTywrQkFBK0Isc0JBQXNCLDJCQUEyQix5REFBeUQsbUJBQW1CLDhDQUE4QyxjQUFjLFVBQVUsdUNBQXVDLFNBQVMsb0NBQW9DLFFBQVEsdUJBQXVCLEtBQUsscUJBQXFCLEtBQUssa0JBQWtCLGlDQUFpQyxpQkFBaUIsNkRBQTZELE1BQU0sb0lBQW9JLFdBQVcsd0NBQXdDLGlEQUFpRCwyQkFBMkIsMFhBQTBYLFdBQVcsMENBQTBDLG1CQUFtQiw4Q0FBOEMsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLHNDQUFzQyw2QkFBNkIsbUJBQW1CLEVBQUUsVUFBVSx1Q0FBdUMsU0FBUyw0QkFBNEIsUUFBUSxrQkFBa0IsbUlBQW1JLDRCQUE0QiwrSUFBK0ksS0FBSyxTQUFTLCtCQUErQixpREFBaUQsS0FBSyw4Q0FBOEMsdUJBQXVCLFFBQVEsa0JBQWtCLHVCQUF1Qiw4Q0FBOEMsT0FBTywyRUFBMkUsS0FBSyx1Q0FBdUMsRUFBRSxpQkFBaUIsNklBQTZJLFNBQVMsd0NBQXdDLFlBQVksV0FBVyw4REFBOEQsSUFBSSxLQUFLLHFCQUFxQixxREFBcUQsa0pBQWtKLEVBQUUsV0FBVyxpREFBaUQsU0FBUyxLQUFLLFdBQVcsS0FBSyxxRUFBcUUsME9BQTBPLGdFQUFnRSxXQUFXLCtHQUErRyxXQUFXLHNDQUFzQyxjQUFjLFVBQVUsaUJBQWlCLG9DQUFvQyx1QkFBdUIsSUFBSSxjQUFjLFNBQVMsdUNBQXVDLFNBQVMsZ0NBQWdDLFFBQVEsa0JBQWtCLG9DQUFvQyxrQkFBa0IsU0FBUyxTQUFTLDhCQUE4Qix5QkFBeUIsa0NBQWtDLFFBQVEsZ0JBQWdCLG9IQUFvSCxpQkFBaUIsd0VBQXdFLDJCQUEyQiwwQkFBMEIseUJBQXlCLFlBQVkseUJBQXlCLEtBQUssa0NBQWtDLHVDQUF1QyxZQUFZLHdCQUF3QixLQUFLLDJDQUEyQyw2QkFBNkIsbUJBQW1CLDZEQUE2RCw0QkFBNEIsSUFBSSxpQ0FBaUMsMkRBQTJELE9BQU8sU0FBUyxTQUFTLFFBQVEsSUFBSSw4QkFBOEIsUUFBUSxjQUFjLFVBQVUscUJBQXFCLE1BQU0scUNBQXFDLG9EQUFvRCxpTEFBaUwsa0JBQWtCLGlLQUFpSyxrQkFBa0IsbUJBQW1CLGtCQUFrQixPQUFPLDJCQUEyQixxQkFBcUIscUJBQXFCLFdBQVcsMkRBQTJELGVBQWUsMENBQTBDLGNBQWMsVUFBVSx1Q0FBdUMsU0FBUyxpQ0FBaUMsUUFBUSxrQkFBa0IsY0FBYywrSEFBK0gsa0ZBQWtGLGdDQUFnQyxTQUFTLEdBQUcsZ0JBQWdCLDJDQUEyQyxjQUFjLFVBQVUsdUNBQXVDLFNBQVMsc0NBQXNDLDZCQUE2QixtQkFBbUIsRUFBRSxVQUFVLHVDQUF1QyxTQUFTLHNDQUFzQyw2QkFBNkIsbUJBQW1CLEVBQUUsVUFBVSx1Q0FBdUMsU0FBUyxvQkFBb0IsUUFBUSw0UEFBNFAsY0FBYyxVQUFVLHVDQUF1QyxTQUFTLG9CQUFvQixRQUFRLG1DQUFtQyx1QkFBdUIsZ0dBQWdHLCtDQUErQywwQ0FBMEMsY0FBYyxVQUFVLGVBQWUsa0ZBQWtGLGdCQUFnQixhQUFhLG9HQUFvRyxLQUFLLGlCQUFpQixZQUFZLFdBQVcsS0FBSyxXQUFXLCtHQUErRyxpQkFBaUIsK0NBQStDLHVCQUF1QixPQUFPLGlCQUFpQix5REFBeUQsZUFBZSxvR0FBb0csU0FBUyxlQUFlLGtFQUFrRSw2Q0FBNkMsS0FBSyxtQkFBbUIseUNBQXlDLGtEQUFrRCxXQUFXLHVDQUF1QyxTQUFTLG9DQUFvQyxtQkFBbUIsZUFBZSw0R0FBNEcsMENBQTBDLGFBQWEscUNBQXFDLGFBQWEsTUFBTSxnQ0FBZ0MsNERBQTRELG1DQUFtQyxxQ0FBcUMsSUFBSSxnRkFBZ0YsT0FBTyxTQUFTLFVBQVUsY0FBYyxjQUFjLE1BQU0sMkJBQTJCLG1DQUFtQywrQkFBK0Isa0JBQWtCLEVBQUUsd0JBQXdCLE1BQU0saUJBQWlCLDhFQUE4RSwrZ0JBQStnQiwyQkFBMkIsd0NBQXdDLDRCQUE0Qix5RkFBeUYsa0RBQWtELFNBQVMsZ0JBQWdCLHdDQUF3QyxnQkFBZ0IseUVBQXlFLEVBQUUsbUNBQW1DLGdCQUFnQix5RUFBeUUsRUFBRSxzQ0FBc0MscUNBQXFDLHdCQUF3QixjQUFjLDhCQUE4QixVQUFVLHVDQUF1QyxTQUFTLG9CQUFvQixRQUFRLG1HQUFtRyxpSEFBaUgsWUFBWSwrQkFBK0Isb0JBQW9CLDJCQUEyQiwyQ0FBMkMsNkJBQTZCLHFCQUFxQiwwQkFBMEIsRUFBRSxtQ0FBbUMsMERBQTBELDhFQUE4RSwwREFBMEQsS0FBSyxtQ0FBbUMsZUFBZSxzSEFBc0gsc0ZBQXNGLEtBQUssV0FBVyxLQUFLLFdBQVcsbURBQW1ELHFCQUFxQixrQkFBa0IsbUJBQW1CLEtBQUssa0RBQWtELFdBQVcsOENBQThDLElBQUksMERBQTBELElBQUksTUFBTSxjQUFjLGlDQUFpQyw0QkFBNEIsMERBQTBELHVCQUF1Qix5REFBeUQsSUFBSSxNQUFNLHFDQUFxQyxlQUFlLHVFQUF1RSx3REFBd0QsU0FBUyxRQUFRLDhEQUE4RCxpQkFBaUIsK0lBQStJLDRCQUE0QixlQUFlLEVBQUUsV0FBVyw4RUFBOEUsS0FBSyxXQUFXLEtBQUssV0FBVyx3QkFBd0IsaUJBQWlCLHdDQUF3QyxrTkFBa04sOENBQThDLG1CQUFtQiwrREFBK0QsTUFBTSxrQ0FBa0MsU0FBUyxpQkFBaUIsMEdBQTBHLGlFQUFpRSwwQkFBMEIsaUZBQWlGLEtBQUssV0FBVyxLQUFLLFdBQVcsbURBQW1ELDJEQUEyRCxNQUFNLDJGQUEyRixjQUFjLGVBQWUsMERBQTBELHVEQUF1RCxVQUFVLGNBQWMsVUFBVSxlQUFlLG9CQUFvQixzRkFBc0YsdUNBQXVDLFNBQVMsb0JBQW9CLFFBQVEsbURBQW1ELHdCQUF3QixzQkFBc0IsMEZBQTBGLGlFQUFpRSwwQ0FBMEMsR0FBRyxnQ0FBZ0MscUJBQXFCLDBDQUEwQyxxQ0FBcUMsaUVBQWlFLDhCQUE4QixnREFBZ0QsbURBQW1ELHNCQUFzQiwwREFBMEQsSUFBSSxRQUFRLEdBQUcsY0FBYyxVQUFVLGVBQWUsZ0RBQWdELHVDQUF1QyxTQUFTLG9CQUFvQixRQUFRLDREQUE0RCxxQkFBcUIsNkJBQTZCLG9DQUFvQyw0Q0FBNEMsdUJBQXVCLCtDQUErQyxZQUFZLDhDQUE4QyxrREFBa0QsNENBQTRDLDJCQUEyQixpRUFBaUUsMEJBQTBCLGdCQUFnQixFQUFFLEdBQUcsZ0NBQWdDLHFCQUFxQiw2QkFBNkIscUJBQXFCLGtDQUFrQyxpQ0FBaUMsMkdBQTJHLEtBQUssY0FBYyxVQUFVLHVDQUF1QyxTQUFTLG9CQUFvQixRQUFRLHdDQUF3QyxrRUFBa0UsY0FBYyxVQUFVLGVBQWUscUJBQXFCLDBEQUEwRCx1QkFBdUIsMElBQTBJLDBCQUEwQixvQkFBb0IsOENBQThDLG9GQUFvRixZQUFZLHlEQUF5RCxtQkFBbUIsSUFBSSxLQUFLLDZCQUE2QixNQUFNLFlBQVksU0FBUyxZQUFZLG1CQUFtQixzQkFBc0Isc0JBQXNCLDBCQUEwQixxQkFBcUIsS0FBSyw4REFBOEQsbUpBQW1KLDhDQUE4QyxtQkFBbUIsVUFBVSxrSUFBa0ksWUFBWSxhQUFhLEtBQUssMEJBQTBCLEtBQUssb0NBQW9DLFNBQVMsR0FBRyxZQUFZLHVDQUF1QyxTQUFTLGtDQUFrQyxRQUFRLGtDQUFrQyxrQ0FBa0Msb0JBQW9CLG9HQUFvRyxjQUFjLFFBQVEsWUFBWSxlQUFlLGtGQUFrRixnQkFBZ0IsYUFBYSxvR0FBb0csS0FBSywrQ0FBK0MsU0FBUywrUUFBK1Esa0JBQWtCLG1EQUFtRCxzQkFBc0IsVUFBVSw0Q0FBNEMsUUFBUSxZQUFZLGVBQWUsa0ZBQWtGLGdCQUFnQixhQUFhLG9HQUFvRyxLQUFLLCtDQUErQyxTQUFTLDRCQUE0QixrQkFBa0IsbURBQW1ELHNCQUFzQixVQUFVLGdEQUFnRDtBQUNqOTdIOzs7Ozs7Ozs7Ozs7OztBQ0ZBLCtFQUFpRTtBQUdqRSxNQUFxQixrQkFBa0I7SUFJckMsWUFBYSxTQUFpQjtRQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUN4QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSTtJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsV0FBVyxDQUNULFNBQWtCLEVBQ2xCLFdBQXdCLEVBQ3hCLFFBQXlCLEVBQ3pCLHFCQUE4QixLQUFLLEVBQ25DLG1CQUE0QixJQUFJO1FBRWhDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDekMsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdkUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2dCQUNyRCxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDbEU7WUFDRCxPQUFNO1NBQ1A7UUFDRCwrQ0FBK0M7UUFDL0MsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLENBQVM7WUFDdkIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssU0FBUyxDQUFDLEVBQUU7UUFDM0MsQ0FBQyxDQUFDO1FBRUYsNENBQTRDO1FBQzVDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxNQUFNLElBQUksS0FBSyxDQUNiOzsyRUFFbUUsQ0FDcEU7U0FDRjtRQUVELHFEQUFxRDtRQUNyRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksZ0JBQWdCLEVBQUU7WUFDakUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUU7WUFDeEMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzthQUFFO1NBQ3ZGO1FBRUQsNkVBQTZFO1FBQzdFLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNwRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ3BCLFFBQVEsQ0FBQyxNQUFNLENBQUM7U0FDakI7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHFCQUFxQixDQUFFLGNBQXVCO1FBQzVDLE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxzQkFBc0IsQ0FDekQsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUNqQyxDQUFDLENBQUMsQ0FBZ0I7UUFDbkIsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLGFBQWE7UUFFMUMsSUFBSSw2QkFBZ0IsRUFBQyxhQUFhLENBQUMsRUFBRTtZQUNuQyxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDcEQsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQy9ELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDO1NBQ3pEO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxvQkFBb0IsQ0FBRSxhQUFzQixFQUFFLE1BQWU7UUFDM0QsTUFBTSxVQUFVLEdBQUcsRUFBRTtRQUNyQixNQUFNLElBQUksR0FBRyxNQUFNO2FBQ2hCLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUM7YUFDckMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1FBRTNCLElBQUksYUFBYSxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQywwREFBMEQsQ0FBQztTQUM1RTtRQUNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUM1QztZQUNFLFlBQVk7WUFDWixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRTtZQUNoQztnQkFDRSxTQUFTLEVBQUUsY0FDVCxDQUFDLHlCQUFZLEVBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxVQUNuRCxLQUFLO2FBQ047U0FDRixFQUNEO1lBQ0UsaUJBQWlCO1lBQ2pCLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLENBQUM7U0FDZCxDQUNGO1FBRUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDO0lBQzVFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gscUJBQXFCLENBQUUsYUFBc0I7O1FBQzNDLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxzQkFBc0IsQ0FDeEQsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUNqQyxDQUFDLENBQUMsQ0FBQztRQUNKLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxhQUFhO1FBRTFDLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUN2RCxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDNUQsVUFBSSxDQUFDLGlCQUFpQiwwQ0FBRSxNQUFNLEVBQUU7SUFDbEMsQ0FBQztJQUVELGdCQUFnQjtRQUNkLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztJQUN2RCxDQUFDO0lBRUQsb0JBQW9CLENBQ2xCLEtBQXFCLEVBQ3JCLE1BQW1CLEVBQ25CLGFBQWlELEVBQ2pELGVBQXdCLEVBQ3hCLGdCQUF5QjtRQUV6QixJQUFJLENBQUMsZ0JBQWdCLEVBQUU7UUFFdkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQzFCLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQ2QsU0FBUyxFQUNULE1BQU0sRUFDTixhQUFhLEVBQ2IsZUFBZSxFQUNmLGdCQUFnQixDQUNqQixDQUNGO1lBQ0QsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUM7WUFDdkMsQ0FBQyxDQUFDO1lBQ0YsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUM7WUFDdkMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBbEtELHFDQWtLQzs7Ozs7Ozs7Ozs7Ozs7QUNyS0QsTUFBTSxLQUFLO0lBR1QsWUFBYSxJQUFZLEVBQUUsV0FBbUI7UUFDNUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJO1FBQ2hCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVztJQUNoQyxDQUFDO0NBQ0Y7QUFFRCxrQkFBZSxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNUcEIsZ0ZBQTJEO0FBQzNELHVGQUF1RDtBQUN2RCxxR0FBeUI7QUFDekIsK0lBQW1EO0FBRW5ELG1HQUF5QjtBQUV6QixNQUFNLE1BQU8sU0FBUSxjQUFJO0lBU3ZCLFlBQWEsRUFBVSxFQUFFLElBQVksRUFBRSxNQUFxQixFQUFFLGFBQXFCLEVBQUUsV0FBbUIsRUFBRSxNQUF5QjtRQUNqSSxLQUFLLEVBQUU7UUFDUCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUU7UUFDbEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTTtRQUNwQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWE7UUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsMEJBQWEsRUFBQyxNQUFNLENBQUM7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTO0lBQzVCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFFLEdBQVc7UUFDeEIsTUFBTSxFQUFFLEdBQUcsR0FBRyxlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsR0FBRyxFQUFFO1FBRWpELElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRTtRQUNoQixJQUFJLFNBQVMsR0FBRyxFQUFFO1FBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDNUIsU0FBUyxJQUFJLE1BQU0sR0FBRyxLQUFLLEdBQUcsT0FBTztRQUN2QyxDQUFDLENBQUM7UUFFRixNQUFNLElBQUksR0FBRztvQkFDRyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxTQUFTLElBQUksQ0FBQyxNQUFNOzBCQUNwRSxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPOzt1QkFFN0IsSUFBSSxDQUFDLFFBQVE7a0JBQ2xCLElBQUksQ0FBQyxJQUFJOztnQkFFWCxTQUFTOzs7d0JBR0QsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVTs4QkFDdkIsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZTs7OzsyQkFJckMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVM7Ozs7OztPQU1oRjtRQUNILE9BQU8scUJBQVEsRUFBQyxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxpQkFBaUIsQ0FBRSxHQUFXLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSztRQUN0RCxNQUFNLEVBQUUsR0FBRyxHQUFHLGVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxHQUFHLEVBQUU7UUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFO1FBQ2hCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDckUsTUFBTSxJQUFJLEdBQUc7MEJBQ1MsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUMvQyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUNyQixJQUFJLFdBQVc7NEJBQ1MsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUNqRCxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUNyQixLQUFLLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWE7aUNBQ1IsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUNsRCxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUNyQixJQUFJLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sU0FBUyxJQUFJLENBQUMsU0FBUyxFQUFFO2dDQUV0QyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUNyQjtnQ0FDYyxJQUFJLENBQUMsUUFBUTs7bUNBRVYsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUM1RCxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUNyQixLQUFLLElBQUksQ0FBQyxJQUFJOzs7K0JBR2EsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWTs7eUJBRXJDLElBQUksQ0FBQyxhQUFhOzs7OztXQUtoQztRQUNQLE9BQU8scUJBQVEsRUFBQyxJQUFJLENBQVM7SUFDL0IsQ0FBQztJQUVLLGFBQWE7O1lBQ2pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxRSxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU07WUFDbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSw0QkFBZ0IsRUFBUztZQUUvQyxrQ0FBc0IsRUFBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO1lBRTdDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUztZQUMxQixPQUFPLFNBQVM7UUFDbEIsQ0FBQztLQUFBO0lBRUQsa0JBQWtCO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTO0lBQ3JDLENBQUM7Q0FDRjtBQUVELFNBQWdCLHVCQUF1QixDQUFFLEtBQXdCLEVBQUUsU0FBd0I7SUFDekYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQWdCLEVBQUUsRUFBRTtRQUNqQyxTQUFTLENBQUMsSUFBSSxDQUNaLElBQUksTUFBTSxDQUNSLElBQUksQ0FBQyxFQUFFLEVBQ1AsSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FDWixDQUNGO0lBQ0gsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxTQUFTO0FBQ2xCLENBQUM7QUFkRCwwREFjQztBQUVELGtCQUFlLE1BQU07Ozs7Ozs7Ozs7Ozs7O0FDMUlyQixNQUFNLElBQUk7SUFFUjtRQUNFLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRTtJQUNsQixDQUFDO0lBRUQsU0FBUztRQUNQLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQztTQUNsRTthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTTtTQUNuQjtJQUNILENBQUM7Q0FDRjtBQUVELGtCQUFlLElBQUk7Ozs7Ozs7Ozs7Ozs7QUNmbkIsZ0VBQWdFOzs7QUFFaEU7OztHQUdHO0FBQ0gsTUFBYSxvQkFBb0I7SUFLL0I7OztPQUdHO0lBQ0gsWUFBYSxJQUFPO1FBQ2xCOzs7O1dBSUc7UUFDSCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUk7UUFFaEI7Ozs7V0FJRztRQUNILElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSTtRQUVoQjs7OztXQUlHO1FBQ0gsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJO0lBQ3RCLENBQUM7Q0FDRjtBQS9CRCxvREErQkM7QUFDRDs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQjtJQUdwQjs7T0FFRztJQUNIO1FBQ0Usb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSTtRQUVoQix3REFBd0Q7UUFDeEQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJO0lBQ2xCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsR0FBRyxDQUFFLElBQU87UUFDVjs7O1dBR0c7UUFDSCxNQUFNLE9BQU8sR0FBRyxJQUFJLG9CQUFvQixDQUFJLElBQUksQ0FBQztRQUVqRCx5Q0FBeUM7UUFDekMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtZQUN0Qjs7O2VBR0c7WUFDSCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU87U0FDcEI7YUFBTTtZQUNMOzs7Ozs7ZUFNRztZQUNILElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU87YUFDekI7WUFDRCxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJO1NBQzdCO1FBRUQ7OztXQUdHO1FBQ0gsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPO0lBQ3JCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsWUFBWSxDQUFFLElBQU8sRUFBRSxLQUFhO1FBQ2xDOzs7V0FHRztRQUNILE1BQU0sT0FBTyxHQUFHLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDO1FBRTlDLHlDQUF5QztRQUN6QyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxVQUFVLENBQUMsU0FBUyxLQUFLLDhCQUE4QixDQUFDO1NBQ25FO1FBRUQ7OztXQUdHO1FBQ0gsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1lBQ2Y7OztlQUdHO1lBQ0gsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtZQUV4Qjs7O2VBR0c7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPO1lBRTVCOzs7ZUFHRztZQUNILElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztTQUNwQjthQUFNO1lBQ0w7Ozs7ZUFJRztZQUNILElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJO1lBRXZCOzs7O2VBSUc7WUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBRVQ7Ozs7O2VBS0c7WUFDSCxPQUFPLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUU7Z0JBQ3pDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSTtnQkFDdEIsQ0FBQyxFQUFFO2FBQ0o7WUFFRDs7Ozs7ZUFLRztZQUNILElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRTtnQkFDYixNQUFNLElBQUksVUFBVSxDQUFDLFNBQVMsS0FBSyw4QkFBOEIsQ0FBQzthQUNuRTtZQUVEOzs7Ozs7ZUFNRztZQUNILE9BQVEsQ0FBQyxRQUFTLENBQUMsSUFBSSxHQUFHLE9BQU87WUFDakMsT0FBUSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUTtZQUVwQzs7O2VBR0c7WUFDSCxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU87WUFDdEIsT0FBTyxDQUFDLFFBQVEsR0FBRyxPQUFPO1NBQzNCO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxXQUFXLENBQUUsSUFBTyxFQUFFLEtBQWE7UUFDakM7OztXQUdHO1FBQ0gsTUFBTSxPQUFPLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7UUFFOUMseUNBQXlDO1FBQ3pDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDdEIsTUFBTSxJQUFJLFVBQVUsQ0FBQyxTQUFTLEtBQUssOEJBQThCLENBQUM7U0FDbkU7UUFFRDs7OztXQUlHO1FBQ0gsSUFBSSxPQUFPLEdBQW1DLElBQUksQ0FBQyxJQUFJO1FBRXZEOzs7O1dBSUc7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDO1FBRVQ7Ozs7OztXQU1HO1FBQ0gsT0FBTyxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUU7WUFDcEMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJO1lBQ3RCLENBQUMsRUFBRTtTQUNKO1FBRUQ7Ozs7O1dBS0c7UUFDSCxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUU7WUFDYixNQUFNLElBQUksVUFBVSxDQUFDLFNBQVMsS0FBSyw4QkFBOEIsQ0FBQztTQUNuRTtRQUVEOzs7V0FHRztRQUVILDREQUE0RDtRQUM1RCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztTQUNwQjthQUFNO1lBQ0w7OztlQUdHO1lBQ0gsT0FBUSxDQUFDLElBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTztZQUNqQyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQVEsQ0FBQyxJQUFJO1NBQzdCO1FBRUQ7OztXQUdHO1FBQ0gsT0FBTyxDQUFDLFFBQVEsR0FBRyxPQUFPO1FBQzFCLE9BQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTztJQUN6QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsR0FBRyxDQUFFLEtBQWEsRUFBRSxNQUFNLEdBQUcsS0FBSztRQUNoQyxxQ0FBcUM7UUFDckMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDZDs7OztlQUlHO1lBQ0gsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUk7WUFFdkI7Ozs7ZUFJRztZQUNILElBQUksQ0FBQyxHQUFHLENBQUM7WUFFVDs7Ozs7ZUFLRztZQUNILE9BQU8sT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFO2dCQUNwQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUk7Z0JBQ3RCLENBQUMsRUFBRTthQUNKO1lBRUQ7Ozs7O2VBS0c7WUFDSCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0JBQ3BCLElBQUksTUFBTSxFQUFFO29CQUNWLE9BQU8sT0FBTztpQkFDZjtxQkFBTTtvQkFDTCxPQUFPLE9BQU8sQ0FBQyxJQUFJO2lCQUNwQjthQUNGO2lCQUFNO2dCQUNMLE1BQU0sSUFBSSxVQUFVLENBQUMsU0FBUyxLQUFLLGVBQWUsQ0FBQzthQUNwRDtTQUNGO2FBQU07WUFDTCxNQUFNLElBQUksVUFBVSxDQUFDLFNBQVMsS0FBSyxlQUFlLENBQUM7U0FDcEQ7SUFDSCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxPQUFPLENBQUUsSUFBTztRQUNkOzs7O1dBSUc7UUFDSCxJQUFJLE9BQU8sR0FBbUMsSUFBSSxDQUFDLElBQUk7UUFFdkQ7Ozs7V0FJRztRQUNILElBQUksS0FBSyxHQUFHLENBQUM7UUFFYjs7Ozs7V0FLRztRQUNILE9BQU8sT0FBTyxLQUFLLElBQUksRUFBRTtZQUN2QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUN6QixPQUFPLEtBQUs7YUFDYjtZQUVELHdDQUF3QztZQUN4QyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUk7WUFFdEIsNkJBQTZCO1lBQzdCLEtBQUssRUFBRTtTQUNSO1FBRUQ7OztXQUdHO1FBQ0gsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsSUFBSSxDQUFFLE9BQXVCO1FBQzNCOzs7O1dBSUc7UUFDSCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSTtRQUV2Qjs7Ozs7V0FLRztRQUNILE9BQU8sT0FBTyxLQUFLLElBQUksRUFBRTtZQUN2QixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sT0FBTyxDQUFDLElBQUk7YUFDcEI7WUFFRCx3Q0FBd0M7WUFDeEMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJO1NBQ3ZCO1FBRUQ7Ozs7V0FJRztRQUNILE1BQU0sSUFBSSxVQUFVLENBQUMsd0JBQXdCLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQVMsQ0FBRSxPQUE2QjtRQUN0Qzs7OztXQUlHO1FBQ0gsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUk7UUFFdkI7Ozs7V0FJRztRQUNILElBQUksS0FBSyxHQUFHLENBQUM7UUFFYjs7Ozs7V0FLRztRQUNILE9BQU8sT0FBTyxLQUFLLElBQUksRUFBRTtZQUN2QixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sS0FBSzthQUNiO1lBRUQsd0NBQXdDO1lBQ3hDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSTtZQUV0Qiw2QkFBNkI7WUFDN0IsS0FBSyxFQUFFO1NBQ1I7UUFFRDs7OztXQUlHO1FBQ0gsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUUsS0FBYTtRQUNuQiw2REFBNkQ7UUFDN0QsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLE1BQU0sSUFBSSxVQUFVLENBQUMsU0FBUyxLQUFLLDhCQUE4QixDQUFDO1NBQ25FO1FBRUQsd0NBQXdDO1FBQ3hDLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtZQUNmLHVDQUF1QztZQUN2QyxNQUFNLElBQUksR0FBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7WUFFOUIsdURBQXVEO1lBQ3ZELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO1lBRTFCLG1FQUFtRTtZQUNuRSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUk7YUFDakI7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSTthQUMxQjtZQUVELG1EQUFtRDtZQUNuRCxPQUFPLElBQUk7U0FDWjtRQUVEOzs7O1dBSUc7UUFDSCxJQUFJLE9BQU8sR0FBbUMsSUFBSSxDQUFDLElBQUk7UUFFdkQ7Ozs7V0FJRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUM7UUFFVDs7Ozs7V0FLRztRQUNILE9BQU8sT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFO1lBQ3BDLDRCQUE0QjtZQUM1QixPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUk7WUFFdEIsc0JBQXNCO1lBQ3RCLENBQUMsRUFBRTtTQUNKO1FBRUQ7OztXQUdHO1FBQ0gsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3BCLCtCQUErQjtZQUMvQixPQUFRLENBQUMsUUFBUyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSTtZQUV0Qzs7Ozs7ZUFLRztZQUNILElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVE7YUFDN0I7aUJBQU07Z0JBQ0wsT0FBUSxDQUFDLElBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVE7YUFDM0M7WUFFRCx1REFBdUQ7WUFDdkQsT0FBTyxPQUFPLENBQUMsSUFBSTtTQUNwQjtRQUVEOzs7V0FHRztRQUNILE1BQU0sSUFBSSxVQUFVLENBQUMsU0FBUyxLQUFLLDhCQUE4QixDQUFDO0lBQ3BFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLO1FBQ0gsb0RBQW9EO1FBQ3BELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSTtRQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUk7SUFDbEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILElBQUksSUFBSTtRQUNOLGtDQUFrQztRQUNsQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3RCLE9BQU8sQ0FBQztTQUNUO1FBRUQ7Ozs7V0FJRztRQUNILElBQUksT0FBTyxHQUFtQyxJQUFJLENBQUMsSUFBSTtRQUV2RDs7OztXQUlHO1FBQ0gsSUFBSSxLQUFLLEdBQUcsQ0FBQztRQUViOzs7V0FHRztRQUNILE9BQU8sT0FBTyxLQUFLLElBQUksRUFBRTtZQUN2QixLQUFLLEVBQUU7WUFDUCxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUk7U0FDdkI7UUFFRDs7O1dBR0c7UUFDSCxPQUFPLEtBQUs7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2YsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFO0lBQ3RCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxDQUFFLE1BQU07UUFDTjs7OztXQUlHO1FBQ0gsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUk7UUFFdkI7OztXQUdHO1FBQ0gsT0FBTyxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sT0FBTyxDQUFDLElBQUk7WUFDbEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJO1NBQ3ZCO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILENBQUUsT0FBTztRQUNQOzs7O1dBSUc7UUFDSCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSTtRQUV2Qjs7O1dBR0c7UUFDSCxPQUFPLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFDdkIsTUFBTSxPQUFPLENBQUMsSUFBSTtZQUNsQixPQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVE7U0FDM0I7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUTtRQUNOLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUM3QixDQUFDO0NBQ0Y7QUFFRCxrQkFBZSxnQkFBZ0I7QUFDL0IsU0FDQSx1QkFBdUIsQ0FBTSxHQUFhO0lBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUksZ0JBQWdCLEVBQUs7SUFDdEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztJQUVGLE9BQU8sSUFBSTtBQUNiLENBQUM7QUFSRCwwREFRQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL3BCRCxnRkFPa0I7QUFFbEIsMEtBQWtFO0FBQ2xFLG1HQUE0QztBQUM1QyxxSUFBaUQ7QUFHakQsTUFBTSxlQUFlO0lBcUJuQjtRQUNFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSTtRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUU7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRztZQUNoQixPQUFPLEVBQUUsSUFBSTtZQUNiLFNBQVMsRUFBRSxFQUFFO1lBQ2IsYUFBYSxFQUFFLElBQUk7U0FDcEI7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSTtRQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHO1lBQ2xCLEtBQUssRUFBRSxJQUFJO1lBQ1gsUUFBUSxFQUFFLElBQUk7WUFDZCxRQUFRLEVBQUUsSUFBSTtZQUNkLFFBQVEsRUFBRSxJQUFJO1NBQ2Y7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUs7UUFDMUIsSUFBSSxDQUFDLGNBQWMsRUFBRTtJQUN2QixDQUFDO0lBRWEsY0FBYzs7WUFDMUIsMkJBQWMsRUFBK0IsZUFBSyxDQUFDLE9BQU8sQ0FBZ0IsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxlQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDckksdUdBQXVHO2dCQUN2RyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO2dCQUM3QixNQUFNLFVBQVUsR0FBRyxHQUFHO2dCQUN0QixJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssVUFBVSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO29CQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDO2lCQUMvQztxQkFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7b0JBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUM7b0JBQ25DLG1KQUFtSjtvQkFDbkosb1BBQW9QO29CQUNwUCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7d0JBQ3RDLElBQUksRUFBRSx5QkFBeUI7d0JBQy9CLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFOzRCQUNwQiw2QkFBNkI7NEJBQzdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUNkLENBQUM7d0JBQ0QsTUFBTSxFQUFFLEdBQUc7cUJBQ1osQ0FBQztvQkFDRixJQUFJLENBQUMsYUFBYSxFQUFFO29CQUNwQix5QkFBeUI7b0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2lCQUN0QjtxQkFBTTtvQkFDTCw4QkFBOEI7b0JBQzlCLE1BQU0sQ0FBQyw0QkFBNEIsR0FBRyxHQUFHLEVBQUU7d0JBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUM7d0JBQ3BDLHNGQUFzRjt3QkFDdEYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDOzRCQUN0QyxJQUFJLEVBQUUseUJBQXlCOzRCQUMvQixhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQ0FDcEIsNkJBQTZCO2dDQUM3QixFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQzs0QkFDZCxDQUFDOzRCQUNELE1BQU0sRUFBRSxHQUFHO3lCQUNaLENBQUM7d0JBQ0YsSUFBSSxDQUFDLGFBQWEsRUFBRTt3QkFDcEIseUJBQXlCO3dCQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtvQkFDdkIsQ0FBQztpQkFDRjtZQUNILENBQUMsQ0FBQztRQUNKLENBQUM7S0FBQTtJQUVPLGFBQWE7UUFDbkIsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxPQUFPLEVBQXdCLEVBQUUsRUFBRTtZQUNwRixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUF3QixFQUFFLEVBQUU7WUFDcEYsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7WUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQztRQUN2QyxDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBd0IsRUFBRSxFQUFFO1lBQzdFLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxPQUFPLEVBQXdCLEVBQUUsRUFBRTtZQUM5RSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDLENBQUM7UUFFRiwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxLQUFtQyxFQUFFLEVBQUUsR0FBRSxDQUFDLENBQUM7UUFFNUYsUUFBUTtRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUF5QixFQUFFLEVBQUU7WUFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLENBQUM7WUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTO1lBQzFCLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUk7UUFDM0IsQ0FBQyxDQUFDO1FBRUYsWUFBWTtRQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUF5QixFQUFFLEVBQUU7WUFDNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxTQUFTLENBQUM7UUFDdEQsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELGVBQWU7O1FBQ2IsTUFBTSxXQUFXLEdBQUcsY0FBUSxDQUFDLGNBQWMsQ0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUNBQUksNEJBQWUsRUFBQyxtQ0FBbUMsQ0FBQztRQUM3SCxNQUFNLFdBQVcsR0FBRyxjQUFRLENBQUMsY0FBYyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxtQ0FBSSw0QkFBZSxFQUFDLHNDQUFzQyxDQUFDO1FBRWxJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLGlCQUFXLENBQUMsc0JBQXNCLENBQzdELGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FDNUIsQ0FBQyxDQUFDLENBQVksbUNBQUksNEJBQWUsRUFBQyx3Q0FBd0MsQ0FBQztRQUM1RSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxpQkFBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBWSxtQ0FBSSw0QkFBZSxFQUFDLHlDQUF5QyxDQUFDO1FBRTVJLDRCQUE0QjtRQUM1QixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxpQkFBVyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBWSxtQ0FBSSw0QkFBZSxFQUFDLGdEQUFnRCxDQUFDO1FBQ3JKLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLGlCQUFXLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFZLG1DQUFJLDRCQUFlLEVBQUMsaURBQWlELENBQUM7SUFDeEosQ0FBQztJQUVELG1CQUFtQjtRQUNqQixNQUFNLElBQUksR0FBRzttQkFDRSxlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTO21CQUN4QixlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZO21CQUMvQixlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXOzt3QkFFckIsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVzswQkFDNUIsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUTs7Ozs7S0FLaEQ7UUFFRCxNQUFNLFdBQVcsR0FBRyxxQkFBUSxFQUFDLElBQUksQ0FBQztRQUNsQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFtQixDQUFDO1FBQ3pDLElBQUksQ0FBQyxlQUFlLEVBQUU7SUFDeEIsQ0FBQztJQUVELGVBQWUsQ0FBRSxXQUFtQixFQUFFLFFBQWdCO1FBQ3BELElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtZQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQXdCLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLFdBQVcsR0FBRztZQUMzRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQzthQUNoRDtZQUNELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVc7Z0JBQ3BDLHNDQUF5QixFQUFDLFFBQVEsQ0FBQztTQUN0QztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILG1CQUFtQjtRQUNqQixJQUFJLGNBQWMsR0FBRyxFQUFFO1FBQ3ZCLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3pCLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7U0FDckM7UUFDRCw0REFBNEQ7UUFDNUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUF1QyxFQUFFLEVBQUU7Z0JBQzdFLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FDWCx3REFBd0QsQ0FDekQ7b0JBQ0QsT0FBTTtpQkFDUDtnQkFDRCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUs7Z0JBRXBDLHFEQUFxRDtnQkFDckQsSUFBSSxjQUFjLEtBQUssRUFBRSxFQUFFO29CQUN6QixjQUFjLEdBQUcsc0NBQXlCLEVBQUMsUUFBUSxDQUFDO29CQUNwRCxJQUFJLENBQUMsWUFBYSxDQUFDLFFBQVMsQ0FBQyxXQUFXLEdBQUcsY0FBYztpQkFDMUQ7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRztnQkFFL0MsdURBQXVEO2dCQUN2RCxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7b0JBQ2xCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO3dCQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLHFFQUFxRSxDQUFDO3FCQUN2RjtvQkFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztvQkFDckUsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBRXZFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBd0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU07b0JBQ2hFLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWtDLENBQUM7aUJBQ3ZEO3FCQUFNO29CQUNMLHdEQUF3RDtvQkFDeEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO2lCQUM1QztZQUNILENBQUMsQ0FBQztRQUNKLENBQUMsRUFBRSxJQUFJLENBQUM7SUFDVixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNHLGVBQWUsQ0FBRSxRQUEwQjs7WUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDO1lBQ2xDLGdEQUFnRDtZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQztnQkFDbEMsT0FBTTthQUNQO1lBQ0QsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUM7Z0JBQzVDLE9BQU07YUFDUDtZQUNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO1lBQzNCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO2dCQUNuQyxxREFBcUQ7Z0JBQ3JELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2dCQUVyRSxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2xCLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWtDLENBQUM7Z0JBQ3RELGlJQUFpSTtnQkFDakksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sS0FBSyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtvQkFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSTtvQkFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUs7b0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO29CQUMzQixPQUFNO2lCQUNQO2FBQ0Y7WUFFRCwyRUFBMkU7WUFDM0UsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRTtnQkFDM0QsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUNuQixRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssRUFDM0IsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQ3pCLEdBQVMsRUFBRSxnREFBQyxXQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQ2xELFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUMzQixRQUFRLENBQUMsWUFBWSxDQUN0QjtnQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUs7Z0JBQzlCLE9BQU07YUFDUDtZQUVELE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDbkIsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQzNCLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUN6QixHQUFTLEVBQUUsZ0RBQUMsV0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUNoRCxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssRUFDM0IsUUFBUSxDQUFDLFlBQVksQ0FDdEI7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztZQUMzQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSztRQUNoQyxDQUFDO0tBQUE7SUFFSyxVQUFVLENBQUUsS0FBYyxFQUFFLFNBQWlCLEVBQUUsZ0JBQTBCLEVBQUUsS0FBYSxFQUFFLFNBQTBDOztZQUN4SSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRyxTQUFTO1lBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHLEtBQUs7WUFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDbEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsU0FBUztZQUVyQyxJQUFJLENBQUMsWUFBYSxDQUFDLEtBQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSztZQUU3QyxNQUFNLGdCQUFnQixFQUFFO1lBRXhCLDZDQUE2QztZQUM3QyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7UUFDNUIsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNHLElBQUksQ0FBRSxTQUFpQjs7WUFDM0IsTUFBTSwyQkFBYyxFQUNsQixlQUFLLENBQUMsR0FBRyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDL0Q7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUNyQixDQUFDO0tBQUE7SUFFSyxNQUFNLENBQUUsU0FBaUI7O1lBQzdCLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDdkIsQ0FBQztLQUFBO0lBRUssS0FBSzs7WUFDVCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ3ZCLENBQUM7S0FBQTtDQUNGO0FBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFlLEVBQUU7QUFFN0MsSUFBSyxNQUFjLENBQUMsZUFBZSxLQUFLLFNBQVMsRUFBRTtJQUNqRCxzQ0FBc0M7SUFDckMsTUFBYyxDQUFDLGVBQWUsR0FBRyxJQUFJLG9CQUFlLEVBQUU7Q0FDeEQ7QUFDRCxNQUFNLGVBQWUsR0FBSSxNQUFjLENBQUMsZUFBa0M7QUFFMUUseUNBQXlDO0FBQ3pDLGVBQWUsQ0FBQyxTQUFTLENBQUMseUJBQWdCLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBMEIsRUFBRSxFQUFFLENBQzlFLGVBQWUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQzFDO0FBQ0QsMEJBQWEsR0FBRTtBQUVmLFNBQWdCLGdCQUFnQixDQUFFLEdBQVc7SUFDM0MsT0FBTyxDQUNMLEdBQUcsS0FBSyxlQUFlLENBQUMsVUFBVSxDQUFDLFNBQVM7UUFDMUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUM3QztBQUNILENBQUM7QUFMRCw0Q0FLQztBQUVELFNBQWdCLCtCQUErQixDQUFFLEdBQVcsRUFBRSxLQUFjLEVBQUUsYUFBOEM7SUFDMUgsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6Qiw4RkFBOEY7UUFDOUYsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsS0FBSztRQUMxQyxlQUFlLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRyxhQUFhO0tBQ3pEO0FBQ0gsQ0FBQztBQU5ELDBFQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2VkQsZ0ZBQTJEO0FBQzNELHVGQUF1RDtBQUN2RCxxR0FBeUI7QUFDekIsK0lBQW1EO0FBRW5ELG1HQUF5QjtBQUV6QixNQUFNLFFBQVMsU0FBUSxjQUFJO0lBUXpCLFlBQWEsSUFBWSxFQUFFLE1BQXlCLEVBQUUsRUFBVTtRQUM5RCxLQUFLLEVBQUU7UUFDUCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUk7UUFDaEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFO1FBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFO1FBQ25CLElBQUksQ0FBQyxLQUFLLEdBQUcsY0FBYyxFQUFDLDhCQUE4QjtRQUMxRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVM7UUFFMUIsc0NBQXNDO1FBQ3RDLElBQUksQ0FBQyxRQUFRLEdBQUcsMEJBQWEsRUFBQyxNQUFNLENBQUM7SUFDdkMsQ0FBQztJQUVELGNBQWMsQ0FBRSxNQUFvQjtRQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxtQkFBbUIsQ0FBRSxHQUFXLEVBQUUsVUFBbUIsRUFBRSxVQUFVLEdBQUcsS0FBSztRQUN2RSxNQUFNLEVBQUUsR0FBRyxHQUFHLGVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxHQUFHLEVBQUU7UUFFbkQsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWE7UUFFeEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFO1FBQ2hCLE1BQU0sSUFBSSxHQUFHO3NCQUNLLGFBQWE7MkJBQ1IsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUM5QyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUNyQixJQUFJLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQzVELFVBQVUsQ0FBQyxDQUFDLENBQUMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUM3QyxTQUFTLElBQUksQ0FBQyxTQUFTLEVBQUU7MEJBQ0gsSUFBSSxDQUFDLFFBQVE7MkJBQ1osZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxJQUNyRCxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUNyQixLQUFLLElBQUksQ0FBQyxJQUFJOzs7T0FHWDtRQUNILE9BQU8scUJBQVEsRUFBQyxJQUFJLENBQVM7SUFDL0IsQ0FBQztJQUVEOzs7T0FHRztJQUNHLFVBQVU7O1lBQ2QsTUFBTSxHQUFHLEdBQUcsTUFBTSxlQUFLLENBQUMsT0FBTyxDQUEyQixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsZUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztpQkFDNUgsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDdEIsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDUixPQUFPLElBQUk7YUFDWjtZQUNELE1BQU0sU0FBUyxHQUFHLElBQUksNEJBQWdCLEVBQVM7WUFFL0Msd0RBQXdEO1lBQ3hELE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFxQjtZQUN6RSwwQkFBMEIsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7WUFFM0QsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUztZQUMxQixPQUFPLFNBQVM7UUFDbEIsQ0FBQztLQUFBO0lBRUQsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTO0lBQ3JDLENBQUM7Q0FDRjtBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsMEJBQTBCLENBQ3hDLFVBQTRCLEVBQzVCLGdCQUEwQyxFQUMxQyxTQUFrQztJQUVsQyxrQ0FBc0IsRUFBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO0lBRTdDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDVCxzQkFBc0I7SUFDdEIsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFDekMsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sS0FBSyxHQUFVLFFBQVE7UUFFN0IsS0FBSyxDQUFDLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxRQUFRO1FBQ2pELENBQUMsRUFBRTtLQUNKO0FBQ0gsQ0FBQztBQWhCRCxnRUFnQkM7QUFFRCxrQkFBZSxRQUFROzs7Ozs7Ozs7Ozs7OztBQ2hIdkIsZ0ZBQXlDO0FBRXpDLE1BQXFCLE9BQU87SUFRMUIsWUFBYSxXQUFtQixFQUFFLE9BQWUsRUFBRSxLQUFhLEVBQUUsTUFBeUIsRUFBRSxTQUFpQixFQUFFLFdBQW1CO1FBQ2pJLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVztRQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU87UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLO1FBQ2xCLElBQUksQ0FBQyxhQUFhLEdBQUcsMEJBQWEsRUFBQyxNQUFNLENBQUM7UUFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTO1FBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVztJQUNoQyxDQUFDO0NBQ0Y7QUFoQkQsMEJBZ0JDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2xCRCxvSUFBeUM7QUFFekM7OztHQUdHO0FBRUg7Ozs7OztHQU1HO0FBQ0gsTUFBTSxlQUFlO0lBRW5CO1FBQ0Usc0ZBQXNGO1FBQ3RGLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRTtJQUN2QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBRSxPQUFlLEVBQUUsR0FBYTtRQUN2QyxNQUFNLFVBQVUsR0FBRyxJQUFJLHNCQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUM7UUFFdkQsSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDM0M7YUFBTTtZQUNMLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7U0FDekM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsV0FBVyxDQUFFLFlBQTBCO1FBQ3JDLElBQUksWUFBWSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzVDLG9FQUFvRTtZQUNwRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHO2dCQUMxRSxPQUFPLEdBQUcsQ0FBQyxFQUFFLEtBQUssWUFBWSxDQUFDLEVBQUU7WUFDbkMsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsUUFBUTtTQUNsRDtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxPQUFPLENBQUUsSUFBWTtRQUNuQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUk7UUFFckMsSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUNqRCxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztZQUN4QixDQUFDLENBQUM7U0FDSDthQUFNO1lBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQztTQUM5QztJQUNILENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFO0lBQ3ZCLENBQUM7Q0FDRjtBQUVELGtCQUFlLGVBQWU7Ozs7Ozs7Ozs7Ozs7O0FDckU5QixNQUFxQixnQkFBZ0I7SUFJbkM7Ozs7O09BS0c7SUFDSCxZQUFhLFNBQW9CLEVBQUUsU0FBMEM7UUFDM0UsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUztJQUMvQixDQUFDO0NBQ0Y7QUFkRCxtQ0FjQzs7Ozs7Ozs7Ozs7Ozs7QUNmRCxNQUFxQixZQUFZO0lBTS9CLFlBQWEsZUFBZ0MsRUFBRSxHQUFhLEVBQUUsT0FBZTtRQUMzRSxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWU7UUFDdEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHO1FBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPO1FBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztDQUNGO0FBWkQsK0JBWUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2RELGdGQUtrQjtBQUNsQiw0R0FHdUI7QUFDdkIsd0dBQTJCO0FBQzNCLHFHQUF5QjtBQUN6QiwwS0FBa0U7QUFHbEUsbUdBQXlCO0FBR3pCLE1BQU0sZUFBZSxHQUFJLE1BQWMsQ0FBQyxlQUFrQztBQUUxRSxNQUFNLEtBQU0sU0FBUSxjQUFJO0lBb0N0QixZQUFhLEtBQXVOO1FBQ2xPLEtBQUssRUFBRTtRQUNQLE1BQU0sRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLFFBQVEsRUFDUixHQUFHLEVBQ0gsVUFBVSxFQUNWLFdBQVcsRUFDWCxFQUFFLEVBQ0YsS0FBSyxFQUNMLFlBQVksRUFDWixPQUFPLEVBQ1AsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUNULEdBQUcsS0FBSztRQUVULG1HQUFtRztRQUNuRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUc7UUFDZCxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVk7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFO1FBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLO1FBQ25CLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQztRQUN2RCxJQUFJLENBQUMsU0FBUyxHQUFHLHNDQUF5QixFQUFDLFFBQVEsQ0FBQztRQUNwRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxJQUFJLEVBQUU7UUFFdEMsZ0RBQWdEO1FBQ2hELElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRztRQUNmLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVTtRQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN4QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUs7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTO1FBRXpCLElBQUksQ0FBQyxRQUFRLEdBQUcsMEJBQWEsRUFBQyxNQUFNLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssR0FBRyxxQkFBUSxFQUFDLE9BQU8sQ0FBWTtJQUMzQyxDQUFDO0lBdERELElBQVcsRUFBRTtRQUNYLE9BQU8sSUFBSSxDQUFDLEdBQUc7SUFDakIsQ0FBQztJQUVELElBQVcsS0FBSztRQUNkLE9BQU8sSUFBSSxDQUFDLE1BQU07SUFDcEIsQ0FBQztJQUVELElBQVcsR0FBRztRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUk7SUFDbEIsQ0FBQztJQUVELElBQVcsbUJBQW1CO1FBQzVCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQjtJQUNsQyxDQUFDO0lBRUQsSUFBVyxtQkFBbUIsQ0FBRSxHQUEyQjtRQUN6RCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQzNDLENBQUM7SUFzQ08scUJBQXFCLENBQUUsT0FBdUI7UUFDcEQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUEwQixDQUFDO0lBQzVELENBQUM7SUFFTSx1QkFBdUI7UUFDNUIsSUFBSSxXQUFXLEdBQUcsRUFBRTtRQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDbkMsV0FBVyxJQUFJLFlBQVksTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLHFCQUFxQixNQUFNLENBQUMsSUFBSSxNQUFNO1lBRTdGLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDcEMsV0FBVyxJQUFJLElBQUk7YUFDcEI7U0FDRjtRQUNELE9BQU8sV0FBVztJQUNwQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLGdCQUFnQixDQUFFLEdBQVcsRUFBRSxnQkFBZ0IsR0FBRyxLQUFLO1FBQzVELE1BQU0sRUFBRSxHQUFHLEdBQUcsZUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEdBQUcsRUFBRTtRQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUU7UUFDaEIsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNyRSxNQUFNLElBQUksR0FBRzswQkFDUyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQy9DLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQ3JCLElBQUksV0FBVzt3QkFDSyxlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7NEJBQzNCLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFDakQsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFDckIsS0FBSyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhO2lDQUNSLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFDbEQsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFDckIsSUFBSSxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQ0FFckMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFDckI7Z0NBQ2MsSUFBSSxDQUFDLFFBQVE7O21DQUVWLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksSUFDNUQsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFDckIsS0FBSyxJQUFJLENBQUMsS0FBSzs7OytCQUdZLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVk7O3lCQUVyQyxJQUFJLENBQUMsU0FBUzs7eUJBRWQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUU7OytCQUV6QixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVc7a0NBQ25CLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksS0FDM0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUNiOzs7Ozs7V0FNTztRQUNQLE9BQU8scUJBQVEsRUFBQyxJQUFJLENBQVM7SUFDL0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxvQkFBb0IsQ0FBRSxTQUFzQyxFQUFFLGNBQXVCLElBQUk7UUFDOUYsd0xBQXdMO1FBQ3hMLE1BQU0sS0FBSyxHQUFHLElBQWlCO1FBQy9CLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQW9DO1FBRWxGLFNBQVMsY0FBYztZQUNyQiw0RUFBNEU7WUFDNUUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLHlCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUc7eUJBQ1EsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYTswQ0FFekMsbUNBQWdCLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQzdEO3VCQUNTLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVE7NEJBQ3RCLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsVUFDakQsSUFBSSxDQUFDLFFBQ1A7NEJBQ3dCLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUs7MkJBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTzsrQkFDckIsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUN4RCxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUNyQixLQUFLLElBQUksQ0FBQyxLQUFLOzs7OEJBR1csZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWTtvQkFDekMsSUFBSSxDQUFDLHVCQUF1QixFQUFFOzs7b0JBRzlCLElBQUksQ0FBQyxTQUFTO2dCQUVsQixXQUFXO1lBQ1QsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLE9BQU87WUFDN0QsQ0FBQyxDQUFDLEVBQ047O2FBRUQ7UUFFVCxNQUFNLEVBQUUsR0FBRyxxQkFBUSxFQUFDLElBQUksQ0FBQztRQUV6Qix3QkFBd0I7UUFDeEIsTUFBTSxZQUFZLEdBQUcsRUFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDdEMsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUM7U0FDNUQ7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQXVCO1FBQ3BDLFlBQVksYUFBWixZQUFZLHVCQUFaLFlBQVksQ0FBRSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFL0Qsa0RBQStCLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxZQUF1QixFQUFFLFNBQVMsQ0FBQztRQUU3RSxPQUFPLEVBQVU7SUFDbkIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLGtCQUFrQixDQUFFLElBQVk7UUFDckMsTUFBTSxJQUFJLEdBQUc7eUJBQ1EsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYTttQkFDdEMsSUFBSTs0QkFDSyxlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLFVBQ2pELElBQUksQ0FBQyxRQUNQOzRCQUN3QixlQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLOzJCQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU87K0JBQ3JCLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksSUFDeEQsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFDckIsS0FBSyxJQUFJLENBQUMsS0FBSzs7OzhCQUdXLGVBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVk7b0JBQ3pDLElBQUksQ0FBQyx1QkFBdUIsRUFBRTs7O29CQUc5QixJQUFJLENBQUMsU0FBUzs7YUFFckI7UUFFVCxPQUFPLHFCQUFRLEVBQUMsSUFBSSxDQUFTO0lBQy9CLENBQUM7SUFFRCxnRUFBZ0U7SUFDbkQsWUFBWTs7WUFDdkIsTUFBTSxHQUFHLEdBQUcsTUFBTSxlQUFLO2lCQUNwQixHQUFHLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO2lCQUMzQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDYixNQUFNLEdBQUc7WUFDWCxDQUFDLENBQUM7WUFDSixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWM7WUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRztnQkFDZCxZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVk7Z0JBQ2hDLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWTtnQkFDaEMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtnQkFDeEMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUN0QixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07YUFDckI7WUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRO1FBQ3RCLENBQUM7S0FBQTtDQUNGO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixzQkFBc0IsQ0FBRSxLQUF1QixFQUFFLE1BQThDO0lBQzdHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxJQUFJLEVBQUU7WUFDUixNQUFNLEtBQUssR0FBRztnQkFDWixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07Z0JBQ3pCLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDMUIsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUc7Z0JBQ3JFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDM0IsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWTtnQkFDcEMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNYLEtBQUssRUFBRSxJQUFJLGVBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ25FLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYTtnQkFDaEMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUNyQixHQUFHLEVBQUUsQ0FBQzthQUNQO1lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0I7U0FDRjtLQUNGO0lBQ0QsT0FBTyxNQUFNO0FBQ2YsQ0FBQztBQXpCRCx3REF5QkM7QUFFRCxrQkFBZSxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxU3BCLDhIQUFpQztBQUlqQyxNQUFNLFlBQVksR0FBRyx3Q0FBd0M7QUFDN0QscUVBQXFFO0FBQ3JFLE1BQU0sV0FBVyxHQUFHLHVCQUF1QjtBQUMzQyxNQUFNLFFBQVEsR0FBRyxrQ0FBa0M7QUFDbkQsTUFBTSxNQUFNLEdBQUc7SUFDYixrQkFBa0I7SUFDbEIsMEJBQTBCO0lBQzFCLDRCQUE0QjtJQUM1Qiw2QkFBNkI7SUFDN0IsV0FBVztJQUNYLG9CQUFvQjtJQUNwQixpQkFBaUI7SUFDakIsbUJBQW1CO0lBQ25CLDZCQUE2QjtJQUM3Qix3QkFBd0I7SUFDeEIsdUJBQXVCO0lBQ3ZCLHlCQUF5QjtJQUN6QixxQkFBcUI7SUFDckIsbUJBQW1CO0lBQ25CLGVBQWU7SUFDZiw2QkFBNkI7SUFDN0IsMkJBQTJCO0lBQzNCLGtCQUFrQjtJQUNsQixvQkFBb0I7Q0FDckI7QUFDWSxjQUFNLEdBQUc7SUFDcEIsR0FBRyxFQUFFO1FBQ0gsR0FBRyxFQUFFO1lBQ0gsZ0JBQWdCLEVBQUUsb0JBQW9CO1lBQ3RDLHNCQUFzQixFQUFFLDJCQUEyQjtZQUNuRCxzQkFBc0IsRUFBRSwwQkFBMEI7WUFDbEQsbUJBQW1CLEVBQUUsdUJBQXVCO1lBQzVDLGNBQWMsRUFBRSxXQUFXO1lBQzNCLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLGdCQUFnQixFQUFFLG1CQUFtQjtZQUNyQyxhQUFhLEVBQUUsZ0JBQWdCO1lBQy9CLGlCQUFpQixFQUFFLHFCQUFxQjtZQUN4QyxvQkFBb0IsRUFBRSx3QkFBd0I7WUFDOUMsWUFBWSxFQUFFLGVBQWU7WUFDN0IsVUFBVSxFQUFFLGFBQWE7WUFDekIsV0FBVyxFQUFFLGNBQWM7WUFDM0Isb0JBQW9CLEVBQUUsd0JBQXdCO1lBQzlDLGlCQUFpQixFQUFFLG9CQUFvQjtZQUN2QyxnQkFBZ0IsRUFBRSxtQkFBbUI7WUFDckMsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLFVBQVUsRUFBRSxhQUFhO1lBQ3pCLE9BQU8sRUFBRSxpQkFBaUI7WUFDMUIsV0FBVyxFQUFFLGNBQWM7WUFDM0IsSUFBSSxFQUFFLE1BQU07WUFDWixnQkFBZ0IsRUFBRSxxQkFBcUI7WUFDdkMsTUFBTSxFQUFFLFFBQVE7WUFDaEIsb0JBQW9CLEVBQUUsd0JBQXdCO1lBQzlDLFlBQVksRUFBRSxTQUFTO1lBQ3ZCLFdBQVcsRUFBRSxjQUFjO1lBQzNCLFdBQVcsRUFBRSxjQUFjO1lBQzNCLG9CQUFvQixFQUFFLHlCQUF5QjtZQUMvQyxhQUFhLEVBQUUsZ0JBQWdCO1lBQy9CLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLFdBQVcsRUFBRSxjQUFjO1lBQzNCLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsU0FBUyxFQUFFLFlBQVk7WUFDdkIsV0FBVyxFQUFFLGNBQWM7WUFDM0Isa0JBQWtCLEVBQUUsMkJBQTJCO1NBQ2hEO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLE1BQU07WUFDWixRQUFRLEVBQUUsVUFBVTtZQUNwQixLQUFLLEVBQUUsT0FBTztZQUNkLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLGFBQWEsRUFBRSxnQkFBZ0I7WUFDL0IsbUJBQW1CLEVBQUUsc0JBQXNCO1lBQzNDLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLElBQUksRUFBRSxNQUFNO1lBQ1osUUFBUSxFQUFFLFVBQVU7WUFDcEIsSUFBSSxFQUFFLE1BQU07WUFDWixjQUFjLEVBQUUsaUJBQWlCO1lBQ2pDLFlBQVksRUFBRSxlQUFlO1lBQzdCLElBQUksRUFBRSxNQUFNO1lBQ1osYUFBYSxFQUFFLGdCQUFnQjtZQUMvQixTQUFTLEVBQUUsWUFBWTtZQUN2QixhQUFhLEVBQUUsaUJBQWlCO1lBQ2hDLGFBQWEsRUFBRSxpQkFBaUI7WUFDaEMsWUFBWSxFQUFFLGdCQUFnQjtZQUM5QixRQUFRLEVBQUUsV0FBVztZQUNyQixlQUFlLEVBQUUsa0JBQWtCO1lBQ25DLFVBQVUsRUFBRSxhQUFhO1lBQ3pCLGFBQWEsRUFBRSxnQkFBZ0I7WUFDL0IsUUFBUSxFQUFFLFdBQVc7WUFDckIsUUFBUSxFQUFFLFdBQVc7WUFDckIsc0JBQXNCLEVBQUUsMkJBQTJCO1lBQ25ELFdBQVcsRUFBRSxjQUFjO1lBQzNCLGNBQWMsRUFBRSxpQkFBaUI7WUFDakMsZUFBZSxFQUFFLGtCQUFrQjtZQUNuQyxTQUFTLEVBQUUsV0FBVztZQUN0QixNQUFNLEVBQUUsU0FBUztZQUNqQixPQUFPLEVBQUUsVUFBVTtZQUNuQixhQUFhLEVBQUUsaUJBQWlCO1lBQ2hDLFVBQVUsRUFBRSxhQUFhO1lBQ3pCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLGVBQWUsRUFBRSxtQkFBbUI7WUFDcEMsUUFBUSxFQUFFLFdBQVc7WUFDckIsT0FBTyxFQUFFLFNBQVM7WUFDbEIsS0FBSyxFQUFFLE9BQU87WUFDZCxRQUFRLEVBQUUsVUFBVTtZQUNwQixXQUFXLEVBQUUsY0FBYztTQUM1QjtRQUNELFVBQVUsRUFBRTtZQUNWLGFBQWEsRUFBRSxnQkFBZ0I7U0FDaEM7S0FDRjtJQUNELElBQUksRUFBRTtRQUNKLE9BQU8sRUFBRSx1QkFBdUI7UUFDaEMsSUFBSSxFQUFFLEdBQUcsWUFBWSxjQUFjLFFBQVEsaUJBQWlCLFdBQVcsVUFBVSxNQUFNLENBQUMsSUFBSSxDQUMxRixLQUFLLENBQ04sc0NBQXNDO1FBQ3ZDLFlBQVksRUFBRSxvQkFBb0I7UUFDbEMsY0FBYyxFQUFFLDBCQUEwQjtRQUMxQyxxQkFBcUIsRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsOEJBQThCLElBQUksRUFBRTtRQUM3RSxhQUFhLEVBQUUsc0NBQXNDO1FBQ3JELFlBQVksRUFBRSxxQ0FBcUM7UUFDbkQsWUFBWSxFQUFFLHdCQUF3QjtRQUN0QyxpQkFBaUIsRUFBRSwyQ0FBMkM7UUFDOUQsY0FBYyxFQUFFLHNCQUFzQjtRQUN0QyxvQkFBb0IsRUFBRSxDQUFDLFVBQWtCLEVBQUUsRUFBRSxDQUFDLDhDQUE4QyxVQUFVLEVBQUU7UUFDeEcsa0JBQWtCLEVBQUUsQ0FBQyxVQUFrQixFQUFFLEVBQUUsQ0FBQyw0Q0FBNEMsVUFBVSxFQUFFO1FBQ3BHLGdCQUFnQixFQUFFLHlDQUF5QztRQUMzRCxxQkFBcUIsRUFBRSx1QkFBdUI7UUFDOUMsY0FBYyxFQUFFLGlDQUFpQztRQUNqRCxxQkFBcUIsRUFBRSxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMseUNBQXlDLEdBQUcsRUFBRTtRQUN0RixxQkFBcUIsRUFBRSxtQ0FBbUM7UUFDMUQsMkJBQTJCLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLDRDQUE0QyxHQUFHLEVBQUU7UUFDL0YsMkJBQTJCLEVBQUUsc0NBQXNDO1FBQ25FLGtCQUFrQixFQUFFLENBQUMsRUFBVSxFQUFFLEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxFQUFFO1FBQzdFLHFCQUFxQixFQUFFLG1DQUFtQztRQUMxRCxlQUFlLEVBQUUsZ0JBQWdCO1FBQ2pDLHlCQUF5QixFQUFFLHdDQUF3QztRQUNuRSxrQkFBa0IsRUFBRSwrQkFBK0I7UUFDbkQsWUFBWSxFQUFFLENBQUMsU0FBaUIsRUFBRSxTQUFpQixFQUFFLEVBQUUsQ0FDckQsaUNBQWlDLFNBQVMsY0FBYyxTQUFTLEVBQUU7S0FDdEU7SUFDRCxLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsaUNBQWlDO1FBQzFDLGFBQWEsRUFBRSxrQ0FBa0M7UUFDakQsZ0JBQWdCLEVBQUUsd0NBQXdDO1FBQzFELFVBQVUsRUFBRSwrQkFBK0I7UUFDM0MsWUFBWSxFQUFFLGlDQUFpQztRQUMvQyxRQUFRLEVBQUUsNkJBQTZCO1FBQ3ZDLGVBQWUsRUFBRSxvQ0FBb0M7UUFDckQsV0FBVyxFQUFFLGdDQUFnQztRQUM3QyxZQUFZLEVBQUUsaUNBQWlDO1FBQy9DLFVBQVUsRUFBRSwrQkFBK0I7UUFDM0MsU0FBUyxFQUFFLDhCQUE4QjtRQUN6QyxRQUFRLEVBQUUsNEJBQTRCO1FBQ3RDLFFBQVEsRUFBRSw0QkFBNEI7UUFDdEMsV0FBVyxFQUFFLDBCQUEwQjtRQUN2QyxZQUFZLEVBQUUsMkJBQTJCO1FBQ3pDLFFBQVEsRUFBRSx1QkFBdUI7UUFDakMsU0FBUyxFQUFFLHdCQUF3QjtLQUNwQztDQUNGO0FBRUQsU0FBZ0IseUJBQXlCLENBQUUsTUFBYztJQUN2RCxNQUFNLE9BQU8sR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDbEQsTUFBTSxPQUFPLEdBQVcsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLE9BQU8sT0FBTyxLQUFLLEVBQUU7UUFDbkIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsS0FBSztRQUNyQixDQUFDLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTztBQUN6RCxDQUFDO0FBTkQsOERBTUM7QUFDRCxTQUFnQixRQUFRLENBQUUsSUFBWTtJQUNwQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztJQUMvQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFDLDZDQUE2QztJQUNoRSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDckIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVU7QUFDaEMsQ0FBQztBQUxELDRCQUtDO0FBRUQsU0FBc0IsY0FBYyxDQUNsQyxPQUFtQixFQUNuQixjQUFjLENBQUMsR0FBTSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQzdCLFlBQVksQ0FBQyxHQUFZLEVBQUUsRUFBRTtJQUMzQixJQUFJLEdBQUcsRUFBRTtRQUNQLE1BQU0sSUFBSSxLQUFLLEVBQUU7S0FDbEI7QUFDSCxDQUFDOztRQUVELElBQUk7WUFDRixNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU87WUFDekIsV0FBVyxDQUFDLEdBQVEsQ0FBQztZQUNyQixPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUE4QjtTQUMzRDtRQUFDLE9BQU8sR0FBWSxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQ2xCLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDZCxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUE4QjtTQUMzRDtJQUNILENBQUM7Q0FBQTtBQWxCRCx3Q0FrQkM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixRQUFRLENBQUUsRUFBb0IsRUFBRSxLQUF1QixFQUFFLGFBQXFCLE1BQU07SUFDbEcsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztJQUMzQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtJQUV4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNyQyxxQ0FBcUM7UUFDckMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLGNBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxTQUFTO1FBRWxELElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDekQsdURBQXVEO1lBQ3ZELEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFVBQVU7U0FDcEM7YUFBTTtZQUNMLG9CQUFvQjtZQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNO1NBQ2hDO0tBQ0Y7QUFDSCxDQUFDO0FBakJELDRCQWlCQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFnQixZQUFZLENBQUUsSUFBWSxFQUFFLElBQVk7SUFDdEQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7SUFDL0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFDdkMsSUFBSSxPQUFvQjtJQUN4QixJQUFJLE9BQU8sRUFBRTtRQUNYLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSTtRQUNuQixPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFDbkMsT0FBTyxPQUFPLENBQUMsS0FBSztLQUNyQjtJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUM7QUFDM0QsQ0FBQztBQVhELG9DQVdDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUUsRUFBZTtJQUMvQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVc7QUFDeEMsQ0FBQztBQUZELDRDQUVDO0FBRUQsU0FBZ0IscUJBQXFCLENBQUUsTUFBYztJQUNuRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUZELHNEQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUFFLE1BQXlCLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDL0QsMkJBQTJCO0lBQzNCLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDdkIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUN2QixPQUFPLEdBQUcsQ0FBQyxHQUFHO0tBQ2Y7U0FBTTtRQUNMLE9BQU8sRUFBRTtLQUNWO0FBQ0gsQ0FBQztBQVJELHNDQVFDO0FBRUQsU0FBZ0IsbUJBQW1CLENBQUUsTUFBWTtJQUMvQyxPQUFPLE1BQU0sQ0FBQyxVQUFVLEVBQUU7UUFDeEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0tBQ3RDO0FBQ0gsQ0FBQztBQUpELGtEQUlDO0FBRVksd0JBQWdCLEdBQUcsQ0FBQztJQUMvQjs7Ozs7OztPQU9HO0lBQ0gsU0FBUywyQkFBMkIsQ0FDbEMsaUJBQXlCLEVBQ3pCLG9CQUE0QixFQUM1QixpQkFBeUI7UUFFekIsMERBQTBEO1FBQzFELE1BQU0sVUFBVSxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFFL0MsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzFCLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7WUFDaEQsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNYLDZDQUE2QztZQUM3QyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNoQyxJQUFJLEdBQUcsS0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFO29CQUMzQixhQUFhLENBQUMsUUFBUSxDQUFDO29CQUN2QixPQUFNO2lCQUNQO2dCQUNELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQzdCLHVFQUF1RTtnQkFDdkUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUM7Z0JBQzNDLEdBQUcsSUFBSSxDQUFDO1lBQ1YsQ0FBQyxFQUFFLGlCQUFpQixDQUFDO1FBQ3ZCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRDs7Ozs7T0FLRztJQUNILFNBQVMsaUJBQWlCLENBQUUsaUJBQXlCLEVBQUUsVUFBa0IsRUFBRSxpQkFBeUI7UUFDbEcsMkJBQTJCLENBQ3pCLGlCQUFpQixFQUNqQixVQUFVLEVBQ1YsaUJBQWlCLENBQ2xCO0lBQ0gsQ0FBQztJQUNELE9BQU87UUFDTCxpQkFBaUI7S0FDbEI7QUFDSCxDQUFDLENBQUMsRUFBRTtBQUVKLFNBQWdCLHNCQUFzQixDQUFFLFFBQW9CO0lBQzFELE1BQU0sSUFBSSxHQUFJLFFBQVEsQ0FBQyxNQUFzQixDQUFDLHFCQUFxQixFQUFFO0lBQ3JFLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBQyxpQ0FBaUM7SUFDeEUsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFDLGlDQUFpQztJQUN2RSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNqQixDQUFDO0FBTEQsd0RBS0M7QUFDRCxTQUFTLGdCQUFnQixDQUFFLEdBQTJCO0lBQ3BELE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNO0lBQ3pCLDREQUE0RDtJQUM1RCxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQztLQUM1RDtJQUNELElBQUksQ0FBQyxHQUFHLENBQUM7SUFDVCxJQUFJLENBQUMsR0FBRyxDQUFDO0lBRVQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7SUFDM0MsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7SUFFM0MsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzFELENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDOUIsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRTtLQUMvQjtTQUFNO1FBQ0wsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO1FBQ1gsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0tBQ1o7SUFFRCx3QkFBd0I7SUFDeEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEtBQUs7SUFFOUQsZ0NBQWdDO0lBQ2hDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDN0MsQ0FBQztBQUNELFNBQWdCLGFBQWE7SUFDM0Isd0JBQVEsRUFBQyxjQUFjLENBQUM7U0FDckIsU0FBUyxDQUFDO1FBQ1Qsb0NBQW9DO1FBQ3BDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFFM0QsU0FBUyxFQUFFO1lBQ1QsSUFBSSxDQUFFLEdBQUc7Z0JBQ1AsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU07Z0JBQ3pCLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDdEQsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUV0RCw2QkFBNkI7Z0JBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUk7Z0JBQzFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUk7Z0JBRTVDLGlEQUFpRDtnQkFDakQsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSTtnQkFDdkIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRztnQkFFdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUs7Z0JBRTdELE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLENBQUM7U0FDRjtRQUNELFNBQVMsRUFBRTtZQUNULG1DQUFtQztZQUNuQyxvQkFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBQy9CLEtBQUssRUFBRSxRQUFRO2FBQ2hCLENBQUM7WUFFRixlQUFlO1lBQ2Ysb0JBQVEsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO2dCQUM5QixHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7YUFDaEMsQ0FBQztTQUNIO1FBRUQsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFDO1NBQ0QsU0FBUyxDQUFDO1FBQ1QsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1FBQ3JDLE9BQU8sRUFBRSxJQUFJO1FBQ2IsU0FBUyxFQUFFO1lBQ1Qsb0JBQVEsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO2dCQUM5QixXQUFXLEVBQUUsUUFBUTtnQkFDckIsT0FBTyxFQUFFLEtBQUs7YUFDZixDQUFDO1NBQ0g7S0FDRixDQUFDO0FBQ04sQ0FBQztBQWxERCxzQ0FrREM7QUFFRCxTQUFnQixlQUFlLENBQUUsWUFBb0I7SUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUM7QUFDL0IsQ0FBQztBQUZELDBDQUVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1WkQsK0VBQWlEO0FBQ2pELG1HQUF5QjtBQUV6QixNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQUMsa0JBQWtCO0FBTTFDLFNBQVMsVUFBVSxDQUFFLEdBQVE7SUFDM0IsT0FBTyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssU0FBUztBQUN0QyxDQUFDO0FBRUQsU0FBc0IsZ0JBQWdCOztRQUNwQyxtRUFBbUU7UUFDbkUsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLEVBQUU7WUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQztZQUNyQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNmLDJCQUFjLEVBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQzlCLENBQUMsRUFBRSxTQUFTLENBQUM7UUFDZixDQUFDO1FBQ0QsSUFBSSxRQUFRLEdBQUcsS0FBSztRQUNwQixxRUFBcUU7UUFDckUsd0lBQXdJO1FBQ3hJLE1BQU0sMkJBQWMsRUFDbEIsZUFBSyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUNuQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQzthQUM5QztZQUVELFFBQVEsR0FBRyxHQUFHLENBQUMsSUFBSTtRQUNyQixDQUFDLENBQ0Y7UUFFRCxJQUFJLFFBQVEsRUFBRTtZQUNaLG9CQUFvQixFQUFFO1NBQ3ZCO1FBQ0QsT0FBTyxRQUFRO0lBQ2pCLENBQUM7Q0FBQTtBQTNCRCw0Q0EyQkM7QUFDRCxTQUFzQixTQUFTLENBQUUsU0FBcUI7O1FBQ3BELElBQUksUUFBUSxHQUFHLEtBQUs7UUFDcEIsNEZBQTRGO1FBQzVGLE1BQU0sU0FBUyxHQUFHLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRTdELGlFQUFpRTtRQUNqRSx3RUFBd0U7UUFDeEUsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFFcEMsSUFBSSxRQUFRLEVBQUU7WUFDWixNQUFNLDJCQUFjLEVBQ2xCLGVBQUssQ0FBQyxHQUFHLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLG9EQUFvRDtZQUU1Ryx3REFBd0Q7WUFDeEQsR0FBRyxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQ3hCO1lBQ0QsUUFBUSxHQUFHLEVBQUU7U0FDZDthQUFNO1lBQ0wsU0FBUyxFQUFFO1NBQ1o7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztRQUN2QyxPQUFPLFFBQVE7SUFDakIsQ0FBQztDQUFBO0FBdkJELDhCQXVCQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFFLEVBQzdCLFlBQVksR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUN4QixhQUFhLEdBQUcsSUFBSSxFQUNwQixRQUFRLEdBQUcsUUFBUTtLQUNoQixzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xDLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2pELEdBQUcsRUFBRTtJQUNKLHlCQUF5QjtJQUN6QixNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztJQUNyQyxDQUFDLENBQUMsSUFBSSxHQUFHLGVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSTtJQUV6QiwyQ0FBMkM7SUFDM0MsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FDbEMsYUFBYSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQ3REO0lBRUQsMENBQTBDO0lBQzFDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzVDLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0tBQzVCO0lBRUQsb0NBQW9DO0lBQ3BDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQy9CLGVBQUssQ0FBQyxHQUFHLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUUsQ0FBQyxDQUFDO0lBRUYsMkNBQTJDO0lBQzNDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUEvQkQsc0NBK0JDO0FBQ0QsU0FBZ0IscUJBQXFCLENBQ25DLFFBQWlCLEVBQ2pCLGdCQUFnQixHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDNUIsZUFBZSxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUM7O0lBRTNCLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FDOUMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQ3RDO0lBRUQsdUVBQXVFO0lBQ3ZFLHNCQUFnQixhQUFoQixnQkFBZ0IsdUJBQWhCLGdCQUFnQixDQUFFLFVBQVUsMENBQUUsV0FBVyxDQUFDLGdCQUFnQixDQUFDO0lBRTNELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO0lBQzNFLElBQUksUUFBUSxFQUFFO1FBQ1oseUJBQXlCO1FBQ3pCLGFBQWEsRUFBRTtRQUNmLElBQUksYUFBYSxJQUFJLElBQUksRUFBRTtZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxDQUFDO1NBQ3pEO1FBQ0QsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTztRQUNyQyxnQkFBZ0IsRUFBRTtLQUNuQjtTQUFNO1FBQ0wscURBQXFEO1FBQ3JELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLGVBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTztRQUMxQyxlQUFlLEVBQUU7S0FDbEI7QUFDSCxDQUFDO0FBMUJELHNEQTBCQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsSUQsbUZBQXNFO0FBQ3RFLDZIQUE4QztBQUM5QywrR0FBc0U7QUFDdEUsd0dBSTRCO0FBQzVCLHlHQUF5RTtBQUN6RSxzSEFBbUQ7QUFDbkQsOEpBQWtFO0FBQ2xFLG1HQUE0QztBQUk1QyxTQUFTLGNBQWMsQ0FBRSxPQUFnQjs7SUFDdkMsTUFBTSxhQUFhLEdBQUcsY0FBUSxDQUFDLGNBQWMsQ0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsbUNBQUksNEJBQWUsRUFBQyx1Q0FBdUMsQ0FBQztJQUN2SSxNQUFNLFdBQVcsR0FBRyxtQkFBYSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQ0FBSSw0QkFBZSxFQUFDLHFDQUFxQyxDQUFDO0lBQ3pILE1BQU0sYUFBYSxHQUFHLG1CQUFhLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLG1DQUFJLDRCQUFlLEVBQUMsaUNBQWlDLENBQUM7SUFDdkgsTUFBTSxZQUFZLEdBQUcsbUJBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsbUNBQUksNEJBQWUsRUFBQyxzQ0FBc0MsQ0FBQztJQUU1SCxXQUFXLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXO0lBQzdDLGFBQWEsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxZQUFZO0lBQzVELFlBQVksQ0FBQyxHQUFHO1FBQ2QsT0FBTyxDQUFDLGFBQWEsS0FBSyxFQUFFO1lBQzFCLENBQUMsQ0FBQywwQkFBMEI7WUFDNUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhO0FBQzdCLENBQUM7QUFFRCxTQUFlLGVBQWU7O1FBQzVCLFNBQVMsV0FBVyxDQUFFLEdBQStCO1lBQ25ELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJO1lBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FDekIsSUFBSSxDQUFDLFlBQVksRUFDakIsSUFBSSxDQUFDLE9BQU8sRUFDWixJQUFJLENBQUMsS0FBSyxFQUNWLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUMzQjtZQUVELGNBQWMsQ0FBQyxPQUFPLENBQUM7UUFDekIsQ0FBQztRQUVELDRCQUE0QjtRQUM1QixNQUFNLDJCQUFjLEVBQTZCLGVBQUssQ0FBQyxPQUFPLENBQWMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxlQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFDcEksV0FBVyxDQUNaO0lBQ0gsQ0FBQztDQUFBO0FBRUQsTUFBTSxpQkFBaUIsR0FBRyxDQUFDO0lBQ3pCOztPQUVHO0lBQ0gsU0FBUyxvQkFBb0I7UUFDM0IsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQW9CO1FBQ3hGLFdBQVcsQ0FBQyxJQUFJLEdBQUcsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPO1FBRXRDLFNBQVMsT0FBTztZQUNkLGVBQUssQ0FBQyxHQUFHLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDeEMsQ0FBQztRQUVELFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO0lBQ2hELENBQUM7SUFDRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUU7QUFDakMsQ0FBQyxDQUFDLEVBQUU7QUFFSixNQUFNLGtCQUFrQixHQUFHLENBQUM7SUFDMUIsU0FBUyxjQUFjO1FBQ3JCLDJCQUFjLEVBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUN2RSw0REFBNEQ7WUFDNUQsTUFBTSxTQUFTLEdBQUcsSUFBSSw0QkFBZ0IsRUFBUztZQUMvQyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUEwQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRWpGLHlDQUEwQixFQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUM7WUFDakUsa0JBQWtCLENBQUMsU0FBUyxDQUFDO1FBQy9CLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRCxTQUFTLGtCQUFrQixDQUFFLFNBQWtDOztRQUM3RCxNQUFNLGFBQWEsR0FBRyxjQUFRLENBQUMsY0FBYyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxtQ0FBSSw0QkFBZSxFQUFDLHlCQUF5QixlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLGlCQUFpQixDQUFDO1FBQ2xLLEtBQUssTUFBTSxLQUFLLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3RDLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzVEO0lBQ0gsQ0FBQztJQUNELE9BQU8sRUFBRSxjQUFjLEVBQUU7QUFDM0IsQ0FBQyxDQUFDLEVBQUU7QUFFSixNQUFNLHFCQUFxQixHQUFHLENBQUM7SUFDN0IsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLHNCQUFrQixDQUFDLEVBQUUsQ0FBQztJQUVyRCxTQUFTLGtCQUFrQjtRQUN6QiwyQkFBYyxFQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDaEUsNkRBQTZEO1lBQzdELE1BQU0sU0FBUyxHQUFrQixFQUFFO1lBQ25DLG9DQUF1QixFQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUM7WUFDMUQsc0JBQXNCLENBQUMsU0FBUyxDQUFDO1FBQ25DLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRCxTQUFTLHNCQUFzQixDQUFFLGVBQThCOztRQUM3RCxNQUFNLFFBQVEsR0FBRyxjQUFRLENBQUMsY0FBYyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxtQ0FBSSw0QkFBZSxFQUFDLG1CQUFtQixlQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLGlCQUFpQixDQUFDO1FBRS9KLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ1QsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQWMsRUFBRSxFQUFFO1lBQ3pDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRCxDQUFDLEVBQUU7UUFDTCxDQUFDLENBQUM7UUFFRixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUM1QixRQUFRLENBQUMsc0JBQXNCLENBQUMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQzNEO1FBRUQsbUNBQW1DO1FBQ25DLGtCQUFrQixDQUFDLG9CQUFvQixDQUNyQyxXQUFXLEVBQ1gsZUFBZSxFQUNmLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxDQUNOO0lBQ0gsQ0FBQztJQUVELE9BQU8sRUFBRSxrQkFBa0IsRUFBRTtBQUMvQixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsQ0FBQztJQUNDLDJCQUFjLEVBQUMsb0NBQWdCLEdBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQzlDLHlDQUFxQixFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7UUFDbkMsbUJBQW1CO1FBQ25CLDJCQUFjLEVBQ1osZUFBZSxFQUFFLEVBQ2pCLEdBQUcsRUFBRTtZQUNILGlDQUFhLEVBQUM7Z0JBQ1osWUFBWSxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUN0QixRQUFRLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQVk7YUFDN0QsQ0FBQztRQUNKLENBQUMsRUFDRCxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQ3REO1FBRUQsa0JBQWtCLENBQUMsY0FBYyxFQUFFO1FBQ25DLHFCQUFxQixDQUFDLGtCQUFrQixFQUFFO0lBQzVDLENBQUMsQ0FBQyxDQUNIO0lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUU7UUFDakUsZ0JBQWdCLEVBQUU7SUFDcEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs7VUNwSko7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvaW50ZXJhY3Rqcy9kaXN0L2ludGVyYWN0Lm1pbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY2FyZC1hY3Rpb25zLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FsYnVtLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FydGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9jYXJkLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2RvdWJseS1saW5rZWQtbGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wbGF5YmFjay1zZGsudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcGxheWxpc3QudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHJvZmlsZS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvYWdncmVnYXRvci50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL3N1YnNjcmlwdGlvbi50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy90cmFjay50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29uZmlnLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9tYW5hZ2UtdG9rZW5zLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9wYWdlcy9wcm9maWxlLXBhZ2UvcHJvZmlsZS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwgY29uZmlnLCAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEV4cGVjdGVkIERPTUV4Y2VwdGlvbiB0aHJvd24gYnkgYnJvd3NlcnMgbm90IGNvbXBhdGlibGUgWE1MSHR0cFJlcXVlc3QgTGV2ZWwgMi5cbiAgICAgICAgLy8gQnV0LCB0aGlzIGNhbiBiZSBzdXBwcmVzc2VkIGZvciAnanNvbicgdHlwZSBhcyBpdCBjYW4gYmUgcGFyc2VkIGJ5IGRlZmF1bHQgJ3RyYW5zZm9ybVJlc3BvbnNlJyBmdW5jdGlvbi5cbiAgICAgICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIC8vIEhvb2sgdXAgaW50ZXJjZXB0b3JzIG1pZGRsZXdhcmVcbiAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcbiAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWRcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuKGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7IC8qIElnbm9yZSAqLyB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8qZ2xvYmFsIHRvU3RyaW5nOnRydWUqL1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpLnJlcGxhY2UoL1xccyokLywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiLyogaW50ZXJhY3QuanMgMS4xMC4xMSB8IGh0dHBzOi8vaW50ZXJhY3Rqcy5pby9saWNlbnNlICovXG4hZnVuY3Rpb24odCl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9dCgpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sdCk6KFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3NlbGY6dGhpcykuaW50ZXJhY3Q9dCgpfSgoZnVuY3Rpb24oKXt2YXIgdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9dm9pZCAwLHQuZGVmYXVsdD1mdW5jdGlvbih0KXtyZXR1cm4hKCF0fHwhdC5XaW5kb3cpJiZ0IGluc3RhbmNlb2YgdC5XaW5kb3d9O3ZhciBlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGUuaW5pdD1vLGUuZ2V0V2luZG93PWZ1bmN0aW9uKGUpe3JldHVybigwLHQuZGVmYXVsdCkoZSk/ZTooZS5vd25lckRvY3VtZW50fHxlKS5kZWZhdWx0Vmlld3x8ci53aW5kb3d9LGUud2luZG93PWUucmVhbFdpbmRvdz12b2lkIDA7dmFyIG49dm9pZCAwO2UucmVhbFdpbmRvdz1uO3ZhciByPXZvaWQgMDtmdW5jdGlvbiBvKHQpe2UucmVhbFdpbmRvdz1uPXQ7dmFyIG89dC5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtvLm93bmVyRG9jdW1lbnQhPT10LmRvY3VtZW50JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiB0LndyYXAmJnQud3JhcChvKT09PW8mJih0PXQud3JhcCh0KSksZS53aW5kb3c9cj10fWUud2luZG93PXIsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyYmd2luZG93JiZvKHdpbmRvdyk7dmFyIGk9e307ZnVuY3Rpb24gYSh0KXtyZXR1cm4oYT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KGksXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaS5kZWZhdWx0PXZvaWQgMDt2YXIgcz1mdW5jdGlvbih0KXtyZXR1cm4hIXQmJlwib2JqZWN0XCI9PT1hKHQpfSxsPWZ1bmN0aW9uKHQpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHR9LHU9e3dpbmRvdzpmdW5jdGlvbihuKXtyZXR1cm4gbj09PWUud2luZG93fHwoMCx0LmRlZmF1bHQpKG4pfSxkb2NGcmFnOmZ1bmN0aW9uKHQpe3JldHVybiBzKHQpJiYxMT09PXQubm9kZVR5cGV9LG9iamVjdDpzLGZ1bmM6bCxudW1iZXI6ZnVuY3Rpb24odCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHR9LGJvb2w6ZnVuY3Rpb24odCl7cmV0dXJuXCJib29sZWFuXCI9PXR5cGVvZiB0fSxzdHJpbmc6ZnVuY3Rpb24odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHR9LGVsZW1lbnQ6ZnVuY3Rpb24odCl7aWYoIXR8fFwib2JqZWN0XCIhPT1hKHQpKXJldHVybiExO3ZhciBuPWUuZ2V0V2luZG93KHQpfHxlLndpbmRvdztyZXR1cm4vb2JqZWN0fGZ1bmN0aW9uLy50ZXN0KGEobi5FbGVtZW50KSk/dCBpbnN0YW5jZW9mIG4uRWxlbWVudDoxPT09dC5ub2RlVHlwZSYmXCJzdHJpbmdcIj09dHlwZW9mIHQubm9kZU5hbWV9LHBsYWluT2JqZWN0OmZ1bmN0aW9uKHQpe3JldHVybiBzKHQpJiYhIXQuY29uc3RydWN0b3ImJi9mdW5jdGlvbiBPYmplY3RcXGIvLnRlc3QodC5jb25zdHJ1Y3Rvci50b1N0cmluZygpKX0sYXJyYXk6ZnVuY3Rpb24odCl7cmV0dXJuIHModCkmJnZvaWQgMCE9PXQubGVuZ3RoJiZsKHQuc3BsaWNlKX19O2kuZGVmYXVsdD11O3ZhciBjPXt9O2Z1bmN0aW9uIGYodCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtpZihcImRyYWdcIj09PWUucHJlcGFyZWQubmFtZSl7dmFyIG49ZS5wcmVwYXJlZC5heGlzO1wieFwiPT09bj8oZS5jb29yZHMuY3VyLnBhZ2UueT1lLmNvb3Jkcy5zdGFydC5wYWdlLnksZS5jb29yZHMuY3VyLmNsaWVudC55PWUuY29vcmRzLnN0YXJ0LmNsaWVudC55LGUuY29vcmRzLnZlbG9jaXR5LmNsaWVudC55PTAsZS5jb29yZHMudmVsb2NpdHkucGFnZS55PTApOlwieVwiPT09biYmKGUuY29vcmRzLmN1ci5wYWdlLng9ZS5jb29yZHMuc3RhcnQucGFnZS54LGUuY29vcmRzLmN1ci5jbGllbnQueD1lLmNvb3Jkcy5zdGFydC5jbGllbnQueCxlLmNvb3Jkcy52ZWxvY2l0eS5jbGllbnQueD0wLGUuY29vcmRzLnZlbG9jaXR5LnBhZ2UueD0wKX19ZnVuY3Rpb24gZCh0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb247aWYoXCJkcmFnXCI9PT1uLnByZXBhcmVkLm5hbWUpe3ZhciByPW4ucHJlcGFyZWQuYXhpcztpZihcInhcIj09PXJ8fFwieVwiPT09cil7dmFyIG89XCJ4XCI9PT1yP1wieVwiOlwieFwiO2UucGFnZVtvXT1uLmNvb3Jkcy5zdGFydC5wYWdlW29dLGUuY2xpZW50W29dPW4uY29vcmRzLnN0YXJ0LmNsaWVudFtvXSxlLmRlbHRhW29dPTB9fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoYyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxjLmRlZmF1bHQ9dm9pZCAwO3ZhciBwPXtpZDpcImFjdGlvbnMvZHJhZ1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5hY3Rpb25zLG49dC5JbnRlcmFjdGFibGUscj10LmRlZmF1bHRzO24ucHJvdG90eXBlLmRyYWdnYWJsZT1wLmRyYWdnYWJsZSxlLm1hcC5kcmFnPXAsZS5tZXRob2REaWN0LmRyYWc9XCJkcmFnZ2FibGVcIixyLmFjdGlvbnMuZHJhZz1wLmRlZmF1bHRzfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tbW92ZVwiOmYsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLXJlc3VtZVwiOmYsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpkLFwiYXV0by1zdGFydDpjaGVja1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmludGVyYWN0YWJsZSxyPXQuYnV0dG9ucyxvPW4ub3B0aW9ucy5kcmFnO2lmKG8mJm8uZW5hYmxlZCYmKCFlLnBvaW50ZXJJc0Rvd258fCEvbW91c2V8cG9pbnRlci8udGVzdChlLnBvaW50ZXJUeXBlKXx8MCE9KHImbi5vcHRpb25zLmRyYWcubW91c2VCdXR0b25zKSkpcmV0dXJuIHQuYWN0aW9uPXtuYW1lOlwiZHJhZ1wiLGF4aXM6XCJzdGFydFwiPT09by5sb2NrQXhpcz9vLnN0YXJ0QXhpczpvLmxvY2tBeGlzfSwhMX19LGRyYWdnYWJsZTpmdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0Lm9iamVjdCh0KT8odGhpcy5vcHRpb25zLmRyYWcuZW5hYmxlZD0hMSE9PXQuZW5hYmxlZCx0aGlzLnNldFBlckFjdGlvbihcImRyYWdcIix0KSx0aGlzLnNldE9uRXZlbnRzKFwiZHJhZ1wiLHQpLC9eKHh5fHh8eXxzdGFydCkkLy50ZXN0KHQubG9ja0F4aXMpJiYodGhpcy5vcHRpb25zLmRyYWcubG9ja0F4aXM9dC5sb2NrQXhpcyksL14oeHl8eHx5KSQvLnRlc3QodC5zdGFydEF4aXMpJiYodGhpcy5vcHRpb25zLmRyYWcuc3RhcnRBeGlzPXQuc3RhcnRBeGlzKSx0aGlzKTppLmRlZmF1bHQuYm9vbCh0KT8odGhpcy5vcHRpb25zLmRyYWcuZW5hYmxlZD10LHRoaXMpOnRoaXMub3B0aW9ucy5kcmFnfSxiZWZvcmVNb3ZlOmYsbW92ZTpkLGRlZmF1bHRzOntzdGFydEF4aXM6XCJ4eVwiLGxvY2tBeGlzOlwieHlcIn0sZ2V0Q3Vyc29yOmZ1bmN0aW9uKCl7cmV0dXJuXCJtb3ZlXCJ9fSx2PXA7Yy5kZWZhdWx0PXY7dmFyIGg9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGgsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaC5kZWZhdWx0PXZvaWQgMDt2YXIgZz17aW5pdDpmdW5jdGlvbih0KXt2YXIgZT10O2cuZG9jdW1lbnQ9ZS5kb2N1bWVudCxnLkRvY3VtZW50RnJhZ21lbnQ9ZS5Eb2N1bWVudEZyYWdtZW50fHx5LGcuU1ZHRWxlbWVudD1lLlNWR0VsZW1lbnR8fHksZy5TVkdTVkdFbGVtZW50PWUuU1ZHU1ZHRWxlbWVudHx8eSxnLlNWR0VsZW1lbnRJbnN0YW5jZT1lLlNWR0VsZW1lbnRJbnN0YW5jZXx8eSxnLkVsZW1lbnQ9ZS5FbGVtZW50fHx5LGcuSFRNTEVsZW1lbnQ9ZS5IVE1MRWxlbWVudHx8Zy5FbGVtZW50LGcuRXZlbnQ9ZS5FdmVudCxnLlRvdWNoPWUuVG91Y2h8fHksZy5Qb2ludGVyRXZlbnQ9ZS5Qb2ludGVyRXZlbnR8fGUuTVNQb2ludGVyRXZlbnR9LGRvY3VtZW50Om51bGwsRG9jdW1lbnRGcmFnbWVudDpudWxsLFNWR0VsZW1lbnQ6bnVsbCxTVkdTVkdFbGVtZW50Om51bGwsU1ZHRWxlbWVudEluc3RhbmNlOm51bGwsRWxlbWVudDpudWxsLEhUTUxFbGVtZW50Om51bGwsRXZlbnQ6bnVsbCxUb3VjaDpudWxsLFBvaW50ZXJFdmVudDpudWxsfTtmdW5jdGlvbiB5KCl7fXZhciBtPWc7aC5kZWZhdWx0PW07dmFyIGI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksYi5kZWZhdWx0PXZvaWQgMDt2YXIgeD17aW5pdDpmdW5jdGlvbih0KXt2YXIgZT1oLmRlZmF1bHQuRWxlbWVudCxuPXQubmF2aWdhdG9yfHx7fTt4LnN1cHBvcnRzVG91Y2g9XCJvbnRvdWNoc3RhcnRcImluIHR8fGkuZGVmYXVsdC5mdW5jKHQuRG9jdW1lbnRUb3VjaCkmJmguZGVmYXVsdC5kb2N1bWVudCBpbnN0YW5jZW9mIHQuRG9jdW1lbnRUb3VjaCx4LnN1cHBvcnRzUG9pbnRlckV2ZW50PSExIT09bi5wb2ludGVyRW5hYmxlZCYmISFoLmRlZmF1bHQuUG9pbnRlckV2ZW50LHguaXNJT1M9L2lQKGhvbmV8b2R8YWQpLy50ZXN0KG4ucGxhdGZvcm0pLHguaXNJT1M3PS9pUChob25lfG9kfGFkKS8udGVzdChuLnBsYXRmb3JtKSYmL09TIDdbXlxcZF0vLnRlc3Qobi5hcHBWZXJzaW9uKSx4LmlzSWU5PS9NU0lFIDkvLnRlc3Qobi51c2VyQWdlbnQpLHguaXNPcGVyYU1vYmlsZT1cIk9wZXJhXCI9PT1uLmFwcE5hbWUmJnguc3VwcG9ydHNUb3VjaCYmL1ByZXN0by8udGVzdChuLnVzZXJBZ2VudCkseC5wcmVmaXhlZE1hdGNoZXNTZWxlY3Rvcj1cIm1hdGNoZXNcImluIGUucHJvdG90eXBlP1wibWF0Y2hlc1wiOlwid2Via2l0TWF0Y2hlc1NlbGVjdG9yXCJpbiBlLnByb3RvdHlwZT9cIndlYmtpdE1hdGNoZXNTZWxlY3RvclwiOlwibW96TWF0Y2hlc1NlbGVjdG9yXCJpbiBlLnByb3RvdHlwZT9cIm1vek1hdGNoZXNTZWxlY3RvclwiOlwib01hdGNoZXNTZWxlY3RvclwiaW4gZS5wcm90b3R5cGU/XCJvTWF0Y2hlc1NlbGVjdG9yXCI6XCJtc01hdGNoZXNTZWxlY3RvclwiLHgucEV2ZW50VHlwZXM9eC5zdXBwb3J0c1BvaW50ZXJFdmVudD9oLmRlZmF1bHQuUG9pbnRlckV2ZW50PT09dC5NU1BvaW50ZXJFdmVudD97dXA6XCJNU1BvaW50ZXJVcFwiLGRvd246XCJNU1BvaW50ZXJEb3duXCIsb3ZlcjpcIm1vdXNlb3ZlclwiLG91dDpcIm1vdXNlb3V0XCIsbW92ZTpcIk1TUG9pbnRlck1vdmVcIixjYW5jZWw6XCJNU1BvaW50ZXJDYW5jZWxcIn06e3VwOlwicG9pbnRlcnVwXCIsZG93bjpcInBvaW50ZXJkb3duXCIsb3ZlcjpcInBvaW50ZXJvdmVyXCIsb3V0OlwicG9pbnRlcm91dFwiLG1vdmU6XCJwb2ludGVybW92ZVwiLGNhbmNlbDpcInBvaW50ZXJjYW5jZWxcIn06bnVsbCx4LndoZWVsRXZlbnQ9aC5kZWZhdWx0LmRvY3VtZW50JiZcIm9ubW91c2V3aGVlbFwiaW4gaC5kZWZhdWx0LmRvY3VtZW50P1wibW91c2V3aGVlbFwiOlwid2hlZWxcIn0sc3VwcG9ydHNUb3VjaDpudWxsLHN1cHBvcnRzUG9pbnRlckV2ZW50Om51bGwsaXNJT1M3Om51bGwsaXNJT1M6bnVsbCxpc0llOTpudWxsLGlzT3BlcmFNb2JpbGU6bnVsbCxwcmVmaXhlZE1hdGNoZXNTZWxlY3RvcjpudWxsLHBFdmVudFR5cGVzOm51bGwsd2hlZWxFdmVudDpudWxsfSx3PXg7Yi5kZWZhdWx0PXc7dmFyIF89e307ZnVuY3Rpb24gUCh0KXt2YXIgZT10LnBhcmVudE5vZGU7aWYoaS5kZWZhdWx0LmRvY0ZyYWcoZSkpe2Zvcig7KGU9ZS5ob3N0KSYmaS5kZWZhdWx0LmRvY0ZyYWcoZSk7KTtyZXR1cm4gZX1yZXR1cm4gZX1mdW5jdGlvbiBPKHQsbil7cmV0dXJuIGUud2luZG93IT09ZS5yZWFsV2luZG93JiYobj1uLnJlcGxhY2UoL1xcL2RlZXBcXC8vZyxcIiBcIikpLHRbYi5kZWZhdWx0LnByZWZpeGVkTWF0Y2hlc1NlbGVjdG9yXShuKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoXyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxfLm5vZGVDb250YWlucz1mdW5jdGlvbih0LGUpe2lmKHQuY29udGFpbnMpcmV0dXJuIHQuY29udGFpbnMoZSk7Zm9yKDtlOyl7aWYoZT09PXQpcmV0dXJuITA7ZT1lLnBhcmVudE5vZGV9cmV0dXJuITF9LF8uY2xvc2VzdD1mdW5jdGlvbih0LGUpe2Zvcig7aS5kZWZhdWx0LmVsZW1lbnQodCk7KXtpZihPKHQsZSkpcmV0dXJuIHQ7dD1QKHQpfXJldHVybiBudWxsfSxfLnBhcmVudE5vZGU9UCxfLm1hdGNoZXNTZWxlY3Rvcj1PLF8uaW5kZXhPZkRlZXBlc3RFbGVtZW50PWZ1bmN0aW9uKHQpe2Zvcih2YXIgbixyPVtdLG89MDtvPHQubGVuZ3RoO28rKyl7dmFyIGk9dFtvXSxhPXRbbl07aWYoaSYmbyE9PW4paWYoYSl7dmFyIHM9UyhpKSxsPVMoYSk7aWYocyE9PWkub3duZXJEb2N1bWVudClpZihsIT09aS5vd25lckRvY3VtZW50KWlmKHMhPT1sKXtyPXIubGVuZ3RoP3I6RShhKTt2YXIgdT12b2lkIDA7aWYoYSBpbnN0YW5jZW9mIGguZGVmYXVsdC5IVE1MRWxlbWVudCYmaSBpbnN0YW5jZW9mIGguZGVmYXVsdC5TVkdFbGVtZW50JiYhKGkgaW5zdGFuY2VvZiBoLmRlZmF1bHQuU1ZHU1ZHRWxlbWVudCkpe2lmKGk9PT1sKWNvbnRpbnVlO3U9aS5vd25lclNWR0VsZW1lbnR9ZWxzZSB1PWk7Zm9yKHZhciBjPUUodSxhLm93bmVyRG9jdW1lbnQpLGY9MDtjW2ZdJiZjW2ZdPT09cltmXTspZisrO3ZhciBkPVtjW2YtMV0sY1tmXSxyW2ZdXTtpZihkWzBdKWZvcih2YXIgcD1kWzBdLmxhc3RDaGlsZDtwOyl7aWYocD09PWRbMV0pe249byxyPWM7YnJlYWt9aWYocD09PWRbMl0pYnJlYWs7cD1wLnByZXZpb3VzU2libGluZ319ZWxzZSB2PWksZz1hLHZvaWQgMCx2b2lkIDAsKHBhcnNlSW50KGUuZ2V0V2luZG93KHYpLmdldENvbXB1dGVkU3R5bGUodikuekluZGV4LDEwKXx8MCk+PShwYXJzZUludChlLmdldFdpbmRvdyhnKS5nZXRDb21wdXRlZFN0eWxlKGcpLnpJbmRleCwxMCl8fDApJiYobj1vKTtlbHNlIG49b31lbHNlIG49b312YXIgdixnO3JldHVybiBufSxfLm1hdGNoZXNVcFRvPWZ1bmN0aW9uKHQsZSxuKXtmb3IoO2kuZGVmYXVsdC5lbGVtZW50KHQpOyl7aWYoTyh0LGUpKXJldHVybiEwO2lmKCh0PVAodCkpPT09bilyZXR1cm4gTyh0LGUpfXJldHVybiExfSxfLmdldEFjdHVhbEVsZW1lbnQ9ZnVuY3Rpb24odCl7cmV0dXJuIHQuY29ycmVzcG9uZGluZ1VzZUVsZW1lbnR8fHR9LF8uZ2V0U2Nyb2xsWFk9VCxfLmdldEVsZW1lbnRDbGllbnRSZWN0PU0sXy5nZXRFbGVtZW50UmVjdD1mdW5jdGlvbih0KXt2YXIgbj1NKHQpO2lmKCFiLmRlZmF1bHQuaXNJT1M3JiZuKXt2YXIgcj1UKGUuZ2V0V2luZG93KHQpKTtuLmxlZnQrPXIueCxuLnJpZ2h0Kz1yLngsbi50b3ArPXIueSxuLmJvdHRvbSs9ci55fXJldHVybiBufSxfLmdldFBhdGg9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPVtdO3Q7KWUucHVzaCh0KSx0PVAodCk7cmV0dXJuIGV9LF8udHJ5U2VsZWN0b3I9ZnVuY3Rpb24odCl7cmV0dXJuISFpLmRlZmF1bHQuc3RyaW5nKHQpJiYoaC5kZWZhdWx0LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodCksITApfTt2YXIgUz1mdW5jdGlvbih0KXtyZXR1cm4gdC5wYXJlbnROb2RlfHx0Lmhvc3R9O2Z1bmN0aW9uIEUodCxlKXtmb3IodmFyIG4scj1bXSxvPXQ7KG49UyhvKSkmJm8hPT1lJiZuIT09by5vd25lckRvY3VtZW50OylyLnVuc2hpZnQobyksbz1uO3JldHVybiByfWZ1bmN0aW9uIFQodCl7cmV0dXJue3g6KHQ9dHx8ZS53aW5kb3cpLnNjcm9sbFh8fHQuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQseTp0LnNjcm9sbFl8fHQuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcH19ZnVuY3Rpb24gTSh0KXt2YXIgZT10IGluc3RhbmNlb2YgaC5kZWZhdWx0LlNWR0VsZW1lbnQ/dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTp0LmdldENsaWVudFJlY3RzKClbMF07cmV0dXJuIGUmJntsZWZ0OmUubGVmdCxyaWdodDplLnJpZ2h0LHRvcDplLnRvcCxib3R0b206ZS5ib3R0b20sd2lkdGg6ZS53aWR0aHx8ZS5yaWdodC1lLmxlZnQsaGVpZ2h0OmUuaGVpZ2h0fHxlLmJvdHRvbS1lLnRvcH19dmFyIGo9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGosXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksai5kZWZhdWx0PWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuIGluIGUpdFtuXT1lW25dO3JldHVybiB0fTt2YXIgaz17fTtmdW5jdGlvbiBJKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1mdW5jdGlvbiBEKHQsZSxuKXtyZXR1cm5cInBhcmVudFwiPT09dD8oMCxfLnBhcmVudE5vZGUpKG4pOlwic2VsZlwiPT09dD9lLmdldFJlY3Qobik6KDAsXy5jbG9zZXN0KShuLHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShrLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGsuZ2V0U3RyaW5nT3B0aW9uUmVzdWx0PUQsay5yZXNvbHZlUmVjdExpa2U9ZnVuY3Rpb24odCxlLG4scil7dmFyIG8sYT10O3JldHVybiBpLmRlZmF1bHQuc3RyaW5nKGEpP2E9RChhLGUsbik6aS5kZWZhdWx0LmZ1bmMoYSkmJihhPWEuYXBwbHkodm9pZCAwLGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIEkodCl9KG89cil8fGZ1bmN0aW9uKHQpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpcmV0dXJuIEFycmF5LmZyb20odCl9KG8pfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBJKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9JKHQsZSk6dm9pZCAwfX0obyl8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBzcHJlYWQgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCkpKSxpLmRlZmF1bHQuZWxlbWVudChhKSYmKGE9KDAsXy5nZXRFbGVtZW50UmVjdCkoYSkpLGF9LGsucmVjdFRvWFk9ZnVuY3Rpb24odCl7cmV0dXJuIHQmJnt4OlwieFwiaW4gdD90Lng6dC5sZWZ0LHk6XCJ5XCJpbiB0P3QueTp0LnRvcH19LGsueHl3aFRvVGxicj1mdW5jdGlvbih0KXtyZXR1cm4hdHx8XCJsZWZ0XCJpbiB0JiZcInRvcFwiaW4gdHx8KCh0PSgwLGouZGVmYXVsdCkoe30sdCkpLmxlZnQ9dC54fHwwLHQudG9wPXQueXx8MCx0LnJpZ2h0PXQucmlnaHR8fHQubGVmdCt0LndpZHRoLHQuYm90dG9tPXQuYm90dG9tfHx0LnRvcCt0LmhlaWdodCksdH0say50bGJyVG9YeXdoPWZ1bmN0aW9uKHQpe3JldHVybiF0fHxcInhcImluIHQmJlwieVwiaW4gdHx8KCh0PSgwLGouZGVmYXVsdCkoe30sdCkpLng9dC5sZWZ0fHwwLHQueT10LnRvcHx8MCx0LndpZHRoPXQud2lkdGh8fCh0LnJpZ2h0fHwwKS10LngsdC5oZWlnaHQ9dC5oZWlnaHR8fCh0LmJvdHRvbXx8MCktdC55KSx0fSxrLmFkZEVkZ2VzPWZ1bmN0aW9uKHQsZSxuKXt0LmxlZnQmJihlLmxlZnQrPW4ueCksdC5yaWdodCYmKGUucmlnaHQrPW4ueCksdC50b3AmJihlLnRvcCs9bi55KSx0LmJvdHRvbSYmKGUuYm90dG9tKz1uLnkpLGUud2lkdGg9ZS5yaWdodC1lLmxlZnQsZS5oZWlnaHQ9ZS5ib3R0b20tZS50b3B9O3ZhciBBPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShBLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEEuZGVmYXVsdD1mdW5jdGlvbih0LGUsbil7dmFyIHI9dC5vcHRpb25zW25dLG89ciYmci5vcmlnaW58fHQub3B0aW9ucy5vcmlnaW4saT0oMCxrLnJlc29sdmVSZWN0TGlrZSkobyx0LGUsW3QmJmVdKTtyZXR1cm4oMCxrLnJlY3RUb1hZKShpKXx8e3g6MCx5OjB9fTt2YXIgUj17fTtmdW5jdGlvbiB6KHQpe3JldHVybiB0LnRyaW0oKS5zcGxpdCgvICsvKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoUixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxSLmRlZmF1bHQ9ZnVuY3Rpb24gdChlLG4scil7aWYocj1yfHx7fSxpLmRlZmF1bHQuc3RyaW5nKGUpJiYtMSE9PWUuc2VhcmNoKFwiIFwiKSYmKGU9eihlKSksaS5kZWZhdWx0LmFycmF5KGUpKXJldHVybiBlLnJlZHVjZSgoZnVuY3Rpb24oZSxvKXtyZXR1cm4oMCxqLmRlZmF1bHQpKGUsdChvLG4scikpfSkscik7aWYoaS5kZWZhdWx0Lm9iamVjdChlKSYmKG49ZSxlPVwiXCIpLGkuZGVmYXVsdC5mdW5jKG4pKXJbZV09cltlXXx8W10scltlXS5wdXNoKG4pO2Vsc2UgaWYoaS5kZWZhdWx0LmFycmF5KG4pKWZvcih2YXIgbz0wO288bi5sZW5ndGg7bysrKXt2YXIgYTthPW5bb10sdChlLGEscil9ZWxzZSBpZihpLmRlZmF1bHQub2JqZWN0KG4pKWZvcih2YXIgcyBpbiBuKXt2YXIgbD16KHMpLm1hcCgoZnVuY3Rpb24odCl7cmV0dXJuXCJcIi5jb25jYXQoZSkuY29uY2F0KHQpfSkpO3QobCxuW3NdLHIpfXJldHVybiByfTt2YXIgQz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoQyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxDLmRlZmF1bHQ9dm9pZCAwLEMuZGVmYXVsdD1mdW5jdGlvbih0LGUpe3JldHVybiBNYXRoLnNxcnQodCp0K2UqZSl9O3ZhciBGPXt9O2Z1bmN0aW9uIFgodCxlKXtmb3IodmFyIG4gaW4gZSl7dmFyIHI9WC5wcmVmaXhlZFByb3BSRXMsbz0hMTtmb3IodmFyIGkgaW4gcilpZigwPT09bi5pbmRleE9mKGkpJiZyW2ldLnRlc3Qobikpe289ITA7YnJlYWt9b3x8XCJmdW5jdGlvblwiPT10eXBlb2YgZVtuXXx8KHRbbl09ZVtuXSl9cmV0dXJuIHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KEYsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksRi5kZWZhdWx0PXZvaWQgMCxYLnByZWZpeGVkUHJvcFJFcz17d2Via2l0Oi8oTW92ZW1lbnRbWFldfFJhZGl1c1tYWV18Um90YXRpb25BbmdsZXxGb3JjZSkkLyxtb3o6LyhQcmVzc3VyZSkkL307dmFyIFk9WDtGLmRlZmF1bHQ9WTt2YXIgQj17fTtmdW5jdGlvbiBXKHQpe3JldHVybiB0IGluc3RhbmNlb2YgaC5kZWZhdWx0LkV2ZW50fHx0IGluc3RhbmNlb2YgaC5kZWZhdWx0LlRvdWNofWZ1bmN0aW9uIEwodCxlLG4pe3JldHVybiB0PXR8fFwicGFnZVwiLChuPW58fHt9KS54PWVbdCtcIlhcIl0sbi55PWVbdCtcIllcIl0sbn1mdW5jdGlvbiBVKHQsZSl7cmV0dXJuIGU9ZXx8e3g6MCx5OjB9LGIuZGVmYXVsdC5pc09wZXJhTW9iaWxlJiZXKHQpPyhMKFwic2NyZWVuXCIsdCxlKSxlLngrPXdpbmRvdy5zY3JvbGxYLGUueSs9d2luZG93LnNjcm9sbFkpOkwoXCJwYWdlXCIsdCxlKSxlfWZ1bmN0aW9uIFYodCxlKXtyZXR1cm4gZT1lfHx7fSxiLmRlZmF1bHQuaXNPcGVyYU1vYmlsZSYmVyh0KT9MKFwic2NyZWVuXCIsdCxlKTpMKFwiY2xpZW50XCIsdCxlKSxlfWZ1bmN0aW9uIE4odCl7dmFyIGU9W107cmV0dXJuIGkuZGVmYXVsdC5hcnJheSh0KT8oZVswXT10WzBdLGVbMV09dFsxXSk6XCJ0b3VjaGVuZFwiPT09dC50eXBlPzE9PT10LnRvdWNoZXMubGVuZ3RoPyhlWzBdPXQudG91Y2hlc1swXSxlWzFdPXQuY2hhbmdlZFRvdWNoZXNbMF0pOjA9PT10LnRvdWNoZXMubGVuZ3RoJiYoZVswXT10LmNoYW5nZWRUb3VjaGVzWzBdLGVbMV09dC5jaGFuZ2VkVG91Y2hlc1sxXSk6KGVbMF09dC50b3VjaGVzWzBdLGVbMV09dC50b3VjaGVzWzFdKSxlfWZ1bmN0aW9uIHEodCl7Zm9yKHZhciBlPXtwYWdlWDowLHBhZ2VZOjAsY2xpZW50WDowLGNsaWVudFk6MCxzY3JlZW5YOjAsc2NyZWVuWTowfSxuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07Zm9yKHZhciBvIGluIGUpZVtvXSs9cltvXX1mb3IodmFyIGkgaW4gZSllW2ldLz10Lmxlbmd0aDtyZXR1cm4gZX1PYmplY3QuZGVmaW5lUHJvcGVydHkoQixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxCLmNvcHlDb29yZHM9ZnVuY3Rpb24odCxlKXt0LnBhZ2U9dC5wYWdlfHx7fSx0LnBhZ2UueD1lLnBhZ2UueCx0LnBhZ2UueT1lLnBhZ2UueSx0LmNsaWVudD10LmNsaWVudHx8e30sdC5jbGllbnQueD1lLmNsaWVudC54LHQuY2xpZW50Lnk9ZS5jbGllbnQueSx0LnRpbWVTdGFtcD1lLnRpbWVTdGFtcH0sQi5zZXRDb29yZERlbHRhcz1mdW5jdGlvbih0LGUsbil7dC5wYWdlLng9bi5wYWdlLngtZS5wYWdlLngsdC5wYWdlLnk9bi5wYWdlLnktZS5wYWdlLnksdC5jbGllbnQueD1uLmNsaWVudC54LWUuY2xpZW50LngsdC5jbGllbnQueT1uLmNsaWVudC55LWUuY2xpZW50LnksdC50aW1lU3RhbXA9bi50aW1lU3RhbXAtZS50aW1lU3RhbXB9LEIuc2V0Q29vcmRWZWxvY2l0eT1mdW5jdGlvbih0LGUpe3ZhciBuPU1hdGgubWF4KGUudGltZVN0YW1wLzFlMywuMDAxKTt0LnBhZ2UueD1lLnBhZ2UueC9uLHQucGFnZS55PWUucGFnZS55L24sdC5jbGllbnQueD1lLmNsaWVudC54L24sdC5jbGllbnQueT1lLmNsaWVudC55L24sdC50aW1lU3RhbXA9bn0sQi5zZXRaZXJvQ29vcmRzPWZ1bmN0aW9uKHQpe3QucGFnZS54PTAsdC5wYWdlLnk9MCx0LmNsaWVudC54PTAsdC5jbGllbnQueT0wfSxCLmlzTmF0aXZlUG9pbnRlcj1XLEIuZ2V0WFk9TCxCLmdldFBhZ2VYWT1VLEIuZ2V0Q2xpZW50WFk9VixCLmdldFBvaW50ZXJJZD1mdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0Lm51bWJlcih0LnBvaW50ZXJJZCk/dC5wb2ludGVySWQ6dC5pZGVudGlmaWVyfSxCLnNldENvb3Jkcz1mdW5jdGlvbih0LGUsbil7dmFyIHI9ZS5sZW5ndGg+MT9xKGUpOmVbMF07VShyLHQucGFnZSksVihyLHQuY2xpZW50KSx0LnRpbWVTdGFtcD1ufSxCLmdldFRvdWNoUGFpcj1OLEIucG9pbnRlckF2ZXJhZ2U9cSxCLnRvdWNoQkJveD1mdW5jdGlvbih0KXtpZighdC5sZW5ndGgpcmV0dXJuIG51bGw7dmFyIGU9Tih0KSxuPU1hdGgubWluKGVbMF0ucGFnZVgsZVsxXS5wYWdlWCkscj1NYXRoLm1pbihlWzBdLnBhZ2VZLGVbMV0ucGFnZVkpLG89TWF0aC5tYXgoZVswXS5wYWdlWCxlWzFdLnBhZ2VYKSxpPU1hdGgubWF4KGVbMF0ucGFnZVksZVsxXS5wYWdlWSk7cmV0dXJue3g6bix5OnIsbGVmdDpuLHRvcDpyLHJpZ2h0Om8sYm90dG9tOmksd2lkdGg6by1uLGhlaWdodDppLXJ9fSxCLnRvdWNoRGlzdGFuY2U9ZnVuY3Rpb24odCxlKXt2YXIgbj1lK1wiWFwiLHI9ZStcIllcIixvPU4odCksaT1vWzBdW25dLW9bMV1bbl0sYT1vWzBdW3JdLW9bMV1bcl07cmV0dXJuKDAsQy5kZWZhdWx0KShpLGEpfSxCLnRvdWNoQW5nbGU9ZnVuY3Rpb24odCxlKXt2YXIgbj1lK1wiWFwiLHI9ZStcIllcIixvPU4odCksaT1vWzFdW25dLW9bMF1bbl0sYT1vWzFdW3JdLW9bMF1bcl07cmV0dXJuIDE4MCpNYXRoLmF0YW4yKGEsaSkvTWF0aC5QSX0sQi5nZXRQb2ludGVyVHlwZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0LnN0cmluZyh0LnBvaW50ZXJUeXBlKT90LnBvaW50ZXJUeXBlOmkuZGVmYXVsdC5udW1iZXIodC5wb2ludGVyVHlwZSk/W3ZvaWQgMCx2b2lkIDAsXCJ0b3VjaFwiLFwicGVuXCIsXCJtb3VzZVwiXVt0LnBvaW50ZXJUeXBlXTovdG91Y2gvLnRlc3QodC50eXBlfHxcIlwiKXx8dCBpbnN0YW5jZW9mIGguZGVmYXVsdC5Ub3VjaD9cInRvdWNoXCI6XCJtb3VzZVwifSxCLmdldEV2ZW50VGFyZ2V0cz1mdW5jdGlvbih0KXt2YXIgZT1pLmRlZmF1bHQuZnVuYyh0LmNvbXBvc2VkUGF0aCk/dC5jb21wb3NlZFBhdGgoKTp0LnBhdGg7cmV0dXJuW18uZ2V0QWN0dWFsRWxlbWVudChlP2VbMF06dC50YXJnZXQpLF8uZ2V0QWN0dWFsRWxlbWVudCh0LmN1cnJlbnRUYXJnZXQpXX0sQi5uZXdDb29yZHM9ZnVuY3Rpb24oKXtyZXR1cm57cGFnZTp7eDowLHk6MH0sY2xpZW50Ont4OjAseTowfSx0aW1lU3RhbXA6MH19LEIuY29vcmRzVG9FdmVudD1mdW5jdGlvbih0KXtyZXR1cm57Y29vcmRzOnQsZ2V0IHBhZ2UoKXtyZXR1cm4gdGhpcy5jb29yZHMucGFnZX0sZ2V0IGNsaWVudCgpe3JldHVybiB0aGlzLmNvb3Jkcy5jbGllbnR9LGdldCB0aW1lU3RhbXAoKXtyZXR1cm4gdGhpcy5jb29yZHMudGltZVN0YW1wfSxnZXQgcGFnZVgoKXtyZXR1cm4gdGhpcy5jb29yZHMucGFnZS54fSxnZXQgcGFnZVkoKXtyZXR1cm4gdGhpcy5jb29yZHMucGFnZS55fSxnZXQgY2xpZW50WCgpe3JldHVybiB0aGlzLmNvb3Jkcy5jbGllbnQueH0sZ2V0IGNsaWVudFkoKXtyZXR1cm4gdGhpcy5jb29yZHMuY2xpZW50Lnl9LGdldCBwb2ludGVySWQoKXtyZXR1cm4gdGhpcy5jb29yZHMucG9pbnRlcklkfSxnZXQgdGFyZ2V0KCl7cmV0dXJuIHRoaXMuY29vcmRzLnRhcmdldH0sZ2V0IHR5cGUoKXtyZXR1cm4gdGhpcy5jb29yZHMudHlwZX0sZ2V0IHBvaW50ZXJUeXBlKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBvaW50ZXJUeXBlfSxnZXQgYnV0dG9ucygpe3JldHVybiB0aGlzLmNvb3Jkcy5idXR0b25zfSxwcmV2ZW50RGVmYXVsdDpmdW5jdGlvbigpe319fSxPYmplY3QuZGVmaW5lUHJvcGVydHkoQixcInBvaW50ZXJFeHRlbmRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gRi5kZWZhdWx0fX0pO3ZhciAkPXt9O2Z1bmN0aW9uIEcodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIEgodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLCQuQmFzZUV2ZW50PXZvaWQgMDt2YXIgSz1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxIKHRoaXMsXCJ0eXBlXCIsdm9pZCAwKSxIKHRoaXMsXCJ0YXJnZXRcIix2b2lkIDApLEgodGhpcyxcImN1cnJlbnRUYXJnZXRcIix2b2lkIDApLEgodGhpcyxcImludGVyYWN0YWJsZVwiLHZvaWQgMCksSCh0aGlzLFwiX2ludGVyYWN0aW9uXCIsdm9pZCAwKSxIKHRoaXMsXCJ0aW1lU3RhbXBcIix2b2lkIDApLEgodGhpcyxcImltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKSxIKHRoaXMsXCJwcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksdGhpcy5faW50ZXJhY3Rpb249ZX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJwcmV2ZW50RGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInN0b3BQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fSx7a2V5Olwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZD10aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19XSkmJkcoZS5wcm90b3R5cGUsbiksdH0oKTskLkJhc2VFdmVudD1LLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShLLnByb3RvdHlwZSxcImludGVyYWN0aW9uXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pbnRlcmFjdGlvbi5fcHJveHl9LHNldDpmdW5jdGlvbigpe319KTt2YXIgWj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoWixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxaLmZpbmQ9Wi5maW5kSW5kZXg9Wi5mcm9tPVoubWVyZ2U9Wi5yZW1vdmU9Wi5jb250YWlucz12b2lkIDAsWi5jb250YWlucz1mdW5jdGlvbih0LGUpe3JldHVybi0xIT09dC5pbmRleE9mKGUpfSxaLnJlbW92ZT1mdW5jdGlvbih0LGUpe3JldHVybiB0LnNwbGljZSh0LmluZGV4T2YoZSksMSl9O3ZhciBKPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07dC5wdXNoKHIpfXJldHVybiB0fTtaLm1lcmdlPUosWi5mcm9tPWZ1bmN0aW9uKHQpe3JldHVybiBKKFtdLHQpfTt2YXIgUT1mdW5jdGlvbih0LGUpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKWlmKGUodFtuXSxuLHQpKXJldHVybiBuO3JldHVybi0xfTtaLmZpbmRJbmRleD1RLFouZmluZD1mdW5jdGlvbih0LGUpe3JldHVybiB0W1EodCxlKV19O3ZhciB0dD17fTtmdW5jdGlvbiBldCh0KXtyZXR1cm4oZXQ9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIG50KHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBydCh0LGUpe3JldHVybihydD1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gb3QodCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PWV0KGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP2l0KHQpOmV9ZnVuY3Rpb24gaXQodCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9ZnVuY3Rpb24gYXQodCl7cmV0dXJuKGF0PU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1mdW5jdGlvbiBzdCh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHR0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHR0LkRyb3BFdmVudD12b2lkIDA7dmFyIGx0PWZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmcnQodCxlKX0oYSx0KTt2YXIgZSxuLHIsbyxpPShyPWEsbz1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBSZWZsZWN0fHwhUmVmbGVjdC5jb25zdHJ1Y3QpcmV0dXJuITE7aWYoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSlyZXR1cm4hMTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm94eSlyZXR1cm4hMDt0cnl7cmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLFtdLChmdW5jdGlvbigpe30pKSksITB9Y2F0Y2godCl7cmV0dXJuITF9fSgpLGZ1bmN0aW9uKCl7dmFyIHQsZT1hdChyKTtpZihvKXt2YXIgbj1hdCh0aGlzKS5jb25zdHJ1Y3Rvcjt0PVJlZmxlY3QuY29uc3RydWN0KGUsYXJndW1lbnRzLG4pfWVsc2UgdD1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gb3QodGhpcyx0KX0pO2Z1bmN0aW9uIGEodCxlLG4pe3ZhciByOyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsYSksc3QoaXQocj1pLmNhbGwodGhpcyxlLl9pbnRlcmFjdGlvbikpLFwidGFyZ2V0XCIsdm9pZCAwKSxzdChpdChyKSxcImRyb3B6b25lXCIsdm9pZCAwKSxzdChpdChyKSxcImRyYWdFdmVudFwiLHZvaWQgMCksc3QoaXQociksXCJyZWxhdGVkVGFyZ2V0XCIsdm9pZCAwKSxzdChpdChyKSxcImRyYWdnYWJsZVwiLHZvaWQgMCksc3QoaXQociksXCJ0aW1lU3RhbXBcIix2b2lkIDApLHN0KGl0KHIpLFwicHJvcGFnYXRpb25TdG9wcGVkXCIsITEpLHN0KGl0KHIpLFwiaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkXCIsITEpO3ZhciBvPVwiZHJhZ2xlYXZlXCI9PT1uP3QucHJldjp0LmN1cixzPW8uZWxlbWVudCxsPW8uZHJvcHpvbmU7cmV0dXJuIHIudHlwZT1uLHIudGFyZ2V0PXMsci5jdXJyZW50VGFyZ2V0PXMsci5kcm9wem9uZT1sLHIuZHJhZ0V2ZW50PWUsci5yZWxhdGVkVGFyZ2V0PWUudGFyZ2V0LHIuZHJhZ2dhYmxlPWUuaW50ZXJhY3RhYmxlLHIudGltZVN0YW1wPWUudGltZVN0YW1wLHJ9cmV0dXJuIGU9YSwobj1be2tleTpcInJlamVjdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxlPXRoaXMuX2ludGVyYWN0aW9uLmRyb3BTdGF0ZTtpZihcImRyb3BhY3RpdmF0ZVwiPT09dGhpcy50eXBlfHx0aGlzLmRyb3B6b25lJiZlLmN1ci5kcm9wem9uZT09PXRoaXMuZHJvcHpvbmUmJmUuY3VyLmVsZW1lbnQ9PT10aGlzLnRhcmdldClpZihlLnByZXYuZHJvcHpvbmU9dGhpcy5kcm9wem9uZSxlLnByZXYuZWxlbWVudD10aGlzLnRhcmdldCxlLnJlamVjdGVkPSEwLGUuZXZlbnRzLmVudGVyPW51bGwsdGhpcy5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSxcImRyb3BhY3RpdmF0ZVwiPT09dGhpcy50eXBlKXt2YXIgbj1lLmFjdGl2ZURyb3BzLHI9Wi5maW5kSW5kZXgobiwoZnVuY3Rpb24oZSl7dmFyIG49ZS5kcm9wem9uZSxyPWUuZWxlbWVudDtyZXR1cm4gbj09PXQuZHJvcHpvbmUmJnI9PT10LnRhcmdldH0pKTtlLmFjdGl2ZURyb3BzLnNwbGljZShyLDEpO3ZhciBvPW5ldyBhKGUsdGhpcy5kcmFnRXZlbnQsXCJkcm9wZGVhY3RpdmF0ZVwiKTtvLmRyb3B6b25lPXRoaXMuZHJvcHpvbmUsby50YXJnZXQ9dGhpcy50YXJnZXQsdGhpcy5kcm9wem9uZS5maXJlKG8pfWVsc2UgdGhpcy5kcm9wem9uZS5maXJlKG5ldyBhKGUsdGhpcy5kcmFnRXZlbnQsXCJkcmFnbGVhdmVcIikpfX0se2tleTpcInByZXZlbnREZWZhdWx0XCIsdmFsdWU6ZnVuY3Rpb24oKXt9fSx7a2V5Olwic3RvcFByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19LHtrZXk6XCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkPXRoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX1dKSYmbnQoZS5wcm90b3R5cGUsbiksYX0oJC5CYXNlRXZlbnQpO3R0LkRyb3BFdmVudD1sdDt2YXIgdXQ9e307ZnVuY3Rpb24gY3QodCxlKXtmb3IodmFyIG49MDtuPHQuc2xpY2UoKS5sZW5ndGg7bisrKXt2YXIgcj10LnNsaWNlKClbbl0sbz1yLmRyb3B6b25lLGk9ci5lbGVtZW50O2UuZHJvcHpvbmU9byxlLnRhcmdldD1pLG8uZmlyZShlKSxlLnByb3BhZ2F0aW9uU3RvcHBlZD1lLmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZD0hMX19ZnVuY3Rpb24gZnQodCxlKXtmb3IodmFyIG49ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49dC5pbnRlcmFjdGFibGVzLHI9W10sbz0wO288bi5saXN0Lmxlbmd0aDtvKyspe3ZhciBhPW4ubGlzdFtvXTtpZihhLm9wdGlvbnMuZHJvcC5lbmFibGVkKXt2YXIgcz1hLm9wdGlvbnMuZHJvcC5hY2NlcHQ7aWYoIShpLmRlZmF1bHQuZWxlbWVudChzKSYmcyE9PWV8fGkuZGVmYXVsdC5zdHJpbmcocykmJiFfLm1hdGNoZXNTZWxlY3RvcihlLHMpfHxpLmRlZmF1bHQuZnVuYyhzKSYmIXMoe2Ryb3B6b25lOmEsZHJhZ2dhYmxlRWxlbWVudDplfSkpKWZvcih2YXIgbD1pLmRlZmF1bHQuc3RyaW5nKGEudGFyZ2V0KT9hLl9jb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoYS50YXJnZXQpOmkuZGVmYXVsdC5hcnJheShhLnRhcmdldCk/YS50YXJnZXQ6W2EudGFyZ2V0XSx1PTA7dTxsLmxlbmd0aDt1Kyspe3ZhciBjPWxbdV07YyE9PWUmJnIucHVzaCh7ZHJvcHpvbmU6YSxlbGVtZW50OmMscmVjdDphLmdldFJlY3QoYyl9KX19fXJldHVybiByfSh0LGUpLHI9MDtyPG4ubGVuZ3RoO3IrKyl7dmFyIG89bltyXTtvLnJlY3Q9by5kcm9wem9uZS5nZXRSZWN0KG8uZWxlbWVudCl9cmV0dXJuIG59ZnVuY3Rpb24gZHQodCxlLG4pe2Zvcih2YXIgcj10LmRyb3BTdGF0ZSxvPXQuaW50ZXJhY3RhYmxlLGk9dC5lbGVtZW50LGE9W10scz0wO3M8ci5hY3RpdmVEcm9wcy5sZW5ndGg7cysrKXt2YXIgbD1yLmFjdGl2ZURyb3BzW3NdLHU9bC5kcm9wem9uZSxjPWwuZWxlbWVudCxmPWwucmVjdDthLnB1c2godS5kcm9wQ2hlY2soZSxuLG8saSxjLGYpP2M6bnVsbCl9dmFyIGQ9Xy5pbmRleE9mRGVlcGVzdEVsZW1lbnQoYSk7cmV0dXJuIHIuYWN0aXZlRHJvcHNbZF18fG51bGx9ZnVuY3Rpb24gcHQodCxlLG4pe3ZhciByPXQuZHJvcFN0YXRlLG89e2VudGVyOm51bGwsbGVhdmU6bnVsbCxhY3RpdmF0ZTpudWxsLGRlYWN0aXZhdGU6bnVsbCxtb3ZlOm51bGwsZHJvcDpudWxsfTtyZXR1cm5cImRyYWdzdGFydFwiPT09bi50eXBlJiYoby5hY3RpdmF0ZT1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyb3BhY3RpdmF0ZVwiKSxvLmFjdGl2YXRlLnRhcmdldD1udWxsLG8uYWN0aXZhdGUuZHJvcHpvbmU9bnVsbCksXCJkcmFnZW5kXCI9PT1uLnR5cGUmJihvLmRlYWN0aXZhdGU9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcm9wZGVhY3RpdmF0ZVwiKSxvLmRlYWN0aXZhdGUudGFyZ2V0PW51bGwsby5kZWFjdGl2YXRlLmRyb3B6b25lPW51bGwpLHIucmVqZWN0ZWR8fChyLmN1ci5lbGVtZW50IT09ci5wcmV2LmVsZW1lbnQmJihyLnByZXYuZHJvcHpvbmUmJihvLmxlYXZlPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJhZ2xlYXZlXCIpLG4uZHJhZ0xlYXZlPW8ubGVhdmUudGFyZ2V0PXIucHJldi5lbGVtZW50LG4ucHJldkRyb3B6b25lPW8ubGVhdmUuZHJvcHpvbmU9ci5wcmV2LmRyb3B6b25lKSxyLmN1ci5kcm9wem9uZSYmKG8uZW50ZXI9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcmFnZW50ZXJcIiksbi5kcmFnRW50ZXI9ci5jdXIuZWxlbWVudCxuLmRyb3B6b25lPXIuY3VyLmRyb3B6b25lKSksXCJkcmFnZW5kXCI9PT1uLnR5cGUmJnIuY3VyLmRyb3B6b25lJiYoby5kcm9wPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJvcFwiKSxuLmRyb3B6b25lPXIuY3VyLmRyb3B6b25lLG4ucmVsYXRlZFRhcmdldD1yLmN1ci5lbGVtZW50KSxcImRyYWdtb3ZlXCI9PT1uLnR5cGUmJnIuY3VyLmRyb3B6b25lJiYoby5tb3ZlPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJvcG1vdmVcIiksby5tb3ZlLmRyYWdtb3ZlPW4sbi5kcm9wem9uZT1yLmN1ci5kcm9wem9uZSkpLG99ZnVuY3Rpb24gdnQodCxlKXt2YXIgbj10LmRyb3BTdGF0ZSxyPW4uYWN0aXZlRHJvcHMsbz1uLmN1cixpPW4ucHJldjtlLmxlYXZlJiZpLmRyb3B6b25lLmZpcmUoZS5sZWF2ZSksZS5lbnRlciYmby5kcm9wem9uZS5maXJlKGUuZW50ZXIpLGUubW92ZSYmby5kcm9wem9uZS5maXJlKGUubW92ZSksZS5kcm9wJiZvLmRyb3B6b25lLmZpcmUoZS5kcm9wKSxlLmRlYWN0aXZhdGUmJmN0KHIsZS5kZWFjdGl2YXRlKSxuLnByZXYuZHJvcHpvbmU9by5kcm9wem9uZSxuLnByZXYuZWxlbWVudD1vLmVsZW1lbnR9ZnVuY3Rpb24gaHQodCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5pRXZlbnQsbz10LmV2ZW50O2lmKFwiZHJhZ21vdmVcIj09PXIudHlwZXx8XCJkcmFnZW5kXCI9PT1yLnR5cGUpe3ZhciBpPW4uZHJvcFN0YXRlO2UuZHluYW1pY0Ryb3AmJihpLmFjdGl2ZURyb3BzPWZ0KGUsbi5lbGVtZW50KSk7dmFyIGE9cixzPWR0KG4sYSxvKTtpLnJlamVjdGVkPWkucmVqZWN0ZWQmJiEhcyYmcy5kcm9wem9uZT09PWkuY3VyLmRyb3B6b25lJiZzLmVsZW1lbnQ9PT1pLmN1ci5lbGVtZW50LGkuY3VyLmRyb3B6b25lPXMmJnMuZHJvcHpvbmUsaS5jdXIuZWxlbWVudD1zJiZzLmVsZW1lbnQsaS5ldmVudHM9cHQobiwwLGEpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodXQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdXQuZGVmYXVsdD12b2lkIDA7dmFyIGd0PXtpZDpcImFjdGlvbnMvZHJvcFwiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5hY3Rpb25zLG49dC5pbnRlcmFjdFN0YXRpYyxyPXQuSW50ZXJhY3RhYmxlLG89dC5kZWZhdWx0czt0LnVzZVBsdWdpbihjLmRlZmF1bHQpLHIucHJvdG90eXBlLmRyb3B6b25lPWZ1bmN0aW9uKHQpe3JldHVybiBmdW5jdGlvbih0LGUpe2lmKGkuZGVmYXVsdC5vYmplY3QoZSkpe2lmKHQub3B0aW9ucy5kcm9wLmVuYWJsZWQ9ITEhPT1lLmVuYWJsZWQsZS5saXN0ZW5lcnMpe3ZhciBuPSgwLFIuZGVmYXVsdCkoZS5saXN0ZW5lcnMpLHI9T2JqZWN0LmtleXMobikucmVkdWNlKChmdW5jdGlvbih0LGUpe3JldHVybiB0Wy9eKGVudGVyfGxlYXZlKS8udGVzdChlKT9cImRyYWdcIi5jb25jYXQoZSk6L14oYWN0aXZhdGV8ZGVhY3RpdmF0ZXxtb3ZlKS8udGVzdChlKT9cImRyb3BcIi5jb25jYXQoZSk6ZV09bltlXSx0fSkse30pO3Qub2ZmKHQub3B0aW9ucy5kcm9wLmxpc3RlbmVycyksdC5vbihyKSx0Lm9wdGlvbnMuZHJvcC5saXN0ZW5lcnM9cn1yZXR1cm4gaS5kZWZhdWx0LmZ1bmMoZS5vbmRyb3ApJiZ0Lm9uKFwiZHJvcFwiLGUub25kcm9wKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJvcGFjdGl2YXRlKSYmdC5vbihcImRyb3BhY3RpdmF0ZVwiLGUub25kcm9wYWN0aXZhdGUpLGkuZGVmYXVsdC5mdW5jKGUub25kcm9wZGVhY3RpdmF0ZSkmJnQub24oXCJkcm9wZGVhY3RpdmF0ZVwiLGUub25kcm9wZGVhY3RpdmF0ZSksaS5kZWZhdWx0LmZ1bmMoZS5vbmRyYWdlbnRlcikmJnQub24oXCJkcmFnZW50ZXJcIixlLm9uZHJhZ2VudGVyKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJhZ2xlYXZlKSYmdC5vbihcImRyYWdsZWF2ZVwiLGUub25kcmFnbGVhdmUpLGkuZGVmYXVsdC5mdW5jKGUub25kcm9wbW92ZSkmJnQub24oXCJkcm9wbW92ZVwiLGUub25kcm9wbW92ZSksL14ocG9pbnRlcnxjZW50ZXIpJC8udGVzdChlLm92ZXJsYXApP3Qub3B0aW9ucy5kcm9wLm92ZXJsYXA9ZS5vdmVybGFwOmkuZGVmYXVsdC5udW1iZXIoZS5vdmVybGFwKSYmKHQub3B0aW9ucy5kcm9wLm92ZXJsYXA9TWF0aC5tYXgoTWF0aC5taW4oMSxlLm92ZXJsYXApLDApKSxcImFjY2VwdFwiaW4gZSYmKHQub3B0aW9ucy5kcm9wLmFjY2VwdD1lLmFjY2VwdCksXCJjaGVja2VyXCJpbiBlJiYodC5vcHRpb25zLmRyb3AuY2hlY2tlcj1lLmNoZWNrZXIpLHR9cmV0dXJuIGkuZGVmYXVsdC5ib29sKGUpPyh0Lm9wdGlvbnMuZHJvcC5lbmFibGVkPWUsdCk6dC5vcHRpb25zLmRyb3B9KHRoaXMsdCl9LHIucHJvdG90eXBlLmRyb3BDaGVjaz1mdW5jdGlvbih0LGUsbixyLG8sYSl7cmV0dXJuIGZ1bmN0aW9uKHQsZSxuLHIsbyxhLHMpe3ZhciBsPSExO2lmKCEocz1zfHx0LmdldFJlY3QoYSkpKXJldHVybiEhdC5vcHRpb25zLmRyb3AuY2hlY2tlciYmdC5vcHRpb25zLmRyb3AuY2hlY2tlcihlLG4sbCx0LGEscixvKTt2YXIgdT10Lm9wdGlvbnMuZHJvcC5vdmVybGFwO2lmKFwicG9pbnRlclwiPT09dSl7dmFyIGM9KDAsQS5kZWZhdWx0KShyLG8sXCJkcmFnXCIpLGY9Qi5nZXRQYWdlWFkoZSk7Zi54Kz1jLngsZi55Kz1jLnk7dmFyIGQ9Zi54PnMubGVmdCYmZi54PHMucmlnaHQscD1mLnk+cy50b3AmJmYueTxzLmJvdHRvbTtsPWQmJnB9dmFyIHY9ci5nZXRSZWN0KG8pO2lmKHYmJlwiY2VudGVyXCI9PT11KXt2YXIgaD12LmxlZnQrdi53aWR0aC8yLGc9di50b3Ardi5oZWlnaHQvMjtsPWg+PXMubGVmdCYmaDw9cy5yaWdodCYmZz49cy50b3AmJmc8PXMuYm90dG9tfXJldHVybiB2JiZpLmRlZmF1bHQubnVtYmVyKHUpJiYobD1NYXRoLm1heCgwLE1hdGgubWluKHMucmlnaHQsdi5yaWdodCktTWF0aC5tYXgocy5sZWZ0LHYubGVmdCkpKk1hdGgubWF4KDAsTWF0aC5taW4ocy5ib3R0b20sdi5ib3R0b20pLU1hdGgubWF4KHMudG9wLHYudG9wKSkvKHYud2lkdGgqdi5oZWlnaHQpPj11KSx0Lm9wdGlvbnMuZHJvcC5jaGVja2VyJiYobD10Lm9wdGlvbnMuZHJvcC5jaGVja2VyKGUsbixsLHQsYSxyLG8pKSxsfSh0aGlzLHQsZSxuLHIsbyxhKX0sbi5keW5hbWljRHJvcD1mdW5jdGlvbihlKXtyZXR1cm4gaS5kZWZhdWx0LmJvb2woZSk/KHQuZHluYW1pY0Ryb3A9ZSxuKTp0LmR5bmFtaWNEcm9wfSwoMCxqLmRlZmF1bHQpKGUucGhhc2VsZXNzVHlwZXMse2RyYWdlbnRlcjohMCxkcmFnbGVhdmU6ITAsZHJvcGFjdGl2YXRlOiEwLGRyb3BkZWFjdGl2YXRlOiEwLGRyb3Btb3ZlOiEwLGRyb3A6ITB9KSxlLm1ldGhvZERpY3QuZHJvcD1cImRyb3B6b25lXCIsdC5keW5hbWljRHJvcD0hMSxvLmFjdGlvbnMuZHJvcD1ndC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLXN0YXJ0XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtcImRyYWdcIj09PWUucHJlcGFyZWQubmFtZSYmKGUuZHJvcFN0YXRlPXtjdXI6e2Ryb3B6b25lOm51bGwsZWxlbWVudDpudWxsfSxwcmV2Ontkcm9wem9uZTpudWxsLGVsZW1lbnQ6bnVsbH0scmVqZWN0ZWQ6bnVsbCxldmVudHM6bnVsbCxhY3RpdmVEcm9wczpbXX0pfSxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj0odC5ldmVudCx0LmlFdmVudCk7aWYoXCJkcmFnXCI9PT1uLnByZXBhcmVkLm5hbWUpe3ZhciBvPW4uZHJvcFN0YXRlO28uYWN0aXZlRHJvcHM9bnVsbCxvLmV2ZW50cz1udWxsLG8uYWN0aXZlRHJvcHM9ZnQoZSxuLmVsZW1lbnQpLG8uZXZlbnRzPXB0KG4sMCxyKSxvLmV2ZW50cy5hY3RpdmF0ZSYmKGN0KG8uYWN0aXZlRHJvcHMsby5ldmVudHMuYWN0aXZhdGUpLGUuZmlyZShcImFjdGlvbnMvZHJvcDpzdGFydFwiLHtpbnRlcmFjdGlvbjpuLGRyYWdFdmVudDpyfSkpfX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpodCxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQuaUV2ZW50O1wiZHJhZ1wiPT09bi5wcmVwYXJlZC5uYW1lJiYodnQobixuLmRyb3BTdGF0ZS5ldmVudHMpLGUuZmlyZShcImFjdGlvbnMvZHJvcDptb3ZlXCIse2ludGVyYWN0aW9uOm4sZHJhZ0V2ZW50OnJ9KSxuLmRyb3BTdGF0ZS5ldmVudHM9e30pfSxcImludGVyYWN0aW9uczphY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCxlKXtpZihcImRyYWdcIj09PXQuaW50ZXJhY3Rpb24ucHJlcGFyZWQubmFtZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQuaUV2ZW50O2h0KHQsZSksdnQobixuLmRyb3BTdGF0ZS5ldmVudHMpLGUuZmlyZShcImFjdGlvbnMvZHJvcDplbmRcIix7aW50ZXJhY3Rpb246bixkcmFnRXZlbnQ6cn0pfX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247aWYoXCJkcmFnXCI9PT1lLnByZXBhcmVkLm5hbWUpe3ZhciBuPWUuZHJvcFN0YXRlO24mJihuLmFjdGl2ZURyb3BzPW51bGwsbi5ldmVudHM9bnVsbCxuLmN1ci5kcm9wem9uZT1udWxsLG4uY3VyLmVsZW1lbnQ9bnVsbCxuLnByZXYuZHJvcHpvbmU9bnVsbCxuLnByZXYuZWxlbWVudD1udWxsLG4ucmVqZWN0ZWQ9ITEpfX19LGdldEFjdGl2ZURyb3BzOmZ0LGdldERyb3A6ZHQsZ2V0RHJvcEV2ZW50czpwdCxmaXJlRHJvcEV2ZW50czp2dCxkZWZhdWx0czp7ZW5hYmxlZDohMSxhY2NlcHQ6bnVsbCxvdmVybGFwOlwicG9pbnRlclwifX0seXQ9Z3Q7dXQuZGVmYXVsdD15dDt2YXIgbXQ9e307ZnVuY3Rpb24gYnQodCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuaUV2ZW50LHI9dC5waGFzZTtpZihcImdlc3R1cmVcIj09PWUucHJlcGFyZWQubmFtZSl7dmFyIG89ZS5wb2ludGVycy5tYXAoKGZ1bmN0aW9uKHQpe3JldHVybiB0LnBvaW50ZXJ9KSksYT1cInN0YXJ0XCI9PT1yLHM9XCJlbmRcIj09PXIsbD1lLmludGVyYWN0YWJsZS5vcHRpb25zLmRlbHRhU291cmNlO2lmKG4udG91Y2hlcz1bb1swXSxvWzFdXSxhKW4uZGlzdGFuY2U9Qi50b3VjaERpc3RhbmNlKG8sbCksbi5ib3g9Qi50b3VjaEJCb3gobyksbi5zY2FsZT0xLG4uZHM9MCxuLmFuZ2xlPUIudG91Y2hBbmdsZShvLGwpLG4uZGE9MCxlLmdlc3R1cmUuc3RhcnREaXN0YW5jZT1uLmRpc3RhbmNlLGUuZ2VzdHVyZS5zdGFydEFuZ2xlPW4uYW5nbGU7ZWxzZSBpZihzKXt2YXIgdT1lLnByZXZFdmVudDtuLmRpc3RhbmNlPXUuZGlzdGFuY2Usbi5ib3g9dS5ib3gsbi5zY2FsZT11LnNjYWxlLG4uZHM9MCxuLmFuZ2xlPXUuYW5nbGUsbi5kYT0wfWVsc2Ugbi5kaXN0YW5jZT1CLnRvdWNoRGlzdGFuY2UobyxsKSxuLmJveD1CLnRvdWNoQkJveChvKSxuLnNjYWxlPW4uZGlzdGFuY2UvZS5nZXN0dXJlLnN0YXJ0RGlzdGFuY2Usbi5hbmdsZT1CLnRvdWNoQW5nbGUobyxsKSxuLmRzPW4uc2NhbGUtZS5nZXN0dXJlLnNjYWxlLG4uZGE9bi5hbmdsZS1lLmdlc3R1cmUuYW5nbGU7ZS5nZXN0dXJlLmRpc3RhbmNlPW4uZGlzdGFuY2UsZS5nZXN0dXJlLmFuZ2xlPW4uYW5nbGUsaS5kZWZhdWx0Lm51bWJlcihuLnNjYWxlKSYmbi5zY2FsZSE9PTEvMCYmIWlzTmFOKG4uc2NhbGUpJiYoZS5nZXN0dXJlLnNjYWxlPW4uc2NhbGUpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkobXQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksbXQuZGVmYXVsdD12b2lkIDA7dmFyIHh0PXtpZDpcImFjdGlvbnMvZ2VzdHVyZVwiLGJlZm9yZTpbXCJhY3Rpb25zL2RyYWdcIixcImFjdGlvbnMvcmVzaXplXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5hY3Rpb25zLG49dC5JbnRlcmFjdGFibGUscj10LmRlZmF1bHRzO24ucHJvdG90eXBlLmdlc3R1cmFibGU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5vYmplY3QodCk/KHRoaXMub3B0aW9ucy5nZXN0dXJlLmVuYWJsZWQ9ITEhPT10LmVuYWJsZWQsdGhpcy5zZXRQZXJBY3Rpb24oXCJnZXN0dXJlXCIsdCksdGhpcy5zZXRPbkV2ZW50cyhcImdlc3R1cmVcIix0KSx0aGlzKTppLmRlZmF1bHQuYm9vbCh0KT8odGhpcy5vcHRpb25zLmdlc3R1cmUuZW5hYmxlZD10LHRoaXMpOnRoaXMub3B0aW9ucy5nZXN0dXJlfSxlLm1hcC5nZXN0dXJlPXh0LGUubWV0aG9kRGljdC5nZXN0dXJlPVwiZ2VzdHVyYWJsZVwiLHIuYWN0aW9ucy5nZXN0dXJlPXh0LmRlZmF1bHRzfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOmFjdGlvbi1zdGFydFwiOmJ0LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6YnQsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLWVuZFwiOmJ0LFwiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24uZ2VzdHVyZT17YW5nbGU6MCxkaXN0YW5jZTowLHNjYWxlOjEsc3RhcnRBbmdsZTowLHN0YXJ0RGlzdGFuY2U6MH19LFwiYXV0by1zdGFydDpjaGVja1wiOmZ1bmN0aW9uKHQpe2lmKCEodC5pbnRlcmFjdGlvbi5wb2ludGVycy5sZW5ndGg8Mikpe3ZhciBlPXQuaW50ZXJhY3RhYmxlLm9wdGlvbnMuZ2VzdHVyZTtpZihlJiZlLmVuYWJsZWQpcmV0dXJuIHQuYWN0aW9uPXtuYW1lOlwiZ2VzdHVyZVwifSwhMX19fSxkZWZhdWx0czp7fSxnZXRDdXJzb3I6ZnVuY3Rpb24oKXtyZXR1cm5cIlwifX0sd3Q9eHQ7bXQuZGVmYXVsdD13dDt2YXIgX3Q9e307ZnVuY3Rpb24gUHQodCxlLG4scixvLGEscyl7aWYoIWUpcmV0dXJuITE7aWYoITA9PT1lKXt2YXIgbD1pLmRlZmF1bHQubnVtYmVyKGEud2lkdGgpP2Eud2lkdGg6YS5yaWdodC1hLmxlZnQsdT1pLmRlZmF1bHQubnVtYmVyKGEuaGVpZ2h0KT9hLmhlaWdodDphLmJvdHRvbS1hLnRvcDtpZihzPU1hdGgubWluKHMsTWF0aC5hYnMoKFwibGVmdFwiPT09dHx8XCJyaWdodFwiPT09dD9sOnUpLzIpKSxsPDAmJihcImxlZnRcIj09PXQ/dD1cInJpZ2h0XCI6XCJyaWdodFwiPT09dCYmKHQ9XCJsZWZ0XCIpKSx1PDAmJihcInRvcFwiPT09dD90PVwiYm90dG9tXCI6XCJib3R0b21cIj09PXQmJih0PVwidG9wXCIpKSxcImxlZnRcIj09PXQpcmV0dXJuIG4ueDwobD49MD9hLmxlZnQ6YS5yaWdodCkrcztpZihcInRvcFwiPT09dClyZXR1cm4gbi55PCh1Pj0wP2EudG9wOmEuYm90dG9tKStzO2lmKFwicmlnaHRcIj09PXQpcmV0dXJuIG4ueD4obD49MD9hLnJpZ2h0OmEubGVmdCktcztpZihcImJvdHRvbVwiPT09dClyZXR1cm4gbi55Pih1Pj0wP2EuYm90dG9tOmEudG9wKS1zfXJldHVybiEhaS5kZWZhdWx0LmVsZW1lbnQocikmJihpLmRlZmF1bHQuZWxlbWVudChlKT9lPT09cjpfLm1hdGNoZXNVcFRvKHIsZSxvKSl9ZnVuY3Rpb24gT3QodCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwicmVzaXplXCI9PT1uLnByZXBhcmVkLm5hbWUmJm4ucmVzaXplQXhlcyl7dmFyIHI9ZTtuLmludGVyYWN0YWJsZS5vcHRpb25zLnJlc2l6ZS5zcXVhcmU/KFwieVwiPT09bi5yZXNpemVBeGVzP3IuZGVsdGEueD1yLmRlbHRhLnk6ci5kZWx0YS55PXIuZGVsdGEueCxyLmF4ZXM9XCJ4eVwiKTooci5heGVzPW4ucmVzaXplQXhlcyxcInhcIj09PW4ucmVzaXplQXhlcz9yLmRlbHRhLnk9MDpcInlcIj09PW4ucmVzaXplQXhlcyYmKHIuZGVsdGEueD0wKSl9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShfdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxfdC5kZWZhdWx0PXZvaWQgMDt2YXIgU3Q9e2lkOlwiYWN0aW9ucy9yZXNpemVcIixiZWZvcmU6W1wiYWN0aW9ucy9kcmFnXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5hY3Rpb25zLG49dC5icm93c2VyLHI9dC5JbnRlcmFjdGFibGUsbz10LmRlZmF1bHRzO1N0LmN1cnNvcnM9ZnVuY3Rpb24odCl7cmV0dXJuIHQuaXNJZTk/e3g6XCJlLXJlc2l6ZVwiLHk6XCJzLXJlc2l6ZVwiLHh5Olwic2UtcmVzaXplXCIsdG9wOlwibi1yZXNpemVcIixsZWZ0Olwidy1yZXNpemVcIixib3R0b206XCJzLXJlc2l6ZVwiLHJpZ2h0OlwiZS1yZXNpemVcIix0b3BsZWZ0Olwic2UtcmVzaXplXCIsYm90dG9tcmlnaHQ6XCJzZS1yZXNpemVcIix0b3ByaWdodDpcIm5lLXJlc2l6ZVwiLGJvdHRvbWxlZnQ6XCJuZS1yZXNpemVcIn06e3g6XCJldy1yZXNpemVcIix5OlwibnMtcmVzaXplXCIseHk6XCJud3NlLXJlc2l6ZVwiLHRvcDpcIm5zLXJlc2l6ZVwiLGxlZnQ6XCJldy1yZXNpemVcIixib3R0b206XCJucy1yZXNpemVcIixyaWdodDpcImV3LXJlc2l6ZVwiLHRvcGxlZnQ6XCJud3NlLXJlc2l6ZVwiLGJvdHRvbXJpZ2h0OlwibndzZS1yZXNpemVcIix0b3ByaWdodDpcIm5lc3ctcmVzaXplXCIsYm90dG9tbGVmdDpcIm5lc3ctcmVzaXplXCJ9fShuKSxTdC5kZWZhdWx0TWFyZ2luPW4uc3VwcG9ydHNUb3VjaHx8bi5zdXBwb3J0c1BvaW50ZXJFdmVudD8yMDoxMCxyLnByb3RvdHlwZS5yZXNpemFibGU9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4gaS5kZWZhdWx0Lm9iamVjdChlKT8odC5vcHRpb25zLnJlc2l6ZS5lbmFibGVkPSExIT09ZS5lbmFibGVkLHQuc2V0UGVyQWN0aW9uKFwicmVzaXplXCIsZSksdC5zZXRPbkV2ZW50cyhcInJlc2l6ZVwiLGUpLGkuZGVmYXVsdC5zdHJpbmcoZS5heGlzKSYmL154JHxeeSR8Xnh5JC8udGVzdChlLmF4aXMpP3Qub3B0aW9ucy5yZXNpemUuYXhpcz1lLmF4aXM6bnVsbD09PWUuYXhpcyYmKHQub3B0aW9ucy5yZXNpemUuYXhpcz1uLmRlZmF1bHRzLmFjdGlvbnMucmVzaXplLmF4aXMpLGkuZGVmYXVsdC5ib29sKGUucHJlc2VydmVBc3BlY3RSYXRpbyk/dC5vcHRpb25zLnJlc2l6ZS5wcmVzZXJ2ZUFzcGVjdFJhdGlvPWUucHJlc2VydmVBc3BlY3RSYXRpbzppLmRlZmF1bHQuYm9vbChlLnNxdWFyZSkmJih0Lm9wdGlvbnMucmVzaXplLnNxdWFyZT1lLnNxdWFyZSksdCk6aS5kZWZhdWx0LmJvb2woZSk/KHQub3B0aW9ucy5yZXNpemUuZW5hYmxlZD1lLHQpOnQub3B0aW9ucy5yZXNpemV9KHRoaXMsZSx0KX0sZS5tYXAucmVzaXplPVN0LGUubWV0aG9kRGljdC5yZXNpemU9XCJyZXNpemFibGVcIixvLmFjdGlvbnMucmVzaXplPVN0LmRlZmF1bHRzfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24ucmVzaXplQXhlcz1cInh5XCJ9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1zdGFydFwiOmZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb247aWYoXCJyZXNpemVcIj09PW4ucHJlcGFyZWQubmFtZSYmbi5wcmVwYXJlZC5lZGdlcyl7dmFyIHI9ZSxvPW4ucmVjdDtuLl9yZWN0cz17c3RhcnQ6KDAsai5kZWZhdWx0KSh7fSxvKSxjb3JyZWN0ZWQ6KDAsai5kZWZhdWx0KSh7fSxvKSxwcmV2aW91czooMCxqLmRlZmF1bHQpKHt9LG8pLGRlbHRhOntsZWZ0OjAscmlnaHQ6MCx3aWR0aDowLHRvcDowLGJvdHRvbTowLGhlaWdodDowfX0sci5lZGdlcz1uLnByZXBhcmVkLmVkZ2VzLHIucmVjdD1uLl9yZWN0cy5jb3JyZWN0ZWQsci5kZWx0YVJlY3Q9bi5fcmVjdHMuZGVsdGF9fSh0KSxPdCh0KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0KXshZnVuY3Rpb24odCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwicmVzaXplXCI9PT1uLnByZXBhcmVkLm5hbWUmJm4ucHJlcGFyZWQuZWRnZXMpe3ZhciByPWUsbz1uLmludGVyYWN0YWJsZS5vcHRpb25zLnJlc2l6ZS5pbnZlcnQsaT1cInJlcG9zaXRpb25cIj09PW98fFwibmVnYXRlXCI9PT1vLGE9bi5yZWN0LHM9bi5fcmVjdHMsbD1zLnN0YXJ0LHU9cy5jb3JyZWN0ZWQsYz1zLmRlbHRhLGY9cy5wcmV2aW91cztpZigoMCxqLmRlZmF1bHQpKGYsdSksaSl7aWYoKDAsai5kZWZhdWx0KSh1LGEpLFwicmVwb3NpdGlvblwiPT09byl7aWYodS50b3A+dS5ib3R0b20pe3ZhciBkPXUudG9wO3UudG9wPXUuYm90dG9tLHUuYm90dG9tPWR9aWYodS5sZWZ0PnUucmlnaHQpe3ZhciBwPXUubGVmdDt1LmxlZnQ9dS5yaWdodCx1LnJpZ2h0PXB9fX1lbHNlIHUudG9wPU1hdGgubWluKGEudG9wLGwuYm90dG9tKSx1LmJvdHRvbT1NYXRoLm1heChhLmJvdHRvbSxsLnRvcCksdS5sZWZ0PU1hdGgubWluKGEubGVmdCxsLnJpZ2h0KSx1LnJpZ2h0PU1hdGgubWF4KGEucmlnaHQsbC5sZWZ0KTtmb3IodmFyIHYgaW4gdS53aWR0aD11LnJpZ2h0LXUubGVmdCx1LmhlaWdodD11LmJvdHRvbS11LnRvcCx1KWNbdl09dVt2XS1mW3ZdO3IuZWRnZXM9bi5wcmVwYXJlZC5lZGdlcyxyLnJlY3Q9dSxyLmRlbHRhUmVjdD1jfX0odCksT3QodCl9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1lbmRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb247aWYoXCJyZXNpemVcIj09PW4ucHJlcGFyZWQubmFtZSYmbi5wcmVwYXJlZC5lZGdlcyl7dmFyIHI9ZTtyLmVkZ2VzPW4ucHJlcGFyZWQuZWRnZXMsci5yZWN0PW4uX3JlY3RzLmNvcnJlY3RlZCxyLmRlbHRhUmVjdD1uLl9yZWN0cy5kZWx0YX19LFwiYXV0by1zdGFydDpjaGVja1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmludGVyYWN0YWJsZSxyPXQuZWxlbWVudCxvPXQucmVjdCxhPXQuYnV0dG9ucztpZihvKXt2YXIgcz0oMCxqLmRlZmF1bHQpKHt9LGUuY29vcmRzLmN1ci5wYWdlKSxsPW4ub3B0aW9ucy5yZXNpemU7aWYobCYmbC5lbmFibGVkJiYoIWUucG9pbnRlcklzRG93bnx8IS9tb3VzZXxwb2ludGVyLy50ZXN0KGUucG9pbnRlclR5cGUpfHwwIT0oYSZsLm1vdXNlQnV0dG9ucykpKXtpZihpLmRlZmF1bHQub2JqZWN0KGwuZWRnZXMpKXt2YXIgdT17bGVmdDohMSxyaWdodDohMSx0b3A6ITEsYm90dG9tOiExfTtmb3IodmFyIGMgaW4gdSl1W2NdPVB0KGMsbC5lZGdlc1tjXSxzLGUuX2xhdGVzdFBvaW50ZXIuZXZlbnRUYXJnZXQscixvLGwubWFyZ2lufHxTdC5kZWZhdWx0TWFyZ2luKTt1LmxlZnQ9dS5sZWZ0JiYhdS5yaWdodCx1LnRvcD11LnRvcCYmIXUuYm90dG9tLCh1LmxlZnR8fHUucmlnaHR8fHUudG9wfHx1LmJvdHRvbSkmJih0LmFjdGlvbj17bmFtZTpcInJlc2l6ZVwiLGVkZ2VzOnV9KX1lbHNle3ZhciBmPVwieVwiIT09bC5heGlzJiZzLng+by5yaWdodC1TdC5kZWZhdWx0TWFyZ2luLGQ9XCJ4XCIhPT1sLmF4aXMmJnMueT5vLmJvdHRvbS1TdC5kZWZhdWx0TWFyZ2luOyhmfHxkKSYmKHQuYWN0aW9uPXtuYW1lOlwicmVzaXplXCIsYXhlczooZj9cInhcIjpcIlwiKSsoZD9cInlcIjpcIlwiKX0pfXJldHVybiF0LmFjdGlvbiYmdm9pZCAwfX19fSxkZWZhdWx0czp7c3F1YXJlOiExLHByZXNlcnZlQXNwZWN0UmF0aW86ITEsYXhpczpcInh5XCIsbWFyZ2luOk5hTixlZGdlczpudWxsLGludmVydDpcIm5vbmVcIn0sY3Vyc29yczpudWxsLGdldEN1cnNvcjpmdW5jdGlvbih0KXt2YXIgZT10LmVkZ2VzLG49dC5heGlzLHI9dC5uYW1lLG89U3QuY3Vyc29ycyxpPW51bGw7aWYobilpPW9bcituXTtlbHNlIGlmKGUpe2Zvcih2YXIgYT1cIlwiLHM9W1widG9wXCIsXCJib3R0b21cIixcImxlZnRcIixcInJpZ2h0XCJdLGw9MDtsPHMubGVuZ3RoO2wrKyl7dmFyIHU9c1tsXTtlW3VdJiYoYSs9dSl9aT1vW2FdfXJldHVybiBpfSxkZWZhdWx0TWFyZ2luOm51bGx9LEV0PVN0O190LmRlZmF1bHQ9RXQ7dmFyIFR0PXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShUdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxUdC5kZWZhdWx0PXZvaWQgMDt2YXIgTXQ9e2lkOlwiYWN0aW9uc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dC51c2VQbHVnaW4obXQuZGVmYXVsdCksdC51c2VQbHVnaW4oX3QuZGVmYXVsdCksdC51c2VQbHVnaW4oYy5kZWZhdWx0KSx0LnVzZVBsdWdpbih1dC5kZWZhdWx0KX19O1R0LmRlZmF1bHQ9TXQ7dmFyIGp0PXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShqdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxqdC5kZWZhdWx0PXZvaWQgMDt2YXIga3QsSXQsRHQ9MCxBdD17cmVxdWVzdDpmdW5jdGlvbih0KXtyZXR1cm4ga3QodCl9LGNhbmNlbDpmdW5jdGlvbih0KXtyZXR1cm4gSXQodCl9LGluaXQ6ZnVuY3Rpb24odCl7aWYoa3Q9dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUsSXQ9dC5jYW5jZWxBbmltYXRpb25GcmFtZSwha3QpZm9yKHZhciBlPVtcIm1zXCIsXCJtb3pcIixcIndlYmtpdFwiLFwib1wiXSxuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07a3Q9dFtcIlwiLmNvbmNhdChyLFwiUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpXSxJdD10W1wiXCIuY29uY2F0KHIsXCJDYW5jZWxBbmltYXRpb25GcmFtZVwiKV18fHRbXCJcIi5jb25jYXQocixcIkNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVwiKV19a3Q9a3QmJmt0LmJpbmQodCksSXQ9SXQmJkl0LmJpbmQodCksa3R8fChrdD1mdW5jdGlvbihlKXt2YXIgbj1EYXRlLm5vdygpLHI9TWF0aC5tYXgoMCwxNi0obi1EdCkpLG89dC5zZXRUaW1lb3V0KChmdW5jdGlvbigpe2UobityKX0pLHIpO3JldHVybiBEdD1uK3Isb30sSXQ9ZnVuY3Rpb24odCl7cmV0dXJuIGNsZWFyVGltZW91dCh0KX0pfX07anQuZGVmYXVsdD1BdDt2YXIgUnQ9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFJ0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFJ0LmdldENvbnRhaW5lcj1DdCxSdC5nZXRTY3JvbGw9RnQsUnQuZ2V0U2Nyb2xsU2l6ZT1mdW5jdGlvbih0KXtyZXR1cm4gaS5kZWZhdWx0LndpbmRvdyh0KSYmKHQ9d2luZG93LmRvY3VtZW50LmJvZHkpLHt4OnQuc2Nyb2xsV2lkdGgseTp0LnNjcm9sbEhlaWdodH19LFJ0LmdldFNjcm9sbFNpemVEZWx0YT1mdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmVsZW1lbnQsbz1uJiZuLmludGVyYWN0YWJsZS5vcHRpb25zW24ucHJlcGFyZWQubmFtZV0uYXV0b1Njcm9sbDtpZighb3x8IW8uZW5hYmxlZClyZXR1cm4gZSgpLHt4OjAseTowfTt2YXIgaT1DdChvLmNvbnRhaW5lcixuLmludGVyYWN0YWJsZSxyKSxhPUZ0KGkpO2UoKTt2YXIgcz1GdChpKTtyZXR1cm57eDpzLngtYS54LHk6cy55LWEueX19LFJ0LmRlZmF1bHQ9dm9pZCAwO3ZhciB6dD17ZGVmYXVsdHM6e2VuYWJsZWQ6ITEsbWFyZ2luOjYwLGNvbnRhaW5lcjpudWxsLHNwZWVkOjMwMH0sbm93OkRhdGUubm93LGludGVyYWN0aW9uOm51bGwsaTowLHg6MCx5OjAsaXNTY3JvbGxpbmc6ITEscHJldlRpbWU6MCxtYXJnaW46MCxzcGVlZDowLHN0YXJ0OmZ1bmN0aW9uKHQpe3p0LmlzU2Nyb2xsaW5nPSEwLGp0LmRlZmF1bHQuY2FuY2VsKHp0LmkpLHQuYXV0b1Njcm9sbD16dCx6dC5pbnRlcmFjdGlvbj10LHp0LnByZXZUaW1lPXp0Lm5vdygpLHp0Lmk9anQuZGVmYXVsdC5yZXF1ZXN0KHp0LnNjcm9sbCl9LHN0b3A6ZnVuY3Rpb24oKXt6dC5pc1Njcm9sbGluZz0hMSx6dC5pbnRlcmFjdGlvbiYmKHp0LmludGVyYWN0aW9uLmF1dG9TY3JvbGw9bnVsbCksanQuZGVmYXVsdC5jYW5jZWwoenQuaSl9LHNjcm9sbDpmdW5jdGlvbigpe3ZhciB0PXp0LmludGVyYWN0aW9uLGU9dC5pbnRlcmFjdGFibGUsbj10LmVsZW1lbnQscj10LnByZXBhcmVkLm5hbWUsbz1lLm9wdGlvbnNbcl0uYXV0b1Njcm9sbCxhPUN0KG8uY29udGFpbmVyLGUsbikscz16dC5ub3coKSxsPShzLXp0LnByZXZUaW1lKS8xZTMsdT1vLnNwZWVkKmw7aWYodT49MSl7dmFyIGM9e3g6enQueCp1LHk6enQueSp1fTtpZihjLnh8fGMueSl7dmFyIGY9RnQoYSk7aS5kZWZhdWx0LndpbmRvdyhhKT9hLnNjcm9sbEJ5KGMueCxjLnkpOmEmJihhLnNjcm9sbExlZnQrPWMueCxhLnNjcm9sbFRvcCs9Yy55KTt2YXIgZD1GdChhKSxwPXt4OmQueC1mLngseTpkLnktZi55fTsocC54fHxwLnkpJiZlLmZpcmUoe3R5cGU6XCJhdXRvc2Nyb2xsXCIsdGFyZ2V0Om4saW50ZXJhY3RhYmxlOmUsZGVsdGE6cCxpbnRlcmFjdGlvbjp0LGNvbnRhaW5lcjphfSl9enQucHJldlRpbWU9c316dC5pc1Njcm9sbGluZyYmKGp0LmRlZmF1bHQuY2FuY2VsKHp0LmkpLHp0Lmk9anQuZGVmYXVsdC5yZXF1ZXN0KHp0LnNjcm9sbCkpfSxjaGVjazpmdW5jdGlvbih0LGUpe3ZhciBuO3JldHVybiBudWxsPT0obj10Lm9wdGlvbnNbZV0uYXV0b1Njcm9sbCk/dm9pZCAwOm4uZW5hYmxlZH0sb25JbnRlcmFjdGlvbk1vdmU6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQucG9pbnRlcjtpZihlLmludGVyYWN0aW5nKCkmJnp0LmNoZWNrKGUuaW50ZXJhY3RhYmxlLGUucHJlcGFyZWQubmFtZSkpaWYoZS5zaW11bGF0aW9uKXp0Lng9enQueT0wO2Vsc2V7dmFyIHIsbyxhLHMsbD1lLmludGVyYWN0YWJsZSx1PWUuZWxlbWVudCxjPWUucHJlcGFyZWQubmFtZSxmPWwub3B0aW9uc1tjXS5hdXRvU2Nyb2xsLGQ9Q3QoZi5jb250YWluZXIsbCx1KTtpZihpLmRlZmF1bHQud2luZG93KGQpKXM9bi5jbGllbnRYPHp0Lm1hcmdpbixyPW4uY2xpZW50WTx6dC5tYXJnaW4sbz1uLmNsaWVudFg+ZC5pbm5lcldpZHRoLXp0Lm1hcmdpbixhPW4uY2xpZW50WT5kLmlubmVySGVpZ2h0LXp0Lm1hcmdpbjtlbHNle3ZhciBwPV8uZ2V0RWxlbWVudENsaWVudFJlY3QoZCk7cz1uLmNsaWVudFg8cC5sZWZ0K3p0Lm1hcmdpbixyPW4uY2xpZW50WTxwLnRvcCt6dC5tYXJnaW4sbz1uLmNsaWVudFg+cC5yaWdodC16dC5tYXJnaW4sYT1uLmNsaWVudFk+cC5ib3R0b20tenQubWFyZ2lufXp0Lng9bz8xOnM/LTE6MCx6dC55PWE/MTpyPy0xOjAsenQuaXNTY3JvbGxpbmd8fCh6dC5tYXJnaW49Zi5tYXJnaW4senQuc3BlZWQ9Zi5zcGVlZCx6dC5zdGFydChlKSl9fX07ZnVuY3Rpb24gQ3QodCxuLHIpe3JldHVybihpLmRlZmF1bHQuc3RyaW5nKHQpPygwLGsuZ2V0U3RyaW5nT3B0aW9uUmVzdWx0KSh0LG4scik6dCl8fCgwLGUuZ2V0V2luZG93KShyKX1mdW5jdGlvbiBGdCh0KXtyZXR1cm4gaS5kZWZhdWx0LndpbmRvdyh0KSYmKHQ9d2luZG93LmRvY3VtZW50LmJvZHkpLHt4OnQuc2Nyb2xsTGVmdCx5OnQuc2Nyb2xsVG9wfX12YXIgWHQ9e2lkOlwiYXV0by1zY3JvbGxcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVmYXVsdHMsbj10LmFjdGlvbnM7dC5hdXRvU2Nyb2xsPXp0LHp0Lm5vdz1mdW5jdGlvbigpe3JldHVybiB0Lm5vdygpfSxuLnBoYXNlbGVzc1R5cGVzLmF1dG9zY3JvbGw9ITAsZS5wZXJBY3Rpb24uYXV0b1Njcm9sbD16dC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLmF1dG9TY3JvbGw9bnVsbH0sXCJpbnRlcmFjdGlvbnM6ZGVzdHJveVwiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24uYXV0b1Njcm9sbD1udWxsLHp0LnN0b3AoKSx6dC5pbnRlcmFjdGlvbiYmKHp0LmludGVyYWN0aW9uPW51bGwpfSxcImludGVyYWN0aW9uczpzdG9wXCI6enQuc3RvcCxcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQpe3JldHVybiB6dC5vbkludGVyYWN0aW9uTW92ZSh0KX19fTtSdC5kZWZhdWx0PVh0O3ZhciBZdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoWXQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWXQud2Fybk9uY2U9ZnVuY3Rpb24odCxuKXt2YXIgcj0hMTtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gcnx8KGUud2luZG93LmNvbnNvbGUud2FybihuKSxyPSEwKSx0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX19LFl0LmNvcHlBY3Rpb249ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5uYW1lPWUubmFtZSx0LmF4aXM9ZS5heGlzLHQuZWRnZXM9ZS5lZGdlcyx0fSxZdC5zaWduPXZvaWQgMCxZdC5zaWduPWZ1bmN0aW9uKHQpe3JldHVybiB0Pj0wPzE6LTF9O3ZhciBCdD17fTtmdW5jdGlvbiBXdCh0KXtyZXR1cm4gaS5kZWZhdWx0LmJvb2wodCk/KHRoaXMub3B0aW9ucy5zdHlsZUN1cnNvcj10LHRoaXMpOm51bGw9PT10PyhkZWxldGUgdGhpcy5vcHRpb25zLnN0eWxlQ3Vyc29yLHRoaXMpOnRoaXMub3B0aW9ucy5zdHlsZUN1cnNvcn1mdW5jdGlvbiBMdCh0KXtyZXR1cm4gaS5kZWZhdWx0LmZ1bmModCk/KHRoaXMub3B0aW9ucy5hY3Rpb25DaGVja2VyPXQsdGhpcyk6bnVsbD09PXQ/KGRlbGV0ZSB0aGlzLm9wdGlvbnMuYWN0aW9uQ2hlY2tlcix0aGlzKTp0aGlzLm9wdGlvbnMuYWN0aW9uQ2hlY2tlcn1PYmplY3QuZGVmaW5lUHJvcGVydHkoQnQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQnQuZGVmYXVsdD12b2lkIDA7dmFyIFV0PXtpZDpcImF1dG8tc3RhcnQvaW50ZXJhY3RhYmxlTWV0aG9kc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5JbnRlcmFjdGFibGU7ZS5wcm90b3R5cGUuZ2V0QWN0aW9uPWZ1bmN0aW9uKGUsbixyLG8pe3ZhciBpPWZ1bmN0aW9uKHQsZSxuLHIsbyl7dmFyIGk9dC5nZXRSZWN0KHIpLGE9e2FjdGlvbjpudWxsLGludGVyYWN0YWJsZTp0LGludGVyYWN0aW9uOm4sZWxlbWVudDpyLHJlY3Q6aSxidXR0b25zOmUuYnV0dG9uc3x8ezA6MSwxOjQsMzo4LDQ6MTZ9W2UuYnV0dG9uXX07cmV0dXJuIG8uZmlyZShcImF1dG8tc3RhcnQ6Y2hlY2tcIixhKSxhLmFjdGlvbn0odGhpcyxuLHIsbyx0KTtyZXR1cm4gdGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXI/dGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXIoZSxuLGksdGhpcyxvLHIpOml9LGUucHJvdG90eXBlLmlnbm9yZUZyb209KDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fYmFja0NvbXBhdE9wdGlvbihcImlnbm9yZUZyb21cIix0KX0pLFwiSW50ZXJhY3RhYmxlLmlnbm9yZUZyb20oKSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgSW50ZXJhY3RibGUuZHJhZ2dhYmxlKHtpZ25vcmVGcm9tOiBuZXdWYWx1ZX0pLlwiKSxlLnByb3RvdHlwZS5hbGxvd0Zyb209KDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fYmFja0NvbXBhdE9wdGlvbihcImFsbG93RnJvbVwiLHQpfSksXCJJbnRlcmFjdGFibGUuYWxsb3dGcm9tKCkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIEludGVyYWN0YmxlLmRyYWdnYWJsZSh7YWxsb3dGcm9tOiBuZXdWYWx1ZX0pLlwiKSxlLnByb3RvdHlwZS5hY3Rpb25DaGVja2VyPUx0LGUucHJvdG90eXBlLnN0eWxlQ3Vyc29yPVd0fX07QnQuZGVmYXVsdD1VdDt2YXIgVnQ9e307ZnVuY3Rpb24gTnQodCxlLG4scixvKXtyZXR1cm4gZS50ZXN0SWdub3JlQWxsb3coZS5vcHRpb25zW3QubmFtZV0sbixyKSYmZS5vcHRpb25zW3QubmFtZV0uZW5hYmxlZCYmSHQoZSxuLHQsbyk/dDpudWxsfWZ1bmN0aW9uIHF0KHQsZSxuLHIsbyxpLGEpe2Zvcih2YXIgcz0wLGw9ci5sZW5ndGg7czxsO3MrKyl7dmFyIHU9cltzXSxjPW9bc10sZj11LmdldEFjdGlvbihlLG4sdCxjKTtpZihmKXt2YXIgZD1OdChmLHUsYyxpLGEpO2lmKGQpcmV0dXJue2FjdGlvbjpkLGludGVyYWN0YWJsZTp1LGVsZW1lbnQ6Y319fXJldHVybnthY3Rpb246bnVsbCxpbnRlcmFjdGFibGU6bnVsbCxlbGVtZW50Om51bGx9fWZ1bmN0aW9uICR0KHQsZSxuLHIsbyl7dmFyIGE9W10scz1bXSxsPXI7ZnVuY3Rpb24gdSh0KXthLnB1c2godCkscy5wdXNoKGwpfWZvcig7aS5kZWZhdWx0LmVsZW1lbnQobCk7KXthPVtdLHM9W10sby5pbnRlcmFjdGFibGVzLmZvckVhY2hNYXRjaChsLHUpO3ZhciBjPXF0KHQsZSxuLGEscyxyLG8pO2lmKGMuYWN0aW9uJiYhYy5pbnRlcmFjdGFibGUub3B0aW9uc1tjLmFjdGlvbi5uYW1lXS5tYW51YWxTdGFydClyZXR1cm4gYztsPV8ucGFyZW50Tm9kZShsKX1yZXR1cm57YWN0aW9uOm51bGwsaW50ZXJhY3RhYmxlOm51bGwsZWxlbWVudDpudWxsfX1mdW5jdGlvbiBHdCh0LGUsbil7dmFyIHI9ZS5hY3Rpb24sbz1lLmludGVyYWN0YWJsZSxpPWUuZWxlbWVudDtyPXJ8fHtuYW1lOm51bGx9LHQuaW50ZXJhY3RhYmxlPW8sdC5lbGVtZW50PWksKDAsWXQuY29weUFjdGlvbikodC5wcmVwYXJlZCxyKSx0LnJlY3Q9byYmci5uYW1lP28uZ2V0UmVjdChpKTpudWxsLEp0KHQsbiksbi5maXJlKFwiYXV0b1N0YXJ0OnByZXBhcmVkXCIse2ludGVyYWN0aW9uOnR9KX1mdW5jdGlvbiBIdCh0LGUsbixyKXt2YXIgbz10Lm9wdGlvbnMsaT1vW24ubmFtZV0ubWF4LGE9b1tuLm5hbWVdLm1heFBlckVsZW1lbnQscz1yLmF1dG9TdGFydC5tYXhJbnRlcmFjdGlvbnMsbD0wLHU9MCxjPTA7aWYoIShpJiZhJiZzKSlyZXR1cm4hMTtmb3IodmFyIGY9MDtmPHIuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO2YrKyl7dmFyIGQ9ci5pbnRlcmFjdGlvbnMubGlzdFtmXSxwPWQucHJlcGFyZWQubmFtZTtpZihkLmludGVyYWN0aW5nKCkpe2lmKCsrbD49cylyZXR1cm4hMTtpZihkLmludGVyYWN0YWJsZT09PXQpe2lmKCh1Kz1wPT09bi5uYW1lPzE6MCk+PWkpcmV0dXJuITE7aWYoZC5lbGVtZW50PT09ZSYmKGMrKyxwPT09bi5uYW1lJiZjPj1hKSlyZXR1cm4hMX19fXJldHVybiBzPjB9ZnVuY3Rpb24gS3QodCxlKXtyZXR1cm4gaS5kZWZhdWx0Lm51bWJlcih0KT8oZS5hdXRvU3RhcnQubWF4SW50ZXJhY3Rpb25zPXQsdGhpcyk6ZS5hdXRvU3RhcnQubWF4SW50ZXJhY3Rpb25zfWZ1bmN0aW9uIFp0KHQsZSxuKXt2YXIgcj1uLmF1dG9TdGFydC5jdXJzb3JFbGVtZW50O3ImJnIhPT10JiYoci5zdHlsZS5jdXJzb3I9XCJcIiksdC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5jdXJzb3I9ZSx0LnN0eWxlLmN1cnNvcj1lLG4uYXV0b1N0YXJ0LmN1cnNvckVsZW1lbnQ9ZT90Om51bGx9ZnVuY3Rpb24gSnQodCxlKXt2YXIgbj10LmludGVyYWN0YWJsZSxyPXQuZWxlbWVudCxvPXQucHJlcGFyZWQ7aWYoXCJtb3VzZVwiPT09dC5wb2ludGVyVHlwZSYmbiYmbi5vcHRpb25zLnN0eWxlQ3Vyc29yKXt2YXIgYT1cIlwiO2lmKG8ubmFtZSl7dmFyIHM9bi5vcHRpb25zW28ubmFtZV0uY3Vyc29yQ2hlY2tlcjthPWkuZGVmYXVsdC5mdW5jKHMpP3MobyxuLHIsdC5faW50ZXJhY3RpbmcpOmUuYWN0aW9ucy5tYXBbby5uYW1lXS5nZXRDdXJzb3Iobyl9WnQodC5lbGVtZW50LGF8fFwiXCIsZSl9ZWxzZSBlLmF1dG9TdGFydC5jdXJzb3JFbGVtZW50JiZadChlLmF1dG9TdGFydC5jdXJzb3JFbGVtZW50LFwiXCIsZSl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFZ0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFZ0LmRlZmF1bHQ9dm9pZCAwO3ZhciBRdD17aWQ6XCJhdXRvLXN0YXJ0L2Jhc2VcIixiZWZvcmU6W1wiYWN0aW9uc1wiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RTdGF0aWMsbj10LmRlZmF1bHRzO3QudXNlUGx1Z2luKEJ0LmRlZmF1bHQpLG4uYmFzZS5hY3Rpb25DaGVja2VyPW51bGwsbi5iYXNlLnN0eWxlQ3Vyc29yPSEwLCgwLGouZGVmYXVsdCkobi5wZXJBY3Rpb24se21hbnVhbFN0YXJ0OiExLG1heDoxLzAsbWF4UGVyRWxlbWVudDoxLGFsbG93RnJvbTpudWxsLGlnbm9yZUZyb206bnVsbCxtb3VzZUJ1dHRvbnM6MX0pLGUubWF4SW50ZXJhY3Rpb25zPWZ1bmN0aW9uKGUpe3JldHVybiBLdChlLHQpfSx0LmF1dG9TdGFydD17bWF4SW50ZXJhY3Rpb25zOjEvMCx3aXRoaW5JbnRlcmFjdGlvbkxpbWl0Okh0LGN1cnNvckVsZW1lbnQ6bnVsbH19LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6ZG93blwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0O24uaW50ZXJhY3RpbmcoKXx8R3QobiwkdChuLHIsbyxpLGUpLGUpfSxcImludGVyYWN0aW9uczptb3ZlXCI6ZnVuY3Rpb24odCxlKXshZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQ7XCJtb3VzZVwiIT09bi5wb2ludGVyVHlwZXx8bi5wb2ludGVySXNEb3dufHxuLmludGVyYWN0aW5nKCl8fEd0KG4sJHQobixyLG8saSxlKSxlKX0odCxlKSxmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb247aWYobi5wb2ludGVySXNEb3duJiYhbi5pbnRlcmFjdGluZygpJiZuLnBvaW50ZXJXYXNNb3ZlZCYmbi5wcmVwYXJlZC5uYW1lKXtlLmZpcmUoXCJhdXRvU3RhcnQ6YmVmb3JlLXN0YXJ0XCIsdCk7dmFyIHI9bi5pbnRlcmFjdGFibGUsbz1uLnByZXBhcmVkLm5hbWU7byYmciYmKHIub3B0aW9uc1tvXS5tYW51YWxTdGFydHx8IUh0KHIsbi5lbGVtZW50LG4ucHJlcGFyZWQsZSk/bi5zdG9wKCk6KG4uc3RhcnQobi5wcmVwYXJlZCxyLG4uZWxlbWVudCksSnQobixlKSkpfX0odCxlKX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPW4uaW50ZXJhY3RhYmxlO3ImJnIub3B0aW9ucy5zdHlsZUN1cnNvciYmWnQobi5lbGVtZW50LFwiXCIsZSl9fSxtYXhJbnRlcmFjdGlvbnM6S3Qsd2l0aGluSW50ZXJhY3Rpb25MaW1pdDpIdCx2YWxpZGF0ZUFjdGlvbjpOdH07VnQuZGVmYXVsdD1RdDt2YXIgdGU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHRlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHRlLmRlZmF1bHQ9dm9pZCAwO3ZhciBlZT17aWQ6XCJhdXRvLXN0YXJ0L2RyYWdBeGlzXCIsbGlzdGVuZXJzOntcImF1dG9TdGFydDpiZWZvcmUtc3RhcnRcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmV2ZW50VGFyZ2V0LG89dC5keCxhPXQuZHk7aWYoXCJkcmFnXCI9PT1uLnByZXBhcmVkLm5hbWUpe3ZhciBzPU1hdGguYWJzKG8pLGw9TWF0aC5hYnMoYSksdT1uLmludGVyYWN0YWJsZS5vcHRpb25zLmRyYWcsYz11LnN0YXJ0QXhpcyxmPXM+bD9cInhcIjpzPGw/XCJ5XCI6XCJ4eVwiO2lmKG4ucHJlcGFyZWQuYXhpcz1cInN0YXJ0XCI9PT11LmxvY2tBeGlzP2ZbMF06dS5sb2NrQXhpcyxcInh5XCIhPT1mJiZcInh5XCIhPT1jJiZjIT09Zil7bi5wcmVwYXJlZC5uYW1lPW51bGw7Zm9yKHZhciBkPXIscD1mdW5jdGlvbih0KXtpZih0IT09bi5pbnRlcmFjdGFibGUpe3ZhciBvPW4uaW50ZXJhY3RhYmxlLm9wdGlvbnMuZHJhZztpZighby5tYW51YWxTdGFydCYmdC50ZXN0SWdub3JlQWxsb3cobyxkLHIpKXt2YXIgaT10LmdldEFjdGlvbihuLmRvd25Qb2ludGVyLG4uZG93bkV2ZW50LG4sZCk7aWYoaSYmXCJkcmFnXCI9PT1pLm5hbWUmJmZ1bmN0aW9uKHQsZSl7aWYoIWUpcmV0dXJuITE7dmFyIG49ZS5vcHRpb25zLmRyYWcuc3RhcnRBeGlzO3JldHVyblwieHlcIj09PXR8fFwieHlcIj09PW58fG49PT10fShmLHQpJiZWdC5kZWZhdWx0LnZhbGlkYXRlQWN0aW9uKGksdCxkLHIsZSkpcmV0dXJuIHR9fX07aS5kZWZhdWx0LmVsZW1lbnQoZCk7KXt2YXIgdj1lLmludGVyYWN0YWJsZXMuZm9yRWFjaE1hdGNoKGQscCk7aWYodil7bi5wcmVwYXJlZC5uYW1lPVwiZHJhZ1wiLG4uaW50ZXJhY3RhYmxlPXYsbi5lbGVtZW50PWQ7YnJlYWt9ZD0oMCxfLnBhcmVudE5vZGUpKGQpfX19fX19O3RlLmRlZmF1bHQ9ZWU7dmFyIG5lPXt9O2Z1bmN0aW9uIHJlKHQpe3ZhciBlPXQucHJlcGFyZWQmJnQucHJlcGFyZWQubmFtZTtpZighZSlyZXR1cm4gbnVsbDt2YXIgbj10LmludGVyYWN0YWJsZS5vcHRpb25zO3JldHVybiBuW2VdLmhvbGR8fG5bZV0uZGVsYXl9T2JqZWN0LmRlZmluZVByb3BlcnR5KG5lLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLG5lLmRlZmF1bHQ9dm9pZCAwO3ZhciBvZT17aWQ6XCJhdXRvLXN0YXJ0L2hvbGRcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVmYXVsdHM7dC51c2VQbHVnaW4oVnQuZGVmYXVsdCksZS5wZXJBY3Rpb24uaG9sZD0wLGUucGVyQWN0aW9uLmRlbGF5PTB9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dC5pbnRlcmFjdGlvbi5hdXRvU3RhcnRIb2xkVGltZXI9bnVsbH0sXCJhdXRvU3RhcnQ6cHJlcGFyZWRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49cmUoZSk7bj4wJiYoZS5hdXRvU3RhcnRIb2xkVGltZXI9c2V0VGltZW91dCgoZnVuY3Rpb24oKXtlLnN0YXJ0KGUucHJlcGFyZWQsZS5pbnRlcmFjdGFibGUsZS5lbGVtZW50KX0pLG4pKX0sXCJpbnRlcmFjdGlvbnM6bW92ZVwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmR1cGxpY2F0ZTtlLmF1dG9TdGFydEhvbGRUaW1lciYmZS5wb2ludGVyV2FzTW92ZWQmJiFuJiYoY2xlYXJUaW1lb3V0KGUuYXV0b1N0YXJ0SG9sZFRpbWVyKSxlLmF1dG9TdGFydEhvbGRUaW1lcj1udWxsKX0sXCJhdXRvU3RhcnQ6YmVmb3JlLXN0YXJ0XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtyZShlKT4wJiYoZS5wcmVwYXJlZC5uYW1lPW51bGwpfX0sZ2V0SG9sZER1cmF0aW9uOnJlfTtuZS5kZWZhdWx0PW9lO3ZhciBpZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoaWUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaWUuZGVmYXVsdD12b2lkIDA7dmFyIGFlPXtpZDpcImF1dG8tc3RhcnRcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3QudXNlUGx1Z2luKFZ0LmRlZmF1bHQpLHQudXNlUGx1Z2luKG5lLmRlZmF1bHQpLHQudXNlUGx1Z2luKHRlLmRlZmF1bHQpfX07aWUuZGVmYXVsdD1hZTt2YXIgc2U9e307ZnVuY3Rpb24gbGUodCl7cmV0dXJuL14oYWx3YXlzfG5ldmVyfGF1dG8pJC8udGVzdCh0KT8odGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0PXQsdGhpcyk6aS5kZWZhdWx0LmJvb2wodCk/KHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdD10P1wiYWx3YXlzXCI6XCJuZXZlclwiLHRoaXMpOnRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdH1mdW5jdGlvbiB1ZSh0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5ldmVudDtlLmludGVyYWN0YWJsZSYmZS5pbnRlcmFjdGFibGUuY2hlY2tBbmRQcmV2ZW50RGVmYXVsdChuKX1mdW5jdGlvbiBjZSh0KXt2YXIgbj10LkludGVyYWN0YWJsZTtuLnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdD1sZSxuLnByb3RvdHlwZS5jaGVja0FuZFByZXZlbnREZWZhdWx0PWZ1bmN0aW9uKG4pe3JldHVybiBmdW5jdGlvbih0LG4scil7dmFyIG89dC5vcHRpb25zLnByZXZlbnREZWZhdWx0O2lmKFwibmV2ZXJcIiE9PW8paWYoXCJhbHdheXNcIiE9PW8pe2lmKG4uZXZlbnRzLnN1cHBvcnRzUGFzc2l2ZSYmL150b3VjaChzdGFydHxtb3ZlKSQvLnRlc3Qoci50eXBlKSl7dmFyIGE9KDAsZS5nZXRXaW5kb3cpKHIudGFyZ2V0KS5kb2N1bWVudCxzPW4uZ2V0RG9jT3B0aW9ucyhhKTtpZighc3x8IXMuZXZlbnRzfHwhMSE9PXMuZXZlbnRzLnBhc3NpdmUpcmV0dXJufS9eKG1vdXNlfHBvaW50ZXJ8dG91Y2gpKihkb3dufHN0YXJ0KS9pLnRlc3Qoci50eXBlKXx8aS5kZWZhdWx0LmVsZW1lbnQoci50YXJnZXQpJiYoMCxfLm1hdGNoZXNTZWxlY3Rvcikoci50YXJnZXQsXCJpbnB1dCxzZWxlY3QsdGV4dGFyZWEsW2NvbnRlbnRlZGl0YWJsZT10cnVlXSxbY29udGVudGVkaXRhYmxlPXRydWVdICpcIil8fHIucHJldmVudERlZmF1bHQoKX1lbHNlIHIucHJldmVudERlZmF1bHQoKX0odGhpcyx0LG4pfSx0LmludGVyYWN0aW9ucy5kb2NFdmVudHMucHVzaCh7dHlwZTpcImRyYWdzdGFydFwiLGxpc3RlbmVyOmZ1bmN0aW9uKGUpe2Zvcih2YXIgbj0wO248dC5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7bisrKXt2YXIgcj10LmludGVyYWN0aW9ucy5saXN0W25dO2lmKHIuZWxlbWVudCYmKHIuZWxlbWVudD09PWUudGFyZ2V0fHwoMCxfLm5vZGVDb250YWlucykoci5lbGVtZW50LGUudGFyZ2V0KSkpcmV0dXJuIHZvaWQgci5pbnRlcmFjdGFibGUuY2hlY2tBbmRQcmV2ZW50RGVmYXVsdChlKX19fSl9T2JqZWN0LmRlZmluZVByb3BlcnR5KHNlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHNlLmluc3RhbGw9Y2Usc2UuZGVmYXVsdD12b2lkIDA7dmFyIGZlPXtpZDpcImNvcmUvaW50ZXJhY3RhYmxlUHJldmVudERlZmF1bHRcIixpbnN0YWxsOmNlLGxpc3RlbmVyczpbXCJkb3duXCIsXCJtb3ZlXCIsXCJ1cFwiLFwiY2FuY2VsXCJdLnJlZHVjZSgoZnVuY3Rpb24odCxlKXtyZXR1cm4gdFtcImludGVyYWN0aW9uczpcIi5jb25jYXQoZSldPXVlLHR9KSx7fSl9O3NlLmRlZmF1bHQ9ZmU7dmFyIGRlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShkZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxkZS5kZWZhdWx0PXZvaWQgMCxkZS5kZWZhdWx0PXt9O3ZhciBwZSx2ZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodmUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdmUuZGVmYXVsdD12b2lkIDAsZnVuY3Rpb24odCl7dC50b3VjaEFjdGlvbj1cInRvdWNoQWN0aW9uXCIsdC5ib3hTaXppbmc9XCJib3hTaXppbmdcIix0Lm5vTGlzdGVuZXJzPVwibm9MaXN0ZW5lcnNcIn0ocGV8fChwZT17fSkpO3BlLnRvdWNoQWN0aW9uLHBlLmJveFNpemluZyxwZS5ub0xpc3RlbmVyczt2YXIgaGU9e2lkOlwiZGV2LXRvb2xzXCIsaW5zdGFsbDpmdW5jdGlvbigpe319O3ZlLmRlZmF1bHQ9aGU7dmFyIGdlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShnZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxnZS5kZWZhdWx0PWZ1bmN0aW9uIHQoZSl7dmFyIG49e307Zm9yKHZhciByIGluIGUpe3ZhciBvPWVbcl07aS5kZWZhdWx0LnBsYWluT2JqZWN0KG8pP25bcl09dChvKTppLmRlZmF1bHQuYXJyYXkobyk/bltyXT1aLmZyb20obyk6bltyXT1vfXJldHVybiBufTt2YXIgeWU9e307ZnVuY3Rpb24gbWUodCxlKXtyZXR1cm4gZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0odCl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fSh0LGUpfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBiZSh0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/YmUodCxlKTp2b2lkIDB9fSh0LGUpfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCl9ZnVuY3Rpb24gYmUodCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfWZ1bmN0aW9uIHhlKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiB3ZSh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHllLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHllLmdldFJlY3RPZmZzZXQ9T2UseWUuZGVmYXVsdD12b2lkIDA7dmFyIF9lPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLHdlKHRoaXMsXCJzdGF0ZXNcIixbXSksd2UodGhpcyxcInN0YXJ0T2Zmc2V0XCIse2xlZnQ6MCxyaWdodDowLHRvcDowLGJvdHRvbTowfSksd2UodGhpcyxcInN0YXJ0RGVsdGFcIix2b2lkIDApLHdlKHRoaXMsXCJyZXN1bHRcIix2b2lkIDApLHdlKHRoaXMsXCJlbmRSZXN1bHRcIix2b2lkIDApLHdlKHRoaXMsXCJlZGdlc1wiLHZvaWQgMCksd2UodGhpcyxcImludGVyYWN0aW9uXCIsdm9pZCAwKSx0aGlzLmludGVyYWN0aW9uPWUsdGhpcy5yZXN1bHQ9UGUoKX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJzdGFydFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5waGFzZSxyPXRoaXMuaW50ZXJhY3Rpb24sbz1mdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0YWJsZS5vcHRpb25zW3QucHJlcGFyZWQubmFtZV0sbj1lLm1vZGlmaWVycztyZXR1cm4gbiYmbi5sZW5ndGg/bjpbXCJzbmFwXCIsXCJzbmFwU2l6ZVwiLFwic25hcEVkZ2VzXCIsXCJyZXN0cmljdFwiLFwicmVzdHJpY3RFZGdlc1wiLFwicmVzdHJpY3RTaXplXCJdLm1hcCgoZnVuY3Rpb24odCl7dmFyIG49ZVt0XTtyZXR1cm4gbiYmbi5lbmFibGVkJiZ7b3B0aW9uczpuLG1ldGhvZHM6bi5fbWV0aG9kc319KSkuZmlsdGVyKChmdW5jdGlvbih0KXtyZXR1cm4hIXR9KSl9KHIpO3RoaXMucHJlcGFyZVN0YXRlcyhvKSx0aGlzLmVkZ2VzPSgwLGouZGVmYXVsdCkoe30sci5lZGdlcyksdGhpcy5zdGFydE9mZnNldD1PZShyLnJlY3QsZSksdGhpcy5zdGFydERlbHRhPXt4OjAseTowfTt2YXIgaT10aGlzLmZpbGxBcmcoe3BoYXNlOm4scGFnZUNvb3JkczplLHByZUVuZDohMX0pO3JldHVybiB0aGlzLnJlc3VsdD1QZSgpLHRoaXMuc3RhcnRBbGwoaSksdGhpcy5yZXN1bHQ9dGhpcy5zZXRBbGwoaSl9fSx7a2V5OlwiZmlsbEFyZ1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuaW50ZXJhY3Rpb247cmV0dXJuIHQuaW50ZXJhY3Rpb249ZSx0LmludGVyYWN0YWJsZT1lLmludGVyYWN0YWJsZSx0LmVsZW1lbnQ9ZS5lbGVtZW50LHQucmVjdD10LnJlY3R8fGUucmVjdCx0LmVkZ2VzPXRoaXMuZWRnZXMsdC5zdGFydE9mZnNldD10aGlzLnN0YXJ0T2Zmc2V0LHR9fSx7a2V5Olwic3RhcnRBbGxcIix2YWx1ZTpmdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHRoaXMuc3RhdGVzLmxlbmd0aDtlKyspe3ZhciBuPXRoaXMuc3RhdGVzW2VdO24ubWV0aG9kcy5zdGFydCYmKHQuc3RhdGU9bixuLm1ldGhvZHMuc3RhcnQodCkpfX19LHtrZXk6XCJzZXRBbGxcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LnBoYXNlLG49dC5wcmVFbmQscj10LnNraXBNb2RpZmllcnMsbz10LnJlY3Q7dC5jb29yZHM9KDAsai5kZWZhdWx0KSh7fSx0LnBhZ2VDb29yZHMpLHQucmVjdD0oMCxqLmRlZmF1bHQpKHt9LG8pO2Zvcih2YXIgaT1yP3RoaXMuc3RhdGVzLnNsaWNlKHIpOnRoaXMuc3RhdGVzLGE9UGUodC5jb29yZHMsdC5yZWN0KSxzPTA7czxpLmxlbmd0aDtzKyspe3ZhciBsLHU9aVtzXSxjPXUub3B0aW9ucyxmPSgwLGouZGVmYXVsdCkoe30sdC5jb29yZHMpLGQ9bnVsbDtudWxsIT0obD11Lm1ldGhvZHMpJiZsLnNldCYmdGhpcy5zaG91bGREbyhjLG4sZSkmJih0LnN0YXRlPXUsZD11Lm1ldGhvZHMuc2V0KHQpLGsuYWRkRWRnZXModGhpcy5pbnRlcmFjdGlvbi5lZGdlcyx0LnJlY3Qse3g6dC5jb29yZHMueC1mLngseTp0LmNvb3Jkcy55LWYueX0pKSxhLmV2ZW50UHJvcHMucHVzaChkKX1hLmRlbHRhLng9dC5jb29yZHMueC10LnBhZ2VDb29yZHMueCxhLmRlbHRhLnk9dC5jb29yZHMueS10LnBhZ2VDb29yZHMueSxhLnJlY3REZWx0YS5sZWZ0PXQucmVjdC5sZWZ0LW8ubGVmdCxhLnJlY3REZWx0YS5yaWdodD10LnJlY3QucmlnaHQtby5yaWdodCxhLnJlY3REZWx0YS50b3A9dC5yZWN0LnRvcC1vLnRvcCxhLnJlY3REZWx0YS5ib3R0b209dC5yZWN0LmJvdHRvbS1vLmJvdHRvbTt2YXIgcD10aGlzLnJlc3VsdC5jb29yZHMsdj10aGlzLnJlc3VsdC5yZWN0O2lmKHAmJnYpe3ZhciBoPWEucmVjdC5sZWZ0IT09di5sZWZ0fHxhLnJlY3QucmlnaHQhPT12LnJpZ2h0fHxhLnJlY3QudG9wIT09di50b3B8fGEucmVjdC5ib3R0b20hPT12LmJvdHRvbTthLmNoYW5nZWQ9aHx8cC54IT09YS5jb29yZHMueHx8cC55IT09YS5jb29yZHMueX1yZXR1cm4gYX19LHtrZXk6XCJhcHBseVRvSW50ZXJhY3Rpb25cIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmludGVyYWN0aW9uLG49dC5waGFzZSxyPWUuY29vcmRzLmN1cixvPWUuY29vcmRzLnN0YXJ0LGk9dGhpcy5yZXN1bHQsYT10aGlzLnN0YXJ0RGVsdGEscz1pLmRlbHRhO1wic3RhcnRcIj09PW4mJigwLGouZGVmYXVsdCkodGhpcy5zdGFydERlbHRhLGkuZGVsdGEpO2Zvcih2YXIgbD0wO2w8W1tvLGFdLFtyLHNdXS5sZW5ndGg7bCsrKXt2YXIgdT1tZShbW28sYV0sW3Isc11dW2xdLDIpLGM9dVswXSxmPXVbMV07Yy5wYWdlLngrPWYueCxjLnBhZ2UueSs9Zi55LGMuY2xpZW50LngrPWYueCxjLmNsaWVudC55Kz1mLnl9dmFyIGQ9dGhpcy5yZXN1bHQucmVjdERlbHRhLHA9dC5yZWN0fHxlLnJlY3Q7cC5sZWZ0Kz1kLmxlZnQscC5yaWdodCs9ZC5yaWdodCxwLnRvcCs9ZC50b3AscC5ib3R0b20rPWQuYm90dG9tLHAud2lkdGg9cC5yaWdodC1wLmxlZnQscC5oZWlnaHQ9cC5ib3R0b20tcC50b3B9fSx7a2V5Olwic2V0QW5kQXBwbHlcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmludGVyYWN0aW9uLG49dC5waGFzZSxyPXQucHJlRW5kLG89dC5za2lwTW9kaWZpZXJzLGk9dGhpcy5zZXRBbGwodGhpcy5maWxsQXJnKHtwcmVFbmQ6cixwaGFzZTpuLHBhZ2VDb29yZHM6dC5tb2RpZmllZENvb3Jkc3x8ZS5jb29yZHMuY3VyLnBhZ2V9KSk7aWYodGhpcy5yZXN1bHQ9aSwhaS5jaGFuZ2VkJiYoIW98fG88dGhpcy5zdGF0ZXMubGVuZ3RoKSYmZS5pbnRlcmFjdGluZygpKXJldHVybiExO2lmKHQubW9kaWZpZWRDb29yZHMpe3ZhciBhPWUuY29vcmRzLmN1ci5wYWdlLHM9e3g6dC5tb2RpZmllZENvb3Jkcy54LWEueCx5OnQubW9kaWZpZWRDb29yZHMueS1hLnl9O2kuY29vcmRzLngrPXMueCxpLmNvb3Jkcy55Kz1zLnksaS5kZWx0YS54Kz1zLngsaS5kZWx0YS55Kz1zLnl9dGhpcy5hcHBseVRvSW50ZXJhY3Rpb24odCl9fSx7a2V5OlwiYmVmb3JlRW5kXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZXZlbnQscj10aGlzLnN0YXRlcztpZihyJiZyLmxlbmd0aCl7Zm9yKHZhciBvPSExLGk9MDtpPHIubGVuZ3RoO2krKyl7dmFyIGE9cltpXTt0LnN0YXRlPWE7dmFyIHM9YS5vcHRpb25zLGw9YS5tZXRob2RzLHU9bC5iZWZvcmVFbmQmJmwuYmVmb3JlRW5kKHQpO2lmKHUpcmV0dXJuIHRoaXMuZW5kUmVzdWx0PXUsITE7bz1vfHwhbyYmdGhpcy5zaG91bGREbyhzLCEwLHQucGhhc2UsITApfW8mJmUubW92ZSh7ZXZlbnQ6bixwcmVFbmQ6ITB9KX19fSx7a2V5Olwic3RvcFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247aWYodGhpcy5zdGF0ZXMmJnRoaXMuc3RhdGVzLmxlbmd0aCl7dmFyIG49KDAsai5kZWZhdWx0KSh7c3RhdGVzOnRoaXMuc3RhdGVzLGludGVyYWN0YWJsZTplLmludGVyYWN0YWJsZSxlbGVtZW50OmUuZWxlbWVudCxyZWN0Om51bGx9LHQpO3RoaXMuZmlsbEFyZyhuKTtmb3IodmFyIHI9MDtyPHRoaXMuc3RhdGVzLmxlbmd0aDtyKyspe3ZhciBvPXRoaXMuc3RhdGVzW3JdO24uc3RhdGU9byxvLm1ldGhvZHMuc3RvcCYmby5tZXRob2RzLnN0b3Aobil9dGhpcy5zdGF0ZXM9bnVsbCx0aGlzLmVuZFJlc3VsdD1udWxsfX19LHtrZXk6XCJwcmVwYXJlU3RhdGVzXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5zdGF0ZXM9W107Zm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspe3ZhciBuPXRbZV0scj1uLm9wdGlvbnMsbz1uLm1ldGhvZHMsaT1uLm5hbWU7dGhpcy5zdGF0ZXMucHVzaCh7b3B0aW9uczpyLG1ldGhvZHM6byxpbmRleDplLG5hbWU6aX0pfXJldHVybiB0aGlzLnN0YXRlc319LHtrZXk6XCJyZXN0b3JlSW50ZXJhY3Rpb25Db29yZHNcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49ZS5jb29yZHMscj1lLnJlY3Qsbz1lLm1vZGlmaWNhdGlvbjtpZihvLnJlc3VsdCl7Zm9yKHZhciBpPW8uc3RhcnREZWx0YSxhPW8ucmVzdWx0LHM9YS5kZWx0YSxsPWEucmVjdERlbHRhLHU9W1tuLnN0YXJ0LGldLFtuLmN1cixzXV0sYz0wO2M8dS5sZW5ndGg7YysrKXt2YXIgZj1tZSh1W2NdLDIpLGQ9ZlswXSxwPWZbMV07ZC5wYWdlLngtPXAueCxkLnBhZ2UueS09cC55LGQuY2xpZW50LngtPXAueCxkLmNsaWVudC55LT1wLnl9ci5sZWZ0LT1sLmxlZnQsci5yaWdodC09bC5yaWdodCxyLnRvcC09bC50b3Asci5ib3R0b20tPWwuYm90dG9tfX19LHtrZXk6XCJzaG91bGREb1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuLHIpe3JldHVybiEoIXR8fCExPT09dC5lbmFibGVkfHxyJiYhdC5lbmRPbmx5fHx0LmVuZE9ubHkmJiFlfHxcInN0YXJ0XCI9PT1uJiYhdC5zZXRTdGFydCl9fSx7a2V5OlwiY29weUZyb21cIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLnN0YXJ0T2Zmc2V0PXQuc3RhcnRPZmZzZXQsdGhpcy5zdGFydERlbHRhPXQuc3RhcnREZWx0YSx0aGlzLmVkZ2VzPXQuZWRnZXMsdGhpcy5zdGF0ZXM9dC5zdGF0ZXMubWFwKChmdW5jdGlvbih0KXtyZXR1cm4oMCxnZS5kZWZhdWx0KSh0KX0pKSx0aGlzLnJlc3VsdD1QZSgoMCxqLmRlZmF1bHQpKHt9LHQucmVzdWx0LmNvb3JkcyksKDAsai5kZWZhdWx0KSh7fSx0LnJlc3VsdC5yZWN0KSl9fSx7a2V5OlwiZGVzdHJveVwiLHZhbHVlOmZ1bmN0aW9uKCl7Zm9yKHZhciB0IGluIHRoaXMpdGhpc1t0XT1udWxsfX1dKSYmeGUoZS5wcm90b3R5cGUsbiksdH0oKTtmdW5jdGlvbiBQZSh0LGUpe3JldHVybntyZWN0OmUsY29vcmRzOnQsZGVsdGE6e3g6MCx5OjB9LHJlY3REZWx0YTp7bGVmdDowLHJpZ2h0OjAsdG9wOjAsYm90dG9tOjB9LGV2ZW50UHJvcHM6W10sY2hhbmdlZDohMH19ZnVuY3Rpb24gT2UodCxlKXtyZXR1cm4gdD97bGVmdDplLngtdC5sZWZ0LHRvcDplLnktdC50b3AscmlnaHQ6dC5yaWdodC1lLngsYm90dG9tOnQuYm90dG9tLWUueX06e2xlZnQ6MCx0b3A6MCxyaWdodDowLGJvdHRvbTowfX15ZS5kZWZhdWx0PV9lO3ZhciBTZT17fTtmdW5jdGlvbiBFZSh0KXt2YXIgZT10LmlFdmVudCxuPXQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnJlc3VsdDtuJiYoZS5tb2RpZmllcnM9bi5ldmVudFByb3BzKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoU2UsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksU2UubWFrZU1vZGlmaWVyPWZ1bmN0aW9uKHQsZSl7dmFyIG49dC5kZWZhdWx0cyxyPXtzdGFydDp0LnN0YXJ0LHNldDp0LnNldCxiZWZvcmVFbmQ6dC5iZWZvcmVFbmQsc3RvcDp0LnN0b3B9LG89ZnVuY3Rpb24odCl7dmFyIG89dHx8e307Zm9yKHZhciBpIGluIG8uZW5hYmxlZD0hMSE9PW8uZW5hYmxlZCxuKWkgaW4gb3x8KG9baV09bltpXSk7dmFyIGE9e29wdGlvbnM6byxtZXRob2RzOnIsbmFtZTplLGVuYWJsZTpmdW5jdGlvbigpe3JldHVybiBvLmVuYWJsZWQ9ITAsYX0sZGlzYWJsZTpmdW5jdGlvbigpe3JldHVybiBvLmVuYWJsZWQ9ITEsYX19O3JldHVybiBhfTtyZXR1cm4gZSYmXCJzdHJpbmdcIj09dHlwZW9mIGUmJihvLl9kZWZhdWx0cz1uLG8uX21ldGhvZHM9ciksb30sU2UuYWRkRXZlbnRNb2RpZmllcnM9RWUsU2UuZGVmYXVsdD12b2lkIDA7dmFyIFRlPXtpZDpcIm1vZGlmaWVycy9iYXNlXCIsYmVmb3JlOltcImFjdGlvbnNcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt0LmRlZmF1bHRzLnBlckFjdGlvbi5tb2RpZmllcnM9W119LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtlLm1vZGlmaWNhdGlvbj1uZXcgeWUuZGVmYXVsdChlKX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1zdGFydFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uO2Uuc3RhcnQodCx0LmludGVyYWN0aW9uLmNvb3Jkcy5zdGFydC5wYWdlKSx0LmludGVyYWN0aW9uLmVkZ2VzPWUuZWRnZXMsZS5hcHBseVRvSW50ZXJhY3Rpb24odCl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5zZXRBbmRBcHBseSh0KX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1lbmRcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24uYmVmb3JlRW5kKHQpfSxcImludGVyYWN0aW9uczphY3Rpb24tc3RhcnRcIjpFZSxcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOkVlLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1lbmRcIjpFZSxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24ucmVzdG9yZUludGVyYWN0aW9uQ29vcmRzKHQpfSxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tbW92ZVwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN0b3JlSW50ZXJhY3Rpb25Db29yZHModCl9LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24uc3RvcCh0KX19fTtTZS5kZWZhdWx0PVRlO3ZhciBNZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoTWUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksTWUuZGVmYXVsdHM9dm9pZCAwLE1lLmRlZmF1bHRzPXtiYXNlOntwcmV2ZW50RGVmYXVsdDpcImF1dG9cIixkZWx0YVNvdXJjZTpcInBhZ2VcIn0scGVyQWN0aW9uOntlbmFibGVkOiExLG9yaWdpbjp7eDowLHk6MH19LGFjdGlvbnM6e319O3ZhciBqZT17fTtmdW5jdGlvbiBrZSh0KXtyZXR1cm4oa2U9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIEllKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBEZSh0LGUpe3JldHVybihEZT1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gQWUodCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PWtlKGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP1JlKHQpOmV9ZnVuY3Rpb24gUmUodCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9ZnVuY3Rpb24gemUodCl7cmV0dXJuKHplPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1mdW5jdGlvbiBDZSh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KGplLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGplLkludGVyYWN0RXZlbnQ9dm9pZCAwO3ZhciBGZT1mdW5jdGlvbih0KXshZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7dC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLGUmJkRlKHQsZSl9KGEsdCk7dmFyIGUsbixyLG8saT0ocj1hLG89ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LGU9emUocik7aWYobyl7dmFyIG49emUodGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChlLGFyZ3VtZW50cyxuKX1lbHNlIHQ9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIEFlKHRoaXMsdCl9KTtmdW5jdGlvbiBhKHQsZSxuLHIsbyxzLGwpe3ZhciB1OyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsYSksQ2UoUmUodT1pLmNhbGwodGhpcyx0KSksXCJ0YXJnZXRcIix2b2lkIDApLENlKFJlKHUpLFwiY3VycmVudFRhcmdldFwiLHZvaWQgMCksQ2UoUmUodSksXCJyZWxhdGVkVGFyZ2V0XCIsbnVsbCksQ2UoUmUodSksXCJzY3JlZW5YXCIsdm9pZCAwKSxDZShSZSh1KSxcInNjcmVlbllcIix2b2lkIDApLENlKFJlKHUpLFwiYnV0dG9uXCIsdm9pZCAwKSxDZShSZSh1KSxcImJ1dHRvbnNcIix2b2lkIDApLENlKFJlKHUpLFwiY3RybEtleVwiLHZvaWQgMCksQ2UoUmUodSksXCJzaGlmdEtleVwiLHZvaWQgMCksQ2UoUmUodSksXCJhbHRLZXlcIix2b2lkIDApLENlKFJlKHUpLFwibWV0YUtleVwiLHZvaWQgMCksQ2UoUmUodSksXCJwYWdlXCIsdm9pZCAwKSxDZShSZSh1KSxcImNsaWVudFwiLHZvaWQgMCksQ2UoUmUodSksXCJkZWx0YVwiLHZvaWQgMCksQ2UoUmUodSksXCJyZWN0XCIsdm9pZCAwKSxDZShSZSh1KSxcIngwXCIsdm9pZCAwKSxDZShSZSh1KSxcInkwXCIsdm9pZCAwKSxDZShSZSh1KSxcInQwXCIsdm9pZCAwKSxDZShSZSh1KSxcImR0XCIsdm9pZCAwKSxDZShSZSh1KSxcImR1cmF0aW9uXCIsdm9pZCAwKSxDZShSZSh1KSxcImNsaWVudFgwXCIsdm9pZCAwKSxDZShSZSh1KSxcImNsaWVudFkwXCIsdm9pZCAwKSxDZShSZSh1KSxcInZlbG9jaXR5XCIsdm9pZCAwKSxDZShSZSh1KSxcInNwZWVkXCIsdm9pZCAwKSxDZShSZSh1KSxcInN3aXBlXCIsdm9pZCAwKSxDZShSZSh1KSxcInRpbWVTdGFtcFwiLHZvaWQgMCksQ2UoUmUodSksXCJheGVzXCIsdm9pZCAwKSxDZShSZSh1KSxcInByZUVuZFwiLHZvaWQgMCksbz1vfHx0LmVsZW1lbnQ7dmFyIGM9dC5pbnRlcmFjdGFibGUsZj0oYyYmYy5vcHRpb25zfHxNZS5kZWZhdWx0cykuZGVsdGFTb3VyY2UsZD0oMCxBLmRlZmF1bHQpKGMsbyxuKSxwPVwic3RhcnRcIj09PXIsdj1cImVuZFwiPT09cixoPXA/UmUodSk6dC5wcmV2RXZlbnQsZz1wP3QuY29vcmRzLnN0YXJ0OnY/e3BhZ2U6aC5wYWdlLGNsaWVudDpoLmNsaWVudCx0aW1lU3RhbXA6dC5jb29yZHMuY3VyLnRpbWVTdGFtcH06dC5jb29yZHMuY3VyO3JldHVybiB1LnBhZ2U9KDAsai5kZWZhdWx0KSh7fSxnLnBhZ2UpLHUuY2xpZW50PSgwLGouZGVmYXVsdCkoe30sZy5jbGllbnQpLHUucmVjdD0oMCxqLmRlZmF1bHQpKHt9LHQucmVjdCksdS50aW1lU3RhbXA9Zy50aW1lU3RhbXAsdnx8KHUucGFnZS54LT1kLngsdS5wYWdlLnktPWQueSx1LmNsaWVudC54LT1kLngsdS5jbGllbnQueS09ZC55KSx1LmN0cmxLZXk9ZS5jdHJsS2V5LHUuYWx0S2V5PWUuYWx0S2V5LHUuc2hpZnRLZXk9ZS5zaGlmdEtleSx1Lm1ldGFLZXk9ZS5tZXRhS2V5LHUuYnV0dG9uPWUuYnV0dG9uLHUuYnV0dG9ucz1lLmJ1dHRvbnMsdS50YXJnZXQ9byx1LmN1cnJlbnRUYXJnZXQ9byx1LnByZUVuZD1zLHUudHlwZT1sfHxuKyhyfHxcIlwiKSx1LmludGVyYWN0YWJsZT1jLHUudDA9cD90LnBvaW50ZXJzW3QucG9pbnRlcnMubGVuZ3RoLTFdLmRvd25UaW1lOmgudDAsdS54MD10LmNvb3Jkcy5zdGFydC5wYWdlLngtZC54LHUueTA9dC5jb29yZHMuc3RhcnQucGFnZS55LWQueSx1LmNsaWVudFgwPXQuY29vcmRzLnN0YXJ0LmNsaWVudC54LWQueCx1LmNsaWVudFkwPXQuY29vcmRzLnN0YXJ0LmNsaWVudC55LWQueSx1LmRlbHRhPXB8fHY/e3g6MCx5OjB9Ont4OnVbZl0ueC1oW2ZdLngseTp1W2ZdLnktaFtmXS55fSx1LmR0PXQuY29vcmRzLmRlbHRhLnRpbWVTdGFtcCx1LmR1cmF0aW9uPXUudGltZVN0YW1wLXUudDAsdS52ZWxvY2l0eT0oMCxqLmRlZmF1bHQpKHt9LHQuY29vcmRzLnZlbG9jaXR5W2ZdKSx1LnNwZWVkPSgwLEMuZGVmYXVsdCkodS52ZWxvY2l0eS54LHUudmVsb2NpdHkueSksdS5zd2lwZT12fHxcImluZXJ0aWFzdGFydFwiPT09cj91LmdldFN3aXBlKCk6bnVsbCx1fXJldHVybiBlPWEsKG49W3trZXk6XCJnZXRTd2lwZVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5faW50ZXJhY3Rpb247aWYodC5wcmV2RXZlbnQuc3BlZWQ8NjAwfHx0aGlzLnRpbWVTdGFtcC10LnByZXZFdmVudC50aW1lU3RhbXA+MTUwKXJldHVybiBudWxsO3ZhciBlPTE4MCpNYXRoLmF0YW4yKHQucHJldkV2ZW50LnZlbG9jaXR5WSx0LnByZXZFdmVudC52ZWxvY2l0eVgpL01hdGguUEk7ZTwwJiYoZSs9MzYwKTt2YXIgbj0xMTIuNTw9ZSYmZTwyNDcuNSxyPTIwMi41PD1lJiZlPDMzNy41O3JldHVybnt1cDpyLGRvd246IXImJjIyLjU8PWUmJmU8MTU3LjUsbGVmdDpuLHJpZ2h0OiFuJiYoMjkyLjU8PWV8fGU8NjcuNSksYW5nbGU6ZSxzcGVlZDp0LnByZXZFdmVudC5zcGVlZCx2ZWxvY2l0eTp7eDp0LnByZXZFdmVudC52ZWxvY2l0eVgseTp0LnByZXZFdmVudC52ZWxvY2l0eVl9fX19LHtrZXk6XCJwcmV2ZW50RGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQ9dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fSx7a2V5Olwic3RvcFByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19XSkmJkllKGUucHJvdG90eXBlLG4pLGF9KCQuQmFzZUV2ZW50KTtqZS5JbnRlcmFjdEV2ZW50PUZlLE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZlLnByb3RvdHlwZSx7cGFnZVg6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnBhZ2UueH0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMucGFnZS54PXR9fSxwYWdlWTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucGFnZS55fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5wYWdlLnk9dH19LGNsaWVudFg6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNsaWVudC54fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5jbGllbnQueD10fX0sY2xpZW50WTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2xpZW50Lnl9LHNldDpmdW5jdGlvbih0KXt0aGlzLmNsaWVudC55PXR9fSxkeDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGVsdGEueH0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMuZGVsdGEueD10fX0sZHk6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmRlbHRhLnl9LHNldDpmdW5jdGlvbih0KXt0aGlzLmRlbHRhLnk9dH19LHZlbG9jaXR5WDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmVsb2NpdHkueH0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMudmVsb2NpdHkueD10fX0sdmVsb2NpdHlZOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52ZWxvY2l0eS55fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy52ZWxvY2l0eS55PXR9fX0pO3ZhciBYZT17fTtmdW5jdGlvbiBZZSh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KFhlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFhlLlBvaW50ZXJJbmZvPXZvaWQgMCxYZS5Qb2ludGVySW5mbz1mdW5jdGlvbiB0KGUsbixyLG8saSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxZZSh0aGlzLFwiaWRcIix2b2lkIDApLFllKHRoaXMsXCJwb2ludGVyXCIsdm9pZCAwKSxZZSh0aGlzLFwiZXZlbnRcIix2b2lkIDApLFllKHRoaXMsXCJkb3duVGltZVwiLHZvaWQgMCksWWUodGhpcyxcImRvd25UYXJnZXRcIix2b2lkIDApLHRoaXMuaWQ9ZSx0aGlzLnBvaW50ZXI9bix0aGlzLmV2ZW50PXIsdGhpcy5kb3duVGltZT1vLHRoaXMuZG93blRhcmdldD1pfTt2YXIgQmUsV2UsTGU9e307ZnVuY3Rpb24gVWUodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIFZlKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoTGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KExlLFwiUG9pbnRlckluZm9cIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gWGUuUG9pbnRlckluZm99fSksTGUuZGVmYXVsdD1MZS5JbnRlcmFjdGlvbj1MZS5fUHJveHlNZXRob2RzPUxlLl9Qcm94eVZhbHVlcz12b2lkIDAsTGUuX1Byb3h5VmFsdWVzPUJlLGZ1bmN0aW9uKHQpe3QuaW50ZXJhY3RhYmxlPVwiXCIsdC5lbGVtZW50PVwiXCIsdC5wcmVwYXJlZD1cIlwiLHQucG9pbnRlcklzRG93bj1cIlwiLHQucG9pbnRlcldhc01vdmVkPVwiXCIsdC5fcHJveHk9XCJcIn0oQmV8fChMZS5fUHJveHlWYWx1ZXM9QmU9e30pKSxMZS5fUHJveHlNZXRob2RzPVdlLGZ1bmN0aW9uKHQpe3Quc3RhcnQ9XCJcIix0Lm1vdmU9XCJcIix0LmVuZD1cIlwiLHQuc3RvcD1cIlwiLHQuaW50ZXJhY3Rpbmc9XCJcIn0oV2V8fChMZS5fUHJveHlNZXRob2RzPVdlPXt9KSk7dmFyIE5lPTAscWU9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpe3ZhciBuPXRoaXMscj1lLnBvaW50ZXJUeXBlLG89ZS5zY29wZUZpcmU7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxWZSh0aGlzLFwiaW50ZXJhY3RhYmxlXCIsbnVsbCksVmUodGhpcyxcImVsZW1lbnRcIixudWxsKSxWZSh0aGlzLFwicmVjdFwiLHZvaWQgMCksVmUodGhpcyxcIl9yZWN0c1wiLHZvaWQgMCksVmUodGhpcyxcImVkZ2VzXCIsdm9pZCAwKSxWZSh0aGlzLFwiX3Njb3BlRmlyZVwiLHZvaWQgMCksVmUodGhpcyxcInByZXBhcmVkXCIse25hbWU6bnVsbCxheGlzOm51bGwsZWRnZXM6bnVsbH0pLFZlKHRoaXMsXCJwb2ludGVyVHlwZVwiLHZvaWQgMCksVmUodGhpcyxcInBvaW50ZXJzXCIsW10pLFZlKHRoaXMsXCJkb3duRXZlbnRcIixudWxsKSxWZSh0aGlzLFwiZG93blBvaW50ZXJcIix7fSksVmUodGhpcyxcIl9sYXRlc3RQb2ludGVyXCIse3BvaW50ZXI6bnVsbCxldmVudDpudWxsLGV2ZW50VGFyZ2V0Om51bGx9KSxWZSh0aGlzLFwicHJldkV2ZW50XCIsbnVsbCksVmUodGhpcyxcInBvaW50ZXJJc0Rvd25cIiwhMSksVmUodGhpcyxcInBvaW50ZXJXYXNNb3ZlZFwiLCExKSxWZSh0aGlzLFwiX2ludGVyYWN0aW5nXCIsITEpLFZlKHRoaXMsXCJfZW5kaW5nXCIsITEpLFZlKHRoaXMsXCJfc3RvcHBlZFwiLCEwKSxWZSh0aGlzLFwiX3Byb3h5XCIsbnVsbCksVmUodGhpcyxcInNpbXVsYXRpb25cIixudWxsKSxWZSh0aGlzLFwiZG9Nb3ZlXCIsKDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0KXt0aGlzLm1vdmUodCl9KSxcIlRoZSBpbnRlcmFjdGlvbi5kb01vdmUoKSBtZXRob2QgaGFzIGJlZW4gcmVuYW1lZCB0byBpbnRlcmFjdGlvbi5tb3ZlKClcIikpLFZlKHRoaXMsXCJjb29yZHNcIix7c3RhcnQ6Qi5uZXdDb29yZHMoKSxwcmV2OkIubmV3Q29vcmRzKCksY3VyOkIubmV3Q29vcmRzKCksZGVsdGE6Qi5uZXdDb29yZHMoKSx2ZWxvY2l0eTpCLm5ld0Nvb3JkcygpfSksVmUodGhpcyxcIl9pZFwiLE5lKyspLHRoaXMuX3Njb3BlRmlyZT1vLHRoaXMucG9pbnRlclR5cGU9cjt2YXIgaT10aGlzO3RoaXMuX3Byb3h5PXt9O3ZhciBhPWZ1bmN0aW9uKHQpe09iamVjdC5kZWZpbmVQcm9wZXJ0eShuLl9wcm94eSx0LHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gaVt0XX19KX07Zm9yKHZhciBzIGluIEJlKWEocyk7dmFyIGw9ZnVuY3Rpb24odCl7T2JqZWN0LmRlZmluZVByb3BlcnR5KG4uX3Byb3h5LHQse3ZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIGlbdF0uYXBwbHkoaSxhcmd1bWVudHMpfX0pfTtmb3IodmFyIHUgaW4gV2UpbCh1KTt0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6bmV3XCIse2ludGVyYWN0aW9uOnRoaXN9KX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJwb2ludGVyTW92ZVRvbGVyYW5jZVwiLGdldDpmdW5jdGlvbigpe3JldHVybiAxfX0se2tleTpcInBvaW50ZXJEb3duXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3ZhciByPXRoaXMudXBkYXRlUG9pbnRlcih0LGUsbiwhMCksbz10aGlzLnBvaW50ZXJzW3JdO3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpkb3duXCIse3BvaW50ZXI6dCxldmVudDplLGV2ZW50VGFyZ2V0Om4scG9pbnRlckluZGV4OnIscG9pbnRlckluZm86byx0eXBlOlwiZG93blwiLGludGVyYWN0aW9uOnRoaXN9KX19LHtrZXk6XCJzdGFydFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4hKHRoaXMuaW50ZXJhY3RpbmcoKXx8IXRoaXMucG9pbnRlcklzRG93bnx8dGhpcy5wb2ludGVycy5sZW5ndGg8KFwiZ2VzdHVyZVwiPT09dC5uYW1lPzI6MSl8fCFlLm9wdGlvbnNbdC5uYW1lXS5lbmFibGVkKSYmKCgwLFl0LmNvcHlBY3Rpb24pKHRoaXMucHJlcGFyZWQsdCksdGhpcy5pbnRlcmFjdGFibGU9ZSx0aGlzLmVsZW1lbnQ9bix0aGlzLnJlY3Q9ZS5nZXRSZWN0KG4pLHRoaXMuZWRnZXM9dGhpcy5wcmVwYXJlZC5lZGdlcz8oMCxqLmRlZmF1bHQpKHt9LHRoaXMucHJlcGFyZWQuZWRnZXMpOntsZWZ0OiEwLHJpZ2h0OiEwLHRvcDohMCxib3R0b206ITB9LHRoaXMuX3N0b3BwZWQ9ITEsdGhpcy5faW50ZXJhY3Rpbmc9dGhpcy5fZG9QaGFzZSh7aW50ZXJhY3Rpb246dGhpcyxldmVudDp0aGlzLmRvd25FdmVudCxwaGFzZTpcInN0YXJ0XCJ9KSYmIXRoaXMuX3N0b3BwZWQsdGhpcy5faW50ZXJhY3RpbmcpfX0se2tleTpcInBvaW50ZXJNb3ZlXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3RoaXMuc2ltdWxhdGlvbnx8dGhpcy5tb2RpZmljYXRpb24mJnRoaXMubW9kaWZpY2F0aW9uLmVuZFJlc3VsdHx8dGhpcy51cGRhdGVQb2ludGVyKHQsZSxuLCExKTt2YXIgcixvLGk9dGhpcy5jb29yZHMuY3VyLnBhZ2UueD09PXRoaXMuY29vcmRzLnByZXYucGFnZS54JiZ0aGlzLmNvb3Jkcy5jdXIucGFnZS55PT09dGhpcy5jb29yZHMucHJldi5wYWdlLnkmJnRoaXMuY29vcmRzLmN1ci5jbGllbnQueD09PXRoaXMuY29vcmRzLnByZXYuY2xpZW50LngmJnRoaXMuY29vcmRzLmN1ci5jbGllbnQueT09PXRoaXMuY29vcmRzLnByZXYuY2xpZW50Lnk7dGhpcy5wb2ludGVySXNEb3duJiYhdGhpcy5wb2ludGVyV2FzTW92ZWQmJihyPXRoaXMuY29vcmRzLmN1ci5jbGllbnQueC10aGlzLmNvb3Jkcy5zdGFydC5jbGllbnQueCxvPXRoaXMuY29vcmRzLmN1ci5jbGllbnQueS10aGlzLmNvb3Jkcy5zdGFydC5jbGllbnQueSx0aGlzLnBvaW50ZXJXYXNNb3ZlZD0oMCxDLmRlZmF1bHQpKHIsbyk+dGhpcy5wb2ludGVyTW92ZVRvbGVyYW5jZSk7dmFyIGE9dGhpcy5nZXRQb2ludGVySW5kZXgodCkscz17cG9pbnRlcjp0LHBvaW50ZXJJbmRleDphLHBvaW50ZXJJbmZvOnRoaXMucG9pbnRlcnNbYV0sZXZlbnQ6ZSx0eXBlOlwibW92ZVwiLGV2ZW50VGFyZ2V0Om4sZHg6cixkeTpvLGR1cGxpY2F0ZTppLGludGVyYWN0aW9uOnRoaXN9O2l8fEIuc2V0Q29vcmRWZWxvY2l0eSh0aGlzLmNvb3Jkcy52ZWxvY2l0eSx0aGlzLmNvb3Jkcy5kZWx0YSksdGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOm1vdmVcIixzKSxpfHx0aGlzLnNpbXVsYXRpb258fCh0aGlzLmludGVyYWN0aW5nKCkmJihzLnR5cGU9bnVsbCx0aGlzLm1vdmUocykpLHRoaXMucG9pbnRlcldhc01vdmVkJiZCLmNvcHlDb29yZHModGhpcy5jb29yZHMucHJldix0aGlzLmNvb3Jkcy5jdXIpKX19LHtrZXk6XCJtb3ZlXCIsdmFsdWU6ZnVuY3Rpb24odCl7dCYmdC5ldmVudHx8Qi5zZXRaZXJvQ29vcmRzKHRoaXMuY29vcmRzLmRlbHRhKSwodD0oMCxqLmRlZmF1bHQpKHtwb2ludGVyOnRoaXMuX2xhdGVzdFBvaW50ZXIucG9pbnRlcixldmVudDp0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50LGV2ZW50VGFyZ2V0OnRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnRUYXJnZXQsaW50ZXJhY3Rpb246dGhpc30sdHx8e30pKS5waGFzZT1cIm1vdmVcIix0aGlzLl9kb1BoYXNlKHQpfX0se2tleTpcInBvaW50ZXJVcFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuLHIpe3ZhciBvPXRoaXMuZ2V0UG9pbnRlckluZGV4KHQpOy0xPT09byYmKG89dGhpcy51cGRhdGVQb2ludGVyKHQsZSxuLCExKSk7dmFyIGk9L2NhbmNlbCQvaS50ZXN0KGUudHlwZSk/XCJjYW5jZWxcIjpcInVwXCI7dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOlwiLmNvbmNhdChpKSx7cG9pbnRlcjp0LHBvaW50ZXJJbmRleDpvLHBvaW50ZXJJbmZvOnRoaXMucG9pbnRlcnNbb10sZXZlbnQ6ZSxldmVudFRhcmdldDpuLHR5cGU6aSxjdXJFdmVudFRhcmdldDpyLGludGVyYWN0aW9uOnRoaXN9KSx0aGlzLnNpbXVsYXRpb258fHRoaXMuZW5kKGUpLHRoaXMucmVtb3ZlUG9pbnRlcih0LGUpfX0se2tleTpcImRvY3VtZW50Qmx1clwiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuZW5kKHQpLHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpibHVyXCIse2V2ZW50OnQsdHlwZTpcImJsdXJcIixpbnRlcmFjdGlvbjp0aGlzfSl9fSx7a2V5OlwiZW5kXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU7dGhpcy5fZW5kaW5nPSEwLHQ9dHx8dGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudCx0aGlzLmludGVyYWN0aW5nKCkmJihlPXRoaXMuX2RvUGhhc2Uoe2V2ZW50OnQsaW50ZXJhY3Rpb246dGhpcyxwaGFzZTpcImVuZFwifSkpLHRoaXMuX2VuZGluZz0hMSwhMD09PWUmJnRoaXMuc3RvcCgpfX0se2tleTpcImN1cnJlbnRBY3Rpb25cIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pbnRlcmFjdGluZz90aGlzLnByZXBhcmVkLm5hbWU6bnVsbH19LHtrZXk6XCJpbnRlcmFjdGluZ1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2ludGVyYWN0aW5nfX0se2tleTpcInN0b3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpzdG9wXCIse2ludGVyYWN0aW9uOnRoaXN9KSx0aGlzLmludGVyYWN0YWJsZT10aGlzLmVsZW1lbnQ9bnVsbCx0aGlzLl9pbnRlcmFjdGluZz0hMSx0aGlzLl9zdG9wcGVkPSEwLHRoaXMucHJlcGFyZWQubmFtZT10aGlzLnByZXZFdmVudD1udWxsfX0se2tleTpcImdldFBvaW50ZXJJbmRleFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPUIuZ2V0UG9pbnRlcklkKHQpO3JldHVyblwibW91c2VcIj09PXRoaXMucG9pbnRlclR5cGV8fFwicGVuXCI9PT10aGlzLnBvaW50ZXJUeXBlP3RoaXMucG9pbnRlcnMubGVuZ3RoLTE6Wi5maW5kSW5kZXgodGhpcy5wb2ludGVycywoZnVuY3Rpb24odCl7cmV0dXJuIHQuaWQ9PT1lfSkpfX0se2tleTpcImdldFBvaW50ZXJJbmZvXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMucG9pbnRlcnNbdGhpcy5nZXRQb2ludGVySW5kZXgodCldfX0se2tleTpcInVwZGF0ZVBvaW50ZXJcIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXt2YXIgbz1CLmdldFBvaW50ZXJJZCh0KSxpPXRoaXMuZ2V0UG9pbnRlckluZGV4KHQpLGE9dGhpcy5wb2ludGVyc1tpXTtyZXR1cm4gcj0hMSE9PXImJihyfHwvKGRvd258c3RhcnQpJC9pLnRlc3QoZS50eXBlKSksYT9hLnBvaW50ZXI9dDooYT1uZXcgWGUuUG9pbnRlckluZm8obyx0LGUsbnVsbCxudWxsKSxpPXRoaXMucG9pbnRlcnMubGVuZ3RoLHRoaXMucG9pbnRlcnMucHVzaChhKSksQi5zZXRDb29yZHModGhpcy5jb29yZHMuY3VyLHRoaXMucG9pbnRlcnMubWFwKChmdW5jdGlvbih0KXtyZXR1cm4gdC5wb2ludGVyfSkpLHRoaXMuX25vdygpKSxCLnNldENvb3JkRGVsdGFzKHRoaXMuY29vcmRzLmRlbHRhLHRoaXMuY29vcmRzLnByZXYsdGhpcy5jb29yZHMuY3VyKSxyJiYodGhpcy5wb2ludGVySXNEb3duPSEwLGEuZG93blRpbWU9dGhpcy5jb29yZHMuY3VyLnRpbWVTdGFtcCxhLmRvd25UYXJnZXQ9bixCLnBvaW50ZXJFeHRlbmQodGhpcy5kb3duUG9pbnRlcix0KSx0aGlzLmludGVyYWN0aW5nKCl8fChCLmNvcHlDb29yZHModGhpcy5jb29yZHMuc3RhcnQsdGhpcy5jb29yZHMuY3VyKSxCLmNvcHlDb29yZHModGhpcy5jb29yZHMucHJldix0aGlzLmNvb3Jkcy5jdXIpLHRoaXMuZG93bkV2ZW50PWUsdGhpcy5wb2ludGVyV2FzTW92ZWQ9ITEpKSx0aGlzLl91cGRhdGVMYXRlc3RQb2ludGVyKHQsZSxuKSx0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6dXBkYXRlLXBvaW50ZXJcIix7cG9pbnRlcjp0LGV2ZW50OmUsZXZlbnRUYXJnZXQ6bixkb3duOnIscG9pbnRlckluZm86YSxwb2ludGVySW5kZXg6aSxpbnRlcmFjdGlvbjp0aGlzfSksaX19LHtrZXk6XCJyZW1vdmVQb2ludGVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj10aGlzLmdldFBvaW50ZXJJbmRleCh0KTtpZigtMSE9PW4pe3ZhciByPXRoaXMucG9pbnRlcnNbbl07dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOnJlbW92ZS1wb2ludGVyXCIse3BvaW50ZXI6dCxldmVudDplLGV2ZW50VGFyZ2V0Om51bGwscG9pbnRlckluZGV4Om4scG9pbnRlckluZm86cixpbnRlcmFjdGlvbjp0aGlzfSksdGhpcy5wb2ludGVycy5zcGxpY2UobiwxKSx0aGlzLnBvaW50ZXJJc0Rvd249ITF9fX0se2tleTpcIl91cGRhdGVMYXRlc3RQb2ludGVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3RoaXMuX2xhdGVzdFBvaW50ZXIucG9pbnRlcj10LHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnQ9ZSx0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50VGFyZ2V0PW59fSx7a2V5OlwiZGVzdHJveVwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fbGF0ZXN0UG9pbnRlci5wb2ludGVyPW51bGwsdGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudD1udWxsLHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnRUYXJnZXQ9bnVsbH19LHtrZXk6XCJfY3JlYXRlUHJlcGFyZWRFdmVudFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuLHIpe3JldHVybiBuZXcgamUuSW50ZXJhY3RFdmVudCh0aGlzLHQsdGhpcy5wcmVwYXJlZC5uYW1lLGUsdGhpcy5lbGVtZW50LG4scil9fSx7a2V5OlwiX2ZpcmVFdmVudFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuaW50ZXJhY3RhYmxlLmZpcmUodCksKCF0aGlzLnByZXZFdmVudHx8dC50aW1lU3RhbXA+PXRoaXMucHJldkV2ZW50LnRpbWVTdGFtcCkmJih0aGlzLnByZXZFdmVudD10KX19LHtrZXk6XCJfZG9QaGFzZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZXZlbnQsbj10LnBoYXNlLHI9dC5wcmVFbmQsbz10LnR5cGUsaT10aGlzLnJlY3Q7aWYoaSYmXCJtb3ZlXCI9PT1uJiYoay5hZGRFZGdlcyh0aGlzLmVkZ2VzLGksdGhpcy5jb29yZHMuZGVsdGFbdGhpcy5pbnRlcmFjdGFibGUub3B0aW9ucy5kZWx0YVNvdXJjZV0pLGkud2lkdGg9aS5yaWdodC1pLmxlZnQsaS5oZWlnaHQ9aS5ib3R0b20taS50b3ApLCExPT09dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tXCIuY29uY2F0KG4pLHQpKXJldHVybiExO3ZhciBhPXQuaUV2ZW50PXRoaXMuX2NyZWF0ZVByZXBhcmVkRXZlbnQoZSxuLHIsbyk7cmV0dXJuIHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczphY3Rpb24tXCIuY29uY2F0KG4pLHQpLFwic3RhcnRcIj09PW4mJih0aGlzLnByZXZFdmVudD1hKSx0aGlzLl9maXJlRXZlbnQoYSksdGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1cIi5jb25jYXQobiksdCksITB9fSx7a2V5OlwiX25vd1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIERhdGUubm93KCl9fV0pJiZVZShlLnByb3RvdHlwZSxuKSx0fSgpO0xlLkludGVyYWN0aW9uPXFlO3ZhciAkZT1xZTtMZS5kZWZhdWx0PSRlO3ZhciBHZT17fTtmdW5jdGlvbiBIZSh0KXt0LnBvaW50ZXJJc0Rvd24mJihRZSh0LmNvb3Jkcy5jdXIsdC5vZmZzZXQudG90YWwpLHQub2Zmc2V0LnBlbmRpbmcueD0wLHQub2Zmc2V0LnBlbmRpbmcueT0wKX1mdW5jdGlvbiBLZSh0KXtaZSh0LmludGVyYWN0aW9uKX1mdW5jdGlvbiBaZSh0KXtpZighZnVuY3Rpb24odCl7cmV0dXJuISghdC5vZmZzZXQucGVuZGluZy54JiYhdC5vZmZzZXQucGVuZGluZy55KX0odCkpcmV0dXJuITE7dmFyIGU9dC5vZmZzZXQucGVuZGluZztyZXR1cm4gUWUodC5jb29yZHMuY3VyLGUpLFFlKHQuY29vcmRzLmRlbHRhLGUpLGsuYWRkRWRnZXModC5lZGdlcyx0LnJlY3QsZSksZS54PTAsZS55PTAsITB9ZnVuY3Rpb24gSmUodCl7dmFyIGU9dC54LG49dC55O3RoaXMub2Zmc2V0LnBlbmRpbmcueCs9ZSx0aGlzLm9mZnNldC5wZW5kaW5nLnkrPW4sdGhpcy5vZmZzZXQudG90YWwueCs9ZSx0aGlzLm9mZnNldC50b3RhbC55Kz1ufWZ1bmN0aW9uIFFlKHQsZSl7dmFyIG49dC5wYWdlLHI9dC5jbGllbnQsbz1lLngsaT1lLnk7bi54Kz1vLG4ueSs9aSxyLngrPW8sci55Kz1pfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShHZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxHZS5hZGRUb3RhbD1IZSxHZS5hcHBseVBlbmRpbmc9WmUsR2UuZGVmYXVsdD12b2lkIDAsTGUuX1Byb3h5TWV0aG9kcy5vZmZzZXRCeT1cIlwiO3ZhciB0bj17aWQ6XCJvZmZzZXRcIixiZWZvcmU6W1wibW9kaWZpZXJzXCIsXCJwb2ludGVyLWV2ZW50c1wiLFwiYWN0aW9uc1wiLFwiaW5lcnRpYVwiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3QuSW50ZXJhY3Rpb24ucHJvdG90eXBlLm9mZnNldEJ5PUplfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24ub2Zmc2V0PXt0b3RhbDp7eDowLHk6MH0scGVuZGluZzp7eDowLHk6MH19fSxcImludGVyYWN0aW9uczp1cGRhdGUtcG9pbnRlclwiOmZ1bmN0aW9uKHQpe3JldHVybiBIZSh0LmludGVyYWN0aW9uKX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1zdGFydFwiOktlLFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tbW92ZVwiOktlLFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtpZihaZShlKSlyZXR1cm4gZS5tb3ZlKHtvZmZzZXQ6ITB9KSxlLmVuZCgpLCExfSxcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbjtlLm9mZnNldC50b3RhbC54PTAsZS5vZmZzZXQudG90YWwueT0wLGUub2Zmc2V0LnBlbmRpbmcueD0wLGUub2Zmc2V0LnBlbmRpbmcueT0wfX19O0dlLmRlZmF1bHQ9dG47dmFyIGVuPXt9O2Z1bmN0aW9uIG5uKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBybih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KGVuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGVuLmRlZmF1bHQ9ZW4uSW5lcnRpYVN0YXRlPXZvaWQgMDt2YXIgb249ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCkscm4odGhpcyxcImFjdGl2ZVwiLCExKSxybih0aGlzLFwiaXNNb2RpZmllZFwiLCExKSxybih0aGlzLFwic21vb3RoRW5kXCIsITEpLHJuKHRoaXMsXCJhbGxvd1Jlc3VtZVwiLCExKSxybih0aGlzLFwibW9kaWZpY2F0aW9uXCIsdm9pZCAwKSxybih0aGlzLFwibW9kaWZpZXJDb3VudFwiLDApLHJuKHRoaXMsXCJtb2RpZmllckFyZ1wiLHZvaWQgMCkscm4odGhpcyxcInN0YXJ0Q29vcmRzXCIsdm9pZCAwKSxybih0aGlzLFwidDBcIiwwKSxybih0aGlzLFwidjBcIiwwKSxybih0aGlzLFwidGVcIiwwKSxybih0aGlzLFwidGFyZ2V0T2Zmc2V0XCIsdm9pZCAwKSxybih0aGlzLFwibW9kaWZpZWRPZmZzZXRcIix2b2lkIDApLHJuKHRoaXMsXCJjdXJyZW50T2Zmc2V0XCIsdm9pZCAwKSxybih0aGlzLFwibGFtYmRhX3YwXCIsMCkscm4odGhpcyxcIm9uZV92ZV92MFwiLDApLHJuKHRoaXMsXCJ0aW1lb3V0XCIsdm9pZCAwKSxybih0aGlzLFwiaW50ZXJhY3Rpb25cIix2b2lkIDApLHRoaXMuaW50ZXJhY3Rpb249ZX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJzdGFydFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuaW50ZXJhY3Rpb24sbj1hbihlKTtpZighbnx8IW4uZW5hYmxlZClyZXR1cm4hMTt2YXIgcj1lLmNvb3Jkcy52ZWxvY2l0eS5jbGllbnQsbz0oMCxDLmRlZmF1bHQpKHIueCxyLnkpLGk9dGhpcy5tb2RpZmljYXRpb258fCh0aGlzLm1vZGlmaWNhdGlvbj1uZXcgeWUuZGVmYXVsdChlKSk7aWYoaS5jb3B5RnJvbShlLm1vZGlmaWNhdGlvbiksdGhpcy50MD1lLl9ub3coKSx0aGlzLmFsbG93UmVzdW1lPW4uYWxsb3dSZXN1bWUsdGhpcy52MD1vLHRoaXMuY3VycmVudE9mZnNldD17eDowLHk6MH0sdGhpcy5zdGFydENvb3Jkcz1lLmNvb3Jkcy5jdXIucGFnZSx0aGlzLm1vZGlmaWVyQXJnPWkuZmlsbEFyZyh7cGFnZUNvb3Jkczp0aGlzLnN0YXJ0Q29vcmRzLHByZUVuZDohMCxwaGFzZTpcImluZXJ0aWFzdGFydFwifSksdGhpcy50MC1lLmNvb3Jkcy5jdXIudGltZVN0YW1wPDUwJiZvPm4ubWluU3BlZWQmJm8+bi5lbmRTcGVlZCl0aGlzLnN0YXJ0SW5lcnRpYSgpO2Vsc2V7aWYoaS5yZXN1bHQ9aS5zZXRBbGwodGhpcy5tb2RpZmllckFyZyksIWkucmVzdWx0LmNoYW5nZWQpcmV0dXJuITE7dGhpcy5zdGFydFNtb290aEVuZCgpfXJldHVybiBlLm1vZGlmaWNhdGlvbi5yZXN1bHQucmVjdD1udWxsLGUub2Zmc2V0QnkodGhpcy50YXJnZXRPZmZzZXQpLGUuX2RvUGhhc2Uoe2ludGVyYWN0aW9uOmUsZXZlbnQ6dCxwaGFzZTpcImluZXJ0aWFzdGFydFwifSksZS5vZmZzZXRCeSh7eDotdGhpcy50YXJnZXRPZmZzZXQueCx5Oi10aGlzLnRhcmdldE9mZnNldC55fSksZS5tb2RpZmljYXRpb24ucmVzdWx0LnJlY3Q9bnVsbCx0aGlzLmFjdGl2ZT0hMCxlLnNpbXVsYXRpb249dGhpcywhMH19LHtrZXk6XCJzdGFydEluZXJ0aWFcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMsZT10aGlzLmludGVyYWN0aW9uLmNvb3Jkcy52ZWxvY2l0eS5jbGllbnQsbj1hbih0aGlzLmludGVyYWN0aW9uKSxyPW4ucmVzaXN0YW5jZSxvPS1NYXRoLmxvZyhuLmVuZFNwZWVkL3RoaXMudjApL3I7dGhpcy50YXJnZXRPZmZzZXQ9e3g6KGUueC1vKS9yLHk6KGUueS1vKS9yfSx0aGlzLnRlPW8sdGhpcy5sYW1iZGFfdjA9ci90aGlzLnYwLHRoaXMub25lX3ZlX3YwPTEtbi5lbmRTcGVlZC90aGlzLnYwO3ZhciBpPXRoaXMubW9kaWZpY2F0aW9uLGE9dGhpcy5tb2RpZmllckFyZzthLnBhZ2VDb29yZHM9e3g6dGhpcy5zdGFydENvb3Jkcy54K3RoaXMudGFyZ2V0T2Zmc2V0LngseTp0aGlzLnN0YXJ0Q29vcmRzLnkrdGhpcy50YXJnZXRPZmZzZXQueX0saS5yZXN1bHQ9aS5zZXRBbGwoYSksaS5yZXN1bHQuY2hhbmdlZCYmKHRoaXMuaXNNb2RpZmllZD0hMCx0aGlzLm1vZGlmaWVkT2Zmc2V0PXt4OnRoaXMudGFyZ2V0T2Zmc2V0LngraS5yZXN1bHQuZGVsdGEueCx5OnRoaXMudGFyZ2V0T2Zmc2V0LnkraS5yZXN1bHQuZGVsdGEueX0pLHRoaXMub25OZXh0RnJhbWUoKGZ1bmN0aW9uKCl7cmV0dXJuIHQuaW5lcnRpYVRpY2soKX0pKX19LHtrZXk6XCJzdGFydFNtb290aEVuZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpczt0aGlzLnNtb290aEVuZD0hMCx0aGlzLmlzTW9kaWZpZWQ9ITAsdGhpcy50YXJnZXRPZmZzZXQ9e3g6dGhpcy5tb2RpZmljYXRpb24ucmVzdWx0LmRlbHRhLngseTp0aGlzLm1vZGlmaWNhdGlvbi5yZXN1bHQuZGVsdGEueX0sdGhpcy5vbk5leHRGcmFtZSgoZnVuY3Rpb24oKXtyZXR1cm4gdC5zbW9vdGhFbmRUaWNrKCl9KSl9fSx7a2V5Olwib25OZXh0RnJhbWVcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzO3RoaXMudGltZW91dD1qdC5kZWZhdWx0LnJlcXVlc3QoKGZ1bmN0aW9uKCl7ZS5hY3RpdmUmJnQoKX0pKX19LHtrZXk6XCJpbmVydGlhVGlja1wiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQsZSxuLHIsbyxpPXRoaXMsYT10aGlzLmludGVyYWN0aW9uLHM9YW4oYSkucmVzaXN0YW5jZSxsPShhLl9ub3coKS10aGlzLnQwKS8xZTM7aWYobDx0aGlzLnRlKXt2YXIgdSxjPTEtKE1hdGguZXhwKC1zKmwpLXRoaXMubGFtYmRhX3YwKS90aGlzLm9uZV92ZV92MDt0aGlzLmlzTW9kaWZpZWQ/KDAsMCx0PXRoaXMudGFyZ2V0T2Zmc2V0LngsZT10aGlzLnRhcmdldE9mZnNldC55LG49dGhpcy5tb2RpZmllZE9mZnNldC54LHI9dGhpcy5tb2RpZmllZE9mZnNldC55LHU9e3g6c24obz1jLDAsdCxuKSx5OnNuKG8sMCxlLHIpfSk6dT17eDp0aGlzLnRhcmdldE9mZnNldC54KmMseTp0aGlzLnRhcmdldE9mZnNldC55KmN9O3ZhciBmPXt4OnUueC10aGlzLmN1cnJlbnRPZmZzZXQueCx5OnUueS10aGlzLmN1cnJlbnRPZmZzZXQueX07dGhpcy5jdXJyZW50T2Zmc2V0LngrPWYueCx0aGlzLmN1cnJlbnRPZmZzZXQueSs9Zi55LGEub2Zmc2V0QnkoZiksYS5tb3ZlKCksdGhpcy5vbk5leHRGcmFtZSgoZnVuY3Rpb24oKXtyZXR1cm4gaS5pbmVydGlhVGljaygpfSkpfWVsc2UgYS5vZmZzZXRCeSh7eDp0aGlzLm1vZGlmaWVkT2Zmc2V0LngtdGhpcy5jdXJyZW50T2Zmc2V0LngseTp0aGlzLm1vZGlmaWVkT2Zmc2V0LnktdGhpcy5jdXJyZW50T2Zmc2V0Lnl9KSx0aGlzLmVuZCgpfX0se2tleTpcInNtb290aEVuZFRpY2tcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMsZT10aGlzLmludGVyYWN0aW9uLG49ZS5fbm93KCktdGhpcy50MCxyPWFuKGUpLnNtb290aEVuZER1cmF0aW9uO2lmKG48cil7dmFyIG89e3g6bG4obiwwLHRoaXMudGFyZ2V0T2Zmc2V0LngscikseTpsbihuLDAsdGhpcy50YXJnZXRPZmZzZXQueSxyKX0saT17eDpvLngtdGhpcy5jdXJyZW50T2Zmc2V0LngseTpvLnktdGhpcy5jdXJyZW50T2Zmc2V0Lnl9O3RoaXMuY3VycmVudE9mZnNldC54Kz1pLngsdGhpcy5jdXJyZW50T2Zmc2V0LnkrPWkueSxlLm9mZnNldEJ5KGkpLGUubW92ZSh7c2tpcE1vZGlmaWVyczp0aGlzLm1vZGlmaWVyQ291bnR9KSx0aGlzLm9uTmV4dEZyYW1lKChmdW5jdGlvbigpe3JldHVybiB0LnNtb290aEVuZFRpY2soKX0pKX1lbHNlIGUub2Zmc2V0Qnkoe3g6dGhpcy50YXJnZXRPZmZzZXQueC10aGlzLmN1cnJlbnRPZmZzZXQueCx5OnRoaXMudGFyZ2V0T2Zmc2V0LnktdGhpcy5jdXJyZW50T2Zmc2V0Lnl9KSx0aGlzLmVuZCgpfX0se2tleTpcInJlc3VtZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQucG9pbnRlcixuPXQuZXZlbnQscj10LmV2ZW50VGFyZ2V0LG89dGhpcy5pbnRlcmFjdGlvbjtvLm9mZnNldEJ5KHt4Oi10aGlzLmN1cnJlbnRPZmZzZXQueCx5Oi10aGlzLmN1cnJlbnRPZmZzZXQueX0pLG8udXBkYXRlUG9pbnRlcihlLG4sciwhMCksby5fZG9QaGFzZSh7aW50ZXJhY3Rpb246byxldmVudDpuLHBoYXNlOlwicmVzdW1lXCJ9KSwoMCxCLmNvcHlDb29yZHMpKG8uY29vcmRzLnByZXYsby5jb29yZHMuY3VyKSx0aGlzLnN0b3AoKX19LHtrZXk6XCJlbmRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuaW50ZXJhY3Rpb24ubW92ZSgpLHRoaXMuaW50ZXJhY3Rpb24uZW5kKCksdGhpcy5zdG9wKCl9fSx7a2V5Olwic3RvcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5hY3RpdmU9dGhpcy5zbW9vdGhFbmQ9ITEsdGhpcy5pbnRlcmFjdGlvbi5zaW11bGF0aW9uPW51bGwsanQuZGVmYXVsdC5jYW5jZWwodGhpcy50aW1lb3V0KX19XSkmJm5uKGUucHJvdG90eXBlLG4pLHR9KCk7ZnVuY3Rpb24gYW4odCl7dmFyIGU9dC5pbnRlcmFjdGFibGUsbj10LnByZXBhcmVkO3JldHVybiBlJiZlLm9wdGlvbnMmJm4ubmFtZSYmZS5vcHRpb25zW24ubmFtZV0uaW5lcnRpYX1mdW5jdGlvbiBzbih0LGUsbixyKXt2YXIgbz0xLXQ7cmV0dXJuIG8qbyplKzIqbyp0Km4rdCp0KnJ9ZnVuY3Rpb24gbG4odCxlLG4scil7cmV0dXJuLW4qKHQvPXIpKih0LTIpK2V9ZW4uSW5lcnRpYVN0YXRlPW9uO3ZhciB1bj17aWQ6XCJpbmVydGlhXCIsYmVmb3JlOltcIm1vZGlmaWVyc1wiLFwiYWN0aW9uc1wiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVmYXVsdHM7dC51c2VQbHVnaW4oR2UuZGVmYXVsdCksdC51c2VQbHVnaW4oU2UuZGVmYXVsdCksdC5hY3Rpb25zLnBoYXNlcy5pbmVydGlhc3RhcnQ9ITAsdC5hY3Rpb25zLnBoYXNlcy5yZXN1bWU9ITAsZS5wZXJBY3Rpb24uaW5lcnRpYT17ZW5hYmxlZDohMSxyZXNpc3RhbmNlOjEwLG1pblNwZWVkOjEwMCxlbmRTcGVlZDoxMCxhbGxvd1Jlc3VtZTohMCxzbW9vdGhFbmREdXJhdGlvbjozMDB9fSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5pbmVydGlhPW5ldyBvbihlKX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1lbmRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5ldmVudDtyZXR1cm4oIWUuX2ludGVyYWN0aW5nfHxlLnNpbXVsYXRpb258fCFlLmluZXJ0aWEuc3RhcnQobikpJiZudWxsfSxcImludGVyYWN0aW9uczpkb3duXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZXZlbnRUYXJnZXQscj1lLmluZXJ0aWE7aWYoci5hY3RpdmUpZm9yKHZhciBvPW47aS5kZWZhdWx0LmVsZW1lbnQobyk7KXtpZihvPT09ZS5lbGVtZW50KXtyLnJlc3VtZSh0KTticmVha31vPV8ucGFyZW50Tm9kZShvKX19LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLmluZXJ0aWE7ZS5hY3RpdmUmJmUuc3RvcCgpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLXJlc3VtZVwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uO2Uuc3RvcCh0KSxlLnN0YXJ0KHQsdC5pbnRlcmFjdGlvbi5jb29yZHMuY3VyLnBhZ2UpLGUuYXBwbHlUb0ludGVyYWN0aW9uKHQpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLWluZXJ0aWFzdGFydFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5zZXRBbmRBcHBseSh0KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLXJlc3VtZVwiOlNlLmFkZEV2ZW50TW9kaWZpZXJzLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1pbmVydGlhc3RhcnRcIjpTZS5hZGRFdmVudE1vZGlmaWVycyxcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24taW5lcnRpYXN0YXJ0XCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnJlc3RvcmVJbnRlcmFjdGlvbkNvb3Jkcyh0KX0sXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLXJlc3VtZVwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN0b3JlSW50ZXJhY3Rpb25Db29yZHModCl9fX07ZW4uZGVmYXVsdD11bjt2YXIgY249e307ZnVuY3Rpb24gZm4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIGRuKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1mdW5jdGlvbiBwbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO2lmKHQuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkKWJyZWFrO3IodCl9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxjbi5FdmVudGFibGU9dm9pZCAwO3ZhciB2bj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxkbih0aGlzLFwib3B0aW9uc1wiLHZvaWQgMCksZG4odGhpcyxcInR5cGVzXCIse30pLGRuKHRoaXMsXCJwcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksZG4odGhpcyxcImltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKSxkbih0aGlzLFwiZ2xvYmFsXCIsdm9pZCAwKSx0aGlzLm9wdGlvbnM9KDAsai5kZWZhdWx0KSh7fSxlfHx7fSl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwiZmlyZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlLG49dGhpcy5nbG9iYWw7KGU9dGhpcy50eXBlc1t0LnR5cGVdKSYmcG4odCxlKSwhdC5wcm9wYWdhdGlvblN0b3BwZWQmJm4mJihlPW5bdC50eXBlXSkmJnBuKHQsZSl9fSx7a2V5Olwib25cIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPSgwLFIuZGVmYXVsdCkodCxlKTtmb3IodCBpbiBuKXRoaXMudHlwZXNbdF09Wi5tZXJnZSh0aGlzLnR5cGVzW3RdfHxbXSxuW3RdKX19LHtrZXk6XCJvZmZcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPSgwLFIuZGVmYXVsdCkodCxlKTtmb3IodCBpbiBuKXt2YXIgcj10aGlzLnR5cGVzW3RdO2lmKHImJnIubGVuZ3RoKWZvcih2YXIgbz0wO288blt0XS5sZW5ndGg7bysrKXt2YXIgaT1uW3RdW29dLGE9ci5pbmRleE9mKGkpOy0xIT09YSYmci5zcGxpY2UoYSwxKX19fX0se2tleTpcImdldFJlY3RcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gbnVsbH19XSkmJmZuKGUucHJvdG90eXBlLG4pLHR9KCk7Y24uRXZlbnRhYmxlPXZuO3ZhciBobj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoaG4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksaG4uZGVmYXVsdD1mdW5jdGlvbih0LGUpe2lmKGUucGhhc2VsZXNzVHlwZXNbdF0pcmV0dXJuITA7Zm9yKHZhciBuIGluIGUubWFwKWlmKDA9PT10LmluZGV4T2YobikmJnQuc3Vic3RyKG4ubGVuZ3RoKWluIGUucGhhc2VzKXJldHVybiEwO3JldHVybiExfTt2YXIgZ249e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGduLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGduLmNyZWF0ZUludGVyYWN0U3RhdGljPWZ1bmN0aW9uKHQpe3ZhciBlPWZ1bmN0aW9uIGUobixyKXt2YXIgbz10LmludGVyYWN0YWJsZXMuZ2V0KG4scik7cmV0dXJuIG98fCgobz10LmludGVyYWN0YWJsZXMubmV3KG4scikpLmV2ZW50cy5nbG9iYWw9ZS5nbG9iYWxFdmVudHMpLG99O3JldHVybiBlLmdldFBvaW50ZXJBdmVyYWdlPUIucG9pbnRlckF2ZXJhZ2UsZS5nZXRUb3VjaEJCb3g9Qi50b3VjaEJCb3gsZS5nZXRUb3VjaERpc3RhbmNlPUIudG91Y2hEaXN0YW5jZSxlLmdldFRvdWNoQW5nbGU9Qi50b3VjaEFuZ2xlLGUuZ2V0RWxlbWVudFJlY3Q9Xy5nZXRFbGVtZW50UmVjdCxlLmdldEVsZW1lbnRDbGllbnRSZWN0PV8uZ2V0RWxlbWVudENsaWVudFJlY3QsZS5tYXRjaGVzU2VsZWN0b3I9Xy5tYXRjaGVzU2VsZWN0b3IsZS5jbG9zZXN0PV8uY2xvc2VzdCxlLmdsb2JhbEV2ZW50cz17fSxlLnZlcnNpb249XCIxLjEwLjExXCIsZS5zY29wZT10LGUudXNlPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuc2NvcGUudXNlUGx1Z2luKHQsZSksdGhpc30sZS5pc1NldD1mdW5jdGlvbih0LGUpe3JldHVybiEhdGhpcy5zY29wZS5pbnRlcmFjdGFibGVzLmdldCh0LGUmJmUuY29udGV4dCl9LGUub249KDAsWXQud2Fybk9uY2UpKChmdW5jdGlvbih0LGUsbil7aWYoaS5kZWZhdWx0LnN0cmluZyh0KSYmLTEhPT10LnNlYXJjaChcIiBcIikmJih0PXQudHJpbSgpLnNwbGl0KC8gKy8pKSxpLmRlZmF1bHQuYXJyYXkodCkpe2Zvcih2YXIgcj0wO3I8dC5sZW5ndGg7cisrKXt2YXIgbz10W3JdO3RoaXMub24obyxlLG4pfXJldHVybiB0aGlzfWlmKGkuZGVmYXVsdC5vYmplY3QodCkpe2Zvcih2YXIgYSBpbiB0KXRoaXMub24oYSx0W2FdLGUpO3JldHVybiB0aGlzfXJldHVybigwLGhuLmRlZmF1bHQpKHQsdGhpcy5zY29wZS5hY3Rpb25zKT90aGlzLmdsb2JhbEV2ZW50c1t0XT90aGlzLmdsb2JhbEV2ZW50c1t0XS5wdXNoKGUpOnRoaXMuZ2xvYmFsRXZlbnRzW3RdPVtlXTp0aGlzLnNjb3BlLmV2ZW50cy5hZGQodGhpcy5zY29wZS5kb2N1bWVudCx0LGUse29wdGlvbnM6bn0pLHRoaXN9KSxcIlRoZSBpbnRlcmFjdC5vbigpIG1ldGhvZCBpcyBiZWluZyBkZXByZWNhdGVkXCIpLGUub2ZmPSgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCxlLG4pe2lmKGkuZGVmYXVsdC5zdHJpbmcodCkmJi0xIT09dC5zZWFyY2goXCIgXCIpJiYodD10LnRyaW0oKS5zcGxpdCgvICsvKSksaS5kZWZhdWx0LmFycmF5KHQpKXtmb3IodmFyIHI9MDtyPHQubGVuZ3RoO3IrKyl7dmFyIG89dFtyXTt0aGlzLm9mZihvLGUsbil9cmV0dXJuIHRoaXN9aWYoaS5kZWZhdWx0Lm9iamVjdCh0KSl7Zm9yKHZhciBhIGluIHQpdGhpcy5vZmYoYSx0W2FdLGUpO3JldHVybiB0aGlzfXZhciBzO3JldHVybigwLGhuLmRlZmF1bHQpKHQsdGhpcy5zY29wZS5hY3Rpb25zKT90IGluIHRoaXMuZ2xvYmFsRXZlbnRzJiYtMSE9PShzPXRoaXMuZ2xvYmFsRXZlbnRzW3RdLmluZGV4T2YoZSkpJiZ0aGlzLmdsb2JhbEV2ZW50c1t0XS5zcGxpY2UocywxKTp0aGlzLnNjb3BlLmV2ZW50cy5yZW1vdmUodGhpcy5zY29wZS5kb2N1bWVudCx0LGUsbiksdGhpc30pLFwiVGhlIGludGVyYWN0Lm9mZigpIG1ldGhvZCBpcyBiZWluZyBkZXByZWNhdGVkXCIpLGUuZGVidWc9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zY29wZX0sZS5zdXBwb3J0c1RvdWNoPWZ1bmN0aW9uKCl7cmV0dXJuIGIuZGVmYXVsdC5zdXBwb3J0c1RvdWNofSxlLnN1cHBvcnRzUG9pbnRlckV2ZW50PWZ1bmN0aW9uKCl7cmV0dXJuIGIuZGVmYXVsdC5zdXBwb3J0c1BvaW50ZXJFdmVudH0sZS5zdG9wPWZ1bmN0aW9uKCl7Zm9yKHZhciB0PTA7dDx0aGlzLnNjb3BlLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDt0KyspdGhpcy5zY29wZS5pbnRlcmFjdGlvbnMubGlzdFt0XS5zdG9wKCk7cmV0dXJuIHRoaXN9LGUucG9pbnRlck1vdmVUb2xlcmFuY2U9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5udW1iZXIodCk/KHRoaXMuc2NvcGUuaW50ZXJhY3Rpb25zLnBvaW50ZXJNb3ZlVG9sZXJhbmNlPXQsdGhpcyk6dGhpcy5zY29wZS5pbnRlcmFjdGlvbnMucG9pbnRlck1vdmVUb2xlcmFuY2V9LGUuYWRkRG9jdW1lbnQ9ZnVuY3Rpb24odCxlKXt0aGlzLnNjb3BlLmFkZERvY3VtZW50KHQsZSl9LGUucmVtb3ZlRG9jdW1lbnQ9ZnVuY3Rpb24odCl7dGhpcy5zY29wZS5yZW1vdmVEb2N1bWVudCh0KX0sZX07dmFyIHluPXt9O2Z1bmN0aW9uIG1uKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBibih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHluLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHluLkludGVyYWN0YWJsZT12b2lkIDA7dmFyIHhuPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChuLHIsbyxpKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLGJuKHRoaXMsXCJvcHRpb25zXCIsdm9pZCAwKSxibih0aGlzLFwiX2FjdGlvbnNcIix2b2lkIDApLGJuKHRoaXMsXCJ0YXJnZXRcIix2b2lkIDApLGJuKHRoaXMsXCJldmVudHNcIixuZXcgY24uRXZlbnRhYmxlKSxibih0aGlzLFwiX2NvbnRleHRcIix2b2lkIDApLGJuKHRoaXMsXCJfd2luXCIsdm9pZCAwKSxibih0aGlzLFwiX2RvY1wiLHZvaWQgMCksYm4odGhpcyxcIl9zY29wZUV2ZW50c1wiLHZvaWQgMCksYm4odGhpcyxcIl9yZWN0Q2hlY2tlclwiLHZvaWQgMCksdGhpcy5fYWN0aW9ucz1yLmFjdGlvbnMsdGhpcy50YXJnZXQ9bix0aGlzLl9jb250ZXh0PXIuY29udGV4dHx8byx0aGlzLl93aW49KDAsZS5nZXRXaW5kb3cpKCgwLF8udHJ5U2VsZWN0b3IpKG4pP3RoaXMuX2NvbnRleHQ6biksdGhpcy5fZG9jPXRoaXMuX3dpbi5kb2N1bWVudCx0aGlzLl9zY29wZUV2ZW50cz1pLHRoaXMuc2V0KHIpfXZhciBuLHI7cmV0dXJuIG49dCwocj1be2tleTpcIl9kZWZhdWx0c1wiLGdldDpmdW5jdGlvbigpe3JldHVybntiYXNlOnt9LHBlckFjdGlvbjp7fSxhY3Rpb25zOnt9fX19LHtrZXk6XCJzZXRPbkV2ZW50c1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIGkuZGVmYXVsdC5mdW5jKGUub25zdGFydCkmJnRoaXMub24oXCJcIi5jb25jYXQodCxcInN0YXJ0XCIpLGUub25zdGFydCksaS5kZWZhdWx0LmZ1bmMoZS5vbm1vdmUpJiZ0aGlzLm9uKFwiXCIuY29uY2F0KHQsXCJtb3ZlXCIpLGUub25tb3ZlKSxpLmRlZmF1bHQuZnVuYyhlLm9uZW5kKSYmdGhpcy5vbihcIlwiLmNvbmNhdCh0LFwiZW5kXCIpLGUub25lbmQpLGkuZGVmYXVsdC5mdW5jKGUub25pbmVydGlhc3RhcnQpJiZ0aGlzLm9uKFwiXCIuY29uY2F0KHQsXCJpbmVydGlhc3RhcnRcIiksZS5vbmluZXJ0aWFzdGFydCksdGhpc319LHtrZXk6XCJ1cGRhdGVQZXJBY3Rpb25MaXN0ZW5lcnNcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7KGkuZGVmYXVsdC5hcnJheShlKXx8aS5kZWZhdWx0Lm9iamVjdChlKSkmJnRoaXMub2ZmKHQsZSksKGkuZGVmYXVsdC5hcnJheShuKXx8aS5kZWZhdWx0Lm9iamVjdChuKSkmJnRoaXMub24odCxuKX19LHtrZXk6XCJzZXRQZXJBY3Rpb25cIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPXRoaXMuX2RlZmF1bHRzO2Zvcih2YXIgciBpbiBlKXt2YXIgbz1yLGE9dGhpcy5vcHRpb25zW3RdLHM9ZVtvXTtcImxpc3RlbmVyc1wiPT09byYmdGhpcy51cGRhdGVQZXJBY3Rpb25MaXN0ZW5lcnModCxhLmxpc3RlbmVycyxzKSxpLmRlZmF1bHQuYXJyYXkocyk/YVtvXT1aLmZyb20ocyk6aS5kZWZhdWx0LnBsYWluT2JqZWN0KHMpPyhhW29dPSgwLGouZGVmYXVsdCkoYVtvXXx8e30sKDAsZ2UuZGVmYXVsdCkocykpLGkuZGVmYXVsdC5vYmplY3Qobi5wZXJBY3Rpb25bb10pJiZcImVuYWJsZWRcImluIG4ucGVyQWN0aW9uW29dJiYoYVtvXS5lbmFibGVkPSExIT09cy5lbmFibGVkKSk6aS5kZWZhdWx0LmJvb2wocykmJmkuZGVmYXVsdC5vYmplY3Qobi5wZXJBY3Rpb25bb10pP2Fbb10uZW5hYmxlZD1zOmFbb109c319fSx7a2V5OlwiZ2V0UmVjdFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0PXR8fChpLmRlZmF1bHQuZWxlbWVudCh0aGlzLnRhcmdldCk/dGhpcy50YXJnZXQ6bnVsbCksaS5kZWZhdWx0LnN0cmluZyh0aGlzLnRhcmdldCkmJih0PXR8fHRoaXMuX2NvbnRleHQucXVlcnlTZWxlY3Rvcih0aGlzLnRhcmdldCkpLCgwLF8uZ2V0RWxlbWVudFJlY3QpKHQpfX0se2tleTpcInJlY3RDaGVja2VyXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcztyZXR1cm4gaS5kZWZhdWx0LmZ1bmModCk/KHRoaXMuX3JlY3RDaGVja2VyPXQsdGhpcy5nZXRSZWN0PWZ1bmN0aW9uKHQpe3ZhciBuPSgwLGouZGVmYXVsdCkoe30sZS5fcmVjdENoZWNrZXIodCkpO3JldHVyblwid2lkdGhcImluIG58fChuLndpZHRoPW4ucmlnaHQtbi5sZWZ0LG4uaGVpZ2h0PW4uYm90dG9tLW4udG9wKSxufSx0aGlzKTpudWxsPT09dD8oZGVsZXRlIHRoaXMuZ2V0UmVjdCxkZWxldGUgdGhpcy5fcmVjdENoZWNrZXIsdGhpcyk6dGhpcy5nZXRSZWN0fX0se2tleTpcIl9iYWNrQ29tcGF0T3B0aW9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtpZigoMCxfLnRyeVNlbGVjdG9yKShlKXx8aS5kZWZhdWx0Lm9iamVjdChlKSl7Zm9yKHZhciBuIGluIHRoaXMub3B0aW9uc1t0XT1lLHRoaXMuX2FjdGlvbnMubWFwKXRoaXMub3B0aW9uc1tuXVt0XT1lO3JldHVybiB0aGlzfXJldHVybiB0aGlzLm9wdGlvbnNbdF19fSx7a2V5Olwib3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2JhY2tDb21wYXRPcHRpb24oXCJvcmlnaW5cIix0KX19LHtrZXk6XCJkZWx0YVNvdXJjZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVyblwicGFnZVwiPT09dHx8XCJjbGllbnRcIj09PXQ/KHRoaXMub3B0aW9ucy5kZWx0YVNvdXJjZT10LHRoaXMpOnRoaXMub3B0aW9ucy5kZWx0YVNvdXJjZX19LHtrZXk6XCJjb250ZXh0XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY29udGV4dH19LHtrZXk6XCJpbkNvbnRleHRcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fY29udGV4dD09PXQub3duZXJEb2N1bWVudHx8KDAsXy5ub2RlQ29udGFpbnMpKHRoaXMuX2NvbnRleHQsdCl9fSx7a2V5OlwidGVzdElnbm9yZUFsbG93XCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiF0aGlzLnRlc3RJZ25vcmUodC5pZ25vcmVGcm9tLGUsbikmJnRoaXMudGVzdEFsbG93KHQuYWxsb3dGcm9tLGUsbil9fSx7a2V5OlwidGVzdEFsbG93XCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiF0fHwhIWkuZGVmYXVsdC5lbGVtZW50KG4pJiYoaS5kZWZhdWx0LnN0cmluZyh0KT8oMCxfLm1hdGNoZXNVcFRvKShuLHQsZSk6ISFpLmRlZmF1bHQuZWxlbWVudCh0KSYmKDAsXy5ub2RlQ29udGFpbnMpKHQsbikpfX0se2tleTpcInRlc3RJZ25vcmVcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuISghdHx8IWkuZGVmYXVsdC5lbGVtZW50KG4pKSYmKGkuZGVmYXVsdC5zdHJpbmcodCk/KDAsXy5tYXRjaGVzVXBUbykobix0LGUpOiEhaS5kZWZhdWx0LmVsZW1lbnQodCkmJigwLF8ubm9kZUNvbnRhaW5zKSh0LG4pKX19LHtrZXk6XCJmaXJlXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuZXZlbnRzLmZpcmUodCksdGhpc319LHtrZXk6XCJfb25PZmZcIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXtpLmRlZmF1bHQub2JqZWN0KGUpJiYhaS5kZWZhdWx0LmFycmF5KGUpJiYocj1uLG49bnVsbCk7dmFyIG89XCJvblwiPT09dD9cImFkZFwiOlwicmVtb3ZlXCIsYT0oMCxSLmRlZmF1bHQpKGUsbik7Zm9yKHZhciBzIGluIGEpe1wid2hlZWxcIj09PXMmJihzPWIuZGVmYXVsdC53aGVlbEV2ZW50KTtmb3IodmFyIGw9MDtsPGFbc10ubGVuZ3RoO2wrKyl7dmFyIHU9YVtzXVtsXTsoMCxobi5kZWZhdWx0KShzLHRoaXMuX2FjdGlvbnMpP3RoaXMuZXZlbnRzW3RdKHMsdSk6aS5kZWZhdWx0LnN0cmluZyh0aGlzLnRhcmdldCk/dGhpcy5fc2NvcGVFdmVudHNbXCJcIi5jb25jYXQobyxcIkRlbGVnYXRlXCIpXSh0aGlzLnRhcmdldCx0aGlzLl9jb250ZXh0LHMsdSxyKTp0aGlzLl9zY29wZUV2ZW50c1tvXSh0aGlzLnRhcmdldCxzLHUscil9fXJldHVybiB0aGlzfX0se2tleTpcIm9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiB0aGlzLl9vbk9mZihcIm9uXCIsdCxlLG4pfX0se2tleTpcIm9mZlwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4gdGhpcy5fb25PZmYoXCJvZmZcIix0LGUsbil9fSx7a2V5Olwic2V0XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZGVmYXVsdHM7Zm9yKHZhciBuIGluIGkuZGVmYXVsdC5vYmplY3QodCl8fCh0PXt9KSx0aGlzLm9wdGlvbnM9KDAsZ2UuZGVmYXVsdCkoZS5iYXNlKSx0aGlzLl9hY3Rpb25zLm1ldGhvZERpY3Qpe3ZhciByPW4sbz10aGlzLl9hY3Rpb25zLm1ldGhvZERpY3Rbcl07dGhpcy5vcHRpb25zW3JdPXt9LHRoaXMuc2V0UGVyQWN0aW9uKHIsKDAsai5kZWZhdWx0KSgoMCxqLmRlZmF1bHQpKHt9LGUucGVyQWN0aW9uKSxlLmFjdGlvbnNbcl0pKSx0aGlzW29dKHRbcl0pfWZvcih2YXIgYSBpbiB0KWkuZGVmYXVsdC5mdW5jKHRoaXNbYV0pJiZ0aGlzW2FdKHRbYV0pO3JldHVybiB0aGlzfX0se2tleTpcInVuc2V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtpZihpLmRlZmF1bHQuc3RyaW5nKHRoaXMudGFyZ2V0KSlmb3IodmFyIHQgaW4gdGhpcy5fc2NvcGVFdmVudHMuZGVsZWdhdGVkRXZlbnRzKWZvcih2YXIgZT10aGlzLl9zY29wZUV2ZW50cy5kZWxlZ2F0ZWRFdmVudHNbdF0sbj1lLmxlbmd0aC0xO24+PTA7bi0tKXt2YXIgcj1lW25dLG89ci5zZWxlY3RvcixhPXIuY29udGV4dCxzPXIubGlzdGVuZXJzO289PT10aGlzLnRhcmdldCYmYT09PXRoaXMuX2NvbnRleHQmJmUuc3BsaWNlKG4sMSk7Zm9yKHZhciBsPXMubGVuZ3RoLTE7bD49MDtsLS0pdGhpcy5fc2NvcGVFdmVudHMucmVtb3ZlRGVsZWdhdGUodGhpcy50YXJnZXQsdGhpcy5fY29udGV4dCx0LHNbbF1bMF0sc1tsXVsxXSl9ZWxzZSB0aGlzLl9zY29wZUV2ZW50cy5yZW1vdmUodGhpcy50YXJnZXQsXCJhbGxcIil9fV0pJiZtbihuLnByb3RvdHlwZSxyKSx0fSgpO3luLkludGVyYWN0YWJsZT14bjt2YXIgd249e307ZnVuY3Rpb24gX24odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIFBuKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkod24sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksd24uSW50ZXJhY3RhYmxlU2V0PXZvaWQgMDt2YXIgT249ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpe3ZhciBuPXRoaXM7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxQbih0aGlzLFwibGlzdFwiLFtdKSxQbih0aGlzLFwic2VsZWN0b3JNYXBcIix7fSksUG4odGhpcyxcInNjb3BlXCIsdm9pZCAwKSx0aGlzLnNjb3BlPWUsZS5hZGRMaXN0ZW5lcnMoe1wiaW50ZXJhY3RhYmxlOnVuc2V0XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGFibGUscj1lLnRhcmdldCxvPWUuX2NvbnRleHQsYT1pLmRlZmF1bHQuc3RyaW5nKHIpP24uc2VsZWN0b3JNYXBbcl06cltuLnNjb3BlLmlkXSxzPVouZmluZEluZGV4KGEsKGZ1bmN0aW9uKHQpe3JldHVybiB0LmNvbnRleHQ9PT1vfSkpO2Fbc10mJihhW3NdLmNvbnRleHQ9bnVsbCxhW3NdLmludGVyYWN0YWJsZT1udWxsKSxhLnNwbGljZShzLDEpfX0pfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcIm5ld1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7ZT0oMCxqLmRlZmF1bHQpKGV8fHt9LHthY3Rpb25zOnRoaXMuc2NvcGUuYWN0aW9uc30pO3ZhciBuPW5ldyB0aGlzLnNjb3BlLkludGVyYWN0YWJsZSh0LGUsdGhpcy5zY29wZS5kb2N1bWVudCx0aGlzLnNjb3BlLmV2ZW50cykscj17Y29udGV4dDpuLl9jb250ZXh0LGludGVyYWN0YWJsZTpufTtyZXR1cm4gdGhpcy5zY29wZS5hZGREb2N1bWVudChuLl9kb2MpLHRoaXMubGlzdC5wdXNoKG4pLGkuZGVmYXVsdC5zdHJpbmcodCk/KHRoaXMuc2VsZWN0b3JNYXBbdF18fCh0aGlzLnNlbGVjdG9yTWFwW3RdPVtdKSx0aGlzLnNlbGVjdG9yTWFwW3RdLnB1c2gocikpOihuLnRhcmdldFt0aGlzLnNjb3BlLmlkXXx8T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsdGhpcy5zY29wZS5pZCx7dmFsdWU6W10sY29uZmlndXJhYmxlOiEwfSksdFt0aGlzLnNjb3BlLmlkXS5wdXNoKHIpKSx0aGlzLnNjb3BlLmZpcmUoXCJpbnRlcmFjdGFibGU6bmV3XCIse3RhcmdldDp0LG9wdGlvbnM6ZSxpbnRlcmFjdGFibGU6bix3aW46dGhpcy5zY29wZS5fd2lufSksbn19LHtrZXk6XCJnZXRcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPWUmJmUuY29udGV4dHx8dGhpcy5zY29wZS5kb2N1bWVudCxyPWkuZGVmYXVsdC5zdHJpbmcodCksbz1yP3RoaXMuc2VsZWN0b3JNYXBbdF06dFt0aGlzLnNjb3BlLmlkXTtpZighbylyZXR1cm4gbnVsbDt2YXIgYT1aLmZpbmQobywoZnVuY3Rpb24oZSl7cmV0dXJuIGUuY29udGV4dD09PW4mJihyfHxlLmludGVyYWN0YWJsZS5pbkNvbnRleHQodCkpfSkpO3JldHVybiBhJiZhLmludGVyYWN0YWJsZX19LHtrZXk6XCJmb3JFYWNoTWF0Y2hcIix2YWx1ZTpmdW5jdGlvbih0LGUpe2Zvcih2YXIgbj0wO248dGhpcy5saXN0Lmxlbmd0aDtuKyspe3ZhciByPXRoaXMubGlzdFtuXSxvPXZvaWQgMDtpZigoaS5kZWZhdWx0LnN0cmluZyhyLnRhcmdldCk/aS5kZWZhdWx0LmVsZW1lbnQodCkmJl8ubWF0Y2hlc1NlbGVjdG9yKHQsci50YXJnZXQpOnQ9PT1yLnRhcmdldCkmJnIuaW5Db250ZXh0KHQpJiYobz1lKHIpKSx2b2lkIDAhPT1vKXJldHVybiBvfX19XSkmJl9uKGUucHJvdG90eXBlLG4pLHR9KCk7d24uSW50ZXJhY3RhYmxlU2V0PU9uO3ZhciBTbj17fTtmdW5jdGlvbiBFbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gVG4odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fWZ1bmN0aW9uIE1uKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KHQpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0odCxlKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gam4odCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP2puKHQsZSk6dm9pZCAwfX0odCxlKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpfWZ1bmN0aW9uIGpuKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1PYmplY3QuZGVmaW5lUHJvcGVydHkoU24sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksU24uZGVmYXVsdD12b2lkIDA7dmFyIGtuPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLFRuKHRoaXMsXCJjdXJyZW50VGFyZ2V0XCIsdm9pZCAwKSxUbih0aGlzLFwib3JpZ2luYWxFdmVudFwiLHZvaWQgMCksVG4odGhpcyxcInR5cGVcIix2b2lkIDApLHRoaXMub3JpZ2luYWxFdmVudD1lLCgwLEYuZGVmYXVsdCkodGhpcyxlKX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJwcmV2ZW50T3JpZ2luYWxEZWZhdWx0XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKX19LHtrZXk6XCJzdG9wUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMub3JpZ2luYWxFdmVudC5zdG9wUHJvcGFnYXRpb24oKX19LHtrZXk6XCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMub3JpZ2luYWxFdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKX19XSkmJkVuKGUucHJvdG90eXBlLG4pLHR9KCk7ZnVuY3Rpb24gSW4odCl7aWYoIWkuZGVmYXVsdC5vYmplY3QodCkpcmV0dXJue2NhcHR1cmU6ISF0LHBhc3NpdmU6ITF9O3ZhciBlPSgwLGouZGVmYXVsdCkoe30sdCk7cmV0dXJuIGUuY2FwdHVyZT0hIXQuY2FwdHVyZSxlLnBhc3NpdmU9ISF0LnBhc3NpdmUsZX12YXIgRG49e2lkOlwiZXZlbnRzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZSxuPVtdLHI9e30sbz1bXSxhPXthZGQ6cyxyZW1vdmU6bCxhZGREZWxlZ2F0ZTpmdW5jdGlvbih0LGUsbixpLGEpe3ZhciBsPUluKGEpO2lmKCFyW25dKXtyW25dPVtdO2Zvcih2YXIgZj0wO2Y8by5sZW5ndGg7ZisrKXt2YXIgZD1vW2ZdO3MoZCxuLHUpLHMoZCxuLGMsITApfX12YXIgcD1yW25dLHY9Wi5maW5kKHAsKGZ1bmN0aW9uKG4pe3JldHVybiBuLnNlbGVjdG9yPT09dCYmbi5jb250ZXh0PT09ZX0pKTt2fHwodj17c2VsZWN0b3I6dCxjb250ZXh0OmUsbGlzdGVuZXJzOltdfSxwLnB1c2godikpLHYubGlzdGVuZXJzLnB1c2goW2ksbF0pfSxyZW1vdmVEZWxlZ2F0ZTpmdW5jdGlvbih0LGUsbixvLGkpe3ZhciBhLHM9SW4oaSksZj1yW25dLGQ9ITE7aWYoZilmb3IoYT1mLmxlbmd0aC0xO2E+PTA7YS0tKXt2YXIgcD1mW2FdO2lmKHAuc2VsZWN0b3I9PT10JiZwLmNvbnRleHQ9PT1lKXtmb3IodmFyIHY9cC5saXN0ZW5lcnMsaD12Lmxlbmd0aC0xO2g+PTA7aC0tKXt2YXIgZz1Nbih2W2hdLDIpLHk9Z1swXSxtPWdbMV0sYj1tLmNhcHR1cmUseD1tLnBhc3NpdmU7aWYoeT09PW8mJmI9PT1zLmNhcHR1cmUmJng9PT1zLnBhc3NpdmUpe3Yuc3BsaWNlKGgsMSksdi5sZW5ndGh8fChmLnNwbGljZShhLDEpLGwoZSxuLHUpLGwoZSxuLGMsITApKSxkPSEwO2JyZWFrfX1pZihkKWJyZWFrfX19LGRlbGVnYXRlTGlzdGVuZXI6dSxkZWxlZ2F0ZVVzZUNhcHR1cmU6YyxkZWxlZ2F0ZWRFdmVudHM6cixkb2N1bWVudHM6byx0YXJnZXRzOm4sc3VwcG9ydHNPcHRpb25zOiExLHN1cHBvcnRzUGFzc2l2ZTohMX07ZnVuY3Rpb24gcyh0LGUscixvKXt2YXIgaT1JbihvKSxzPVouZmluZChuLChmdW5jdGlvbihlKXtyZXR1cm4gZS5ldmVudFRhcmdldD09PXR9KSk7c3x8KHM9e2V2ZW50VGFyZ2V0OnQsZXZlbnRzOnt9fSxuLnB1c2gocykpLHMuZXZlbnRzW2VdfHwocy5ldmVudHNbZV09W10pLHQuYWRkRXZlbnRMaXN0ZW5lciYmIVouY29udGFpbnMocy5ldmVudHNbZV0scikmJih0LmFkZEV2ZW50TGlzdGVuZXIoZSxyLGEuc3VwcG9ydHNPcHRpb25zP2k6aS5jYXB0dXJlKSxzLmV2ZW50c1tlXS5wdXNoKHIpKX1mdW5jdGlvbiBsKHQsZSxyLG8pe3ZhciBpPUluKG8pLHM9Wi5maW5kSW5kZXgobiwoZnVuY3Rpb24oZSl7cmV0dXJuIGUuZXZlbnRUYXJnZXQ9PT10fSkpLHU9bltzXTtpZih1JiZ1LmV2ZW50cylpZihcImFsbFwiIT09ZSl7dmFyIGM9ITEsZj11LmV2ZW50c1tlXTtpZihmKXtpZihcImFsbFwiPT09cil7Zm9yKHZhciBkPWYubGVuZ3RoLTE7ZD49MDtkLS0pbCh0LGUsZltkXSxpKTtyZXR1cm59Zm9yKHZhciBwPTA7cDxmLmxlbmd0aDtwKyspaWYoZltwXT09PXIpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLHIsYS5zdXBwb3J0c09wdGlvbnM/aTppLmNhcHR1cmUpLGYuc3BsaWNlKHAsMSksMD09PWYubGVuZ3RoJiYoZGVsZXRlIHUuZXZlbnRzW2VdLGM9ITApO2JyZWFrfX1jJiYhT2JqZWN0LmtleXModS5ldmVudHMpLmxlbmd0aCYmbi5zcGxpY2UocywxKX1lbHNlIGZvcihlIGluIHUuZXZlbnRzKXUuZXZlbnRzLmhhc093blByb3BlcnR5KGUpJiZsKHQsZSxcImFsbFwiKX1mdW5jdGlvbiB1KHQsZSl7Zm9yKHZhciBuPUluKGUpLG89bmV3IGtuKHQpLGE9clt0LnR5cGVdLHM9TW4oQi5nZXRFdmVudFRhcmdldHModCksMSlbMF0sbD1zO2kuZGVmYXVsdC5lbGVtZW50KGwpOyl7Zm9yKHZhciB1PTA7dTxhLmxlbmd0aDt1Kyspe3ZhciBjPWFbdV0sZj1jLnNlbGVjdG9yLGQ9Yy5jb250ZXh0O2lmKF8ubWF0Y2hlc1NlbGVjdG9yKGwsZikmJl8ubm9kZUNvbnRhaW5zKGQscykmJl8ubm9kZUNvbnRhaW5zKGQsbCkpe3ZhciBwPWMubGlzdGVuZXJzO28uY3VycmVudFRhcmdldD1sO2Zvcih2YXIgdj0wO3Y8cC5sZW5ndGg7disrKXt2YXIgaD1NbihwW3ZdLDIpLGc9aFswXSx5PWhbMV0sbT15LmNhcHR1cmUsYj15LnBhc3NpdmU7bT09PW4uY2FwdHVyZSYmYj09PW4ucGFzc2l2ZSYmZyhvKX19fWw9Xy5wYXJlbnROb2RlKGwpfX1mdW5jdGlvbiBjKHQpe3JldHVybiB1KHQsITApfXJldHVybiBudWxsPT0oZT10LmRvY3VtZW50KXx8ZS5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJ0ZXN0XCIsbnVsbCx7Z2V0IGNhcHR1cmUoKXtyZXR1cm4gYS5zdXBwb3J0c09wdGlvbnM9ITB9LGdldCBwYXNzaXZlKCl7cmV0dXJuIGEuc3VwcG9ydHNQYXNzaXZlPSEwfX0pLHQuZXZlbnRzPWEsYX19O1NuLmRlZmF1bHQ9RG47dmFyIEFuPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShBbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxBbi5kZWZhdWx0PXZvaWQgMDt2YXIgUm49e21ldGhvZE9yZGVyOltcInNpbXVsYXRpb25SZXN1bWVcIixcIm1vdXNlT3JQZW5cIixcImhhc1BvaW50ZXJcIixcImlkbGVcIl0sc2VhcmNoOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8Um4ubWV0aG9kT3JkZXIubGVuZ3RoO2UrKyl7dmFyIG47bj1Sbi5tZXRob2RPcmRlcltlXTt2YXIgcj1SbltuXSh0KTtpZihyKXJldHVybiByfXJldHVybiBudWxsfSxzaW11bGF0aW9uUmVzdW1lOmZ1bmN0aW9uKHQpe3ZhciBlPXQucG9pbnRlclR5cGUsbj10LmV2ZW50VHlwZSxyPXQuZXZlbnRUYXJnZXQsbz10LnNjb3BlO2lmKCEvZG93bnxzdGFydC9pLnRlc3QobikpcmV0dXJuIG51bGw7Zm9yKHZhciBpPTA7aTxvLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtpKyspe3ZhciBhPW8uaW50ZXJhY3Rpb25zLmxpc3RbaV0scz1yO2lmKGEuc2ltdWxhdGlvbiYmYS5zaW11bGF0aW9uLmFsbG93UmVzdW1lJiZhLnBvaW50ZXJUeXBlPT09ZSlmb3IoO3M7KXtpZihzPT09YS5lbGVtZW50KXJldHVybiBhO3M9Xy5wYXJlbnROb2RlKHMpfX1yZXR1cm4gbnVsbH0sbW91c2VPclBlbjpmdW5jdGlvbih0KXt2YXIgZSxuPXQucG9pbnRlcklkLHI9dC5wb2ludGVyVHlwZSxvPXQuZXZlbnRUeXBlLGk9dC5zY29wZTtpZihcIm1vdXNlXCIhPT1yJiZcInBlblwiIT09cilyZXR1cm4gbnVsbDtmb3IodmFyIGE9MDthPGkuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO2ErKyl7dmFyIHM9aS5pbnRlcmFjdGlvbnMubGlzdFthXTtpZihzLnBvaW50ZXJUeXBlPT09cil7aWYocy5zaW11bGF0aW9uJiYhem4ocyxuKSljb250aW51ZTtpZihzLmludGVyYWN0aW5nKCkpcmV0dXJuIHM7ZXx8KGU9cyl9fWlmKGUpcmV0dXJuIGU7Zm9yKHZhciBsPTA7bDxpLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtsKyspe3ZhciB1PWkuaW50ZXJhY3Rpb25zLmxpc3RbbF07aWYoISh1LnBvaW50ZXJUeXBlIT09cnx8L2Rvd24vaS50ZXN0KG8pJiZ1LnNpbXVsYXRpb24pKXJldHVybiB1fXJldHVybiBudWxsfSxoYXNQb2ludGVyOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT10LnBvaW50ZXJJZCxuPXQuc2NvcGUscj0wO3I8bi5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7cisrKXt2YXIgbz1uLmludGVyYWN0aW9ucy5saXN0W3JdO2lmKHpuKG8sZSkpcmV0dXJuIG99cmV0dXJuIG51bGx9LGlkbGU6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXQucG9pbnRlclR5cGUsbj10LnNjb3BlLHI9MDtyPG4uaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO3IrKyl7dmFyIG89bi5pbnRlcmFjdGlvbnMubGlzdFtyXTtpZigxPT09by5wb2ludGVycy5sZW5ndGgpe3ZhciBpPW8uaW50ZXJhY3RhYmxlO2lmKGkmJighaS5vcHRpb25zLmdlc3R1cmV8fCFpLm9wdGlvbnMuZ2VzdHVyZS5lbmFibGVkKSljb250aW51ZX1lbHNlIGlmKG8ucG9pbnRlcnMubGVuZ3RoPj0yKWNvbnRpbnVlO2lmKCFvLmludGVyYWN0aW5nKCkmJmU9PT1vLnBvaW50ZXJUeXBlKXJldHVybiBvfXJldHVybiBudWxsfX07ZnVuY3Rpb24gem4odCxlKXtyZXR1cm4gdC5wb2ludGVycy5zb21lKChmdW5jdGlvbih0KXtyZXR1cm4gdC5pZD09PWV9KSl9dmFyIENuPVJuO0FuLmRlZmF1bHQ9Q247dmFyIEZuPXt9O2Z1bmN0aW9uIFhuKHQpe3JldHVybihYbj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9ZnVuY3Rpb24gWW4odCxlKXtyZXR1cm4gZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0odCl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fSh0LGUpfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBCbih0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/Qm4odCxlKTp2b2lkIDB9fSh0LGUpfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCl9ZnVuY3Rpb24gQm4odCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfWZ1bmN0aW9uIFduKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiBMbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gVW4odCxlKXtyZXR1cm4oVW49T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIFZuKHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1YbihlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9mdW5jdGlvbih0KXtpZih2b2lkIDA9PT10KXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4gdH0odCk6ZX1mdW5jdGlvbiBObih0KXtyZXR1cm4oTm49T2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5nZXRQcm90b3R5cGVPZjpmdW5jdGlvbih0KXtyZXR1cm4gdC5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0KX0pKHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShGbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxGbi5kZWZhdWx0PXZvaWQgMDt2YXIgcW49W1wicG9pbnRlckRvd25cIixcInBvaW50ZXJNb3ZlXCIsXCJwb2ludGVyVXBcIixcInVwZGF0ZVBvaW50ZXJcIixcInJlbW92ZVBvaW50ZXJcIixcIndpbmRvd0JsdXJcIl07ZnVuY3Rpb24gJG4odCxlKXtyZXR1cm4gZnVuY3Rpb24obil7dmFyIHI9ZS5pbnRlcmFjdGlvbnMubGlzdCxvPUIuZ2V0UG9pbnRlclR5cGUobiksaT1ZbihCLmdldEV2ZW50VGFyZ2V0cyhuKSwyKSxhPWlbMF0scz1pWzFdLGw9W107aWYoL150b3VjaC8udGVzdChuLnR5cGUpKXtlLnByZXZUb3VjaFRpbWU9ZS5ub3coKTtmb3IodmFyIHU9MDt1PG4uY2hhbmdlZFRvdWNoZXMubGVuZ3RoO3UrKyl7dmFyIGM9bi5jaGFuZ2VkVG91Y2hlc1t1XSxmPXtwb2ludGVyOmMscG9pbnRlcklkOkIuZ2V0UG9pbnRlcklkKGMpLHBvaW50ZXJUeXBlOm8sZXZlbnRUeXBlOm4udHlwZSxldmVudFRhcmdldDphLGN1ckV2ZW50VGFyZ2V0OnMsc2NvcGU6ZX0sZD1HbihmKTtsLnB1c2goW2YucG9pbnRlcixmLmV2ZW50VGFyZ2V0LGYuY3VyRXZlbnRUYXJnZXQsZF0pfX1lbHNle3ZhciBwPSExO2lmKCFiLmRlZmF1bHQuc3VwcG9ydHNQb2ludGVyRXZlbnQmJi9tb3VzZS8udGVzdChuLnR5cGUpKXtmb3IodmFyIHY9MDt2PHIubGVuZ3RoJiYhcDt2KyspcD1cIm1vdXNlXCIhPT1yW3ZdLnBvaW50ZXJUeXBlJiZyW3ZdLnBvaW50ZXJJc0Rvd247cD1wfHxlLm5vdygpLWUucHJldlRvdWNoVGltZTw1MDB8fDA9PT1uLnRpbWVTdGFtcH1pZighcCl7dmFyIGg9e3BvaW50ZXI6bixwb2ludGVySWQ6Qi5nZXRQb2ludGVySWQobikscG9pbnRlclR5cGU6byxldmVudFR5cGU6bi50eXBlLGN1ckV2ZW50VGFyZ2V0OnMsZXZlbnRUYXJnZXQ6YSxzY29wZTplfSxnPUduKGgpO2wucHVzaChbaC5wb2ludGVyLGguZXZlbnRUYXJnZXQsaC5jdXJFdmVudFRhcmdldCxnXSl9fWZvcih2YXIgeT0wO3k8bC5sZW5ndGg7eSsrKXt2YXIgbT1ZbihsW3ldLDQpLHg9bVswXSx3PW1bMV0sXz1tWzJdO21bM11bdF0oeCxuLHcsXyl9fX1mdW5jdGlvbiBHbih0KXt2YXIgZT10LnBvaW50ZXJUeXBlLG49dC5zY29wZSxyPXtpbnRlcmFjdGlvbjpBbi5kZWZhdWx0LnNlYXJjaCh0KSxzZWFyY2hEZXRhaWxzOnR9O3JldHVybiBuLmZpcmUoXCJpbnRlcmFjdGlvbnM6ZmluZFwiLHIpLHIuaW50ZXJhY3Rpb258fG4uaW50ZXJhY3Rpb25zLm5ldyh7cG9pbnRlclR5cGU6ZX0pfWZ1bmN0aW9uIEhuKHQsZSl7dmFyIG49dC5kb2Mscj10LnNjb3BlLG89dC5vcHRpb25zLGk9ci5pbnRlcmFjdGlvbnMuZG9jRXZlbnRzLGE9ci5ldmVudHMscz1hW2VdO2Zvcih2YXIgbCBpbiByLmJyb3dzZXIuaXNJT1MmJiFvLmV2ZW50cyYmKG8uZXZlbnRzPXtwYXNzaXZlOiExfSksYS5kZWxlZ2F0ZWRFdmVudHMpcyhuLGwsYS5kZWxlZ2F0ZUxpc3RlbmVyKSxzKG4sbCxhLmRlbGVnYXRlVXNlQ2FwdHVyZSwhMCk7Zm9yKHZhciB1PW8mJm8uZXZlbnRzLGM9MDtjPGkubGVuZ3RoO2MrKyl7dmFyIGY9aVtjXTtzKG4sZi50eXBlLGYubGlzdGVuZXIsdSl9fXZhciBLbj17aWQ6XCJjb3JlL2ludGVyYWN0aW9uc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXt9LG49MDtuPHFuLmxlbmd0aDtuKyspe3ZhciByPXFuW25dO2Vbcl09JG4ocix0KX12YXIgbyxpPWIuZGVmYXVsdC5wRXZlbnRUeXBlcztmdW5jdGlvbiBhKCl7Zm9yKHZhciBlPTA7ZTx0LmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtlKyspe3ZhciBuPXQuaW50ZXJhY3Rpb25zLmxpc3RbZV07aWYobi5wb2ludGVySXNEb3duJiZcInRvdWNoXCI9PT1uLnBvaW50ZXJUeXBlJiYhbi5faW50ZXJhY3RpbmcpZm9yKHZhciByPWZ1bmN0aW9uKCl7dmFyIGU9bi5wb2ludGVyc1tvXTt0LmRvY3VtZW50cy5zb21lKChmdW5jdGlvbih0KXt2YXIgbj10LmRvYztyZXR1cm4oMCxfLm5vZGVDb250YWlucykobixlLmRvd25UYXJnZXQpfSkpfHxuLnJlbW92ZVBvaW50ZXIoZS5wb2ludGVyLGUuZXZlbnQpfSxvPTA7bzxuLnBvaW50ZXJzLmxlbmd0aDtvKyspcigpfX0obz1oLmRlZmF1bHQuUG9pbnRlckV2ZW50P1t7dHlwZTppLmRvd24sbGlzdGVuZXI6YX0se3R5cGU6aS5kb3duLGxpc3RlbmVyOmUucG9pbnRlckRvd259LHt0eXBlOmkubW92ZSxsaXN0ZW5lcjplLnBvaW50ZXJNb3ZlfSx7dHlwZTppLnVwLGxpc3RlbmVyOmUucG9pbnRlclVwfSx7dHlwZTppLmNhbmNlbCxsaXN0ZW5lcjplLnBvaW50ZXJVcH1dOlt7dHlwZTpcIm1vdXNlZG93blwiLGxpc3RlbmVyOmUucG9pbnRlckRvd259LHt0eXBlOlwibW91c2Vtb3ZlXCIsbGlzdGVuZXI6ZS5wb2ludGVyTW92ZX0se3R5cGU6XCJtb3VzZXVwXCIsbGlzdGVuZXI6ZS5wb2ludGVyVXB9LHt0eXBlOlwidG91Y2hzdGFydFwiLGxpc3RlbmVyOmF9LHt0eXBlOlwidG91Y2hzdGFydFwiLGxpc3RlbmVyOmUucG9pbnRlckRvd259LHt0eXBlOlwidG91Y2htb3ZlXCIsbGlzdGVuZXI6ZS5wb2ludGVyTW92ZX0se3R5cGU6XCJ0b3VjaGVuZFwiLGxpc3RlbmVyOmUucG9pbnRlclVwfSx7dHlwZTpcInRvdWNoY2FuY2VsXCIsbGlzdGVuZXI6ZS5wb2ludGVyVXB9XSkucHVzaCh7dHlwZTpcImJsdXJcIixsaXN0ZW5lcjpmdW5jdGlvbihlKXtmb3IodmFyIG49MDtuPHQuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO24rKyl0LmludGVyYWN0aW9ucy5saXN0W25dLmRvY3VtZW50Qmx1cihlKX19KSx0LnByZXZUb3VjaFRpbWU9MCx0LkludGVyYWN0aW9uPWZ1bmN0aW9uKGUpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmVW4odCxlKX0ocyxlKTt2YXIgbixyLG8saSxhPShvPXMsaT1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBSZWZsZWN0fHwhUmVmbGVjdC5jb25zdHJ1Y3QpcmV0dXJuITE7aWYoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSlyZXR1cm4hMTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm94eSlyZXR1cm4hMDt0cnl7cmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLFtdLChmdW5jdGlvbigpe30pKSksITB9Y2F0Y2godCl7cmV0dXJuITF9fSgpLGZ1bmN0aW9uKCl7dmFyIHQsZT1ObihvKTtpZihpKXt2YXIgbj1Obih0aGlzKS5jb25zdHJ1Y3Rvcjt0PVJlZmxlY3QuY29uc3RydWN0KGUsYXJndW1lbnRzLG4pfWVsc2UgdD1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gVm4odGhpcyx0KX0pO2Z1bmN0aW9uIHMoKXtyZXR1cm4gV24odGhpcyxzKSxhLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gbj1zLChyPVt7a2V5OlwicG9pbnRlck1vdmVUb2xlcmFuY2VcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdC5pbnRlcmFjdGlvbnMucG9pbnRlck1vdmVUb2xlcmFuY2V9LHNldDpmdW5jdGlvbihlKXt0LmludGVyYWN0aW9ucy5wb2ludGVyTW92ZVRvbGVyYW5jZT1lfX0se2tleTpcIl9ub3dcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0Lm5vdygpfX1dKSYmTG4obi5wcm90b3R5cGUsciksc30oTGUuZGVmYXVsdCksdC5pbnRlcmFjdGlvbnM9e2xpc3Q6W10sbmV3OmZ1bmN0aW9uKGUpe2Uuc2NvcGVGaXJlPWZ1bmN0aW9uKGUsbil7cmV0dXJuIHQuZmlyZShlLG4pfTt2YXIgbj1uZXcgdC5JbnRlcmFjdGlvbihlKTtyZXR1cm4gdC5pbnRlcmFjdGlvbnMubGlzdC5wdXNoKG4pLG59LGxpc3RlbmVyczplLGRvY0V2ZW50czpvLHBvaW50ZXJNb3ZlVG9sZXJhbmNlOjF9LHQudXNlUGx1Z2luKHNlLmRlZmF1bHQpfSxsaXN0ZW5lcnM6e1wic2NvcGU6YWRkLWRvY3VtZW50XCI6ZnVuY3Rpb24odCl7cmV0dXJuIEhuKHQsXCJhZGRcIil9LFwic2NvcGU6cmVtb3ZlLWRvY3VtZW50XCI6ZnVuY3Rpb24odCl7cmV0dXJuIEhuKHQsXCJyZW1vdmVcIil9LFwiaW50ZXJhY3RhYmxlOnVuc2V0XCI6ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49dC5pbnRlcmFjdGFibGUscj1lLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aC0xO3I+PTA7ci0tKXt2YXIgbz1lLmludGVyYWN0aW9ucy5saXN0W3JdO28uaW50ZXJhY3RhYmxlPT09biYmKG8uc3RvcCgpLGUuZmlyZShcImludGVyYWN0aW9uczpkZXN0cm95XCIse2ludGVyYWN0aW9uOm99KSxvLmRlc3Ryb3koKSxlLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aD4yJiZlLmludGVyYWN0aW9ucy5saXN0LnNwbGljZShyLDEpKX19fSxvbkRvY1NpZ25hbDpIbixkb09uSW50ZXJhY3Rpb25zOiRuLG1ldGhvZE5hbWVzOnFufTtGbi5kZWZhdWx0PUtuO3ZhciBabj17fTtmdW5jdGlvbiBKbih0KXtyZXR1cm4oSm49XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIFFuKHQsZSxuKXtyZXR1cm4oUW49XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFJlZmxlY3QmJlJlZmxlY3QuZ2V0P1JlZmxlY3QuZ2V0OmZ1bmN0aW9uKHQsZSxuKXt2YXIgcj1mdW5jdGlvbih0LGUpe2Zvcig7IU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0LGUpJiZudWxsIT09KHQ9bnIodCkpOyk7cmV0dXJuIHR9KHQsZSk7aWYocil7dmFyIG89T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihyLGUpO3JldHVybiBvLmdldD9vLmdldC5jYWxsKG4pOm8udmFsdWV9fSkodCxlLG58fHQpfWZ1bmN0aW9uIHRyKHQsZSl7cmV0dXJuKHRyPU9iamVjdC5zZXRQcm90b3R5cGVPZnx8ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5fX3Byb3RvX189ZSx0fSkodCxlKX1mdW5jdGlvbiBlcih0LGUpe3JldHVybiFlfHxcIm9iamVjdFwiIT09Sm4oZSkmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGU/ZnVuY3Rpb24odCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9KHQpOmV9ZnVuY3Rpb24gbnIodCl7cmV0dXJuKG5yPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1mdW5jdGlvbiBycih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gb3IodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIGlyKHQsZSxuKXtyZXR1cm4gZSYmb3IodC5wcm90b3R5cGUsZSksbiYmb3IodCxuKSx0fWZ1bmN0aW9uIGFyKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoWm4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWm4uaW5pdFNjb3BlPWxyLFpuLlNjb3BlPXZvaWQgMDt2YXIgc3I9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7dmFyIGU9dGhpcztycih0aGlzLHQpLGFyKHRoaXMsXCJpZFwiLFwiX19pbnRlcmFjdF9zY29wZV9cIi5jb25jYXQoTWF0aC5mbG9vcigxMDAqTWF0aC5yYW5kb20oKSkpKSxhcih0aGlzLFwiaXNJbml0aWFsaXplZFwiLCExKSxhcih0aGlzLFwibGlzdGVuZXJNYXBzXCIsW10pLGFyKHRoaXMsXCJicm93c2VyXCIsYi5kZWZhdWx0KSxhcih0aGlzLFwiZGVmYXVsdHNcIiwoMCxnZS5kZWZhdWx0KShNZS5kZWZhdWx0cykpLGFyKHRoaXMsXCJFdmVudGFibGVcIixjbi5FdmVudGFibGUpLGFyKHRoaXMsXCJhY3Rpb25zXCIse21hcDp7fSxwaGFzZXM6e3N0YXJ0OiEwLG1vdmU6ITAsZW5kOiEwfSxtZXRob2REaWN0Ont9LHBoYXNlbGVzc1R5cGVzOnt9fSksYXIodGhpcyxcImludGVyYWN0U3RhdGljXCIsKDAsZ24uY3JlYXRlSW50ZXJhY3RTdGF0aWMpKHRoaXMpKSxhcih0aGlzLFwiSW50ZXJhY3RFdmVudFwiLGplLkludGVyYWN0RXZlbnQpLGFyKHRoaXMsXCJJbnRlcmFjdGFibGVcIix2b2lkIDApLGFyKHRoaXMsXCJpbnRlcmFjdGFibGVzXCIsbmV3IHduLkludGVyYWN0YWJsZVNldCh0aGlzKSksYXIodGhpcyxcIl93aW5cIix2b2lkIDApLGFyKHRoaXMsXCJkb2N1bWVudFwiLHZvaWQgMCksYXIodGhpcyxcIndpbmRvd1wiLHZvaWQgMCksYXIodGhpcyxcImRvY3VtZW50c1wiLFtdKSxhcih0aGlzLFwiX3BsdWdpbnNcIix7bGlzdDpbXSxtYXA6e319KSxhcih0aGlzLFwib25XaW5kb3dVbmxvYWRcIiwoZnVuY3Rpb24odCl7cmV0dXJuIGUucmVtb3ZlRG9jdW1lbnQodC50YXJnZXQpfSkpO3ZhciBuPXRoaXM7dGhpcy5JbnRlcmFjdGFibGU9ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZSYmZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp0LHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSxlJiZ0cih0LGUpfShpLHQpO3ZhciBlLHIsbz0oZT1pLHI9ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LG49bnIoZSk7aWYocil7dmFyIG89bnIodGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChuLGFyZ3VtZW50cyxvKX1lbHNlIHQ9bi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIGVyKHRoaXMsdCl9KTtmdW5jdGlvbiBpKCl7cmV0dXJuIHJyKHRoaXMsaSksby5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIGlyKGksW3trZXk6XCJfZGVmYXVsdHNcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gbi5kZWZhdWx0c319LHtrZXk6XCJzZXRcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gUW4obnIoaS5wcm90b3R5cGUpLFwic2V0XCIsdGhpcykuY2FsbCh0aGlzLHQpLG4uZmlyZShcImludGVyYWN0YWJsZTpzZXRcIix7b3B0aW9uczp0LGludGVyYWN0YWJsZTp0aGlzfSksdGhpc319LHtrZXk6XCJ1bnNldFwiLHZhbHVlOmZ1bmN0aW9uKCl7UW4obnIoaS5wcm90b3R5cGUpLFwidW5zZXRcIix0aGlzKS5jYWxsKHRoaXMpLG4uaW50ZXJhY3RhYmxlcy5saXN0LnNwbGljZShuLmludGVyYWN0YWJsZXMubGlzdC5pbmRleE9mKHRoaXMpLDEpLG4uZmlyZShcImludGVyYWN0YWJsZTp1bnNldFwiLHtpbnRlcmFjdGFibGU6dGhpc30pfX1dKSxpfSh5bi5JbnRlcmFjdGFibGUpfXJldHVybiBpcih0LFt7a2V5OlwiYWRkTGlzdGVuZXJzXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt0aGlzLmxpc3RlbmVyTWFwcy5wdXNoKHtpZDplLG1hcDp0fSl9fSx7a2V5OlwiZmlyZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPTA7bjx0aGlzLmxpc3RlbmVyTWFwcy5sZW5ndGg7bisrKXt2YXIgcj10aGlzLmxpc3RlbmVyTWFwc1tuXS5tYXBbdF07aWYociYmITE9PT1yKGUsdGhpcyx0KSlyZXR1cm4hMX19fSx7a2V5OlwiaW5pdFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmlzSW5pdGlhbGl6ZWQ/dGhpczpscih0aGlzLHQpfX0se2tleTpcInBsdWdpbklzSW5zdGFsbGVkXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX3BsdWdpbnMubWFwW3QuaWRdfHwtMSE9PXRoaXMuX3BsdWdpbnMubGlzdC5pbmRleE9mKHQpfX0se2tleTpcInVzZVBsdWdpblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7aWYoIXRoaXMuaXNJbml0aWFsaXplZClyZXR1cm4gdGhpcztpZih0aGlzLnBsdWdpbklzSW5zdGFsbGVkKHQpKXJldHVybiB0aGlzO2lmKHQuaWQmJih0aGlzLl9wbHVnaW5zLm1hcFt0LmlkXT10KSx0aGlzLl9wbHVnaW5zLmxpc3QucHVzaCh0KSx0Lmluc3RhbGwmJnQuaW5zdGFsbCh0aGlzLGUpLHQubGlzdGVuZXJzJiZ0LmJlZm9yZSl7Zm9yKHZhciBuPTAscj10aGlzLmxpc3RlbmVyTWFwcy5sZW5ndGgsbz10LmJlZm9yZS5yZWR1Y2UoKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbZV09ITAsdFt1cihlKV09ITAsdH0pLHt9KTtuPHI7bisrKXt2YXIgaT10aGlzLmxpc3RlbmVyTWFwc1tuXS5pZDtpZihvW2ldfHxvW3VyKGkpXSlicmVha310aGlzLmxpc3RlbmVyTWFwcy5zcGxpY2UobiwwLHtpZDp0LmlkLG1hcDp0Lmxpc3RlbmVyc30pfWVsc2UgdC5saXN0ZW5lcnMmJnRoaXMubGlzdGVuZXJNYXBzLnB1c2goe2lkOnQuaWQsbWFwOnQubGlzdGVuZXJzfSk7cmV0dXJuIHRoaXN9fSx7a2V5OlwiYWRkRG9jdW1lbnRcIix2YWx1ZTpmdW5jdGlvbih0LG4pe2lmKC0xIT09dGhpcy5nZXREb2NJbmRleCh0KSlyZXR1cm4hMTt2YXIgcj1lLmdldFdpbmRvdyh0KTtuPW4/KDAsai5kZWZhdWx0KSh7fSxuKTp7fSx0aGlzLmRvY3VtZW50cy5wdXNoKHtkb2M6dCxvcHRpb25zOm59KSx0aGlzLmV2ZW50cy5kb2N1bWVudHMucHVzaCh0KSx0IT09dGhpcy5kb2N1bWVudCYmdGhpcy5ldmVudHMuYWRkKHIsXCJ1bmxvYWRcIix0aGlzLm9uV2luZG93VW5sb2FkKSx0aGlzLmZpcmUoXCJzY29wZTphZGQtZG9jdW1lbnRcIix7ZG9jOnQsd2luZG93OnIsc2NvcGU6dGhpcyxvcHRpb25zOm59KX19LHtrZXk6XCJyZW1vdmVEb2N1bWVudFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMuZ2V0RG9jSW5kZXgodCkscj1lLmdldFdpbmRvdyh0KSxvPXRoaXMuZG9jdW1lbnRzW25dLm9wdGlvbnM7dGhpcy5ldmVudHMucmVtb3ZlKHIsXCJ1bmxvYWRcIix0aGlzLm9uV2luZG93VW5sb2FkKSx0aGlzLmRvY3VtZW50cy5zcGxpY2UobiwxKSx0aGlzLmV2ZW50cy5kb2N1bWVudHMuc3BsaWNlKG4sMSksdGhpcy5maXJlKFwic2NvcGU6cmVtb3ZlLWRvY3VtZW50XCIse2RvYzp0LHdpbmRvdzpyLHNjb3BlOnRoaXMsb3B0aW9uczpvfSl9fSx7a2V5OlwiZ2V0RG9jSW5kZXhcIix2YWx1ZTpmdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHRoaXMuZG9jdW1lbnRzLmxlbmd0aDtlKyspaWYodGhpcy5kb2N1bWVudHNbZV0uZG9jPT09dClyZXR1cm4gZTtyZXR1cm4tMX19LHtrZXk6XCJnZXREb2NPcHRpb25zXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXREb2NJbmRleCh0KTtyZXR1cm4tMT09PWU/bnVsbDp0aGlzLmRvY3VtZW50c1tlXS5vcHRpb25zfX0se2tleTpcIm5vd1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMud2luZG93LkRhdGV8fERhdGUpLm5vdygpfX1dKSx0fSgpO2Z1bmN0aW9uIGxyKHQsbil7cmV0dXJuIHQuaXNJbml0aWFsaXplZD0hMCxpLmRlZmF1bHQud2luZG93KG4pJiZlLmluaXQobiksaC5kZWZhdWx0LmluaXQobiksYi5kZWZhdWx0LmluaXQobiksanQuZGVmYXVsdC5pbml0KG4pLHQud2luZG93PW4sdC5kb2N1bWVudD1uLmRvY3VtZW50LHQudXNlUGx1Z2luKEZuLmRlZmF1bHQpLHQudXNlUGx1Z2luKFNuLmRlZmF1bHQpLHR9ZnVuY3Rpb24gdXIodCl7cmV0dXJuIHQmJnQucmVwbGFjZSgvXFwvLiokLyxcIlwiKX1abi5TY29wZT1zcjt2YXIgY3I9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGNyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGNyLmRlZmF1bHQ9dm9pZCAwO3ZhciBmcj1uZXcgWm4uU2NvcGUsZHI9ZnIuaW50ZXJhY3RTdGF0aWM7Y3IuZGVmYXVsdD1kcjt2YXIgcHI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczpcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp2b2lkIDA7ZnIuaW5pdChwcik7dmFyIHZyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh2cixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx2ci5kZWZhdWx0PXZvaWQgMCx2ci5kZWZhdWx0PWZ1bmN0aW9uKCl7fTt2YXIgaHI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGhyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGhyLmRlZmF1bHQ9dm9pZCAwLGhyLmRlZmF1bHQ9ZnVuY3Rpb24oKXt9O3ZhciBncj17fTtmdW5jdGlvbiB5cih0LGUpe3JldHVybiBmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0fSh0KXx8ZnVuY3Rpb24odCxlKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXt2YXIgbj1bXSxyPSEwLG89ITEsaT12b2lkIDA7dHJ5e2Zvcih2YXIgYSxzPXRbU3ltYm9sLml0ZXJhdG9yXSgpOyEocj0oYT1zLm5leHQoKSkuZG9uZSkmJihuLnB1c2goYS52YWx1ZSksIWV8fG4ubGVuZ3RoIT09ZSk7cj0hMCk7fWNhdGNoKHQpe289ITAsaT10fWZpbmFsbHl7dHJ5e3J8fG51bGw9PXMucmV0dXJufHxzLnJldHVybigpfWZpbmFsbHl7aWYobyl0aHJvdyBpfX1yZXR1cm4gbn19KHQsZSl8fGZ1bmN0aW9uKHQsZSl7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIG1yKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9tcih0LGUpOnZvaWQgMH19KHQsZSl8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX0oKX1mdW5jdGlvbiBtcih0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9T2JqZWN0LmRlZmluZVByb3BlcnR5KGdyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGdyLmRlZmF1bHQ9dm9pZCAwLGdyLmRlZmF1bHQ9ZnVuY3Rpb24odCl7dmFyIGU9W1tcInhcIixcInlcIl0sW1wibGVmdFwiLFwidG9wXCJdLFtcInJpZ2h0XCIsXCJib3R0b21cIl0sW1wid2lkdGhcIixcImhlaWdodFwiXV0uZmlsdGVyKChmdW5jdGlvbihlKXt2YXIgbj15cihlLDIpLHI9blswXSxvPW5bMV07cmV0dXJuIHIgaW4gdHx8byBpbiB0fSkpLG49ZnVuY3Rpb24obixyKXtmb3IodmFyIG89dC5yYW5nZSxpPXQubGltaXRzLGE9dm9pZCAwPT09aT97bGVmdDotMS8wLHJpZ2h0OjEvMCx0b3A6LTEvMCxib3R0b206MS8wfTppLHM9dC5vZmZzZXQsbD12b2lkIDA9PT1zP3t4OjAseTowfTpzLHU9e3JhbmdlOm8sZ3JpZDp0LHg6bnVsbCx5Om51bGx9LGM9MDtjPGUubGVuZ3RoO2MrKyl7dmFyIGY9eXIoZVtjXSwyKSxkPWZbMF0scD1mWzFdLHY9TWF0aC5yb3VuZCgobi1sLngpL3RbZF0pLGg9TWF0aC5yb3VuZCgoci1sLnkpL3RbcF0pO3VbZF09TWF0aC5tYXgoYS5sZWZ0LE1hdGgubWluKGEucmlnaHQsdip0W2RdK2wueCkpLHVbcF09TWF0aC5tYXgoYS50b3AsTWF0aC5taW4oYS5ib3R0b20saCp0W3BdK2wueSkpfXJldHVybiB1fTtyZXR1cm4gbi5ncmlkPXQsbi5jb29yZEZpZWxkcz1lLG59O3ZhciBicj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoYnIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGJyLFwiZWRnZVRhcmdldFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiB2ci5kZWZhdWx0fX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicixcImVsZW1lbnRzXCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGhyLmRlZmF1bHR9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGJyLFwiZ3JpZFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBnci5kZWZhdWx0fX0pO3ZhciB4cj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoeHIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkseHIuZGVmYXVsdD12b2lkIDA7dmFyIHdyPXtpZDpcInNuYXBwZXJzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0U3RhdGljO2Uuc25hcHBlcnM9KDAsai5kZWZhdWx0KShlLnNuYXBwZXJzfHx7fSxiciksZS5jcmVhdGVTbmFwR3JpZD1lLnNuYXBwZXJzLmdyaWR9fTt4ci5kZWZhdWx0PXdyO3ZhciBfcj17fTtmdW5jdGlvbiBQcih0LGUpe3ZhciBuPU9iamVjdC5rZXlzKHQpO2lmKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpe3ZhciByPU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHModCk7ZSYmKHI9ci5maWx0ZXIoKGZ1bmN0aW9uKGUpe3JldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsZSkuZW51bWVyYWJsZX0pKSksbi5wdXNoLmFwcGx5KG4scil9cmV0dXJuIG59ZnVuY3Rpb24gT3IodCl7Zm9yKHZhciBlPTE7ZTxhcmd1bWVudHMubGVuZ3RoO2UrKyl7dmFyIG49bnVsbCE9YXJndW1lbnRzW2VdP2FyZ3VtZW50c1tlXTp7fTtlJTI/UHIoT2JqZWN0KG4pLCEwKS5mb3JFYWNoKChmdW5jdGlvbihlKXtTcih0LGUsbltlXSl9KSk6T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnM/T2JqZWN0LmRlZmluZVByb3BlcnRpZXModCxPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhuKSk6UHIoT2JqZWN0KG4pKS5mb3JFYWNoKChmdW5jdGlvbihlKXtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobixlKSl9KSl9cmV0dXJuIHR9ZnVuY3Rpb24gU3IodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShfcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxfci5hc3BlY3RSYXRpbz1fci5kZWZhdWx0PXZvaWQgMDt2YXIgRXI9e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuc3RhdGUsbj10LnJlY3Qscj10LmVkZ2VzLG89dC5wYWdlQ29vcmRzLGk9ZS5vcHRpb25zLnJhdGlvLGE9ZS5vcHRpb25zLHM9YS5lcXVhbERlbHRhLGw9YS5tb2RpZmllcnM7XCJwcmVzZXJ2ZVwiPT09aSYmKGk9bi53aWR0aC9uLmhlaWdodCksZS5zdGFydENvb3Jkcz0oMCxqLmRlZmF1bHQpKHt9LG8pLGUuc3RhcnRSZWN0PSgwLGouZGVmYXVsdCkoe30sbiksZS5yYXRpbz1pLGUuZXF1YWxEZWx0YT1zO3ZhciB1PWUubGlua2VkRWRnZXM9e3RvcDpyLnRvcHx8ci5sZWZ0JiYhci5ib3R0b20sbGVmdDpyLmxlZnR8fHIudG9wJiYhci5yaWdodCxib3R0b206ci5ib3R0b218fHIucmlnaHQmJiFyLnRvcCxyaWdodDpyLnJpZ2h0fHxyLmJvdHRvbSYmIXIubGVmdH07aWYoZS54SXNQcmltYXJ5QXhpcz0hKCFyLmxlZnQmJiFyLnJpZ2h0KSxlLmVxdWFsRGVsdGEpZS5lZGdlU2lnbj0odS5sZWZ0PzE6LTEpKih1LnRvcD8xOi0xKTtlbHNle3ZhciBjPWUueElzUHJpbWFyeUF4aXM/dS50b3A6dS5sZWZ0O2UuZWRnZVNpZ249Yz8tMToxfWlmKCgwLGouZGVmYXVsdCkodC5lZGdlcyx1KSxsJiZsLmxlbmd0aCl7dmFyIGY9bmV3IHllLmRlZmF1bHQodC5pbnRlcmFjdGlvbik7Zi5jb3B5RnJvbSh0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbiksZi5wcmVwYXJlU3RhdGVzKGwpLGUuc3ViTW9kaWZpY2F0aW9uPWYsZi5zdGFydEFsbChPcih7fSx0KSl9fSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5zdGF0ZSxuPXQucmVjdCxyPXQuY29vcmRzLG89KDAsai5kZWZhdWx0KSh7fSxyKSxpPWUuZXF1YWxEZWx0YT9UcjpNcjtpZihpKGUsZS54SXNQcmltYXJ5QXhpcyxyLG4pLCFlLnN1Yk1vZGlmaWNhdGlvbilyZXR1cm4gbnVsbDt2YXIgYT0oMCxqLmRlZmF1bHQpKHt9LG4pOygwLGsuYWRkRWRnZXMpKGUubGlua2VkRWRnZXMsYSx7eDpyLngtby54LHk6ci55LW8ueX0pO3ZhciBzPWUuc3ViTW9kaWZpY2F0aW9uLnNldEFsbChPcihPcih7fSx0KSx7fSx7cmVjdDphLGVkZ2VzOmUubGlua2VkRWRnZXMscGFnZUNvb3JkczpyLHByZXZDb29yZHM6cixwcmV2UmVjdDphfSkpLGw9cy5kZWx0YTtyZXR1cm4gcy5jaGFuZ2VkJiYoaShlLE1hdGguYWJzKGwueCk+TWF0aC5hYnMobC55KSxzLmNvb3JkcyxzLnJlY3QpLCgwLGouZGVmYXVsdCkocixzLmNvb3JkcykpLHMuZXZlbnRQcm9wc30sZGVmYXVsdHM6e3JhdGlvOlwicHJlc2VydmVcIixlcXVhbERlbHRhOiExLG1vZGlmaWVyczpbXSxlbmFibGVkOiExfX07ZnVuY3Rpb24gVHIodCxlLG4pe3ZhciByPXQuc3RhcnRDb29yZHMsbz10LmVkZ2VTaWduO2U/bi55PXIueSsobi54LXIueCkqbzpuLng9ci54KyhuLnktci55KSpvfWZ1bmN0aW9uIE1yKHQsZSxuLHIpe3ZhciBvPXQuc3RhcnRSZWN0LGk9dC5zdGFydENvb3JkcyxhPXQucmF0aW8scz10LmVkZ2VTaWduO2lmKGUpe3ZhciBsPXIud2lkdGgvYTtuLnk9aS55KyhsLW8uaGVpZ2h0KSpzfWVsc2V7dmFyIHU9ci5oZWlnaHQqYTtuLng9aS54Kyh1LW8ud2lkdGgpKnN9fV9yLmFzcGVjdFJhdGlvPUVyO3ZhciBqcj0oMCxTZS5tYWtlTW9kaWZpZXIpKEVyLFwiYXNwZWN0UmF0aW9cIik7X3IuZGVmYXVsdD1qcjt2YXIga3I9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGtyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGtyLmRlZmF1bHQ9dm9pZCAwO3ZhciBJcj1mdW5jdGlvbigpe307SXIuX2RlZmF1bHRzPXt9O3ZhciBEcj1Jcjtrci5kZWZhdWx0PURyO3ZhciBBcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoQXIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KEFyLFwiZGVmYXVsdFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBrci5kZWZhdWx0fX0pO3ZhciBScj17fTtmdW5jdGlvbiB6cih0LGUsbil7cmV0dXJuIGkuZGVmYXVsdC5mdW5jKHQpP2sucmVzb2x2ZVJlY3RMaWtlKHQsZS5pbnRlcmFjdGFibGUsZS5lbGVtZW50LFtuLngsbi55LGVdKTprLnJlc29sdmVSZWN0TGlrZSh0LGUuaW50ZXJhY3RhYmxlLGUuZWxlbWVudCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFJyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFJyLmdldFJlc3RyaWN0aW9uUmVjdD16cixSci5yZXN0cmljdD1Sci5kZWZhdWx0PXZvaWQgMDt2YXIgQ3I9e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlPXQucmVjdCxuPXQuc3RhcnRPZmZzZXQscj10LnN0YXRlLG89dC5pbnRlcmFjdGlvbixpPXQucGFnZUNvb3JkcyxhPXIub3B0aW9ucyxzPWEuZWxlbWVudFJlY3QsbD0oMCxqLmRlZmF1bHQpKHtsZWZ0OjAsdG9wOjAscmlnaHQ6MCxib3R0b206MH0sYS5vZmZzZXR8fHt9KTtpZihlJiZzKXt2YXIgdT16cihhLnJlc3RyaWN0aW9uLG8saSk7aWYodSl7dmFyIGM9dS5yaWdodC11LmxlZnQtZS53aWR0aCxmPXUuYm90dG9tLXUudG9wLWUuaGVpZ2h0O2M8MCYmKGwubGVmdCs9YyxsLnJpZ2h0Kz1jKSxmPDAmJihsLnRvcCs9ZixsLmJvdHRvbSs9Zil9bC5sZWZ0Kz1uLmxlZnQtZS53aWR0aCpzLmxlZnQsbC50b3ArPW4udG9wLWUuaGVpZ2h0KnMudG9wLGwucmlnaHQrPW4ucmlnaHQtZS53aWR0aCooMS1zLnJpZ2h0KSxsLmJvdHRvbSs9bi5ib3R0b20tZS5oZWlnaHQqKDEtcy5ib3R0b20pfXIub2Zmc2V0PWx9LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LmNvb3JkcyxuPXQuaW50ZXJhY3Rpb24scj10LnN0YXRlLG89ci5vcHRpb25zLGk9ci5vZmZzZXQsYT16cihvLnJlc3RyaWN0aW9uLG4sZSk7aWYoYSl7dmFyIHM9ay54eXdoVG9UbGJyKGEpO2UueD1NYXRoLm1heChNYXRoLm1pbihzLnJpZ2h0LWkucmlnaHQsZS54KSxzLmxlZnQraS5sZWZ0KSxlLnk9TWF0aC5tYXgoTWF0aC5taW4ocy5ib3R0b20taS5ib3R0b20sZS55KSxzLnRvcCtpLnRvcCl9fSxkZWZhdWx0czp7cmVzdHJpY3Rpb246bnVsbCxlbGVtZW50UmVjdDpudWxsLG9mZnNldDpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O1JyLnJlc3RyaWN0PUNyO3ZhciBGcj0oMCxTZS5tYWtlTW9kaWZpZXIpKENyLFwicmVzdHJpY3RcIik7UnIuZGVmYXVsdD1Gcjt2YXIgWHI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFhyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFhyLnJlc3RyaWN0RWRnZXM9WHIuZGVmYXVsdD12b2lkIDA7dmFyIFlyPXt0b3A6MS8wLGxlZnQ6MS8wLGJvdHRvbTotMS8wLHJpZ2h0Oi0xLzB9LEJyPXt0b3A6LTEvMCxsZWZ0Oi0xLzAsYm90dG9tOjEvMCxyaWdodDoxLzB9O2Z1bmN0aW9uIFdyKHQsZSl7Zm9yKHZhciBuPVtcInRvcFwiLFwibGVmdFwiLFwiYm90dG9tXCIsXCJyaWdodFwiXSxyPTA7cjxuLmxlbmd0aDtyKyspe3ZhciBvPW5bcl07byBpbiB0fHwodFtvXT1lW29dKX1yZXR1cm4gdH12YXIgTHI9e25vSW5uZXI6WXIsbm9PdXRlcjpCcixzdGFydDpmdW5jdGlvbih0KXt2YXIgZSxuPXQuaW50ZXJhY3Rpb24scj10LnN0YXJ0T2Zmc2V0LG89dC5zdGF0ZSxpPW8ub3B0aW9ucztpZihpKXt2YXIgYT0oMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGkub2Zmc2V0LG4sbi5jb29yZHMuc3RhcnQucGFnZSk7ZT1rLnJlY3RUb1hZKGEpfWU9ZXx8e3g6MCx5OjB9LG8ub2Zmc2V0PXt0b3A6ZS55K3IudG9wLGxlZnQ6ZS54K3IubGVmdCxib3R0b206ZS55LXIuYm90dG9tLHJpZ2h0OmUueC1yLnJpZ2h0fX0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuY29vcmRzLG49dC5lZGdlcyxyPXQuaW50ZXJhY3Rpb24sbz10LnN0YXRlLGk9by5vZmZzZXQsYT1vLm9wdGlvbnM7aWYobil7dmFyIHM9KDAsai5kZWZhdWx0KSh7fSxlKSxsPSgwLFJyLmdldFJlc3RyaWN0aW9uUmVjdCkoYS5pbm5lcixyLHMpfHx7fSx1PSgwLFJyLmdldFJlc3RyaWN0aW9uUmVjdCkoYS5vdXRlcixyLHMpfHx7fTtXcihsLFlyKSxXcih1LEJyKSxuLnRvcD9lLnk9TWF0aC5taW4oTWF0aC5tYXgodS50b3AraS50b3Ascy55KSxsLnRvcCtpLnRvcCk6bi5ib3R0b20mJihlLnk9TWF0aC5tYXgoTWF0aC5taW4odS5ib3R0b20raS5ib3R0b20scy55KSxsLmJvdHRvbStpLmJvdHRvbSkpLG4ubGVmdD9lLng9TWF0aC5taW4oTWF0aC5tYXgodS5sZWZ0K2kubGVmdCxzLngpLGwubGVmdCtpLmxlZnQpOm4ucmlnaHQmJihlLng9TWF0aC5tYXgoTWF0aC5taW4odS5yaWdodCtpLnJpZ2h0LHMueCksbC5yaWdodCtpLnJpZ2h0KSl9fSxkZWZhdWx0czp7aW5uZXI6bnVsbCxvdXRlcjpudWxsLG9mZnNldDpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O1hyLnJlc3RyaWN0RWRnZXM9THI7dmFyIFVyPSgwLFNlLm1ha2VNb2RpZmllcikoTHIsXCJyZXN0cmljdEVkZ2VzXCIpO1hyLmRlZmF1bHQ9VXI7dmFyIFZyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShWcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxWci5yZXN0cmljdFJlY3Q9VnIuZGVmYXVsdD12b2lkIDA7dmFyIE5yPSgwLGouZGVmYXVsdCkoe2dldCBlbGVtZW50UmVjdCgpe3JldHVybnt0b3A6MCxsZWZ0OjAsYm90dG9tOjEscmlnaHQ6MX19LHNldCBlbGVtZW50UmVjdCh0KXt9fSxSci5yZXN0cmljdC5kZWZhdWx0cykscXI9e3N0YXJ0OlJyLnJlc3RyaWN0LnN0YXJ0LHNldDpSci5yZXN0cmljdC5zZXQsZGVmYXVsdHM6TnJ9O1ZyLnJlc3RyaWN0UmVjdD1xcjt2YXIgJHI9KDAsU2UubWFrZU1vZGlmaWVyKShxcixcInJlc3RyaWN0UmVjdFwiKTtWci5kZWZhdWx0PSRyO3ZhciBHcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoR3IsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksR3IucmVzdHJpY3RTaXplPUdyLmRlZmF1bHQ9dm9pZCAwO3ZhciBIcj17d2lkdGg6LTEvMCxoZWlnaHQ6LTEvMH0sS3I9e3dpZHRoOjEvMCxoZWlnaHQ6MS8wfSxacj17c3RhcnQ6ZnVuY3Rpb24odCl7cmV0dXJuIFhyLnJlc3RyaWN0RWRnZXMuc3RhcnQodCl9LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5zdGF0ZSxyPXQucmVjdCxvPXQuZWRnZXMsaT1uLm9wdGlvbnM7aWYobyl7dmFyIGE9ay50bGJyVG9YeXdoKCgwLFJyLmdldFJlc3RyaWN0aW9uUmVjdCkoaS5taW4sZSx0LmNvb3JkcykpfHxIcixzPWsudGxiclRvWHl3aCgoMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGkubWF4LGUsdC5jb29yZHMpKXx8S3I7bi5vcHRpb25zPXtlbmRPbmx5OmkuZW5kT25seSxpbm5lcjooMCxqLmRlZmF1bHQpKHt9LFhyLnJlc3RyaWN0RWRnZXMubm9Jbm5lciksb3V0ZXI6KDAsai5kZWZhdWx0KSh7fSxYci5yZXN0cmljdEVkZ2VzLm5vT3V0ZXIpfSxvLnRvcD8obi5vcHRpb25zLmlubmVyLnRvcD1yLmJvdHRvbS1hLmhlaWdodCxuLm9wdGlvbnMub3V0ZXIudG9wPXIuYm90dG9tLXMuaGVpZ2h0KTpvLmJvdHRvbSYmKG4ub3B0aW9ucy5pbm5lci5ib3R0b209ci50b3ArYS5oZWlnaHQsbi5vcHRpb25zLm91dGVyLmJvdHRvbT1yLnRvcCtzLmhlaWdodCksby5sZWZ0PyhuLm9wdGlvbnMuaW5uZXIubGVmdD1yLnJpZ2h0LWEud2lkdGgsbi5vcHRpb25zLm91dGVyLmxlZnQ9ci5yaWdodC1zLndpZHRoKTpvLnJpZ2h0JiYobi5vcHRpb25zLmlubmVyLnJpZ2h0PXIubGVmdCthLndpZHRoLG4ub3B0aW9ucy5vdXRlci5yaWdodD1yLmxlZnQrcy53aWR0aCksWHIucmVzdHJpY3RFZGdlcy5zZXQodCksbi5vcHRpb25zPWl9fSxkZWZhdWx0czp7bWluOm51bGwsbWF4Om51bGwsZW5kT25seTohMSxlbmFibGVkOiExfX07R3IucmVzdHJpY3RTaXplPVpyO3ZhciBKcj0oMCxTZS5tYWtlTW9kaWZpZXIpKFpyLFwicmVzdHJpY3RTaXplXCIpO0dyLmRlZmF1bHQ9SnI7dmFyIFFyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShRcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoUXIsXCJkZWZhdWx0XCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGtyLmRlZmF1bHR9fSk7dmFyIHRvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0byxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0by5zbmFwPXRvLmRlZmF1bHQ9dm9pZCAwO3ZhciBlbz17c3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGUsbj10LmludGVyYWN0aW9uLHI9dC5pbnRlcmFjdGFibGUsbz10LmVsZW1lbnQsaT10LnJlY3QsYT10LnN0YXRlLHM9dC5zdGFydE9mZnNldCxsPWEub3B0aW9ucyx1PWwub2Zmc2V0V2l0aE9yaWdpbj9mdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLmVsZW1lbnQ7cmV0dXJuKDAsay5yZWN0VG9YWSkoKDAsay5yZXNvbHZlUmVjdExpa2UpKHQuc3RhdGUub3B0aW9ucy5vcmlnaW4sbnVsbCxudWxsLFtlXSkpfHwoMCxBLmRlZmF1bHQpKHQuaW50ZXJhY3RhYmxlLGUsdC5pbnRlcmFjdGlvbi5wcmVwYXJlZC5uYW1lKX0odCk6e3g6MCx5OjB9O2lmKFwic3RhcnRDb29yZHNcIj09PWwub2Zmc2V0KWU9e3g6bi5jb29yZHMuc3RhcnQucGFnZS54LHk6bi5jb29yZHMuc3RhcnQucGFnZS55fTtlbHNle3ZhciBjPSgwLGsucmVzb2x2ZVJlY3RMaWtlKShsLm9mZnNldCxyLG8sW25dKTsoZT0oMCxrLnJlY3RUb1hZKShjKXx8e3g6MCx5OjB9KS54Kz11LngsZS55Kz11Lnl9dmFyIGY9bC5yZWxhdGl2ZVBvaW50czthLm9mZnNldHM9aSYmZiYmZi5sZW5ndGg/Zi5tYXAoKGZ1bmN0aW9uKHQsbil7cmV0dXJue2luZGV4Om4scmVsYXRpdmVQb2ludDp0LHg6cy5sZWZ0LWkud2lkdGgqdC54K2UueCx5OnMudG9wLWkuaGVpZ2h0KnQueStlLnl9fSkpOlt7aW5kZXg6MCxyZWxhdGl2ZVBvaW50Om51bGwseDplLngseTplLnl9XX0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmNvb3JkcyxyPXQuc3RhdGUsbz1yLm9wdGlvbnMsYT1yLm9mZnNldHMscz0oMCxBLmRlZmF1bHQpKGUuaW50ZXJhY3RhYmxlLGUuZWxlbWVudCxlLnByZXBhcmVkLm5hbWUpLGw9KDAsai5kZWZhdWx0KSh7fSxuKSx1PVtdO28ub2Zmc2V0V2l0aE9yaWdpbnx8KGwueC09cy54LGwueS09cy55KTtmb3IodmFyIGM9MDtjPGEubGVuZ3RoO2MrKylmb3IodmFyIGY9YVtjXSxkPWwueC1mLngscD1sLnktZi55LHY9MCxoPW8udGFyZ2V0cy5sZW5ndGg7djxoO3YrKyl7dmFyIGcseT1vLnRhcmdldHNbdl07KGc9aS5kZWZhdWx0LmZ1bmMoeSk/eShkLHAsZS5fcHJveHksZix2KTp5KSYmdS5wdXNoKHt4OihpLmRlZmF1bHQubnVtYmVyKGcueCk/Zy54OmQpK2YueCx5OihpLmRlZmF1bHQubnVtYmVyKGcueSk/Zy55OnApK2YueSxyYW5nZTppLmRlZmF1bHQubnVtYmVyKGcucmFuZ2UpP2cucmFuZ2U6by5yYW5nZSxzb3VyY2U6eSxpbmRleDp2LG9mZnNldDpmfSl9Zm9yKHZhciBtPXt0YXJnZXQ6bnVsbCxpblJhbmdlOiExLGRpc3RhbmNlOjAscmFuZ2U6MCxkZWx0YTp7eDowLHk6MH19LGI9MDtiPHUubGVuZ3RoO2IrKyl7dmFyIHg9dVtiXSx3PXgucmFuZ2UsXz14LngtbC54LFA9eC55LWwueSxPPSgwLEMuZGVmYXVsdCkoXyxQKSxTPU88PXc7dz09PTEvMCYmbS5pblJhbmdlJiZtLnJhbmdlIT09MS8wJiYoUz0hMSksbS50YXJnZXQmJiEoUz9tLmluUmFuZ2UmJnchPT0xLzA/Ty93PG0uZGlzdGFuY2UvbS5yYW5nZTp3PT09MS8wJiZtLnJhbmdlIT09MS8wfHxPPG0uZGlzdGFuY2U6IW0uaW5SYW5nZSYmTzxtLmRpc3RhbmNlKXx8KG0udGFyZ2V0PXgsbS5kaXN0YW5jZT1PLG0ucmFuZ2U9dyxtLmluUmFuZ2U9UyxtLmRlbHRhLng9XyxtLmRlbHRhLnk9UCl9cmV0dXJuIG0uaW5SYW5nZSYmKG4ueD1tLnRhcmdldC54LG4ueT1tLnRhcmdldC55KSxyLmNsb3Nlc3Q9bSxtfSxkZWZhdWx0czp7cmFuZ2U6MS8wLHRhcmdldHM6bnVsbCxvZmZzZXQ6bnVsbCxvZmZzZXRXaXRoT3JpZ2luOiEwLG9yaWdpbjpudWxsLHJlbGF0aXZlUG9pbnRzOm51bGwsZW5kT25seTohMSxlbmFibGVkOiExfX07dG8uc25hcD1lbzt2YXIgbm89KDAsU2UubWFrZU1vZGlmaWVyKShlbyxcInNuYXBcIik7dG8uZGVmYXVsdD1ubzt2YXIgcm89e307ZnVuY3Rpb24gb28odCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShybyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxyby5zbmFwU2l6ZT1yby5kZWZhdWx0PXZvaWQgMDt2YXIgaW89e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuc3RhdGUsbj10LmVkZ2VzLHI9ZS5vcHRpb25zO2lmKCFuKXJldHVybiBudWxsO3Quc3RhdGU9e29wdGlvbnM6e3RhcmdldHM6bnVsbCxyZWxhdGl2ZVBvaW50czpbe3g6bi5sZWZ0PzA6MSx5Om4udG9wPzA6MX1dLG9mZnNldDpyLm9mZnNldHx8XCJzZWxmXCIsb3JpZ2luOnt4OjAseTowfSxyYW5nZTpyLnJhbmdlfX0sZS50YXJnZXRGaWVsZHM9ZS50YXJnZXRGaWVsZHN8fFtbXCJ3aWR0aFwiLFwiaGVpZ2h0XCJdLFtcInhcIixcInlcIl1dLHRvLnNuYXAuc3RhcnQodCksZS5vZmZzZXRzPXQuc3RhdGUub2Zmc2V0cyx0LnN0YXRlPWV9LHNldDpmdW5jdGlvbih0KXt2YXIgZSxuLHI9dC5pbnRlcmFjdGlvbixvPXQuc3RhdGUsYT10LmNvb3JkcyxzPW8ub3B0aW9ucyxsPW8ub2Zmc2V0cyx1PXt4OmEueC1sWzBdLngseTphLnktbFswXS55fTtvLm9wdGlvbnM9KDAsai5kZWZhdWx0KSh7fSxzKSxvLm9wdGlvbnMudGFyZ2V0cz1bXTtmb3IodmFyIGM9MDtjPChzLnRhcmdldHN8fFtdKS5sZW5ndGg7YysrKXt2YXIgZj0ocy50YXJnZXRzfHxbXSlbY10sZD12b2lkIDA7aWYoZD1pLmRlZmF1bHQuZnVuYyhmKT9mKHUueCx1Lnkscik6Zil7Zm9yKHZhciBwPTA7cDxvLnRhcmdldEZpZWxkcy5sZW5ndGg7cCsrKXt2YXIgdj0oZT1vLnRhcmdldEZpZWxkc1twXSxuPTIsZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0oZSl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fShlLG4pfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBvbyh0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/b28odCxlKTp2b2lkIDB9fShlLG4pfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCkpLGg9dlswXSxnPXZbMV07aWYoaCBpbiBkfHxnIGluIGQpe2QueD1kW2hdLGQueT1kW2ddO2JyZWFrfX1vLm9wdGlvbnMudGFyZ2V0cy5wdXNoKGQpfX12YXIgeT10by5zbmFwLnNldCh0KTtyZXR1cm4gby5vcHRpb25zPXMseX0sZGVmYXVsdHM6e3JhbmdlOjEvMCx0YXJnZXRzOm51bGwsb2Zmc2V0Om51bGwsZW5kT25seTohMSxlbmFibGVkOiExfX07cm8uc25hcFNpemU9aW87dmFyIGFvPSgwLFNlLm1ha2VNb2RpZmllcikoaW8sXCJzbmFwU2l6ZVwiKTtyby5kZWZhdWx0PWFvO3ZhciBzbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoc28sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksc28uc25hcEVkZ2VzPXNvLmRlZmF1bHQ9dm9pZCAwO3ZhciBsbz17c3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5lZGdlcztyZXR1cm4gZT8odC5zdGF0ZS50YXJnZXRGaWVsZHM9dC5zdGF0ZS50YXJnZXRGaWVsZHN8fFtbZS5sZWZ0P1wibGVmdFwiOlwicmlnaHRcIixlLnRvcD9cInRvcFwiOlwiYm90dG9tXCJdXSxyby5zbmFwU2l6ZS5zdGFydCh0KSk6bnVsbH0sc2V0OnJvLnNuYXBTaXplLnNldCxkZWZhdWx0czooMCxqLmRlZmF1bHQpKCgwLGdlLmRlZmF1bHQpKHJvLnNuYXBTaXplLmRlZmF1bHRzKSx7dGFyZ2V0czpudWxsLHJhbmdlOm51bGwsb2Zmc2V0Ont4OjAseTowfX0pfTtzby5zbmFwRWRnZXM9bG87dmFyIHVvPSgwLFNlLm1ha2VNb2RpZmllcikobG8sXCJzbmFwRWRnZXNcIik7c28uZGVmYXVsdD11bzt2YXIgY289e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGNvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbyxcImRlZmF1bHRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4ga3IuZGVmYXVsdH19KTt2YXIgZm89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGZvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmbyxcImRlZmF1bHRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4ga3IuZGVmYXVsdH19KTt2YXIgcG89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHBvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHBvLmRlZmF1bHQ9dm9pZCAwO3ZhciB2bz17YXNwZWN0UmF0aW86X3IuZGVmYXVsdCxyZXN0cmljdEVkZ2VzOlhyLmRlZmF1bHQscmVzdHJpY3Q6UnIuZGVmYXVsdCxyZXN0cmljdFJlY3Q6VnIuZGVmYXVsdCxyZXN0cmljdFNpemU6R3IuZGVmYXVsdCxzbmFwRWRnZXM6c28uZGVmYXVsdCxzbmFwOnRvLmRlZmF1bHQsc25hcFNpemU6cm8uZGVmYXVsdCxzcHJpbmc6Y28uZGVmYXVsdCxhdm9pZDpBci5kZWZhdWx0LHRyYW5zZm9ybTpmby5kZWZhdWx0LHJ1YmJlcmJhbmQ6UXIuZGVmYXVsdH07cG8uZGVmYXVsdD12bzt2YXIgaG89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGhvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGhvLmRlZmF1bHQ9dm9pZCAwO3ZhciBnbz17aWQ6XCJtb2RpZmllcnNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RTdGF0aWM7Zm9yKHZhciBuIGluIHQudXNlUGx1Z2luKFNlLmRlZmF1bHQpLHQudXNlUGx1Z2luKHhyLmRlZmF1bHQpLGUubW9kaWZpZXJzPXBvLmRlZmF1bHQscG8uZGVmYXVsdCl7dmFyIHI9cG8uZGVmYXVsdFtuXSxvPXIuX2RlZmF1bHRzLGk9ci5fbWV0aG9kcztvLl9tZXRob2RzPWksdC5kZWZhdWx0cy5wZXJBY3Rpb25bbl09b319fTtoby5kZWZhdWx0PWdvO3ZhciB5bz17fTtmdW5jdGlvbiBtbyh0KXtyZXR1cm4obW89XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIGJvKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiB4byh0LGUpe3JldHVybih4bz1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gd28odCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PW1vKGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP19vKHQpOmV9ZnVuY3Rpb24gX28odCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9ZnVuY3Rpb24gUG8odCl7cmV0dXJuKFBvPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1mdW5jdGlvbiBPbyh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHlvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHlvLlBvaW50ZXJFdmVudD15by5kZWZhdWx0PXZvaWQgMDt2YXIgU289ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZSYmZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp0LHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSxlJiZ4byh0LGUpfShhLHQpO3ZhciBlLG4scixvLGk9KHI9YSxvPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sKGZ1bmN0aW9uKCl7fSkpKSwhMH1jYXRjaCh0KXtyZXR1cm4hMX19KCksZnVuY3Rpb24oKXt2YXIgdCxlPVBvKHIpO2lmKG8pe3ZhciBuPVBvKHRoaXMpLmNvbnN0cnVjdG9yO3Q9UmVmbGVjdC5jb25zdHJ1Y3QoZSxhcmd1bWVudHMsbil9ZWxzZSB0PWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiB3byh0aGlzLHQpfSk7ZnVuY3Rpb24gYSh0LGUsbixyLG8scyl7dmFyIGw7aWYoZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLGEpLE9vKF9vKGw9aS5jYWxsKHRoaXMsbykpLFwidHlwZVwiLHZvaWQgMCksT28oX28obCksXCJvcmlnaW5hbEV2ZW50XCIsdm9pZCAwKSxPbyhfbyhsKSxcInBvaW50ZXJJZFwiLHZvaWQgMCksT28oX28obCksXCJwb2ludGVyVHlwZVwiLHZvaWQgMCksT28oX28obCksXCJkb3VibGVcIix2b2lkIDApLE9vKF9vKGwpLFwicGFnZVhcIix2b2lkIDApLE9vKF9vKGwpLFwicGFnZVlcIix2b2lkIDApLE9vKF9vKGwpLFwiY2xpZW50WFwiLHZvaWQgMCksT28oX28obCksXCJjbGllbnRZXCIsdm9pZCAwKSxPbyhfbyhsKSxcImR0XCIsdm9pZCAwKSxPbyhfbyhsKSxcImV2ZW50YWJsZVwiLHZvaWQgMCksQi5wb2ludGVyRXh0ZW5kKF9vKGwpLG4pLG4hPT1lJiZCLnBvaW50ZXJFeHRlbmQoX28obCksZSksbC50aW1lU3RhbXA9cyxsLm9yaWdpbmFsRXZlbnQ9bixsLnR5cGU9dCxsLnBvaW50ZXJJZD1CLmdldFBvaW50ZXJJZChlKSxsLnBvaW50ZXJUeXBlPUIuZ2V0UG9pbnRlclR5cGUoZSksbC50YXJnZXQ9cixsLmN1cnJlbnRUYXJnZXQ9bnVsbCxcInRhcFwiPT09dCl7dmFyIHU9by5nZXRQb2ludGVySW5kZXgoZSk7bC5kdD1sLnRpbWVTdGFtcC1vLnBvaW50ZXJzW3VdLmRvd25UaW1lO3ZhciBjPWwudGltZVN0YW1wLW8udGFwVGltZTtsLmRvdWJsZT0hIShvLnByZXZUYXAmJlwiZG91YmxldGFwXCIhPT1vLnByZXZUYXAudHlwZSYmby5wcmV2VGFwLnRhcmdldD09PWwudGFyZ2V0JiZjPDUwMCl9ZWxzZVwiZG91YmxldGFwXCI9PT10JiYobC5kdD1lLnRpbWVTdGFtcC1vLnRhcFRpbWUpO3JldHVybiBsfXJldHVybiBlPWEsKG49W3trZXk6XCJfc3VidHJhY3RPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10Lngsbj10Lnk7cmV0dXJuIHRoaXMucGFnZVgtPWUsdGhpcy5wYWdlWS09bix0aGlzLmNsaWVudFgtPWUsdGhpcy5jbGllbnRZLT1uLHRoaXN9fSx7a2V5OlwiX2FkZE9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQueCxuPXQueTtyZXR1cm4gdGhpcy5wYWdlWCs9ZSx0aGlzLnBhZ2VZKz1uLHRoaXMuY2xpZW50WCs9ZSx0aGlzLmNsaWVudFkrPW4sdGhpc319LHtrZXk6XCJwcmV2ZW50RGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCl9fV0pJiZibyhlLnByb3RvdHlwZSxuKSxhfSgkLkJhc2VFdmVudCk7eW8uUG9pbnRlckV2ZW50PXlvLmRlZmF1bHQ9U287dmFyIEVvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShFbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxFby5kZWZhdWx0PXZvaWQgMDt2YXIgVG89e2lkOlwicG9pbnRlci1ldmVudHMvYmFzZVwiLGJlZm9yZTpbXCJpbmVydGlhXCIsXCJtb2RpZmllcnNcIixcImF1dG8tc3RhcnRcIixcImFjdGlvbnNcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt0LnBvaW50ZXJFdmVudHM9VG8sdC5kZWZhdWx0cy5hY3Rpb25zLnBvaW50ZXJFdmVudHM9VG8uZGVmYXVsdHMsKDAsai5kZWZhdWx0KSh0LmFjdGlvbnMucGhhc2VsZXNzVHlwZXMsVG8udHlwZXMpfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5wcmV2VGFwPW51bGwsZS50YXBUaW1lPTB9LFwiaW50ZXJhY3Rpb25zOnVwZGF0ZS1wb2ludGVyXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5kb3duLG49dC5wb2ludGVySW5mbzshZSYmbi5ob2xkfHwobi5ob2xkPXtkdXJhdGlvbjoxLzAsdGltZW91dDpudWxsfSl9LFwiaW50ZXJhY3Rpb25zOm1vdmVcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldDt0LmR1cGxpY2F0ZXx8bi5wb2ludGVySXNEb3duJiYhbi5wb2ludGVyV2FzTW92ZWR8fChuLnBvaW50ZXJJc0Rvd24mJmtvKHQpLE1vKHtpbnRlcmFjdGlvbjpuLHBvaW50ZXI6cixldmVudDpvLGV2ZW50VGFyZ2V0OmksdHlwZTpcIm1vdmVcIn0sZSkpfSxcImludGVyYWN0aW9uczpkb3duXCI6ZnVuY3Rpb24odCxlKXshZnVuY3Rpb24odCxlKXtmb3IodmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0LGE9dC5wb2ludGVySW5kZXgscz1uLnBvaW50ZXJzW2FdLmhvbGQsbD1fLmdldFBhdGgoaSksdT17aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHR5cGU6XCJob2xkXCIsdGFyZ2V0czpbXSxwYXRoOmwsbm9kZTpudWxsfSxjPTA7YzxsLmxlbmd0aDtjKyspe3ZhciBmPWxbY107dS5ub2RlPWYsZS5maXJlKFwicG9pbnRlckV2ZW50czpjb2xsZWN0LXRhcmdldHNcIix1KX1pZih1LnRhcmdldHMubGVuZ3RoKXtmb3IodmFyIGQ9MS8wLHA9MDtwPHUudGFyZ2V0cy5sZW5ndGg7cCsrKXt2YXIgdj11LnRhcmdldHNbcF0uZXZlbnRhYmxlLm9wdGlvbnMuaG9sZER1cmF0aW9uO3Y8ZCYmKGQ9dil9cy5kdXJhdGlvbj1kLHMudGltZW91dD1zZXRUaW1lb3V0KChmdW5jdGlvbigpe01vKHtpbnRlcmFjdGlvbjpuLGV2ZW50VGFyZ2V0OmkscG9pbnRlcjpyLGV2ZW50Om8sdHlwZTpcImhvbGRcIn0sZSl9KSxkKX19KHQsZSksTW8odCxlKX0sXCJpbnRlcmFjdGlvbnM6dXBcIjpmdW5jdGlvbih0LGUpe2tvKHQpLE1vKHQsZSksZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQ7bi5wb2ludGVyV2FzTW92ZWR8fE1vKHtpbnRlcmFjdGlvbjpuLGV2ZW50VGFyZ2V0OmkscG9pbnRlcjpyLGV2ZW50Om8sdHlwZTpcInRhcFwifSxlKX0odCxlKX0sXCJpbnRlcmFjdGlvbnM6Y2FuY2VsXCI6ZnVuY3Rpb24odCxlKXtrbyh0KSxNbyh0LGUpfX0sUG9pbnRlckV2ZW50OnlvLlBvaW50ZXJFdmVudCxmaXJlOk1vLGNvbGxlY3RFdmVudFRhcmdldHM6am8sZGVmYXVsdHM6e2hvbGREdXJhdGlvbjo2MDAsaWdub3JlRnJvbTpudWxsLGFsbG93RnJvbTpudWxsLG9yaWdpbjp7eDowLHk6MH19LHR5cGVzOntkb3duOiEwLG1vdmU6ITAsdXA6ITAsY2FuY2VsOiEwLHRhcDohMCxkb3VibGV0YXA6ITAsaG9sZDohMH19O2Z1bmN0aW9uIE1vKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0LGE9dC50eXBlLHM9dC50YXJnZXRzLGw9dm9pZCAwPT09cz9qbyh0LGUpOnMsdT1uZXcgeW8uUG9pbnRlckV2ZW50KGEscixvLGksbixlLm5vdygpKTtlLmZpcmUoXCJwb2ludGVyRXZlbnRzOm5ld1wiLHtwb2ludGVyRXZlbnQ6dX0pO2Zvcih2YXIgYz17aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHRhcmdldHM6bCx0eXBlOmEscG9pbnRlckV2ZW50OnV9LGY9MDtmPGwubGVuZ3RoO2YrKyl7dmFyIGQ9bFtmXTtmb3IodmFyIHAgaW4gZC5wcm9wc3x8e30pdVtwXT1kLnByb3BzW3BdO3ZhciB2PSgwLEEuZGVmYXVsdCkoZC5ldmVudGFibGUsZC5ub2RlKTtpZih1Ll9zdWJ0cmFjdE9yaWdpbih2KSx1LmV2ZW50YWJsZT1kLmV2ZW50YWJsZSx1LmN1cnJlbnRUYXJnZXQ9ZC5ub2RlLGQuZXZlbnRhYmxlLmZpcmUodSksdS5fYWRkT3JpZ2luKHYpLHUuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkfHx1LnByb3BhZ2F0aW9uU3RvcHBlZCYmZisxPGwubGVuZ3RoJiZsW2YrMV0ubm9kZSE9PXUuY3VycmVudFRhcmdldClicmVha31pZihlLmZpcmUoXCJwb2ludGVyRXZlbnRzOmZpcmVkXCIsYyksXCJ0YXBcIj09PWEpe3ZhciBoPXUuZG91YmxlP01vKHtpbnRlcmFjdGlvbjpuLHBvaW50ZXI6cixldmVudDpvLGV2ZW50VGFyZ2V0OmksdHlwZTpcImRvdWJsZXRhcFwifSxlKTp1O24ucHJldlRhcD1oLG4udGFwVGltZT1oLnRpbWVTdGFtcH1yZXR1cm4gdX1mdW5jdGlvbiBqbyh0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldCxhPXQudHlwZSxzPW4uZ2V0UG9pbnRlckluZGV4KHIpLGw9bi5wb2ludGVyc1tzXTtpZihcInRhcFwiPT09YSYmKG4ucG9pbnRlcldhc01vdmVkfHwhbHx8bC5kb3duVGFyZ2V0IT09aSkpcmV0dXJuW107Zm9yKHZhciB1PV8uZ2V0UGF0aChpKSxjPXtpbnRlcmFjdGlvbjpuLHBvaW50ZXI6cixldmVudDpvLGV2ZW50VGFyZ2V0OmksdHlwZTphLHBhdGg6dSx0YXJnZXRzOltdLG5vZGU6bnVsbH0sZj0wO2Y8dS5sZW5ndGg7ZisrKXt2YXIgZD11W2ZdO2Mubm9kZT1kLGUuZmlyZShcInBvaW50ZXJFdmVudHM6Y29sbGVjdC10YXJnZXRzXCIsYyl9cmV0dXJuXCJob2xkXCI9PT1hJiYoYy50YXJnZXRzPWMudGFyZ2V0cy5maWx0ZXIoKGZ1bmN0aW9uKHQpe3ZhciBlO3JldHVybiB0LmV2ZW50YWJsZS5vcHRpb25zLmhvbGREdXJhdGlvbj09PShudWxsPT0oZT1uLnBvaW50ZXJzW3NdKT92b2lkIDA6ZS5ob2xkLmR1cmF0aW9uKX0pKSksYy50YXJnZXRzfWZ1bmN0aW9uIGtvKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LnBvaW50ZXJJbmRleCxyPWUucG9pbnRlcnNbbl0uaG9sZDtyJiZyLnRpbWVvdXQmJihjbGVhclRpbWVvdXQoci50aW1lb3V0KSxyLnRpbWVvdXQ9bnVsbCl9dmFyIElvPVRvO0VvLmRlZmF1bHQ9SW87dmFyIERvPXt9O2Z1bmN0aW9uIEFvKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5ob2xkSW50ZXJ2YWxIYW5kbGUmJihjbGVhckludGVydmFsKGUuaG9sZEludGVydmFsSGFuZGxlKSxlLmhvbGRJbnRlcnZhbEhhbmRsZT1udWxsKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoRG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksRG8uZGVmYXVsdD12b2lkIDA7dmFyIFJvPXtpZDpcInBvaW50ZXItZXZlbnRzL2hvbGRSZXBlYXRcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3QudXNlUGx1Z2luKEVvLmRlZmF1bHQpO3ZhciBlPXQucG9pbnRlckV2ZW50cztlLmRlZmF1bHRzLmhvbGRSZXBlYXRJbnRlcnZhbD0wLGUudHlwZXMuaG9sZHJlcGVhdD10LmFjdGlvbnMucGhhc2VsZXNzVHlwZXMuaG9sZHJlcGVhdD0hMH0sbGlzdGVuZXJzOltcIm1vdmVcIixcInVwXCIsXCJjYW5jZWxcIixcImVuZGFsbFwiXS5yZWR1Y2UoKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbXCJwb2ludGVyRXZlbnRzOlwiLmNvbmNhdChlKV09QW8sdH0pLHtcInBvaW50ZXJFdmVudHM6bmV3XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5wb2ludGVyRXZlbnQ7XCJob2xkXCI9PT1lLnR5cGUmJihlLmNvdW50PShlLmNvdW50fHwwKSsxKX0sXCJwb2ludGVyRXZlbnRzOmZpcmVkXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyRXZlbnQsbz10LmV2ZW50VGFyZ2V0LGk9dC50YXJnZXRzO2lmKFwiaG9sZFwiPT09ci50eXBlJiZpLmxlbmd0aCl7dmFyIGE9aVswXS5ldmVudGFibGUub3B0aW9ucy5ob2xkUmVwZWF0SW50ZXJ2YWw7YTw9MHx8KG4uaG9sZEludGVydmFsSGFuZGxlPXNldFRpbWVvdXQoKGZ1bmN0aW9uKCl7ZS5wb2ludGVyRXZlbnRzLmZpcmUoe2ludGVyYWN0aW9uOm4sZXZlbnRUYXJnZXQ6byx0eXBlOlwiaG9sZFwiLHBvaW50ZXI6cixldmVudDpyfSxlKX0pLGEpKX19fSl9O0RvLmRlZmF1bHQ9Um87dmFyIHpvPXt9O2Z1bmN0aW9uIENvKHQpe3JldHVybigwLGouZGVmYXVsdCkodGhpcy5ldmVudHMub3B0aW9ucyx0KSx0aGlzfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh6byxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx6by5kZWZhdWx0PXZvaWQgMDt2YXIgRm89e2lkOlwicG9pbnRlci1ldmVudHMvaW50ZXJhY3RhYmxlVGFyZ2V0c1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5JbnRlcmFjdGFibGU7ZS5wcm90b3R5cGUucG9pbnRlckV2ZW50cz1Dbzt2YXIgbj1lLnByb3RvdHlwZS5fYmFja0NvbXBhdE9wdGlvbjtlLnByb3RvdHlwZS5fYmFja0NvbXBhdE9wdGlvbj1mdW5jdGlvbih0LGUpe3ZhciByPW4uY2FsbCh0aGlzLHQsZSk7cmV0dXJuIHI9PT10aGlzJiYodGhpcy5ldmVudHMub3B0aW9uc1t0XT1lKSxyfX0sbGlzdGVuZXJzOntcInBvaW50ZXJFdmVudHM6Y29sbGVjdC10YXJnZXRzXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LnRhcmdldHMscj10Lm5vZGUsbz10LnR5cGUsaT10LmV2ZW50VGFyZ2V0O2UuaW50ZXJhY3RhYmxlcy5mb3JFYWNoTWF0Y2gociwoZnVuY3Rpb24odCl7dmFyIGU9dC5ldmVudHMsYT1lLm9wdGlvbnM7ZS50eXBlc1tvXSYmZS50eXBlc1tvXS5sZW5ndGgmJnQudGVzdElnbm9yZUFsbG93KGEscixpKSYmbi5wdXNoKHtub2RlOnIsZXZlbnRhYmxlOmUscHJvcHM6e2ludGVyYWN0YWJsZTp0fX0pfSkpfSxcImludGVyYWN0YWJsZTpuZXdcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0YWJsZTtlLmV2ZW50cy5nZXRSZWN0PWZ1bmN0aW9uKHQpe3JldHVybiBlLmdldFJlY3QodCl9fSxcImludGVyYWN0YWJsZTpzZXRcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3RhYmxlLHI9dC5vcHRpb25zOygwLGouZGVmYXVsdCkobi5ldmVudHMub3B0aW9ucyxlLnBvaW50ZXJFdmVudHMuZGVmYXVsdHMpLCgwLGouZGVmYXVsdCkobi5ldmVudHMub3B0aW9ucyxyLnBvaW50ZXJFdmVudHN8fHt9KX19fTt6by5kZWZhdWx0PUZvO3ZhciBYbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoWG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWG8uZGVmYXVsdD12b2lkIDA7dmFyIFlvPXtpZDpcInBvaW50ZXItZXZlbnRzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt0LnVzZVBsdWdpbihFbyksdC51c2VQbHVnaW4oRG8uZGVmYXVsdCksdC51c2VQbHVnaW4oem8uZGVmYXVsdCl9fTtYby5kZWZhdWx0PVlvO3ZhciBCbz17fTtmdW5jdGlvbiBXbyh0KXt2YXIgZT10LkludGVyYWN0YWJsZTt0LmFjdGlvbnMucGhhc2VzLnJlZmxvdz0hMCxlLnByb3RvdHlwZS5yZWZsb3c9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsZSxuKXtmb3IodmFyIHI9aS5kZWZhdWx0LnN0cmluZyh0LnRhcmdldCk/Wi5mcm9tKHQuX2NvbnRleHQucXVlcnlTZWxlY3RvckFsbCh0LnRhcmdldCkpOlt0LnRhcmdldF0sbz1uLndpbmRvdy5Qcm9taXNlLGE9bz9bXTpudWxsLHM9ZnVuY3Rpb24oKXt2YXIgaT1yW2xdLHM9dC5nZXRSZWN0KGkpO2lmKCFzKXJldHVyblwiYnJlYWtcIjt2YXIgdT1aLmZpbmQobi5pbnRlcmFjdGlvbnMubGlzdCwoZnVuY3Rpb24obil7cmV0dXJuIG4uaW50ZXJhY3RpbmcoKSYmbi5pbnRlcmFjdGFibGU9PT10JiZuLmVsZW1lbnQ9PT1pJiZuLnByZXBhcmVkLm5hbWU9PT1lLm5hbWV9KSksYz12b2lkIDA7aWYodSl1Lm1vdmUoKSxhJiYoYz11Ll9yZWZsb3dQcm9taXNlfHxuZXcgbygoZnVuY3Rpb24odCl7dS5fcmVmbG93UmVzb2x2ZT10fSkpKTtlbHNle3ZhciBmPSgwLGsudGxiclRvWHl3aCkocyksZD17cGFnZTp7eDpmLngseTpmLnl9LGNsaWVudDp7eDpmLngseTpmLnl9LHRpbWVTdGFtcDpuLm5vdygpfSxwPUIuY29vcmRzVG9FdmVudChkKTtjPWZ1bmN0aW9uKHQsZSxuLHIsbyl7dmFyIGk9dC5pbnRlcmFjdGlvbnMubmV3KHtwb2ludGVyVHlwZTpcInJlZmxvd1wifSksYT17aW50ZXJhY3Rpb246aSxldmVudDpvLHBvaW50ZXI6byxldmVudFRhcmdldDpuLHBoYXNlOlwicmVmbG93XCJ9O2kuaW50ZXJhY3RhYmxlPWUsaS5lbGVtZW50PW4saS5wcmV2RXZlbnQ9byxpLnVwZGF0ZVBvaW50ZXIobyxvLG4sITApLEIuc2V0WmVyb0Nvb3JkcyhpLmNvb3Jkcy5kZWx0YSksKDAsWXQuY29weUFjdGlvbikoaS5wcmVwYXJlZCxyKSxpLl9kb1BoYXNlKGEpO3ZhciBzPXQud2luZG93LlByb21pc2UsbD1zP25ldyBzKChmdW5jdGlvbih0KXtpLl9yZWZsb3dSZXNvbHZlPXR9KSk6dm9pZCAwO3JldHVybiBpLl9yZWZsb3dQcm9taXNlPWwsaS5zdGFydChyLGUsbiksaS5faW50ZXJhY3Rpbmc/KGkubW92ZShhKSxpLmVuZChvKSk6KGkuc3RvcCgpLGkuX3JlZmxvd1Jlc29sdmUoKSksaS5yZW1vdmVQb2ludGVyKG8sbyksbH0obix0LGksZSxwKX1hJiZhLnB1c2goYyl9LGw9MDtsPHIubGVuZ3RoJiZcImJyZWFrXCIhPT1zKCk7bCsrKTtyZXR1cm4gYSYmby5hbGwoYSkudGhlbigoZnVuY3Rpb24oKXtyZXR1cm4gdH0pKX0odGhpcyxlLHQpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkoQm8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQm8uaW5zdGFsbD1XbyxCby5kZWZhdWx0PXZvaWQgMDt2YXIgTG89e2lkOlwicmVmbG93XCIsaW5zdGFsbDpXbyxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb247XCJyZWZsb3dcIj09PW4ucG9pbnRlclR5cGUmJihuLl9yZWZsb3dSZXNvbHZlJiZuLl9yZWZsb3dSZXNvbHZlKCksWi5yZW1vdmUoZS5pbnRlcmFjdGlvbnMubGlzdCxuKSl9fX07Qm8uZGVmYXVsdD1Mbzt2YXIgVW89e2V4cG9ydHM6e319O2Z1bmN0aW9uIFZvKHQpe3JldHVybihWbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFVvLmV4cG9ydHMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksVW8uZXhwb3J0cy5kZWZhdWx0PXZvaWQgMCxjci5kZWZhdWx0LnVzZShzZS5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShHZS5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShYby5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShlbi5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShoby5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShpZS5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShUdC5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShSdC5kZWZhdWx0KSxjci5kZWZhdWx0LnVzZShCby5kZWZhdWx0KTt2YXIgTm89Y3IuZGVmYXVsdDtpZihVby5leHBvcnRzLmRlZmF1bHQ9Tm8sXCJvYmplY3RcIj09PVZvKFVvKSYmVW8pdHJ5e1VvLmV4cG9ydHM9Y3IuZGVmYXVsdH1jYXRjaCh0KXt9Y3IuZGVmYXVsdC5kZWZhdWx0PWNyLmRlZmF1bHQsVW89VW8uZXhwb3J0czt2YXIgcW89e2V4cG9ydHM6e319O2Z1bmN0aW9uICRvKHQpe3JldHVybigkbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24odCl7cmV0dXJuIHR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZ0LmNvbnN0cnVjdG9yPT09U3ltYm9sJiZ0IT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiB0fSkodCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KHFvLmV4cG9ydHMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkscW8uZXhwb3J0cy5kZWZhdWx0PXZvaWQgMDt2YXIgR289VW8uZGVmYXVsdDtpZihxby5leHBvcnRzLmRlZmF1bHQ9R28sXCJvYmplY3RcIj09PSRvKHFvKSYmcW8pdHJ5e3FvLmV4cG9ydHM9VW8uZGVmYXVsdH1jYXRjaCh0KXt9cmV0dXJuIFVvLmRlZmF1bHQuZGVmYXVsdD1Vby5kZWZhdWx0LHFvLmV4cG9ydHN9KSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnRlcmFjdC5taW4uanMubWFwXG4iLCJpbXBvcnQgeyBjb25maWcsIGlzRWxsaXBzaXNBY3RpdmUsIGdldFRleHRXaWR0aCB9IGZyb20gJy4vY29uZmlnJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NvbXBvbmVudHMvY2FyZCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhcmRBY3Rpb25zSGFuZGxlciB7XHJcbiAgc3RvcmVkU2VsRWxzOiBBcnJheTxFbGVtZW50PjtcclxuICBjdXJyU2Nyb2xsaW5nQW5pbTogQW5pbWF0aW9uIHwgbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IgKG1heExlbmd0aDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnN0b3JlZFNlbEVscyA9IG5ldyBBcnJheShtYXhMZW5ndGgpXHJcbiAgICB0aGlzLmN1cnJTY3JvbGxpbmdBbmltID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqIE1hbmFnZXMgc2VsZWN0aW5nIGEgY2FyZCBhbmQgZGVzZWxlY3RpbmcgdGhlIHByZXZpb3VzIHNlbGVjdGVkIG9uZVxyXG4gICAqIHdoZW4gYSBjYXJkcyBvbiBjbGljayBldmVudCBsaXN0ZW5lciBpcyB0cmlnZ2VyZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHNlbENhcmRFbCAtIHRoZSBjYXJkIHRoYXQgZXhlY3V0ZWQgdGhpcyBmdW5jdGlvbiB3aGVuIGNsaWNrZWRcclxuICAgKiBAcGFyYW0ge0FycmF5PENhcmQ+fSBjb3JyT2JqTGlzdCAtIHRoZSBsaXN0IG9mIG9iamVjdHMgdGhhdCBjb250YWlucyBvbmUgdGhhdCBjb3Jyb3Nwb25kcyB0byB0aGUgc2VsZWN0ZWQgY2FyZCxcclxuICAgKiBlYWNoICoqKm9iamVjdCBtdXN0IGhhdmUgdGhlIGNhcmRJZCBhdHRyaWJ1dGUuXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBmdW5jdGlvbiB0byBydW4gd2hlbiBzZWxlY3RlZCBvYmplY3QgaGFzIGNoYW5nZWRcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGFsbG93VW5zZWxTZWxlY3RlZCAtIHdoZXRoZXIgdG8gYWxsb3cgdW5zZWxlY3Rpbmcgb2YgdGhlIHNlbGVjdGVkIGNhcmQgYnkgY2xpY2tpbmcgb24gaXQgYWdhaW5cclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHVuc2VsZWN0UHJldmlvdXMgLSB3aGV0aGVyIHRvIHVuc2VsZWN0IHRoZSBwcmV2aW91c2x5IHNlbGVjdGVkIGNhcmRcclxuICAgKi9cclxuICBvbkNhcmRDbGljayAoXHJcbiAgICBzZWxDYXJkRWw6IEVsZW1lbnQsXHJcbiAgICBjb3JyT2JqTGlzdDogQXJyYXk8Q2FyZD4sXHJcbiAgICBjYWxsYmFjazogRnVuY3Rpb24gfCBudWxsLFxyXG4gICAgYWxsb3dVbnNlbFNlbGVjdGVkOiBib29sZWFuID0gZmFsc2UsXHJcbiAgICB1bnNlbGVjdFByZXZpb3VzOiBib29sZWFuID0gdHJ1ZVxyXG4gICkge1xyXG4gICAgaWYgKHRoaXMuc3RvcmVkU2VsRWxzLmluY2x1ZGVzKHNlbENhcmRFbCkpIHtcclxuICAgICAgaWYgKGFsbG93VW5zZWxTZWxlY3RlZCkge1xyXG4gICAgICAgIGNvbnN0IHNlbENhcmQgPSB0aGlzLnN0b3JlZFNlbEVsc1t0aGlzLnN0b3JlZFNlbEVscy5pbmRleE9mKHNlbENhcmRFbCldXHJcbiAgICAgICAgc2VsQ2FyZC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgICAgICB0aGlzLnN0b3JlZFNlbEVscy5zcGxpY2UodGhpcy5zdG9yZWRTZWxFbHMuaW5kZXhPZihzZWxDYXJkRWwpLCAxKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgLy8gZ2V0IGNvcnJvc3BvbmRpbmcgb2JqZWN0IHVzaW5nIHRoZSBjYXJkRWwgaWRcclxuICAgIGNvbnN0IHNlbE9iaiA9IGNvcnJPYmpMaXN0LmZpbmQoKHgpID0+IHtcclxuICAgICAgY29uc3QgeENhcmQgPSB4IGFzIENhcmRcclxuICAgICAgcmV0dXJuIHhDYXJkLmdldENhcmRJZCgpID09PSBzZWxDYXJkRWwuaWRcclxuICAgIH0pXHJcblxyXG4gICAgLy8gZXJyb3IgaWYgdGhlcmUgaXMgbm8gY29ycm9zcG9uZGluZyBvYmplY3RcclxuICAgIGlmICghc2VsT2JqKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICBgVGhlcmUgaXMgbm8gY29ycm9zcG9uZGluZyBvYmplY3QgdG8gdGhlIHNlbGVjdGVkIGNhcmQsIG1lYW5pbmcgdGhlIGlkIG9mIHRoZSBjYXJkIGVsZW1lbnQgXFxcclxuICAgICAgZG9lcyBub3QgbWF0Y2ggYW55IG9mIHRoZSBjb3Jyb3Nwb25kaW5nICdjYXJkSWQnIGF0dHJpYnR1ZXMuIEVuc3VyZSB0aGF0IHRoZSBjYXJkSWQgYXR0cmlidXRlIFxcXHJcbiAgICAgIGlzIGFzc2lnbmVkIGFzIHRoZSBjYXJkIGVsZW1lbnRzIEhUTUwgJ2lkJyB3aGVuIHRoZSBjYXJkIGlzIGNyZWF0ZWQuYFxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gdW5zZWxlY3QgdGhlIHByZXZpb3VzbHkgc2VsZWN0ZWQgY2FyZCBpZiBpdCBleGlzdHNcclxuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnN0b3JlZFNlbEVscykubGVuZ3RoID4gMCAmJiB1bnNlbGVjdFByZXZpb3VzKSB7XHJcbiAgICAgIGNvbnN0IHN0b3JlZEVsID0gdGhpcy5zdG9yZWRTZWxFbHMucG9wKClcclxuICAgICAgaWYgKHN0b3JlZEVsICE9PSB1bmRlZmluZWQpIHsgc3RvcmVkRWwuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBvbiBjbGljayBhZGQgdGhlICdzZWxlY3RlZCcgY2xhc3Mgb250byB0aGUgZWxlbWVudCB3aGljaCBydW5zIGEgdHJhbnNpdGlvblxyXG4gICAgc2VsQ2FyZEVsLmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5zdG9yZWRTZWxFbHMucHVzaChzZWxDYXJkRWwpXHJcbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xyXG4gICAgICBjYWxsYmFjayhzZWxPYmopXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogTWFuYWdlcyBhZGRpbmcgY2VydGFpbiBwcm9wZXJ0aWVzIHJlYWx0aW5nIHRvIHNjcm9sbGluZyB0ZXh0IHdoZW4gZW50ZXJpbmdcclxuICAgKiBhIGNhcmQgZWxlbWVudC4gV2UgYXNzdW1lIHRoZXJlIGlzIG9ubHkgb25lIHNjcm9sbGluZyB0ZXh0IG9uIHRoZSBjYXJkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbnRlcmluZ0NhcmRFbCAtIGVsZW1lbnQgeW91IGFyZSBlbnRlcmluZywgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBzY3JvbGxUZXh0T25DYXJkRW50ZXIgKGVudGVyaW5nQ2FyZEVsOiBFbGVtZW50KSB7XHJcbiAgICBjb25zdCBzY3JvbGxpbmdUZXh0ID0gZW50ZXJpbmdDYXJkRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIClbMF0gYXMgSFRNTEVsZW1lbnRcclxuICAgIGNvbnN0IHBhcmVudCA9IHNjcm9sbGluZ1RleHQucGFyZW50RWxlbWVudFxyXG5cclxuICAgIGlmIChpc0VsbGlwc2lzQWN0aXZlKHNjcm9sbGluZ1RleHQpKSB7XHJcbiAgICAgIHBhcmVudD8uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsTGVmdClcclxuICAgICAgc2Nyb2xsaW5nVGV4dC5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXApXHJcbiAgICAgIHRoaXMucnVuU2Nyb2xsaW5nVGV4dEFuaW0oc2Nyb2xsaW5nVGV4dCwgZW50ZXJpbmdDYXJkRWwpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogU3RhcnRzIHRvIHNjcm9sbCB0ZXh0IGZyb20gbGVmdCB0byByaWdodC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gc2Nyb2xsaW5nVGV4dCAtIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdGV4dCB0aGF0IHdpbGwgc2Nyb2xsXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBjYXJkRWwgLSBjYXJkIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBydW5TY3JvbGxpbmdUZXh0QW5pbSAoc2Nyb2xsaW5nVGV4dDogRWxlbWVudCwgY2FyZEVsOiBFbGVtZW50KSB7XHJcbiAgICBjb25zdCBMSU5HRVJfQU1UID0gMjBcclxuICAgIGNvbnN0IGZvbnQgPSB3aW5kb3dcclxuICAgICAgLmdldENvbXB1dGVkU3R5bGUoc2Nyb2xsaW5nVGV4dCwgbnVsbClcclxuICAgICAgLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQnKVxyXG5cclxuICAgIGlmIChzY3JvbGxpbmdUZXh0LnRleHRDb250ZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2Nyb2xsaW5nIHRleHQgZWxlbWVudCBkb2VzIG5vdCBjb250YWluIGFueSB0ZXh0IGNvbnRlbnQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdXJyU2Nyb2xsaW5nQW5pbSA9IHNjcm9sbGluZ1RleHQuYW5pbWF0ZShcclxuICAgICAgW1xyXG4gICAgICAgIC8vIGtleWZyYW1lc1xyXG4gICAgICAgIHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgwcHgpJyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZVgoJHtcclxuICAgICAgICAgICAgLWdldFRleHRXaWR0aChzY3JvbGxpbmdUZXh0LnRleHRDb250ZW50LCBmb250KSAtIExJTkdFUl9BTVRcclxuICAgICAgICAgIH1weClgXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICB7XHJcbiAgICAgICAgLy8gdGltaW5nIG9wdGlvbnNcclxuICAgICAgICBkdXJhdGlvbjogNTAwMCxcclxuICAgICAgICBpdGVyYXRpb25zOiAxXHJcbiAgICAgIH1cclxuICAgIClcclxuXHJcbiAgICB0aGlzLmN1cnJTY3JvbGxpbmdBbmltLm9uZmluaXNoID0gKCkgPT4gdGhpcy5zY3JvbGxUZXh0T25DYXJkTGVhdmUoY2FyZEVsKVxyXG4gIH1cclxuXHJcbiAgLyoqIE1hbmFnZXMgcmVtb3ZpbmcgY2VydGFpbiBwcm9wZXJ0aWVzIHJlbGF0aW5nIHRvIHNjcm9sbGluZyB0ZXh0IG9uY2UgbGVhdmluZ1xyXG4gICAqIGEgY2FyZCBlbGVtZW50LiBXZSBhc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgc2Nyb2xsaW5nIHRleHQgb24gdGhlIGNhcmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0hUTUx9IGxlYXZpbmdDYXJkRWwgLSBlbGVtZW50IHlvdSBhcmUgbGVhdmluZywgdGhhdCBjb250YWlucyB0aGUgc2Nyb2xsaW5nIHRleHRcclxuICAgKi9cclxuICBzY3JvbGxUZXh0T25DYXJkTGVhdmUgKGxlYXZpbmdDYXJkRWw6IEVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHNjcm9sbGluZ1RleHQgPSBsZWF2aW5nQ2FyZEVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxpbmdUZXh0XHJcbiAgICApWzBdXHJcbiAgICBjb25zdCBwYXJlbnQgPSBzY3JvbGxpbmdUZXh0LnBhcmVudEVsZW1lbnRcclxuXHJcbiAgICBwYXJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbExlZnQpXHJcbiAgICBzY3JvbGxpbmdUZXh0LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcClcclxuICAgIHRoaXMuY3VyclNjcm9sbGluZ0FuaW0/LmNhbmNlbCgpXHJcbiAgfVxyXG5cclxuICBjbGVhclNlbGVjdGVkRWxzICgpIHtcclxuICAgIHRoaXMuc3RvcmVkU2VsRWxzLnNwbGljZSgwLCB0aGlzLnN0b3JlZFNlbEVscy5sZW5ndGgpXHJcbiAgfVxyXG5cclxuICBhZGRBbGxFdmVudExpc3RlbmVycyAoXHJcbiAgICBjYXJkczogQXJyYXk8RWxlbWVudD4sXHJcbiAgICBvYmpBcnI6IEFycmF5PENhcmQ+LFxyXG4gICAgY2xpY2tDYWxsQmFjazogbnVsbCB8ICgoc2VsT2JqOiB1bmtub3duKSA9PiB2b2lkKSxcclxuICAgIGFsbG93VW5zZWxlY3RlZDogYm9vbGVhbixcclxuICAgIHVuc2VsZWN0UHJldmlvdXM6IGJvb2xlYW5cclxuICApIHtcclxuICAgIHRoaXMuY2xlYXJTZWxlY3RlZEVscygpXHJcblxyXG4gICAgY2FyZHMuZm9yRWFjaCgodHJhY2tDYXJkKSA9PiB7XHJcbiAgICAgIHRyYWNrQ2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+XHJcbiAgICAgICAgdGhpcy5vbkNhcmRDbGljayhcclxuICAgICAgICAgIHRyYWNrQ2FyZCxcclxuICAgICAgICAgIG9iakFycixcclxuICAgICAgICAgIGNsaWNrQ2FsbEJhY2ssXHJcbiAgICAgICAgICBhbGxvd1Vuc2VsZWN0ZWQsXHJcbiAgICAgICAgICB1bnNlbGVjdFByZXZpb3VzXHJcbiAgICAgICAgKVxyXG4gICAgICApXHJcbiAgICAgIHRyYWNrQ2FyZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsVGV4dE9uQ2FyZEVudGVyKHRyYWNrQ2FyZClcclxuICAgICAgfSlcclxuICAgICAgdHJhY2tDYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxUZXh0T25DYXJkTGVhdmUodHJhY2tDYXJkKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuIiwiY2xhc3MgQWxidW0ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBleHRlcm5hbFVybDogc3RyaW5nO1xyXG4gIGNvbnN0cnVjdG9yIChuYW1lOiBzdHJpbmcsIGV4dGVybmFsVXJsOiBzdHJpbmcpIHtcclxuICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgIHRoaXMuZXh0ZXJuYWxVcmwgPSBleHRlcm5hbFVybFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQWxidW1cclxuIiwiaW1wb3J0IHsgY29uZmlnLCBodG1sVG9FbCwgZ2V0VmFsaWRJbWFnZSB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IFRyYWNrLCB7IGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgfSBmcm9tICcuL3RyYWNrJ1xyXG5pbXBvcnQgQ2FyZCBmcm9tICcuL2NhcmQnXHJcbmltcG9ydCBEb3VibHlMaW5rZWRMaXN0IGZyb20gJy4vZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgeyBBcnRpc3REYXRhLCBTcG90aWZ5SW1nIH0gZnJvbSAnLi4vdHlwZXMnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuXHJcbmNsYXNzIEFydGlzdCBleHRlbmRzIENhcmQge1xyXG4gIGFydGlzdElkOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGdlbnJlczogQXJyYXk8c3RyaW5nPjtcclxuICBmb2xsb3dlckNvdW50OiBzdHJpbmc7XHJcbiAgZXh0ZXJuYWxVcmw6IHN0cmluZztcclxuICBpbWFnZVVybDogc3RyaW5nO1xyXG4gIHRvcFRyYWNrczogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCB1bmRlZmluZWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGdlbnJlczogQXJyYXk8c3RyaW5nPiwgZm9sbG93ZXJDb3VudDogc3RyaW5nLCBleHRlcm5hbFVybDogc3RyaW5nLCBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+KSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmFydGlzdElkID0gaWRcclxuICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgIHRoaXMuZ2VucmVzID0gZ2VucmVzXHJcbiAgICB0aGlzLmZvbGxvd2VyQ291bnQgPSBmb2xsb3dlckNvdW50XHJcbiAgICB0aGlzLmV4dGVybmFsVXJsID0gZXh0ZXJuYWxVcmxcclxuICAgIHRoaXMuaW1hZ2VVcmwgPSBnZXRWYWxpZEltYWdlKGltYWdlcylcclxuICAgIHRoaXMudG9wVHJhY2tzID0gdW5kZWZpbmVkXHJcbiAgfVxyXG5cclxuICAvKiogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIGFydGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBUaGUgY2FyZCBpbmRleCB0byB1c2UgZm9yIHRoZSBlbGVtZW50cyBpZCBzdWZmaXhcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIGdldEFydGlzdEh0bWwgKGlkeDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLmFydGlzdFByZWZpeH0ke2lkeH1gXHJcblxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgbGV0IGdlbnJlTGlzdCA9ICcnXHJcbiAgICB0aGlzLmdlbnJlcy5mb3JFYWNoKChnZW5yZSkgPT4ge1xyXG4gICAgICBnZW5yZUxpc3QgKz0gJzxsaT4nICsgZ2VucmUgKyAnPC9saT4nXHJcbiAgICB9KVxyXG5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3R9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLmZhZGVJbn1cIiBpZD1cIiR7dGhpcy5jYXJkSWR9XCI+XHJcbiAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb250ZW50fVwiPlxyXG4gICAgICAgICAgPGhlYWRlciBjbGFzcz1cImFydGlzdC1iYXNlXCI+XHJcbiAgICAgICAgICAgIDxpbWcgc3JjPSR7dGhpcy5pbWFnZVVybH0gYWx0PVwiQXJ0aXN0XCIvPlxyXG4gICAgICAgICAgICA8aDM+JHt0aGlzLm5hbWV9PC9oMz5cclxuICAgICAgICAgICAgPHVsIGNsYXNzPVwiZ2VucmVzXCI+XHJcbiAgICAgICAgICAgICAgJHtnZW5yZUxpc3R9XHJcbiAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICA8L2hlYWRlcj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja3NBcmVhfVwiPlxyXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdFRvcFRyYWNrc31cIj5cclxuICAgICAgICAgICAgICA8aGVhZGVyPlxyXG4gICAgICAgICAgICAgICAgPGg0PlRvcCBUcmFja3M8L2g0PlxyXG4gICAgICAgICAgICAgIDwvaGVhZGVyPlxyXG4gICAgICAgICAgICAgIDx1bCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbEJhcn0gJHtjb25maWcuQ1NTLkNMQVNTRVMudHJhY2tMaXN0fVwiPlxyXG4gICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIGBcclxuICAgIHJldHVybiBodG1sVG9FbChodG1sKVxyXG4gIH1cclxuXHJcbiAgLyoqIFByb2R1Y2VzIHRoZSBjYXJkIGVsZW1lbnQgb2YgdGhpcyBhcnRpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRBcnRpc3RDYXJkSHRtbCAoaWR4OiBudW1iZXIsIHVuYW5pbWF0ZWRBcHBlYXIgPSBmYWxzZSk6IE5vZGUge1xyXG4gICAgY29uc3QgaWQgPSBgJHtjb25maWcuQ1NTLklEcy5hcnRpc3RQcmVmaXh9JHtpZHh9YFxyXG4gICAgdGhpcy5jYXJkSWQgPSBpZFxyXG4gICAgY29uc3QgYXBwZWFyQ2xhc3MgPSB1bmFuaW1hdGVkQXBwZWFyID8gY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhciA6ICcnXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucmFua0NhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW5cclxuICAgIH0gJHthcHBlYXJDbGFzc31cIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3R9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEZyb250XHJcbiAgICAgICAgICAgICAgICAgIH1cIiAgdGl0bGU9XCJDbGljayB0byB2aWV3IG1vcmUgSW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlVXJsfVwiIGFsdD1cIkFsYnVtIENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIH1cIj4ke3RoaXMubmFtZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5Gb2xsb3dlcnM6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMuZm9sbG93ZXJDb3VudH08L3A+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRUb3BUcmFja3MgKCkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldEFydGlzdFRvcFRyYWNrcyh0aGlzLmFydGlzdElkKSlcclxuICAgIGNvbnN0IHRyYWNrc0RhdGEgPSByZXMuZGF0YS50cmFja3NcclxuICAgIGNvbnN0IHRyYWNrT2JqcyA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPigpXHJcblxyXG4gICAgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSh0cmFja3NEYXRhLCB0cmFja09ianMpXHJcblxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB0cmFja09ianNcclxuICAgIHJldHVybiB0cmFja09ianNcclxuICB9XHJcblxyXG4gIGhhc0xvYWRlZFRvcFRyYWNrcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b3BUcmFja3MgIT09IHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQXJ0aXN0c0Zyb21EYXRhIChkYXRhczogQXJyYXk8QXJ0aXN0RGF0YT4sIGFydGlzdEFycjogQXJyYXk8QXJ0aXN0Pikge1xyXG4gIGRhdGFzLmZvckVhY2goKGRhdGE6IEFydGlzdERhdGEpID0+IHtcclxuICAgIGFydGlzdEFyci5wdXNoKFxyXG4gICAgICBuZXcgQXJ0aXN0KFxyXG4gICAgICAgIGRhdGEuaWQsXHJcbiAgICAgICAgZGF0YS5uYW1lLFxyXG4gICAgICAgIGRhdGEuZ2VucmVzLFxyXG4gICAgICAgIGRhdGEuZm9sbG93ZXJzLnRvdGFsLFxyXG4gICAgICAgIGRhdGEuZXh0ZXJuYWxfdXJscy5zcG90aWZ5LFxyXG4gICAgICAgIGRhdGEuaW1hZ2VzXHJcbiAgICAgIClcclxuICAgIClcclxuICB9KVxyXG4gIHJldHVybiBhcnRpc3RBcnJcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0XHJcbiIsImNsYXNzIENhcmQge1xyXG4gIGNhcmRJZDogc3RyaW5nO1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuY2FyZElkID0gJydcclxuICB9XHJcblxyXG4gIGdldENhcmRJZCAoKSB7XHJcbiAgICBpZiAodGhpcy5jYXJkSWQgPT09ICdudWxsJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhcmQgaWQgd2FzIGFza2luZyB0byBiZSByZXRyaWV2ZWQgYnV0IGlzIG51bGwnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY2FyZElkXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYXJkXHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAwOSBOaWNob2xhcyBDLiBaYWthcy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gKi9cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIG5vZGUgaW4gYSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcbiAgZGF0YTogVDtcclxuICBuZXh0OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuICBwcmV2aW91czogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG91Ymx5TGlua2VkTGlzdE5vZGUuXHJcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIHN0b3JlIGluIHRoZSBub2RlLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yIChkYXRhOiBUKSB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkYXRhIHRoYXQgdGhpcyBub2RlIHN0b3Jlcy5cclxuICAgICAqIEBwcm9wZXJ0eSBkYXRhXHJcbiAgICAgKiBAdHlwZSAqXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZGF0YSA9IGRhdGFcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcG9pbnRlciB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gICAgICogQHByb3BlcnR5IG5leHRcclxuICAgICAqIEB0eXBlID9Eb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gICAgICovXHJcbiAgICB0aGlzLm5leHQgPSBudWxsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIHByZXZpb3VzIG5vZGUgaW4gdGhlIERvdWJseUxpbmtlZExpc3QuXHJcbiAgICAgKiBAcHJvcGVydHkgcHJldmlvdXNcclxuICAgICAqIEB0eXBlID9Eb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnByZXZpb3VzID0gbnVsbFxyXG4gIH1cclxufVxyXG4vKipcclxuICogQSBkb3VibHkgbGlua2VkIGxpc3QgaW1wbGVtZW50YXRpb24gaW4gSmF2YVNjcmlwdC5cclxuICogQGNsYXNzIERvdWJseUxpbmtlZExpc3RcclxuICovXHJcbmNsYXNzIERvdWJseUxpbmtlZExpc3Q8VD4ge1xyXG4gIGhlYWQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIHRhaWw6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG91Ymx5TGlua2VkTGlzdFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIC8vIHBvaW50ZXIgdG8gZmlyc3Qgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgdGhpcy5oZWFkID0gbnVsbFxyXG5cclxuICAgIC8vIHBvaW50ZXIgdG8gbGFzdCBub2RlIGluIHRoZSBsaXN0IHdoaWNoIHBvaW50cyB0byBudWxsXHJcbiAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmRzIHNvbWUgZGF0YSB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7VH0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICovXHJcbiAgYWRkIChkYXRhOiBUKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPihkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEJlY2F1c2UgdGhlcmUgYXJlIG5vIG5vZGVzIGluIHRoZSBsaXN0LCBqdXN0IHNldCB0aGVcclxuICAgICAgICogYHRoaXMuaGVhZGAgcG9pbnRlciB0byB0aGUgbmV3IG5vZGUuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBVbmxpa2UgaW4gYSBzaW5nbHkgbGlua2VkIGxpc3QsIHdlIGhhdmUgYSBkaXJlY3QgcmVmZXJlbmNlIHRvXHJcbiAgICAgICAqIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFNldCB0aGUgYG5leHRgIHBvaW50ZXIgb2YgdGhlXHJcbiAgICAgICAqIGN1cnJlbnQgbGFzdCBub2RlIHRvIGBuZXdOb2RlYCBpbiBvcmRlciB0byBhcHBlbmQgdGhlIG5ldyBkYXRhXHJcbiAgICAgICAqIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuIFRoZW4sIHNldCBgbmV3Tm9kZS5wcmV2aW91c2AgdG8gdGhlIGN1cnJlbnRcclxuICAgICAgICogdGFpbCB0byBlbnN1cmUgYmFja3dhcmRzIHRyYWNraW5nIHdvcmsuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAodGhpcy50YWlsICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50YWlsLm5leHQgPSBuZXdOb2RlXHJcbiAgICAgIH1cclxuICAgICAgbmV3Tm9kZS5wcmV2aW91cyA9IHRoaXMudGFpbFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBMYXN0LCByZXNldCBgdGhpcy50YWlsYCB0byBgbmV3Tm9kZWAgdG8gZW5zdXJlIHdlIGFyZSBzdGlsbFxyXG4gICAgICogdHJhY2tpbmcgdGhlIGxhc3Qgbm9kZSBjb3JyZWN0bHkuXHJcbiAgICAgKi9cclxuICAgIHRoaXMudGFpbCA9IG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc2VydHMgc29tZSBkYXRhIGludG8gdGhlIG1pZGRsZSBvZiB0aGUgbGlzdC4gVGhpcyBtZXRob2QgdHJhdmVyc2VzXHJcbiAgICogdGhlIGV4aXN0aW5nIGxpc3QgYW5kIHBsYWNlcyB0aGUgZGF0YSBpbiBhIG5ldyBub2RlIGF0IGEgc3BlY2lmaWMgaW5kZXguXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSBkYXRhLlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIHRoZSBpbmRleCBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGluc2VydEJlZm9yZSAoZGF0YTogVCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGUoZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogU3BlY2lhbCBjYXNlOiBpZiBgaW5kZXhgIGlzIGAwYCwgdGhlbiBubyB0cmF2ZXJzYWwgaXMgbmVlZGVkXHJcbiAgICAgKiBhbmQgd2UgbmVlZCB0byB1cGRhdGUgYHRoaXMuaGVhZGAgdG8gcG9pbnQgdG8gYG5ld05vZGVgLlxyXG4gICAgICovXHJcbiAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgLypcclxuICAgICAgICogRW5zdXJlIHRoZSBuZXcgbm9kZSdzIGBuZXh0YCBwcm9wZXJ0eSBpcyBwb2ludGVkIHRvIHRoZSBjdXJyZW50XHJcbiAgICAgICAqIGhlYWQuXHJcbiAgICAgICAqL1xyXG4gICAgICBuZXdOb2RlLm5leHQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBjdXJyZW50IGhlYWQncyBgcHJldmlvdXNgIHByb3BlcnR5IG5lZWRzIHRvIHBvaW50IHRvIHRoZSBuZXdcclxuICAgICAgICogbm9kZSB0byBlbnN1cmUgdGhlIGxpc3QgaXMgdHJhdmVyc2FibGUgYmFja3dhcmRzLlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbmV3Tm9kZVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogTm93IGl0J3Mgc2FmZSB0byBzZXQgYHRoaXMuaGVhZGAgdG8gdGhlIG5ldyBub2RlLCBlZmZlY3RpdmVseVxyXG4gICAgICAgKiBtYWtpbmcgdGhlIG5ldyBub2RlIHRoZSBmaXJzdCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAgICogdXNlZCBpbnNpZGUgb2YgdGhlIGxvb3AgYmVsb3cuIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG9cclxuICAgICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICAgKiBnb25lLiBUaGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gaW5zZXJ0IGludG8uXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHVzaW5nIGBuZXh0YCBwb2ludGVycywgYW5kIG1ha2VcclxuICAgICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkLiBXaGVuXHJcbiAgICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAgICogaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAgICovXHJcbiAgICAgIHdoaWxlIChjdXJyZW50Lm5leHQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgaXMgZWl0aGVyIHRoZSBub2RlIHRvIGluc2VydCB0aGUgbmV3IGRhdGFcclxuICAgICAgICogYmVmb3JlLCBvciB0aGUgbGFzdCBub2RlIGluIHRoZSBsaXN0LiBUaGUgb25seSB3YXkgdG8gdGVsbCBpcyBpZlxyXG4gICAgICAgKiBgaWAgaXMgc3RpbGwgbGVzcyB0aGFuIGBpbmRleGAsIHRoYXQgbWVhbnMgdGhlIGluZGV4IGlzIG91dCBvZiByYW5nZVxyXG4gICAgICAgKiBhbmQgYW4gZXJyb3Igc2hvdWxkIGJlIHRocm93bi5cclxuICAgICAgICovXHJcbiAgICAgIGlmIChpIDwgaW5kZXgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogSWYgY29kZSBjb250aW51ZXMgdG8gZXhlY3V0ZSBoZXJlLCBpdCBtZWFucyBgY3VycmVudGAgaXMgdGhlIG5vZGVcclxuICAgICAgICogdG8gaW5zZXJ0IG5ldyBkYXRhIGJlZm9yZS5cclxuICAgICAgICpcclxuICAgICAgICogRmlyc3QsIGluc2VydCBgbmV3Tm9kZWAgYWZ0ZXIgYGN1cnJlbnQucHJldmlvdXNgIGJ5IHVwZGF0aW5nXHJcbiAgICAgICAqIGBjdXJyZW50LnByZXZpb3VzLm5leHRgIGFuZCBgbmV3Tm9kZS5wcmV2aW91c2AuXHJcbiAgICAgICAqL1xyXG4gICAgICBjdXJyZW50IS5wcmV2aW91cyEubmV4dCA9IG5ld05vZGVcclxuICAgICAgbmV3Tm9kZSEucHJldmlvdXMgPSBjdXJyZW50LnByZXZpb3VzXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBOZXh0LCBpbnNlcnQgYGN1cnJlbnRgIGFmdGVyIGBuZXdOb2RlYCBieSB1cGRhdGluZyBgbmV3Tm9kZS5uZXh0YCBhbmRcclxuICAgICAgICogYGN1cnJlbnQucHJldmlvdXNgLlxyXG4gICAgICAgKi9cclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gY3VycmVudFxyXG4gICAgICBjdXJyZW50LnByZXZpb3VzID0gbmV3Tm9kZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBzb21lIGRhdGEgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBsaXN0LiBUaGlzIG1ldGhvZCB0cmF2ZXJzZXNcclxuICAgKiB0aGUgZXhpc3RpbmcgbGlzdCBhbmQgcGxhY2VzIHRoZSBkYXRhIGluIGEgbmV3IG5vZGUgYWZ0ZXIgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBhZnRlciB3aGljaCB0byBpbnNlcnQgdGhlIGRhdGEuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGluZGV4IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgaW5zZXJ0QWZ0ZXIgKGRhdGE6IFQsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlKGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAqL1xyXG4gICAgbGV0IGkgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHNpbWlsYXIgdG8gdGhlIGBhZGQoKWAgbWV0aG9kLCBidXQgbWFrZVxyXG4gICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGVcclxuICAgICAqIHRoZSBgcHJldmlvdXNgIHBvaW50ZXIgaW4gYWRkaXRpb24gdG8gYGN1cnJlbnRgLiBXaGVuXHJcbiAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgKiBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIGlzIGVpdGhlciB0aGUgbm9kZSB0byBpbnNlcnQgdGhlIG5ldyBkYXRhXHJcbiAgICAgKiBiZWZvcmUsIG9yIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFRoZSBvbmx5IHdheSB0byB0ZWxsIGlzIGlmXHJcbiAgICAgKiBgaWAgaXMgc3RpbGwgbGVzcyB0aGFuIGBpbmRleGAsIHRoYXQgbWVhbnMgdGhlIGluZGV4IGlzIG91dCBvZiByYW5nZVxyXG4gICAgICogYW5kIGFuIGVycm9yIHNob3VsZCBiZSB0aHJvd24uXHJcbiAgICAgKi9cclxuICAgIGlmIChpIDwgaW5kZXgpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGNvZGUgY29udGludWVzIHRvIGV4ZWN1dGUgaGVyZSwgaXQgbWVhbnMgYGN1cnJlbnRgIGlzIHRoZSBub2RlXHJcbiAgICAgKiB0byBpbnNlcnQgbmV3IGRhdGEgYWZ0ZXIuXHJcbiAgICAgKi9cclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IGBjdXJyZW50YCBpcyB0aGUgdGFpbCwgc28gcmVzZXQgYHRoaXMudGFpbGBcclxuICAgIGlmICh0aGlzLnRhaWwgPT09IGN1cnJlbnQpIHtcclxuICAgICAgdGhpcy50YWlsID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogT3RoZXJ3aXNlLCBpbnNlcnQgYG5ld05vZGVgIGJlZm9yZSBgY3VycmVudC5uZXh0YCBieSB1cGRhdGluZ1xyXG4gICAgICAgKiBgY3VycmVudC5uZXh0LnByZXZpb3VzYCBhbmQgYG5ld05vZGUubm9kZWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IG5ld05vZGVcclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gY3VycmVudCEubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBOZXh0LCBpbnNlcnQgYG5ld05vZGVgIGFmdGVyIGBjdXJyZW50YCBieSB1cGRhdGluZyBgbmV3Tm9kZS5wcmV2aW91c2AgYW5kXHJcbiAgICAgKiBgY3VycmVudC5uZXh0YC5cclxuICAgICAqL1xyXG4gICAgbmV3Tm9kZS5wcmV2aW91cyA9IGN1cnJlbnRcclxuICAgIGN1cnJlbnQhLm5leHQgPSBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIGRhdGEgaW4gdGhlIGdpdmVuIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgbm9kZSB3aG9zZSBkYXRhXHJcbiAgICogICAgICBzaG91bGQgYmUgcmV0dXJuZWQuXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBkYXRhIGluIHRoZSBcImRhdGFcIiBwb3J0aW9uIG9mIHRoZSBnaXZlbiBub2RlXHJcbiAgICogICAgICBvciB1bmRlZmluZWQgaWYgdGhlIG5vZGUgZG9lc24ndCBleGlzdC5cclxuICAgKi9cclxuICBnZXQgKGluZGV4OiBudW1iZXIsIGFzTm9kZSA9IGZhbHNlKTogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBUIHtcclxuICAgIC8vIGVuc3VyZSBgaW5kZXhgIGlzIGEgcG9zaXRpdmUgdmFsdWVcclxuICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGkgPSAwXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcywgYnV0IG1ha2Ugc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55XHJcbiAgICAgICAqIG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGUgdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpblxyXG4gICAgICAgKiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW4gYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zXHJcbiAgICAgICAqIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0byBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgbWlnaHQgYmUgbnVsbCBpZiB3ZSd2ZSBnb25lIHBhc3QgdGhlXHJcbiAgICAgICAqIGVuZCBvZiB0aGUgbGlzdC4gSW4gdGhhdCBjYXNlLCB3ZSByZXR1cm4gYHVuZGVmaW5lZGAgdG8gaW5kaWNhdGVcclxuICAgICAgICogdGhhdCB0aGUgbm9kZSBhdCBgaW5kZXhgIHdhcyBub3QgZm91bmQuIElmIGBjdXJyZW50YCBpcyBub3RcclxuICAgICAgICogYG51bGxgLCB0aGVuIGl0J3Mgc2FmZSB0byByZXR1cm4gYGN1cnJlbnQuZGF0YWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgIGlmIChhc05vZGUpIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGluZGV4ICR7aW5kZXh9IG91dCBvZiByYW5nZWApXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbmRleCAke2luZGV4fSBvdXQgb2YgcmFuZ2VgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBpbmRleCBvZiB0aGUgZGF0YSBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gc2VhcmNoIGZvci5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBkYXRhIGluIHRoZSBsaXN0XHJcbiAgICogICAgICBvciAtMSBpZiBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgaW5kZXhPZiAoZGF0YTogVCk6IG51bWJlciB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMgYGRhdGFgLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyBgaW5kZXhgIGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoY3VycmVudC5kYXRhID09PSBkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8ga2VlcCB0cmFjayBvZiB3aGVyZSB3ZSBhcmVcclxuICAgICAgaW5kZXgrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIC0xIGFzIHRoZSBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gLTFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWF0Y2hlciBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIHdoZW4gYW4gaXRlbSBtYXRjaGVzXHJcbiAgICogICAgICBhbmQgZmFsc2Ugd2hlbiBhbiBpdGVtIGRvZXNuJ3QgbWF0Y2guXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBmaXJzdCBpdGVtIHRoYXQgcmV0dXJucyB0cnVlIGZyb20gdGhlIG1hdGNoZXIsIHVuZGVmaW5lZFxyXG4gICAqICAgICAgaWYgbm8gaXRlbXMgbWF0Y2guXHJcbiAgICovXHJcbiAgZmluZCAobWF0Y2hlcjogKGFyZzA6IFQpID0+IFQpIDogVCB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgZGF0YSBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gYHVuZGVmaW5lZGAgYXMgdGhlXHJcbiAgICAgKiBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignTm8gbWF0Y2hpbmcgZGF0YSBmb3VuZCcpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXRjaGVyIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgd2hlbiBhbiBpdGVtIG1hdGNoZXNcclxuICAgKiAgICAgIGFuZCBmYWxzZSB3aGVuIGFuIGl0ZW0gZG9lc24ndCBtYXRjaC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb25cclxuICAgKiAgICAgIG9yIC0xIGlmIHRoZXJlIGFyZSBubyBtYXRjaGluZyBpdGVtcy5cclxuICAgKi9cclxuICBmaW5kSW5kZXggKG1hdGNoZXI6IChhcmcwOiBUKSA9PiBib29sZWFuKTogbnVtYmVyIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIHRoZSBpbmRleCBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hlcmUgd2UgYXJlXHJcbiAgICAgIGluZGV4KytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiAtMSBhcyB0aGVcclxuICAgICAqIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiAtMVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB0aGUgbm9kZSBmcm9tIHRoZSBnaXZlbiBsb2NhdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG5vZGUgdG8gcmVtb3ZlLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgaW5kZXggaXMgb3V0IG9mIHJhbmdlLlxyXG4gICAqL1xyXG4gIHJlbW92ZSAoaW5kZXg6IG51bWJlcikgOiBUIHtcclxuICAgIC8vIHNwZWNpYWwgY2FzZXM6IG5vIG5vZGVzIGluIHRoZSBsaXN0IG9yIGBpbmRleGAgaXMgbmVnYXRpdmVcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwgfHwgaW5kZXggPCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogcmVtb3ZpbmcgdGhlIGZpcnN0IG5vZGVcclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvLyBzdG9yZSB0aGUgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGhlYWRcclxuICAgICAgY29uc3QgZGF0YTogVCA9IHRoaXMuaGVhZC5kYXRhXHJcblxyXG4gICAgICAvLyBqdXN0IHJlcGxhY2UgdGhlIGhlYWQgd2l0aCB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXh0XHJcblxyXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHRoZXJlIHdhcyBvbmx5IG9uZSBub2RlLCBzbyBhbHNvIHJlc2V0IGB0aGlzLnRhaWxgXHJcbiAgICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbnVsbFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdGhlIGRhdGEgYXQgdGhlIHByZXZpb3VzIGhlYWQgb2YgdGhlIGxpc3RcclxuICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGdldCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGVcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8gaW5jcmVtZW50IHRoZSBjb3VudFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgYGN1cnJlbnRgIGlzbid0IGBudWxsYCwgdGhlbiB0aGF0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBub2RlXHJcbiAgICAgKiB0byByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIHNraXAgb3ZlciB0aGUgbm9kZSB0byByZW1vdmVcclxuICAgICAgY3VycmVudCEucHJldmlvdXMhLm5leHQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIElmIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSBgdGhpcy50YWlsYC5cclxuICAgICAgICpcclxuICAgICAgICogSWYgd2UgYXJlIG5vdCBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSB0aGUgYmFja3dhcmRzXHJcbiAgICAgICAqIHBvaW50ZXIgZm9yIGBjdXJyZW50Lm5leHRgIHRvIHByZXNlcnZlIHJldmVyc2UgdHJhdmVyc2FsLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICAgIHRoaXMudGFpbCA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHRoZSB2YWx1ZSB0aGF0IHdhcyBqdXN0IHJlbW92ZWQgZnJvbSB0aGUgbGlzdFxyXG4gICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIHdlJ3ZlIG1hZGUgaXQgdGhpcyBmYXIsIGl0IG1lYW5zIGBpbmRleGAgaXMgYSB2YWx1ZSB0aGF0XHJcbiAgICAgKiBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LCBzbyB0aHJvdyBhbiBlcnJvci5cclxuICAgICAqL1xyXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFsbCBub2RlcyBmcm9tIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqL1xyXG4gIGNsZWFyICgpOiB2b2lkIHtcclxuICAgIC8vIGp1c3QgcmVzZXQgYm90aCB0aGUgaGVhZCBhbmQgdGFpbCBwb2ludGVyIHRvIG51bGxcclxuICAgIHRoaXMuaGVhZCA9IG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBub2RlcyBpbiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIG5vZGVzIGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGdldCBzaXplICgpOiBudW1iZXIge1xyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiB0aGUgbGlzdCBpcyBlbXB0eVxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gMFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGNvdW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZVxyXG4gICAgICogYmVlbiB2aXNpdGVkIGluc2lkZSB0aGUgbG9vcCBiZWxvdy4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzXHJcbiAgICAgKiBpcyB0aGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBjb3VudCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhhdCBtZWFucyB3ZSdyZSBub3QgeWV0IGF0IHRoZVxyXG4gICAgICogZW5kIG9mIHRoZSBsaXN0LCBzbyBhZGRpbmcgMSB0byBgY291bnRgIGFuZCB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBjb3VudCsrXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogV2hlbiBgY3VycmVudGAgaXMgYG51bGxgLCB0aGUgbG9vcCBpcyBleGl0ZWQgYXQgdGhlIHZhbHVlIG9mIGBjb3VudGBcclxuICAgICAqIGlzIHRoZSBudW1iZXIgb2Ygbm9kZXMgdGhhdCB3ZXJlIGNvdW50ZWQgaW4gdGhlIGxvb3AuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiBjb3VudFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRlZmF1bHQgaXRlcmF0b3IgZm9yIHRoZSBjbGFzcy5cclxuICAgKiBAcmV0dXJucyB7SXRlcmF0b3J9IEFuIGl0ZXJhdG9yIGZvciB0aGUgY2xhc3MuXHJcbiAgICovXHJcbiAgW1N5bWJvbC5pdGVyYXRvcl0gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpdGVyYXRvciB0aGF0IHJldHVybnMgZWFjaCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtHZW5lcmF0b3J9IEFuIGl0ZXJhdG9yIG9uIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gICogdmFsdWVzICgpOiBHZW5lcmF0b3I8VCwgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGVyZSBpcyBhIHBpZWNlIG9mIGRhdGFcclxuICAgICAqIHRvIHlpZWxkLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICB5aWVsZCBjdXJyZW50LmRhdGFcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuIGl0ZXJhdG9yIHRoYXQgcmV0dXJucyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgaW4gcmV2ZXJzZSBvcmRlci5cclxuICAgKiBAcmV0dXJucyB7R2VuZXJhdG9yfSBBbiBpdGVyYXRvciBvbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICAqIHJldmVyc2UgKCk6IEdlbmVyYXRvcjxULCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIHRhaWwgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy50YWlsXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoZXJlIGlzIGEgcGllY2Ugb2YgZGF0YVxyXG4gICAgICogdG8geWllbGQuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIHlpZWxkIGN1cnJlbnQuZGF0YVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhlIGxpc3QgaW50byBhIHN0cmluZyByZXByZXNlbnRhdGlvbi5cclxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGlzdC5cclxuICAgKi9cclxuICB0b1N0cmluZyAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBbLi4udGhpc10udG9TdHJpbmcoKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG91Ymx5TGlua2VkTGlzdFxyXG5leHBvcnQgZnVuY3Rpb25cclxuYXJyYXlUb0RvdWJseUxpbmtlZExpc3QgPFQ+IChhcnI6IEFycmF5PFQ+KSB7XHJcbiAgY29uc3QgbGlzdCA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFQ+KClcclxuICBhcnIuZm9yRWFjaCgoZGF0YSkgPT4ge1xyXG4gICAgbGlzdC5hZGQoZGF0YSlcclxuICB9KVxyXG5cclxuICByZXR1cm4gbGlzdFxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIHByb21pc2VIYW5kbGVyLFxyXG4gIGh0bWxUb0VsLFxyXG4gIGFkZFJlc2l6ZURyYWcsXHJcbiAgbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyxcclxuICB0aHJvd0V4cHJlc3Npb25cclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IERvdWJseUxpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCBQbGF5YWJsZUV2ZW50QXJnIGZyb20gJy4vcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzJ1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vcHVic3ViL2FnZ3JlZ2F0b3InXHJcbmltcG9ydCB7IElQbGF5YWJsZSB9IGZyb20gJy4uL3R5cGVzJ1xyXG5cclxuY2xhc3MgU3BvdGlmeVBsYXliYWNrIHtcclxuICBwbGF5ZXI6IGFueTtcclxuICBpc0V4ZWN1dGluZ0FjdGlvbjogYm9vbGVhbjtcclxuICBkZXZpY2VfaWQ6IHN0cmluZztcclxuICBzZWxQbGF5aW5nOiB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwgfCBFbGVtZW50XHJcbiAgICAgIHRyYWNrX3VyaTogc3RyaW5nXHJcbiAgICAgIHRyYWNrRGF0YU5vZGU6IG51bGwgfCBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgfVxyXG5cclxuICBnZXRTdGF0ZUludGVydmFsOiBOb2RlSlMuVGltZW91dCB8IG51bGw7XHJcblxyXG4gIHdlYlBsYXllckVsczoge1xyXG4gICAgdGl0bGU6IEVsZW1lbnQgfCBudWxsXHJcbiAgICBwcm9ncmVzczogRWxlbWVudCB8IG51bGxcclxuICAgIGN1cnJUaW1lOiBFbGVtZW50IHwgbnVsbFxyXG4gICAgZHVyYXRpb246IEVsZW1lbnQgfCBudWxsXHJcbiAgfTtcclxuXHJcbiAgcGxheWVySXNSZWFkeTogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICB0aGlzLnBsYXllciA9IG51bGxcclxuICAgIHRoaXMuZGV2aWNlX2lkID0gJydcclxuICAgIHRoaXMuc2VsUGxheWluZyA9IHtcclxuICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgdHJhY2tfdXJpOiAnJyxcclxuICAgICAgdHJhY2tEYXRhTm9kZTogbnVsbFxyXG4gICAgfVxyXG4gICAgdGhpcy5nZXRTdGF0ZUludGVydmFsID0gbnVsbFxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMgPSB7XHJcbiAgICAgIHRpdGxlOiBudWxsLFxyXG4gICAgICBwcm9ncmVzczogbnVsbCxcclxuICAgICAgY3VyclRpbWU6IG51bGwsXHJcbiAgICAgIGR1cmF0aW9uOiBudWxsXHJcbiAgICB9XHJcbiAgICB0aGlzLnBsYXllcklzUmVhZHkgPSBmYWxzZVxyXG4gICAgdGhpcy5fbG9hZFdlYlBsYXllcigpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIF9sb2FkV2ViUGxheWVyICgpIHtcclxuICAgIHByb21pc2VIYW5kbGVyPEF4aW9zUmVzcG9uc2U8c3RyaW5nIHwgbnVsbD4+KGF4aW9zLnJlcXVlc3Q8c3RyaW5nIHwgbnVsbD4oeyBtZXRob2Q6ICdHRVQnLCB1cmw6IGNvbmZpZy5VUkxzLmdldEFjY2Vzc1Rva2VuIH0pLCAocmVzKSA9PiB7XHJcbiAgICAgIC8vIHRoaXMgdGFrZXMgdG9vIGxvbmcgYW5kIHNwb3RpZnkgc2RrIG5lZWRzIHdpbmRvdy5vblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5IHRvIGJlIGRlZmluZWQgcXVpY2tlci5cclxuICAgICAgY29uc29sZS5sb2coJ3JlcXVlc3QgcGxheWVyJylcclxuICAgICAgY29uc3QgTk9fQ09OVEVOVCA9IDIwNFxyXG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gTk9fQ09OVEVOVCB8fCByZXMuZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYWNjZXNzIHRva2VuIGhhcyBubyBjb250ZW50JylcclxuICAgICAgfSBlbHNlIGlmICh3aW5kb3cuU3BvdGlmeSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdpcyBkZWZpbmVkIHNvIGNyZWF0ZScpXHJcbiAgICAgICAgLy8gaWYgdGhlIHNwb3RpZnkgc2RrIGlzIGFscmVhZHkgZGVmaW5lZCBzZXQgcGxheWVyIHdpdGhvdXQgc2V0dGluZyBvblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5IG1lYW5pbmcgdGhlIHdpbmRvdzogV2luZG93IGlzIGluIGEgZGlmZmVyZW50IHNjb3BlXHJcbiAgICAgICAgLy8gdXNlIHdpbmRvdy5TcG90aWZ5LlBsYXllciBhcyBzcG90aWZ5IG5hbWVzcGFjZSBpcyBkZWNsYXJlZCBpbiB0aGUgV2luZG93IGludGVyZmFjZSBhcyBwZXIgRGVmaW5pdGVseVR5cGVkIC0+IHNwb3RpZnktd2ViLXBsYXliYWNrLXNkayAtPiBpbmRleC5kLnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9EZWZpbml0ZWx5VHlwZWQvRGVmaW5pdGVseVR5cGVkL3RyZWUvbWFzdGVyL3R5cGVzL3Nwb3RpZnktd2ViLXBsYXliYWNrLXNka1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZvbHVtZTogMC4xXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLl9hZGRMaXN0ZW5lcnMoKVxyXG4gICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIHBsYXllciFcclxuICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvZiBzcG90aWZ5IHNkayBpcyB1bmRlZmluZWRcclxuICAgICAgICB3aW5kb3cub25TcG90aWZ5V2ViUGxheWJhY2tTREtSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdjcmVhdGUgd2hlbiB1bmRlZmluZWQnKVxyXG4gICAgICAgICAgLy8gaWYgZ2V0dGluZyB0b2tlbiB3YXMgc3VjY2VzZnVsIGNyZWF0ZSBzcG90aWZ5IHBsYXllciB1c2luZyB0aGUgd2luZG93IGluIHRoaXMgc2NvcGVcclxuICAgICAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgICAgIG5hbWU6ICdTcG90aWZ5IEluZm8gV2ViIFBsYXllcicsXHJcbiAgICAgICAgICAgIGdldE9BdXRoVG9rZW46IChjYikgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAgY2IocmVzLmRhdGEpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZvbHVtZTogMC4xXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgdGhpcy5fYWRkTGlzdGVuZXJzKClcclxuICAgICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIHBsYXllciFcclxuICAgICAgICAgIHRoaXMucGxheWVyLmNvbm5lY3QoKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2FkZExpc3RlbmVycyAoKSB7XHJcbiAgICAvLyBFcnJvciBoYW5kbGluZ1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2luaXRpYWxpemF0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2F1dGhlbnRpY2F0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdwbGF5YmFjayBjb3VsZG50IHN0YXJ0JylcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignYWNjb3VudF9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdwbGF5YmFja19lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBQbGF5YmFjayBzdGF0dXMgdXBkYXRlc1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3BsYXllcl9zdGF0ZV9jaGFuZ2VkJywgKHN0YXRlOiBTcG90aWZ5LlBsYXliYWNrU3RhdGUgfCBudWxsKSA9PiB7fSlcclxuXHJcbiAgICAvLyBSZWFkeVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUmVhZHkgd2l0aCBEZXZpY2UgSUQnLCBkZXZpY2VfaWQpXHJcbiAgICAgIHRoaXMuZGV2aWNlX2lkID0gZGV2aWNlX2lkXHJcbiAgICAgIHRoaXMuYXBwZW5kV2ViUGxheWVySHRtbCgpXHJcbiAgICAgIHRoaXMucGxheWVySXNSZWFkeSA9IHRydWVcclxuICAgIH0pXHJcblxyXG4gICAgLy8gTm90IFJlYWR5XHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignbm90X3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnRGV2aWNlIElEIGhhcyBnb25lIG9mZmxpbmUnLCBkZXZpY2VfaWQpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZ2V0V2ViUGxheWVyRWxzICgpIHtcclxuICAgIGNvbnN0IHdlYlBsYXllckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMud2ViUGxheWVyKSA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCBwbGF5VGltZUJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlUaW1lQmFyKSA/PyB0aHJvd0V4cHJlc3Npb24oJ3BsYXkgdGltZSBiYXIgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMucHJvZ3Jlc3MgPSB3ZWJQbGF5ZXJFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFxyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3NcclxuICAgIClbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgcHJvZ3Jlc3MgYmFyIGRvZXMgbm90IGV4aXN0JylcclxuICAgIHRoaXMud2ViUGxheWVyRWxzLnRpdGxlID0gd2ViUGxheWVyRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2g0JylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgdGl0bGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXl0aW1lIGJhciBlbGVtZW50c1xyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMuY3VyclRpbWUgPSBwbGF5VGltZUJhci5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpWzBdIGFzIEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIGN1cnJlbnQgdGltZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIHRoaXMud2ViUGxheWVyRWxzLmR1cmF0aW9uID0gcGxheVRpbWVCYXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3AnKVsxXSBhcyBFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBkdXJhdGlvbiB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gIH1cclxuXHJcbiAgYXBwZW5kV2ViUGxheWVySHRtbCAoKSB7XHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgPGFydGljbGUgaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllcn1cIiBjbGFzcz1cInJlc2l6ZS1kcmFnXCI+XHJcbiAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj5UaXRsZTwvaDQ+XHJcbiAgICAgICAgPGRpdiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucGxheVRpbWVCYXJ9XCI+XHJcbiAgICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnByb2dyZXNzQmFyfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3N9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxwPjA6MDA8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L2FydGljbGU+XHJcbiAgICBgXHJcblxyXG4gICAgY29uc3Qgd2ViUGxheWVyRWwgPSBodG1sVG9FbChodG1sKVxyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmQod2ViUGxheWVyRWwgYXMgTm9kZSlcclxuICAgIHRoaXMuZ2V0V2ViUGxheWVyRWxzKClcclxuICB9XHJcblxyXG4gIHVwZGF0ZVdlYlBsYXllciAocGVyY2VudERvbmU6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikge1xyXG4gICAgaWYgKHBvc2l0aW9uICE9PSAwKSB7XHJcbiAgICAgICh0aGlzLndlYlBsYXllckVscy5wcm9ncmVzcyBhcyBIVE1MRWxlbWVudCkuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50RG9uZX0lYFxyXG4gICAgICBpZiAodGhpcy53ZWJQbGF5ZXJFbHMuY3VyclRpbWUgPT0gbnVsbCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudCB0aW1lIGVsZW1lbnQgaXMgbnVsbCcpXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy53ZWJQbGF5ZXJFbHMuY3VyclRpbWUudGV4dENvbnRlbnQgPVxyXG4gICAgICAgIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMocG9zaXRpb24pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogU2V0cyBhbiBpbnRlcnZhbCB0aGF0IG9idGFpbnMgdGhlIHN0YXRlIG9mIHRoZSBwbGF5ZXIgZXZlcnkgc2Vjb25kLlxyXG4gICAqIFNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIGEgc29uZyBpcyBwbGF5aW5nLlxyXG4gICAqL1xyXG4gIHNldEdldFN0YXRlSW50ZXJ2YWwgKCkge1xyXG4gICAgbGV0IGR1cmF0aW9uTWluU2VjID0gJydcclxuICAgIGlmICh0aGlzLmdldFN0YXRlSW50ZXJ2YWwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwpXHJcbiAgICB9XHJcbiAgICAvLyBzZXQgdGhlIGludGVydmFsIHRvIHJ1biBldmVyeSBzZWNvbmQgYW5kIG9idGFpbiB0aGUgc3RhdGVcclxuICAgIHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCkudGhlbigoc3RhdGU6IHsgcG9zaXRpb246IGFueTsgZHVyYXRpb246IGFueSB9KSA9PiB7XHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgJ1VzZXIgaXMgbm90IHBsYXlpbmcgbXVzaWMgdGhyb3VnaCB0aGUgV2ViIFBsYXliYWNrIFNESydcclxuICAgICAgICAgIClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB7IHBvc2l0aW9uLCBkdXJhdGlvbiB9ID0gc3RhdGVcclxuXHJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXNudCBhIGR1cmF0aW9uIHNldCBmb3IgdGhpcyBzb25nIHNldCBpdC5cclxuICAgICAgICBpZiAoZHVyYXRpb25NaW5TZWMgPT09ICcnKSB7XHJcbiAgICAgICAgICBkdXJhdGlvbk1pblNlYyA9IG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMoZHVyYXRpb24pXHJcbiAgICAgICAgICB0aGlzLndlYlBsYXllckVscyEuZHVyYXRpb24hLnRleHRDb250ZW50ID0gZHVyYXRpb25NaW5TZWNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBlcmNlbnREb25lID0gKHBvc2l0aW9uIC8gZHVyYXRpb24pICogMTAwXHJcblxyXG4gICAgICAgIC8vIHRoZSBwb3NpdGlvbiBnZXRzIHNldCB0byAwIHdoZW4gdGhlIHNvbmcgaXMgZmluaXNoZWRcclxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApIHtcclxuICAgICAgICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCB3YXMgbnVsbCBiZWZvcmUgZGVzZWxlY3Rpb24gb24gc29uZyBmaW5pc2gnKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgICAgICB0aGlzLnNlbFBsYXlpbmcgPSB7IGVsZW1lbnQ6IG51bGwsIHRyYWNrX3VyaTogJycsIHRyYWNrRGF0YU5vZGU6IG51bGwgfTtcclxuXHJcbiAgICAgICAgICAodGhpcy53ZWJQbGF5ZXJFbHMucHJvZ3Jlc3MgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcbiAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCBhcyBOb2RlSlMuVGltZW91dClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gaWYgdGhlIHBvc2l0aW9uIGlzbnQgMCB1cGRhdGUgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudHNcclxuICAgICAgICAgIHRoaXMudXBkYXRlV2ViUGxheWVyKHBlcmNlbnREb25lLCBwb3NpdGlvbilcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9LCAxMDAwKVxyXG4gIH1cclxuXHJcbiAgLyoqIFNlbGVjdCBhIGNlcnRhaW4gcGxheS9wYXVzZSBlbGVtZW50IGFuZCBwbGF5IHRoZSBnaXZlbiB0cmFjayB1cmlcclxuICAgKiBhbmQgdW5zZWxlY3QgdGhlIHByZXZpb3VzIG9uZSB0aGVuIHBhdXNlIHRoZSBwcmV2aW91cyB0cmFja191cmkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BsYXlhYmxlRXZlbnRBcmd9IGV2ZW50QXJnIC0gYSBjbGFzcyB0aGF0IGNvbnRhaW5zIHRoZSBjdXJyZW50LCBuZXh0IGFuZCBwcmV2aW91cyB0cmFja3MgdG8gcGxheVxyXG4gICAqL1xyXG4gIGFzeW5jIHNldFNlbFBsYXlpbmdFbCAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcpIHtcclxuICAgIGNvbnNvbGUubG9nKGV2ZW50QXJnLnBsYXlhYmxlTm9kZSlcclxuICAgIC8vIGlmIHRoZSBwbGF5ZXIgaXNuJ3QgcmVhZHkgd2UgY2Fubm90IGNvbnRpbnVlLlxyXG4gICAgaWYgKCF0aGlzLnBsYXllcklzUmVhZHkpIHtcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXllciBpcyBub3QgcmVhZHknKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGlmICh0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdpcyBjdXJyZW50bHkgZXhlY3V0aW5nIGFjdGlvbicpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuICAgIGNvbnNvbGUubG9nKCdTdGFydCBBY3Rpb24nKVxyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ICE9IG51bGwpIHtcclxuICAgICAgLy8gaWYgdGhlcmUgYWxyZWFkeSBpcyBhIHNlbGVjdGVkIGVsZW1lbnQgdW5zZWxlY3QgaXRcclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcblxyXG4gICAgICBhd2FpdCB0aGlzLnBhdXNlKClcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwgYXMgTm9kZUpTLlRpbWVvdXQpXHJcbiAgICAgIC8vIGlmIHRoZSBzZWxlY3RlZCBlbCBpcyB0aGUgc2FtZSBhcyB0aGUgcHJldiB0aGVuIG51bGwgaXQgYW5kIHJldHVybiBzbyB3ZSBkbyBub3QgZW5kIHVwIHJlc2VsZWN0aW5nIGl0IHJpZ2h0IGFmdGVyIGRlc2VsZWN0aW5nLlxyXG4gICAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPT09IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbCkge1xyXG4gICAgICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID0gbnVsbFxyXG4gICAgICAgIHRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gPSBmYWxzZVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdBY3Rpb24gRW5kZWQnKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJldiB0cmFjayB1cmkgaXMgdGhlIHNhbWUgdGhlbiByZXN1bWUgdGhlIHNvbmcgaW5zdGVhZCBvZiByZXBsYXlpbmcgaXQuXHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9PT0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaSkge1xyXG4gICAgICBhd2FpdCB0aGlzLnN0YXJ0VHJhY2soXHJcbiAgICAgICAgZXZlbnRBcmcuY3VyclBsYXlhYmxlLnNlbEVsLFxyXG4gICAgICAgIGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmksXHJcbiAgICAgICAgYXN5bmMgKCkgPT4gdGhpcy5yZXN1bWUoZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaSksXHJcbiAgICAgICAgZXZlbnRBcmcuY3VyclBsYXlhYmxlLnRpdGxlLFxyXG4gICAgICAgIGV2ZW50QXJnLnBsYXlhYmxlTm9kZVxyXG4gICAgICApXHJcbiAgICAgIGNvbnNvbGUubG9nKCdBY3Rpb24gRW5kZWQnKVxyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKFxyXG4gICAgICBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwsXHJcbiAgICAgIGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmksXHJcbiAgICAgIGFzeW5jICgpID0+IHRoaXMucGxheShldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSxcclxuICAgICAgZXZlbnRBcmcuY3VyclBsYXlhYmxlLnRpdGxlLFxyXG4gICAgICBldmVudEFyZy5wbGF5YWJsZU5vZGVcclxuICAgIClcclxuICAgIGNvbnNvbGUubG9nKCdBY3Rpb24gRW5kZWQnKVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBhc3luYyBzdGFydFRyYWNrIChzZWxFbDogRWxlbWVudCwgdHJhY2tfdXJpOiBzdHJpbmcsIHBsYXlpbmdBc3luY0Z1bmM6IEZ1bmN0aW9uLCB0aXRsZTogc3RyaW5nLCB0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICAgIGNvbnNvbGUubG9nKCdTdGFydCcpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSA9IHRyYWNrTm9kZVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBzZWxFbFxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID0gdHJhY2tfdXJpXHJcblxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMhLnRpdGxlIS50ZXh0Q29udGVudCA9IHRpdGxlXHJcblxyXG4gICAgYXdhaXQgcGxheWluZ0FzeW5jRnVuYygpXHJcblxyXG4gICAgLy8gc2V0IHBsYXlpbmcgc3RhdGUgb25jZSBzb25nIHN0YXJ0cyBwbGF5aW5nXHJcbiAgICB0aGlzLnNldEdldFN0YXRlSW50ZXJ2YWwoKVxyXG4gIH1cclxuXHJcbiAgLyoqIFBsYXlzIGEgdHJhY2sgdGhyb3VnaCB0aGlzIGRldmljZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFja191cmkgLSB0aGUgdHJhY2sgdXJpIHRvIHBsYXlcclxuICAgKiBAcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdHJhY2sgaGFzIGJlZW4gcGxheWVkIHN1Y2Nlc2Z1bGx5LlxyXG4gICAqL1xyXG4gIGFzeW5jIHBsYXkgKHRyYWNrX3VyaTogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXlUcmFjayh0aGlzLmRldmljZV9pZCwgdHJhY2tfdXJpKSlcclxuICAgIClcclxuICAgIGNvbnNvbGUubG9nKCdwbGF5JylcclxuICB9XHJcblxyXG4gIGFzeW5jIHJlc3VtZSAodHJhY2tfdXJpOiBzdHJpbmcpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnJlc3VtZSgpXHJcbiAgICBjb25zb2xlLmxvZygncmVzdW1lJylcclxuICB9XHJcblxyXG4gIGFzeW5jIHBhdXNlICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnBhdXNlKClcclxuICAgIGNvbnNvbGUubG9nKCdwYXVzZWQnKVxyXG4gIH1cclxufVxyXG5cclxuY29uc3Qgc3BvdGlmeVBsYXliYWNrID0gbmV3IFNwb3RpZnlQbGF5YmFjaygpXHJcblxyXG5pZiAoKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgLy8gY3JlYXRlIGEgZ2xvYmFsIHZhcmlhYmxlIHRvIGJlIHVzZWRcclxuICAod2luZG93IGFzIGFueSkuZXZlbnRBZ2dyZWdhdG9yID0gbmV3IEV2ZW50QWdncmVnYXRvcigpXHJcbn1cclxuY29uc3QgZXZlbnRBZ2dyZWdhdG9yID0gKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciBhcyBFdmVudEFnZ3JlZ2F0b3JcclxuXHJcbi8vIHN1YnNjcmliZSB0aGUgc2V0UGxheWluZyBlbGVtZW50IGV2ZW50XHJcbmV2ZW50QWdncmVnYXRvci5zdWJzY3JpYmUoUGxheWFibGVFdmVudEFyZy5uYW1lLCAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcpID0+XHJcbiAgc3BvdGlmeVBsYXliYWNrLnNldFNlbFBsYXlpbmdFbChldmVudEFyZylcclxuKVxyXG5hZGRSZXNpemVEcmFnKClcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1NhbWVQbGF5aW5nVVJJICh1cmk6IHN0cmluZykge1xyXG4gIHJldHVybiAoXHJcbiAgICB1cmkgPT09IHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnRyYWNrX3VyaSAmJlxyXG4gICAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ICE9IG51bGxcclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyICh1cmk6IHN0cmluZywgc2VsRWw6IEVsZW1lbnQsIHRyYWNrRGF0YU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICBpZiAoaXNTYW1lUGxheWluZ1VSSSh1cmkpKSB7XHJcbiAgICAvLyBUaGlzIGVsZW1lbnQgd2FzIHBsYXlpbmcgYmVmb3JlIHJlcmVuZGVyaW5nIHNvIHNldCBpdCB0byBiZSB0aGUgY3VycmVudGx5IHBsYXlpbmcgb25lIGFnYWluXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ID0gc2VsRWxcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGUgPSB0cmFja0RhdGFOb2RlXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IGNvbmZpZywgaHRtbFRvRWwsIGdldFZhbGlkSW1hZ2UgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCBUcmFjaywgeyBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhIH0gZnJvbSAnLi90cmFjaydcclxuaW1wb3J0IENhcmQgZnJvbSAnLi9jYXJkJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCBmcm9tICcuL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IHsgUGxheWxpc3RUcmFja0RhdGEsIFNwb3RpZnlJbWcsIFRyYWNrRGF0YSB9IGZyb20gJy4uL3R5cGVzJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5jbGFzcyBQbGF5bGlzdCBleHRlbmRzIENhcmQge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBpZDogc3RyaW5nO1xyXG4gIHVuZG9TdGFjazogQXJyYXk8QXJyYXk8VHJhY2s+PjtcclxuICBvcmRlcjogc3RyaW5nO1xyXG4gIHRyYWNrTGlzdDogdW5kZWZpbmVkIHwgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz47XHJcbiAgaW1hZ2VVcmw6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPiwgaWQ6IHN0cmluZykge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5pZCA9IGlkXHJcbiAgICB0aGlzLnVuZG9TdGFjayA9IFtdXHJcbiAgICB0aGlzLm9yZGVyID0gJ2N1c3RvbS1vcmRlcicgLy8gc2V0IGl0IGFzIHRoZSBpbml0aWFsIG9yZGVyXHJcbiAgICB0aGlzLnRyYWNrTGlzdCA9IHVuZGVmaW5lZFxyXG5cclxuICAgIC8vIHRoZSBpZCBvZiB0aGUgcGxheWxpc3QgY2FyZCBlbGVtZW50XHJcbiAgICB0aGlzLmltYWdlVXJsID0gZ2V0VmFsaWRJbWFnZShpbWFnZXMpXHJcbiAgfVxyXG5cclxuICBhZGRUb1VuZG9TdGFjayAodHJhY2tzOiBBcnJheTxUcmFjaz4pIHtcclxuICAgIHRoaXMudW5kb1N0YWNrLnB1c2godHJhY2tzKVxyXG4gIH1cclxuXHJcbiAgLyoqIFByb2R1Y2VzIHRoZSBjYXJkIGVsZW1lbnQgb2YgdGhpcyBwbGF5bGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBUaGUgY2FyZCBpbmRleCB0byB1c2UgZm9yIHRoZSBlbGVtZW50cyBpZCBzdWZmaXhcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIGdldFBsYXlsaXN0Q2FyZEh0bWwgKGlkeDogbnVtYmVyLCBpblRleHRGb3JtOiBib29sZWFuLCBpc1NlbGVjdGVkID0gZmFsc2UpOiBOb2RlIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMucGxheWxpc3RQcmVmaXh9JHtpZHh9YFxyXG5cclxuICAgIGNvbnN0IGV4cGFuZE9uSG92ZXIgPSBpblRleHRGb3JtID8gJycgOiBjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3ZlclxyXG5cclxuICAgIHRoaXMuY2FyZElkID0gaWRcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7ZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW59ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkXHJcbiAgICB9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0fSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH0gJHtcclxuICAgICAgaXNTZWxlY3RlZCA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICB9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCIgdGl0bGU9XCJDbGljayB0byBWaWV3IFRyYWNrc1wiPlxyXG4gICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlVXJsfVwiIGFsdD1cIlBsYXlsaXN0IENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcFxyXG4gICAgfVwiPiR7dGhpcy5uYW1lfTwvaDQ+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBQcm9kdWNlcyBsaXN0IG9mIFRyYWNrIGNsYXNzIGluc3RhbmNlcyB1c2luZyB0cmFjayBkYXRhcyBmcm9tIHNwb3RpZnkgd2ViIGFwaS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtEb3VibHlMaW5rZWRMaXN0PFRyYWNrPn0gLSBMaXN0IG9mIHRyYWNrIGNsYXNzZXMgY3JlYXRlZCB1c2luZyB0aGUgb2J0YWluZWQgdHJhY2sgZGF0YXMuXHJcbiAgICovXHJcbiAgYXN5bmMgbG9hZFRyYWNrcyAoKTogUHJvbWlzZTxEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IG51bGw+IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zLnJlcXVlc3Q8QXJyYXk8UGxheWxpc3RUcmFja0RhdGE+Pih7IG1ldGhvZDogJ2dldCcsIHVybDogYCR7Y29uZmlnLlVSTHMuZ2V0UGxheWxpc3RUcmFja3MgKyB0aGlzLmlkfWAgfSlcclxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKVxyXG4gICAgICB9KVxyXG5cclxuICAgIGlmICghcmVzKSB7XHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcbiAgICBjb25zdCB0cmFja0xpc3QgPSBuZXcgRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4oKVxyXG5cclxuICAgIC8vIG1hcCBlYWNoIHRyYWNrIGRhdGEgaW4gdGhlIHBsYXlsaXN0IGRhdGEgdG8gYW4gYXJyYXkuXHJcbiAgICBjb25zdCB0cmFja3NEYXRhID0gcmVzLmRhdGEubWFwKChkYXRhKSA9PiBkYXRhLnRyYWNrKSBhcyBBcnJheTxUcmFja0RhdGE+XHJcbiAgICBnZXRQbGF5bGlzdFRyYWNrc0Zyb21EYXRhcyh0cmFja3NEYXRhLCByZXMuZGF0YSwgdHJhY2tMaXN0KVxyXG5cclxuICAgIC8vIGRlZmluZSB0cmFjayBvYmplY3RzXHJcbiAgICB0aGlzLnRyYWNrTGlzdCA9IHRyYWNrTGlzdFxyXG4gICAgcmV0dXJuIHRyYWNrTGlzdFxyXG4gIH1cclxuXHJcbiAgaGFzTG9hZGVkVHJhY2tzICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRyYWNrTGlzdCAhPT0gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcblxyXG4vKiogR2V0cyBwbGF5bGlzdCB0cmFja3MgZnJvbSBkYXRhLiBUaGlzIGFsc28gaW5pdGlhbGl6ZXMgdGhlIGRhdGUgYWRkZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXk8VHJhY2tEYXRhPn0gdHJhY2tzRGF0YVxyXG4gKiBAcGFyYW0ge0FycmF5PFBsYXlsaXN0VHJhY2tEYXRhPn0gZGF0ZUFkZGVkT2JqZWN0cyAtIFRoZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgYWRkZWRfYXQgdmFyaWFibGUuXHJcbiAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz59IHRyYWNrc0xpc3RcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQbGF5bGlzdFRyYWNrc0Zyb21EYXRhcyAoXHJcbiAgdHJhY2tzRGF0YTogQXJyYXk8VHJhY2tEYXRhPixcclxuICBkYXRlQWRkZWRPYmplY3RzOiBBcnJheTxQbGF5bGlzdFRyYWNrRGF0YT4sXHJcbiAgdHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPlxyXG4pIHtcclxuICBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhKHRyYWNrc0RhdGEsIHRyYWNrTGlzdClcclxuXHJcbiAgbGV0IGkgPSAwXHJcbiAgLy8gc2V0IHRoZSBkYXRlcyBhZGRlZFxyXG4gIGZvciAoY29uc3QgdHJhY2tPdXQgb2YgdHJhY2tMaXN0LnZhbHVlcygpKSB7XHJcbiAgICBjb25zdCBkYXRlQWRkZWRPYmogPSBkYXRlQWRkZWRPYmplY3RzW2ldXHJcbiAgICBjb25zdCB0cmFjazogVHJhY2sgPSB0cmFja091dFxyXG5cclxuICAgIHRyYWNrLmRhdGVBZGRlZFRvUGxheWxpc3QgPSBkYXRlQWRkZWRPYmouYWRkZWRfYXRcclxuICAgIGkrK1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxheWxpc3RcclxuIiwiaW1wb3J0IHsgZ2V0VmFsaWRJbWFnZSB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHsgU3BvdGlmeUltZyB9IGZyb20gJy4uL3R5cGVzJ1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9maWxlIHtcclxuICBkaXNwbGF5TmFtZTogc3RyaW5nO1xyXG4gIGNvdW50cnk6IHN0cmluZztcclxuICBlbWFpbDogc3RyaW5nO1xyXG4gIHByb2ZpbGVJbWdVcmw6IHN0cmluZztcclxuICBmb2xsb3dlcnM6IHN0cmluZztcclxuICBleHRlcm5hbFVSTDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoZGlzcGxheU5hbWU6IHN0cmluZywgY291bnRyeTogc3RyaW5nLCBlbWFpbDogc3RyaW5nLCBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+LCBmb2xsb3dlcnM6IHN0cmluZywgZXh0ZXJuYWxVUkw6IHN0cmluZykge1xyXG4gICAgdGhpcy5kaXNwbGF5TmFtZSA9IGRpc3BsYXlOYW1lXHJcbiAgICB0aGlzLmNvdW50cnkgPSBjb3VudHJ5XHJcbiAgICB0aGlzLmVtYWlsID0gZW1haWxcclxuICAgIHRoaXMucHJvZmlsZUltZ1VybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy5mb2xsb3dlcnMgPSBmb2xsb3dlcnNcclxuICAgIHRoaXMuZXh0ZXJuYWxVUkwgPSBleHRlcm5hbFVSTFxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgU3Vic2NyaXB0aW9uIGZyb20gJy4vc3Vic2NyaXB0aW9uJ1xyXG5cclxuLyoqIExldHMgc2F5IHlvdSBoYXZlIHR3byBkb29ycyB0aGF0IHdpbGwgb3BlbiB0aHJvdWdoIHRoZSBwdWIgc3ViIHN5c3RlbS4gV2hhdCB3aWxsIGhhcHBlbiBpcyB0aGF0IHdlIHdpbGwgc3Vic2NyaWJlIG9uZVxyXG4gKiBvbiBkb29yIG9wZW4gZXZlbnQuIFdlIHdpbGwgdGhlbiBoYXZlIHR3byBwdWJsaXNoZXJzIHRoYXQgd2lsbCBlYWNoIHByb3BhZ2F0ZSBhIGRpZmZlcmVudCBkb29yIHRocm91Z2ggdGhlIGFnZ3JlZ2F0b3IgYXQgZGlmZmVyZW50IHBvaW50cy5cclxuICogVGhlIGFnZ3JlZ2F0b3Igd2lsbCB0aGVuIGV4ZWN1dGUgdGhlIG9uIGRvb3Igb3BlbiBzdWJzY3JpYmVyIGFuZCBwYXNzIGluIHRoZSBkb29yIGdpdmVuIGJ5IGVpdGhlciBwdWJsaXNoZXIuXHJcbiAqL1xyXG5cclxuLyoqIE1hbmFnZXMgc3Vic2NyaWJpbmcgYW5kIHB1Ymxpc2hpbmcgb2YgZXZlbnRzLlxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqIEFuIGFyZ1R5cGUgaXMgb2J0YWluZWQgYnkgdGFraW5nIHRoZSAnQ2xhc3NJbnN0YW5jZScuY29udHJ1Y3Rvci5uYW1lIG9yICdDbGFzcycubmFtZS5cclxuICogU3Vic2NyaXB0aW9ucyBhcmUgZ3JvdXBlZCB0b2dldGhlciBieSBhcmdUeXBlIGFuZCB0aGVpciBldnQgdGFrZXMgYW4gYXJndW1lbnQgdGhhdCBpcyBhXHJcbiAqIGNsYXNzIHdpdGggdGhlIGNvbnN0cnVjdG9yLm5hbWUgb2YgYXJnVHlwZS5cclxuICpcclxuICovXHJcbmNsYXNzIEV2ZW50QWdncmVnYXRvciB7XHJcbiAgc3Vic2NyaWJlcnM6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8U3Vic2NyaXB0aW9uPiB9O1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIC8vIGtleSAtIHR5cGUsIHZhbHVlIC0gW10gb2YgZnVuY3Rpb25zIHRoYXQgdGFrZSBhIGNlcnRhaW4gdmFsdWUgZGVwZW5kaW5nIG9uIHRoZSB0eXBlXHJcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge31cclxuICB9XHJcblxyXG4gIC8qKiBTdWJzY3JpYmVzIGEgdHlwZSBvZiBldmVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhcmdUeXBlIC0gdGhlIHR5cGUgdGhhdCB0aGlzIHN1YnNjcmliZXIgYmVsb25ncyB0b28uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXZlbnQgLSB0aGUgZXZlbnQgdGhhdCB0YWtlcyB0aGUgc2FtZSBhcmdzIGFzIGFsbCBvdGhlciBldmVudHMgb2YgdGhlIGdpdmVuIHR5cGUuXHJcbiAgICovXHJcbiAgc3Vic2NyaWJlIChhcmdUeXBlOiBzdHJpbmcsIGV2dDogRnVuY3Rpb24pIHtcclxuICAgIGNvbnN0IHN1YnNjcmliZXIgPSBuZXcgU3Vic2NyaXB0aW9uKHRoaXMsIGV2dCwgYXJnVHlwZSlcclxuXHJcbiAgICBpZiAoYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbYXJnVHlwZV0ucHVzaChzdWJzY3JpYmVyKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXSA9IFtzdWJzY3JpYmVyXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFVuc3Vic2NyaWJlcyBhIGdpdmVuIHN1YnNjcmlwdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3Vic2NyaXB0aW9ufSBzdWJzY3JpcHRpb25cclxuICAgKi9cclxuICB1bnN1YnNjcmliZSAoc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24pIHtcclxuICAgIGlmIChzdWJzY3JpcHRpb24uYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIC8vIGZpbHRlciBvdXQgdGhlIHN1YnNjcmlwdGlvbiBnaXZlbiBmcm9tIHRoZSBzdWJzY3JpYmVycyBkaWN0aW9uYXJ5XHJcbiAgICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5zdWJzY3JpYmVyc1tzdWJzY3JpcHRpb24uYXJnVHlwZV0uZmlsdGVyKGZ1bmN0aW9uIChzdWIpIHtcclxuICAgICAgICByZXR1cm4gc3ViLmlkICE9PSBzdWJzY3JpcHRpb24uaWRcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbc3Vic2NyaXB0aW9uLmFyZ1R5cGVdID0gZmlsdGVyZWRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoZXMgYWxsIHN1YnNjcmliZXJzIHRoYXQgdGFrZSBhcmd1bWVudHMgb2YgYSBnaXZlbiB0eXBlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBhIGNsYXNzIHRoYXQgY29udGFpbnMgYXJndW1lbnRzIGZvciB0aGUgZXZlbnQuIE11c3QgYmUgYSBjbGFzcyBhcyBzdWJzY3JpYmVycyBhcmUgZ3JvdXBlZCBieSB0eXBlLlxyXG4gICAqL1xyXG4gIHB1Ymxpc2ggKGFyZ3M6IE9iamVjdCkge1xyXG4gICAgY29uc3QgYXJnVHlwZSA9IGFyZ3MuY29uc3RydWN0b3IubmFtZVxyXG5cclxuICAgIGlmIChhcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXS5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHtcclxuICAgICAgICBzdWJzY3JpcHRpb24uZXZ0KGFyZ3MpXHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdubyB0eXBlIGZvdW5kIGZvciBwdWJsaXNoaW5nJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNsZWFyU3Vic2NyaXB0aW9ucyAoKSB7XHJcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge31cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEV2ZW50QWdncmVnYXRvclxyXG4iLCJpbXBvcnQgeyBJUGxheWFibGUgfSBmcm9tICcuLi8uLi8uLi90eXBlcydcclxuaW1wb3J0IHsgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi8uLi9kb3VibHktbGlua2VkLWxpc3QnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5YWJsZUV2ZW50QXJnIHtcclxuICBjdXJyUGxheWFibGU6IElQbGF5YWJsZTtcclxuICBwbGF5YWJsZU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuXHJcbiAgLyoqIFRha2VzIGluIHRoZSBjdXJyZW50IHRyYWNrIHRvIHBsYXkgYXMgd2VsbCBhcyB0aGUgcHJldiB0cmFja3MgYW5kIG5leHQgdHJhY2tzIGZyb20gaXQuXHJcbiAgICogTm90ZSB0aGF0IGl0IGRvZXMgbm90IHRha2UgVHJhY2sgaW5zdGFuY2VzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJUGxheWFibGV9IGN1cnJUcmFjayAtIG9iamVjdCBjb250YWluaW5nIGVsZW1lbnQgdG8gc2VsZWN0LCB0cmFja191cmksIGFuZCB0cmFjayB0aXRsZS5cclxuICAgKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT59IHRyYWNrTm9kZSAtIG5vZGUgdGhhdCBhbGxvd3MgdXMgdG8gdHJhdmVyc2UgdG8gbmV4dCBhbmQgcHJldmlvdXMgdHJhY2sgZGF0YXMuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKGN1cnJUcmFjazogSVBsYXlhYmxlLCB0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICAgIHRoaXMuY3VyclBsYXlhYmxlID0gY3VyclRyYWNrXHJcbiAgICB0aGlzLnBsYXlhYmxlTm9kZSA9IHRyYWNrTm9kZVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vYWdncmVnYXRvcidcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1YnNjcmlwdGlvbiB7XHJcbiAgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3I7XHJcbiAgZXZ0OiBGdW5jdGlvbjtcclxuICBhcmdUeXBlOiBzdHJpbmc7XHJcbiAgaWQ6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yLCBldnQ6IEZ1bmN0aW9uLCBhcmdUeXBlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yID0gZXZlbnRBZ2dyZWdhdG9yXHJcbiAgICB0aGlzLmV2dCA9IGV2dFxyXG4gICAgdGhpcy5hcmdUeXBlID0gYXJnVHlwZVxyXG4gICAgdGhpcy5pZCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgaHRtbFRvRWwsXHJcbiAgZ2V0VmFsaWRJbWFnZVxyXG59IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyLFxyXG4gIGlzU2FtZVBsYXlpbmdVUklcclxufSBmcm9tICcuL3BsYXliYWNrLXNkaydcclxuaW1wb3J0IEFsYnVtIGZyb20gJy4vYWxidW0nXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IFBsYXlhYmxlRXZlbnRBcmcgZnJvbSAnLi9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MnXHJcbmltcG9ydCB7IFNwb3RpZnlJbWcsIEZlYXR1cmVzRGF0YSwgSUFydGlzdFRyYWNrRGF0YSwgSVBsYXlhYmxlLCBFeHRlcm5hbFVybHMsIFRyYWNrRGF0YSB9IGZyb20gJy4uL3R5cGVzJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCwgeyBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4uL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcbmltcG9ydCBFdmVudEFnZ3JlZ2F0b3IgZnJvbSAnLi9wdWJzdWIvYWdncmVnYXRvcidcclxuXHJcbmNvbnN0IGV2ZW50QWdncmVnYXRvciA9ICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgYXMgRXZlbnRBZ2dyZWdhdG9yXHJcblxyXG5jbGFzcyBUcmFjayBleHRlbmRzIENhcmQgaW1wbGVtZW50cyBJUGxheWFibGUge1xyXG4gIGlkeDogbnVtYmVyO1xyXG4gIHByaXZhdGUgZXh0ZXJuYWxVcmxzOiBFeHRlcm5hbFVybHM7XHJcbiAgcHJpdmF0ZSBfaWQ6IHN0cmluZztcclxuICBwcml2YXRlIF90aXRsZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgX2R1cmF0aW9uOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfdXJpOiBzdHJpbmc7XHJcbiAgcG9wdWxhcml0eTogc3RyaW5nO1xyXG4gIHByaXZhdGUgX2RhdGVBZGRlZFRvUGxheWxpc3Q6IERhdGU7XHJcbiAgcmVsZWFzZURhdGU6IERhdGU7XHJcbiAgYWxidW06IEFsYnVtO1xyXG4gIGZlYXR1cmVzOiBGZWF0dXJlc0RhdGEgfCB1bmRlZmluZWQ7XHJcbiAgaW1hZ2VVcmw6IHN0cmluZztcclxuICBzZWxFbDogRWxlbWVudDtcclxuICBhcnRpc3RzRGF0YXM6IEFycmF5PElBcnRpc3RUcmFja0RhdGE+XHJcblxyXG4gIHB1YmxpYyBnZXQgaWQgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5faWRcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdGl0bGUgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fdGl0bGVcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdXJpICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3VyaVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBkYXRlQWRkZWRUb1BsYXlsaXN0ICgpOiBEYXRlIHtcclxuICAgIHJldHVybiB0aGlzLl9kYXRlQWRkZWRUb1BsYXlsaXN0XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGRhdGVBZGRlZFRvUGxheWxpc3QgKHZhbDogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSkge1xyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKHZhbClcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChwcm9wczogeyB0aXRsZTogc3RyaW5nOyBpbWFnZXM6IEFycmF5PFNwb3RpZnlJbWc+OyBkdXJhdGlvbjogbnVtYmVyOyB1cmk6IHN0cmluZzsgcG9wdWxhcml0eTogc3RyaW5nOyByZWxlYXNlRGF0ZTogc3RyaW5nOyBpZDogc3RyaW5nOyBhbGJ1bTogQWxidW07IGV4dGVybmFsVXJsczogRXh0ZXJuYWxVcmxzOyBhcnRpc3RzOiBBcnJheTx1bmtub3duPjsgaWR4OiBudW1iZXIgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgY29uc3Qge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgaW1hZ2VzLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgICAgdXJpLFxyXG4gICAgICBwb3B1bGFyaXR5LFxyXG4gICAgICByZWxlYXNlRGF0ZSxcclxuICAgICAgaWQsXHJcbiAgICAgIGFsYnVtLFxyXG4gICAgICBleHRlcm5hbFVybHMsXHJcbiAgICAgIGFydGlzdHMsXHJcbiAgICAgIGlkeCA9IC0xXHJcbiAgICB9ID0gcHJvcHNcclxuXHJcbiAgICAvLyBUaGlzIHRyYWNrcyBpbmRleCBpbiBhbiBhcnJheSBpZiBpdCBpcyBjb250YWluZWQgaW4gb25lLiAodXNlZCB0byBmaW5kIHByZXZpb3VzIGFuZCBuZXh0IHRyYWNrcylcclxuICAgIHRoaXMuaWR4ID0gaWR4XHJcbiAgICB0aGlzLmV4dGVybmFsVXJscyA9IGV4dGVybmFsVXJsc1xyXG4gICAgdGhpcy5faWQgPSBpZFxyXG4gICAgdGhpcy5fdGl0bGUgPSB0aXRsZVxyXG4gICAgdGhpcy5hcnRpc3RzRGF0YXMgPSB0aGlzLmZpbHRlckRhdGFGcm9tQXJ0aXN0cyhhcnRpc3RzKVxyXG4gICAgdGhpcy5fZHVyYXRpb24gPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKGR1cmF0aW9uKVxyXG4gICAgdGhpcy5fZGF0ZUFkZGVkVG9QbGF5bGlzdCA9IG5ldyBEYXRlKClcclxuXHJcbiAgICAvLyBlaXRoZXIgdGhlIG5vcm1hbCB1cmksIG9yIHRoZSBsaW5rZWRfZnJvbS51cmlcclxuICAgIHRoaXMuX3VyaSA9IHVyaVxyXG4gICAgdGhpcy5wb3B1bGFyaXR5ID0gcG9wdWxhcml0eVxyXG4gICAgdGhpcy5yZWxlYXNlRGF0ZSA9IG5ldyBEYXRlKHJlbGVhc2VEYXRlKVxyXG4gICAgdGhpcy5hbGJ1bSA9IGFsYnVtXHJcbiAgICB0aGlzLmZlYXR1cmVzID0gdW5kZWZpbmVkXHJcblxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy5zZWxFbCA9IGh0bWxUb0VsKCc8PjwvPicpIGFzIEVsZW1lbnRcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmlsdGVyRGF0YUZyb21BcnRpc3RzIChhcnRpc3RzOiBBcnJheTx1bmtub3duPikge1xyXG4gICAgcmV0dXJuIGFydGlzdHMubWFwKChhcnRpc3QpID0+IGFydGlzdCBhcyBJQXJ0aXN0VHJhY2tEYXRhKVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdlbmVyYXRlSFRNTEFydGlzdE5hbWVzICgpIHtcclxuICAgIGxldCBhcnRpc3ROYW1lcyA9ICcnXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYXJ0aXN0c0RhdGFzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGFydGlzdCA9IHRoaXMuYXJ0aXN0c0RhdGFzW2ldXHJcbiAgICAgIGFydGlzdE5hbWVzICs9IGA8YSBocmVmPVwiJHthcnRpc3QuZXh0ZXJuYWxfdXJscy5zcG90aWZ5fVwiIHRhcmdldD1cIl9ibGFua1wiPiR7YXJ0aXN0Lm5hbWV9PC9hPmBcclxuXHJcbiAgICAgIGlmIChpIDwgdGhpcy5hcnRpc3RzRGF0YXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIGFydGlzdE5hbWVzICs9ICcsICdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFydGlzdE5hbWVzXHJcbiAgfVxyXG5cclxuICAvKiogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIHRyYWNrLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFRyYWNrQ2FyZEh0bWwgKGlkeDogbnVtYmVyLCB1bmFuaW1hdGVkQXBwZWFyID0gZmFsc2UpIDogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLnRyYWNrUHJlZml4fSR7aWR4fWBcclxuICAgIHRoaXMuY2FyZElkID0gaWRcclxuICAgIGNvbnN0IGFwcGVhckNsYXNzID0gdW5hbmltYXRlZEFwcGVhciA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIgOiAnJ1xyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnJhbmtDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUluXHJcbiAgICB9ICR7YXBwZWFyQ2xhc3N9XCI+XHJcbiAgICAgICAgICAgICAgPGg0IGlkPVwiJHtjb25maWcuQ1NTLklEcy5yYW5rfVwiPiR7aWR4ICsgMX0uPC9oND5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdFxyXG4gICAgfSAgJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRJbm5lclxyXG4gICAgfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja31cIiBpZD1cIiR7dGhpcy5nZXRDYXJkSWQoKX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkRnJvbnRcclxuICAgICAgICAgICAgICAgICAgfVwiICB0aXRsZT1cIkNsaWNrIHRvIHZpZXcgbW9yZSBJbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMuaW1hZ2VVcmx9XCIgYWx0PVwiQWxidW0gQ292ZXJcIj48L2ltZz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5EdXJhdGlvbjo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5fZHVyYXRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5SZWxlYXNlIERhdGU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMucmVsZWFzZURhdGUudG9EYXRlU3RyaW5nKCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5BbGJ1bSBOYW1lOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5hbGJ1bS5leHRlcm5hbFVybH1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPiR7XHJcbiAgICAgIHRoaXMuYWxidW0ubmFtZVxyXG4gICAgfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBHZXQgYSB0cmFjayBodG1sIHRvIGJlIHBsYWNlZCBhcyBhIGxpc3QgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZGlzcGxheURhdGUgLSB3aGV0aGVyIHRvIGRpc3BsYXkgdGhlIGRhdGUuXHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UGxheWxpc3RUcmFja0h0bWwgKHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxJUGxheWFibGU+LCBkaXNwbGF5RGF0ZTogYm9vbGVhbiA9IHRydWUpOiBOb2RlIHtcclxuICAgIC8vIGNhc3QgdHJhY2tzIGFzIGFuIElQbGF5YWJsZSBpbiBvcmRlciB0byByZWR1Y2UgZXJyb3JzIGR1ZSB0byBleGVzc2l2ZSBhY2Nlc3NhYmlsaXR5IGlmIGxvZ2dpbmcgaXQgd2lsbCBsb2cgYWxsIFRyYWNrIGF0dHJpYnV0ZXMuIEJ1dCBpbiBjb2RlIHdlIGNhbiBvbmx5IGFjY2VzcyBJUGxheWFibGUgYXR0cmlidXRlcy5cclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcyBhcyBJUGxheWFibGVcclxuICAgIGNvbnN0IHRyYWNrTm9kZSA9IHRyYWNrTGlzdC5nZXQodGhpcy5pZHgsIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuXHJcbiAgICBmdW5jdGlvbiBwbGF5UGF1c2VDbGljayAoKSB7XHJcbiAgICAgIC8vIHNlbGVjdCB0aGlzIHRyYWNrIHRvIHBsYXkgb3IgcGF1c2UgYnkgcHVibGlzaGluZyB0aGUgdHJhY2sgcGxheSBldmVudCBhcmdcclxuICAgICAgZXZlbnRBZ2dyZWdhdG9yLnB1Ymxpc2gobmV3IFBsYXlhYmxlRXZlbnRBcmcodHJhY2ssIHRyYWNrTm9kZSkpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RUcmFja31cIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicGxheS1wYXVzZSAke1xyXG4gICAgICAgICAgICAgICAgaXNTYW1lUGxheWluZ1VSSSh0aGlzLnVyaSkgPyBjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cIj48aW1nIHNyYz1cIlwiIGFsdD1cInBsYXkvcGF1c2VcIiBcclxuICAgICAgICAgICAgICBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0fVwiLz48L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCIgc3JjPVwiJHtcclxuICAgICAgdGhpcy5pbWFnZVVybFxyXG4gICAgfVwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5saW5rc31cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3RoaXMuZXh0ZXJuYWxVcmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5hbWVcclxuICAgIH1cIj4ke3RoaXMudGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8YS8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlxyXG4gICAgICAgICAgICAgICAgICAke3RoaXMuZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgICAgJHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlEYXRlXHJcbiAgICAgICAgICAgICAgICAgID8gYDxoNT4ke3RoaXMuZGF0ZUFkZGVkVG9QbGF5bGlzdC50b0xvY2FsZURhdGVTdHJpbmcoKX08L2g1PmBcclxuICAgICAgICAgICAgICAgICAgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbClcclxuXHJcbiAgICAvLyBnZXQgcGxheSBwYXVzZSBidXR0b25cclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ0biA9IGVsPy5jaGlsZE5vZGVzWzFdXHJcbiAgICBpZiAocGxheVBhdXNlQnRuID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxheSBwYXVzZSBidXR0b24gb24gdHJhY2sgd2FzIG5vdCBmb3VuZCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbEVsID0gcGxheVBhdXNlQnRuIGFzIEVsZW1lbnRcclxuICAgIHBsYXlQYXVzZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBwbGF5UGF1c2VDbGljaygpKVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBHZXQgYSB0cmFjayBodG1sIHRvIGJlIHBsYWNlZCBhcyBhIGxpc3QgZWxlbWVudCBvbiBhIHJhbmtlZCBsaXN0LlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmFua2VkVHJhY2tIdG1sIChyYW5rOiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0VHJhY2t9XCI+XHJcbiAgICAgICAgICAgICAgPHA+JHtyYW5rfS48L3A+XHJcbiAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0fVwiIHNyYz1cIiR7XHJcbiAgICAgIHRoaXMuaW1hZ2VVcmxcclxuICAgIH1cIj48L2ltZz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubGlua3N9XCI+XHJcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiIHRhcmdldD1cIl9ibGFua1wiPlxyXG4gICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lXHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfVxyXG4gICAgICAgICAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgICAgICAgPGEvPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj5cclxuICAgICAgICAgICAgICAgICAgJHt0aGlzLmdlbmVyYXRlSFRNTEFydGlzdE5hbWVzKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aDU+JHt0aGlzLl9kdXJhdGlvbn08L2g1PlxyXG4gICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICBgXHJcblxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIHRoZSBmZWF0dXJlcyBvZiB0aGlzIHRyYWNrIGZyb20gdGhlIHNwb3RpZnkgd2ViIGFwaS4gKi9cclxuICBwdWJsaWMgYXN5bmMgbG9hZEZlYXR1cmVzICgpIHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zXHJcbiAgICAgIC5nZXQoY29uZmlnLlVSTHMuZ2V0VHJhY2tGZWF0dXJlcyArIHRoaXMuaWQpXHJcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgZXJyXHJcbiAgICAgIH0pXHJcbiAgICBjb25zdCBmZWF0cyA9IHJlcy5kYXRhLmF1ZGlvX2ZlYXR1cmVzXHJcbiAgICB0aGlzLmZlYXR1cmVzID0ge1xyXG4gICAgICBkYW5jZWFiaWxpdHk6IGZlYXRzLmRhbmNlYWJpbGl0eSxcclxuICAgICAgYWNvdXN0aWNuZXNzOiBmZWF0cy5hY291c3RpY25lc3MsXHJcbiAgICAgIGluc3RydW1lbnRhbG5lc3M6IGZlYXRzLmluc3RydW1lbnRhbG5lc3MsXHJcbiAgICAgIHZhbGVuY2U6IGZlYXRzLnZhbGVuY2UsXHJcbiAgICAgIGVuZXJneTogZmVhdHMuZW5lcmd5XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNcclxuICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmF0ZSB0cmFja3MgZnJvbSBkYXRhIGV4Y2x1ZGluZyBkYXRlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFRyYWNrRGF0YT59IGRhdGFzXHJcbiAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBBcnJheTxUcmFjaz59IHRyYWNrcyAtIGRvdWJsZSBsaW5rZWQgbGlzdFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgKGRhdGFzOiBBcnJheTxUcmFja0RhdGE+LCB0cmFja3M6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgQXJyYXk8VHJhY2s+KSB7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgZGF0YSA9IGRhdGFzW2ldXHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICBjb25zdCBwcm9wcyA9IHtcclxuICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgIGltYWdlczogZGF0YS5hbGJ1bS5pbWFnZXMsXHJcbiAgICAgICAgZHVyYXRpb246IGRhdGEuZHVyYXRpb25fbXMsXHJcbiAgICAgICAgdXJpOiBkYXRhLmxpbmtlZF9mcm9tICE9PSB1bmRlZmluZWQgPyBkYXRhLmxpbmtlZF9mcm9tLnVyaSA6IGRhdGEudXJpLFxyXG4gICAgICAgIHBvcHVsYXJpdHk6IGRhdGEucG9wdWxhcml0eSxcclxuICAgICAgICByZWxlYXNlRGF0ZTogZGF0YS5hbGJ1bS5yZWxlYXNlX2RhdGUsXHJcbiAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgYWxidW06IG5ldyBBbGJ1bShkYXRhLmFsYnVtLm5hbWUsIGRhdGEuYWxidW0uZXh0ZXJuYWxfdXJscy5zcG90aWZ5KSxcclxuICAgICAgICBleHRlcm5hbFVybHM6IGRhdGEuZXh0ZXJuYWxfdXJscyxcclxuICAgICAgICBhcnRpc3RzOiBkYXRhLmFydGlzdHMsXHJcbiAgICAgICAgaWR4OiBpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodHJhY2tzKSkge1xyXG4gICAgICAgIHRyYWNrcy5wdXNoKG5ldyBUcmFjayhwcm9wcykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdHJhY2tzLmFkZChuZXcgVHJhY2socHJvcHMpKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cmFja3NcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJhY2tcclxuIiwiXHJcbmltcG9ydCBpbnRlcmFjdCBmcm9tICdpbnRlcmFjdGpzJ1xyXG5pbXBvcnQgSW50ZXJhY3QgZnJvbSAnQGludGVyYWN0anMvdHlwZXMnXHJcbmltcG9ydCB7IElQcm9taXNlSGFuZGxlclJldHVybiwgU3BvdGlmeUltZyB9IGZyb20gJy4vdHlwZXMnXHJcblxyXG5jb25zdCBhdXRoRW5kcG9pbnQgPSAnaHR0cHM6Ly9hY2NvdW50cy5zcG90aWZ5LmNvbS9hdXRob3JpemUnXHJcbi8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFwcCdzIGNsaWVudCBJRCwgcmVkaXJlY3QgVVJJIGFuZCBkZXNpcmVkIHNjb3Blc1xyXG5jb25zdCByZWRpcmVjdFVyaSA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXHJcbmNvbnN0IGNsaWVudElkID0gJzQzNGY1ZTlmNDQyYTRlNDU4NmUwODlhMzNmNjVjODU3J1xyXG5jb25zdCBzY29wZXMgPSBbXHJcbiAgJ3VnYy1pbWFnZS11cGxvYWQnLFxyXG4gICd1c2VyLXJlYWQtcGxheWJhY2stc3RhdGUnLFxyXG4gICd1c2VyLW1vZGlmeS1wbGF5YmFjay1zdGF0ZScsXHJcbiAgJ3VzZXItcmVhZC1jdXJyZW50bHktcGxheWluZycsXHJcbiAgJ3N0cmVhbWluZycsXHJcbiAgJ2FwcC1yZW1vdGUtY29udHJvbCcsXHJcbiAgJ3VzZXItcmVhZC1lbWFpbCcsXHJcbiAgJ3VzZXItcmVhZC1wcml2YXRlJyxcclxuICAncGxheWxpc3QtcmVhZC1jb2xsYWJvcmF0aXZlJyxcclxuICAncGxheWxpc3QtbW9kaWZ5LXB1YmxpYycsXHJcbiAgJ3BsYXlsaXN0LXJlYWQtcHJpdmF0ZScsXHJcbiAgJ3BsYXlsaXN0LW1vZGlmeS1wcml2YXRlJyxcclxuICAndXNlci1saWJyYXJ5LW1vZGlmeScsXHJcbiAgJ3VzZXItbGlicmFyeS1yZWFkJyxcclxuICAndXNlci10b3AtcmVhZCcsXHJcbiAgJ3VzZXItcmVhZC1wbGF5YmFjay1wb3NpdGlvbicsXHJcbiAgJ3VzZXItcmVhZC1yZWNlbnRseS1wbGF5ZWQnLFxyXG4gICd1c2VyLWZvbGxvdy1yZWFkJyxcclxuICAndXNlci1mb2xsb3ctbW9kaWZ5J1xyXG5dXHJcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XHJcbiAgQ1NTOiB7XHJcbiAgICBJRHM6IHtcclxuICAgICAgcmVtb3ZlRWFybHlBZGRlZDogJ3JlbW92ZS1lYXJseS1hZGRlZCcsXHJcbiAgICAgIGdldFRva2VuTG9hZGluZ1NwaW5uZXI6ICdnZXQtdG9rZW4tbG9hZGluZy1zcGlubmVyJyxcclxuICAgICAgcGxheWxpc3RDYXJkc0NvbnRhaW5lcjogJ3BsYXlsaXN0LWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIHRyYWNrQ2FyZHNDb250YWluZXI6ICd0cmFjay1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICBwbGF5bGlzdFByZWZpeDogJ3BsYXlsaXN0LScsXHJcbiAgICAgIHRyYWNrUHJlZml4OiAndHJhY2stJyxcclxuICAgICAgc3BvdGlmeUNvbnRhaW5lcjogJ3Nwb3RpZnktY29udGFpbmVyJyxcclxuICAgICAgaW5mb0NvbnRhaW5lcjogJ2luZm8tY29udGFpbmVyJyxcclxuICAgICAgYWxsb3dBY2Nlc3NIZWFkZXI6ICdhbGxvdy1hY2Nlc3MtaGVhZGVyJyxcclxuICAgICAgZXhwYW5kZWRQbGF5bGlzdE1vZHM6ICdleHBhbmRlZC1wbGF5bGlzdC1tb2RzJyxcclxuICAgICAgcGxheWxpc3RNb2RzOiAncGxheWxpc3QtbW9kcycsXHJcbiAgICAgIHRyYWNrc0RhdGE6ICd0cmFja3MtZGF0YScsXHJcbiAgICAgIHRyYWNrc0NoYXJ0OiAndHJhY2tzLWNoYXJ0JyxcclxuICAgICAgdHJhY2tzVGVybVNlbGVjdGlvbnM6ICd0cmFja3MtdGVybS1zZWxlY3Rpb25zJyxcclxuICAgICAgZmVhdHVyZVNlbGVjdGlvbnM6ICdmZWF0dXJlLXNlbGVjdGlvbnMnLFxyXG4gICAgICBwbGF5bGlzdHNTZWN0aW9uOiAncGxheWxpc3RzLXNlY3Rpb24nLFxyXG4gICAgICB1bmRvOiAndW5kbycsXHJcbiAgICAgIHJlZG86ICdyZWRvJyxcclxuICAgICAgbW9kc09wZW5lcjogJ21vZHMtb3BlbmVyJyxcclxuICAgICAgZmVhdERlZjogJ2ZlYXQtZGVmaW5pdGlvbicsXHJcbiAgICAgIGZlYXRBdmVyYWdlOiAnZmVhdC1hdmVyYWdlJyxcclxuICAgICAgcmFuazogJ3JhbmsnLFxyXG4gICAgICB2aWV3QWxsVG9wVHJhY2tzOiAndmlldy1hbGwtdG9wLXRyYWNrcycsXHJcbiAgICAgIGVtb2ppczogJ2Vtb2ppcycsXHJcbiAgICAgIGFydGlzdENhcmRzQ29udGFpbmVyOiAnYXJ0aXN0LWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIGFydGlzdFByZWZpeDogJ2FydGlzdC0nLFxyXG4gICAgICBpbml0aWFsQ2FyZDogJ2luaXRpYWwtY2FyZCcsXHJcbiAgICAgIGNvbnZlcnRDYXJkOiAnY29udmVydC1jYXJkJyxcclxuICAgICAgYXJ0aXN0VGVybVNlbGVjdGlvbnM6ICdhcnRpc3RzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIHByb2ZpbGVIZWFkZXI6ICdwcm9maWxlLWhlYWRlcicsXHJcbiAgICAgIGNsZWFyRGF0YTogJ2NsZWFyLWRhdGEnLFxyXG4gICAgICBsaWtlZFRyYWNrczogJ2xpa2VkLXRyYWNrcycsXHJcbiAgICAgIGZvbGxvd2VkQXJ0aXN0czogJ2ZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgICB3ZWJQbGF5ZXI6ICd3ZWItcGxheWVyJyxcclxuICAgICAgcGxheVRpbWVCYXI6ICdwbGF5dGltZS1iYXInLFxyXG4gICAgICBwbGF5bGlzdEhlYWRlckFyZWE6ICdwbGF5bGlzdC1tYWluLWhlYWRlci1hcmVhJ1xyXG4gICAgfSxcclxuICAgIENMQVNTRVM6IHtcclxuICAgICAgZ2xvdzogJ2dsb3cnLFxyXG4gICAgICBwbGF5bGlzdDogJ3BsYXlsaXN0JyxcclxuICAgICAgdHJhY2s6ICd0cmFjaycsXHJcbiAgICAgIGFydGlzdDogJ2FydGlzdCcsXHJcbiAgICAgIHJhbmtDYXJkOiAncmFuay1jYXJkJyxcclxuICAgICAgcGxheWxpc3RUcmFjazogJ3BsYXlsaXN0LXRyYWNrJyxcclxuICAgICAgaW5mb0xvYWRpbmdTcGlubmVyczogJ2luZm8tbG9hZGluZy1zcGlubmVyJyxcclxuICAgICAgYXBwZWFyOiAnYXBwZWFyJyxcclxuICAgICAgaGlkZTogJ2hpZGUnLFxyXG4gICAgICBzZWxlY3RlZDogJ3NlbGVjdGVkJyxcclxuICAgICAgY2FyZDogJ2NhcmQnLFxyXG4gICAgICBwbGF5bGlzdFNlYXJjaDogJ3BsYXlsaXN0LXNlYXJjaCcsXHJcbiAgICAgIGVsbGlwc2lzV3JhcDogJ2VsbGlwc2lzLXdyYXAnLFxyXG4gICAgICBuYW1lOiAnbmFtZScsXHJcbiAgICAgIHBsYXlsaXN0T3JkZXI6ICdwbGF5bGlzdC1vcmRlcicsXHJcbiAgICAgIGNoYXJ0SW5mbzogJ2NoYXJ0LWluZm8nLFxyXG4gICAgICBmbGlwQ2FyZElubmVyOiAnZmxpcC1jYXJkLWlubmVyJyxcclxuICAgICAgZmxpcENhcmRGcm9udDogJ2ZsaXAtY2FyZC1mcm9udCcsXHJcbiAgICAgIGZsaXBDYXJkQmFjazogJ2ZsaXAtY2FyZC1iYWNrJyxcclxuICAgICAgZmxpcENhcmQ6ICdmbGlwLWNhcmQnLFxyXG4gICAgICByZXNpemVDb250YWluZXI6ICdyZXNpemUtY29udGFpbmVyJyxcclxuICAgICAgc2Nyb2xsTGVmdDogJ3Njcm9sbC1sZWZ0JyxcclxuICAgICAgc2Nyb2xsaW5nVGV4dDogJ3Njcm9sbGluZy10ZXh0JyxcclxuICAgICAgbm9TZWxlY3Q6ICduby1zZWxlY3QnLFxyXG4gICAgICBkcm9wRG93bjogJ2Ryb3AtZG93bicsXHJcbiAgICAgIGV4cGFuZGFibGVUeHRDb250YWluZXI6ICdleHBhbmRhYmxlLXRleHQtY29udGFpbmVyJyxcclxuICAgICAgYm9yZGVyQ292ZXI6ICdib3JkZXItY292ZXInLFxyXG4gICAgICBmaXJzdEV4cGFuc2lvbjogJ2ZpcnN0LWV4cGFuc2lvbicsXHJcbiAgICAgIHNlY29uZEV4cGFuc2lvbjogJ3NlY29uZC1leHBhbnNpb24nLFxyXG4gICAgICBpbnZpc2libGU6ICdpbnZpc2libGUnLFxyXG4gICAgICBmYWRlSW46ICdmYWRlLWluJyxcclxuICAgICAgZnJvbVRvcDogJ2Zyb20tdG9wJyxcclxuICAgICAgZXhwYW5kT25Ib3ZlcjogJ2V4cGFuZC1vbi1ob3ZlcicsXHJcbiAgICAgIHRyYWNrc0FyZWE6ICd0cmFja3MtYXJlYScsXHJcbiAgICAgIHNjcm9sbEJhcjogJ3Njcm9sbC1iYXInLFxyXG4gICAgICB0cmFja0xpc3Q6ICd0cmFjay1saXN0JyxcclxuICAgICAgYXJ0aXN0VG9wVHJhY2tzOiAnYXJ0aXN0LXRvcC10cmFja3MnLFxyXG4gICAgICB0ZXh0Rm9ybTogJ3RleHQtZm9ybScsXHJcbiAgICAgIGNvbnRlbnQ6ICdjb250ZW50JyxcclxuICAgICAgbGlua3M6ICdsaW5rcycsXHJcbiAgICAgIHByb2dyZXNzOiAncHJvZ3Jlc3MnLFxyXG4gICAgICBwcm9ncmVzc0JhcjogJ3Byb2dyZXNzLWJhcidcclxuICAgIH0sXHJcbiAgICBBVFRSSUJVVEVTOiB7XHJcbiAgICAgIGRhdGFTZWxlY3Rpb246ICdkYXRhLXNlbGVjdGlvbidcclxuICAgIH1cclxuICB9LFxyXG4gIFVSTHM6IHtcclxuICAgIHNpdGVVcmw6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxyXG4gICAgYXV0aDogYCR7YXV0aEVuZHBvaW50fT9jbGllbnRfaWQ9JHtjbGllbnRJZH0mcmVkaXJlY3RfdXJpPSR7cmVkaXJlY3RVcml9JnNjb3BlPSR7c2NvcGVzLmpvaW4oXHJcbiAgICAgICclMjAnXHJcbiAgICApfSZyZXNwb25zZV90eXBlPWNvZGUmc2hvd19kaWFsb2c9dHJ1ZWAsXHJcbiAgICBnZXRIYXNUb2tlbnM6ICcvdG9rZW5zL2hhcy10b2tlbnMnLFxyXG4gICAgZ2V0QWNjZXNzVG9rZW46ICcvdG9rZW5zL2dldC1hY2Nlc3MtdG9rZW4nLFxyXG4gICAgZ2V0T2J0YWluVG9rZW5zUHJlZml4OiAoY29kZTogc3RyaW5nKSA9PiBgL3Rva2Vucy9vYnRhaW4tdG9rZW5zP2NvZGU9JHtjb2RlfWAsXHJcbiAgICBnZXRUb3BBcnRpc3RzOiAnL3Nwb3RpZnkvZ2V0LXRvcC1hcnRpc3RzP3RpbWVfcmFuZ2U9JyxcclxuICAgIGdldFRvcFRyYWNrczogJy9zcG90aWZ5L2dldC10b3AtdHJhY2tzP3RpbWVfcmFuZ2U9JyxcclxuICAgIGdldFBsYXlsaXN0czogJy9zcG90aWZ5L2dldC1wbGF5bGlzdHMnLFxyXG4gICAgZ2V0UGxheWxpc3RUcmFja3M6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3QtdHJhY2tzP3BsYXlsaXN0X2lkPScsXHJcbiAgICBwdXRDbGVhclRva2VuczogJy90b2tlbnMvY2xlYXItdG9rZW5zJyxcclxuICAgIGRlbGV0ZVBsYXlsaXN0VHJhY2tzOiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvZGVsZXRlLXBsYXlsaXN0LWl0ZW1zP3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgcG9zdFBsYXlsaXN0VHJhY2tzOiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1wbGF5bGlzdC1pdGVtcz9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIGdldFRyYWNrRmVhdHVyZXM6ICcvc3BvdGlmeS9nZXQtdHJhY2tzLWZlYXR1cmVzP3RyYWNrX2lkcz0nLFxyXG4gICAgcHV0UmVmcmVzaEFjY2Vzc1Rva2VuOiAnL3Rva2Vucy9yZWZyZXNoLXRva2VuJyxcclxuICAgIHB1dFNlc3Npb25EYXRhOiAnL3Nwb3RpZnkvcHV0LXNlc3Npb24tZGF0YT9hdHRyPScsXHJcbiAgICBwdXRQbGF5bGlzdFJlc2l6ZURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC9zcG90aWZ5L3B1dC1wbGF5bGlzdC1yZXNpemUtZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXlsaXN0UmVzaXplRGF0YTogJy9zcG90aWZ5L2dldC1wbGF5bGlzdC1yZXNpemUtZGF0YScsXHJcbiAgICBwdXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC9zcG90aWZ5L3B1dC1wbGF5bGlzdC10ZXh0LWZvcm0tZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXlsaXN0SXNJblRleHRGb3JtRGF0YTogJy9zcG90aWZ5L2dldC1wbGF5bGlzdC10ZXh0LWZvcm0tZGF0YScsXHJcbiAgICBnZXRBcnRpc3RUb3BUcmFja3M6IChpZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvZ2V0LWFydGlzdC10b3AtdHJhY2tzP2lkPSR7aWR9YCxcclxuICAgIGdldEN1cnJlbnRVc2VyUHJvZmlsZTogJy9zcG90aWZ5L2dldC1jdXJyZW50LXVzZXItcHJvZmlsZScsXHJcbiAgICBwdXRDbGVhclNlc3Npb246ICcvY2xlYXItc2Vzc2lvbicsXHJcbiAgICBnZXRDdXJyZW50VXNlclNhdmVkVHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LWN1cnJlbnQtdXNlci1zYXZlZC10cmFja3MnLFxyXG4gICAgZ2V0Rm9sbG93ZWRBcnRpc3RzOiAnL3Nwb3RpZnkvZ2V0LWZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgcHV0UGxheVRyYWNrOiAoZGV2aWNlX2lkOiBzdHJpbmcsIHRyYWNrX3VyaTogc3RyaW5nKSA9PlxyXG4gICAgICBgL3Nwb3RpZnkvcGxheS10cmFjaz9kZXZpY2VfaWQ9JHtkZXZpY2VfaWR9JnRyYWNrX3VyaT0ke3RyYWNrX3VyaX1gXHJcbiAgfSxcclxuICBQQVRIUzoge1xyXG4gICAgc3Bpbm5lcjogJy9pbWFnZXMvMjAwcHhMb2FkaW5nU3Bpbm5lci5zdmcnLFxyXG4gICAgYWNvdXN0aWNFbW9qaTogJy9pbWFnZXMvRW1vamlzL0Fjb3VzdGljRW1vamkuc3ZnJyxcclxuICAgIG5vbkFjb3VzdGljRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9FbGVjdHJpY0d1aXRhckVtb2ppLnN2ZycsXHJcbiAgICBoYXBweUVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvSGFwcHlFbW9qaS5zdmcnLFxyXG4gICAgbmV1dHJhbEVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvTmV1dHJhbEVtb2ppLnN2ZycsXHJcbiAgICBzYWRFbW9qaTogJy9pbWFnZXMvRW1vamlzL1NhZEVtb2ppLnN2ZycsXHJcbiAgICBpbnN0cnVtZW50RW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9JbnN0cnVtZW50RW1vamkuc3ZnJyxcclxuICAgIHNpbmdlckVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvU2luZ2VyRW1vamkuc3ZnJyxcclxuICAgIGRhbmNpbmdFbW9qaTogJy9pbWFnZXMvRW1vamlzL0RhbmNpbmdFbW9qaS5zdmcnLFxyXG4gICAgc2hlZXBFbW9qaTogJy9pbWFnZXMvRW1vamlzL1NoZWVwRW1vamkuc3ZnJyxcclxuICAgIHdvbGZFbW9qaTogJy9pbWFnZXMvRW1vamlzL1dvbGZFbW9qaS5zdmcnLFxyXG4gICAgZ3JpZFZpZXc6ICcvaW1hZ2VzL2dyaWQtdmlldy1pY29uLnBuZycsXHJcbiAgICBsaXN0VmlldzogJy9pbWFnZXMvbGlzdC12aWV3LWljb24ucG5nJyxcclxuICAgIGNoZXZyb25MZWZ0OiAnL2ltYWdlcy9jaGV2cm9uLWxlZnQucG5nJyxcclxuICAgIGNoZXZyb25SaWdodDogJy9pbWFnZXMvY2hldnJvbi1yaWdodC5wbmcnLFxyXG4gICAgcGxheUljb246ICcvaW1hZ2VzL3BsYXktMzBweC5wbmcnLFxyXG4gICAgcGF1c2VJY29uOiAnL2ltYWdlcy9wYXVzZS0zMHB4LnBuZydcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzIChtaWxsaXM6IG51bWJlcikge1xyXG4gIGNvbnN0IG1pbnV0ZXM6IG51bWJlciA9IE1hdGguZmxvb3IobWlsbGlzIC8gNjAwMDApXHJcbiAgY29uc3Qgc2Vjb25kczogbnVtYmVyID0gcGFyc2VJbnQoKChtaWxsaXMgJSA2MDAwMCkgLyAxMDAwKS50b0ZpeGVkKDApKVxyXG4gIHJldHVybiBzZWNvbmRzID09PSA2MFxyXG4gICAgPyBtaW51dGVzICsgMSArICc6MDAnXHJcbiAgICA6IG1pbnV0ZXMgKyAnOicgKyAoc2Vjb25kcyA8IDEwID8gJzAnIDogJycpICsgc2Vjb25kc1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBodG1sVG9FbCAoaHRtbDogc3RyaW5nKSB7XHJcbiAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJylcclxuICBodG1sID0gaHRtbC50cmltKCkgLy8gTmV2ZXIgcmV0dXJuIGEgc3BhY2UgdGV4dCBub2RlIGFzIGEgcmVzdWx0XHJcbiAgdGVtcC5pbm5lckhUTUwgPSBodG1sXHJcbiAgcmV0dXJuIHRlbXAuY29udGVudC5maXJzdENoaWxkXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9taXNlSGFuZGxlcjxUPiAoXHJcbiAgcHJvbWlzZTogUHJvbWlzZTxUPixcclxuICBvblN1Y2Nlc2Z1bCA9IChyZXM6IFQpID0+IHsgfSxcclxuICBvbkZhaWx1cmUgPSAoZXJyOiB1bmtub3duKSA9PiB7XHJcbiAgICBpZiAoZXJyKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigpXHJcbiAgICB9XHJcbiAgfVxyXG4pIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgcHJvbWlzZVxyXG4gICAgb25TdWNjZXNmdWwocmVzIGFzIFQpXHJcbiAgICByZXR1cm4geyByZXM6IHJlcywgZXJyOiBudWxsIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgIG9uRmFpbHVyZShlcnIpXHJcbiAgICByZXR1cm4geyByZXM6IG51bGwsIGVycjogZXJyIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRmlsdGVycyAnbGknIGVsZW1lbnRzIHRvIGVpdGhlciBiZSBoaWRkZW4gb3Igbm90IGRlcGVuZGluZyBvbiBpZlxyXG4gKiB0aGV5IGNvbnRhaW4gc29tZSBnaXZlbiBpbnB1dCB0ZXh0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge0hUTUx9IHVsIC0gdW5vcmRlcmVkIGxpc3QgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSAnbGknIHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7SFRNTH0gaW5wdXQgLSBpbnB1dCBlbGVtZW50IHdob3NlIHZhbHVlIHdpbGwgYmUgdXNlZCB0byBmaWx0ZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ZERpc3BsYXkgLSB0aGUgc3RhbmRhcmQgZGlzcGxheSB0aGUgJ2xpJyBzaG91bGQgaGF2ZSB3aGVuIG5vdCAnbm9uZSdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hVbCAodWw6IEhUTUxVTGlzdEVsZW1lbnQsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50LCBzdGREaXNwbGF5OiBzdHJpbmcgPSAnZmxleCcpOiB2b2lkIHtcclxuICBjb25zdCBsaUVscyA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpXHJcbiAgY29uc3QgZmlsdGVyID0gaW5wdXQudmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpRWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBnZXQgdGhlIG5hbWUgY2hpbGQgZWwgaW4gdGhlIGxpIGVsXHJcbiAgICBjb25zdCBuYW1lID0gbGlFbHNbaV0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMubmFtZSlbMF1cclxuICAgIGNvbnN0IG5hbWVUeHQgPSBuYW1lLnRleHRDb250ZW50IHx8IG5hbWUuaW5uZXJIVE1MXHJcblxyXG4gICAgaWYgKG5hbWVUeHQgJiYgbmFtZVR4dC50b1VwcGVyQ2FzZSgpLmluZGV4T2YoZmlsdGVyKSA+IC0xKSB7XHJcbiAgICAgIC8vIHNob3cgbGkncyB3aG9zZSBuYW1lIGNvbnRhaW5zIHRoZSB0aGUgZW50ZXJlZCBzdHJpbmdcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9IHN0ZERpc3BsYXlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG90aGVyd2lzZSBoaWRlIGl0XHJcbiAgICAgIGxpRWxzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cclxuICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cclxuICpcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoICh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgbGV0IG1ldHJpY3M6IFRleHRNZXRyaWNzXHJcbiAgaWYgKGNvbnRleHQpIHtcclxuICAgIGNvbnRleHQuZm9udCA9IGZvbnRcclxuICAgIG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpXHJcbiAgICByZXR1cm4gbWV0cmljcy53aWR0aFxyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdObyBjb250ZXh0IG9uIGNyZWF0ZWQgY2FudmFzIHdhcyBmb3VuZCcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsbGlwc2lzQWN0aXZlIChlbDogSFRNTEVsZW1lbnQpIHtcclxuICByZXR1cm4gZWwub2Zmc2V0V2lkdGggPCBlbC5zY3JvbGxXaWR0aFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyIChzdHJpbmc6IHN0cmluZykge1xyXG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbGlkSW1hZ2UgKGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGlkeCA9IDApIHtcclxuICAvLyBvYnRhaW4gdGhlIGNvcnJlY3QgaW1hZ2VcclxuICBpZiAoaW1hZ2VzLmxlbmd0aCA+IGlkeCkge1xyXG4gICAgY29uc3QgaW1nID0gaW1hZ2VzW2lkeF1cclxuICAgIHJldHVybiBpbWcudXJsXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUFsbENoaWxkTm9kZXMgKHBhcmVudDogTm9kZSkge1xyXG4gIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGFuaW1hdGlvbkNvbnRyb2wgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8qKiBBZGRzIGEgY2xhc3MgdG8gZWFjaCBlbGVtZW50IGNhdXNpbmcgYSB0cmFuc2l0aW9uIHRvIHRoZSBjaGFuZ2VkIGNzcyB2YWx1ZXMuXHJcbiAgICogVGhpcyBpcyBkb25lIG9uIHNldCBpbnRlcnZhbHMuXHJcbiAgICpcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBpbmNsdWRpbmcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzVG9UcmFuc2l0aW9uVG9vIC0gVGhlIGNsYXNzIHRoYXQgYWxsIHRoZSB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIHdpbGwgYWRkXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuaW1hdGlvbkludGVydmFsIC0gVGhlIGludGVydmFsIHRvIHdhaXQgYmV0d2VlbiBhbmltYXRpb24gb2YgZWxlbWVudHNcclxuICAgKi9cclxuICBmdW5jdGlvbiBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMgKFxyXG4gICAgZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZyxcclxuICAgIGNsYXNzVG9UcmFuc2l0aW9uVG9vOiBzdHJpbmcsXHJcbiAgICBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyXHJcbiAgKSB7XHJcbiAgICAvLyBhcnIgb2YgaHRtbCBzZWxlY3RvcnMgdGhhdCBwb2ludCB0byBlbGVtZW50cyB0byBhbmltYXRlXHJcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudHNUb0FuaW1hdGUuc3BsaXQoJywnKVxyXG5cclxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYXR0cilcclxuICAgICAgbGV0IGlkeCA9IDBcclxuICAgICAgLy8gaW4gaW50ZXJ2YWxzIHBsYXkgdGhlaXIgaW5pdGlhbCBhbmltYXRpb25zXHJcbiAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpZHggPT09IGVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaWR4XVxyXG4gICAgICAgIC8vIGFkZCB0aGUgY2xhc3MgdG8gdGhlIGVsZW1lbnRzIGNsYXNzZXMgaW4gb3JkZXIgdG8gcnVuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9UcmFuc2l0aW9uVG9vKVxyXG4gICAgICAgIGlkeCArPSAxXHJcbiAgICAgIH0sIGFuaW1hdGlvbkludGVydmFsKVxyXG4gICAgfSlcclxuICB9XHJcbiAgLyoqIEFuaW1hdGVzIGFsbCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYSBjZXJ0YWluIGNsYXNzIG9yIGlkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZWxlbWVudHNUb0FuaW1hdGUgLSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNsYXNzZXMgb3IgaWRzIG9mIGVsZW1lbnRzIHRvIGFuaW1hdGUgSU5DTFVESU5HIHByZWZpeCBjaGFyLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc1RvQWRkIC0gY2xhc3MgdG8gYWRkIEVYQ0xVRElORyB0aGUgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFuaW1hdGlvbkludGVydmFsIC0gdGhlIGludGVydmFsIHRvIGFuaW1hdGUgdGhlIGdpdmVuIGVsZW1lbnRzIGluIG1pbGxpc2Vjb25kcy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBhbmltYXRlQXR0cmlidXRlcyAoZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZywgY2xhc3NUb0FkZDogc3RyaW5nLCBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyKSB7XHJcbiAgICBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMoXHJcbiAgICAgIGVsZW1lbnRzVG9BbmltYXRlLFxyXG4gICAgICBjbGFzc1RvQWRkLFxyXG4gICAgICBhbmltYXRpb25JbnRlcnZhbFxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgYW5pbWF0ZUF0dHJpYnV0ZXNcclxuICB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQaXhlbFBvc0luRWxPbkNsaWNrIChtb3VzZUV2dDogTW91c2VFdmVudCk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XHJcbiAgY29uc3QgcmVjdCA9IChtb3VzZUV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgY29uc3QgeCA9IG1vdXNlRXZ0LmNsaWVudFggLSByZWN0LmxlZnQgLy8geCBwb3NpdGlvbiB3aXRoaW4gdGhlIGVsZW1lbnQuXHJcbiAgY29uc3QgeSA9IG1vdXNlRXZ0LmNsaWVudFkgLSByZWN0LnRvcCAvLyB5IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICByZXR1cm4geyB4LCB5IH1cclxufVxyXG5mdW5jdGlvbiBkcmFnTW92ZUxpc3RlbmVyIChldnQ6IEludGVyYWN0LkludGVyYWN0RXZlbnQpIHtcclxuICBjb25zdCB0YXJnZXQgPSBldnQudGFyZ2V0XHJcbiAgLy8ga2VlcCB0aGUgZHJhZ2dlZCBwb3NpdGlvbiBpbiB0aGUgZGF0YS14L2RhdGEteSBhdHRyaWJ1dGVzXHJcbiAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnRlcmFjdGpzIEV2ZW50IGRvZXMgbm90IGNvbnRhaW4gdGFyZ2V0JylcclxuICB9XHJcbiAgbGV0IHggPSAwXHJcbiAgbGV0IHkgPSAwXHJcblxyXG4gIGNvbnN0IGRhdGFYID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JylcclxuICBjb25zdCBkYXRhWSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpXHJcblxyXG4gIGlmICh0eXBlb2YgZGF0YVggPT09ICdzdHJpbmcnICYmIHR5cGVvZiBkYXRhWSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHggPSBwYXJzZUZsb2F0KGRhdGFYKSArIGV2dC5keFxyXG4gICAgeSA9IHBhcnNlRmxvYXQoZGF0YVkpICsgZXZ0LmR5XHJcbiAgfSBlbHNlIHtcclxuICAgIHggKz0gZXZ0LmR4XHJcbiAgICB5ICs9IGV2dC5keVxyXG4gIH1cclxuXHJcbiAgLy8gdHJhbnNsYXRlIHRoZSBlbGVtZW50XHJcbiAgdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHggKyAncHgsICcgKyB5ICsgJ3B4KSdcclxuXHJcbiAgLy8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcclxuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4LnRvU3RyaW5nKCkpXHJcbiAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeS50b1N0cmluZygpKVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRSZXNpemVEcmFnICgpIHtcclxuICBpbnRlcmFjdCgnLnJlc2l6ZS1kcmFnJylcclxuICAgIC5yZXNpemFibGUoe1xyXG4gICAgICAvLyByZXNpemUgZnJvbSBhbGwgZWRnZXMgYW5kIGNvcm5lcnNcclxuICAgICAgZWRnZXM6IHsgbGVmdDogdHJ1ZSwgcmlnaHQ6IHRydWUsIGJvdHRvbTogdHJ1ZSwgdG9wOiB0cnVlIH0sXHJcblxyXG4gICAgICBsaXN0ZW5lcnM6IHtcclxuICAgICAgICBtb3ZlIChldnQpIHtcclxuICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2dC50YXJnZXRcclxuICAgICAgICAgIGxldCB4ID0gcGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMFxyXG4gICAgICAgICAgbGV0IHkgPSBwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwXHJcblxyXG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVcclxuICAgICAgICAgIHRhcmdldC5zdHlsZS53aWR0aCA9IGV2dC5yZWN0LndpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgdGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2dC5yZWN0LmhlaWdodCArICdweCdcclxuXHJcbiAgICAgICAgICAvLyB0cmFuc2xhdGUgd2hlbiByZXNpemluZyBmcm9tIHRvcCBvciBsZWZ0IGVkZ2VzXHJcbiAgICAgICAgICB4ICs9IGV2dC5kZWx0YVJlY3QubGVmdFxyXG4gICAgICAgICAgeSArPSBldnQuZGVsdGFSZWN0LnRvcFxyXG5cclxuICAgICAgICAgIHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCcgKyB5ICsgJ3B4KSdcclxuXHJcbiAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KVxyXG4gICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vZGlmaWVyczogW1xyXG4gICAgICAgIC8vIGtlZXAgdGhlIGVkZ2VzIGluc2lkZSB0aGUgcGFyZW50XHJcbiAgICAgICAgaW50ZXJhY3QubW9kaWZpZXJzLnJlc3RyaWN0RWRnZXMoe1xyXG4gICAgICAgICAgb3V0ZXI6ICdwYXJlbnQnXHJcbiAgICAgICAgfSksXHJcblxyXG4gICAgICAgIC8vIG1pbmltdW0gc2l6ZVxyXG4gICAgICAgIGludGVyYWN0Lm1vZGlmaWVycy5yZXN0cmljdFNpemUoe1xyXG4gICAgICAgICAgbWluOiB7IHdpZHRoOiAxMDAsIGhlaWdodDogNTAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgIF0sXHJcblxyXG4gICAgICBpbmVydGlhOiBmYWxzZVxyXG4gICAgfSlcclxuICAgIC5kcmFnZ2FibGUoe1xyXG4gICAgICBsaXN0ZW5lcnM6IHsgbW92ZTogZHJhZ01vdmVMaXN0ZW5lciB9LFxyXG4gICAgICBpbmVydGlhOiB0cnVlLFxyXG4gICAgICBtb2RpZmllcnM6IFtcclxuICAgICAgICBpbnRlcmFjdC5tb2RpZmllcnMucmVzdHJpY3RSZWN0KHtcclxuICAgICAgICAgIHJlc3RyaWN0aW9uOiAncGFyZW50JyxcclxuICAgICAgICAgIGVuZE9ubHk6IGZhbHNlXHJcbiAgICAgICAgfSlcclxuICAgICAgXVxyXG4gICAgfSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXhwcmVzc2lvbiAoZXJyb3JNZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSlcclxufVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyIH0gZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuXHJcbmNvbnN0IEhBTEZfSE9VUiA9IDEuOGU2IC8qIDMwIG1pbiBpbiBtcyAqL1xyXG5cclxudHlwZSBIYXNUb2tlblJlcyA9IHtcclxuICBkYXRhOiBib29sZWFuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVG9rZW5SZXMgKHJlczogYW55KTogcmVzIGlzIEhhc1Rva2VuUmVzIHtcclxuICByZXR1cm4gdHlwZW9mIHJlcy5kYXRhID09PSAnYm9vbGVhbidcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrSWZIYXNUb2tlbnMgKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIC8vIGlmIHRoZSB1c2VyIHN0YXlzIG9uIHRoZSBzYW1lIHBhZ2UgZm9yIDMwIG1pbiByZWZyZXNoIHRoZSB0b2tlbi5cclxuICBjb25zdCBzdGFydFJlZnJlc2hJbnRlcnZhbCA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdzdGFydCBpbnRlcnZhbCByZWZyZXNoJylcclxuICAgIHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFJlZnJlc2hBY2Nlc3NUb2tlbikpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdyZWZyZXNoIGFzeW5jJylcclxuICAgIH0sIEhBTEZfSE9VUilcclxuICB9XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBhd2FpdCBwcm9taXNlIHJlc29sdmUgdGhhdCByZXR1cm5zIHdoZXRoZXIgdGhlIHNlc3Npb24gaGFzIHRva2Vucy5cclxuICAvLyBiZWNhdXNlIHRva2VuIGlzIHN0b3JlZCBpbiBzZXNzaW9uIHdlIG5lZWQgdG8gcmVhc3NpZ24gJ2hhc1Rva2VuJyB0byB0aGUgY2xpZW50IHNvIHdlIGRvIG5vdCBuZWVkIHRvIHJ1biB0aGlzIG1ldGhvZCBhZ2FpbiBvbiByZWZyZXNoXHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0SGFzVG9rZW5zKSxcclxuICAgIChyZXMpID0+IHtcclxuICAgICAgaWYgKCFpc1Rva2VuUmVzKHJlcykpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGFzIHRva2VuIHJlc3BvbnNlJylcclxuICAgICAgfVxyXG5cclxuICAgICAgaGFzVG9rZW4gPSByZXMuZGF0YVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAgaWYgKGhhc1Rva2VuKSB7XHJcbiAgICBzdGFydFJlZnJlc2hJbnRlcnZhbCgpXHJcbiAgfVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbnMgKG9uTm9Ub2tlbjogKCkgPT4gdm9pZCkge1xyXG4gIGxldCBoYXNUb2tlbiA9IGZhbHNlXHJcbiAgLy8gY3JlYXRlIGEgcGFyYW1ldGVyIHNlYXJjaGVyIGluIHRoZSBVUkwgYWZ0ZXIgJz8nIHdoaWNoIGhvbGRzIHRoZSByZXF1ZXN0cyBib2R5IHBhcmFtZXRlcnNcclxuICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpXHJcblxyXG4gIC8vIEdldCB0aGUgY29kZSBmcm9tIHRoZSBwYXJhbWV0ZXIgY2FsbGVkICdjb2RlJyBpbiB0aGUgdXJsIHdoaWNoXHJcbiAgLy8gaG9wZWZ1bGx5IGNhbWUgYmFjayBmcm9tIHRoZSBzcG90aWZ5IEdFVCByZXF1ZXN0IG90aGVyd2lzZSBpdCBpcyBudWxsXHJcbiAgbGV0IGF1dGhDb2RlID0gdXJsUGFyYW1zLmdldCgnY29kZScpXHJcblxyXG4gIGlmIChhdXRoQ29kZSkge1xyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRPYnRhaW5Ub2tlbnNQcmVmaXgoYXV0aENvZGUpKSwgLy8gbm8gbmVlZCB0byBzcGVjaWZ5IHR5cGUgYXMgbm8gdHlwZSB2YWx1ZSBpcyB1c2VkLlxyXG5cclxuICAgICAgLy8gaWYgdGhlIHJlcXVlc3Qgd2FzIHN1Y2Nlc2Z1bCB3ZSBoYXZlIHJlY2lldmVkIGEgdG9rZW5cclxuICAgICAgKCkgPT4gKGhhc1Rva2VuID0gdHJ1ZSlcclxuICAgIClcclxuICAgIGF1dGhDb2RlID0gJydcclxuICB9IGVsc2Uge1xyXG4gICAgb25Ob1Rva2VuKClcclxuICB9XHJcblxyXG4gIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCAnJywgJy8nKVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG4vKiogR2VuZXJhdGUgYSBsb2dpbi9jaGFuZ2UgYWNjb3VudCBsaW5rLiBEZWZhdWx0cyB0byBhcHBlbmRpbmcgaXQgb250byB0aGUgbmF2IGJhci5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSBjbGFzc2VzVG9BZGQgLSB0aGUgY2xhc3NlcyB0byBhZGQgb250byB0aGUgbGluay5cclxuICogQHBhcmFtIHtCb29sZWFufSBjaGFuZ2VBY2NvdW50IC0gV2hldGhlciB0aGUgbGluayBzaG91bGQgYmUgZm9yIGNoYW5naW5nIGFjY291bnQsIG9yIGZvciBsb2dnaW5nIGluLiAoZGVmYXVsdHMgdG8gdHJ1ZSlcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50RWwgLSB0aGUgcGFyZW50IGVsZW1lbnQgdG8gYXBwZW5kIHRoZSBsaW5rIG9udG8uIChkZWZhdWx0cyB0byBuYXZiYXIpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVMb2dpbiAoe1xyXG4gIGNsYXNzZXNUb0FkZCA9IFsncmlnaHQnXSxcclxuICBjaGFuZ2VBY2NvdW50ID0gdHJ1ZSxcclxuICBwYXJlbnRFbCA9IGRvY3VtZW50XHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndG9wbmF2JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyaWdodCcpWzBdXHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZHJvcGRvd24tY29udGVudCcpWzBdXHJcbn0gPSB7fSkge1xyXG4gIC8vIENyZWF0ZSBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXHJcbiAgYS5ocmVmID0gY29uZmlnLlVSTHMuYXV0aFxyXG5cclxuICAvLyBDcmVhdGUgdGhlIHRleHQgbm9kZSBmb3IgYW5jaG9yIGVsZW1lbnQuXHJcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgY2hhbmdlQWNjb3VudCA/ICdDaGFuZ2UgQWNjb3VudCcgOiAnTG9naW4gVG8gU3BvdGlmeSdcclxuICApXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgdGV4dCBub2RlIHRvIGFuY2hvciBlbGVtZW50LlxyXG4gIGEuYXBwZW5kQ2hpbGQobGluaylcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXNUb0FkZC5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2xhc3NUb0FkZCA9IGNsYXNzZXNUb0FkZFtpXVxyXG4gICAgYS5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQpXHJcbiAgfVxyXG5cclxuICAvLyBjbGVhciBjdXJyZW50IHRva2VucyB3aGVuIGNsaWNrZWRcclxuICBhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dENsZWFyVG9rZW5zKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpXHJcbiAgfSlcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSBhbmNob3IgZWxlbWVudCB0byB0aGUgcGFyZW50LlxyXG4gIHBhcmVudEVsLmFwcGVuZENoaWxkKGEpXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbCAoXHJcbiAgaGFzVG9rZW46IGJvb2xlYW4sXHJcbiAgaGFzVG9rZW5DYWxsYmFjayA9ICgpID0+IHsgfSxcclxuICBub1Rva2VuQ2FsbEJhY2sgPSAoKSA9PiB7IH1cclxuKSB7XHJcbiAgY29uc3QgZ2V0VG9rZW5zU3Bpbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gICAgY29uZmlnLkNTUy5JRHMuZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lclxyXG4gIClcclxuXHJcbiAgLy8gcmVtb3ZlIHRva2VuIHNwaW5uZXIgYmVjYXVzZSBieSB0aGlzIGxpbmUgd2UgaGF2ZSBvYnRhaW5lZCB0aGUgdG9rZW5cclxuICBnZXRUb2tlbnNTcGlubmVyPy5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChnZXRUb2tlbnNTcGlubmVyKVxyXG5cclxuICBjb25zdCBpbmZvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuaW5mb0NvbnRhaW5lcilcclxuICBpZiAoaGFzVG9rZW4pIHtcclxuICAgIC8vIGdlbmVyYXRlIHRoZSBuYXYgbG9naW5cclxuICAgIGdlbmVyYXRlTG9naW4oKVxyXG4gICAgaWYgKGluZm9Db250YWluZXIgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZm8gY29udGFpbmVyIEVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgfVxyXG4gICAgaW5mb0NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gICAgaGFzVG9rZW5DYWxsYmFjaygpXHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIHRva2VuIHJlZGlyZWN0IHRvIGFsbG93IGFjY2VzcyBwYWdlXHJcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGNvbmZpZy5VUkxzLnNpdGVVcmxcclxuICAgIG5vVG9rZW5DYWxsQmFjaygpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IHByb21pc2VIYW5kbGVyLCBjb25maWcsIHRocm93RXhwcmVzc2lvbiB9IGZyb20gJy4uLy4uL2NvbmZpZydcclxuaW1wb3J0IFByb2ZpbGUgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9wcm9maWxlJ1xyXG5pbXBvcnQgeyBnZXRQbGF5bGlzdFRyYWNrc0Zyb21EYXRhcyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvcGxheWxpc3QnXHJcbmltcG9ydCB7XHJcbiAgY2hlY2tJZkhhc1Rva2VucyxcclxuICBvblN1Y2Nlc3NmdWxUb2tlbkNhbGwsXHJcbiAgZ2VuZXJhdGVMb2dpblxyXG59IGZyb20gJy4uLy4uL21hbmFnZS10b2tlbnMnXHJcbmltcG9ydCBBcnRpc3QsIHsgZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2FydGlzdCdcclxuaW1wb3J0IENhcmRBY3Rpb25zSGFuZGxlciBmcm9tICcuLi8uLi9jYXJkLWFjdGlvbnMnXHJcbmltcG9ydCBEb3VibHlMaW5rZWRMaXN0IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgVHJhY2sgZnJvbSAnLi4vLi4vY29tcG9uZW50cy90cmFjaydcclxuaW1wb3J0IHsgUHJvZmlsZURhdGEsIFRyYWNrRGF0YSB9IGZyb20gJy4uLy4uL3R5cGVzJ1xyXG5cclxuZnVuY3Rpb24gZGlzcGxheVByb2ZpbGUgKHByb2ZpbGU6IFByb2ZpbGUpIHtcclxuICBjb25zdCBwcm9maWxlSGVhZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucHJvZmlsZUhlYWRlcikgPz8gdGhyb3dFeHByZXNzaW9uKCdwcm9maWxlIGhlYWRlciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICBjb25zdCBkaXNwbGF5TmFtZSA9IHByb2ZpbGVIZWFkZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2gxJylbMF0gPz8gdGhyb3dFeHByZXNzaW9uKCdkaXNwbGF5IG5hbWUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgY29uc3QgZm9sbG93ZXJDb3VudCA9IHByb2ZpbGVIZWFkZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2g0JylbMF0gPz8gdGhyb3dFeHByZXNzaW9uKCdmb2xsb3dlciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICBjb25zdCBwcm9maWxlSW1hZ2UgPSBwcm9maWxlSGVhZGVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKVswXSA/PyB0aHJvd0V4cHJlc3Npb24oJ3Byb2ZpbGUgaW1hZ2UgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gIGRpc3BsYXlOYW1lLnRleHRDb250ZW50ID0gcHJvZmlsZS5kaXNwbGF5TmFtZVxyXG4gIGZvbGxvd2VyQ291bnQudGV4dENvbnRlbnQgPSBwcm9maWxlLmZvbGxvd2VycyArICcgZm9sbG93ZXJzJ1xyXG4gIHByb2ZpbGVJbWFnZS5zcmMgPVxyXG4gICAgcHJvZmlsZS5wcm9maWxlSW1nVXJsID09PSAnJ1xyXG4gICAgICA/ICcvaW1hZ2VzL3Byb2ZpbGUtdXNlci5wbmcnXHJcbiAgICAgIDogcHJvZmlsZS5wcm9maWxlSW1nVXJsXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJldHJpZXZlUHJvZmlsZSAoKSB7XHJcbiAgZnVuY3Rpb24gb25TdWNjZXNmdWwgKHJlczogQXhpb3NSZXNwb25zZTxQcm9maWxlRGF0YT4pIHtcclxuICAgIGNvbnN0IGRhdGEgPSByZXMuZGF0YVxyXG4gICAgY29uc3QgcHJvZmlsZSA9IG5ldyBQcm9maWxlKFxyXG4gICAgICBkYXRhLmRpc3BsYXlfbmFtZSxcclxuICAgICAgZGF0YS5jb3VudHJ5LFxyXG4gICAgICBkYXRhLmVtYWlsLFxyXG4gICAgICBkYXRhLmltYWdlcyxcclxuICAgICAgZGF0YS5mb2xsb3dlcnMudG90YWwsXHJcbiAgICAgIGRhdGEuZXh0ZXJuYWxfdXJscy5zcG90aWZ5XHJcbiAgICApXHJcblxyXG4gICAgZGlzcGxheVByb2ZpbGUocHJvZmlsZSlcclxuICB9XHJcblxyXG4gIC8vIGdldCBwcm9maWxlIGRhdGEgZnJvbSBhcGlcclxuICBhd2FpdCBwcm9taXNlSGFuZGxlcjxBeGlvc1Jlc3BvbnNlPFByb2ZpbGVEYXRhPj4oYXhpb3MucmVxdWVzdDxQcm9maWxlRGF0YT4oeyBtZXRob2Q6ICdHRVQnLCB1cmw6IGNvbmZpZy5VUkxzLmdldEN1cnJlbnRVc2VyUHJvZmlsZSB9KSxcclxuICAgIG9uU3VjY2VzZnVsXHJcbiAgKVxyXG59XHJcblxyXG5jb25zdCBhZGRFdmVudExpc3RlbmVycyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgLyoqIEFkZHMgdGhlIGNsaWNrIGV2ZW50IGxpc3RlbmVyIHRoYXQgY2xlYXJzIHNlc3Npb24gZGF0YSBhbmQgcmV0dXJucyB1c2VyIGJhY2sgdG8gaG9tZSBwYWdlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYWRkQ2xlYXJEYXRhTGlzdGVuZXIgKCkge1xyXG4gICAgY29uc3QgY2xlYXJEYXRhRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5jbGVhckRhdGEpIGFzIEhUTUxMaW5rRWxlbWVudFxyXG4gICAgY2xlYXJEYXRhRWwuaHJlZiA9IGNvbmZpZy5VUkxzLnNpdGVVcmxcclxuXHJcbiAgICBmdW5jdGlvbiBvbkNsaWNrICgpIHtcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dENsZWFyU2Vzc2lvbilcclxuICAgIH1cclxuXHJcbiAgICBjbGVhckRhdGFFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spXHJcbiAgfVxyXG4gIHJldHVybiB7IGFkZENsZWFyRGF0YUxpc3RlbmVyIH1cclxufSkoKVxyXG5cclxuY29uc3Qgc2F2ZWRUcmFja3NBY3Rpb25zID0gKGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBnZXRTYXZlZFRyYWNrcyAoKSB7XHJcbiAgICBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0Q3VycmVudFVzZXJTYXZlZFRyYWNrcyksIChyZXMpID0+IHtcclxuICAgICAgLy8gaWYgd2UgcmV0cmlldmVkIHRoZSB0cmFja3Mgc3VjY2VzZnVsbHksIHRoZW4gZGlzcGxheSB0aGVtXHJcbiAgICAgIGNvbnN0IHRyYWNrTGlzdCA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPigpXHJcbiAgICAgIGNvbnN0IHRyYWNrc0RhdGEgPSByZXMuZGF0YS5pdGVtcy5tYXAoKGl0ZW06IHsgdHJhY2s6IFRyYWNrRGF0YSB9KSA9PiBpdGVtLnRyYWNrKVxyXG5cclxuICAgICAgZ2V0UGxheWxpc3RUcmFja3NGcm9tRGF0YXModHJhY2tzRGF0YSwgcmVzLmRhdGEuaXRlbXMsIHRyYWNrTGlzdClcclxuICAgICAgZGlzcGxheVNhdmVkVHJhY2tzKHRyYWNrTGlzdClcclxuICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGRpc3BsYXlTYXZlZFRyYWNrcyAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPikge1xyXG4gICAgY29uc3QgbGlrZWRUcmFja3NVbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmxpa2VkVHJhY2tzKSA/PyB0aHJvd0V4cHJlc3Npb24oYGxpa2VkIHRyYWNrcyB1bCBvZiBpZCAke2NvbmZpZy5DU1MuSURzLmxpa2VkVHJhY2tzfSBkb2VzIG5vdCBleGlzdGApXHJcbiAgICBmb3IgKGNvbnN0IHRyYWNrIG9mIHRyYWNrTGlzdC52YWx1ZXMoKSkge1xyXG4gICAgICBsaWtlZFRyYWNrc1VsLmFwcGVuZCh0cmFjay5nZXRQbGF5bGlzdFRyYWNrSHRtbCh0cmFja0xpc3QpKVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4geyBnZXRTYXZlZFRyYWNrcyB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGZvbGxvd2VkQXJ0aXN0QWN0aW9ucyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgY29uc3QgY2FyZEFjdGlvbnNIYW5kbGVyID0gbmV3IENhcmRBY3Rpb25zSGFuZGxlcig1MClcclxuXHJcbiAgZnVuY3Rpb24gZ2V0Rm9sbG93ZWRBcnRpc3RzICgpIHtcclxuICAgIHByb21pc2VIYW5kbGVyKGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRGb2xsb3dlZEFydGlzdHMpLCAocmVzKSA9PiB7XHJcbiAgICAgIC8vIGlmIHdlIHJldHJpZXZlZCB0aGUgYXJ0aXN0cyBzdWNjZXNmdWxseSwgdGhlbiBkaXNwbGF5IHRoZW1cclxuICAgICAgY29uc3QgYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuICAgICAgZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEocmVzLmRhdGEuYXJ0aXN0cy5pdGVtcywgYXJ0aXN0QXJyKVxyXG4gICAgICBkaXNwbGF5Rm9sbG93ZWRBcnRpc3RzKGFydGlzdEFycilcclxuICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGRpc3BsYXlGb2xsb3dlZEFydGlzdHMgKGZvbGxvd2VkQXJ0aXN0czogQXJyYXk8QXJ0aXN0Pikge1xyXG4gICAgY29uc3QgY2FyZEdyaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5mb2xsb3dlZEFydGlzdHMpID8/IHRocm93RXhwcmVzc2lvbihgQ2FyZCBncmlkIG9mIGlkICR7Y29uZmlnLkNTUy5JRHMuZm9sbG93ZWRBcnRpc3RzfSBkb2VzIG5vdCBleGlzdGApXHJcblxyXG4gICAgLy8gZGlzcGxheSB0aGUgY2FyZHNcclxuICAgIGxldCBpID0gMFxyXG4gICAgZm9sbG93ZWRBcnRpc3RzLmZvckVhY2goKGFydGlzdDogQXJ0aXN0KSA9PiB7XHJcbiAgICAgIGNhcmRHcmlkLmFwcGVuZChhcnRpc3QuZ2V0QXJ0aXN0Q2FyZEh0bWwoaSwgdHJ1ZSkpXHJcbiAgICAgIGkrK1xyXG4gICAgfSlcclxuXHJcbiAgICBjb25zdCBhcnRpc3RDYXJkcyA9IEFycmF5LmZyb20oXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdClcclxuICAgIClcclxuXHJcbiAgICAvLyBhZGQgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBjYXJkc1xyXG4gICAgY2FyZEFjdGlvbnNIYW5kbGVyLmFkZEFsbEV2ZW50TGlzdGVuZXJzKFxyXG4gICAgICBhcnRpc3RDYXJkcyxcclxuICAgICAgZm9sbG93ZWRBcnRpc3RzLFxyXG4gICAgICBudWxsLFxyXG4gICAgICB0cnVlLFxyXG4gICAgICBmYWxzZVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgZ2V0Rm9sbG93ZWRBcnRpc3RzIH1cclxufSkoKTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXIoY2hlY2tJZkhhc1Rva2VucygpLCAoaGFzVG9rZW4pID0+XHJcbiAgICBvblN1Y2Nlc3NmdWxUb2tlbkNhbGwoaGFzVG9rZW4sICgpID0+IHtcclxuICAgICAgLy8gZ2V0IHVzZXIgcHJvZmlsZVxyXG4gICAgICBwcm9taXNlSGFuZGxlcihcclxuICAgICAgICByZXRyaWV2ZVByb2ZpbGUoKSxcclxuICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICBnZW5lcmF0ZUxvZ2luKHtcclxuICAgICAgICAgICAgY2xhc3Nlc1RvQWRkOiBbJ2dsb3cnXSxcclxuICAgICAgICAgICAgcGFyZW50RWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NvdW50LWJ0bnMnKSBhcyBFbGVtZW50XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKCkgPT4gY29uc29sZS5sb2coJ1Byb2JsZW0gd2hlbiBnZXR0aW5nIGluZm9ybWF0aW9uJylcclxuICAgICAgKVxyXG5cclxuICAgICAgc2F2ZWRUcmFja3NBY3Rpb25zLmdldFNhdmVkVHJhY2tzKClcclxuICAgICAgZm9sbG93ZWRBcnRpc3RBY3Rpb25zLmdldEZvbGxvd2VkQXJ0aXN0cygpXHJcbiAgICB9KVxyXG4gIClcclxuXHJcbiAgT2JqZWN0LmVudHJpZXMoYWRkRXZlbnRMaXN0ZW5lcnMpLmZvckVhY2goKFssIGFkZEV2ZW50TGlzdGVuZXJdKSA9PiB7XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKClcclxuICB9KVxyXG59KSgpXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9wdWJsaWMvcGFnZXMvcHJvZmlsZS1wYWdlL3Byb2ZpbGUudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=